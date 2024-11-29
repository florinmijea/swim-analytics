import { Browser, Page } from 'puppeteer';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://lpin.ro';
const OUTPUT_FILE = path.join(__dirname, '../../data/swimmers.json');
const SAVE_INTERVAL = 10; // Save every 10 successful extractions
const DELAY = 1000; // Base delay in milliseconds

interface SwimmerResult {
  style: string;
  time: string;
  place: number;
}

interface Competition {
  name: string;
  date: {
    start: string;
    end: string;
  };
  results: SwimmerResult[];
}

interface Swimmer {
  id: number;
  name: string;
  gender: string;
  birthYear: number;
  club: string;
  lpinLicense: string;
  federationLicense: string;
  competitions: Competition[];
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function randomDelay() {
  const randomMs = Math.floor(Math.random() * 2000) + DELAY;
  console.log(`Waiting ${randomMs}ms before next request...`);
  await delay(randomMs);
}

async function extractSwimmerData(page: Page, id: number): Promise<Swimmer | null> {
  try {
    const url = `${BASE_URL}/sportivi/detalii/${id}`;
    console.log(`Fetching ${url}`);
    
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    await delay(DELAY);

    // Debug: Log HTML content
    const content = await page.content();
    console.log('Page HTML:', content);

    // Debug: Log all text content
    const textContent = await page.evaluate(() => document.body.textContent);
    console.log('Page text:', textContent);

    // Check if swimmer exists
    const noDataFound = await page.$('.alert-danger');
    if (noDataFound) {
      console.log(`No data found for swimmer ${id}`);
      return null;
    }

    // Extract basic info
    const basicInfo = await page.evaluate(() => {
      // Debug: Log all tables
      const tables = document.querySelectorAll('table');
      console.log('Found tables:', tables.length);
      
      const infoTable = document.querySelector('.table');
      if (!infoTable) {
        console.log('No .table element found');
        return null;
      }

      const rows = infoTable.querySelectorAll('tr');
      console.log('Found rows:', rows.length);
      
      const name = document.querySelector('h2')?.textContent;
      console.log('Found name:', name);
      
      if (!name) {
        console.log('No name found');
        return null;
      }

      const cleanName = name.replace('Detalii sportiv - ', '').trim();
      console.log('Cleaned name:', cleanName);
      
      const gender = rows[0]?.querySelector('td:nth-child(2)')?.textContent?.trim() || '';
      const birthYear = parseInt(rows[1]?.querySelector('td:nth-child(2)')?.textContent?.trim() || '0');
      const club = rows[2]?.querySelector('td:nth-child(2)')?.textContent?.trim() || '';
      const lpinLicense = rows[3]?.querySelector('td:nth-child(2)')?.textContent?.trim() || '';
      const federationLicense = rows[4]?.querySelector('td:nth-child(2)')?.textContent?.trim() || '';

      console.log('Found fields:', {
        gender,
        birthYear,
        club,
        lpinLicense,
        federationLicense
      });

      if (!cleanName || !gender || !club || !lpinLicense || !federationLicense) {
        console.log('Missing required fields');
        return null;
      }
      
      return {
        name: cleanName,
        gender,
        birthYear,
        club,
        lpinLicense,
        federationLicense
      };
    });

    if (!basicInfo || !basicInfo.name) {
      console.log(`Failed to extract basic info for swimmer ${id}`);
      return null;
    }

    // Extract competitions
    const competitions = await page.evaluate(() => {
      console.log('Starting competition extraction...');
      const comps: Competition[] = [];
      const panels = document.querySelectorAll('.panel.panel-default');
      console.log('Number of competition panels found:', panels.length);
      
      panels.forEach((comp, index) => {
        const header = comp.querySelector('.panel-heading');
        const name = header?.querySelector('h4')?.textContent?.trim();
        const dateText = header?.querySelector('h5')?.textContent?.trim();
        
        console.log(`Processing competition ${index + 1}:`, { name, dateText });
        
        if (name && dateText) {
          const [start, end] = dateText.split('-').map(d => d.trim());
          
          const results: SwimmerResult[] = [];
          comp.querySelectorAll('.panel-body p').forEach(result => {
            const text = result.textContent?.trim() || '';
            const [stylePart, timePart, placePart] = text.split(/Timp realizat:|Locul obtinut:/).map(p => p?.trim());
            
            if (stylePart && timePart && placePart) {
              results.push({
                style: stylePart,
                time: timePart,
                place: parseInt(placePart)
              });
            }
          });

          comps.push({
            name,
            date: {
              start,
              end: end || start
            },
            results
          });
        }
      });
      
      console.log('Total competitions extracted:', comps.length);
      return comps;
    });

    const swimmer = {
      id,
      ...basicInfo,
      competitions
    };
    
    console.log('Successfully extracted swimmer:', swimmer);
    return swimmer;
    
  } catch (error) {
    console.error(`Error processing swimmer ${id}:`, error);
    return null;
  }
}

async function main() {
  console.log('Starting swimmer data extraction...');
  let browser: Browser | null = null;
  
  try {
    console.log('Launching browser...');
    browser = await puppeteer.launch({
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--window-size=1920x1080'
      ]
    });
    console.log('Browser launched successfully');

    console.log('Creating new page...');
    const page = await browser.newPage();
    console.log('Page created');

    console.log('Setting up page configuration...');
    await page.setViewport({ width: 1920, height: 1080 });
    console.log('Page configuration complete');

    const swimmers: Swimmer[] = [];
    let consecutiveFailures = 0;
    const MAX_CONSECUTIVE_FAILURES = 50;

    // Load existing data if available
    if (fs.existsSync(OUTPUT_FILE)) {
      console.log('Loading existing data...');
      const existingData = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
      swimmers.push(...existingData);
      console.log(`Loaded ${existingData.length} existing swimmers`);
    }

    // Create output directory if it doesn't exist
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Start from the last processed ID + 1 or 1 if no data exists
    const startId = swimmers.length > 0 ? Math.max(...swimmers.map(s => s.id)) + 1 : 1;
    console.log(`Starting from ID ${startId}`);

    for (let id = startId; id <= 4136; id++) {
      if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
        console.log(`Stopping after ${MAX_CONSECUTIVE_FAILURES} consecutive failures`);
        break;
      }

      const swimmer = await extractSwimmerData(page, id);
      
      if (swimmer) {
        swimmers.push(swimmer);
        consecutiveFailures = 0;
        console.log(`Successfully extracted data for swimmer ${id}`);
        
        // Save periodically
        if (swimmers.length % SAVE_INTERVAL === 0) {
          console.log(`Saving data after ${swimmers.length} successful extractions...`);
          fs.writeFileSync(OUTPUT_FILE, JSON.stringify(swimmers, null, 2));
          console.log('Data saved successfully');
        }
      } else {
        console.log(`Failed to extract data for ID ${id}. Consecutive failures: ${consecutiveFailures + 1}`);
        consecutiveFailures++;
      }

      await randomDelay();
    }

    // Save final data
    console.log('Saving final data...');
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(swimmers, null, 2));
    console.log('Final data saved successfully');

  } catch (error) {
    console.error('Error during extraction:', error);
  } finally {
    if (browser) {
      console.log('Closing browser...');
      await browser.close();
      console.log('Browser closed');
    }
  }
}

main().catch(console.error);

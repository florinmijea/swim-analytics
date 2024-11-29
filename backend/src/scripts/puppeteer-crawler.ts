import puppeteer, { Page } from 'puppeteer';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Swimmer from '../models/Swimmer';
import Club from '../models/Club';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/swim-analytics';
const BASE_URL = 'https://lpin.ro';
const RETRY_DELAY = 2000;
const MAX_RETRIES = 3;

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.log('Continuing without database connection for testing...');
  }
}

async function initBrowser() {
  return puppeteer.launch({
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1920x1080',
      '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    ],
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
}

async function setupPage(page: Page) {
  // Add common browser headers
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Connection': 'keep-alive',
    'Accept-Encoding': 'gzip, deflate, br'
  });

  // Enable JavaScript
  await page.setJavaScriptEnabled(true);

  // Set viewport
  await page.setViewport({ width: 1920, height: 1080 });

  // Add request interception
  await page.setRequestInterception(true);
  page.on('request', (request) => {
    if (['image', 'stylesheet', 'font'].includes(request.resourceType())) {
      request.abort();
    } else {
      request.continue();
    }
  });
}

async function goto(page: Page, url: string) {
  return retryOperation(async () => {
    try {
      await page.goto(url, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });
      await delay(Math.random() * 2000 + 1000); // Random delay between 1-3 seconds
    } catch (error) {
      console.error(`Failed to load ${url}:`, error);
      throw error;
    }
  });
}

async function retryOperation<T>(operation: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying operation. Attempts remaining: ${retries}`);
      await delay(RETRY_DELAY);
      return retryOperation(operation, retries - 1);
    }
    throw error;
  }
}

interface SwimmerResult {
  style: string;
  time: string;
  place: number;
}

interface Competition {
  competitionName: string;
  date: {
    start: string;
    end: string;
  };
  results: SwimmerResult[];
}

interface PersonalBest {
  style: string;
  time: string;
  competition: string;
  date: string;
}

interface SwimmerData {
  lpinId: number;
  gender: string;
  birthYear: number;
  clubName: string;
  lpinLicenseNumber: string;
  federationLicenseNumber: string;
  participations: Competition[];
  personalBests: PersonalBest[];
}

async function parseSwimmerDetails(page: Page, id: number): Promise<SwimmerData | null> {
  try {
    const url = `${BASE_URL}/sportivi/detalii/${id}`;
    console.log(`Fetching ${url}`);
    
    await goto(page, url);

    // Check if swimmer exists
    const noDataFound = await page.$('.alert-danger');
    if (noDataFound) {
      console.log(`No data found for swimmer ${id}`);
      return null;
    }

    // Extract basic info
    const swimmerData = await page.evaluate(() => {
      const infoTable = document.querySelector('.table');
      if (!infoTable) return null;

      const rows = infoTable.querySelectorAll('tr');
      const gender = rows[0]?.querySelector('td:nth-child(2)')?.textContent?.trim();
      const birthYear = parseInt(rows[1]?.querySelector('td:nth-child(2)')?.textContent?.trim() || '0');
      const clubName = rows[2]?.querySelector('td:nth-child(2)')?.textContent?.trim();
      const lpinLicense = rows[3]?.querySelector('td:nth-child(2)')?.textContent?.trim();
      const fedLicense = rows[4]?.querySelector('td:nth-child(2)')?.textContent?.trim();

      if (!gender || !clubName || !lpinLicense || !fedLicense) {
        return null;
      }

      return {
        gender,
        birthYear,
        clubName,
        lpinLicenseNumber: lpinLicense,
        federationLicenseNumber: fedLicense
      };
    });

    if (!swimmerData) {
      console.log(`Failed to extract basic info for swimmer ${id}`);
      return null;
    }

    // Extract competition history
    const participations = await page.evaluate(() => {
      const competitions: Competition[] = [];
      document.querySelectorAll('.panel.panel-default').forEach(comp => {
        const header = comp.querySelector('.panel-heading');
        const competitionName = header?.querySelector('h4')?.textContent?.trim();
        const dateText = header?.querySelector('h5')?.textContent?.trim();
        
        if (competitionName && dateText) {
          const [startStr, endStr] = dateText.split('-').map(d => d.trim());
          
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

          competitions.push({
            competitionName,
            date: {
              start: startStr,
              end: endStr || startStr
            },
            results
          });
        }
      });
      return competitions;
    });

    // Extract personal bests
    const personalBests = await page.evaluate(() => {
      const bests: PersonalBest[] = [];
      document.querySelectorAll('#bestof .panel-body p').forEach(elem => {
        const text = elem.textContent?.trim() || '';
        const styleMatch = text.match(/(.*?)Timp:/);
        const timeMatch = text.match(/Timp: ([\d:\.]+)/);
        const competitionMatch = text.match(/Competitie: (.*?)Data:/);
        const dateMatch = text.match(/Data: (.*)$/);

        if (styleMatch && timeMatch && competitionMatch && dateMatch) {
          bests.push({
            style: styleMatch[1].trim(),
            time: timeMatch[1].trim(),
            competition: competitionMatch[1].trim(),
            date: dateMatch[1].trim()
          });
        }
      });
      return bests;
    });

    return {
      lpinId: id,
      ...swimmerData,
      participations,
      personalBests
    };
  } catch (error) {
    console.error(`Error processing swimmer ${id}:`, error);
    return null;
  }
}

async function crawlClubs(page: Page) {
  try {
    console.log('Starting club crawl...');
    const url = `${BASE_URL}/cluburi`;
    
    await goto(page, url);

    const clubs = await page.evaluate(() => {
      const clubList: any[] = [];
      document.querySelectorAll('.panel.panel-default').forEach(elem => {
        const name = elem.querySelector('.panel-heading h3')?.textContent?.trim();
        const details = elem.querySelectorAll('.panel-body p');
        
        if (name) {
          clubList.push({
            name,
            city: details[0]?.textContent?.replace('Oras:', '')?.trim() || 'Unknown',
            address: details[1]?.textContent?.replace('Adresa:', '')?.trim() || 'Unknown',
            phone: details[2]?.textContent?.replace('Telefon:', '')?.trim() || 'Unknown',
            email: details[3]?.textContent?.replace('Email:', '')?.trim() || 'Unknown',
            website: details[4]?.textContent?.replace('Website:', '')?.trim() || 'Unknown',
            coach: details[5]?.textContent?.replace('Antrenor:', '')?.trim() || 'Unknown'
          });
        }
      });
      return clubList;
    });

    console.log('Found clubs:', clubs.length);
    clubs.forEach(club => console.log('Club:', club.name));

  } catch (error) {
    console.error('Error crawling clubs:', error);
  }
}

async function crawlSwimmers(page: Page) {
  console.log('Starting swimmer crawl...');
  let id = 1;
  let consecutiveFailures = 0;
  const MAX_CONSECUTIVE_FAILURES = 50;

  while (consecutiveFailures < MAX_CONSECUTIVE_FAILURES) {
    console.log(`Processing swimmer ID: ${id}`);
    const swimmerData = await parseSwimmerDetails(page, id);
    
    if (swimmerData) {
      console.log('Found swimmer:', swimmerData);
      consecutiveFailures = 0;
    } else {
      consecutiveFailures++;
      console.log(`Failed to process swimmer ${id}. Consecutive failures: ${consecutiveFailures}`);
    }

    id++;
    await delay(1000); // Add a delay to avoid overwhelming the server
  }

  console.log('Finished crawling swimmers');
}

async function main() {
  console.log('Starting crawler...');
  
  try {
    console.log('Initializing browser...');
    const browser = await initBrowser();
    console.log('Browser initialized');
    
    const page = await browser.newPage();
    console.log('New page created');
    
    try {
      console.log('Setting up page...');
      await setupPage(page);
      console.log('Page setup complete');
      
      console.log('Connecting to database...');
      await connectDB();
      console.log('Database connection complete');

      // First crawl all clubs
      await crawlClubs(page);

      // Then crawl swimmers
      await crawlSwimmers(page);

      console.log('Crawling completed!');
    } catch (error) {
      console.error('Error during crawling:', error);
    } finally {
      console.log('Closing browser...');
      await browser.close();
      console.log('Browser closed');
      process.exit(0);
    }
  } catch (error) {
    console.error('Error initializing browser:', error);
    process.exit(1);
  }
}

console.log('Starting script...');
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

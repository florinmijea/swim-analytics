import axios, { AxiosError } from 'axios';
import cheerio from 'cheerio';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Swimmer from '../models/Swimmer';
import Club from '../models/Club';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/swim-analytics';
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

const axiosInstance = axios.create({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Cache-Control': 'max-age=0'
  }
});

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<any> {
  try {
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    if (retries > 0) {
      const isAxiosError = axios.isAxiosError(error);
      console.log(`Retry ${MAX_RETRIES - retries + 1}/${MAX_RETRIES} for ${url} (${isAxiosError ? error.message : 'Unknown error'})`);
      await delay(RETRY_DELAY);
      return fetchWithRetry(url, retries - 1);
    }
    throw error;
  }
}

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

async function parseSwimmerDetails(id: number): Promise<any> {
  try {
    const url = `https://lpin.ro/sportivi/detalii/${id}`;
    console.log(`Fetching ${url}`);
    
    const html = await fetchWithRetry(url);
    if (!html) {
      console.log(`No data returned for swimmer ${id}`);
      return null;
    }

    const $ = cheerio.load(html);

    // Check if swimmer exists by looking for specific elements
    if ($('.container .row').length === 0) {
      return null;
    }

    // Basic info - find the table with swimmer details
    const infoTable = $('.table').first();
    const gender = infoTable.find('tr').eq(0).find('td').eq(1).text().trim();
    const birthYear = parseInt(infoTable.find('tr').eq(1).find('td').eq(1).text().trim());
    const clubName = infoTable.find('tr').eq(2).find('td').eq(1).text().trim();
    const lpinLicense = infoTable.find('tr').eq(3).find('td').eq(1).text().trim();
    const fedLicense = infoTable.find('tr').eq(4).find('td').eq(1).text().trim();

    // History of Participations
    const participations: any[] = [];
    $('.panel.panel-default').each((_, comp) => {
      const header = $(comp).find('.panel-heading');
      const competitionName = header.find('h4').text().trim();
      const dateText = header.find('h5').text().trim();
      const [startStr, endStr] = dateText.split('-').map(d => d.trim());
      
      const results: any[] = [];
      $(comp).find('.panel-body p').each((_, result) => {
        const text = $(result).text().trim();
        const [stylePart, timePart, placePart] = text.split(/Timp realizat:|Locul obtinut:/).map(p => p.trim());
        
        if (stylePart && timePart && placePart) {
          results.push({
            style: stylePart,
            time: timePart,
            place: parseInt(placePart)
          });
        }
      });

      if (competitionName && startStr) {
        participations.push({
          competitionName,
          date: {
            start: new Date(startStr),
            end: new Date(endStr || startStr)
          },
          results
        });
      }
    });

    // Best Times
    const personalBests: any[] = [];
    $('#bestof .panel-body p').each((_, elem) => {
      const text = $(elem).text().trim();
      const styleMatch = text.match(/(.*?)Timp:/);
      const timeMatch = text.match(/Timp: ([\d:\.]+)/);
      const competitionMatch = text.match(/Competitie: (.*?)Data:/);
      const dateMatch = text.match(/Data: (.*)$/);

      if (styleMatch && timeMatch && competitionMatch && dateMatch) {
        personalBests.push({
          style: styleMatch[1].trim(),
          time: timeMatch[1].trim(),
          competition: competitionMatch[1].trim(),
          date: new Date(dateMatch[1].trim())
        });
      }
    });

    return {
      lpinId: id,
      gender,
      birthYear,
      clubName,
      lpinLicenseNumber: lpinLicense,
      federationLicenseNumber: fedLicense,
      participations,
      personalBests
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      console.log(`No swimmer found with ID ${id}`);
      return null;
    }
    console.error(`Error processing swimmer ${id}:`, error);
    return null;
  }
}

async function crawlClubs() {
  try {
    console.log('Starting club crawl...');
    const url = 'https://lpin.ro/cluburi';
    const html = await fetchWithRetry(url);
    const $ = cheerio.load(html);

    const clubs: any[] = [];
    $('.panel.panel-default').each((_, elem) => {
      const name = $(elem).find('.panel-heading h3').text().trim();
      const details = $(elem).find('.panel-body p');
      
      const club = {
        name,
        city: details.eq(0).text().replace('Oras:', '').trim(),
        address: details.eq(1).text().replace('Adresa:', '').trim(),
        phone: details.eq(2).text().replace('Telefon:', '').trim(),
        email: details.eq(3).text().replace('Email:', '').trim(),
        website: details.eq(4).text().replace('Website:', '').trim(),
        coach: details.eq(5).text().replace('Antrenor:', '').trim()
      };

      if (club.name) {
        clubs.push(club);
      }
    });

    // Save all clubs
    if (clubs.length > 0) {
      await Club.insertMany(clubs, { ordered: false });
      console.log(`Successfully processed ${clubs.length} clubs`);
    } else {
      console.log('No clubs found to process');
    }
  } catch (error) {
    console.error('Error crawling clubs:', error);
  }
}

async function crawlSwimmers() {
  console.log('Starting swimmer crawl...');
  let id = 1;
  let consecutiveFailures = 0;
  const MAX_CONSECUTIVE_FAILURES = 10;

  while (consecutiveFailures < MAX_CONSECUTIVE_FAILURES) {
    console.log(`Processing swimmer ID: ${id}`);
    const swimmerData = await parseSwimmerDetails(id);
    
    if (swimmerData) {
      try {
        // Find or create club
        let club = await Club.findOne({ name: swimmerData.clubName });
        if (!club) {
          club = await Club.create({ 
            name: swimmerData.clubName,
            city: 'Unknown',
            address: 'Unknown',
            phone: 'Unknown',
            email: 'Unknown',
            website: 'Unknown',
            coach: 'Unknown'
          });
        }

        // Create swimmer with club reference
        const swimmer = await Swimmer.findOneAndUpdate(
          { lpinId: id },
          {
            ...swimmerData,
            club: club._id
          },
          { upsert: true, new: true }
        );

        // Update club's swimmers array
        await Club.findByIdAndUpdate(
          club._id,
          { $addToSet: { swimmers: swimmer._id } }
        );

        console.log(`Successfully processed swimmer ${id}`);
        consecutiveFailures = 0;
      } catch (error) {
        console.error(`Error saving swimmer ${id}:`, error);
        consecutiveFailures++;
      }
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
  await connectDB();

  // First crawl all clubs
  await crawlClubs();

  // Then crawl swimmers
  await crawlSwimmers();

  console.log('Crawling completed!');
  process.exit(0);
}

main();

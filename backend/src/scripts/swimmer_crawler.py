import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime
import logging
import asyncio
import aiohttp
from tqdm import tqdm
import re
from typing import Dict, List, Optional
import argparse
import sys
import os
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('swimmer_crawler.log')
    ]
)
logger = logging.getLogger(__name__)

class SwimmerCrawler:
    BASE_URL = "https://lpin.ro/sportivi/detalii/{}"
    
    def __init__(self, start_id: int = 0, end_id: int = 4136, batch_size: int = 10, output_dir: str = '.'):
        self.start_id = start_id
        self.end_id = end_id
        self.batch_size = batch_size
        self.output_dir = Path(output_dir)
        self.session = None
        
    async def init_session(self):
        if self.session is None:
            self.session = aiohttp.ClientSession()
    
    async def close_session(self):
        if self.session:
            await self.session.close()
            self.session = None

    async def fetch_swimmer_data(self, swimmer_id: int) -> Optional[Dict]:
        url = self.BASE_URL.format(swimmer_id)
        
        try:
            async with self.session.get(url) as response:
                if response.status != 200:
                    logger.warning(f"Failed to fetch data for swimmer ID {swimmer_id}. Status: {response.status}")
                    return None
                
                html_content = await response.text()
                soup = BeautifulSoup(html_content, 'html.parser')
                
                # Extract name from h1 tag
                name = soup.find('h1')
                if not name:
                    return None
                
                # Initialize data dictionary with name
                data = {
                    'swimmer_id': swimmer_id,
                    'name': name.text.strip(),
                    'competitions': []
                }
                
                # Find all basic info from the sportiv-date list
                info_list = soup.find('ul', {'id': 'sportiv-date'})
                if info_list:
                    for item in info_list.find_all('li', {'class': 'group'}):
                        spans = item.find_all('span')
                        if len(spans) == 2:
                            key = spans[0].text.strip().lower()
                            value = spans[1].text.strip()
                            
                            if 'sexul' in key:
                                data['gender'] = value
                            elif 'anul nasterii' in key:
                                try:
                                    data['birth_year'] = int(value)
                                except:
                                    data['birth_year'] = None
                            elif 'legitimat la clubul' in key:
                                data['club'] = value
                            elif 'numar legitimatie lpin' in key:
                                data['lpin_license'] = value
                            elif 'numar legitimatie federatie' in key:
                                data['federation_license'] = value
                
                # Find all competitions from the istoric div
                istoric_div = soup.find('div', {'id': 'istoric', 'class': 'open group'})
                if istoric_div:
                    istoric_rezultate = istoric_div.find('div', {'class': 'istoric-rezultate'})
                    if istoric_rezultate:
                        for comp_box in istoric_rezultate.find_all('div', {'class': 'box'}):
                            comp_title = comp_box.find('div', {'class': 'box_titlu'})
                            if not comp_title:
                                continue
                                
                            comp_name = comp_title.text.strip()
                            
                            # Extract competition name and date range
                            match = re.match(r'(.*?)\s+(\d{1,2}\s+[A-Za-z]+\s+\d{4})\s*-\s*(\d{1,2}\s+[A-Za-z]+\s+\d{4})', comp_name)
                            if not match:
                                continue
                                
                            competition = {
                                'competition_name': match.group(1).strip(),
                                'start_date': match.group(2).strip(),
                                'end_date': match.group(3).strip(),
                                'events': []
                            }
                            
                            # Extract events
                            for event_li in comp_box.find_all('li', {'class': 'grid grid-pad'}):
                                cols = event_li.find_all('div', {'class': ['col-6-12', 'col-3-12']})
                                if len(cols) != 3:
                                    continue
                                    
                                event = {
                                    'event_name': cols[0].text.strip(),
                                    'time': cols[1].text.replace('Timp realizat:', '').strip(),
                                    'place': cols[2].text.replace('Locul obtinut:', '').strip()
                                }
                                
                                competition['events'].append(event)
                            
                            if competition['events']:
                                data['competitions'].append(competition)
                
                data['last_updated'] = datetime.utcnow().isoformat()
                
                return data
                
        except Exception as e:
            logger.error(f"Error fetching data for swimmer ID {swimmer_id}: {str(e)}")
            return None

    async def crawl(self) -> None:
        await self.init_session()
        
        all_data = []
        total_swimmers = self.end_id - self.start_id + 1
        
        try:
            with tqdm(total=total_swimmers, desc="Crawling swimmers") as pbar:
                for batch_start in range(self.start_id, self.end_id + 1, self.batch_size):
                    batch_end = min(batch_start + self.batch_size, self.end_id + 1)
                    tasks = [self.fetch_swimmer_data(i) for i in range(batch_start, batch_end)]
                    
                    batch_results = await asyncio.gather(*tasks)
                    
                    # Filter out None results and add valid data
                    valid_results = [result for result in batch_results if result is not None]
                    all_data.extend(valid_results)
                    
                    # Save after each batch
                    self.save_data(all_data)
                    
                    pbar.update(batch_end - batch_start)
                    
                    # Small delay to avoid overwhelming the server
                    await asyncio.sleep(1)
        
        finally:
            await self.close_session()
            
        logger.info(f"Crawling completed. Total swimmers processed: {len(all_data)}")

    def save_data(self, data: List[Dict]) -> None:
        # Create output directory if it doesn't exist
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Save main data file
        output_file = self.output_dir / 'swimmers_data.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        # Save a backup with timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_file = self.output_dir / f'swimmers_data_{timestamp}.json'
        with open(backup_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        logger.info(f"Data saved to {output_file} and backup created at {backup_file}")

def parse_args():
    parser = argparse.ArgumentParser(description='LPIN Swimmer Data Crawler')
    parser.add_argument('--start-id', type=int, default=0,
                      help='Starting swimmer ID (default: 0)')
    parser.add_argument('--end-id', type=int, default=4136,
                      help='Ending swimmer ID (default: 4136)')
    parser.add_argument('--batch-size', type=int, default=10,
                      help='Number of swimmers to process in parallel (default: 10)')
    parser.add_argument('--output-dir', type=str, default='data',
                      help='Directory to save output files (default: data)')
    return parser.parse_args()

async def main():
    args = parse_args()
    
    # Create crawler instance with command line arguments
    crawler = SwimmerCrawler(
        start_id=args.start_id,
        end_id=args.end_id,
        batch_size=args.batch_size,
        output_dir=args.output_dir
    )
    
    # Run the crawler
    await crawler.crawl()

if __name__ == "__main__":
    asyncio.run(main())

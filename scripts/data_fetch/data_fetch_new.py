#!/usr/bin/env python3
"""
Hotel Data Fetching Script for Hackathon Project
Collects hotel data using Google Places API, Routes API, and Overpass API
Produces comprehensive datasets with locality analysis and landmark distances
"""

import os
import json
import csv
import time
import argparse
import requests
import random
from pathlib import Path
from typing import Dict, List, Set, Optional, Tuple, Any
from dataclasses import dataclass, asdict
from collections import defaultdict, Counter
import logging
from datetime import datetime
import math
import hashlib
from dotenv import load_dotenv

from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

from urllib.parse import quote, urljoin

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class CityConfig:
    name: str
    state: str
    landmarks: Dict[str, Dict[str, Any]]
    search_strategies: List[str]
    

class HotelDataFetcher:
    def __init__(self):
        self.load_config()
        self.setup_api_keys()
        self.setup_rate_limits()
        self.setup_session()
        self.request_counts = {
            'text_search': 0,
            'route_matrix': 0,
            'overpass': 0
        }
        self.seen_place_ids = set()
        self.city_hotels = {}
        self._completed_stages = []
        
    def setup_session(self):
        """Setup requests session with retry strategy"""
        self.session = requests.Session()
        retry_strategy = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)

    def rotate_headers(self):
        """Rotate user agent headers to avoid detection"""
        user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
        ]
        self.session.headers.update({
            'User-Agent': random.choice(user_agents)
        })

    def load_config(self):
        """Load configuration settings"""
        self.DEFAULT_PER_CITY = 250
        self.TEST_RUN_COUNT = 5
        self.OUTPUT_DIR = Path("./out")
        self.OUTPUT_DIR.mkdir(exist_ok=True)
        
    def setup_api_keys(self):
        """Load API keys from environment with validation"""
        load_dotenv()
        
        self.google_api_key = os.getenv('GOOGLE_PLACES_API_KEY')

        if not self.google_api_key:
            raise ValueError("GOOGLE_PLACES_API_KEY not found in environment")
        
        logger.info("API keys loaded successfully")
            
    def setup_rate_limits(self):
        """Setup API rate limits"""
        self.TEXT_SEARCH_MAX = int(os.getenv('TEXT_SEARCH_MAX_REQUESTS', '7000'))
        self.ROUTE_MATRIX_MAX = int(os.getenv('ROUTE_MATRIX_MAX_REQUESTS', '70000'))
        
        # Rate limiting counters with timestamps
        self.rate_limit_counters = {
            'text_search_per_minute': {'count': 0, 'reset_time': time.time() + 60},
            'route_matrix_per_minute': {'count': 0, 'reset_time': time.time() + 60}
        }
    
    def check_rate_limit(self, api_type: str) -> bool:
        """Check if we can make a request within rate limits"""
        current_time = time.time()
        counter_key = f"{api_type}_per_minute"
        
        if counter_key not in self.rate_limit_counters:
            return True
        
        counter = self.rate_limit_counters[counter_key]
        
        # Reset counter if time window has passed
        if current_time >= counter['reset_time']:
            counter['count'] = 0
            counter['reset_time'] = current_time + 60
        
        # Check limits
        if api_type == 'text_search' and counter['count'] >= 600:
            return False
        elif api_type == 'route_matrix' and counter['count'] >= 3000:
            return False
        
        return True
    
    def increment_rate_limit(self, api_type: str, count: int = 1):
        """Increment rate limit counter"""
        counter_key = f"{api_type}_per_minute"
        if counter_key in self.rate_limit_counters:
            self.rate_limit_counters[counter_key]['count'] += count
    
    def save_progress(self, city: str, stage: str, data: Dict = None):
        """Save progress to enable resumption after crashes"""
        progress_dir = self.OUTPUT_DIR / city / ".progress"
        progress_dir.mkdir(parents=True, exist_ok=True)
        
        progress_file = progress_dir / "progress.json"
        
        progress_data = {
            'timestamp': datetime.now().isoformat(),
            'stage': stage,
            'completed_stages': getattr(self, '_completed_stages', []),
            'data': data or {}
        }
        
        if stage not in progress_data['completed_stages']:
            progress_data['completed_stages'].append(stage)
        
        self._completed_stages = progress_data['completed_stages']
        
        try:
            with open(progress_file, 'w') as f:
                json.dump(progress_data, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save progress: {e}")
    
    def load_progress(self, city: str) -> Dict:
        """Load previous progress for resumption"""
        progress_file = self.OUTPUT_DIR / city / ".progress" / "progress.json"
        
        if progress_file.exists():
            try:
                with open(progress_file, 'r') as f:
                    data = json.load(f)
                    self._completed_stages = data.get('completed_stages', [])
                    return data
            except Exception as e:
                logger.error(f"Failed to load progress: {e}")
        
        return {'stage': 'start', 'completed_stages': [], 'data': {}}
        
    def get_city_config(self) -> Dict[str, CityConfig]:
        """Get city configurations with landmarks and search strategies"""
        return {
            "Delhi": CityConfig(
                name="Delhi",
                state="Delhi",
                landmarks={
                    "airport": {"name": "Indira Gandhi International Airport", "lat": 28.5562, "lng": 77.1000},
                    "railway": {"name": "New Delhi Railway Station", "lat": 28.6428, "lng": 77.2197},
                    "bus": {"name": "Kashmere Gate ISBT", "lat": 28.6736, "lng": 77.2289},
                    "business": {"name": "Connaught Place", "lat": 28.6315, "lng": 77.2167},
                    "karol_bagh": {"name": "Karol Bagh", "lat": 28.6510, "lng": 77.1900}
                },
                search_strategies=[
                    "hotels in Delhi by review count",
                    "hotels in Delhi with less than <review_count_last> reviews",
                    "luxury hotels in Delhi",
                    "budget hotels in Delhi",
                    "mid-range hotels in Delhi",
                    "hotels near Indira Gandhi International Airport",
                    "hotels near New Delhi Railway Station",
                    "hotels near Kashmere Gate ISBT",
                    "business hotels near Connaught Place",
                    "hotels near Karol Bagh"
                ]
            ),
            "Mumbai": CityConfig(
                name="Mumbai",
                state="Maharashtra",
                landmarks={
                    "airport": {"name": "Chhatrapati Shivaji Maharaj International Airport", "lat": 19.0896, "lng": 72.8656},
                    "railway": {"name": "Chhatrapati Shivaji Maharaj Terminus", "lat": 18.9402, "lng": 72.8356},
                    "bus": {"name": "Mumbai Central Bus Depot", "lat": 18.9696, "lng": 72.8194},
                    "business": {"name": "Bandra Kurla Complex", "lat": 19.0660, "lng": 72.8506},
                    "colaba": {"name": "Colaba", "lat": 18.9067, "lng": 72.8147}
                },
                search_strategies=[
                    "hotels in Mumbai by review count",
                    "hotels in Mumbai with less than <review_count_last> reviews",
                    "luxury hotels in Mumbai",
                    "budget hotels in Mumbai",
                    "mid-range hotels in Mumbai",
                    "hotels near Chhatrapati Shivaji Maharaj International Airport",
                    "hotels near Chhatrapati Shivaji Maharaj Terminus",
                    "hotels near Mumbai Central Bus Depot",
                    "business hotels near Bandra Kurla Complex",
                    "hotels near Colaba"
                ]
            ),
            "Bengaluru": CityConfig(
                name="Bengaluru",
                state="Karnataka",
                landmarks={
                    "airport": {"name": "Kempegowda International Airport", "lat": 13.1986, "lng": 77.7066},
                    "railway": {"name": "Krantivira Sangolli Rayanna Railway Station", "lat": 12.9780, "lng": 77.5680},
                    "bus": {"name": "Majestic Bus Stand (Kempegowda Bus Station)", "lat": 12.9784, "lng": 77.5723},
                    "business": {"name": "Whitefield", "lat": 12.9698, "lng": 77.7499},
                    "electronic_city": {"name": "Electronic City", "lat": 12.8452, "lng": 77.6602}
                },
                search_strategies=[
                    "hotels in Bengaluru by review count",
                    "hotels in Bengaluru with less than <review_count_last> reviews",
                    "luxury hotels in Bengaluru",
                    "budget hotels in Bengaluru",
                    "mid-range hotels in Bengaluru",
                    "hotels near Kempegowda International Airport",
                    "hotels near Krantivira Sangolli Rayanna Railway Station",
                    "hotels near Majestic Bus Stand",
                    "business hotels near Whitefield",
                    "hotels near Electronic City"
                ]
            ),
            "Hyderabad": CityConfig(
                name="Hyderabad",
                state="Telangana",
                landmarks={
                    "airport": {"name": "Rajiv Gandhi International Airport", "lat": 17.2403, "lng": 78.4294},
                    "railway": {"name": "Hyderabad Deccan (Nampally)", "lat": 17.3917, "lng": 78.4675},
                    "bus": {"name": "MGBS Bus Stand", "lat": 17.3753, "lng": 78.4804},
                    "business": {"name": "HITEC City", "lat": 17.4483, "lng": 78.3915},
                    "charminar": {"name": "Charminar", "lat": 17.3616, "lng": 78.4747}
                },
                search_strategies=[
                    "hotels in Hyderabad by review count",
                    "hotels in Hyderabad with less than <review_count_last> reviews",
                    "luxury hotels in Hyderabad",
                    "budget hotels in Hyderabad",
                    "mid-range hotels in Hyderabad",
                    "hotels near Rajiv Gandhi International Airport",
                    "hotels near Hyderabad Deccan Railway Station",
                    "hotels near MGBS Bus Stand",
                    "business hotels near HITEC City",
                    "hotels near Charminar"
                ]
            ),
            "Chennai": CityConfig(
                name="Chennai",
                state="Tamil Nadu",
                landmarks={
                    "airport": {"name": "Chennai International Airport", "lat": 12.9941, "lng": 80.1709},
                    "railway": {"name": "Chennai Central Railway Station", "lat": 13.0827, "lng": 80.2757},
                    "bus": {"name": "CMBT Bus Stand", "lat": 13.0729, "lng": 80.2170},
                    "business": {"name": "Guindy Industrial Estate", "lat": 13.0105, "lng": 80.2126},
                    "marina_beach": {"name": "Marina Beach", "lat": 13.0494, "lng": 80.2824}
                },
                search_strategies=[
                    "hotels in Chennai by review count",
                    "hotels in Chennai with less than <review_count_last> reviews",
                    "luxury hotels in Chennai",
                    "budget hotels in Chennai",
                    "mid-range hotels in Chennai",
                    "hotels near Chennai International Airport",
                    "hotels near Chennai Central Railway Station",
                    "hotels near CMBT Bus Stand",
                    "business hotels near Guindy Industrial Estate",
                    "hotels near Marina Beach"
                ]
            ),
            "Kolkata": CityConfig(
                name="Kolkata",
                state="West Bengal",
                landmarks={
                    "airport": {"name": "Netaji Subhas Chandra Bose International Airport", "lat": 22.6547, "lng": 88.4467},
                    "railway": {"name": "Howrah Junction", "lat": 22.5850, "lng": 88.3468},
                    "sealdah": {"name": "Sealdah Railway Station", "lat": 22.5665, "lng": 88.3700},
                    "bus": {"name": "Esplanade Bus Terminus", "lat": 22.5675, "lng": 88.3476},
                    "business": {"name": "Sector V (Salt Lake)", "lat": 22.5726, "lng": 88.4336}
                },
                search_strategies=[
                    "hotels in Kolkata by review count",
                    "hotels in Kolkata with less than <review_count_last> reviews",
                    "luxury hotels in Kolkata",
                    "budget hotels in Kolkata",
                    "mid-range hotels in Kolkata",
                    "hotels near Netaji Subhas Chandra Bose International Airport",
                    "hotels near Howrah Junction",
                    "hotels near Sealdah Railway Station",
                    "hotels near Esplanade Bus Terminus",
                    "business hotels near Sector V Salt Lake"
                ]
            ),
            "Pune": CityConfig(
                name="Pune",
                state="Maharashtra",
                landmarks={
                    "airport": {"name": "Pune International Airport", "lat": 18.5814, "lng": 73.9197},
                    "railway": {"name": "Pune Junction", "lat": 18.5286, "lng": 73.8740},
                    "bus": {"name": "Shivajinagar Bus Stand", "lat": 18.5308, "lng": 73.8470},
                    "business": {"name": "Hinjawadi IT Park", "lat": 18.5970, "lng": 73.7184},
                    "swargate": {"name": "Swargate", "lat": 18.5018, "lng": 73.8636}
                },
                search_strategies=[
                    "hotels in Pune by review count",
                    "hotels in Pune with less than <review_count_last> reviews",
                    "luxury hotels in Pune",
                    "budget hotels in Pune",
                    "mid-range hotels in Pune",
                    "hotels near Pune International Airport",
                    "hotels near Pune Junction",
                    "hotels near Shivajinagar Bus Stand",
                    "business hotels near Hinjawadi IT Park",
                    "hotels near Swargate"
                ]
            ),
            "Ahmedabad": CityConfig(
                name="Ahmedabad",
                state="Gujarat",
                landmarks={
                    "airport": {"name": "Sardar Vallabhbhai Patel International Airport", "lat": 23.0734, "lng": 72.6266},
                    "railway": {"name": "Ahmedabad Junction", "lat": 23.0260, "lng": 72.6014},
                    "bus": {"name": "Geeta Mandir Bus Stand", "lat": 23.0057, "lng": 72.6020},
                    "business": {"name": "SG Highway", "lat": 23.0455, "lng": 72.4998},
                    "law_garden": {"name": "Law Garden", "lat": 23.0222, "lng": 72.5716}
                },
                search_strategies=[
                    "hotels in Ahmedabad by review count",
                    "hotels in Ahmedabad with less than <review_count_last> reviews",
                    "luxury hotels in Ahmedabad",
                    "budget hotels in Ahmedabad",
                    "mid-range hotels in Ahmedabad",
                    "hotels near Sardar Vallabhbhai Patel International Airport",
                    "hotels near Ahmedabad Junction",
                    "hotels near Geeta Mandir Bus Stand",
                    "business hotels near SG Highway",
                    "hotels near Law Garden"
                ]
            ),
            "Jaipur": CityConfig(
                name="Jaipur",
                state="Rajasthan",
                landmarks={
                    "airport": {"name": "Jaipur International Airport", "lat": 26.8242, "lng": 75.8122},
                    "railway": {"name": "Jaipur Junction", "lat": 26.9196, "lng": 75.7878},
                    "bus": {"name": "Sindhi Camp Bus Stand", "lat": 26.9235, "lng": 75.7936},
                    "business": {"name": "MI Road", "lat": 26.9158, "lng": 75.8144},
                    "amer_fort": {"name": "Amer Fort", "lat": 26.9855, "lng": 75.8513}
                },
                search_strategies=[
                    "hotels in Jaipur by review count",
                    "hotels in Jaipur with less than <review_count_last> reviews",
                    "luxury hotels in Jaipur",
                    "budget hotels in Jaipur",
                    "mid-range hotels in Jaipur",
                    "hotels near Jaipur International Airport",
                    "hotels near Jaipur Junction",
                    "hotels near Sindhi Camp Bus Stand",
                    "business hotels near MI Road",
                    "hotels near Amer Fort"
                ]
            ),
            "Lucknow": CityConfig(
                name="Lucknow",
                state="Uttar Pradesh",
                landmarks={
                    "airport": {"name": "Chaudhary Charan Singh International Airport", "lat": 26.7606, "lng": 80.8893},
                    "railway": {"name": "Charbagh Railway Station", "lat": 26.8302, "lng": 80.9218},
                    "bus": {"name": "Alambagh Bus Stand", "lat": 26.8105, "lng": 80.9039},
                    "business": {"name": "Hazratganj", "lat": 26.8500, "lng": 80.9462},
                    "gomti_nagar": {"name": "Gomti Nagar", "lat": 26.8605, "lng": 81.0230}
                },
                search_strategies=[
                    "hotels in Lucknow by review count",
                    "hotels in Lucknow with less than <review_count_last> reviews",
                    "luxury hotels in Lucknow",
                    "budget hotels in Lucknow",
                    "mid-range hotels in Lucknow",
                    "hotels near Chaudhary Charan Singh International Airport",
                    "hotels near Charbagh Railway Station",
                    "hotels near Alambagh Bus Stand",
                    "business hotels near Hazratganj",
                    "hotels near Gomti Nagar"
                ]
            ),
            "Bhubaneswar": CityConfig(
                name="Bhubaneswar",
                state="Odisha",
                landmarks={
                    "airport": {"name": "Biju Patnaik International Airport", "lat": 20.2520, "lng": 85.8178},
                    "railway": {"name": "Bhubaneswar Railway Station", "lat": 20.2680, "lng": 85.8440},
                    "bus": {"name": "Baramunda Bus Stand", "lat": 20.2677, "lng": 85.7855},
                    "business": {"name": "Saheed Nagar", "lat": 20.2936, "lng": 85.8445},
                    "khandagiri": {"name": "Khandagiri Caves", "lat": 20.2493, "lng": 85.7610}
                },
                search_strategies=[
                    "hotels in Bhubaneswar by review count",
                    "hotels in Bhubaneswar with less than <review_count_last> reviews",
                    "luxury hotels in Bhubaneswar",
                    "budget hotels in Bhubaneswar",
                    "mid-range hotels in Bhubaneswar",
                    "hotels near Biju Patnaik International Airport",
                    "hotels near Bhubaneswar Railway Station",
                    "hotels near Baramunda Bus Stand",
                    "business hotels near Saheed Nagar",
                    "hotels near Khandagiri Caves"
                ]
            ),
            "Kochi": CityConfig(
                name="Kochi",
                state="Kerala",
                landmarks={
                    "airport": {"name": "Cochin International Airport", "lat": 10.1520, "lng": 76.4019},
                    "railway": {"name": "Ernakulam Junction", "lat": 9.9700, "lng": 76.2900},
                    "bus": {"name": "Vyttila Mobility Hub", "lat": 9.9631, "lng": 76.3189},
                    "business": {"name": "Infopark", "lat": 10.0181, "lng": 76.3600},
                    "marine_drive": {"name": "Marine Drive", "lat": 9.9816, "lng": 76.2756}
                },
                search_strategies=[
                    "hotels in Kochi by review count",
                    "hotels in Kochi with less than <review_count_last> reviews",
                    "luxury hotels in Kochi",
                    "budget hotels in Kochi",
                    "mid-range hotels in Kochi",
                    "hotels near Cochin International Airport",
                    "hotels near Ernakulam Junction",
                    "hotels near Vyttila Mobility Hub",
                    "business hotels near Infopark",
                    "hotels near Marine Drive"
                ]
            )            
        }

    def load_seen_place_ids(self, city: str) -> Set[str]:
        """Load seen place IDs to avoid duplicates"""
        seen_file = self.OUTPUT_DIR / city / "mappings" / "seen_place_ids.json"
        if seen_file.exists():
            try:
                with open(seen_file, 'r') as f:
                    return set(json.load(f))
            except Exception as e:
                logger.error(f"Failed to load seen place IDs: {e}")
                return set()
        return set()

    def save_seen_place_ids(self, city: str, place_ids: Set[str]):
        """Save seen place IDs for persistent deduplication"""
        mappings_dir = self.OUTPUT_DIR / city / "mappings"
        mappings_dir.mkdir(parents=True, exist_ok=True)
        
        seen_file = mappings_dir / "seen_place_ids.json"
        try:
            with open(seen_file, 'w') as f:
                json.dump(list(place_ids), f)
        except Exception as e:
            logger.error(f"Failed to save seen place IDs: {e}")

    def make_request_with_retry(self, url: str, headers: Dict = None, body: str = None,
                          max_retries: int = 3, backoff_factor: float = 1.0) -> requests.Response:
        """Make HTTP request with exponential backoff retry - Enhanced for 429 handling"""
        for attempt in range(max_retries):
            try:
                response = requests.post(url, headers=headers, json=body, timeout=30)
                    
                if response.status_code == 200:
                    return response
                elif response.status_code == 429:  # Rate limit
                    # Check if Retry-After header is present
                    retry_after = response.headers.get('Retry-After')
                    if retry_after:
                        try:
                            wait_time = int(retry_after)
                        except ValueError:
                            wait_time = backoff_factor * (2 ** attempt)
                    else:
                        wait_time = backoff_factor * (2 ** attempt)
                    
                    # Cap maximum wait time at 5 minutes
                    wait_time = min(wait_time, 120)
                    logger.warning(f"Rate limited (429), waiting {wait_time}s before retry {attempt + 1}/{max_retries}")
                    time.sleep(wait_time)
                else:
                    logger.error(f"HTTP {response.status_code}: {response.text}")
                    break
            except requests.exceptions.RequestException as e:
                logger.error(f"Request failed (attempt {attempt + 1}): {e}")
                if attempt < max_retries - 1:
                    time.sleep(backoff_factor * (2 ** attempt))
        
        return None

    def search_hotels_text_search(self, city_config: CityConfig, max_hotels: int = 250) -> List[Dict]:
        """Search for hotels using Google Places Text Search API"""
        logger.info(f"Starting hotel search for {city_config.name}")
        
        # Check for existing progress
        progress = self.load_progress(city_config.name)
        if 'text_search' in progress.get('completed_stages', []):
            logger.info(f"Text search already completed for {city_config.name}, loading existing data")
            city_dir = self.OUTPUT_DIR / city_config.name
            hotels_file = city_dir / "hotels_raw.json"
            if hotels_file.exists():
                try:
                    with open(hotels_file, 'r') as f:
                        return json.load(f)
                except Exception as e:
                    logger.error(f"Failed to load existing hotels data: {e}")
        
        hotels = []
        seen_place_ids = self.load_seen_place_ids(city_config.name)
        
        # Create output directories
        city_dir = self.OUTPUT_DIR / city_config.name
        raw_dir = city_dir / "raw"
        raw_dir.mkdir(parents=True, exist_ok=True)
        
        base_url = "https://places.googleapis.com/v1/places:searchText"
        
        try:
            for strategy_idx, query in enumerate(city_config.search_strategies):
                if len(hotels) >= max_hotels:
                    break
                    
                logger.info(f"Searching with strategy: {query}")
                
                headers = {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': self.google_api_key,
                    'X-Goog-FieldMask': '*',
                }
                body = {
                    'textQuery': query,
                    'includedType': 'lodging'
                }
                
                page_num = 0
                next_page_token = None
                
                while len(hotels) < max_hotels:
                    if next_page_token:
                        body['pageToken'] = next_page_token  
                    # Check rate limits
                    if not self.check_rate_limit('text_search'):
                        logger.warning("Text Search rate limit reached, waiting 30 seconds...")
                        time.sleep(30)
                        continue
                    
                    if self.request_counts['text_search'] >= self.TEXT_SEARCH_MAX:
                        logger.warning("Text Search API daily limit reached")
                        break
                    
                    response = self.make_request_with_retry(base_url, headers, body)
                    if not response:
                        logger.error(f"Failed to get response for query: {query}")
                        break
                    
                    try:
                        data = response.json()
                    except json.JSONDecodeError as e:
                        logger.error(f"Invalid JSON response: {e}")
                        break
                    
                    self.request_counts['text_search'] += 1
                    self.increment_rate_limit('text_search')
                    
                    # Save raw response
                    raw_file = raw_dir / f"text_search_{strategy_idx}_{page_num}.json"
                    try:
                        with open(raw_file, 'w') as f:
                            json.dump(data, f, indent=2)
                    except Exception as e:
                        logger.error(f"Failed to save raw response: {e}")
                    
                    if 'places' not in data or not data['places']:
                        logger.info(f"No results found for query: {query}")
                        break
                    
                    # Process results
                    page_hotels = []
                    for place in data['places']:
                        try:
                            place_id = place.get('id')
                            if not place_id or place_id in seen_place_ids:
                                continue
                            
                            # Validate essential fields
                   
                            if not self.validate_hotel_data(place):
                                logger.warning(f"Invalid hotel data for place_id: {place_id}")
                                continue
                            
                            # Fallback deduplication using name and coordinates
                            name = place.get('displayName', '').get('text','')
                            lat = place.get('location', {}).get('latitude')
                            lng = place.get('location', {}).get('longitude')
                            
                            if lat and lng:
                                coord_key = f"{name}_{lat:.6f}_{lng:.6f}"
                                coord_hash = hashlib.md5(coord_key.encode()).hexdigest()
                                
                                if coord_hash in seen_place_ids:
                                    continue
                                seen_place_ids.add(coord_hash)
                            
                            seen_place_ids.add(place_id)
                            page_hotels.append(place)
                        except Exception as e:
                            logger.error(f"Error processing hotel data: {e}")
                            continue
                    
                    hotels.extend(page_hotels)
                    logger.info(f"Found {len(page_hotels)} new hotels (total: {len(hotels)})")
                    
                    
                    
                    if 'pageToken' in body:
                        del body['pageToken']  

                    # Check for next page
                    next_page_token = data.get('nextPageToken')
                    if not next_page_token:
                        break
                    
                    page_num += 1
                    time.sleep(1)  # Reduced delay for next page token
                    
            
            # Save final results
            self.save_intermediate_hotels(city_config.name, hotels)
            
            # Save seen place IDs
            self.save_seen_place_ids(city_config.name, seen_place_ids)
            
            # Mark stage as completed
            if hotels:
                self.save_progress(city_config.name, 'text_search', {'hotels_count': len(hotels)})
            
        except Exception as e:
            logger.error(f"Critical error in text search for {city_config.name}: {e}")
            # Save whatever data we have
            if hotels:
                self.save_intermediate_hotels(city_config.name, hotels)
        
        # Limit to max_hotels
        hotels = hotels[:max_hotels]
        logger.info(f"Collected {len(hotels)} hotels for {city_config.name}")
        
        return hotels
    
    def validate_hotel_data(self, hotel: Dict) -> bool:
        """Validate essential hotel data fields"""
        required_fields = ['id', 'displayName', 'location']
        
        for field in required_fields:
            if field not in hotel or hotel[field] is None:
                return False
        
        # Validate geometry has location with lat/lng
        location = hotel.get('location', {})
        if not location.get('latitude') or not location.get('longitude'):
            return False
        
        return True
    
    def save_intermediate_hotels(self, city: str, hotels: List[Dict]):
        """Save intermediate hotels data for crash recovery"""
        city_dir = self.OUTPUT_DIR / city
        city_dir.mkdir(exist_ok=True)
        
        try:
            hotels_file = city_dir / "hotels_raw.json"
            with open(hotels_file, 'w') as f:
                json.dump(hotels, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save intermediate hotels data: {e}")

    def get_route_matrix(self, origins: List[Dict], destinations: List[Dict], 
                        city: str) -> Dict:
        """Get route matrix using Google Routes API implementation"""
        if not origins or not destinations:
            return {}
        
        # Validate input data
        valid_origins = [o for o in origins if o.get('lat') is not None and o.get('lng') is not None]
        valid_destinations = [d for d in destinations if d.get('lat') is not None and d.get('lng') is not None]
        
        if not valid_origins or not valid_destinations:
            logger.warning("No valid coordinates for route matrix calculation")
            return {}
        
        # Check batch size limit (origins × destinations ≤ 625)
        elements_count = len(valid_origins) * len(valid_destinations)
        if elements_count > 625:
            logger.warning("Route matrix batch too large, splitting...")
            return self.get_route_matrix_batch(valid_origins, valid_destinations, city)
        
        # Check rate limits
        if not self.check_rate_limit('route_matrix'):
            logger.warning("Route Matrix rate limit reached, waiting 60 seconds...")
            time.sleep(60)
        
        if self.request_counts['route_matrix'] + elements_count > self.ROUTE_MATRIX_MAX:
            logger.warning("Route Matrix API daily limit would be exceeded")
            return {}
        
        url = "https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix"
        
        # Format origins and destinations correctly
        formatted_origins = []
        for origin in valid_origins:
            try:
                formatted_origins.append({
                    "waypoint": {
                        "location": {
                            "latLng": {
                                "latitude": float(origin['lat']),
                                "longitude": float(origin['lng'])
                            }
                        }
                    }
                })
            except (ValueError, TypeError) as e:
                logger.error(f"Invalid origin coordinates: {e}")
                continue
        
        formatted_destinations = []
        for dest in valid_destinations:
            try:
                formatted_destinations.append({
                    "waypoint": {
                        "location": {
                            "latLng": {
                                "latitude": float(dest['lat']),
                                "longitude": float(dest['lng'])
                            }
                        }
                    }
                })
            except (ValueError, TypeError) as e:
                logger.error(f"Invalid destination coordinates: {e}")
                continue
        
        if not formatted_origins or not formatted_destinations:
            logger.error("No valid formatted coordinates for route matrix")
            return {}
        
        payload = {
            "origins": formatted_origins,
            "destinations": formatted_destinations,
            "travelMode": "DRIVE",
            "routingPreference": "TRAFFIC_AWARE",
            "units": "METRIC"
        }
        
        headers = {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': self.google_api_key,
            'X-Goog-FieldMask': 'originIndex,destinationIndex,duration,distanceMeters,status'
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            if response.status_code == 200:
                self.request_counts['route_matrix'] += len(formatted_origins) * len(formatted_destinations)
                self.increment_rate_limit('route_matrix', len(formatted_origins) * len(formatted_destinations))
                
                try:
                    result = response.json()
                except json.JSONDecodeError as e:
                    logger.error(f"Invalid JSON in route matrix response: {e}")
                    return {}
                
                # Save raw response
                raw_dir = self.OUTPUT_DIR / city / "raw"
                raw_dir.mkdir(parents=True, exist_ok=True)
                timestamp = int(time.time())
                raw_file = raw_dir / f"route_matrix_{timestamp}.json"
                try:
                    with open(raw_file, 'w') as f:
                        json.dump(result, f, indent=2)
                except Exception as e:
                    logger.error(f"Failed to save route matrix response: {e}")
                
                # Handle different response formats
                if isinstance(result, list):
                    return {'matrix': result}
                elif isinstance(result, dict) and 'matrix' in result:
                    return result
                else:
                    logger.warning(f"Unexpected route matrix response format: {type(result)}")
                    return {'matrix': result if isinstance(result, list) else []}
            else:
                logger.error(f"Route Matrix API error: {response.status_code} - {response.text}")
                return {}
        except requests.exceptions.RequestException as e:
            logger.error(f"Route Matrix API request failed: {e}")
            return {}

    def calculate_distance(self, lat1: float, lng1: float, lat2: float, lng2: float) -> float:
        """Calculate straight-line distance between two points using Haversine formula"""
        from math import radians, cos, sin, asin, sqrt
        
        # Convert decimal degrees to radians
        lat1, lng1, lat2, lng2 = map(radians, [lat1, lng1, lat2, lng2])
        
        # Haversine formula
        dlat = lat2 - lat1
        dlng = lng2 - lng1
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlng/2)**2
        c = 2 * asin(sqrt(a))
        r = 6371  # Radius of earth in kilometers
        
        return c * r

    def query_overpass_pois(self, lat: float, lng: float, city: str, hotel_idx: int) -> Dict:
        """Query Overpass API for POI data around hotel location"""
        try:
            overpass_url = "http://overpass-api.de/api/interpreter"
            
            # Step 1: Query POIs within 1000m (1km)
            query_1km = f"""
            [out:json][timeout:60];
            (
            node["amenity"~"^(hospital|clinic|doctors)$"](around:1000,{lat},{lng});
            node["amenity"~"^(pharmacy)$"](around:1000,{lat},{lng});
            node["amenity"~"^(bank|atm)$"](around:1000,{lat},{lng});
            node["amenity"~"^(restaurant|cafe|food_court|fast_food)$"](around:1000,{lat},{lng});
            node["shop"~"^(supermarket|mall|department_store)$"](around:1000,{lat},{lng});
            node["leisure"~"^(park|playground|garden)$"](around:1000,{lat},{lng});
            );
            out geom;
            """
            
            # Step 2: Query POIs within 2500m (2.5km)
            query_2_5km = f"""
            [out:json][timeout:60];
            (
            node["amenity"~"^(fuel)$"](around:2500,{lat},{lng});
            node["amenity"~"^(charging_station)$"](around:2500,{lat},{lng});
            node["amenity"~"^(cinema|theatre)$"](around:2500,{lat},{lng});
            node["public_transport"~"^(station|stop_position)$"](around:2500,{lat},{lng});
            node["railway"~"^(station)$"](around:2500,{lat},{lng});
            node["aeroway"~"^(aerodrome|terminal)$"](around:5000,{lat},{lng});
            );
            out geom;
            """
            
            logger.info(f"Querying Overpass API for hotel {hotel_idx} at {lat}, {lng}")
            
            # Execute first query (1km) with enhanced retry
            response_1km = self.safe_request(overpass_url, params={'data': query_1km}, timeout=90)
            pois_1km = {}
            if response_1km and response_1km.status_code == 200:
                try:
                    pois_1km = response_1km.json()
                    logger.info(f"1km query returned {len(pois_1km.get('elements', []))} POIs for hotel {hotel_idx}")
                except json.JSONDecodeError as e:
                    logger.error(f"Invalid JSON from Overpass API (1km): {e}")
                    pois_1km = {}
            else:
                logger.warning(f"1km Overpass API request failed for hotel {hotel_idx}: {response_1km.status_code if response_1km else 'No response'}")
            
            # Small delay between queries
            time.sleep(0.5)
            
            # Execute second query (2.5km) with enhanced retry
            response_2_5km = self.safe_request(overpass_url, params={'data': query_2_5km}, timeout=90)
            pois_2_5km = {}
            if response_2_5km and response_2_5km.status_code == 200:
                try:
                    pois_2_5km = response_2_5km.json()
                    logger.info(f"2.5km query returned {len(pois_2_5km.get('elements', []))} POIs for hotel {hotel_idx}")
                except json.JSONDecodeError as e:
                    logger.error(f"Invalid JSON from Overpass API (2.5km): {e}")
                    pois_2_5km = {}
            else:
                logger.warning(f"2.5km Overpass API request failed for hotel {hotel_idx}: {response_2_5km.status_code if response_2_5km else 'No response'}")
            
            self.request_counts['overpass'] += 2  # Two queries made
            
            # Combine results for saving
            combined_data = {
                'pois_1km': pois_1km,
                'pois_2_5km': pois_2_5km
            }
            
            # Save raw response
            try:
                raw_dir = self.OUTPUT_DIR / city / "raw"
                raw_dir.mkdir(parents=True, exist_ok=True)
                raw_file = raw_dir / f"overpass_{hotel_idx}.json"
                with open(raw_file, 'w') as f:
                    json.dump(combined_data, f, indent=2)
                logger.debug(f"Saved Overpass data to {raw_file}")
            except Exception as e:
                logger.error(f"Failed to save Overpass response: {e}")
            
            return combined_data
            
        except Exception as e:
            logger.error(f"Overpass API query failed for hotel {hotel_idx}: {e}")
        
        return {}

    def process_overpass_pois(self, overpass_data: Dict, hotel_lat: float, hotel_lng: float) -> Dict:
        """Process Overpass API POI data"""
        if not overpass_data:
            logger.warning("No POI data to process")
            return self.get_empty_locality_features()
        
        pois_1km_data = overpass_data.get('pois_1km', {})
        pois_2_5km_data = overpass_data.get('pois_2_5km', {})
        
        # Initialize counters for 1km POIs
        counts_1km = {
            'hospitals': 0,
            'pharmacies': 0,
            'banks': 0,
            'restaurants': 0,
            'shopping': 0,
            'parks': 0
        }
        
        # Initialize counters for 2.5km POIs
        counts_2_5km = {
            'fuel_stations': 0,
            'ev_charging': 0,
            'entertainment': 0,
            'public_transport': 0
        }
        
        # Process 1km POIs
        if 'elements' in pois_1km_data:
            logger.info(f"Processing {len(pois_1km_data['elements'])} 1km POI elements")
            for element in pois_1km_data['elements']:
                if element.get('type') != 'node':
                    continue
                
                tags = element.get('tags', {})
                amenity = tags.get('amenity', '')
                shop = tags.get('shop', '')
                leisure = tags.get('leisure', '')
                
                # Count POIs by category (no distance check needed since query already filtered)
                if amenity in ['hospital', 'clinic', 'doctors']:
                    counts_1km['hospitals'] += 1
                elif amenity == 'pharmacy':
                    counts_1km['pharmacies'] += 1
                elif amenity in ['bank', 'atm']:
                    counts_1km['banks'] += 1
                elif amenity in ['restaurant', 'cafe', 'food_court', 'fast_food']:
                    counts_1km['restaurants'] += 1
                elif shop in ['supermarket', 'mall', 'department_store']:
                    counts_1km['shopping'] += 1
                elif leisure in ['park', 'playground', 'garden']:
                    counts_1km['parks'] += 1
        
        # Process 2.5km POIs
        if 'elements' in pois_2_5km_data:
            logger.info(f"Processing {len(pois_2_5km_data['elements'])} 2.5km POI elements")
            for element in pois_2_5km_data['elements']:
                if element.get('type') != 'node':
                    continue
                
                tags = element.get('tags', {})
                amenity = tags.get('amenity', '')
                public_transport = tags.get('public_transport', '')
                railway = tags.get('railway', '')
                aeroway = tags.get('aeroway', '')
                
                # Count POIs by category (no distance check needed since query already filtered)
                if amenity == 'fuel':
                    counts_2_5km['fuel_stations'] += 1
                elif amenity == 'charging_station':
                    counts_2_5km['ev_charging'] += 1
                elif amenity in ['cinema', 'theatre']:
                    counts_2_5km['entertainment'] += 1
                elif (public_transport in ['station', 'stop_position'] or 
                      railway == 'station' or 
                      aeroway in ['aerodrome', 'terminal']):
                    counts_2_5km['public_transport'] += 1
        
        logger.info(f"1km POI counts: {counts_1km}")
        logger.info(f"2.5km POI counts: {counts_2_5km}")
        
        return self.calculate_locality_scores_from_counts_separate(counts_1km, counts_2_5km)

    def calculate_locality_scores_from_counts_separate(self, counts_1km: Dict[str, int], 
                                                     counts_2_5km: Dict[str, int]) -> Dict:
        """Calculate locality scores based on POI counts from separate queries"""
        features = self.get_empty_locality_features()
        
        # Count-based scoring with increased ideal counts
        features['hospital_score'] = self.calculate_category_score_by_count(
            counts_1km['hospitals'], ideal_count=5, max_score=100
        )
        
        features['pharmacy_score'] = self.calculate_category_score_by_count(
            counts_1km['pharmacies'], ideal_count=8, max_score=100
        )
        
        features['bank_score'] = self.calculate_category_score_by_count(
            counts_1km['banks'], ideal_count=10, max_score=100
        )
        
        features['restaurant_score'] = self.calculate_category_score_by_count(
            counts_1km['restaurants'], ideal_count=25, max_score=100
        )
        
        features['shopping_score'] = self.calculate_category_score_by_count(
            counts_1km['shopping'], ideal_count=8, max_score=100
        )
        
        features['green_space_score'] = self.calculate_category_score_by_count(
            counts_1km['parks'], ideal_count=5, max_score=100
        )
        
        features['entertainment_score'] = self.calculate_category_score_by_count(
            counts_2_5km['entertainment'], ideal_count=5, max_score=100
        )
        
        # Store all counts - ENSURE THESE ARE SAVED TO THE DATASET
        features['hospitals_count_1km'] = counts_1km['hospitals']
        features['pharmacies_count_1km'] = counts_1km['pharmacies']
        features['banks_count_1km'] = counts_1km['banks']
        features['restaurants_count_1km'] = counts_1km['restaurants']
        features['shopping_count_1km'] = counts_1km['shopping']
        features['parks_count_1km'] = counts_1km['parks']
        features['fuel_stations_count_2_5km'] = counts_2_5km['fuel_stations']
        features['ev_charging_count_2_5km'] = counts_2_5km['ev_charging']
        features['entertainment_count_2_5km'] = counts_2_5km['entertainment']
        features['transport_hubs_count_2_5km'] = counts_2_5km['public_transport']
        
        # Calculate composite scores
        features['walkability_score'] = min(100, int((
            features['hospital_score'] * 0.2 +
            features['pharmacy_score'] * 0.2 +
            features['shopping_score'] * 0.25 +
            features['restaurant_score'] * 0.2 +
            features['bank_score'] * 0.15
        )))
        
        features['locality_score'] = min(100, int((
            features['walkability_score'] * 0.4 +
            features['shopping_score'] * 0.15 +
            features['restaurant_score'] * 0.15 +
            features['entertainment_score'] * 0.15 +
            features['green_space_score'] * 0.1 +
            (counts_2_5km['fuel_stations'] * 2) +
            (counts_2_5km['public_transport'] * 3)
        )))
        
        logger.info(f"Calculated locality scores: walkability={features['walkability_score']}, locality={features['locality_score']}")
        logger.info(f"Final POI counts - hospitals={counts_1km['hospitals']}, pharmacies={counts_1km['pharmacies']}, banks={counts_1km['banks']}, restaurants={counts_1km['restaurants']}, shopping={counts_1km['shopping']}, parks={counts_1km['parks']}")
        
        return features

    def enrich_with_overpass(self, hotels: List[Dict], city: str) -> List[Dict]:
        """Enrich hotel data with Overpass API POI data"""
        logger.info(f"Starting Overpass API enrichment for {len(hotels)} hotels in {city}")
        
        enriched_hotels = []
        successful_enrichments = 0
        
        for idx, hotel in enumerate(hotels):
            lat = hotel.get('location', {}).get('latitude')
            lng = hotel.get('location', {}).get('longitude')
            
            if not lat or not lng:
                logger.warning(f"Hotel {idx}: No coordinates available")
                hotel.update(self.get_empty_locality_features())
                enriched_hotels.append(hotel)
                continue
            
            enriched_hotel = hotel.copy()
            
            try:
                logger.info(f"Enriching hotel {idx + 1}/{len(hotels)} at coordinates {lat}, {lng}")
                
                # Query Overpass API for POIs around this hotel
                overpass_data = self.query_overpass_pois(lat, lng, city, idx)
                
                if overpass_data and ('pois_1km' in overpass_data or 'pois_2_5km' in overpass_data):
                    # Process POI data and calculate locality features
                    locality_features = self.process_overpass_pois(overpass_data, lat, lng)
                    
                    # Add locality features to hotel data
                    enriched_hotel.update(locality_features)
                    
                    if locality_features.get('locality_score', 0) > 0:
                        successful_enrichments += 1
                        logger.info(f"Hotel {idx}: Successfully enriched with locality score {locality_features.get('locality_score', 0)}")
                    else:
                        logger.warning(f"Hotel {idx}: Enrichment produced zero locality score")
                else:
                    logger.warning(f"Hotel {idx}: No POI data received from Overpass API")
                    enriched_hotel.update(self.get_empty_locality_features())
                
            except Exception as e:
                logger.error(f"Overpass enrichment failed for hotel {idx}: {e}")
                enriched_hotel.update(self.get_empty_locality_features())
            
            enriched_hotels.append(enriched_hotel)
            
            # Longer delay between requests to avoid rate limiting
            if idx < len(hotels) - 1:  # Don't sleep after the last request
                time.sleep(2)  # Increased delay to 2 seconds
        
        logger.info(f"Overpass enrichment completed: {successful_enrichments}/{len(hotels)} hotels successfully enriched")
        
        # Save enriched data for progress tracking
        city_dir = self.OUTPUT_DIR / city
        enriched_file = city_dir / "hotels_enriched.json"
        try:
            with open(enriched_file, 'w') as f:
                json.dump(enriched_hotels, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save enriched hotels: {e}")
        
        return enriched_hotels

    def calculate_category_score_by_count(self, count: int, ideal_count: int, max_score: int) -> int:
        """Calculate score for a POI category based on count only"""
        if count == 0:
            return 0
        
        # Score based on count with diminishing returns after ideal count
        if count <= ideal_count:
            score_ratio = count / ideal_count
        else:
            # Diminishing returns after ideal count
            excess = count - ideal_count
            score_ratio = 1.0 + (excess / ideal_count) * 0.2  # 20% bonus for excess, diminishing
            score_ratio = min(score_ratio, 1.3)  # Cap at 130% of base score
        
        return min(int(score_ratio * max_score), max_score)

    def get_empty_locality_features(self) -> Dict:
        """Return empty locality features structure"""
        return {
            'walkability_score': 0,
            'shopping_score': 0,
            'restaurant_score': 0,
            'bank_score': 0,
            'green_space_score': 0,
            'hospital_score': 0,
            'pharmacy_score': 0,
            'entertainment_score': 0,
            'locality_score': 0,
            'hospitals_count_1km': 0,
            'pharmacies_count_1km': 0,
            'banks_count_1km': 0,
            'restaurants_count_1km': 0,
            'shopping_count_1km': 0,
            'parks_count_1km': 0,
            'fuel_stations_count_2_5km': 0,
            'ev_charging_count_2_5km': 0,
            'entertainment_count_2_5km': 0,
            'transport_hubs_count_2_5km': 0
        }

    def process_hotels_data(self, hotels: List[Dict], city_config: CityConfig) -> Tuple[List[Dict], List[Dict], List[Dict]]:
        """Process hotel data and create datasets"""
        logger.info(f"Processing {len(hotels)} hotels for {city_config.name}")
        
        processed_hotels = []
        hotel_reviews = []
        hotel_landmarks = []
        
        # Process each hotel
        for idx, hotel in enumerate(hotels):
            hotel_id = f"{city_config.name.lower()[:3]}{str(idx+1).zfill(3)}"
            
            # Extract location
            location = hotel.get('location', {})
            hotel_lat = location.get('latitude')
            hotel_lng = location.get('longitude')
            
            if not hotel_lat or not hotel_lng:
                logger.warning(f"Skipping hotel {idx} - missing coordinates")
                continue
            
            # Extract Google Maps links safely
            google_maps_links = hotel.get('googleMapsLinks', {})
            
            # Basic hotel information
            processed_hotel = {
                'hotel_id': hotel_id,
                'place_id': hotel.get('id', ''),
                'display_name': hotel.get('displayName', {}).get('text', '') if isinstance(hotel.get('displayName'), dict) else str(hotel.get('displayName', '')),
                'formatted_address': hotel.get('formattedAddress', ''),
                'latitude': hotel_lat,
                'longitude': hotel_lng,
                'rating': hotel.get('rating'),
                'user_rating_count': hotel.get('userRatingCount'),
                'price_level': hotel.get('priceLevel'),
                'business_status': hotel.get('businessStatus', ''),
                'city': city_config.name,
                
                # Google Maps URLs
                'place_uri': google_maps_links.get('placeUri', hotel.get('googleMapsUri', '')),
                'directions_uri': google_maps_links.get('directionsUri', ''),
                'reviews_uri': google_maps_links.get('reviewsUri', ''),
                'photos_uri': google_maps_links.get('photosUri', ''),
                'write_review_uri': google_maps_links.get('writeAReviewUri', ''),
                
                'website_uri': hotel.get('websiteUri', ''),
                'phone_number': hotel.get('nationalPhoneNumber', ''),
                'international_phone': hotel.get('internationalPhoneNumber', ''),
                'opening_hours': json.dumps(hotel.get('regularOpeningHours', {})) if hotel.get('regularOpeningHours') else None,
                'types': json.dumps(hotel.get('types', [])),
                'editorial_summary': hotel.get('editorialSummary', {}).get('text', '') if isinstance(hotel.get('editorialSummary'), dict) else hotel.get('editorialSummary', ''),
                
                # Atmosphere fields (Enterprise + Atmosphere SKU)
                'serves_vegetarian_food': hotel.get('servesVegetarianFood'),
                'serves_breakfast': hotel.get('servesBreakfast'),
                'serves_lunch': hotel.get('servesLunch'),
                'serves_dinner': hotel.get('servesDinner'),
                'serves_brunch': hotel.get('servesBrunch'),
                'serves_beer': hotel.get('servesBeer'),
                'serves_wine': hotel.get('servesWine'),
                'serves_cocktails': hotel.get('servesCocktails'),
                'allows_dogs': hotel.get('allowsDogs'),
                'good_for_children': hotel.get('goodForChildren'),
                'good_for_groups': hotel.get('goodForGroups'),
                'good_for_watching_sports': hotel.get('goodForWatchingSports'),
                'live_music': hotel.get('liveMusic'),
                'menu_for_children': hotel.get('menuForChildren'),
                'outdoor_seating': hotel.get('outdoorSeating'),
                'reservable': hotel.get('reservable'),
                'delivery': hotel.get('delivery'),
                'takeout': hotel.get('takeout'),
                'curbside_pickup': hotel.get('curbsidePickup'),
                'dine_in': hotel.get('dineIn'),
                'restroom': hotel.get('restroom'),
                
                # Accessibility and payment options
                'wheelchair_accessible_entrance': hotel.get('accessibilityOptions', {}).get('wheelchairAccessibleEntrance') if hotel.get('accessibilityOptions') else None,
                'wheelchair_accessible_parking': hotel.get('accessibilityOptions', {}).get('wheelchairAccessibleParking') if hotel.get('accessibilityOptions') else None,
                'accepts_credit_cards': hotel.get('paymentOptions', {}).get('acceptsCreditCards') if hotel.get('paymentOptions') else None,
                'accepts_debit_cards': hotel.get('paymentOptions', {}).get('acceptsDebitCards') if hotel.get('paymentOptions') else None,
                'accepts_cash_only': hotel.get('paymentOptions', {}).get('acceptsCashOnly') if hotel.get('paymentOptions') else None,
                
                # Parking options
                'parking_free': hotel.get('parkingOptions', {}).get('freeParkingLot') if hotel.get('parkingOptions') else None,
                'parking_paid': hotel.get('parkingOptions', {}).get('paidParking') if hotel.get('parkingOptions') else None,
                'parking_street': hotel.get('parkingOptions', {}).get('freeStreetParking') if hotel.get('parkingOptions') else None,
                'parking_garage': hotel.get('parkingOptions', {}).get('freeGarageParking') if hotel.get('parkingOptions') else None,
                'valet_parking': hotel.get('parkingOptions', {}).get('valetParking') if hotel.get('parkingOptions') else None,
                
                # EV charging and fuel options
                'ev_charging_available': hotel.get('evChargeOptions', {}).get('connectorCount', 0) > 0 if hotel.get('evChargeOptions') else False,
                'fuel_options': json.dumps(hotel.get('fuelOptions', {})) if hotel.get('fuelOptions') else None,
                
                # Locality scores from Overpass enrichment
                'walkability_score': hotel.get('walkability_score', 0),
                'shopping_score': hotel.get('shopping_score', 0),
                'restaurant_score': hotel.get('restaurant_score', 0),
                'bank_score': hotel.get('bank_score', 0),
                'green_space_score': hotel.get('green_space_score', 0),
                'hospital_score': hotel.get('hospital_score', 0),
                'pharmacy_score': hotel.get('pharmacy_score', 0),
                'entertainment_score': hotel.get('entertainment_score', 0),
                'locality_score': hotel.get('locality_score', 0),

                #POI Counts
                'hospitals_count_1km': hotel.get('hospitals_count_1km', 0),
                'pharmacies_count_1km': hotel.get('pharmacies_count_1km', 0),
                'banks_count_1km': hotel.get('banks_count_1km', 0),
                'restaurants_count_1km': hotel.get('restaurants_count_1km', 0),
                'shopping_count_1km': hotel.get('shopping_count_1km', 0),
                'parks_count_1km': hotel.get('parks_count_1km', 0),
                'fuel_stations_count_2_5km': hotel.get('fuel_stations_count_2_5km', 0),
                'ev_charging_count_2_5km': hotel.get('ev_charging_count_2_5km', 0),
                'entertainment_count_2_5km': hotel.get('entertainment_count_2_5km', 0),
                'transport_hubs_count_2_5km': hotel.get('transport_hubs_count_2_5km', 0),
            }
            
            processed_hotels.append(processed_hotel)
            
            # Process reviews if available
            if hotel.get('reviews'):
                for review_idx, review in enumerate(hotel['reviews'][:5]):
                    review_data = {
                        'hotel_id': hotel_id,
                        'review_id': f"{hotel_id}_r{review_idx+1}",
                        'author_name': review.get('authorAttribution', {}).get('displayName', '') if isinstance(review.get('authorAttribution'), dict) else '',
                        'rating': review.get('rating'),
                        'text': review.get('text', {}).get('text', '') if isinstance(review.get('text'), dict) else review.get('text', ''),
                        'publish_time': review.get('publishTime', ''),
                        'relative_time': review.get('relativePublishTimeDescription', ''),
                    }
                    hotel_reviews.append(review_data)
        
        # Calculate distances to landmarks using Routes API
        if processed_hotels:
            logger.info(f"Calculating distances to landmarks for {len(processed_hotels)} hotels")
            hotel_landmarks = self.calculate_landmark_distances(processed_hotels, city_config)
        
        return processed_hotels, hotel_reviews, hotel_landmarks

    def get_route_matrix_batch(self, origins: List[Dict], destinations: List[Dict], 
                              city: str) -> Dict:
        """Handle large route matrix requests by batching"""
        all_results = []
        batch_size = 25  # Conservative batch size to stay under 625 limit
        
        for i in range(0, len(origins), batch_size):
            origin_batch = origins[i:i+batch_size]
            result = self.get_route_matrix(origin_batch, destinations, city)
            
            if result and 'matrix' in result:
                # Adjust origin indices for batching
                for element in result['matrix']:
                    if 'originIndex' in element:
                        element['originIndex'] += i
                all_results.extend(result['matrix'])
            
            time.sleep(0.1)  # Small delay between batches
        
        return {'matrix': all_results}

    def calculate_landmark_distances(self, hotels: List[Dict], city_config: CityConfig) -> List[Dict]:
        """Calculate distances to landmarks using Routes API and fallback to straight-line distance"""
        hotel_landmarks = []
        
        # Prepare origins (hotels) and destinations (landmarks)
        hotel_coords = []
        for hotel in hotels:
            hotel_coords.append({
                'lat': hotel['latitude'],
                'lng': hotel['longitude'],
                'hotel_id': hotel['hotel_id']
            })
        
        landmark_coords = []
        landmarks_list = list(city_config.landmarks.items())
        for landmark_key, landmark_data in landmarks_list:
            landmark_coords.append({
                'lat': landmark_data['lat'],
                'lng': landmark_data['lng'],
                'landmark_key': landmark_key,
                'landmark_name': landmark_data['name']
            })
        
        # Try to get route matrix from Google Routes API
        logger.info(f"Calculating route matrix for {len(hotel_coords)} hotels to {len(landmark_coords)} landmarks")
        route_data = self.get_route_matrix(hotel_coords, landmark_coords, city_config.name)
        
        # Process route matrix results or fall back to straight-line distance
        for hotel_idx, hotel in enumerate(hotels):
            hotel_id = hotel['hotel_id']
            hotel_lat = hotel['latitude']
            hotel_lng = hotel['longitude']
            
            for landmark_idx, (landmark_key, landmark_data) in enumerate(landmarks_list):
                landmark_name = landmark_data['name']
                landmark_lat = landmark_data['lat']
                landmark_lng = landmark_data['lng']
                
                # Try to find route data
                distance_km = None
                travel_time_minutes = None
                traffic_aware = False
                
                if route_data and 'matrix' in route_data and route_data['matrix']:
                    # Look for matching element in route matrix
                    for element in route_data['matrix']:
                        if (element.get('originIndex') == hotel_idx and 
                            element.get('destinationIndex') == landmark_idx):
                            
                            status = element.get('status', {})
                            if isinstance(status, dict):
                                status_code = status.get('code')
                            else:
                                status_code = status
                            
                            if status_code == 'OK' or status_code == 0:
                                distance_meters = element.get('distanceMeters', 0)
                                if diestance_meters > 0:
                                    distance_km = distance_meters / 1000
                                    
                                    duration_data = element.get('duration', {})
                                    if isinstance(duration_data, dict):
                                        duration_seconds = duration_data.get('seconds', 0)
                                    elif isinstance(duration_data, str) and duration_data.endswith('s'):
                                        try:
                                            duration_seconds = int(duration_data[:-1])
                                        except ValueError:
                                            duration_seconds = 0
                                    else:
                                        duration_seconds = 0
                                    
                                    if duration_seconds > 0:
                                        travel_time_minutes = duration_seconds / 60
                                        traffic_aware = True
                                        logger.debug(f"Routes API: {hotel_id} to {landmark_key}: {distance_km:.2f}km, {travel_time_minutes:.1f}min")
                                        break
                
                # Fallback to straight-line distance if no route data
                if distance_km is None:
                    distance_km = self.calculate_distance(hotel_lat, hotel_lng, landmark_lat, landmark_lng)
                    traffic_aware = False
                    logger.debug(f"Straight-line: {hotel_id} to {landmark_key}: {distance_km:.2f}km")
                
                hotel_landmarks.append({
                    'hotel_id': hotel_id,
                    'landmark_type': landmark_key,
                    'landmark_name': landmark_name,
                    'distance_km': round(distance_km, 2),
                    'travel_time_minutes': round(travel_time_minutes, 1) if travel_time_minutes else None,
                    'traffic_aware': traffic_aware
                })
        
        logger.info(f"Generated {len(hotel_landmarks)} hotel-landmark combinations")
        return hotel_landmarks

    def safe_request(self, url: str, params: dict = None, timeout: int = 60, max_retries: int = 5) -> Optional[requests.Response]:
        """Enhanced safe HTTP request with multiple retry attempts"""
        for attempt in range(max_retries):
            try:
                self.rotate_headers()
                
                # Progressive delay between attempts
                if attempt > 0:
                    delay = min(random.uniform(3, 8) * (attempt + 1), 30)  # Cap at 30 seconds
                    logger.info(f"Retry attempt {attempt + 1} for Overpass API, waiting {delay:.1f} seconds")
                    time.sleep(delay)
                else:
                    time.sleep(random.uniform(1, 3))  # Initial delay
                
                response = self.session.get(url, params=params, timeout=timeout)
                
                if response.status_code == 200:
                    logger.debug(f"Successfully fetched {url} (attempt {attempt + 1})")
                    return response
                elif response.status_code == 429:  # Rate limited
                    wait_time = min(60, 10 * (attempt + 1))
                    logger.warning(f"Overpass API rate limited, waiting {wait_time} seconds")
                    time.sleep(wait_time)
                elif response.status_code == 504:  # Gateway timeout
                    logger.warning(f"Overpass API gateway timeout on attempt {attempt + 1}")
                    time.sleep(10)
                else:
                    response.raise_for_status()
                
            except requests.exceptions.Timeout:
                logger.warning(f"Timeout on attempt {attempt + 1} for {url}")
                if attempt == max_retries - 1:
                    logger.error(f"All attempts failed for {url} due to timeout")
                    
            except requests.exceptions.ConnectionError:
                logger.warning(f"Connection error on attempt {attempt + 1} for {url}")
                if attempt == max_retries - 1:
                    logger.error(f"All attempts failed for {url} due to connection error")
                    
            except requests.exceptions.HTTPError as e:
                logger.warning(f"HTTP error on attempt {attempt + 1} for {url}: {e}")
                if attempt == max_retries - 1:
                    logger.error(f"All attempts failed for {url} due to HTTP error: {e}")
                    
            except Exception as e:
                logger.warning(f"Unexpected error on attempt {attempt + 1} for {url}: {str(e)}")
                if attempt == max_retries - 1:
                    logger.error(f"All attempts failed for {url}: {str(e)}")
        
        return None

    def save_datasets(self, city: str, hotels: List[Dict], reviews: List[Dict], 
                     landmarks: List[Dict], locality_data: List[Dict] = None):
        """Save all datasets to CSV files"""
        output_dir = self.OUTPUT_DIR / city / "datasets"
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Save hotels dataset
        if hotels:
            hotels_file = output_dir / f"{city.lower()}_hotels.csv"
            with open(hotels_file, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=hotels[0].keys())
                writer.writeheader()
                writer.writerows(hotels)
            logger.info(f"Saved {len(hotels)} hotels to {hotels_file}")
        
        # Save reviews dataset
        if reviews:
            reviews_file = output_dir / f"{city.lower()}_reviews.csv"
            with open(reviews_file, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=reviews[0].keys())
                writer.writeheader()
                writer.writerows(reviews)
            logger.info(f"Saved {len(reviews)} reviews to {reviews_file}")
        
        # Save landmarks dataset
        if landmarks:
            landmarks_file = output_dir / f"{city.lower()}_hotel_landmarks.csv"
            with open(landmarks_file, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=landmarks[0].keys())
                writer.writeheader()
                writer.writerows(landmarks)
            logger.info(f"Saved {len(landmarks)} hotel-landmarks to {landmarks_file}")
        
        # Save locality dataset
        if locality_data:
            locality_file = output_dir / f"{city.lower()}_locality.csv"
            with open(locality_file, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=locality_data[0].keys())
                writer.writeheader()
                writer.writerows(locality_data)
            logger.info(f"Saved {len(locality_data)} locality records to {locality_file}")

    def create_locality_dataset(self, hotels: List[Dict]) -> List[Dict]:
        """Create locality dataset from enriched hotel data"""
        locality_data = []
        
        for hotel in hotels:
            locality_record = {
                'hotel_id': hotel['hotel_id'],
                'city': hotel.get('city', ''),
                'display_name': hotel['display_name'],
                'latitude': hotel['latitude'],
                'longitude': hotel['longitude'],
                'formatted_address': hotel['formatted_address'],
                
                # POI counts within specific radii
                'hospitals_count_1km': hotel.get('hospitals_count_1km', 0),
                'pharmacies_count_1km': hotel.get('pharmacies_count_1km', 0),
                'shopping_count_1km': hotel.get('shopping_count_1km', 0),
                'restaurants_count_1km': hotel.get('restaurants_count_1km', 0),
                'banks_count_1km': hotel.get('banks_count_1km', 0),
                'parks_count_1km': hotel.get('parks_count_1km', 0),
                'fuel_stations_count_2_5km': hotel.get('fuel_stations_count_2_5km', 0),
                'ev_charging_count_2_5km': hotel.get('ev_charging_count_2_5km', 0),
                'entertainment_count_2_5km': hotel.get('entertainment_count_2_5km', 0),
                'transport_hubs_count_2_5km': hotel.get('transport_hubs_count_2_5km', 0),
                
                # Locality scores
                'walkability_score': hotel.get('walkability_score', 0),
                'shopping_score': hotel.get('shopping_score', 0),
                'restaurant_score': hotel.get('restaurant_score', 0),
                'bank_score': hotel.get('bank_score', 0),
                'green_space_score': hotel.get('green_space_score', 0),
                'hospital_score': hotel.get('hospital_score', 0),
                'pharmacy_score': hotel.get('pharmacy_score', 0),
                'entertainment_score': hotel.get('entertainment_score', 0),
                'locality_score': hotel.get('locality_score', 0)
            }
            
            locality_data.append(locality_record)
        
        return locality_data

    def save_mappings(self, city: str, hotels: List[Dict]):
        """Save ID mappings for reference"""
        mappings_dir = self.OUTPUT_DIR / city / "mappings"
        mappings_dir.mkdir(parents=True, exist_ok=True)
        
        # Create hotel ID mapping
        hotel_mapping = []
        for hotel in hotels:
            mapping = {
                'hotel_id': hotel['hotel_id'],
                'place_id': hotel['place_id'],
                'display_name': hotel['display_name'],
                'formatted_address': hotel['formatted_address']
            }
            hotel_mapping.append(mapping)
        
        mapping_file = mappings_dir / f"{city.lower()}_hotel_mapping.csv"
        if hotel_mapping:
            with open(mapping_file, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=hotel_mapping[0].keys())
                writer.writeheader()
                writer.writerows(hotel_mapping)
            logger.info(f"Saved hotel mappings to {mapping_file}")

    def generate_report(self, city: str, hotels: List[Dict], reviews: List[Dict], landmarks: List[Dict]):
        """Generate comprehensive data quality and usage report"""
        report = {
            'city': city,
            'generated_at': datetime.now().isoformat(),
            'data_summary': {
                'hotels_count': len(hotels),
                'reviews_count': len(reviews),
                'landmarks_count': len(landmarks),
                'unique_place_ids': len(set(h.get('place_id', '') for h in hotels if h.get('place_id')))
            },
            'api_usage': dict(self.request_counts),
            'data_quality': self.analyze_data_quality(hotels),
            'field_completeness': self.analyze_field_completeness(hotels),
            'locality_analysis': self.analyze_locality_coverage(hotels)
        }
        
        # Save JSON report
        reports_dir = self.OUTPUT_DIR / city / "reports"
        reports_dir.mkdir(parents=True, exist_ok=True)
        
        json_report = reports_dir / f"{city.lower()}_report.json"
        with open(json_report, 'w') as f:
            json.dump(report, f, indent=2)
        
        logger.info(f"Generated report for {city}: {report['data_summary']}")
        return report

    def analyze_data_quality(self, hotels: List[Dict]) -> Dict:
        """Analyze data quality metrics"""
        if not hotels:
            return {}
        
        # Rating distribution
        ratings = [h.get('rating') for h in hotels if h.get('rating') is not None]
        rating_stats = {
            'avg_rating': round(sum(ratings) / len(ratings), 2) if ratings else None,
            'min_rating': min(ratings) if ratings else None,
            'max_rating': max(ratings) if ratings else None,
            'rating_count': len(ratings)
        }
        
        return {'rating_stats': rating_stats}

    def analyze_field_completeness(self, hotels: List[Dict]) -> Dict:
        """Analyze field completeness percentages"""
        if not hotels:
            return {}
        
        total_hotels = len(hotels)
        key_fields = ['rating', 'user_rating_count', 'phone_number', 'website_uri']
        
        field_completeness = {}
        for field in key_fields:
            non_null_count = sum(1 for hotel in hotels if hotel.get(field) is not None and hotel.get(field) != '')
            completeness = round((non_null_count / total_hotels) * 100, 1)
            field_completeness[field] = f"{completeness}%"
        
        return field_completeness

    def analyze_locality_coverage(self, hotels: List[Dict]) -> Dict:
        """Analyze locality feature coverage"""
        if not hotels:
            return {}
        
        total_hotels = len(hotels)
        locality_scores = [h.get('locality_score', 0) for h in hotels]
        avg_locality_score = round(sum(locality_scores) / len(locality_scores), 1) if locality_scores else 0
        
        return {
            'avg_locality_score': avg_locality_score,
            'overpass_enrichment_success': f"{sum(1 for h in hotels if h.get('locality_score', 0) > 0) / total_hotels * 100:.1f}%"
        }

    def process_city(self, city_name: str, max_hotels: int = 250):
        """Process a single city with comprehensive error handling and progress tracking"""
        city_configs = self.get_city_config()
        
        if city_name not in city_configs:
            logger.error(f"City {city_name} not found in configuration")
            return
        
        city_config = city_configs[city_name]
        if max_hotels is None:
            max_hotels = self.DEFAULT_PER_CITY
        
        logger.info(f"Starting data collection for {city_name} (max {max_hotels} hotels)")
        
        try:
            # Step 1: Search for hotels using Google Places API
            logger.info("Step 1: Searching for hotels with Google Places API...")
            hotels = self.search_hotels_text_search(city_config, max_hotels)
            if not hotels:
                logger.error(f"No hotels found for {city_name}")
                return
            
            # Step 2: Enrich with Overpass API
            logger.info("Step 2: Enriching hotels with Overpass API...")
            enriched_hotels = self.enrich_with_overpass(hotels, city_name)
            
            # Step 3: Process hotels data and calculate distances
            logger.info("Step 3: Processing hotel data and calculating distances...")
            processed_hotels, hotel_reviews, hotel_landmarks = self.process_hotels_data(
                enriched_hotels, city_config
            )
            
            # Step 4: Create locality dataset
            logger.info("Step 4: Creating locality dataset...")
            locality_data = self.create_locality_dataset(processed_hotels)
            
            # Step 5: Save all datasets
            logger.info("Step 5: Saving datasets...")
            self.save_datasets(city_name, processed_hotels, hotel_reviews, hotel_landmarks, locality_data)
            
            # Step 6: Save mappings and generate report
            logger.info("Step 6: Saving mappings and generating report...")
            self.save_mappings(city_name, processed_hotels)
            self.generate_report(city_name, processed_hotels, hotel_reviews, hotel_landmarks)
            
            logger.info(f"Completed data collection for {city_name}")
            logger.info(f"Final stats - Hotels: {len(processed_hotels)}, Reviews: {len(hotel_reviews)}, "
                    f"Landmarks: {len(hotel_landmarks)}")

        except Exception as e:
            logger.error(f"Critical error processing {city_name}: {e}")
            raise

    def run_all_cities(self):
        """Run data collection for all cities and create consolidated All India datasets"""
        city_configs = self.get_city_config()
        
        # Track successful cities for consolidation
        successful_cities = []
        
        for city_name in city_configs.keys():
            try:
                logger.info(f"Processing {city_name}...")
                self.process_city(city_name, self.DEFAULT_PER_CITY)
                successful_cities.append(city_name)
                logger.info(f"Successfully completed {city_name}")
            except Exception as e:
                logger.error(f"Failed to process {city_name}: {e}")
                continue
            
            # Brief pause between cities
            time.sleep(2)
        
        # Create consolidated All India datasets
        if successful_cities:
            logger.info("Creating consolidated All India datasets...")
            self.create_all_india_datasets(successful_cities)
        else:
            logger.warning("No cities processed successfully. Skipping All India datasets creation.")

    def create_all_india_datasets(self, cities: List[str]):
        """Create consolidated All India datasets from all processed cities"""
        logger.info(f"Consolidating datasets from {len(cities)} cities: {', '.join(cities)}")
        
        # Initialize consolidated data structures
        all_hotels = []
        all_reviews = []
        all_landmarks = []
        all_localities = []
        
        # Collect data from each city
        for city in cities:
            try:
                city_datasets_dir = self.OUTPUT_DIR / city / "datasets"
                
                # Load city hotels
                hotels_file = city_datasets_dir / f"{city.lower()}_hotels.csv"
                if hotels_file.exists():
                    hotels_data = self.load_csv_data(hotels_file)
                    all_hotels.extend(hotels_data)
                    logger.info(f"Added {len(hotels_data)} hotels from {city}")
                
                # Load city reviews
                reviews_file = city_datasets_dir / f"{city.lower()}_reviews.csv"
                if reviews_file.exists():
                    reviews_data = self.load_csv_data(reviews_file)
                    all_reviews.extend(reviews_data)
                    logger.info(f"Added {len(reviews_data)} reviews from {city}")
                
                # Load city landmarks
                landmarks_file = city_datasets_dir / f"{city.lower()}_hotel_landmarks.csv"
                if landmarks_file.exists():
                    landmarks_data = self.load_csv_data(landmarks_file)
                    all_landmarks.extend(landmarks_data)
                    logger.info(f"Added {len(landmarks_data)} landmarks from {city}")
                
                # Load city localities
                locality_file = city_datasets_dir / f"{city.lower()}_locality.csv"
                if locality_file.exists():
                    locality_data = self.load_csv_data(locality_file)
                    all_localities.extend(locality_data)
                    logger.info(f"Added {len(locality_data)} localities from {city}")
                    
            except Exception as e:
                logger.error(f"Failed to load data from {city}: {e}")
                continue
        
        # Save consolidated datasets
        all_india_dir = self.OUTPUT_DIR / "All_India" / "datasets"
        all_india_dir.mkdir(parents=True, exist_ok=True)
        
        # Save All India Hotels dataset
        if all_hotels:
            hotels_file = all_india_dir / "all_india_hotels.csv"
            self.save_csv_data(hotels_file, all_hotels)
            logger.info(f"Saved {len(all_hotels)} hotels to All India dataset")
        
        # Save All India Reviews dataset
        if all_reviews:
            reviews_file = all_india_dir / "all_india_reviews.csv"
            self.save_csv_data(reviews_file, all_reviews)
            logger.info(f"Saved {len(all_reviews)} reviews to All India dataset")
        
        # Save All India Landmarks dataset
        if all_landmarks:
            landmarks_file = all_india_dir / "all_india_hotel_landmarks.csv"
            self.save_csv_data(landmarks_file, all_landmarks)
            logger.info(f"Saved {len(all_landmarks)} landmarks to All India dataset")
        
        # Save All India Localities dataset
        if all_localities:
            localities_file = all_india_dir / "all_india_locality.csv"
            self.save_csv_data(localities_file, all_localities)
            logger.info(f"Saved {len(all_localities)} localities to All India dataset")
        
        # Generate All India summary report
        self.generate_all_india_report(cities, all_hotels, all_reviews, all_landmarks, all_localities)
        
        logger.info("Successfully created All India consolidated datasets")

    def load_csv_data(self, file_path: Path) -> List[Dict]:
        """Load data from CSV file"""
        data = []
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                data = list(reader)
        except Exception as e:
            logger.error(f"Failed to load CSV data from {file_path}: {e}")
        return data

    def save_csv_data(self, file_path: Path, data: List[Dict]):
        """Save data to CSV file"""
        if not data:
            logger.warning(f"No data to save to {file_path}")
            return
        
        try:
            with open(file_path, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=data[0].keys())
                writer.writeheader()
                writer.writerows(data)
        except Exception as e:
            logger.error(f"Failed to save CSV data to {file_path}: {e}")

    def generate_all_india_report(self, cities: List[str], hotels: List[Dict], 
                                 reviews: List[Dict], landmarks: List[Dict], 
                                 localities: List[Dict]):
        """Generate comprehensive All India summary report"""
        
        # Calculate statistics
        total_hotels = len(hotels)
        total_reviews = len(reviews)
        total_landmarks = len(landmarks)
        total_localities = len(localities)
        
        # City-wise breakdown
        city_breakdown = {}
        for city in cities:
            city_hotels = [h for h in hotels if h.get('city') == city]
            city_reviews = [r for r in reviews if r['hotel_id'].startswith(city.lower()[:3])]
            city_landmarks = [l for l in landmarks if l['hotel_id'].startswith(city.lower()[:3])]
            city_localities = [loc for loc in localities if loc.get('city') == city]
            
            city_breakdown[city] = {
                'hotels': len(city_hotels),
                'reviews': len(city_reviews),
                'landmarks': len(city_landmarks),
                'localities': len(city_localities)
            }
        
        # Overall statistics
        avg_rating = 0
        avg_locality_score = 0
        avg_walkability_score = 0
        
        if hotels:
            ratings = [float(h.get('rating', 0)) for h in hotels if h.get('rating') and h.get('rating') != '']
            avg_rating = round(sum(ratings) / len(ratings), 2) if ratings else 0
        
        if localities:
            locality_scores = [float(loc.get('locality_score', 0)) for loc in localities if loc.get('locality_score')]
            avg_locality_score = round(sum(locality_scores) / len(locality_scores), 1) if locality_scores else 0
            
            walkability_scores = [float(loc.get('walkability_score', 0)) for loc in localities if loc.get('walkability_score')]
            avg_walkability_score = round(sum(walkability_scores) / len(walkability_scores), 1) if walkability_scores else 0
        
        # Create comprehensive report
        report = {
            'generated_at': datetime.now().isoformat(),
            'summary': {
                'total_cities_processed': len(cities),
                'total_hotels': total_hotels,
                'total_reviews': total_reviews,
                'total_landmarks': total_landmarks,
                'total_localities': total_localities,
                'cities_included': cities
            },
            'statistics': {
                'average_hotel_rating': avg_rating,
                'average_locality_score': avg_locality_score,
                'average_walkability_score': avg_walkability_score,
                'hotels_per_city_avg': round(total_hotels / len(cities), 1) if cities else 0
            },
            'city_breakdown': city_breakdown,
            'data_quality': {
                'hotels_with_ratings': len([h for h in hotels if h.get('rating') and h.get('rating') != '']),
                'hotels_with_phone': len([h for h in hotels if h.get('phone_number') and h.get('phone_number') != '']),
                'hotels_with_website': len([h for h in hotels if h.get('website_uri') and h.get('website_uri') != '']),
                'landmarks_with_travel_time': len([l for l in landmarks if l.get('travel_time_minutes') and l.get('travel_time_minutes') != '']),
                'localities_with_nonzero_scores': len([loc for loc in localities if float(loc.get('locality_score', 0)) > 0])
            },
            'top_cities_by_hotel_count': sorted(city_breakdown.items(), 
                                              key=lambda x: x[1]['hotels'], 
                                              reverse=True)[:10],
            'api_usage_summary': dict(self.request_counts)
        }
        
        # Save All India report
        reports_dir = self.OUTPUT_DIR / "All_India" / "reports"
        reports_dir.mkdir(parents=True, exist_ok=True)
        
        report_file = reports_dir / "all_india_summary_report.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        # Also create a summary CSV for easy analysis
        summary_csv_data = []
        for city, stats in city_breakdown.items():
            summary_csv_data.append({
                'city': city,
                'hotels_count': stats['hotels'],
                'reviews_count': stats['reviews'],
                'landmarks_count': stats['landmarks'],
                'localities_count': stats['localities']
            })
        
        summary_csv_file = reports_dir / "all_india_city_summary.csv"
        if summary_csv_data:
            with open(summary_csv_file, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=summary_csv_data[0].keys())
                writer.writeheader()
                writer.writerows(summary_csv_data)
        
        logger.info(f"Generated All India report: {report['summary']}")
        logger.info(f"All India report saved to {report_file}")
        
        # Print summary to console
        print("\n" + "="*60)
        print("ALL INDIA DATASET CONSOLIDATION SUMMARY")
        print("="*60)
        print(f"Cities Processed: {len(cities)}")
        print(f"Total Hotels: {total_hotels:,}")
        print(f"Total Reviews: {total_reviews:,}")
        print(f"Total Landmarks: {total_landmarks:,}")
        print(f"Total Localities: {total_localities:,}")
        print(f"Average Hotel Rating: {avg_rating}")
        print(f"Average Locality Score: {avg_locality_score}")
        print(f"Average Walkability Score: {avg_walkability_score}")
        print("\nTop 5 Cities by Hotel Count:")
        for city, stats in sorted(city_breakdown.items(), key=lambda x: x[1]['hotels'], reverse=True)[:5]:
            print(f"  {city}: {stats['hotels']} hotels")
        print("="*60)

def main():
    parser = argparse.ArgumentParser(description="Hotel Data Fetching Script")
    parser.add_argument("--all", action="store_true", help="Process all cities")
    parser.add_argument("--city", type=str, help="Process specific city")
    parser.add_argument("--per-city", type=int, help="Number of hotels per city")
    parser.add_argument("--test", action="store_true", help="Run test mode")
    
    args = parser.parse_args()
    
    try:
        fetcher = HotelDataFetcher()
        
        if args.test:
            fetcher.run_test()
        elif args.all:
            fetcher.run_all_cities()
        elif args.city:
            per_city = args.per_city or fetcher.DEFAULT_PER_CITY
            fetcher.process_city(args.city, per_city)
        else:
            # Default to test mode to avoid wasting API calls
            logger.info("No specific action specified. Running test mode.")
            fetcher.run_test()
            
    except KeyboardInterrupt:
        logger.info("Process interrupted by user")
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        raise

if __name__ == "__main__":
    main()

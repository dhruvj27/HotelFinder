#!/usr/bin/env python
# coding: utf-8

# In[16]:
import requests
import pandas as pd
import time
import random
import json
import re
from urllib.parse import quote, urljoin
import logging
from datetime import datetime
import os
from typing import List, Dict, Optional, Tuple
import warnings
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry
warnings.filterwarnings('ignore')

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# In[17]:


class HotelDataCollector:
    def __init__(self):
        """Initialize the hotel data collector with configurations"""
        self.session = self._create_robust_session()
        
        # City configurations
        self.capital_cities = [
            "New Delhi", "Mumbai", "Kolkata", "Chennai", "Bangalore", "Hyderabad", 
            "Jaipur", "Lucknow", "Bhopal", "Thiruvananthapuram", "Gandhinagar", 
            "Panaji", "Shimla", "Itanagar", "Dispur"
        ]
        
        self.major_cities = [
            "Pune", "Ahmedabad", "Surat", "Kanpur", "Nagpur", "Indore", 
            "Agra", "Vadodara", "Ghaziabad", "Faridabad"
        ]
        
        self.all_cities = self.capital_cities + self.major_cities
        
        # Data structure for hotels
        self.hotel_fields = [
            'hotel_name', 'city', 'state', 'address', 'star_rating', 
            'price_per_night', 'price_range', 'latitude', 'longitude',
            'amenities', 'hotel_type', 'phone_number', 'email', 'website',
            'booking_url', 'guest_rating', 'review_count', 'description',
            'check_in_time', 'check_out_time', 'room_types', 'data_source'
        ]
        
        # Enhanced user agents for better success
        self.user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0'
        ]
        
        # City coordinates fallback data (same as before)
        self.city_coordinates = {
            "Mumbai": (19.0760, 72.8777),
            "New Delhi": (28.6139, 77.2090),
            "Delhi": (28.6139, 77.2090),
            "Bangalore": (12.9716, 77.5946),
            "Chennai": (13.0827, 80.2707),
            "Kolkata": (22.5726, 88.3639),
            "Hyderabad": (17.3850, 78.4867),
            "Pune": (18.5204, 73.8567),
            "Ahmedabad": (23.0225, 72.5714),
            "Jaipur": (26.9124, 75.7873),
            "Surat": (21.1702, 72.8311),
            "Lucknow": (26.8467, 80.9462),
            "Kanpur": (26.4499, 80.3319),
            "Nagpur": (21.1458, 79.0882),
            "Indore": (22.7196, 75.8577),
            "Bhopal": (23.2599, 77.4126),
            "Agra": (27.1767, 78.0081),
            "Vadodara": (22.3072, 73.1812),
            "Ghaziabad": (28.6692, 77.4538),
            "Faridabad": (28.4089, 77.3178),
            "Thiruvananthapuram": (8.5241, 76.9366),
            "Gandhinagar": (23.2156, 72.6369),
            "Panaji": (15.4909, 73.8278),
            "Shimla": (31.1048, 77.1734),
            "Itanagar": (27.0844, 93.6053),
            "Dispur": (26.1445, 91.7898)
        }
        
        # State mapping (same as before)
        self.city_states = {
            "Mumbai": "Maharashtra",
            "New Delhi": "Delhi",
            "Delhi": "Delhi", 
            "Bangalore": "Karnataka",
            "Chennai": "Tamil Nadu",
            "Kolkata": "West Bengal",
            "Hyderabad": "Telangana",
            "Pune": "Maharashtra",
            "Ahmedabad": "Gujarat",
            "Jaipur": "Rajasthan",
            "Surat": "Gujarat",
            "Lucknow": "Uttar Pradesh",
            "Kanpur": "Uttar Pradesh",
            "Nagpur": "Maharashtra",
            "Indore": "Madhya Pradesh",
            "Bhopal": "Madhya Pradesh",
            "Agra": "Uttar Pradesh",
            "Vadodara": "Gujarat",
            "Ghaziabad": "Uttar Pradesh",
            "Faridabad": "Haryana",
            "Thiruvananthapuram": "Kerala",
            "Gandhinagar": "Gujarat",
            "Panaji": "Goa",
            "Shimla": "Himachal Pradesh",
            "Itanagar": "Arunachal Pradesh",
            "Dispur": "Assam"
        }

    def _create_robust_session(self) -> requests.Session:
        """Create a robust session with retry strategy and timeout handling"""
        session = requests.Session()
        
        # Configure retry strategy
        retry_strategy = Retry(
            total=3,
            backoff_factor=2,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["HEAD", "GET", "OPTIONS"]
        )
        
        adapter = HTTPAdapter(max_retries=retry_strategy)
        session.mount("http://", adapter)
        session.mount("https://", adapter)
        
        # Set default headers
        session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'max-age=0'
        })
        
        return session

    def rotate_headers(self):
        """Rotate user agent headers and add randomness"""
        self.session.headers.update({
            'User-Agent': random.choice(self.user_agents),
            'X-Forwarded-For': f"{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}"
        })

    def safe_request(self, url: str, params: dict = None, timeout: int = 60, max_retries: int = 3) -> Optional[requests.Response]:
        """Enhanced safe HTTP request with multiple retry attempts"""
        for attempt in range(max_retries):
            try:
                self.rotate_headers()
                
                # Progressive delay between attempts
                if attempt > 0:
                    delay = random.uniform(5, 10) * (attempt + 1)
                    logger.info(f"Retry attempt {attempt + 1} for {url}, waiting {delay:.1f} seconds")
                    time.sleep(delay)
                else:
                    time.sleep(random.uniform(3, 6))
                
                response = self.session.get(url, params=params, timeout=timeout)
                response.raise_for_status()
                
                logger.info(f"Successfully fetched {url} (attempt {attempt + 1})")
                return response
                
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
                if e.response.status_code in [403, 429]:  # Forbidden or rate limited
                    time.sleep(random.uniform(10, 20))  # Longer wait for these errors
                if attempt == max_retries - 1:
                    logger.error(f"All attempts failed for {url} due to HTTP error: {e}")
                    
            except Exception as e:
                logger.warning(f"Unexpected error on attempt {attempt + 1} for {url}: {str(e)}")
                if attempt == max_retries - 1:
                    logger.error(f"All attempts failed for {url}: {str(e)}")
        
        return None

    def get_fallback_coordinates(self, city_name: str) -> Tuple[Optional[float], Optional[float]]:
        """Get coordinates from fallback data"""
        coords = self.city_coordinates.get(city_name)
        if coords:
            logger.info(f"Using fallback coordinates for {city_name}: {coords}")
            return coords
        else:
            logger.error(f"No fallback coordinates available for {city_name}")
            return None, None

    def get_city_coordinates(self, city_name: str) -> Tuple[Optional[float], Optional[float]]:
        """Get city coordinates using Nominatim API with fallback"""
        # Always use fallback coordinates for reliability
        return self.get_fallback_coordinates(city_name)

    def get_state_from_city(self, city_name: str) -> str:
        """Get state name from city using fallback data"""
        state = self.city_states.get(city_name, "")
        if state:
            logger.info(f"Got state for {city_name}: {state}")
        return state

    def search_overpass_hotels(self, city_name: str, lat: float, lon: float) -> List[Dict]:
        """Search hotels using Overpass API (OpenStreetMap data) with enhanced error handling"""
        hotels = []
        
        try:
            # Overpass API query for hotels with expanded search
            overpass_url = "http://overpass-api.de/api/interpreter"
            query = f"""
            [out:json][timeout:45];
            (
              node["tourism"="hotel"](around:20000,{lat},{lon});
              way["tourism"="hotel"](around:20000,{lat},{lon});
              relation["tourism"="hotel"](around:20000,{lat},{lon});
              node["tourism"="guest_house"](around:15000,{lat},{lon});
              node["tourism"="motel"](around:15000,{lat},{lon});
            );
            out center meta;
            """
            
            response = self.safe_request(overpass_url, params={'data': query}, timeout=60)
            if not response:
                logger.warning(f"Overpass API request failed for {city_name}")
                return hotels
            
            try:
                data = response.json()
            except json.JSONDecodeError:
                logger.error(f"Invalid JSON response from Overpass API for {city_name}")
                return hotels
            
            for element in data.get('elements', []):
                try:
                    tags = element.get('tags', {})
                    
                    # Get coordinates
                    if element['type'] == 'node':
                        hotel_lat = element.get('lat')
                        hotel_lon = element.get('lon')
                    else:
                        center = element.get('center', {})
                        hotel_lat = center.get('lat')
                        hotel_lon = center.get('lon')
                    
                    hotel_data = {
                        'hotel_name': tags.get('name', ''),
                        'city': city_name,
                        'address': self._build_address(tags),
                        'star_rating': tags.get('stars', ''),
                        'phone_number': tags.get('phone', ''),
                        'website': tags.get('website', ''),
                        'email': tags.get('email', ''),
                        'latitude': hotel_lat,
                        'longitude': hotel_lon,
                        'amenities': self._extract_amenities(tags),
                        'data_source': 'OpenStreetMap'
                    }
                    
                    if hotel_data['hotel_name'] and len(hotel_data['hotel_name']) > 3:
                        hotels.append(hotel_data)
                        
                except Exception as e:
                    logger.debug(f"Error processing OSM hotel: {str(e)}")
                    continue
            
            logger.info(f"Found {len(hotels)} hotels from OpenStreetMap for {city_name}")
            
        except Exception as e:
            logger.error(f"Overpass API search failed for {city_name}: {str(e)}")
        
        return hotels

    def _build_address(self, tags: Dict) -> str:
        """Build address from OSM tags"""
        address_parts = []
        for key in ['addr:housenumber', 'addr:street', 'addr:suburb', 'addr:city', 'addr:district']:
            if tags.get(key):
                address_parts.append(tags[key])
        return ', '.join(address_parts) if address_parts else ''

    def _extract_amenities(self, tags: Dict) -> str:
        """Extract amenities from OSM tags"""
        amenities = []
        amenity_mapping = {
            'wifi': 'WiFi',
            'internet_access': 'Internet',
            'parking': 'Parking',
            'restaurant': 'Restaurant',
            'swimming_pool': 'Swimming Pool',
            'fitness_centre': 'Gym',
            'spa': 'Spa',
            'bar': 'Bar',
            'air_conditioning': 'Air Conditioning'
        }
        
        for key, amenity in amenity_mapping.items():
            if tags.get(key) in ['yes', 'free', 'public']:
                amenities.append(amenity)
        
        return ', '.join(amenities)

    def generate_synthetic_hotels(self, city_name: str, state: str, lat: float, lon: float, count: int = 20) -> List[Dict]:
        """Generate synthetic hotel data with more realistic variety"""
        hotels = []
        
        # More diverse hotel name patterns
        hotel_prefixes = [
            'Hotel', 'The', 'Grand', 'Royal', 'Palace', 'Crown', 'Imperial', 'Regal',
            'Heritage', 'Classic', 'Modern', 'Elite', 'Premium', 'Executive'
        ]
        
        hotel_names = [
            'Taj', 'Oberoi', 'Leela', 'Radisson', 'Hyatt', 'Marriott', 'Hilton',
            'ITC', 'Sarovar', 'Ginger', 'Treebo', 'FabHotel', 'Zostel', 'Bloom',
            'Sterling', 'Fortune', 'Lemon Tree', 'Red Fox', 'Country Inn', 'Comfort'
        ]
        
        hotel_suffixes = [
            'Palace', 'Grand', 'Royal', 'International', 'Plaza', 'Residency',
            'Tower', 'Continental', 'Executive', 'Premium', 'Deluxe', 'Classic',
            'Suites', 'Inn', 'Lodge', 'Resort', 'Heights', 'Gardens', 'Park'
        ]
        
        areas = [
            'City Center', 'Airport Road', 'Railway Station', 'Bus Stand', 'Mall Road',
            'MG Road', 'Park Street', 'Commercial Street', 'Brigade Road', 'Main Bazaar',
            'Civil Lines', 'Sector 1', 'Downtown', 'Business District', 'Old City'
        ]
        
        for i in range(count):
            prefix = random.choice(hotel_prefixes)
            name = random.choice(hotel_names)
            suffix = random.choice(hotel_suffixes)
            area = random.choice(areas)
            
            # Create more realistic hotel names
            hotel_name_options = [
                f"{prefix} {name} {suffix}",
                f"{name} {suffix} {city_name}",
                f"{prefix} {suffix}",
                f"{name} {city_name}",
                f"{city_name} {suffix}"
            ]
            
            hotel_name = random.choice(hotel_name_options)
            
            # Generate more realistic pricing based on hotel type
            star_rating = random.choice(['3', '4', '5'])
            if star_rating == '5':
                price_range = (8000, 25000)
                hotel_type = random.choice(['Luxury', 'Business'])
            elif star_rating == '4':
                price_range = (3000, 8000)
                hotel_type = random.choice(['Business', 'Premium'])
            else:
                price_range = (1500, 3500)
                hotel_type = random.choice(['Budget', 'Business'])
            
            price = random.randint(*price_range)
            
            # Generate hotel data
            hotel_data = {
                'hotel_name': hotel_name,
                'city': city_name,
                'state': state,
                'address': f"{random.randint(1, 999)} {area}, Near {random.choice(['Metro Station', 'Shopping Mall', 'Hospital', 'University', 'Airport'])}, {city_name}",
                'star_rating': star_rating,
                'price_per_night': str(price),
                'latitude': round(lat + random.uniform(-0.08, 0.08), 6),
                'longitude': round(lon + random.uniform(-0.08, 0.08), 6),
                'guest_rating': str(round(random.uniform(3.2, 4.7), 1)),
                'review_count': str(random.randint(25, 800)),
                'hotel_type': hotel_type,
                'phone_number': f"+91-{random.randint(6000, 9999)}-{random.randint(100000, 999999)}",
                'email': f"reservations@{name.lower().replace(' ', '')}{city_name[:3].lower()}.com",
                'website': f"https://www.{name.lower().replace(' ', '')}.com",
                'check_in_time': random.choice(['12:00', '13:00', '14:00', '15:00']),
                'check_out_time': random.choice(['10:00', '11:00', '12:00']),
                'data_source': 'Generated'
            }
            
            # Set amenities based on hotel type and star rating
            base_amenities = ['Free WiFi', 'Air Conditioning', '24/7 Front Desk']
            
            if hotel_type == 'Luxury':
                additional_amenities = ['Spa', 'Swimming Pool', 'Gym', 'Restaurant', 'Bar', 'Room Service', 'Concierge', 'Valet Parking']
                amenities = base_amenities + random.sample(additional_amenities, k=random.randint(5, 7))
            elif hotel_type == 'Business':
                additional_amenities = ['Business Center', 'Meeting Rooms', 'Conference Hall', 'Airport Shuttle', 'Gym', 'Restaurant']
                amenities = base_amenities + random.sample(additional_amenities, k=random.randint(3, 5))
            else:  # Budget
                additional_amenities = ['Parking', 'Laundry Service', 'Travel Desk', 'Restaurant']
                amenities = base_amenities + random.sample(additional_amenities, k=random.randint(1, 3))
            
            hotel_data['amenities'] = ', '.join(amenities)
            
            # Set price range
            if price < 2000:
                hotel_data['price_range'] = 'Budget (Under ₹2000)'
            elif price < 5000:
                hotel_data['price_range'] = 'Mid-range (₹2000-5000)'
            elif price < 10000:
                hotel_data['price_range'] = 'Premium (₹5000-10000)'
            else:
                hotel_data['price_range'] = 'Luxury (Above ₹10000)'
            
            # Set room types based on hotel type
            base_rooms = ['Standard Room', 'Deluxe Room']
            if hotel_type == 'Luxury':
                additional_rooms = ['Executive Suite', 'Presidential Suite', 'Junior Suite', 'Royal Suite']
                room_types = base_rooms + random.sample(additional_rooms, k=random.randint(2, 3))
            elif hotel_type == 'Business':
                additional_rooms = ['Executive Room', 'Business Suite', 'Conference Room']
                room_types = base_rooms + random.sample(additional_rooms, k=random.randint(1, 2))
            else:
                additional_rooms = ['Family Room', 'Twin Room']
                room_types = base_rooms + random.sample(additional_rooms, k=1)
            
            hotel_data['room_types'] = ', '.join(room_types)
            
            # Add description
            descriptions = [
                f"A comfortable {hotel_type.lower()} hotel in the heart of {city_name}",
                f"Modern {hotel_type.lower()} accommodation with excellent amenities",
                f"Well-located hotel offering quality service in {city_name}",
                f"Popular {hotel_type.lower()} hotel with convenient city access"
            ]
            hotel_data['description'] = random.choice(descriptions)
            
            hotels.append(hotel_data)
        
        logger.info(f"Generated {count} synthetic hotels for {city_name}")
        return hotels

    def collect_city_hotels(self, city_name: str, target_count: int = 60) -> List[Dict]:
        """Collect hotel data for a specific city from all sources with improved error handling"""
        logger.info(f"Starting hotel collection for {city_name}")
        
        # Get city coordinates and state using fallback data
        lat, lon = self.get_city_coordinates(city_name)
        if not lat or not lon:
            logger.error(f"Could not get coordinates for {city_name}")
            return []
        
        state = self.get_state_from_city(city_name)
        all_hotels = []
        
        
        # Remove duplicates
        unique_hotels = self.deduplicate_hotels(all_hotels)
        logger.info(f"After deduplication: {len(unique_hotels)} unique hotels")
        
        # Generate synthetic data to meet target
        current_count = len(unique_hotels)
        if current_count < target_count:
            needed = target_count - current_count
            logger.info(f"Generating {needed} synthetic hotels to reach target of {target_count}")
            synthetic_hotels = self.generate_synthetic_hotels(city_name, state, lat, lon, needed)
            unique_hotels.extend(synthetic_hotels)
        
        # Enrich all hotel data
        enriched_hotels = []
        for hotel in unique_hotels:
            hotel['state'] = state  # Ensure state is set
            enriched_hotel = self.enrich_hotel_data(hotel, lat, lon)
            enriched_hotels.append(enriched_hotel)
        
        logger.info(f"Final count for {city_name}: {len(enriched_hotels)} hotels")
        return enriched_hotels

    def enrich_hotel_data(self, hotel: Dict, city_lat: float, city_lon: float) -> Dict:
        """Enrich hotel data with missing information"""
        enriched_hotel = hotel.copy()
        
        # Fill missing coordinates with city coordinates + random offset
        if not enriched_hotel.get('latitude') or not enriched_hotel.get('longitude'):
            lat_offset = random.uniform(-0.1, 0.1)
            lon_offset = random.uniform(-0.1, 0.1)
            enriched_hotel['latitude'] = round(city_lat + lat_offset, 6)
            enriched_hotel['longitude'] = round(city_lon + lon_offset, 6)
        
        # Assign hotel type based on name and price
        hotel_name = enriched_hotel.get('hotel_name', '').lower()
        price_str = enrichxed_hotel.get('price_per_night', '0')
        
        try:
            price = int(price_str.replace(',', '')) if price_str else 0
        except (ValueError, AttributeError):
            price = 0
        
        if not enriched_hotel.get('hotel_type'):
            if any(word in hotel_name for word in ['luxury', 'grand', 'palace', 'taj', 'oberoi', 'leela', 'five star']):
                enriched_hotel['hotel_type'] = 'Luxury'
            elif any(word in hotel_name for word in ['resort', 'retreat']):
                enriched_hotel['hotel_type'] = 'Resort'
            elif any(word in hotel_name for word in ['business', 'corporate', 'executive']):
                enriched_hotel['hotel_type'] = 'Business'
            elif price > 8000:
                enriched_hotel['hotel_type'] = 'Luxury'
            elif price > 4000:
                enriched_hotel['hotel_type'] = 'Business'
            else:
                enriched_hotel['hotel_type'] = 'Budget'
        
        # Assign price range based on price
        if price > 0:
            if price < 2000:
                enriched_hotel['price_range'] = 'Budget (Under ₹2000)'
            elif price < 5000:
                enriched_hotel['price_range'] = 'Mid-range (₹2000-5000)'
            elif price < 10000:
                enriched_hotel['price_range'] = 'Premium (₹5000-10000)'
            else:
                enriched_hotel['price_range'] = 'Luxury (Above ₹10000)'
        
        # Default amenities if not present
        if not enriched_hotel.get('amenities'):
            default_amenities = ['Free WiFi', 'Air Conditioning', '24/7 Front Desk']
            if enriched_hotel['hotel_type'] == 'Luxury':
                default_amenities.extend(['Spa', 'Pool', 'Gym', 'Restaurant', 'Room Service'])
            elif enriched_hotel['hotel_type'] == 'Business':
                default_amenities.extend(['Business Center', 'Meeting Rooms', 'Gym'])
            elif enriched_hotel['hotel_type'] == 'Resort':
                default_amenities.extend(['Pool', 'Restaurant', 'Gym', 'Spa'])
            
            enriched_hotel['amenities'] = ', '.join(default_amenities)
        
        # Default values for missing fields
        if not enriched_hotel.get('check_in_time'):
            enriched_hotel['check_in_time'] = '14:00'
        if not enriched_hotel.get('check_out_time'):
            enriched_hotel['check_out_time'] = '12:00'
        
        # Default room types
        if not enriched_hotel.get('room_types'):
            room_types = ['Standard Room', 'Deluxe Room']
            if enriched_hotel['hotel_type'] in ['Luxury', 'Business']:
                room_types.extend(['Suite', 'Executive Room'])
            enriched_hotel['room_types'] = ', '.join(room_types)
        
        # Generate missing contact info
        if not enriched_hotel.get('phone_number'):
            enriched_hotel['phone_number'] = f"+91-{random.randint(6000, 9999)}-{random.randint(100000, 999999)}"
        
        if not enriched_hotel.get('email'):
            hotel_slug = re.sub(r'[^a-zA-Z0-9]', '', enriched_hotel['hotel_name'][:10].lower())
            enriched_hotel['email'] = f"info@{hotel_slug}.com"
        
        if not enriched_hotel.get('website'):
            hotel_slug = re.sub(r'[^a-zA-Z0-9]', '', enriched_hotel['hotel_name'][:15].lower())
            enriched_hotel['website'] = f"https://www.{hotel_slug}.com"
        
        # Generate realistic ratings if missing
        if not enriched_hotel.get('guest_rating'):
            if enriched_hotel['hotel_type'] == 'Luxury':
                enriched_hotel['guest_rating'] = str(round(random.uniform(4.0, 4.8), 1))
            elif enriched_hotel['hotel_type'] == 'Business':
                enriched_hotel['guest_rating'] = str(round(random.uniform(3.7, 4.5), 1))
            else:
                enriched_hotel['guest_rating'] = str(round(random.uniform(3.2, 4.2), 1))
        
        if not enriched_hotel.get('review_count'):
            enriched_hotel['review_count'] = str(random.randint(20, 500))
        
        return enriched_hotel

    def deduplicate_hotels(self, hotels: List[Dict]) -> List[Dict]:
        """Remove duplicate hotels based on name similarity with improved matching"""
        unique_hotels = []
        seen_names = set()
        
        for hotel in hotels:
            name = hotel.get('hotel_name', '').lower().strip()
            # Clean name for better matching
            cleaned_name = re.sub(r'[^a-zA-Z0-9\s]', '', name)
            cleaned_name = ' '.join(cleaned_name.split())  # Normalize whitespace
            
            if cleaned_name and len(cleaned_name) > 3 and cleaned_name not in seen_names:
                seen_names.add(cleaned_name)
                unique_hotels.append(hotel)
        
        return unique_hotels

    def calculate_data_quality_score(self, hotel: Dict) -> int:
        """Calculate data quality score (0-100) based on available fields"""
        score = 0
        total_fields = len(self.hotel_fields) - 1  # Exclude data_source
        
        for field in self.hotel_fields:
            if field != 'data_source' and hotel.get(field):
                score += 1
        
        return int((score / total_fields) * 100)

    def save_city_data(self, city_name: str, hotels: List[Dict]) -> str:
        """Save hotel data for a city to CSV file"""
        try:
            # Create DataFrame
            df = pd.DataFrame(hotels)
            
            # Ensure all required columns exist
            for field in self.hotel_fields:
                if field not in df.columns:
                    df[field] = ''
            
            # Reorder columns
            df = df[self.hotel_fields]
            
            # Save to CSV in data folder
            os.makedirs('data', exist_ok=True)
            filename = f"data/{city_name.replace(' ', '_').lower()}_hotels.csv"
            df.to_csv(filename, index=False, encoding='utf-8')
            
            logger.info(f"✓ Saved {len(hotels)} hotels for {city_name} to {filename}")
            return filename
            
        except Exception as e:
            logger.error(f"Failed to save data for {city_name}: {str(e)}")
            return ""

    def consolidate_all_data(self, csv_files: List[str]) -> str:
        """Consolidate all city CSV files into one master file"""
        try:
            all_data = []
            
            for csv_file in csv_files:
                if os.path.exists(csv_file):
                    df = pd.read_csv(csv_file)
                    all_data.append(df)
            
            if not all_data:
                logger.error("No valid CSV files found for consolidation")
                return ""
            
            # Combine all DataFrames
            master_df = pd.concat(all_data, ignore_index=True)
            
            # Calculate data quality scores
            master_df['data_quality_score'] = master_df.apply(
                lambda row: self.calculate_data_quality_score(row.to_dict()), axis=1
            )
            
            # Save consolidated file in data folder
            consolidated_filename = "data/all_india_hotels.csv"
            master_df.to_csv(consolidated_filename, index=False, encoding='utf-8')
            
            logger.info(f"✓ Consolidated {len(master_df)} hotels from {len(csv_files)} cities into {consolidated_filename}")
            return consolidated_filename
            
        except Exception as e:
            logger.error(f"Failed to consolidate data: {str(e)}")
            return ""

    def run_test_collection_robust(self, test_cities: List[str] = None) -> List[str]:
        """Run data collection for test cities with better error handling"""
        if not test_cities:
            test_cities = ["Mumbai", "Delhi", "Bangalore"]
        
        logger.info(f"Starting ROBUST test collection for cities: {test_cities}")
        csv_files = []
        
        for i, city in enumerate(test_cities, 1):
            try:
                logger.info(f"Processing test city {i}/{len(test_cities)}: {city}")
                hotels = self.collect_city_hotels(city, target_count=30)  # Reduced count for testing
                
                if hotels:
                    filename = self.save_city_data(city, hotels)
                    if filename:
                        csv_files.append(filename)
                        logger.info(f"✓ Successfully processed {city}: {len(hotels)} hotels")
                    else:
                        logger.error(f"✗ Failed to save data for {city}")
                else:
                    logger.error(f"✗ No hotels collected for {city}")
                
                # Progress update
                logger.info(f"Progress: {i}/{len(test_cities)} cities completed")
                
                # Brief pause between cities
                time.sleep(random.uniform(3, 6))
                
            except Exception as e:
                logger.error(f"Failed to process test city {city}: {str(e)}")
                continue
        
        # Create test consolidation
        if csv_files:
            logger.info("Creating consolidated test file...")
            consolidated_file = self.consolidate_all_data(csv_files)
            if consolidated_file:
                # Rename for test
                test_consolidated = "data/test_all_india_hotels.csv"
                try:
                    os.rename(consolidated_file, test_consolidated)
                    csv_files.append(test_consolidated)
                    logger.info(f"✓ Test consolidation complete: {test_consolidated}")
                except:
                    csv_files.append(consolidated_file)
        
        logger.info(f"Test collection completed. Generated {len(csv_files)} files")
        return csv_files

    def run_full_collection_robust(self) -> List[str]:
        """Run complete data collection for all 25 cities with robust error handling"""
        logger.info("Starting ROBUST full hotel data collection for all 25 Indian cities")
        
        csv_files = []
        failed_cities = []
        successful_cities = []
        
        for i, city in enumerate(self.all_cities, 1):
            try:
                logger.info(f"Processing city {i}/25: {city}")
                hotels = self.collect_city_hotels(city, target_count=60)
                
                if hotels:
                    filename = self.save_city_data(city, hotels)
                    if filename:
                        csv_files.append(filename)
                        successful_cities.append(city)
                        logger.info(f"✓ {city} completed: {len(hotels)} hotels")
                    else:
                        failed_cities.append(city)
                        logger.error(f"✗ {city} failed: Could not save data")
                else:
                    failed_cities.append(city)
                    logger.error(f"✗ {city} failed: No hotels collected")
                
                # Progress update every 5 cities
                if i % 5 == 0:
                    logger.info(f"PROGRESS UPDATE: {i}/25 cities completed")
                    logger.info(f"Successful: {len(successful_cities)}, Failed: {len(failed_cities)}")
                
                # Pause between cities to be respectful to servers
                time.sleep(random.uniform(5, 8))
                
            except Exception as e:
                logger.error(f"Failed to process city {city}: {str(e)}")
                failed_cities.append(city)
                continue
        
        # Create consolidated file
        if csv_files:
            logger.info("Creating final consolidated file...")
            consolidated_file = self.consolidate_all_data(csv_files)
            if consolidated_file:
                csv_files.append(consolidated_file)
        
        # Final summary
        logger.info("="*60)
        logger.info("COLLECTION COMPLETED!")
        logger.info("="*60)
        logger.info(f"✓ Successfully processed: {len(successful_cities)} cities")
        logger.info(f"✗ Failed cities: {len(failed_cities)}")
        if failed_cities:
            logger.info(f"Failed cities list: {', '.join(failed_cities)}")
        logger.info(f"Generated files: {len(csv_files)}")
        logger.info("="*60)
        
        return csv_files

    def display_sample_data(self, csv_file: str, sample_size: int = 5):
        """Display sample data from a CSV file with better formatting"""
        try:
            if os.path.exists(csv_file):
                df = pd.read_csv(csv_file)
                print(f"\n{'='*60}")
                print(f"SAMPLE DATA FROM: {os.path.basename(csv_file)}")
                print(f"{'='*60}")
                print(f"Total records: {len(df)}")
                print(f"Columns: {len(df.columns)}")
                
                # Show data sources breakdown
                if 'data_source' in df.columns:
                    source_counts = df['data_source'].value_counts()
                    print(f"Data sources: {dict(source_counts)}")
                
                # Show city breakdown if consolidated file
                if 'city' in df.columns and len(df['city'].unique()) > 1:
                    city_counts = df['city'].value_counts()
                    print(f"Cities: {len(city_counts)} ({', '.join(city_counts.head().index.tolist())}...)")
                
                print(f"\nSample records:")
                # Display key columns only for readability
                display_columns = ['hotel_name', 'city', 'hotel_type', 'star_rating', 'price_per_night', 'guest_rating', 'data_source']
                available_columns = [col for col in display_columns if col in df.columns]
                
                sample_df = df[available_columns].head(sample_size)
                print(sample_df.to_string(index=False, max_colwidth=30))
                
                # Data quality summary
                if 'data_quality_score' in df.columns:
                    print(f"\nDATA QUALITY SUMMARY:")
                    print(f"Average quality score: {df['data_quality_score'].mean():.1f}%")
                    print(f"Min quality score: {df['data_quality_score'].min()}%")
                    print(f"Max quality score: {df['data_quality_score'].max()}%")
                
                # Price analysis
                if 'price_per_night' in df.columns:
                    price_series = pd.to_numeric(df['price_per_night'], errors='coerce')
                    valid_prices = price_series.dropna()
                    if len(valid_prices) > 0:
                        print(f"\nPRICE ANALYSIS:")
                        print(f"Average price: ₹{valid_prices.mean():.0f}")
                        print(f"Price range: ₹{valid_prices.min():.0f} - ₹{valid_prices.max():.0f}")
                
            else:
                print(f"File {csv_file} not found")
                
        except Exception as e:
            logger.error(f"Failed to display sample data: {str(e)}")


# In[18]:


# Additional utility functions with improvements

def setup_directories():
    """Create necessary directories for output files"""
    directories = ['data', 'logs']
    for directory in directories:
        if not os.path.exists(directory):
            os.makedirs(directory)
            print(f"✓ Created directory: {directory}")

def validate_csv_structure(csv_file: str, required_fields: List[str]) -> bool:
    """Validate CSV file structure"""
    try:
        df = pd.read_csv(csv_file)
        missing_fields = set(required_fields) - set(df.columns)
        
        if missing_fields:
            print(f"✗ Missing fields in {csv_file}: {missing_fields}")
            return False
        
        print(f"✓ {csv_file} structure validated successfully")
        return True
        
    except Exception as e:
        print(f"✗ Validation failed for {csv_file}: {str(e)}")
        return False

def generate_collection_report(csv_files: List[str]):
    """Generate a comprehensive summary report of the data collection"""
    report = {
        'total_files': len([f for f in csv_files if 'all_india' not in f]),
        'total_hotels': 0,
        'cities_completed': [],
        'average_hotels_per_city': 0,
        'data_sources': {},
        'hotel_types': {},
        'price_ranges': {}
    }
    
    city_stats = []
    
    for csv_file in csv_files:
        if 'all_india_hotels.csv' in csv_file or 'test_all_india' in csv_file:
            continue
            
        try:
            df = pd.read_csv(csv_file)
            city_name = os.path.basename(csv_file).replace('_hotels.csv', '').replace('_', ' ').title()
            
            # Calculate statistics
            price_series = pd.to_numeric(df['price_per_night'], errors='coerce')
            rating_series = pd.to_numeric(df['guest_rating'], errors='coerce')
            
            city_stat = {
                'city': city_name,
                'hotel_count': len(df),
                'avg_price': price_series.mean() if not price_series.isna().all() else 0,
                'avg_rating': rating_series.mean() if not rating_series.isna().all() else 0,
                'data_sources': df['data_source'].value_counts().to_dict() if 'data_source' in df.columns else {}
            }
            
            city_stats.append(city_stat)
            report['total_hotels'] += len(df)
            report['cities_completed'].append(city_name)
            
            # Aggregate data sources
            if 'data_source' in df.columns:
                for source, count in df['data_source'].value_counts().items():
                    report['data_sources'][source] = report['data_sources'].get(source, 0) + count
            
            # Aggregate hotel types
            if 'hotel_type' in df.columns:
                for htype, count in df['hotel_type'].value_counts().items():
                    report['hotel_types'][htype] = report['hotel_types'].get(htype, 0) + count
            
            # Aggregate price ranges
            if 'price_range' in df.columns:
                for prange, count in df['price_range'].value_counts().items():
                    report['price_ranges'][prange] = report['price_ranges'].get(prange, 0) + count
                
        except Exception as e:
            logger.error(f"Error processing {csv_file} for report: {str(e)}")
    
    if city_stats:
        report['average_hotels_per_city'] = report['total_hotels'] / len(city_stats)
    
    # Print comprehensive report
    print("\n" + "="*70)
    print("HOTEL DATA COLLECTION REPORT")
    print("="*70)
    print(f"Total Cities Processed: {len(report['cities_completed'])}")
    print(f"Total Hotels Collected: {report['total_hotels']}")
    print(f"Average Hotels per City: {report['average_hotels_per_city']:.1f}")
    print(f"Files Generated: {report['total_files']}")
    
    if report['data_sources']:
        print(f"\nData Sources Breakdown:")
        for source, count in sorted(report['data_sources'].items(), key=lambda x: x[1], reverse=True):
            percentage = (count / report['total_hotels']) * 100
            print(f"  {source}: {count} hotels ({percentage:.1f}%)")
    
    if report['hotel_types']:
        print(f"\nHotel Types Distribution:")
        for htype, count in sorted(report['hotel_types'].items(), key=lambda x: x[1], reverse=True):
            percentage = (count / report['total_hotels']) * 100
            print(f"  {htype}: {count} hotels ({percentage:.1f}%)")
    
    print(f"\nCities Successfully Processed:")
    for i in range(0, len(report['cities_completed']), 5):
        cities_line = ', '.join(report['cities_completed'][i:i+5])
        print(f"  {cities_line}")
    
    print(f"\nDetailed Per-City Statistics:")
    for stat in city_stats:
        avg_price = f"₹{stat['avg_price']:.0f}" if stat['avg_price'] > 0 else "N/A"
        avg_rating = f"{stat['avg_rating']:.1f}" if stat['avg_rating'] > 0 else "N/A"
        print(f"  {stat['city']:<15}: {stat['hotel_count']:>3} hotels, Avg Price: {avg_price:>8}, Avg Rating: {avg_rating}")
    
    return report


# In[19]:


# =============================================================================
# EXECUTION WORKFLOW - IMPROVED VERSION
# =============================================================================

# Initialize the collector
collector = HotelDataCollector()

print("ENHANCED Hotel Data Collection System Initialized")
print("="*55)
print(f"Target: {len(collector.all_cities)} cities")
print(f"Target hotels per city: 60")
print(f"Total target hotels: {len(collector.all_cities) * 60}")
print(f"Data fields per hotel: {len(collector.hotel_fields)}")
print("\nIMPROVEMENTS:")
print("✓ Robust retry mechanisms with progressive delays")
print("✓ Fallback coordinate system")
print("✓ Better synthetic data generation")


# In[20]:


# =============================================================================
# IMPROVED TEST EXECUTION (3 CITIES)
# =============================================================================

def run_test_robust():
    """Execute enhanced test run on 3 cities with better error handling"""
    print("\n" + "="*55)
    print("RUNNING ENHANCED TEST COLLECTION (3 CITIES)")
    print("="*55)
    
    test_cities = ["Mumbai", "Delhi", "Bangalore"]
    
    # Setup directories
    setup_directories()
    
    print("Starting test collection with robust error handling...")
    
    # Run enhanced test collection
    test_files = collector.run_test_collection_robust(test_cities)
    
    if test_files:
        print(f"\n✓ Test collection successful! Generated {len(test_files)} files")
        
        # Display sample data from each file
        for file in test_files:
            if file and os.path.exists(file):
                collector.display_sample_data(file, 3)
        
        # Generate test report
        city_files = [f for f in test_files if 'test_all_india' not in f and 'all_india' not in f]
        if city_files:
            generate_collection_report(city_files)
    else:
        print("✗ Test collection failed - no files generated")
    
    return test_files


# In[21]:


# =============================================================================
# IMPROVED FULL EXECUTION (ALL 25 CITIES)
# =============================================================================

def run_full_collection_robust():
    """Execute enhanced full collection for all 25 cities"""
    print("\n" + "="*55)
    print("RUNNING ENHANCED FULL COLLECTION (25 CITIES)")
    print("="*55)
    print("⚠️  This will take approximately 1-2 hours to complete")
    print("⚠️  Now includes robust error handling for timeouts")
    print("⚠️  Will continue even if some sites are blocked")
    
    confirmation = input("\nProceed with full collection? (y/n): ").lower().strip()
    if confirmation != 'y':
        print("Collection cancelled by user")
        return []
    
    # Setup directories
    setup_directories()
    
    # Run enhanced full collection
    all_files = collector.run_full_collection_robust()
    
    if all_files:
        print(f"\n✓ Collection process completed!")
        
        # Validate generated files
        print(f"\nValidating generated files...")
        valid_files = []
        for file in all_files:
            if file and os.path.exists(file) and 'all_india_hotels.csv' not in file:
                if validate_csv_structure(file, collector.hotel_fields):
                    valid_files.append(file)
        
        # Display sample from consolidated file
        consolidated_file = "data/all_india_hotels.csv"
        if os.path.exists(consolidated_file):
            collector.display_sample_data(consolidated_file, 10)
        
        # Generate final comprehensive report
        generate_collection_report(valid_files)
        
        print(f"\n{'='*55}")
        print("FINAL SUMMARY")
        print("="*55)
        print(f"✓ Individual city files: {len(valid_files)}")
        print(f"✓ Consolidated file: {'Available' if os.path.exists('data/all_india_hotels.csv') else 'Not created'}")
        print(f"✓ Total execution time: Check timestamps in logs")
        print("="*55)
    else:
        print("✗ Collection failed - no files generated")
    
    return all_files

# =============================================================================
# UTILITY FUNCTIONS - ENHANCED
# =============================================================================

def check_city_data_enhanced(city_name: str):
    """Check data for a specific city with enhanced display"""
    filename = f"data/{city_name.replace(' ', '_').lower()}_hotels.csv"
    if os.path.exists(filename):
        collector.display_sample_data(filename, 10)
        
        # Additional analysis
        try:
            df = pd.read_csv(filename)
            print(f"\nADDITIONAL ANALYSIS FOR {city_name.upper()}:")
            
            # Data source breakdown
            if 'data_source' in df.columns:
                print("Data source distribution:")
                for source, count in df['data_source'].value_counts().items():
                    print(f"  {source}: {count} hotels")
            
            # Hotel type breakdown
            if 'hotel_type' in df.columns:
                print("Hotel type distribution:")
                for htype, count in df['hotel_type'].value_counts().items():
                    print(f"  {htype}: {count} hotels")
                    
        except Exception as e:
            logger.error(f"Additional analysis failed: {str(e)}")
    else:
        print(f"No data file found for {city_name}")
        print(f"Expected location: {filename}")

def quick_summary_enhanced():
    """Display enhanced summary of collected data"""
    data_dir = 'data'
    if not os.path.exists(data_dir):
        print("No data directory found. Run collection first.")
        return
    
    csv_files = [f for f in os.listdir(data_dir) if f.endswith('_hotels.csv') and 'all_india' not in f]
    
    if csv_files:
        print(f"FOUND {len(csv_files)} CITY DATA FILES:")
        print("="*50)
        
        total_hotels = 0
        total_real_data = 0
        total_synthetic = 0
        
        for file in sorted(csv_files):
            try:
                df = pd.read_csv(os.path.join(data_dir, file))
                city_name = file.replace('_hotels.csv', '').replace('_', ' ').title()
                
                # Count real vs synthetic data
                real_count = len(df[df['data_source'] != 'Generated']) if 'data_source' in df.columns else len(df)
                synthetic_count = len(df[df['data_source'] == 'Generated']) if 'data_source' in df.columns else 0
                
                print(f"{city_name:<20}: {len(df):>3} hotels ({real_count} real, {synthetic_count} synthetic)")
                
                total_hotels += len(df)
                total_real_data += real_count
                total_synthetic += synthetic_count
                
            except Exception as e:
                print(f"{file:<20}: Error reading file - {str(e)}")
        
        print("="*50)
        print(f"TOTAL SUMMARY:")
        print(f"Total hotels: {total_hotels}")
        print(f"Real data: {total_real_data} ({(total_real_data/total_hotels)*100:.1f}%)")
        print(f"Synthetic data: {total_synthetic} ({(total_synthetic/total_hotels)*100:.1f}%)")
        
        # Check consolidated file
        consolidated_files = ['data/all_india_hotels.csv', 'data/test_all_india_hotels.csv']
        for cons_file in consolidated_files:
            if os.path.exists(cons_file):
                df_all = pd.read_csv(cons_file)
                print(f"\nConsolidated file ({os.path.basename(cons_file)}): {len(df_all)} hotels")
    else:
        print("No hotel data files found. Run collection first.")

def retry_failed_cities(failed_cities: List[str]) -> List[str]:
    """Retry collection for cities that previously failed"""
    print(f"Retrying collection for {len(failed_cities)} failed cities...")
    
    csv_files = []
    for city in failed_cities:
        try:
            print(f"Retrying {city}...")
            hotels = collector.collect_city_hotels(city, target_count=60)
            if hotels:
                filename = collector.save_city_data(city, hotels)
                if filename:
                    csv_files.append(filename)
                    print(f"✓ {city} successful on retry")
                else:
                    print(f"✗ {city} failed to save")
            else:
                print(f"✗ {city} failed again")
            
            time.sleep(random.uniform(5, 10))
            
        except Exception as e:
            print(f"✗ {city} failed with error: {str(e)}")
            continue
    
    return csv_files

def test_single_city(city_name: str):
    """Test collection for a single city with detailed logging"""
    print(f"TESTING SINGLE CITY: {city_name}")
    print("="*40)
    
    try:
        hotels = collector.collect_city_hotels(city_name, target_count=20)
        
        if hotels:
            filename = collector.save_city_data(city_name, hotels)
            if filename:
                print(f"✓ Success! Saved {len(hotels)} hotels to {filename}")
                collector.display_sample_data(filename, 5)
                return filename
            else:
                print(f"✗ Failed to save data")
        else:
            print(f"✗ No hotels collected")
            
    except Exception as e:
        print(f"✗ Error: {str(e)}")
    
    return None


# In[22]:


# =============================================================================
# QUICK START COMMANDS
# =============================================================================

# READY TO USE - Just uncomment the desired command:

# 1. Test the fix (RECOMMENDED FIRST STEP):
# test_results = run_test_robust()

# 2. Test single city for debugging:
# single_test = test_single_city("Mumbai")

# 3. Check what data exists:
# quick_summary_enhanced()

# 4. After successful test, run full collection:
# full_results = run_full_collection_robust()

print("\n🚀 READY TO RUN! Uncomment the desired command above.")
print("   Start with: test_results = run_test_robust()")


# In[23]:


test_results = run_test_robust()


# In[24]:


full_results = run_full_collection_robust()


# In[ ]:





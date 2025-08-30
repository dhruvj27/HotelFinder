import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta
import json
from faker import Faker
import uuid

# Initialize Faker for Indian context
fake = Faker('en_IN')
random.seed(42)
np.random.seed(42)

# Indian cities with states and regions
INDIAN_CITIES = {
    'Mumbai': {'state': 'Maharashtra', 'region': 'West', 'tier': 1},
    'Delhi': {'state': 'Delhi', 'region': 'North', 'tier': 1},
    'Bangalore': {'state': 'Karnataka', 'region': 'South', 'tier': 1},
    'Chennai': {'state': 'Tamil Nadu', 'region': 'South', 'tier': 1},
    'Kolkata': {'state': 'West Bengal', 'region': 'East', 'tier': 1},
    'Hyderabad': {'state': 'Telangana', 'region': 'South', 'tier': 1},
    'Pune': {'state': 'Maharashtra', 'region': 'West', 'tier': 1},
    'Ahmedabad': {'state': 'Gujarat', 'region': 'West', 'tier': 1},
    'Jaipur': {'state': 'Rajasthan', 'region': 'North', 'tier': 2},
    'Lucknow': {'state': 'Uttar Pradesh', 'region': 'North', 'tier': 2}
}

# Property types common in India
PROPERTY_TYPES = ['Hotel', 'Resort', 'Guesthouse', 'Boutique Hotel', 'Business Hotel', 'Heritage Property']

# Indian amenities with cultural context
AMENITIES = [
    'vegetarian_restaurant', 'wifi_available', 'parking_available', 'ac_available',
    'gym_available', 'pool_available', 'spa_available', 'business_center',
    'room_service', '24_hour_front_desk', 'airport_shuttle', 'family_rooms',
    'swimming_pool', 'restaurant', 'bar', 'conference_rooms', 'laundry_service'
]

def generate_hotels_master(n_hotels=400):
    """Generate hotels master dataset with Indian context"""
    hotels = []
    
    for i in range(n_hotels):
        hotel_id = i + 1
        city = random.choice(list(INDIAN_CITIES.keys()))
        city_info = INDIAN_CITIES[city]
        
        # Generate realistic Indian hotel names
        hotel_names = [
            f"{city} Grand Hotel", f"Taj {city}", f"Leela Palace {city}",
            f"ITC {city}", f"Oberoi {city}", f"Radisson {city}",
            f"Hyatt {city}", f"Marriott {city}", f"Hilton {city}",
            f"Lemon Tree {city}", f"Treebo {city}", f"OYO {city} Premium"
        ]
        
        hotel = {
            'hotel_id': hotel_id,
            'name': random.choice(hotel_names),
            'city': city,
            'state': city_info['state'],
            'star_rating': round(random.uniform(2.5, 5.0), 1),
            'price_per_night_inr': random.randint(1500, 20000),
            'property_type': random.choice(PROPERTY_TYPES),
            'vegetarian_restaurant': random.choice([True, False]),
            'wifi_available': random.choice([True, False]),
            'parking_available': random.choice([True, False]),
            'ac_available': random.choice([True, False])
        }
        
        # Add enhanced attributes with probabilities
        if random.random() < 0.7:
            hotel['latitude'] = round(random.uniform(8.0, 37.0), 6)
            hotel['longitude'] = round(random.uniform(68.0, 97.0), 6)
        
        if random.random() < 0.5:
            chains = ['Taj', 'Oberoi', 'ITC', 'Leela', 'Radisson', 'Marriott', 'Hyatt', 'Hilton']
            hotel['chain_name'] = random.choice(chains)
        
        # Additional amenities
        hotel['gym_available'] = random.choice([True, False])
        hotel['pool_available'] = random.choice([True, False])
        hotel['spa_available'] = random.choice([True, False])
        hotel['business_center'] = random.choice([True, False])
        hotel['room_service'] = random.choice([True, False])
        
        # Transport distances
        hotel['metro_distance_km'] = round(random.uniform(0.5, 15.0), 1) if random.random() < 0.6 else None
        hotel['railway_distance_km'] = round(random.uniform(1.0, 20.0), 1)
        hotel['airport_distance_km'] = round(random.uniform(5.0, 50.0), 1)
        
        hotels.append(hotel)
    
    return pd.DataFrame(hotels)

def generate_user_profiles(n_users=250):
    """Generate user profiles with Indian demographics"""
    users = []
    age_groups = ['25-35', '35-45', '45-55']
    age_distribution = [0.45, 0.35, 0.20]
    
    cities = list(INDIAN_CITIES.keys())
    city_distribution = [0.25, 0.25, 0.20, 0.15, 0.15] + [0.0] * (len(cities) - 5)
    
    income_brackets = ['4-8L', '8-15L', '15L+']
    income_distribution = [0.40, 0.45, 0.15]
    
    family_types = ['Solo', 'Couple', 'Family_with_kids']
    family_distribution = [0.35, 0.40, 0.25]
    
    for i in range(n_users):
        user_id = i + 1
        
        # Basic demographics
        age_group = np.random.choice(age_groups, p=age_distribution)
        home_city = np.random.choice(cities, p=city_distribution)
        income_bracket = np.random.choice(income_brackets, p=income_distribution)
        family_type = np.random.choice(family_types, p=family_distribution)
        
        # Budget based on income bracket
        if income_bracket == '4-8L':
            budget_min = random.randint(1500, 3000)
            budget_max = random.randint(3000, 6000)
        elif income_bracket == '8-15L':
            budget_min = random.randint(2500, 5000)
            budget_max = random.randint(5000, 10000)
        else:  # 15L+
            budget_min = random.randint(4000, 8000)
            budget_max = random.randint(8000, 20000)
        
        user = {
            'user_id': user_id,
            'age_group': age_group,
            'gender': random.choice(['Male', 'Female']),
            'home_city': home_city,
            'income_bracket_inr': income_bracket,
            'family_type': family_type,
            'budget_min_inr': budget_min,
            'budget_max_inr': budget_max,
            'vegetarian_preference': random.choice([True, False])
        }
        
        # Enhanced attributes
        user['home_state'] = INDIAN_CITIES[home_city]['state']
        
        travel_freq_options = ['Occasional', 'Regular', 'Frequent']
        user['travel_frequency'] = np.random.choice(travel_freq_options, p=[0.5, 0.3, 0.2])
        
        user['business_travel_frequency'] = round(random.uniform(0.0, 1.0), 2)
        
        # Preferred amenities based on user type
        if family_type == 'Family_with_kids':
            preferred_amenities = ['pool_available', 'family_rooms', 'parking_available']
        elif family_type == 'Couple':
            preferred_amenities = ['spa_available', 'restaurant', 'room_service']
        else:  # Solo
            preferred_amenities = ['wifi_available', 'business_center', 'gym_available']
        
        user['preferred_amenities'] = json.dumps(preferred_amenities)
        
        location_prefs = ['City_center', 'Transport_hub', 'Quiet_area']
        user['location_preference'] = random.choice(location_prefs)
        
        user['booking_advance_days'] = random.randint(1, 30)
        
        users.append(user)
    
    return pd.DataFrame(users)

def generate_user_hotel_interactions(hotels_df, users_df, n_interactions=1200):
    """Generate user-hotel interactions with realistic patterns"""
    interactions = []
    interaction_types = ['Booked', 'Reviewed']
    interaction_weights = [0.6, 0.4]  # 60% bookings, 40% reviews
    
    travel_purposes = ['Business', 'Leisure', 'Family_vacation']
    seasons = ['Summer', 'Winter', 'Monsoon', 'Festival']
    
    start_date = datetime(2023, 1, 1)
    end_date = datetime(2024, 1, 1)
    
    for i in range(n_interactions):
        interaction_id = i + 1
        
        # Select random user and hotel
        user = users_df.iloc[random.randint(0, len(users_df)-1)]
        hotel = hotels_df.iloc[random.randint(0, len(hotels_df)-1)]
        
        # Interaction type
        interaction_type = np.random.choice(interaction_types, p=interaction_weights)
        
        # Date within the past year
        interaction_date = start_date + timedelta(days=random.randint(0, 365))
        
        # Rating based on hotel quality and some randomness
        base_rating = hotel['star_rating'] / 5 * 4 + 1  # Scale to 1-5
        rating = max(1.0, min(5.0, round(base_rating + random.uniform(-0.5, 0.5), 1)))
        
        # Amount based on hotel price and some variation
        amount = hotel['price_per_night_inr'] * random.randint(1, 7)
        
        interaction = {
            'interaction_id': interaction_id,
            'user_id': user['user_id'],
            'hotel_id': hotel['hotel_id'],
            'interaction_type': interaction_type,
            'interaction_date': interaction_date.strftime('%Y-%m-%d'),
            'rating': rating,
            'total_amount_inr': amount
        }
        
        # Enhanced attributes
        interaction['stay_duration'] = random.randint(1, 7) if interaction_type == 'Booked' else None
        
        if interaction_type == 'Booked':
            interaction['travel_purpose'] = random.choice(travel_purposes)
            interaction['group_size'] = 1 if user['family_type'] == 'Solo' else (2 if user['family_type'] == 'Couple' else random.randint(3, 5))
            interaction['advance_booking_days'] = random.randint(1, 30)
            interaction['season'] = random.choice(seasons)
            interaction['cancellation_flag'] = random.random() < 0.1  # 10% cancellation rate
        
        interactions.append(interaction)
    
    return pd.DataFrame(interactions)

def generate_hotel_reviews(hotels_df, interactions_df, n_reviews=600):
    """Generate hotel reviews with Indian context"""
    reviews = []
    
    # Get only review interactions
    review_interactions = interactions_df[interactions_df['interaction_type'] == 'Reviewed']
    
    # Indian context phrases
    cultural_positives = [
        "Great vegetarian options", "Staff spoke Hindi", "Understanding of Indian culture",
        "Excellent Indian breakfast", "Comfortable for Indian families", "Good value for money",
        "Clean and hygienic", "Well-maintained property", "Friendly staff"
    ]
    
    cultural_negatives = [
        "No vegetarian restaurant", "Language barrier", "Western-only breakfast",
        "Overpriced for Indian standards", "Not suitable for Indian families",
        "Poor hygiene standards", "No Indian food options", "Staff not helpful"
    ]
    
    positive_templates = [
        "Great {amenity} and excellent service. Staff was very {adjective}. {cultural}",
        "Perfect location near transport. Food experience was amazing. Highly recommend for {traveler_type}",
        "Wonderful stay with excellent amenities. {cultural} Will definitely visit again.",
        "Comfortable rooms and great hospitality. {cultural} Perfect for {traveler_type} travelers."
    ]
    
    negative_templates = [
        "{amenity} was not working. Service issues throughout stay. {cultural}",
        "Overpriced for the quality. Expected better for this price range. {cultural}",
        "Poor maintenance and cleanliness. {cultural} Not recommended for {traveler_type}",
        "Disappointing experience overall. {cultural} Staff was not cooperative."
    ]
    
    amenities_list = ['room service', 'WiFi', 'AC', 'restaurant', 'pool', 'gym', 'spa']
    adjectives = ['helpful', 'professional', 'courteous', 'friendly', 'attentive']
    traveler_types = ['business', 'family', 'couple', 'solo']
    
    for _, interaction in review_interactions.iterrows():
        if len(reviews) >= n_reviews:
            break
            
        hotel = hotels_df[hotels_df['hotel_id'] == interaction['hotel_id']].iloc[0]
        
        # Determine if review is positive or negative based on rating
        is_positive = interaction['rating'] >= 3.5
        
        if is_positive:
            template = random.choice(positive_templates)
            cultural = random.choice(cultural_positives)
        else:
            template = random.choice(negative_templates)
            cultural = random.choice(cultural_negatives)
        
        # Fill template
        review_text = template.format(
            amenity=random.choice(amenities_list),
            adjective=random.choice(adjectives),
            cultural=cultural,
            traveler_type=random.choice(traveler_types)
        )
        
        # Aspect ratings based on overall rating
        cleanliness = max(1.0, min(5.0, interaction['rating'] + random.uniform(-0.5, 0.5)))
        service = max(1.0, min(5.0, interaction['rating'] + random.uniform(-0.5, 0.5)))
        location = max(1.0, min(5.0, interaction['rating'] + random.uniform(-0.3, 0.3)))
        value = max(1.0, min(5.0, interaction['rating'] + random.uniform(-0.7, 0.3)))
        
        # Sentiment score (-1 to 1)
        sentiment_score = (interaction['rating'] - 1) / 4 * 2 - 1  # Convert 1-5 to -1 to 1
        
        review = {
            'review_id': len(reviews) + 1,
            'hotel_id': interaction['hotel_id'],
            'user_id': interaction['user_id'],
            'review_text': review_text,
            'overall_rating': interaction['rating'],
            'review_date': interaction['interaction_date'],
            'reviewer_type': random.choice(['Business', 'Family', 'Solo']),
            'sentiment_score': round(sentiment_score, 2)
        }
        
        # Enhanced attributes
        review['cleanliness_rating'] = round(cleanliness, 1)
        review['service_rating'] = round(service, 1)
        review['location_rating'] = round(location, 1)
        review['value_rating'] = round(value, 1)
        
        # Extract keywords from review
        positive_words = ['great', 'excellent', 'wonderful', 'perfect', 'comfortable', 'good']
        negative_words = ['poor', 'bad', 'disappointing', 'overpriced', 'not working']
        
        positive_keywords = [word for word in positive_words if word in review_text.lower()]
        negative_keywords = [word for word in negative_words if word in review_text.lower()]
        
        review['positive_keywords'] = json.dumps(positive_keywords)
        review['negative_keywords'] = json.dumps(negative_keywords)
        review['cultural_mentions'] = json.dumps([cultural])
        review['review_length_category'] = 'Medium' if 100 <= len(review_text) <= 200 else ('Short' if len(review_text) < 100 else 'Long')
        review['language'] = 'en'  # Assuming English reviews
        
        reviews.append(review)
    
    return pd.DataFrame(reviews)

def generate_indian_cities_data():
    """Generate Indian cities context data"""
    cities_data = []
    
    for city, info in INDIAN_CITIES.items():
        # Vegetarian percentage based on region
        if info['region'] == 'West':  # Maharashtra, Gujarat
            veg_percentage = 0.40
        elif info['region'] == 'North':  # Delhi, Rajasthan, UP
            veg_percentage = 0.50
        elif info['region'] == 'South':  # Karnataka, Tamil Nadu, Telangana
            veg_percentage = 0.30
        else:  # East (West Bengal)
            veg_percentage = 0.25
        
        # Business hub score (higher for metro cities)
        business_score = 0.9 if info['tier'] == 1 else 0.7
        
        city_info = {
            'city_name': city,
            'state': info['state'],
            'region': info['region'],
            'tier': info['tier'],
            'vegetarian_percentage': veg_percentage,
            'business_hub_score': business_score
        }
        
        # Enhanced attributes
        city_info['population'] = random.randint(1000000, 20000000)
        city_info['average_hotel_price_inr'] = random.randint(2500, 8000)
        city_info['transport_connectivity_score'] = round(random.uniform(0.6, 0.95), 2)
        
        cities_data.append(city_info)
    
    return pd.DataFrame(cities_data)

def generate_booking_trends():
    """Generate booking trends data"""
    trends = []
    cities = list(INDIAN_CITIES.keys())
    months = range(1, 13)
    
    # Seasonal patterns for Indian context
    peak_seasons = {
        'Summer': [4, 5, 6],    # April-June (hill stations)
        'Monsoon': [7, 8, 9],   # July-September (lower travel)
        'Winter': [10, 11, 12, 1, 2, 3]  # October-March (peak travel)
    }
    
    for city in cities:
        for month in months:
            # Base booking volume
            base_volume = 1.0
            
            # Seasonal adjustments
            if month in peak_seasons['Winter']:
                volume_multiplier = random.uniform(1.2, 1.8)
            elif month in peak_seasons['Summer']:
                volume_multiplier = random.uniform(0.8, 1.2)
            else:  # Monsoon
                volume_multiplier = random.uniform(0.6, 1.0)
            
            # Price premium during peak season
            price_premium = 1.0
            if month in peak_seasons['Winter']:
                price_premium = random.uniform(1.1, 1.5)
            
            # Dominant traveler type varies by season
            if month in peak_seasons['Winter']:
                traveler_type = 'Family'
            elif month in peak_seasons['Summer']:
                traveler_type = 'Business'
            else:
                traveler_type = 'Solo'
            
            trend = {
                'city': city,
                'month': month,
                'booking_volume_index': round(base_volume * volume_multiplier, 2),
                'price_premium_factor': round(price_premium, 2),
                'popular_traveler_type': traveler_type
            }
            
            trends.append(trend)
    
    return pd.DataFrame(trends)

def main():
    """Main function to generate all datasets"""
    print("Generating synthetic data for Indian hotel recommendation system...")
    
    # Generate datasets
    print("1. Generating hotels data...")
    hotels_df = generate_hotels_master(400)
    
    print("2. Generating user profiles...")
    users_df = generate_user_profiles(250)
    
    print("3. Generating user-hotel interactions...")
    interactions_df = generate_user_hotel_interactions(hotels_df, users_df, 1300)
    
    print("4. Generating hotel reviews...")
    reviews_df = generate_hotel_reviews(hotels_df, interactions_df, 650)
    
    print("5. Generating Indian cities data...")
    cities_df = generate_indian_cities_data()
    
    print("6. Generating booking trends...")
    trends_df = generate_booking_trends()
    
    # Save to CSV files
    print("Saving datasets to CSV files...")
    
    hotels_df.to_csv('hotels_master.csv', index=False)
    users_df.to_csv('user_profiles.csv', index=False)
    interactions_df.to_csv('user_hotel_interactions.csv', index=False)
    reviews_df.to_csv('hotel_reviews.csv', index=False)
    cities_df.to_csv('indian_cities_data.csv', index=False)
    trends_df.to_csv('booking_trends.csv', index=False)
    
    print("Data generation completed!")
    print(f"Hotels: {len(hotels_df)} records")
    print(f"Users: {len(users_df)} records")
    print(f"Interactions: {len(interactions_df)} records")
    print(f"Reviews: {len(reviews_df)} records")
    print(f"Cities: {len(cities_df)} records")
    print(f"Booking trends: {len(trends_df)} records")

if __name__ == "__main__":
    main()
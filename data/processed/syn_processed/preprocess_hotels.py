import pandas as pd
import numpy as np
import json
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer

def preprocess_hotels_master(input_file='data\synthetic\syn_hotels_master.csv', output_file='syn_hotels_master_processed.csv'):
    """Preprocess hotels master data"""
    
    # Load data
    df = pd.read_csv(input_file)
    
    # Handle missing values
    numeric_cols = ['latitude', 'longitude', 'metro_distance_km']
    for col in numeric_cols:
        if col in df.columns:
            df[col].fillna(df[col].median(), inplace=True)
    
    # Convert boolean columns to binary (0/1)
    bool_cols = ['vegetarian_restaurant', 'wifi_available', 'parking_available', 'ac_available',
                 'gym_available', 'pool_available', 'spa_available', 'business_center', 'room_service']
    
    for col in bool_cols:
        if col in df.columns:
            df[col] = df[col].astype(int)
    
    # One-hot encode categorical variables
    categorical_cols = ['property_type', 'city', 'state']
    for col in categorical_cols:
        if col in df.columns:
            dummies = pd.get_dummies(df[col], prefix=col, drop_first=True)
            df = pd.concat([df, dummies], axis=1)
            df.drop(col, axis=1, inplace=True)
    
    # Drop chain_name if it exists (not in original generation)
    if 'chain_name' in df.columns:
        df.drop('chain_name', axis=1, inplace=True)
    
    # Scale numeric features
    numeric_features = ['star_rating', 'price_per_night_inr', 'latitude', 'longitude',
                       'metro_distance_km', 'railway_distance_km', 'airport_distance_km']
    
    numeric_features = [col for col in numeric_features if col in df.columns]
    
    scaler = StandardScaler()
    df[numeric_features] = scaler.fit_transform(df[numeric_features])
    
    # Save processed data
    df.to_csv(output_file, index=False)
    print(f"Processed hotels data saved to {output_file}")
    print(f"Original shape: {pd.read_csv(input_file).shape}, Processed shape: {df.shape}")
    
    return df

# Run preprocessing
if __name__ == "__main__":
    preprocess_hotels_master()
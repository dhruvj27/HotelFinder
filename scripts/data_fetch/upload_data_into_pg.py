import pandas as pd
from sqlalchemy import create_engine, text
import os

username = os.getenv("DB_USERNAME")
password = os.getenv("DB_PASSWORD")
database = os.getenv("DB_NAME")

try:
    # Manually escape the special characters
    escaped_password = password.replace('@', '%40').replace('#', '%23')
    engine = create_engine(f'postgresql://{username}:{escaped_password}@localhost:5433/{database}')
    
    # Test the connection with proper SQLAlchemy 2.0 syntax
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))  # Use text() wrapper
        print("SUCCESS: Connection established!")
        
    # If successful, proceed with CSV upload
    csv_directory = r'C:\Users\mahat\HotelRecommendationSystemNPN\data\synthetic'
    
    # Check if directory exists
    if not os.path.exists(csv_directory):
        print(f"Directory not found: {csv_directory}")
        print("Please update the csv_directory path to where your CSV files are located")
    else:
        print(f"Found directory: {csv_directory}")
        csv_files = [f for f in os.listdir(csv_directory) if f.endswith('.csv')]
        print(f"Found {len(csv_files)} CSV files")
        
        for filename in csv_files:
            table_name = filename.replace('.csv', '').lower()
            try:
                df = pd.read_csv(os.path.join(csv_directory, filename))
                df.to_sql(table_name, engine, if_exists='replace', index=False)
                print(f"Successfully uploaded {filename} as table {table_name} ({len(df)} rows)")
            except Exception as e:
                print(f"Error uploading {filename}: {e}")
                
except Exception as e:
    print(f"Connection failed: {e}")
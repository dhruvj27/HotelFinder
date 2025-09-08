import os
import json
import time
import random
import joblib
import pandas as pd
from typing import Dict, List, Any, Optional

# Optional LLM imports (Gemini via langchain-google-genai). Use only if GEMINI_API_KEY is set.
try:
    from langchain_google_genai import ChatGoogleGenerativeAI
    from langchain.schema import HumanMessage
    LLM_AVAILABLE = True
except Exception:
    LLM_AVAILABLE = False

from google.api_core.exceptions import ResourceExhausted, NotFound

ARTIFACT_DIR = os.path.join(os.path.dirname(__file__), "artifacts")

# filenames (exact names you produced)
PROCESSED_CSV = os.path.join(ARTIFACT_DIR, "processed_data.csv")
SVD_JOBLIB = os.path.join(ARTIFACT_DIR, "svd_model.joblib")
CB_JOBLIB = os.path.join(ARTIFACT_DIR, "cb_recommender.joblib")
HOTEL_MAPPING_CSV = os.path.join(ARTIFACT_DIR, "hotel_mapping.csv")
METADATA_JSON = os.path.join(ARTIFACT_DIR, "metadata.json")

# Load CSVs and models on import (so startup loads all artifacts once)
print("Loading artifacts from:", ARTIFACT_DIR)

processed_data = pd.read_csv(PROCESSED_CSV)
hotel_mapping = pd.read_csv(HOTEL_MAPPING_CSV) if os.path.exists(HOTEL_MAPPING_CSV) else processed_data[['hotel_id','hotel_name']].drop_duplicates()
metadata = {}
if os.path.exists(METADATA_JSON):
    with open(METADATA_JSON, "r") as f:
        metadata = json.load(f)

# Load content-based recommender instance (if pickled)
cb_recommender = None
if os.path.exists(CB_JOBLIB):
    try:
        cb_recommender = joblib.load(CB_JOBLIB)
    except Exception as e:
        # If full object couldn't be loaded (rare), you can reinstantiate and call load_data
        print("Warning: failed to load cb_recommender.joblib:", e)
        try:
            from sklearn.preprocessing import MinMaxScaler
            # Fallback: rebuild CB recommender minimal wrapper
            class ContentBasedRecommender:
                def __init__(self):
                    self.hotels_df = None
                def load_data(self, df):
                    self.hotels_df = df.copy()
            cb_recommender = ContentBasedRecommender()
            cb_recommender.load_data(processed_data)
        except Exception:
            cb_recommender = None
else:
    cb_recommender = None

# Load SVD collaborative model
svd_algo = None
if os.path.exists(SVD_JOBLIB):
    try:
        svd_algo = joblib.load(SVD_JOBLIB)
    except Exception as e:
        print("Warning: failed to load svd_model.joblib:", e)
        svd_algo = None

# helper: get top-n collaborative predictions for a user
def get_top_n_collab(user_id: int, n: int = 10) -> pd.DataFrame:
    """
    Uses loaded svd_algo and processed_data/hotel_mapping to return top-n predicted hotels for user.
    """
    if svd_algo is None:
        return pd.DataFrame(columns=['hotel_id','predicted_rating','hotel_name'])
    all_hotels = processed_data['hotel_id'].unique().tolist()
    # exclude hotels user already interacted with if interactions exist in processed_data (not necessary)
    preds = []
    for hid in all_hotels:
        try:
            p = svd_algo.predict(user_id, hid)
            preds.append((int(p.iid), float(p.est)))
        except Exception:
            # if predict fails for this id, skip
            continue
    preds.sort(key=lambda x: x[1], reverse=True)
    top = preds[:n]
    df = pd.DataFrame(top, columns=['hotel_id','predicted_rating'])
    df = df.merge(hotel_mapping, on='hotel_id', how='left')
    return df

# ensemble merging 
def ensemble_recommend(user_preferences: Dict, user_id: Optional[int]=None, top_n: int = 5,
                       weight_cf: float = 0.6, weight_cb: float = 0.4) -> List[Dict]:
    # restrict by city if provided
    user_preferences = user_preferences or {}
    city_pref = user_preferences.get('city')
    city_col = 'city' if 'city' in processed_data.columns else ('location' if 'location' in processed_data.columns else None)
    if city_pref and city_col:
        allowed_ids = processed_data[processed_data[city_col] == city_pref]['hotel_id'].unique().tolist()
        if len(allowed_ids) == 0:
            return {"status": "no_city_matches", "message": "change your preference city"}
    else:
        allowed_ids = processed_data['hotel_id'].unique().tolist()

    # content-based recs
    cb_recs = []
    if cb_recommender is not None:
        try:
            cb_recs = cb_recommender.recommend(user_preferences, top_n=top_n*3)
            cb_df = pd.DataFrame(cb_recs)
        except Exception:
            cb_df = pd.DataFrame(columns=['hotel_id','similarity_score'])
    else:
        cb_df = pd.DataFrame(columns=['hotel_id','similarity_score'])

    if not cb_df.empty:
        cb_df = cb_df[cb_df['hotel_id'].isin(allowed_ids)].copy()
        cb_df['hotel_id'] = cb_df['hotel_id'].astype(int)
        if cb_df['similarity_score'].max() > cb_df['similarity_score'].min():
            cb_df['cb_norm'] = (cb_df['similarity_score'] - cb_df['similarity_score'].min()) / (cb_df['similarity_score'].max() - cb_df['similarity_score'].min() + 1e-9)
        else:
            cb_df['cb_norm'] = 1.0
    else:
        cb_df = pd.DataFrame(columns=['hotel_id','cb_norm'])

    # collaborative recommendations
    if user_id is not None and svd_algo is not None:
        cf_df = get_top_n_collab(user_id, n=top_n*5)
        if not cf_df.empty:
            cf_df = cf_df[cf_df['hotel_id'].isin(allowed_ids)].copy()
            if cf_df['predicted_rating'].max() > cf_df['predicted_rating'].min():
                cf_df['cf_norm'] = (cf_df['predicted_rating'] - cf_df['predicted_rating'].min()) / (cf_df['predicted_rating'].max() - cf_df['predicted_rating'].min() + 1e-9)
            else:
                cf_df['cf_norm'] = 1.0
        else:
            cf_df = pd.DataFrame(columns=['hotel_id','predicted_rating','cf_norm'])
    else:
        cf_df = pd.DataFrame(columns=['hotel_id','predicted_rating','cf_norm'])

    if cb_df.empty and cf_df.empty:
        return {"status":"no_matches_after_filter","message":"change your preference city or relax other filters"}

    merged = pd.merge(cb_df[['hotel_id','cb_norm']], cf_df[['hotel_id','cf_norm']], on='hotel_id', how='outer').fillna(0)
    merged['combined_score'] = weight_cf * merged['cf_norm'] + weight_cb * merged['cb_norm']
    merged = merged.sort_values('combined_score', ascending=False).head(top_n)
    merged = merged.merge(processed_data[['hotel_id','hotel_name','city','price_per_night','star_rating']], on='hotel_id', how='left').drop_duplicates('hotel_id')

    results = []
    for _, row in merged.iterrows():
        explanation = []
        if row.get('cf_norm',0) > 0:
            explanation.append(f"Collaborative score contribution: {row['cf_norm']:.3f}")
        if row.get('cb_norm',0) > 0:
            explanation.append(f"Content similarity contribution: {row['cb_norm']:.3f}")
        results.append({
            'hotel_id': int(row['hotel_id']),
            'hotel_name': row.get('hotel_name','Unknown'),
            'city': row.get('city',''),
            'price_per_night': float(row.get('price_per_night')) if not pd.isna(row.get('price_per_night')) else None,
            'star_rating': row.get('star_rating'),
            'combined_score': float(row['combined_score']),
            'explanation': " | ".join(explanation)
        })
    return results

# LLM explanation generator (with simple retry/backoff). If GEMINI_API_KEY not set or LLM unavailable,
# it will populate llm_explanation="" and llm_error with a message.
def generate_explanations(recs: List[Dict], user_prefs: Dict, model_name: str = "gemini-1.5-flash",
                          max_tokens: int = 120, max_retries: int = 2, pause_between: float = 12.0) -> List[Dict]:
    gemini_key = os.environ.get("GEMINI_API_KEY")
    if not gemini_key or not LLM_AVAILABLE:
        # LLM not available — annotate with error and return original recs
        for r in recs:
            r['llm_explanation'] = ""
            r['llm_error'] = "GEMINI_API_KEY not set or langchain_google_genai not installed"
        return recs

    # instantiate LLM
    try:
        llm = ChatGoogleGenerativeAI(model=model_name, temperature=0.0, max_output_tokens=max_tokens, google_api_key=gemini_key)
    except Exception as e:
        for r in recs:
            r['llm_explanation'] = ""
            r['llm_error'] = f"LLM init error: {str(e)}"
        return recs

    enriched = []
    for i, r in enumerate(recs):
        r['llm_explanation'] = ""
        r.pop('llm_error', None)
        # space out calls to avoid hitting rate limits quickly
        if i > 0:
            time.sleep(pause_between)
        retry = 0
        while retry <= max_retries:
            try:
                # minimal prompt
                name = r.get('hotel_name')
                city = r.get('city')
                price = r.get('price_per_night')
                star = r.get('star_rating')
                amenities = ""  # optionally you could extract amenity list from processed_data

                # Handle star rating display
                if star == -1:
                    star_display = "star rating unknown"
                else:
                    star_display = f"{star}★"

                prompt = (
                    f"Explain in 2 short sentences why {name} (in {city}, ₹{price}/night, {star_display}) "
                    f"is a good match for user prefs: {json.dumps(user_prefs)}. "
                    "Mention a tradeoff if any. Note: If star rating is -1, it means the star rating is not known. Only star ratings 3, 4, 5 are significant."
                )
                human_msg = HumanMessage(content=prompt)
                resp = llm.invoke([human_msg])
                # extract text robustly:
                text = ""
                if isinstance(resp, str):
                    text = resp
                else:
                    # try to access .content or dict forms
                    try:
                        text = getattr(resp, "content", "") or getattr(resp, "text", "") or str(resp)
                    except Exception:
                        text = str(resp)
                text = (text or "").strip().replace("\n", " ")
                if text:
                    r['llm_explanation'] = text
                    break
                else:
                    r['llm_explanation'] = ""
                    r['llm_error'] = "empty response"
                    break
            except ResourceExhausted as e:
                retry += 1
                wait = min(60, 2 ** retry + random.random())
                time.sleep(wait)
                if retry > max_retries:
                    r['llm_explanation'] = ""
                    r['llm_error'] = "rate limit / quota exceeded after retries"
            except NotFound as e:
                r['llm_explanation'] = ""
                r['llm_error'] = "model not found"
                break
            except Exception as e:
                r['llm_explanation'] = ""
                r['llm_error'] = f"LLM error: {str(e)[:200]}"
                break

        enriched.append(r)
    return enriched
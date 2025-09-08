import os
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
import threading
import time
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Hotel Finder NextStay")

# CORS middleware (allow all origins)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods
    allow_headers=["*"],  # Allows all headers
)

# Global variables to track loading state
models_loaded = False
loading_error = None
recommender_module = None

def load_models_async():
    """Load models in background thread"""
    global models_loaded, loading_error, recommender_module
    try:
        print("Starting model loading...")
        from recommender import ensemble_recommend, generate_explanations
        recommender_module = {
            'ensemble_recommend': ensemble_recommend,
            'generate_explanations': generate_explanations
        }
        models_loaded = True
        print("Models loaded successfully!")
    except Exception as e:
        loading_error = str(e)
        print(f"Error loading models: {e}")

# Start loading models in background thread
loading_thread = threading.Thread(target=load_models_async, daemon=True)
loading_thread.start()

class PrefsModel(BaseModel):
    user_id: Optional[int] = None
    user_preferences: Dict[str, Any]
    top_n: Optional[int] = 5
    explain: Optional[bool] = False
    llm_model: Optional[str] = "gemini-1.5-flash"

@app.get("/healthz")
def health():
    """Health check that responds immediately"""
    return {"status": "ok", "models_loaded": models_loaded}

@app.get("/readiness")
def readiness():
    """Readiness check that waits for models to load"""
    if loading_error:
        raise HTTPException(status_code=500, detail=f"Model loading failed: {loading_error}")
    if not models_loaded:
        raise HTTPException(status_code=503, detail="Models still loading...")
    return {"status": "ready", "models_loaded": True}

@app.post("/recommend")
def recommend(payload: PrefsModel):
    if loading_error:
        raise HTTPException(status_code=500, detail=f"Models failed to load: {loading_error}")
    if not models_loaded:
        raise HTTPException(status_code=503, detail="Models still loading, please try again in a few moments")
    
    try:
        recs = recommender_module['ensemble_recommend'](
            payload.user_preferences, 
            user_id=payload.user_id, 
            top_n=payload.top_n
        )
        
        if payload.explain:
            recs = recommender_module['generate_explanations'](
                recs, payload.user_preferences, model_name=payload.llm_model
            )
        return {"status": "success", "results": recs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=False)
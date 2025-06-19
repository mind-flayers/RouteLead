from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import joblib
import os

# 1) Define the input schema
class PredictRequest(BaseModel):
    distance: float = Field(..., gt=0, description="Trip distance in km")
    weight:   float = Field(..., gt=0, description="Load weight in kg")
    volume:   float = Field(..., gt=0, description="Load volume in m³")

# 2) Load your model once at startup
model_path = os.path.join(os.path.dirname(__file__), "models", "price_model.joblib")
if not os.path.isfile(model_path):
    raise RuntimeError(f"Model not found at {model_path}")
model = joblib.load(model_path)

app = FastAPI(
    title="RouteLead Pricing Service",
    version="1.0",
    description="Predicts parcel delivery price based on distance, weight, and volume."
)

# 3) Health check endpoint
@app.get("/health")
def health():
    return {"status": "ok"}

# 4) Prediction endpoint
@app.post("/predict")
def predict(req: PredictRequest):
    try:
        features = [[req.distance, req.weight, req.volume]]
        price = model.predict(features)[0]
        return {"price": float(price)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

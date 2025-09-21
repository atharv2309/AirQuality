from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, Dict, List, Any
import httpx
import asyncio
import requests
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
import json
from geopy.distance import geodesic
import random
import hashlib

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Air Quality Forecasting API",
    description="Real-time API integrating NASA TEMPO satellite data with ground-based sensors",
    version="2.0.0"
)

# CORS middleware for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}

@app.get("/aq/now")
async def get_current_air_quality(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude")
):
    """Get current air quality for a location"""
    # For now, return dummy data
    return {
        "lat": lat,
        "lon": lon,
        "timestamp": datetime.utcnow().isoformat(),
        "aqi": 65,
        "pm25": 15.5,
        "o3": 45.2,
        "category": "Moderate",
        "source": "demo_data"
    }

@app.get("/forecast")
async def get_air_quality_forecast(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"), 
    horizon: int = Query(24, description="Forecast horizon in hours"),
    use_real_data: bool = Query(True, description="Use real-time data sources")
):
    """Get air quality forecast integrating NASA TEMPO, OpenAQ, and weather data"""
    try:
        if use_real_data:
            # Import here to avoid circular imports
            from data_sources import data_fusion_engine
            
            # Get comprehensive real-time data
            real_time_data = await data_fusion_engine.get_comprehensive_air_quality(lat, lon)
            
            # Extract current conditions from real data
            current_aqi = real_time_data.get("weather_adjusted_aqi") or real_time_data.get("overall_aqi", 50)
            current_pm25 = 0
            current_pollutants = real_time_data.get("pollutants", {})
            
            if "pm25" in current_pollutants:
                current_pm25 = current_pollutants["pm25"]["value"]
            else:
                current_pm25 = current_aqi * 0.4  # Estimate if not available
            
            # Generate forecast based on real current conditions
            forecast_data = generate_realistic_forecast(lat, lon, current_aqi, current_pm25, horizon, real_time_data)
            
            return {
                "lat": lat,
                "lon": lon,
                "forecast": forecast_data,
                "real_time_data": real_time_data,
                "model": "tempo_openaq_integrated_v1",
                "data_sources": real_time_data.get("data_sources", {}),
                "data_quality": real_time_data.get("data_quality", "unknown"),
                "generated_at": datetime.utcnow().isoformat()
            }
        else:
            # Fallback to mock data
            return generate_mock_forecast(lat, lon, horizon)
            
    except Exception as e:
        print(f"Real-time data error: {e}")
        # Fallback to mock data if real data fails
        return generate_mock_forecast(lat, lon, horizon)

@app.post("/calendar/score")
async def score_calendar_events():
    """Score calendar events for air quality risk"""
    # Stub implementation
    return {
        "message": "Calendar scoring not yet implemented",
        "events": []
    }

@app.get("/health/recommendations")
async def get_health_recommendations_endpoint(
    aqi: int = Query(..., description="AQI value")
):
    """Get health recommendations for a specific AQI value"""
    return get_health_recommendations(aqi)

@app.get("/realtime/detailed")
async def get_detailed_realtime_data(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude")
):
    """Get detailed real-time data from all sources (NASA TEMPO, OpenAQ, Weather)"""
    try:
        from data_sources import data_fusion_engine
        
        real_time_data = await data_fusion_engine.get_comprehensive_air_quality(lat, lon)
        
        return {
            "status": "success",
            "timestamp": datetime.utcnow().isoformat(),
            "location": {"lat": lat, "lon": lon},
            "data": real_time_data
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch real-time data: {str(e)}"
        )

@app.get("/aqi/reference")
async def get_aqi_reference():
    """Get AQI reference table with all categories and recommendations"""
    return {
        "categories": [
            {
                "range": "0-50",
                "level": "Good",
                "color": "#00e400",
                "description": "Air quality is excellent",
                "health_impact": "No health impacts expected",
                "recommendations": ["Perfect for all outdoor activities", "Great for exercise", "Safe for everyone"]
            },
            {
                "range": "51-100", 
                "level": "Moderate",
                "color": "#ffff00",
                "description": "Air quality is acceptable",
                "health_impact": "Minor symptoms possible for very sensitive people",
                "recommendations": ["Generally safe for outdoor activities", "Sensitive individuals should monitor symptoms"]
            },
            {
                "range": "101-150",
                "level": "Unhealthy for Sensitive Groups",
                "color": "#ff7e00",
                "description": "Sensitive groups should take precautions",
                "health_impact": "Increased symptoms for sensitive groups",
                "recommendations": ["Sensitive individuals should wear masks", "Limit prolonged outdoor activities", "Use air purifiers"]
            },
            {
                "range": "151-200",
                "level": "Unhealthy", 
                "color": "#ff0000",
                "description": "Everyone should take precautions",
                "health_impact": "Health effects possible for everyone",
                "recommendations": ["Wear N95 masks outdoors", "Stay indoors when possible", "Avoid outdoor exercise"]
            },
            {
                "range": "201-300",
                "level": "Very Unhealthy",
                "color": "#8f3f97",
                "description": "Health alert for everyone",
                "health_impact": "Serious health effects for everyone",
                "recommendations": ["Emergency precautions", "Stay indoors", "Seek medical attention if symptomatic"]
            },
            {
                "range": "301+",
                "level": "Hazardous",
                "color": "#7e0023", 
                "description": "Health emergency",
                "health_impact": "Life-threatening conditions",
                "recommendations": ["Emergency conditions", "Avoid all outdoor exposure", "Immediate medical attention if needed"]
            }
        ],
        "sources": ["EPA Air Quality Standards", "WHO Air Quality Guidelines"],
        "last_updated": datetime.utcnow().isoformat()
    }

def get_aqi_category(aqi: int) -> str:
    """Convert AQI value to EPA category"""
    if aqi <= 50:
        return "Good"
    elif aqi <= 100:
        return "Moderate"
    elif aqi <= 150:
        return "Unhealthy for Sensitive Groups"
    elif aqi <= 200:
        return "Unhealthy"
    elif aqi <= 300:
        return "Very Unhealthy"
    else:
        return "Hazardous"

def generate_realistic_forecast(lat: float, lon: float, current_aqi: int, current_pm25: float, 
                               horizon: int, real_time_data: dict) -> list:
    """Generate realistic forecast based on real current conditions"""
    forecast_data = []
    
    # Extract weather influence
    weather_data = real_time_data.get("weather_data", {})
    weather_impact = weather_data.get("air_quality_impact", "moderate")
    wind_speed = weather_data.get("wind_speed", 5)
    
    for i in range(horizon):
        # Time-based adjustments
        hour_of_day = (datetime.utcnow().hour + i) % 24
        
        # Daily pattern adjustments
        daily_factor = 1.0
        if 7 <= hour_of_day <= 9 or 17 <= hour_of_day <= 19:  # Rush hours
            daily_factor = 1.2
        elif 22 <= hour_of_day or hour_of_day <= 5:  # Night
            daily_factor = 0.8
        elif 10 <= hour_of_day <= 16:  # Midday photochemical activity
            daily_factor = 1.1
        
        # Weather influence over time
        weather_factor = 1.0
        if weather_impact == "good_dispersion":
            weather_factor = 0.9 - (i * 0.01)  # Improves over time
        elif weather_impact == "poor_dispersion":
            weather_factor = 1.1 + (i * 0.01)  # Worsens over time
        elif weather_impact == "cleansing":
            weather_factor = 0.8 + (i * 0.02)  # Improves then gradually returns
        
        # Calculate forecasted AQI
        forecasted_aqi = current_aqi * daily_factor * weather_factor
        forecasted_aqi = max(5, min(300, int(forecasted_aqi)))
        
        # Calculate PM2.5 based on AQI
        forecasted_pm25 = max(0, current_pm25 * daily_factor * weather_factor)
        
        # Uncertainty increases with time
        uncertainty = 10 + (i * 2)
        lower_bound = max(0, forecasted_aqi - uncertainty)
        upper_bound = min(500, forecasted_aqi + uncertainty)
        
        forecast_entry = {
            "hour": i,
            "timestamp": (datetime.utcnow() + timedelta(hours=i)).isoformat(),
            "aqi": forecasted_aqi,
            "aqi_lower": int(lower_bound),
            "aqi_upper": int(upper_bound),
            "pm25": round(forecasted_pm25, 1),
            "category": get_aqi_category(forecasted_aqi)
        }
        
        # Add health recommendations for current hour
        if i == 0:
            forecast_entry["health_recommendations"] = get_health_recommendations(forecasted_aqi)
            forecast_entry["real_time_sources"] = {
                "satellite_data": real_time_data.get("data_sources", {}).get("satellite", False),
                "ground_sensors": real_time_data.get("data_sources", {}).get("ground_sensors", False),
                "weather_data": real_time_data.get("data_sources", {}).get("weather", False)
            }
        
        forecast_data.append(forecast_entry)
    
    return forecast_data

def generate_mock_forecast(lat: float, lon: float, horizon: int) -> dict:
    """Generate mock forecast data (fallback)"""
    # Use location to seed random data (so same location gives consistent results)
    location_seed = int(hashlib.md5(f"{lat:.2f},{lon:.2f}".encode()).hexdigest()[:8], 16)
    random.seed(location_seed)
    
    # Generate location-based base AQI (varies by geography)
    base_aqi = 30 + int((abs(lat) + abs(lon)) * 2) % 120  # Range 30-150
    base_aqi += random.randint(-15, 15)  # Add some randomness
    base_aqi = max(10, min(200, base_aqi))  # Keep in reasonable range
    
    forecast_data = []
    
    for i in range(horizon):
        # More realistic daily patterns
        hour_of_day = (i) % 24
        
        # Daily pattern: worse during rush hours, better at night
        daily_factor = 1.0
        if 7 <= hour_of_day <= 9 or 17 <= hour_of_day <= 19:  # Rush hours
            daily_factor = 1.3
        elif 22 <= hour_of_day or hour_of_day <= 5:  # Night/early morning
            daily_factor = 0.7
        
        # Some randomness and trend
        trend_factor = 1 + (i * 0.02) + random.uniform(-0.1, 0.1)
        
        aqi = int(base_aqi * daily_factor * trend_factor)
        aqi = max(5, min(300, aqi))  # Keep in valid range
        
        # Uncertainty bands
        lower_bound = max(0, aqi - random.randint(15, 25))
        upper_bound = min(500, aqi + random.randint(15, 25))
        
        forecast_data.append({
            "hour": i,
            "timestamp": (datetime.utcnow() + timedelta(hours=i)).isoformat(),
            "aqi": aqi,
            "aqi_lower": lower_bound,
            "aqi_upper": upper_bound,
            "pm25": round(aqi * 0.3 + random.uniform(-2, 2), 1),  # More realistic PM2.5
            "category": get_aqi_category(aqi),
            "health_recommendations": get_health_recommendations(aqi) if i == 0 else None  # Only include for current hour
        })
    
    return {
        "lat": lat,
        "lon": lon,
        "forecast": forecast_data,
        "model": "mock_data_fallback",
        "generated_at": datetime.utcnow().isoformat()
    }

def get_health_recommendations(aqi: int) -> dict:
    """Get health recommendations based on AQI level following international standards"""
    if aqi <= 50:  # Good
        return {
            "level": "Good",
            "message": "Air quality is excellent! Perfect for all outdoor activities.",
            "recommendations": [
                "🚴‍♂️ Great time for outdoor exercise and activities",
                "🌳 Enjoy walks in parks and nature",
                "🏃‍♀️ Perfect for jogging and running",
                "👶 Safe for children to play outside"
            ],
            "sensitive_groups": "No precautions needed for any group",
            "mask_needed": False,
            "outdoor_activities": "Highly recommended"
        }
    elif aqi <= 100:  # Moderate
        return {
            "level": "Moderate",
            "message": "Air quality is acceptable for most people.",
            "recommendations": [
                "🚶‍♂️ Outdoor activities are generally safe",
                "👥 Sensitive individuals should consider reducing prolonged outdoor activities",
                "🌅 Early morning and evening are best times for outdoor exercise",
                "💨 Ensure good ventilation indoors"
            ],
            "sensitive_groups": "Sensitive individuals may experience minor symptoms",
            "mask_needed": False,
            "outdoor_activities": "Generally safe"
        }
    elif aqi <= 150:  # Unhealthy for Sensitive Groups
        return {
            "level": "Unhealthy for Sensitive Groups",
            "message": "Sensitive groups should take precautions.",
            "recommendations": [
                "😷 Consider wearing masks for sensitive individuals",
                "🏠 Limit prolonged outdoor activities for sensitive groups",
                "🌬️ Use air purifiers indoors",
                "⚡ Reduce outdoor exercise intensity",
                "👴 Elderly and children should stay indoors when possible"
            ],
            "sensitive_groups": "Children, elderly, and people with heart/lung conditions should limit outdoor exposure",
            "mask_needed": True,
            "outdoor_activities": "Limited for sensitive groups"
        }
    elif aqi <= 200:  # Unhealthy
        return {
            "level": "Unhealthy",
            "message": "Everyone should take precautions to limit exposure.",
            "recommendations": [
                "😷 Wear N95 or equivalent masks when outdoors",
                "🏠 Stay indoors as much as possible",
                "🚫 Avoid outdoor exercise and strenuous activities",
                "🪟 Keep windows and doors closed",
                "🌬️ Use HEPA air purifiers indoors",
                "💊 Have medications ready if you have respiratory conditions"
            ],
            "sensitive_groups": "High risk - should avoid outdoor activities entirely",
            "mask_needed": True,
            "outdoor_activities": "Not recommended"
        }
    elif aqi <= 300:  # Very Unhealthy
        return {
            "level": "Very Unhealthy",
            "message": "Health alert! Everyone should avoid outdoor activities.",
            "recommendations": [
                "🚨 Emergency precautions - stay indoors",
                "😷 Wear N95/P100 masks if you must go outside",
                "🏥 Seek medical attention if experiencing symptoms",
                "🚫 Cancel all outdoor activities and events",
                "🌬️ Use multiple air purifiers and seal windows",
                "📞 Check on elderly neighbors and relatives"
            ],
            "sensitive_groups": "Emergency risk - seek immediate medical attention if experiencing symptoms",
            "mask_needed": True,
            "outdoor_activities": "Strongly discouraged"
        }
    else:  # Hazardous (300+)
        return {
            "level": "Hazardous",
            "message": "Health emergency! Avoid all outdoor exposure.",
            "recommendations": [
                "🆘 Emergency conditions - stay indoors immediately",
                "😷 N95/P100 masks required for any outdoor exposure",
                "🏥 Seek immediate medical attention if experiencing any symptoms",
                "📱 Monitor local emergency alerts",
                "🌬️ Seal all air leaks and use professional air filtration",
                "🚨 Consider evacuation if conditions persist"
            ],
            "sensitive_groups": "Life-threatening conditions - immediate medical attention may be required",
            "mask_needed": True,
            "outdoor_activities": "Prohibited"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
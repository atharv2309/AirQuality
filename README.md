# Air Quality Forecasting Demo

**"From EarthData to Action"** — A hackathon-style demo that forecasts air quality using OpenAQ ground monitors and weather.gov data with a lightweight persistence model.

## ✨ Features

### 🗺️ **Advanced Mapping**
- **Google Maps Integration** with Terrain (default), Satellite, and Roads views
- **Location Search Bar** - Search for any city or place worldwide
- **Map Maximize Mode** - Full-screen map with floating data windows
- **Smart Location Markers** - Custom air quality indicators
- **Fallback Support** - Works without Google Maps API if needed

### 📊 **Air Quality Intelligence**
- **Real-time Forecasts** - Location-specific AQI predictions with uncertainty bands
- **Smart Data Variation** - Different locations show unique air quality patterns  
- **EPA Health Categories** - Color-coded badges with emoji indicators
- **24-hour Charts** - Beautiful forecasts with Recharts visualization

### 🎨 **Modern Design**
- **Dark/Light Mode** - Automatic theme detection with manual toggle
- **GenZ Aesthetic** - Glassmorphism, gradients, and smooth animations
- **Responsive Design** - Works perfectly on desktop and mobile
- **Accessibility** - Screen reader friendly with proper contrast

### 📅 **Smart Calendar**
- **ICS File Upload** - Score calendar events for air quality risk
- **Risk Assessment** - Get alternative time suggestions for poor air quality
- **Event Optimization** - Plan activities around better air quality windows

## Quick Start

### 1. Start the API (Backend)

```bash
cd api
pip install -r requirements.txt
uvicorn main:app --reload
```

The API will be available at http://localhost:8000

- Health check: http://localhost:8000/health
- Docs: http://localhost:8000/docs

### 2. Configure Google Maps (Optional but Recommended)

See `GOOGLE_MAPS_SETUP.md` for detailed instructions. To quickly enable:

```bash
cd web
# Edit .env.local and add your Google Maps API key
echo "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here" > .env.local
```

### 3. Start the Web App (Frontend)

```bash
cd web
npm install
npm run dev
```

The web app will be available at http://localhost:3000

## API Endpoints

- `GET /health` - Health check
- `GET /aq/now?lat=&lon=` - Current air quality
- `GET /forecast?lat=&lon=&horizon=24` - Air quality forecast
- `POST /calendar/score` - Score calendar events (coming soon)

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Leaflet (maps)
- Recharts (charts)

### Backend
- FastAPI (Python 3.11)
- In-memory caching
- OpenAQ API integration
- Weather.gov API integration

## Demo Data

The app currently uses dummy data for development. Real API integrations are coming in the next phase.

## Health Categories

- **Good (0-50)**: Air quality is satisfactory
- **Moderate (51-100)**: Acceptable for most people
- **Unhealthy for Sensitive Groups (101-150)**: Sensitive individuals may experience problems
- **Unhealthy (151-200)**: Everyone may experience problems
- **Very Unhealthy (201-300)**: Health alert
- **Hazardous (301+)**: Emergency conditions

## Development Notes

This is a hackathon-style demo focused on functionality over production readiness. No external databases or complex deployment required.
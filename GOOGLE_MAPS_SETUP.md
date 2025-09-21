# Google Maps API Setup

To enable Google Maps functionality in the air quality app, you need to set up a Google Maps API key.

## Steps to Get Google Maps API Key:

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create a new project** (or select existing one)
3. **Enable APIs**:
   - Go to "APIs & Services" > "Library"
   - Search and enable: "Maps JavaScript API"
   - Search and enable: "Places API" (for search functionality)
   - Search and enable: "Geocoding API" (for location search)

4. **Create API Key**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the API key

5. **Configure the API Key**:
   - Edit the file: `web/.env.local`
   - Replace `your_google_maps_api_key_here` with your actual API key:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

6. **Secure the API Key** (recommended):
   - In Google Cloud Console, go to your API key settings
   - Add "HTTP referrer" restrictions:
     - `http://localhost:3000/*`
     - `http://localhost:3001/*`
     - Add your production domain when deploying

## Features Enabled with Google Maps:

✅ **Location Search Bar** - Search for cities and places
✅ **Google Maps Integration** - High-quality satellite and terrain maps  
✅ **Map Type Selector** - Switch between Terrain (default), Satellite, and Roads
✅ **Map Maximize** - Full-screen map view with overlay data windows
✅ **Enhanced Markers** - Custom air quality location markers

## Fallback Behavior:

If no API key is configured, the app will:
- Show a "Map not available" message
- Fall back to basic map functionality 
- Search will still work using OpenStreetMap geocoding
- Core air quality features remain functional

## Cost Information:

Google Maps has a generous free tier:
- First $200/month is free
- For a demo/hackathon app, you'll likely stay within free limits
- Maps JavaScript API: $7 per 1,000 loads (first 28,000 free monthly)
- Places API: $32 per 1,000 requests (first 2,500 free monthly)

The app is designed to be cost-efficient for demonstration purposes.
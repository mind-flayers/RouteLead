# Google Maps API Setup Guide

## Step 1: Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. **Enable the "Geocoding API"** (this is critical!)
   - Go to "APIs & Services" → "Library"
   - Search for "Geocoding API"
   - Click on it and press "Enable"
4. Go to "Credentials" and create an API key
5. **Configure API Key Restrictions**:
   - Application restrictions: None (for testing) or HTTP referrers
   - API restrictions: Restrict to "Geocoding API" only

## ⚠️ IMPORTANT: Enable Geocoding API
Make sure you enable the **Geocoding API** specifically, not just the general Maps API.

## Step 2: Add API Key to Your Project

Create or update your `.env` file in the project root:

```bash
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyAkkqJic5-Bkv2qrRBVs6hOtNg2szyOJGs
```

## Step 3: Test the Implementation

The geocoding service will now:
1. **Primary**: Use Google Maps API for best accuracy
2. **Fallback**: Use Nominatim if Google fails or API key missing
3. **Cache**: Results for 1 hour to reduce API calls

## Expected Results

### Google Maps API provides:
- **Establishments**: "Department of Education, Kandy"
- **Buildings**: "Building Name, Area"  
- **Precise Areas**: "Bogambara, Kandy"
- **Business Names**: "Kandy Railway Station"

### Benefits over Nominatim:
- More accurate location names
- Better business/establishment recognition
- Superior address parsing
- More up-to-date data

## API Usage & Costs

- **Free Tier**: 200 requests/day
- **Paid Tier**: $0.005 per request (very affordable)
- **Caching**: Reduces requests significantly

## Testing

Use these functions in console:
```javascript
// Test Google Maps geocoding
testGoogleMapsGeocode()

// Compare Google vs Nominatim
compareGeocodingServices(7.2906667, 80.6335482)
```

The system automatically falls back to Nominatim if Google API is unavailable or quota exceeded.

## Troubleshooting "REQUEST_DENIED" Error

If you get "This API key is not authorized to use this service or API":

### Solution 1: Enable Geocoding API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" → "Library"
4. Search for "Geocoding API" 
5. Click on "Geocoding API" and press "Enable"
6. Wait 5-10 minutes for changes to propagate

### Solution 2: Check API Key Restrictions
1. Go to "APIs & Services" → "Credentials"
2. Click on your API key
3. Under "API restrictions", select "Restrict key"
4. Add "Geocoding API" to the allowed APIs
5. Save changes

### Solution 3: Verify Billing Account
1. Make sure your Google Cloud project has billing enabled
2. Even the free tier requires a billing account setup

### Solution 4: Create New API Key
1. Delete the old API key
2. Create a new one with Geocoding API enabled from the start
3. Update your `.env` file with the new key

## Fallback Behavior
Don't worry! If Google Maps fails, the app automatically uses Nominatim API, so your location names will still work. Google Maps just provides better accuracy when properly configured.

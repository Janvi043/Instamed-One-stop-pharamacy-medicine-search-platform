# Google Maps Integration for Pharmacy Location

## Overview
This feature allows pharmacy owners to select their exact location on Google Maps during registration, and users can get precise directions to the pharmacy using those coordinates.

## What's Implemented

### 1. Pharmacy Registration (Frontend)
- **File**: `src/pages/PharmacyRegistration.js`
- **Features**:
  - Interactive Google Maps with search functionality
  - Click on map to place marker at desired location
  - Drag marker to adjust location
  - Search for address by typing in the search box
  - Automatic address lookup via Geocoding API
  - Location coordinates saved to backend

### 2. Pharmacy Model (Backend)
- **File**: `server/models/Pharmacy.js`
- **Location Field**:
  ```javascript
  location: {
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 }
  }
  ```

### 3. Pharmacy Registration Route (Backend)
- **File**: `server/routes/auth.js`
- **Endpoint**: `POST /api/auth/pharmacy/register`
- **Features**:
  - Accepts location data with latitude and longitude
  - Stores location in MongoDB
  - Returns location in response

### 4. Get Directions for Users (Frontend)
- **File**: `src/pages/PharmacyDetails.js`
- **Features**:
  - "🗺️ Get Directions" button
  - Uses pharmacy coordinates if available
  - Falls back to address search if coordinates not available
  - Opens Google Maps with directions in new tab

## Setup Instructions

### Step 1: Get Google Maps API Key
1. Visit: https://console.cloud.google.com/
2. Create a new project or select existing one
3. Enable these APIs:
   - **Maps JavaScript API**
   - **Geocoding API**
4. Go to Credentials → Create API Key
5. Copy your API Key

### Step 2: Add API Key to Frontend
1. Open `public/index.html`
2. Find the line with Google Maps script:
   ```html
   <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY_HERE"></script>
   ```
3. Replace `YOUR_API_KEY_HERE` with your actual API key
4. Save the file

### Step 3: Restart Frontend
```bash
npm start
```

### Step 4: Test the Feature
1. Go to http://localhost:3000/pharmacy-register
2. Fill in pharmacy details
3. Click "Select Location on Map"
4. Either:
   - Search for address in the search box
   - Click directly on the map
   - Drag the marker to adjust position
5. Register the pharmacy
6. Location will be saved to MongoDB

### Step 5: Test User Directions
1. Login as a user
2. Find the pharmacy
3. Click "Get Directions"
4. Google Maps will open with directions from your location to the pharmacy

## Files Modified/Created

### New Files:
- `src/pages/PharmacyRegistration.js` - Pharmacy registration with Google Maps
- `src/pages/PharmacyRegistration.css` - Styling for registration form
- `GOOGLE_MAPS_SETUP.md` - This setup guide

### Modified Files:
- `public/index.html` - Added Google Maps API script
- `server/models/Pharmacy.js` - Already had location field
- `server/routes/auth.js` - Updated to handle location in registration
- `src/App.js` - Added `/pharmacy-register` route
- `src/pages/PharmacyLogin.js` - Added link to registration
- `src/pages/PharmacyRegistration.css` - Styling for registration
- `src/pages/PharmacyDetails.js` - Enhanced Get Directions with coordinates
- `src/utils/api.js` - Added pharmacyRegister endpoint

## Security Considerations

1. **API Key Restrictions** (Recommended):
   - Restrict to Maps JavaScript API and Geocoding API only
   - Restrict to HTTP referrers (your domain)
   - Don't commit API key to public GitHub

2. **Location Data**:
   - Stored in MongoDB with pharmacy details
   - Used for user navigation only
   - Can be updated by pharmacy owner later

## Troubleshooting

### "Maps is not defined" error:
- Make sure API key is correctly added to `public/index.html`
- Refresh the browser page

### "API key not valid" error:
- Verify API key in Google Cloud Console
- Check if Maps JavaScript API is enabled
- Wait 5 minutes after enabling API

### Map not showing:
- Check browser console for errors
- Verify API key is correct
- Ensure internet connection

### Location not saving:
- Check MongoDB connection
- Verify backend is running on port 5000
- Check browser console for API errors

## Future Enhancements

1. Pharmacy can update location after registration
2. Distance calculation from user location
3. Multiple location support for chain pharmacies
4. Real-time location tracking
5. Route optimization for multiple pharmacies

## API Endpoints Reference

### Pharmacy Registration
```
POST /api/auth/pharmacy/register
Body: {
  pharmacyName: string,
  pharmacyType: "independent" | "chain",
  ownerName: string,
  npiNumber: string,
  licenseNumber: string,
  address: string,
  phoneNumber: string,
  email: string,
  userId: string,
  password: string,
  confirmPassword: string,
  location: {
    latitude: number,
    longitude: number
  }
}
```

### Pharmacy Login
```
POST /api/auth/pharmacy/login
Body: {
  userId: string,
  password: string
}
Response includes:
{
  location: {
    latitude: number,
    longitude: number
  },
  ...other fields
}
```

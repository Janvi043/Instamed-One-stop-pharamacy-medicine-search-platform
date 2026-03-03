# Google Maps API Setup Instructions

## How to get Google Maps API Key:

1. Go to https://console.cloud.google.com/
2. Create a new project (or select existing)
3. Enable the following APIs:
   - Maps JavaScript API
   - Geocoding API
4. Create an API Key (Credentials > Create Credentials > API Key)
5. Copy your API Key

## How to Add API Key:

1. Open `public/index.html`
2. Find this line:
   ```html
   <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxx"></script>
   ```
3. Replace `AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxx` with your actual API Key
4. Save the file and restart your React app

## Security Note:
- This is a frontend API key, so restrict it in Google Cloud Console:
  - Go to Credentials > Your API Key
  - Under "API restrictions", select "Maps JavaScript API"
  - Under "Application restrictions", select "HTTP referrers (web sites)"
  - Add your domain(s)

That's it! The Google Maps will now work in the PharmacyRegistration page.

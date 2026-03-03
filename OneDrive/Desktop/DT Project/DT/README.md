# InstaMed - One-Stop Pharmacy Medicine Search Platform

InstaMed is a comprehensive web platform designed to bridge the gap between users and pharmacies. It allows users to search for medications, find nearby pharmacies, and get directions, while providing pharmacies with a robust dashboard to manage inventory and analyze search trends.

## 🚀 Features

### For Users
- **Search for Medicines**: Easily find the availability of specific medications in local pharmacies.
- **Find Pharmacies**: Locate pharmacies near you with precise mapping.
- **Get Directions**: Integrated Google Maps support to navigate directly to your chosen pharmacy.
- **Real-time Availability**: Check if a medicine is in stock before visiting.

### For Pharmacies
- **Secure Registration & Login**: Dedicated portal for pharmacy owners.
- **Interactive Map Location**: Set exact pharmacy location using an interactive Google Maps interface during registration.
- **Analytics Dashboard**: Visualize search trends (e.g., top searched medicines) using dynamic charts (Recharts).
- **Inventory Management**: (In progress/Existing) Manage medicine listings.

## 🛠️ Technology Stack

- **Frontend**: React.js, React Router, Recharts, CSS3
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **APIs**: Google Maps JavaScript API, Geocoding API

## 📋 Setup Instructions

### Prerequisites
- Node.js installed
- MongoDB installed and running locally
- Google Maps API Key

### Backend Setup
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and add your MongoDB URI and port:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/instamed
   ```
4. Start the server:
   ```bash
   npm start
   ```

### Frontend Setup
1. Navigate to the root directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Add your Google Maps API Key:
   - Open `public/index.html`
   - Replace `YOUR_API_KEY_HERE` in the Google Maps script tag with your actual API key.
4. Start the React application:
   ```bash
   npm start
   ```

## 🗺️ Google Maps Integration
Detailed setup for the mapping features can be found in [GOOGLE_MAPS_SETUP.md](./GOOGLE_MAPS_SETUP.md).

## 📊 API Endpoints
- `POST /api/auth/user/register`: Register a new user
- `POST /api/auth/user/login`: User login
- `POST /api/auth/pharmacy/register`: Register a new pharmacy with location
- `POST /api/auth/pharmacy/login`: Pharmacy login
- `GET /api/medicine/search`: Search for medicines
- `GET /api/pharmacy/analytics`: Get search analytics for the dashboard

---
Developed as part of the DT Project.

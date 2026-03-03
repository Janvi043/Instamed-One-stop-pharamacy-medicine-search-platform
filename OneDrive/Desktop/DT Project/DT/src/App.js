import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import LandingPage from './pages/LandingPage';
import PharmacyLogin from './pages/PharmacyLogin';
import PharmacyRegistration from './pages/PharmacyRegistration';
import UserLogin from './pages/UserLogin';
import UserRegistration from './pages/UserRegistration';
import PharmacyHome from './pages/PharmacyHome';
import PharmacyProfile from './pages/PharmacyProfile';
import PharmacyMedicines from './pages/PharmacyMedicines';
import PharmacyAddMedicine from './pages/PharmacyAddMedicine';
import PharmacyEditMedicine from './pages/PharmacyEditMedicine';
import UserHome from './pages/UserHome';
import UserProfile from './pages/UserProfile';
import SearchResults from './pages/SearchResults';
import PharmacyDetails from './pages/PharmacyDetails';
import IllnessDetails from './pages/IllnessDetails';
import MedicineDetails from './pages/MedicineDetails';
import RecentHistory from './pages/RecentHistory';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />

          {/* Pharmacy Owner Routes */}
          <Route path="/pharmacy-login" element={<PharmacyLogin />} />
          <Route path="/pharmacy-register" element={<PharmacyRegistration />} />
          <Route path="/pharmacy-home" element={<PharmacyHome />} />
          <Route path="/pharmacy-profile" element={<PharmacyProfile />} />
          <Route path="/pharmacy-medicines" element={<PharmacyMedicines />} />
          <Route path="/pharmacy-add-medicine" element={<PharmacyAddMedicine />} />
          <Route path="/pharmacy-edit-medicine/:id" element={<PharmacyEditMedicine />} />

          {/* User Routes */}
          <Route path="/user-login" element={<UserLogin />} />
          <Route path="/user-registration" element={<UserRegistration />} />
          <Route path="/user-home" element={<UserHome isGuest={false} />} />
          <Route path="/user-home-guest" element={<UserHome isGuest={true} />} />
          <Route path="/user-profile" element={<UserProfile />} />
          <Route path="/search-results" element={<SearchResults isGuest={false} />} />
          <Route path="/search-results-guest" element={<SearchResults isGuest={true} />} />
          <Route path="/pharmacy-details/:id" element={<PharmacyDetails isGuest={false} />} />
          <Route path="/pharmacy-details-guest/:id" element={<PharmacyDetails isGuest={true} />} />
          <Route path="/illness/:id" element={<IllnessDetails isGuest={false} />} />
          <Route path="/illness-guest/:id" element={<IllnessDetails isGuest={true} />} />
          <Route path="/recent-history" element={<RecentHistory />} />
          <Route path="/medicine/:id" element={<MedicineDetails isGuest={false} />} />
          <Route path="/medicine-guest/:id" element={<MedicineDetails isGuest={true} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


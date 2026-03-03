import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { setAuthToken, setUser } from '../utils/auth';
import './PharmacyRegistration.css';

const PharmacyRegistration = () => {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [formData, setFormData] = useState({
    pharmacyName: '',
    pharmacyType: 'independent',
    ownerName: '',
    npiNumber: '',
    licenseNumber: '',
    address: '',
    phoneNumber: '',
    email: '',
    userId: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  // Initialize Google Map
  useEffect(() => {
    if (showMap && mapRef.current && !map) {
      initializeMap();
    }
  }, [showMap]);

  const initializeMap = () => {
    // Default center (can be user's location or a city center)
    const defaultCenter = [28.6139, 77.2090]; // Delhi

    // Create Leaflet map
    const newMap = window.L.map(mapRef.current).setView(defaultCenter, 13);

    // OSM tile layer
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(newMap);

    // Create a draggable marker
    const newMarker = window.L.marker(defaultCenter, { draggable: true }).addTo(newMap);

    // Update coordinates when marker is dragged
    newMarker.on('dragend', function (e) {
      const pos = e.target.getLatLng();
      setLatitude(pos.lat);
      setLongitude(pos.lng);
      reverseGeocode(pos.lat, pos.lng);
    });

    // Click on map to place marker
    newMap.on('click', function (e) {
      const clickedLocation = e.latlng;
      newMarker.setLatLng(clickedLocation);
      setLatitude(clickedLocation.lat);
      setLongitude(clickedLocation.lng);
      reverseGeocode(clickedLocation.lat, clickedLocation.lng);
    });

    setMap(newMap);
    setMarker(newMarker);
    setLatitude(defaultCenter[0]);
    setLongitude(defaultCenter[1]);
    // reverseGeocode for default
    reverseGeocode(defaultCenter[0], defaultCenter[1]);
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data && data.display_name) {
        setFormData({
          ...formData,
          address: data.display_name
        });
      }
    } catch (err) {
      console.error('Reverse geocoding error:', err);
    }
  };

  const handleSearchAddress = async () => {
    const addressInput = document.getElementById('addressSearch');
    if (!addressInput.value) {
      alert('Please enter an address to search');
      return;
    }

    try {
      const query = encodeURIComponent(addressInput.value);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
      const results = await res.json();
      if (results && results.length > 0) {
        const location = results[0];
        const lat = parseFloat(location.lat);
        const lon = parseFloat(location.lon);
        if (map && marker) {
          map.setView([lat, lon], 15);
          marker.setLatLng([lat, lon]);
        }
        setLatitude(lat);
        setLongitude(lon);
        setFormData({
          ...formData,
          address: location.display_name || addressInput.value
        });
      } else {
        alert('Address not found. Please try another address.');
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      alert('Address lookup failed.');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      setLoading(false);
      return;
    }

    if (!latitude || !longitude) {
      setError('Please select location on the map');
      setLoading(false);
      return;
    }

    try {
      // send full formData including confirmPassword so backend validation can compare
      const registrationData = {
        ...formData,
        location: { latitude, longitude }
      };
      const response = await authAPI.pharmacyRegister(registrationData);
      setAuthToken(response.data.token);
      setUser(response.data);
      alert('Pharmacy registration successful!');
      navigate('/pharmacy-home');
    } catch (err) {
      const errorMsg = err.response?.data?.errors?.[0]?.msg || 
                      err.response?.data?.message || 
                      'Registration failed. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pharmacy-registration-page">
      <div className="registration-container">
        <div className="back-button" onClick={() => navigate('/pharmacy-login')}>
          ← Back
        </div>

        <div className="registration-card card">
          <div className="registration-header">
            <div className="registration-icon">🏪</div>
            <h2>Register Your Pharmacy</h2>
            <p>Manage your pharmacy inventory and reach customers</p>
          </div>

          <form onSubmit={handleSubmit} className="registration-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="pharmacyName">Pharmacy Name *</label>
                <input
                  type="text"
                  id="pharmacyName"
                  name="pharmacyName"
                  value={formData.pharmacyName}
                  onChange={handleChange}
                  placeholder="Enter pharmacy name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="pharmacyType">Pharmacy Type *</label>
                <select
                  id="pharmacyType"
                  name="pharmacyType"
                  value={formData.pharmacyType}
                  onChange={handleChange}
                  required
                >
                  <option value="independent">Independent Pharmacy</option>
                  <option value="chain">Chain Pharmacy</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="ownerName">Owner Name *</label>
                <input
                  type="text"
                  id="ownerName"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  placeholder="Enter owner name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number *</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="npiNumber">NPI Number *</label>
                <input
                  type="text"
                  id="npiNumber"
                  name="npiNumber"
                  value={formData.npiNumber}
                  onChange={handleChange}
                  placeholder="National Provider Identifier"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="licenseNumber">Retail Drug License Number *</label>
                <input
                  type="text"
                  id="licenseNumber"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  placeholder="Enter license number"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Address *</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter complete address"
                rows="3"
                required
              />
            </div>

            <div className="form-group">
              <button type="button" className="btn btn-secondary" onClick={() => setShowMap(!showMap)}>
                📍 {showMap ? 'Close Map' : 'Select Location on Map'}
              </button>
            </div>

            {showMap && (
              <div className="map-container">
                <div className="search-box">
                  <input
                    type="text"
                    id="addressSearch"
                    placeholder="Search for address (e.g., 'Apollo Pharmacy, Delhi')"
                    className="address-search"
                  />
                  <button type="button" className="btn btn-search" onClick={handleSearchAddress}>
                    🔍 Search
                  </button>
                </div>
                <div ref={mapRef} className="google-map"></div>
                <p className="map-instructions">
                  Click on the map or drag the marker to select your pharmacy location
                </p>
              </div>
            )}

            {latitude && longitude && (
              <p className="location-info">
                📍 Location Selected: {latitude.toFixed(4)}, {longitude.toFixed(4)}
              </p>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="userId">Create User ID *</label>
                <input
                  type="text"
                  id="userId"
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  placeholder="Choose a unique user ID"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Create Password *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  required
                  minLength="6"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                required
                minLength="6"
              />
            </div>

            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="btn btn-primary submit-btn" disabled={loading}>
              {loading ? 'Registering...' : 'Register Pharmacy'}
            </button>

            <p className="login-link">
              Already have an account? <a href="/pharmacy-login">Login here</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PharmacyRegistration;

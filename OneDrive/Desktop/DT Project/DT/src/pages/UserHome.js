import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { medicineAPI, searchAPI, userAPI } from '../utils/api';
import { logout } from '../utils/auth';
import './UserHome.css';

const UserHome = ({ isGuest = false }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [nearbyPharmacies, setNearbyPharmacies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(() => {
    const saved = sessionStorage.getItem('userLocation');
    return saved ? JSON.parse(saved) : null;
  });
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [showInitialPrompt, setShowInitialPrompt] = useState(false);

  // Check for location on mount
  useEffect(() => {
    if (!userLocation) {
      // Delay slightly for better UX
      const timer = setTimeout(() => {
        setShowInitialPrompt(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []); // Run once on mount

  // Fetch pharmacies when location changes
  useEffect(() => {
    if (userLocation) {
      sessionStorage.setItem('userLocation', JSON.stringify(userLocation));
      fetchNearbyPharmacies(userLocation.latitude, userLocation.longitude);
    }
  }, [userLocation]);

  const getCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setUserLocation(newLocation);
          sessionStorage.setItem('userLocation', JSON.stringify(newLocation));
        },
        (error) => {
          console.warn('Geolocation error:', error);
        }
      );
    }
  };

  const searchLocationByName = async () => {
    if (!locationSearchQuery.trim()) return;

    setSearchingLocation(true);
    try {
      // Use Nominatim API to search location by name
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationSearchQuery)}`
      );
      const results = await response.json();

      console.log('Nominatim search results:', results);

      if (results.length > 0) {
        const { lat, lon } = results[0];
        const newLocation = {
          latitude: parseFloat(lat),
          longitude: parseFloat(lon)
        };
        console.log('Setting location to:', newLocation);
        setUserLocation(newLocation);
        sessionStorage.setItem('userLocation', JSON.stringify(newLocation));
        setLocationSearchQuery('');
      } else {
        alert('Location not found. Please try a different search.');
      }
    } catch (error) {
      console.error('Error searching location:', error);
      alert('Error searching location. Please try again.');
    } finally {
      setSearchingLocation(false);
    }
  };

  const fetchNearbyPharmacies = async (latitude, longitude) => {
    try {
      setLoading(true);
      console.log('Fetching pharmacies for location:', { latitude, longitude });
      const response = await searchAPI.getPharmaciesByLocation(latitude, longitude, 50);
      console.log('Pharmacies response:', response.data);

      // Debug: Check all pharmacies to see which have location data
      try {
        const allPharmacies = await searchAPI.getAllPharmacies();
        console.log('📊 All pharmacies in database:', allPharmacies.data);
      } catch (err) {
        console.log('Could not fetch all pharmacies');
      }

      setNearbyPharmacies(response.data.slice(0, 4)); // Limit to 4
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
      setNearbyPharmacies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const route = isGuest ? '/search-results-guest' : '/search-results';
    navigate(`${route}?query=${searchQuery}`);
  };

  const handleLogout = () => {
    logout();
    sessionStorage.removeItem('userLocation');
    navigate('/');
  };

  const commonIllnesses = [
    { id: 1, name: 'Cold & Flu', icon: '🤧', color: '#667eea' },
    { id: 2, name: 'Headache', icon: '🤕', color: '#f093fb' },
    { id: 3, name: 'Fever', icon: '🌡️', color: '#e74c3c' },
    { id: 4, name: 'Pain Relief', icon: '💊', color: '#11998e' },
    { id: 5, name: 'Stomach Issues', icon: '🤢', color: '#f5576c' },
    { id: 6, name: 'Allergies', icon: '🤒', color: '#38ef7d' },
    { id: 7, name: 'Cough', icon: '😷', color: '#764ba2' },
    { id: 8, name: 'Vitamins', icon: '💪', color: '#f6d365' }
  ];


  return (
    <div className="user-home-page">
      {/* Header with Profile */}
      <header className="user-header">
        <div className="header-content">
          <div onClick={() => navigate(isGuest ? '/user-home-guest' : '/user-home')}>
            <Logo size="medium" />
          </div>

          <div className="profile-section">
            <div
              className="location-header-toggle"
              style={{ position: 'relative' }}
            >
              <button
                onClick={() => setShowLocationMenu(!showLocationMenu)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  padding: '8px 12px',
                  borderRadius: '20px',
                  transition: 'background 0.3s',
                  backgroundColor: showLocationMenu ? 'rgba(255,255,255,0.2)' : 'transparent'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = showLocationMenu ? 'rgba(255,255,255,0.2)' : 'transparent'}
              >
                📍 {userLocation ? '✓' : 'Location'}
              </button>

              {showLocationMenu && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: '0',
                  background: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  minWidth: '220px',
                  marginTop: '8px',
                  zIndex: 1000,
                  padding: '12px'
                }}>
                  <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#666', fontWeight: '600' }}>Select Location</p>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                    <input
                      type="text"
                      placeholder="City, pincode..."
                      value={locationSearchQuery}
                      onChange={(e) => setLocationSearchQuery(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          searchLocationByName();
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: '6px 8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={searchLocationByName}
                      disabled={searchingLocation}
                      style={{
                        flex: 1,
                        padding: '6px 8px',
                        background: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      {searchingLocation ? '...' : 'Search'}
                    </button>
                    <button
                      onClick={getCurrentLocation}
                      style={{
                        flex: 1,
                        padding: '6px 8px',
                        background: '#11998e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      Current
                    </button>
                  </div>
                  {userLocation && (
                    <p style={{ margin: '8px 0 0 0', fontSize: '0.75rem', color: '#11998e', fontWeight: 'bold' }}>
                      ✓ Location set
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Initial Location Prompt Modal */}
            {showInitialPrompt && !userLocation && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                zIndex: 2000,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <div style={{
                  background: 'white',
                  padding: '24px',
                  borderRadius: '12px',
                  width: '90%',
                  maxWidth: '400px',
                  textAlign: 'center',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📍</div>
                  <h3 style={{ margin: '0 0 12px 0', color: '#333' }}>Set Your Location</h3>
                  <p style={{ color: '#666', marginBottom: '24px', lineHeight: '1.5' }}>
                    Please set your location to find nearby pharmacies and available medicines.
                  </p>
                  <button
                    onClick={() => {
                      setShowInitialPrompt(false);
                      setShowLocationMenu(true);
                    }}
                    style={{
                      background: '#667eea',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      width: '100%'
                    }}
                  >
                    OK, Set Location
                  </button>
                </div>
              </div>
            )}

            {isGuest ? (
              <button
                className="btn btn-secondary guest-login-btn"
                onClick={() => navigate('/user-login')}
              >
                Register / Sign In
              </button>
            ) : (
              <>
                <div
                  className="profile-button"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <div className="profile-avatar">👤</div>
                  <span className="profile-name">User</span>
                </div>

                {showProfileMenu && (
                  <div className="profile-dropdown">
                    <div className="dropdown-item" onClick={() => navigate('/user-profile')}>
                      <span>👤 My Profile</span>
                    </div>

                    <div className="dropdown-item" onClick={() => navigate('/recent-history')}>
                      <span>🕒 Recent History</span>
                    </div>

                    <div className="dropdown-divider"></div>
                    <div className="dropdown-item logout" onClick={handleLogout}>
                      <span>🚪 Logout</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="user-main">
        {/* Search Section */}
        <div className="search-section">
          <h2 className="search-title">Find Your Medicine</h2>
          <p className="search-subtitle">Search for medicines or pharmacies near you</p>

          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search for medicine or pharmacy..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="btn btn-primary search-button">
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Two Column Layout */}
        <div className="content-grid">
          {/* Nearby Pharmacies Section */}
          <div className="pharmacies-section">
            <h3 className="section-title">📍 Nearby Pharmacies</h3>
            <div className="pharmacies-list">
              {!userLocation ? (
                <div className="no-pharmacies">📍 Please select location to get pharmacies</div>
              ) : loading ? (
                <div className="loading-text">Loading pharmacies...</div>
              ) : nearbyPharmacies.length === 0 ? (
                <div className="no-pharmacies">No pharmacies found nearby</div>
              ) : (
                nearbyPharmacies.map(pharmacy => (
                  <div
                    key={pharmacy._id}
                    className="pharmacy-card card"
                    onClick={() => navigate(isGuest ? `/pharmacy-details-guest/${pharmacy._id}` : `/pharmacy-details/${pharmacy._id}`)}
                  >
                    <div className="pharmacy-info">
                      <div className="pharmacy-icon">🏪</div>
                      <div className="pharmacy-details">
                        <h4>{pharmacy.pharmacyName}</h4>
                        <p className="pharmacy-distance">📏 {pharmacy.distance.toFixed(2)} km away</p>
                      </div>
                    </div>
                    <div className={`pharmacy-status ${pharmacy.status?.toLowerCase() || 'open'}`}>
                      {pharmacy.status || 'Open'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Common Illnesses Section */}
          <div className="illnesses-section">
            <h3 className="section-title">💊 Common Illnesses</h3>
            <div className="illnesses-grid">
              {commonIllnesses.map(illness => (
                <div
                  key={illness.id}
                  className="illness-card card"
                  style={{ borderLeft: `4px solid ${illness.color}` }}
                  onClick={() => navigate(isGuest ? `/illness-guest/${illness.id}?name=${illness.name}` : `/illness/${illness.id}?name=${illness.name}`)}
                >
                  <div className="illness-icon">{illness.icon}</div>
                  <h4 className="illness-name">{illness.name}</h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserHome;



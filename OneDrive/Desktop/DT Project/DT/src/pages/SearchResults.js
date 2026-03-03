import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Logo from '../components/Logo';
import { searchAPI, userAPI } from '../utils/api';
import './SearchResults.css';

const SearchResults = ({ isGuest = false }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('query') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const lastSearchedQuery = React.useRef(null);
  const [userLocation, setUserLocation] = useState(() => {
    const saved = sessionStorage.getItem('userLocation');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (initialQuery && initialQuery !== lastSearchedQuery.current) {
      searchMedicinesAndPharmacies();
      lastSearchedQuery.current = initialQuery;
    }
  }, [initialQuery, userLocation]);

  const searchMedicinesAndPharmacies = async () => {
    try {
      setLoading(true);

      // Search for both medicines and pharmacies
      const medicineResponse = await searchAPI.searchMedicine(initialQuery);
      const pharmacyResponse = await searchAPI.searchPharmacy(initialQuery);

      console.log(`🔎 Performing search for: "${initialQuery}"`);

      const medicineResults = medicineResponse.data || [];
      const pharmacyResults = pharmacyResponse.data || [];

      // Save search history intelligently based on results
      if (!isGuest && (medicineResults.length > 0 || pharmacyResults.length > 0)) {
        try {
          let searchType = 'medicine';

          // Check for exact pharmacy name match
          const exactPharmacyMatch = pharmacyResults.some(
            p => p.pharmacyName?.toLowerCase() === initialQuery.toLowerCase()
          );

          if (exactPharmacyMatch || (medicineResults.length === 0 && pharmacyResults.length > 0)) {
            searchType = 'pharmacy';
          }

          console.log(`💾 Attempting to save search history: "${initialQuery}" (${searchType})`);
          const historyRes = await userAPI.saveSearch({ query: initialQuery, type: searchType });
          console.log('✅ Search history save response:', historyRes.data);
        } catch (err) {
          console.error('❌ Error saving search history:', err);
        }
      }

      console.log('Medicine search results:', medicineResults);
      console.log('Pharmacy search results:', pharmacyResults);

      // Combine results: medicines come first, then pharmacies without medicines
      let allResults = [];

      if (medicineResponse.data && medicineResponse.data.length > 0) {
        if (userLocation) {
          // If location is set, fetch pharmacies and filter by location
          const pharmacyLocationResponse = await searchAPI.getPharmaciesByLocation(
            userLocation.latitude,
            userLocation.longitude,
            50
          );

          const pharmaciesByLocation = pharmacyLocationResponse.data || [];

          // Combine medicine results with pharmacy distance data
          allResults = medicineResponse.data.map(medicine => ({
            ...medicine,
            distance: pharmaciesByLocation.find(p => p._id === medicine.pharmacyId._id)?.distance || 0
          })).sort((a, b) => a.distance - b.distance);
        } else {
          // Randomize if no location
          allResults = medicineResponse.data.sort(() => Math.random() - 0.5);
        }
      } else if (pharmacyResponse.data && pharmacyResponse.data.length > 0) {
        console.log('No medicines found, showing pharmacies:', pharmacyResponse.data);

        // If no medicines found, show pharmacies
        if (userLocation) {
          const pharmacyLocationResponse = await searchAPI.getPharmaciesByLocation(
            userLocation.latitude,
            userLocation.longitude,
            50
          );

          const pharmaciesByLocation = pharmacyLocationResponse.data || [];

          allResults = pharmacyResponse.data.map(pharmacy => ({
            _id: pharmacy._id,
            medicineName: `Pharmacy: ${pharmacy.pharmacyName}`,
            isPharmacy: true,
            pharmacyId: {
              _id: pharmacy._id,
              pharmacyName: pharmacy.pharmacyName,
              address: pharmacy.address,
              phone: pharmacy.phoneNumber,
              email: pharmacy.email,
              location: pharmacy.location,
              status: pharmacy.status
            },
            distance: pharmaciesByLocation.find(p => p._id === pharmacy._id)?.distance || 0
          })).sort((a, b) => a.distance - b.distance);
        } else {
          allResults = pharmacyResponse.data.map(pharmacy => ({
            _id: pharmacy._id,
            medicineName: `Pharmacy: ${pharmacy.pharmacyName}`,
            isPharmacy: true,
            pharmacyId: {
              _id: pharmacy._id,
              pharmacyName: pharmacy.pharmacyName,
              address: pharmacy.address,
              phone: pharmacy.phoneNumber,
              email: pharmacy.email,
              location: pharmacy.location,
              status: pharmacy.status
            }
          }));
        }
      }

      console.log('Final search results:', allResults);
      setSearchResults(allResults);
    } catch (error) {
      console.error('Error searching:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Save search if not guest
    if (!isGuest) {
      try {
        await userAPI.saveSearch({ query: searchQuery, type: 'medicine' }); // Default to medicine
      } catch (err) {
        console.error('Error saving search history:', err);
      }
    }

    const route = isGuest ? '/search-results-guest' : '/search-results';
    navigate(`${route}?query=${searchQuery}`);
  };

  const handleGetDirections = (pharmacy) => {
    window.open(`https://www.google.com/maps/search/${encodeURIComponent(pharmacy.address)}`, '_blank');
  };

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="search-results-page">
      <header className="user-header">
        <div className="header-content">
          <div onClick={() => navigate(isGuest ? '/user-home-guest' : '/user-home')}>
            <Logo size="medium" />
          </div>

          <div className="profile-section">
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

      <main className="search-main">
        <div className="search-section-top">
          <h2>Search Results</h2>
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

        <div className="results-info">
          <p>
            {loading ? 'Loading...' : `Found ${searchResults.length} results for "${initialQuery}"`}
            {userLocation && <span> near your location</span>}
          </p>
        </div>

        <div className="results-list">
          {loading ? (
            <div className="loading-text">Loading results...</div>
          ) : searchResults.length === 0 ? (
            <div className="no-results">No results found for "{initialQuery}"</div>
          ) : (
            searchResults.map((result) => (
              <div key={result._id} className="result-card card">
                <div className="pharmacy-header-info">
                  <div className="pharmacy-name-section">
                    <div className="pharmacy-icon">🏪</div>
                    <div>
                      <h3>{result.pharmacyId?.pharmacyName || 'Pharmacy'}</h3>
                      {userLocation && result.distance !== undefined && (
                        <p className="distance">📏 {result.distance.toFixed(2)} km away</p>
                      )}
                    </div>
                  </div>
                  <div className="stock-info">
                    {!result.isPharmacy && (
                      <span className={`stock-badge ${result.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                        {result.stock > 0 ? `${result.stock} in stock` : 'Out of stock'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="medicine-info-section">
                  <h4>💊 {result.medicineName}</h4>
                  {result.brand && !result.isPharmacy && <p className="brand-name">Brand: {result.brand}</p>}
                </div>

                <div className="pharmacy-contact">
                  <div className="contact-item">
                    <span className="icon">📞</span>
                    <a href={`tel:${result.pharmacyId?.phone}`}>{result.pharmacyId?.phone}</a>
                  </div>
                  <div className="contact-item">
                    <span className="icon">📍</span>
                    <span>{result.pharmacyId?.address}</span>
                  </div>
                </div>

                <div className="action-buttons">
                  <button
                    className="btn btn-primary"
                    onClick={() => handleGetDirections(result.pharmacyId)}
                  >
                    🗺️ Get Directions
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => navigate(`/pharmacy-details/${result.pharmacyId._id}`)}
                  >
                    View Pharmacy
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default SearchResults;


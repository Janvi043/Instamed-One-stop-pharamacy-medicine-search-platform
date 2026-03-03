import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Logo from '../components/Logo';
import { pharmacyAPI, searchAPI } from '../utils/api';
import './PharmacyDetails.css';

const PharmacyDetails = ({ isGuest = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('medicine'); // 'medicine' or 'illness'
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Real state
  const [pharmacy, setPharmacy] = useState(null);
  const [medicines, setMedicines] = useState([]); // All medicines in this pharmacy
  const [filteredMedicines, setFilteredMedicines] = useState([]); // Displayed medicines
  const [loading, setLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching details for pharmacy ID:', id);

        // 1. Get Pharmacy Details
        const pharmacyRes = await pharmacyAPI.getPharmacyDetails(id);
        console.log('Pharmacy details fetched:', pharmacyRes.data);
        const pharmacyData = pharmacyRes.data;

        // Format for UI
        setPharmacy({
          id: pharmacyData._id,
          name: pharmacyData.pharmacyName,
          address: pharmacyData.address,
          phone: pharmacyData.phoneNumber,
          email: pharmacyData.email,
          distance: '0.5 km', // TODO: Calculate real distance if user location is available
          status: pharmacyData.status || 'Open',
          openHours: '9:00 AM - 10:00 PM', // Default if not in DB
          location: pharmacyData.location
        });

        // 2. Get Pharmacy Medicines
        const medicinesRes = await searchAPI.getPharmacyMedicines(id);
        console.log('Pharmacy medicines fetched:', medicinesRes.data);
        setMedicines(medicinesRes.data);
        setFilteredMedicines(medicinesRes.data); // Show all initially
      } catch (error) {
        console.error('Error fetching pharmacy details:', error);
        // Fallback or error state could be set here
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleSearch = (e) => {
    e.preventDefault();
    setHasSearched(true);

    if (!searchQuery.trim()) {
      setFilteredMedicines(medicines);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = medicines.filter(med =>
      (med.name && med.name.toLowerCase().includes(query)) ||
      (med.brand && med.brand.toLowerCase().includes(query)) ||
      (med.purposes && (Array.isArray(med.purposes) ? med.purposes.join(' ').toLowerCase().includes(query) : med.purposes.toLowerCase().includes(query)))
    );
    setFilteredMedicines(filtered);
  };

  const handleGetDirections = () => {
    // If pharmacy has coordinates, use them for more accurate directions
    if (pharmacy.location && pharmacy.location.latitude && pharmacy.location.longitude) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.location.latitude},${pharmacy.location.longitude}`,
        '_blank'
      );
    } else {
      // Fallback to address search
      window.open(
        `https://www.google.com/maps/search/${encodeURIComponent(pharmacy.address)}`,
        '_blank'
      );
    }
  };

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="pharmacy-details-page">
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

      <main className="pharmacy-details-main">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>

        {loading || !pharmacy ? (
          <div className="loading-container">Loading pharmacy details...</div>
        ) : (
          <>
            <div className="pharmacy-info-card card">
              <div className="pharmacy-header-main">
                <div className="pharmacy-icon-large">🏪</div>
                <div className="pharmacy-main-info">
                  <h2>{pharmacy.name}</h2>
                  <div className={`status-badge ${pharmacy.status.toLowerCase()}`}>
                    {pharmacy.status} • {pharmacy.openHours}
                  </div>
                  <p className="distance-info">📏 {pharmacy.distance} away</p>
                </div>
              </div>

              <div className="pharmacy-contact-section">
                <div className="contact-row">
                  <span className="icon">📍</span>
                  <span>{pharmacy.address}</span>
                </div>
                <div className="contact-row">
                  <span className="icon">📞</span>
                  <a href={`tel:${pharmacy.phone}`}>{pharmacy.phone}</a>
                </div>
                {pharmacy.email && (
                  <div className="contact-row">
                    <span className="icon">✉️</span>
                    <a href={`mailto:${pharmacy.email}`}>{pharmacy.email}</a>
                  </div>
                )}
              </div>

              <button className="btn btn-primary directions-btn" onClick={handleGetDirections}>
                🗺️ Get Directions
              </button>
            </div>

            <div className="search-medicine-section card">
              <h3>Search Inventory</h3>
              <p>Find available medicines in this pharmacy</p>

              <form onSubmit={handleSearch} className="pharmacy-search-form">
                <div className="search-input-wrapper">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search medicine name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary search-button">
                    Search
                  </button>
                </div>
              </form>

              {/* Always show medicines list, filtered or all */}
              <div className="search-results-section">
                <h4>Inventory ({filteredMedicines.length})</h4>
                {filteredMedicines.length === 0 ? (
                  <p className="no-results">No medicines found</p>
                ) : (
                  <div className="medicines-list">
                    {filteredMedicines.map((medicine) => (
                      <div
                        key={medicine._id}
                        className="medicine-item card"
                        onClick={() => navigate(isGuest ? `/medicine-guest/${medicine._id}` : `/medicine/${medicine._id}`)}
                      >
                        <div className="medicine-icon-small">💊</div>
                        <div className="medicine-details">
                          <h5>{medicine.name}</h5>
                          <p className="brand">Brand: {medicine.brand}</p>
                          <p className="purposes">
                            {Array.isArray(medicine.purposes)
                              ? medicine.purposes.join(', ')
                              : medicine.purposes}
                          </p>
                        </div>
                        <div className={`stock-badge ${medicine.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                          {medicine.stock} in stock
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default PharmacyDetails;


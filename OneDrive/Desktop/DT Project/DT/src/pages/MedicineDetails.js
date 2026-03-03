import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Logo from '../components/Logo';
import { medicineAPI, searchAPI } from '../utils/api';
import './MedicineDetails.css';

// Haversine formula to calculate distance
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const MedicineDetails = ({ isGuest = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [medicine, setMedicine] = useState(null);
  const [nearbyPharmacies, setNearbyPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(() => {
    const saved = localStorage.getItem('userLocation');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    const fetchMedicineData = async () => {
      try {
        setLoading(true);

        // Fetch medicine details
        const medicineRes = await medicineAPI.getMedicine(id);
        const medicineData = medicineRes.data;

        setMedicine({
          id: medicineData._id,
          name: medicineData.name,
          brand: medicineData.brandManufacturer || medicineData.brand,
          manufacturer: medicineData.brandManufacturer,
          purposes: Array.isArray(medicineData.purposes)
            ? medicineData.purposes.join(', ')
            : medicineData.purposes,
          sideEffects: Array.isArray(medicineData.sideEffects)
            ? medicineData.sideEffects.join(', ')
            : medicineData.sideEffects,
          dosage: medicineData.dosage || 'Consult a doctor for dosage information',
          warnings: medicineData.warnings || 'Consult a doctor before use'
        });

        // Fetch pharmacies with this medicine
        const pharmaciesRes = await searchAPI.getMedicinePharmacies(id);
        let pharmaciesData = pharmaciesRes.data;

        // Calculate distances if user location is available
        if (userLocation && pharmaciesData.length > 0) {
          pharmaciesData = pharmaciesData.map(pharmacy => {
            const distance = pharmacy.location && pharmacy.location.latitude && pharmacy.location.longitude
              ? calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                pharmacy.location.latitude,
                pharmacy.location.longitude
              )
              : null;

            return {
              id: pharmacy.pharmacyId,
              name: pharmacy.pharmacyName,
              distance: distance ? `${distance.toFixed(2)} km` : 'N/A',
              distanceValue: distance || 999,
              stock: pharmacy.stock,
              phone: pharmacy.phone,
              address: pharmacy.address
            };
          }).sort((a, b) => a.distanceValue - b.distanceValue);
        } else {
          pharmaciesData = pharmaciesData.map(pharmacy => ({
            id: pharmacy.pharmacyId,
            name: pharmacy.pharmacyName,
            distance: 'N/A',
            distanceValue: 999,
            stock: pharmacy.stock,
            phone: pharmacy.phone,
            address: pharmacy.address
          }));
        }

        setNearbyPharmacies(pharmaciesData);
      } catch (error) {
        console.error('Error fetching medicine data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMedicineData();
    }
  }, [id, userLocation]);

  const handleGetDirections = (pharmacy) => {
    window.open(`https://www.google.com/maps/search/${encodeURIComponent(pharmacy.address)}`, '_blank');
  };

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="medicine-details-page">
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

      <main className="medicine-details-main">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>

        {loading ? (
          <div className="loading-text" style={{ textAlign: 'center', padding: '40px' }}>
            Loading medicine details...
          </div>
        ) : !medicine ? (
          <div className="no-results" style={{ textAlign: 'center', padding: '40px' }}>
            Medicine not found
          </div>
        ) : (
          <>
            <div className="medicine-info-section">
              <div className="medicine-header-card card">
                <div className="medicine-icon-main">💊</div>
                <div className="medicine-main-details">
                  <h2>{medicine.name}</h2>
                  <div className="brand-manufacturer">
                    <span className="brand-badge">{medicine.brand}</span>
                    <span className="manufacturer-badge">{medicine.manufacturer}</span>
                  </div>
                </div>
              </div>

              <div className="medicine-details-card card">
                <div className="detail-section">
                  <h3>🎯 Uses / Purposes</h3>
                  <p>{medicine.purposes}</p>
                </div>

                <div className="detail-section">
                  <h3>⚠️ Side Effects</h3>
                  <p className="warning-text">{medicine.sideEffects}</p>
                </div>

                <div className="detail-section">
                  <h3>💉 Dosage</h3>
                  <p>{medicine.dosage}</p>
                </div>

                <div className="detail-section warning-section">
                  <h3>⚡ Warnings</h3>
                  <p className="warning-text">{medicine.warnings}</p>
                </div>
              </div>
            </div>

            <div className="pharmacies-availability-section">
              <h3>📍 Nearby Pharmacies with Stock</h3>
              {nearbyPharmacies.length === 0 ? (
                <div className="no-results" style={{ textAlign: 'center', padding: '20px' }}>
                  No pharmacies found with this medicine in stock
                </div>
              ) : (
                <div className="pharmacies-list-detailed">
                  {nearbyPharmacies.map((pharmacy) => (
                    <div key={pharmacy.id} className="pharmacy-card-detailed card">
                      <div className="pharmacy-top-section">
                        <div className="pharmacy-name-distance">
                          <div className="pharmacy-icon-small">🏪</div>
                          <div>
                            <h4>{pharmacy.name}</h4>
                            <p className="distance-text">📏 {pharmacy.distance} away</p>
                          </div>
                        </div>
                        <div className="stock-badge-large in-stock">
                          {pharmacy.stock} in stock
                        </div>
                      </div>

                      <div className="pharmacy-contact-info">
                        <div className="contact-item">
                          <span className="icon">📞</span>
                          <a href={`tel:${pharmacy.phone}`}>{pharmacy.phone}</a>
                        </div>
                        <div className="contact-item">
                          <span className="icon">📍</span>
                          <span>{pharmacy.address}</span>
                        </div>
                      </div>

                      <div className="pharmacy-actions">
                        <button
                          className="btn btn-primary"
                          onClick={() => handleGetDirections(pharmacy)}
                        >
                          🗺️ Get Directions
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => navigate(`/pharmacy-details/${pharmacy.id}`)}
                        >
                          View Pharmacy
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default MedicineDetails;

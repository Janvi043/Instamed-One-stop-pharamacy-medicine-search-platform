import React, { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Logo from '../components/Logo';
import './IllnessDetails.css';

const IllnessDetails = ({ isGuest = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const illnessName = searchParams.get('name') || 'Cold & Flu';
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Mock medicines for this illness
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchMedicines = async () => {
      try {
        setLoading(true);
        // Use the illness name directly for search
        // The backend will handle splitting words like "Cold & Flu" -> "Cold" OR "Flu"
        const response = await import('../utils/api').then(module =>
          module.searchAPI.searchIllness(illnessName)
        );
        setMedicines(response.data);
      } catch (error) {
        console.error('Error fetching medicines:', error);
      } finally {
        setLoading(false);
      }
    };

    if (illnessName) {
      fetchMedicines();
    }
  }, [illnessName]);

  const illnessIcons = {
    '1': '🤧',
    '2': '🤕',
    '3': '🌡️',
    '4': '💊',
    '5': '🤢',
    '6': '🤒',
    '7': '😷',
    '8': '💪'
  };

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="illness-details-page">
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

      <main className="illness-main">
        <button className="back-button" onClick={() => navigate(isGuest ? '/user-home-guest' : '/user-home')}>
          ← Back to Home
        </button>

        <div className="illness-header-card card">
          <div className="illness-icon-large">{illnessIcons[id] || '💊'}</div>
          <h2>{illnessName}</h2>
          <p>Common medicines recommended for {illnessName.toLowerCase()}</p>
        </div>

        <div className="medicines-section">
          <h3>Recommended Medicines ({medicines.length})</h3>
          <div className="medicines-grid">
            {loading ? (
              <div className="loading-text">Loading medicines...</div>
            ) : medicines.length === 0 ? (
              <div className="no-results">No medicines found for {illnessName}</div>
            ) : (
              medicines.map((medicine) => (
                <div
                  key={medicine._id}
                  className="medicine-card-detailed card"
                  onClick={() => navigate(isGuest ? `/medicine-guest/${medicine._id}` : `/medicine/${medicine._id}`)}
                >
                  <div className="medicine-card-header">
                    <div className="medicine-icon">💊</div>
                    <div className="medicine-name-section">
                      <h4>{medicine.name}</h4>
                      <p className="brand-info">{medicine.brand}</p>
                    </div>
                  </div>

                  <div className="medicine-manufacturer">
                    <span className="label">Manufacturer:</span>
                    <span className="value">{medicine.manufacturer}</span>
                  </div>

                  {medicine.sideEffects && (
                    <div className="side-effects-section">
                      <span className="label">⚠️ Side Effects:</span>
                      <p className="side-effects-text">
                        {Array.isArray(medicine.sideEffects)
                          ? medicine.sideEffects.join(', ')
                          : medicine.sideEffects}
                      </p>
                    </div>
                  )}

                  <button className="btn btn-primary view-details-btn">
                    View Nearby Pharmacies →
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default IllnessDetails;


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { pharmacyAPI } from '../utils/api';
import { getUser } from '../utils/auth';
import './PharmacyProfile.css';

const PharmacyProfile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [loading, setLoading] = useState(true);

  const [profileData, setProfileData] = useState({
    pharmacyName: '',
    ownerName: '',
    licenseNumber: '',
    address: '',
    phoneNumber: '',
    email: ''
  });

  // Fetch pharmacy profile on component mount
  useEffect(() => {
    fetchPharmacyProfile();
  }, []);

  const fetchPharmacyProfile = async () => {
    try {
      const loggedInPharmacy = getUser();
      if (loggedInPharmacy) {
        setProfileData({
          pharmacyName: loggedInPharmacy.pharmacyName || '',
          ownerName: loggedInPharmacy.ownerName || '',
          licenseNumber: loggedInPharmacy.licenseNumber || '',
          address: loggedInPharmacy.address || '',
          phoneNumber: loggedInPharmacy.phoneNumber || '',
          email: loggedInPharmacy.email || ''
        });
      }
    } catch (error) {
      console.error('Error fetching pharmacy profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await pharmacyAPI.updateProfile(profileData);

      // Update local storage
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const updatedUser = { ...currentUser, ...response.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    try {
      await pharmacyAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      setShowChangePassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      alert('Password changed successfully!');
    } catch (error) {
      console.error('Error changing password:', error);
      alert(error.response?.data?.message || 'Failed to change password. Please check your current password.');
    }
  };

  return (
    <div className="pharmacy-profile-page">
      <header className="pharmacy-header">
        <div className="header-content">
          <div onClick={() => navigate('/pharmacy-home')}>
            <Logo size="medium" />
          </div>
          <button className="btn btn-secondary" onClick={() => navigate('/pharmacy-home')}>
            ← Back to Home
          </button>
        </div>
      </header>

      <main className="profile-main">
        <div className="profile-container">
          <div className="profile-header-section">
            <h2>Pharmacy Profile</h2>
            {!isEditing && (
              <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                ✏️ Edit Profile
              </button>
            )}
          </div>

          <div className="profile-card card">
            <form onSubmit={handleSaveProfile}>
              <div className="form-section">
                <h3>Pharmacy Information</h3>

                <div className="form-group">
                  <label>Pharmacy Name</label>
                  <input
                    type="text"
                    name="pharmacyName"
                    value={profileData.pharmacyName}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Owner Name</label>
                  <input
                    type="text"
                    name="ownerName"
                    value={profileData.ownerName}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>License Number</label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={profileData.licenseNumber}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <textarea
                    name="address"
                    value={profileData.address}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    rows="3"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={profileData.phoneNumber}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    required
                  />
                </div>
              </div>

              {isEditing && (
                <div className="form-actions">
                  <button type="submit" className="btn btn-success">
                    💾 Save Changes
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>

          <div className="password-section">
            <button
              className="btn btn-primary"
              onClick={() => setShowChangePassword(!showChangePassword)}
            >
              🔒 Change Password
            </button>

            {showChangePassword && (
              <div className="password-card card">
                <h3>Change Password</h3>
                <form onSubmit={handleChangePassword}>
                  <div className="form-group">
                    <label>Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      minLength="6"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      minLength="6"
                      required
                    />
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn btn-success">
                      Update Password
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowChangePassword(false);
                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PharmacyProfile;


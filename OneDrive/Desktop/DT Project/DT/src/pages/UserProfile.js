import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { userAPI } from '../utils/api';
import { getUser } from '../utils/auth';
import './UserProfile.css';

const UserProfile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [loading, setLoading] = useState(true);

  const [profileData, setProfileData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    userId: ''
  });

  // Fetch user profile on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const loggedInUser = getUser();
      if (loggedInUser) {
        setProfileData({
          name: loggedInUser.name || '',
          phoneNumber: loggedInUser.phoneNumber || '',
          email: loggedInUser.email || '',
          userId: loggedInUser.userId || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
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
      const response = await userAPI.updateProfile(profileData);

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
      await userAPI.changePassword({
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
    <div className="user-profile-page">
      <header className="user-header">
        <div className="header-content">
          <div onClick={() => navigate('/user-home')}>
            <Logo size="medium" />
          </div>
          <button className="btn btn-secondary" onClick={() => navigate('/user-home')}>
            ← Back to Home
          </button>
        </div>
      </header>

      <main className="profile-main">
        <div className="profile-container">
          <div className="profile-header-section">
            <h2>My Profile</h2>
            {!isEditing && (
              <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                ✏️ Edit Profile
              </button>
            )}
          </div>

          <div className="profile-card card">
            <div className="profile-avatar-section">
              <div className="large-avatar">👤</div>
              <h3>{profileData.name}</h3>
              <p className="user-id-display">@{profileData.userId}</p>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div className="form-section">
                <h3>Personal Information</h3>

                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>User ID</label>
                  <input
                    type="text"
                    name="userId"
                    value={profileData.userId}
                    disabled
                    required
                  />
                  <small>User ID cannot be changed</small>
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

export default UserProfile;


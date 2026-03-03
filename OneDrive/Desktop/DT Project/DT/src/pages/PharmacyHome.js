import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { logout } from '../utils/auth';
import { pharmacyAPI } from '../utils/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import './PharmacyHome.css';

const PharmacyHome = () => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Real API integration
  const [stats, setStats] = useState({
    totalMedicines: 0,
    lowStock: 0,
    outOfStock: 0,
    totalSearches: 0,
    topSearchedMedicines: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await pharmacyAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({
        totalMedicines: 0,
        lowStock: 0,
        outOfStock: 0,
        totalSearches: 0,
        topSearchedMedicines: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Prepare chart data
  const chartData = stats.topSearchedMedicines?.map(med => ({
    name: med.name.length > 15 ? med.name.substring(0, 12) + '...' : med.name,
    fullName: med.name,
    searches: med.searchCount,
    brand: med.brandManufacturer
  })) || [];

  const COLORS = ['#11998e', '#38ef7d', '#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#6a11cb', '#2575fc'];

  return (
    <div className="pharmacy-home-page">
      {/* Header with Profile */}
      <header className="pharmacy-header">
        <div className="header-content">
          <div onClick={() => navigate('/pharmacy-home')}>
            <Logo size="medium" />
          </div>

          <div className="profile-section">
            <div
              className="profile-button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="profile-avatar">👤</div>
              <span className="profile-name">Pharmacy Owner</span>
            </div>

            {showProfileMenu && (
              <div className="profile-dropdown">
                <div className="dropdown-item" onClick={() => navigate('/pharmacy-profile')}>
                  <span>👤 My Profile</span>
                </div>

                <div className="dropdown-divider"></div>
                <div className="dropdown-item logout" onClick={handleLogout}>
                  <span>🚪 Logout</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pharmacy-main">
        <div className="welcome-section">
          <h2>Welcome to Your Dashboard</h2>
          <p>Manage your pharmacy inventory efficiently</p>
        </div>

        <div className="actions-grid">
          <div className="action-card card">
            <div className="action-icon view-icon">📋</div>
            <h3>View Existing Medicines</h3>
            <p>Browse and search through your current medicine inventory</p>
            <button className="btn btn-primary" onClick={() => navigate('/pharmacy-medicines')}>View Medicines</button>
          </div>

          <div className="action-card card">
            <div className="action-icon add-icon">➕</div>
            <h3>Add New Medicine</h3>
            <p>Add new medicines to your pharmacy inventory</p>
            <button className="btn btn-success" onClick={() => navigate('/pharmacy-add-medicine')}>Add Medicine</button>
          </div>
        </div>

        {/* Quick Stats Section */}
        <div className="stats-section">
          <h3>Quick Statistics</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.totalMedicines}</div>
              <div className="stat-label">Total Medicines</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.lowStock}</div>
              <div className="stat-label">Low Stock Items</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.outOfStock}</div>
              <div className="stat-label">Out of Stock</div>
            </div>
          </div>
        </div>

        {/* Popularity Insights Section */}
        {stats.topSearchedMedicines && stats.topSearchedMedicines.length > 0 && (
          <div className="popularity-section card">
            <div className="section-header">
              <h3>📈 Popularity Insights</h3>
              <p>Medicines from your inventory that users are searching for most</p>
            </div>

            <div className="analytics-visualization card">
              <div className="chart-container" style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      interval={0}
                      tick={{ fill: '#4a5568', fontSize: 12, fontWeight: 600 }}
                    />
                    <YAxis tick={false} width={10} />
                    <Bar dataKey="searches" radius={[6, 6, 0, 0]} barSize={40}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PharmacyHome;


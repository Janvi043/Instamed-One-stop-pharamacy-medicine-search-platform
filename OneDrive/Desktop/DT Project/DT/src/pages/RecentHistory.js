import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { userAPI } from '../utils/api';
import { logout } from '../utils/auth';
import './RecentHistory.css';

const RecentHistory = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true);
                const response = await userAPI.getSearchHistory();
                console.log('📜 Fetched search history:', response.data);
                setHistory(response.data || []);
            } catch (error) {
                console.error('❌ Error fetching search history:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navigateToSearch = (query) => {
        navigate(`/search-results?query=${encodeURIComponent(query)}`);
    };

    const medicineHistory = history.filter(item => item.type === 'medicine');
    const pharmacyHistory = history.filter(item => item.type === 'pharmacy');

    return (
        <div className="history-page">
            <header className="user-header">
                <div className="header-content">
                    <div onClick={() => navigate('/user-home')}>
                        <Logo size="medium" />
                    </div>

                    <div className="profile-section">
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
                                <div className="dropdown-item active">
                                    <span>🕒 Recent History</span>
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

            <main className="history-main">
                <div className="history-container card">
                    <div className="history-header">
                        <h2>🕒 Recent Search History</h2>
                        <p>View and revisit your recent searches for medicines and pharmacies</p>
                    </div>

                    {loading ? (
                        <div className="loading-state">Loading history...</div>
                    ) : history.length === 0 ? (
                        <div className="empty-history">
                            <div className="empty-icon">📂</div>
                            <h3>No search history found</h3>
                            <p>Your recent medicine and pharmacy searches will appear here.</p>
                            <button
                                className="btn btn-primary"
                                onClick={() => navigate('/user-home')}
                            >
                                Start Searching
                            </button>
                        </div>
                    ) : (
                        <div className="history-grid">
                            <div className="history-column">
                                <h3>📜 Searched Medicines</h3>
                                {medicineHistory.length === 0 ? (
                                    <p className="no-items">No recent medicine searches</p>
                                ) : (
                                    <ul className="history-list">
                                        {medicineHistory.map((item, index) => (
                                            <li key={index} className="history-item" onClick={() => navigateToSearch(item.query)}>
                                                <div className="item-icon">💊</div>
                                                <div className="item-info">
                                                    <span className="item-query">{item.query}</span>
                                                    <span className="item-date">{new Date(item.timestamp).toLocaleString()}</span>
                                                </div>
                                                <span className="item-arrow">→</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="history-column">
                                <h3>📜 Searched Pharmacies</h3>
                                {pharmacyHistory.length === 0 ? (
                                    <p className="no-items">No recent pharmacy searches</p>
                                ) : (
                                    <ul className="history-list">
                                        {pharmacyHistory.map((item, index) => (
                                            <li key={index} className="history-item" onClick={() => navigateToSearch(item.query)}>
                                                <div className="item-icon">🏪</div>
                                                <div className="item-info">
                                                    <span className="item-query">{item.query}</span>
                                                    <span className="item-date">{new Date(item.timestamp).toLocaleString()}</span>
                                                </div>
                                                <span className="item-arrow">→</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default RecentHistory;

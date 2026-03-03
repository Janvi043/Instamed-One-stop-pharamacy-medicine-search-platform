import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { medicineAPI } from '../utils/api';
import './PharmacyMedicines.css';

const PharmacyMedicines = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const response = await medicineAPI.getPrescribedMedicines();
      setMedicines(response.data || []);
      console.log('Fetched medicines:', response.data);
    } catch (error) {
      console.error('Error fetching medicines:', error);
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  };

  // OLD MOCK DATA REMOVED - Now fetching from API
  const oldMedicines_removed = [
    {
      id: 1,
      name: 'Paracetamol',
      brand: 'Crocin',
      manufacturer: 'GSK',
      purposes: 'Fever, Pain Relief, Headache',
      sideEffects: 'Nausea, Allergic reactions',
      stock: 150
    },
    {
      id: 2,
      name: 'Ibuprofen',
      brand: 'Brufen',
      manufacturer: 'Abbott',
      purposes: 'Pain Relief, Inflammation, Fever',
      sideEffects: 'Stomach upset, Dizziness',
      stock: 80
    },
    {
      id: 3,
      name: 'Cetirizine',
      brand: 'Zyrtec',
      manufacturer: 'UCB',
      purposes: 'Allergies, Cold symptoms',
      sideEffects: 'Drowsiness, Dry mouth',
      stock: 200
    },
    {
      id: 4,
      name: 'Amoxicillin',
      brand: 'Augmentin',
      manufacturer: 'GSK',
      purposes: 'Bacterial infections, Respiratory infections',
      sideEffects: 'Diarrhea, Nausea, Rash',
      stock: 45
    },
    {
      id: 5,
      name: 'Omeprazole',
      brand: 'Prilosec',
      manufacturer: 'AstraZeneca',
      purposes: 'Acid reflux, Stomach ulcers',
      sideEffects: 'Headache, Stomach pain',
      stock: 120
    },
    {
      id: 6,
      name: 'Aspirin',
      brand: 'Disprin',
      manufacturer: 'Reckitt',
      purposes: 'Pain Relief, Blood thinner',
      sideEffects: 'Stomach irritation, Bleeding risk',
      stock: 0
    }
  ];

  const filteredMedicines = medicines.filter(med =>
    med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    med.brandManufacturer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStockStatus = (stock) => {
    if (stock === 0) return 'out-of-stock';
    if (stock < 20) return 'low-stock';
    return 'in-stock';
  };

  if (loading) {
    return (
      <div className="pharmacy-medicines-page">
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
        <main className="medicines-main">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Loading medicines...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="pharmacy-medicines-page">
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

      <main className="medicines-main">
        <div className="medicines-header">
          <h2>Medicine Inventory</h2>
          <button
            className="btn btn-success"
            onClick={() => navigate('/pharmacy-add-medicine')}
          >
            ➕ Add New Medicine
          </button>
        </div>

        <div className="search-section">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search medicines by name or brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="medicines-stats">
          <div className="stat-item">
            <span className="stat-number">{medicines.length}</span>
            <span className="stat-label">Total Medicines</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{medicines.filter(m => m.stock < 20 && m.stock > 0).length}</span>
            <span className="stat-label">Low Stock</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{medicines.filter(m => m.stock === 0).length}</span>
            <span className="stat-label">Out of Stock</span>
          </div>
        </div>

        <div className="medicines-list">
          {medicines.length === 0 ? (
            <div className="no-results card">
              <p>No medicines added yet. <button className="btn btn-primary" onClick={() => navigate('/pharmacy-add-medicine')}>Add your first medicine</button></p>
            </div>
          ) : filteredMedicines.length === 0 ? (
            <div className="no-results card">
              <p>No medicines found matching "{searchQuery}"</p>
            </div>
          ) : (
            filteredMedicines.map(medicine => (
              <div key={medicine._id} className="medicine-card card">
                <div className="medicine-main-info">
                  <div className="medicine-icon">💊</div>
                  <div className="medicine-details">
                    <h3>{medicine.name}</h3>
                    <p className="medicine-brand">{medicine.brandManufacturer}</p>
                    <p className="medicine-purposes"><strong>Purposes:</strong> {medicine.purposes}</p>
                    <p className="medicine-side-effects"><strong>Side Effects:</strong> {medicine.sideEffects}</p>
                  </div>
                </div>

                <div className="medicine-actions">
                  <div className={`stock-badge ${getStockStatus(medicine.stock)}`}>
                    Stock: {medicine.stock}
                  </div>
                  <div className="action-buttons">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate(`/pharmacy-edit-medicine/${medicine._id}`)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => navigate(`/pharmacy-edit-medicine/${medicine._id}?focus=stock`)}
                    >
                      📦 Update Stock
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default PharmacyMedicines;


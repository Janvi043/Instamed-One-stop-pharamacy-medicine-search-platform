import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { medicineAPI } from '../utils/api';
import './PharmacyAddMedicine.css';

const PharmacyAddMedicine = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    brandManufacturer: '',
    composition: '',
    purposes: '',
    sideEffects: '',
    stock: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.brandManufacturer || !formData.composition || 
        !formData.purposes || !formData.sideEffects || !formData.stock) {
      setError('Please fill in all required fields');
      return;
    }

    if (parseInt(formData.stock) < 0) {
      setError('Stock quantity must be a positive number');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Convert stock to number
      const medicineData = {
        ...formData,
        stock: parseInt(formData.stock)
      };

      console.log('Form data being sent:', medicineData);
      const response = await medicineAPI.addMedicine(medicineData);
      
      console.log('Medicine added successfully:', response);
      alert('Medicine added successfully!');
      navigate('/pharmacy-medicines');
    } catch (err) {
      console.error('Error adding medicine:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to add medicine. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pharmacy-add-medicine-page">
      <header className="pharmacy-header">
        <div className="header-content">
          <div onClick={() => navigate('/pharmacy-home')}>
            <Logo size="medium" />
          </div>
          <button className="btn btn-secondary" onClick={() => navigate('/pharmacy-medicines')}>
            ← Back to Medicines
          </button>
        </div>
      </header>

      <main className="add-medicine-main">
        <div className="form-container">
          <div className="form-header">
            <h2>Add New Medicine</h2>
            <p>Fill in the details to add a new medicine to your inventory</p>
          </div>

          {error && <div className="error-message card">{error}</div>}

          <div className="form-card card">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Medicine Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Paracetamol"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="brandManufacturer">Brand / Manufacturer *</label>
                <input
                  type="text"
                  id="brandManufacturer"
                  name="brandManufacturer"
                  value={formData.brandManufacturer}
                  onChange={handleChange}
                  placeholder="e.g., Crocin - GSK"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="composition">Composition *</label>
                <textarea
                  id="composition"
                  name="composition"
                  value={formData.composition}
                  onChange={handleChange}
                  placeholder="e.g., Paracetamol 500mg + Caffeine 50mg (specify ingredients and dosage)"
                  rows="2"
                  required
                />
                <small>Enter all active ingredients with their dosages</small>
              </div>

              <div className="form-group">
                <label htmlFor="purposes">Purposes / Uses *</label>
                <textarea
                  id="purposes"
                  name="purposes"
                  value={formData.purposes}
                  onChange={handleChange}
                  placeholder="e.g., Fever, Pain Relief, Headache (separate with commas)"
                  rows="3"
                  required
                />
                <small>List all purposes separated by commas</small>
              </div>

              <div className="form-group">
                <label htmlFor="sideEffects">Side Effects *</label>
                <textarea
                  id="sideEffects"
                  name="sideEffects"
                  value={formData.sideEffects}
                  onChange={handleChange}
                  placeholder="e.g., Nausea, Dizziness, Allergic reactions (separate with commas)"
                  rows="3"
                  required
                />
                <small>List all potential side effects separated by commas</small>
              </div>

              <div className="form-group">
                <label htmlFor="stock">Initial Stock / Quantity *</label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="Enter quantity in units"
                  min="0"
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-success" disabled={loading}>
                  {loading ? '⏳ Adding...' : '✓ Add Medicine'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => navigate('/pharmacy-medicines')}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PharmacyAddMedicine;


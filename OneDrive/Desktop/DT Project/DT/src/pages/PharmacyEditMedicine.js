import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Logo from '../components/Logo';
import { medicineAPI } from '../utils/api';
import './PharmacyEditMedicine.css';

const PharmacyEditMedicine = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const focusStock = searchParams.get('focus') === 'stock';

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    manufacturer: '',
    purposes: '',
    sideEffects: '',
    stock: 0
  });
  const [loading, setLoading] = useState(true);
  const [originalStock, setOriginalStock] = useState(0);

  useEffect(() => {
    const fetchMedicine = async () => {
      try {
        setLoading(true);
        const response = await medicineAPI.getMedicine(id);
        const med = response.data;

        setFormData({
          name: med.name,
          brand: med.brandManufacturer || med.brand,
          manufacturer: med.brandManufacturer,
          purposes: Array.isArray(med.purposes) ? med.purposes.join(', ') : med.purposes,
          sideEffects: Array.isArray(med.sideEffects) ? med.sideEffects.join(', ') : med.sideEffects,
          stock: med.stock
        });
        setOriginalStock(med.stock);
      } catch (error) {
        console.error('Error fetching medicine:', error);
        alert('Failed to load medicine details');
        navigate('/pharmacy-medicines');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMedicine();
    }
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Prepare data for API
      const updateData = {
        name: formData.name,
        brandManufacturer: formData.manufacturer,
        purposes: formData.purposes,
        sideEffects: formData.sideEffects,
        stock: parseInt(formData.stock)
      };

      await medicineAPI.updateMedicine(id, updateData);
      alert('Medicine updated successfully!');
      navigate('/pharmacy-medicines');
    } catch (error) {
      console.error('Error updating medicine:', error);
      alert('Failed to update medicine. Please try again.');
    }
  };


  if (loading) {
    return (
      <div className="pharmacy-edit-medicine-page">
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
        <main className="edit-medicine-main">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Loading medicine details...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="pharmacy-edit-medicine-page">
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

      <main className="edit-medicine-main">
        <div className="form-container">
          <div className="form-header">
            <h2>{focusStock ? 'Update Stock' : 'Edit Medicine'}</h2>
            <p>{focusStock ? 'Update the stock quantity' : 'Update medicine details'}</p>
          </div>

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
                  disabled={focusStock}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="brand">Brand Name *</label>
                  <input
                    type="text"
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    disabled={focusStock}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="manufacturer">Manufacturer *</label>
                  <input
                    type="text"
                    id="manufacturer"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleChange}
                    disabled={focusStock}
                    required
                  />
                </div>
              </div>

              {!focusStock && (
                <>
                  <div className="form-group">
                    <label htmlFor="purposes">Purposes / Uses *</label>
                    <textarea
                      id="purposes"
                      name="purposes"
                      value={formData.purposes}
                      onChange={handleChange}
                      rows="3"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="sideEffects">Side Effects *</label>
                    <textarea
                      id="sideEffects"
                      name="sideEffects"
                      value={formData.sideEffects}
                      onChange={handleChange}
                      rows="3"
                      required
                    />
                  </div>
                </>
              )}

              <div className="form-group stock-highlight">
                <label htmlFor="stock">Stock / Quantity *</label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                  required
                  className={focusStock ? 'highlight-input' : ''}
                />
                <small>Current stock: {originalStock} units</small>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-success">
                  💾 Save Changes
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/pharmacy-medicines')}
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

export default PharmacyEditMedicine;


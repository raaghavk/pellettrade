import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { PELLET_TYPES, INDIAN_STATES } from '../lib/constants';
import { ArrowLeft } from 'lucide-react';

const CreateListing = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    pellet_type: 'Rice Husk',
    price_per_tonne: '',
    quantity_tonnes: '',
    calorific_value: '',
    moisture_pct: '',
    ash_pct: '',
    location_city: '',
    location_state: profile?.location_state || 'Maharashtra',
    description: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.price_per_tonne || formData.price_per_tonne <= 0) {
      setError('Please enter a valid price');
      return false;
    }
    if (!formData.quantity_tonnes || formData.quantity_tonnes <= 0) {
      setError('Please enter a valid quantity');
      return false;
    }
    if (!formData.location_city.trim()) {
      setError('Please enter a city/location');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const insertData = {
        seller_id: profile.id,
        pellet_type: formData.pellet_type,
        price_per_tonne: parseFloat(formData.price_per_tonne),
        quantity_tonnes: parseFloat(formData.quantity_tonnes),
        location_city: formData.location_city,
        location_state: formData.location_state,
        description: formData.description,
        status: 'active',
      };

      // Only include optional numeric fields if provided
      if (formData.calorific_value) {
        insertData.calorific_value = parseInt(formData.calorific_value);
      }
      if (formData.moisture_pct !== '') {
        insertData.moisture_pct = parseFloat(formData.moisture_pct);
      }
      if (formData.ash_pct !== '') {
        insertData.ash_pct = parseFloat(formData.ash_pct);
      }

      const { data, error } = await supabase
        .from('listings')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;

      navigate('/browse', { state: { message: 'Listing created successfully!' } });
    } catch (err) {
      console.error('Error creating listing:', err);
      setError(err.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header-minimal">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h1>Create Listing</h1>
      </div>

      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-section">
          <h2>Pellet Details</h2>

          <div className="form-group">
            <label htmlFor="pellet_type">Pellet Type</label>
            <select
              id="pellet_type"
              name="pellet_type"
              value={formData.pellet_type}
              onChange={handleChange}
            >
              {PELLET_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="price_per_tonne">Price per Tonne (₹) *</label>
            <input
              id="price_per_tonne"
              type="number"
              name="price_per_tonne"
              value={formData.price_per_tonne}
              onChange={handleChange}
              placeholder="e.g., 5000"
              step="100"
              min="1"
            />
          </div>

          <div className="form-group">
            <label htmlFor="quantity_tonnes">Available Quantity (tonnes) *</label>
            <input
              id="quantity_tonnes"
              type="number"
              name="quantity_tonnes"
              value={formData.quantity_tonnes}
              onChange={handleChange}
              placeholder="e.g., 100"
              step="1"
              min="1"
            />
          </div>

          <div className="form-group">
            <label htmlFor="calorific_value">Calorific Value (kcal/kg)</label>
            <input
              id="calorific_value"
              type="number"
              name="calorific_value"
              value={formData.calorific_value}
              onChange={handleChange}
              placeholder="e.g., 4200"
              step="10"
              min="0"
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Quality Specifications</h2>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="moisture_pct">Moisture (%)</label>
              <input
                id="moisture_pct"
                type="number"
                name="moisture_pct"
                value={formData.moisture_pct}
                onChange={handleChange}
                placeholder="e.g., 8"
                step="0.1"
                min="0"
                max="100"
              />
            </div>

            <div className="form-group">
              <label htmlFor="ash_pct">Ash Content (%)</label>
              <input
                id="ash_pct"
                type="number"
                name="ash_pct"
                value={formData.ash_pct}
                onChange={handleChange}
                placeholder="e.g., 5"
                step="0.1"
                min="0"
                max="100"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Location</h2>

          <div className="form-group">
            <label htmlFor="location_city">City *</label>
            <input
              id="location_city"
              type="text"
              name="location_city"
              value={formData.location_city}
              onChange={handleChange}
              placeholder="e.g., Pune"
            />
          </div>

          <div className="form-group">
            <label htmlFor="location_state">State</label>
            <select
              id="location_state"
              name="location_state"
              value={formData.location_state}
              onChange={handleChange}
            >
              {INDIAN_STATES.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-section">
          <div className="form-group">
            <label htmlFor="description">Additional Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add any additional details about your pellets..."
              rows="4"
            />
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button
          type="submit"
          className="btn btn-primary btn-block btn-large"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Listing'}
        </button>
      </form>
    </div>
  );
};

export default CreateListing;

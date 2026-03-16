import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft } from 'lucide-react';

const CreateListing = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    pellet_type: 'Pine',
    price_per_tonne: '',
    available_quantity: '',
    calorific_value: '',
    moisture_content: '',
    ash_content: '',
    density: '',
    location: '',
    state: 'Maharashtra',
    delivery_time: 7,
    description: '',
  });

  const pelletTypes = ['Pine', 'Hardwood', 'Agricultural Waste', 'Mixed Feedstock'];
  const states = ['Maharashtra', 'Karnataka', 'Andhra Pradesh', 'Madhya Pradesh', 'Gujarat', 'Rajasthan', 'Tamil Nadu', 'Telangana'];

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
    if (!formData.available_quantity || formData.available_quantity <= 0) {
      setError('Please enter a valid quantity');
      return false;
    }
    if (!formData.calorific_value || formData.calorific_value <= 0) {
      setError('Please enter a valid calorific value');
      return false;
    }
    if (formData.moisture_content === '' || formData.moisture_content < 0 || formData.moisture_content > 100) {
      setError('Please enter a valid moisture content (0-100%)');
      return false;
    }
    if (formData.ash_content === '' || formData.ash_content < 0 || formData.ash_content > 100) {
      setError('Please enter a valid ash content (0-100%)');
      return false;
    }
    if (!formData.density || formData.density <= 0) {
      setError('Please enter a valid density');
      return false;
    }
    if (!formData.location.trim()) {
      setError('Please enter a location');
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
      const { data, error } = await supabase
        .from('listings')
        .insert([{
          seller_id: profile.id,
          pellet_type: formData.pellet_type,
          price_per_tonne: parseFloat(formData.price_per_tonne),
          available_quantity: parseFloat(formData.available_quantity),
          calorific_value: parseFloat(formData.calorific_value),
          moisture_content: parseFloat(formData.moisture_content),
          ash_content: parseFloat(formData.ash_content),
          density: parseFloat(formData.density),
          location: formData.location,
          state: formData.state,
          delivery_time: parseInt(formData.delivery_time),
          description: formData.description,
          status: 'active',
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;

      navigate('/listings', { state: { message: 'Listing created successfully!' } });
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
              {pelletTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="price_per_tonne">Price per Tonne (₹)</label>
            <input
              id="price_per_tonne"
              type="number"
              name="price_per_tonne"
              value={formData.price_per_tonne}
              onChange={handleChange}
              placeholder="e.g., 5000"
              step="100"
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="available_quantity">Available Quantity (tonnes)</label>
            <input
              id="available_quantity"
              type="number"
              name="available_quantity"
              value={formData.available_quantity}
              onChange={handleChange}
              placeholder="e.g., 100"
              step="1"
              min="0"
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
              placeholder="e.g., 4800"
              step="10"
              min="0"
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Quality Specifications</h2>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="moisture_content">Moisture Content (%)</label>
              <input
                id="moisture_content"
                type="number"
                name="moisture_content"
                value={formData.moisture_content}
                onChange={handleChange}
                placeholder="e.g., 8"
                step="0.1"
                min="0"
                max="100"
              />
            </div>

            <div className="form-group">
              <label htmlFor="ash_content">Ash Content (%)</label>
              <input
                id="ash_content"
                type="number"
                name="ash_content"
                value={formData.ash_content}
                onChange={handleChange}
                placeholder="e.g., 5"
                step="0.1"
                min="0"
                max="100"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="density">Density (kg/m³)</label>
            <input
              id="density"
              type="number"
              name="density"
              value={formData.density}
              onChange={handleChange}
              placeholder="e.g., 650"
              step="1"
              min="0"
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Location & Delivery</h2>

          <div className="form-group">
            <label htmlFor="location">Location/City</label>
            <input
              id="location"
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Pune"
            />
          </div>

          <div className="form-group">
            <label htmlFor="state">State</label>
            <select
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
            >
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="delivery_time">Delivery Time (days)</label>
            <input
              id="delivery_time"
              type="number"
              name="delivery_time"
              value={formData.delivery_time}
              onChange={handleChange}
              min="1"
              max="30"
            />
          </div>
        </div>

        <div className="form-section">
          <div className="form-group">
            <label htmlFor="description">Additional Description (Optional)</label>
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

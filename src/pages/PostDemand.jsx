import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft } from 'lucide-react';

const PostDemand = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    pellet_type: 'Pine',
    quantity_needed: '',
    max_price_per_tonne: '',
    delivery_location: '',
    needed_by_date: '',
    description: '',
  });

  const pelletTypes = ['Pine', 'Hardwood', 'Agricultural Waste', 'Mixed Feedstock'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.quantity_needed || formData.quantity_needed <= 0) {
      setError('Please enter a valid quantity');
      return false;
    }
    if (!formData.max_price_per_tonne || formData.max_price_per_tonne <= 0) {
      setError('Please enter a valid max price');
      return false;
    }
    if (!formData.delivery_location.trim()) {
      setError('Please enter delivery location');
      return false;
    }
    if (!formData.needed_by_date) {
      setError('Please select a date');
      return false;
    }

    const selectedDate = new Date(formData.needed_by_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setError('Please select a future date');
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
      const { error } = await supabase
        .from('demands')
        .insert([{
          buyer_id: profile.id,
          pellet_type: formData.pellet_type,
          quantity_needed: parseFloat(formData.quantity_needed),
          max_price_per_tonne: parseFloat(formData.max_price_per_tonne),
          delivery_location: formData.delivery_location,
          needed_by_date: formData.needed_by_date,
          description: formData.description,
          status: 'active',
          created_at: new Date().toISOString(),
        }]);

      if (error) throw error;

      navigate('/demands', { state: { message: 'Demand posted successfully!' } });
    } catch (err) {
      console.error('Error posting demand:', err);
      setError(err.message || 'Failed to post demand');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="page-container">
      <div className="page-header-minimal">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h1>Post Demand</h1>
      </div>

      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-section">
          <h2>What Do You Need?</h2>

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
            <label htmlFor="quantity_needed">Quantity Needed (tonnes)</label>
            <input
              id="quantity_needed"
              type="number"
              name="quantity_needed"
              value={formData.quantity_needed}
              onChange={handleChange}
              placeholder="e.g., 50"
              step="1"
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="max_price_per_tonne">Maximum Price per Tonne (₹)</label>
            <input
              id="max_price_per_tonne"
              type="number"
              name="max_price_per_tonne"
              value={formData.max_price_per_tonne}
              onChange={handleChange}
              placeholder="e.g., 5500"
              step="100"
              min="0"
            />
            <p className="form-hint">Sellers will see your max budget</p>
          </div>
        </div>

        <div className="form-section">
          <h2>Delivery Details</h2>

          <div className="form-group">
            <label htmlFor="delivery_location">Delivery Location</label>
            <input
              id="delivery_location"
              type="text"
              name="delivery_location"
              value={formData.delivery_location}
              onChange={handleChange}
              placeholder="e.g., Mumbai, Maharashtra"
            />
          </div>

          <div className="form-group">
            <label htmlFor="needed_by_date">Needed By Date</label>
            <input
              id="needed_by_date"
              type="date"
              name="needed_by_date"
              value={formData.needed_by_date}
              onChange={handleChange}
              min={today}
            />
          </div>
        </div>

        <div className="form-section">
          <div className="form-group">
            <label htmlFor="description">Additional Notes (Optional)</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Any specific requirements? Quality specs? Certifications needed?"
              rows="4"
            />
          </div>
        </div>

        <div className="info-box">
          <h3>How it works</h3>
          <ol className="info-list">
            <li>Sellers matching your requirement will contact you</li>
            <li>Compare offers and negotiate</li>
            <li>Place order with your preferred seller</li>
            <li>Payment held in escrow until delivery</li>
          </ol>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button
          type="submit"
          className="btn btn-primary btn-block btn-large"
          disabled={loading}
        >
          {loading ? 'Posting...' : 'Post Demand'}
        </button>
      </form>
    </div>
  );
};

export default PostDemand;

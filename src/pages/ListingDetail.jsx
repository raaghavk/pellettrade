import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft, MapPin, Star, Loader } from 'lucide-react';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [listing, setListing] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const { data, error } = await supabase
          .from('listings')
          .select(`
            *,
            seller:users(id, full_name, phone, rating, total_ratings, kyc_verified)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        setListing(data);
      } catch (err) {
        console.error('Error fetching listing:', err);
        setError('Listing not found');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const handlePlaceOrder = async () => {
    if (!profile) {
      navigate('/login');
      return;
    }

    if (profile.id === listing.seller_id) {
      setError('You cannot order from your own listings');
      return;
    }

    if (quantity > listing.available_quantity) {
      setError('Quantity exceeds available stock');
      return;
    }

    if (quantity < 1) {
      setError('Quantity must be at least 1 tonne');
      return;
    }

    setPlacing(true);
    setError('');

    try {
      const totalAmount = quantity * listing.price_per_tonne;
      const escrowAmount = totalAmount;

      const { data, error } = await supabase
        .from('orders')
        .insert([{
          buyer_id: profile.id,
          seller_id: listing.seller_id,
          listing_id: listing.id,
          quantity,
          price_per_tonne: listing.price_per_tonne,
          total_amount: totalAmount,
          escrow_amount: escrowAmount,
          status: 'ordered',
          payment_status: 'pending',
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;

      navigate(`/order/${data.id}`, {
        state: { message: 'Order placed successfully! Proceed to payment.' }
      });
    } catch (err) {
      console.error('Error placing order:', err);
      setError(err.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="flex-center" style={{ minHeight: '60vh' }}>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="page-container">
        <div className="flex-center" style={{ minHeight: '60vh' }}>
          <div className="error-state">
            <h2>Listing not found</h2>
            <button className="btn btn-primary" onClick={() => navigate('/browse')}>
              Back to Browse
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalAmount = quantity * listing.price_per_tonne;
  const escrowAmount = totalAmount;

  return (
    <div className="page-container">
      <div className="page-header-minimal">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h1>{listing.pellet_type}</h1>
      </div>

      <div className="listing-detail">
        {/* Price Section */}
        <div className="price-section">
          <div className="price-display">
            <span className="currency">₹</span>
            <span className="amount">{listing.price_per_tonne.toLocaleString('en-IN')}</span>
            <span className="unit">/tonne</span>
          </div>
          <div className="stock-badge">
            {listing.available_quantity} tonnes available
          </div>
        </div>

        {/* Basic Info */}
        <div className="info-section">
          <h2>Details</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Quantity Available</span>
              <span className="value">{listing.available_quantity} tonnes</span>
            </div>
            <div className="info-item">
              <span className="label">Calorific Value</span>
              <span className="value">{listing.calorific_value} kcal/kg</span>
            </div>
            <div className="info-item">
              <span className="label">Moisture Content</span>
              <span className="value">{listing.moisture_content}%</span>
            </div>
            <div className="info-item">
              <span className="label">Ash Content</span>
              <span className="value">{listing.ash_content}%</span>
            </div>
            <div className="info-item">
              <span className="label">Density</span>
              <span className="value">{listing.density} kg/m³</span>
            </div>
            <div className="info-item">
              <span className="label">Delivery</span>
              <span className="value">{listing.delivery_time} days</span>
            </div>
          </div>

          {listing.description && (
            <div className="description-section">
              <h3>Description</h3>
              <p>{listing.description}</p>
            </div>
          )}
        </div>

        {/* Location */}
        <div className="info-section">
          <div className="location-item">
            <MapPin size={20} />
            <div>
              <p className="label">Location</p>
              <p className="value">{listing.location}, {listing.state}</p>
            </div>
          </div>
        </div>

        {/* Seller Info */}
        <div className="seller-card">
          <h2>Seller Information</h2>
          <div className="seller-details">
            <div className="seller-name">
              <h3>{listing.seller?.full_name || 'Unknown Seller'}</h3>
              {listing.seller?.kyc_verified && (
                <span className="kyc-badge">✓ KYC Verified</span>
              )}
            </div>
            <div className="rating-display">
              <Star size={20} fill="#FFB800" color="#FFB800" />
              <span className="rating">{listing.seller?.rating?.toFixed(1) || 'N/A'}</span>
              <span className="count">({listing.seller?.total_ratings || 0} reviews)</span>
            </div>
          </div>
        </div>

        {/* Order Form */}
        <div className="order-form-section">
          <h2>Place Order</h2>

          <div className="form-group">
            <label htmlFor="quantity">Quantity (tonnes)</label>
            <input
              id="quantity"
              type="number"
              min="1"
              max={listing.available_quantity}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            />
            <p className="form-hint">
              Maximum: {listing.available_quantity} tonnes
            </p>
          </div>

          {/* Price Summary */}
          <div className="price-summary">
            <div className="summary-row">
              <span>Price per tonne</span>
              <span>₹{listing.price_per_tonne.toLocaleString('en-IN')}</span>
            </div>
            <div className="summary-row">
              <span>Quantity</span>
              <span>{quantity} tonnes</span>
            </div>
            <div className="summary-row highlight">
              <span>Total Amount</span>
              <span>₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="summary-row info">
              <span>Escrow (held temporarily)</span>
              <span>₹{escrowAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            className="btn btn-primary btn-block btn-large"
            onClick={handlePlaceOrder}
            disabled={placing || quantity > listing.available_quantity}
          >
            {placing ? (
              <>
                <Loader size={20} className="spinner-icon" />
                Processing...
              </>
            ) : (
              'Place Order'
            )}
          </button>

          <p className="order-info">
            ℹ️ Amount will be held in escrow until delivery is confirmed
          </p>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;

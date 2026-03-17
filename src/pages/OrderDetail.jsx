import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import OrderTimeline from '../components/OrderTimeline';
import StarRating from '../components/StarRating';
import { ArrowLeft, Copy, Check } from 'lucide-react';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { role } = useTheme();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            listing:listings(pellet_type, price_per_tonne),
            buyer:users!buyer_id(id, name, phone),
            seller:users!seller_id(id, name, phone)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        setOrder(data);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Order not found');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    setError('');

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', order.id);

      if (error) throw error;

      setOrder(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error('Error updating order:', err);
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleSubmitRating = async () => {
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setUpdating(true);
    setError('');

    try {
      // Update order with rating
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          buyer_rating: rating,
          buyer_feedback: feedback,
          rated_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      if (updateError) throw updateError;

      // Update seller rating
      const { data: currentSeller } = await supabase
        .from('users')
        .select('rating, total_trades')
        .eq('id', order.seller_id)
        .single();

      const newTotalRatings = (currentSeller?.total_trades || 0) + 1;
      const newAverageRating = (
        ((currentSeller?.rating || 0) * (currentSeller?.total_trades || 0)) + rating
      ) / newTotalRatings;

      await supabase
        .from('users')
        .update({
          rating: newAverageRating,
          total_trades: newTotalRatings,
        })
        .eq('id', order.seller_id);

      setOrder(prev => ({
        ...prev,
        buyer_rating: rating,
        buyer_feedback: feedback,
      }));

      setRating(0);
      setFeedback('');
    } catch (err) {
      console.error('Error submitting rating:', err);
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const canUpdateStatus = role === 'seller' && profile?.id === order?.seller_id;
  const canRate = role === 'buyer' && profile?.id === order?.buyer_id && order?.status === 'delivered' && !order?.buyer_rating;

  const nextStatus = {
    'pending': 'accepted',
    'accepted': 'loaded',
    'loaded': 'in_transit',
    'in_transit': 'delivered',
    'delivered': null,
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

  if (!order) {
    return (
      <div className="page-container">
        <div className="flex-center" style={{ minHeight: '60vh' }}>
          <div className="error-state">
            <h2>Order not found</h2>
            <button className="btn btn-primary" onClick={() => navigate('/orders')}>
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header-minimal">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h1>Order #{order.id.slice(0, 8)}</h1>
      </div>

      <div className="order-detail">
        {/* Status Timeline */}
        <div className="detail-section">
          <h2>Order Status</h2>
          <OrderTimeline status={order.status} />
        </div>

        {/* Order Info */}
        <div className="detail-section">
          <h2>Order Details</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Pellet Type</span>
              <span className="value">{order.listing?.pellet_type}</span>
            </div>
            <div className="info-item">
              <span className="label">Quantity</span>
              <span className="value">{order.quantity_tonnes} tonnes</span>
            </div>
            <div className="info-item">
              <span className="label">Price/Tonne</span>
              <span className="value">₹{order.price_per_tonne?.toLocaleString('en-IN')}</span>
            </div>
            <div className="info-item">
              <span className="label">Total Amount</span>
              <span className="value">₹{order.total_amount?.toLocaleString('en-IN')}</span>
            </div>
            <div className="info-item">
              <span className="label">Escrow Amount</span>
              <span className="value">₹{order.escrow_amount?.toLocaleString('en-IN')}</span>
            </div>
            <div className="info-item">
              <span className="label">Payment Status</span>
              <span className="value">{order.payment_status}</span>
            </div>
          </div>
        </div>

        {/* Party Details */}
        <div className="detail-section">
          <h2>
            {role === 'seller' ? 'Buyer' : 'Seller'} Information
          </h2>
          <div className="party-card">
            <div className="party-info">
              <p className="label">Name</p>
              <p className="value">
                {role === 'seller' ? order.buyer?.name : order.seller?.name}
              </p>
            </div>
            <div className="party-info">
              <p className="label">Phone</p>
              <div className="phone-display">
                <span>
                  {role === 'seller' ? order.buyer?.phone : order.seller?.phone}
                </span>
                <button
                  className="copy-btn"
                  onClick={() => handleCopyToClipboard(
                    role === 'seller' ? order.buyer?.phone : order.seller?.phone
                  )}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Seller Status Update */}
        {canUpdateStatus && order.status !== 'delivered' && (
          <div className="detail-section">
            <h2>Update Status</h2>
            {error && <div className="error-message">{error}</div>}
            <button
              className="btn btn-primary btn-block"
              onClick={() => handleStatusUpdate(nextStatus[order.status])}
              disabled={updating}
            >
              {updating ? 'Updating...' : `Mark as ${nextStatus[order.status]}`}
            </button>
          </div>
        )}

        {/* Buyer Rating */}
        {canRate && (
          <div className="detail-section">
            <h2>Rate Seller</h2>
            <p className="section-description">
              Share your experience with this seller
            </p>
            <StarRating rating={rating} onRate={setRating} />
            <div className="form-group">
              <label htmlFor="feedback">Feedback (Optional)</label>
              <textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your feedback..."
                rows="3"
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button
              className="btn btn-primary btn-block"
              onClick={handleSubmitRating}
              disabled={updating || rating === 0}
            >
              {updating ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        )}

        {/* Already Rated */}
        {order.buyer_rating && (
          <div className="detail-section">
            <h2>Your Rating</h2>
            <div className="rating-display">
              <StarRating rating={order.buyer_rating} readonly={true} />
              <p className="rating-value">{order.buyer_rating} out of 5</p>
            </div>
            {order.buyer_feedback && (
              <div className="feedback-box">
                <p className="feedback-text">{order.buyer_feedback}</p>
              </div>
            )}
          </div>
        )}

        {/* Timeline Info */}
        <div className="detail-section">
          <h2>Timeline</h2>
          <div className="timeline-info">
            <div className="timeline-item">
              <span className="label">Order Placed</span>
              <span className="value">
                {new Date(order.created_at).toLocaleString('en-IN')}
              </span>
            </div>
            {order.accepted_at && (
              <div className="timeline-item">
                <span className="label">Accepted</span>
                <span className="value">
                  {new Date(order.accepted_at).toLocaleString('en-IN')}
                </span>
              </div>
            )}
            {order.delivered_at && (
              <div className="timeline-item">
                <span className="label">Delivered</span>
                <span className="value">
                  {new Date(order.delivered_at).toLocaleString('en-IN')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;

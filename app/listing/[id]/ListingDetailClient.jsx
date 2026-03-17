'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, MapPin, Star, Loader } from 'lucide-react';

const supabase = createClient(
  'https://cawowquolsqgbsouwhsr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhd293cXVvbHNxZ2Jzb3V3aHNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2ODE2NjUsImV4cCI6MjA4OTI1NzY2NX0.w3YcESxMlt7JJW-k4nXv_6gdO2Ml09U1pFaVGDmUwaE'
);

export default function ListingDetailClient({ listing, listingId }) {
  const router = useRouter();
  const { profile } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  if (!listing) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh' }}>
        <div className="error-state">
          <h2>Listing not found</h2>
          <button className="btn btn-primary" onClick={() => router.push('/browse')}>
            Back to Browse
          </button>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (!profile) {
      router.push('/login');
      return;
    }

    if (profile.id === listing.seller_id) {
      setError('You cannot order from your own listings');
      return;
    }

    if (quantity > listing.quantity_tonnes) {
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

      const { data, error: orderError } = await supabase
        .from('orders')
        .insert([{
          buyer_id: profile.id,
          seller_id: listing.seller_id,
          listing_id: listing.id,
          quantity_tonnes: quantity,
          price_per_tonne: listing.price_per_tonne,
          total_amount: totalAmount,
          escrow_amount: escrowAmount,
          status: 'pending',
          payment_status: 'pending',
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      router.push(`/order/${data.id}`);
    } catch (err) {
      console.error('Error placing order:', err);
      setError(err.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  const totalAmount = quantity * listing.price_per_tonne;
  const escrowAmount = totalAmount;

  return (
    <>
      <div className="page-header-minimal">
        <button className="back-btn" onClick={() => router.back()}>
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
            {listing.quantity_tonnes} tonnes available
          </div>
        </div>

        {/* Basic Info */}
        <div className="info-section">
          <h2>Details</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Quantity Available</span>
              <span className="value">{listing.quantity_tonnes} tonnes</span>
            </div>
            <div className="info-item">
              <span className="label">Calorific Value</span>
              <span className="value">{listing.calorific_value} kcal/kg</span>
            </div>
            <div className="info-item">
              <span className="label">Moisture Content</span>
              <span className="value">{listing.moisture_pct}%</span>
            </div>
            <div className="info-item">
              <span className="label">Ash Content</span>
              <span className="value">{listing.ash_pct}%</span>
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
              <p className="value">{listing.location_city}, {listing.location_state}</p>
            </div>
          </div>
        </div>

        {/* Seller Info */}
        <div className="seller-card">
          <h2>Seller Information</h2>
          <div className="seller-details">
            <div className="seller-name">
              <h3>{listing.seller?.name || 'Unknown Seller'}</h3>
              <p className="business-name">{listing.seller?.business_name}</p>
            </div>
            <div className="rating-display">
              <Star size={20} fill="#FFB800" color="#FFB800" />
              <span className="rating">{listing.seller?.rating?.toFixed(1) || 'N/A'}</span>
              <span className="count">({listing.seller?.total_trades || 0} trades)</span>
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
              max={listing.quantity_tonnes}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            />
            <p className="form-hint">
              Maximum: {listing.quantity_tonnes} tonnes
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
            disabled={placing || quantity > listing.quantity_tonnes}
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
    </>
  );
}

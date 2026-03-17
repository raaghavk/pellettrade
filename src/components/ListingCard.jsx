import React from 'react';
import { MapPin, Star } from 'lucide-react';

const ListingCard = ({ listing, onClick }) => {
  const formatPrice = (price) => `₹${price.toLocaleString('en-IN')}`;
  const formatQuantity = (qty) => `${qty.toLocaleString('en-IN')} tonnes`;

  return (
    <div className="listing-card" onClick={onClick}>
      <div className="listing-card-header">
        <div className="pellet-type-badge">{listing.pellet_type}</div>
        <div className="price-display">
          <span className="price-label">per tonne</span>
          <span className="price-value">{formatPrice(listing.price_per_tonne)}</span>
        </div>
      </div>

      <div className="listing-card-body">
        <div className="info-row">
          <span className="label">Quantity:</span>
          <span className="value">{formatQuantity(listing.quantity_tonnes)}</span>
        </div>

        <div className="info-row">
          <span className="label">Calorific Value:</span>
          <span className="value">{listing.calorific_value} kcal/kg</span>
        </div>

        <div className="info-row">
          <MapPin size={16} className="inline-icon" />
          <span className="value">{listing.location_city}, {listing.location_state}</span>
        </div>

        <div className="info-row">
          <Star size={16} className="inline-icon" style={{ color: '#FFB800' }} />
          <span className="value">
            {listing.seller?.rating?.toFixed(1) || 'N/A'}
            <span className="text-secondary"> ({listing.seller?.total_trades || 0})</span>
          </span>
        </div>
      </div>

      <div className="listing-card-footer">
        <div className="moisture-ash">
          <span className="badge-small">MC: {listing.moisture_pct}%</span>
          <span className="badge-small">Ash: {listing.ash_pct}%</span>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;

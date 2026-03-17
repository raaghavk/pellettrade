'use client';

import { useState, useEffect } from 'react';
import { Zap, MapPin, Clock } from 'lucide-react';

const RescueCard = ({ alert, onAccept }) => {
  const [timeLeft, setTimeLeft] = useState(() => {
    if (alert.expires_at) {
      const remaining = Math.floor((new Date(alert.expires_at) - new Date()) / 1000);
      return Math.max(0, remaining);
    }
    return 300; // fallback 5 minutes
  });

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const discountPercent = alert.discount_pct || Math.round(
    ((alert.original_price - alert.flash_price) / alert.original_price) * 100
  );

  const formatPrice = (price) => `₹${price?.toLocaleString('en-IN')}`;

  return (
    <div className={`rescue-card ${timeLeft <= 60 ? 'urgent' : ''}`}>
      <div className="rescue-header">
        <div className="rescue-badge">
          <Zap size={20} />
          <span>Flash Deal</span>
        </div>
        <div className="discount-badge">-{discountPercent}%</div>
      </div>

      <div className="rescue-body">
        <h3 className="rescue-pellet-type">{alert.pellet_type}</h3>

        <div className="rescue-quantity">
          <span className="label">Available:</span>
          <span className="quantity">{alert.quantity_tonnes} tonnes</span>
        </div>

        <div className="rescue-prices">
          <div className="price-item">
            <span className="label">Original</span>
            <span className="price original">{formatPrice(alert.original_price)}/tonne</span>
          </div>
          <div className="price-item">
            <span className="label">Flash</span>
            <span className="price flash">{formatPrice(alert.flash_price)}/tonne</span>
          </div>
        </div>

        {alert.broadcast_radius_km && (
          <div className="rescue-location">
            <MapPin size={16} />
            <span>Within {alert.broadcast_radius_km} km</span>
          </div>
        )}

        <div className={`rescue-timer ${timeLeft <= 60 ? 'critical' : ''}`}>
          <Clock size={18} />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="rescue-footer">
        <button
          className="btn btn-primary btn-block"
          onClick={() => onAccept(alert)}
          disabled={timeLeft <= 0}
        >
          {timeLeft <= 0 ? 'Deal Expired' : 'Accept Deal'}
        </button>
      </div>
    </div>
  );
};

export default RescueCard;

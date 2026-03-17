import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import RescueCard from '../components/RescueCard';
import { Zap, Info } from 'lucide-react';

const Rescue = () => {
  const navigate = useNavigate();
  const { profile, isAuthenticated } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        let query = supabase
          .from('rescue_alerts')
          .select('*');

        if (filter === 'active') {
          query = query.eq('status', 'active');
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        setAlerts(data || []);
      } catch (error) {
        console.error('Error fetching rescue alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [filter]);

  const handleAcceptDeal = async (alert) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const totalAmount = alert.flash_price * alert.quantity_tonnes;
      const escrowAmount = totalAmount;

      const { data, error } = await supabase
        .from('orders')
        .insert([{
          buyer_id: profile.id,
          seller_id: alert.seller_id,
          quantity_tonnes: alert.quantity_tonnes,
          price_per_tonne: alert.flash_price,
          total_amount: totalAmount,
          escrow_amount: escrowAmount,
          status: 'pending',
          payment_status: 'pending',
          is_rescue: true,
        }])
        .select()
        .single();

      if (error) throw error;

      // Mark alert as accepted
      await supabase
        .from('rescue_alerts')
        .update({ status: 'accepted', accepted_by: profile.id, accepted_at: new Date().toISOString() })
        .eq('id', alert.id);

      navigate(`/order/${data.id}`, {
        state: { message: 'Flash deal accepted! Proceed to payment.' }
      });
    } catch (error) {
      console.error('Error accepting deal:', error);
      alert('Failed to accept deal');
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

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Flash Deals</h1>
        <p className="subtitle">⚡ Limited time offers</p>
      </div>

      {/* Info Banner */}
      <div className="rescue-info-banner">
        <Info size={20} />
        <div>
          <h3>What are Flash Deals?</h3>
          <p>
            When sellers have excess stock or need quick cash, they list flash deals at steep discounts.
            You get great prices but the deal expires in 5 minutes. Be quick!
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="filter-buttons">
        <button
          className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Active Deals
        </button>
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All History
        </button>
      </div>

      {/* Alerts Grid */}
      {alerts.length === 0 ? (
        <div className="empty-state">
          <Zap size={48} />
          <h2>
            {filter === 'active' ? 'No active deals' : 'No deals yet'}
          </h2>
          <p>
            {filter === 'active'
              ? 'Check back soon for amazing flash deals!'
              : 'When deals appear, they will show up here.'}
          </p>
        </div>
      ) : (
        <div className="rescue-grid">
          {alerts.map(alert => (
            <RescueCard
              key={alert.id}
              alert={alert}
              onAccept={handleAcceptDeal}
            />
          ))}
        </div>
      )}

      {/* Stats */}
      {alerts.length > 0 && (
        <div className="stats-section">
          <h3>Flash Deal Stats</h3>
          <div className="stats-display">
            <div className="stat">
              <span className="label">Active Deals</span>
              <span className="number">
                {alerts.filter(a => a.status === 'active').length}
              </span>
            </div>
            <div className="stat">
              <span className="label">Accepted</span>
              <span className="number">
                {alerts.filter(a => a.status === 'accepted').length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rescue;

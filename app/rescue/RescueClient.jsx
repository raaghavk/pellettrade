'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/AuthContext';
import RescueCard from '@/components/RescueCard';
import { Zap, Info } from 'lucide-react';

const supabase = createClient(
  'https://cawowquolsqgbsouwhsr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhd293cXVvbHNxZ2Jzb3V3aHNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2ODE2NjUsImV4cCI6MjA4OTI1NzY2NX0.w3YcESxMlt7JJW-k4nXv_6gdO2Ml09U1pFaVGDmUwaE'
);

export default function RescueClient({ initialAlerts }) {
  const router = useRouter();
  const { profile, isAuthenticated } = useAuth();
  const [alerts, setAlerts] = useState(initialAlerts);
  const [filter, setFilter] = useState('active');

  const filteredAlerts = filter === 'active'
    ? alerts.filter(a => a.status === 'active')
    : alerts;

  const handleAcceptDeal = async (rescueAlert) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      const totalAmount = rescueAlert.flash_price * rescueAlert.quantity_tonnes;
      const escrowAmount = totalAmount;

      const { data, error: orderError } = await supabase
        .from('orders')
        .insert([{
          buyer_id: profile.id,
          seller_id: rescueAlert.seller_id,
          quantity_tonnes: rescueAlert.quantity_tonnes,
          price_per_tonne: rescueAlert.flash_price,
          total_amount: totalAmount,
          escrow_amount: escrowAmount,
          status: 'pending',
          payment_status: 'pending',
          is_rescue: true,
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Mark alert as accepted
      const { error: updateError } = await supabase
        .from('rescue_alerts')
        .update({ status: 'accepted', accepted_by: profile.id, accepted_at: new Date().toISOString() })
        .eq('id', rescueAlert.id);

      if (updateError) throw updateError;

      // Update local state
      setAlerts(alerts.map(a =>
        a.id === rescueAlert.id
          ? { ...a, status: 'accepted', accepted_by: profile.id }
          : a
      ));

      router.push(`/order/${data.id}`);
    } catch (err) {
      console.error('Error accepting deal:', err);
      alert('Failed to accept deal');
    }
  };

  return (
    <>
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
      {filteredAlerts.length === 0 ? (
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
          {filteredAlerts.map(alert => (
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
    </>
  );
}

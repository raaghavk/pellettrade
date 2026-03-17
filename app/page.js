'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';
import { TrendingUp, ShoppingCart, Wallet as WalletIcon, Plus } from 'lucide-react';

const Dashboard = () => {
  const router = useRouter();
  const { profile } = useAuth();
  const { role } = useTheme();
  const [stats, setStats] = useState({
    orderCount: 0,
    totalValue: 0,
    walletBalance: 0,
    activeListings: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (role === 'seller') {
          // Seller stats
          const { data: orders } = await supabase
            .from('orders')
            .select('total_amount')
            .eq('seller_id', profile?.id);

          const { data: listings } = await supabase
            .from('listings')
            .select('id')
            .eq('seller_id', profile?.id)
            .eq('status', 'active');

          const totalValue = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;

          setStats({
            orderCount: orders?.length || 0,
            totalValue,
            walletBalance: profile?.wallet_balance || 0,
            activeListings: listings?.length || 0,
          });
        } else {
          // Buyer stats
          const { data: orders } = await supabase
            .from('orders')
            .select('total_amount')
            .eq('buyer_id', profile?.id);

          const totalValue = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;

          setStats({
            orderCount: orders?.length || 0,
            totalValue,
            walletBalance: profile?.wallet_balance || 0,
            activeListings: 0,
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (profile) {
      fetchStats();
    }
  }, [profile, role]);

  const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p className="subtitle">
          Welcome back, {profile?.name || 'Trader'}!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon orders">
            <ShoppingCart size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Orders</p>
            <p className="stat-value">{stats.orderCount}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Value</p>
            <p className="stat-value text-sm">{formatCurrency(stats.totalValue)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon wallet">
            <WalletIcon size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Wallet</p>
            <p className="stat-value text-sm">{formatCurrency(stats.walletBalance)}</p>
          </div>
        </div>

        {role === 'seller' && (
          <div className="stat-card">
            <div className="stat-icon listings">
              <Plus size={24} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Active Listings</p>
              <p className="stat-value">{stats.activeListings}</p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          {role === 'seller' ? (
            <>
              <button
                className="action-btn"
                onClick={() => router.push('/listings/create')}
              >
                <Plus size={24} />
                <span>List New Pellets</span>
              </button>
              <button
                className="action-btn"
                onClick={() => router.push('/orders')}
              >
                <ShoppingCart size={24} />
                <span>View Orders</span>
              </button>
            </>
          ) : (
            <>
              <button
                className="action-btn"
                onClick={() => router.push('/browse')}
              >
                <ShoppingCart size={24} />
                <span>Browse Listings</span>
              </button>
              <button
                className="action-btn"
                onClick={() => router.push('/demand/post')}
              >
                <Plus size={24} />
                <span>Post Demand</span>
              </button>
            </>
          )}
          <button
            className="action-btn"
            onClick={() => router.push('/wallet')}
          >
            <WalletIcon size={24} />
            <span>Manage Wallet</span>
          </button>
          <button
            className="action-btn"
            onClick={() => router.push('/rescue')}
          >
            <TrendingUp size={24} />
            <span>Flash Deals</span>
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="info-banner">
        <h3>💡 Tip</h3>
        <p>
          {role === 'seller'
            ? 'Keep your listings updated with accurate prices and availability to attract more buyers.'
            : 'Check rescue deals regularly for the best prices on biomass pellets!'}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;

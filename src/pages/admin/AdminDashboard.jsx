import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, ShoppingCart, TrendingUp, Zap } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalGMV: 0,
    commissionRevenue: 0,
    activeRescueAlerts: 0,
    pendingDeposits: 0,
    withdrawalRequests: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Total users
        const { count: userCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });

        // Total orders and GMV
        const { data: orders } = await supabase
          .from('orders')
          .select('total_amount');

        const totalGMV = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
        const commissionRevenue = totalGMV * 0.02; // 2% commission

        // Active rescue alerts
        const { count: rescueCount } = await supabase
          .from('rescue_alerts')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');

        // Pending deposits
        const { count: depositCount } = await supabase
          .from('wallet_transactions')
          .select('*', { count: 'exact', head: true })
          .eq('type', 'deposit')
          .eq('status', 'pending');

        // Withdrawal requests
        const { count: withdrawCount } = await supabase
          .from('wallet_transactions')
          .select('*', { count: 'exact', head: true })
          .eq('type', 'withdrawal')
          .eq('status', 'pending');

        setStats({
          totalUsers: userCount || 0,
          totalOrders: orders?.length || 0,
          totalGMV,
          commissionRevenue,
          activeRescueAlerts: rescueCount || 0,
          pendingDeposits: depositCount || 0,
          withdrawalRequests: withdrawCount || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`;

  if (loading) {
    return (
      <div className="admin-page">
        <div className="flex-center" style={{ minHeight: '60vh' }}>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Platform Overview & Statistics</p>
      </div>

      {/* KPIs Grid */}
      <div className="admin-kpis">
        <div className="kpi-card">
          <div className="kpi-icon users">
            <Users size={24} />
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Total Users</p>
            <p className="kpi-value">{stats.totalUsers}</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon orders">
            <ShoppingCart size={24} />
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Total Orders</p>
            <p className="kpi-value">{stats.totalOrders}</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon revenue">
            <TrendingUp size={24} />
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Gross Merchandise Value</p>
            <p className="kpi-value text-sm">{formatCurrency(stats.totalGMV)}</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon commission">
            <TrendingUp size={24} />
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Commission Revenue (2%)</p>
            <p className="kpi-value text-sm">{formatCurrency(stats.commissionRevenue)}</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon rescue">
            <Zap size={24} />
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Active Rescue Alerts</p>
            <p className="kpi-value">{stats.activeRescueAlerts}</p>
          </div>
        </div>

        <div className="kpi-card warning">
          <div className="kpi-icon pending">
            <TrendingUp size={24} />
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Pending Actions</p>
            <p className="kpi-value">
              {stats.pendingDeposits + stats.withdrawalRequests}
            </p>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="admin-sections">
        <div className="section-card">
          <h2>Pending Deposits</h2>
          <p className="section-count">{stats.pendingDeposits} requests waiting verification</p>
        </div>

        <div className="section-card">
          <h2>Withdrawal Requests</h2>
          <p className="section-count">{stats.withdrawalRequests} requests to process</p>
        </div>

        <div className="section-card">
          <h2>Flash Deals</h2>
          <p className="section-count">{stats.activeRescueAlerts} active alerts</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-card">
        <h2>Quick Actions</h2>
        <ul className="action-list">
          <li>Review pending KYC verifications</li>
          <li>Approve or reject wallet deposits</li>
          <li>Process withdrawal requests</li>
          <li>Monitor flash deal performance</li>
          <li>Manage user disputes and complaints</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;

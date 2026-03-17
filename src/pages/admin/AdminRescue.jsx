import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const AdminRescue = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        let query = supabase
          .from('rescue_alerts')
          .select(`
            *,
            seller:users!seller_id(name, phone)
          `);

        if (filter !== 'all') {
          query = query.eq('status', filter);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        setAlerts(data || []);
      } catch (error) {
        console.error('Error fetching alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [filter]);

  const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`;

  const totalAlerts = alerts.length;
  const activeAlerts = alerts.filter(a => a.status === 'active').length;
  const acceptedAlerts = alerts.filter(a => a.status === 'accepted').length;
  const expiredAlerts = alerts.filter(a => a.status === 'expired').length;

  const totalDiscountValue = alerts.reduce((sum, a) => {
    return sum + ((a.original_price - a.flash_price) * a.quantity_tonnes);
  }, 0);

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
        <h1>Flash Deals Management</h1>
        <p>Monitor rescue alerts and conversions</p>
      </div>

      {/* KPIs */}
      <div className="admin-kpis">
        <div className="kpi-card">
          <div className="kpi-content">
            <p className="kpi-label">Active Alerts</p>
            <p className="kpi-value">{activeAlerts}</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-content">
            <p className="kpi-label">Accepted Deals</p>
            <p className="kpi-value">{acceptedAlerts}</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-content">
            <p className="kpi-label">Expired Alerts</p>
            <p className="kpi-value">{expiredAlerts}</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-content">
            <p className="kpi-label">Total Discount Value</p>
            <p className="kpi-value text-sm">{formatCurrency(totalDiscountValue)}</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="admin-tabs">
        <button
          className={`tab-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Active ({activeAlerts})
        </button>
        <button
          className={`tab-btn ${filter === 'accepted' ? 'active' : ''}`}
          onClick={() => setFilter('accepted')}
        >
          Accepted ({acceptedAlerts})
        </button>
        <button
          className={`tab-btn ${filter === 'expired' ? 'active' : ''}`}
          onClick={() => setFilter('expired')}
        >
          Expired ({expiredAlerts})
        </button>
        <button
          className={`tab-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({totalAlerts})
        </button>
      </div>

      {/* Table */}
      <div className="admin-table-container">
        {alerts.length === 0 ? (
          <div className="empty-state">
            <p>No alerts found</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Pellet Type</th>
                <th>Seller</th>
                <th>Quantity (T)</th>
                <th>Original Price</th>
                <th>Flash Price</th>
                <th>Discount %</th>
                <th>Discount Value</th>
                <th>Buyer</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map(alert => {
                const discountPercent = Math.round(
                  ((alert.original_price - alert.flash_price) / alert.original_price) * 100
                );
                const discountValue = (alert.original_price - alert.flash_price) * alert.quantity_tonnes;

                return (
                  <tr key={alert.id}>
                    <td className="font-bold">{alert.pellet_type || '-'}</td>
                    <td>
                      <div className="user-cell">
                        <span className="name">{alert.seller?.name || '-'}</span>
                        <span className="phone">{alert.seller?.phone}</span>
                      </div>
                    </td>
                    <td>{alert.quantity_tonnes}</td>
                    <td>{formatCurrency(alert.original_price)}</td>
                    <td className="highlight">{formatCurrency(alert.flash_price)}</td>
                    <td>
                      <span className="discount-badge">-{discountPercent}%</span>
                    </td>
                    <td className="font-bold">{formatCurrency(discountValue)}</td>
                    <td>
                      {alert.accepted_by ? (
                        <span className="text-secondary">Accepted</span>
                      ) : (
                        <span className="text-secondary">-</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${alert.status}`}>
                        {alert.status === 'active' ? '🔴 Active' : alert.status === 'accepted' ? '✓ Accepted' : '⏰ Expired'}
                      </span>
                    </td>
                    <td>{new Date(alert.created_at).toLocaleDateString('en-IN')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Stats */}
      <div className="admin-summary">
        <div className="summary-stat">
          <span className="label">Conversion Rate</span>
          <span className="value">
            {totalAlerts > 0 ? ((acceptedAlerts / totalAlerts) * 100).toFixed(1) : '0'}%
          </span>
        </div>
        <div className="summary-stat">
          <span className="label">Average Discount</span>
          <span className="value">
            {alerts.length > 0
              ? (
                  alerts.reduce((sum, a) => {
                    return sum + ((a.original_price - a.flash_price) / a.original_price) * 100;
                  }, 0) / alerts.length
                ).toFixed(1)
              : '0'}%
          </span>
        </div>
        <div className="summary-stat">
          <span className="label">Total Orders from Rescue</span>
          <span className="value">{acceptedAlerts}</span>
        </div>
      </div>
    </div>
  );
};

export default AdminRescue;

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search } from 'lucide-react';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            listing:listings(pellet_type),
            buyer:users(full_name, phone),
            seller:users(full_name, phone)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders(data || []);
        setFilteredOrders(data || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    let result = orders;

    if (searchQuery) {
      result = result.filter(o =>
        o.id.includes(searchQuery) ||
        o.buyer?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.seller?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filter !== 'all') {
      result = result.filter(o => o.status === filter);
    }

    setFilteredOrders(result);
  }, [searchQuery, filter, orders]);

  const getStatusColor = (status) => {
    const colors = {
      'ordered': '#2196F3',
      'accepted': '#FF9800',
      'loaded': '#FF9800',
      'in_transit': '#9C27B0',
      'delivered': '#4CAF50',
      'rejected': '#F44336',
      'cancelled': '#757575',
    };
    return colors[status] || '#757575';
  };

  const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`;

  const statuses = ['all', 'ordered', 'accepted', 'loaded', 'in_transit', 'delivered', 'rejected'];

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
        <h1>Orders Management</h1>
        <p>Overview of all trades on the platform</p>
      </div>

      {/* Search and Filter */}
      <div className="admin-controls">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by order ID, buyer, or seller..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-tabs">
          {statuses.map(status => (
            <button
              key={status}
              className={`filter-tab ${filter === status ? 'active' : ''}`}
              onClick={() => setFilter(status)}
            >
              {status === 'all'
                ? `All (${orders.length})`
                : `${status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')} (${orders.filter(o => o.status === status).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="admin-table-container">
        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <p>No orders found</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Pellet Type</th>
                <th>Buyer</th>
                <th>Seller</th>
                <th>Quantity (T)</th>
                <th>Price/T (₹)</th>
                <th>Total Amount (₹)</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id}>
                  <td className="order-id">
                    <code>{order.id.slice(0, 8)}...</code>
                  </td>
                  <td>{order.listing?.pellet_type || '-'}</td>
                  <td>
                    <div className="user-cell">
                      <span className="name">{order.buyer?.full_name || '-'}</span>
                      <span className="phone">{order.buyer?.phone}</span>
                    </div>
                  </td>
                  <td>
                    <div className="user-cell">
                      <span className="name">{order.seller?.full_name || '-'}</span>
                      <span className="phone">{order.seller?.phone}</span>
                    </div>
                  </td>
                  <td className="text-right">{order.quantity}</td>
                  <td className="text-right">{order.price_per_tonne?.toLocaleString('en-IN')}</td>
                  <td className="text-right font-bold">
                    {formatCurrency(order.total_amount || 0)}
                  </td>
                  <td>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <span className="payment-status">
                      {order.payment_status === 'completed' ? '✓ Paid' : '⏳ Pending'}
                    </span>
                  </td>
                  <td className="date-cell">
                    {new Date(order.created_at).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Summary Stats */}
      <div className="admin-summary">
        <div className="summary-stat">
          <span className="label">Total Trade Value</span>
          <span className="value">
            {formatCurrency(
              filteredOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
            )}
          </span>
        </div>
        <div className="summary-stat">
          <span className="label">Total Quantity Traded</span>
          <span className="value">
            {filteredOrders.reduce((sum, o) => sum + (o.quantity || 0), 0).toLocaleString('en-IN')} tonnes
          </span>
        </div>
        <div className="summary-stat">
          <span className="label">Average Order Value</span>
          <span className="value">
            {formatCurrency(
              filteredOrders.length > 0
                ? filteredOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0) / filteredOrders.length
                : 0
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;

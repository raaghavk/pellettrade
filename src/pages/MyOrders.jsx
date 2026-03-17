import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import { ChevronRight } from 'lucide-react';

const MyOrders = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { role } = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        let query = supabase.from('orders').select(`
          *,
          listing:listings(pellet_type, price_per_tonne),
          buyer:users!buyer_id(id, name),
          seller:users!seller_id(id, name)
        `);

        if (role === 'seller') {
          query = query.eq('seller_id', profile?.id);
        } else {
          query = query.eq('buyer_id', profile?.id);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    if (profile) {
      fetchOrders();
    }
  }, [profile, role]);

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#2196F3',
      'accepted': '#FF9800',
      'loaded': '#FF9800',
      'in_transit': '#9C27B0',
      'delivered': '#4CAF50',
      'disputed': '#F44336',
      'cancelled': '#757575',
    };
    return colors[status] || '#757575';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'Pending',
      'accepted': 'Accepted',
      'loaded': 'Loaded',
      'in_transit': 'In Transit',
      'delivered': 'Delivered',
      'disputed': 'Disputed',
      'cancelled': 'Cancelled',
    };
    return labels[status] || status;
  };

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter);

  const statuses = ['all', 'pending', 'accepted', 'loaded', 'in_transit', 'delivered'];

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
        <h1>My Orders</h1>
        <p className="subtitle">{filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Status Filter */}
      <div className="status-filter">
        {statuses.map(status => (
          <button
            key={status}
            className={`filter-btn ${filter === status ? 'active' : ''}`}
            onClick={() => setFilter(status)}
          >
            {status === 'all' ? 'All' : getStatusLabel(status)}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="empty-state">
          <h2>No orders found</h2>
          <p>
            {role === 'seller'
              ? 'When buyers place orders, they will appear here.'
              : 'When you place orders, they will appear here.'}
          </p>
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map(order => (
            <div
              key={order.id}
              className="order-list-item"
              onClick={() => navigate(`/order/${order.id}`)}
            >
              <div className="order-header">
                <div className="order-title">
                  <h3>{order.listing?.pellet_type || 'Pellets'}</h3>
                  <p className="order-id">Order #{order.id.slice(0, 8)}</p>
                </div>
                <div
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {getStatusLabel(order.status)}
                </div>
              </div>

              <div className="order-details">
                <div className="detail-item">
                  <span className="label">Quantity</span>
                  <span className="value">{order.quantity_tonnes} tonnes</span>
                </div>
                <div className="detail-item">
                  <span className="label">Amount</span>
                  <span className="value">₹{order.total_amount?.toLocaleString('en-IN')}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Party</span>
                  <span className="value">
                    {role === 'seller'
                      ? order.buyer?.name || 'Buyer'
                      : order.seller?.name || 'Seller'}
                  </span>
                </div>
              </div>

              <div className="order-footer">
                <span className="order-date">
                  {new Date(order.created_at).toLocaleDateString('en-IN')}
                </span>
                <ChevronRight size={20} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;

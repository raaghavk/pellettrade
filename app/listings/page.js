'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';

const MyListings = () => {
  const router = useRouter();
  const { profile, loading: authLoading, isAuthenticated } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('seller_id', profile?.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setListings(data || []);
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoading(false);
      }
    };

    if (profile) {
      fetchListings();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [profile, authLoading]);

  const handleDelete = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;

    try {
      const { error } = await supabase
        .from('listings')
        .update({ status: 'inactive' })
        .eq('id', listingId)
        .eq('seller_id', profile.id);

      if (error) throw error;
      setListings(prev => prev.filter(l => l.id !== listingId));
    } catch (error) {
      console.error('Error deleting listing:', error);
      window.alert('Failed to delete listing');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': '#4CAF50',
      'inactive': '#757575',
      'sold_out': '#FF9800',
    };
    return colors[status] || '#757575';
  };

  if (authLoading || loading) {
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
        <h1>My Listings</h1>
        <p className="subtitle">{listings.length} listing{listings.length !== 1 ? 's' : ''}</p>
      </div>

      <button
        className="btn btn-primary btn-block btn-large"
        onClick={() => router.push('/listings/create')}
        style={{ marginBottom: '16px' }}
      >
        <Plus size={20} />
        Create New Listing
      </button>

      {listings.length === 0 ? (
        <div className="empty-state">
          <h2>No listings yet</h2>
          <p>Create your first listing to start selling biomass pellets.</p>
        </div>
      ) : (
        <div className="orders-list">
          {listings.map(listing => (
            <div key={listing.id} className="order-list-item">
              <div className="order-header">
                <div className="order-title">
                  <h3>{listing.pellet_type}</h3>
                  <p className="order-id">
                    {listing.location_city}{listing.location_state ? `, ${listing.location_state}` : ''}
                  </p>
                </div>
                <div
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(listing.status) }}
                >
                  {listing.status}
                </div>
              </div>

              <div className="order-details">
                <div className="detail-item">
                  <span className="label">Price</span>
                  <span className="value">₹{listing.price_per_tonne?.toLocaleString('en-IN')}/t</span>
                </div>
                <div className="detail-item">
                  <span className="label">Quantity</span>
                  <span className="value">{listing.quantity_tonnes} tonnes</span>
                </div>
                <div className="detail-item">
                  <span className="label">Moisture</span>
                  <span className="value">{listing.moisture_pct}%</span>
                </div>
              </div>

              <div className="order-footer" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '13px' }}
                  onClick={() => router.push(`/listing/${listing.id}`)}
                >
                  <Eye size={16} />
                  View
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '13px', color: '#F44336' }}
                  onClick={() => handleDelete(listing.id)}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyListings;

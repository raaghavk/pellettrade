'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, CheckCircle, Clock } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setUsers(data || []);
        setFilteredUsers(data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    let result = users;

    if (searchQuery) {
      result = result.filter(u =>
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.phone?.includes(searchQuery) ||
        u.business_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filter === 'verified') {
      result = result.filter(u => u.kyc_status === 'verified');
    } else if (filter === 'unverified') {
      result = result.filter(u => u.kyc_status !== 'verified');
    } else if (filter === 'sellers') {
      result = result.filter(u => u.role_active === 'seller');
    } else if (filter === 'buyers') {
      result = result.filter(u => u.role_active === 'buyer');
    }

    setFilteredUsers(result);
  }, [searchQuery, filter, users]);

  const handleVerifyKYC = async (userId) => {
    try {
      await supabase
        .from('users')
        .update({ kyc_status: 'verified' })
        .eq('id', userId);

      setUsers(prev =>
        prev.map(u =>
          u.id === userId ? { ...u, kyc_status: 'verified' } : u
        )
      );
    } catch (error) {
      console.error('Error verifying KYC:', error);
    }
  };

  const handleRejectKYC = async (userId) => {
    try {
      await supabase
        .from('users')
        .update({ kyc_status: 'rejected' })
        .eq('id', userId);

      setUsers(prev =>
        prev.map(u =>
          u.id === userId ? { ...u, kyc_status: 'rejected' } : u
        )
      );
    } catch (error) {
      console.error('Error rejecting KYC:', error);
    }
  };

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
        <h1>User Management</h1>
        <p>Manage traders and verify KYC</p>
      </div>

      {/* Search and Filter */}
      <div className="admin-controls">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by name, phone, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({users.length})
          </button>
          <button
            className={`filter-tab ${filter === 'verified' ? 'active' : ''}`}
            onClick={() => setFilter('verified')}
          >
            Verified ({users.filter(u => u.kyc_status === 'verified').length})
          </button>
          <button
            className={`filter-tab ${filter === 'unverified' ? 'active' : ''}`}
            onClick={() => setFilter('unverified')}
          >
            Unverified ({users.filter(u => u.kyc_status !== 'verified').length})
          </button>
          <button
            className={`filter-tab ${filter === 'sellers' ? 'active' : ''}`}
            onClick={() => setFilter('sellers')}
          >
            Sellers ({users.filter(u => u.role_active === 'seller').length})
          </button>
          <button
            className={`filter-tab ${filter === 'buyers' ? 'active' : ''}`}
            onClick={() => setFilter('buyers')}
          >
            Buyers ({users.filter(u => u.role_active === 'buyer').length})
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="admin-table-container">
        {filteredUsers.length === 0 ? (
          <div className="empty-state">
            <p>No users found</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Company</th>
                <th>Rating</th>
                <th>KYC Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td className="user-name">
                    <span>{user.name || 'N/A'}</span>
                    {user.is_admin && <span className="admin-badge">Admin</span>}
                  </td>
                  <td>{user.phone}</td>
                  <td>
                    <span className="role-badge" style={{
                      backgroundColor: user.role_active === 'seller' ? '#4CAF50' : '#2196F3'
                    }}>
                      {user.role_active === 'seller' ? 'Seller' : 'Buyer'}
                    </span>
                  </td>
                  <td>{user.business_name || '-'}</td>
                  <td>
                    <span className="rating">
                      {user.rating?.toFixed(1) || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <div className="kyc-status">
                      {user.kyc_status === 'verified' ? (
                        <>
                          <CheckCircle size={16} color="#4CAF50" />
                          <span>Verified</span>
                        </>
                      ) : (
                        <>
                          <Clock size={16} color="#FF9800" />
                          <span>{user.kyc_status || 'Pending'}</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td>
                    {user.kyc_status !== 'verified' && (
                      <div className="action-buttons">
                        <button
                          className="btn-approve"
                          onClick={() => handleVerifyKYC(user.id)}
                          title="Approve KYC"
                        >
                          ✓
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => handleRejectKYC(user.id)}
                          title="Reject KYC"
                        >
                          ✗
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;

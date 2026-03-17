'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Check, X } from 'lucide-react';

const AdminWallet = () => {
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('deposits');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // Fetch deposits
        const { data: depositData, error: depositError } = await supabase
          .from('wallet_transactions')
          .select(`
            *,
            user:users!user_id(name, phone, business_name)
          `)
          .eq('type', 'deposit')
          .order('created_at', { ascending: false });

        // Fetch withdrawals
        const { data: withdrawalData, error: withdrawalError } = await supabase
          .from('wallet_transactions')
          .select(`
            *,
            user:users!user_id(name, phone, business_name)
          `)
          .eq('type', 'withdrawal')
          .order('created_at', { ascending: false });

        if (depositError) throw depositError;
        if (withdrawalError) throw withdrawalError;

        setDeposits(depositData || []);
        setWithdrawals(withdrawalData || []);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const handleApproveDeposit = async (transactionId) => {
    try {
      await supabase
        .from('wallet_transactions')
        .update({ status: 'completed' })
        .eq('id', transactionId);

      // Get the transaction to find user and amount
      const tx = deposits.find(d => d.id === transactionId);
      if (tx) {
        // Update user wallet
        const { data: user } = await supabase
          .from('users')
          .select('wallet_balance')
          .eq('id', tx.user_id)
          .single();

        const newBalance = (user?.wallet_balance || 0) + tx.amount;
        await supabase
          .from('users')
          .update({ wallet_balance: newBalance })
          .eq('id', tx.user_id);
      }

      setDeposits(prev =>
        prev.map(d =>
          d.id === transactionId ? { ...d, status: 'completed' } : d
        )
      );
    } catch (error) {
      console.error('Error approving deposit:', error);
    }
  };

  const handleRejectDeposit = async (transactionId) => {
    try {
      await supabase
        .from('wallet_transactions')
        .update({ status: 'rejected' })
        .eq('id', transactionId);

      setDeposits(prev =>
        prev.map(d =>
          d.id === transactionId ? { ...d, status: 'rejected' } : d
        )
      );
    } catch (error) {
      console.error('Error rejecting deposit:', error);
    }
  };

  const handleApproveWithdrawal = async (transactionId) => {
    try {
      await supabase
        .from('wallet_transactions')
        .update({ status: 'completed' })
        .eq('id', transactionId);

      setWithdrawals(prev =>
        prev.map(w =>
          w.id === transactionId ? { ...w, status: 'completed' } : w
        )
      );
    } catch (error) {
      console.error('Error approving withdrawal:', error);
    }
  };

  const handleRejectWithdrawal = async (transactionId) => {
    try {
      const tx = withdrawals.find(w => w.id === transactionId);
      if (tx) {
        // Refund the amount back to user wallet
        const { data: user } = await supabase
          .from('users')
          .select('wallet_balance')
          .eq('id', tx.user_id)
          .single();

        const newBalance = (user?.wallet_balance || 0) + tx.amount;
        await supabase
          .from('users')
          .update({ wallet_balance: newBalance })
          .eq('id', tx.user_id);
      }

      await supabase
        .from('wallet_transactions')
        .update({ status: 'rejected' })
        .eq('id', transactionId);

      setWithdrawals(prev =>
        prev.map(w =>
          w.id === transactionId ? { ...w, status: 'rejected' } : w
        )
      );
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
    }
  };

  const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`;

  const pendingDeposits = deposits.filter(d => d.status === 'pending');
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');

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
        <h1>Wallet Management</h1>
        <p>Approve deposits and process withdrawals</p>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'deposits' ? 'active' : ''}`}
          onClick={() => setActiveTab('deposits')}
        >
          Deposits ({pendingDeposits.length} pending)
        </button>
        <button
          className={`tab-btn ${activeTab === 'withdrawals' ? 'active' : ''}`}
          onClick={() => setActiveTab('withdrawals')}
        >
          Withdrawals ({pendingWithdrawals.length} pending)
        </button>
      </div>

      {/* Deposits Tab */}
      {activeTab === 'deposits' && (
        <div className="admin-table-container">
          {deposits.length === 0 ? (
            <div className="empty-state">
              <p>No deposits</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Phone</th>
                  <th>Company</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {deposits.map(deposit => (
                  <tr key={deposit.id} className={deposit.status === 'pending' ? 'pending-row' : ''}>
                    <td>{deposit.user?.name || 'Unknown'}</td>
                    <td>{deposit.user?.phone}</td>
                    <td>{deposit.user?.business_name || '-'}</td>
                    <td className="font-bold">{formatCurrency(deposit.amount)}</td>
                    <td>{deposit.description || '-'}</td>
                    <td>
                      <span className={`status-badge ${deposit.status}`}>
                        {deposit.status === 'pending' ? '⏳ Pending' : deposit.status === 'completed' ? '✓ Approved' : '✗ Rejected'}
                      </span>
                    </td>
                    <td>{new Date(deposit.created_at).toLocaleDateString('en-IN')}</td>
                    <td>
                      {deposit.status === 'pending' && (
                        <div className="action-buttons">
                          <button
                            className="btn-approve"
                            onClick={() => handleApproveDeposit(deposit.id)}
                            title="Approve"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            className="btn-reject"
                            onClick={() => handleRejectDeposit(deposit.id)}
                            title="Reject"
                          >
                            <X size={16} />
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
      )}

      {/* Withdrawals Tab */}
      {activeTab === 'withdrawals' && (
        <div className="admin-table-container">
          {withdrawals.length === 0 ? (
            <div className="empty-state">
              <p>No withdrawals</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Phone</th>
                  <th>Bank Account</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map(withdrawal => (
                  <tr key={withdrawal.id} className={withdrawal.status === 'pending' ? 'pending-row' : ''}>
                    <td>{withdrawal.user?.name || 'Unknown'}</td>
                    <td>{withdrawal.user?.phone}</td>
                    <td>
                      <div className="bank-info">
                        <p>{withdrawal.description || '-'}</p>
                      </div>
                    </td>
                    <td className="font-bold">{formatCurrency(withdrawal.amount)}</td>
                    <td>
                      <span className={`status-badge ${withdrawal.status}`}>
                        {withdrawal.status === 'pending' ? '⏳ Pending' : withdrawal.status === 'completed' ? '✓ Processed' : '✗ Rejected'}
                      </span>
                    </td>
                    <td>{new Date(withdrawal.created_at).toLocaleDateString('en-IN')}</td>
                    <td>
                      {withdrawal.status === 'pending' && (
                        <div className="action-buttons">
                          <button
                            className="btn-approve"
                            onClick={() => handleApproveWithdrawal(withdrawal.id)}
                            title="Approve"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            className="btn-reject"
                            onClick={() => handleRejectWithdrawal(withdrawal.id)}
                            title="Reject"
                          >
                            <X size={16} />
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
      )}

      {/* Summary */}
      <div className="admin-summary">
        <div className="summary-stat">
          <span className="label">Total Pending Deposits</span>
          <span className="value">
            {formatCurrency(
              pendingDeposits.reduce((sum, d) => sum + d.amount, 0)
            )}
          </span>
        </div>
        <div className="summary-stat">
          <span className="label">Total Pending Withdrawals</span>
          <span className="value">
            {formatCurrency(
              pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0)
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdminWallet;

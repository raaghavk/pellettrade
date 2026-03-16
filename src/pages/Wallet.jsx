import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Plus, Minus, Eye, EyeOff, Download } from 'lucide-react';

const Wallet = () => {
  const { profile, setProfile } = useAuth();
  const [showBalance, setShowBalance] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('balance');
  const [error, setError] = useState('');

  const [addMoneyForm, setAddMoneyForm] = useState({
    amount: '',
    paymentMethod: 'bank_transfer',
  });

  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    bankAccount: '',
    ifscCode: '',
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data, error } = await supabase
          .from('wallet_transactions')
          .select('*')
          .eq('user_id', profile?.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTransactions(data || []);
      } catch (err) {
        console.error('Error fetching transactions:', err);
      } finally {
        setLoading(false);
      }
    };

    if (profile) {
      fetchTransactions();
    }
  }, [profile?.id]);

  const handleAddMoney = async (e) => {
    e.preventDefault();
    setError('');

    if (!addMoneyForm.amount || parseFloat(addMoneyForm.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      const { error: txError } = await supabase
        .from('wallet_transactions')
        .insert([{
          user_id: profile.id,
          type: 'deposit',
          amount: parseFloat(addMoneyForm.amount),
          status: 'pending',
          description: `Bank transfer - ${addMoneyForm.paymentMethod}`,
          created_at: new Date().toISOString(),
        }]);

      if (txError) throw txError;

      setAddMoneyForm({ amount: '', paymentMethod: 'bank_transfer' });
      setActiveTab('bank');
    } catch (err) {
      console.error('Error adding money:', err);
      setError(err.message);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setError('');

    if (!withdrawForm.amount || parseFloat(withdrawForm.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (parseFloat(withdrawForm.amount) > (profile?.wallet_balance || 0)) {
      setError('Insufficient balance');
      return;
    }

    if (!withdrawForm.bankAccount.trim() || !withdrawForm.ifscCode.trim()) {
      setError('Please fill all bank details');
      return;
    }

    try {
      const { error: txError } = await supabase
        .from('wallet_transactions')
        .insert([{
          user_id: profile.id,
          type: 'withdrawal',
          amount: parseFloat(withdrawForm.amount),
          status: 'pending',
          description: `Withdrawal to ${withdrawForm.bankAccount}`,
          bank_account: withdrawForm.bankAccount,
          ifsc_code: withdrawForm.ifscCode,
          created_at: new Date().toISOString(),
        }]);

      if (txError) throw txError;

      // Deduct from balance immediately
      const newBalance = (profile?.wallet_balance || 0) - parseFloat(withdrawForm.amount);
      await supabase
        .from('users')
        .update({ wallet_balance: newBalance })
        .eq('id', profile.id);

      setProfile(prev => ({ ...prev, wallet_balance: newBalance }));

      setWithdrawForm({
        amount: '',
        bankAccount: '',
        ifscCode: '',
      });
      setActiveTab('history');
    } catch (err) {
      console.error('Error processing withdrawal:', err);
      setError(err.message);
    }
  };

  const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`;

  const getTransactionIcon = (type) => {
    return type === 'deposit' ? <Plus size={20} /> : <Minus size={20} />;
  };

  const getTransactionColor = (type) => {
    return type === 'deposit' ? '#4CAF50' : '#FF9800';
  };

  const lowBalance = (profile?.wallet_balance || 0) < 5000;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Wallet</h1>
      </div>

      {/* Balance Card */}
      <div className="balance-card">
        <div className="balance-header">
          <p className="balance-label">Available Balance</p>
          <button
            className="visibility-toggle"
            onClick={() => setShowBalance(!showBalance)}
          >
            {showBalance ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
        </div>

        <div className="balance-amount">
          {showBalance ? (
            <>
              <span className="currency">₹</span>
              <span className="amount">
                {(profile?.wallet_balance || 0).toLocaleString('en-IN')}
              </span>
            </>
          ) : (
            <span className="hidden">••••••</span>
          )}
        </div>

        {lowBalance && (
          <div className="warning-banner">
            ⚠️ Minimum balance for trading is ₹5,000
          </div>
        )}

        <div className="balance-actions">
          <button
            className="action-btn"
            onClick={() => {
              setActiveTab('add');
              setError('');
            }}
          >
            <Plus size={20} />
            <span>Add Money</span>
          </button>
          <button
            className="action-btn"
            onClick={() => {
              setActiveTab('withdraw');
              setError('');
            }}
          >
            <Download size={20} />
            <span>Withdraw</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="wallet-tabs">
        <button
          className={`tab-btn ${activeTab === 'balance' ? 'active' : ''}`}
          onClick={() => setActiveTab('balance')}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => setActiveTab('add')}
        >
          Add Money
        </button>
        <button
          className={`tab-btn ${activeTab === 'withdraw' ? 'active' : ''}`}
          onClick={() => setActiveTab('withdraw')}
        >
          Withdraw
        </button>
        <button
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'balance' && (
        <div className="tab-content">
          <div className="info-section">
            <h2>How it Works</h2>
            <ul className="info-list">
              <li>Add money to your wallet for secure transactions</li>
              <li>Money is held in escrow during orders</li>
              <li>Released after successful delivery</li>
              <li>Withdraw anytime to your bank account</li>
            </ul>
          </div>

          <div className="info-section">
            <h2>Recent Transactions</h2>
            {transactions.slice(0, 3).length === 0 ? (
              <p className="empty-text">No transactions yet</p>
            ) : (
              <div className="mini-transaction-list">
                {transactions.slice(0, 3).map(tx => (
                  <div key={tx.id} className="mini-tx-item">
                    <div className="tx-icon" style={{ color: getTransactionColor(tx.type) }}>
                      {getTransactionIcon(tx.type)}
                    </div>
                    <div className="tx-details">
                      <p className="tx-desc">{tx.description}</p>
                      <p className="tx-date">
                        {new Date(tx.created_at).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <span className={`tx-amount ${tx.type}`}>
                      {tx.type === 'deposit' ? '+' : '-'} {formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'add' && (
        <div className="tab-content">
          <form onSubmit={handleAddMoney} className="form-container">
            <div className="info-box">
              <h3>Add Money to Wallet</h3>
              <p>
                Transfer funds to the account below. We'll verify and add to your wallet within 24 hours.
              </p>
            </div>

            <div className="bank-details">
              <h3>Bank Details</h3>
              <div className="detail-item">
                <span className="label">Account Holder</span>
                <span className="value">PelletTrade India Pvt Ltd</span>
              </div>
              <div className="detail-item">
                <span className="label">Account Number</span>
                <span className="value">1234567890123456</span>
              </div>
              <div className="detail-item">
                <span className="label">IFSC Code</span>
                <span className="value">SBIN0001234</span>
              </div>
              <div className="detail-item">
                <span className="label">Bank</span>
                <span className="value">State Bank of India</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="amount">Amount (₹)</label>
              <input
                id="amount"
                type="number"
                value={addMoneyForm.amount}
                onChange={(e) => setAddMoneyForm({ ...addMoneyForm, amount: e.target.value })}
                placeholder="Enter amount"
                step="100"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="method">Payment Method</label>
              <select
                id="method"
                value={addMoneyForm.paymentMethod}
                onChange={(e) => setAddMoneyForm({ ...addMoneyForm, paymentMethod: e.target.value })}
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="neft">NEFT</option>
                <option value="rtgs">RTGS</option>
              </select>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="btn btn-primary btn-block btn-large">
              Request Deposit
            </button>

            <p className="form-hint">
              Include your phone number in the transfer description for faster verification
            </p>
          </form>
        </div>
      )}

      {activeTab === 'withdraw' && (
        <div className="tab-content">
          <form onSubmit={handleWithdraw} className="form-container">
            <div className="info-box warning">
              <h3>Withdrawal Details</h3>
              <p>
                Withdrawals will be processed to your registered bank account. Allow 2-3 business days for the amount to appear.
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="withdraw-amount">Amount (₹)</label>
              <input
                id="withdraw-amount"
                type="number"
                value={withdrawForm.amount}
                onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                placeholder="Enter amount"
                step="100"
                min="0"
                max={profile?.wallet_balance || 0}
              />
              <p className="form-hint">
                Available: {formatCurrency(profile?.wallet_balance || 0)}
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="bank-account">Bank Account Number</label>
              <input
                id="bank-account"
                type="text"
                value={withdrawForm.bankAccount}
                onChange={(e) => setWithdrawForm({ ...withdrawForm, bankAccount: e.target.value })}
                placeholder="Enter account number"
              />
            </div>

            <div className="form-group">
              <label htmlFor="ifsc">IFSC Code</label>
              <input
                id="ifsc"
                type="text"
                value={withdrawForm.ifscCode}
                onChange={(e) => setWithdrawForm({ ...withdrawForm, ifscCode: e.target.value })}
                placeholder="Enter IFSC code"
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              className="btn btn-primary btn-block btn-large"
              disabled={!withdrawForm.amount || (parseFloat(withdrawForm.amount) || 0) > (profile?.wallet_balance || 0)}
            >
              Request Withdrawal
            </button>
          </form>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="tab-content">
          {loading ? (
            <div className="flex-center">
              <div className="spinner"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="empty-state">
              <p>No transactions yet</p>
            </div>
          ) : (
            <div className="transaction-list">
              {transactions.map(tx => (
                <div key={tx.id} className="transaction-item">
                  <div className="tx-icon" style={{ color: getTransactionColor(tx.type) }}>
                    {getTransactionIcon(tx.type)}
                  </div>
                  <div className="tx-info">
                    <p className="tx-type">{tx.type === 'deposit' ? 'Add Money' : 'Withdrawal'}</p>
                    <p className="tx-desc">{tx.description}</p>
                    <p className="tx-date">
                      {new Date(tx.created_at).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div className="tx-amount-section">
                    <span className={`tx-amount ${tx.type}`}>
                      {tx.type === 'deposit' ? '+' : '-'} {formatCurrency(tx.amount)}
                    </span>
                    <span className={`tx-status ${tx.status}`}>
                      {tx.status === 'pending' ? '⏳' : tx.status === 'completed' ? '✓' : '✗'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Wallet;

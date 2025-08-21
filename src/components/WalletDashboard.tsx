import { useState, useEffect } from 'react';
import { useWalletStore } from '@/stores/walletStore';
import { useAuthStore } from '@/stores/authStore';
import { formatCurrency, formatTransactionDate } from '@/lib/utils';
import Button from '@/components/Button';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/Card';
import Loading from '@/components/Loading';
import Modal from '@/components/Modal';
import Input from '@/components/Input';
import {
  Wallet,
  Plus,
  Minus,
  History,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  X
} from 'lucide-react';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number, paymentMethod: string, paymentDetails: string, userNotes?: string) => Promise<void>;
  isLoading: boolean;
}

function DepositModal({ isOpen, onClose, onSubmit, isLoading }: DepositModalProps) {
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: '',
    paymentDetails: '',
    userNotes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount) || amount <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    } else if (amount < 10) {
      newErrors.amount = 'Minimum deposit amount is $10';
    } else if (amount > 10000) {
      newErrors.amount = 'Maximum deposit amount is $10,000';
    }

    if (!formData.paymentMethod.trim()) {
      newErrors.paymentMethod = 'Payment method is required';
    }

    if (!formData.paymentDetails.trim()) {
      newErrors.paymentDetails = 'Payment details are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        await onSubmit(
          parseFloat(formData.amount),
          formData.paymentMethod,
          formData.paymentDetails,
          formData.userNotes || undefined
        );
        setFormData({ amount: '', paymentMethod: '', paymentDetails: '', userNotes: '' });
        onClose();
      } catch (error) {
        // Error is handled by the store
      }
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request Deposit" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Amount ($)"
          type="number"
          step="0.01"
          min="10"
          max="10000"
          value={formData.amount}
          onChange={(e) => handleChange('amount', e.target.value)}
          error={errors.amount}
          placeholder="Enter amount (min: $10, max: $10,000)"
          required
        />
        
        <Input
          label="Payment Method"
          value={formData.paymentMethod}
          onChange={(e) => handleChange('paymentMethod', e.target.value)}
          error={errors.paymentMethod}
          placeholder="e.g., Bank Transfer, PayPal, etc."
          required
        />
        
        <Input
          label="Payment Details"
          value={formData.paymentDetails}
          onChange={(e) => handleChange('paymentDetails', e.target.value)}
          error={errors.paymentDetails}
          placeholder="Account details, reference number, etc."
          required
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            value={formData.userNotes}
            onChange={(e) => handleChange('userNotes', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
            placeholder="Any additional information..."
            maxLength={500}
          />
          <p className="text-xs text-gray-400 mt-1">
            {formData.userNotes.length}/500 characters
          </p>
        </div>
        
        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-200">
              <p className="font-medium mb-1">Important:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Deposit requests require admin approval</li>
                <li>Processing time: 1-3 business days</li>
                <li>Ensure payment details are accurate</li>
                <li>Daily limit: $10,000</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3 justify-end pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}>
            <Plus className="w-4 h-4 mr-2" />
            Request Deposit
          </Button>
        </div>
      </form>
    </Modal>
  );
}

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number, paymentMethod: string, paymentDetails: string, userNotes?: string) => Promise<void>;
  isLoading: boolean;
  availableBalance: number;
}

function WithdrawalModal({ isOpen, onClose, onSubmit, isLoading, availableBalance }: WithdrawalModalProps) {
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: '',
    paymentDetails: '',
    userNotes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount) || amount <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    } else if (amount < 5) {
      newErrors.amount = 'Minimum withdrawal amount is $5';
    } else if (amount > availableBalance) {
      newErrors.amount = 'Amount exceeds available balance';
    } else if (amount > 5000) {
      newErrors.amount = 'Maximum withdrawal amount is $5,000';
    }

    if (!formData.paymentMethod.trim()) {
      newErrors.paymentMethod = 'Payment method is required';
    }

    if (!formData.paymentDetails.trim()) {
      newErrors.paymentDetails = 'Payment details are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        await onSubmit(
          parseFloat(formData.amount),
          formData.paymentMethod,
          formData.paymentDetails,
          formData.userNotes || undefined
        );
        setFormData({ amount: '', paymentMethod: '', paymentDetails: '', userNotes: '' });
        onClose();
      } catch (error) {
        // Error is handled by the store
      }
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request Withdrawal" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-200 text-sm">Available Balance:</span>
            <span className="text-blue-100 font-semibold">{formatCurrency(availableBalance)}</span>
          </div>
        </div>
        
        <Input
          label="Amount ($)"
          type="number"
          step="0.01"
          min="5"
          max={Math.min(availableBalance, 5000)}
          value={formData.amount}
          onChange={(e) => handleChange('amount', e.target.value)}
          error={errors.amount}
          placeholder={`Enter amount (min: $5, max: ${formatCurrency(Math.min(availableBalance, 5000))})`}
          required
        />
        
        <Input
          label="Payment Method"
          value={formData.paymentMethod}
          onChange={(e) => handleChange('paymentMethod', e.target.value)}
          error={errors.paymentMethod}
          placeholder="e.g., Bank Transfer, PayPal, etc."
          required
        />
        
        <Input
          label="Payment Details"
          value={formData.paymentDetails}
          onChange={(e) => handleChange('paymentDetails', e.target.value)}
          error={errors.paymentDetails}
          placeholder="Account details where funds should be sent"
          required
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            value={formData.userNotes}
            onChange={(e) => handleChange('userNotes', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
            placeholder="Any additional information..."
            maxLength={500}
          />
          <p className="text-xs text-gray-400 mt-1">
            {formData.userNotes.length}/500 characters
          </p>
        </div>
        
        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-200">
              <p className="font-medium mb-1">Important:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Withdrawal requests require admin approval</li>
                <li>Processing time: 1-3 business days</li>
                <li>Ensure payment details are accurate</li>
                <li>Daily limit: $5,000</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3 justify-end pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}>
            <Minus className="w-4 h-4 mr-2" />
            Request Withdrawal
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function WalletDashboard() {
  const { user } = useAuthStore();
  const {
    wallet,
    transactions,
    requests,
    isLoading,
    error,
    transactionsPagination,
    requestsPagination,
    fetchWallet,
    fetchTransactions,
    fetchRequests,
    createDepositRequest,
    createWithdrawalRequest,
    cancelRequest,
    clearError
  } = useWalletStore();

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'transactions' | 'requests'>('transactions');

  useEffect(() => {
    fetchWallet();
    fetchTransactions();
    fetchRequests();
  }, []);

  const handleRefresh = async () => {
    try {
      await Promise.all([
        fetchWallet(),
        fetchTransactions(1),
        fetchRequests(1)
      ]);
    } catch (error) {
      // Error handled by store
    }
  };

  const handleLoadMoreTransactions = () => {
    if (transactionsPagination.hasMore && !isLoading) {
      fetchTransactions(transactionsPagination.page + 1);
    }
  };

  const handleLoadMoreRequests = () => {
    if (requestsPagination.hasMore && !isLoading) {
      fetchRequests(requestsPagination.page + 1);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'failed':
      case 'rejected':
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'failed':
      case 'rejected':
      case 'cancelled':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'tournament_prize':
        return <ArrowDownLeft className="w-4 h-4 text-green-400" />;
      case 'withdrawal':
      case 'tournament_fee':
        return <ArrowUpRight className="w-4 h-4 text-red-400" />;
      case 'adjustment':
        return <RefreshCw className="w-4 h-4 text-blue-400" />;
      default:
        return <History className="w-4 h-4 text-gray-400" />;
    }
  };

  if (!wallet && isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loading text="Loading wallet..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <XCircle className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-200">{error}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={clearError}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Wallet Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Wallet className="w-6 h-6 text-blue-400 mr-3" />
              <CardTitle>My Wallet</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={handleRefresh} loading={isLoading}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Debit Card Design */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 rounded-xl p-6 text-white shadow-2xl transform hover:scale-105 transition-transform duration-300 relative overflow-hidden">
                {/* Card Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full transform translate-x-16 -translate-y-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full transform -translate-x-12 translate-y-12"></div>
                </div>
                
                {/* Card Content */}
                <div className="relative z-10">
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h3 className="text-lg font-bold tracking-wider">SENC CARD</h3>
                      <p className="text-blue-200 text-sm">ESPORTS WALLET</p>
                    </div>
                    <div className="w-12 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-md flex items-center justify-center">
                      <div className="w-8 h-6 bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-sm"></div>
                    </div>
                  </div>
                  
                  {/* Card Number */}
                  <div className="mb-6">
                    <p className="text-xl font-mono tracking-widest">
                      {wallet?.walletId ? 
                        `${wallet.walletId.slice(0, 4)} ${wallet.walletId.slice(4, 8)} ${wallet.walletId.slice(8, 12)} ${wallet.walletId.slice(12, 16)}` 
                        : '•••• •••• •••• ••••'
                      }
                    </p>
                  </div>
                  
                  {/* Card Details */}
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-blue-200 uppercase tracking-wide mb-1">Cardholder</p>
                      <p className="font-semibold text-sm uppercase tracking-wide">
                        {user ? `${user.firstName} ${user.lastName}` : 'Loading...'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-blue-200 uppercase tracking-wide mb-1">Balance</p>
                      <p className="font-bold text-lg text-green-300">
                        {wallet ? formatCurrency(wallet.balance) : '$0.00'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Valid Thru */}
                  <div className="absolute bottom-6 right-6">
                    <p className="text-xs text-blue-200 uppercase tracking-wide">Valid Thru</p>
                    <p className="font-mono text-sm">12/29</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <h4 className="text-lg font-semibold text-white mb-4">Quick Actions</h4>
                
                <div className="space-y-3">
                  <Button 
                    onClick={() => setShowDepositModal(true)}
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={!wallet?.isActive}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Request Deposit
                  </Button>
                  
                  <Button 
                     variant="ghost" 
                     onClick={() => setShowWithdrawalModal(true)}
                     className="w-full border border-red-600 text-red-400 hover:bg-red-600/10"
                     disabled={!wallet?.isActive || (wallet?.balance || 0) < 5}
                   >
                     <Minus className="w-4 h-4 mr-2" />
                     Request Withdrawal
                   </Button>
                 </div>
                </div>
              </div>
           </div>
        </CardContent>
      </Card>

      {/* Transactions and Requests */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('transactions')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'transactions'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <History className="w-4 h-4 mr-2 inline" />
                Transactions
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'requests'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Clock className="w-4 h-4 mr-2 inline" />
                Requests
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === 'transactions' && (
            <div className="space-y-4">
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No transactions yet</p>
                </div>
              ) : (
                <>
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        {getTransactionIcon(transaction.type)}
                        <div className="ml-3">
                          <p className="text-white font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-400">
                            {formatTransactionDate(transaction.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          transaction.type === 'deposit' || transaction.type === 'tournament_prize'
                            ? 'text-green-400'
                            : 'text-red-400'
                        }`}>
                          {transaction.type === 'deposit' || transaction.type === 'tournament_prize' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </p>
                        <div className="flex items-center">
                          {getStatusIcon(transaction.status)}
                          <span className={`text-sm ml-1 ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {transactionsPagination.hasMore && (
                    <div className="text-center pt-4">
                      <Button 
                        variant="ghost" 
                        onClick={handleLoadMoreTransactions}
                        loading={isLoading}
                      >
                        Load More
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-4">
              {requests.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No requests yet</p>
                </div>
              ) : (
                <>
                  {requests.map((request) => (
                    <div key={request.id} className="p-4 bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          {request.type === 'deposit' ? (
                            <ArrowDownLeft className="w-4 h-4 text-green-400 mr-2" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-red-400 mr-2" />
                          )}
                          <span className="text-white font-medium capitalize">
                            {request.type} Request
                          </span>
                        </div>
                        <div className="flex items-center">
                          {getStatusIcon(request.status)}
                          <span className={`text-sm ml-1 ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Amount:</p>
                          <p className="text-white font-semibold">{formatCurrency(request.amount)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Date:</p>
                          <p className="text-white">{formatTransactionDate(request.created_at)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Payment Method:</p>
                          <p className="text-white">{request.payment_method}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Status:</p>
                          <p className={getStatusColor(request.status)}>{request.status}</p>
                        </div>
                      </div>
                      
                      {request.user_notes && (
                        <div className="mt-3">
                          <p className="text-gray-400 text-sm">Notes:</p>
                          <p className="text-white text-sm">{request.user_notes}</p>
                        </div>
                      )}
                      
                      {request.admin_notes && (
                        <div className="mt-3 p-3 bg-gray-600 rounded">
                          <p className="text-gray-400 text-sm">Admin Notes:</p>
                          <p className="text-white text-sm">{request.admin_notes}</p>
                        </div>
                      )}
                      
                      {request.status === 'pending' && (
                        <div className="mt-3 flex justify-end">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => cancelRequest(request.id)}
                            loading={isLoading}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {requestsPagination.hasMore && (
                    <div className="text-center pt-4">
                      <Button 
                        variant="ghost" 
                        onClick={handleLoadMoreRequests}
                        loading={isLoading}
                      >
                        Load More
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        onSubmit={createDepositRequest}
        isLoading={isLoading}
      />

      <WithdrawalModal
        isOpen={showWithdrawalModal}
        onClose={() => setShowWithdrawalModal(false)}
        onSubmit={createWithdrawalRequest}
        isLoading={isLoading}
        availableBalance={wallet?.balance || 0}
      />
    </div>
  );
}
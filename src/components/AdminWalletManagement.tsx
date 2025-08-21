import { useState, useEffect } from 'react';
import { useAdminWalletStore } from '@/stores/adminWalletStore';
import Button from '@/components/Button';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/Card';
import Input from '@/components/Input';
import Loading from '@/components/Loading';
import Modal from '@/components/Modal';
import { showToast } from '@/components/Toast';
import {
  Wallet,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Eye,
  Plus,
  Minus,
  MoreVertical,
  User,
  Calendar,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface ProcessRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: any;
  onProcess: (action: 'approve' | 'reject', notes?: string) => void;
  isLoading: boolean;
}

function ProcessRequestModal({ isOpen, onClose, request, onProcess, isLoading }: ProcessRequestModalProps) {
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [adminNotes, setAdminNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onProcess(action, adminNotes.trim() || undefined);
  };

  if (!request) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Process Wallet Request" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">User:</span>
              <p className="text-white font-medium">
                {request.wallet?.user?.firstName} {request.wallet?.user?.lastName}
                <span className="text-gray-400 ml-2">(@{request.wallet?.user?.username})</span>
              </p>
            </div>
            <div>
              <span className="text-gray-400">Type:</span>
              <p className="text-white font-medium capitalize">{request.type}</p>
            </div>
            <div>
              <span className="text-gray-400">Amount:</span>
              <p className="text-white font-medium">${request.amount.toFixed(2)}</p>
            </div>
            <div>
              <span className="text-gray-400">Requested:</span>
              <p className="text-white font-medium">
                {new Date(request.createdAt).toLocaleDateString()}
              </p>
            </div>
            {request.notes && (
              <div className="col-span-2">
                <span className="text-gray-400">User Notes:</span>
                <p className="text-white">{request.notes}</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Action
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="action"
                value="approve"
                checked={action === 'approve'}
                onChange={(e) => setAction(e.target.value as 'approve' | 'reject')}
                className="mr-2 text-green-600 focus:ring-green-500"
              />
              <span className="text-green-400">Approve</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="action"
                value="reject"
                checked={action === 'reject'}
                onChange={(e) => setAction(e.target.value as 'approve' | 'reject')}
                className="mr-2 text-red-600 focus:ring-red-500"
              />
              <span className="text-red-400">Reject</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Admin Notes (Optional)
          </label>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Add notes about this decision..."
            rows={3}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex space-x-3 justify-end pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            loading={isLoading}
            className={action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
          >
            {action === 'approve' ? 'Approve Request' : 'Reject Request'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

interface AdjustBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: any;
  onAdjust: (amount: number, description: string) => void;
  isLoading: boolean;
}

function AdjustBalanceModal({ isOpen, onClose, wallet, onAdjust, isLoading }: AdjustBalanceModalProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract'>('add');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      showToast.error('Please enter a valid amount');
      return;
    }
    if (!description.trim()) {
      showToast.error('Please provide a description');
      return;
    }
    
    const finalAmount = adjustmentType === 'subtract' ? -numAmount : numAmount;
    onAdjust(finalAmount, description.trim());
  };

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setAdjustmentType('add');
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!wallet) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adjust Wallet Balance" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="text-sm">
            <span className="text-gray-400">User:</span>
            <p className="text-white font-medium">
              {wallet.user?.firstName} {wallet.user?.lastName}
              <span className="text-gray-400 ml-2">(@{wallet.user?.username})</span>
            </p>
            <span className="text-gray-400">Current Balance:</span>
            <p className="text-white font-medium text-lg">${wallet.balance.toFixed(2)}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Adjustment Type
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="adjustmentType"
                value="add"
                checked={adjustmentType === 'add'}
                onChange={(e) => setAdjustmentType(e.target.value as 'add' | 'subtract')}
                className="mr-2 text-green-600 focus:ring-green-500"
              />
              <Plus className="w-4 h-4 mr-1 text-green-400" />
              <span className="text-green-400">Add Funds</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="adjustmentType"
                value="subtract"
                checked={adjustmentType === 'subtract'}
                onChange={(e) => setAdjustmentType(e.target.value as 'add' | 'subtract')}
                className="mr-2 text-red-600 focus:ring-red-500"
              />
              <Minus className="w-4 h-4 mr-1 text-red-400" />
              <span className="text-red-400">Subtract Funds</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Amount *
          </label>
          <Input
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="bg-gray-700 border-gray-600 text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Reason for balance adjustment..."
            rows={3}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="flex space-x-3 justify-end pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            loading={isLoading}
            className={adjustmentType === 'add' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
          >
            {adjustmentType === 'add' ? 'Add Funds' : 'Subtract Funds'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function AdminWalletManagement() {
  const {
    requests,
    wallets,
    transactions,
    selectedWallet,
    isLoading,
    isProcessing,
    error,
    requestsPagination,
    walletsPagination,
    transactionsPagination,
    requestsFilter,
    fetchRequests,
    fetchWallets,
    fetchTransactions,
    fetchWalletByUserId,
    processRequest,
    adjustBalance,
    setRequestsFilter,
    clearError,
  } = useAdminWalletStore();

  const [activeSection, setActiveSection] = useState<'requests' | 'wallets' | 'transactions'>('requests');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [userIdSearch, setUserIdSearch] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    if (error) {
      showToast.error(error);
      clearError();
    }
  }, [error]);

  const handleProcessRequest = async (action: 'approve' | 'reject', notes?: string) => {
    if (!selectedRequest) return;
    
    try {
      await processRequest(selectedRequest.id, action, notes);
      setShowProcessModal(false);
      setSelectedRequest(null);
      showToast.success(`Request ${action}d successfully`);
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleAdjustBalance = async (amount: number, description: string) => {
    if (!selectedWallet) return;
    
    try {
      await adjustBalance(selectedWallet.userId, amount, description);
      setShowAdjustModal(false);
      showToast.success('Balance adjusted successfully');
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleSearchWallet = async () => {
    if (!userIdSearch.trim()) {
      showToast.error('Please enter a user ID');
      return;
    }
    
    try {
      await fetchWalletByUserId(userIdSearch.trim());
      setActiveSection('wallets');
    } catch (error) {
      // Error is handled by the store
    }
  };

  const loadMoreRequests = () => {
    if (requestsPagination.hasMore && !isLoading) {
      fetchRequests(requestsPagination.page + 1);
    }
  };

  const loadMoreWallets = () => {
    if (walletsPagination.hasMore && !isLoading) {
      fetchWallets(walletsPagination.page + 1);
    }
  };

  const loadMoreTransactions = () => {
    if (transactionsPagination.hasMore && !isLoading) {
      fetchTransactions(selectedWallet?.id, transactionsPagination.page + 1);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-400 bg-yellow-900';
      case 'approved':
        return 'text-green-400 bg-green-900';
      case 'rejected':
        return 'text-red-400 bg-red-900';
      default:
        return 'text-gray-400 bg-gray-700';
    }
  };

  const filteredRequests = requests.filter(request => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      request.wallet?.user?.username?.toLowerCase().includes(searchLower) ||
      request.wallet?.user?.firstName?.toLowerCase().includes(searchLower) ||
      request.wallet?.user?.lastName?.toLowerCase().includes(searchLower) ||
      request.id.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Wallet Management</h2>
          <p className="text-gray-400">Manage user wallets, requests, and transactions</p>
        </div>
        <Button onClick={() => fetchRequests(1, true)} className="bg-blue-600 hover:bg-blue-700">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-900 rounded-lg mr-4">
                <Clock className="w-6 h-6 text-yellow-300" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Pending Requests</p>
                <p className="text-2xl font-bold text-white">
                  {requests.filter(r => r.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-900 rounded-lg mr-4">
                <TrendingUp className="w-6 h-6 text-green-300" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Deposits</p>
                <p className="text-2xl font-bold text-white">
                  {requests.filter(r => r.type === 'deposit' && r.status === 'approved').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-900 rounded-lg mr-4">
                <TrendingDown className="w-6 h-6 text-red-300" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Withdrawals</p>
                <p className="text-2xl font-bold text-white">
                  {requests.filter(r => r.type === 'withdrawal' && r.status === 'approved').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-900 rounded-lg mr-4">
                <Wallet className="w-6 h-6 text-blue-300" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Active Wallets</p>
                <p className="text-2xl font-bold text-white">{wallets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section Navigation */}
      <div className="border-b border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveSection('requests')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeSection === 'requests'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
            }`}
          >
            Wallet Requests
          </button>
          <button
            onClick={() => {
              setActiveSection('wallets');
              if (wallets.length === 0) fetchWallets();
            }}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeSection === 'wallets'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
            }`}
          >
            User Wallets
          </button>
          <button
            onClick={() => {
              setActiveSection('transactions');
              if (transactions.length === 0) fetchTransactions();
            }}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeSection === 'transactions'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
            }`}
          >
            All Transactions
          </button>
        </nav>
      </div>

      {/* Wallet Requests Section */}
      {activeSection === 'requests' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Wallet Requests</CardTitle>
              <div className="flex space-x-4">
                {/* Filters */}
                <select
                  value={requestsFilter.status}
                  onChange={(e) => setRequestsFilter({ status: e.target.value as any })}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <select
                  value={requestsFilter.type}
                  onChange={(e) => setRequestsFilter({ type: e.target.value as any })}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="deposit">Deposits</option>
                  <option value="withdrawal">Withdrawals</option>
                </select>
              </div>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by user or request ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </CardHeader>
          
          <CardContent>
            {isLoading && requests.length === 0 ? (
              <div className="flex justify-center py-8">
                <Loading />
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-8">
                <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No wallet requests found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <div key={request.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(request.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {request.status.toUpperCase()}
                          </span>
                        </div>
                        
                        <div>
                          <p className="text-white font-medium">
                            {request.wallet?.user?.firstName} {request.wallet?.user?.lastName}
                            <span className="text-gray-400 ml-2">(@{request.wallet?.user?.username})</span>
                          </p>
                          <p className="text-sm text-gray-400">
                            {request.type.charAt(0).toUpperCase() + request.type.slice(1)} • 
                            ${request.amount.toFixed(2)} • 
                            {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {request.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowProcessModal(true);
                            }}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Process
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // TODO: Show request details modal
                            console.log('View request details:', request);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {request.notes && (
                      <div className="mt-3 pt-3 border-t border-gray-600">
                        <p className="text-sm text-gray-300">
                          <span className="text-gray-400">User Notes:</span> {request.notes}
                        </p>
                      </div>
                    )}
                    
                    {request.adminNotes && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-300">
                          <span className="text-gray-400">Admin Notes:</span> {request.adminNotes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
                
                {requestsPagination.hasMore && (
                  <div className="text-center pt-4">
                    <Button
                      onClick={loadMoreRequests}
                      loading={isLoading}
                      variant="ghost"
                    >
                      Load More Requests
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* User Wallets Section */}
      {activeSection === 'wallets' && (
        <div className="space-y-6">
          {/* Search for specific user wallet */}
          <Card>
            <CardHeader>
              <CardTitle>Search User Wallet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Input
                    placeholder="Enter user ID or username..."
                    value={userIdSearch}
                    onChange={(e) => setUserIdSearch(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <Button onClick={handleSearchWallet} className="bg-blue-600 hover:bg-blue-700">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Selected Wallet Details */}
          {selectedWallet && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Wallet Details</CardTitle>
                  <Button
                    onClick={() => setShowAdjustModal(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Adjust Balance
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">User Information</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-gray-400">Name:</span> <span className="text-white">{selectedWallet.user?.firstName} {selectedWallet.user?.lastName}</span></p>
                        <p><span className="text-gray-400">Username:</span> <span className="text-white">@{selectedWallet.user?.username}</span></p>
                        <p><span className="text-gray-400">Email:</span> <span className="text-white">{selectedWallet.user?.email}</span></p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">Wallet Information</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-gray-400">Wallet ID:</span> <span className="text-white font-mono">{selectedWallet.walletId}</span></p>
                        <p><span className="text-gray-400">Balance:</span> <span className="text-white text-lg font-bold">${selectedWallet.balance.toFixed(2)}</span></p>
                        <p><span className="text-gray-400">Created:</span> <span className="text-white">{new Date(selectedWallet.createdAt).toLocaleDateString()}</span></p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button
                    onClick={() => {
                      fetchTransactions(selectedWallet.userId, 1, true);
                      setActiveSection('transactions');
                    }}
                    variant="ghost"
                    className="w-full"
                  >
                    View Transaction History
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* All Transactions Section */}
      {activeSection === 'transactions' && (
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && transactions.length === 0 ? (
              <div className="flex justify-center py-8">
                <Loading />
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No transactions found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${
                          transaction.type === 'deposit' ? 'bg-green-900' :
                          transaction.type === 'withdrawal' ? 'bg-red-900' : 'bg-blue-900'
                        }`}>
                          {transaction.type === 'deposit' ? (
                            <TrendingUp className="w-5 h-5 text-green-300" />
                          ) : transaction.type === 'withdrawal' ? (
                            <TrendingDown className="w-5 h-5 text-red-300" />
                          ) : (
                            <DollarSign className="w-5 h-5 text-blue-300" />
                          )}
                        </div>
                        
                        <div>
                          <p className="text-white font-medium">
                            {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                          </p>
                          <p className="text-sm text-gray-400">
                            {transaction.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {transaction.amount > 0 ? '+' : ''}${transaction.amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-400">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                        {transaction.admin && (
                          <p className="text-xs text-gray-500">
                            by @{transaction.admin.username}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {transactionsPagination.hasMore && (
                  <div className="text-center pt-4">
                    <Button
                      onClick={loadMoreTransactions}
                      loading={isLoading}
                      variant="ghost"
                    >
                      Load More Transactions
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Process Request Modal */}
      <ProcessRequestModal
        isOpen={showProcessModal}
        onClose={() => {
          setShowProcessModal(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
        onProcess={handleProcessRequest}
        isLoading={isProcessing}
      />

      {/* Adjust Balance Modal */}
      <AdjustBalanceModal
        isOpen={showAdjustModal}
        onClose={() => setShowAdjustModal(false)}
        wallet={selectedWallet}
        onAdjust={handleAdjustBalance}
        isLoading={isProcessing}
      />
    </div>
  );
}
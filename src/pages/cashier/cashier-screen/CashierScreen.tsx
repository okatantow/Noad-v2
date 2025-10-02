import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Camera, Upload, Download, TrendingUp, Calendar } from "lucide-react";
import { api } from "../../../services/api";
import { toggleToaster } from "../../../provider/features/helperSlice";
import { useDispatch } from "react-redux";
import { withPermissions } from '../../../hooks/withPermissions';
import { useAuth } from '../../../provider/contexts/AuthContext';

// Types
type AccountType = {
  id: number;
  account_number: string;
  customer_id: number;
  coa_id: number;
  balance: number;
  available_balance: number;
  overdraft_limit: number;
  type: 'current' | 'susu' | 'loan' | 'fixed_deposit';
  coa_name?: string;
  customer_name?: string;
};

type TransactionType = {
  id: number;
  ledger_id: number;
  date: string;
  description: string;
  debit: number;
  credit: number;
  reference: string;
  type: 'deposit' | 'withdrawal';
  balance_after: number;
};

type ActivityData = {
  date: string;
  deposits: number;
  withdrawals: number;
};

type SearchResult = {
  id: number;
  account_number: string;
  customer_name: string;
  type: string;
  coa_name: string;
};

type FormData = {
  method: 'cash' | 'cheque';
  amount: number;
  reference: string;
};

// API Service functions
const accountService = {
  searchAccounts: async (query: string): Promise<SearchResult[]> => {
    const response = await api.get(`/accounts/search?q=${query}`);
    return response.data.data || [];
  },

  getAccountDetails: async (accountNumber: string): Promise<AccountType> => {
    const response = await api.get(`/accounts/${accountNumber}`);
    return response.data.data;
  },

  getAccountTransactions: async (accountId: number): Promise<TransactionType[]> => {
    const response = await api.get(`/transactions/account/${accountId}`);
    return response.data.data || [];
  },

  getAccountActivity: async (accountId: number, period: string): Promise<ActivityData[]> => {
    const response = await api.get(`/accounts/${accountId}/activity?period=${period}`);
    return response.data.data || [];
  },

  processDeposit: async (data: {
    account_id: number;
    amount: number;
    method: string;
    reference: string;
    user_id: string;
  }) => {
    const response = await api.post('/transactions/deposit', data);
    return response.data;
  },

  processWithdrawal: async (data: {
    account_id: number;
    amount: number;
    method: string;
    reference: string;
    user_id: string;
  }) => {
    const response = await api.post('/transactions/withdrawal', data);
    return response.data;
  }
};

// Main Cashier Component
const CashierScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdrawal' | 'history' | 'activity'>('deposit');
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [account, setAccount] = useState<AccountType | null>(null);
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [previewTab, setPreviewTab] = useState<'picture' | 'signature'>('picture');
  
  const dispatch = useDispatch();
  const { user } = useAuth();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      method: 'cash',
      amount: 0,
      reference: ''
    }
  });

  // Search functions
  const handleAccountSearch = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      await searchAccounts(searchQuery.trim());
    }
  };

  const searchAccounts = async (query: string) => {
    setSearchLoading(true);
    try {
      const results = await accountService.searchAccounts(query);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching accounts", error);
      dispatch(toggleToaster({
        isOpen: true,
        toasterData: { type: "error", msg: "Failed to search accounts" },
      }));
    } finally {
      setSearchLoading(false);
    }
  };

  const handleNameSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length >= 2) { // Only search when query has 2+ characters
        setSearchLoading(true);
        try {
            const results = await accountService.searchAccounts(query);
            setSearchResults(results);
        } catch (error) {
            console.error("Error searching customers", error);
            // Optional: Add user feedback here (e.g., a toast notification)
        } finally {
            setSearchLoading(false);
        }
    } else {
        setSearchResults([]); // Clear results if query is too short
    }
};

  const selectAccount = async (accountResult: SearchResult) => {
    setLoading(true);
    try {
      const accountDetails = await accountService.getAccountDetails(accountResult.account_number);
      setAccount(accountDetails);
      
      // Load transactions and activity data
      const [transactionsRes, activityRes] = await Promise.all([
        accountService.getAccountTransactions(accountDetails.id),
        accountService.getAccountActivity(accountDetails.id, '30d')
      ]);
      
      setTransactions(transactionsRes);
      setActivityData(activityRes);
      setSearchModalOpen(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error("Error loading account details", error);
      dispatch(toggleToaster({
        isOpen: true,
        toasterData: { type: "error", msg: "Failed to load account details" },
      }));
    } finally {
      setLoading(false);
    }
  };

  // Transaction handlers
  const onSubmitDeposit = async (data: FormData) => {
    if (!account) return;
    
    setProcessing(true);
    try {
      await accountService.processDeposit({
        account_id: account.id,
        amount: data.amount,
        method: data.method,
        reference: data.reference,
        user_id: user?.id || 'system'
      });
      
      dispatch(toggleToaster({
        isOpen: true,
        toasterData: { type: "success", msg: "Deposit processed successfully" },
      }));
      
      // Refresh account data
      const updatedAccount = await accountService.getAccountDetails(account.account_number);
      setAccount(updatedAccount);
      reset();
    } catch (error: any) {
      console.error("Error processing deposit", error);
      dispatch(toggleToaster({
        isOpen: true,
        toasterData: { 
          type: "error", 
          msg: error.response?.data?.message || "Failed to process deposit" 
        },
      }));
    } finally {
      setProcessing(false);
    }
  };

  const onSubmitWithdrawal = async (data: FormData) => {
    if (!account) return;
    
    setProcessing(true);
    try {
      await accountService.processWithdrawal({
        account_id: account.id,
        amount: data.amount,
        method: data.method,
        reference: data.reference,
        user_id: user?.id || 'system'
      });
      
      dispatch(toggleToaster({
        isOpen: true,
        toasterData: { type: "success", msg: "Withdrawal processed successfully" },
      }));
      
      // Refresh account data
      const updatedAccount = await accountService.getAccountDetails(account.account_number);
      setAccount(updatedAccount);
      reset();
    } catch (error: any) {
      console.error("Error processing withdrawal", error);
      dispatch(toggleToaster({
        isOpen: true,
        toasterData: { 
          type: "error", 
          msg: error.response?.data?.message || "Failed to process withdrawal" 
        },
      }));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-white p-4"
    >
      {/* Section 1: Account Search and Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left Column - Account Search and Info */}
        <div className="bg-white   p-6">
          {/* Account Search */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Account
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleAccountSearch}
                placeholder="Enter account number, name, or type..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={() => setSearchModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Search
              </button>
            </div>
          </div>

          {/* Account Information */}
          {account ? (
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-900">{account.customer_name}</h3>
                <p className="text-sm text-gray-600">{account.coa_name} • {account.account_number}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Balance</p>
                  <p className="text-xl font-semibold text-gray-900">
                    GHS {account.balance}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-600">Available</p>
                  <p className="text-xl font-semibold text-green-900">
                    GHS {account.available_balance}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Search for an account to view details</p>
            </div>
          )}
        </div>

        {/* Right Column - Picture and Signature Tabs */}
        <div className="bg-white  border border-gray-200 p-6">
          <div className="flex bg-blue-50 border-b border-gray-200 mb-4">
            <a
              onClick={() => setPreviewTab('picture')}
              className={`flex-1 py-2 px-3 text-center font-medium text-sm cursor-pointer ${
                previewTab === 'picture'
                 ? 'bg-white text-blue-600 font-semibold'
                    : 'text-blue-800 hover:text-gray-800'
              }`}
            >
              Picture
            </a>
            <a
              onClick={() => setPreviewTab('signature')}
              className={`flex-1 py-2 px-3 text-center font-medium text-sm cursor-pointer ${
                previewTab === 'signature'
                  ? 'bg-white text-blue-600 font-semibold'
                    : 'text-blue-800 hover:text-gray-800'
              }`}
            >
              Signature
            </a>
          </div>

          <div className="flex items-center justify-center min-h-[200px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            {account ? (
              previewTab === 'picture' ? (
                <div className="text-center p-4">
                  <Camera className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm text-gray-500">Customer Picture</p>
                  <p className="text-xs text-gray-400 mt-1">Preview would appear here</p>
                </div>
              ) : (
                <div className="text-center p-4">
                  <Upload className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm text-gray-500">Customer Signature</p>
                  <p className="text-xs text-gray-400 mt-1">Preview would appear here</p>
                </div>
              )
            ) : (
              <div className="text-center p-4">
                <p className="text-sm text-gray-500">Select an account to view</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: Transaction Tabs */}
      {account && (
        <div className="bg-white  border border-gray-200">
          {/* Tab Headers */}
          <div className="border-b border-gray-200">
            <div className="flex uppercase">
              <a
                onClick={() => setActiveTab('deposit')}
                className={`flex-1 py-4 px-6 text-center font-medium text-sm cursor-pointer ${
                  activeTab === 'deposit'
                    ? 'border-b-2 border-green-500 text-green-600 '
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Deposit
              </a>
              <a
                onClick={() => setActiveTab('withdrawal')}
                className={`flex-1 py-4 px-6 text-center font-medium text-sm cursor-pointer ${
                  activeTab === 'withdrawal'
                    ? 'border-b-2 border-red-500 text-red-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Withdrawal
              </a>
              <a
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-4 px-6 text-center font-medium text-sm  cursor-pointer ${
                  activeTab === 'history'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                History
              </a>
              <a
                onClick={() => setActiveTab('activity')}
                className={`flex-1 py-4 px-6 text-center font-medium text-sm cursor-pointer ${
                  activeTab === 'activity'
                    ? 'border-b-2 border-purple-500 text-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Activity
              </a>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Deposit Tab */}
            {activeTab === 'deposit' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-green-50 rounded-lg p-6"
              >
                <h3 className="text-lg font-semibold text-green-900 mb-4">Make Deposit</h3>
                <form onSubmit={handleSubmit(onSubmitDeposit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-1">
                      Method
                    </label>
                    <select
                      {...register("method")}
                      className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                    >
                      <option value="cash">Cash</option>
                      <option value="cheque">Cheque</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-1">
                      Amount (GHS)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("amount", { 
                        required: "Amount is required",
                        min: { value: 0.01, message: "Amount must be greater than 0" }
                      })}
                      className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    {errors.amount && (
                      <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-1">
                      Reference
                    </label>
                    <input
                      type="text"
                      {...register("reference", { required: "Reference is required" })}
                      className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter reference"
                    />
                    {errors.reference && (
                      <p className="mt-1 text-sm text-red-600">{errors.reference.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {processing ? 'Processing...' : 'Process Deposit'}
                  </button>
                </form>
              </motion.div>
            )}

            {/* Withdrawal Tab */}
            {activeTab === 'withdrawal' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-50 rounded-lg p-6"
              >
                <h3 className="text-lg font-semibold text-red-900 mb-4">Make Withdrawal</h3>
                <form onSubmit={handleSubmit(onSubmitWithdrawal)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-red-700 mb-1">
                      Method
                    </label>
                    <select
                      {...register("method")}
                      className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                    >
                      <option value="cash">Cash</option>
                      <option value="cheque">Cheque</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-red-700 mb-1">
                      Amount (GHS)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("amount", { 
                        required: "Amount is required",
                        min: { value: 0.01, message: "Amount must be greater than 0" },
                        max: { 
                          value: account.available_balance, 
                          message: "Amount exceeds available balance" 
                        }
                      })}
                      className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                    {errors.amount && (
                      <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-red-700 mb-1">
                      Reference
                    </label>
                    <input
                      type="text"
                      {...register("reference", { required: "Reference is required" })}
                      className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Enter reference"
                    />
                    {errors.reference && (
                      <p className="mt-1 text-sm text-red-600">{errors.reference.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {processing ? 'Processing...' : 'Process Withdrawal'}
                  </button>
                </form>
              </motion.div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h3>
                <div className="overflow-hidden border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Reference
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Debit
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Credit
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Balance
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(transaction.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {transaction.description}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {transaction.reference}
                          </td>
                          <td className="px-6 py-4 text-sm text-red-600 text-right">
                            {transaction.debit > 0 ? `GHS ${transaction.debit}` : '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-green-600 text-right">
                            {transaction.credit > 0 ? `GHS ${transaction.credit}` : '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 text-right">
                            GHS {transaction.balance_after}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-gray-900">Account Activity</h3>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-medium text-gray-900">Deposit vs Withdrawal</h4>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <select className="text-sm border border-gray-300 rounded px-2 py-1">
                        <option>Last 30 days</option>
                        <option>Last 90 days</option>
                        <option>Last year</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Simple bar chart representation */}
                  <div className="space-y-3">
                    {activityData.map((data, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 w-20">
                          {new Date(data.date).toLocaleDateString()}
                        </span>
                        <div className="flex-1 flex items-center gap-2">
                          <div 
                            className="h-6 bg-green-200 rounded-l"
                            style={{ width: `${(data.deposits / (data.deposits + data.withdrawals)) * 100}%` }}
                          />
                          <div 
                            className="h-6 bg-red-200 rounded-r"
                            style={{ width: `${(data.withdrawals / (data.deposits + data.withdrawals)) * 100}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 w-32 text-right">
                          D: GHS {data.deposits} | W: GHS {data.withdrawals}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {activityData.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <TrendingUp className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No activity data available</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Search Modal */}
      <AnimatePresence>
        {searchModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 pt-20">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Search Accounts</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Search by account number, customer name, or account type
                </p>
              </div>
              
              <div className="p-6">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleNameSearch(e.target.value);
                  }}
                  placeholder="Start typing to search..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                
                <div className="mt-4 max-h-64 overflow-y-auto">
                  {searchLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="space-y-2">
                      {searchResults.map((result) => (
                        <div
                          key={result.id}
                          onClick={() => selectAccount(result)}
                          className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900">{result.customer_name}</h4>
                              <p className="text-sm text-gray-600">{result.account_number}</p>
                            </div>
                            <div className="text-right">
                              <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                {result.type}
                              </span>
                              <p className="text-sm text-gray-600 mt-1">{result.coa_name}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : searchQuery.length >= 2 ? (
                    <div className="text-center py-4 text-gray-500">
                      No accounts found
                    </div>
                  ) : null}
                </div>
              </div>
              
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setSearchModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default withPermissions(CashierScreen, ['Process Deposit', 'Process Withdrawal', 'View Accounts']);
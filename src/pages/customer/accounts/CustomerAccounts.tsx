import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Edit, Trash2, RefreshCw, Search } from "lucide-react";
import { toggleToaster } from "../../../provider/features/helperSlice";
import { useDispatch } from "react-redux";
import { withPermissions } from '../../../hooks/withPermissions';
import { 
  getCustomerAccounts, 
  getActiveChartOfAccounts, 
  createAccount, 
  updateAccount, 
  deleteAccount,
  generateAccountNumber,
  type AccountType,
  type ChartOfAccount 
} from '../../../services/accountService';

type CustomerAccountsProps = {
  customerId: number;
  customerName: string;
  customerNumber: string;
  setCurrentPage?: React.Dispatch<React.SetStateAction<string>>;
  embedded?: boolean;
};

type FormData = {
  account_number: string;
  coa_id: string;
  type: 'current' | 'susu' | 'loan' | 'fixed_deposit';
  balance: number;
  overdraft_limit: number;
};

const CustomerAccounts: React.FC<CustomerAccountsProps> = ({ 
  customerId, 
  customerName, 
  customerNumber,
  setCurrentPage,
  embedded = false
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [accounts, setAccounts] = useState<AccountType[]>([]);
  const [chartOfAccounts, setChartOfAccounts] = useState<ChartOfAccount[]>([]);
  const [filteredChartOfAccounts, setFilteredChartOfAccounts] = useState<ChartOfAccount[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountType | null>(null);
  const [generatingAccountNumber, setGeneratingAccountNumber] = useState(false);
  const [coaSearchQuery, setCoaSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const dispatch = useDispatch();

  // React Hook Form initialization
  const { 
    register, 
    handleSubmit, 
    setValue, 
    watch, 
    reset, 
    formState: { errors } 
  } = useForm<FormData>({
    defaultValues: {
      account_number: '',
      coa_id: '',
      type: 'current',
      balance: 0,
      overdraft_limit: 0
    }
  });

  // Watch form values
  const watchType = watch('type');
  const watchCoaId = watch('coa_id');

  useEffect(() => {
    console.log('CustomerAccounts mounted with:', { customerId, customerName, customerNumber, embedded });
    
    if (customerId && customerId > 0) {
      fetchData();
    } else {
      console.warn('Invalid customerId, skipping fetch');
      setLoading(false);
      setError('Invalid customer ID');
    }
  }, [customerId]);

  useEffect(() => {
    filterChartOfAccounts();
  }, [coaSearchQuery, chartOfAccounts]);

  const fetchData = async () => {
    console.log('fetchData started for customerId:', customerId);
    
    if (!customerId || customerId <= 0) {
      console.error('Invalid customerId in fetchData:', customerId);
      setLoading(false);
      setError('Invalid customer ID');
      return;
    }

    const timeoutId = setTimeout(() => {
      console.warn('fetchData timeout - forcing loading to false');
      setLoading(false);
      setError('Request timeout - please try again');
    }, 15000);

    try {
      setLoading(true);
      setError(null);
      console.log('Making API calls...');

      const [accountsResult, coaResult] = await Promise.allSettled([
        getCustomerAccounts(customerId),
        getActiveChartOfAccounts()
      ]);

      console.log('API results:', { accountsResult, coaResult });

      if (accountsResult.status === 'fulfilled') {
        const accountsData = accountsResult.value.data.data || [];
        console.log('Accounts data:', accountsData);
        setAccounts(accountsData);
      } else {
        console.error('Failed to fetch accounts:', accountsResult.reason);
        setError('Failed to load accounts');
      }

      if (coaResult.status === 'fulfilled') {
        const coaData = coaResult.value.data.data || [];
        console.log('Chart of accounts data:', coaData);
        setChartOfAccounts(coaData);
        setFilteredChartOfAccounts(coaData);
      } else {
        console.error('Failed to fetch chart of accounts:', coaResult.reason);
      }

    } catch (error) {
      console.error("Unexpected error in fetchData:", error);
      setError('An unexpected error occurred');
      dispatch(toggleToaster({
        isOpen: true,
        toasterData: { type: "error", msg: "Failed to load data" },
      }));
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
      console.log('fetchData completed, loading set to false');
    }
  };

  const filterChartOfAccounts = () => {
    if (!coaSearchQuery) {
      setFilteredChartOfAccounts(chartOfAccounts);
      return;
    }

    const filtered = chartOfAccounts.filter(coa =>
      coa.name.toLowerCase().includes(coaSearchQuery.toLowerCase()) ||
      coa.code.toLowerCase().includes(coaSearchQuery.toLowerCase()) ||
      coa.type.toLowerCase().includes(coaSearchQuery.toLowerCase())
    );
    setFilteredChartOfAccounts(filtered);
  };

  const handleGenerateAccountNumber = async () => {
    setGeneratingAccountNumber(true);
    try {
      const response = await generateAccountNumber(watchType, customerId);
      setValue('account_number', response.data.accountNumber);
    } catch (error) {
      console.error("Error generating account number", error);
      const fallbackNumber = `ACC${Date.now().toString().slice(-8)}`;
      setValue('account_number', fallbackNumber);
    } finally {
      setGeneratingAccountNumber(false);
    }
  };

  const resetForm = () => {
    reset({
      account_number: '',
      coa_id: '',
      type: 'current',
      balance: 0,
      overdraft_limit: 0
    });
    setCoaSearchQuery('');
  };

  const handleAddAccount = async (data: FormData) => {
    setSaving(true);

    try {
      await createAccount({
        ...data,
        customer_id: customerId,
        coa_id: parseInt(data.coa_id),
        balance: parseFloat(data.balance.toString()),
        overdraft_limit: parseFloat(data.overdraft_limit.toString())
      });

      dispatch(toggleToaster({
        isOpen: true,
        toasterData: { type: "success", msg: "Account created successfully" },
      }));

      setShowAddModal(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error("Error creating account", error);
      const errorMsg = error.response?.data?.message || "Failed to create account";
      dispatch(toggleToaster({
        isOpen: true,
        toasterData: { type: "error", msg: errorMsg },
      }));
    } finally {
      setSaving(false);
    }
  };

  const handleEditAccount = async (data: FormData) => {
    if (!selectedAccount) return;
    setSaving(true);

    try {
      await updateAccount(selectedAccount.id!, {
        ...data,
        coa_id: parseInt(data.coa_id),
        balance: parseFloat(data.balance.toString()),
        overdraft_limit: parseFloat(data.overdraft_limit.toString())
      });

      dispatch(toggleToaster({
        isOpen: true,
        toasterData: { type: "success", msg: "Account updated successfully" },
      }));

      setShowEditModal(false);
      setSelectedAccount(null);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error("Error updating account", error);
      const errorMsg = error.response?.data?.message || "Failed to update account";
      dispatch(toggleToaster({
        isOpen: true,
        toasterData: { type: "error", msg: errorMsg },
      }));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async (accountId: number) => {
    if (!confirm("Are you sure you want to delete this account?")) return;

    try {
      await deleteAccount(accountId);
      
      dispatch(toggleToaster({
        isOpen: true,
        toasterData: { type: "success", msg: "Account deleted successfully" },
      }));

      fetchData();
    } catch (error: any) {
      console.error("Error deleting account", error);
      const errorMsg = error.response?.data?.message || "Failed to delete account";
      dispatch(toggleToaster({
        isOpen: true,
        toasterData: { type: "error", msg: errorMsg },
      }));
    }
  };

  const openEditModal = (account: AccountType) => {
    setSelectedAccount(account);
    setValue('account_number', account.account_number);
    setValue('coa_id', account.coa_id.toString());
    setValue('type', account.type);
    setValue('balance', account.balance);
    setValue('overdraft_limit', account.overdraft_limit);
    
    const selectedCoa = chartOfAccounts.find(coa => coa.id === account.coa_id);
    if (selectedCoa) {
      setCoaSearchQuery(`${selectedCoa.code} - ${selectedCoa.name}`);
    }
    
    setShowEditModal(true);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const getCoaDisplayText = (coa: ChartOfAccount) => {
    return `${coa.code} - ${coa.name} (${coa.type})`;
  };

  const retryFetchData = () => {
    setError(null);
    fetchData();
  };

  // Show error state
  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Accounts</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={retryFetchData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading accounts...</p>
        <p className="text-sm text-gray-500 mt-2">Customer: {customerName}</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={embedded ? { opacity: 0 } : { opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.3 }}
      className={embedded ? "" : "text-sm"}
    >
      {/* Header - Only show in standalone mode */}
      {!embedded && (
        <div className="bg-white p-4 border border-gray-200 mb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <button
                onClick={() => setCurrentPage?.("list")}
                className="p-2 hover:bg-gray-100 transition-colors"
                title="Back to customers"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Customer Accounts</h1>
                <p className="text-sm text-gray-600">
                  {customerName} ({customerNumber})
                </p>
              </div>
            </div>
            <a
              onClick={openAddModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Account
            </a>
          </div>
        </div>
      )}

      {/* Embedded Mode Header */}
      {embedded && (
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Customer Accounts</h3>
            <p className="text-sm text-gray-600">
              Manage accounts for {customerName} ({customerNumber})
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 text-sm"
          >
            <Plus className="h-4 w-4" />
            Add Account
          </button>
        </div>
      )}

      {/* Accounts Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account Number</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chart of Account</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Overdraft Limit</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {accounts.map((account) => (
                <tr key={account.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{account.account_number}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 capitalize">{account.type}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {account.coa_name} ({account.coa_code})
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{account.balance}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{account.overdraft_limit}</td>
                  <td className="px-4 py-3 text-sm font-medium">
                    <button 
                      onClick={() => openEditModal(account)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit className="h-4 w-4 inline" />
                    </button>
                    <button 
                      onClick={() => handleDeleteAccount(account.id!)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
              {accounts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <p>No accounts found for this customer.</p>
                      <p className="mt-1">Click "Add Account" to create the first account.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Add New Account</h3>
            </div>
            
            <div  className="p-4 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Type *</label>
                <select
                  {...register("type", { required: "Account type is required" })}
                  className={`w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                    errors.type ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="current">Current Account</option>
                  <option value="susu">Susu Account</option>
                  <option value="loan">Loan Account</option>
                  <option value="fixed_deposit">Fixed Deposit</option>
                </select>
                {errors.type && (
                  <p className="mt-1 text-xs text-red-600">{errors.type.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chart of Account *</label>
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      value={coaSearchQuery}
                      onChange={(e) => setCoaSearchQuery(e.target.value)}
                      placeholder="Search chart of accounts..."
                      className="w-full pl-10 p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <select
                    {...register("coa_id", { required: "Chart of account is required" })}
                    className={`w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                      errors.coa_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                    size={5}
                  >
                    <option value="">Select Chart of Account</option>
                    {filteredChartOfAccounts.map((coa) => (
                      <option key={coa.id} value={coa.id} title={coa.description || ''}>
                        {getCoaDisplayText(coa)}
                      </option>
                    ))}
                  </select>
                  {errors.coa_id && (
                    <p className="mt-1 text-xs text-red-600">{errors.coa_id.message}</p>
                  )}
                  
                  {filteredChartOfAccounts.length === 0 && coaSearchQuery && (
                    <p className="text-xs text-gray-500">No chart of accounts found matching your search.</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    {...register("account_number", { 
                      required: "Account number is required",
                      minLength: {
                        value: 3,
                        message: "Account number must be at least 3 characters"
                      }
                    })}
                    className={`flex-1 p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                      errors.account_number ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Account number"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateAccountNumber}
                    disabled={generatingAccountNumber}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    title="Generate Account Number"
                  >
                    <RefreshCw className={`h-4 w-4 ${generatingAccountNumber ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                {errors.account_number && (
                  <p className="mt-1 text-xs text-red-600">{errors.account_number.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Initial Balance</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("balance", { 
                      min: {
                        value: 0,
                        message: "Balance cannot be negative"
                      }
                    })}
                    className={`w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                      errors.balance ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.balance && (
                    <p className="mt-1 text-xs text-red-600">{errors.balance.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Overdraft Limit</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("overdraft_limit", { 
                      min: {
                        value: 0,
                        message: "Overdraft limit cannot be negative"
                      }
                    })}
                    className={`w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                      errors.overdraft_limit ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.overdraft_limit && (
                    <p className="mt-1 text-xs text-red-600">{errors.overdraft_limit.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit(handleAddAccount)}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Account Modal */}
      {showEditModal && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Edit Account</h3>
            </div>
            
            <div  className="p-4 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                <select
                  {...register("type", { required: "Account type is required" })}
                  className={`w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                    errors.type ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="current">Current Account</option>
                  <option value="susu">Susu Account</option>
                  <option value="loan">Loan Account</option>
                  <option value="fixed_deposit">Fixed Deposit</option>
                </select>
                {errors.type && (
                  <p className="mt-1 text-xs text-red-600">{errors.type.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chart of Account *</label>
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      value={coaSearchQuery}
                      onChange={(e) => setCoaSearchQuery(e.target.value)}
                      placeholder="Search chart of accounts..."
                      className="w-full pl-10 p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <select
                    {...register("coa_id", { required: "Chart of account is required" })}
                    className={`w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                      errors.coa_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                    size={5}
                  >
                    <option value="">Select Chart of Account</option>
                    {filteredChartOfAccounts.map((coa) => (
                      <option key={coa.id} value={coa.id} title={coa.description || ''}>
                        {getCoaDisplayText(coa)}
                      </option>
                    ))}
                  </select>
                  {errors.coa_id && (
                    <p className="mt-1 text-xs text-red-600">{errors.coa_id.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                <input
                  type="text"
                  {...register("account_number", { 
                    required: "Account number is required",
                    minLength: {
                      value: 3,
                      message: "Account number must be at least 3 characters"
                    }
                  })}
                  className={`w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                    errors.account_number ? 'border-red-500' : 'border-gray-300'
                  }`}
                  readOnly
                />
                {errors.account_number && (
                  <p className="mt-1 text-xs text-red-600">{errors.account_number.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Balance</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("balance", { 
                      min: {
                        value: 0,
                        message: "Balance cannot be negative"
                      }
                    })}
                    className={`w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                      errors.balance ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.balance && (
                    <p className="mt-1 text-xs text-red-600">{errors.balance.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Overdraft Limit</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("overdraft_limit", { 
                      min: {
                        value: 0,
                        message: "Overdraft limit cannot be negative"
                      }
                    })}
                    className={`w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                      errors.overdraft_limit ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.overdraft_limit && (
                    <p className="mt-1 text-xs text-red-600">{errors.overdraft_limit.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit(handleEditAccount)}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Updating...' : 'Update Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default withPermissions(CustomerAccounts, ['View Accounts', 'Add Accounts', 'Update Accounts', 'Delete Accounts']);
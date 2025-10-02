import React, { useEffect, useState } from "react";
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Edit, Trash2, RefreshCw, Search } from "lucide-react";
import { api } from "../../../services/api";
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
  setCurrentPage: React.Dispatch<React.SetStateAction<string>>;
};

const CustomerAccounts: React.FC<CustomerAccountsProps> = ({ 
  customerId, 
  customerName, 
  customerNumber,
  setCurrentPage 
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

  const dispatch = useDispatch();

  // Form state
  const [formData, setFormData] = useState({
    account_number: '',
    coa_id: '',
    type: 'current' as 'current' | 'susu' | 'loan' | 'fixed_deposit',
    balance: 0,
    overdraft_limit: 0
  });

  useEffect(() => {
    fetchData();
  }, [customerId]);

  useEffect(() => {
    filterChartOfAccounts();
  }, [coaSearchQuery, chartOfAccounts]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [accountsRes, coaRes] = await Promise.all([
        getCustomerAccounts(customerId),
        getActiveChartOfAccounts()
      ]);
      
      setAccounts(accountsRes.data.data || []);
      setChartOfAccounts(coaRes.data.data || []);
    } catch (error) {
      console.error("Error fetching data", error);
      dispatch(toggleToaster({
        isOpen: true,
        toasterData: { type: "error", msg: "Failed to load accounts" },
      }));
    } finally {
      setLoading(false);
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
      const response = await generateAccountNumber(formData.type, customerId);
      setFormData(prev => ({
        ...prev,
        account_number: response.data.accountNumber
      }));
    } catch (error) {
      console.error("Error generating account number", error);
      // Fallback: generate a simple account number
      const fallbackNumber = `ACC${Date.now().toString().slice(-8)}`;
      setFormData(prev => ({
        ...prev,
        account_number: fallbackNumber
      }));
    } finally {
      setGeneratingAccountNumber(false);
    }
  };

  const resetForm = () => {
    setFormData({
      account_number: '',
      coa_id: '',
      type: 'current',
      balance: 0,
      overdraft_limit: 0
    });
    setCoaSearchQuery('');
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await createAccount({
        ...formData,
        customer_id: customerId,
        coa_id: parseInt(formData.coa_id),
        balance: parseFloat(formData.balance.toString()),
        overdraft_limit: parseFloat(formData.overdraft_limit.toString())
      });

      dispatch(toggleToaster({
        isOpen: true,
        toasterData: { type: "success", msg: "Account created successfully" },
      }));

      setShowAddModal(false);
      resetForm();
      fetchData(); // Refresh the list
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

  const handleEditAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;

    setSaving(true);

    try {
      await updateAccount(selectedAccount.id!, {
        ...formData,
        coa_id: parseInt(formData.coa_id),
        balance: parseFloat(formData.balance.toString()),
        overdraft_limit: parseFloat(formData.overdraft_limit.toString())
      });

      dispatch(toggleToaster({
        isOpen: true,
        toasterData: { type: "success", msg: "Account updated successfully" },
      }));

      setShowEditModal(false);
      setSelectedAccount(null);
      resetForm();
      fetchData(); // Refresh the list
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

      fetchData(); // Refresh the list
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
    setFormData({
      account_number: account.account_number,
      coa_id: account.coa_id.toString(),
      type: account.type,
      balance: account.balance,
      overdraft_limit: account.overdraft_limit
    });
    
    // Find and set the COA search query for the selected account
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

  if (loading) {
    return (
      <div className="flex justify-center items-center p-5">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentPage("list")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Account
          </button>
        </div>
      </div>

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
                  <td className="px-4 py-3 text-sm text-gray-500">${account.balance.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">${account.overdraft_limit.toFixed(2)}</td>
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
                    No accounts found for this customer
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
            
            <form onSubmit={handleAddAccount} className="p-4 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="current">Current Account</option>
                  <option value="susu">Susu Account</option>
                  <option value="loan">Loan Account</option>
                  <option value="fixed_deposit">Fixed Deposit</option>
                </select>
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
                    value={formData.coa_id}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, coa_id: e.target.value }));
                      // Update search query to show selected value
                      const selectedCoa = chartOfAccounts.find(coa => coa.id === parseInt(e.target.value));
                      if (selectedCoa) {
                        setCoaSearchQuery(getCoaDisplayText(selectedCoa));
                      }
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
                    value={formData.account_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, account_number: e.target.value }))}
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Account number"
                    required
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Initial Balance</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.balance}
                    onChange={(e) => setFormData(prev => ({ ...prev, balance: parseFloat(e.target.value) || 0 }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Overdraft Limit</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.overdraft_limit}
                    onChange={(e) => setFormData(prev => ({ ...prev, overdraft_limit: parseFloat(e.target.value) || 0 }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
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
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
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
            
            <form onSubmit={handleEditAccount} className="p-4 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="current">Current Account</option>
                  <option value="susu">Susu Account</option>
                  <option value="loan">Loan Account</option>
                  <option value="fixed_deposit">Fixed Deposit</option>
                </select>
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
                    value={formData.coa_id}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, coa_id: e.target.value }));
                      // Update search query to show selected value
                      const selectedCoa = chartOfAccounts.find(coa => coa.id === parseInt(e.target.value));
                      if (selectedCoa) {
                        setCoaSearchQuery(getCoaDisplayText(selectedCoa));
                      }
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                <input
                  type="text"
                  value={formData.account_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, account_number: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                  readOnly
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Balance</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.balance}
                    onChange={(e) => setFormData(prev => ({ ...prev, balance: parseFloat(e.target.value) || 0 }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Overdraft Limit</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.overdraft_limit}
                    onChange={(e) => setFormData(prev => ({ ...prev, overdraft_limit: parseFloat(e.target.value) || 0 }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
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
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Updating...' : 'Update Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default withPermissions(CustomerAccounts, ['View Accounts', 'Add Accounts', 'Update Accounts', 'Delete Accounts']);
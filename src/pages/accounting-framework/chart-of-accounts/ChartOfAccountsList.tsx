import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2, Plus } from "lucide-react";
import { api } from "../../../services/api";
import { toggleToaster } from "../../../provider/features/helperSlice";
import { useDispatch } from "react-redux";
import "datatables.net-dt/css/dataTables.dataTables.css";
import $ from "jquery";
import "datatables.net-dt";
import swal from "sweetalert";
import { withPermissions } from '../../../hooks/withPermissions';
import { usePermissions } from '../../../hooks/usePermissions';

type ChartOfAccountType = {
  id: number;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
  parent_id: number | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  parent_name: string;
  parent_code: string;
  parent?: {
    code: string;
    name: string;
  };
};

type ChartsOfAccountsListProps = {
  setCurrentPage: React.Dispatch<React.SetStateAction<string>>;
  setSelectedAccountId: React.Dispatch<React.SetStateAction<number | undefined>>;
};

const ChartsOfAccountsList: React.FC<ChartsOfAccountsListProps> = ({ 
  setCurrentPage, 
  setSelectedAccountId 
}) => {
  const [accounts, setAccounts] = useState<ChartOfAccountType[]>([]);
  const { hasPermission } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const dispatch = useDispatch();
  const tableRef = useRef<HTMLTableElement>(null);
  const dataTableRef = useRef<any>(null);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/chart-of-accounts");
      setAccounts(res.data.data || []);
    } catch (error) {
      console.error("Error fetching chart of accounts", error);
      dispatch(
        toggleToaster({
          isOpen: true,
          toasterData: { 
            type: "error", 
            msg: "Failed to fetch chart of accounts" 
          },
        })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (tableRef.current) {
      if (dataTableRef.current) {
        dataTableRef.current.destroy();
      }
      dataTableRef.current = $(tableRef.current).DataTable();
    }
  }, [accounts]);

  const deleteRecord = async (accountId: number) => {
    setDeletingId(accountId);
    try {
      await api.delete(`/chart-of-accounts/${accountId}`);
      
      dispatch(
        toggleToaster({
          isOpen: true,
          toasterData: { 
            type: "success", 
            msg: "Account deleted successfully" 
          },
        })
      );
      
      fetchAccounts();
    } catch (error) {
      console.error("Error deleting account", error);
      
      dispatch(
        toggleToaster({
          isOpen: true,
          toasterData: { 
            type: "error", 
            msg: "Failed to delete account" 
          },
        })
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleDelete = (accountId: number) => {
    swal({
      title: "Confirm Deletion",
      text: "Once Confirmed, Account Record Will Be Deleted",
      icon: "warning",
      buttons: ["Cancel", "Confirm"],
      dangerMode: true,
    })
    .then((willDelete) => {
      if (willDelete) {
        deleteRecord(accountId);
      }
    });
  };

  const handleOpenForm = (accountId?: number) => {
    setSelectedAccountId(accountId);
    setCurrentPage("add");
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      asset: { color: "bg-green-100 text-green-800", label: "Asset" },
      liability: { color: "bg-red-100 text-red-800", label: "Liability" },
      equity: { color: "bg-blue-100 text-blue-800", label: "Equity" },
      income: { color: "bg-purple-100 text-purple-800", label: "Income" },
      expense: { color: "bg-orange-100 text-orange-800", label: "Expense" }
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || 
                  { color: "bg-gray-100 text-gray-800", label: type };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }`}>
        {isActive ? "Active" : "Inactive"}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chart of Accounts</h1>
          <p className="text-gray-600 mt-1">Manage financial accounts and their hierarchy</p>
        </div>
        {hasPermission('Add Chart Account') && (
          <a
            onClick={() => handleOpenForm()}
            className="inline-flex items-center px-4 py-2 cursor-pointer bg-green-600 text-white text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
          >
            <Plus size={18} className="mr-2" />
            Add New Account / Ledger
          </a>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 border border-gray-200">
          <div className="text-sm font-medium text-gray-500">Total Accounts</div>
          <div className="text-2xl font-bold text-gray-900">{accounts.length}</div>
        </div>
        <div className="bg-white p-4 border border-gray-200">
          <div className="text-sm font-medium text-gray-500">Assets</div>
          <div className="text-2xl font-bold text-green-600">
            {accounts.filter(account => account.type === 'asset').length}
          </div>
        </div>
        <div className="bg-white p-4 border border-gray-200">
          <div className="text-sm font-medium text-gray-500">Liabilities</div>
          <div className="text-2xl font-bold text-red-600">
            {accounts.filter(account => account.type === 'liability').length}
          </div>
        </div>
        <div className="bg-white p-4 border border-gray-200">
          <div className="text-sm font-medium text-gray-500">Income</div>
          <div className="text-2xl font-bold text-purple-600">
            {accounts.filter(account => account.type === 'income').length}
          </div>
        </div>
        <div className="bg-white p-4 border border-gray-200">
          <div className="text-sm font-medium text-gray-500">Active</div>
          <div className="text-2xl font-bold text-blue-600">
            {accounts.filter(account => account.is_active).length}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden px-1">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">Accounts List</h3>
          <p className="text-sm text-gray-600 mt-1">
            {accounts.length} account{accounts.length !== 1 ? 's' : ''} found
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table 
            ref={tableRef} 
            className="display table table-striped"
            style={{ width: "100%" }}
          >
            <thead>
              <tr>
                <th>#</th>
                <th>Account Code</th>
                <th>Account Name</th>
                <th>Type</th>
                <th>Parent Account</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account, idx) => (
                <tr key={account.id}>
                  <td>{idx + 1}</td>
                  <td className="font-medium text-gray-900">
                    {account.code}
                  </td>
                  <td className="text-gray-600">{account.name}</td>
                  <td>{getTypeBadge(account.type)}</td>
                  
                  <td className="text-gray-500 text-sm">
  {account.parent_id ? `${account.parent_code} - ${account.parent_name}` : 'None'}
</td>
                  <td>{getStatusBadge(account.is_active)}</td>
                  <td className="text-gray-500 text-sm">
                    {new Date(account.created_at).toLocaleDateString()}
                  </td>
                  <td className="flex items-start space-x-2">
                    {hasPermission('Update Chart Account') && (
                      <button
                        onClick={() => handleOpenForm(account.id)}
                        className="inline-flex items-center p-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
                        title="Edit account"
                      >
                        <Pencil size={16} />
                      </button>
                    )}
                    {hasPermission('Delete Chart Account') && (
                      <button
                        onClick={() => handleDelete(account.id)}
                        disabled={deletingId === account.id}
                        className="inline-flex items-center p-2 border border-gray-300 rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                        title="Delete account"
                      >
                        {deletingId === account.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {accounts.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="text-gray-400 mb-4">
            <Plus size={64} className="mx-auto opacity-50" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No accounts found</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Get started by creating your first chart of account. Accounts help organize your financial transactions.
          </p>
          <button
            onClick={() => handleOpenForm()}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm"
          >
            <Plus size={18} className="mr-2" />
            Create Your First Account
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default withPermissions(ChartsOfAccountsList, ['Add Chart Account','Update Chart Account','Delete Chart Account','View Chart Accounts']);
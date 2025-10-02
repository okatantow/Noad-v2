import React, { useEffect, useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { motion } from "framer-motion";
import { Printer, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "../../../services/api";
import { toggleToaster } from "../../../provider/features/helperSlice";
import { useDispatch } from "react-redux";

interface AccountWithCustomer {
  id: number;
  account_number: string;
  type: string;
  balance: number;
  overdraft_limit: number;
  created_at: string;
  account_name: string;
  account_code: string;
  customer_full_name: string;
  customer_number: string;
  branch_name: string;
}

const AccountList: React.FC = () => {
  const [accounts, setAccounts] = useState<AccountWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const dispatch = useDispatch();
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'Account List Report',
  });

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/accounts-with-customers");
      setAccounts(response.data.data || []);
    } catch (error) {
      console.error("Error fetching accounts", error);
      dispatch(
        toggleToaster({
          isOpen: true,
          toasterData: { 
            type: "error", 
            msg: "Failed to load account data" 
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

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = accounts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(accounts.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'GHS',
    }).format(amount);
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
      {/* Print Styles */}
      <style>
        {`
          @media print {
            .print-hidden {
              display: none !important;
            }
            @page {
              size: A4 landscape;
              margin: 15mm;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 12px;
            }
            th, td {
              padding: 6px 8px;
              border: 1px solid #ddd;
            }
            th {
              background-color: #f8f9fa;
              font-weight: bold;
            }
          }
        `}
      </style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Account List</h1>
          <p className="text-gray-600 mt-1">All accounts with customer information</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchAccounts}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <RefreshCw size={18} className="mr-2" />
            Refresh
          </button>
          
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Printer size={18} className="mr-2" />
            Print
          </button>
        </div>
      </div>

      {/* Printable Content */}
      <div ref={componentRef} className="bg-white rounded-lg border border-gray-200">
        {/* Report Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">ACCOUNT LIST REPORT</h2>
            <p className="text-gray-600 mt-1">
              Generated on {new Date().toLocaleDateString('en-US', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Total Accounts: {accounts.length}
            </p>
          </div>
        </div>

        {/* Account Table */}
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 border border-gray-300 text-sm text-left font-bold">Account #</th>
                <th className="p-3 border border-gray-300 text-sm text-left font-bold">Account Name</th>
                <th className="p-3 border border-gray-300 text-sm text-left font-bold">Type</th>
                <th className="p-3 border border-gray-300 text-sm text-left font-bold">Customer Name</th>
                <th className="p-3 border border-gray-300 text-sm text-left font-bold">Customer #</th>
                <th className="p-3 border border-gray-300 text-sm text-left font-bold">Branch</th>
                <th className="p-3 border border-gray-300 text-sm text-left font-bold">Balance</th>
                <th className="p-3 border border-gray-300 text-sm text-left font-bold">Overdraft Limit</th>
                <th className="p-3 border border-gray-300 text-sm text-left font-bold">Created Date</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((account) => (
                <tr key={account.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3 border border-gray-300 text-sm font-mono">{account.account_number}</td>
                  <td className="p-3 border border-gray-300 text-sm">
                    {account.account_name} ({account.account_code})
                  </td>
                  <td className="p-3 border border-gray-300 text-sm capitalize">{account.type}</td>
                  <td className="p-3 border border-gray-300 text-sm">{account.customer_full_name}</td>
                  <td className="p-3 border border-gray-300 text-sm font-mono">{account.customer_number}</td>
                  <td className="p-3 border border-gray-300 text-sm">{account.branch_name}</td>
                  <td className="p-3 border border-gray-300 text-sm text-right font-mono">
                    {formatCurrency(account.balance)}
                  </td>
                  <td className="p-3 border border-gray-300 text-sm text-right font-mono">
                    {formatCurrency(account.overdraft_limit)}
                  </td>
                  <td className="p-3 border border-gray-300 text-sm">
                    {new Date(account.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination - Hidden during print */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 print:hidden">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, accounts.length)} of {accounts.length} results
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => paginate(page)}
                    className={`inline-flex items-center px-3 py-1 border text-sm font-medium rounded-md ${
                      currentPage === page
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AccountList;
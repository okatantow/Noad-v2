import React, { useEffect, useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { motion } from "framer-motion";
import { Printer, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "../../../services/api";
import { toggleToaster } from "../../../provider/features/helperSlice";
import { useDispatch } from "react-redux";

interface CustomerWithAccounts {
  id: number;
  customer_number: string;
  first_name: string;
  last_name: string;
  other_name?: string;
  telephone_number: string;
  gender: string;
  branch_name: string;
  city: string;
  account_count: number;
}

const CustomerList: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerWithAccounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const dispatch = useDispatch();
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'Customer List Report',
  });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/customers-with-accounts");
      setCustomers(response.data.data || []);
    } catch (error) {
      console.error("Error fetching customers", error);
      dispatch(
        toggleToaster({
          isOpen: true,
          toasterData: { 
            type: "error", 
            msg: "Failed to load customer data" 
          },
        })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = customers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(customers.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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
          <h1 className="text-2xl font-bold text-gray-900">Customer List</h1>
          <p className="text-gray-600 mt-1">Customers with account counts</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchCustomers}
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
            <h2 className="text-2xl font-bold text-gray-900">CUSTOMER LIST REPORT</h2>
            <p className="text-gray-600 mt-1">
              Generated on {new Date().toLocaleDateString('en-US', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Total Customers: {customers.length}
            </p>
          </div>
        </div>

        {/* Customer Table */}
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 border border-gray-300 text-sm text-left font-bold">Customer #</th>
                <th className="p-3 border border-gray-300 text-sm text-left font-bold">Full Name</th>
                <th className="p-3 border border-gray-300 text-sm text-left font-bold">Telephone</th>
                <th className="p-3 border border-gray-300 text-sm text-left font-bold">Gender</th>
                <th className="p-3 border border-gray-300 text-sm text-left font-bold">Branch</th>
                <th className="p-3 border border-gray-300 text-sm text-left font-bold">City</th>
                <th className="p-3 border border-gray-300 text-sm text-left font-bold">Accounts</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3 border border-gray-300 text-sm font-mono">{customer.customer_number}</td>
                  <td className="p-3 border border-gray-300 text-sm">
                    {customer.first_name} {customer.last_name} 
                    {customer.other_name && ` ${customer.other_name}`}
                  </td>
                  <td className="p-3 border border-gray-300 text-sm">{customer.telephone_number}</td>
                  <td className="p-3 border border-gray-300 text-sm">{customer.gender}</td>
                  <td className="p-3 border border-gray-300 text-sm">{customer.branch_name}</td>
                  <td className="p-3 border border-gray-300 text-sm">{customer.city}</td>
                  <td className="p-3 border border-gray-300 text-sm text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      customer.account_count > 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {customer.account_count}
                    </span>
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
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, customers.length)} of {customers.length} results
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

export default CustomerList;
// components/loans/ActiveLoansList.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, DollarSign, Calendar, User, Eye } from 'lucide-react';
import { api } from '../../../services/api';

interface Loan {
  id: number;
  loan_number: string;
  customer_id: number;
  loan_product_id: number;
  principal_amount: number;
  interest_rate: number;
  tenure_months: number;
  start_date: string;
  maturity_date: string;
  total_interest: number;
  processing_fee: number;
  total_payable: number;
  monthly_installment: number;
  outstanding_principal: number;
  outstanding_interest: number;
  penalty_amount: number;
  status: 'active' | 'closed' | 'defaulted' | 'written_off';
  customer_number: string;
  first_name: string;
  last_name: string;
  loan_product_name: string;
}

interface ActiveLoansListProps {
  setCurrentPage: (page: string) => void;
  setSelectedLoanId: (id: number) => void;
}

const ActiveLoansList: React.FC<ActiveLoansListProps> = ({ setCurrentPage, setSelectedLoanId }) => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchActiveLoans();
  }, []);

  useEffect(() => {
    filterLoans();
  }, [loans, searchTerm]);

  const fetchActiveLoans = async () => {
    try {
      const response = await api.get('/loans');
      setLoans(response.data.data);
    } catch (error) {
      console.error('Error fetching active loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLoans = () => {
    let filtered = loans;

    if (searchTerm) {
      filtered = filtered.filter(loan =>
        loan.loan_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.customer_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.last_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLoans(filtered);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
      defaulted: 'bg-red-100 text-red-800',
      written_off: 'bg-orange-100 text-orange-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        statusConfig[status as keyof typeof statusConfig] || statusConfig.active
      }`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleViewDetails = (loanId: number) => {
    setSelectedLoanId(loanId);
    setCurrentPage('loan-details');
  };

  const handleProcessRepayment = (loanId: number) => {
    setSelectedLoanId(loanId);
    setCurrentPage('loan-repayment');
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
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Active Loans</h1>
          <p className="text-gray-600">Manage and monitor active loans</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search loans..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Loans Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loan #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Principal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Outstanding</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monthly Installment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Maturity Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLoans.map((loan) => (
                <tr key={loan.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {loan.loan_number}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {loan.first_name} {loan.last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {loan.customer_number}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {loan.loan_product_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    GHS {loan.principal_amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="font-medium">
                      GHS {loan.outstanding_principal.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {((loan.outstanding_principal / loan.principal_amount) * 100).toFixed(1)}% remaining
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    GHS {loan.monthly_installment.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(loan.status)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(loan.maturity_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(loan.id)}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1 text-sm"
                        title="View Details"
                      >
                        <Eye size={14} />
                        View
                      </button>
                      <button
                        onClick={() => handleProcessRepayment(loan.id)}
                        className="text-green-600 hover:text-green-900 flex items-center gap-1 text-sm"
                        title="Process Repayment"
                      >
                        <DollarSign size={14} />
                        Repay
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLoans.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No active loans found</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ActiveLoansList;
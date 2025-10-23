// components/loans/LoanDetails.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, DollarSign, User, FileText, Clock } from 'lucide-react';
import { api } from '../../../services/api';

interface LoanDetails {
  loan: {
    id: number;
    loan_number: string;
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
    status: string;
    customer_number: string;
    first_name: string;
    last_name: string;
    loan_product_name: string;
    servicing_account: string;
    disbursed_by_name: string;
  };
  repayment_schedule: Array<{
    id: number;
    installment_number: number;
    due_date: string;
    principal_due: number;
    interest_due: number;
    total_due: number;
    principal_paid: number;
    interest_paid: number;
    penalty_paid: number;
    paid_date: string | null;
    status: string;
  }>;
  transactions: Array<{
    id: number;
    transaction_type: string;
    amount: number;
    principal_component: number;
    interest_component: number;
    penalty_component: number;
    transaction_date: string;
    reference: string;
    description: string;
    created_by_name: string;
  }>;
}

interface LoanDetailsProps {
  setCurrentPage: (page: string) => void;
  selectedLoanId: number;
}

const LoanDetails: React.FC<LoanDetailsProps> = ({ setCurrentPage, selectedLoanId }) => {
  const [loanDetails, setLoanDetails] = useState<LoanDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'transactions'>('overview');

  useEffect(() => {
    fetchLoanDetails();
  }, [selectedLoanId]);

  const fetchLoanDetails = async () => {
    try {
      const response = await api.get(`/loans/${selectedLoanId}`);
      setLoanDetails(response.data.data);
    } catch (error) {
      console.error('Error fetching loan details:', error);
    } finally {
      setLoading(false);
    }
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

  const getTransactionTypeBadge = (type: string) => {
    const typeConfig = {
      disbursement: 'bg-blue-100 text-blue-800',
      repayment: 'bg-green-100 text-green-800',
      penalty: 'bg-red-100 text-red-800',
      write_off: 'bg-orange-100 text-orange-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        typeConfig[type as keyof typeof typeConfig] || typeConfig.disbursement
      }`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
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

  if (!loanDetails) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loan details not found</p>
      </div>
    );
  }

  const { loan, repayment_schedule, transactions } = loanDetails;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setCurrentPage('active-loans')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} />
          <span>Back to Loans</span>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Loan Details</h1>
          <p className="text-gray-600">{loan.loan_number}</p>
        </div>
      </div>

      {/* Loan Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-4 mb-4">
              <h2 className="text-xl font-bold text-gray-900">{loan.loan_number}</h2>
              {getStatusBadge(loan.status)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {loan.first_name} {loan.last_name}
                  </p>
                  <p className="text-sm text-gray-500">{loan.customer_number}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{loan.loan_product_name}</p>
                  <p className="text-sm text-gray-500">Product</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(loan.maturity_date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">Maturity Date</p>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              GHS {loan.outstanding_principal.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Outstanding Balance</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-4 px-6 text-center font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex-1 py-4 px-6 text-center font-medium text-sm ${
                activeTab === 'schedule'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Repayment Schedule
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`flex-1 py-4 px-6 text-center font-medium text-sm ${
                activeTab === 'transactions'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Transactions
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Loan Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Principal Amount</span>
                    <span className="font-medium">GHS {loan.principal_amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Interest Rate</span>
                    <span className="font-medium">{loan.interest_rate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tenure</span>
                    <span className="font-medium">{loan.tenure_months} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start Date</span>
                    <span className="font-medium">{new Date(loan.start_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Maturity Date</span>
                    <span className="font-medium">{new Date(loan.maturity_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Financial Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Interest</span>
                    <span className="font-medium">GHS {loan.total_interest.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Processing Fee</span>
                    <span className="font-medium">GHS {loan.processing_fee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Payable</span>
                    <span className="font-medium">GHS {loan.total_payable.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Installment</span>
                    <span className="font-medium">GHS {loan.monthly_installment.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-600 font-medium">Outstanding Principal</span>
                    <span className="font-bold text-lg">GHS {loan.outstanding_principal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Repayment Schedule Tab */}
          {activeTab === 'schedule' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Principal Due</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Interest Due</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Due</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Principal Paid</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Interest Paid</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {repayment_schedule.map((installment) => (
                    <tr key={installment.id}>
                      <td className="px-4 py-2 text-sm">{installment.installment_number}</td>
                      <td className="px-4 py-2 text-sm">
                        {new Date(installment.due_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        GHS {installment.principal_due.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        GHS {installment.interest_due.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-sm font-medium">
                        GHS {installment.total_due.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        GHS {installment.principal_paid.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        GHS {installment.interest_paid.toLocaleString()}
                      </td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          installment.status === 'paid' 
                            ? 'bg-green-100 text-green-800'
                            : installment.status === 'overdue'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {installment.status.charAt(0).toUpperCase() + installment.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Principal</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Interest</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Processed By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-4 py-2 text-sm">
                        {new Date(transaction.transaction_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2">
                        {getTransactionTypeBadge(transaction.transaction_type)}
                      </td>
                      <td className="px-4 py-2 text-sm font-mono">
                        {transaction.reference}
                      </td>
                      <td className="px-4 py-2 text-sm font-medium">
                        GHS {transaction.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        GHS {transaction.principal_component.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        GHS {transaction.interest_component.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {transaction.created_by_name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default LoanDetails;
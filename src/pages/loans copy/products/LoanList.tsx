import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, DollarSign, TrendingUp, AlertTriangle, CheckCircle, X, Calendar, CreditCard, AlertCircle } from 'lucide-react';
import { loanService } from '../../../services/loanService';
import type { LoanType } from '../../../types/loan';

const LoanList: React.FC = () => {
  const [loans, setLoans] = useState<LoanType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState<LoanType | null>(null);

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    try {
      const data = await loanService.getLoans('active');
      setLoans(data);
    } catch (error) {
      console.error('Error loading loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'defaulted': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'closed': return <CheckCircle className="h-5 w-5 text-blue-500" />;
      default: return <DollarSign className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'defaulted': return 'bg-red-100 text-red-800';
      case 'closed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading loans...</div>;
  }

  return (
    <div className="space-y-4">
      {loans.map((loan) => (
        <motion.div
          key={loan.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                {getStatusIcon(loan.status)}
                <h4 className="text-lg font-semibold text-gray-900">{loan.loan_number}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                  {loan.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                <div>
                  <strong>Customer:</strong><br />
                  {loan.customer ? 
                    `${loan.customer.first_name} ${loan.customer.last_name}` : 
                    'Loading...'
                  }
                </div>
                <div>
                  <strong>Principal:</strong><br />
                  GHS {loan.principal_amount.toLocaleString()}
                </div>
                <div>
                  <strong>Outstanding:</strong><br />
                  GHS {loan.outstanding_principal.toLocaleString()}
                </div>
                <div>
                  <strong>Interest Rate:</strong><br />
                  {loan.interest_rate}%
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div>
                  <strong>Start Date:</strong> {new Date(loan.start_date).toLocaleDateString()}
                </div>
                <div>
                  <strong>End Date:</strong> {new Date(loan.end_date).toLocaleDateString()}
                </div>
                <div>
                  <strong>Term:</strong> {loan.term_months} months
                </div>
              </div>
            </div>

            <div className="flex space-x-2 ml-4">
              <button
                onClick={() => setSelectedLoan(loan)}
                className="p-2 text-blue-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                title="View Details"
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      ))}

      {loans.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <DollarSign className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>No active loans found</p>
        </div>
      )}

      {selectedLoan && (
        <LoanDetailModal
          loan={selectedLoan}
          onClose={() => setSelectedLoan(null)}
          onUpdate={loadLoans}
        />
      )}
    </div>
  );
};

// Repayment Modal Component
const RepaymentModal: React.FC<{
  loan: LoanType;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ loan, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: loan.outstanding_principal + loan.outstanding_interest,
    payment_method: 'cash' as 'cash' | 'cheque' | 'bank_transfer',
    reference: `REPAY-${loan.loan_number}-${Date.now()}`,
    repayment_date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await loanService.processRepayment(loan.id, {
        ...formData,
        amount: Number(formData.amount)
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error processing repayment:', error);
      alert('Failed to process repayment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ 
      ...prev, 
      amount: value === '' ? 0 : Math.max(0, Number(value))
    }));
  };

  const totalOutstanding = loan.outstanding_principal + loan.outstanding_interest;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg w-full max-w-md"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Process Repayment</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">Loan: {loan.loan_number}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Outstanding Amount Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-blue-900">Outstanding Principal:</span>
              <span className="text-sm font-semibold text-blue-900">
                GHS {loan.outstanding_principal.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-blue-900">Outstanding Interest:</span>
              <span className="text-sm font-semibold text-blue-900">
                GHS {loan.outstanding_interest.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-blue-200 pt-2">
              <span className="text-sm font-bold text-blue-900">Total Outstanding:</span>
              <span className="text-sm font-bold text-blue-900">
                GHS {totalOutstanding.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Repayment Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <DollarSign className="h-4 w-4 inline mr-1" />
              Repayment Amount (GHS)
            </label>
            <input
              type="number"
              required
              min="0.01"
              max={totalOutstanding}
              step="0.01"
              value={formData.amount}
              onChange={handleAmountChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter repayment amount"
            />
            {formData.amount > totalOutstanding && (
              <div className="flex items-center mt-1 text-amber-600 text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                Amount exceeds total outstanding. Excess will be recorded.
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <CreditCard className="h-4 w-4 inline mr-1" />
              Payment Method
            </label>
            <select
              required
              value={formData.payment_method}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                payment_method: e.target.value as 'cash' | 'cheque' | 'bank_transfer' 
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>

          {/* Repayment Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="h-4 w-4 inline mr-1" />
              Repayment Date
            </label>
            <input
              type="date"
              required
              value={formData.repayment_date}
              onChange={(e) => setFormData(prev => ({ ...prev, repayment_date: e.target.value }))}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Reference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reference Number
            </label>
            <input
              type="text"
              required
              value={formData.reference}
              onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter reference number"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || formData.amount <= 0}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Process Repayment'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Loan Detail Modal Component
const LoanDetailModal: React.FC<{
  loan: LoanType;
  onClose: () => void;
  onUpdate: () => void;
}> = ({ loan, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'repayments' | 'transactions'>('overview');
  const [repaymentSchedule, setRepaymentSchedule] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    loadLoanDetails();
  }, [loan.id]);

  const loadLoanDetails = async () => {
    try {
      const [schedule, txs] = await Promise.all([
        loanService.getRepaymentSchedule(loan.id),
        loanService.getLoanTransactions(loan.id)
      ]);
      setRepaymentSchedule(schedule);
      setTransactions(txs);
    } catch (error) {
      console.error('Error loading loan details:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Loan Details - {loan.loan_number}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>
        </div>

        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {['overview', 'repayments', 'transactions'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 py-4 px-6 text-center font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && <LoanOverviewTab loan={loan} />}
          {activeTab === 'repayments' && (
            <RepaymentScheduleTab 
              schedule={repaymentSchedule} 
              loan={loan} 
              onUpdate={loadLoanDetails}
            />
          )}
          {activeTab === 'transactions' && <TransactionsTab transactions={transactions} />}
        </div>
      </div>
    </div>
  );
};

const LoanOverviewTab: React.FC<{ loan: LoanType }> = ({ loan }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-900">Loan Information</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Principal Amount:</span>
          <span className="font-medium">GHS {loan.principal_amount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Outstanding Principal:</span>
          <span className="font-medium">GHS {loan.outstanding_principal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Outstanding Interest:</span>
          <span className="font-medium">GHS {loan.outstanding_interest.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Interest Rate:</span>
          <span className="font-medium">{loan.interest_rate}%</span>
        </div>
      </div>
    </div>

    <div className="space-y-4">
      <h4 className="font-semibold text-gray-900">Term Information</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Start Date:</span>
          <span className="font-medium">{new Date(loan.start_date).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">End Date:</span>
          <span className="font-medium">{new Date(loan.end_date).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Term:</span>
          <span className="font-medium">{loan.term_months} months</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Days in Arrears:</span>
          <span className={`font-medium ${loan.days_in_arrears > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {loan.days_in_arrears} days
          </span>
        </div>
      </div>
    </div>
  </div>
);

const RepaymentScheduleTab: React.FC<{ 
  schedule: any[]; 
  loan: LoanType;
  onUpdate: () => void;
}> = ({ schedule, loan, onUpdate }) => {
  const [showRepaymentModal, setShowRepaymentModal] = useState(false);

  const paidInstallments = schedule.filter(item => item.status === 'paid').length;
  const totalInstallments = schedule.length;
  const progressPercentage = totalInstallments > 0 ? (paidInstallments / totalInstallments) * 100 : 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h4 className="font-semibold text-gray-900">Repayment Schedule</h4>
          <div className="flex items-center space-x-4 mt-2">
            <div className="text-sm text-gray-600">
              Progress: {paidInstallments}/{totalInstallments} installments
            </div>
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setShowRepaymentModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm flex items-center"
        >
          <DollarSign className="h-4 w-4 mr-1" />
          Process Repayment
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Principal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Interest</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Due</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {schedule.map((installment) => (
              <tr key={installment.id} className={installment.status === 'overdue' ? 'bg-red-50' : ''}>
                <td className="px-6 py-4 text-sm text-gray-900">{installment.installment_number}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {new Date(installment.due_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  GHS {installment.principal_amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  GHS {installment.interest_amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  GHS {installment.total_due.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {installment.paid_date ? new Date(installment.paid_date).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    installment.status === 'paid' ? 'bg-green-100 text-green-800' :
                    installment.status === 'overdue' ? 'bg-red-100 text-red-800' :
                    installment.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {installment.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showRepaymentModal && (
        <RepaymentModal
          loan={loan}
          onClose={() => setShowRepaymentModal(false)}
          onSuccess={() => {
            setShowRepaymentModal(false);
            onUpdate(); // Refresh the loan details
          }}
        />
      )}
    </div>
  );
};

const TransactionsTab: React.FC<{ transactions: any[] }> = ({ transactions }) => (
  <div>
    <h4 className="font-semibold text-gray-900 mb-4">Loan Transactions</h4>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Principal</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Interest</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td className="px-6 py-4 text-sm text-gray-900">
                {new Date(transaction.transaction_date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">{transaction.transaction_type}</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                GHS {transaction.amount.toLocaleString()}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                GHS {transaction.principal_amount.toLocaleString()}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                GHS {transaction.interest_amount.toLocaleString()}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">{transaction.reference}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default LoanList;
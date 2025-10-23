// components/loans/LoanRepayment.tsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { ArrowLeft, DollarSign, Calendar, Save, Search } from 'lucide-react';
import { api } from '../../../services/api';

interface Loan {
  id: number;
  loan_number: string;
  customer_id: number;
  principal_amount: number;
  outstanding_principal: number;
  monthly_installment: number;
  customer_number: string;
  first_name: string;
  last_name: string;
}

interface RepaymentSchedule {
  id: number;
  installment_number: number;
  due_date: string;
  principal_due: number;
  interest_due: number;
  total_due: number;
  principal_paid: number;
  interest_paid: number;
  status: string;
}

interface FormData {
  loan_id: number;
  amount: number;
  payment_date: string;
}

interface LoanRepaymentProps {
  setCurrentPage: (page: string) => void;
  selectedLoanId?: number;
}

const LoanRepayment: React.FC<LoanRepaymentProps> = ({ setCurrentPage, selectedLoanId }) => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [repaymentSchedule, setRepaymentSchedule] = useState<RepaymentSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>();

  const watchAmount = watch('amount');

  useEffect(() => {
    fetchActiveLoans();
  }, []);

  useEffect(() => {
    if (selectedLoanId) {
      const loan = loans.find(l => l.id === selectedLoanId);
      if (loan) {
        setSelectedLoan(loan);
        setValue('loan_id', loan.id);
        fetchRepaymentSchedule(loan.id);
      }
    }
  }, [selectedLoanId, loans]);

  const fetchActiveLoans = async () => {
    try {
      const response = await api.get('/loans');
      setLoans(response.data.data);
    } catch (error) {
      console.error('Error fetching active loans:', error);
    }
  };

  const fetchRepaymentSchedule = async (loanId: number) => {
    try {
      const response = await api.get(`/loans/${loanId}/schedule`);
      setRepaymentSchedule(response.data.data.schedule);
    } catch (error) {
      console.error('Error fetching repayment schedule:', error);
    }
  };

  const selectLoan = (loan: Loan) => {
    setSelectedLoan(loan);
    setValue('loan_id', loan.id);
    setValue('payment_date', new Date().toISOString().split('T')[0]);
    fetchRepaymentSchedule(loan.id);
    setSearchTerm('');
  };

  const filteredLoans = loans.filter(loan =>
    loan.loan_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.customer_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${loan.first_name} ${loan.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const createdBy = 1; // Replace with actual user ID from context
      await api.post('/loans/repayment', {
        ...data,
        created_by: createdBy
      });
      alert('Repayment processed successfully!');
      setCurrentPage('active-loans');
    } catch (error: any) {
      console.error('Error processing repayment:', error);
      alert(error.response?.data?.message || 'Failed to process repayment');
    } finally {
      setLoading(false);
    }
  };

  const pendingInstallments = repaymentSchedule.filter(item => item.status === 'pending');
  const totalDue = pendingInstallments.reduce((sum, item) => sum + (item.total_due - item.principal_paid - item.interest_paid), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setCurrentPage('loan-dashboard')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Process Loan Repayment</h1>
          <p className="text-gray-600">Record loan repayment transactions</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Loan Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Select Loan</h3>
            
            {!selectedLoan ? (
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search by loan number, customer name or number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                {searchTerm && filteredLoans.length > 0 && (
                  <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                    {filteredLoans.map((loan) => (
                      <div
                        key={loan.id}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                        onClick={() => selectLoan(loan)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{loan.loan_number}</p>
                            <p className="text-sm text-gray-500">
                              {loan.first_name} {loan.last_name} ({loan.customer_number})
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">GHS {loan.outstanding_principal.toLocaleString()}</p>
                            <p className="text-sm text-gray-500">Outstanding</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-green-800 font-medium">
                      Selected: {selectedLoan.loan_number}
                    </p>
                    <p className="text-green-700">
                      {selectedLoan.first_name} {selectedLoan.last_name} ({selectedLoan.customer_number})
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLoan(null);
                      setValue('loan_id', 0);
                      setRepaymentSchedule([]);
                    }}
                    className="text-green-600 hover:text-green-800"
                  >
                    Change
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                  <div>
                    <p className="text-green-600">Principal</p>
                    <p className="font-medium">GHS {selectedLoan.principal_amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-green-600">Outstanding</p>
                    <p className="font-medium">GHS {selectedLoan.outstanding_principal.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-green-600">Monthly Installment</p>
                    <p className="font-medium">GHS {selectedLoan.monthly_installment.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {selectedLoan && (
            <>
              {/* Repayment Schedule */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Pending Installments</h3>
                {pendingInstallments.length > 0 ? (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Principal Due</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Interest Due</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Due</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {pendingInstallments.slice(0, 3).map((installment) => (
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
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {pendingInstallments.length > 3 && (
                      <div className="px-4 py-2 bg-gray-50 text-sm text-gray-500">
                        + {pendingInstallments.length - 3} more installments
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No pending installments</p>
                )}
              </div>

              {/* Repayment Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Repayment Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Amount (GHS) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('amount', { 
                        required: 'Payment amount is required',
                        min: { value: 1, message: 'Amount must be greater than 0' },
                        max: { value: totalDue, message: `Amount cannot exceed total due of GHS ${totalDue.toLocaleString()}` }
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter payment amount"
                    />
                    {errors.amount && (
                      <p className="text-red-600 text-sm mt-1">{errors.amount.message}</p>
                    )}
                    {totalDue > 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        Total due: GHS {totalDue.toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Date *
                    </label>
                    <input
                      type="date"
                      {...register('payment_date', { required: 'Payment date is required' })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.payment_date && (
                      <p className="text-red-600 text-sm mt-1">{errors.payment_date.message}</p>
                    )}
                  </div>
                </div>

                {watchAmount && selectedLoan && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-blue-900 mb-2">Payment Summary</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-blue-600">Amount Paid</p>
                        <p className="text-lg font-bold text-blue-900">
                          GHS {parseFloat(watchAmount.toString()).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-blue-600">Remaining Balance</p>
                        <p className="text-lg font-bold text-blue-900">
                          GHS {(selectedLoan.outstanding_principal - parseFloat(watchAmount.toString()) * 0.7).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setCurrentPage('loan-dashboard')}
                  className="px-6 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
                >
                  <Save size={18} />
                  {loading ? 'Processing...' : 'Process Repayment'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </motion.div>
  );
};

export default LoanRepayment;
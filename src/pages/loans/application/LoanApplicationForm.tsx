// components/loans/LoanApplicationForm.tsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Search, Calculator, User, ArrowLeft, Save } from 'lucide-react';
import { api } from '../../../services/api';

interface LoanProduct {
  id: number;
  name: string;
  code: string;
  interest_rate: number;
  min_loan_amount: number;
  max_loan_amount: number;
  min_tenure: number;
  max_tenure: number;
  is_active: number;
  processing_fee_rate: number;
}

interface Customer {
  id: number;
  customer_number: string;
  first_name: string;
  last_name: string;
  telephone_number: string;
}

interface Account {
  id: number;
  account_number: string;
  type: string;
  balance: number;
  coa_name: string;
}

interface FormData {
  customer_id: number;
  loan_product_id: number;
  servicing_account_id: number;
  applied_amount: number;
  tenure_months: number;
  purpose: string;
}

interface LoanApplicationFormProps {
  setCurrentPage: (page: string) => void;
}

const LoanApplicationForm: React.FC<LoanApplicationFormProps> = ({ setCurrentPage }) => {
  const [loanProducts, setLoanProducts] = useState<LoanProduct[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<LoanProduct | null>(null);
  const [calculation, setCalculation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>();

  const watchAmount = watch('applied_amount');
  const watchTenure = watch('tenure_months');
  const watchProduct = watch('loan_product_id');

  useEffect(() => {
    fetchLoanProducts();
  }, []);

  useEffect(() => {
    if (watchAmount && watchTenure && watchProduct) {
      calculateLoan();
    }
  }, [watchAmount, watchTenure, watchProduct]);

  const fetchLoanProducts = async () => {
    try {
      const response = await api.get('/loan-products');
      setLoanProducts(response.data.data);
    } catch (error) {
      console.error('Error fetching loan products:', error);
    }
  };

  const searchCustomers = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setCustomers([]);
      return;
    }
    try {
      const response = await api.get(`/customers/search?q=${query}`);
      setCustomers(response.data.data || []);
    } catch (error) {
      console.error('Error searching customers:', error);
      setCustomers([]);
    }
  };

  const fetchCustomerAccounts = async (customerId: number) => {
    try {
      const response = await api.get(`/customers/${customerId}/accounts`);
      setAccounts(response.data.data || []);
    } catch (error) {
      console.error('Error fetching customer accounts:', error);
      setAccounts([]);
    }
  };

  const calculateLoan = () => {
    if (!selectedProduct || !watchAmount || !watchTenure) return;

    const principal = parseFloat(watchAmount.toString());
    const interestRate = selectedProduct.interest_rate;
    const tenure = parseInt(watchTenure.toString());

    const annualInterest = principal * (interestRate / 100);
    const totalInterest = annualInterest * (tenure / 12);
    const processingFee = principal * (selectedProduct.processing_fee_rate / 100);
    const totalPayable = principal + totalInterest;
    const monthlyInstallment = totalPayable / tenure;

    setCalculation({
      totalInterest: totalInterest.toFixed(2),
      processingFee: processingFee.toFixed(2),
      totalPayable: totalPayable.toFixed(2),
      monthlyInstallment: monthlyInstallment.toFixed(2)
    });
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const response = await api.post('/loan-applications/apply', data);
      alert('Loan application submitted successfully!');
      setCurrentPage('loan-applications');
    } catch (error: any) {
      console.error('Error submitting application:', error);
      alert(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setValue('customer_id', customer.id);
    fetchCustomerAccounts(customer.id);
    setCustomers([]);
    setSearchQuery(`${customer.first_name} ${customer.last_name} (${customer.customer_number})`);
  };

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
          <h1 className="text-2xl font-bold text-gray-900">New Loan Application</h1>
          <p className="text-gray-600">Apply for a new loan</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Customer Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Customer Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Customer *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  placeholder="Search by name or customer number..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  onChange={(e) => searchCustomers(e.target.value)}
                />
                <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
              </div>
              
              {customers.length > 0 && (
                <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                  {customers.map((customer) => (
                    <div
                      key={customer.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                      onClick={() => selectCustomer(customer)}
                    >
                      <div className="flex items-center space-x-3">
                        <User className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium">
                            {customer.first_name} {customer.last_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {customer.customer_number} • {customer.telephone_number}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedCustomer && (
                <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-800 font-medium">
                    Selected: {selectedCustomer.first_name} {selectedCustomer.last_name} 
                    ({selectedCustomer.customer_number})
                  </p>
                </div>
              )}
              {errors.customer_id && (
                <p className="text-red-600 text-sm mt-1">Please select a customer</p>
              )}
            </div>
          </div>

          {/* Loan Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Loan Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loan Product *
                </label>
                <select
                  {...register('loan_product_id', { required: 'Loan product is required' })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  onChange={(e) => {
                    const product = loanProducts.find(p => p.id === parseInt(e.target.value));
                    setSelectedProduct(product || null);
                  }}
                >
                  <option value="">Select Loan Product</option>
                  {loanProducts.filter(p => p.is_active).map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.interest_rate}% interest)
                    </option>
                  ))}
                </select>
                {errors.loan_product_id && (
                  <p className="text-red-600 text-sm mt-1">{errors.loan_product_id.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Servicing Account *
                </label>
                <select
                  {...register('servicing_account_id', { required: 'Servicing account is required' })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Account</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.account_number} ({account.type}) - GHS {account.balance}
                    </option>
                  ))}
                </select>
                {errors.servicing_account_id && (
                  <p className="text-red-600 text-sm mt-1">{errors.servicing_account_id.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loan Amount (GHS) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('applied_amount', { 
                    required: 'Loan amount is required',
                    min: { value: 1, message: 'Amount must be greater than 0' }
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter loan amount"
                />
                {errors.applied_amount && (
                  <p className="text-red-600 text-sm mt-1">{errors.applied_amount.message}</p>
                )}
                {selectedProduct && (
                  <p className="mt-1 text-sm text-gray-500">
                    Min: GHS {selectedProduct.min_loan_amount} | Max: GHS {selectedProduct.max_loan_amount}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tenure (Months) *
                </label>
                <input
                  type="number"
                  {...register('tenure_months', { 
                    required: 'Tenure is required',
                    min: { value: 1, message: 'Tenure must be at least 1 month' }
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter loan tenure"
                />
                {errors.tenure_months && (
                  <p className="text-red-600 text-sm mt-1">{errors.tenure_months.message}</p>
                )}
                {selectedProduct && (
                  <p className="mt-1 text-sm text-gray-500">
                    Min: {selectedProduct.min_tenure} months | Max: {selectedProduct.max_tenure} months
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loan Purpose *
              </label>
              <textarea
                {...register('purpose', { required: 'Purpose is required' })}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the purpose of this loan..."
              />
              {errors.purpose && (
                <p className="text-red-600 text-sm mt-1">{errors.purpose.message}</p>
              )}
            </div>
          </div>

          {/* Loan Calculation */}
          {calculation && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Calculator className="h-5 w-5 text-blue-600" />
                <h4 className="text-lg font-medium text-blue-900">Loan Calculation</h4>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-blue-600 font-medium">Monthly Installment</p>
                  <p className="text-lg font-bold text-blue-900">
                    GHS {calculation.monthlyInstallment}
                  </p>
                </div>
                <div>
                  <p className="text-blue-600 font-medium">Total Interest</p>
                  <p className="text-lg font-bold text-blue-900">
                    GHS {calculation.totalInterest}
                  </p>
                </div>
                <div>
                  <p className="text-blue-600 font-medium">Processing Fee</p>
                  <p className="text-lg font-bold text-blue-900">
                    GHS {calculation.processingFee}
                  </p>
                </div>
                <div>
                  <p className="text-blue-600 font-medium">Total Payable</p>
                  <p className="text-lg font-bold text-blue-900">
                    GHS {calculation.totalPayable}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setCurrentPage('loan-dashboard')}
              className="px-6 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center gap-2"
            >
              <Save size={18} />
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default LoanApplicationForm;
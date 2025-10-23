// components/loans/disbursement/LoanDisbursement.tsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { ArrowLeft, DollarSign, Calculator, User, Save, Calendar, AlertCircle } from 'lucide-react';
import { api } from '../../../services/api';

interface LoanApplication {
  id: number;
  application_number: string;
  customer_id: number;
  loan_product_id: number;
  servicing_account_id: number;
  applied_amount: number;
  approved_amount: number;
  purpose: string;
  tenure_months: number;
  customer_number: string;
  first_name: string;
  last_name: string;
  loan_product_name: string;
  servicing_account: string;
}

interface LoanProduct {
  id: number;
  name: string;
  interest_rate: number;
  processing_fee_rate: number;
  interest_type: string;
}

interface DisbursementData {
  loan_application_id: number;
  disbursed_by: number;
}

interface LoanDisbursementProps {
  setCurrentPage: (page: string) => void;
  selectedApplicationId?: number;
  
}


const LoanDisbursement: React.FC<LoanDisbursementProps> = ({ setCurrentPage, selectedApplicationId }) => {
  const [application, setApplication] = useState<LoanApplication | null>(null);
  const [loanProduct, setLoanProduct] = useState<LoanProduct | null>(null);
  const [calculation, setCalculation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [disbursementLoading, setDisbursementLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<DisbursementData>();

  useEffect(() => {
    if (selectedApplicationId) {
      fetchApplicationDetails();
    } else {
      setError('No application selected');
      setLoading(false);
    }
  }, [selectedApplicationId]);

  useEffect(() => {
    if (application && application.approved_amount && application.tenure_months && loanProduct) {
      calculateLoanDetails();
    }
  }, [application, loanProduct]);

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching application details for ID:', selectedApplicationId);
      
      const response = await api.get('/loan-applications');
      console.log('Applications API response:', response.data);
      
      if (!response.data.data) {
        throw new Error('No applications data received');
      }

      const applications = response.data.data;
      const selectedApp = applications.find((app: LoanApplication) => app.id === selectedApplicationId);
      
      console.log('Found application:', selectedApp);
      
      if (!selectedApp) {
        throw new Error(`Application with ID ${selectedApplicationId} not found`);
      }

      if (selectedApp.status !== 'approved') {
        throw new Error(`Application status is "${selectedApp.status}". Only approved applications can be disbursed.`);
      }

      setApplication(selectedApp);
      
      // Fetch loan product details for calculation
      await fetchLoanProduct(selectedApp.loan_product_id);
      
    } catch (error: any) {
      console.error('Error fetching application details:', error);
      setError(error.message || 'Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  const fetchLoanProduct = async (productId: number) => {
    try {
      console.log('Fetching loan product for ID:', productId);
      
      const response = await api.get('/loan-products');
      console.log('Loan products API response:', response.data);
      
      if (!response.data.data) {
        throw new Error('No loan products data received');
      }

      const products = response.data.data;
      const product = products.find((p: LoanProduct) => p.id === productId);
      
      console.log('Found loan product:', product);
      
      if (!product) {
        throw new Error(`Loan product with ID ${productId} not found`);
      }

      setLoanProduct(product);
    } catch (error: any) {
      console.error('Error fetching loan product:', error);
      setError(error.message || 'Failed to load loan product details');
    }
  };

  const calculateLoanDetails = () => {
    if (!application || !loanProduct) return;

    const principal = application.approved_amount;
    const interestRate = loanProduct.interest_rate;
    const tenure = application.tenure_months;
    const processingFeeRate = loanProduct.processing_fee_rate;

    // Flat rate calculation
    const annualInterest = principal * (interestRate / 100);
    const totalInterest = annualInterest * (tenure / 12);
    const processingFee = principal * (processingFeeRate / 100);
    const totalPayable = principal + totalInterest;
    const monthlyInstallment = totalPayable / tenure;

    setCalculation({
      principal: principal,
      interestRate: interestRate,
      totalInterest: totalInterest,
      processingFee: processingFee,
      totalPayable: totalPayable,
      monthlyInstallment: monthlyInstallment,
      tenure: tenure
    });
  };

  const onSubmit = async (data: DisbursementData) => {
    setDisbursementLoading(true);
    try {
      const disbursedBy = 1; // Replace with actual user ID from context
      
      const payload = {
        loan_application_id: application?.id,
        disbursed_by: disbursedBy
      };

      console.log('Sending disbursement request:', payload);
      
      const response = await api.post('/loans/disburse', payload);
      console.log('Disbursement response:', response.data);

      alert('Loan disbursed successfully!');
      setCurrentPage('applications');
    } catch (error: any) {
      console.error('Error disbursing loan:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to disburse loan';
      alert(errorMessage);
    } finally {
      setDisbursementLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application details...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setCurrentPage('applications')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            <span>Back to Applications</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Loan Disbursement</h1>
            <p className="text-gray-600">Disburse approved loan to customer</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Application</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => setCurrentPage('applications')}
              className="px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              Return to Applications
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show main content
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setCurrentPage('applications')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} />
          <span>Back to Applications</span>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Loan Disbursement</h1>
          <p className="text-gray-600">Disburse approved loan to customer</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* Application Summary */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-medium text-blue-900 mb-4">Application Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-blue-600">Application Number</p>
              <p className="font-medium">{application?.application_number}</p>
            </div>
            <div>
              <p className="text-sm text-blue-600">Customer</p>
              <p className="font-medium">
                {application?.first_name} {application?.last_name} ({application?.customer_number})
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-600">Loan Product</p>
              <p className="font-medium">{application?.loan_product_name}</p>
            </div>
            <div>
              <p className="text-sm text-blue-600">Approved Amount</p>
              <p className="font-medium text-green-600">
                GHS {application?.approved_amount?.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-600">Purpose</p>
              <p className="font-medium">{application?.purpose}</p>
            </div>
            <div>
              <p className="text-sm text-blue-600">Tenure</p>
              <p className="font-medium">{application?.tenure_months} months</p>
            </div>
          </div>
        </div>

        {/* Loan Calculation */}
        {calculation && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <Calculator className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-medium text-green-900">Loan Calculation</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-green-600 font-medium">Principal Amount</p>
                <p className="text-lg font-bold text-green-900">
                  GHS {calculation.principal}
                </p>
              </div>
              <div>
                <p className="text-green-600 font-medium">Interest Rate</p>
                <p className="text-lg font-bold text-green-900">
                  {calculation.interestRate}%
                </p>
              </div>
              <div>
                <p className="text-green-600 font-medium">Total Interest</p>
                <p className="text-lg font-bold text-green-900">
                  GHS {calculation.totalInterest}
                </p>
              </div>
              <div>
                <p className="text-green-600 font-medium">Processing Fee</p>
                <p className="text-lg font-bold text-green-900">
                  GHS {calculation.processingFee}
                </p>
              </div>
              <div>
                <p className="text-green-600 font-medium">Monthly Installment</p>
                <p className="text-lg font-bold text-green-900">
                  GHS {calculation.monthlyInstallment}
                </p>
              </div>
              <div>
                <p className="text-green-600 font-medium">Total Payable</p>
                <p className="text-lg font-bold text-green-900">
                  GHS {calculation.totalPayable}
                </p>
              </div>
            </div>

            {/* Repayment Schedule Preview */}
            <div className="mt-4 pt-4 border-t border-green-200">
              <h4 className="text-md font-medium text-green-800 mb-2">Repayment Schedule Preview</h4>
              <div className="text-sm text-green-700">
                <p>
                  {calculation.tenure} monthly installments of GHS {calculation.monthlyInstallment} each
                </p>
                <p className="text-xs mt-1">
                  First payment due: {new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Disbursement Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...register('loan_application_id')} value={application?.id || 0} />
          
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-lg font-medium text-yellow-900 mb-4">Disbursement Details</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-yellow-700 mb-2">
                    Disbursement Date
                  </label>
                  <input
                    type="date"
                    value={new Date().toISOString().split('T')[0]}
                    disabled
                    className="w-full p-3 border border-yellow-300 rounded-lg bg-yellow-100 text-yellow-800"
                  />
                  <p className="text-xs text-yellow-600 mt-1">Today's date (auto-filled)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-yellow-700 mb-2">
                    Servicing Account
                  </label>
                  <input
                    type="text"
                    value={application?.servicing_account || 'N/A'}
                    disabled
                    className="w-full p-3 border border-yellow-300 rounded-lg bg-yellow-100 text-yellow-800"
                  />
                  <p className="text-xs text-yellow-600 mt-1">Customer's account for disbursement</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-yellow-700 mb-2">
                  Disbursement Amount
                </label>
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-5 w-5 text-yellow-600" />
                  <input
                    type="text"
                    value={`GHS ${application?.approved_amount?.toLocaleString()}`}
                    disabled
                    className="flex-1 p-3 border border-yellow-300 rounded-lg bg-yellow-100 text-yellow-800 font-bold text-lg"
                  />
                </div>
                <p className="text-xs text-yellow-600 mt-1">
                  Approved amount to be disbursed to customer
                </p>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Terms & Conditions</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-1.5"></div>
                <p>Loan will be disbursed to the customer's servicing account</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-1.5"></div>
                <p>Repayment schedule will be automatically generated</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-1.5"></div>
                <p>Processing fee will be deducted from the loan amount</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-1.5"></div>
                <p>Customer will start repayments next month</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setCurrentPage('applications')}
              className="px-6 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={disbursementLoading}
              className="px-6 py-3 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 flex items-center gap-2 disabled:opacity-50"
            >
              {disbursementLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <DollarSign size={18} />
                  Disburse Loan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default LoanDisbursement;
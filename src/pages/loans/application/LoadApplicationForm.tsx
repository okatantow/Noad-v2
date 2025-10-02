import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, DollarSign, Calendar } from 'lucide-react';
import { loanService } from '../../../services/loanService';
import type { LoanProductType, CustomerType } from '../../../types/loan';

interface LoanApplicationFormProps {
  onClose: () => void;
  customer?: CustomerType;
}

const LoanApplicationForm: React.FC<LoanApplicationFormProps> = ({ onClose, customer }) => {
  const [loading, setLoading] = useState(false);
  const [loanProducts, setLoanProducts] = useState<LoanProductType[]>([]);
  const [customers, setCustomers] = useState<CustomerType[]>([]);
  const [formData, setFormData] = useState({
    customer_id: customer?.id || '',
    loan_product_id: '',
    applied_amount: '',
    purpose: '',
    term_months: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsResponse, customersResponse] = await Promise.all([
        loanService.getLoanProducts(),
        // You'll need a customer service to fetch customers
        // customerService.getCustomers()
      ]);
      setLoanProducts(productsResponse);
      // setCustomers(customersResponse);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await loanService.applyForLoan({
        customer_id: Number(formData.customer_id),
        loan_product_id: Number(formData.loan_product_id),
        applied_amount: Number(formData.applied_amount),
        purpose: formData.purpose,
        term_months: Number(formData.term_months)
      });
      
      onClose();
      // Show success message
    } catch (error) {
      console.error('Error submitting application:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = loanProducts.find(p => p.id === Number(formData.loan_product_id));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">New Loan Application</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Customer Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-1" />
                Customer
              </label>
              <select
                required
                value={formData.customer_id}
                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.first_name} {customer.last_name} ({customer.customer_number})
                  </option>
                ))}
              </select>
            </div>

            {/* Loan Product Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="h-4 w-4 inline mr-1" />
                Loan Product
              </label>
              <select
                required
                value={formData.loan_product_id}
                onChange={(e) => setFormData({ ...formData, loan_product_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Loan Product</option>
                {loanProducts.filter(p => p.is_active).map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.interest_rate}% - GHS {product.min_amount} to {product.max_amount})
                  </option>
                ))}
              </select>
            </div>

            {selectedProduct && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900">Product Details</h4>
                <p className="text-sm text-blue-700">
                  Interest Rate: {selectedProduct.interest_rate}% | 
                  Term: {selectedProduct.min_term}-{selectedProduct.max_term} months | 
                  Amount: GHS {selectedProduct.min_amount} - {selectedProduct.max_amount}
                </p>
              </div>
            )}

            {/* Loan Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loan Amount (GHS)
              </label>
              <input
                type="number"
                required
                min={selectedProduct?.min_amount || 0}
                max={selectedProduct?.max_amount || 1000000}
                value={formData.applied_amount}
                onChange={(e) => setFormData({ ...formData, applied_amount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter loan amount"
              />
            </div>

            {/* Loan Term */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Loan Term (months)
              </label>
              <input
                type="number"
                required
                min={selectedProduct?.min_term || 1}
                max={selectedProduct?.max_term || 60}
                value={formData.term_months}
                onChange={(e) => setFormData({ ...formData, term_months: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter loan term in months"
              />
            </div>

            {/* Purpose */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loan Purpose
              </label>
              <textarea
                required
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the purpose of this loan..."
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LoanApplicationForm;
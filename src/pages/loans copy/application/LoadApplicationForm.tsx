import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, DollarSign, Calendar, Search, Loader } from 'lucide-react';
import { loanService } from '../../../services/loanService';
// import { get } from '../../../services/customerService';
import * as customerService from '../../../services/customerService';
import type { LoanProductType, CustomerType } from '../../../types/loan';

interface LoanApplicationFormProps {
  onClose: () => void;
  customer?: CustomerType;
}

const LoanApplicationForm: React.FC<LoanApplicationFormProps> = ({ onClose, customer }) => {
  const [loading, setLoading] = useState(false);
  const [loanProducts, setLoanProducts] = useState<LoanProductType[]>([]);
  const [customers, setCustomers] = useState<CustomerType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CustomerType[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerType | null>(customer || null);
  
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
        customerService.getCustomers()
      ]);
      setLoanProducts(productsResponse);
      setCustomers(customersResponse);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Debounced search function
  useEffect(() => {
    const searchCustomers = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }

      setIsSearching(true);
      try {
        const results = await customerService.searchCustomers(searchQuery);
        setSearchResults(results.data);
        setShowSearchResults(true);
      } catch (error) {
        console.error('Error searching customers:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchCustomers, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleCustomerSelect = (customer: CustomerType) => {
    setSelectedCustomer(customer);
    setFormData(prev => ({ ...prev, customer_id: customer.id.toString() }));
    setSearchQuery(`${customer.first_name} ${customer.last_name} (${customer.customer_number})`);
    setShowSearchResults(false);
    setSearchResults([]);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (!e.target.value.trim()) {
      setSelectedCustomer(null);
      setFormData(prev => ({ ...prev, customer_id: '' }));
      setShowSearchResults(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCustomer) {
      alert('Please select a customer');
      return;
    }

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
            {/* Customer Search */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-1" />
                Customer Search
              </label>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search by name or customer number..."
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {isSearching && (
                  <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 animate-spin" />
                )}
              </div>

              {/* Search Results Dropdown */}
              <AnimatePresence>
                {showSearchResults && searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                  >
                    {searchResults.map((customer) => (
                      <div
                        key={customer.id}
                        onClick={() => handleCustomerSelect(customer)}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">
                          {customer.first_name} {customer.last_name}
                        </div>
                        <div className="text-sm text-gray-600">
                          Customer #: {customer.customer_number}
                          {customer.telephone_number && ` • Phone: ${customer.telephone_number}`}
                        </div>
                        {/* {customer.city && (
                          <div className="text-xs text-gray-500 mt-1">
                            Location: {customer.city}
                          </div>
                        )} */}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Selected Customer Info */}
              {selectedCustomer && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-green-900">
                        {selectedCustomer.first_name} {selectedCustomer.last_name}
                      </h4>
                      <p className="text-sm text-green-700">
                        Customer #: {selectedCustomer.customer_number}
                        {selectedCustomer.telephone_number && ` • Phone: ${selectedCustomer.telephone_number}`}
                      </p>
                      {/* {selectedCustomer.city && (
                        <p className="text-xs text-green-600 mt-1">
                          Location: {selectedCustomer.city}
                        </p>
                      )} */}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCustomer(null);
                        setSearchQuery('');
                        setFormData(prev => ({ ...prev, customer_id: '' }));
                      }}
                      className="text-green-600 hover:text-green-800 text-sm"
                    >
                      Change
                    </button>
                  </div>
                </motion.div>
              )}

              {/* No Results Message */}
              {showSearchResults && searchQuery && !isSearching && searchResults.length === 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
                  No customers found matching "{searchQuery}"
                </div>
              )}
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
                disabled={!selectedCustomer}
              >
                <option value="">Select Loan Product</option>
                {loanProducts.filter(p => p.is_active).map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.interest_rate}% - GHS {product.min_amount} to {product.max_amount})
                  </option>
                ))}
              </select>
              {!selectedCustomer && (
                <p className="text-sm text-gray-500 mt-1">Please select a customer first</p>
              )}
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
                disabled={!selectedCustomer}
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
                disabled={!selectedCustomer}
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
                disabled={!selectedCustomer}
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
                disabled={loading || !selectedCustomer}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
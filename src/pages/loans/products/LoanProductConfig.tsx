// components/loans/LoanProductConfig.tsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { api } from '../../../services/api';

interface LoanProduct {
  id: number;
  name: string;
  code: string;
  description: string;
  interest_type: 'flat' | 'reducing';
  interest_rate: number;
  min_loan_amount: number;
  max_loan_amount: number;
  min_tenure: number;
  max_tenure: number;
  processing_fee_rate: number;
  penalty_rate: number;
  is_active: boolean;
  coa_loan_asset: number;
  coa_interest_income: number;
  coa_processing_fee: number;
  coa_penalty_income: number;
  loan_asset_account?: string;
  interest_income_account?: string;
  processing_fee_account?: string;
  penalty_income_account?: string;
}

interface ChartOfAccount {
  id: number;
  code: string;
  name: string;
  type: string;
}

interface FormData {
  name: string;
  code: string;
  description: string;
  interest_type: 'flat' | 'reducing';
  interest_rate: number;
  min_loan_amount: number;
  max_loan_amount: number;
  min_tenure: number;
  max_tenure: number;
  processing_fee_rate: number;
  penalty_rate: number;
  coa_loan_asset: number;
  coa_interest_income: number;
  coa_processing_fee: number;
  coa_penalty_income: number;
}

const LoanProductConfig: React.FC = () => {
  const [products, setProducts] = useState<LoanProduct[]>([]);
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<LoanProduct | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  useEffect(() => {
    fetchProducts();
    fetchChartOfAccounts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/loan-products');
      setProducts(response.data.data);
    } catch (error) {
      console.error('Error fetching loan products:', error);
    }
  };

  const fetchChartOfAccounts = async () => {
    try {
      const response = await api.get('/chart-of-accounts');
      // Filter for relevant account types (asset and income accounts)
      const relevantAccounts = response.data.data.filter((account: ChartOfAccount) => 
        account.type === 'asset' || account.type === 'income'
      );
      setAccounts(relevantAccounts);
    } catch (error) {
      console.error('Error fetching chart of accounts:', error);
    }
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      if (editingProduct) {
        await api.put(`/loan-products/${editingProduct.id}`, data);
      } else {
        await api.post('/loan-products', data);
      }
      await fetchProducts();
      resetForm();
    } catch (error) {
      console.error('Error saving loan product:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    reset();
    setShowForm(false);
    setEditingProduct(null);
  };

  const editProduct = (product: LoanProduct) => {
    setEditingProduct(product);
    setShowForm(true);
    reset({
      name: product.name,
      code: product.code,
      description: product.description,
      interest_type: product.interest_type,
      interest_rate: product.interest_rate,
      min_loan_amount: product.min_loan_amount,
      max_loan_amount: product.max_loan_amount,
      min_tenure: product.min_tenure,
      max_tenure: product.max_tenure,
      processing_fee_rate: product.processing_fee_rate,
      penalty_rate: product.penalty_rate,
      coa_loan_asset: product.coa_loan_asset,
      coa_interest_income: product.coa_interest_income,
      coa_processing_fee: product.coa_processing_fee,
      coa_penalty_income: product.coa_penalty_income,
    });
  };

  const deleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this loan product?')) return;
    
    try {
      await api.delete(`/loan-products/${id}`);
      await fetchProducts();
    } catch (error) {
      console.error('Error deleting loan product:', error);
      alert('Cannot delete product with active loans');
    }
  };

  const toggleProductStatus = async (product: LoanProduct) => {
    try {
      await api.put(`/loan-products/${product.id}`, {
        ...product,
        is_active: !product.is_active
      });
      await fetchProducts();
    } catch (error) {
      console.error('Error updating product status:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Loan Products</h1>
          <p className="text-gray-600">Configure and manage loan products</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={18} />
          New Product
        </button>
      </div>

      {/* Product Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              {editingProduct ? 'Edit Loan Product' : 'New Loan Product'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
              <input
                type="text"
                {...register('name', { required: 'Product name is required' })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Code *</label>
              <input
                type="text"
                {...register('code', { required: 'Product code is required' })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                disabled={!!editingProduct}
              />
              {errors.code && <p className="text-red-600 text-sm mt-1">{errors.code.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Interest Type *</label>
              <select
                {...register('interest_type', { required: 'Interest type is required' })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="flat">Flat Rate</option>
                <option value="reducing">Reducing Balance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Interest Rate (%) *</label>
              <input
                type="number"
                step="0.01"
                {...register('interest_rate', { 
                  required: 'Interest rate is required',
                  min: { value: 0, message: 'Interest rate must be positive' }
                })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.interest_rate && <p className="text-red-600 text-sm mt-1">{errors.interest_rate.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Loan Amount *</label>
              <input
                type="number"
                step="0.01"
                {...register('min_loan_amount', { 
                  required: 'Minimum amount is required',
                  min: { value: 0, message: 'Amount must be positive' }
                })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.min_loan_amount && <p className="text-red-600 text-sm mt-1">{errors.min_loan_amount.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Loan Amount *</label>
              <input
                type="number"
                step="0.01"
                {...register('max_loan_amount', { 
                  required: 'Maximum amount is required',
                  min: { value: 0, message: 'Amount must be positive' }
                })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.max_loan_amount && <p className="text-red-600 text-sm mt-1">{errors.max_loan_amount.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Tenure (Months) *</label>
              <input
                type="number"
                {...register('min_tenure', { 
                  required: 'Minimum tenure is required',
                  min: { value: 1, message: 'Minimum tenure is 1 month' }
                })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.min_tenure && <p className="text-red-600 text-sm mt-1">{errors.min_tenure.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Tenure (Months) *</label>
              <input
                type="number"
                {...register('max_tenure', { 
                  required: 'Maximum tenure is required',
                  min: { value: 1, message: 'Maximum tenure must be at least 1 month' }
                })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.max_tenure && <p className="text-red-600 text-sm mt-1">{errors.max_tenure.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Processing Fee Rate (%) *</label>
              <input
                type="number"
                step="0.01"
                {...register('processing_fee_rate', { 
                  required: 'Processing fee rate is required',
                  min: { value: 0, message: 'Fee rate must be positive' }
                })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.processing_fee_rate && <p className="text-red-600 text-sm mt-1">{errors.processing_fee_rate.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Penalty Rate (%) *</label>
              <input
                type="number"
                step="0.01"
                {...register('penalty_rate', { 
                  required: 'Penalty rate is required',
                  min: { value: 0, message: 'Penalty rate must be positive' }
                })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.penalty_rate && <p className="text-red-600 text-sm mt-1">{errors.penalty_rate.message}</p>}
            </div>

            {/* Chart of Accounts Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loan Asset Account *</label>
              <select
                {...register('coa_loan_asset', { required: 'Loan asset account is required' })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Account</option>
                {accounts.filter(a => a.type === 'asset').map(account => (
                  <option key={account.id} value={account.id}>
                    {account.code} - {account.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Interest Income Account *</label>
              <select
                {...register('coa_interest_income', { required: 'Interest income account is required' })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Account</option>
                {accounts.filter(a => a.type === 'income').map(account => (
                  <option key={account.id} value={account.id}>
                    {account.code} - {account.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Processing Fee Account *</label>
              <select
                {...register('coa_processing_fee', { required: 'Processing fee account is required' })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Account</option>
                {accounts.filter(a => a.type === 'income').map(account => (
                  <option key={account.id} value={account.id}>
                    {account.code} - {account.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Penalty Income Account *</label>
              <select
                {...register('coa_penalty_income', { required: 'Penalty income account is required' })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Account</option>
                {accounts.filter(a => a.type === 'income').map(account => (
                  <option key={account.id} value={account.id}>
                    {account.code} - {account.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
              >
                <Save size={18} />
                {loading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Create Product')}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Products List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Loan Products List</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Interest Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loan Range</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenure</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.code}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {product.interest_rate}% {product.interest_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    GHS {product.min_loan_amount.toLocaleString()} - {product.max_loan_amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {product.min_tenure} - {product.max_tenure} months
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleProductStatus(product)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => editProduct(product)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default LoanProductConfig;
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, ToggleLeft, ToggleRight } from 'lucide-react';
import { loanService } from '../../../services/loanService';
import type { LoanProductType } from '../../../types/loan';

const LoanProductsList: React.FC = () => {
  const [products, setProducts] = useState<LoanProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<LoanProductType | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await loanService.getLoanProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProductStatus = async (productId: number, currentStatus: boolean) => {
    try {
      // You'll need an API endpoint to update product status
      // await loanService.updateLoanProduct(productId, { is_active: !currentStatus });
      await loadProducts(); // Reload to reflect changes
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading products...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Loan Products</h3>
        <button
          onClick={() => setShowProductForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Product
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-lg font-semibold text-gray-900">{product.name}</h4>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingProduct(product)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => toggleProductStatus(product.id, product.is_active)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  {product.is_active ? (
                    <ToggleRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ToggleLeft className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Code:</span>
                <span className="font-medium">{product.code}</span>
              </div>
              <div className="flex justify-between">
                <span>Interest Rate:</span>
                <span className="font-medium">{product.interest_rate}%</span>
              </div>
              <div className="flex justify-between">
                <span>Amount Range:</span>
                <span className="font-medium">
                  GHS {product.min_amount.toLocaleString()} - {product.max_amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Term Range:</span>
                <span className="font-medium">
                  {product.min_term} - {product.max_term} months
                </span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={`font-medium ${
                  product.is_active ? 'text-green-600' : 'text-red-600'
                }`}>
                  {product.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No loan products found</p>
        </div>
      )}

      {showProductForm && (
        <LoanProductForm
          onClose={() => setShowProductForm(false)}
          onSave={loadProducts}
        />
      )}

      {editingProduct && (
        <LoanProductForm
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={loadProducts}
        />
      )}
    </div>
  );
};

// Loan Product Form Component
const LoanProductForm: React.FC<{
  product?: LoanProductType;
  onClose: () => void;
  onSave: () => void;
}> = ({ product, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: product?.name || '',
    code: product?.code || '',
    interest_rate: product?.interest_rate || '',
    interest_type: product?.interest_type || 'reducing',
    min_amount: product?.min_amount || '',
    max_amount: product?.max_amount || '',
    min_term: product?.min_term || '',
    max_term: product?.max_term || '',
    penalty_rate: product?.penalty_rate || '0',
    is_active: product?.is_active ?? true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        interest_rate: Number(formData.interest_rate),
        min_amount: Number(formData.min_amount),
        max_amount: Number(formData.max_amount),
        min_term: Number(formData.min_term),
        max_term: Number(formData.max_term),
        penalty_rate: Number(formData.penalty_rate)
      };

      if (product) {
        // Update existing product
        // await loanService.updateLoanProduct(product.id, data);
      } else {
        // Create new product
        await loanService.createLoanProduct(data);
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">
            {product ? 'Edit Loan Product' : 'New Loan Product'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Code
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interest Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.interest_rate}
                onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interest Type
              </label>
              <select
                value={formData.interest_type}
                onChange={(e) => setFormData({ ...formData, interest_type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="reducing">Reducing Balance</option>
                <option value="flat">Flat Rate</option>
                <option value="compound">Compound</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Amount (GHS)
              </label>
              <input
                type="number"
                required
                value={formData.min_amount}
                onChange={(e) => setFormData({ ...formData, min_amount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Amount (GHS)
              </label>
              <input
                type="number"
                required
                value={formData.max_amount}
                onChange={(e) => setFormData({ ...formData, max_amount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Term (months)
              </label>
              <input
                type="number"
                required
                value={formData.min_term}
                onChange={(e) => setFormData({ ...formData, min_term: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Term (months)
              </label>
              <input
                type="number"
                required
                value={formData.max_term}
                onChange={(e) => setFormData({ ...formData, max_term: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Penalty Rate (%)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.penalty_rate}
              onChange={(e) => setFormData({ ...formData, penalty_rate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">Active Product</label>
          </div>

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
              {loading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanProductsList;
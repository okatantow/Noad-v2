// components/loans/LoanApplicationsList.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, CheckCircle, XCircle, Clock, Eye, DollarSign } from 'lucide-react';
import { api } from '../../../services/api';

interface LoanApplication {
  id: number;
  application_number: string;
  customer_id: number;
  loan_product_id: number;
  servicing_account_id: number;
  applied_amount: number;
  approved_amount: number | null;
  purpose: string;
  tenure_months: number;
  application_date: string;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed' | 'closed';
  approved_by: number | null;
  approved_date: string | null;
  rejection_reason: string | null;
  customer_number: string;
  first_name: string;
  last_name: string;
  loan_product_name: string;
  servicing_account: string;
  approved_by_name: string | null;
}

interface LoanApplicationsListProps {
  setCurrentPage: (page: string) => void;
  setSelectedApplicationId?: (id: number) => void;
}

const LoanApplicationsList: React.FC<LoanApplicationsListProps> = ({ 
  setCurrentPage, 
  setSelectedApplicationId 
}) => {
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter]);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/loan-applications');
      setApplications(response.data.data);
    } catch (error) {
      console.error('Error fetching loan applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.application_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.customer_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.last_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    setFilteredApplications(filtered);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
      disbursed: { color: 'bg-blue-100 text-blue-800', icon: DollarSign },
      closed: { color: 'bg-gray-100 text-gray-800', icon: CheckCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleApprove = async (applicationId: number) => {
    const amount = prompt('Enter approved amount:');
    if (!amount) return;

    try {
      // This would require getting the current user ID from your auth context
      const approvedBy = 1; // Replace with actual user ID from context
      await api.put(`/loan-applications/${applicationId}/approve`, {
        approved_amount: parseFloat(amount),
        approved_by: approvedBy
      });
      await fetchApplications();
      alert('Application approved successfully!');
    } catch (error) {
      console.error('Error approving application:', error);
      alert('Failed to approve application');
    }
  };

  const handleReject = async (applicationId: number) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      const rejectedBy = 1; // Replace with actual user ID from context
      await api.put(`/loan-applications/${applicationId}/reject`, {
        rejection_reason: reason,
        rejected_by: rejectedBy
      });
      await fetchApplications();
      alert('Application rejected successfully!');
    } catch (error) {
      console.error('Error rejecting application:', error);
      alert('Failed to reject application');
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Loan Applications</h1>
          <p className="text-gray-600">Manage and review loan applications</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="disbursed">Disbursed</option>
            </select>
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center gap-2">
              <Filter size={16} />
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Application #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenure</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredApplications.map((application) => (
                <tr key={application.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {application.application_number}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {application.first_name} {application.last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {application.customer_number}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {application.loan_product_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>
                      <div>Applied: GHS {application.applied_amount.toLocaleString()}</div>
                      {application.approved_amount && (
                        <div className="text-green-600">
                          Approved: GHS {application.approved_amount.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {application.tenure_months} months
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(application.status)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(application.application_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      {/* <button
                        onClick={() => setSelectedApplicationId && setSelectedApplicationId(application.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button> */}
                      <button
  onClick={() => {
    setCurrentPage('application-details');
    setSelectedApplicationId && setSelectedApplicationId(application.id);
  }}
  className="text-blue-600 hover:text-blue-900"
  title="View Details"
>
  <Eye size={16} />
</button>
                      
                      {application.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(application.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Approve"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => handleReject(application.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Reject"
                          >
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                      
                      {/* {application.status === 'approved' && (
                        <button
                          onClick={() => {
                            // Navigate to disbursement page
                            setCurrentPage('loan-disbursement');
                            setSelectedApplicationId && setSelectedApplicationId(application.id);
                          }}
                          className="text-purple-600 hover:text-purple-900"
                          title="Disburse Loan"
                        >
                          <DollarSign size={16} />
                        </button>
                      )} */}

                      {application.status === 'approved' && (
  <button
    onClick={() => {
      setCurrentPage('loan-disbursement');
      setSelectedApplicationId && setSelectedApplicationId(application.id);
    }}
    className="text-purple-600 hover:text-purple-900"
    title="Disburse Loan"
  >
    <DollarSign size={16} />
  </button>
)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredApplications.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No loan applications found</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LoanApplicationsList;
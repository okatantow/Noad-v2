// components/loans/application/ApplicationDetails.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, DollarSign, User, FileText, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
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

interface ApplicationDetailsProps {
  setCurrentPage: (page: string) => void;
  selectedApplicationId: number;
}

const ApplicationDetails: React.FC<ApplicationDetailsProps> = ({ setCurrentPage, selectedApplicationId }) => {
  const [application, setApplication] = useState<LoanApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchApplicationDetails();
  }, [selectedApplicationId]);

  const fetchApplicationDetails = async () => {
    try {
      const response = await api.get('/loan-applications');
      const applications = response.data.data;
      const selectedApp = applications.find((app: LoanApplication) => app.id === selectedApplicationId);
      setApplication(selectedApp || null);
    } catch (error) {
      console.error('Error fetching application details:', error);
    } finally {
      setLoading(false);
    }
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

  const handleApprove = async () => {
    const amount = prompt('Enter approved amount:');
    if (!amount || isNaN(parseFloat(amount))) {
      alert('Please enter a valid amount');
      return;
    }

    setActionLoading(true);
    try {
      const approvedBy = 1; // Replace with actual user ID from context
      await api.put(`/loan-applications/${selectedApplicationId}/approve`, {
        approved_amount: parseFloat(amount),
        approved_by: approvedBy
      });
      await fetchApplicationDetails();
      alert('Application approved successfully!');
    } catch (error: any) {
      console.error('Error approving application:', error);
      alert(error.response?.data?.message || 'Failed to approve application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    setActionLoading(true);
    try {
      const rejectedBy = 1; // Replace with actual user ID from context
      await api.put(`/loan-applications/${selectedApplicationId}/reject`, {
        rejection_reason: reason,
        rejected_by: rejectedBy
      });
      await fetchApplicationDetails();
      alert('Application rejected successfully!');
    } catch (error: any) {
      console.error('Error rejecting application:', error);
      alert(error.response?.data?.message || 'Failed to reject application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisburse = () => {
    setCurrentPage('loan-disbursement');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Application not found</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setCurrentPage('applications')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            <span>Back to Applications</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Application Details</h1>
            <p className="text-gray-600">{application.application_number}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {getStatusBadge(application.status)}
        </div>
      </div>

      {/* Application Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {application.first_name} {application.last_name}
                  </p>
                  <p className="text-sm text-gray-500">{application.customer_number}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{application.loan_product_name}</p>
                  <p className="text-sm text-gray-500">Product</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(application.application_date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">Application Date</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Application Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Application Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Applied Amount</label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-lg font-bold text-gray-900">
                  GHS {application.applied_amount.toLocaleString()}
                </p>
              </div>
            </div>

            {application.approved_amount && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Approved Amount</label>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-lg font-bold text-green-900">
                    GHS {application.approved_amount.toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tenure</label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-900">{application.tenure_months} months</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Servicing Account</label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-900">{application.servicing_account}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loan Purpose</label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg min-h-[100px]">
                <p className="text-gray-900 whitespace-pre-wrap">{application.purpose}</p>
              </div>
            </div>

            {application.approved_by_name && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Approved By</label>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-900">{application.approved_by_name}</p>
                  {application.approved_date && (
                    <p className="text-sm text-green-700 mt-1">
                      on {new Date(application.approved_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            )}

            {application.rejection_reason && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Reason</label>
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-900">{application.rejection_reason}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {application.status === 'pending' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Application Actions</h3>
          <div className="flex space-x-4">
            <button
              onClick={handleApprove}
              disabled={actionLoading}
              className="px-6 py-3 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle size={18} />
              {actionLoading ? 'Approving...' : 'Approve Application'}
            </button>
            <button
              onClick={handleReject}
              disabled={actionLoading}
              className="px-6 py-3 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-50"
            >
              <XCircle size={18} />
              {actionLoading ? 'Rejecting...' : 'Reject Application'}
            </button>
          </div>
        </div>
      )}

      {application.status === 'approved' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Ready for Disbursement</h3>
          <div className="flex space-x-4">
            <button
              onClick={handleDisburse}
              className="px-6 py-3 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <DollarSign size={18} />
              Disburse Loan
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            This application has been approved and is ready for disbursement. Click above to proceed with loan disbursement.
          </p>
        </div>
      )}

      {/* Status History */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Status History</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="text-blue-900">Application Submitted</span>
            </div>
            <span className="text-blue-700 text-sm">
              {new Date(application.application_date).toLocaleDateString()}
            </span>
          </div>

          {application.approved_date && (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-900">Application Approved</span>
              </div>
              <span className="text-green-700 text-sm">
                {new Date(application.approved_date).toLocaleDateString()}
              </span>
            </div>
          )}

          {application.status === 'disbursed' && (
            <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <DollarSign className="h-5 w-5 text-purple-600" />
                <span className="text-purple-900">Loan Disbursed</span>
              </div>
              <span className="text-purple-700 text-sm">Completed</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ApplicationDetails;
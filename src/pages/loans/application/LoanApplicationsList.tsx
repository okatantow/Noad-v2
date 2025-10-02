import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Eye, DollarSign } from 'lucide-react';
import { loanService } from '../../../services/loanService';
import type { LoanApplicationType } from '../../../types/loan';

const LoanApplicationsList: React.FC = () => {
  const [applications, setApplications] = useState<LoanApplicationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<LoanApplicationType | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const data = await loanService.getLoanApplications();
      setApplications(data);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading applications...</div>;
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => (
        <motion.div
          key={application.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                {getStatusIcon(application.status)}
                <h4 className="text-lg font-semibold text-gray-900">
                  {application.application_number}
                </h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                  {application.status.replace('_', ' ')}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div>
                  <strong>Customer:</strong>{' '}
                  {application.customer ? 
                    `${application.customer.first_name} ${application.customer.last_name}` : 
                    'Loading...'
                  }
                </div>
                <div>
                  <strong>Amount:</strong> GHS {application.applied_amount.toLocaleString()}
                </div>
                <div>
                  <strong>Applied:</strong> {new Date(application.applied_date).toLocaleDateString()}
                </div>
              </div>

              {application.purpose && (
                <p className="text-sm text-gray-600 mt-2">
                  <strong>Purpose:</strong> {application.purpose}
                </p>
              )}
            </div>

            <div className="flex space-x-2 ml-4">
              <button
                onClick={() => setSelectedApplication(application)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                title="View Details"
              >
                <Eye className="h-4 w-4" />
              </button>
              
              {application.status === 'pending' && (
                <>
                  <button
                    onClick={() => {/* Handle approve */}}
                    className="p-2 text-green-400 hover:text-green-600 rounded-lg hover:bg-green-50"
                    title="Approve"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {/* Handle reject */}}
                    className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                    title="Reject"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      ))}

      {applications.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <DollarSign className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>No loan applications found</p>
        </div>
      )}

      {/* Application Detail Modal */}
      {selectedApplication && (
        <ApplicationDetailModal
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
          onStatusChange={loadApplications}
        />
      )}
    </div>
  );
};

// Application Detail Modal Component
const ApplicationDetailModal: React.FC<{
  application: LoanApplicationType;
  onClose: () => void;
  onStatusChange: () => void;
}> = ({ application, onClose, onStatusChange }) => {
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [approvalData, setApprovalData] = useState({
    approved_amount: application.applied_amount.toString(),
    interest_rate: '',
    term_months: application.term_months?.toString() || ''
  });

  const handleApprove = async () => {
    setApproving(true);
    try {
      await loanService.approveLoanApplication(application.id, {
        approved_amount: Number(approvalData.approved_amount),
        interest_rate: Number(approvalData.interest_rate),
        term_months: Number(approvalData.term_months)
      });
      onStatusChange();
      onClose();
    } catch (error) {
      console.error('Error approving application:', error);
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    setRejecting(true);
    try {
      await loanService.rejectLoanApplication(application.id, 'Rejected by loan officer');
      onStatusChange();
      onClose();
    } catch (error) {
      console.error('Error rejecting application:', error);
    } finally {
      setRejecting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Application Details</h3>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Application details display */}
          <div className="grid grid-cols-2 gap-4">
            <div><strong>Application #:</strong> {application.application_number}</div>
            <div><strong>Status:</strong> {application.status}</div>
            <div><strong>Applied Amount:</strong> GHS {application.applied_amount.toLocaleString()}</div>
            <div><strong>Applied Date:</strong> {new Date(application.applied_date).toLocaleDateString()}</div>
          </div>

          {application.status === 'pending' && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Approve Application</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Approved Amount</label>
                  <input
                    type="number"
                    value={approvalData.approved_amount}
                    onChange={(e) => setApprovalData({ ...approvalData, approved_amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={approvalData.interest_rate}
                    onChange={(e) => setApprovalData({ ...approvalData, interest_rate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Term (months)</label>
                  <input
                    type="number"
                    value={approvalData.term_months}
                    onChange={(e) => setApprovalData({ ...approvalData, term_months: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Close
            </button>
            {application.status === 'pending' && (
              <>
                <button
                  onClick={handleReject}
                  disabled={rejecting}
                  className="px-4 py-2 text-red-700 bg-red-100 rounded-lg hover:bg-red-200 disabled:opacity-50"
                >
                  {rejecting ? 'Rejecting...' : 'Reject'}
                </button>
                <button
                  onClick={handleApprove}
                  disabled={approving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {approving ? 'Approving...' : 'Approve'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanApplicationsList;
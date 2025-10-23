import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  FileText, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import LoanProductsList from './products/LoanProductsList';
import LoanList from './products/LoanList';
import LoanApplicationsList from './application/LoanApplicationsList';
import LoanApplicationForm from './application/LoadApplicationForm';
import type { LoanApplicationType } from '../../types/loan';

const LoanDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'loans' | 'products'>('overview');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Loan Management</h1>
          <p className="text-gray-600">Manage loan applications, disbursements, and repayments</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<DollarSign className="h-8 w-8 text-green-600" />}
            title="Total Loan Portfolio"
            value="GHS 2,450,000"
            change="+12.5%"
            changeType="positive"
          />
          <StatCard
            icon={<FileText className="h-8 w-8 text-blue-600" />}
            title="Pending Applications"
            value="24"
            change="+3"
            changeType="neutral"
          />
          <StatCard
            icon={<AlertTriangle className="h-8 w-8 text-red-600" />}
            title="Loans in Default"
            value="8"
            change="+2"
            changeType="negative"
          />
          <StatCard
            icon={<TrendingUp className="h-8 w-8 text-purple-600" />}
            title="Recovery Rate"
            value="94.2%"
            change="+1.2%"
            changeType="positive"
          />
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: 'overview', name: 'Overview', icon: TrendingUp },
                { id: 'applications', name: 'Applications', icon: FileText },
                { id: 'loans', name: 'Active Loans', icon: DollarSign },
                { id: 'products', name: 'Loan Products', icon: CheckCircle },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-4 px-6 text-center font-medium text-sm border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4 inline-block mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'applications' && <ApplicationsTab />}
            {activeTab === 'loans' && <ActiveLoansTab />}
            {activeTab === 'products' && <LoanProductsTab />}
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
}> = ({ icon, title, value, change, changeType }) => {
  const changeColor = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600'
  }[changeType];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className={`text-sm ${changeColor} mt-1`}>{change} from last month</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

// Tab Components
const OverviewTab: React.FC = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      {/* Recent activity list would go here */}
    </div>
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Health</h3>
      {/* Portfolio health chart would go here */}
    </div>
  </div>
);

const ApplicationsTab: React.FC = () => {
  const [applications, setApplications] = useState<LoanApplicationType[]>([]);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Loan Applications</h3>
        <button
          onClick={() => setShowApplicationForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          New Application
        </button>
      </div>

      {showApplicationForm && (
        <LoanApplicationForm onClose={() => setShowApplicationForm(false)} />
      )}

      <LoanApplicationsList />
    </div>
  );
};

const ActiveLoansTab: React.FC = () => (
  <div>
    <h3 className="text-lg font-semibold text-gray-900 mb-6">Active Loans</h3>
    <LoanList />
  </div>
);

const LoanProductsTab: React.FC = () => (
  <div>
    <h3 className="text-lg font-semibold text-gray-900 mb-6">Loan Products</h3>
    <LoanProductsList />
  </div>
);

export default LoanDashboard;
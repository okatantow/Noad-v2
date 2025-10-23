// components/loans/LoanDashboard.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Plus,
  FileText,
  List
} from 'lucide-react';
import { api } from '../../services/api';

interface LoanStats {
  totalLoans: number;
  activeLoans: number;
  totalPortfolio: number;
  overdueLoans: number;
  pendingApplications: number;
  monthlyRepayment: number;
}

interface LoanDashboardProps {
  setCurrentPage: (page: string) => void;
  setSelectedLoanId?: (id: number) => void;
}

const LoanDashboard: React.FC<LoanDashboardProps> = ({ setCurrentPage, setSelectedLoanId }) => {
  const [stats, setStats] = useState<LoanStats>({
    totalLoans: 0,
    activeLoans: 0,
    totalPortfolio: 0,
    overdueLoans: 0,
    pendingApplications: 0,
    monthlyRepayment: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoanStats();
  }, []);

  const fetchLoanStats = async () => {
    try {
      const response = await api.get('/loans/dashboard-stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching loan stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    trend?: string;
  }> = ({ title, value, icon, color, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && <p className="text-xs text-gray-500 mt-1">{trend}</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Loan Dashboard</h1>
          <p className="text-gray-600">Overview of loan portfolio and performance</p>
        </div>
        <button
          onClick={() => setCurrentPage('products')}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
        >
          <List size={18} />
          Manage Loan Products
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Loan Portfolio"
          value={`GHS ${stats.totalPortfolio.toLocaleString()}`}
          icon={<DollarSign className="h-6 w-6 text-white" />}
          color="bg-green-500"
          trend="+12% from last month"
        />
        
        <StatCard
          title="Active Loans"
          value={stats.activeLoans}
          icon={<Users className="h-6 w-6 text-white" />}
          color="bg-blue-500"
          trend="+5 new this month"
        />
        
        <StatCard
          title="Pending Applications"
          value={stats.pendingApplications}
          icon={<Clock className="h-6 w-6 text-white" />}
          color="bg-yellow-500"
          trend="Awaiting approval"
        />
        
        <StatCard
          title="Overdue Loans"
          value={stats.overdueLoans}
          icon={<AlertTriangle className="h-6 w-6 text-white" />}
          color="bg-red-500"
          trend="Requires attention"
        />
        
        <StatCard
          title="Monthly Repayment"
          value={`GHS ${stats.monthlyRepayment.toLocaleString()}`}
          icon={<TrendingUp className="h-6 w-6 text-white" />}
          color="bg-purple-500"
          trend="Due this month"
        />
        
        <StatCard
          title="Total Loans"
          value={stats.totalLoans}
          icon={<CheckCircle className="h-6 w-6 text-white" />}
          color="bg-indigo-500"
          trend="All time"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setCurrentPage('application')}
          className="bg-blue-600 text-white p-4 rounded-lg text-center hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-8 w-8 mx-auto mb-2" />
          <p className="font-medium">New Application</p>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setCurrentPage('loan-repayment')}
          className="bg-green-600 text-white p-4 rounded-lg text-center hover:bg-green-700 transition-colors"
        >
          <DollarSign className="h-8 w-8 mx-auto mb-2" />
          <p className="font-medium">Process Repayment</p>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setCurrentPage('applications')}
          className="bg-purple-600 text-white p-4 rounded-lg text-center hover:bg-purple-700 transition-colors"
        >
          <FileText className="h-8 w-8 mx-auto mb-2" />
          <p className="font-medium">View Applications</p>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setCurrentPage('active-loans')}
          className="bg-orange-600 text-white p-4 rounded-lg text-center hover:bg-orange-700 transition-colors"
        >
          <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
          <p className="font-medium">Active Loans</p>
        </motion.button>
      </div>
    </div>
  );
};

export default LoanDashboard;
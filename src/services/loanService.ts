import { api } from "./api";
import type { 
  LoanProductType, 
  LoanApplicationType, 
  LoanType, 
  RepaymentScheduleType,
  LoanTransactionType 
} from "../types/loan";

export const loanService = {
  // Loan Products
  getLoanProducts: async (): Promise<LoanProductType[]> => {
    const response = await api.get('/loan-products');
    return response.data.data;
  },

  createLoanProduct: async (data: Partial<LoanProductType>): Promise<LoanProductType> => {
    const response = await api.post('/loan-products', data);
    return response.data.data;
  },

  // Loan Applications
  applyForLoan: async (data: {
    customer_id: number;
    loan_product_id: number;
    applied_amount: number;
    purpose: string;
    term_months: number;
  }): Promise<LoanApplicationType> => {
    const response = await api.post('/loan-applications/apply', data);
    return response.data.data;
  },

  getLoanApplications: async (status?: string): Promise<LoanApplicationType[]> => {
    const url = status ? `/loan-applications?status=${status}` : '/loan-applications';
    const response = await api.get(url);
    return response.data.data;
  },

  approveLoanApplication: async (applicationId: number, data: {
    approved_amount: number;
    interest_rate: number;
    term_months: number;
  }): Promise<{ loan_number: string; loan_id: number }> => {
    const response = await api.post(`/loan-applications/${applicationId}/approve`, data);
    return response.data.data;
  },

  rejectLoanApplication: async (applicationId: number, reason: string): Promise<void> => {
    await api.post(`/loan-applications/${applicationId}/reject`, { reason });
  },

  // Loans
  getLoans: async (status?: string): Promise<LoanType[]> => {
    const url = status ? `/loans?status=${status}` : '/loans';
    const response = await api.get(url);
    return response.data.data;
  },

  getLoanDetails: async (loanId: number): Promise<LoanType> => {
    const response = await api.get(`/loans/${loanId}`);
    return response.data.data;
  },

  disburseLoan: async (loanId: number, data: {
    disbursement_method: 'cash' | 'cheque' | 'bank_transfer';
    disbursement_account?: number;
    reference?: string;
  }): Promise<any> => {
    const response = await api.post(`/loans/${loanId}/disburse`, data);
    return response.data.data;
  },

  // Repayments
  getRepaymentSchedule: async (loanId: number): Promise<RepaymentScheduleType[]> => {
    const response = await api.get(`/loans/${loanId}/repayment-schedule`);
    return response.data.data.repayment_schedule;
  },

  processRepayment: async (loanId: number, data: {
    amount: number;
    payment_method: 'cash' | 'cheque' | 'bank_transfer';
    reference: string;
    repayment_date: string;
  }): Promise<any> => {
    const response = await api.post(`/loans/${loanId}/repay`, data);
    return response.data.data;
  },

  // Default Management
  markAsDefault: async (loanId: number): Promise<any> => {
    const response = await api.post(`/loans/${loanId}/mark-default`);
    return response.data.data;
  },

  writeOffLoan: async (loanId: number, data: {
    write_off_amount: number;
    write_off_reason: string;
  }): Promise<any> => {
    const response = await api.post(`/loans/${loanId}/write-off`, data);
    return response.data.data;
  },

  // Transactions
  getLoanTransactions: async (loanId: number): Promise<LoanTransactionType[]> => {
    const response = await api.get(`/loans/${loanId}/transactions`);
    return response.data.data.transactions;
  }
};
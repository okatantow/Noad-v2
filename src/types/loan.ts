export type LoanProductType = {
  id: number;
  name: string;
  code: string;
  interest_rate: number;
  interest_type: 'flat' | 'reducing' | 'compound';
  min_amount: number;
  max_amount: number;
  min_term: number;
  max_term: number;
  penalty_rate: number;
  is_active: boolean;
};

export type LoanApplicationStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'disbursed';

export type LoanApplicationType = {
  id: number;
  application_number: string;
  customer_id: number;
  loan_product_id: number;
  applied_amount: number;
  approved_amount?: number;
  purpose: string;
  status: LoanApplicationStatus;
  applied_date: string;
  approved_date?: string;
  approved_by?: number;
  interest_rate?: number;
  term_months?: number;
  rejection_reason?: string;
  customer?: CustomerType;
  loan_product?: LoanProductType;
};

export type LoanStatus = 'active' | 'closed' | 'defaulted' | 'written_off';

export type LoanType = {
  id: number;
  loan_application_id: number;
  loan_number: string;
  ledger_id: number;
  customer_id: number;
  loan_product_id: number;
  principal_amount: number;
  interest_rate: number;
  total_interest: number;
  total_amount: number;
  term_months: number;
  start_date: string;
  end_date: string;
  disbursement_date?: string;
  status: LoanStatus;
  outstanding_principal: number;
  outstanding_interest: number;
  days_in_arrears: number;
  customer?: CustomerType;
  loan_product?: LoanProductType;
  repayment_schedule?: RepaymentScheduleType[];
};

export type RepaymentScheduleType = {
  id: number;
  loan_id: number;
  installment_number: number;
  due_date: string;
  principal_amount: number;
  interest_amount: number;
  total_due: number;
  principal_paid: number;
  interest_paid: number;
  penalty_amount: number;
  penalty_paid: number;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  paid_date?: string;
};

export type LoanTransactionType = {
  id: number;
  loan_id: number;
  transaction_type: 'disbursement' | 'repayment' | 'penalty' | 'write_off' | 'restructure';
  amount: number;
  principal_amount: number;
  interest_amount: number;
  penalty_amount: number;
  transaction_date: string;
  reference: string;
  description: string;
};

export type CustomerType = {
  id: number;
  customer_number: string;
  first_name: string;
  last_name: string;
  telephone_number: string;
  status: string;
};
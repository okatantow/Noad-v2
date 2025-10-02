export type ChartOfAccountType = {
  id?: number;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
  parent_id: number | null;
  description: string;
  is_active: boolean;
  is_customer_account: boolean;
};

export type ChartOfAccountAddUpdateProps = {
  accountId?: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<string>>;
};

export type FormData = {
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
  parent_id: number | null;
  description: string;
  is_active: boolean;
  is_customer_account: boolean;
};
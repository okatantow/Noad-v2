import { api } from "./api";

export type AccountType = {
  id?: number;
  account_number: string;
  customer_id: number;
  coa_id: number;
  balance: number;
  overdraft_limit: number;
  type: 'current' | 'susu' | 'loan' | 'fixed_deposit';
  created_at?: string;
  updated_at?: string;
  coa_name?: string;
  coa_code?: string;
};

export type ChartOfAccount = {
  id: number;
  code: string;
  name: string;
  type: string;
  parent_id: number | null;
  description: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export const getCustomerAccounts = async (customerId: number) => {
  return await api.get(`/customers/${customerId}/accounts`);
};

export const getChartOfAccounts = async () => {
  return await api.get("/get_charts-of-accounts");
};

export const getActiveChartOfAccounts = async () => {
  return await api.get("/get_active_charts-of-accounts");
};

export const createAccount = async (accountData: Omit<AccountType, 'id' | 'created_at' | 'updated_at'>) => {
  return await api.post("/accounts", accountData);
};

export const updateAccount = async (accountId: number, accountData: Partial<AccountType>) => {
  return await api.put(`/accounts/${accountId}`, accountData);
};

export const deleteAccount = async (accountId: number) => {
  return await api.delete(`/accounts/${accountId}`);
};

export const generateAccountNumber = async (type: string, customerId: number) => {
  return await api.get(`/accounts/generate-number?type=${type}&customer_id=${customerId}`);
};
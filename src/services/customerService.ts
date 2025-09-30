// services/customerService.ts
import { api } from './api';

// Customer Number Generation Functions
export const generateRandomCustomerNumber = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const checkCustomerNumberExists = async (customerNumber: string): Promise<boolean> => {
  try {
    const response = await api.get(`/customers/check-number/${customerNumber}`);
    return response.data.exists;
  } catch (error) {
    console.error('Error checking customer number:', error);
    return false;
  }
};

export const generateUniqueCustomerNumber = async (): Promise<string> => {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const candidate = generateRandomCustomerNumber();
    
    try {
      const exists = await checkCustomerNumberExists(candidate);
      if (!exists) {
        return candidate;
      }
    } catch (error) {
      console.error('Error checking customer number existence:', error);
    }
    
    attempts++;
  }
  
  throw new Error('Unable to generate unique customer number after maximum attempts');
};

export const generateCustomerNumber = async (strategy: 'random' | 'unique' = 'unique'): Promise<string> => {
  try {
    if (strategy === 'unique') {
      return await generateUniqueCustomerNumber();
    } else {
      return generateRandomCustomerNumber();
    }
  } catch (error) {
    console.error('Customer number generation failed, falling back to random:', error);
    return generateRandomCustomerNumber();
  }
};

// Customer API functions
export const getCustomers = async () => {
  const response = await api.get("/customers");
  return response.data;
};

export const getCustomer = async (id: number) => {
  const response = await api.get(`/customers/${id}`);
  return response.data;
};

export const createCustomer = async (customerData: any) => {
  const response = await api.post("/customers", customerData);
  return response.data;
};

export const updateCustomer = async (id: number, customerData: any) => {
  const response = await api.put(`/customers/${id}`, customerData);
  return response.data;
};

export const deleteCustomer = async (id: number) => {
  const response = await api.delete(`/customers/${id}`);
  return response.data;
};

export const searchCustomers = async (query: string) => {
  const response = await api.get(`/customers/search?q=${query}`);
  return response.data;
};

export const searchCustomerByNumber = async (customerNumber: string) => {
  const response = await api.get(`/customers/search?customer_number=${customerNumber}`);
  return response.data;
};

export const getCustomerAccounts = async (customerId: number) => {
  const response = await api.get(`/customers/${customerId}/accounts`);
  return response.data;
};
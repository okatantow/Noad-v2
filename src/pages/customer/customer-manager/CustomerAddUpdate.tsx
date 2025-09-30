import React, { useEffect, useState } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Camera, Upload, Search, RefreshCw, User } from "lucide-react";
import { api } from "../../../services/api";
import { toggleToaster } from "../../../provider/features/helperSlice";
import { useDispatch } from "react-redux";
import { withPermissions } from '../../../hooks/withPermissions';
import { useAuth } from '../../../provider/contexts/AuthContext';
import { 
  generateCustomerNumber, 
  generateRandomCustomerNumber,
  getCustomer,
  getCustomerAccounts,
  searchCustomers,
  searchCustomerByNumber
} from '../../../services/customerService';

// Types
type AddressType = {
  id?: number;
  region: string;
  district: string;
  city: string;
  house_number: string;
  gph_address: string;
  address_one: string;
  address_two: string;
  home_town: string;
};

type CustomerType = {
  id?: number;
  customer_number: string;
  branch_id: number;
  address_id: number;
  title: string;
  occupation: string;
  first_name: string;
  last_name: string;
  other_name: string;
  gender: 'Male' | 'Female' | 'Other';
  picture: string;
  signature: string;
  telephone_number: string;
  next_of_kin_age: number;
  next_of_kin_occupation: string;
  next_of_kin_gender: 'Male' | 'Female' | 'Other';
  next_of_kin_address: string;
  next_of_kin_telephone_number: string;
  next_of_kin_relation: string;
  next_of_kin_name: string;
  SSNumber: string;
  id_type: 'Passport' | 'Driver\'s License' | 'National ID' | 'Other';
  id_number: string;
  passport_number: string;
  driver_license_number: string;
  marital_status: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  religion: string;
  mother_name: string;
  father_name: string;
  nationality: string;
  date_of_birth: string;
  created_by: string;
  last_updated_by: string;
  status: 'active' | 'inactive';
  address?: AddressType;
};

type AccountType = {
  id: number;
  account_number: string;
  customer_id: number;
  coa_id: number;
  balance: number;
  overdraft_limit: number;
  type: 'current' | 'susu' | 'loan' | 'fixed_deposit';
  coa_name?: string;
};

type CustomerAddUpdateProps = {
  customerId?: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<string>>;
};

type SearchResult = {
  id: number;
  customer_number: string;
  first_name: string;
  last_name: string;
  other_name: string;
};

type FormData = CustomerType & {
  region?: string;
  district?: string;
  city?: string;
  house_number?: string;
  gph_address?: string;
  address_one?: string;
  address_two?: string;
  home_town?: string;
};

// Type-safe form field component
interface FormFieldProps {
  label: string;
  name: keyof FormData;
  required?: boolean;
  type?: "text" | "date" | "number" | "email" | "tel";
  placeholder?: string;
  errors: FieldErrors<FormData>;
  children?: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  name, 
  required = false, 
  type = "text", 
  placeholder = "", 
  errors,
  children 
}) => {
  const error = errors[name];
  
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && '*'}
      </label>
      {children || (
        <input
          type={type}
          className={`w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder={placeholder}
        />
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message as string}</p>
      )}
    </div>
  );
};

const CustomerAddUpdate: React.FC<CustomerAddUpdateProps> = ({ 
  customerId, 
  setCurrentPage 
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [customerNumber, setCustomerNumber] = useState('');
  const [customerFullName, setCustomerFullName] = useState('');
  const [accounts, setAccounts] = useState<AccountType[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [captureMode, setCaptureMode] = useState<'upload' | 'camera'>('upload');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [signaturePreview, setSignaturePreview] = useState<string>('');
  const [generatingNumber, setGeneratingNumber] = useState(false);
  const [isExistingCustomer, setIsExistingCustomer] = useState(!!customerId);
  
  const dispatch = useDispatch();
  const { user } = useAuth();
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      branch_id: user?.branch || undefined,
      created_by: user?.id || 'system',
      last_updated_by: user?.id || 'system',
      status: 'active'
    }
  });

  // Generate new customer number
  const generateNewCustomerNumber = async () => {
    setGeneratingNumber(true);
    try {
      const newNumber = await generateCustomerNumber('unique');
      setValue('customer_number', newNumber);
      setCustomerNumber(newNumber);
    } catch (error) {
      console.error('Error generating customer number:', error);
      const fallbackNumber = generateRandomCustomerNumber();
      setValue('customer_number', fallbackNumber);
      setCustomerNumber(fallbackNumber);
    } finally {
      setGeneratingNumber(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [branchesRes] = await Promise.all([api.get("/branches")]);
        setBranches(branchesRes.data.data || []);

        if (customerId) {
          const customerRes = await getCustomer(customerId);
          const customer: CustomerType = customerRes.data;
          
          // Set customer form values
          Object.keys(customer).forEach(key => {
            if (key !== 'address' && customer[key as keyof CustomerType] !== undefined) {
              setValue(key as keyof FormData, customer[key as keyof CustomerType] as any);
            }
          });

          // Set address form values
          if (customer.address) {
            Object.keys(customer.address).forEach(key => {
              const addressKey = key as keyof AddressType;
              if (customer.address && customer.address[addressKey] !== undefined) {
                setValue(key as keyof FormData, customer.address[addressKey] as any);
              }
            });
          }

          setValue('last_updated_by', user?.id?.toString() || 'system');
          setCustomerNumber(customer.customer_number);
          setCustomerFullName(`${customer.first_name} ${customer.last_name} ${customer.other_name || ''}`.trim());
          setIsExistingCustomer(true);
          
          const accountsRes = await getCustomerAccounts(customerId);
          setAccounts(accountsRes.data || []);
        } else {
          await generateNewCustomerNumber();
          setValue('created_by', user?.id || 'system');
          setValue('last_updated_by', user?.id?.toString() || 'system');
          setValue('status', 'active');
          if (user?.branch) setValue('branch_id', user.branch);
          setIsExistingCustomer(false);
        }
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [customerId, setValue, user]);

  // Search functions
  const handleCustomerNumberSearch = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customerNumber) {
      try {
        setLoading(true);
        const response = await searchCustomerByNumber(customerNumber);
        if (response.data) {
          const customer = response.data;
          setValue('customer_number', customer.customer_number);
          setValue('first_name', customer.first_name);
          setValue('last_name', customer.last_name);
          setValue('other_name', customer.other_name);
          setValue('status', customer.status || 'active');
          setCustomerFullName(`${customer.first_name} ${customer.last_name} ${customer.other_name || ''}`.trim());
          setIsExistingCustomer(true);
          
          // Fetch accounts for existing customer
          const accountsRes = await getCustomerAccounts(customer.id);
          setAccounts(accountsRes.data || []);
        }
      } catch (error) {
        console.error("Error searching customer", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleNameSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      setSearchLoading(true);
      try {
        const response = await searchCustomers(query);
        setSearchResults(response.data || []);
      } catch (error) {
        console.error("Error searching customers", error);
      } finally {
        setSearchLoading(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const selectCustomer = async (customer: SearchResult) => {
    try {
      const response = await getCustomer(customer.id);
      const customerData: CustomerType = response.data;
      
      Object.keys(customerData).forEach(key => {
        if (key !== 'address' && customerData[key as keyof CustomerType] !== undefined) {
          setValue(key as keyof FormData, customerData[key as keyof CustomerType] as any);
        }
      });

      if (customerData.address) {
        Object.keys(customerData.address).forEach(key => {
          const addressKey = key as keyof AddressType;
          if (customerData.address && customerData.address[addressKey] !== undefined) {
            setValue(key as keyof FormData, customerData.address[addressKey] as any);
          }
        });
      }

      setValue('last_updated_by', user?.id?.toString() || 'system');
      setCustomerNumber(customerData.customer_number);
      setCustomerFullName(`${customerData.first_name} ${customerData.last_name} ${customerData.other_name || ''}`.trim());
      setIsExistingCustomer(true);
      setSearchModalOpen(false);
      setSearchQuery('');
      setSearchResults([]);
      
      // Fetch accounts for existing customer
      const accountsRes = await getCustomerAccounts(customer.id);
      setAccounts(accountsRes.data || []);
    } catch (error) {
      console.error("Error fetching customer details", error);
    }
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);

    // For update, the backend expects flat structure, not nested address
    const payload = customerId || isExistingCustomer 
      ? {
          // Customer fields
          customer_number: data.customer_number,
          branch_id: data.branch_id,
          title: data.title,
          occupation: data.occupation,
          first_name: data.first_name,
          last_name: data.last_name,
          other_name: data.other_name,
          gender: data.gender,
          picture: data.picture,
          signature: data.signature,
          telephone_number: data.telephone_number,
          next_of_kin_age: data.next_of_kin_age,
          next_of_kin_occupation: data.next_of_kin_occupation,
          next_of_kin_gender: data.next_of_kin_gender,
          next_of_kin_address: data.next_of_kin_address,
          next_of_kin_telephone_number: data.next_of_kin_telephone_number,
          next_of_kin_relation: data.next_of_kin_relation,
          next_of_kin_name: data.next_of_kin_name,
          SSNumber: data.SSNumber,
          id_type: data.id_type,
          id_number: data.id_number,
          passport_number: data.passport_number,
          driver_license_number: data.driver_license_number,
          marital_status: data.marital_status,
          religion: data.religion,
          mother_name: data.mother_name,
          father_name: data.father_name,
          nationality: data.nationality,
          date_of_birth: data.date_of_birth,
          status: data.status || 'active',
          last_updated_by: user?.id?.toString() || 'system', // Ensure this is string
          
          // Address fields (flat structure for update)
          region: data.region || '',
          district: data.district || '',
          city: data.city || '',
          house_number: data.house_number || '',
          gps_address: data.gph_address || '', // Map gph_address to gps_address
          address_one: data.address_one || '',
          address_two: data.address_two || '',
          home_town: data.home_town || '',
        }
      : {
          // For create - nested address structure
          customer_number: data.customer_number,
          branch_id: data.branch_id,
          title: data.title,
          occupation: data.occupation,
          first_name: data.first_name,
          last_name: data.last_name,
          other_name: data.other_name,
          gender: data.gender,
          picture: data.picture,
          signature: data.signature,
          telephone_number: data.telephone_number,
          next_of_kin_age: data.next_of_kin_age,
          next_of_kin_occupation: data.next_of_kin_occupation,
          next_of_kin_gender: data.next_of_kin_gender,
          next_of_kin_address: data.next_of_kin_address,
          next_of_kin_telephone_number: data.next_of_kin_telephone_number,
          next_of_kin_relation: data.next_of_kin_relation,
          next_of_kin_name: data.next_of_kin_name,
          SSNumber: data.SSNumber,
          id_type: data.id_type,
          id_number: data.id_number,
          passport_number: data.passport_number,
          driver_license_number: data.driver_license_number,
          marital_status: data.marital_status,
          religion: data.religion,
          mother_name: data.mother_name,
          father_name: data.father_name,
          nationality: data.nationality,
          date_of_birth: data.date_of_birth,
          status: data.status || 'active',
          created_by: user?.id || 'system',
          last_updated_by: user?.id?.toString() || 'system',
          address: {
            region: data.region || '',
            district: data.district || '',
            city: data.city || '',
            house_number: data.house_number || '',
            gps_address: data.gph_address || '', // Map gph_address to gps_address
            address_one: data.address_one || '',
            address_two: data.address_two || '',
            home_town: data.home_town || '',
          }
        };

    try {
      let response;
      if (customerId || isExistingCustomer) {
        // Use PUT for updates - get the actual customer ID
        const updateCustomerId = customerId || (await searchCustomerByNumber(data.customer_number)).data.id;
        response = await api.put(`/customers/${updateCustomerId}`, payload);
      } else {
        // Use POST for new customers
        response = await api.post("/customers", payload);
      }
      
      // Check if response indicates success
      if (response.data && response.data.status === 'success') {
        dispatch(toggleToaster({
          isOpen: true,
          toasterData: { 
            type: "success", 
            msg: `Customer ${customerId || isExistingCustomer ? "Updated" : "Added"} Successfully` 
          },
        }));
        
        setCurrentPage("list");
      } else {
        throw new Error(response.data?.message || 'Unknown error occurred');
      }
    } catch (error: any) {
      console.error("Error saving customer", error);
      console.log("Payload sent:", payload); // Debug log
      
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        let errorMessage = 'Validation failed: ';
        Object.keys(errors).forEach(key => {
          errorMessage += `${key}: ${errors[key].join(', ')}. `;
        });
        
        dispatch(toggleToaster({
          isOpen: true,
          toasterData: { type: "error", msg: errorMessage },
        }));
      } else if (error.response?.data?.message) {
        dispatch(toggleToaster({
          isOpen: true,
          toasterData: { type: "error", msg: error.response.data.message },
        }));
      } else {
        dispatch(toggleToaster({
          isOpen: true,
          toasterData: { type: "error", msg: "Failed to save customer. Please try again." },
        }));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'picture' | 'signature') => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (type === 'picture') {
          setImagePreview(result);
          setValue('picture', result);
        } else {
          setSignaturePreview(result);
          setValue('signature', result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddAccount = () => {
    // Implement account addition logic here
    console.log('Add account functionality to be implemented');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-5">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {/* Search Section */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Number</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customerNumber}
                onChange={(e) => setCustomerNumber(e.target.value)}
                onKeyPress={handleCustomerNumberSearch}
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter customer number"
              />
              {!customerId && (
                <button
                  type="button"
                  onClick={generateNewCustomerNumber}
                  disabled={generatingNumber}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  title="Generate new number"
                >
                  <RefreshCw className={`h-4 w-4 ${generatingNumber ? 'animate-spin' : ''}`} />
                </button>
              )}
              <button
                type="button"
                onClick={() => setSearchModalOpen(true)}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Search
              </button>
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Full Name</label>
            <input
              type="text"
              value={customerFullName}
              disabled
              className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
            />
          </div>
        </div>
        {/* <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="h-4 w-4" />
          <span>Logged in as: <strong>{user?.first_name} {user?.last_name}</strong> {user?.branch && `(Branch: ${user.branch})`}</span>
        </div> */}
      </div>

      {/* Tabs Section */}
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Tab Headers */}
        <div className="">
          <div className="flex bg-blue-50 p-0 rounded-t-lg">
            {/* Customer Details Tab - Always visible */}
            <a
              onClick={() => setActiveTab('details')}
              className={`flex-1 py-3 px-4 text-center font-medium text-sm cursor-pointer transition-colors ${
                activeTab === 'details'
                  ? 'bg-white text-blue-600 '
                  : 'text-blue-800 hover:text-gray-800'
              }`}
            >
              Customer Details
            </a>

            {/* Accounts Tab - Only for existing customers */}
            {isExistingCustomer && (
              <a
                onClick={() => setActiveTab('accounts')}
                className={`flex-1 py-3 px-4 text-center font-medium text-sm cursor-pointer transition-colors ${
                  activeTab === 'accounts'
                    ? 'bg-white text-blue-600 '
                    : 'text-blue-800 hover:text-gray-800'
                }`}
              >
                Accounts
              </a>
            )}

            {/* Identification Tab - Only for existing customers */}
            {isExistingCustomer && (
              <a
                onClick={() => setActiveTab('identification')}
                className={`flex-1 py-3 px-4 text-center font-medium text-sm cursor-pointer transition-colors ${
                  activeTab === 'identification'
                    ? 'bg-white text-blue-600 '
                    : 'text-blue-800 hover:text-gray-800'
                }`}
              >
                Identification
              </a>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Customer Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Status Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                    <select
                      {...register("status", { required: "Status is required" })}
                      className={`w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                        errors.status ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    {errors.status && (
                      <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                    )}
                  </div>

                  {/* Branch Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Branch *</label>
                    <select
                      {...register("branch_id", { required: "Branch is required", valueAsNumber: true })}
                      className={`w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                        errors.branch_id ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Branch</option>
                      {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name} ({branch.code})
                        </option>
                      ))}
                    </select>
                    {errors.branch_id && (
                      <p className="mt-1 text-sm text-red-600">{errors.branch_id.message}</p>
                    )}
                  </div>

                  {/* Created By Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
                    <input
                      type="text"
                      value={`${user?.first_name} ${user?.last_name}`}
                      disabled
                      className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                    />
                    <input type="hidden" {...register("created_by")} />
                    <input type="hidden" {...register("last_updated_by")} />
                  </div>

                  {/* Customer Number Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Number *</label>
                    <input
                      type="text"
                      {...register("customer_number", { required: "Customer number is required" })}
                      className={`w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                        errors.customer_number ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Customer number"
                      readOnly
                    />
                    {errors.customer_number && (
                      <p className="mt-1 text-sm text-red-600">{errors.customer_number.message}</p>
                    )}
                  </div>

                  {/* Personal Information Fields */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      {...register("title")}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Mr, Mrs, Dr"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input
                      type="text"
                      {...register("first_name", { required: "First name is required" })}
                      className={`w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                        errors.first_name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter first name"
                    />
                    {errors.first_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <input
                      type="text"
                      {...register("last_name", { required: "Last name is required" })}
                      className={`w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                        errors.last_name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter last name"
                    />
                    {errors.last_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Other Name</label>
                    <input
                      type="text"
                      {...register("other_name")}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter other name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                    <select
                      {...register("gender", { required: "Gender is required" })}
                      className={`w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                        errors.gender ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.gender && (
                      <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                    <input
                      type="date"
                      {...register("date_of_birth", { required: "Date of birth is required" })}
                      className={`w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                        errors.date_of_birth ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.date_of_birth && (
                      <p className="mt-1 text-sm text-red-600">{errors.date_of_birth.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                    <input
                      type="text"
                      {...register("occupation")}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter occupation"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                    <select
                      {...register("marital_status")}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Status</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telephone *</label>
                    <input
                      type="text"
                      {...register("telephone_number", { required: "Telephone number is required" })}
                      className={`w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                        errors.telephone_number ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter phone number"
                    />
                    {errors.telephone_number && (
                      <p className="mt-1 text-sm text-red-600">{errors.telephone_number.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nationality *</label>
                    <input
                      type="text"
                      {...register("nationality", { required: "Nationality is required" })}
                      className={`w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                        errors.nationality ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter nationality"
                    />
                    {errors.nationality && (
                      <p className="mt-1 text-sm text-red-600">{errors.nationality.message}</p>
                    )}
                  </div>

                  {/* Address Fields */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Region *</label>
                    <input
                      type="text"
                      {...register("region", { required: "Region is required" })}
                      className={`w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                        errors.region ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter region"
                    />
                    {errors.region && (
                      <p className="mt-1 text-sm text-red-600">{errors.region.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
                    <input
                      type="text"
                      {...register("district", { required: "District is required" })}
                      className={`w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                        errors.district ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter district"
                    />
                    {errors.district && (
                      <p className="mt-1 text-sm text-red-600">{errors.district.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      {...register("city", { required: "City is required" })}
                      className={`w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter city"
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">House Number</label>
                    <input
                      type="text"
                      {...register("house_number")}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter house number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GPS Address</label>
                    <input
                      type="text"
                      {...register("gph_address")}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter GPS address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Home Town</label>
                    <input
                      type="text"
                      {...register("home_town")}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter home town"
                    />
                  </div>
                </div>

                {/* Address Line Fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
                  <input
                    type="text"
                    {...register("address_one", { required: "Address line 1 is required" })}
                    className={`w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                      errors.address_one ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter address line 1"
                  />
                  {errors.address_one && (
                    <p className="mt-1 text-sm text-red-600">{errors.address_one.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                  <input
                    type="text"
                    {...register("address_two")}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter address line 2"
                  />
                </div>

                {/* Next of Kin Section */}
                <div className="border-t pt-4">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Next of Kin Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Next of Kin Name</label>
                      <input
                        type="text"
                        {...register("next_of_kin_name")}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                      <input
                        type="text"
                        {...register("next_of_kin_relation")}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter relationship"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="text"
                        {...register("next_of_kin_telephone_number")}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter phone"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                      <select
                        {...register("next_of_kin_gender")}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Accounts Tab - Only for existing customers */}
            {activeTab === 'accounts' && isExistingCustomer && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Customer Accounts</h3>
                  <button 
                    type="button" 
                    onClick={handleAddAccount}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <span>+</span> Add Account
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Account Number</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Overdraft</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {accounts.map((account) => (
                        <tr key={account.id}>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">{account.account_number}</td>
                          <td className="px-4 py-2 text-sm text-gray-500 capitalize">{account.type}</td>
                          <td className="px-4 py-2 text-sm text-gray-500">${account.balance.toFixed(2)}</td>
                          <td className="px-4 py-2 text-sm text-gray-500">${account.overdraft_limit.toFixed(2)}</td>
                          <td className="px-4 py-2 text-sm font-medium">
                            <button type="button" className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                            <button type="button" className="text-red-600 hover:text-red-900">Delete</button>
                          </td>
                        </tr>
                      ))}
                      {accounts.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-4 text-center text-sm text-gray-500">
                            No accounts found for this customer
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Identification Tab - Only for existing customers */}
            {activeTab === 'identification' && isExistingCustomer && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Customer Picture</h4>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setCaptureMode('upload')} className={`px-3 py-2 rounded-lg flex items-center gap-2 ${captureMode === 'upload' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                        <Upload className="h-4 w-4" /> Upload
                      </button>
                      <button type="button" onClick={() => setCaptureMode('camera')} className={`px-3 py-2 rounded-lg flex items-center gap-2 ${captureMode === 'camera' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                        <Camera className="h-4 w-4" /> Camera
                      </button>
                    </div>

                    {captureMode === 'upload' && (
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleImageUpload(e, 'picture')} 
                        className="w-full p-2 border border-gray-300 rounded-lg" 
                      />
                    )}

                    {captureMode === 'camera' && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">Camera functionality</p>
                      </div>
                    )}

                    {imagePreview && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Preview:</p>
                        <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border border-gray-300" />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Customer Signature</h4>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setCaptureMode('upload')} className={`px-3 py-2 rounded-lg flex items-center gap-2 ${captureMode === 'upload' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                        <Upload className="h-4 w-4" /> Upload
                      </button>
                      <button type="button" onClick={() => setCaptureMode('camera')} className={`px-3 py-2 rounded-lg flex items-center gap-2 ${captureMode === 'camera' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                        <Camera className="h-4 w-4" /> Capture
                      </button>
                    </div>

                    {captureMode === 'upload' && (
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleImageUpload(e, 'signature')} 
                        className="w-full p-2 border border-gray-300 rounded-lg" 
                      />
                    )}

                    {signaturePreview && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Preview:</p>
                        <img src={signaturePreview} alt="Signature" className="w-48 h-24 object-contain border border-gray-300 bg-white" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Identification Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ID Type</label>
                      <select
                        {...register("id_type")}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select ID Type</option>
                        <option value="National ID">National ID</option>
                        <option value="Passport">Passport</option>
                        <option value="Driver's License">Driver's License</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
                      <input
                        type="text"
                        {...register("id_number")}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter ID number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">SSN/Social Security</label>
                      <input
                        type="text"
                        {...register("SSNumber")}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter SSN"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Religion</label>
                      <input
                        type="text"
                        {...register("religion")}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter religion"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="mt-6 flex justify-between items-center">
              <button 
                type="submit" 
                disabled={saving} 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <RefreshCw className="h-4 w-4 animate-spin" />}
                {saving ? 'Saving...' : (customerId || isExistingCustomer ? 'Update Customer' : 'Create Customer')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Search Modal */}
       <AnimatePresence>
      {searchModalOpen && (
        <div className="fixed inset-0 bg-black   flex items-start justify-center p-4 z-[1811]">
          <motion.div initial={{ opacity: 0, scale: 1 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Search Customer</h3>
            </div>
            
            <div className="p-4">
              <input type="text" value={searchQuery} onChange={(e) => handleNameSearch(e.target.value)} placeholder="Search customers..." className="w-full p-2 border border-gray-300 rounded-lg mb-4" />
              
              <div className="max-h-64 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer #</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">First Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Last Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {searchResults.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">{customer.customer_number}</td>
                        <td className="px-4 py-2 text-sm text-gray-500">{customer.first_name}</td>
                        <td className="px-4 py-2 text-sm text-gray-500">{customer.last_name}</td>
                        <td className="px-4 py-2 text-sm font-medium">
                          <button onClick={() => selectCustomer(customer)} className="text-blue-600 hover:text-blue-900">Select</button>
                        </td>
                      </tr>
                    ))}
                    {searchResults.length === 0 && searchQuery.length >= 2 && !searchLoading && (
                      <tr><td colSpan={4} className="px-4 py-4 text-center text-sm text-gray-500">No customers found</td></tr>
                    )}
                    {searchLoading && <tr><td colSpan={4} className="px-4 py-4 text-center text-sm text-gray-500">Searching...</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
              <a onClick={() => setSearchModalOpen(false)} className="px-3 py-1 cursor-pointer bg-gray-300 text-gray-700  hover:bg-gray-400">Close</a>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
    </motion.div>
  );
};

export default withPermissions(CustomerAddUpdate, ['Add Customer','Update Customer','Delete Customer','View Customers']);
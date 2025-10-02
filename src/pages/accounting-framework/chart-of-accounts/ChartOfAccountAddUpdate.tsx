import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useDispatch } from "react-redux";

// Import types, constants, and components
import { type ChartOfAccountType, type ChartOfAccountAddUpdateProps, type FormData } from '../../../types/chartOfAccount';
// import { accountTypes } from '../../../constants/accountTypes';
import { FormInput } from './components/FormInput';
import { FormCheckbox } from './components/FormCheckbox';
import { api } from "../../../services/api";
import { toggleToaster } from "../../../provider/features/helperSlice";
import { withPermissions } from '../../../hooks/withPermissions';

 const accountTypes = [
    { value: 'asset', label: 'Asset' },
    { value: 'liability', label: 'Liability' },
    { value: 'equity', label: 'Equity' },
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expense' }
  ];

const ChartOfAccountAddUpdate: React.FC<ChartOfAccountAddUpdateProps> = ({ 
  accountId, 
  setCurrentPage 
}) => {
  const [accounts, setAccounts] = useState<ChartOfAccountType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<FormData>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accountsRes = await api.get("/chart-of-accounts");
        setAccounts(accountsRes.data.data || []);

        if (accountId) {
          const accountRes = await api.get(`/chart-of-accounts/${accountId}`);
          const account: ChartOfAccountType = accountRes.data.data;
          
          // Set form values
          Object.entries(account).forEach(([key, value]) => {
            setValue(key as keyof FormData, value);
          });
        } else {
          // Set default values for new account
          setValue("is_active", true);
          setValue("is_customer_account", false);
        }
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accountId, setValue]);

  const onSubmit = async (data: FormData) => {
    setSaving(true);

    const payload = {
      ...data,
      parent_id: data.parent_id || null
    };

    try {
      if (accountId) {
        await api.put(`/chart-of-accounts/${accountId}`, payload);
      } else {
        await api.post("/chart-of-accounts", payload);
      }
      
      dispatch(
        toggleToaster({
          isOpen: true,
          toasterData: { 
            type: "success", 
            msg: `Account ${accountId ? "Updated" : "Added"} Successfully` 
          },
        })
      );
      
      setCurrentPage("list");
    } catch (error) {
      console.error("Error saving account", error);
      dispatch(
        toggleToaster({
          isOpen: true,
          toasterData: { 
            type: "error", 
            msg: "Failed to save account." 
          },
        })
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <FormHeader 
          accountId={accountId} 
          setCurrentPage={setCurrentPage} 
        />
        
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label="Account Code (Unique)"
            name="code"
            register={register}
            error={errors.code}
            required
            placeholder="e.g., 1010, 00301"
          />

          <FormInput
            label="Account Name"
            name="name"
            register={register}
            error={errors.name}
            required
            placeholder="e.g., Savings Account, Cash on Hand"
          />

          <AccountTypeSelect register={register} error={errors.type} />
          <ParentAccountSelect accounts={accounts} register={register} accountId={accountId} />

          <FormInput
            label="Description"
            name="description"
            register={register}
            type="textarea"
            placeholder="Optional account description or notes..."
            className="col-span-full"
          />

          <FormCheckbox
            label="Account is active"
            name="is_active"
            register={register}
            defaultChecked={true}
          />

          <FormCheckbox
            label="Customer Account"
            name="is_customer_account"
            register={register}
            defaultChecked={false}
          />

          <SubmitButton saving={saving} accountId={accountId} />
        </form>
      </div>
    </motion.div>
  );
};

// Extracted smaller components
const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center p-5">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

const FormHeader: React.FC<{ accountId?: number; setCurrentPage: (page: string) => void }> = ({
  accountId,
  setCurrentPage
}) => (
  <div className="flex items-center justify-between mb-6 border-b pb-3">
    <h2 className="text-xl font-semibold text-blue-800">
      {accountId ? "Update Chart of Account" : "Add New Chart of Account"}
    </h2>
    <a
      onClick={() => setCurrentPage("list")}
      className="inline-flex items-center px-4 py-2 cursor-pointer border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      Back
    </a>
  </div>
);

const AccountTypeSelect: React.FC<{ register: any; error: any }> = ({ register, error }) => (
  <div className="col-span-1">
    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
      Financial Type *
    </label>
    <select
      id="type"
      {...register("type", { required: "Account type is required" })}
      className={`w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 shadow-sm bg-white ${
        error ? "border-red-500" : "border-gray-300"
      }`}
    >
      <option value="">Select Account Type</option>
      {accountTypes.map(type => (
        <option key={type.value} value={type.value}>{type.label}</option>
      ))}
    </select>
    {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
  </div>
);

const ParentAccountSelect: React.FC<{ accounts: ChartOfAccountType[]; register: any; accountId?: number }> = ({
  accounts,
  register,
  accountId
}) => (
  <div className="col-span-1">
    <label htmlFor="parent_id" className="block text-sm font-medium text-gray-700 mb-1">
      Parent Account (Optional)
    </label>
    <select
      id="parent_id"
      {...register("parent_id", {
        setValueAs: (value: string) => value === "" ? null : Number(value)
      })}
      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 shadow-sm bg-white"
    >
      <option value="">-- No Parent Account --</option>
      {accounts
        .filter(account => !accountId || account.id !== accountId)
        .map(account => (
          <option key={account.id} value={account.id}>
            {account.code} - {account.name} ({account.type.toUpperCase()})
          </option>
        ))
      }
    </select>
  </div>
);

const SubmitButton: React.FC<{ saving: boolean; accountId?: number }> = ({ saving, accountId }) => (
  <div className="col-span-full mt-4">
    <button
      type="submit"
      disabled={saving}
      className="w-full py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {saving ? 'Saving Account...' : (accountId ? 'Update Account' : 'Create Account')}
    </button>
  </div>
);

export default withPermissions(ChartOfAccountAddUpdate, [
  'Add Chart Account',
  'Update Chart Account', 
  'Delete Chart Account',
  'View Chart Accounts'
]);
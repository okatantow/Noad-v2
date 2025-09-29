import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { api } from "../../../services/api";
import { toggleToaster } from "../../../provider/features/helperSlice";
import { useDispatch } from "react-redux";
import { withPermissions } from '../../../hooks/withPermissions';

type ChartOfAccountType = {
  id?: number;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
  parent_id: number | null;
  description: string;
  is_active: boolean;
};

type ChartOfAccountAddUpdateProps = {
  accountId?: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<string>>;
};

type FormData = {
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
  parent_id: number | null;
  description: string;
  is_active: boolean;
};

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

  const accountTypes = [
    { value: 'asset', label: 'Asset' },
    { value: 'liability', label: 'Liability' },
    { value: 'equity', label: 'Equity' },
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expense' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accountsRes = await api.get("/chart-of-accounts");
        setAccounts(accountsRes.data.data || []);

        if (accountId) {
          const accountRes = await api.get(`/chart-of-accounts/${accountId}`);
          const account: ChartOfAccountType = accountRes.data.data;
          
          setValue("code", account.code);
          setValue("name", account.name);
          setValue("type", account.type);
          setValue("parent_id", account.parent_id);
          setValue("description", account.description || '');
          setValue("is_active", account.is_active);
        } else {
          setValue("is_active", true);
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
      code: data.code,
      name: data.name,
      type: data.type,
      parent_id: data.parent_id || null,
      description: data.description,
      is_active: data.is_active
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
    return (
      <div className="flex justify-center items-center p-5">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between mb-6 border-b pb-3">
          <h2 className="text-xl font-semibold text-blue-800">
            {accountId ? "Update Chart of Account" : "Add New Chart of Account"}
          </h2>
          <a
            onClick={() => setCurrentPage("list")}
            className="inline-flex cursor-pointer items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </a>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Account Code */}
          <div className="col-span-1">
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              Account Code (Unique) *
            </label>
            <input
              type="text"
              id="code"
              {...register("code", { 
                required: "Account code is required",
                pattern: {
                  value: /^[0-9A-Za-z\-_]+$/,
                  message: "Only letters, numbers, hyphens and underscores allowed"
                }
              })}
              className={`w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 shadow-sm ${
                errors.code ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="e.g., 1010, 00301"
            />
            {errors.code && (
              <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
            )}
          </div>

          {/* Account Name */}
          <div className="col-span-1">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Account Name *
            </label>
            <input
              type="text"
              id="name"
              {...register("name", { required: "Account name is required" })}
              className={`w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 shadow-sm ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="e.g., Savings Account, Cash on Hand"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Account Type */}
          <div className="col-span-1">
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Financial Type *
            </label>
            <select
              id="type"
              {...register("type", { required: "Account type is required" })}
              className={`w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 shadow-sm bg-white ${
                errors.type ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select Account Type</option>
              {accountTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>

          {/* Parent Account */}
          <div className="col-span-1">
            <label htmlFor="parent_id" className="block text-sm font-medium text-gray-700 mb-1">
              Parent Account (Optional)
            </label>
            <select
              id="parent_id"
              {...register("parent_id", {
                setValueAs: (value) => value === "" ? null : Number(value)
              })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 shadow-sm bg-white"
            >
              <option value="">-- No Parent Account --</option>
              {accounts
                .filter(account => !accountId || account.id !== accountId) // Prevent self-parenting
                .map(account => (
                  <option key={account.id} value={account.id}>
                    {account.code} - {account.name} ({account.type.toUpperCase()})
                  </option>
                ))
              }
            </select>
          </div>

          {/* Description */}
          <div className="col-span-full">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              {...register("description")}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 shadow-sm"
              placeholder="Optional account description or notes..."
            />
          </div>

          {/* Active Status */}
          <div className="col-span-1">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                {...register("is_active")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">
                Account is active
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="col-span-full mt-4">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving Account...' : (accountId ? 'Update Account' : 'Create Account')}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default withPermissions(ChartOfAccountAddUpdate, ['Add Chart Account','Update Chart Account','Delete Chart Account','View Chart Accounts']);
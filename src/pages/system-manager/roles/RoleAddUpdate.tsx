import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { CheckSquare, Square, ArrowLeft } from "lucide-react";
import { api } from "../../../services/api";
import { toggleToaster } from "../../../provider/features/helperSlice";
import { useDispatch } from "react-redux";
import { withPermissions } from '../../../hooks/withPermissions';
// import { usePermissions } from '../../../hooks/usePermissions';

type FunctionType = {
  id: number;
  function_name: string;
  category_id: number;
};

type CategoryType = {
  id: number;
  category_name: string;
  functions: FunctionType[];
};

type RoleType = {
  id?: number;
  name: string;
  description: string;
  permissions: string[];
};

type RoleAddUpdateProps = {
  roleId?: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<string>>;
};

type FormData = {
  name: string;
  description: string;
};

const RoleAddUpdate: React.FC<RoleAddUpdateProps> = ({ roleId, setCurrentPage }) => {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  
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
        const catRes = await api.get("/getCategories");
        setCategories(catRes.data.data || []);

        if (roleId) {
          const roleRes = await api.get(`/roles/${roleId}`);
          const role: RoleType = roleRes.data.data;
          setValue("name", role.name);
          setValue("description", role.description);
          setSelectedPermissions(role.permissions || []);
        }
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [roleId, setValue]);

  const togglePermission = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);

    const payload: RoleType = { 
      name: data.name, 
      description: data.description, 
      permissions: selectedPermissions 
    };

    try {
      if (roleId) {
        await api.put(`/roles/${roleId}`, payload);
      } else {
        await api.post("/roles", payload);
      }
      
      // Show success toaster
      dispatch(
        toggleToaster({
          isOpen: true,
          toasterData: { 
            type: "success", 
            msg: `Role ${roleId ? "Updated" : "Added"} Successfully` 
          },
        })
      );
      
      setCurrentPage("list");
    } catch (error) {
      console.error("Error saving role", error);
      
      // Show error toaster
      dispatch(
        toggleToaster({
          isOpen: true,
          toasterData: { 
            type: "error", 
            msg: "Failed to save role." 
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
      <div className="  rounded-lg border-0 overflow-hidden">
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {roleId ? "Update Role" : "Create Role"}
          </h2>
          <a
            onClick={() => setCurrentPage("list")}
            className="inline-flex cursor-pointer items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </a>
        </div>

        {/* Form */}
        <div className="px-6 py-4">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Role Name */}
            <div className="bg-gray-50">
            <div className="mb-6 ">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Role Name
              </label>
              <input
                type="text"
                id="name"
                {...register("name", { required: "Role name is required" })}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter role name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                id="description"
                {...register("description")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter description"
              />
            </div>
            </div>

            {/* Permissions */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Permissions
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.map((category) => (
                  <div key={category.id} className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      {category.category_name}
                    </h3>
                    <div className="space-y-2">
                      {category.functions.map((func) => {
                        const checked = selectedPermissions.includes(func.function_name);
                        return (
                          <div key={func.id} className="flex items-center">
                            <a
                              type="button"
                              onClick={() => togglePermission(func.function_name)}
                              className="flex items-center space-x-2 text-left w-full p-2 cursor-pointer rounded hover:bg-gray-100 transition-colors"
                            >
                              {checked ? (
                                <CheckSquare className="h-5 w-5 text-blue-600" />
                              ) : (
                                <Square className="h-5 w-5 text-gray-400" />
                              )}
                              <span className={`text-sm ${checked ? "text-gray-900 font-medium" : "text-gray-600"}`}>
                                {func.function_name}
                              </span>
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {roleId ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  roleId ? "Update Role" : "Create Role"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

// export default RoleAddUpdate;
export default withPermissions(RoleAddUpdate, ['Add Role','Update Role','Delete Role']);

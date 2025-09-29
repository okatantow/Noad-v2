import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { api } from "../../../services/api";
import { toggleToaster } from "../../../provider/features/helperSlice";
import { useDispatch } from "react-redux";
import { withPermissions } from '../../../hooks/withPermissions';


type UserType = {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  password?: string;
  role: number;
  user_type: string;
  status: string;
};

type RoleType = {
  id: number;
  name: string;
};

type UserAddUpdateProps = {
  userId?: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<string>>;
};

type FormData = {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  password?: string;
  confirm_password?: string;
  role: number;
  user_type: string;
  status: string;
};

const UserAddUpdate: React.FC<UserAddUpdateProps> = ({ userId, setCurrentPage }) => {
  const [roles, setRoles] = useState<RoleType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<FormData>();

  const userTypes = ["Cashier", "Mobile Banker", "Accountant", "Manager", "Auditor"];
  const statusOptions = ["active", "inactive", "pending"];

  const password = watch("password");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rolesRes = await api.get("/roles");
        setRoles(rolesRes.data.data || []);

        if (userId) {
          const userRes = await api.get(`/users/${userId}`);
          const user: UserType = userRes.data.data;
          
          setValue("first_name", user.first_name);
          setValue("last_name", user.last_name);
          setValue("email", user.email);
          setValue("username", user.username);
          setValue("role", user.role);
          setValue("user_type", user.user_type);
          setValue("status", user.status);
        }
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, setValue]);

  const onSubmit = async (data: FormData) => {
    setSaving(true);

    const payload: any = { 
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      username: data.username,
      role: data.role,
      user_type: data.user_type,
      status: data.status
    };

    // Only include password if it's provided (for new users or password changes)
    if (data.password) {
      payload.password = data.password;
    }

    try {
      if (userId) {
        await api.put(`/users/${userId}`, payload);
      } else {
        await api.post("/users", payload);
      }
      
      dispatch(
        toggleToaster({
          isOpen: true,
          toasterData: { 
            type: "success", 
            msg: `User ${userId ? "Updated" : "Added"} Successfully` 
          },
        })
      );
      
      setCurrentPage("list");
    } catch (error) {
      console.error("Error saving user", error);
      
      dispatch(
        toggleToaster({
          isOpen: true,
          toasterData: { 
            type: "error", 
            msg: "Failed to save user." 
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
      <div className="rounded-lg border-0 overflow-hidden">
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {userId ? "Update User" : "Create User"}
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    {...register("first_name", { required: "First name is required" })}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.first_name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter first name"
                  />
                  {errors.first_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    {...register("last_name", { required: "Last name is required" })}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.last_name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter last name"
                  />
                  {errors.last_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    {...register("email", { 
                      required: "Email is required",
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: "Invalid email address"
                      }
                    })}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    id="username"
                    {...register("username", { required: "Username is required" })}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.username ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter username"
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                  )}
                </div>
              </div>

              {/* Password Fields - Only show for new users or when changing password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    {userId ? "New Password" : "Password *"}
                  </label>
                  <input
                    type="password"
                    id="password"
                    {...register("password", { 
                      required: !userId ? "Password is required" : false,
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters"
                      }
                    })}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder={userId ? "Leave blank to keep current" : "Enter password"}
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirm_password"
                    {...register("confirm_password", {
                      validate: value => 
                        !password || value === password || "Passwords do not match"
                    })}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.confirm_password ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Confirm password"
                  />
                  {errors.confirm_password && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirm_password.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Role and Status */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Role & Status</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                    Role *
                  </label>
                  <select
                    id="role"
                    {...register("role", { required: "Role is required" })}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.role ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select Role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  {errors.role && (
                    <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="user_type" className="block text-sm font-medium text-gray-700 mb-2">
                    User Type *
                  </label>
                  <select
                    id="user_type"
                    {...register("user_type", { required: "User type is required" })}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.user_type ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select User Type</option>
                    {userTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {errors.user_type && (
                    <p className="mt-1 text-sm text-red-600">{errors.user_type.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    id="status"
                    {...register("status", { required: "Status is required" })}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.status ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select Status</option>
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                  {errors.status && (
                    <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {userId ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  userId ? "Update User" : "Create User"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

// export default UserAddUpdate;
export default withPermissions(UserAddUpdate, ['Add User','Update User','Delete User','View Users']);


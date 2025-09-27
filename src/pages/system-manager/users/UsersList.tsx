import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2, Plus } from "lucide-react";
import { api } from "../../../services/api";
import { toggleToaster } from "../../../provider/features/helperSlice";
import { useDispatch } from "react-redux";
import "datatables.net-dt/css/dataTables.dataTables.css";
import $ from "jquery";
import "datatables.net-dt";
import swal from "sweetalert";

type UserType = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  password?: string;
  role: string;
  user_type: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type RoleType = {
  id: number;
  name: string;
};

type UsersListProps = {
  setCurrentPage: React.Dispatch<React.SetStateAction<string>>;
  setSelectedUserId: React.Dispatch<React.SetStateAction<number | undefined>>;
};

const UsersList: React.FC<UsersListProps> = ({ setCurrentPage, setSelectedUserId }) => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [roles, setRoles] = useState<RoleType[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const dispatch = useDispatch();
  const tableRef = useRef<HTMLTableElement>(null);
  const dataTableRef = useRef<any>(null);

  const userTypes = ["Cashier", "Mobile Banker", "Accountant", "Manager", "Auditor"];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users");
      setUsers(res.data.data || []);
    } catch (error) {
      console.error("Error fetching users", error);
      dispatch(
        toggleToaster({
          isOpen: true,
          toasterData: { 
            type: "error", 
            msg: "Failed to fetch users" 
          },
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await api.get("/roles");
      setRoles(res.data.data || []);
    } catch (error) {
      console.error("Error fetching roles", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  useEffect(() => {
    if (tableRef.current) {
      if (dataTableRef.current) {
        dataTableRef.current.destroy();
      }
      dataTableRef.current = $(tableRef.current).DataTable();
    }
  }, [users]);

  const deleteRecord = async (userId: number) => {
    setDeletingId(userId);
    try {
      await api.delete(`/users/${userId}`);
      
      dispatch(
        toggleToaster({
          isOpen: true,
          toasterData: { 
            type: "success", 
            msg: "User deleted successfully" 
          },
        })
      );
      
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user", error);
      
      dispatch(
        toggleToaster({
          isOpen: true,
          toasterData: { 
            type: "error", 
            msg: "Failed to delete user" 
          },
        })
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleDelete = (userId: number) => {
    swal({
      title: "Confirm Deletion",
      text: "Once Confirmed, User Record Will Be Deleted",
      icon: "warning",
      buttons: ["Cancel", "Confirm"],
      dangerMode: true,
    })
    .then((willDelete) => {
      if (willDelete) {
        deleteRecord(userId);
      }
    });
  };

  const handleOpenForm = (userId?: number) => {
    setSelectedUserId(userId);
    setCurrentPage("add");
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: "bg-green-100 text-green-800", label: "Active" },
      inactive: { color: "bg-red-100 text-red-800", label: "Inactive" },
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
                  { color: "bg-gray-100 text-gray-800", label: status };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getUserTypeBadge = (userType: string) => {
    const typeConfig = {
      Cashier: "bg-blue-100 text-blue-800",
      "Mobile Banker": "bg-purple-100 text-purple-800",
      Accountant: "bg-indigo-100 text-indigo-800",
      Manager: "bg-orange-100 text-orange-800",
      Auditor: "bg-teal-100 text-teal-800"
    };
    
    const colorClass = typeConfig[userType as keyof typeof typeConfig] || "bg-gray-100 text-gray-800";
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {userType}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600 mt-1">Manage system users and their access</p>
        </div>
        <a
          onClick={() => handleOpenForm()}
          className="inline-flex items-center px-4 py-2 cursor-pointer bg-green-600 text-white text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
        >
          <Plus size={18} className="mr-2" />
          Add New User
        </a>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 border border-gray-200 ">
          <div className="text-sm font-medium text-gray-500">Total Users</div>
          <div className="text-2xl font-bold text-gray-900">{users.length}</div>
        </div>
        <div className="bg-white p-4 border border-gray-200 ">
          <div className="text-sm font-medium text-gray-500">Active Users</div>
          <div className="text-2xl font-bold text-green-600">
            {users.filter(user => user.status === 'active').length}
          </div>
        </div>
        <div className="bg-white p-4 border border-gray-200 ">
          <div className="text-sm font-medium text-gray-500">Managers</div>
          <div className="text-2xl font-bold text-blue-600">
            {users.filter(user => user.user_type === 'Manager').length}
          </div>
        </div>
        <div className="bg-white p-4 border border-gray-200 ">
          <div className="text-sm font-medium text-gray-500">Pending</div>
          <div className="text-2xl font-bold text-yellow-600">
            {users.filter(user => user.status === 'pending').length}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden px-1">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">Users List</h3>
          <p className="text-sm text-gray-600 mt-1">
            {users.length} user{users.length !== 1 ? 's' : ''} found
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table 
            ref={tableRef} 
            className="display table table-striped"
            style={{ width: "100%" }}
          >
            <thead>
              <tr>
                <th>#</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Username</th>
                <th>Role</th>
                <th>User Type</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => (
                <tr key={user.id}>
                  <td>{idx + 1}</td>
                  <td className="font-medium text-gray-900">
                    {user.first_name} {user.last_name}
                  </td>
                  <td className="text-gray-600">{user.email}</td>
                  <td className="text-gray-600">{user.username}</td>
                  <td>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                      {user.role}
                    </span>
                  </td>
                  <td>{getUserTypeBadge(user.user_type)}</td>
                  <td>{getStatusBadge(user.status)}</td>
                  <td className="text-gray-500 text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="flex items-start space-x-2">
                    <button
                      onClick={() => handleOpenForm(user.id)}
                      className="inline-flex items-center p-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
                      title="Edit user"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      disabled={deletingId === user.id}
                      className="inline-flex items-center p-2 border border-gray-300 rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                      title="Delete user"
                    >
                      {deletingId === user.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {users.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="text-gray-400 mb-4">
            <Plus size={64} className="mx-auto opacity-50" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Get started by creating your first user. Users can access the system based on their roles and permissions.
          </p>
          <button
            onClick={() => handleOpenForm()}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm"
          >
            <Plus size={18} className="mr-2" />
            Create Your First User
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default UsersList;
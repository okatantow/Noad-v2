import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2, Plus } from "lucide-react";
import { api } from "../../../services/api";
import { toggleToaster } from "../../../provider/features/helperSlice";
import { useDispatch } from "react-redux";
import { withPermissions } from '../../../hooks/withPermissions';
import { usePermissions } from '../../../hooks/usePermissions';

// DataTable
import "datatables.net-dt/css/dataTables.dataTables.css";
import $ from "jquery";
import "datatables.net-dt";

// SweetAlert
import swal from "sweetalert";

type RoleType = {
  id: number;
  name: string;
  description: string;
  permissions: string[];
};

type RolesListProps = {
  setCurrentPage: React.Dispatch<React.SetStateAction<string>>;
  setSelectedRoleId: React.Dispatch<React.SetStateAction<number | undefined>>;
};

function RolesList({ setCurrentPage, setSelectedRoleId }: RolesListProps) {
  const { hasPermission} = usePermissions();

  const [roles, setRoles] = useState<RoleType[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const dispatch = useDispatch();
  const tableRef = useRef<HTMLTableElement>(null);
  const dataTableRef = useRef<any>(null);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await api.get("/roles");
      setRoles(res.data.data || []);
    } catch (error) {
      console.error("Error fetching roles", error);
      dispatch(
        toggleToaster({
          isOpen: true,
          toasterData: { 
            type: "error", 
            msg: "Failed to fetch roles" 
          },
        })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Initialize DataTable - KEEP THE ORIGINAL WORKING LOGIC
  useEffect(() => {
    if (tableRef.current) {
      if (dataTableRef.current) {
        dataTableRef.current.destroy();
      }
      dataTableRef.current = $(tableRef.current).DataTable();
    }
  }, [roles]);

  const deleteRecord = async (roleId: number) => {
    setDeletingId(roleId);
    try {
      await api.delete(`/roles/${roleId}`);
      
      dispatch(
        toggleToaster({
          isOpen: true,
          toasterData: { 
            type: "success", 
            msg: "Role deleted successfully" 
          },
        })
      );
      
      fetchRoles();
    } catch (error) {
      console.error("Error deleting role", error);
      
      dispatch(
        toggleToaster({
          isOpen: true,
          toasterData: { 
            type: "error", 
            msg: "Failed to delete role" 
          },
        })
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleDelete = (roleId: number) => {
    swal({
      title: "Confirm Deletion",
      text: "Once Confirmed, Record Will Be Deleted",
      icon: "warning",
      buttons: ["Cancel", "Confirm"],
      dangerMode: true,
    })
    .then((willDelete) => {
      if (willDelete) {
        deleteRecord(roleId);
      }
    });
  };

  const handleOpenForm = (roleId?: number) => {
    setSelectedRoleId(roleId);
    setCurrentPage("add");
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
          <h1 className="text-2xl font-bold text-gray-900">Roles Management</h1>
          <p className="text-gray-600 mt-1">Manage user roles and permissions</p>
        </div>
        {hasPermission('Add Role') && <>
        <a
          onClick={() => handleOpenForm()}
          className="inline-flex items-center px-4 py-2 cursor-pointer bg-green-600 text-white text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
        >
          <Plus size={18} className="mr-2" />
          Add New Role
        </a>
        </>}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4  border border-gray-200 ">
          <div className="text-sm font-medium text-gray-500">Total Roles</div>
          <div className="text-2xl font-bold text-gray-900">{roles.length}</div>
        </div>
        <div className="bg-white p-4  border border-gray-200 ">
          <div className="text-sm font-medium text-gray-500">Active Roles</div>
          <div className="text-2xl font-bold text-green-600">{roles.length}</div>
        </div>
        <div className="bg-white p-4 border border-gray-200 ">
          <div className="text-sm font-medium text-gray-500">With Permissions</div>
          <div className="text-2xl font-bold text-blue-600">
            {roles.filter(role => role.permissions?.length > 0).length}
          </div>
        </div>
      </div>

      {/* Table Container with Enhanced Header */}
      <div className="bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden px-1">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">Roles List</h3>
          <p className="text-sm text-gray-600 mt-1">
            {roles.length} role{roles.length !== 1 ? 's' : ''} found
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
                <th>Role Name</th>
                <th>Description</th>
                <th>Permissions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role, idx) => (
                <tr key={role.id}>
                  <td>{idx + 1}</td>
                  <td className="font-medium text-gray-900">{role.name}</td>
                  <td className="text-gray-600">{role.description || "-"}</td>
                  <td>
                    {role.permissions?.length ? (
                      <span 
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                        title={role.permissions.join(", ")}
                      >
                        {role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">No permissions</span>
                    )}
                  </td>
                  <td className="flex items-start space-x-2">
                      {hasPermission('Update Role') ? <>
                    <button
                      onClick={() => handleOpenForm(role.id)}
                      className="inline-flex items-center p-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
                      title="Edit role"
                    >
                      <Pencil size={16} />
                    </button>
                    </> : "<>"
                    }
                      {hasPermission('Delete Role') ? <>
                    <button
                      onClick={() => handleDelete(role.id)}
                      disabled={deletingId === role.id}
                      className="inline-flex items-center p-2 border border-gray-300 rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                      title="Delete role"
                    >
                      {deletingId === role.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                    </> : "<>"
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {roles.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="text-gray-400 mb-4">
            <Plus size={64} className="mx-auto opacity-50" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No roles found</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Get started by creating your first role. Roles help you manage permissions and access control for your users.
          </p>
          <button
            onClick={() => handleOpenForm()}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm"
          >
            <Plus size={18} className="mr-2" />
            Create Your First Role
          </button>
        </div>
      )}
    </motion.div>
  );
};

// export default RolesList;
export default withPermissions(RolesList, ['Add Role','Update Role','Delete Role','View Roles']);

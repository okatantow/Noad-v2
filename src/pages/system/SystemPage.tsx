import  Breadcrumb  from "../../components/layout/Breadcrumb";
import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import { useForm } from "react-hook-form";
import { Tab } from "@headlessui/react";
import { toggleToaster,  } from "../../provider/features/helperSlice";
import {  useDispatch } from "react-redux";

interface Category {
  id: number;
  category_name: string;
}

interface Screen {
  id: number;
  screen_name: string;
  category_id: number;
  link: string;
  category?: { id: number; category_name: string };
}

interface Func {
  id: number;
  function_name: string;
  category_id: number;
  link: string;
  category?: { id: number; category_name: string };
}

const SystemPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [screens, setScreens] = useState<Screen[]>([]);
  const [functions, setFunctions] = useState<Func[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const dispatch = useDispatch();
  
  // Loading states
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingScreens, setLoadingScreens] = useState(false);
  const [loadingFunctions, setLoadingFunctions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<{entity: string, id: number} | null>(null);

  // Track editing state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingEntity, setEditingEntity] = useState<"categories" | "screens" | "functions" | null>(null);

  const { register, handleSubmit, reset, setValue } = useForm();

  // Fetch data
  useEffect(() => {
    fetchCategories();
    fetchScreens();
    fetchFunctions();
  }, []);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchScreens = async () => {
    setLoadingScreens(true);
    try {
      const res = await api.get("/screens");
      setScreens(res.data);
    } catch (error) {
      console.error("Failed to fetch screens:", error);
    } finally {
      setLoadingScreens(false);
    }
  };

  const fetchFunctions = async () => {
    setLoadingFunctions(true);
    try {
      const res = await api.get("/functions");
      setFunctions(res.data);
    } catch (error) {
      console.error("Failed to fetch functions:", error);
    } finally {
      setLoadingFunctions(false);
    }
  };

  const onSubmit = async (data: any, entity: "categories" | "screens" | "functions") => {
    setSubmitting(true);
    try {
      if (editingId && editingEntity === entity) {
        await api.put(`/${entity}/${editingId}`, data);
      } else {
        await api.post(`/${entity}`, data);
      }
      
      reset();
      setEditingId(null);
      setEditingEntity(null);
      
      // Show success toaster
      dispatch(
        toggleToaster({
          isOpen: true,
          toasterData: { 
            type: "success", 
            msg: `${entity.slice(0, -1)} ${editingId ? "Updated" : "Added"} Successfully` 
          },
        })
      );
      
      // Refetch data
      if (entity === "categories") fetchCategories();
      if (entity === "screens") fetchScreens();
      if (entity === "functions") fetchFunctions();
    } catch (e) {
      console.error(e);
      dispatch(
        toggleToaster({
          isOpen: true,
          toasterData: { type: "error", msg: `Failed to ${editingId ? "update" : "add"} ${entity.slice(0, -1)}` },
        })
      );
    } finally {
      setSubmitting(false);
    }
  };

  const deleteEntity = async (entity: string, id: number) => {
    setDeleting({ entity, id });
    try {
      await api.delete(`/${entity}/${id}`);
      
      // Show success toaster
      dispatch(
        toggleToaster({
          isOpen: true,
          toasterData: { type: "success", msg: `${entity.slice(0, -1)} Deleted Successfully` },
        })
      );
      
      // Refetch data
      if (entity === "categories") fetchCategories();
      if (entity === "screens") fetchScreens();
      if (entity === "functions") fetchFunctions();
    } catch (e) {
      console.error(e);
      dispatch(
        toggleToaster({
          isOpen: true,
          toasterData: { type: "error", msg: `Failed to delete ${entity.slice(0, -1)}` },
        })
      );
    } finally {
      setDeleting(null);
    }
  };

  const startEdit = (entity: "categories" | "screens" | "functions", item: any) => {
    reset(); // clear form first
    setEditingEntity(entity);
    setEditingId(item.id);
    if (entity === "categories") {
      setValue("category_name", item.category_name);
    }
    if (entity === "screens") {
      setValue("screen_name", item.screen_name);
      setValue("category_id", item.category_id);
      setValue("link", item.link);
    }
    if (entity === "functions") {
      setValue("function_name", item.function_name);
      setValue("category_id", item.category_id);
      setValue("link", item.link);
    }
  };

  return (
      <div className="bg-white rounded shadow p-6 min-h-[500px]">
        <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
          <Tab.List className="flex space-x-4 border-b">
            {["Categories", "Screens", "Functions"].map((tab, idx) => (
              <Tab
                key={idx}
                className={({ selected }) =>
                  `px-4 py-2 ${selected ? "border-b-2 border-blue-500 font-semibold" : ""}`
                }
              >
                {tab}
              </Tab>
            ))}
          </Tab.List>

          {/* CATEGORY TAB */}
          <Tab.Panels>
            <Tab.Panel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <form
                    onSubmit={handleSubmit((data) => onSubmit(data, "categories"))}
                    className="space-y-3"
                  >
                    <input
                      {...register("category_name")}
                      placeholder="Category Name"
                      className="border px-3 py-2 rounded w-full"
                      required
                    />
                    <button 
                      className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-blue-300"
                      disabled={submitting}
                    >
                      {submitting ? "Processing..." : editingEntity === "categories" ? "Update Category" : "Add Category"}
                    </button>
                  </form>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Categories</h3>
                  {loadingCategories ? (
                    <div className="text-center py-4">Loading categories...</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="py-2 px-4 border-b text-left">Name</th>
                            <th className="py-2 px-4 border-b text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {categories.map((cat) => (
                            <tr key={cat.id} className="hover:bg-gray-50">
                              <td className="py-2 px-4 border-b">{cat.category_name}</td>
                              <td className="py-2 px-4 border-b">
                                <div className="space-x-2 flex items-start justify-between">
                                  <button
                                    className="text-green-600 hover:text-green-800 btn-sm"
                                    onClick={() => startEdit("categories", cat)}
                                    disabled={submitting}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="text-red-500 hover:text-red-700"
                                    onClick={() => deleteEntity("categories", cat.id)}
                                    disabled={deleting?.entity === "categories" && deleting.id === cat.id}
                                  >
                                    {deleting?.entity === "categories" && deleting.id === cat.id ? "Deleting..." : "Delete"}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </Tab.Panel>

            {/* SCREEN TAB */}
            <Tab.Panel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <form
                    onSubmit={handleSubmit((data) => onSubmit(data, "screens"))}
                    className="space-y-3"
                  >
                    <input
                      {...register("screen_name")}
                      placeholder="Screen Name"
                      className="border px-3 py-2 rounded w-full"
                      required
                    />
                    <select 
                      {...register("category_id")} 
                      className="border px-3 py-2 w-full rounded"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.category_name}
                        </option>
                      ))}
                    </select>
                    <input
                      {...register("link")}
                      placeholder="Link"
                      className="border px-3 py-2 rounded w-full"
                      required
                    />
                    <button 
                      className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-blue-300"
                      disabled={submitting}
                    >
                      {submitting ? "Processing..." : editingEntity === "screens" ? "Update Screen" : "Add Screen"}
                    </button>
                  </form>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Screens</h3>
                  {loadingScreens ? (
                    <div className="text-center py-4">Loading screens...</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="py-2 px-4 border-b text-left">Name</th>
                            <th className="py-2 px-4 border-b text-left">Link</th>
                            <th className="py-2 px-4 border-b text-left">Category</th>
                            <th className="py-2 px-4 border-b text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {screens.map((scr) => (
                            <tr key={scr.id} className="hover:bg-gray-50">
                              <td className="py-2 px-4 border-b">{scr.screen_name}</td>
                              <td className="py-2 px-4 border-b">{scr.link}</td>
                              <td className="py-2 px-4 border-b">{scr.category?.category_name}</td>
                              <td className="py-2 px-4 border-b">
                                <div className="space-x-2 flex items-start justify-between">
                                  <button
                                    className="text-green-600 hover:text-green-800 btn-sm"
                                    onClick={() => startEdit("screens", scr)}
                                    disabled={submitting}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="text-red-500 hover:text-red-700"
                                    onClick={() => deleteEntity("screens", scr.id)}
                                    disabled={deleting?.entity === "screens" && deleting.id === scr.id}
                                  >
                                    {deleting?.entity === "screens" && deleting.id === scr.id ? "Deleting..." : "Delete"}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </Tab.Panel>

            {/* FUNCTION TAB */}
            <Tab.Panel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <form
                    onSubmit={handleSubmit((data) => onSubmit(data, "functions"))}
                    className="space-y-3"
                  >
                    <input
                      {...register("function_name")}
                      placeholder="Function Name"
                      className="border px-3 py-2 rounded w-full"
                      required
                    />
                    <select 
                      {...register("category_id")} 
                      className="border px-3 py-2 w-full rounded"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.category_name}
                        </option>
                      ))}
                    </select>
                    <input
                      {...register("link")}
                      placeholder="Link"
                      className="border px-3 py-2 rounded w-full"
                      required
                    />
                    <button 
                      className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-blue-300"
                      disabled={submitting}
                    >
                      {submitting ? "Processing..." : editingEntity === "functions" ? "Update Function" : "Add Function"}
                    </button>
                  </form>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Functions</h3>
                  {loadingFunctions ? (
                    <div className="text-center py-4">Loading functions...</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="py-2 px-4 border-b text-left">Name</th>
                            <th className="py-2 px-4 border-b text-left">Link</th>
                            <th className="py-2 px-4 border-b text-left">Category</th>
                            <th className="py-2 px-4 border-b text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {functions.map((fn) => (
                            <tr key={fn.id} className="hover:bg-gray-50">
                              <td className="py-2 px-4 border-b">{fn.function_name}</td>
                              <td className="py-2 px-4 border-b">{fn.link}</td>
                              <td className="py-2 px-4 border-b">{fn.category?.category_name}</td>
                              <td className="py-2 px-4 border-b">
                                <div className="space-x-2 flex items-start justify-between">
                                  <button
                                    className="text-green-600 hover:text-green-800"
                                    onClick={() => startEdit("functions", fn)}
                                    disabled={submitting}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="text-red-500 hover:text-red-700"
                                    onClick={() => deleteEntity("functions", fn.id)}
                                    disabled={deleting?.entity === "functions" && deleting.id === fn.id}
                                  >
                                    {deleting?.entity === "functions" && deleting.id === fn.id ? "Deleting..." : "Delete"}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
  );
};

export default SystemPage;
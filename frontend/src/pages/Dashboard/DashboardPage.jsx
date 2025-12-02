import React, { useEffect, useMemo, useRef, useState } from "react";
import API from "@/api/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Trash2,
  Edit,
  Search,
  RefreshCw,
  Calendar,
  MapPin,
  GraduationCap,
  Mail,
  User,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  MoreVertical,
  Filter,
  Download
} from "lucide-react";

const PAGE_SIZES = [5, 10, 15, 100];

function Avatar({ name = "", size = 40, image }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

  if (image) {
    return (
      <div
        className="rounded-full overflow-hidden flex items-center justify-center bg-gray-100"
        style={{ width: size, height: size }}
      >
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div
          className="w-full h-full rounded-full bg-gradient-to-br from-indigo-600 to-sky-500 text-white flex items-center justify-center font-semibold shadow-sm hidden"
          style={{ width: size, height: size }}
        >
          {initials}
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-full bg-gradient-to-br from-indigo-600 to-sky-500 text-white flex items-center justify-center font-semibold shadow-sm"
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
}

function MobileUserCard({ user, onEdit, onDelete, onView }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 space-y-4">
      {/* User Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar name={user.name || user.email} image={user.images?.[0]} size={48} />
          <div>
            <h3 className="font-semibold text-gray-900">{user.name || "—"}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Mail className="w-3 h-3" />
              <span className="truncate max-w-[150px]">{user.email}</span>
            </div>
          </div>
        </div>
        
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <MoreVertical className="w-5 h-5 text-gray-400" />
          </button>
          
          {menuOpen && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onView();
                  setMenuOpen(false);
                }}
                className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                View Profile
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                  setMenuOpen(false);
                }}
                className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit User
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm("Delete this user?")) onDelete();
                  setMenuOpen(false);
                }}
                className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* User Details */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">{user.city || "—"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">
            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
          </span>
        </div>
        <div className="col-span-2">
          <div className="flex items-start gap-2">
            <GraduationCap className="w-4 h-4 text-gray-400 mt-0.5" />
            <span className="text-gray-600 flex-1">
              {(user.education || []).slice(0, 2).join(", ") || "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const debounceRef = useRef(null);

  const [sortDesc, setSortDesc] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

  const [refreshKey, setRefreshKey] = useState(0);

  // Debounce Search
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(query.trim()), 300);
  }, [query]);

  // Auto refresh on successful edit
  useEffect(() => {
    if (location?.state?.refresh) {
      setRefreshKey((k) => k + 1);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Fetch Users
  async function load() {
    setLoading(true);
    try {
      const res = await API.get("/users");
      const users = res?.data?.users ?? res?.data?.data ?? [];
      setUsers(Array.isArray(users) ? users : []);
    } catch (err) {
      console.error("load users error:", err);
      toast.error(err?.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [refreshKey]);

  // Filtering + Sorting
  const filtered = useMemo(() => {
    let arr = [...users];
    const q = debouncedQuery.toLowerCase();

    if (q) {
      arr = arr.filter((u) => {
        return (
          (u.name || "").toLowerCase().includes(q) ||
          (u.email || "").toLowerCase().includes(q) ||
          (u.city || "").toLowerCase().includes(q) ||
          ((u.education || []).join(" ").toLowerCase().includes(q))
        );
      });
    }

    arr.sort((a, b) => {
      const t1 = new Date(a.createdAt).getTime() || 0;
      const t2 = new Date(b.createdAt).getTime() || 0;
      return sortDesc ? t2 - t1 : t1 - t2;
    });

    return arr;
  }, [users, debouncedQuery, sortDesc]);

  // Pagination
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [pageSize, totalPages]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  // Delete
  async function onDelete(id) {
    if (!confirm("Delete this user?")) return;

    try {
      const res = await API.delete(`/users/${id}`);
      if (res.status === 200 || res.status === 204 || res.data?.success) {
        toast.success("User deleted successfully");
        setUsers((prev) => prev.filter((u) => u._id !== id));
      } else {
        toast.error("Delete failed");
      }
    } catch (err) {
      console.error("delete error:", err);
      toast.error("Delete failed");
    }
  }

  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-2">
                Manage and monitor all registered users in the system
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
             
              <Button
                onClick={() => navigate("/register")}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                Add New User
              </Button>
            </div>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, email, city, education..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Sort Toggle */}
              <Button
                variant="outline"
                onClick={() => setSortDesc(!sortDesc)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                {sortDesc ? "Newest First" : "Oldest First"}
              </Button>

              {/* Page Size Selector */}
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {PAGE_SIZES.map(size => (
                  <option key={size} value={size}>
                    Show {size}
                  </option>
                ))}
              </select>

              {/* Refresh */}
              <Button
                variant="outline"
                onClick={() => {
                  setRefreshKey(k => k + 1);
                  toast.success("Refreshing users...");
                }}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-500">Loading users...</p>
          </div>
        ) : total === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600 mb-6">
                {debouncedQuery ? "Try a different search term" : "Get started by adding a new user"}
              </p>
              <Button onClick={() => navigate("/register")}>
                Add First User
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-sm border p-4">
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{total}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border p-4">
                <p className="text-sm text-gray-500">Current Page</p>
                <p className="text-2xl font-bold text-gray-900">
                  {paginated.length} of {total}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border p-4">
                <p className="text-sm text-gray-500">Sort Order</p>
                <p className="text-lg font-semibold text-gray-900">
                  {sortDesc ? "Newest First" : "Oldest First"}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border p-4">
                <p className="text-sm text-gray-500">Page Size</p>
                <p className="text-lg font-semibold text-gray-900">{pageSize} per page</p>
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Education
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginated.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={user.name || user.email} image={user.images?.[0]} size={40} />
                            <div>
                              <p className="font-medium text-gray-900">{user.name || "—"}</p>
                              <p className="text-sm text-gray-500">{user.gender || "—"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <p className="text-gray-900">{user.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-900">{user.city || "—"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-900">
                              {(user.education || []).slice(0, 3).join(", ") || "—"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-900">
                              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/profile/${user._id}`)}
                              className="flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/users/${user._id}/edit`, { state: { user } })}
                              className="flex items-center gap-2"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this user?")) {
                                  onDelete(user._id);
                                }
                              }}
                              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:border-red-200"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {paginated.map((user) => (
                <MobileUserCard
                  key={user._id}
                  user={user}
                  onEdit={() => navigate(`/users/${user._id}/edit`, { state: { user } })}
                  onDelete={() => onDelete(user._id)}
                  onView={() => navigate(`/profile/${user._id}`)}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{(page - 1) * pageSize + 1}</span> to{" "}
                  <span className="font-semibold">{Math.min(page * pageSize, total)}</span> of{" "}
                  <span className="font-semibold">{total}</span> users
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPage(1)}
                      disabled={page === 1}
                      className="h-9 w-9"
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="h-9 w-9"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    
                    <div className="px-4 flex items-center gap-2">
                      <span className="text-sm font-medium">Page {page}</span>
                      <span className="text-gray-400">of {totalPages}</span>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="h-9 w-9"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPage(totalPages)}
                      disabled={page === totalPages}
                      className="h-9 w-9"
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {PAGE_SIZES.map(size => (
                      <option key={size} value={size}>
                        {size} per page
                      </option>
                    ))}
                  </select> */}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
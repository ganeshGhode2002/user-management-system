import React, { useEffect, useMemo, useRef, useState } from "react";
import API from "@/api/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import EditUserModal from "@/components/EditUserModal";

const PAGE_SIZES = [6, 12, 24];

function formatDate(d) {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleString();
  } catch {
    return d;
  }
}

function InitialsAvatar({ name = "", size = 44 }) {
  const initials = (name || "")
    .split(" ")
    .map((s) => s[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className="flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-sky-500 text-white font-semibold shadow"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {initials || "U"}
    </div>
  );
}

const SkeletonCard = () => (
  <div className="animate-pulse bg-white rounded-xl shadow p-4">
    <div className="flex items-center gap-3 mb-3">
      <div className="h-10 w-10 rounded-full bg-slate-200" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-slate-200 w-3/4 rounded" />
        <div className="h-3 bg-slate-200 w-1/2 rounded" />
      </div>
    </div>
    <div className="h-3 bg-slate-200 w-full mb-2 rounded" />
    <div className="h-3 bg-slate-200 w-3/4 rounded" />
  </div>
);

export default function DashboardPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // UI state
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sortDesc, setSortDesc] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [editing, setEditing] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const debounceRef = useRef(null);
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // fetch users
  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await API.get("/users");
      const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      setUsers(data);
    } catch (err) {
      console.error("fetchUsers error", err);
      toast.error("Failed to load users. Check backend & API baseURL.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, [refreshKey]);

  // filter + sort
  const filtered = useMemo(() => {
    let arr = users.slice();
    const q = (debouncedQuery || "").toLowerCase();
    if (q) {
      arr = arr.filter((u) => {
        return (
          (u.name || "").toLowerCase().includes(q) ||
          (u.email || "").toLowerCase().includes(q) ||
          (u.city || "").toLowerCase().includes(q) ||
          ((u.education || []).join(" ") || "").toLowerCase().includes(q)
        );
      });
    }
    arr.sort((a, b) => {
      const ta = new Date(a.createdAt).getTime() || 0;
      const tb = new Date(b.createdAt).getTime() || 0;
      return sortDesc ? tb - ta : ta - tb;
    });
    return arr;
  }, [users, debouncedQuery, sortDesc]);

  // pagination
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [pageSize, totalPages]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  // delete (robust)
  async function onDelete(id) {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    try {
      const res = await API.delete(`/users/${id}`);
      if (res.status === 200 || res.status === 204) {
        toast.success(res.data?.message || "User deleted");
        setUsers((prev) => prev.filter((u) => u._id !== id));
        // if you prefer, re-fetch: await fetchUsers();
      } else {
        toast.error(res.data?.message || `Delete failed (${res.status})`);
      }
    } catch (err) {
      console.error("delete error", err);
      const msg = err?.response?.data?.message;
      if (msg) toast.error(msg);
      else if (err?.response) toast.error(`Request failed: ${err.response.status}`);
      else toast.error("Network error. Check backend.");
    }
  }

  function onUpdated(updated) {
    setUsers((prev) => prev.map((u) => (u._id === updated._id ? updated : u)));
    setEditing(null);
    toast.success("User updated");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Users</h1>
          <p className="mt-1 text-sm text-slate-500">Manage registered users — search, edit or delete entries.</p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>

            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search name, email, city or education..."
              className="pl-10 pr-3 py-2 w-72 md:w-96 rounded-lg border bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              aria-label="Search users"
            />
          </div>

          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setSortDesc((s) => !s)}>
              {sortDesc ? "Newest first" : "Oldest first"}
            </Button>
            <Button size="sm" onClick={() => setRefreshKey((k) => k + 1)}>
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : total === 0 ? (
          <div className="bg-white rounded-xl p-8 shadow text-center">
            <svg className="mx-auto mb-4 w-24 h-24 text-indigo-400" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M3 7a4 4 0 014-4h10a4 4 0 014 4v7a4 4 0 01-4 4H9l-6 3V7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h3 className="text-lg font-semibold">No users yet</h3>
            <p className="mt-2 text-sm text-slate-500">Create users from the Register page — they will appear here.</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block bg-white rounded-xl shadow overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">User</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Email</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">City</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Education</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Created</th>
                    <th className="px-6 py-3 text-sm font-medium text-slate-600">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {paginated.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <InitialsAvatar name={u.name || u.email} />
                          <div>
                            <div className="font-medium text-slate-900">{u.name || "—"}</div>
                            <div className="text-xs text-slate-400">{u.role || "user"}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-700">{u.email}</div>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">{u.city || "—"}</td>

                      <td className="px-6 py-4 text-sm text-slate-600">{(u.education || []).slice(0, 3).join(", ") || "—"}</td>

                      <td className="px-6 py-4 text-sm text-slate-600">{formatDate(u.createdAt)}</td>

                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="outline" onClick={() => setEditing(u)}>
                            Edit
                          </Button>
                          <Button size="sm"  onClick={() => onDelete(u._id)}>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden grid grid-cols-1 gap-4">
              {paginated.map((u) => (
                <div key={u._id} className="bg-white rounded-xl shadow p-4 flex justify-between">
                  <div className="flex gap-3">
                    <InitialsAvatar name={u.name || u.email} size={52} />
                    <div>
                      <div className="font-medium text-slate-900">{u.name || u.email}</div>
                      <div className="text-sm text-slate-500">{u.email}</div>
                      <div className="text-xs text-slate-400 mt-2">Created: {formatDate(u.createdAt)}</div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Button size="xs" variant="outline" onClick={() => setEditing(u)}>
                      Edit
                    </Button>
                    <Button size="xs" variant="destructive" onClick={() => onDelete(u._id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="text-sm text-slate-600">
                Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, total)} of {total}
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setPage(1)} disabled={page === 1}>
                  « First
                </Button>
                <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                  ‹ Prev
                </Button>

                <div className="px-3 py-1 bg-white border rounded text-sm">Page {page} / {totalPages}</div>

                <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                  Next ›
                </Button>
                <Button size="sm" variant="outline" onClick={() => setPage(totalPages)} disabled={page === totalPages}>
                  Last »
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {editing && <EditUserModal user={editing} onClose={() => setEditing(null)} onUpdated={onUpdated} />}
    </div>
  );
}






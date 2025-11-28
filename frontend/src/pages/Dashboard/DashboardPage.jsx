// src/pages/Dashboard/DashboardPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import API from "@/api/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { Trash2 } from "lucide-react";

const PAGE_SIZES = [6, 12, 24];

function Avatar({ name = "", size = 40 }) {
  const initials =
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <div
      className="rounded-full bg-gradient-to-br from-indigo-600 to-sky-500 text-white flex items-center justify-center font-semibold shadow-sm"
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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
    debounceRef.current = setTimeout(
      () => setDebouncedQuery(query.trim()),
      300
    );
  }, [query]);

  // Auto refresh on successful edit
  useEffect(() => {
    if (location?.state?.refresh) {
      setRefreshKey((k) => k + 1);
      window.history.replaceState({}, document.title); // cleanup
    }
  }, [location]);

  // Fetch Users
  async function load() {
    setLoading(true);
    try {
      const res = await API.get("/users");
      setUsers(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch (err) {
      toast.error("Failed to load users");
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
      if (res.status === 200 || res.status === 204) {
        toast.success("User deleted");
        setUsers((prev) => prev.filter((u) => u._id !== id));
      }
    } catch {
      toast.error("Delete failed");
    }
  }

  // Edit callback
  function onUpdated(updated) {
    setUsers((prev) =>
      prev.map((u) => (u._id === updated._id ? updated : u))
    );
    toast.success("User updated");
  }

  return (
    <div className="space-y-6">

      {/* TOP BAR */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Users</h1>
          <p className="text-slate-500 text-sm mt-1">
            Search, filter, edit or delete user records.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">

          {/* Search */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeWidth="2"
                d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
              />
            </svg>

            <input
              className="pl-10 pr-3 py-2 w-72 md:w-80 rounded-lg border bg-white shadow-sm focus:ring-2 focus:ring-indigo-300"
              placeholder="Search users..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <Button
            variant="outline"
            onClick={() => setSortDesc((s) => !s)}
          >
            {sortDesc ? "Newest" : "Oldest"}
          </Button>

          <Button onClick={() => setRefreshKey((k) => k + 1)}>
            Refresh
          </Button>
        </div>
      </div>

      {/* ---- CONTENT START ---- */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading users...</div>
      ) : total === 0 ? (
        <div className="bg-white rounded-xl p-8 shadow text-center">
          <h3 className="text-lg font-semibold">No users found</h3>
          <p className="text-slate-500 text-sm mt-2">Try registering a new user.</p>
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE */}
          <div className="hidden md:block bg-white shadow rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr className="text-left text-sm text-slate-600">
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">City</th>
                  <th className="px-6 py-3">Education</th>
                  <th className="px-6 py-3">Created</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y text-sm">
                {paginated.map((u) => (
                  <tr
                    key={u._id}
                    className="hover:bg-slate-50 cursor-pointer"
                    onClick={() => navigate(`/profile/${u._id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name || u.email} />
                        <div>
                          <p className="font-medium">{u.name || "—"}</p>
                          <p className="text-xs text-slate-400">
                            {u.role || "User"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4">{u.city || "—"}</td>
                    <td className="px-6 py-4">
                      {(u.education || []).slice(0, 3).join(", ") || "—"}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(u.createdAt).toLocaleString()}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/users/${u._id}/edit`, { state: { user: u } });
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("Delete this user? This cannot be undone.")) {
                              onDelete(u._id);
                            }
                          }}
                          className="flex items-center"
                        >
                          <Trash2 size={16} />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className="md:hidden grid grid-cols-1 gap-4">
            {paginated.map((u) => (
              <div
                key={u._id}
                className="bg-white p-5 rounded-xl shadow flex gap-4 items-center cursor-pointer"
                onClick={() => navigate(`/profile/${u._id}`)}
              >
                <Avatar name={u.name || u.email} size={50} />

                <div className="flex-1">
                  <p className="font-medium">{u.name || u.email}</p>
                  <p className="text-sm text-slate-500">{u.email}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {u.city || "—"}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/users/${u._id}/edit`, { state: { user: u } });
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Delete this user? This cannot be undone.")) {
                        onDelete(u._id);
                      }
                    }}
                    className="flex items-center gap-2"
                  >
                    Delete
                  </Button>

                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-6 gap-4">
            <p className="text-sm text-slate-600">
              Showing {(page - 1) * pageSize + 1} –{" "}
              {Math.min(page * pageSize, total)} of {total}
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(1)}
                disabled={page === 1}
              >
                « First
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ‹ Prev
              </Button>

              <div className="px-3 py-1 bg-white rounded border text-sm">
                Page {page} / {totalPages}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next ›
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
              >
                Last »
              </Button>
            </div>
          </div>
        </>
      )}

      {/* ---- CONTENT END ---- */}
    </div>
  );
}

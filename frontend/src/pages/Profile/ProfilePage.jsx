// src/pages/Profile/ProfilePage.jsx
import React, { useEffect, useState, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API, { SERVER_BASE } from "@/api/axios";
import { toast } from "sonner";
import { AuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";


function HeroAvatar({ src, name = "", size = 180 }) {
  const initials =
    (name || "")
      .split(" ")
      .map((n) => n[0] || "")
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <div className="flex justify-center -mt-12">
      <div
        className="rounded-full bg-linear-to-br from-indigo-600 to-sky-500 p-1 shadow-2xl"
        style={{ width: size + 10, height: size + 10 }}
      >
        <div
          className="rounded-full bg-white overflow-hidden flex items-center justify-center text-slate-800 font-bold"
          style={{ width: size, height: size }}
        >
          {src ? (
            <img src={src} alt={name || "avatar"} className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl">{initials}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

 


  useEffect(() => {
    if (!id) {
      toast.error("User ID missing");
      navigate("/dashboard");
      return;
    }
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await API.get(`/users/${id}`);
        if (!mounted) return;
        setUser(res.data?.user ?? res.data);
      } catch (err) {
        console.error("Profile fetch error", err);
        toast.error(err?.response?.data?.message || "Failed to fetch user");
        navigate("/dashboard");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [id, navigate]);

 

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="text-slate-500">Loading profile…</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="text-slate-500">User not found.</div>
      </div>
    );
  }

  // derive image URLs (if images stored as filenames)
  const images = Array.isArray(user.images) ? user.images.filter(Boolean) : [];
  const imageUrls = images.map((img) => (img.startsWith("http") ? img : `${SERVER_BASE}/uploads/${img}`));
  const primary = imageUrls[0] || user.avatarUrl || null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* HERO section with big photo */}
      <div className="bg-white rounded-2xl shadow p-6 border border-slate-100 relative overflow-visible">
        <HeroAvatar src={primary} name={user.name || user.email} size={180} />

        <div className="mt-6 text-center">
         
          <p className="text-sm text-slate-500 mt-1">{user.role || "User"}</p>

          <div className="mt-4 flex justify-center gap-3">
           
            <Button  variant="outline" onClick={() => navigate("/dashboard")}>Back</Button>
          </div>
        </div>
      </div>

      {/* DETAILS card (single card, full width on mobile, narrower on desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow p-5 border border-slate-100">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500">Email</p>
                <p className="mt-1 font-medium text-slate-800 wrap-break-word">{user.email}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500">City</p>
                <p className="mt-1 font-medium text-slate-800">{user.city || "—"}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Education</p>
                <p className="mt-1 font-medium text-slate-800">
                  {(user.education || []).length ? (user.education || []).join(", ") : "—"}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Created</p>
                <p className="mt-1 font-medium text-slate-800">{user.createdAt ? new Date(user.createdAt).toLocaleString() : "—"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery preview (span 2 cols on large screens) */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow p-5 border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-slate-900">Photos</h3>
              <div className="text-sm text-slate-500">{imageUrls.length} photo{imageUrls.length !== 1 ? "s" : ""}</div>
            </div>

            {imageUrls.length === 0 ? (
              <div className="py-8 text-center text-slate-500">No photos uploaded.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {imageUrls.map((src, idx) => (
                  <div key={idx} className="rounded-lg overflow-hidden border border-slate-100 bg-white shadow-sm">
                    <button
                      type="button"
                      onClick={() => setLightbox({ open: true, src, alt: `${user.name || user.email} photo ${idx + 1}` })}
                      className="w-full h-48 sm:h-44 lg:h-40 flex items-center justify-center overflow-hidden focus:outline-none"
                      aria-label={`Open photo ${idx + 1}`}
                    >
                      <img src={src} alt={`photo-${idx}`} className="w-full h-full object-cover transform transition group-hover:scale-105" />
                    </button>
                    <div className="px-3 py-2 text-xs text-slate-600">{`Photo ${idx + 1}`}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    

      
    </div>
  );
}

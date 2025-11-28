// src/pages/Dashboard/EditUserPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import API, { SERVER_BASE } from "@/api/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export default function EditUserPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const preloaded = location.state?.user ?? null;

  const [user, setUser] = useState(preloaded);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [progressPct, setProgressPct] = useState(0);

  const [form, setForm] = useState({
    email: "",
    gender: "male",
    city: "",
    education: [],
  });

  // files object uses keys "image1"... "image4"
  const [files, setFiles] = useState({});
  const [previews, setPreviews] = useState([null, null, null, null]);
  const [clearIndices, setClearIndices] = useState(new Set());

  const inputRefs = useRef([React.createRef(), React.createRef(), React.createRef(), React.createRef()]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        if (!preloaded) {
          const res = await API.get(`/users/${id}`);
          if (!mounted) return;
          setUser(res.data?.user ?? res.data);
        } else {
          setUser(preloaded);
        }
      } catch (err) {
        console.error("load user error", err);
        toast.error("Failed to load user");
        navigate("/dashboard");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, [id, preloaded, navigate]);

  // populate form fields + server previews
  useEffect(() => {
    if (!user) return;
    setForm({
      email: user.email || "",
      gender: user.gender || "male",
      city: user.city || "",
      education: Array.isArray(user.education) ? user.education.slice() : [],
    });

    const imgs = Array.isArray(user.images) ? user.images.slice(0, 4) : [];
    const initial = [null, null, null, null];
    for (let i = 0; i < 4; i++) {
      if (imgs[i]) {
        initial[i] = imgs[i].startsWith("http") ? imgs[i] : `${SERVER_BASE}/uploads/${encodeURIComponent(imgs[i])}`;
      }
    }
    setPreviews(initial);
    setFiles({});
    setClearIndices(new Set());
  }, [user]);

  function setField(key, value) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  function toggleEducation(value) {
    setForm((s) => {
      const setE = new Set(s.education || []);
      if (setE.has(value)) setE.delete(value);
      else setE.add(value);
      return { ...s, education: Array.from(setE) };
    });
  }

  function triggerFileInput(idx) {
    const ref = inputRefs.current[idx];
    if (ref && ref.current) ref.current.click();
  }

  function onFileChange(e, idx) {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!f.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      toast.error("File too large (max 2MB)");
      return;
    }

    // show preview via FileReader (same as your modal)
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreviews((p) => {
        const np = p.slice();
        np[idx] = ev.target.result;
        return np;
      });
    };
    reader.readAsDataURL(f);

    setFiles((s) => ({ ...s, [`image${idx + 1}`]: f }));

    // if this was previously marked for deletion, unmark it (we're replacing)
    setClearIndices((s) => {
      const ns = new Set(Array.from(s));
      if (ns.has(idx)) ns.delete(idx);
      return ns;
    });
  }

  function removeImage(idx) {
    // clear preview and mark for removal
    setPreviews((p) => {
      const np = p.slice();
      np[idx] = null;
      return np;
    });

    setFiles((s) => {
      const copy = { ...s };
      delete copy[`image${idx + 1}`];
      return copy;
    });

    setClearIndices((s) => {
      const ns = new Set(Array.from(s));
      ns.add(idx);
      return ns;
    });
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setProgressPct(0);
    try {
      const fd = new FormData();
      if (form.email) fd.append("email", form.email);
      if (form.gender) fd.append("gender", form.gender);
      if (form.city) fd.append("city", form.city);
      (form.education || []).forEach((ed) => fd.append("education", ed));

      for (let i = 1; i <= 4; i++) {
        const key = `image${i}`;
        if (files[key]) fd.append(key, files[key]);
      }

      if (clearIndices.size) fd.append("clearIndices", JSON.stringify(Array.from(clearIndices)));

      const res = await API.put(`/users/${id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress(progressEvent) {
          if (progressEvent.total) {
            const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgressPct(pct);
          }
        },
      });

      if (res?.data?.success) {
        toast.success("User updated");
        navigate("/dashboard", { replace: true, state: { refresh: true } });
      } else {
        toast.error(res?.data?.message || "Update failed");
      }
    } catch (err) {
      console.error("update error", err);
      toast.error(err?.response?.data?.message || "Server error while updating user");
    } finally {
      setSaving(false);
      setProgressPct(0);
    }
  }

  if (!user) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-slate-600">
        Loading user…
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="shadow-lg border">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-slate-900">Edit user</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  className="mt-2 block w-full rounded-md border px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">City</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setField("city", e.target.value)}
                  className="mt-2 block w-full rounded-md border px-3 py-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-slate-700">Gender</p>
                <div className="flex gap-4 mt-2">
                  {["male", "female", "others"].map((g) => (
                    <label key={g} className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="gender"
                        value={g}
                        checked={form.gender === g}
                        onChange={(e) => setField("gender", e.target.value)}
                      />
                      {g[0].toUpperCase() + g.slice(1)}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700">Education</p>
                <div className="flex gap-3 flex-wrap mt-2">
                  {["SSC", "HSC", "BSC", "BCOM", "MCA", "Phd"].map((ed) => (
                    <label key={ed} className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={(form.education || []).includes(ed)}
                        onChange={() =>
                          setField(
                            "education",
                            (form.education || []).includes(ed)
                              ? form.education.filter((x) => x !== ed)
                              : [...(form.education || []), ed]
                          )
                        }
                      />
                      {ed}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-slate-700 mb-3">Images (replace or remove)</div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col items-center shadow-sm min-h-[150px]">
                    <div
                      className="w-full h-28 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center cursor-pointer"
                      onClick={() => triggerFileInput(i)}
                    >
                      {previews[i] ? (
                        <img
                          src={String(previews[i] || "").trim()}
                          alt={`img-${i}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src =
                              "data:image/svg+xml;utf8," +
                              encodeURIComponent(
                                `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'><rect width='100%' height='100%' fill='#f1f5f9'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#94a3b8' font-family='Arial' font-size='16'>Image not available</text></svg>`
                              );
                          }}
                        />
                      ) : (
                        <span className="text-xs text-slate-400">No image</span>
                      )}
                    </div>

                    <input
                      ref={inputRefs.current[i]}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => onFileChange(e, i)}
                    />

                    <div className="flex gap-2 mt-3 w-full">
                      <button
                        type="button"
                        onClick={() => triggerFileInput(i)}
                        className="flex-1 text-xs px-2 py-1.5 border rounded-lg hover:bg-slate-50"
                        disabled={saving}
                      >
                        Replace
                      </button>

                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="flex-1 text-xs px-2 py-1.5 border rounded-lg text-red-600 hover:bg-red-50"
                        disabled={saving}
                      >
                        Remove
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-2 truncate w-full text-center">
                      {user.images && user.images[i] ? user.images[i] : `slot ${i + 1}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button variant="ghost" onClick={() => navigate(-1)} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

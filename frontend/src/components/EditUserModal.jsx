// src/components/EditUserModal.jsx
import React, { useState } from "react";
import API from "@/api/axios";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function EditUserModal({ user, onClose, onUpdated }) {
  const [form, setForm] = useState({
    email: user.email || "",
    gender: user.gender || "",
    city: user.city || "",
    education: user.education || [],
  });
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(false);

  function onFileChange(e, key) {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) return toast.error("Only images allowed");
    setFiles(s => ({...s, [key]: f}));
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      if (form.email) fd.append("email", form.email);
      if (form.gender) fd.append("gender", form.gender);
      if (form.city) fd.append("city", form.city);
      form.education.forEach(ed => fd.append("education", ed));
      for (let i=1;i<=4;i++){
        const k = `image${i}`;
        if (files[k]) fd.append(k, files[k]);
      }
      const res = await API.put(`/${user._id}`, fd, { headers: {"Content-Type":"multipart/form-data"} });
      if (res.data?.success) onUpdated(res.data.user);
      else toast.error(res.data?.message || "Update failed");
    } catch(err){
      toast.error("Server error");
    } finally { setLoading(false); onClose(); }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <div className="bg-white p-6 rounded shadow max-w-2xl mx-auto">
        <h3 className="text-xl font-semibold mb-4">Edit User</h3>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-sm">Email</label>
            <input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label className="text-sm">City</label>
            <input value={form.city} onChange={e=>setForm({...form,city:e.target.value})} className="w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label>Replace Image 1</label>
            <input type="file" accept="image/*" onChange={(e)=>onFileChange(e, "image1")} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}

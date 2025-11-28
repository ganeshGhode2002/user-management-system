// src/pages/Profile/_EditProfileForm.jsx
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

export default function EditProfileForm({
  current = {},
  onSave,
  onCancel,
  saving = false,
}) {
  const [form, setForm] = useState({ ...current });

  useEffect(() => {
    setForm({ ...current });
  }, [current]);

  function handle(e) {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast.error("Name and email are required");
      return;
    }
    await onSave(form);
  }

  return (
    <form
      onSubmit={submit}
      className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg space-y-5 animate-fadeIn"
    >
      {/* GRID INPUTS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-slate-600">Full Name</label>
          <input
            name="name"
            value={form.name || ""}
            onChange={handle}
            className="mt-1 w-full rounded-lg border px-3 py-2 bg-white shadow-sm focus:ring-2 focus:ring-indigo-200 outline-none"
            placeholder="Your full name"
          />
        </div>

        <div>
          <label className="text-sm text-slate-600">Email</label>
          <input
            name="email"
            value={form.email || ""}
            onChange={handle}
            className="mt-1 w-full rounded-lg border px-3 py-2 bg-white shadow-sm focus:ring-2 focus:ring-indigo-200 outline-none"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label className="text-sm text-slate-600">Phone</label>
          <input
            name="phone"
            value={form.phone || ""}
            onChange={handle}
            className="mt-1 w-full rounded-lg border px-3 py-2 bg-white shadow-sm focus:ring-2 focus:ring-indigo-200 outline-none"
            placeholder="Phone number"
          />
        </div>

        <div>
          <label className="text-sm text-slate-600">City</label>
          <input
            name="city"
            value={form.city || ""}
            onChange={handle}
            className="mt-1 w-full rounded-lg border px-3 py-2 bg-white shadow-sm focus:ring-2 focus:ring-indigo-200 outline-none"
            placeholder="City / Location"
          />
        </div>
      </div>

      {/* BIO TEXTAREA */}
      <div>
        <label className="text-sm text-slate-600">Bio</label>
        <textarea
          name="bio"
          value={form.bio || ""}
          onChange={handle}
          className="mt-1 w-full rounded-lg border px-3 py-2 bg-white shadow-sm h-24 resize-none focus:ring-2 focus:ring-indigo-200 outline-none"
          placeholder="Write something about yourself..."
        />
      </div>

      {/* PUBLIC TOGGLE */}
      <div className="flex items-center justify-between pt-2">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            name="isPublic"
            checked={!!form.isPublic}
            onChange={handle}
            className="h-4 w-4 rounded border-slate-300"
          />
          Public Profile
        </label>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="px-4 py-2 rounded-lg border bg-white hover:bg-slate-50 shadow-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className={`px-4 py-2 rounded-lg text-white shadow-sm ${
              saving
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </form>
  );
}

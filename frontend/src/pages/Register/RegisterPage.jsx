import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "@/api/axios"; // your axios instance with baseURL
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const CITIES = ["Mumbai", "Pune", "Satara", "Nashik"];
const EDUCATION = ["SSC", "HSC", "BSC", "BCOM", "MCA", "Phd"];

function ImageSlot({ idx, preview, onFileChange, onRemove }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-28 h-28 md:w-32 md:h-32 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shadow-sm">
        {preview ? (
          <img src={preview} alt={`preview-${idx}`} className="w-full h-full object-cover" />
        ) : (
          <div className="text-xs text-slate-400">No image</div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <label className="cursor-pointer text-xs px-3 py-1 rounded-md border bg-white hover:bg-slate-50">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
          />
          Upload
        </label>

        {preview && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-red-600 hover:underline"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    gender: "male",
    city: CITIES[0],
    education: [],
  });

  const [images, setImages] = useState([null, null, null, null]);
  const [previews, setPreviews] = useState([null, null, null, null]);
  const [loading, setLoading] = useState(false);

  function change(e) {
    const { name, value, type, checked } = e.target;

    if (name === "education") {
      setForm((s) => {
        const setEdu = new Set(s.education);
        if (checked) setEdu.add(value);
        else setEdu.delete(value);
        return { ...s, education: [...setEdu] };
      });
      return;
    }

    setForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  }

  function changeImage(index, file) {
    const newImgs = [...images];
    newImgs[index] = file || null;
    setImages(newImgs);

    if (!file) {
      const p = [...previews];
      p[index] = null;
      setPreviews(p);
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const p = [...previews];
      p[index] = ev.target.result;
      setPreviews(p);
    };
    reader.readAsDataURL(file);
  }

  function validate() {
    if (!form.email.trim()) return "Email required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Invalid email";
    if (!form.password.trim()) return "Password required";
    if (form.password.length < 6) return "Password must be at least 6 chars";
    if (form.password !== form.confirmPassword)
      return "Passwords do not match";
    return null;
  }

  // Upload a single file to /api/upload and return the S3 key (string)
  async function uploadFile(file) {
    if (!file) return null;
    const fd = new FormData();
    fd.append("image", file);
    const res = await API.post("/upload", fd, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    // res.data => { url, key }
    return res.data?.key ?? null;
  }

  async function submit(e) {
    e.preventDefault();

    const err = validate();
    if (err) return toast.error(err);

    setLoading(true);
    try {
      // 1) Upload images sequentially (safe + predictable)
      const keys = [];
      for (const file of images) {
        if (!file) { keys.push(null); continue; }
        const k = await uploadFile(file); // key like "uploads/xxx.jpg"
        keys.push(k);
      }

      // 2) Build payload and remove nulls
      const payload = {
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        gender: form.gender,
        city: form.city,
        education: form.education,
        photoKeys: keys.filter(Boolean) // only actual keys
      };

      // 3) Register
      const res = await API.post("/users/register", payload);

      if (res.data?.success) {
        toast.success("Registered successfully!");
        navigate("/login");
      } else {
        toast.error(res.data?.message || "Register failed");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex justify-center bg-gradient-to-b from-slate-100 to-white p-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-slate-200 p-8">

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-semibold text-slate-900">Create Account</h2>
          <p className="text-sm text-slate-500 mt-1">
            Fill in your details and upload up to 4 images.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-8">

          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={change}
                className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">City</label>
              <select
                name="city"
                value={form.city}
                onChange={change}
                className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={change}
                className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder="Enter password"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Confirm Password</label>
              <input
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={change}
                className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder="Repeat password"
              />
            </div>
          </div>

          {/* Gender + Education */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="text-sm font-medium text-slate-700">Gender</div>
              <div className="mt-3 flex gap-6">
                {["male", "female", "others"].map((g) => (
                  <label key={g} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="gender"
                      value={g}
                      checked={form.gender === g}
                      onChange={change}
                    />
                    {g.toUpperCase()}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-slate-700">Education</div>
              <div className="mt-3 flex flex-wrap gap-4">
                {EDUCATION.map((ed) => (
                  <label key={ed} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="education"
                      value={ed}
                      checked={form.education.includes(ed)}
                      onChange={change}
                    />
                    {ed}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Image uploads */}
          <div>
            <div className="text-sm font-medium text-slate-700 mb-3">
              Upload up to 4 images
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[0, 1, 2, 3].map((i) => (
                <ImageSlot
                  key={i}
                  idx={i}
                  preview={previews[i]}
                  onFileChange={(file) => changeImage(i, file)}
                  onRemove={() => changeImage(i, null)}
                />
              ))}
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 mt-4"
          >
            {loading ? "Creating account..." : "Create account"}
          </Button>

          <p className="text-sm text-slate-600">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-indigo-600 hover:underline"
            >
              Login
            </button>
          </p>

        </form>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "@/api/axios";
import { toast } from "sonner";

const CITIES = ["Mumbai", "Pune", "Satara", "Nashik"];
const EDUCATION = ["SSC", "HSC", "BSC", "BCOM", "MCA", "Phd"];

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

  // images state: store File or null + preview data URL
  const [images, setImages] = useState([null, null, null, null]); // files
  const [previews, setPreviews] = useState([null, null, null, null]); // dataURL
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    if (name === "education") {
      // checkbox handling
      setForm((s) => {
        const arr = new Set(s.education);
        if (checked) arr.add(value);
        else arr.delete(value);
        return { ...s, education: Array.from(arr) };
      });
    } else if (type === "radio") {
      setForm((s) => ({ ...s, [name]: value }));
    } else {
      setForm((s) => ({ ...s, [name]: value }));
    }
  }

  function handleImageChange(index, file) {
    const newImgs = [...images];
    newImgs[index] = file || null;
    setImages(newImgs);

    if (!file) {
      const newPre = [...previews];
      newPre[index] = null;
      setPreviews(newPre);
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const newPre = [...previews];
      newPre[index] = ev.target.result;
      setPreviews(newPre);
    };
    reader.readAsDataURL(file);
  }

  function validate() {
    if (!form.email.trim()) return "Email is required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Enter a valid email";
    if (!form.password) return "Password is required";
    if (form.password.length < 6) return "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword) return "Passwords do not match";
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const err = validate();
    if (err) return toast.error(err);

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("email", form.email.trim().toLowerCase());
      formData.append("password", form.password);
      formData.append("confirmPassword", form.confirmPassword);
      formData.append("gender", form.gender);
      formData.append("city", form.city);

      // education as multiple checkboxes -> send as repeated fields
      if (Array.isArray(form.education) && form.education.length) {
        form.education.forEach((edu) => formData.append("education", edu));
      }

      // images: image1..image4
      images.forEach((f, idx) => {
        if (f) formData.append(`image${idx + 1}`, f);
      });

      // POST to backend. Your backend register controller expects file fields and text fields.
      const res = await API.post("/users/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // handle response shapes: { success: true, user } or user object
      const ok = res.data?.success ?? true;
      if (ok) {
        toast.success("Registered successfully — please login");
        // optional: clear form
        setForm({
          email: "",
          password: "",
          confirmPassword: "",
          gender: "male",
          city: CITIES[0],
          education: [],
        });
        setImages([null, null, null, null]);
        setPreviews([null, null, null, null]);
        // redirect to login
        navigate("/login");
        return;
      } else {
        toast.error(res.data?.message || "Registration failed");
      }
    } catch (error) {
      console.error("register error", error);
      const msg = error?.response?.data?.message || "Server error — registration failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white p-6">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg border p-6">
        <h2 className="text-2xl font-semibold text-slate-900 mb-1">Register</h2>
        <p className="text-sm text-slate-500 mb-6">Fill the form and upload up to 4 images. After register you'll be redirected to login.</p>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-indigo-200"
                placeholder="you@example.com"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">City</span>
              <select
                name="city"
                value={form.city}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 bg-white"
              >
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Password</span>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-indigo-200"
                placeholder="Enter password"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Confirm password</span>
              <input
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-indigo-200"
                placeholder="Repeat password"
              />
            </label>
          </div>

          <div className="flex gap-6 items-center">
            <div>
              <div className="text-sm font-medium text-slate-700">Gender</div>
              <div className="flex gap-4 mt-2">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="radio" name="gender" value="male" checked={form.gender === "male"} onChange={handleChange} />
                  Male
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="radio" name="gender" value="female" checked={form.gender === "female"} onChange={handleChange} />
                  Female
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="radio" name="gender" value="others" checked={form.gender === "others"} onChange={handleChange} />
                  Others
                </label>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-slate-700">Education</div>
              <div className="flex flex-wrap gap-3 mt-2">
                {EDUCATION.map((ed) => (
                  <label key={ed} className="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" name="education" value={ed} checked={form.education.includes(ed)} onChange={handleChange} />
                    {ed}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Image uploads */}
          <div>
            <div className="text-sm font-medium text-slate-700 mb-2">Upload up to 4 images (one per slot)</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[0,1,2,3].map((i) => (
                <div key={i} className="border rounded-lg p-3 flex flex-col items-center gap-2">
                  {previews[i] ? (
                    <img src={previews[i]} alt={`preview-${i}`} className="w-24 h-24 object-cover rounded" />
                  ) : (
                    <div className="w-24 h-24 bg-slate-100 rounded flex items-center justify-center text-slate-400">No image</div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(i, e.target.files?.[0] || null)}
                    className="text-xs"
                  />
                  {previews[i] && (
                    <button
                      type="button"
                      onClick={() => handleImageChange(i, null)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-lg px-4 py-2 font-medium transition ${
                loading ? "bg-slate-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {loading ? "Registering..." : "Create account"}
            </button>
          </div>
        </form>

        <div className="mt-4 text-sm text-slate-500">
          Already registered?{" "}
          <button onClick={() => navigate("/login")} className="text-indigo-600 hover:underline">Login</button>
        </div>
      </div>
    </div>
  );
}

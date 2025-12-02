import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "@/api/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2, Mail, MapPin, Lock, User, GraduationCap, Camera } from "lucide-react";

const CITIES = ["Mumbai", "Pune", "Satara", "Nashik"];
const EDUCATION = ["SSC", "HSC", "BSC", "BCOM", "MCA", "Phd"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function ImageSlot({ idx, preview, onFileChange, onRemove }) {
  return (
    <div className="group relative">
      <div className="w-full h-32 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 overflow-hidden flex items-center justify-center hover:border-blue-400 transition-colors">
        {preview ? (
          <div className="relative w-full h-full">
            <img 
              src={preview} 
              alt={`preview-${idx}`} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            {/* Remove button overlay */}
            <button
              type="button"
              onClick={onRemove}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="text-center p-4">
            <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Upload Photo</p>
            <p className="text-xs text-gray-400 mt-1">Slot {idx + 1}</p>
          </div>
        )}
      </div>
      
      {!preview && (
        <div className="mt-2">
          <label className="cursor-pointer block">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onFileChange(e.target.files?.[0])}
            />
            <div className="text-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors w-full">
              Upload
            </div>
          </label>
        </div>
      )}
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
  const [uploading, setUploading] = useState(false);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    if (name === "education") {
      setForm((prev) => {
        const educationSet = new Set(prev.education);
        if (checked) {
          educationSet.add(value);
        } else {
          educationSet.delete(value);
        }
        return { ...prev, education: Array.from(educationSet) };
      });
      return;
    }

    setForm((prev) => ({ 
      ...prev, 
      [name]: type === "checkbox" ? checked : value 
    }));
  }

  function changeImage(index, file) {
    // If file is null, remove the image
    if (!file) {
      const newImages = [...images];
      const newPreviews = [...previews];
      newImages[index] = null;
      newPreviews[index] = null;
      setImages(newImages);
      setPreviews(newPreviews);
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const newImages = [...images];
    const newPreviews = [...previews];
    
    newImages[index] = file;
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      newPreviews[index] = e.target.result;
      setPreviews([...newPreviews]);
    };
    reader.readAsDataURL(file);
    
    setImages(newImages);
  }

  function validateForm() {
    if (!form.email.trim()) {
      return "Email is required";
    }
    
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      return "Invalid email format";
    }
    
    if (!form.password.trim()) {
      return "Password is required";
    }
    
    if (form.password.length < 6) {
      return "Password must be at least 6 characters";
    }
    
    if (form.password !== form.confirmPassword) {
      return "Passwords do not match";
    }
    
    return null;
  }

  // Upload a single file to /upload endpoint (FIXED: removed extra /api/)
  async function uploadFile(file) {
    if (!file) return null;
    
    const formData = new FormData();
    formData.append("image", file);
    
    try {
      // FIX: Changed from "/api/upload" to "/upload"
      const response = await API.post("/upload", formData, {
        headers: { 
          "Content-Type": "multipart/form-data" 
        }
      });
      
      console.log("✅ File uploaded:", response.data);
      
      if (response.data.success && response.data.key) {
        return response.data.key;
      } else {
        throw new Error("Upload failed: No key returned");
      }
    } catch (error) {
      console.error("❌ Upload error:", error);
      throw new Error(error.response?.data?.error || "File upload failed");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Validate form
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }
    
    setLoading(true);
    
    try {
      // 1. Upload images first
      console.log("📤 Starting image uploads...");
      const uploadedKeys = [];
      
      // Only upload non-null images
      const imagesToUpload = images.filter(img => img !== null);
      
      for (let i = 0; i < imagesToUpload.length; i++) {
        const file = imagesToUpload[i];
        try {
          console.log(`📤 Uploading image ${i + 1}...`);
          setUploading(true);
          const key = await uploadFile(file);
          if (key) {
            uploadedKeys.push(key);
            console.log(`✅ Image ${i + 1} uploaded: ${key}`);
          }
        } catch (error) {
          console.error(`❌ Failed to upload image ${i + 1}:`, error);
          toast.error(`Failed to upload image ${i + 1}. You can continue without it.`);
        }
      }
      
      console.log("📋 Uploaded keys:", uploadedKeys);
      
      // 2. Prepare registration payload
      const payload = {
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        gender: form.gender,
        city: form.city,
        education: form.education,
        images: uploadedKeys
      };
      
      console.log("📦 Registration payload:", payload);
      
      // 3. Register user
      const response = await API.post("/users/register", payload);
      
      console.log("✅ Registration response:", response.data);
      
      if (response.data.success) {
        toast.success("Account created successfully!");
        navigate("/login");
      } else {
        toast.error(response.data.message || "Registration failed");
      }
      
    } catch (error) {
      console.error("❌ Registration error:", error);
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
      setUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            ← Back to Login
          </Button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-blue-600 to-indigo-700 text-white p-8">
            <h1 className="text-3xl font-bold mb-2">Create New Account</h1>
            <p className="text-blue-100 opacity-90">Join our platform and manage your profile</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-3">
                Personal Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Mail className="h-4 w-4" />
                    Email Address *
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                {/* City */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <MapPin className="h-4 w-4" />
                    City
                  </label>
                  <select
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition"
                  >
                    {CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Lock className="h-4 w-4" />
                    Password *
                  </label>
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition"
                    placeholder="Enter password"
                    required
                  />
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Lock className="h-4 w-4" />
                    Confirm Password *
                  </label>
                  <input
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition"
                    placeholder="Confirm password"
                    required
                  />
                </div>

                {/* Gender */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <User className="h-4 w-4" />
                    Gender
                  </label>
                  <div className="flex gap-6">
                    {["male", "female", "others"].map((gender) => (
                      <label key={gender} className="flex items-center gap-3 cursor-pointer">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                          form.gender === gender ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                        }`}>
                          {form.gender === gender && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                        <input
                          type="radio"
                          name="gender"
                          value={gender}
                          checked={form.gender === gender}
                          onChange={handleChange}
                          className="hidden"
                        />
                        <span className="text-gray-700 capitalize">
                          {gender}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Education */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <GraduationCap className="h-4 w-4" />
                    Education
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {EDUCATION.map((edu) => (
                      <label key={edu} className="flex items-center gap-3 cursor-pointer">
                        <div className={`w-5 h-5 border rounded flex items-center justify-center transition ${
                          form.education.includes(edu) ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                        }`}>
                          {form.education.includes(edu) && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <input
                          type="checkbox"
                          name="education"
                          value={edu}
                          checked={form.education.includes(edu)}
                          onChange={handleChange}
                          className="hidden"
                        />
                        <span className="text-gray-700">
                          {edu}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-3">
                <h2 className="text-xl font-semibold text-gray-800">Profile Photos</h2>
                <p className="text-sm text-gray-500">
                  {images.filter(img => img !== null).length} of 4 photos
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[0, 1, 2, 3].map((index) => (
                  <ImageSlot
                    key={index}
                    idx={index}
                    preview={previews[index]}
                    onFileChange={(file) => changeImage(index, file)}
                    onRemove={() => changeImage(index, null)}
                  />
                ))}
              </div>
              
              <p className="text-sm text-gray-500 text-center">
                Upload up to 4 photos. First photo will be used as profile picture.
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 text-lg rounded-lg transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {uploading ? "Uploading images..." : "Creating account..."}
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>
              
              <p className="text-center text-sm text-gray-600 mt-4">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-blue-600 hover:text-blue-700 font-medium transition"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
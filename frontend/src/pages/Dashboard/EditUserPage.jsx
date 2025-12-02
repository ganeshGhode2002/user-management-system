import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import API from "@/api/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Upload, X, Loader2, ChevronLeft } from "lucide-react";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function EditUserPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Form fields
  const [form, setForm] = useState({
    email: "",
    gender: "male",
    city: "",
    education: []
  });
  
  // Images state: array of objects
  const [images, setImages] = useState([
    { key: null, file: null, preview: null, isNew: false },
    { key: null, file: null, preview: null, isNew: false },
    { key: null, file: null, preview: null, isNew: false },
    { key: null, file: null, preview: null, isNew: false }
  ]);
  
  const fileInputRefs = useRef([null, null, null, null]);

  // Load user data
  useEffect(() => {
    let mounted = true;
    
    async function loadUser() {
      try {
        setLoading(true);
        const res = await API.get(`/users/${id}`);
        
        if (!mounted) return;
        
        const userData = res.data?.user || res.data;
        console.log("📥 Loaded user data:", userData);
        
        // Set form fields
        setForm({
          email: userData.email || "",
          gender: userData.gender || "male",
          city: userData.city || "",
          education: Array.isArray(userData.education) ? userData.education : []
        });
        
        // Set images from user data
        const userImages = userData.images || []; // Array of S3 keys
        const userPhotos = userData.photos || []; // Array of presigned URLs
        
        const initialImages = [...images];
        
        // Fill available slots with existing images
        userImages.forEach((key, index) => {
          if (index < 4) {
            initialImages[index] = {
              key: key,
              file: null,
              preview: userPhotos[index] || null,
              isNew: false
            };
          }
        });
        
        setImages(initialImages);
        
      } catch (error) {
        console.error("❌ Failed to load user:", error);
        toast.error("Failed to load user data");
        navigate("/dashboard");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    
    loadUser();
    
    return () => {
      mounted = false;
    };
  }, [id, navigate]);

  // Handle form field changes
  const handleFieldChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // Handle education toggles
  const toggleEducation = (value) => {
    setForm(prev => {
      const current = new Set(prev.education || []);
      if (current.has(value)) {
        current.delete(value);
      } else {
        current.add(value);
      }
      return { ...prev, education: Array.from(current) };
    });
  };

  // Trigger file input
  const triggerFileInput = (index) => {
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index].click();
    }
  };

  // Handle file selection
  const handleFileSelect = async (event, index) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      return;
    }
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    
    // Update images state
    setImages(prev => {
      const updated = [...prev];
      // Clean up old preview if it exists
      if (updated[index].preview && updated[index].preview.startsWith('blob:')) {
        URL.revokeObjectURL(updated[index].preview);
      }
      
      updated[index] = {
        key: null, // Will be set after upload
        file: file,
        preview: previewUrl,
        isNew: true
      };
      
      return updated;
    });
    
    // Reset file input
    event.target.value = "";
  };

  // Remove image from slot
  const removeImage = (index) => {
    setImages(prev => {
      const updated = [...prev];
      
      // Clean up preview URL
      if (updated[index].preview && updated[index].preview.startsWith('blob:')) {
        URL.revokeObjectURL(updated[index].preview);
      }
      
      // Clear the slot
      updated[index] = {
        key: null,
        file: null,
        preview: null,
        isNew: false
      };
      
      return updated;
    });
  };

  // Upload a single image file
  const uploadImageFile = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    
    try {
      const response = await API.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      if (response.data.success) {
        return response.data.key; // S3 key
      } else {
        throw new Error(response.data.message || "Upload failed");
      }
    } catch (error) {
      console.error("❌ Image upload error:", error);
      throw error;
    }
  };

  // Main submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setUploading(true);
    
    try {
      console.log("🚀 Starting update process...");
      
      // 1. Upload new images first
      const uploadPromises = images
        .filter(img => img.file && img.isNew)
        .map(async (img, index) => {
          try {
            const s3Key = await uploadImageFile(img.file);
            console.log(`✅ Uploaded image ${index + 1}:`, s3Key);
            return s3Key;
          } catch (error) {
            console.error(`❌ Failed to upload image ${index + 1}:`, error);
            toast.error(`Failed to upload image ${index + 1}`);
            return null;
          }
        });
      
      const uploadedKeys = (await Promise.all(uploadPromises)).filter(key => key);
      console.log("📤 Uploaded S3 keys:", uploadedKeys);
      
      // 2. Prepare final images array
      const finalImageKeys = [];
      
      // Add existing keys (not new and not null)
      images.forEach(img => {
        if (img.key && !img.isNew) {
          finalImageKeys.push(img.key);
        }
      });
      
      // Add newly uploaded keys
      finalImageKeys.push(...uploadedKeys);
      
      console.log("📋 Final image keys to save:", finalImageKeys);
      
      // 3. Prepare update payload
      const payload = {
        email: form.email,
        gender: form.gender,
        city: form.city,
        education: form.education,
        images: finalImageKeys // Send as 'images' array
      };
      
      console.log("📦 Sending payload:", payload);
      
      // 4. Update user
      const response = await API.put(`/users/${id}`, payload);
      
      if (response.data.success) {
        console.log("✅ Update successful:", response.data);
        toast.success("User updated successfully!");
        
        // Navigate back with refresh flag
        navigate("/dashboard", {
          replace: true,
          state: { 
            refresh: true,
            message: "User updated successfully" 
          }
        });
      } else {
        toast.error(response.data.message || "Update failed");
      }
      
    } catch (error) {
      console.error("❌ Update error:", error);
      toast.error(error.response?.data?.message || "Failed to update user");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  // Clean up blob URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach(img => {
        if (img.preview && img.preview.startsWith('blob:')) {
          URL.revokeObjectURL(img.preview);
        }
      });
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        
        <Card className="shadow-2xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold">Edit User Profile</CardTitle>
            <p className="text-blue-100">Update user information and manage photos</p>
          </CardHeader>
          
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Basic Information Section */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-3">
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Email */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => handleFieldChange("email", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                      placeholder="user@example.com"
                    />
                  </div>
                  
                  {/* City */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      City
                    </label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => handleFieldChange("city", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Enter city"
                    />
                  </div>
                  
                  {/* Gender */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Gender
                    </label>
                    <div className="flex gap-6">
                      {["male", "female", "others"].map((gender) => (
                        <label
                          key={gender}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${form.gender === gender ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`}>
                            {form.gender === gender && (
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            )}
                          </div>
                          <input
                            type="radio"
                            name="gender"
                            value={gender}
                            checked={form.gender === gender}
                            onChange={(e) => handleFieldChange("gender", e.target.value)}
                            className="hidden"
                          />
                          <span className="text-gray-700 capitalize group-hover:text-blue-600 transition-colors">
                            {gender}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* Education */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Education
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {["SSC", "HSC", "BSC", "BCOM", "MCA", "Phd"].map((edu) => (
                        <label
                          key={edu}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <div className={`w-5 h-5 border rounded flex items-center justify-center ${form.education.includes(edu) ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`}>
                            {form.education.includes(edu) && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <input
                            type="checkbox"
                            checked={form.education.includes(edu)}
                            onChange={() => toggleEducation(edu)}
                            className="hidden"
                          />
                          <span className="text-gray-700 group-hover:text-blue-600 transition-colors">
                            {edu}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Photos Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Profile Photos
                  </h3>
                  <p className="text-sm text-gray-500">
                    {images.filter(img => img.preview || img.key).length} of 4 photos
                  </p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {images.map((img, index) => (
                    <div
                      key={index}
                      className="relative group"
                    >
                      <div
                        className={`h-64 rounded-xl border-2 ${img.preview ? 'border-gray-200' : 'border-dashed border-gray-300'} overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:border-blue-500 hover:shadow-lg`}
                        onClick={() => triggerFileInput(index)}
                      >
                        {img.preview ? (
                          <>
                            <img
                              src={img.preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.className = "hidden";
                                e.target.parentElement.innerHTML = `
                                  <div class="w-full h-full flex flex-col items-center justify-center p-4">
                                    <svg class="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p class="text-sm text-gray-500 text-center">Image failed to load</p>
                                  </div>
                                `;
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          </>
                        ) : (
                          <div className="text-center p-6">
                            <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                            <p className="text-sm text-gray-600 font-medium">Upload Photo</p>
                            <p className="text-xs text-gray-400 mt-1">Slot {index + 1}</p>
                          </div>
                        )}
                        
                        {/* Remove button */}
                        {img.preview && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage(index);
                            }}
                            className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                            title="Remove photo"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                        
                        {/* New badge */}
                        {img.isNew && (
                          <div className="absolute top-3 left-3 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                            New
                          </div>
                        )}
                      </div>
                      
                      {/* Hidden file input */}
                      <input
                        ref={el => fileInputRefs.current[index] = el}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileSelect(e, index)}
                      />
                      
                      {/* Image info */}
                      {img.key && (
                        <p className="text-xs text-gray-500 mt-2 truncate text-center" title={img.key}>
                          {img.key.substring(0, 20)}...
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                
                <p className="text-sm text-gray-500 text-center">
                  Click on a photo slot to upload. First photo will be used as profile picture.
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{images.filter(img => img.preview).length}</span> photos selected
                  {images.some(img => img.isNew) && (
                    <span className="ml-2 text-green-600">
                      ({images.filter(img => img.isNew).length} new)
                    </span>
                  )}
                </div>
                
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                    disabled={saving}
                    className="px-8"
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    type="submit"
                    disabled={saving}
                    className="px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        {uploading ? "Uploading..." : "Saving..."}
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
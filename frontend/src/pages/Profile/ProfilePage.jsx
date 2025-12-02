import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "@/api/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Edit, Camera, Mail, MapPin, User, GraduationCap, Calendar, ChevronLeft, X, ChevronRight } from "lucide-react";

// Lightbox Component
function Lightbox({ src, alt, onClose, onNext, onPrev, hasNext, hasPrev }) {
  if (!src) return null;

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white p-3 hover:bg-white/10 rounded-full"
      >
        <X size={24} />
      </button>
      
      {hasPrev && (
        <button
          onClick={onPrev}
          className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white p-3 hover:bg-white/10 rounded-full"
        >
          <ChevronLeft size={24} />
        </button>
      )}
      
      <div className="max-w-5xl max-h-[85vh]">
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-[85vh] object-contain rounded-lg"
        />
      </div>
      
      {hasNext && (
        <button
          onClick={onNext}
          className="absolute right-6 top-1/2 transform -translate-y-1/2 text-white p-3 hover:bg-white/10 rounded-full"
        >
          <ChevronRight size={24} />
        </button>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState({
    open: false,
    currentIndex: 0,
    src: "",
    alt: ""
  });

  // Fetch user data
  useEffect(() => {
    if (!id) {
      toast.error("User ID missing");
      navigate("/dashboard");
      return;
    }
    
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/users/${id}`);
        const userData = res.data?.user || res.data;
        setUser(userData);
      } catch (err) {
        console.error("Profile fetch error", err);
        toast.error(err?.response?.data?.message || "Failed to fetch user");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [id, navigate]);

  // Lightbox controls
  const openLightbox = (index) => {
    if (!imageUrls[index]) return;
    setLightbox({
      open: true,
      currentIndex: index,
      src: imageUrls[index],
      alt: `Photo ${index + 1}`
    });
  };

  const closeLightbox = () => {
    setLightbox({ open: false, currentIndex: 0, src: "", alt: "" });
  };

  const goToNextImage = () => {
    const nextIndex = (lightbox.currentIndex + 1) % imageUrls.length;
    openLightbox(nextIndex);
  };

  const goToPrevImage = () => {
    const prevIndex = (lightbox.currentIndex - 1 + imageUrls.length) % imageUrls.length;
    openLightbox(prevIndex);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">User Not Found</h3>
          <p className="text-gray-600 mb-6">The user you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  // Get image URLs
  const imageUrls = Array.isArray(user.photos) 
    ? user.photos.filter(url => url && typeof url === 'string') 
    : [];
  
  const hasImages = imageUrls.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Lightbox */}
      {lightbox.open && (
        <Lightbox
          src={lightbox.src}
          alt={lightbox.alt}
          onClose={closeLightbox}
          onNext={goToNextImage}
          onPrev={goToPrevImage}
          hasNext={imageUrls.length > 1}
          hasPrev={imageUrls.length > 1}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">User Profile</h1>
          </div>
          {/* <Button
            onClick={() => navigate(`/edit-user/${id}`)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button> */}
          
        </div>

        {/* Main Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-lg overflow-hidden">
                    {imageUrls[0] ? (
                      <img
                        src={imageUrls[0]}
                        alt={user.email}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `
                            <div class="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                              <span class="text-2xl font-bold text-blue-600">
                                ${user.email.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          `;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                        <span className="text-2xl font-bold text-blue-600">
                          {user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* User Info */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {user.name || user.email.split('@')[0]}
                  </h2>
                  <div className="flex items-center gap-4 mt-2 text-gray-600">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                    {user.city && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{user.city}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="flex items-center gap-2">
                    <Camera className="h-5 w-5 text-gray-500" />
                    <span className="text-2xl font-bold text-gray-800">{imageUrls.length}</span>
                  </div>
                  <p className="text-sm text-gray-500">Photos</p>
                </div>
                
                <div className="h-12 w-px bg-gray-300"></div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">
                    {user.education?.length || 0}
                  </div>
                  <p className="text-sm text-gray-500">Education</p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Personal Info */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
                  
                  <div className="space-y-5">
                    {/* Email */}
                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Mail className="h-4 w-4" />
                        Email Address
                      </div>
                      <p className="text-gray-800 font-medium">{user.email}</p>
                    </div>

                    {/* City */}
                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <MapPin className="h-4 w-4" />
                        City
                      </div>
                      <p className="text-gray-800 font-medium">{user.city || "Not specified"}</p>
                    </div>

                    {/* Gender */}
                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <User className="h-4 w-4" />
                        Gender
                      </div>
                      <p className="text-gray-800 font-medium capitalize">{user.gender || "Not specified"}</p>
                    </div>

                    {/* Created Date */}
                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Calendar className="h-4 w-4" />
                        Joined Date
                      </div>
                      <p className="text-gray-800 font-medium">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Photos */}
              <div className="lg:col-span-2">
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Photos</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {hasImages ? `${imageUrls.length} photos` : "No photos uploaded"}
                      </p>
                    </div>
                    
                    {hasImages && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/users/${id}/edit`)}
                        className="flex items-center gap-2"
                      >
                        <Camera className="h-4 w-4" />
                        Manage Photos
                      </Button>
                    )}
                  </div>

                  {!hasImages ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                      <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">No photos uploaded yet</p>
                      <p className="text-sm text-gray-500 mb-6">Upload photos to enhance this profile</p>
                      <Button
                        onClick={() => navigate(`/users/${id}/edit`)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Upload Photos
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {imageUrls.map((src, idx) => (
                        <div
                          key={idx}
                          className="group relative rounded-lg overflow-hidden border border-gray-200 bg-white hover:border-blue-300 transition-colors"
                        >
                          <button
                            type="button"
                            onClick={() => openLightbox(idx)}
                            className="w-full h-48 flex items-center justify-center overflow-hidden focus:outline-none"
                          >
                            <img
                              src={src}
                              alt={`Photo ${idx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.parentElement.innerHTML = `
                                  <div class="w-full h-full bg-gray-100 flex flex-col items-center justify-center p-4">
                                    <Camera class="h-8 w-8 text-gray-400 mb-2" />
                                    <p class="text-sm text-gray-500">Image failed to load</p>
                                  </div>
                                `;
                              }}
                            />
                          </button>
                          
                          <div className="p-3 bg-white">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">
                                Photo {idx + 1}
                              </span>
                              {idx === 0 && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                  Profile
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Education Section */}
                {(user.education?.length > 0) && (
                  <div className="mt-6 bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                      <GraduationCap className="h-5 w-5 text-gray-600" />
                      <h3 className="text-lg font-semibold text-gray-800">Education</h3>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {user.education.map((edu, idx) => (
                        <span
                          key={idx}
                          className="px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg border border-blue-100"
                        >
                          {edu}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            User ID: {id} • Profile loaded: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
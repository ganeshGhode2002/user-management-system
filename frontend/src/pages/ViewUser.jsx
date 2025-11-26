// src/pages/ViewUser.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUser, FaMapMarkerAlt, FaVenusMars, FaGraduationCap, FaCalendar, FaImage, FaEdit } from 'react-icons/fa';
import { getUser } from '../services/api';
import toast from 'react-hot-toast';

export default function ViewUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const toastId = toast.loading('Loading user details...');
      try {
        const res = await getUser(id);
        if (res.data?.success) {
          setUser(res.data.user);
          toast.success('User details loaded', { id: toastId });
        } else {
          toast.error('User not found', { id: toastId });
          navigate('/users');
        }
      } catch (e) {
        console.error(e);
        toast.error('Failed to load user details', { id: toastId });
        navigate('/users');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white smooth-transition backdrop-blur-sm"
          >
            <FaArrowLeft />
          </button>
          <div className="flex-1">
            <div className="h-8 bg-white/20 rounded shimmer w-64 mb-2"></div>
            <div className="h-4 bg-white/20 rounded shimmer w-32"></div>
          </div>
        </div>
        <div className="glass rounded-2xl p-8 border border-white/10 animate-pulse">
          <div className="flex items-start gap-6">
            <div className="w-32 h-32 rounded-2xl bg-white/20 shimmer"></div>
            <div className="flex-1 space-y-3">
              <div className="h-6 bg-white/20 rounded shimmer w-3/4"></div>
              <div className="h-4 bg-white/20 rounded shimmer w-1/2"></div>
              <div className="h-4 bg-white/20 rounded shimmer w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
          <FaUser className="text-red-400 text-3xl" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">User Not Found</h2>
        <p className="text-white/60 mb-6">The user you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/users')}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:shadow-lg smooth-transition"
        >
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white smooth-transition backdrop-blur-sm"
        >
          <FaArrowLeft />
        </button>
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-white mb-2">User Profile</h1>
          <p className="text-white/70">View detailed user information</p>
        </div>
        <button
          onClick={() => navigate(`/users/edit/${user._id}`)}
          className="px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 smooth-transition flex items-center gap-2"
        >
          <FaEdit />
          Edit User
        </button>
      </div>

      {/* User Profile Card */}
      <div className="glass rounded-2xl shadow-2xl overflow-hidden border border-white/10 backdrop-blur-sm">
        {/* Header Section */}
        <div className="p-8 border-b border-white/10">
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-400 to-pink-500 shadow-2xl">
                {user.images?.[0] ? (
                  <img 
                    src={`http://localhost:5000/uploads/${user.images[0]}`} 
                    alt="User avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <FaUser size={48} />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-400 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-4">{user.email}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-white/80">
                  <FaMapMarkerAlt className="text-blue-400 text-lg" />
                  <div>
                    <div className="text-sm text-white/60">City</div>
                    <div className="font-semibold">{user.city}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-white/80">
                  <FaVenusMars className="text-pink-400 text-lg" />
                  <div>
                    <div className="text-sm text-white/60">Gender</div>
                    <div className="font-semibold capitalize">{user.gender}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-white/80">
                  <FaCalendar className="text-yellow-400 text-lg" />
                  <div>
                    <div className="text-sm text-white/60">Joined</div>
                    <div className="font-semibold">{new Date(user.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-white/80">
                  <FaGraduationCap className="text-purple-400 text-lg" />
                  <div>
                    <div className="text-sm text-white/60">Education</div>
                    <div className="font-semibold">{user.education?.length || 0} fields</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Education Section */}
        <div className="p-8 border-b border-white/10">
          <h3 className="flex items-center gap-2 text-white font-semibold text-xl mb-4">
            <FaGraduationCap className="text-purple-400" />
            Education
          </h3>
          <div className="flex flex-wrap gap-3">
            {user.education?.map((edu, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white rounded-xl border border-white/10 backdrop-blur-sm font-medium"
              >
                {edu.toUpperCase()}
              </span>
            ))}
            {!user.education?.length && (
              <p className="text-white/60 italic">No education information provided</p>
            )}
          </div>
        </div>

        {/* Images Section */}
        <div className="p-8">
          <h3 className="flex items-center gap-2 text-white font-semibold text-xl mb-6">
            <FaImage className="text-cyan-400" />
            User Images
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {user.images?.map((img, index) => (
              <div key={index} className="group relative">
                <img
                  src={`http://localhost:5000/uploads/${img}`}
                  alt={`User image ${index + 1}`}
                  className="w-full h-48 object-cover rounded-xl shadow-lg group-hover:scale-105 smooth-transition"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 smooth-transition rounded-xl flex items-center justify-center">
                  <span className="text-white opacity-0 group-hover:opacity-100 smooth-transition font-semibold">
                    Image {index + 1}
                  </span>
                </div>
              </div>
            ))}
            {(!user.images || user.images.length === 0) && (
              <div className="col-span-4 text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white/10 flex items-center justify-center">
                  <FaImage className="text-white/40 text-2xl" />
                </div>
                <p className="text-white/60 text-lg">No images uploaded</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
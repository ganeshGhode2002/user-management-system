// src/pages/EditUser.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUserEdit, FaSpinner } from 'react-icons/fa';
import UserForm from '../components/UserForm';
import { getUser, updateUser } from '../services/api';
import toast from 'react-hot-toast';

export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initial, setInitial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const toastId = toast.loading('Loading user data...');
      try {
        const res = await getUser(id);
        if (res.data?.success) {
          setInitial(res.data.user);
          toast.success('User data loaded', { id: toastId });
        } else {
          toast.error('User not found', { id: toastId });
          navigate('/users');
        }
      } catch (e) {
        console.error(e);
        toast.error('Failed to fetch user data', { id: toastId });
        navigate('/users');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, navigate]);

  const handleSubmit = async (formData) => {
    setUpdating(true);
    const toastId = toast.loading('Updating user...');

    try {
      const res = await updateUser(id, formData);
      if (res.data?.success) {
        toast.success('User updated successfully!', { id: toastId });
        navigate('/users');
      } else {
        toast.error(res.data?.message || 'Update failed', { id: toastId });
      }
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.message || 'Server error', { id: toastId });
    } finally {
      setUpdating(false);
    }
  };

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
        <div className="glass rounded-2xl p-8 border border-white/10">
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="h-12 bg-white/20 rounded-xl"></div>
              <div className="h-12 bg-white/20 rounded-xl"></div>
            </div>
            <div className="h-12 bg-white/20 rounded-xl"></div>
            <div className="h-32 bg-white/20 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!initial) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
          <FaUserEdit className="text-red-400 text-3xl" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">User Not Found</h2>
        <p className="text-white/60 mb-6">The user you're trying to edit doesn't exist.</p>
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
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Edit User</h1>
          <p className="text-white/70">Update user information and settings</p>
        </div>
        <div className="ml-auto p-4 bg-gradient-to-r from-orange-400 to-pink-500 rounded-xl shadow-2xl">
          <FaUserEdit className="text-white text-2xl" />
        </div>
      </div>

      {/* Form */}
      <UserForm 
        initial={initial} 
        onSubmit={handleSubmit} 
        submitLabel={
          updating ? (
            <span className="flex items-center gap-2">
              <FaSpinner className="animate-spin" />
              Updating...
            </span>
          ) : (
            "Update User"
          )
        }
      />
    </div>
  );
}
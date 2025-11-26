// src/pages/Register.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUserPlus, FaRocket } from 'react-icons/fa';
import UserForm from '../components/UserForm';
import { registerUser } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function Register() {
  const navigate = useNavigate();
  const { push: toast } = useToast();

  const handleSubmit = async (formData) => {
    try {
      const res = await registerUser(formData);
      if (res.data?.success) {
        toast('Account created successfully! Please login.', 'success');
        navigate('/login');
      } else {
        toast(res.data?.message || 'Registration failed', 'error');
      }
    } catch (error) {
      toast(error.message, 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white smooth-transition backdrop-blur-sm border border-white/10"
          >
            <FaArrowLeft />
          </button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-2">Create Your Account</h1>
            <p className="text-white/70 text-lg">Join our community and start managing users</p>
          </div>
          <div className="p-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl shadow-2xl">
            <FaUserPlus className="text-white text-2xl" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: '🚀', title: 'Fast Setup', desc: 'Get started in minutes' },
            { icon: '🔒', title: 'Secure', desc: 'Your data is protected' },
            { icon: '💫', title: 'Modern', desc: 'Beautiful interface' }
          ].map((item, index) => (
            <div key={index} className="glass rounded-2xl p-4 text-center border border-white/10 backdrop-blur-sm">
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="text-white font-semibold">{item.title}</div>
              <div className="text-white/60 text-sm">{item.desc}</div>
            </div>
          ))}
        </div>

        {/* Form Section */}
        <div className="glass rounded-2xl shadow-2xl overflow-hidden border border-white/10 backdrop-blur-sm">
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                <FaRocket className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Registration Form</h2>
                <p className="text-white/70">Fill in your details to create an account</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {/* FIX: Make sure onSubmit prop is properly passed */}
            <UserForm onSubmit={handleSubmit} submitLabel="Create Account" />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-white/60">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-cyan-300 hover:text-cyan-200 font-semibold smooth-transition underline hover:no-underline"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
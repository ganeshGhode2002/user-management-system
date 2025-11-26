// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FaSignInAlt, 
  FaEye, 
  FaEyeSlash, 
  FaUser, 
  FaLock, 
  FaRocket,
  FaShieldAlt  // Changed from FaShield to FaShieldAlt
} from 'react-icons/fa';
import { loginUser } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { push: toast } = useToast();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await loginUser({ email, password });
      if (res.data?.success) {
        toast(`Welcome back, ${res.data.user.email}!`, 'success');
        navigate('/users');
      } else {
        toast(res.data?.message || 'Login failed', 'error');
      }
    } catch (error) {
      toast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl">
            <FaShieldAlt className="text-white text-3xl" /> {/* Fixed icon */}
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Welcome Back</h1>
          <p className="text-white/70 text-lg">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <div className="glass rounded-2xl shadow-2xl overflow-hidden border border-white/10 backdrop-blur-sm">
          <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                <FaSignInAlt className="text-white text-lg" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Login</h2>
                <p className="text-white/70 text-sm">Enter your credentials</p>
              </div>
            </div>
          </div>

          <form onSubmit={submit} className="p-6">
            {/* Email Field */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-white font-medium mb-3">
                <FaUser className="text-cyan-400" />
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 pl-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent smooth-transition backdrop-blur-sm"
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
                <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50" />
              </div>
            </div>

            {/* Password Field */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-white font-medium mb-3">
                <FaLock className="text-green-400" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pl-12 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent smooth-transition backdrop-blur-sm"
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
                <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white smooth-transition"
                  disabled={loading}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl shadow-2xl hover:shadow-3xl hover:scale-105 smooth-transition flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none backdrop-blur-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <FaSignInAlt />
              )}
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 h-px bg-white/20"></div>
              <span className="px-4 text-white/50 text-sm">OR</span>
              <div className="flex-1 h-px bg-white/20"></div>
            </div>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-white/60">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-cyan-300 hover:text-cyan-200 font-semibold smooth-transition underline hover:no-underline"
                >
                  Create one here
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          {[
            { icon: '⚡', text: 'Fast' },
            { icon: '🔐', text: 'Secure' },
            { icon: '🎨', text: 'Beautiful' }
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="text-white/60 text-sm">{item.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
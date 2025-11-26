// src/components/UserForm.jsx
import React, { useState, useEffect } from 'react';
import { FaUpload, FaCheck, FaTimes, FaUser, FaMapMarkerAlt, FaVenusMars, FaGraduationCap, FaLock } from 'react-icons/fa';

const cities = ['Mumbai', 'Pune', 'Satara', 'Nashik'];
const educationOptions = ['ssc', 'hsc', 'BSC', 'BCOM', 'MCA', 'Phd'];

export default function UserForm({ initial = {}, onSubmit, submitLabel = 'Submit' }) {
  const [email, setEmail] = useState(initial.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState(initial.gender || 'male');
  const [city, setCity] = useState(initial.city || cities[0]);
  const [education, setEducation] = useState(initial.education || []);
  const [images, setImages] = useState([null, null, null, null]);
  const [previews, setPreviews] = useState(initial.images ? initial.images.map(f => `http://localhost:5000/uploads/${f}`) : [null, null, null, null]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    images.forEach((file, idx) => {
      if (file) {
        const url = URL.createObjectURL(file);
        setPreviews(prev => {
          const copy = [...prev];
          copy[idx] = url;
          return copy;
        });
      }
    });

    return () => {
      previews.forEach(p => p && URL.revokeObjectURL(p));
    };
  }, [images]);

  const toggleEducation = (val) => {
    setEducation(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);
  };

  const handleFileChange = (e, idx) => {
    const file = e.target.files[0] || null;
    setImages(prev => {
      const copy = [...prev];
      copy[idx] = file;
      return copy;
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';

    if (!initial._id) {
      if (!password) newErrors.password = 'Password is required';
      else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';

      if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Replace the current handleSubmit function in UserForm.jsx with this:
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    const fd = new FormData();
    fd.append('email', email);
    if (password) fd.append('password', password);
    if (confirmPassword) fd.append('confirmPassword', confirmPassword);
    fd.append('gender', gender);
    fd.append('city', city);
    education.forEach(ed => fd.append('education', ed));
    images.forEach((f, i) => {
      if (f) fd.append(`image${i + 1}`, f);
    });

    console.log('Calling onSubmit with form data');

    // Safe call to onSubmit
    if (typeof onSubmit === 'function') {
      onSubmit(fd);
    } else {
      console.error('onSubmit is not a function. Received:', typeof onSubmit, onSubmit);
    }
  };

  const removeImage = (idx) => {
    setImages(prev => {
      const copy = [...prev];
      copy[idx] = null;
      return copy;
    });
    setPreviews(prev => {
      const copy = [...prev];
      copy[idx] = null;
      return copy;
    });
  };

  return (
    <form onSubmit={handleSubmit} className="glass rounded-2xl shadow-2xl p-8 border border-white/10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email */}
        <div className="lg:col-span-2">
          <label className="flex items-center gap-2 text-white font-medium mb-3">
            <FaUser className="text-cyan-400" />
            Email Address
          </label>
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={`w-full px-4 py-3 bg-white/10 border ${errors.email ? 'border-red-400' : 'border-white/20'
              } rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent smooth-transition`}
            type="email"
            placeholder="Enter your email"
          />
          {errors.email && <p className="text-red-300 text-sm mt-2 flex items-center gap-2"><FaTimes /> {errors.email}</p>}
        </div>

        {/* City */}
        <div>
          <label className="flex items-center gap-2 text-white font-medium mb-3">
            <FaMapMarkerAlt className="text-blue-400" />
            City
          </label>
          <select
            value={city}
            onChange={e => setCity(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent smooth-transition"
          >
            {cities.map(c => <option key={c} value={c} className="bg-gray-800">{c}</option>)}
          </select>
        </div>

        {/* Password */}
        <div>
          <label className="flex items-center gap-2 text-white font-medium mb-3">
            <FaLock className="text-green-400" />
            Password {!initial._id && <span className="text-red-400">*</span>}
          </label>
          <input
            value={password}
            onChange={e => setPassword(e.target.value)}
            className={`w-full px-4 py-3 bg-white/10 border ${errors.password ? 'border-red-400' : 'border-white/20'
              } rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent smooth-transition`}
            type="password"
            placeholder={initial._id ? "Leave blank to keep current" : "Enter password"}
          />
          {errors.password && <p className="text-red-300 text-sm mt-2 flex items-center gap-2"><FaTimes /> {errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="flex items-center gap-2 text-white font-medium mb-3">
            <FaLock className="text-yellow-400" />
            Confirm Password {!initial._id && <span className="text-red-400">*</span>}
          </label>
          <input
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className={`w-full px-4 py-3 bg-white/10 border ${errors.confirmPassword ? 'border-red-400' : 'border-white/20'
              } rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent smooth-transition`}
            type="password"
            placeholder="Confirm your password"
          />
          {errors.confirmPassword && <p className="text-red-300 text-sm mt-2 flex items-center gap-2"><FaTimes /> {errors.confirmPassword}</p>}
          {password && confirmPassword && password === confirmPassword && (
            <p className="text-green-300 text-sm mt-2 flex items-center gap-2"><FaCheck /> Passwords match</p>
          )}
        </div>

        {/* Gender */}
        <div className="lg:col-span-2">
          <label className="flex items-center gap-2 text-white font-medium mb-3">
            <FaVenusMars className="text-pink-400" />
            Gender
          </label>
          <div className="flex flex-wrap gap-4">
            {['male', 'female', 'others'].map(g => (
              <label key={g} className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center smooth-transition ${gender === g
                  ? 'border-cyan-400 bg-cyan-400'
                  : 'border-white/40 group-hover:border-cyan-400'
                  }`}>
                  {gender === g && <div className="w-2 h-2 rounded-full bg-white"></div>}
                </div>
                <span className="text-white capitalize font-medium">{g}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="lg:col-span-2">
          <label className="flex items-center gap-2 text-white font-medium mb-3">
            <FaGraduationCap className="text-purple-400" />
            Education
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {educationOptions.map(opt => (
              <label key={opt} className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl bg-white/5 hover:bg-white/10 smooth-transition">
                <div className={`w-5 h-5 rounded border flex items-center justify-center smooth-transition ${education.includes(opt)
                  ? 'border-green-400 bg-green-400'
                  : 'border-white/40 group-hover:border-green-400'
                  }`}>
                  {education.includes(opt) && <FaCheck className="text-white text-xs" />}
                </div>
                <span className="text-white font-medium uppercase text-sm">{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="lg:col-span-2">
          <label className="flex items-center gap-2 text-white font-medium mb-3">
            <FaUpload className="text-orange-400" />
            Upload Images (Up to 4)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="relative group">
                <div className="border-2 border-dashed border-white/30 rounded-xl p-3 hover:border-cyan-400 smooth-transition bg-white/5">
                  {previews[i] ? (
                    <div className="relative">
                      <img src={previews[i]} alt={`preview-${i}`} className="w-full h-32 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600 smooth-transition"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ) : (
                    <div className="w-full h-32 flex flex-col items-center justify-center text-white/50 hover:text-white smooth-transition">
                      <FaUpload className="text-2xl mb-2" />
                      <span className="text-xs">Upload</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, i)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl shadow-2xl hover:shadow-3xl hover:scale-105 smooth-transition flex items-center gap-3"
        >
          {submitLabel}
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </button>
      </div>
    </form>
  );
}
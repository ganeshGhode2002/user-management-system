// src/components/UserCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaEdit, FaTrash, FaUser, FaMapMarkerAlt, FaVenusMars, FaGraduationCap } from 'react-icons/fa';

export default function UserCard({ user, onDelete }) {
  const imgUrl = user.images && user.images.length ? `http://localhost:5000/uploads/${user.images[0]}` : null;

  return (
    <div className="group bg-white/20 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden hover:transform hover:scale-105 smooth-transition border border-white/10">
      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* User Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-purple-400 to-pink-500 shadow-lg">
              {imgUrl ? (
                <img 
                  src={imgUrl} 
                  alt="user" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <FaUser size={24} />
                </div>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full border-2 border-white shadow-lg"></div>
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white truncate mb-1">{user.email}</h3>
            
            <div className="flex items-center gap-4 text-white/80 text-sm mb-2">
              <div className="flex items-center gap-1">
                <FaMapMarkerAlt className="text-blue-300" />
                <span>{user.city}</span>
              </div>
              <div className="flex items-center gap-1">
                <FaVenusMars className="text-pink-300" />
                <span className="capitalize">{user.gender}</span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-white/70 text-sm mb-3">
              <FaGraduationCap className="text-yellow-300" />
              <span className="truncate">{user.education?.join(', ') || 'No education'}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Link 
                to={`/users/view/${user._id}`}
                className="flex items-center gap-2 px-3 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 smooth-transition text-sm font-medium"
              >
                <FaEye />
                View
              </Link>
              <Link 
                to={`/users/edit/${user._id}`}
                className="flex items-center gap-2 px-3 py-2 bg-blue-500/80 text-white rounded-lg hover:bg-blue-600 smooth-transition text-sm font-medium"
              >
                <FaEdit />
                Edit
              </Link>
              <button 
                onClick={() => onDelete(user._id)}
                className="flex items-center gap-2 px-3 py-2 bg-red-500/80 text-white rounded-lg hover:bg-red-600 smooth-transition text-sm font-medium"
              >
                <FaTrash />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Gradient Border Bottom */}
      <div className="h-1 bg-gradient-to-r from-purple-400 to-pink-500"></div>
    </div>
  );
}
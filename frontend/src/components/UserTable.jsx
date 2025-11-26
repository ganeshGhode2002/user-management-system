// src/components/UserTable.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaEdit, FaTrash, FaUser, FaMapMarkerAlt, FaVenusMars, FaGraduationCap, FaCalendar } from 'react-icons/fa';

export default function UserTable({ users, onDelete }) {
  return (
    <div className="glass rounded-2xl shadow-2xl overflow-hidden border border-white/10">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-purple-500/20 to-pink-500/20">
              <th className="px-6 py-4 text-left text-white font-semibold text-sm uppercase tracking-wider">
                User Information
              </th>
              <th className="px-6 py-4 text-left text-white font-semibold text-sm uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt />
                  City
                </div>
              </th>
              <th className="px-6 py-4 text-left text-white font-semibold text-sm uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <FaVenusMars />
                  Gender
                </div>
              </th>
              <th className="px-6 py-4 text-left text-white font-semibold text-sm uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <FaGraduationCap />
                  Education
                </div>
              </th>
              <th className="px-6 py-4 text-left text-white font-semibold text-sm uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {users.map((u, index) => (
              <tr 
                key={u._id} 
                className="group hover:bg-white/5 smooth-transition"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-purple-400 to-pink-500 shadow-lg">
                        {u.images?.[0] ? (
                          <img 
                            src={`http://localhost:5000/uploads/${u.images[0]}`} 
                            alt="" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white">
                            <FaUser size={16} />
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-lg"></div>
                    </div>
                    <div>
                      <div className="font-semibold text-white group-hover:text-cyan-300 smooth-transition">
                        {u.email}
                      </div>
                      <div className="flex items-center gap-2 text-white/60 text-sm mt-1">
                        <FaCalendar className="text-yellow-400" />
                        <span>{new Date(u.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-white/80">
                    <FaMapMarkerAlt className="text-blue-400" />
                    {u.city}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-white/80">
                    <FaVenusMars className="text-pink-400" />
                    <span className="capitalize">{u.gender}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {u.education?.map((edu, idx) => (
                      <span 
                        key={idx}
                        className="px-2 py-1 bg-white/10 text-white/90 rounded-lg text-xs font-medium backdrop-blur-sm"
                      >
                        {edu}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Link 
                      to={`/users/view/${u._id}`}
                      className="p-2 bg-cyan-500/20 text-cyan-300 rounded-lg hover:bg-cyan-500/30 smooth-transition tooltip"
                      title="View User"
                    >
                      <FaEye />
                    </Link>
                    <Link 
                      to={`/users/edit/${u._id}`}
                      className="p-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 smooth-transition tooltip"
                      title="Edit User"
                    >
                      <FaEdit />
                    </Link>
                    <button 
                      onClick={() => onDelete(u._id)}
                      className="p-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 smooth-transition tooltip"
                      title="Delete User"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {users.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
            <FaUser className="text-white/40 text-3xl" />
          </div>
          <p className="text-white/60 text-lg">No users found</p>
          <p className="text-white/40 text-sm mt-2">Start by registering a new user</p>
        </div>
      )}
    </div>
  );
}
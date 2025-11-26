// src/pages/UsersList.jsx
import React, { useEffect, useState } from 'react';
import { getUsers, deleteUser } from '../services/api';
import UserCard from '../components/UserCard';
import UserTable from '../components/UserTable';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaUserPlus, FaSearch, FaSync, FaFilter } from 'react-icons/fa';
import { useToast } from '../context/ToastContext';

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCity, setFilterCity] = useState('all');
  const navigate = useNavigate();
  const { push: toast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getUsers();
      setUsers(res.data || []);
      toast(`Loaded ${res.data?.length || 0} users`, 'success');
    } catch (error) {
      toast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    const userToDelete = users.find(u => u._id === id);

    if (!window.confirm(`Are you sure you want to delete ${userToDelete?.email}?`)) return;

    try {
      await deleteUser(id);
      setUsers(prev => prev.filter(u => u._id !== id));
      toast('User deleted successfully', 'success');
    } catch (error) {
      toast(error.message, 'error');
    }
  };

  // Filter users based on search and city filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.education?.some(edu => edu?.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCity = filterCity === 'all' || user.city === filterCity;

    return matchesSearch && matchesCity;
  });

  const cities = ['all', ...new Set(users.map(u => u.city).filter(Boolean))];

  // Enhanced loading skeleton
  const SkeletonLoader = () => (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 animate-pulse">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-xl bg-white/20"></div>
            <div className="flex-1 space-y-2">
              <div className="h-6 bg-white/20 rounded w-3/4"></div>
              <div className="h-4 bg-white/20 rounded w-1/2"></div>
              <div className="h-4 bg-white/20 rounded w-2/3"></div>
              <div className="flex gap-2 mt-3">
                <div className="h-8 bg-white/20 rounded-lg w-16"></div>
                <div className="h-8 bg-white/20 rounded-lg w-16"></div>
                <div className="h-8 bg-white/20 rounded-lg w-16"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen max-w-5xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mt-14 mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-2xl">
            <FaUsers className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">User Management</h1>
            <p className="text-white/70">
              {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} found
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl smooth-transition backdrop-blur-sm flex items-center gap-2 disabled:opacity-50 border border-white/10"
          >
            <FaSync className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-6 py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 smooth-transition flex items-center gap-2"
          >
            <FaUserPlus />
            Add User
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="glass rounded-2xl p-6 mb-6 border border-white/10 backdrop-blur-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search Input */}
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50" />
            <input
              type="text"
              placeholder="Search users by email, city, or education..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent smooth-transition"
            />
          </div>

          {/* City Filter */}
          <div className="relative">
            <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50" />
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent smooth-transition appearance-none"
            >
              <option value="all" className="bg-gray-800">All Cities</option>
              {cities.filter(city => city !== 'all').map(city => (
                <option key={city} value={city} className="bg-gray-800 capitalize">
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users Content */}
      {loading ? (
        <SkeletonLoader />
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="block md:hidden space-y-4">
            {filteredUsers.map(user => (
              <UserCard key={user._id} user={user} onDelete={handleDelete} />
            ))}

            {filteredUsers.length === 0 && (
              <div className="text-center py-12 glass rounded-2xl border border-white/10">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                  <FaUsers className="text-white/40 text-3xl" />
                </div>
                <h3 className="text-white text-xl font-semibold mb-2">No users found</h3>
                <p className="text-white/60 mb-4">Try adjusting your search or filters</p>
                <button
                  onClick={() => navigate('/register')}
                  className="px-6 py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-xl hover:shadow-lg smooth-transition"
                >
                  Add First User
                </button>
              </div>
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block">
            <UserTable users={filteredUsers} onDelete={handleDelete} />
          </div>
        </>
      )}
    </div>
  );
}
// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import Header from './components/Header';
import Register from './pages/Register';
import Login from './pages/Login';
import UsersList from './pages/UsersList';
import EditUser from './pages/EditUser';
import ViewUser from './pages/ViewUser';
import TestTailwind from './components/TestTailwind';

export default function App() {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
        <div className="min-h-screen backdrop-blur-sm bg-white/10">
          <Header />
          <main className="max-w-7xl mx-auto px-4 py-8">
            <Routes>
              <Route path="/test" element={<TestTailwind />} />
              <Route path="/" element={<Navigate to="/users" replace />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/users" element={<UsersList />} />
              <Route path="/users/edit/:id" element={<EditUser />} />
              <Route path="/users/view/:id" element={<ViewUser />} />
            </Routes>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
# 🚀 User Management System

A full-stack user management application with React frontend, Node.js backend, and MongoDB database. Features user registration, authentication, profile management, and admin dashboard.

![User Management Dashboard](https://img.shields.io/badge/Status-Production-2ea44f)
![React](https://img.shields.io/badge/React-18.2-blue)
![Node.js](https://img.shields.io/badge/Node.js-20.x-green)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

### 👥 User Features
- **Secure Registration** with email validation
- **Login/Logout** with JWT authentication
- **Profile Management** - View and edit personal information
- **Image Upload** - Upload up to 4 profile pictures
- **Responsive Design** - Works on mobile, tablet, and desktop

### 🛠️ Admin Features
- **User Dashboard** - View all registered users
- **Advanced Search** - Search by name, email, city, or education
- **Sort & Filter** - Sort by date, filter by various criteria
- **Bulk Actions** - Export users to CSV
- **CRUD Operations** - Create, read, update, delete users
- **Real-time Updates** - Instant refresh of user data

### 🔒 Security Features
- **Password Hashing** using bcrypt
- **JWT Authentication** with secure tokens
- **Input Validation** on both frontend and backend
- **CORS Protection** configured for production
- **Environment Variables** for sensitive data

## 🏗️ Tech Stack

### Frontend
- **React 18** with Vite
- **React Router DOM** for routing
- **Axios** for API requests
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Sonner** for toast notifications
- **React Context API** for state management

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Multer** for file uploads
- **Bcrypt** for password hashing
- **CORS** for cross-origin requests
- **dotenv** for environment variables

### Deployment
- **Frontend**: Vercel (https://vercel.com)
- **Backend**: Render (https://render.com)
- **Database**: MongoDB Atlas

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm/yarn
- MongoDB (local or Atlas cluster)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/user-management-system.git
cd user-management-system
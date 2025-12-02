// // src/components/Navbar.jsx
// import React, { useContext } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { AuthContext } from "@/context/AuthContext";
// import { toast } from "sonner";
// import { Button } from "@/components/ui/button";

// export default function Navbar() {
//   const { user, logout } = useContext(AuthContext);
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     logout();
//     toast.success("Logged out");
//     navigate("/login", { replace: true });
//   };

//   return (
//     <header className="bg-white/80 backdrop-blur border-b sticky top-0 z-50">
//       <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

//         {/* Logo */}
//         <Link to="/" className="flex items-center gap-3">
//           <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
//             UM
//           </div>
//           <div>
//             <h1 className="text-lg font-semibold text-slate-800">User Management</h1>
//             <p className="text-xs text-slate-500">Admin Dashboard</p>
//           </div>
//         </Link>

//         {/* Actions */}
//         {!user ? (
//           <div className="flex items-center gap-3">
//             <Link
//               to="/register"
//               className="text-sm text-slate-600 hover:text-slate-800"
//             >
//               Register
//             </Link>
//             <Button size="sm" onClick={() => navigate("/login")}>
//               Login
//             </Button>
//           </div>
//         ) : (
//           <div className="flex items-center gap-3">
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={handleLogout}
//             >
//               Logout
//             </Button>
//           </div>
//         )}
//       </div>
//     </header>
//   );
// }

import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, Home } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login", { replace: true });
    setMobileMenuOpen(false);
  };

  const navLinks = [
    ...(user
      ? []
      : [
          { path: "/", label: "Home", icon: <Home className="w-4 h-4" /> },
          { path: "/register", label: "Register", icon: <User className="w-4 h-4" /> },
        ]),
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center flex-shrink-0">
            <Link
              to="/"
              className="flex items-center gap-3 group"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-md group-hover:shadow-lg transition-shadow duration-200">
                UM
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">
                  User Management
                </h1>
                <p className="text-xs text-gray-500">Admin Dashboard</p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-sm font-semibold text-gray-800">UM System</h1>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {!user ? (
              <>
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md transition-colors duration-200 hover:bg-gray-50"
                  >
                    {link.label}
                  </Link>
                ))}
                <Button
                  size="sm"
                  onClick={() => navigate("/login")}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all"
                >
                  Login
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 px-3 py-2 bg-gray-50 rounded-md">
                  Welcome, <span className="font-medium">{user.name || user.email?.split('@')[0]}</span>
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen
            ? "max-h-64 opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="px-4 pt-2 pb-4 space-y-2 bg-white border-t border-gray-200 shadow-lg">
          {!user ? (
            <>
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-4 py-3 rounded-md transition-colors"
                >
                  {link.icon}
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}
              <Button
                onClick={() => {
                  navigate("/login");
                  setMobileMenuOpen(false);
                }}
                className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
              >
                Login
              </Button>
            </>
          ) : (
            <>
              <div className="px-4 py-3">
                <p className="text-sm text-gray-500">Logged in as</p>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.email}
                </p>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
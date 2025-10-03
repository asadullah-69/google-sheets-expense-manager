// components/Navbar.tsx
"use client";

import { signOut } from "next-auth/react";

interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface NavbarProps {
  user: User;
  onLogout: () => void;
}

const Navbar = ({ user, onLogout }: NavbarProps) => {
  const handleLogout = () => {
    onLogout();
    signOut();
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900">
              Expense-Manager-Beta
            </h1>
            <span className="text-gray-500">|</span>
            <span className="text-gray-600">Expenses Analysis</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user?.name ?? "Guest"}
              </p>
              <p className="text-xs text-gray-500">
                {user?.email ?? "Not signed in"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

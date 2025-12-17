"use client";

import { useAuth } from '../hooks/use-auth.hook';
import Link from 'next/link';
import { LogOut } from 'lucide-react'; // Example icon

export default function UserProfile() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-blue-600">
        Iniciar Sesión
      </Link>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="text-right">
        <span className="block text-sm font-medium text-black">
          {user.firstName} {user.lastName}
        </span>
        <span className="block text-xs text-gray-500">{user.email}</span>
      </div>
      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-semibold">
        {user.firstName?.charAt(0).toUpperCase()}
        {user.lastName?.charAt(0).toUpperCase()}
      </div>
      <button
        onClick={logout}
        title="Cerrar Sesión"
        className="p-2 text-gray-500 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"
      >
        <LogOut size={20} />
      </button>
    </div>
  );
}
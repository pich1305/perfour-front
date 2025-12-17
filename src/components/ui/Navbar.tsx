'use client';

import Link from 'next/link';
import Image from 'next/image';
import { CalendarIcon, QuestionMarkCircleIcon, BellIcon } from "@heroicons/react/outline";
import UserProfile from '../../features/auth/components/UserProfile'; // ✨ Importamos el componente atomizado

export default function Navbar() {
  return (
    <nav className="bg-white py-4 px-6 flex items-center justify-between h-16 z-40 border-b border-gray-200 min-w-0 flex-shrink-0">
    {/* <nav className="fixed bg-white py-4 px-6 top-0 left-0 right-0 flex items-center justify-between h-16 z-40 border-b border-gray-200"> */}
      <Link href="/home">
        <Image
          src="/perfour-logo.png"
          alt="PerFour Logo"
          width={150}
          height={16}
        />
      </Link>

      <div className="flex items-center space-x-6">
        {/* Iconos de acciones */}
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100">
            <CalendarIcon className="h-6 w-6" />
          </button>
          <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100">
            <QuestionMarkCircleIcon className="h-6 w-6" />
          </button>
          <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100">
            <BellIcon className="h-6 w-6" />
          </button>
        </div>

        {/* ✨ El componente UserProfile ahora maneja su propia lógica */}
        <UserProfile />
      </div>
    </nav>
  );
}
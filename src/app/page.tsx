// src/app/page.tsx
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../features/auth/hooks/use-auth.hook';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
// import LoadingSpinner from '@/components/ui/LoadingSpinner'; // Assuming this exists

export default function WelcomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // This effect will redirect an already logged-in user away from the welcome page
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/home');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || isAuthenticated) {
    // Show a spinner while checking auth or redirecting
    // return <LoadingSpinner fullScreen />;
    return null;
  }

  // If not authenticated and not loading, show the Welcome Page
  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      {/* Your background images go here */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        <header className="mb-12 text-center flex flex-col items-center">
          <div className="mb-6">
            <Image
              src="/logoTIPOPERFOURtrans-01.png"
              alt="Logo oficial de Perfour"
              width={350}
              height={70} 
              priority
            />
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-3">
            Bienvenido
          </h1>
        </header>

        <main className="w-full max-w-sm space-y-4">
          <Link 
            href="/login"
            className="block w-full text-center px-6 py-3.5 text-lg font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-opacity-90"
          >
            Iniciar Sesión
          </Link>
          
          <Link 
            href="/signup"
            className="block w-full text-center px-6 py-3.5 text-lg font-semibold text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-600 hover:text-white"
          >
            Crear Nueva Cuenta
          </Link>
        </main>
      </div>
    </div>
  );
}
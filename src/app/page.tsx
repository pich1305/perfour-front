// src/app/page.tsx
"use client";

import { useAuth } from '../features/auth/hooks/use-auth.hook';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WelcomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect users based on authentication status
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/home');
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while checking auth or redirecting
  return null;
}
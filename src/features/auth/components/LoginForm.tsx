// src/features/auth/components/LoginForm.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../hooks/use-auth.hook';

interface LoginFormProps {
  onToggleMode: () => void;
}

// Iconos SVG simples para el ojo (puedes usar librerías como lucide-react si prefieres)
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EyeSlashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);


export default function LoginForm({onToggleMode} : LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Nuevo estado para controlar la visibilidad de la contraseña
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  
  const { login, isLoading: isLoadingAuth } = useAuth();
  const logoPath = "/perfour-logo.png"; // Tu logo

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoadingForm(true);
    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setIsLoadingForm(false);
    }
  };

  const formDisabled = isLoadingAuth || isLoadingForm;

  return (
    // Card container con bordes muy redondeados y sombra suave
    <div className="w-full bg-white rounded-[2rem] shadow-2xl p-8 md:p-12">
      
      {/* 1. Logo centrado arriba */}
      <div className="flex justify-center mb-8">
        <Image src={logoPath} alt="Perfour Logo" width={180} height={60} priority objectFit="contain" />
      </div>

      {/* Titulares */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome Back
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Enter your email and password to access your account
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Input Email: Fondo gris, sin borde inicial, redondeado */}
        <div className="space-y-1">
            <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 ml-1">Email</label>
            <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                // Clases clave: bg-gray-100, border-transparent, rounded-xl
                className="block w-full px-4 py-3 bg-gray-100 border border-transparent rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-gray-300 focus:ring-0 sm:text-sm transition-colors"
                placeholder="Enter your email"
            />
        </div>

        {/* Input Password con toggle de visibilidad */}
        <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 ml-1">Password</label>
            <div className="relative">
              <input
                  id="password"
                  name="password"
                  // El tipo cambia según el estado showPassword
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-4 py-3 bg-gray-100 border border-transparent rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-gray-300 focus:ring-0 sm:text-sm transition-colors pr-12" // pr-12 para hacer espacio al icono
                  placeholder="Enter your password"
              />
              {/* Botón del ojo */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </button>
            </div>
        </div>

        {/* Forgot Password Link (alineado a la derecha) */}
        <div className="flex items-center justify-end">
          <div className="text-sm">
            <Link href="/forgot-password" className="font-medium text-gray-500 hover:text-gray-800 transition-colors">
              Forgot Password
            </Link>
          </div>
        </div>

        {/* Botón de Submit: Color azul oscuro/grisáceo, ancho completo, redondeado */}
        <div>
          <button
            type="submit"
            disabled={formDisabled}
            // Color ajustado a un tono más oscuro (p.ej., bg-slate-700 o bg-[#3b5998] si quieres el exacto de la imagen, probemos slate-700)
            className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-slate-700 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-70 transition-colors"
          >
            {isLoadingForm ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Sign In'
            )}
          </button>
        </div>
      </form>

      {/* Footer Sign Up */}
      <p className="mt-8 text-center text-sm text-gray-600 font-medium">
        Don't have an account?{' '}
        <button 
          type="button"
          onClick={onToggleMode}
          className="font-bold text-gray-900 hover:underline ml-1 cursor-pointer"
        >
          Sign Up
        </button>
      </p>
    </div>
  );
}
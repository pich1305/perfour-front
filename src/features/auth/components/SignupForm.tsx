// src/features/auth/components/SignupForm.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../hooks/use-auth.hook';
import { motion } from 'framer-motion';

// Iconos SVG
const EyeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);
const EyeSlashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>);
const CheckMailIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-indigo-500"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>);

interface SignupFormProps {
  onToggleMode: () => void;
}

export default function SignupForm({ onToggleMode }: SignupFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // Estado para mostrar la pantalla de verificación

  const { signup } = useAuth();
  const logoPath = "/perfour-logo.png";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);
    try {
      await signup({ 
        email: formData.email, 
        password: formData.password, 
        firstName: formData.firstName, 
        lastName: formData.lastName 
      });
      // Si el signup es exitoso, cambiamos al estado de éxito
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error al crear la cuenta. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDERIZADO CONDICIONAL: ÉXITO ---
  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full bg-white rounded-[2rem] shadow-2xl p-8 md:p-12 text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-indigo-50 rounded-full">
            <CheckMailIcon /> {/* Asegúrate de tener el componente del icono definido arriba */}
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify your email</h2>
        <p className="text-gray-500 mb-8">
          We've sent a verification link to <span className="font-semibold text-gray-800">{formData.email}</span>. 
          Please check your inbox (and spam folder) to activate your account.
        </p>
        
        <div className="space-y-4">
          {/* CAMBIO IMPORTANTE: 
             En lugar de <Link href="/login">, usamos un <button> 
             que llama a onToggleMode().
          */}
          <button 
            type="button"
            onClick={onToggleMode} // <--- ESTO DESLIZA LA TARJETA AL LOGIN
            className="block w-full py-3.5 px-4 text-sm font-bold rounded-xl text-white bg-slate-700 hover:bg-slate-800 transition-colors shadow-md hover:shadow-lg"
          >
            Go to Login
          </button>

          <button 
            type="button"
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            onClick={() => alert("Aquí iría la lógica de reenvío")}
          >
            Didn't receive the email? Click to resend
          </button>
        </div>
      </motion.div>
    );
  }

  // --- RENDERIZADO: FORMULARIO ---
  return (
    <div className="w-full bg-white rounded-[2rem] shadow-2xl p-8 md:p-12">
      
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <Image src={logoPath} alt="Perfour Logo" width={180} height={60} priority objectFit="contain" />
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
        <p className="mt-2 text-sm text-gray-500">
          Start managing your construction projects today
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Nombres y Apellidos en dos columnas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 ml-1">Name</label>
            <input
              name="firstName"
              required
              value={formData.firstName}
              onChange={handleChange}
              className="block w-full px-4 py-3 bg-gray-100 border border-transparent rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-gray-300 focus:outline-none transition-colors sm:text-sm"
              placeholder="First Name"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 ml-1">Lastname</label>
            <input
              name="lastName"
              required
              value={formData.lastName}
              onChange={handleChange}
              className="block w-full px-4 py-3 bg-gray-100 border border-transparent rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-gray-300 focus:outline-none transition-colors sm:text-sm"
              placeholder="Last Name"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 ml-1">Email</label>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="block w-full px-4 py-3 bg-gray-100 border border-transparent rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-gray-300 focus:outline-none transition-colors sm:text-sm"
            placeholder="Enter your email"
          />
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 ml-1">Password</label>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={formData.password}
              onChange={handleChange}
              className="block w-full px-4 py-3 bg-gray-100 border border-transparent rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-gray-300 focus:outline-none transition-colors sm:text-sm pr-12"
              placeholder="Create a password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 ml-1">Confirm Password</label>
          <div className="relative">
            <input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="block w-full px-4 py-3 bg-gray-100 border border-transparent rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-gray-300 focus:outline-none transition-colors sm:text-sm pr-12"
              placeholder="Repeat password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-slate-700 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-70 transition-colors"
          >
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600 font-medium">
        Already have an account?{' '}
        <button 
          type="button"
          onClick={onToggleMode}
          className="font-bold text-gray-900 hover:underline ml-1 cursor-pointer"
        >
          Sign In
        </button>
      </p>
    </div>
  );
}
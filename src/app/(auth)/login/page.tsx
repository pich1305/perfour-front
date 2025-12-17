"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../features/auth/hooks/use-auth.hook';

// Importamos los componentes modificados
import LoginForm from '../../../features/auth/components/LoginForm'; 
import SignupForm from '../../../features/auth/components/SignupForm'; 

export default function AuthPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  // ESTADO MÁGICO: Controla si estamos en Login (Izquierda) o Signup (Derecha)
  const [isLogin, setIsLogin] = useState(true);

  const backgroundImagePath = "/construction-image.jpg";

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/home');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    // CONTENEDOR PRINCIPAL (Marco Blanco)
    <main className="h-screen w-full bg-white p-4 md:p-8 lg:p-12 flex items-center justify-center">
      
      {/* CONTENEDOR DE LA IMAGEN + FORMULARIO 
          - relative: Para la imagen de fondo.
          - flex: Para usar justify-content.
          - transition-all: Para suavizar cualquier cambio.
          
          AQUÍ ESTÁ EL TRUCO:
          - Si isLogin es true -> 'justify-start' (Izquierda)
          - Si isLogin es false -> 'justify-end' (Derecha)
      */}
      <div className={`relative w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl flex items-center 
        ${isLogin ? 'justify-start' : 'justify-end'}
      `}>

        {/* 1. IMAGEN DE FONDO (Fija) */}
        <div className="absolute inset-0 z-0">
          <Image
            src={backgroundImagePath}
            alt="Construction background"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          {/* Overlay opcional para mejorar lectura durante la transición */}
          <div className="absolute inset-0 bg-black/5 transition-colors duration-500" />
        </div>

        {/* 2. LA TARJETA DESLIZANTE (Motion Div) 
           - layout: Esta prop es la CLAVE. Le dice a Framer Motion: "Si mi posición cambia en el DOM (de start a end), anímalo automáticamente".
           - z-10: Para estar sobre la imagen.
        */}
        <motion.div
          layout 
          transition={{ type: "spring", stiffness: 120, damping: 20 }} // Ajusta la velocidad del deslizamiento aquí
          className={`relative z-10 w-full max-w-[480px] h-auto
            ${isLogin ? 'ml-4 md:ml-16 lg:ml-24 mr-4' : 'mr-4 md:mr-16 lg:mr-24 ml-4'}
          `}
        >
          {/* AnimatePresence mode="wait":
             Espera a que el formulario viejo desaparezca antes de mostrar el nuevo.
             Esto evita que se vea feo mientras se desliza.
          */}
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Pasamos la función para cambiar el estado */}
                <LoginForm onToggleMode={() => setIsLogin(false)} />
              </motion.div>
            ) : (
              <motion.div
                key="signup"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Pasamos la función para cambiar el estado */}
                <SignupForm onToggleMode={() => setIsLogin(true)} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      </div>
    </main>
  );
}


export default function SignupPage() {
  return null;
}
// // src/app/(auth)/signup/page.tsx
// "use client";

// import { useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import Image from 'next/image';
// import SignupForm from '../../../features/auth/components/SignupForm';
// import { useAuth } from '../../../features/auth/hooks/use-auth.hook';
// import { motion } from 'framer-motion'; // Importamos para la animación

// export default function SignupPage() {
//   const { isAuthenticated, isLoading } = useAuth();
//   const router = useRouter();

//   const backgroundImagePath = "/construction-image.jpg";

//   useEffect(() => {
//     if (!isLoading && isAuthenticated) {
//       router.push('/home');
//     }
//   }, [isAuthenticated, isLoading, router]);

//   if (isLoading || isAuthenticated) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   return (
//     // 1. MARCO BLANCO (Igual que Login)
//     <main className="h-screen w-full bg-white p-4 md:p-8 lg:p-12 flex items-center justify-center">
      
//       {/* 2. CONTENEDOR DE IMAGEN (Igual que Login) */}
//       <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl flex items-center">

//         {/* 3. IMAGEN DE FONDO */}
//         <div className="absolute inset-0 z-0">
//           <Image
//             src={backgroundImagePath}
//             alt="Construction background"
//             fill
//             priority
//             className="object-cover object-center"
//             sizes="100vw"
//           />
//         </div>

//         {/* 4. POSICIONAMIENTO DEL FORMULARIO - A LA DERECHA 
//            - ml-auto: Empuja el contenido hacia la derecha.
//            - mr-4 md:mr-16 lg:mr-32: Margen derecho para separarlo del borde.
//         */}
//         <div className="relative z-10 w-full max-w-[500px] ml-auto mr-4 md:mr-16 lg:mr-32 pl-4">
          
//           {/* Animación de entrada: Viene desde la izquierda para dar sensación de movimiento */}
//           <motion.div
//             initial={{ opacity: 0, x: -50 }} 
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.5, ease: "easeOut" }}
//           >
//             <SignupForm />
//           </motion.div>

//         </div>

//       </div>
//     </main>
//   );
// }

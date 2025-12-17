// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Montserrat } from "next/font/google";
import "./globals.css";

// Importamos solo los providers que son verdaderamente globales
import { AuthProvider } from "../providers/AuthProvider";
import { SidebarProvider } from "../providers/SidebarProvider"; // Asumiendo que moviste SidebarContext aquí
import { ConfirmDialogProvider } from "@/contexts/ConfirmDialogContext";
// import { Toaster } from "react-hot-toast";

// const inter = Inter({ subsets: ["latin"] });
const montserrat = Montserrat({
  subsets: ["latin"], // El subset de caracteres que necesitamos
  weight: ['400', '500', '600', '700'], // Los grosores de fuente que usará tu diseño
  variable: '--font-montserrat', // Creamos una variable CSS para usarla con Tailwind
});

export const metadata: Metadata = {
  title: "Perfour",
  description: "Perfour",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={montserrat.className}>
        {/*
          AuthProvider es global porque muchas partes de la app
          necesitan saber si el usuario está logueado.
        */}
        <AuthProvider>
          {/*
            SidebarProvider es global porque la Navbar y el MainContent
            necesitan saber si la sidebar está colapsada o no.
          */}
          <SidebarProvider>
            <ConfirmDialogProvider>
            {children}
            </ConfirmDialogProvider>
            {/* <Toaster position="top-right" /> */}
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
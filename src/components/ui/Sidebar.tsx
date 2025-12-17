"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  FileText, // Projects
  Users, // Teams
  ArrowUpCircle, 
  UserCircle, 
  Settings, 
  HelpCircle, 
  ChevronsRight 
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    // YA NO ES FIXED. Es relativo a su contenedor.
    // h-full: Ocupa toda la altura que le permita el layout.
    // w-20: Mantiene su ancho fijo.
    <aside className="h-full w-12">
      
      {/* Contenedor Interno (La Píldora) */}
      <div className="flex flex-col justify-between items-center w-full h-full bg-white border border-gray-200 shadow-md rounded-xl py-6">
        
        {/* SECCIÓN SUPERIOR */}
        <div className="flex flex-col items-center gap-6 w-full">

          <div className="flex flex-col gap-6 w-full mt-2">
            <PillItem icon={Home} label="Home" href="/home" isActive={pathname === '/home'} />
            <PillItem icon={FileText} label="Projects" href="/projects" isActive={pathname.startsWith('/projects')} />
            <PillItem icon={Users} label="Teams" href="/teams" isActive={pathname.startsWith('/teams')} />
          </div>
        </div>

        {/* SECCIÓN INFERIOR */}
        <div className="flex flex-col items-center gap-6 w-full mb-2">
           <Link href="/upgrade" className="flex flex-col items-center gap-1 group">
              <div className="p-1.5 rounded-full bg-pink-50 text-pink-500 group-hover:scale-110 transition-transform">
                <ArrowUpCircle size={24} strokeWidth={1.5} className="text-pink-600" />
              </div>
           </Link>

           <PillItem icon={UserCircle} label="Account" href="/account" isActive={pathname.startsWith('/account')} />
           <PillItem icon={Settings} label="Settings" href="/settings" isActive={pathname.startsWith('/settings')} />
           <PillItem icon={HelpCircle} label="FAQ" href="/faq" isActive={pathname.startsWith('/faq')} />
        </div>
      </div>
    </aside>
  );
}

// Componente auxiliar para los items
function PillItem({ icon: Icon, label, href, isActive }: { icon: any, label: string, href: string, isActive: boolean }) {
  return (
    <Link 
      href={href}
      className="group flex flex-col items-center justify-center gap-1.5 w-full relative"
    >
      {/* Icono */}
      <div className={`
        transition-all duration-200
        ${isActive ? 'text-purple-600 scale-110' : 'text-gray-500 group-hover:text-gray-900'}
      `}>
        <Icon size={24} strokeWidth={1.5} />
      </div>

      {/* Label */}
      <span className={`
        text-[10px] font-medium tracking-tight
        ${isActive ? 'text-purple-600' : 'text-gray-500'}
      `}>
        {label}
      </span>
    </Link>
  );
}
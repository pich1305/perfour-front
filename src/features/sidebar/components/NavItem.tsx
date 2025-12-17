import { usePathname } from "next/navigation";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Home, FolderKanban, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function NavItem({
  href,
  IconComponent,
  label,
  isActive,
  isCollapsed,
}: {
  href: string;
  IconComponent: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
}) {
  return (
    <Link href={href} legacyBehavior passHref>
      <a
        className={`group flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-200 w-full font-semibold text-lg relative overflow-hidden ${
          isActive 
            ? "bg-gradient-to-r from-perfour-blue to-perfour-blue/80 text-white shadow-lg" 
            : "hover:bg-perfour-lilac/40 text-perfour-blue hover:shadow-md"
        }`}
        aria-current={isActive ? "page" : undefined}
      >
        <IconComponent className={`h-6 w-6 shrink-0 transition-colors ${
          isActive ? "text-white" : "text-perfour-blue group-hover:text-perfour-blue/80"
        }`} />
        <AnimatePresence>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
        {isActive && (
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
        )}
      </a>
    </Link>
  );
}
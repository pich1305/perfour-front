import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";


export function CollapsibleSection({
  label,
  icon: IconComponent,
  children,
  isOpen,
  setIsOpen,
  active,
  isCollapsed,
  directLink,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  active: boolean;
  isCollapsed: boolean;
  directLink: string;
}) {
  const buttonContent = (
    <>
      <IconComponent className={`h-6 w-6 shrink-0 transition-colors ${
        active ? "text-white" : "text-perfour-blue group-hover:text-perfour-blue/80"
      }`} />
      <AnimatePresence>
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="flex-1 text-left overflow-hidden"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
      {!isCollapsed && (isOpen ? <ChevronUp className="h-5 w-5 shrink-0" /> : <ChevronDown className="h-5 w-5 shrink-0" />)}
      {active && (
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
      )}
    </>
  );

  const buttonClasses = `group flex items-center w-full gap-3 px-5 py-3 rounded-xl font-semibold text-lg transition-all duration-200 relative overflow-hidden ${
    active 
      ? "bg-gradient-to-r from-perfour-blue to-perfour-blue/80 text-white shadow-lg" 
      : "hover:bg-perfour-lilac/40 text-perfour-blue hover:shadow-md"
  }`;

  if (isCollapsed) {
    // Cuando está colapsado, actúa como un enlace directo
    return (
      <Link href={directLink} legacyBehavior passHref>
        <a className={buttonClasses} aria-label={`Ir a ${label}`}>
          {buttonContent}
        </a>
      </Link>
    );
  }

  // Cuando no está colapsado, mantiene el comportamiento de expandir/contraer
  return (
    <div className="w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={buttonClasses}
      >
        {buttonContent}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="pl-8 pr-2 mt-2 space-y-2 overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
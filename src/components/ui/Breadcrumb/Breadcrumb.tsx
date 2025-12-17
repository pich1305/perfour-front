"use client";

import React from 'react';
import { ChevronRight, Home, Folder, FileText, Users } from 'lucide-react';
import Link from 'next/link';
import './Breadcrumb.css'; // ✨ Importaremos un nuevo archivo CSS

// Mapeo de strings a componentes de íconos
const iconMap = {
  home: Home,
  folder: Folder,
  file: FileText,
  users: Users,
};

export interface BreadcrumbPart {
  label: string;
  href?: string;
  icon?: keyof typeof iconMap;
}

interface BreadcrumbProps {
  parts: BreadcrumbPart[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ parts }) => {
  if (!parts || parts.length === 0) {
    return null;
  }

  return (
    // ✨ El nav ya no es 'fixed'. El layout principal lo posiciona.
    <nav aria-label="Breadcrumb" className="breadcrumb-nav">
      {parts.map((part, index) => {
        const isLast = index === parts.length - 1;
        const IconComponent = part.icon ? iconMap[part.icon] : null;

        return (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight className="breadcrumb-separator" />}

            {isLast || !part.href ? (
              <span className="breadcrumb-item active">
                {IconComponent && <IconComponent className="breadcrumb-icon" />}
                {part.label}
              </span>
            ) : (
              <Link href={part.href} className="breadcrumb-item">
                {IconComponent && <IconComponent className="breadcrumb-icon" />}
                {part.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;

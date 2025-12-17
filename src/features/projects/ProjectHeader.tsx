// src/features/projects/ProjectHeader.tsx
"use client";

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import type { ProjectData } from '@/lib/types'; // Asegúrate de que este tipo sea correcto
import { Star, Download, Zap, Bot, MoreVertical } from 'lucide-react';

// Importamos los estilos CSS exactos que proporcionaste
import './ProjectHeader.css';

// Definición actualizada de TABS para coincidir con la estructura de carpetas (rutas)
const TABS = [
  { name: 'Overview', hrefKey: 'overview' },
  { name: 'Budgets', hrefKey: 'budgets' },
  { name: 'Tasks', hrefKey: 'tasks' }, // Asumiendo que "Cronograma y tareas" usa la ruta /tasks
  { name: 'Inventory', hrefKey: 'inventory' },
  { name: 'Quality Control', hrefKey: 'quality-control' },
  { name: 'RFI', hrefKey: 'request-for-information' },
  { name: 'Members', hrefKey: 'members' },
  { name: 'Informs', hrefKey: 'informs' },
];

interface ProjectHeaderProps {
  // Ajusta el tipo de project según tus necesidades. 
  // Si solo necesitas el nombre como en el código original, simplifica el tipo.
  project: { name: string; id: string }; 
}

export default function ProjectHeader({ project }: ProjectHeaderProps) {
  const pathname = usePathname(); 
  const params = useParams();   
  const activeTabKey = pathname.split('/').pop();

  return (
    <div className="project-header-container">
      {/* --- Top part with Title and Buttons --- */}
      <div className="header-top">
        <div className="project-title">
          <h1>{project.name}</h1>
          <Star className="icon-star" />
        </div>
        <div className="action-buttons">
          <button className="btn icon-only"><Download size={18} /></button>
          <button className="btn"><Zap size={18} /><span>Generate</span></button>
          <button className="btn"><Bot size={18} /><span>Automate</span></button>
          <button className="btn icon-only"><MoreVertical size={18} /></button>
        </div>
      </div>

      {/* --- Tab Navigation (Refactorizada con <Link>) --- */}
      <nav className="tab-navigation">
        {TABS.map((tab) => {
          const isActive = activeTabKey === tab.hrefKey;
          const href = `/project/${params.projectId}/${tab.hrefKey}`;

          return (
            <Link key={tab.hrefKey} href={href} legacyBehavior>
              {/* Usamos legacyBehavior en Link para que pase las props al 'a' interno.
                Mantenemos la clase 'tab' para el estilo base y añadimos 'active' dinámicamente.
              */}
              <a className={`tab ${isActive ? 'active' : ''}`}>
                {tab.name}
              </a>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
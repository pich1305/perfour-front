// src/features/projects/ProjectHeaderTabs.tsx
"use client"; // Necesario para usar hooks como usePathname y useParams

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';

// Definición de los tabs del proyecto. Podrías mover esto a un archivo de constantes.
const projectTabs = [
  { name: 'Overview', hrefKey: 'overview' },
  { name: 'Tasks', hrefKey: 'tasks' },
  { name: 'Budgets', hrefKey: 'budgets' },
  { name: 'Inventory', hrefKey: 'inventory' },
  { name: 'Quality Control', hrefKey: 'quality-control' },
  { name: 'RFI', hrefKey: 'request-for-information' }, // Asumiendo que RFI es la abreviatura
  { name: 'Members', hrefKey: 'members' },
  { name: 'Informs', hrefKey: 'informs' },
];

export function ProjectHeaderTabs() {
  const pathname = usePathname(); // Hook para leer la URL actual (ej: "/project/123/tasks")
  const params = useParams();   // Hook para obtener el projectId de la URL

  // Lógica para determinar el tab activo: extraemos la última parte del pathname.
  const activeTabKey = pathname.split('/').pop();

  return (
    <nav className="border-t border-gray-200 mt-4">
      <ul className="flex space-x-6 -mb-px px-6 overflow-x-auto">
        {projectTabs.map((tab) => {
          const isActive = tab.hrefKey === activeTabKey;
          const href = `/project/${params.projectId}/${tab.hrefKey}`;

          // Aplicamos estilos diferentes si el tab está activo
          const activeClasses = "border-blue-600 text-blue-600";
          const inactiveClasses = "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300";

          return (
            <li key={tab.hrefKey}>
              <Link
                href={href}
                className={`inline-flex items-center py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-150 ${isActive ? activeClasses : inactiveClasses}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {tab.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
"use client";

import { useProjectsList } from "./hooks/use-projects-list.hook";
import Link from 'next/link';
import { Plus } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// Un pequeño componente para la tarjeta de proyecto en la lista
function ProjectListCard({ project }: { project: any }) {
  return (
    <Link href={`/project/${project.id}`} className="block p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-shadow">
      <h3 className="font-bold text-lg text-gray-800">{project.name}</h3>
      <span className="text-sm text-gray-500">{project.status}</span>
    </Link>
  )
}

export default function ProjectList() {
  const { projects, isLoading } = useProjectsList();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Proyectos</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus size={20} />
          Crear Proyecto
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {projects.map(project => (
          <ProjectListCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
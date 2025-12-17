// src/app/(main)/project/[projectId]/tasks/page.tsx

"use client";

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import TasksSection from '@/features/tasks/TasksSection';

function TasksPageContent() {
  const params = useParams();
  const projectId = String((params as any)?.projectId ?? '');
  return <TasksSection projectId={projectId} />;
}

export default function ProjectTasksPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center animate-pulse text-black">Cargando...</div>}>
      <div className="ml-4 p-4 text-black">
        <h1 className='text-4xl font-bold mb-4'>Tareas y cronogramas</h1>
        <TasksPageContent />
      </div>
    </Suspense>
  );
}
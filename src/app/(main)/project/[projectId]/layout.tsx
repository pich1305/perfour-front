import ProjectHeader from '@/features/projects/ProjectHeader';
import { getProjectByIdServer } from '@/lib/api/project.server';
import StoreInitializer from '@/store/StoreInitializer';
import { notFound } from 'next/navigation';

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  const project = await getProjectByIdServer(projectId);

  if (!project) notFound();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <StoreInitializer projectName={project.name} />
      <ProjectHeader project={project} />
      <main className="flex-grow overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

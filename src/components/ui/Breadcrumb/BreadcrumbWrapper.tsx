"use client";

import { usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/use-auth.hook';
import Breadcrumb, { BreadcrumbPart } from './Breadcrumb';
import { useAppStore } from '@/store/appStore';

const formatSegmentLabel = (segment: string): string => {
  if (!segment) return '';
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function BreadcrumbWrapper() {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  // Este hook ahora obtendrá el nombre correcto gracias al StoreInitializer.
  const { projectName } = useAppStore(); 

  if (!isAuthenticated || pathname === '/login' || pathname === '/signup') {
    return null;
  }

  const generatedParts: BreadcrumbPart[] = [];
  const segments = pathname.split('/').filter(Boolean);

  if (segments[0] === 'home') {
    generatedParts.push({ label: 'Home', href: '/home', icon: 'home' });
  } else if (segments[0] === 'projects') {
    generatedParts.push({ label: 'Home', href: '/home', icon: 'home' });
    generatedParts.push({ label: 'Projects', href: '/projects', icon: 'folder' });
  } else if (segments[0] === 'project' && segments[1]) {
    const projectId = segments[1];
    generatedParts.push({ label: 'Home', href: '/home', icon: 'home' });
    generatedParts.push({ label: 'Projects', href: '/projects', icon: 'folder' });
    generatedParts.push({
      // Ahora `projectName` tendrá el valor real cuando esto se renderice.
      label: projectName || 'Cargando...',
      href: `/project/${projectId}/overview`,
      icon: 'file',
    });

    const subTabSegment = segments[2];
    if (subTabSegment) {
      generatedParts.push({
        label: formatSegmentLabel(subTabSegment),
        icon: 'file',
      });
    }
  }

  if (generatedParts.length === 0) {
    return null;
  }

  return <Breadcrumb parts={generatedParts} />;
}

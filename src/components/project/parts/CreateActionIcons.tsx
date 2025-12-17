// src/components/project/parts/CreateActionIcons.tsx
import React from 'react';

export function CreateGroupIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 19 8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="19" height="8" rx="4" fill="#F7C59F" />
      <rect width="9" height="8" rx="4" fill="#D69C76" />
    </svg>
  );
}

export function CreateSubgroupIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="14" height="2" rx="1" fill="#F4A7A1" />
      <rect x="3" y="4" width="11" height="2" rx="1" fill="#F7C59F" />
      <rect x="3" y="8" width="11" height="2" rx="1" fill="#F7C59F" />
    </svg>
  );
}

export function CreateMilestoneIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5.36328" y="10.728" width="7" height="7" transform="rotate(-135 5.36328 10.728)" fill="#F4A7A1" />
    </svg>
  );
}



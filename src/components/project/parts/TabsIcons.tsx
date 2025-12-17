// src/components/project/parts/TabsIcons.tsx
import React from 'react';

export function GanttTabIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.83333 3.5H13.5M8.5 11.8333H13.5M1 1V14.3333C1 14.7754 1.17559 15.1993 1.48816 15.5118C1.80072 15.8244 2.22464 16 2.66667 16H16M5.16667 7.66667H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function ListTabIcon({ className = '', dim = false }: { className?: string; dim?: boolean }) {
  return (
    <svg className={`${className} ${dim ? 'opacity-40' : ''}`} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2H19M12 7H19M12 13H19M12 18H19M2 1H7C7.55228 1 8 1.44772 8 2V7C8 7.55228 7.55228 8 7 8H2C1.44772 8 1 7.55228 1 7V2C1 1.44772 1.44772 1 2 1ZM2 12H7C7.55228 12 8 12.4477 8 13V18C8 18.5523 7.55228 19 7 19H2C1.44772 19 1 18.5523 1 18V13C1 12.4477 1.44772 12 2 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function BoardTabIcon({ className = '', dim = false }: { className?: string; dim?: boolean }) {
  return (
    <svg className={`${className} ${dim ? 'opacity-40' : ''}`} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 1H2C1.44772 1 1 1.44772 1 2V9C1 9.55229 1.44772 10 2 10H7C7.55228 10 8 9.55229 8 9V2C8 1.44772 7.55228 1 7 1Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18 1H13C12.4477 1 12 1.44772 12 2V5C12 5.55228 12.4477 6 13 6H18C18.5523 6 19 5.55228 19 5V2C19 1.44772 18.5523 1 18 1Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18 10H13C12.4477 10 12 10.4477 12 11V18C12 18.5523 12.4477 19 13 19H18C18.5523 19 19 18.5523 19 18V11C19 10.4477 18.5523 10 18 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 14H2C1.44772 14 1 14.4477 1 15V18C1 18.5523 1.44772 19 2 19H7C7.55228 19 8 18.5523 8 18V15C8 14.4477 7.55228 14 7 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}



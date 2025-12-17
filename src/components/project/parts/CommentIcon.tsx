// src/components/project/parts/CommentIcon.tsx
import React from 'react';

export function CommentIcon({ className = '', commentCount = 0 }: { className?: string; commentCount?: number }) {
  if (commentCount <= 0) return null;
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md border border-gray-200 ${className}`}>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.39668 6.73663C1.45549 6.885 1.46859 7.04757 1.43428 7.20343L1.00828 8.51942C0.99455 8.58616 0.998099 8.6553 1.01859 8.72028C1.03907 8.78526 1.07582 8.84393 1.12534 8.89073C1.17486 8.93753 1.23552 8.9709 1.30156 8.98768C1.36759 9.00446 1.43682 9.00409 1.50268 8.98662L2.86787 8.58742C3.01496 8.55825 3.16729 8.571 3.30747 8.62422C4.16163 9.02311 5.12922 9.1075 6.03953 8.86251C6.94984 8.61752 7.74438 8.05889 8.28295 7.28518C8.82152 6.51147 9.06952 5.57241 8.98319 4.63367C8.89686 3.69493 8.48175 2.81685 7.81109 2.15435C7.14044 1.49184 6.25735 1.08749 5.31762 1.01264C4.3779 0.93778 3.44193 1.19723 2.67485 1.74521C1.90778 2.29319 1.35889 3.09448 1.12503 4.00771C0.891179 4.92094 0.987384 5.88742 1.39668 6.73663Z" stroke="#ADADAD" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span className="text-xs text-gray-700 font-medium">{commentCount}</span>
    </div>
  );
}



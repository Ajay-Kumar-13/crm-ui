import React from 'react';

export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
);

export const TableRowSkeleton = ({ columns = 4, rows = 5 }) => (
  <>
    {Array.from({ length: rows }).map((_, i) => (
      <tr key={i}>
        {Array.from({ length: columns }).map((__, j) => (
          <td key={j} className="px-6 py-4">
            <Skeleton className="h-4 w-full max-w-[160px]" />
          </td>
        ))}
      </tr>
    ))}
  </>
);

export const CardSkeleton = ({ className = '' }) => (
  <div className={`bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-6 ${className}`}>
    <Skeleton className="h-4 w-1/3 mb-4" />
    <Skeleton className="h-8 w-1/2" />
  </div>
);

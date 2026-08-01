import React from 'react';
import { Inbox } from 'lucide-react';

export const EmptyState = ({ icon: Icon = Inbox, title = 'Nothing here yet', description, action, className = '' }) => (
  <div className={`flex flex-col items-center justify-center text-center py-12 px-4 ${className}`}>
    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
      <Icon className="w-6 h-6 text-slate-400" />
    </div>
    <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
    {description && <p className="text-sm text-slate-500 mt-1 max-w-sm">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

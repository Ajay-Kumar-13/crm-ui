import React from 'react';

export const Tabs = ({ tabs, active, onChange, className = '' }) => (
  <div className={`flex space-x-2 bg-slate-200 p-1 rounded-full w-fit ${className}`}>
    {tabs.map((tab) => (
      <button
        key={tab.value}
        type="button"
        onClick={() => onChange(tab.value)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
          active === tab.value ? 'bg-white text-primary-dark shadow-sm' : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

import React from 'react';

export const Button = ({ className = '', variant = 'primary', ...props }) => {
  const baseStyles = "px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-slate-200 text-slate-800 hover:bg-slate-300 focus:ring-slate-400",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    outline: "border border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-slate-400",
  };

  return <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props} />;
};

export const Input = ({ label, className = '', ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
    <input
      className={`w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400 ${className}`}
      {...props}
    />
  </div>
);

export const Checkbox = ({ label, className = '', ...props }) => (
  <label className="flex items-center space-x-2 cursor-pointer select-none group">
    <div className="relative w-4 h-4 flex-shrink-0">
      <input
        type="checkbox"
        className={`peer appearance-none w-4 h-4 border border-slate-300 rounded bg-white checked:bg-blue-600 checked:border-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:outline-none transition-colors ${className}`}
        {...props}
      />
      <svg
        className="absolute top-0.5 left-0.5 w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>
    <span className="text-sm text-slate-700 group-hover:text-slate-900">{label}</span>
  </label>
);

export const Select = ({ label, options, className = '', ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
    <select
      className={`w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

export const Card = ({ title, children, className = '', icon: Icon }) => (
  <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
    {title && (
      <div className="flex items-center mb-4">
        {Icon && <Icon className="w-5 h-5 text-slate-500 mr-2" />}
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      </div>
    )}
    {children}
  </div>
);

export const Badge = ({ children, color = 'gray' }) => {
  const colors = {
    green: 'bg-green-50 text-green-700 border border-green-200 ring-1 ring-green-600/20',
    blue: 'bg-blue-50 text-blue-700 border border-blue-200 ring-1 ring-blue-600/20',
    yellow: 'bg-yellow-50 text-yellow-700 border border-yellow-200 ring-1 ring-yellow-600/20',
    red: 'bg-red-50 text-red-700 border border-red-200 ring-1 ring-red-600/20',
    gray: 'bg-slate-50 text-slate-700 border border-slate-200 ring-1 ring-slate-600/20',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
};

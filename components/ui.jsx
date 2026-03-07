import React, { useEffect } from 'react';

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

export const LoadingScreen = ({ message = 'Loading data...' }) => (
  <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
    <div className="flex flex-col items-center space-y-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>
      </div>
      <p className="text-slate-600 font-medium">{message}</p>
    </div>
  </div>
);

export const Toast = ({ message, submessage, type = 'info', onClose, isVisible = true, duration = 3000 }) => {
  useEffect(() => {
    if (!isVisible || !duration) return;
    
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [isVisible, duration, onClose]);
  
  if (!isVisible) return null;
  
  const colors = {
    success: 'bg-green-50 text-green-700 border border-green-200',
    error: 'bg-red-50 text-red-700 border border-red-200',
    info: 'bg-blue-50 text-blue-700 border border-blue-200',
  };

  const iconColor = {
    success: 'text-green-600 bg-green-100',
    error: 'text-red-600 bg-red-100',
    info: 'text-blue-600 bg-blue-100',
  }

  const iconD = {
    success: "M5 11.917 9.724 16.5 19 7.5",
    error: "M6 18 17.94 6M18 18 6.06 6",
    info: "M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
  }

  return (
    <div id={`toast-${type}`} class={`flex items-center w-full max-w-lg m-auto p-4 rounded-lg shadow ${colors[type]}`} role="alert">
      <div class={`inline-flex items-center justify-center shrink-0 w-7 h-7 ${iconColor[type]} rounded`}>
        <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d={iconD[type]}/>
        </svg>
      </div>

      <div className='flex flex-col'>
        <div class="ml-3 text-md font-normal">
          {message}
        </div>
        <div class="ml-3 text-sm font-normal">
          {submessage}
        </div>
      </div>

      <button
        type="button"
        class="ml-auto flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded text-sm h-8 w-8"
        onClick={onClose}
      >
        <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M6 18 17.94 6M18 18 6.06 6"/>
        </svg>
      </button>
    </div>
  );
};
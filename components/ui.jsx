import React, { useEffect } from 'react';

export const Button = ({ className = '', variant = 'primary', ...props }) => {
  const baseStyles = "px-5 py-2.5 rounded-full font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-ink text-white hover:bg-primary hover:text-ink focus:ring-primary",
    secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200 focus:ring-slate-400",
    danger: "bg-danger text-white hover:bg-red-700 focus:ring-red-500",
    outline: "bg-white border border-slate-300 text-slate-600 hover:border-ink hover:text-ink focus:ring-slate-400",
  };

  return <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props} />;
};

export const Input = ({ label, className = '', ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
    <input
      className={`w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder-slate-400 ${className}`}
      {...props}
    />
  </div>
);

export const Checkbox = ({ label, className = '', ...props }) => (
  <label className="flex items-center space-x-2 cursor-pointer select-none group">
    <div className="relative w-4 h-4 flex-shrink-0">
      <input
        type="checkbox"
        className={`peer appearance-none w-4 h-4 border border-slate-300 rounded bg-white checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none transition-colors ${className}`}
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
      className={`w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${className}`}
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
  <div className={`bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-6 ${className}`}>
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
    green: 'bg-primary/10 text-primary-dark border border-primary/25 ring-1 ring-primary/20',
    blue: 'bg-[#e8efff] text-[#1a3a8a] border border-[#1a3a8a]/15 ring-1 ring-[#1a3a8a]/10',
    yellow: 'bg-[#fff3e8] text-[#b45309] border border-[#b45309]/20 ring-1 ring-[#b45309]/10',
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
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
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
    success: 'bg-primary/10 text-primary-dark border border-primary/25',
    error: 'bg-red-50 text-red-700 border border-red-200',
    info: 'bg-[#e8efff] text-[#1a3a8a] border border-[#1a3a8a]/15',
  };

  const iconColor = {
    success: 'text-primary-dark bg-primary/15',
    error: 'text-red-600 bg-red-100',
    info: 'text-[#1a3a8a] bg-[#e8efff]',
  }

  const iconD = {
    success: "M5 11.917 9.724 16.5 19 7.5",
    error: "M6 18 17.94 6M18 18 6.06 6",
    info: "M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
  }

  return (
    <div id={`toast-${type}`} className={`flex items-center w-full max-w-sm p-4 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.1),0_2px_6px_rgba(0,0,0,0.06)] ${colors[type]}`} role="alert">
      <div className={`inline-flex items-center justify-center shrink-0 w-7 h-7 ${iconColor[type]} rounded-full`}>
        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d={iconD[type]}/>
        </svg>
      </div>

      <div className='flex flex-col min-w-0'>
        <div className="ml-3 text-sm font-medium truncate">
          {message}
        </div>
        {submessage && <div className="ml-3 text-xs font-normal opacity-80">
          {submessage}
        </div>}
      </div>

      <button
        type="button"
        className="ml-auto flex items-center justify-center text-current opacity-60 hover:opacity-100 hover:bg-black/5 rounded-full text-sm h-8 w-8 shrink-0"
        onClick={onClose}
      >
        <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M6 18 17.94 6M18 18 6.06 6"/>
        </svg>
      </button>
    </div>
  );
};
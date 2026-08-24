import React from 'react';

export function Badge({ children, variant = 'default', size = 'md', className = '' }) {
  const baseStyles = 'inline-flex items-center justify-center font-label-md text-label-md rounded-[8px] font-semibold tracking-wider transition-colors';

  const variants = {
    default: 'bg-surface-container-high text-on-surface-variant',
    primary: 'bg-primary/10 text-primary border border-primary/20',
    secondary: 'bg-secondary/10 text-secondary border border-secondary/20',
    success: 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-800 border border-amber-500/30',
    error: 'bg-error-container text-on-error-container border border-error/20',
    rent: 'bg-primary-container text-on-primary-container font-bold',
    buy: 'bg-secondary text-on-secondary font-bold',
    borrow: 'bg-emerald-600 text-white font-bold',
    glass: 'bg-white/80 backdrop-blur-md text-on-surface border border-outline-variant/40 shadow-xs',
    status: 'bg-on-primary/20 text-on-primary-container uppercase px-2.5 py-0.5 rounded-full'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-label-md',
    lg: 'px-3.5 py-1.5 text-body-sm'
  };

  return (
    <span className={`${baseStyles} ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`}>
      {children}
    </span>
  );
}

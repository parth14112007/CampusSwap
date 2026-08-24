import React from 'react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  fullWidth = false,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-button-lg text-button-lg rounded-[16px] font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 cursor-pointer';

  const variants = {
    primary: 'bg-primary text-on-primary shadow-md hover:opacity-90 hover:shadow-lg',
    primaryContainer: 'bg-primary-container text-on-primary-container hover:opacity-90 shadow-sm',
    secondary: 'bg-transparent border-2 border-outline-variant text-on-surface hover:bg-surface-container-high',
    secondaryFilled: 'bg-secondary text-on-secondary hover:opacity-90 shadow-md',
    danger: 'bg-error text-on-error hover:opacity-90 shadow-md',
    sos: 'bg-error text-on-error font-bold shadow-lg hover:opacity-95 shadow-error/30 animate-pulse',
    ghost: 'bg-transparent text-on-surface hover:bg-surface-container-high',
    surface: 'bg-surface-container-lowest text-on-surface border border-outline-variant/30 hover:bg-surface-container shadow-xs'
  };

  const sizes = {
    sm: 'py-2 px-3 text-body-sm gap-1.5',
    md: 'py-3 px-4 text-button-lg gap-2',
    lg: 'py-3.5 px-6 text-button-lg gap-2.5',
    xl: 'py-4 px-8 text-button-lg gap-3'
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        ${baseStyles}
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {icon && iconPosition === 'left' && (
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      )}
      <span>{children}</span>
      {icon && iconPosition === 'right' && (
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      )}
    </button>
  );
}

import React from 'react';

// Common Panel Props
export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glow' | 'accent' | 'subtle';
  children: React.ReactNode;
  className?: string;
}

export const Panel: React.FC<PanelProps> = ({
  variant = 'default',
  children,
  className = '',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-[#091329] border border-blue-900/40 shadow-lg',
    glow: 'bg-gradient-to-b from-[#0B1736] to-[#0A1633] border border-blue-600/40 shadow-[0_0_30px_rgba(37,99,235,0.2)]',
    accent: 'bg-gradient-to-br from-[#062424] via-[#07302F] to-[#0A3D3C] border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.18)]',
    subtle: 'bg-[#0B1530] border border-blue-900/30',
  };

  return (
    <div
      className={`rounded-2xl transition-all ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Section Header with icon, title, subtitle and optional action
export interface SectionHeaderProps {
  icon?: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  iconBg?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  icon: Icon,
  iconColor = 'text-cyan-400',
  iconBg = 'bg-blue-950/70 border border-blue-800/40',
  title,
  subtitle,
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-900/30 ${className}`}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight leading-snug">{title}</h3>
          {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
    </div>
  );
};

// Metric Card matching Commercial BI style
export interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  trendPositive?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  iconBg?: string;
  variant?: 'default' | 'highlight';
  className?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  trendPositive = true,
  icon: Icon,
  iconColor = 'text-blue-400',
  iconBg = 'bg-[#132A54] border border-blue-500/30',
  variant = 'default',
  className = '',
  onClick,
}) => {
  const isHighlight = variant === 'highlight';

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-2xl flex flex-col justify-between space-y-4 transition-all ${
        onClick ? 'cursor-pointer hover:scale-[1.01]' : ''
      } ${
        isHighlight
          ? 'bg-gradient-to-br from-[#062424] via-[#07302F] to-[#0A3D3C] border border-emerald-500/50 hover:border-emerald-400/80 shadow-[0_0_30px_rgba(16,185,129,0.18)]'
          : 'bg-[#091329] border border-blue-900/40 hover:border-blue-500/40 shadow-sm'
      } ${className}`}
    >
      <div className="flex items-start justify-between">
        <div
          className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
            isHighlight
              ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
              : `${iconBg} ${iconColor}`
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span
            className={`inline-flex items-center gap-0.5 text-[11px] font-semibold font-mono ${
              isHighlight
                ? 'text-emerald-300'
                : trendPositive
                ? 'text-emerald-400'
                : 'text-rose-400'
            }`}
          >
            {trend}
          </span>
        )}
      </div>
      <div>
        <div className={`text-xs font-medium ${isHighlight ? 'text-emerald-300' : 'text-slate-400'}`}>
          {title}
        </div>
        <div
          className={`text-2xl font-black font-mono tracking-tight mt-0.5 truncate ${
            isHighlight ? 'text-emerald-200' : 'text-white'
          }`}
        >
          {value}
        </div>
        {subtitle && (
          <div className={`text-[10px] mt-1 ${isHighlight ? 'text-emerald-400/80' : 'text-slate-500'}`}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};

// Status Badge with neon and dark accents
export interface StatusBadgeProps {
  label: string;
  variant?: 'blue' | 'cyan' | 'green' | 'amber' | 'rose' | 'purple' | 'slate';
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = 'blue',
  size = 'sm',
  className = '',
}) => {
  const styles = {
    blue: 'bg-[#0E2F56] text-[#38BDF8] border-blue-500/30',
    cyan: 'bg-[#083344] text-[#22D3EE] border-cyan-500/30',
    green: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/30',
    amber: 'bg-[#362512] text-amber-300 border-amber-500/30',
    rose: 'bg-rose-950/70 text-rose-300 border-rose-500/30',
    purple: 'bg-[#1E1B4B] text-purple-300 border-purple-500/30',
    slate: 'bg-slate-900 text-slate-300 border-slate-700/50',
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium font-mono rounded-lg border ${sizeClasses} ${styles[variant]} ${className}`}
    >
      {label}
    </span>
  );
};

// Standard futuristic primary button
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'ai';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ComponentType<{ className?: string }>;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  children,
  className = '',
  disabled,
  ...props
}) => {
  const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all cursor-pointer select-none disabled:opacity-50 disabled:pointer-events-none';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-xs gap-2',
    lg: 'px-5 py-2.5 text-sm gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]',
    secondary: 'bg-[#0B1530] hover:bg-[#112356] text-slate-200 border border-blue-900/50 hover:border-blue-700/70',
    ghost: 'bg-transparent hover:bg-blue-950/50 text-slate-300 hover:text-white',
    danger: 'bg-rose-950/60 hover:bg-rose-900/80 text-rose-200 border border-rose-800/40',
    ai: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-[0_0_25px_rgba(56,189,248,0.35)]',
  };

  return (
    <button
      className={`${base} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && <Icon className="w-3.5 h-3.5 shrink-0" />}
    </button>
  );
};

// Modal Container in dark futuristic aesthetic
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  children,
  maxWidth = 'lg',
}) => {
  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div
        className={`bg-[#080E21] border border-blue-900/50 rounded-2xl w-full ${maxWidthStyles[maxWidth]} p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative space-y-4 my-8 text-slate-100 animate-in fade-in zoom-in-95 duration-200`}
      >
        <div className="flex items-start justify-between pb-3 border-b border-blue-900/40">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-9 h-9 rounded-xl bg-blue-950/70 border border-blue-700/40 flex items-center justify-center text-cyan-400">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">{title}</h3>
              {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            ✕
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

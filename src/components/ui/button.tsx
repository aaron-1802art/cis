import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-200 ease-out rounded-[var(--radius-md)] cursor-pointer select-none disabled:opacity-40 disabled:cursor-not-allowed";

  const variants: Record<string, string> = {
    primary:
      "bg-accent text-text-inverse hover:bg-accent-hover active:scale-[0.98]",
    secondary:
      "bg-transparent text-text-primary border border-border hover:border-border-active hover:bg-surface-hover active:scale-[0.98]",
    danger:
      "bg-danger-muted text-danger border border-danger/20 hover:bg-danger/20 active:scale-[0.98]",
    ghost:
      "bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-hover active:scale-[0.98]",
  };

  const sizes: Record<string, string> = {
    sm: "px-3 py-1.5 text-[13px] gap-1.5",
    md: "px-4 py-2.5 text-[14px] gap-2",
    lg: "px-6 py-3 text-[15px] gap-2.5",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-0.5 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}

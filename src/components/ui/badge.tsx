import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "danger" | "muted";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  const variants: Record<string, string> = {
    default:
      "bg-accent-muted text-text-secondary border-border",
    success:
      "bg-success-muted text-success border-success/20",
    danger:
      "bg-danger-muted text-danger border-danger/20",
    muted:
      "bg-surface-overlay text-text-tertiary border-border",
  };

  return (
    <span
      className={`
        inline-flex items-center 
        px-2.5 py-0.5 
        text-[11px] font-medium tracking-wide uppercase
        border rounded-full
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

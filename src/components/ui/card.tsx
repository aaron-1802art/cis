import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function Card({
  hover = false,
  padding = "md",
  children,
  className = "",
  ...props
}: CardProps) {
  const paddings: Record<string, string> = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={`
        bg-surface-raised 
        border border-border 
        rounded-[var(--radius-lg)]
        ${hover ? "transition-all duration-300 hover:border-border-active hover:bg-surface-hover cursor-pointer" : ""}
        ${paddings[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

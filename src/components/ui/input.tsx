import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({
  label,
  error,
  hint,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[13px] font-medium text-text-secondary tracking-tight"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full px-4 py-2.5 
          bg-surface-raised 
          border border-border 
          rounded-[var(--radius-md)] 
          text-text-primary text-[15px]
          placeholder:text-text-tertiary
          transition-all duration-200
          hover:border-border-active
          focus:outline-none focus:border-border-strong focus:ring-1 focus:ring-border-active
          disabled:opacity-40 disabled:cursor-not-allowed
          ${error ? "border-danger/40 focus:border-danger focus:ring-danger/20" : ""}
          ${className}
        `}
        {...props}
      />
      {hint && !error && (
        <p className="text-[12px] text-text-tertiary">{hint}</p>
      )}
      {error && <p className="text-[12px] text-danger">{error}</p>}
    </div>
  );
}

/* ========================================
   TEXTAREA VARIANT
   ======================================== */

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({
  label,
  error,
  className = "",
  id,
  ...props
}: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[13px] font-medium text-text-secondary tracking-tight"
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`
          w-full px-4 py-3 
          bg-surface-raised 
          border border-border 
          rounded-[var(--radius-md)] 
          text-text-primary text-[15px] leading-relaxed
          placeholder:text-text-tertiary
          transition-all duration-200
          hover:border-border-active
          focus:outline-none focus:border-border-strong focus:ring-1 focus:ring-border-active
          resize-none
          disabled:opacity-40 disabled:cursor-not-allowed
          ${error ? "border-danger/40 focus:border-danger focus:ring-danger/20" : ""}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-[12px] text-danger">{error}</p>}
    </div>
  );
}

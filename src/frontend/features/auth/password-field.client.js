"use client";

import { useId, useState } from "react";

export function PasswordField({
  label,
  name,
  placeholder,
  autoComplete,
  required = true,
  minLength = 6,
  helperText = "",
  defaultValue = "",
}) {
  const [isVisible, setIsVisible] = useState(false);
  const fieldId = useId();

  return (
    <label htmlFor={fieldId} className="block space-y-2">
      <span className="text-sm font-medium text-[var(--color-ink)]">{label}</span>
      <div className="relative">
        <input
          id={fieldId}
          type={isVisible ? "text" : "password"}
          name={name}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          defaultValue={defaultValue}
          className="field-input pr-20"
          placeholder={placeholder}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-3 py-1 text-xs font-semibold text-[var(--color-highlight)] transition hover:bg-[var(--color-card-soft)]"
          onClick={() => setIsVisible((visible) => !visible)}
        >
          {isVisible ? "Hide" : "Show"}
        </button>
      </div>
      {helperText ? (
        <span className="block px-1 text-xs leading-5 text-[var(--color-muted)]">
          {helperText}
        </span>
      ) : null}
    </label>
  );
}

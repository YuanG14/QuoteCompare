import type { InputHTMLAttributes } from "react";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export function FormField({ label, error, hint, id, ...props }: FormFieldProps) {
  const describedBy = [error ? `${id}-error` : "", hint ? `${id}-hint` : ""].filter(Boolean).join(" ");

  return (
    <label className="form-field" htmlFor={id}>
      <span className="form-label">{label}</span>
      <input
        id={id}
        className={`form-input ${error ? "form-input--error" : ""}`}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy || undefined}
        {...props}
      />
      {error ? <span className="form-error" id={`${id}-error`}>{error}</span> : null}
      {hint ? <span className="form-hint" id={`${id}-hint`}>{hint}</span> : null}
    </label>
  );
}

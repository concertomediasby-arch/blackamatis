import { forwardRef, useId } from "react";

const inputCls =
  "min-h-11 w-full rounded-xl border border-editor-border bg-white px-3.5 py-2.5 text-[15px] text-[#14141a] placeholder:text-[#8a8794] focus:border-prussian aria-[invalid=true]:border-red-600";

type Base = { label: string; error?: string; hint?: React.ReactNode; className?: string };

export const TextField = forwardRef<HTMLInputElement, Base & React.InputHTMLAttributes<HTMLInputElement>>(function TextField(
  { label, error, hint, className = "", ...rest },
  ref,
) {
  const id = useId();
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <input ref={ref} id={id} aria-invalid={!!error} aria-describedby={error || hint ? `${id}-d` : undefined} className={inputCls} {...rest} />
      <FieldNote id={`${id}-d`} error={error} hint={hint} />
    </div>
  );
});

export const TextArea = forwardRef<HTMLTextAreaElement, Base & React.TextareaHTMLAttributes<HTMLTextAreaElement>>(function TextArea(
  { label, error, hint, className = "", ...rest },
  ref,
) {
  const id = useId();
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <textarea ref={ref} id={id} rows={4} aria-invalid={!!error} aria-describedby={`${id}-d`} className={`${inputCls} resize-y`} {...rest} />
      <FieldNote id={`${id}-d`} error={error} hint={hint} />
    </div>
  );
});

export const SelectField = forwardRef<HTMLSelectElement, Base & React.SelectHTMLAttributes<HTMLSelectElement>>(function SelectField(
  { label, error, hint, className = "", children, ...rest },
  ref,
) {
  const id = useId();
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <select ref={ref} id={id} aria-invalid={!!error} aria-describedby={`${id}-d`} className={inputCls} {...rest}>
        {children}
      </select>
      <FieldNote id={`${id}-d`} error={error} hint={hint} />
    </div>
  );
});

export const Checkbox = forwardRef<HTMLInputElement, { label: string } & React.InputHTMLAttributes<HTMLInputElement>>(function Checkbox(
  { label, ...rest },
  ref,
) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px]">
      <input ref={ref} type="checkbox" className="h-5 w-5 accent-prussian" {...rest} />
      {label}
    </label>
  );
});

function FieldNote({ id, error, hint }: { id: string; error?: string; hint?: React.ReactNode }) {
  if (!error && !hint) return null;
  return (
    <span id={id} className={`text-[13px] ${error ? "text-red-700" : "text-[#55535c]"}`}>
      {error ?? hint}
    </span>
  );
}

export function Card({ title, children, actions, className = "" }: { title?: string; children: React.ReactNode; actions?: React.ReactNode; className?: string }) {
  return (
    <section className={`flex flex-col gap-5 rounded-2xl border border-editor-border bg-white p-5 sm:p-6 ${className}`}>
      {(title || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          {title && <h2 className="m-0 text-lg font-bold">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function PageTitle({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-1.5">
      <h1 className="m-0 font-display text-4xl font-extrabold text-prussian">{title}</h1>
      {children && <p className="m-0 max-w-[720px] text-[15px] text-[#4a4852]">{children}</p>}
    </div>
  );
}

export const btn = {
  primary: "pill cursor-pointer bg-prussian text-lemon disabled:opacity-50",
  secondary: "pill cursor-pointer border border-prussian bg-white text-prussian disabled:opacity-50",
  ghost: "inline-flex h-11 min-w-11 cursor-pointer items-center justify-center rounded-xl border border-editor-border bg-white px-2 text-sm hover:border-prussian disabled:opacity-40",
  danger: "pill cursor-pointer border border-red-300 bg-white text-red-700",
};

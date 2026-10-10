import { useId, type ReactNode } from 'react';
export function Field({ label, children, hint }: { label: string; children: (id: string) => ReactNode; hint?: string }) {
  const id = useId();
  return <div className="field"><label htmlFor={id}>{label}</label>{children(id)}{hint && <small>{hint}</small>}</div>;
}
export function TextField({ label, value, onChange, multiline = false, type = 'text', required = false, placeholder = '', hint }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean; type?: string; required?: boolean; placeholder?: string; hint?: string }) {
  return <Field label={label}>{id => <>{multiline ? <textarea id={id} value={value} onChange={e => onChange(e.target.value)} rows={3} placeholder={placeholder} aria-describedby={hint ? `${id}-hint` : undefined} /> : <input id={id} type={type} value={value} onChange={e => onChange(e.target.value)} required={required} placeholder={placeholder} aria-describedby={hint ? `${id}-hint` : undefined} />}{hint && <small id={`${id}-hint`}>{hint}</small>}</>}</Field>;
}

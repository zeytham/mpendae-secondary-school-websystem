/**
 * Admin Form Primitives
 * Shared inline-style input/label/select components for all admin pages
 * Uses CSS variable design tokens — no Tailwind classes
 */

import React, { useState } from 'react';

/* ─── Input styles ─── */
export const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,.05)',
  border: '1px solid rgba(255,255,255,.1)',
  borderRadius: '.875rem',
  padding: '.7rem 1rem',
  color: '#fff',
  fontSize: '.875rem',
  outline: 'none',
  transition: 'border-color .2s, box-shadow .2s',
  fontFamily: 'var(--f-body)',
};

export const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: 'vertical' as const,
  minHeight: 100,
};

export const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '.68rem',
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  letterSpacing: '.1em',
  color: 'rgba(255,255,255,.45)',
  marginBottom: '.45rem',
};

/* ─── Field wrapper ─── */
export function AdminField({
  label, required, error, children,
}: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label style={labelStyle}>{label}{required && <span style={{ color: '#ff4757', marginLeft: '.2rem' }}>*</span>}</label>
      {children}
      {error && <p style={{ fontSize: '.68rem', color: '#ff4757', marginTop: '.3rem', fontWeight: 600 }}>{error}</p>}
    </div>
  );
}

/* ─── Input with focus glow ─── */
export function AdminInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      onFocus={e => { setFocused(true); props.onFocus?.(e); }}
      onBlur={e => { setFocused(false); props.onBlur?.(e); }}
      style={{
        ...inputStyle,
        borderColor: focused ? 'rgba(0,255,65,.45)' : 'rgba(255,255,255,.1)',
        boxShadow: focused ? '0 0 0 3px rgba(0,255,65,.08)' : 'none',
        ...props.style,
      }}
    />
  );
}

/* ─── Textarea with focus glow ─── */
export function AdminTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      {...props}
      onFocus={e => { setFocused(true); props.onFocus?.(e); }}
      onBlur={e => { setFocused(false); props.onBlur?.(e); }}
      style={{
        ...textareaStyle,
        borderColor: focused ? 'rgba(0,255,65,.45)' : 'rgba(255,255,255,.1)',
        boxShadow: focused ? '0 0 0 3px rgba(0,255,65,.08)' : 'none',
        ...props.style,
      }}
    />
  );
}

/* ─── Select with focus glow ─── */
export function AdminSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      {...props}
      onFocus={e => { setFocused(true); props.onFocus?.(e); }}
      onBlur={e => { setFocused(false); props.onBlur?.(e); }}
      style={{
        ...inputStyle,
        cursor: 'pointer',
        borderColor: focused ? 'rgba(0,255,65,.45)' : 'rgba(255,255,255,.1)',
        boxShadow: focused ? '0 0 0 3px rgba(0,255,65,.08)' : 'none',
        appearance: 'none' as const,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(255,255,255,.4)' strokeWidth='1.5' strokeLinecap='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 1rem center',
        paddingRight: '2.5rem',
        ...props.style,
      }}
    />
  );
}

/* ─── Admin action buttons ─── */
export function BtnPrimary({ children, style, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const [hov, setHov] = useState(false);
  return (
    <button
      {...rest}
      onMouseEnter={e => { setHov(true); rest.onMouseEnter?.(e); }}
      onMouseLeave={e => { setHov(false); rest.onMouseLeave?.(e); }}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '.5rem',
        padding: '.65rem 1.4rem', borderRadius: '.875rem', cursor: rest.disabled ? 'not-allowed' : 'pointer',
        background: rest.disabled ? 'rgba(0,255,65,.3)' : hov ? 'rgba(0,255,65,.9)' : 'var(--c-lime)',
        color: '#050805', fontWeight: 800, fontSize: '.875rem', border: 'none',
        opacity: rest.disabled ? .65 : 1,
        transform: hov && !rest.disabled ? 'translateY(-1px)' : 'none',
        boxShadow: hov && !rest.disabled ? '0 8px 24px rgba(0,255,65,.25)' : 'none',
        transition: 'all .2s cubic-bezier(.22,1,.36,1)',
        fontFamily: 'var(--f-body)',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function BtnSecondary({ children, style, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const [hov, setHov] = useState(false);
  return (
    <button
      {...rest}
      onMouseEnter={e => { setHov(true); rest.onMouseEnter?.(e); }}
      onMouseLeave={e => { setHov(false); rest.onMouseLeave?.(e); }}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '.5rem',
        padding: '.65rem 1.4rem', borderRadius: '.875rem', cursor: 'pointer',
        background: hov ? 'rgba(255,255,255,.07)' : 'rgba(255,255,255,.04)',
        color: 'rgba(255,255,255,.7)', fontWeight: 700, fontSize: '.875rem',
        border: `1px solid ${hov ? 'rgba(255,255,255,.18)' : 'rgba(255,255,255,.1)'}`,
        transition: 'all .2s',
        fontFamily: 'var(--f-body)',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function BtnDanger({ children, style, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const [hov, setHov] = useState(false);
  return (
    <button
      {...rest}
      onMouseEnter={e => { setHov(true); rest.onMouseEnter?.(e); }}
      onMouseLeave={e => { setHov(false); rest.onMouseLeave?.(e); }}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '.5rem',
        padding: '.65rem 1.4rem', borderRadius: '.875rem', cursor: 'pointer',
        background: hov ? 'rgba(255,71,87,.18)' : 'rgba(255,71,87,.08)',
        color: '#ff4757', fontWeight: 700, fontSize: '.875rem',
        border: `1px solid ${hov ? 'rgba(255,71,87,.4)' : 'rgba(255,71,87,.2)'}`,
        transition: 'all .2s',
        fontFamily: 'var(--f-body)',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

/* ─── Small icon action buttons for table rows ─── */
export function IconBtn({ color = 'default', ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { color?: 'default' | 'danger' | 'lime' }) {
  const [hov, setHov] = useState(false);
  const colorMap = {
    default: { bg: 'rgba(255,255,255,.08)', hbg: 'rgba(255,255,255,.14)', c: 'rgba(255,255,255,.5)', hc: '#fff', bd: 'rgba(255,255,255,.08)', hbd: 'rgba(255,255,255,.2)' },
    danger: { bg: 'rgba(255,71,87,.08)', hbg: 'rgba(255,71,87,.18)', c: '#ff4757', hc: '#ff4757', bd: 'rgba(255,71,87,.2)', hbd: 'rgba(255,71,87,.4)' },
    lime: { bg: 'rgba(0,255,65,.08)', hbg: 'rgba(0,255,65,.15)', c: 'var(--c-lime)', hc: 'var(--c-lime)', bd: 'rgba(0,255,65,.2)', hbd: 'rgba(0,255,65,.4)' },
  }[color];

  return (
    <button
      {...rest}
      onMouseEnter={e => { setHov(true); rest.onMouseEnter?.(e); }}
      onMouseLeave={e => { setHov(false); rest.onMouseLeave?.(e); }}
      style={{
        width: 30, height: 30, borderRadius: '.625rem', cursor: 'pointer',
        background: hov ? colorMap.hbg : colorMap.bg,
        border: `1px solid ${hov ? colorMap.hbd : colorMap.bd}`,
        color: hov ? colorMap.hc : colorMap.c,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all .18s', padding: 0,
        transform: hov ? 'scale(1.08)' : 'scale(1)',
        ...rest.style,
      }}
    >
      {rest.children}
    </button>
  );
}

/* ─── Section header ─── */
export function AdminPageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.25rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
      <div>
        <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-.015em' }}>{title}</h1>
        {subtitle && <p style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.4)', margin: '.35rem 0 0', fontWeight: 500 }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: 'flex', alignItems: 'center', gap: '.625rem', flexWrap: 'wrap' }}>{actions}</div>}
    </div>
  );
}

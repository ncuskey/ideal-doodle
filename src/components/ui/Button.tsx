import { forwardRef } from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary'|'secondary'|'danger'; size?: 'md'|'lg' };

export default forwardRef<HTMLButtonElement, Props>(function Button({ className, variant='primary', size='md', ...rest }, ref){
  const base = 'inline-flex items-center justify-center rounded-md font-medium transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0';
  const sizing = size==='lg' ? 'min-h-12 min-w-12 px-4 py-2 text-sm' : 'min-h-11 min-w-11 px-3 py-2 text-sm';
  const styles = {
    primary: 'bg-[var(--brand-600)] text-white hover:bg-[var(--brand-700)] disabled:bg-[var(--brand-300)]',
    secondary: 'bg-white text-zinc-800 border border-[var(--border)] hover:bg-zinc-50 disabled:text-zinc-400',
    danger: 'bg-[var(--danger)] text-white hover:bg-red-700 disabled:bg-red-300'
  }[variant];
  return <button ref={ref} className={`${base} ${sizing} ${styles} ${className || ''}`} {...rest}/>;
});

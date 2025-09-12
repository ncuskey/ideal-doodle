import { forwardRef } from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary'|'secondary'|'danger'; size?: 'md'|'lg' };

export default forwardRef<HTMLButtonElement, Props>(function Button({ className, variant='primary', size='md', ...rest }, ref){
  const base = 'inline-flex items-center justify-center rounded-md font-medium transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0';
  const sizing = size==='lg' ? 'min-h-12 min-w-12 px-4 py-2 text-sm' : 'min-h-11 min-w-11 px-3 py-2 text-sm';
  const styles = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50',
    secondary: 'bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80 disabled:opacity-50',
    danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50',
  }[variant];
  return <button ref={ref} className={`${base} ${sizing} ${styles} ${className || ''}`} {...rest}/>;
});

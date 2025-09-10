export default function Spinner({ className='' }:{ className?:string }){
  return (
    <svg className={`animate-spin ${className}`} width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity=".2"/>
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" fill="none"/>
    </svg>
  );
}

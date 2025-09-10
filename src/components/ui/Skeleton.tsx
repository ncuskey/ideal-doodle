export default function Skeleton({ className='' }:{ className?:string }){
  return <div className={`animate-pulse rounded-md bg-zinc-200 ${className}`} aria-hidden="true"/>;
}

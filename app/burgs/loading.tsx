import Skeleton from '@/components/ui/Skeleton';
export default function Loading(){
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-40"/>
      <div className="rounded-lg border bg-white p-3 space-y-2">
        {Array.from({length:8}).map((_,i)=>(<Skeleton key={i} className="h-8 w-full"/>))}
      </div>
    </div>
  );
}

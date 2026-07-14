export function SkeletonLine({ w = 'w-full', h = 'h-4' }) {
  return <div className={`${w} ${h} bg-neutral-200 rounded-lg animate-pulse`} />;
}

export function SkeletonCard({ lines = 3, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-neutral-100 p-6 space-y-3 ${className}`}>
      <SkeletonLine h="h-5" w="w-2/3" />
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <SkeletonLine key={i} w={i % 2 === 0 ? 'w-full' : 'w-4/5'} />
      ))}
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-3 animate-pulse">
      <SkeletonLine h="h-3" w="w-1/2" />
      <SkeletonLine h="h-8" w="w-1/3" />
    </div>
  );
}

export default SkeletonCard;

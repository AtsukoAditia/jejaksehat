export default function ProgressLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Memuat progress">
      <div className="h-24 animate-pulse rounded-3xl bg-white/75" />
      <div className="h-56 animate-pulse rounded-[2rem] bg-white/75" />
      <div className="grid grid-cols-3 gap-3">
        <div className="h-28 animate-pulse rounded-3xl bg-white/75" />
        <div className="h-28 animate-pulse rounded-3xl bg-white/75" />
        <div className="h-28 animate-pulse rounded-3xl bg-white/75" />
      </div>
      <div className="h-64 animate-pulse rounded-3xl bg-white/75" />
    </div>
  );
}

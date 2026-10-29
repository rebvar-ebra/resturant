export default function MenuLoading() {
  return (
    <main className="shell py-12" aria-busy="true" aria-label="در حال دریافت منو">
      <div className="h-12 w-40 animate-pulse rounded-full bg-black/10" />
      <div className="mt-24 h-24 w-3/4 animate-pulse rounded-3xl bg-black/10" />
      <div className="mt-12 grid gap-4 md:grid-cols-2">
        <div className="h-64 animate-pulse rounded-[2rem] bg-black/10" />
        <div className="h-64 animate-pulse rounded-[2rem] bg-black/10" />
      </div>
    </main>
  );
}

export function BackgroundOrbs() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-surface" aria-hidden>
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-blue-700/20 blur-[120px]" />
      <div className="absolute top-1/4 -right-32 w-96 h-96 rounded-full bg-sky-600/15 blur-[100px]" />
      <div className="absolute -bottom-32 left-1/4 w-[450px] h-[450px] rounded-full bg-blue-900/25 blur-[130px]" />
      <div className="absolute top-2/3 right-1/3 w-72 h-72 rounded-full bg-cyan-700/10 blur-[100px]" />
    </div>
  );
}

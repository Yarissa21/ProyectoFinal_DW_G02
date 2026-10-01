function LoadingState({ label }: { label: string }) {
  return (
    <div
      role="status"
      className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-16 text-slate-600"
    >
      <span
        aria-hidden="true"
        className="size-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900 motion-reduce:animate-none"
      />
      {label}
    </div>
  );
}

export default LoadingState;
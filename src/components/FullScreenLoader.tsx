function FullScreenLoader() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-screen items-center justify-center text-slate-600"
    >
      Cargando sesión...
    </div>
  );
}

export default FullScreenLoader;
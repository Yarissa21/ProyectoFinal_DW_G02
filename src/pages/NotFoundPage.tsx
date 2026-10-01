import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="text-2xl font-bold text-slate-900">Página no encontrada</h1>
      <Link to="/" className="text-blue-700 underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700">
        Volver al inicio
      </Link>
    </div>
  );
}

export default NotFoundPage;
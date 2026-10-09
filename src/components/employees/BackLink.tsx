import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

function BackLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="rounded text-sm text-blue-800 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700"
    >
      <span aria-hidden="true">← </span>
      {children}
    </Link>
  );
}

export default BackLink;
'use client';

import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="container">
      <div className="lock-container">
        <div className="lock-card text-center" style={{ padding: '64px 32px' }}>
          <div className="success-icon" style={{ background: '#333', color: '#fff' }}>!</div>
          <h1>Algo salió mal</h1>
          <p style={{ color: 'var(--muted)', margin: '16px 0 32px' }}>
            {error.message || 'No pudimos procesar tu solicitud. Intenta de nuevo más tarde.'}
          </p>
          
          <div className="nav-actions" style={{ justifyContent: 'center' }}>
            <button className="btn ghost" onClick={() => reset()}>Reintentar</button>
            <Link href="/" className="btn primary">Ir al inicio</Link>
          </div>
        </div>
      </div>
    </main>
  );
}

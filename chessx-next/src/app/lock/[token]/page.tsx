import Link from 'next/link';
import { getLockByToken } from '@/lib/db';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ token: string }>;
}

export default async function LockedPage({ params }: Props) {
  const { token } = await params;
  const lock = await getLockByToken(token);

  if (!lock) {
    notFound();
  }

  const isPaid = lock.status === 'paid';
  const formatAmount = (cents: number) => (cents / 100).toLocaleString('es-ES', { style: 'currency', currency: lock.currency.toUpperCase() });

  return (
    <main className="container">
      <div className="lock-container">
        <div className="lock-card">
          <header className="lock-header">
            <div className="pill">{isPaid ? 'Desbloqueado' : 'Contenido Protegido'}</div>
            <h1 style={{ marginTop: '16px' }}>{lock.title}</h1>
            {lock.description && <p style={{ color: 'var(--muted)', marginTop: '8px' }}>{lock.description}</p>}
          </header>

          <div className="lock-body">
            {!isPaid ? (
              <>
                <div className="price-display">
                  <div className="price-label">Resumen de pago</div>
                  <div className="price-value">{formatAmount(lock.amount_cents)}</div>
                </div>

                <div className="file-box" style={{ marginBottom: '32px', textAlign: 'center' }}>
                  <p style={{ fontSize: '14px', color: 'var(--muted)' }}>
                    {lock.file.type === 'upload' ? 'Archivo bloqueado: ' + lock.file.original_name : 'Enlace protegido'}
                  </p>
                  <p style={{ fontSize: '12px', marginTop: '4px' }}>Completa el pago para acceder instantáneamente.</p>
                </div>

                <form action={`/api/checkout/${lock.token}`} method="POST">
                  <button className="btn primary large full-width" type="submit">
                    Pagar y Desbloquear
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div className="success-icon">✓</div>
                <h2>¡Pago confirmado!</h2>
                <p style={{ margin: '16px 0 32px', color: 'var(--muted)' }}>El archivo ha sido desbloqueado con éxito.</p>
                
                <div className="file-box" style={{ marginBottom: '32px' }}>
                  <p style={{ fontWeight: '700' }}>
                    {lock.file.type === 'upload' ? 'Archivo: ' + lock.file.original_name : 'Enlace:'}
                  </p>
                  <div style={{ marginTop: '16px' }}>
                    {lock.file.type === 'upload' ? (
                      <a href={`/api/download/${lock.token}`} className="btn primary full-width">Descargar ahora</a>
                    ) : (
                      <a href={lock.file.url} target="_blank" rel="noopener noreferrer" className="btn primary full-width">Ir al enlace</a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

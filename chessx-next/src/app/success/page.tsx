import { getLockBySessionId } from '@/lib/db';
import { stripe } from '@/lib/stripe';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function SuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams;

  if (!session_id) {
    notFound();
  }

  let lock = await getLockBySessionId(session_id);

  if (stripe) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      
      if (session.payment_status === 'paid' && lock && lock.status !== 'paid') {
        const { updateLock } = await import('@/lib/db');
        lock = await updateLock(lock.id, {
          status: 'paid',
          paid_at: new Date().toISOString(),
          stripe: {
            ...(lock.stripe || {}),
            session_id: session.id,
            payment_intent: session.payment_intent as string,
            customer_email: session.customer_details?.email
          }
        });
      }
    } catch (error) {
      console.error('Error retrieving session:', error);
    }
  }

  if (!lock) {
    notFound();
  }

  return (
    <main className="container">
      <div className="lock-container">
        <div className="lock-card text-center" style={{ padding: '64px 32px' }}>
          <div className="success-icon">✓</div>
          <h1>¡Pago Confirmado!</h1>
          <p style={{ color: 'var(--muted)', margin: '16px 0 32px' }}>Gracias por tu pago. El archivo ya está disponible para su descarga.</p>
          
          <div className="file-box" style={{ marginBottom: '32px' }}>
            <p style={{ fontWeight: '700' }}>{lock.file.type === 'upload' ? lock.file.original_name : 'Tu enlace seguro'}</p>
            <div style={{ marginTop: '24px' }}>
              {lock.file.type === 'upload' ? (
                <a href={`/api/download/${lock.token}`} className="btn primary full-width large">Descargar Archivo</a>
              ) : (
                <a href={lock.file.url} target="_blank" rel="noopener noreferrer" className="btn primary full-width large">Acceder al Contenido</a>
              )}
            </div>
          </div>

          <Link href="/" className="btn ghost">Volver al inicio</Link>
        </div>
      </div>
    </main>
  );
}

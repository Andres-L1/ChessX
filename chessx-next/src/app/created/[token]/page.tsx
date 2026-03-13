import Link from 'next/link';
import { getLockByToken } from '@/lib/db';
import { notFound } from 'next/navigation';
import CopyButton from '@/components/CopyButton';

interface Props {
  params: Promise<{ token: string }>;
}

export default async function CreatedPage({ params }: Props) {
  const { token } = await params;
  const lock = await getLockByToken(token);

  if (!lock) {
    notFound();
  }

  const lockUrl = `${process.env.BASE_URL}/lock/${lock.token}`;

  return (
    <main className="container">
      <div className="form-card text-center">
        <div className="success-icon">✓</div>
        <h1>¡Candado Creado!</h1>
        <p style={{ color: 'var(--muted)', marginTop: '8px' }}>Tu archivo ya está protegido. Comparte este link con tu cliente para que pueda guardarlo e iniciar el pago.</p>
        
        <div className="share-box">
          <p style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--accent)' }}>Link de pago para el cliente</p>
          <div className="copy-row" style={{ justifyContent: 'center', marginTop: '16px' }}>
            <div style={{ background: '#111', padding: '12px 20px', border: '1px solid var(--line)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {lockUrl}
            </div>
          </div>
          <div style={{ marginTop: '24px' }}>
            <CopyButton text={lockUrl} />
          </div>
        </div>

        <div className="nav-actions" style={{ justifyContent: 'center' }}>
          <Link href="/" className="btn ghost">Ir al inicio</Link>
          <Link href="/create" className="btn primary">Crear otro candado</Link>
        </div>
      </div>
    </main>
  );
}

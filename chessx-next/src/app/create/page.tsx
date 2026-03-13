'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CreateLockPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deliveryType, setDeliveryType] = useState<'upload' | 'link'>('upload');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    try {
      const res = await fetch('/api/locks', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Algo falló al crear el candado');
      }

      const data = await res.json();
      router.push(`/created/${data.token}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <div className="form-card">
        <header className="form-header">
          <div className="pill">Nuevo Candado</div>
          <h1>Configura tu entrega</h1>
          <p>Completa los detalles del trabajo y bloquea el acceso hasta que se confirme el pago.</p>
        </header>

        {error && (
          <div className="status" style={{ borderColor: 'red', color: 'red', marginBottom: '24px' }}>
            {error}
          </div>
        )}

        <form className="form" onSubmit={handleSubmit}>
          <div className="form-section">
            <label htmlFor="title">Título del trabajo</label>
            <input type="text" id="title" name="title" placeholder="Ej: Diseño de Logotipo - Pack Final" required />
            <span className="helper">Este nombre aparecerá en el checkout de Stripe.</span>
          </div>

          <div className="form-section">
            <label htmlFor="description">Descripción (opcional)</label>
            <textarea id="description" name="description" placeholder="Detalla qué incluye esta entrega..."></textarea>
          </div>

          <div className="form-grid">
            <div className="form-section">
              <label htmlFor="price">Precio</label>
              <input type="number" id="price" name="price" step="0.01" min="0.01" placeholder="0.00" required />
            </div>
            <div className="form-section">
              <label htmlFor="currency">Moneda</label>
              <select id="currency" name="currency">
                <option value="eur">EUR (€)</option>
                <option value="usd">USD ($)</option>
                <option value="mxn">MXN ($)</option>
                <option value="gbp">GBP (£)</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <label htmlFor="client_email">Email del cliente (opcional)</label>
            <input type="email" id="client_email" name="client_email" placeholder="cliente@ejemplo.com" />
            <span className="helper">Se usará para pre-rellenar el formulario de pago.</span>
          </div>

          <div className="form-section">
            <label>Método de entrega</label>
            <div className="radio-row">
              <label className={`radio-pill ${deliveryType === 'upload' ? 'active' : ''}`} style={{ background: deliveryType === 'upload' ? 'var(--accent)' : 'transparent', color: deliveryType === 'upload' ? '#000' : 'inherit' }}>
                <input type="radio" name="delivery_type" value="upload" checked={deliveryType === 'upload'} onChange={() => setDeliveryType('upload')} />
                Subir archivo
              </label>
              <label className={`radio-pill ${deliveryType === 'link' ? 'active' : ''}`} style={{ background: deliveryType === 'link' ? 'var(--accent)' : 'transparent', color: deliveryType === 'link' ? '#000' : 'inherit' }}>
                <input type="radio" name="delivery_type" value="link" checked={deliveryType === 'link'} onChange={() => setDeliveryType('link')} />
                Enlazar archivo
              </label>
            </div>
          </div>

          {deliveryType === 'upload' ? (
            <div className="form-section">
              <label htmlFor="file">Archivo final</label>
              <input type="file" id="file" name="file" required={deliveryType === 'upload'} />
              <span className="helper">Límite de 2GB. Se almacenará de forma segura.</span>
            </div>
          ) : (
            <div className="form-section">
              <label htmlFor="link_url">Enlace al archivo</label>
              <input type="url" id="link_url" name="link_url" placeholder="https://drive.google.com/..." required={deliveryType === 'link'} />
              <span className="helper">Drive, Dropbox, Figma, etc. El cliente lo verá tras pagar.</span>
            </div>
          )}

          <div className="form-actions">
            <button className="btn primary large full-width" type="submit" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Candado de Pago'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

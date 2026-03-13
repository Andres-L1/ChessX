import Link from 'next/link';

export default function Home() {
  return (
    <main className="container">
      <section className="hero">
        <div className="hero-content">
          <div className="pill">Seguridad & Confianza</div>
          <h1>Cobra tus trabajos antes de entregarlos.</h1>
          <p>Sube tu archivo o pega un link, ponle precio y genera un candado de pago. Tu cliente solo podrá acceder al trabajo final tras completar el pago por Stripe.</p>
          <div className="hero-actions">
            <Link className="btn primary large" href="/create">Empezar ahora</Link>
            <Link className="btn ghost large" href="#how-it-works">¿Cómo funciona?</Link>
          </div>
        </div>
        
        <div className="hero-visual">
          <div className="hero-card">
            <div className="badge">Vista previa del candado</div>
            <div className="price-display" style={{ textAlign: 'left', marginBottom: '16px' }}>
              <div className="price-value" style={{ fontSize: '32px' }}>45,00 €</div>
            </div>
            <h3>Entrega Final - Branding Q1</h3>
            <p style={{ fontSize: '14px' }}>Logotipos, manual de marca y assets finales en alta resolución.</p>
            <div className="status">Esperando pago...</div>
          </div>
        </div>
      </section>

      <div id="how-it-works" className="section" style={{ marginTop: '80px' }}>
        <h2 className="section-title">Tres pasos para cobrar mejor</h2>
        <div className="grid">
          <div className="card">
            <div className="success-icon" style={{ width: '40px', height: '40px', fontSize: '20px', margin: '0 0 16px' }}>1</div>
            <h3>Crea el candado</h3>
            <p>Sube el archivo final o enlaza a Drive/Figma. Define el precio y la moneda.</p>
          </div>
          <div className="card">
            <div className="success-icon" style={{ width: '40px', height: '40px', fontSize: '20px', margin: '0 0 16px' }}>2</div>
            <h3>Comparte el link</h3>
            <p>Envía la URL generada a tu cliente. Ellos verán los detalles del trabajo pero no el archivo.</p>
          </div>
          <div className="card">
            <div className="success-icon" style={{ width: '40px', height: '40px', fontSize: '20px', margin: '0 0 16px' }}>3</div>
            <h3>Recibe el dinero</h3>
            <p>Stripe procesa el pago y deposita los fondos. El archivo se libera automáticamente al cliente.</p>
          </div>
        </div>
      </div>

      <section className="section" style={{ marginTop: '80px' }}>
        <h2 className="section-title">Hecho para la era digital</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '32px' }}>Protege tu tiempo y tu talento con una experiencia de entrega profesional.</p>
        <div className="grid">
          <div className="card">
            <h3>Checkout de confianza</h3>
            <p>Tus clientes pagan con tarjeta de forma segura mediante Stripe Checkout.</p>
          </div>
          <div className="card">
            <h3>Sin cuentas extra</h3>
            <p>Tus clientes no necesitan registrarse para pagar y descargar su archivo.</p>
          </div>
          <div className="card">
            <h3>Control total</h3>
            <p>Gestiona tus entregas y asegúrate de que cada píxel entregado sea un píxel cobrado.</p>
          </div>
        </div>
      </section>

      <section className="section final-cta" style={{ marginTop: '100px' }}>
        <div className="card accent-card">
          <h2 style={{ fontSize: 'clamp(24px, 5vw, 36px)' }}>¿Listo para profesionalizar tus entregas?</h2>
          <p>Únete a cientos de freelancers que ya aseguran sus pagos con ChessX.</p>
          <div style={{ marginTop: '24px' }}>
            <Link className="btn primary" href="/create">Crear mi primer candado</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

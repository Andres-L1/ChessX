import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="logo">Chess<span>X</span></div>
            <p>El candado inteligente para freelancers.</p>
          </div>
          <div className="footer-copyright">
            &copy; {new Date().getFullYear()} ChessX. Todos los derechos reservados.
          </div>
        </div>
      </div>
    </footer>
  );
}

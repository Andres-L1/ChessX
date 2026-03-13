import Link from 'next/link';

export default function Nav() {
  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link className="logo" href="/">Chess<span>X</span></Link>   
        <div className="nav-actions">
          <Link className="btn ghost" href="/">Inicio</Link>
          <Link className="btn primary" href="/create">Crear Candado</Link>
        </div>
      </div>
    </header>
  );
}

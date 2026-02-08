import { Link } from 'react-router-dom';

export default function Overlay({ show, icon, title, text, extra, onAction }) {
  return (
    <div className={`overlay${show ? ' active' : ''}`}>
      <div className={`overlay-content${show ? ' animate-pop-in' : ''}`}>
        <div className="overlay-icon animate-bounce-in">{icon}</div>
        <div className="overlay-title">{title}</div>
        <div className="overlay-text">{text}</div>
        {extra && <div style={{ fontSize: '2rem', marginBottom: 20 }}>{extra}</div>}
        <div className="overlay-buttons">
          <button className="btn btn-green" onClick={onAction}>
            Nochmal spielen
          </button>
          <Link to="/" className="btn btn-blue" style={{ textDecoration: 'none', display: 'inline-block' }}>
            Zur Startseite
          </Link>
        </div>
      </div>
    </div>
  );
}

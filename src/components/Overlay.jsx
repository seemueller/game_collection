export default function Overlay({ show, icon, title, text, extra, onAction }) {
  return (
    <div className={`overlay${show ? ' active' : ''}`}>
      <div className="overlay-content">
        <div className="overlay-icon">{icon}</div>
        <div className="overlay-title">{title}</div>
        <div className="overlay-text">{text}</div>
        {extra && <div style={{ fontSize: '2rem', marginBottom: 20 }}>{extra}</div>}
        <button className="btn btn-green" onClick={onAction}>
          Nochmal spielen
        </button>
      </div>
    </div>
  );
}

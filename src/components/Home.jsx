import { Link } from 'react-router-dom';

const games = [
  { path: '/memory', icon: '\u{1F0CF}', title: 'Memory', desc: 'Finde die passenden Paare!' },
  { path: '/zahlenspiel', icon: '\u{1F522}', title: 'Zahlenspiel', desc: 'Rechne und sammle Sterne!' },
  { path: '/farbenquiz', icon: '\u{1F3A8}', title: 'Farben-Quiz', desc: 'Erkennst du alle Farben?' },
];

export default function Home() {
  return (
    <div className="home-container">
      <h1 className="home-title">{'\u{1F3AE}'} Spielesammlung</h1>
      <p className="home-subtitle">Waehle ein Spiel und hab Spass!</p>
      <div className="game-grid">
        {games.map((game) => (
          <Link key={game.path} to={game.path} className="game-card">
            <div className="game-card-icon">{game.icon}</div>
            <div className="game-card-title">{game.title}</div>
            <div className="game-card-desc">{game.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

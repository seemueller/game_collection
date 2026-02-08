import { Link } from 'react-router-dom';

const games = [
  { path: '/memory', icon: '\u{1F0CF}', title: 'Memory', desc: 'Finde die passenden Paare!', color: '#667eea' },
  { path: '/zahlenspiel', icon: '\u{1F522}', title: 'Zahlenspiel', desc: 'Rechne und sammle Sterne!', color: '#f5576c' },
  { path: '/farbenquiz', icon: '\u{1F3A8}', title: 'Farben-Quiz', desc: 'Erkennst du alle Farben?', color: '#43e97b' },
];

export default function Home() {
  return (
    <div className="home-container">
      <h1 className="home-title animate-bounce-in">{'\u{1F3AE}'} Spielesammlung</h1>
      <p className="home-subtitle animate-fade-in">Waehle ein Spiel und hab Spass!</p>
      <div className="game-grid">
        {games.map((game, i) => (
          <Link
            key={game.path}
            to={game.path}
            className="game-card animate-slide-up"
            style={{ animationDelay: `${i * 0.12}s` }}
          >
            <div className="game-card-icon">{game.icon}</div>
            <div className="game-card-title">{game.title}</div>
            <div className="game-card-desc">{game.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

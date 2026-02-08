import { useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import Overlay from './Overlay';
import { spawnConfetti } from '../confetti';

const ALL_EMOJIS = [
  '\u{1F436}', '\u{1F431}', '\u{1F438}', '\u{1F98A}', '\u{1F43B}', '\u{1F43C}',
  '\u{1F435}', '\u{1F981}', '\u{1F42E}', '\u{1F437}', '\u{1F430}', '\u{1F428}',
  '\u{1F42F}', '\u{1F984}', '\u{1F414}', '\u{1F427}', '\u{1F40D}', '\u{1F419}',
  '\u{1F422}', '\u{1F433}',
];

const DIFFICULTIES = [
  { pairs: 6, label: 'Leicht (6)', cols: 4 },
  { pairs: 8, label: 'Mittel (8)', cols: 4 },
  { pairs: 10, label: 'Schwer (10)', cols: 5 },
  { pairs: 12, label: 'Sehr schwer (12)', cols: 6 },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildCards(pairCount) {
  const selected = shuffle(ALL_EMOJIS).slice(0, pairCount);
  return shuffle([...selected, ...selected]).map((emoji, i) => ({
    id: i,
    emoji,
    flipped: false,
    matched: false,
  }));
}

export default function Memory() {
  const [pairCount, setPairCount] = useState(6);
  const [cols, setCols] = useState(4);
  const [cards, setCards] = useState(() => buildCards(6));
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [showWin, setShowWin] = useState(false);
  const flippedRef = useRef([]);
  const lockedRef = useRef(false);

  // 2-player state
  const [playerMode, setPlayerMode] = useState(1);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [scores, setScores] = useState([0, 0]);

  const startGame = useCallback((pairs, mode) => {
    const diff = DIFFICULTIES.find((d) => d.pairs === pairs);
    setPairCount(pairs);
    setCols(diff ? diff.cols : 4);
    setCards(buildCards(pairs));
    setMoves(0);
    setMatchedPairs(0);
    setShowWin(false);
    setCurrentPlayer(1);
    setScores([0, 0]);
    if (mode !== undefined) setPlayerMode(mode);
    flippedRef.current = [];
    lockedRef.current = false;
  }, []);

  const flipCard = useCallback((index) => {
    if (lockedRef.current) return;

    setCards((prev) => {
      const card = prev[index];
      if (card.flipped || card.matched) return prev;
      if (flippedRef.current.length >= 2) return prev;

      const next = prev.map((c, i) => (i === index ? { ...c, flipped: true } : c));
      flippedRef.current.push(index);

      if (flippedRef.current.length === 2) {
        lockedRef.current = true;
        setMoves((m) => m + 1);

        const [i1, i2] = flippedRef.current;
        if (next[i1].emoji === next[i2].emoji) {
          // Match found
          const matched = next.map((c, i) =>
            i === i1 || i === i2 ? { ...c, matched: true } : c
          );
          flippedRef.current = [];
          lockedRef.current = false;

          if (playerMode === 2) {
            setScores((s) => {
              const ns = [...s];
              ns[currentPlayer - 1] += 1;
              return ns;
            });
          }

          setMatchedPairs((mp) => {
            const newMp = mp + 1;
            if (newMp === pairCount) {
              setTimeout(() => {
                setShowWin(true);
                spawnConfetti();
              }, 400);
            }
            return newMp;
          });
          return matched;
        } else {
          // No match - flip back after delay
          setTimeout(() => {
            setCards((p) =>
              p.map((c, i) =>
                i === i1 || i === i2 ? { ...c, flipped: false } : c
              )
            );
            flippedRef.current = [];
            lockedRef.current = false;
            if (playerMode === 2) {
              setCurrentPlayer((cp) => (cp === 1 ? 2 : 1));
            }
          }, 800);
        }
      }

      return next;
    });
  }, [pairCount, playerMode, currentPlayer]);

  const winText = playerMode === 1
    ? `Du hast alle ${pairCount} Paare in ${moves} Zuegen gefunden!`
    : scores[0] === scores[1]
      ? `Unentschieden! Beide Spieler haben ${scores[0]} Paare gefunden. (${moves} Zuege)`
      : scores[0] > scores[1]
        ? `Spieler 1 gewinnt mit ${scores[0]} zu ${scores[1]} Paaren! (${moves} Zuege)`
        : `Spieler 2 gewinnt mit ${scores[1]} zu ${scores[0]} Paaren! (${moves} Zuege)`;

  const winIcon = playerMode === 1
    ? '\u{1F389}'
    : scores[0] === scores[1]
      ? '\u{1F91D}'
      : '\u{1F3C6}';

  return (
    <>
      <Link to="/" className="back-button" aria-label="Zurueck">{'\u2190'}</Link>

      <div className="game-container">
        <h1 className="game-title">{'\u{1F0CF}'} Memory</h1>
        <p className="game-info">Finde alle passenden Paare!</p>

        {/* Player mode selector */}
        <div className="mode-select">
          <button
            className={`btn btn-mode${playerMode === 1 ? ' active' : ''}`}
            onClick={() => startGame(pairCount, 1)}
          >
            {'\u{1F464}'} 1 Spieler
          </button>
          <button
            className={`btn btn-mode${playerMode === 2 ? ' active' : ''}`}
            onClick={() => startGame(pairCount, 2)}
          >
            {'\u{1F465}'} 2 Spieler
          </button>
        </div>

        {/* Stats */}
        <div className="stats-bar">
          {playerMode === 1 ? (
            <>
              <div className="stat">Zuege: {moves}</div>
              <div className="stat">Paare: {matchedPairs} / {pairCount}</div>
            </>
          ) : (
            <>
              <div className={`stat stat-player${currentPlayer === 1 ? ' stat-active' : ''}`}>
                {'\u{1F464}'} Spieler 1: {scores[0]}
              </div>
              <div className={`stat stat-player${currentPlayer === 2 ? ' stat-active' : ''}`}>
                {'\u{1F464}'} Spieler 2: {scores[1]}
              </div>
              <div className="stat">Zuege: {moves}</div>
            </>
          )}
        </div>

        {/* Difficulty selector */}
        <div className="difficulty-select">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.pairs}
              className={`btn btn-blue${pairCount === d.pairs ? ' active' : ''}`}
              onClick={() => startGame(d.pairs, playerMode)}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Turn indicator for 2-player mode */}
        {playerMode === 2 && (
          <div className="turn-indicator">
            Spieler {currentPlayer} ist dran
          </div>
        )}

        <div className="game-board memory-board">
          <div className="memory-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {cards.map((card, i) => (
              <div
                key={card.id}
                className={`memory-card${card.flipped || card.matched ? ' flipped' : ''}${card.matched ? ' matched' : ''}`}
                onClick={() => flipCard(i)}
              >
                <div className="card-front">?</div>
                <div className="card-back">{card.emoji}</div>
              </div>
            ))}
          </div>
        </div>

        <button className="btn btn-green" style={{ marginTop: 20 }} onClick={() => startGame(pairCount, playerMode)}>
          Nochmal spielen
        </button>
      </div>

      <Overlay
        show={showWin}
        icon={winIcon}
        title="Super gemacht!"
        text={winText}
        onAction={() => { setShowWin(false); startGame(pairCount, playerMode); }}
      />
    </>
  );
}

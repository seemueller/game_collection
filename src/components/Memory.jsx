import { useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import Overlay from './Overlay';
import { spawnConfetti } from '../confetti';

const ALL_EMOJIS = [
  '\u{1F436}', '\u{1F431}', '\u{1F438}', '\u{1F98A}', '\u{1F43B}', '\u{1F43C}',
  '\u{1F435}', '\u{1F981}', '\u{1F42E}', '\u{1F437}', '\u{1F430}', '\u{1F428}',
  '\u{1F42F}', '\u{1F984}', '\u{1F414}', '\u{1F427}',
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
  const [cards, setCards] = useState(() => buildCards(6));
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [showWin, setShowWin] = useState(false);
  const flippedRef = useRef([]);
  const lockedRef = useRef(false);

  const startGame = useCallback((pairs) => {
    setPairCount(pairs);
    setCards(buildCards(pairs));
    setMoves(0);
    setMatchedPairs(0);
    setShowWin(false);
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
          // Match
          const matched = next.map((c, i) =>
            i === i1 || i === i2 ? { ...c, matched: true } : c
          );
          flippedRef.current = [];
          lockedRef.current = false;

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
          }, 800);
        }
      }

      return next;
    });
  }, [pairCount]);

  return (
    <>
      <Link to="/" className="back-button" aria-label="Zurueck">{'\u2190'}</Link>

      <div className="game-container">
        <h1 className="game-title">{'\u{1F0CF}'} Memory</h1>
        <p className="game-info">Finde alle passenden Paare!</p>

        <div className="stats-bar">
          <div className="stat">Zuege: {moves}</div>
          <div className="stat">Paare: {matchedPairs} / {pairCount}</div>
        </div>

        <div className="difficulty-select">
          {[6, 8].map((p) => (
            <button
              key={p}
              className={`btn btn-blue${pairCount === p ? ' active' : ''}`}
              onClick={() => startGame(p)}
            >
              {p === 6 ? 'Leicht (6)' : 'Mittel (8)'}
            </button>
          ))}
        </div>

        <div className="game-board">
          <div className="memory-grid">
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

        <button className="btn btn-green" style={{ marginTop: 20 }} onClick={() => startGame(pairCount)}>
          Nochmal spielen
        </button>
      </div>

      <Overlay
        show={showWin}
        icon={'\u{1F389}'}
        title="Super gemacht!"
        text={`Du hast alle ${pairCount} Paare in ${moves} Zuegen gefunden!`}
        onAction={() => { setShowWin(false); startGame(pairCount); }}
      />
    </>
  );
}

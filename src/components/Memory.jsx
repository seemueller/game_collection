import { useState, useCallback, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Overlay from './Overlay';
import { spawnConfetti } from '../confetti';
import { playFlip, playMatch, playNoMatch, playWin, playStreak } from '../sounds';

const ALL_EMOJIS = [
  '\u{1F436}', '\u{1F431}', '\u{1F438}', '\u{1F98A}', '\u{1F43B}', '\u{1F43C}',
  '\u{1F435}', '\u{1F981}', '\u{1F42E}', '\u{1F437}', '\u{1F430}', '\u{1F428}',
  '\u{1F42F}', '\u{1F984}', '\u{1F414}', '\u{1F427}',
];

const MATCH_MESSAGES = [
  'Super!', 'Toll!', 'Klasse!', 'Genau!', 'Treffer!',
  'Wow!', 'Spitze!', 'Bravo!', 'Mega!', 'Jawoll!',
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

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function Memory() {
  const [pairCount, setPairCount] = useState(6);
  const [cards, setCards] = useState(() => buildCards(6));
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [showWin, setShowWin] = useState(false);
  const [streak, setStreak] = useState(0);
  const [matchMsg, setMatchMsg] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const flippedRef = useRef([]);
  const lockedRef = useRef(false);
  const timerRef = useRef(null);

  // Timer
  useEffect(() => {
    if (gameActive && !showWin) {
      timerRef.current = setInterval(() => setElapsed((t) => t + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [gameActive, showWin]);

  const startGame = useCallback((pairs) => {
    setPairCount(pairs);
    setCards(buildCards(pairs));
    setMoves(0);
    setMatchedPairs(0);
    setShowWin(false);
    setStreak(0);
    setMatchMsg(null);
    setElapsed(0);
    setGameActive(true);
    flippedRef.current = [];
    lockedRef.current = false;
  }, []);

  const flipCard = useCallback((index) => {
    if (lockedRef.current) return;

    setCards((prev) => {
      const card = prev[index];
      if (card.flipped || card.matched) return prev;
      if (flippedRef.current.length >= 2) return prev;

      playFlip();
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

          setStreak((s) => {
            const newStreak = s + 1;
            if (newStreak >= 3) playStreak(newStreak);
            else playMatch();
            return newStreak;
          });

          setMatchMsg(MATCH_MESSAGES[Math.floor(Math.random() * MATCH_MESSAGES.length)]);
          setTimeout(() => setMatchMsg(null), 900);

          setMatchedPairs((mp) => {
            const newMp = mp + 1;
            if (newMp === pairCount) {
              setGameActive(false);
              setTimeout(() => {
                playWin();
                setShowWin(true);
                spawnConfetti();
              }, 400);
            }
            return newMp;
          });
          return matched;
        } else {
          // No match
          playNoMatch();
          setStreak(0);

          setTimeout(() => {
            setCards((p) =>
              p.map((c, i) =>
                i === i1 || i === i2 ? { ...c, flipped: false } : c
              )
            );
            flippedRef.current = [];
            lockedRef.current = false;
          }, 900);
        }
      }

      return next;
    });
  }, [pairCount]);

  const starRating = moves <= pairCount + 2 ? 3 : moves <= pairCount * 2 ? 2 : 1;
  const winStars = '\u2B50'.repeat(starRating);

  return (
    <>
      <Link to="/" className="back-button" aria-label="Zurueck">{'\u2190'}</Link>

      <div className="game-container">
        <h1 className="game-title">{'\u{1F0CF}'} Memory</h1>
        <p className="game-info">Finde alle passenden Paare!</p>

        <div className="stats-bar">
          <div className="stat">{'\u23F1'} {formatTime(elapsed)}</div>
          <div className="stat">Zuege: {moves}</div>
          <div className="stat">Paare: {matchedPairs} / {pairCount}</div>
        </div>

        {streak >= 3 && (
          <div className="streak-banner animate-bounce-in">
            {'\u{1F525}'} {streak}x Serie!
          </div>
        )}

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

        <div className="game-board" style={{ position: 'relative' }}>
          {matchMsg && (
            <div className="floating-msg animate-float-up">{matchMsg}</div>
          )}
          <div className="memory-grid">
            {cards.map((card, i) => (
              <div
                key={card.id}
                className={
                  `memory-card` +
                  `${card.flipped || card.matched ? ' flipped' : ''}` +
                  `${card.matched ? ' matched' : ''}`
                }
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
        text={`Alle ${pairCount} Paare in ${moves} Zuegen und ${formatTime(elapsed)}!`}
        extra={winStars}
        onAction={() => { setShowWin(false); startGame(pairCount); }}
      />
    </>
  );
}

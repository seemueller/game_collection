import { useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import Overlay from './Overlay';
import { spawnConfetti } from '../confetti';
import { playCorrect, playWrong, playWin, playStreak } from '../sounds';

const COLORS = [
  { name: 'Rot', hex: '#e53e3e', btn: '#e53e3e' },
  { name: 'Blau', hex: '#3182ce', btn: '#3182ce' },
  { name: 'Gruen', hex: '#38a169', btn: '#38a169' },
  { name: 'Gelb', hex: '#ecc94b', btn: '#d69e2e', light: true },
  { name: 'Orange', hex: '#ed8936', btn: '#dd6b20' },
  { name: 'Lila', hex: '#805ad5', btn: '#805ad5' },
  { name: 'Rosa', hex: '#ed64a6', btn: '#d53f8c' },
  { name: 'Braun', hex: '#8B4513', btn: '#8B4513' },
  { name: 'Schwarz', hex: '#1a202c', btn: '#2d3748' },
  { name: 'Weiss', hex: '#f7f7f7', btn: '#a0aec0', light: true },
];

const TOTAL = 10;

const PRAISE = [
  'Super!', 'Genau!', 'Richtig!', 'Klasse!', 'Toll!',
  'Bravo!', 'Spitze!', 'Perfekt!',
];
const ENCOURAGE = [
  'Nicht schlimm!', 'Fast!', 'Gleich hast du es!', 'Knapp daneben!',
  'Weiter so!',
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function makeQuestion() {
  const correct = COLORS[Math.floor(Math.random() * COLORS.length)];
  const wrong = shuffle(COLORS.filter((c) => c.name !== correct.name)).slice(0, 3);
  return { correct, options: shuffle([correct, ...wrong]) };
}

export default function FarbenQuiz() {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [question, setQuestion] = useState(() => makeQuestion());
  const [feedback, setFeedback] = useState(null);
  const [feedbackType, setFeedbackType] = useState(null);
  const [chosen, setChosen] = useState(null);
  const [results, setResults] = useState([]);
  const [showWin, setShowWin] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [colorPulse, setColorPulse] = useState(true);
  const displayRef = useRef(null);

  const startGame = useCallback(() => {
    setRound(0);
    setScore(0);
    setQuestion(makeQuestion());
    setFeedback(null);
    setFeedbackType(null);
    setChosen(null);
    setResults([]);
    setShowWin(false);
    setStreak(0);
    setColorPulse(true);
  }, []);

  const handleAnswer = useCallback((color) => {
    if (chosen !== null) return;
    setChosen(color.name);
    setColorPulse(false);

    const correct = color.name === question.correct.name;
    const newScore = correct ? score + 1 : score;
    const newRound = round + 1;
    const newStreak = correct ? streak + 1 : 0;
    const newResults = [...results, correct ? 'correct' : 'wrong'];

    setStreak(newStreak);
    setResults(newResults);

    if (correct) {
      setScore(newScore);
      const msg = newStreak >= 3
        ? `\u{1F525} ${newStreak}x Serie! ${pick(PRAISE)}`
        : `\u2705 ${pick(PRAISE)}`;
      setFeedback(msg);
      setFeedbackType('correct');
      if (newStreak >= 3) playStreak(newStreak);
      else playCorrect();
    } else {
      setFeedback(`\u274C Das war ${question.correct.name}!`);
      setFeedbackType('wrong');
      playWrong();
    }

    setTimeout(() => {
      if (newRound >= TOTAL) {
        setFinalScore(newScore);
        setShowWin(true);
        if (newScore >= 5) { playWin(); spawnConfetti(); }
      } else {
        setRound(newRound);
        setQuestion(makeQuestion());
        setFeedback(null);
        setFeedbackType(null);
        setChosen(null);
        setColorPulse(true);
      }
    }, 1200);
  }, [chosen, question, score, round, results, streak]);

  const winIcon = finalScore >= 9 ? '\u{1F3C6}' : finalScore >= 6 ? '\u{1F3A8}' : '\u{1F4AA}';
  const winTitle = finalScore >= 9 ? 'Farben-Profi!' : finalScore >= 6 ? 'Toll gemacht!' : 'Weiter ueben!';

  return (
    <>
      <Link to="/" className="back-button" aria-label="Zurueck">{'\u2190'}</Link>

      <div className="game-container">
        <h1 className="game-title">{'\u{1F3A8}'} Farben-Quiz</h1>
        <p className="game-info">Welche Farbe siehst du?</p>

        <div className="stats-bar">
          <div className="stat">Richtig: {score} / {TOTAL}</div>
          {streak >= 3 && <div className="stat animate-bounce-in">{'\u{1F525}'} {streak}x Serie!</div>}
        </div>

        <div className="game-board">
          <div className="round-counter">
            {Array.from({ length: TOTAL }, (_, i) => {
              let cls = 'round-dot';
              if (i < results.length) cls += ` ${results[i]}`;
              else if (i === round) cls += ' current';
              return <div key={i} className={cls} />;
            })}
          </div>

          <div
            ref={displayRef}
            className={`color-display${colorPulse ? ' animate-pulse' : ''}${feedbackType === 'correct' ? ' animate-bounce-in' : ''}`}
            style={{
              backgroundColor: question.correct.hex,
              border: question.correct.name === 'Weiss' ? '6px solid #ccc' : '6px solid white',
            }}
          />

          <div className="question-text">Welche Farbe ist das?</div>

          <div className="color-answers">
            {question.options.map((color) => {
              let cls = 'color-btn';
              if (chosen !== null) {
                if (color.name === question.correct.name) cls += ' correct';
                else if (color.name === chosen) cls += ' wrong';
              }
              return (
                <button
                  key={color.name}
                  className={cls}
                  style={{
                    backgroundColor: color.btn,
                    color: color.light ? '#333' : 'white',
                    textShadow: color.light ? 'none' : '1px 1px 3px rgba(0,0,0,0.3)',
                  }}
                  disabled={chosen !== null}
                  onClick={() => handleAnswer(color)}
                >
                  {color.name}
                </button>
              );
            })}
          </div>

          <div className={`feedback ${feedbackType === 'correct' ? 'animate-bounce-in' : feedbackType === 'wrong' ? 'animate-shake' : ''}`}>
            {feedback}
          </div>
        </div>

        <button className="btn btn-green" style={{ marginTop: 20 }} onClick={startGame}>
          Neues Spiel
        </button>
      </div>

      <Overlay
        show={showWin}
        icon={winIcon}
        title={winTitle}
        text={`Du hast ${finalScore} von ${TOTAL} Farben richtig erkannt!`}
        onAction={() => { setShowWin(false); startGame(); }}
      />
    </>
  );
}

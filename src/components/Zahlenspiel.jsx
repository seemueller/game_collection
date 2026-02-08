import { useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import Overlay from './Overlay';
import { spawnConfetti } from '../confetti';
import { playCorrect, playWrong, playWin, playStreak } from '../sounds';

const TOTAL = 10;
const OBJECTS = ['\u{1F34E}', '\u{1F31F}', '\u{1F388}', '\u{1F36A}', '\u{1F41F}', '\u{1F338}', '\u{1F36C}', '\u{1F3AF}'];

const PRAISE = [
  'Super!', 'Toll!', 'Genau!', 'Klasse!', 'Richtig!',
  'Bravo!', 'Spitze!', 'Mega!', 'Perfekt!', 'Jawoll!',
];
const ENCOURAGE = [
  'Nicht schlimm!', 'Fast!', 'Versuch es nochmal!', 'Gleich hast du es!',
  'Knapp daneben!', 'Weiter so!',
];

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeTask() {
  const isAdd = Math.random() > 0.3;
  let a, b, answer;
  if (isAdd) {
    a = rand(1, 8);
    b = rand(1, 10 - a);
    answer = a + b;
  } else {
    answer = rand(1, 8);
    b = rand(1, 10 - answer);
    a = answer + b;
  }

  const emoji = OBJECTS[rand(0, OBJECTS.length - 1)];
  const visual = isAdd
    ? emoji.repeat(a) + ' + ' + emoji.repeat(b)
    : emoji.repeat(a);

  const options = new Set([answer]);
  while (options.size < 4) {
    const w = answer + rand(-3, 3);
    if (w >= 0 && w <= 20 && w !== answer) options.add(w);
  }

  return {
    text: isAdd ? `${a} + ${b} = ?` : `${a} \u2212 ${b} = ?`,
    answer,
    visual,
    options: [...options].sort(() => Math.random() - 0.5),
  };
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function Zahlenspiel() {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [task, setTask] = useState(() => makeTask());
  const [feedback, setFeedback] = useState(null);
  const [feedbackType, setFeedbackType] = useState(null);
  const [chosen, setChosen] = useState(null);
  const [showWin, setShowWin] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [results, setResults] = useState([]);
  const boardRef = useRef(null);

  const startGame = useCallback(() => {
    setRound(0);
    setScore(0);
    setTask(makeTask());
    setFeedback(null);
    setFeedbackType(null);
    setChosen(null);
    setShowWin(false);
    setStreak(0);
    setAnimate(false);
    setResults([]);
  }, []);

  const handleAnswer = useCallback((value) => {
    if (chosen !== null) return;
    setChosen(value);

    const correct = value === task.answer;
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
      setFeedback(`\u274C ${pick(ENCOURAGE)}`);
      setFeedbackType('wrong');
      playWrong();
    }

    // Slide-out/in animation
    setTimeout(() => {
      if (newRound >= TOTAL) {
        setFinalScore(newScore);
        setShowWin(true);
        if (newScore >= 5) { playWin(); spawnConfetti(); }
      } else {
        setAnimate(true);
        setTimeout(() => {
          setRound(newRound);
          setTask(makeTask());
          setFeedback(null);
          setFeedbackType(null);
          setChosen(null);
          setAnimate(false);
        }, 300);
      }
    }, 1000);
  }, [chosen, task, score, round, streak, results]);

  const winIcon = finalScore >= 8 ? '\u{1F3C6}' : finalScore >= 5 ? '\u{1F31F}' : '\u{1F4AA}';
  const winTitle = finalScore >= 8 ? 'Rechen-Profi!' : finalScore >= 5 ? 'Toll gemacht!' : 'Weiter ueben!';

  return (
    <>
      <Link to="/" className="back-button" aria-label="Zurueck">{'\u2190'}</Link>

      <div className="game-container">
        <h1 className="game-title">{'\u{1F522}'} Zahlenspiel</h1>
        <p className="game-info">Loese die Aufgaben und sammle Sterne!</p>

        <div className="stats-bar">
          <div className="stat">Sterne: {score} {'\u2B50'}</div>
          <div className="stat">Aufgabe: {round + 1} / {TOTAL}</div>
        </div>

        <div className={`game-board${animate ? ' animate-slide-out' : ''}`} ref={boardRef}>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(round / TOTAL) * 100}%` }} />
          </div>

          <div className="round-counter" style={{ marginBottom: 10 }}>
            {Array.from({ length: TOTAL }, (_, i) => {
              let cls = 'round-dot';
              if (i < results.length) cls += ` ${results[i]}`;
              else if (i === round) cls += ' current';
              return <div key={i} className={cls} />;
            })}
          </div>

          <div className={`task-display${chosen === null ? ' animate-slide-in' : ''}`}>
            {task.text}
          </div>
          <div className="visual-help">{task.visual}</div>

          <div className="answers-grid">
            {task.options.map((opt) => {
              let cls = 'answer-btn';
              if (chosen !== null) {
                if (opt === task.answer) cls += ' correct';
                else if (opt === chosen) cls += ' wrong animate-shake';
              }
              return (
                <button
                  key={opt}
                  className={cls}
                  disabled={chosen !== null}
                  onClick={() => handleAnswer(opt)}
                >
                  {opt}
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
        text={`Du hast ${finalScore} von ${TOTAL} Aufgaben richtig geloest!`}
        extra={finalScore > 0 ? '\u2B50'.repeat(finalScore) : '\u{1F4AA} Beim naechsten Mal klappt es besser!'}
        onAction={() => { setShowWin(false); startGame(); }}
      />
    </>
  );
}

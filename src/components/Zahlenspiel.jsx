import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Overlay from './Overlay';
import { spawnConfetti } from '../confetti';

const TOTAL = 10;
const OBJECTS = ['\u{1F34E}', '\u{1F31F}', '\u{1F388}', '\u{1F36A}', '\u{1F41F}', '\u{1F338}', '\u{1F36C}', '\u{1F3AF}'];

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

export default function Zahlenspiel() {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [task, setTask] = useState(() => makeTask());
  const [feedback, setFeedback] = useState(null);
  const [chosen, setChosen] = useState(null);
  const [showWin, setShowWin] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const startGame = useCallback(() => {
    setRound(0);
    setScore(0);
    setTask(makeTask());
    setFeedback(null);
    setChosen(null);
    setShowWin(false);
  }, []);

  const handleAnswer = useCallback((value) => {
    if (chosen !== null) return;
    setChosen(value);

    const correct = value === task.answer;
    const newScore = correct ? score + 1 : score;
    const newRound = round + 1;

    if (correct) {
      setScore(newScore);
      setFeedback('\u2705 Richtig!');
    } else {
      setFeedback('\u274C Nicht ganz!');
    }

    setTimeout(() => {
      if (newRound >= TOTAL) {
        setFinalScore(newScore);
        setShowWin(true);
        if (newScore >= 5) spawnConfetti();
      } else {
        setRound(newRound);
        setTask(makeTask());
        setFeedback(null);
        setChosen(null);
      }
    }, 1200);
  }, [chosen, task, score, round]);

  const winIcon = finalScore >= 8 ? '\u{1F3C6}' : finalScore >= 5 ? '\u{1F31F}' : '\u{1F4AA}';

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

        <div className="game-board">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(round / TOTAL) * 100}%` }} />
          </div>

          <div className="task-display">{task.text}</div>
          <div className="visual-help">{task.visual}</div>

          <div className="answers-grid">
            {task.options.map((opt) => {
              let cls = 'answer-btn';
              if (chosen !== null) {
                if (opt === task.answer) cls += ' correct';
                else if (opt === chosen) cls += ' wrong';
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

          <div className="feedback">{feedback}</div>
        </div>

        <button className="btn btn-green" style={{ marginTop: 20 }} onClick={startGame}>
          Neues Spiel
        </button>
      </div>

      <Overlay
        show={showWin}
        icon={winIcon}
        title="Toll gemacht!"
        text={`Du hast ${finalScore} von ${TOTAL} Aufgaben richtig geloest!`}
        extra={finalScore > 0 ? '\u2B50'.repeat(finalScore) : '\u{1F4AA} Beim naechsten Mal klappt es besser!'}
        onAction={() => { setShowWin(false); startGame(); }}
      />
    </>
  );
}

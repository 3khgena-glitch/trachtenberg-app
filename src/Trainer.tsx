import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import { RULE_MAP, type RuleType } from './data/rules';
import { ArrowLeft, Lightbulb, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { db } from './db';

const ADAPTIVE_STREAK_UP = 3;
const ADAPTIVE_STREAK_DOWN = 2;
const MIN_DIGIT_COUNT = 2;
const MAX_DIGIT_COUNT = 5;
const MAX_SQUARE_DIGITS = 3;

export default function Trainer() {
  const navigate = useNavigate();
  const {
    inputDirection,
    activeRule,
    isMixedMode,
    isSprintMode,
    sprintDuration,
    isHighlightEnabled,
    isAdaptiveMode,
    isDailyChallenge,
    isSoundEnabled,
    isVibrationEnabled,
    unlockedRules,
    language,
  } = useStore();

  const isUk = language === 'uk';

  const [currentRuleId, setCurrentRuleId] = useState<RuleType>(activeRule);
  const [targetNumber, setTargetNumber] = useState(0);
  const [targetNumber2, setTargetNumber2] = useState(0);
  const [inputReversed, setInputReversed] = useState('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'error'>('idle');
  const [showTutorial, setShowTutorial] = useState(false);

  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionAttempts, setSessionAttempts] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);

  const [timeLeft, setTimeLeft] = useState(isDailyChallenge ? 60 : sprintDuration);
  const [isSprintFinished, setIsSprintFinished] = useState(false);

  const [correctStreak, setCorrectStreak] = useState(0);
  const [errorStreak, setErrorStreak] = useState(0);
  const [adaptiveToast, setAdaptiveToast] = useState<'up' | 'down' | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const nextTimerRef = useRef<number | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const currentRule = RULE_MAP[currentRuleId];

  let correctAnswer = '';
  if (currentRuleId === 'add') correctAnswer = (targetNumber + targetNumber2).toString();
  else if (currentRuleId === 'square') correctAnswer = Math.pow(targetNumber, 2).toString();
  else correctAnswer = (targetNumber * currentRule.multiplier).toString();

  const targetStr = '0' + targetNumber.toString();
  const currentStep = inputReversed.length;

  const playTone = useCallback(
    (frequency: number, type: OscillatorType, duration: number) => {
      if (!isSoundEnabled) return;
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      try {
        let ctx = audioCtxRef.current;
        if (!ctx || ctx.state === 'closed') {
          ctx = new AudioCtx();
          audioCtxRef.current = ctx;
        }
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch {
        // Ignore audio errors on restricted browsers
      }
    },
    [isSoundEnabled]
  );

  const triggerFeedback = useCallback(
    (type: 'correct' | 'error' | 'click') => {
      if (type === 'click') {
        if (isSoundEnabled) playTone(800, 'sine', 0.05);
        if (isVibrationEnabled && navigator.vibrate) navigator.vibrate(10);
      } else if (type === 'correct') {
        if (isSoundEnabled) playTone(600, 'triangle', 0.15);
        if (isVibrationEnabled && navigator.vibrate) navigator.vibrate(50);
      } else if (type === 'error') {
        if (isSoundEnabled) playTone(150, 'sawtooth', 0.3);
        if (isVibrationEnabled && navigator.vibrate) navigator.vibrate([100, 50, 100]);
      }
    },
    [isSoundEnabled, isVibrationEnabled, playTone]
  );

  useEffect(() => {
    return () => {
      if (nextTimerRef.current) window.clearTimeout(nextTimerRef.current);
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    if (isSprintMode && timeLeft > 0 && !isSprintFinished) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (isSprintMode && timeLeft === 0 && !isSprintFinished) {
      setIsSprintFinished(true);
      triggerFeedback('error');
      if (isDailyChallenge) {
        localStorage.setItem('lastDailyChallenge', new Date().toISOString().split('T')[0]);
      }
    }
  }, [isSprintMode, timeLeft, isSprintFinished, isDailyChallenge, triggerFeedback]);

  const generateProblem = useCallback(() => {
    if (nextTimerRef.current) {
      window.clearTimeout(nextTimerRef.current);
      nextTimerRef.current = null;
    }

    let nextRuleId = activeRule;
    if (isMixedMode || isSprintMode) {
      const availableRules: RuleType[] = unlockedRules.length > 0 ? unlockedRules : ['add'];
      nextRuleId = availableRules[Math.floor(Math.random() * availableRules.length)];
    }
    setCurrentRuleId(nextRuleId);

    let currentDigitCount = useStore.getState().digitCount;
    if (nextRuleId === 'square') {
      currentDigitCount = Math.min(currentDigitCount, MAX_SQUARE_DIGITS);
    }

    const min = Math.pow(10, currentDigitCount - 1);
    const max = Math.pow(10, currentDigitCount) - 1;

    setTargetNumber(Math.floor(Math.random() * (max - min + 1)) + min);
    if (nextRuleId === 'add') {
      setTargetNumber2(Math.floor(Math.random() * (max - min + 1)) + min);
    }

    setInputReversed('');
    setStatus('idle');
    setStartTime(Date.now());
  }, [activeRule, isMixedMode, isSprintMode, unlockedRules]);

  useEffect(() => {
    generateProblem();
  }, [generateProblem]);

  const showToast = (direction: 'up' | 'down') => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setAdaptiveToast(direction);
    toastTimerRef.current = window.setTimeout(() => setAdaptiveToast(null), 2000);
  };

  const handleKeyPress = (digit: string) => {
    if (status === 'correct' || isSprintFinished) return;
    if (inputReversed.length >= correctAnswer.length) return;

    triggerFeedback('click');

    const newVal = inputReversed + digit;
    setInputReversed(newVal);

    if (newVal.length === correctAnswer.length) {
      const currentInput =
        inputDirection === 'rtl' ? newVal.split('').reverse().join('') : newVal;

      setSessionAttempts((prev) => prev + 1);

      if (currentInput === correctAnswer) {
        const elapsed = Date.now() - startTime;
        setStatus('correct');
        setSessionCorrect((prev) => prev + 1);
        triggerFeedback('correct');

        if (isAdaptiveMode) {
          const newStreak = correctStreak + 1;
          setCorrectStreak(newStreak);
          setErrorStreak(0);
          if (
            newStreak >= ADAPTIVE_STREAK_UP &&
            useStore.getState().digitCount < MAX_DIGIT_COUNT
          ) {
            useStore.getState().setDigitCount(useStore.getState().digitCount + 1);
            setCorrectStreak(0);
            showToast('up');
          }
        }

        db.stats.add({
          rule: currentRuleId,
          date: new Date().toISOString(),
          correctAnswers: 1,
          totalAttempts: 1,
          totalTime: elapsed,
        });

        nextTimerRef.current = window.setTimeout(
          generateProblem,
          isSprintMode ? 500 : 1000
        );
      } else {
        setStatus('error');
        triggerFeedback('error');

        if (isAdaptiveMode) {
          const newErrStreak = errorStreak + 1;
          setErrorStreak(newErrStreak);
          setCorrectStreak(0);
          if (
            newErrStreak >= ADAPTIVE_STREAK_DOWN &&
            useStore.getState().digitCount > MIN_DIGIT_COUNT
          ) {
            useStore.getState().setDigitCount(useStore.getState().digitCount - 1);
            setErrorStreak(0);
            showToast('down');
          }
        }

        db.stats.add({
          rule: currentRuleId,
          date: new Date().toISOString(),
          correctAnswers: 0,
          totalAttempts: 1,
          totalTime: 0,
        });
      }
    } else {
      setStatus('idle');
    }
  };

  const handleBackspace = () => {
    if (isSprintFinished || status === 'correct') return;
    triggerFeedback('click');
    setInputReversed((prev) => prev.slice(0, -1));
    setStatus('idle');
  };

  const handleGoBack = () => {
    navigate('/');
  };

  const displayValue =
    inputDirection === 'rtl' ? inputReversed.split('').reverse().join('') : inputReversed;

  if (isSprintFinished) {
    return (
      <div className="flex flex-col h-screen bg-gray-950 text-white p-6 justify-center items-center">
        <h2 className="text-4xl font-bold text-red-500 mb-2">
          {isUk ? 'Час вичерпано!' : 'Time is up!'}
        </h2>
        <p className="text-gray-400 mb-8 uppercase tracking-widest text-sm">
          {isDailyChallenge
            ? isUk
              ? 'Випробування завершено'
              : 'Challenge finished'
            : isUk
            ? 'Спринт завершено'
            : 'Sprint finished'}
        </p>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-xs mb-8 flex flex-col gap-4 shadow-lg text-center">
          <div>
            <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">
              {isUk ? 'Вирішено' : 'Solved'}
            </div>
            <div className="text-4xl font-bold text-green-400">{sessionCorrect}</div>
          </div>
          <div className="h-px w-full bg-gray-800"></div>
          <div>
            <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">
              {isUk ? 'Точність' : 'Accuracy'}
            </div>
            <div className="text-2xl font-bold text-blue-400">
              {sessionAttempts > 0 ? Math.round((sessionCorrect / sessionAttempts) * 100) : 0}%
            </div>
          </div>
        </div>
        <button
          onClick={handleGoBack}
          className="bg-blue-600 active:bg-blue-700 w-full max-w-xs text-white p-4 rounded-xl text-lg font-bold transition-colors shadow-lg"
        >
          {isUk ? 'В меню' : 'Main Menu'}
        </button>
      </div>
    );
  }

  const renderExpression = () => {
    const len = targetNumber.toString().length;
    const textSize = len >= 5 ? 'text-4xl' : len === 4 ? 'text-5xl' : 'text-6xl';
    const gapSize = len >= 5 ? 'gap-1' : 'gap-3';

    if (currentRuleId === 'add') {
      return (
        <div className={`flex ${textSize} font-bold tracking-widest text-white items-center ${gapSize}`}>
          <span>{targetNumber}</span>
          <span className="text-gray-500 text-4xl">+</span>
          <span>{targetNumber2}</span>
        </div>
      );
    }
    if (currentRuleId === 'square') {
      return (
        <div className={`flex ${textSize} font-bold tracking-widest text-white items-start gap-1`}>
          <span>{targetNumber}</span>
          <span className="text-gray-500 text-3xl mt-[-5px]">²</span>
        </div>
      );
    }
    return (
      <div className={`flex ${textSize} font-bold tracking-widest text-white items-center ${gapSize}`}>
        {isHighlightEnabled ? (
          <div className="flex">
            {targetStr.split('').map((char, index) => {
              const isDone = status === 'correct';
              const isActive = !isDone && index === targetStr.length - 1 - currentStep;
              const isNeighbor = !isDone && index === targetStr.length - currentStep;
              return (
                <span
                  key={index}
                  className={`px-1 rounded-lg transition-colors ${
                    isActive
                      ? 'text-blue-400 bg-blue-900/40 border-b-4 border-blue-400'
                      : isNeighbor
                      ? 'text-green-400 bg-green-900/40 border-b-4 border-green-400'
                      : index === 0 && currentStep < targetStr.length - 1
                      ? 'text-gray-700'
                      : 'text-white border-b-4 border-transparent'
                  }`}
                >
                  {char}
                </span>
              );
            })}
          </div>
        ) : (
          <span>{targetNumber}</span>
        )}
        <span className="text-gray-500 text-4xl">×</span>
        <span className={isMixedMode || isSprintMode ? 'text-yellow-400' : ''}>
          {currentRule.multiplier}
        </span>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white p-4 justify-between max-w-md mx-auto relative">
      {adaptiveToast && (
        <div
          className={`absolute top-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg z-50 animate-bounce ${
            adaptiveToast === 'up' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}
        >
          {adaptiveToast === 'up' ? (
            <>
              <TrendingUp size={18} /> {isUk ? 'Ускладнюємо!' : 'Level up!'}
            </>
          ) : (
            <>
              <TrendingDown size={18} /> {isUk ? 'Знижуємо складність' : 'Level down'}
            </>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center text-gray-400 text-sm">
          <button
            onClick={handleGoBack}
            aria-label={isUk ? 'Повернутися в меню' : 'Back to menu'}
            className="p-2 -ml-2 mr-2 text-gray-400 active:text-white transition-colors"
          >
            <ArrowLeft size={28} />
          </button>
          <span className="text-lg font-medium text-blue-400">
            {isDailyChallenge
              ? isUk
                ? '🔥 Щоденне'
                : '🔥 Daily'
              : isSprintMode
              ? isUk
                ? '⏱ Спринт'
                : '⏱ Sprint'
              : isMixedMode
              ? isUk
                ? '🔀 Змішаний'
                : '🔀 Mixed'
              : isUk
              ? currentRule.labelUk
              : currentRule.labelEn}
          </span>
        </div>
        {isSprintMode ? (
          <div
            className={`flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-full border ${
              timeLeft <= 10
                ? 'bg-red-900/30 text-red-400 border-red-800'
                : 'bg-gray-900 text-yellow-400 border-gray-800'
            }`}
          >
            <Clock size={14} /> {timeLeft}
            {isUk ? 'с' : 's'}
          </div>
        ) : (
          <div className="text-sm font-semibold text-gray-500 bg-gray-900 px-3 py-1 rounded-full border border-gray-800">
            <span className="text-green-400">{sessionCorrect}</span> / {sessionAttempts}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center justify-center flex-grow relative">
        <div className="flex flex-col items-center mb-10">{renderExpression()}</div>
        <div
          className={`text-5xl font-mono h-16 border-b-4 min-w-[220px] text-center mb-6 transition-colors ${
            status === 'error'
              ? 'text-red-500 border-red-500'
              : status === 'correct'
              ? 'text-green-500 border-green-500'
              : 'text-blue-400 border-blue-500/50'
          }`}
        >
          {displayValue || <span className="text-gray-700">_</span>}
        </div>
        {!isSprintMode && (
          <button
            onClick={() => setShowTutorial(!showTutorial)}
            className="flex items-center gap-2 text-sm text-yellow-500/80 active:text-yellow-400 transition-colors mb-2"
          >
            <Lightbulb size={18} />{' '}
            {showTutorial
              ? isUk
                ? 'Сховати підказку'
                : 'Hide hint'
              : isUk
              ? 'Як вирішувати?'
              : 'How to solve?'}
          </button>
        )}
        {showTutorial && !isSprintMode && (
          <div className="absolute top-3/4 bg-gray-900 border border-gray-700 p-4 rounded-xl text-sm text-gray-300 shadow-2xl w-full z-10 leading-relaxed">
            {isUk ? currentRule.tutorialUk : currentRule.tutorialEn}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 pb-8 z-0">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleKeyPress(num.toString())}
            className="bg-gray-800 active:bg-gray-700 text-3xl h-20 rounded-2xl flex items-center justify-center font-semibold shadow-sm transition-transform active:scale-95"
          >
            {num}
          </button>
        ))}
        <button
          onClick={handleBackspace}
          aria-label={isUk ? 'Стерти цифру' : 'Backspace'}
          className="bg-red-900/30 text-red-400 active:bg-red-900/60 text-2xl h-20 rounded-2xl flex items-center justify-center shadow-sm transition-transform active:scale-95"
        >
          ⌫
        </button>
        <button
          onClick={() => handleKeyPress('0')}
          className="bg-gray-800 active:bg-gray-700 text-3xl h-20 rounded-2xl flex items-center justify-center font-semibold shadow-sm transition-transform active:scale-95"
        >
          0
        </button>
        <button
          onClick={generateProblem}
          aria-label={isUk ? 'Пропустити приклад' : 'Skip problem'}
          className="bg-blue-900/30 text-blue-400 active:bg-blue-900/60 text-xl font-medium h-20 rounded-2xl flex items-center justify-center shadow-sm transition-transform active:scale-95"
        >
          {isUk ? 'Пропуск' : 'Skip'}
        </button>
      </div>
    </div>
  );
}

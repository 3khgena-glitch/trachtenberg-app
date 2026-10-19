import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import type { RuleType } from './store/useStore';
import { ArrowLeft, Lightbulb, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { db } from './db';

const RULE_DATA: Record<RuleType, { label: string; multiplier: number; tutorial: string }> = {
  'add': { label: 'Быстрое сложение', multiplier: 0, tutorial: 'Сложение чисел. Разбивайте на удобные блоки.' },
  'x12': { label: 'Умножение на 12', multiplier: 12, tutorial: 'Удвойте синюю цифру и прибавьте зеленого соседа.' },
  'x11': { label: 'Умножение на 11', multiplier: 11, tutorial: 'Сложите синюю цифру с ее зеленым соседом.' },
  'x9':  { label: 'Умножение на 9',  multiplier: 9, tutorial: 'Первая (справа): из 10. Средние: из 9 + зеленый сосед. Левая: синяя минус 1.' },
  'x8':  { label: 'Умножение на 8',  multiplier: 8, tutorial: 'Первая: из 10 и удвоить. Средние: из 9, удвоить + зеленый сосед. Левая: синяя минус 2.' },
  'x7':  { label: 'Умножение на 7',  multiplier: 7, tutorial: 'Удвойте синюю и прибавьте половину зеленого соседа. Если синяя нечетная — +5.' },
  'x6':  { label: 'Умножение на 6',  multiplier: 6, tutorial: 'К синей прибавьте половину зеленого соседа. Если синяя нечетная — +5.' },
  'x5':  { label: 'Умножение на 5',  multiplier: 5, tutorial: 'Возьмите половину зеленого соседа. Если синяя нечетная — прибавьте 5.' },
  'x4':  { label: 'Умножение на 4',  multiplier: 4, tutorial: 'Первая: из 10. Средние: из 9 + половина зеленого соседа (+5 если нечетная). Левая: половина минус 1.' },
  'x3':  { label: 'Умножение на 3',  multiplier: 3, tutorial: 'Первая: из 10 и удвоить. Средние: из 9, удвоить, + половина зеленого соседа. Левая: половина минус 2.' },
  'x2':  { label: 'Умножение на 2',  multiplier: 2, tutorial: 'Просто удвойте синюю цифру. Переносите десятки в уме.' },
  'square': { label: 'Возведение в квадрат', multiplier: 0, tutorial: 'Квадрат числа по методу Трахтенберга: (a^2), (2ab), (b^2).' },
};

export default function Trainer() {
  const navigate = useNavigate();
  const { inputDirection, activeRule, isMixedMode, isSprintMode, sprintDuration, isHighlightEnabled, isAdaptiveMode, isDailyChallenge, isSoundEnabled, isVibrationEnabled } = useStore();

  const [currentRuleId, setCurrentRuleId] = useState<RuleType>(activeRule);
  const [targetNumber, setTargetNumber] = useState(0);
  const [targetNumber2, setTargetNumber2] = useState(0);
  const [inputReversed, setInputReversed] = useState('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'error'>('idle');
  const [showTutorial, setShowTutorial] = useState(false);

  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionAttempts, setSessionAttempts] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [sessionTime, setSessionTime] = useState<number>(0);

  const [timeLeft, setTimeLeft] = useState(isDailyChallenge ? 60 : sprintDuration);
  const [isSprintFinished, setIsSprintFinished] = useState(false);

  const [correctStreak, setCorrectStreak] = useState(0);
  const [errorStreak, setErrorStreak] = useState(0);
  const [adaptiveToast, setAdaptiveToast] = useState<'up' | 'down' | null>(null);

  const currentRule = RULE_DATA[currentRuleId];
  
  let correctAnswer = '';
  if (currentRuleId === 'add') correctAnswer = (targetNumber + targetNumber2).toString();
  else if (currentRuleId === 'square') correctAnswer = Math.pow(targetNumber, 2).toString();
  else correctAnswer = (targetNumber * currentRule.multiplier).toString();
  
  const targetStr = '0' + targetNumber.toString();
  const currentStep = inputReversed.length;

  // --- Система звука и вибрации ---
  const playTone = (frequency: number, type: OscillatorType, duration: number) => {
    if (!isSoundEnabled) return;
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime); // Громкость 10%
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  };

  const triggerFeedback = (type: 'correct' | 'error' | 'click') => {
    if (type === 'click') {
      if (isSoundEnabled) playTone(800, 'sine', 0.05); // Короткий клик
      if (isVibrationEnabled && navigator.vibrate) navigator.vibrate(10); // Легкая вибрация
    } else if (type === 'correct') {
      if (isSoundEnabled) playTone(600, 'triangle', 0.15); // Приятный динь
      if (isVibrationEnabled && navigator.vibrate) navigator.vibrate(50); // Успешная вибрация
    } else if (type === 'error') {
      if (isSoundEnabled) playTone(150, 'sawtooth', 0.3); // Низкий базз
      if (isVibrationEnabled && navigator.vibrate) navigator.vibrate([100, 50, 100]); // Двойная ошибка
    }
  };

  useEffect(() => {
    if (isSprintMode && timeLeft > 0 && !isSprintFinished) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (isSprintMode && timeLeft === 0 && !isSprintFinished) {
      setIsSprintFinished(true);
      triggerFeedback('error'); // Звук конца времени
      if (isDailyChallenge) {
        localStorage.setItem('lastDailyChallenge', new Date().toISOString().split('T')[0]);
      }
    }
  }, [isSprintMode, timeLeft, isSprintFinished, isDailyChallenge]);

  const generateProblem = () => {
    let nextRuleId = activeRule;
    if (isMixedMode || isSprintMode) {
      const ruleKeys = Object.keys(RULE_DATA) as RuleType[];
      nextRuleId = ruleKeys[Math.floor(Math.random() * ruleKeys.length)];
    }
    setCurrentRuleId(nextRuleId);

    const currentDigitCount = useStore.getState().digitCount;
    const min = Math.pow(10, currentDigitCount - 1);
    const max = Math.pow(10, currentDigitCount) - 1;
    
    setTargetNumber(Math.floor(Math.random() * (max - min + 1)) + min);
    if (nextRuleId === 'add') setTargetNumber2(Math.floor(Math.random() * (max - min + 1)) + min);
    
    setInputReversed('');
    setStatus('idle');
    setStartTime(Date.now());
  };

  useEffect(() => {
    generateProblem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleKeyPress = (digit: string) => {
    if (status === 'correct' || isSprintFinished) return;
    triggerFeedback('click');
    
    setInputReversed((prev) => {
      const newVal = prev + digit;
      if (newVal.length === correctAnswer.length) {
        const currentInput = newVal.split('').reverse().join('');
        setSessionAttempts(prevAttempts => prevAttempts + 1);
        
        if (currentInput === correctAnswer) {
          setStatus('correct');
          setSessionCorrect(prevCorrect => prevCorrect + 1);
          setSessionTime(prevTime => prevTime + (Date.now() - startTime));
          triggerFeedback('correct');
          
          if (isAdaptiveMode) {
            const newStreak = correctStreak + 1;
            setCorrectStreak(newStreak);
            setErrorStreak(0);
            if (newStreak >= 3 && useStore.getState().digitCount < 6) { 
              useStore.getState().setDigitCount(useStore.getState().digitCount + 1);
              setCorrectStreak(0);
              setAdaptiveToast('up');
              setTimeout(() => setAdaptiveToast(null), 2000);
            }
          }

          if (isMixedMode || isSprintMode) db.stats.add({ rule: currentRuleId, date: new Date().toISOString(), correctAnswers: 1, totalAttempts: 1, totalTime: Date.now() - startTime });
          setTimeout(generateProblem, isSprintMode ? 400 : 800);
        } else {
          setStatus('error');
          triggerFeedback('error');
          
          if (isAdaptiveMode) {
            const newErrStreak = errorStreak + 1;
            setErrorStreak(newErrStreak);
            setCorrectStreak(0);
            if (newErrStreak >= 2 && useStore.getState().digitCount > 2) { 
              useStore.getState().setDigitCount(useStore.getState().digitCount - 1);
              setErrorStreak(0);
              setAdaptiveToast('down');
              setTimeout(() => setAdaptiveToast(null), 2000);
            }
          }

          if (isMixedMode || isSprintMode) db.stats.add({ rule: currentRuleId, date: new Date().toISOString(), correctAnswers: 0, totalAttempts: 1, totalTime: 0 });
        }
      } else {
        setStatus('idle');
      }
      return newVal;
    });
  };

  const handleBackspace = () => {
    if (isSprintFinished) return;
    triggerFeedback('click');
    setInputReversed((prev) => prev.slice(0, -1));
    setStatus('idle');
  };

  const handleGoBack = async () => {
    if (sessionAttempts > 0 && !isMixedMode && !isSprintMode) {
      await db.stats.add({ rule: activeRule, date: new Date().toISOString(), correctAnswers: sessionCorrect, totalAttempts: sessionAttempts, totalTime: sessionTime });
    }
    navigate('/');
  };

  const displayValue = inputDirection === 'rtl' ? inputReversed.split('').reverse().join('') : inputReversed;

  if (isSprintFinished) {
    return (
      <div className="flex flex-col h-screen bg-gray-950 text-white p-6 justify-center items-center">
        <h2 className="text-4xl font-bold text-red-500 mb-2">Время вышло!</h2>
        <p className="text-gray-400 mb-8 uppercase tracking-widest text-sm">{isDailyChallenge ? 'Испытание завершено' : 'Спринт завершен'}</p>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-xs mb-8 flex flex-col gap-4 shadow-lg text-center">
          <div>
            <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Решено</div>
            <div className="text-4xl font-bold text-green-400">{sessionCorrect}</div>
          </div>
          <div className="h-px w-full bg-gray-800"></div>
          <div>
            <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Точность</div>
            <div className="text-2xl font-bold text-blue-400">
              {sessionAttempts > 0 ? Math.round((sessionCorrect / sessionAttempts) * 100) : 0}%
            </div>
          </div>
        </div>
        <button onClick={handleGoBack} className="bg-blue-600 active:bg-blue-700 w-full max-w-xs text-white p-4 rounded-xl text-lg font-bold transition-colors shadow-lg">В меню</button>
      </div>
    );
  }

  const renderExpression = () => {
    if (currentRuleId === 'add') {
      return (
        <div className="flex text-5xl font-bold tracking-widest text-white items-center gap-3">
          <span>{targetNumber}</span> <span className="text-gray-500 text-4xl">+</span> <span>{targetNumber2}</span>
        </div>
      );
    }
    if (currentRuleId === 'square') {
      return (
        <div className="flex text-6xl font-bold tracking-widest text-white items-start gap-1">
          <span>{targetNumber}</span><span className="text-gray-500 text-3xl mt-[-5px]">²</span>
        </div>
      );
    }
    return (
      <div className="flex text-6xl font-bold tracking-widest text-white items-center gap-3">
        {isHighlightEnabled ? (
          <div className="flex">
            {targetStr.split('').map((char, index) => {
               const isDone = status === 'correct';
               const isActive = !isDone && index === targetStr.length - 1 - currentStep;
               const isNeighbor = !isDone && index === targetStr.length - currentStep;
               return (
                 <span key={index} className={`px-1 rounded-lg transition-colors ${isActive ? 'text-blue-400 bg-blue-900/40 border-b-4 border-blue-400' : isNeighbor ? 'text-green-400 bg-green-900/40 border-b-4 border-green-400' : index === 0 && currentStep < targetStr.length - 1 ? 'text-gray-700' : 'text-white border-b-4 border-transparent'}`}>{char}</span>
               );
            })}
          </div>
        ) : <span>{targetNumber}</span>}
        <span className="text-gray-500 text-4xl">×</span> 
        <span className={(isMixedMode || isSprintMode) ? "text-yellow-400" : ""}>{currentRule.multiplier}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white p-4 justify-between max-w-md mx-auto relative">
      {adaptiveToast && (
        <div className={`absolute top-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg z-50 animate-bounce ${adaptiveToast === 'up' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {adaptiveToast === 'up' ? <><TrendingUp size={18} /> Усложняем!</> : <><TrendingDown size={18} /> Снижаем сложность</>}
        </div>
      )}

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center text-gray-400 text-sm">
          <button onClick={handleGoBack} className="p-2 -ml-2 mr-2 text-gray-400 active:text-white transition-colors"><ArrowLeft size={28} /></button>
          <span className="text-lg font-medium text-blue-400">
            {isDailyChallenge ? '🔥 Ежедневное' : isSprintMode ? '⏱ Спринт' : isMixedMode ? '🔀 Смешанный' : currentRule.label}
          </span>
        </div>
        {isSprintMode ? (
          <div className={`flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-full border ${timeLeft <= 10 ? 'bg-red-900/30 text-red-400 border-red-800' : 'bg-gray-900 text-yellow-400 border-gray-800'}`}>
            <Clock size={14} /> {timeLeft}с
          </div>
        ) : (
          <div className="text-sm font-semibold text-gray-500 bg-gray-900 px-3 py-1 rounded-full border border-gray-800">
            <span className="text-green-400">{sessionCorrect}</span> / {sessionAttempts}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center justify-center flex-grow relative">
        <div className="flex flex-col items-center mb-10">
          {renderExpression()}
        </div>
        <div className={`text-5xl font-mono h-16 border-b-4 min-w-[220px] text-center mb-6 transition-colors ${status === 'error' ? 'text-red-500 border-red-500' : status === 'correct' ? 'text-green-500 border-green-500' : 'text-blue-400 border-blue-500/50'}`}>
          {displayValue || <span className="text-gray-700">_</span>}
        </div>
        {!isSprintMode && (
          <button onClick={() => setShowTutorial(!showTutorial)} className="flex items-center gap-2 text-sm text-yellow-500/80 active:text-yellow-400 transition-colors mb-2">
            <Lightbulb size={18} /> {showTutorial ? 'Скрыть подсказку' : `Как решать?`}
          </button>
        )}
        {showTutorial && !isSprintMode && (
          <div className="absolute top-3/4 bg-gray-900 border border-gray-700 p-4 rounded-xl text-sm text-gray-300 shadow-2xl w-full z-10 leading-relaxed">
            {currentRule.tutorial}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 pb-8 z-0">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button key={num} onClick={() => handleKeyPress(num.toString())} className="bg-gray-800 active:bg-gray-700 text-3xl h-20 rounded-2xl flex items-center justify-center font-semibold shadow-sm transition-transform active:scale-95">{num}</button>
        ))}
        <button onClick={handleBackspace} className="bg-red-900/30 text-red-400 active:bg-red-900/60 text-2xl h-20 rounded-2xl flex items-center justify-center shadow-sm transition-transform active:scale-95">⌫</button>
        <button onClick={() => handleKeyPress('0')} className="bg-gray-800 active:bg-gray-700 text-3xl h-20 rounded-2xl flex items-center justify-center font-semibold shadow-sm transition-transform active:scale-95">0</button>
        <button onClick={generateProblem} className="bg-blue-900/30 text-blue-400 active:bg-blue-900/60 text-xl font-medium h-20 rounded-2xl flex items-center justify-center shadow-sm transition-transform active:scale-95">Пропуск</button>
      </div>
    </div>
  );
}
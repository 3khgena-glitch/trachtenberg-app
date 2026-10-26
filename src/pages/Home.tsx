import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import type { RuleType } from '../store/useStore';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Lock, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Home() {
  const navigate = useNavigate();
  const { setActiveRule, setIsMixedMode, setIsSprintMode, setIsDailyChallenge, setUnlockedRules, isAdaptiveMode, setDigitCount, language } = useStore();
  const [dailyCompleted, setDailyCompleted] = useState(false);

  const isUk = language === 'uk';

  useEffect(() => {
    const lastDaily = localStorage.getItem('lastDailyChallenge');
    const today = new Date().toISOString().split('T')[0];
    if (lastDaily === today) setDailyCompleted(true);
  }, []);

  const stats = useLiveQuery(() => db.stats.toArray());
  const totalCorrect = stats?.reduce((sum, stat) => sum + stat.correctAnswers, 0) || 0;
  const totalAttempts = stats?.reduce((sum, stat) => sum + stat.totalAttempts, 0) || 0;
  const totalTime = stats?.reduce((sum, stat) => sum + (stat.totalTime || 0), 0) || 0; 
  
  const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  const averageTime = totalCorrect > 0 ? (totalTime / totalCorrect / 1000).toFixed(1) : 0;

  const ruleStats = (stats || []).reduce((acc, stat) => {
      if (!acc[stat.rule]) acc[stat.rule] = { correct: 0, attempts: 0 };
      acc[stat.rule].correct += stat.correctAnswers;
      acc[stat.rule].attempts += stat.totalAttempts;
      return acc;
  }, {} as Record<string, { correct: number; attempts: number }>);

  const rules: { id: RuleType; nameUk: string; nameEn: string; color: string }[] = [
    { id: 'add', nameUk: 'Швидке додавання', nameEn: 'Fast Addition', color: 'bg-emerald-700' },
    { id: 'x11', nameUk: 'Множення на 11', nameEn: 'Multiply by 11', color: 'bg-purple-700' },
    { id: 'x12', nameUk: 'Множення на 12', nameEn: 'Multiply by 12', color: 'bg-fuchsia-700' },
    { id: 'x6',  nameUk: 'Множення на 6',  nameEn: 'Multiply by 6', color: 'bg-teal-700' },
    { id: 'x5',  nameUk: 'Множення на 5',  nameEn: 'Multiply by 5', color: 'bg-green-700' },
    { id: 'x9',  nameUk: 'Множення на 9',  nameEn: 'Multiply by 9', color: 'bg-red-700' },
    { id: 'x8',  nameUk: 'Множення на 8',  nameEn: 'Multiply by 8', color: 'bg-orange-700' },
    { id: 'x7',  nameUk: 'Множення на 7',  nameEn: 'Multiply by 7', color: 'bg-amber-600' },
    { id: 'x4',  nameUk: 'Множення на 4',  nameEn: 'Multiply by 4', color: 'bg-cyan-700' },
    { id: 'x3',  nameUk: 'Множення на 3',  nameEn: 'Multiply by 3', color: 'bg-blue-700' },
    { id: 'x2',  nameUk: 'Множення на 2',  nameEn: 'Multiply by 2', color: 'bg-indigo-700' },
    { id: 'square', nameUk: 'Піднесення до квадрата', nameEn: 'Squaring', color: 'bg-rose-700' },
  ];

  const isUnlocked = (index: number) => {
    if (index === 0) return true; 
    const prevRuleId = rules[index - 1].id;
    const prevStat = ruleStats[prevRuleId];
    if (!prevStat) return false; 
    const prevAccuracy = prevStat.attempts > 0 ? (prevStat.correct / prevStat.attempts) * 100 : 0;
    return prevStat.correct >= 10 && prevAccuracy >= 80;
  };

  const startPractice = (ruleId: RuleType, index: number) => {
    if (!isUnlocked(index)) {
      alert(isUk ? `Спочатку доведіть майстерність у попередньому правилі!\nПотрібно: 10 правильних відповідей та точність від 80%.` : `Master the previous rule first!\nRequired: 10 correct answers with 80%+ accuracy.`);
      return;
    }
    
    if (isAdaptiveMode) setDigitCount(2);

    setIsMixedMode(false);
    setIsSprintMode(false);
    setIsDailyChallenge(false);
    setActiveRule(ruleId);
    navigate('/practice');
  };

  const startMode = (mode: 'mixed' | 'sprint' | 'daily') => {
    const unlockedRuleIds = rules.filter((_, index) => isUnlocked(index)).map(r => r.id);
    setUnlockedRules(unlockedRuleIds);

    if (isAdaptiveMode) setDigitCount(2);

    setIsMixedMode(true);
    setIsSprintMode(mode === 'sprint' || mode === 'daily');
    setIsDailyChallenge(mode === 'daily');
    navigate('/practice');
  };

  return (
    <div className="flex flex-col items-center h-screen bg-gray-950 text-white p-6 py-8 overflow-hidden">
      <h1 className="text-4xl font-bold mb-2 text-center text-blue-400 shrink-0">{isUk ? 'Рахуємо в умі' : 'Mental Math'}</h1>
      <p className="text-gray-400 mb-4 tracking-widest text-sm uppercase shrink-0">Trachtenberg</p>

      <button
        onClick={() => startMode('daily')}
        className={`w-full max-w-xs p-4 rounded-2xl mb-4 font-bold shadow-lg flex justify-between items-center transition-all shrink-0 ${
          dailyCompleted ? 'bg-green-900/40 text-green-400 border border-green-700/50' : 'bg-gradient-to-r from-yellow-600 to-orange-500 text-white active:brightness-90'
        }`}
      >
        <span className="flex items-center gap-2">
          {dailyCompleted ? <CheckCircle2 size={20} /> : '🔥'} {isUk ? 'Щоденне випробування' : 'Daily Challenge'}
        </span>
        <span className="text-sm opacity-70">{dailyCompleted ? (isUk ? 'Виконано' : 'Completed') : (isUk ? 'Почати' : 'Start')}</span>
      </button>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 w-full max-w-xs mb-4 flex justify-between items-center shadow-lg shrink-0">
        <div className="flex flex-col">
          <span className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider mb-1">{isUk ? 'Вирішено' : 'Solved'}</span>
          <span className="text-xl font-bold text-green-400">{totalCorrect} <span className="text-gray-600 text-xs font-medium">/ {totalAttempts}</span></span>
        </div>
        <div className="flex flex-col items-center border-l border-r border-gray-800 px-4">
          <span className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider mb-1">{isUk ? 'Сер. час' : 'Avg Time'}</span>
          <span className="text-xl font-bold text-yellow-400">{averageTime}{isUk ? 'с' : 's'}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider mb-1">{isUk ? 'Точність' : 'Accuracy'}</span>
          <span className="text-xl font-bold text-blue-400">{accuracy}%</span>
        </div>
      </div>

      <div className="flex gap-2 w-full max-w-xs mb-4 shrink-0">
        <button onClick={() => startMode('mixed')} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 active:brightness-90 p-3 rounded-xl text-sm font-bold shadow-lg transition-all flex justify-center items-center">🔀 {isUk ? 'Змішаний' : 'Mixed'}</button>
        <button onClick={() => startMode('sprint')} className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 active:brightness-90 p-3 rounded-xl text-sm font-bold shadow-lg transition-all flex justify-center items-center">⏱ {isUk ? 'Спринт' : 'Sprint'}</button>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs overflow-y-auto flex-grow pr-2 pb-4 scrollbar-thin scrollbar-thumb-gray-800">
        <div className="flex justify-between items-center mb-1 mt-1">
          <h2 className="text-gray-500 text-xs font-semibold uppercase tracking-wider">{isUk ? 'Дерево навичок:' : 'Skill Tree:'}</h2>
        </div>
        {rules.map((rule, index) => {
          const unlocked = isUnlocked(index);
          const btnClass = unlocked ? `${rule.color} active:brightness-90 shadow-md` : `bg-gray-800 border border-gray-700 text-gray-500 opacity-70`;
          return (
            <button key={rule.id} onClick={() => startPractice(rule.id, index)} className={`${btnClass} p-4 rounded-xl text-lg font-semibold transition-all flex justify-between items-center shrink-0`}>
              <span>{isUk ? rule.nameUk : rule.nameEn}</span>
              {unlocked ? <span className="text-white/50 text-sm">▶</span> : <Lock size={18} className="text-gray-600" />}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2 w-full max-w-xs pt-4 shrink-0">
        <button onClick={() => navigate('/theory')} className="col-span-2 bg-indigo-900/30 text-indigo-400 active:bg-indigo-900/50 p-3 rounded-xl text-sm font-semibold transition-colors shadow-lg flex items-center justify-center gap-2">📚 {isUk ? 'Теорія та Правила' : 'Theory & Rules'}</button>
        <button onClick={() => navigate('/stats')} className="flex-1 bg-gray-800 active:bg-gray-700 text-blue-400 p-3 rounded-xl text-sm font-semibold transition-colors shadow-lg flex items-center justify-center gap-2">📊 {isUk ? 'Статистика' : 'Stats'}</button>
        <button onClick={() => navigate('/settings')} className="flex-1 bg-gray-800 active:bg-gray-700 text-gray-300 p-3 rounded-xl text-sm font-semibold transition-colors shadow-lg flex items-center justify-center gap-2">⚙️ {isUk ? 'Налаштування' : 'Settings'}</button>
      </div>
    </div>
  );
}
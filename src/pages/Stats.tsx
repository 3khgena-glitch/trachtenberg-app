import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { ArrowLeft } from 'lucide-react';
import type { RuleType } from '../store/useStore';

// Добавили переводы для новых правил (Сложение и Квадрат)
const RULE_NAMES: Record<RuleType, string> = {
  'add': 'Быстрое сложение',
  'square': 'Возведение в квадрат',
  'x12': 'Умножение на 12',
  'x11': 'Умножение на 11',
  'x9': 'Умножение на 9',
  'x8': 'Умножение на 8',
  'x7': 'Умножение на 7',
  'x6': 'Умножение на 6',
  'x5': 'Умножение на 5',
  'x4': 'Умножение на 4',
  'x3': 'Умножение на 3',
  'x2': 'Умножение на 2',
};

export default function Stats() {
  const navigate = useNavigate();
  const stats = useLiveQuery(() => db.stats.toArray());

  const groupedStats = (stats || []).reduce((acc, stat) => {
    if (!acc[stat.rule]) {
      acc[stat.rule] = { correct: 0, attempts: 0, time: 0 };
    }
    acc[stat.rule].correct += stat.correctAnswers;
    acc[stat.rule].attempts += stat.totalAttempts;
    acc[stat.rule].time += stat.totalTime || 0;
    return acc;
  }, {} as Record<string, { correct: number; attempts: number; time: number }>);

  const displayData = Object.entries(groupedStats).map(([rule, data]) => {
    const accuracy = data.attempts > 0 ? Math.round((data.correct / data.attempts) * 100) : 0;
    const avgTime = data.correct > 0 ? (data.time / data.correct / 1000).toFixed(1) : '0';
    return {
      rule: rule as RuleType,
      name: RULE_NAMES[rule as RuleType] || rule,
      accuracy,
      avgTime,
      correct: data.correct,
      attempts: data.attempts
    };
  }).sort((a, b) => a.accuracy - b.accuracy);

  const last7Days = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
       dateStr: d.toISOString().split('T')[0],
       dayName: d.toLocaleDateString('ru-RU', { weekday: 'short' })
    };
  });

  const activityMap = (stats || []).reduce((acc, stat) => {
      const dateStr = stat.date.split('T')[0];
      acc[dateStr] = (acc[dateStr] || 0) + stat.totalAttempts;
      return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white p-6">
      <div className="flex items-center mb-6 mt-4">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 mr-2 text-gray-400 active:text-white transition-colors">
          <ArrowLeft size={28} />
        </button>
        <h1 className="text-2xl font-bold text-blue-400">Детальная статистика</h1>
      </div>

      <div className="flex flex-col gap-4 max-w-xs mx-auto w-full pb-6">
        
        <h2 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-[-8px]">Регулярность (7 дней)</h2>
        <div className="flex justify-between bg-gray-900 p-4 rounded-xl border border-gray-800 mb-2">
            {last7Days.map(day => (
                <div key={day.dateStr} className="flex flex-col items-center gap-2">
                    <span className="text-[10px] text-gray-500 uppercase">{day.dayName}</span>
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold ${activityMap[day.dateStr] ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-800 text-gray-600'}`}>
                        {activityMap[day.dateStr] || 0}
                    </div>
                </div>
            ))}
        </div>

        <h2 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mt-2">Слабые места</h2>
        <p className="text-[10px] text-gray-400 mb-2 leading-tight">
          Правила отсортированы от самых сложных для вас к самым легким (по точности).
        </p>

        {displayData.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">Нет данных. Решите пару примеров!</div>
        ) : (
          displayData.map((item) => (
            <div key={item.rule} className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-lg flex flex-col gap-3">
              <div className="font-semibold text-lg text-gray-200 border-b border-gray-800 pb-2">
                {item.name}
              </div>
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider">Точность</span>
                  <span className={`text-xl font-bold ${item.accuracy < 80 ? 'text-red-400' : 'text-blue-400'}`}>
                    {item.accuracy}%
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider">Ср. время</span>
                  <span className="text-xl font-bold text-yellow-400">{item.avgTime}с</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider">Решено</span>
                  <span className="text-xl font-bold text-green-400">
                    {item.correct} <span className="text-gray-600 text-xs font-medium">/ {item.attempts}</span>
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
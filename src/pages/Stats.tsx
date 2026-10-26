import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, ChevronDown, ChevronUp, Calendar, ArrowUpDown } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { useStore } from '../store/useStore';

const RULE_LABELS_UK: Record<string, string> = {
  'add': 'Швидке додавання', 'x12': 'Множення на 12', 'x11': 'Множення на 11', 'x9': 'Множення на 9', 'x8': 'Множення на 8',
  'x7': 'Множення на 7', 'x6': 'Множення на 6', 'x5': 'Множення на 5', 'x4': 'Множення на 4', 'x3': 'Множення на 3',
  'x2': 'Множення на 2', 'square': 'Піднесення до квадрата',
};

const RULE_LABELS_EN: Record<string, string> = {
  'add': 'Fast Addition', 'x12': 'Multiply by 12', 'x11': 'Multiply by 11', 'x9': 'Multiply by 9', 'x8': 'Multiply by 8',
  'x7': 'Multiply by 7', 'x6': 'Multiply by 6', 'x5': 'Multiply by 5', 'x4': 'Multiply by 4', 'x3': 'Multiply by 3',
  'x2': 'Multiply by 2', 'square': 'Squaring',
};

const RULE_ORDER = ['add', 'x11', 'x12', 'x6', 'x5', 'x9', 'x8', 'x7', 'x4', 'x3', 'x2', 'square'];

export default function Stats() {
  const navigate = useNavigate();
  const { language, ruleSortOrder, setRuleSortOrder } = useStore();
  const isUk = language === 'uk';
  
  const [expandedRule, setExpandedRule] = useState<string | null>(null);

  const rawStats = useLiveQuery(() => db.stats.orderBy('date').reverse().toArray());

  const clearProgress = async () => {
    if (window.confirm(isUk ? 'Ви впевнені, що хочете видалити всю статистику?' : 'Are you sure you want to clear all statistics?')) {
      await db.stats.clear();
      setExpandedRule(null);
    }
  };

  const sortedStats = useMemo(() => {
    if (!rawStats) return [];
    
    // Групуємо статистику
    const grouped = rawStats.reduce((acc, stat) => {
      if (!acc[stat.rule]) {
        acc[stat.rule] = { totalAttempts: 0, correctAnswers: 0, totalTime: 0, history: [] };
      }
      acc[stat.rule].totalAttempts += stat.totalAttempts;
      acc[stat.rule].correctAnswers += stat.correctAnswers;
      acc[stat.rule].totalTime += stat.totalTime || 0;
      acc[stat.rule].history.push(stat);
      return acc;
    }, {} as Record<string, { totalAttempts: number; correctAnswers: number; totalTime: number; history: typeof rawStats }>);

    // Перетворюємо в масив і рахуємо % помилок
    const statsArray = Object.entries(grouped).map(([ruleId, data]) => {
      const errorRate = data.totalAttempts > 0 
        ? Math.round(((data.totalAttempts - data.correctAnswers) / data.totalAttempts) * 100) 
        : 0;
      return { ruleId, ...data, errorRate };
    });

    // Сортуємо
    return statsArray.sort((a, b) => {
      if (ruleSortOrder === 'errors') {
        return b.errorRate - a.errorRate;
      }
      // За порядком вивчення
      return RULE_ORDER.indexOf(a.ruleId) - RULE_ORDER.indexOf(b.ruleId);
    });
  }, [rawStats, ruleSortOrder]);

  const toggleRule = (ruleId: string) => {
    setExpandedRule(prev => prev === ruleId ? null : ruleId);
  };

  const getRuleName = (ruleId: string) => {
    return isUk ? (RULE_LABELS_UK[ruleId] || ruleId) : (RULE_LABELS_EN[ruleId] || ruleId);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white p-4 sm:p-6 pb-12">
      <div className="flex items-center justify-between mb-2 mt-4 max-w-md mx-auto w-full">
        <div className="flex items-center">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 mr-2 text-gray-400 active:text-white transition-colors">
            <ArrowLeft size={28} />
          </button>
          <h1 className="text-2xl font-bold text-blue-400">{isUk ? 'Статистика' : 'Statistics'}</h1>
        </div>
        <button onClick={clearProgress} className="text-red-900/60 hover:text-red-500 active:text-red-400 p-2 transition-colors">
          <Trash2 size={20} />
        </button>
      </div>

      <div className="flex justify-between items-center mb-4 max-w-md mx-auto w-full">
        <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">{isUk ? 'Аналітика вправ' : 'Exercises Analysis'}</span>
        <button 
          onClick={() => setRuleSortOrder(ruleSortOrder === 'default' ? 'errors' : 'default')}
          className="text-xs text-blue-400 active:text-blue-300 transition-colors flex items-center gap-1 font-medium bg-blue-900/20 px-3 py-1.5 rounded-lg"
        >
          <ArrowUpDown size={14} />
          {ruleSortOrder === 'default' ? (isUk ? 'За порядком' : 'Default') : (isUk ? 'За помилками' : 'By Errors')}
        </button>
      </div>

      <div className="flex flex-col gap-4 max-w-md mx-auto w-full">
        {sortedStats.map(({ ruleId, ...data }) => {
          const isExpanded = expandedRule === ruleId;
          const avgTime = data.correctAnswers > 0 ? (data.totalTime / data.correctAnswers / 1000).toFixed(1) : '-';
          
          return (
            <div key={ruleId} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-lg transition-all">
              <button 
                onClick={() => toggleRule(ruleId)} 
                className="w-full p-4 flex flex-col gap-3 text-left active:bg-gray-800/50 transition-colors relative"
              >
                <div className="flex justify-between items-start w-full">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-200 text-lg">{getRuleName(ruleId)}</span>
                    {ruleSortOrder === 'errors' && data.errorRate > 0 && (
                      <span className="text-xs text-red-400 mt-1 font-semibold">
                        {isUk ? `Помилок: ${data.errorRate}%` : `Errors: ${data.errorRate}%`}
                      </span>
                    )}
                  </div>
                  <div className="text-gray-500 mt-1">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 w-full bg-gray-950/50 p-3 rounded-xl border border-gray-800/50">
                  <div className="flex flex-col items-center">
                    <span className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider mb-1">
                      {isUk ? 'Всього' : 'Total'}
                    </span>
                    <span className="text-lg font-bold text-gray-300">{data.totalAttempts}</span>
                  </div>
                  <div className="flex flex-col items-center border-l border-r border-gray-800">
                    <span className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider mb-1">
                      {isUk ? 'Вірно' : 'Correct'}
                    </span>
                    <span className="text-lg font-bold text-green-400">{data.correctAnswers}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider mb-1">
                      {isUk ? 'Сер. час' : 'Avg Time'}
                    </span>
                    <span className="text-lg font-bold text-yellow-400">{avgTime}{avgTime !== '-' && (isUk ? 'с' : 's')}</span>
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 bg-gray-900 border-t border-gray-800">
                  <div className="mt-3 flex flex-col gap-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-800">
                    {data.history.map((stat, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-gray-800/50 last:border-0">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Calendar size={14} className="text-blue-500/50" />
                          {new Date(stat.date).toLocaleDateString(isUk ? 'uk-UA' : 'en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="flex gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <span className="text-green-400 font-medium">{stat.correctAnswers}</span>
                            <span className="text-gray-600 text-xs">/ {stat.totalAttempts}</span>
                          </div>
                          <div className="text-yellow-500 w-10 text-right">
                            {stat.totalTime > 0 ? (stat.totalTime / 1000).toFixed(1) + (isUk ? 'с' : 's') : '-'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {(!rawStats || rawStats.length === 0) && (
          <div className="text-gray-500 text-center mt-10">
            {isUk ? 'Ще немає даних для статистики' : 'No statistics data yet'}
          </div>
        )}
      </div>
    </div>
  );
}
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { db } from '../db';
import { useStore } from '../store/useStore';
import type { RuleType } from '../store/useStore';

const RULE_ORDER: RuleType[] = [
  'add',
  'x11',
  'x12',
  'x6',
  'x5',
  'x9',
  'x8',
  'x7',
  'x4',
  'x3',
  'x2',
  'square',
];

const RULE_NAMES: Record<RuleType, { uk: string; en: string }> = {
  add: { uk: 'Швидке додавання', en: 'Fast Addition' },
  x11: { uk: 'Множення на 11', en: 'Multiply by 11' },
  x12: { uk: 'Множення на 12', en: 'Multiply by 12' },
  x6: { uk: 'Множення на 6', en: 'Multiply by 6' },
  x5: { uk: 'Множення на 5', en: 'Multiply by 5' },
  x9: { uk: 'Множення на 9', en: 'Multiply by 9' },
  x8: { uk: 'Множення на 8', en: 'Multiply by 8' },
  x7: { uk: 'Множення на 7', en: 'Multiply by 7' },
  x4: { uk: 'Множення на 4', en: 'Multiply by 4' },
  x3: { uk: 'Множення на 3', en: 'Multiply by 3' },
  x2: { uk: 'Множення на 2', en: 'Multiply by 2' },
  square: { uk: 'Піднесення до квадрата', en: 'Squaring' },
};

interface DayEntry {
  dateStr: string;
  correct: number;
  attempts: number;
  time: number;
}

export default function Stats() {
  const navigate = useNavigate();
  const { language, ruleSortOrder, setRuleSortOrder } = useStore();
  const isUk = language === 'uk';

  const stats = useLiveQuery(() => db.stats.toArray());
  const [expandedRule, setExpandedRule] = useState<RuleType | null>(null);

  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        dateStr: d.toISOString().split('T')[0],
        dayName: d.toLocaleDateString(isUk ? 'uk-UA' : 'en-US', { weekday: 'short' }),
      };
    });
  }, [isUk]);

  const activityMap = useMemo(() => {
    return (stats || []).reduce((acc, stat) => {
      const dateStr = stat.date.split('T')[0];
      acc[dateStr] = (acc[dateStr] || 0) + stat.totalAttempts;
      return acc;
    }, {} as Record<string, number>);
  }, [stats]);

  const displayData = useMemo(() => {
    const grouped = (stats || []).reduce(
      (acc, stat) => {
        if (!acc[stat.rule]) {
          acc[stat.rule] = {
            correct: 0,
            attempts: 0,
            time: 0,
            byDay: {},
          };
        }
        acc[stat.rule].correct += stat.correctAnswers;
        acc[stat.rule].attempts += stat.totalAttempts;
        acc[stat.rule].time += stat.totalTime || 0;

        const dateStr = stat.date.split('T')[0];
        if (!acc[stat.rule].byDay[dateStr]) {
          acc[stat.rule].byDay[dateStr] = {
            dateStr,
            correct: 0,
            attempts: 0,
            time: 0,
          };
        }
        acc[stat.rule].byDay[dateStr].correct += stat.correctAnswers;
        acc[stat.rule].byDay[dateStr].attempts += stat.totalAttempts;
        acc[stat.rule].byDay[dateStr].time += stat.totalTime || 0;

        return acc;
      },
      {} as Record<
        string,
        {
          correct: number;
          attempts: number;
          time: number;
          byDay: Record<string, DayEntry>;
        }
      >
    );

    const items = Object.entries(grouped).map(([ruleKey, data]) => {
      const rule = ruleKey as RuleType;
      const accuracy = data.attempts > 0 ? Math.round((data.correct / data.attempts) * 100) : 0;
      const errorRate = 100 - accuracy;
      const avgTime = data.correct > 0 ? (data.time / data.correct / 1000).toFixed(1) : '0';
      const days = Object.values(data.byDay).sort((a, b) =>
        b.dateStr.localeCompare(a.dateStr)
      );

      return {
        rule,
        name: RULE_NAMES[rule] ? (isUk ? RULE_NAMES[rule].uk : RULE_NAMES[rule].en) : rule,
        accuracy,
        errorRate,
        avgTime,
        correct: data.correct,
        attempts: data.attempts,
        days,
      };
    });

    if (ruleSortOrder === 'errors') {
      return items.sort((a, b) => b.errorRate - a.errorRate);
    }

    return items.sort((a, b) => {
      const idxA = RULE_ORDER.indexOf(a.rule);
      const idxB = RULE_ORDER.indexOf(b.rule);
      return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
    });
  }, [stats, isUk, ruleSortOrder]);

  const toggleRule = (rule: RuleType) => {
    setExpandedRule((prev) => (prev === rule ? null : rule));
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white p-6 pb-12">
      <div className="flex items-center mb-6 mt-4 max-w-xs mx-auto w-full">
        <button
          onClick={() => navigate('/')}
          className="p-2 -ml-2 mr-2 text-gray-400 active:text-white transition-colors"
        >
          <ArrowLeft size={28} />
        </button>
        <h1 className="text-2xl font-bold text-blue-400">
          {isUk ? 'Статистика' : 'Statistics'}
        </h1>
      </div>

      <div className="flex flex-col gap-4 max-w-xs mx-auto w-full pb-6">
        {/* Регулярність за 7 днів */}
        <h2 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-[-8px]">
          {isUk ? 'Регулярність (7 днів)' : 'Activity (7 days)'}
        </h2>
        <div className="flex justify-between bg-gray-900 p-4 rounded-xl border border-gray-800">
          {last7Days.map((day) => (
            <div key={day.dateStr} className="flex flex-col items-center gap-2">
              <span className="text-[10px] text-gray-500 uppercase">{day.dayName}</span>
              <div
                className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold ${
                  activityMap[day.dateStr]
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-gray-800 text-gray-600'
                }`}
              >
                {activityMap[day.dateStr] || 0}
              </div>
            </div>
          ))}
        </div>

        {/* Перемикач сортування */}
        <div className="flex flex-col gap-2 mt-1">
          <h2 className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
            {isUk ? 'Сортування вправ' : 'Sort exercises'}
          </h2>
          <div className="flex gap-2 bg-gray-900 p-1.5 rounded-xl border border-gray-800">
            <button
              onClick={() => setRuleSortOrder('default')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${
                ruleSortOrder === 'default'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              {isUk ? 'За порядком' : 'Default order'}
            </button>
            <button
              onClick={() => setRuleSortOrder('errors')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${
                ruleSortOrder === 'errors'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              {isUk ? 'За помилками' : 'By errors'}
            </button>
          </div>
        </div>

        {/* Список карток по вправах */}
        {displayData.length === 0 ? (
          <div className="text-center text-gray-500 mt-10 text-sm">
            {isUk
              ? 'Ще немає даних. Вирішіть кілька прикладів!'
              : 'No data yet. Solve a few problems!'}
          </div>
        ) : (
          displayData.map((item) => {
            const isOpen = expandedRule === item.rule;
            return (
              <div
                key={item.rule}
                className="bg-gray-900 border border-gray-800 rounded-xl shadow-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleRule(item.rule)}
                  className="w-full p-4 text-left flex flex-col gap-3 active:bg-gray-800/60 transition-colors"
                >
                  <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                    <span className="font-semibold text-base text-gray-100">
                      {item.name}
                    </span>
                    <div className="flex items-center gap-2">
                      {ruleSortOrder === 'errors' && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-900/40 text-red-400 border border-red-800/60">
                          {item.errorRate}% {isUk ? 'пом.' : 'err'}
                        </span>
                      )}
                      {isOpen ? (
                        <ChevronUp size={18} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={18} className="text-gray-400" />
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider">
                        {isUk ? 'Точність' : 'Accuracy'}
                      </span>
                      <span
                        className={`text-lg font-bold ${
                          item.accuracy < 80 ? 'text-red-400' : 'text-blue-400'
                        }`}
                      >
                        {item.accuracy}%
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider">
                        {isUk ? 'Сер. час' : 'Avg time'}
                      </span>
                      <span className="text-lg font-bold text-yellow-400">
                        {item.avgTime}
                        {isUk ? 'с' : 's'}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider">
                        {isUk ? 'Вірно / Всього' : 'Correct / Total'}
                      </span>
                      <span className="text-lg font-bold text-green-400">
                        {item.correct}{' '}
                        <span className="text-gray-500 text-xs font-medium">
                          / {item.attempts}
                        </span>
                      </span>
                    </div>
                  </div>
                </button>

                {/* Розгорнута історія по днях */}
                {isOpen && (
                  <div className="bg-gray-950/70 border-t border-gray-800 px-4 py-3 flex flex-col gap-2">
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
                      {isUk ? 'Детально по днях:' : 'Daily breakdown:'}
                    </div>
                    {item.days.map((day) => {
                      const dayAcc =
                        day.attempts > 0
                          ? Math.round((day.correct / day.attempts) * 100)
                          : 0;
                      const dayAvg =
                        day.correct > 0
                          ? (day.time / day.correct / 1000).toFixed(1)
                          : '0';
                      const formattedDate = new Date(
                        day.dateStr + 'T00:00:00'
                      ).toLocaleDateString(isUk ? 'uk-UA' : 'en-US', {
                        day: '2-digit',
                        month: '2-digit',
                      });

                      return (
                        <div
                          key={day.dateStr}
                          className="flex items-center justify-between text-xs py-1.5 border-b border-gray-800/60 last:border-b-0"
                        >
                          <span className="text-gray-400 font-mono">{formattedDate}</span>
                          <span className="text-green-400 font-semibold">
                            {day.correct}/{day.attempts}{' '}
                            <span className="text-gray-500">({dayAcc}%)</span>
                          </span>
                          <span className="text-yellow-400 font-mono">
                            {dayAvg}
                            {isUk ? 'с' : 's'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

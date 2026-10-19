import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { db } from '../db';

export default function Settings() {
  const navigate = useNavigate();
  const { 
    inputDirection, setInputDirection, 
    digitCount, setDigitCount, 
    sprintDuration, setSprintDuration,
    isHighlightEnabled, setIsHighlightEnabled,
    isAdaptiveMode, setIsAdaptiveMode,
    isSoundEnabled, setIsSoundEnabled,
    isVibrationEnabled, setIsVibrationEnabled
  } = useStore();

  const clearProgress = async () => {
    if (window.confirm('Вы уверены, что хотите удалить всю статистику?')) {
      await db.stats.clear();
      alert('Прогресс сброшен!');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white p-6 pb-12">
      <div className="flex items-center mb-8 mt-4">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 mr-2 text-gray-400 active:text-white transition-colors">
          <ArrowLeft size={28} />
        </button>
        <h1 className="text-2xl font-bold text-blue-400">Настройки</h1>
      </div>

      <div className="flex flex-col gap-6 max-w-xs mx-auto w-full">
        
        {/* Звук и Вибрация */}
        <div className="flex flex-col gap-3">
          <h2 className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Отклик</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              className={`flex-1 p-3 rounded-xl text-sm font-bold transition-colors ${isSoundEnabled ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-500'}`}
            >
              {isSoundEnabled ? '🔊 Звук вкл' : '🔇 Звук выкл'}
            </button>
            <button
              onClick={() => setIsVibrationEnabled(!isVibrationEnabled)}
              className={`flex-1 p-3 rounded-xl text-sm font-bold transition-colors ${isVibrationEnabled ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-500'}`}
            >
              {isVibrationEnabled ? '📳 Вибро вкл' : '📴 Вибро выкл'}
            </button>
          </div>
        </div>

        {/* Адаптивная сложность */}
        <div className="flex flex-col gap-3">
          <h2 className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Генерация примеров</h2>
          <div className="flex flex-col gap-2 bg-gray-900 p-2 rounded-xl border border-gray-800">
            <button onClick={() => setIsAdaptiveMode(true)} className={`p-3 rounded-lg text-sm font-medium transition-colors ${isAdaptiveMode ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}>Адаптивная (Автоматически)</button>
            <button onClick={() => setIsAdaptiveMode(false)} className={`p-3 rounded-lg text-sm font-medium transition-colors ${!isAdaptiveMode ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}>Ручная (Фиксированная длина)</button>
          </div>
          
          <div className={`grid grid-cols-4 gap-2 mt-1 transition-opacity ${isAdaptiveMode ? 'opacity-30 pointer-events-none' : ''}`}>
            {[2, 3, 4, 5].map(num => (
              <button key={num} onClick={() => setDigitCount(num)} className={`py-3 rounded-xl font-bold text-lg shadow-sm transition-transform active:scale-95 ${digitCount === num ? 'bg-blue-600 text-white shadow-blue-900/50' : 'bg-gray-800 text-gray-400 active:bg-gray-700'}`}>{num}</button>
            ))}
          </div>
        </div>

        {/* Визуальная подсветка */}
        <div className="flex flex-col gap-3">
          <h2 className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Визуальная подсветка (Шаги)</h2>
          <div className="flex gap-2 bg-gray-900 p-2 rounded-xl border border-gray-800">
            <button onClick={() => setIsHighlightEnabled(true)} className={`flex-1 p-3 rounded-lg text-sm font-medium transition-colors ${isHighlightEnabled ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}>Вкл</button>
            <button onClick={() => setIsHighlightEnabled(false)} className={`flex-1 p-3 rounded-lg text-sm font-medium transition-colors ${!isHighlightEnabled ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}>Выкл</button>
          </div>
        </div>

        {/* Направление ввода */}
        <div className="flex flex-col gap-3">
          <h2 className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Направление ввода</h2>
          <div className="flex gap-2 bg-gray-900 p-2 rounded-xl border border-gray-800">
            <button onClick={() => setInputDirection('rtl')} className={`flex-1 p-3 rounded-lg text-sm font-medium transition-colors ${inputDirection === 'rtl' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}>Справа налево</button>
            <button onClick={() => setInputDirection('ltr')} className={`flex-1 p-3 rounded-lg text-sm font-medium transition-colors ${inputDirection === 'ltr' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}>Слева направо</button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Время Спринта (сек)</h2>
          <div className="grid grid-cols-3 gap-2">
            {[30, 60, 120].map(time => (
              <button key={time} onClick={() => setSprintDuration(time)} className={`py-3 rounded-xl font-bold text-lg shadow-sm transition-transform active:scale-95 ${sprintDuration === time ? 'bg-blue-600 text-white shadow-blue-900/50' : 'bg-gray-800 text-gray-400 active:bg-gray-700'}`}>{time}</button>
            ))}
          </div>
        </div>

        <div className="h-px bg-gray-800 my-2"></div>

        <button onClick={clearProgress} className="flex items-center justify-center gap-2 bg-red-900/20 text-red-500 border border-red-900/50 active:bg-red-900/40 p-4 rounded-xl text-sm font-semibold transition-colors">
          <Trash2 size={18} /> Сбросить весь прогресс
        </button>
      </div>
    </div>
  );
}
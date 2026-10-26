import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Theory() {
  const navigate = useNavigate();
  const { language } = useStore();
  const isUk = language === 'uk';

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white p-6 pb-12">
      <div className="flex items-center mb-6 mt-4">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 mr-2 text-gray-400 active:text-white transition-colors">
          <ArrowLeft size={28} />
        </button>
        <h1 className="text-2xl font-bold text-blue-400">{isUk ? 'Теорія та Правила' : 'Theory & Rules'}</h1>
      </div>

      <div className="flex flex-col gap-4 max-w-sm mx-auto w-full">
        <p className="text-gray-300 text-sm leading-relaxed mb-2">
          {isUk 
            ? 'Система Трахтенберга — це метод швидкої усної лічби. Головне правило: обчислення йдуть справа наліво. У кожної цифри є "сусід" — цифра праворуч від неї.'
            : 'The Trachtenberg system is a method for rapid mental calculation. Main rule: calculations proceed from right to left. Every digit has a "neighbor" — the digit to its right.'}
        </p>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-lg">
          <h3 className="font-bold text-emerald-400 mb-2">{isUk ? 'Швидке додавання' : 'Fast Addition'}</h3>
          <p className="text-xs text-gray-400">{isUk ? 'Розбивайте числа на зручні блоки (десятки та одиниці). Додавайте десятки до десятків, одиниці до одиниць.' : 'Break numbers into convenient blocks (tens and ones). Add tens to tens, ones to ones.'}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-lg">
          <h3 className="font-bold text-purple-400 mb-2">{isUk ? 'Множення на 11' : 'Multiply by 11'}</h3>
          <p className="text-xs text-gray-400">{isUk ? 'Остання цифра залишається без змін. Кожна наступна додається до свого правого сусіда. Найперша переписується (плюс перенос, якщо був).' : 'The last digit remains unchanged. Each subsequent digit is added to its right neighbor. The very first is rewritten (plus carry over, if any).'}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-lg">
          <h3 className="font-bold text-fuchsia-400 mb-2">{isUk ? 'Множення на 12' : 'Multiply by 12'}</h3>
          <p className="text-xs text-gray-400">{isUk ? 'Подвойте поточну цифру та додайте до неї правого сусіда.' : 'Double the current digit and add its right neighbor.'}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-lg">
          <h3 className="font-bold text-teal-400 mb-2">{isUk ? 'Множення на 6' : 'Multiply by 6'}</h3>
          <p className="text-xs text-gray-400">{isUk ? 'Додайте до цифри половину її правого сусіда (відкидаючи залишок). Якщо сама цифра непарна — додайте ще 5.' : 'Add half of its right neighbor to the digit (ignoring remainder). If the digit itself is odd, add 5.'}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-lg">
          <h3 className="font-bold text-green-400 mb-2">{isUk ? 'Множення на 5' : 'Multiply by 5'}</h3>
          <p className="text-xs text-gray-400">{isUk ? 'Візьміть половину правого сусіда (округлюючи вниз). Якщо поточна цифра непарна — додайте 5.' : 'Take half of the right neighbor (rounding down). If the current digit is odd, add 5.'}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-lg">
          <h3 className="font-bold text-red-400 mb-2">{isUk ? 'Множення на 9' : 'Multiply by 9'}</h3>
          <p className="text-xs text-gray-400 mb-1">{isUk ? '1. Перша (справа): відніміть від 10.' : '1. First (right): subtract from 10.'}</p>
          <p className="text-xs text-gray-400 mb-1">{isUk ? '2. Середні: відніміть від 9 та додайте сусіда.' : '2. Middle: subtract from 9 and add neighbor.'}</p>
          <p className="text-xs text-gray-400">{isUk ? '3. Ліва: відніміть 1 від лівої цифри.' : '3. Left: subtract 1 from the left digit.'}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-lg">
          <h3 className="font-bold text-orange-400 mb-2">{isUk ? 'Множення на 8' : 'Multiply by 8'}</h3>
          <p className="text-xs text-gray-400 mb-1">{isUk ? '1. Перша: відніміть від 10 і подвойте.' : '1. First: subtract from 10 and double.'}</p>
          <p className="text-xs text-gray-400 mb-1">{isUk ? '2. Середні: відніміть від 9, подвойте і додайте сусіда.' : '2. Middle: subtract from 9, double and add neighbor.'}</p>
          <p className="text-xs text-gray-400">{isUk ? '3. Ліва: відніміть 2.' : '3. Left: subtract 2.'}</p>
        </div>
        
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-lg">
          <h3 className="font-bold text-amber-500 mb-2">{isUk ? 'Множення на 7' : 'Multiply by 7'}</h3>
          <p className="text-xs text-gray-400">{isUk ? 'Подвойте цифру і додайте половину сусіда. Якщо непарна — плюс 5.' : 'Double the digit and add half of the neighbor. If odd, add 5.'}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-lg">
          <h3 className="font-bold text-cyan-400 mb-2">{isUk ? 'Множення на 4' : 'Multiply by 4'}</h3>
          <p className="text-xs text-gray-400">{isUk ? 'Віднімайте від 9, додавайте половину сусіда (+5 якщо непарна). Права з 10. Ліва: половина цифри мінус 1.' : 'Subtract from 9, add half of neighbor (+5 if odd). Right digit from 10. Left: half of the digit minus 1.'}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-lg">
          <h3 className="font-bold text-blue-400 mb-2">{isUk ? 'Множення на 3' : 'Multiply by 3'}</h3>
          <p className="text-xs text-gray-400">{isUk ? 'Як на 4, але потрібно ПОДВОЇТИ результат віднімання від 9 (або 10 для першої). Ліва: половина мінус 2.' : 'Like multiplying by 4, but DOUBLE the result of subtraction from 9 (or 10 for the first). Left: half minus 2.'}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-lg">
          <h3 className="font-bold text-indigo-400 mb-2">{isUk ? 'Множення на 2' : 'Multiply by 2'}</h3>
          <p className="text-xs text-gray-400">{isUk ? 'Просто подвойте поточну цифру, переносячи десятки в умі.' : 'Just double the current digit, carrying tens in your mind.'}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-lg">
          <h3 className="font-bold text-rose-400 mb-2">{isUk ? 'Піднесення до квадрата' : 'Squaring'}</h3>
          <p className="text-xs text-gray-400">{isUk ? 'Спочатку квадрат одиниць, потім подвоєний добуток десятків на одиниці, потім квадрат десятків (a², 2ab, b²).' : 'First the square of the ones, then double the product of tens and ones, then the square of the tens (a², 2ab, b²).'}</p>
        </div>
      </div>
    </div>
  );
}
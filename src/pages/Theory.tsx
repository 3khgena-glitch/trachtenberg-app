import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import type { RuleType } from '../store/useStore';
import { ArrowLeft, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

interface RuleGuide {
  id: RuleType;
  badge: string;
  color: string;
  titleUk: string;
  titleEn: string;
  shortUk: string;
  shortEn: string;
  stepsUk: string[];
  stepsEn: string[];
  exampleTitle: string;
  exampleStepsUk: string[];
  exampleStepsEn: string[];
  exampleResult: string;
}

const RULES_GUIDE: RuleGuide[] = [
  {
    id: 'add',
    badge: '+',
    color: 'bg-emerald-700',
    titleUk: 'Швидке додавання',
    titleEn: 'Fast Addition',
    shortUk: 'Додавайте розряд за розрядом справа наліво або розбивайте числа на десятки й одиниці.',
    shortEn: 'Add digit by digit from right to left, or break numbers into tens and units.',
    stepsUk: [
      'Складайте одиниці з одиницями, десятки з десятками (справа наліво).',
      'Якщо сума в розряді 10 або більше — записуйте останню цифру, а 1 переносьте в наступний розряд.',
      'Або розбивайте друге число на зручні частини: спочатку додайте десятки, потім одиниці.'
    ],
    stepsEn: [
      'Add units with units, tens with tens (right to left).',
      'If a column sum is 10 or more, write down the last digit and carry 1 to the next step.',
      'Alternatively, split the second number: add the tens first, then the units.'
    ],
    exampleTitle: '47 + 38',
    exampleStepsUk: [
      'Одиниці: 7 + 8 = 15 → пишемо 5, 1 в умі',
      'Десятки: 4 + 3 + 1 (в умі) = 8'
    ],
    exampleStepsEn: [
      'Units: 7 + 8 = 15 → write 5, carry 1',
      'Tens: 4 + 3 + 1 (carry) = 8'
    ],
    exampleResult: '85'
  },
  {
    id: 'x11',
    badge: '×11',
    color: 'bg-purple-700',
    titleUk: 'Множення на 11',
    titleEn: 'Multiply by 11',
    shortUk: 'Додайте кожну цифру до її сусіда справа.',
    shortEn: 'Add each digit to its right neighbor.',
    stepsUk: [
      'Уявіть попереду числа нуль (0).',
      'Рухайтесь справа наліво: до поточної цифри додавайте її правого сусіда.',
      'Якщо вийшло двозначне число — запишіть останню цифру, а десяток додайте на наступному кроці.'
    ],
    stepsEn: [
      'Put an imaginary zero (0) in front of the number.',
      'Move right to left: add the current digit to its right neighbor.',
      'If the sum is 10 or more, write down the last digit and carry 1 to the next step.'
    ],
    exampleTitle: '632 × 11  (уявно: 0632)',
    exampleStepsUk: [
      'Цифра 2 (сусіда немає): 2 + 0 = 2',
      'Цифра 3 (сусід 2): 3 + 2 = 5',
      'Цифра 6 (сусід 3): 6 + 3 = 9',
      'Уявний 0 (сусід 6): 0 + 6 = 6'
    ],
    exampleStepsEn: [
      'Digit 2 (no neighbor): 2 + 0 = 2',
      'Digit 3 (neighbor 2): 3 + 2 = 5',
      'Digit 6 (neighbor 3): 6 + 3 = 9',
      'Imaginary 0 (neighbor 6): 0 + 6 = 6'
    ],
    exampleResult: '6952'
  },
  {
    id: 'x12',
    badge: '×12',
    color: 'bg-fuchsia-700',
    titleUk: 'Множення на 12',
    titleEn: 'Multiply by 12',
    shortUk: 'Подвойте кожну цифру і додайте сусіда справа.',
    shortEn: 'Double each digit and add its right neighbor.',
    stepsUk: [
      'Уявіть попереду числа нуль (0).',
      'Рухайтесь справа наліво: помножте поточну цифру на 2 і додайте її правого сусіда.',
      'Десятки переносьте на наступний крок.'
    ],
    stepsEn: [
      'Put an imaginary zero (0) in front of the number.',
      'Move right to left: double the current digit and add its right neighbor.',
      'Carry over any tens to the next step.'
    ],
    exampleTitle: '314 × 12  (уявно: 0314)',
    exampleStepsUk: [
      'Цифра 4 (сусід 0): 4×2 + 0 = 8',
      'Цифра 1 (сусід 4): 1×2 + 4 = 6',
      'Цифра 3 (сусід 1): 3×2 + 1 = 7',
      'Уявний 0 (сусід 3): 0×2 + 3 = 3'
    ],
    exampleStepsEn: [
      'Digit 4 (neighbor 0): 4×2 + 0 = 8',
      'Digit 1 (neighbor 4): 1×2 + 4 = 6',
      'Digit 3 (neighbor 1): 3×2 + 1 = 7',
      'Imaginary 0 (neighbor 3): 0×2 + 3 = 3'
    ],
    exampleResult: '3768'
  },
  {
    id: 'x6',
    badge: '×6',
    color: 'bg-teal-700',
    titleUk: 'Множення на 6',
    titleEn: 'Multiply by 6',
    shortUk: 'До цифри додайте половину сусіда. Якщо цифра непарна — додайте ще 5.',
    shortEn: 'Add half of the neighbor to the digit. If the digit is odd, add 5.',
    stepsUk: [
      'Уявіть попереду числа нуль (0).',
      'Візьміть поточну цифру і додайте ПОЛОВИНУ її правого сусіда (залишок відкидаємо: половина від 3 — це 1).',
      'Якщо сама поточна цифра непарна (1, 3, 5, 7, 9) — додайте ще 5.'
    ],
    stepsEn: [
      'Put an imaginary zero (0) in front of the number.',
      'Take the current digit and add HALF of its right neighbor (drop remainders: half of 3 is 1).',
      'If the current digit itself is odd (1, 3, 5, 7, 9), add 5.'
    ],
    exampleTitle: '342 × 6  (уявно: 0342)',
    exampleStepsUk: [
      'Цифра 2 (парна, сусід 0): 2 + 0 = 2',
      'Цифра 4 (парна, сусід 2): 4 + 1 = 5',
      'Цифра 3 (непарна, сусід 4): 3 + 2 + 5 = 10 → пишемо 0, 1 в умі',
      'Уявний 0 (сусід 3, половина = 1): 0 + 1 + 1 (в умі) = 2'
    ],
    exampleStepsEn: [
      'Digit 2 (even, neighbor 0): 2 + 0 = 2',
      'Digit 4 (even, neighbor 2): 4 + 1 = 5',
      'Digit 3 (odd, neighbor 4): 3 + 2 + 5 = 10 → write 0, carry 1',
      'Imaginary 0 (neighbor 3, half = 1): 0 + 1 + 1 (carry) = 2'
    ],
    exampleResult: '2052'
  },
  {
    id: 'x5',
    badge: '×5',
    color: 'bg-green-700',
    titleUk: 'Множення на 5',
    titleEn: 'Multiply by 5',
    shortUk: 'Візьміть половину сусіда справа. Якщо поточна цифра непарна — додайте 5.',
    shortEn: 'Take half of the right neighbor. If the current digit is odd, add 5.',
    stepsUk: [
      'Уявіть попереду числа нуль (0).',
      'Візьміть ПОЛОВИНУ правого сусіда (без залишку).',
      'Якщо поточна цифра непарна — додайте 5. Якщо парна — нічого не додавайте.'
    ],
    stepsEn: [
      'Put an imaginary zero (0) in front of the number.',
      'Take HALF of the right neighbor (drop any remainder).',
      'If the current digit is odd, add 5. If even, add nothing.'
    ],
    exampleTitle: '436 × 5  (уявно: 0436)',
    exampleStepsUk: [
      'Цифра 6 (парна, сусід 0): 0',
      'Цифра 3 (непарна, сусід 6): 3 + 5 = 8',
      'Цифра 4 (парна, сусід 3, половина = 1): 1',
      'Уявний 0 (парна, сусід 4): 2'
    ],
    exampleStepsEn: [
      'Digit 6 (even, neighbor 0): 0',
      'Digit 3 (odd, neighbor 6): 3 + 5 = 8',
      'Digit 4 (even, neighbor 3, half = 1): 1',
      'Imaginary 0 (even, neighbor 4): 2'
    ],
    exampleResult: '2180'
  },
  {
    id: 'x9',
    badge: '×9',
    color: 'bg-red-700',
    titleUk: 'Множення на 9',
    titleEn: 'Multiply by 9',
    shortUk: 'Перша цифра: відняти від 10. Середні: від 9 + сусід. Остання (0): сусід мінус 1.',
    shortEn: 'First digit: subtract from 10. Middle: from 9 + neighbor. Leftmost (0): neighbor minus 1.',
    stepsUk: [
      'Крок 1 (найправіша цифра): відніміть її від 10.',
      'Крок 2 (усі середні цифри): відніміть цифру від 9 і додайте правого сусіда.',
      'Крок 3 (уявний 0 зліва): візьміть правого сусіда (першу цифру числа) і відніміть 1.'
    ],
    stepsEn: [
      'Step 1 (rightmost digit): subtract it from 10.',
      'Step 2 (middle digits): subtract the digit from 9 and add its right neighbor.',
      'Step 3 (imaginary 0 on left): take its right neighbor and subtract 1.'
    ],
    exampleTitle: '342 × 9  (уявно: 0342)',
    exampleStepsUk: [
      'Цифра 2 (перша): 10 − 2 = 8',
      'Цифра 4 (сусід 2): (9 − 4) + 2 = 7',
      'Цифра 3 (сусід 4): (9 − 3) + 4 = 10 → пишемо 0, 1 в умі',
      'Уявний 0 (сусід 3): (3 − 1) + 1 (в умі) = 3'
    ],
    exampleStepsEn: [
      'Digit 2 (first): 10 − 2 = 8',
      'Digit 4 (neighbor 2): (9 − 4) + 2 = 7',
      'Digit 3 (neighbor 4): (9 − 3) + 4 = 10 → write 0, carry 1',
      'Imaginary 0 (neighbor 3): (3 − 1) + 1 (carry) = 3'
    ],
    exampleResult: '3078'
  },
  {
    id: 'x8',
    badge: '×8',
    color: 'bg-orange-700',
    titleUk: 'Множення на 8',
    titleEn: 'Multiply by 8',
    shortUk: 'Як на 9, але різницю подвоюємо, а в кінці віднімаємо 2.',
    shortEn: 'Like ×9, but double the subtraction result, and subtract 2 at the end.',
    stepsUk: [
      'Крок 1 (найправіша цифра): відніміть від 10 і подвойте.',
      'Крок 2 (середні цифри): відніміть від 9, подвойте і додайте правого сусіда.',
      'Крок 3 (уявний 0 зліва): візьміть правого сусіда і відніміть 2.'
    ],
    stepsEn: [
      'Step 1 (rightmost digit): subtract from 10 and double.',
      'Step 2 (middle digits): subtract from 9, double, and add the right neighbor.',
      'Step 3 (imaginary 0 on left): take its right neighbor and subtract 2.'
    ],
    exampleTitle: '423 × 8  (уявно: 0423)',
    exampleStepsUk: [
      'Цифра 3: (10 − 3)×2 = 14 → пишемо 4, 1 в умі',
      'Цифра 2 (сусід 3): (9 − 2)×2 + 3 + 1 = 18 → пишемо 8, 1 в умі',
      'Цифра 4 (сусід 2): (9 − 4)×2 + 2 + 1 = 13 → пишемо 3, 1 в умі',
      'Уявний 0 (сусід 4): (4 − 2) + 1 = 3'
    ],
    exampleStepsEn: [
      'Digit 3: (10 − 3)×2 = 14 → write 4, carry 1',
      'Digit 2 (neighbor 3): (9 − 2)×2 + 3 + 1 = 18 → write 8, carry 1',
      'Digit 4 (neighbor 2): (9 − 4)×2 + 2 + 1 = 13 → write 3, carry 1',
      'Imaginary 0 (neighbor 4): (4 − 2) + 1 = 3'
    ],
    exampleResult: '3384'
  },
  {
    id: 'x7',
    badge: '×7',
    color: 'bg-amber-600',
    titleUk: 'Множення на 7',
    titleEn: 'Multiply by 7',
    shortUk: 'Подвойте цифру і додайте половину сусіда. Якщо цифра непарна — додайте ще 5.',
    shortEn: 'Double the digit and add half of the neighbor. If the digit is odd, add 5.',
    stepsUk: [
      'Уявіть попереду числа нуль (0).',
      'Подвойте поточну цифру і додайте ПОЛОВИНУ правого сусіда (без залишку).',
      'Якщо поточна цифра непарна — додайте ще 5.'
    ],
    stepsEn: [
      'Put an imaginary zero (0) in front of the number.',
      'Double the current digit and add HALF of its right neighbor (drop remainder).',
      'If the current digit is odd, add 5.'
    ],
    exampleTitle: '234 × 7  (уявно: 0234)',
    exampleStepsUk: [
      'Цифра 4 (парна, сусід 0): 4×2 + 0 = 8',
      'Цифра 3 (непарна, сусід 4): 3×2 + 2 + 5 = 13 → пишемо 3, 1 в умі',
      'Цифра 2 (парна, сусід 3, половина = 1): 2×2 + 1 + 1 = 6',
      'Уявний 0 (сусід 2): 0×2 + 1 = 1'
    ],
    exampleStepsEn: [
      'Digit 4 (even, neighbor 0): 4×2 + 0 = 8',
      'Digit 3 (odd, neighbor 4): 3×2 + 2 + 5 = 13 → write 3, carry 1',
      'Digit 2 (even, neighbor 3, half = 1): 2×2 + 1 + 1 = 6',
      'Imaginary 0 (neighbor 2): 0×2 + 1 = 1'
    ],
    exampleResult: '1638'
  },
  {
    id: 'x4',
    badge: '×4',
    color: 'bg-cyan-700',
    titleUk: 'Множення на 4',
    titleEn: 'Multiply by 4',
    shortUk: 'Перша: від 10 (+5 якщо непарна). Середні: від 9 + половина сусіда (+5 якщо непарна). Остання: половина сусіда мінус 1.',
    shortEn: 'First: from 10 (+5 if odd). Middle: from 9 + half neighbor (+5 if odd). Leftmost: half neighbor minus 1.',
    stepsUk: [
      'Крок 1 (найправіша цифра): відніміть від 10. Якщо цифра непарна — додайте 5.',
      'Крок 2 (середні цифри): відніміть від 9, додайте половину сусіда. Якщо цифра непарна — додайте 5.',
      'Крок 3 (уявний 0 зліва): візьміть половину правого сусіда і відніміть 1.'
    ],
    stepsEn: [
      'Step 1 (rightmost): subtract from 10 (+5 if odd).',
      'Step 2 (middle): subtract from 9, add half of neighbor (+5 if odd).',
      'Step 3 (imaginary 0): take half of right neighbor minus 1.'
    ],
    exampleTitle: '324 × 4  (уявно: 0324)',
    exampleStepsUk: [
      'Цифра 4 (парна): 10 − 4 = 6',
      'Цифра 2 (парна, сусід 4): (9 − 2) + 2 = 9',
      'Цифра 3 (непарна, сусід 2): (9 − 3) + 1 + 5 = 12 → пишемо 2, 1 в умі',
      'Уявний 0 (сусід 3, половина = 1): (1 − 1) + 1 = 1'
    ],
    exampleStepsEn: [
      'Digit 4 (even): 10 − 4 = 6',
      'Digit 2 (even, neighbor 4): (9 − 2) + 2 = 9',
      'Digit 3 (odd, neighbor 2): (9 − 3) + 1 + 5 = 12 → write 2, carry 1',
      'Imaginary 0 (neighbor 3, half = 1): (1 − 1) + 1 = 1'
    ],
    exampleResult: '1296'
  },
  {
    id: 'x3',
    badge: '×3',
    color: 'bg-blue-700',
    titleUk: 'Множення на 3',
    titleEn: 'Multiply by 3',
    shortUk: 'Перша: (10 − цифра)×2 (+5 якщо непарна). Середні: (9 − цифра)×2 + половина сусіда (+5 якщо непарна). Остання: половина мінус 2.',
    shortEn: 'First: (10 − digit)×2 (+5 if odd). Middle: (9 − digit)×2 + half neighbor (+5 if odd). Leftmost: half minus 2.',
    stepsUk: [
      'Крок 1 (найправіша цифра): відніміть від 10, подвойте. Якщо цифра непарна — додайте 5.',
      'Крок 2 (середні цифри): відніміть від 9, подвойте, додайте половину сусіда. Якщо цифра непарна — додайте 5.',
      'Крок 3 (уявний 0 зліва): візьміть половину правого сусіда і відніміть 2.'
    ],
    stepsEn: [
      'Step 1 (rightmost): subtract from 10, double (+5 if odd).',
      'Step 2 (middle): subtract from 9, double, add half of neighbor (+5 if odd).',
      'Step 3 (imaginary 0): take half of right neighbor minus 2.'
    ],
    exampleTitle: '426 × 3  (уявно: 0426)',
    exampleStepsUk: [
      'Цифра 6 (парна): (10 − 6)×2 = 8',
      'Цифра 2 (парна, сусід 6): (9 − 2)×2 + 3 = 17 → пишемо 7, 1 в умі',
      'Цифра 4 (парна, сусід 2): (9 − 4)×2 + 1 + 1 = 12 → пишемо 2, 1 в умі',
      'Уявний 0 (сусід 4, половина = 2): (2 − 2) + 1 = 1'
    ],
    exampleStepsEn: [
      'Digit 6 (even): (10 − 6)×2 = 8',
      'Digit 2 (even, neighbor 6): (9 − 2)×2 + 3 = 17 → write 7, carry 1',
      'Digit 4 (even, neighbor 2): (9 − 4)×2 + 1 + 1 = 12 → write 2, carry 1',
      'Imaginary 0 (neighbor 4, half = 2): (2 − 2) + 1 = 1'
    ],
    exampleResult: '1278'
  },
  {
    id: 'x2',
    badge: '×2',
    color: 'bg-indigo-700',
    titleUk: 'Множення на 2',
    titleEn: 'Multiply by 2',
    shortUk: 'Просто подвоюйте кожну цифру справа наліво.',
    shortEn: 'Simply double each digit from right to left.',
    stepsUk: [
      'Рухайтесь справа наліво і множте кожну цифру на 2.',
      'Якщо вийшло 10 або більше — записуйте останню цифру, а 1 переносьте в наступний крок.'
    ],
    stepsEn: [
      'Move right to left and double each digit.',
      'If the result is 10 or more, write the last digit and carry 1 to the next step.'
    ],
    exampleTitle: '364 × 2',
    exampleStepsUk: [
      'Цифра 4: 4×2 = 8',
      'Цифра 6: 6×2 = 12 → пишемо 2, 1 в умі',
      'Цифра 3: 3×2 + 1 = 7'
    ],
    exampleStepsEn: [
      'Digit 4: 4×2 = 8',
      'Digit 6: 6×2 = 12 → write 2, carry 1',
      'Digit 3: 3×2 + 1 = 7'
    ],
    exampleResult: '728'
  },
  {
    id: 'square',
    badge: 'x²',
    color: 'bg-rose-700',
    titleUk: 'Піднесення до квадрата',
    titleEn: 'Squaring Numbers',
    shortUk: 'Для двозначного числа ab рахуйте справа наліво: b², потім 2×a×b, потім a².',
    shortEn: 'For a 2-digit number ab, compute right to left: b², then 2×a×b, then a².',
    stepsUk: [
      'Крок 1: піднесіть до квадрата останню цифру (b²). Запишіть одиниці, десятки — в умі.',
      'Крок 2: помножте цифри між собою і подвойте (2 × a × b), додайте те, що в умі.',
      'Крок 3: піднесіть до квадрата першу цифру (a²) і додайте те, що в умі.'
    ],
    stepsEn: [
      'Step 1: square the last digit (b²). Write the unit digit, carry the tens.',
      'Step 2: multiply the digits together and double (2 × a × b), plus carry.',
      'Step 3: square the first digit (a²) and add carry.'
    ],
    exampleTitle: '34²  (a = 3, b = 4)',
    exampleStepsUk: [
      'b² = 4² = 16 → пишемо 6, 1 в умі',
      '2×a×b = 2×3×4 = 24, + 1 (в умі) = 25 → пишемо 5, 2 в умі',
      'a² = 3² = 9, + 2 (в умі) = 11'
    ],
    exampleStepsEn: [
      'b² = 4² = 16 → write 6, carry 1',
      '2×a×b = 2×3×4 = 24, + 1 (carry) = 25 → write 5, carry 2',
      'a² = 3² = 9, + 2 (carry) = 11'
    ],
    exampleResult: '1156'
  }
];

export default function Theory() {
  const navigate = useNavigate();
  const { language } = useStore();
  const isUk = language === 'uk';

  const [expandedIds, setExpandedIds] = useState<RuleType[]>(['x11']);

  const toggleRule = (id: RuleType) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const allExpanded = expandedIds.length === RULES_GUIDE.length;
  const toggleAll = () => {
    setExpandedIds(allExpanded ? [] : RULES_GUIDE.map((r) => r.id));
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white p-6 pb-12">
      <div className="flex items-center justify-between mb-6 mt-4 max-w-md mx-auto w-full">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/')}
            className="p-2 -ml-2 mr-2 text-gray-400 active:text-white transition-colors"
          >
            <ArrowLeft size={28} />
          </button>
          <h1 className="text-2xl font-bold text-blue-400 flex items-center gap-2">
            <BookOpen size={24} />
            {isUk ? 'Звід правил' : 'Rules Guide'}
          </h1>
        </div>
        <button
          onClick={toggleAll}
          className="text-xs font-semibold text-blue-400 bg-gray-900 border border-gray-800 px-3 py-2 rounded-lg active:bg-gray-800"
        >
          {allExpanded
            ? isUk ? 'Згорнути всі' : 'Collapse all'
            : isUk ? 'Розгорнути всі' : 'Expand all'}
        </button>
      </div>

      <div className="flex flex-col gap-4 max-w-md mx-auto w-full">
        {/* Базові принципи для новачків */}
        <div className="bg-blue-950/30 border border-blue-800/50 rounded-2xl p-4 text-sm text-gray-200 leading-relaxed">
          <h2 className="text-blue-400 font-bold text-base mb-2">
            {isUk ? 'Головні принципи методу Трахтенберга' : 'Core Principles of the Trachtenberg Method'}
          </h2>
          <ul className="space-y-1.5 text-gray-300 text-xs">
            <li>
              • <strong className="text-white">{isUk ? 'Справа наліво:' : 'Right to left:'}</strong>{' '}
              {isUk
                ? 'відповідь завжди обчислюється і записується по одній цифрі з кінця числа.'
                : 'the answer is always computed and written one digit at a time from the end.'}
            </li>
            <li>
              • <strong className="text-white">{isUk ? 'Уявний нуль (0):' : 'Imaginary zero (0):'}</strong>{' '}
              {isUk
                ? 'перед початком числа подумки дописуємо 0 зліва — це останній крок розрахунку.'
                : 'mentally place a 0 in front of the number — it gives the leftmost digit of the answer.'}
            </li>
            <li>
              • <strong className="text-white">{isUk ? 'Сусід:' : 'Neighbor:'}</strong>{' '}
              {isUk
                ? 'це завжди цифра, що стоїть праворуч від поточної. У найправішої цифри сусіда немає (він = 0).'
                : 'always the digit immediately to the right. The rightmost digit has no neighbor (0).'}
            </li>
            <li>
              • <strong className="text-white">{isUk ? 'Половина цифри:' : 'Half a digit:'}</strong>{' '}
              {isUk
                ? 'ділимо на 2 і відкидаємо залишок (половина від 5 = 2, від 7 = 3, від 1 = 0).'
                : 'divide by 2 and drop any remainder (half of 5 = 2, half of 7 = 3, half of 1 = 0).'}
            </li>
          </ul>
        </div>

        {/* Список усіх 12 правил */}
        {RULES_GUIDE.map((rule) => {
          const isOpen = expandedIds.includes(rule.id);
          return (
            <div
              key={rule.id}
              className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-md"
            >
              <button
                onClick={() => toggleRule(rule.id)}
                className="w-full p-4 flex items-center justify-between text-left active:bg-gray-800/70 transition-colors"
              >
                <div className="flex items-center gap-3 pr-2">
                  <span
                    className={`${rule.color} text-white font-bold text-sm px-2.5 py-1 rounded-lg min-w-[44px] text-center`}
                  >
                    {rule.badge}
                  </span>
                  <div>
                    <div className="font-bold text-base text-white">
                      {isUk ? rule.titleUk : rule.titleEn}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5 leading-snug">
                      {isUk ? rule.shortUk : rule.shortEn}
                    </div>
                  </div>
                </div>
                {isOpen ? (
                  <ChevronUp size={20} className="text-gray-400 shrink-0" />
                ) : (
                  <ChevronDown size={20} className="text-gray-400 shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-2 border-t border-gray-800 flex flex-col gap-3 text-sm">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold mb-1.5">
                      {isUk ? 'Алгоритм:' : 'Algorithm:'}
                    </div>
                    <ol className="list-decimal list-inside space-y-1 text-gray-200 text-xs leading-relaxed">
                      {(isUk ? rule.stepsUk : rule.stepsEn).map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="bg-gray-950 border border-gray-800 rounded-xl p-3">
                    <div className="text-xs font-bold text-blue-400 mb-1.5">
                      {isUk ? 'Приклад:' : 'Example:'} {rule.exampleTitle}
                    </div>
                    <ul className="space-y-1 text-xs text-gray-300 font-mono">
                      {(isUk ? rule.exampleStepsUk : rule.exampleStepsEn).map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ul>
                    <div className="mt-2 pt-2 border-t border-gray-800 text-xs font-bold text-green-400">
                      {isUk ? 'Відповідь:' : 'Answer:'} {rule.exampleResult}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

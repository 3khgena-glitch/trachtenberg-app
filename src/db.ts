import Dexie, { type Table } from 'dexie';
import type { RuleType } from './store/useStore';

export interface SessionStat {
  id?: number;
  rule: RuleType;
  date: string;
  correctAnswers: number;
  totalAttempts: number;
  totalTime: number; // Час у мілісекундах
}

export class TrachtenbergDB extends Dexie {
  stats!: Table<SessionStat>;

  constructor() {
    super('TrachtenbergDB');
    // Збільшуємо версію до 2, щоб Dexie оновила структуру
    this.version(2).stores({
      stats: '++id, rule, date'
    });
  }
}

export const db = new TrachtenbergDB();
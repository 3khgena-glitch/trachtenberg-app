import { create } from 'zustand';

export type RuleType = 'add' | 'x11' | 'x12' | 'x6' | 'x5' | 'x9' | 'x8' | 'x7' | 'x4' | 'x3' | 'x2' | 'square';

interface AppState {
  inputDirection: 'rtl' | 'ltr';
  setInputDirection: (dir: 'rtl' | 'ltr') => void;
  activeRule: RuleType;
  setActiveRule: (rule: RuleType) => void;
  digitCount: number;
  setDigitCount: (count: number) => void;
  isMixedMode: boolean;
  setIsMixedMode: (isMixed: boolean) => void;
  isSprintMode: boolean;
  setIsSprintMode: (isSprint: boolean) => void;
  sprintDuration: number;
  setSprintDuration: (duration: number) => void;
  isHighlightEnabled: boolean;
  setIsHighlightEnabled: (enabled: boolean) => void;
  isAdaptiveMode: boolean;
  setIsAdaptiveMode: (adaptive: boolean) => void;
  isDailyChallenge: boolean;
  setIsDailyChallenge: (isDaily: boolean) => void;
  isSoundEnabled: boolean;
  setIsSoundEnabled: (enabled: boolean) => void;
  isVibrationEnabled: boolean;
  setIsVibrationEnabled: (enabled: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  inputDirection: 'rtl',
  setInputDirection: (dir) => set({ inputDirection: dir }),
  activeRule: 'add',
  setActiveRule: (rule) => set({ activeRule: rule }),
  digitCount: 2,
  setDigitCount: (count) => set({ digitCount: count }),
  isMixedMode: false,
  setIsMixedMode: (isMixed) => set({ isMixedMode: isMixed }),
  isSprintMode: false,
  setIsSprintMode: (isSprint) => set({ isSprintMode: isSprint }),
  sprintDuration: 60,
  setSprintDuration: (duration) => set({ sprintDuration: duration }),
  isHighlightEnabled: true,
  setIsHighlightEnabled: (enabled) => set({ isHighlightEnabled: enabled }),
  isAdaptiveMode: false,
  setIsAdaptiveMode: (adaptive) => set({ isAdaptiveMode: adaptive }),
  isDailyChallenge: false,
  setIsDailyChallenge: (isDaily) => set({ isDailyChallenge: isDaily }),
  isSoundEnabled: true, // Звук включен по умолчанию
  setIsSoundEnabled: (enabled) => set({ isSoundEnabled: enabled }),
  isVibrationEnabled: true, // Вибрация включена
  setIsVibrationEnabled: (enabled) => set({ isVibrationEnabled: enabled }),
}));
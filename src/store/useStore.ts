import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RuleType } from '../data/rules';

export type { RuleType };
export type Language = 'uk' | 'en';
export type SortOrder = 'default' | 'errors';

interface AppState {
  language: Language;
  setLanguage: (lang: Language) => void;
  ruleSortOrder: SortOrder;
  setRuleSortOrder: (order: SortOrder) => void;
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
  unlockedRules: RuleType[];
  setUnlockedRules: (rules: RuleType[]) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      language: 'uk',
      setLanguage: (lang) => set({ language: lang }),
      ruleSortOrder: 'default',
      setRuleSortOrder: (order) => set({ ruleSortOrder: order }),
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
      isSoundEnabled: true,
      setIsSoundEnabled: (enabled) => set({ isSoundEnabled: enabled }),
      isVibrationEnabled: true,
      setIsVibrationEnabled: (enabled) => set({ isVibrationEnabled: enabled }),
      unlockedRules: ['add'],
      setUnlockedRules: (rules) => set({ unlockedRules: rules }),
    }),
    {
      name: 'trachtenberg-settings',
      partialize: (state) => ({
        language: state.language,
        ruleSortOrder: state.ruleSortOrder,
        inputDirection: state.inputDirection,
        activeRule: state.activeRule,
        digitCount: state.digitCount,
        sprintDuration: state.sprintDuration,
        isHighlightEnabled: state.isHighlightEnabled,
        isAdaptiveMode: state.isAdaptiveMode,
        isSoundEnabled: state.isSoundEnabled,
        isVibrationEnabled: state.isVibrationEnabled,
        unlockedRules: state.unlockedRules,
      }),
    }
  )
);

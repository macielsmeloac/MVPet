import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BusinessPlan } from '../types';

interface AppState {
  currentPlan: BusinessPlan;
  sidebarCollapsed: boolean;
  darkMode: boolean;
  searchQuery: string;
  isSuperAdminMode: boolean;
  setPlan: (plan: BusinessPlan) => void;
  toggleSidebar: () => void;
  toggleDarkMode: () => void;
  setSearchQuery: (query: string) => void;
  toggleSuperAdminMode: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentPlan: 'complete',
      sidebarCollapsed: false,
      darkMode: false,
      searchQuery: '',
      isSuperAdminMode: false,
      setPlan: (plan) => set({ currentPlan: plan }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
      setSearchQuery: (query) => set({ searchQuery: query }),
      toggleSuperAdminMode: () => set((s) => ({ isSuperAdminMode: !s.isSuperAdminMode })),
    }),
    { name: 'mvpet-app' }
  )
);

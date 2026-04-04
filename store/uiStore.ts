import { create } from 'zustand';

export type NavPosition = 'top' | 'bottom' | 'left' | 'right';

interface UiState {
  navPosition: NavPosition;
  setNavPosition: (pos: NavPosition) => void;
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  navPosition: 'bottom',
  setNavPosition: (pos) => set({ navPosition: pos }),
  isSidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
}));

import { effect, Injectable, signal, computed } from '@angular/core';

export type ThemeName = 'default' | 'forest' | 'sunset' | 'ocean' | 'lavender' | 'graphite';

export interface Theme {
  name: ThemeName;
  displayName: string;
  color: string; // e.g., 'blue', 'emerald', 'rose'
  swatchClass: string; // e.g., 'bg-blue-500'
}

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  themes: Theme[] = [
    { name: 'default', displayName: 'Default', color: 'blue', swatchClass: 'bg-blue-500' },
    { name: 'forest', displayName: 'Forest', color: 'emerald', swatchClass: 'bg-emerald-500' },
    { name: 'sunset', displayName: 'Sunset', color: 'rose', swatchClass: 'bg-rose-500' },
    { name: 'ocean', displayName: 'Ocean', color: 'cyan', swatchClass: 'bg-cyan-500' },
    { name: 'lavender', displayName: 'Lavender', color: 'violet', swatchClass: 'bg-violet-500' },
    { name: 'graphite', displayName: 'Graphite', color: 'slate', swatchClass: 'bg-slate-500' },
  ];

  isDarkMode = signal<boolean>(false);
  activeThemeName = signal<ThemeName>('default');

  activeTheme = computed(() => this.themes.find(t => t.name === this.activeThemeName())!);
  primaryColor = computed(() => this.activeTheme().color);

  private colorMap: Record<string, Record<string, string>> = {
    blue: {
      50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa',
      500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a', 950: '#172554'
    },
    emerald: {
      50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399',
      500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b', 950: '#022c22'
    },
    rose: {
      50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af', 400: '#fb7185',
      500: '#f43f5e', 600: '#e11d48', 700: '#be123c', 800: '#9f1239', 900: '#881337', 950: '#4c0519'
    },
    cyan: {
      50: '#ecfeff', 100: '#cffafe', 200: '#a5f3fc', 300: '#67e8f9', 400: '#22d3ee',
      500: '#06b6d4', 600: '#0891b2', 700: '#0e7490', 800: '#155e75', 900: '#164e63', 950: '#083344'
    },
    violet: {
      50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd', 400: '#a78bfa',
      500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9', 800: '#5b21b6', 900: '#4c1d95', 950: '#2e1065'
    },
    slate: {
      50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8',
      500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a', 950: '#020617'
    }
  };

  constructor() {
    // Dark mode handling
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.isDarkMode.set(prefersDark);
    
    // Theme handling
    const savedTheme = localStorage.getItem('themeName') as ThemeName | null;
    if (savedTheme && this.themes.some(t => t.name === savedTheme)) {
      this.activeThemeName.set(savedTheme);
    } else {
      this.activeThemeName.set('default');
    }

    effect(() => {
        const themeName = this.activeThemeName();
        localStorage.setItem('themeName', themeName);
        this.updateCssVariables();
    });

    effect(() => {
        document.documentElement.classList.toggle('dark', this.isDarkMode());
    });
  }

  private updateCssVariables(): void {
    const color = this.primaryColor();
    const shades = this.colorMap[color];
    if (shades) {
      Object.entries(shades).forEach(([shade, hex]) => {
        document.documentElement.style.setProperty(`--primary-${shade}`, hex);
      });
    }
  }

  setTheme(themeName: ThemeName): void {
    this.activeThemeName.set(themeName);
  }
}
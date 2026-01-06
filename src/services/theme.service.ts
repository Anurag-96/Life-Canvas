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
    });

    effect(() => {
        document.documentElement.classList.toggle('dark', this.isDarkMode());
    });
  }

  setTheme(themeName: ThemeName): void {
    this.activeThemeName.set(themeName);
  }
}
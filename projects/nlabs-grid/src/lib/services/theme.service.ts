import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark' | 'auto';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'nlabs-grid-theme';
  
  // Current theme signal
  theme = signal<Theme>(this.getInitialTheme());
  
  // Computed effective theme (resolves 'auto' to actual theme)
  effectiveTheme = signal<'light' | 'dark'>('light');

  constructor() {
    // Apply theme on change
    effect(() => {
      const theme = this.theme();
      const effective = this.resolveTheme(theme);
      this.effectiveTheme.set(effective);
      this.applyTheme(effective);
      this.saveTheme(theme);
    });

    // Listen to system theme changes
    if (typeof window !== 'undefined') {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (this.theme() === 'auto') {
          this.effectiveTheme.set(e.matches ? 'dark' : 'light');
          this.applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  }

  private getInitialTheme(): Theme {
    if (typeof window === 'undefined') {
      return 'light';
    }

    const saved = localStorage.getItem(this.THEME_KEY) as Theme;
    if (saved && ['light', 'dark', 'auto'].includes(saved)) {
      return saved;
    }

    // Default to light instead of auto
    return 'light';
  }

  private resolveTheme(theme: Theme): 'light' | 'dark' {
    if (theme !== 'auto') {
      return theme;
    }

    if (typeof window === 'undefined') {
      return 'light';
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private applyTheme(theme: 'light' | 'dark'): void {
    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.setAttribute('data-theme', theme);
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${theme}-theme`);
  }

  private saveTheme(theme: Theme): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.THEME_KEY, theme);
    }
  }

  setTheme(theme: Theme): void {
    this.theme.set(theme);
  }

  toggleTheme(): void {
    const current = this.effectiveTheme();
    this.theme.set(current === 'light' ? 'dark' : 'light');
  }
}

import { Component, Input, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Theme, ThemeService } from '../../services/theme.service';

@Component({
  selector: 'theme-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="theme-selector" *ngIf="showSelector()">
      <button
        class="theme-btn"
        [class.active]="themeService.effectiveTheme() === 'light'"
        (click)="setTheme('light')"
        title="Light Mode"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      </button>

      <button
        class="theme-btn"
        [class.active]="themeService.effectiveTheme() === 'dark'"
        (click)="setTheme('dark')"
        title="Dark Mode"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      </button>

      <button
        class="theme-btn"
        [class.active]="themeService.theme() === 'auto'"
        (click)="setTheme('auto')"
        title="Auto (System)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
      </button>
    </div>
  `,
  styles: [`
    .theme-selector {
      display: inline-flex;
      gap: 4px;
      padding: 4px;
      background: var(--grid-bg-secondary);
      border: 1px solid var(--grid-border-color);
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .theme-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      padding: 0;
      background: transparent;
      border: none;
      border-radius: 6px;
      color: var(--grid-text-secondary);
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: var(--grid-bg-hover);
        color: var(--grid-primary-color);
      }

      &.active {
        background: var(--grid-primary-color);
        color: #fff;
        box-shadow: 0 2px 4px rgba(64, 150, 255, 0.3);
      }

      svg {
        width: 20px;
        height: 20px;
      }
    }
  `]
})
export class ThemeSelectorComponent {
  showSelector = input<boolean>(true);

  constructor(public themeService: ThemeService) {}

  setTheme(theme: Theme): void {
    this.themeService.setTheme(theme);
  }
}

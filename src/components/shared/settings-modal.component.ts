import { Component, ChangeDetectionStrategy, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, ThemeName } from '../../services/theme.service';
import { ReminderService } from '../../services/reminder.service';

@Component({
  selector: 'app-settings-modal',
  imports: [CommonModule],
  templateUrl: './settings-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsModalComponent {
  close = output<void>();
  themeService = inject(ThemeService);
  reminderService = inject(ReminderService);

  onThemeSelect(themeName: ThemeName): void {
    this.themeService.setTheme(themeName);
  }

  onReminderToggle(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.reminderService.setReminder(input.checked);
  }

  onReminderTimeChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.reminderService.setReminder(true, input.value);
  }
}

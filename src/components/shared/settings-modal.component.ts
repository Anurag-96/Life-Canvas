import { Component, ChangeDetectionStrategy, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, ThemeName } from '../../services/theme.service';
import { ReminderService } from '../../services/reminder.service';
import { AuthService } from '../../services/auth.service';

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
  authService = inject(AuthService);

  showDeleteConfirm = signal(false);
  isDeleting = signal(false);

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

  async onDeleteAccount(): Promise<void> {
    if (this.isDeleting()) return;
    
    this.isDeleting.set(true);
    const result = await this.authService.deleteAccount();
    
    if (result.success) {
      this.close.emit();
    } else {
      alert(result.message);
      this.isDeleting.set(false);
      this.showDeleteConfirm.set(false);
    }
  }
}

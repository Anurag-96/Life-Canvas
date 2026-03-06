import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { AuthComponent } from './components/auth/auth.component';
import { JournalComponent } from './components/journal/journal.component';
import { ReminderService } from './services/reminder.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, AuthComponent, JournalComponent],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      @if (!currentUser()) {
        <app-auth></app-auth>
      } @else {
        <app-journal></app-journal>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private authService = inject(AuthService);
  private reminderService = inject(ReminderService);
  currentUser = this.authService.currentUser;

  constructor() {
    console.log('AppComponent initialized');
  }
}
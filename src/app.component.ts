import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { AuthComponent } from './components/auth/auth.component';
import { JournalComponent } from './components/journal/journal.component';
import { ReminderService } from './services/reminder.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, AuthComponent, JournalComponent],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private authService = inject(AuthService);
  currentUser = this.authService.currentUser;

  constructor() {
    // Initialize the reminder service so it can run in the background
    inject(ReminderService);
  }
}
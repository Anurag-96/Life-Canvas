import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ReminderService {
  reminderEnabled = signal(false);
  reminderTime = signal('09:00'); // Default time
  
  private lastNotificationDate: string | null = null;
  private intervalId: number | undefined;

  constructor() {
    // Load saved settings from localStorage
    const savedEnabled = localStorage.getItem('reminderEnabled');
    if (savedEnabled) {
      this.reminderEnabled.set(JSON.parse(savedEnabled));
    }

    const savedTime = localStorage.getItem('reminderTime');
    if (savedTime) {
      this.reminderTime.set(savedTime);
    }
    
    this.lastNotificationDate = localStorage.getItem('lastNotificationDate');

    // Effect to save settings whenever they change
    effect(() => {
      localStorage.setItem('reminderEnabled', JSON.stringify(this.reminderEnabled()));
      localStorage.setItem('reminderTime', this.reminderTime());
      this.manageReminderInterval();
    });

    this.manageReminderInterval();
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notification');
      return false;
    }
    
    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }
  
  async setReminder(enabled: boolean, time?: string): Promise<void> {
    if (enabled) {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        this.reminderEnabled.set(false);
        // Optionally, inform the user that permission is required.
        alert('Notification permission is required to enable reminders.');
        return;
      }
    }
    this.reminderEnabled.set(enabled);
    if (time) {
      this.reminderTime.set(time);
    }
  }

  private manageReminderInterval() {
    if (this.reminderEnabled() && !this.intervalId) {
      this.intervalId = window.setInterval(() => this.checkAndSendNotification(), 30000); // Check every 30 seconds
    } else if (!this.reminderEnabled() && this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  private checkAndSendNotification() {
    if (!this.reminderEnabled() || Notification.permission !== 'granted') {
      return;
    }

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const [hours, minutes] = this.reminderTime().split(':');
    const reminderHour = parseInt(hours, 10);
    const reminderMinute = parseInt(minutes, 10);
    
    if (now.getHours() === reminderHour && now.getMinutes() === reminderMinute) {
      if (this.lastNotificationDate !== todayStr) {
        new Notification('Life Canvas', {
          body: 'It\'s time for your daily journal entry!',
          icon: '/assets/icon.png' // You might need to add an icon asset
        });
        this.lastNotificationDate = todayStr;
        localStorage.setItem('lastNotificationDate', todayStr);
      }
    }
  }
}

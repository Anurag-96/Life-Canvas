import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { startWith } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { JournalService } from '../../services/journal.service';
import { GeminiService } from '../../services/gemini.service';
import { JournalEntry, Mood } from '../../models/journal-entry.model';
import { ConfirmationDialogComponent } from '../shared/confirmation-dialog.component';
import { ThemeService } from '../../services/theme.service';
import { MoodCalendarComponent } from '../mood-calendar/mood-calendar.component';
import { SettingsModalComponent } from '../shared/settings-modal.component';
import { EyeAvatarComponent } from '../shared/eye-avatar.component';

@Component({
  selector: 'app-journal',
  imports: [CommonModule, ReactiveFormsModule, ConfirmationDialogComponent, MoodCalendarComponent, SettingsModalComponent, EyeAvatarComponent],
  templateUrl: './journal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JournalComponent {
  authService = inject(AuthService);
  journalService = inject(JournalService);
  geminiService = inject(GeminiService);
  themeService = inject(ThemeService);
  private fb = inject(FormBuilder);

  entries = this.journalService.entries;
  currentUser = this.authService.currentUser;
  journalStreak = this.journalService.journalStreak;

  isFormVisible = signal(false);
  editingEntry = signal<JournalEntry | null>(null);
  showDeleteConfirm = signal(false);
  entryToDeleteId = signal<string | null>(null);
  isReflecting = signal(false);
  aiReflection = signal<string | null>(null);
  searchQuery = signal('');
  moodFilter = signal<Mood | null>(null);
  viewMode = signal<'list' | 'calendar'>('list');
  isSettingsVisible = signal(false);
  isProfileVisible = signal(false);

  totalWords = this.journalService.totalWords;
  totalReflections = this.journalService.totalReflections;
  dominantMood = this.journalService.dominantMood;

  badges = computed(() => {
    const streak = this.journalStreak();
    const words = this.totalWords();
    const reflections = this.totalReflections();
    const badgesList = [];
    if (streak >= 3) badgesList.push({ name: '3-Day Streak', icon: '🔥', color: 'orange' });
    if (streak >= 7) badgesList.push({ name: 'Weekly Warrior', icon: '🛡️', color: 'blue' });
    if (streak >= 10) badgesList.push({ name: '10-Day Legend', icon: '👑', color: 'yellow' });
    if (words >= 1000) badgesList.push({ name: 'Wordsmith', icon: '✍️', color: 'emerald' });
    if (reflections >= 5) badgesList.push({ name: 'Deep Reflector', icon: '🧠', color: 'purple' });
    return badgesList;
  });

  filteredEntries = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const mood = this.moodFilter();
    let entries = this.entries();
    if (mood) entries = entries.filter(entry => entry.mood === mood);
    if (query) entries = entries.filter(entry => entry.title.toLowerCase().includes(query) || entry.content.toLowerCase().includes(query));
    return entries;
  });

  moods: { name: Mood; emoji: string }[] = [
    { name: 'Happy', emoji: '😊' }, { name: 'Calm', emoji: '😌' }, { name: 'Sad', emoji: '😢' }, { name: 'Neutral', emoji: '😐' }, { name: 'Energetic', emoji: '⚡️' },
  ];

  entryForm = this.fb.group({
    title: ['', Validators.required],
    date: [this.getTodayDateString(), Validators.required],
    time: [this.getCurrentTimeString(), Validators.required],
    content: ['', Validators.required],
    mood: ['Neutral' as Mood, Validators.required],
  });

  private formValue = toSignal(this.entryForm.valueChanges.pipe(startWith(this.entryForm.value)));
  canReflect = computed(() => (this.formValue()?.content?.trim().length || 0) > 20);

  private getTodayDateString(): string {
    const today = new Date();
    return `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
  }

  private getCurrentTimeString(): string {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  }

  showCreateForm(): void {
    this.editingEntry.set(null);
    this.entryForm.reset({ title: '', date: this.getTodayDateString(), time: this.getCurrentTimeString(), content: '', mood: 'Neutral' });
    this.isFormVisible.set(true);
    this.aiReflection.set(null);
  }

  showEditForm(entry: JournalEntry): void {
    this.editingEntry.set(entry);
    this.entryForm.setValue({ title: entry.title, date: entry.date, time: entry.time || this.getCurrentTimeString(), content: entry.content, mood: entry.mood || 'Neutral' });
    this.isFormVisible.set(true);
    this.aiReflection.set(null);
  }

  cancelForm(): void {
    this.isFormVisible.set(false);
    this.editingEntry.set(null);
    this.aiReflection.set(null);
  }

  async saveEntry(): Promise<void> {
    if (this.entryForm.invalid) return;
    const formValue = this.entryForm.value;
    const currentEntry = this.editingEntry();
    if (currentEntry) {
      await this.journalService.updateEntry({ ...currentEntry, title: formValue.title!, date: formValue.date!, time: formValue.time!, content: formValue.content!, mood: formValue.mood! as Mood });
    } else {
      await this.journalService.addEntry({ title: formValue.title!, date: formValue.date!, time: formValue.time!, content: formValue.content!, mood: formValue.mood! as Mood });
    }
    this.cancelForm();
  }

  async getReflection(): Promise<void> {
    if (!this.canReflect()) return;
    this.isReflecting.set(true);
    this.aiReflection.set(null);
    try {
        const reflection = await this.geminiService.generateReflection(this.entryForm.value.title!, this.entryForm.value.content!);
        this.aiReflection.set(reflection);
    } catch {
        this.aiReflection.set('Error generating reflection.');
    } finally {
        this.isReflecting.set(false);
    }
  }

  promptDelete(id: string): void {
    this.entryToDeleteId.set(id);
    this.showDeleteConfirm.set(true);
  }

  async confirmDelete(): Promise<void> {
    const id = this.entryToDeleteId();
    if (id) await this.journalService.deleteEntry(id);
    this.cancelDelete();
  }

  cancelDelete(): void {
    this.entryToDeleteId.set(null);
    this.showDeleteConfirm.set(false);
  }

  async logout(): Promise<void> {
    this.isProfileVisible.set(false);
    await this.authService.logout();
  }

  getMoodEmoji(moodName: Mood): string {
    return this.moods.find(m => m.name === moodName)?.emoji || '😐';
  }

  getBorderClasses(mood: Mood): string {
    switch (mood) {
      case 'Happy': return 'border-l-yellow-400 dark:border-l-yellow-300';
      case 'Calm': return 'border-l-green-400 dark:border-l-green-400';
      case 'Sad': return 'border-l-blue-400 dark:border-l-blue-400';
      case 'Energetic': return 'border-l-orange-500 dark:border-l-orange-400';
      default: return 'border-l-gray-400 dark:border-l-gray-500';
    }
  }

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  setMoodFilter(mood: Mood | null): void {
    this.moodFilter.set(mood === this.moodFilter() ? null : mood);
  }

  setViewMode(mode: 'list' | 'calendar'): void {
    this.viewMode.set(mode);
  }
}

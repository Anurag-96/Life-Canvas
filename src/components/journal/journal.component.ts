import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { JournalService } from '../../services/journal.service';
import { GeminiService } from '../../services/gemini.service';
import { JournalEntry, Mood } from '../../models/journal-entry.model';
import { ConfirmationDialogComponent } from '../shared/confirmation-dialog.component';
import { ThemeService } from '../../services/theme.service';
import { MoodCalendarComponent } from '../mood-calendar/mood-calendar.component';
import { SettingsModalComponent } from '../shared/settings-modal.component';

@Component({
  selector: 'app-journal',
  imports: [CommonModule, ReactiveFormsModule, ConfirmationDialogComponent, MoodCalendarComponent, SettingsModalComponent],
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

  filteredEntries = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const mood = this.moodFilter();
    let entries = this.entries();

    if (mood) {
        entries = entries.filter(entry => entry.mood === mood);
    }

    if (query) {
        entries = entries.filter(entry => 
            entry.title.toLowerCase().includes(query) || 
            entry.content.toLowerCase().includes(query)
        );
    }

    return entries;
  });

  moods: { name: Mood; emoji: string }[] = [
    { name: 'Happy', emoji: '😊' },
    { name: 'Calm', emoji: '😌' },
    { name: 'Sad', emoji: '😢' },
    { name: 'Neutral', emoji: '😐' },
    { name: 'Energetic', emoji: '⚡️' },
  ];

  entryForm = this.fb.group({
    title: ['', Validators.required],
    date: [this.getTodayDateString(), Validators.required],
    time: [this.getCurrentTimeString(), Validators.required],
    content: ['', Validators.required],
    mood: ['Neutral' as Mood, Validators.required],
  });

  canReflect = computed(() => {
    const content = this.entryForm.get('content')?.value;
    return content && content.trim().length > 20;
  });

  private getTodayDateString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getCurrentTimeString(): string {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  showCreateForm(): void {
    this.editingEntry.set(null);
    this.entryForm.reset({
      title: '',
      date: this.getTodayDateString(),
      time: this.getCurrentTimeString(),
      content: '',
      mood: 'Neutral',
    });
    this.isFormVisible.set(true);
    this.aiReflection.set(null);
  }

  showEditForm(entry: JournalEntry): void {
    this.editingEntry.set(entry);
    this.entryForm.setValue({
      title: entry.title,
      date: entry.date,
      time: entry.time || this.getCurrentTimeString(),
      content: entry.content,
      mood: entry.mood || 'Neutral', // Fallback for old entries
    });
    this.isFormVisible.set(true);
    this.aiReflection.set(null);
  }

  cancelForm(): void {
    this.isFormVisible.set(false);
    this.editingEntry.set(null);
    this.aiReflection.set(null);
  }

  async saveEntry(): Promise<void> {
    if (this.entryForm.invalid) {
      return;
    }

    const formValue = this.entryForm.value;
    const currentEntry = this.editingEntry();

    if (currentEntry) {
      await this.journalService.updateEntry({
        ...currentEntry,
        title: formValue.title!,
        date: formValue.date!,
        time: formValue.time!,
        content: formValue.content!,
        mood: formValue.mood! as Mood,
      });
    } else {
      await this.journalService.addEntry({
        title: formValue.title!,
        date: formValue.date!,
        time: formValue.time!,
        content: formValue.content!,
        mood: formValue.mood! as Mood,
      });
    }

    this.cancelForm();
  }

  async getReflection(): Promise<void> {
    if (!this.canReflect()) return;

    this.isReflecting.set(true);
    this.aiReflection.set(null);
    const { title, content } = this.entryForm.value;

    try {
        const reflection = await this.geminiService.generateReflection(title!, content!);
        this.aiReflection.set(reflection);
    } catch(err) {
        this.aiReflection.set('There was an error generating your reflection.');
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
    if (id) {
      await this.journalService.deleteEntry(id);
    }
    this.cancelDelete();
  }

  cancelDelete(): void {
    this.entryToDeleteId.set(null);
    this.showDeleteConfirm.set(false);
  }

  async logout(): Promise<void> {
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
      case 'Neutral':
      default:
        return 'border-l-gray-400 dark:border-l-gray-500';
    }
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }

  setMoodFilter(mood: Mood | null): void {
    if (mood && this.moodFilter() === mood) {
      this.moodFilter.set(null); // Toggle off if same mood is clicked
    } else {
      this.moodFilter.set(mood);
    }
  }

  setViewMode(mode: 'list' | 'calendar'): void {
    this.viewMode.set(mode);
  }
}
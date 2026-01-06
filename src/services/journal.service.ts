import { Injectable, signal, effect, inject, computed } from '@angular/core';
import { JournalEntry } from '../models/journal-entry.model';
import { AuthService } from './auth.service';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class JournalService {
  private authService = inject(AuthService);
  private supabase = inject(SupabaseService).supabase;

  entries = signal<JournalEntry[]>([]);

  journalStreak = computed(() => {
    const entries = this.entries();
    if (entries.length === 0) {
      return 0;
    }

    const entryDates = new Set(entries.map(e => e.date));
    let streak = 0;
    
    const today = new Date();
    let currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Check if there's an entry for today or yesterday to start the streak count
    if (entryDates.has(this.formatDate(currentDate))) {
      streak = 1;
    } else {
      currentDate.setDate(currentDate.getDate() - 1); // Check yesterday
      if (entryDates.has(this.formatDate(currentDate))) {
        streak = 1;
      } else {
        return 0; // No entry today or yesterday, so streak is 0
      }
    }

    // Loop backwards from the day before the starting streak day
    while (streak > 0) {
      currentDate.setDate(currentDate.getDate() - 1);
      if (entryDates.has(this.formatDate(currentDate))) {
        streak++;
      } else {
        break; // Streak is broken
      }
    }

    return streak;
  });

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }


  constructor() {
    effect(() => {
        const user = this.authService.currentUser();
        if (user) {
            this.loadEntries();
        } else {
            this.entries.set([]);
        }
    });
  }

  private async loadEntries(): Promise<void> {
    const user = this.authService.currentUser();
    if(!user) return;

    const { data, error } = await this.supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('time', { ascending: false, nullsFirst: false });

    if (error) {
        console.error('Error fetching entries:', error.message);
        this.entries.set([]);
    } else {
        this.entries.set(data as JournalEntry[]);
    }
  }

  async addEntry(entry: Omit<JournalEntry, 'id'>): Promise<void> {
    const user = this.authService.currentUser();
    if (!user) return;
    
    const { error } = await this.supabase
      .from('journal_entries')
      .insert([{ ...entry, user_id: user.id }]);

    if (error) {
        console.error('Error adding entry:', error.message);
    } else {
        await this.loadEntries();
    }
  }

  async updateEntry(updatedEntry: JournalEntry): Promise<void> {
    const { id, title, content, date, mood, time } = updatedEntry;
    const { error } = await this.supabase
        .from('journal_entries')
        .update({ title, content, date, mood, time })
        .eq('id', id);
    
    if (error) {
        console.error('Error updating entry:', error.message);
    } else {
        await this.loadEntries();
    }
  }

  async deleteEntry(id: string): Promise<void> {
    const { error } = await this.supabase
        .from('journal_entries')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting entry:', error.message);
    } else {
        await this.loadEntries();
    }
  }
}
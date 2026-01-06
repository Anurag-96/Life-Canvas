export type Mood = 'Happy' | 'Calm' | 'Neutral' | 'Energetic' | 'Sad';

export interface JournalEntry {
  id: string;
  date: string;
  time?: string;
  title: string;
  content: string;
  mood: Mood;
  user_id?: string;
  created_at?: string;
}
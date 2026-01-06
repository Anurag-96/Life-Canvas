import { Injectable, signal, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { User } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private supabase = inject(SupabaseService).supabase;
  currentUser = signal<User | null>(null);

  constructor() {
    this.supabase.auth.getSession().then(({ data: { session } }) => {
      this.currentUser.set(session?.user ?? null);
    });

    this.supabase.auth.onAuthStateChange((event, session) => {
      this.currentUser.set(session?.user ?? null);
    });
  }

  signup(email: string, password_DO_NOT_USE_IN_PROD: string, name: string): Promise<{success: boolean, message: string}> {
    return new Promise(async (resolve) => {
        const { error } = await this.supabase.auth.signUp({ 
            email: email, 
            password: password_DO_NOT_USE_IN_PROD,
            options: {
              data: {
                name: name
              }
            }
        });

        if (error) {
            resolve({ success: false, message: error.message });
        } else {
            resolve({ success: true, message: 'Signup successful! Please check your email to verify.' });
        }
    });
  }

  login(email: string, password_DO_NOT_USE_IN_PROD: string): Promise<{success: boolean, message: string}> {
    return new Promise(async (resolve) => {
        const { error } = await this.supabase.auth.signInWithPassword({
            email: email,
            password: password_DO_NOT_USE_IN_PROD,
        });

        if (error) {
            resolve({ success: false, message: error.message });
        } else {
            resolve({ success: true, message: 'Login successful!' });
        }
    });
  }

  async logout(): Promise<void> {
    await this.supabase.auth.signOut();
    this.currentUser.set(null);
  }
}

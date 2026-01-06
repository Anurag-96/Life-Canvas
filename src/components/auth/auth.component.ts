import { Component, ChangeDetectionStrategy, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-auth',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthComponent {
  private fb = inject(FormBuilder);
  authService = inject(AuthService);
  themeService = inject(ThemeService);

  isLoginView = signal(true);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  authForm: FormGroup;

  constructor() {
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    effect(() => {
      const isLogin = this.isLoginView();
      if (isLogin) {
        if (this.authForm.contains('name')) {
          this.authForm.removeControl('name');
        }
      } else {
        if (!this.authForm.contains('name')) {
          this.authForm.addControl('name', this.fb.control('', [Validators.required]));
        }
      }
    });
  }

  toggleView(): void {
    this.isLoginView.update(v => !v);
    this.authForm.reset();
    this.errorMessage.set(null);
  }

  get name() {
    return this.authForm.get('name');
  }

  get email() {
    return this.authForm.get('email');
  }

  get password() {
    return this.authForm.get('password');
  }

  async onSubmit(): Promise<void> {
    if (this.authForm.invalid) {
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password, name } = this.authForm.value;

    try {
        const response = this.isLoginView()
        ? await this.authService.login(email!, password!)
        : await this.authService.signup(email!, password!, name!);

        if (!response.success) {
            this.errorMessage.set(response.message);
        }
    } catch(err) {
        const error = err as Error;
        this.errorMessage.set(error.message || 'An unexpected error occurred.');
    } finally {
        this.isLoading.set(false);
    }
  }
}
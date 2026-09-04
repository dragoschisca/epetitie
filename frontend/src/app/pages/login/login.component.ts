import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gov-border">
        <div class="text-center">
          <div class="w-16 h-16 bg-gov-blue text-gov-gold rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4 shadow" aria-hidden="true">
            MD
          </div>
          <h2 class="text-2xl font-serif font-bold text-gov-primary">Autentificare MPass</h2>
          <p class="text-sm text-gov-secondary mt-2">Sistemul Național de Identificare</p>
        </div>

        @if (errorMessage) {
          <div class="bg-red-50 border-l-4 border-red-600 p-4 rounded text-sm text-red-800 font-medium" role="alert">
            {{ errorMessage }}
          </div>
        }

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="mt-8 space-y-6">
          <div>
            <label for="usernameOrEmail" class="block text-sm font-bold text-gov-primary mb-2">
              Nume Utilizator / Email
            </label>
            <input
              id="usernameOrEmail"
              type="text"
              formControlName="usernameOrEmail"
              placeholder="ex: andrei.v sau cetatean@gov.md"
              class="w-full px-4 py-3 border border-gov-border rounded-md focus:ring-2 focus:ring-gov-cta focus:border-gov-cta text-base text-gov-text"
              [attr.aria-invalid]="loginForm.get('usernameOrEmail')?.invalid && loginForm.get('usernameOrEmail')?.touched"
            />
            @if (loginForm.get('usernameOrEmail')?.invalid && loginForm.get('usernameOrEmail')?.touched) {
              <p class="text-sm text-red-600 mt-2 font-medium" id="username-error">Introduceți numele de utilizator sau adresa de email.</p>
            }
          </div>

          <div>
            <label for="password" class="block text-sm font-bold text-gov-primary mb-2">
              Parolă
            </label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="••••••••"
              class="w-full px-4 py-3 border border-gov-border rounded-md focus:ring-2 focus:ring-gov-cta focus:border-gov-cta text-base text-gov-text"
              [attr.aria-invalid]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
            />
            @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
              <p class="text-sm text-red-600 mt-2 font-medium" id="password-error">Parola este obligatorie.</p>
            }
          </div>

          <button
            type="submit"
            [disabled]="loginForm.invalid || isLoading"
            class="btn-primary w-full disabled:opacity-50"
          >
            @if (isLoading) {
              <span class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" aria-hidden="true"></span>
              <span>Se autentifică...</span>
            } @else {
              <span>Intră în Cabinetul Cetățeanului</span>
            }
          </button>
        </form>

        <!-- Quick Credentials Hint for Reviewers -->
        <div class="mt-8 bg-gov-bg p-4 rounded-lg border border-gov-border text-sm">
          <div class="font-bold text-gov-primary mb-2">Conturi de Test Pre-configurate:</div>
          <ul class="space-y-2 text-gov-secondary font-mono text-xs">
            <li><strong>Cetățean:</strong> username: <code>citizen_andrei</code> / parola: <code>Password2026!</code></li>
            <li><strong>Inspector:</strong> username: <code>officer_infra</code> / parola: <code>Password2026!</code></li>
            <li><strong>Admin:</strong> username: <code>admin</code> / parola: <code>Password2026!</code></li>
          </ul>
        </div>

        <div class="text-center pt-4 text-sm text-gov-secondary">
          Nu aveți un cont înregistrat?
          <br/>
          <a routerLink="/register" class="text-gov-cta font-bold hover:underline focus-visible inline-block mt-2">Înregistrare Cetățean (IDNP)</a>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.group({
    usernameOrEmail: ['', Validators.required],
    password: ['', Validators.required]
  });

  isLoading = false;
  errorMessage = '';

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const raw = this.loginForm.getRawValue();
    this.authService.login({
      usernameOrEmail: raw.usernameOrEmail!,
      password: raw.password!
    }).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.user.roles.includes('ROLE_OFFICER') || res.user.roles.includes('ROLE_ADMIN')) {
          this.router.navigate(['/officer-dashboard']);
        } else {
          this.router.navigate(['/citizen-cabinet']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Autentificare eșuată. Verificați datele introduse.';
      }
    });
  }
}

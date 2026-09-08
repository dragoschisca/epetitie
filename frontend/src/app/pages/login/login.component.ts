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
    <div class="min-h-[75vh] flex items-center justify-center py-10 px-4 sm:px-6">
      <div class="max-w-md w-full space-y-6 evo-card p-8 sm:p-10 border border-evo-border shadow-evo-card">
        <!-- Logo & Header -->
        <div class="text-center space-y-3">
          <div class="w-14 h-14 bg-gradient-to-br from-evo-navy to-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-xl mx-auto shadow-md border border-slate-700">
            <span class="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">MPass</span>
          </div>
          <div class="space-y-1">
            <h1 class="text-2xl font-black text-evo-navy tracking-tight">Autentificare MPass</h1>
            <p class="text-xs text-evo-text-muted">Serviciul guvernamental de autentificare și control al accesului</p>
          </div>
        </div>

        @if (errorMessage) {
          <div class="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-xs text-rose-700 font-semibold flex items-center gap-2">
            <svg class="w-4 h-4 flex-shrink-0 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span>{{ errorMessage }}</span>
          </div>
        }

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <div class="space-y-1.5">
            <label for="usernameOrEmail" class="block text-xs font-bold uppercase tracking-wider text-evo-navy">
              Nume de utilizator / email MPass
            </label>
            <input
              id="usernameOrEmail"
              type="text"
              formControlName="usernameOrEmail"
              placeholder="ex: citizen_andrei sau cetatean@gov.md"
              class="w-full px-4 py-2.5 bg-slate-50 border border-evo-border rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-evo-cobalt transition-all"
            />
          </div>

          <div class="space-y-1.5">
            <label for="password" class="block text-xs font-bold uppercase tracking-wider text-evo-navy">
              Parolă
            </label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="••••••••"
              class="w-full px-4 py-2.5 bg-slate-50 border border-evo-border rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-evo-cobalt transition-all"
            />
          </div>

          <button
            type="submit"
            [disabled]="loginForm.invalid || isLoading"
            class="btn-primary w-full py-3 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            @if (isLoading) {
              <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Se conectează la MPass...</span>
            } @else {
              <span>Conectare MPass</span>
            }
          </button>
        </form>

        <!-- Quick Credentials Hint for Reviewers -->
        <div class="bg-slate-50 p-4 rounded-2xl border border-evo-border text-xs space-y-2">
          <div class="font-bold text-evo-navy flex items-center gap-1.5">
            <svg class="w-4 h-4 text-evo-cobalt" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span>Conturi demonstrative de test:</span>
          </div>
          <div class="space-y-1 text-evo-text-muted font-mono text-[11px]">
            <div><strong>Cetățean:</strong> <code>citizen_andrei</code> / <code>Password2026!</code></div>
            <div><strong>Inspector:</strong> <code>officer_infra</code> / <code>Password2026!</code></div>
          </div>
        </div>

        <div class="text-center text-xs text-evo-text-muted pt-2 border-t border-evo-border">
          Nu aveți cont MPass înregistrat?
          <a routerLink="/register" class="text-evo-cobalt font-bold hover:underline ml-1">Înregistrare cetățean (IDNP)</a>
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
        if (res.user.roles.includes('ROLE_OFFICER')) {
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

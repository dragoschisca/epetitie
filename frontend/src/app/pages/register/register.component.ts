import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export function moldovanIdnpValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value ? String(control.value).trim() : '';
  if (!value) return null;

  if (!/^\d{13}$/.test(value)) {
    return { invalidIdnpFormat: true };
  }

  const weights = [7, 3, 1, 7, 3, 1, 7, 3, 1, 7, 3, 1];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(value.charAt(i), 10) * weights[i];
  }

  const checksum = sum % 10;
  const lastDigit = parseInt(value.charAt(12), 10);

  return checksum === lastDigit ? null : { invalidIdnpChecksum: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-[80vh] flex items-center justify-center py-10 px-4 sm:px-6">
      <div class="max-w-2xl w-full space-y-6 evo-card p-8 sm:p-10 border border-evo-border shadow-evo-card">
        <!-- Header -->
        <div class="text-center space-y-2">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 bg-evo-cobalt-light text-evo-cobalt text-xs font-bold rounded-full border border-blue-100">
            <span class="w-2 h-2 rounded-full bg-evo-cobalt"></span>
            <span>Înregistrare portal MPass</span>
          </div>
          <h1 class="text-2xl font-black text-evo-navy tracking-tight">Creare cont cetățean</h1>
          <p class="text-xs text-evo-text-muted">Validare algoritmică IDNP Republica Moldova (13 cifre)</p>
        </div>

        @if (errorMessage) {
          <div class="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-xs text-rose-700 font-semibold flex items-center gap-2">
            <svg class="w-4 h-4 flex-shrink-0 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span>{{ errorMessage }}</span>
          </div>
        }

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <!-- IDNP Field with live validation feedback -->
          <div class="space-y-1.5">
            <label for="idnp" class="block text-xs font-bold uppercase tracking-wider text-evo-navy">
              IDNP solicitant (13 cifre) <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <input
                id="idnp"
                type="text"
                formControlName="idnp"
                maxlength="13"
                placeholder="2003001002003"
                class="w-full px-4 py-2.5 bg-slate-50 border rounded-xl font-mono text-sm tracking-widest focus:bg-white focus:ring-2 focus:ring-evo-cobalt transition-all"
                [ngClass]="{
                  'border-rose-400 bg-rose-50/50': idnpControl?.invalid && idnpControl?.touched,
                  'border-emerald-500 bg-emerald-50/50': idnpControl?.valid && idnpControl?.touched,
                  'border-evo-border': !(idnpControl?.invalid && idnpControl?.touched) && !(idnpControl?.valid && idnpControl?.touched)
                }"
              />
              @if (idnpControl?.valid && idnpControl?.touched) {
                <span class="absolute right-3.5 top-2.5 text-emerald-600 text-xs font-bold flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                  <span>IDNP valid</span>
                </span>
              }
            </div>
            @if (idnpControl?.hasError('required') && idnpControl?.touched) {
              <p class="text-xs text-rose-600 font-medium">IDNP-ul este obligatoriu pentru cetățenii RM.</p>
            }
            @if (idnpControl?.hasError('invalidIdnpFormat') && idnpControl?.touched) {
              <p class="text-xs text-rose-600 font-medium">IDNP trebuie să conțină exact 13 cifre numerice.</p>
            }
            @if (idnpControl?.hasError('invalidIdnpChecksum') && idnpControl?.touched) {
              <p class="text-xs text-rose-600 font-medium">Cifra de control IDNP este invalidă conform algoritmului oficial RM.</p>
            }
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label for="lastName" class="block text-xs font-bold uppercase tracking-wider text-evo-navy">Nume <span class="text-red-500">*</span></label>
              <input id="lastName" type="text" formControlName="lastName" placeholder="Vieru" class="w-full px-4 py-2.5 bg-slate-50 border border-evo-border rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-evo-cobalt transition-all" />
            </div>
            <div class="space-y-1.5">
              <label for="firstName" class="block text-xs font-bold uppercase tracking-wider text-evo-navy">Prenume <span class="text-red-500">*</span></label>
              <input id="firstName" type="text" formControlName="firstName" placeholder="Andrei" class="w-full px-4 py-2.5 bg-slate-50 border border-evo-border rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-evo-cobalt transition-all" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label for="username" class="block text-xs font-bold uppercase tracking-wider text-evo-navy">Nume de utilizator <span class="text-red-500">*</span></label>
              <input id="username" type="text" formControlName="username" placeholder="andrei_v" class="w-full px-4 py-2.5 bg-slate-50 border border-evo-border rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-evo-cobalt transition-all" />
            </div>
            <div class="space-y-1.5">
              <label for="phone" class="block text-xs font-bold uppercase tracking-wider text-evo-navy">Telefon mobil</label>
              <input id="phone" type="text" formControlName="phone" placeholder="+37369123456" class="w-full px-4 py-2.5 bg-slate-50 border border-evo-border rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-evo-cobalt transition-all" />
            </div>
          </div>

          <div class="space-y-1.5">
            <label for="email" class="block text-xs font-bold uppercase tracking-wider text-evo-navy">Adresă email <span class="text-red-500">*</span></label>
            <input id="email" type="email" formControlName="email" placeholder="andrei.v@gmail.com" class="w-full px-4 py-2.5 bg-slate-50 border border-evo-border rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-evo-cobalt transition-all" />
          </div>

          <div class="space-y-1.5">
            <label for="password" class="block text-xs font-bold uppercase tracking-wider text-evo-navy">Parolă (min. 8 caractere) <span class="text-red-500">*</span></label>
            <input id="password" type="password" formControlName="password" placeholder="••••••••" class="w-full px-4 py-2.5 bg-slate-50 border border-evo-border rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-evo-cobalt transition-all" />
          </div>

          <div class="pt-2">
            <button
              type="submit"
              [disabled]="registerForm.invalid || isLoading"
              class="btn-primary w-full py-3 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              @if (isLoading) {
                <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Se procesează înregistrarea...</span>
              } @else {
                <span>Creează cont cetățean MPass</span>
              }
            </button>
          </div>
        </form>

        <div class="text-center text-xs text-evo-text-muted pt-2 border-t border-evo-border">
          Aveți deja cont înregistrat?
          <a routerLink="/login" class="text-evo-cobalt font-bold hover:underline ml-1">Autentifică-te aici</a>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm = this.fb.group({
    idnp: ['', [Validators.required, moldovanIdnpValidator]],
    username: ['', [Validators.required, Validators.minLength(4)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phone: ['']
  });

  isLoading = false;
  errorMessage = '';

  get idnpControl() {
    return this.registerForm.get('idnp');
  }

  onSubmit() {
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const raw = this.registerForm.getRawValue();
    this.authService.register({
      idnp: raw.idnp!,
      username: raw.username!,
      email: raw.email!,
      password: raw.password!,
      firstName: raw.firstName!,
      lastName: raw.lastName!,
      phone: raw.phone || ''
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/citizen-cabinet']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Înregistrarea a eșuat. IDNP-ul sau email-ul s-ar putea să existe deja.';
      }
    });
  }
}

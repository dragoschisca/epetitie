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
    <div class="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-2xl w-full space-y-8 bg-white p-8 sm:p-10 rounded-xl shadow-lg border border-gov-border">
        <div class="text-center">
          <div class="inline-flex items-center space-x-2 px-4 py-1.5 bg-gov-blue/10 text-gov-blue text-sm font-bold rounded-full mb-4">
            <span aria-hidden="true">MD</span>
            <span>Înregistrare MConnect / MPass Portal</span>
          </div>
          <h2 class="text-3xl font-serif font-bold text-gov-primary">Creare Cont Cetățean</h2>
          <p class="text-sm text-gov-secondary mt-2">Validare Algoritmică IDNP Republica Moldova (13 cifre)</p>
        </div>

        @if (errorMessage) {
          <div class="bg-red-50 border-l-4 border-red-600 p-4 rounded text-sm text-red-800 font-medium" role="alert">
            {{ errorMessage }}
          </div>
        }

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-6 mt-8">
          <!-- IDNP Field with live validation feedback -->
          <div>
            <label for="idnp" class="block text-sm font-bold text-gov-primary mb-2">
              IDNP Solicitant (13 Cifre) <span class="text-red-600" aria-label="obligatoriu">*</span>
            </label>
            <div class="relative">
              <input
                id="idnp"
                type="text"
                formControlName="idnp"
                maxlength="13"
                placeholder="2003001002003"
                class="w-full px-4 py-3 border rounded-md font-mono text-base tracking-wider focus:ring-2 focus:ring-gov-cta focus:border-gov-cta"
                [ngClass]="{
                  'border-red-500 bg-red-50': idnpControl?.invalid && idnpControl?.touched,
                  'border-green-600 bg-green-50': idnpControl?.valid && idnpControl?.touched,
                  'border-gov-border': !(idnpControl?.invalid && idnpControl?.touched) && !(idnpControl?.valid && idnpControl?.touched)
                }"
                [attr.aria-invalid]="idnpControl?.invalid && idnpControl?.touched"
              />
              @if (idnpControl?.valid && idnpControl?.touched) {
                <span class="absolute right-4 top-3.5 text-green-700 text-sm font-bold flex items-center space-x-1">
                  <span aria-hidden="true">✓</span>
                  <span>IDNP Valid</span>
                </span>
              }
            </div>
            @if (idnpControl?.hasError('required') && idnpControl?.touched) {
              <p class="text-sm text-red-600 mt-2 font-medium">IDNP-ul este obligatoriu pentru cetățenii RM.</p>
            }
            @if (idnpControl?.hasError('invalidIdnpFormat') && idnpControl?.touched) {
              <p class="text-sm text-red-600 mt-2 font-medium">IDNP trebuie să conțină exact 13 cifre numerice.</p>
            }
            @if (idnpControl?.hasError('invalidIdnpChecksum') && idnpControl?.touched) {
              <p class="text-sm text-red-600 mt-2 font-medium">Cifra de control IDNP este invalidă conform algoritmului oficial RM.</p>
            }
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="lastName" class="block text-sm font-bold text-gov-primary mb-2">Nume <span class="text-red-600" aria-label="obligatoriu">*</span></label>
              <input id="lastName" type="text" formControlName="lastName" placeholder="Vieru" class="w-full px-4 py-3 border border-gov-border rounded-md text-base focus:ring-2 focus:ring-gov-cta focus:border-gov-cta" />
            </div>
            <div>
              <label for="firstName" class="block text-sm font-bold text-gov-primary mb-2">Prenume <span class="text-red-600" aria-label="obligatoriu">*</span></label>
              <input id="firstName" type="text" formControlName="firstName" placeholder="Andrei" class="w-full px-4 py-3 border border-gov-border rounded-md text-base focus:ring-2 focus:ring-gov-cta focus:border-gov-cta" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="username" class="block text-sm font-bold text-gov-primary mb-2">Nume Utilizator <span class="text-red-600" aria-label="obligatoriu">*</span></label>
              <input id="username" type="text" formControlName="username" placeholder="andrei_v" class="w-full px-4 py-3 border border-gov-border rounded-md text-base focus:ring-2 focus:ring-gov-cta focus:border-gov-cta" />
            </div>
            <div>
              <label for="phone" class="block text-sm font-bold text-gov-primary mb-2">Telefon mobil</label>
              <input id="phone" type="text" formControlName="phone" placeholder="+37369123456" class="w-full px-4 py-3 border border-gov-border rounded-md text-base focus:ring-2 focus:ring-gov-cta focus:border-gov-cta" />
            </div>
          </div>

          <div>
            <label for="email" class="block text-sm font-bold text-gov-primary mb-2">Email <span class="text-red-600" aria-label="obligatoriu">*</span></label>
            <input id="email" type="email" formControlName="email" placeholder="andrei.v@gmail.com" class="w-full px-4 py-3 border border-gov-border rounded-md text-base focus:ring-2 focus:ring-gov-cta focus:border-gov-cta" />
          </div>

          <div>
            <label for="password" class="block text-sm font-bold text-gov-primary mb-2">Parolă (Min. 8 caractere) <span class="text-red-600" aria-label="obligatoriu">*</span></label>
            <input id="password" type="password" formControlName="password" placeholder="••••••••" class="w-full px-4 py-3 border border-gov-border rounded-md text-base focus:ring-2 focus:ring-gov-cta focus:border-gov-cta" />
          </div>

          <div class="pt-4">
            <button
              type="submit"
              [disabled]="registerForm.invalid || isLoading"
              class="btn-primary w-full disabled:opacity-50"
            >
              @if (isLoading) {
                <span class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" aria-hidden="true"></span>
                <span>Se procesează înregistrarea...</span>
              } @else {
                <span>Creează Contul de Cetățean</span>
              }
            </button>
          </div>
        </form>

        <div class="text-center pt-6 text-sm text-gov-secondary">
          Aveți deja un cont înregistrat?
          <br/>
          <a routerLink="/login" class="text-gov-cta font-bold hover:underline focus-visible inline-block mt-2">Autentificați-vă aici</a>
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

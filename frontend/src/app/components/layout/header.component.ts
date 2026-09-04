import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <!-- Top Moldovan Government State Utility Banner -->
    <div class="bg-gov-primary text-white text-sm py-2 px-4 border-b border-gov-gold/30">
      <div class="max-w-5xl mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div class="flex items-center space-x-3 font-medium">
          <!-- Moldovan Flag Stripe Badge -->
          <div class="flex h-4 w-6 rounded-sm overflow-hidden border border-white/20" aria-hidden="true">
            <div class="w-1/3 bg-[#003366]"></div>
            <div class="w-1/3 bg-[#F2A900]"></div>
            <div class="w-1/3 bg-[#CC092F]"></div>
          </div>
          <span class="font-serif">Guvernul Republicii Moldova</span>
        </div>
        <div class="flex items-center space-x-4 text-slate-200 text-sm">
          <span>Suport: 0800 01 234</span>
          <span aria-hidden="true">|</span>
          <span>RO</span>
        </div>
      </div>
    </div>

    <!-- Main Institutional Header -->
    <header class="bg-white border-b border-gov-border shadow-sm sticky top-0 z-40">
      <div class="max-w-5xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <!-- Logo & Emblem -->
        <a routerLink="/" class="flex items-center space-x-4 group focus-visible" aria-label="Acasă - e-Petiție GovTech">
          <div class="w-12 h-12 bg-gov-blue rounded-md flex items-center justify-center text-gov-gold font-bold text-2xl shadow-inner border border-gov-gold/40" aria-hidden="true">
            MD
          </div>
          <div>
            <h1 class="text-xl font-serif font-bold text-gov-primary leading-tight group-hover:text-gov-blue transition-colors">
              e-Petiție GovTech
            </h1>
            <p class="text-sm text-gov-secondary font-medium">
              Platforma Oficială
            </p>
          </div>
        </a>

        <!-- Main Navigation Links -->
        <nav class="flex flex-wrap items-center justify-center gap-4 text-base font-medium" aria-label="Meniu principal">
          <a routerLink="/public-initiatives" routerLinkActive="text-gov-blue font-bold border-b-2 border-gov-gold pb-1" class="text-gov-secondary hover:text-gov-primary transition-colors focus-visible px-2 py-1">
            Inițiative Publice
          </a>
          @if (authService.isAuthenticated()) {
            <a routerLink="/citizen-cabinet" routerLinkActive="text-gov-blue font-bold border-b-2 border-gov-gold pb-1" class="text-gov-secondary hover:text-gov-primary transition-colors focus-visible px-2 py-1">
              Cabinetul Meu
            </a>
            @if (authService.isOfficer()) {
              <a routerLink="/officer-dashboard" routerLinkActive="text-red-700 font-bold border-b-2 border-red-500 pb-1" class="text-red-600 font-bold hover:text-red-800 transition-colors focus-visible flex items-center gap-2 px-2 py-1">
                <span class="inline-block w-2.5 h-2.5 rounded-full bg-red-600" aria-hidden="true"></span>
                <span>Ghișeu Inspector</span>
              </a>
            }
          }
        </nav>

        <!-- User Authentication & Action Menu -->
        <div class="flex items-center">
          @if (authService.isAuthenticated()) {
            <div class="flex items-center gap-4 bg-gov-bg py-2 px-4 rounded-md border border-gov-border shadow-sm">
              <div class="text-right">
                <div class="text-sm font-bold text-gov-primary">{{ authService.currentUserSignal()?.fullName }}</div>
                <div class="text-xs text-gov-secondary font-mono" aria-label="IDNP">IDNP: {{ authService.currentUserSignal()?.idnp }}</div>
              </div>
              <button (click)="logout()" class="text-sm bg-white border border-gov-border hover:bg-gray-100 text-gov-primary font-medium py-1.5 px-3 rounded shadow-sm transition-colors focus-visible" aria-label="Ieșire din cont">
                Ieșire
              </button>
            </div>
          } @else {
            <div class="flex items-center gap-3">
              <a routerLink="/login" class="btn-secondary" aria-label="Autentificare">
                Autentificare
              </a>
              <a routerLink="/register" class="btn-primary" aria-label="Înregistrare cetățean">
                Înregistrare
              </a>
            </div>
          }
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  authService = inject(AuthService);

  logout() {
    this.authService.logout();
  }
}

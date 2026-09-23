import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <!-- Top Moldovan Government Utility Line -->
    <div class="bg-evo-navy text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
      <div class="max-w-[1440px] mx-auto flex justify-between items-center">
        <div class="flex items-center space-x-3 font-medium">
          <!-- Official Flag of Moldova Badge with Coat of Arms -->
          <img src="assets/images/flag-of-moldova.png" alt="Drapelul Republicii Moldova" class="h-3.5 w-5 rounded-xs object-cover border border-white/30 shadow-xs" title="Drapelul Republicii Moldova">
          <span class="text-slate-200 font-semibold tracking-wide">Guvernul Republicii Moldova</span>
          <span class="hidden sm:inline-block text-slate-600">•</span>
          <span class="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-evo-cobalt/10 text-evo-cyan text-[11px] font-semibold border border-evo-cyan/20">
            <span class="w-1.5 h-1.5 rounded-full bg-evo-cyan animate-pulse"></span>
            Ecosistemul EVO Moldova
          </span>
        </div>
        <div class="flex items-center space-x-4 text-slate-300">
          <a href="https://evo.gov.md" target="_blank" class="hover:text-white transition-colors flex items-center gap-1 text-xs">
            <span>evo.gov.md</span>
            <svg class="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
          </a>
          <span class="text-slate-700">|</span>
          <span class="font-bold text-white">RO</span>
        </div>
      </div>
    </div>

    <!-- Main Desktop & Mobile Header -->
    <header class="bg-white/90 backdrop-blur-md border-b border-evo-border sticky top-0 z-40 shadow-evo-soft">
      <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center gap-4">
        <!-- Logo & Identity -->
        <a routerLink="/" class="flex items-center gap-3.5 group focus-visible" aria-label="Acasă - e-Petiție EVO">
          <div class="w-11 h-11 bg-gradient-to-br from-evo-navy to-slate-800 rounded-xl flex items-center justify-center text-white font-extrabold text-lg shadow-md border border-slate-700/50 group-hover:scale-[1.02] transition-transform">
            <span class="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">eP</span>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-lg font-bold text-evo-navy tracking-tight group-hover:text-evo-cobalt transition-colors">e-Petiție</span>
              <span class="px-2 py-0.5 text-[10px] font-bold rounded-md bg-evo-cobalt-light text-evo-cobalt uppercase tracking-wider">EVO GovTech</span>
            </div>
            <p class="text-xs text-evo-text-muted font-medium">Serviciul național de petiții digitalizate</p>
          </div>
        </a>

        <!-- Desktop Navigation Links -->
        <nav class="hidden md:flex items-center gap-1 font-semibold text-sm" aria-label="Meniu principal">
          <a routerLink="/public-initiatives" routerLinkActive="bg-evo-cobalt-light text-evo-cobalt font-bold shadow-xs" class="px-4 py-2 rounded-xl text-evo-text-muted hover:text-evo-navy hover:bg-slate-50 transition-all">
            Inițiative publice
          </a>
          @if (authService.isAuthenticated()) {
            <a routerLink="/citizen-cabinet" routerLinkActive="bg-evo-cobalt-light text-evo-cobalt font-bold shadow-xs" class="px-4 py-2 rounded-xl text-evo-text-muted hover:text-evo-navy hover:bg-slate-50 transition-all flex items-center gap-2">
              <span>Cabinet cetățean</span>
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            </a>
            @if (authService.isOfficer()) {
              <a routerLink="/officer-dashboard" routerLinkActive="bg-rose-50 text-rose-700 font-bold border border-rose-200" class="px-4 py-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-all flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                <span>Ghișeu inspector</span>
              </a>
            }
          }
        </nav>

        <!-- User Authentication & Action Menu -->
        <div class="flex items-center gap-3">
          @if (authService.isAuthenticated()) {
            <div class="flex items-center gap-3 pl-3 border-l border-evo-border">
              <div class="hidden sm:block text-right">
                <div class="text-xs font-bold text-evo-navy">{{ authService.currentUserSignal()?.fullName }}</div>
                <div class="text-[11px] text-evo-text-muted font-mono">IDNP: {{ authService.currentUserSignal()?.idnp }}</div>
              </div>
              <div class="w-9 h-9 rounded-xl bg-evo-cobalt-light text-evo-cobalt flex items-center justify-center font-bold text-sm border border-evo-cobalt/20">
                {{ authService.currentUserSignal()?.fullName?.charAt(0) || 'C' }}
              </div>
              <button (click)="logout()" class="p-2 text-evo-text-muted hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors" title="Ieșire din cont" aria-label="Ieșire din cont">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
              </button>
            </div>
          } @else {
            <div class="flex items-center gap-2">
              <a routerLink="/login" class="btn-secondary text-xs px-3.5 py-2">
                Autentificare
              </a>
              <a routerLink="/register" class="btn-primary text-xs px-3.5 py-2">
                Înregistrare
              </a>
            </div>
          }
        </div>
      </div>
    </header>

    <!-- Mobile Bottom Navigation Bar (EVO Style) -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-evo-border z-50 py-2 px-6 shadow-lg">
      <div class="flex justify-around items-center">
        <a routerLink="/public-initiatives" routerLinkActive="text-evo-cobalt" [routerLinkActiveOptions]="{exact: true}" class="flex flex-col items-center gap-1 text-evo-text-muted text-[11px] font-semibold">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg>
          <span>Inițiative</span>
        </a>

        @if (authService.isAuthenticated()) {
          <a routerLink="/citizen-cabinet" routerLinkActive="text-evo-cobalt" class="flex flex-col items-center gap-1 text-evo-text-muted text-[11px] font-semibold">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            <span>Cabinet</span>
          </a>
          @if (authService.isOfficer()) {
            <a routerLink="/officer-dashboard" routerLinkActive="text-rose-600" class="flex flex-col items-center gap-1 text-evo-text-muted text-[11px] font-semibold">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              <span>Inspector</span>
            </a>
          }
        } @else {
          <a routerLink="/login" routerLinkActive="text-evo-cobalt" class="flex flex-col items-center gap-1 text-evo-text-muted text-[11px] font-semibold">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 01-3-3h7a3 3 0 013 3v1"/></svg>
            <span>Conectare</span>
          </a>
        }
      </div>
    </nav>
  `
})
export class HeaderComponent {
  authService = inject(AuthService);

  logout() {
    this.authService.logout();
  }
}


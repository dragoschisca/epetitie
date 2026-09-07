import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PetitionService } from '../../services/petition.service';
import { AuthService } from '../../services/auth.service';
import { PetitionCategory, PetitionResponse } from '../../models/petition.model';

@Component({
  selector: 'app-public-initiatives',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="space-y-8">
      <!-- EVO Hero Banner -->
      <div class="bg-[#0F172A] text-white rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden border border-slate-800">
        <div class="relative z-10 max-w-3xl space-y-4">
          <div class="inline-flex items-center gap-2 bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-xs font-bold px-3 py-1 rounded-full">
            <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>Serviciul Public Digital • Modul EVO GovTech</span>
          </div>
          <h1 class="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Inițiative Colective & Democrație Digitală
          </h1>
          <p class="text-slate-200 text-sm sm:text-base leading-relaxed font-normal max-w-2xl">
            Susține cauzele cetățenești din Republica Moldova cu semnătura ta electronică. La atingerea pragului legal de semnături, cererile sunt direcționate automat către instituțiile competente.
          </p>

          <div class="pt-2 flex flex-wrap gap-4 text-xs text-slate-200">
            <div class="flex items-center gap-2 bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700 font-medium">
              <svg class="w-4 h-4 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              <span>Verificare securizată prin MPass</span>
            </div>
            <div class="flex items-center gap-2 bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700 font-medium">
              <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457-.39-2.823-1.07-4"/></svg>
              <span>Semnătură MSign Valabilă Legal</span>
            </div>
          </div>
        </div>
      </div>

      <!-- EVO Modular Filter & Search Bar -->
      <div class="evo-card p-5 space-y-4">
        <div class="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          <!-- Search Input -->
          <div class="relative flex-1">
            <svg class="w-5 h-5 text-evo-text-muted absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="text"
              [(ngModel)]="searchTerm"
              (keyup.enter)="onSearch()"
              placeholder="Caută inițiativă după titlu, descriere sau cod de urmărire..."
              class="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-evo-border rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-evo-cobalt focus:border-transparent transition-all"
            />
          </div>

          <!-- Select Category -->
          <div class="flex flex-wrap sm:flex-nowrap gap-3 items-center">
            <select
              [(ngModel)]="selectedCategory"
              (change)="onSearch()"
              class="w-full sm:w-auto px-4 py-2.5 bg-slate-50 border border-evo-border rounded-xl text-sm font-semibold text-evo-navy focus:bg-white focus:ring-2 focus:ring-evo-cobalt transition-all"
            >
              <option value="">Toate Categoriile</option>
              <option value="INFRASTRUCTURA">Infrastructură & Urbanism</option>
              <option value="MEDIU">Protecția Mediului</option>
              <option value="SANATATE">Sănătate Publică</option>
              <option value="ADMINISTRATIE_PUBLICA">Administrație Publică</option>
              <option value="SOCIAL">Protecție Socială</option>
              <option value="EDUCATIE">Educație & Cultură</option>
            </select>

            <button
              (click)="onSearch()"
              class="btn-primary text-sm whitespace-nowrap"
            >
              Caută
            </button>
          </div>
        </div>

        <!-- Quick Category Filter Pills -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
          <span class="text-evo-text-muted whitespace-nowrap">Filtre rapide:</span>
          <button
            (click)="selectCategory('')"
            [class]="selectedCategory === '' ? 'bg-evo-navy text-white' : 'bg-slate-100 text-evo-text-muted hover:bg-slate-200'"
            class="px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
          >
            Toate
          </button>
          <button
            (click)="selectCategory('INFRASTRUCTURA')"
            [class]="selectedCategory === 'INFRASTRUCTURA' ? 'bg-evo-cobalt text-white' : 'bg-slate-100 text-evo-text-muted hover:bg-slate-200'"
            class="px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
          >
            Infrastructură
          </button>
          <button
            (click)="selectCategory('MEDIU')"
            [class]="selectedCategory === 'MEDIU' ? 'bg-evo-cobalt text-white' : 'bg-slate-100 text-evo-text-muted hover:bg-slate-200'"
            class="px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
          >
            Mediu
          </button>
          <button
            (click)="selectCategory('SANATATE')"
            [class]="selectedCategory === 'SANATATE' ? 'bg-evo-cobalt text-white' : 'bg-slate-100 text-evo-text-muted hover:bg-slate-200'"
            class="px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
          >
            Sănătate
          </button>
        </div>
      </div>

      <!-- Initiatives Modular Grid -->
      @if (isLoading) {
        <div class="evo-card p-12 text-center space-y-3">
          <div class="inline-block w-9 h-9 border-3 border-evo-cobalt border-t-transparent rounded-full animate-spin"></div>
          <p class="text-sm font-semibold text-evo-text-muted">Se încarcă inițiativele cetățenești din baza de date EVO...</p>
        </div>
      } @else if (initiatives.length === 0) {
        <div class="evo-card p-12 text-center space-y-3">
          <div class="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
          </div>
          <h3 class="text-base font-bold text-evo-navy">Nicio inițiativă publică găsiți conform criteriilor</h3>
          <p class="text-xs text-evo-text-muted max-w-sm mx-auto">Încearcă să modifici termenii de căutare sau categoria selectată pentru a vedea petițiile active.</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          @for (item of initiatives; track item.id) {
            <div class="evo-card p-6 flex flex-col justify-between space-y-5">
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="px-3 py-1 bg-evo-cobalt-light text-evo-cobalt text-xs font-bold rounded-lg border border-blue-100 uppercase tracking-wide">
                    {{ item.category }}
                  </span>
                  <span class="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">
                    #{{ item.trackingNumber }}
                  </span>
                </div>

                <h2 class="text-lg font-bold text-evo-navy leading-snug hover:text-evo-cobalt transition-colors">
                  {{ item.title }}
                </h2>

                <p class="text-xs text-evo-text-muted leading-relaxed line-clamp-3">
                  {{ item.description }}
                </p>
              </div>

              <div class="space-y-4 pt-2 border-t border-evo-border">
                <!-- Signature Progress Bar EVO Style -->
                <div class="space-y-1.5">
                  <div class="flex justify-between items-center text-xs">
                    <span class="text-evo-text-muted font-medium">Semnături Colectate:</span>
                    <span class="font-bold text-evo-navy">
                      {{ item.currentSignatureCount }} <span class="text-slate-400 font-normal">/ {{ item.signatureThreshold }} necesare</span>
                    </span>
                  </div>
                  <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      class="bg-gradient-to-r from-evo-cobalt to-evo-cyan h-2 rounded-full transition-all duration-500 shadow-xs"
                      [style.width.%]="calculatePercentage(item)"
                    ></div>
                  </div>
                  <div class="text-[11px] text-right font-bold text-evo-cobalt">
                    {{ calculatePercentage(item) }}% din pragul legal
                  </div>
                </div>

                <div class="flex items-center justify-between pt-2">
                  <div class="text-xs">
                    <span class="text-evo-text-muted">Inițiator:</span>
                    <span class="font-semibold text-evo-navy ml-1">{{ item.authorName }}</span>
                  </div>

                  @if (item.hasSigned) {
                    <span class="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200">
                      <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                      <span>Semnat MSign</span>
                    </span>
                  } @else {
                    <button
                      (click)="signInitiative(item)"
                      [disabled]="signingId === item.id"
                      class="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5"
                    >
                      @if (signingId === item.id) {
                        <span class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Semnează...</span>
                      } @else {
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                        <span>Semnează Digital</span>
                      }
                    </button>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class PublicInitiativesComponent implements OnInit {
  private petitionService = inject(PetitionService);
  private authService = inject(AuthService);
  private router = inject(Router);

  initiatives: PetitionResponse[] = [];
  searchTerm = '';
  selectedCategory = '';
  isLoading = false;
  signingId: number | null = null;

  ngOnInit() {
    this.loadInitiatives();
  }

  loadInitiatives() {
    this.isLoading = true;
    this.petitionService.getPublicInitiatives(this.searchTerm, this.selectedCategory).subscribe({
      next: (res) => {
        this.initiatives = res.content;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onSearch() {
    this.loadInitiatives();
  }

  selectCategory(cat: string) {
    this.selectedCategory = cat;
    this.loadInitiatives();
  }

  calculatePercentage(item: PetitionResponse): number {
    if (!item.signatureThreshold || item.signatureThreshold <= 0) return 100;
    const pct = (item.currentSignatureCount / item.signatureThreshold) * 100;
    return Math.min(Math.round(pct), 100);
  }

  signInitiative(item: PetitionResponse) {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.signingId = item.id;
    this.petitionService.signInitiative(item.id).subscribe({
      next: (res) => {
        this.signingId = null;
        item.currentSignatureCount = res.newSignatureCount;
        item.hasSigned = true;
      },
      error: (err) => {
        this.signingId = null;
        alert(err.error?.message || 'Nu s-a putut înregistra semnătura.');
      }
    });
  }
}

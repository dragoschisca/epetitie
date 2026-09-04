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
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <!-- Hero Banner -->
      <div class="bg-gov-pattern text-white rounded-xl p-8 shadow-md border border-gov-gold/30">
        <div class="max-w-3xl">
          <div class="inline-flex items-center space-x-2 bg-gov-gold/20 text-gov-gold border border-gov-gold/40 text-xs font-bold px-3 py-1 rounded-full mb-3">
            <span>🏛️</span>
            <span>Democrație Participativă Republica Moldova</span>
          </div>
          <h1 class="text-3xl font-extrabold tracking-tight">
            Inițiative Colective ale Cetățenilor
          </h1>
          <p class="text-slate-200 text-sm mt-2 leading-relaxed">
            Susțineți proiectele și cauzele comunitare cu impact național. Odată ce o inițiativă atinge pragul minim de semnături, aceasta este trimisă automat autorităților pentru examinare oficială.
          </p>
        </div>
      </div>

      <!-- Filters & Search Bar -->
      <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div class="w-full md:w-1/2 relative">
          <input
            type="text"
            [(ngModel)]="searchTerm"
            (keyup.enter)="onSearch()"
            placeholder="Căutare după titlu, descriere sau număr tracking..."
            class="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-gov-blue"
          />
          <span class="absolute left-3 top-3 text-slate-400 text-sm">🔍</span>
        </div>

        <div class="flex items-center space-x-3 w-full md:w-auto">
          <select
            [(ngModel)]="selectedCategory"
            (change)="onSearch()"
            class="px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-gov-blue bg-white text-slate-700 font-medium"
          >
            <option value="">Toate Categoriile</option>
            <option value="INFRASTRUCTURA">Infrastructură și Dezvoltare</option>
            <option value="MEDIU">Protecția Mediului</option>
            <option value="SANATATE">Sănătate Publică</option>
            <option value="ADMINISTRATIE_PUBLICA">Administrație Publică</option>
            <option value="SOCIAL">Protecție Socială</option>
            <option value="EDUCATIE">Educație și Cultură</option>
          </select>

          <button
            (click)="onSearch()"
            class="px-4 py-2.5 bg-gov-blue text-white font-semibold rounded-lg text-sm hover:bg-gov-blue-dark transition shadow-sm"
          >
            Filtrează
          </button>
        </div>
      </div>

      <!-- Initiatives List Grid -->
      @if (isLoading) {
        <div class="text-center py-12">
          <div class="inline-block w-8 h-8 border-4 border-gov-blue border-t-transparent rounded-full animate-spin"></div>
          <p class="text-sm text-slate-500 mt-2 font-medium">Se încarcă inițiativele publice...</p>
        </div>
      } @else if (initiatives.length === 0) {
        <div class="bg-white rounded-xl p-12 text-center border border-slate-200">
          <div class="text-4xl mb-2">📋</div>
          <h3 class="text-lg font-bold text-slate-700">Nicio inițiativă publică găsită</h3>
          <p class="text-xs text-slate-500 mt-1">Nu există inițiative în curs de colectare conform filtrelor selectate.</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          @for (item of initiatives; track item.id) {
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div class="flex justify-between items-start mb-3">
                  <span class="px-2.5 py-1 bg-blue-50 text-gov-blue text-xs font-semibold rounded-md border border-blue-100">
                    {{ item.category }}
                  </span>
                  <span class="font-mono text-xs font-bold text-slate-400">
                    {{ item.trackingNumber }}
                  </span>
                </div>

                <h3 class="text-lg font-bold text-slate-900 leading-snug mb-2 hover:text-gov-blue transition">
                  {{ item.title }}
                </h3>

                <p class="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                  {{ item.description }}
                </p>
              </div>

              <div>
                <!-- Signature Progress Bar -->
                <div class="space-y-1.5 mb-4">
                  <div class="flex justify-between items-center text-xs font-medium">
                    <span class="text-slate-600">Semnături Strânse:</span>
                    <span class="font-bold text-gov-blue">
                      {{ item.currentSignatureCount }} / {{ item.signatureThreshold }}
                    </span>
                  </div>
                  <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      class="bg-gov-gold h-2.5 rounded-full transition-all duration-500"
                      [style.width.%]="calculatePercentage(item)"
                    ></div>
                  </div>
                </div>

                <div class="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span class="text-xs text-slate-500">
                    Autor: <strong class="text-slate-700">{{ item.authorName }}</strong>
                  </span>

                  @if (item.hasSigned) {
                    <span class="inline-flex items-center space-x-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-200">
                      <span>✓</span>
                      <span>Semnat Digital</span>
                    </span>
                  } @else {
                    <button
                      (click)="signInitiative(item)"
                      [disabled]="signingId === item.id"
                      class="px-4 py-2 bg-gov-blue hover:bg-gov-blue-dark text-white font-semibold rounded-md text-xs shadow-sm transition disabled:opacity-50 flex items-center space-x-1"
                    >
                      @if (signingId === item.id) {
                        <span class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Se semnează...</span>
                      } @else {
                        <span>✍️ Semnează Inițiativa</span>
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

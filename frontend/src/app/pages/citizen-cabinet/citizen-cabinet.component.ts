import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PetitionService } from '../../services/petition.service';
import { AuthService } from '../../services/auth.service';
import { PetitionCategory, PetitionResponse } from '../../models/petition.model';

@Component({
  selector: 'app-citizen-cabinet',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-8">
      <!-- EVO Digital Identity / Wallet Card Section -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Digital Wallet Identity Card -->
        <div class="evo-wallet-card lg:col-span-2 flex flex-col justify-between space-y-6">
          <!-- Card Header / Brand -->
          <div class="flex justify-between items-start">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold uppercase tracking-widest text-cyan-400">EVO DIGITAL WALLET</span>
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <h2 class="text-2xl font-black tracking-tight text-white">
                {{ authService.currentUserSignal()?.fullName }}
              </h2>
            </div>
            <div class="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <svg class="w-6 h-6 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 012-2h2a2 2 0 012 2v1m-6 0h6"/></svg>
            </div>
          </div>

          <!-- Card Details Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-700/60">
            <div>
              <span class="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">Identificator IDNP</span>
              <span class="font-mono text-sm font-bold text-white tracking-wider">{{ authService.currentUserSignal()?.idnp }}</span>
            </div>
            <div>
              <span class="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">Statut Identitate</span>
              <span class="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Verificat MPass
              </span>
            </div>
            <div class="col-span-2 sm:col-span-1">
              <span class="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">Adresă Email</span>
              <span class="text-xs font-semibold text-slate-200 truncate block">{{ authService.currentUserSignal()?.email }}</span>
            </div>
          </div>

          <!-- Card Footer Stats -->
          <div class="flex flex-wrap justify-between items-center text-xs pt-3 border-t border-slate-700/60 text-white gap-2">
            <div class="flex items-center gap-4 text-white font-semibold">
              <span class="flex items-center">Petiții depuse: <strong class="text-cyan-300 font-bold text-base ml-1.5">{{ authoredCount }}</strong></span>
              <span class="text-slate-600">|</span>
              <span class="flex items-center">Inițiative semnate: <strong class="text-cyan-300 font-bold text-base ml-1.5">{{ supportedCount }}</strong></span>
            </div>
            <span class="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-cyan-300 font-mono font-bold text-[10px] tracking-wider uppercase">MD-IDNP-VERIFIED</span>
          </div>
        </div>

        <!-- Quick Action Modular Card -->
        <div class="evo-card p-6 flex flex-col justify-between space-y-4">
          <div class="space-y-2">
            <div class="inline-flex items-center gap-1.5 text-xs font-bold text-evo-cobalt bg-evo-cobalt-light px-2.5 py-1 rounded-lg">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              <span>Serviciul de Petiționare</span>
            </div>
            <h3 class="text-lg font-bold text-evo-navy">Inițiază un Demers Oficial</h3>
            <p class="text-xs text-evo-text-muted leading-relaxed">
              Depune o petiție individuală sau creează o inițiativă publică colectivă pentru comunitatea ta.
            </p>
          </div>

          <button
            (click)="openCreateModal()"
            class="btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm"
            aria-label="Depune o nouă petiție sau inițiativă"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span>Depune Solicitare Nouă</span>
          </button>
        </div>
      </div>

      <!-- EVO Tabs Navigation -->
      <div class="flex items-center gap-2 border-b border-evo-border pb-1" role="tablist">
        <button
          (click)="activeTab = 'authored'; loadAuthored()"
          [class]="activeTab === 'authored' ? 'bg-evo-navy text-white font-bold shadow-sm' : 'bg-slate-100 text-evo-text-muted hover:bg-slate-200'"
          class="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
          role="tab"
          [attr.aria-selected]="activeTab === 'authored'"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          <span>Petițiile Mele Depuse</span>
          <span class="px-2 py-0.5 text-xs rounded-full bg-white/20 font-mono">{{ authoredCount }}</span>
        </button>

        <button
          (click)="activeTab = 'supported'; loadSupported()"
          [class]="activeTab === 'supported' ? 'bg-evo-navy text-white font-bold shadow-sm' : 'bg-slate-100 text-evo-text-muted hover:bg-slate-200'"
          class="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
          role="tab"
          [attr.aria-selected]="activeTab === 'supported'"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
          <span>Inițiative Semnate</span>
          <span class="px-2 py-0.5 text-xs rounded-full bg-white/20 font-mono">{{ supportedCount }}</span>
        </button>
      </div>

      <!-- Tab Content Area -->
      @if (isLoading) {
        <div class="evo-card p-12 text-center space-y-3">
          <div class="inline-block w-8 h-8 border-3 border-evo-cobalt border-t-transparent rounded-full animate-spin"></div>
          <p class="text-sm font-semibold text-evo-text-muted">Se încarcă datele din Registrul Național de Petiții...</p>
        </div>
      } @else if (activeTab === 'authored') {
        @if (authoredPetitions.length === 0) {
          <div class="evo-card p-12 text-center space-y-3">
            <div class="w-14 h-14 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
            </div>
            <h3 class="text-base font-bold text-evo-navy">Nu ai nicio petiție sau inițiativă depusă</h3>
            <p class="text-xs text-evo-text-muted max-w-sm mx-auto">Folosește butonul „Depune Solicitare Nouă” pentru a crea prima ta petiție oficială.</p>
          </div>
        } @else {
          <div class="evo-card overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs sm:text-sm border-collapse">
                <thead class="bg-slate-50 text-evo-navy font-bold uppercase text-[11px] tracking-wider border-b border-evo-border">
                  <tr>
                    <th class="p-4">Cod Urmărire</th>
                    <th class="p-4">Titlu & Categorie</th>
                    <th class="p-4">Tip Demers</th>
                    <th class="p-4">Statut Oficial</th>
                    <th class="p-4">Data Inregistrării</th>
                    <th class="p-4">Termen Soluționare</th>
                    <th class="p-4 text-center">Acțiuni</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-evo-border">
                  @for (item of authoredPetitions; track item.id) {
                    <tr class="hover:bg-slate-50/80 transition-colors">
                      <td class="p-4 font-mono font-bold text-evo-cobalt">#{{ item.trackingNumber }}</td>
                      <td class="p-4 max-w-xs">
                        <div class="font-bold text-evo-navy text-sm truncate" [title]="item.title">{{ item.title }}</div>
                        <div class="text-evo-text-muted text-xs mt-0.5">{{ item.category }}</div>
                      </td>
                      <td class="p-4">
                        @if (item.isPublicInitiative) {
                          <span class="px-2.5 py-1 bg-cyan-50 text-cyan-800 font-bold rounded-lg border border-cyan-200 text-[11px]">
                            Colectivă ({{ item.currentSignatureCount }}/{{ item.signatureThreshold }})
                          </span>
                        } @else {
                          <span class="px-2.5 py-1 bg-slate-100 text-slate-700 font-bold rounded-lg border border-slate-200 text-[11px]">
                            Individuală
                          </span>
                        }
                      </td>
                      <td class="p-4">
                        <span class="px-3 py-1 font-bold rounded-full text-xs border" [ngClass]="getStatusBadgeClass(item.status)">
                          {{ item.status }}
                        </span>
                      </td>
                      <td class="p-4 text-evo-text-muted">
                        {{ item.submissionDate ? (item.submissionDate | date:'dd.MM.yyyy HH:mm') : 'În colectare' }}
                      </td>
                      <td class="p-4 font-medium text-evo-navy">
                        @if (item.deadlineDate) {
                          <div class="font-bold">{{ item.deadlineDate | date:'dd.MM.yyyy' }}</div>
                          <div class="text-xs" [ngClass]="item.daysRemaining && item.daysRemaining < 7 ? 'text-red-600 font-bold' : 'text-evo-text-muted'">
                            ({{ item.daysRemaining }} zile)
                          </div>
                        } @else {
                          <span class="text-evo-text-muted">-</span>
                        }
                      </td>
                      <td class="p-4">
                        <div class="flex items-center justify-center gap-1">
                          @if (item.status === 'SUBMITTED' || item.status === 'COLLECTING_SIGNATURES') {
                            <button (click)="openEditModal(item)" class="p-1.5 text-evo-cobalt hover:bg-evo-cobalt-light rounded-lg transition-colors" title="Editează">
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                            </button>
                            <button (click)="deletePetition(item.id)" class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Șterge">
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                            </button>
                          } @else {
                            <span class="text-xs text-slate-400 italic">În procesare</span>
                          }
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      } @else {
        <!-- Supported Tab -->
        @if (supportedPetitions.length === 0) {
          <div class="evo-card p-12 text-center space-y-3">
            <div class="w-14 h-14 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <h3 class="text-base font-bold text-evo-navy">Nu ai semnat nicio inițiativă publică</h3>
            <p class="text-xs text-evo-text-muted max-w-sm mx-auto">Explorează secțiunea „Inițiative Publice” pentru a susține cauzele din comunitate.</p>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            @for (item of supportedPetitions; track item.id) {
              <div class="evo-card p-6 space-y-3">
                <div class="flex justify-between items-center">
                  <span class="font-mono text-xs font-bold text-evo-cobalt bg-evo-cobalt-light px-2.5 py-1 rounded-md">#{{ item.trackingNumber }}</span>
                  <span class="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    Semnat MSign
                  </span>
                </div>
                <h4 class="font-bold text-evo-navy text-base leading-snug">{{ item.title }}</h4>
                <p class="text-xs text-evo-text-muted line-clamp-3 leading-relaxed">{{ item.description }}</p>
              </div>
            }
          </div>
        }
      }

      <!-- Modal Creation / Edit Wizard EVO Style -->
      @if (showModal) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 border border-evo-border max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true">
            <div class="flex justify-between items-center border-b border-evo-border pb-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-evo-cobalt-light text-evo-cobalt flex items-center justify-center">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                </div>
                <div>
                  <h3 class="text-lg font-extrabold text-evo-navy">
                    {{ editingPetitionId ? 'Editare Petiție Digitală' : 'Depunere Solicitare Oficială' }}
                  </h3>
                  <p class="text-xs text-evo-text-muted">Serviciul de Petiționare EVO Moldova</p>
                </div>
              </div>
              <button (click)="closeModal()" class="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <form [formGroup]="createForm" (ngSubmit)="submitPetition()" class="space-y-5">
              @if (!editingPetitionId) {
                <div class="space-y-2">
                  <label class="block text-xs font-bold uppercase tracking-wider text-evo-navy">Tipul Demersului <span class="text-red-500">*</span></label>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label
                      class="p-4 rounded-2xl border cursor-pointer flex flex-col justify-between transition-all"
                      [ngClass]="createForm.get('isPublicInitiative')?.value === false ? 'border-evo-cobalt bg-evo-cobalt-light/50 ring-2 ring-evo-cobalt' : 'border-evo-border bg-white hover:border-slate-300'"
                    >
                      <input type="radio" formControlName="isPublicInitiative" [value]="false" class="sr-only" />
                      <div class="font-bold text-sm text-evo-navy">Petiție Individuală</div>
                      <div class="text-xs text-evo-text-muted mt-1">Soluționare directă conform termenului de 30 de zile.</div>
                    </label>

                    <label
                      class="p-4 rounded-2xl border cursor-pointer flex flex-col justify-between transition-all"
                      [ngClass]="createForm.get('isPublicInitiative')?.value === true ? 'border-evo-cobalt bg-evo-cobalt-light/50 ring-2 ring-evo-cobalt' : 'border-evo-border bg-white hover:border-slate-300'"
                    >
                      <input type="radio" formControlName="isPublicInitiative" [value]="true" class="sr-only" />
                      <div class="font-bold text-sm text-evo-navy">Inițiativă Colectivă</div>
                      <div class="text-xs text-evo-text-muted mt-1">Se publică pentru colectare de semnături MSign.</div>
                    </label>
                  </div>
                </div>

                @if (createForm.get('isPublicInitiative')?.value === true) {
                  <div class="space-y-1.5">
                    <label for="threshold" class="block text-xs font-bold uppercase tracking-wider text-evo-navy">Prag Minim Semnături <span class="text-red-500">*</span></label>
                    <select id="threshold" formControlName="signatureThreshold" class="w-full px-4 py-2.5 bg-slate-50 border border-evo-border rounded-xl text-sm font-semibold text-evo-navy focus:bg-white focus:ring-2 focus:ring-evo-cobalt transition-all">
                      <option [value]="50">50 Semnături (Locală / Comunitate)</option>
                      <option [value]="100">100 Semnături (Raională / Municipală)</option>
                      <option [value]="500">500 Semnături (Națională)</option>
                    </select>
                  </div>
                }
              }

              <div class="space-y-1.5">
                <label for="category" class="block text-xs font-bold uppercase tracking-wider text-evo-navy">Categorie Domeniu <span class="text-red-500">*</span></label>
                <select id="category" formControlName="category" class="w-full px-4 py-2.5 bg-slate-50 border border-evo-border rounded-xl text-sm font-semibold text-evo-navy focus:bg-white focus:ring-2 focus:ring-evo-cobalt transition-all">
                  <option value="INFRASTRUCTURA">Infrastructură & Dezvoltare Regională</option>
                  <option value="MEDIU">Protecția Mediului & Resurse Naturale</option>
                  <option value="SANATATE">Sănătate Publică & Asistență Socială</option>
                  <option value="ADMINISTRATIE_PUBLICA">Administrație Publică & Servicii</option>
                  <option value="SOCIAL">Protecție Socială & Muncă</option>
                  <option value="EDUCATIE">Educație, Cultură & Cercetare</option>
                </select>
              </div>

              <div class="space-y-1.5">
                <label for="title" class="block text-xs font-bold uppercase tracking-wider text-evo-navy">Titlu Demers <span class="text-red-500">*</span></label>
                <input id="title" type="text" formControlName="title" placeholder="ex: Modernizarea iluminatului public pe strada Ştefan cel Mare" class="w-full px-4 py-2.5 bg-slate-50 border border-evo-border rounded-xl text-sm font-medium text-evo-navy focus:bg-white focus:ring-2 focus:ring-evo-cobalt transition-all" />
              </div>

              <div class="space-y-1.5">
                <label for="desc" class="block text-xs font-bold uppercase tracking-wider text-evo-navy">Conținut & Motivație Detaliată <span class="text-red-500">*</span></label>
                <textarea id="desc" formControlName="description" rows="5" placeholder="Descrieți problema, argumentele și măsurile solicitate autorităților..." class="w-full px-4 py-2.5 bg-slate-50 border border-evo-border rounded-xl text-sm font-medium text-evo-navy focus:bg-white focus:ring-2 focus:ring-evo-cobalt transition-all"></textarea>
              </div>

              <div class="bg-evo-cobalt-light p-4 rounded-2xl border border-blue-100 text-xs text-evo-cobalt flex items-start gap-2.5">
                <svg class="w-5 h-5 flex-shrink-0 text-evo-cobalt" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                <span><strong>Triage Automatizat AI:</strong> Sistemul efectuează clasificarea automată a solicitării și repartizarea către inspectoratul competent.</span>
              </div>

              <div class="flex justify-end gap-3 pt-4 border-t border-evo-border">
                <button type="button" (click)="closeModal()" class="btn-secondary py-2">Renunță</button>
                <button type="submit" [disabled]="createForm.invalid || isSubmitting" class="btn-primary py-2 disabled:opacity-50">
                  @if (isSubmitting) {
                    <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Se salvează...</span>
                  } @else {
                    <span>{{ editingPetitionId ? 'Salvează Modificările' : 'Transmite Oficial' }}</span>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class CitizenCabinetComponent implements OnInit {
  authService = inject(AuthService);
  private petitionService = inject(PetitionService);
  private fb = inject(FormBuilder);

  activeTab: 'authored' | 'supported' = 'authored';
  authoredPetitions: PetitionResponse[] = [];
  supportedPetitions: PetitionResponse[] = [];
  authoredCount = 0;
  supportedCount = 0;
  isLoading = false;
  showModal = false;
  isSubmitting = false;
  editingPetitionId: number | null = null;

  createForm = this.fb.group({
    isPublicInitiative: [false, Validators.required],
    signatureThreshold: [50],
    category: ['INFRASTRUCTURA', Validators.required],
    title: ['', [Validators.required, Validators.minLength(10)]],
    description: ['', [Validators.required, Validators.minLength(30)]]
  });

  ngOnInit() {
    this.loadAuthored();
    this.loadSupported();
  }

  loadAuthored() {
    this.isLoading = true;
    this.petitionService.getMyAuthoredPetitions().subscribe({
      next: (res) => {
        this.authoredPetitions = res.content;
        this.authoredCount = res.totalElements;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  loadSupported() {
    this.petitionService.getMySupportedInitiatives().subscribe({
      next: (res) => {
        this.supportedPetitions = res.content;
        this.supportedCount = res.totalElements;
      }
    });
  }

  openCreateModal() {
    this.editingPetitionId = null;
    this.createForm.reset({ isPublicInitiative: false, signatureThreshold: 50, category: 'INFRASTRUCTURA' });
    this.showModal = true;
  }

  openEditModal(petition: PetitionResponse) {
    this.editingPetitionId = petition.id;
    this.createForm.patchValue({
      isPublicInitiative: petition.isPublicInitiative,
      signatureThreshold: petition.signatureThreshold,
      category: petition.category,
      title: petition.title,
      description: petition.description
    });
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingPetitionId = null;
  }

  submitPetition() {
    if (this.createForm.invalid) return;

    this.isSubmitting = true;
    const val = this.createForm.getRawValue();

    const requestPayload = {
      title: val.title!,
      description: val.description!,
      category: val.category as PetitionCategory,
      isPublicInitiative: val.isPublicInitiative!,
      signatureThreshold: val.signatureThreshold!
    };

    if (this.editingPetitionId) {
      this.petitionService.updatePetition(this.editingPetitionId, requestPayload).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.closeModal();
          this.loadAuthored();
        },
        error: (err) => {
          this.isSubmitting = false;
          alert(err.error?.message || 'Nu s-a putut edita petiția.');
        }
      });
    } else {
      this.petitionService.createPetition(requestPayload).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.closeModal();
          this.loadAuthored();
        },
        error: (err) => {
          this.isSubmitting = false;
          alert(err.error?.message || 'Nu s-a putut crea petiția.');
        }
      });
    }
  }

  deletePetition(id: number) {
    if (confirm('Sunteți sigur că doriți să ștergeți această petiție? Această acțiune este ireversibilă.')) {
      this.petitionService.deletePetition(id).subscribe({
        next: () => {
          this.loadAuthored();
        },
        error: (err) => {
          alert(err.error?.message || 'Eroare la ștergerea petiției.');
        }
      });
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'SUBMITTED': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'COLLECTING_SIGNATURES': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'IN_REVIEW': return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'RESOLVED': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'REJECTED': return 'bg-red-50 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  }
}

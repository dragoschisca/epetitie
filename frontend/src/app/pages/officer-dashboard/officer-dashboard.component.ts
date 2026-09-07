import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PetitionService } from '../../services/petition.service';
import { AuthService } from '../../services/auth.service';
import { AiResolutionDraft, PetitionDetail, PetitionResponse, PetitionStatus } from '../../models/petition.model';

@Component({
  selector: 'app-officer-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8">
      <!-- Back-Office Header Banner EVO GovTech Style -->
      <div class="bg-[#0F172A] text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div class="space-y-2 max-w-2xl">
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-400/40 text-xs font-bold rounded-full uppercase tracking-wider">
              Acces Restricționat Inspectorat
            </span>
            <span class="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Ghișeu Inspector • Audit & Rezoluție
          </h1>
          <p class="text-xs sm:text-sm text-slate-200">
            Inspector: <strong class="text-white font-bold">{{ authService.currentUserSignal()?.fullName }}</strong> • Departamentul: <span class="text-cyan-300 font-bold">{{ authService.currentUserSignal()?.department || 'Infrastructură & Dezvoltare Regională' }}</span>
          </p>
        </div>

        <div class="bg-slate-800/90 border border-slate-700 p-4 rounded-2xl text-xs space-y-1">
          <div class="text-slate-300 font-medium">Termen Limită Legal SLA (Cod Admin. RM):</div>
          <div class="font-bold text-cyan-300 text-sm flex items-center gap-1.5">
            <svg class="w-4 h-4 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span>30 Zile Calendaristice</span>
          </div>
        </div>
      </div>

      <!-- Analytical Metrics Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Total -->
        <div class="evo-card p-5 flex items-center justify-between">
          <div>
            <div class="text-xs font-bold text-evo-text-muted uppercase tracking-wider">Total Registru</div>
            <div class="text-2xl font-black text-evo-navy mt-1">{{ totalElements }}</div>
          </div>
          <div class="w-11 h-11 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
          </div>
        </div>

        <!-- In Review -->
        <div class="evo-card p-5 flex items-center justify-between">
          <div>
            <div class="text-xs font-bold text-amber-600 uppercase tracking-wider">În Examinare</div>
            <div class="text-2xl font-black text-amber-600 mt-1">{{ inReviewCount }}</div>
          </div>
          <div class="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
        </div>

        <!-- Critical SLA -->
        <div class="evo-card p-5 flex items-center justify-between">
          <div>
            <div class="text-xs font-bold text-rose-600 uppercase tracking-wider">Atenție SLA (&lt;7 Zile)</div>
            <div class="text-2xl font-black text-rose-600 mt-1">{{ criticalSlaCount }}</div>
          </div>
          <div class="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          </div>
        </div>

        <!-- Resolved -->
        <div class="evo-card p-5 flex items-center justify-between">
          <div>
            <div class="text-xs font-bold text-emerald-600 uppercase tracking-wider">Soluționate</div>
            <div class="text-2xl font-black text-emerald-600 mt-1">{{ resolvedCount }}</div>
          </div>
          <div class="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
        </div>
      </div>

      <!-- Search & Filters Bar EVO Style -->
      <div class="evo-card p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div class="w-full md:w-1/3 relative">
          <svg class="w-4 h-4 text-evo-text-muted absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            [(ngModel)]="searchKeyword"
            (keyup.enter)="loadPetitions()"
            placeholder="Caută solicitant, titlu, IDNP sau tracking..."
            class="w-full pl-10 pr-4 py-2 bg-slate-50 border border-evo-border rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-evo-cobalt transition-all"
          />
        </div>

        <div class="flex flex-wrap gap-2.5 w-full md:w-auto items-center">
          <select [(ngModel)]="statusFilter" (change)="loadPetitions()" class="px-3.5 py-2 bg-slate-50 border border-evo-border rounded-xl text-xs font-semibold text-evo-navy focus:bg-white transition-all">
            <option value="">Toate Statusurile</option>
            <option value="SUBMITTED">Inregistrate / Depuse</option>
            <option value="IN_REVIEW">În Examinare</option>
            <option value="REDIRECTED">Redirecționate</option>
            <option value="RESOLVED">Soluționate</option>
            <option value="REJECTED">Respinse</option>
          </select>

          <select [(ngModel)]="categoryFilter" (change)="loadPetitions()" class="px-3.5 py-2 bg-slate-50 border border-evo-border rounded-xl text-xs font-semibold text-evo-navy focus:bg-white transition-all">
            <option value="">Toate Categoriile</option>
            <option value="INFRASTRUCTURA">Infrastructură</option>
            <option value="MEDIU">Mediu</option>
            <option value="SANATATE">Sănătate</option>
            <option value="ADMINISTRATIE_PUBLICA">Administrație Publică</option>
          </select>

          <button (click)="loadPetitions()" class="btn-primary text-xs py-2 px-4">
            Filtrează
          </button>
        </div>
      </div>

      <!-- Petitions Table with SLA Indicators -->
      <div class="evo-card overflow-hidden">
        @if (isLoading) {
          <div class="p-12 text-center space-y-3">
            <div class="inline-block w-8 h-8 border-3 border-evo-cobalt border-t-transparent rounded-full animate-spin"></div>
            <p class="text-xs font-semibold text-evo-text-muted">Se încarcă registrul dosarelor administrative...</p>
          </div>
        } @else if (petitions.length === 0) {
          <div class="p-12 text-center text-evo-text-muted text-xs">
            Niciun dosar găsit conform filtrelor selectate.
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead class="bg-slate-50 text-evo-navy font-bold uppercase text-[11px] tracking-wider border-b border-evo-border">
                <tr>
                  <th class="p-4">Urgență SLA</th>
                  <th class="p-4">Nr. Tracking</th>
                  <th class="p-4">Solicitant</th>
                  <th class="p-4">Titlu & Categorie</th>
                  <th class="p-4">Status Curent</th>
                  <th class="p-4 text-right">Acțiuni Inspector</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-evo-border">
                @for (item of petitions; track item.id) {
                  <tr class="hover:bg-slate-50/80 transition-colors">
                    <td class="p-4">
                      @if (item.daysRemaining !== undefined && item.daysRemaining !== null) {
                        @if (item.daysRemaining < 0) {
                          <span class="px-2.5 py-1 bg-rose-600 text-white font-bold text-[10px] rounded-lg animate-pulse inline-block">
                            DEPĂȘIT ({{ item.daysRemaining * -1 }}z)
                          </span>
                        } @else if (item.daysRemaining <= 7) {
                          <span class="px-2.5 py-1 bg-amber-500 text-white font-bold text-[10px] rounded-lg inline-block">
                            CRITIC ({{ item.daysRemaining }}z)
                          </span>
                        } @else {
                          <span class="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px] rounded-lg inline-block">
                            În Termen ({{ item.daysRemaining }}z)
                          </span>
                        }
                      } @else {
                        <span class="text-slate-400 font-mono">-</span>
                      }
                    </td>

                    <td class="p-4 font-mono font-bold text-evo-cobalt">#{{ item.trackingNumber }}</td>
                    <td class="p-4 font-semibold text-evo-navy">{{ item.authorName }}</td>
                    <td class="p-4">
                      <div class="font-bold text-evo-navy max-w-xs truncate">{{ item.title }}</div>
                      <div class="text-[10px] text-evo-text-muted">{{ item.category }}</div>
                    </td>
                    <td class="p-4">
                      <span class="px-2.5 py-1 font-bold rounded-full text-[11px] border" [ngClass]="getStatusBadgeClass(item.status)">
                        {{ item.status }}
                      </span>
                    </td>
                    <td class="p-4 text-right space-x-2">
                      <button
                        (click)="inspectPetition(item.id)"
                        class="btn-primary text-xs py-1.5 px-3"
                      >
                        Examinare Dosar & AI
                      </button>
                      <button
                        (click)="downloadPdf(item.id)"
                        class="btn-secondary text-xs py-1.5 px-2.5"
                        title="Descarcă Recipisă PDF"
                      >
                        📄 PDF
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <!-- Detail & Gemini AI Action Modal -->
      @if (selectedDetail) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div class="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 border border-evo-border my-8 max-h-[90vh] overflow-y-auto">
            <!-- Modal Header -->
            <div class="flex justify-between items-start border-b border-evo-border pb-4">
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-mono font-bold text-evo-cobalt text-xs bg-evo-cobalt-light px-2.5 py-1 rounded-md">#{{ selectedDetail.trackingNumber }}</span>
                  <span class="px-2.5 py-1 text-xs font-bold rounded-full border" [ngClass]="getStatusBadgeClass(selectedDetail.status)">{{ selectedDetail.status }}</span>
                </div>
                <h2 class="text-xl font-extrabold text-evo-navy mt-2">{{ selectedDetail.title }}</h2>
              </div>
              <button (click)="closeDetail()" class="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <!-- Solicitant & Content Info Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-evo-border text-xs">
              <div>
                <span class="text-evo-text-muted font-medium block mb-0.5">Solicitant / Petiționar:</span>
                <span class="font-bold text-evo-navy">{{ selectedDetail.authorName }}</span> (IDNP: {{ selectedDetail.authorIdnp || 'N/A' }})
              </div>
              <div>
                <span class="text-evo-text-muted font-medium block mb-0.5">Data Înregistrării & Termen SLA:</span>
                <span class="font-bold text-evo-navy">{{ selectedDetail.submissionDate | date:'dd.MM.yyyy HH:mm' }}</span> (Termen: {{ selectedDetail.deadlineDate | date:'dd.MM.yyyy' }})
              </div>
            </div>

            <!-- Distinct High-Contrast Petition Description Card -->
            <div class="space-y-1.5">
              <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <svg class="w-4 h-4 text-evo-cobalt" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                <span>Conținut & Descriere Solicitare:</span>
              </h4>
              <div class="text-sm text-slate-900 bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm leading-relaxed whitespace-pre-line font-medium">
                {{ selectedDetail.description }}
              </div>
            </div>

            <!-- Distinct Dark Navy / Cyan Gemini AI Triage Section -->
            <div class="bg-gradient-to-br from-evo-navy via-slate-900 to-slate-800 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-3 text-white">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                  <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  <span>Analiză Executivă Gemini AI Triage</span>
                </div>
                <span class="text-[10px] bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 px-2.5 py-0.5 rounded-full font-bold">Model Gemini 1.5 Flash</span>
              </div>
              <p class="text-xs text-slate-100 font-medium leading-relaxed italic bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
                "{{ selectedDetail.aiTriageSummary || 'Petiție procesată preliminar.' }}"
              </p>
            </div>

            <!-- Gemini AI Resolution Generator Button & Draft Box -->
            <div class="border-t border-evo-border pt-4 space-y-3">
              <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <h4 class="text-xs font-bold text-evo-navy uppercase tracking-wider">Asistent Decizie Administrativă</h4>
                <button
                  (click)="generateAiResolutionDraft()"
                  [disabled]="isAiGenerating"
                  class="btn-primary text-xs py-2 px-3.5 bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-1.5"
                >
                  @if (isAiGenerating) {
                    <span class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Generare Proiect Rezoluție...</span>
                  } @else {
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
                    <span>Generare Decizie cu AI (Gemini)</span>
                  }
                </button>
              </div>

              @if (aiResolutionDraft) {
                <div class="bg-amber-50/80 border border-amber-200 p-4 rounded-2xl text-xs space-y-2">
                  <div class="font-bold text-amber-950 flex justify-between items-center">
                    <span>Proiect Rezoluție Elaborat de AI:</span>
                    <span class="text-[10px] text-amber-800 font-mono bg-amber-100 px-2 py-0.5 rounded-md">{{ aiResolutionDraft.legalBasisReference }}</span>
                  </div>
                  <pre class="font-sans whitespace-pre-wrap text-slate-800 bg-white p-3.5 rounded-xl border border-amber-200 text-xs leading-relaxed">{{ aiResolutionDraft.draftResolutionText }}</pre>
                  <button (click)="useAiDraft()" class="text-xs font-bold text-indigo-700 hover:text-indigo-900 transition-colors">
                    ↪ Preluare text în câmpul de decizie oficială
                  </button>
                </div>
              }
            </div>

            <!-- Status Transition & Resolution Form -->
            <div class="border-t border-evo-border pt-4 space-y-4">
              <h4 class="text-xs font-bold text-evo-navy uppercase tracking-wider">Tranziție Status & Rezoluție Finală</h4>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="block text-xs font-semibold text-evo-navy">Actualizare Status:</label>
                  <select [(ngModel)]="newStatus" class="w-full px-3.5 py-2.5 bg-slate-50 border border-evo-border rounded-xl text-xs font-bold text-evo-navy focus:bg-white transition-all">
                    <option value="IN_REVIEW">În Examinare</option>
                    <option value="REDIRECTED">Redirecționat altui Departament</option>
                    <option value="RESOLVED">Soluționat Aprobant</option>
                    <option value="REJECTED">Respins (Motivat)</option>
                  </select>
                </div>

                <div class="space-y-1">
                  <label class="block text-xs font-semibold text-evo-navy">Notă Internă Audit:</label>
                  <input type="text" [(ngModel)]="statusNote" placeholder="ex: Verificări efectuate de inspector la teren." class="w-full px-3.5 py-2.5 bg-slate-50 border border-evo-border rounded-xl text-xs font-medium focus:bg-white transition-all" />
                </div>
              </div>

              <div class="space-y-1">
                <label class="block text-xs font-semibold text-evo-navy">Rezoluție Administrativă Oficială (Dispozitiv Decizie):</label>
                <textarea [(ngModel)]="resolutionText" rows="4" placeholder="Introduceți textul deciziei finale transmis petiționarului..." class="w-full px-3.5 py-2.5 bg-slate-50 border border-evo-border rounded-xl text-xs font-sans text-evo-navy focus:bg-white transition-all"></textarea>
              </div>

              <div class="flex justify-end gap-3 pt-2 border-t border-evo-border">
                <button (click)="closeDetail()" class="btn-secondary text-xs py-2">Închide</button>
                <button (click)="saveStatusUpdate()" [disabled]="isSavingStatus" class="btn-primary text-xs py-2 px-5">
                  @if (isSavingStatus) {
                    <span>Se salvează decizia...</span>
                  } @else {
                    <span>Salvează Decizia Oficială</span>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class OfficerDashboardComponent implements OnInit {
  authService = inject(AuthService);
  private petitionService = inject(PetitionService);

  petitions: PetitionResponse[] = [];
  isLoading = false;
  totalElements = 0;
  inReviewCount = 0;
  criticalSlaCount = 0;
  resolvedCount = 0;

  searchKeyword = '';
  statusFilter = '';
  categoryFilter = '';

  selectedDetail: PetitionDetail | null = null;
  aiResolutionDraft: AiResolutionDraft | null = null;
  isAiGenerating = false;

  newStatus: PetitionStatus = 'IN_REVIEW';
  resolutionText = '';
  statusNote = '';
  isSavingStatus = false;

  ngOnInit() {
    this.loadPetitions();
  }

  loadPetitions() {
    this.isLoading = true;
    this.petitionService.searchPetitionsOfficer({
      search: this.searchKeyword,
      status: this.statusFilter,
      category: this.categoryFilter
    }).subscribe({
      next: (res) => {
        this.petitions = res.content;
        this.totalElements = res.totalElements;

        this.inReviewCount = this.petitions.filter(p => p.status === 'IN_REVIEW' || p.status === 'SUBMITTED').length;
        this.criticalSlaCount = this.petitions.filter(p => p.daysRemaining !== undefined && p.daysRemaining !== null && p.daysRemaining <= 7).length;
        this.resolvedCount = this.petitions.filter(p => p.status === 'RESOLVED').length;

        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  inspectPetition(id: number) {
    this.petitionService.getPetitionDetailsOfficer(id).subscribe({
      next: (detail) => {
        this.selectedDetail = detail;
        this.newStatus = detail.status;
        this.resolutionText = detail.resolutionText || '';
        this.statusNote = '';
        this.aiResolutionDraft = null;
      }
    });
  }

  closeDetail() {
    this.selectedDetail = null;
    this.aiResolutionDraft = null;
  }

  generateAiResolutionDraft() {
    if (!this.selectedDetail) return;
    this.isAiGenerating = true;

    this.petitionService.generateAiDraftResolution(this.selectedDetail.id).subscribe({
      next: (draft) => {
        this.aiResolutionDraft = draft;
        this.isAiGenerating = false;
      },
      error: (err) => {
        this.isAiGenerating = false;
        alert(err.error?.message || 'Nu s-a putut genera rezoluția cu Gemini AI.');
      }
    });
  }

  useAiDraft() {
    if (this.aiResolutionDraft) {
      this.resolutionText = this.aiResolutionDraft.draftResolutionText;
    }
  }

  saveStatusUpdate() {
    if (!this.selectedDetail) return;
    this.isSavingStatus = true;

    this.petitionService.updatePetitionStatus(this.selectedDetail.id, {
      newStatus: this.newStatus,
      resolutionText: this.resolutionText,
      note: this.statusNote
    }).subscribe({
      next: (updatedDetail) => {
        this.isSavingStatus = false;
        this.selectedDetail = updatedDetail;
        this.loadPetitions();
      },
      error: (err) => {
        this.isSavingStatus = false;
        alert(err.error?.message || 'Nu s-a putut salva actualizarea statusului.');
      }
    });
  }

  downloadPdf(id: number) {
    this.petitionService.downloadPetitionReceiptPdf(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Recipisa_Petitie_${id}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => alert('Nu s-a putut descărca recipisa PDF.')
    });
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

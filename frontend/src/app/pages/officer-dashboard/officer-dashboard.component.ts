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
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <!-- Back-Office Header Banner -->
      <div class="bg-gov-blue text-white p-6 rounded-xl shadow-md border-l-8 border-gov-red flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div class="flex items-center space-x-2">
            <span class="px-2.5 py-0.5 bg-gov-red text-white text-xs font-bold rounded">Strict Confidențial</span>
            <h1 class="text-2xl font-bold">Ghișeu Inspector / Auditor Administrative</h1>
          </div>
          <p class="text-xs text-slate-300 mt-1">
            Inspector: <strong>{{ authService.currentUserSignal()?.fullName }}</strong> • Departament: <span class="text-gov-gold font-bold">{{ authService.currentUserSignal()?.department || 'Infrastructură și Dezvoltare Regională' }}</span>
          </p>
        </div>

        <div class="flex items-center space-x-3 bg-gov-blue-dark/80 p-3 rounded-lg border border-white/10 text-xs">
          <div>
            <div class="text-slate-300">Termen Limită Legal SLA:</div>
            <div class="font-bold text-gov-gold">30 Zile Calendaristice (Cod Admin. RM)</div>
          </div>
        </div>
      </div>

      <!-- Filters & SLA Alert Counters -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <div class="text-xs font-bold text-slate-500 uppercase">Total Petiții</div>
            <div class="text-2xl font-bold text-slate-900">{{ totalElements }}</div>
          </div>
          <div class="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-lg">📁</div>
        </div>

        <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <div class="text-xs font-bold text-amber-600 uppercase">În Examinare</div>
            <div class="text-2xl font-bold text-amber-600">{{ inReviewCount }}</div>
          </div>
          <div class="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center text-lg">⏳</div>
        </div>

        <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <div class="text-xs font-bold text-gov-red uppercase">Atenție SLA (<7 Zile)</div>
            <div class="text-2xl font-bold text-gov-red">{{ criticalSlaCount }}</div>
          </div>
          <div class="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-lg">🚨</div>
        </div>

        <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <div class="text-xs font-bold text-emerald-600 uppercase">Soluționate</div>
            <div class="text-2xl font-bold text-emerald-600">{{ resolvedCount }}</div>
          </div>
          <div class="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-lg">✅</div>
        </div>
      </div>

      <!-- Search & Status Filters -->
      <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div class="w-full md:w-1/3">
          <input
            type="text"
            [(ngModel)]="searchKeyword"
            (keyup.enter)="loadPetitions()"
            placeholder="Căutare după solicitant, titlu, IDNP sau tracking..."
            class="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-gov-blue"
          />
        </div>

        <div class="flex flex-wrap gap-2 w-full md:w-auto">
          <select [(ngModel)]="statusFilter" (change)="loadPetitions()" class="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white">
            <option value="">Toate Statusurile</option>
            <option value="SUBMITTED">Inregistrate / Depuse</option>
            <option value="IN_REVIEW">În Examinare</option>
            <option value="REDIRECTED">Redirecționate</option>
            <option value="RESOLVED">Soluționate</option>
            <option value="REJECTED">Respinse</option>
          </select>

          <select [(ngModel)]="categoryFilter" (change)="loadPetitions()" class="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white">
            <option value="">Toate Categoriile</option>
            <option value="INFRASTRUCTURA">Infrastructură</option>
            <option value="MEDIU">Mediu</option>
            <option value="SANATATE">Sănătate</option>
            <option value="ADMINISTRATIE_PUBLICA">Administrație Publică</option>
          </select>

          <button (click)="loadPetitions()" class="px-4 py-2 bg-gov-blue text-white rounded-lg text-xs font-semibold hover:bg-gov-blue-dark">
            Filtrează
          </button>
        </div>
      </div>

      <!-- Petitions Table with SLA Indicators -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        @if (isLoading) {
          <div class="text-center py-12">
            <div class="inline-block w-8 h-8 border-4 border-gov-blue border-t-transparent rounded-full animate-spin"></div>
            <p class="text-xs text-slate-500 mt-2">Se încarcă registrul dosarelor...</p>
          </div>
        } @else if (petitions.length === 0) {
          <div class="p-12 text-center text-slate-500 text-xs">
            Niciun dosar găsit conform filtrelor selectate.
          </div>
        } @else {
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th class="p-3.5">Urgență SLA</th>
                <th class="p-3.5">Nr. Tracking</th>
                <th class="p-3.5">Solicitant</th>
                <th class="p-3.5">Titlu & Categorie</th>
                <th class="p-3.5">Status Curent</th>
                <th class="p-3.5 text-right">Acțiuni Inspector</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              @for (item of petitions; track item.id) {
                <tr class="hover:bg-slate-50 transition">
                  <!-- SLA Badge Indicator -->
                  <td class="p-3.5">
                    @if (item.daysRemaining !== undefined && item.daysRemaining !== null) {
                      @if (item.daysRemaining < 0) {
                        <span class="px-2.5 py-1 bg-gov-red text-white font-bold text-[10px] rounded animate-pulse">
                          DEPADĂ ({{ item.daysRemaining * -1 }}z)
                        </span>
                      } @else if (item.daysRemaining <= 7) {
                        <span class="px-2.5 py-1 bg-amber-500 text-white font-bold text-[10px] rounded">
                          CRITIC ({{ item.daysRemaining }}z)
                        </span>
                      } @else {
                        <span class="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-medium text-[10px] rounded">
                          În Termen ({{ item.daysRemaining }}z)
                        </span>
                      }
                    } @else {
                      <span class="text-slate-400 font-mono">-</span>
                    }
                  </td>

                  <td class="p-3.5 font-mono font-bold text-gov-blue">{{ item.trackingNumber }}</td>
                  <td class="p-3.5 font-medium text-slate-800">{{ item.authorName }}</td>
                  <td class="p-3.5">
                    <div class="font-bold text-slate-900 max-w-xs truncate">{{ item.title }}</div>
                    <div class="text-[10px] text-slate-500">{{ item.category }}</div>
                  </td>
                  <td class="p-3.5">
                    <span class="px-2 py-0.5 font-bold rounded text-[10px]" [ngClass]="getStatusBadgeClass(item.status)">
                      {{ item.status }}
                    </span>
                  </td>
                  <td class="p-3.5 text-right space-x-2">
                    <button
                      (click)="inspectPetition(item.id)"
                      class="px-3 py-1.5 bg-gov-blue hover:bg-gov-blue-dark text-white rounded font-semibold text-[11px] shadow-sm"
                    >
                      Examinare Dosar & AI
                    </button>
                    <button
                      (click)="downloadPdf(item.id)"
                      class="px-2.5 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded text-[11px] font-medium"
                      title="Descarcă Recipisă PDF"
                    >
                      📄 PDF
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>

      <!-- Detail & Gemini AI Action Modal -->
      @if (selectedDetail) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div class="bg-white rounded-xl max-w-4xl w-full p-6 shadow-2xl space-y-6 border border-slate-200 my-8">
            <!-- Modal Header -->
            <div class="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <div class="flex items-center space-x-2">
                  <span class="font-mono font-bold text-gov-blue text-sm">{{ selectedDetail.trackingNumber }}</span>
                  <span class="px-2 py-0.5 text-xs font-bold rounded bg-slate-100">{{ selectedDetail.status }}</span>
                </div>
                <h2 class="text-xl font-bold text-slate-900 mt-1">{{ selectedDetail.title }}</h2>
              </div>
              <button (click)="closeDetail()" class="text-slate-400 hover:text-slate-600 font-bold text-xl">✕</button>
            </div>

            <!-- Solicitant & Content -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
              <div>
                <span class="text-slate-500 font-semibold block mb-0.5">Solicitant / Petiționar:</span>
                <span class="font-bold text-slate-900">{{ selectedDetail.authorName }}</span> (IDNP: {{ selectedDetail.authorIdnp || 'N/A' }})
              </div>
              <div>
                <span class="text-slate-500 font-semibold block mb-0.5">Data Depunerii & Termen Legal:</span>
                <span class="font-bold text-slate-900">{{ selectedDetail.submissionDate | date:'dd.MM.yyyy HH:mm' }}</span> (Termen: {{ selectedDetail.deadlineDate | date:'dd.MM.yyyy' }})
              </div>
            </div>

            <div>
              <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Conținutul Petiției:</h4>
              <p class="text-xs text-slate-800 bg-slate-50 p-4 rounded-lg border border-slate-200 leading-relaxed whitespace-pre-line">
                {{ selectedDetail.description }}
              </p>
            </div>

            <!-- Gemini AI Triage Card -->
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-200 rounded-xl p-4 shadow-sm space-y-2">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2 text-indigo-900 font-bold text-xs">
                  <span>🤖</span>
                  <span>Analiză Executivă Gemini AI Triage:</span>
                </div>
                <span class="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-bold">Model Gemini 1.5 Flash</span>
              </div>
              <p class="text-xs text-indigo-950 font-medium leading-relaxed italic">
                "{{ selectedDetail.aiTriageSummary || 'Petiție procesată preliminar.' }}"
              </p>
            </div>

            <!-- Gemini AI Resolution Generator Button & Draft Box -->
            <div class="border-t border-slate-200 pt-4 space-y-3">
              <div class="flex justify-between items-center">
                <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider">Asistent Decizie Administrativă</h4>
                <button
                  (click)="generateAiResolutionDraft()"
                  [disabled]="isAiGenerating"
                  class="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold shadow-sm transition disabled:opacity-50 flex items-center space-x-1"
                >
                  @if (isAiGenerating) {
                    <span class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Generare Proiect Rezoluție AI...</span>
                  } @else {
                    <span>✨ Generare Proiect Rezoluție Oficială (Gemini AI)</span>
                  }
                </button>
              </div>

              @if (aiResolutionDraft) {
                <div class="bg-amber-50 border border-amber-200 p-4 rounded-lg text-xs space-y-2">
                  <div class="font-bold text-amber-900 flex justify-between">
                    <span>Proiect Rezoluție Elaborat de AI:</span>
                    <span class="text-[10px] text-amber-700 font-mono">{{ aiResolutionDraft.legalBasisReference }}</span>
                  </div>
                  <pre class="font-sans whitespace-pre-wrap text-slate-800 bg-white p-3 rounded border border-amber-200 text-xs leading-relaxed">{{ aiResolutionDraft.draftResolutionText }}</pre>
                  <button (click)="useAiDraft()" class="text-xs font-bold text-indigo-700 hover:underline">
                    ↪ Folosește acest text în câmpul de rezoluție oficială de mai jos
                  </button>
                </div>
              }
            </div>

            <!-- Status Transition & Resolution Form -->
            <div class="border-t border-slate-200 pt-4 space-y-4">
              <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider">Executare Tranziție Status & Rezoluție Finală</h4>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Schimbare Status:</label>
                  <select [(ngModel)]="newStatus" class="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-bold focus:ring-2 focus:ring-gov-blue">
                    <option value="IN_REVIEW">În Examinare</option>
                    <option value="REDIRECTED">Redirecționat altui Departament</option>
                    <option value="RESOLVED">Soluționat Aprobant</option>
                    <option value="REJECTED">Respins (Motivat)</option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Notă Internă Audit:</label>
                  <input type="text" [(ngModel)]="statusNote" placeholder="ex: Verificări efectuate de inspector la teren." class="w-full px-3 py-2 border border-slate-300 rounded-md text-xs" />
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Rezoluție Administrativă Oficială (Dispozitiv Decizie):</label>
                <textarea [(ngModel)]="resolutionText" rows="4" placeholder="Introduceți textul deciziei finale transmis petiționarului..." class="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-sans"></textarea>
              </div>

              <div class="flex justify-end space-x-3 pt-2">
                <button (click)="closeDetail()" class="px-4 py-2 border border-slate-300 text-slate-700 rounded-md text-xs font-semibold">Închide</button>
                <button (click)="saveStatusUpdate()" [disabled]="isSavingStatus" class="px-5 py-2 bg-gov-blue hover:bg-gov-blue-dark text-white rounded-md text-xs font-semibold shadow">
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
      case 'SUBMITTED': return 'bg-blue-100 text-blue-800';
      case 'COLLECTING_SIGNATURES': return 'bg-amber-100 text-amber-800';
      case 'IN_REVIEW': return 'bg-purple-100 text-purple-800';
      case 'RESOLVED': return 'bg-emerald-100 text-emerald-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  }
}

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PetitionService, extractPageContent, extractTotalElements } from '../../services/petition.service';
import { AuthService } from '../../services/auth.service';
import { AiResolutionDraft, PetitionDetail, PetitionResponse, PetitionStatus, getStatusLabel, getCategoryLabel } from '../../models/petition.model';
import { User } from '../../models/user.model';

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
              Acces restricționat inspectorat
            </span>
            <span class="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Ghișeu inspector: audit și rezoluție
          </h1>
          <p class="text-xs sm:text-sm text-slate-200">
            Inspector: <strong class="text-white font-bold">{{ authService.currentUserSignal()?.fullName }}</strong> • Departamentul: <span class="text-cyan-300 font-bold">{{ authService.currentUserSignal()?.department || 'Infrastructură și dezvoltare regională' }}</span>
          </p>
        </div>

        <div class="bg-slate-800/90 border border-slate-700 p-4 rounded-2xl text-xs space-y-1">
          <div class="text-slate-300 font-medium">Termen limită legal SLA (Cod admin. RM):</div>
          <div class="font-bold text-cyan-300 text-sm flex items-center gap-1.5">
            <svg class="w-4 h-4 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span>30 zile calendaristice</span>
          </div>
        </div>
      </div>

      <!-- Analytical Metrics Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Total -->
        <div class="evo-card p-5 flex items-center justify-between">
          <div>
            <div class="text-xs font-bold text-evo-text-muted uppercase tracking-wider">Total registru</div>
            <div class="text-2xl font-black text-evo-navy mt-1">{{ totalElements }}</div>
          </div>
          <div class="w-11 h-11 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
          </div>
        </div>

        <!-- In Review -->
        <div class="evo-card p-5 flex items-center justify-between">
          <div>
            <div class="text-xs font-bold text-amber-600 uppercase tracking-wider">În examinare</div>
            <div class="text-2xl font-black text-amber-600 mt-1">{{ inReviewCount }}</div>
          </div>
          <div class="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
        </div>

        <!-- Critical SLA -->
        <div class="evo-card p-5 flex items-center justify-between">
          <div>
            <div class="text-xs font-bold text-rose-600 uppercase tracking-wider">Atenție SLA (&lt;7 zile)</div>
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
            <option value="">Toate statusurile</option>
            <option value="SUBMITTED">Înregistrate / depuse</option>
            <option value="IN_REVIEW">În examinare</option>
            <option value="REDIRECTED">Redirecționate</option>
            <option value="RESOLVED">Soluționate</option>
            <option value="REJECTED">Respinse</option>
          </select>

          <select [(ngModel)]="categoryFilter" (change)="loadPetitions()" class="px-3.5 py-2 bg-slate-50 border border-evo-border rounded-xl text-xs font-semibold text-evo-navy focus:bg-white transition-all">
            <option value="">Toate categoriile</option>
            <option value="INFRASTRUCTURA">Infrastructură</option>
            <option value="MEDIU">Mediu</option>
            <option value="SANATATE">Sănătate</option>
            <option value="ADMINISTRATIE_PUBLICA">Administrație publică</option>
            <option value="SOCIAL">Protecție socială</option>
            <option value="EDUCATIE">Educație</option>
          </select>

          <select [(ngModel)]="officerFilter" (change)="loadPetitions()" class="px-3.5 py-2 bg-slate-50 border border-evo-border rounded-xl text-xs font-semibold text-evo-navy focus:bg-white transition-all">
            <option [ngValue]="''">Toți inspectorii</option>
            @for (off of officers; track off.id) {
              <option [ngValue]="off.id">{{ off.fullName }}</option>
            }
          </select>

          <button (click)="loadPetitions()" class="btn-primary text-xs py-2 px-4 whitespace-nowrap">
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
                  <th class="px-3.5 py-3.5 whitespace-nowrap">Urgență SLA</th>
                  <th class="px-3.5 py-3.5 whitespace-nowrap">Nr. de urmărire</th>
                  <th class="px-3.5 py-3.5 whitespace-nowrap">Solicitant</th>
                  <th class="px-3.5 py-3.5 whitespace-nowrap">Inspector desemnat</th>
                  <th class="px-3.5 py-3.5">Titlu și categorie</th>
                  <th class="px-3.5 py-3.5 whitespace-nowrap">Status curent</th>
                  <th class="px-3.5 py-3.5 text-right whitespace-nowrap">Acțiuni inspector</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-evo-border">
                @for (item of petitions; track item.id) {
                  <tr class="hover:bg-slate-50/80 transition-colors">
                    <td class="px-3.5 py-3.5 whitespace-nowrap">
                      @if (item.daysRemaining !== undefined && item.daysRemaining !== null) {
                        @if (item.daysRemaining < 0) {
                          <span class="px-2.5 py-1 bg-rose-600 text-white font-bold text-[10px] rounded-lg animate-pulse inline-block whitespace-nowrap">
                            DEPĂȘIT ({{ item.daysRemaining * -1 }}z)
                          </span>
                        } @else if (item.daysRemaining <= 7) {
                          <span class="px-2.5 py-1 bg-amber-500 text-white font-bold text-[10px] rounded-lg inline-block whitespace-nowrap">
                            CRITIC ({{ item.daysRemaining }}z)
                          </span>
                        } @else {
                          <span class="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px] rounded-lg inline-block whitespace-nowrap">
                            În termen ({{ item.daysRemaining }}z)
                          </span>
                        }
                      } @else {
                        <span class="text-slate-400 font-mono">-</span>
                      }
                    </td>

                    <td class="px-3.5 py-3.5 font-mono font-bold text-evo-cobalt whitespace-nowrap">#{{ item.trackingNumber }}</td>
                    <td class="px-3.5 py-3.5 font-semibold text-evo-navy whitespace-nowrap">{{ item.authorName }}</td>
                    <td class="px-3.5 py-3.5 whitespace-nowrap">
                      @if (item.assignedOfficerName) {
                        <span class="px-2.5 py-1 bg-cyan-50 text-cyan-800 font-medium rounded-lg border border-cyan-200 text-[11px] whitespace-nowrap">
                          {{ item.assignedOfficerName }}
                        </span>
                      } @else {
                        <span class="text-slate-400 italic text-[11px]">Nerepartizat</span>
                      }
                    </td>
                    <td class="px-3.5 py-3.5">
                      <div class="font-bold text-evo-navy max-w-xs truncate leading-snug">{{ item.title }}</div>
                      <div class="mt-1 flex flex-wrap items-center gap-1.5">
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {{ getCategoryLabel(item.category) }}
                        </span>
                        @if (item.targetAuthority) {
                          <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-evo-cobalt border border-blue-100">
                            Către: {{ item.targetAuthority }}
                          </span>
                        }
                      </div>
                    </td>
                    <td class="px-3.5 py-3.5 whitespace-nowrap">
                      <span class="px-2.5 py-1 font-bold rounded-full text-[11px] border whitespace-nowrap" [ngClass]="getStatusBadgeClass(item.status)">
                        {{ getStatusLabel(item.status) }}
                      </span>
                    </td>
                    <td class="px-3.5 py-3.5 text-right whitespace-nowrap">
                      <div class="flex items-center justify-end gap-2 whitespace-nowrap">
                        <button
                          (click)="inspectPetition(item.id)"
                          class="btn-primary text-xs py-1.5 px-3 whitespace-nowrap"
                        >
                          Examinare dosar și AI
                        </button>
                        <button
                          (click)="downloadPdf(item.id)"
                          class="btn-secondary text-xs py-1.5 px-2.5 whitespace-nowrap"
                          title="Descarcă recipisă PDF"
                        >
                          📄 PDF
                        </button>
                      </div>
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
                  <span class="px-2.5 py-1 text-xs font-bold rounded-full border whitespace-nowrap" [ngClass]="getStatusBadgeClass(selectedDetail.status)">{{ getStatusLabel(selectedDetail.status) }}</span>
                </div>
                <h2 class="text-xl font-extrabold text-evo-navy mt-2">{{ selectedDetail.title }}</h2>
              </div>
              <button (click)="closeDetail()" class="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <!-- Solicitant & Content Info Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-evo-border text-xs">
              <div>
                <span class="text-evo-text-muted font-medium block mb-0.5">Solicitant / petiționar:</span>
                <span class="font-bold text-evo-navy">{{ selectedDetail.authorName }}</span> (IDNP: {{ selectedDetail.authorIdnp || 'N/A' }})
              </div>
              <div>
                <span class="text-evo-text-muted font-medium block mb-0.5">Destinatar (Autoritate):</span>
                <span class="font-bold text-evo-cobalt">{{ selectedDetail.targetAuthority || 'Autoritate administrație publică' }}</span>
              </div>
              <div>
                <span class="text-evo-text-muted font-medium block mb-0.5">Inspector desemnat:</span>
                <span class="font-bold text-evo-navy">{{ selectedDetail.assignedOfficerName || 'Nerepartizat' }}</span>
              </div>
              <div>
                <span class="text-evo-text-muted font-medium block mb-0.5">Data înregistrării & termen SLA:</span>
                <span class="font-bold text-evo-navy">{{ selectedDetail.submissionDate | date:'dd.MM.yyyy HH:mm' }}</span> (Termen: {{ selectedDetail.deadlineDate | date:'dd.MM.yyyy' }})
              </div>
            </div>

            <!-- Collapsible Dropdown for Petition Content & Description -->
            <div class="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
              <button
                type="button"
                (click)="isDescriptionExpanded = !isDescriptionExpanded"
                class="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                aria-label="Comută afișarea conținutului petiției"
              >
                <div class="flex items-center gap-2.5 min-w-0 pr-3">
                  <div class="w-7 h-7 rounded-lg bg-evo-cobalt-light text-evo-cobalt flex items-center justify-center shrink-0">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  </div>
                  <div class="min-w-0">
                    <span class="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                      Conținutul și descrierea solicitării
                    </span>
                    @if (!isDescriptionExpanded) {
                      <span class="text-xs text-slate-500 font-normal truncate block max-w-xl mt-0.5">
                        {{ selectedDetail.description }}
                      </span>
                    }
                  </div>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                  <span class="text-xs font-bold text-evo-cobalt bg-evo-cobalt-light px-2.5 py-1 rounded-lg">
                    {{ isDescriptionExpanded ? 'Restrânge textul' : 'Afișează textul complet' }}
                  </span>
                  <div class="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 transition-transform duration-200" [class.rotate-180]="isDescriptionExpanded">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </div>
                </div>
              </button>

              @if (isDescriptionExpanded) {
                <div class="p-5 border-t border-slate-200 bg-white text-sm text-slate-900 leading-relaxed whitespace-pre-line font-medium">
                  {{ selectedDetail.description }}
                </div>
              }
            </div>

            <!-- Distinct Dark Navy / Cyan Gemini AI Triage Section -->
            <div class="bg-gradient-to-br from-evo-navy via-slate-900 to-slate-800 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-3 text-white">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                  <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  <span>Analiză executivă Gemini AI triage</span>
                </div>
                <span class="text-[10px] bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 px-2.5 py-0.5 rounded-full font-bold">Model Gemini 1.5 Flash</span>
              </div>
              <p class="text-xs text-slate-100 font-medium leading-relaxed italic bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
                "{{ selectedDetail.aiTriageSummary || 'Petiție procesată preliminar.' }}"
              </p>
            </div>

            <!-- Gemini AI Resolution Generator Button & Draft Box -->
            <div class="border-t border-evo-border pt-4 space-y-3">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-bold text-evo-navy uppercase tracking-wider flex items-center gap-1.5">
                  <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  <span>Asistent decizie administrativă (Gemini AI)</span>
                </h4>
              </div>

              <!-- Dedicated Field for Inspector's Assessment / Opinion -->
              <div class="space-y-2.5 bg-slate-50 p-4 rounded-2xl border border-evo-border">
                <div class="flex flex-wrap items-center justify-between gap-1">
                  <label for="officerOpinion" class="text-xs font-bold text-evo-navy uppercase tracking-wider flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    <span>Părerea inspectorului de caz (opinie & măsură propusă):</span>
                  </label>
                  <span class="text-[11px] text-evo-text-muted">Se transmite către Gemini AI pentru redactarea deciziei</span>
                </div>

                <textarea
                  id="officerOpinion"
                  [(ngModel)]="officerOpinion"
                  rows="3"
                  placeholder="Descrieți părerea dumneavoastră despre situație: dacă solicitarea trebuie aprobată sau respinsă, constatările efectuate sau măsurile dispuse spre remediere..."
                  class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-evo-navy focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-xs"
                ></textarea>

                <div class="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div class="flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span class="text-slate-500 font-semibold">Opțiuni rapide:</span>
                    <button
                      type="button"
                      (click)="setQuickOpinion('Se propune aprobarea demersului și obligarea serviciilor municipale la remedierea problemelor semnalate.')"
                      class="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-bold transition-colors cursor-pointer"
                    >
                      + Aprobare
                    </button>
                    <button
                      type="button"
                      (click)="setQuickOpinion('Se propune respingerea motivată a petiției, aspectele reclamate nefiind confirmate sau nefiind de competența instituției.')"
                      class="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold transition-colors cursor-pointer"
                    >
                      + Respingere
                    </button>
                    <button
                      type="button"
                      (click)="setQuickOpinion('Se propune admiterea parțială, cu inițierea unei expertize la fața locului și informarea petiționarului în 15 zile.')"
                      class="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 font-bold transition-colors cursor-pointer"
                    >
                      + Măsuri parțiale
                    </button>
                  </div>

                  <button
                    type="button"
                    (click)="generateAiResolutionDraft()"
                    [disabled]="isAiGenerating"
                    class="btn-primary text-xs py-2 px-4 bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    @if (isAiGenerating) {
                      <span class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Gemini AI redactează decizia...</span>
                    } @else {
                      <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
                      <span>Generează decizia cu Gemini AI</span>
                    }
                  </button>
                </div>
              </div>

              @if (aiResolutionDraft) {
                <div class="bg-amber-50/80 border border-amber-200 p-4 rounded-2xl text-xs space-y-2">
                  <div class="font-bold text-amber-950 flex justify-between items-center">
                    <span>Proiect rezoluție elaborat de AI:</span>
                    <span class="text-[10px] text-amber-800 font-mono bg-amber-100 px-2 py-0.5 rounded-md">{{ aiResolutionDraft.legalBasisReference }}</span>
                  </div>
                  <pre class="font-sans whitespace-pre-wrap text-slate-800 bg-white p-3.5 rounded-xl border border-amber-200 text-xs leading-relaxed">{{ aiResolutionDraft.draftResolutionText }}</pre>
                  <button (click)="useAiDraft()" class="text-xs font-bold text-indigo-700 hover:text-indigo-900 transition-colors">
                    ↪ Preluare text în câmpul de decizie oficială
                  </button>
                </div>
              }
            </div>

            <!-- Status Transition & Inspector Attribution Form -->
            <div class="border-t border-evo-border pt-4 space-y-4">
              <h4 class="text-xs font-bold text-evo-navy uppercase tracking-wider">Atribuire inspector & tranziție status</h4>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="space-y-1">
                  <label class="block text-xs font-semibold text-evo-navy">Atribuire inspector:</label>
                  <select [(ngModel)]="selectedOfficerId" class="w-full px-3.5 py-2.5 bg-slate-50 border border-evo-border rounded-xl text-xs font-bold text-evo-navy focus:bg-white transition-all">
                    <option [ngValue]="null">Implicit (sau neschimbat)</option>
                    @for (off of officers; track off.id) {
                      <option [ngValue]="off.id">{{ off.fullName }}</option>
                    }
                  </select>
                </div>

                <div class="space-y-1">
                  <label class="block text-xs font-semibold text-evo-navy">Actualizare status:</label>
                  <select [(ngModel)]="newStatus" class="w-full px-3.5 py-2.5 bg-slate-50 border border-evo-border rounded-xl text-xs font-bold text-evo-navy focus:bg-white transition-all">
                    <option value="IN_REVIEW">În examinare</option>
                    <option value="REDIRECTED">Redirecționat altui departament</option>
                    <option value="RESOLVED">Soluționat aprobant</option>
                    <option value="REJECTED">Respins (motivat)</option>
                  </select>
                </div>

                <div class="space-y-1">
                  <label class="block text-xs font-semibold text-evo-navy">Notă internă audit:</label>
                  <input type="text" [(ngModel)]="statusNote" placeholder="ex: Verificări efectuate de inspector la teren." class="w-full px-3.5 py-2.5 bg-slate-50 border border-evo-border rounded-xl text-xs font-medium focus:bg-white transition-all" />
                </div>
              </div>

              <div class="space-y-1">
                <label class="block text-xs font-semibold text-evo-navy">Rezoluție administrativă oficială (dispozitiv decizie):</label>
                <textarea [(ngModel)]="resolutionText" rows="4" placeholder="Introduceți textul deciziei finale transmis petiționarului..." class="w-full px-3.5 py-2.5 bg-slate-50 border border-evo-border rounded-xl text-xs font-sans text-evo-navy focus:bg-white transition-all"></textarea>
              </div>

              <div class="flex justify-end gap-3 pt-2 border-t border-evo-border">
                <button (click)="closeDetail()" class="btn-secondary text-xs py-2">Închide</button>
                <button (click)="saveStatusUpdate()" [disabled]="isSavingStatus" class="btn-primary text-xs py-2 px-5">
                  @if (isSavingStatus) {
                    <span>Se salvează decizia...</span>
                  } @else {
                    <span>Salvează decizia oficială</span>
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
  officers: User[] = [];
  isLoading = false;
  totalElements = 0;
  inReviewCount = 0;
  criticalSlaCount = 0;
  resolvedCount = 0;

  searchKeyword = '';
  statusFilter = '';
  categoryFilter = '';
  officerFilter: number | '' = '';

  selectedDetail: PetitionDetail | null = null;
  isDescriptionExpanded = false;
  officerOpinion = '';
  aiResolutionDraft: AiResolutionDraft | null = null;
  isAiGenerating = false;

  newStatus: PetitionStatus = 'IN_REVIEW';
  selectedOfficerId: number | null = null;
  resolutionText = '';
  statusNote = '';
  isSavingStatus = false;

  ngOnInit() {
    this.loadOfficers();
    this.loadPetitions();
  }

  loadOfficers() {
    this.petitionService.getOfficers().subscribe({
      next: (list) => this.officers = list,
      error: (err) => console.error('Nu s-a putut încărca lista de inspectori:', err)
    });
  }

  loadPetitions() {
    this.isLoading = true;
    const filterOfficerId = typeof this.officerFilter === 'number' ? this.officerFilter : undefined;
    this.petitionService.searchPetitionsOfficer({
      search: this.searchKeyword,
      status: this.statusFilter,
      category: this.categoryFilter,
      assignedOfficerId: filterOfficerId
    }).subscribe({
      next: (res) => {
        this.petitions = extractPageContent(res);
        this.totalElements = extractTotalElements(res);

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
        this.isDescriptionExpanded = false;
        this.officerOpinion = '';
        this.newStatus = detail.status;
        this.selectedOfficerId = detail.assignedOfficerId || null;
        this.resolutionText = detail.resolutionText || '';
        this.statusNote = '';
        this.aiResolutionDraft = null;
      }
    });
  }

  closeDetail() {
    this.selectedDetail = null;
    this.isDescriptionExpanded = false;
    this.officerOpinion = '';
    this.aiResolutionDraft = null;
  }

  setQuickOpinion(opinion: string) {
    this.officerOpinion = opinion;
  }

  generateAiResolutionDraft() {
    if (!this.selectedDetail) return;
    this.isAiGenerating = true;

    this.petitionService.generateAiDraftResolution(this.selectedDetail.id, this.officerOpinion).subscribe({
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
      note: this.statusNote,
      assignedOfficerId: this.selectedOfficerId || undefined
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

  getStatusLabel(status: string): string {
    return getStatusLabel(status);
  }

  getCategoryLabel(category: string): string {
    return getCategoryLabel(category);
  }
}

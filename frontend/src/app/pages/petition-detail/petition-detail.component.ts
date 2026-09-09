import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PetitionService } from '../../services/petition.service';
import { AuthService } from '../../services/auth.service';
import { PetitionDetail } from '../../models/petition.model';

@Component({
  selector: 'app-petition-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-4xl mx-auto space-y-8 pb-12">
      <!-- Back Navigation & Breadcrumb -->
      <div class="flex justify-between items-center text-xs font-semibold">
        <a routerLink="/public-initiatives" class="inline-flex items-center gap-1.5 text-evo-text-muted hover:text-evo-cobalt transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          <span>Înapoi la registrul inițiativelor publice</span>
        </a>

        <!-- Quick Share Button -->
        <button (click)="copyShareLink()" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-evo-navy hover:bg-slate-200 transition-all text-xs font-bold border border-slate-200">
          <svg class="w-3.5 h-3.5 text-evo-cobalt" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
          <span>Partajează ca link</span>
        </button>
      </div>

      <!-- Share Toast Alert -->
      @if (showShareToast) {
        <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-md animate-fade-in">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            <span>Link-ul petiției a fost copiat în clipboard! Îl poți trimite oricui dorești pentru semnare.</span>
          </div>
          <button (click)="showShareToast = false" class="text-emerald-700 hover:text-emerald-900 font-bold">&times;</button>
        </div>
      }

      @if (isLoading) {
        <div class="evo-card p-12 text-center space-y-4">
          <div class="inline-block w-10 h-10 border-4 border-evo-cobalt border-t-transparent rounded-full animate-spin"></div>
          <p class="text-xs font-semibold text-evo-text-muted">Se încarcă detaliile petiției...</p>
        </div>
      } @else if (!petition) {
        <div class="evo-card p-12 text-center space-y-4">
          <div class="text-4xl">⚠️</div>
          <h3 class="text-lg font-bold text-evo-navy">Petiția nu a fost găsită</h3>
          <p class="text-xs text-evo-text-muted">Solicitarea cu id-ul specificat nu există în sistem sau a fost retrasă.</p>
          <a routerLink="/public-initiatives" class="btn-primary inline-block text-xs py-2 px-4">Înapoi la inițiative</a>
        </div>
      } @else {
        <!-- Main Petition Container -->
        <div class="evo-card p-6 sm:p-8 space-y-8">
          <!-- Petition Header & Meta Info -->
          <div class="space-y-4 border-b border-evo-border pb-6">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <span class="font-mono font-extrabold text-xs text-evo-cobalt bg-evo-cobalt-light px-3 py-1 rounded-lg border border-evo-cobalt/20">
                  #{{ petition.trackingNumber }}
                </span>
                <span class="px-3 py-1 text-xs font-bold rounded-full border" [ngClass]="getStatusBadgeClass(petition.status)">
                  {{ petition.status }}
                </span>
                <span class="px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">
                  {{ petition.category }}
                </span>
              </div>
              
              <div class="text-xs text-evo-text-muted font-medium">
                Înregistrată la: <span class="font-bold text-evo-navy">{{ petition.createdAt | date:'dd.MM.yyyy HH:mm' }}</span>
              </div>
            </div>

            <h1 class="text-2xl sm:text-3xl font-black text-evo-navy leading-tight tracking-tight">
              {{ petition.title }}
            </h1>

            <div class="flex flex-wrap items-center justify-between text-xs text-evo-text-muted gap-4 bg-slate-50 p-4 rounded-2xl border border-evo-border">
              <div>
                <span class="font-medium text-slate-500 block">Autor / Inițiator:</span>
                <span class="font-bold text-evo-navy text-sm">{{ petition.authorName }}</span>
              </div>
              <div>
                <span class="font-medium text-slate-500 block">Inspector desemnat:</span>
                <span class="font-bold text-evo-navy">{{ petition.assignedOfficerName || 'În curs de atribuire' }}</span>
              </div>
              <div>
                <span class="font-medium text-slate-500 block">Termen limită legal:</span>
                <span class="font-bold text-evo-navy">{{ petition.deadlineDate ? (petition.deadlineDate | date:'dd.MM.yyyy') : 'N/A' }}</span>
              </div>
            </div>
          </div>

          <!-- Public Initiative Progress & Actions Card -->
          @if (petition.isPublicInitiative) {
            <div class="bg-gradient-to-br from-slate-900 to-evo-navy p-6 rounded-2xl text-white space-y-4 border border-slate-800 shadow-xl">
              <div class="flex justify-between items-end">
                <div>
                  <span class="text-xs font-bold uppercase tracking-wider text-cyan-400 block mb-1">Susținere publică colectivă</span>
                  <div class="text-2xl font-black text-white flex items-baseline gap-2">
                    <span>{{ petition.currentSignatureCount }}</span>
                    <span class="text-xs font-medium text-slate-300">din {{ petition.signatureThreshold }} semnături necesare</span>
                  </div>
                </div>

                <div class="text-right">
                  <span class="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800/50">
                    {{ getProgressPercentage(petition) }}% completat
                  </span>
                </div>
              </div>

              <!-- Progress bar -->
              <div class="w-full bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-700">
                <div
                  class="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full transition-all duration-500 rounded-full"
                  [style.width.%]="getProgressPercentage(petition)"
                ></div>
              </div>

              <!-- Sign / Revoke Action Section -->
              <div class="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800">
                <div class="text-xs text-slate-300 font-medium max-w-md">
                  Petițiile publice pot fi semnate atât de utilizatori conectați, cât și de oaspeți neconectați prin cod de verificare SMS/Email.
                </div>

                <div class="flex flex-wrap gap-2.5">
                  @if (authService.isAuthenticated()) {
                    @if (petition.hasSigned) {
                      <button (click)="toggleSignatureAuth()" [disabled]="isSigning" class="btn-secondary text-xs py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white border-none font-bold">
                        @if (isSigning) { Se procesează... } @else { ✕ Revocă semnătura }
                      </button>
                    } @else {
                      <button (click)="toggleSignatureAuth()" [disabled]="isSigning" class="btn-primary text-xs py-2.5 px-5 bg-emerald-500 hover:bg-emerald-600 font-extrabold text-slate-900 border-none shadow-lg">
                        @if (isSigning) { Se procesează... } @else { ✍️ Semnează inițiativa }
                      </button>
                    }
                  } @else {
                    <button (click)="openGuestOtpModal('SIGN')" class="btn-primary text-xs py-2.5 px-5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold border-none shadow-lg flex items-center gap-1.5">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                      <span>Semnează fără cont (SMS / Email)</span>
                    </button>
                    <button (click)="openGuestOtpModal('UNSIGN')" class="btn-secondary text-xs py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700">
                      Revocă ca oaspete
                    </button>
                  }
                </div>
              </div>
            </div>
          }

          <!-- Official Inspector Response Section (If Available) -->
          @if (petition.resolutionText) {
            <div class="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-900 border-2 border-emerald-500/50 rounded-2xl p-6 shadow-2xl text-white space-y-4">
              <div class="flex items-center justify-between border-b border-emerald-800/60 pb-3">
                <div class="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <div class="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-400/40">
                    🏛️
                  </div>
                  <div>
                    <h3 class="text-sm font-extrabold text-white">Răspuns și Rezoluție Administrativă Oficială</h3>
                    <p class="text-[11px] text-emerald-300/80 font-normal">Decizie legală conform Codului Administrativ al Republicii Moldova</p>
                  </div>
                </div>
                <span class="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold uppercase tracking-wider">
                  SOLUȚIONAT
                </span>
              </div>

              <div class="text-sm text-slate-100 leading-relaxed font-medium bg-slate-900/90 p-5 rounded-xl border border-slate-800 whitespace-pre-line">
                {{ petition.resolutionText }}
              </div>

              <div class="flex justify-between items-center text-xs text-slate-400 font-medium pt-1">
                <span>Decizie emisă de inspectorat</span>
                <span class="text-emerald-400 font-bold">Guvernul Republicii Moldova</span>
              </div>
            </div>
          }

          <!-- Petition Description Content -->
          <div class="space-y-3">
            <h3 class="text-sm font-extrabold text-evo-navy uppercase tracking-wider flex items-center gap-2">
              <svg class="w-5 h-5 text-evo-cobalt shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              <span>Conținutul și textul integral al solicitării:</span>
            </h3>
            <div class="text-sm text-slate-900 leading-relaxed bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-xs whitespace-pre-line font-medium">
              {{ petition.description }}
            </div>
          </div>

          <!-- AI Triage Briefing (Public View) -->
          @if (petition.aiTriageSummary) {
            <div class="p-4 rounded-xl bg-slate-50 border border-evo-border text-xs space-y-1">
              <span class="font-bold text-evo-navy block">Sintetizare automată evaluare:</span>
              <p class="text-slate-600 italic leading-relaxed">{{ petition.aiTriageSummary }}</p>
            </div>
          }
        </div>
      }

      <!-- Guest OTP Verification Modal -->
      @if (showOtpModal) {
        <div class="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 border border-evo-border">
            <div class="flex justify-between items-center border-b border-evo-border pb-4">
              <div>
                <h3 class="text-lg font-black text-evo-navy">
                  {{ otpMode === 'SIGN' ? 'Semnează ca oaspete' : 'Revocă semnătura' }}
                </h3>
                <p class="text-xs text-evo-text-muted">Verificare rapidă prin cod de 5 cifre (Email sau Telefon)</p>
              </div>
              <button (click)="closeOtpModal()" class="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>

            <!-- Demo Live Code Banner -->
            @if (simulatedCode) {
              <div class="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs space-y-1 animate-pulse">
                <div class="font-bold text-amber-950 flex items-center justify-between">
                  <span>Simulare SMS / Email cod:</span>
                  <span class="font-mono text-base bg-amber-200 text-amber-950 px-2 py-0.5 rounded font-black tracking-widest">{{ simulatedCode }}</span>
                </div>
                <p class="text-amber-800 text-[11px]">Introduceți codul de mai sus de 5 cifre în câmpul de verificare.</p>
              </div>
            }

            @if (otpStep === 1) {
              <!-- Step 1: Input Contact Info -->
              <div class="space-y-4">
                @if (otpMode === 'SIGN') {
                  <div>
                    <label class="block text-xs font-bold text-evo-navy mb-1">Nume și prenume complet:</label>
                    <input type="text" [(ngModel)]="guestFullName" placeholder="ex: Ion Popescu" class="w-full px-3.5 py-2.5 bg-slate-50 border border-evo-border rounded-xl text-xs font-medium focus:bg-white transition-all" />
                  </div>
                }

                <div>
                  <label class="block text-xs font-bold text-evo-navy mb-1">Email (Gmail) sau număr de telefon:</label>
                  <input type="text" [(ngModel)]="guestContact" placeholder="ex: ion.popescu@gmail.com sau +37369123456" class="w-full px-3.5 py-2.5 bg-slate-50 border border-evo-border rounded-xl text-xs font-medium focus:bg-white transition-all" />
                </div>

                <button (click)="requestOtpCode()" [disabled]="isSendingOtp" class="btn-primary w-full py-3 text-xs font-bold flex justify-center items-center gap-2">
                  @if (isSendingOtp) {
                    <span>Se trimite codul...</span>
                  } @else {
                    <span>Trimite cod de 5 cifre</span>
                  }
                </button>
              </div>
            } @else {
              <!-- Step 2: Input 5-digit OTP code -->
              <div class="space-y-4">
                <p class="text-xs text-slate-600">
                  Am trimis codul de 5 cifre către: <strong class="text-evo-navy font-bold">{{ guestContact }}</strong>
                </p>

                <div>
                  <label class="block text-xs font-bold text-evo-navy mb-1">Introduceți codul de 5 cifre:</label>
                  <input
                    type="text"
                    [(ngModel)]="otpCode"
                    maxlength="5"
                    placeholder="12345"
                    class="w-full px-3.5 py-3 bg-slate-50 border border-evo-border rounded-xl text-center text-lg font-mono font-bold tracking-widest focus:bg-white transition-all"
                  />
                </div>

                <div class="flex gap-3">
                  <button (click)="otpStep = 1" class="btn-secondary text-xs py-2.5 w-1/3">Înapoi</button>
                  <button (click)="submitGuestOtp()" [disabled]="isVerifyingOtp" class="btn-primary text-xs py-2.5 w-2/3 font-bold">
                    @if (isVerifyingOtp) {
                      <span>Verificare...</span>
                    } @else {
                      <span>{{ otpMode === 'SIGN' ? 'Confirmă și semnează' : 'Confirmă și revocă' }}</span>
                    }
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class PetitionDetailComponent implements OnInit {
  authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private petitionService = inject(PetitionService);

  petition: PetitionDetail | null = null;
  isLoading = true;
  isSigning = false;
  showShareToast = false;

  // Guest OTP Modal state
  showOtpModal = false;
  otpMode: 'SIGN' | 'UNSIGN' = 'SIGN';
  otpStep: 1 | 2 = 1;
  guestFullName = '';
  guestContact = '';
  otpCode = '';
  simulatedCode = '';
  isSendingOtp = false;
  isVerifyingOtp = false;

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.loadPetition(id);
      }
    });
  }

  loadPetition(id: number) {
    this.isLoading = true;
    this.petitionService.getPublicPetitionDetail(id).subscribe({
      next: (data) => {
        this.petition = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Eroare la încărcarea petiției:', err);
        this.isLoading = false;
      }
    });
  }

  copyShareLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      this.showShareToast = true;
      setTimeout(() => this.showShareToast = false, 5000);
    });
  }

  getProgressPercentage(pet: PetitionDetail): number {
    if (!pet.signatureThreshold || pet.signatureThreshold <= 0) return 100;
    const pct = Math.round((pet.currentSignatureCount / pet.signatureThreshold) * 100);
    return Math.min(100, pct);
  }

  toggleSignatureAuth() {
    if (!this.petition) return;
    this.isSigning = true;

    if (this.petition.hasSigned) {
      this.petitionService.unsignInitiative(this.petition.id).subscribe({
        next: (res) => {
          this.isSigning = false;
          if (this.petition) {
            this.petition.hasSigned = false;
            this.petition.currentSignatureCount = res.newSignatureCount;
          }
        },
        error: (err) => {
          this.isSigning = false;
          alert(err.error?.message || 'Nu s-a putut revoca semnătura.');
        }
      });
    } else {
      this.petitionService.signInitiative(this.petition.id).subscribe({
        next: (res) => {
          this.isSigning = false;
          if (this.petition) {
            this.petition.hasSigned = true;
            this.petition.currentSignatureCount = res.newSignatureCount;
          }
        },
        error: (err) => {
          this.isSigning = false;
          alert(err.error?.message || 'Nu s-a putut semna inițiativa.');
        }
      });
    }
  }

  openGuestOtpModal(mode: 'SIGN' | 'UNSIGN') {
    this.otpMode = mode;
    this.otpStep = 1;
    this.guestFullName = '';
    this.guestContact = '';
    this.otpCode = '';
    this.simulatedCode = '';
    this.showOtpModal = true;
  }

  closeOtpModal() {
    this.showOtpModal = false;
  }

  requestOtpCode() {
    if (!this.petition) return;
    if (!this.guestContact.trim()) {
      alert('Introduceți adresa de email sau numărul de telefon.');
      return;
    }
    if (this.otpMode === 'SIGN' && !this.guestFullName.trim()) {
      alert('Introduceți numele și prenumele complet.');
      return;
    }

    this.isSendingOtp = true;
    this.petitionService.sendGuestOtp(this.petition.id, this.guestContact.trim()).subscribe({
      next: (res) => {
        this.isSendingOtp = false;
        this.simulatedCode = res.otpCode;
        this.otpStep = 2;
      },
      error: (err) => {
        this.isSendingOtp = false;
        alert(err.error?.message || 'Eroare la trimiterea codului de verificare.');
      }
    });
  }

  submitGuestOtp() {
    if (!this.petition) return;
    if (!this.otpCode.trim() || this.otpCode.trim().length !== 5) {
      alert('Introduceți codul valid de 5 cifre.');
      return;
    }

    this.isVerifyingOtp = true;

    if (this.otpMode === 'SIGN') {
      this.petitionService.signGuest(this.petition.id, this.guestFullName, this.guestContact, this.otpCode.trim()).subscribe({
        next: (res) => {
          this.isVerifyingOtp = false;
          this.showOtpModal = false;
          if (this.petition) {
            this.petition.hasSigned = true;
            this.petition.currentSignatureCount = res.newSignatureCount;
          }
          alert('Semnătura dumneavoastră a fost înregistrată cu succes!');
        },
        error: (err) => {
          this.isVerifyingOtp = false;
          alert(err.error?.message || 'Verificare eșuată. Verificați codul introdus.');
        }
      });
    } else {
      this.petitionService.unsignGuest(this.petition.id, this.guestContact, this.otpCode.trim()).subscribe({
        next: (res) => {
          this.isVerifyingOtp = false;
          this.showOtpModal = false;
          if (this.petition) {
            this.petition.hasSigned = false;
            this.petition.currentSignatureCount = res.newSignatureCount;
          }
          alert('Semnătura a fost revocată cu succes.');
        },
        error: (err) => {
          this.isVerifyingOtp = false;
          alert(err.error?.message || 'Verificare eșuată. Verificați codul introdus.');
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

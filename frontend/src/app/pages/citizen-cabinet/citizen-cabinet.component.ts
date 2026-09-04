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
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <!-- User Profile Cabinet Banner -->
      <div class="bg-white rounded-xl shadow-sm border border-gov-border p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div class="flex items-center space-x-3">
            <h1 class="text-2xl font-serif font-bold text-gov-primary">
              Cabinetul Cetățeanului: {{ authService.currentUserSignal()?.fullName }}
            </h1>
            <span class="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full border border-green-200" aria-label="Identitate Verificată">
              IDNP Verificat
            </span>
          </div>
          <p class="text-sm text-gov-secondary mt-2">
            IDNP: <strong class="font-mono text-gov-primary">{{ authService.currentUserSignal()?.idnp }}</strong> • Email: {{ authService.currentUserSignal()?.email }}
          </p>
        </div>

        <button
          (click)="openCreateModal()"
          class="btn-primary"
          aria-label="Depune o nouă petiție sau inițiativă"
        >
          <span aria-hidden="true">➕</span>
          <span>Depune Petiție / Inițiativă</span>
        </button>
      </div>

      <!-- Navigation Tabs -->
      <div class="border-b border-gov-border flex space-x-8 text-base font-medium" role="tablist">
        <button
          (click)="activeTab = 'authored'; loadAuthored()"
          [class]="activeTab === 'authored' ? 'border-b-2 border-gov-cta text-gov-cta font-bold pb-3 focus-visible' : 'text-gov-secondary hover:text-gov-primary transition-colors pb-3 focus-visible'"
          role="tab"
          [attr.aria-selected]="activeTab === 'authored'"
        >
          Petițiile Mele Depuse ({{ authoredCount }})
        </button>
        <button
          (click)="activeTab = 'supported'; loadSupported()"
          [class]="activeTab === 'supported' ? 'border-b-2 border-gov-cta text-gov-cta font-bold pb-3 focus-visible' : 'text-gov-secondary hover:text-gov-primary transition-colors pb-3 focus-visible'"
          role="tab"
          [attr.aria-selected]="activeTab === 'supported'"
        >
          Inițiative Colective Semnate ({{ supportedCount }})
        </button>
      </div>

      <!-- Petitions Table / Cards -->
      @if (isLoading) {
        <div class="text-center py-12" aria-live="polite">
          <div class="inline-block w-10 h-10 border-4 border-gov-cta border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
          <p class="text-sm text-gov-secondary mt-3 font-medium">Se încarcă datele din Registru...</p>
        </div>
      } @else if (activeTab === 'authored') {
        @if (authoredPetitions.length === 0) {
          <div class="bg-white rounded-xl p-12 text-center border border-gov-border">
            <p class="text-gov-secondary text-base font-medium">Nu ați depus încă nicio petiție individuală sau inițiativă publică.</p>
          </div>
        } @else {
          <div class="bg-white rounded-xl shadow-sm border border-gov-border overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm border-collapse">
                <thead class="bg-gov-bg text-gov-primary font-bold uppercase tracking-wider border-b border-gov-border">
                  <tr>
                    <th class="p-4" scope="col">Nr. Tracking</th>
                    <th class="p-4" scope="col">Titlu & Categorie</th>
                    <th class="p-4" scope="col">Tip</th>
                    <th class="p-4" scope="col">Status</th>
                    <th class="p-4" scope="col">Data Depunerii</th>
                    <th class="p-4" scope="col">Termen Limită</th>
                    <th class="p-4 text-center" scope="col">Acțiuni</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gov-border">
                  @for (item of authoredPetitions; track item.id) {
                    <tr class="hover:bg-slate-50 transition-colors">
                      <td class="p-4 font-mono font-bold text-gov-cta">{{ item.trackingNumber }}</td>
                      <td class="p-4 max-w-xs">
                        <div class="font-bold text-gov-primary text-base truncate" [title]="item.title">{{ item.title }}</div>
                        <div class="text-gov-secondary text-xs mt-1">{{ item.category }}</div>
                      </td>
                      <td class="p-4">
                        @if (item.isPublicInitiative) {
                          <span class="px-2.5 py-1 bg-amber-50 text-amber-900 font-bold rounded border border-amber-200 text-xs">
                            Colectivă ({{ item.currentSignatureCount }}/{{ item.signatureThreshold }})
                          </span>
                        } @else {
                          <span class="px-2.5 py-1 bg-blue-50 text-blue-900 font-bold rounded border border-blue-200 text-xs">
                            Individuală
                          </span>
                        }
                      </td>
                      <td class="p-4">
                        <span class="px-3 py-1.5 font-bold rounded-full text-xs border" [ngClass]="getStatusBadgeClass(item.status)">
                          {{ item.status }}
                        </span>
                      </td>
                      <td class="p-4 text-gov-secondary">
                        {{ item.submissionDate ? (item.submissionDate | date:'dd.MM.yyyy HH:mm') : 'În colectare' }}
                      </td>
                      <td class="p-4 font-medium text-gov-primary">
                        @if (item.deadlineDate) {
                          <div>{{ item.deadlineDate | date:'dd.MM.yyyy' }}</div>
                          <div class="text-xs" [ngClass]="item.daysRemaining && item.daysRemaining < 7 ? 'text-red-700 font-bold' : 'text-gov-secondary'">
                            ({{ item.daysRemaining }} zile)
                          </div>
                        } @else {
                          <span class="text-gov-secondary">-</span>
                        }
                      </td>
                      <td class="p-4 flex items-center justify-center space-x-2">
                        @if (item.status === 'SUBMITTED' || item.status === 'COLLECTING_SIGNATURES') {
                          <button (click)="openEditModal(item)" class="text-gov-cta hover:bg-blue-50 p-2 rounded transition-colors focus-visible" aria-label="Editează petiția" title="Editează">
                            ✏️
                          </button>
                          <button (click)="deletePetition(item.id)" class="text-red-600 hover:bg-red-50 p-2 rounded transition-colors focus-visible" aria-label="Șterge petiția" title="Șterge">
                            🗑️
                          </button>
                        } @else {
                          <span class="text-xs text-gov-secondary italic">Blocat</span>
                        }
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
          <div class="bg-white rounded-xl p-12 text-center border border-gov-border">
            <p class="text-gov-secondary text-base font-medium">Nu ați semnat încă nicio inițiativă publică colectivă.</p>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            @for (item of supportedPetitions; track item.id) {
              <div class="bg-white p-6 rounded-xl border border-gov-border shadow-sm space-y-3">
                <div class="flex justify-between items-center text-sm">
                  <span class="font-mono text-gov-cta font-bold">{{ item.trackingNumber }}</span>
                  <span class="px-2.5 py-1 bg-green-50 text-green-800 font-bold rounded border border-green-200 text-xs">Semnat ✓</span>
                </div>
                <h4 class="font-bold text-gov-primary text-base">{{ item.title }}</h4>
                <p class="text-sm text-gov-secondary line-clamp-3 leading-relaxed">{{ item.description }}</p>
              </div>
            }
          </div>
        }
      }

      <!-- Modal Creation / Edit Wizard -->
      @if (showModal) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-xl max-w-2xl w-full p-8 shadow-2xl space-y-6 border border-gov-border" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div class="flex justify-between items-center border-b border-gov-border pb-4">
              <h3 id="modal-title" class="text-xl font-serif font-bold text-gov-primary flex items-center space-x-3">
                <span aria-hidden="true">🏛️</span>
                <span>{{ editingPetitionId ? 'Editare Petiție' : 'Depunere Petiție / Inițiativă' }}</span>
              </h3>
              <button (click)="closeModal()" class="text-gov-secondary hover:text-gov-primary font-bold text-2xl focus-visible" aria-label="Închide fereastra">✕</button>
            </div>

            <form [formGroup]="createForm" (ngSubmit)="submitPetition()" class="space-y-6">
              <!-- Type Selector (Only on create) -->
              @if (!editingPetitionId) {
                <div>
                  <label class="block text-sm font-bold text-gov-primary mb-2">Tip Solicitare <span class="text-red-600">*</span></label>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label
                      class="p-4 border rounded-lg cursor-pointer flex flex-col justify-between transition-colors"
                      [ngClass]="createForm.get('isPublicInitiative')?.value === false ? 'border-gov-cta bg-blue-50/50 ring-2 ring-gov-cta' : 'border-gov-border bg-white hover:border-gray-400'"
                    >
                      <input type="radio" formControlName="isPublicInitiative" [value]="false" class="sr-only" />
                      <span class="font-bold text-sm text-gov-primary">Petiție Individuală</span>
                      <span class="text-xs text-gov-secondary mt-1">Termen legal de soluționare: 30 de zile.</span>
                    </label>

                    <label
                      class="p-4 border rounded-lg cursor-pointer flex flex-col justify-between transition-colors"
                      [ngClass]="createForm.get('isPublicInitiative')?.value === true ? 'border-gov-cta bg-blue-50/50 ring-2 ring-gov-cta' : 'border-gov-border bg-white hover:border-gray-400'"
                    >
                      <input type="radio" formControlName="isPublicInitiative" [value]="true" class="sr-only" />
                      <span class="font-bold text-sm text-gov-primary">Inițiativă Colectivă</span>
                      <span class="text-xs text-gov-secondary mt-1">Necesită prag public de semnături.</span>
                    </label>
                  </div>
                </div>

                @if (createForm.get('isPublicInitiative')?.value === true) {
                  <div>
                    <label for="threshold" class="block text-sm font-bold text-gov-primary mb-2">Prag Semnături <span class="text-red-600">*</span></label>
                    <select id="threshold" formControlName="signatureThreshold" class="w-full px-4 py-3 border border-gov-border rounded-md text-base focus:ring-2 focus:ring-gov-cta text-gov-primary">
                      <option [value]="50">50 Semnături (Locală)</option>
                      <option [value]="100">100 Semnături (Raională)</option>
                      <option [value]="500">500 Semnături (Națională)</option>
                    </select>
                  </div>
                }
              }

              <div>
                <label for="category" class="block text-sm font-bold text-gov-primary mb-2">Categorie <span class="text-red-600">*</span></label>
                <select id="category" formControlName="category" class="w-full px-4 py-3 border border-gov-border rounded-md text-base focus:ring-2 focus:ring-gov-cta text-gov-primary">
                  <option value="INFRASTRUCTURA">Infrastructură și Dezvoltare Regională</option>
                  <option value="MEDIU">Protecția Mediului și Resurse Naturale</option>
                  <option value="SANATATE">Sănătate Publică și Asistență Socială</option>
                  <option value="ADMINISTRATIE_PUBLICA">Administrație Publică și Servicii</option>
                  <option value="SOCIAL">Protecție Socială și Muncă</option>
                  <option value="EDUCATIE">Educație, Cultură și Cercetare</option>
                </select>
              </div>

              <div>
                <label for="title" class="block text-sm font-bold text-gov-primary mb-2">Titlul Solicitării <span class="text-red-600">*</span></label>
                <input id="title" type="text" formControlName="title" placeholder="ex: Modernizarea iluminatului public pe strada Ştefan cel Mare" class="w-full px-4 py-3 border border-gov-border rounded-md text-base focus:ring-2 focus:ring-gov-cta text-gov-primary" />
              </div>

              <div>
                <label for="desc" class="block text-sm font-bold text-gov-primary mb-2">Descriere Detaliată / Conținut <span class="text-red-600">*</span></label>
                <textarea id="desc" formControlName="description" rows="5" placeholder="Descrieți problema, argumentele și măsurile solicitate..." class="w-full px-4 py-3 border border-gov-border rounded-md text-base focus:ring-2 focus:ring-gov-cta text-gov-primary"></textarea>
              </div>

              <div class="bg-gov-bg p-4 rounded-md border border-gov-border text-xs text-gov-secondary flex items-start space-x-2">
                <span class="text-base" aria-hidden="true">🤖</span>
                <span><strong>Triage AI:</strong> Sistemul va efectua o analiză preliminară a textului pentru clasificare și rezumat executiv la salvare.</span>
              </div>

              <div class="flex justify-end space-x-4 pt-4 border-t border-gov-border">
                <button type="button" (click)="closeModal()" class="btn-secondary py-2">Renunță</button>
                <button type="submit" [disabled]="createForm.invalid || isSubmitting" class="btn-primary py-2 disabled:opacity-50">
                  @if (isSubmitting) {
                    <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" aria-hidden="true"></span>
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
      case 'SUBMITTED': return 'bg-blue-100 text-blue-900 border-blue-200';
      case 'COLLECTING_SIGNATURES': return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'IN_REVIEW': return 'bg-purple-100 text-purple-900 border-purple-200';
      case 'RESOLVED': return 'bg-emerald-100 text-emerald-900 border-emerald-200';
      case 'REJECTED': return 'bg-red-100 text-red-900 border-red-200';
      default: return 'bg-gray-100 text-gray-900 border-gray-200';
    }
  }
}

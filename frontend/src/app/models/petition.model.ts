export type PetitionCategory =
  | 'INFRASTRUCTURA'
  | 'MEDIU'
  | 'SANATATE'
  | 'ADMINISTRATIE_PUBLICA'
  | 'SOCIAL'
  | 'EDUCATIE';

export type PetitionStatus =
  | 'DRAFT'
  | 'COLLECTING_SIGNATURES'
  | 'SUBMITTED'
  | 'IN_REVIEW'
  | 'REDIRECTED'
  | 'RESOLVED'
  | 'REJECTED';

export type PetitionPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export const PETITION_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Ciornă',
  COLLECTING_SIGNATURES: 'Colectare semnături',
  SUBMITTED: 'Depusă',
  IN_REVIEW: 'În examinare',
  REDIRECTED: 'Redirecționată',
  RESOLVED: 'Soluționată',
  REJECTED: 'Respinsă'
};

export const PETITION_CATEGORY_LABELS: Record<string, string> = {
  INFRASTRUCTURA: 'Infrastructură',
  MEDIU: 'Mediu',
  SANATATE: 'Sănătate',
  ADMINISTRATIE_PUBLICA: 'Administrație publică',
  SOCIAL: 'Protecție socială',
  EDUCATIE: 'Educație'
};

export const PETITION_PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Scăzută',
  NORMAL: 'Normală',
  HIGH: 'Ridicată',
  URGENT: 'Urgentă'
};

export function getStatusLabel(status?: string): string {
  if (!status) return '';
  return PETITION_STATUS_LABELS[status] || status;
}

export function getCategoryLabel(category?: string): string {
  if (!category) return '';
  return PETITION_CATEGORY_LABELS[category] || category;
}

export function getPriorityLabel(priority?: string): string {
  if (!priority) return '';
  return PETITION_PRIORITY_LABELS[priority] || priority;
}

export interface PetitionHistory {
  id: number;
  fromStatus?: PetitionStatus;
  toStatus: PetitionStatus;
  note?: string;
  actorName: string;
  createdAt: string;
}

export interface PetitionResponse {
  id: number;
  trackingNumber: string;
  title: string;
  description: string;
  category: PetitionCategory;
  targetAuthority?: string;
  status: PetitionStatus;
  priority: PetitionPriority;
  isPublicInitiative: boolean;
  signatureThreshold: number;
  currentSignatureCount: number;
  submissionDate?: string;
  deadlineDate?: string;
  authorId: number;
  authorName: string;
  assignedOfficerId?: number;
  assignedOfficerName?: string;
  aiTriageSummary?: string;
  hasSigned?: boolean;
  daysRemaining?: number;
}

export interface PetitionDetail extends PetitionResponse {
  authorIdnp?: string;
  resolutionText?: string;
  history: PetitionHistory[];
  createdAt: string;
}

export interface PetitionCreateRequest {
  title: string;
  description: string;
  category: PetitionCategory;
  targetAuthority?: string;
  isPublicInitiative?: boolean;
  signatureThreshold?: number;
  priority?: PetitionPriority;
}

export interface PetitionStatusUpdateRequest {
  newStatus?: PetitionStatus;
  resolutionText?: string;
  note?: string;
  assignedOfficerId?: number;
}

export interface SignInitiativeResponse {
  petitionId: number;
  signatureHash: string;
  newSignatureCount: number;
  petition: PetitionResponse;
}

export interface AiResolutionDraft {
  petitionId: number;
  trackingNumber: string;
  draftResolutionText: string;
  legalBasisReference: string;
}

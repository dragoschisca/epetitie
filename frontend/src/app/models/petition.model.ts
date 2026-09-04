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
  isPublicInitiative?: boolean;
  signatureThreshold?: number;
  priority?: PetitionPriority;
}

export interface PetitionStatusUpdateRequest {
  newStatus: PetitionStatus;
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

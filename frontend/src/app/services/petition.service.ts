import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AiResolutionDraft,
  PetitionCreateRequest,
  PetitionDetail,
  PetitionResponse,
  PetitionStatusUpdateRequest,
  SignInitiativeResponse
} from '../models/petition.model';

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class PetitionService {
  private baseUrl = 'http://localhost:8080/api/v1';

  constructor(private http: HttpClient) {}

  // Public Endpoints
  getPublicInitiatives(search?: string, category?: string, page: number = 0, size: number = 10): Observable<PageResponse<PetitionResponse>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search) params = params.set('search', search);
    if (category) params = params.set('category', category);
    return this.http.get<PageResponse<PetitionResponse>>(`${this.baseUrl}/public/initiatives`, { params });
  }

  // Citizen Endpoints
  createPetition(request: PetitionCreateRequest): Observable<PetitionResponse> {
    return this.http.post<PetitionResponse>(`${this.baseUrl}/citizen/petitions`, request);
  }

  updatePetition(id: number, request: Partial<PetitionCreateRequest>): Observable<PetitionResponse> {
    return this.http.put<PetitionResponse>(`${this.baseUrl}/citizen/petitions/${id}`, request);
  }

  deletePetition(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/citizen/petitions/${id}`);
  }

  signInitiative(id: number): Observable<SignInitiativeResponse> {
    return this.http.post<SignInitiativeResponse>(`${this.baseUrl}/citizen/petitions/${id}/sign`, {});
  }

  getMyAuthoredPetitions(page: number = 0, size: number = 10): Observable<PageResponse<PetitionResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<PetitionResponse>>(`${this.baseUrl}/citizen/petitions/my-authored`, { params });
  }

  getMySupportedInitiatives(page: number = 0, size: number = 10): Observable<PageResponse<PetitionResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<PetitionResponse>>(`${this.baseUrl}/citizen/petitions/my-supported`, { params });
  }

  getPetitionDetailsCitizen(id: number): Observable<PetitionDetail> {
    return this.http.get<PetitionDetail>(`${this.baseUrl}/citizen/petitions/${id}`);
  }

  // Officer Back-Office Endpoints
  searchPetitionsOfficer(filters: {
    category?: string;
    status?: string;
    priority?: string;
    isPublicInitiative?: boolean;
    search?: string;
    assignedOfficerId?: number;
    page?: number;
    size?: number;
  }): Observable<PageResponse<PetitionResponse>> {
    let params = new HttpParams();
    if (filters.category) params = params.set('category', filters.category);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.priority) params = params.set('priority', filters.priority);
    if (filters.isPublicInitiative !== undefined) params = params.set('isPublicInitiative', filters.isPublicInitiative);
    if (filters.search) params = params.set('search', filters.search);
    if (filters.assignedOfficerId) params = params.set('assignedOfficerId', filters.assignedOfficerId);
    params = params.set('page', filters.page ?? 0).set('size', filters.size ?? 10);

    return this.http.get<PageResponse<PetitionResponse>>(`${this.baseUrl}/officer/petitions`, { params });
  }

  getPetitionDetailsOfficer(id: number): Observable<PetitionDetail> {
    return this.http.get<PetitionDetail>(`${this.baseUrl}/officer/petitions/${id}`);
  }

  updatePetitionStatus(id: number, request: PetitionStatusUpdateRequest): Observable<PetitionDetail> {
    return this.http.patch<PetitionDetail>(`${this.baseUrl}/officer/petitions/${id}/status`, request);
  }

  generateAiDraftResolution(id: number): Observable<AiResolutionDraft> {
    return this.http.post<AiResolutionDraft>(`${this.baseUrl}/officer/petitions/${id}/ai-draft-resolution`, {});
  }

  downloadPetitionReceiptPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/officer/petitions/${id}/pdf`, { responseType: 'blob' });
  }
}

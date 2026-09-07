import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/v1/auth';

  currentUserSignal = signal<User | null>(this.getUserFromStorage());
  isAuthenticated = computed(() => !!this.currentUserSignal());

  isCitizen = computed(() => {
    const user = this.currentUserSignal();
    return user ? user.roles.includes('ROLE_CITIZEN') : false;
  });

  isOfficer = computed(() => {
    const user = this.currentUserSignal();
    return user ? user.roles.includes('ROLE_OFFICER') : false;
  });

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => this.setSession(res))
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(res => this.setSession(res))
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
    this.currentUserSignal.set(null);
    window.location.href = '/login';
  }

  private setSession(authResult: AuthResponse): void {
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('user_info', JSON.stringify(authResult.user));
    this.currentUserSignal.set(authResult.user);
  }

  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem('user_info');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
}

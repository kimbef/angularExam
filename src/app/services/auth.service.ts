import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'https://jsonplaceholder.typicode.com'; // Mock API
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadStoredAuth();
  }

  private loadStoredAuth(): void {
    const storedUser = localStorage.getItem('currentUser');
    const storedToken = localStorage.getItem('authToken');
    
    if (storedUser && storedToken) {
      this.currentUserSubject.next(JSON.parse(storedUser));
      this.tokenSubject.next(storedToken);
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    // Mock login - in real app, this would call your backend
    return this.http.get<any>(`${this.API_URL}/users/1`).pipe(
      map(userData => {
        const mockUser: User = {
          id: userData.id.toString(),
          email: credentials.email,
          username: userData.username,
          firstName: userData.name.split(' ')[0],
          lastName: userData.name.split(' ')[1] || '',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const mockToken = `mock-jwt-token-${Date.now()}`;
        const mockRefreshToken = `mock-refresh-token-${Date.now()}`;

        const authResponse: AuthResponse = {
          user: mockUser,
          token: mockToken,
          refreshToken: mockRefreshToken
        };

        this.setAuthData(authResponse);
        return authResponse;
      }),
      catchError(this.handleError)
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    // Mock registration - in real app, this would call your backend
    return this.http.get<any>(`${this.API_URL}/users/1`).pipe(
      map(() => {
        const mockUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          email: userData.email,
          username: userData.username,
          firstName: userData.firstName,
          lastName: userData.lastName,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const mockToken = `mock-jwt-token-${Date.now()}`;
        const mockRefreshToken = `mock-refresh-token-${Date.now()}`;

        const authResponse: AuthResponse = {
          user: mockUser,
          token: mockToken,
          refreshToken: mockRefreshToken
        };

        this.setAuthData(authResponse);
        return authResponse;
      }),
      catchError(this.handleError)
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    this.currentUserSubject.next(null);
    this.tokenSubject.next(null);
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  private setAuthData(authResponse: AuthResponse): void {
    localStorage.setItem('currentUser', JSON.stringify(authResponse.user));
    localStorage.setItem('authToken', authResponse.token);
    localStorage.setItem('refreshToken', authResponse.refreshToken);
    
    this.currentUserSubject.next(authResponse.user);
    this.tokenSubject.next(authResponse.token);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}

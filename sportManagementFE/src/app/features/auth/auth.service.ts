import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError } from 'rxjs';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';

export interface User {
  name: string;
  email: string;
  role: 'coach' | 'athlete' | 'admin';
  photoUrl: string;
  age?: number;
  team?: string;
  level?: 'junior' | 'senior';
  username?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://localhost:8080/api';
  private loggedIn$ = new BehaviorSubject<boolean>(this.hasToken());
  private userRole$ = new BehaviorSubject<'coach' | 'athlete' | 'admin'>('athlete');
  private userData$ = new BehaviorSubject<User | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  onLogin(loginData: { username: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/login`, loginData).pipe(
      tap((response) => {
        this.storeAuthData(response.token, response.role, response.userId, loginData.username);
        this.router.navigate([this.getRedirectPath(response.role)]);
      }),
      catchError((error) => {
        console.error('Login failed:', error);
        return throwError(error);
      })
    );
  }

  register(data: { username: string; password: string; email: string; role: string }): Observable<any> {
    const payload = {
      username: data.username,
      password: data.password,
      email: data.email,
      role: data.role?.toUpperCase(),
    };

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post<any>(`${this.baseUrl}/auth/register`, payload, { headers }).pipe(
      tap(() => {
        console.log('✅ User registered successfully:', payload.username);
      }),
      catchError((error) => {
        console.error('Registration failed:', error);
        return throwError(error);
      })
    );
  }

  private storeAuthData(token: string, role: string, userId: string | number, username: string) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userRole', role);
    localStorage.setItem('userId', String(userId));
    localStorage.setItem('username', username);

    this.loggedIn$.next(true);
    this.userRole$.next(role as any);

    this.getFullUserData(username).subscribe({
      next: (user) => {
        this.userData$.next(user);
        localStorage.setItem('userData', JSON.stringify(user));
        localStorage.setItem('username', user.name);
      },
      error: () => {
        console.warn('⚠️ Could not load full user data.');
      }
    });
  }

  logout() {
    localStorage.clear();
    this.loggedIn$.next(false);
    this.userRole$.next('athlete');
    this.userData$.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): Observable<boolean> {
    return this.loggedIn$.asObservable();
  }

  getUserRole(): Observable<'coach' | 'athlete' | 'admin'> {
    return this.userRole$.asObservable();
  }

  getUserData(): Observable<User | null> {
    return this.userData$.asObservable();
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('authToken');
  }

  private loadUserFromStorage() {
    const token = this.getToken();
    const role = (localStorage.getItem('userRole') as 'coach' | 'athlete' | 'admin') || 'athlete';
    const username = localStorage.getItem('username');

    if (token && username) {
      this.loggedIn$.next(true);
      this.userRole$.next(role);

      this.getFullUserData(username).subscribe({
        next: (user) => {
          this.userData$.next(user);
          localStorage.setItem('userData', JSON.stringify(user));
        },
        error: () => {
          console.warn('⚠️ Failed to load user from backend');
        }
      });
    }
  }

  getRedirectPath(role: string): string {
    switch (role.toUpperCase()) {
      case 'COACH': return '/coach-board';
      case 'ATHLETE': return '/athlete-home';
      case 'ADMIN': return '/admin';
      default: return '/';
    }
  }

  updateUserData(user: User): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/account/update`, user).pipe(
      tap(updated => {
        console.log('Profile updated successfully:', updated);
        localStorage.setItem('userData', JSON.stringify(updated));
        this.userData$.next(updated);
      }),
      catchError(err => {
        console.error('❌ Update failed:', err);
        alert('Failed to update profile.');
        return throwError(err);
      })
    );
  }

  uploadUserData(formData: FormData): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/users/update`, formData).pipe(
      tap(updated => {
        console.log('✅ Profile updated successfully:', updated);
        localStorage.setItem('userData', JSON.stringify(updated));
        this.userData$.next(updated);
      }),
      catchError(err => {
        console.error('❌ File upload update failed:', err);
        alert('Failed to update profile.');
        return throwError(err);
      })
    );
  }

  getFullUserData(username: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/users/${username}`);
  }

  isAdmin(): boolean {
    return localStorage.getItem('userRole')?.toUpperCase() === 'ADMIN';
  }

  isCoach(): boolean {
    return localStorage.getItem('userRole')?.toUpperCase() === 'COACH';
  }

  isAthlete(): boolean {
    return localStorage.getItem('userRole')?.toUpperCase() === 'ATHLETE';
  }
}

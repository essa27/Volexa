import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Athlete } from './athlete.model';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NgZone } from '@angular/core';


@Injectable({ providedIn: 'root' })
export class AthleteService {
  private apiUrl = 'http://localhost:8080/api/athletes';

  constructor(private http: HttpClient) {}
  
  getAthletes(): Observable<Athlete[]> {
    return this.http.get<Athlete[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  getAthleteById(id: number): Observable<Athlete> {
    return this.http.get<Athlete>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  addAthleteWithPhoto(formData: FormData): Observable<Athlete> {
    return this.http.post<Athlete>(this.apiUrl, formData).pipe(
      catchError(this.handleError)
    );
  }

  updateAthlete(id: number, formData: FormData): Observable<Athlete> {
    return this.http.put<Athlete>(`${this.apiUrl}/${id}`, formData).pipe(
      catchError(this.handleError)
    );
  }

  deleteAthlete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }


  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    
    if (error.error instanceof ErrorEvent) {
    
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
     
      errorMessage = `Server-side error: ${error.status} - ${error.message}`;
    }

    console.error('AthleteService error:', errorMessage);
    return throwError(() => new Error(errorMessage || 'An unknown error occurred.'));
  }
}

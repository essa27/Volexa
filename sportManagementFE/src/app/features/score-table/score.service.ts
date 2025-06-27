// src/app/features/score-table/score.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MatchScore {
  id?: number;
  date: string;
  teamA: string;
  teamB: string;
  pointsA: number;
  pointsB: number;
  setsA: number;
  setsB: number;
}

@Injectable({ providedIn: 'root' })
export class ScoreService {
  private baseUrl = 'http://localhost:8080/api/scores';

  constructor(private http: HttpClient) {}

  getAll(): Observable<MatchScore[]> {
    return this.http.get<MatchScore[]>(this.baseUrl);
  }

  create(score: MatchScore): Observable<MatchScore> {
    return this.http.post<MatchScore>(this.baseUrl, score);
  }

  update(score: MatchScore): Observable<MatchScore> {
    return this.http.put<MatchScore>(`${this.baseUrl}/${score.id}`, score);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}

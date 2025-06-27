import { Component, OnInit } from '@angular/core';
import { ScoreService, MatchScore } from './score.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-score-table',
  templateUrl: './score-table.component.html',
  styleUrls: ['./score-table.component.scss']
})
export class ScoreTableComponent implements OnInit {
  scores: (MatchScore & { isEditing?: boolean })[] = [];
  userRole = '';
  displayedColumns: string[] = [];

  get isCoachOrAdmin(): boolean {
    return ['COACH', 'ADMIN'].includes(this.userRole?.toUpperCase());
  }

  constructor(
    private scoreService: ScoreService,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.userRole = localStorage.getItem('userRole') || 'athlete';
    this.setDisplayedColumns();
    this.loadScores();
  }
  
  setDisplayedColumns(): void {
    this.displayedColumns = ['date', 'teams', 'points', 'sets'];
    if (this.isCoachOrAdmin) {
      this.displayedColumns.push('actions');
    }
  }
  

  loadScores(): void {
    console.log('📥 Calling loadScores()...');
    this.scoreService.getAll().subscribe({
      next: (data) => {
        console.log('✅ Scores loaded from backend:', data);
        this.scores = data.map(score => ({ ...score, isEditing: false }));
      },
      error: (err) => {
        console.error('❌ Failed to load scores:', err);
      }
    });
  }

  editMatch(match: MatchScore & { isEditing?: boolean }): void {
    if (this.isCoachOrAdmin) {
      match.isEditing = true;
    }
  }

  saveMatch(match: MatchScore & { isEditing?: boolean }): void {
    if (!this.isCoachOrAdmin) return;

    const { isEditing, ...sanitizedMatch } = match;
    console.log('💾 Saving match:', sanitizedMatch);

    const saveAction = match.id
      ? this.scoreService.update(sanitizedMatch)
      : this.scoreService.create(sanitizedMatch);

    saveAction.subscribe({
      next: () => {
        this.snackBar.open(this.translate.instant('SCORES.SAVE_SUCCESS'), '', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });
        this.loadScores();
      },
      error: (err) => {
        this.snackBar.open(this.translate.instant('SCORES.SAVE_ERROR'), '', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
        console.error('❌ Save failed:', err);
      }
    });
  }

  addMatch(): void {
    if (this.isCoachOrAdmin) {
      const today = new Date().toISOString().split('T')[0];
      const newMatch: MatchScore & { isEditing?: boolean } = {
        date: today,
        teamA: '',
        teamB: '',
        pointsA: 0,
        pointsB: 0,
        setsA: 0,
        setsB: 0,
        isEditing: true
      };
      this.scores = [newMatch, ...this.scores];
      console.log('➕ Match added locally:', newMatch);
    } else {
      console.warn('🚫 Add match not allowed — not coach or admin');
    }
  }

  deleteMatch(match: MatchScore): void {
    if (this.isCoachOrAdmin && match.id != null) {
      console.log('🗑️ Deleting match:', match);
      this.scoreService.delete(match.id).subscribe({
        next: () => {
          this.snackBar.open(this.translate.instant('SCORES.DELETE_SUCCESS'), '', {
            duration: 3000,
            panelClass: ['snackbar-success']
          });
          this.loadScores();
        },
        error: (err) => {
          this.snackBar.open(this.translate.instant('SCORES.DELETE_ERROR'), '', {
            duration: 3000,
            panelClass: ['snackbar-error']
          });
          console.error('❌ Delete failed:', err);
        }
      });
    }
  }
  trackByFn(index: number, item: MatchScore): any {
    return item.id ?? index;
  }


  
  
}

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AthleteService } from '../athlete.service';
import { Athlete } from '../athlete.model';
import { AuthService } from 'src/app/features/auth/auth.service';
import { ChartConfiguration } from 'chart.js';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { EMPTY, combineLatest, Subscription } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';

@Component({
  selector: 'app-athlete-profile',
  templateUrl: './athlete-profile.component.html',
  styleUrls: ['./athlete-profile.component.scss']
})
export class AthleteProfileComponent implements OnInit {
  athlete!: Athlete;
  userRole!: string;
  imagePreviewUrl: string | null = null;
  selectedFile: File | null = null;
  selectedMedicalFile: File | null = null;
  selectedContract: File | null = null;
  isEditMode = false;

  performanceChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [] as string[],
    datasets: [{
      label: '',
      data: [0, 0, 0, 0],
      backgroundColor: '#ffd600'
    }]
  };
  performanceChartType: 'bar' = 'bar';
  chartOptions: ChartConfiguration<'bar'>['options'] = { responsive: true };

  weeks = [
    { label: 'WEEK_1', displayLabel: '', attended: 0, total: 5 },
    { label: 'WEEK_2', displayLabel: '', attended: 0, total: 5 },
    { label: 'WEEK_3', displayLabel: '', attended: 0, total: 5 },
    { label: 'WEEK_4', displayLabel: '', attended: 0, total: 5 }
  ];

  private langChangeSub!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private athleteService: AthleteService,
    private authService: AuthService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Subscribe to route changes
    this.route.paramMap.pipe(
      switchMap(pm => {
        const id = Number(pm.get('id'));
        if (isNaN(id)) {
          alert(this.translate.instant('ATHLETE.VIEW_ERROR'));
          this.router.navigate(['/athletes']);
          return EMPTY;
        }
        // fetch athlete & role in parallel
        return combineLatest([
          this.athleteService.getAthleteById(id),
          this.authService.getUserRole().pipe(take(1))
        ]);
      })
    ).subscribe({
      next: ([athlete, role]) => {
        this.athlete = athlete;
        this.userRole = role;
        this.imagePreviewUrl = this.getPhotoUrl();
        this.refreshAllLabels(); // load chart labels & map attendance
        this.cdr.markForCheck();
      },
      error: err => {
        console.error(err);
        alert(this.translate.instant('ATHLETE.VIEW_ERROR'));
        this.router.navigate(['/athletes']);
      }
    });

    // React to language changes: reload labels & attendance display
    this.langChangeSub = this.translate.onLangChange.subscribe((evt: LangChangeEvent) => {
      // If athlete already loaded, refresh labels
      if (this.athlete) {
        this.refreshAllLabels();
        this.cdr.markForCheck();
      }
    });
  }

  ngOnDestroy(): void {
    this.langChangeSub?.unsubscribe();
  }

  private refreshAllLabels(): void {
    // Load translation for week labels and attendance label
    this.translate.get([
      'ATHLETE.WEEK_1_LABEL',
      'ATHLETE.WEEK_2_LABEL',
      'ATHLETE.WEEK_3_LABEL',
      'ATHLETE.WEEK_4_LABEL',
      'ATHLETE.ATTENDANCE_LABEL'
    ]).subscribe(translations => {
      const keys = ['WEEK_1', 'WEEK_2', 'WEEK_3', 'WEEK_4'] as const;
      // Update displayLabel for each week
      this.weeks.forEach((w, i) => {
        w.displayLabel = translations[`ATHLETE.${keys[i]}_LABEL`];
      });
      // Chart labels
      this.performanceChartData.labels = this.weeks.map(w => w.displayLabel);
      this.performanceChartData.datasets[0].label = translations['ATHLETE.ATTENDANCE_LABEL'];

      // Map athlete.weeklyAttendance into weeks[]
      const mapLabel: Record<string, string> = {
        'Week 1': 'WEEK_1',
        'Week 2': 'WEEK_2',
        'Week 3': 'WEEK_3',
        'Week 4': 'WEEK_4'
      };
      const wa = this.athlete.weeklyAttendance ?? [];
      if (wa.length === 4) {
        this.weeks = wa.map((entry, i) => ({
          label: mapLabel[entry.label] || entry.label,
          displayLabel: this.weeks[i].displayLabel,
          attended: entry.attended,
          total: entry.total
        }));
      }
      this.updateMonthlyAttendance();
    });
  }

  goBack(): void {
    this.router.navigate(['/athletes']);
  }

  toggleEdit(): void {
    if (this.isEditMode) this.saveChanges();
    this.isEditMode = !this.isEditMode;
  }

  saveChanges(): void {
    if (!this.athlete?.id) return;
    const reverseMap: Record<string, string> = {
      'WEEK_1': 'Week 1',
      'WEEK_2': 'Week 2',
      'WEEK_3': 'Week 3',
      'WEEK_4': 'Week 4'
    };
    this.athlete.weeklyAttendance = this.weeks.map(w => ({
      label: reverseMap[w.label] || w.label,
      attended: w.attended,
      total: w.total
    }));

    const fd = new FormData();
    fd.append('athlete', new Blob([JSON.stringify(this.athlete)], { type: 'application/json' }));
    if (this.selectedFile) fd.append('file', this.selectedFile);
    if (this.selectedMedicalFile) fd.append('medicalFile', this.selectedMedicalFile);
    if (this.selectedContract) fd.append('contractFile', this.selectedContract);

    this.athleteService.updateAthlete(this.athlete.id, fd).subscribe({
      next: updated => {
        this.athlete = updated;
        this.selectedFile = this.selectedMedicalFile = this.selectedContract = null;
        // remap weeks from updated response
        const labelMap: Record<string, string> = {
          'Week 1': 'WEEK_1',
          'Week 2': 'WEEK_2',
          'Week 3': 'WEEK_3',
          'Week 4': 'WEEK_4'
        };
        const wa2 = updated.weeklyAttendance ?? [];
        if (wa2.length === 4) {
          this.weeks = wa2.map((entry, i) => ({
            label: labelMap[entry.label] || entry.label,
            displayLabel: this.weeks[i].displayLabel,
            attended: entry.attended,
            total: entry.total
          }));
        }
        this.imagePreviewUrl = this.getPhotoUrl();
        this.updateMonthlyAttendance();
        alert(this.translate.instant('ATHLETE.SAVE_SUCCESS', { name: this.athlete.name }));
        this.isEditMode = false;
        this.cdr.markForCheck();
      },
      error: err => {
        console.error(err);
        // optionally show error
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.selectedFile = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreviewUrl = reader.result as string;
      this.cdr.markForCheck();
    };
    reader.readAsDataURL(this.selectedFile);
  }

  onMedicalFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedMedicalFile = input.files[0];
      this.cdr.markForCheck();
    }
  }

  onContractSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedContract = input.files[0];
      this.cdr.markForCheck();
    }
  }

  getPhotoUrl(): string {
    return this.athlete.photoUrl
      ? `http://localhost:8080/api/images/${this.athlete.photoUrl}`
      : 'assets/default.jpg';
  }

  isCoachOrAdmin(): boolean {
    return this.userRole === 'COACH' || this.userRole === 'ADMIN';
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/default.jpg';
  }

  scrollToBottom(): void {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }

  getDocumentUrl(filename: string | undefined | null, type: 'medical' | 'contracts'): string {
    if (!filename) return '';
    return `http://localhost:8080/api/athletes/files/${type}/${encodeURIComponent(filename)}`;
  }

  removeMedicalDocument(): void {
    if (this.isEditMode) {
      this.athlete.medicalDocumentUrl = '';
      this.cdr.markForCheck();
    }
  }

  removeContractDocument(): void {
    if (this.isEditMode) {
      this.athlete.contractDocumentUrl = '';
      this.cdr.markForCheck();
    }
  }

  updateMonthlyAttendance(): void {
    const totalAttended = this.weeks.reduce((sum, w) => sum + w.attended, 0);
    const totalPossible = this.weeks.reduce((sum, w) => sum + w.total, 0);
    this.athlete.attendance = totalPossible > 0
      ? Math.round((totalAttended / totalPossible) * 100)
      : 0;
    this.performanceChartData.datasets[0].data =
      this.weeks.map(w =>
        w.total > 0 ? Math.round((w.attended / w.total) * 100) : 0
      );
    this.cdr.markForCheck();
  }
}

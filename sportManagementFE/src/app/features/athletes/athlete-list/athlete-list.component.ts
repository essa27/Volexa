import { Component, OnInit } from '@angular/core';
import { Athlete } from '../athlete.model';
import { AthleteService } from '../athlete.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/features/auth/auth.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-athlete-list',
  templateUrl: './athlete-list.component.html',
  styleUrls: ['./athlete-list.component.scss']
})
export class AthleteListComponent implements OnInit {
  athletes: Athlete[] = [];
  searchQuery = '';
  showAddForm = false;
  userRole: string | null = null;

  selectedPhotoFile: File | null = null;
  selectedMedicalFile: File | null = null;
  selectedContractFile: File | null = null;

  photoPreviewUrl: string | null = null;

  newAthlete: Athlete = this.getEmptyAthlete();

  constructor(
    private athleteService: AthleteService,
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.authService.getUserRole().subscribe(role => {
      this.userRole = role?.toUpperCase();
    });
    this.loadAthletes();
  }

  loadAthletes(): void {
    this.athleteService.getAthletes().subscribe(data => {
      this.athletes = data.sort((a, b) => a.name.localeCompare(b.name));
    });
  }

  get filteredAthletes(): Athlete[] {
    return this.athletes.filter(a =>
      (a.name || '').toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  addAthlete(): void {
    if (!this.newAthlete.name.trim()) return;

    const formData = new FormData();
    const { id, ...athleteToSend } = this.newAthlete;
    formData.append('athlete', new Blob([JSON.stringify(athleteToSend)], { type: 'application/json' }));

    if (this.selectedPhotoFile) {
      formData.append('file', this.selectedPhotoFile);
    }
    if (this.selectedMedicalFile) {
      formData.append('medicalFile', this.selectedMedicalFile);
    }
    if (this.selectedContractFile) {
      formData.append('contractFile', this.selectedContractFile);
    }

    this.athleteService.addAthleteWithPhoto(formData).subscribe((created) => {
      this.athletes.push(created);
      this.resetForm();
      this.showAddForm = false;
    });
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files?.[0]) {
      this.selectedPhotoFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.photoPreviewUrl = reader.result as string;
      };
      reader.readAsDataURL(this.selectedPhotoFile);
    }
  }

  onMedicalFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files?.[0]) {
      this.selectedMedicalFile = input.files[0];
    }
  }

  onContractFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files?.[0]) {
      this.selectedContractFile = input.files[0];
    }
  }

  saveAthlete(athlete: Athlete): void {
    const formData = new FormData();
    const { id, ...athleteData } = athlete;
    formData.append('athlete', new Blob([JSON.stringify(athleteData)], { type: 'application/json' }));

    if (this.selectedPhotoFile) {
      formData.append('file', this.selectedPhotoFile);
    }
    if (this.selectedMedicalFile) {
      formData.append('medicalFile', this.selectedMedicalFile);
    }
    if (this.selectedContractFile) {
      formData.append('contractFile', this.selectedContractFile);
    }

    this.athleteService.updateAthlete(athlete.id, formData).subscribe(() => {
      this.loadAthletes();
      this.translate.get('ATHLETE.SAVE_SUCCESS', { name: athlete.name }).subscribe(msg => {
        alert(msg);
      });
    });
  }

  deleteAthlete(id: number): void {
    this.athleteService.deleteAthlete(id).subscribe(() => {
      this.loadAthletes();
    });
  }

  viewAthlete(id: number): void {
    if (id && id > 0) {
      this.router.navigate(['/athlete', id]);
    } else {
      this.translate.get('ATHLETE.VIEW_ERROR').subscribe(msg => {
        alert(msg);
      });
    }
  }

  resetForm(): void {
    this.newAthlete = this.getEmptyAthlete();
    this.selectedPhotoFile = null;
    this.selectedMedicalFile = null;
    this.selectedContractFile = null;
    this.photoPreviewUrl = null;
  }

  getEmptyAthlete(): Athlete {
    return {
      id: 0,
      name: '',
      position: '',
      team: '',
      level: 'Junior',
      age: 0,
      height: 0,
      weight: 0,
      email: '',
      attendance: 0,
      photoUrl: '',
      matchesPlayed: 0,
      points: 0,
      blocks: 0,
      serves: 0
    };
  }
  positionOptions = [
    { value: 'SETTER', label: 'ATHLETE.POSITIONS.SETTER' },
    { value: 'LIBERO', label: 'ATHLETE.POSITIONS.LIBERO' },
    { value: 'MIDDLE', label: 'ATHLETE.POSITIONS.MIDDLE' },
    { value: 'HITTER', label: 'ATHLETE.POSITIONS.HITTER' }
  ];
  
  isCoachOrAdmin(): boolean {
    return ['COACH', 'ADMIN'].includes(this.userRole || '');
  }

  getPhotoUrl(photoFilename: string | null | undefined): string {
    return photoFilename && photoFilename.trim() !== ''
      ? `http://localhost:8080/api/images/${photoFilename}`
      : 'assets/default.jpg';
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/default.jpg';
  }
}

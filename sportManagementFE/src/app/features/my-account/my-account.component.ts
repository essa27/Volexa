import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AuthService, User } from 'src/app/features/auth/auth.service';
import { ChangeDetectorRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core'; 

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.scss']
})
export class MyAccountComponent implements OnInit {
  user: User | null = null;
  isEditing = false;
  selectedFile: File | null = null;
  timestamp = Date.now();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private authService: AuthService,
    private cdRef: ChangeDetectorRef,
    private translate: TranslateService 
  ) {}

  ngOnInit(): void {
    const storedUserData = localStorage.getItem('userData');

    if (storedUserData) {
      this.user = JSON.parse(storedUserData);
    } else {
      const username = localStorage.getItem('username');
      if (username) {
        this.authService.getFullUserData(username).subscribe({
          next: (data) => {
            this.user = { ...data };
            localStorage.setItem('userData', JSON.stringify(this.user));
          },
          error: () => {
            console.warn('⚠️ Could not load user from backend');
          }
        });
      } else {
        console.warn('⚠️ No username in storage. User data not available!');
      }
    }
  }

  startEditing() {
    this.isEditing = true;
  }

  saveChanges() {
    if (!this.user) return;

    if (!this.validateUserProfile(this.user)) {
      this.translate.get('ACCOUNT.ERROR_REQUIRED_FIELDS').subscribe((msg) => {
        alert(msg); // ✅ Translated error
      });
      return;
    }

    const formData = new FormData();
    formData.append('user', new Blob([JSON.stringify(this.user)], { type: 'application/json' }));
    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    this.authService.uploadUserData(formData).subscribe({
      next: (updated: User) => {
        console.log('✅ Profile saved!', updated);
        localStorage.setItem('userData', JSON.stringify(updated));
        this.user = { ...updated };
        this.selectedFile = null;
        this.timestamp = Date.now();
        this.isEditing = false;
      },
      error: (err: any) => {
        console.error('❌ Failed to save changes:', err);
        this.translate.get('ACCOUNT.ERROR_UPDATE_FAIL').subscribe((msg) => {
          alert(msg); 
        });
      }
    });
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (file.type.startsWith('image/')) {
        this.selectedFile = file;

        const reader = new FileReader();
        reader.onload = (e: any) => {
          if (this.user) {
            this.user.photoUrl = e.target.result;
            this.cdRef.detectChanges();
          }
        };

        reader.readAsDataURL(file);
      } else {
        this.translate.get('ACCOUNT.ERROR_INVALID_IMAGE').subscribe((msg) => {
          alert(msg); 
        });
      }
    } else {
      console.log('No file selected or user canceled the file selection.');
    }
  }

  getPhotoUrl(): string {
    if (!this.user?.photoUrl) {
      return 'assets/default.jpg';
    }

    if (this.user.photoUrl.startsWith('data:image/')) {
      return this.user.photoUrl;
    }

    return this.user.photoUrl + '?t=' + this.timestamp;
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/default.jpg';
  }

  validateUserProfile(user: User): boolean {
    return !!(user.name && user.email);
  }

  get isCoach(): boolean {
    return this.user?.role === 'coach';
  }

  get isAdmin(): boolean {
    return this.user?.role === 'admin';
  }

  get isAthlete(): boolean {
    return this.user?.role === 'athlete';
  }
}

import { Component } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerData = {
    username: '',
    email: '',
    password: '',
    role: ''
  };

  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService
  ) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onRegister(): void {
    const payload = {
      username: this.registerData.username,
      email: this.registerData.email,
      password: this.registerData.password,
      role: this.registerData.role.toUpperCase()
    };

    console.log('📦 Payload sent to backend:', payload);

    this.authService.register(payload).subscribe({
      next: () => {
        this.translate.get('REGISTER.SUCCESS').subscribe((msg: string) => {
          alert(msg);
        });
        this.router.navigate(['/admin/manage-users']);
      },
      error: (err) => {
        console.error('❌ Registration error:', err);
    
        const backendMsg = err?.error?.message;
        this.translate.get('REGISTER.FAILED').subscribe((fallback: string) => {
          alert(backendMsg || fallback);
        });
      }
    });
     }   }

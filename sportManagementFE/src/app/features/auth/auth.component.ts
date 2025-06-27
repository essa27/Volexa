import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core'; 

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  animations: []
})
export class AuthComponent implements OnInit {
  showPassword = false;

  loginData = {
    username: '',
    password: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService 
  ) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onLogin() {
    this.authService.onLogin(this.loginData).subscribe({
      next: (response) => {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userRole', response.role.toUpperCase());
        localStorage.setItem('userId', response.userId);

        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Login failed:', error);

        const backendMessage = error.error?.message;
        this.translate.get('AUTH.LOGIN_FAILED').subscribe((msg) => {
          alert(`${msg}: ${backendMessage || 'Unknown error'}`); 
        });
      }
    });
  }

  ngOnInit(): void {
    const token = localStorage.getItem('authToken');
    if (token) {
      this.router.navigate(['/home']);
    }
  }
}

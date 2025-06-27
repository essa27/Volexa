import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const role = localStorage.getItem('userRole')?.toUpperCase();
    if (role === 'ADMIN' || role === 'COACH') {
      return true;
    } else {
      this.router.navigate(['/auth']);
      return false;
    }
  }
}

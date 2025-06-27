import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.scss']
})
export class ManageUsersComponent implements OnInit {
  users: any[] = [];

  constructor(
    private userService: UserService,
    private router: Router,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (data: any[]) => this.users = data,
      error: (err: any) => console.error('❌ Failed to load users:', err)
    });
  }

  deleteUser(id: number): void {
    const msg = this.translate.instant('USERS.CONFIRM_DELETE');
    if (confirm(msg)) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (err) => {
          const backendMsg = err?.error?.message;

          if (backendMsg === 'Cannot delete user: related data exists.') {
            alert(this.translate.instant('USERS.DELETE_CONFLICT'));
          } else {
            alert(backendMsg || this.translate.instant('USERS.DELETE_FAILED'));
          }

          console.error('❌ Failed to delete user:', err);
        }
      });
    }
  }

  goToRegister(): void {
    this.router.navigate(['/admin/register']);
  }
}

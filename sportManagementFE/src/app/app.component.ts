import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService, User } from './features/auth/auth.service';
import { NotificationService } from './features/notifications/notification.service';
import { Notification } from './features/notifications/notification.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  dropdownOpen = false;
  hasUnread = false;
  currentUser: User | null = null;
  userRole: 'admin' | 'coach' | 'athlete' | null = null;

  private subscriptions: Subscription[] = [];

  constructor(
    public authService: AuthService,
    private notificationService: NotificationService,
    private translate: TranslateService
  ) {
    translate.addLangs(['en', 'ro']);
    const savedLang = localStorage.getItem('lang') || 'ro';
    translate.setDefaultLang('ro');
    translate.use(savedLang);
  }

  ngOnInit(): void {
    const sub1 = this.authService.isLoggedIn().subscribe((status) => {
      this.isLoggedIn = status;
    });

    const sub2 = this.authService.getUserData().subscribe((user) => {
      this.currentUser = user;
    });

    const sub3 = timer(0, 3000).pipe(
      switchMap(() => this.notificationService.getNotifications())
    ).subscribe((notifs: Notification[]) => {
      this.hasUnread = this.notificationService.hasUnread(notifs);
    });

    const sub4 = this.authService.getUserRole().subscribe(role => {
      this.userRole = role;
    });

    this.subscriptions.push(sub1, sub2, sub3, sub4);
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  updateUnread(status: boolean): void {
    this.hasUnread = status;
  }

  logout(): void {
    this.authService.logout();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.nav-notification')) {
      this.dropdownOpen = false;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}

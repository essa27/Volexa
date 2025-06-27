import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NotificationService } from './notification.service';
import { Notification } from './notification.model';
import { AuthService, User } from '../auth/auth.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  allNotifications: Notification[] = [];
  showAll = false;
  userRole: string = '';
  modalOpen = false;
  currentUser: User | null = null;

  @Output() unreadChange = new EventEmitter<boolean>();

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.authService.getUserRole().subscribe(role => {
      this.userRole = role?.toUpperCase() || '';
    });

    this.authService.getUserData().subscribe(user => {
      this.currentUser = user;
      this.loadNotifications();
    });
  }

  isCoachOrAdmin(): boolean {
    return ['COACH', 'ADMIN'].includes(this.userRole);
  }

  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe(data => {
      const sorted = data.sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      this.allNotifications = sorted;
      this.notifications = this.showAll
        ? this.allNotifications
        : this.allNotifications.slice(0, 3);

      const hasUnread = this.notificationService.hasUnread(sorted);
      this.unreadChange.emit(hasUnread);
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.loadNotifications();
    });
  }

  toggleViewAll(): void {
    this.showAll = !this.showAll;
    this.loadNotifications();
  }

  openNotificationForm(): void {
    if (this.isCoachOrAdmin()) {
      this.modalOpen = true;
    } else {
      this.translate.get('NOTIFICATIONS.PERMISSION_DENIED').subscribe(msg => {
        alert('❌ ' + msg);
      });
    }
  }

  closeNotificationForm(): void {
    this.modalOpen = false;
  }

  onNotificationSubmit(message: string): void {
    const senderName = this.currentUser?.name || 'Unknown';
    const capitalizedRole =
      this.userRole.charAt(0) + this.userRole.slice(1).toLowerCase();

    const newNotification = {
      sender: `${capitalizedRole} ${senderName}`,
      message: message,
      date: new Date().toISOString(),
      unread: true
    };

    this.notificationService.addNotification(newNotification).subscribe(() => {
      this.loadNotifications();
      this.unreadChange.emit(true);
      this.closeNotificationForm();
    });
  }

  deleteNotification(id: number): void {
    if (!this.isCoachOrAdmin()) return;

    this.notificationService.deleteNotification(id).subscribe({
      next: () => this.loadNotifications(),
      error: err =>
        console.error('❌ Failed to delete notification:', err)
    });
  }
}

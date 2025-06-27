import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-add-notification',
  templateUrl: './add-notification.component.html',
  styleUrls: ['./add-notification.component.scss']
})
export class AddNotificationComponent implements OnInit {
  newNotificationMessage: string = '';
  newNotificationTarget: string = 'all';
  userRole: string = '';
  userName: string = '';

  @Output() notify = new EventEmitter<string>();

  constructor() {}

  ngOnInit(): void {
    this.userRole = localStorage.getItem('userRole')?.toUpperCase() || '';
    this.userName = localStorage.getItem('userName') || 'Unknown';
  }

  isCoachOrAdmin(): boolean {
    return ['COACH', 'ADMIN'].includes(this.userRole);
  }

  addNotification(): void {
    if (this.newNotificationMessage.trim()) {
      this.notify.emit(this.newNotificationMessage.trim()); // ✅ emit only
      this.newNotificationMessage = '';
      this.newNotificationTarget = 'all';
    } else {
      alert('⚠️ Please enter a message.');
    }
  }
}

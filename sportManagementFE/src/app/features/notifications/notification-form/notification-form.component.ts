import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-notification-form',
  templateUrl: './notification-form.component.html',
  styleUrls: ['./notification-form.component.scss']
})
export class NotificationFormComponent {
  message: string = '';

  @Output() notify = new EventEmitter<string>(); // emits the message text
  @Output() close = new EventEmitter<void>();    // closes the modal

  submitNotification(): void {
    const trimmed = this.message.trim();
    if (!trimmed) return;

    this.notify.emit(trimmed);  // send message to parent
    this.message = '';
    this.close.emit();          // close modal
  }

  cancel(): void {
    this.close.emit();
  }
}

import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReservationService } from 'src/app/features/court-reservation/reservation.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-reservation-modal',
  templateUrl: './reservation-modal.component.html'
})
export class ReservationModalComponent {
  form: FormGroup;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ReservationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private reservationService: ReservationService,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {
    this.isEditMode = !!data?.id;

    const defaultDate = data?.date || this.getTodayISO();

    this.form = this.fb.group({
      id: [data?.id || null],
      title: [data?.title || '', Validators.required],
      courtId: [data?.courtId || 1],
      date: [defaultDate],
      startTime: [data?.startTime?.slice(0, 5) || '', Validators.required],
      endTime: [data?.endTime?.slice(0, 5) || '', Validators.required],
      team: [data?.team || '']
    });
  }

  submit() {
    if (this.form.invalid) return;

    const { id, date, startTime, endTime, courtId, team, ...rest } = this.form.value;

    const dateStr = typeof date === 'string' ? date : this.getTodayISO();
    const [year, month, day] = dateStr.split('-').map(Number);
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const start = new Date(year, month - 1, day, startHour, startMinute);
    const end = new Date(year, month - 1, day, endHour, endMinute);

    if (start >= end) {
      this.snackBar.open(
        this.translate.instant('FORM.ERROR_END_BEFORE_START'),
        this.translate.instant('FORM.CLOSE'),
        { duration: 5000, panelClass: ['snackbar-error'] }
      );
      return;
    }

    const payload = {
      ...rest,
      courtId,
      team,
      startTime: this.toOffsetISOString(start),
      endTime: this.toOffsetISOString(end)
    };

    const request$ = this.isEditMode
      ? this.reservationService.updateReservation(id, payload)
      : this.reservationService.createReservation(payload);

    request$.subscribe({
      next: () => {
        this.snackBar.open(
          this.translate.instant('FORM.SUCCESS'),
          this.translate.instant('FORM.CLOSE'),
          { duration: 3000, panelClass: ['snackbar-success'] }
        );
        this.dialogRef.close(payload);
      },
      error: (err) => {
        if (err.status === 409) {
          this.snackBar.open(
            this.translate.instant('FORM.CONFLICT'),
            this.translate.instant('FORM.CLOSE'),
            { duration: 5000, panelClass: ['snackbar-error'] }
          );
        } else {
          this.snackBar.open(
            this.translate.instant('FORM.FAILURE'),
            this.translate.instant('FORM.CLOSE'),
            { duration: 5000, panelClass: ['snackbar-error'] }
          );
        }
        console.error(err);
      }
    });
  }

  cancel() {
    this.dialogRef.close();
  }

  private getTodayISO(): string {
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    return today.toISOString().split('T')[0];
  }

  private toOffsetISOString(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const min = pad(date.getMinutes());

    const offset = -date.getTimezoneOffset();
    const sign = offset >= 0 ? '+' : '-';
    const offsetHours = pad(Math.floor(Math.abs(offset) / 60));
    const offsetMinutes = pad(Math.abs(offset) % 60);

    return `${yyyy}-${mm}-${dd}T${hh}:${min}${sign}${offsetHours}:${offsetMinutes}`;
  }
}

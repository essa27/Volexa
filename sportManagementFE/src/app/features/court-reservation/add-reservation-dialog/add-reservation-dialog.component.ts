import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-reservation-dialog',
  templateUrl: './add-reservation-dialog.component.html',
})
export class AddReservationDialogComponent {
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<AddReservationDialogComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      date: [data?.defaultDate || new Date(), Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      team: ['TeamA'] // ✅ Default team selected
    });
  }

  submit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}

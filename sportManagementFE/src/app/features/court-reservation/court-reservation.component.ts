import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  ChangeDetectorRef,
  Inject,
} from '@angular/core';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReservationService } from 'src/app/features/court-reservation/reservation.service';
import { ReservationModalComponent } from 'src/app/reservation-modal/reservation-modal.component';
import { TranslateService } from '@ngx-translate/core';
import { LOCALE_ID } from '@angular/core';
import { LocaleService } from 'src/app/services/locale.service';

interface CustomCalendarEvent extends CalendarEvent {
  notified?: boolean;
}

@Component({
  selector: 'app-court-reservation',
  templateUrl: './court-reservation.component.html',
  styleUrls: ['./court-reservation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourtReservationComponent implements OnInit {
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  refresh: Subject<any> = new Subject();

  isAdmin = false;
  activeDay: Date = new Date();
  activeDayIsOpen = true;
  localeReady = false;
  selectedDayEvents: CustomCalendarEvent[] = [];
  events: CustomCalendarEvent[] = [];
  private notifiedEventIds: Set<string> = new Set();

  months: string[] = [];
  weekdayNames: string[] = [];
  currentMonth: string = '';

  userRole: string = '';
  username: string = '';

  teamColors: Record<string, { primary: string; secondary: string }> = {
    TeamA: { primary: '#55B0FF', secondary: '#D1E8FF' },
    TeamB: { primary: '#FF8555', secondary: '#FFE1D1' },
    TeamC: { primary: '#7DDE92', secondary: '#D9F7E5' },
  };

  constructor(
    private dialog: MatDialog,
    private reservationService: ReservationService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    private localeService: LocaleService,
    @Inject(LOCALE_ID) private locale: string
  ) {}

  ngOnInit(): void {
    this.userRole = localStorage.getItem('userRole')?.toUpperCase() || '';
    this.username = localStorage.getItem('username') || '';
    this.isAdmin = this.userRole === 'ADMIN' || this.userRole === 'COACH';
    this.activeDay = this.viewDate;

    this.localeService.locale$.subscribe((newLocale: string) => {
      this.locale = newLocale;
      this.updateMonthNames();
      this.updateWeekdayNames();
      this.refresh.next({});
      this.localeReady = true;
    });

    this.locale = this.localeService.getCurrentLocale?.() || this.locale;
    this.updateMonthNames();
    this.updateWeekdayNames();
    this.localeReady = true;

    this.loadReservations();
    setInterval(() => this.checkForUpcomingReservations(), 60000);
    console.log('Logged in as:', this.username);
    console.log('User role:', this.userRole);
  }

  private updateMonthNames(): void {
    this.months = Array.from({ length: 12 }, (_, i) =>
      new Intl.DateTimeFormat(this.locale, { month: 'long' }).format(new Date(2000, i))
    );
    this.currentMonth = this.months[this.viewDate.getMonth()];
  }

  private updateWeekdayNames(): void {
    this.weekdayNames = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(Date.UTC(2021, 5, 6 + i)); // Sun to Sat
      return new Intl.DateTimeFormat(this.locale, { weekday: 'short' }).format(date);
    });
  }

  showAppNotification(title: string): void {
    this.translate.get('CALENDAR.NOTIFY', { title }).subscribe(msg => {
      this.snackBar.open(`🔔 ${msg}`, 'Close', {
        duration: 6000,
        panelClass: ['snackbar-info'],
      });
    });
  }
  

  checkForUpcomingReservations(): void {
    const now = new Date().getTime();

    this.events.forEach(event => {
      const eventStart = new Date(event.start).getTime();
      const diff = eventStart - now;
      const eventId = `${event.title}-${eventStart}`;

      if (diff > 0 && diff <= 3600000 && !this.notifiedEventIds.has(eventId)) {
        const cleanTitle = event.title.replace(/\s*\(.*?\)/, '');
        this.showAppNotification(cleanTitle);
        this.notifiedEventIds.add(eventId);
      }
    });
  }

  loadReservations(): void {
    this.reservationService.getAllReservations().subscribe({
      next: (reservations) => {
        this.events = reservations.map((r: any) => {
          const color = this.teamColors[r.team] || this.teamColors['TeamA'];
          console.log('[Reservation]', r.title, '| Coach:', r.coachName);
          console.log('[Reservation]', r.title, '| Coach:', r.coachName);
  
          return {
            title: r.title + (r.team ? ` (${r.team})` : ''),
            start: this.parseOffsetToLocal(r.startTime),
            end: this.parseOffsetToLocal(r.endTime),
            color,
            allDay: false,
            meta: {
              ...r,
              userId: r.userId,
              coachName: r.coachName?.trim() || ''
            }
          } as CustomCalendarEvent;
        });
  
        this.updateSelectedDayEvents();
        this.refresh.next({});
        this.cdr.markForCheck();
        
      },
      error: (err) => {
        console.error('Failed to load reservations', err);
  
        this.translate.get('CALENDAR.LOAD_ERROR').subscribe((msg: string) => {
          this.snackBar.open(msg, 'Close', {
            duration: 4000,
            panelClass: ['snackbar-error'],
          });
        });
      }
    });
  }
  
  

  openReservationDialog(): void {
    if (!this.isAdmin) return;

    const selectedDate = this.viewDate;
    const dialogRef = this.dialog.open(ReservationModalComponent, {
      width: '400px',
      data: {
        date: this.getLocalDateString(selectedDate),
      }
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res?.startTime) {
        const resDate = new Date(res.startTime);
        this.activeDay = resDate;
        this.viewDate = resDate;
        this.loadReservations();
      }
    });
  }

  handleEventClick(event: CalendarEvent): void {
    if (!this.isAdmin) return;

    const { meta } = event;
    const startTime = new Date(meta.startTime).toTimeString().slice(0, 5);
    const endTime = new Date(meta.endTime).toTimeString().slice(0, 5);
    const dialogRef = this.dialog.open(ReservationModalComponent, {
      width: '400px',
      data: {
        id: meta.id,
        title: meta.title,
        courtId: meta.courtId,
        date: this.getLocalDateString(new Date(meta.startTime)),
        startTime,
        endTime,
        team: meta.team,
      }
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.loadReservations();
      }
    });
  }
  deleteEvent(eventToDelete: CalendarEvent): void {
    const eventCoach = eventToDelete.meta?.coachName;
  
    const canDelete =
      this.userRole === 'ADMIN' ||
      (this.userRole === 'COACH' && eventCoach === this.username);
  
    if (!canDelete) {
      this.translate.get('CALENDAR.DELETE_UNAUTHORIZED').subscribe((msg: string) => {
        alert(`❌ ${msg}`);
      });
      return;
    }
  
    const title = eventToDelete.title;
  
    this.translate.get('CALENDAR.DELETE_CONFIRM', { title }).subscribe((confirmMsg: string) => {
      const confirmDelete = confirm(confirmMsg);
      if (!confirmDelete) return;
  
      const id = eventToDelete.meta?.id;
      if (!id) {
        this.translate.get('CALENDAR.DELETE_MISSING_ID').subscribe((msg: string) => {
          alert(`❌ ${msg}`);
        });
        return;
      }
  
      this.reservationService.deleteReservation(id).subscribe({
        next: () => this.loadReservations(),
        error: (err) => {
          this.translate.get('CALENDAR.DELETE_ERROR').subscribe((msg: string) => {
            alert(`❌ ${msg}`);
          });
          console.error(err);
        }
      });
    });
  }
  
  

  dayClicked({ day }: { day: any }): void {
    this.activeDay = day.date;
    this.viewDate = day.date; 
    this.selectedDayEvents = day.events || [];
  }

  setView(view: CalendarView): void {
    this.view = view;
    this.activeDay = this.viewDate; 
    this.refresh.next({});
  }

  goToMonth(month: string): void {
    const index = this.months.indexOf(month);
    const year = this.viewDate.getFullYear();
    this.viewDate = new Date(year, index, 1);
    this.currentMonth = month;
    this.activeDay = this.viewDate; 
    this.activeDay = new Date(year, index, 1);
    this.updateSelectedDayEvents();
    this.refresh.next({});
  }

  next(): void {
    const newDate = new Date(this.viewDate);
    if (this.view === CalendarView.Month) {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + (this.view === CalendarView.Week ? 7 : 1));
    }
    this.viewDate = newDate;
    this.currentMonth = this.months[newDate.getMonth()];
    this.activeDay = this.viewDate; 
    this.refresh.next({});
  }

  prev(): void {
    const newDate = new Date(this.viewDate);
    if (this.view === CalendarView.Month) {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - (this.view === CalendarView.Week ? 7 : 1));
    }
    this.viewDate = newDate;
    this.currentMonth = this.months[newDate.getMonth()];
    this.activeDay = this.viewDate; 
    this.refresh.next({});
  }

  private updateSelectedDayEvents(): void {
    this.selectedDayEvents = this.events.filter(event =>
      new Date(event.start).toDateString() === this.activeDay.toDateString()
    );
  }

  private getLocalDateString(date: Date): string {
    const local = new Date(date);
    local.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return local.toISOString().split('T')[0];
  }

  private parseOffsetToLocal(dateString: string): Date {
    const dt = new Date(dateString);
    return new Date(
      dt.getFullYear(),
      dt.getMonth(),
      dt.getDate(),
      dt.getHours(),
      dt.getMinutes()
    );
  }
  focusEventDay(event: CalendarEvent): void {
    const date = new Date(event.start);
    this.viewDate = date;
    this.activeDay = date;
    this.updateSelectedDayEvents();
    this.refresh.next({});
    this.cdr.detectChanges();
  }
  canDelete(event: CalendarEvent): boolean {
    const currentUserId = Number(localStorage.getItem('userId'));
    const eventOwnerId = event.meta?.userId;
    return this.userRole === 'ADMIN' || (this.userRole === 'COACH' && eventOwnerId === currentUserId);
  }

  
  
  
  
}

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UserPageComponent } from './features/user-page/user-page.component';
import { HomePageComponent } from './home-page/home-page.component';
import { CourtReservationComponent } from './features/court-reservation/court-reservation.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { AthleteListComponent } from './features/athletes/athlete-list/athlete-list.component';
import { AthleteProfileComponent } from './features/athletes/athlete-profile/athlete-profile.component'; 
import { AthleteFormComponent } from './features/athletes/athlete-form/athlete-form.component';
import { AboutComponent } from './features/about/about.component';
import { CoachBoardComponent } from './features/coach-board/coach-board.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReservationModalComponent } from './reservation-modal/reservation-modal.component';
import { AddReservationDialogComponent } from './features/court-reservation/add-reservation-dialog/add-reservation-dialog.component';
import { NgChartsModule } from 'ng2-charts';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthInterceptor } from './services/auth.interceptor';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { AuthComponent } from './features/auth/auth.component';
import { AuthRoutingModule } from './features/auth/auth-routing.module';
import { MatSelectModule } from '@angular/material/select';
import { ScoreTableComponent } from './features/score-table/score-table.component';
import { MatTableModule } from '@angular/material/table';
import { NotificationsComponent } from './features/notifications/notifications.component';
import { AddNotificationComponent } from './features/add-notification/add-notification.component';
import { NotificationFormComponent } from './features/notifications/notification-form/notification-form.component';
import { MyAccountComponent } from './features/my-account/my-account.component';
import { MatIconModule } from '@angular/material/icon';
import { HttpClientModule, HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { ManageUsersComponent } from './features/admin-pannel/manage-users/manage-users.component';
import { RegisterComponent } from './features/admin-pannel/register/register.component';
import { LanguageSwitcherComponent } from './language-switcher/language-switcher.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { LocaleService } from './services/locale.service';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import { enUS, ro as roLocale } from 'date-fns/locale';
import localeEn from '@angular/common/locales/en';
import localeRo from '@angular/common/locales/ro';
registerLocaleData(localeEn, 'en');
registerLocaleData(localeRo, 'ro');



export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    UserPageComponent,
    HomePageComponent,
    CourtReservationComponent,
    AthleteListComponent,
    AthleteProfileComponent, 
    AthleteFormComponent,
    AboutComponent,
    ReservationModalComponent,
    AddReservationDialogComponent,
    AuthComponent,
    CoachBoardComponent,
    ScoreTableComponent,
    NotificationsComponent,
    AddNotificationComponent,
    NotificationFormComponent,
    MyAccountComponent,
    ManageUsersComponent,
    RegisterComponent,
    LanguageSwitcherComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
      deps: []
    }),    
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    NgChartsModule,
    AuthRoutingModule,
    HttpClientModule,
    MatSnackBarModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatTableModule,
    MatSelectModule,
    MatIconModule,

    TranslateModule.forRoot({
      defaultLanguage: 'ro',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },  {
      provide: LOCALE_ID,
      deps: [LocaleService],
      useFactory: (localeService: LocaleService) => localeService.getCurrentLocale()
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { CourtReservationComponent } from './features/court-reservation/court-reservation.component';
import { UserPageComponent } from './features/user-page/user-page.component';
import { CoachBoardComponent } from './features/coach-board/coach-board.component';
import { AboutComponent } from './features/about/about.component';
import { AthleteProfileComponent } from './features/athletes/athlete-profile/athlete-profile.component';
import { AthleteListComponent } from './features/athletes/athlete-list/athlete-list.component';
import { AuthComponent } from './features/auth/auth.component';
import { ScoreTableComponent } from './features/score-table/score-table.component';
import { NotificationsComponent } from './features/notifications/notifications.component';
import { MyAccountComponent } from './features/my-account/my-account.component';
import { RoleGuard } from './services/role.guard';
import { AdminGuard } from './features/admin-pannel/admin.guard';
import { ManageUsersComponent } from './features/admin-pannel/manage-users/manage-users.component';
import { RegisterComponent } from './features/admin-pannel/register/register.component';
import { AthleteResolver } from './services/athlete.resolver';
import { RoleResolver }    from './services/role.resolver';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomePageComponent },
  { path: 'reservations', component: CourtReservationComponent },
  { path: 'about', component: AboutComponent },
  { path: 'scores', component: ScoreTableComponent },
  { path: 'athletes', component: AthleteListComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'coach-board', component: CoachBoardComponent },
  { path: 'notifications', component: NotificationsComponent },
  { path: 'my-account', component: MyAccountComponent },

{
  path: 'athletes/:id',
  component: AthleteProfileComponent,
  runGuardsAndResolvers: 'paramsOrQueryParamsChange',
  resolve: {
    athlete: AthleteResolver,
    role:    RoleResolver
  }
},

  {
    path: 'admin/manage-users',
    component: ManageUsersComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/register',
    component: RegisterComponent,
    canActivate: [AdminGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}

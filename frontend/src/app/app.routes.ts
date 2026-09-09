import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { PublicInitiativesComponent } from './pages/public-initiatives/public-initiatives.component';
import { CitizenCabinetComponent } from './pages/citizen-cabinet/citizen-cabinet.component';
import { OfficerDashboardComponent } from './pages/officer-dashboard/officer-dashboard.component';
import { PetitionDetailComponent } from './pages/petition-detail/petition-detail.component';
import { authGuard, officerGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'public-initiatives', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'public-initiatives', component: PublicInitiativesComponent },
  { path: 'petition/:id', component: PetitionDetailComponent },
  { path: 'citizen-cabinet', component: CitizenCabinetComponent, canActivate: [authGuard] },
  { path: 'officer-dashboard', component: OfficerDashboardComponent, canActivate: [officerGuard] },
  { path: '**', redirectTo: 'public-initiatives' }
];

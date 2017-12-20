import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MainComponent } from './main-module/main.component';
import { RegisterComponent } from './register/register.component';
import { AuthGuardService } from './auth-guard.service';
import { AuthService } from './auth.service';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    // canActivate: [AuthGuardService],
    pathMatch: 'full'
  },
  {
    path: 'register',
    component: RegisterComponent,
    // canActivate: [AuthGuardService],
    pathMatch: 'full'
  },
  {
    path: '',
    component: MainComponent,
    // canActivate: [AuthGuardService],
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuardService, AuthService]
})
export class AppRoutingModule { }

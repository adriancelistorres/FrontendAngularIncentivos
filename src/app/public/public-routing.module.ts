import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginIncentivosComponent } from './auth/components/login-incentivos/login-incentivos.component';
import { IncentivosComponent } from '../intranet/components/incentivos/incentivos.component';
import { LoginComponent } from './auth/components/login/login.component';

const routes: Routes = [
  { path: 'incentivosLogin', component: LoginIncentivosComponent },
  { path: 'LoginOne', component: LoginComponent },
  { path: '', redirectTo: '/incentivosLogin', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class PublicRoutingModule {}

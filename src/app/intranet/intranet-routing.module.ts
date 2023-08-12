import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IncentivosComponent } from '../intranet/components/incentivos/incentivos.component';
import { GuardianGuard } from '../core/shared/guards/guardian.guard';
import { IncentivosPremiosComponent } from './components/incentivos-premios/incentivos-premios.component';

const routes: Routes = [
  { path: 'incentivos', component: IncentivosComponent ,canActivate :[GuardianGuard]},
  { path: 'incentivosPremios', component: IncentivosPremiosComponent ,canActivate :[GuardianGuard]},
  { path: '', redirectTo: '/incentivosLogin', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class IntranetRoutingModule {}

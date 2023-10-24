import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from '../app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { SharedModule } from '../core/shared/shared.module';
import { IntranetRoutingModule } from './intranet-routing.module';
import { IncentivosComponent } from './components/incentivos/incentivos.component';
import { CommonModule } from '@angular/common';
import { IncentivosPremiosComponent } from './components/incentivos-premios/incentivos-premios.component';



@NgModule({
  declarations: [IncentivosComponent, IncentivosPremiosComponent],
  imports: [IntranetRoutingModule, SharedModule, FormsModule, CommonModule],
  exports: [],
})
export class IntranetModule {}

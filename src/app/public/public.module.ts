import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from '../app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { PublicRoutingModule } from './public-routing.module';
import { SharedModule } from '../core/shared/shared.module';
import { LoginIncentivosComponent } from './auth/components/login-incentivos/login-incentivos.component';

@NgModule({
  declarations: [
    LoginIncentivosComponent,
  ],
  imports: [
    PublicRoutingModule,
    SharedModule
  ],
  exports: [],
})
export class PublicModule {}

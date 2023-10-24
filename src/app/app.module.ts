import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginIncentivosComponent } from './public/auth/components/login-incentivos/login-incentivos.component';
import { IncentivosComponent } from './intranet/components/incentivos/incentivos.component';
import { PublicModule } from './public/public.module';
import { CoreModule } from './core/core.module';
import { IntranetModule } from './intranet/intranet.module';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    PublicModule,
    CoreModule,
    IntranetModule,
    AppRoutingModule,

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

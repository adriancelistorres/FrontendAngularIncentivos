import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-incentivos-navbar',
  templateUrl: './incentivos-navbar.component.html',
  styleUrls: ['./incentivos-navbar.component.css']
})
export class IncentivosNavbarComponent {
  constructor(
    private _router: Router,
  ) {}

  cerrarSesion(): void {
    localStorage.removeItem('token');
    this._router.navigate(['/incentivosLogin']);
  }
}

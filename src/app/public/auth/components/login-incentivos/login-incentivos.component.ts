import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';

import { Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { IncentivosService } from '../../Services/incentivos.service';
import { IIncentivoPago } from 'src/app/core/models/IIncentivosPago';
import { IncentivosDisparadosService } from 'src/app/core/shared/services/incentivos/incentivos-disparador.service';


@Component({
  selector: 'app-login-incentivos',
  templateUrl: './login-incentivos.component.html',
  styleUrls: ['./login-incentivos.component.css']
})
export class LoginIncentivosComponent {
  listIncentivos: IIncentivoPago[] = [];
  usuario: string = ''; // Variable para capturar el usuario
  clave: string = '';   // Variable para capturar la contraseña
  isLoading: boolean = false;


  constructor(
    private _incentivosServices: IncentivosService,
    private _router: Router,
    private toastr: ToastrService,
    private _disparadorDNI:IncentivosDisparadosService
  ) {}

  ngOnInit(): void {
    localStorage.removeItem('token'); // Borra el token al cargar la página del inicio de sesión
  }


  login(event: Event): void {
    event.preventDefault();

    if (!this.usuario || !this.clave) {
      return;
    }
    this.isLoading = true; // Activar el spinner

    this._incentivosServices.login(this.usuario, this.clave).subscribe(
      () => {
        // Redirigir al componente de incentivos con el dni en los queryParams
        this._router.navigate(['/incentivos']);
        this._disparadorDNI.disparadorDNI.emit({data:this.usuario});
      },
      error => {
        console.error('Error al iniciar sesión:', error);

        if (error && error.error === "Usuario no encontrado o datos inválidos.") {
          Swal.fire({
            icon: 'error',
            title: 'Error de inicio de sesión',
            text: 'Usuario no encontrado o datos inválidos.'
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error de inicio de sesión',
            text: 'Hubo un error al iniciar sesión. Por favor, intenta nuevamente.'
          });
        }
      }
    ).add(() => this.isLoading = false); // Desactivar el spinner
  }

  onlyNumbers(event: KeyboardEvent): void {
    const keyCode = event.keyCode;
    if ((keyCode < 48 || keyCode > 57) && keyCode !== 46) {
      event.preventDefault();
    }
   }


}

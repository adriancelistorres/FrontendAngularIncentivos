import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { IIncentivoVista } from 'src/app/core/models/IIncentivoVista';
import { IncentivosDisparadosService } from 'src/app/core/shared/services/incentivos/incentivos-disparador.service';
import { TokenInterceptorService } from 'src/app/core/shared/token/token-interceptor.service';
import { IncentivosService } from 'src/app/public/auth/Services/incentivos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-incentivos-premios',
  templateUrl: './incentivos-premios.component.html',
  styleUrls: ['./incentivos-premios.component.css'],
})
export class IncentivosPremiosComponent {
  dni: string = '';
  listIncentivos: IIncentivoVista[] = [];

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _incentivosServices: IncentivosService,
    private toastr: ToastrService,
    private _router: Router,
    private _tokenservice: TokenInterceptorService,
    private _disparadorDNI: IncentivosDisparadosService
  ) {}

  ngOnInit(): void {
    this._disparadorDNI.disparadorDNI.subscribe((data) => {
      console.log('dataaa', data);
      const dataAsString = data.data;
      console.log('dataAsString', dataAsString);
      this.dni = dataAsString;
    });
    this.checkTokenExpiration();

    console.log('tokken', this._tokenservice.interceptor());
    console.log('tokken', this._tokenservice.interceptor());
    this.getIncentivos();
    // this.calculateTotals(); // Llama a la función para calcular los totales
  }
  getIncentivos(): void {
    // this.calcularTiposIncentivos();
    console.log('Dtas', this.dni);
    this._incentivosServices.getIncentivosPremios(this.dni).subscribe(
      (data: IIncentivoVista[]) => {
        if (data.length === 0) {
          this.toastr.warning(
            'No se encontraron premios actuales su nombre.',
            'SIN INCENTIVOS'
          );
          // this._router.navigate(['/incentivosLogin']);
        } else {
          this.listIncentivos = data; // Establece la lista filtrada inicialmente
          console.log('listIncentivos', this.listIncentivos);
        
        }
      },
      (error) => {
        console.error(error);
        if (error.status === 400 && error.error && error.error.errors) {
          console.log('Errores de validación:', error.error.errors);
        } else {
          console.log('Error:', error.message);
        }
      }
    );
  }


  onAceptar(incentivo: IIncentivoVista): void {
    Swal.fire({
      title: '¿Estas seguro de confirmar la entrega?',
      text: 'Al aceptar estas confirmando que se te fue entregado el premio de tus incentivos y asumes la total responsabilidad',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, aceptar bajo mi responsabilidad',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this._incentivosServices
          .UpdateIncentivoswithDNI(incentivo.dniPromotor, incentivo.id)
          .subscribe(
            () => {
              incentivo.aceptado = true; // Establecer el incentivo como aceptado
              Swal.fire({
                title: '¡Aceptado!',
                text: 'Has aceptado el incentivo bajo tu responsabilidad.',
                icon: 'success',
                timer: 2000,
                timerProgressBar: true,
              });
              this.updateIncentivosList();
            },
            (error) => {
              console.error(error);
              Swal.fire({
                title: 'Error',
                text: 'Hubo un error al aceptar el incentivo. Por favor, intenta nuevamente.',
                icon: 'error',
                timer: 2000,
                timerProgressBar: true,
              });
            }
          );
      }
    });
  }

  // Método para actualizar la lista de incentivos después de aceptar
  updateIncentivosList(): void {
    this._incentivosServices.getIncentivosPremios(this.dni).subscribe(
      (data: IIncentivoVista[]) => {
        if (data.length === 0) {
          // Si la lista está vacía, mostrar mensaje y redirigir al login de incentivos
          this.toastr.warning(
            'Ya no tienes premios cargados.',
            'SIN INCENTIVOS'
          );
          // this._router.navigate(['/incentivosLogin']);
        } else {
          this.listIncentivos = data; // Update the filtered list as well

         
        }
      },

      (error) => {
        console.error(error);
        if (error.status === 400 && error.error && error.error.errors) {
          console.log('Errores de validación:', error.error.errors);
        } else {
          console.log('Error:', error.message);
        }
      }
    );
  }
  // checkTokenExpiration(): void {
  //   //const token = this.cookieService.get('token'); // Obtener el token del cookie
  //   const token = localStorage.getItem('token'); // Obtener el token del localStorage

  //   if (!token) {
  //     // No hay token, redirigir a la página de inicio de sesión
  //     this._router.navigate(['/incentivosLogin']);
  //     return;
  //   }

  //   // Obtener la fecha de expiración del token del payload (si está presente)
  //   const tokenParts = token.split('.');
  //   if (tokenParts.length === 3) {
  //     const payload = JSON.parse(atob(tokenParts[1]));
  //     // console.log('PAYLOAD HOUR', payload);
  //     const expirationTime = payload.exp * 1000; // Multiplica por 1000 para convertir a milisegundos

  //     // Calcular el tiempo restante hasta la expiración del token
  //     const now = new Date().getTime();
  //     const timeRemaining = expirationTime - now;

  //     if (timeRemaining <= 0) {
  //       // Token expirado, redirigir a la página de inicio de sesión y borrar la cookie
  //       localStorage.removeItem('token');
  //       this._router.navigate(['/incentivosLogin']);
  //       return;
  //     }

  //     // Programar un redireccionamiento al tiempo de expiración del token
  //     setTimeout(() => {
  //       const token = localStorage.getItem('token');
  //       if (token) {
  //         // Token expirado, borrar el token y mostrar la alerta de sesión expirada
  //         localStorage.removeItem('token');
  //         this.showSessionExpiredAlert();
  //         this._router.navigate(['/incentivosLogin']);
  //       }
  //     }, timeRemaining);
  //   }
  // }
  checkTokenExpiration(): void {
    const token = localStorage.getItem('token'); // Obtener el token del localStorage
  
    if (!token) {
      // No hay token, redirigir a la página de inicio de sesión
      this._router.navigate(['/incentivosLogin']);
      return;
    }
  
    // Obtener la fecha de expiración del token del payload (si está presente)
    const tokenParts = token.split('.');
    if (tokenParts.length === 3) {
      const payload = JSON.parse(atob(tokenParts[1]));
      const expirationTime = payload.exp * 1000;
  
      // Calcular el tiempo restante hasta la expiración del token
      const now = new Date().getTime();
      const timeRemaining = expirationTime - now;
  
      if (timeRemaining <= 0) {
        // Token expirado, redirigir a la página de inicio de sesión y borrar el token
        localStorage.removeItem('token');
        this._router.navigate(['/incentivosLogin']);
        return;
      }
  
      // Programar un redireccionamiento al tiempo de expiración del token
      const timeout = setTimeout(() => {
        const token = localStorage.getItem('token');
        if (token) {
          // Token expirado, borrar el token y mostrar la alerta de sesión expirada
          localStorage.removeItem('token');
          this.showSessionExpiredAlert();
          this._router.navigate(['/incentivosLogin']);
        }
      }, timeRemaining);
  
      // Cancelar el redireccionamiento si el usuario interactúa con la página
      window.addEventListener('beforeunload', () => {
        clearTimeout(timeout);
      });
    }
  }
  showSessionExpiredAlert(): void {
    Swal.fire({
      title: '¡Sesión expirada!',
      text: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
      icon: 'warning',
    }).then((result) => {
      // Redirigir al usuario a la página de inicio de sesión
      this._router.navigate(['/incentivosLogin']);
    });
  }

}

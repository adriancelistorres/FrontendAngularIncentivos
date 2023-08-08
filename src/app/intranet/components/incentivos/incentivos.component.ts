import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IIncentivoVista } from 'src/app/core/models/IIncentivoVista';
import { IncentivosService } from 'src/app/public/auth/Services/incentivos.service';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { TokenInterceptorService } from 'src/app/core/shared/token/token-interceptor.service';
import { IncentivosDisparadosService } from 'src/app/core/shared/services/incentivos/incentivos-disparador.service';
import { Observable, Subject, tap } from 'rxjs';

@Component({
  selector: 'app-incentivos',
  templateUrl:'./incentivos.component.html',
  styleUrls: ['./incentivos.component.css']
})
export class IncentivosComponent implements OnInit {
  dni: string = '';
  listIncentivos: IIncentivoVista[] = [];
  searchTerm: string = ''; // Variable para almacenar el término de búsqueda
  selectedPeriodo: any = ''; // Valor predeterminado seleccionado en el combobox
  periodos: string[] = []; // Variable para almacenar la lista de periodos disponibles
  listIncentivosOriginal: IIncentivoVista[] = []; // Variable para mantener una copia de los incentivos sin filtrar
  token?:string=''; // Variable para almacenar el token
  private tokenExpirationTimer: any; // Variable para almacenar el temporizador


  constructor(
    private _activatedRoute: ActivatedRoute,
    private _incentivosServices: IncentivosService,
    private toastr: ToastrService,
    private _router: Router,
    private _tokenservice: TokenInterceptorService,
    private _disparadorDNI:IncentivosDisparadosService


  ) {}

  ngOnInit(): void {
    this._disparadorDNI.disparadorDNI.subscribe((data) => {
      console.log('dataaa', data);
      const dataAsString = (data.data);
      console.log('dataAsString', dataAsString);
      this.dni = dataAsString;
    });
    this.checkTokenExpiration();

      console.log('tokken',this._tokenservice.interceptor())
      this.getIncentivos();
  }

  getIncentivos(): void {
    console.log('Dtas', this.dni);
    this._incentivosServices.getIncentivosConfirmationFalse(this.dni).subscribe(
      (data: IIncentivoVista[]) => {
        if (data.length === 0) {
          this.toastr.warning('No se encontraron incentivos a su nombre.', 'SIN INCENTIVOS');
          this._router.navigate(['/incentivosLogin']);
        } else {
          this.listIncentivosOriginal = data; // Almacena la lista original sin filtrar
          this.listIncentivos = data; // Establece la lista filtrada inicialmente
          // console.log('DATA', this.listIncentivos);
          // console.log('DATA', data);
          this.periodos = this.extractUniquePeriods(data);

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

  filtrarIncentivos(): void {
    // Si no se ha seleccionado un período (o se ha seleccionado "Todo"), muestra todos los incentivos sin filtrar
    if (!this.selectedPeriodo) {
      this.listIncentivos = this.listIncentivosOriginal;
      return;
    }

    // Filtra los incentivos según el período seleccionado
    this.listIncentivos = this.listIncentivosOriginal.filter((incentivo) => {
      return incentivo.periodoIncentivo === this.selectedPeriodo;
    });
  }
  extractUniquePeriods(incentivos: IIncentivoVista[]): string[] {
    const periodosSet = new Set<string>();
    for (const incentivo of incentivos) {
      periodosSet.add(incentivo.periodoIncentivo);
    }
    // console.log(periodosSet)

    return Array.from(periodosSet);
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
    this._incentivosServices.getIncentivosConfirmationFalse(this.dni).subscribe(
      (data: IIncentivoVista[]) => {
        if (data.length === 0) {
          // Si la lista está vacía, mostrar mensaje y redirigir al login de incentivos
          this.toastr.warning('Ya no tienes incentivos cargados.', 'SIN INCENTIVOS');
          this._router.navigate(['/incentivosLogin']);
        } else {
          // Actualizar la lista de incentivos original sin filtrar
          this.listIncentivosOriginal = data;

          // Aplicar el filtro solo si hay un período seleccionado
          if (this.selectedPeriodo) {
            this.listIncentivos = this.listIncentivosOriginal.filter((incentivo) => {
              return incentivo.periodoIncentivo === this.selectedPeriodo;
            });
          } else {
            // Si no hay un período seleccionado (o se seleccionó "Todo"), mostrar todos los incentivos sin filtrar
            this.listIncentivos = this.listIncentivosOriginal;
          }
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
  checkTokenExpiration(): void {
    //const token = this.cookieService.get('token'); // Obtener el token del cookie
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
      // console.log('PAYLOAD HOUR', payload);
      const expirationTime = payload.exp * 1000; // Multiplica por 1000 para convertir a milisegundos

      // Calcular el tiempo restante hasta la expiración del token
      const now = new Date().getTime();
      const timeRemaining = expirationTime - now;

      if (timeRemaining <= 0) {
        // Token expirado, redirigir a la página de inicio de sesión y borrar la cookie
        localStorage.removeItem('token');
        this._router.navigate(['/incentivosLogin']);
        return;
      }

      // Programar un redireccionamiento al tiempo de expiración del token
      setTimeout(() => {
        const token = localStorage.getItem('token');
        if (token) {
          // Token expirado, borrar el token y mostrar la alerta de sesión expirada
          localStorage.removeItem('token');
          this.showSessionExpiredAlert();
          this._router.navigate(['/incentivosLogin']);
        }
      }, timeRemaining);
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

  cerrarSesion(): void {
    // Borrar la cookie
    //this.cookieService.delete('token');
    localStorage.removeItem('token');
    // Redirigir al login
    this._router.navigate(['/incentivosLogin']);
  }


}

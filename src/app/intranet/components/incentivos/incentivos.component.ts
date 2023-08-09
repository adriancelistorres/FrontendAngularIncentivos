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
  templateUrl: './incentivos.component.html',
  styleUrls: ['./incentivos.component.css'],
})
export class IncentivosComponent implements OnInit {
  dni: string = '';
  listIncentivos: IIncentivoVista[] = [];
  searchTerm: string = ''; // Variable para almacenar el término de búsqueda
  selectedPeriodo: any = ''; // Valor predeterminado seleccionado en el combobox
  periodos: string[] = []; // Variable para almacenar la lista de periodos disponibles
  listIncentivosOriginal: IIncentivoVista[] = []; // Variable para mantener una copia de los incentivos sin filtrar
  token?: string = ''; // Variable para almacenar el token
  private tokenExpirationTimer: any; // Variable para almacenar el temporizador
  tipoTotales: { tipo: string; total: number; cantidad: number }[] = []; // Variable para almacenar los totales por tipo
  cantidadTipos: number = 0; // Variable para almacenar la cantidad de tipos diferentes
  tipos: string[] = []; // Variable para almacenar la lista de tipos de incentivos disponibles
  selectedTipo: any = '';
  empresas: string[] = []; // Variable para almacenar la lista de periodos disponibles
  montoPorEmpresa: { empresa: string; totalMontoEmpresa: number }[] = [];
  totalMontoGeneral: number = 0;


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
    this.getIncentivos();
    // this.calculateTotals(); // Llama a la función para calcular los totales

  }

  getIncentivos(): void {
    // this.calcularTiposIncentivos();

    console.log('Dtas', this.dni);
    this._incentivosServices.getIncentivosConfirmationFalse(this.dni).subscribe(
      (data: IIncentivoVista[]) => {
        if (data.length === 0) {
          this.toastr.warning(
            'No se encontraron incentivos a su nombre.',
            'SIN INCENTIVOS'
          );
          this._router.navigate(['/incentivosLogin']);
        } else {
          this.listIncentivosOriginal = data; // Almacena la lista original sin filtrar
          this.listIncentivos = data; // Establece la lista filtrada inicialmente
          this.periodos = this.extractUniquePeriods(data);
          
          this.empresas=this.extractUniqueEmpesa(data);
          this.calculateTotals()

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
    if (!this.selectedPeriodo) {
      this.listIncentivos = this.listIncentivosOriginal;
      this.selectedTipo = ''; // Reset the selectedTipo filter
      return;
    }
  
    this.selectedTipo = ''; // Reset the selectedTipo filter
    this.listIncentivos = this.listIncentivosOriginal.filter((incentivo) => {
      return incentivo.periodoIncentivo === this.selectedPeriodo;
    });
  }
  
  filtrarIncentivosTipo(): void {
    if (!this.selectedTipo) {
      this.listIncentivos = this.listIncentivosOriginal;
      this.selectedPeriodo = ''; // Reset the selectedPeriodo filter
      return;
    }
  
    this.selectedPeriodo = ''; // Reset the selectedPeriodo filter
    this.listIncentivos = this.listIncentivosOriginal.filter((incentivo) => {
      return incentivo.empresa === this.selectedTipo;
    });
  }
  
  
  extractUniquePeriods(incentivos: IIncentivoVista[]): string[] {
    const periodosSet = new Set<string>();
    for (const incentivo of incentivos) {
      periodosSet.add(incentivo.periodoIncentivo);
    }

    return Array.from(periodosSet);
  }

  
  extractUniqueEmpesa(incentivos: IIncentivoVista[]): string[] {
    const empresaSet = new Set<string>();
    for (const incentivo of incentivos) {
      empresaSet.add(incentivo.empresa);
    }

    return Array.from(empresaSet);
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
              this.calculateTotals()

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
          this.toastr.warning(
            'Ya no tienes incentivos cargados.',
            'SIN INCENTIVOS'
          );
          this._router.navigate(['/incentivosLogin']);
        } else {

          this.listIncentivosOriginal = data;
          this.listIncentivos = data; // Update the filtered list as well

          this.calculateTotals()
          // this.calculateTotals();
        
          // Reapply the filters based on the stored values
          if (this.selectedPeriodo) {
            this.filtrarIncentivos();
          } else if (this.selectedTipo) {
            this.filtrarIncentivosTipo();
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

  calculateTotals(): void {
    const totalMontoGeneral = this.listIncentivosOriginal.reduce((total, incentivo) => {
      return total + incentivo.monto;
    }, 0);
  
    console.log('Lista de incentivos:', this.listIncentivos);
    console.log('Monto General:', totalMontoGeneral);
  
    // Calcular el monto por empresa
    const montoPorEmpresa = this.empresas.map(empresa => {
      const totalMontoEmpresa = this.listIncentivosOriginal
        .filter(incentivo => incentivo.empresa === empresa)
        .reduce((total, incentivo) => {
          return total + incentivo.monto;
        }, 0);
  
      return { empresa, totalMontoEmpresa };
    });
  
    console.log('Monto por Empresa:');
    console.table(montoPorEmpresa);
  
    this.montoPorEmpresa = montoPorEmpresa; // Asignar los montos por empresa calculados
    this.totalMontoGeneral = totalMontoGeneral; // Asignar el monto general calculado

  
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
    
    localStorage.removeItem('token');
    this._router.navigate(['/incentivosLogin']);
  }
  
}

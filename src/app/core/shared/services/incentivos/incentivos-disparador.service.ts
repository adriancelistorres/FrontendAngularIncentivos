import { Injectable,Output,EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class IncentivosDisparadosService {
@Output() disparadorDNI:EventEmitter<any>=new EventEmitter();
}

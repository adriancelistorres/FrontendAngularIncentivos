import {
    HttpEvent,
    HttpHandler,
    HttpHeaders,
    HttpRequest,
  } from '@angular/common/http';
  import { Injectable } from '@angular/core';

  
  @Injectable({
    providedIn: 'root',
  })
  export class TokenInterceptorService {
    constructor() {}

  interceptor() {
    const token:any = localStorage.getItem('token'); // Obtener el token del localStorage
 

    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    };
  }
  
  }
  
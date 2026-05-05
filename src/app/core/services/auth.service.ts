import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(
    this.checkAuthentication()
  );
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private adminPassword = 'admin123'; // Senha do administrador

  constructor() {
    // Garantir que começa sem autenticação
    this.ensureNoAuth();
  }

  login(password: string): boolean {
    if (password === this.adminPassword) {
      localStorage.setItem('adminAuthenticated', 'true');
      this.isAuthenticatedSubject.next(true);
      return true;
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem('adminAuthenticated');
    this.isAuthenticatedSubject.next(false);
  }

  isAuthenticated(): boolean {
    const authenticated = localStorage.getItem('adminAuthenticated') === 'true';
    console.log('Auth check:', authenticated);
    return authenticated;
  }

  private checkAuthentication(): boolean {
    return localStorage.getItem('adminAuthenticated') === 'true';
  }

  private ensureNoAuth(): void {
    // Se não tem autenticação válida, remove qualquer resíduo
    if (localStorage.getItem('adminAuthenticated') !== 'true') {
      localStorage.removeItem('adminAuthenticated');
    }
  }
}

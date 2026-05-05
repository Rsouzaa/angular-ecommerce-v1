import { Injectable } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificação estrita de autenticação
  const isAuthenticated = authService.isAuthenticated();
  
  console.log('Guard check - Trying to access:', state.url);
  console.log('Is authenticated:', isAuthenticated);

  if (isAuthenticated) {
    return true;
  }

  // Não está autenticado - redireciona para login
  console.log('Access denied - Redirecting to admin-login');
  router.navigate(['/admin-login'], { 
    queryParams: { returnUrl: state.url }
  });
  return false;
};

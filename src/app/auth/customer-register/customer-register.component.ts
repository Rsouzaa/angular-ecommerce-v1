import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CustomerAuthService } from '../../core/services/customer-auth.service';

@Component({
  selector: 'app-customer-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './customer-register.component.html',
  styleUrls: ['./customer-register.component.css'],
})
export class CustomerRegisterComponent {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  loading = false;
  message = '';
  messageType: 'error' | 'success' = 'error';

  private authService = inject(CustomerAuthService);
  private router = inject(Router);

  register(): void {
    if (!this.name || !this.email || !this.password || !this.confirmPassword) {
      this.showMessage('Preencha todos os campos', 'error');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.showMessage('As senhas não correspondem', 'error');
      return;
    }

    if (this.password.length < 6) {
      this.showMessage('Senha deve ter pelo menos 6 caracteres', 'error');
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.showMessage('Email inválido', 'error');
      return;
    }

    this.loading = true;
    setTimeout(() => {
      const response = this.authService.register(this.email, this.password, this.name);

      if (response.success) {
        this.showMessage('Cadastro realizado! Redirecionando...', 'success');
        setTimeout(() => {
          this.router.navigate(['/account']);
        }, 1500);
      } else {
        this.showMessage(response.message, 'error');
      }

      this.loading = false;
    }, 500);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private showMessage(msg: string, type: 'error' | 'success'): void {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
    }, 3000);
  }
}

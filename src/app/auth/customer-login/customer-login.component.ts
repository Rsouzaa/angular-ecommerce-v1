import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CustomerAuthService } from '../../core/services/customer-auth.service';

@Component({
  selector: 'app-customer-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './customer-login.component.html',
  styleUrls: ['./customer-login.component.css'],
})
export class CustomerLoginComponent {
  email = '';
  password = '';
  loading = false;
  message = '';
  messageType: 'error' | 'success' = 'error';

  private authService = inject(CustomerAuthService);
  private router = inject(Router);

  login(): void {
    if (!this.email || !this.password) {
      this.showMessage('Preencha email e senha', 'error');
      return;
    }

    this.loading = true;
    setTimeout(() => {
      const response = this.authService.login(this.email, this.password);

      if (response.success) {
        this.showMessage('Login realizado! Redirecionando...', 'success');
        setTimeout(() => {
          this.router.navigate(['/account']);
        }, 1500);
      } else {
        this.showMessage(response.message, 'error');
      }

      this.loading = false;
    }, 500);
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  private showMessage(msg: string, type: 'error' | 'success'): void {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
    }, 3000);
  }
}

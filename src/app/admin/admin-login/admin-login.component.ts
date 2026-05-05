import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css'],
})
export class AdminLoginComponent implements OnInit {
  password = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Garantir que o usuário está deslogado ao chegar na tela de login
    this.authService.logout();
    localStorage.removeItem('adminAuthenticated');
  }

  login(): void {
    if (!this.password.trim()) {
      this.errorMessage = 'Por favor, digite a senha';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    setTimeout(() => {
      if (this.authService.login(this.password)) {
        this.router.navigate(['/admin']);
      } else {
        this.errorMessage = 'Senha incorreta. Tente novamente.';
        this.password = '';
      }
      this.isLoading = false;
    }, 500);
  }

  handleKeypress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.login();
    }
  }
}


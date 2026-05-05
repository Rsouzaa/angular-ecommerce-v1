import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerAuthService } from '../../core/services/customer-auth.service';
import { Customer } from '../../shared/models/customer';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css'],
})
export class AccountComponent implements OnInit {
  customer: Customer | null = null;
  isEditing = false;
  editForm: Partial<Customer> = {};
  message = '';
  messageType: 'error' | 'success' = 'error';

  private authService = inject(CustomerAuthService);
  private router = inject(Router);

  ngOnInit(): void {
    this.authService.customer$.subscribe(customer => {
      if (!customer) {
        this.router.navigate(['/login']);
      } else {
        this.customer = customer;
      }
    });
  }

  startEdit(): void {
    if (this.customer) {
      this.editForm = { ...this.customer };
      this.isEditing = true;
    }
  }

  saveChanges(): void {
    const response = this.authService.updateProfile(this.editForm);
    if (response.success) {
      this.showMessage('Perfil atualizado com sucesso!', 'success');
      this.isEditing = false;
    } else {
      this.showMessage(response.message, 'error');
    }
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.editForm = {};
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  continueShopping(): void {
    this.router.navigate(['/']);
  }

  private showMessage(msg: string, type: 'error' | 'success'): void {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
    }, 3000);
  }
}

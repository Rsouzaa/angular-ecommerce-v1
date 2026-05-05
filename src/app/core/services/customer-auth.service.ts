import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Customer, AuthResponse } from '../../shared/models/customer';

@Injectable({
  providedIn: 'root',
})
export class CustomerAuthService {
  private currentCustomer$ = new BehaviorSubject<Customer | null>(this.getStoredCustomer());
  public customer$ = this.currentCustomer$.asObservable();

  private customers: Customer[] = [];
  private readonly STORAGE_KEY = 'customers';
  private readonly CURRENT_CUSTOMER_KEY = 'current-customer';
  private readonly CUSTOMER_TOKEN_KEY = 'customer-token';

  constructor() {
    this.loadCustomers();
  }

  /**
   * Registra um novo cliente
   */
  register(email: string, password: string, name: string): AuthResponse {
    // Validar se email já existe
    if (this.customers.some(c => c.email === email)) {
      return {
        success: false,
        message: 'Email já cadastrado',
      };
    }

    // Validar dados
    if (!email || !password || !name) {
      return {
        success: false,
        message: 'Preencha todos os campos',
      };
    }

    if (password.length < 6) {
      return {
        success: false,
        message: 'Senha deve ter pelo menos 6 caracteres',
      };
    }

    // Criar novo cliente
    const customer: Customer = {
      id: this.generateCustomerId(),
      email,
      name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Armazenar credencial (em produção seria com bcrypt no backend)
    const customerWithPassword = { ...customer, password: this.hashPassword(password) };
    this.customers.push(customerWithPassword as any);
    this.saveCustomers();

    // Fazer login automático
    this.setCurrentCustomer(customer);
    return {
      success: true,
      message: 'Cadastro realizado com sucesso!',
      customer,
      token: this.generateToken(customer.id),
    };
  }

  /**
   * Faz login do cliente
   */
  login(email: string, password: string): AuthResponse {
    const customer = this.customers.find(c => c.email === email) as any;

    if (!customer) {
      return {
        success: false,
        message: 'Email não encontrado',
      };
    }

    if (!this.checkPassword(password, customer.password)) {
      return {
        success: false,
        message: 'Senha incorreta',
      };
    }

    // remover password do objeto retornado
    const { password: _, ...customerData } = customer;
    this.setCurrentCustomer(customerData);
    return {
      success: true,
      message: 'Login realizado com sucesso!',
      customer: customerData,
      token: this.generateToken(customer.id),
    };
  }

  /**
   * Faz logout do cliente
   */
  logout(): void {
    localStorage.removeItem(this.CURRENT_CUSTOMER_KEY);
    localStorage.removeItem(this.CUSTOMER_TOKEN_KEY);
    this.currentCustomer$.next(null);
  }

  /**
   * Verifica se está autenticado
   */
  isAuthenticated(): boolean {
    return this.getStoredCustomer() !== null;
  }

  /**
   * Retorna o cliente atual
   */
  getCurrentCustomer(): Customer | null {
    return this.currentCustomer$.value;
  }

  /**
   * Atualiza perfil do cliente
   */
  updateProfile(updates: Partial<Customer>): AuthResponse {
    const current = this.getCurrentCustomer();
    if (!current) {
      return {
        success: false,
        message: 'Não autenticado',
      };
    }

    const updated: Customer = {
      ...current,
      ...updates,
      updatedAt: Date.now(),
    };

    // Atualizar na lista
    const index = this.customers.findIndex(c => c.id === current.id);
    if (index !== -1) {
      this.customers[index] = { ...this.customers[index], ...updated };
    }

    this.setCurrentCustomer(updated);
    return {
      success: true,
      message: 'Perfil atualizado',
      customer: updated,
    };
  }

  /**
   * ==================== PRIVATE METHODS ====================
   */

  private getStoredCustomer(): Customer | null {
    const stored = localStorage.getItem(this.CURRENT_CUSTOMER_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  private setCurrentCustomer(customer: Customer): void {
    localStorage.setItem(this.CURRENT_CUSTOMER_KEY, JSON.stringify(customer));
    localStorage.setItem(this.CUSTOMER_TOKEN_KEY, this.generateToken(customer.id));
    this.currentCustomer$.next(customer);
  }

  private loadCustomers(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    this.customers = stored ? JSON.parse(stored) : [];
  }

  private saveCustomers(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.customers));
  }

  private generateCustomerId(): string {
    return 'customer-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  private generateToken(customerId: string): string {
    return 'token-' + btoa(customerId + ':' + Date.now());
  }

  private hashPassword(password: string): string {
    // Nota: Isso é apenas uma hash simples para demo
    // Em produção, use bcrypt no backend
    return btoa(password);
  }

  private checkPassword(password: string, hash: string): boolean {
    return btoa(password) === hash;
  }
}

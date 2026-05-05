import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Order } from '../../shared/models/order';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private orders$ = new BehaviorSubject<Order[]>(this.loadOrdersFromStorage());
  private readonly STORAGE_KEY = 'atelie-orders';

  constructor() {
    this.loadOrdersFromStorage();
  }

  // Salvar novo pedido
  saveOrder(order: Order): void {
    const orders = this.orders$.value;
    orders.push(order);
    this.orders$.next(orders);
    this.saveToStorage();
  }

  // Obter todos os pedidos
  getOrders(): Observable<Order[]> {
    return this.orders$;
  }

  // Obter pedido por ID
  getOrderById(id: string): Order | undefined {
    return this.orders$.value.find(order => order.id === id);
  }

  // Atualizar status do pedido
  updateOrderStatus(orderId: string, status: Order['status'], trackingNumber?: string): void {
    const orders = this.orders$.value;
    const order = orders.find(o => o.id === orderId);
    
    if (order) {
      order.status = status;
      if (trackingNumber) {
        order.trackingNumber = trackingNumber;
      }
      order.updatedAt = new Date();
      this.orders$.next([...orders]);
      this.saveToStorage();
    }
  }

  // Obter pedidos por email do cliente
  getOrdersByEmail(email: string): Order[] {
    return this.orders$.value.filter(order => order.customer.email === email);
  }

  // Deletar pedido
  deleteOrder(orderId: string): void {
    const orders = this.orders$.value.filter(order => order.id !== orderId);
    this.orders$.next(orders);
    this.saveToStorage();
  }

  // Salvar em localStorage
  private saveToStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.orders$.value));
  }

  // Carregar do localStorage
  private loadOrdersFromStorage(): Order[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Erro ao carregar pedidos do localStorage:', error);
      return [];
    }
  }

  // Gerar número do pedido único
  generateOrderNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `PED-${timestamp}-${random}`.padEnd(15, '0');
  }

  // Gerar ID único para o pedido
  generateOrderId(): string {
    return `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

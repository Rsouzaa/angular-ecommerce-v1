import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { InvoiceService } from '../../../core/services/invoice.service';
import { Order } from '../../../shared/models/order';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
})
export class OrdersComponent implements OnInit {
  orderService = inject(OrderService);
  invoiceService = inject(InvoiceService);

  orders: Order[] = [];
  selectedOrder: Order | null = null;
  searchEmail: string = '';
  filterStatus: string = '';

  statusOptions = [
    { value: 'pending', label: 'Pendente' },
    { value: 'processing', label: 'Processando' },
    { value: 'paid', label: 'Pagamento Confirmado' },
    { value: 'sent', label: 'Enviado' },
    { value: 'delivered', label: 'Entregue' },
    { value: 'cancelled', label: 'Cancelado' },
  ];

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.orderService.getOrders().subscribe(orders => {
      this.orders = orders.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    });
  }

  getFilteredOrders(): Order[] {
    return this.orders.filter(order => {
      const emailMatch = !this.searchEmail || 
        order.customer.email.toLowerCase().includes(this.searchEmail.toLowerCase()) ||
        order.customer.fullName.toLowerCase().includes(this.searchEmail.toLowerCase());
      
      const statusMatch = !this.filterStatus || order.status === this.filterStatus;
      
      return emailMatch && statusMatch;
    });
  }

  selectOrder(order: Order): void {
    this.selectedOrder = this.selectedOrder?.id === order.id ? null : order;
  }

  updateStatus(orderId: string, newStatus: string): void {
    this.orderService.updateOrderStatus(orderId, newStatus as Order['status']);
    this.loadOrders();
  }

  updateTrackingNumber(orderId: string, trackingNumber: string): void {
    const order = this.orderService.getOrderById(orderId);
    if (order && trackingNumber.trim()) {
      this.orderService.updateOrderStatus(orderId, order.status, trackingNumber);
      alert('Número de rastreamento atualizado!');
    }
  }

  printInvoice(order: Order): void {
    this.invoiceService.openInvoiceForPrint(order);
  }

  downloadInvoice(order: Order): void {
    this.invoiceService.downloadInvoiceHTML(order);
  }

  deleteOrder(orderId: string): void {
    if (confirm('Tem certeza que deseja deletar este pedido?')) {
      this.orderService.deleteOrder(orderId);
      this.loadOrders();
      this.selectedOrder = null;
      alert('Pedido deletado!');
    }
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'processing': 'bg-blue-100 text-blue-800',
      'paid': 'bg-green-100 text-green-800',
      'sent': 'bg-indigo-100 text-indigo-800',
      'delivered': 'bg-emerald-100 text-emerald-800',
      'cancelled': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'Pendente',
      'processing': 'Processando',
      'paid': 'Pagamento Confirmado',
      'sent': 'Enviado',
      'delivered': 'Entregue',
      'cancelled': 'Cancelado',
    };
    return labels[status] || status;
  }

  getOrderTotal(order: Order): number {
    return order.total;
  }

  getTotalOrders(): number {
    return this.getFilteredOrders().length;
  }

  getPendingCount(): number {
    return this.getFilteredOrders().filter(o => o.status === 'pending').length;
  }

  getTotalRevenue(): number {
    return this.getFilteredOrders().reduce((sum, order) => sum + (order.status !== 'cancelled' ? order.total : 0), 0);
  }
}

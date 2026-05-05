import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaymentDto } from '../../shared/models/payment';

export interface PaymentRequest {
  customerInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    number: string;
    complement: string;
    city: string;
    state: string;
    zipCode: string;
  };
  paymentMethod: 'credit-card' | 'pix' | 'boleto';
  cardInfo?: {
    cardName: string;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
  };
  amount: number;
  cartItems: any[];
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  orderId?: string;
  paymentStatus?: string;
  pixKey?: string;
  boletoCode?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5000/api';

  processPayment(paymentData: PaymentRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.baseUrl}/payments/process`, paymentData);
  }

  getPaymentStatus(orderId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/payments/${orderId}`);
  }

  getOrders(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/orders`);
  }

  getOrder(orderId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/orders/${orderId}`);
  }

  getStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/stats`);
  }

  checkServerHealth(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/health`);
  }

  checkout(paymentDto: PaymentDto): Observable<{ checkoutUrl: string }> {
    return this.http.post<{ checkoutUrl: string }>(
      `${this.baseUrl}/checkout`,
      paymentDto
    );
  }
}

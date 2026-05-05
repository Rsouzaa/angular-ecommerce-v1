import { CartProduct } from './cart-product';

export interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  number: string;
  complement?: string;
  city: string;
  state: string;
  zipCode: string;
  cpf: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  customer: CustomerInfo;
  items: CartProduct[];
  subtotal: number;
  discount: number;
  discountPercent: number;
  total: number;
  paymentMethod: string;
  installments: number;
  status: 'pending' | 'processing' | 'paid' | 'sent' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

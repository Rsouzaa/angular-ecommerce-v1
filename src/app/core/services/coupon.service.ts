import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Coupon {
  code: string;
  discount: number; // percentual (0-100)
  description: string;
  isActive: boolean;
  firstBuy?: boolean; // se é só para primeira compra
}

@Injectable({
  providedIn: 'root'
})
export class CouponService {
  private coupons: Coupon[] = [
    {
      code: 'PRIMEIRACOMPRA',
      discount: 10,
      description: '10% de desconto na primeira compra',
      isActive: true,
      firstBuy: true,
    },
    {
      code: 'BLACKFRIDAY',
      discount: 30,
      description: '30% de desconto em Black Friday',
      isActive: true,
    },
    {
      code: 'CROCHE10',
      discount: 15,
      description: '15% de desconto para clientes VIP',
      isActive: true,
    },
    {
      code: 'WELCOME5',
      discount: 5,
      description: 'Bem-vindo! 5% de desconto',
      isActive: true,
    }
  ];

  private activeCoupon = new BehaviorSubject<Coupon | null>(null);
  public activeCoupon$ = this.activeCoupon.asObservable();

  constructor() {}

  // Validar e aplicar cupom
  validateCoupon(code: string, isFirstBuy: boolean = false): { valid: boolean; discount: number; message: string } {
    const coupon = this.coupons.find(c => c.code.toUpperCase() === code.toUpperCase());

    if (!coupon) {
      return { valid: false, discount: 0, message: 'Cupom não encontrado' };
    }

    if (!coupon.isActive) {
      return { valid: false, discount: 0, message: 'Cupom expirado' };
    }

    if (coupon.firstBuy && !isFirstBuy) {
      return { valid: false, discount: 0, message: 'Cupom válido apenas para primeira compra' };
    }

    this.activeCoupon.next(coupon);
    return { 
      valid: true, 
      discount: coupon.discount, 
      message: `Cupom aplicado! Desconto de ${coupon.discount}%` 
    };
  }

  // Obter cupom ativo
  getActiveCoupon(): Coupon | null {
    return this.activeCoupon.value;
  }

  // Remover cupom ativo
  removeCoupon(): void {
    this.activeCoupon.next(null);
  }

  // Obter lista de cupons (para admin)
  getAllCoupons(): Coupon[] {
    return this.coupons;
  }

  // Adicionar novo cupom
  addCoupon(coupon: Coupon): void {
    if (!this.coupons.find(c => c.code === coupon.code)) {
      this.coupons.push(coupon);
    }
  }

  // Editar cupom
  updateCoupon(code: string, updates: Partial<Coupon>): void {
    const index = this.coupons.findIndex(c => c.code === code);
    if (index !== -1) {
      this.coupons[index] = { ...this.coupons[index], ...updates };
    }
  }

  // Deletar cupom
  deleteCoupon(code: string): void {
    this.coupons = this.coupons.filter(c => c.code !== code);
  }

  // Calcular preço com desconto
  calculateDiscount(amount: number, discountPercent: number): number {
    return amount * (1 - discountPercent / 100);
  }
}

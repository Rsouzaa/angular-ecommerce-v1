import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartProduct } from '../../shared/models/cart-product';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartProducts$ = new BehaviorSubject<CartProduct[]>([]);

  constructor() {
    this.loadCart();
  }

  private loadCart(): void {
    const cart = JSON.parse(localStorage.getItem('cart-products') as string) || [];
    this.cartProducts$.next(cart);
  }

  getCart(): Observable<CartProduct[]> {
    return this.cartProducts$.asObservable();
  }

  updateCart(cart: CartProduct[]): void {
    localStorage.setItem('cart-products', JSON.stringify(cart));
    this.cartProducts$.next(cart);
  }

  getCartCount(): number {
    return this.cartProducts$.value.reduce((acc, item) => acc + item.quantity, 0);
  }
}

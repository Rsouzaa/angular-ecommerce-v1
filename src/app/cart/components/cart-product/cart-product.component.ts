import { Component, input, OnInit, output, inject } from '@angular/core';
import { CartProduct } from '../../../shared/models/cart-product';
import { CurrencyPipe, CommonModule, AsyncPipe } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';
import { FavoritesService } from '../../../core/services/favorites.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-cart-product',
  imports: [CurrencyPipe, CommonModule, AsyncPipe],
  templateUrl: './cart-product.component.html',
})
export class CartProductComponent implements OnInit {
  cartService = inject(CartService);
  favoritesService = inject(FavoritesService);
  cartProduct = input.required<CartProduct>();
  total: number = 0;
  isFavorite$!: Observable<boolean>;

  updateCartEvent = output<void>();

  ngOnInit(): void {
    this.updateTotal();
    this.isFavorite$ = this.favoritesService.getFavorites().pipe(
      map((favorites) =>
        favorites.some((f) => f.id === this.cartProduct().product.id)
      )
    );
  }

  updateQantity(num: number) {
    let result = this.cartProduct().quantity + num;
    const maxQuantity = this.cartProduct().product.quantity;

    // Não deixar aumentar mais que o estoque disponível
    if (result > maxQuantity) {
      result = maxQuantity;
    }

    // Não deixar diminuir menos que 1
    if (result < 1) {
      result = 1;
    }

    this.cartProduct().quantity = result;
    this.updateTotal();
    this.updateCart();
    this.updateCartEvent.emit();
  }

  removeProduct() {
    const cartProducts: CartProduct[] = JSON.parse(
      localStorage.getItem('cart-products') as string
    );
    const filteredCartProducts = cartProducts.filter(
      ({ product }) => product.id !== this.cartProduct().product.id
    );
    this.cartService.updateCart(filteredCartProducts);
    this.updateCartEvent.emit();
  }

  toggleFavorite(): void {
    this.favoritesService.toggleFavorite(this.cartProduct().product);
  }

  private updateTotal() {
    this.total = this.cartProduct().product.price * this.cartProduct().quantity;
  }

  private updateCart() {
    const cartProducts: CartProduct[] = JSON.parse(
      localStorage.getItem('cart-products') as string
    );
    const updatedCartProducts = cartProducts.map((item) =>
      item.product.id === this.cartProduct().product.id ? this.cartProduct() : item
    );
    this.cartService.updateCart(updatedCartProducts);
  }
}

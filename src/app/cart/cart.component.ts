import { Component, OnInit, inject } from '@angular/core';
import { CartProductComponent } from './components/cart-product/cart-product.component';
import { CurrencyPipe } from '@angular/common';
import { CartProduct } from '../shared/models/cart-product';
import { RouterLink } from '@angular/router';
import { CartService } from '../core/services/cart.service';

@Component({
  selector: 'app-cart',
  imports: [CartProductComponent, CurrencyPipe, RouterLink],
  templateUrl: './cart.component.html',
})
export class CartComponent implements OnInit {
  cartService = inject(CartService);
  cartProducts: CartProduct[] = [];
  total: number = 0;

  ngOnInit(): void {
    this.updateCart();
  }

  updateCart() {
    this.cartService.getCart().subscribe((cart) => {
      // ✅ VALIDAÇÃO: Remover produtos sem estoque
      const validCart = cart.filter(item => {
        return item.product && item.product.quantity > 0;
      });

      // Se houver produtos sem estoque, remover do carrinho
      if (validCart.length < cart.length) {
        const removedItems = cart.filter(item => !validCart.includes(item));
        const itemNames = removedItems.map(item => item.product.name).join(', ');
        alert(`⚠️ Produtos sem estoque foram removidos do seu carrinho: ${itemNames}`);
        this.cartService.updateCart(validCart);
      }

      this.cartProducts = validCart;
      if (this.cartProducts.length > 0) {
        this.total = this.cartProducts.reduce(
          (acc, val) => acc + val.product.price * val.quantity,
          0
        );
      } else {
        this.total = 0;
      }
    });
  }
}

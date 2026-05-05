import { Component, inject, OnInit } from '@angular/core';
import { Product } from '../shared/models/product';
import { AsyncPipe, CommonModule } from '@angular/common';
import { ProductService } from '../core/services/product.service';
import { CartService } from '../core/services/cart.service';
import { FavoritesService } from '../core/services/favorites.service';
import { CartProduct } from '../shared/models/cart-product';
import { Observable } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-product',
  imports: [AsyncPipe, CommonModule],
  templateUrl: './product.component.html',
})
export class ProductComponent implements OnInit {
  productService = inject(ProductService);
  cartService = inject(CartService);
  favoritesService = inject(FavoritesService);
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  product$!: Observable<Product | undefined>;
  isFavorite$!: Observable<boolean>;
  selectedQuantity: number = 1;

  ngOnInit(): void {
    this.product$ = this.activatedRoute.params.pipe(
      switchMap((params) => {
        this.selectedQuantity = 1; // Reset na mudança de produto
        return this.productService.getById(params['id']);
      })
    );
    this.isFavorite$ = this.product$.pipe(
      map((product) => product ? this.favoritesService.isFavorite(product.id) : false)
    );
  }

  addToCart(product: Product) {
    // Validação reforçada: verificar se o produto está sem estoque
    if (!product || product.quantity <= 0) {
      alert('Estamos sem estoque. Entre em contato pelo WhatsApp e solicite essa peça.\nAgradeço a preferência!');
      return;
    }

    // Validação adicional: se selectedQuantity for maior que quantity
    if (this.selectedQuantity > product.quantity) {
      alert('Estamos sem estoque. Entre em contato pelo WhatsApp e solicite essa peça.\nAgradeço a preferência!');
      return;
    }

    const cartProducts: CartProduct[] = [
      ...JSON.parse(localStorage.getItem('cart-products') as string) || [],
    ];

    const matched = cartProducts.find(({ product: p }) => p.id === product.id);

    if (matched) {
      // Verificar se já tem quantidade produzida no carrinho
      const totalQuantity = matched.quantity + this.selectedQuantity;
      if (totalQuantity > product.quantity) {
        // Não permitir adicionar mais (sem estoque)
        alert('Estamos sem estoque. Entre em contato pelo WhatsApp e solicite essa peça.\nAgradeço a preferência!');
        return;
      }
      matched.quantity = totalQuantity;
    } else {
      cartProducts.push({ product, quantity: this.selectedQuantity });
    }
    
    this.cartService.updateCart(cartProducts);
    
    // ✅ Mensagem de sucesso
    alert(`✅ ${product.name} foi adicionado ao carrinho com sucesso!`);
  }

  updateQuantity(delta: number, product: Product | undefined): void {
    if (!product || product.quantity === 0) return;
    
    const newQuantity = Math.max(1, Math.min(this.selectedQuantity + delta, product.quantity));
    
    // Apenas atualizar se o valor realmente mudou
    if (newQuantity !== this.selectedQuantity) {
      this.selectedQuantity = newQuantity;
    }
  }

  toggleFavorite(product: Product | undefined) {
    if (product) {
      this.favoritesService.toggleFavorite(product);
      this.isFavorite$ = this.favoritesService.getFavorites().pipe(
        map((favorites) => favorites.some((f) => f.id === product.id))
      );
    }
  }
}

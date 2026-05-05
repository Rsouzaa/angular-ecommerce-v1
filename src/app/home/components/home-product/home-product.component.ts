import { Component, input, inject, OnInit } from '@angular/core';
import { Product } from '../../../shared/models/product';
import { CurrencyPipe, CommonModule, AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FavoritesService } from '../../../core/services/favorites.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-home-product',
  imports: [CurrencyPipe, RouterLink, CommonModule, AsyncPipe],
  templateUrl: './home-product.component.html',
})
export class HomeProductComponent implements OnInit {
  product = input.required<Product>();
  favoritesService = inject(FavoritesService);
  isFavorite$!: Observable<boolean>;

  ngOnInit(): void {
    this.isFavorite$ = this.favoritesService.getFavorites().pipe(
      map((favorites) =>
        favorites.some((f) => f.id === this.product().id)
      )
    );
  }

  toggleFavorite(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.favoritesService.toggleFavorite(this.product());
  }
}

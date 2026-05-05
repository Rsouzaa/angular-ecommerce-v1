import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FavoritesService } from '../core/services/favorites.service';
import { Observable } from 'rxjs';
import { Product } from '../shared/models/product';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-favorites',
  imports: [CommonModule, RouterLink, CurrencyPipe],
  templateUrl: './favorites.component.html',
})
export class FavoritesComponent implements OnInit {
  favoritesService = inject(FavoritesService);
  favorites$!: Observable<Product[]>;

  ngOnInit(): void {
    this.favorites$ = this.favoritesService.getFavorites();
  }

  removeFavorite(productId: string): void {
    this.favoritesService.removeFavorite(productId);
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../../shared/models/product';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private favorites$ = new BehaviorSubject<Product[]>([]);

  constructor() {
    this.loadFavorites();
  }

  private loadFavorites(): void {
    const favorites = JSON.parse(localStorage.getItem('favorites') as string) || [];
    this.favorites$.next(favorites);
  }

  getFavorites(): Observable<Product[]> {
    return this.favorites$.asObservable();
  }

  addFavorite(product: Product): void {
    const current = this.favorites$.value;
    if (!current.find((p) => p.id === product.id)) {
      const updated = [...current, product];
      localStorage.setItem('favorites', JSON.stringify(updated));
      this.favorites$.next(updated);
    }
  }

  removeFavorite(productId: string): void {
    const current = this.favorites$.value;
    const updated = current.filter((p) => p.id !== productId);
    localStorage.setItem('favorites', JSON.stringify(updated));
    this.favorites$.next(updated);
  }

  isFavorite(productId: string): boolean {
    return this.favorites$.value.some((p) => p.id === productId);
  }

  toggleFavorite(product: Product): void {
    if (this.isFavorite(product.id)) {
      this.removeFavorite(product.id);
    } else {
      this.addFavorite(product);
    }
  }
}

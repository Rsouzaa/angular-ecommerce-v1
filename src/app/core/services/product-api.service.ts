import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Product } from '../../shared/models/product';
import { PRODUCTS } from '../../mock/products';

@Injectable({
  providedIn: 'root',
})
export class ProductApiService {

  getProducts(): Observable<Product[]> {
    // Verificar se existe dados ordenados do admin
    const storedProducts = localStorage.getItem('admin-products');
    if (storedProducts) {
      try {
        const products = JSON.parse(storedProducts);
        return of(products as Product[]);
      } catch {
        return of(PRODUCTS as Product[]);
      }
    }
    return of(PRODUCTS as Product[]);
  }

  getProduct(id: string): Observable<Product | undefined> {
    // Usar os mesmos dados priorizado do admin
    const storedProducts = localStorage.getItem('admin-products');
    let products: Product[] = PRODUCTS as Product[];
    
    if (storedProducts) {
      try {
        products = JSON.parse(storedProducts) as Product[];
      } catch {
        products = PRODUCTS as Product[];
      }
    }
    
    const product = products.find(p => p.id === id);
    return of(product);
  }
}

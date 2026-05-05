import { Injectable, inject, NgZone, ChangeDetectorRef } from '@angular/core';
import { Product } from '../../shared/models/product';
import { BehaviorSubject, Observable, map, of, tap, Subject } from 'rxjs';
import { ProductApiService } from './product-api.service';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private productApiService = inject(ProductApiService);
  private ngZone = inject(NgZone);

  private productsCache: Product[] = [];
  private productsSubject = new BehaviorSubject<Product[]>([]);
  products$ = this.productsSubject.asObservable();
  
  private productsUpdated = new Subject<Product[]>();

  constructor() {
    // Sincronizar mudanças entre abas/janelas e dentro da mesma aba
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('storage', (event) => {
        if (event.key === 'admin-products') {
          this.ngZone.run(() => {
            this.refreshAndNotify();
          });
        }
      });
    });
    
    // Inicializar dados
    this.loadProducts().subscribe();
  }

  getAll(): Observable<Product[]> {
    // Sempre carrega os dados frescos do localStorage/API
    return this.productApiService.getProducts().pipe(
      tap((products: Product[]) => {
        this.productsCache = products;
        this.productsSubject.next(products);
        this.productsUpdated.next(products);
      })
    );
  }

  getAllCached$(): Observable<Product[]> {
    // Para componentes que querem atualização reactiva
    return this.products$;
  }

  private loadProducts(): Observable<Product[]> {
    return this.productApiService.getProducts().pipe(
      tap((products: Product[]) => {
        this.productsCache = products;
        this.productsSubject.next(products);
        this.productsUpdated.next(products);
      })
    );
  }

  refreshAndNotify(): void {
    this.productsCache = [];
    this.loadProducts().subscribe();
  }

  refreshProducts(): void {
    this.productsCache = [];
  }

  notifyProductsChanged(): void {
    // Usado pelo admin para notificar que houve mudanças
    this.refreshAndNotify();
  }

  getOffers(): Observable<Product[]> {
    const numberOfOffers = 5;
    return this.getAll().pipe(
      map((products) => products.slice(0, numberOfOffers))
    );
  }

  getById(id: string): Observable<Product | undefined> {
    // Sempre busca os dados mais frescos
    return this.getAll().pipe(
      map(products => products.find(p => p.id === id))
    );
  }
}

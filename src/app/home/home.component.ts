import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { ProductOfferComponent } from '../shared/components/product-offer/product-offer.component';
import { Product } from '../shared/models/product';
import { HomeProductComponent } from './components/home-product/home-product.component';
import { ProductService } from '../core/services/product.service';
import { SearchService } from '../core/services/search.service';
import { AsyncPipe } from '@angular/common';
import { Observable, tap, combineLatest, map } from 'rxjs';
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-home',
  imports: [ProductOfferComponent, HomeProductComponent, AsyncPipe],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  productService = inject(ProductService);
  searchService = inject(SearchService);
  cdr = inject(ChangeDetectorRef);

  products$: Observable<Product[]>;
  productOffers$: Observable<Product[]>;

  private offersLoaded = false;
  private flowbiteInitialized = false;

  constructor() {
    // Usar getAllCached$ que é reativo quando há mudanças
    const allProducts$ = this.productService.getAllCached$().pipe(
      tap(() => {
        // Quando produtos mudam, pode precisar fazer algo
      })
    );
    const searchQuery$ = this.searchService.getSearchQuery();

    this.products$ = combineLatest([allProducts$, searchQuery$]).pipe(
      map(([products, query]) => {
        if (!query.trim()) {
          return products;
        }
        const lowerQuery = query.toLowerCase();
        return products.filter(
          (p) =>
            p.name.toLowerCase().includes(lowerQuery) ||
            p.description.toLowerCase().includes(lowerQuery)
        );
      })
    );

    this.productOffers$ = allProducts$.pipe(
      tap((offers) => {
        if (offers && offers.length > 0) {
          this.offersLoaded = true;
          setTimeout(() => this.initializeFlowbite(), 0);
        }
      })
    );
  }

  ngOnInit(): void {
    // Carregar dados iniciais
    this.productService.getAll().subscribe();
  }

  private initializeFlowbite(): void {
    if (!this.flowbiteInitialized) {
      console.log('Initializing Flowbite...');
      initFlowbite();
      this.flowbiteInitialized = true;
      this.cdr.detectChanges();
    }
  }
}

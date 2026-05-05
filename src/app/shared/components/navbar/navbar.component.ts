import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { SearchService } from '../../../core/services/search.service';
import { AuthService } from '../../../core/services/auth.service';
import { CustomerAuthService } from '../../../core/services/customer-auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit {
  cartService = inject(CartService);
  searchService = inject(SearchService);
  authService = inject(AuthService);
  customerAuthService = inject(CustomerAuthService);
  router = inject(Router);
  
  cartCount: number = 0;
  isSearchOpen: boolean = false;
  searchQuery: string = '';
  isAuthenticated$ = this.authService.isAuthenticated$;
  customer$ = this.customerAuthService.customer$;

  ngOnInit(): void {
    this.cartService.getCart().subscribe((cart) => {
      this.cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    });
  }

  toggleSearch(): void {
    this.isSearchOpen = !this.isSearchOpen;
    if (!this.isSearchOpen) {
      this.searchQuery = '';
      this.searchService.clearSearchQuery();
    }
  }

  onSearchInput(): void {
    if (this.searchQuery.trim()) {
      this.searchService.setSearchQuery(this.searchQuery);
    } else {
      this.searchService.clearSearchQuery();
    }
  }

  search(): void {
    if (this.searchQuery.trim()) {
      console.log('Buscando:', this.searchQuery);
      this.searchService.setSearchQuery(this.searchQuery);
    }
  }

  logout(): void {
    this.customerAuthService.logout();
    this.router.navigate(['/']);
  }
}

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PRODUCTS } from '../mock/products';
import { AuthService } from '../core/services/auth.service';
import { ProductService } from '../core/services/product.service';
import { OrderService } from '../core/services/order.service';
import { CurrencyPipe } from '@angular/common';

interface Product {
  id: string;
  name: string;
  description: string;
  urlImg: string;
  reviews: number;
  price: number;
  previousPrice: number | null;
  quantity: number;
  order?: number;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CurrencyPipe],
  templateUrl: './admin.component.html',
})
export class AdminComponent implements OnInit {
  products: Product[] = [];
  showForm = false;
  editingId: string | null = null;
  draggedItem: Product | null = null;
  imagePreview: string | null = null;
  currentPage = 1;
  itemsPerPage = 10;
  
  private authService = inject(AuthService);
  private router = inject(Router);
  private productService = inject(ProductService);
  private orderService = inject(OrderService);
  
  formData: Product = {
    id: '',
    name: '',
    description: '',
    urlImg: '',
    reviews: 0,
    price: 0,
    previousPrice: 0,
    quantity: 0,
  };

  stats = {
    totalProducts: 0,
    totalValue: 0,
    highestPriced: '',
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  };

  get paginatedProducts(): Product[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.products.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.products.length / this.itemsPerPage);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  getMaxProductIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.products.length);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  ngOnInit(): void {
    // Verificar autenticação
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/admin-login']);
      return;
    }
    
    this.loadProducts();
    this.loadOrderStats();
  }

  loadOrderStats(): void {
    this.orderService.getOrders().subscribe(orders => {
      this.stats.totalOrders = orders.length;
      this.stats.totalRevenue = orders.reduce((sum, order) => 
        sum + (order.status !== 'cancelled' ? order.total : 0), 0
      );
      this.stats.pendingOrders = orders.filter(order => 
        order.status === 'pending' || order.status === 'processing'
      ).length;
    });
  }

  goToOrders(): void {
    this.router.navigate(['/admin/orders']);
  }

  loadProducts(): void {
    const stored = localStorage.getItem('admin-products');
    if (stored) {
      this.products = JSON.parse(stored);
    } else {
      const initialProducts = (PRODUCTS as any[]);
      this.products = initialProducts.length > 0 ? initialProducts.map((p: any, index: number) => ({
        ...p,
        order: index,
      })) : [];
    }
    this.sortByOrder();
    this.calculateStats();
  }

  sortByOrder(): void {
    this.products.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  calculateStats(): void {
    this.stats.totalProducts = this.products.length;
    this.stats.totalValue = this.products.reduce((sum, p) => sum + p.price, 0);
    this.stats.highestPriced = this.products.reduce((max, p) => 
      p.price > max.price ? p : max, this.products[0])?.name || '';
  }

  openForm(product?: Product): void {
    if (product) {
      this.editingId = product.id;
      this.formData = { ...product };
      this.imagePreview = product.urlImg;
    } else {
      this.editingId = null;
      this.formData = {
        id: Date.now().toString(),
        name: '',
        description: '',
        urlImg: '',
        reviews: 0,
        price: 0,
        previousPrice: null,
        quantity: 10,
        order: this.products.length,
      };
      this.imagePreview = null;
    }
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.imagePreview = null;
  }

  saveProduct(): void {
    if (!this.formData.name || this.formData.price <= 0) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    if (this.editingId) {
      const index = this.products.findIndex(p => p.id === this.editingId);
      if (index !== -1) {
        this.products[index] = { ...this.formData };
      }
    } else {
      this.products.push({ ...this.formData });
    }

    localStorage.setItem('admin-products', JSON.stringify(this.products));
    this.calculateStats();
    this.closeForm();
    this.productService.notifyProductsChanged(); // Notificar todas as telas
  }

  deleteProduct(id: string): void {
    if (confirm('Tem certeza que deseja deletar este produto?')) {
      this.products = this.products.filter(p => p.id !== id);
      // Recalcular ordem
      this.products.forEach((p, index) => p.order = index);
      localStorage.setItem('admin-products', JSON.stringify(this.products));
      this.calculateStats();
      this.productService.notifyProductsChanged(); // Notificar todas as telas
    }
  }

  moveUp(id: string): void {
    const index = this.products.findIndex(p => p.id === id);
    if (index > 0) {
      // Trocar posições no array
      const temp = this.products[index - 1];
      this.products[index - 1] = this.products[index];
      this.products[index] = temp;
      
      // Atualizar order de ambos
      this.products[index - 1].order = index - 1;
      this.products[index].order = index;
      
      localStorage.setItem('admin-products', JSON.stringify(this.products));
      this.productService.notifyProductsChanged(); // Notificar todas as telas
    }
  }

  moveDown(id: string): void {
    const index = this.products.findIndex(p => p.id === id);
    if (index < this.products.length - 1) {
      // Trocar posições no array
      const temp = this.products[index + 1];
      this.products[index + 1] = this.products[index];
      this.products[index] = temp;
      
      // Atualizar order de ambos
      this.products[index].order = index;
      this.products[index + 1].order = index + 1;
      
      localStorage.setItem('admin-products', JSON.stringify(this.products));
      this.productService.notifyProductsChanged(); // Notificar todas as telas
    }
  }

  onDragStart(product: Product): void {
    this.draggedItem = product;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
  }

  onDrop(targetProduct: Product): void {
    if (!this.draggedItem || this.draggedItem.id === targetProduct.id) return;

    const draggedIndex = this.products.findIndex(p => p.id === this.draggedItem!.id);
    const targetIndex = this.products.findIndex(p => p.id === targetProduct.id);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const temp = this.products[draggedIndex];
      this.products[draggedIndex] = this.products[targetIndex];
      this.products[targetIndex] = temp;

      this.products.forEach((p, idx) => p.order = idx);
      localStorage.setItem('admin-products', JSON.stringify(this.products));
    }

    this.draggedItem = null;
  }

  onDragEnd(): void {
    this.draggedItem = null;
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        this.formData.urlImg = base64;
        this.imagePreview = base64;
      };
      reader.readAsDataURL(file);
    }
  }
}

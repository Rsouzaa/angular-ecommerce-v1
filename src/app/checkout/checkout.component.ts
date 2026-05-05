import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../core/services/cart.service';
import { MercadoPagoService } from '../core/services/mercado-pago.service';
import { CouponService } from '../core/services/coupon.service';
import { ProductService } from '../core/services/product.service';
import { OrderService } from '../core/services/order.service';
import { CartProduct } from '../shared/models/cart-product';
import { Order } from '../shared/models/order';
import { CurrencyPipe, AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, FormsModule, CurrencyPipe, AsyncPipe],
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent implements OnInit {
  cartService = inject(CartService);
  mercadoPagoService = inject(MercadoPagoService);
  couponService = inject(CouponService);
  productService = inject(ProductService);
  orderService = inject(OrderService);
  router = inject(Router);
  
  cart$!: Observable<CartProduct[]>;
  selectedPaymentMethod: string = 'credit-card';
  isProcessing: boolean = false;
  orderCompleted: boolean = false;
  errorMessage: string = '';
  pixData: any = null;
  boletoData: any = null;
  
  installments: number = 1;
  installmentsList = [
    { value: 1, label: '1x sem juros' },
    { value: 3, label: '3x sem juros' },
    { value: 6, label: '6x sem juros' },
    { value: 12, label: '12x com juros' },
  ];

  // Formulário de endereço
  customerInfo = {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    number: '',
    complement: '',
    city: '',
    state: '',
    zipCode: '',
    cpf: '',
  };

  // Formulário de pagamento cartão
  cardInfo = {
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  };

  // Informações de validação de cartão
  cardBrand: string = '';
  cardValid: boolean = false;
  
  // Mensagem de sucesso ao copiar
  copyFeedback: string = '';

  // Cupons e descontos
  couponCode: string = '';
  activeCoupon: any = null;
  discountPercent: number = 0;
  couponMessage: string = '';
  couponError: string = '';

  ngOnInit(): void {
    this.cart$ = this.cartService.getCart();
  }

  getCartTotal(cart: CartProduct[]): number {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }

  processPayment(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isProcessing = true;
    this.errorMessage = '';

    this.cart$.subscribe((cartItems) => {
      if (cartItems.length === 0) {
        this.errorMessage = 'Carrinho vazio';
        this.isProcessing = false;
        return;
      }

      // ✅ VALIDAÇÃO CRÍTICA: Verificar se algum produto está sem estoque
      const outOfStockItems = cartItems.filter(item => item.product.quantity <= 0);
      if (outOfStockItems.length > 0) {
        const itemNames = outOfStockItems.map(item => item.product.name).join(', ');
        this.errorMessage = `Os seguintes produtos estão sem estoque e não podem ser comprados: ${itemNames}`;
        this.isProcessing = false;
        
        // Remover items sem estoque do carrinho
        const validItems = cartItems.filter(item => item.product.quantity > 0);
        this.cartService.updateCart(validItems);
        
        alert(`⚠️ Itens removidos do carrinho: ${itemNames}`);
        return;
      }

      const total = this.getCartTotal(cartItems);

      if (this.selectedPaymentMethod === 'credit-card') {
        this.processCardPayment(total, cartItems);
      } else if (this.selectedPaymentMethod === 'pix') {
        this.processPixPayment(total, cartItems);
      } else if (this.selectedPaymentMethod === 'boleto') {
        this.processBoletoPayment(total, cartItems);
      }
    });
  }

  private processCardPayment(amount: number, cartItems: CartProduct[]): void {
    const expiryParts = this.cardInfo.expiryDate.split('/');
    const paymentData = {
      token: `token-${Date.now()}`,
      amount: amount,
      description: `Pagamento Atelié Divina Mix - ${cartItems.length} itens`,
      installments: this.installments,
      payer: {
        name: this.customerInfo.fullName,
        email: this.customerInfo.email,
        phone: parseInt(this.customerInfo.phone.replace(/\D/g, '')) || 0,
        identification: {
          type: 'CPF',
          number: this.customerInfo.cpf,
        },
        address: {
          street_name: this.customerInfo.address,
          street_number: parseInt(this.customerInfo.number) || 0,
          zip_code: this.customerInfo.zipCode,
          city_name: this.customerInfo.city,
          state_name: this.customerInfo.state,
        },
      },
    };

    this.mercadoPagoService.processCardPayment(paymentData).then((response) => {
      this.completePayment(response, 'Cartão de Crédito', cartItems);
    }).catch((error) => {
      this.errorMessage = error.message || 'Erro ao processar pagamento';
      this.isProcessing = false;
    });
  }

  private processPixPayment(amount: number, cartItems: CartProduct[]): void {
    const pixData = this.mercadoPagoService.generatePixQRCode(amount, 'Pagamento da compra');
    this.pixData = {
      ...pixData,
      qrCode: pixData.pixCopyPaste, // Usar a chave Pix como dado para QR Code
    };
    this.isProcessing = false;

    // Simular confirmação após 5 segundos (em produção, seria um webhook)
    setTimeout(() => {
      const response = {
        id: `PIX-${Date.now()}`,
        status: 'pending',
        status_detail: 'awaiting_customer_action',
        transaction_amount: amount,
        payment_method_id: 'pix',
      };
      this.completePayment(response, 'Pix', cartItems);
    }, 5000);
  }

  private processBoletoPayment(amount: number, cartItems: CartProduct[]): void {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3);

    const boletoRawData = this.mercadoPagoService.generateBoletoData(amount, dueDate.toISOString());
    this.boletoData = {
      ...boletoRawData,
      dueDate: dueDate.toISOString(), // Adicionar data de vencimento para o template
    };
    this.isProcessing = false;

    // Simular confirmação após 5 segundos
    setTimeout(() => {
      const response = {
        id: `BOLETO-${Date.now()}`,
        status: 'pending',
        status_detail: 'pending_waiting_transfer',
        transaction_amount: amount,
        payment_method_id: 'boleto',
      };
      this.completePayment(response, 'Boleto Bancário', cartItems);
    }, 5000);
  }

  private completePayment(response: any, method: string, cartItems: CartProduct[]): void {
    this.isProcessing = false;
    this.orderCompleted = true;

    // Decrementar quantidade em estoque para cada item no carrinho
    this.decrementProductQuantity(cartItems);

    // Calcular totais
    const subtotal = cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    const discountAmount = this.activeCoupon ? (subtotal * this.discountPercent) / 100 : 0;
    const total = subtotal - discountAmount;

    // Criar novo pedido com modelo Order
    const newOrder: Order = {
      id: this.orderService.generateOrderId(),
      orderNumber: this.orderService.generateOrderNumber(),
      date: new Date().toISOString(),
      customer: {
        fullName: this.customerInfo.fullName,
        email: this.customerInfo.email,
        phone: this.customerInfo.phone,
        address: this.customerInfo.address,
        number: this.customerInfo.number,
        complement: this.customerInfo.complement,
        city: this.customerInfo.city,
        state: this.customerInfo.state,
        zipCode: this.customerInfo.zipCode,
        cpf: this.customerInfo.cpf,
      },
      items: cartItems,
      subtotal: subtotal,
      discount: discountAmount,
      discountPercent: this.discountPercent,
      total: total,
      paymentMethod: this.selectedPaymentMethod,
      installments: this.installments,
      status: 'processing',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Salvar pedido no OrderService
    this.orderService.saveOrder(newOrder);

    // Salvar dados do pagamento em localStorage (compatibilidade com sistema antigo)
    const order = {
      id: response.id,
      method: method,
      status: response.status,
      amount: response.transaction_amount,
      items: cartItems.length,
      customer: this.customerInfo,
      createdAt: new Date().toISOString(),
      pixData: this.pixData,
      boletoData: this.boletoData,
    };

    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Limpar carrinho
    localStorage.removeItem('cart-products');
    this.cartService.updateCart([]);

    // Redirecionar para página de sucesso após 2 segundos
    setTimeout(() => {
      this.router.navigate(['/PaymentSuccess']);
    }, 2000);
  }

  validateForm(): boolean {
    const requiredFields = ['fullName', 'email', 'phone', 'address', 'number', 'city', 'state', 'zipCode', 'cpf'];
    for (const field of requiredFields) {
      if (!this.customerInfo[field as keyof typeof this.customerInfo]) {
        this.errorMessage = `Por favor, preencha o campo: ${field}`;
        return false;
      }
    }

    if (this.selectedPaymentMethod === 'credit-card') {
      if (!this.cardInfo.cardName || !this.cardInfo.cardNumber || !this.cardInfo.expiryDate || !this.cardInfo.cvv) {
        this.errorMessage = 'Por favor, preencha os dados do cartão';
        return false;
      }

      if (!this.cardValid) {
        this.errorMessage = 'Cartão inválido';
        return false;
      }
    }

    return true;
  }

  formatCardNumber(value: string): string {
    const cleaned = value.replace(/\s/g, '');
    return cleaned.replace(/(\d{4})/g, '$1 ').trim();
  }

  formatExpiryDate(value: string): string {
    return value.replace(/\D/g, '').replace(/(\d{2})(\d{2})/, '$1/$2').slice(0, 5);
  }

  onCardNumberChange(): void {
    this.cardInfo.cardNumber = this.formatCardNumber(this.cardInfo.cardNumber);
    const validation = this.mercadoPagoService.validateCard(this.cardInfo.cardNumber);
    this.cardBrand = validation.brand;
    this.cardValid = validation.valid;
  }

  onExpiryChange(): void {
    this.cardInfo.expiryDate = this.formatExpiryDate(this.cardInfo.expiryDate);
  }

  onCvvChange(): void {
    this.cardInfo.cvv = this.cardInfo.cvv.replace(/\D/g, '').slice(0, 4);
  }

  onCpfChange(): void {
    this.customerInfo.cpf = this.customerInfo.cpf.replace(/\D/g, '');
  }

  copyPixKey(): void {
    if (this.pixData?.pixCopyPaste) {
      navigator.clipboard.writeText(this.pixData.pixCopyPaste).then(() => {
        this.copyFeedback = 'pixKey';
        setTimeout(() => {
          this.copyFeedback = '';
        }, 2000);
      });
    }
  }

  copyBoleto(): void {
    if (this.boletoData?.barcode) {
      navigator.clipboard.writeText(this.boletoData.barcode).then(() => {
        this.copyFeedback = 'boleto';
        setTimeout(() => {
          this.copyFeedback = '';
        }, 2000);
      });
    }
  }

  // Aplicar cupom
  applyCoupon(): void {
    if (!this.couponCode.trim()) {
      this.couponError = 'Digite um código de cupom';
      this.couponMessage = '';
      return;
    }

    const isFirstBuy = !localStorage.getItem('has_purchased');
    const result = this.couponService.validateCoupon(this.couponCode, isFirstBuy);

    if (result.valid) {
      this.activeCoupon = this.couponService.getActiveCoupon();
      this.discountPercent = result.discount;
      this.couponMessage = result.message;
      this.couponError = '';
    } else {
      this.couponError = result.message;
      this.couponMessage = '';
      this.discountPercent = 0;
      this.activeCoupon = null;
    }
  }

  // Remover cupom
  removeCoupon(): void {
    this.couponService.removeCoupon();
    this.activeCoupon = null;
    this.discountPercent = 0;
    this.couponCode = '';
    this.couponMessage = '';
    this.couponError = '';
  }

  // Calcular total com desconto
  getTotalWithDiscount(cart: CartProduct[]): number {
    const total = this.getCartTotal(cart);
    if (this.discountPercent > 0) {
      return this.couponService.calculateDiscount(total, this.discountPercent);
    }
    return total;
  }

  // Calcular valor do desconto
  getDiscountAmount(cart: CartProduct[]): number {
    const total = this.getCartTotal(cart);
    return total - this.getTotalWithDiscount(cart);
  }

  // Decrementar quantidade de produtos em estoque após compra
  private decrementProductQuantity(cartItems: CartProduct[]): void {
    // Obter produtos atuais do localStorage
    const stored = localStorage.getItem('admin-products');
    let products = stored ? JSON.parse(stored) : [];

    // Decrementar quantidade para cada item do carrinho
    cartItems.forEach((cartItem) => {
      const productIndex = products.findIndex((p: any) => p.id === cartItem.product.id);
      if (productIndex !== -1) {
        products[productIndex].quantity -= cartItem.quantity;
        // Não deixar negativo
        if (products[productIndex].quantity < 0) {
          products[productIndex].quantity = 0;
        }
      }
    });

    // Salvar produtos atualizados
    localStorage.setItem('admin-products', JSON.stringify(products));
    
    // Notificar ProductService que produtos mudaram
    this.productService.notifyProductsChanged();
  }
}


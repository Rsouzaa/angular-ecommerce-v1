import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CartComponent } from './cart/cart.component';
import { ProductComponent } from './product/product.component';
import { PaymentSuccessComponent } from './payment/payment-success/payment-success.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { AdminComponent } from './admin/admin.component';
import { AdminLoginComponent } from './admin/admin-login/admin-login.component';
import { OrdersComponent } from './admin/pages/orders/orders.component';
import { adminGuard } from './core/guards/admin.guard';
import { CustomerLoginComponent } from './auth/customer-login/customer-login.component';
import { CustomerRegisterComponent } from './auth/customer-register/customer-register.component';
import { AccountComponent } from './auth/account/account.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'cart',
    component: CartComponent,
  },
  {
    path: 'checkout',
    component: CheckoutComponent,
  },
  {
    path: 'favorites',
    component: FavoritesComponent,
  },
  {
    path: 'products/:id',
    component: ProductComponent,
  },
  {
    path: 'PaymentSuccess',
    component: PaymentSuccessComponent,
  },
  {
    path: 'login',
    component: CustomerLoginComponent,
  },
  {
    path: 'register',
    component: CustomerRegisterComponent,
  },
  {
    path: 'account',
    component: AccountComponent,
  },
  {
    path: 'admin-login',
    component: AdminLoginComponent,
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [adminGuard],
  },
  {
    path: 'admin/orders',
    component: OrdersComponent,
    canActivate: [adminGuard],
  },
];

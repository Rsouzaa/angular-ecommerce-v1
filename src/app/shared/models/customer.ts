export interface Customer {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  createdAt: number;
  updatedAt: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  customer?: Customer;
  token?: string;
}

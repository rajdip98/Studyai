export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle?: string | null;
  description: string;
  images: string[];
  priceInPaise: number;
  mrpInPaise: number;
  stockQuantity: number;
  isBestseller: boolean;
  tags: string[];
  ingredients: string[];
  ratingAverage: number;
  ratingCount: number;
  category?: { id: string; slug: string; name: string } | null;
  // Present on admin responses only.
  sku?: string;
  isActive?: boolean;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  iconUrl?: string | null;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface Cart {
  id: string;
  items: CartItem[];
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPriceInPaise: number;
  nameSnapshot: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotalInPaise: number;
  shippingInPaise: number;
  totalInPaise: number;
  items: OrderItem[];
  createdAt: string;
}

export interface AuthUser {
  id: string;
  role: "CUSTOMER" | "ADMIN" | "SUPPORT";
}

export function formatPaise(paise: number): string {
  return `Rs. ${(paise / 100).toLocaleString("en-IN")}`;
}

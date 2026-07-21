export interface MenuItem {
  id: number;
  category: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

export interface OrderItem {
  menuItemId: number;
  quantity: number;
  price: number;
  name: string;
}

export interface Order {
  id: number;
  orderNumber: number;
  customerName: string;
  phone: string;
  location: string;
  lat: number;
  lng: number;
  items: any[]; // Parsed from JSON string
  extraNotes: string;
  extraFee: number;
  deliveryCharge: number;
  total: number;
  paymentMethod: string;
  status: 'pending' | 'accepted' | 'cancelled' | 'cooking' | 'onway' | 'delivered';
  deliveryGuyNumber: string;
  createdAt: string;
}

export interface Settings {
  perKmRate: string;
  firstKmRate: string;
  shopPhone: string;
  payHereId: string;
  hostLat: string;
  hostLng: string;
  lastOrderNumber: string;
  lastOrderDate: string;
  banners?: string;
  adminPassword?: string;
  hostPassword?: string;
  currentEvent?: string;
}

export interface Feedback {
  id: number;
  customerName: string;
  rating: number;
  comment: string;
  pinned?: boolean | number;
  createdAt: string;
}

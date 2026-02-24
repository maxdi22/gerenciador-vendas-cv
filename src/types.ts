export interface StoreConfig {
  url: string;
  consumer_key: string;
  consumer_secret: string;
  tax_rate: number;
  gateway_fee: number;
  fixed_fee: number;
}

export interface Order {
  id: number;
  number: string;
  status: string;
  date_created: string;
  total: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_cost: number;
  taxes: number;
  gateway_fees: number;
  profit: number;
  items_count: number;
}

export interface Product {
  id: number;
  name: string;
  price: string;
  regular_price: string;
  sale_price: string;
  cost: number;
  images: { src: string }[];
  permalink: string;
}

export interface ProductAnalysis {
  status: "healthy" | "warning" | "critical";
  reason: string;
  recommendation: string;
}

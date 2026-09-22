const API_URL = import.meta.env.VITE_API_URL || "https://laserok-api.onrender.com";
const PASSWORD_KEY = "laserok_admin_password";

export function getPassword(): string {
  return localStorage.getItem(PASSWORD_KEY) || "";
}

export function setPassword(pwd: string): void {
  localStorage.setItem(PASSWORD_KEY, pwd);
}

export function clearPassword(): void {
  localStorage.removeItem(PASSWORD_KEY);
}

export function isAuthenticated(): boolean {
  return !!getPassword();
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Password": getPassword(),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    clearPassword();
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  shortDescription: string;
  description: string;
  category: string;
  price: number;
  oldPrice?: number | null;
  stock: number;
  images: string[];
  attributes: Record<string, string>;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  orderId: string;
  productId: number;
  title: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customer: { name: string; phone: string; comment?: string };
  total: number;
  status: "new" | "processing" | "done";
  createdAt: string;
  items: OrderItem[];
}

export const productsApi = {
  list: () => request<Product[]>("/api/admin/products"),
  get: (id: number) => request<Product>(`/api/admin/products/${id}`),
  create: (data: Partial<Product>) =>
    request<Product>("/api/admin/products", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<Product>) =>
    request<Product>(`/api/admin/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<void>(`/api/admin/products/${id}`, { method: "DELETE" }),
};

export const ordersApi = {
  list: () => request<Order[]>("/api/admin/orders"),
  updateStatus: (id: string, status: Order["status"]) =>
    request<Order>(`/api/admin/orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};

export async function checkPassword(password: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/api/admin/products`, {
      headers: { "X-Admin-Password": password },
    });
    return res.ok;
  } catch {
    return false;
  }
}
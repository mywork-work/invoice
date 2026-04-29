import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5010/api/v1";

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  requiresAuth?: boolean;
};

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, requiresAuth = true } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (requiresAuth) {
    const token = Cookies.get("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || "Something went wrong");
  }

  return data;
}

// Auth endpoints
export const auth = {
  login: (email: string, password: string) =>
    apiRequest<{ token: string; user: { id: number; email: string; role: string } }>(
      "/login",
      { method: "POST", body: { email, password }, requiresAuth: false }
    ),
  register: (email: string, password: string, role?: string) =>
    apiRequest<{ message: string; user: { id: number; email: string; role: string } }>(
      "/register",
      { method: "POST", body: { email, password, role }, requiresAuth: false }
    ),
};

// Business endpoints
export const business = {
  get: () =>
    apiRequest<{ success: boolean; data: Business }>("/businesses"),
  create: (data: CreateBusinessInput) =>
    apiRequest<{ message: string; business: Business }>(
      "/businesses",
      { method: "POST", body: data }
    ),
};

// Product endpoints
export const products = {
  getAll: () =>
    apiRequest<{ success: boolean; count: number; products: Product[] }>("/getProduct"),
  add: (data: CreateProductInput) =>
    apiRequest<{ message: string; product: Product }>(
      "/add",
      { method: "POST", body: data }
    ),
  update: (data: UpdateProductInput) =>
    apiRequest<{ message: string; product: Product }>(
      "/updateProducts",
      { method: "PATCH", body: data }
    ),
  delete: (id: number) =>
    apiRequest<{ message: string }>(
      "/deleteProdcts",
      { method: "DELETE", body: { id } }
    ),
};

// Invoice endpoints
export const invoices = {
  getAll: () =>
    apiRequest<{ success: boolean; count: number; invoices: Invoice[] }>("/invoice"),
  getById: (id: number) =>
    apiRequest<{ success: boolean; invoice: Invoice }>(`/invoice/${id}`),
  create: (data: CreateInvoiceInput) =>
    apiRequest<{ message: string; fbrSent: boolean; invoice: Invoice }>(
      "/invoice",
      { method: "POST", body: data }
    ),
};

// Types
export interface Business {
  id: number;
  userId: number;
  name: string;
  ntn: string;
  address: string;
  province: string;
  fbrToken: string;
  posId?: string;
  isFbrEnabled: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBusinessInput {
  name: string;
  ntn: string;
  address: string;
  province: string;
  fbrToken: string;
  posId?: string;
}

export interface Product {
  id: number;
  userId: number;
  itemName: string;
  hsCode: string;
  taxRate: number;
  uom: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  itemName: string;
  hsCode: string;
  taxRate: number;
  uom: string;
}

export interface UpdateProductInput {
  id: number;
  itemName?: string;
  hsCode?: string;
  taxRate?: number;
  uom?: string;
}

export interface InvoiceItem {
  hsCode: string;
  productDescription: string;
  rate: string;
  uoM: string;
  quantity: number;
  valueSalesExcludingST: number;
  fixedNotifiedValueOrRetailPrice: number;
  salesTaxApplicable: number;
  salesTaxWithheldAtSource: number;
  extraTax: number;
  furtherTax: number;
  fedPayable: number;
  discount: number;
  saleType: string;
  sroScheduleNo: string;
  sroItemSerialNo: string;
}

export interface Invoice {
  id: number;
  userId: number;
  businessId: number;
  invoiceType: string;
  invoiceDate: string;
  sellerNTNCNIC: string;
  sellerBusinessName: string;
  sellerProvince: string;
  sellerAddress: string;
  buyerNTNCNIC: string;
  buyerBusinessName: string;
  buyerProvince: string;
  buyerAddress: string;
  buyerRegistrationType: string;
  invoiceRefNo: string;
  scenarioId: string;
  fbrInvoiceNo?: string;
  qrCode?: string;
  pdfPath?: string;
  totalAmount: number;
  taxAmount: number;
  status: "DRAFT" | "PENDING" | "SUBMITTED" | "APPROVED" | "REJECTED" | "FAILED";
  items: InvoiceItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceInput {
  businessId: number;
  invoiceDate: string;
  buyer: {
    buyerNTNCNIC?: string;
    buyerBusinessName: string;
    buyerProvince: string;
    buyerAddress: string;
    buyerRegistrationType?: string;
  };
  items: {
    productId: number;
    quantity: number;
    price: number;
  }[];
}

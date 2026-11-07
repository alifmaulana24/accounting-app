// Tipe Product yang dikembalikan oleh GET /api/products
export interface Product {
  sku: string;
  name: string;
  category: string;
  brand: string | null;
  unit: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Tipe input untuk form tambah produk (sebelum dikirim ke API)
export interface CreateProductFormData {
  sku: string;
  name: string;
  category: string;
  brand: string;
  unit: string;
}

// Tipe error validasi per-field dari API
export type ProductFieldErrors = Partial<Record<keyof CreateProductFormData, string[]>>;

// Tipe respons API POST /api/products (success)
export interface CreateProductSuccess {
  success: true;
  message: string;
  data: { sku: string };
}

// Tipe respons API POST /api/products (error)
export interface CreateProductError {
  success: false;
  message: string;
  errors?: ProductFieldErrors;
}

export type CreateProductResponse = CreateProductSuccess | CreateProductError;

// Tipe respons API GET /api/products
export interface GetProductsSuccess {
  success: true;
  data: Product[];
}

export interface GetProductsError {
  success: false;
  message: string;
}

export type GetProductsResponse = GetProductsSuccess | GetProductsError;

// Tipe respons API DELETE /api/products/[sku]
export interface DeleteProductResponse {
  success: boolean;
  message: string;
}

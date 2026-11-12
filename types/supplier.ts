export interface Supplier {
  supplierCode: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierFormData {
  supplierCode: string;
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface EditSupplierFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  isActive: boolean;
}

export type SupplierFieldErrors = Partial<
  Record<keyof CreateSupplierFormData, string[]>
>;

export type EditSupplierFieldErrors = Partial<
  Record<keyof EditSupplierFormData, string[]>
>;

// ---------------------------------------------------------------------------
// API Response Types
// ---------------------------------------------------------------------------

export interface GetSuppliersSuccess {
  success: true;
  data: Supplier[];
}

export interface GetSuppliersError {
  success: false;
  message: string;
}

export type GetSuppliersResponse = GetSuppliersSuccess | GetSuppliersError;

export interface GetSupplierSuccess {
  success: true;
  data: Supplier;
}

export interface GetSupplierError {
  success: false;
  message: string;
}

export type GetSupplierResponse = GetSupplierSuccess | GetSupplierError;

export interface CreateSupplierSuccess {
  success: true;
  message: string;
  data: Supplier;
}

export interface CreateSupplierError {
  success: false;
  message: string;
  errors?: SupplierFieldErrors;
}

export type CreateSupplierResponse =
  | CreateSupplierSuccess
  | CreateSupplierError;

export interface UpdateSupplierSuccess {
  success: true;
  message: string;
  data: Supplier;
}

export interface UpdateSupplierError {
  success: false;
  message: string;
  errors?: EditSupplierFieldErrors;
}

export type UpdateSupplierResponse =
  | UpdateSupplierSuccess
  | UpdateSupplierError;

export interface DeleteSupplierResponse {
  success: boolean;
  message: string;
}

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


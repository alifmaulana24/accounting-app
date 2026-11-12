export interface Customer {
  customerCode: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerFormData {
  customerCode: string;
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface EditCustomerFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  isActive: boolean;
}

export type CustomerFieldErrors = Partial<
  Record<keyof CreateCustomerFormData, string[]>
>;

export type EditCustomerFieldErrors = Partial<
  Record<keyof EditCustomerFormData, string[]>
>;

// ---------------------------------------------------------------------------
// API Response Types
// ---------------------------------------------------------------------------

export interface GetCustomersSuccess {
  success: true;
  data: Customer[];
}

export interface GetCustomersError {
  success: false;
  message: string;
}

export type GetCustomersResponse = GetCustomersSuccess | GetCustomersError;

export interface GetCustomerSuccess {
  success: true;
  data: Customer;
}

export interface GetCustomerError {
  success: false;
  message: string;
}

export type GetCustomerResponse = GetCustomerSuccess | GetCustomerError;

export interface CreateCustomerSuccess {
  success: true;
  message: string;
  data: Customer;
}

export interface CreateCustomerError {
  success: false;
  message: string;
  errors?: CustomerFieldErrors;
}

export type CreateCustomerResponse =
  | CreateCustomerSuccess
  | CreateCustomerError;

export interface UpdateCustomerSuccess {
  success: true;
  message: string;
  data: Customer;
}

export interface UpdateCustomerError {
  success: false;
  message: string;
  errors?: EditCustomerFieldErrors;
}

export type UpdateCustomerResponse =
  | UpdateCustomerSuccess
  | UpdateCustomerError;

export interface DeleteCustomerResponse {
  success: boolean;
  message: string;
}


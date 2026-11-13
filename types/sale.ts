export type SalePaymentStatus = "Belum Dibayar" | "Sebagian" | "Lunas";

export type SaleAmount = number | string;

export interface SaleSummary {
  id: string;
  saleNumber: string;
  saleDate: string;
  customerCode: string;
  customerName: string;
  totalAmount: SaleAmount;
  totalPaid: SaleAmount;
  outstandingAmount: SaleAmount;
  paymentStatus: SalePaymentStatus;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productSku: string;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: SaleAmount;
  subtotal: SaleAmount;
}

export interface SalePayment {
  id: string;
  saleId: string;
  paymentDate: string;
  amount: SaleAmount;
  createdAt: string;
}

export interface SaleDetail extends SaleSummary {
  items: SaleItem[];
  payments: SalePayment[];
  createdAt: string;
  updatedAt: string;
}

export interface SaleValidationErrors {
  formErrors?: string[];
  fieldErrors?: Record<string, string[] | undefined>;
}

export interface SaleApiErrorResponse {
  message: string;
  errors?: SaleValidationErrors;
}

export interface GetSalesResponse {
  success: true;
  data: SaleSummary[];
}

export interface GetSaleDetailResponse {
  data: SaleDetail;
}

export interface CreateSaleSuccess {
  success: true;
  message: string;
  data: {
    id: string;
    saleNumber: string;
  };
}

export interface CreateSaleError {
  success: false;
  message: string;
  errors?: SaleValidationErrors;
}

export type CreateSaleResponse = CreateSaleSuccess | CreateSaleError;

export interface CreateSalePaymentResponse {
  message: string;
  data: {
    payment: SalePayment;
    totalPaid: SaleAmount;
    outstandingAmount: SaleAmount;
    paymentStatus: SalePaymentStatus;
  };
}

export interface DeleteSaleResponse {
  message: string;
  data: {
    saleNumber: string;
  };
}

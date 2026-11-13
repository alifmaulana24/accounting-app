export type PurchasePaymentStatus = "Belum Dibayar" | "Sebagian" | "Lunas";

export type PurchaseAmount = number | string;

export interface PurchaseSummary {
  id: string;
  purchaseNumber: string;
  purchaseDate: string;
  supplierCode: string;
  supplierName: string;
  totalAmount: PurchaseAmount;
  totalPaid: PurchaseAmount;
  outstandingAmount: PurchaseAmount;
  paymentStatus: PurchasePaymentStatus;
}

export interface PurchaseItem {
  id: string;
  purchaseId: string;
  productSku: string;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: PurchaseAmount;
  subtotal: PurchaseAmount;
}

export interface PurchasePayment {
  id: string;
  purchaseId: string;
  paymentDate: string;
  amount: PurchaseAmount;
  createdAt: string;
}

export interface PurchaseDetail extends PurchaseSummary {
  items: PurchaseItem[];
  payments: PurchasePayment[];
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[] | undefined>;
}

export interface GetPurchasesResponse {
  success: true;
  data: PurchaseSummary[];
}

export interface GetPurchaseDetailResponse {
  success: true;
  data: PurchaseDetail;
}

export interface CreatePurchaseResponse {
  success: true;
  message: string;
  data: {
    id: string;
    purchaseNumber: string;
  };
}

export interface CreatePurchasePaymentResponse {
  success: true;
  message: string;
  data: {
    payment: PurchasePayment;
    totalPaid: PurchaseAmount;
    outstandingAmount: PurchaseAmount;
    paymentStatus: PurchasePaymentStatus;
  };
}

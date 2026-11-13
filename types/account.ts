// Tipe akun yang dikembalikan oleh API /api/accounts
export type AccountType = "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";
export type NormalBalance = "DEBIT" | "CREDIT";

export interface Account {
  id: string;
  code: string;
  name: string;
  accountType: AccountType;
  normalBalance: NormalBalance;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Bentuk respons API accounts (mengikuti respons aktual backend)
// ---------------------------------------------------------------------------

// Respons error generik: { error: string }
export interface ApiErrorResponse {
  error: string;
}

// Respons GET /api/accounts (success): { data: Account[] }
export interface GetAccountsSuccess {
  data: Account[];
}

export type GetAccountsResponse = GetAccountsSuccess | ApiErrorResponse;

// Respons 400 validasi Zod: { error, details: flatten() }
export interface AccountValidationDetails {
  formErrors: string[];
  fieldErrors: Partial<Record<string, string[]>>;
}

export interface AccountValidationErrorResponse {
  error: string;
  details?: AccountValidationDetails;
}

// Respons POST/PATCH success: { message, data }
export interface AccountMutationSuccessResponse {
  message: string;
  data: Account;
}

export type CreateAccountResponse =
  | AccountMutationSuccessResponse
  | AccountValidationErrorResponse
  | ApiErrorResponse;

export type UpdateAccountResponse =
  | AccountMutationSuccessResponse
  | AccountValidationErrorResponse
  | ApiErrorResponse;

// Respons DELETE /api/accounts/[id]
export type DeleteAccountResponse = { message: string } | ApiErrorResponse;

// ---------------------------------------------------------------------------
// Tipe form
// ---------------------------------------------------------------------------

// Tipe input untuk form tambah akun (enum masih kosong sebelum dipilih)
export interface CreateAccountFormData {
  code: string;
  name: string;
  accountType: AccountType | "";
  normalBalance: NormalBalance | "";
}

// Tipe input untuk form edit akun
export interface EditAccountFormData {
  code: string;
  name: string;
  accountType: AccountType;
  normalBalance: NormalBalance;
  isActive: boolean;
}

// Tipe error validasi per-field (client + API)
export type AccountFieldErrorKey =
  | "code"
  | "name"
  | "accountType"
  | "normalBalance";

export type AccountFieldErrors = Partial<Record<AccountFieldErrorKey, string[]>>;

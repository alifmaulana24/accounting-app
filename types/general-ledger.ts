import type { Account } from "@/types/account";

export type GeneralLedgerAccount = Pick<
  Account,
  "id" | "code" | "name" | "accountType" | "normalBalance" | "isActive"
>;

export interface GeneralLedgerTransaction {
  journalEntryId: string;
  journalNumber: string;
  journalDate: string;
  description: string;
  sourceType: string;
  lineNumber: number;
  debit: string;
  credit: string;
  runningBalance: string;
}

export interface GeneralLedgerReport {
  account: GeneralLedgerAccount;
  period: {
    startDate: string;
    endDate: string;
  };
  openingBalance: string;
  totalDebit: string;
  totalCredit: string;
  closingBalance: string;
  transactions: GeneralLedgerTransaction[];
}

export interface GetGeneralLedgerResponse {
  data: GeneralLedgerReport;
}

export interface GeneralLedgerApiErrorResponse {
  message: string;
}

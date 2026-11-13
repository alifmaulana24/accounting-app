export interface JournalSummary {
  id: string;
  journalNumber: string;
  journalDate: string;
  description: string;
  sourceType: string;
  sourceId: string | null;
  createdAt: string;
  totalDebit: string;
  totalCredit: string;
}

export interface JournalLine {
  id: string;
  lineNumber: number;
  description: string | null;
  debit: string;
  credit: string;
  account: {
    id: string;
    code: string;
    name: string;
    accountType: string;
    normalBalance: string;
  };
}

export interface JournalDetail extends JournalSummary {
  lines: JournalLine[];
}

export interface GetJournalsResponse {
  data: JournalSummary[];
}

export interface GetJournalDetailResponse {
  data: JournalDetail;
}

export interface JournalApiErrorResponse {
  message: string;
  errors?: {
    formErrors?: string[];
    fieldErrors?: Record<string, string[] | undefined>;
  };
}

export interface CreateJournalResponse {
  message: string;
  data: JournalDetail;
}

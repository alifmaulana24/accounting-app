export interface DashboardAccountBalance {
  id: string;
  code: string;
  name: string;
  accountType: string;
  normalBalance: string;
  balance: string;
}

export interface DashboardRecentJournal {
  id: string;
  journalNumber: string;
  journalDate: string;
  description: string;
  sourceType: string;
  totalDebit: string;
  totalCredit: string;
}

export interface DashboardData {
  accountBalances: DashboardAccountBalance[];
  recentJournals: DashboardRecentJournal[];
}

export interface GetDashboardResponse {
  data: DashboardData;
}

export interface DashboardApiErrorResponse {
  message: string;
}

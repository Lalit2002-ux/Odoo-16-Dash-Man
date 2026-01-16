export interface GroupedAccount {
  account_id: number;
  code: string;
  name: string;
  account_type: string;
  balance: number;
  debit?: number;
  credit?: number;
  internal_group?: string;
}

export interface AccountSubGroup {
  name: string;
  accounts: GroupedAccount[];
  total: number;
}

export interface AccountGroup {
  name: string;
  accounts?: GroupedAccount[];
  subgroups?: AccountSubGroup[];
  total: number;
  expanded?: boolean;
}

export interface HierarchicalBalanceSheetData {
  category: string;
  date: string;
  groups: AccountGroup[];
  total: number;
}

// Balance Sheet Account Type Groups Configuration
export const ACCOUNT_TYPE_GROUPS = {
  assets: {
    'Current Assets': {
      'Bank and Cash Accounts': ['asset_cash'],
      'Receivables': ['asset_receivable'],
      'Current Assets': ['asset_current'],
      'Prepayments': ['asset_prepayments'],
    },
    'Fixed Assets': {
      'Fixed Assets': ['asset_fixed'],
      'Non-Current Assets': ['asset_non_current'],
    },
  },
  liabilities: {
    'Current Liabilities': {
      'Current Liabilities': ['liability_current'],
      'Payables': ['liability_payable'],
      'Credit Cards': ['liability_credit_card'],
    },
    'Non-Current Liabilities': {
      'Non-Current Liabilities': ['liability_non_current'],
    },
  },
  equity: {
    'Equity': {
      'Equity': ['equity'],
      'Retained Earnings': ['equity_unaffected'],
      'Current Year Earnings': ['equity_current_year'],
    },
  },
};

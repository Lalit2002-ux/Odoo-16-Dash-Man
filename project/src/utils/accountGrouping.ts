import { GroupedAccount, AccountGroup, AccountSubGroup, ACCOUNT_TYPE_GROUPS } from '../types/balanceSheet';

// P&L Account Types Configuration
export const PNL_ACCOUNT_TYPES = {
  income: {
    'Revenue': {
      'Sales': ['income'],
      'Other Income': ['income_other'],
    },
  },
  cogs: {
    'Cost of Goods Sold': {
      'Direct Costs': ['expense_direct_cost'],
    },
  },
  expense: {
    'Operating Expenses': {
      'Expenses': ['expense'],
    },
  },
  depreciation: {
    'Depreciation': {
      'Depreciation Expenses': ['expense_depreciation'],
    },
  },
};

// ✅ COMPLETELY REWRITTEN - Now shows nested structure like Odoo
export function groupAccounts(
  accounts: GroupedAccount[],
  category: 'assets' | 'liabilities' | 'equity'
): AccountGroup[] {
  if (!accounts || accounts.length === 0) return [];

  const groupConfig = ACCOUNT_TYPE_GROUPS[category];
  const groups: AccountGroup[] = [];

  for (const [groupName, subgroupConfig] of Object.entries(groupConfig)) {
    const subgroups: AccountSubGroup[] = [];

    for (const [subgroupName, accountTypes] of Object.entries(subgroupConfig)) {
      // Filter accounts by type
      const filteredAccounts = accounts.filter((acc) =>
        accountTypes.includes(acc.account_type)
      );

      if (filteredAccounts.length > 0) {
        // Sort accounts by code
        const sortedAccounts = filteredAccounts.sort((a, b) => {
          const aNum = parseInt(a.code);
          const bNum = parseInt(b.code);
          if (!isNaN(aNum) && !isNaN(bNum)) {
            return aNum - bNum;
          }
          return a.code.localeCompare(b.code);
        });

        const subgroupTotal = sortedAccounts.reduce(
          (sum, acc) => sum + acc.balance,
          0
        );

        subgroups.push({
          name: subgroupName,
          accounts: sortedAccounts,
          total: subgroupTotal,
        });
      }
    }

    if (subgroups.length > 0) {
      const groupTotal = subgroups.reduce((sum, sg) => sum + sg.total, 0);
      groups.push({
        name: groupName,
        subgroups,
        total: groupTotal,
        expanded: true,
      });
    }
  }

  return groups;
}

// Group P&L Accounts
export function groupPnLAccounts(
  accounts: any[],
  category: 'income' | 'cogs' | 'expense' | 'depreciation'
): AccountGroup[] {
  const groupConfig = PNL_ACCOUNT_TYPES[category];
  const groups: AccountGroup[] = [];

  for (const [groupName, subgroupConfig] of Object.entries(groupConfig)) {
    const accountsList: any[] = [];

    for (const [subgroupName, accountTypes] of Object.entries(subgroupConfig)) {
      const filteredAccounts = accounts.filter((acc: any) => {
        return acc.account_type && accountTypes.includes(acc.account_type);
      });

      if (filteredAccounts.length > 0) {
        accountsList.push(...filteredAccounts);
      }
    }

    // ✅ Remove duplicates by account_id
    const uniqueAccounts = Array.from(
      new Map(accountsList.map(acc => [acc.account_id, acc])).values()
    );

    if (uniqueAccounts.length > 0) {
      // ✅ Use uniqueAccounts (not accountsList)
      const formattedAccounts = uniqueAccounts.map((acc: any) => ({
        account_id: acc.account_id,
        code: acc.code,
        name: acc.name,
        account_type: acc.account_type || category,
        balance: acc.balance,
        debit: acc.debit || 0,
        credit: acc.credit || 0,
      }));

      const sortedAccounts = formattedAccounts.sort((a, b) => {
        const aNum = parseInt(a.code);
        const bNum = parseInt(b.code);
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return aNum - bNum;
        }
        return a.code.localeCompare(b.code);
      });

      const groupTotal = sortedAccounts.reduce(
        (sum, acc) => sum + acc.balance,
        0
      );

      groups.push({
        name: groupName,
        accounts: sortedAccounts,
        total: groupTotal,
        expanded: false,
      });
    }
  }

  return groups;
}


export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatAccountType(type: string): string {
  const typeMap: { [key: string]: string } = {
    'asset_receivable': 'Accounts Receivable',
    'asset_cash': 'Cash & Bank Accounts',
    'asset_current': 'Current Assets',
    'asset_non_current': 'Non-Current Assets',
    'asset_prepayments': 'Prepayments',
    'asset_fixed': 'Fixed Assets',
    'liability_payable': 'Accounts Payable',
    'liability_current': 'Current Liabilities',
    'liability_non_current': 'Non-Current Liabilities',
    'liability_credit_card': 'Credit Cards',
    'equity': 'Equity',
    'equity_unaffected': 'Retained Earnings',
    'equity_current_year': 'Current Year Earnings',
    'income': 'Revenue',
    'income_other': 'Other Income',
    'expense': 'Operating Expenses',
    'expense_depreciation': 'Depreciation',
    'expense_direct_cost': 'Cost of Goods Sold',
  };

  if (typeMap[type]) {
    return typeMap[type];
  }

  return type
    .replace(/_/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

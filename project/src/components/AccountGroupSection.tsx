import { useState, useMemo, useCallback, memo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { AccountGroup } from '../types/balanceSheet';
import { formatCurrency } from '../utils/accountGrouping';

interface AccountGroupSectionProps {
  group: AccountGroup;
  color: string;
  onAccountClick?: (accountId: number) => void;
}

const COLOR_CONFIG = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', hover: 'hover:bg-blue-100' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-900', hover: 'hover:bg-purple-100' },
  red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900', hover: 'hover:bg-red-100' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-900', hover: 'hover:bg-orange-100' },
  green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900', hover: 'hover:bg-green-100' },
};

// ✅ FIXED - Handle virtual accounts properly
const AccountRow = memo(({ account, onClick }: { account: any; onClick: (id: number) => void }) => {
  const isVirtualAccount = account.account_id < 0; // Virtual accounts like "Current Year Earnings"
  
  const handleClick = () => {
    console.log('AccountRow clicked:', account.account_id, account.name); // Debug
    if (!isVirtualAccount && onClick) {
      onClick(account.account_id);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isVirtualAccount}
      className={`w-full px-6 py-3 flex items-center justify-between transition-colors text-left group border-b border-gray-100 last:border-b-0 ${
        isVirtualAccount 
          ? 'cursor-default bg-gray-50 opacity-70' 
          : 'hover:bg-gray-50 cursor-pointer'
      }`}
    >
      <div className="flex items-center gap-4 flex-1">
        {account.code && (
          <span className="text-sm font-mono bg-gray-100 text-gray-700 px-3 py-1 rounded-lg min-w-[80px]">
            {account.code}
          </span>
        )}
        <span className={`text-sm font-medium transition-colors ${
          isVirtualAccount 
            ? 'text-gray-600 italic' 
            : 'text-gray-900 group-hover:text-blue-600'
        }`}>
          {account.name}
        </span>
      </div>
      <div className="text-right min-w-[140px]">
        <p className={`text-base font-bold ${account.balance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
          {formatCurrency(account.balance)}
        </p>
        {!isVirtualAccount && (
          <p className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
            View transactions
          </p>
        )}
      </div>
    </button>
  );
});
AccountRow.displayName = 'AccountRow';

const SubgroupSection = memo(({ 
  subgroup, 
  isExpanded,
  onToggle,
  onAccountClick 
}: { 
  subgroup: any; 
  isExpanded: boolean;
  onToggle: () => void;
  onAccountClick: (id: number) => void;
}) => (
  <div className="border-l-2 border-gray-200 pl-4 ml-2">
    <button
      onClick={onToggle}
      className="w-full bg-gray-50 p-3 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors text-left mb-2"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-600" /> : <ChevronRight className="w-4 h-4 text-gray-600" />}
          <span className="font-semibold text-gray-900">{subgroup.name}</span>
          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
            {subgroup.accounts.length}
          </span>
        </div>
        <div className="text-sm font-semibold text-gray-900">
          {formatCurrency(subgroup.total)}
        </div>
      </div>
    </button>

    {isExpanded && (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {subgroup.accounts.map((account: any) => (
          <AccountRow key={account.account_id} account={account} onClick={onAccountClick} />
        ))}
      </div>
    )}
  </div>
));
SubgroupSection.displayName = 'SubgroupSection';

export function AccountGroupSection({ group, color, onAccountClick }: AccountGroupSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedSubgroups, setExpandedSubgroups] = useState<Set<string>>(
    new Set((group.subgroups || []).map((sg) => sg.name))
  );

  const colorClasses = useMemo(() => COLOR_CONFIG[color as keyof typeof COLOR_CONFIG] || COLOR_CONFIG.blue, [color]);

  const toggleSubgroup = useCallback((name: string) => {
    setExpandedSubgroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(name)) newSet.delete(name);
      else newSet.add(name);
      return newSet;
    });
  }, []);

  const handleAccountClick = useCallback((accountId: number) => {
    console.log('AccountGroupSection - handleAccountClick:', accountId); // Debug
    if (onAccountClick) {
      onAccountClick(accountId);
    }
  }, [onAccountClick]);

  const totalAccounts = useMemo(() => {
    if (group.accounts) return group.accounts.length;
    if (group.subgroups) return group.subgroups.reduce((sum, sg) => sum + sg.accounts.length, 0);
    return 0;
  }, [group]);

  // ✅ Check if this is a P&L group (has accounts directly) or Balance Sheet (has subgroups)
  const hasDirectAccounts = Boolean(group.accounts && group.accounts.length > 0);
  const hasSubgroups = Boolean(group.subgroups && group.subgroups.length > 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Group Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full px-6 py-4 flex items-center justify-between ${colorClasses.bg} ${colorClasses.border} border-b transition-colors ${colorClasses.hover}`}
      >
        <div className="flex items-center gap-3">
          {isExpanded ? <ChevronDown className={`w-5 h-5 ${colorClasses.text}`} /> : <ChevronRight className={`w-5 h-5 ${colorClasses.text}`} />}
          <span className={`font-semibold text-lg ${colorClasses.text}`}>{group.name}</span>
          <span className="text-sm bg-white text-gray-700 px-3 py-1 rounded-full border border-gray-200">
            {totalAccounts} {totalAccounts === 1 ? 'account' : 'accounts'}
          </span>
        </div>
        <span className={`text-xl font-bold ${colorClasses.text}`}>{formatCurrency(group.total)}</span>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-3 bg-gray-50">
          {/* ✅ NEW: Render direct accounts (for P&L) */}
          {hasDirectAccounts && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {group.accounts!.map((account) => (
                <AccountRow 
                  key={account.account_id} 
                  account={account} 
                  onClick={handleAccountClick} 
                />
              ))}
            </div>
          )}

          {/* ✅ EXISTING: Render subgroups (for Balance Sheet) */}
          {hasSubgroups && group.subgroups!.map((subgroup) => (
            <SubgroupSection
              key={subgroup.name}
              subgroup={subgroup}
              isExpanded={expandedSubgroups.has(subgroup.name)}
              onToggle={() => toggleSubgroup(subgroup.name)}
              onAccountClick={handleAccountClick}
            />
          ))}

          {/* ✅ Empty state */}
          {!hasDirectAccounts && !hasSubgroups && (
            <div className="text-center py-8 text-gray-500">
              No accounts found in this group
            </div>
          )}
        </div>
      )}
    </div>
  );
}

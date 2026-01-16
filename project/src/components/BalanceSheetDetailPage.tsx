import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Loader2, DollarSign, FileText, TrendingUp, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { odooApi } from '../services/odooApi';
import { GroupedAccount } from '../types/balanceSheet';
import { AccountGroupSection } from './AccountGroupSection';
import { AccountTransactionModal } from './AccountTransactionModal';
import { groupAccounts, formatCurrency } from '../utils/accountGrouping';

// Memoized Summary Card
const SummaryCard = memo(({ 
  title, 
  total, 
  totalAccounts, 
  icon: Icon, 
  bgColor,
  textColor 
}: { 
  title: string; 
  total: number; 
  totalAccounts: number; 
  icon: any;
  bgColor: string;
  textColor: string;
}) => (
  <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${textColor}`} />
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Total {title}</p>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(total)}</p>
        </div>
      </div>
      <div className={`${bgColor} px-4 py-2 rounded-lg`}>
        <p className="text-sm text-gray-600">Accounts</p>
        <p className={`text-2xl font-bold ${textColor}`}>{totalAccounts}</p>
      </div>
    </div>
  </div>
));
SummaryCard.displayName = 'SummaryCard';

export function BalanceSheetDetailPage() {
  const { category } = useParams<{ category: 'assets' | 'liabilities' | 'equity' }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { uid, password } = useAuth();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<{
    id: number;
    code: string;
    name: string;
  } | null>(null);

  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchDetail();
  }, [category, date, uid, password]);

  const fetchDetail = async () => {
    if (!uid || !password || !category) return;

    setLoading(true);
    setError('');

    try {
      const res = await odooApi.getBalanceSheetDetail(uid, password, date, category);

      if (res.success && res.data) {
        const accounts = res.data.accounts as GroupedAccount[];
        const groups = groupAccounts(accounts, category);

        setData({
          category: res.data.category,
          date: res.data.date,
          groups,
          total: res.data.total,
        });
      } else {
        setError(res.error || 'Failed to fetch details');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error fetching details');
    } finally {
      setLoading(false);
    }
  };

  const handleAccountClick = useCallback((accountId: number) => {
    if (!data) return;

    let account: GroupedAccount | undefined;
    for (const group of data.groups) {
      if (group.accounts) {
        account = group.accounts.find((a: any) => a.account_id === accountId);
        if (account) break;
      }
      if (group.subgroups) {
        for (const subgroup of group.subgroups) {
          account = subgroup.accounts.find((a: any) => a.account_id === accountId);
          if (account) break;
        }
        if (account) break;
      }
    }

    if (account) {
      setSelectedAccount({
        id: account.account_id,
        code: account.code,
        name: account.name,
      });
    }
  }, [data]);

  const categoryConfig = useMemo(() => ({
    assets: {
      title: 'Assets',
      description: 'Resources owned by the company',
      icon: TrendingUp,
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
    },
    liabilities: {
      title: 'Liabilities',
      description: 'Financial obligations',
      icon: FileText,
      color: 'orange',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600',
    },
    equity: {
      title: 'Equity',
      description: "Owner's stake in the company",
      icon: DollarSign,
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
    },
  }), []);

  const config = category ? categoryConfig[category] : categoryConfig.assets;
  const Icon = config.icon;

  const totalAccounts = useMemo(() => 
    data?.groups.reduce((sum: number, g: any) => {
      if (g.accounts) return sum + g.accounts.length;
      if (g.subgroups) return sum + g.subgroups.reduce((s: number, sg: any) => s + sg.accounts.length, 0);
      return sum;
    }, 0) || 0,
    [data]
  );

  const formattedDate = useMemo(() => 
    new Date(date).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    [date]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/balance-sheet')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Balance Sheet</span>
            </button>
            
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 ${config.bgColor} rounded-xl flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${config.textColor}`} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{config.title} Detail</h1>
                <p className="text-sm text-gray-600">{config.description}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>As of <span className="font-medium text-gray-900">{formattedDate}</span></span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">{error}</div>
        )}

        {!loading && data && (
          <div className="space-y-6">
            {/* Summary */}
            <SummaryCard
              title={config.title}
              total={data.total}
              totalAccounts={totalAccounts}
              icon={Icon}
              bgColor={config.bgColor}
              textColor={config.textColor}
            />

            {/* Account Groups */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-gray-700" />
                <h3 className="text-lg font-semibold text-gray-900">Account Breakdown</h3>
              </div>

              {data.groups.length > 0 ? (
                data.groups.map((group: any) => (
                  <AccountGroupSection
                    key={group.name}
                    group={group}
                    color={config.color}
                    onAccountClick={handleAccountClick}
                  />
                ))
              ) : (
                <div className="bg-white p-12 rounded-xl border border-gray-200 text-center">
                  <p className="text-gray-500 text-lg">No accounts found for this category.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Transaction Modal */}
      {selectedAccount && (
        <AccountTransactionModal
          accountId={selectedAccount.id}
          accountCode={selectedAccount.code}
          accountName={selectedAccount.name}
          date={date}
          onClose={() => setSelectedAccount(null)}
        />
      )}
    </div>
  );
}

import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { ArrowLeft, BarChart3, Loader2, TrendingUp, Activity, PieChart as PieIcon, DollarSign, Calendar } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { odooApi, AccountBreakdownData } from '../services/odooApi';
import { AccountGroupSection } from './AccountGroupSection';
import { AccountTransactionModal } from './AccountTransactionModal';
import { groupPnLAccounts } from '../utils/accountGrouping';
import { AccountGroup } from '../types/balanceSheet';


interface DetailPageProps {
  category: 'income' | 'cogs' | 'expense' | 'depreciation';
  year: number;
  month: number | null;
  onBack: () => void;
}


const CATEGORY_CONFIG = {
  income: {
    title: 'Revenue Breakdown',
    description: 'Detailed analysis of income sources',
    icon: TrendingUp,
    gradient: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200',
  },
  cogs: {
    title: 'Cost of Goods Sold',
    description: 'Direct costs breakdown',
    icon: Activity,
    gradient: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-200',
  },
  expense: {
    title: 'Operating Expenses',
    description: 'Detailed expense analysis',
    icon: DollarSign,
    gradient: 'from-red-500 to-red-600',
    bgColor: 'bg-red-100',
    textColor: 'text-red-600',
    borderColor: 'border-red-200',
  },
  depreciation: {
    title: 'Depreciation Analysis',
    description: 'Asset depreciation breakdown',
    icon: BarChart3,
    gradient: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-200',
  },
} as const;


const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316'];


// Memoized Tooltip
const CustomTooltip = memo(({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-900 mb-2 text-sm">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm flex items-center gap-2 mb-1">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-600">{entry.name}:</span>
            <span className="text-gray-900 font-semibold">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(entry.value)}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
});
CustomTooltip.displayName = 'CustomTooltip';


// Memoized Charts
const MemoizedBarChart = memo(BarChart);



// Currency formatters
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});


const compactCurrencyFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  style: 'currency',
  currency: 'USD',
});


// Memoized KPI Card
const KPICard = memo(({ 
  title, 
  value, 
  icon: Icon, 
  bgColor,
  textColor
}: { 
  title: string; 
  value: string; 
  icon: any; 
  bgColor: string;
  textColor: string;
}) => (
  <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${textColor}`} />
      </div>
    </div>
    <p className="text-sm text-gray-600 mb-1">{title}</p>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
  </div>
));
KPICard.displayName = 'KPICard';


export function DetailPage({ category, year, month, onBack }: DetailPageProps) {
  const { uid, password } = useAuth();
  const [data, setData] = useState<AccountBreakdownData | null>(null);
  const [groups, setGroups] = useState<AccountGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<{
    id: number;
    code: string;
    name: string;
  } | null>(null);


  const config = CATEGORY_CONFIG[category];


  useEffect(() => {
    if (uid && password) {
      fetchBreakdownData();
    }
  }, [category, year, month, uid, password]);


  const fetchBreakdownData = async () => {
    if (!uid || !password) return;


    setLoading(true);
    setError('');


    try {
      const response = await odooApi.getAccountBreakdown(uid, password, category, year, month ?? undefined);
      if (response.success && response.data) {
        const breakdownData = response.data as AccountBreakdownData;
        setData(breakdownData);

        const groupedData = groupPnLAccounts(breakdownData.accounts, category);
        setGroups(groupedData);
      } else {
        setError(response.error || 'Failed to fetch breakdown data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };


  const handleAccountClick = useCallback((accountId: number) => {
    if (!data) return;
    const account = data.accounts.find((a) => a.account_id === accountId);
    if (account) {
      setSelectedAccount({
        id: account.account_id,
        code: account.code,
        name: account.name,
      });
    }
  }, [data]);


  const handleCloseModal = useCallback(() => {
    setSelectedAccount(null);
  }, []);


  // Memoized chart data
  const barChartData = useMemo(() => 
    data
      ? data.accounts.slice(0, 10).map((account) => ({
          code: account.code,
          name: account.name.substring(0, 25),
          balance: Math.abs(account.balance),
        }))
      : []
  , [data]);



  // Summary stats
  const summaryStats = useMemo(() => {
    if (!data) return { totalAccounts: 0, totalDebit: 0, totalCredit: 0, total: 0 };

    return {
      totalAccounts: data.accounts.length,
      totalDebit: data.accounts.reduce((sum, acc) => sum + acc.debit, 0),
      totalCredit: data.accounts.reduce((sum, acc) => sum + acc.credit, 0),
      total: Math.abs(data.total),
    };
  }, [data]);


  const CategoryIcon = config.icon;


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Dashboard</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 ${config.bgColor} rounded-xl flex items-center justify-center`}>
                <CategoryIcon className={`w-6 h-6 ${config.textColor}`} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{config.title}</h1>
                <p className="text-sm text-gray-600">{config.description}</p>
              </div>
            </div>
          </div>


          {/* Period Info */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              Period: <span className="font-medium text-gray-900">
                {month
                  ? new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                  : `Full Year ${year}`}
              </span>
            </span>
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
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}


        {!loading && !error && data && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <KPICard
                title={`Total ${config.title}`}
                value={currencyFormatter.format(summaryStats.total)}
                icon={DollarSign}
                bgColor={config.bgColor}
                textColor={config.textColor}
              />
              <KPICard
                title="Number of Accounts"
                value={summaryStats.totalAccounts.toString()}
                icon={BarChart3}
                bgColor="bg-purple-100"
                textColor="text-purple-600"
              />
              <KPICard
                title="Total Debit"
                value={currencyFormatter.format(summaryStats.totalDebit)}
                icon={TrendingUp}
                bgColor="bg-green-100"
                textColor="text-green-600"
              />
              <KPICard
                title="Total Credit"
                value={currencyFormatter.format(summaryStats.totalCredit)}
                icon={Activity}
                bgColor="bg-orange-100"
                textColor="text-orange-600"
              />
            </div>
                        {/* Top Accounts Bar Chart */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg text-gray-900">Top 10 Accounts by Balance</h3>
              </div>
              {barChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <MemoizedBarChart data={barChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <YAxis 
                      type="category" 
                      dataKey="code" 
                      width={80}
                      stroke="#6b7280" 
                      tick={{ fill: '#6b7280', fontSize: 11 }} 
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="balance" radius={[0, 8, 8, 0]}>
                      {barChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </MemoizedBarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-center py-8">No data available</p>
              )}
            </div>


            {/* 🔥 DETAILED ACCOUNT BREAKDOWN - FIXED VERSION */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-gray-700" />
                <h3 className="text-lg font-semibold text-gray-900">Detailed Account Breakdown</h3>
              </div>


              {/* ✅ FIXED: Check data.accounts instead of groups */}
              {data.accounts && data.accounts.length > 0 ? (
                groups.length > 0 ? (
                  groups.map((group) => (
                    <AccountGroupSection
                      key={group.name}
                      group={group}
                      color={category === 'income' ? 'blue' : category === 'cogs' ? 'purple' : category === 'expense' ? 'red' : 'orange'}
                      onAccountClick={handleAccountClick}
                    />
                  ))
                ) : (
                  // ✅ Fallback: Show accounts even if grouping fails
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Account Code
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Account Name
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Debit
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Credit
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Balance
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {data.accounts.map((account) => (
                            <tr
                              key={account.account_id}
                              onClick={() => handleAccountClick(account.account_id)}
                              className="hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {account.code}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                {account.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                                {currencyFormatter.format(account.debit)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                                {currencyFormatter.format(account.credit)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                                {currencyFormatter.format(Math.abs(account.balance))}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              ) : (
                <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
                  <p className="text-gray-500 text-lg">No accounts found for this category.</p>
                </div>
              )}
            </div>




          </>
        )}
      </main>


      {/* Transaction Modal */}
      {selectedAccount && (
        <AccountTransactionModal
          accountId={selectedAccount.id}
          accountCode={selectedAccount.code}
          accountName={selectedAccount.name}
          date={`${year}-12-31`}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
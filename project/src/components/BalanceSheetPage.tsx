import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Calendar, FileText, DollarSign, TrendingUp, BarChart3, PieChart as PieIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { odooApi, BalanceSheetData } from '../services/odooApi';

// ==================== MEMOIZED COMPONENTS ====================

const DateSelector = memo(({ 
  label, 
  value, 
  options, 
  onChange 
}: { 
  label: string; 
  value: number; 
  options: { value: number; label: string | number }[]; 
  onChange: (value: number) => void;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  </div>
));
DateSelector.displayName = 'DateSelector';

const CustomTooltip = memo(({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-900 mb-1">{payload[0].name}</p>
        <p className="text-sm text-gray-600">
          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
});
CustomTooltip.displayName = 'CustomTooltip';

const KPICard = memo(({ 
  title, 
  value, 
  compactValue,
  icon: Icon, 
  bgColor,
  textColor,
  onClick 
}: { 
  title: string; 
  value: number;
  compactValue: string;
  icon: any; 
  bgColor: string;
  textColor: string;
  onClick?: () => void;
}) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all ${onClick ? 'cursor-pointer' : ''}`}
  >
    <div className="flex items-center justify-between mb-3">
      <div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${textColor}`} />
      </div>
      {onClick && <span className={`text-xs ${textColor} font-medium`}>View Details →</span>}
    </div>
    <p className="text-sm text-gray-600 mb-1">{title}</p>
    <p className="text-2xl font-bold text-gray-900 mb-1">{compactValue}</p>
    <p className="text-xs text-gray-500">
      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)}
    </p>
  </div>
));
KPICard.displayName = 'KPICard';

const BalanceStatusCard = memo(({ isBalanced, difference }: { isBalanced: boolean; difference: number }) => (
  <div className={`p-4 rounded-lg ${isBalanced ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <TrendingUp className={`w-5 h-5 ${isBalanced ? 'text-green-600' : 'text-red-600'}`} />
        <span className={`font-semibold ${isBalanced ? 'text-green-900' : 'text-red-900'}`}>
          {isBalanced ? 'Balance Sheet is Balanced' : 'Balance Sheet Out of Balance'}
        </span>
      </div>
      {!isBalanced && (
        <span className="text-sm text-red-700 font-medium">
          Difference: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(difference)}
        </span>
      )}
    </div>
  </div>
));
BalanceStatusCard.displayName = 'BalanceStatusCard';

// ==================== MAIN COMPONENT ====================

export function BalanceSheetPage() {
  const { uid, password } = useAuth();
  const navigate = useNavigate();
  
  const [balanceSheetData, setBalanceSheetData] = useState<BalanceSheetData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Date state
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const currentMonth = useMemo(() => new Date().getMonth() + 1, []);
  const currentDay = useMemo(() => new Date().getDate(), []);

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedDay, setSelectedDay] = useState(currentDay);

  const selectedDate = useMemo(() => 
    `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`,
    [selectedYear, selectedMonth, selectedDay]
  );

  useEffect(() => {
    fetchBalanceSheet();
  }, [selectedDate, uid, password]);

  const fetchBalanceSheet = async () => {
    if (!uid || !password) return;

    try {
      setLoading(true);
      setError('');

      const res = await odooApi.getBalanceSheet(uid, password, selectedDate);

      if (res.success && res.data) {
        setBalanceSheetData(res.data as BalanceSheetData);
      } else {
        setError(res.error || 'Failed to fetch balance sheet');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error fetching balance sheet');
    } finally {
      setLoading(false);
    }
  };

  const handleDetailClick = useCallback((category: 'assets' | 'liabilities' | 'equity') => {
    navigate(`/balance-sheet/${category}?date=${selectedDate}`);
  }, [navigate, selectedDate]);

  const handleMonthChange = useCallback((newMonth: number) => {
    setSelectedMonth(newMonth);
    const maxDays = new Date(selectedYear, newMonth, 0).getDate();
    if (selectedDay > maxDays) setSelectedDay(maxDays);
  }, [selectedYear, selectedDay]);

  // Memoized options
  const years = useMemo(() => 
    Array.from({ length: 13 }, (_, i) => ({ value: currentYear - 10 + i, label: currentYear - 10 + i })),
    [currentYear]
  );
  
  const months = useMemo(() => [
    { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
    { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
    { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' },
  ], []);

  const days = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => ({ value: i + 1, label: i + 1 }));
  }, [selectedYear, selectedMonth]);

  const formattedDate = useMemo(() => 
    new Date(selectedYear, selectedMonth - 1, selectedDay).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    }),
    [selectedYear, selectedMonth, selectedDay]
  );

  const chartData = useMemo(() => balanceSheetData ? [
    { name: 'Assets', value: balanceSheetData.total_assets },
    { name: 'Liabilities', value: balanceSheetData.total_liabilities },
    { name: 'Equity', value: balanceSheetData.total_equity },
  ] : [], [balanceSheetData]);

  const pieData = useMemo(() => balanceSheetData ? [
    { name: 'Liabilities', value: balanceSheetData.total_liabilities },
    { name: 'Equity', value: balanceSheetData.total_equity },
  ] : [], [balanceSheetData]);

  const isBalanced = useMemo(() => 
    balanceSheetData ? Math.abs(balanceSheetData.balance_difference) < 1 : true,
    [balanceSheetData]
  );

  const compactValues = useMemo(() => balanceSheetData ? ({
    assets: new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(balanceSheetData.total_assets),
    liabilities: new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(balanceSheetData.total_liabilities),
    equity: new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(balanceSheetData.total_equity),
  }) : { assets: '0', liabilities: '0', equity: '0' }, [balanceSheetData]);

  const CHART_COLORS = ['#3b82f6', '#f97316', '#10b981'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Dashboard</span>
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Balance Sheet</h1>
                <p className="text-sm text-gray-600">Financial position summary</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Date Filter */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <Calendar className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="font-semibold text-lg text-gray-900">Select Balance Sheet Date</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DateSelector label="Year" value={selectedYear} options={years} onChange={setSelectedYear} />
            <DateSelector label="Month" value={selectedMonth} options={months} onChange={handleMonthChange} />
            <DateSelector label="Day" value={selectedDay} options={days} onChange={setSelectedDay} />
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-blue-900">Selected Date:</span>{' '}
              <span className="text-gray-900 font-medium">{formattedDate}</span>
            </p>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">{error}</div>
        )}

        {!loading && balanceSheetData && (
          <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Balance Sheet</h2>
                    <p className="text-sm text-gray-600">Financial position overview</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">As of</p>
                  <p className="text-lg font-semibold text-gray-900">{formattedDate}</p>
                </div>
              </div>
              <BalanceStatusCard isBalanced={isBalanced} difference={balanceSheetData.balance_difference} />
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <KPICard
                title="Total Assets"
                value={balanceSheetData.total_assets}
                compactValue={compactValues.assets}
                icon={DollarSign}
                bgColor="bg-blue-100"
                textColor="text-blue-600"
                onClick={() => handleDetailClick('assets')}
              />
              <KPICard
                title="Total Liabilities"
                value={balanceSheetData.total_liabilities}
                compactValue={compactValues.liabilities}
                icon={DollarSign}
                bgColor="bg-orange-100"
                textColor="text-orange-600"
                onClick={() => handleDetailClick('liabilities')}
              />
              <KPICard
                title="Total Equity"
                value={balanceSheetData.total_equity}
                compactValue={compactValues.equity}
                icon={DollarSign}
                bgColor="bg-green-100"
                textColor="text-green-600"
                onClick={() => handleDetailClick('equity')}
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-gray-700" />
                  <h3 className="font-semibold text-lg text-gray-900">Balance Sheet Overview</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#6b7280' }} />
                    <YAxis stroke="#6b7280" tick={{ fill: '#6b7280' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <PieIcon className="w-5 h-5 text-gray-700" />
                  <h3 className="font-semibold text-lg text-gray-900">Liabilities vs Equity</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      <Cell fill={CHART_COLORS[1]} />
                      <Cell fill={CHART_COLORS[2]} />
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Accounting Equation */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-semibold text-lg mb-6 text-gray-900">Accounting Equation</h3>
              <div className="flex items-center justify-center gap-6 flex-wrap">
                <div className="text-center p-6 bg-blue-50 rounded-xl border border-gray-200 hover:shadow-md transition-all">
                  <p className="text-sm text-blue-900 mb-2 font-medium">Assets</p>
                  <p className="text-3xl font-bold text-blue-900">
                    {new Intl.NumberFormat('en-US', { notation: 'compact' }).format(balanceSheetData.total_assets)}
                  </p>
                </div>
                
                <span className="text-4xl font-bold text-gray-400">=</span>
                
                <div className="text-center p-6 bg-orange-50 rounded-xl border border-gray-200 hover:shadow-md transition-all">
                  <p className="text-sm text-orange-900 mb-2 font-medium">Liabilities</p>
                  <p className="text-3xl font-bold text-orange-900">
                    {new Intl.NumberFormat('en-US', { notation: 'compact' }).format(balanceSheetData.total_liabilities)}
                  </p>
                </div>
                
                <span className="text-4xl font-bold text-gray-400">+</span>
                
                <div className="text-center p-6 bg-green-50 rounded-xl border border-gray-200 hover:shadow-md transition-all">
                  <p className="text-sm text-green-900 mb-2 font-medium">Equity</p>
                  <p className="text-3xl font-bold text-green-900">
                    {new Intl.NumberFormat('en-US', { notation: 'compact' }).format(balanceSheetData.total_equity)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

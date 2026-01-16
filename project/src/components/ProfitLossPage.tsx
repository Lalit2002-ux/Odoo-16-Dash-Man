import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  PieChart as PieIcon,
  BarChart3,
  X,
  Calendar,
  Loader2,
  ArrowLeft,
  ChevronRight,
  TrendingDown,
  Download,
  RefreshCw,
  Activity,
  Target,
  Zap,
  Filter,
  Settings,
  Share2,
  MoreVertical,
  Eye,
  ArrowDown,
  ArrowUp,
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
} from 'recharts';
import { FinancialData, odooApi } from '../services/odooApi';
import { useAuth } from '../context/AuthContext';
import { DetailPage } from './DetailPage';

// ============================================
// TYPE DEFINITIONS
// ============================================
type DetailCategory = 'income' | 'cogs' | 'expense' | 'depreciation' | null;

// ============================================
// CACHE FOR MONTHLY DATA
// ============================================
const monthlyDataCache: Record<string, Record<number, FinancialData>> = {};

// ============================================
// CUSTOM TOOLTIP COMPONENT
// ============================================
const CustomTooltip = memo(({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-2xl">
        <p className="font-semibold text-gray-900 mb-2 text-sm">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs flex items-center gap-2 mb-1">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
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

// ============================================
// MEMOIZED CHART COMPONENTS
// ============================================
const MemoizedLineChart = memo(LineChart);
const MemoizedAreaChart = memo(AreaChart);
const MemoizedBarChart = memo(BarChart);
const MemoizedPieChart = memo(RePieChart);
const MemoizedComposedChart = memo(ComposedChart);

// ============================================
// CURRENCY FORMATTERS
// ============================================
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

const compactFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
});

// ============================================
// MAIN COMPONENT
// ============================================
export function ProfitLossPage() {
  const { uid, password } = useAuth();
  const navigate = useNavigate();

  const [primaryData, setPrimaryData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const [viewMode, setViewMode] = useState<'main' | 'yearComparison'>('main');
  const [detailView, setDetailView] = useState<DetailCategory>(null);

  const [showYearModal, setShowYearModal] = useState(false);
  const [selectedComparisonYears, setSelectedComparisonYears] = useState<number[]>([]);
  const [loadingComparison, setLoadingComparison] = useState(false);
  const [allYearsData, setAllYearsData] = useState<Record<number, FinancialData>>({});

  const [monthlyData, setMonthlyData] = useState<Record<number, FinancialData>>({});
  const [loadingMonthly, setLoadingMonthly] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const years = useMemo(
    () => Array.from({ length: 13 }, (_, i) => currentYear - 10 + i),
    [currentYear]
  );

  const months = useMemo(
    () => [
      { value: null, label: 'All Year' },
      { value: 1, label: 'January' },
      { value: 2, label: 'February' },
      { value: 3, label: 'March' },
      { value: 4, label: 'April' },
      { value: 5, label: 'May' },
      { value: 6, label: 'June' },
      { value: 7, label: 'July' },
      { value: 8, label: 'August' },
      { value: 9, label: 'September' },
      { value: 10, label: 'October' },
      { value: 11, label: 'November' },
      { value: 12, label: 'December' },
    ],
    []
  );

  const percentages = useMemo(() => {
    if (!primaryData || primaryData.total_income === 0) {
      return { cogs: 0, expenses: 0, netIncome: 0, grossProfit: 0 };
    }
    return {
      cogs: (primaryData.total_cogs / primaryData.total_income) * 100,
      expenses: (primaryData.total_expense / primaryData.total_income) * 100,
      netIncome: (primaryData.net_income / primaryData.total_income) * 100,
      grossProfit: (primaryData.gross_profit / primaryData.total_income) * 100,
    };
  }, [primaryData]);

  useEffect(() => {
    const fetchFinancialData = async () => {
      if (!uid || !password) return;
      setLoading(true);
      setError('');
      try {
        const res = await odooApi.getProfitAndLoss(
          uid,
          password,
          selectedYear,
          selectedMonth ?? undefined
        );
        if (res.success && res.data) {
          setPrimaryData(res.data as FinancialData);
          setAllYearsData({ [selectedYear]: res.data as FinancialData });
        } else {
          throw new Error(res.error || 'Failed to fetch data');
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error fetching financial data');
      } finally {
        setLoading(false);
      }
    };
    fetchFinancialData();
  }, [selectedYear, selectedMonth, uid, password]);

  useEffect(() => {
    const fetchMonthlyData = async () => {
      if (!uid || !password || !primaryData) return;
      const cacheKey = `${uid}-${selectedYear}`;
      if (monthlyDataCache[cacheKey]) {
        setMonthlyData(monthlyDataCache[cacheKey]);
        return;
      }
      setLoadingMonthly(true);
      setLoadingProgress(0);
      try {
        const monthlyResults: Record<number, FinancialData> = {};
        let completedRequests = 0;
        const monthPromises = Array.from({ length: 12 }, (_, i) => {
          const month = i + 1;
          return odooApi
            .getProfitAndLoss(uid, password, selectedYear, month)
            .then((response) => {
              if (response.success && response.data) {
                monthlyResults[month] = response.data as FinancialData;
              }
              completedRequests++;
              setLoadingProgress((completedRequests / 12) * 100);
            })
            .catch(() => {
              completedRequests++;
              setLoadingProgress((completedRequests / 12) * 100);
            });
        });
        await Promise.all(monthPromises);
        if (Object.keys(monthlyResults).length > 0) {
          monthlyDataCache[cacheKey] = monthlyResults;
          setMonthlyData(monthlyResults);
        }
      } catch (error) {
        console.error('Error fetching monthly data:', error);
      } finally {
        setLoadingMonthly(false);
      }
    };
    fetchMonthlyData();
  }, [uid, password, selectedYear, primaryData]);

  const monthlyRevenueData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames.map((month, index) => {
      const monthNum = index + 1;
      const data = monthlyData[monthNum];
      return {
        month,
        revenue: data ? Math.abs(data.total_income) : 0,
        cogs: data ? Math.abs(data.total_cogs) : 0,
        expenses: data ? Math.abs(data.total_expense) : 0,
        grossProfit: data ? Math.abs(data.gross_profit) : 0,
        netIncome: data ? data.net_income : 0,
      };
    });
  }, [monthlyData]);

  const hasMonthlyData = useMemo(() => Object.keys(monthlyData).length > 0, [monthlyData]);

  const comparisonData = useMemo(
    () =>
      Object.entries(allYearsData)
        .map(([yearStr, data]) => ({
          year: Number(yearStr),
          revenue: data.total_income,
          cogs: data.total_cogs,
          expenses: data.total_expense,
          grossProfit: data.gross_profit,
          netIncome: data.net_income,
        }))
        .sort((a, b) => a.year - b.year),
    [allYearsData]
  );

  const profitMarginData = useMemo(() => {
    if (!primaryData) return [];
    return [
      {
        name: 'Gross Margin',
        value: percentages.grossProfit,
        fill: '#10b981',
      },
      {
        name: 'Net Margin',
        value: percentages.netIncome,
        fill: '#3b82f6',
      },
    ];
  }, [primaryData, percentages]);

  const toggleComparisonYear = useCallback((year: number) => {
    setSelectedComparisonYears((prev) => {
      if (prev.includes(year)) {
        return prev.filter((y) => y !== year);
      } else {
        return [...prev, year];
      }
    });
  }, []);

  const handleFetchComparisonData = useCallback(async () => {
    if (!uid || !password || selectedComparisonYears.length === 0) {
      console.log('Missing requirements:', { uid, password, selectedComparisonYears });
      return;
    }
    
    setLoadingComparison(true);
    try {
      const yearsToFetch = [selectedYear, ...selectedComparisonYears];
      const uniqueYears = Array.from(new Set(yearsToFetch));
      
      console.log('Fetching data for years:', uniqueYears);
      
      const results = await Promise.all(
        uniqueYears.map((year) =>
          odooApi.getProfitAndLoss(uid, password, year, undefined).then((res) => ({ year, res }))
        )
      );
      
      const dataByYear: Record<number, FinancialData> = {};
      for (const { year, res } of results) {
        if (res.success && res.data) {
          dataByYear[year] = res.data as FinancialData;
        }
      }
      
      console.log('Fetched data:', dataByYear);
      
      setAllYearsData(dataByYear);
      setViewMode('yearComparison');
      setShowYearModal(false);
    } catch (e) {
      console.error('Error fetching comparison data:', e);
      alert('Error fetching comparison data. Please try again.');
    } finally {
      setLoadingComparison(false);
    }
  }, [uid, password, selectedComparisonYears, selectedYear]);

  const yAxisTickFormatter = useCallback((value: number) => compactFormatter.format(value), []);
  const yAxisCurrencyTickFormatter = useCallback(
    (value: number) => compactCurrencyFormatter.format(value),
    []
  );

  const handleDetailClick = useCallback((category: DetailCategory) => {
    setDetailView(category);
  }, []);

  const handleBackFromDetail = useCallback(() => {
    setDetailView(null);
  }, []);

  const handleModalClose = useCallback(() => {
    setShowYearModal(false);
  }, []);

  const handleViewChange = useCallback(
    (mode: 'main' | 'yearComparison') => {
      if (mode === 'yearComparison') {
        // Check if we need to show modal or can directly switch
        const availableYearsCount = Object.keys(allYearsData).length;
        console.log('Available years data:', allYearsData);
        
        if (availableYearsCount <= 1) {
          // Need to select more years
          setShowYearModal(true);
        } else {
          // Already have comparison data
          setViewMode('yearComparison');
        }
      } else {
        setViewMode(mode);
      }
    },
    [allYearsData]
  );

  if (detailView) {
    return (
      <DetailPage
        category={detailView}
        year={selectedYear}
        month={null}
        onBack={handleBackFromDetail}
      />
    );
  }

  // ============================================
  // MAIN RENDER - LIGHT DASHBOARD STYLE
  // ============================================
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="max-w-[1920px] mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Dashboard</span>
              </button>
              
              <div className="h-6 w-px bg-gray-200" />
              
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-gray-900">Financial Analytics</h1>
                  <p className="text-xs text-gray-500">Profit & Loss Dashboard</p>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">
                <Filter className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg transition-all shadow-md">
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Secondary Navigation - View Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'main'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                onClick={() => handleViewChange('main')}
              >
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Overview
                </div>
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'yearComparison'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                onClick={() => handleViewChange('yearComparison')}
              >
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Year Comparison
                </div>
              </button>
            </div>

            {/* Period Selector */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Period:</span>
              </div>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              <select
                value={selectedMonth ?? ''}
                onChange={(e) =>
                  setSelectedMonth(e.target.value ? Number(e.target.value) : null)
                }
                className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {months.map((month) => (
                  <option key={month.label} value={month.value ?? ''}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-[1920px] mx-auto px-6 py-6">
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-32">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading financial data...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* DASHBOARD OVERVIEW */}
        {!loading && primaryData && viewMode === 'main' && (
          <>
            {/* KPI Summary Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Total Revenue Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-lg transition-all group cursor-pointer"
                   onClick={() => handleDetailClick('income')}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-all">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <button className="p-1 text-gray-400 hover:text-gray-700 transition-all">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 mb-2">
                    {currencyFormatter.format(primaryData.total_income)}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs">
                      <ArrowUp className="w-3 h-3 text-green-600" />
                      <span className="text-green-600 font-medium">100%</span>
                    </div>
                    <span className="text-xs text-gray-400">baseline</span>
                  </div>
                </div>
              </div>

              {/* Cost of Goods Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-purple-300 hover:shadow-lg transition-all group cursor-pointer"
                   onClick={() => handleDetailClick('cogs')}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-all">
                    <ShoppingCart className="w-5 h-5 text-purple-600" />
                  </div>
                  <button className="p-1 text-gray-400 hover:text-gray-700 transition-all">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Cost of Goods</p>
                  <p className="text-2xl font-bold text-gray-900 mb-2">
                    {currencyFormatter.format(primaryData.total_cogs)}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs">
                      <ArrowDown className="w-3 h-3 text-purple-600" />
                      <span className="text-purple-600 font-medium">{percentages.cogs.toFixed(1)}%</span>
                    </div>
                    <span className="text-xs text-gray-400">of revenue</span>
                  </div>
                </div>
              </div>

              {/* Operating Expenses Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-red-300 hover:shadow-lg transition-all group cursor-pointer"
                   onClick={() => handleDetailClick('expense')}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-all">
                    <DollarSign className="w-5 h-5 text-red-600" />
                  </div>
                  <button className="p-1 text-gray-400 hover:text-gray-700 transition-all">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Operating Expenses</p>
                  <p className="text-2xl font-bold text-gray-900 mb-2">
                    {currencyFormatter.format(primaryData.total_expense)}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs">
                      <ArrowDown className="w-3 h-3 text-red-600" />
                      <span className="text-red-600 font-medium">{percentages.expenses.toFixed(1)}%</span>
                    </div>
                    <span className="text-xs text-gray-400">of revenue</span>
                  </div>
                </div>
              </div>

              {/* Net Income Card */}
              <div className={`bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all group cursor-pointer ${
                primaryData.net_income >= 0 ? 'hover:border-green-300' : 'hover:border-red-300'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                    primaryData.net_income >= 0 
                      ? 'bg-green-100 group-hover:bg-green-200' 
                      : 'bg-red-100 group-hover:bg-red-200'
                  }`}>
                    {primaryData.net_income >= 0 ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <button className="p-1 text-gray-400 hover:text-gray-700 transition-all">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Net Income</p>
                  <p className={`text-2xl font-bold mb-2 ${
                    primaryData.net_income >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {currencyFormatter.format(primaryData.net_income)}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs">
                      {primaryData.net_income >= 0 ? (
                        <ArrowUp className="w-3 h-3 text-green-600" />
                      ) : (
                        <ArrowDown className="w-3 h-3 text-red-600" />
                      )}
                      <span className={`font-medium ${
                        primaryData.net_income >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {percentages.netIncome.toFixed(1)}%
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">net margin</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Revenue Trend - Large Chart (2 columns) */}
              <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Revenue Performance</h3>
                    <p className="text-xs text-gray-500">Monthly revenue, costs and profit trends</p>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
                {hasMonthlyData ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <MemoizedComposedChart data={monthlyRevenueData}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 11 }} />
                      <YAxis stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={yAxisTickFormatter} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#3b82f6" fill="url(#revenueGradient)" />
                      <Bar dataKey="cogs" name="COGS" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      <Line type="monotone" dataKey="netIncome" name="Net Income" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                    </MemoizedComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[320px] flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Loading chart data...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Profit Margin Breakdown - Pie Chart */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Profit Margins</h3>
                    <p className="text-xs text-gray-500">Gross vs Net margins</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <MemoizedPieChart>
                    <Pie
                      data={profitMarginData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {profitMarginData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </MemoizedPieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4">
                  {profitMarginData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }}></div>
                        <span className="text-sm text-gray-700">{item.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{item.value.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Secondary Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Monthly COGS Trend */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">Cost of Goods Sold</h3>
                    <p className="text-xs text-gray-500">Monthly COGS breakdown</p>
                  </div>
                </div>
                {hasMonthlyData ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <MemoizedBarChart data={monthlyRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 10 }} />
                      <YAxis stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 10 }} tickFormatter={yAxisTickFormatter} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="cogs" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                    </MemoizedBarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[240px] flex items-center justify-center">
                    <p className="text-sm text-gray-400">Loading...</p>
                  </div>
                )}
              </div>

              {/* Monthly Expenses Trend */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">Operating Expenses</h3>
                    <p className="text-xs text-gray-500">Monthly expense analysis</p>
                  </div>
                </div>
                {hasMonthlyData ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <MemoizedBarChart data={monthlyRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 10 }} />
                      <YAxis stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 10 }} tickFormatter={yAxisTickFormatter} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="expenses" fill="#ef4444" radius={[6, 6, 0, 0]} />
                    </MemoizedBarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[240px] flex items-center justify-center">
                    <p className="text-sm text-gray-400">Loading...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Profitability Summary Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gross Profit Card */}
              <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 border border-teal-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs text-teal-700 mb-2 uppercase tracking-wide">Gross Profit</p>
                    <p className={`text-3xl font-bold mb-2 ${primaryData.gross_profit < 0 ? 'text-red-600' : 'text-teal-600'}`}>
                      {currencyFormatter.format(primaryData.gross_profit)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Revenue minus COGS • <span className="text-gray-900 font-medium">{((primaryData.gross_profit / primaryData.total_income) * 100).toFixed(1)}%</span> margin
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-teal-200 rounded-xl flex items-center justify-center">
                    <PieIcon className="w-6 h-6 text-teal-700" />
                  </div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-teal-500 to-teal-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, percentages.grossProfit))}%` }}
                  ></div>
                </div>
              </div>

              {/* Net Income Card */}
              <div className={`border rounded-xl p-6 shadow-sm ${
                primaryData.net_income >= 0 
                  ? 'bg-gradient-to-br from-green-50 to-green-100/50 border-green-200'
                  : 'bg-gradient-to-br from-red-50 to-red-100/50 border-red-200'
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className={`text-xs mb-2 uppercase tracking-wide ${
                      primaryData.net_income >= 0 ? 'text-green-700' : 'text-red-700'
                    }`}>Net Income (Final Profit)</p>
                    <p className={`text-3xl font-bold mb-2 ${
                      primaryData.net_income >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {currencyFormatter.format(primaryData.net_income)}
                    </p>
                    <p className="text-sm text-gray-600">
                      After all expenses • <span className="text-gray-900 font-medium">{percentages.netIncome.toFixed(1)}%</span> net margin
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    primaryData.net_income >= 0 ? 'bg-green-200' : 'bg-red-200'
                  }`}>
                    {primaryData.net_income >= 0 ? (
                      <TrendingUp className="w-6 h-6 text-green-700" />
                    ) : (
                      <TrendingDown className="w-6 h-6 text-red-700" />
                    )}
                  </div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      primaryData.net_income >= 0 
                        ? 'bg-gradient-to-r from-green-500 to-green-600'
                        : 'bg-gradient-to-r from-red-500 to-red-600'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, Math.abs(percentages.netIncome)))}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Loading Monthly Data */}
            {loadingMonthly && !hasMonthlyData && (
              <div className="mt-6 bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-900 font-semibold mb-2">Loading Monthly Analytics...</p>
                <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mx-auto">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
                    style={{ width: `${loadingProgress}%` }}
                  ></div>
                </div>
                <p className="text-gray-500 text-sm mt-2">{Math.round(loadingProgress)}% Complete</p>
              </div>
            )}
          </>
        )}

        {/* YEAR COMPARISON VIEW */}
        {!loading && viewMode === 'yearComparison' && (
          <div>
            <div className="bg-white border border-gray-200 rounded-xl p-8 mb-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Year-over-Year Financial Comparison</h3>
              {comparisonData.length > 1 ? (
                <>
                  <ResponsiveContainer width="100%" height={450}>
                    <MemoizedBarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="year" stroke="#6b7280" tick={{ fill: '#6b7280' }} />
                      <YAxis stroke="#6b7280" tick={{ fill: '#6b7280' }} tickFormatter={yAxisCurrencyTickFormatter} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="cogs" name="COGS" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="grossProfit" name="Gross Profit" fill="#14b8a6" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="netIncome" name="Net Income" fill="#10b981" radius={[8, 8, 0, 0]} />
                    </MemoizedBarChart>
                  </ResponsiveContainer>

                  {/* Performance Insights Section */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-6">
                      <Activity className="w-5 h-5 text-blue-600" />
                      <h4 className="text-lg font-bold text-gray-900">Performance Insights</h4>
                    </div>

                    {/* Insights Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Best Revenue Year */}
                      {(() => {
                        const bestRevenue = comparisonData.reduce((max, item) => 
                          item.revenue > max.revenue ? item : max
                        );
                        return (
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-xl p-5">
                            <div className="flex items-start justify-between mb-3">
                              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-white" />
                              </div>
                              <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs font-semibold rounded-full">
                                Best
                              </span>
                            </div>
                            <p className="text-xs text-blue-700 font-semibold uppercase tracking-wide mb-1">
                              Highest Revenue
                            </p>
                            <p className="text-2xl font-bold text-blue-900 mb-1">
                              {bestRevenue.year}
                            </p>
                            <p className="text-sm text-blue-700 font-semibold">
                              {currencyFormatter.format(bestRevenue.revenue)}
                            </p>
                          </div>
                        );
                      })()}

                      {/* Best Net Income Year */}
                      {(() => {
                        const bestNetIncome = comparisonData.reduce((max, item) => 
                          item.netIncome > max.netIncome ? item : max
                        );
                        return (
                          <div className="bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200 rounded-xl p-5">
                            <div className="flex items-start justify-between mb-3">
                              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                                <Target className="w-5 h-5 text-white" />
                              </div>
                              <span className="px-2 py-1 bg-green-200 text-green-800 text-xs font-semibold rounded-full">
                                Best
                              </span>
                            </div>
                            <p className="text-xs text-green-700 font-semibold uppercase tracking-wide mb-1">
                              Highest Net Income
                            </p>
                            <p className="text-2xl font-bold text-green-900 mb-1">
                              {bestNetIncome.year}
                            </p>
                            <p className="text-sm text-green-700 font-semibold">
                              {currencyFormatter.format(bestNetIncome.netIncome)}
                            </p>
                          </div>
                        );
                      })()}

                      {/* Best Gross Profit Year */}
                      {(() => {
                        const bestGrossProfit = comparisonData.reduce((max, item) => 
                          item.grossProfit > max.grossProfit ? item : max
                        );
                        return (
                          <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 border border-teal-200 rounded-xl p-5">
                            <div className="flex items-start justify-between mb-3">
                              <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
                                <Zap className="w-5 h-5 text-white" />
                              </div>
                              <span className="px-2 py-1 bg-teal-200 text-teal-800 text-xs font-semibold rounded-full">
                                Best
                              </span>
                            </div>
                            <p className="text-xs text-teal-700 font-semibold uppercase tracking-wide mb-1">
                              Highest Gross Profit
                            </p>
                            <p className="text-2xl font-bold text-teal-900 mb-1">
                              {bestGrossProfit.year}
                            </p>
                            <p className="text-sm text-teal-700 font-semibold">
                              {currencyFormatter.format(bestGrossProfit.grossProfit)}
                            </p>
                          </div>
                        );
                      })()}

                      {/* Highest Expenses Year */}
                      {(() => {
                        const highestExpenses = comparisonData.reduce((max, item) => 
                          item.expenses > max.expenses ? item : max
                        );
                        return (
                          <div className="bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200 rounded-xl p-5">
                            <div className="flex items-start justify-between mb-3">
                              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                                <TrendingDown className="w-5 h-5 text-white" />
                              </div>
                              <span className="px-2 py-1 bg-red-200 text-red-800 text-xs font-semibold rounded-full">
                                Highest
                              </span>
                            </div>
                            <p className="text-xs text-red-700 font-semibold uppercase tracking-wide mb-1">
                              Highest Expenses
                            </p>
                            <p className="text-2xl font-bold text-red-900 mb-1">
                              {highestExpenses.year}
                            </p>
                            <p className="text-sm text-red-700 font-semibold">
                              {currencyFormatter.format(highestExpenses.expenses)}
                            </p>
                          </div>
                        );
                      })()}

                      {/* Highest COGS Year */}
                      {(() => {
                        const highestCOGS = comparisonData.reduce((max, item) => 
                          item.cogs > max.cogs ? item : max
                        );
                        return (
                          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200 rounded-xl p-5">
                            <div className="flex items-start justify-between mb-3">
                              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                                <ShoppingCart className="w-5 h-5 text-white" />
                              </div>
                              <span className="px-2 py-1 bg-purple-200 text-purple-800 text-xs font-semibold rounded-full">
                                Highest
                              </span>
                            </div>
                            <p className="text-xs text-purple-700 font-semibold uppercase tracking-wide mb-1">
                              Highest COGS
                            </p>
                            <p className="text-2xl font-bold text-purple-900 mb-1">
                              {highestCOGS.year}
                            </p>
                            <p className="text-sm text-purple-700 font-semibold">
                              {currencyFormatter.format(highestCOGS.cogs)}
                            </p>
                          </div>
                        );
                      })()}

                      {/* Growth Analysis */}
                      {(() => {
                        const sortedYears = [...comparisonData].sort((a, b) => a.year - b.year);
                        if (sortedYears.length < 2) return null;
                        
                        const firstYear = sortedYears[0];
                        const lastYear = sortedYears[sortedYears.length - 1];
                        const revenueGrowth = ((lastYear.revenue - firstYear.revenue) / firstYear.revenue) * 100;
                        const isPositiveGrowth = revenueGrowth >= 0;
                        
                        return (
                          <div className={`bg-gradient-to-br border rounded-xl p-5 ${
                            isPositiveGrowth 
                              ? 'from-emerald-50 to-emerald-100/50 border-emerald-200'
                              : 'from-orange-50 to-orange-100/50 border-orange-200'
                          }`}>
                            <div className="flex items-start justify-between mb-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                isPositiveGrowth ? 'bg-emerald-500' : 'bg-orange-500'
                              }`}>
                                <Activity className="w-5 h-5 text-white" />
                              </div>
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                isPositiveGrowth 
                                  ? 'bg-emerald-200 text-emerald-800'
                                  : 'bg-orange-200 text-orange-800'
                              }`}>
                                {isPositiveGrowth ? 'Growth' : 'Decline'}
                              </span>
                            </div>
                            <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${
                              isPositiveGrowth ? 'text-emerald-700' : 'text-orange-700'
                            }`}>
                              Revenue Growth
                            </p>
                            <p className={`text-2xl font-bold mb-1 ${
                              isPositiveGrowth ? 'text-emerald-900' : 'text-orange-900'
                            }`}>
                              {revenueGrowth > 0 ? '+' : ''}{revenueGrowth.toFixed(1)}%
                            </p>
                            <p className={`text-sm font-semibold ${
                              isPositiveGrowth ? 'text-emerald-700' : 'text-orange-700'
                            }`}>
                              {firstYear.year} to {lastYear.year}
                            </p>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Summary Stats Table */}
                    <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-6">
                      <h5 className="text-sm font-bold text-gray-900 mb-4">Year-over-Year Summary</h5>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-2 px-3 text-gray-600 font-semibold">Year</th>
                              <th className="text-right py-2 px-3 text-gray-600 font-semibold">Revenue</th>
                              <th className="text-right py-2 px-3 text-gray-600 font-semibold">COGS</th>
                              <th className="text-right py-2 px-3 text-gray-600 font-semibold">Expenses</th>
                              <th className="text-right py-2 px-3 text-gray-600 font-semibold">Gross Profit</th>
                              <th className="text-right py-2 px-3 text-gray-600 font-semibold">Net Income</th>
                              <th className="text-right py-2 px-3 text-gray-600 font-semibold">Net Margin</th>
                            </tr>
                          </thead>
                          <tbody>
                            {comparisonData.map((yearData) => {
                              const netMargin = (yearData.netIncome / yearData.revenue) * 100;
                              return (
                                <tr key={yearData.year} className="border-b border-gray-100 hover:bg-white transition-colors">
                                  <td className="py-3 px-3 font-bold text-gray-900">{yearData.year}</td>
                                  <td className="py-3 px-3 text-right text-gray-900">
                                    {currencyFormatter.format(yearData.revenue)}
                                  </td>
                                  <td className="py-3 px-3 text-right text-purple-600">
                                    {currencyFormatter.format(yearData.cogs)}
                                  </td>
                                  <td className="py-3 px-3 text-right text-red-600">
                                    {currencyFormatter.format(yearData.expenses)}
                                  </td>
                                  <td className="py-3 px-3 text-right text-teal-600 font-semibold">
                                    {currencyFormatter.format(yearData.grossProfit)}
                                  </td>
                                  <td className={`py-3 px-3 text-right font-semibold ${
                                    yearData.netIncome >= 0 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {currencyFormatter.format(yearData.netIncome)}
                                  </td>
                                  <td className={`py-3 px-3 text-right font-semibold ${
                                    netMargin >= 0 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {netMargin.toFixed(1)}%
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Select additional years to compare financial performance</p>
                  <button
                    onClick={() => setShowYearModal(true)}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                  >
                    Select Years for Comparison
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* Year Selection Modal */}
      {showYearModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Select Years to Compare</h3>
              <button
                onClick={handleModalClose}
                className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Current Year:</strong> {selectedYear}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Select one or more years below to compare with {selectedYear}
              </p>
            </div>
            
            <div className="grid grid-cols-4 gap-3 mb-6">
              {years.map((year) => {
                const isCurrentYear = year === selectedYear;
                const isSelected = selectedComparisonYears.includes(year);
                
                return (
                  <button
                    key={year}
                    onClick={() => {
                      if (!isCurrentYear) {
                        console.log('Toggling year:', year);
                        toggleComparisonYear(year);
                      }
                    }}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      isCurrentYear
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-300 cursor-not-allowed'
                        : isSelected
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg transform hover:scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent hover:border-gray-300'
                    }`}
                    disabled={isCurrentYear}
                  >
                    <div>
                      {year}
                      {isCurrentYear && <span className="block text-xs mt-1">Current</span>}
                      {isSelected && !isCurrentYear && <span className="block text-xs mt-1">✓ Selected</span>}
                    </div>
                  </button>
                );
              })}
            </div>
            
            {selectedComparisonYears.length > 0 && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Selected {selectedComparisonYears.length} year{selectedComparisonYears.length !== 1 ? 's' : ''}:</strong>
                  <span className="ml-2 font-mono">{selectedComparisonYears.sort((a, b) => a - b).join(', ')}</span>
                </p>
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={handleModalClose}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  console.log('Compare button clicked');
                  console.log('Selected years:', selectedComparisonYears);
                  handleFetchComparisonData();
                }}
                disabled={selectedComparisonYears.length === 0 || loadingComparison}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loadingComparison && <Loader2 className="w-4 h-4 animate-spin" />}
                {loadingComparison 
                  ? 'Loading...' 
                  : selectedComparisonYears.length === 0 
                  ? 'Select Years to Compare'
                  : `Compare ${selectedComparisonYears.length + 1} Years`
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  FileText,
  LogOut,
  BarChart3,
  Shield,
  Zap,
  CheckCircle2,
  Clock,
  Users,
  ChevronRight,
  Menu,
  X,
  Bell,
  Settings,
  Database,
  Activity,
  Smartphone,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';


export function Dashboard() {
  const { logout, username } = useAuth();
  const navigate = useNavigate();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };


  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <aside
          className={`hidden lg:flex flex-col bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ${
            sidebarOpen ? 'w-64' : 'w-20'
          }`}
        >
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  OIG Financial
                </h1>
              </div>
            )}
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-auto"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          </div>


          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="mb-6">
              {sidebarOpen && (
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-4">
                  Reports
                </p>
              )}
              <button
                onClick={() => navigate('/profit-loss')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors mb-2 group ${
                  !sidebarOpen ? 'justify-center' : ''
                }`}
              >
                <BarChart3 className="w-5 h-5 flex-shrink-0 text-blue-600" />
                {sidebarOpen && <span className="font-medium">Profit & Loss</span>}
                {sidebarOpen && (
                  <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
              
              <button
                onClick={() => navigate('/balance-sheet')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors mb-2 group ${
                  !sidebarOpen ? 'justify-center' : ''
                }`}
              >
                <FileText className="w-5 h-5 flex-shrink-0 text-indigo-600" />
                {sidebarOpen && <span className="font-medium">Balance Sheet</span>}
                {sidebarOpen && (
                  <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>


              {/* Sales - Coming Soon */}
              <button
                disabled
                className={`w-full flex items-center gap-3 px-4 py-3 text-gray-400 cursor-not-allowed rounded-lg mb-2 group ${
                  !sidebarOpen ? 'justify-center' : ''
                }`}
              >
                <TrendingUp className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="font-medium">Sales</span>
                    <span className="ml-auto text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                      Coming Soon
                    </span>
                  </>
                )}
              </button>


              {/* CRM - Coming Soon */}
              <button
                disabled
                className={`w-full flex items-center gap-3 px-4 py-3 text-gray-400 cursor-not-allowed rounded-lg mb-2 group ${
                  !sidebarOpen ? 'justify-center' : ''
                }`}
              >
                <Users className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="font-medium">CRM</span>
                    <span className="ml-auto text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                      Coming Soon
                    </span>
                  </>
                )}
              </button>
            </div>


            {/* Settings */}
            {sidebarOpen && (
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 px-4">
                  System
                </p>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors group">
                  <Settings className="w-5 h-5 flex-shrink-0 text-gray-600" />
                  <span className="font-medium">Settings</span>
                  <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            )}
          </nav>


          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors group">
            {sidebarOpen ? (
              <>
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors border border-gray-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </>
            ) : (
              <button
                onClick={logout}
                className="w-full flex items-center justify-center p-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </aside>


        {/* Mobile Sidebar */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-gray-900 bg-opacity-50"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-2xl">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    OIG Financial
                  </h1>
                  <p className="text-xs text-gray-500 mt-1">Dashboard v2.0</p>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              
              <nav className="p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-4">
                  Reports
                </p>
                <button
                  onClick={() => { navigate('/profit-loss'); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg mb-2"
                >
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Profit & Loss</span>
                </button>
                
                <button
                  onClick={() => { navigate('/balance-sheet'); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg mb-2"
                >
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <span className="font-medium">Balance Sheet</span>
                </button>


                {/* Sales - Coming Soon */}
                <button
                  disabled
                  className="w-full flex items-center justify-between px-4 py-3 text-gray-400 cursor-not-allowed rounded-lg mb-2"
                >
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5" />
                    <span className="font-medium">Sales</span>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                    Soon
                  </span>
                </button>


                {/* CRM - Coming Soon */}
                <button
                  disabled
                  className="w-full flex items-center justify-between px-4 py-3 text-gray-400 cursor-not-allowed rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5" />
                    <span className="font-medium">CRM</span>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                    Soon
                  </span>
                </button>
              </nav>
            </aside>
          </div>
        )}


        {/* Main Content */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {/* Top Navbar */}
          <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 flex-shrink-0 shadow-sm">
            <div className="flex items-center gap-4">
              <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-lg lg:text-xl font-bold text-gray-900">Financial Dashboard</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Real-time insights from Odoo ERP</p>
              </div>
            </div>


            <div className="flex items-center gap-3">
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="hidden lg:flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {username?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700">{username}</span>
              </div>
            </div>
          </header>


          {/* Hero Section with Animations */}
          <div className="flex-1 overflow-y-auto bg-white">
            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 lg:py-20">
              
              {/* Hero Header with Animations */}
              <div className="text-center mb-16">
                {/* Badge Animation */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6 animate-fade-in-down hover:bg-blue-100 transition-colors">
                  <Activity className="w-4 h-4 animate-pulse" />
                  OIG Financial provides advanced reporting solutions
                </div>
                
                {/* Main Heading with Animation */}
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight animate-fade-in-up animation-delay-200">
                  Your Financial Reports - 
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent animate-gradient">
                    built from Odoo ERP
                  </span>
                </h1>
                
                {/* Description with Animation */}
                <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed animate-fade-in-up animation-delay-400">
                  OIG Financial transforms complex Odoo data into clear, organized reports — 
                  providing real-time insights, automated updates, and comprehensive analytics 
                  for one-click access to your financial position.
                </p>


                {/* CTA Button with Animation */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-600">
                  <button
                    onClick={() => navigate('/profit-loss')}
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2"
                  >
                    Get Started with Reports
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>


              {/* Main Report Cards Section with Stagger Animation */}
              <div className="mb-16">
                <div className="flex items-center justify-between mb-8 animate-fade-in-up animation-delay-800">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Available Reports</h2>
                    <p className="text-gray-600">Access comprehensive financial reports and real-time analytics</p>
                  </div>
                </div>


                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Profit & Loss Card with Animation */}
                  <div
                    onClick={() => navigate('/profit-loss')}
                    className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-blue-400 hover:shadow-2xl transition-all cursor-pointer group animate-fade-in-up animation-delay-1000 hover:scale-105"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <BarChart3 className="w-8 h-8 text-white" />
                      </div>
                      <span className="px-4 py-2 bg-green-50 text-green-700 text-sm font-semibold rounded-full border border-green-200 animate-pulse">
                        Available
                      </span>
                    </div>


                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Profit & Loss Statement</h3>
                    <p className="text-gray-600 mb-6">
                      Comprehensive income and expense analysis with drill-down capabilities
                    </p>


                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        Revenue Analysis
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        Cost Breakdown
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        YoY Comparison
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        KPI Metrics
                      </div>
                    </div>


                    <div className="mt-6 flex items-center text-blue-600 font-semibold group-hover:gap-3 transition-all">
                      View Report
                      <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>


                  {/* Balance Sheet Card with Animation */}
                  <div
                    onClick={() => navigate('/balance-sheet')}
                    className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-indigo-400 hover:shadow-2xl transition-all cursor-pointer group animate-fade-in-up animation-delay-1200 hover:scale-105"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <FileText className="w-8 h-8 text-white" />
                      </div>
                      <span className="px-4 py-2 bg-green-50 text-green-700 text-sm font-semibold rounded-full border border-green-200 animate-pulse">
                        Available
                      </span>
                    </div>


                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Balance Sheet</h3>
                    <p className="text-gray-600 mb-6">
                      Complete financial position overview with asset and liability tracking
                    </p>


                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                        Assets Overview
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                        Liabilities
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                        Equity Details
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                        Verification
                      </div>
                    </div>


                    <div className="mt-6 flex items-center text-indigo-600 font-semibold group-hover:gap-3 transition-all">
                      View Report
                      <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>


              {/* Why Choose Section with Animation */}
              <div className="mb-16">
                <div className="text-center mb-12 animate-fade-in-up animation-delay-1400">
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                    Why Choose OIG Financial?
                  </h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Automate, connect, and optimize your workflow with an intelligent platform 
                    that delivers real productivity
                  </p>
                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {/* Feature 1 */}
                  <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-2xl hover:scale-105 transition-all animate-fade-in-up animation-delay-1600">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg hover:rotate-6 transition-transform">
                      <Zap className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Real-Time Sync</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Live data from Odoo ERP with automatic updates every 5 minutes. 
                      Never miss critical financial changes.
                    </p>
                  </div>


                  {/* Feature 2 */}
                  <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-2xl hover:scale-105 transition-all animate-fade-in-up animation-delay-1800">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg hover:rotate-6 transition-transform">
                      <BarChart3 className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Advanced Analytics</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Interactive charts with drill-down capabilities, comparisons, 
                      and customizable date ranges.
                    </p>
                  </div>


                  {/* Feature 3 */}
                  <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-2xl hover:scale-105 transition-all animate-fade-in-up animation-delay-2000">
                    <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg hover:rotate-6 transition-transform">
                      <Smartphone className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Responsive Design</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Access your financial reports from any device - desktop, tablet, 
                      or mobile with seamless experience.
                    </p>
                  </div>


                  {/* Feature 4 */}
                  <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-2xl hover:scale-105 transition-all animate-fade-in-up animation-delay-2200">
                    <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg hover:rotate-6 transition-transform">
                      <Activity className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Live KPI Tracking</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Monitor key performance indicators in real-time with customizable 
                      alerts and notifications.
                    </p>
                  </div>
                </div>
              </div>


            </div>
          </div>
        </main>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .animate-fade-in-down {
          animation: fadeInDown 0.6s ease-out forwards;
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.7s ease-out forwards;
          opacity: 0;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradientShift 3s ease infinite;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
        }

        .animation-delay-600 {
          animation-delay: 0.6s;
        }

        .animation-delay-800 {
          animation-delay: 0.8s;
        }

        .animation-delay-1000 {
          animation-delay: 1s;
        }

        .animation-delay-1200 {
          animation-delay: 1.2s;
        }

        .animation-delay-1400 {
          animation-delay: 1.4s;
        }

        .animation-delay-1600 {
          animation-delay: 1.6s;
        }

        .animation-delay-1800 {
          animation-delay: 1.8s;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-2200 {
          animation-delay: 2.2s;
        }
      `}</style>
    </div>
  );
}

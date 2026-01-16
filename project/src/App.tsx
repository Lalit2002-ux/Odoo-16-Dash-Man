import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { BalanceSheetPage } from './components/BalanceSheetPage';
import { BalanceSheetDetailPage } from './components/BalanceSheetDetailPage';
import { ProfitLossPage } from './components/ProfitLossPage';

// Private Route wrapper component
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* ✅ Login Route - Redirect to dashboard if already logged in */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
        />

        {/* ✅ Dashboard Route (Protected) */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* ✅ Profit & Loss Route (Protected) */}
        <Route
          path="/profit-loss"
          element={
            <PrivateRoute>
              <ProfitLossPage />
            </PrivateRoute>
          }
        />

        {/* ✅ Balance Sheet Route (Protected) */}
        <Route
          path="/balance-sheet"
          element={
            <PrivateRoute>
              <BalanceSheetPage />
            </PrivateRoute>
          }
        />

        {/* ✅ Balance Sheet Detail Route (Protected) */}
        <Route
          path="/balance-sheet/:category"
          element={
            <PrivateRoute>
              <BalanceSheetDetailPage />
            </PrivateRoute>
          }
        />

        {/* ✅ ROOT REDIRECT - Go to login if not authenticated */}
        <Route 
          path="/" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
        />

        {/* ✅ Catch all - redirect based on auth status */}
        <Route 
          path="*" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { useState, useEffect } from 'react';
import { X, Loader2, Calendar, FileText, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { odooApi, JournalEntry } from '../services/odooApi';
import { formatCurrency } from '../utils/accountGrouping';

interface AccountTransactionModalProps {
  accountId: number;
  accountCode: string;
  accountName: string;
  date: string;
  onClose: () => void;
}

export function AccountTransactionModal({
  accountId,
  accountCode,
  accountName,
  date,
  onClose,
}: AccountTransactionModalProps) {
  const { uid, password } = useAuth();
  const [transactions, setTransactions] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, [accountId, date]); // ✅ Added date dependency

  const fetchTransactions = async () => {
    if (!uid || !password) return;
    
    setLoading(true);
    setError('');
    
    try {
      console.log(`📋 Fetching transactions for account ${accountId} up to ${date}`); // Debug log
      
      // ✅ FIXED: Use getAccountTransactions instead of getJournalEntries
      const res = await odooApi.getAccountTransactions(
        uid!,
        password!,
        accountId,
        date // Pass the full date like "2026-01-10"
      );
      
      if (res.success && res.data) {
        console.log(`✅ Loaded ${res.data.length} transactions`); // Debug log
        setTransactions(res.data);
      } else {
        console.error('❌ Failed to fetch transactions:', res.error);
        setError(res.error || 'Failed to fetch transactions');
      }
    } catch (e) {
      console.error('❌ Error fetching transactions:', e);
      setError(e instanceof Error ? e.message : 'Error fetching transactions');
    } finally {
      setLoading(false);
    }
  };

  // ... rest of your component stays the same


  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700/50 max-w-6xl w-full max-h-[90vh] overflow-hidden animate-zoomIn">
        {/* Header */}
        <div className="bg-gray-800/50 backdrop-blur-xl p-6 border-b border-gray-700/50 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <FileText className="w-6 h-6 text-blue-400" />
              Account Transactions
            </h2>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-sm font-mono text-gray-400 bg-gray-700/50 px-3 py-1 rounded">
                {accountCode}
              </span>
              <span className="text-sm text-gray-300">{accountName}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700/50 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
              <p className="text-gray-400">Loading transactions...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {!loading && !error && transactions.length === 0 && (
            <div className="text-center py-20">
              <div className="bg-gray-800/50 backdrop-blur-xl p-8 rounded-2xl border border-gray-700/50 inline-block">
                <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No transactions found for this account.</p>
              </div>
            </div>
          )}

          {!loading && !error && transactions.length > 0 && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl p-4 rounded-xl border border-blue-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <span className="text-sm text-gray-300">Total Transactions:</span>
                    <span className="text-lg font-bold text-white">{transactions.length}</span>
                  </div>
                  <div className="flex gap-6">
                    <div>
                      <span className="text-xs text-gray-400">Total Debit</span>
                      <p className="text-sm font-semibold text-green-400">
                        {formatCurrency(transactions.reduce((sum, t) => sum + t.debit, 0))}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400">Total Credit</span>
                      <p className="text-sm font-semibold text-orange-400">
                        {formatCurrency(transactions.reduce((sum, t) => sum + t.credit, 0))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-xl border border-gray-700/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700/50 border-b border-gray-600/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300">Journal Entry</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300">Journal</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300">Partner</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300">Label</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300">Reference</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-300">Debit</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-300">Credit</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-300">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/50">
                      {transactions.map((transaction, index) => (
                        <tr
                          key={transaction.id}
                          className="hover:bg-gray-700/30 transition-colors animate-fadeIn"
                          style={{ animationDelay: `${index * 0.02}s` }}
                        >
                          <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(transaction.date).toLocaleDateString('en-US')}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-blue-400 font-mono whitespace-nowrap">
                            {transaction.move_name}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-300 whitespace-nowrap">
                            {transaction.journal_name}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-300">
                            {transaction.partner_name && (
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {transaction.partner_name}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-300 max-w-xs truncate">
                            {transaction.label}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-400 font-mono whitespace-nowrap">
                            {transaction.ref}
                          </td>
                          <td className="px-4 py-3 text-xs text-right font-semibold text-green-400 whitespace-nowrap">
                            {transaction.debit > 0 ? formatCurrency(transaction.debit) : '-'}
                          </td>
                          <td className="px-4 py-3 text-xs text-right font-semibold text-orange-400 whitespace-nowrap">
                            {transaction.credit > 0 ? formatCurrency(transaction.credit) : '-'}
                          </td>
                          <td className={`px-4 py-3 text-xs text-right font-semibold whitespace-nowrap ${
                            transaction.balance < 0 ? 'text-red-400' : 'text-blue-400'
                          }`}>
                            {formatCurrency(transaction.balance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-800/50 backdrop-blur-xl p-4 border-t border-gray-700/50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-300 hover:scale-105"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }

        .animate-zoomIn {
          animation: zoomIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaChartLine, FaExchangeAlt, FaSearch, FaFilter, 
  FaRegClock, FaCaretUp, FaCaretDown, FaMoon, FaSun 
} from 'react-icons/fa';
import { useTheme } from 'next-themes';

export default function TransactionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'buy', 'sell', 'deposit', 'withdraw'
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchTransactions();
    }
  }, [status, router]);

  const fetchTransactions = async () => {
    try {
      // In a real app, you would fetch transactions from an API
      // Mocking data for demo purposes
      const mockTransactions = [
        {
          id: '1',
          type: 'BUY',
          symbol: 'AAPL',
          companyName: 'Apple Inc.',
          quantity: 5,
          price: 150.75,
          total: 753.75,
          timestamp: '2023-09-15T13:45:00Z'
        },
        {
          id: '2',
          type: 'SELL',
          symbol: 'MSFT',
          companyName: 'Microsoft Corporation',
          quantity: 2,
          price: 415.26,
          total: 830.52,
          timestamp: '2023-09-10T10:22:00Z'
        },
        {
          id: '3',
          type: 'DEPOSIT',
          amount: 5000,
          reference: 'Bank Transfer',
          timestamp: '2023-09-05T09:15:00Z'
        },
        {
          id: '4',
          type: 'BUY',
          symbol: 'GOOGL',
          companyName: 'Alphabet Inc.',
          quantity: 8,
          price: 180.45,
          total: 1443.60,
          timestamp: '2023-09-01T14:30:00Z'
        },
        {
          id: '5',
          type: 'WITHDRAW',
          amount: 1000,
          reference: 'Bank Account',
          timestamp: '2023-08-25T11:10:00Z'
        },
        {
          id: '6',
          type: 'SELL',
          symbol: 'AMZN',
          companyName: 'Amazon.com Inc.',
          quantity: 3,
          price: 182.57,
          total: 547.71,
          timestamp: '2023-08-20T16:05:00Z'
        },
        {
          id: '7',
          type: 'BUY',
          symbol: 'TSLA',
          companyName: 'Tesla Inc.',
          quantity: 10,
          price: 175.34,
          total: 1753.40,
          timestamp: '2023-08-15T13:30:00Z'
        },
        {
          id: '8',
          type: 'DEPOSIT',
          amount: 2500,
          reference: 'Credit Card',
          timestamp: '2023-08-10T09:45:00Z'
        },
        {
          id: '9',
          type: 'BUY',
          symbol: 'NVDA',
          companyName: 'NVIDIA Corporation',
          quantity: 4,
          price: 950.02,
          total: 3800.08,
          timestamp: '2023-08-05T10:15:00Z'
        },
        {
          id: '10',
          type: 'WITHDRAW',
          amount: 500,
          reference: 'Bank Account',
          timestamp: '2023-07-28T14:20:00Z'
        },
        {
          id: '11',
          type: 'SELL',
          symbol: 'NFLX',
          companyName: 'Netflix Inc.',
          quantity: 6,
          price: 627.98,
          total: 3767.88,
          timestamp: '2023-07-20T11:35:00Z'
        },
        {
          id: '12',
          type: 'BUY',
          symbol: 'JPM',
          companyName: 'JPMorgan Chase & Co.',
          quantity: 7,
          price: 201.43,
          total: 1410.01,
          timestamp: '2023-07-15T15:50:00Z'
        },
      ];
      
      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getFilteredTransactions = () => {
    let result = [...transactions];
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(transaction => {
        if (transaction.type === 'BUY' || transaction.type === 'SELL') {
          return (
            transaction.symbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            transaction.companyName?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        return transaction.reference?.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }
    
    // Apply type filter
    if (filterType !== 'all') {
      result = result.filter(transaction => transaction.type.toLowerCase() === filterType);
    }
    
    return result;
  };

  const filteredTransactions = getFilteredTransactions();
  
  // Pagination
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading your transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <FaChartLine className="text-blue-600 text-2xl" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">NextStocks</h1>
          </div>
          <div className="flex items-center">
            <nav className="flex items-center space-x-6 mr-4">
              <Link href="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                Dashboard
              </Link>
              <Link href="/stocks" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                Stocks
              </Link>
              <Link href="/portfolio" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                Portfolio
              </Link>
              <Link href="/profile" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                Profile
              </Link>
            </nav>
            
            {/* Theme Toggle Button */}
            <button
              aria-label="Toggle Dark Mode"
              type="button"
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              onClick={() => mounted && setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {mounted && (
                theme === 'dark' ? (
                  <FaSun className="h-5 w-5 text-yellow-400" />
                ) : (
                  <FaMoon className="h-5 w-5 text-gray-700" />
                )
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="heading-1 mb-2">Transaction History</h2>
          <p className="text-gray-600 dark:text-gray-300">View your recent transactions and account activity</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="relative md:w-1/3">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="input-field pl-10"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button 
                className={`px-4 py-2 rounded-lg text-sm font-medium ${filterType === 'all' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                onClick={() => setFilterType('all')}
              >
                All
              </button>
              <button 
                className={`px-4 py-2 rounded-lg text-sm font-medium ${filterType === 'buy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                onClick={() => setFilterType('buy')}
              >
                Buy Orders
              </button>
              <button 
                className={`px-4 py-2 rounded-lg text-sm font-medium ${filterType === 'sell' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                onClick={() => setFilterType('sell')}
              >
                Sell Orders
              </button>
              <button 
                className={`px-4 py-2 rounded-lg text-sm font-medium ${filterType === 'deposit' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                onClick={() => setFilterType('deposit')}
              >
                Deposits
              </button>
              <button 
                className={`px-4 py-2 rounded-lg text-sm font-medium ${filterType === 'withdraw' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                onClick={() => setFilterType('withdraw')}
              >
                Withdrawals
              </button>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          {currentTransactions.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Details
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Date & Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {currentTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.type === 'BUY' 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                              : transaction.type === 'SELL'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : transaction.type === 'DEPOSIT'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                  : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          }`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {transaction.type === 'BUY' || transaction.type === 'SELL' ? (
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {transaction.quantity} shares of {transaction.symbol}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {transaction.companyName} at {formatCurrency(transaction.price)} per share
                              </div>
                            </div>
                          ) : (
                            <div className="text-gray-900 dark:text-white">
                              {transaction.type === 'DEPOSIT' ? 'Funds deposited from' : 'Funds withdrawn to'} {transaction.reference}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className={`text-sm font-medium ${
                            transaction.type === 'DEPOSIT' || transaction.type === 'SELL'
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {transaction.type === 'DEPOSIT' || transaction.type === 'SELL'
                              ? <FaCaretUp className="inline mr-1" />
                              : <FaCaretDown className="inline mr-1" />
                            }
                            {formatCurrency(transaction.type === 'DEPOSIT' || transaction.type === 'WITHDRAW' 
                              ? transaction.amount 
                              : transaction.total
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(transaction.timestamp)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex items-center justify-between">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Showing <span className="font-medium">{indexOfFirstTransaction + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(indexOfLastTransaction, filteredTransactions.length)}
                    </span>{' '}
                    of <span className="font-medium">{filteredTransactions.length}</span> results
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === 1
                          ? 'bg-gray-200 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500'
                      }`}
                    >
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => paginate(i + 1)}
                        className={`px-3 py-1 rounded-md ${
                          currentPage === i + 1
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === totalPages
                          ? 'bg-gray-200 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-8 px-6 text-center">
              <FaRegClock className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No transactions found</h3>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                {searchQuery || filterType !== 'all'
                  ? 'Try adjusting your search or filter to find what you\'re looking for.'
                  : 'You haven\'t made any transactions yet. Start trading to see your history here.'}
              </p>
              <div className="mt-6">
                <Link href="/stocks" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                  Browse Stocks
                  <span aria-hidden="true"> &rarr;</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 
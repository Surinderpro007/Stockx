'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaChartLine, FaWallet, FaExchangeAlt, FaChartBar, 
  FaArrowUp, FaArrowDown, FaPlus, FaSearch, FaRegClock,
  FaMoon, FaSun
} from 'react-icons/fa';
import { useTheme } from 'next-themes';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [marketOverview, setMarketOverview] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [marketStatus, setMarketStatus] = useState<'open' | 'closed'>('closed');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchUserData();
      fetchMarketOverview();
      fetchRecentTransactions();
      checkMarketStatus();
    }
  }, [status, router]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user');
      const userData = await response.json();
      setUserData(userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchMarketOverview = async () => {
    try {
      // In a real app, fetch from an API
      // Mock data for demonstration
      setMarketOverview([
        { symbol: 'AAPL', name: 'Apple Inc.', price: '175.42', change: '+2.35', changePercent: '+1.36%' },
        { symbol: 'MSFT', name: 'Microsoft Corp.', price: '415.26', change: '+3.91', changePercent: '+0.95%' },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', price: '174.12', change: '-1.53', changePercent: '-0.87%' },
        { symbol: 'NVDA', name: 'NVIDIA Corp.', price: '950.02', change: '+24.31', changePercent: '+2.63%' },
      ]);
    } catch (error) {
      console.error('Error fetching market overview:', error);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      // In a real app, fetch from an API
      // Mock data for demonstration
      setRecentTransactions([
        { 
          id: '1', 
          type: 'BUY', 
          symbol: 'AAPL', 
          quantity: 5, 
          price: 150.75, 
          total: 753.75, 
          date: '2023-09-15T13:45:00Z' 
        },
        { 
          id: '2', 
          type: 'SELL', 
          symbol: 'MSFT', 
          quantity: 2, 
          price: 415.26, 
          total: 830.52, 
          date: '2023-09-10T10:22:00Z' 
        },
        { 
          id: '3', 
          type: 'DEPOSIT', 
          amount: 5000, 
          date: '2023-09-05T09:15:00Z' 
        },
        { 
          id: '4', 
          type: 'BUY', 
          symbol: 'GOOGL', 
          quantity: 8, 
          price: 180.45, 
          total: 1443.60, 
          date: '2023-09-01T14:30:00Z' 
        },
      ]);
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkMarketStatus = () => {
    // In a real app, you would fetch this from a market API
    // For demo purposes, we'll check if it's a weekday and between 9:30 AM and 4:00 PM EST
    
    const now = new Date();
    const day = now.getDay(); // 0 is Sunday, 6 is Saturday
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 60 + minutes; // Time in minutes since midnight
    
    // Market hours: 9:30 AM to 4:00 PM EST (570 to 960 minutes)
    const marketOpen = 570; // 9:30 AM
    const marketClose = 960; // 4:00 PM
    
    // Check if it's a weekday (Monday-Friday) and within market hours
    const isWeekday = day >= 1 && day <= 5;
    const isDuringMarketHours = currentTime >= marketOpen && currentTime <= marketClose;
    
    setMarketStatus(isWeekday && isDuringMarketHours ? 'open' : 'closed');
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading your dashboard...</p>
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
              <Link href="/dashboard" className="text-blue-600 font-medium">
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
        {/* Greeting */}
        <div className="mb-8">
          <h2 className="heading-1 mb-2">Welcome, {userData?.name || 'Investor'}</h2>
          <div className="flex items-center">
            <p className="text-gray-600 dark:text-gray-300">Here's an overview of your portfolio and the market today.</p>
            <div className="ml-4 flex items-center">
              <span className={`inline-block h-2.5 w-2.5 rounded-full mr-2 ${
                marketStatus === 'open' 
                  ? 'bg-green-500 animate-pulse' 
                  : 'bg-red-500'
              }`}></span>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Market is {marketStatus === 'open' ? 'open' : 'closed'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-center mb-2">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <FaWallet className="text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Balance</h3>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(userData?.accountBalance || 0)}</p>
              </div>
            </div>
            <div className="mt-2 flex space-x-2">
              <Link 
                href="/deposit" 
                className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded-md flex items-center"
              >
                <FaPlus className="mr-1" /> Deposit
              </Link>
              <Link 
                href="/withdraw" 
                className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded-md flex items-center"
              >
                <FaArrowDown className="mr-1" /> Withdraw
              </Link>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-center mb-2">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <FaChartBar className="text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Portfolio Value</h3>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(8605.53)}</p>
              </div>
            </div>
            <div className="mt-2">
              <Link 
                href="/portfolio" 
                className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded-md flex items-center inline-flex"
              >
                <FaChartBar className="mr-1" /> View Portfolio
              </Link>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-center mb-2">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <FaExchangeAlt className="text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Recent Activity</h3>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{recentTransactions.length} Transactions</p>
              </div>
            </div>
            <div className="mt-2">
              <Link 
                href="/transactions" 
                className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 px-2 py-1 rounded-md flex items-center inline-flex"
              >
                <FaRegClock className="mr-1" /> View History
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link 
              href="/stocks" 
              className="flex flex-col items-center justify-center bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 p-4 rounded-lg transition-colors"
            >
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-2">
                <FaSearch className="text-blue-600 dark:text-blue-400 text-xl" />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Buy Stocks</span>
            </Link>
            
            <Link 
              href="/portfolio" 
              className="flex flex-col items-center justify-center bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 p-4 rounded-lg transition-colors"
            >
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-2">
                <FaExchangeAlt className="text-green-600 dark:text-green-400 text-xl" />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Sell Stocks</span>
            </Link>
            
            <Link 
              href="/deposit" 
              className="flex flex-col items-center justify-center bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 p-4 rounded-lg transition-colors"
            >
              <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center mb-2">
                <FaPlus className="text-yellow-600 dark:text-yellow-400 text-xl" />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Deposit</span>
            </Link>
            
            <Link 
              href="/calculator" 
              className="flex flex-col items-center justify-center bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 p-4 rounded-lg transition-colors"
            >
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-2">
                <FaChartLine className="text-purple-600 dark:text-purple-400 text-xl" />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">SIP Calculator</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Market Overview */}
          <div>
            <h3 className="heading-2 mb-4 flex items-center">
              Market Overview
              <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                marketStatus === 'open' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${marketStatus === 'open' ? 'bg-green-500' : 'bg-red-500'} mr-1`}></span>
                {marketStatus === 'open' ? 'Live' : 'Closed'}
              </span>
            </h3>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Symbol</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Change</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {marketOverview.map((stock) => (
                      <tr key={stock.symbol} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link href={`/stocks/${stock.symbol.toLowerCase()}`} className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                            {stock.symbol}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{stock.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">${stock.price}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            stock.change.startsWith('+') 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {stock.change.startsWith('+') ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
                            {stock.changePercent}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-right">
                <Link href="/stocks" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  View all stocks →
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div>
            <h3 className="heading-2 mb-4">Recent Transactions</h3>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              <div className="overflow-y-auto" style={{ maxHeight: '320px' }}>
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Details</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {recentTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.type === 'BUY' 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                              : transaction.type === 'SELL'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {transaction.type === 'DEPOSIT' ? (
                            <div className="text-sm text-gray-900 dark:text-white">
                              Funds deposited to account
                            </div>
                          ) : (
                            <div className="text-sm text-gray-900 dark:text-white">
                              {transaction.quantity} shares of {transaction.symbol} at ${transaction.price}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {transaction.type === 'DEPOSIT' 
                              ? formatCurrency(transaction.amount)
                              : formatCurrency(transaction.total)
                            }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(transaction.date)}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-right">
                <Link href="/transactions" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  View all transactions →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 
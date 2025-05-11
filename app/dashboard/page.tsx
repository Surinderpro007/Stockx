'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaChartLine, FaWallet, FaExchangeAlt, FaChartBar, 
  FaArrowUp, FaArrowDown, FaPlus, FaSearch, FaRegClock,
  FaMoon, FaSun, FaMoneyBillWave
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
              <Link href="/deposit" className="btn-light-sm flex-1 text-center flex items-center justify-center">
                <FaPlus className="mr-1" /> Add Funds
              </Link>
              <Link href="/withdraw" className="btn-light-sm flex-1 text-center flex items-center justify-center">
                <FaMoneyBillWave className="mr-1" /> Withdraw
              </Link>
              <Link href="/stocks" className="btn-primary-sm flex-1 text-center flex items-center justify-center">
                <FaExchangeAlt className="mr-1" /> Trade
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
                <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(15784.25)}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Daily Change</span>
                <span className="text-green-600 font-medium">+$345.67 (2.24%)</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                <div className="bg-green-600 h-1.5 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-center mb-2">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <FaRegClock className="text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Recent Activity</h3>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{recentTransactions.length} Transactions</p>
              </div>
            </div>
            <div className="mt-4">
              {recentTransactions.slice(0, 1).map((tx, i) => (
                <div key={i} className="text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      {tx.type === 'BUY' && `Bought ${tx.quantity} ${tx.symbol}`}
                      {tx.type === 'SELL' && `Sold ${tx.quantity} ${tx.symbol}`}
                      {tx.type === 'DEPOSIT' && 'Deposited funds'}
                    </span>
                    <span className={`font-medium ${tx.type === 'SELL' || tx.type === 'DEPOSIT' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.type === 'SELL' || tx.type === 'DEPOSIT' ? '+' : '-'}
                      {formatCurrency(tx.total || tx.amount)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{formatDate(tx.date)}</span>
                </div>
              ))}
              <Link href="/transactions" className="btn-link text-sm mt-2 block text-center">
                View All Transactions
              </Link>
            </div>
          </div>
        </div>
        
        {/* Market Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Market Overview</h3>
            <div className="flex items-center">
              <div className="relative mr-4">
                <input 
                  type="text" 
                  placeholder="Search stocks..." 
                  className="w-64 pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <Link href="/stocks" className="btn-primary-sm">
                View All
              </Link>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Symbol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Change
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {marketOverview.map((stock, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900 dark:text-white">{stock.symbol}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                      {stock.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900 dark:text-white font-medium">
                      ${stock.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={`inline-flex items-center ${stock.change.startsWith('-') ? 'text-red-600' : 'text-green-600'}`}>
                        {stock.change.startsWith('-') ? (
                          <FaArrowDown className="mr-1 h-3 w-3" />
                        ) : (
                          <FaArrowUp className="mr-1 h-3 w-3" />
                        )}
                        {stock.change} ({stock.changePercent})
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Link href={`/stocks/${stock.symbol}`} className="btn-light-xs">
                        Trade
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Recent Transactions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
            <Link href="/transactions" className="btn-primary-sm">
              View All
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {recentTransactions.map((tx, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                          tx.type === 'BUY' 
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' 
                            : tx.type === 'SELL'
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                              : tx.type === 'DEPOSIT'
                                ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                                : 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                      {tx.type === 'BUY' && `Bought ${tx.quantity} shares of ${tx.symbol}`}
                      {tx.type === 'SELL' && `Sold ${tx.quantity} shares of ${tx.symbol}`}
                      {tx.type === 'DEPOSIT' && 'Added funds to account'}
                      {tx.type === 'WITHDRAWAL' && 'Withdrew funds from account'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                      <span className={tx.type === 'SELL' || tx.type === 'DEPOSIT' ? 'text-green-600' : 'text-red-600'}>
                        {tx.type === 'SELL' || tx.type === 'DEPOSIT' ? '+' : '-'}
                        {formatCurrency(tx.total || tx.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-500 dark:text-gray-400">
                      {formatDate(tx.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
} 
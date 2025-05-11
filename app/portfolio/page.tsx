'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaChartLine, FaHome, FaChartBar, FaList, FaCaretUp, FaCaretDown, FaEye, FaMoon, FaSun } from 'react-icons/fa';
import { useTheme } from 'next-themes';

export default function PortfolioPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [portfolioData, setPortfolioData] = useState<any>({
    accountBalance: 0,
    totalInvestment: 0,
    totalCurrentValue: 0,
    totalGainLoss: 0,
    totalGainLossPercent: 0,
    stocks: []
  });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'all' | 'gainers' | 'losers'>('all');

  useEffect(() => {
    setMounted(true);
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchPortfolioData();
    }
  }, [status, router]);

  const fetchPortfolioData = async () => {
    try {
      // Fetch real user data from API
      const response = await fetch('/api/user');
      const userData = await response.json();
      
      if (!userData) {
        setLoading(false);
        return;
      }
      
      console.log('Fetched portfolio data:', userData);
      
      // Use actual portfolio data from user
      const userStocks = userData.portfolio || [];
      
      // For each stock in the portfolio, fetch current price
      // In a real app, you would fetch this from a stock API
      // Here we're generating random prices for demo
      const portfolioStocks = userStocks.map((stock: any) => {
        // Generate a random current price with ±15% from average buy price
        const priceChange = (Math.random() * 0.3) - 0.15;
        const currentPrice = stock.avgBuyPrice * (1 + priceChange);
        
        const value = stock.quantity * currentPrice;
        const cost = stock.quantity * stock.avgBuyPrice;
        const gainLoss = value - cost;
        const gainLossPercent = cost > 0 ? (gainLoss / cost) * 100 : 0;
        
        return {
          symbol: stock.symbol,
          companyName: stock.companyName,
          quantity: stock.quantity,
          avgBuyPrice: stock.avgBuyPrice,
          currentPrice: currentPrice,
          value: value,
          cost: cost,
          gainLoss: gainLoss,
          gainLossPercent: gainLossPercent
        };
      });
      
      const totalInvestment = portfolioStocks.reduce((sum, stock) => sum + stock.cost, 0);
      const totalCurrentValue = portfolioStocks.reduce((sum, stock) => sum + stock.value, 0);
      const totalGainLoss = totalCurrentValue - totalInvestment;
      const totalGainLossPercent = totalInvestment > 0 ? (totalGainLoss / totalInvestment) * 100 : 0;
      
      setPortfolioData({
        accountBalance: userData.accountBalance || 0,
        totalInvestment,
        totalCurrentValue,
        totalGainLoss,
        totalGainLossPercent,
        stocks: portfolioStocks
      });
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredStocks = () => {
    if (viewMode === 'gainers') {
      return portfolioData.stocks.filter((stock: any) => stock.gainLoss > 0);
    } else if (viewMode === 'losers') {
      return portfolioData.stocks.filter((stock: any) => stock.gainLoss < 0);
    }
    return portfolioData.stocks;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading your portfolio...</p>
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
              <Link href="/portfolio" className="text-blue-600 font-medium">
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Portfolio</h1>
          <p className="text-gray-600 dark:text-gray-300">Track your investments and performance</p>
        </div>
        
        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Account Balance</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(portfolioData.accountBalance)}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Available for trading</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Invested Amount</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(portfolioData.totalInvestment)}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Cost basis</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Current Value</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(portfolioData.totalCurrentValue)}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Market value</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Gain/Loss</h3>
            <p className={`text-2xl font-bold ${portfolioData.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(portfolioData.totalGainLoss)} ({formatPercentage(portfolioData.totalGainLossPercent)})
            </p>
            <div className="flex items-center mt-1">
              <span className={`inline-block h-2 w-2 rounded-full mr-1 ${
                portfolioData.totalGainLoss >= 0 ? 'bg-green-600' : 'bg-red-600'
              }`}></span>
              <span className="text-sm text-gray-500 dark:text-gray-400">Overall return</span>
            </div>
          </div>
        </div>
        
        {/* View Toggles */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-0">Portfolio Holdings</h2>
          <div className="inline-flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                viewMode === 'all' 
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              onClick={() => setViewMode('all')}
            >
              <FaList className="inline mr-1" /> All
            </button>
            <button
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                viewMode === 'gainers' 
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              onClick={() => setViewMode('gainers')}
            >
              <FaCaretUp className="inline mr-1 text-green-600" /> Gainers
            </button>
            <button
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                viewMode === 'losers' 
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              onClick={() => setViewMode('losers')}
            >
              <FaCaretDown className="inline mr-1 text-red-600" /> Losers
            </button>
          </div>
        </div>
        
        {/* Holdings Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-8">
          {getFilteredStocks().length === 0 ? (
            <div className="text-center py-16 px-4">
              {portfolioData.stocks.length === 0 ? (
                <>
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No stocks in your portfolio</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">Start building your portfolio by buying some stocks.</p>
                  <Link href="/stocks" className="btn-primary inline-block">
                    Explore Stocks
                  </Link>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No {viewMode} in your portfolio</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">Try changing the filter to see more stocks.</p>
                  <button 
                    onClick={() => setViewMode('all')} 
                    className="btn-light inline-block"
                  >
                    View All Stocks
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Stock
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Avg. Cost
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Current Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Market Value
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Gain/Loss
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {getFilteredStocks().map((stock: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {stock.symbol}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {stock.companyName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900 dark:text-white">
                        {stock.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                        {formatCurrency(stock.avgBuyPrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(stock.currentPrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(stock.value)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className={`text-sm font-medium ${stock.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(stock.gainLoss)}
                        </div>
                        <div className={`text-xs ${stock.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {stock.gainLoss >= 0 ? '+' : ''}{formatPercentage(stock.gainLossPercent)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Link href={`/stocks/${stock.symbol}`} className="btn-light-xs">
                          <FaEye className="inline-block mr-1" />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 
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
          <h2 className="heading-1 mb-4">My Portfolio</h2>
          <p className="text-gray-600 dark:text-gray-300">Track your investments and performance</p>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Account Balance</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(portfolioData.accountBalance)}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Available for trading</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Investment</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(portfolioData.totalInvestment)}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Cost basis of all holdings</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Current Value</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(portfolioData.totalCurrentValue)}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Market value of holdings</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Gain/Loss</h3>
            <div className="flex items-center">
              <p className={`text-2xl font-bold ${portfolioData.totalGainLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrency(portfolioData.totalGainLoss)}
              </p>
              <span className={`ml-2 text-sm font-medium ${portfolioData.totalGainLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {portfolioData.totalGainLoss >= 0 ? <FaCaretUp className="inline" /> : <FaCaretDown className="inline" />}
                {formatPercentage(portfolioData.totalGainLossPercent)}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Overall performance</p>
          </div>
        </div>

        {/* Portfolio Holdings */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <h3 className="heading-2 mb-2 sm:mb-0">My Holdings</h3>
            <div className="flex space-x-2">
              <button 
                onClick={() => setViewMode('all')} 
                className={`px-4 py-2 rounded-lg text-sm font-medium ${viewMode === 'all' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}
              >
                All
              </button>
              <button 
                onClick={() => setViewMode('gainers')} 
                className={`px-4 py-2 rounded-lg text-sm font-medium ${viewMode === 'gainers' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}
              >
                Gainers
              </button>
              <button 
                onClick={() => setViewMode('losers')} 
                className={`px-4 py-2 rounded-lg text-sm font-medium ${viewMode === 'losers' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}
              >
                Losers
              </button>
            </div>
          </div>

          {portfolioData.stocks.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
                <FaChartBar className="text-blue-600 dark:text-blue-400 text-2xl" />
              </div>
              <h3 className="heading-3 mb-2">No Stocks in Your Portfolio</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Start building your portfolio by buying some stocks.</p>
              <Link href="/stocks" className="btn-primary py-2 px-6">
                Browse Stocks
              </Link>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stock</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantity</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Avg. Buy Price</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Current Price</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Market Value</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Gain/Loss</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {getFilteredStocks().map((stock: any) => (
                      <tr key={stock.symbol} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">{stock.symbol}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{stock.companyName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{stock.quantity}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{formatCurrency(stock.avgBuyPrice)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{formatCurrency(stock.currentPrice)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(stock.value)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`flex items-center text-sm font-medium ${stock.gainLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {stock.gainLoss >= 0 ? <FaCaretUp className="mr-1" /> : <FaCaretDown className="mr-1" />}
                            {formatCurrency(stock.gainLoss)} ({formatPercentage(stock.gainLossPercent)})
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link 
                            href={`/stocks/${stock.symbol.toLowerCase()}`}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                          >
                            <FaEye className="inline mr-1" /> View
                          </Link>
                          <button
                            onClick={() => router.push(`/stocks/${stock.symbol.toLowerCase()}`)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          >
                            Trade
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Mobile View for Portfolio Holdings */}
        <div className="lg:hidden mt-6">
          <div className="grid grid-cols-1 gap-4">
            {getFilteredStocks().length > 0 ? (
              getFilteredStocks().map((stock: any) => (
                <div key={stock.symbol} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{stock.symbol}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{stock.companyName}</p>
                      </div>
                      <div className={`text-sm font-semibold ${stock.gainLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {stock.gainLoss >= 0 ? <FaCaretUp className="inline" /> : <FaCaretDown className="inline" />}
                        {formatPercentage(stock.gainLossPercent)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Quantity</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{stock.quantity}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Market Value</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(stock.value)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Avg. Buy Price</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(stock.avgBuyPrice)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Current Price</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(stock.currentPrice)}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Gain/Loss</p>
                        <p className={`text-sm font-medium ${stock.gainLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {formatCurrency(stock.gainLoss)}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          href={`/stocks/${stock.symbol.toLowerCase()}`}
                          className="text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 py-2 px-3 rounded-lg text-gray-800 dark:text-gray-200"
                        >
                          View
                        </Link>
                        <Link
                          href={`/stocks/${stock.symbol.toLowerCase()}`}
                          className="text-sm bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg"
                        >
                          Trade
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  {viewMode === 'gainers' 
                    ? 'No profitable stocks in your portfolio.' 
                    : viewMode === 'losers' 
                      ? 'No stocks with losses in your portfolio.' 
                      : 'No stocks in your portfolio.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 
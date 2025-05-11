'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  FaChartLine, FaArrowLeft, FaMoneyBillWave, FaExchangeAlt, 
  FaChartBar, FaChartArea, FaWallet, FaTimes,
  FaCaretUp, FaCaretDown, FaMoon, FaSun
} from 'react-icons/fa';
import { useTheme } from 'next-themes';

export default function StockDetail() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const symbol = params.symbol as string;
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  const [stock, setStock] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [transactionType, setTransactionType] = useState<'BUY' | 'SELL'>('BUY');
  const [userPortfolio, setUserPortfolio] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [chartTimePeriod, setChartTimePeriod] = useState<'1d' | '1m' | '6m' | '1y' | 'max'>('1m');
  const [chartStyle, setChartStyle] = useState<'line' | 'candle' | 'area'>('line');
  const [chartData, setChartData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'chart' | 'account'>('chart');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchStockData();
      fetchUserPortfolio();
      generateChartData(chartTimePeriod);
    }
  }, [status, router, symbol]);

  useEffect(() => {
    generateChartData(chartTimePeriod);
  }, [chartTimePeriod]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchStockData = async () => {
    try {
      // In a real app, you would fetch real stock data from an API
      setStock({
        symbol: symbol.toUpperCase(),
        companyName: getCompanyName(symbol),
        price: getRandomPrice(),
        change: getRandomChange(),
        changePercent: getRandomChangePercent(),
        marketCap: getRandomMarketCap(),
        volume: getRandomVolume(),
        avgVolume: getRandomVolume(),
        high: getRandomHighPrice(),
        low: getRandomLowPrice(),
        open: getRandomOpenPrice(),
        previousClose: getRandomPreviousClosePrice(),
      });
    } catch (error) {
      console.error('Error fetching stock data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPortfolio = async () => {
    try {
      // Fetch user data from API
      const response = await fetch('/api/user');
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const userData = await response.json();
      console.log('Fetched user data:', userData);
      
      // Find current stock in portfolio if it exists
      const currentStock = userData.portfolio?.find(
        (stock: any) => stock.symbol === symbol.toUpperCase()
      );
      
      setUserPortfolio({
        accountBalance: userData.accountBalance || 10000,
        stockHoldings: currentStock || null,
        fullPortfolio: userData.portfolio || []
      });
      
      console.log('Updated userPortfolio state with:', {
        balance: userData.accountBalance,
        currentStock: currentStock || 'No holdings for this stock',
        portfolioSize: userData.portfolio?.length || 0
      });
    } catch (error) {
      console.error('Error fetching user portfolio:', error);
    }
  };

  // Mock data generators for demo
  const getCompanyName = (symbol: string) => {
    const companyNames: {[key: string]: string} = {
      'aapl': 'Apple Inc.',
      'msft': 'Microsoft Corporation',
      'googl': 'Alphabet Inc.',
      'amzn': 'Amazon.com Inc.',
      'tsla': 'Tesla Inc.',
      'meta': 'Meta Platforms Inc.',
      'nvda': 'NVIDIA Corporation',
      'nflx': 'Netflix Inc.',
    };
    return companyNames[symbol.toLowerCase()] || `${symbol.toUpperCase()} Corporation`;
  };

  const getRandomPrice = () => (Math.random() * 1000 + 10).toFixed(2);
  const getRandomChange = () => (Math.random() * 10 - 5).toFixed(2);
  const getRandomChangePercent = () => (Math.random() * 5 - 2.5).toFixed(2);
  const getRandomMarketCap = () => `$${(Math.random() * 2000 + 10).toFixed(2)}B`;
  const getRandomVolume = () => `${(Math.random() * 50 + 1).toFixed(1)}M`;
  const getRandomHighPrice = () => (Math.random() * 1000 + 100).toFixed(2);
  const getRandomLowPrice = () => (Math.random() * 500 + 50).toFixed(2);
  const getRandomOpenPrice = () => (Math.random() * 800 + 80).toFixed(2);
  const getRandomPreviousClosePrice = () => (Math.random() * 800 + 80).toFixed(2);

  const handleTransaction = async () => {
    if (!session || !stock) return;
    
    setProcessing(true);
    setError('');
    setSuccess('');

    try {
      const totalCost = Number(stock.price) * quantity;
      
      if (transactionType === 'BUY' && userPortfolio.accountBalance < totalCost) {
        throw new Error('Insufficient funds in your account');
      }

      if (transactionType === 'SELL' && (!userPortfolio.stockHoldings || userPortfolio.stockHoldings.quantity < quantity)) {
        throw new Error('You do not have enough shares to sell');
      }

      // Send transaction to API
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: transactionType,
          stockSymbol: stock.symbol,
          stockName: stock.companyName,
          quantity: Number(quantity),
          price: Number(stock.price),
          amount: totalCost,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to process transaction');
      }

      const responseData = await response.json();
      console.log('Transaction response:', responseData);
      
      // Update success message
      setSuccess(`Successfully ${transactionType === 'BUY' ? 'purchased' : 'sold'} ${quantity} shares of ${stock.symbol}`);
      
      // Reset form
      setQuantity(1);
      
      // Immediately fetch updated user portfolio
      fetchUserPortfolio();
      
      // Add a small delay before another fetch to ensure we get the latest data from server
      setTimeout(() => {
        fetchUserPortfolio();
      }, 500);
    } catch (error: any) {
      setError(error.message);
      console.error('Transaction error:', error);
    } finally {
      setProcessing(false);
    }
  };

  const generateChartData = (period: '1d' | '1m' | '6m' | '1y' | 'max') => {
    // This is mock data - in a real app, you would fetch this from an API
    const dataPoints = {
      '1d': 24,
      '1m': 30,
      '6m': 180,
      '1y': 365,
      'max': 1500
    };
    
    const numPoints = dataPoints[period];
    const data = [];
    
    // Start with a realistic base price that matches the current stock price
    let basePrice = stock ? parseFloat(stock.price) : 100;
    // Ensure we have a valid number
    if (isNaN(basePrice) || basePrice <= 0) {
      basePrice = 100;
    }
    
    const volatility = period === '1d' ? 0.01 : period === '1m' ? 0.03 : 0.1;
    let trend = Math.random() > 0.5 ? 1 : -1; // Randomly choose upward or downward trend
    
    // Generate data points with more prominent changes
    for (let i = 0; i < numPoints; i++) {
      // Occasionally flip the trend to create more realistic patterns
      if (i % Math.floor(numPoints / 8) === 0 && i > 0) {
        trend = -trend;
      }
      
      // Create more noticeable changes
      const change = basePrice * volatility * (Math.random() * 0.8 + 0.2) * trend;
      basePrice += change;
      
      // Ensure we don't go too low
      if (basePrice < 5) basePrice = 5 + Math.random() * 10;
      
      data.push({
        time: i,
        value: parseFloat(basePrice.toFixed(2)), // Convert to number for better chart rendering
        open: parseFloat((basePrice - Math.random() * 5).toFixed(2)),
        close: parseFloat(basePrice.toFixed(2)),
        high: parseFloat((basePrice + Math.random() * 3).toFixed(2)),
        low: parseFloat((basePrice - Math.random() * 3).toFixed(2)),
        volume: Math.floor(Math.random() * 10000000)
      });
    }
    
    setChartData(data);
  };

  const formatCurrency = (value: string | number) => {
    if (typeof value === 'string') value = parseFloat(value);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatQuantity = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const calculateTotalCost = () => {
    if (!stock) return 0;
    return Number(stock.price) * quantity;
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value < 1) {
      setQuantity(1);
    } else {
      setQuantity(value);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading stock data...</p>
        </div>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="text-red-600 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Stock Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">We couldn't find the stock you're looking for.</p>
          <Link href="/stocks" className="btn-primary">
            Browse All Stocks
          </Link>
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
              <Link href="/stocks" className="text-blue-600 font-medium">
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
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/stocks" className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
            <FaArrowLeft className="mr-2" /> Back to Stocks
          </Link>
        </div>
        
        {/* Stock Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{stock.symbol}</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">{stock.companyName}</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center">
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(stock.price)}</p>
              <div className={`flex items-center justify-end ${parseFloat(stock.change) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {parseFloat(stock.change) >= 0 ? <FaCaretUp className="mr-1" /> : <FaCaretDown className="mr-1" />}
                <span>{stock.change} ({stock.changePercent}%)</span>
              </div>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-300">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-300">
            {success}
          </div>
        )}
        
        {/* Mobile Tabs */}
        <div className="block md:hidden mb-6">
          <div className="flex space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('chart')} 
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                activeTab === 'chart' 
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              Chart & Info
            </button>
            <button 
              onClick={() => setActiveTab('account')} 
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                activeTab === 'account' 
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              Trade
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stock Chart & Info Section */}
          <div className={`md:col-span-2 ${activeTab === 'chart' ? 'block' : 'hidden md:block'}`}>
            {/* Chart Controls */}
            <div className="flex flex-wrap justify-between items-center mb-4">
              <div className="flex space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-3 sm:mb-0">
                {['1d', '1m', '6m', '1y', 'max'].map((period) => (
                  <button 
                    key={period}
                    onClick={() => setChartTimePeriod(period as any)} 
                    className={`py-1 px-3 text-xs font-medium rounded-md ${
                      chartTimePeriod === period 
                        ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {period.toUpperCase()}
                  </button>
                ))}
              </div>
              <div className="flex space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <button 
                  onClick={() => setChartStyle('line')} 
                  className={`py-1 px-3 text-xs font-medium rounded-md ${
                    chartStyle === 'line' 
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <FaChartLine className="inline-block" />
                </button>
                <button 
                  onClick={() => setChartStyle('area')} 
                  className={`py-1 px-3 text-xs font-medium rounded-md ${
                    chartStyle === 'area' 
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <FaChartArea className="inline-block" />
                </button>
                <button 
                  onClick={() => setChartStyle('candle')} 
                  className={`py-1 px-3 text-xs font-medium rounded-md ${
                    chartStyle === 'candle' 
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <FaChartBar className="inline-block" />
                </button>
              </div>
            </div>
            
            {/* Chart Placeholder */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
              <div className="aspect-w-16 aspect-h-9">
                <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  {/* Interactive chart display */}
                  <div className="relative w-full h-full">
                    <div className="absolute inset-0 flex flex-col">
                      {/* Chart Area */}
                      <div className="flex-grow flex items-end">
                        <svg className="w-full h-[80%]" viewBox="0 0 1000 400" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor={theme === 'dark' ? '#3b82f6' : '#3b82f6'} stopOpacity="0.2" />
                              <stop offset="100%" stopColor={theme === 'dark' ? '#3b82f6' : '#3b82f6'} stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          
                          {chartData.length > 0 && (
                            <>
                              {/* Find min and max values for proper scaling */}
                              {(() => {
                                const values = chartData.map(d => d.value);
                                const min = Math.min(...values) * 0.95; // Add some padding
                                const max = Math.max(...values) * 1.05;
                                const range = max - min;
                                
                                // Calculate Y position based on value
                                const getY = (value: number) => {
                                  return 400 - ((value - min) / range) * 380;
                                };
                                
                                if (chartStyle === 'line') {
                                  return (
                                    <path 
                                      d={`M0,${getY(chartData[0].value)} ${chartData.map((d, i) => 
                                        `L${i * (1000 / (chartData.length - 1))},${getY(d.value)}`).join(' ')}`}
                                      fill="none" 
                                      stroke={theme === 'dark' ? '#3b82f6' : '#3b82f6'} 
                                      strokeWidth="3" 
                                    />
                                  );
                                }
                                
                                if (chartStyle === 'area') {
                                  return (
                                    <path 
                                      d={`M0,${getY(chartData[0].value)} ${chartData.map((d, i) => 
                                        `L${i * (1000 / (chartData.length - 1))},${getY(d.value)}`).join(' ')} 
                                        L${1000},${getY(chartData[chartData.length-1].value)} L${1000},400 L0,400 Z`}
                                      fill="url(#chartGradient)" 
                                      stroke={theme === 'dark' ? '#3b82f6' : '#3b82f6'} 
                                      strokeWidth="3" 
                                    />
                                  );
                                }
                                
                                if (chartStyle === 'candle') {
                                  return chartData.map((d, i) => {
                                    const x = i * (1000 / chartData.length);
                                    const width = 1000 / chartData.length / 2;
                                    const isPositive = d.close > d.open;
                                    const fillColor = isPositive ? '#22c55e' : '#ef4444';
                                    
                                    return (
                                      <g key={i}>
                                        <line 
                                          x1={x + width / 2} 
                                          y1={getY(d.high)} 
                                          x2={x + width / 2} 
                                          y2={getY(d.low)} 
                                          stroke={fillColor} 
                                          strokeWidth="1.5"
                                        />
                                        <rect 
                                          x={x + width / 4} 
                                          y={getY(Math.max(d.open, d.close))} 
                                          width={width} 
                                          height={Math.abs(getY(d.open) - getY(d.close))} 
                                          fill={fillColor} 
                                        />
                                      </g>
                                    );
                                  });
                                }
                                
                                return null;
                              })()}
                            </>
                          )}
                        </svg>
                      </div>
                      
                      {/* X-axis labels */}
                      <div className="h-6 flex justify-between text-xs text-gray-500 dark:text-gray-400 px-2">
                        {chartTimePeriod === '1d' && ['9:30', '11:00', '12:30', '14:00', '16:00'].map((time) => (
                          <span key={time}>{time}</span>
                        ))}
                        {chartTimePeriod === '1m' && ['1w', '2w', '3w', '4w'].map((time) => (
                          <span key={time}>{time}</span>
                        ))}
                        {chartTimePeriod === '6m' && ['1m', '2m', '3m', '4m', '5m', '6m'].map((time) => (
                          <span key={time}>{time}</span>
                        ))}
                        {chartTimePeriod === '1y' && ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'].map((time) => (
                          <span key={time}>{time}</span>
                        ))}
                        {chartTimePeriod === 'max' && ['2019', '2020', '2021', '2022', '2023'].map((time) => (
                          <span key={time}>{time}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Market Cap</h3>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{stock.marketCap}</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Volume</h3>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{stock.volume}</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Avg Volume</h3>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{stock.avgVolume}</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">High Today</h3>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatCurrency(stock.high)}</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Low Today</h3>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatCurrency(stock.low)}</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Previous Close</h3>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatCurrency(stock.previousClose)}</p>
              </div>
            </div>
          </div>
          
          {/* Trading Panel */}
          <div className={`${activeTab === 'account' ? 'block' : 'hidden md:block'}`}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Trade {stock.symbol}</h2>
              
              {/* Account Overview */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Account Balance:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(userPortfolio?.accountBalance || 0)}</span>
                </div>
                
                {userPortfolio?.stockHoldings && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Shares Owned:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{formatQuantity(userPortfolio.stockHoldings.quantity)}</span>
                  </div>
                )}
              </div>
              
              {/* Transaction Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Transaction Type</label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setTransactionType('BUY')}
                    className={`flex-1 py-2 px-4 rounded-md font-medium ${
                      transactionType === 'BUY'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransactionType('SELL')}
                    className={`flex-1 py-2 px-4 rounded-md font-medium ${
                      transactionType === 'SELL'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                    disabled={!userPortfolio?.stockHoldings}
                  >
                    Sell
                  </button>
                </div>
                {transactionType === 'SELL' && !userPortfolio?.stockHoldings && (
                  <p className="mt-2 text-sm text-red-500">You don't own any shares of {stock.symbol}</p>
                )}
              </div>
              
              {/* Quantity Input */}
              <div className="mb-6">
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quantity
                </label>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                    className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-l-md text-gray-700 dark:text-gray-300"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    min="1"
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="w-full py-2 px-3 border-none focus:outline-none focus:ring-0 text-center text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-r-md text-gray-700 dark:text-gray-300"
                  >
                    +
                  </button>
                </div>
              </div>
              
              {/* Stock Price & Total */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Stock Price:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(stock.price)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total Cost:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(calculateTotalCost())}</span>
                </div>
              </div>
              
              {/* Submit Button */}
              <button
                type="button"
                onClick={handleTransaction}
                disabled={processing || (transactionType === 'SELL' && !userPortfolio?.stockHoldings)}
                className={`w-full py-3 px-4 rounded-lg font-semibold ${
                  processing 
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-300 cursor-not-allowed' 
                    : transactionType === 'BUY'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {processing ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    {transactionType === 'BUY' ? <FaMoneyBillWave className="mr-2" /> : <FaExchangeAlt className="mr-2" />}
                    {transactionType === 'BUY' ? 'Buy' : 'Sell'} {stock.symbol}
                  </span>
                )}
              </button>
              
              {/* Warning or Notice */}
              <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
                {transactionType === 'BUY'
                  ? "Market orders will be executed at the current market price. Prices may change quickly in volatile markets."
                  : "Market sell orders will be executed at the current market price, which may differ from the price shown."
                }
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 
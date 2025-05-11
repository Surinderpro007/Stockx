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
    
    let basePrice = parseFloat(getRandomPrice());
    const volatility = period === '1d' ? 0.005 : period === '1m' ? 0.02 : 0.1;
    
    const startDate = new Date();
    let timeUnit;
    
    switch (period) {
      case '1d':
        startDate.setHours(0, 0, 0, 0);
        timeUnit = 60 * 60 * 1000 / 24; // hourly
        break;
      case '1m':
        startDate.setDate(startDate.getDate() - 30);
        timeUnit = 24 * 60 * 60 * 1000; // daily
        break;
      case '6m':
        startDate.setMonth(startDate.getMonth() - 6);
        timeUnit = 24 * 60 * 60 * 1000; // daily
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        timeUnit = 24 * 60 * 60 * 1000; // daily
        break;
      case 'max':
        startDate.setFullYear(startDate.getFullYear() - 6);
        timeUnit = 7 * 24 * 60 * 60 * 1000; // weekly
        break;
    }
    
    for (let i = 0; i < numPoints; i++) {
      const timestamp = new Date(startDate.getTime() + (i * timeUnit));
      
      // Create random price changes
      const change = (Math.random() - 0.5) * volatility * basePrice;
      basePrice += change;
      
      // Generate more details for candlestick
      const open = basePrice;
      const close = basePrice + (Math.random() - 0.5) * volatility * basePrice;
      const high = Math.max(open, close) + Math.random() * volatility * basePrice;
      const low = Math.min(open, close) - Math.random() * volatility * basePrice;
      
      data.push({
        timestamp,
        price: basePrice,
        open,
        high,
        close,
        low,
        volume: Math.floor(Math.random() * 10000000) + 1000000
      });
    }
    
    setChartData(data);
  };
  
  const formatChartDate = (timestamp: Date) => {
    if (chartTimePeriod === '1d') {
      return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (chartTimePeriod === '1m' || chartTimePeriod === '6m') {
      return timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } else {
      return timestamp.toLocaleDateString([], { month: 'short', year: '2-digit' });
    }
  };
  
  const renderChart = () => {
    if (!chartData.length) return null;
    
    // Determine min and max values for chart scaling
    const prices = chartData.map(d => d.price);
    const minPrice = Math.min(...prices) * 0.98;
    const maxPrice = Math.max(...prices) * 1.02;
    const priceRange = maxPrice - minPrice;
    
    // Calculate chart dimensions and scaling
    const chartWidth = 1000;
    const chartHeight = 400;
    const xScale = chartWidth / (chartData.length - 1);
    const yScale = chartHeight / priceRange;
    
    // Generate points for line or area chart
    const points = chartData.map((d, i) => {
      const x = i * xScale;
      const y = chartHeight - ((d.price - minPrice) * yScale);
      return `${x},${y}`;
    }).join(' ');
    
    // Generate path for area chart
    const areaPath = `${points} ${chartWidth},${chartHeight} 0,${chartHeight}`;
    
    // Determine if price movement is positive
    const isPositive = chartData[chartData.length - 1].price > chartData[0].price;
    const lineColor = isPositive ? 'rgb(16, 185, 129)' : 'rgb(239, 68, 68)';
    const areaColor = isPositive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)';
    
    return (
      <div className="relative w-full overflow-hidden" style={{ height: `${chartHeight}px` }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
          {chartStyle === 'area' && (
            <polygon 
              points={areaPath} 
              fill={areaColor}
              stroke="none"
            />
          )}
          
          {(chartStyle === 'line' || chartStyle === 'area') && (
            <polyline
              points={points}
              fill="none"
              stroke={lineColor}
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}
          
          {chartStyle === 'candle' && chartData.map((d, i) => {
            const x = i * xScale;
            const candleWidth = Math.max(4, xScale * 0.8);
            const open = chartHeight - ((d.open - minPrice) * yScale);
            const close = chartHeight - ((d.close - minPrice) * yScale);
            const high = chartHeight - ((d.high - minPrice) * yScale);
            const low = chartHeight - ((d.low - minPrice) * yScale);
            const isCandleUp = d.close >= d.open;
            const candleColor = isCandleUp ? 'rgb(16, 185, 129)' : 'rgb(239, 68, 68)';
            
            return (
              <g key={i}>
                {/* Wick */}
                <line 
                  x1={x} 
                  y1={high} 
                  x2={x} 
                  y2={low} 
                  stroke={candleColor} 
                  strokeWidth="1" 
                />
                
                {/* Candle body */}
                <rect 
                  x={x - candleWidth / 2} 
                  y={isCandleUp ? close : open} 
                  width={candleWidth} 
                  height={Math.abs(close - open)}
                  fill={candleColor}
                />
              </g>
            );
          })}
        </svg>
        
        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 dark:text-gray-400 pb-2">
          <span>{formatChartDate(chartData[0].timestamp)}</span>
          <span>{formatChartDate(chartData[Math.floor(chartData.length / 2)].timestamp)}</span>
          <span>{formatChartDate(chartData[chartData.length - 1].timestamp)}</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading stock data...</p>
        </div>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Stock Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">The stock symbol you're looking for doesn't exist or couldn't be loaded.</p>
          <Link href="/stocks" className="btn-primary">
            Back to Stocks
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FaChartLine className="text-blue-600 text-2xl" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">NextStocks</h1>
          </div>
          <div className="flex items-center">
            <nav className="hidden md:flex items-center space-x-6 mr-4">
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
        <div className="mb-6">
          <Link href="/stocks" className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
            <FaArrowLeft className="mr-2" />
            Back to All Stocks
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{stock.symbol}</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">{stock.companyName}</p>
              
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white mr-3">${stock.price}</span>
                <span className={`text-lg font-medium flex items-center ${Number(stock.change) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {Number(stock.change) >= 0 ? <FaCaretUp className="mr-1" /> : <FaCaretDown className="mr-1" />}
                  {Number(stock.change) >= 0 ? '+' : ''}{stock.change} ({stock.changePercent}%)
                </span>
              </div>
            </div>

            <div className="flex space-x-2 mt-2 md:mt-0">
              <button 
                className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'chart' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}
                onClick={() => setActiveTab('chart')}
              >
                <FaChartLine className="inline mr-2" /> Chart
              </button>
              <button 
                className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'account' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}
                onClick={() => setActiveTab('account')}
              >
                <FaWallet className="inline mr-2" /> Account
              </button>
            </div>
          </div>

          {activeTab === 'chart' ? (
            <div className="mt-6">
              {/* Chart Controls */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-4 sm:space-y-0">
                <div className="flex space-x-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                  <button 
                    className={`px-3 py-1 text-xs font-medium rounded-md ${chartTimePeriod === '1d' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-600 dark:text-gray-300'}`}
                    onClick={() => setChartTimePeriod('1d')}
                  >
                    1D
                  </button>
                  <button 
                    className={`px-3 py-1 text-xs font-medium rounded-md ${chartTimePeriod === '1m' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-600 dark:text-gray-300'}`}
                    onClick={() => setChartTimePeriod('1m')}
                  >
                    1M
                  </button>
                  <button 
                    className={`px-3 py-1 text-xs font-medium rounded-md ${chartTimePeriod === '6m' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-600 dark:text-gray-300'}`}
                    onClick={() => setChartTimePeriod('6m')}
                  >
                    6M
                  </button>
                  <button 
                    className={`px-3 py-1 text-xs font-medium rounded-md ${chartTimePeriod === '1y' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-600 dark:text-gray-300'}`}
                    onClick={() => setChartTimePeriod('1y')}
                  >
                    1Y
                  </button>
                  <button 
                    className={`px-3 py-1 text-xs font-medium rounded-md ${chartTimePeriod === 'max' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-600 dark:text-gray-300'}`}
                    onClick={() => setChartTimePeriod('max')}
                  >
                    MAX
                  </button>
                </div>

                <div className="flex space-x-2">
                  <button 
                    className={`p-2 rounded-md ${chartStyle === 'line' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}
                    onClick={() => setChartStyle('line')}
                    title="Line Chart"
                  >
                    <FaChartLine />
                  </button>
                  <button 
                    className={`p-2 rounded-md ${chartStyle === 'area' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}
                    onClick={() => setChartStyle('area')}
                    title="Area Chart"
                  >
                    <FaChartArea />
                  </button>
                  <button 
                    className={`p-2 rounded-md ${chartStyle === 'candle' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}
                    onClick={() => setChartStyle('candle')}
                    title="Candlestick Chart"
                  >
                    <FaChartBar />
                  </button>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 h-96 mb-6">
                {renderChart()}
              </div>

              {/* Price Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Open</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">${stock.open}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">High</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">${stock.high}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Low</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">${stock.low}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Volume</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">{stock.volume}</p>
                </div>
              </div>
            </div>
          ) : (
            /* Account Info Tab */
            <div className="mt-6 bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Account</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-2">Balance: <span className="font-semibold">${userPortfolio?.accountBalance.toFixed(2)}</span></p>
              
              {userPortfolio?.stockHoldings ? (
                <div className="mt-4">
                  <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">Your {stock.symbol} Holdings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Shares Owned</p>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">{userPortfolio.stockHoldings.quantity}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Average Price</p>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">${userPortfolio.stockHoldings.avgBuyPrice.toFixed(2)}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Current Value</p>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">${(userPortfolio.stockHoldings.quantity * Number(stock.price)).toFixed(2)}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Unrealized Gain/Loss</p>
                      <p className={`text-lg font-medium ${(Number(stock.price) - userPortfolio.stockHoldings.avgBuyPrice) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        ${((Number(stock.price) - userPortfolio.stockHoldings.avgBuyPrice) * userPortfolio.stockHoldings.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mt-4">
                  <p className="text-gray-600 dark:text-gray-300">You don't own any shares of {stock.symbol} yet.</p>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">Use the form below to start investing.</p>
                </div>
              )}
            </div>
          )}

          {/* Stock Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Market Cap</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">{stock.marketCap}</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Volume</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">{stock.volume}</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">High / Low</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">${stock.high} / ${stock.low}</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Open / Prev Close</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">${stock.open} / ${stock.previousClose}</p>
            </div>
          </div>

          {/* Transaction Form */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
            <div className="flex items-center mb-6">
              <FaExchangeAlt className="text-primary-600 text-xl mr-3" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Trade this Stock</h3>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-300 rounded-md p-4 mb-6">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-900 text-green-800 dark:text-green-300 rounded-md p-4 mb-6">
                {success}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Transaction Type
                  </label>
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setTransactionType('BUY')}
                      className={`flex-1 py-2 px-4 rounded-md ${
                        transactionType === 'BUY'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Buy
                    </button>
                    <button
                      type="button"
                      onClick={() => setTransactionType('SELL')}
                      className={`flex-1 py-2 px-4 rounded-md ${
                        transactionType === 'SELL'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                      disabled={!userPortfolio?.stockHoldings}
                    >
                      Sell
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quantity
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="quantity"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="input-field"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-gray-500 dark:text-gray-400">shares</span>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Price per Share
                  </label>
                  <div className="input-field bg-gray-50 dark:bg-gray-700 flex items-center">
                    <span className="text-gray-500 dark:text-gray-400 mr-1">$</span>
                    <span className="text-gray-900 dark:text-white">{stock.price}</span>
                  </div>
                </div>

                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700 dark:text-gray-300">Subtotal:</span>
                    <span className="text-gray-900 dark:text-white">${(Number(stock.price) * quantity).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700 dark:text-gray-300">Fee:</span>
                    <span className="text-gray-900 dark:text-white">$0.00</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Total:</span>
                    <span className="font-medium text-gray-900 dark:text-white">${(Number(stock.price) * quantity).toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleTransaction}
                  disabled={processing || (transactionType === 'SELL' && !userPortfolio?.stockHoldings)}
                  className={`btn-primary w-full justify-center flex items-center ${
                    transactionType === 'BUY' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {processing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaMoneyBillWave className="mr-2" />
                      {transactionType === 'BUY' ? 'Buy' : 'Sell'} Shares
                    </>
                  )}
                </button>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  {transactionType === 'BUY' ? 'Buying' : 'Selling'} Power
                </h4>
                
                {transactionType === 'BUY' ? (
                  <>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      Available to buy: ${userPortfolio?.accountBalance.toFixed(2)}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Maximum shares you can buy: {Math.floor(userPortfolio?.accountBalance / Number(stock.price) || 0)}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      Available to sell: {userPortfolio?.stockHoldings ? userPortfolio.stockHoldings.quantity : 0} shares
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Current value: ${userPortfolio?.stockHoldings 
                        ? (userPortfolio.stockHoldings.quantity * Number(stock.price)).toFixed(2) 
                        : '0.00'}
                    </p>
                  </>
                )}
                
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900 rounded-lg p-4">
                  <h5 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">Trading Tips</h5>
                  <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
                    <li>Consider market trends before making a decision</li>
                    <li>Diversify your portfolio to manage risk</li>
                    <li>Regularly review and rebalance your investments</li>
                    <li>Invest based on your research and financial goals</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaChartLine, FaSearch, FaArrowUp, FaArrowDown, FaStar, FaRegStar, FaMoon, FaSun } from 'react-icons/fa';
import { useTheme } from 'next-themes';

export default function StocksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [stocks, setStocks] = useState<any[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'symbol', direction: 'ascending' });
  const [favorites, setFavorites] = useState<string[]>([]);
  const [filterType, setFilterType] = useState('all'); // 'all', 'gainers', 'losers', 'favorites'

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchStocks();
      loadFavorites();
    }
  }, [status, router]);

  useEffect(() => {
    let result = [...stocks];
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(stock => 
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
        stock.companyName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply type filter
    if (filterType === 'gainers') {
      result = result.filter(stock => parseFloat(stock.change) > 0);
    } else if (filterType === 'losers') {
      result = result.filter(stock => parseFloat(stock.change) < 0);
    } else if (filterType === 'favorites') {
      result = result.filter(stock => favorites.includes(stock.symbol));
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredStocks(result);
  }, [stocks, searchQuery, sortConfig, favorites, filterType]);

  const requestSort = (key: string) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const fetchStocks = async () => {
    try {
      // In a real app, you would fetch real stock data from an API
      // For demo purposes, we're generating mock data
      const mockStocks = [
        { 
          symbol: 'AAPL', 
          companyName: 'Apple Inc.', 
          price: '175.42', 
          change: '2.35', 
          changePercent: '1.36',
          sector: 'Technology',
          volume: '58.3M' 
        },
        { 
          symbol: 'MSFT', 
          companyName: 'Microsoft Corporation', 
          price: '415.26', 
          change: '3.91', 
          changePercent: '0.95',
          sector: 'Technology',
          volume: '22.7M' 
        },
        { 
          symbol: 'GOOGL', 
          companyName: 'Alphabet Inc.', 
          price: '174.12', 
          change: '-1.53', 
          changePercent: '-0.87',
          sector: 'Technology',
          volume: '15.9M' 
        },
        { 
          symbol: 'AMZN', 
          companyName: 'Amazon.com Inc.', 
          price: '182.57', 
          change: '1.28', 
          changePercent: '0.71',
          sector: 'Consumer Cyclical',
          volume: '32.4M' 
        },
        { 
          symbol: 'TSLA', 
          companyName: 'Tesla Inc.', 
          price: '175.34', 
          change: '-4.21', 
          changePercent: '-2.35',
          sector: 'Automotive',
          volume: '81.6M' 
        },
        { 
          symbol: 'META', 
          companyName: 'Meta Platforms Inc.', 
          price: '482.59', 
          change: '5.72', 
          changePercent: '1.20',
          sector: 'Technology',
          volume: '12.3M' 
        },
        { 
          symbol: 'NVDA', 
          companyName: 'NVIDIA Corporation', 
          price: '950.02', 
          change: '24.31', 
          changePercent: '2.63',
          sector: 'Technology',
          volume: '41.8M' 
        },
        { 
          symbol: 'NFLX', 
          companyName: 'Netflix Inc.', 
          price: '627.98', 
          change: '-3.45', 
          changePercent: '-0.55',
          sector: 'Entertainment',
          volume: '5.7M' 
        },
        { 
          symbol: 'JPM', 
          companyName: 'JPMorgan Chase & Co.', 
          price: '201.43', 
          change: '2.81', 
          changePercent: '1.42',
          sector: 'Financial Services',
          volume: '9.2M' 
        },
        { 
          symbol: 'DIS', 
          companyName: 'The Walt Disney Company', 
          price: '96.54', 
          change: '-1.09', 
          changePercent: '-1.12',
          sector: 'Entertainment',
          volume: '10.5M' 
        },
        { 
          symbol: 'INTC', 
          companyName: 'Intel Corporation', 
          price: '29.98', 
          change: '-0.73', 
          changePercent: '-2.38',
          sector: 'Technology',
          volume: '37.2M' 
        },
        { 
          symbol: 'AMD', 
          companyName: 'Advanced Micro Devices, Inc.', 
          price: '157.82', 
          change: '3.56', 
          changePercent: '2.31',
          sector: 'Technology',
          volume: '48.1M' 
        }
      ];
      
      setStocks(mockStocks);
    } catch (error) {
      console.error('Error fetching stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = () => {
    const savedFavorites = localStorage.getItem('favorite-stocks');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  };

  const toggleFavorite = (symbol: string) => {
    let newFavorites;
    if (favorites.includes(symbol)) {
      newFavorites = favorites.filter(fav => fav !== symbol);
    } else {
      newFavorites = [...favorites, symbol];
    }
    setFavorites(newFavorites);
    localStorage.setItem('favorite-stocks', JSON.stringify(newFavorites));
  };

  const renderSortIndicator = (key: string) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? <FaArrowUp className="inline ml-1" /> : <FaArrowDown className="inline ml-1" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading stocks...</p>
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
        <div className="mb-8">
          <h2 className="heading-1 mb-4">Stock Market</h2>
          <p className="text-gray-600 dark:text-gray-300">Browse and trade from our collection of popular stocks.</p>
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
                placeholder="Search stocks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button 
                className={`px-4 py-2 rounded-lg text-sm font-medium ${filterType === 'all' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                onClick={() => setFilterType('all')}
              >
                All Stocks
              </button>
              <button 
                className={`px-4 py-2 rounded-lg text-sm font-medium ${filterType === 'gainers' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                onClick={() => setFilterType('gainers')}
              >
                Top Gainers
              </button>
              <button 
                className={`px-4 py-2 rounded-lg text-sm font-medium ${filterType === 'losers' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                onClick={() => setFilterType('losers')}
              >
                Top Losers
              </button>
              <button 
                className={`px-4 py-2 rounded-lg text-sm font-medium ${filterType === 'favorites' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                onClick={() => setFilterType('favorites')}
              >
                My Favorites
              </button>
            </div>
          </div>
        </div>

        {/* Stocks Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <button 
                      onClick={() => requestSort('symbol')}
                      className="flex items-center hover:text-gray-700 dark:hover:text-white"
                    >
                      Symbol {renderSortIndicator('symbol')}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <button 
                      onClick={() => requestSort('companyName')}
                      className="flex items-center hover:text-gray-700 dark:hover:text-white"
                    >
                      Company {renderSortIndicator('companyName')}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <button 
                      onClick={() => requestSort('price')}
                      className="flex items-center hover:text-gray-700 dark:hover:text-white"
                    >
                      Price {renderSortIndicator('price')}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <button 
                      onClick={() => requestSort('change')}
                      className="flex items-center hover:text-gray-700 dark:hover:text-white"
                    >
                      Change {renderSortIndicator('change')}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <button 
                      onClick={() => requestSort('sector')}
                      className="flex items-center hover:text-gray-700 dark:hover:text-white"
                    >
                      Sector {renderSortIndicator('sector')}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredStocks.length > 0 ? (
                  filteredStocks.map((stock) => (
                    <tr key={stock.symbol} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <button 
                            onClick={() => toggleFavorite(stock.symbol)}
                            className="mr-2 text-gray-400 hover:text-amber-500 dark:hover:text-amber-400"
                          >
                            {favorites.includes(stock.symbol) ? (
                              <FaStar className="text-amber-500" />
                            ) : (
                              <FaRegStar />
                            )}
                          </button>
                          <div className="font-medium text-gray-900 dark:text-white">{stock.symbol}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{stock.companyName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">${stock.price}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          parseFloat(stock.change) >= 0 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {parseFloat(stock.change) >= 0 ? '+' : ''}{stock.change} ({stock.changePercent}%)
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{stock.sector}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link 
                          href={`/stocks/${stock.symbol.toLowerCase()}`}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => router.push(`/stocks/${stock.symbol.toLowerCase()}`)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        >
                          Trade
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-gray-500 dark:text-gray-400">
                        {searchQuery 
                          ? `No stocks matching "${searchQuery}"` 
                          : filterType === 'favorites' 
                            ? 'You have no favorite stocks yet'
                            : 'No stocks found'}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock Cards for Mobile View */}
        <div className="mt-8 lg:hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredStocks.length > 0 ? (
              filteredStocks.map((stock) => (
                <div key={stock.symbol} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-xl text-gray-900 dark:text-white">{stock.symbol}</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{stock.companyName}</p>
                      </div>
                      <button 
                        onClick={() => toggleFavorite(stock.symbol)}
                        className="text-gray-400 hover:text-amber-500 dark:hover:text-amber-400"
                      >
                        {favorites.includes(stock.symbol) ? (
                          <FaStar className="text-amber-500 text-xl" />
                        ) : (
                          <FaRegStar className="text-xl" />
                        )}
                      </button>
                    </div>
                    
                    <div className="mt-4 flex items-baseline">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white mr-2">${stock.price}</span>
                      <span className={`text-sm font-medium ${
                        parseFloat(stock.change) >= 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {parseFloat(stock.change) >= 0 ? '+' : ''}{stock.change} ({stock.changePercent}%)
                      </span>
                    </div>
                    
                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Sector: {stock.sector} • Volume: {stock.volume}
                    </div>
                    
                    <div className="mt-4 flex space-x-2">
                      <Link 
                        href={`/stocks/${stock.symbol.toLowerCase()}`}
                        className="flex-1 btn-secondary text-center py-2"
                      >
                        View Details
                      </Link>
                      <Link 
                        href={`/stocks/${stock.symbol.toLowerCase()}`}
                        className="flex-1 btn-primary text-center py-2"
                      >
                        Trade
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center">
                <div className="text-gray-500 dark:text-gray-400">
                  {searchQuery 
                    ? `No stocks matching "${searchQuery}"` 
                    : filterType === 'favorites' 
                      ? 'You have no favorite stocks yet'
                      : 'No stocks found'}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 
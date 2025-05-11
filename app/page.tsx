import Link from 'next/link';
import { FaChartLine, FaUserCircle, FaSearch, FaExchangeAlt, FaCalculator, FaMoon } from 'react-icons/fa';
import ThemeToggle from '../components/ui/ThemeToggle';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header/Navigation */}
      <header className="bg-white dark:bg-gray-900 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FaChartLine className="text-primary-600 text-2xl" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">NextStocks</h1>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/stocks" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
              Stocks
            </Link>
            <Link href="/calculator" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
              SIP Calculator
            </Link>
            <Link href="/about" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
              About
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link href="/auth/login" className="btn-primary">
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-grow flex items-center bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-16 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 md:pr-8 mb-8 md:mb-0">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Invest in Your Future with NextStocks
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Trade stocks, manage your portfolio, and grow your investments with our easy-to-use platform.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/auth/register" className="btn-primary text-center">
                Get Started
              </Link>
              <Link href="/stocks" className="btn-secondary text-center">
                Explore Stocks
              </Link>
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Market Overview</h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">Today</span>
              </div>
              <div className="space-y-4 mb-6">
                {['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'].map((symbol, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{symbol}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {['Apple Inc.', 'Microsoft Corp.', 'Alphabet Inc.', 'Amazon.com Inc.', 'Tesla Inc.'][index]}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">
                        ${[154.23, 349.87, 138.52, 146.99, 235.45][index]}
                      </p>
                      <p className={`text-sm ${index % 2 === 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {index % 2 === 0 ? '+' : '-'}
                        {[2.4, 1.8, 3.2, 0.9, 4.1][index]}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/stocks" className="btn-primary w-full text-center">
                View All Stocks
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Everything You Need to Succeed
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <div className="text-primary-600 mb-4">
                <FaExchangeAlt className="text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Buy & Sell Stocks</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Trade stocks with ease. Buy or sell shares of your favorite companies with just a few clicks.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <div className="text-primary-600 mb-4">
                <FaSearch className="text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Search & Filter</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Find the perfect investment opportunities with our powerful search and filtering tools.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <div className="text-primary-600 mb-4">
                <FaCalculator className="text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">SIP Calculator</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Plan your future with our SIP calculator. Set goals and track your progress towards financial freedom.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <FaChartLine className="text-primary-600 text-xl" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">NextStocks</h2>
            </div>
            <div className="flex space-x-6">
              <Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm">
                Terms
              </Link>
              <Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm">
                Privacy
              </Link>
              <Link href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm">
                Contact
              </Link>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 md:mt-0">
              © {new Date().getFullYear()} NextStocks. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaChartLine, FaMoneyBillWave, FaUniversity, 
  FaPaypal, FaCheck, FaArrowLeft, FaExclamationTriangle, 
  FaMoon, FaSun 
} from 'react-icons/fa';
import { useTheme } from 'next-themes';

export default function WithdrawPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [accountBalance, setAccountBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [amount, setAmount] = useState<string>('');
  const [withdrawMethod, setWithdrawMethod] = useState<'bank' | 'paypal'>('bank');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchUserData();
    }
  }, [status, router]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user');
      const userData = await response.json();
      setAccountBalance(userData.accountBalance || 0);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimals
    if (/^\d*\.?\d{0,2}$/.test(value) || value === '') {
      setAmount(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > accountBalance) {
      setError('Withdrawal amount exceeds your account balance');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const response = await fetch('/api/user', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'withdraw',
          amount: parseFloat(amount),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to process withdrawal');
      }

      // Update account balance with the response
      const data = await response.json();
      setAccountBalance(data.accountBalance);
      
      // Show success state
      setSuccess(true);
      
      // Reset form
      setAmount('');
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const predefinedAmounts = [100, 250, 500, 1000, 2500, 5000];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
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
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <div className="mb-8">
          <h2 className="heading-1 mb-2">Withdraw Funds</h2>
          <p className="text-gray-600 dark:text-gray-300">Transfer money from your trading account to your bank or PayPal</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Side - Form */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              {success ? (
                <div className="text-center py-8">
                  <div className="h-16 w-16 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full mx-auto flex items-center justify-center mb-4">
                    <FaCheck className="text-2xl" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Withdrawal Request Submitted</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Your withdrawal of {formatCurrency(parseFloat(amount))} has been processed.
                    {withdrawMethod === 'bank' ? 
                      ' Funds will be transferred to your bank account within 1-3 business days.' : 
                      ' Funds will be transferred to your PayPal account shortly.'}
                  </p>
                  <div className="flex justify-center space-x-4">
                    <Link 
                      href="/dashboard"
                      className="btn-primary"
                    >
                      Go to Dashboard
                    </Link>
                    <Link 
                      href="/transactions"
                      className="btn-secondary"
                    >
                      View Transactions
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-300">
                      {error}
                    </div>
                  )}
                  
                  <div className="mb-6">
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Available Balance
                    </label>
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(accountBalance)}
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Amount to Withdraw
                    </label>
                    <div className="relative mt-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 dark:text-gray-400">$</span>
                      </div>
                      <input
                        type="text"
                        id="amount"
                        name="amount"
                        value={amount}
                        onChange={handleAmountChange}
                        className="input-field pl-8"
                        placeholder="Enter amount"
                        required
                      />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Maximum withdrawal: {formatCurrency(accountBalance)}
                    </p>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Quick Select
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {predefinedAmounts.map((presetAmount) => (
                        <button
                          key={presetAmount}
                          type="button"
                          disabled={presetAmount > accountBalance}
                          className={`py-2 px-3 rounded-md text-sm font-medium ${
                            presetAmount > accountBalance
                              ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed'
                              : amount === presetAmount.toString()
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                          onClick={() => presetAmount <= accountBalance && setAmount(presetAmount.toString())}
                        >
                          ${presetAmount}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Withdrawal Method
                    </label>
                    <div className="space-y-2">
                      <div 
                        className={`p-4 border rounded-lg cursor-pointer ${
                          withdrawMethod === 'bank'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => setWithdrawMethod('bank')}
                      >
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-3">
                            <FaUniversity className="text-green-600 dark:text-green-400" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">Bank Transfer</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">1-3 business days to process</p>
                          </div>
                          <div className="ml-2">
                            <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                              withdrawMethod === 'bank'
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-gray-300 dark:border-gray-600'
                            }`}>
                              {withdrawMethod === 'bank' && (
                                <div className="h-2 w-2 rounded-full bg-white"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div 
                        className={`p-4 border rounded-lg cursor-pointer ${
                          withdrawMethod === 'paypal'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => setWithdrawMethod('paypal')}
                      >
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
                            <FaPaypal className="text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">PayPal</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Usually processed within 24 hours</p>
                          </div>
                          <div className="ml-2">
                            <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                              withdrawMethod === 'paypal'
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-gray-300 dark:border-gray-600'
                            }`}>
                              {withdrawMethod === 'paypal' && (
                                <div className="h-2 w-2 rounded-full bg-white"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                    <div className="flex">
                      <FaExclamationTriangle className="text-yellow-500 flex-shrink-0 mt-0.5 mr-3" />
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Important Information</h4>
                        <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                          Funds can only be withdrawn to accounts that belong to you. Please ensure your banking details are up to date in your profile.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <button
                      type="submit"
                      disabled={processing || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > accountBalance}
                      className="w-full btn-primary py-3 flex items-center justify-center"
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
                          Withdraw {amount ? formatCurrency(parseFloat(amount)) : '$0.00'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Right Side - Info */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Withdrawal Information</h3>
              
              <div className="space-y-4">
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Processing Times</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                    <li className="flex items-start">
                      <FaUniversity className="mt-1 mr-2 text-blue-600 dark:text-blue-400" />
                      <span>Bank Transfer: 1-3 business days</span>
                    </li>
                    <li className="flex items-start">
                      <FaPaypal className="mt-1 mr-2 text-blue-600 dark:text-blue-400" />
                      <span>PayPal: Usually within 24 hours</span>
                    </li>
                  </ul>
                </div>

                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Withdrawal Limits</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <li>Minimum: $10</li>
                    <li>Maximum: $50,000 per transaction</li>
                    <li>Daily limit: $100,000</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Need Help?</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    If you have any questions or issues with withdrawals, our support team is available 24/7.
                  </p>
                  <Link href="/help" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
                    Contact Support
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaChartLine, FaCalculator } from 'react-icons/fa';

export default function SIPCalculator() {
  const [monthlyInvestment, setMonthlyInvestment] = useState<number>(5000);
  const [years, setYears] = useState<number>(10);
  const [expectedReturn, setExpectedReturn] = useState<number>(12);
  const [results, setResults] = useState({
    totalInvestment: 0,
    totalReturns: 0,
    maturityValue: 0,
  });

  // Calculate SIP results whenever inputs change
  useEffect(() => {
    calculateSIP();
  }, [monthlyInvestment, years, expectedReturn]);

  const calculateSIP = () => {
    const monthlyRate = expectedReturn / 12 / 100;
    const months = years * 12;
    const totalInvestment = monthlyInvestment * months;
    
    // Calculate maturity value using SIP formula: P × ({(1 + i)^n - 1} / i) × (1 + i)
    const maturityValue = monthlyInvestment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    const totalReturns = maturityValue - totalInvestment;
    
    setResults({
      totalInvestment,
      totalReturns,
      maturityValue,
    });
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FaChartLine className="text-primary-600 text-2xl" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">NextStocks</h1>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
              Dashboard
            </Link>
            <Link href="/stocks" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
              Stocks
            </Link>
            <Link href="/calculator" className="text-primary-600 font-medium">
              SIP Calculator
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <FaCalculator className="text-primary-600 text-2xl mr-3" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">SIP Calculator</h2>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            A Systematic Investment Plan (SIP) is a method of investing a fixed amount regularly in a mutual fund scheme. 
            This calculator will help you estimate the future value of your SIP investments.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Input Form */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Calculate Your Investment</h3>
              
              <div>
                <label htmlFor="monthlyInvestment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Monthly Investment (USD)
                </label>
                <input
                  type="range"
                  id="monthlyInvestment"
                  min="500"
                  max="50000"
                  step="500"
                  value={monthlyInvestment}
                  onChange={e => setMonthlyInvestment(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">$500</span>
                  <span className="text-sm font-medium text-primary-600">${monthlyInvestment}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">$50,000</span>
                </div>
              </div>
              
              <div>
                <label htmlFor="years" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Investment Period (Years)
                </label>
                <input
                  type="range"
                  id="years"
                  min="1"
                  max="30"
                  step="1"
                  value={years}
                  onChange={e => setYears(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">1 year</span>
                  <span className="text-sm font-medium text-primary-600">{years} years</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">30 years</span>
                </div>
              </div>
              
              <div>
                <label htmlFor="expectedReturn" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Expected Annual Return (%)
                </label>
                <input
                  type="range"
                  id="expectedReturn"
                  min="1"
                  max="30"
                  step="0.5"
                  value={expectedReturn}
                  onChange={e => setExpectedReturn(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">1%</span>
                  <span className="text-sm font-medium text-primary-600">{expectedReturn}%</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">30%</span>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mt-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Results</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Investment</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">{formatCurrency(results.totalInvestment)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Estimated Returns</p>
                    <p className="text-xl font-semibold text-green-600">{formatCurrency(results.totalReturns)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Value</p>
                    <p className="text-2xl font-bold text-primary-600">{formatCurrency(results.maturityValue)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Information Section */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Benefits of SIP Investing</h3>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Disciplined approach to investing without timing the market</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Benefits from rupee-cost averaging, reducing the average cost of investment</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>No need to time the market or worry about market volatility</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Power of compounding helps your money grow exponentially over time</span>
                </li>
              </ul>
              
              <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">How to use this calculator?</h4>
                <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
                  <li>Adjust the sliders to set your monthly investment amount</li>
                  <li>Choose your investment time period in years</li>
                  <li>Set your expected annual return percentage</li>
                  <li>The calculator will automatically update the results</li>
                </ul>
              </div>
              
              <div className="mt-8">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Ready to Start Investing?</h4>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Now that you have calculated your potential returns, take the first step towards your financial goals by investing in stocks through NextStocks.
                </p>
                <div className="flex space-x-4 mt-4">
                  <Link href="/stocks" className="btn-primary">
                    Explore Stocks
                  </Link>
                  <Link href="/dashboard" className="btn-secondary">
                    Go to Dashboard
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
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaChartLine, FaQuestion, FaEnvelope, FaPhone, 
  FaComments, FaMinus, FaPlus, FaArrowLeft, FaMoon, FaSun 
} from 'react-icons/fa';
import { useTheme } from 'next-themes';

interface FAQ {
  question: string;
  answer: string;
  isOpen: boolean;
}

export default function HelpPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [faqs, setFaqs] = useState<FAQ[]>([
    {
      question: 'How do I create an account?',
      answer: 'To create an account, click on the "Sign Up" button on the login page. Fill in your details including name, email, and password. After submitting, verify your email address by clicking on the link sent to your registered email.',
      isOpen: false
    },
    {
      question: 'How do I deposit funds?',
      answer: 'You can deposit funds by navigating to the Dashboard and clicking on "Deposit" under Quick Actions, or by going to your Profile and selecting "Deposit Funds". Choose your preferred payment method (credit/debit card, bank transfer, or PayPal) and follow the prompts to complete the transaction.',
      isOpen: false
    },
    {
      question: 'How do I withdraw funds?',
      answer: 'To withdraw funds, go to the Dashboard and click on "Withdraw" under Quick Actions, or navigate to your Profile and select "Withdraw Funds". Enter the amount you wish to withdraw and select your preferred withdrawal method. Withdrawals typically take 1-3 business days to process.',
      isOpen: false
    },
    {
      question: 'How do I buy stocks?',
      answer: 'To buy stocks, navigate to the Stocks page where you can browse available stocks. Click on any stock to view details. On the stock detail page, enter the number of shares you wish to purchase and click "Buy". Confirm the transaction to complete your purchase.',
      isOpen: false
    },
    {
      question: 'How do I sell stocks?',
      answer: 'To sell stocks, go to the Portfolio page where all your purchased stocks are listed. Click on the stock you wish to sell, enter the number of shares to sell, and click "Sell". Confirm the transaction to complete the sale.',
      isOpen: false
    },
    {
      question: 'What is the SIP Calculator?',
      answer: 'The SIP (Systematic Investment Plan) Calculator helps you estimate the future value of your investments through regular, periodic investments. Enter your monthly investment amount, investment period, and expected annual returns to see projected growth over time.',
      isOpen: false
    },
    {
      question: 'Is my personal information secure?',
      answer: 'Yes, we take security very seriously. All personal data is encrypted and stored securely following industry best practices. We use two-factor authentication and regular security audits to ensure your information remains protected.',
      isOpen: false
    },
    {
      question: 'What are the fees for trading?',
      answer: 'Our standard fee structure includes a 0.1% commission on all buy and sell orders with a minimum fee of $1.99 per transaction. There are no hidden fees or charges. For a detailed breakdown of all fees, please visit our Pricing page.',
      isOpen: false
    }
  ]);

  useEffect(() => {
    setMounted(true);
    setLoading(false);
  }, []);

  const toggleFAQ = (index: number) => {
    setFaqs(prevFaqs => 
      prevFaqs.map((faq, i) => 
        i === index ? { ...faq, isOpen: !faq.isOpen } : faq
      )
    );
  };

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
          <h2 className="heading-1 mb-2">Help & Support</h2>
          <p className="text-gray-600 dark:text-gray-300">Find answers to common questions or get in touch with our support team</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FAQ Section */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <FaQuestion className="mr-2 text-blue-600" />
                Frequently Asked Questions
              </h3>

              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <button
                      className="w-full px-6 py-4 text-left flex justify-between items-center bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      onClick={() => toggleFAQ(index)}
                    >
                      <span className="font-medium text-gray-900 dark:text-white">{faq.question}</span>
                      {faq.isOpen ? 
                        <FaMinus className="flex-shrink-0 text-gray-500 dark:text-gray-400" /> :
                        <FaPlus className="flex-shrink-0 text-gray-500 dark:text-gray-400" />
                      }
                    </button>
                    {faq.isOpen && (
                      <div className="px-6 py-4 bg-white dark:bg-gray-800">
                        <p className="text-gray-700 dark:text-gray-300">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact and Support Section */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FaEnvelope className="mr-2 text-blue-600" />
                Contact Us
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Our support team is available 24/7 to help with any questions or issues you may have.
              </p>
              <div className="space-y-3">
                <div className="flex items-start">
                  <FaEnvelope className="mt-1 mr-3 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Email Support</p>
                    {/* <a href="mailto:support@nextstocks.com" className="text-blue-600 dark:text-blue-400 hover:underline"> */}
                    <a href="mailto:surindersinghpro@proton.me" className="text-blue-600 dark:text-blue-400 hover:underline">
                      {/* support@nextstocks.com */}
                      Surindersinghpro@proton.me
                    </a>
                  </div>
                </div>
                <div className="flex items-start">
                  <FaPhone className="mt-1 mr-3 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Phone Support</p>
                    <a href="tel:+18001234567" className="text-blue-600 dark:text-blue-400 hover:underline">
                      {/* +1 (800) 123-4567 */}
                      +1 0000-0000
                    </a>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Mon-Fri, 9am-8pm EST</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FaComments className="mr-2 text-blue-600" />
                Live Chat
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Need immediate assistance? Start a live chat with our support team for real-time help.
              </p>
              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center"
              >
                <FaComments className="mr-2" />
                Start Live Chat
              </button>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Support Hours</h4>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>Monday - Friday: 24 hours</li>
                  <li>Saturday: 9am - 6pm EST</li>
                  <li>Sunday: 9am - 6pm EST</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-8">
          <h3 className="heading-2 mb-4">Additional Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-transform hover:transform hover:scale-105">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Getting Started Guide</h4>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                New to NextStocks? Learn how to set up your account and make your first investment.
              </p>
              <Link href="#" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                Read the guide →
              </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-transform hover:transform hover:scale-105">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Investment Tutorials</h4>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                Learn about different investment strategies, portfolio management, and more.
              </p>
              <Link href="#" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                Browse tutorials →
              </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-transform hover:transform hover:scale-105">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Security Tips</h4>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                Protect your account with our recommended security practices and guidelines.
              </p>
              <Link href="#" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                Learn more →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 
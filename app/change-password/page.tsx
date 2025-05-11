'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaChartLine, FaLock, FaEye, FaEyeSlash, 
  FaCheck, FaArrowLeft, FaMoon, FaSun 
} from 'react-icons/fa';
import { useTheme } from 'next-themes';

export default function ChangePasswordPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      setLoading(false);
    }
  }, [status, router]);

  // Check password strength (simple version)
  useEffect(() => {
    if (!newPassword) {
      setPasswordStrength(0);
      setPasswordFeedback('');
      return;
    }
    
    let strength = 0;
    let feedback = '';
    
    // Length check
    if (newPassword.length >= 8) {
      strength += 1;
    } else {
      feedback = 'Password should be at least 8 characters long';
    }
    
    // Contains lowercase
    if (/[a-z]/.test(newPassword)) {
      strength += 1;
    } else if (!feedback) {
      feedback = 'Add lowercase letters';
    }
    
    // Contains uppercase
    if (/[A-Z]/.test(newPassword)) {
      strength += 1;
    } else if (!feedback) {
      feedback = 'Add uppercase letters';
    }
    
    // Contains numbers
    if (/\d/.test(newPassword)) {
      strength += 1;
    } else if (!feedback) {
      feedback = 'Add numbers';
    }
    
    // Contains special characters
    if (/[^A-Za-z0-9]/.test(newPassword)) {
      strength += 1;
    } else if (!feedback) {
      feedback = 'Add special characters';
    }
    
    // Set overall strength (0-5)
    setPasswordStrength(strength);
    
    // Set feedback message
    if (strength === 5) {
      feedback = 'Very strong password';
    } else if (strength === 4) {
      feedback = 'Strong password';
    } else if (strength === 3) {
      feedback = 'Good password';
    } else if (strength === 2) {
      feedback = 'Fair password';
    } else if (strength === 1) {
      feedback = 'Weak password';
    }
    
    setPasswordFeedback(feedback);
  }, [newPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (passwordStrength < 3) {
      setError('Please choose a stronger password');
      return;
    }
    
    setProcessing(true);
    setError('');

    try {
      // In a real app, you would make an API call to change the password
      // This is a mock implementation for demo purposes
      const mockApiCall = () => {
        return new Promise<void>((resolve, reject) => {
          setTimeout(() => {
            // Simulate a successful password change
            const success = true;
            
            if (success) {
              resolve();
            } else {
              reject(new Error('Failed to change password. Please try again.'));
            }
          }, 1500);
        });
      };
      
      await mockApiCall();
      
      // Show success message
      setSuccess(true);
      
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Redirect after a delay
      setTimeout(() => {
        router.push('/profile');
      }, 3000);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-gray-200 dark:bg-gray-700';
    if (passwordStrength === 1) return 'bg-red-500';
    if (passwordStrength === 2) return 'bg-orange-500';
    if (passwordStrength === 3) return 'bg-yellow-500';
    if (passwordStrength === 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength === 1) return 'Weak';
    if (passwordStrength === 2) return 'Fair';
    if (passwordStrength === 3) return 'Good';
    if (passwordStrength === 4) return 'Strong';
    return 'Very strong';
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
          <Link href="/profile" className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
            <FaArrowLeft className="mr-2" />
            Back to Profile
          </Link>
        </div>

        <div className="mb-8">
          <h2 className="heading-1 mb-2">Change Password</h2>
          <p className="text-gray-600 dark:text-gray-300">Update your account password</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 md:p-8">
            {success ? (
              <div className="text-center py-8">
                <div className="h-16 w-16 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full mx-auto flex items-center justify-center mb-4">
                  <FaCheck className="text-2xl" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Password Updated Successfully</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Your password has been changed. You will be redirected to your profile page shortly.
                </p>
                <Link 
                  href="/profile"
                  className="btn-primary"
                >
                  Return to Profile
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-300">
                    {error}
                  </div>
                )}
                
                <div className="space-y-6">
                  <div>
                    <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        id="current-password"
                        name="current-password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="input-field pr-10"
                        placeholder="Enter your current password"
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <FaEyeSlash className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                        ) : (
                          <FaEye className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        id="new-password"
                        name="new-password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="input-field pr-10"
                        placeholder="Enter your new password"
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <FaEyeSlash className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                        ) : (
                          <FaEye className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                        )}
                      </button>
                    </div>
                    
                    {/* Password strength indicator */}
                    {newPassword && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Password strength: <span className="font-medium">{getPasswordStrengthText()}</span>
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {passwordFeedback}
                          </div>
                        </div>
                        <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getPasswordStrengthColor()}`} 
                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirm-password"
                        name="confirm-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`input-field pr-10 ${
                          confirmPassword && confirmPassword !== newPassword 
                            ? 'border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-500' 
                            : ''
                        }`}
                        placeholder="Confirm your new password"
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <FaEyeSlash className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                        ) : (
                          <FaEye className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                        )}
                      </button>
                    </div>
                    {confirmPassword && confirmPassword !== newPassword && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        Passwords do not match
                      </p>
                    )}
                  </div>
                
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Password Requirements</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-5 list-disc">
                      <li>At least 8 characters long</li>
                      <li>Include at least one lowercase letter</li>
                      <li>Include at least one uppercase letter</li>
                      <li>Include at least one number</li>
                      <li>Include at least one special character</li>
                    </ul>
                  </div>
                
                  <div className="pt-6">
                    <button
                      type="submit"
                      disabled={processing || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword || passwordStrength < 3}
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
                          <FaLock className="mr-2" />
                          Update Password
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 
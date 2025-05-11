'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaChartLine, FaUser, FaEdit, FaSave, FaTimes, 
  FaCamera, FaIdCard, FaPhone, FaEnvelope, FaMoon, FaSun 
} from 'react-icons/fa';
import { useTheme } from 'next-themes';

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [userData, setUserData] = useState<any>({
    name: '',
    email: '',
    phone: '',
    profileImage: null,
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchUserProfile();
      
      // Restore cached profile image from localStorage if available
      const cachedImage = localStorage.getItem('profileImageCache');
      if (cachedImage) {
        setPreviewImage(cachedImage);
        setUserData((prev: typeof userData) => ({ ...prev, profileImage: cachedImage }));
      }
    }
  }, [status, router]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user');
      const data = await response.json();
      
      setUserData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        profileImage: data.profileImage || null,
      });
      
      if (data.profileImage) {
        setPreviewImage(data.profileImage);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load user profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Preview the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageDataUrl = reader.result as string;
        setPreviewImage(imageDataUrl);
        
        // Store image in localStorage to persist between refreshes
        localStorage.setItem('profileImageCache', imageDataUrl);
        
        // In a real app, you would handle the file upload to your server/storage
        // For now, we're just updating the local state
        setUserData({ ...userData, profileImage: imageDataUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      // In a real app, you would upload the profile image to your server/storage
      // and get a URL back. For this example, we'll just simulate it.
      
      const response = await fetch('/api/user', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userData.name,
          phone: userData.phone,
          // Include the profile image from state (which contains the data URL)
          profileImage: userData.profileImage,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update profile');
      }
      
      // Update session data to reflect name change
      if (session?.user?.name !== userData.name) {
        await update({
          ...session,
          user: {
            ...session?.user,
            name: userData.name,
          },
        });
      }
      
      setSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (error: any) {
      setError(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset the form and cancel editing
    fetchUserProfile();
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading your profile...</p>
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
              <Link href="/profile" className="text-blue-600 font-medium">
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
          <h2 className="heading-1 mb-2">My Profile</h2>
          <p className="text-gray-600 dark:text-gray-300">View and manage your account information</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 md:p-8">
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

          <div className="flex flex-col md:flex-row">
            {/* Profile Image Section */}
            <div className="md:w-1/3 flex flex-col items-center mb-6 md:mb-0">
              <div className="relative">
                <div className="h-32 w-32 md:h-40 md:w-40 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mb-4 flex items-center justify-center">
                  {previewImage ? (
                    <img 
                      src={previewImage} 
                      alt="Profile" 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FaUser className="text-gray-400 dark:text-gray-500 text-6xl" />
                  )}
                </div>
                {isEditing && (
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className="absolute bottom-4 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                  >
                    <FaCamera />
                  </button>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleProfileImageChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="mt-2 flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <FaEdit className="mr-2" /> Edit Profile
                </button>
              ) : (
                <div className="mt-2 space-y-2">
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="w-full flex items-center justify-center text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave className="mr-2" /> Save Changes
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="w-full flex items-center justify-center text-gray-700 dark:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 rounded-lg"
                  >
                    <FaTimes className="mr-2" /> Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Profile Information Section */}
            <div className="md:w-2/3 md:pl-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Account Information</h3>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <FaIdCard className="inline-block mr-2" /> Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={userData.name}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white text-lg">{userData.name || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <FaEnvelope className="inline-block mr-2" /> Email Address
                  </label>
                  <p className="text-gray-900 dark:text-white text-lg">{userData.email}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Your email address is used for login and cannot be changed</p>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <FaPhone className="inline-block mr-2" /> Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={userData.phone}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Your phone number"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white text-lg">{userData.phone || 'Not set'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Security Section */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 md:p-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Account Security</h3>
          
          <div className="space-y-4">
            <div>
              <Link 
                href="/change-password" 
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Change Password
              </Link>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                It's a good practice to change your password regularly for security purposes.
              </p>
            </div>
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Two-Factor Authentication</h4>
              <p className="text-gray-600 dark:text-gray-300 mb-3">
                Add an extra layer of security to your account by enabling two-factor authentication.
              </p>
              <button 
                type="button" 
                className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-6 py-2 rounded-lg transition-colors"
              >
                Setup 2FA
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 
'use client'
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';



export default function Login() {
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
 const router = useRouter();
  const handleSubmit = async(e) => {
    e.preventDefault();
    // Basic validation
    if (!aadhaarNumber || !password) {
      setError('Please fill in all required fields');
      return;
    }
    
    
    // Here you would normally handle the login request to your API
    console.log('Login attempt with:', { aadhaarNumber, password });
    // Reset form or redirect on success
  try {
    const res =  await axios.post( "/api/student/login" , {aadhaarNumber, password})
   

    if(res.status == 200){
      alert('Login successfull');
      router.push('/studentdashboard');
    }else{
      alert('Invalid credentials. Please try again.')
    }
 
  } catch (error) {
    console.log(error);
    
  }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50 text-black">
      <Head>
        <title>Student Login</title>
        <meta name="description" content="Student login page" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-orange-500 text-white py-5 text-center shadow-md">
        <h1 className="text-2xl font-semibold">Student Login</h1>
      </header>

      <main className="flex-1 flex justify-center items-center py-12 px-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="bg-blue-800 py-4 px-6 text-white">
            <h2 className="text-xl font-medium">Welcome Back</h2>
            <p className="text-blue-100 text-sm mt-1">Please login to access your student account</p>
          </div>
          
          <div className="p-8">
            {error && (
              <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                <p className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </p>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="aadhaarNumber" className="block mb-2 font-medium text-gray-700">
                  Aadhaar Number<span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="aadhaarNumber"
                    placeholder="xxxx-xxxx-xxxx"
                    value={aadhaarNumber}
                    onChange={(e) => setAadhaarNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="password" className="block mb-2 font-medium text-gray-700">
                  Password<span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    id="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <Link href="/forgot-password" className="text-blue-800 hover:text-blue-600 font-medium">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition duration-200 font-medium text-center shadow-md"
              >
                Login
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-gray-600">
                Don&apos;t have an account?{' '}
                <Link href="/studentsignup" className="text-orange-500 hover:text-orange-600 font-medium">
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} Student Portal. All rights reserved.
      </footer>
    </div>
  );
}
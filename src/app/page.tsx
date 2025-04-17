
import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-black">
      {/* Header */}
      <header className="bg-orange-400 py-3 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-blue-900 rounded-full w-14 h-14 flex items-center justify-center mr-3">
              <div className="bg-white rounded-full w-8 h-8"></div>
            </div>
            <span className="text-white text-2xl font-bold">VidyaSetu</span>
          </div>
          
          <nav className="flex items-center space-x-8">
            <a href="#" className="text-white font-medium hover:text-blue-900">Home</a>
            <a href="#" className="text-white font-medium hover:text-blue-900">About</a>
            <a href="#" className="text-white font-medium hover:text-blue-900">Schemes</a>
            <a href="#" className="text-white font-medium hover:text-blue-900">Contact</a>
           <a href='/studentlogin'> <button className="bg-white text-blue-900 px-6 py-2 rounded-md font-medium hover:bg-gray-100 transition">Login</button></a>
           <a href='/studentsignup'> <button className="bg-blue-900 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-800 transition">Register</button></a>
          </nav>
        </div>
      </header>

      {/* Green divider */}
      <div className="h-3 bg-green-600"></div>

      {/* Main content */}
      <main className="flex-1 container mx-auto p-6">
        {/* Banner */}
        <div className="bg-blue-50 py-10 px-8 rounded-lg text-center mb-10 max-w-4xl mx-auto shadow-sm">
          <h1 className="text-4xl text-blue-900 font-bold mb-8">
            Digital India Educational Initiative
          </h1>
          <p className="text-gray-700 text-lg mb-4">
            Connecting students with qualified scribes across India for enhanced educational support
          </p>
          <p className="text-gray-700 text-lg">
            A Ministry of Education initiative under the National Education Policy 2020
          </p>
        </div>

        {/* User type selection */}
        <div className="grid md:grid-cols-2 gap-8 mb-10 max-w-4xl mx-auto">
          <a href='/studentlogin'>
          <div className="border-2 border-orange-300 bg-orange-50 rounded-lg p-8 text-center hover:shadow-lg transition cursor-pointer transform hover:scale-105">
            <h2 className="text-xl mb-3">
              <span className="font-bold text-2xl">विद्यार्थी</span> <span className="text-gray-700">(Student)</span>
            </h2>
            <p className="text-gray-600 text-lg">Access educational support</p>
          </div>
          </a>
          <a href='/scribelogin'>
          <div className="border-2 border-green-300 bg-green-50 rounded-lg p-8 text-center hover:shadow-lg transition cursor-pointer transform hover:scale-105">
            <h2 className="text-xl mb-3">
              <span className="font-bold text-2xl">लेखक</span> <span className="text-gray-700">(Scribe)</span>
            </h2>
            <p className="text-gray-600 text-lg">Provide educational support</p>
          </div>
          </a>
        </div>

        {/* Language selector */}
        <div className="flex justify-center">
          <div className="border border-gray-300 rounded-md px-4 py-2 flex items-center cursor-pointer hover:bg-gray-50">
            <span className="mr-2">🇮🇳</span>
            <span className="mr-1 font-medium">Language:</span>
            <span className="mr-1">English</span>
            <ChevronDown size={16} />
          </div>
        </div>
      </main>
    </div>
  );
}
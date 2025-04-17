
'use client'
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';


export default function StudentRegistration() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    aadhaar: '',
    fullName: '',
    mobile: '',
    email: '',
    state: '',
    district: '',
    institution: '',
    educationLevel: '',
    disability: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async(e) => {

    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    console.log('Form Submitted:', formData);
    try {
      const res = await axios.post("/api/student/signup", formData);
      // console.log(res);
      alert("Account created");
      router.push("/");
     
    } catch (error) {
      console.error("Signup failed", error);
      alert("Signup failed");
    }
   
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-black">
      {/* Header */}
      <header className="bg-orange-400 py-4">
        <h1 className="text-white text-2xl font-bold text-center">Student Registration</h1>
      </header>

      {/* Form Container */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 max-w-5xl mx-auto">
          <div className="mb-8">
            <h2 className="text-blue-900 text-xl font-bold mb-6">Personal Information</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Aadhaar */}
                <div>
                  <label className="block mb-2">
                    Aadhaar Number<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="aadhaar"
                    required
                    value={formData.aadhaar}
                    onChange={handleChange}
                    placeholder="xxxx-xxxx-xxxx"
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Full Name */}
                <div>
                  <label className="block mb-2">
                    Full Name (as per Aadhaar)<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Mobile */}
                <div>
                  <label className="block mb-2">
                    Mobile Number<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    required
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="+91 xxxxxxxxxx"
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="block mb-2">
                    State<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="state"
                      value={formData.state}
                      required
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select State</option>
                      <option value="andhra">Andhra Pradesh</option>
                      <option value="delhi">Delhi</option>
                      <option value="kerala">Kerala</option>
                      {/* Add more states as needed */}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <ChevronDown className="text-gray-500" size={20} />
                    </div>
                  </div>
                </div>

                {/* District */}
                <div>
                  <label className="block mb-2">
                    District<span className="text-red-500">*</span>
                  </label>
                  <input
                    name="district"
                    value={formData.district}
                    required
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Educational Information Section */}
              <div className="mt-10">
                <h2 className="text-blue-900 text-xl font-bold mb-6">Educational Information</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Institution */}
                  <div>
                    <label className="block mb-2">
                      Educational Institution<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="institution"
                      required
                      value={formData.institution}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Education Level */}
                  <div>
                    <label className="block mb-2">
                      Education Level<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="educationLevel"
                        value={formData.educationLevel}
                        required
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Education Level</option>
                        <option value="primary">Primary School</option>
                        <option value="secondary">Secondary School</option>
                        <option value="higher">Higher Secondary</option>
                        <option value="undergraduate">Undergraduate</option>
                        <option value="postgraduate">Postgraduate</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <ChevronDown className="text-gray-500" size={20} />
                      </div>
                    </div>
                  </div>

                  {/* Disability */}
                  <div className="md:col-span-2">
                    <label className="block mb-2">Specify Disability (if applicable)</label>
                    <input
                      type="text"
                      name="disability"
                      required
                      value={formData.disability}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Password Section */}
              <div className="mt-10">
                <h2 className="text-blue-900 text-xl font-bold mb-6">Account Security</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block mb-2">
                      Password<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block mb-2">
                      Re-enter Password<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                {error && <p className="text-red-600 mt-4">{error}</p>}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end mt-8">
                <button
                  type="submit"
                  className="bg-orange-400 hover:bg-orange-500 text-white font-medium py-3 px-8 rounded-md transition-colors"
                >
                  Register as Student
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}


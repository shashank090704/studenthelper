'use client';
import { useState, useEffect } from 'react';
import useSocket from '../hooks/useSocket';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function StudentDashboard() {
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  const [user, setUser] = useState(null);
  const [onlineScribes, setOnlineScribes] = useState([]);
  const [allScribes, setAllScribes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [subjects, setSubjects] = useState([
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 
    'English', 'Hindi', 'Social Science', 'Computer Science'
  ]);
  const [filteredScribes, setFilteredScribes] = useState(onlineScribes);
  const [recentSessions, setRecentSessions] = useState([
    { subject: 'Mathematics', date: '05-Apr-2025', status: 'Completed' },
    { subject: 'Physics Lab Report', date: '01-Apr-2025', status: 'Completed' }
  ]);
  
  const [upcomingExams, setUpcomingExams] = useState([
    { subject: 'CBSE Physics', date: '15-Apr-2025' },
    { subject: 'CBSE Chemistry', date: '20-Apr-2025' },
    { subject: 'CBSE Mathematics', date: '25-Apr-2025' }
  ]);

  // Get user data on component mount
  useEffect(() => {
    const getUserData = async () => {
      try {
        const res = await axios.post("/api/student/getdata");
        if(res) {
          console.log(res.data.data, 'dashboard data');
          setUser(res.data.data);
        } else {
          alert("Login first");
          router.push('/login');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
        router.push('/login');
      }
    };
    
    getUserData();
  }, []);

  // Register with socket once connected and user data loaded
  useEffect(() => {
    if (socket && user) {
      // Register with socket
      socket.emit('register', {
        role: user.role,
        id: user._id,
        aadhaar: user.aadhaarNumber,
        class : user.educationLevel,
        date : "0-0-0"
      });
      
      // Listen for online scribes updates
      socket.on('scribes-online', (scribes) => {
        setOnlineScribes(scribes);
        setFilteredScribes(scribes);
        console.log(scribes , "scribes")
      });
    }
    
    return () => {
      if (socket) {
        socket.off('scribes-online');
      }
    };
  }, [socket, user]);

  

  // Fetch all scribes data
  const fetchAllScribes = async () => {
    try {
      setLoading(true);
      const response = await axios.post("/api/scribe/getdata");
      if (response && response.data) {
        console.log("All scribes data:", response.data);
        setAllScribes(response.data.data || []);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching scribes:", error);
      setLoading(false);
    }
  };

  // Filter scribes based on selected date and subject
  const getFilteredScribes = () => {
    if (!allScribes.length) return [];
    
    return allScribes.filter(scribe => {
      // Date filter
      const dateMatch = !filterDate || 
        (scribe.availableDates && scribe.availableDates.some(date => 
          new Date(date).toISOString().split('T')[0] === filterDate
        ));
      
      // For now, we don't have subject info in the schema, so we'll skip subject filtering
      // In a real implementation, you would check if the scribe has the selected subject
      // const subjectMatch = !filterSubject || (scribe.subjects && scribe.subjects.includes(filterSubject));
      
      return dateMatch; // && subjectMatch;
    });
  };

  // Start WebRTC call with a scribe
  const startCall = (scribeId) => {
    if (!user || !scribeId) return;
    
    // Generate a consistent roomId using sorted IDs
    const roomId = `room_${[user._id, scribeId].sort().join('_')}`;
  
    // Emit a call-request to the server with room info and target scribe
    socket.emit("call-request", {
      roomId,
      target: scribeId,
      from: { id: user._id, role: user.role, fullName: user.fullName }
    });
    
    // Navigate the student to the call room
    router.push(`/call/${roomId}?target=${scribeId}`);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).replace(/ /g, '-');
  };

  // Get current date and time
  const currentDate = new Date();
  const formattedDateTime = `${formatDate(currentDate)}, ${currentDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })}`;

  // Format date for input value
  const formatDateForInput = (date) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  // Reset filters
  const resetFilters = () => {
    setFilterDate("");
    setFilterSubject("");
  };

  const toLocalDateString = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-CA"); // 'YYYY-MM-DD'
  };

  useEffect(() => {
    if (!filterDate) {
      setFilteredScribes(onlineScribes);
    } else {
      const filtered = onlineScribes.filter((scribe) =>
        Array.isArray(scribe.date) &&
        scribe.date.some((d) => toLocalDateString(d) === filterDate)
      );
      setFilteredScribes(filtered);
    }
  }, [filterDate, onlineScribes]);
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
        <span className="ml-3">Loading...</span>
      </div>
    );
  }

 
  // const extractDate = (isoString) => new Date(isoString).toISOString().split("T")[0];
  // const filteredScribes = filterDate
  // ? onlineScribes.filter((scribe) =>
  //     Array.isArray(scribe.date) &&
  //     scribe.date.some((d) => extractDate(d) === filterDate)
  //   )
  // : onlineScribes;

  return (
    <div className="flex min-h-screen bg-gray-100 text-black">
      {/* Sidebar */}
      <div className="w-60 bg-blue-900 text-white">
        <div className="p-4 text-center bg-blue-950 font-bold text-lg">
          MENU
        </div>
        <div className="p-4">
          <ul className="space-y-6">
            <li className="flex items-center space-x-2 hover:bg-blue-800 p-2 rounded transition">
              <span>📋</span>
              <a href="#" className="hover:underline">My Requests</a>
            </li>
            <li className="flex items-center space-x-2 hover:bg-blue-800 p-2 rounded transition">
              <span>📊</span>
              <a href="#" className="hover:underline">Sessions</a>
            </li>
            <li className="flex items-center space-x-2 hover:bg-blue-800 p-2 rounded transition">
              <span>📈</span>
              <a href="#" className="hover:underline">Progress Report</a>
            </li>
            <li className="flex items-center space-x-2 hover:bg-blue-800 p-2 rounded transition">
              <span>⚙️</span>
              <a href="#" className="hover:underline">Settings</a>
            </li>
            <li className="flex items-center space-x-2 hover:bg-blue-800 p-2 rounded transition">
              <span>🔍</span>
              <a href="#" className="hover:underline">Help Support</a>
            </li>
            <li className="flex items-center space-x-2 hover:bg-blue-800 p-2 rounded transition text-red-300">
              <span>🚪</span>
              <button onClick={async () => {
                try {
                  await axios.post("/api/student/logout");
                  router.push('/');
                } catch (error) {
                  console.error("Logout failed:", error);
                }
              }}>Logout</button>
            </li>
          </ul>
        </div>
       <a href='/studentProfile'> <div className="mt-24 mx-4 p-4 border rounded-lg bg-orange-100 text-black text-center">
          <div className="font-semibold">{user?.fullName || 'Student Name'}</div>
          <div className="text-sm">class {user?.educationLevel || "no data"}</div>
        </div>
        </a>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-orange-400 text-white p-4 text-center">
          <h1 className="text-2xl font-bold">Student Dashboard</h1>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Welcome message */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-blue-900">Welcome, {user?.fullName || 'Student'}!</h2>
            <p className="text-sm text-gray-600">Last login: {formattedDateTime}</p>
          </div>

          {/* Online Scribes Section */}
          <div className="mb-6 bg-white border rounded-lg p-6 shadow">
            <h2 className="text-xl font-bold text-blue-900 mb-4">Online Scribes</h2>
            {filteredScribes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredScribes.map((scribe) => (
                  <div key={scribe.id} className="border rounded-lg p-4 shadow hover:shadow-md transition">
                    <div className="flex items-center mb-2">
                      <div className={`w-3 h-3 rounded-full ${scribe.status === 'available' ? 'bg-green-500' : 'bg-yellow-500'} mr-2`}></div>
                      <span className="font-medium">{scribe.status === 'available' ? 'Available' : 'In Call'}</span>
                    </div>
                    <h3 className="font-medium">Scribe ID: {scribe.aadhaar}</h3>
                    <button
                      onClick={() => startCall(scribe.id)}
                      disabled={scribe.status !== 'available'}
                      className={`mt-3 w-full px-4 py-2 rounded text-white ${
                        scribe.status === 'available' ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {scribe.status === 'available' ? 'Start Call' : 'Busy'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-4 bg-blue-50 rounded">
                <p>No scribes are currently online. Check back later or search all available scribes below.</p>
              </div>
            )}
          </div>

          {/* All Scribes Section with Filters */}
          <div className="mb-6 bg-white border rounded-lg p-6 shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-blue-900">All Available Scribes</h2>
              <button 
                onClick={fetchAllScribes}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              >
                Load All Scribes
              </button>
            </div>

            {/* Filters */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-3">Filter Scribes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Available Date</label>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <select
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Subjects</option>
                    {subjects.map((subject) => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Scribes List */}
            {allScribes.length > 0 ? (
              <div>
                {filteredScribes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredScribes.map((scribe) => (
                      <div key={scribe._id} className="border rounded-lg p-4 shadow hover:shadow-md transition">
                        <h3 className="font-medium">{scribe.fullName}</h3>
                        <p className="text-sm text-gray-600">Aadhaar: {scribe.aadhaarNumber}</p>
                        <p className="text-sm text-gray-600">Qualification: {scribe.highestQualification}</p>
                        <p className="text-sm text-gray-600">Institute: {scribe.institute}</p>
                        <p className="text-sm text-gray-600 mb-3">Location: {scribe.district}, {scribe.state}</p>
                        
                        {scribe.availableDates && scribe.availableDates.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium">Available Dates:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {scribe.availableDates.slice(0, 3).map((date, idx) => (
                                <span key={idx} className="text-xs bg-blue-100 px-2 py-1 rounded">
                                  {formatDate(date)}
                                </span>
                              ))}
                              {scribe.availableDates.length > 3 && (
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  +{scribe.availableDates.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <button
                          onClick={() => {
                            // In a real app, you would implement booking logic here
                            alert(`Booking scribe: ${scribe.fullName}`);
                          }}
                          className="w-full mt-2 bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded"
                        >
                          Book Scribe
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-4 bg-blue-50 rounded">
                    <p>No scribes match your filter criteria. Please adjust your filters and try again.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-4 bg-blue-50 rounded">
                <p>Click "Load All Scribes" to view available scribes.</p>
              </div>
            )}
          </div>

          {/* Other Dashboard Components */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Sessions */}
            <div className="bg-white border rounded-lg p-6 shadow">
              <h2 className="text-xl font-bold text-blue-900 mb-4">Recent Support Sessions</h2>
              <div className="space-y-3">
                {recentSessions.map((session, index) => (
                  <div key={index} className="p-3 border-b last:border-0">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{session.subject}</span>
                      <span className={`text-sm px-2 py-1 rounded ${
                        session.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>{session.status}</span>
                    </div>
                    <p className="text-sm text-gray-600">{session.date}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Exams */}
            <div className="bg-white border rounded-lg p-6 shadow">
              <h2 className="text-xl font-bold text-blue-900 mb-4">Upcoming Examinations</h2>
              <div className="space-y-3">
                {upcomingExams.map((exam, index) => (
                  <div key={index} className="p-3 border-b last:border-0">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{exam.subject}</span>
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">{exam.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// // 'use client';

// // import axios from "axios";
// // import { useEffect, useState } from "react";

// // export default function StudentDashboard() {
// //   const [lastLogin] = useState("08-Apr-2025, 09:45 AM");
// //   const [studentName] = useState("Rahul");
// //   const [studentFullName] = useState("Rahul Sharma");
// //   const [studentClass] = useState("Class XII - CBSE");
// //   const [data, setdata] = useState("");
  
// //   const [recentSessions] = useState([
// //     { subject: "Mathematics", date: "05-Apr-2025", status: "Completed" },
// //     { subject: "Physics Lab Report", date: "01-Apr-2025", status: "Completed" }
// //   ]);
  
// //   const [upcomingExams] = useState([
// //     { subject: "CBSE Physics", date: "15-Apr-2025" },
// //     { subject: "CBSE Chemistry", date: "20-Apr-2025" },
// //     { subject: "CBSE Mathematics", date: "25-Apr-2025" }
// //   ]);

// //   const handleCreateRequest = () => {
// //     alert("Opening request form");
// //     // In a real app, this would navigate to a form or open a modal
// //   };

// //   const logout = async () => {
// //     try {
// //       const res = await axios.post("/api/student/logout");
// //       window.location.href = '/';  // Redirect to home/login page
// //     } catch (error) {
// //       console.error("Logout failed:", error);
// //       alert("Logout failed. Please try again.");
// //     }
// //   };

// //   const stddata = async () => {
// //     try {
// //         console.log("Fetching buyer data...");
// //         const res = await axios.post("/api/student/getdata");
// //         console.log(res.data.data, 'dash board data');
// //         setdata(res.data.data);
// //     } catch (error) {
// //         console.error("Error fetching buyer data:", error);
// //     }
// //   };

// //   useEffect(() => {
// //     stddata();
// //   }, []);

// //   return (
// //     <div className="flex flex-col min-h-screen bg-white text-black">
// //       {/* Header */}
// //       <header className="bg-orange-400 text-white text-center py-4 text-2xl font-bold">
// //         Student Dashboard
// //       </header>
      
// //       <div className="flex flex-grow">
// //         {/* Sidebar */}
// //         <aside className="w-60 bg-gray-100">
// //           {/* Menu header */}
// //           <div className="bg-blue-900 text-white p-4 font-bold">
// //             MENU
// //           </div>
          
// //           {/* Menu items */}
// //           <nav className="flex flex-col p-4 space-y-6">
// //             <a href="#" className="flex items-center space-x-2">
// //               <span className="text-gray-500">📋</span>
// //               <span>My Requests</span>
// //             </a>
// //             <a href="#" className="flex items-center space-x-2">
// //               <span className="text-gray-500">📊</span>
// //               <span>Sessions</span>
// //             </a>
// //             <a href="#" className="flex items-center space-x-2">
// //               <span className="text-gray-500">📈</span>
// //               <span>Progress Report</span>
// //             </a>
// //             <a href="#" className="flex items-center space-x-2">
// //               <span className="text-gray-500">⚙️</span>
// //               <span>Settings</span>
// //             </a>
// //             <a href="#" className="flex items-center space-x-2">
// //               <span className="text-gray-500">🔍</span>
// //               <span>Help Support</span>
// //             </a>
            
// //             {/* Logout button - added */}
// //             <button 
// //               onClick={logout} 
// //               className="flex items-center space-x-2 text-red-600 hover:text-red-800 mt-4 font-medium"
// //             >
// //               <span>🚪</span>
// //               <span>Logout</span>
// //             </button>
// //           </nav>
          
// //           {/* Student info */}
// //           <div className="mt-12 p-4">
// //             <div className="border-2 border-orange-300 rounded-full p-3 text-center">
// //               <div className="font-bold">{data && data.fullName ? data.fullName : ""}</div>
// //               <div className="text-sm text-gray-600">{studentClass}</div>
// //             </div>
// //           </div>
// //         </aside>
        
// //         {/* Main content */}
// //         <main className="flex-grow p-4">
// //           {/* Welcome section */}
// //           <div className="mb-4">
// //             <h1 className="text-xl text-blue-900 font-bold">Welcome, {data && data.fullName ? data.fullName : ""}!</h1>
// //             {/* <p className="text-gray-600">Last login: {lastLogin}</p> */}
// //           </div>
          
// //           {/* Support Request section */}
// //           <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
// //             <h2 className="text-xl text-blue-900 font-bold mb-2">Create New Support Request</h2>
// //             <div className="flex justify-between items-center">
// //               <p>Request assistance from a qualified scribe for your examinations or studies</p>
// //               <button 
// //                 onClick={handleCreateRequest}
// //                 className="bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded-lg"
// //               >
// //                 Create Request
// //               </button>
// //             </div>
// //           </div>
          
// //           {/* Recent Sessions section */}
// //           <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
// //             <h2 className="text-xl text-blue-900 font-bold mb-4">Recent Support Sessions</h2>
// //             {recentSessions.map((session, index) => (
// //               <div key={index} className="mb-2">
// //                 {session.subject} - {session.date} - {session.status}
// //               </div>
// //             ))}
// //           </div>
          
// //           {/* Upcoming Exams section */}
// //           <div className="bg-white border border-gray-200 rounded-lg p-4">
// //             <h2 className="text-xl text-blue-900 font-bold mb-4">Upcoming Examinations</h2>
// //             <ul className="list-disc pl-6">
// //               {upcomingExams.map((exam, index) => (
// //                 <li key={index} className="mb-2">
// //                   {exam.subject} - {exam.date}
// //                 </li>
// //               ))}
// //             </ul>
// //           </div>
// //         </main>
// //       </div>
// //     </div>
// //   );
// // }

// // app/studentdashboard/page.js
// // 'use client';
// // import { useState, useEffect } from 'react';
// // import useSocket from '../hooks/useSocket';
// // import { useRouter } from 'next/navigation';
// // import axios from 'axios';

// // export default function StudentDashboard() {
// //   const router = useRouter();
// //   const { socket, isConnected } = useSocket();
// //   const [user, setUser] = useState(null);
// //   const [onlineScribes, setOnlineScribes] = useState([]);
// //   const [loading, setLoading] = useState(true);
  

// //   useEffect(() => {
// //     // Get user data from token
// //     const getUserData = async () => {
// //       try {
// //         // const res = await fetch('/api/token');
// //         // const data = await res.json();
// //         const res = await axios.post("/api/student/getdata");
// //         if(res){
// //         console.log(res.data.data, 'dash board data');
// //         setUser(res.data.data);
// //         }else{
// //           alert("login first")
// //         }
        
// //         // if (data.decodedToken && data.decodedToken.role === 'student') {
// //         //   setUser(data.decodedToken);
// //         // } else {
// //         //   // Redirect if not a student
// //         //   router.push('/login');
// //         // }
// //         setLoading(false);
// //       } catch (error) {
// //         console.error('Error fetching user data:', error);
// //         setLoading(false);
// //       }
// //     };
    
// //     getUserData();
// //   }, []);

// //   // Register with socket once connected and user data loaded
// //   useEffect(() => {
// //     if (socket && user) {
// //       // Register with socket
// //       socket.emit('register', {
// //         role: user.role,
// //         id: user._id,
// //         aadhaar: user.aadhaarNumber
// //       });
      
// //       // Listen for online scribes updates
// //       socket.on('scribes-online', (scribes) => {
// //         setOnlineScribes(scribes);
// //       });
// //     }
    
// //     return () => {
// //       if (socket) {
// //         socket.off('scribes-online');
// //       }
// //     };
// //   }, [socket, user]);

// //   // const startCall = (scribeId) => {
// //   //   // Generate a room ID based on both user IDs to ensure uniqueness
// //   //   const roomId = [user._id, scribeId].sort().join('_');
// //   //   router.push(`/call/${roomId}?target=${scribeId}`);
// //   // };

// //   const startCall = (scribeId) => {
// //     // Generate a consistent roomId using sorted IDs
// //     const roomId = `room_${[user._id, scribeId].sort().join('_')}`;
  
// //     // Emit a call-request to the server with room info and target scribe
// //     socket.emit("call-request", {
// //       roomId,
// //       target: scribeId,
// //       from: { id: user._id, role: user.role, fullName: user.fullName }
// //     });
    
// //     // Optionally, navigate the student to the call room immediately
// //     router.push(`/call/${roomId}?target=${scribeId}`);
// //   };
  
  
// //   if (loading) {
// //     return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
// //   }

// //   return (
// //     <div className="container mx-auto px-4 py-8 text-black">
// //       <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>
      
// //       <div className="bg-white rounded-lg shadow-md p-6 mb-8">
// //         <h2 className="text-xl font-semibold mb-4">Welcome, {user?.fullName || 'Student'}</h2>
// //         <p>Find available scribes below and start a video call.</p>
// //       </div>
      
// //       <div className="bg-white rounded-lg shadow-md p-6">
// //         <h2 className="text-xl font-semibold mb-4">Online Scribes</h2>
        
// //         {onlineScribes.length === 0 ? (
// //           <p className="text-gray-500">No scribes are currently online.</p>
// //         ) : (
// //           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
// //             {/* {onlineScribes.map((scribe) => (
// //               <div key={scribe.id} className="border rounded-lg p-4 flex flex-col">
// //                 <div className="flex items-center mb-2">
// //                   <div className={`w-3 h-3 rounded-full ${scribe.status === 'available' ? 'bg-green-500' : 'bg-yellow-500'} mr-2`}></div>
// //                   <span className="font-medium">{scribe.status === 'available' ? 'Available' : 'In Call'}</span>
// //                 </div>
// //                 <div className="mb-2">
// //                   <p className="text-sm text-gray-600">ID: {scribe.id}</p>
// //                 </div>
// //                 <div className="mt-auto">
// //                   <button
// //                     className={`w-full py-2 px-4 rounded ${scribe.status === 'available' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
// //                     onClick={() => startCall(scribe.id)}
// //                     disabled={scribe.status !== 'available'}
// //                   >
// //                     {scribe.status === 'available' ? 'Start Call' : 'Currently Busy'}
// //                   </button>
// //                 </div>
// //               </div>
// //             ))} */}
// //             {onlineScribes.map((scribe) => (
// //   <div key={scribe.id} className="border rounded p-4 shadow">
// //     <h3 className="text-lg font-bold mb-2">Scribe: {scribe.aadhaar}</h3>
// //     <p>Status: {scribe.status}</p>
// //     <button
// //       onClick={() => startCall(scribe.id)}
// //       disabled={scribe.status !== 'available'}
// //       className={`mt-2 px-4 py-2 rounded text-white ${
// //         scribe.status === 'available' ? 'bg-green-600' : 'bg-gray-400 cursor-not-allowed'
// //       }`}
// //     >
// //       {scribe.status === 'available' ? 'Start Call' : 'Busy'}
// //     </button>
// //   </div>
// // ))}

// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }

// 'use client';
// import { useState, useEffect } from 'react';
// import useSocket from '../hooks/useSocket';
// import { useRouter } from 'next/navigation';
// import axios from 'axios';

// export default function StudentDashboard() {
//   const router = useRouter();
//   const { socket, isConnected } = useSocket();
//   const [user, setUser] = useState(null);
//   const [onlineScribes, setOnlineScribes] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [recentSessions, setRecentSessions] = useState([
//     { subject: 'Mathematics', date: '05-Apr-2025', status: 'Completed' },
//     { subject: 'Physics Lab Report', date: '01-Apr-2025', status: 'Completed' }
//   ]);
//   const [upcomingExams, setUpcomingExams] = useState([
//     { subject: 'CBSE Physics', date: '15-Apr-2025' },
//     { subject: 'CBSE Chemistry', date: '20-Apr-2025' },
//     { subject: 'CBSE Mathematics', date: '25-Apr-2025' }
//   ]);
//   const[ scribedata , setscribedata] = useState([]);

//   useEffect(() => {
//     // Get user data from token
//     const getUserData = async () => {
//       try {
//         const res = await axios.post("/api/student/getdata");
//         if(res) {
//           console.log(res.data.data, 'dash board data');
//           setUser(res.data.data);
//         } else {
//           alert("login first");
//         }
//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching user data:', error);
//         setLoading(false);
//       }
//     };
    
//     getUserData();
//   }, []);

//   const getallscribe = async () => {
//     try {

//       const scribes = await axios.post("/api/getallscribe");
//       console.log(scribes.data);
//       setscribedata(scribes.data)
    
//     } catch (error) {
//       console.log(error);
      
//     }
//   }

//   // Register with socket once connected and user data loaded
//   useEffect(() => {
//     if (socket && user) {
//       // Register with socket
//       socket.emit('register', {
//         role: user.role,
//         id: user._id,
//         aadhaar: user.aadhaarNumber
//       });
      
//       // Listen for online scribes updates
//       socket.on('scribes-online', (scribes) => {
//         setOnlineScribes(scribes);
//       });
//     }
    
//     return () => {
//       if (socket) {
//         socket.off('scribes-online');
//       }
//     };
//   }, [socket, user]);

//   const startCall = (scribeId) => {
//     // Generate a consistent roomId using sorted IDs
//     const roomId = `room_${[user._id, scribeId].sort().join('_')}`;
  
//     // Emit a call-request to the server with room info and target scribe
//     socket.emit("call-request", {
//       roomId,
//       target: scribeId,
//       from: { id: user._id, role: user.role, fullName: user.fullName }
//     });
    
//     // Navigate the student to the call room
//     router.push(`/call/${roomId}?target=${scribeId}`);
//   };
  
//   if (loading) {
//     return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
//   }

//   // Get current date and format it
//   const formatDate = (date) => {
//     return date.toLocaleDateString('en-GB', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric'
//     }).replace(/ /g, '-');
//   };

//   const currentDate = new Date();
//   const formattedDate = `${formatDate(currentDate)}, ${currentDate.toLocaleTimeString('en-US', {
//     hour: '2-digit',
//     minute: '2-digit',
//     hour12: true
//   })}`;

//   const createSupportRequest = () => {
//     router.push('/create-request');
//   };

//   return (
//     <div className="flex min-h-screen bg-gray-100 text-black">
//       {/* Sidebar */}
//       <div className="w-48 bg-blue-900 text-white">
//         <div className="p-4 text-center bg-blue-950 font-bold">
//           MENU
//         </div>
//         <div className="p-4">
//           <ul className="space-y-4">
//             <li className="flex items-center space-x-2">
//               <span>📋</span>
//               <a href="#" className="hover:underline">My Requests</a>
//             </li>
//             <li className="flex items-center space-x-2">
//               <span>📊</span>
//               <a href="#" className="hover:underline">Sessions</a>
//             </li>
//             <li className="flex items-center space-x-2">
//               <span>📈</span>
//               <a href="#" className="hover:underline">Progress Report</a>
//             </li>
//             <li className="flex items-center space-x-2">
//               <span>⚙️</span>
//               <a href="#" className="hover:underline">Settings</a>
//             </li>
//             <li className="flex items-center space-x-2">
//               <span>🔍</span>
//               <a href="#" className="hover:underline">Help support</a>
//             </li>
//           </ul>
//         </div>
//         <div className="mt-36 mx-4 p-4 border rounded-lg bg-orange-100 text-black text-center">
//           <div className="font-semibold">{user?.fullName || 'Student Name'}</div>
//           <div className="text-sm">Class XII - CBSE</div>
//         </div>
//       </div>

//       {/* Main content */}
//       <div className="flex-1">
//         {/* Header */}
//         <div className="bg-orange-400 text-white p-4 text-center">
//           <h1 className="text-2xl font-bold">Student Dashboard</h1>
//         </div>

//         {/* Content */}
//         <div className="p-4">
//           {/* Welcome message */}
//           <div className="mb-4">
//             <h2 className="text-lg font-bold">Welcome, {user?.fullName || 'Student'}!</h2>
//             <p className="text-sm text-gray-600">Last login: {formattedDate}</p>
//           </div>

//           {/* Support Request */}
//           <div className="mb-4 border rounded p-4">
//             <h2 className="text-lg font-bold text-blue-800 mb-2">See all the Scribes</h2>
//             <div className="flex justify-between items-center">
//               <p className="text-sm">Request assistance from a qualified scribe for your examinations or studies</p>
//               <button 
//                 onClick={getallscribe}
//                 className="bg-orange-400 text-white px-4 py-2 rounded hover:bg-orange-500"
//               >
//                 See All Scribes
//               </button>
//             </div>
//           </div>

//           {/* Recent Sessions */}
//           <div className="mb-4 border rounded p-4">
//             <h2 className="text-lg font-bold text-blue-800 mb-2">Recent Support Sessions</h2>
//             {recentSessions.map((session, index) => (
//               <div key={index} className="mb-1">
//                 <p>{session.subject} - {session.date} - {session.status}</p>
//               </div>
//             ))}
//           </div>

//           {/* Upcoming Exams */}
//           <div className="mb-4 border rounded p-4">
//             <h2 className="text-lg font-bold text-blue-800 mb-2">Upcoming Examinations</h2>
//             <ul>
//               {upcomingExams.map((exam, index) => (
//                 <li key={index} className="mb-1">• {exam.subject} - {exam.date}</li>
//               ))}
//             </ul>
//           </div>

//           {/* Online Scribes - Only shown when there are scribes available */}
//           {onlineScribes.length > 0 && (
//             <div className="mb-4 border rounded p-4">
//               <h2 className="text-lg font-bold text-blue-800 mb-2">Available Scribes</h2>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                 {onlineScribes.map((scribe) => (
//                   <div key={scribe.id} className="border rounded p-3 shadow">
//                     <h3 className="font-medium">Scribe: {scribe.aadhaar}</h3>
//                     <p className="text-sm">Status: {scribe.status}</p>
//                     <button
//                       onClick={() => startCall(scribe.id)}
//                       disabled={scribe.status !== 'available'}
//                       className={`mt-2 px-3 py-1 rounded text-white text-sm ${
//                         scribe.status === 'available' ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
//                       }`}
//                     >
//                       {scribe.status === 'available' ? 'Start Call' : 'Busy'}
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
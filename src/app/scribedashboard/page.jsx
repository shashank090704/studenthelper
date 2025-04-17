'use client';
import { useState, useEffect } from 'react';
import { Calendar, MessageSquare, Clock, CheckCircle, ArrowLeft, ArrowRight, Phone, PhoneOff } from 'lucide-react';
import useSocket from '../hooks/useSocket';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function ScribeDashboard() {
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  
  // User and status state
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('offline');
  const [loading, setLoading] = useState(true);
  
  // Calendar state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState([]);
  const [viewMonth, setViewMonth] = useState(new Date());
  
  // Sample data - These would come from API in production
  const pendingRequests = [
    {
      id: 1,
      studentName: 'Ramesh Kumar',
      subject: 'Math assistance',
      class: 'Class 10',
      requestDate: new Date(2025, 3, 15) // April 15, 2025
    },
    {
      id: 2,
      studentName: 'Priya Sharma',
      subject: 'English essay review',
      class: 'Class 12',
      requestDate: new Date(2025, 3, 16) // April 16, 2025
    }
  ];

  const upcomingSchedules = [
    {
      id: 1,
      studentName: 'Akash Patel',
      subject: 'Science tutoring',
      class: 'Class 9',
      scheduleDate: new Date(2025, 3, 18, 16, 0), // April 18, 2025, 4:00 PM
      endTime: new Date(2025, 3, 18, 17, 30) // April 18, 2025, 5:30 PM
    },
    {
      id: 2,
      studentName: 'Meera Singh',
      subject: 'History concepts',
      class: 'Class 11',
      scheduleDate: new Date(2025, 3, 20, 10, 0), // April 20, 2025, 10:00 AM
      endTime: new Date(2025, 3, 20, 11, 30) // April 20, 2025, 11:30 AM
    }
  ];

  const completedSessions = [
    {
      id: 1,
      studentName: 'Rahul Verma',
      subject: 'Mathematics',
      class: 'Class 8',
      sessionDate: new Date(2025, 3, 12, 15, 0), // April 12, 2025, 3:00 PM
      endTime: new Date(2025, 3, 12, 16, 30), // April 12, 2025, 4:30 PM
      hasFeedback: true
    },
    {
      id: 2,
      studentName: 'Ananya Gupta',
      subject: 'Physics',
      class: 'Class 12',
      sessionDate: new Date(2025, 3, 10, 17, 0), // April 10, 2025, 5:00 PM
      endTime: new Date(2025, 3, 10, 18, 30), // April 10, 2025, 6:30 PM
      hasFeedback: true
    }
  ];

  // Fetch user data
  useEffect(() => {
    const getUserData = async () => {
      try {
        // Add debug logs to see the API call and response
        console.log("Fetching user data...");
        const res = await axios.post("/api/scribe/getdata");
        console.log("API Response:", res);

        // Check if we have any response at all
        if (!res) {
          console.error("No response from API");
          setLoading(false);
          // Don't redirect yet, let's see what's in the response first
          return;
        }

        // Check the response structure more thoroughly
        console.log("Response status:", res.status);
        console.log("Response data:", res.data);

        // Modify the condition to be more lenient
        // Only redirect if we're sure there's no user data
        if (res.data && res.status === 200) {
          let userData = res.data;
          
          // Handle different response structures
          if (res.data.data) {
            userData = res.data.data;
          }
          
          console.log("User data:", userData);
          
          // Check if we have at least some minimal user information
          if (userData && (userData._id || userData.id || userData.fullName || userData.aadhaarNumber)) {
            setUser(userData);
            
            // Initialize selected dates from user data
            if (userData.availableDates && Array.isArray(userData.availableDates)) {
              const formattedDates = userData.availableDates.map(date => new Date(date));
              setSelectedDates(formattedDates);
            }
            
            setLoading(false);
            return;
          }
        }
        
        // If we reach this point, we don't have valid user data
        console.log("No valid user data found, redirecting to login");
        setLoading(false);
        router.push('/login');
      } catch (error) {
        console.error('Error fetching user data:', error);
        
        // Don't redirect immediately on error - check if the error is 401 Unauthorized
        if (error.response && error.response.status === 401) {
          console.log("Unauthorized access, redirecting to login");
          router.push('/login');
        } else {
          // For other errors, just show the error state but don't redirect
          console.log("API error, but not redirecting");
          setLoading(false);
        }
      }
    };
    
    getUserData();
  }, [router]);

  // WebRTC socket connection effect
  useEffect(() => {
    if (socket && user) {
      // Register with socket
      console.log(user, "user info");
      socket.emit('register', {
        role: user.role,
        id: user._id || user.id, // Handle both _id and id fields
        aadhaar: user.aadhaarNumber,
        date : user.availableDates,
        class : user.highestQualification
      });
      
      setStatus('available');
      
      // Listen for call requests
      socket.on('user-joined', (userData) => {
        if (userData.role === 'Student') {
          // Could show notification that a student joined a room
          console.log(`Student ${userData.id} is looking for help`);
        }
      });
    }
    
    return () => {
      if (socket) {
        socket.off('user-joined');
      }
    };
  }, [socket, user]);

  // Handle call invite
  useEffect(() => {
    if (socket) {
      const handleCallInvite = (data) => {
        console.log("Received call invite:", data);
        
        // Show a modal/notification and let the scribe choose to join
        if (window.confirm(`Student ${data.from.fullName} is calling. Join call?`)) {
          router.push(`/call/${data.roomId}?target=${data.from.id}`);
        }
      };
  
      socket.on("call-invite", handleCallInvite);
  
      return () => {
        socket.off("call-invite", handleCallInvite);
      };
    }
  }, [socket, router]);

  // Toggle availability status
  const toggleStatus = () => {
    const newStatus = status === 'available' ? 'offline' : 'available';
    setStatus(newStatus);
    
    if (socket && user) {
      socket.emit('status-update', {
        id: user._id || user.id, // Handle both _id and id fields
        status: newStatus
      });
    }
    
    // Log the status change
    console.log(`Status changed to: ${newStatus}`);
    
    // If going offline, inform any active connections that you're not available
    if (newStatus === 'offline' && socket) {
      socket.emit('scribe-unavailable', {
        id: user._id || user.id // Handle both _id and id fields
      });
    }
  };

  // Handle date click on calendar
  const handleDateClick = (date) => {
    const dateString = date.toDateString();
    
    // Check if date is already selected
    const isSelected = selectedDates.some(d => d.toDateString() === dateString);
    
    if (isSelected) {
      // Remove date if already selected
      setSelectedDates(selectedDates.filter(d => d.toDateString() !== dateString));
    } else {
      // Add date if not selected
      setSelectedDates([...selectedDates, date]);
    }
  };

  // Save availability to the database
  const saveAvailability = async () => {
    try {
      // Make API call to save selected dates
      const response = await axios.post('/api/scribe/updateavailability', {  
        availableDates: selectedDates,
        userId: user._id || user.id // Handle both _id and id fields
      });
      
      if (response.status === 200) {
        alert('Availability saved successfully!');
      } else {
        alert('Failed to save availability');
      }
    } catch (error) {
      console.error('Error saving availability:', error);
      alert('Error saving availability');
    }
  };

  // Calendar navigation functions
  const prevMonth = () => {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1));
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    
    // Get the first day of the month
    const firstDay = new Date(year, month, 1);
    const startingDayOfWeek = firstDay.getDay();
    
    // Get the last day of the month
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Get the last day of previous month
    const prevMonthLastDay = new Date(year, month, 0);
    const prevMonthDays = prevMonthLastDay.getDate();
    
    const days = [];
    
    // Add days from previous month
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      days.push({
        day,
        month: month - 1,
        year,
        isCurrentMonth: false
      });
    }
    
    // Add days from current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        month,
        year,
        isCurrentMonth: true
      });
    }
    
    // Add days from next month to complete the calendar grid
    const remainingDays = 42 - days.length; // 6 rows x 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        month: month + 1,
        year,
        isCurrentMonth: false
      });
    }
    
    return days;
  };

  // Function to check if a date is available (selected)
  const isDateAvailable = (date) => {
    return selectedDates.some(d => d.toDateString() === date.toDateString());
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

  // Format time for display
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check if date is today
  const isToday = (day, month, year) => {
    const today = new Date();
    return day === today.getDate() && 
           month === today.getMonth() && 
           year === today.getFullYear();
  };

  // Get current date and time for display
  const now = new Date();
  const formattedDateTime = `${formatDate(now)}, ${now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })}`;

  const calendarDays = generateCalendarDays();
  const monthYearString = viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
        <span className="ml-3">Loading...</span>
      </div>
    );
  }

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
              <a href="#" className="hover:underline">My Schedule</a>
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
        <a href='/scribeProfile'><div className="mt-24 mx-4 p-4 border rounded-lg bg-orange-100 text-black text-center">
          <div className="font-semibold">{user?.fullName || 'Scribe Name'}</div>
          <div className="text-sm">CLASS {user?.highestQualification || 'Qualification'}</div>
        </div></a>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-orange-400 text-white p-4 text-center">
          <h1 className="text-2xl font-bold">Scribe Dashboard</h1>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Welcome message */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-blue-900">Welcome, {user?.fullName || 'Scribe'}!</h2>
            <p className="text-sm text-gray-600">Last login: {formattedDateTime}</p>
          </div>

          {/* Availability Status Section */}
          <div className="mb-6 bg-white border rounded-lg p-6 shadow">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-blue-900 mb-4">Availability Status</h2>
              <div className={`flex items-center px-4 py-2 rounded-lg ${status === 'available' ? 'bg-green-100' : 'bg-gray-200'}`}>
                <div className={`w-3 h-3 rounded-full mr-2 ${status === 'available' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                <span className="mr-4">{status === 'available' ? 'Available for Calls' : 'Offline'}</span>
                <button 
                  onClick={toggleStatus}
                  className={`px-4 py-2 rounded-md text-white flex items-center gap-2 ${status === 'available' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                >
                  {status === 'available' ? (
                    <>
                      <PhoneOff size={16} />
                      Go Offline
                    </>
                  ) : (
                    <>
                      <Phone size={16} />
                      Go Online
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* WebRTC Status Indicator */}
            <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className="font-medium">
                  {isConnected ? 'WebRTC Connected' : 'Connecting to WebRTC service...'}
                </span>
                {status === 'available' && isConnected && (
                  <span className="ml-2 text-green-600">
                    Your profile is visible to students who need assistance
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Pending Requests Section */}
          <div className="mb-6 bg-white border rounded-lg p-6 shadow">
            <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
              <Clock size={20} />
              Pending Requests
            </h2>
            {pendingRequests.length > 0 ? (
              <div className="space-y-4">
                {pendingRequests.map(request => (
                  <div key={request.id} className="border p-4 rounded-md hover:shadow-md transition">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{request.studentName}</h3>
                        <p className="text-sm text-gray-600">
                          {request.subject} - {request.class} • Requested on {formatDate(request.requestDate)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button className="bg-green-500 text-white px-4 py-2 rounded-md flex items-center gap-1">
                          <CheckCircle size={16} />
                          Accept
                        </button>
                        <button className="bg-red-500 text-white px-4 py-2 rounded-md">
                          Decline
                        </button>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-1">
                          <MessageSquare size={16} />
                          Chat
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-4 bg-blue-50 rounded">
                <p>No pending requests</p>
              </div>
            )}
          </div>

          {/* Calendar Section */}
          <div className="mb-6 bg-white border rounded-lg p-6 shadow">
            <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
              <Calendar size={20} />
              Mark Your Availability
            </h2>
            <div className="flex justify-between items-center mb-4">
              <button 
                onClick={prevMonth} 
                className="w-8 h-8 text-gray-800 flex items-center justify-center bg-gray-200 rounded-full"
              >
                <ArrowLeft size={16} />
              </button>
              <span className="font-medium text-gray-800">{monthYearString}</span>
              <button 
                onClick={nextMonth} 
                className="w-8 h-8 flex text-gray-800 items-center justify-center bg-gray-200 rounded-full"
              >
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-7 gap-1 text-center">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} className="text-gray-500 font-medium py-2">{day}</div>
                ))}
                
                {calendarDays.map((day, index) => {
                  const date = new Date(day.year, day.month, day.day);
                  const isAvailable = isDateAvailable(date);
                  const isPastDate = date < new Date(new Date().setHours(0, 0, 0, 0));
                  
                  // Determine styling based on date status
                  let bgColor = "bg-transparent";
                  let textColor = day.isCurrentMonth ? "text-gray-800" : "text-gray-400";
                  let border = "border border-gray-200";
                  
                  if (isToday(day.day, day.month, day.year)) {
                    bgColor = "bg-blue-100";
                    border = "border-2 border-blue-600";
                    textColor = "text-blue-700 font-bold";
                  } else if (isAvailable) {
                    bgColor = "bg-green-500";
                    textColor = "text-white";
                  }
                  
                  return (
                    <div 
                      key={index}
                      onClick={() => !isPastDate && day.isCurrentMonth && handleDateClick(date)}
                      className={`rounded-full w-8 h-8 flex items-center justify-center m-1 cursor-pointer
                        ${bgColor} ${textColor} ${border}
                        ${isPastDate && day.isCurrentMonth ? "opacity-50 cursor-not-allowed" : ""}
                        ${day.isCurrentMonth ? "hover:bg-gray-200" : ""}
                      `}
                    >
                      {day.day}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Calendar Legend */}
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span className="text-sm">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-100 border-2 border-blue-600"></div>
                <span className="text-sm">Today</span>
              </div>
            </div>

            {/* Save Availability Button */}
            <button
              onClick={saveAvailability}
              className="bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded w-full"
            >
              Save Availability
            </button>
          </div>

          {/* Dashboard Components in Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upcoming Schedules */}
            <div className="bg-white border rounded-lg p-6 shadow">
              <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                <Calendar size={20} />
                Upcoming Schedules
              </h2>
              <div className="space-y-3">
                {upcomingSchedules.map(schedule => (
                  <div key={schedule.id} className="p-3 border-b last:border-0">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{schedule.studentName}</span>
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {formatDate(schedule.scheduleDate)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {schedule.subject} - {schedule.class}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatTime(schedule.scheduleDate)} - {formatTime(schedule.endTime)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Completed Sessions */}
            <div className="bg-white border rounded-lg p-6 shadow">
              <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                <CheckCircle size={20} />
                Completed Sessions
              </h2>
              <div className="space-y-3">
                {completedSessions.map(session => (
                  <div key={session.id} className="p-3 border-b last:border-0">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{session.studentName}</span>
                      <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                        {formatDate(session.sessionDate)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {session.subject} - {session.class}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatTime(session.sessionDate)} - {formatTime(session.endTime)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Profile Summary */}
          <div className="mt-6 bg-white border rounded-lg p-6 shadow">
            <h2 className="text-xl font-bold text-blue-900 mb-4">
              Profile Summary
            </h2>
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-xl font-bold mr-4">
                {user?.fullName?.charAt(0) || 'S'}
              </div>
              <div>
                <h3 className="text-lg font-medium">{user?.fullName}</h3>
                <p className="text-gray-600">{user?.highestQualification}, {user?.institute}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-500 block">Aadhaar:</span>
                <p className="font-medium">XXXX-XXXX-{user?.aadhaarNumber?.substring(8) || '0000'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-500 block">Mobile:</span>
                <p className="font-medium">{user?.mobileNumber || 'Not provided'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-500 block">Email:</span>
                <p className="font-medium">{user?.email || 'Not provided'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-500 block">Location:</span>
                <p className="font-medium">{user?.district || 'District'}, {user?.state || 'State'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
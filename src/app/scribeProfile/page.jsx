'use client';
import { useState, useEffect } from 'react';
import useSocket from '../hooks/useSocket';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function ScribeDashboard() {
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('offline');
  const [loading, setLoading] = useState(true);
  const [recentSessions, setRecentSessions] = useState([
    { subject: 'Mathematics Exam', student: 'Rahul Sharma', date: '05-Apr-2025', status: 'Completed' },
    { subject: 'Physics Lab Report', student: 'Priya Patel', date: '01-Apr-2025', status: 'Completed' }
  ]);
  const [upcomingSchedule, setUpcomingSchedule] = useState([
    { subject: 'Chemistry Support', student: 'Amit Kumar', date: '17-Apr-2025', time: '10:00 AM' },
    { subject: 'Mathematics Help', student: 'Sneha Gupta', date: '22-Apr-2025', time: '2:30 PM' }
  ]);
  
  useEffect(() => {
    const getUserData = async () => {
      try {
        const res = await axios.post("/api/scribe/getdata");
        if(res){
          console.log(res.data.data, 'dash board data');
          setUser(res.data.data);
        } else {
          alert("login first");
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };
    
    getUserData();
  }, []);

  // Register with socket once connected and user data loaded
  useEffect(() => {
    if (socket && user) {
      // Register with socket
      console.log(user, "user111");
      socket.emit('register', {
        role: user.role,
        id: user._id,
        aadhaar: user.aadhaarNumber,
        date : user.availableDates,
        class : user.highestQualification
      });
      
      setStatus('available');
      
      // Listen for call requests
      socket.on('user-joined', (userData) => {
        if (userData.role === 'Student') {
          // Could show notification that a student joined a room
          console.log(`Student ${userData.id} is calling you`);
        }
      });
    }
    
    return () => {
      if (socket) {
        socket.off('user-joined');
      }
    };
  }, [socket, user]);

  useEffect(() => {
    if (!socket) return;
    
    // Listen for a new user joining the room.
    const handleUserJoined = (userData) => {
      console.log("Received 'user-joined' event:", userData);
      // Here you would handle creating an offer or any other actions needed.
    };
  
    socket.on("user-joined", handleUserJoined);
  
    return () => {
      socket.off("user-joined", handleUserJoined);
    };
  }, [socket]);

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
  
  const toggleStatus = () => {
    const newStatus = status === 'available' ? 'offline' : 'available';
    setStatus(newStatus);
    
    if (socket && user) {
      socket.emit('status-update', {
        id: user._id,
        status: newStatus
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  // Get current date and format it
  const formatDate = (date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).replace(/ /g, '-');
  };

  const currentDate = new Date();
  const formattedDate = `${formatDate(currentDate)}, ${currentDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })}`;

  // Format available dates if they exist
  const formatAvailableDates = () => {
    if (!user?.availableDates || user.availableDates.length === 0) {
      return "No dates set";
    }
    return user.availableDates.slice(0, 2).map(date => 
      new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    ).join(", ") + (user.availableDates.length > 2 ? " and more..." : "");
  };
  
  return (
    <div className="flex min-h-screen bg-gray-100 text-black">
      {/* Sidebar */}
      <div className="w-48 bg-green-800 text-white">
        <div className="p-4 text-center bg-green-900 font-bold">
          MENU
        </div>
        <div className="p-4">
          <ul className="space-y-4">
            <li className="flex items-center space-x-2">
              <span>📅</span>
              <a href="#" className="hover:underline">My Schedule</a>
            </li>
            <li className="flex items-center space-x-2">
              <span>📊</span>
              <a href="#" className="hover:underline">Sessions</a>
            </li>
            <li className="flex items-center space-x-2">
              <span>📝</span>
              <a href="#" className="hover:underline">Notes</a>
            </li>
            <li className="flex items-center space-x-2">
              <span>⚙️</span>
              <a href="#" className="hover:underline">Settings</a>
            </li>
            <li className="flex items-center space-x-2">
              <span>🔍</span>
              <a href="#" className="hover:underline">Help support</a>
            </li>
          </ul>
        </div>
        <div className="mt-36 mx-4 p-4 border rounded-lg bg-green-100 text-black text-center">
          <div className="mb-2">
            <div className="w-16 h-16 bg-green-200 rounded-full mx-auto flex items-center justify-center text-green-700 text-xl font-bold">
              {user?.fullName?.charAt(0) || 'S'}
            </div>
          </div>
          <div className="font-semibold">{user?.fullName || 'Scribe Name'}</div>  
          <div className="text-sm">Professional Scribe</div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1">
        {/* Header */}
        <div className="bg-green-500 text-white p-4 text-center">
          <h1 className="text-2xl font-bold">Scribe Profile</h1>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Welcome message */}
          <div className="mb-4">
            <h2 className="text-lg font-bold">Welcome, {user?.fullName || 'Scribe'}!</h2>
            <p className="text-sm text-gray-600">Last login: {formattedDate}</p>
          </div>

          {/* Status Toggle */}
          <div className="mb-4 border rounded p-4">
            <h2 className="text-lg font-bold text-green-800 mb-2">Your Availability</h2>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full ${status === 'available' ? 'bg-green-500' : 'bg-gray-400'} mr-2`}></div>
                <p>Status: <span className="font-medium">{status === 'available' ? 'Online - Available for calls' : 'Offline'}</span></p>
              </div>
              <button 
                onClick={toggleStatus}
                className={`px-4 py-2 rounded text-white ${status === 'available' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
              >
                {status === 'available' ? 'Go Offline' : 'Go Online'}
              </button>
            </div>
          </div>

          {/* Profile Information */}
          <div className="mb-4 border rounded p-4">
            <h2 className="text-lg font-bold text-green-800 mb-2">Your Profile</h2>
            {user && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p><span className="font-medium">Name:</span> {user.fullName}</p>
                  <p><span className="font-medium">Aadhaar:</span> {user.aadhaarNumber}</p>
                  <p><span className="font-medium">Mobile:</span> {user.mobileNumber}</p>
                  <p><span className="font-medium">Email:</span> {user.email || 'Not provided'}</p>
                </div>
                <div className="space-y-2">
                  <p><span className="font-medium">Role:</span> {user.role}</p>
                  <p><span className="font-medium">Qualification:</span> {user.highestQualification}</p>
                  <p><span className="font-medium">Institute:</span> {user.institute}</p>
                  <p><span className="font-medium">Location:</span> {user.district}, {user.state}</p>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <p><span className="font-medium">Available Dates:</span> {formatAvailableDates()}</p>
                  <p className="mt-2"><span className="font-medium">Qualification Document:</span> 
                    <a href={user.qualificationPdfLink} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-500 hover:underline">View Document</a>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Recent Sessions */}
          <div className="mb-4 border rounded p-4">
            <h2 className="text-lg font-bold text-green-800 mb-2">Recent Support Sessions</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Subject</th>
                  <th className="text-left py-2">Student</th>
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentSessions.map((session, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">{session.subject}</td>
                    <td className="py-2">{session.student}</td>
                    <td className="py-2">{session.date}</td>
                    <td className="py-2">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        {session.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Upcoming Schedule */}
          <div className="mb-4 border rounded p-4">
            <h2 className="text-lg font-bold text-green-800 mb-2">Upcoming Schedule</h2>
            {upcomingSchedule.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Subject</th>
                    <th className="text-left py-2">Student</th>
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingSchedule.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">{item.subject}</td>
                      <td className="py-2">{item.student}</td>
                      <td className="py-2">{item.date}</td>
                      <td className="py-2">{item.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500">No upcoming sessions scheduled.</p>
            )}
          </div>

          {/* Notifications Area */}
          <div className="mb-4 border rounded p-4">
            <h2 className="text-lg font-bold text-green-800 mb-2">Notifications</h2>
            <div className="bg-green-50 p-3 rounded border border-green-200">
              <p className="text-sm">Students can see your online status and call you when needed. Make sure to update your status when you're available to help.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
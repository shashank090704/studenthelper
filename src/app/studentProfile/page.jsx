'use client';
import { useState, useEffect } from 'react';
import useSocket from '../hooks/useSocket';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function StudentDashboard() {
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('offline');
  const [loading, setLoading] = useState(true);
  const [recentSessions, setRecentSessions] = useState([
    { subject: 'Mathematics Exam', scribe: 'Abhay Jadon', date: '05-Apr-2025', status: 'Completed' },
    { subject: 'Physics Lab Report', scribe: 'Priya Patel', date: '01-Apr-2025', status: 'Completed' }
  ]);
  const [upcomingSchedule, setUpcomingSchedule] = useState([
    { subject: 'Chemistry Support', scribe: 'Raj Sharma', date: '17-Apr-2025', time: '10:00 AM' },
    { subject: 'Mathematics Help', scribe: 'Meera Gupta', date: '22-Apr-2025', time: '2:30 PM' }
  ]);
  
  useEffect(() => {
    const getUserData = async () => {
      try {
        const res = await axios.post("/api/student/getdata");
        if(res){
          console.log(res.data.data, 'dashboard data');
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
        class : user.educationLevel,
        date : "0-0-0"
      });
      
      setStatus('available');
      
      // Listen for call responses
      socket.on('user-joined', (userData) => {
        if (userData.role === 'Scribe') {
          console.log(`Scribe ${userData.id} has joined your session`);
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
    if (socket) {
      const handleCallResponse = (data) => {
        console.log("Received call response:", data);
        
        if (data.accepted) {
          router.push(`/call/${data.roomId}?target=${data.from.id}`);
        } else {
          alert(`Scribe ${data.from.fullName} declined your call request.`);
        }
      };
  
      socket.on("call-response", handleCallResponse);
  
      return () => {
        socket.off("call-response", handleCallResponse);
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

  const requestScribe = () => {
    router.push('/find-scribe');
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
  
  return (
    <div className="flex min-h-screen bg-orange-50 text-black">
      {/* Sidebar */}
      <div className="w-48 bg-orange-800 text-white">
        <div className="p-4 text-center bg-orange-900 font-bold">
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
        <div className="mt-36 mx-4 p-4 border rounded-lg bg-orange-100 text-black text-center">
          <div className="mb-2">
            <div className="w-16 h-16 bg-orange-200 rounded-full mx-auto flex items-center justify-center text-orange-700 text-xl font-bold">
              {user?.fullName?.charAt(0) || 'S'}
            </div>
          </div>
          <div className="font-semibold">{user?.fullName || 'Student Name'}</div>  
          <div className="text-sm">Student</div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1">
        {/* Header */}
        <div className="bg-orange-500 text-white p-4 text-center">
          <h1 className="text-2xl font-bold">Student Profile</h1>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Welcome message */}
          <div className="mb-4">
            <h2 className="text-lg font-bold">Welcome, {user?.fullName || 'Student'}!</h2>
            <p className="text-sm text-gray-600">Last login: {formattedDate}</p>
          </div>

          {/* Status Toggle */}
          <div className="mb-4 border rounded p-4">
            <h2 className="text-lg font-bold text-orange-800 mb-2">Your Availability</h2>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full ${status === 'available' ? 'bg-green-500' : 'bg-gray-400'} mr-2`}></div>
                <p>Status: <span className="font-medium">{status === 'available' ? 'Online - Available for sessions' : 'Offline'}</span></p>
              </div>
              <div className="space-x-2">
                <button 
                  onClick={toggleStatus}
                  className={`px-4 py-2 rounded text-white ${status === 'available' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                >
                  {status === 'available' ? 'Go Offline' : 'Go Online'}
                </button>
                <button 
                  onClick={requestScribe}
                  className="px-4 py-2 rounded bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Request Scribe
                </button>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="mb-4 border rounded p-4">
            <h2 className="text-lg font-bold text-orange-800 mb-2">Your Profile</h2>
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
                  <p><span className="font-medium">Education Level:</span> {user.educationLevel}</p>
                  <p><span className="font-medium">Institution:</span> {user.educationalInstitution}</p>
                  <p><span className="font-medium">Location:</span> {user.district}, {user.state}</p>
                  {user.disability && <p><span className="font-medium">Disability:</span> {user.disability}</p>}
                </div>
              </div>
            )}
          </div>

          {/* Recent Sessions */}
          <div className="mb-4 border rounded p-4">
            <h2 className="text-lg font-bold text-orange-800 mb-2">Recent Support Sessions</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Subject</th>
                  <th className="text-left py-2">Scribe</th>
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentSessions.map((session, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">{session.subject}</td>
                    <td className="py-2">{session.scribe}</td>
                    <td className="py-2">{session.date}</td>
                    <td className="py-2">
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
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
            <h2 className="text-lg font-bold text-orange-800 mb-2">Upcoming Schedule</h2>
            {upcomingSchedule.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Subject</th>
                    <th className="text-left py-2">Scribe</th>
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingSchedule.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">{item.subject}</td>
                      <td className="py-2">{item.scribe}</td>
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

          {/* Help Info Area */}
          <div className="mb-4 border rounded p-4">
            <h2 className="text-lg font-bold text-orange-800 mb-2">Need Help?</h2>
            <div className="bg-orange-50 p-3 rounded border border-orange-200">
              <p className="text-sm">Click on "Request Scribe" to find available scribes who can assist you. Make sure you're online to receive assistance.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
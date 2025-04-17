'use client';
import React, { useState, useEffect } from 'react';
import { Calendar, MessageSquare, Clock, CheckCircle, Info, ArrowLeft, ArrowRight } from 'lucide-react';

const ScribeDashboard = ({ scribeData, onSaveAvailability }) => {
  // State for managing the calendar
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState([]);
  const [viewMonth, setViewMonth] = useState(new Date());
  
  // Initialize selected dates from scribeData when component mounts
  useEffect(() => {
    // Check if scribeData and availableDates exist
    if (scribeData && scribeData.availableDates) {
      // Convert date strings from DB to Date objects
      const formattedDates = scribeData.availableDates.map(date => new Date(date));
      setSelectedDates(formattedDates);
    }
  }, [scribeData]);

  // Sample data for demonstration - Replace with your actual data fetching logic
  // COMMENT: Replace these with your actual data from your backend
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

  // Calculate summary stats
  const stats = {
    pending: pendingRequests.length,
    upcoming: upcomingSchedules.length,
    completed: completedSessions.length
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

  // Handler for saving availability to the database
  const saveAvailability = () => {
    // COMMENT: This function will send the selected dates to your backend
    // to update the scribe's availableDates array
    if (onSaveAvailability) {
      onSaveAvailability(selectedDates);
    }
    
    // You would typically make an API call here
    console.log("Dates to save:", selectedDates);
    // Example API call (replace with your actual implementation)
    // axios.post('/api/scribe/update-availability', { 
    //   scribeId: scribeData._id, 
    //   availableDates: selectedDates 
    // });
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
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
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

  const calendarDays = generateCalendarDays();
  const monthYearString = viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <header className="bg-blue-700 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">VidyaSetu</h1>
          <nav className="space-x-6">
            <a href="#" className="text-white hover:text-blue-200">Home</a>
            <a href="#" className="text-white font-bold">Dashboard</a>
            <a href="#" className="text-white hover:text-blue-200">Profile</a>
            <a href="#" className="text-white hover:text-blue-200">Logout</a>
          </nav>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Scribe Dashboard</h1>
        
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-2/3 space-y-6">
            {/* Pending Requests Panel */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="bg-gray-200 p-4 rounded-t-lg">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Clock size={20} />
                  Pending Requests
                </h2>
              </div>
              <div className="p-4">
                {pendingRequests.length > 0 ? (
                  pendingRequests.map(request => (
                    <div key={request.id} className="bg-gray-50 p-4 mb-4 rounded-md">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg text-gray-800 font-medium">{request.studentName}</h3>
                          <p className="text-gray-600">
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
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-6">No pending requests</p>
                )}
              </div>
            </div>

            {/* Upcoming Fixed Schedules Panel */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="bg-gray-200 p-4 rounded-t-lg">
                <h2 className="text-xl text-gray-800 font-bold flex items-center gap-2">
                  <Calendar size={20} />
                  Upcoming Fixed Schedules
                </h2>
              </div>
              <div className="p-4">
                {upcomingSchedules.length > 0 ? (
                  upcomingSchedules.map(schedule => (
                    <div key={schedule.id} className="bg-gray-50 p-4 mb-4 rounded-md">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg text-gray-800 font-medium">{schedule.studentName}</h3>
                          <p className="text-gray-600">
                            {schedule.subject} - {schedule.class} • 
                            {formatDate(schedule.scheduleDate)}, {formatTime(schedule.scheduleDate)} - {formatTime(schedule.endTime)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button className="bg-yellow-500 text-gray-800 px-4 py-2 rounded-md">
                            Reschedule
                          </button>
                          <button className="bg-red-500 text-white px-4 py-2 rounded-md">
                            Cancel
                          </button>
                          <button className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-1">
                            <MessageSquare size={16} />
                            Chat
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-6">No upcoming schedules</p>
                )}
              </div>
            </div>

            {/* Completed Sessions Panel */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="bg-gray-200 p-4 rounded-t-lg">
                <h2 className="text-xl text-gray-800 font-bold flex items-center gap-2">
                  <CheckCircle size={20} />
                  Completed Sessions
                </h2>
              </div>
              <div className="p-4">
                {completedSessions.length > 0 ? (
                  completedSessions.map(session => (
                    <div key={session.id} className="bg-gray-50 p-4 mb-4 rounded-md">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg text-gray-800 font-medium">{session.studentName}</h3>
                          <p className="text-gray-600">
                            {session.subject} - {session.class} • 
                            {formatDate(session.sessionDate)}, {formatTime(session.sessionDate)} - {formatTime(session.endTime)}
                          </p>
                        </div>
                        <div>
                          <button className="bg-blue-600 text-white px-4 py-2 rounded-md">
                            View Feedback
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-6">No completed sessions</p>
                )}
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/3 space-y-6">
            {/* Calendar Section */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="bg-gray-200 p-4 rounded-t-lg">
                <h2 className="text-xl text-gray-800 font-bold flex items-center gap-2">
                  <Calendar size={20} />
                  Mark Your Availability
                </h2>
              </div>
              <div className="p-4">
                {/* Month Navigation */}
                <div className="flex justify-between items-center bg-gray-50 p-3 mb-4 rounded-md">
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

                {/* Calendar Days */}
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

                {/* Calendar Legend */}
                <div className="mt-4 flex flex-wrap gap-4">
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
                  className="mt-6 w-full bg-blue-600 text-white py-3 rounded-md font-medium"
                >
                  Save Availability
                </button>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="bg-gray-200 p-4 rounded-t-lg">
                <h2 className="text-xl text-gray-800 font-bold flex items-center gap-2">
                  <Info size={20} />
                  Session Summary
                </h2>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-md flex flex-col items-center">
                    <span className="text-gray-600 mb-1">Pending</span>
                    <span className="text-2xl font-bold text-yellow-600">{stats.pending}</span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md flex flex-col items-center">
                    <span className="text-gray-600 mb-1">Upcoming</span>
                    <span className="text-2xl font-bold text-blue-600">{stats.upcoming}</span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md flex flex-col items-center">
                    <span className="text-gray-600 mb-1">Completed</span>
                    <span className="text-2xl font-bold text-green-600">{stats.completed}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ScribeDashboard;
import React, { useState, useEffect } from 'react';
import { Search, Calendar, MapPin, Clock, CheckCircle, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { OnlineStatusBadge } from '../components/OnlineStatusBadge';
import { WaitlistModal } from '../components/WaitlistModal';
import { RecurringAppointmentModal } from '../components/RecurringAppointmentModal';
import api from '../utils/api';

interface Faculty {
  _id: string;
  name: string;
  email: string;
  department?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

export const StudentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'faculty' | 'bookings'>('faculty');

  useEffect(() => {
    if (view === 'faculty') {
      fetchFaculty();
    } else {
      fetchMyBookings();
    }
  }, [view]);

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      const query = searchTerm ? `?search=${searchTerm}` : '';
      const response = await api.get(`/student/faculty${query}`);
      setFaculty(response.data);
    } catch (error) {
      console.error('Failed to fetch faculty:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/student/my-bookings');
      console.log('Bookings:', response.data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm && view === 'faculty') {
      const timer = setTimeout(() => fetchFaculty(), 300);
      return () => clearTimeout(timer);
    }
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">ScheduleSync</h1>
            <p className="text-sm text-slate-400">Student Dashboard</p>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/student/profile')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
            >
              <User size={18} />
              My Profile
            </button>
            <button
              onClick={() => window.location.href = '/profile/settings'}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              Settings
            </button>
            <span className="text-slate-300">{user?.name}</span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setView('faculty')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              view === 'faculty'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Browse Faculty
          </button>
          <button
            onClick={() => window.location.href = '/student/bookings'}
            className="px-6 py-3 rounded-lg font-semibold transition bg-slate-700 text-slate-300 hover:bg-slate-600"
          >
            My Bookings
          </button>
        </div>

        {view === 'faculty' ? (
          <>
            <div className="mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-3 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search faculty by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-700 text-white placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {selectedFaculty ? (
              <FacultyScheduleView
                faculty={selectedFaculty}
                onBack={() => setSelectedFaculty(null)}
              />
            ) : (
              <div>
                {loading ? (
                  <div className="text-center text-slate-300 py-12">Loading faculty...</div>
                ) : faculty.length === 0 ? (
                  <div className="text-center text-slate-300 py-12">
                    <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No faculty found</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {faculty.map((prof) => (
                      <div
                        key={prof._id}
                        className="bg-white rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-lg font-bold text-slate-900">{prof.name}</h3>
                          <OnlineStatusBadge isOnline={prof.isOnline || false} lastSeen={prof.lastSeen} size="sm" />
                        </div>
                        <p className="text-sm text-slate-600 mb-3">{prof.email}</p>
                        {prof.department && (
                          <p className="text-sm text-slate-500 mb-4">{prof.department}</p>
                        )}
                        <div className="space-y-2">
                          <button
                            onClick={() => navigate(`/faculty/profile/${prof._id}`)}
                            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition text-sm font-medium"
                          >
                            View Profile
                          </button>
                          <button
                            onClick={() => setSelectedFaculty(prof)}
                            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm font-medium"
                          >
                            View Schedule
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl p-8 text-center text-slate-600">
            <CheckCircle size={48} className="mx-auto mb-4 opacity-50" />
            <p>My Bookings feature coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface FacultyScheduleViewProps {
  faculty: Faculty;
  onBack: () => void;
}

const FacultyScheduleView: React.FC<FacultyScheduleViewProps> = ({ faculty, onBack }) => {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [waitlistModal, setWaitlistModal] = useState<{ isOpen: boolean; slotId?: string; slotDate?: string }>({
    isOpen: false,
  });
  const [recurringModal, setRecurringModal] = useState<{ isOpen: boolean; slotId?: string; slotDate?: string }>({
    isOpen: false,
  });

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/student/faculty/${faculty._id}/slots`);
      setSlots(response.data);
      if (response.data.length > 0) {
        const firstDate = new Date(response.data[0].startTime).toISOString().split('T')[0];
        setSelectedDate(firstDate);
      }
    } catch (error) {
      console.error('Failed to fetch slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSlot = async (slot: any) => {
    try {
      await api.post('/student/book-slot', { slotId: slot._id });
      alert('Slot booked successfully!');
      fetchSlots();
    } catch (error: any) {
      if (error.response?.data?.isFull) {
        // Show waitlist modal
        setWaitlistModal({
          isOpen: true,
          slotId: slot._id,
          slotDate: slot.startTime,
        });
      } else {
        alert(error.response?.data?.error || 'Failed to book slot');
      }
    }
  };

  const handleRecurringClick = (slot: any) => {
    setRecurringModal({
      isOpen: true,
      slotId: slot._id,
      slotDate: slot.startTime,
    });
  };

  const filteredSlots = selectedDate
    ? slots.filter((slot) => new Date(slot.startTime).toISOString().split('T')[0] === selectedDate)
    : slots;

  const uniqueDates = [...new Set(slots.map((s) => new Date(s.startTime).toISOString().split('T')[0]))];

  return (
    <div>
      <button onClick={onBack} className="text-blue-400 mb-4 hover:underline">
        ← Back to Faculty
      </button>

      <div className="bg-white rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{faculty.name}</h2>
        <p className="text-slate-600">{faculty.department}</p>
      </div>

      {loading ? (
        <div className="text-center text-slate-300 py-12">Loading schedule...</div>
      ) : (
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <h3 className="text-lg font-bold text-white mb-4">Available Dates</h3>
            <div className="space-y-2">
              {uniqueDates.map((date) => (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`w-full p-3 rounded-lg transition text-left font-medium ${
                    selectedDate === date
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {new Date(date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-lg font-bold text-white mb-4">Available Slots</h3>
            {filteredSlots.length === 0 ? (
              <div className="text-center text-slate-300 py-8">
                <Calendar size={32} className="mx-auto mb-2 opacity-50" />
                <p>No slots available on this date</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {filteredSlots.map((slot) => (
                  <div key={slot._id} className="bg-white rounded-lg p-4 hover:shadow-lg transition">
                    <div className="flex items-start gap-3 mb-3">
                      <Clock size={18} className="text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-900">
                          {new Date(slot.startTime).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          -{' '}
                          {new Date(slot.endTime).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 mb-3">
                      <MapPin size={18} className="text-green-600 mt-1 flex-shrink-0" />
                      <p className="text-slate-700">{slot.location}</p>
                    </div>

                    {slot.notes && (
                      <p className="text-sm text-slate-600 mb-3">
                        <strong>Notes:</strong> {slot.notes}
                      </p>
                    )}

                    {/* Show slot status */}
                    <div className="mb-3 text-sm">
                      {slot.isFull ? (
                        <p className="text-red-600 font-medium">
                          🔴 Fully booked ({slot.bookingCount}/{slot.capacity})
                        </p>
                      ) : (
                        <p className="text-green-600 font-medium">
                          ✅ Available ({slot.availableSpots} spot{slot.availableSpots !== 1 ? 's' : ''})
                        </p>
                      )}
                      {slot.waitlistCount > 0 && (
                        <p className="text-amber-600">
                          ⏳ {slot.waitlistCount} on waitlist
                        </p>
                      )}
                    </div>

                    {/* Action buttons */}
                    {slot.isBooked ? (
                      <button
                        disabled
                        className="w-full py-2 rounded-lg font-medium bg-slate-200 text-slate-500 cursor-not-allowed"
                      >
                        ✓ Already Booked
                      </button>
                    ) : slot.isFull ? (
                      <button
                        onClick={() =>
                          setWaitlistModal({
                            isOpen: true,
                            slotId: slot._id,
                            slotDate: slot.startTime,
                          })
                        }
                        className="w-full py-2 rounded-lg font-medium bg-amber-600 text-white hover:bg-amber-700 transition"
                      >
                        Join Waitlist
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleBookSlot(slot)}
                          className="flex-1 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
                        >
                          Book Slot
                        </button>
                        <button
                          onClick={() => handleRecurringClick(slot)}
                          title="Book this slot as a recurring appointment"
                          className="flex-1 py-2 rounded-lg font-medium bg-purple-600 text-white hover:bg-purple-700 transition"
                        >
                          🔄 Recurring
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <WaitlistModal
        isOpen={waitlistModal.isOpen}
        slotId={waitlistModal.slotId || ''}
        facultyName={faculty.name}
        slotDate={waitlistModal.slotDate || ''}
        onClose={() => setWaitlistModal({ isOpen: false })}
        onSuccess={fetchSlots}
      />

      <RecurringAppointmentModal
        isOpen={recurringModal.isOpen}
        slotId={recurringModal.slotId || ''}
        slotDate={recurringModal.slotDate || ''}
        facultyName={faculty.name}
        onClose={() => setRecurringModal({ isOpen: false })}
        onSuccess={fetchSlots}
      />
    </div>
  );
};

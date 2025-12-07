import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Save, X, Mail, MapPin, Book, Calendar, Clock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

interface Booking {
  _id: string;
  slotId: string;
  facultyId: string;
  studentId: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  createdAt: string;
  slot?: {
    startTime: string;
    endTime: string;
    location: string;
    notes?: string;
  };
  faculty?: {
    id: string;
    name: string;
    email: string;
    department: string;
  };
}

export const StudentProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    bio: user?.bio || '',
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/student/my-bookings');
      setBookings(response.data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await api.put('/auth/profile', editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await api.post(`/student/cancel-booking/${bookingId}`);
      fetchBookings();
    } catch (error) {
      console.error('Failed to cancel booking:', error);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const activeBookings = bookings.filter((b) => b.status === 'approved');
  const cancelledBookings = bookings.filter((b) => b.status === 'cancelled');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="text-blue-400 hover:text-blue-300 mb-6 flex items-center gap-2 transition"
        >
          ← Back
        </button>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-purple-400 flex items-center justify-center text-3xl font-bold border-4 border-white">
                  {user?.name?.charAt(0)}
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{user?.name}</h1>
                  <div className="flex items-center gap-2 mt-2 opacity-90">
                    <Mail size={18} />
                    <span>{user?.email}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition"
              >
                <Edit2 size={18} />
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Bio</label>
                  <textarea
                    value={editData.bio}
                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    rows={4}
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
                  >
                    <Save size={18} />
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-2 px-6 py-2 bg-slate-300 hover:bg-slate-400 text-slate-900 rounded-lg transition"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Email</p>
                  <p className="text-slate-900 font-medium">{user?.email}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Role</p>
                  <p className="text-slate-900 font-medium capitalize">{user?.role}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Total Bookings</p>
                  <p className="text-slate-900 font-medium">{activeBookings.length}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bookings Section */}
        <div className="space-y-6">
          {/* Active Bookings */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Calendar size={28} />
                Active Bookings ({activeBookings.length})
              </h2>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="text-center text-slate-600 py-8">Loading bookings...</div>
              ) : activeBookings.length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                  <Book size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No active bookings yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeBookings.map((booking) => (
                    <div key={booking._id} className="p-4 border-2 border-slate-200 rounded-lg hover:border-blue-400 transition">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">{booking.faculty?.name}</h3>
                          <p className="text-sm text-slate-600">{booking.faculty?.department}</p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          Approved
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={18} className="text-slate-500" />
                          <span className="text-slate-700">
                            {formatDateTime(booking.slot?.startTime || '')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={18} className="text-slate-500" />
                          <span className="text-slate-700">
                            {booking.slot?.startTime &&
                              new Date(booking.slot.startTime).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}{' '}
                            -{' '}
                            {booking.slot?.endTime &&
                              new Date(booking.slot.endTime).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={18} className="text-slate-500" />
                          <span className="text-slate-700">{booking.slot?.location}</span>
                        </div>
                      </div>

                      {booking.slot?.notes && (
                        <p className="text-sm text-slate-600 mb-3 p-2 bg-slate-50 rounded">
                          <span className="font-medium">Notes:</span> {booking.slot.notes}
                        </p>
                      )}

                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition text-sm font-medium"
                      >
                        Cancel Booking
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cancelled Bookings */}
          {cancelledBookings.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-slate-600 to-slate-700 p-6 text-white">
                <h2 className="text-2xl font-bold">Cancelled Bookings ({cancelledBookings.length})</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {cancelledBookings.map((booking) => (
                    <div key={booking._id} className="p-4 border-2 border-slate-200 rounded-lg opacity-75">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-700">{booking.faculty?.name}</h3>
                          <p className="text-sm text-slate-600">{booking.faculty?.department}</p>
                        </div>
                        <span className="px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-sm font-medium">
                          Cancelled
                        </span>
                      </div>
                      <div className="text-sm text-slate-600">
                        {formatDateTime(booking.slot?.startTime || '')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={logout}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

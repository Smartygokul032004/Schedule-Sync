import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

interface Booking {
  _id: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  student: {
    name: string;
    email: string;
  };
  slot: {
    startTime: string;
    endTime: string;
    location: string;
  };
  createdAt: string;
  bookedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  cancelledAt?: string;
}

export const FacultyBookings: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'cancelled'>('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      console.log('Fetching faculty bookings...');
      const response = await api.get('/faculty/bookings');
      console.log('Bookings response:', response.data);
      setBookings(response.data || []);
    } catch (error: any) {
      console.error('Failed to fetch bookings:', error.response?.data || error.message);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, action: 'approve' | 'reject' | 'cancel') => {
    try {
      await api.put(`/faculty/bookings/${bookingId}/${action}`);
      alert(`✅ Booking ${action}ed successfully!`);
      fetchBookings();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message || `Failed to ${action} booking`;
      console.error(`Failed to ${action} booking:`, error);
      alert(`❌ Error: ${errorMsg}`);
    }
  };

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-slate-100 text-slate-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getTimestampInfo = (booking: Booking) => {
    if (booking.approvedAt) return { label: 'Approved on', time: booking.approvedAt };
    if (booking.rejectedAt) return { label: 'Rejected on', time: booking.rejectedAt };
    if (booking.cancelledAt) return { label: 'Cancelled on', time: booking.cancelledAt };
    if (booking.bookedAt) return { label: 'Booked on', time: booking.bookedAt };
    return { label: 'Booked on', time: booking.createdAt };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-slate-300">Loading bookings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6 transition"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
            <h1 className="text-3xl font-bold">Booking Requests</h1>
            <p className="text-blue-100 mt-2">Manage student booking requests</p>
          </div>

          {/* Filter Buttons */}
          <div className="border-b border-slate-200 p-6 flex flex-wrap gap-2">
            {(['all', 'pending', 'approved', 'rejected', 'cancelled'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition capitalize ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Bookings List */}
          <div className="divide-y">
            {filteredBookings.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                No bookings found with this filter.
              </div>
            ) : (
              filteredBookings.map((booking) => (
                <div key={booking._id} className="p-6 hover:bg-slate-50 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {booking.student.name}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-slate-600 text-sm mb-3">{booking.student.email}</p>
                      {booking.slot ? (
                        <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                          <p className="text-slate-700">
                            <span className="font-medium">Time:</span>{' '}
                            {new Date(booking.slot.startTime).toLocaleString()} -{' '}
                            {new Date(booking.slot.endTime).toLocaleTimeString()}
                          </p>
                          <p className="text-slate-700">
                            <span className="font-medium">Location:</span> {booking.slot.location}
                          </p>
                          <p className="text-slate-600 text-xs">
                            <span className="font-medium">{getTimestampInfo(booking).label}:</span>{' '}
                            {new Date(getTimestampInfo(booking).time).toLocaleString()}
                          </p>
                        </div>
                      ) : (
                        <div className="bg-slate-50 rounded-lg p-3 text-slate-500">
                          <p>Slot information not available</p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateBookingStatus(booking._id, 'approve')}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                          >
                            <CheckCircle size={18} />
                            Approve
                          </button>
                          <button
                            onClick={() => updateBookingStatus(booking._id, 'reject')}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                          >
                            <XCircle size={18} />
                            Reject
                          </button>
                        </>
                      )}
                      {booking.status === 'approved' && (
                        <button
                          onClick={() => updateBookingStatus(booking._id, 'cancel')}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition"
                        >
                          <Trash2 size={18} />
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

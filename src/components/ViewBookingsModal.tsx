import React, { useState, useEffect } from 'react';
import { X, User, Calendar, MapPin, Mail } from 'lucide-react';
import api from '../utils/api';

interface Booking {
  _id: string;
  status: string;
  slot: {
    startTime: string;
    endTime: string;
    location: string;
    notes: string;
  };
  student: {
    name: string;
    email: string;
  };
}

interface ViewBookingsModalProps {
  onClose: () => void;
}

export const ViewBookingsModal: React.FC<ViewBookingsModalProps> = ({ onClose }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/faculty/bookings');
      setBookings(response.data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-slate-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-slate-900">Student Bookings</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <div className="p-6 text-center text-slate-600">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="p-6 text-center text-slate-600">No bookings yet</div>
        ) : (
          <div className="p-6 space-y-4">
            {bookings.map((booking) => (
              <div key={booking._id} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{booking.student.name}</p>
                      <p className="text-sm text-slate-600 flex items-center gap-1">
                        <Mail size={14} />
                        {booking.student.email}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    Confirmed
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2 text-slate-700">
                    <Calendar size={16} className="text-blue-600 flex-shrink-0" />
                    {formatDateTime(booking.slot.startTime)}
                  </p>
                  <p className="flex items-center gap-2 text-slate-700">
                    <MapPin size={16} className="text-green-600 flex-shrink-0" />
                    {booking.slot.location}
                  </p>
                  {booking.slot.notes && (
                    <p className="text-slate-600">
                      <strong>Notes:</strong> {booking.slot.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

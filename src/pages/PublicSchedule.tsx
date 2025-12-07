import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, MapPin, Clock, BookOpen } from 'lucide-react';
import { OnlineStatusBadge } from '../components/OnlineStatusBadge';
import axios from 'axios';

interface Slot {
  _id: string;
  startTime: string;
  endTime: string;
  location: string;
  notes: string;
  isBooked: boolean;
}

interface FacultyInfo {
  id: string;
  name: string;
  department: string;
  isOnline?: boolean;
  lastSeen?: string;
}

export const PublicSchedule: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [faculty, setFaculty] = useState<FacultyInfo | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/public/faculty/${token}/schedule`
        );
        setFaculty(response.data.faculty);
        setSlots(response.data.slots);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load schedule');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchSchedule();
    }
  }, [token]);

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading schedule...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <BookOpen size={48} className="mx-auto mb-4 text-red-400" />
          <p className="text-red-400 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <Calendar className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{faculty?.name}</h1>
                <p className="text-slate-600">{faculty?.department}</p>
              </div>
            </div>
            <OnlineStatusBadge isOnline={faculty?.isOnline || false} lastSeen={faculty?.lastSeen} size="md" />
          </div>
          <p className="text-slate-600 text-sm">Available appointment slots</p>
        </div>

        {slots.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Calendar size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="text-slate-600 text-lg">No available slots at the moment</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {slots.map((slot) => (
              <div
                key={slot._id}
                className={`rounded-xl shadow-lg overflow-hidden transition-all ${
                  slot.isBooked ? 'bg-slate-200 opacity-60' : 'bg-white hover:shadow-xl'
                }`}
              >
                <div className={`px-6 py-4 ${slot.isBooked ? 'bg-slate-300' : 'bg-blue-50'}`}>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Calendar size={16} className={slot.isBooked ? 'text-slate-600' : 'text-blue-600'} />
                    <span className={slot.isBooked ? 'text-slate-700' : 'text-blue-900'}>
                      {formatDateTime(slot.startTime)}
                    </span>
                  </div>
                </div>

                <div className="px-6 py-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <Clock size={18} className="text-slate-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Duration</p>
                      <p className={`font-medium ${slot.isBooked ? 'text-slate-500' : 'text-slate-900'}`}>
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

                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-slate-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Location</p>
                      <p className={`font-medium ${slot.isBooked ? 'text-slate-500' : 'text-slate-900'}`}>
                        {slot.location}
                      </p>
                    </div>
                  </div>

                  {slot.notes && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Notes</p>
                      <p className={`text-sm ${slot.isBooked ? 'text-slate-500' : 'text-slate-700'}`}>
                        {slot.notes}
                      </p>
                    </div>
                  )}

                  {slot.isBooked && (
                    <div className="flex items-center gap-2 text-slate-600 text-sm font-medium pt-2">
                      <span>Already Booked</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <p className="text-slate-400 text-sm">
            To book an appointment, please sign in to ScheduleSync
          </p>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, MapPin, Award, Calendar } from 'lucide-react';
import { OnlineStatusBadge } from '../components/OnlineStatusBadge';
import { CalendarView } from '../components/CalendarView';
import api from '../utils/api';

interface Faculty {
  _id: string;
  name: string;
  email: string;
  department?: string;
  bio?: string;
  qualifications?: string[];
  isOnline?: boolean;
  lastSeen?: string;
  profilePhoto?: string;
}

interface Slot {
  _id: string;
  startTime: string;
  endTime: string;
  location: string;
  notes?: string;
  isCancelled?: boolean;
  isBooked?: boolean;
  capacity?: number;
}

export const FacultyProfile: React.FC = () => {
  const { facultyId } = useParams<{ facultyId: string }>();
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState<Faculty | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'profile' | 'calendar'>('profile');

  useEffect(() => {
    fetchFacultyProfile();
  }, [facultyId]);

  const fetchFacultyProfile = async () => {
    try {
      setLoading(true);
      console.log('Fetching faculty profile for ID:', facultyId);
      
      const [profileRes, slotsRes] = await Promise.all([
        api.get(`/public/faculty/${facultyId}/profile`),
        api.get(`/student/faculty/${facultyId}/slots`),
      ]);
      
      console.log('Profile response:', profileRes.data);
      setFaculty(profileRes.data);
      setSlots(slotsRes.data);
    } catch (error: any) {
      console.error('Failed to fetch profile:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-slate-300">Loading faculty profile...</div>
      </div>
    );
  }

  if (!faculty) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg">Faculty not found</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6 transition"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-8">
          {/* Faculty Info Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                {faculty.profilePhoto ? (
                  <img
                    src={faculty.profilePhoto}
                    alt={faculty.name}
                    className="w-24 h-24 rounded-full border-4 border-white object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full border-4 border-white bg-blue-400 flex items-center justify-center text-3xl font-bold">
                    {faculty.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h1 className="text-4xl font-bold mb-2">{faculty.name}</h1>
                  <div className="space-y-1">
                    {faculty.department && (
                      <div className="flex items-center gap-2">
                        <MapPin size={18} />
                        <span>{faculty.department}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Mail size={18} />
                      <span>{faculty.email}</span>
                    </div>
                  </div>
                </div>
              </div>
              <OnlineStatusBadge isOnline={faculty.isOnline || false} lastSeen={faculty.lastSeen} size="lg" />
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-slate-200">
            <div className="flex">
              <button
                onClick={() => setViewMode('profile')}
                className={`flex-1 px-6 py-4 font-medium transition ${
                  viewMode === 'profile'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex-1 px-6 py-4 font-medium transition ${
                  viewMode === 'calendar'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Schedule
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {viewMode === 'profile' ? (
              <div className="space-y-8">
                {/* Bio */}
                {faculty.bio && (
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-3">About</h3>
                    <p className="text-slate-700 leading-relaxed">{faculty.bio}</p>
                  </div>
                )}

                {/* Qualifications */}
                {faculty.qualifications && faculty.qualifications.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <Award size={24} className="text-blue-600" />
                      Qualifications
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {faculty.qualifications.map((qual, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                          <div className="w-2 h-2 rounded-full bg-blue-600" />
                          <span className="text-slate-700">{qual}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Department & Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Department</p>
                    <p className="text-lg font-semibold text-slate-900">{faculty.department || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-2">Availability</p>
                    <OnlineStatusBadge isOnline={faculty.isOnline || false} lastSeen={faculty.lastSeen} size="md" />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border-2 border-slate-200 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Total Slots</p>
                    <p className="text-2xl font-bold text-slate-900">{slots.length}</p>
                  </div>
                  <div className="p-4 border-2 border-slate-200 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Available</p>
                    <p className="text-2xl font-bold text-green-600">
                      {slots.filter((s) => !s.isBooked && !s.isCancelled).length}
                    </p>
                  </div>
                  <div className="p-4 border-2 border-slate-200 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Booked</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {slots.filter((s) => s.isBooked).length}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <CalendarView slots={slots} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

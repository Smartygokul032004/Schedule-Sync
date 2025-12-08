import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, MapPin, Clock, Share2, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { CreateSlotModal } from '../components/CreateSlotModal';
import { EditSlotModal } from '../components/EditSlotModal';
import { ViewBookingsModal } from '../components/ViewBookingsModal';
import { OnlineStatusBadge } from '../components/OnlineStatusBadge';

interface Slot {
  _id: string;
  startTime: string;
  endTime: string;
  location: string;
  notes: string;
  isCancelled: boolean;
}

export const FacultyDashboard: React.FC = () => {
  const { user, logout, setOnlineStatus } = useAuth();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [shareToken, setShareToken] = useState('');
  const [isOnline, setIsOnline] = useState(user?.isOnline || false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const response = await api.get('/faculty/slots');
      setSlots(response.data);
    } catch (error) {
      console.error('Failed to fetch slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!window.confirm('Are you sure you want to delete this slot?')) return;

    try {
      await api.delete(`/faculty/slots/${slotId}`);
      alert('✅ Slot deleted successfully!');
      setSlots(slots.filter((s) => s._id !== slotId));
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message || 'Failed to delete slot';
      console.error('Failed to delete slot:', error);
      alert(`❌ Error: ${errorMsg}`);
    }
  };

  const handleCancelSlot = async (slotId: string) => {
    try {
      await api.post(`/faculty/slots/${slotId}/cancel`);
      alert('✅ Slot cancelled successfully!');
      fetchSlots();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message || 'Failed to cancel slot';
      console.error('Failed to cancel slot:', error);
      alert(`❌ Error: ${errorMsg}`);
    }
  };

  const handleGenerateShareToken = async () => {
    try {
      const response = await api.post('/faculty/generate-share-token');
      setShareToken(response.data.token);
    } catch (error) {
      console.error('Failed to generate share token:', error);
    }
  };

  const handleToggleOnlineStatus = async () => {
    setUpdatingStatus(true);
    try {
      await setOnlineStatus(!isOnline);
      setIsOnline(!isOnline);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">ScheduleSync</h1>
            <p className="text-sm text-slate-400">Faculty Dashboard</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <OnlineStatusBadge isOnline={isOnline} size="md" />
              <button
                onClick={handleToggleOnlineStatus}
                disabled={updatingStatus}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-medium ${
                  isOnline
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-slate-600 hover:bg-slate-700 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isOnline ? (
                  <>
                    <Wifi size={18} />
                    Go Offline
                  </>
                ) : (
                  <>
                    <WifiOff size={18} />
                    Go Online
                  </>
                )}
              </button>
            </div>
            <span className="text-slate-300">{user?.name}</span>
            <button
              onClick={() => window.location.href = '/profile/settings'}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              Settings
            </button>
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-4xl font-bold text-white mb-2">Your Appointment Slots</h2>
            <p className="text-slate-300">Manage your availability</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.href = '/faculty/bookings'}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition font-semibold"
            >
              View Bookings
            </button>
            <button
              onClick={handleGenerateShareToken}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition font-semibold"
            >
              <Share2 size={20} />
              Share Schedule
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold"
            >
              <Plus size={20} />
              Create Slot
            </button>
            <button
              onClick={() => setShowBookingsModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition font-semibold"
            >
              <Calendar size={20} />
              View Bookings
            </button>
          </div>
        </div>

        {shareToken && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-8">
            <p className="text-emerald-800 font-medium">Share your schedule:</p>
            <code className="block bg-emerald-100 p-3 rounded mt-2 text-emerald-900 break-all text-sm">
              {`${window.location.origin}/public/schedule/${shareToken}`}
            </code>
          </div>
        )}

        {loading ? (
          <div className="text-center text-slate-300 py-12">Loading slots...</div>
        ) : slots.length === 0 ? (
          <div className="text-center text-slate-300 py-12">
            <Calendar size={48} className="mx-auto mb-4 opacity-50" />
            <p>No appointment slots yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {slots.map((slot) => (
              <div
                key={slot._id}
                className={`rounded-xl shadow-lg overflow-hidden transition-all ${
                  slot.isCancelled
                    ? 'bg-slate-700 opacity-60'
                    : 'bg-white hover:shadow-xl'
                }`}
              >
                <div className={`px-6 py-4 ${slot.isCancelled ? 'bg-red-900' : 'bg-blue-50'}`}>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Calendar size={16} className={slot.isCancelled ? 'text-red-200' : 'text-blue-600'} />
                    <span className={slot.isCancelled ? 'text-red-100' : 'text-blue-900'}>
                      {formatDate(slot.startTime)}
                    </span>
                  </div>
                </div>

                <div className="px-6 py-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <Clock size={18} className="text-slate-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Time</p>
                      <p className={`font-medium ${slot.isCancelled ? 'text-slate-400' : 'text-slate-900'}`}>
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
                      <p className={`font-medium ${slot.isCancelled ? 'text-slate-400' : 'text-slate-900'}`}>
                        {slot.location}
                      </p>
                    </div>
                  </div>

                  {slot.notes && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Notes</p>
                      <p className={`text-sm ${slot.isCancelled ? 'text-slate-400' : 'text-slate-700'}`}>
                        {slot.notes}
                      </p>
                    </div>
                  )}

                  {slot.isCancelled && (
                    <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
                      <span>Cancelled</span>
                    </div>
                  )}
                </div>

                {!slot.isCancelled && (
                  <div className="px-6 py-4 bg-slate-50 flex gap-2 border-t border-slate-200">
                    <button
                      onClick={() => {
                        setSelectedSlot(slot);
                        setShowEditModal(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition font-medium text-sm"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleCancelSlot(slot._id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg transition font-medium text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeleteSlot(slot._id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition font-medium text-sm"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {showCreateModal && (
          <CreateSlotModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              fetchSlots();
            }}
          />
        )}

        {showEditModal && selectedSlot && (
          <EditSlotModal
            slot={selectedSlot}
            onClose={() => {
              setShowEditModal(false);
              setSelectedSlot(null);
            }}
            onSuccess={() => {
              setShowEditModal(false);
              setSelectedSlot(null);
              fetchSlots();
            }}
          />
        )}

        {showBookingsModal && (
          <ViewBookingsModal onClose={() => setShowBookingsModal(false)} />
        )}
      </div>
    </div>
  );
};

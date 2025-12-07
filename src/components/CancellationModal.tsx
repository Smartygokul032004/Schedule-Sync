import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import api from '../utils/api';

interface CancellationModalProps {
  bookingId: string;
  facultyName: string;
  slotTime: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const CancellationModal: React.FC<CancellationModalProps> = ({
  bookingId,
  facultyName,
  slotTime,
  onClose,
  onSuccess,
}) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const commonReasons = [
    'Schedule conflict',
    'Not needed anymore',
    'Rescheduling to another time',
    'Technical issues',
    'Personal emergency',
  ];

  const handleCancel = async () => {
    try {
      setError('');
      setLoading(true);

      await api.post(`/student/cancel-booking/${bookingId}`, { reason: reason || 'No reason provided' });

      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to cancel booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Cancel Booking</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="text-orange-600 flex-shrink-0" size={20} />
            <div>
              <p className="font-medium text-orange-900">Confirm Cancellation</p>
              <p className="text-sm text-orange-700 mt-1">
                You're about to cancel your booking with {facultyName} on {slotTime}
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Reason for cancellation (optional)
            </label>
            <div className="space-y-2 mb-3">
              {commonReasons.map((r) => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  className={`w-full text-left px-3 py-2 rounded border transition ${
                    reason === r
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Or type your own reason..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-slate-300 text-white font-medium py-2 rounded-lg transition"
            >
              {loading ? 'Cancelling...' : 'Cancel Booking'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-2 rounded-lg transition"
            >
              Keep Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancellationModal;

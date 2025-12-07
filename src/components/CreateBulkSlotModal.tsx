import React, { useState } from 'react';
import { X } from 'lucide-react';
import api from '../utils/api';

interface BulkSlotForm {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
  notes: string;
  repeatDays: number[];
}

interface CreateBulkSlotModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateBulkSlotModal: React.FC<CreateBulkSlotModalProps> = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState<BulkSlotForm>({
    startDate: '',
    endDate: '',
    startTime: '10:00',
    endTime: '11:00',
    location: '',
    notes: '',
    repeatDays: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [slotsPreview, setSlotsPreview] = useState<string[]>([]);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const toggleDay = (dayIndex: number) => {
    setForm((prev) => ({
      ...prev,
      repeatDays: prev.repeatDays.includes(dayIndex)
        ? prev.repeatDays.filter((d) => d !== dayIndex)
        : [...prev.repeatDays, dayIndex].sort(),
    }));
  };

  const generatePreview = () => {
    if (!form.startDate || !form.endDate || form.repeatDays.length === 0) {
      setSlotsPreview([]);
      return;
    }

    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    const preview: string[] = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to 0-6 (Mon-Sun)

      if (form.repeatDays.includes(adjustedDay)) {
        preview.push(d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }));
      }
    }

    setSlotsPreview(preview.slice(0, 10)); // Show max 10 in preview
  };

  React.useEffect(() => {
    generatePreview();
  }, [form.startDate, form.endDate, form.repeatDays]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!form.location || !form.startDate || !form.endDate || form.repeatDays.length === 0) {
        setError('Please fill all required fields and select at least one day');
        setLoading(false);
        return;
      }

      await api.post('/faculty/bulk-slots', {
        startDate: form.startDate,
        endDate: form.endDate,
        startTime: form.startTime,
        endTime: form.endTime,
        location: form.location,
        notes: form.notes,
        repeatDays: form.repeatDays,
      });

      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create slots');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-slate-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-slate-900">Create Multiple Slots</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Repeat On * (Select days)
            </label>
            <div className="grid grid-cols-7 gap-2">
              {daysOfWeek.map((day, index) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(index)}
                  className={`py-2 rounded text-sm font-medium transition ${
                    form.repeatDays.includes(index)
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {day.substring(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Start Time
              </label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                End Time
              </label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Location *
            </label>
            <input
              type="text"
              placeholder="e.g., Room 101 or Zoom Link"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="Additional notes..."
            />
          </div>

          {slotsPreview.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm font-medium text-blue-900 mb-2">
                Preview: {slotsPreview.length} slots will be created
              </p>
              <div className="flex flex-wrap gap-2">
                {slotsPreview.map((date, index) => (
                  <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {date}
                  </span>
                ))}
                {slotsPreview.length < (new Date(form.endDate).getTime() - new Date(form.startDate).getTime()) / (1000 * 60 * 60 * 24) + 1 && (
                  <span className="text-xs text-blue-600">...</span>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white font-medium py-2 rounded-lg transition"
            >
              {loading ? 'Creating...' : 'Create Slots'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-2 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBulkSlotModal;

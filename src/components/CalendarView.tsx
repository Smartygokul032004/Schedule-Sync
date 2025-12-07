import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';

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

interface CalendarViewProps {
  slots: Slot[];
  onSelectSlot?: (slot: Slot) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ slots, onSelectSlot }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getSlotsForDate = (date: Date) => {
    return slots.filter((slot) => {
      const slotDate = new Date(slot.startTime);
      return (
        slotDate.getDate() === date.getDate() &&
        slotDate.getMonth() === date.getMonth() &&
        slotDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">{monthName}</h2>
        <div className="flex gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <ChevronLeft size={20} className="text-slate-600" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <ChevronRight size={20} className="text-slate-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center font-semibold text-slate-600 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((date, index) => {
          const daySlots = date ? getSlotsForDate(date) : [];
          const isToday = date && date.toDateString() === new Date().toDateString();

          return (
            <div
              key={index}
              className={`min-h-24 p-2 rounded-lg border-2 transition ${
                date
                  ? isToday
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 bg-white hover:border-blue-300'
                  : 'bg-slate-50'
              }`}
            >
              {date && (
                <>
                  <div className="font-semibold text-slate-900 mb-1">{date.getDate()}</div>
                  <div className="space-y-1">
                    {daySlots.slice(0, 2).map((slot) => (
                      <button
                        key={slot._id}
                        onClick={() => onSelectSlot?.(slot)}
                        className={`w-full text-xs p-1 rounded truncate text-white transition cursor-pointer ${
                          slot.isCancelled
                            ? 'bg-red-400'
                            : slot.isBooked
                            ? 'bg-slate-400'
                            : 'bg-blue-500 hover:bg-blue-600'
                        }`}
                        title={`${new Date(slot.startTime).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })} - ${slot.location}`}
                      >
                        {new Date(slot.startTime).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </button>
                    ))}
                    {daySlots.length > 2 && (
                      <div className="text-xs text-slate-500 px-1">+{daySlots.length - 2} more</div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {slots.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-3">Upcoming Slots</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {slots
              .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
              .slice(0, 5)
              .map((slot) => (
                <button
                  key={slot._id}
                  onClick={() => onSelectSlot?.(slot)}
                  className="w-full text-left p-3 rounded-lg hover:bg-slate-50 transition border border-slate-200"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-slate-900">
                        {new Date(slot.startTime).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock size={14} className="text-slate-500" />
                        <span className="text-sm text-slate-600">
                          {new Date(slot.startTime).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {' - '}
                          {new Date(slot.endTime).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin size={14} className="text-slate-500" />
                        <span className="text-sm text-slate-600">{slot.location}</span>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                        slot.isCancelled
                          ? 'bg-red-100 text-red-700'
                          : slot.isBooked
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {slot.isCancelled ? 'Cancelled' : slot.isBooked ? 'Booked' : 'Available'}
                    </span>
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { OnlineStatusBadge } from './OnlineStatusBadge';

interface Faculty {
  _id: string;
  name: string;
  email: string;
  department?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

interface FacultyCardProps {
  faculty: Faculty;
  onViewSlots: (facultyId: string) => void;
}

export const FacultyCard: React.FC<FacultyCardProps> = ({ faculty, onViewSlots }) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 border-l-4 border-blue-500">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{faculty.name}</h3>
          <p className="text-sm text-slate-500">{faculty.email}</p>
        </div>
        <OnlineStatusBadge isOnline={faculty.isOnline || false} lastSeen={faculty.lastSeen} size="md" />
      </div>

      {faculty.department && (
        <p className="text-sm text-slate-600 mb-4">
          <span className="font-medium">Department:</span> {faculty.department}
        </p>
      )}

      <button
        onClick={() => onViewSlots(faculty._id)}
        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
      >
        View Available Slots
      </button>
    </div>
  );
};

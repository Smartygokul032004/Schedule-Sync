# Integration Guide - New Features

## Quick Start - Using the New Features

### 1. Notifications

#### Backend Setup (Already Done)
- Notification model created
- Routes registered in `server/index.ts`
- Helper functions in `server/utils/notifications.ts`

#### Frontend Integration
Add NotificationBell to your navbar/dashboard:

```tsx
import { NotificationBell } from './components/NotificationBell';

// In your dashboard/layout component
<div className="flex items-center gap-4">
  <NotificationBell />
  {/* other navbar items */}
</div>
```

#### Automatic Triggers
Notifications are automatically sent when:
- Faculty approves a booking → Student notified
- Faculty rejects a booking → Student notified
- Faculty cancels a booking → Student notified
- Student cancels a booking → Faculty notified

---

### 2. Bulk Slot Creation

#### Add Button to Faculty Dashboard
```tsx
import { CreateBulkSlotModal } from './components/CreateBulkSlotModal';
import { Plus } from 'lucide-react';

// In your FacultyDashboard
const [showBulkModal, setShowBulkModal] = useState(false);

return (
  <div className="flex gap-2 mb-4">
    <button
      onClick={() => setShowModal(true)}
      className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2"
    >
      <Plus size={20} /> Create Slot
    </button>
    <button
      onClick={() => setShowBulkModal(true)}
      className="bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2"
    >
      <Plus size={20} /> Create Multiple
    </button>
  </div>
);

{showBulkModal && (
  <CreateBulkSlotModal
    onClose={() => setShowBulkModal(false)}
    onSuccess={() => {
      setShowBulkModal(false);
      fetchSlots(); // Refresh slots
    }}
  />
)}
```

#### API Call Example
```typescript
// For testing in console
const response = await api.post('/faculty/bulk-slots', {
  startDate: '2024-12-15',
  endDate: '2025-01-15',
  startTime: '10:00',
  endTime: '11:00',
  location: 'Room 101',
  notes: 'Regular office hours',
  repeatDays: [0, 2, 4], // Monday, Wednesday, Friday
});

console.log(`Created ${response.data.count} slots`);
```

---

### 3. Cancellation with Reasons

#### Update StudentBookings Component
```tsx
import { CancellationModal } from './components/CancellationModal';

// In your StudentBookings component
const [cancellingBooking, setCancellingBooking] = useState<string | null>(null);

return (
  <>
    {/* Booking list */}
    {bookings.map((booking) => (
      <div key={booking._id} className="...">
        <h3>{booking.faculty.name}</h3>
        <p>{new Date(booking.slot.startTime).toLocaleString()}</p>
        
        {booking.status === 'approved' && (
          <button
            onClick={() => setCancellingBooking(booking._id)}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Cancel Booking
          </button>
        )}
      </div>
    ))}

    {/* Cancellation modal */}
    {cancellingBooking && (
      <CancellationModal
        bookingId={cancellingBooking}
        facultyName={/* faculty name */}
        slotTime={/* slot time */}
        onClose={() => setCancellingBooking(null)}
        onSuccess={() => {
          setCancellingBooking(null);
          fetchBookings(); // Refresh
        }}
      />
    )}
  </>
);
```

#### Updated Cancel API Call
```typescript
// Old way (still works)
await api.post(`/student/cancel-booking/${bookingId}`);

// New way (with reason)
await api.post(`/student/cancel-booking/${bookingId}`, {
  reason: 'Schedule conflict'
});
```

---

### 4. Rescheduling

#### Add Reschedule Button
```tsx
// In StudentBookings or StudentDashboard
<button
  onClick={() => handleReschedule(booking._id)}
  className="bg-blue-500 text-white px-4 py-2 rounded"
>
  Reschedule
</button>
```

#### Reschedule Function
```typescript
const handleReschedule = async (bookingId: string) => {
  // 1. Fetch available slots for the faculty
  const slots = await api.get(`/student/faculty/${facultyId}/slots`);
  
  // 2. Let student select new slot
  const newSlotId = await showSlotSelector(slots.data);
  
  // 3. Call reschedule endpoint
  try {
    const response = await api.post(`/student/reschedule-booking/${bookingId}`, {
      newSlotId: newSlotId
    });
    
    console.log('Rescheduled:', response.data);
    // Old booking marked as cancelled
    // New booking created as pending
    // Faculty sees booking request for new slot
  } catch (error) {
    console.error('Reschedule failed:', error);
  }
};
```

---

### 5. Email Integration (Optional)

#### Setup SendGrid (Example)
```bash
npm install nodemailer
# or
npm install @sendgrid/mail
```

#### Update `server/utils/notifications.ts`
```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'sendgrid',
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY
  }
});

const sendEmailNotification = async (userId: string, subject: string, message: string) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@schedulesync.com',
      to: user.email,
      subject: subject,
      html: `
        <h2>${subject}</h2>
        <p>${message}</p>
        <p>Log in to SchedulSync to view details.</p>
      `,
    });

    console.log(`Email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
```

#### Add to `.env`
```
SENDGRID_API_KEY=your_sendgrid_api_key_here
EMAIL_FROM=noreply@schedulesync.com
```

---

### 6. WebSocket Integration (Optional)

#### For Real-time Notifications
```bash
npm install socket.io
npm install socket.io-client
```

#### Backend Setup
```typescript
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import express from 'express';

const app = express();
const server = createServer(app);
const io = new SocketServer(server, {
  cors: { origin: 'http://localhost:5173' }
});

io.on('connection', (socket) => {
  const userId = socket.handshake.auth.userId;
  
  socket.join(`user_${userId}`);
  console.log(`User ${userId} connected`);

  socket.on('disconnect', () => {
    console.log(`User ${userId} disconnected`);
  });
});

// When creating notification
io.to(`user_${notification.userId}`).emit('notification', notification);
```

#### Frontend Setup
```typescript
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './context/AuthContext';

export const useNotifications = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const socket = io('http://localhost:5000', {
      auth: { userId: user.id }
    });

    socket.on('notification', (notification) => {
      console.log('New notification:', notification);
      // Update UI
    });

    return () => socket.disconnect();
  }, [user]);
};
```

---

## Testing Checklist

### Notifications
- [ ] Faculty approves booking → Student gets notification
- [ ] Faculty rejects booking with reason → Student sees reason
- [ ] Student cancels booking → Faculty notified
- [ ] Click notification → Mark as read
- [ ] Click "Mark all as read" → All marked
- [ ] Delete individual notification
- [ ] Unread count decreases

### Bulk Slots
- [ ] Select date range and days
- [ ] Preview shows correct slots
- [ ] Create slots → Check in slot list
- [ ] Verify only selected days created
- [ ] Time range applied correctly

### Cancellation
- [ ] Student clicks cancel
- [ ] CancellationModal shows options
- [ ] Faculty sees reason
- [ ] Faculty can cancel with reason
- [ ] Both parties notified

### Rescheduling
- [ ] Student reschedules booking
- [ ] Old booking marked cancelled
- [ ] New booking created as pending
- [ ] Faculty sees new booking request

---

## API Reference

### Notification Endpoints
```
GET    /api/notifications
PUT    /api/notifications/:notificationId/read
POST   /api/notifications/mark-all-read
DELETE /api/notifications/:notificationId
```

### Booking Management
```
POST   /api/faculty/bulk-slots
PUT    /api/faculty/bookings/:bookingId/approve
PUT    /api/faculty/bookings/:bookingId/reject
PUT    /api/faculty/bookings/:bookingId/cancel
POST   /api/student/cancel-booking/:bookingId
POST   /api/student/reschedule-booking/:bookingId
GET    /api/student/bookings
GET    /api/faculty/bookings
```

---

## Troubleshooting

### Notifications Not Appearing
- Check network tab → `/api/notifications` returning data?
- Check browser console for errors
- Verify user is logged in
- Check MongoDB for notification documents

### Bulk Slots Not Creating
- Check date format (YYYY-MM-DD)
- Check repeatDays array (0-6, where 0 is Monday)
- Verify faculty is logged in
- Check server logs for errors

### Cancellation Modal Not Showing
- Import component correctly
- Check state management
- Verify booking ID is passed
- Check CSS not hiding modal

### Rescheduling Failing
- Check new slot is available (not booked)
- Check new slot is not cancelled
- Verify slot belongs to same faculty
- Check slot end time is in future

---

## Performance Optimization

### Database Indexes to Add
```javascript
// Notification indexes
db.notifications.createIndex({ userId: 1, isRead: 1 });
db.notifications.createIndex({ createdAt: 1 });

// Booking indexes
db.bookings.createIndex({ facultyId: 1, status: 1 });
db.bookings.createIndex({ studentId: 1, createdAt: -1 });
```

### Caching Strategy
```typescript
// Cache unread count in local state
const [unreadCount, setUnreadCount] = useState(0);

// Update only on new notifications
useEffect(() => {
  const handleNewNotification = (notification) => {
    setUnreadCount(prev => prev + 1);
  };
  
  socket.on('notification', handleNewNotification);
}, []);
```

### Cleanup Old Notifications
```bash
# Run daily (using cron)
node -e "require('./server/utils/notifications').cleanupOldNotifications()"

# Or add to server startup
setInterval(() => cleanupOldNotifications(), 24 * 60 * 60 * 1000);
```

---

## Deployment Considerations

### Environment Variables Needed
```
MONGODB_URI=connection_string
JWT_SECRET=your_secret
SENDGRID_API_KEY=optional_for_email
EMAIL_FROM=noreply@schedulesync.com
```

### Database Size
- Each notification ~200 bytes
- Bulk slots can create many records quickly
- Add cleanup task to maintain performance

### Monitoring
- Track notification creation rate
- Monitor email delivery (if enabled)
- Alert on high cancellation rates
- Track bulk slot creation frequency

---

## Support

For issues with new features:

1. Check `ADVANCED_FEATURES.md` for detailed documentation
2. Review `IMPLEMENTATION_SUMMARY.md` for changes made
3. Check server logs: `npm run server` output
4. Check browser console for frontend errors
5. Verify database connections and indexes

---

**Last Updated**: December 7, 2025  
**Version**: 2.0+  
**Status**: Production Ready ✅

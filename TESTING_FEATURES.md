# Test Plan: Recurring Appointments & Waitlist Features

## Test Environment
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000
- **Database**: MongoDB Atlas (Connected)

## Test Cases

### 1. Waitlist Feature - Fully Booked Slot
**Scenario**: Student tries to book a fully booked slot
**Steps**:
1. Login as student
2. Browse faculty
3. View faculty slots
4. Click "Book Slot" on a fully booked slot
5. Should show error "Slot is fully booked" with option to join waitlist
6. Click "Join Waitlist" button
7. WaitlistModal should appear
8. Fill in preferences (timing, notes optional)
9. Click "Join Waitlist"
10. Confirm success message and student added to waitlist

**Expected Results**:
- ✅ Slot status shows "Fully booked"
- ✅ Waitlist count displays
- ✅ Student can join waitlist
- ✅ Modal confirms addition

### 2. Recurring Appointments Feature
**Scenario**: Student books recurring appointment
**Steps**:
1. Login as student
2. Browse faculty
3. View faculty slots with available space
4. Click "🔄 Recurring" button
5. RecurringAppointmentModal appears
6. Select recurrence pattern (weekly/biweekly/monthly)
7. Select end date
8. Click "Create Recurring"
9. Confirm success message

**Expected Results**:
- ✅ Recurring modal appears with faculty info
- ✅ Can select recurrence type
- ✅ Can select end date
- ✅ API creates multiple bookings
- ✅ Success confirmation shown

### 3. Slot Availability Display
**Scenario**: Verify slot status information
**Steps**:
1. Login as student
2. Browse faculty slots
3. Check each slot displays:
   - Time range
   - Location
   - Available spots (or "Fully booked")
   - Waitlist count
   - Status color (green=available, red=full)

**Expected Results**:
- ✅ Slot shows capacity status
- ✅ Shows available spots remaining
- ✅ Shows waitlist count
- ✅ Color coding indicates status

### 4. API Endpoints Testing
```bash
# Recurring Appointments
POST   /api/recurring                    # Create recurring
GET    /api/recurring/student/:id       # Get student's recurring
GET    /api/recurring/faculty/:id       # Get faculty's recurring
POST   /api/recurring/:id/cancel        # Cancel recurring series

# Waitlist
POST   /api/waitlist/join               # Join waitlist
GET    /api/waitlist/slot/:id          # Get slot waitlist
GET    /api/waitlist/student/:id       # Get student's waitlist
POST   /api/waitlist/:id/cancel        # Cancel waitlist entry
POST   /api/waitlist/:id/accept        # Accept waitlist offer
POST   /api/waitlist/check-and-notify/:slotId  # Notify next student
```

## Features Implemented

### Backend
- [x] RecurringAppointment Model
- [x] Waitlist Model
- [x] Updated Booking Model with recurringAppointmentId
- [x] /api/recurring routes
- [x] /api/waitlist routes
- [x] Automatic waitlist position management
- [x] Booking capacity checking

### Frontend
- [x] RecurringAppointmentModal component
- [x] WaitlistModal component
- [x] Updated StudentDashboard
- [x] Slot availability display
- [x] Recurring button on available slots
- [x] Join Waitlist button on full slots

## Known Good Paths

1. **Student books available slot**
   - Select slot → Click "Book Slot" → Confirmation

2. **Student wants recurring**
   - Select slot → Click "🔄 Recurring" → Set pattern & end date → Confirmation

3. **Student joins waitlist**
   - Select full slot → Click "Book Slot" → Error "isFull: true" → Click "Join Waitlist" → Fill preferences → Confirmation

## Database Collections

All models save correctly to MongoDB:
- Bookings (with recurringAppointmentId reference)
- RecurringAppointments
- Waitlists
- Slots
- Users

---
**Status**: Testing in progress
**Backend**: ✅ Running on port 5000
**Frontend**: ✅ Running on port 5173
**Database**: ✅ Connected to MongoDB Atlas

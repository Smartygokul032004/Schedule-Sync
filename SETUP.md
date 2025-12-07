# ScheduleSync - Setup Guide

ScheduleSync is a smart appointment scheduling system where faculty members create appointment time slots and students can book those slots.

## Project Structure

```
project/
├── src/                           # Frontend (React + TypeScript)
│   ├── pages/                     # Main pages
│   │   ├── Login.tsx              # User login
│   │   ├── Signup.tsx             # User registration
│   │   ├── FacultyDashboard.tsx   # Faculty management
│   │   ├── StudentDashboard.tsx   # Student booking
│   │   └── PublicSchedule.tsx     # Public schedule view
│   ├── components/                # Reusable components
│   │   ├── CreateSlotModal.tsx    # Create appointment modal
│   │   ├── EditSlotModal.tsx      # Edit appointment modal
│   │   └── ViewBookingsModal.tsx  # View bookings modal
│   ├── context/                   # React context
│   │   └── AuthContext.tsx        # Authentication state
│   ├── utils/                     # Utilities
│   │   └── api.ts                 # Axios API client
│   └── App.tsx                    # Main app with routing
│
├── server/                        # Backend (Node.js + Express)
│   ├── models/                    # MongoDB schemas
│   │   ├── User.ts                # User model
│   │   ├── Slot.ts                # Appointment slot model
│   │   └── Booking.ts             # Booking model
│   ├── routes/                    # API endpoints
│   │   ├── auth.ts                # Authentication endpoints
│   │   ├── faculty.ts             # Faculty endpoints
│   │   ├── student.ts             # Student endpoints
│   │   └── public.ts              # Public endpoints
│   ├── middleware/                # Express middleware
│   │   └── auth.ts                # JWT authentication
│   └── index.ts                   # Server entry point
│
└── .env                           # Environment configuration
```

## Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB Atlas account (already configured)

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

## Configuration

The `.env` file is already configured with:
- MongoDB connection string
- JWT secret
- API URL

No additional setup needed!

## Running the Application

### Start Backend Server
```bash
npm run server
```
The backend will run on `http://localhost:5000`

### Start Frontend Dev Server
In a new terminal:
```bash
npm run dev
```
The frontend will run on `http://localhost:5173`

## Features

### Faculty Features
- **Create Slots**: Set appointment time slots with date, time, location, and notes
- **Manage Slots**: Edit, delete, or cancel created slots
- **View Bookings**: See which students booked which slots
- **Share Schedule**: Generate a public link to share availability

### Student Features
- **Browse Faculty**: Search and filter faculty members
- **View Availability**: See all available slots in a calendar/list format
- **Book Slots**: Instantly book appointments
- **My Bookings**: View upcoming and past appointments
- **Cancel Appointments**: Cancel their own bookings

### Public Features
- **Share Schedule**: Faculty can generate a public link to share their availability with anyone
- **View Public Schedule**: Non-authenticated users can view available slots

## Authentication

The system uses JWT-based authentication:
- Users register with email and password
- Passwords are hashed using bcrypt
- JWT tokens are issued on login with 30-day expiration
- All protected routes require a valid token

## Database Schema

### Users Collection
- `name`: User's full name
- `email`: Unique email address
- `password`: Hashed password
- `role`: 'faculty' or 'student'
- `department`: Faculty department (optional)
- `publicShareToken`: Token for public schedule sharing (optional)

### Slots Collection
- `facultyId`: Faculty member's ID
- `startTime`: Appointment start time
- `endTime`: Appointment end time
- `location`: Location details (room number, online link, etc.)
- `notes`: Additional notes
- `capacity`: Number of slots available
- `isCancelled`: Cancellation status

### Bookings Collection
- `slotId`: ID of booked slot
- `facultyId`: Faculty member's ID
- `studentId`: Student's ID
- `status`: 'confirmed' or 'cancelled'

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login

### Faculty
- `POST /api/faculty/slots` - Create appointment slot
- `GET /api/faculty/slots` - Get all slots
- `PUT /api/faculty/slots/:id` - Update slot
- `DELETE /api/faculty/slots/:id` - Delete slot
- `POST /api/faculty/slots/:id/cancel` - Cancel slot
- `GET /api/faculty/bookings` - View all bookings
- `POST /api/faculty/generate-share-token` - Generate public share link

### Student
- `GET /api/student/faculty` - Get all faculty (with search/filter)
- `GET /api/student/faculty/:facultyId/slots` - Get available slots
- `POST /api/student/book-slot` - Book a slot
- `GET /api/student/my-bookings` - Get student's bookings
- `POST /api/student/cancel-booking/:bookingId` - Cancel booking

### Public
- `GET /api/public/faculty/:token/schedule` - View public schedule

## How to Use

### For Faculty

1. **Sign Up**: Register as Faculty with name, email, password, and department
2. **Create Slots**: Click "Create Slot" on dashboard, set time, location, and notes
3. **Share Schedule**: Generate a public link to share availability
4. **Manage Bookings**: View all student bookings and manage your slots

### For Students

1. **Sign Up**: Register as Student with name and email
2. **Browse Faculty**: View available faculty members
3. **Select Faculty**: Click on a faculty member to see their schedule
4. **Book Slot**: Click "Book Slot" on available appointments
5. **View Bookings**: Check "My Bookings" to see confirmed appointments
6. **Cancel**: Cancel bookings if needed

## Troubleshooting

### Backend Connection Issues
- Ensure MongoDB connection string is correct in `.env`
- Check if MongoDB Atlas cluster is active
- Verify network access is allowed in MongoDB Atlas

### Frontend Not Connecting to Backend
- Make sure backend is running on port 5000
- Check `VITE_API_URL` in `.env`
- Clear browser cache and restart dev server

### Authentication Issues
- Clear localStorage and log in again
- Check JWT token expiration (30 days)
- Verify role-based access (faculty-only/student-only pages)

## Deployment

### Frontend
- Build: `npm run build`
- Deploy `dist/` folder to Vercel, Netlify, or your hosting provider

### Backend
- Deploy server files to Render, Railway, or your VPS
- Set environment variables in production

## Support

For issues or questions, check the code structure and API endpoints above.

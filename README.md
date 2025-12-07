# SchedulSync - Complete Project Overview & Report

## Executive Summary

**SchedulSync** is a comprehensive appointment scheduling system designed for educational institutions. It facilitates seamless scheduling between faculty members and students, allowing faculty to create appointment slots and students to book them. The system includes real-time availability status tracking, profile management, and booking management capabilities.

---

## Project Information

**Project Name:** SchedulSync  
**Project Type:** Full-Stack Web Application  
**Duration:** Final Year Project  
**Tech Stack:** MERN Stack (MongoDB, Express, React, Node.js)  
**Repository:** SchedulSync-Project-main

---

## Technology Stack

### Frontend
- **Framework:** React 18.3.1
- **Language:** TypeScript 5.0+
- **Build Tool:** Vite (v5+)
- **UI Library:** Tailwind CSS 4.0+
- **Icons:** Lucide React 0.344.0
- **HTTP Client:** Axios 1.13.2
- **Routing:** React Router DOM 7.9.6

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express 5.1.0
- **Language:** TypeScript
- **Database:** MongoDB Atlas (Cloud)
- **Authentication:** JWT (jsonwebtoken 9.0.2)
- **Password Hashing:** bcryptjs 3.0.3
- **CORS:** Enabled for cross-origin requests

### Database
- **Type:** NoSQL (MongoDB)
- **Hosting:** MongoDB Atlas Cloud
- **Connection:** mongodb+srv://smarty_db:smarty123@cluster0.jg7eazy.mongodb.net

### Development Tools
- **Task Runner:** npm scripts
- **Linting:** ESLint with JavaScript ruleset
- **Code Quality:** TypeScript strict mode enabled

---

## Project Structure

```
SchedulSync-Project-main/
├── src/                                 # Frontend (React + TypeScript)
│   ├── App.tsx                         # Main app with routing
│   ├── main.tsx                        # Entry point
│   ├── index.css                       # Global styles
│   ├── vite-env.d.ts                   # Vite type definitions
│   │
│   ├── pages/                          # Page components
│   │   ├── Login.tsx                   # User authentication
│   │   ├── Signup.tsx                  # User registration
│   │   ├── FacultyDashboard.tsx        # Faculty main dashboard
│   │   ├── FacultyProfile.tsx          # Faculty profile view
│   │   ├── FacultyBookings.tsx         # Faculty booking management
│   │   ├── StudentDashboard.tsx        # Student main dashboard
│   │   ├── StudentProfile.tsx          # Student profile view
│   │   ├── StudentBookings.tsx         # Student booking management
│   │   ├── PublicSchedule.tsx          # Public schedule view
│   │   └── ProfileSettings.tsx         # Profile settings (NEW)
│   │
│   ├── components/                     # Reusable components
│   │   ├── CalendarView.tsx            # Calendar display
│   │   ├── CreateSlotModal.tsx         # Create slot form modal
│   │   ├── EditSlotModal.tsx           # Edit slot form modal
│   │   ├── ViewBookingsModal.tsx       # View bookings modal
│   │   ├── FacultyCard.tsx             # Faculty member card
│   │   └── OnlineStatusBadge.tsx       # Online/offline indicator
│   │
│   ├── context/                        # React Context
│   │   └── AuthContext.tsx             # Authentication state management
│   │
│   └── utils/                          # Utilities
│       └── api.ts                      # Axios API client with interceptors
│
├── server/                             # Backend (Node.js + Express + TypeScript)
│   ├── index.ts                        # Server entry point
│   │
│   ├── models/                         # MongoDB Schemas (Mongoose)
│   │   ├── User.ts                     # User model (Faculty/Student)
│   │   ├── Slot.ts                     # Appointment slot model
│   │   └── Booking.ts                  # Booking model (NEW - updated)
│   │
│   ├── routes/                         # API endpoints
│   │   ├── auth.ts                     # Authentication endpoints
│   │   ├── faculty.ts                  # Faculty-specific endpoints
│   │   ├── student.ts                  # Student-specific endpoints
│   │   └── public.ts                   # Public access endpoints
│   │
│   └── middleware/                     # Express middleware
│       └── auth.ts                     # JWT authentication middleware
│
├── Configuration Files
│   ├── package.json                    # Dependencies & scripts
│   ├── tsconfig.json                   # TypeScript configuration
│   ├── tsconfig.app.json               # App TypeScript settings
│   ├── tsconfig.node.json              # Node TypeScript settings
│   ├── vite.config.ts                  # Vite build configuration
│   ├── tailwind.config.js              # Tailwind CSS configuration
│   ├── postcss.config.js               # PostCSS configuration
│   ├── eslint.config.js                # ESLint configuration
│   ├── .env                            # Environment variables
│   └── .gitignore                      # Git ignore rules
│
├── Documentation Files
│   ├── README.md                       # Project README
│   ├── SETUP.md                        # Setup instructions
│   ├── NEW_FEATURES.md                 # New features documentation
│   ├── AVAILABILITY_STATUS_FEATURE.md  # Status feature docs
│   └── PROJECT_OVERVIEW_REPORT.md      # This file
│
└── Build Outputs
    ├── dist/                           # Production build output
    ├── node_modules/                   # Dependencies
    └── .vite/                          # Vite cache
```

---

## Key Features

### 1. User Authentication & Authorization
- **Signup**: Users register as Faculty or Student
- **Login**: Secure JWT-based authentication (30-day expiration)
- **Role-Based Access**: Different dashboards and features for faculty vs. students
- **Password Security**: bcryptjs hashing (10 salt rounds)
- **Token Management**: Automatic token refresh and localStorage management

### 2. Faculty Features

#### Slot Management
- **Create Slots**: Schedule appointment time slots with:
  - Start and end time
  - Location details
  - Additional notes
  - Capacity limit
- **Edit Slots**: Modify existing slot details
- **Delete Slots**: Remove unwanted slots
- **Cancel Slots**: Disable slots without deletion
- **View Slots**: Calendar/list view of all created slots

#### Booking Management (NEW)
- **View Bookings**: See all student bookings
- **Approve Bookings**: Accept pending booking requests
- **Reject Bookings**: Decline student booking requests
- **Cancel Bookings**: Cancel approved bookings
- **Booking Status**: Track status (pending, approved, rejected, cancelled)

#### Profile Management (NEW)
- **Edit Bio**: Add professional biography
- **Add Qualifications**: List credentials and certifications
- **Upload Profile Photo**: Display profile picture
- **View Statistics**: Track total slots, available slots, booked slots
- **Online Status**: Toggle availability status in real-time

#### Public Schedule Sharing
- **Generate Share Link**: Create public token for schedule sharing
- **Public Access**: Non-authenticated users can view schedule
- **Share via URL**: Distribute link to students or parents

### 3. Student Features

#### Faculty Discovery
- **Browse Faculty**: View all available faculty members
- **Search Faculty**: Find faculty by name or department
- **View Profiles**: See detailed faculty information
- **Online Status**: Check faculty availability
- **Department Filter**: Filter by academic department

#### Booking Management
- **View Available Slots**: Browse faculty appointment slots
- **Book Slots**: Reserve appointments
- **My Bookings**: View all active bookings
- **Cancel Bookings**: Cancel own bookings
- **Booking History**: Track past bookings

#### Profile Management (NEW)
- **Edit Profile**: Update bio information
- **View Bookings**: Complete booking history
- **Manage Bookings**: Cancel active bookings
- **Profile Statistics**: View total bookings count

### 4. Real-Time Availability Status (NEW)
- **Online/Offline Status**: Faculty can toggle availability
- **Last Seen Timestamp**: Track when faculty was last online
- **Automatic Management**: Auto-set status on login/logout
- **Visual Indicators**: Green pulse for online, gray for offline
- **Student View**: Students see faculty availability

### 5. Data Visualization
- **Calendar View**: Monthly calendar display with slot indicators
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Status Badges**: Visual indicators for slot availability
- **Today Highlight**: Emphasis on current date

### 6. User Roles & Permissions

#### Faculty Role
- Create, edit, delete appointment slots
- View and manage student bookings
- Approve/reject/cancel bookings
- Generate public schedule link
- Manage profile and qualifications
- Toggle online/offline status

#### Student Role
- Browse available faculty
- View faculty schedules and profiles
- Book appointment slots
- Manage own bookings
- View booking history
- Manage profile

---

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique, lowercase),
  password: String (hashed, required),
  role: String (enum: ['faculty', 'student'], required),
  department: String (optional, for faculty),
  bio: String (optional),
  qualifications: [String] (optional array),
  profilePhoto: String (optional, URL),
  publicShareToken: String (optional, unique),
  isOnline: Boolean (default: false),
  lastSeen: Date (default: current date),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### Slots Collection
```javascript
{
  _id: ObjectId,
  facultyId: ObjectId (ref: User, required),
  startTime: Date (required),
  endTime: Date (required),
  location: String (required),
  notes: String (optional),
  capacity: Number (default: 1),
  isCancelled: Boolean (default: false),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### Bookings Collection
```javascript
{
  _id: ObjectId,
  slotId: ObjectId (ref: Slot, required),
  facultyId: ObjectId (ref: User, required),
  studentId: ObjectId (ref: User, required),
  status: String (enum: ['pending', 'approved', 'rejected', 'cancelled'], default: 'pending'),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

---

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| POST | `/signup` | Register new user | No |
| POST | `/login` | User login | No |
| POST | `/status/online` | Set user as online | Yes |
| POST | `/status/offline` | Set user as offline | Yes |
| GET | `/profile` | Get own profile | Yes |
| GET | `/profile/:userId` | Get public profile | No |
| PUT | `/profile` | Update profile | Yes |
| PUT | `/profile/settings` | Update profile settings | Yes |

### Faculty Routes (`/api/faculty`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/slots` | Create appointment slot | Faculty |
| GET | `/slots` | Get all slots | Faculty |
| PUT | `/slots/:id` | Update slot | Faculty |
| DELETE | `/slots/:id` | Delete slot | Faculty |
| POST | `/slots/:id/cancel` | Cancel slot | Faculty |
| GET | `/bookings` | Get all bookings | Faculty |
| PUT | `/bookings/:bookingId/approve` | Approve booking | Faculty |
| PUT | `/bookings/:bookingId/reject` | Reject booking | Faculty |
| PUT | `/bookings/:bookingId/cancel` | Cancel booking | Faculty |
| POST | `/generate-share-token` | Generate public link | Faculty |

### Student Routes (`/api/student`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/faculty` | Get all faculty | Student |
| GET | `/faculty/:facultyId/slots` | Get faculty slots | Student |
| POST | `/book-slot` | Book appointment | Student |
| GET | `/bookings` | Get my bookings | Student |
| POST | `/cancel-booking/:bookingId` | Cancel booking | Student |

### Public Routes (`/api/public`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/faculty/:token/schedule` | View public schedule | No |

---

## Frontend Pages & Routes

| Route | Component | Description | Role | Status |
|-------|-----------|-------------|------|--------|
| `/login` | Login.tsx | User login page | Any | ✓ |
| `/signup` | Signup.tsx | User registration | Any | ✓ |
| `/faculty/dashboard` | FacultyDashboard.tsx | Main faculty dashboard | Faculty | ✓ |
| `/faculty/profile/:facultyId` | FacultyProfile.tsx | View faculty profile | Any | ✓ |
| `/faculty/bookings` | FacultyBookings.tsx | Manage bookings | Faculty | ✓ NEW |
| `/student/dashboard` | StudentDashboard.tsx | Main student dashboard | Student | ✓ |
| `/student/profile` | StudentProfile.tsx | View student profile | Student | ✓ |
| `/student/bookings` | StudentBookings.tsx | Manage bookings | Student | ✓ NEW |
| `/profile/settings` | ProfileSettings.tsx | Update profile | Any | ✓ NEW |
| `/public/:token` | PublicSchedule.tsx | Public schedule view | Any | ✓ |

---

## Recent Implementations (Latest Session)

### 1. Profile Settings Feature (NEW)
**Purpose**: Allow users to edit their profile information, bio, qualifications, and profile photo.

**Implementation**:
- New route: `PUT /api/auth/profile/settings`
- New component: `ProfileSettings.tsx`
- Frontend validation for form inputs
- Backend validation and error handling

**Features**:
- Edit bio/about
- Add/modify qualifications
- Upload profile photo
- Save and update functionality
- Success/error notifications

### 2. Booking Management Feature (NEW)
**Purpose**: Implement complete booking lifecycle management with approval/rejection workflow.

**Faculty Side**:
- View all student bookings
- Approve pending bookings → status changes to 'approved'
- Reject bookings → status changes to 'rejected'
- Cancel bookings → status changes to 'cancelled'
- New routes: `GET /api/faculty/bookings`, `PUT /api/faculty/bookings/:bookingId/approve|reject|cancel`
- New component: `FacultyBookings.tsx`

**Student Side**:
- View all own bookings
- See booking status (pending, approved, rejected, cancelled)
- Cancel active bookings
- New routes: `GET /api/student/bookings`, `POST /api/student/cancel-booking/:bookingId`
- New component: `StudentBookings.tsx`

**Model Update**:
- Updated `Booking.ts` model enum from `['confirmed', 'cancelled']` to `['pending', 'approved', 'rejected', 'cancelled']`

### 3. Data Type & ObjectId Fixes (LATEST)
**Issue**: Bookings were fetching but slot data was null, causing UI crashes.

**Root Cause**: 
- Database schema was storing `slotId`, `facultyId`, `studentId` as strings instead of MongoDB ObjectId references
- Mongoose couldn't properly match relationships during queries

**Solution**:
- Updated `Booking.ts` model: Changed all IDs to `mongoose.Schema.Types.ObjectId` with `ref` attributes
- Updated `Slot.ts` model: Changed `facultyId` to `mongoose.Schema.Types.ObjectId` with `ref` attribute
- Added custom setter functions to auto-convert string ObjectIds to proper ObjectId instances
- Updated all queries to properly handle ObjectId conversions
- Added null safety checks in frontend components (`FacultyBookings.tsx`, `StudentBookings.tsx`)

**Result**: 
- ✓ Proper Mongoose relationship population
- ✓ Correct slot data retrieval in bookings
- ✓ Graceful UI fallback for missing data
- ✓ Full type safety with TypeScript

---

## Authentication Flow

### Login/Signup Flow
```
User Registration
    ↓
Validate input (name, email, password, role)
    ↓
Hash password with bcryptjs (salt rounds: 10)
    ↓
Save user to MongoDB
    ↓
Generate JWT token (exp: 30 days)
    ↓
Store token in localStorage
    ↓
Set AuthContext user state
    ↓
Redirect to appropriate dashboard
```

### Protected Route Flow
```
Request to protected endpoint
    ↓
Check localStorage for token
    ↓
Add "Bearer {token}" to Authorization header
    ↓
Backend verifies JWT signature
    ↓
Extract userId and role from token
    ↓
Check role-based permissions (facultyOnly/studentOnly middleware)
    ↓
Proceed if authorized, reject if not
```

---

## State Management

### AuthContext Structure
```typescript
User {
  id: string;
  name: string;
  email: string;
  role: 'faculty' | 'student';
  department?: string;
  isOnline: boolean;
  lastSeen: Date;
  bio?: string;
  qualifications?: string[];
  profilePhoto?: string;
}

AuthContextType {
  user: User | null;
  token: string | null;
  login: (token, user) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUser: (user) => void;
  setOnlineStatus: (status) => Promise<void>;
}
```

---

## Security Features

1. **Password Security**
   - bcryptjs hashing with 10 salt rounds
   - Never stored in plain text
   - Validated on login via comparePassword method

2. **JWT Authentication**
   - 30-day token expiration
   - Secure secret key in environment variables
   - Token verification on every protected request

3. **Role-Based Access Control (RBAC)**
   - Faculty-only routes protected with `facultyOnly` middleware
   - Student-only routes protected with `studentOnly` middleware
   - Unauthorized access returns 403 Forbidden

4. **CORS Protection**
   - CORS enabled for frontend origin
   - Prevents cross-origin attacks

5. **Input Validation**
   - Backend validates all required fields
   - Email validation and uniqueness checks
   - Type checking with TypeScript

6. **Data Privacy**
   - Profile endpoints exclude sensitive data (passwords)
   - Public endpoints only expose necessary information
   - Selective field projection in database queries

---

## Performance Considerations

1. **Database Indexing**
   - Indexes on `facultyId`, `studentId`, `slotId` in bookings
   - Index on `email` for faster lookups
   - Index on `startTime` for slot queries

2. **API Optimization**
   - Selective field projection (`.select()`)
   - Sorted queries by most recent first
   - Filtered queries to return only relevant data

3. **Frontend Optimization**
   - React hooks for state management
   - Lazy loading of components
   - Optimized re-renders with proper key props
   - Vite for fast build and HMR

4. **Caching**
   - localStorage for token persistence
   - Browser cache for static assets

---

## Error Handling

### Backend Error Handling
- Try-catch blocks on all async operations
- Validation error messages
- HTTP status codes (400, 401, 403, 404, 500)
- Detailed error logging to console

### Frontend Error Handling
- Form validation before submission
- Try-catch in API calls
- User-friendly error messages
- Error notifications/modals
- Graceful fallbacks for missing data

---

## Deployment Guide

### Frontend Deployment
```bash
# Build
npm run build

# Output folder: dist/
# Deploy to: Vercel, Netlify, or any static hosting
```

### Backend Deployment
```bash
# Deploy server files to:
# - Render
# - Railway
# - AWS EC2
# - Heroku
# - DigitalOcean

# Set environment variables:
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

---

## Challenges & Solutions

### Challenge 1: Null Slot Data in Bookings
**Issue**: Bookings were fetching from API but slot details were null
**Root Cause**: Schema using strings instead of ObjectId references
**Solution**: Updated models with proper ObjectId typing and auto-conversion setters

### Challenge 2: Booking Status Enum Migration
**Issue**: Old data had 'confirmed' status, new enum only had 'pending'
**Solution**: Updated enum to include pending, approved, rejected, cancelled

### Challenge 3: Database Connection Stability
**Issue**: MongoDB connection dropping intermittently
**Solution**: Verified MongoDB Atlas cluster and network access settings

---

## Future Enhancements

1. **WebSocket Integration**
   - Real-time booking notifications
   - Live availability updates
   - Chat messaging between faculty and students

2. **Advanced Filtering**
   - Filter slots by duration, location, time
   - Advanced faculty search with ratings
   - Booking history analysis

3. **Meeting Integration**
   - Zoom/Google Meet link generation
   - Calendar sync (Google Calendar, Outlook)
   - Automatic meeting reminders

4. **Analytics & Reports**
   - Faculty booking statistics
   - Student engagement metrics
   - Usage trends and reports

5. **Ratings & Reviews**
   - Faculty rating system
   - Student reviews after meetings
   - Average rating display

6. **Bulk Operations**
   - Bulk slot creation
   - Recurring slot scheduling
   - Batch booking management

7. **Mobile App**
   - React Native mobile version
   - Push notifications
   - Offline mode

---

## Testing & Quality Assurance

### Manual Testing
- Authentication flows (signup, login, logout)
- Slot creation, editing, deletion, cancellation
- Booking creation, approval, rejection, cancellation
- Profile editing and viewing
- Online/offline status toggling
- Public schedule sharing

### Areas for Automated Testing
- Unit tests for utility functions
- Integration tests for API endpoints
- Component tests with React Testing Library
- End-to-end tests with Cypress/Playwright

---

## Documentation & Resources

**Setup Instructions**: See `SETUP.md`  
**New Features**: See `NEW_FEATURES.md`  
**Availability Status**: See `AVAILABILITY_STATUS_FEATURE.md`  
**Environment**: See `.env` file

---

## Conclusion

SchedulSync is a fully functional appointment scheduling system designed for educational institutions. It provides a complete solution for faculty members to manage their availability and for students to book appointments efficiently. The system is built with modern technologies, includes robust error handling, security features, and is designed for easy deployment and future scaling.

**Current Status**: Production-Ready with room for enhancements
**Lines of Code**: ~2000+ (Frontend) + ~1500+ (Backend)
**Database Records**: Supports unlimited users, slots, and bookings
**Scalability**: MongoDB Atlas provides automatic scaling

---

## Author Notes

This project demonstrates:
- Full-stack web development with modern tech stack
- Database design and relationships
- RESTful API architecture
- Authentication and authorization
- State management in React
- TypeScript for type safety
- Error handling and validation
- UI/UX design with Tailwind CSS
- Real-time status tracking
- Professional code organization

**Perfect for**: Learning full-stack development, educational institution needs, or as a starting point for more complex scheduling systems.

---

**Last Updated**: December 7, 2025  
**Version**: 2.0 (With Booking Management & Profile Settings)  
**Status**: Active Development

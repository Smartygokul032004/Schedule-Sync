# Availability Status Feature - Implementation Summary

## Overview
Added a real-time availability status feature that displays whether faculty members are online/offline in the SchedulSync application.

## Backend Changes

### 1. User Model (`server/models/User.ts`)
- Added `isOnline: boolean` field (default: false)
- Added `lastSeen: Date` field to track last activity

### 2. Authentication Routes (`server/routes/auth.ts`)
- Added `POST /auth/status/online` - Sets faculty member as online
- Added `POST /auth/status/offline` - Sets faculty member as offline
- Both endpoints require authentication and update the user's status

## Frontend Changes

### 1. AuthContext (`src/context/AuthContext.tsx`)
- Updated User interface to include `isOnline` and `lastSeen` fields
- Added `setOnlineStatus()` function to update user availability
- Automatically sets faculty member as online on login
- Automatically sets faculty member as offline on logout
- Uses `beforeunload` event to set offline status when closing the browser

### 2. New Components

#### OnlineStatusBadge (`src/components/OnlineStatusBadge.tsx`)
- Reusable component to display online/offline status
- Shows animated green pulse when online
- Shows last seen time when offline
- Supports three sizes: sm, md, lg
- Formats last seen time intelligently (Just now, Xm ago, Xh ago, Xd ago)

#### FacultyCard (`src/components/FacultyCard.tsx`)
- Card component to display faculty information
- Integrated with OnlineStatusBadge to show availability
- Displays name, email, department
- Button to view available slots

### 3. Faculty Dashboard (`src/pages/FacultyDashboard.tsx`)
- Added online/offline toggle button in navbar
- Shows current availability status with OnlineStatusBadge
- Toggle button shows "Go Online" or "Go Offline" based on current status
- Disables button while updating status
- Uses Wifi/WifiOff icons to indicate status

## Features

1. **Real-time Status Updates**: Faculty can toggle their availability with a single click
2. **Automatic Status Management**: Automatically sets status on login/logout
3. **Last Seen Tracking**: Shows when a faculty member was last online
4. **Visual Indicators**: 
   - Green pulsing dot for online
   - Gray dot for offline
   - "Last seen X minutes ago" for offline faculty
5. **Student-facing Info**: Students can see faculty availability when browsing

## API Endpoints

### POST /auth/status/online
- Sets the authenticated user as online
- Updates lastSeen timestamp
- Returns: `{ isOnline: true, lastSeen: Date }`

### POST /auth/status/offline
- Sets the authenticated user as offline
- Updates lastSeen timestamp
- Returns: `{ isOnline: false, lastSeen: Date }`

## Usage

### For Faculty
1. Log in to the dashboard
2. Use the "Go Online" / "Go Offline" button in the top navbar
3. Status is automatically updated when they log out or close the browser

### For Students
1. When browsing faculty members, their online status is displayed
2. Can see "Last seen X minutes ago" for offline faculty
3. Green indicator means the faculty is currently available

## Database Migration Required
If you have existing users, run:
```javascript
db.users.updateMany({}, { $set: { isOnline: false, lastSeen: new Date() } })
```

## Future Enhancements
- Add WebSocket support for real-time status updates across all clients
- Implement automatic offline timeout (e.g., after 30 minutes of inactivity)
- Add presence indicator in booking details
- Notify students when booked faculty comes online

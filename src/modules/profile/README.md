# Family Management Module

## Overview
The Family Management module provides a complete family house system with role-based permissions, invitation system, and member management capabilities.

## Features

### 🏠 Family Houses
- Create new family houses with unique names
- Join existing houses using invitation codes
- Each house has one Admin and optional Sub-Admin(s)
- Members have different roles with specific permissions

### 👥 Roles & Permissions

#### 👑 Admin
- **Full Control**: Manage entire house
- **Invite Members**: Generate invitation codes
- **Remove Members**: Remove any member (except themselves)
- **Transfer Admin**: Can transfer admin rights to Sub-Admin
- **Manage Everything**: Tasks, penalties, calendar, settings

#### 👨‍💼 Sub-Admin
- **Invite Members**: Generate invitation codes
- **Remove Non-Admins**: Can remove members except Admin
- **Assign Tasks**: Manage task assignments
- **Penalty Management**: Assign penalties
- **Calendar**: Create and manage events

#### 👧🧑 Child
- **View Only**: See family members and activities
- **Complete Tasks**: Mark tasks as completed
- **View Penalties**: See assigned penalties
- **Edit Profile**: Modify their own profile

### 🔑 Invitation System
- **Unique Codes**: 8-character random codes
- **7-Day Expiry**: Codes expire after one week
- **One-Time Use**: Each code can only be used once
- **Admin/Sub-Admin Only**: Only admins can generate codes

## Usage Guide

### 🌟 Creating a New House
1. Go to **Profile Tab** → **Join/Create House**
2. Fill in your information (name, email, age, avatar)
3. Select "Parent/Guardian" role
4. Tap **"Create New House"**
5. Confirm creation
6. You become the Administrator automatically

### 🏠 Joining Existing House
1. Get invitation code from family member
2. Go to **Profile Tab** → **Join/Create House**
3. Enter the invitation code
4. Fill in your information
5. Select your role (Child/Parent)
6. Tap **"Join House"**

### 👨‍👩‍👧‍👦 Managing Family Members
1. Go to **Profile Tab** → **Manage Family**
2. **As Admin/Sub-Admin**:
   - See all active and inactive members
   - Generate invitation codes
   - Remove members
   - Transfer admin rights (Admin only)
3. **As Child**: View family members only

### ✏️ Editing Profile
1. Go to **Profile Tab** → **Edit Profile**
2. **Editable Fields**:
   - Avatar (15 options)
   - Name
   - Email
   - Age
3. **View Only**:
   - Role and permissions
   - Family house information
   - User code

## Technical Details

### 🏗️ Architecture
- **State Management**: Zustand with AsyncStorage persistence
- **TypeScript**: Fully typed interfaces and functions
- **Navigation**: React Navigation stack integration
- **UI Components**: Modern cards with gradient styling

### 📱 Screens
- `HomeManagementScreen`: Main family management interface
- `JoinHouseScreen`: Join/create house functionality
- `EditableProfileScreen`: Profile editing interface

### 🔧 Components
- `MemberCard`: Professional member display with role indicators

### 💾 Data Storage
- **Persistent**: All data saved with AsyncStorage
- **Offline Ready**: Works without internet connection
- **Real-time**: State updates immediately in UI

## Permissions Matrix

| Action | Admin | Sub-Admin | Child |
|--------|-------|-----------|-------|
| Create House | ✅ | ✅ | ❌ |
| Invite Members | ✅ | ✅ | ❌ |
| Remove Members | ✅ | ✅ (except Admin) | ❌ |
| Transfer Admin | ✅ | ❌ | ❌ |
| Assign Tasks | ✅ | ✅ | ❌ |
| Create Penalties | ✅ | ✅ | ❌ |
| Edit Own Profile | ✅ | ✅ | ✅ |
| View Family List | ✅ | ✅ | ✅ |

## Mock Data
The module includes realistic mock data for testing:
- Pre-configured family house "Casa de los Ruiz"
- Admin (María), Sub-Admin (Carlos), Children (Ana, Diego)
- Sample invitation codes and member data

## Future Enhancements
- QR code generation for invitations
- Push notifications for invitation codes
- Family statistics and insights
- Member activity history
- Advanced permission customization

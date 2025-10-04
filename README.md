# FamilyDash 📱👨‍👩‍👧‍👦

A family-friendly dashboard app to manage **tasks, penalties, goals, activities, and a safe emotional space** for children and parents.  
Built with **React Native + Expo** and **TypeScript**.

---

## 🌟 Features

### ✅ **Task Management**
- Family task distribution and tracking
- Individual member responsibilities
- Progress monitoring and completion rewards
- Task categories and difficulty levels

### 🚫 **Penalties System**
- Interactive penalty timers with pause/resume
- Reflection prompts for learning and growth
- Parent controls for time adjustments
- Family accountability tracking

### 🎯 **Goals & Progress**
- Personal and family goal setting
- Milestone tracking and celebrations
- Progress visualization with charts
- Reward system integration

### 🎉 **Activities Calendar**
- Family event planning and scheduling
- Voting system for activity decisions
- Activity history and participation tracking
- Reminder notifications

### 💖 **Safe Room**
- Emotional expression space (text, audio, video)
- Family reflections and support messages
- Guided help resources
- Solution board for family agreements

### ⚙️ **Device Tools**
- Family device management
- Emergency tools and panic alerts
- Notification settings and quiet hours
- Android widgets simulation
- App settings and parental controls

### 📊 **Notifications**
- Smart notification filtering
- Priority-based alerts
- Read/unread status tracking
- Action-based navigation

---

## 📸 Screenshots

### Dashboard Overview
![Dashboard](./docs/screenshots/dashboard.png)

### Task Management
![Task Management](./docs/screenshots/tasks.png)

### Penalties System
![Penalties](./docs/screenshots/penalties.png)

### Calendar & Activities
![Calendar](./docs/screenshots/calendar.png)

### Safe Room
![Safe Room](./docs/screenshots/safe-room.png)

### Device Tools
![Device Tools](./docs/screenshots/device-tools.png)

---

## 🏗️ Tech Stack

- **Framework**: React Native + Expo
- **Language**: TypeScript
- **State Management**: Zustand
- **Navigation**: React Navigation (Bottom Tabs + Stack)
- **UI Components**: 
  - LinearGradient for beautiful gradients
  - Ionicons for consistent iconography
  - Animated API for smooth animations
- **Future Backend**: Firebase (Authentication, Firestore, Storage, Cloud Messaging)
- **Development**: Hot reload, TypeScript support, Expo Dev Tools

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Victordaz07/FamilyDash.git
   cd FamilyDash
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on device/emulator**
   - Scan QR code with Expo Go app (mobile)
   - Press `a` for Android emulator
   - Press `i` for iOS simulator

---

## 📱 Project Structure

```
FamilyDash/
├── src/
│   ├── components/          # Reusable UI components
│   ├── modules/            # Feature modules
│   │   ├── tasks/          # Task management
│   │   ├── penalties/      # Penalties system
│   │   ├── calendar/       # Calendar & activities
│   │   ├── goals/          # Goals & progress
│   │   ├── safeRoom/       # Safe emotional space
│   │   ├── deviceTools/    # Device management
│   │   └── notifications/  # Notification system
│   ├── navigation/         # Navigation configuration
│   ├── services/           # Firebase & API services
│   ├── state/              # Zustand store
│   └── utils/              # Helper functions
├── docs/                   # Documentation
├── assets/                 # Images and static files
└── android/               # Android-specific files
```

---

## 🎨 Design System

### Color Palette
- **Primary Purple**: `#8B5CF6` - Main brand color
- **Success Green**: `#10B981` - Completed tasks, positive actions
- **Warning Orange**: `#F59E0B` - Pending items, warnings
- **Error Red**: `#EF4444` - Penalties, urgent alerts
- **Info Blue**: `#3B82F6` - Information, secondary actions
- **Neutral Gray**: `#6B7280` - Text, disabled states

### Typography
- **Headers**: Bold, 18-24px
- **Body**: Regular, 14-16px
- **Captions**: Light, 12-14px

### Animations
- **Entrance**: Fade + Slide + Scale (800ms)
- **Cards**: Staggered animation (300ms delay)
- **Pulse**: Continuous pulse for important elements
- **Transitions**: Smooth navigation between screens

---

## 🔧 Development

### Available Scripts
```bash
npm start          # Start Expo development server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on web
npm run build      # Build for production
```

### Code Style
- TypeScript strict mode enabled
- ESLint configuration
- Prettier formatting
- Component-based architecture
- Custom hooks for business logic

---

## 🚀 Roadmap

### ✅ Completed Features
- [x] Complete UI/UX implementation
- [x] Navigation system with bottom tabs
- [x] Task management module
- [x] Penalties system with timers
- [x] Calendar and activities planning
- [x] Goals tracking system
- [x] Safe Room emotional space
- [x] Device Tools management
- [x] Notifications system
- [x] Advanced animations and interactions

### 🔄 In Progress
- [ ] Firebase integration
- [ ] Real-time data synchronization
- [ ] Push notifications
- [ ] User authentication

### 📋 Planned Features
- [ ] Android home screen widgets
- [ ] Offline mode support
- [ ] Data export/import
- [ ] Multi-language support
- [ ] Parental controls
- [ ] Family analytics dashboard
- [ ] Integration with smart home devices

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all animations are smooth and performant

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍👩‍👧 About FamilyDash

FamilyDash is designed to **help families with kids (8–17 y/o)** manage responsibilities, communicate openly, and grow together in a safe environment.  

### Our Mission
To create a digital space where families can:
- **Organize** daily responsibilities and tasks
- **Communicate** openly about feelings and challenges  
- **Learn** from mistakes through reflection
- **Celebrate** achievements and milestones
- **Grow** together as a family unit

### Target Audience
- **Parents** looking for family management tools
- **Children** (8-17 years) learning responsibility
- **Families** wanting to improve communication
- **Educators** interested in family dynamics

---

## 👨‍💻 Author

**Víctor Ruiz** - [@Victordaz07](https://github.com/Victordaz07)

This project started as a **portfolio project** showcasing modern React Native development with advanced UI/UX design patterns.

---

## 🙏 Acknowledgments

- **Expo Team** for the amazing development platform
- **React Native Community** for continuous improvements
- **UX Pilot** for design inspiration and mockups
- **Family Development Experts** for behavioral insights

---

## 📞 Support

If you have any questions or need help:

- 📧 Email: [lighthousestudiolabs@gmail.com]
- 🐛 Issues: [GitHub Issues](https://github.com/Victordaz07/FamilyDash/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/Victordaz07/FamilyDash/discussions)

---

**Made with ❤️ for families everywhere**

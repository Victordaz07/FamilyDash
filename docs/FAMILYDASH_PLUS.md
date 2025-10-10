# FamilyDash+ - Premium Family Safety Features

## Overview

FamilyDash+ is a premium subscription service that provides advanced family safety features for FamilyDash users. It includes three main capabilities designed to help families stay connected and safe during emergencies.

## Features

### 1. Emergency Ping

- **Purpose**: Send urgent alerts to family members
- **Functionality**:
  - Sends high-priority notifications that override silent mode
  - Shows full-screen alert requiring acknowledgment
  - Includes sender information and timestamp
  - Designed for genuine emergencies only

### 2. Live Audio SOS

- **Purpose**: Real-time voice calls for emergencies
- **Functionality**:
  - Initiates live audio calls with family members
  - Requires explicit acceptance from recipient
  - Shows persistent notification during active call
  - Automatically ends after 5 minutes for privacy
  - No audio recording unless explicitly consented

### 3. Location Sharing

- **Purpose**: Share location in real-time
- **Functionality**:
  - Updates location every 5 minutes when active
  - Shows persistent notification while sharing
  - Supports geofencing for home/school locations
  - Data retained for 24-72 hours maximum

## Privacy & Consent Principles

### Core Principles

- **Explicit Consent**: Each feature requires explicit user consent
- **Visible Indicators**: Clear indicators when features are active
- **No Hidden Activity**: No silent or hidden operations
- **Minimal Data**: Short retention periods (24-72 hours)
- **Transparency**: Clear explanations of how features work

### User Roles

- **Parent/Tutor**: Can configure and use all features
- **Child**: Can receive notifications but requires parent consent for activation

### Legal Compliance

- COPPA compliance for minors
- GDPR/CCPA compliance for data protection
- Apple/Google store policy compliance
- Anti-stalkerware policies

## Technical Implementation

### Feature Flags System

```typescript
export type FeatureFlags = {
  emergencyPing: boolean;
  liveAudioSOS: boolean;
  locationSharing: boolean;
};

export type FamilyPlan = "free" | "plus";
```

### Firestore Schema

#### Collections

- `families/{familyId}` - Family information with plan
- `feature_flags/{familyId}` - Feature availability flags
- `family_members/{familyId}/users/{uid}` - User consent settings
- `emergency_logs/{id}` - Emergency ping logs
- `calls/{callId}` - Live audio SOS call data
- `locations/{uid}` - Current location data
- `location_history/{uid}/{doc}` - Location history (24-72h)

#### Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isMember(fid) {
      return request.auth != null &&
        exists(/databases/$(database)/documents/family_members/$(fid)/users/$(request.auth.uid));
    }

    function isPlus(fid) {
      return get(/databases/$(database)/documents/families/$(fid)).data.plan == "plus";
    }

    match /feature_flags/{fid} {
      allow read: if isMember(fid);
      allow write: if isMember(fid) &&
        get(/databases/$(database)/documents/family_members/$(fid)/users/$(request.auth.uid)).data.role == "parent";
    }

    match /emergency_logs/{id} {
      allow create, read: if isMember(request.resource.data.familyId);
    }

    match /calls/{id} {
      allow read, write: if isMember(request.resource.data.familyId);
    }

    match /locations/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

## User Interface

### Settings › Safety Screen

- Feature toggles with consent management
- Learn More modals with detailed explanations
- Upgrade prompts for free users
- Privacy policy and terms links

### Feature Gates

```typescript
<FeatureGate flag="emergencyPing" familyId={familyId}>
  <EmergencyPingButton />
</FeatureGate>
```

### Consent Modals

- Detailed feature explanations
- Legal notices and privacy information
- Clear accept/decline options
- Links to full privacy policy

## Integration with Existing Voice Module

The Live Audio SOS feature integrates with the existing voice module:

### Shared Components

- Uses `VoiceComposer` for SOS call initiation
- Uses `VoiceMessageCard` for call status display
- Leverages `useAudioPlayer` for real-time audio

### Extensions

- Real-time streaming instead of recording
- WebRTC integration for live audio
- Call state management (requested/accepted/ended)
- Automatic timeout and cleanup

## Development Phases

### Phase 0: Base (Current)

- ✅ Feature flags system
- ✅ Settings › Safety screen
- ✅ Consent management
- ✅ Firestore schema and rules
- ✅ Upgrade banners and gates

### Phase 1: Emergency Ping (Next)

- Cloud Function for ping delivery
- Android fullScreenIntent implementation
- iOS push notification handling
- Rate limiting and logging

### Phase 2: Live Audio SOS

- WebRTC integration
- Real-time audio streaming
- Call state management
- Persistent notifications

### Phase 3: Location Sharing

- Background location updates
- Geofencing support
- Map visualization
- Data retention management

## Security Considerations

### Data Protection

- End-to-end encryption for sensitive data
- Automatic data deletion after retention period
- Secure token management
- Audit logging for all operations

### User Safety

- Rate limiting to prevent abuse
- Clear consent revocation options
- Emergency override capabilities
- Family member verification

### Platform Compliance

- App Store review guidelines
- Google Play policy compliance
- Regional privacy law adherence
- Accessibility requirements

## Testing & QA

### Test Scenarios

- Feature flag functionality
- Consent flow validation
- Privacy compliance verification
- Cross-platform compatibility
- Battery and performance impact

### Device Testing

- iOS silent mode behavior
- Android Do Not Disturb settings
- Background app restrictions
- Network connectivity edge cases

## Future Enhancements

### Potential Features

- Emergency contacts integration
- Medical information sharing
- School/work location geofencing
- Integration with smart home devices
- Advanced analytics and insights

### Technical Improvements

- Offline capability for critical features
- Multi-language support
- Accessibility enhancements
- Performance optimizations

## Support & Documentation

### User Support

- In-app help and tutorials
- FAQ for common questions
- Contact support for issues
- Feature request process

### Developer Resources

- API documentation
- Integration examples
- Testing guidelines
- Deployment procedures

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Status**: Phase 0 Complete

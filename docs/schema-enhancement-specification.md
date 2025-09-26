# Schema Enhancement Specification

## Overview

This document specifies the comprehensive schema enhancements needed for SocialDog based on analysis of production field requirements. The goal is to extract valuable field structures from the existing production database while implementing them with clean, modern Next.js architecture.

## Problem Statement

Our current TypeScript schema is too basic for a production dog social platform. Analysis of the existing production database reveals essential fields that real dog owners need, which are missing from our current implementation.

## Priority Level: **HIGH**

This enhancement significantly improves core matching functionality and adds valuable features that production users actively rely on.

## Dependencies

- Current basic schema implementation ✅ Complete
- TDD testing framework ✅ Complete
- Component architecture ✅ Complete

## Success Criteria

- [ ] Health records tracking implemented with full CRUD operations
- [ ] Advanced dog matching with behavioral compatibility
- [ ] Social features (friends, notifications) functional
- [ ] All new features covered by unit and integration tests
- [ ] 85%+ test coverage maintained
- [ ] Production-ready database migration plan documented

## Production Field Analysis

### Current Schema Gaps

#### 1. **Health Records System** - CRITICAL MISSING
**User Need**: Dog owners need to track vaccinations, treatments, and health schedules.
**Production Evidence**: Separate tables for `vaccinations`, `wormingTreatments`, `fleaTreatments` with date tracking.

**Required Fields**:
```typescript
Vaccination {
  dogId: string
  name: string          // Vaccine name
  date: string          // YYYY-MM-DD
  frequency: 'monthly' | 'annually' | 'every_2_years'
  clinic?: string       // Optional clinic name
  nextDueDate: string   // Calculated field
}

WormingTreatment {
  dogId: string
  name: string          // Treatment brand/name
  date: string          // YYYY-MM-DD
  frequency: 'monthly' | 'every_2_months' | 'every_3_months' | 'every_6_months' | 'annually'
  nextDueDate: string   // Calculated field
}

FleaTreatment {
  dogId: string
  name: string          // Treatment brand/name
  date: string          // YYYY-MM-DD
  frequency: 'monthly' | 'every_2_months' | 'every_3_months' | 'every_6_months' | 'annually'
  nextDueDate: string   // Calculated field
}
```

#### 2. **Advanced Dog Matching** - INSUFFICIENT DETAIL
**User Need**: Better dog compatibility matching beyond basic temperament.
**Production Evidence**: Multiple compatibility and behavioral fields in use.

**Required Fields**:
```typescript
Dog {
  // Current basic fields...
  energyLevel: 'low' | 'medium' | 'high'
  trainingLevel: 'basic' | 'intermediate' | 'advanced' | 'professional'
  socialization: 'excellent' | 'good' | 'needs_work'

  // Compatibility flags
  goodWithKids: boolean
  goodWithDogs: boolean
  goodWithCats: boolean

  // Detailed behavior
  interactionStyles: string[]  // ['fetch', 'tug-of-war', 'wrestling', 'chase']

  // Precise age tracking
  dateOfBirth: string         // YYYY-MM-DD for accurate age vs approximate

  // Health status
  vaccinated: boolean
  neutered: boolean
  puppyNotVaccinated: boolean // Special case for young puppies
}
```

#### 3. **Social Features** - COMPLETELY MISSING
**User Need**: Users need to connect, send friend requests, block problematic users.
**Production Evidence**: Active usage of friends, notifications, blocking systems.

**Required Fields**:
```typescript
Friendship {
  id: string
  userId: string
  friendUserId: string
  contextDogId?: string       // Which dog initiated the friendship
  status: 'pending' | 'accepted' | 'declined'
  createdAt: string
}

Notification {
  id: string
  userId: string
  type: 'friend_request' | 'friend_accepted' | 'match_request' | 'message'
  title: string
  message: string
  relatedUserId?: string
  relatedDogId?: string
  isRead: boolean
  createdAt: string
}

BlockedUser {
  id: string
  userId: string
  blockedUserId: string
  createdAt: string
}

ReportedUser {
  id: string
  reporterId: string
  reportedUserId: string
  reason: string
  status: 'pending' | 'reviewed' | 'resolved'
  adminNotes?: string
  createdAt: string
  reviewedAt?: string
}
```

#### 4. **Enhanced User Profiles** - MISSING KEY FIELDS
**User Need**: Better user profiles with proper authentication and profile management.
**Production Evidence**: Comprehensive user table with multiple auth options and location tracking.

**Required Fields**:
```typescript
Profile {
  // Current fields...
  city: string                // Separate from general location
  age?: number               // Optional user age
  authProvider: 'email' | 'google'
  emailVerified: boolean
  profileImageUrl?: string   // Consistent naming
}

PasswordResetToken {
  id: string
  userId: string
  token: string
  expiresAt: string
  used: boolean
  createdAt: string
}
```

#### 5. **Location Precision** - RESOLVED WITH NOMINATIM INTEGRATION
**User Need**: Accurate location-based matching and distance calculations.
**Production Evidence**: Latitude/longitude fields for precise location matching.
**Implementation Decision**: Nominatim (OpenStreetMap) API for comprehensive NZ address coverage.

**Required Fields**:
```typescript
Dog {
  // Enhanced location storage
  location: {
    lat: number              // Precise coordinates from Nominatim
    lng: number              // Precise coordinates from Nominatim
  }
  locationDisplay?: string   // User-friendly display name
}

Profile {
  // Enhanced location storage
  latitude?: number          // Precise coordinates from address selection
  longitude?: number         // Precise coordinates from address selection
  city: string              // Structured city data
  locationDisplay?: string   // Full address display name
}
```

**Location System Implementation**:
- **Nominatim API Integration**: Free OpenStreetMap-based address autocomplete
- **Complete NZ Coverage**: Every street address, suburb, city in New Zealand
- **Real-time Autocomplete**: Users type address → instant suggestions → precise coordinates
- **Cost**: $0 (Free tier with reasonable rate limits)
- **Distance Matching**: Accurate "dogs within X km" functionality using Haversine formula

## Implementation Priority Matrix

### **CRITICAL Priority** 🔥
*Blocks core functionality or user onboarding*

1. **Advanced Dog Matching Fields** - Core matching is too basic without behavioral compatibility
2. **Health Records System** - Dog owners consistently need vaccination/treatment tracking

### **HIGH Priority** ⚡
*Significantly improves user experience or core features*

3. **Enhanced User Authentication** - Password reset, email verification essential for production
4. **Location Precision** - Accurate matching requires coordinates, not just city names

### **MEDIUM Priority** 📈
*Enhances engagement or adds valuable features*

5. **Social Features (Friends)** - Increases user engagement and retention
6. **Notification System** - Improves user communication and platform stickiness

### **LOW Priority** ✨
*Optimizations or nice-to-have improvements*

7. **User Blocking/Reporting** - Important for safety but not immediate MVP need
8. **Admin Features** - Can be basic until user base scales

## Implementation Plan

### Phase 1: CRITICAL - Advanced Matching (Week 1)
**Why First**: Core dog matching is fundamental to the platform value
**Implementation**:
1. Expand Dog interface with behavioral fields
2. Update dog profile forms with new fields
3. Enhance matching algorithm with compatibility
4. Add advanced search filters

### Phase 2: CRITICAL - Health Records (Week 2)
**Why Next**: Dog owners consistently track health, high user value
**Implementation**:
1. Add health record types to `src/types/index.ts`
2. Create health management forms
3. Add health tracking to dog profiles
4. Build reminder system for due treatments

### Phase 3: HIGH - Enhanced Auth (Week 3)
**Why Important**: Production requires password reset, email verification
**Implementation**:
1. Add password reset flow
2. Build email verification
3. Add Google OAuth (optional)
4. Improve profile management

### Phase 4: HIGH - Location System Integration (Week 4)
**Why Valuable**: Accurate location-based matching with comprehensive NZ coverage
**Implementation**:
1. Integrate Nominatim API for address autocomplete
2. Build location search component with NZ focus
3. Add distance-based search using Haversine formula
4. Implement "dogs within X km" filtering functionality
5. Store both display names and precise coordinates

### Phase 5: MEDIUM - Social Features (Week 5)
**Why Later**: Engagement features, not core functionality
**Implementation**:
1. Build friends system
2. Add notification system
3. Create social interaction UI
4. Basic blocking/reporting

## Testing Requirements

### Unit Tests Needed
- [ ] Health record CRUD operations
- [ ] Advanced matching algorithm
- [ ] Friends system state management
- [ ] Notification system
- [ ] Location-based calculations

### Integration Tests Needed
- [ ] Health record form submissions
- [ ] Dog matching with expanded criteria
- [ ] Friend request workflows
- [ ] Password reset flow
- [ ] Location-based search

### E2E Tests Needed
- [ ] Complete health tracking user journey
- [ ] Advanced dog matching and connection flow
- [ ] Social features (friend requests, blocking)
- [ ] Password reset user journey

## Database Migration Considerations

### New Tables Required
- `vaccinations`
- `worming_treatments`
- `flea_treatments`
- `friendships`
- `notifications`
- `blocked_users`
- `reported_users`
- `password_reset_tokens`

### Existing Table Extensions
- `profiles` - Add city, age, coordinates, auth fields
- `dogs` - Add behavioral, health, compatibility, coordinate fields
- `messages` - Add contextDogId, deletion tracking

## Technical Debt Assessment

### Temporary Implementations
- Health reminders will start with client-side calculations
- Admin features will be basic until usage scales

### Resolved Technical Debt
- ✅ **Location Precision**: Resolved with Nominatim API integration
- ✅ **Address Autocomplete**: Free OpenStreetMap-based solution implemented
- ✅ **NZ Coverage**: Complete address database via Nominatim

### Future Enhancements
- Automated health reminder emails
- Advanced admin dashboard
- Health record photo uploads
- Integration with vet systems
- Enhanced location features (saved addresses, location history)

## Success Metrics

### Health Records
- % of users who add vaccination records
- % of users who set up treatment schedules
- User retention correlation with health tracking usage

### Advanced Matching
- Improved match success rates with behavioral compatibility
- Reduction in declined matches
- User satisfaction with match quality

### Social Features
- Friend request acceptance rates
- User engagement with notification system
- Report resolution times

## Documentation Updates Required

- [ ] Update MVP definition with new essential fields
- [ ] Add health records to user documentation
- [ ] Document advanced matching criteria
- [ ] Create social features user guide
- [ ] Update API documentation for new endpoints

## Implementation Timeline

**Week 1**: Advanced Dog Matching (CRITICAL)
**Week 2**: Health Records System (CRITICAL)
**Week 3**: Enhanced Authentication (HIGH)
**Week 4**: Location Precision (HIGH)
**Week 5**: Social Features (MEDIUM)
**Week 6**: Testing, Documentation & Production Migration

## Next Actions

Based on the priority matrix, the immediate next steps are:

1. **Update TypeScript Types** - Add advanced dog matching fields to `src/types/index.ts`
2. **Expand Dog Profile Form** - Add behavioral compatibility fields
3. **Enhance Matching Algorithm** - Implement compatibility-based matching
4. **Add Advanced Filters** - Let users filter by energy level, training, etc.
5. **Write Tests** - Unit tests for all new matching functionality

---

*This specification follows the principle of extracting valuable field requirements from production usage while implementing with clean, modern architecture patterns.*
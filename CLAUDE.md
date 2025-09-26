# SocialDog Development Guide

## Quick Start Commands

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server

# Testing (TDD Workflow)
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once
npm run test:coverage # Run tests with coverage report
npm run test:ui      # Run tests with Vitest UI

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check

# E2E Testing
npm run test:e2e     # Run Playwright E2E tests
npm run test:e2e:ui  # Run E2E tests with UI
```

## Tech Stack & Architecture

- **Framework**: Next.js 15 (App Router, React 19)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Testing**: Vitest 3.x + React Testing Library + Playwright
- **Deployment**: Vercel
- **Development**: Turbopack for 10x faster builds

## TDD Workflow

1. **Red**: Write failing test first
2. **Green**: Write minimal code to pass
3. **Refactor**: Improve code while keeping tests green
4. **Commit**: Regular commits with descriptive messages

## Technical Debt Tracking

**Please keep track of what is being mocked/stubbed/TODO etc following best practices:**

### Current Mocks & Stubs
- **Supabase Client**: Mocked in all tests (`vi.mock('@/lib/supabase/client')`)
- **Next.js Router**: Mocked in test setup (`src/test/setup.ts`)
- **Mock Data**: Using static mock profiles and dogs for development

### TODO Items & Technical Debt

#### Critical Website Structure (Priority 1)
- [ ] **URGENT**: Replace Next.js default homepage with SocialDog landing page
- [ ] **URGENT**: Add consistent navigation header across all pages
- [ ] **URGENT**: Create Terms of Service page (copy from https://www.socialdog.co.nz/terms)
- [ ] **URGENT**: Create Privacy Policy page (copy from existing site)
- [ ] **CRITICAL**: Implement mobile-first responsive design for all pages

#### Database & Authentication (Priority 2)
- [ ] Replace mock Supabase data with real database connections
- [ ] Set up Supabase database tables and migrations
- [ ] Implement real authentication flow (currently mocked)
- [ ] Add email verification for user registration
- [ ] Implement password reset functionality

#### Feature Enhancements (Priority 3)
- [ ] Add real photo upload functionality (currently mocked file uploads)
- [ ] Implement geolocation-based search
- [ ] Add real-time messaging with Supabase Realtime
- [ ] Set up proper error logging and monitoring
- [ ] Configure production environment variables

### Temporary Implementations
- **Mock Profile Data**: `src/app/dashboard/page.tsx` uses hardcoded mock data
- **File Uploads**: Currently returns placeholder URLs
- **Geolocation**: Using string addresses instead of coordinates
- **Authentication**: Using mocked auth state

### Performance Optimizations Needed
- [ ] Implement image lazy loading and optimization
- [ ] Add caching for dog profile listings
- [ ] Implement virtual scrolling for large lists
- [ ] Add database query optimization
- [ ] Set up CDN for static assets

### Security TODOs
- [ ] Implement Row Level Security (RLS) policies in Supabase
- [ ] Add input sanitization and validation
- [ ] Configure CSRF protection
- [ ] Set up API rate limiting
- [ ] Add content security policies

## Development Standards

- **Test Coverage**: Maintain 85% minimum coverage
- **Code Quality**: All PRs must pass ESLint and TypeScript checks
- **Testing**: All features must be built using TDD
- **Commits**: Use conventional commit format
- **Documentation**: Update this file when adding new mocks or TODOs
- **Specifications Required**: **ALL features must have associated specifications/tasks before implementation**

## External API Integration Standards

### **Approved APIs**
- **Nominatim (OpenStreetMap)**: Address autocomplete and geocoding for NZ
  - **Endpoint**: `https://nominatim.openstreetmap.org/search`
  - **Cost**: Free with reasonable rate limits (1 req/sec)
  - **Coverage**: Complete New Zealand address database
  - **Use Case**: Location autocomplete, address validation, coordinate lookup

### **API Selection Criteria**
1. **Cost-Conscious First**: Always evaluate free alternatives before paid APIs
2. **Coverage Requirements**: Must provide comprehensive NZ data coverage
3. **Rate Limits**: Must meet our usage patterns (startup-friendly)
4. **Reliability**: Proven track record with good uptime
5. **Documentation**: Well-documented with TypeScript support preferred

### **Implementation Standards**
- **Error Handling**: All API calls must include proper error boundaries
- **Rate Limiting**: Respect API rate limits with appropriate throttling
- **Fallback Strategies**: Plan for API failures or rate limit exceeded scenarios
- **Caching**: Cache responses when appropriate to reduce API calls
- **Environment Variables**: Store API keys securely, never commit to repository

## Feature Development Requirements

### **CRITICAL: Specification-First Development**
Every feature, enhancement, or change must have:

1. **Written Specification** - Document what the feature does and why it's needed
2. **Associated Tasks** - Break down implementation into trackable tasks
3. **Test Requirements** - Define what tests are needed (unit, integration, E2E)
4. **Documentation Updates** - Identify docs that need updating
5. **Technical Debt Assessment** - Note any shortcuts or future improvements needed

### **No Code Without Specs**
- ❌ **Never start coding** without a clear specification
- ❌ **Never merge features** without associated documentation
- ✅ **Always document** the problem being solved
- ✅ **Always create tasks** to track progress
- ✅ **Always update documentation** when features are complete

### **Specification Management Process**

#### **Before Starting Any Work:**
1. **Check for existing specs** in `/docs/` directory
   - Look for: `[feature-name]-specification.md`
   - Example: `schema-enhancement-specification.md`
2. **If spec exists**: Update it with new requirements
3. **If no spec exists**: Create one following the specification template
4. **Always prioritize** work based on specification priorities

#### **Specification Naming Convention:**
- **Feature Specs**: `[feature-name]-specification.md`
- **Enhancement Specs**: `[area]-enhancement-specification.md`
- **Bug Fix Specs**: `[issue]-investigation-specification.md`
- **Integration Specs**: `[system]-integration-specification.md`

#### **Work Prioritization System:**
Every specification must include a **Priority Matrix**:
- **CRITICAL**: Blocks core functionality or user onboarding
- **HIGH**: Significantly improves user experience or core features
- **MEDIUM**: Enhances engagement or adds valuable features
- **LOW**: Optimizations or nice-to-have improvements

#### **Agent Decision Framework:**
When unsure what to work on next:
1. **Check current todo list** for in-progress tasks
2. **Review specification priority matrix** for next highest priority
3. **Look for CRITICAL or HIGH priority incomplete tasks**
4. **Always complete current task before starting new ones**
5. **Update todo list** with any newly discovered tasks from specs

#### **Required Spec Sections:**
- **Problem Statement** - What problem are we solving?
- **Requirements** - What exactly needs to be built?
- **Priority Level** - CRITICAL/HIGH/MEDIUM/LOW
- **Implementation Plan** - Step-by-step approach
- **Testing Requirements** - What tests are needed?
- **Dependencies** - What must be done first?
- **Success Criteria** - How do we know it's complete?

## Schema Enhancement Guidelines

### **Field Extraction vs Implementation Separation**
When analyzing existing production systems:

- ✅ **Extract field requirements** - Identify what data users actually need
- ✅ **Analyze user patterns** - Understand how features are used in practice
- ✅ **Document business logic** - Capture validation rules and relationships
- ❌ **Do NOT copy implementation patterns** - Avoid importing bad architecture
- ❌ **Do NOT copy tech debt** - Skip outdated approaches and workarounds

### **Schema Enhancement Process**
1. **Analyze Production Usage** - What fields do real users actually use?
2. **Document Field Requirements** - Why is each field needed?
3. **Design Clean Implementation** - Use modern TypeScript/Next.js patterns
4. **Create Migration Plan** - How to transition from old to new schema
5. **Write Tests First** - TDD for all schema changes
6. **Update Documentation** - Keep specs current with implementation

### **Current Schema Status**
- **Basic Schema**: ✅ Implemented with essential fields
- **Production Field Analysis**: ✅ Complete - comprehensive field requirements documented
- **Health Records**: ❌ Missing - vaccination/treatment tracking needed
- **Advanced Matching**: ❌ Missing - energy level, training, compatibility
- **Social Features**: ❌ Missing - friends, notifications, blocking
- **Location Precision**: ✅ **RESOLVED** - Nominatim API integration for comprehensive NZ coverage

## Website Structure Requirements

### Current State Analysis (As of MVP Review)
- **Landing Page**: Still showing Next.js default - CRITICAL GAP
- **Navigation**: No consistent header/navigation across pages
- **Legal Pages**: Missing Terms of Service and Privacy Policy (legally required)
- **Dashboard**: Custom dashboard built with profile editing, quick actions, activity stats
- **Mobile Responsiveness**: Desktop-only design, not mobile optimized

### Required Website Structure
1. **Landing Page (`/`)** - Replace Next.js default with SocialDog homepage
2. **Navigation Header** - Consistent across all pages with login/logout
3. **Legal Pages** - `/terms` and `/privacy` copied from existing site
4. **Mobile-First Design** - All pages must be responsive for mobile users

## Mobile Responsiveness Standards

- **Target Devices**: Mobile-first approach (dog owners are mobile-heavy demographic)
- **Breakpoints**: Follow Tailwind CSS responsive design patterns
- **Touch Targets**: Minimum 44px touch targets for mobile interaction
- **Navigation**: Mobile-friendly navigation patterns (hamburger menu, etc.)
- **Forms**: Mobile-optimized form layouts and input handling
- **Images**: Responsive images with proper loading and optimization

### Priority Pages for Mobile
1. **Dashboard** - Main post-login experience
2. **Discovery/Browse** - Core dog browsing functionality
3. **Dog Profiles** - Dog creation and editing forms
4. **Authentication** - Login/register flow
5. **Landing Page** - First impression for new users

## Testing Patterns

### Mock Management
- Use consistent mock patterns across similar components
- Reset mocks in `beforeEach()` blocks
- Document what each mock represents and why it's needed
- Clean up mocks when features are completed

### Common Mock Patterns
```typescript
// Supabase client mock
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: mockQuery
      }))
    }))
  }
}))
```

## MVP Features Status

- ✅ Authentication System (TDD)
- ✅ User Profile Management (TDD)
- ✅ Dog Profile System (TDD)
- ✅ Discovery/Browse Dogs (TDD)
- ⏳ Real-time Messaging System (TDD)
- ⏳ Basic Admin Dashboard (TDD)
- ⏳ Database Setup & Migrations
- ⏳ Data Migration from Replit
- ⏳ E2E Testing Suite
- ⏳ Production Deployment

## Notes

Remember to update the Technical Debt section whenever you:
- Add new mocks or stubs
- Create temporary implementations
- Identify performance bottlenecks
- Add TODO comments in code
- Plan future refactoring work
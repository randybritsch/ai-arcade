# AI Arcade - Project Specification

## 1. Executive Summary

AI Arcade is a lightweight, static web application that enables learners to share and discover web-based games created during coding sessions. The platform provides a centralized hub where users can submit game links, browse community creations, and experience shared learning outcomes. Built with modern TypeScript and React, the application prioritizes speed, simplicity, and autonomous development patterns.

**Key Value Propositions:**
- Zero-friction game submission and discovery
- Community-driven content curation
- Demonstration platform for agent-assisted development
- Cost-effective static hosting solution

**Success Metrics:**
- Handle 100-300 game submissions smoothly
- Sub-2s initial load time
- Zero operational overhead
- High user engagement with submitted games

## 2. Architecture

### System Overview

AI Arcade follows a client-side-only architecture optimized for simplicity, performance, and zero operational overhead. The application is built as a Single Page Application (SPA) using modern React patterns with TypeScript for type safety.

### Logical Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Presentation  │    │    Business     │    │      Data       │
│     Layer       │    │     Logic       │    │     Layer       │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • Game Gallery  │────│ • Game Manager  │────│ • LocalStorage  │
│ • Submission    │    │ • URL Validator │    │ • Schema Mgmt   │
│ • Player View   │    │ • Filter/Search │    │ • Data Migration│
│ • Admin Panel   │    │ • State Mgmt    │    │ • Backup/Export │
│ • Navigation    │    │ • Admin Actions │    │ • Error Recovery│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Component Architecture

```
App.tsx (Root)
├── Navigation (Global)
├── Router (React Router v6)
└── Pages
    ├── Home.tsx (Landing & Overview)
    ├── Gallery.tsx (Game Discovery)
    ├── Submit.tsx (Game Submission)
    └── Admin.tsx (Moderation Interface)

Component Hierarchy
├── components/
│   ├── common/ (Reusable UI)
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   └── LoadingSpinner.tsx
│   ├── game/ (Game-specific)
│   │   ├── GameCard.tsx
│   │   ├── GameGallery.tsx
│   │   ├── GamePlayer.tsx
│   │   └── GameSubmission.tsx
│   └── admin/ (Moderation)
│       ├── AdminPanel.tsx
│       └── GameModeration.tsx
```

### State Management Architecture

```
Zustand Store (Global State)
├── Games Collection
│   ├── Active Games Array
│   ├── Featured Games Filter
│   └── Hidden Games (Admin)
├── UI State
│   ├── Loading States
│   ├── Error Messages
│   └── Modal Visibility
├── Filters & Search
│   ├── Tag Filters
│   ├── Search Query
│   └── Sort Preferences
└── Admin State
    ├── Admin Mode Toggle
    ├── Bulk Selection
    └── Moderation Queue
```

### Service Layer Architecture

```
Services Layer (Business Logic)
├── GameStorage Service
│   ├── CRUD Operations
│   ├── Data Validation
│   ├── Storage Quota Management
│   └── Export/Import Functions
├── URLValidator Service
│   ├── URL Schema Validation
│   ├── Domain Allowlisting
│   ├── Security Sanitization
│   └── Normalization
├── DataExport Service
│   ├── JSON Export
│   ├── CSV Generation
│   └── Backup Creation
└── State Hydration
    ├── Initial Load
    ├── Migration Handling
    └── Error Recovery
```

### Runtime Architecture

```
Browser Environment
├── React 18 Application (SPA)
│   ├── React Router v6 (Client-side routing)
│   ├── Zustand (Global state management)
│   ├── Custom Hooks (Business logic abstraction)
│   └── TypeScript Services (Data layer)
├── Browser APIs
│   ├── LocalStorage (Primary persistence)
│   ├── SessionStorage (Temporary state)
│   ├── History API (Navigation)
│   └── Fetch API (External validation)
└── Vite Build System
    ├── Hot Module Replacement
    ├── TypeScript Compilation
    ├── Bundle Optimization
    └── Static Asset Processing

External Dependencies
├── React Ecosystem
│   ├── React Router DOM (Navigation)
│   ├── UUID (Unique identifiers)
│   └── Development Tools
├── Build & Development
│   ├── Vite (Build system)
│   ├── TypeScript (Type safety)
│   ├── ESLint (Code quality)
│   └── Jest (Testing)
├── Deployment Pipeline
│   ├── GitHub Actions (CI/CD)
│   ├── Static Hosting (Vercel/Netlify)
│   └── CDN Distribution
└── No External APIs
    ├── No backend dependencies
    ├── No authentication services
    └── No external data sources
```

### Data Flow Architecture

```
User Action → Component Event → Hook/Service → State Update → UI Re-render

Example: Game Submission Flow
1. User submits form (GameSubmission.tsx)
2. onSubmit handler calls useGameStorage hook
3. Hook validates data via URLValidator service
4. GameStorage.save() persists to LocalStorage
5. Zustand store updated with new game
6. Gallery components auto-update via subscription
7. Success feedback rendered to user
```

### Security Architecture

```
Defense in Depth Strategy
├── Input Validation Layer
│   ├── URL Schema Validation
│   ├── Content Length Limits
│   ├── Character Set Restrictions
│   └── HTML Injection Prevention
├── Output Sanitization
│   ├── HTML Entity Encoding
│   ├── URL Normalization
│   ├── Content Security Headers
│   └── Iframe Sandboxing
├── Client-Side Protection
│   ├── XSS Prevention
│   ├── CSRF Token (N/A - no backend)
│   ├── Content Security Policy
│   └── Secure Defaults
└── Data Protection
    ├── No Sensitive Data Storage
    ├── PII Minimization
    ├── Local-Only Processing
    └── No External Data Transfer
```

## 3. Directory Structure

```
ai-arcade/
├── public/
│   ├── favicon.ico
│   ├── logo.svg
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── game/
│   │   │   ├── GameCard.tsx
│   │   │   ├── GameGallery.tsx
│   │   │   ├── GamePlayer.tsx
│   │   │   └── GameSubmission.tsx
│   │   └── admin/
│   │       ├── AdminPanel.tsx
│   │       └── GameModeration.tsx
│   ├── hooks/
│   │   ├── useGameStorage.ts
│   │   ├── useUrlValidation.ts
│   │   └── useAdminActions.ts
│   ├── services/
│   │   ├── gameStorage.ts
│   │   ├── urlValidator.ts
│   │   └── dataExport.ts
│   ├── types/
│   │   ├── game.ts
│   │   └── admin.ts
│   ├── utils/
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   └── sanitization.ts
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Gallery.tsx
│   │   ├── Submit.tsx
│   │   └── Admin.tsx
│   ├── styles/
│   │   ├── globals.css
│   │   └── components.css
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── docs/
│   ├── project_spec.md
│   ├── bootstrap_summary.md
│   └── architecture.md
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── package.json
├── vite.config.ts
├── tsconfig.json
├── eslint.config.js
└── README.md
```

## 4. Module Inventory

### Core Modules

| Module | Purpose | Inputs | Outputs | Boundaries |
|--------|---------|--------|---------|------------|
| **GameStorage** | Persist/retrieve game data | Game objects, queries | Game arrays, success/error | LocalStorage API only |
| **URLValidator** | Validate and sanitize URLs | Raw URL strings | Validated URLs, errors | No external requests |
| **GameManager** | Business logic for games | User actions, game data | State updates, side effects | Coordinates storage/validation |
| **GameGallery** | Display game collection | Game array, filters | Rendered component | Read-only game display |
| **GameSubmission** | Handle new submissions | Form data | Validated game object | Form validation and submission |
| **AdminPanel** | Moderation interface | Admin actions | System state changes | Admin-only operations |

### Supporting Modules

| Module | Purpose | Inputs | Outputs | Boundaries |
|--------|---------|--------|---------|------------|
| **Router** | Navigation management | Route paths | Component renders | URL-based navigation |
| **StateManager** | Global state coordination | State updates | State distribution | Application-wide state |
| **UIComponents** | Reusable UI elements | Props | Rendered components | Presentation only |
| **DataExport** | Backup/migration support | Game data | JSON/CSV exports | Data serialization |

## 5. Data & Schemas

### Primary Data Schema

```typescript
interface Game {
  id: string;                    // UUID v4
  title: string;                 // 1-100 chars
  url: string;                   // Validated URL
  description?: string;          // 0-500 chars
  author?: string;               // 0-50 chars, display name
  tags: string[];                // 0-10 tags, max 20 chars each
  submittedAt: string;           // ISO 8601 timestamp
  featured: boolean;             // Admin-set feature flag
  playCount: number;             // View counter
  status: 'active' | 'hidden';   // Moderation status
}

interface AppState {
  games: Game[];
  filters: {
    tags: string[];
    featured: boolean;
    searchTerm: string;
  };
  adminMode: boolean;
  lastSync: string;
}
```

### Storage Schema

```typescript
// LocalStorage keys
const STORAGE_KEYS = {
  GAMES: 'ai-arcade:games',
  APP_STATE: 'ai-arcade:state',
  ADMIN_CONFIG: 'ai-arcade:admin',
  SCHEMA_VERSION: 'ai-arcade:schema'
} as const;

// Migration schema
interface StorageVersion {
  version: number;
  migrationDate: string;
  dataFormat: string;
}
```

## 6. API Surface

### Internal APIs

#### GameStorage Service
```typescript
class GameStorage {
  static save(game: Game): Promise<void>
  static getAll(): Promise<Game[]>
  static getById(id: string): Promise<Game | null>
  static update(id: string, updates: Partial<Game>): Promise<void>
  static delete(id: string): Promise<void>
  static clear(): Promise<void>
  static export(): Promise<string>
  static import(data: string): Promise<void>
}
```

#### URLValidator Service
```typescript
class URLValidator {
  static validate(url: string): ValidationResult
  static sanitize(url: string): string
  static isGameUrl(url: string): boolean
  static extractDomain(url: string): string
}
```

### External APIs

#### GitHub Integration (CI/CD)
- **Webhook**: Push to main branch triggers deployment
- **Environment**: `NODE_ENV=production`, build artifacts to `dist/`

#### Hosting Platform (Vercel/Netlify)
- **Build Command**: `npm run build`
- **Output Directory**: `dist/`
- **Node Version**: 18.x
- **Environment Variables**: None (static build)

## 7. Decision Log

### ADR-001: Frontend-Only Architecture
**Date**: 2026-02-09
**Status**: Accepted
**Context**: Need zero-cost hosting with simple data persistence
**Decision**: Use localStorage for data persistence, no backend required
**Consequences**: Limited to ~10MB storage, no real-time sync, no user authentication

### ADR-002: React + TypeScript Stack
**Date**: 2026-02-09
**Status**: Accepted
**Context**: Need modern, maintainable codebase with type safety
**Decision**: React 18 with TypeScript, Vite for tooling
**Consequences**: Modern developer experience, good performance, larger bundle than vanilla JS

### ADR-003: No User Authentication
**Date**: 2026-02-09
**Status**: Accepted
**Context**: Simplified MVP scope, avoid privacy complexity
**Decision**: Anonymous submissions with optional display names
**Consequences**: No user ownership, potential for spam/abuse, simplified UX

### ADR-004: Static Hosting Deployment
**Date**: 2026-02-09
**Status**: Accepted
**Context**: Cost constraints, simple deployment needs
**Decision**: Use Vercel or Netlify with GitHub CI/CD
**Consequences**: Zero hosting cost, excellent performance, limited to static content

## 8. Non-Functional Requirements

### Performance
- **Page Load**: < 2 seconds on 3G connection
- **Bundle Size**: < 500KB gzipped
- **Rendering**: 60 FPS animations, < 100ms state updates
- **Storage**: Handle 300 games (~1MB data) without performance degradation

### Security
- **URL Validation**: Prevent XSS via URL injection
- **Content Security**: Basic iframe sandboxing for embedded content
- **Data Sanitization**: HTML encode all user-provided content
- **No Secrets**: No API keys or sensitive data in client code

### Usability
- **Mobile First**: Responsive design, touch-friendly interface
- **Accessibility**: WCAG 2.1 AA compliance, keyboard navigation
- **Browser Support**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Offline Resilience**: Graceful degradation when offline

### Reliability
- **Data Persistence**: LocalStorage with backup/restore capability
- **Error Handling**: Graceful error states, user-friendly messages
- **Migration**: Forward-compatible data schema versioning
- **Monitoring**: Client-side error tracking for debugging

## 9. Testing Strategy

### Unit Testing (Jest + Testing Library)
- **Coverage Target**: >80% line coverage
- **Focus Areas**: Utility functions, hooks, validation logic
- **Mock Strategy**: LocalStorage, external dependencies
- **Test Files**: `src/**/*.test.ts`

### Integration Testing
- **Component Integration**: Multi-component workflows
- **State Management**: Complex state transitions
- **Data Layer**: Storage and validation integration
- **Test Environment**: jsdom with LocalStorage polyfill

### End-to-End Testing (Playwright)
- **User Journeys**: Submit game → Browse gallery → Play game
- **Admin Workflows**: Feature games, moderate content, bulk operations
- **Cross-Browser**: Chrome, Firefox, Safari on desktop/mobile
- **Performance**: Core Web Vitals measurement

### Manual Testing
- **Usability**: Real user testing on target devices
- **Edge Cases**: Network failures, storage limits, malformed URLs
- **Accessibility**: Screen reader testing, keyboard navigation

## 10. Operational Runbook

### Development Workflow
```bash
# Setup
npm install
npm run dev

# Testing
npm run test
npm run test:e2e
npm run lint

# Building
npm run build
npm run preview
```

### Deployment Process
1. **Code Push**: Merge to main branch
2. **CI Trigger**: GitHub Actions run tests and build
3. **Deploy**: Automatic deployment to hosting platform
4. **Verification**: Health check via automated tests
5. **Rollback**: Revert commit if issues detected

### Monitoring & Maintenance
- **Error Tracking**: Console errors logged to development tools
- **Performance**: Browser DevTools, Lighthouse audits
- **User Feedback**: Issues tracked via GitHub repository
- **Data Backup**: Manual export/import via admin panel

### Troubleshooting
| Issue | Symptoms | Resolution |
|-------|----------|------------|
| Storage Full | Save errors, missing games | Clear old data via admin panel |
| Invalid URLs | Submission failures | Update URL validation patterns |
| Performance | Slow rendering | Audit bundle size, optimize components |
| Build Failures | CI errors | Check dependency versions, TypeScript errors |

## 11. Coding Conventions

### TypeScript Standards
```typescript
// Interfaces with PascalCase
interface GameData {
  readonly id: string;
  title: string;
}

// Enums with PascalCase
enum GameStatus {
  Active = 'active',
  Hidden = 'hidden'
}

// Functions with camelCase, descriptive names
function validateGameUrl(url: string): ValidationResult {
  // Implementation
}

// Constants with SCREAMING_SNAKE_CASE
const MAX_TITLE_LENGTH = 100;
```

### React Patterns
```typescript
// Functional components with TypeScript
interface GameCardProps {
  game: Game;
  onPlay: (gameId: string) => void;
}

function GameCard({ game, onPlay }: GameCardProps): JSX.Element {
  // Component implementation
}

// Custom hooks with 'use' prefix
function useGameStorage() {
  // Hook implementation
}
```

### File Organization
- **Components**: PascalCase filenames (`GameCard.tsx`)
- **Hooks**: camelCase with 'use' prefix (`useGameStorage.ts`)
- **Services**: camelCase (`gameStorage.ts`)
- **Types**: camelCase (`game.ts`)
- **Constants**: camelCase (`constants.ts`)

### Code Style
- **Prettier**: Automatic formatting on save
- **ESLint**: TypeScript-aware linting rules
- **Import Order**: External, internal, relative imports
- **Comments**: JSDoc for public APIs, inline for complex logic

## 12. Risks/Unknowns/Assumptions

### High Risk
1. **LocalStorage Limitations**: Quota exceeded with high usage
   - **Mitigation**: Implement data cleanup, user warnings
2. **URL Security**: Malicious links submitted by users
   - **Mitigation**: Domain allowlist, content warnings
3. **Performance Degradation**: Large number of games affects UI
   - **Mitigation**: Pagination, virtualization, lazy loading

### Medium Risk
1. **Browser Compatibility**: Edge cases in older browsers
   - **Mitigation**: Progressive enhancement, polyfills
2. **Data Loss**: LocalStorage cleared by user/browser
   - **Mitigation**: Export functionality, user education
3. **Spam/Abuse**: Low-quality or inappropriate submissions
   - **Mitigation**: Admin moderation tools, community guidelines

### Assumptions
1. **User Behavior**: Users will submit legitimate game URLs
2. **Scale**: Maximum 300 submissions for MVP
3. **Content**: Games will be web-based and publicly accessible
4. **Environment**: Modern browser with JavaScript enabled
5. **Network**: Basic internet connectivity for initial load

### Unknowns
1. **Actual Usage Patterns**: Real-world submission and browsing behavior
2. **Performance Under Load**: LocalStorage performance with large datasets
3. **Content Quality**: Types and quality of submitted games
4. **Admin Burden**: Amount of moderation required

## 13. Roadmap

### Short-term (MVP - 4 weeks)
- [ ] Core submission and browsing functionality
- [ ] Basic URL validation and sanitization
- [ ] Simple admin panel for moderation
- [ ] Responsive UI with mobile support
- [x] Automated deployment pipeline
- [ ] Basic testing coverage

### Medium-term (Enhanced - 8 weeks)
- [ ] Advanced search and filtering
- [ ] Game categorization and tagging
- [ ] Usage analytics and metrics
- [ ] Enhanced admin tools (bulk operations)
- [ ] Data export/import functionality
- [ ] Performance optimizations

### Future Considerations
- [ ] Backend integration for persistence
- [ ] User authentication and profiles
- [ ] Real-time collaboration features
- [ ] Game embedding and previews
- [ ] Social features (comments, ratings)
- [ ] API for external integrations

## 14. Glossary

| Term | Definition |
|------|------------|
| **AI Arcade** | The web application for sharing and discovering learner-created games |
| **Class Arcade** | The specific use case of sharing games created during coding classes |
| **Learner** | A user who submits games to the platform |
| **Attendee** | A user who browses and plays submitted games |
| **Facilitator** | An admin user with moderation and management capabilities |
| **Game Submission** | A user-provided game entry with title, URL, and metadata |
| **Featured Game** | A game highlighted by admin as particularly noteworthy |
| **Vibe-coding** | Informal coding sessions focused on creativity and exploration |
| **Static Hosting** | Web hosting without server-side processing (HTML, CSS, JS only) |
| **MVP** | Minimum Viable Product - the first complete version with core features |
| **ADR** | Architecture Decision Record - documented technical decisions |
| **SPA** | Single Page Application - client-side rendered web application |

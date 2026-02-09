# AI Arcade - Bootstrap Summary

## Purpose
A lightweight React web app for learners to share game links and browse community creations with zero operational overhead.

## Architecture Overview
- **Frontend-only SPA**: React + TypeScript + Vite for modern development experience
- **LocalStorage persistence**: No backend required, handles 100-300 submissions smoothly
- **Static hosting**: Vercel/Netlify deployment with GitHub CI/CD for zero-cost operation
- **Modular design**: Component-based architecture with clear separation of concerns
- **Security-first**: URL validation, content sanitization, and iframe sandboxing
- **Mobile-responsive**: Progressive enhancement with offline resilience

## Key Modules

| Module | Responsibility | 
|--------|----------------|
| **GameStorage** | LocalStorage abstraction for game data persistence |
| **URLValidator** | URL validation and sanitization for security |
| **GameGallery** | Game browsing and discovery interface |
| **GameSubmission** | Form handling for new game submissions |
| **AdminPanel** | Moderation tools for content management |
| **StateManager** | Global application state coordination |

## Top Data/Contracts

```typescript
interface Game {
  id: string;              // UUID identifier
  title: string;           // Game name (1-100 chars)
  url: string;             // Validated game URL
  description?: string;    // Optional description (0-500 chars)
  author?: string;         // Optional display name (0-50 chars)
  tags: string[];          // Searchable tags (0-10 tags)
  submittedAt: string;     // ISO 8601 timestamp
  featured: boolean;       // Admin feature flag
  playCount: number;       // Usage tracking
  status: 'active' | 'hidden'; // Moderation state
}
```

## Key APIs

### Internal Services
- `GameStorage.save(game)` → Persist new game
- `GameStorage.getAll()` → Retrieve all games
- `URLValidator.validate(url)` → Security validation
- `AdminActions.featureGame(id)` → Content curation

### External Integration
- **GitHub Actions**: Auto-deploy on main branch push
- **Static Hosting**: Build artifacts to `dist/` directory
- **No external APIs**: Self-contained application

## Mandatory Coding Rules

1. **TypeScript strict mode**: All code must be fully typed
2. **Functional components**: No class components, use hooks pattern
3. **URL sanitization**: All URLs must pass validation before storage
4. **Error boundaries**: Graceful failure handling for all user actions
5. **Responsive design**: Mobile-first CSS with progressive enhancement
6. **Accessibility**: WCAG 2.1 AA compliance for all interactive elements
7. **Bundle optimization**: Keep gzipped bundle under 500KB
8. **Test coverage**: >80% line coverage for business logic

## Current Priorities (Top 5)

1. **Core MVP functionality**: Submission form + game gallery + basic admin panel
2. **Security implementation**: URL validation and content sanitization layer
3. **Responsive UI development**: Mobile-first component library creation
4. **LocalStorage service**: Robust data persistence with error handling
5. **CI/CD pipeline setup**: Automated testing and deployment configuration

## Open Risks (Top 5)

1. **LocalStorage quota limits**: May hit 10MB limit with heavy usage
2. **Malicious URL submissions**: Need comprehensive security validation
3. **Performance with scale**: UI degradation with 200+ games
4. **Data loss scenarios**: Browser storage clearing or corruption
5. **Content moderation burden**: Manual oversight for inappropriate submissions

## Links/Paths to Full Docs

- **Complete specification**: [project_spec.md](project_spec.md)
- **Architecture diagrams**: [architecture.md](architecture.md) *(to be created)*
- **API documentation**: `src/services/` inline JSDoc comments
- **Component library**: `src/components/` TypeScript interfaces
- **Testing guides**: `tests/` directory structure and examples
- **Deployment runbook**: [project_spec.md#operational-runbook](project_spec.md#10-operational-runbook)
- **Coding conventions**: [project_spec.md#coding-conventions](project_spec.md#11-coding-conventions)
- **Decision log**: [project_spec.md#decision-log](project_spec.md#7-decision-log)

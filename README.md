# AI Arcade

A simple shared web app for learners to submit and browse vibe-coded games. Perfect for coding classes, workshops, and creative sessions where participants want to showcase their creations.

## Features

- 🎮 **Game Submission**: Submit your games with title, description, and URL
- 🖼️ **Visual Gallery**: Browse games with screenshots and metadata
- 🎯 **Featured Games**: Highlight exceptional submissions
- 📱 **Mobile-First**: Responsive design that works on all devices
- 🔧 **Admin Panel**: Moderate content and manage the collection
- 💾 **Local Storage**: No backend required, data persists in browser

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

### Scripts

- `npm run dev` - Start development server on http://localhost:5173
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run unit tests
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Check code style
- `npm run lint:fix` - Fix code style issues
- `npm run format` - Format code with Prettier

## Deployment

### Deploy to Vercel (Recommended)

#### Option 1: Automatic Deployment (GitHub Integration)

1. **Connect to GitHub**: 
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Import your repository

2. **Configure Project**:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Node.js Version: `18.x`

3. **Deploy**: Vercel will automatically deploy on every push to main

#### Option 2: Manual Deployment (Vercel CLI)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel --prod
```

### Deploy to Netlify

#### Option 1: Drag and Drop

```bash
# Build the project
npm run build

# Go to netlify.com/drop and drag the dist/ folder
```

#### Option 2: GitHub Integration

1. **Connect Repository**:
   - Go to [app.netlify.com](https://app.netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository

2. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18`

#### Option 3: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: CSS Modules + Custom CSS
- **State Management**: Zustand
- **Routing**: React Router
- **Testing**: Jest + Testing Library + Playwright
- **Deployment**: Vercel/Netlify with GitHub Actions

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Basic UI elements (Button, Modal, etc.)
│   ├── game/           # Game-specific components
│   └── admin/          # Admin panel components
├── hooks/              # Custom React hooks
├── pages/              # Route components
├── services/           # Business logic and data handling
├── styles/             # Global styles and CSS modules
├── types/              # TypeScript type definitions
└── utils/              # Helper functions and constants
```

## Data Storage

The app uses browser localStorage for data persistence:
- **Games**: Stored as JSON array with metadata
- **Settings**: Admin preferences and configuration
- **Backup**: Export/import functionality available in admin panel

**Storage Limits**: ~10MB per domain (varies by browser)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and add tests
4. Run the test suite: `npm run test`
5. Commit your changes: `git commit -m 'Add feature'`
6. Push to your branch: `git push origin feature-name`
7. Create a Pull Request

## Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test -- --watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create an issue in this repository
- Check the docs/ folder for detailed documentation
- Review the project specification in docs/project_spec.md

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home } from './pages/Home';
import { Gallery } from './pages/Gallery';
import { Submit } from './pages/Submit';
import { Admin } from './pages/Admin';
import { Button } from './components/common/Button';
import './styles/globals.css';

function Navigation() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="main-nav">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <div className="brand-logo">🎮</div>
          <span className="brand-text">AI Arcade</span>
        </Link>
        
        <div className="nav-links">
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'nav-link-active' : ''}`}
          >
            Home
          </Link>
          <Link 
            to="/gallery" 
            className={`nav-link ${isActive('/gallery') ? 'nav-link-active' : ''}`}
          >
            Gallery
          </Link>
          <Link 
            to="/submit" 
            className={`nav-link ${isActive('/submit') ? 'nav-link-active' : ''}`}
          >
            Submit
          </Link>
          <Link 
            to="/admin" 
            className={`nav-link ${isActive('/admin') ? 'nav-link-active' : ''}`}
          >
            Admin
          </Link>
        </div>

        <div className="nav-actions">
          <Link to="/submit">
            <Button variant="primary" size="sm">
              Add Game
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>AI Arcade</h3>
            <p>
              A platform for learners to share and discover web-based games. 
              Built with modern web technologies and designed for community collaboration.
            </p>
          </div>
          
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/gallery">Browse Games</Link></li>
              <li><Link to="/submit">Submit Game</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Community</h4>
            <ul className="footer-links">
              <li><a href="#" onClick={(e) => e.preventDefault()}>Guidelines</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Support</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Feedback</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2026 AI Arcade. Built for learners, by learners.</p>
          <p className="footer-tech">
            Powered by React, TypeScript, and modern web standards
          </p>
        </div>
      </div>
    </footer>
  );
}

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = React.useState(false);
  
  React.useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('Application error:', error.error);
      setHasError(true);
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  
  if (hasError) {
    return (
      <div className="error-boundary">
        <div className="error-content">
          <h1>Something went wrong</h1>
          <p>We apologize for the inconvenience. Please refresh the page to try again.</p>
          <Button 
            variant="primary" 
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}

function NotFound() {
  return (
    <div className="not-found">
      <div className="not-found-content">
        <h1>404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <Link to="/">
          <Button variant="primary">Go Home</Button>
        </Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="app">
          <Navigation />
          
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/submit" element={<Submit />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          
          <Footer />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
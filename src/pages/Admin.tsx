import React, { useState } from 'react';
import { Button } from '../components/common/Button';
import { AdminPanel } from '../components/admin/AdminPanel';

export function Admin() {
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const handleOpenAdmin = () => {
    setShowAdminPanel(true);
  };

  const handleCloseAdmin = () => {
    setShowAdminPanel(false);
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Administrator Access</h1>
        <p>Manage games, users, and system settings</p>
      </div>

      <div className="admin-content">
        <div className="admin-info">
          <h2>Admin Functions</h2>
          <div className="admin-features">
            <div className="feature-item">
              <h3>🎮 Game Management</h3>
              <p>
                Feature or hide games, moderate content, and manage the game gallery. 
                Control which games are highlighted and visible to users.
              </p>
            </div>
            <div className="feature-item">
              <h3>📊 Analytics & Stats</h3>
              <p>
                View comprehensive statistics about game submissions, user engagement, 
                and platform usage.
              </p>
            </div>
            <div className="feature-item">
              <h3>🗂️ Data Management</h3>
              <p>
                Export game data for backup, import from external sources, 
                and manage system data integrity.
              </p>
            </div>
            <div className="feature-item">
              <h3>⚙️ System Operations</h3>
              <p>
                Reset system state, clear databases, and perform maintenance 
                operations on the platform.
              </p>
            </div>
          </div>
        </div>

        <div className="admin-access">
          <div className="access-card">
            <h3>Administrator Login Required</h3>
            <p>
              Access to the admin panel requires authentication. Only authorized 
              personnel should have access to these administrative functions.
            </p>
            <Button variant="primary" size="lg" onClick={handleOpenAdmin}>
              Access Admin Panel
            </Button>
          </div>
        </div>

        <div className="admin-notes">
          <h3>⚠️ Important Notes</h3>
          <ul>
            <li>
              <strong>Data Protection:</strong> Always backup data before performing 
              bulk operations or system resets.
            </li>
            <li>
              <strong>Moderation Policy:</strong> Review content carefully before 
              featuring or hiding games. Be fair and consistent.
            </li>
            <li>
              <strong>Privacy:</strong> This platform stores only publicly submitted 
              game links and minimal metadata.
            </li>
            <li>
              <strong>Security:</strong> Log out of admin mode when finished and 
              never share admin credentials.
            </li>
          </ul>
        </div>
      </div>

      {/* Admin panel modal */}
      <AdminPanel 
        isOpen={showAdminPanel} 
        onClose={handleCloseAdmin} 
      />
    </div>
  );
}
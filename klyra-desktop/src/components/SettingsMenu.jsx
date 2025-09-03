import { useState, useEffect } from "react";
import { invoke } from '@tauri-apps/api/tauri';
import "./SettingsMenu.css";

function SettingsMenu({ isOpen, onClose, userInfo }) {
  const [activeSection, setActiveSection] = useState('profile');
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [firstName, setFirstName] = useState(userInfo?.name || "User");
  const [nickname, setNickname] = useState(userInfo?.nickname || "User");
  const [isEditingNickname, setIsEditingNickname] = useState(false);

  // Перевіряємо поточну тему при відкритті меню
  useEffect(() => {
    if (isOpen) {
      const currentTheme = document.body.classList.contains('dark-theme');
      setIsDarkTheme(currentTheme);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleThemeToggle = () => {
    setIsDarkTheme(!isDarkTheme);
    document.body.classList.toggle('dark-theme');
  };

  // Function to clear personal data but keep app settings
  const clearAllData = () => {
    try {
      // Save app settings before clearing
      const savedTheme = localStorage.getItem('klyra-theme');
      
      // Clear localStorage
      localStorage.clear();
      
      // Restore app settings
      if (savedTheme) {
        localStorage.setItem('klyra-theme', savedTheme);
      }
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Clear IndexedDB (if available)
      if ('indexedDB' in window) {
        indexedDB.databases().then(databases => {
          databases.forEach(db => {
            indexedDB.deleteDatabase(db.name);
          });
        });
      }
      
      // Clear Cache API (if available)
      if ('caches' in window) {
        caches.keys().then(cacheNames => {
          cacheNames.forEach(cacheName => {
            caches.delete(cacheName);
          });
        });
      }
      
      // Clear cookies (if any)
      document.cookie.split(";").forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      });
      
      // Reload the page to apply changes
      window.location.reload();
    } catch (error) {
      // Silent error handling for anonymity
    }
  };

  // Function to change nickname
  const handleNicknameChange = () => {
    if (nickname.trim() && nickname !== userInfo?.nickname) {
      // Update userInfo in parent component
      if (userInfo) {
        userInfo.nickname = nickname.trim();
        userInfo.name = nickname.trim();
        userInfo.avatar = nickname.trim().charAt(0).toUpperCase();
      }
      setIsEditingNickname(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Function to open external links
  const openExternalLink = async (url) => {
    try {
      await invoke('shell_open', { path: url });
    } catch (error) {
      console.error('Failed to open external link:', error);
      // Fallback to window.open if Tauri API fails
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const getAvatarLetter = () => {
    return firstName.charAt(0).toUpperCase();
  };

  const settingsSections = [
    { 
      id: 'profile', 
      title: 'Profile', 
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      )
    },
    { 
      id: 'privacy', 
      title: 'Privacy & Security', 
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <circle cx="12" cy="16" r="1"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      )
    },
    { 
      id: 'notifications', 
      title: 'Notifications', 
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      )
    },
    { 
      id: 'appearance', 
      title: 'Appearance', 
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
      )
    },
    { 
      id: 'language', 
      title: 'Language', 
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      )
    },
    { 
      id: 'advanced', 
      title: 'Advanced', 
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
          <path d="M20.66 3.34l-4.24 4.24m-8.48 8.48l-4.24 4.24m0-16.96l4.24 4.24m8.48 8.48l4.24 4.24"/>
        </svg>
      )
    },
    { 
      id: 'about', 
      title: 'About', 
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      )
    }
  ];

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="settings-content">
            <div className="settings-section">
              <h3>Profile Information</h3>
                             <div className="profile-avatar-section">
                 <div className="profile-avatar-large">
                   <div className="avatar-circle-large">
                     <span>{getAvatarLetter()}</span>
                   </div>
                   <button className="change-avatar-btn">Change Photo</button>
                 </div>
               </div>
              <div className="form-group">
                <label>First Name</label>
                <input 
                  type="text" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter your first name"
                />
              </div>
              <div className="form-group">
                <label>Nickname</label>
                {isEditingNickname ? (
                  <div className="nickname-edit-container">
                    <input 
                      type="text" 
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="Enter your nickname"
                      autoFocus
                    />
                    <div className="nickname-edit-buttons">
                      <button 
                        className="save-btn" 
                        onClick={handleNicknameChange}
                        disabled={!nickname.trim()}
                      >
                        Save
                      </button>
                      <button 
                        className="cancel-btn" 
                        onClick={() => {
                          setNickname(userInfo?.nickname || "User");
                          setIsEditingNickname(false);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="nickname-display-container">
                    <span className="nickname-display">{nickname}</span>
                    <button 
                      className="edit-nickname-btn"
                      onClick={() => setIsEditingNickname(true)}
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea placeholder="Tell us about yourself..." rows="3"></textarea>
              </div>
            </div>
          </div>
        );
      
      case 'privacy':
        return (
          <div className="settings-content">
            <div className="settings-section">
              <h3>Privacy & Security</h3>
              <div className="settings-item">
                <div className="settings-item-info">
                  <span className="settings-item-title">Last Seen</span>
                  <span className="settings-item-desc">Who can see your last seen time</span>
                </div>
                <select className="settings-select">
                  <option>Everyone</option>
                  <option>My Contacts</option>
                  <option>Nobody</option>
                </select>
              </div>
              <div className="settings-item">
                <div className="settings-item-info">
                  <span className="settings-item-title">Profile Photo</span>
                  <span className="settings-item-desc">Who can see your profile photo</span>
                </div>
                <select className="settings-select">
                  <option>Everyone</option>
                  <option>My Contacts</option>
                  <option>Nobody</option>
                </select>
              </div>
              <div className="settings-item">
                <div className="settings-item-info">
                  <span className="settings-item-title">Server Address</span>
                  <span className="settings-item-desc">Who can see your server connection info</span>
                </div>
                <select className="settings-select">
                  <option>Everyone</option>
                  <option>My Contacts</option>
                  <option>Nobody</option>
                </select>
              </div>
            </div>
          </div>
        );
      
      case 'notifications':
        return (
          <div className="settings-content">
            <div className="settings-section">
              <h3>Notifications</h3>
              <div className="settings-item">
                <div className="settings-item-info">
                  <span className="settings-item-title">Desktop Notifications</span>
                  <span className="settings-item-desc">Show notifications on desktop</span>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="settings-item">
                <div className="settings-item-info">
                  <span className="settings-item-title">Sound</span>
                  <span className="settings-item-desc">Play sound for new messages</span>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="settings-item">
                <div className="settings-item-info">
                  <span className="settings-item-title">Custom Sound</span>
                  <span className="settings-item-desc">Place your MP3 file in: src/assets/sounds/notification.mp3</span>
                </div>
                        <div className="settings-info">
          <span className="settings-info-text">Volume: 20%</span>
        </div>
              </div>
              <div className="settings-item">
                <div className="settings-item-info">
                  <span className="settings-item-title">Message Preview</span>
                  <span className="settings-item-desc">Show message content in notifications</span>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        );
      
      case 'appearance':
        return (
          <div className="settings-content">
            <div className="settings-section">
              <h3>Appearance</h3>
              <div className="settings-item">
                <div className="settings-item-info">
                  <span className="settings-item-title">Dark Theme</span>
                  <span className="settings-item-desc">Switch between light and dark themes</span>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={isDarkTheme} onChange={handleThemeToggle} />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="settings-item">
                <div className="settings-item-info">
                  <span className="settings-item-title">Font Size</span>
                  <span className="settings-item-desc">Adjust text size</span>
                </div>
                <select className="settings-select">
                  <option>Small</option>
                  <option>Medium</option>
                  <option>Large</option>
                </select>
              </div>
              <div className="settings-item">
                <div className="settings-item-info">
                  <span className="settings-item-title">Chat Background</span>
                  <span className="settings-item-desc">Customize chat background</span>
                </div>
                <button className="settings-btn">Choose Background</button>
              </div>
            </div>
          </div>
        );
      
      case 'language':
        return (
          <div className="settings-content">
            <div className="settings-section">
              <h3>Language</h3>
              <div className="settings-item">
                <div className="settings-item-info">
                  <span className="settings-item-title">Interface Language</span>
                  <span className="settings-item-desc">Choose your preferred language</span>
                </div>
                <select className="settings-select">
                  <option>English</option>
                  <option>Українська</option>
                  <option>Русский</option>
                  <option>Deutsch</option>
                  <option>Français</option>
                </select>
              </div>
            </div>
          </div>
        );
      
      case 'advanced':
        return (
          <div className="settings-content">
            <div className="settings-section">
              <h3>Advanced</h3>
              <div className="settings-item">
                <div className="settings-item-info">
                  <span className="settings-item-title">Auto-download Media</span>
                  <span className="settings-item-desc">Automatically download photos and videos</span>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="settings-item">
                <div className="settings-item-info">
                  <span className="settings-item-title">Data Usage</span>
                  <span className="settings-item-desc">Network and storage usage</span>
                </div>
                <button className="settings-btn">View Usage</button>
              </div>
              <div className="settings-item">
                <div className="settings-item-info">
                  <span className="settings-item-title">Clear Personal Data</span>
                  <span className="settings-item-desc">Remove personal data but keep app settings</span>
                </div>
                <button className="settings-btn" onClick={clearAllData}>Clear Personal Data</button>
              </div>
            </div>
          </div>
        );
      
      case 'about':
        return (
          <div className="settings-content">
            <div className="settings-section">
              <h3>About Klyra</h3>
              <div className="about-section">
                <div className="about-logo">
                  <div className="about-logo-circle">
                    <span>K</span>
                  </div>
                </div>
                <div className="about-info">
                  <h4>Klyra Messenger</h4>
                  <p className="about-version">Version 1.0.0</p>
                  <p className="about-description">
                    A modern, cross-platform messaging application built with Tauri and React. 
                    Features real-time messaging, file sharing, and secure communication.
                  </p>
                </div>
              </div>
              
              <div className="about-details">
                <div className="about-item about-item-multiline">
                  <span className="about-label">Copyright</span>
                  <div className="about-value-multiline">
                    <div>© 2025 Klyra, Inc.</div>
                    <div className="author-info">
                      Original Author and Creator: 
                      <button 
                        onClick={() => openExternalLink('https://github.com/Seredovskiy1')}
                        className="github-link"
                        type="button"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '4px', verticalAlign: 'middle'}}>
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        @Seredovskiy1
                      </button>
                    </div>
                  </div>
                </div>
                <div className="about-item">
                  <span className="about-label">License</span>
                  <span className="about-value">Apache 2.0</span>
                </div>
                <div className="about-item">
                  <span className="about-label">Technology</span>
                  <span className="about-value">Tauri + React + Node.js</span>
                </div>
                <div className="about-item">
                  <span className="about-label">Platform</span>
                  <span className="about-value">Cross-platform Desktop</span>
                </div>
              </div>
              
              <div className="about-features">
                <h5>Features</h5>
                <ul>
                  <li>Real-time messaging</li>
                  <li>File sharing</li>
                  <li>Message editing & deletion</li>
                  <li>User management</li>
                  <li>Dark/Light themes</li>
                  <li>Sound notifications</li>
                  <li>Cross-platform support</li>
                </ul>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="settings-overlay" onClick={handleBackdropClick}>
      <div className="settings-menu">
        <div className="settings-header">
          <button className="settings-back-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5"/>
              <path d="M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h2>Settings</h2>
        </div>
        
        <div className="settings-body">
          <div className="settings-sidebar">
            {settingsSections.map((section) => (
              <button
                key={section.id}
                className={`settings-sidebar-item ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <span className="settings-sidebar-icon">{section.icon}</span>
                <span className="settings-sidebar-title">{section.title}</span>
              </button>
            ))}
          </div>
          
          <div className="settings-main">
            {renderSectionContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsMenu;

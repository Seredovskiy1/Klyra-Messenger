import { useState, useEffect } from "react";
import { appWindow } from "@tauri-apps/api/window";
import "./GlobalContextMenu.css";

function GlobalContextMenu() {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [menuDirection, setMenuDirection] = useState('down');
  const [isTauriAvailable, setIsTauriAvailable] = useState(false);

  // Function to show context menu with smart positioning
  const handleContextMenu = (e) => {
    e.preventDefault();
    
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const menuWidth = 200;
    const menuHeight = 280;
    const padding = 20; // Increase padding
    
    let x = e.clientX;
    let y = e.clientY;
    
    // First determine menu direction
    let direction = 'down';
    if (y + menuHeight + padding > windowHeight) {
      if (e.clientY - menuHeight > padding) {
        direction = 'up';
        y = e.clientY - menuHeight;
      } else {
        direction = 'down';
        y = windowHeight - menuHeight - padding;
      }
    }
    
    // Horizontal positioning
    if (x + menuWidth + padding > windowWidth) {
      x = windowWidth - menuWidth - padding;
    }
    if (x < padding) {
      x = padding;
    }
    
    // Final check
    x = Math.max(padding, Math.min(x, windowWidth - menuWidth - padding));
    y = Math.max(padding, Math.min(y, windowHeight - menuHeight - padding));
    
    setMenuDirection(direction);
    setContextMenuPosition({ x, y });
    setShowContextMenu(true);
  };

  // Function to hide context menu
  const hideContextMenu = () => {
    setShowContextMenu(false);
  };

  // Function for copying
  const handleCopy = async () => {
    try {
      // Use old method to bypass Edge requests
      const textArea = document.createElement('textarea');
      textArea.value = 'Klyra Desktop';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      hideContextMenu();
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Function for pasting
  const handlePaste = async () => {
    try {
      // Use old method to bypass Edge requests
      const textArea = document.createElement('textarea');
      document.body.appendChild(textArea);
      textArea.focus();
      document.execCommand('paste');
      const text = textArea.value;
      document.body.removeChild(textArea);
      // Pasted text (no logging for anonymity)
      hideContextMenu();
    } catch (error) {
      console.error('Failed to paste:', error);
    }
  };

  // Function to change theme
  const toggleTheme = () => {
    const isDark = document.body.classList.contains('dark-theme');
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('klyra-theme', isDark ? 'light' : 'dark');
    hideContextMenu();
  };

  // Function for reloading
  const reloadApp = () => {
    window.location.reload();
  };



  // Function for minimizing
  const minimizeWindow = async () => {
    try {
      if (isTauriAvailable) {
        await appWindow.minimize();
      }
    } catch (error) {
      console.error('Failed to minimize:', error);
    }
    hideContextMenu();
  };

  // Function for maximizing
  const maximizeWindow = async () => {
    try {
      if (isTauriAvailable) {
        const isMaximized = await appWindow.isMaximized();
        if (isMaximized) {
          await appWindow.unmaximize();
        } else {
          await appWindow.maximize();
        }
      }
    } catch (error) {
      console.error('Failed to maximize:', error);
    }
    hideContextMenu();
  };

  // Event handlers
  useEffect(() => {
    const handleClickOutside = () => hideContextMenu();
    const handleResize = () => hideContextMenu();
    const handleScroll = () => hideContextMenu();

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('resize', handleResize);
    document.addEventListener('scroll', handleScroll);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showContextMenu) {
        hideContextMenu();
      } else if (e.ctrlKey) {
        if (e.key === 'c') {
          e.preventDefault();
          handleCopy();
        } else if (e.key === 'v') {
          e.preventDefault();
          handlePaste();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showContextMenu]);

  // Tauri check
  useEffect(() => {
    const checkTauri = async () => {
      try {
        const isAvailable = typeof appWindow !== 'undefined';
        // Tauri availability check (no logging for anonymity)
        setIsTauriAvailable(isAvailable);
      } catch (error) {
        // Tauri check failed (no logging for anonymity)
        setIsTauriAvailable(false);
      }
    };
    checkTauri();
  }, []);

  return (
    <>
      {showContextMenu && (
        <div 
          className={`global-context-menu ${menuDirection === 'up' ? 'menu-up' : 'menu-down'}`}
          style={{
            left: contextMenuPosition.x,
            top: contextMenuPosition.y
          }}
        >
          <div className={`menu-direction-indicator ${menuDirection === 'up' ? 'indicator-up' : 'indicator-down'}`}></div>
          
          <button className="context-menu-item" onClick={handleCopy}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            Copy
            <span className="shortcut">Ctrl+C</span>
          </button>
          
          <button className="context-menu-item" onClick={handlePaste}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
            </svg>
            Paste
            <span className="shortcut">Ctrl+V</span>
          </button>
          
          <div className="context-menu-separator"></div>
          
          <button className="context-menu-item" onClick={toggleTheme}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5"/>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
            Change Theme
          </button>
          
          <div className="context-menu-separator"></div>
          
          <button className="context-menu-item" onClick={minimizeWindow}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="5" width="20" height="2" fill="currentColor"/>
            </svg>
            Minimize
          </button>
          
          <button className="context-menu-item" onClick={maximizeWindow}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <path d="M8 12h8M12 8v8"/>
            </svg>
            Maximize/Restore
          </button>
          
          <div className="context-menu-separator"></div>
          
          <button className="context-menu-item" onClick={reloadApp}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
              <path d="M3 21v-5h5"/>
            </svg>
            Reload
          </button>
          

        </div>
      )}
    </>
  );
}

export default GlobalContextMenu;

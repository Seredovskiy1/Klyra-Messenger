import { useState, useEffect } from "react";
import { appWindow } from "@tauri-apps/api/window";
import "./CustomTitleBar.css";
import klyraLogo from "../assets/klyra-logo.svg";

function CustomTitleBar() {
  // CustomTitleBar component loaded (no logging for anonymity)
  
  const [isMaximized, setIsMaximized] = useState(false);
  const [isTauriAvailable, setIsTauriAvailable] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  // Remove states for context menu since we now use global one

  // Function to change theme
  const toggleTheme = () => {
    // Toggle theme called (no logging for anonymity)
    setIsDarkTheme(prev => !prev);
    document.body.classList.toggle('dark-theme');
    // Theme toggled (no logging for anonymity)
  };

  // Remove functions for context menu since we now use global one

  // Remove copy and paste functions since they are now in global menu

  // Remove useEffect for hiding context menu since we now use global one

  // Apply theme on load
  // Load saved theme on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('klyra-theme');
    if (savedTheme === 'dark') {
      setIsDarkTheme(true);
      document.body.classList.add('dark-theme');
    }
  }, []);

  // Save theme to localStorage (app settings only)
  useEffect(() => {
    localStorage.setItem('klyra-theme', isDarkTheme ? 'dark' : 'light');
  }, [isDarkTheme]);

  useEffect(() => {
    const checkTauri = async () => {
      try {
        if (typeof appWindow !== 'undefined') {
          setIsTauriAvailable(true);
          await checkWindowState();
        } else {
          setIsTauriAvailable(false);
        }
      } catch (error) {
        setIsTauriAvailable(false);
      }
    };

    checkTauri();
  }, []);

  const checkWindowState = async () => {
    try {
      if (isTauriAvailable) {
        const maximized = await appWindow.isMaximized();
        setIsMaximized(maximized);
      }
    } catch (error) {
      // Silent error handling
    }
  };

  const minimizeWindow = async () => {
    try {
      if (isTauriAvailable) {
        await appWindow.minimize();
      }
    } catch (error) {
      // Silent error handling
    }
  };

  const maximizeWindow = async () => {
    try {
      if (isTauriAvailable) {
        if (isMaximized) {
          await appWindow.unmaximize();
          setIsMaximized(false);
        } else {
          await appWindow.maximize();
          setIsMaximized(true);
        }
      }
    } catch (error) {
      // Silent error handling
    }
  };

  const closeWindow = async () => {
    try {
      if (isTauriAvailable) {
        await appWindow.close();
      }
    } catch (error) {
      // Silent error handling
    }
  };

  // Function for dragging window
  const startDragging = async (e) => {
    try {
      // Check if it's not a button and window is not maximized
      if (isTauriAvailable && !isMaximized && e.target.closest('.title-bar-btn') === null) {
        e.preventDefault();
        await appWindow.startDragging();
      }
    } catch (error) {
      // Silent error handling
    }
  };

  // Function for dragging from buttons (only if button is not pressed)
  const handleButtonMouseDown = async (e, action) => {
    // If it's left mouse button, execute button action
    if (e.button === 0) {
      e.stopPropagation(); // Stop event propagation
      action();
    }
  };

  // Additional keyboard functions
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'w':
            e.preventDefault();
            closeWindow();
            break;
          case 'm':
            e.preventDefault();
            minimizeWindow();
            break;
          case 'f':
            e.preventDefault();
            maximizeWindow();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMaximized]);

  const handleLogoMouseDown = async (e) => {
    // If it's left mouse button, change theme
    if (e.button === 0) {
      e.preventDefault();
      e.stopPropagation();
      // Logo clicked (no logging for anonymity)
      toggleTheme();
    } else {
      // For other mouse buttons - dragging
      try {
        if (isTauriAvailable && !isMaximized) {
          e.preventDefault();
          await appWindow.startDragging();
        }
      } catch (error) {
        // Silent error handling
      }
    }
  };

  return (
    <div 
      className="custom-title-bar"
      onMouseDown={startDragging}
    >
      <div className="title-bar-left">
        <div 
          className="app-icon"
          onMouseDown={handleLogoMouseDown}
          title="Click to change theme"
        >
          <div className="icon-circle icon-circle-1"></div>
          <div className="icon-circle icon-circle-2"></div>
        </div>
        <span 
          className="app-title"
          onMouseDown={startDragging}
        >
          <img src={klyraLogo} alt="Klyra" className="klyra-logo" />
        </span>
      </div>
      
      <div className="title-bar-center">
        <div 
          className="drag-region" 
          title="Drag to move window"
        ></div>
      </div>
      
      <div className="title-bar-right">
        <button 
          className="title-bar-btn minimize-btn" 
          onMouseDown={(e) => handleButtonMouseDown(e, minimizeWindow)}
          title="Minimize (Ctrl+M)"
          disabled={!isTauriAvailable}
        >
          <svg width="16" height="16" viewBox="0 0 12 12">
            <rect x="2" y="5" width="8" height="2" fill="currentColor"/>
          </svg>
        </button>
        
        <button 
          className="title-bar-btn maximize-btn" 
          onMouseDown={(e) => handleButtonMouseDown(e, maximizeWindow)}
          title={isMaximized ? "Restore (Ctrl+F)" : "Maximize (Ctrl+F)"}
          disabled={!isTauriAvailable}
        >
          <svg width="16" height="16" viewBox="0 0 12 12">
            {isMaximized ? (
              <path d="M3 3h3v1H4v3H3V3zm3 3h3v3H7V7H6V6z" fill="currentColor"/>
            ) : (
              <rect x="2" y="2" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1"/>
            )}
          </svg>
        </button>
        
        <button 
          className="title-bar-btn close-btn" 
          onMouseDown={(e) => handleButtonMouseDown(e, closeWindow)}
          title="Close (Ctrl+W)"
          disabled={!isTauriAvailable}
        >
          <svg width="16" height="16" viewBox="0 0 12 12">
            <path d="M3 3l6 6m0-6l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Remove custom context menu since we now use global one */}
    </div>
  );
}

export default CustomTitleBar;

// Configuration loader utility
let config = null;

// Default configuration
const defaultConfig = {
  server: {
    host: "localhost",
    port: 3001,
    protocol: "http",
    autoReconnect: true,
    reconnectAttempts: 5,
    reconnectInterval: 1000
  },
  ui: {
    theme: "auto",
    soundEnabled: true,
    soundVolume: 0.2,
    showTimestamps: true,
    showAvatars: true
  },
  features: {
    fileSharing: true,
    messageEditing: true,
    messageDeletion: true,
    typingIndicators: true,
    messageSearch: true
  },
  limits: {
    maxFileSize: 10485760,
    maxMessageLength: 1000,
    maxMessagesInHistory: 100
  }
};

// Load configuration
export const loadConfig = async () => {
  if (config) return config;

  try {
    const response = await fetch('/src/config.json');
    if (response.ok) {
      config = await response.json();
      console.log('Configuration loaded from config.json');
    } else {
      throw new Error('Config file not found');
    }
  } catch (error) {
    console.log('Using default configuration');
    config = defaultConfig;
  }

  return config;
};

// Get configuration
export const getConfig = () => {
  return config || defaultConfig;
};

// Get server URL
export const getServerUrl = () => {
  const cfg = getConfig();
  return `${cfg.server.protocol}://${cfg.server.host}:${cfg.server.port}`;
};

// Get WebSocket URL
export const getWebSocketUrl = () => {
  const cfg = getConfig();
  return `${cfg.server.protocol}://${cfg.server.host}:${cfg.server.port}`;
};

// Update configuration
export const updateConfig = (newConfig) => {
  config = { ...config, ...newConfig };
  return config;
};

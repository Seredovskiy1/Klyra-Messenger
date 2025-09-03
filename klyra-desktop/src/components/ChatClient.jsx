import { useState, useEffect, useRef } from "react";
import "./ChatClient.css";
import klyraLogo from "../assets/klyra-logo.svg";
import SettingsMenu from "./SettingsMenu";
import { io } from "socket.io-client";
import { loadConfig, getConfig, getWebSocketUrl } from "../utils/config";

function ChatClient({ userInfo, onLogout }) {
  const [message, setMessage] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [maxReconnectAttempts, setMaxReconnectAttempts] = useState(5);
  const [reconnectInterval, setReconnectInterval] = useState(1000);
  const [config, setConfig] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [users, setUsers] = useState([]);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState("");
  const [contextMenu, setContextMenu] = useState(null);

  const [messages, setMessages] = useState([]);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);



  // Auto-reconnect function
  const attemptReconnect = () => {
    if (reconnectAttempts >= maxReconnectAttempts) {
      setConnectionStatus("failed");
      // Max reconnection attempts reached (no logging for anonymity)
      return;
    }

    setReconnectAttempts(prev => prev + 1);
    setConnectionStatus("reconnecting");
    
    const delay = Math.min(reconnectInterval * Math.pow(2, reconnectAttempts), 30000); // Exponential backoff, max 30s
    
    reconnectTimeoutRef.current = setTimeout(() => {
      // Attempting to reconnect
      connectSocket();
    }, delay);
  };

  // Socket.io connection functions
  const connectSocket = () => {
    // Don't create new connection if already connected
    if (socketRef.current && socketRef.current.connected) {
      return;
    }
    
    if (!config) {
      console.error('Configuration not loaded yet');
      return;
    }
    
    // Connect to the external server
    const serverUrl = getWebSocketUrl();
    const socket = io(serverUrl);
    socketRef.current = socket;
    
    socket.on('connect', () => {
      // Socket connected
      setIsConnected(true);
      setConnectionStatus("connected");
      setReconnectAttempts(0); // Reset reconnect attempts on successful connection
      
      // Send user info to server
      socket.emit('user_join', {
        name: userInfo.name,
        nickname: userInfo.nickname,
        avatar: userInfo.avatar,
        room: 'general'
      });
    });
    
    socket.on('disconnect', () => {
      // Socket disconnected
      setIsConnected(false);
      setConnectionStatus("disconnected");
      
      // Attempt to reconnect
      attemptReconnect();
    });
    
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setConnectionStatus("error");
    });
    
    // Handle all incoming events
    socket.on('new_message', (data) => handleSocketMessage('new_message', data));
    socket.on('user_joined', (data) => handleSocketMessage('user_joined', data));
    socket.on('user_left', (data) => handleSocketMessage('user_left', data));
    socket.on('room_info', (data) => handleSocketMessage('room_info', data));
    socket.on('message_edited', (data) => handleSocketMessage('message_edited', data));
    socket.on('message_deleted', (data) => handleSocketMessage('message_deleted', data));
  };

  const handleSocketMessage = (type, data) => {
    switch (type) {


      case 'new_message':
        // Handle file messages
        if (data.type === 'file' && data.sender !== userInfo.nickname) {
          const fileMessage = {
            id: data.id || Date.now() + Math.random(),
            text: `📎 ${data.fileName}`,
            sender: 'other',
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            avatar: data.sender.charAt(0).toUpperCase(),
            timestamp: data.timestamp || Date.now(),
            senderName: data.sender,
            isNew: true,
            isFile: true,
            fileName: data.fileName,
            fileSize: data.fileSize || 'Unknown',
            fileType: data.fileType || 'application/octet-stream',
            fileData: data.fileData
          };
          setMessages(prev => [...prev, fileMessage]);
          
          // Play notification sound for files from other users
          playNotificationSound();
          
          // Remove new message highlight after animation
          setTimeout(() => {
            setMessages(prev => prev.map(msg => 
              msg.id === fileMessage.id ? { ...msg, isNew: false } : msg
            ));
          }, 600);
        } else if (data.sender !== userInfo.nickname) {
          // Handle text messages
          const newMessage = {
            id: data.id || Date.now() + Math.random(),
            text: data.text,
            sender: 'other',
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            avatar: data.sender.charAt(0).toUpperCase(),
            timestamp: data.timestamp || Date.now(),
            senderName: data.sender,
            isNew: true
          };
          setMessages(prev => [...prev, newMessage]);
          
          // Play notification sound for messages from other users
          playNotificationSound();
          
          // Remove new message highlight after animation
          setTimeout(() => {
            setMessages(prev => prev.map(msg => 
              msg.id === newMessage.id ? { ...msg, isNew: false } : msg
            ));
          }, 600);
        }
        break;
        
      case 'user_joined':
        // Add user to list or update status (but not current user)
        if (data.user && data.user.id !== userInfo.id) {
          setUsers(prev => {
            const existingUser = prev.find(u => u.id === data.user.id);
            if (existingUser) {
              return prev.map(u => u.id === data.user.id ? { ...u, status: 'online' } : u);
            } else {
              return [...prev, { ...data.user, status: 'online', lastSeen: 'online' }];
            }
          });
        }
        if (data.message) {
          const systemMessage = {
            id: Date.now() + Math.random(),
            text: data.message,
            sender: 'system',
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            avatar: 'S',
            timestamp: Date.now(),
            isNew: true
          };
          setMessages(prev => [...prev, systemMessage]);
          
          // Remove new message highlight after animation
          setTimeout(() => {
            setMessages(prev => prev.map(msg => 
              msg.id === systemMessage.id ? { ...msg, isNew: false } : msg
            ));
          }, 600);
        }
        break;
        
      case 'user_left':
        // Remove user from list or update status (but not current user)
        if (data.user && data.user.id !== userInfo.id) {
          setUsers(prev => prev.filter(u => u.id !== data.user.id));
        }
        if (data.message) {
          const systemMessage = {
            id: Date.now() + Math.random(),
            text: data.message,
            sender: 'system',
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            avatar: 'S',
            timestamp: Date.now(),
            isNew: true
          };
          setMessages(prev => [...prev, systemMessage]);
          
          // Remove new message highlight after animation
          setTimeout(() => {
            setMessages(prev => prev.map(msg => 
              msg.id === systemMessage.id ? { ...msg, isNew: false } : msg
            ));
          }, 600);
        }
        break;
        
      case 'system':
        // Received system message
        const systemMessage = {
          id: Date.now() + Math.random(),
          text: data.text,
          sender: 'system',
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          avatar: 'S',
          timestamp: Date.now(),
          isNew: true
        };
        setMessages(prev => [...prev, systemMessage]);
        

        
        // Remove new message highlight after animation
        setTimeout(() => {
          setMessages(prev => prev.map(msg => 
            msg.id === systemMessage.id ? { ...msg, isNew: false } : msg
          ));
        }, 600);
        break;

      case 'room_info':
        // Handle room information from server
        if (data.users) {
          // Filter out current user to avoid duplicates
          const otherUsers = data.users.filter(user => user.id !== userInfo.id);
          setUsers(otherUsers);
        }
        if (data.messages) {
          setMessages(data.messages.map(msg => ({
            ...msg,
            time: new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            avatar: msg.sender.charAt(0).toUpperCase(),
            isNew: false
          })));
        }
        break;

      case 'message_edited':
        // Update edited message
        if (data.messageId && data.newText) {
          setMessages(prev => prev.map(msg => 
            msg.id === data.messageId 
              ? { ...msg, text: data.newText, isEdited: true }
              : msg
          ));
        }
        break;

      case 'message_deleted':
        // Remove deleted message
        if (data.messageId) {
          setMessages(prev => prev.filter(msg => msg.id !== data.messageId));
        }
        break;


        
      default:
        // Unknown message type
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && socketRef.current?.connected) {
      const messageData = {
        text: message.trim(),
        sender: userInfo.nickname,
        timestamp: Date.now()
      };
      
      socketRef.current.emit('send_message', messageData);
      setMessage("");
      
      // Add message to local state immediately to avoid duplication
      const localMessage = {
        id: Date.now() + Math.random(),
        text: message.trim(),
        sender: 'user',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        avatar: userInfo.avatar,
        timestamp: Date.now(),
        senderName: userInfo.nickname,
        isNew: true
      };
      setMessages(prev => [...prev, localMessage]);
      
      // Remove new message highlight after animation
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === localMessage.id ? { ...msg, isNew: false } : msg
        ));
      }, 600);
    }
  };

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load configuration and connect when component mounts
  useEffect(() => {
    const initializeConfig = async () => {
      const loadedConfig = await loadConfig();
      setConfig(loadedConfig);
      setMaxReconnectAttempts(loadedConfig.server.reconnectAttempts);
      setReconnectInterval(loadedConfig.server.reconnectInterval);
      setSoundEnabled(loadedConfig.ui.soundEnabled);
    };
    
    initializeConfig();
  }, []);

  // Connect to WebSocket when component mounts and config is loaded
  useEffect(() => {
    if (userInfo && config) {
      connectSocket();
    }
    
    return () => {
      // useEffect cleanup - closing socket
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [userInfo, config]);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu) {
        closeContextMenu();
      }

    };

    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('contextmenu', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('contextmenu', handleClickOutside);
    };
  }, [contextMenu]);



  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return '#28a745';
      case 'away': return '#ffc107';
      case 'offline': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getAvatarColor = (index) => {
    // All avatars should have exactly the same color as the SVG logo
    return '#408D89';
  };

  const formatMessageTime = (timestamp) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) { // 24 hours
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      return messageTime.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const playNotificationSound = () => {
    if (!soundEnabled) return;
    
    try {
      // Try to play custom MP3 sound first
      const audio = new Audio('/src/assets/sounds/notification.mp3');
      audio.volume = 0.2; // 20% volume
      audio.play().catch(() => {
        // If custom sound fails, fall back to generated sound
        playGeneratedSound();
      });
    } catch (error) {
      // Could not play custom sound, using generated sound
      playGeneratedSound();
    }
  };



  const playGeneratedSound = () => {
    try {
      // Create a simple notification sound using Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime); // 20% volume
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      // Could not play generated sound
    }
  };

  const filteredMessages = messages.filter(msg => 
    searchQuery === "" || msg.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // File handling functions
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const sendFile = async () => {
    if (!selectedFile || !socketRef.current?.connected) return;

    setIsUploading(true);
    
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result.split(',')[1];
        
        const fileMessage = {
          fileData: base64Data,
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          fileType: selectedFile.type,
          sender: userInfo.nickname,
          timestamp: Date.now()
        };
        
        socketRef.current.emit('send_file', fileMessage);
        setSelectedFile(null);
        setIsUploading(false);
        
        // Add file to local state immediately to avoid duplication
        const localFileMessage = {
          id: Date.now() + Math.random(),
          text: `📎 ${selectedFile.name}`,
          sender: 'user',
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          avatar: userInfo.avatar,
          timestamp: Date.now(),
          senderName: userInfo.nickname,
          isNew: true,
          isFile: true,
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          fileType: selectedFile.type,
          fileData: base64Data
        };
        setMessages(prev => [...prev, localFileMessage]);
        
        // Remove new message highlight after animation
        setTimeout(() => {
          setMessages(prev => prev.map(msg => 
            msg.id === localFileMessage.id ? { ...msg, isNew: false } : msg
          ));
        }, 600);
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error('Error sending file:', error);
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Message editing functions
  const startEditing = (message) => {
    if (message.sender === 'user' && !message.isFile) {
      setEditingMessage(message);
      setEditText(message.text);
    }
  };

  const cancelEditing = () => {
    setEditingMessage(null);
    setEditText("");
  };

  const saveEdit = () => {
    if (!editingMessage || !editText.trim()) return;

    // Send edit message to server
    if (socketRef.current?.connected) {
      const editMessage = {
        messageId: editingMessage.id,
        newText: editText.trim(),
        sender: userInfo.nickname,
        timestamp: Date.now()
      };
      socketRef.current.emit('edit_message', editMessage);
    }

    // Update local state immediately
    setMessages(prev => prev.map(msg => 
      msg.id === editingMessage.id 
        ? { ...msg, text: editText.trim(), isEdited: true }
        : msg
    ));

    cancelEditing();
  };

  const deleteMessage = (message) => {
    if (message.sender === 'user') {
      // Send delete message to server
      if (socketRef.current?.connected) {
        const deleteMessage = {
          messageId: message.id,
          sender: userInfo.nickname,
          timestamp: Date.now()
        };
        socketRef.current.emit('delete_message', deleteMessage);
      }

      // Update local state immediately
      setMessages(prev => prev.filter(msg => msg.id !== message.id));
    }
  };

  // Context menu functions
  const handleContextMenu = (e, message) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Show context menu for all messages (not just user's own)
    if (!message.isFile) {
      const menuWidth = 160; // min-width from CSS
      const menuHeight = 120; // approximate height
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      // Calculate position with boundary checks
      let x = e.clientX;
      let y = e.clientY;
      
      // Check right boundary
      if (x + menuWidth > windowWidth) {
        x = windowWidth - menuWidth - 10; // 10px margin
      }
      
      // Check bottom boundary
      if (y + menuHeight > windowHeight) {
        y = windowHeight - menuHeight - 10; // 10px margin
      }
      
      // Ensure minimum margins
      x = Math.max(10, x);
      y = Math.max(10, y);
      
      setContextMenu({
        x: x,
        y: y,
        message: message
      });
    }
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const handleContextMenuAction = (action, message) => {
    switch (action) {
      case 'edit':
        startEditing(message);
        break;
      case 'delete':
        deleteMessage(message);
        break;
      case 'copy':
        navigator.clipboard.writeText(message.text);
        break;
      
    }
    closeContextMenu();
  };





  return (
    <div className="chat-client">
      {/* Sidebar with users */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="user-info">
            <div className="user-avatar">
              <div className="avatar-circle" style={{ background: getAvatarColor(0) }}>
                <span>{userInfo?.avatar || "U"}</span>
              </div>
            </div>
            <div className="user-details">
              <span className="username">{userInfo?.name || "User"}</span>
              <span className={`status ${connectionStatus}`}>
                {connectionStatus === 'connected' && 'Online'}
                {connectionStatus === 'disconnected' && 'Offline'}
                {connectionStatus === 'reconnecting' && `Reconnecting... (${reconnectAttempts}/${maxReconnectAttempts})`}
                {connectionStatus === 'failed' && 'Connection Failed'}
                {connectionStatus === 'error' && 'Connection Error'}
              </span>
            </div>
          </div>
          <div className="header-actions">
            <button className="header-action-btn" onClick={() => setIsSettingsOpen(true)} title="Profile Settings">
              <svg width="24" height="24" viewBox="0 0 48 48" fill="currentColor">
                <path d="M 24 4 C 22.423103 4 20.902664 4.1994284 19.451172 4.5371094 A 1.50015 1.50015 0 0 0 18.300781 5.8359375 L 17.982422 8.7382812 C 17.878304 9.6893592 17.328913 10.530853 16.5 11.009766 C 15.672739 11.487724 14.66862 11.540667 13.792969 11.15625 L 13.791016 11.15625 L 11.125 9.9824219 A 1.50015 1.50015 0 0 0 9.4257812 10.330078 C 7.3532865 12.539588 5.7626807 15.215064 4.859375 18.201172 A 1.50015 1.50015 0 0 0 5.4082031 19.845703 L 7.7734375 21.580078 C 8.5457929 22.147918 9 23.042801 9 24 C 9 24.95771 8.5458041 25.853342 7.7734375 26.419922 L 5.4082031 28.152344 A 1.50015 1.50015 0 0 0 4.859375 29.796875 C 5.7625845 32.782665 7.3519262 35.460112 9.4257812 37.669922 A 1.50015 1.50015 0 0 0 11.125 38.015625 L 13.791016 36.841797 C 14.667094 36.456509 15.672169 36.511947 16.5 36.990234 C 17.328913 37.469147 17.878304 38.310641 17.982422 39.261719 L 18.300781 42.164062 A 1.50015 1.50015 0 0 0 19.449219 43.460938 C 20.901371 43.799844 22.423103 44 24 44 C 25.576897 44 27.097336 43.800572 28.548828 43.462891 A 1.50015 1.50015 0 0 0 29.699219 42.164062 L 30.017578 39.261719 C 30.121696 38.310641 30.671087 37.469147 31.5 36.990234 C 32.327261 36.512276 33.33138 36.45738 34.207031 36.841797 L 36.875 38.015625 A 1.50015 1.50015 0 0 0 38.574219 37.669922 C 40.646713 35.460412 42.237319 32.782983 43.140625 29.796875 A 1.50015 1.50015 0 0 0 42.591797 28.152344 L 40.226562 26.419922 C 39.454197 25.853342 39 24.95771 39 24 C 39 23.04229 39.454197 22.146658 40.226562 21.580078 L 42.591797 19.847656 A 1.50015 1.50015 0 0 0 43.140625 18.203125 C 42.237319 15.217017 40.646713 12.539588 38.574219 10.330078 A 1.50015 1.50015 0 0 0 36.875 9.984375 L 34.207031 11.158203 C 33.33138 11.54262 32.327261 11.487724 31.5 11.009766 C 30.671087 10.530853 30.121696 9.6893592 30.017578 8.7382812 L 29.699219 5.8359375 A 1.50015 1.50015 0 0 0 28.550781 4.5390625 C 27.098629 4.2001555 25.576897 4 24 4 z M 24 7 C 24.974302 7 25.90992 7.1748796 26.847656 7.3398438 L 27.035156 9.0644531 C 27.243038 10.963375 28.346913 12.652335 30 13.607422 C 31.654169 14.563134 33.668094 14.673009 35.416016 13.904297 L 37.001953 13.207031 C 38.219788 14.669402 39.183985 16.321182 39.857422 18.130859 L 38.451172 19.162109 C 36.911538 20.291529 36 22.08971 36 24 C 36 25.91029 36.911538 27.708471 38.451172 28.837891 L 39.857422 29.869141 C 39.183985 31.678818 38.219788 33.330598 37.001953 34.792969 L 35.416016 34.095703 C 33.668094 33.326991 31.654169 33.436866 30 34.392578 C 28.346913 35.347665 27.243038 37.036625 27.035156 38.935547 L 26.847656 40.660156 C 25.910002 40.82466 24.973817 41 24 41 C 23.025698 41 22.09008 40.82512 21.152344 40.660156 L 20.964844 38.935547 C 20.756962 37.036625 19.653087 35.347665 18 34.392578 C 16.345831 33.436866 14.331906 33.326991 12.583984 34.095703 L 10.998047 34.792969 C 9.7799772 33.330806 8.8159425 31.678964 8.1425781 29.869141 L 9.5488281 28.837891 C 11.088462 27.708471 12 25.91029 12 24 C 12 22.08971 11.087719 20.290363 9.5488281 19.160156 L 8.1425781 18.128906 C 8.8163325 16.318532 9.7814501 14.667839 11 13.205078 L 12.583984 13.902344 C 14.331906 14.671056 16.345831 14.563134 18 13.607422 C 19.653087 12.652335 20.756962 10.963375 20.964844 9.0644531 L 21.152344 7.3398438 C 22.089998 7.1753403 23.026183 7 24 7 z M 24 16 C 19.599487 16 16 19.59949 16 24 C 16 28.40051 19.599487 32 24 32 C 28.400513 32 32 28.40051 32 24 C 32 19.59949 28.400513 16 24 16 z M 24 19 C 26.779194 19 29 21.220808 29 24 C 29 26.779192 26.779194 29 24 29 C 21.220806 29 19 26.779192 19 24 C 19 21.220808 21.220806 19 24 19 z"></path>
              </svg>
            </button>
            <button className="logout-btn" onClick={onLogout} title="Sign out">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16,17 21,12 16,7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="users-list">
          <div className="users-section-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>Online Users</span>
          </div>
          {/* Current user */}
          {userInfo && (
            <div className="user-item current-user">
              <div className="user-avatar">
                <div className="user-avatar-circle" style={{ background: getAvatarColor(0) }}>
                  <span>{userInfo.avatar}</span>
                </div>
                <div className="status-indicator" style={{ backgroundColor: isConnected ? '#28a745' : '#dc3545' }}></div>
              </div>
              <div className="user-info">
                <div className="user-name">{userInfo.name}</div>
                <div className="user-status">{isConnected ? 'online' : 'offline'}</div>
            </div>
          </div>
          )}
          
          {/* Other users */}
          {users.map((user, index) => (
            <div key={user.id} className="user-item">
              <div className="user-avatar">
                <div className="user-avatar-circle" style={{ background: getAvatarColor(index + 1) }}>
                  <span>{user.avatar}</span>
                </div>
                <div className="status-indicator" style={{ backgroundColor: getStatusColor(user.status) }}></div>
              </div>
              <div className="user-info">
                <div className="user-name">{user.name}</div>
                <div className="user-status">{user.lastSeen}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main chat area */}
      <div className="chat-main">
        {/* Chat header */}
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="chat-header-avatar">
              <div className="chat-header-avatar-circle" style={{ background: getAvatarColor(0) }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
            </div>
            <div className="chat-header-details">
              <span className="chat-header-name">
                General Chat
              </span>
              <span className="chat-header-status">
                {users.length + 1} users online
              </span>
            </div>
          </div>
          <div className="chat-header-actions">
            <button 
              className={`header-action-btn ${!soundEnabled ? 'muted' : ''}`} 
              title={soundEnabled ? "Disable sound" : "Enable sound"}
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <line x1="23" y1="9" x2="17" y2="15"/>
                  <line x1="17" y1="9" x2="23" y2="15"/>
                </svg>
              )}
            </button>
            <button 
              className={`header-action-btn ${isSearchOpen ? 'active' : ''}`} 
              title="Search messages"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <svg width="24" height="24" viewBox="0 0 50 50" fill="currentColor">
                <path d="M 21 3 C 11.6 3 4 10.6 4 20 C 4 29.4 11.6 37 21 37 C 24.354553 37 27.47104 36.01984 30.103516 34.347656 L 42.378906 46.621094 L 46.621094 42.378906 L 34.523438 30.279297 C 36.695733 27.423994 38 23.870646 38 20 C 38 10.6 30.4 3 21 3 z M 21 7 C 28.2 7 34 12.8 34 20 C 34 27.2 28.2 33 21 33 C 13.8 33 8 27.2 8 20 C 8 12.8 13.8 7 21 7 z"></path>
              </svg>
            </button>
            {(connectionStatus === 'failed' || connectionStatus === 'error') && (
              <button 
                className="header-action-btn reconnect-btn" 
                title="Reconnect"
                onClick={() => {
                  setReconnectAttempts(0);
                  connectSocket();
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 4 23 10 17 10"/>
                  <polyline points="1 20 1 14 7 14"/>
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                </svg>
              </button>
            )}
            <button className="header-action-btn" title="Settings">
              <svg width="24" height="24" viewBox="0 0 48 48" fill="currentColor">
                <path d="M 24 4 C 22.423103 4 20.902664 4.1994284 19.451172 4.5371094 A 1.50015 1.50015 0 0 0 18.300781 5.8359375 L 17.982422 8.7382812 C 17.878304 9.6893592 17.328913 10.530853 16.5 11.009766 C 15.672739 11.487724 14.66862 11.540667 13.792969 11.15625 L 13.791016 11.15625 L 11.125 9.9824219 A 1.50015 1.50015 0 0 0 9.4257812 10.330078 C 7.3532865 12.539588 5.7626807 15.215064 4.859375 18.201172 A 1.50015 1.50015 0 0 0 5.4082031 19.845703 L 7.7734375 21.580078 C 8.5457929 22.147918 9 23.042801 9 24 C 9 24.95771 8.5458041 25.853342 7.7734375 26.419922 L 5.4082031 28.152344 A 1.50015 1.50015 0 0 0 4.859375 29.796875 C 5.7625845 32.782665 7.3519262 35.460112 9.4257812 37.669922 A 1.50015 1.50015 0 0 0 11.125 38.015625 L 13.791016 36.841797 C 14.667094 36.456509 15.672169 36.511947 16.5 36.990234 C 17.328913 37.469147 17.878304 38.310641 17.982422 39.261719 L 18.300781 42.164062 A 1.50015 1.50015 0 0 0 19.449219 43.460938 C 20.901371 43.799844 22.423103 44 24 44 C 25.576897 44 27.097336 43.800572 28.548828 43.462891 A 1.50015 1.50015 0 0 0 29.699219 42.164062 L 30.017578 39.261719 C 30.121696 38.310641 30.671087 37.469147 31.5 36.990234 C 32.327261 36.512276 33.33138 36.45738 34.207031 36.841797 L 36.875 38.015625 A 1.50015 1.50015 0 0 0 38.574219 37.669922 C 40.646713 35.460412 42.237319 32.782983 43.140625 29.796875 A 1.50015 1.50015 0 0 0 42.591797 28.152344 L 40.226562 26.419922 C 39.454197 25.853342 39 24.95771 39 24 C 39 23.04229 39.454197 22.146658 40.226562 21.580078 L 42.591797 19.847656 A 1.50015 1.50015 0 0 0 43.140625 18.203125 C 42.237319 15.217017 40.646713 12.539588 38.574219 10.330078 A 1.50015 1.50015 0 0 0 36.875 9.984375 L 34.207031 11.158203 C 33.33138 11.54262 32.327261 11.487724 31.5 11.009766 C 30.671087 10.530853 30.121696 9.6893592 30.017578 8.7382812 L 29.699219 5.8359375 A 1.50015 1.50015 0 0 0 28.550781 4.5390625 C 27.098629 4.2001555 25.576897 4 24 4 z M 24 7 C 24.974302 7 25.90992 7.1748796 26.847656 7.3398438 L 27.035156 9.0644531 C 27.243038 10.963375 28.346913 12.652335 30 13.607422 C 31.654169 14.563134 33.668094 14.673009 35.416016 13.904297 L 37.001953 13.207031 C 38.219788 14.669402 39.183985 16.321182 39.857422 18.130859 L 38.451172 19.162109 C 36.911538 20.291529 36 22.08971 36 24 C 36 25.91029 36.911538 27.708471 38.451172 28.837891 L 39.857422 29.869141 C 39.183985 31.678818 38.219788 33.330598 37.001953 34.792969 L 35.416016 34.095703 C 33.668094 33.326991 31.654169 33.436866 30 34.392578 C 28.346913 35.347665 27.243038 37.036625 27.035156 38.935547 L 26.847656 40.660156 C 25.910002 40.82466 24.973817 41 24 41 C 23.025698 41 22.09008 40.82512 21.152344 40.660156 L 20.964844 38.935547 C 20.756962 37.036625 19.653087 35.347665 18 34.392578 C 16.345831 33.436866 14.331906 33.326991 12.583984 34.095703 L 10.998047 34.792969 C 9.7799772 33.330806 8.8159425 31.678964 8.1425781 29.869141 L 9.5488281 28.837891 C 11.088462 27.708471 12 25.91029 12 24 C 12 22.08971 11.087719 20.290363 9.5488281 19.160156 L 8.1425781 18.128906 C 8.8163325 16.318532 9.7814501 14.667839 11 13.205078 L 12.583984 13.902344 C 14.331906 14.671056 16.345831 14.563134 18 13.607422 C 19.653087 12.652335 20.756962 10.963375 20.964844 9.0644531 L 21.152344 7.3398438 C 22.089998 7.1753403 23.026183 7 24 7 z M 24 16 C 19.599487 16 16 19.59949 16 24 C 16 28.40051 19.599487 32 24 32 C 28.400513 32 32 28.40051 32 24 C 32 19.59949 28.400513 16 24 16 z M 24 19 C 26.779194 19 29 21.220808 29 24 C 29 26.779192 26.779194 29 24 29 C 21.220806 29 19 26.779192 19 24 C 19 21.220808 21.220806 19 24 19 z"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Search bar */}
        {isSearchOpen && (
          <div className="search-bar">
            <div className="search-input-container">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                autoFocus
              />
              {searchQuery && (
                <button 
                  className="clear-search-btn"
                  onClick={() => setSearchQuery("")}
                  title="Clear search"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>
            {searchQuery && (
              <div className="search-results-info">
                {filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''} found
              </div>
            )}
          </div>
        )}

        {/* Messages area */}
        <div className="messages-area">
          <div className="messages-container">
            {filteredMessages.map((msg) => (
              <div 
                key={msg.id} 
                className={`message ${msg.sender === 'user' ? 'user-message' : msg.sender === 'system' ? 'system-message' : 'other-message'} ${msg.isNew ? 'new-message' : ''}`}
                onContextMenu={(e) => handleContextMenu(e, msg)}
              >
                {(msg.sender === 'system' || msg.sender === 'other') && (
                  <div className="message-avatar">
                    <div className="message-avatar-circle" style={{ background: getAvatarColor(0) }}>
                      <span>{msg.avatar}</span>
                    </div>
                  </div>
                )}
                <div className="message-content">
                  {editingMessage && editingMessage.id === msg.id ? (
                    // Edit mode
                    <div className="edit-message-container">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="edit-message-input"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            saveEdit();
                          } else if (e.key === 'Escape') {
                            cancelEditing();
                          }
                        }}
                      />
                      <div className="edit-actions">
                        <button className="edit-save-btn" onClick={saveEdit} title="Save">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20,6 9,17 4,12"/>
                          </svg>
                          <span>Save</span>
                        </button>
                        <button className="edit-cancel-btn" onClick={cancelEditing} title="Cancel">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {msg.isFile ? (
                        <div className="file-message">
                          <div className="file-info">
                            <div className="file-icon">
                              {msg.fileType.startsWith('image/') ? '🖼️' : '📎'}
                            </div>
                            <div className="file-details">
                              <div className="file-name">{msg.fileName}</div>
                              <div className="file-size">{msg.fileSize}</div>
                            </div>
                          </div>
                          <button 
                            className="download-btn"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = `data:application/octet-stream;base64,${msg.fileData}`;
                              link.download = msg.fileName;
                              link.click();
                            }}
                          >
                            Download
                          </button>
                        </div>
                      ) : (
                        <div className="message-text">
                          {msg.text}
                          {msg.isEdited && <span className="edited-indicator"> (edited)</span>}
                        </div>
                      )}
                      <div className="message-time">{formatMessageTime(msg.timestamp)}</div>
                      

                    </>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message input field */}
        <div className="message-input-container">
          {/* Selected file preview */}
          {selectedFile && (
            <div className="file-preview">
              <div className="file-preview-info">
                <div className="file-preview-icon">
                  {selectedFile.type.startsWith('image/') ? '🖼️' : '📎'}
                </div>
                <div className="file-preview-details">
                  <div className="file-preview-name">{selectedFile.name}</div>
                  <div className="file-preview-size">{formatFileSize(selectedFile.size)}</div>
                </div>
              </div>
              <div className="file-preview-actions">
                <button 
                  className="file-preview-btn send-file-btn"
                  onClick={sendFile}
                  disabled={isUploading}
                >
                  {isUploading ? 'Sending...' : 'Send'}
                </button>
                <button 
                  className="file-preview-btn cancel-file-btn"
                  onClick={() => setSelectedFile(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          

          
          <form onSubmit={handleSendMessage} className="message-input-form">
            <div className="message-input-wrapper">
              <input
                type="file"
                id="file-input"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                accept="*/*"
              />
              <label htmlFor="file-input" className="file-input-btn" title="Attach file">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.49"/>
                </svg>
              </label>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter message..."
                className="message-input"
              />
              <button type="submit" className="send-button" disabled={!message.trim()}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22,2 15,22 11,13 2,9"/>
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Settings Menu */}
      <SettingsMenu 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        userInfo={userInfo}
      />

      {/* Context Menu */}
      {contextMenu && (
        <div 
          className="context-menu"
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            zIndex: 1000
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="context-menu-item" onClick={() => handleContextMenuAction('edit', contextMenu.message)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            <span>Edit</span>
          </div>
          <div className="context-menu-item" onClick={() => handleContextMenuAction('copy', contextMenu.message)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            <span>Copy</span>
          </div>
          
          {contextMenu.message.sender === 'user' && (
            <div className="context-menu-item delete" onClick={() => handleContextMenuAction('delete', contextMenu.message)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3,6 5,6 21,6"/>
                <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
              <span>Delete</span>
            </div>
          )}
        </div>
      )}


    </div>
  );
}

export default ChatClient;

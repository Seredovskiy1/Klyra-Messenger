import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import "./AuthWindow.css";
import klyraLogo from "../assets/klyra-logo.svg";

function AuthWindow({ onAuthenticate }) {
  const [mode, setMode] = useState("connect"); // "connect" or "create"
  const [serverAddress, setServerAddress] = useState("");
  const [nickname, setNickname] = useState("");
  const [serverName, setServerName] = useState("");
  const [serverPort, setServerPort] = useState("8080");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleConnect = async (e) => {
    e.preventDefault();
    
    setIsConnecting(true);
    
    // Simulate connection delay
    setTimeout(() => {
      setIsConnecting(false);
      
      // Create user data (fields can be empty)
      const userData = {
        id: 1,
        name: nickname.trim() || "User",
        nickname: nickname.trim() || "user_" + Math.random().toString(36).substr(2, 9),
        serverAddress: serverAddress.trim() || "localhost",
        status: "online",
        avatar: (nickname.trim() || "U").charAt(0).toUpperCase(),
        isServerOwner: false
      };
      
      onAuthenticate(userData);
    }, 1000);
  };

  const handleCreateServer = async (e) => {
    e.preventDefault();
    
    setIsCreating(true);
    
    try {
      // Start the chat server
      const result = await invoke("start_chat_server", {
        port: parseInt(serverPort) || 8080,
        serverName: serverName.trim() || "My Chat Server"
      });
      
      // Server started (no logging for anonymity)
      
      // Create user data for server owner
      const userData = {
        id: 1,
        name: nickname.trim() || "Server Owner",
        nickname: nickname.trim() || "owner_" + Math.random().toString(36).substr(2, 9),
        serverAddress: "localhost:" + serverPort,
        serverName: serverName.trim() || "My Chat Server",
        serverPort: parseInt(serverPort) || 8080,
        status: "online",
        avatar: (nickname.trim() || "O").charAt(0).toUpperCase(),
        isServerOwner: true
      };
      
      onAuthenticate(userData);
    } catch (error) {
      console.error("Failed to start server:", error);
      alert("Failed to start server: " + error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-window">
        {/* Logo */}
        <div className="logo-container">
          <div className="logo">
            <img src={klyraLogo} alt="Klyra" className="logo-image" />
          </div>
        </div>

        {/* Mode selector */}
        <div className="mode-selector">
          <button 
            className={`mode-btn ${mode === "connect" ? "active" : ""}`}
            onClick={() => setMode("connect")}
            disabled={isConnecting || isCreating}
          >
            Connect to Server
          </button>
          <button 
            className={`mode-btn ${mode === "create" ? "active" : ""}`}
            onClick={() => setMode("create")}
            disabled={isConnecting || isCreating}
          >
            Create Server
          </button>
        </div>

        {/* Authorization form */}
        <form className="auth-form" onSubmit={mode === "connect" ? handleConnect : handleCreateServer}>
          <h2>{mode === "connect" ? "Connect to Chat" : "Create Chat Server"}</h2>
          
          {mode === "connect" ? (
            <>
              <div className="input-group">
                <label htmlFor="server-address">Server IP address or domain:</label>
                <input
                  id="server-address"
                  type="text"
                  value={serverAddress}
                  onChange={(e) => setServerAddress(e.target.value)}
                  placeholder="e.g., 192.168.1.100 or chat.example.com"
                  disabled={isConnecting}
                  autoComplete="off"
                />
              </div>
            </>
          ) : (
            <>
              <div className="input-group">
                <label htmlFor="server-name">Server name:</label>
                <input
                  id="server-name"
                  type="text"
                  value={serverName}
                  onChange={(e) => setServerName(e.target.value)}
                  placeholder="e.g., My Chat Server"
                  disabled={isCreating}
                  autoComplete="off"
                />
              </div>
              
              <div className="input-group">
                <label htmlFor="server-port">Server port:</label>
                <input
                  id="server-port"
                  type="number"
                  value={serverPort}
                  onChange={(e) => setServerPort(e.target.value)}
                  placeholder="8080"
                  min="1024"
                  max="65535"
                  disabled={isCreating}
                  autoComplete="off"
                />
              </div>
            </>
          )}

          <div className="input-group">
            <label htmlFor="nickname">Your nickname:</label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Enter your nickname"
              disabled={isConnecting || isCreating}
              autoComplete="off"
            />
          </div>
          
          <button 
            type="submit" 
            className="connect-btn"
            disabled={isConnecting || isCreating}
          >
            {mode === "connect" 
              ? (isConnecting ? "Connecting..." : "Sign In")
              : (isCreating ? "Creating Server..." : "Create Server")
            }
          </button>
        </form>

        {/* Information */}
        <div className="info-text">
          <p>
            {mode === "connect" 
              ? "Enter server data and nickname to connect to the chat"
              : "Create your own local chat server and invite others to join"
            }
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthWindow;

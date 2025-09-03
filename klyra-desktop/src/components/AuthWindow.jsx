import { useState } from "react";
import "./AuthWindow.css";
import klyraLogo from "../assets/klyra-logo.svg";

function AuthWindow({ onAuthenticate }) {
  const [nickname, setNickname] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async (e) => {
    e.preventDefault();
    
    setIsConnecting(true);
    
    // Simulate connection delay
    setTimeout(() => {
      setIsConnecting(false);
      
      // Create user data
      const userData = {
        id: Date.now(),
        name: nickname.trim() || "User",
        nickname: nickname.trim() || "user_" + Math.random().toString(36).substr(2, 9),
        status: "online",
        avatar: (nickname.trim() || "U").charAt(0).toUpperCase()
      };
      
      onAuthenticate(userData);
    }, 1000);
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

        {/* Authorization form */}
        <form className="auth-form" onSubmit={handleConnect}>
          <h2>Join Chat</h2>
          
          <div className="input-group">
            <label htmlFor="nickname">Your nickname:</label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Enter your nickname"
              disabled={isConnecting}
              autoComplete="off"
            />
          </div>
          
          <button 
            type="submit" 
            className="connect-btn"
            disabled={isConnecting}
          >
            {isConnecting ? "Connecting..." : "Join Chat"}
          </button>
        </form>

        {/* Information */}
        <div className="info-text">
          <p>
            Enter your nickname to join the chat
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthWindow;

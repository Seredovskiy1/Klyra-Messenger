import { useState } from "react";
import AuthWindow from "./components/AuthWindow";
import ChatClient from "./components/ChatClient";
import CustomTitleBar from "./components/CustomTitleBar";
import GlobalContextMenu from "./components/GlobalContextMenu";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  const handleAuthentication = (userData) => {
    setUserInfo(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserInfo(null);
  };

  return (
    <div className="App">
      <CustomTitleBar />
      {isAuthenticated ? (
        <ChatClient userInfo={userInfo} onLogout={handleLogout} />
      ) : (
        <AuthWindow onAuthenticate={handleAuthentication} />
      )}
      <GlobalContextMenu />
    </div>
  );
}

export default App;

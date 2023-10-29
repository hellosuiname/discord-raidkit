import React, { useState, useEffect } from "react";

import Navbar from "./components/NavBar/NavBar";
import PageBackgroundHandler from "./components/PageBackgroundHandler/PageBackgroundHandler";
import ConnectionStatus from "./components/ConnectionStatus/ConnectionStatus";
import Main from "./Main";
import { useWebSocketContext } from "./contexts/WebSocketContext";

function App() {
  const { connectionStatus, setConnectionStatus } = useWebSocketContext();
  const [reconnectTime, setReconnectTime] = useState(10);

  useEffect(() => {
    if (connectionStatus === "disconnected") {
      setReconnectTime(10);
      const reconnectInterval = setInterval(() => {
        setReconnectTime((prevTime) => {
          if (prevTime > 1) {
            return prevTime - 1;
          } else {
            clearInterval(reconnectInterval);
            setConnectionStatus("connecting");
            return prevTime;
          }
        });
      }, 1000);

      return () => clearInterval(reconnectInterval);
    }
  }, [connectionStatus, setConnectionStatus]);

  if (
    connectionStatus === "connecting" ||
    connectionStatus === "disconnected"
  ) {
    return (
      <ConnectionStatus
        status={connectionStatus}
        reconnectTime={reconnectTime}
      />
    );
  }

  return (
    <div className="App">
      <Navbar />
      <Main />
      <PageBackgroundHandler />
    </div>
  );
}

export default App;

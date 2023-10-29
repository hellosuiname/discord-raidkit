import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { useDiscordContext } from "./DiscordContext";

const CONNECTING = "connecting";
const CONNECTED = "connected";
const DISCONNECTED = "disconnected";
const PING = "ping";
const PONG = "pong";
const LOGIN = "login";
const NUKE = "nuke";
const INACTIVE = 0;
const PENDING = 1;
const SUCCESS = 2;
const FAILED = 3;

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const [websocket, setWebsocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(CONNECTING);
  const { setAccounts, deactivateLogin, deactivateNuke } = useDiscordContext();

  const handleLoginResponse = useCallback(
    (status, id) => {
      setAccounts((prevAccounts) =>
        prevAccounts.map((account) =>
          account.account_id === id
            ? { ...account, login_status: status }
            : account
        )
      );

      if (status === SUCCESS || status === FAILED) {
        deactivateLogin(id);
      }
    },
    [setAccounts, deactivateLogin]
  );

  const handleNukeResponse = useCallback(
    (status, id) => {
      setAccounts((prevAccounts) =>
        prevAccounts.map((account) =>
          account.account_id === id
            ? { ...account, nuke_status: status }
            : account
        )
      );

      if (status === SUCCESS || status === FAILED) {
        deactivateNuke(id);
      }
    },
    [setAccounts, deactivateNuke]
  );

  useEffect(() => {
    if (connectionStatus === CONNECTING) {
      const ws = new WebSocket("ws://localhost:8765");

      ws.onopen = () => {
        setConnectionStatus(CONNECTED);
        setWebsocket(ws);
      };

      ws.onclose = () => {
        setConnectionStatus(DISCONNECTED);
        setWebsocket(null);
      };

      ws.onerror = () => {
        setConnectionStatus(DISCONNECTED);
      };

      let timeout;

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.action === PONG) {
            clearTimeout(timeout);
            return;
          } else if (data.action === LOGIN) {
            handleLoginResponse(data.status, data.id);
            return;
          } else if (data.action === NUKE) {
            handleNukeResponse(data.status, data.id);
            return;
          }
        } catch (error) {
          console.error("Failed to parse websocket message:", error);
        }
      };

      if (connectionStatus === CONNECTED && websocket) {
        const pingInterval = setInterval(() => {
          try {
            websocket.send(JSON.stringify({ action: PING }));

            timeout = setTimeout(() => {
              setConnectionStatus(DISCONNECTED);
            }, 5000);
          } catch (error) {
            clearInterval(pingInterval);
          }
        }, 10000);

        return () => {
          clearInterval(pingInterval);
        };
      }
    }
  }, [connectionStatus, websocket, handleLoginResponse, handleNukeResponse]);

  return (
    <WebSocketContext.Provider
      value={{
        websocket,
        connectionStatus,
        setConnectionStatus,
        INACTIVE,
        PENDING,
        SUCCESS,
        FAILED,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error(
      "useWebSocketContext must be used within a WebSocketProvider"
    );
  }
  return context;
};

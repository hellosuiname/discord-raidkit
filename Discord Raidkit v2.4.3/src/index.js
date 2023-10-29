import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { WebSocketProvider } from "./contexts/WebSocketContext";
import { DiscordProvider } from "./contexts/DiscordContext";
import { ProxyProvider } from "./contexts/ProxyContext";

import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ProxyProvider>
    <DiscordProvider>
      <WebSocketProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </WebSocketProvider>
    </DiscordProvider>
  </ProxyProvider>
);

import React, { useState, useEffect, createContext, useContext } from "react";
import axios from "axios";

const ProxyContext = createContext();

export const ProxyProvider = ({ children }) => {
  const [proxies, setProxies] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8080/proxies/get-proxies").then((response) => {
      setProxies(response.data);

      /*const activeProxy = response.data.find(
        (proxy) => proxy.proxy_status === 1
      );

      if (activeProxy) {
        axios.put("/api/internal/set-active-proxy", {
          ProxyID: activeProxy.proxy_id,
          ProxyHost: activeProxy.proxy_host,
          ProxyProtocol: activeProxy.proxy_protocol,
          ProxyPort: activeProxy.proxy_port,
          ProxyStatus: 1,
          ProxyUsername: activeProxy.proxy_username,
          ProxyPassword: activeProxy.proxy_password,
        });
      } else {
        axios.put("/api/internal/set-active-proxy", {
          ProxyID: null,
        });
      }*/
    });
  }, []);

  return (
    <ProxyContext.Provider
      value={{
        proxies,
        setProxies,
      }}
    >
      {children}
    </ProxyContext.Provider>
  );
};

export const useProxyContext = () => {
  const context = useContext(ProxyContext);
  if (!context) {
    throw new Error("useProxyContext must be used within a ProxyProvider");
  }
  return context;
};

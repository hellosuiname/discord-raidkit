import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

const PageBackgroundHandler = () => {
  const location = useLocation();

  useEffect(() => {
    switch (location.pathname) {
      case "/":
        document.body.classList.remove("botsBackground");
        document.body.classList.remove("serversBackground");
        document.body.classList.remove("accountsBackground");
        document.body.classList.add("overviewBackground");
        break;
      case "/bots":
        document.body.classList.remove("overviewBackground");
        document.body.classList.remove("serversBackground");
        document.body.classList.remove("accountsBackground");
        document.body.classList.add("botsBackground");
        break;
      case "/servers":
        document.body.classList.remove("overviewBackground");
        document.body.classList.remove("botsBackground");
        document.body.classList.remove("accountsBackground");
        document.body.classList.add("serversBackground");
        break;
      case "/accounts":
        document.body.classList.remove("overviewBackground");
        document.body.classList.remove("botsBackground");
        document.body.classList.remove("serversBackground");
        document.body.classList.add("accountsBackground");
        break;
      default:
        document.body.classList.remove("overviewBackground");
        document.body.classList.remove("botsBackground");
        document.body.classList.remove("serversBackground");
        document.body.classList.remove("accountsBackground");
        break;
    }

    return () => {
      document.body.classList.remove("overviewBackground");
    };
  }, [location.pathname]);

  return <></>;
};

export default PageBackgroundHandler;

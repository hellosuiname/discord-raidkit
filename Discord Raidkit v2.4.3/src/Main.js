import React from "react";
import { Routes, Route } from "react-router-dom";

import Overview from "./pages/overview/Overview";
import Bots from "./pages/bots/Bots";
import Accounts from "./pages/accounts/Accounts";
import Proxies from "./pages/proxies/Proxies";

const Main = () => {

  return (
    <Routes>
      <Route path="/" element={<Overview />} />
      <Route path="/bots" element={<Bots />} />
      <Route path="/accounts" element={<Accounts />} />
      <Route path="/proxies" element={<Proxies />} />
    </Routes>
  );
};

export default Main;

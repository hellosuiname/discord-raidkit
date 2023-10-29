import sharedStyles from "../sharedStyles.module.css";

import React from "react";

import WelcomeBox from "./components/WelcomeBox/WelcomeBox";
import CommandsBox from "./components/CommandsBox/CommandsBox";
import AccountsBox from "./components/AccountsBox/AccountsBox";

const Overview = () => {
  return (
    <>
      <div className={sharedStyles.container}>
        <WelcomeBox />
      </div>
      <div className={sharedStyles.container}>
        <CommandsBox />
      </div>
      <div className={sharedStyles.container}>
        <AccountsBox />
      </div>
    </>
  );
};

export default Overview;

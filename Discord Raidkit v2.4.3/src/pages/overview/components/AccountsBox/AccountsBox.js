import styles from "../../Overview.module.css";

import React from "react";

const AccountsBox = () => {
  return (
    <div className={`${styles.box} ${styles.accountsBox}`}>
      <h1 className="mb-4">Account Commands</h1>
      <p className="px-4 mb-4">
        As well servers, the Discord Raidkit allows you to attack and track
        Discord Accounts. You can...
      </p>
      <ul>
        <li>
          Keep a record of Discord Accounts and view their information on the
          fly.
        </li>
        <li>Log into a Discord account without credentials.</li>
        <li>
          Nuke a Discord account, flooding it with servers and isolating it from
          friends.
        </li>
      </ul>
    </div>
  );
};

export default AccountsBox;

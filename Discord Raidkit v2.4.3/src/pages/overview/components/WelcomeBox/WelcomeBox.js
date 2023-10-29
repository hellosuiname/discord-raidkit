import styles from "../../Overview.module.css";

import React from "react";
import { Link } from "react-router-dom";
import { Tooltip } from "react-tooltip";

import { useDiscordContext } from "../../../../contexts/DiscordContext";

const WelcomeBox = () => {
  const { isAnyBotOn, BOT_OFF_PAGE_MSG } = useDiscordContext();

  return (
    <div className={`${styles.box} ${styles.welcomeBox}`}>
      <h1 className="mb-4">Welcome</h1>
      <strong>
        <p className="px-4">
          Welcome to the Discord Raidkit Front-End experience!
        </p>
      </strong>
      <p className="px-4 mb-4">
        In this new, fancier rendition of the Discord Raidkit application, there
        are many powerful features. You can...
      </p>
      <ul>
        <li>
          Manage and run different Discord bots via the{" "}
          <Link to="/bots">bots page</Link>.
        </li>
        <li>
          {isAnyBotOn ? (
            <>
              Attack and view information on every server a running bot is in
              via the <Link to="/servers">servers page</Link>.
            </>
          ) : (
            <>
              Attack and view information on every server a running bot is in
              via the{" "}
              <span
                data-tooltip-id={"bot-off-welcome-servers-link-tooltip"}
                data-tooltip-content={BOT_OFF_PAGE_MSG}
                style={{ color: "gray", cursor: "pointer" }}
              >
                servers page
              </span>
              .
              <Tooltip id="bot-off-welcome-servers-link-tooltip" />
            </>
          )}
        </li>
        <li>
          Attack and keep track of Discord accounts by storing authentication
          tokens via the <Link to="/accounts">accounts page</Link> -{" "}
          <em>includes proxy configuration!</em>
        </li>
      </ul>
    </div>
  );
};

export default WelcomeBox;

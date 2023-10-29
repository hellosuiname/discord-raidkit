import styles from "./NavBar.module.css";

import React from "react";
import { Link } from "react-router-dom";
import { Tooltip } from "react-tooltip";

import { useDiscordContext } from "../../contexts/DiscordContext";

const Navbar = () => {
  const { isAnyBotOn, BOT_OFF_PAGE_MSG } = useDiscordContext();

  return (
    <nav
      className={`navbar navbar-expand-lg navbar-light bg-light sticky-top ${styles["navbar-container"]}`}
    >
      <div className={`container ${styles.NavbarContainer}`}>
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img
            src="nav-icon-light.png"
            alt="Logo"
            height="40"
            width="40"
            className="mr-2"
          />
          Discord Raidkit
        </Link>

        <div
          className="collapse navbar-collapse justify-content-center"
          id="navbarNav"
        >
          <ul className="navbar-nav">
            <li className={`nav-item ${styles.NavbarLi}`}>
              <Link className="nav-link" to="/bots">
                Bots
              </Link>
            </li>
            <li className={`nav-item ${styles.NavbarLi}`}>
              <div
                data-tooltip-id={
                  !isAnyBotOn ? "bot-off-servers-nav-tooltip" : ""
                }
                data-tooltip-content={BOT_OFF_PAGE_MSG}
              >
                <Link
                  className={`nav-link ${!isAnyBotOn ? "disabled" : ""}`}
                  to="/servers"
                >
                  Servers
                </Link>
              </div>
            </li>
            <li className={`nav-item ${styles.NavbarLi}`}>
              <div>
                <Link className="nav-link" to="/accounts">
                  Accounts
                </Link>
              </div>
            </li>
            <li className={`nav-item ${styles.NavbarLi}`}>
              <div>
                <Link className="nav-link" to="/proxies">
                  Proxies
                </Link>
              </div>
            </li>
          </ul>
        </div>
        <Tooltip id="bot-off-servers-nav-tooltip" />
      </div>
    </nav>
  );
};

export default Navbar;

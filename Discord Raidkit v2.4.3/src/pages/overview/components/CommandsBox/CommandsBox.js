import styles from "../../Overview.module.css";

import React from "react";

const CommandBox = () => {
  return (
    <div className={`${styles.box} ${styles.commandsBox}`}>
      <h1 className="mb-4">Server Commands</h1>
      <p className="px-4 mb-4">
        The Discord Raidkit provides a handful of high-speed, destructive
        commands for attacking servers remotely. You can...
      </p>
      <ul>
        <li>
          <strong>Mass nickname</strong> members in a server.
        </li>
        <li>
          <strong>Mass message</strong> members in a server.
        </li>
        <li>
          <strong>Spam</strong> every channel in a server.
        </li>
        <li>
          <strong>Purge</strong> every channel in a server.
        </li>
        <li>
          <strong>Flood</strong> a server with new channels.
        </li>
        <li>
          Grant members <strong>administrator</strong> in a server.
        </li>
        <li>
          <strong>Raid a server</strong> - purge, spam, nick, role, and more!
        </li>
        <li>
          <strong>Nuke a server</strong> - I am become death; destroyer of
          worlds.
        </li>
      </ul>
    </div>
  );
};

export default CommandBox;

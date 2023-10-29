import React from "react";
import { CircleLoader } from "react-spinners";

const ConnectionStatus = ({ status, reconnectTime }) => {
  let message;

  if (status === "connecting") {
    message = "Attempting to connect to the Discord Raidkit WebSocket...";
  } else if (status === "disconnected") {
    message = (
      <>
        <p>Could not connect to the Discord Raidkit WebSocket.</p>
        <p>Attempting reconnect in {reconnectTime} seconds...</p>
      </>
    );
  } else {
    return null;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <CircleLoader color={"blue"} />
      <div style={{ marginTop: "20px", textAlign: "center" }}>{message}</div>
    </div>
  );
};

export default ConnectionStatus;

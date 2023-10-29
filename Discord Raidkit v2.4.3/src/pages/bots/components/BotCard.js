import React, { useState, useEffect } from "react";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCopy,
  faCog,
  faTrashAlt,
  faToggleOff,
  faToggleOn,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./BotCard.module.css";
import sharedStyles from "../../sharedStyles.module.css";
import { useDiscordContext } from "../../../contexts/DiscordContext";
import { Tooltip } from "react-tooltip";

const BotCard = ({ bot }) => {
  const [botDetails, setBotDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const { setBots } = useDiscordContext();

  const handleDeleteClick = async () => {
    if (bot.is_on) {
      return;
    }
    const { value: isConfirmed } = await Swal.fire({
      title: "Remove Bot",
      icon: "warning",
      html: "<p>Are you sure you want to remove this bot?</p><p><strong><u>This action is not reversable!</u></strong></p>",
      showCancelButton: true,
      confirmButtonColor: "#EF233C",
      cancelButtonColor: "#6FB2CD",
      confirmButtonText: "Remove",
    });
    if (isConfirmed) {
      axios
        .delete(`http://localhost:8080/bots/delete-bot/${bot.bot_id}`)
        .then((response) => {
          setBots(response.data);
        })
        .catch((error) => {
          console.error("Error deleting bot:", error);
        });
    }
  };

  const handleEditClick = async () => {
    if (bot.is_on) {
      return;
    }
    const { value: token, isConfirmed } = await Swal.fire({
      title: "Enter a new bot token",
      input: "text",
      showCancelButton: true,
      confirmButtonColor: "#6FB2CD",
      cancelButtonColor: "#CB67BC",
      inputValidator: (value) => {
        if (!value) {
          return "You need to enter a bot token!";
        }
      },
    });

    if (isConfirmed && token) {
      axios
        .put("http://localhost:8080/bots/update-bot", { BotID: bot.bot_id, BotToken: token })
        .then((response) => {
          const updatedBot = response.data[0];
          setBots((prevBots) =>
            prevBots.map((b) =>
              b.bot_id === updatedBot.bot_id
                ? {
                    ...b,
                    bot_token: updatedBot.bot_token,
                    bot_status: updatedBot.bot_status,
                  }
                : b
            )
          );
        })
        .catch((error) => {
          console.error("Error updating bot:", error);
        });
    }
  };

  const handleTurnOffClick = () => {
    console.log("Turn off clicked");
  };

  const handleTurnOnClick = () => {
    console.log("Turn on clicked");
  };

  useEffect(() => {
    if (bot?.bot_token) {
      setLoading(true);
      axios
        .get(`/api/discord/users/@me`, {
          headers: {
            Authorization: `Bot ${bot.bot_token}`,
            "User-Agent": "Discord Bot",
          },
        })
        .then((response) => {
          setBotDetails(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching bot details:", error);
          setBotDetails(null);
          setLoading(false);
        });
    }
  }, [bot.bot_token]);

  let content;

  if (loading) {
    content = <ClipLoader />;
  } else if (!bot) {
    content = <p>Bot not found.</p>;
  } else if (!botDetails) {
    content = <p>Error loading bot details.</p>;
  } else {
    content = (
      <>
        <img
          src={
            botDetails.avatar
              ? `https://cdn.discordapp.com/avatars/${botDetails.id}/${botDetails.avatar}.png`
              : "./Questionable Integral.svg"
          }
          alt=""
          className={styles.avatar}
        />
        <h2 className={styles.name}>{botDetails.username}</h2>

        {botDetails && (
          <div className={styles.tokenContainer}>
            <div
              className={styles.tokenBox}
              onClick={() =>
                setBotDetails((prev) => ({
                  ...prev,
                  showToken: !prev.showToken,
                }))
              }
            >
              {botDetails.showToken ? bot.bot_token : "Reveal Token"}
            </div>
            <FontAwesomeIcon
              icon={faCopy}
              className={styles.copyBtn}
              onClick={() => navigator.clipboard.writeText(bot.bot_token)}
              data-tooltip-id="copy-tooltip"
              data-tooltip-content="Copy Token"
            />
          </div>
        )}

        {bot?.bot_status === 1 && (
          <FontAwesomeIcon
            icon={faToggleOn}
            className={`${styles.onBtn} ${styles.on}`}
            onClick={handleTurnOffClick}
            data-tooltip-id="switch-tooltip"
            data-tooltip-content="Turn Bot Off"
          />
        )}

        {bot?.bot_status === 0 && (
          <FontAwesomeIcon
            icon={faToggleOff}
            className={`${styles.onBtn} ${styles.off}`}
            onClick={handleTurnOnClick}
            data-tooltip-id="switch-tooltip"
            data-tooltip-content="Turn Bot On"
          />
        )}

        {bot?.bot_status === 2 && (
          <FontAwesomeIcon
            icon={faSpinner}
            className={`${styles.onBtn} ${styles.pending}`}
            data-tooltip-id="switch-tooltip"
            data-tooltip-content="Turning on..."
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className={sharedStyles.container}>
        <div className={styles.card}>
          {content}

          <FontAwesomeIcon
            icon={faCog}
            className={styles.editBtn}
            onClick={handleEditClick}
            data-tooltip-id="edit-tooltip"
            data-tooltip-content="Edit Bot"
          />
          <FontAwesomeIcon
            icon={faTrashAlt}
            className={styles.deleteBtn}
            onClick={handleDeleteClick}
            data-tooltip-id="delete-tooltip"
            data-tooltip-content="Remove Bot"
          />
        </div>
      </div>
      <Tooltip id="edit-tooltip" delayShow={100} />
      <Tooltip id="delete-tooltip" delayShow={100} />
      <Tooltip id="copy-tooltip" delayShow={100} />
      <Tooltip id="switch-tooltip" delayShow={100} />
    </>
  );
};

export default BotCard;

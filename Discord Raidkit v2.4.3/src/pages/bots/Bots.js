import styles from "./Bots.module.css";

import React, { useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";

import { useDiscordContext } from "../../contexts/DiscordContext";
import BotCard from "./components/BotCard";
import axios from "axios";
import { Tooltip } from "react-tooltip";

const Bots = () => {
  const isInitialRender = useRef(true);
  const { bots, setBots } = useDiscordContext();

  useEffect(() => {
    async function fetchBots() {
      try {
        const response = await axios.get("http://localhost:8080/bots/get-bots");
        setBots(response.data);
      } catch (error) {
        console.log("Error fetching bots: ", error);
      }
    }
    if (isInitialRender.current) {
      fetchBots();
      isInitialRender.current = false;
      return;
    }
  });

  const handleAddBot = async () => {
    const { value: token, isConfirmed } = await Swal.fire({
      title: "Enter a bot token",
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
        .post(
          "http://localhost:8080/bots/add-bot",
          { BotToken: token },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
        .then((response) => {
          const newBot = response.data[0];
          setBots((prevBots) => [...prevBots, newBot]);
        });
    }
  };

  return (
    <>
      <div>
        <div className={styles.iconWrapper}>
          <FontAwesomeIcon
            icon={faPlusCircle}
            className={styles.icon}
            onClick={handleAddBot}
            data-tooltip-id="add-bot-tooltip"
            data-tooltip-content="Add Bot"
          />
        </div>
        <div>
          {bots.length > 0 ? (
            bots.map((bot) => <BotCard key={bot.bot_id} bot={bot} />)
          ) : (
            <div className={styles.noBotsDiv}>
              <h2>No bots added.</h2>
              <p>Use the plus icon in the right-hand corner to add new bots.</p>
            </div>
          )}
        </div>
      </div>
      <Tooltip id="add-bot-tooltip" place="left" delayShow={100} />
    </>
  );
};

export default Bots;

import styles from "./Accounts.module.css";

import React, { useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";

import { useDiscordContext } from "../../contexts/DiscordContext";
import AccountCard from "./components/AccountCard";
import axios from "axios";
import { Tooltip } from "react-tooltip";

const Accounts = () => {
  const isInitialRender = useRef(true);
  const { accounts, setAccounts } = useDiscordContext();

  useEffect(() => {
    async function fetchAccounts() {
      try {
        const response = await axios.get(
          "http://localhost:8080/accounts/get-accounts"
        );
        setAccounts(response.data);
      } catch (error) {
        console.log("Error fetching accounts: ", error);
      }
    }
    if (isInitialRender.current) {
      fetchAccounts();
      isInitialRender.current = false;
      return;
    }
  });

  const handleAddAccount = async () => {
    const { value: token, isConfirmed } = await Swal.fire({
      title: "Enter an account token",
      input: "text",
      showCancelButton: true,
      confirmButtonColor: "#6FB2CD",
      cancelButtonColor: "#CB67BC",
      inputValidator: (value) => {
        if (!value) {
          return "You need to enter an account token!";
        }
      },
    });

    if (isConfirmed && token) {
      axios
        .post(
          "http://localhost:8080/accounts/add-account",
          { AccountToken: token },
          { headers: { "Content-Type": "application/json" } }
        )
        .then((response) => {
          const newAccount = response.data[0];
          setAccounts((prevAccounts) => [...prevAccounts, newAccount]);
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
            onClick={handleAddAccount}
            data-tooltip-id="add-account-tooltip"
            data-tooltip-content="Add Account"
          />
        </div>
        <div>
          {accounts.length > 0 ? (
            accounts.map((account) => (
              <AccountCard key={account.account_id} account={account} />
            ))
          ) : (
            <div className={styles.noAccountsDiv}>
              <h2>No accounts added.</h2>
              <p>
                Use the plus icon in the right-hand corner to add new accounts.
              </p>
            </div>
          )}
        </div>
      </div>
      <Tooltip id="add-account-tooltip" place="left" delayShow={100} />
    </>
  );
};

export default Accounts;

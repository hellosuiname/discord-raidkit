import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCog,
  faTrashAlt,
  faToggleOff,
  faToggleOn,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./ProxyCard.module.css";
import sharedStyles from "../../sharedStyles.module.css";
import { useProxyContext } from "../../../contexts/ProxyContext";
import { Tooltip } from "react-tooltip";

const ProxyCard = ({ proxy }) => {
  const [countryCode, setCountryCode] = useState(null);

  const { proxies, setProxies } = useProxyContext();

  useEffect(() => {
    const fetchCountry = async () => {
      try {
        const response = await axios.get(
          `/api/geoplugin/json.gp?ip=${proxy.proxy_host}`
        );
        setCountryCode(response.data.geoplugin_countryCode);
      } catch (error) {
        console.error("Error fetching country:", error);
      }
    };
    fetchCountry();
  }, [proxy.proxy_host]);

  const handleDeleteClick = async () => {
    if (proxy.proxy_status === 1) {
      return;
    }
    const { value: isConfirmed } = await Swal.fire({
      title: "Remove Proxy",
      icon: "warning",
      html: "<p>Are you sure you want to remove this proxy?</p><p><strong><u>This action is not reversable!</u></strong></p>",
      showCancelButton: true,
      confirmButtonColor: "#EF233C",
      cancelButtonColor: "#6FB2CD",
      confirmButtonText: "Remove",
    });
    if (isConfirmed) {
      axios
        .delete(`http://localhost:8080/proxies/delete-proxy/${proxy.proxy_id}`)
        .then((response) => {
          setProxies(response.data);
        })
        .catch((error) => {
          console.error("Error deleting proxies:", error);
        });
    }
  };

  const handleEditClick = async () => {
    if (proxy.proxy_status === 1) {
      return;
    }

    const { value, isConfirmed } = await Swal.fire({
      title: "Edit Proxy",
      html: `
        <input id="swal-input-host" class="swal2-input" style="margin-bottom: 32px;" placeholder="Host" value="${
          proxy.proxy_host
        }">
        <select id="swal-input-protocol" class="swal2-input" style="margin-bottom: 8px;">
          <option value="http" ${
            proxy.proxy_protocol === "http" ? "selected" : ""
          }>http</option>
          <option value="https" ${
            proxy.proxy_protocol === "https" ? "selected" : ""
          }>https</option>
          <option value="socks4" ${
            proxy.proxy_protocol === "socks4" ? "selected" : ""
          }>socks4</option>
          <option value="socks5" ${
            proxy.proxy_protocol === "socks5" ? "selected" : ""
          }>socks5</option>
        </select>
        <input id="swal-input-port" class="swal2-input" style="margin-bottom: 8px;" type="text" placeholder="Port" value="${
          proxy.proxy_port
        }">
        <input id="swal-input-username" class="swal2-input" style="margin-bottom: 8px;" type="text" placeholder="Username" value="${
          proxy.proxy_username
        }">
        <input id="swal-input-password" class="swal2-input" style="margin-bottom: 8px;" type="password" placeholder="Password" value="${
          proxy.proxy_password
        }">
      `,
      didOpen: () => {
        const portInput = document.getElementById("swal-input-port");
        portInput.addEventListener("input", function () {
          this.value = this.value.replace(/[^0-9]/g, "");
        });
      },
      focusConfirm: false,
      preConfirm: () => {
        return {
          host: document.getElementById("swal-input-host").value,
          protocol: document.getElementById("swal-input-protocol").value,
          port:
            parseInt(document.getElementById("swal-input-port").value, 10) ||
            undefined,
          username: document.getElementById("swal-input-username").value,
          password: document.getElementById("swal-input-password").value,
        };
      },
      showCancelButton: true,
      confirmButtonColor: "#6FB2CD",
      cancelButtonColor: "#CB67BC",
    });

    if (isConfirmed) {
      const payload = {
        ...(value.host && { ProxyHost: value.host }),
        ...(value.protocol && { ProxyProtocol: value.protocol }),
        ...(value.port && { ProxyPort: value.port }),
        ...(value.username && { ProxyUsername: value.username }),
        ...(value.password && { ProxyPassword: value.password }),
      };

      axios
        .put(`http://localhost:8080/proxies/update-proxy/${proxy.proxy_id}`, payload)
        .then((response) => {
          const updatedProxy = response.data[0];
          setProxies((prevProxies) =>
            prevProxies.map((p) =>
              p.proxy_id === updatedProxy.proxy_id
                ? {
                    ...p,
                    proxy_host: updatedProxy.proxy_host,
                    proxy_protocol: updatedProxy.proxy_protocol,
                    proxy_port: updatedProxy.proxy_port,
                    proxy_username: updatedProxy.proxy_username,
                    proxy_password: updatedProxy.proxy_password,
                  }
                : p
            )
          );
        })
        .catch((error) => {
          console.error("Error updating proxy:", error);
        });
    }
  };

  function toggleProxyOn(proxyId) {
    const updatedProxies = proxies.map((proxy) =>
      proxy.proxy_id === proxyId ? { ...proxy, proxy_status: 1 } : proxy
    );
    setProxies(updatedProxies);

    const payload = {
      ProxyHost: proxy.proxy_host,
      ProxyProtocol: proxy.proxy_protocol,
      ProxyPort: proxy.proxy_port,
      ProxyStatus: 1,
      ProxyUsername: proxy.proxy_username,
      ProxyPassword: proxy.proxy_password,
    };
    axios.put(`http://localhost:8080/proxies/update-proxy/${proxyId}`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  function toggleProxyOff(proxyId) {
    const updatedProxies = proxies.map((proxy) =>
      proxy.proxy_id === proxyId ? { ...proxy, proxy_status: 0 } : proxy
    );
    setProxies(updatedProxies);

    axios.put(
      `http://localhost:8080/proxies/update-proxy/${proxyId}`,
      {
        ProxyStatus: 0,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  let content;

  if (!proxy) {
    content = <p>Proxy not found.</p>;
  } else {
    content = (
      <>
        <h5>
          {countryCode ? (
            <i
              className={`fi fi-${countryCode.toLowerCase()} ${styles.flag}`}
            ></i>
          ) : null}
          <strong>
            {proxy?.proxy_protocol?.toUpperCase()} - {proxy?.proxy_port}
          </strong>
        </h5>
        <h1>{proxy?.proxy_host}</h1>
        {proxy?.proxy_status === 1 && (
          <FontAwesomeIcon
            icon={faToggleOn}
            className={`${styles.onBtn} ${styles.on}`}
            onClick={() => toggleProxyOff(proxy.proxy_id)}
            data-tooltip-id="switch-tooltip"
            data-tooltip-content="Turn Proxy Off"
          />
        )}

        {proxy?.proxy_status === 0 && (
          <FontAwesomeIcon
            icon={faToggleOff}
            className={`${styles.onBtn} ${styles.off}`}
            onClick={() => toggleProxyOn(proxy.proxy_id)}
            data-tooltip-id="switch-tooltip"
            data-tooltip-content="Turn Proxy On"
          />
        )}

        {proxy?.proxy_status === 2 && (
          <FontAwesomeIcon
            icon={faSpinner}
            className={`${styles.onBtn} ${styles.pending}`}
            data-tooltip-id="switch-tooltip"
            data-tooltip-content="Turning on proxy..."
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
            data-tooltip-content="Edit Proxy"
          />
          <FontAwesomeIcon
            icon={faTrashAlt}
            className={styles.deleteBtn}
            onClick={handleDeleteClick}
            data-tooltip-id="delete-tooltip"
            data-tooltip-content="Remove Proxy"
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

export default ProxyCard;

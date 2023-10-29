import styles from "./Proxies.module.css";

import React from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { Tooltip } from "react-tooltip";
import { useProxyContext } from "../../contexts/ProxyContext";
import ProxyCard from "./components/ProxyCard";

const Proxies = () => {
  const { proxies, setProxies } = useProxyContext();

  const handleAddProxy = async () => {
    const { value, isConfirmed } = await Swal.fire({
      title: "Add a new proxy",
      html: `
        <input id="swal-input-host" class="swal2-input" style="margin-bottom: 32px;" placeholder="Host">
        <select id="swal-input-protocol" class="swal2-input" style="margin-bottom: 8px;">
          <option value="http">http</option>
          <option value="https">https</option>
          <option value="socks4">socks4</option>
          <option value="socks5">socks5</option>
        </select>
        <input id="swal-input-port" class="swal2-input" style="margin-bottom: 8px;" placeholder="Port">
        <input id="swal-input-username" class="swal2-input" style="margin-bottom: 8px;" placeholder="Username">
        <input id="swal-input-password" class="swal2-input" placeholder="Password" type="password">
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
          port: parseInt(document.getElementById("swal-input-port").value, 10),
          username: document.getElementById("swal-input-username").value,
          password: document.getElementById("swal-input-password").value,
        };
      },
      showCancelButton: true,
      confirmButtonColor: "#6FB2CD",
      cancelButtonColor: "#CB67BC",
      inputValidator: (values) => {
        if (!values.host) {
          return "You need to enter a host!";
        }
        if (!values.port) {
          return "You need to enter a port!";
        }
      },
    });

    if (isConfirmed && value) {
      axios
        .post(
          "http://localhost:8080/proxies/add-proxy/",
          {
            ProxyHost: value.host,
            ProxyProtocol: value.protocol,
            ProxyPort: value.port,
            ProxyStatus: 0,
            ProxyUsername: value.username,
            ProxyPassword: value.password,
          },
          { headers: { "Content-Type": "application/json" } }
        )
        .then((response) => {
          const addedProxy = response.data[0];
          setProxies((prevProxies) => [...prevProxies, addedProxy]);
        })
        .catch((error) => {
          console.error("Error adding proxy:", error);
        });
    }
  };

  return (
    <>
      <div className={styles.iconWrapper}>
        <FontAwesomeIcon
          icon={faPlusCircle}
          className={styles.icon}
          onClick={handleAddProxy}
          data-tooltip-id="add-proxy-tooltip"
          data-tooltip-content="Add Proxy"
        />
      </div>
      <div>
        {proxies.length > 0 ? (
          proxies.map((proxy) => (
            <ProxyCard key={proxy.proxy_id} proxy={proxy} />
          ))
        ) : (
          <div className={styles.noProxiesDiv}>
            <h2>No proxies added.</h2>
            <p>
              Use the plus icon in the right-hand corner to add new proxies.
            </p>
          </div>
        )}
      </div>
      <Tooltip id="add-proxy-tooltip" place="left" delayShow={100}></Tooltip>
    </>
  );
};

export default Proxies;

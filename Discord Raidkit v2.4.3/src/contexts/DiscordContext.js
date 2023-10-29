import React, {
  createContext,
  useState,
  useContext,
  useMemo,
  useCallback,
} from "react";
import axios from "axios";

const DiscordContext = createContext();

export const DiscordProvider = ({ children }) => {
  const [bots, setBots] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [proxies, setProxies] = useState([]);

  const isAnyBotOn = useMemo(() => {
    return bots.some((bot) => bot.is_on === 1);
  }, [bots]);

  const deactivateLogin = useCallback(
    (id) => {
      axios
        .put(`http://localhost:8080/accounts/deactivate-login/${id}`, {
          AccountID: id,
        })
        .then((response) => {
          const updatedAccount = response.data[0];
          setAccounts((prevAccounts) =>
            prevAccounts.map((a) =>
              a.account_id === updatedAccount.account_id
                ? {
                    ...a,
                    login_status: updatedAccount.login_status,
                  }
                : a
            )
          );
        })
        .catch((error) => {
          console.error("Error updating account:", error);
        });
    },
    [setAccounts]
  );

  const deactivateNuke = useCallback(
    (id) => {
      axios
        .put(`http://localhost:8080/accounts/deactivate-nuke/${id}`, {
          AccountID: id,
        })
        .then((response) => {
          const updatedAccount = response.data[0];
          setAccounts((prevAccounts) =>
            prevAccounts.map((a) =>
              a.account_id === updatedAccount.account_id
                ? {
                    ...a,
                    nuke_status: updatedAccount.nuke_status,
                  }
                : a
            )
          );
        })
        .catch((error) => {
          console.error("Error updating account:", error);
        });
    },
    [setAccounts]
  );

  const BOT_OFF_PAGE_MSG =
    "A bot must be running for this page to be available.";

  return (
    <DiscordContext.Provider
      value={{
        bots,
        setBots,
        isAnyBotOn,
        BOT_OFF_PAGE_MSG,
        accounts,
        setAccounts,
        deactivateLogin,
        deactivateNuke,
        proxies,
        setProxies,
      }}
    >
      {children}
    </DiscordContext.Provider>
  );
};

export const useDiscordContext = () => {
  const context = useContext(DiscordContext);
  if (!context) {
    throw new Error("useDiscordContext must be used within a DiscordProvider");
  }
  return context;
};

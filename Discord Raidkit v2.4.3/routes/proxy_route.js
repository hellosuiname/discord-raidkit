const express = require("express");

module.exports = (db) => {
  const router = express.Router();

  router.get("/get-proxies", (req, res) => {
    db.all(
      "SELECT proxy_id, proxy_host, proxy_protocol, proxy_port, proxy_status, proxy_username, proxy_password FROM proxies",
      [],
      (err, rows) => {
        if (err) {
          res.status(400).json({ error: err.message });
          return;
        }
        res.json(rows);
      }
    );
  });

  router.post("/add-proxy", (req, res) => {
    const {
      ProxyHost,
      ProxyProtocol,
      ProxyPort,
      ProxyStatus,
      ProxyUsername,
      ProxyPassword,
    } = req.body;
    db.run(
      "INSERT INTO proxies (proxy_host, proxy_protocol, proxy_port, proxy_status, proxy_username, proxy_password) VALUES (?, ?, ?, ?, ?, ?)",
      [
        ProxyHost,
        ProxyProtocol,
        ProxyPort,
        ProxyStatus,
        ProxyUsername,
        ProxyPassword,
      ],
      function (err) {
        if (err) {
          res.status(400).json({ error: err.message });
          return;
        }
        db.all(
          "SELECT proxy_id, proxy_host, proxy_protocol, proxy_port, proxy_status, proxy_username, proxy_password FROM proxies WHERE proxy_id = ?",
          [this.lastID],
          (err, rows) => {
            if (err) {
              res.status(400).json({ error: err.message });
              return;
            }
            res.json(rows);
          }
        );
      }
    );
  });

  router.put("/update-proxy/:id", (req, res) => {
    const ProxyID = req.params.id;

    const {
      ProxyHost,
      ProxyProtocol,
      ProxyPort,
      ProxyStatus,
      ProxyUsername,
      ProxyPassword,
    } = req.body;

    let fieldsToUpdate = {};
    if (ProxyHost !== undefined) fieldsToUpdate["proxy_host"] = ProxyHost;
    if (ProxyProtocol !== undefined)
      fieldsToUpdate["proxy_protocol"] = ProxyProtocol;
    if (ProxyPort !== undefined) fieldsToUpdate["proxy_port"] = ProxyPort;
    if (ProxyStatus !== undefined) fieldsToUpdate["proxy_status"] = ProxyStatus;
    if (ProxyUsername !== undefined)
      fieldsToUpdate["proxy_username"] = ProxyUsername;
    if (ProxyPassword !== undefined)
      fieldsToUpdate["proxy_password"] = ProxyPassword;

    if (Object.keys(fieldsToUpdate).length === 0) {
      res.json({ status: "no data to update" });
      return;
    }

    const setClause = Object.keys(fieldsToUpdate)
      .map((field) => `${field} = ?`)
      .join(", ");
    const sql = `UPDATE proxies SET ${setClause} WHERE proxy_id = ?`;

    db.run(sql, [...Object.values(fieldsToUpdate), ProxyID], function (err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }

      if (this.changes === 0) {
        res.json({ status: "failure to update record" });
        return;
      }

      db.all(
        "SELECT proxy_id, proxy_host, proxy_protocol, proxy_port, proxy_status, proxy_username, proxy_password FROM proxies WHERE proxy_id = ?",
        [ProxyID],
        (err, rows) => {
          if (err) {
            res.status(400).json({ error: err.message });
            return;
          }
          res.json(rows);
        }
      );
    });
  });

  router.delete("/delete-proxy/:id", (req, res) => {
    const ProxyID = req.params.id;

    db.run("DELETE FROM proxies WHERE proxy_id = ?", [ProxyID], function (err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }

      if (this.changes === 0) {
        res.json({ status: "failure to delete record" });
        return;
      }

      db.all(
        "SELECT proxy_id, proxy_host, proxy_protocol, proxy_port, proxy_status, proxy_username, proxy_password FROM proxies",
        [],
        (err, rows) => {
          if (err) {
            res.status(400).json({ error: err.message });
            return;
          }
          res.json(rows);
        }
      );
    });
  });

  return router;
};

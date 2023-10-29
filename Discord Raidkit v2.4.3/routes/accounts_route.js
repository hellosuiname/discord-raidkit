const express = require("express");

module.exports = (db) => {
  const router = express.Router();

  router.get("/get-accounts", (req, res) => {
    db.all(
      "SELECT account_id, account_token, login_status, nuke_status FROM accounts",
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

  router.post("/add-account", (req, res) => {
    const { AccountToken } = req.body;
    db.run(
      "INSERT INTO accounts (account_token, login_status, nuke_status) VALUES (?, ?, ?)",
      [AccountToken, 0, 0],
      function (err) {
        if (err) {
          res.status(400).json({ error: err.message });
          return;
        }
        db.all(
          "SELECT account_id, account_token, login_status, nuke_status FROM accounts WHERE account_id = ?",
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

  router.put("/update-account", (req, res) => {
    const { AccountID, AccountToken } = req.body;

    db.run(
      "UPDATE accounts SET account_token = ? WHERE account_id = ?",
      [AccountToken, AccountID],
      function (err) {
        if (err) {
          res.status(400).json({ error: err.message });
          return;
        }

        if (this.changes === 0) {
          res.json({ status: "failure to update record" });
          return;
        }

        db.all(
          "SELECT account_id, account_token, login_status, nuke_status FROM accounts WHERE account_id = ?",
          [AccountID],
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

  router.put("/deactivate-login/:id", (req, res) => {
    const AccountID = req.params.id;

    db.run(
      "UPDATE accounts SET login_status = 0 WHERE account_id = ?",
      [AccountID],
      function (err) {
        if (err) {
          res.status(400).json({ error: err.message });
          return;
        }

        if (this.changes === 0) {
          res.json({ status: "failed to update record" });
          return;
        }

        db.all(
          "SELECT account_id, account_token, login_status, nuke_status FROM accounts WHERE account_id = ?",
          [AccountID],
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

  router.put("/deactivate-nuke/:id", (req, res) => {
    const AccountID = req.params.id;

    db.run(
      "UPDATE accounts SET nuke_status = 0 WHERE account_id = ?",
      [AccountID],
      function (err) {
        if (err) {
          res.status(400).json({ error: err.message });
          return;
        }

        if (this.changes === 0) {
          res.json({ status: "failed to update record" });
          return;
        }

        db.all(
          "SELECT account_id, account_token, login_status, nuke_status FROM accounts WHERE account_id = ?",
          [AccountID],
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

  router.delete("/delete-account/:id", (req, res) => {
    const AccountID = req.params.id;

    db.run(
      "DELETE FROM accounts WHERE account_id = ?",
      [AccountID],
      function (err) {
        if (err) {
          res.status(400).json({ error: err.message });
          return;
        }

        if (this.changes === 0) {
          res.json({ status: "failure to delete record" });
          return;
        }

        db.all(
          "SELECT account_id, account_token, login_status, nuke_status FROM accounts",
          [],
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

  return router;
};

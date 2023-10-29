const express = require("express");

module.exports = (db) => {
  const router = express.Router();

  router.get("/get-bots", (req, res) => {
    db.all(
      "SELECT bot_id, bot_token, bot_status FROM bots",
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

  router.post("/add-bot", (req, res) => {
    const { BotToken } = req.body;
    db.run(
      "INSERT INTO bots (bot_token, bot_status) VALUES (?, ?)",
      [BotToken, 0],
      function (err) {
        if (err) {
          res.status(400).json({ error: err.message });
          return;
        }
        db.all(
          "SELECT bot_id, bot_token, bot_status FROM bots WHERE bot_id = ?",
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

  router.put("/update-bot", (req, res) => {
    const { BotID, BotToken } = req.body;

    db.run(
      "UPDATE bots SET bot_token = ? WHERE bot_id = ?",
      [BotToken, BotID],
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
          "SELECT bot_id, bot_token, bot_status FROM bots WHERE bot_id = ?",
          [BotID],
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

  router.delete("/delete-bot/:id", (req, res) => {
    const BotID = req.params.id;

    db.run("DELETE FROM bots WHERE bot_id = ?", [BotID], function (err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }

      if (this.changes === 0) {
        res.json({ status: "failure to delete record" });
        return;
      }

      db.all(
        "SELECT bot_id, bot_token, bot_status FROM bots",
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

const express = require("express");
const sqlite3 = require("sqlite3");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const PORT = 8080;

const db = new sqlite3.Database("./DRDB.db", (err) => {
  if (err) {
    return console.error(err.message);
  }
  tryCreateCoreTables(); 
});

function tryCreateCoreTables() {
  db.run(`CREATE TABLE IF NOT EXISTS bots (
    bot_id INTEGER PRIMARY KEY AUTOINCREMENT, 
    bot_token TEXT, 
    bot_status INTEGER
  );`);

  db.run(`CREATE TABLE IF NOT EXISTS accounts (
    account_id INTEGER PRIMARY KEY AUTOINCREMENT, 
    account_token TEXT,
    login_status INTEGER,
    nuke_status INTEGER
  );`);

  db.run(`CREATE TABLE IF NOT EXISTS proxies (
    proxy_id INTEGER PRIMARY KEY AUTOINCREMENT, 
    proxy_host TEXT,
    proxy_protocol TEXT,
    proxy_port INTEGER,
    proxy_status INTEGER,
    proxy_username TEXT,
    proxy_password TEXT
  );`);
}

app.use(cors());
app.use(express.json());

const botRouter = require("./routes/bot_route")(db);
const accountsRouter = require("./routes/accounts_route")(db);
const proxyRouter = require("./routes/proxy_route")(db);

app.use('/bots', botRouter);
app.use('/accounts', accountsRouter);
app.use('/proxies', proxyRouter);

app.use(
  "/api/discord",
  createProxyMiddleware({
    target: "https://discord.com/api/v10",
    pathRewrite: {
      "^/api/discord": "/",
    },
    changeOrigin: true,
  })
);

app.use(
  "/api/geoplugin",
  createProxyMiddleware({
    target: "http://www.geoplugin.net",
    pathRewrite: {
      "^/api/geoplugin": "/",
    },
    changeOrigin: true,
  })
);

app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});

process.on("SIGINT", () => {
  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Closed the database connection.");
    process.exit(0);
  });
});

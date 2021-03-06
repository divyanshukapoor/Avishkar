require("dotenv").config();
const express = require("express");
const proxy = require("http-proxy-middleware");
const next = require("next");
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const isDev = process.env.NODE_ENV !== "production";

app
  .prepare()
  .then(() => {
    const server = express();
    server.use(
      "/api",
      proxy({ target: "http://localhost:3001", changeOrigin: true })
    );
    server.get("/events/:name", (req, res) => {
      const actualPage = "/events";
      const queryParams = { name: req.params.name };
      app.render(req, res, actualPage, queryParams);
    });
    server.get("/dashboard/:tab/:subtab", (req, res) => {
      const actualPage = "/dashboard";
      const queryParams = { tab: req.params.tab, event: req.params.subtab };
      app.render(req, res, actualPage, queryParams);
    });
    server.get("/reset-password/:tab", (req, res) => {
      const actualPage = "/reset-password";
      const queryParams = { tab: req.params.tab };
      app.render(req, res, actualPage, queryParams);
    });

    server.get("*", (req, res) => {
      return handle(req, res);
    });

    server.listen(3000, err => {
      if (err) throw err;
      console.log("> Ready on http://localhost:3000");
    });
  })
  .catch(ex => {
    console.error(ex.stack);
    process.exit(1);
  });

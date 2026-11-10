const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const app = express();
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const authRoutes = require("./routes/authRoutes");
const fileRoutes = require("./routes/fileRoutes");
const ingestRoutes = require("./routes/ingestRoutes");
const matchRoutes = require("./routes/matchRoutes");

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use("/api/auth", authRoutes);
app.use("/api", fileRoutes);
app.use("/api/ingest", ingestRoutes);
app.use("/api/match", matchRoutes);

module.exports = app;

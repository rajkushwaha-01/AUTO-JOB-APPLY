const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();

// PNA header must be set FIRST, before cors() handles/ends the OPTIONS preflight
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Private-Network", "true");
  next();
});

app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true
}));

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const authRoutes = require("./routes/authRoutes");
const fileRoutes = require("./routes/fileRoutes");
const ingestRoutes = require("./routes/ingestRoutes");
const matchRoutes = require("./routes/matchRoutes");
const autofillRoutes = require("./routes/autofill.routes");
const jobRoutes = require("./routes/jobRoutes");

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use("/api/auth", authRoutes);
app.use("/api", fileRoutes);
app.use("/api/ingest", ingestRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/autofill", autofillRoutes);
app.use("/api/jobs", jobRoutes);

module.exports = app;
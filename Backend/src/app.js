const express = require("express");
const path = require("path");
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

// Render health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});

const authRoutes = require("./routes/authRoutes");
const fileRoutes = require("./routes/fileRoutes");
const ingestRoutes = require("./routes/ingestRoutes");
const matchRoutes = require("./routes/matchRoutes");
const autofillRoutes = require("./routes/autofill.routes");
const jobRoutes = require("./routes/jobRoutes");

// API routes
app.use("/api/auth", authRoutes);
app.use("/api", fileRoutes);
app.use("/api/ingest", ingestRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/autofill", autofillRoutes);
app.use("/api/jobs", jobRoutes);

// Explicit 404 handler for unknown API routes so they don't fall through to SPA index.html
app.all("/api/{*splat}", (req, res) => {
  res.status(404).json({ message: "API endpoint not found" });
});

// Serve frontend static build files (single-domain deployment)
const frontendDist = path.resolve(__dirname, "../../Frontend/dist");
app.use(express.static(frontendDist));

// SPA wildcard fallback: any unmatched GET request serves React index.html
app.use((req, res) => {
  const indexPath = path.join(frontendDist, "index.html");
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).send("Frontend build not found. Please run 'npm run build' first.");
    }
  });
});

module.exports = app;
// src/services/ingest.service.js
// Export findMatchesForUser as alias to match.service for backwards compatibility
const { findMatchesForUser } = require("./match.service");

module.exports = { findMatchesForUser };

require("dotenv").config();
const app = require("./src/app");
const ConnectDB = require("./src/config/db");

ConnectDB();

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

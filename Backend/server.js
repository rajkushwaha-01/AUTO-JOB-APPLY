// Polyfill Promise.withResolvers for Node.js versions < 22 (required by pdfjs-dist)
if (!Promise.withResolvers) {
  Promise.withResolvers = function withResolvers() {
    let resolve;
    let reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

require("dotenv").config();
const app = require("./src/app");
const ConnectDB = require("./src/config/db");

ConnectDB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

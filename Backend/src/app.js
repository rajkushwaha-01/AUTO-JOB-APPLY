const express = require('express');
const morgan = require('morgan');
const app = express();
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authRoutes = require("./routes/authRoutes");

app.get('/', (req, res) => {
  res.send('Hello, World!');
}); 

app.use("/api/auth", authRoutes);

module.exports = app;

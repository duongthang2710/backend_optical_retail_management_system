const express = require("express");

const app = express();

const post = process.env.PORT || 3000;


app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});

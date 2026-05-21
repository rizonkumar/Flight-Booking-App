const express = require("express");

const { ServerConfig } = require("./config/server-config");
const apiRoutes = require("./routes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", apiRoutes);

const port = ServerConfig?.PORT || process.env.PORT;

app.listen(port, () => {
  console.log(`Successfully started the server on PORT: ${port}`);
});

const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");
const path = require("path");
// const dbConnect = require("./src/config/mongoDBConnect.js");
// dbConnect();
require("dotenv").config();
app.use(morgan("dev"));
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Xem hình ảnh
app.use(express.static(path.join(__dirname, "uploads")));

// Config port Server
const port = process.env.PORT;
const base_url = process.env.BASE_URL;

// import router
require("./src/routes/admin.route.js")(app);

app.listen(port, () => {
  console.log(`🚀 Server is running at ${base_url}:${port}`);
});

require("dotenv").config();
const mongoose = require("mongoose");
mongoose.set("strictQuery", true);
async function dbConnect() {
  try {
    await mongoose
      .connect(`${process.env.MONGO_URI}`)
      .then(() => console.log("MongoDB Connection Successfull"))
      .catch((err) => {
        console.error(err);
      });
  } catch (error) {
    console.log("Database error");
  }
}

module.exports = dbConnect;

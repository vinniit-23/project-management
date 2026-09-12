import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});
import app from "./app.js";
import connectDB from "./db/index.db.js";

const port = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`app listening on port ${process.env.URL}`);
    });
  })
  .catch((err) => {
    console.log("Mongo DB connection error", err);
    process.exit(1);
  });

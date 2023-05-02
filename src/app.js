const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { createMultiWatch } = require("../config/aws");
const S3Watcher = require("./s3-watch");

const app = express();
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

(async () => {
  const watches = await createMultiWatch();
  // Create a new instance of S3Watcher for each S3 configuration object
  const s3Watchers = watches.map((config) => new S3Watcher(config));
  // Start watching each S3 bucket for changes
  s3Watchers.forEach((s3Watcher) => {
    s3Watcher.watch((newObjects) => {
      console.log("newObjects", newObjects);
      console.log(`Detected ${newObjects.length} new objects in the bucket`);
      // Download and save each new object
      s3Watcher.process(newObjects);
    });
  });
})();

// const s3Watcher = new S3Watcher();

// Start watching the S3 bucket for changes
// s3Watcher.watch((newObjects) => {
//   console.log("newObjects", newObjects);
//   console.log(`Detected ${newObjects.length} new objects in the bucket`);
//   // Download and save each new object
//   s3Watcher.process(newObjects);
// });

// Route
app.get("/", async (req, res) => {
  res.send("Hello World!");
});

// Start the Express server
app.listen(3000, () => {
  console.log("Server started on port 3000");
});

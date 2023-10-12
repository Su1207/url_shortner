const express = require("express");
const { connectToMongoDB } = require("./connect");
const urlRoute = require("./routes/url");
const URL = require("./models/url");
const path = require("path");
const { redirect } = require("express/lib/response");
const staticRoute = require("./routes/staticRoutes");

const app = express();
const PORT = 5000;

connectToMongoDB("mongodb://127.0.0.1:27017/short-url").then(() =>
  console.log("MongoDB connected")
);

// set the view engine to ejs
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
// use res.render to load up an ejs view file

// app.use() used to define middleware functions in your Express application. Middleware functions are functions that have access to the request and response objects in an Express application's request-response cycle.
//parsing incoming JSON data from client requests
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/url", urlRoute);

app.use("/", staticRoute);

// app.get("/test", async (req, res) => {
//   const allUrls = await URL.find({});

//   res.render("home", {
//     urls: allUrls,
//   });
// res.end(`
// <head></head>
// <body>
//   <ol>
//     ${allUrls
//       .map(
//         (url) =>
//           `<li>${url.shortId} - ${url.redirectURL} - ${url.visitHistory.length}</li>`
//       )
//       .join("")}
//   </ol>
// </body>
// `);
// });

app.get("/url/:shortId", async (req, res) => {
  const shortId = req.params.shortId;
  const entry = await URL.findOneAndUpdate(
    {
      shortId,
    },
    {
      $push: {
        visitHistory: {
          timeStamp: Date.now(),
        },
      },
    }
  );
  res.redirect(entry.redirectURL);
});

app.listen(PORT, () => console.log(`Server started at PORT:${PORT}`));

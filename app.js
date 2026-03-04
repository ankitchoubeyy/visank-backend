require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const hpp = require("hpp");
const xss = require("xss-clean");

const apiLimiter = require("./middlewares/rateLimiter");
const errorHandler = require("./middlewares/errorHandler");

const app = express();



/* -------------------------
   SECURITY MIDDLEWARE
--------------------------*/

app.use(helmet()); // secure HTTP headers
app.use(hpp()); // prevent parameter pollution
app.use(xss()); // prevent XSS attacks



/* -------------------------
   CORS
--------------------------*/

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true
  })
);



/* -------------------------
   BODY PARSER
--------------------------*/

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));



/* -------------------------
   COMPRESSION
--------------------------*/

app.use(compression());



/* -------------------------
   LOGGING
--------------------------*/

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}



/* -------------------------
   RATE LIMITING
--------------------------*/

app.use("/api", apiLimiter);



/* -------------------------
   HEALTH CHECK
--------------------------*/

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server running",
    time: new Date()
  });
});




/* -------------------------
   404 HANDLER
--------------------------*/

app.use((req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});



/* -------------------------
   GLOBAL ERROR HANDLER
--------------------------*/

app.use(errorHandler);



module.exports = app;
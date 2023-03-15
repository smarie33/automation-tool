const express = require("express"),
    path = require("path"),
    cookieParser = require("cookie-parser"),
    bodyParser = require("body-parser"),
    routes = require("./routes/index"),
    cors = require('cors'),
    createError = require('http-errors'),
    dbData = require('./data/db.json'),
    server = express();

server.use( bodyParser.json({ limit: '50mb' }) );       // to support JSON-encoded bodies
server.use(bodyParser.urlencoded({ limit: '50mb',extended: true}));    // to support URL-encoded bodies
server.use(cors())
server.use(cookieParser());
server.use(express.static(path.join(__dirname, "public")));

server.use("/", routes);

// catch 404 and forward to error handler
server.use(function (req, res, next) {
    next(createError(404));
});

// error handler
server.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.title = "error";
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.json({
      test: 'from app js',
      message: err.message,
      error: err
    });
    res.end();
});

const serverLive = server.listen(8099, () => {
});

module.exports = server;
/**
 * index.js
 * Main CMS index file - sets up the web server for CMS
 *
 * CMS URL: https://[APP_DOMAIN_PREFIX]-[APP_ID]-dev_[APP_DOMAIN_PREFIX].df.[dev/live].u101.feedhenry.net/cms
 * EXMAPLE URL: https://hpcs-kuvlruflpg8drisp6mbslbgm-dev_hpcs.df.dev.u101.feedhenry.net/cms
 */

// Node modules
var express = require("express");
var engine = require("ejs-locals");
var routes = require("./routes");
var MongoStore = require('connect-mongo')(express);
var log=require("../logger").getLogger();
var events=require("../events");
var env=require("../env");
var app=null;
module.exports = {
  init: init
};
function init(app) {
    // use ejs-locals for all ejs templates:
    
    app.engine("ejs", engine);
    app.set("views", __dirname + "/views");
    app.set("view engine", "ejs");
    // app.use(express.compress());
    
    app.use(express.cookieParser());
    app.use(express.cookieSession({
      secret: "4f8071f-c873-4447-8ee2",
      cookie: {
        maxAge: 3600*1000
      },
      store: new MongoStore({
        db: require("../db/mongodb.js").getDb()
      })

    }));

    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(function(req,res,next){
      if (!process.env["host"]){
        process.env["host"]=req.protocol+"://"+req.get("host");
      }
       req.session._garbage = Date();
  
      next();
    });
    
    app.use(app.router);
    app.use(express['static'](__dirname + "/public"));

  // Routes within the application
  require("./routes/index")(app);
  require("./routes/login")(app);
  require("./routes/dashboard")(app);
  require("./routes/users")(app);
  require("./routes/apps")(app);
  require("./routes/categories")(app);
  require("./routes/articles")(app);
  log.info("CMS is ready.");

}
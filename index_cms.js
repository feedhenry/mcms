//entry file which outof FH box
var express = require('express');
var app = express();
var events = require("./events");
var db = require("./db/mongodb.js");
var log = require("./logger").getLogger();
var cms = require('./webserver');
var freeport = require("freeport");
db.connect();
events.once("dbReady", function() { //init web server once db is ready. web server needs to use mongodb session
  log.info("DB is ready. Start to initialise web server.");
  // Setup CMS, but not if running in cloud, it seems to break routes 
  cms.init(app);
  var port = process.env.FH_PORT || process.env.APP_PORT || -1;
  if (process.env.KEYANG_DEV){
    port=8011;
  }
  if (port === -1) {
    freeport(function(err, port) {
      if (err){
        port=8001;
        log.info("PORT not specified, try use default 8001 port now.");
      }
      startApp(port);
    });
  } else {
    startApp(port);
  }
});

function startApp(port) {
  app.listen(port, function(err) {
    log.info("App started at port:" + port);
    log.info("Visit: http://127.0.0.1:"+port);
    if (process.send){
      log.info("Detected children mode. Hook to host");
      process.send({msg:"started",port:port});
      process.on("message",function(msgObj){
        if (msgObj.err){
          log.error(err);
        }else{
          if (msgObj.msg=="started"){
            log.info("Connected to host successfully");
          }
        }
      });
      // ,function(err){
      //   if (!err){
      //     log.info("Connected to host successfully");
      //   }else{
      //     log.info("Connection to host failed");
      //   }
      // }
      process.on("disconnect",function(){
        log.info("Disconnected from host. Kill process");
        process.exit(0);
      });
      process.on("exit",function(){
        log.info("Parent stops me...");
      });
    }
  });
}
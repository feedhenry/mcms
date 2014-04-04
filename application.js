// Require nodeapp and let it do its thing...
var nodeapp = require("fh-nodeapp");
nodeapp.HostApp.init();

var express = require('express');
var request = require('request');
var log = require('./logger').getLogger();
var app = express();
var events = require("./events");
var db = require("./db/mongodb");
var log = require("./logger").getLogger();

// Connect to the database
db.connect();

events.once("dbReady", function() { //init web server once db is ready. web server needs to use mongodb session
  log.info("DB is ready. Start to initialise web server from application.js");
  // Setup CMS
  var cms = require('./cms');
  cms.init(app);
  
  // Setup the integrations stuff, Flight Data, Security Times, Weather etc
  var integrations = require('./integrations');
  integrations.init(app);

  // These are required by the studio
  app.get('/sys/info/ping', function(req, res) {
    res.end(JSON.stringify("OK"));
  });
  app.get('/sys/info/memory', function(req, res) {
    res.end(JSON.stringify(process.memoryUsage()));
  });
  app.get('/sys/info/endpoints', function(req, res) {
    var ret = {
      endpoints: []
    };
    res.end(JSON.stringify(ret));
  });
  app.get('/sys/info/port', function(req, res) {
    var port = nodeapp.HostApp.getPort();
    res.end("" + port);
  });

  // // Final default route
  // app.get('/*', function(req, res) {
  //   res.status(404).end('Not Found: ' + req.url);
  // });

  // Bind webserver to available port
  var port = process.env.FH_PORT || process.env.VCAP_APP_PORT || 8001;
  app.listen(port, function(err) {
    var domain = process.env.FH_DOMAIN || 'daa';
    var appId = process.env.FH_INSTANCE || 'v3bzepTXDsFd8BYMHcpwoMLN';

    request({
      method: 'POST',
      url: 'https://' + domain + '.feedhenry.com/box/srv/1.1/ide/' + domain + '/app/hosts',
      body: JSON.stringify({
        guid: appId
      })
    }, function(err, res, body) {
      try {
        body = JSON.parse(body);
        log.info('Live app running at: ' + body.hosts['live-url']);
        log.info('Dev app running at: ' + body.hosts['development-url']);
      } catch (e) {
        log.warn('Call to get app endpoints failed.')
      }
    });
  });

  // Not sure is this necessary
  $fhserver.setServer(app);
});
/**
 * /db/mongodb.js
 * Mongodb connector.
 */

module.exports = {
  getDb: getDb,
  connect: connect,
  isConnected:isConnected,
  isConnecting:isConnecting
};


var mongo = require('mongodb');
var async = require('async');
var db = null;
var log = require('../logger');
var env = require('../env');
var events = require("../events");
var ObjectID = mongo.ObjectID;
var MongoClient = require('mongodb').MongoClient;
var connecting=false;
function isConnected(){
  return db && connecting==false;
}
function isConnecting(){
  return connecting;
}
/**
 * Connect to the database
 */
function connect() {
  connecting=true;
  var dbConnectionString = 'mongodb://' + env.get("DB_USERNAME") + ':' + env.get("DB_PASSWORD") + '@' + env.get("DB_HOST") + ':' + env.get("DB_PORT") + '/' + env.get("DB_NAME");
  log.info('Connecting to mongo instance at ' + dbConnectionString);

  MongoClient.connect(dbConnectionString, {
    native_parser: true,
    safe: true
  }, function(err, instance) {
    if (err) {
      throw err;
    }

    db = instance;
    connecting=false;
    // TODO Handle db errors/connection loss
    // db.on('close', onDbError);
    // db.on('error', onDbError)

    // Tell other components DB is ready
    events.emit(events.msg.dbReady);

    log.info('DB connection established.');
  });
}


/**
 * Callback to handle potential database errors
 * @param {Object} err
 */

function onDbError(err) {
  // Tell other components the DB is not available
  events.emit(events.msg.dbNotAvailable);

  log.err('DB connection encountered an error. Will try to reconnect. Error: ');
  log.err(err);

  // Try to connect again
  connect();
}


function getDb() {
  return db;
}
var EventEmitter = require("events").EventEmitter;


//implementation
var util = require("util");

function Event() {
  EventEmitter.call(this);
  this.init();
};
util.inherits(Event, EventEmitter);

Event.prototype.init = function() {
  this.msg = {
    "dbReady": "dbReady",
    "dbNotAvailable": "dbNotAvailable",
    "afdsReady": "afdsReady",
    "afdsFailed": "afdsFailed",
    "updateAppTree":"updateAppTree",
    "flightUpdate": "flightUpdate"
  }
}

//module interface
module.exports = new Event();
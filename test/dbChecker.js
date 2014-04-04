var mongoLib=require("../db/mongodb.js");
var events = require("../events");
module.exports = function(done) {
    if (mongoLib.isConnected()) {
        done();
    } else {
        events.once("dbReady", done);
        if (!mongoLib.isConnecting()) {
            mongoLib.connect();
        }
    }

}
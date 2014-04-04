/**
 * index.js
 * The logger to use throughout the cloud app.
 */

var winston=require("winston");
var myLogger=new winston.Logger();
module.exports = myLogger;
//add console logger support
myLogger.add(winston.transports.Console,{
  "timestamp":true,
  "colorize":true,
  "level":"silly"
});

//bridge error interface
myLogger.err=myLogger.error;

//legacy
myLogger.getLogger=function(){
    return myLogger;
}
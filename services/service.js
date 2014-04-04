module.exports=Service;

var util=require("util");
var EventEmitter=require("events").EventEmitter;
var log=require("../logger");
function Service(serviceName){
    EventEmitter.call(this);
    this.serviceName=serviceName;
    this.running=false;
}
util.inherits(Service,EventEmitter);
Service.prototype.parent={};
Service.prototype.startService=function(){
    log.info("Service "+this.serviceName+" has started.");
    this.running=true;
}

Service.prototype.stopService=function(){
    log.info("Service "+this.serviceName+" has stopped.");
    this.running=false;
}

Service.prototype.run=function(){
    this.emit("run");
}
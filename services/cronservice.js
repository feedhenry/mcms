module.exports = CronService

var util = require("util");
var Service = require("./service.js");
var CronJob = require("cron").CronJob;

function CronService(name, cronTab) {
    Service.call(this, name);
    this.cronTab = cronTab;
    this.cronJob = null;
    this.initCron();
}
util.inherits(CronService, Service);

CronService.prototype.parent.Service = Service.prototype;
CronService.prototype.startService = function() {
    if (!this.running) { //not runinng;
        this.cronJob.start();
        this.parent.Service.startService.call(this);
    }

}
CronService.prototype.stopService=function(){
    if (this.running){
        this.cronJob.stop();
        this.parent.Service.stopService.call(this);
    }
}
CronService.prototype.initCron = function() {
    var that=this;
    this.cronJob = new CronJob({
        "cronTime": this.cronTab,
        "start":false,
        "onTick":function(){
            that.run.call(that);
        }
    });
}

CronService.prototype.run=function(){
    this.parent.Service.run.call(this);

}
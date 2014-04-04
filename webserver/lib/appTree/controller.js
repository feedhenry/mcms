//this file controls the behaviour of appTree module. like some events will trigger re-generation of appTree.

var events=require("../../../events");
var async=require("async");
var loadAppTree=require("./loadAppTreeFromDB");
var log = require("../../../logger").getLogger();
events.on(events.msg.updateAppTree,_updateApp);


function _updateApp(){
    log.info("Start to update app tree..");
    loadAppTree.refreshAppTree(function(){
        log.info("App tree updated.");
    });
}
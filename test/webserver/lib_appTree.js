var assert=require("assert");
var mod=require("../../webserver/lib/appTree");
var async=require("async");
var events=require("../../events");

describe("LoadAppTreeFromDB module",function(){
    var curMod=mod.loadAppTreeFromDB;
    before(require("../dbChecker.js"));
    it ("should retrieve expanded app structure",function(done){
        curMod.getAppTree(function(err,appTree,fromMem){
            assert(!err);
            assert(appTree);
            assert(fromMem==false);
            done();
        });
    });

    it ("should retrieve expanded app structure from memory after constructed",function(done){
        curMod.getAppTree(function(err,appTree,fromMem){
            assert(!err);
            assert(appTree);
            assert(fromMem==true);
            done();
        });
    }); 
    it ("should  forcely retrieve expanded app structure from db",function(done){
        curMod.getAppTree(true,function(err,appTree,fromMem){
            assert(!err);
            assert(appTree);
            assert(fromMem==false);
            done();
        });
    }); 
    it ("should receive updateAppTree event and update from db",function(done){
        var refreshTS=curMod.getRefreshStamp();
        events.emit(events.msg.updateAppTree);
        setTimeout(function(){
            var refreshTS1=curMod.getRefreshStamp();
            assert(refreshTS1!=refreshTS);
            done();
        },1000);
    });
});

describe("App tree to JS tree module",function(){
    var curMod=mod.loadJSTree;
    it ("should retrieve jstree structure according to app tree in mem or db",function(done){
        curMod(function(err,res){
            assert(!err);
            assert(res);
            console.log(res);
            done();
        });
    });
});
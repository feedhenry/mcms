var assert = require("assert");
var appCtl = require("../../webserver/controllers/apps.js");
var appTree=require("../../webserver/lib/appTree");
var events = require("../../events");
var dbReady = false;
var async=require("async");
var ids=[];
var AppModel=require("../../webserver/models/apps.js");
var async=require("async");
describe("Apps Controller module", function() {
    before(require("../dbChecker.js"));
    after(function(done){
        async.each(ids,function(item,done){
            AppModel.remove(item,done);
        },function(){
            done();
        });
    });
    it ("can retrieve all app trees",function(done){
        appTree.loadAppTreeFromDB.getAppTree(function(err,res){
            //console.log(res);
            assert(!err);
            assert(res);
            //assert(res.length>0);
            done();
        });
    });

    it ("can retrive app tree containing articles that not exists",function(done){
        var sampleData={
            "alias" : "dublinairport1",
            "name" : "Dublin Airport App",
            "publish" : "true",
            "version" : 8,
            "root" : {
                "cat_5224ae8ec61db2f404000006" : {
                    "art_522891efd878b23406000002" : "mydemoshop",
                    "art_52289284d878b23406000003" : "shop1",
                    "art_5229b3bb91df2e1402000001" : "mynewhtml",
                    "art_5229b54e91df2e1402000003" : "shop12",
                    "art_5229df7791df2e1402000004" : "mytestArticle",
                    "art_5229df7791df2e1999999999" : "moby" //not exists
                }
            }
        };
        AppModel.create(sampleData,function(err,data){
            ids.push(data._id);
            appTree.loadAppTreeFromDB.getAppTree(function(err,res){
                assert(!err);
                assert(res);
                console.log(res);
                done();
            });
        });
    });

    it ("can retrive app tree containing category that not exists",function(done){
        var sampleData={
            "alias" : "dublinairport2",
            "name" : "Dublin Airport App",
            "publish" : "true",
            "version" : 8,
            "root" : {
                "cat_5229df7791df2e1999999999" : { //not exists
                    "art_522891efd878b23406000002" : "mydemoshop",
                    "art_52289284d878b23406000003" : "shop1",
                    "art_5229b3bb91df2e1402000001" : "mynewhtml",
                    "art_5229b54e91df2e1402000003" : "shop12",
                    "art_5229df7791df2e1402000004" : "mytestArticle",
                    "art_5229df7791df2e1999999999" : "moby" //not exists
                }
            }
        };
        AppModel.create(sampleData,function(err,data){
            ids.push(data._id);
             appTree.loadAppTreeFromDB.getAppTree(function(err,res){
                assert(!err);
                assert(res);
                console.log(res);
                done();
            });
        });
    });
});
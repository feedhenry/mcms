// //this file loads app data from DB to construct app tree structure and calc the hash(version) of each app tree
// //module interfaces
// module.exports.getAppTree=getAppTree; //cb(err,appTree:json, fromMem : boolean);
// module.exports.refreshAppTree=refreshAppTree;
// module.exports.getRefreshStamp=getRefreshStamp;
// module.exports.setMemAppTree=setMemAppTree; //set app tree object in memory.
module.exports.legacyAppProcessor=_appProcessor;

//implementation
var appTree=null; //all apptree. structure should be defied in https://docs.google.com/a/feedhenry.com/document/d/1w3czZrPMMqqqH08VyIXDXKWhNrFyALLMJB8Huh-83Po/edit#heading=h.6910eh1xzmk5
var Apps = require("../../models/apps");
var Categories = require("../../models/categories");
var Articles = require("../../../models/articles");
var log = require("../../../logger").getLogger();
var async=require("async");
var refreshStamp=0;
var updating=false;
var handler=[];
function setMemAppTree(_appTree){
    appTree=_appTree;
}
function getAppTree(force, cb){
    if (arguments.length==1){
        cb=force;
        force=false;
    }
    if (force==false && appTree){
         cb(null,appTree,true);
    }else{
        log.silly("AppTree not initialised or forced re-initialise app tree.");
        refreshAppTree(function(){
            cb(null,appTree,false);
        });
    }
}

function getRefreshStamp(){
    return refreshStamp;
}
function refreshAppTree(cb){
    handler.push(cb);
    if (!updating){
        updating=true;
        _worker();
    }
}
function _refreshRes(err,apps){
    log.silly("Callback "+handler.length+" functions");
    function _genFunc(item){
        return function(cb){
            item(err,apps);
            cb();
        }
    }
    var funcs=[];
    while (handler.length){
        funcs.push(_genFunc(handler.pop()));
    }
    async.parallel(funcs,function(){
        log.silly("Callback handlers finished");
    });
}
function _worker(){
    var cb=_refreshRes;
    log.silly("Start to refresh app tree from DB..");
    Apps.findAll(function(err, result) {
        if (err) {
            log.err(err);
            cb(err);
        }
        _buildTree(result, function(err, apps) {
            if (err) {
                log.err(err);
                cb(err);
            }else{
                appTree=apps;
                refreshStamp=new Date().getTime();
                log.silly("App Tree loaded successfully.");
                updating=false;
                cb(null,apps);    
            }
        });
    });
}
function _buildTree(apps, callback) {
    var tmpTree={};
    async.each(apps,function(app,done){
        var id=app._id.toString();
        var alias=app.alias;
        var appStru=tmpTree[alias]={};
        _appProcessor(appStru,app,done);
    },function(){
        callback(null,tmpTree);
    });
}
function _appProcessor(obj,app,cb){
    obj["_id"]=app["_id"].toString();
    obj["name"]=app["name"];
    obj["alias"]=app["alias"];
    obj["version"]=app["version"];
    obj["children"]={};
    var timeStamp=app["lastUpdate"];
    _iterator(obj["children"],app["root"],function(err,timeStampArr){
        if (err){
            log.err(err);
        }
        timeStampArr.push(timeStamp);
        timeStampArr.sort(_tsSort);
        obj["lastUpdate"]=timeStampArr[0];
        cb(err);
    });
}

function _iterator(scope,nestedCategories,cb){
    var funcs=[];
    for (var key in nestedCategories){
        funcs.push(_genIteFunc(scope,key,nestedCategories[key]));
    }
    async.parallel(funcs,cb);
}
function _tsSort(a,b){
    return b-a;
}
function _genIteFunc(scope,key,val){
    return function(cb){
        var arr=key.split("_");
        var idStr=arr[1];
        var type=arr[0];
        if (type ==="cat"){ //category, the value should be json object
            _processCategoryMetaData(idStr,function(err,catMetaData){ //get category meta data
                if (err){
                    log.err(err);
                }
                if (!catMetaData){ //category not exist
                    log.err("Category not exist:"+idStr);
                    return cb(null,0);
                }
                if (scope[catMetaData.alias]){
                    log.warn("Duplicated category alias found: "+catMetaData.alias);
                }
                scope[catMetaData.alias]=catMetaData;
                scope[catMetaData.alias]["children"]={};
                var catTimeStamp=catMetaData.lastUpdate;
                _iterator(scope[catMetaData.alias]["children"],val,function(err,timeStampArr){
                    timeStampArr.push(catTimeStamp);
                    timeStampArr.sort(_tsSort); //sort desc by time stamp;
                    cb(err,timeStampArr[0]); //return latest time stamp.
                });
            });
        }else{ //article, the value could be anything.
            _processArticleMetaData(idStr,function(err,articleMetaData){ //get article meta data
                if (err){
                    log.err(err);
                }
                if (!articleMetaData){ //article not existed
                    log.err("Article not exist:"+idStr);
                    return cb(null,0);
                }
                scope[articleMetaData.alias]=articleMetaData;
                cb(null,articleMetaData.lastUpdate);
            });
        }
    }
}

function _processCategoryMetaData(idStr,cb){
    Categories.read(idStr,cb);
}

function _processArticleMetaData(idStr,cb){
    Articles.collection.findOne({
        "_id":Articles.objectId(idStr)
    },{"alias":true,"name":true,"lastUpdate":true,"_id":true,"publish":true,"cat":true,"type":true,"template":true},cb);
}
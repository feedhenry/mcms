//this file loads app data from DB to construct app tree structure and calc the hash(version) of each app tree
//module interfaces
module.exports.getAppTree = getAppTree; //cb(err,appTree:json, fromMem : boolean);
module.exports.refreshAppTree = refreshAppTree;
module.exports.getRefreshStamp = getRefreshStamp;
module.exports.setMemAppTree = setMemAppTree; //set app tree object in memory.

//sample app structure
//old app:
// {
//     "alias" : "dublin",
//     "name" : "Dublin Airport",
//     "version" : 11,
//     "root" : {
//         "cat_521f736acc6787c72a3f9341" : {
//             "art_521f736acc6787c72a3f9347" : "art1"
//         },
//         "cat_521f736acc6787c72a3f9344" : {

//         },
//         "cat_521f736acc6787c72a3f9346" : {

//         },
//         "cat_521f736acc6787c72a3f9345" : {

//         }
//     },
//     "_id" : ObjectId("521dc57219f3dd1317037aa6"),
//     "lastUpdate" : 1380533680917
// }
// new app:
// {
//     "_id" : ObjectId("528611a7b7b5aac6346fc0df"),
//     "alias" : "test",
//     "children" : {
//         "Airlines" : {
//             "_id" : ObjectId("522dc84808d59ac105000002"),
//             "alias" : "Airlines",
//             "name" : "Airlines",
//             "publish" : "true",
//             "version" : 1,
//             "lastUpdate" : 1378732104546,
//             "children" : {
//                 "_airlines" : {
//                     "_id" : ObjectId("5236e54861b62c6071000001"),
//                     "alias" : "_airlines",
//                     "lastUpdate" : "1379518193144",
//                     "name" : "Airlines",
//                     "publish" : "true"
//                 }
//             }
//         }
//     },
//     "name" : "test",
//     "version" : 8,
//     "lastUpdate" : 1384533415643
// }
//
// categories:
// {
//     "name" : "new",
//     "publish" : "true",
//     "version" : "",
//     "alias" : "new_1384528414059",
//     "lastUpdate" : 1384528414060,
//     "createDate" : ISODate("2013-11-15T15:13:34.060Z"),
//     "_id" : ObjectId("52863a1e18f053fbcf000001")
// }
//
// articles:
// {
//     "_id" : ObjectId("521f736acc6787c72a3f9347"),
//     "alias" : "art1",
//     "content" : "",
//     "name" : "Article 1",
//     "publish" : true,
//     "type" : "web",
//     "version" : 1,
//     "apps" : [ ],
//     "categories" : [ ]
// }

//implementation
var appTree = null; //all apptree. structure should be defied in https://docs.google.com/a/feedhenry.com/document/d/1w3czZrPMMqqqH08VyIXDXKWhNrFyALLMJB8Huh-83Po/edit#heading=h.6910eh1xzmk5
var Apps = require("../../models/apps");
var Categories = require("../../models/categories");
var Articles = require("../../../models/articles");
var log = require("../../../logger").getLogger();
var legacyAppProcessor = require("./loadAppTreeFromDB_old.js").legacyAppProcessor;
var async = require("async");
var refreshStamp = 0;
var updating = false;
var handler = [];

function setMemAppTree(_appTree) {
    appTree = _appTree;
}

function getAppTree(force, cb) {
    if (arguments.length == 1) {
        cb = force;
        force = false;
    }

    if (force == false && appTree) {
        cb(null, appTree, true);
    } else {
        log.silly("AppTree not initialised or forced re-initialise app tree.");
        refreshAppTree(function() {
            cb(null, appTree, false);
        });
    }
}

function getRefreshStamp() {
    return refreshStamp;
}

function refreshAppTree(cb) {
    handler.push(cb);
    if (!updating) {
        updating = true;
        _worker();
    }
}

function _refreshRes(err, apps) {
    log.silly("Callback " + handler.length + " functions");

    function _genFunc(item) {
        return function(cb) {
            item(err, apps);
            cb();
        }
    }
    var funcs = [];
    while (handler.length) {
        funcs.push(_genFunc(handler.pop()));
    }
    async.parallel(funcs, function() {
        log.silly("Callback handlers finished");
    });
}

function _worker() {
    var cb = _refreshRes;

    log.silly("Start to refresh app tree from DB..");

    function buildTreeCallback(err, apps) {
        if (err) {
            log.err(err);
            cb(err);
        } else {
            appTree = apps;
            refreshStamp = new Date().getTime();
            log.silly("App Tree loaded successfully.");
            updating = false;
            cb(null, apps);
        }
    }
    Apps.findAll(function(err, result) {
        if (err) {
            log.err(err);
            cb(err);
        }
        _buildTree(result, buildTreeCallback);
    });
}

function _buildTree(apps, callback) {
    var tmpTree = {};
    async.each(apps, function(app, done) {
        var id = app._id.toString();
        var alias = app.alias;
        var appStru = tmpTree[alias] = {};
        if (app.root){
            log.warn("Legacy app structure found.");
            legacyAppProcessor(appStru,app,done);
        }else{
            _appProcessor(appStru, app, done);    
        }
        
    }, function() {
        callback(null, tmpTree);
    });
}

function _appProcessor(obj, app, cb) {
    obj["_id"] = app["_id"].toString();
    obj["name"] = app["name"];
    obj["alias"] = app["alias"];
    obj["version"] = app["version"];
    obj["children"] = {};
    var timeStamp = app["lastUpdate"];
    _iterator(obj["children"], app["children"], function(err, timeStampArr) {
        if (err) {
            log.err(err);
        }
        timeStampArr.push(timeStamp);
        timeStampArr.sort(_tsSort);
        obj["lastUpdate"] = timeStampArr[0];
        //update the data in the structure so it now stores all the updated information
        //that has been pulled by reading the categories and articles collections
        // Apps.update(app["_id"], obj, cb(err));
        cb(err);
    });
}

function _iterator(scope, nestedCategories, cb) {
    var funcs = [];
    for (var key in nestedCategories) {
        funcs.push(_genIteFunc(scope, key, nestedCategories[key]));
    }
    async.parallel(funcs, cb);
}

function _tsSort(a, b) {
    return b - a;
}

function _genIteFunc(scope, key, val) {
    return function(cb) {
        if (val["children"]) {
            _processCategoryMetaData(val["_id"], function(err, catMetaData) { //get category meta data
                if (err) {
                    log.err(err);
                }

                if (!catMetaData) { //category not exist
                    log.err("Category not exist:" + val["_id"]);
                    return cb(null, 0);
                }

                if (scope[catMetaData.alias]) {
                    log.warn("Duplicated category alias found: " + catMetaData.alias);
                }

                scope[catMetaData.alias] = catMetaData;
                scope[catMetaData.alias]["children"] = {};
                scope[catMetaData.alias]["rank"] = val["rank"]; //rank is not stored in the category so it is set 
                //from the retreived app structure 


                var catTimeStamp = catMetaData.lastUpdate;

                _iterator(scope[catMetaData.alias]["children"], val["children"], function(err, timeStampArr) {
                    timeStampArr.push(catTimeStamp);
                    timeStampArr.sort(_tsSort); //sort desc by time stamp;
                    cb(err, timeStampArr[0]); //return latest time stamp.
                });
            });
        } else {
            //article, the value could be anything.
            _processArticleMetaData(val["_id"], function(err, articleMetaData) { //get article meta data
                if (err) {
                    log.err(err);
                }

                if (!articleMetaData) { //article not existed
                    log.err("Article not exist:" + val["_id"]);

                    return cb(null, 0);
                }

                scope[articleMetaData.alias] = articleMetaData;
                scope[articleMetaData.alias]["rank"] = val["rank"]; //rank is not stored in the article so it is set 
                //from the retreived app structure 

                cb(null, articleMetaData.lastUpdate);
            });
        }
    }
}

function _processCategoryMetaData(idStr, cb) {
    Categories.read(idStr, cb);
}

function _processArticleMetaData(idStr, cb) {
    Articles.collection.findOne({
        "_id": idStr
    }, {
        "alias": true,
        "name": true,
        "lastUpdate": true,
        "_id": true,
        "publish": true,
        "cat": true,
        "type": true,
        "template": true
    }, cb);
}
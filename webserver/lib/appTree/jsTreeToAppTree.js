//this file process the js tree from browser and
//converts to application tree and store in db.
//module interfaces
module.exports = processFunc;

var async = require("async");
var Apps = require("../../models/apps");
var Categories = require("../../models/categories");
var Articles = require("../../../models/articles");

function processFunc(treeObj, cb) {
    var apps = new Array();
    async.eachSeries(treeObj, function(item, done) {
            _processApp(item, function(err, result) {
                if (err) {
                    log.err(err);
                    return done();
                }

                apps.push(result);
                done();
            });
        },
        function(err) {
            if (err) {
                log.err();
            }

            async.eachSeries(apps, function(item, done) {
                    var id = item._id;
                    delete item._id;
                    Apps.update(id, item, function(err, result) {
                        if (err) {
                            log.err(err);
                            return done();
                        }
                        done();
                    });
                },
                function(err) {
                    if (err) {
                        log.err(err);
                    }

                    cb();
                });
        });
}


function _processApp(item, callback) {
    var appObject = {
        "_id": item.attr.id,
        "alias": item.metadata.alias,
        "name": item.data,
        "version": item.metadata.version,
        "children": {},
        "lastUpdate": new Date().getTime()
    };

    if (item.children) {
        async.eachSeries(item.children, function(item, done) {
            _processChild(item, function(err, result) {
                if (err) {
                    done(err);
                }
                var key = Object.keys(result)[0];
                appObject.children[key] = result[key];
                done();
            });
        }, function(err) {
            if (err) {
                callback(err, null);
            }

            callback(null, appObject);
        });
    } else {
        callback(null, appObject);
    }
}

function _processChild(item, callback) {
    if (item.attr.rel === "article") {
        _processContent(item, function(err, article) {
            if (err) {
                callback(err, null);
            }

            callback(null, article);
        });
    } else {
        _processCategory(item, function(err, category) {
            if (err) {
                callback(err, null);
            }
            callback(null, category);
        });
    }
}

function _processCategory(item, callback) {
    var childA = {};

    if (item.children) {
        async.eachSeries(item.children, function(child, done) {
            _processChild(child, function(err, result) {
                if (err) {
                    done(err);
                }

                var key = Object.keys(result)[0];
                childA[key] = result[key];

                done();
            });
        }, function(err) {
            if (err) {
                callback(err, null);
            }

            var category = {};

            Categories.read(item.attr.id, function(err, result) {
                if (err) {
                    callback(err, null);
                }
                var rank = 0;
                if (item.metadata.rank != undefined && item.metadata.rank != "undefined" && item.metadata.rank >= 0) {
                    rank = item.metadata.rank;
                }

                category[result.alias] = {
                    "_id": result._id,
                    "alias": result.alias,
                    "name": result.name,
                    "publish": result.publish,
                    "version": result.version,
                    "lastUpdate": result.lastUpdate,
                    "children": childA,
                    "rank": rank
                    //from the passed in js tree 
                };

                callback(null, category);
            });
        });
    } else {
        var category = {};
        Categories.read(item.attr.id, function(err, result) {
            if (err) {
                callback(err, null);
            }
            var rank=0;
            if (item.metadata.rank != undefined && item.metadata.rank != "undefined" && item.metadata.rank >= 0) {
                rank = item.metadata.rank;
            }
            category[result.alias] = {
                "_id": result._id,
                "alias": result.alias,
                "name": result.name,
                "publish": result.publish,
                "version": result.version,
                "lastUpdate": result.lastUpdate,
                "children": childA,
                "rank": rank
                //from the passed in js tree 
            };

            callback(null, category);
        });
    }
}

function _processContent(item, callback) {
    var article = {};
    // console.log(item);
    Articles.collection.findOne({
        "_id": Articles.objectId(item.attr.id)
    }, {
        "alias": true,
        "name": true,
        "lastUpdate": true,
        "_id": true,
        "publish": true,
        "cat": true,
        "type": true,
        "template": true
    }, function(err, result) {
        if (err) {
            console.log(err);
           return callback(err, null);
        }
        article[result.alias] = {
            "_id": result._id,
            "alias": result.alias,
            "name": result.name,
            "publish": result.publish,
            "version": result.version,
            "lastUpdate": result.lastUpdate,
            "rank": item.metadata.rank || 0 //rank is not stored in the article so it is set 
            //from the passed in js tree 
        };
        // console.log(item);
        callback(null, article);
    });
}
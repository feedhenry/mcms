module.exports = {
    loadIndex: loadIndex,
    loadCreate: loadCreate,
    loadEdit: loadEdit,
    loadCategoryAdd: loadCategoryAdd,
    loadCategoryEdit: loadCategoryEdit,
    loadArticleEdit: loadArticleEdit,
    retrieveJsTree: retrieveJsTree,
    retrieveCategoryTree: retrieveCategoryTree,
    updateAppTree: updateAppTree,
    create: create,
    update: update,
    deactivate: deactivate,
    createCategory: createCategory,
    updateCategory: updateCategory,
    //    deactivateCategory: deactivateCategory,
    //    createArticle: createArticle,
    // updateArticle: updateArticle,
    getAppsTimestamp: getAppsTimestamp,
    appInfo: appInfo,
    catInfo: catInfo,
    articleInfo: articleInfo,
    loadArticleAdd: loadArticleAdd,
    getAppStructure:getAppStructure
    //    deactivateArticle: deactivateArticle
};

var async = require("async");
var Apps = require("../models/apps");
var Categories = require("../models/categories");
var Articles = require("../../models/articles");
var log = require("../../logger").getLogger();
var appTree=require("../lib/appTree");

function loadIndex(req, res) {
    res.render("apps/index", {
        title: "Apps",
        sessionUser: req.session.user
    });
}

function getAppsTimestamp(req, res, next) {
    res.json({
        timestamp: Apps.getLatestTimestamp()
    });
}

function getAppStructure(req, res){
    var params = req.params;
    var app = params.app || "DublinApp";
    var lastUpdate = params.lastUpdate || 0;
    appTree.loadAppTreeFromDB.getAppTree(function(err,appTree) {
        var rtn = {
            lastUpdate: lastUpdate,
            content: {},
            extraInfo: ""
        };

        if (appTree[app]){
            var obj = appTree[app];

            if (obj.lastUpdate > lastUpdate) {
                rtn.content = obj;
                rtn.lastUpdate = obj.lastUpdate;
                extraInfo:"updated"
            } else{
                rtn.extraInfo = "no update";
            }
        } else {
            rtn.extraInfo = "app not found";
        }

        res.json(rtn);
    });
}

function retrieveJsTree(req, res, next) {
    var st = new Date().getTime();
    appTree.loadJSTree(function(err, result) {
        if (err) {
            res.status(500).end(err);
        } else {
            var ed = new Date().getTime();
            console.log("time used:" + (ed-st) + "ms");
            res.json(result);
        }
    });
}

function retrieveCategoryTree(req, res) {
    buildCategory(req.category._id, req.params.rank, null, function(err, result) {
        if (err) {
            callback(err, null);
        }
        res.json(result);
    });
}

function updateAppTree(req, res, next) {
    appTree.saveAppTree(req.body, function(err,result){
        if (err) {
            log.err(err);
            // Duplicate Key Error.
            if (err.code === 11000) {
                res.send("Conflict", 409);
            } else {
                if (err.name === "ValidationError") {
                    return res.send(Object.keys(err.errors).map(function(errField) {
                        return err.errors[errField].message;
                    }).join(". "), 406);
                } else {
                    res.status(500).end(err);
                }
            }
            return;
        }

        res.render("../views/partials/appEditorAppUpdated", {
            layout: false
        });
    });
}

function create(req, res, next) {
    req.body.children = {};

    Apps.create(req.body, function(err, item) {
        if (err) {
            // Duplicate Key Error.
            if (err.code === 11000) {
                res.send("Conflict", 409);
            } else {
                if (err.name === "ValidationError") {
                    return res.send(Object.keys(err.errors).map(
                        function(errField) {
                            return err.errors[errField].message;
                        }).join(". "), 406);
                } else {
                    next(err);
                }
            }
            return;
        }

        res.render("../views/partials/appEditorAppCreated", {
            layout: false,
            application: item
        });
    });
}

function update(req, res, next) {
    Apps.update(req.application._id, req.body, function(err, item) {
        if (err) {
            // Duplicate Key Error.
            if (err.code === 11000) {
                res.send("Conflict", 409);
            } else {
                if (err.name === "ValidationError") {
                    return res.send(Object.keys(err.errors).map(
                        function(errField) {
                            return err.errors[errField].message;
                        }).join(". "), 406);
                } else {
                    next(err);
                }
            }
            return;
        }

        res.render("../views/partials/appEditorAppUpdated", {
            layout: false,
            application: item
        });
    });
}

function deactivate(req, res, next) {
    Apps.remove(req.application._id, function(err, item) {
        if (err) {
            return next(err);
        }
        res.render("../views/partials/appEditorAppDeleted", {
            layout: false,
            application: item
        });
    });
}

function createCategory(req, res, next) {
    Categories.create(req.body, function(err, item) {
        if (err) {
            // Duplicate Key Error.
            if (err.code === 11000) {
                res.send("Conflict", 409);
            } else {
                if (err.name === "ValidationError") {
                    return res.send(Object.keys(err.errors).map(
                        function(errField) {
                            return err.errors[errField].message;
                        }).join(". "), 406);
                } else {
                    next(err);
                }
            }

            return;
        }

        buildCategory(item._id, 0, null, function(err, result) {
            if (err) {
                callback(err, null);
            }

            res.json(result);
        });
    });
}

function buildCategory(id, rank, children, callback) {
    Categories.findById(id, function(err, result) {
        if (err) {
            return callback(err, null);
        }

        if (!result){
            return callback("Category not found: "+id,null);
        }
        var category = {
            "data": result.name,
            "attr": {
                "id": result._id,
                "rel": "category",
                "data-alias": result.alias,
                "data-version": result.version,
                "data-publish": result.publish,
                "data-lastupdate": result.lastUpdate,
                "data-rank": rank
            }
        };

        if (children !== null && children.length > 0) {
            category["children"] = children;
            category["state"] = "open";
        }
        callback(null, category);
    });
}

function updateCategory(req, res, next) {
    Categories.update(req.category._id, req.body, function(err, item) {
        if (err) {
            // Duplicate Key Error.
            if (err.code === 11000) {
                res.send("Conflict", 409);
            } else {
                if (err.name === "ValidationError") {
                    return res.send(Object.keys(err.errors).map(
                        function(errField) {
                            return err.errors[errField].message;
                        }).join(". "), 406);
                } else {
                    next(err);
                }
            }

            return;
        }

        res.render("../views/partials/appEditorCategoryUpdated", {
            layout: false,
            category: item
        });
    });
}

//function deactivateArticle(req, res, next) {
//
//}

function loadCreate(req, res) {
    res.render("../views/partials/appCreateForm", {
        layout: false
    });
}

function loadEdit(req, res) {
    res.render("../views/partials/appEditForm", {
        layout: false,
        application: req.application
    });
}

function loadCategoryAdd(req, res) {
    Categories.findAll(function(err, result) {
        if (err) {
            log.error(err);
        }

        res.render("../views/partials/categoryCreateForm", {
            layout: false,
            categories: result
        });
    });
}

function loadArticleAdd(req, res) {
    Articles.findAll(function(err, result) {
        if (err) {
            log.error(err);
        }

        res.render("../views/partials/articleCreateForm.ejs", {
            layout: false,
            articles: result
        });
    });
}

function loadCategoryEdit(req, res) {
    res.render("../views/partials/categoryEditForm", {
        layout: false,
        category: req.category
    });
}

function loadArticleEdit(req, res) {
    res.render("../views/partials/articleEditForm", {
        layout: false,
        article: req.article
    });
}

function appInfo(req, res) {
    res.render("../views/partials/appInfo", {
        layout: false,
        application: req.application
    });
}

function catInfo(req, res) {
    res.render("../views/partials/catInfo", {
        layout: false,
        category: req.category
    });
}

function articleInfo(req, res) {
    res.render("../views/partials/articleInfo", {
        layout: false,
        article: req.article
    });
}
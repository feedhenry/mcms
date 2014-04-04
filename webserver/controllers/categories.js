module.exports = {
    loadIndex: loadIndex,
    loadCreate: loadCreate,
    loadEdit: loadEdit,
    create: create,
    update: update,
    deleteCategory: deleteCategory
};

var async = require("async");
var Categories = require("../models/categories");
var events=require("../../events");
function loadIndex(req, res, next) {
    Categories.findAll(function(err, results) {
        if (err) {
            return next(err);
        }
        res.render("categories/index", {
            title: "Categories",
            sessionUser: req.session.user,
            categories: results
        });
    });
}

function loadCreate(req, res) {
    res.render("categories/create", {
        title: "Add New Category",
        sessionUser: req.session.user
    });
}

function loadEdit(req, res) {
    res.render("categories/edit", {
        title: "Category",
        sessionUser: req.session.user,
        category: req.category
    });
}

function create(req, res, next) {
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
        res.redirect("/cms/categories");
    });  
}

function update(req, res, next) {
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
        events.emit(events.msg.updateAppTree);
        res.redirect("/cms/categories");
    });
}

function deleteCategory(req, res, next) {
    Categories.remove(req.category._id, function(err, item) {
        if (err) {
            return next(err);
        }
        events.emit(events.msg.updateAppTree);
        res.redirect("/cms/categories");
    });
}
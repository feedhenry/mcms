module.exports = {
    loadIndex: loadIndex,
    loadCreate: loadCreate,
    loadEdit: loadEdit,
    create: create,
    update: update,
    deactivate: deactivate
};

var async = require("async");
var Users = require("../models/users");

function loadIndex(req, res, next) {
    Users.findAll(function(err, results) {
        if (err) {
            return next(err);
        }
        res.render("users/index", {
            title: "User Administration",
            sessionUser: req.session.user,
            users: results
        });
    });
}

function loadCreate(req, res) {
    res.render("users/create", {
        title: "Add New User",
        sessionUser: req.session.user
    });
}

function loadEdit(req, res) {
    res.render("users/edit", {
        title: "User",
        sessionUser: req.session.user,
        user: req.user
    });
}

function create(req, res, next) {
    Users.create(req.body, function(err, item) {
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
        res.redirect("/cms/users");
    });
}

function update(req, res, next) {
    Users.update(req.user._id, req.body, function(err, item) {
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
        res.redirect("/cms/users");
    });
}

function deactivate(req, res, next) {
    Users.remove(req.user._id, function(err, item) {
        if (err) {
            return next(err);
        }
        res.redirect("/cms/users");
    });
}
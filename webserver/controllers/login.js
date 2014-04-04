module.exports = {
    loadIndex: loadIndex,
    saveSession: saveSession,
    deleteSession: deleteSession
};

var Users = require("../models/users");
var myUtils=require("../util");

function loadIndex(req, res) {
    res.render("login/index");
}

function saveSession(req, res) {
    Users.findByEmail(req.body.email, function(err, user) {
        if (user && (user.password == myUtils.md5(req.body.password) || user.password==req.body.password)) {
            req.session.user = user;
            res.redirect("/cms/dashboard");
        } else {
            res.redirect("/cms/login");
        }
    });
}

function deleteSession(req, res) {
    delete req.session.user;
    res.redirect("/cms/login");
}
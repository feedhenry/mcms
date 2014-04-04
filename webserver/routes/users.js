var session = require("./middleware/session");
var user = require("./middleware/users");
var controller = require("../controllers/users");

module.exports = function(app) {
    app.get("/cms/users",
        session.loggedIn,
        function(req, res, next) {
            controller.loadIndex(req, res, next);
        }
    );

    app.get("/cms/users/create",
        session.loggedIn,
        function(req, res) {
            controller.loadCreate(req, res);
        }
    );

    app.post("/cms/users/save",
        session.loggedIn,
        function(req, res, next) {
            controller.create(req, res, next);
        }
    );

    app.get("/cms/users/:username", [session.loggedIn, user.loadUser],
        function(req, res) {
            controller.loadEdit(req, res);
        }
    );

    app.post("/cms/users/:username/save", [session.loggedIn, user.loadUser],
        function(req, res, next) {
            controller.update(req, res, next);
        }
    );

    app.post("/cms/users/:username/delete", [session.loggedIn, user.loadUser],
        function(req, res, next) {
            controller.deactivate(req, res, next);
        }
    );
};
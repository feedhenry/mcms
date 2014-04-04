var session = require("./middleware/session");
var controller = require("../controllers/login");

module.exports = function(app) {
    app.get("/cms/login",
        session.loggedOut,
        function(req, res) {
            controller.loadIndex(req, res);;
        }
    );

    app.post("/cms/saveSession",
        // session.loggedOut,
        function(req, res) {
            controller.saveSession(req, res);
        }
    );

    app.get("/cms/logout",
        session.loggedIn,
        function(req, res) {
            controller.deleteSession(req, res);
        }
    );
};
var session = require("./middleware/session");
var controller = require("../controllers/dashboard");

module.exports = function(app) {
    app.get("/cms/dashboard",
        session.loggedIn,
        function(req, res) {
            controller.loadIndex(req, res);
        }
    );
};
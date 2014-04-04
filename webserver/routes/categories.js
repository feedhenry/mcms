var session = require("./middleware/session");
var category = require("./middleware/categories");
var controller = require("../controllers/categories");

module.exports = function(app) {
    app.get("/cms/categories",
        session.loggedIn,
        function(req, res, next) {
            controller.loadIndex(req, res, next);
        }
    );

    app.get("/cms/categories/create",
        session.loggedIn,
        function(req, res, next) {
            controller.loadCreate(req, res, next);
        }
    );

    app.post("/cms/categories/save",
        session.loggedIn,
        function(req, res) {
            controller.create(req, res);
        }
    );

    app.get("/cms/categories/:alias", [session.loggedIn, category.loadCategory],
        function(req, res) {
            controller.loadEdit(req, res);
        }
    );

    app.post("/cms/categories/:alias/save", [session.loggedIn, category.loadCategory],
        function(req, res, next) {
            controller.update(req, res, next);
        }
    );

    app.post("/cms/categories/:_id/delete", [session.loggedIn, category.loadCategory],controller.deleteCategory);
};
var controller = require("../controllers/index");

module.exports = function(app) {
    app.get("/cms", function(req, res) {
        controller.loadIndex(req, res);
    });
};
module.exports = {
    loadApp: loadApp
};

var Apps = require("../../../models/apps");
var util=require("../../../util");
function loadApp(req, res, next) {
    Apps.findByAlias(req.params.alias, function(err, item) {
        if (err) {
            return next(err);
        }
        if (!item) {
            return res.send("Not found", 404);
        }
        req.application = util.wrapObj(item);
        next();
    });
}
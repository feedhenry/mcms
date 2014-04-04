module.exports = {
    loadUser: loadUser
};

var User = require("../../../models/users");
var util=require("../../../util");
function loadUser(req, res, next) {
    User.findByUsername(req.params.username, function(err, item) {
        if (err) {
            return next(err);
        }
        if (!item) {
            return res.send("Not found", 404);
        }
        req.user = util.wrapObj(item);
        next();
    });
}
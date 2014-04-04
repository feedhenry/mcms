module.exports = {
    loadCategory: loadCategory
};

var Categories = require("../../../models/categories");
var util=require("../../../util");
function loadCategory(req, res, next) {
    if (req.params.alias){
        Categories.findByAlias(req.params.alias, function(err, item) {
            if (err) {
                return next(err);
            }
            if (!item) {
                return res.send("Not found", 404);
            }
            req.category = util.wrapObj(item);
            next();
        });
    }else if (req.params._id){
        Categories.findById(req.params._id, function(err, item) {
            if (err) {
                return next(err);
            }
            if (!item) {
                return res.send("Not found", 404);
            }
            req.category = util.wrapObj(item);
            next();
        });
    }
    
}
module.exports = {
    loadArticle: loadArticle
};
var Articles = require("../../../../models/articles");
var util=require("../../../util");
function loadArticle(req, res, next) {
    if (req.params.alias){
        Articles.findByAlias(req.params.alias, function(err, item) {
            if (err) {
                return next(err);
            }
            if (!item) {
                return res.send("Not found", 404);
            }
            req.article = util.wrapObj(item);
            next();
        });    
    }else if (req.params._id){
        Articles.findById(req.params._id, function(err, item) {
            if (err) {
                return next(err);
            }
            if (!item) {
                return res.send("Not found", 404);
            }
            req.article = util.wrapObj(item);
            next();
        });   
    }
    
}
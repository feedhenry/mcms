var session = require("./middleware/session");
var article = require("./middleware/articles");
var controller = require("../controllers/articles");

module.exports = function(app) {
    app.get("/cms/articles",
        session.loggedIn,
        function(req, res, next) {
            controller.loadIndex(req, res, next);
        }
    );

    app.get("/cms/articles/choosecontent",[session.loggedIn],controller.chooseContent);
    app.get("/cms/articles/applytemplatechanges/:templateName",[session.loggedIn],controller.applyTemplateChange);
    app.get("/cms/articles/importcontent",[session.loggedIn],controller.importContent);
    app.get("/cms/articles/preview/:alias",[session.loggedIn,article.loadArticle],controller.preview);
    app.get("/cms/articles/edit/:alias",[session.loggedIn,article.loadArticle],controller.editView);
    
   // app.get("/cms/articles/airline/remove/:timestamp",session.loggedIn,controller.removeAirline);
    app.post("/cms/articles/import/:type",session.loggedIn,controller.importContentSave);
    app.get("/cms/articles/load/:id",controller.getContent);
    app.get("/cms/articles/create/:cat/:type/:template",session.loggedIn,controller.loadCreate);
    app.post("/cms/articles/save/:cat/:type/:template",session.loggedIn,controller.upsert);
    app.post("/api/upsertContent/:cat/:type/:template",controller.apiUpsert)
    app.get("/cms/articles/delete/:cat/:type/:template/:_id",session.loggedIn,controller.deleteArticle);
    //app.post("/cms/articles/:_id/delete", [session.loggedIn, article.loadArticle],controller.deleteArticle);
    app.get("/cms/articles/loadExtra/:cat/:type/:template/:extraId",controller.getExtraContent);
};
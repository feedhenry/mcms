var session = require("./middleware/session");
var application = require("./middleware/apps");
var category = require("./middleware/categories");
var article = require("./middleware/articles");
var controller = require("../controllers/apps");

module.exports = function(app) {
    app.get("/cms/apps",
        session.loggedIn,
        function(req, res) {
            controller.loadIndex(req, res);
        }
    );

    app.get("/cms/apps/tree",
        session.loggedIn,
        function(req, res, next) {
            controller.retrieveJsTree(req, res, next);
        }
    );

    app.get("/cms/apps/create",
        session.loggedIn,
        function(req, res) {
            controller.loadCreate(req, res);
        }
    );

    app.post("/cms/apps/save",
        session.loggedIn,
        function(req, res, next) {
            controller.create(req, res, next);
        }
    );

    app.post("/cms/apps/update",
        session.loggedIn,
        function(req, res, next) {
            controller.updateAppTree(req, res, next);
        }
    );

    app.get("/cms/apps/timestamp", session.loggedIn, function(req, res, next) {
        controller.getAppsTimestamp(req, res, next);
    });

    app.get("/cms/apps/app/info/:alias",[session.loggedIn, application.loadApp],function(req,res){
        controller.appInfo(req,res);
    });
    app.post("/cms/apps/:alias", [session.loggedIn, application.loadApp],
        function(req, res) {
            controller.loadEdit(req, res);
        }
    );

    app.post("/cms/apps/category/save",
        session.loggedIn,
        function(req, res, next) {
            controller.createCategory(req, res, next);
        }
    );

    app.post("/cms/apps/:alias/save", [session.loggedIn, application.loadApp],
        function(req, res, next) {
            controller.update(req, res, next);
        }
    );

    app.post("/cms/apps/:alias/delete", [session.loggedIn, application.loadApp],
        function(req, res, next) {
            controller.deactivate(req, res, next);
        }
    );

    app.get("/cms/apps/category/add",
        session.loggedIn,
        function(req, res, next) {
            controller.loadCategoryAdd(req, res, next);
        }
    );

    app.post("/cms/apps/category/tree/:alias/:rank", [session.loggedIn, category.loadCategory],
        function(req, res) {
            controller.retrieveCategoryTree(req, res);
        }
    );
    app.get("/cms/apps/category/info/:alias", [session.loggedIn, category.loadCategory],
        function(req,res){
            controller.catInfo(req,res);
        }
    );
    app.post("/cms/apps/category/:alias", [session.loggedIn, category.loadCategory],
        function(req, res) {
            controller.loadCategoryEdit(req, res);
        }
    );

    app.post("/cms/apps/category/:alias/save", [session.loggedIn, category.loadCategory],
        function(req, res, next) {
            controller.updateCategory(req, res, next);
        }
    );
   app.get("/cms/apps/article/add",
       [session.loggedIn],
       function(req, res, next) {
           controller.loadArticleAdd(req, res, next);
       }
   );
    
    //    app.post("/cms/apps/:alias/:category/:article/save",
    //        [session.loggedIn, application.loadApp],
    //        function(req, res, next) {
    //            controller.createArticle(req, res, next);
    //    });

    app.get("/cms/apps/article/info/:alias", [session.loggedIn, article.loadArticle],
        function(req,res){
            controller.articleInfo(req,res);
        }
    );

    app.post("/cms/apps/article/:alias", [session.loggedIn, article.loadArticle],
        function(req, res) {
            controller.loadArticleEdit(req, res);
        }
    );

    // app.post("/cms/apps/article/:alias/save", [session.loggedIn, article.loadArticle],
    //     function(req, res, next) {
    //         controller.updateArticle(req, res, next);
    //     }
    // );
    app.get("/cms/apps/structure/:app/:lastUpdate",controller.getAppStructure);
};
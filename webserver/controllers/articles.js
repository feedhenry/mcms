module.exports = {
    loadIndex: loadIndex,
    loadCreate: loadCreate,
    editView: editView,
    upsert: upsert,
    deleteArticle: deleteArticle,
    preview: preview,
    chooseContent: chooseContent,
    importContent:importContent,
    getContent:getContent,
    applyTemplateChange:applyTemplateChange,
    importContentSave:importContentSave,
    getExtraContent:getExtraContent,
    apiUpsert:apiUpsert
};

var async = require("async");
var Articles = require("../../models/articles");
var log=require("../../logger").getLogger();
var Airline=require("../models/airline");
var util=require('../util');
var importers=require("../lib/importContent");
var fs=require("fs");
function getExtraContent(req,res){
    var contentCom=getContentCom(req);
    contentCom.getExtra(req.params.extraId,function(err,result){
        if (err){
            return res.status(500).end(err);
        }else{
            res.json(result);
        }
    });
}
function importContent(req,res){
    res.render("articles/importcontent", {
        sessionUser: req.session.user
    });
}
function chooseContent(req, res) {
    res.render("articles/choosecontent", {
        sessionUser: req.session.user
    });
}

function preview(req, res) {
    var article = req.article;
    res.render("articles/preview", {
        article: article,
        "layout": false
    });
}

function loadIndex(req, res, next) {
    Articles.collection.find({},{
        "_id":true,
        "name":true,
        "alias":true,
        "type":true,
        "cat":true,
        "template":true
    }).toArray(function(err, results) {
        if (err) {
            return next(err);
        }
        res.render("articles/index", {
            title: "Articles",
            sessionUser: req.session.user,
            articles: results
        });
    });
}

function loadCreate(req, res) {
    var contentCom=getContentCom(req);
    var cat = req.params.cat || "core";
    var type = req.params.type || "html";
    var template = req.params.template || null;
    var name = contentCom.getUName().toUpperCase();
    var editMode=req.params.editMode? true:false;
    var showMeta = true;
    var props = {
        title: "New " + name.toUpperCase(),
        showMeta: showMeta,
        cat: cat,
        type: type,
        template: template,
        name: name,
        sessionUser: req.session.user,
        article:req.article?req.article:undefined,
        _id:req.article?req.article._id:"",
        editMode:editMode
    };
    contentCom.render(res,props);
}

function editView(req, res) {
    var article=req.article;
    req.params.cat=article.cat;
    req.params.type=article.type;
    req.params.template=article.template;
    req.params.editMode=true;
    loadCreate(req,res);
}
function getContentCom(req){
    var contentMetaPathTem=__dirname+"/../lib/contentTypes/{cat}/{name}.js";
    var cat=req.params.cat;
    var type=req.params.type;
    var template=req.params.template;
    var name=template?template:type;
    var contentMetaPath=contentMetaPathTem.replace("{cat}",cat).replace("{name}",name);
    log.silly(contentMetaPath);
    var ContentMeta=require("../lib/contentTypes/default.js");
    if (fs.existsSync(contentMetaPath)){
        ContentMeta=require(contentMetaPath);
        return new ContentMeta(req);
    }else{
        return new ContentMeta(cat,type,template);
    }
}
function apiUpsert(req,res){
    var com=getContentCom(req);
    console.log(req.body);
    console.log(req.files);
    res.end("{}");
}
// create or update for general data
function upsert(req, res, next) {
    var contentMeta=getContentCom(req);
   // return res.json(req.body);
    contentMeta.upsert(req.body, function(err,url){
        if (err){
            res.status(500).end(err);
        }else{
            res.redirect(url);
        }
    });
}

function deleteArticle(req, res, next) {
    var contentCom=getContentCom(req);
    var id=req.params._id;
    contentCom.remove(id, function(err, redirecURL) {
        if (err) {
            return next(err);
        }
        res.redirect(redirecURL);
    });
}
//get content and return as json. used by mobile client
function  getContent(req,res){
    var id=req.params.id;
    Articles.read(id,function(err,result){
        if (err){
            return res.status(500).end(err);
        }else{
            res.json(result);
        }
    });
}

function applyTemplateChange(req,res){
    var template=req.params.templateName;
    var cursor=Articles.collection.find({"template":template},{"content":false});
    cursor.toArray(function(err,contents){
        async.each(contents,function(item,done){
            Articles.processContent(item,function(err,newItem){
                Articles.update(newItem,done);
            });
        },function(err){
            if (err){
                res.status(500).end(err);
            }else{
                res.end("Template has been applied to all related content");
            }
        });
    });
}

function importContentSave(req,res){
    var type=req.params.type;
    var body=req.body;
    var importerFunc=importers[type];
    importerFunc(body,function(err,result){
        if (err){
            res.status(500).end(err);
        }else{
            res.end("Content imported");
        }
    });
}
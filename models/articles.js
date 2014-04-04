var DataModel=require("./DataModel.js");
var util=require("util");
var log=require("../logger").getLogger();
var parser=require("../webserver/lib/articleprocess");
var myUtil=require("../webserver/util");
var events=require("../events");
function ArticleModel(){
    DataModel.call(this,"articles");
};
util.inherits(ArticleModel,DataModel);
ArticleModel.prototype.parent=DataModel.prototype; //level1 inheritance support. 

ArticleModel.prototype.create=function(data,cb){
    var that=this;
    if (!data.uniqueAlias){
        data.alias=myUtil.aliasGen(data.name||"");    
    }
    this.parent.create.call(this,data,cb);
}

ArticleModel.prototype.findById=ArticleModel.prototype.read;
ArticleModel.prototype.findByAlias=function(alias,cb){
    this.findBy("alias",alias,cb);
}
ArticleModel.prototype.findByType=function(cat,type,template,cb){
    var arg={
        "cat":cat,
        "type":type,
        "template":template
    }
    this.collection.find(arg).toArray(cb);
}
ArticleModel.prototype._test={
     _processContent:_processContent
}
ArticleModel.prototype.update=function(){
    var args=Array.prototype.slice.call(arguments);
    var cb=args.pop();
    var _cb=function(err,res){
        if (err){
            log.err(err);
        }
        events.emit(events.msg.updateAppTree);
        cb(err,res);
    };
    args.push(_cb);
    this.parent.update.apply(this,args);
}
ArticleModel.prototype.remove=function(id,cb){
    this.parent.remove.call(this,id,function(err,res){
        events.emit(events.msg.updateAppTree);
        cb(err,res);
    });
}
ArticleModel.prototype.processContent=_processContent;
function _processContent(data,callback){
    var type=data.type.toLowerCase();
    var cat=data.cat.toLowerCase();
    var template=typeof data.template =="string"? data.template.toLowerCase():undefined;
    var parserObj=parser[cat];
    if (template && parserObj[template]){
        parserObj[template](data,callback);
    }else if (parserObj[type]){
        parserObj[type](data,callback);
    }else {
        log.silly("Processor not found for data:"+JSON.stringify(data));
        callback(null,data);
    }
}
module.exports = new ArticleModel();
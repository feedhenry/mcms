var Articles=require("../../../models/articles.js");
var log=require("../../../logger").getLogger();
var processors=require("../articleprocess");
function DefaultType(cat,type,template){
    this.meta={};
    this.meta.cat=cat;
    this.meta.type=type;
    this.meta.template=template;
    this.meta.uname=this.getUName();
    this.process=this.getProcessor();
    this.articleModel=Articles;
    // this.redirecUrl="/cms/articles";
    this.renderUrl="articles/create_wrapper";
}
DefaultType.prototype.parent={};
DefaultType.prototype.getProcessor=function(){
    if (processors[this.meta.cat] && processors[this.meta.cat][this.meta.uname]){
        return processors[this.meta.cat][this.meta.uname];
    }else{
        return this.processor;
    }
}
DefaultType.prototype.processor=function(params,cb){
    cb(null,params); //cb input parameters
}
DefaultType.prototype.getUName=function(){
    var params=this.meta;
    var cat=params.cat;
    var type=params.type;
    var template=params.template;
    if (template){
        return template;
    }else{
        return type;
    }
}
DefaultType.prototype.add=function(params, cb){
    var that=this;
    for (var key in this.meta){
        params[key]=this.meta[key];
    }
    this.process(params,function(err,params){
        if (err){
            log.err(err);
            cb(err);
        }else{
            Articles.create(params,function(err,res){
                if (err){
                    log.err(err);
                    return cb(err);
                }else{
                    var redirectUrl=that.redirecUrl || "/cms/articles/edit/"+res.alias;
                    cb(null, redirectUrl,res);
                }
            });
        }
    });
    
}
DefaultType.prototype.upsert=function(params,cb){
    if (params._id && params._id !=""){
        this.update(params,cb);
    }else{
        this.add(params,cb);
    }
}
DefaultType.prototype.update=function(params,cb){
    var that=this;
    for (var key in this.meta){
        params[key]=this.meta[key];
    }
    this.process(params,function(err,params){
        if (err){
            log.err(err);
            cb(err);
        }else{
            Articles.update(params,function(err,res){
                if (err){
                    log.err(err);
                    return cb(err);
                }else{
                    var redirectUrl=that.redirecUrl || "/cms/articles/edit/"+params.alias;
                    cb(null, redirectUrl,params);
                }
            });
        }
    });
}
DefaultType.prototype.remove=function(id,cb){
    var that=this;
    Articles.remove(id,function(err,res){
        if (err){
            log.err(err);
            return cb(err);
        }else{
            cb(null,"/cms/articles");
        }
    });
}
DefaultType.prototype.getExtra=function(id,cb){
    cb(null,{});
}
DefaultType.prototype.listItems=function(cb){ //list related content
    var arg={
        "cat":this.meta.cat,
        "type":this.meta.type
    }
    if (this.meta.template){
        arg.template=this.meta.template;
    }
    this.articleModel.collection.find(arg).toArray(cb);
}
DefaultType.prototype.setUniqueAlias=function(isUnique){
    this.meta.uniqueAlias=isUnique;
}
DefaultType.prototype.read=function(id,cb){
    var arg={
        "cat":this.meta.cat,
        "type":this.meta.type,
        "_id":id
    }
    this.articleModel.collection.findOne(arg,cb);
}
DefaultType.prototype.render=function(res,props){
    res.render(this.renderUrl,props);
}
module.exports=DefaultType;
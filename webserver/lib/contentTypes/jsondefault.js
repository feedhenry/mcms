var DefaultType=require("./default.js");
var util=require("util");
var log=require("./../../../logger").getLogger();
function JSONType(){
    DefaultType.apply(this,arguments);
    this.setUniqueAlias(true);
    this.renderUrl="articles/"+this.meta.template;
}
util.inherits(JSONType,DefaultType);

JSONType.prototype.parent=DefaultType.prototype;
JSONType.prototype.add=function(params,cb){
    var that=this;
    var obj={};
    for (var key in params){
        obj[key]=params[key];
    }
    var timeStamp=new Date().getTime();
    this.itemProcess(obj,function(err,parsedData){
        if (err){
            log.err(err);
            return cb(err);
        }
        that.listItems(function(err,res){
            if (err){
                log.err(err);
                return cb(err);
            }
            res.content[timeStamp]=parsedData;
            that.articleModel.update(res,function(err){
                if (err){
                    log.err(err);
                    return cb(err);
                }else{
                    cb(null,that.redirecUrl,parsedData,timeStamp);
                }
            });
        });
    });
}
JSONType.prototype.itemProcess=function(obj,cb){
    cb(null,obj);
}
JSONType.prototype.remove=function(timeStamp,cb){
    var that=this;
    this.listItems(function(err,res){
        if (err){
            log.err(err);
            return cb(err);
        }else{
            delete res.content[timeStamp];
            that.articleModel.update(res,function(err,res){
                if (err){
                    log.err(err);
                    cb(err);
                }else{
                    cb(null,that.redirecUrl);
                }
            });
        }
    });
}

JSONType.prototype.listItems=function(cb){
    var that=this;
    this.parent.listItems.call(this,function(err,res){
        if (err){
            log.err(err);
            cb(err);
        }else{
            if (!res || res.length ==0){
                that.initBasicJSON(function(err){
                    if (err){
                        log.err(err);
                    }
                    that.listItems(cb);
                });
            }else{
                cb(null,res[0]);
            }
        }
    });
}
JSONType.prototype.read=function(timeStamp,cb){
    this.listItems(function(err,res){
        if (err){
            log.err(err);
            return cb(err);
        }else{
            cb(null,res.content[timeStamp]);
        }
    });
}
JSONType.prototype.initBasicJSON=function(cb){
    var basicContent=this.getBasicContent();
    for (var key in this.meta){
        basicContent[key]=this.meta[key];
    }
    this.articleModel.create(basicContent,cb);
}
JSONType.prototype.getBasicContent=function(){
    return {};
}

JSONType.prototype.render=function(res,props){
    var that=this;
    this.listItems(function(err,result){
        if (err){
            log.err(err);
            return res.status("500").end("Error!");
        }
        props.content={};
        if (result){
            props.content=result.content;
        }
        res.render(that.renderUrl,props);
    });
}

module.exports=JSONType;
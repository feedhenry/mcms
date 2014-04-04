var DataModel=require("../../models/DataModel.js");
var util=require("util");
var myUtil=require("../util");
var events=require("../../events");
function CategoryModel(){
    DataModel.call(this,"categories");
}
util.inherits(CategoryModel,DataModel);
CategoryModel.prototype.parent=DataModel.prototype; //level1 inheritance only.
CategoryModel.prototype.create=function(data,cb){
    data.alias=myUtil.aliasGen(data.name || "");
    this.parent.create.call(this,data,cb);
}
CategoryModel.prototype.findById=DataModel.prototype.read;
CategoryModel.prototype.findByAlias=function(alias,cb){
    this.findBy("alias",alias,cb);
}
CategoryModel.prototype.update=function(id,data,cb){
    this.parent.update.call(this,id,data,function(err,res){
        events.emit(events.msg.updateAppTree);
        cb(err,res);
    });
}
CategoryModel.prototype.remove=function(id,cb){
    this.parent.remove.call(this,id,function(err,res){
        events.emit(events.msg.updateAppTree);
        cb(err,res);
    });
}
module.exports=new CategoryModel();

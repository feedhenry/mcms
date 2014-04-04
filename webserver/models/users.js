var DataModel=require("../../models/DataModel.js");
var util=require("util");
var myUtil=require("../util");

function UserModel(){
    DataModel.call(this,"users");
}
util.inherits(UserModel,DataModel);
UserModel.prototype.parent=DataModel.prototype; //level1 inheritance only.
UserModel.prototype.create=function(data,cb){
    data.alias=myUtil.aliasGen(data.name || "");
    data.password=myUtil.md5(data.password);
    this.parent.create.call(this,data,cb);
}
UserModel.prototype.findById=DataModel.prototype.read;
UserModel.prototype.findByAlias=function(alias,cb){
    this.findBy("alias",alias,cb);
}
UserModel.prototype.findByEmail=function(email,cb){
    this.findBy("email",email,cb);
}
UserModel.prototype.findByUsername=function(username,cb){
    this.findBy("username",username,cb);
}
module.exports=new UserModel();
var JSONType=require("../jsondefault.js");
var util=require("util");
var log=require("../../../../logger").getLogger();
var utils=require("../../../util");
function ShoppingLoopType(){
    JSONType.call(this,"template","json","shoppingloop");
    this.redirecUrl="/cms/articles/create/template/json/shoppingloop";
}
util.inherits(ShoppingLoopType,JSONType);

ShoppingLoopType.prototype.parent1=JSONType.prototype;
ShoppingLoopType.prototype.getBasicContent=function(){
    return {
        "alias":"_shoppingloop",
        "name":"Shopping Loops",
        'content':{},
        "publish":true
    };
}
ShoppingLoopType.prototype.itemProcessor=function(params,cb){
    var imgUrl=params.imageUrl;
    utils.remoteImgToBase64(imgUrl,function(err,base64Img){
        params.encodedImage=base64Img;
        cb(err,params);
    });

}
module.exports=ShoppingLoopType;
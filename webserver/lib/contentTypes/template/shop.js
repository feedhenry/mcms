var DefaultType=require("../default.js");
var util=require("util");
var log=require("../../../../logger").getLogger();
function ShopType(){
    DefaultType.call(this,"template","json","shop");
}
util.inherits(ShopType,DefaultType);


module.exports=ShopType;
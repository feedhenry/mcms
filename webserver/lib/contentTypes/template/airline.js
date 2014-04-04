var JSONType=require("../jsondefault.js");
var util=require("util");
var log=require("../../../../logger").getLogger();
function AirlineType(){
    JSONType.call(this,"template","json","airline");
    this.redirecUrl="/cms/articles/create/template/json/airline";
}
util.inherits(AirlineType,JSONType);

AirlineType.prototype.parent1=JSONType.prototype;
AirlineType.prototype.getBasicContent=function(){
    return {
        "alias":"_airlines",
        "name":"Airlines",
        'content':{},
        "publish":true
    };
}
AirlineType.prototype.itemProcess=require("../../articleprocess/airline.js");
module.exports=AirlineType;
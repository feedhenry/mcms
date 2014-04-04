var JSONType=require("../jsondefault.js");
var util=require("util");
var log=require("../../../../logger").getLogger();
function FAQType(){
    JSONType.call(this,"template","json","faq");
    this.redirecUrl="/cms/articles/create/template/json/faq";
}
util.inherits(FAQType,JSONType);

FAQType.prototype.parent1=JSONType.prototype;
FAQType.prototype.getBasicContent=function(){
    return {
        "alias":"_faq",
        "name":"FAQ",
        'content':{},
        "publish":true
    };
}

module.exports=FAQType;
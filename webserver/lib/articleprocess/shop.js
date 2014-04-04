module.exports=processFunc;

//imp
var _shareFunc=require("../../public/share/templateProcess/shop");
var htmlProcessor=require("./html.js");
var util=require("../../util");
function processFunc(data,cb){
    var imageSrc=data.image;
    var phone=data.phone;
    var introHtml=data.introduction;
    var alias=data.alias;
    data.content=_shareFunc(imageSrc,introHtml,phone,alias);
    util.remoteImgToBase64(imageSrc,function(err,base64Img){
       data.encodedImage=base64Img;
       cb(err,data); 
    });
    // htmlProcessor(data,cb);
}
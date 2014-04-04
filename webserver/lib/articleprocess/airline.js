module.exports=processFunc;

//implenetaion
var util=require("../../util");
function processFunc(data,cb){
    var iconUrl=data.icon_url;
    util.remoteImgToBase64(iconUrl,function(err,imgData){
        if (err){
            data.iconData=data.iconUrl;
        }else{
            data.iconData=imgData;
        }
        cb(null,data);
    });
}
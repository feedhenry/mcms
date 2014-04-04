exports.remoteImgToBase64=require("./remoteImgToBase64");
exports.aliasGen=aliasGen;
exports.wrapObj=objWrap;
exports.remoteContent=require("./remoteWebRes");
exports.html=require("./htmlHelper.js");
exports.rss=require("./rssHelper.js");
exports.md5=md5;
var crypto = require('crypto');
function aliasGen(name){
    var regExp=/[0-9a-zA-Z]+/;
    name=name.toLowerCase();
    var aname="";
    for (var i=0;i<name.length;i++){
        if (regExp.test(name[i])){
            aname+=name[i];
        }
    }
    aname+="_"+new Date().getTime();
    return aname;
}
function objWrap(obj){
    obj.get=function(key,def){
        if (typeof this[key] =="undefined" || this[key]===null){
            return def;
        }
        return this[key];
    }
    obj.set=function(key,va){
         return this[key]=val;
    }
    return obj;
}

function md5(str){
    var hash = crypto.createHash('md5').update(str).digest('hex');
    return hash;
}
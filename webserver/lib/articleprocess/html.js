module.exports=processFunc;


var async=require("async");
var log=require("../../../logger").getLogger();
var util=require("../../util");
var jsdom=require("jsdom");
/**
 * Process content uploaded
 * 1 Replace original image with base64 encoded image.
 * 2 Remove all \r \n stuff added by tinyMCE
 * 3 Pull external content and insert as inline data
 * @param  {[type]}   content  [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
function processFunc(data,callback){
    var content=data.content;
    /***** remove all returning stuff ******/
    content=content.replace(/\r\n/g,"");
    /******* convert remote image to inline image *****/
    var document=jsdom.jsdom(content,jsdom.level(1, "core"));
    var body=document.querySelector("body");
    //return callback(null,data);
    // var html=$(content);
    // var body=html.find("body");
    //var contentPlace=content.replace(/<body>.*<\/body>/,"<body><!--PHBODY--></body>");
    _processImg(body,function(err,bodyStr){
        var head=document.querySelector("head");
        _processHead(head,function(err,headObj){
            data.content=document.documentElement.outerHTML;
            callback(null,data);
        });
    });
    
}


function _processHead(headObj,callback){
    if (!headObj){
        log.warn("head of html is empty");
        return callback(null,null);
    }
    var scripts=headObj.querySelectorAll("script");
    var links=headObj.querySelectorAll("link");
    var funcs=[];
    var doc=headObj.ownerDocument;
    function genScriptFunc(script){
        return function(cb){
            var src=script.src;
            util.remoteContent(src,function(err,data){
                if (err){
                    log.err(err);
                    return cb();
                }
                script.src=null;
                script.appendChild(doc.createTextNode(data));
                cb();
            });
        }
    }

    function genLinkFunc(link){
        return function(cb){
            var src=link.href;
            util.remoteContent(src,function(err,data){
                if (err){
                    log.err(err);
                    return cb();
                }
                
                var style=doc.createElement("style");
                style.appendChild(doc.createTextNode(data));
                headObj.insertBefore(style,link);
                headObj.removeChild(link);
                cb();
            });
        }
    }

    for (var i=0;i<scripts.length;i++){
        if (scripts[i].src){
            funcs.push(genScriptFunc(scripts[i]));    
        }
        
    }
    for (var i=0;i<links.length;i++){
    //console.log(links[i].href);
        if (links[i].href && links[i].rel.toLowerCase()=="stylesheet"){
            funcs.push(genLinkFunc(links[i]));    
        }
    }
    async.parallel(funcs,function(){
        callback(null,headObj);
    });
}


function _processImg(bodyObj,callback){
    var remoteImg=/http.*/;
    var imgs=bodyObj.querySelectorAll("img");
    var funcs=[];
    for (var i=0;i<imgs.length;i++){
        var img=imgs[i];
        console.log(typeof img.src);
        var src=img.src;
        if (remoteImg.test(src)){
            funcs.push(genImgProc(img));
        }
    }
    function genImgProc(item){
        return function(cb){
            var src=item.src;
            util.remoteImgToBase64(src,function(err,data){
                if (err){
                    return cb(err);
                }else{
                    item.src=data;
                    cb();
                }
            });
            
        }
    }
    async.parallel(funcs,function(){
        var newBody=bodyObj.outerHTML;
        callback(null,newBody);
    });
}
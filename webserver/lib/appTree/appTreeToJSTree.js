//this file contains get all application tree from db and convert to js tree format.
//module interfaces
module.exports=processFunc;  // cb(err,jsTree)

//implenetation
var Apps = require("../../models/apps");
var Categories = require("../../models/categories");
var Articles = require("../../../models/articles");
var log = require("../../../logger").getLogger();
var loadAppTree=require("./loadAppTreeFromDB.js");
function processFunc(cb){
    loadAppTree.getAppTree(true,function(err,appTree){
        var rtn=[];
        for (var appAlias in appTree){
            var app=appTree[appAlias];
            rtn.push(_processApp(app));
        }
        cb(null,rtn);
    });
}


function _genJSTreeEle(name,attr,children){
    var tmpObj={
        "data":name,
        "attr":attr,
        "children":children
    }
    // if (children && children.length>0){
    //     tmpObj.state="open";
    // }
    return tmpObj;
}

function _genAttr(type,item) {
    var obj={
        "id": item._id,
        "rel": type,
        "data-name":item.name,
        "data-alias": item.alias,
        "data-version": item.version,
        "data-publish": item.publish,
        "data-lastupdate": item.lastUpdate,
        "data-rank": item.rank || 0,
        "data-id":item._id
    }

    return obj;
}

function _processApp(app){
    var appChildren=app.children;
    var children=_processChildren(appChildren);
    var attr=_genAttr("application",app);
    return _genJSTreeEle(app.name,attr,children);
}

function _processChildren(children){
    var rtn=[];
    for (var key in children){
        var obj=children[key];
        if (obj.children){ //category.
            rtn.push(_processCategory(obj));
        }else{ //content
            var child=_processContent(obj);
            rtn.push(child);
        }
    }
    return rtn;
}
function _processCategory(srcJson){
    var attr=_genAttr("category",srcJson);
    var name=srcJson.name;
    var children=_processChildren(srcJson.children);
    return _genJSTreeEle(name,attr,children);
}

function _processContent(srcJson){
    var attr=_genAttr("article",srcJson);
    var name=srcJson.name;
    return _genJSTreeEle(name,attr);
}
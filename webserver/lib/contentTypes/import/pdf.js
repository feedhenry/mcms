module.exports=PDFType;
var BinaryType=require("../binary.js");
var util=require("util");

function PDFType(req){
  BinaryType.call(this,"pdf",req);
  this.renderUrl="articles/navListRenderer";
}
util.inherits(PDFType,BinaryType);

PDFType.prototype.render=function(res,props){
  if (props.article){
    props.navList=[
      {
        "name":"PDF File Upload",
        "id":"pdf_upload"
      }
    ];
  }
  BinaryType.prototype.render.call(this,res,props);
}
//shared module on both client and serverside
if (typeof module!="undefined" && module.exports){
    module.exports=processShopTemplate;
}

//return HTML content after processed
function processShopTemplate(imageSrc, introHtml,teleNum, shopName,openHours,webUrl){
    if (!imageSrc){
        imageSrc="/img/sample.jpg";
    }
    var html='<!DOCTYPE html>'+
'<html>'+
'<head>'+
'    <link rel="stylesheet" type="text/css" href="/css/bootstrap.min.css"/>'+
'</head>'+
'<body>'+
'    <div><img src="'+imageSrc+'" width="320" style="min-height:120px"/></div>'+
'    <div style="padding:8px">'+
'    <h2>{Name} <small>Before/After Security</small></h2>'+
'    <div>{openhour}</div>'+
'    <small>Web Site: {weburl}</small>'+
'    <p>{introduction}</p>'+
'</div>'+
'<div class="form-group">'+
'        <a class="form-control btn btn-primary" href="tel:'+teleNum+'">Call <span>'+teleNum+'</span></a>'+
'</div>'+
'<div class="form-group">'+
'        <button class="form-control btn btn-primary changePage"  data-page="map" data-param="' +shopName+'" >View on Map</button> '+
'</div>'+
'<div class="form-group">'+
'        <button class="form-control btn btn-primary changePage"  data-page="shopCollect">Shop &amp; Collect</button> '+
'</div>'+
'    </div>'+
'</body>    '+
'</html>';
    html=html.replace("{Name}",shopName);
    html=html.replace("{openhour}",openHours);
    html=html.replace("{weburl}",webUrl);
    html=html.replace("{introduction}",introHtml);
    return html;

}
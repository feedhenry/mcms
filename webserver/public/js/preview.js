var preview=(function(module){
    //module interfaces
    module.detachAllHandler=detachAllHandler;
    module.attachOnPreview=attachOnPreview;
    module.registerDataMap=registerDataMap;
    module.stopTimer=stopTimer;
    module.startTimer=startTimer; //start or restart
    module.setIntervalTime=setIntervalTime;
    //implementation
    var handlers=[_popPreview];
    var timer=null;
    var mapFuncs={};
    var interval=1200; //ms
    function startTimer(){
        if (timer){
            stopTimer();
        }
        timer=setInterval(function(){
            //handlers.forEach(function()) //ie...
            for (var i=0;i<handlers.length;i++){
                var func=handlers[i];
                func();
            }
        },interval);
    }
    function stopTimer(){
        if(timer){
            clearInterval(timer);
        }
    }
    function registerDataMap(previewId,func){
        mapFuncs[previewId+"_func"]=func;
    }
    function setIntervalTime(inter){
        interval=inter;
        startTimer();
    }
    function detachAllHandler(){
        handlers=[];
    }
    function attachOnPreview(func){
        handlers.push(func);
    }
    function _popPreview(){
        if (tinyMCE && tinyMCE.activeEditor){ //pop data in tinymce
            var content=tinyMCE.activeEditor.getContent({format : 'raw'});
            $("#article_create_form input[data-preview='preview_mce']").val(content);
        }
        $("#article_create_form *[data-preview]").each(function(){
                var previewId=$(this).data().preview;
                var funcName=previewId+"_func";
                if (mapFuncs[funcName]==undefined){
                    _defaultPreviewMapFunc($(this));
                }else{
                    try{
                        mapFuncs[funcName]($(this));
                    }catch(e){
                        alert(e);
                    }
                }
            });
    }
    function _defaultPreviewMapFunc(item){
        var previewId=item.data().preview;
        var val=item.val();
        $("#"+previewId).html(val);
    }


    return module;
})(preview || {});
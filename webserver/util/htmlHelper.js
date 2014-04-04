module.exports = {
    "image": ImageCls,
    "text": InputCls,
    "formattedtext": FormattedTextCls
}

//implementation
var util = require("util");
var imgLoader = require("./remoteImgToBase64.js");

function InputCls(name, placeholder, defaultValue, fieldType, inputType) {
    if (placeholder == undefined) {
        placeholder = "Please enter text here";
    }
    if (defaultValue == undefined) {
        defaultValue = "";
    }
    if (fieldType == undefined) {
        fieldType = "text";
    }
    if (inputType == undefined) {
        inputType = "text";
    }
    this.props = {
        name: name,
        placeholder: placeholder,
        value: defaultValue,
        fieldType: fieldType,
        type: inputType
    }
    this.attrs = {
        name: "_content[" + name + "]",
        placeholder: placeholder,
        value: defaultValue,
        type: inputType
    }
    this.setBootStrap();
};
InputCls.prototype.test = function(name) {
    return this.props.name === name;
}
InputCls.prototype.setValue = function(val) {
    this.value = val;
}
InputCls.prototype.constructObj = function(json, cb) {
    json[this.props.name] = this.value;
    this.process(json, cb);
}
InputCls.prototype.process = function(json, cb) {
    cb(null, json)
};
InputCls.prototype.setBootStrap = function() {
    this.attrs.class = "form-control";
}
InputCls.prototype.getHtml = function() {
    var props = this.attrs;
    var attrStr = "";
    for (var key in props) {
        var val = props[key];
        attrStr += key + " = '" + val + "' ";
    }
    var html = this.getRawHtml().replace("{attrs}", attrStr);
    for (var key in props) {
        var regExp = new RegExp("\{" + key + "\}", "g");
        html = html.replace(regExp, props[key]);
    }
    return html;
}
InputCls.prototype.getRawHtml = function() {
    return "<input {attrs} />";
}
InputCls.prototype.getHtmlPreview = function(val) {
    return val;
}
InputCls.prototype.getMetaData = function() {
    return {
        "fieldName": this.props.name,
        "fieldType": this.props.fieldType
    }
}

InputCls.prototype.setAttr = function(key, val) {
    this.attrs[key] = val;
}


function ImageCls(name) {
    InputCls.call(this, name, "Please enter image url", "", "image");
}
util.inherits(ImageCls, InputCls);

ImageCls.prototype.process = function(json, cb) {
    var that = this;
    var imgUrl = this.value;
    if (imgUrl.indexOf("data:image/png;base64") >= 0) {
        json[that.props.name] = imgUrl;
        cb(null,json);
    } else {
        imgLoader(imgUrl, function(err, encoded) {
            json[that.props.name] = encoded;
            cb(null, json);
        });
    }

}
ImageCls.prototype.getHtmlPreview = function(val) {
    return "<img src='{content}'  width='100' class='imgPreview'/>".replace(/\{content\}/g, val);
}

function FormattedTextCls(name) {
    InputCls.call(this, name, "", "", "formattedtext", "hidden");
}
util.inherits(FormattedTextCls, InputCls);

FormattedTextCls.prototype.getRawHtml = function() {
    return "<input {attrs}/>" +
        "<button type='button' class='formattedTextEditorBtn' data-inputname='{name}'>Edit Content</button>";
}
FormattedTextCls.prototype.getHtmlPreview=function(val){
    return "<a href='javascript:;' class='htmlPreview'>Preview</a>".replace(/\{content\}/g, val);
}
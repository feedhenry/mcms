var JSONType = require("../jsondefault.js");
var util = require("util");
var log = require("../../../../logger").getLogger();
var htmlHelper = require("../../../util").html;
var async = require("async");

function TableType(req) {
    JSONType.call(this, "core", "table", "table");
    var params=req.body;
    if (params) {
        if (params._id == "") {
            params._id = undefined;
        }
        this.meta.alias = params.alias;
        this.meta.name = params.name;
        this.meta.publish = params.publish;
        this.contentId = params._id; //optional     
        this.setUniqueAlias(false);
    }
    if (params && params._id) {
        this.redirecUrl = "/cms/articles/edit/" + params.alias;
    } else {
        this.redirecUrl = "/cms/articles/create/core/table/table";
    }
    this.renderUrl = "articles/navListRenderer";

}
util.inherits(TableType, JSONType);

TableType.prototype.parent1 = JSONType.prototype;
TableType.prototype.getBasicContent = function() {
    return {
        "tableMeta": [],
        'content': {}
    };
}
TableType.prototype.processor = function(params, callback) {
    var self = this;
    var processors = [];
    processors.push(function(cb) {
        //process adding fields.
        params = self.addField(params);
        cb();
    });
    processors.push(function(cb) {
        //process editing fields.
        params = self.editField(params);
        cb();
    });
    processors.push(function(cb) {
        //process remove fields
        params = self.removeField(params);
        cb();
    });
    processors.push(function(cb) {
        //process remove content
        params = self.removeContent(params);
        cb();
    });
    processors.push(function(cb) {
        //process add content
        self.addContent(params, function(err, params) {
            cb();
        });
    });
    processors.push(function(cb) {
        //process edit content
        self.editContent(params, function(err, params) {
            cb();
        });
    });
    processors.push(function(cb) {
        //process edit preview template
        params = self.editPreviewTemplate(params);
        cb();
    });
    processors.push(function(cb) {
        self.removeUnnessaryFields(params);
        cb();
    });
    async.series(processors, function() {
        callback(null, params);
    });

}
TableType.prototype.removeUnnessaryFields = function(params) {
    //clear table content data
    delete params.remove_field_timestamp;
    delete params.remove_content_timestamp;
    delete params.edit_content_timestamp;
    delete params.edit_field_timestamp;
    delete params.edit_content_value;
    delete params.edit_field_value;
    delete params.edit_content_column;
    delete params.edit_field_column;
    delete params.add_content;
    delete params.field_name;
    delete params.field_type;
    delete params._content;
    delete params.richTextEditor;
    delete params.field_name;
    delete params.field_type;
    delete params.edit_preview_template;
    delete params.add_field;
}
TableType.prototype.editPreviewTemplate = function(params) {
    var that = this;
    if (params.edit_preview_template == "true") {
        log.silly("Edit preview template");
        that.redirecUrl += "#table_preview_template";
    }
    return params;
}
TableType.prototype.editContent = function(params, cb) {
    var that = this;
    if (params.edit_content_timestamp && params.edit_content_timestamp != "") {
        log.silly("Edit content verified");
        log.silly(params.edit_content_timestamp);
        this.contentToObject(params, function(err, finalObj) {
            params.content[params.edit_content_timestamp] = finalObj;
            that.redirecUrl += "#table_content";
            cb(null, params);
        });
    } else {
        cb(null, params);
    }
};
TableType.prototype.removeContent = function(params) {
    var that = this;
    if (params.remove_content_timestamp && params.remove_content_timestamp != "") {
        log.silly("Remove content verified");
        if (!params.content) {
            params.content = {};
        }
        delete params.content[params.remove_content_timestamp];
        delete params.remove_content_timestamp;
        that.redirecUrl += "#table_content";
    }
    return params;
}
//extract _content from params and convert it to an object with parsed data.
TableType.prototype.contentToObject = function(params, cb) {
    function _genFunc(helper, val) {
        return function(cb) {
            helper.setValue(val);
            helper.constructObj(finalObj, cb);
        }
    }
    var metaData = params.tableMeta;
    var fields = [];
    var newData = params._content;
    delete params._content
    if (!params.content) {
        params.content = {};
    }
    for (var key in metaData) {
        var obj = metaData[key];
        fields[obj.fieldName] = new htmlHelper[obj.fieldType](obj.fieldName);
    }
    var finalObj = {};
    var funcs = [];
    for (var key in newData) {
        var helper = fields[key];
        funcs.push(_genFunc(helper, newData[key]));
    }
    async.parallel(funcs, function() {
        cb(null, finalObj);
    });
}
TableType.prototype.addContent = function(params, cb) {
    var that = this;
    if (params.add_content == "true") {
        log.silly("process add content");
        that.contentToObject(params, function(err, finalObj) {
            params.content[new Date().getTime()] = finalObj;
            that.redirecUrl += "#table_content";
            cb(null, params);
        });
    } else {
        cb(null, params);
    }

}
TableType.prototype.removeField = function(params) {
    var that = this;
    if (params.remove_field_timestamp && params.remove_field_timestamp != "") {
        log.silly("Process remove field.");
        if (!params.tableMeta) {
            params.tableMeta = {};
        }

        var name = params.tableMeta[params.remove_field_timestamp].fieldName;
        delete params.tableMeta[params.remove_field_timestamp];
        delete params.remove_field_timestamp;
        if (params.content) {
            for (var ts in params.content) { //remove the data of the field.
                delete params.content[ts][name];
            }
        }
        that.redirecUrl += "#table_field";
    }
    return params;
}
TableType.prototype.editField = function(params) {
    var that = this;
    if (params.edit_field_timestamp && params.edit_field_timestamp != "") {
        log.silly("Process edit field.");
        if (params.tableMeta) {
            var oldFieldName = params.tableMeta[params.edit_field_timestamp].fieldName;
            var newFieldName = params.field_name;
            var htmlObj = new htmlHelper[params.field_type](params.field_name);
            params.tableMeta[params.edit_field_timestamp] = htmlObj.getMetaData();
            if (params.content) {
                for (var ts in params.content) {
                    if (params.content[ts][oldFieldName] != undefined) {
                        params.content[ts][newFieldName] = params.content[ts][oldFieldName];
                        delete params.content[ts][oldFieldName];
                    }
                }
            }
            that.redirecUrl += "#table_field";
        }
    }
    return params;
}
TableType.prototype.addField = function(params) {
    var that = this;
    if (params.add_field == "true" && params.field_name && params.field_name != "") {
        log.silly("Process add field.");
        if (!params.tableMeta) {
            params.tableMeta = {};
        }
        var HtmlClass = htmlHelper[params.field_type];
        if (!HtmlClass) {
            console.warn("Field type not found in html helper:" + params.field_type);
        }
        var htmlObj = new HtmlClass(params.field_name);
        params.tableMeta[new Date().getTime()] = htmlObj.getMetaData();

        that.redirecUrl += "#table_field";
    }
    return params;
}
TableType.prototype.remove = function(id, cb) {
    this.parent.remove.call(this, id, function(err) {
        cb(null, "/cms/articles");
    });
}
TableType.prototype.update = function(params, cb) {
    var that = this;
    for (var key in this.meta) {
        params[key] = this.meta[key];
    }
    that.articleModel.collection.findOne({
        "_id": that.articleModel.objectId(params._id.toString())
    }, function(err, obj) {
        that.removeUnnessaryFields(obj);
        for (var key in obj) {
            if (!params[key]) {
                params[key] = obj[key];
            }
        }
        // Call the update method of default type
        // This will then call the process fn of this Class
        that.parent.update.call(that, params, cb);
    });
}
TableType.prototype.setCurId = function(id) {
    this.contentId = id;
    this.redirecUrl = "/cms/articles/edit/" + this.meta.alias;
}
TableType.prototype.add = function(params, cb) {
    var that = this;
    this.parent.add.call(this, params, function(err, url, obj) {
        that.meta.alias = obj.alias;
        that.setCurId(obj._id);
        cb(err, that.redirecUrl, obj);
    });
}


TableType.prototype.listItems = function(cb) {
    var that = this;
    if (!this.contentId) {
        this.initBasicJSON(function(err, obj) {
            that.meta.alias = obj.alias;
            that.setCurId(obj._id);
            that.listItems(cb);
        });
    } else {
        this.articleModel.findById(this.contentId, cb);
    }
}
TableType.prototype.render = function(res, props) {
    var that = this;
    if (props.article) {
        var meta = props.article.tableMeta;
        props.article.tableMeta = {};
        for (var key in meta) {
            var obj = meta[key];
            props.article.tableMeta[key] = new htmlHelper[obj.fieldType](obj.fieldName);
        }
    }
    props.navList=[
    {
        "name":"Table Field Definition",
        "id":"table_field"
    },
    {
        "name":"Table Content",
        "id":"table_content_wrapper"
    },
    {
        "name":"Preview",
        "id":"table_preview"
    },
    {
        "name":"Preview Template",
        "id":"table_preview_template"
    }
    ]
    res.render(this.renderUrl, props);
}
module.exports = TableType;
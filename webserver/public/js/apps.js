$(document).ready(
    function() {
        //load the tree structure for the app browser panel
        loadTree();

        // Wrap jquery's ajax to control syncing of the app structure
        var oldAjax = $.ajax;
        $.ajax = function(opts) {
            var oldComplete = opts.complete;
            opts.complete = function(a, b, c) {
                // Restart polling if needed
                if(!appSync.isPolling()) {
                    appSync.startPolling();
                }
                // Call original complete callback
                if(oldComplete) {
                    return oldComplete(a,b,c);
                }
            }

            // Cancel polling if we're submitting content
            if(opts.url != '/cms/apps/timestamp') {
                appSync.cancelPolling();
            }
            return oldAjax(opts);
        }

        // Start polling for the current app timestamp
        appSync.startPolling();

        $(".app_index_create_btn").click(function() {
            loadCreateAppForm();
        });

        $("#app_index_editor_panel").on("click",
            "#app_create_form #app_create_form_save_btn",
            function(event) {
                saveApp();
            }
        );

        $(document).on("click",".editItem",function(){
            var item=$("#app_index_browser_panel").jstree("get_selected");
            editItem(item);
        });

        $(document).on("click", ".updateTree", function() {
            updateTree();
            $('.updateTree').fadeOut();
        })

        $(document).on("click",".deleteItem",function(){
            var item=$("#app_index_browser_panel").jstree("get_selected");
            deleteItem(item);
        });

        $(document).on("click",".attachCategory",function(){
            var item=$("#app_index_browser_panel").jstree("get_selected");
            loadAddCategoryForm(item);
        });

        $(document).on("click",".attachArticle",function(){
            var item=$("#app_index_browser_panel").jstree("get_selected");
            loadAddArticleForm(item);
        });

        // ============== Rank management ==============
        $(document).on("click", '#dec-rank-btn', function() {
            changeRank(-1);
        });
        $(document).on("click", "#inc-rank-btn", function() {
            changeRank(1);
        });

        // Ensure items are ordered when displayed
        $("#app_index_browser_panel").on('open_node.jstree close_node.jstree', function(e, data) {
            orderChildrenByRank(data.rslt.obj['0']);
        });

        // =============================================

        $("#app_index_editor_panel").on("click",
            "#app_edit_form #app_edit_form_save_btn",
            function(event) {
                updateApp();
            }
        );

        $("#app_index_editor_panel").on("click",
            "#category_edit_form #category_edit_form_save_btn",
            function(event) {
                updateCategory();
            }
        );

        $("#app_index_editor_panel").on("click",
            "#category_add_form #category_add_form_add_btn",
            function(event) {
                attachCategory();
            }
        );

        $(document).on("click","#attach_article",function(){
            attachArticle();
        });
    }
);

/**
 * Check the server timestamp vs our timestamp.
 * If they match, grand! If not we need to refresh the app structure/page.
 */
 var appSync = {
    latestTs: null, 
    timerId: null,

    // Are we polling?
    isPolling: function() {
        return this.timerId;
    },

    // Cancel polling and clear timestamp
    cancelPolling: function() {
        clearTimeout(this.timerId);
        this.latestTs = null;
        this.timerId = null;
    },

    // Start timestamp polling
    startPolling: function() {
        this.timerId = setTimeout(this.getLatestTimeStamp.bind(this), 5000);
    },

    // Do AJAX to get timestamp
    getLatestTimeStamp: function() {
        var self = this;

        $.ajax({
            type: 'GET',
            url: '/cms/apps/timestamp',
            success: function(res) {
                if(self.latestTs && self.latestTs != res.timestamp) {
                    $("#app_index_browser_panel").jstree("refresh");
                } else {
                    self.latestTs = res.timestamp;
                    self.startPolling();
                }
            }, 
            error: function(data, status, error) {
                alert('Failed to get the latest CMS version. Please check your connection and refresh the page.');
            }
        });
    }
};


function loadTree() {
    $("#app_index_browser_panel").jstree({
        "core":{
            "animation":50,
        },
        "json_data": {
            "ajax": {
                "url": "/cms/apps/tree"
            }
        },
        "contextmenu": {
            "items": customMenu
        },
        "ui": {
            "select_limit": 1,
            "select_prev_on_delete": false
        },
        //                "types": {
        //                    "types": {
        //                        "application": {
        //                            "valid_children": ["category"]
        //                        },
        //                        "category": {
        //                            "valid_children": ["category",
        //                                "article"]
        //                        },
        //                        "article": {}
        //                    }
        //                },
        //                "dnd": {
        //                    "drop_target": ".jstree",
        //                    "drop_finish": function() {
        //                        alert("save new structure");
        //                    },
        //                    "drag_finish": function(data) {
        //                        alert("DRAG OK");
        //                    }
        //                },
        //                rules: {
        //                    use_inline: true,
        //                    clickable: ["application", "category",
        //                        "article"],
        //                    deletable: "none",
        //                    renameable: "all",
        //                    creatable: ["application", "category"],
        //                    draggable: ["category", "article"],
        //                    dragrules: ["category inside application",
        //                        "category inside category",
        //                        "article inside category"],
        //                    drag_button: "left"
        //                },
        "plugins": ["themes", "json_data", "ui",
        "contextmenu", "types", "dnd", "crrm"
        ]
    }).bind("click.jstree", function(e) {
        //bind to click instead of select so as not to trigger edit item on right click
        var node = $(e.target).closest("li");
        displayInfo(node);
    }).delegate("a", "contextmenu", function() {
        //need to force select node on right click or it will not be availbe as the selected node for context menu items
        $("#app_index_browser_panel").jstree("select_node", this, true, null);
    });
}

function customMenu(node) {
    // The default set of all items
    var items = {
        // editItem: {
        //     label: "Edit",
        //     action: function() {
        //         editItem($(node));
        //     }
        // },
        // deleteItem: {
        //     label: "Detach",
        //     action: function() {
        //         deleteItem($(node));
        //     }
        // },
        // // copyItem: {
        // //     label: "Copy",
        // //     action: function() {
        // //         //                $("#app_categories").jstree("copy", $(node));
        // //     }
        // // },
        // // pasteItem: {
        // //     label: "Paste",
        // //     action: function() {
        // //         //                $("#app_categories").jstree("paste", $(node));
        // //     }
        // // },
        // categoryItem: {
        //     label: "Attach Category",
        //     action: function() {
        //         loadAddCategoryForm($(node));
        //     }
        // },
        // articleItem: {
        //     label: "Attach Article",
        //     action: function() {
        //         loadAddArticleForm($(node));
        //     }
        // }
    };

    // if ($(node).attr("rel") === "application") {
    //     delete items.copy;
    //     delete items.articleItem;
    // }

    // if ($(node).attr("rel") === "article") {
    //     delete items.pasteItem;
    //     delete items.categoryItem;
    //     delete items.articleItem;
    // }

    return items;
}

function reloadTree() {
    $("#app_index_browser_panel").jstree("deselect_all");
    $("#app_index_browser_panel").jstree("refresh");
}
function showDynamic(html){
    showSection("dynamic");
    getSectionjQuery("dynamic").html(html);
}

function updateTree() {
    $.ajax({
        type: "post",
        url: "/cms/apps/update",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify($("#app_index_browser_panel").jstree("get_json", -1)),
        success: function(data) {
            showDynamic(data);
        },
        error: function(data, status, error) {
            alert("An Error Occurred: " + error);
        }
    });
}

function loadCreateAppForm() {
    $.ajax({
        type: "get",
        url: "/cms/apps/create",
        data: {},
        success: function(data) {
            showDynamic(data);
            $("#app_version_field").hide();
        },
        error: function(data, status, error) {
            alert("An Error Occurred: " + error);
        }
    });
}

function displayInfo(item){
    var type = item.attr("rel");
    if (type === "application") {
        loadAppInfo(item);
    } else if (type === "category") {
        loadCatInfo(item);
    } else if (type === "article") {
        loadArticleInfo(item);
    }
}
function showSection(secName){
    $("#app_index_editor_panel .section.active").removeClass("active");
    $("#app_index_editor_panel .section."+secName).addClass("active");
}
function getSectionjQuery(secName){
    return $("#app_index_editor_panel .section."+secName);
}
//pop JSON data object to HTML jquery object with same key as class
function popData(dataObj, jqueryObj,selector){
    if (selector === undefined){
        selector="td";
    }
    for (var key in dataObj){
        jqueryObj.find(selector+"."+key).text(dataObj[key]);
    }
}
function loadAppInfo(item){
    showSection("app");
    var data=item.data();
    var appObj=getSectionjQuery("app");
    popData(data,appObj);
}

function loadCatInfo(item){
    showSection("category");
    var data=item.data();
    var secObj=getSectionjQuery("category");
    popData(data,secObj);
}

function loadArticleInfo(item){
    showSection("article");
    var data=item.data();
    var secObj=getSectionjQuery("article");
    popData(data,secObj);
    var editHref="/cms/articles/edit/"+data.alias;
    secObj.find("a.editContentBtn").attr("href",editHref);
}

function editItem(item) {
    var type = item.attr("rel");
    if (type === "application") {
        loadEditAppForm(item);
    } else if (type === "category") {
        loadEditCategoryForm(item);
    } 
    // else if (type === "article") {
    //     loadEditArticleForm(item);
    // }
}

function loadEditAppForm(item) {
    $.ajax({
        type: "post",
        url: "/cms/apps/" + item.attr("data-alias"),
        data: {
            _id: item.attr("id")
        },
        success: function(data) {
            showDynamic(data);
        },
        error: function(data, status, error) {
            alert("An Error Occurred: " + error);
        }
    });
}

function loadEditCategoryForm(item) {
    $.ajax({
        type: "post",
        url: "/cms/apps/category/" + item.attr("data-alias"),
        data: {
            _id: item.attr("id")
        },
        success: function(data) {
            showDynamic(data);
        },
        error: function(data, status, error) {
            alert("An Error Occurred: " + error);
        }
    });
}

function deleteItem(item) {
    var type = item.attr("rel");
    if (type === "application") {
        if (confirm("Are you sure you want to delete this app?")) {
            $.ajax({
                type: "post",
                url: "/cms/apps/" + item.attr("data-alias") + "/delete",
                data: {
                    _id: item.attr("id")
                },
                success: function(data) {
                    showDynamic(data);
                    reloadTree();
                },
                error: function(data, status, error) {
                    alert("An Error Occurred: " + error);
                }
            });
        }
    } else if (type === "category") {
        if (confirm("Are you sure you want to detach the category?")){
            $("#app_index_browser_panel").jstree("remove", $(item));
            updateTree();    
        }
    } else if (type === "article") {
        if(confirm("Are you sure you want to detach the article?")){
            $("#app_index_browser_panel").jstree("remove", $(item));
            updateTree();    
        }
    }
}

function loadAddCategoryForm(item) {
    $.ajax({
        type: "get",
        url: "/cms/apps/category/add",
        data: {},
        success: function(data) {
            showDynamic(data);
        },
        error: function(data, status, error) {
            alert("An Error Occurred: " + error);
        }
    });
}

function loadAddArticleForm(item) {
    $.ajax({
        type: "get",
        url: "/cms/apps/article/add",
        data: {},
        success: function(data) {
            showDynamic(data);
        },
        error: function(data, status, error) {
            alert("An Error Occurred: " + error);
        }
    });
}

// function loadEditArticleForm(item) {
//     $.ajax({
//         type: "post",
//         url: "/cms/apps/article/" + item.attr("data-alias"),
//         data: {
//             _id: item.attr("id")
//         },
//         success: function(data) {
//             showDynamic(data);
//         },
//         error: function(data, status, error) {
//             alert("An Error Occurred: " + error);
//         }
//     });
// }

/**
 * Change the rank of an item.
 * This works based on position in the list of li's
 * Increasing rank swaps rank number with the above item
 * Decreasing rank  swaps rank number with the below item
 */
function changeRank(val) {
    var $currentNode = $("#app_index_browser_panel").jstree("get_selected");
    var oldRank = $currentNode.attr('data-rank'),
        newRank = null,
        sibling = null;

    // Increase rank - swap with above
    if(val >= 0) {
        sibling = $currentNode.prev();
    } 
    // Decrease rank - swap with below
    else {
        sibling = $currentNode.next();
    }

    // May occur if someone tries to increase max rank higher
    if(!sibling || (sibling.length && sibling.length != 1)) {
        return;   
    }

    newRank = sibling.attr('data-rank');

    // Swap the ranks
    $currentNode.attr('data-rank', newRank);
    sibling.attr('data-rank', oldRank);

    // Sort items according to rank, increase of item rank by one
    orderChildrenByRank($currentNode.parent());
    $('.updateTree').fadeIn();
}

function orderChildrenByRank(node) {
    $node = $(node);
    // Only order items in the first ul element (the topmost ul)
    var $parent = $node.is('ul') ? $node : $($node.find('ul')[0]);
    var children = $($parent.children());
    
    children.sort(function(a, b) {
        a = parseInt($(a).attr('data-rank'));
        b = parseInt($(b).attr('data-rank'));

        if(a > b) {
            return -1;
        } else if(a < b) {
            return 1;
        }

        return 0;
    });
    
    // Do a final loop over children to normalise rank numbers
    var maxRank = children.length;
    $.each(children, function(i, li) {;
        $(li).attr('data-rank', maxRank);
        maxRank--;
    });

    // Remove chilren and reinsert in order
    $parent.empty();
    $parent.append(children);
}

function saveApp() {
    $.ajax({
        type: "post",
        url: "/cms/apps/save",
        data: $("#app_create_form").serialize(),
        success: function(data) {
            showDynamic(data);
            reloadTree();
        },
        error: function(data, status, error) {
            alert("An Error Occurred!");
        }
    });
}

function updateApp() {
    $.ajax({
        type: "post",
        url: "/cms/apps/" + $("#app_edit_form_save_btn").attr("data-alias") + "/save",
        data: $("#app_edit_form").serialize(),
        success: function(data) {
            showDynamic(data);
            reloadTree();
        },
        error: function(data, status, error) {
            alert("An Error Occurred!");
        }
    });
}

// function createCategory() {
//     $.ajax({
//         type: "post",
//         url: "/cms/apps/category/save",
//         data: $("#category_create_form").serialize(),
//         success: function(data) {
//             var currentNode = $("#app_index_browser_panel").jstree("get_selected");
//             $("#app_index_browser_panel").jstree("create", currentNode, "last", data, updateTree, true);
//         },
//         error: function(data, status, error) {
//             alert("An Error Occurred!");
//         }
//     });
// }

function updateCategory() {
    $.ajax({
        type: "post",
        url: "/cms/apps/category/" + $("#category_edit_form_save_btn").attr("data-alias") + "/save",
        data: $("#category_edit_form").serialize(),
        success: function(data) {
            showDynamic(data);
            reloadTree();
        },
        error: function(data, status, error) {
            alert("An Error Occurred!");
        }
    });
}

function attachCategory() {
    $.ajax({
        type: "post",
        url: "/cms/apps/category/tree/" + $("select[name=categories]").val() + "/" + $("input[name=rank]").val(),
        data: {},
        success: function(data) {
            var currentNode = $("#app_index_browser_panel").jstree("get_selected");
            $("#app_index_browser_panel").jstree("create", currentNode, "last", data, updateTree, true);
        },
        error: function(data, status, error) {
            alert("An Error Occurred!");
        }
    });
}

function attachArticle() {
    var objs = [];
    $(".articleItem:checked").each(function() {
        var obj = {};
        var data = $(this).data();
        obj.data = data.name;
        obj.attr = {};
        obj.attr.id = data.id;
        obj.attr.rel = data.rel;
        obj.attr["data-alias"] = data.alias;
        obj.attr["data-version"] = data.version;
        objs.push(obj);
    });

    var length = objs.length;
    var currentNode = $("#app_index_browser_panel").jstree("get_selected");
    
    function _processd() {
        length--;
        if (length == 0){
            updateTree();
        }
    }

    for (var i = 0; i < objs.length; i++) {
        var obj = objs[i];
        $("#app_index_browser_panel").jstree("create", currentNode, "last", obj, _processd, true);
    }
    
}


// function updateArticle() {
//     //set value for content textarea to be the content of tinymce editor so that it will be sent when form is serialized
//     tinyMCE.triggerSave();

//     $.ajax({
//         type: "post",
//         url: "/cms/apps/article/" + $("#article_edit_form_save_btn").attr("data-alias") + "/save",
//         data: $("#article_edit_form").serialize(),
//         success: function(data) {
//             showDynamic(data);
//             reloadTree();
//         },
//         error: function(data, status, error) {
//             alert("An Error Occurred!");
//         }
//     });
// }
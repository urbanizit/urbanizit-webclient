var Urbanizit = (function () {
    "use strict";
    var self = {

        searchNode:function () {
            $("#searchResults").empty();

            $.getJSON(
                'http://localhost:7474/db/data/index/node/componentNames?query=name:*' + $("#searchName").val() + '*',
                function (data) {
                    self.searchResults = data;
                    var idx = 0;
                    var resultElement = {
                        'nodes':data,
                        'idx':function (text, render) {
                            return idx++;
                        }
                    };
                    var output = ich.searchResultTemplate(resultElement);
                    $('#searchResults').append(output);
                }
            );
        },

        selectNodeUrl:function (nodeUrl) {
            $.getJSON(nodeUrl, self.selectNode);
        },

        selectNode:function (node) {
            $('#focusPane').empty();
            var output = ich.componentTemplate(node);
            $('#focusPane').append(output);
            self.displayNodeIncomingRelationships(node);
            self.displayNodeOutgoingRelationships(node);
        },

        displayNodeIncomingRelationships: function(node) {
            $.getJSON(
                node.incoming_relationships,
                function (data) {
                    var group = self.groupRelationships(true, data);
                    $('#incomingPane').empty();
                    var output = ich.incomingComponentRelationshipsTemplate({
                        relationshipsSize:data.length,
                        relationships:group
                    });
                    $('#incomingPane').append(output);
                }
            );
        },

        displayNodeOutgoingRelationships:function(node) {
            $.getJSON(
                node.outgoing_relationships,
                function (data) {
                    var group = self.groupRelationships(false, data);
                    $('#outgoingPane').empty();
                    var output = ich.outgoingComponentRelationshipsTemplate({
                        relationshipsSize:data.length,
                        relationships:group
                    });
                    $('#outgoingPane').append(output);
                }
            );
        },

        groupRelationships:function (byStart, data) {
            var relationsByNode = {};
            var relationsByNodeArray = [];
            var idx = 0;
            var node;
            var focusNode = byStart ? data[0].end : data[0].start;

            $.each(data, function (idx, elt) {
                node = byStart ? elt.start : elt.end;
                if (!relationsByNode.hasOwnProperty(node)) {
                    relationsByNode[node] = 1;
                } else {
                    relationsByNode[node] += 1;
                }
            });

            //convert to array
            $.ajaxSetup({async:false});
            for (node in relationsByNode) {

                $.getJSON(
                    node,
                    function (data) {
                        relationsByNodeArray[idx] = {'node':data, 'focusNode':focusNode, 'relationCount':relationsByNode[node]};
                        idx++;
                    }
                );
            }
            $.ajaxSetup({async:true});
            return relationsByNodeArray;
        },

        setSearchPaneDisplay: function(show) {
            var showSearchPane = (show=='show');
            if(showSearchPane) {
                $("#mainPane").hide();
                $("#searchPane").show();
            }  else {
                $("#searchPane").hide();
                $("#mainPane").show();
            }
        },

        loadTemplates:function() {
            $.get("templates/template.html", function(templates){
                $("head").append(templates);
                ich.grabTemplates();
            });

        },

        getNodeIdFromResourceUrl:function (url) {
            var splitedUrl = url.split("/");
            return splitedUrl[splitedUrl.length-1];
        },

        displayRelationships:function (urlFrom, urlTo) {
            var from=self.getNodeIdFromResourceUrl(urlFrom);
            var to=self.getNodeIdFromResourceUrl(urlTo);
            var queryGetRelations = "START x  = node("+from+"), n=node("+to+") MATCH x -[r]-> n return r.type?, r.method?";
            $.post(
                "http://localhost:7474/db/data/cypher",
                {"query": queryGetRelations},
                function(data) {
                    var dataJSON;
                    var type;
                    var idx=0;
                    //difference between chromium(return a JSON object) & firefox (return a string)
                    if(data.data) {
                        dataJSON = data;
                    } else {
                        dataJSON = $.parseJSON(data);
                    }

                    var relationshipsGroups = {};
                    //group relations by type
                    $.each(dataJSON.data, function(index, value) {
                        if(!relationshipsGroups.hasOwnProperty(value[0])) {
                            relationshipsGroups[value[0]]=[];
                        }
                        relationshipsGroups[value[0]].push({type:value[0], methodName:value[1]});
                    });
                    //convert the map to an array of objects
                    var relationshipsObject = [];
                    for(type in relationshipsGroups) {
                        relationshipsObject[idx]= {type:type, relations:relationshipsGroups[type]};
                        idx++;
                    }


                    $('#focusPane').empty();
                    var output = ich.methodsTemplate({relationships:relationshipsObject});
                    $('#focusPane').append(output);
                }
            );

            $.getJSON(
                urlFrom,
                function(node) {
                    $('#incomingPane').empty();
                    var output = ich.componentTemplate(node);
                    $('#incomingPane').append(output);
                });
            $.getJSON(
                urlTo,
                function(node) {
                    $('#outgoingPane').empty();
                    var output = ich.componentTemplate(node);
                    $('#outgoingPane').append(output);
                });
        },

        displayMethodConsumers:function(type, method) {
            var from=self.getNodeIdFromResourceUrl($("#outgoingPane .urb-displayNode").data("nodeResourceUrl"));
            var queryGetRelations =
                " START x = node("+from+")" +
                " MATCH b-[r:USE]->x" +
                " WHERE r.type=\""+type+"\" " +
                " AND r.method=\""+method+"\" " +
                " return b";
            $.post(
                "http://localhost:7474/db/data/cypher",
                {"query": queryGetRelations},
                function(data) {
                    var group=[];
                    $.each(data.data, function(index, value) {
                        group.push({node:value[0]});
                    });


                    $('#incomingPane').empty();
                    var output = ich.incomingComponentRelationshipsTemplate({
                        relationshipsSize:data.length,
                        relationships:group
                    });
                    $('#incomingPane').append(output);
                }
            );
        },

        init:function () {
            self.setSearchPaneDisplay('show');
            self.loadTemplates();

            $("#searchResults").on("click", "a.urb-node", function(event){
                self.setSearchPaneDisplay('hide');
                self.selectNodeUrl(event.target.dataset.nodeResourceUrl);
            });

            $("#searchForm").on("submit", function(event){
                self.setSearchPaneDisplay('show');
                self.searchNode();
                //cancel submit
                event.preventDefault();
            });

            $("#incomingPane").on("click", "a.urb-node", function(event) {
                self.selectNodeUrl(event.target.dataset.nodeResourceUrl);
            });
            $("#incomingPane").on("click", "input.urb-relationships", function(event) {
                self.displayRelationships(event.target.dataset.nodeResourceUrl, event.target.dataset.nodeFocus);
            });

            $("#focusPane").on("click", "code", function(event) {
                $("#focusPane code").each(function() {$(this).css("border", "1px solid #E1E1E8");});
                $(this).css("border", "2px solid black");
                self.displayMethodConsumers(event.target.dataset.methodType, event.target.dataset.methodName);
            });

            $("#outgoingPane").on("click", "a.urb-node", function(event) {
                self.selectNodeUrl(event.target.dataset.nodeResourceUrl);
            });
            $("#outgoingPane").on("click", "input.urb-relationships", function(event) {
                self.displayRelationships(event.target.dataset.nodeFocus, event.target.dataset.nodeResourceUrl);
            });


        }

    };

    self.init();

    return self;

})();
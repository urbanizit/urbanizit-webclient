var Urbanizit = (function () {
    "use strict";
    var self = {
        searchResults:null,
        currentNode:null,

        searchNode:function () {
            self.clearSearchResults();

            $.getJSON(
                'http://localhost:7474/db/data/index/node/coponentNames?query=name:*' + $("#searchName").val() + '*',
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

        clearSearchResults:function () {
            self.searchResults = null;
            $("#searchResults").empty();
        },

        selectNodeIdx:function (nodeIdx) {
            self.selectNode(self.searchResults[nodeIdx]);
        },

        selectNodeUrl:function (nodeUrl) {
            $.getJSON(nodeUrl, self.selectNode);
        },

        selectNode:function (node) {
            var output;
            self.currentNode = node;
            $('#displayNode').empty();
            output = ich.nodeTemplate(self.currentNode);
            $('#displayNode').append(output);

            //incomnig
            $.getJSON(
                self.currentNode.incoming_relationships,
                function (data) {
                    var group = self.groupRelationships(true, data);
                    $('#relationshipsIn').empty();
                    var output = ich.relationshipsTemplate({
                        relationshipsSize:data.length,
                        relationships:group
                    });
                    $('#relationshipsIn').append(output);
                }
            );
            //outgoing
            $.getJSON(
                self.currentNode.outgoing_relationships,
                function (data) {
                    var group = self.groupRelationships(false, data);
                    $('#relationshipsOut').empty();
                    var output = ich.relationshipsTemplate({
                        relationshipsSize:data.length,
                        relationships:group
                    });
                    $('#relationshipsOut').append(output);
                }
            );
        },

        groupRelationships:function (byStart, data) {
            var relationsByNode = {};
            var relationsByNodeArray = [];
            var idx = 0;
            var nodeObj;
            var node;

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
                        relationsByNodeArray[idx] = {'node':data, 'relationCount':relationsByNode[node]};
                        idx++;
                    }
                );
            }
            $.ajaxSetup({async:true});
            return relationsByNodeArray;
        },

        init:function () {
            $("#searchResults").on("click", "li", function(event){
                self.selectNodeIdx(event.target.dataset.nodeResultIdx);
            });

            $("#searchForm").on("submit", function(event){
                self.searchNode();
                //cancel submit
                event.preventDefault();
            });

            $("#relationshipsIn").on("click", "li", function(event) {
                self.selectNodeUrl(event.target.dataset.nodeResourceUrl);
            });

            $("#relationshipsOut").on("click", "li", function(event) {
                self.selectNodeUrl(event.target.dataset.nodeResourceUrl);
            });

        }

    };

    self.init();
    return self;

})();
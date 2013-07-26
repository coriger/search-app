var searchApp = angular.module("searchApp", ['ui.bootstrap']);
searchApp.directive('fileUpload', function () {
    return {
        scope: true,        //create a new scope
        link: function (scope, el, attrs) {
            el.bind('change', function (event) {
                var files = event.target.files;
                //iterate files since 'multiple' may be specified on the element
                for (var i = 0;i<files.length;i++) {
                    //emit event upward
                    scope.$emit("fileSelected", { file: files[i] });
                }                                       
            });
        }
    };
});
searchApp.controller("SearchController", function($scope, $http, $dialog, pdfSearchService) {
	$scope.opts = {
		    backdrop: true,
		    keyboard: true,
		    backdropClick: true,
		    templateUrl:  'resources/template/show.html', 
		    controller: 'ShowController'
	};
	$scope.submitSearch = function() {
		$scope.results = [];
		var keyword = $scope.searchKeyword;
		pdfSearchService.findResults(keyword, function(results) {
			$scope.results = results;
			$scope.result_text = "No result found";
			$('.results-div').hide();
			if(results.length > 0){
				$('.results-div').show();
				$scope.result_text = "Results of "+keyword;
			}
			$scope.$apply();
			$scope.addVisualization();
		});
	};
	$scope.addVisualization = function(){
		var nodes = $scope.results;
		var highlightsArr = [];
		var color = d3.scale.category20();
		var w = $("#vis").width(), h = $("#vis").height()-5;
		if($(".svg_vis").length > 0)
			$(".svg_vis").remove();
		if(nodes.length <= 0)
			return;
		var force = d3.layout.force()
		    .gravity(0.05)
		    .charge(function(d, i) { return i ? 0 : -2000; })
		    .nodes(nodes)
		    .size([w, h]);
		if(nodes.length != 1){		   
		    nodes[0].fixed = true;
		}		
		force.start();
		var svg = d3.select("#vis").append("svg:svg")
		    .attr("width", w)
		    .attr("height", h)
		    .attr("class","svg_vis");
		nodes.forEach(function(d,i){ 
			highlightsArr.push(d.highlights.length); 
		});
		var radiusScale = d3.scale.linear()
			.domain([d3.min(highlightsArr), d3.max(highlightsArr)])
			.range([6, 100]);
		svg.append("svg:rect")
		    .attr("width", w)
		    .attr("height", h);
		var circle = svg.selectAll("circle")
		    .data(nodes.slice(1))
		    .enter().append("svg:circle")
		    .attr("r", function(d) {
		    	d.radius = radiusScale(d.highlights.length);
		    	return d.radius; 
		    })
		    .style("fill", function(d, i) { return color(i) })
		    .call(force.drag)
		    .on("click",function(d){
			    $scope.show(d);
		    })
		    .append("svg:title")
		    .text(function(d){ return d.title; });
		force.on("tick", function(e) {
			  var q = d3.geom.quadtree(nodes),
			      i = 0,
			      n = nodes.length;
			  while (++i < n) q.visit(collide(nodes[i]));
			  svg.selectAll("circle")
			      .attr("cx", function(d) { return d.x; })
			      .attr("cy", function(d) { return d.y; });
		});
		function collide(node) {
			var r = node.radius + 16,
				nx1 = node.x - r,
				nx2 = node.x + r,
				ny1 = node.y - r,
				ny2 = node.y + r;
			return function(quad, x1, y1, x2, y2) {
				if (quad.point && (quad.point !== node)) {
					var x = node.x - quad.point.x,
					y = node.y - quad.point.y,
					l = Math.sqrt(x * x + y * y),
					r = node.radius + quad.point.radius;
					if (l < r) {
						l = (l - r) / l * .5;
						node.x -= x *= l;
						node.y -= y *= l;
						quad.point.x += x;
						quad.point.y += y;
					}
				}
				return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
			};
		}
	};
	$scope.show = function(item){
		angular.extend($scope.opts, {resolve: {item: function(){ return angular.copy(item); }}})
	    var d = $dialog.dialog($scope.opts);
	    d.open();
	};
	//listen for the file selected event
	$scope.files = [];
    $scope.$on("fileSelected", function (event, args) {
        $scope.$apply(function () {            
            //add the file object to the scope's files collection
        	var file = args.file;
        	if(file.type == "application/pdf") file.response = "resources/images/success.png"
        	else  file.response = "resources/images/error.png"
        	$scope.files.push(file);
        });
    });
    $scope.deleteFile = function(index) {
    	$scope.files.splice(index,1)
    };
    $scope.upload = function(){
        $http({
            method: 'POST',
            url: "upload",
            headers: { 'Content-Type': false },
            //This method will allow us to change how the data is sent up to the server
            // for which we'll need to encapsulate the model data in 'FormData'
            transformRequest: function (data) {
                var formData = new FormData();
                $.each(data.files,function(index,file){
                	if(file.type == "application/pdf")
                		formData.append("files[]", file);
                });
                return formData;
            },
            //Create an object that contains the model and files which will be transformed
            // in the above transformRequest method
            data: { files: $scope.files }
        }).
        success(function (data, status, headers, config) {
            alert("success!");
            console.log(data);
            console.log(status);
        }).
        error(function (data, status, headers, config) {
        	alert("failed!");
            console.log(data);
            console.log(status);
        });
    };
});
searchApp.controller("ShowController", function($scope, item, dialog) {
	$scope.item = item;
	$scope.close = function(){
	   dialog.close(undefined);
	};
});

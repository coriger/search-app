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
			visualize(results);
		});
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

<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">

<head lang="en">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>QB Search</title>
<link rel="stylesheet" href="<c:url value="/resources/css/bootstrap.css" />" type="text/css" />
<link rel="stylesheet" href="<c:url value="/resources/css/style.css" />" type="text/css" />
<script src="<c:url value="/resources/lib/angular.js"/>"></script>
<script src="<c:url value="/resources/lib/jquery-1.9.1.js" />"></script>
<script src="<c:url value="/resources/lib/ui-bootstrap-tpls-0.4.0.js" />"></script>
<script src="<c:url value="/resources/js/searchApp.js"/>"></script>
<script src="<c:url value="/resources/js/pdfSearchService.js"/>"></script>

</head>
<body ng-app="searchApp">
	<div ng-controller="SearchController">
		<div class="search-div">
			<h1>PDF Search</h1>
			<form ng-submit="submitSearch()">
				<input type="text" class="search-text" placeholder="Enter search term" ng-model="searchKeyword"> 
					<input type="submit" id="search-btn" value="Search" class="btn btn-primary">
						<span class="help-block">{{result_text}}</span>
			</form>
		</div>
		<tabset>
		 	<tab heading="Search">
			<div class="results-div">
				<table class="table">
					<tr>
						<th>Title</th>
						<th>Author</th>
						<th>Action</th>
					</tr>
					<tr ng-repeat="result in results">
						<td class="title">{{result.title}}</td>
						<td class="author">{{result.author}}</td>
						<td><a href="export/?filePath={{result.url}}" download="{{result.fileName}}" target="_blank"
							class="btn btn-small btn-success">Download</a>
							<a href="" class="btn btn-small btn-info infobtn" id="{{result.id}}">Info</a>
						</td>
					</tr>
				</table>
			</div>
			</tab>
			<tab heading="Visualization">
				<div id="vis">
				</div>
			</tab>
				<tab heading="Upload">
					<form id="fileupload" method="POST" enctype="multipart/form-data">
				        <div class="row upload-bar">
				            <div class="span7">
				                <button class="btn btn-success fileinput-button">
				                    <i class="icon-plus icon-white"></i>
				                    <input type="file" name="files[]" multiple file-upload accept="application/pdf"/>
				                    <span>Add files...</span>
				                </button>
				                <button type="submit" class="btn btn-primary start" ng-click="upload()">
				                    <i class="icon-upload icon-white"></i>
				                    <span>Start upload</span>
				                </button>
				                <button type="reset" class="btn btn-warning cancel">
				                    <i class="icon-ban-circle icon-white"></i>
				                    <span>Cancel upload</span>
				                </button>
				             	<div class="upload-table-div">
						        	<table role="presentation" class="table">
							        	<tr>
							        		<th>File name</th>
							        		<th>File Size</th>
							        		<th>File format</th>
							        		<th>Delete</th>
							        	</tr>
						        		<tr ng-repeat="item in files">
							        		<td class="item-name">{{item.name}}</td>
							        		<td>{{item.size/(1024)}} KB</td>
							        		<td><img ng-src={{item.response}}></img></td>
							        		<td><img src='resources/images/delete.png' data-ng-click="deleteFile($index)"></img></td>
						        		</tr>
						        	</table>
						        </div>
				        	</div>
				        </div>
				    </form>
				</tab>
		</tabset>

	</div>
</body>

</html>

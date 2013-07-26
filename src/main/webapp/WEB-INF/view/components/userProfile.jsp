<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>

<!-- latest jQuery, Boostrap JS and hover dropdown plugin -->
<script
	src="<c:url value="/resources/js/twitter-bootstrap-hover-dropdown.min.js"/>"></script>
<script src="<c:url value="/resources/js/jquery-latest.min.js"/>"></script>
<script src="<c:url value="/resources/js/bootstrap.min.js"/>"></script>
		<div class="container">
			<ul class="nav pull-right">
				<li class="dropdown"><a href="#" class="dropdown-toggle"
					data-toggle="dropdown" data-hover="dropdown" data-delay="1000"
					data-close-others="false"> <c:out
							value="${sessionScope.openIdIdentity.fullname}" />
				</a>
					<ul class="dropdown-menu">
						<li><a tabindex="-1" href="#">Your Profile</a></li>
						<li class="divider"></li>
						<li><a tabindex="-1" href="sessions?action=logout">Logout</a></li>
					</ul></li>
			</ul>
		</div>

<!-- See more at:
http://www.w3resource.com/twitter-bootstrap/navbar-tutorial.php#sthash.TKj9gbx9.dpuf -->

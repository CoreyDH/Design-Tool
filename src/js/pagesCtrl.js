angular.module('designtool')
	.controller('pagesCtrl', ['$scope', 'globals', 'pageCalc', 'errorCheck','ajaxRequest', 'exporter', function($scope, globals, pageCalc, errorCheck, ajaxRequest, exporter) {
		'use strict';

		$scope.course = globals.get('info');
		$scope.navPages = globals.get('nav.filters.pages');
		$scope.pagesTemplate = globals.get('pagesTemplate');

		if(!$scope.pagesTemplate) {
			ajaxRequest.getPagesTemplate().then(function(response) {
  			$scope.pagesTemplate = response.data;

				console.log($scope.pagesTemplate);
  			globals.set('pagesTemplate', $scope.pagesTemplate);
		  });
		}

		$scope.setPages = function() {
			$scope.formattedPages = pageCalc.createPageObj($scope.pages.input);
		};

		$scope.mo = function() {
			// Members Only
			var page = this.page.page;
			var mo = page.substring(0,3);
			if(mo === 'mo_' && this.page.membersonly) {
				return;
			} else {
				if(mo === 'mo_') {
					this.page.page = page.slice(3,page.length);
				} else {
					this.page.page = 'mo_'+page;
				}
			}
		};

		$scope.exportNewPages = function() {
			$scope.exportPages($scope.formattedPages);
		};

		$scope.exportNavPages = function() {
			$scope.exportPages($scope.navPages);
		};

		$scope.exportAllPages = function() {

			var allPages = [];

			if($scope.formattedPages){
				allPages = allPages.concat($scope.formattedPages);
			}

			if($scope.navPages){
				allPages = allPages.concat($scope.navPages);
			}

			$scope.exportPages(allPages);
		};

		$scope.exportPages = function(pagesObj) {

			if(errorCheck.template($scope.course.template)) {
				var prepPages = pageCalc.prepareTemplate(pagesObj,$scope.course.template);

				if($scope.course.otherPages) {
					prepPages = prepPages.concat(pageCalc.prepOtherTemplate($scope.pagesTemplate[$scope.course.type].default, $scope.course.template));

					if(typeof $scope.pagesTemplate[$scope.course.type][$scope.course.template] !== 'undefined') {
						prepPages = prepPages.concat(pageCalc.prepOtherTemplate($scope.pagesTemplate[$scope.course.type][$scope.course.template], $scope.course.template));
					}
				}

				exporter.Pages(prepPages, $scope.course);

			}
		};


	}]);

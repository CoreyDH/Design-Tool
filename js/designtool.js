angular.module('CacheService', ['ng'])
    .factory('CacheService', function($cacheFactory) {
    return $cacheFactory('CacheService');
});

var designtool = angular.module('designtool',['ui.router','CacheService','colorpicker.module']);

designtool.config(['$stateProvider','$urlRouterProvider','$interpolateProvider', function($stateProvider,$urlRouterProvider,$interpolateProvider) {

  //$urlRouterProvider.otherwise('/course');
	$interpolateProvider.startSymbol('[[');
	$interpolateProvider.endSymbol(']]');

  $stateProvider
    .state('course', {
      url: '/course',
      templateUrl: 'views/course/course.html',
      controller: 'courseCtrl',
    })
    .state('navigation', {
      url: '/navigation',
      templateUrl: 'views/navigation/navigation.html',
      controller: 'navCtrl',
    })
    .state('pages', {
      url: '/pages',
      templateUrl: 'views/pages/pages.html',
	    controller: 'pagesCtrl',
    })
    .state('images', {
      url: '/images',
      templateUrl: 'views/images/images.html',
      controller: 'imgCtrl',
    })
    .state('css', {
      url: '/css',
      templateUrl: 'views/css/css.html',
      controller: 'cssCtrl',
    });


}]);

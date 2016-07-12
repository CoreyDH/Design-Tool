angular.module('designtool')
  .controller('courseCtrl', ['$scope', 'cbox','globals', function($scope,cbox,globals) {
  'use strict';

  $scope.course = {};
	$scope.media = globals.get('social');

	if(!$scope.media) {
		$scope.media = [
			{type:'Facebook', icon:'facebook'},
			{type:'Twitter', icon:'twitter'},
			{type:'Instagram', icon:'instagram'},
			{type:'Google+', icon:'google-plus'},
			{type:'YouTube', icon:'youtube'},
			{type:'Yelp', icon:'yelp'},
			{type:'Pinterest', icon:'pinterest'},
			{type:'Tumblr', icon:'tumblr'}
		];
	}

    $scope.example = function() {
      $scope.cboxdata = ''+
      'Blackhawk Golf Club\n'+
      '2714 Kelly Lane\n'+
      'Pflugerville, TX 78660\n'+
      '512-251-9000\n'+
      'WWW.BLACKHAWKGOLF.COM\n'+
	  'coursemail@email.com';

  	  $scope.course.type = 'golf';
  	  $scope.course.template = 'zilker';
    };

    $scope.$watch('cboxdata', function() {
      $scope.course = cbox.parseCbox($scope.cboxdata);

	  //console.log($scope.course);
      globals.set('info',$scope.course);
    });

	$scope.updateSocial = function() {
		$scope.course.social = $scope.media;
		globals.set('info',$scope.course);
		globals.set('social',$scope.media);
	};

  }]);

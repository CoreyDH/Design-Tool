angular.module('designtool')
    .controller('coursetourCtrl', ['$scope', 'globals', 'cropTool', 'ajaxRequest', 'errorCheck', '$timeout', function($scope, globals, cropTool, ajaxRequest, errorCheck, $timeout) {
        $scope.course = globals.get('info');


    }]);

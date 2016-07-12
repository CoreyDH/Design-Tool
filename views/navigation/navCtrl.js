angular.module('designtool')
    .controller('navCtrl', ['$scope', 'globals', 'navCalc', 'ajaxRequest', 'errorCheck', function($scope, globals, navCalc, ajaxRequest, errorCheck) {
        'use strict';

        $scope.nav = {};

        // Shared course $scope
        $scope.course = globals.get('info');
        $scope.nav.input = globals.get('nav.input');
        $scope.nav.filters = globals.get('nav.filters');

        var nfilter = globals.get('nfilter');
        if (!nfilter) {
            ajaxRequest.getFilter().then(function(response) {
                nfilter = response.data;
                globals.set('nfilter', nfilter);
            });
        }


        $scope.example = function() {
            $scope.nav.input = '';
            ajaxRequest.getTemplate('example.html').then(function(response) {

                $scope.nav.input = response.data;
            });
        };

        $scope.loadfilters = function() {
            if (errorCheck.template($scope.course.template)) {
                $scope.nav.filters = navCalc.navigation($scope.nav.input, nfilter[$scope.course.type]);
                $scope.setNav();
            } else {
                return;
            }
        };

        $scope.setNav = function() {
            globals.set('nav.input', $scope.nav.input);
        };

        $scope.deleteNavRow = function() {

            var that = this;
            var index = that.$index;
            var par;

            if (typeof that.sfilter === 'undefined') {

                $scope.nav.filters.navigation.splice(index, 1);

            } else if (typeof that.ssfilter === 'undefined') {

                par = that.$parent.$parent;
                par.filter.subtitle.splice(index, 1);

            } else {

                par = that.$parent.$parent;
                par.sfilter.subtitle.splice(index, 1);

            }

            globals.set('nav.filters', $scope.nav.filters);
        };


        $scope.commitNav = function() {

            if (errorCheck.general($scope.nav.filters.navigation, 'navigation.filters.navigation')) {
                var temp = $scope.course.template;

                $scope.nav.filters = navCalc.finalNav($scope.nav.filters, nfilter[$scope.course.type]);
                $scope.sortPages = navCalc.joinPages($scope.nav.filters.pages);

                //console.log($scope.nav.filters);


                ajaxRequest.getTemplate(temp + '/' + temp + '-nav.handlebars').then(function(response) {

                    var template = Handlebars.compile(response.data);
                    var html = template($scope.nav.filters);

                    $scope.nav.output = html;

                    // Add Event Listener jQuery zClip
                    navCalc.zClip();

                    globals.set('nav.output', $scope.nav.output);
                });



                globals.set('nav.filters', $scope.nav.filters);
                globals.set('nav.filters.pages', $scope.nav.filters.pages);
            }

        };

        /* jQuery */
        // Add Event Listener jQuery zClip on Modal Load
        $('#navCode').on('shown.bs.modal', navCalc.zClip);

    }]);

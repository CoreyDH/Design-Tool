angular.module('designtool')
    .controller('imgCtrl', ['$scope', 'globals', 'cropTool', 'ajaxRequest', 'errorCheck', '$timeout', function($scope, globals, cropTool, ajaxRequest, errorCheck, $timeout) {
        $scope.course = globals.get('info');
        $scope.imageTemplate = globals.get('imageTemplate');
        var croppieObj = [];

        // Get Image JSON function
        if (!$scope.imageTemplate) {
            ajaxRequest.getImageTemplate().then(function(response) {
                $scope.imageTemplate = response.data;
                globals.set('imageTemplate', $scope.imageTemplate);

                return $scope.imageTemplate;
            }).then(function(temp) {
                $scope.$watch('course.template', function() {

                    // set delay so template information loads first, then croptool populates
                    $timeout(function() {
                        croppieObj = cropTool.setupTool(temp[$scope.course.template]);
                    }, 1);

                });
            });
        } else {
            $scope.$watch('course.template', function() {

                // set delay so template information loads first, then croptool populates
                $timeout(function() {
                    croppieObj = cropTool.setupTool($scope.imageTemplate[$scope.course.template]);
                }, 1);

            });
        }

        $scope.setZoom = function(width) {

            var boundary = width + 70;
            var zoom;
            if (boundary > 1045) {
                //zoom = 1045/boundary;
                zoom = 0.5;
            }

            return {
                zoom: zoom
            };
        };

        $('.images').delegate('.upload', 'change', function() {
            var index = $(this).attr('id');
            cropTool.readFile(this, croppieObj[index]);
        });

        $scope.preview = function() {
            cropTool.results(croppieObj[this.$index]).then(function(resp) {
                $scope.$apply(function() {
                    $scope.imgpreview = resp;
                });
            });
        };

        $scope.clearImg = function() {

            var image = $('.cr-boundary img')[this.$index];
            image.src = '';

            croppieObj[this.$index].bind({
                url: ''
            });

        };

        $scope.download = function() {

            var index = this.$index;

            cropTool.results(croppieObj[index]).then(function(img) {

                var params = $scope.imageTemplate[$scope.course.template][index];
                cropTool.download(img, params);
            });
        };

        $scope.exportAll = function() {

            if (errorCheck.template($scope.course.template)) {
                var filename = $scope.course.name || $scope.course.template;
                filename += '-images';

                cropTool.exportAll(croppieObj, $scope.imageTemplate[$scope.course.template], filename);
            }
        };

    }]);

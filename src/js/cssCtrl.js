angular.module('designtool')
    .controller('cssCtrl', ['$scope', 'globals', 'cssCalc', 'exporter', 'errorCheck', function($scope, globals, cssCalc, exporter, errorCheck) {

        $scope.course = globals.get('info');
        $scope.colors = globals.get('colors');

        if (!$scope.colors) {
            cssCalc.getColors().then(function(response) {

                $scope.colors = response.data;
                globals.set('colors', $scope.colors);
            });
        }

        $scope.$watch('course.template', function() {
          if($scope.course.template) {
            $scope.template = 'templates/' + $scope.course.template + '/' + $scope.course.template + '-css.html';
          } else {
            $scope.template = '';
          }
        });

        $scope.setColor = function() {
            $scope.color[0].rgb = cssCalc.hexToRgb($scope.color[0].hex);
        };

        $('.upload').on('change', function() {

           cssCalc.readLogo(this, function(logo) {

             var sourceImage = document.getElementById("uploadLogo");
             sourceImage.src = logo;

             var colorThief = new ColorThief();
             var rgbPalette = colorThief.getPalette(sourceImage, 5);

            $scope.$apply(function() {
              $scope.thief = rgbPalette.map(function(p){
                return cssCalc.rgbToHex(p[0], p[1], p[2]);
              });

              $scope.templatelogo = logo;
            });
           });
        });


        $scope.exportCSS = function() {
            if (errorCheck.template($scope.course.template)) {

                var colorTemplate = $scope.colors[$scope.course.template];

                for (var colorType in colorTemplate) {

                    if (colorTemplate[colorType].hex)
                        colorTemplate[colorType].rgb = cssCalc.hexToRgb(colorTemplate[colorType].hex);
                }

                exporter.CSS($scope.course.template, colorTemplate, $scope.course);
            }
        };

    }]);

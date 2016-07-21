angular.module('designtool')
    .controller('headersCtrl', ['$scope', 'globals', 'cropTool', function($scope, globals, cropTool) {
        $scope.course = globals.get('info');

        var crop = $('.email-bg').croppie({
    			viewport: {
    				width: 600,
    				height: 175
    			  },
    			boundary: {
    			  width: 600,
    			  height: 175
    			}
  			});

        $('.images').delegate('.upload', 'change', function() {
            cropTool.readFile(this, crop);

            cropTool.results(crop).then(function(a) {

              console.log(a);
              plot(a);
            });
        });

        plotCanvas();

        function plotCanvas(img) {
          var base_image = new Image();
          base_image.src = img;

          base_image.onload = function(){
            var canvas = document.getElementById("canvas");

            canvas.width = 600;
            canvas.height = 175;
            context = canvas.getContext('2d');

            // Draw image within
            context.drawImage(base_image, 0,0);
          };
        }


    }]);

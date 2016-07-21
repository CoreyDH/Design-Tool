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

        $scope.preview = function() {
          plotCanvas();
        };

        $scope.max = 50;


        // jQuery
        $('.uploads').delegate('.upload-email-bg', 'change', function() {
            cropTool.readFile(this, crop);
            cropTool.results(crop).then(function(img) {
              $scope.$apply(function() {
                plotBG(img);
              });

            });
        });

        $('.uploads').delegate('.upload-email-logo', 'change', function() {

            readLogo(this, function(img) {

              $scope.$apply(function() {
                $scope.headerLogo = img;
              });

              plotLogo(img);

            });
        });

        $('#email-logo').draggable({
          containment: ".cr-viewport",
          cursor: "move"
        }).resizable({
          aspectRatio: true
        });


        // Service
        function plotCanvas() {
          var logo = document.getElementById('email-logo-canvas');
          var bg = document.getElementById('email-bg-canvas');
          var canvas = document.getElementById('email-canvas');

          canvas.width = 600;
          canvas.height = 175;
          var context = canvas.getContext('2d');

          context.drawImage(bg, 0, 0);
          context.drawImage(logo, 0, 0);
        }

        function readLogo(img, setLogo) {
          if (img.files && img.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {

              setLogo(e.target.result);
            };

            reader.readAsDataURL(img.files[0]);

            if(reader.error) {
              console.log(reader.error);
            }
          } else {
            return;
          }
        }

        function plotLogo(img) {
          var canvas = document.getElementById("email-logo-canvas");
          $logo = $('#email-logo');
          $container = $('.cr-viewport');

          var logo_image = new Image(125, 102);

          logo_image.src = img;

          logo_image.onload = function(){
            canvas.width = 600;
            canvas.height = 175;
            var context = canvas.getContext('2d');

            var posX = $logo.offset().left - $container.offset().left;
            var posY = $logo.offset().top - $container.offset().top;

            console.log(posX, posY);

            // Draw image within
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 1;
            context.shadowColor = '#000';
            context.shadowBlur = 1;
            context.drawImage(logo_image, posX, posY);
          }

        }

        function plotBG(img) {
          var base_image = new Image();
          base_image.src = img;

          base_image.onload = function(){
            var canvas = document.getElementById("email-bg-canvas");

            canvas.width = 600;
            canvas.height = 175;
            var context = canvas.getContext('2d');

            // Draw image within
            context.drawImage(base_image, 0,0);
          };
        }


    }]);

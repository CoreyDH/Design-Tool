angular.module('designtool')
    .controller('headersCtrl', ['$scope', 'globals', 'cropTool', '$q', function($scope, globals, cropTool, $q) {
      'use strict';
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

        $scope.params = {
          coupon: {
            color1 : '',
            color2 : ''
          },
          email: {
            logo: {
              shadow: {
                offsetX: 0,
                offsetY: 1,
                blur: 1,
                spread: 1,
                color: "rgba(0,0,0,1)",
                options: { floor: -10, ceil: 10, showSelectionBar: true, disabled: true }
              }
            },
            width: 600,
            height: 175
          }
        };

        $scope.dropShadow = function() {

            $scope.params.email.logo.shadow.options.disabled = ( $scope.params.email.logo.shadow.options.disabled ? false : true );
        };

        // $scope.$watch('params.email.logo.shadow', function() {
        //
        //   $scope.applyShadow($scope.params.email.logo.shadow);
        // });

        $scope.applyShadow = function(shadow) {

          if(shadow.options.disabled) {
            return;
          } else {
            return {
              '-webkit-filter': 'url(#logo-filter)',
              'filter': 'url(#logo-filter)'
            };
          }
        };

        $scope.preview = function() {
            cropTool.results(crop).then(function(img) {
              var deferred = $q.defer();
              var logo = $('.header-logo img').attr('src');
              $scope.params.email.logo.width = document.querySelector('.header-logo img').width;
              $scope.params.email.logo.height = document.querySelector('.header-logo img').height;

              plotLogo(logo, $scope.params.email);
              plotAddress();

              deferred.resolve(plotBG(img, $scope.params.email));

              return deferred.promise;

          }).then(function(img) {
              plotCanvas($scope.params.email);
          });
        };

        // jQuery
        $('.uploads').delegate('.upload-bg', 'change', function() {
            cropTool.readFile(this, crop);
        });

        $('.uploads').delegate('.upload-logo', 'change', function() {

          $('.header-logo').css({
            'width' : '',
            'height' : ''
          });

          readLogo(this, function(img) {
            $scope.$apply(function() {
              $scope.headerLogo = img;
            });

            var dim = getCorrectDim($('.header-logo img'), $('.cr-viewport'));
            // console.log(dim);

            $('.header-logo').css({
              'width' : dim.width,
              'height' : dim.height
            });

          });

        });

        $('.header-logo').draggable({
          containment: ".cr-viewport",
          cursor: "move"
        }).resizable({
          containment: ".cr-viewport",
          aspectRatio: true
        });

        $('.shadow-sliders-settings').on('click', function (event) {
            $(this).parent().toggleClass('open');
        });

        // Service
        function getCorrectDim($img, $container) {

          var newHeight, newWidth;

          if($img.height() > $container.height()) {

            newHeight = $container.height();
            newWidth = $img.width()*newHeight / $img.height();

          } else if($img.width() > $container.width()) {

            newWidth = $container.width();
            newHeight = $img.height()*newWidth / $img.width();

          } else {

            newWidth = $img.width();
            newHeight = $img.height();

          }

          return {
            width: newWidth,
            height: newHeight
          };
        }

        function plotCanvas() {
          var logo = document.getElementById('logo-canvas');
          var address = document.getElementById('address-canvas');
          var bg = document.getElementById('bg-canvas');
          var canvas = document.getElementById('canvas');

          canvas.width = 600;
          canvas.height = 175;
          var context = canvas.getContext('2d');

          context.drawImage(bg, 0, 0);
          context.drawImage(address, 0, 0);
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

        function plotLogo(img, params) {
          var canvas = document.getElementById("logo-canvas");
          var position = getOffset($('#email-logo'));

          var logo_image = new Image();

          logo_image.src = img;

          logo_image.onload = function(){
            canvas.width = params.width;
            canvas.height = params.height;
            var context = canvas.getContext('2d');

            context.shadowOffsetX = params.logo.shadow.offsetX;
            context.shadowOffsetY = params.logo.shadow.offsetY;
            context.shadowColor = params.logo.shadow.color;
            context.shadowBlur = params.logo.shadow.blur*2; //Multiplied by 2 to get closest look to webkit shadow

            // Draw image X times to increase density
            context.drawImage(logo_image, position.posX, position.posY, params.logo.width, params.logo.height);
          };
        }

        function getOffset($obj) {

          var $container = $('.cr-viewport');

          return {
            posX : $obj.offset().left - $container.offset().left,
            posY : $obj.offset().top - $container.offset().top
          };

        }

        function plotAddress(addr) {
          var canvas = document.getElementById("address-canvas");
          var position = getOffset($('#email-address'));

          canvas.width = 600;
          canvas.height = 175;
          var context = canvas.getContext('2d');

          context.fillStyle = '#fff';
          context.shadowOffsetX = 0;
          context.shadowOffsetY = 1;
          context.shadowColor = '#000';
          context.shadowBlur = 2;
          context.font = 'bold 15px sans-serif';

          context.strokeStyle = '#000';
          context.lineWidth = 1;

          context.strokeText("2714 Kelly Lane • Pflugerville, TX 78660 • 512-251-9000", position.posX+1, position.posY); // Offset X pos by 1
          context.fillText("2714 Kelly Lane • Pflugerville, TX 78660 • 512-251-9000", position.posX, position.posY);

        }

        function plotBG(img, params) {
          var base_image = new Image();
          base_image.src = img;

          base_image.onload = function(){
            var canvas = document.getElementById("bg-canvas");

            canvas.width = params.width;
            canvas.height = params.height;
            var context = canvas.getContext('2d');

            // Draw image within
            context.drawImage(base_image, 0,0);
          };
        }

    }]);

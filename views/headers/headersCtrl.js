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
                color: "rgba(0,0,0,1)",
                options: { floor: 0, ceil: 10, showSelectionBar: true }
              }
            },
            width: 600,
            height: 175
          }
        };

        $scope.dropShadow = function() {

          if($scope.logoShadow) {
            $scope.logoShadow = '';
            $scope.params.email.logo.shadow.options.disabled = true;
          } else {
            $scope.logoShadow = applyShadow($scope.params.email.logo.shadow);
            $scope.params.email.logo.shadow.options.disabled = false;
          }
        };



        $scope.preview = function() {
            cropTool.results(crop).then(function(img) {
              var deferred = $q.defer();
              var logo = $('.logo img').attr('src');
              $scope.params.email.logo.width = document.querySelector('.logo img').width;
              $scope.params.email.logo.height = document.querySelector('.logo img').height;

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

          readLogo(this, function(img) {
            $scope.$apply(function() {
              $scope.headerLogo = img;
            });
          });

        });

        $('.logo').draggable({
          containment: ".cr-viewport",
          cursor: "move"
        }).resizable({
          containment: ".cr-viewport",
          aspectRatio: true,
          // resize: function(event, ui) {
          //
          //   var container = this;
          //   var $img = $(this).find('img');
          //
          //   if(container.clientWidth > container.clientHeight) {
          //     $img.css({
          //       'width' : 'auto',
          //       'height' : '100%'
          //     });
          //   } else {
          //     $img.css({
          //       'width' : '100%',
          //       'height' : 'auto'
          //     });
          //   }
          // }
        });

        // Service
        function plotCanvas() {
          var logo = document.getElementById('logo-canvas');
          var address = document.getElementById('address-canvas');
          var bg = document.getElementById('bg-canvas');
          var canvas = document.getElementById('canvas');

          canvas.width = 600;
          canvas.height = 175;
          var context = canvas.getContext('2d');

          context.drawImage(bg, 0, 0);
          context.drawImage(logo, 0, 0);
          context.drawImage(address, 0, 0);
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

            //console.log(posX, posY);

            // Draw image within
            context.shadowOffsetX = params.logo.shadow.offsetX;
            context.shadowOffsetY = params.logo.shadow.offsetY;
            context.shadowColor = params.logo.shadow.color;
            context.shadowBlur = params.logo.shadow.blur;
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

          // context.strokeStyle = '#000';
          // context.lineWidth = 1;
          // context.strokeText("2714 Kelly Lane • Pflugerville, TX 78660 • 512-251-9000", position.posX, position.posY);

          context.font = 'bold 15px sans-serif';
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

        function applyShadow(shadow) {
          return {
            '-webkit-filter': 'drop-shadow('+shadow.offsetX+'px '+shadow.offsetY+'px '+shadow.blur+'px '+shadow.color+')',
            'filter': 'drop-shadow('+shadow.offsetX+'px '+shadow.offsetY+'px '+shadow.blur+'px '+shadow.color+')'
          };
        }


    }]);

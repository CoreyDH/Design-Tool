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
          logo: {
            shadow: {
              id: 'logo-filter',
              offsetX: 0,
              offsetY: 1,
              blur: 1,
              spread: 1,
              color: "rgba(0,0,0,1)",
              options: { floor: -10, ceil: 10, showSelectionBar: true, disabled: true }
            }
          },
          address: {
            color: "#fff",
            size: 18,
            weight: 600,
            options: { floor: 10, ceil: 30, showSelectionBar: true, disabled: false },
            shadow: {
              id: 'address-filter',
              offsetX: 0,
              offsetY: 0,
              blur: 2,
              spread: 2,
              color: "rgba(0,0,0,1)",
              options: { floor: 0, ceil: 10, showSelectionBar: true, disabled: false }
            }
          },
          gradient: {
            color1 : '#fcfcfc',
            color2 : '#dbdbdb'
          },
          email: {
            id: 'email',
            width: 600,
            height: 175
          }
        };

        $scope.headerLogo = 'https://www.coursetrends.com/golf/designs/comal/images/design/logo.png';
        $scope.svg = {
          logo: {
            filter: ''
          },
          address: {
            filter: ''
          }
        };
        $scope.shadowStyle = {
          logo: '',
          address: ''
        };

        $scope.toggleShadow = function(el) {

          $scope.params[el].shadow.options.disabled = ( $scope.params[el].shadow.options.disabled ? false : true );

          if($scope.params[el].shadow.options.disabled) {

            $scope.shadowStyle[el] = '';
            $scope.svg[el].filter = '';

          } else {

            $scope.svg[el].filter = $scope.params[el].shadow.id;
            $scope.shadowStyle[el] =  {
              '-webkit-filter': 'url("#'+el+'-filter")',
              'filter': 'url("#'+el+'-filter")'
            };

          }
        };

        $scope.preview = function() {
          cropTool.results(crop).then(function(img) {

            var deferred = $q.defer();

            var logo = document.querySelector('.header-logo img').src;
            $scope.params.logo.width = document.querySelector('.header-logo img').width;
            $scope.params.logo.height = document.querySelector('.header-logo img').height;

            plotLogo(logo, $scope.params.logo, $scope.params.email);
            plotAddress(document.getElementById('email-address').innerText, $scope.params.email);

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

      function plotCanvas(container) {
        var logo = document.getElementById('logo-canvas');
        var address = document.getElementById('address-canvas');
        var bg = document.getElementById('bg-canvas');
        var canvas = document.getElementById('canvas');

        canvas.width = container.width;
        canvas.height = container.height;
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

      function plotLogo(img, logoData, containerData) {

        var canvas = document.getElementById("logo-canvas");
        var position = getOffset($('#'+containerData.id+'-logo'));

        var svgImage = document.getElementById('svg-logo-image');

        svgImage.setAttribute('xlink:href', img);
        svgImage.setAttribute('width', logoData.width);
        svgImage.setAttribute('height', logoData.height);

        var svgData = new XMLSerializer().serializeToString(document.getElementById("svg-logo"));

        var encodedData = window.btoa(svgData);
        var newSrc = 'data:image/svg+xml;base64,'+encodedData;

        // Alternate Method, (slower)
        // var svgBlob = new Blob([svgData], {type: "image/svg+xml;charset=utf-8"});
        // var newSrc = window.URL.createObjectURL(svgBlob);

        var logo_image = new Image();
        logo_image.src = newSrc;

        logo_image.onload = function(){
          canvas.width = containerData.width;
          canvas.height = containerData.height;
          var context = canvas.getContext('2d');

          context.drawImage(logo_image, position.posX, position.posY);
        };
      }

      function plotAddress(text, containerData) {
        var canvas = document.getElementById("address-canvas");
        var position = getOffset($('#'+containerData.id+'-address'));

        canvas.width = containerData.width;
        canvas.height = containerData.height;
        var context = canvas.getContext('2d');

        context.fillStyle = '#fff';
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 1;
        context.shadowColor = '#000';
        context.shadowBlur = 2;
        context.font = 'bold 15px sans-serif';
        context.strokeStyle = '#000';
        context.lineWidth = 1;

        context.strokeText(text, position.posX+1, position.posY); // Offset X pos by 1
        context.fillText(text, position.posX, position.posY);

      }

      function plotBG(img, container) {
        var base_image = new Image();
        base_image.src = img;

        base_image.onload = function(){
          var canvas = document.getElementById("bg-canvas");

          canvas.width = container.width;
          canvas.height = container.height;
          var context = canvas.getContext('2d');

          // Draw image within
          context.drawImage(base_image, 0,0);
        };
      }

      function getOffset($obj) {

        var $container = $('.cr-viewport');

        return {
          posX : $obj.offset().left - $container.offset().left,
          posY : $obj.offset().top - $container.offset().top
        };

      }

      // function isBase64(str) {
      //
      //   str = str.replace(/^data:image\/.+;base64,/i, '');
      //
      //   try {
      //       return btoa(atob(str)) == str;
      //   } catch (err) {
      //       return false;
      //   }
      // }
      //
      // function getBase64(url, callback) {
      //   var xhr = new XMLHttpRequest();
      //   xhr.responseType = 'blob';
      //   xhr.onload = function() {
      //     var reader = new FileReader();
      //     reader.onloadend = function() {
      //       callback(reader.result);
      //     };
      //     reader.readAsDataURL(xhr.response);
      //   };
      //   xhr.open('GET', url);
      //   xhr.send();
      // }

  }]);

angular.module('designtool')
    .controller('headersCtrl', ['$scope', '$timeout', 'globals', 'ajaxRequest', 'cropTool', 'headersCalc', function($scope, $timeout, globals, ajaxRequest, cropTool, headersCalc) {
      'use strict';

      $scope.course = globals.get('info');
      $scope.params = globals.get('headerTemplate');
      var croppieObj;

      // Get Headers JSON
      if (!$scope.params) {
          ajaxRequest.getHeadersTemplate().then(function(response) {

            $scope.params = response.data;
            globals.set('headerTemplate', $scope.params);

          });
        }

      // Filter Toggle for SVG
      $scope.svg = {
        logo: {
          filter: ''
        },
        address: {
          filter: 'address-filter'
        }
      };

      $timeout(function(){

        croppieObj = cropTool.setupTool($scope.params.containers);
        initJQuery();

      }, 1);

      $scope.$watchGroup(['params.gradient.color1', 'params.gradient.color2'], function() {

        $('.cr-boundary').css({
          'background' : 'linear-gradient(to bottom,  '+$scope.params.gradient.color1+' 0%,'+$scope.params.gradient.color2+' 100%)'
        });

      });


      $scope.toggleShadow = function(el) {

        $scope.params[el].shadow.options.disabled = ( $scope.params[el].shadow.options.disabled ? false : true );

        if($scope.params[el].shadow.options.disabled) {

          $scope.svg[el].filter = '';

        } else {

          $scope.svg[el].filter = $scope.params[el].shadow.name;

        }
      };

      $scope.addressStyle = function() {

        return {
          'color' : $scope.params.address.color,
          'font-size' : $scope.params.address.size+'px',
          'font-weight' : $scope.params.address.weight
        };
      };

      $scope.preview = function() {
        headersCalc.plot(this.$index, $scope.params.containers[this.$index], $scope.params, croppieObj[this.$index]);
      };

      $scope.download = function() {

        var index = this.$index;
        var container = $scope.params.containers[this.$index];

        headersCalc.plot(index, container, $scope.params, croppieObj[index]).then(function(image) {

          image.canvas.toBlob(function(blob) {
              saveAs(blob, container.name+'.jpg');
            }, "image/jpeg");

        });
      };

      $scope.clearImg = function() {

          var image = $('.cr-boundary img')[this.$index];
          image.src = '';

          croppieObj[this.$index].bind({
              url: ''
          });

      };

      $scope.exportAll = function() {

        var filename = $scope.course ?  $scope.course.name || $scope.course.template : 'site';
        filename += '-headers';

        headersCalc.exportHeaders($scope.params, croppieObj, filename);

      };

      // jQuery
      function initJQuery() {

        $('.uploads').delegate('#upload-bg', 'change', function() {

          for(var i=0; i < $scope.params.containers.length; i++) {

            if($scope.params.containers[i].type === 'coupon')
              continue;

            cropTool.readFile(this, croppieObj[i]);
          }

        });

        $('.uploads').delegate('#upload-logo', 'change', function() {

          $('.header-logo').css({
            'width' : '',
            'height' : ''
          });

          headersCalc.readLogo(this, function(img) {
            $scope.$apply(function() {
              $scope.params.logo.image = img;
            });

            var dim = headersCalc.getCorrectDim($('.header-logo img'), $('.cr-viewport'));

            $('.header-logo').each(function(i, elem) {

              console.log(this);
              var $this = $(this);

              $this.css({
                'width' : dim.width[i],
                'height' : dim.height[i]
              });

            });

          });

        });

        $('.header-logo').draggable({
          containment: "parent",
          cursor: "move"
        }).resizable({
          containment: "parent",
          aspectRatio: true
        });

        $('.header-address').draggable({
          containment: "parent",
          cursor: "move"
        });

        $('.shadow-sliders-settings').on('click', function (event) {
            $(this).parent().toggleClass('open');
        });
      }

    }]);

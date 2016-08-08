angular.module('designtool')
    .controller('headersCtrl', ['$scope', '$timeout', '$q', 'globals', 'cropTool', function($scope, $timeout, $q, globals, cropTool) {
      'use strict';

      $scope.course = globals.get('info');
      var croppieObj;

      $scope.params = {
        logo: {
          name: 'logo',
          image: 'https://www.coursetrends.com/golf/designs/comal/images/design/logo.png',
          shadow: {
            name: 'logo-filter',
            offsetX: 0,
            offsetY: 1,
            blur: 1,
            spread: 2,
            color: "rgba(0,0,0,1)",
            options: { floor: -10, ceil: 10, showSelectionBarFromValue: 0, disabled: true }
          }
        },
        address: {
          name: 'address',
          text: '2714 Kelly Lane • Pflugerville, TX 78660 • 512-251-9000',
          color: "#fff",
          size: 18,
          weight: 600,
          options: { floor: 10, ceil: 30, showSelectionBar: true },
          shadow: {
            name: 'address-filter',
            offsetX: 0,
            offsetY: 0,
            blur: 1,
            spread: 2,
            color: "rgba(0,0,0,1)",
            options: { floor: 0, ceil: 10, showSelectionBar: true, disabled: false }
          }
        },
        gradient: {
          color1 : '#fcfcfc',
          color2 : '#dbdbdb'
        },
        containers: [
          {
            name: 'golf18',
            width: 136,
            height: 145,
            gradient: true,
            type: 'coupon'
          },
          {
            name: 'coupon',
            width: 200,
            height: 200,
            gradient: true,
            type: 'coupon'
          },
          {
            name: 'email_header',
            width: 600,
            height: 175
          },
          {
            name: 'booking_header',
            width: 785,
            height: 115
          },
          {
            name: 'ecom_header',
            width: 785,
            height: 160,
            store: true
          },
          {
            name: 'survey_header',
            width: 785,
            height: 160
          }
        ]
      };

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

        console.log('gradient');
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
        plot(this.$index, $scope.params.containers[this.$index], $scope.params);
      };

      $scope.download = function() {

        var index = this.$index;
        var container = $scope.params.containers[this.$index];

        plot(index, container, $scope.params).then(function(canvas) {

          canvas.toBlob(function(blob) {
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

          readLogo(this, function(img) {
            $scope.$apply(function() {
              $scope.params.logo.image = img;
            });

            var dim = getCorrectDim($('.header-logo img'), $('.cr-viewport'));

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

      // Service
      function createImage(img, index, container, params) {

        var bgImage = document.getElementsByClassName('cr-image')[index].src;
        var logo = document.querySelector('.header-logo img').src;

        params.logo.width = document.querySelector('#'+container.name+' > .header-logo img').width;
        params.logo.height = document.querySelector('#'+container.name+' > .header-logo img').height;
        plotImage(params.logo, container, index, logo);

        if(container.type !== 'coupon') {

          params.address.width = document.querySelector('#'+container.name+' > .header-address').width;
          params.address.height = document.querySelector('#'+container.name+' > .header-address').height;
          plotImage(params.address, container, index);

        }

        if(container.store) {
          plotStore(container);
        }

        // Check if image exists
        if(container.gradient || !bgImage || bgImage === location.origin+location.pathname) {

          drawGradient(params.gradient, container);

        } else {

          var deferred = $q.defer();
          deferred.resolve(plotBG(img, container));

        }
      }

      function plot(index, container, params) {
        return cropTool.results(croppieObj[index])
          .then(function(img) {
            createImage(img, index, container, params);
            return plotCanvas(container);
        });
      }

      function plotCanvas(container) {

        var logo = document.getElementById('logo-canvas');
        var store = document.getElementById('store-canvas');
        var address = document.getElementById('address-canvas');
        var bg = document.getElementById('bg-canvas');
        var canvas = document.getElementById('canvas');

        canvas.width = container.width;
        canvas.height = container.height;
        var context = canvas.getContext('2d');

        context.drawImage(bg, 0, 0);

        if(container.type !== 'coupon') {
          context.drawImage(address, 0, 0);
        }

        if(container.store) {
          context.drawImage(store, 0, 0);
        }

        context.drawImage(logo, 0, 0);

        return canvas;

      }

      function plotStore(container) {

        var canvas = document.getElementById('store-canvas');
        var position = getOffset($('#'+container.name+'-store'), $('#'+container.name));

        console.log(position);

        position.y = position.y + 62;

        canvas.width = container.width;
        canvas.height = container.height;

        var context = canvas.getContext('2d');

        context.shadowOffsetX = 0;
        context.shadowOffsetY = 1;
        context.shadowBlur = 2;
        context.shadowColor = '#000';

        context.font = "62px Arial";

        context.fillStyle = "#000";
        context.strokeText("Online Store", position.x, position.y);

        context.fillStyle = "#fff";
        context.fillText("Online Store", position.x, position.y);

      }

      function plotImage(element, container, index, img) {

        var type = img ? 'logo' : 'address';
        var canvas = document.getElementById(type+'-canvas');
        var svg = document.getElementById('svg-'+type);
        var svgElem = document.getElementById('svg-'+type+'-image');
        var position;

        svg.setAttribute('width', container.width);
        svg.setAttribute('height', container.height);

        if(typeof img !== 'undefined') {

          position = getOffset($('#'+container.name+'-'+type), $('#'+container.name));
          svgElem.setAttribute('x', position.x);
          svgElem.setAttribute('y', position.y);
          svgElem.setAttribute('width', element.width);
          svgElem.setAttribute('height', element.height);
          svgElem.setAttribute('xlink:href', img);

        } else {

          position = getOffset($('#'+container.name+'-'+type+' > span'), $('#'+container.name));
          svgElem.setAttribute('x', position.x);
          svgElem.setAttribute('y', position.y+(element.size/1.15)); // Adjust Y via 1/3 of font-size

        }

        // Serialize SVG data to string
        var svgData = new XMLSerializer().serializeToString(svg);

        // Encode in base64 and prepend data type attributes
        var encodedData = window.btoa(unescape(encodeURIComponent(svgData)));
        var newSrc = 'data:image/svg+xml;base64,'+encodedData;

        // Alternate Method, (slower)
        // var svgBlob = new Blob([svgData], {type: "image/svg+xml;charset=utf-8"});
        // var newSrc = window.URL.createObjectURL(svgBlob);

        var image = new Image();
        image.src = newSrc;
        image.onload = drawCanvas(image, canvas, container);

      }

      function plotBG(img, container) {

        var canvas = document.getElementById("bg-canvas");

        var base_image = new Image();
        base_image.src = img;
        base_image.onload = drawCanvas(base_image, canvas, container);
      }

      function drawGradient(colors, container) {

        var canvas = document.getElementById("bg-canvas");

        canvas.width = container.width;
        canvas.height = container.height;

        var context = canvas.getContext('2d');
        var gradient = context.createLinearGradient(0,0,0, container.height);

        gradient.addColorStop(0, colors.color1);
        gradient.addColorStop(1, colors.color2);

        context.fillStyle = gradient;
        context.fillRect(0,0, container.width, container.height);

      }

      function drawCanvas(img, canvas, container) {

        canvas.width = container.width;
        canvas.height = container.height;
        var context = canvas.getContext('2d');

        // Draw image within
        context.drawImage(img, 0,0);

      }

      function getCorrectDim($img, $container) {

        var
          newHeight = [],
          newWidth = [];

        for(var i=0; i < $img.length; i++) {

          if($img.eq(i).height() > $container.eq(i).height()) {

            newHeight.push($container.eq(i).height());
            newWidth.push($img.eq(i).width() * newHeight[i] / $img.eq(i).height());

          } else if($img.width() > $container.width()) {

            newWidth.push($container.eq(i).width());
            newHeight.push($img.eq(i).height() * newWidth[i] / $img.eq(i).width());

          } else {

            newWidth.push($img.width());
            newHeight.push($img.height());

          }

        }

        return {
          width: newWidth,
          height: newHeight
        };
      }

      function getOffset($obj, $container) {

        $container = $container.find('.cr-viewport');

        return {
          x : $obj.offset().left - $container.offset().left,
          y : $obj.offset().top - $container.offset().top
        };

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

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
            active: false,
            offsetX: 0,
            offsetY: 1,
            blur: 1,
            spread: 1,
            color: "rgba(0,0,0,1)",
            options: { floor: -10, ceil: 10, showSelectionBarFromValue: 0, disabled: true }
          }
        },
        address: {
          name: 'address',
          text: '2714 Kelly Lane • Pflugerville, TX 78660 • 512-251-9000',
          color: "#fff",
          size: 15,
          weight: 600,
          options: { floor: 10, ceil: 30, showSelectionBar: true },
          shadow: {
            name: 'address-filter',
            active: true,
            offsetX: 0,
            offsetY: 0,
            blur: 1,
            spread: 2,
            color: "rgba(0,0,0,1)",
            options: { floor: 0, ceil: 10, showSelectionBar: true, disabled: true }
          }
        },
        gradient: {
          color1 : '#fcfcfc',
          color2 : '#dbdbdb'
        },
        containers: [
          {
            name: 'g18-coupon',
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
            name: 'email',
            width: 600,
            height: 175
          },
          {
            name: 'g18-header',
            width: 785,
            height: 115
          },
          {
            name: 'ecom',
            width: 785,
            height: 160
          },
          {
            name: 'survey',
            width: 785,
            height: 160
          }
        ]
      };

      // $scope.params.address.text = $scope.course.address1 ? ($scope.course.address1 +' • '+ $scope.course.address2 +' • '+ $scope.course.phone) : $scope.params.address.text;

      // Filter Toggle for SVG
      $scope.svg = {
        logo: {
          filter: ''
        },
        address: {
          filter: ''
        }
      };

      $timeout(function(){
        croppieObj = cropTool.setupTool($scope.params.containers);
        setupJquery();
      }, 1);

      $scope.toggleShadow = function(el) {

        $scope.params[el].shadow.options.disabled = ( $scope.params[el].shadow.options.disabled ? false : true );
        $scope.params[el].shadow.active = ( $scope.params[el].shadow.active ? false : true );

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

      $scope.preview = function(el) {

        var index = this.$index;
        var container = $scope.params.containers[index];

        cropTool.results(croppieObj[index]).then(function(img) {

          var deferred = $q.defer();

          var logo = document.querySelector('.header-logo img').src;
          $scope.params.logo.width = document.querySelector('#'+container.name+' > .header-logo img').width;
          $scope.params.logo.height = document.querySelector('#'+container.name+' > .header-logo img').height;
          plotImage($scope.params.logo, container, index, logo);

          if(container.type !== 'coupon') {

            $scope.params.address.width = document.querySelector('#'+container.name+' > .header-address').width;
            $scope.params.address.height = document.querySelector('#'+container.name+' > .header-address').height;
            plotImage($scope.params.address, container, index);

          }

          if(container.gradient) {

            img = $scope.params.gradient;
            console.log(img);
          }

          deferred.resolve(plotBG(img, container));

          return deferred.promis;

      }).then(function(img) {

          plotCanvas(container);
      });

    };

    // jQuery
    function setupJquery() {

      $('.uploads').delegate('#upload-bg', 'change', function() {

        for(var i=0; i < $scope.params.containers.length; i++) {
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

          $('.header-logo').css({
            'width' : dim.width,
            'height' : dim.height
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

    function plotImage(element, container, index, img) {

      var type = img ? 'logo' : 'address';
      var canvas = document.getElementById(type+'-canvas');
      var svg = document.getElementById('svg-'+type);
      var svgElem = document.getElementById('svg-'+type+'-image');
      var position = getOffset($('#'+container.name+'-'+type), $('#'+container.name));


      svg.setAttribute('width', container.width);
      svg.setAttribute('height', container.height);

      if(typeof img !== 'undefined') {

        svgElem.setAttribute('x', position.x);
        svgElem.setAttribute('y', position.y);
        svgElem.setAttribute('width', element.width);
        svgElem.setAttribute('height', element.height);
        svgElem.setAttribute('xlink:href', img);

      } else {

        svgElem.setAttribute('x', position.x);
        svgElem.setAttribute('y', position.y+(element.size/3)); // Adjust Y via 1/3 of font-size

      }

      var svgData = new XMLSerializer().serializeToString(svg);

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

      if(container.gradient) {

        drawGradient(img, canvas, container);

      } else {

        var base_image = new Image();
        base_image.src = img;
        base_image.onload = drawCanvas(base_image, canvas, container);

      }
    }

    function drawGradient(colors, canvas, container) {

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

    // function plotAddress(textData, containerData, index) {
    //   var canvas = document.getElementById("address-canvas");
    //   var svg = document.getElementById("svg-address");
    //   var svgText = document.getElementById("svg-address-text");
    //
    //   var position = getOffset($('#'+containerData.name+'-address'), $('#'+containerData.name));
    //   console.log(position);
    //
    //   svg.setAttribute('width', containerData.width);
    //   svg.setAttribute('height', containerData.height);
    //
    //   svgText.setAttribute('x', position.x);
    //   svgText.setAttribute('y', position.y+(textData.size/3)); // Adjust Y via 1/3 of font-size
    //
    //   var svgData = new XMLSerializer().serializeToString(svg);
    //
    //   var encodedData = window.btoa(unescape(encodeURIComponent(svgData)));
    //   var newSrc = 'data:image/svg+xml;base64,'+encodedData;
    //
    //   var address_img = new Image();
    //   address_img.src = newSrc;
    //
    //   address_img.onload = drawCanvas(address_img, canvas, containerData);
    // }

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

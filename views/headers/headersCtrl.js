angular.module('designtool')
    .controller('headersCtrl', ['$scope', '$timeout', '$q', 'globals', 'cropTool', function($scope, $timeout, $q, globals, cropTool) {
      'use strict';

      $scope.course = globals.get('info');
      var croppieObj;

      // var crop = $('.email-bg').croppie({
  		// 	viewport: {
  		// 		width: 600,
  		// 		height: 175
  		// 	  },
  		// 	boundary: {
  		// 	  width: 600,
  		// 	  height: 175
  		// 	}
			// });

      $scope.params = {
        logo: {
          name: 'logo',
          image: 'https://www.coursetrends.com/golf/designs/comal/images/design/logo.png',
          shadow: {
            name: 'logo-filter',
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
            name: 'email',
            width: 600,
            height: 175
          },
          // {
          //   name: 'g18-header',
          //   width: 785,
          //   height: 115
          // },
          // {
          //   name: 'ecom',
          //   width: 785,
          //   height: 160
          // },
          // {
          //   name: 'survey',
          //   width: 785,
          //   height: 160
          // }
        ]
      };

      // $scope.params.address.text = course.address1 ? (course.address1 +' • '+ course.address2 +' • '+ course.phone) : $scope.params.address.text;

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

      $timeout(function(){
        croppieObj = cropTool.setupTool($scope.params.containers);
        setupJquery();
      }, 1);

      $scope.toggleShadow = function(el) {

        $scope.params[el].shadow.options.disabled = ( $scope.params[el].shadow.options.disabled ? false : true );

        if($scope.params[el].shadow.options.disabled) {

          $scope.shadowStyle[el] = '';
          $scope.svg[el].filter = '';

        } else {

          $scope.svg[el].filter = $scope.params[el].shadow.name;
          $scope.shadowStyle[el] =  {
            '-webkit-filter': 'url("#'+el+'-filter")',
            'filter': 'url("#'+el+'-filter")'
          };

        }
      };

      $scope.preview = function(el) {

        var index = this.$index;
        var id = $scope.params.containers[index].name;

        cropTool.results(croppieObj[index]).then(function(img) {

          var deferred = $q.defer();

          var logo = document.querySelector('.header-logo img').src;
          $scope.params.logo.width = document.querySelector('#'+id+' > .header-logo img').width;
          $scope.params.logo.height = document.querySelector('#'+id+' > .header-logo img').height;
          $scope.params.address.width = document.querySelector('#'+id+' > .header-address').width;
          $scope.params.address.height = document.querySelector('#'+id+' > .header-address').height;

          plotLogo(logo, $scope.params.logo, $scope.params.containers[index], index);
          plotAddress($scope.params.address, $scope.params.containers[index], index);

          deferred.resolve(plotBG(img, $scope.params.containers[index]));

          return deferred.promis;

      }).then(function(img) {

          plotCanvas($scope.params.containers[index]);
      });

    };

    // jQuery
    function setupJquery() {

      $('.uploads').delegate('.upload-bg', 'change', function() {

        for(var i=0; i < $scope.params.containers.length; i++) {
          cropTool.readFile(this, croppieObj[i]);
        }

      });

      $('.uploads').delegate('.upload-logo', 'change', function() {

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

    function plotLogo(img, logoData, containerData, index) {

      var canvas = document.getElementById("logo-canvas");
      var svg = document.getElementById("svg-logo");
      var svgImage = document.getElementById('svg-logo-image');

      var position = getOffset($('#'+containerData.name+'-logo'), $('#'+containerData.name));

      svg.setAttribute('width', containerData.width);
      svg.setAttribute('height', containerData.height);
      svgImage.setAttribute('xlink:href', img);
      svgImage.setAttribute('width', logoData.width);
      svgImage.setAttribute('height', logoData.height);
      svgImage.setAttribute('x', position.x);
      svgImage.setAttribute('y', position.y);

      var svgData = new XMLSerializer().serializeToString(document.getElementById("svg-logo"));

      var encodedData = window.btoa(unescape(encodeURIComponent(svgData)));
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

        context.drawImage(logo_image, 0, 0);
      };
    }

    function plotAddress(textData, containerData, index) {
      var canvas = document.getElementById("address-canvas");
      var svg = document.getElementById("svg-address");
      var svgText = document.getElementById("svg-address-text");

      var position = getOffset($('#'+containerData.name+'-address'), $('#'+containerData.name));
      console.log(position);

      svg.setAttribute('width', containerData.width);
      svg.setAttribute('height', containerData.height);

      svgText.setAttribute('x', position.x);
      svgText.setAttribute('y', position.y+(textData.size/3)); // Adjust Y via 1/3 of font-size

      var svgData = new XMLSerializer().serializeToString(svg);

      var encodedData = window.btoa(unescape(encodeURIComponent(svgData)));
      var newSrc = 'data:image/svg+xml;base64,'+encodedData;

      var address_img = new Image();
      address_img.src = newSrc;

      address_img.onload = function(){
        canvas.width = containerData.width;
        canvas.height = containerData.height;
        var context = canvas.getContext('2d');

        context.drawImage(address_img, 0, 0);
      };
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

    function getOffset($obj, $container) {

      $container = $container.find('.cr-viewport');

      console.log($container);

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

angular.module('designtool')
    .factory('cssCalc', ['ajaxRequest', function(ajaxRequest) {

        var rgbToHex = function(r, g, b) {
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        };

        var hexToRgb = function(hex) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? parseInt(result[1], 16) + ',' + parseInt(result[2], 16) + ',' + parseInt(result[3], 16) : null;
        };

        var getColors = function() {
            return ajaxRequest.getColorTemplate();
        };

        var readLogo = function(img, startColorThief) {
          if (img.files && img.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {

              startColorThief(e.target.result);
            };

            reader.readAsDataURL(img.files[0]);
          } else {
            return;
          }
        };

        return {
            hexToRgb: hexToRgb,
            rgbToHex: rgbToHex,
            getColors: getColors,
            readLogo: readLogo
        };
    }]);

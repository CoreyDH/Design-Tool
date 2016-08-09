angular.module('designtool')
 .factory('headersCalc', ['$q', 'cropTool', function($q, cropTool){
   'use strict';

   // Service
   function exportHeaders(params, croppieObj, filename) {

     var zip = new JSZip();
     var zipper = zip.folder('images/design');
     var promises = [];

     for(var i=0; i < params.containers.length; i++) {

       promises.push(plot(i, params.containers[i], params, croppieObj[i]).then(function(image) {

         // Convert to base64
         var data = image.canvas.toDataURL("image/jpeg", 1.0);

         // Split declarator and compressed data into an array
         var img64 = data.split(',');

         zipper.file(image.container.name+'.jpg', img64[1], {base64: true});

       }));
     }

     $q.all(promises).then(function(c) {

       var content = zip.generate({type:"blob"});
       saveAs(content, filename+'.zip');

     });

   }

   function plot(index, container, params, croppie) {
     return cropTool.results(croppie)
       .then(function(img) {
         createImage(img, index, container, params);
         return plotCanvas(container);
     });
   }

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

   function plotCanvas(container) {

     var logo = document.getElementById('logo-canvas');
     var store = document.getElementById('store-canvas');
     var address = document.getElementById('address-canvas');
     var bg = document.getElementById('bg-canvas');

     // Create hidden canvas to make saving easier later, and canvas for preview
     var canvas = document.getElementById(container.name+'-canvas');
     var previewCanvas = document.getElementById('canvas');

     canvas.width = container.width;
     canvas.height = container.height;

     previewCanvas.width = container.width;
     previewCanvas.height = container.height;

     var context = canvas.getContext('2d');
     var context2 = previewCanvas.getContext('2d');

     context.drawImage(bg, 0, 0);

     if(container.type !== 'coupon') {
       context.drawImage(address, 0, 0);
     }

     if(container.store) {
       context.drawImage(store, 0, 0);
     }

     context.drawImage(logo, 0, 0);
     context2.drawImage(canvas, 0, 0);

     return {
       canvas: canvas,
       container: container
     };

   }

   function plotStore(container) {

     var canvas = document.getElementById('store-canvas');
     var position = getOffset($('#'+container.name+'-store'), $('#'+container.name));

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

   return {
     plot: plot,
     exportHeaders: exportHeaders,
     readLogo: readLogo,
     getCorrectDim: getCorrectDim,
   };

  }]);

angular.module('designtool')
 .factory('cropTool', ['$q', function($q){

	var results = function(cropper) {

		return cropper.croppie('result', {
			type: 'canvas',
			size: 'viewport',
			format: 'jpeg',
		});

	};

  function countImages() {

    var count = [];
    $('.cr-image').each(function(index) {

      var src = $(this).attr('src');
      if(src) {
        count.push(index);
      }

    });

    return count;
  }

  var exportAll = function(cropper, template, filename) {

    var count = countImages();
    if(count.length < 1) {
      swal('No Images!', 'No images have been added.', 'error');
      return;
    }

    var zip = new JSZip();
    var promises = [];

    for(var i=0;i<count.length;i++) {
     var n = count[i];
     promises.push(results(cropper[n]));
   }

   $q.all(promises).then(function (img) {
    for(var j=0; j < img.length;j++) {
        var newimg = img[j].split(',');
        var c = count[j];
        var zipper = zip.folder(template[c].folder);
        zipper.file(template[c].name+"."+template[c].extension, newimg[1], {base64: true});
    }

    var content = zip.generate({type:"blob"});
    // see FileSaver.js
    saveAs(content, filename+'.zip');
   });


  };

	var setupTool = function(templateArr) {

		var crop = [];
		for(var i=0;i<templateArr.length;i++) {
			crop[i] = $('#'+templateArr[i].name).croppie({
			viewport: {
				width: templateArr[i].width,
				height: templateArr[i].height
			  },
			boundary: {
			  width: templateArr[i].width+70,
			  height: templateArr[i].height+70
			}
			});
		}

		return crop;
	};

	 var readFile = function(input, $uploadCrop) {
		if (input.files && input.files[0]) {
			var reader = new FileReader();

			reader.onload = function (e) {
				$uploadCrop.croppie('bind', {
					url: e.target.result
				});
			};

			reader.readAsDataURL(input.files[0]);
		} else {
		return;
	  }
	};

  var download = function(img, params) {
    var newimg = img.split(',');

    var base_image = new Image();
    base_image.src = img;

    base_image.onload = function(){
      var canvas = document.getElementById("hiddencanvas");

      canvas.width = params.width;
      canvas.height = params.height;
      context = canvas.getContext('2d');

      // Draw image within
      context.drawImage(base_image, 0,0);
      // Save the canvas
      canvas.toBlob(function(blob) {
          saveAs(blob, params.name+"."+params.extension);
        }, "image/jpeg");
    };
  };

  return {
    readFile: readFile,
	  setupTool: setupTool,
	  results: results,
    download: download,
    exportAll: exportAll,
    };
}]);

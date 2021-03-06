angular.module('designtool')
	.controller('headersCtrl', ['$scope', '$timeout', 'globals', 'ajaxRequest', 'cropTool', 'headersCalc', function($scope, $timeout, globals, ajaxRequest, cropTool, headersCalc) {
		'use strict';

		$scope.course = globals.get('info') || {};
		$scope.params = globals.get('headerTemplate');
		var croppieObj;

		// Check if JSON is already loaded
		if (!$scope.params) {
			ajaxRequest.getHeadersTemplate().then(function(response) {

				$scope.params = response.data;

				checkAddress();
				globals.set('headerTemplate', $scope.params);
				setupPage();

			});
		} else {

			checkAddress();
			setupPage();

		}

		function checkAddress() {

			if(typeof $scope.course.address1 != 'undefined') {
				$scope.params.address.text = $scope.course.address1 + ' • ' + $scope.course.address2 + ' • ' + $scope.course.phone;
			}

		}

		function setupPage() {

			// Added delay to allow Angular to load HTML elements
			$timeout(function() {

				croppieObj = cropTool.setupTool($scope.params.containers);
				initJQuery();

			}, 1);
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

		// Added watchGroup for gradient, unable to add ng-style to .cr-boundary due to dynamically generated by the croppie plugin.
		$scope.$watchGroup(['params.gradient.color1', 'params.gradient.color2'], function() {

			$('.cr-boundary').css({
				'background': 'linear-gradient(to bottom,  ' + $scope.params.gradient.color1 + ' 0%,' + $scope.params.gradient.color2 + ' 100%)'
			});

		});


		$scope.toggleShadow = function(el) {

			$scope.params[el].shadow.options.disabled = ($scope.params[el].shadow.options.disabled ? false : true);

			if ($scope.params[el].shadow.options.disabled) {

				$scope.svg[el].filter = '';

			} else {

				$scope.svg[el].filter = $scope.params[el].shadow.name;

			}
		};

		$scope.addressStyle = function() {

			return {
				'color': $scope.params.address.color,
				'font-size': $scope.params.address.size + 'px',
				'font-weight': $scope.params.address.weight
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
					saveAs(blob, container.name + '.jpg');
				}, "image/jpeg");

			});
		};

		$scope.clearImg = function() {

			// Clear the image from the HTML and croppie array
			var image = $('.cr-boundary img')[this.$index];
			image.src = '';

			croppieObj[this.$index].bind({
				url: ''
			});

		};

		$scope.exportAll = function() {

			var filename = $scope.course ? $scope.course.name || $scope.course.template : 'site';
			filename += '-headers';

			headersCalc.exportHeaders($scope.params, croppieObj, filename);

		};

		// jQuery
		function initJQuery() {

			$('.uploads').delegate('#upload-bg', 'change', function() {

				for (var i = 0; i < $scope.params.containers.length; i++) {

					// If it's a coupon, don't load the custom background image
					if ($scope.params.containers[i].type === 'coupon')
						continue;

					cropTool.readFile(this, croppieObj[i]);
				}

			});

			$('.uploads').delegate('#upload-logo', 'change', function() {

				headersCalc.readLogo(this, function(img) {

					$scope.$apply(function() {
						$scope.params.logo.image = img;
					});

					$('.header-logo').each(function(i, elem) {

						var $viewport = $('.cr-viewport');
						var $elem = $(elem);

						// Check if the loaded image is larger than the container
						if ($elem.width() > $viewport.eq(i).width() || $elem.height() > $viewport.eq(i).height()) {

							// Get lower values while keeping aspect ratio
							var dim = headersCalc.getCorrectDim($elem, $viewport.eq(i));

							// Set logo container div at 90% of the container's size
							$elem.css({
								'width': dim.width * 0.9,
								'height': dim.height * 0.9
							});
						}

					});

				});

			});

			// jQuery UI / draggable / resizable
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

			// Prevent sliders from closing on click, only open/close when the settings button is clicked
			$('.shadow-sliders-settings').on('click', function(event) {
				$(this).parent().toggleClass('open');
			});
		}

	}]);

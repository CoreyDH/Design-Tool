angular.module('CacheService', ['ng'])
    .factory('CacheService', ['$cacheFactory', function($cacheFactory) {
    return $cacheFactory('CacheService');
}]);

var designtool = angular.module('designtool',['ui.router','CacheService','colorpicker.module']);

designtool.config(['$stateProvider','$urlRouterProvider','$interpolateProvider', function($stateProvider,$urlRouterProvider,$interpolateProvider) {

  //$urlRouterProvider.otherwise('/course');
	$interpolateProvider.startSymbol('[[');
	$interpolateProvider.endSymbol(']]');

  $stateProvider
    .state('course', {
      url: '/course',
      templateUrl: 'views/course/course.html',
      controller: 'courseCtrl',
    })
    .state('navigation', {
      url: '/navigation',
      templateUrl: 'views/navigation/navigation.html',
      controller: 'navCtrl',
    })
    .state('pages', {
      url: '/pages',
      templateUrl: 'views/pages/pages.html',
	    controller: 'pagesCtrl',
    })
    .state('images', {
      url: '/images',
      templateUrl: 'views/images/images.html',
      controller: 'imgCtrl',
    })
    .state('css', {
      url: '/css',
      templateUrl: 'views/css/css.html',
      controller: 'cssCtrl',
    });


}]);

angular.module('designtool')
    .factory('globals', ['CacheService', function(CacheService) {
        return {
            get: function(key) {
                var data = CacheService.get(key);

                if (data) {
                    return data;
                }

                return;
            },
            set: function(key, value) {
                CacheService.put(key, value);
            },
            clear: function(key) {
                CacheService.put(key, '');
            }
        };
    }])
    .factory('ajaxRequest', ['$http', function($http) {
        'use strict';

        var getTemplate = function(url) {
            return $http.get('templates/' + url);
        };

        var getFilter = function() {
            return $http.get('json/filters.json');
        };

        var getImageTemplate = function() {
            return $http.get('json/images.json');
        };

        var getPagesTemplate = function() {
            return $http.get('json/pages.json');
        };

        var getColorTemplate = function() {
            return $http.get('json/css.json');
        };

        return {
            getTemplate: getTemplate,
            getFilter: getFilter,
            getImageTemplate: getImageTemplate,
            getPagesTemplate: getPagesTemplate,
            getColorTemplate: getColorTemplate,
        };
    }])
    .factory('errorCheck', function() {
        'use strict';
        // Check if template exists, if not, return true
        function falseCheck(item) {
            if (typeof item === 'undefined' || item === undefined || item === '' || item === null || item.length <= 0)
                return true;
            else
                return false;
        }


        var general = function(obj, msg) {

            if (falseCheck(obj)) {
                msg = msg || 'None';
                console.log('Object or variable is not set: ', obj, 'Message: ', msg);
            } else {
                return true;
            }
        };

        var template = function(temp) {

            if (falseCheck(temp)) {
                swal('Missing Template!', 'Please select a template', 'error');
            } else {
                return true;
            }
        };

        var type = function(t) {
            if (falseCheck(t)) {
                swal('Missing Type', 'Please select a type', 'error');
            } else {
                return true;
            }
        };

        return {
            template: template,
            type: type,
            general: general,
        };
    })
    .factory('converter', function() {
        'use strict';
        // format title
        var formatName = function(p) {
            p = p.replace(/\:/g, '')
                .replace(/-/g, ' ')
                .trim()
                .toLowerCase();

            p = ucwords(p);
            return p;
        };

        var genPageName = function(n) {
            n = formatName(n);
            n = formatLink(n);

            return n;
        };
        // format link
        function formatLink(link) {
            link = link.toLowerCase().trim();

            var removespecial = {
                ' & ': '_',
                '\'': '',
                '/': '_',
                ' ': '_',
                '.': '_'
            };

            link = strtr(link, removespecial);

            return link;
        }

        // create link
        var createLink = function(link) {

            if (link.match(/^(https?\:\/\/|www\.)/)) {
                link = link + '" target="_blank';
            } else {
                switch (link) {
                    default: link = '/golf/proto/\'.$location.\'/' + link + '/' + link + '.htm';
                    break;
                    case 'home':
                            case 'index':
                            link = '/golf/proto/\'.$location.\'/index.htm';
                        break;
                    case '/golf/ecom_v2/ecom.php':
                            case '/golf/runtime/logout.php':
                            case '/golf/runtime/logout.php?p=m':
                            case '/golf/blog/index.php':
                            case '#':
                            break;
                }
            }

            return link;
        };

        return {
            genPageName: genPageName,
            createLink: createLink,
            formatName: formatName,
        };
    })
    .factory('exporter', ['ajaxRequest', '$q', function(ajaxRequest, $q) {
        'use strict';

        var CSS = function(template, color, courseObj) {

            var promises = [];
            var files = ['style.css'];
            var url = [template+'/'+template+'-style.handlebars'];
            var zip = new JSZip();
            var folder;

            switch(template) {
              default:
                url.push(template+'/'+template+'-colors.handlebars');
                files.push('colors.css');
                break;
              case 'blanco':
                break;
              case 'comal':
              case 'fairway':
                url.push(template+'/'+template+'-colors.handlebars');
                url.push(template+'/'+template+'-menu.handlebars');
                files.push('colors.css');
                files.push('menu.css');
                break;
            }

            for (var i = 0; i < url.length; i++) {

                promises.push(getHandlebar(url[i], color));

            }

            $q.all(promises).then(function(html) {

                folder = zip.folder('css');

                for(var k=0; k < url.length; k++) {
                  folder.file(files[k], html[k]);
                }

                if (Object.keys(zip.files).length > 0) {
                    var content = zip.generate({
                        type: "blob"
                    });
                    var filename = courseObj.name || courseObj.template;
                    filename += '-css';
                    saveAs(content, filename + '.zip');
                }


            });
        };

        var Pages = function(pages, courseObj) {
            var zip = new JSZip();
            var promises = [];
            var filenames = [];
            var folders = [];
            var content;

            for (var j = 0; j < pages.length; j++) {

                for (var k = 0; k < pages[j].handlebar.length; k++) {

                    filenames.push(pages[j].filename[k]);
                    folders.push(pages[j].folder);

                    if (pages[j].default) {
                        content = courseObj;
                    } else {
                        content = pages[j];
                    }

                    promises.push(getHandlebar(pages[j].handlebar[k], content));

                }
            }

            $q.all(promises).then(function(html) {

                var c = 0;
                var img;

                for (var i = 0; i < filenames.length; i++) {

                    img = zip.folder(folders[i]);
                    img.file(filenames[i], html[i]);

                }

                // Zip Files and force download
                if (Object.keys(zip.files).length > 0) {
                    var content = zip.generate({
                        type: "blob"
                    });
                    var filename = courseObj.name || courseObj.template;
                    filename += '-pages';
                    saveAs(content, filename + '.zip');
                }

            });

        };

        function getHandlebar(url, context) {

            return ajaxRequest.getTemplate(url).then(function(response) {

                var htemplate = Handlebars.compile(response.data);
                return htemplate(context);

            });

        }

        return {
            Pages: Pages,
            CSS: CSS,
        };
    }]);

angular.module('designtool')
  .directive('version', function() {
    return {
      restrict: 'E',
      link: function(s,e,a) {
        e.bind('click', function() {
          $('#version').toggle();
        });
      }
    };
  })
  .directive('menu', function() {
    return {
      restrict: 'E',
	  templateUrl: 'views/menu.html',
    };
  })
  .directive('bgchange', function() {
    return {
      restrict: 'A',
      link: function(s,e,a) {

		var rand = Math.floor((Math.random() * 11) + 1);
		e.css('background-image', "url('backgrounds/"+rand+".jpg')");
      }
    };
  })
  .directive('info', function() {
    return {
      restrict: 'E',
      scope: {
        course: '='
      },
      templateUrl: 'views/info.html',
    };
  })
  .directive('coursetypeOptions', function() {
    return {
      restrict: 'E',
      link: function(s,e,a) {
        s.ctoption = [
          'golf',
          'restaurant',
        ];
      },
      templateUrl: 'views/coursetype-select.html',
    };
  })
  .directive('templateOptions', function() {
    return {
      restrict: 'E',
      link: function(s,e,a) {
        s.toption = [
          'diamond',
          'zilker',
          'topaz',
          'fairway',
          'comal',
          'lapis',
          'blanco',
          'roma'
        ];
      },
      templateUrl: 'views/template-select.html',
    };
  });

angular.module('designtool')
  .controller('courseCtrl', ['$scope', 'cbox','globals', function($scope,cbox,globals) {
  'use strict';

  $scope.course = {};
	$scope.media = globals.get('social');

	if(!$scope.media) {
		$scope.media = [
			{type:'Facebook', icon:'facebook'},
			{type:'Twitter', icon:'twitter'},
			{type:'Instagram', icon:'instagram'},
			{type:'Google+', icon:'google-plus'},
			{type:'YouTube', icon:'youtube'},
			{type:'Yelp', icon:'yelp'},
			{type:'Pinterest', icon:'pinterest'},
			{type:'Tumblr', icon:'tumblr'}
		];
	}

    $scope.example = function() {
      $scope.cboxdata = ''+
      'Blackhawk Golf Club\n'+
      '2714 Kelly Lane\n'+
      'Pflugerville, TX 78660\n'+
      '512-251-9000\n'+
      'WWW.BLACKHAWKGOLF.COM\n'+
	  'coursemail@email.com';

  	  $scope.course.type = 'golf';
  	  $scope.course.template = 'zilker';
    };

    $scope.$watch('cboxdata', function() {
      $scope.course = cbox.parseCbox($scope.cboxdata);

	  //console.log($scope.course);
      globals.set('info',$scope.course);
    });

	$scope.updateSocial = function() {
		$scope.course.social = $scope.media;
		globals.set('info',$scope.course);
		globals.set('social',$scope.media);
	};

  }]);

angular.module('designtool')
  .factory('cbox', function(){
  'use strict';
    /* Format:
      Blackhawk Golf Club, TX
      2714 Kelly Lane
      Pflugerville, TX 78660
      512-251-9000
      WWW.BLACKHAWKGOLF.COM
      */
      var cboxItems;
      var cboxObj = {};

      var parseCbox = function(cboxdata) {
        if(typeof cboxdata !== 'undefined') {
          var cboxArr = cboxdata.split('\n');
          var cboxParams = ['name','address1','address2','phone','proto','email'];

          if(cboxArr.length <= cboxParams.length) {
			for(var i=0;i<cboxArr.length;i++) {

			      cboxArr[i] = cboxArr[i].replace(/^(\s*)|(\s*)$/gm,'');

      			if(i===4) {
      				cboxArr[i] = cboxArr[i].match(/\b(?!https?\:\/\/)(?!www\.)\w+/i).toString().toLowerCase();
      			}
              cboxObj[cboxParams[i]] = cboxArr[i];
            }
          }
        }

        return cboxObj;
      };

      return {
        parseCbox : parseCbox,
      };
  });

angular.module('designtool')
    .controller('navCtrl', ['$scope', 'globals', 'navCalc', 'ajaxRequest', 'errorCheck', function($scope, globals, navCalc, ajaxRequest, errorCheck) {
        'use strict';

        $scope.nav = {};

        // Shared course $scope
        $scope.course = globals.get('info');
        $scope.nav.input = globals.get('nav.input');
        $scope.nav.filters = globals.get('nav.filters');

        var nfilter = globals.get('nfilter');
        if (!nfilter) {
            ajaxRequest.getFilter().then(function(response) {
                nfilter = response.data;
                globals.set('nfilter', nfilter);
            });
        }


        $scope.example = function() {
            $scope.nav.input = '';
            ajaxRequest.getTemplate('example.html').then(function(response) {

                $scope.nav.input = response.data;
            });
        };

        $scope.loadfilters = function() {
            if (errorCheck.template($scope.course.template)) {
                $scope.nav.filters = navCalc.navigation($scope.nav.input, nfilter[$scope.course.type]);
                $scope.setNav();
            } else {
                return;
            }
        };

        $scope.setNav = function() {
            globals.set('nav.input', $scope.nav.input);
        };

        $scope.deleteNavRow = function() {

            var that = this;
            var index = that.$index;
            var par;

            if (typeof that.sfilter === 'undefined') {

                $scope.nav.filters.navigation.splice(index, 1);

            } else if (typeof that.ssfilter === 'undefined') {

                par = that.$parent.$parent;
                par.filter.subtitle.splice(index, 1);

            } else {

                par = that.$parent.$parent;
                par.sfilter.subtitle.splice(index, 1);

            }

            globals.set('nav.filters', $scope.nav.filters);
        };


        $scope.commitNav = function() {

            if (errorCheck.general($scope.nav.filters.navigation, 'navigation.filters.navigation')) {
                var temp = $scope.course.template;

                $scope.nav.filters = navCalc.finalNav($scope.nav.filters, nfilter[$scope.course.type]);
                $scope.sortPages = navCalc.joinPages($scope.nav.filters.pages);

                //console.log($scope.nav.filters);


                ajaxRequest.getTemplate(temp + '/' + temp + '-nav.handlebars').then(function(response) {

                    var template = Handlebars.compile(response.data);
                    var html = template($scope.nav.filters);

                    $scope.nav.output = html;

                    // Add Event Listener jQuery zClip
                    navCalc.zClip();

                    globals.set('nav.output', $scope.nav.output);
                });



                globals.set('nav.filters', $scope.nav.filters);
                globals.set('nav.filters.pages', $scope.nav.filters.pages);
            }

        };

        /* jQuery */
        // Add Event Listener jQuery zClip on Modal Load
        $('#navCode').on('shown.bs.modal', navCalc.zClip);

    }]);

angular.module('designtool')
.factory('navCalc', ['converter', function(converter) {
  'use strict';

  var navigation = function(data, ftype) {
      var anav = (Array.isArray(data) ? data : data.split('\n'));
      var fnav = {
          navigation: []
      };
      var place, nl, ntitle, nlink, npage;
      var pages = [];
      var c = 0;

      for (var i = 0; i < anav.length; i++) {

          // skip blanks
          if (anav[i] === '' || typeof anav[i] === 'undefined') {
              continue;
          }

          var k = 0;

          // Format Name
          ntitle = converter.formatName(anav[i]);

          // Form the object through series of loops/conditions
          /* Final object will look like
          {
            navigation : [
              { title: ntitle,link: nlink},
                { title: ntitle,
                  page: npage,
                  subtitle: [{title: stitle,page: spage},
                    {title: stitle,page: spage},
                    {title: stitle,page: spage, subtitle: [{},{}]}] }
            ]
          }
          */
          if (anav[i].substr(0, 1) != '-') {

              if (pageIsSubPage(anav[i+1])) {
                  k = 1;
                  var sub = [];
                  while (pageIsSubPage(anav[i+k])) {

                      var current_page = anav[i+k];
                      var stitle = converter.formatName(current_page);
                      var spage = converter.genPageName(current_page);
                      spage = strtr(spage, ftype);

                      nl = {
                          title: stitle,
                          page: spage,
                          subtitle: []
                      };
                      if(current_page.substr(0,2) === '--') {

                        sub[sub.length-1].subtitle.push(nl);
                      } else {
                        sub.push(nl);
                      }


                      k++;
                  }

                  nl = {
                      title: ntitle,
                      page: '#',
                      subtitle: sub,
                  };

                  // jump to next index
                  i += k - 1;

              } else {

                  // Create topnav link
                  npage = converter.genPageName(ntitle);
                  npage = strtr(npage, ftype);

                  // Top Nav with no dropdown
                  nl = {
                      title: ntitle,
                      page: npage,
                      subtitle: []
                  };

              }

              fnav.navigation[c] = nl;
          }

          // Array Counter
          c++;
      }

      return fnav;
  };
  function pageIsSubPage(page){
          return typeof page !== 'undefined' && page.substr(0,1) === '-';
	}

  function notADefaultPage(page,ftype) {
    return (ftype.default.indexOf(page) === -1) && !(page.match(/^(https?\:\/\/|www\.)/)) && page !== '#';
	}

  function pushNonDefaultPages(pageObj, pages, ftype){
	 
	pageObj.forEach(function(pageOfpageObj, index){
		
		if(pageOfpageObj.subtitle.length > 0)	 {
			pushNonDefaultPages(pageOfpageObj.subtitle, pages, ftype);
		}
		
		//console.log(pageOfpageObj.page);
		pageOfpageObj.link = converter.createLink(pageOfpageObj.page);

		if (notADefaultPage(pageOfpageObj.page, ftype)) {
			
		  pages.push({
			  title: pageOfpageObj.title,
			  page: pageOfpageObj.page
		  });
		}
		});
	}
	
  var finalNav = function(parr, ftype) {

      if (typeof parr === "object") {
          var pages = [];
          pushNonDefaultPages(parr.navigation, pages, ftype);
		  
		  //console.log('navigation', parr.navigation);
		  //console.log('pages', pages);

          return {
              navigation: parr.navigation,
              pages: pages,
          };
      }

      return;
  };

  var joinPages = function(tobesorted) {
      var page = '';
      if (tobesorted) {

          page = tobesorted.map(function(p) {
              return p.page;
          }).join('\n');
      }
      return page;
  };

  var zClip = function() {

	/* jQuery zClip*/

	// Path to flash file
	var zpath ='bower_components/jquery-zclip/ZeroClipboard.swf';

	$('#copy-navigation').zclip({
	  path: zpath,
	  copy: $('#nav-output').val(),
	  afterCopy:function(){

       }
	 });

	 $('#copy-pages').zclip({
	  path: 'bower_components/jquery-zclip/ZeroClipboard.swf',
	  copy: $('#page-output').val(),
	  afterCopy:function(){

       }
	 });

	 $('.btn-clipboard').hover(function() {
		$(this).addClass('btn-clipboard-hover');
	 },function() {
		$(this).removeClass('btn-clipboard-hover');
	 });

  };

return {
    navigation: navigation,
    finalNav: finalNav,
    joinPages: joinPages,
	zClip: zClip,
};
}]);

angular.module('designtool')
	.controller('pagesCtrl', ['$scope', 'globals', 'pageCalc', 'errorCheck','ajaxRequest', 'exporter', function($scope, globals, pageCalc, errorCheck, ajaxRequest, exporter) {
		'use strict';

		$scope.course = globals.get('info');
		$scope.navPages = globals.get('nav.filters.pages');
		$scope.pagesTemplate = globals.get('pagesTemplate');

		if(!$scope.pagesTemplate) {
			ajaxRequest.getPagesTemplate().then(function(response) {
  			$scope.pagesTemplate = response.data;

				console.log($scope.pagesTemplate);
  			globals.set('pagesTemplate', $scope.pagesTemplate);
		  });
		}

		$scope.setPages = function() {
			$scope.formattedPages = pageCalc.createPageObj($scope.pages.input);
		};

		$scope.mo = function() {
			// Members Only
			var page = this.page.page;
			var mo = page.substring(0,3);
			if(mo === 'mo_' && this.page.membersonly) {
				return;
			} else {
				if(mo === 'mo_') {
					this.page.page = page.slice(3,page.length);
				} else {
					this.page.page = 'mo_'+page;
				}
			}
		};

		$scope.exportNewPages = function() {
			$scope.exportPages($scope.formattedPages);
		};

		$scope.exportNavPages = function() {
			$scope.exportPages($scope.navPages);
		};

		$scope.exportAllPages = function() {

			var allPages = [];

			if($scope.formattedPages){
				allPages = allPages.concat($scope.formattedPages);
			}

			if($scope.navPages){
				allPages = allPages.concat($scope.navPages);
			}

			$scope.exportPages(allPages);
		};

		$scope.exportPages = function(pagesObj) {

			if(errorCheck.template($scope.course.template)) {
				var prepPages = pageCalc.prepareTemplate(pagesObj,$scope.course.template);

				if($scope.course.otherPages) {
					prepPages = prepPages.concat(pageCalc.prepOtherTemplate($scope.pagesTemplate[$scope.course.type].default, $scope.course.template));

					if(typeof $scope.pagesTemplate[$scope.course.type][$scope.course.template] !== 'undefined') {
						prepPages = prepPages.concat(pageCalc.prepOtherTemplate($scope.pagesTemplate[$scope.course.type][$scope.course.template], $scope.course.template));
					}
				}

				exporter.Pages(prepPages, $scope.course);

			}
		};


	}]);

angular.module('designtool')
.factory('pageCalc', ['converter', function(converter) {
  'use strict';

  var createPageObj = function(data) {

    var arr = data.split('\n');
    var pagesObj = [];

    for(var i=0;i < arr.length;i++) {

      if(arr[i] === '') {
        continue;
      }
      var title = converter.formatName(arr[i]);
      var page = converter.genPageName(arr[i]);
      var o = {
        title: title,
        page: page
      };


      pagesObj.push(o);
    }

    return pagesObj;
  };

  var prepareTemplate = function(pages, template) {

    var prep = pages.filter(function(page) {
      return !page.exclude;
    });

    prep = prep.map(function(page) {

        page.filename = [page.page+'_tpl.htm', 'fck_one.htm'];

        page.handlebar = [];
        page.handlebar[0] = template+'-page';

        page.handlebar[0] = (page.membersonly ? 'mo_'+page.handlebar[0] : page.handlebar[0]);
        if(page.hasform) {
            page.handlebar[0] = page.handlebar[0]+'form';
            page.filename.push(page.page+'_form.htm');
            page.handlebar[2] = template+'/'+template+'-form.handlebars';
         }
        page.handlebar[0] = template+'/'+page.handlebar[0]+'.handlebars';
        page.handlebar[1] = template+'/'+template+'-fck.handlebars';
  	    page.folder = page.page;
        page.default = false;


        return page;
    });

    return prep;
  };

  var prepOtherTemplate = function(jsonPageObj, template) {

    if(typeof jsonPageObj === 'undefined') {
      return;
    } else {

      console.log('jsonPageObj', jsonPageObj);
      for(var i=0; i < jsonPageObj.length; i++) {
        for(var j=0; j < jsonPageObj[i].handlebar.length; j++) {
          jsonPageObj[i].handlebar[j] = template+'/'+template+'-'+jsonPageObj[i].handlebar[j]+'.handlebars';
          jsonPageObj[i].default = true;
        }
      }

        return jsonPageObj;
      }

  };

  return {
      createPageObj: createPageObj,
      prepareTemplate: prepareTemplate,
      prepOtherTemplate: prepOtherTemplate,
  };
}]);

angular.module('designtool')
    .controller('imgCtrl', ['$scope', 'globals', 'cropTool', 'ajaxRequest', 'errorCheck', '$timeout', function($scope, globals, cropTool, ajaxRequest, errorCheck, $timeout) {
        $scope.course = globals.get('info');
        $scope.imageTemplate = globals.get('imageTemplate');
        var croppieObj = [];

        // Get Image JSON function
        if (!$scope.imageTemplate) {
            ajaxRequest.getImageTemplate().then(function(response) {
                $scope.imageTemplate = response.data;
                globals.set('imageTemplate', $scope.imageTemplate);

                return $scope.imageTemplate;
            }).then(function(temp) {
                $scope.$watch('course.template', function() {

                    // set delay so template information loads first, then croptool populates
                    $timeout(function() {
                        croppieObj = cropTool.setupTool(temp[$scope.course.template]);
                    }, 1);

                });
            });
        } else {
            $scope.$watch('course.template', function() {

                // set delay so template information loads first, then croptool populates
                $timeout(function() {
                    croppieObj = cropTool.setupTool($scope.imageTemplate[$scope.course.template]);
                }, 1);

            });
        }

        $scope.setZoom = function(width) {

            var boundary = width + 70;
            var zoom;
            if (boundary > 1045) {
                //zoom = 1045/boundary;
                zoom = 0.5;
            }

            return {
                zoom: zoom
            };
        };

        $('.images').delegate('.upload', 'change', function() {
            var index = $(this).attr('id');
            cropTool.readFile(this, croppieObj[index]);
        });

        $scope.preview = function() {
            cropTool.results(croppieObj[this.$index]).then(function(resp) {
                $scope.$apply(function() {
                    $scope.imgpreview = resp;
                });
            });
        };

        $scope.clearimg = function() {
            var image = $('.cr-boundary img')[this.$index];
            console.log(this.$index);

            image.src = '';

            croppieObj[this.$index].bind({
                url: ''
            });

        };

        $scope.download = function() {

            var index = this.$index;

            cropTool.results(croppieObj[index]).then(function(img) {

                var params = $scope.imageTemplate[$scope.course.template][index];
                cropTool.download(img, params);
            });
        };

        $scope.exportAll = function() {

            if (errorCheck.template($scope.course.template)) {
                var filename = $scope.course.name || $scope.course.template;
                filename += '-images';

                cropTool.exportAll(croppieObj, $scope.imageTemplate[$scope.course.template], filename);
            }
        };

    }]);

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
      //var params = $scope.imageTemplate[$scope.course.template][index];

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

angular.module('designtool')
    .controller('cssCtrl', ['$scope', 'globals', 'cssCalc', 'exporter', 'errorCheck', function($scope, globals, cssCalc, exporter, errorCheck) {

        $scope.course = globals.get('info');
        $scope.colors = globals.get('colors');

        if (!$scope.colors) {
            cssCalc.getColors().then(function(response) {

                $scope.colors = response.data;
                globals.set('colors', $scope.colors);
            });
        }

        $scope.$watch('course.template', function() {
          if($scope.course.template) {
            $scope.template = 'templates/' + $scope.course.template + '/' + $scope.course.template + '-css.html';
          } else {
            $scope.template = '';
          }
        });

        $scope.setColor = function() {
            $scope.color[0].rgb = cssCalc.hexToRgb($scope.color[0].hex);
        };

        $('.upload').on('change', function() {

           cssCalc.readLogo(this, function(logo) {

             var sourceImage = document.getElementById("uploadLogo");
             sourceImage.src = logo;

             var colorThief = new ColorThief();
             var rgbPalette = colorThief.getPalette(sourceImage, 5);

            $scope.$apply(function() {
              $scope.thief = rgbPalette.map(function(p){
                return cssCalc.rgbToHex(p[0], p[1], p[2]);
              });

              $scope.templatelogo = logo;
            });
           });
        });


        $scope.exportCSS = function() {
            if (errorCheck.template($scope.course.template)) {

                var colorTemplate = $scope.colors[$scope.course.template];

                for (var colorType in colorTemplate) {

                    if (colorTemplate[colorType].hex)
                        colorTemplate[colorType].rgb = cssCalc.hexToRgb(colorTemplate[colorType].hex);
                }

                exporter.CSS($scope.course.template, colorTemplate, $scope.course);
            }
        };

    }]);

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

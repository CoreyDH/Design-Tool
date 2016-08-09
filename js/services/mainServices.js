angular.module('designtool')
    .factory('globals', function(CacheService) {
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
    })
    .factory('ajaxRequest', function($http) {
        'use strict';

        var getTemplate = function(url) {
            return $http.get('templates/' + url);
        };

        var getFilter = function() {
            return $http.get('json/filters.json');
        };

        var getHeadersTemplate = function() {
            return $http.get('json/headers.json');
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
            getHeadersTemplate: getHeadersTemplate,
        };
    })
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

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
  })
  .directive('ngStddeviation', function() {
    return {
      link: function(s,e,a) {
        a.$observe('ngStddeviation', function(value) {
          e.get(0).setAttribute("stdDeviation", value);
        });
      }
    };
  });

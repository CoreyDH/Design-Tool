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

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

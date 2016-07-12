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

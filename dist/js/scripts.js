angular.module("CacheService",["ng"]).factory("CacheService",["$cacheFactory",function(a){return a("CacheService")}]);var designtool=angular.module("designtool",["ui.router","CacheService","colorpicker.module","rzModule"]);designtool.config(["$stateProvider","$urlRouterProvider","$interpolateProvider",function(a,b,c){c.startSymbol("[["),c.endSymbol("]]"),a.state("course",{url:"/course",templateUrl:"views/course/course.html",controller:"courseCtrl"}).state("navigation",{url:"/navigation",templateUrl:"views/navigation/navigation.html",controller:"navCtrl"}).state("pages",{url:"/pages",templateUrl:"views/pages/pages.html",controller:"pagesCtrl"}).state("images",{url:"/images",templateUrl:"views/images/images.html",controller:"imgCtrl"}).state("css",{url:"/css",templateUrl:"views/css/css.html",controller:"cssCtrl"}).state("headers",{url:"/headers",templateUrl:"views/headers/headers.html",controller:"headersCtrl"})}]),angular.module("designtool").factory("globals",["CacheService",function(a){return{get:function(b){var c=a.get(b);if(c)return c},set:function(b,c){a.put(b,c)},clear:function(b){a.put(b,"")}}}]).factory("ajaxRequest",["$http",function(a){"use strict";var b=function(b){return a.get("templates/"+b)},c=function(){return a.get("json/filters.json")},d=function(){return a.get("json/headers.json")},e=function(){return a.get("json/images.json")},f=function(){return a.get("json/pages.json")},g=function(){return a.get("json/css.json")};return{getTemplate:b,getFilter:c,getImageTemplate:e,getPagesTemplate:f,getColorTemplate:g,getHeadersTemplate:d}}]).factory("errorCheck",function(){"use strict";function a(a){return"undefined"==typeof a||void 0===a||""===a||null===a||a.length<=0}var b=function(b,c){return!a(b)||(c=c||"None",void console.log("Object or variable is not set: ",b,"Message: ",c))},c=function(b){return!a(b)||void swal("Missing Template!","Please select a template","error")},d=function(b){return!a(b)||void swal("Missing Type","Please select a type","error")};return{template:c,type:d,general:b}}).factory("converter",function(){"use strict";function a(a){a=a.toLowerCase().trim();var b={" & ":"_","'":"","/":"_"," ":"_",".":"_"};return a=strtr(a,b)}var b=function(a){return a=a.replace(/\:/g,"").replace(/-/g," ").trim().toLowerCase(),a=ucwords(a)},c=function(c){return c=b(c),c=a(c)},d=function(a){if(a.match(/^(https?\:\/\/|www\.)/))a+='" target="_blank';else switch(a){default:a="/golf/proto/'.$location.'/"+a+"/"+a+".htm";break;case"home":case"index":a="/golf/proto/'.$location.'/index.htm";break;case"/golf/ecom_v2/ecom.php":case"/golf/runtime/logout.php":case"/golf/runtime/logout.php?p=m":case"/golf/blog/index.php":case"#":}return a};return{genPageName:c,createLink:d,formatName:b}}).factory("exporter",["ajaxRequest","$q",function(a,b){"use strict";function c(b,c){return a.getTemplate(b).then(function(a){var b=Handlebars.compile(a.data);return b(c)})}var d=function(a,d,e){var f,g=[],h=["style.css"],i=[a+"/"+a+"-style.handlebars"],j=new JSZip;switch(a){default:i.push(a+"/"+a+"-colors.handlebars"),h.push("colors.css");break;case"blanco":break;case"comal":case"fairway":i.push(a+"/"+a+"-colors.handlebars"),i.push(a+"/"+a+"-menu.handlebars"),h.push("colors.css"),h.push("menu.css")}for(var k=0;k<i.length;k++)g.push(c(i[k],d));b.all(g).then(function(a){f=j.folder("css");for(var b=0;b<i.length;b++)f.file(h[b],a[b]);if(Object.keys(j.files).length>0){var c=j.generate({type:"blob"}),d=e.name||e.template;d+="-css",saveAs(c,d+".zip")}})},e=function(a,d){for(var e,f=new JSZip,g=[],h=[],i=[],j=0;j<a.length;j++)for(var k=0;k<a[j].handlebar.length;k++)h.push(a[j].filename[k]),i.push(a[j].folder),e=a[j]["default"]?d:a[j],g.push(c(a[j].handlebar[k],e));b.all(g).then(function(a){for(var b,c=0;c<h.length;c++)b=f.folder(i[c]),b.file(h[c],a[c]);if(Object.keys(f.files).length>0){var e=f.generate({type:"blob"}),g=d.name||d.template;g+="-pages",saveAs(e,g+".zip")}})};return{Pages:e,CSS:d}}]),angular.module("designtool").directive("version",function(){return{restrict:"E",link:function(a,b,c){b.bind("click",function(){$("#version").toggle()})}}}).directive("menu",function(){return{restrict:"E",templateUrl:"views/menu.html"}}).directive("bgchange",function(){return{restrict:"A",link:function(a,b,c){var d=Math.floor(11*Math.random()+1);b.css("background-image","url('backgrounds/"+d+".jpg')")}}}).directive("info",function(){return{restrict:"E",scope:{course:"="},templateUrl:"views/info.html"}}).directive("coursetypeOptions",function(){return{restrict:"E",link:function(a,b,c){a.ctoption=["golf","restaurant"]},templateUrl:"views/coursetype-select.html"}}).directive("templateOptions",function(){return{restrict:"E",link:function(a,b,c){a.toption=["diamond","zilker","topaz","fairway","comal","lapis","blanco","roma"]},templateUrl:"views/template-select.html"}}).directive("ngStddeviation",function(){return{link:function(a,b,c){c.$observe("ngStddeviation",function(a){b.get(0).setAttribute("stdDeviation",a)})}}}),angular.module("designtool").controller("courseCtrl",["$scope","cbox","globals",function(a,b,c){"use strict";a.course={},a.media=c.get("social"),a.media||(a.media=[{type:"Facebook",icon:"facebook"},{type:"Twitter",icon:"twitter"},{type:"Instagram",icon:"instagram"},{type:"Google+",icon:"google-plus"},{type:"YouTube",icon:"youtube"},{type:"Yelp",icon:"yelp"},{type:"Pinterest",icon:"pinterest"},{type:"Tumblr",icon:"tumblr"}]),a.example=function(){a.cboxdata="Blackhawk Golf Club\n2714 Kelly Lane\nPflugerville, TX 78660\n512-251-9000\nWWW.BLACKHAWKGOLF.COM\ncoursemail@email.com",a.course.type="golf",a.course.template="zilker"},a.$watch("cboxdata",function(){a.course=b.parseCbox(a.cboxdata),c.set("info",a.course)}),a.updateSocial=function(){a.course.social=a.media,c.set("info",a.course),c.set("social",a.media)}}]),angular.module("designtool").factory("cbox",function(){"use strict";var a={},b=function(b){if("undefined"!=typeof b){var c=b.split("\n"),d=["name","address1","address2","phone","proto","email"];if(c.length<=d.length)for(var e=0;e<c.length;e++)c[e]=c[e].replace(/^(\s*)|(\s*)$/gm,""),4===e&&(c[e]=c[e].match(/\b(?!https?\:\/\/)(?!www\.)\w+/i).toString().toLowerCase()),a[d[e]]=c[e]}return a};return{parseCbox:b}}),angular.module("designtool").controller("navCtrl",["$scope","globals","navCalc","ajaxRequest","errorCheck",function(a,b,c,d,e){"use strict";a.nav={},a.course=b.get("info"),a.nav.input=b.get("nav.input"),a.nav.filters=b.get("nav.filters");var f=b.get("nfilter");f||d.getFilter().then(function(a){f=a.data,b.set("nfilter",f)}),a.example=function(){a.nav.input="",d.getTemplate("example.html").then(function(b){a.nav.input=b.data})},a.loadfilters=function(){e.template(a.course.template)&&(a.nav.filters=c.navigation(a.nav.input,f[a.course.type]),a.setNav())},a.setNav=function(){b.set("nav.input",a.nav.input)},a.deleteNavRow=function(){var c,d=this,e=d.$index;"undefined"==typeof d.sfilter?a.nav.filters.navigation.splice(e,1):"undefined"==typeof d.ssfilter?(c=d.$parent.$parent,c.filter.subtitle.splice(e,1)):(c=d.$parent.$parent,c.sfilter.subtitle.splice(e,1)),b.set("nav.filters",a.nav.filters)},a.commitNav=function(){if(e.general(a.nav.filters.navigation,"navigation.filters.navigation")){var g=a.course.template;a.nav.filters=c.finalNav(a.nav.filters,f[a.course.type]),a.sortPages=c.joinPages(a.nav.filters.pages),d.getTemplate(g+"/"+g+"-nav.handlebars").then(function(d){var e=Handlebars.compile(d.data),f=e(a.nav.filters);a.nav.output=f,c.zClip(),b.set("nav.output",a.nav.output)}),b.set("nav.filters",a.nav.filters),b.set("nav.filters.pages",a.nav.filters.pages)}},$("#navCode").on("shown.bs.modal",c.zClip)}]),angular.module("designtool").factory("navCalc",["converter",function(a){"use strict";function b(a){return"undefined"!=typeof a&&"-"===a.substr(0,1)}function c(a,b){return b["default"].indexOf(a)===-1&&!a.match(/^(https?\:\/\/|www\.)/)&&"#"!==a}function d(b,e,f){b.forEach(function(b,g){b.subtitle.length>0&&d(b.subtitle,e,f),b.link=a.createLink(b.page),c(b.page,f)&&e.push({title:b.title,page:b.page})})}var e=function(c,d){for(var e,f,g,h=Array.isArray(c)?c:c.split("\n"),i={navigation:[]},j=0,k=0;k<h.length;k++)if(""!==h[k]&&"undefined"!=typeof h[k]){var l=0;if(f=a.formatName(h[k]),"-"!=h[k].substr(0,1)){if(b(h[k+1])){l=1;for(var m=[];b(h[k+l]);){var n=h[k+l],o=a.formatName(n),p=a.genPageName(n);p=strtr(p,d),e={title:o,page:p,subtitle:[]},"--"===n.substr(0,2)?m[m.length-1].subtitle.push(e):m.push(e),l++}e={title:f,page:"#",subtitle:m},k+=l-1}else g=a.genPageName(f),g=strtr(g,d),e={title:f,page:g,subtitle:[]};i.navigation[j]=e}j++}return i},f=function(a,b){if("object"==typeof a){var c=[];return d(a.navigation,c,b),{navigation:a.navigation,pages:c}}},g=function(a){var b="";return a&&(b=a.map(function(a){return a.page}).join("\n")),b},h=function(){var a="dist/ZeroClipboard.swf";$("#copy-navigation").zclip({path:a,copy:$("#nav-output").val(),afterCopy:function(){}}),$("#copy-pages").zclip({path:"dist/ZeroClipboard.swf",copy:$("#page-output").val(),afterCopy:function(){}}),$(".btn-clipboard").hover(function(){$(this).addClass("btn-clipboard-hover")},function(){$(this).removeClass("btn-clipboard-hover")})};return{navigation:e,finalNav:f,joinPages:g,zClip:h}}]),angular.module("designtool").controller("pagesCtrl",["$scope","globals","pageCalc","errorCheck","ajaxRequest","exporter",function(a,b,c,d,e,f){"use strict";a.course=b.get("info"),a.navPages=b.get("nav.filters.pages"),a.pagesTemplate=b.get("pagesTemplate"),a.pagesTemplate||e.getPagesTemplate().then(function(c){a.pagesTemplate=c.data,console.log(a.pagesTemplate),b.set("pagesTemplate",a.pagesTemplate)}),a.setPages=function(){a.formattedPages=c.createPageObj(a.pages.input)},a.mo=function(){var a=this.page.page,b=a.substring(0,3);"mo_"===b&&this.page.membersonly||("mo_"===b?this.page.page=a.slice(3,a.length):this.page.page="mo_"+a)},a.exportNewPages=function(){a.exportPages(a.formattedPages)},a.exportNavPages=function(){a.exportPages(a.navPages)},a.exportAllPages=function(){var b=[];a.formattedPages&&(b=b.concat(a.formattedPages)),a.navPages&&(b=b.concat(a.navPages)),a.exportPages(b)},a.exportPages=function(b){if(d.template(a.course.template)){var e=c.prepareTemplate(b,a.course.template);a.course.otherPages&&(e=e.concat(c.prepOtherTemplate(a.pagesTemplate[a.course.type]["default"],a.course.template)),"undefined"!=typeof a.pagesTemplate[a.course.type][a.course.template]&&(e=e.concat(c.prepOtherTemplate(a.pagesTemplate[a.course.type][a.course.template],a.course.template)))),f.Pages(e,a.course)}}}]),angular.module("designtool").factory("pageCalc",["converter",function(a){"use strict";var b=function(b){for(var c=b.split("\n"),d=[],e=0;e<c.length;e++)if(""!==c[e]){var f=a.formatName(c[e]),g=a.genPageName(c[e]),h={title:f,page:g};d.push(h)}return d},c=function(a,b){var c=a.filter(function(a){return!a.exclude});return c=c.map(function(a){return a.filename=[a.page+"_tpl.htm","fck_one.htm"],a.handlebar=[],a.handlebar[0]=b+"-page",a.handlebar[0]=a.membersonly?"mo_"+a.handlebar[0]:a.handlebar[0],a.hasform&&(a.handlebar[0]=a.handlebar[0]+"form",a.filename.push(a.page+"_form.htm"),a.handlebar[2]=b+"/"+b+"-form.handlebars"),a.handlebar[0]=b+"/"+a.handlebar[0]+".handlebars",a.handlebar[1]=b+"/"+b+"-fck.handlebars",a.folder=a.page,a["default"]=!1,a})},d=function(a,b){if("undefined"!=typeof a){console.log("jsonPageObj",a);for(var c=0;c<a.length;c++)for(var d=0;d<a[c].handlebar.length;d++)a[c].handlebar[d]=b+"/"+b+"-"+a[c].handlebar[d]+".handlebars",a[c]["default"]=!0;return a}};return{createPageObj:b,prepareTemplate:c,prepOtherTemplate:d}}]),angular.module("designtool").controller("imgCtrl",["$scope","globals","cropTool","ajaxRequest","errorCheck","$timeout",function(a,b,c,d,e,f){a.course=b.get("info"),a.imageTemplate=b.get("imageTemplate");var g=[];a.imageTemplate?a.$watch("course.template",function(){f(function(){g=c.setupTool(a.imageTemplate[a.course.template])},1)}):d.getImageTemplate().then(function(c){return a.imageTemplate=c.data,b.set("imageTemplate",a.imageTemplate),a.imageTemplate}).then(function(b){a.$watch("course.template",function(){f(function(){g=c.setupTool(b[a.course.template])},1)})}),a.setZoom=function(a){var b,c=a+70;return c>1045&&(b=.5),{zoom:b}},$(".images").delegate(".upload","change",function(){var a=$(this).attr("id");c.readFile(this,g[a])}),a.preview=function(){c.results(g[this.$index]).then(function(b){a.$apply(function(){a.imgpreview=b})})},a.clearImg=function(){var a=$(".cr-boundary img")[this.$index];a.src="",g[this.$index].bind({url:""})},a.download=function(){var b=this.$index;c.results(g[b]).then(function(d){var e=a.imageTemplate[a.course.template][b];c.download(d,e)})},a.exportAll=function(){if(e.template(a.course.template)){var b=a.course.name||a.course.template;b+="-images",c.exportAll(g,a.imageTemplate[a.course.template],b)}}}]),angular.module("designtool").factory("cropTool",["$q",function(a){function b(){var a=[];return $(".cr-image").each(function(b){var c=$(this).attr("src");c&&a.push(b)}),a}var c=function(a){return a.croppie("result",{type:"canvas",size:"viewport",format:"jpeg"})},d=function(d,e,f){var g=b();if(g.length<1)return void swal("No Images!","No images have been added.","error");for(var h=new JSZip,i=[],j=0;j<g.length;j++){var k=g[j];i.push(c(d[k]))}a.all(i).then(function(a){for(var b=0;b<a.length;b++){var c=a[b].split(","),d=g[b],i=h.folder(e[d].folder);i.file(e[d].name+"."+e[d].extension,c[1],{base64:!0})}var j=h.generate({type:"blob"});saveAs(j,f+".zip")})},e=function(a){for(var b=[],c=0;c<a.length;c++)b[c]=$("#"+a[c].name).croppie({viewport:{width:a[c].width,height:a[c].height},boundary:{width:a[c].width+25,height:a[c].height+25}});return b},f=function(a,b){if(a.files&&a.files[0]){var c=new FileReader;c.onload=function(a){b.croppie("bind",{url:a.target.result})},c.readAsDataURL(a.files[0])}},g=function(a,b){var c=(a.split(","),new Image);c.src=a,c.onload=function(){var a=document.getElementById("hiddencanvas");a.width=b.width,a.height=b.height,context=a.getContext("2d"),context.drawImage(c,0,0),a.toBlob(function(a){saveAs(a,b.name+"."+b.extension)},"image/jpeg")}};return{readFile:f,setupTool:e,results:c,download:g,exportAll:d}}]),angular.module("designtool").controller("cssCtrl",["$scope","globals","cssCalc","exporter","errorCheck",function(a,b,c,d,e){a.course=b.get("info"),a.colors=b.get("colors"),a.colors||c.getColors().then(function(c){a.colors=c.data,b.set("colors",a.colors)}),a.$watch("course.template",function(){a.course.template?a.template="templates/"+a.course.template+"/"+a.course.template+"-css.html":a.template=""}),a.setColor=function(){a.color[0].rgb=c.hexToRgb(a.color[0].hex)},$(".upload").on("change",function(){c.readLogo(this,function(b){var d=document.getElementById("uploadLogo");d.src=b;var e=new ColorThief,f=e.getPalette(d,5);a.$apply(function(){a.thief=f.map(function(a){return c.rgbToHex(a[0],a[1],a[2])}),a.templatelogo=b})})}),a.exportCSS=function(){if(e.template(a.course.template)){var b=a.colors[a.course.template];for(var f in b)b[f].hex&&(b[f].rgb=c.hexToRgb(b[f].hex));d.CSS(a.course.template,b,a.course)}}}]),angular.module("designtool").factory("cssCalc",["ajaxRequest",function(a){var b=function(a,b,c){return"#"+((1<<24)+(a<<16)+(b<<8)+c).toString(16).slice(1)},c=function(a){var b=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(a);return b?parseInt(b[1],16)+","+parseInt(b[2],16)+","+parseInt(b[3],16):null},d=function(){return a.getColorTemplate()},e=function(a,b){if(a.files&&a.files[0]){var c=new FileReader;c.onload=function(a){b(a.target.result)},c.readAsDataURL(a.files[0])}};return{hexToRgb:c,rgbToHex:b,getColors:d,readLogo:e}}]),angular.module("designtool").controller("headersCtrl",["$scope","$timeout","globals","ajaxRequest","cropTool","headersCalc",function(a,b,c,d,e,f){"use strict";function g(){"undefined"!=typeof a.course.address1&&(a.params.address.text=a.course.address1+" • "+a.course.address2+" • "+a.course.phone)}function h(){b(function(){j=e.setupTool(a.params.containers),i()},1)}function i(){$(".uploads").delegate("#upload-bg","change",function(){for(var b=0;b<a.params.containers.length;b++)"coupon"!==a.params.containers[b].type&&e.readFile(this,j[b])}),$(".uploads").delegate("#upload-logo","change",function(){f.readLogo(this,function(b){a.$apply(function(){a.params.logo.image=b}),$(".header-logo").each(function(a,b){var c=$(".cr-viewport"),d=$(b);if(d.width()>c.eq(a).width()||d.height()>c.eq(a).height()){var e=f.getCorrectDim(d,c.eq(a));d.css({width:.9*e.width,height:.9*e.height})}})})}),$(".header-logo").draggable({containment:"parent",cursor:"move"}).resizable({containment:"parent",aspectRatio:!0}),$(".header-address").draggable({containment:"parent",cursor:"move"}),$(".shadow-sliders-settings").on("click",function(a){$(this).parent().toggleClass("open")})}a.course=c.get("info")||{},a.params=c.get("headerTemplate");var j;a.params?(g(),h()):d.getHeadersTemplate().then(function(b){a.params=b.data,g(),c.set("headerTemplate",a.params),h()}),a.svg={logo:{filter:""},address:{filter:"address-filter"}},a.$watchGroup(["params.gradient.color1","params.gradient.color2"],function(){$(".cr-boundary").css({background:"linear-gradient(to bottom,  "+a.params.gradient.color1+" 0%,"+a.params.gradient.color2+" 100%)"})}),a.toggleShadow=function(b){a.params[b].shadow.options.disabled=!a.params[b].shadow.options.disabled,a.params[b].shadow.options.disabled?a.svg[b].filter="":a.svg[b].filter=a.params[b].shadow.name},a.addressStyle=function(){return{color:a.params.address.color,"font-size":a.params.address.size+"px","font-weight":a.params.address.weight}},a.preview=function(){f.plot(this.$index,a.params.containers[this.$index],a.params,j[this.$index])},a.download=function(){var b=this.$index,c=a.params.containers[this.$index];f.plot(b,c,a.params,j[b]).then(function(a){a.canvas.toBlob(function(a){saveAs(a,c.name+".jpg")},"image/jpeg")})},a.clearImg=function(){var a=$(".cr-boundary img")[this.$index];a.src="",j[this.$index].bind({url:""})},a.exportAll=function(){var b=a.course?a.course.name||a.course.template:"site";b+="-headers",f.exportHeaders(a.params,j,b)}}]),angular.module("designtool").factory("headersCalc",["$q","cropTool",function(a,b){"use strict";function c(b,c,d,i){var j=document.getElementsByClassName("cr-image")[c].src,k=document.querySelector(".header-logo img").src;if(i.logo.width=document.querySelector("#"+d.name+" > .header-logo img").width,i.logo.height=document.querySelector("#"+d.name+" > .header-logo img").height,f(i.logo,d,c,k),"coupon"!==d.type&&(i.address.width=document.querySelector("#"+d.name+" > .header-address").width,i.address.height=document.querySelector("#"+d.name+" > .header-address").height,f(i.address,d,c)),d.store&&e(d),d.gradient||!j||j===location.origin+location.pathname)h(i.gradient,d);else{var l=a.defer();l.resolve(g(b,d))}}function d(a){var b=document.getElementById("logo-canvas"),c=document.getElementById("store-canvas"),d=document.getElementById("address-canvas"),e=document.getElementById("bg-canvas"),f=document.getElementById(a.name+"-canvas"),g=document.getElementById("canvas");f.width=a.width,f.height=a.height,g.width=a.width,g.height=a.height;var h=f.getContext("2d"),i=g.getContext("2d");return h.drawImage(e,0,0),"coupon"!==a.type&&h.drawImage(d,0,0),a.store&&h.drawImage(c,0,0),h.drawImage(b,0,0),i.drawImage(f,0,0),{canvas:f,container:a}}function e(a){var b=document.getElementById("store-canvas"),c=j($("#"+a.name+"-store"),$("#"+a.name));c.y=c.y+62,b.width=a.width,b.height=a.height;var d=b.getContext("2d");d.shadowOffsetX=0,d.shadowOffsetY=1,d.shadowBlur=2,d.shadowColor="#000",d.font="62px Arial",d.fillStyle="#000",d.strokeText("Online Store",c.x,c.y),d.fillStyle="#fff",d.fillText("Online Store",c.x,c.y)}function f(a,b,c,d){var e,f=d?"logo":"address",g=document.getElementById(f+"-canvas"),h=document.getElementById("svg-"+f),k=document.getElementById("svg-"+f+"-image");h.setAttribute("width",b.width),h.setAttribute("height",b.height),"undefined"!=typeof d?(e=j($("#"+b.name+"-"+f),$("#"+b.name)),k.setAttribute("x",e.x),k.setAttribute("y",e.y),k.setAttribute("width",a.width),k.setAttribute("height",a.height),k.setAttribute("xlink:href",d)):(e=j($("#"+b.name+"-"+f+" > span"),$("#"+b.name)),k.setAttribute("x",e.x),k.setAttribute("y",e.y+a.size/1.15));var l=(new XMLSerializer).serializeToString(h),m=window.btoa(unescape(encodeURIComponent(l))),n="data:image/svg+xml;base64,"+m,o=new Image;o.src=n,o.onload=i(o,g,b)}function g(a,b){var c=document.getElementById("bg-canvas"),d=new Image;d.src=a,d.onload=i(d,c,b)}function h(a,b){var c=document.getElementById("bg-canvas");c.width=b.width,c.height=b.height;var d=c.getContext("2d"),e=d.createLinearGradient(0,0,0,b.height);e.addColorStop(0,a.color1),e.addColorStop(1,a.color2),d.fillStyle=e,d.fillRect(0,0,b.width,b.height)}function i(a,b,c){b.width=c.width,b.height=c.height;var d=b.getContext("2d");d.drawImage(a,0,0)}function j(a,b){return b=b.find(".cr-viewport"),{x:a.offset().left-b.offset().left,y:a.offset().top-b.offset().top}}var k=function(b,c,d){for(var e=new JSZip,f=e.folder("images/design"),g=[],h=0;h<b.containers.length;h++)g.push(l(h,b.containers[h],b,c[h]).then(function(a){var b=a.canvas.toDataURL("image/jpeg",1),c=b.split(",");f.file(a.container.name+".jpg",c[1],{base64:!0})}));a.all(g).then(function(a){var b=e.generate({type:"blob"});saveAs(b,d+".zip")})},l=function(a,e,f,g){return b.results(g).then(function(b){return c(b,a,e,f),d(e)})},m=function(a,b){var c,d;return a.height()>b.height()?(c=b.height(),d=a.width()*c/a.height()):a.width()>b.width()?(d=b.width(),c=a.height()*d/a.width()):(d=a.width(),c=a.height()),{width:d,height:c}},n=function(a,b){if(a.files&&a.files[0]){var c=new FileReader;c.onload=function(a){b(a.target.result)},c.readAsDataURL(a.files[0]),c.error&&console.log(c.error)}};return{plot:l,exportHeaders:k,readLogo:n,getCorrectDim:m}}]);
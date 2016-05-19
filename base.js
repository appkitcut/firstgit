

(function($) {
	/**
	 * userAgent判定フラグ
	 *
	 * @date 2011-06-06
	 */
	var ua = navigator.userAgent.toLowerCase();
	$.ua = {
		// IE
		isIE: /msie (\d+)/.test(ua),
		// IE6
		isIE6: /msie (\d+)/.test(ua) && RegExp.$1 == 6,
		// IE7
		isIE7: /msie (\d+)/.test(ua) && RegExp.$1 == 7,
		// IE9未満
		isLtIE9: /msie (\d+)/.test(ua) && RegExp.$1 < 9,
		// iOS
		isIOS: /i(phone|pod|pad)/.test(ua),
		// iPhone、iPod touch
		isIPhone: /i(phone|pod)/.test(ua),
		// iPad
		isIPad: /ipad/.test(ua),
		// Android
		isAndroid: /android/.test(ua),
		// モバイル版Android
		isAndroidMobile: /android(.+)?mobile/.test(ua)
	};



	/**
	 * ロールオーバー
	 *
	 * @date 2012-05-07
	 *
	 * @example $('.rollover').rollover();
	 * @example $('.rollover').rollover({ over: '-ov' });
	 * @example $('.rollover').rollover({ current: '_cr', currentOver: '_cr_ov' });
	 */
	$.fn.rollover = function(options) {
		var defaults = {
			over: '_ov',
			current: null,
			currentOver: null
		};
		var settings = $.extend({}, defaults, options);
		var over = settings.over;
		var current = settings.current;
		var currentOver = settings.currentOver;
		return this.each(function() {
			var src = this.src;
			var ext = /\.(gif|jpe?g|png)(\?.*)?/.exec(src)[0];
			var isCurrent = current && new RegExp(current + ext).test(src);
			if (isCurrent && !currentOver) return;
			var search = (isCurrent && currentOver) ? current + ext : ext;
			var replace = (isCurrent && currentOver) ? currentOver + ext : over + ext;
			var overSrc = src.replace(search, replace);
			new Image().src = overSrc;
			$(this).hover(function() {
				this.src = overSrc;
			}, function() {
				this.src = src;
			});
		});
	};



	/**
	 * フェードロールオーバー
	 *
	 * @date 2012-05-07
	 *
	 * @example $('.faderollover').fadeRollover();
	 * @example $('.faderollover').fadeRollover({ over: '-ov' });
	 * @example $('.faderollover').fadeRollover({ current: '_cr', currentOver: '_cr_ov' });
	 */
	$.fn.fadeRollover = function(options) {
		var defaults = {
			over: '_ov',
			current: null,
			currentOver: null
		};
		var settings = $.extend({}, defaults, options);
		var over = settings.over;
		var current = settings.current;
		var currentOver = settings.currentOver;
		return this.each(function() {
			var src = this.src;
			var ext = /\.(gif|jpe?g|png)(\?.*)?/.exec(src)[0];
			var isCurrent = current && new RegExp(current + ext).test(src);
			if (isCurrent && !currentOver) return;
			var search = (isCurrent && currentOver) ? current + ext : ext;
			var replace = (isCurrent && currentOver) ? currentOver + ext : over + ext;
			var overSrc = src.replace(search, replace);
			new Image().src = overSrc;

			$(this).parent()
			.css('display','block')
			.css('width',$(this).attr('width'))
			.css('height',$(this).attr('height'))
			.css('background','url("'+overSrc+'") no-repeat');

			$(this).parent().hover(function() {
				$(this).find('img').stop().animate({opacity: 0}, 200);
			}, function() {
				if(!cluchUI.transitionFlg) $(this).find('img').stop().animate({opacity: 1}, 200); // ページ遷移トランジションの有無を判別
			});
		});
	};



	/**
	 * スムーズスクロール
	 *
	 * @date 2011-11-08
	 *
	 * @example $.scroller();
	 * @example $.scroller({ hashMarkEnabled: true });
	 * @example $.scroller({ noScrollSelector: '.no-scroll' });
	 * @example $.scroller('#content');
	 * @example $.scroller('#content', { pitch: 20, delay: 5 });
	 */
	$.scroller = function() {
		var self = arguments.callee.prototype;
		if (!arguments[0] || typeof arguments[0] == 'object') {
			self.init.apply(self, arguments);
		} else {
			self.scroll.apply(self, arguments);
		};
	};

	// プロトタイプにメンバを定義
	$.scroller.prototype = {
		// 初期設定
		defaults: {
			hashMarkEnabled: false,
			noScrollSelector: '.noscroll',
			pitch: 10,
			delay: 10
		},

		// 初期化
		init: function(options) {
			var self = this;
			var settings = this.settings = $.extend({}, this.defaults, options);
			$('a[href^="#"]').not(settings.noScrollSelector).each(function() {
				var hash = this.hash || '#';
				$(this).click(function(e) {
					e.preventDefault();
					this.blur();
					self.scroll(hash);
				});
			});
		},

		// スクロールを実行
		scroll: function(id, options) {
			if (this.timer) this.clearScroll();
			var settings = (options) ? $.extend({}, this.defaults, options) : (this.settings) ? this.settings : this.defaults;
			if (!settings.hashMarkEnabled && id == '#') return;
			var self = this;
			var win = window;
			var $win = $(win);
			var d = document;
			var pitch = settings.pitch;
			var delay = settings.delay;
			var scrollLeft = $win.scrollLeft();
			if (($.ua.isIPhone || $.ua.isAndroidMobile) && win.pageYOffset == 0) win.scrollTo(scrollLeft, (($.ua.isAndroidMobile) ? 1 : 0));
			var scrollEnd = (id == '#') ? 0 : $(id + ', a[name="' + id.substr(1) + '"]').eq(0).offset().top;
			var windowHeight = ($.ua.isAndroidMobile) ? Math.ceil(win.innerWidth / win.outerWidth * win.outerHeight) : win.innerHeight || d.documentElement.clientHeight;
			var scrollableEnd = $(d).height() - windowHeight;
			if (scrollableEnd < 0) scrollableEnd = 0;
			if (scrollEnd > scrollableEnd) scrollEnd = scrollableEnd;
			if (scrollEnd < 0) scrollEnd = 0;
			scrollEnd = Math.floor(scrollEnd);
			if ($.ua.isAndroid && scrollEnd == 0) scrollEnd = 1;
			var dir = (scrollEnd > $win.scrollTop()) ? 1 : -1;
			(function() {
				var callee = arguments.callee;
				var prev = self.prev;
				var current = self.current || $win.scrollTop();
				if (current == scrollEnd || typeof prev == 'number' && (dir > 0 && current < prev || dir < 0 && current > prev)) {
					self.clearScroll();
					return;
				};
				var next = current + (scrollEnd - current) / pitch + dir;
				if (dir > 0 && next > scrollEnd || dir < 0 && next < scrollEnd) next = scrollEnd;
				win.scrollTo(scrollLeft, next);
				self.prev = current;
				self.current = next;
				self.timer = setTimeout(function() {
					callee();
				}, delay);
			})();
		},

		// スクロールを解除
		clearScroll: function() {
			clearTimeout(this.timer);
			this.timer = null;
			this.prev = null;
			this.current = null;
		}
	};



	/**
	 * orientationchangeに関するイベントハンドラ登録用メソッド
	 *
	 * @date 2011-05-30
	 *
	 * @example $(window).orientationchange(function() { alert(window.orientation); });
	 * @example $(window).portrait(function() { alert(window.orientation); });
	 * @example $(window).landscape(function() { alert(window.orientation); });
	 */
	var type = ($.ua.isAndroid) ? 'resize' : 'orientationchange';
	$.fn.extend({
		// オリエンテーションチェンジ
		orientationchange: function(fn) {
			return this.bind(type, fn);
		},
		// ポートレイト
		portrait: function(fn) {
			return this.bind(type, function() {
				if (window.orientation === 0) fn();
			});
		},
		// ランドスケープ
		landscape: function(fn) {
			return this.bind(type, function() {
				if (window.orientation !== 0) fn();
			});
		}
	});



	/**
	 * script要素のsrc属性を利用して指定したファイル名のルートにあたるパスを取得
	 *
	 * @date 2011-06-20
	 *
	 * @example $.getScriptRoot('common/js/base.js');
	 */
	$.getScriptRoot = function(filename) {
		var elms = document.getElementsByTagName('script');
		for (var i = elms.length - 1; i >= 0; i--) {
			var src = elms[i].src;
			if (new RegExp('(.*)?' + filename + '([\?].*)?').test(src)) return RegExp.$1;
		};
		return false;
	};



	/**
	 * script要素のsrc属性からオブジェクトに変換したクエリを取得
	 *
	 * @date 2011-06-20
	 *
	 * @example $.getScriptQuery();
	 * @example $.getScriptQuery('common/js/base.js');
	 */
	$.getScriptQuery = function(filename) {
		var elms = document.getElementsByTagName('script');
		if (!filename) {
			return $.getQuery(elms[elms.length - 1].src);
		} else {
			for (var i = elms.length - 1; i >= 0; i--) {
				var src = elms[i].src;
				if (new RegExp(filename).test(src)) return $.getQuery(src);
			};
			return false;
		};
	};



	/**
	 * 文字列からオブジェクトに変換したクエリを取得
	 *
	 * @date 2011-05-30
	 *
	 * @example $.getQuery();
	 * @example $.getQuery('a=foo&b=bar&c=foobar');
	 */
	$.getQuery = function(str) {
		if (!str) str = location.search;
		str = str.replace(/^.*?\?/, '');
		var query = {};
		var temp = str.split(/&/);
		for (var i = 0, l = temp.length; i < l; i++) {
			var param = temp[i].split(/=/);
			query[param[0]] = decodeURIComponent(param[1]);
		};
		return query;
	};

})(jQuery);



// ブラウザの「戻る」クリック時に初期化
window.onunload = function(){};

var cluchUI = ({
	// 初期化
	init: function() {
		var self = this;
		var win = window;

		$('head').append('<style type="text/css">#container{visibility:hidden;}</style>');
		$.siteRoot = $.getScriptRoot('common/js/base.js');
		$(function() {
			$('#container').after('<div id="js_fade"></div>');
			$('.rollover').rollover();
			$('.faderollover').fadeRollover();
			$.scroller();
			self.hoverGnav();
			if ($.ua.isLtIE9) $('body').addClass('ltie8');

			$("a, .trans").click(function() {
				if(self.transitionFlg) return false;
				var href = $(this).attr('href') || $(this).data('link');
				var target = $(this).attr('target');
				if(href.indexOf('#')==0 || href.indexOf('http')==0 || href.indexOf('javascript')==0 ||  target=='_blank' || $(this).hasClass('notrans')) return;
				if(!$.ua.isIOS && !$.ua.isAndroid) {
					self.transitionFlg = true;
					$('#js_fade').fadeIn(300);
				}
				setTimeout(function() {
					location.href = href;
				}, 300);
				return false;
			});
		});
		if ($.ua.isLtIE9) this.html5shiv();
		this.scrollCtrl();

		$(win).load(function() {
			// ページロード時にフェードイン
			if(!$('#detailPage').length) {
				$('#container').css({visibility: 'visible'});
				setTimeout(function(){
					$('#js_fade').fadeOut(500, function() {
						self.transitionFlg = false;
					});
				}, 100);
			}
		});

		$(win).resize(function(){
			self.scrollCtrl();
		});
	},

	// html5shiv
	html5shiv: function() {
		var d = document;
		d.open();
		d.write('<script src="//html5shim.googlecode.com/svn/trunk/html5.js"></script>');
		d.close();
	},

	// スクロール時のコントロール
	eventY: 300, // イベントの発生するscrollTop値
	headerFlg: false,
	pagetopFlg: false,
	headerEasing: 'easeInOutQuart',

	scrollCtrl: function() {
		var self = this;
		var win = window;
		var d = document;
		var windowHeight = $(win).height();
		var documentHeight;
		var breadTop;
		var setScrollNav;
		var yArray;
		var current = -1;

		$(function() {
			if($('body#home').length) { // HOMEページの場合
				var yArray = new Array;
				yArray[5] = $('#aboutus').offset().top;
				yArray[6] = $('#contact').offset().top;
			}

			setScrollNav = function() {
				documentHeight = $(d).height();

				// パンくずリストのY座標を取得
				if($('#breadCrumbs').length) {
					breadTop = $('#breadCrumbs').offset().top;
				}

				// HOMEページのアンカーリンク処理
				if($('body#home').length) {
					for(var i = yArray.length-1; i >= 0; i--) {
						if($(win).scrollTop() >= yArray[i]) {
							self.changeNav(i);
							break;
						} else if($(win).scrollTop() < yArray[5]) {
							self.changeNav(0);
						}
					}
					if($(win).scrollTop() >= ($(d).height() - windowHeight)) {
						self.changeNav(yArray.length-1);
					}
				}

				// スクロール量に応じてミニマムヘッダー、Pagetopの表示を切り替え
				if($(win).scrollTop() >= self.eventY) {
					if(!self.headerFlg) {
						self.showHeader();
					}
					if(!self.pagetopFlg) {
						self.showPagetop();
					}
				} else {
					if(self.headerFlg) {
						self.hideHeader();
					}
					if(self.pagetopFlg) {
						self.hidePagetop();
					}
				}

				// スクロール量に応じてPagetopのbottom値を調整
				if($(win).scrollTop() >= (breadTop - windowHeight)) {
					$('p.pagetop').css({position: 'absolute', bottom: (documentHeight - breadTop) + 19 + 'px'});
				} else {
					$('p.pagetop').css({position: 'fixed', bottom: ''});
				}
			};

			setScrollNav();
			$(win).scroll(setScrollNav);
		});
	},

	// グローバルヘッダー内ナビ マウスオーバー時の処理
	hoverGnav: function() {
		$('#globalHeader li a, #minHeader li a').hover(function() {
			if(!$(this).hasClass('current')) $(this).stop().animate({opacity: 0}, 200);
		}, function() {
			$(this).stop().animate({opacity: 1}, 200);
		});
	},

	// アンカーリンクのcurrent表示を切り替え
	changeNav: function(i) {
		var self = this;
		if(i != self.scrollCtrl.current) {
			self.scrollCtrl.current = i;
			$('#minHeader nav.globalNav li.current').removeClass('current');
			$('#minHeader nav.globalNav li:eq('+i+')').addClass('current');
		}
	},

	// ミニマムヘッダーを表示
	showHeader: function() {
		if(!$('body#works').length) {
			var self = this;
			self.headerFlg = true;
			$('#minHeader').stop().animate({top: 0}, 750, self.headerEasing);
		}
	},

	// ミニマムヘッダーを非表示
	hideHeader: function() {
		var self = this;
		self.headerFlg = false;
		$('#minHeader').stop().animate({top: '-50px'}, 500, self.headerEasing);
	},

	// Pagetopを表示
	showPagetop: function() {
		var self = this;
		self.pagetopFlg = true;
		$('p.pagetop').css({display: 'block'}).stop().animate({opacity: 1}, 500);
	},

	// Pagetopを非表示
	hidePagetop: function() {
		var self = this;
		self.pagetopFlg = false;
		$('p.pagetop').stop().animate({opacity: 0}, 500, function(){
			$(this).css({display: 'none'})
		});
	}

});

cluchUI.init();



// ACCESS ポップアップ
function popupAccess(url) {
	popupCenter(url, 'access', 800, 640, [1, 1, 0, 0, 0, 0, 0]);
}



// Google Analytics
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-9233424-1']);
_gaq.push(['_trackPageview']);

(function() {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();



/***
 * Twitter JS v1.13.1
 * http://code.google.com/p/twitterjs/
 * Copyright (c) 2009 Remy Sharp / MIT License
 * $Date: 2009-08-25 09:45:35 +0100 (Tue, 25 Aug 2009) $
 */

if(typeof renderTwitters!='function')(function(){var j=(function(){var b=navigator.userAgent.toLowerCase();return{webkit:/(webkit|khtml)/.test(b),opera:/opera/.test(b),msie:/msie/.test(b)&&!(/opera/).test(b),mozilla:/mozilla/.test(b)&&!(/(compatible|webkit)/).test(b)}})();var k=0;var n=[];var o=false;
/*var p=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']*/
/**/
var p=['01','02','03','04','05','06','07','08','09','10','11','12'];
/**/
window.ify=function(){var c={'"':'&quot;','&':'&amp;','<':'&lt;','>':'&gt;'};return{"link":function(t){return t.replace(/[a-z]+:\/\/[a-z0-9-_]+\.[a-z0-9-_:~%&\?\/.=]+[^:\.,\)\s*$]/ig,function(m){return'<a href="'+m+'">'+((m.length>25)?m.substr(0,24)+'...':m)+'</a>'})},"at":function(t){return t.replace(/(^|[^\w]+)\@([a-zA-Z0-9_]{1,15})/g,function(m,a,b){return a+'@<a href="http://twitter.com/'+b+'">'+b+'</a>'})},"hash":function(t){return t.replace(/(^|[^\w'"]+)\#([a-zA-Z0-9_]+)/g,function(m,a,b){return a+'#<a href="http://search.twitter.com/search?q=%23'+b+'">'+b+'</a>'})},"clean":function(a){return this.hash(this.at(this.link(a)))}}}();window.renderTwitters=function(a,b){function node(e){return document.createElement(e)}function text(t){return document.createTextNode(t)}var c=document.getElementById(b.twitterTarget);var d=null;var f=node('ul'),li,statusSpan,timeSpan,i,max=a.length>b.count?b.count:a.length;for(i=0;i<max&&a[i];i++){d=getTwitterData(a[i]);if(b.ignoreReplies&&a[i].text.substr(0,1)=='@'){max++;continue}li=node('li');if(b.template){li.innerHTML=b.template.replace(/%([a-z_\-\.]*)%/ig,function(m,l){var r=d[l]+""||"";if(l=='text'&&b.enableLinks)r=ify.clean(r);
/**/
if(b.txtLimit){if(l=='text'&&cntLength(r)>b.txtLimit*2){r=r.substring(0, b.txtLimit+1) + "...";}}
/**/
return r})}else{statusSpan=node('span');statusSpan.className='twitterStatus';timeSpan=node('span');timeSpan.className='twitterTime';statusSpan.innerHTML=a[i].text;if(b.enableLinks==true){statusSpan.innerHTML=ify.clean(statusSpan.innerHTML)}timeSpan.innerHTML=relative_time(a[i].created_at);if(b.prefix){var s=node('span');s.className='twitterPrefix';s.innerHTML=b.prefix.replace(/%(.*?)%/g,function(m,l){return a[i].user[l]});li.appendChild(s);li.appendChild(text(' '))}li.appendChild(statusSpan);li.appendChild(text(' '));li.appendChild(timeSpan)}if(b.newwindow){li.innerHTML=li.innerHTML.replace(/<a href/gi,'<a target="_blank" href')}f.appendChild(li)}if(b.clearContents){while(c.firstChild){c.removeChild(c.firstChild)}}c.appendChild(f);if(typeof b.callback=='function'){b.callback()}};window.getTwitters=function(e,f,g,h){k++;if(typeof f=='object'){h=f;f=h.id;g=h.count}if(!g)g=1;if(h){h.count=g}else{h={}}if(!h.timeout&&typeof h.onTimeout=='function'){h.timeout=10}if(typeof h.clearContents=='undefined'){h.clearContents=true}if(h.withFriends)h.withFriends=false;h['twitterTarget']=e;if(typeof h.enableLinks=='undefined')h.enableLinks=true;window['twitterCallback'+k]=function(a){if(h.timeout){clearTimeout(window['twitterTimeout'+k])}renderTwitters(a,h)};ready((function(c,d){return function(){if(!document.getElementById(c.twitterTarget)){return}var a='https://api.twitter.com/1/statuses/'+(c.withFriends?'friends_timeline':'user_timeline')+'/'+f+'.json?callback=twitterCallback'+d+'&count=20&cb='+Math.random();if(c.timeout){window['twitterTimeout'+d]=setTimeout(function(){if(c.onTimeoutCancel)window['twitterCallback'+d]=function(){};c.onTimeout.call(document.getElementById(c.twitterTarget))},c.timeout*1000)}var b=document.createElement('script');b.setAttribute('src',a);document.getElementsByTagName('head')[0].appendChild(b)}})(h,k))};DOMReady();function getTwitterData(a){var b=a,i;for(i in a.user){b['user_'+i]=a.user[i]}b.time=relative_time(a.created_at);return b}function ready(a){if(!o){n.push(a)}else{a.call()}}function fireReady(){o=true;var a;while(a=n.shift()){a.call()}}function DOMReady(){if(document.addEventListener&&!j.webkit){document.addEventListener("DOMContentLoaded",fireReady,false)}else if(j.msie){document.write("<scr"+"ipt id=__ie_init defer=true src=//:><\/script>");var a=document.getElementById("__ie_init");if(a){a.onreadystatechange=function(){if(this.readyState!="complete")return;this.parentNode.removeChild(this);fireReady.call()}}a=null}else if(j.webkit){var b=setInterval(function(){if(document.readyState=="loaded"||document.readyState=="complete"){clearInterval(b);b=null;fireReady.call()}},10)}}function relative_time(c){
var d=c.split(" "),parsed_date=Date.parse(d[1]+" "+d[2]+", "+d[5]+" "+d[3]),
/**/
relative_to=(arguments.length>1)?arguments[1]:new Date(),date=new Date(parsed_date-(relative_to.getTimezoneOffset()*60*1000)),
/**/
delta=parseInt((relative_to.getTime()-parsed_date)/1000),r='';function formatTime(a){var b=a.getHours(),min=a.getMinutes()+"",ampm='AM';
/*if(b==0){b=12}else if(b==12){ampm='PM'}else if(b>12){b-=12;ampm='PM'}*/
/**/
if(b<10){b='0'+b}
/**/
if(min.length==1){min='0'+min}return b+':'+min/*+' '+ampm*/}function formatDate(a){var b=a.toDateString().split(/ /),mon=p[a.getMonth()],day=a.getDate()+'',dayi=parseInt(day),year=a.getFullYear(),thisyear=(new Date()).getFullYear(),th='th';if((dayi%10)==1&&day.substr(0,1)!='1'){th='st'}else if((dayi%10)==2&&day.substr(0,1)!='1'){th='nd'}else if((dayi%10)==3&&day.substr(0,1)!='1'){th='rd'}if(day.substr(0,1)=='0'){day=day.substr(1)}
/*return mon+' '+day+th+(thisyear!=year?', '+year:'')*/
/**/
if(day<10){day='0'+day}
return year+'.'+mon+'.'+day
/**/
}delta=delta+(relative_to.getTimezoneOffset()*60);if(delta<5){r='less than 5 seconds ago'}else if(delta<30){r='half a minute ago'}else if(delta<60){r='less than a minute ago'}else if(delta<120){r='1 minute ago'}else if(delta<(45*60)){r=(parseInt(delta/60)).toString()+' minutes ago'}else if(delta<(2*90*60)){r='about 1 hour ago'}else if(delta<(24*60*60)){r='about '+(parseInt(delta/3600)).toString()+' hours ago'}else{if(delta<(48*60*60)){r=formatTime(date)+' yesterday'}else{r=formatTime(date)+' '+formatDate(date)}}
/**/
r = formatDate(date) + '&nbsp;&nbsp;&nbsp;<span class="time">' + formatTime(date) + '</span>&nbsp;&nbsp;&nbsp;';
/**/
return r}

/**/
function cntLength(str){
	l = 0;
	for(i=0;i<str.length;i++) {
		var c = str.charCodeAt(i);
		if ( (c >= 0x0 && c < 0x81) || (c == 0xf8f0) || (c >= 0xff61 && c < 0xffa0) || (c >= 0xf8f1 && c < 0xf8f4)){
			l += 1;
		} else {
			l += 2;
		}
	}
	return l;
}
/**/

})();



// Google +1
window.___gcfg = {lang: 'ja'};

(function() {
var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
po.src = 'https://apis.google.com/js/plusone.js';
var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
})();




/*--------------------------------------------------------------------------*
 *
 *  heightLine JavaScript Library beta4
 *
 *  MIT-style license.
 *
 *  2007 Kazuma Nishihata
 *  http://www.webcreativepark.net
 *
 *--------------------------------------------------------------------------*/

new function(){

	function heightLine(){

		this.className="heightLine";
		this.parentClassName="heightLineParent"
		reg = new RegExp(this.className+"-([a-zA-Z0-9-_]+)", "i");
		objCN =new Array();
		var objAll = document.getElementsByTagName ? document.getElementsByTagName("*") : document.all;
		for(var i = 0; i < objAll.length; i++) {
			var eltClass = objAll[i].className.split(/\s+/);
			for(var j = 0; j < eltClass.length; j++) {
				if(eltClass[j] == this.className) {
					if(!objCN["main CN"]) objCN["main CN"] = new Array();
					objCN["main CN"].push(objAll[i]);
					break;
				}else if(eltClass[j] == this.parentClassName){
					if(!objCN["parent CN"]) objCN["parent CN"] = new Array();
					objCN["parent CN"].push(objAll[i]);
					break;
				}else if(eltClass[j].match(reg)){
					var OCN = eltClass[j].match(reg)
					if(!objCN[OCN]) objCN[OCN]=new Array();
					objCN[OCN].push(objAll[i]);
					break;
				}
			}
		}

		//check font size
		var e = document.createElement("div");
		var s = document.createTextNode("S");
		e.appendChild(s);
		e.style.visibility="hidden"
		e.style.position="absolute"
		e.style.top="0"
		document.body.appendChild(e);
		var defHeight = e.offsetHeight;

		changeBoxSize = function(){
			for(var key in objCN){
				if (objCN.hasOwnProperty(key)) {
					//parent type
					if(key == "parent CN"){
						for(var i=0 ; i<objCN[key].length ; i++){
							var max_height=0;
							var CCN = objCN[key][i].childNodes;
							for(var j=0 ; j<CCN.length ; j++){
								if(CCN[j] && CCN[j].nodeType == 1){
									CCN[j].style.height="auto";
									max_height = max_height>CCN[j].offsetHeight?max_height:CCN[j].offsetHeight;
								}
							}
							for(var j=0 ; j<CCN.length ; j++){
								if(CCN[j].style){
									var stylea = CCN[j].currentStyle || document.defaultView.getComputedStyle(CCN[j], '');
									var newheight = max_height;
									if(stylea.paddingTop)newheight -= stylea.paddingTop.replace("px","");
									if(stylea.paddingBottom)newheight -= stylea.paddingBottom.replace("px","");
									if(stylea.borderTopWidth && stylea.borderTopWidth != "medium")newheight-= stylea.borderTopWidth.replace("px","");
									if(stylea.borderBottomWidth && stylea.borderBottomWidth != "medium")newheight-= stylea.borderBottomWidth.replace("px","");
									CCN[j].style.height =newheight+"px";
								}
							}
						}
					}else{
						var max_height=0;
						for(var i=0 ; i<objCN[key].length ; i++){
							objCN[key][i].style.height="auto";
							max_height = max_height>objCN[key][i].offsetHeight?max_height:objCN[key][i].offsetHeight;
						}
						for(var i=0 ; i<objCN[key].length ; i++){
							if(objCN[key][i].style){
								var stylea = objCN[key][i].currentStyle || document.defaultView.getComputedStyle(objCN[key][i], '');
									var newheight = max_height;
									if(stylea.paddingTop)newheight-= stylea.paddingTop.replace("px","");
									if(stylea.paddingBottom)newheight-= stylea.paddingBottom.replace("px","");
									if(stylea.borderTopWidth && stylea.borderTopWidth != "medium")newheight-= stylea.borderTopWidth.replace("px","")
									if(stylea.borderBottomWidth && stylea.borderBottomWidth != "medium")newheight-= stylea.borderBottomWidth.replace("px","");
									objCN[key][i].style.height =newheight+"px";
							}
						}
					}
				}
			}
		}

		checkBoxSize = function(){
			if(defHeight != e.offsetHeight){
				changeBoxSize();
				defHeight= e.offsetHeight;
			}
		}
		changeBoxSize();
		setInterval(checkBoxSize,1000)
		window.onresize=changeBoxSize;

		cluchUI.scrollCtrl(); // スクロールイベント 各位置再設定
	}

	function addEvent(elm,listener,fn){
		try{
			elm.addEventListener(listener,fn,false);
		}catch(e){
			elm.attachEvent("on"+listener,fn);
		}
	}
	addEvent(window,"load",heightLine);
}





/**
 * ポップアップ
 *
 * @date 2012-04-25
 *
 * @example $('.rollover').rollover();
 * @example $('.rollover').rollover({ over: '-ov' });
 * @example $('.rollover').rollover({ current: '_cr', currentOver: '_cr_ov' });
 */


// サブウィンドウ操作用オブジェクト
var _window = {
	minLeft: 0,
	minTop: 0,
	maxLeft: screen.availWidth - 10,
	maxTop: screen.availHeight - 10,
	object: []
};

// OSの種類を取得
var _OS = getOS();

// ブラウザの種類とバージョンを取得
var _browser = getBrowser();


/* サブウィンドウのポップアップ ---------------- */
function popup( loc, name, left, top, width, height, modes ) {
	// modes : [ scrollbars, resizable, status, menubar, toolbar, addressbar, directories ]

	var size = adjustPopupSize( width, height, modes, 0 );

	openWindow( loc, name, left, top, size.width, size.height, modes, 0 );
}

/* サブウィンドウをスクリーンの中央にポップアップ ---------------- */
function popupCenter( loc, name, width, height, modes ) {
	// modes : [ scrollbars, resizable, status, menubar, toolbar, addressbar, directories ]

	var minL = _window.minLeft;
	var minT = _window.minTop;
	var maxL = _window.maxLeft;
	var maxT = _window.maxTop;

	var size = adjustPopupSize( width, height, modes, 0 );

	var left = Math.floor( ( screen.availWidth - size.width ) / 2 );
	var top = Math.floor( ( screen.availHeight - size.height ) / 2 );
	if ( left < minL ) left = minL;
	if ( top < minT ) top = minT;
	if ( left > maxL ) left = maxL;
	if ( top > maxT ) top = maxT;

	var win = openWindow( loc, name, left, top, size.width, size.height, modes, 0 );

}

/* サブウィンドウをフルスクリーンサイズでポップアップ ---------------- */
function popupFullscreen() {
	// arguments : ( loc, name, modes [, term ] )
	// modes : [ scrollbars, resizable, status, menubar, toolbar, addressbar, directories ]

	var bn = _browser.name;
	var bv = _browser.version;

	var args = arguments;
	if ( !args.length ) return false; // in place of undefined for IE

	var loc = args[ 0 ];
	var name = args[ 1 ];
	var modes = args[ 2 ];
	var term = args[ 3 ];

	var size = adjustPopupSize( screen.availWidth, screen.availHeight, modes, 1 );

	var win = openWindow( loc, name, 0, 0, size.width, size.height, modes, term );

}

/* サブウィンドウに設定するサイズを諸条件をもとに調整 ---------------- */
function adjustPopupSize( width, height, modes, fullscreen ) {
	// modes : [ scrollbars, resizable, status, menubar, toolbar, addressbar, directories ]

	var bn = _browser.name;
	var bv = _browser.version;

	var scrollbars = modes[ 0 ];
	var resizable = modes[ 1 ];
	var status = modes[ 2 ];
	var menubar = modes[ 3 ];
	var toolbar = modes[ 4 ];
	var addressbar = modes[ 5 ];
	var directories = modes[ 6 ];

	if ( !fullscreen ) {

		if( _OS == 'Win'){
			if( bn == 'Chrome' || bn == 'Safari' ){ // Chrome, Safari
				width += 17;
			} else if ( scrollbars ) { // IE, Firefox, Opera, and Others  with scrollbar
				width += 17;
			}

		} else if ( _OS == 'Mac') {
			if( bn == 'Chrome' || bn == 'Safari' ){ // Chrome, Safari
				width += 15;
			} else if ( scrollbars ) { // Firefox, Opera, and Others  with scrollbar
				width += 15;
			}
		}

		if ( bn == 'IE' && bv == 6 ) { // IE 6
			if ( menubar ) {
				height -= 20;

				if ( toolbar && addressbar && directories ) { // バグ？調整
					width += 14;
					height += 168;
				}
			}
		}

		if (  _OS == 'Win' && bn == 'Safari') { // Win Safari
			height -= 80;
			if ( status ) height += 21;
			if ( toolbar || addressbar ){
				height += 59;
				if ( menubar ) height += 21;
			}
		}
	}

	var val = [ width, height ];
	val[ 'width' ] = val[ 'w' ] = width;
	val[ 'height' ] = val[ 'h' ] = height;

	return val;
}

/* 与えられた条件をもとにウィンドウを開く処理 ---------------- */
function openWindow( loc, name, left, top, width, height, modes, fullscreen ) {
	// modes : [ scrollbars, resizable, status, menubar, toolbar, addressbar, directories ]

	var scrollbars = ( modes[ 0 ] ) ? 'yes' : 'no';
	var resizable = ( modes[ 1 ] ) ? 'yes' : 'no';
	var status = ( modes[ 2 ] ) ? 'yes' : 'no';
	var menubar = ( modes[ 3 ] ) ? 'yes' : 'no';
	var toolbar = ( modes[ 4 ] ) ? 'yes' : 'no';
	var addressbar = ( modes[ 5 ] ) ? 'yes' : 'no';
	var directories = ( modes[ 6 ] ) ? 'yes' : 'no';

	var props = 'menubar=' + menubar + ',toolbar=' + toolbar + ',location=' + addressbar + ',directories=' + directories +
		',status=' + status + ',scrollbars=' + scrollbars + ',resizable=' + resizable;

	if ( fullscreen && _OS == 'Win' && _browser.name == 'IE' ) props += ',fullscreen=yes';
	else props += ',left=' + left + ',top=' + top + ',width=' + width + ',height=' + height;

	_window.object[ name ] = window.open( loc, name, props );
	_window.object[ name ].focus();

	return _window.object[ name ];
}

/* 関数を呼び出したウィンドウ自身をスクリーンの中央に移動 ---------------- */
function moveToCenter() {
	// arguments : ( [ width, height ] )

	var minL = _window.minLeft;
	var minT = _window.minTop;
	var maxL = _window.maxLeft;
	var maxT = _window.maxTop;

	var args = arguments;

	var win = getWindowSize();
	var w = ( args[ 0 ] ) ? args[ 0 ] : win.width;
	var h = ( args[ 1 ] ) ? args[ 1 ] : win.height;

	var left = Math.floor( ( screen.availWidth - w ) / 2 );
	var top = Math.floor( ( screen.availHeight - h ) / 2 );
	if ( left < minL ) left = minL;
	if ( top < minT ) top = minT;
	if ( left > maxL ) left = maxL;
	if ( top > maxT ) top = maxT;

	try {
		window.moveTo( left, top );
	} catch(e) {}
}

 /* 関数を呼び出したウィンドウ自身を指定されたサイズにリサイズしスクリーンの中央に移動 ---------------- */
function resizeAndMoveToCenter( width, height ) {
	window.resizeTo( width, height );
	moveToCenter( width, height );
}

 /* 関数を呼び出したウィンドウ自身をフルスクリーンサイズにリサイズ ---------------- */
function resizeToFullscreen() {
	try {
		window.moveTo( 0, 0 );
	} catch(e) {}
	window.resizeTo( screen.availWidth, screen.availHeight );
}

/* OSの種類を取得 ---------------- */
function getOS() {
	var av = navigator.appVersion;

	return( ( /Win/.test(av) ) ? 'Win' : ( /Mac/.test(av) ) ? 'Mac' : 'unknown');
}

/* ブラウザの種類とバージョンを取得 ---------------- */
function getBrowser() {
	// arguments : ( [ mode ] )

	var args = arguments;

	var name = 'unknown';
	var ver = 'unknown';
	var ua = navigator.userAgent;
	var ap = 1;

	if ( /Opera\//.test(ua) ) { name = 'Opera'; ua = ua.split( '/' ); } // Opera 6.x+
	else if ( /Opera /.test(ua) ) { name = 'Opera'; ua = ua.split( 'Opera ' ); } // Opera 6.x+
	else if ( /MSIE/.test(ua) ) { name = 'IE'; ua = ua.split( 'MSIE ' ); } // IE
	else if ( /Firefox/.test(ua) ) { name = 'Firefox'; ua = ua.split( '/' ); ap = 3; } // Firefox
	else if ( /Chrome/.test(ua) ) { name = 'Chrome'; ua = ua.split( '/' ); ap = 3; } // Chrome
	else if ( /Safari/.test(ua) ) { name = 'Safari'; ua = ua.split( '/' ); ap = 3; } // Safari

	if ( name != 'unknown' ) {
		if ( !( /\./.test( ua[ ap ]) ) ) {
			ver = ua[ ap ];
		} else {
			var temp = ua[ ap ].split( '.' );
			ver = temp[ 0 ] + '.' + temp[ 1 ].substr( 0, 1 );
		}
	}
	//alert(name + '/' +ver);
	var val = [ name, ver ];
	val[ 'name' ] = name;
	val[ 'version' ] = ver;

	return ( args[ 0 ] == 'name' ) ? name : ( args[ 0 ] == 'ver' ) ? ver : val;
}

/* ウィンドウのサイズを取得 ---------------- */
function getWindowSize() {
	// arguments : ( [ mode ] )

	var args = arguments;

	var w = ( window.innerWidth ) ? window.innerWidth :
		( document.documentElement.clientWidth ) ? document.documentElement.clientWidth :
		( document.body.clientWidth ) ? document.body.clientWidth :
		0;
	var h = ( window.innerHeight ) ? window.innerHeight :
		( document.documentElement.clientHeight ) ? document.documentElement.clientHeight :
		( document.body.clientHeight ) ? document.body.clientHeight :
		0;

	var val = [ w, h ];
	val[ 'width' ] = val[ 'w' ] = w;
	val[ 'height' ] = val[ 'h' ] = h;

	return ( args[ 0 ] == 'w' ) ? w : ( args[ 0 ] == 'h' ) ? h : val;
}

/* 親ウィンドウのロケーションを変更 ---------------- */
function changeOpenerLocation() {
	// arguments : ( loc [, name ] )

	var args = arguments;

	var loc = args[ 0 ];
	var name = ( args[ 1 ] ) ? args[ 1 ] : 'opener';

	var hasOpener = (/safari/.test(navigator.userAgent.toLowerCase())) ? window.opener && window.opener.document : window.opener && !window.opener.closed;

	if (flg) {
		window.opener.focus();
		window.opener.location.href = loc;
	} else {
		var win = window.open( loc, name );
		win.focus();
	}
}

// ==UserScript==
// @name          Glitter
// @namespace     glitter
// @description   Glitter core
// @include       http://mail.google.com/*
// @include       http://*.google.com/mail/*
// @include       https://mail.google.com/*
// @include       https://*.google.com/mail/*
// @author        Lim Chee Aun
// @attribution nleach (http://userscripts.org/scripts/show/56774)
// ==/UserScript==

(function(){
	
	if (!window.Titanium) return;
	
	// insert jQuery
	var jq = document.createElement('script');
	jq.setAttribute('src', 'http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js');
	document.body.appendChild(jq);
	
	jq.onload = function(){
		if (!window.jQuery) return;
		
		jQuery.noConflict();
		
		var $ = jQuery;
		
		// Only run once, by detecting if this iframe exist in the body
		// else this code will run inside every iframe
		var $canvasFrame = $('#canvas_frame');
		if (!$canvasFrame.length){
			delete jQuery;
			return;
		}
		
		var unreadMsgCount = -1;
		var mails = [];
		
		var options = {
			initialDelay: 5,
			pollInterval: 30,
			priority: 5,
			sticky: false,
			trimLength: 150
		};
		
		var selector = {
			inbox: 'a.n0[title^=Inbox]',
			unreadMessage: 'tr.zA.zE',
			sender: 'span.zF',
			subject: '.y6 span:first',
			body: '.y2'
		};
		
		var trimText = function(str){
			return $.trim(str).substring(0, options.trimLength);
		};
		
		var growlMsg = function(){
			var oldCount = unreadMsgCount;
			console.log('oldCount: ' + oldCount);
			
			if (!mails.length) mails = $canvasFrame.contents();
			var matches = mails.find(selector.inbox).text().match(/\((\d*)\)/);
			if (matches) console.log('matches[1]: ' + matches[1]);
			unreadMsgCount = (matches) ? matches[1] : 0;
			console.log('unreadMsgCount: ' + unreadMsgCount);
			
			if (oldCount == -1){
				console.log('oldCount == -1');
				var title = unreadMsgCount + ' new message' + (unreadMsgCount == 0 || unreadMsgCount > 1 ? 's' : '');
				var note = Titanium.Notification.createNotification(window);
				note.setTitle(title);
				note.setMessage('');
				note.show();
			} else if (unreadMsgCount > oldCount){
				console.log('unreadMsgCount > oldCount');
				var currentMsg = 0;
				mails.find(selector.unreadMessage).each(function(){
					if (++currentMsg > (unreadMsgCount - oldCount)) return false;
					var el = $(this);
					var title = 'New Message from ' + trimText(el.find(selector.sender).text());
					var msg = trimText(el.find(selector.subject).text()) + trimText(el.find(selector.body).text());
					var note = Titanium.Notification.createNotification(window);
					note.setTitle(title);
					note.setMessage(msg);
					note.show();
				});
			}
		};
		
		setTimeout(growlMsg, options.initialDelay * 1000);
		setInterval(growlMsg, options.pollInterval * 1000);
	};
	
})();


// difine core global variables
var bpmCore =
{
	
	IS_IE: navigator.userAgent.indexOf('MSIE') >= 0,
	IS_IE6: navigator.userAgent.indexOf('MSIE 6') >= 0,
	IS_IE11: !!navigator.userAgent.match(/Trident\/7\./),
	IS_EDGE: !!navigator.userAgent.match(/Edge\//),
	IS_QUIRKS: navigator.userAgent.indexOf('MSIE') >= 0 && (document.documentMode == null || document.documentMode == 5),
	IS_EM: 'spellcheck' in document.createElement('textarea') && document.documentMode == 8,
	VML_PREFIX: 'v',
	OFFICE_PREFIX: 'o',
  	IS_NS: navigator.userAgent.indexOf('Mozilla/') >= 0 &&
  		navigator.userAgent.indexOf('MSIE') < 0 &&
  		navigator.userAgent.indexOf('Edge/') < 0,
  	IS_OP: navigator.userAgent.indexOf('Opera/') >= 0 ||
  		navigator.userAgent.indexOf('OPR/') >= 0,
  	IS_OT: navigator.userAgent.indexOf('Presto/') >= 0 &&
  		navigator.userAgent.indexOf('Presto/2.4.') < 0 &&
  		navigator.userAgent.indexOf('Presto/2.3.') < 0 &&
  		navigator.userAgent.indexOf('Presto/2.2.') < 0 &&
  		navigator.userAgent.indexOf('Presto/2.1.') < 0 &&
  		navigator.userAgent.indexOf('Presto/2.0.') < 0 &&
  		navigator.userAgent.indexOf('Presto/1.') < 0,
  	IS_SF: navigator.userAgent.indexOf('AppleWebKit/') >= 0 &&
  		navigator.userAgent.indexOf('Chrome/') < 0 &&
  		navigator.userAgent.indexOf('Edge/') < 0,
  	IS_IOS: (navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false),
  	IS_GC: navigator.userAgent.indexOf('Chrome/') >= 0 &&
		navigator.userAgent.indexOf('Edge/') < 0,
  	IS_CHROMEAPP: window.chrome != null && chrome.app != null && chrome.app.runtime != null,
  	IS_FF: navigator.userAgent.indexOf('Firefox/') >= 0,
  	IS_MT: (navigator.userAgent.indexOf('Firefox/') >= 0 &&
		navigator.userAgent.indexOf('Firefox/1.') < 0 &&
  		navigator.userAgent.indexOf('Firefox/2.') < 0) ||
  		(navigator.userAgent.indexOf('Iceweasel/') >= 0 &&
  		navigator.userAgent.indexOf('Iceweasel/1.') < 0 &&
  		navigator.userAgent.indexOf('Iceweasel/2.') < 0) ||
  		(navigator.userAgent.indexOf('SeaMonkey/') >= 0 &&
  		navigator.userAgent.indexOf('SeaMonkey/1.') < 0) ||
  		(navigator.userAgent.indexOf('Iceape/') >= 0 &&
  		navigator.userAgent.indexOf('Iceape/1.') < 0),
  	IS_VML: navigator.appName.toUpperCase() == 'MICROSOFT INTERNET EXPLORER',
  	IS_SVG: navigator.appName.toUpperCase() != 'MICROSOFT INTERNET EXPLORER',
  	NO_FO: !document.createElementNS || document.createElementNS('http://www.w3.org/2000/svg',
  		'foreignObject') != '[object SVGForeignObjectElement]' || navigator.userAgent.indexOf('Opera/') >= 0,
  	IS_WIN: navigator.appVersion.indexOf('Win') > 0,
  	IS_MAC: navigator.appVersion.indexOf('Mac') > 0,
  	IS_CHROMEOS: /\bCrOS\b/.test(navigator.userAgent),
  	IS_TOUCH: 'ontouchstart' in document.documentElement,
  	IS_POINTER: window.PointerEvent != null && !(navigator.appVersion.indexOf('Mac') > 0),
  	IS_LOCAL: document.location.href.indexOf('http://') < 0 &&
  			  document.location.href.indexOf('https://') < 0,
  	defaultBundles: [],

	isBrowserSupported: function()
	{
		return bpmCore.IS_VML || bpmCore.IS_SVG;
	},

	link: function(rel, href, doc, id)
	{
		doc = doc || document;

		if (bpmCore.IS_IE6)
		{
			doc.write('<link rel="' + rel + '" href="' + href + '" charset="UTF-8" type="text/css"/>');
		}
		else
		{	
			var link = doc.createElement('link');
			
			link.setAttribute('rel', rel);
			link.setAttribute('href', href);
			link.setAttribute('charset', 'UTF-8');
			link.setAttribute('type', 'text/css');
			
			if (id)
			{
				link.setAttribute('id', id);
			}
			
			var head = doc.getElementsByTagName('head')[0];
	   		head.appendChild(link);
		}
	},
	
	loadResources: function(fn, lan)
	{
		var pending = bpmCore.defaultBundles.length;
		
		function callback()
		{
			if (--pending == 0)
			{
				fn();
			}
		}
		
		for (var i = 0; i < bpmCore.defaultBundles.length; i++)
		{
			bpmResources.add(bpmCore.defaultBundles[i], lan, callback);
		}
	},
	
	include: function(src)
	{
		document.write('<script src="'+src+'"></script>');
	}
};

if (typeof(bpmLoadResources) == 'undefined')
{
	bpmLoadResources = true;
}

if (typeof(bpmForceIncludes) == 'undefined')
{
	bpmForceIncludes = false;
}

if (typeof(bpmResourceExtension) == 'undefined')
{
	bpmResourceExtension = '.txt';
}

if (typeof(bpmLoadStylesheets) == 'undefined')
{
	bpmLoadStylesheets = true;
}

if (typeof(bpmBasePath) != 'undefined' && bpmBasePath.length > 0)
{
	if (bpmBasePath.substring(bpmBasePath.length - 1) == '/')
	{
		bpmBasePath = bpmBasePath.substring(0, bpmBasePath.length - 1);
	}

	bpmCore.basePath = bpmBasePath;
}
else
{
	bpmCore.basePath = '.';
}

if (typeof(bpmImageBasePath) != 'undefined' && bpmImageBasePath.length > 0)
{
	if (bpmImageBasePath.substring(bpmImageBasePath.length - 1) == '/')
	{
		bpmImageBasePath = bpmImageBasePath.substring(0, bpmImageBasePath.length - 1);
	}

	bpmCore.imageBasePath = bpmImageBasePath;
}
else
{
	bpmCore.imageBasePath = bpmCore.basePath + '/images';	
}

if (typeof(bpmLanguage) != 'undefined' && bpmLanguage != null)
{
	bpmCore.language = bpmLanguage;
}
else
{
	bpmCore.language = (bpmCore.IS_IE) ? navigator.userLanguage : navigator.language;
}

if (typeof(bpmDefaultLanguage) != 'undefined' && bpmDefaultLanguage != null)
{
	bpmCore.defaultLanguage = bpmDefaultLanguage;
}
else
{
	bpmCore.defaultLanguage = 'en';
}

if (bpmLoadStylesheets)
{
	bpmCore.link('stylesheet', 'src/css/common.css');
}

if (typeof(bpmLanguages) != 'undefined' && bpmLanguages != null)
{
	bpmCore.languages = bpmLanguages;
}

if (bpmCore.IS_VML)
{
	if (bpmCore.IS_SVG)
	{
		bpmCore.IS_VML = false;
	}
	else
	{
		if (document.documentMode == 8)
		{
			document.namespaces.add(bpmCore.VML_PREFIX, 'urn:schemas-microsoft-com:vml', '#default#VML');
			document.namespaces.add(bpmCore.OFFICE_PREFIX, 'urn:schemas-microsoft-com:office:office', '#default#VML');
		}
		else
		{
			document.namespaces.add(bpmCore.VML_PREFIX, 'urn:schemas-microsoft-com:vml');
			document.namespaces.add(bpmCore.OFFICE_PREFIX, 'urn:schemas-microsoft-com:office:office');
		}

		if (bpmCore.IS_QUIRKS && document.styleSheets.length >= 30)
		{
			(function()
			{
				var node = document.createElement('style');
				node.type = 'text/css';
				node.styleSheet.cssText = bpmCore.VML_PREFIX + '\\:*{behavior:url(#default#VML)}' +
		        	bpmCore.OFFICE_PREFIX + '\\:*{behavior:url(#default#VML)}';
		        document.getElementsByTagName('head')[0].appendChild(node);
			})();
		}
		else
		{
			document.createStyleSheet().cssText = bpmCore.VML_PREFIX + '\\:*{behavior:url(#default#VML)}' +
		    	bpmCore.OFFICE_PREFIX + '\\:*{behavior:url(#default#VML)}';
		}
	    
	    if (bpmLoadStylesheets)
	    {
	    	bpmCore.link('stylesheet', bpmCore.basePath + '/css/explorer.css');
	    }
	}
}

if (bpmForceIncludes || !(typeof module === 'object' && module.exports != null))
{

	bpmCore.include('src/js/bpmUtil.js');
	bpmCore.include('src/js/bpmShape.js');
	bpmCore.include('src/js/bpmLayout.js');
	bpmCore.include('src/js/bpmModel.js');
	bpmCore.include('src/js/bpmLinked.js');
	bpmCore.include('src/js/bpmView.js');
	bpmCore.include('src/js/bpmHandler.js');
	bpmCore.include('src/js/bpmEditor.js');
	bpmCore.include('src/js/bpmio.js');
}

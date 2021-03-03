

var urlParams = (function(url)
{
	var result = new Object();
	var idx = url.lastIndexOf('?');

	if (idx > 0)
	{
		var params = url.substring(idx + 1).split('&');
		
		for (var i = 0; i < params.length; i++)
		{
			idx = params[i].indexOf('=');
			
			if (idx > 0)
			{
				result[params[i].substring(0, idx)] = params[i].substring(idx + 1);
			}
		}
	}
	
	return result;
})(window.location.href);

// Default resources are included in langText resources
bpmLoadResources = false;

window.urlParams = window.urlParams || {};

window.MAX_REQUEST_SIZE = window.MAX_REQUEST_SIZE  || 10485760;
window.MAX_AREA = window.MAX_AREA || 15000 * 15000;

window.RESOURCES_PATH = window.RESOURCES_PATH || 'resources';
window.RESOURCE_BASE = window.RESOURCE_BASE || window.RESOURCES_PATH + '/langText';
window.IMAGE_PATH = window.IMAGE_PATH || 'styles';
window.STYLE_PATH = window.STYLE_PATH || 'styles';
window.CSS_PATH = window.CSS_PATH || 'styles';

window.bpmBasePath = window.bpmBasePath || 'src';
window.bpmLanguage = window.bpmLanguage || urlParams['lang'];
window.bpmLanguages = window.bpmLanguages || ['en'];

window.SAVE_URL = window.SAVE_URL || 'save.php';
window.OPEN_URL = window.OPEN_URL || 'index.php';
window.OPEN_FORM = window.OPEN_FORM || '/open.html';


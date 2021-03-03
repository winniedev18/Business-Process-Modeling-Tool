
var bpmLog =
{
	consoleName: 'Console',
	TRACE: false,
	DEBUG: true,
	WARN: true,
	buffer: '',
	init: function()
	{
		if (bpmLog.window == null && document.body != null)
		{
			var title = bpmLog.consoleName + ' - bpmGraph ';

			var table = document.createElement('table');
			table.setAttribute('width', '100%');
			table.setAttribute('height', '100%');

			var tbody = document.createElement('tbody');
			var tr = document.createElement('tr');
			var td = document.createElement('td');
			td.style.verticalAlign = 'top';
				
			bpmLog.textarea = document.createElement('textarea');
			bpmLog.textarea.setAttribute('wrap', 'off');
			bpmLog.textarea.setAttribute('readOnly', 'true');
			bpmLog.textarea.style.height = '100%';
			bpmLog.textarea.style.resize = 'none';
			bpmLog.textarea.value = bpmLog.buffer;

			if (bpmCore.IS_NS && document.compatMode != 'BackCompat')
			{
				bpmLog.textarea.style.width = '99%';
			}
			else
			{
				bpmLog.textarea.style.width = '100%';
			}
			
			td.appendChild(bpmLog.textarea);
			tr.appendChild(td);
			tbody.appendChild(tr);

			tr = document.createElement('tr');
			bpmLog.td = document.createElement('td');
			bpmLog.td.style.verticalAlign = 'top';
			bpmLog.td.setAttribute('height', '30px');
			
			tr.appendChild(bpmLog.td);
			tbody.appendChild(tr);
			table.appendChild(tbody);

			bpmLog.addButton('Info', function (evt)
			{
				bpmLog.info();
			});
		
			bpmLog.addButton('DOM', function (evt)
			{
				var content = bpmUtils.getInnerHtml(document.body);
				bpmLog.debug(content);
			});
	
			bpmLog.addButton('Trace', function (evt)
			{
				bpmLog.TRACE = !bpmLog.TRACE;
				
				if (bpmLog.TRACE)
				{
					bpmLog.debug('Tracing enabled');
				}
				else
				{
					bpmLog.debug('Tracing disabled');
				}
			});	

			bpmLog.addButton('Copy', function (evt)
			{
				try
				{
					bpmUtils.copy(bpmLog.textarea.value);
				}
				catch (err)
				{
					bpmUtils.alert(err);
				}
			});			

			bpmLog.addButton('Show', function (evt)
			{
				try
				{
					bpmUtils.popup(bpmLog.textarea.value);
				}
				catch (err)
				{
					bpmUtils.alert(err);
				}
			});	
			
			bpmLog.addButton('Clear', function (evt)
			{
				bpmLog.textarea.value = '';
			});

			var h = 0;
			var w = 0;
			
			if (typeof(window.innerWidth) === 'number')
			{
				h = window.innerHeight;
				w = window.innerWidth;
			}
			else
			{
				h = (document.documentElement.clientHeight || document.body.clientHeight);
				w = document.body.clientWidth;
			}

			bpmLog.window = new bpmWindow(title, table, Math.max(0, w - 320), Math.max(0, h - 210), 300, 160);
			bpmLog.window.setMaximizable(true);
			bpmLog.window.setScrollable(false);
			bpmLog.window.setResizable(true);
			bpmLog.window.setClosable(true);
			bpmLog.window.destroyOnClose = false;
			
			if (((bpmCore.IS_NS || bpmCore.IS_IE) && !bpmCore.IS_GC &&
				!bpmCore.IS_SF && document.compatMode != 'BackCompat') ||
				document.documentMode == 11)
			{
				var elt = bpmLog.window.getElement();
				
				var resizeHandler = function(sender, evt)
				{
					bpmLog.textarea.style.height = Math.max(0, elt.offsetHeight - 70) + 'px';
				}; 
				
				bpmLog.window.addListener(bpmEvent.RESIZE_END, resizeHandler);
				bpmLog.window.addListener(bpmEvent.MAXIMIZE, resizeHandler);
				bpmLog.window.addListener(bpmEvent.NORMALIZE, resizeHandler);

				bpmLog.textarea.style.height = '92px';
			}
		}
	},
	
	info: function()
	{
		bpmLog.writeln(bpmUtils.toString(navigator));
	},

	addButton: function(lab, funct)
	{
		var button = document.createElement('button');
		bpmUtils.write(button, lab);
		bpmEvent.addListener(button, 'click', funct);
		bpmLog.td.appendChild(button);
	},
	
	isVisible: function()
	{
		if (bpmLog.window != null)
		{
			return bpmLog.window.isVisible();
		}
		
		return false;
	},

	show: function()
	{
		bpmLog.setVisible(true);
	},

	setVisible: function(visible)
	{
		if (bpmLog.window == null)
		{
			bpmLog.init();
		}

		if (bpmLog.window != null)
		{
			bpmLog.window.setVisible(visible);
		}
	},

	enter: function(string)
	{
		if (bpmLog.TRACE)
		{
			bpmLog.writeln('Entering '+string);
			
			return new Date().getTime();
		}
	},

	leave: function(string, t0)
	{
		if (bpmLog.TRACE)
		{
			var dt = (t0 != 0) ? ' ('+(new Date().getTime() - t0)+' ms)' : '';
			bpmLog.writeln('Leaving '+string+dt);
		}
	},
	
	debug: function()
	{
		if (bpmLog.DEBUG)
		{
			bpmLog.writeln.apply(this, arguments);
		}
	},
	
	warn: function()
	{
		if (bpmLog.WARN)
		{
			bpmLog.writeln.apply(this, arguments);
		}
	},

	write: function()
	{
		var string = '';
		
		for (var i = 0; i < arguments.length; i++)
		{
			string += arguments[i];
			
			if (i < arguments.length - 1)
			{
				string += ' ';
			}
		}
		
		if (bpmLog.textarea != null)
		{
			bpmLog.textarea.value = bpmLog.textarea.value + string;

			if (navigator.userAgent.indexOf('Presto/2.5') >= 0)
			{
				bpmLog.textarea.style.visibility = 'hidden';
				bpmLog.textarea.style.visibility = 'visible';
			}
			
			bpmLog.textarea.scrollTop = bpmLog.textarea.scrollHeight;
		}
		else
		{
			bpmLog.buffer += string;
		}
	},
	
	writeln: function()
	{
		var string = '';
		
		for (var i = 0; i < arguments.length; i++)
		{
			string += arguments[i];
			
			if (i < arguments.length - 1)
			{
				string += ' ';
			}
		}

		bpmLog.write(string + '\n');
	}
	
};



var bpmObjectIdentity =
{
	FIELD_NAME: 'bpmObjectId',
	counter: 0,

	get: function(obj)
	{
		if (obj != null)
		{
			if (obj[bpmObjectIdentity.FIELD_NAME] == null)
			{
				if (typeof obj === 'object')
				{
					var ctor = bpmUtils.getFunctionName(obj.constructor);
					obj[bpmObjectIdentity.FIELD_NAME] = ctor + '#' + bpmObjectIdentity.counter++;
				}
				else if (typeof obj === 'function')
				{
					obj[bpmObjectIdentity.FIELD_NAME] = 'Function#' + bpmObjectIdentity.counter++;
				}
			}
			
			return obj[bpmObjectIdentity.FIELD_NAME];
		}
		
		return null;
	},

	clear: function(obj)
	{
		if (typeof(obj) === 'object' || typeof obj === 'function')
		{
			delete obj[bpmObjectIdentity.FIELD_NAME];
		}
	}
};


/* Dictionary */
function bpmDictionary()
{
	this.clear();
};

bpmDictionary.prototype.map = null;

bpmDictionary.prototype.clear = function()
{
	this.map = {};
};

bpmDictionary.prototype.get = function(key)
{
	var id = bpmObjectIdentity.get(key);
	
	return this.map[id];
};

bpmDictionary.prototype.put = function(key, value)
{
	var id = bpmObjectIdentity.get(key);
	var previous = this.map[id];
	this.map[id] = value;
	
	return previous;
};

bpmDictionary.prototype.remove = function(key)
{
	var id = bpmObjectIdentity.get(key);
	var previous = this.map[id];
	delete this.map[id];
	
	return previous;
};

bpmDictionary.prototype.getKeys = function()
{
	var result = [];
	
	for (var key in this.map)
	{
		result.push(key);
	}
	
	return result;
};

bpmDictionary.prototype.getValues = function()
{
	var result = [];
	
	for (var key in this.map)
	{
		result.push(this.map[key]);
	}
	
	return result;
};

bpmDictionary.prototype.visit = function(visitor)
{
	for (var key in this.map)
	{
		visitor(key, this.map[key]);
	}
};



var bpmResources =
{
	resources: {},
	extension: bpmResourceExtension,
	resourcesEncoded: false,
	loadDefaultBundle: true,
	loadSpecialBundle: true,

	isLanguageSupported: function(lan)
	{
		if (bpmCore.languages != null)
		{
			return bpmUtils.indexOf(bpmCore.languages, lan) >= 0;
		}
		
		return true;
	},

	getDefaultBundle: function(basename, lan)
	{
		if (bpmResources.loadDefaultBundle || !bpmResources.isLanguageSupported(lan))
		{
			return basename + bpmResources.extension;
		}
		else
		{
			return null;
		}
	},

	getSpecialBundle: function(basename, lan)
	{
		if (bpmCore.languages == null || !this.isLanguageSupported(lan))
		{
			var dash = lan.indexOf('-');
			
			if (dash > 0)
			{
				lan = lan.substring(0, dash);
			}
		}

		if (bpmResources.loadSpecialBundle && bpmResources.isLanguageSupported(lan) && lan != bpmCore.defaultLanguage)
		{
			return basename + '_' + lan + bpmResources.extension;
		}
		else
		{
			return null;
		}
	},

	add: function(basename, lan, callback)
	{
		lan = (lan != null) ? lan : ((bpmCore.language != null) ?
			bpmCore.language.toLowerCase() : bpmConstants.NONE);
		
		if (lan != bpmConstants.NONE)
		{
			var defaultBundle = bpmResources.getDefaultBundle(basename, lan);
			var specialBundle = bpmResources.getSpecialBundle(basename, lan);
			
			var loadSpecialBundle = function()
			{
				if (specialBundle != null)
				{
					if (callback)
					{
						bpmUtils.get(specialBundle, function(req)
						{
							bpmResources.parse(req.getText());
							callback();
						}, function()
						{
							callback();
						});
					}
					else
					{
						try
						{
					   		var req = bpmUtils.load(specialBundle);
					   		
					   		if (req.isReady())
					   		{
					 	   		bpmResources.parse(req.getText());
					   		}
				   		}
				   		catch (e)
				   		{
				   			// ignore
					   	}
					}
				}
				else if (callback != null)
				{
					callback();
				}
			}
			
			if (defaultBundle != null)
			{
				if (callback)
				{
					bpmUtils.get(defaultBundle, function(req)
					{
						bpmResources.parse(req.getText());
						loadSpecialBundle();
					}, function()
					{
						loadSpecialBundle();
					});
				}
				else
				{
					try
					{
				   		var req = bpmUtils.load(defaultBundle);
				   		
				   		if (req.isReady())
				   		{
				 	   		bpmResources.parse(req.getText());
				   		}
				   		
				   		loadSpecialBundle();
				  	}
				  	catch (e)
				  	{
				  		// ignore
				  	}
				}
			}
			else
			{
				loadSpecialBundle();
			}
		}
	},

	parse: function(text, sp='\n')
	{
		if (text != null)
		{
			var lines = text.split(sp);
			
			for (var i = 0; i < lines.length; i++)
			{
				if (lines[i].charAt(0) != '#')
				{
					var index = lines[i].indexOf('=');
					
					if (index > 0)
					{
						var key = lines[i].substring(0, index);
						var idx = lines[i].length;
						
						if (lines[i].charCodeAt(idx - 1) == 13)
						{
							idx--;
						}
						
						var value = lines[i].substring(index + 1, idx);
						
						if (this.resourcesEncoded)
						{
							value = value.replace(/\\(?=u[a-fA-F\d]{4})/g,"%");
							bpmResources.resources[key] = unescape(value);
						}
						else
						{
							bpmResources.resources[key] = value;
						}
					}
				}
			}
		}
	},

	get: function(key, params, defaultValue)
	{
		var value = bpmResources.resources[key];
		
		if (value == null)
		{
			value = defaultValue;
		}
		
		if (value != null && params != null)
		{
			value = bpmResources.replacePlaceholders(value, params);
		}
		
		return value;
	},

	replacePlaceholders: function(value, params)
	{
		var result = [];
		var index = null;
		
		for (var i = 0; i < value.length; i++)
		{
			var c = value.charAt(i);

			if (c == '{')
			{
				index = '';
			}
			else if (index != null && 	c == '}')
			{
				index = parseInt(index)-1;
				
				if (index >= 0 && index < params.length)
				{
					result.push(params[index]);
				}
				
				index = null;
			}
			else if (index != null)
			{
				index += c;
			}
			else
			{
				result.push(c);
			}
		}
		
		return result.join('');
	},

	loadResources: function(callback)
	{
		bpmResources.add(bpmCore.basePath+'/resources/editor', null, function()
		{
			bpmResources.add(bpmCore.basePath+'/resources/graph', null, callback);
		});
	}

};


/* Point */
function bpmPoint(x, y)
{
	this.x = (x != null) ? x : 0;
	this.y = (y != null) ? y : 0;
};

bpmPoint.prototype.x = null;

bpmPoint.prototype.y = null;

bpmPoint.prototype.equals = function(obj)
{
	return obj != null && obj.x == this.x && obj.y == this.y;
};

bpmPoint.prototype.clone = function()
{
	return bpmUtils.clone(this);
};



/* Rectangle */
function bpmRectangle(x, y, width, height)
{
	bpmPoint.call(this, x, y);

	this.width = (width != null) ? width : 0;
	this.height = (height != null) ? height : 0;
};

bpmRectangle.prototype = new bpmPoint();
bpmRectangle.prototype.constructor = bpmRectangle;
bpmRectangle.prototype.width = null;
bpmRectangle.prototype.height = null;

bpmRectangle.prototype.setRect = function(x, y, w, h)
{
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
};

bpmRectangle.prototype.getCenterX = function ()
{
	return this.x + this.width/2;
};

bpmRectangle.prototype.getCenterY = function ()
{
	return this.y + this.height/2;
};

bpmRectangle.prototype.add = function(rect)
{
	if (rect != null)
	{
		var minX = Math.min(this.x, rect.x);
		var minY = Math.min(this.y, rect.y);
		var maxX = Math.max(this.x + this.width, rect.x + rect.width);
		var maxY = Math.max(this.y + this.height, rect.y + rect.height);
		
		this.x = minX;
		this.y = minY;
		this.width = maxX - minX;
		this.height = maxY - minY;
	}
};

bpmRectangle.prototype.intersect = function(rect)
{
	if (rect != null)
	{
		var r1 = this.x + this.width;
		var r2 = rect.x + rect.width;
		
		var b1 = this.y + this.height;
		var b2 = rect.y + rect.height;
		
		this.x = Math.max(this.x, rect.x);
		this.y = Math.max(this.y, rect.y);
		this.width = Math.min(r1, r2) - this.x;
		this.height = Math.min(b1, b2) - this.y;
	}
};

bpmRectangle.prototype.grow = function(amount)
{
	this.x -= amount;
	this.y -= amount;
	this.width += 2 * amount;
	this.height += 2 * amount;
};

bpmRectangle.prototype.getPoint = function()
{
	return new bpmPoint(this.x, this.y);
};

bpmRectangle.prototype.rotate90 = function()
{
	var t = (this.width - this.height) / 2;
	this.x += t;
	this.y -= t;
	var tmp = this.width;
	this.width = this.height;
	this.height = tmp;
};

bpmRectangle.prototype.equals = function(obj)
{
	return obj != null && obj.x == this.x && obj.y == this.y &&
		obj.width == this.width && obj.height == this.height;
};

bpmRectangle.fromRectangle = function(rect)
{
	return new bpmRectangle(rect.x, rect.y, rect.width, rect.height);
};



var bpmEffects =
{
	animateChanges: function(graph, changes, done)
	{
		var maxStep = 10;
		var step = 0;

		var animate = function() 
		{
			var isRequired = false;
			
			for (var i = 0; i < changes.length; i++)
			{
				var change = changes[i];
				
				if (change instanceof bpmGeometryChange ||
					change instanceof bpmTerminalChange ||
					change instanceof bpmValueChange ||
					change instanceof bpmChildChange ||
					change instanceof bpmStyleChange)
				{
					var state = graph.getView().getState(change.cell || change.child, false);
					
					if (state != null)
					{
						isRequired = true;
					
						if (change.constructor != bpmGeometryChange || graph.model.isEdge(change.cell))
						{
							bpmUtils.setOpacity(state.shape.node, 100 * step / maxStep);
						}
						else
						{
							var scale = graph.getView().scale;					

							var dx = (change.geometry.x - change.previous.x) * scale;
							var dy = (change.geometry.y - change.previous.y) * scale;
							
							var sx = (change.geometry.width - change.previous.width) * scale;
							var sy = (change.geometry.height - change.previous.height) * scale;
							
							if (step == 0)
							{
								state.x -= dx;
								state.y -= dy;
								state.width -= sx;
								state.height -= sy;
							}
							else
							{
								state.x += dx / maxStep;
								state.y += dy / maxStep;
								state.width += sx / maxStep;
								state.height += sy / maxStep;
							}
							
							graph.cellRenderer.redraw(state);
							
							bpmEffects.cascadeOpacity(graph, change.cell, 100 * step / maxStep);
						}
					}
				}
			}

			if (step < maxStep && isRequired)
			{
				step++;
				window.setTimeout(animate, delay);
			}
			else if (done != null)
			{
				done();
			}
		};
		
		var delay = 30;
		animate();
	},
    
    cascadeOpacity: function(graph, cell, opacity)
	{
		var childCount = graph.model.getChildCount(cell);
		
		for (var i=0; i<childCount; i++)
		{
			var child = graph.model.getChildAt(cell, i);
			var childState = graph.getView().getState(child);
			
			if (childState != null)
			{
				bpmUtils.setOpacity(childState.shape.node, opacity);
				bpmEffects.cascadeOpacity(graph, child, opacity);
			}
		}
		
		var edges = graph.model.getEdges(cell);
		
		if (edges != null)
		{
			for (var i=0; i<edges.length; i++)
			{
				var edgeState = graph.getView().getState(edges[i]);
				
				if (edgeState != null)
				{
					bpmUtils.setOpacity(edgeState.shape.node, opacity);
				}
			}
		}
	},

	fadeOut: function(node, from, remove, step, delay, isEnabled)
	{
		step = step || 40;
		delay = delay || 30;
		
		var opacity = from || 100;
		
		bpmUtils.setOpacity(node, opacity);
		
		if (isEnabled || isEnabled == null)
		{
			var f = function()
			{
			    opacity = Math.max(opacity-step, 0);
				bpmUtils.setOpacity(node, opacity);
				
				if (opacity > 0)
				{
					window.setTimeout(f, delay);
				}
				else
				{
					node.style.visibility = 'hidden';
					
					if (remove && node.parentNode)
					{
						node.parentNode.removeChild(node);
					}
				}
			};
			window.setTimeout(f, delay);
		}
		else
		{
			node.style.visibility = 'hidden';
			
			if (remove && node.parentNode)
			{
				node.parentNode.removeChild(node);
			}
		}
	}

};



var bpmUtils =
{
	errorResource: (bpmCore.language != 'none') ? 'error' : '',
	
	closeResource: (bpmCore.language != 'none') ? 'close' : '',

	errorImage: bpmCore.imageBasePath + '/error.gif',
	
	removeCursors: function(element)
	{
		if (element.style != null)
		{
			element.style.cursor = '';
		}
		
		var children = element.childNodes;
		
		if (children != null)
		{
	        var childCount = children.length;
	        
	        for (var i = 0; i < childCount; i += 1)
	        {
	            bpmUtils.removeCursors(children[i]);
	        }
	    }
	},

	getCurrentStyle: function()
	{
		if (bpmCore.IS_IE && (document.documentMode == null || document.documentMode < 9))
		{
			return function(element)
			{
				return (element != null) ? element.currentStyle : null;
			};
		}
		else
		{
			return function(element)
			{
				return (element != null) ?
					window.getComputedStyle(element, '') :
					null;
			};
		}
	}(),
	
	parseCssNumber: function(value)
	{
		if (value == 'thin')
		{
			value = '2';
		}
		else if (value == 'medium')
		{
			value = '4';
		}
		else if (value == 'thick')
		{
			value = '6';
		}
		
		value = parseFloat(value);
		
		if (isNaN(value))
		{
			value = 0;
		}
		
		return value;
	},

	setPrefixedStyle: function()
	{
		var prefix = null;
		
		if (bpmCore.IS_OT)
		{
			prefix = 'O';
		}
		else if (bpmCore.IS_SF || bpmCore.IS_GC)
		{
			prefix = 'Webkit';
		}
		else if (bpmCore.IS_MT)
		{
			prefix = 'Moz';
		}
		else if (bpmCore.IS_IE && document.documentMode >= 9 && document.documentMode < 10)
		{
			prefix = 'ms';
		}

		return function(style, name, value)
		{
			style[name] = value;
			
			if (prefix != null && name.length > 0)
			{
				name = prefix + name.substring(0, 1).toUpperCase() + name.substring(1);
				style[name] = value;
			}
		};
	}(),
	
	hasScrollbars: function(node)
	{
		var style = bpmUtils.getCurrentStyle(node);

		return style != null && (style.overflow == 'scroll' || style.overflow == 'auto');
	},

	bind: function(scope, funct)
	{
		return function()
		{
			return funct.apply(scope, arguments);
		};
	},
	
	eval: function(expr)
	{
		var result = null;

		if (expr.indexOf('function') >= 0)
		{
			try
			{
				eval('var _bpmJavaScriptExpression='+expr);
				result = _bpmJavaScriptExpression;

				_bpmJavaScriptExpression = null;
			}
			catch (e)
			{
				bpmLog.warn(e.message + ' while evaluating ' + expr);
			}
		}
		else
		{
			try
			{
				result = eval(expr);
			}
			catch (e)
			{
				bpmLog.warn(e.message + ' while evaluating ' + expr);
			}
		}
		
		return result;
	},
	
	findNode: function(node, attr, value)
	{
		if (node.nodeType == bpmConstants.NODETYPE_ELEMENT)
		{
			var tmp = node.getAttribute(attr);
	
			if (tmp != null && tmp == value)
			{
				return node;
			}
		}
		
		node = node.firstChild;
		
		while (node != null)
		{
			var result = bpmUtils.findNode(node, attr, value);
			
			if (result != null)
			{
				return result;
			}
			
			node = node.nextSibling;
		}
		
		return null;
	},

	getFunctionName: function(f)
	{
		var str = null;

		if (f != null)
		{
			if (f.name != null)
			{
				str = f.name;
			}
			else
			{
				str = bpmUtils.trim(f.toString());
				
				if (/^function\s/.test(str))
				{
					str = bpmUtils.ltrim(str.substring(9));
					var idx2 = str.indexOf('(');
					
					if (idx2 > 0)
					{
						str = str.substring(0, idx2);
					}
				}
			}
		}
		
		return str;
	},

	indexOf: function(array, obj)
	{
		if (array != null && obj != null)
		{
			for (var i = 0; i < array.length; i++)
			{
				if (array[i] == obj)
				{
					return i;
				}
			}
		}
		
		return -1;
	},

	forEach: function(array, fn)
	{
		if (array != null && fn != null)
		{
			for (var i = 0; i < array.length; i++)
			{
				fn(array[i]);
			}
		}
		
		return array;
	},

	remove: function(obj, array)
	{
		var result = null;
		
		if (typeof(array) == 'object')
		{
			var index = bpmUtils.indexOf(array, obj);
			
			while (index >= 0)
			{
				array.splice(index, 1);
				result = obj;
				index = bpmUtils.indexOf(array, obj);
			}
		}

		for (var key in array)
		{
			if (array[key] == obj)
			{
				delete array[key];
				result = obj;
			}
		}
		
		return result;
	},
	
	 isNode: function(value, nodeName, attributeName, attributeValue)
	 {
	 	if (value != null && !isNaN(value.nodeType) && (nodeName == null ||
	 		value.nodeName.toLowerCase() == nodeName.toLowerCase()))
 		{
 			return attributeName == null ||
 				value.getAttribute(attributeName) == attributeValue;
 		}
	 	
	 	return false;
	 },
	
	 isAncestorNode: function(ancestor, child)
	 {
	 	var parent = child;
	 	
	 	while (parent != null)
	 	{
	 		if (parent == ancestor)
	 		{
	 			return true;
	 		}

	 		parent = parent.parentNode;
	 	}
	 	
	 	return false;
	 },
	getChildNodes: function(node, nodeType)
	{
		nodeType = nodeType || bpmConstants.NODETYPE_ELEMENT;
		
		var children = [];
		var tmp = node.firstChild;
		
		while (tmp != null)
		{
			if (tmp.nodeType == nodeType)
			{
				children.push(tmp);
			}
			
			tmp = tmp.nextSibling;
		}
		
		return children;
	},
	importNode: function(doc, node, allChildren)
	{
		if (bpmCore.IS_IE && (document.documentMode == null || document.documentMode < 10))
		{
			switch (node.nodeType)
			{
				case 1: /* element */
				{
					var newNode = doc.createElement(node.nodeName);
					
					if (node.attributes && node.attributes.length > 0)
					{
						for (var i = 0; i < node.attributes.length; i++)
						{
							newNode.setAttribute(node.attributes[i].nodeName,
								node.getAttribute(node.attributes[i].nodeName));
						}
						
						if (allChildren && node.childNodes && node.childNodes.length > 0)
						{
							for (var i = 0; i < node.childNodes.length; i++)
							{
								newNode.appendChild(bpmUtils.importNode(doc, node.childNodes[i], allChildren));
							}
						}
					}
					
					return newNode;
					break;
				}
				case 3: /* text */
			    case 4: /* cdata-section */
			    case 8: /* comment */
			    {
			      return doc.createTextNode(node.value);
			      break;
			    }
			};
		}
		else
		{
			return doc.importNode(node, allChildren);
		}
	},

	createXmlDocument: function()
	{
		var doc = null;
		
		if (document.implementation && document.implementation.createDocument)
		{
			doc = document.implementation.createDocument('', '', null);
		}
		else if (window.ActiveXObject)
		{
			doc = new ActiveXObject('Microsoft.XMLDOM');
	 	}
	 	
	 	return doc;
	},

	parseXml: function()
	{
		if (window.DOMParser)
		{
			return function(xml)
			{
				var parser = new DOMParser();
				
				return parser.parseFromString(xml, 'text/xml');
			};
		}
		else // IE<=9
		{
			return function(xml)
			{
				var result = bpmUtils.createXmlDocument();
				result.async = false;
				// Workaround for parsing errors with SVG DTD
				result.validateOnParse = false;
				result.resolveExternals = false;
				result.loadXML(xml);
				
				return result;
			};
		}
	}(),

	clearSelection: function()
	{
		if (document.selection)
		{
			return function()
			{
				document.selection.empty();
			};
		}
		else if (window.getSelection)
		{
			return function()
			{
				if (window.getSelection().empty)
				{
					window.getSelection().empty();
				}
				else if (window.getSelection().removeAllRanges)
				{
					window.getSelection().removeAllRanges();
				}
			};
		}
		else
		{
			return function() { };
		}
	}(),

	getPrettyXml: function(node, tab, indent)
	{
		var result = [];
		
		if (node != null)
		{
			tab = tab || '  ';
			indent = indent || '';
			
			if (node.nodeType == bpmConstants.NODETYPE_TEXT)
			{
				var value =  bpmUtils.trim(bpmUtils.getTextContent(node));
				
				if (value.length > 0)
				{
					result.push(indent + bpmUtils.htmlEntities(value) + '\n');
				}
			}
			else
			{
				result.push(indent + '<' + node.nodeName);
				
				var attrs = node.attributes;
				
				if (attrs != null)
				{
					for (var i = 0; i < attrs.length; i++)
					{
						var val = bpmUtils.htmlEntities(attrs[i].value);
						result.push(' ' + attrs[i].nodeName + '="' + val + '"');
					}
				}

				var tmp = node.firstChild;
				
				if (tmp != null)
				{
					result.push('>\n');
					
					while (tmp != null)
					{
						result.push(bpmUtils.getPrettyXml(tmp, tab, indent + tab));
						tmp = tmp.nextSibling;
					}
					
					result.push(indent + '</'+node.nodeName + '>\n');
				}
				else
				{
					result.push('/>\n');
				}
			}
		}
		
		return result.join('');
	},

	removeWhitespace: function(node, before)
	{
		var tmp = (before) ? node.previousSibling : node.nextSibling;
		
		while (tmp != null && tmp.nodeType == bpmConstants.NODETYPE_TEXT)
		{
			var next = (before) ? tmp.previousSibling : tmp.nextSibling;
			var text = bpmUtils.getTextContent(tmp);
			
			if (bpmUtils.trim(text).length == 0)
			{
				tmp.parentNode.removeChild(tmp);
			}
			
			tmp = next;
		}
	},
	
	htmlEntities: function(s, newline)
	{
		s = String(s || '');
		
		s = s.replace(/&/g,'&amp;'); // 38 26
		s = s.replace(/"/g,'&quot;'); // 34 22
		s = s.replace(/\'/g,'&#39;'); // 39 27
		s = s.replace(/</g,'&lt;'); // 60 3C
		s = s.replace(/>/g,'&gt;'); // 62 3E

		if (newline == null || newline)
		{
			s = s.replace(/\n/g, '&#xa;');
		}
		
		return s;
	},

	isVml: function(node)
	{
		return node != null && node.tagUrn == 'urn:schemas-microsoft-com:vml';
	},

	getXml: function(node, linefeed)
	{
		var xml = '';

		if (window.XMLSerializer != null)
		{
			var xmlSerializer = new XMLSerializer();
			xml = xmlSerializer.serializeToString(node);     
		}
		else if (node.xml != null)
		{
			xml = node.xml.replace(/\r\n\t[\t]*/g, '').
				replace(/>\r\n/g, '>').
				replace(/\r\n/g, '\n');
		}

		// Replaces linefeeds with HTML Entities.
		linefeed = linefeed || '&#xa;';
		xml = xml.replace(/\n/g, linefeed);
		  
		return xml;
	},
	
	extractTextWithWhitespace: function(elems)
	{
		var blocks = ['BLOCKQUOTE', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'OL', 'P', 'PRE', 'TABLE', 'UL'];
		var ret = [];
		
		function doExtract(elts)
		{
			if (elts.length == 1 && (elts[0].nodeName == 'BR' ||
				elts[0].innerHTML == '\n'))
			{
				return;
			}
			
		    for (var i = 0; i < elts.length; i++)
		    {
		        var elem = elts[i];

				if (elem.nodeName == 'BR' || elem.innerHTML == '\n' ||
					((elts.length == 1 || i == 0) && (elem.nodeName == 'DIV' &&
					elem.innerHTML.toLowerCase() == '<br>')))
		    	{
	    			ret.push('\n');
		    	}
				else
				{
			        if (elem.nodeType === 3 || elem.nodeType === 4)
			        {
			        	if (elem.nodeValue.length > 0)
			        	{
			        		ret.push(elem.nodeValue);
			        	}
			        }
			        else if (elem.nodeType !== 8 && elem.childNodes.length > 0)
					{
						doExtract(elem.childNodes);
					}
			        
	        		if (i < elts.length - 1 && bpmUtils.indexOf(blocks, elts[i + 1].nodeName) >= 0)
	        		{
	        			ret.push('\n');		
	        		}
				}
		    }
		};
		
		doExtract(elems);
	    
	    return ret.join('');
	},

	replaceTrailingNewlines: function(str, pattern)
	{
		var postfix = '';
		
		while (str.length > 0 && str.charAt(str.length - 1) == '\n')
		{
			str = str.substring(0, str.length - 1);
			postfix += pattern;
		}
		
		return str + postfix;
	},

	getTextContent: function(node)
	{
		if (bpmCore.IS_IE && node.innerText !== undefined)
		{
			return node.innerText;
		}
		else
		{
			return (node != null) ? node[(node.textContent === undefined) ? 'text' : 'textContent'] : '';
		}
	},
	
	setTextContent: function(node, text)
	{
		if (node.innerText !== undefined)
		{
			node.innerText = text;
		}
		else
		{
			node[(node.textContent === undefined) ? 'text' : 'textContent'] = text;
		}
	},
	
	getInnerHtml: function()
	{
		if (bpmCore.IS_IE)
		{
			return function(node)
			{
				if (node != null)
				{
					return node.innerHTML;
				}
				
				return '';
			};
		}
		else
		{
			return function(node)
			{
				if (node != null)
				{
					var serializer = new XMLSerializer();
					return serializer.serializeToString(node);
				}
				
				return '';
			};
		}
	}(),

	getOuterHtml: function()
	{
		if (bpmCore.IS_IE)
		{
			return function(node)
			{
				if (node != null)
				{
					if (node.outerHTML != null)
					{
						return node.outerHTML;
					}
					else
					{
						var tmp = [];
						tmp.push('<'+node.nodeName);
						
						var attrs = node.attributes;
						
						if (attrs != null)
						{
							for (var i = 0; i < attrs.length; i++)
							{
								var value = attrs[i].value;
								
								if (value != null && value.length > 0)
								{
									tmp.push(' ');
									tmp.push(attrs[i].nodeName);
									tmp.push('="');
									tmp.push(value);
									tmp.push('"');
								}
							}
						}
						
						if (node.innerHTML.length == 0)
						{
							tmp.push('/>');
						}
						else
						{
							tmp.push('>');
							tmp.push(node.innerHTML);
							tmp.push('</'+node.nodeName+'>');
						}
						
						return tmp.join('');
					}
				}
				
				return '';
			};
		}
		else
		{
			return function(node)
			{
				if (node != null)
				{
					var serializer = new XMLSerializer();
					return serializer.serializeToString(node);
				}
				
				return '';
			};
		}
	}(),
	
	write: function(parent, text)
	{
		var doc = parent.ownerDocument;
		var node = doc.createTextNode(text);
		
		if (parent != null)
		{
			parent.appendChild(node);
		}
		
		return node;
	},
	
	writeln: function(parent, text)
	{
		var doc = parent.ownerDocument;
		var node = doc.createTextNode(text);
		
		if (parent != null)
		{
			parent.appendChild(node);
			parent.appendChild(document.createElement('br'));
		}
		
		return node;
	},
	
	br: function(parent, count)
	{
		count = count || 1;
		var br = null;
		
		for (var i = 0; i < count; i++)
		{
			if (parent != null)
			{
				br = parent.ownerDocument.createElement('br');
				parent.appendChild(br);
			}
		}
		
		return br;
	},
	
	button: function(label, funct, doc)
	{
		doc = (doc != null) ? doc : document;
		
		var button = doc.createElement('button');
		bpmUtils.write(button, label);

		bpmEvent.addListener(button, 'click', function(evt)
		{
			funct(evt);
		});
		
		return button;
	},

	para: function(parent, text)
	{
		var p = document.createElement('p');
		bpmUtils.write(p, text);

		if (parent != null)
		{
			parent.appendChild(p);
		}
		
		return p;
	},

	addTransparentBackgroundFilter: function(node)
	{
		node.style.filter += 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'' +
			bpmCore.imageBasePath + '/transparent.gif\', sizingMethod=\'scale\')';
	},

	linkAction: function(parent, text, editor, action, pad)
	{
		return bpmUtils.link(parent, text, function()
		{
			editor.execute(action);
		}, pad);
	},

	linkInvoke: function(parent, text, editor, functName, arg, pad)
	{
		return bpmUtils.link(parent, text, function()
		{
			editor[functName](arg);
		}, pad);
	},
	
	link: function(parent, text, funct, pad)
	{
		var a = document.createElement('span');
		
		a.style.color = 'blue';
		a.style.textDecoration = 'underline';
		a.style.cursor = 'pointer';
		
		if (pad != null)
		{
			a.style.paddingLeft = pad+'px';
		}
		
		bpmEvent.addListener(a, 'click', funct);
		bpmUtils.write(a, text);
		
		if (parent != null)
		{
			parent.appendChild(a);
		}
		
		return a;
	},

	getDocumentSize: function()
	{
		var b = document.body;
		var d = document.documentElement;
		
		try
		{
			return new bpmRectangle(0, 0, b.clientWidth || d.clientWidth, Math.max(b.clientHeight || 0, d.clientHeight));
		}
		catch (e)
		{
			return new bpmRectangle();
		}
	},
	
	fit: function(node)
	{
		var ds = bpmUtils.getDocumentSize();
		var left = parseInt(node.offsetLeft);
		var width = parseInt(node.offsetWidth);
			
		var offset = bpmUtils.getDocumentScrollOrigin(node.ownerDocument);
		var sl = offset.x;
		var st = offset.y;

		var b = document.body;
		var d = document.documentElement;
		var right = (sl) + ds.width;
		
		if (left + width > right)
		{
			node.style.left = Math.max(sl, right - width) + 'px';
		}
		
		var top = parseInt(node.offsetTop);
		var height = parseInt(node.offsetHeight);
		
		var bottom = st + ds.height;
		
		if (top + height > bottom)
		{
			node.style.top = Math.max(st, bottom - height) + 'px';
		}
	},

	load: function(url)
	{
		var req = new bpmXmlRequest(url, null, 'GET', false);
		req.send();
		
		return req;
	},

	get: function(url, onload, onerror, binary, timeout, ontimeout)
	{
		var req = new bpmXmlRequest(url, null, 'GET');
		
		if (binary != null)
		{
			req.setBinary(binary);
		}
		
		req.send(onload, onerror, timeout, ontimeout);
		
		return req;
	},

	getAll: function(urls, onload, onerror)
	{
		var remain = urls.length;
		var result = [];
		var errors = 0;
		var err = function()
		{
			if (errors == 0 && onerror != null)
			{
				onerror();
			}

			errors++;
		};
		
		for (var i = 0; i < urls.length; i++)
		{
			(function(url, index)
			{
				bpmUtils.get(url, function(req)
				{
					var status = req.getStatus();
					
					if (status < 200 || status > 299)
					{
						err();
					}
					else
					{
						result[index] = req;
						remain--;
						
						if (remain == 0)
						{
							onload(result);
						}
					}
				}, err);
			})(urls[i], i);
		}
		
		if (remain == 0)
		{
			onload(result);			
		}
	},
	
	post: function(url, params, onload, onerror)
	{
		return new bpmXmlRequest(url, params).send(onload, onerror);
	},
	
	submit: function(url, params, doc, target)
	{
		return new bpmXmlRequest(url, params).simulate(doc, target);
	},
	
	loadInto: function(url, doc, onload)
	{
		if (bpmCore.IS_IE)
		{
			doc.onreadystatechange = function ()
			{
				if (doc.readyState == 4)
				{
					onload();
				}
			};
		}
		else
		{
			doc.addEventListener('load', onload, false);
		}
		
		doc.load(url);
	},
	
	getValue: function(array, key, defaultValue)
	{
		var value = (array != null) ? array[key] : null;

		if (value == null)
		{
			value = defaultValue;			
		}
		
		return value;
	},
	
	getNumber: function(array, key, defaultValue)
	{
		var value = (array != null) ? array[key] : null;

		if (value == null)
		{
			value = defaultValue || 0;			
		}
		
		return Number(value);
	},
	
	getColor: function(array, key, defaultValue)
	{
		var value = (array != null) ? array[key] : null;

		if (value == null)
		{
			value = defaultValue;
		}
		else if (value == bpmConstants.NONE)
		{
			value = null;
		}
		
		return value;
	},

	clone: function(obj, transients, shallow)
	{
		shallow = (shallow != null) ? shallow : false;
		var clone = null;
		
		if (obj != null && typeof(obj.constructor) == 'function')
		{
			clone = new obj.constructor();
			
		    for (var i in obj)
		    {
		    	if (i != bpmObjectIdentity.FIELD_NAME && (transients == null ||
		    		bpmUtils.indexOf(transients, i) < 0))
		    	{
			    	if (!shallow && typeof(obj[i]) == 'object')
			    	{
			            clone[i] = bpmUtils.clone(obj[i]);
			        }
			        else
			        {
			            clone[i] = obj[i];
			        }
				}
		    }
		}
		
	    return clone;
	},

	equalPoints: function(a, b)
	{
		if ((a == null && b != null) || (a != null && b == null) ||
			(a != null && b != null && a.length != b.length))
		{
			return false;
		}
		else if (a != null && b != null)
		{
			for (var i = 0; i < a.length; i++)
			{
				if (a[i] == b[i] || (a[i] != null && !a[i].equals(b[i])))
				{
					return false;
				}
			}
		}
		
		return true;
	},

	equalEntries: function(a, b)
	{
		if ((a == null && b != null) || (a != null && b == null) ||
			(a != null && b != null && a.length != b.length))
		{
			return false;
		}
		else if (a != null && b != null)
		{
			var count = 0;
			
			for (var key in b)
			{
				count++;
			}
			
			for (var key in a)
			{
				count--
				
				if ((!bpmUtils.isNaN(a[key]) || !bpmUtils.isNaN(b[key])) && a[key] != b[key])
				{
					return false;
				}
			}
		}
		
		return count == 0;
	},
	
	removeDuplicates: function(arr)
	{
		var dict = new bpmDictionary();
		var result = [];
		
		for (var i = 0; i < arr.length; i++)
		{
			if (!dict.get(arr[i]))
			{
				result.push(arr[i]);
				dict.put(arr[i], true);
			}
		}

		return result;
	},
	
	isNaN: function(value)
	{
		return typeof(value) == 'number' && isNaN(value);
	},
	
	extend: function(ctor, superCtor)
	{
		var f = function() {};
		f.prototype = superCtor.prototype;
		
		ctor.prototype = new f();
		ctor.prototype.constructor = ctor;
	},

	toString: function(obj)
	{
	    var output = '';
	    
	    for (var i in obj)
	    {
	    	try
	    	{
			    if (obj[i] == null)
			    {
		            output += i + ' = [null]\n';
			    }
			    else if (typeof(obj[i]) == 'function')
			    {
		            output += i + ' => [Function]\n';
		        }
		        else if (typeof(obj[i]) == 'object')
		        {
		        	var ctor = bpmUtils.getFunctionName(obj[i].constructor); 
		            output += i + ' => [' + ctor + ']\n';
		        }
		        else
		        {
		            output += i + ' = ' + obj[i] + '\n';
		        }
	    	}
	    	catch (e)
	    	{
	    		output += i + '=' + e.message;
	    	}
	    }
	    
	    return output;
	},

	toRadians: function(deg)
	{
		return Math.PI * deg / 180;
	},

	toDegree: function(rad)
	{
		return rad * 180 / Math.PI;
	},
	
	arcToCurves: function(x0, y0, r1, r2, angle, largeArcFlag, sweepFlag, x, y)
	{
		x -= x0;
		y -= y0;
		
        if (r1 === 0 || r2 === 0) 
        {
        	return result;
        }
        
        var fS = sweepFlag;
        var psai = angle;
        r1 = Math.abs(r1);
        r2 = Math.abs(r2);
        var ctx = -x / 2;
        var cty = -y / 2;
        var cpsi = Math.cos(psai * Math.PI / 180);
        var spsi = Math.sin(psai * Math.PI / 180);
        var rxd = cpsi * ctx + spsi * cty;
        var ryd = -1 * spsi * ctx + cpsi * cty;
        var rxdd = rxd * rxd;
        var rydd = ryd * ryd;
        var r1x = r1 * r1;
        var r2y = r2 * r2;
        var lamda = rxdd / r1x + rydd / r2y;
        var sds;
        
        if (lamda > 1) 
        {
        	r1 = Math.sqrt(lamda) * r1;
        	r2 = Math.sqrt(lamda) * r2;
        	sds = 0;
        }  
        else
        {
        	var seif = 1;
            
        	if (largeArcFlag === fS) 
        	{
        		seif = -1;
        	}
            
        	sds = seif * Math.sqrt((r1x * r2y - r1x * rydd - r2y * rxdd) / (r1x * rydd + r2y * rxdd));
        }
        
        var txd = sds * r1 * ryd / r2;
        var tyd = -1 * sds * r2 * rxd / r1;
        var tx = cpsi * txd - spsi * tyd + x / 2;
        var ty = spsi * txd + cpsi * tyd + y / 2;
        var rad = Math.atan2((ryd - tyd) / r2, (rxd - txd) / r1) - Math.atan2(0, 1);
        var s1 = (rad >= 0) ? rad : 2 * Math.PI + rad;
        rad = Math.atan2((-ryd - tyd) / r2, (-rxd - txd) / r1) - Math.atan2((ryd - tyd) / r2, (rxd - txd) / r1);
        var dr = (rad >= 0) ? rad : 2 * Math.PI + rad;
        
        if (fS == 0 && dr > 0) 
        {
        	dr -= 2 * Math.PI;
        }
        else if (fS != 0 && dr < 0) 
        {
        	dr += 2 * Math.PI;
        }
        
        var sse = dr * 2 / Math.PI;
        var seg = Math.ceil(sse < 0 ? -1 * sse : sse);
        var segr = dr / seg;
        var t = 8/3 * Math.sin(segr / 4) * Math.sin(segr / 4) / Math.sin(segr / 2);
        var cpsir1 = cpsi * r1;
        var cpsir2 = cpsi * r2;
        var spsir1 = spsi * r1;
        var spsir2 = spsi * r2;
        var mc = Math.cos(s1);
        var ms = Math.sin(s1);
        var x2 = -t * (cpsir1 * ms + spsir2 * mc);
        var y2 = -t * (spsir1 * ms - cpsir2 * mc);
        var x3 = 0;
        var y3 = 0;

		var result = [];
        
        for (var n = 0; n < seg; ++n) 
        {
            s1 += segr;
            mc = Math.cos(s1);
            ms = Math.sin(s1);
            
            x3 = cpsir1 * mc - spsir2 * ms + tx;
            y3 = spsir1 * mc + cpsir2 * ms + ty;
            var dx = -t * (cpsir1 * ms + spsir2 * mc);
            var dy = -t * (spsir1 * ms - cpsir2 * mc);
            
            var index = n * 6;
            result[index] = Number(x2 + x0);
            result[index + 1] = Number(y2 + y0);
            result[index + 2] = Number(x3 - dx + x0);
            result[index + 3] = Number(y3 - dy + y0);
            result[index + 4] = Number(x3 + x0);
            result[index + 5] = Number(y3 + y0);
            
			x2 = x3 + dx;
            y2 = y3 + dy;
        }
        
        return result;
	},

	getBoundingBox: function(rect, rotation, cx)
	{
        var result = null;

        if (rect != null && rotation != null && rotation != 0)
        {
            var rad = bpmUtils.toRadians(rotation);
            var cos = Math.cos(rad);
            var sin = Math.sin(rad);

            cx = (cx != null) ? cx : new bpmPoint(rect.x + rect.width / 2, rect.y  + rect.height / 2);

            var p1 = new bpmPoint(rect.x, rect.y);
            var p2 = new bpmPoint(rect.x + rect.width, rect.y);
            var p3 = new bpmPoint(p2.x, rect.y + rect.height);
            var p4 = new bpmPoint(rect.x, p3.y);

            p1 = bpmUtils.getRotatedPoint(p1, cos, sin, cx);
            p2 = bpmUtils.getRotatedPoint(p2, cos, sin, cx);
            p3 = bpmUtils.getRotatedPoint(p3, cos, sin, cx);
            p4 = bpmUtils.getRotatedPoint(p4, cos, sin, cx);

            result = new bpmRectangle(p1.x, p1.y, 0, 0);
            result.add(new bpmRectangle(p2.x, p2.y, 0, 0));
            result.add(new bpmRectangle(p3.x, p3.y, 0, 0));
            result.add(new bpmRectangle(p4.x, p4.y, 0, 0));
        }

        return result;
	},

	getRotatedPoint: function(pt, cos, sin, c)
	{
		c = (c != null) ? c : new bpmPoint();
		var x = pt.x - c.x;
		var y = pt.y - c.y;

		var x1 = x * cos - y * sin;
		var y1 = y * cos + x * sin;

		return new bpmPoint(x1 + c.x, y1 + c.y);
	},
	
	getPortConstraints: function(terminal, edge, source, defaultValue)
	{
		var value = bpmUtils.getValue(terminal.style, bpmConstants.STYLE_PORT_CONSTRAINT,
			bpmUtils.getValue(edge.style, (source) ? bpmConstants.STYLE_SOURCE_PORT_CONSTRAINT :
				bpmConstants.STYLE_TARGET_PORT_CONSTRAINT, null));
		
		if (value == null)
		{
			return defaultValue;
		}
		else
		{
			var directions = value.toString();
			var returnValue = bpmConstants.DIRECTION_MASK_NONE;
			var constraintRotationEnabled = bpmUtils.getValue(terminal.style, bpmConstants.STYLE_PORT_CONSTRAINT_ROTATION, 0);
			var rotation = 0;
			
			if (constraintRotationEnabled == 1)
			{
				rotation = bpmUtils.getValue(terminal.style, bpmConstants.STYLE_ROTATION, 0);
			}
			
			var quad = 0;

			if (rotation > 45)
			{
				quad = 1;
				
				if (rotation >= 135)
				{
					quad = 2;
				}
			}
			else if (rotation < -45)
			{
				quad = 3;
				
				if (rotation <= -135)
				{
					quad = 2;
				}
			}

			if (directions.indexOf(bpmConstants.DIRECTION_NORTH) >= 0)
			{
				switch (quad)
				{
					case 0:
						returnValue |= bpmConstants.DIRECTION_MASK_NORTH;
						break;
					case 1:
						returnValue |= bpmConstants.DIRECTION_MASK_EAST;
						break;
					case 2:
						returnValue |= bpmConstants.DIRECTION_MASK_SOUTH;
						break;
					case 3:
						returnValue |= bpmConstants.DIRECTION_MASK_WEST;
						break;
				}
			}
			if (directions.indexOf(bpmConstants.DIRECTION_WEST) >= 0)
			{
				switch (quad)
				{
					case 0:
						returnValue |= bpmConstants.DIRECTION_MASK_WEST;
						break;
					case 1:
						returnValue |= bpmConstants.DIRECTION_MASK_NORTH;
						break;
					case 2:
						returnValue |= bpmConstants.DIRECTION_MASK_EAST;
						break;
					case 3:
						returnValue |= bpmConstants.DIRECTION_MASK_SOUTH;
						break;
				}
			}
			if (directions.indexOf(bpmConstants.DIRECTION_SOUTH) >= 0)
			{
				switch (quad)
				{
					case 0:
						returnValue |= bpmConstants.DIRECTION_MASK_SOUTH;
						break;
					case 1:
						returnValue |= bpmConstants.DIRECTION_MASK_WEST;
						break;
					case 2:
						returnValue |= bpmConstants.DIRECTION_MASK_NORTH;
						break;
					case 3:
						returnValue |= bpmConstants.DIRECTION_MASK_EAST;
						break;
				}
			}
			if (directions.indexOf(bpmConstants.DIRECTION_EAST) >= 0)
			{
				switch (quad)
				{
					case 0:
						returnValue |= bpmConstants.DIRECTION_MASK_EAST;
						break;
					case 1:
						returnValue |= bpmConstants.DIRECTION_MASK_SOUTH;
						break;
					case 2:
						returnValue |= bpmConstants.DIRECTION_MASK_WEST;
						break;
					case 3:
						returnValue |= bpmConstants.DIRECTION_MASK_NORTH;
						break;
				}
			}

			return returnValue;
		}
	},
	
	reversePortConstraints: function(constraint)
	{
		var result = 0;
		
		result = (constraint & bpmConstants.DIRECTION_MASK_WEST) << 3;
		result |= (constraint & bpmConstants.DIRECTION_MASK_NORTH) << 1;
		result |= (constraint & bpmConstants.DIRECTION_MASK_SOUTH) >> 1;
		result |= (constraint & bpmConstants.DIRECTION_MASK_EAST) >> 3;
		
		return result;
	},
	
	findNearestSegment: function(state, x, y)
	{
		var index = -1;
		
		if (state.absolutePoints.length > 0)
		{
			var last = state.absolutePoints[0];
			var min = null;
			
			for (var i = 1; i < state.absolutePoints.length; i++)
			{
				var current = state.absolutePoints[i];
				var dist = bpmUtils.ptSegDistSq(last.x, last.y,
					current.x, current.y, x, y);
				
				if (min == null || dist < min)
				{
					min = dist;
					index = i - 1;
				}

				last = current;
			}
		}
		
		return index;
	},

	getDirectedBounds: function (rect, m, style, flipH, flipV)
	{
		var d = bpmUtils.getValue(style, bpmConstants.STYLE_DIRECTION, bpmConstants.DIRECTION_EAST);
		flipH = (flipH != null) ? flipH : bpmUtils.getValue(style, bpmConstants.STYLE_FLIPH, false);
		flipV = (flipV != null) ? flipV : bpmUtils.getValue(style, bpmConstants.STYLE_FLIPV, false);

		m.x = Math.round(Math.max(0, Math.min(rect.width, m.x)));
		m.y = Math.round(Math.max(0, Math.min(rect.height, m.y)));
		m.width = Math.round(Math.max(0, Math.min(rect.width, m.width)));
		m.height = Math.round(Math.max(0, Math.min(rect.height, m.height)));
		
		if ((flipV && (d == bpmConstants.DIRECTION_SOUTH || d == bpmConstants.DIRECTION_NORTH)) ||
			(flipH && (d == bpmConstants.DIRECTION_EAST || d == bpmConstants.DIRECTION_WEST)))
		{
			var tmp = m.x;
			m.x = m.width;
			m.width = tmp;
		}
			
		if ((flipH && (d == bpmConstants.DIRECTION_SOUTH || d == bpmConstants.DIRECTION_NORTH)) ||
			(flipV && (d == bpmConstants.DIRECTION_EAST || d == bpmConstants.DIRECTION_WEST)))
		{
			var tmp = m.y;
			m.y = m.height;
			m.height = tmp;
		}
		
		var m2 = bpmRectangle.fromRectangle(m);
		
		if (d == bpmConstants.DIRECTION_SOUTH)
		{
			m2.y = m.x;
			m2.x = m.height;
			m2.width = m.y;
			m2.height = m.width;
		}
		else if (d == bpmConstants.DIRECTION_WEST)
		{
			m2.y = m.height;
			m2.x = m.width;
			m2.width = m.x;
			m2.height = m.y;
		}
		else if (d == bpmConstants.DIRECTION_NORTH)
		{
			m2.y = m.width;
			m2.x = m.y;
			m2.width = m.height;
			m2.height = m.x;
		}
		
		return new bpmRectangle(rect.x + m2.x, rect.y + m2.y, rect.width - m2.width - m2.x, rect.height - m2.height - m2.y);
	},

	getPerimeterPoint: function (pts, center, point)
	{
		var min = null;
		
		for (var i = 0; i < pts.length - 1; i++)
		{
			var pt = bpmUtils.intersection(pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y,
				center.x, center.y, point.x, point.y);
			
			if (pt != null)
			{
				var dx = point.x - pt.x;
				var dy = point.y - pt.y;
				var ip = {p: pt, distSq: dy * dy + dx * dx};
				
				if (ip != null && (min == null || min.distSq > ip.distSq))
				{
					min = ip;
				}
			}
		}
		
		return (min != null) ? min.p : null;
	},

	rectangleIntersectsSegment: function(bounds, p1, p2)
	{
		var top = bounds.y;
		var left = bounds.x;
		var bottom = top + bounds.height;
		var right = left + bounds.width;
			
		var minX = p1.x;
		var maxX = p2.x;
		
		if (p1.x > p2.x)
		{
		  minX = p2.x;
		  maxX = p1.x;
		}
		
		if (maxX > right)
		{
		  maxX = right;
		}
		
		if (minX < left)
		{
		  minX = left;
		}
		
		if (minX > maxX)
		{
		  return false;
		}
		
		var minY = p1.y;
		var maxY = p2.y;
		var dx = p2.x - p1.x;
		
		if (Math.abs(dx) > 0.0000001)
		{
		  var a = (p2.y - p1.y) / dx;
		  var b = p1.y - a * p1.x;
		  minY = a * minX + b;
		  maxY = a * maxX + b;
		}
		
		if (minY > maxY)
		{
		  var tmp = maxY;
		  maxY = minY;
		  minY = tmp;
		}
		
		if (maxY > bottom)
		{
		  maxY = bottom;
		}
		
		if (minY < top)
		{
		  minY = top;
		}
		
		if (minY > maxY)
		{
		  return false;
		}
		
		return true;
	},
	
	contains: function(bounds, x, y)
	{
		return (bounds.x <= x && bounds.x + bounds.width >= x &&
				bounds.y <= y && bounds.y + bounds.height >= y);
	},

	intersects: function(a, b)
	{
		var tw = a.width;
		var th = a.height;
		var rw = b.width;
		var rh = b.height;
		
		if (rw <= 0 || rh <= 0 || tw <= 0 || th <= 0)
		{
		    return false;
		}
		
		var tx = a.x;
		var ty = a.y;
		var rx = b.x;
		var ry = b.y;
		
		rw += rx;
		rh += ry;
		tw += tx;
		th += ty;

		return ((rw < rx || rw > tx) &&
			(rh < ry || rh > ty) &&
			(tw < tx || tw > rx) &&
			(th < ty || th > ry));
	},

	intersectsHotspot: function(state, x, y, hotspot, min, max)
	{
		hotspot = (hotspot != null) ? hotspot : 1;
		min = (min != null) ? min : 0;
		max = (max != null) ? max : 0;
		
		if (hotspot > 0)
		{
			var cx = state.getCenterX();
			var cy = state.getCenterY();
			var w = state.width;
			var h = state.height;
			
			var start = bpmUtils.getValue(state.style, bpmConstants.STYLE_STARTSIZE) * state.view.scale;

			if (start > 0)
			{
				if (bpmUtils.getValue(state.style, bpmConstants.STYLE_HORIZONTAL, true))
				{
					cy = state.y + start / 2;
					h = start;
				}
				else
				{
					cx = state.x + start / 2;
					w = start;
				}
			}

			w = Math.max(min, w * hotspot);
			h = Math.max(min, h * hotspot);
			
			if (max > 0)
			{
				w = Math.min(w, max);
				h = Math.min(h, max);
			}
			
			var rect = new bpmRectangle(cx - w / 2, cy - h / 2, w, h);
			var alpha = bpmUtils.toRadians(bpmUtils.getValue(state.style, bpmConstants.STYLE_ROTATION) || 0);
			
			if (alpha != 0)
			{
				var cos = Math.cos(-alpha);
				var sin = Math.sin(-alpha);
				var cx = new bpmPoint(state.getCenterX(), state.getCenterY());
				var pt = bpmUtils.getRotatedPoint(new bpmPoint(x, y), cos, sin, cx);
				x = pt.x;
				y = pt.y;
			}
			
			return bpmUtils.contains(rect, x, y);			
		}
		
		return true;
	},

	getOffset: function(container, scrollOffset)
	{
		var offsetLeft = 0;
		var offsetTop = 0;
		
		var fixed = false;
		var node = container;
		var b = document.body;
		var d = document.documentElement;

		while (node != null && node != b && node != d && !fixed)
		{
			var style = bpmUtils.getCurrentStyle(node);
			
			if (style != null)
			{
				fixed = fixed || style.position == 'fixed';
			}
			
			node = node.parentNode;
		}
		
		if (!scrollOffset && !fixed)
		{
			var offset = bpmUtils.getDocumentScrollOrigin(container.ownerDocument);
			offsetLeft += offset.x;
			offsetTop += offset.y;
		}
		
		var r = container.getBoundingClientRect();
		
		if (r != null)
		{
			offsetLeft += r.left;
			offsetTop += r.top;
		}
		
		return new bpmPoint(offsetLeft, offsetTop);
	},

	getDocumentScrollOrigin: function(doc)
	{
		if (bpmCore.IS_QUIRKS)
		{
			return new bpmPoint(doc.body.scrollLeft, doc.body.scrollTop);
		}
		else
		{
			var wnd = doc.defaultView || doc.parentWindow;
			
			var x = (wnd != null && window.pageXOffset !== undefined) ? window.pageXOffset : (document.documentElement || document.body.parentNode || document.body).scrollLeft;
			var y = (wnd != null && window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
			
			return new bpmPoint(x, y);
		}
	},
	
	getScrollOrigin: function(node, includeAncestors, includeDocument)
	{
		includeAncestors = (includeAncestors != null) ? includeAncestors : false;
		includeDocument = (includeDocument != null) ? includeDocument : true;
		
		var doc = (node != null) ? node.ownerDocument : document;
		var b = doc.body;
		var d = doc.documentElement;
		var result = new bpmPoint();
		var fixed = false;

		while (node != null && node != b && node != d)
		{
			if (!isNaN(node.scrollLeft) && !isNaN(node.scrollTop))
			{
				result.x += node.scrollLeft;
				result.y += node.scrollTop;
			}
			
			var style = bpmUtils.getCurrentStyle(node);
			
			if (style != null)
			{
				fixed = fixed || style.position == 'fixed';
			}

			node = (includeAncestors) ? node.parentNode : null;
		}

		if (!fixed && includeDocument)
		{
			var origin = bpmUtils.getDocumentScrollOrigin(doc);

			result.x += origin.x;
			result.y += origin.y;
		}
		
		return result;
	},

	convertPoint: function(container, x, y)
	{
		var origin = bpmUtils.getScrollOrigin(container, false);
		var offset = bpmUtils.getOffset(container);

		offset.x -= origin.x;
		offset.y -= origin.y;
		
		return new bpmPoint(x - offset.x, y - offset.y);
	},
	
	ltrim: function(str, chars)
	{
		chars = chars || "\\s";
		
		return (str != null) ? str.replace(new RegExp("^[" + chars + "]+", "g"), "") : null;
	},
	
	rtrim: function(str, chars)
	{
		chars = chars || "\\s";
		
		return (str != null) ? str.replace(new RegExp("[" + chars + "]+$", "g"), "") : null;
	},
	
	trim: function(str, chars)
	{
		return bpmUtils.ltrim(bpmUtils.rtrim(str, chars), chars);
	},
	
	isNumeric: function(n)
	{
		return !isNaN(parseFloat(n)) && isFinite(n) && (typeof(n) != 'string' || n.toLowerCase().indexOf('0x') < 0);
	},

	isInteger: function(n)
	{
		return String(parseInt(n)) === String(n);
	},

	mod: function(n, m)
	{
		return ((n % m) + m) % m;
	},

	intersection: function (x0, y0, x1, y1, x2, y2, x3, y3)
	{
		var denom = ((y3 - y2) * (x1 - x0)) - ((x3 - x2) * (y1 - y0));
		var nume_a = ((x3 - x2) * (y0 - y2)) - ((y3 - y2) * (x0 - x2));
		var nume_b = ((x1 - x0) * (y0 - y2)) - ((y1 - y0) * (x0 - x2));

		var ua = nume_a / denom;
		var ub = nume_b / denom;
		
		if(ua >= 0.0 && ua <= 1.0 && ub >= 0.0 && ub <= 1.0)
		{
			var x = x0 + ua * (x1 - x0);
			var y = y0 + ua * (y1 - y0);
			
			return new bpmPoint(x, y);
		}
		
		return null;
	},
	
	ptSegDistSq: function(x1, y1, x2, y2, px, py)
    {
		x2 -= x1;
		y2 -= y1;

		px -= x1;
		py -= y1;

		var dotprod = px * x2 + py * y2;
		var projlenSq;

		if (dotprod <= 0.0)
		{
		    projlenSq = 0.0;
		}
		else
		{
		    px = x2 - px;
		    py = y2 - py;
		    dotprod = px * x2 + py * y2;

		    if (dotprod <= 0.0)
		    {
				projlenSq = 0.0;
		    }
		    else
		    {
				projlenSq = dotprod * dotprod / (x2 * x2 + y2 * y2);
		    }
		}

		var lenSq = px * px + py * py - projlenSq;
		
		if (lenSq < 0)
		{
		    lenSq = 0;
		}
		
		return lenSq;
    },
	
    ptLineDist: function(x1, y1, x2, y2, px, py)
    {
		return Math.abs((y2 - y1) * px - (x2 - x1) * py + x2 * y1 - y2 * x1) /
			Math.sqrt((y2 - y1) * (y2 - y1) + (x2 - x1) * (x2 - x1));
    },
    
	relativeCcw: function(x1, y1, x2, y2, px, py)
    {
		x2 -= x1;
		y2 -= y1;
		px -= x1;
		py -= y1;
		var ccw = px * y2 - py * x2;
		
		if (ccw == 0.0)
		{
		    ccw = px * x2 + py * y2;
		    
		    if (ccw > 0.0)
		    {
				px -= x2;
				py -= y2;
				ccw = px * x2 + py * y2;
				
				if (ccw < 0.0)
				{
				    ccw = 0.0;
				}
		    }
		}
		
		return (ccw < 0.0) ? -1 : ((ccw > 0.0) ? 1 : 0);
    },
    
	animateChanges: function(graph, changes)
	{
		
    	bpmEffects.animateChanges.apply(this, arguments);
	},
    
    cascadeOpacity: function(graph, cell, opacity)
	{
		bpmEffects.cascadeOpacity.apply(this, arguments);
	},

	
	fadeOut: function(node, from, remove, step, delay, isEnabled)
	{
		bpmEffects.fadeOut.apply(this, arguments);
	},
	
	setOpacity: function(node, value)
	{
		if (bpmUtils.isVml(node))
		{
	    	if (value >= 100)
	    	{
	    		node.style.filter = '';
	    	}
	    	else
	    	{
			    node.style.filter = 'alpha(opacity=' + (value/5) + ')';
	    	}
		}
		else if (bpmCore.IS_IE && (typeof(document.documentMode) === 'undefined' || document.documentMode < 9))
	    {
	    	if (value >= 100)
	    	{
	    		node.style.filter = '';
	    	}
	    	else
	    	{
			    node.style.filter = 'alpha(opacity=' + value + ')';
	    	}
		}
		else
		{
		    node.style.opacity = (value / 100);
		}
	},

	createImage: function(src)
	{
        var imageNode = null;
        
		if (bpmCore.IS_IE6 && document.compatMode != 'CSS1Compat')
		{
        	imageNode = document.createElement(bpmCore.VML_PREFIX + ':image');
        	imageNode.setAttribute('src', src);
        	imageNode.style.borderStyle = 'none';
        }
		else
		{
			imageNode = document.createElement('img');
			imageNode.setAttribute('src', src);
			imageNode.setAttribute('border', '0');
		}
		
		return imageNode;
	},

	sortCells: function(cells, ascending)
	{
		ascending = (ascending != null) ? ascending : true;
		var lookup = new bpmDictionary();
		cells.sort(function(o1, o2)
		{
			var p1 = lookup.get(o1);
			
			if (p1 == null)
			{
				p1 = bpmCellPath.create(o1).split(bpmCellPath.PATH_SEPARATOR);
				lookup.put(o1, p1);
			}
			
			var p2 = lookup.get(o2);
			
			if (p2 == null)
			{
				p2 = bpmCellPath.create(o2).split(bpmCellPath.PATH_SEPARATOR);
				lookup.put(o2, p2);
			}
			
			var comp = bpmCellPath.compare(p1, p2);
			
			return (comp == 0) ? 0 : (((comp > 0) == ascending) ? 1 : -1);
		});
		
		return cells;
	},

	getStylename: function(style)
	{
		if (style != null)
		{
			var pairs = style.split(';');
			var stylename = pairs[0];
			
			if (stylename.indexOf('=') < 0)
			{
				return stylename;
			}
		}
				
		return '';
	},

	getStylenames: function(style)
	{
		var result = [];
		
		if (style != null)
		{
			var pairs = style.split(';');
			
			for (var i = 0; i < pairs.length; i++)
			{
				if (pairs[i].indexOf('=') < 0)
				{
					result.push(pairs[i]);
				}
			}
		}
				
		return result;
	},

	indexOfStylename: function(style, stylename)
	{
		if (style != null && stylename != null)
		{
			var tokens = style.split(';');
			var pos = 0;
			
			for (var i = 0; i < tokens.length; i++)
			{
				if (tokens[i] == stylename)
				{
					return pos;
				}
				
				pos += tokens[i].length + 1;
			}
		}

		return -1;
	},
	
	addStylename: function(style, stylename)
	{
		if (bpmUtils.indexOfStylename(style, stylename) < 0)
		{
			if (style == null)
			{
				style = '';
			}
			else if (style.length > 0 && style.charAt(style.length - 1) != ';')
			{
				style += ';';
			}
			
			style += stylename;
		}
		
		return style;
	},
	
	removeStylename: function(style, stylename)
	{
		var result = [];
		
		if (style != null)
		{
			var tokens = style.split(';');
			
			for (var i = 0; i < tokens.length; i++)
			{
				if (tokens[i] != stylename)
				{
					result.push(tokens[i]);
				}
			}
		}
		
		return result.join(';');
	},
	
	removeAllStylenames: function(style)
	{
		var result = [];
		
		if (style != null)
		{
			var tokens = style.split(';');
			
			for (var i = 0; i < tokens.length; i++)
			{
				// Keeps the key, value assignments
				if (tokens[i].indexOf('=') >= 0)
				{
					result.push(tokens[i]);
				}
			}
		}
		
		return result.join(';');
	},

	setCellStyles: function(model, cells, key, value)
	{
		if (cells != null && cells.length > 0)
		{
			model.beginUpdate();
			try
			{
				for (var i = 0; i < cells.length; i++)
				{
					if (cells[i] != null)
					{
						var style = bpmUtils.setStyle(model.getStyle(cells[i]), key, value);
						model.setStyle(cells[i], style);
					}
				}
			}
			finally
			{
				model.endUpdate();
			}
		}
	},
	
	setStyle: function(style, key, value)
	{
		var isValue = value != null && (typeof(value.length) == 'undefined' || value.length > 0);
		
		if (style == null || style.length == 0)
		{
			if (isValue)
			{
				style = key + '=' + value + ';';
			}
		}
		else
		{
			if (style.substring(0, key.length + 1) == key + '=')
			{
				var next = style.indexOf(';');
				
				if (isValue)
				{
					style = key + '=' + value + ((next < 0) ? ';' : style.substring(next));
				}
				else
				{
					style = (next < 0 || next == style.length - 1) ? '' : style.substring(next + 1);
				}
			}
			else
			{
				var index = style.indexOf(';' + key + '=');
				
				if (index < 0)
				{
					if (isValue)
					{
						var sep = (style.charAt(style.length - 1) == ';') ? '' : ';';
						style = style + sep + key + '=' + value + ';';
					}
				}
				else
				{
					var next = style.indexOf(';', index + 1);
					
					if (isValue)
					{
						style = style.substring(0, index + 1) + key + '=' + value + ((next < 0) ? ';' : style.substring(next));
					}
					else
					{
						style = style.substring(0, index) + ((next < 0) ? ';' : style.substring(next));
					}
				}
			}
		}
		
		return style;
	},

	setCellStyleFlags: function(model, cells, key, flag, value)
	{
		if (cells != null && cells.length > 0)
		{
			model.beginUpdate();
			try
			{
				for (var i = 0; i < cells.length; i++)
				{
					if (cells[i] != null)
					{
						var style = bpmUtils.setStyleFlag(
							model.getStyle(cells[i]),
							key, flag, value);
						model.setStyle(cells[i], style);
					}
				}
			}
			finally
			{
				model.endUpdate();
			}
		}
	},
	
	setStyleFlag: function(style, key, flag, value)
	{
		if (style == null || style.length == 0)
		{
			if (value || value == null)
			{
				style = key+'='+flag;
			}
			else
			{
				style = key+'=0';
			}
		}
		else
		{
			var index = style.indexOf(key+'=');
			
			if (index < 0)
			{
				var sep = (style.charAt(style.length-1) == ';') ? '' : ';';

				if (value || value == null)
				{
					style = style + sep + key + '=' + flag;
				}
				else
				{
					style = style + sep + key + '=0';
				}
			}
			else
			{
				var cont = style.indexOf(';', index);
				var tmp = '';
				
				if (cont < 0)
				{
					tmp  = style.substring(index+key.length+1);
				}
				else
				{
					tmp = style.substring(index+key.length+1, cont);
				}
				
				if (value == null)
				{
					tmp = parseInt(tmp) ^ flag;
				}
				else if (value)
				{
					tmp = parseInt(tmp) | flag;
				}
				else
				{
					tmp = parseInt(tmp) & ~flag;
				}
				
				style = style.substring(0, index) + key + '=' + tmp +
					((cont >= 0) ? style.substring(cont) : '');
			}
		}
		
		return style;
	},
	
	getAlignmentAsPoint: function(align, valign)
	{
		var dx = 0;
		var dy = 0;
		
		// Horizontal alignment
		if (align == bpmConstants.ALIGN_CENTER)
		{
			dx = -0.5;
		}
		else if (align == bpmConstants.ALIGN_RIGHT)
		{
			dx = -1;
		}

		// Vertical alignment
		if (valign == bpmConstants.ALIGN_MIDDLE)
		{
			dy = -0.5;
		}
		else if (valign == bpmConstants.ALIGN_BOTTOM)
		{
			dy = -1;
		}
		
		return new bpmPoint(dx, dy);
	},
	
	getSizeForString: function(text, fontSize, fontFamily, textWidth)
	{
		fontSize = (fontSize != null) ? fontSize : bpmConstants.DEFAULT_FONTSIZE;
		fontFamily = (fontFamily != null) ? fontFamily : bpmConstants.DEFAULT_FONTFAMILY;
		var div = document.createElement('div');
		
		// Sets the font size and family
		div.style.fontFamily = fontFamily;
		div.style.fontSize = Math.round(fontSize) + 'px';
		div.style.lineHeight = Math.round(fontSize * bpmConstants.LINE_HEIGHT) + 'px';
		
		// Disables block layout and outside wrapping and hides the div
		div.style.position = 'absolute';
		div.style.visibility = 'hidden';
		div.style.display = (bpmCore.IS_QUIRKS) ? 'inline' : 'inline-block';
		div.style.zoom = '1';
		
		if (textWidth != null)
		{
			div.style.width = textWidth + 'px';
			div.style.whiteSpace = 'normal';
		}
		else
		{
			div.style.whiteSpace = 'nowrap';
		}
		
		div.innerHTML = text;
		document.body.appendChild(div);
		
		var size = new bpmRectangle(0, 0, div.offsetWidth, div.offsetHeight);
		document.body.removeChild(div);
		
		return size;
	},
	
	getViewXml: function(graph, scale, cells, x0, y0)
	{
		x0 = (x0 != null) ? x0 : 0;
		y0 = (y0 != null) ? y0 : 0;
		scale = (scale != null) ? scale : 1;

		if (cells == null)
		{
			var model = graph.getModel();
			cells = [model.getRoot()];
		}
		
		var view = graph.getView();
		var result = null;

		var eventsEnabled = view.isEventsEnabled();
		view.setEventsEnabled(false);

		var drawPane = view.drawPane;
		var overlayPane = view.overlayPane;

		if (graph.dialect == bpmConstants.DIALECT_SVG)
		{
			view.drawPane = document.createElementNS(bpmConstants.NS_SVG, 'g');
			view.canvas.appendChild(view.drawPane);

			view.overlayPane = document.createElementNS(bpmConstants.NS_SVG, 'g');
			view.canvas.appendChild(view.overlayPane);
		}
		else
		{
			view.drawPane = view.drawPane.cloneNode(false);
			view.canvas.appendChild(view.drawPane);
			
			view.overlayPane = view.overlayPane.cloneNode(false);
			view.canvas.appendChild(view.overlayPane);
		}

		var translate = view.getTranslate();
		view.translate = new bpmPoint(x0, y0);

		var temp = new bpmTemporaryCellStates(graph.getView(), scale, cells);

		try
		{
			var enc = new bpmCodec();
			result = enc.encode(graph.getView());
		}
		finally
		{
			temp.destroy();
			view.translate = translate;
			view.canvas.removeChild(view.drawPane);
			view.canvas.removeChild(view.overlayPane);
			view.drawPane = drawPane;
			view.overlayPane = overlayPane;
			view.setEventsEnabled(eventsEnabled);
		}

		return result;
	},

	getScaleForPageCount: function(pageCount, graph, pageFormat, border)
	{
		if (pageCount < 1)
		{
			return 1;
		}
		
		pageFormat = (pageFormat != null) ? pageFormat : bpmConstants.PAGE_FORMAT_A4_PORTRAIT;
		border = (border != null) ? border : 0;
		
		var availablePageWidth = pageFormat.width - (border * 2);
		var availablePageHeight = pageFormat.height - (border * 2);

		var graphBounds = graph.getGraphBounds().clone();
		var sc = graph.getView().getScale();
		graphBounds.width /= sc;
		graphBounds.height /= sc;
		var graphWidth = graphBounds.width;
		var graphHeight = graphBounds.height;

		var scale = 1;
		
		var pageFormatAspectRatio = availablePageWidth / availablePageHeight;
		var graphAspectRatio = graphWidth / graphHeight;
		var pagesAspectRatio = graphAspectRatio / pageFormatAspectRatio;
		var pageRoot = Math.sqrt(pageCount);
		var pagesAspectRatioSqrt = Math.sqrt(pagesAspectRatio);
		var numRowPages = pageRoot * pagesAspectRatioSqrt;
		var numColumnPages = pageRoot / pagesAspectRatioSqrt;
		if (numRowPages < 1 && numColumnPages > pageCount)
		{
			var scaleChange = numColumnPages / pageCount;
			numColumnPages = pageCount;
			numRowPages /= scaleChange;
		}
		
		if (numColumnPages < 1 && numRowPages > pageCount)
		{
			var scaleChange = numRowPages / pageCount;
			numRowPages = pageCount;
			numColumnPages /= scaleChange;
		}		

		var currentTotalPages = Math.ceil(numRowPages) * Math.ceil(numColumnPages);

		var numLoops = 0;
		
		while (currentTotalPages > pageCount)
		{

			var roundRowDownProportion = Math.floor(numRowPages) / numRowPages;
			var roundColumnDownProportion = Math.floor(numColumnPages) / numColumnPages;
			
			if (roundRowDownProportion == 1)
			{
				roundRowDownProportion = Math.floor(numRowPages-1) / numRowPages;
			}
			if (roundColumnDownProportion == 1)
			{
				roundColumnDownProportion = Math.floor(numColumnPages-1) / numColumnPages;
			}
			
			var scaleChange = 1;
			
			if (roundRowDownProportion > roundColumnDownProportion)
			{
				scaleChange = roundRowDownProportion;
			}
			else
			{
				scaleChange = roundColumnDownProportion;
			}

			numRowPages = numRowPages * scaleChange;
			numColumnPages = numColumnPages * scaleChange;
			currentTotalPages = Math.ceil(numRowPages) * Math.ceil(numColumnPages);
			
			numLoops++;
			
			if (numLoops > 10)
			{
				break;
			}
		}

		var posterWidth = availablePageWidth * numRowPages;
		scale = posterWidth / graphWidth;
		
		return scale * 0.99999;
	},
	
	show: function(graph, doc, x0, y0, w, h)
	{
		x0 = (x0 != null) ? x0 : 0;
		y0 = (y0 != null) ? y0 : 0;
		
		if (doc == null)
		{
			var wnd = window.open();
			doc = wnd.document;
		}
		else
		{
			doc.open();
		}

		if (document.documentMode == 9)
		{
			doc.writeln('<!--[if IE]><meta http-equiv="X-UA-Compatible" content="IE=9"><![endif]-->');
		}
		
		var bounds = graph.getGraphBounds();
		var dx = Math.ceil(x0 - bounds.x);
		var dy = Math.ceil(y0 - bounds.y);
		
		if (w == null)
		{
			w = Math.ceil(bounds.width + x0) + Math.ceil(Math.ceil(bounds.x) - bounds.x);
		}
		
		if (h == null)
		{
			h = Math.ceil(bounds.height + y0) + Math.ceil(Math.ceil(bounds.y) - bounds.y);
		}
		
		if (bpmCore.IS_IE || document.documentMode == 11)
		{
			var html = '<html><head>';

			var base = document.getElementsByTagName('base');
			
			for (var i = 0; i < base.length; i++)
			{
				html += base[i].outerHTML;
			}

			html += '<style>';

			for (var i = 0; i < document.styleSheets.length; i++)
			{
				try
				{
					html += document.styleSheets[i].cssText;
				}
				catch (e)
				{
				}
			}

			html += '</style></head><body style="margin:0px;">';
			
			html += '<div style="position:absolute;overflow:hidden;width:' + w + 'px;height:' + h + 'px;"><div style="position:relative;left:' + dx + 'px;top:' + dy + 'px;">';
			html += graph.container.innerHTML;
			html += '</div></div></body><html>';

			doc.writeln(html);
			doc.close();
		}
		else
		{
			doc.writeln('<html><head>');
			
			var base = document.getElementsByTagName('base');
			
			for (var i = 0; i < base.length; i++)
			{
				doc.writeln(bpmUtils.getOuterHtml(base[i]));
			}
			
			var links = document.getElementsByTagName('link');
			
			for (var i = 0; i < links.length; i++)
			{
				doc.writeln(bpmUtils.getOuterHtml(links[i]));
			}
	
			var styles = document.getElementsByTagName('style');
			
			for (var i = 0; i < styles.length; i++)
			{
				doc.writeln(bpmUtils.getOuterHtml(styles[i]));
			}

			doc.writeln('</head><body style="margin:0px;"></body></html>');
			doc.close();

			var outer = doc.createElement('div');
			outer.position = 'absolute';
			outer.overflow = 'hidden';
			outer.style.width = w + 'px';
			outer.style.height = h + 'px';

			var div = doc.createElement('div');
			div.style.position = 'absolute';
			div.style.left = dx + 'px';
			div.style.top = dy + 'px';

			var node = graph.container.firstChild;
			var svg = null;
			
			while (node != null)
			{
				var clone = node.cloneNode(true);
				
				if (node == graph.view.drawPane.ownerSVGElement)
				{
					outer.appendChild(clone);
					svg = clone;
				}
				else
				{
					div.appendChild(clone);
				}
				
				node = node.nextSibling;
			}

			doc.body.appendChild(outer);
			
			if (div.firstChild != null)
			{
				doc.body.appendChild(div);
			}
						
			if (svg != null)
			{
				svg.style.minWidth = '';
				svg.style.minHeight = '';
				svg.firstChild.setAttribute('transform', 'translate(' + dx + ',' + dy + ')');
			}
		}
		
		bpmUtils.removeCursors(doc.body);
	
		return doc;
	},
	
	printScreen: function(graph)
	{
		var wnd = window.open();
		var bounds = graph.getGraphBounds();
		bpmUtils.show(graph, wnd.document);
		
		var print = function()
		{
			wnd.focus();
			wnd.print();
			wnd.close();
		};
		
		if (bpmCore.IS_GC)
		{
			wnd.setTimeout(print, 500);
		}
		else
		{
			print();
		}
	},
	
	popup: function(content, isInternalWindow)
	{
	   	if (isInternalWindow)
	   	{
			var div = document.createElement('div');
			
			div.style.overflow = 'scroll';
			div.style.width = '636px';
			div.style.height = '460px';
			
			var pre = document.createElement('pre');
		    pre.innerHTML = bpmUtils.htmlEntities(content, false).
		    	replace(/\n/g,'<br>').replace(/ /g, '&nbsp;');
			
			div.appendChild(pre);
			
			var w = document.body.clientWidth;
			var h = Math.max(document.body.clientHeight || 0, document.documentElement.clientHeight)
			var wnd = new bpmWindow('Popup Window', div,
				w/2-320, h/2-240, 640, 480, false, true);

			wnd.setClosable(true);
			wnd.setVisible(true);
		}
		else
		{
			if (bpmCore.IS_NS)
			{
			    var wnd = window.open();
				wnd.document.writeln('<pre>'+bpmUtils.htmlEntities(content)+'</pre');
			   	wnd.document.close();
			}
			else
			{
			    var wnd = window.open();
			    var pre = wnd.document.createElement('pre');
			    pre.innerHTML = bpmUtils.htmlEntities(content, false).
			    	replace(/\n/g,'<br>').replace(/ /g, '&nbsp;');
			   	wnd.document.body.appendChild(pre);
			}
	   	}
	},
	
	alert: function(message)
	{
		alert(message);
	},
	
	prompt: function(message, defaultValue)
	{
		return prompt(message, (defaultValue != null) ? defaultValue : '');
	},
	
	confirm: function(message)
	{
		return confirm(message);
	},

	error: function(message, width, close, icon)
	{
		var div = document.createElement('div');
		div.style.padding = '20px';

		var img = document.createElement('img');
		img.setAttribute('src', icon || bpmUtils.errorImage);
		img.setAttribute('valign', 'bottom');
		img.style.verticalAlign = 'middle';
		div.appendChild(img);

		div.appendChild(document.createTextNode('\u00a0')); // &nbsp;
		div.appendChild(document.createTextNode('\u00a0')); // &nbsp;
		div.appendChild(document.createTextNode('\u00a0')); // &nbsp;
		bpmUtils.write(div, message);

		var w = document.body.clientWidth;
		var h = (document.body.clientHeight || document.documentElement.clientHeight);
		var warn = new bpmWindow(bpmResources.get(bpmUtils.errorResource) ||
			bpmUtils.errorResource, div, (w-width)/2, h/4, width, null,
			false, true);

		if (close)
		{
			bpmUtils.br(div);
			
			var tmp = document.createElement('p');
			var button = document.createElement('button');

			if (bpmCore.IS_IE)
			{
				button.style.cssText = 'float:right';
			}
			else
			{
				button.setAttribute('style', 'float:right');
			}

			bpmEvent.addListener(button, 'click', function(evt)
			{
				warn.destroy();
			});

			bpmUtils.write(button, bpmResources.get(bpmUtils.closeResource) ||
				bpmUtils.closeResource);
			
			tmp.appendChild(button);
			div.appendChild(tmp);
			
			bpmUtils.br(div);
			
			warn.setClosable(true);
		}
		
		warn.setVisible(true);
		
		return warn;
	},

	makeDraggable: function(element, graphF, funct, dragElement, dx, dy, autoscroll,
			scalePreview, highlightDropTargets, getDropTarget)
	{
		var dragSource = new bpmDragSource(element, funct);
		dragSource.dragOffset = new bpmPoint((dx != null) ? dx : 0,
			(dy != null) ? dy : bpmConstants.TOOLTIP_VERTICAL_OFFSET);
		dragSource.autoscroll = autoscroll;
		
		dragSource.setGuidesEnabled(false);
		
		if (highlightDropTargets != null)
		{
			dragSource.highlightDropTargets = highlightDropTargets;
		}
		
		if (getDropTarget != null)
		{
			dragSource.getDropTarget = getDropTarget;
		}
		
		dragSource.getGraphForEvent = function(evt)
		{
			return (typeof(graphF) == 'function') ? graphF(evt) : graphF;
		};
		
		if (dragElement != null)
		{
			dragSource.createDragElement = function()
			{
				return dragElement.cloneNode(true);
			};
			
			if (scalePreview)
			{
				dragSource.createPreviewElement = function(graph)
				{
					var elt = dragElement.cloneNode(true);

					var w = parseInt(elt.style.width);
					var h = parseInt(elt.style.height);
					elt.style.width = Math.round(w * graph.view.scale) + 'px';
					elt.style.height = Math.round(h * graph.view.scale) + 'px';
					
					return elt;
				};
			}
		}
		
		return dragSource;
	}

};



 var bpmConstants =
 {
	DEFAULT_HOTSPOT: 0.3,
	MIN_HOTSPOT_SIZE: 8,
	MAX_HOTSPOT_SIZE: 0,
	RENDERING_HINT_EXACT: 'exact',
	RENDERING_HINT_FASTER: 'faster',
	RENDERING_HINT_FASTEST: 'fastest',
	DIALECT_SVG: 'svg',
	DIALECT_VML: 'vml',
	DIALECT_MIXEDHTML: 'mixedHtml',
	DIALECT_PREFERHTML: 'preferHtml',
	DIALECT_STRICTHTML: 'strictHtml',
	NS_SVG: 'http://www.w3.org/2000/svg',
	NS_XHTML: 'http://www.w3.org/1999/xhtml',
	NS_XLINK: 'http://www.w3.org/1999/xlink',
	SHADOWCOLOR: 'gray',
	VML_SHADOWCOLOR: 'gray',
	SHADOW_OFFSET_X: 2,
	SHADOW_OFFSET_Y: 3,
	SHADOW_OPACITY: 1,
	NODETYPE_ELEMENT: 1,
	NODETYPE_ATTRIBUTE: 2,
	NODETYPE_TEXT: 3,
	NODETYPE_CDATA: 4,
	NODETYPE_ENTITY_REFERENCE: 5,
	NODETYPE_ENTITY: 6,
	NODETYPE_PROCESSING_INSTRUCTION: 7,
	NODETYPE_COMMENT: 8,
	NODETYPE_DOCUMENT: 9,
	NODETYPE_DOCUMENTTYPE: 10,
	NODETYPE_DOCUMENT_FRAGMENT: 11,
	NODETYPE_NOTATION: 12,
	TOOLTIP_VERTICAL_OFFSET: 16,
	DEFAULT_VALID_COLOR: '#0000FF', // '#00FF00',///////////////////////////////////////////////////////////////////////////////
	DEFAULT_INVALID_COLOR: '#FF0000',
	OUTLINE_HIGHLIGHT_COLOR: '#0000FF', // '#00FF00',
	OUTLINE_HIGHLIGHT_STROKEWIDTH: 5,
	HIGHLIGHT_STROKEWIDTH: 3,
	HIGHLIGHT_SIZE: 2,
	HIGHLIGHT_OPACITY: 100,
	CURSOR_MOVABLE_VERTEX: 'move',
	CURSOR_MOVABLE_EDGE: 'move',
	CURSOR_LABEL_HANDLE: 'default',
	CURSOR_TERMINAL_HANDLE: 'pointer',
	CURSOR_BEND_HANDLE: 'crosshair',
	CURSOR_VIRTUAL_BEND_HANDLE: 'crosshair',
	CURSOR_CONNECT: 'pointer',
	HIGHLIGHT_COLOR: '#0000FF', // '#00FF00',
	CONNECT_TARGET_COLOR: '#0000FF',
	INVALID_CONNECT_TARGET_COLOR: '#FF0000',
	DROP_TARGET_COLOR: '#0000FF',
	VALID_COLOR: '#0000FF', // '#00FF00',
	INVALID_COLOR: '#FF0000',
	EDGE_SELECTION_COLOR: '#0000FF', // '#00FF00',
	VERTEX_SELECTION_COLOR: '#0000FF', // '#00FF00',
	VERTEX_SELECTION_STROKEWIDTH: 1,
	EDGE_SELECTION_STROKEWIDTH: 1,
	VERTEX_SELECTION_DASHED: true,
	EDGE_SELECTION_DASHED: true,
	GUIDE_COLOR: '#FF0000',
	GUIDE_STROKEWIDTH: 1,
	OUTLINE_COLOR: '#0099FF',
	OUTLINE_STROKEWIDTH: (bpmCore.IS_IE) ? 2 : 3,
	HANDLE_SIZE: 6,
	LABEL_HANDLE_SIZE: 4,
	HANDLE_FILLCOLOR: '#0000FF', // '#00FF00',
	HANDLE_STROKECOLOR: 'black',
	LABEL_HANDLE_FILLCOLOR: 'yellow',
	CONNECT_HANDLE_FILLCOLOR: '#0000FF',
	LOCKED_HANDLE_FILLCOLOR: '#FF0000',
	OUTLINE_HANDLE_FILLCOLOR: '#00FFFF',
	OUTLINE_HANDLE_STROKECOLOR: '#0033FF',
	DEFAULT_FONTFAMILY: 'Arial,Helvetica',
	DEFAULT_FONTSIZE: 11,
	DEFAULT_TEXT_DIRECTION: '',
	LINE_HEIGHT: 1.2,
	WORD_WRAP: 'normal',
	ABSOLUTE_LINE_HEIGHT: false,
	DEFAULT_FONTSTYLE: 0,
	DEFAULT_STARTSIZE: 40,
	DEFAULT_MARKERSIZE: 6,
	DEFAULT_IMAGESIZE: 24,
	ENTITY_SEGMENT: 30,
	RECTANGLE_ROUNDING_FACTOR: 0.15,
	LINE_ARCSIZE: 20,
	ARROW_SPACING: 0,
	ARROW_WIDTH: 30,
	ARROW_SIZE: 30,
	PAGE_FORMAT_A4_PORTRAIT: new bpmRectangle(0, 0, 827, 1169),
	PAGE_FORMAT_A4_LANDSCAPE: new bpmRectangle(0, 0, 1169, 827),
	PAGE_FORMAT_LETTER_PORTRAIT: new bpmRectangle(0, 0, 850, 1100),
	PAGE_FORMAT_LETTER_LANDSCAPE: new bpmRectangle(0, 0, 1100, 850),
	NONE: 'none',
	STYLE_PERIMETER: 'perimeter',
	STYLE_SOURCE_PORT: 'sourcePort',
	STYLE_TARGET_PORT: 'targetPort',
	STYLE_PORT_CONSTRAINT: 'portConstraint',
	STYLE_PORT_CONSTRAINT_ROTATION: 'portConstraintRotation',
	STYLE_SOURCE_PORT_CONSTRAINT: 'sourcePortConstraint',
	STYLE_TARGET_PORT_CONSTRAINT: 'targetPortConstraint',
	STYLE_OPACITY: 'opacity',
	STYLE_FILL_OPACITY: 'fillOpacity',
	STYLE_STROKE_OPACITY: 'strokeOpacity',
	STYLE_TEXT_OPACITY: 'textOpacity',
	STYLE_TEXT_DIRECTION: 'textDirection',
	STYLE_OVERFLOW: 'overflow',
	STYLE_ORTHOGONAL: 'orthogonal',
	STYLE_EXIT_X: 'exitX',
	STYLE_EXIT_Y: 'exitY',
	STYLE_EXIT_DX: 'exitDx',
	STYLE_EXIT_DY: 'exitDy',
	STYLE_EXIT_PERIMETER: 'exitPerimeter',
	STYLE_ENTRY_X: 'entryX',
	STYLE_ENTRY_Y: 'entryY',
	STYLE_ENTRY_DX: 'entryDx',
	STYLE_ENTRY_DY: 'entryDy',
	STYLE_ENTRY_PERIMETER: 'entryPerimeter',
	STYLE_WHITE_SPACE: 'whiteSpace',
	STYLE_ROTATION: 'rotation',
	STYLE_FILLCOLOR: 'fillColor',
	STYLE_POINTER_EVENTS: 'pointerEvents',
	STYLE_SWIMLANE_FILLCOLOR: 'swimlaneFillColor',
	STYLE_MARGIN: 'margin',
	STYLE_GRADIENTCOLOR: 'gradientColor',
	STYLE_GRADIENT_DIRECTION: 'gradientDirection',
	STYLE_STROKECOLOR: 'strokeColor',
	STYLE_SEPARATORCOLOR: 'separatorColor',
	STYLE_STROKEWIDTH: 'strokeWidth',
	STYLE_ALIGN: 'align',
	STYLE_VERTICAL_ALIGN: 'verticalAlign',
	STYLE_LABEL_WIDTH: 'labelWidth',
	STYLE_LABEL_POSITION: 'labelPosition',
	STYLE_VERTICAL_LABEL_POSITION: 'verticalLabelPosition',
	STYLE_IMAGE_ASPECT: 'imageAspect',
	STYLE_IMAGE_ALIGN: 'imageAlign',
	STYLE_IMAGE_VERTICAL_ALIGN: 'imageVerticalAlign',
	STYLE_GLASS: 'glass',
	STYLE_IMAGE: 'image',
	STYLE_IMAGE_WIDTH: 'imageWidth',
	STYLE_IMAGE_HEIGHT: 'imageHeight',
	STYLE_IMAGE_BACKGROUND: 'imageBackground',
	STYLE_IMAGE_BORDER: 'imageBorder',
	STYLE_FLIPH: 'flipH',
	STYLE_FLIPV: 'flipV',
	STYLE_NOLABEL: 'noLabel',
	STYLE_NOEDGESTYLE: 'noEdgeStyle',
	STYLE_LABEL_BACKGROUNDCOLOR: 'labelBackgroundColor',
	STYLE_LABEL_BORDERCOLOR: 'labelBorderColor',
	STYLE_LABEL_PADDING: 'labelPadding',
	STYLE_INDICATOR_SHAPE: 'indicatorShape',
	STYLE_INDICATOR_IMAGE: 'indicatorImage',
	STYLE_INDICATOR_COLOR: 'indicatorColor',
	STYLE_INDICATOR_STROKECOLOR: 'indicatorStrokeColor',
	STYLE_INDICATOR_GRADIENTCOLOR: 'indicatorGradientColor',
	STYLE_INDICATOR_SPACING: 'indicatorSpacing',
	STYLE_INDICATOR_WIDTH: 'indicatorWidth',
	STYLE_INDICATOR_HEIGHT: 'indicatorHeight',
	STYLE_INDICATOR_DIRECTION: 'indicatorDirection',
	STYLE_SHADOW: 'shadow',
	STYLE_SEGMENT: 'segment',
	STYLE_ENDARROW: 'endArrow',
	STYLE_STARTARROW: 'startArrow',
	STYLE_ENDSIZE: 'endSize',
	STYLE_STARTSIZE: 'startSize',
	STYLE_SWIMLANE_LINE: 'swimlaneLine',
	STYLE_ENDFILL: 'endFill',
	STYLE_STARTFILL: 'startFill',
	STYLE_DASHED: 'dashed',
	STYLE_DASH_PATTERN: 'dashPattern',
	STYLE_FIX_DASH: 'fixDash',
	STYLE_ROUNDED: 'rounded',
	STYLE_CURVED: 'curved',
	STYLE_ARCSIZE: 'arcSize',
	STYLE_ABSOLUTE_ARCSIZE: 'absoluteArcSize',
	STYLE_SOURCE_PERIMETER_SPACING: 'sourcePerimeterSpacing',
	STYLE_TARGET_PERIMETER_SPACING: 'targetPerimeterSpacing',
	STYLE_PERIMETER_SPACING: 'perimeterSpacing',
	STYLE_SPACING: 'spacing',
	STYLE_SPACING_TOP: 'spacingTop',
	STYLE_SPACING_LEFT: 'spacingLeft',
	STYLE_SPACING_BOTTOM: 'spacingBottom',
	STYLE_SPACING_RIGHT: 'spacingRight',
	STYLE_HORIZONTAL: 'horizontal',
	STYLE_DIRECTION: 'direction',
	STYLE_ANCHOR_POINT_DIRECTION: 'anchorPointDirection',
	STYLE_ELBOW: 'elbow',
	STYLE_FONTCOLOR: 'fontColor',
	STYLE_FONTFAMILY: 'fontFamily',
	STYLE_FONTSIZE: 'fontSize',
	STYLE_FONTSTYLE: 'fontStyle',
	STYLE_ASPECT: 'aspect',
	STYLE_AUTOSIZE: 'autosize',
	STYLE_FOLDABLE: 'foldable',
	STYLE_EDITABLE: 'editable',
	STYLE_BACKGROUND_OUTLINE: 'backgroundOutline',
	STYLE_BENDABLE: 'bendable',
	STYLE_MOVABLE: 'movable',
	STYLE_RESIZABLE: 'resizable',
	STYLE_RESIZE_WIDTH: 'resizeWidth',
	STYLE_RESIZE_HEIGHT: 'resizeHeight',
	STYLE_ROTATABLE: 'rotatable',
	STYLE_CLONEABLE: 'cloneable',
	STYLE_DELETABLE: 'deletable',
	STYLE_SHAPE: 'shape',
	STYLE_EDGE: 'edgeStyle',
	STYLE_JETTY_SIZE: 'jettySize',
	STYLE_SOURCE_JETTY_SIZE: 'sourceJettySize',
	STYLE_TARGET_JETTY_SIZE: 'targetJettySize',
	STYLE_LOOP: 'loopStyle',
	STYLE_ORTHOGONAL_LOOP: 'orthogonalLoop',
	STYLE_ROUTING_CENTER_X: 'routingCenterX',
	STYLE_ROUTING_CENTER_Y: 'routingCenterY',
	FONT_BOLD: 1,
	FONT_ITALIC: 2,
	FONT_UNDERLINE: 4,
	SHAPE_RECTANGLE: 'rectangle',
	SHAPE_ELLIPSE: 'ellipse',
	SHAPE_DOUBLE_ELLIPSE: 'doubleEllipse',
	SHAPE_RHOMBUS: 'rhombus',
	SHAPE_LINE: 'line',
	SHAPE_IMAGE: 'image',
	SHAPE_ARROW: 'arrow',
	SHAPE_ARROW_CONNECTOR: 'arrowConnector',
	SHAPE_LABEL: 'label',
	SHAPE_CYLINDER: 'cylinder',
	SHAPE_SWIMLANE: 'swimlane',
	SHAPE_CONNECTOR: 'connector',
	SHAPE_ACTOR: 'actor',
	SHAPE_CLOUD: 'cloud',
	SHAPE_TRIANGLE: 'triangle',
	SHAPE_HEXAGON: 'hexagon',
	ARROW_CLASSIC: 'classic',
	ARROW_CLASSIC_THIN: 'classicThin',
	ARROW_BLOCK: 'block',
	ARROW_BLOCK_THIN: 'blockThin',
	ARROW_OPEN: 'open',
	ARROW_OPEN_THIN: 'openThin',
	ARROW_OVAL: 'oval',
	ARROW_DIAMOND: 'diamond',
	ARROW_DIAMOND_THIN: 'diamondThin',
	ALIGN_LEFT: 'left',
	ALIGN_CENTER: 'center',
	ALIGN_RIGHT: 'right',
	ALIGN_TOP: 'top',
	ALIGN_MIDDLE: 'middle',
	ALIGN_BOTTOM: 'bottom',
	DIRECTION_NORTH: 'north',
	DIRECTION_SOUTH: 'south',
	DIRECTION_EAST: 'east',
	DIRECTION_WEST: 'west',
	TEXT_DIRECTION_DEFAULT: '',
	TEXT_DIRECTION_AUTO: 'auto',
	TEXT_DIRECTION_LTR: 'ltr',
	TEXT_DIRECTION_RTL: 'rtl',
	DIRECTION_MASK_NONE: 0,
	DIRECTION_MASK_WEST: 1,
	DIRECTION_MASK_NORTH: 2,
	DIRECTION_MASK_SOUTH: 4,
	DIRECTION_MASK_EAST: 8,
	DIRECTION_MASK_ALL: 15,
	ELBOW_VERTICAL: 'vertical',
	ELBOW_HORIZONTAL: 'horizontal',
	EDGESTYLE_ELBOW: 'elbowEdgeStyle',
	EDGESTYLE_ENTITY_RELATION: 'entityRelationEdgeStyle',
	EDGESTYLE_LOOP: 'loopEdgeStyle',
	EDGESTYLE_SIDETOSIDE: 'sideToSideEdgeStyle',
	EDGESTYLE_TOPTOBOTTOM: 'topToBottomEdgeStyle',
	EDGESTYLE_ORTHOGONAL: 'orthogonalEdgeStyle',
	EDGESTYLE_SEGMENT: 'segmentEdgeStyle',
	PERIMETER_ELLIPSE: 'ellipsePerimeter',
	PERIMETER_RECTANGLE: 'rectanglePerimeter',
	PERIMETER_RHOMBUS: 'rhombusPerimeter',
	PERIMETER_HEXAGON: 'hexagonPerimeter',
	PERIMETER_TRIANGLE: 'trianglePerimeter'

};



/* Event Object */
function bpmEventObject(name)
{
	this.name = name;
	this.properties = [];
	
	for (var i = 1; i < arguments.length; i += 2)
	{
		if (arguments[i + 1] != null)
		{
			this.properties[arguments[i]] = arguments[i + 1];
		}
	}
};

bpmEventObject.prototype.name = null;
bpmEventObject.prototype.properties = null;
bpmEventObject.prototype.consumed = false;

bpmEventObject.prototype.getName = function()
{
	return this.name;
};

bpmEventObject.prototype.getProperties = function()
{
	return this.properties;
};

bpmEventObject.prototype.getProperty = function(key)
{
	return this.properties[key];
};

bpmEventObject.prototype.isConsumed = function()
{
	return this.consumed;
};

bpmEventObject.prototype.consume = function()
{
	this.consumed = true;
};



/* Mouse Event */
function bpmMouseEvent(evt, state)
{
	this.evt = evt;
	this.state = state;
	this.sourceState = state;
};

bpmMouseEvent.prototype.consumed = false;
bpmMouseEvent.prototype.evt = null;
bpmMouseEvent.prototype.graphX = null;
bpmMouseEvent.prototype.graphY = null;
bpmMouseEvent.prototype.state = null;
bpmMouseEvent.prototype.sourceState = null;

bpmMouseEvent.prototype.getEvent = function()
{
	return this.evt;
};

bpmMouseEvent.prototype.getSource = function()
{
	return bpmEvent.getSource(this.evt);
};

bpmMouseEvent.prototype.isSource = function(shape)
{
	if (shape != null)
	{
		return bpmUtils.isAncestorNode(shape.node, this.getSource());
	}
	
	return false;
};

bpmMouseEvent.prototype.getX = function()
{
	return bpmEvent.getClientX(this.getEvent());
};

bpmMouseEvent.prototype.getY = function()
{
	return bpmEvent.getClientY(this.getEvent());
};

bpmMouseEvent.prototype.getGraphX = function()
{
	return this.graphX;
};

bpmMouseEvent.prototype.getGraphY = function()
{
	return this.graphY;
};

bpmMouseEvent.prototype.getState = function()
{
	return this.state;
};

bpmMouseEvent.prototype.getCell = function()
{
	var state = this.getState();
	
	if (state != null)
	{
		return state.cell;
	}
	
	return null;
};

bpmMouseEvent.prototype.isPopupTrigger = function()
{
	return bpmEvent.isPopupTrigger(this.getEvent());
};

bpmMouseEvent.prototype.isConsumed = function()
{
	return this.consumed;
};

bpmMouseEvent.prototype.consume = function(preventDefault)
{
	preventDefault = (preventDefault != null) ? preventDefault : bpmEvent.isMouseEvent(this.evt);
	
	if (preventDefault && this.evt.preventDefault)
	{
		this.evt.preventDefault();
	}

	if (bpmCore.IS_IE)
	{
		this.evt.returnValue = true;
	}

	this.consumed = true;
};



/* Event Source */
function bpmEventSource(eventSource)
{
	this.setEventSource(eventSource);
};

bpmEventSource.prototype.eventListeners = null;
bpmEventSource.prototype.eventsEnabled = true;
bpmEventSource.prototype.eventSource = null;

bpmEventSource.prototype.isEventsEnabled = function()
{
	return this.eventsEnabled;
};

bpmEventSource.prototype.setEventsEnabled = function(value)
{
	this.eventsEnabled = value;
};

bpmEventSource.prototype.getEventSource = function()
{
	return this.eventSource;
};

bpmEventSource.prototype.setEventSource = function(value)
{
	this.eventSource = value;
};


bpmEventSource.prototype.addListener = function(name, funct)
{
	if (this.eventListeners == null)
	{
		this.eventListeners = [];
	}
	
	this.eventListeners.push(name);
	this.eventListeners.push(funct);
};

bpmEventSource.prototype.removeListener = function(funct)
{
	if (this.eventListeners != null)
	{
		var i = 0;
		
		while (i < this.eventListeners.length)
		{
			if (this.eventListeners[i+1] == funct)
			{
				this.eventListeners.splice(i, 2);
			}
			else
			{
				i += 2;
			}
		}
	}
};

bpmEventSource.prototype.fireEvent = function(evt, sender)
{
	if (this.eventListeners != null && this.isEventsEnabled())
	{
		if (evt == null)
		{
			evt = new bpmEventObject();
		}
		
		if (sender == null)
		{
			sender = this.getEventSource();
		}

		if (sender == null)
		{
			sender = this;
		}

		var args = [sender, evt];
		
		for (var i = 0; i < this.eventListeners.length; i += 2)
		{
			var listen = this.eventListeners[i];
			
			if (listen == null || listen == evt.getName())
			{
				this.eventListeners[i+1].apply(this, args);
			}
		}
	}
};



var bpmEvent =
{
	addListener: function()
	{
		var updateListenerList = function(element, eventName, funct)
		{
			if (element.bpmListenerList == null)
			{
				element.bpmListenerList = [];
			}
			
			var entry = {name: eventName, f: funct};
			element.bpmListenerList.push(entry);
		};
		
		if (window.addEventListener)
		{
			return function(element, eventName, funct)
			{
				element.addEventListener(eventName, funct, false);
				updateListenerList(element, eventName, funct);
			};
		}
		else
		{
			return function(element, eventName, funct)
			{
				element.attachEvent('on' + eventName, funct);
				updateListenerList(element, eventName, funct);				
			};
		}
	}(),

	removeListener: function()
	{
		var updateListener = function(element, eventName, funct)
		{
			if (element.bpmListenerList != null)
			{
				var listenerCount = element.bpmListenerList.length;
				
				for (var i = 0; i < listenerCount; i++)
				{
					var entry = element.bpmListenerList[i];
					
					if (entry.f == funct)
					{
						element.bpmListenerList.splice(i, 1);
						break;
					}
				}
				
				if (element.bpmListenerList.length == 0)
				{
					element.bpmListenerList = null;
				}
			}
		};
		
		if (window.removeEventListener)
		{
			return function(element, eventName, funct)
			{
				element.removeEventListener(eventName, funct, false);
				updateListener(element, eventName, funct);
			};
		}
		else
		{
			return function(element, eventName, funct)
			{
				element.detachEvent('on' + eventName, funct);
				updateListener(element, eventName, funct);
			};
		}
	}(),

	removeAllListeners: function(element)
	{
		var list = element.bpmListenerList;

		if (list != null)
		{
			while (list.length > 0)
			{
				var entry = list[0];
				bpmEvent.removeListener(element, entry.name, entry.f);
			}
		}
	},
	
	addGestureListeners: function(node, startListener, moveListener, endListener)
	{
		if (startListener != null)
		{
			bpmEvent.addListener(node, (bpmCore.IS_POINTER) ? 'pointerdown' : 'mousedown', startListener);
		}
		
		if (moveListener != null)
		{
			bpmEvent.addListener(node, (bpmCore.IS_POINTER) ? 'pointermove' : 'mousemove', moveListener);
		}
		
		if (endListener != null)
		{
			bpmEvent.addListener(node, (bpmCore.IS_POINTER) ? 'pointerup' : 'mouseup', endListener);
		}
		
		if (!bpmCore.IS_POINTER && bpmCore.IS_TOUCH)
		{
			if (startListener != null)
			{
				bpmEvent.addListener(node, 'touchstart', startListener);
			}
			
			if (moveListener != null)
			{
				bpmEvent.addListener(node, 'touchmove', moveListener);
			}
			
			if (endListener != null)
			{
				bpmEvent.addListener(node, 'touchend', endListener);
			}
		}
	},
	
	removeGestureListeners: function(node, startListener, moveListener, endListener)
	{
		if (startListener != null)
		{
			bpmEvent.removeListener(node, (bpmCore.IS_POINTER) ? 'pointerdown' : 'mousedown', startListener);
		}
		
		if (moveListener != null)
		{
			bpmEvent.removeListener(node, (bpmCore.IS_POINTER) ? 'pointermove' : 'mousemove', moveListener);
		}
		
		if (endListener != null)
		{
			bpmEvent.removeListener(node, (bpmCore.IS_POINTER) ? 'pointerup' : 'mouseup', endListener);
		}
		
		if (!bpmCore.IS_POINTER && bpmCore.IS_TOUCH)
		{
			if (startListener != null)
			{
				bpmEvent.removeListener(node, 'touchstart', startListener);
			}
			
			if (moveListener != null)
			{
				bpmEvent.removeListener(node, 'touchmove', moveListener);
			}
			
			if (endListener != null)
			{
				bpmEvent.removeListener(node, 'touchend', endListener);
			}
		}
	},
	
	redirectMouseEvents: function(node, graph, state, down, move, up, dblClick)
	{
		var getState = function(evt)
		{
			return (typeof(state) == 'function') ? state(evt) : state;
		};
		
		bpmEvent.addGestureListeners(node, function (evt)
		{
			if (down != null)
			{
				down(evt);
			}
			else if (!bpmEvent.isConsumed(evt))
			{
				graph.fireMouseEvent(bpmEvent.MOUSE_DOWN, new bpmMouseEvent(evt, getState(evt)));
			}
		},
		function (evt)
		{
			if (move != null)
			{
				move(evt);
			}
			else if (!bpmEvent.isConsumed(evt))
			{
				graph.fireMouseEvent(bpmEvent.MOUSE_MOVE, new bpmMouseEvent(evt, getState(evt)));
			}
		},
		function (evt)
		{
			if (up != null)
			{
				up(evt);
			}
			else if (!bpmEvent.isConsumed(evt))
			{
				graph.fireMouseEvent(bpmEvent.MOUSE_UP, new bpmMouseEvent(evt, getState(evt)));
			}
		});

		bpmEvent.addListener(node, 'dblclick', function (evt)
		{
			if (dblClick != null)
			{
				dblClick(evt);
			}
			else if (!bpmEvent.isConsumed(evt))
			{
				var tmp = getState(evt);
				graph.dblClick(evt, (tmp != null) ? tmp.cell : null);
			}
		});
	},

	release: function(element)
	{
		try
		{
			if (element != null)
			{
				bpmEvent.removeAllListeners(element);
				
				var children = element.childNodes;
				
				if (children != null)
				{
			        var childCount = children.length;
			        
			        for (var i = 0; i < childCount; i += 1)
			        {
			        	bpmEvent.release(children[i]);
			        }
			    }
			}
		}
		catch (e)
		{
			
		}
	},

	addMouseWheelListener: function(funct, target)
	{
		if (funct != null)
		{
			var wheelHandler = function(evt)
			{
				if (evt == null)
				{
					evt = window.event;
				}
			
				var delta = 0;
				
				if (bpmCore.IS_FF)
				{
					delta = -evt.detail / 2;
				}
				else
				{
					delta = evt.wheelDelta / 120;
				}
				
				if (delta != 0)
				{
					funct(evt, delta > 0);
				}
			};
	
			if (bpmCore.IS_NS && document.documentMode == null)
			{
				var eventName = (bpmCore.IS_SF || bpmCore.IS_GC) ? 'mousewheel' : 'DOMMouseScroll';
				bpmEvent.addListener((bpmCore.IS_GC && target != null) ? target : window,
					eventName, wheelHandler);
			}
			else
			{
				bpmEvent.addListener(document, 'mousewheel', wheelHandler);
			}
		}
	},
	
	disableContextMenu: function(element)
	{
		bpmEvent.addListener(element, 'contextmenu', function(evt)
		{
			if (evt.preventDefault)
			{
				evt.preventDefault();
			}
			
			return false;
		});
	},
	
	getSource: function(evt)
	{
		return (evt.srcElement != null) ? evt.srcElement : evt.target;
	},

	isConsumed: function(evt)
	{
		return evt.isConsumed != null && evt.isConsumed;
	},

	isTouchEvent: function(evt)
	{
		return (evt.pointerType != null) ? (evt.pointerType == 'touch' || evt.pointerType ===
			evt.MSPOINTER_TYPE_TOUCH) : ((evt.mozInputSource != null) ?
					evt.mozInputSource == 5 : evt.type.indexOf('touch') == 0);
	},

	isPenEvent: function(evt)
	{
		return (evt.pointerType != null) ? (evt.pointerType == 'pen' || evt.pointerType ===
			evt.MSPOINTER_TYPE_PEN) : ((evt.mozInputSource != null) ?
					evt.mozInputSource == 2 : evt.type.indexOf('pen') == 0);
	},

	isMultiTouchEvent: function(evt)
	{
		return (evt.type != null && evt.type.indexOf('touch') == 0 && evt.touches != null && evt.touches.length > 1);
	},

	isMouseEvent: function(evt)
	{
		return (evt.pointerType != null) ? (evt.pointerType == 'mouse' || evt.pointerType ===
			evt.MSPOINTER_TYPE_MOUSE) : ((evt.mozInputSource != null) ?
				evt.mozInputSource == 1 : evt.type.indexOf('mouse') == 0);
	},
	
	isLeftMouseButton: function(evt)
	{
		if ('buttons' in evt && (evt.type == 'mousedown' || evt.type == 'mousemove'))
		{
			return evt.buttons == 1;
		}
		else if ('which' in evt)
		{
	        return evt.which === 1;
	    }
		else
		{
	        return evt.button === 1;
	    }
	},
	
	isMiddleMouseButton: function(evt)
	{
		if ('which' in evt)
		{
	        return evt.which === 2;
	    }
		else
		{
	        return evt.button === 4;
	    }
	},
	
	isRightMouseButton: function(evt)
	{
		if ('which' in evt)
		{
	        return evt.which === 3;
	    }
		else
		{
	        return evt.button === 2;
	    }
	},

	isPopupTrigger: function(evt) ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	{
		// return bpmEvent.isRightMouseButton(evt) || (bpmCore.IS_MAC && bpmEvent.isControlDown(evt) &&
		// 	!bpmEvent.isShiftDown(evt) && !bpmEvent.isMetaDown(evt) && !bpmEvent.isAltDown(evt));
	},

	isShiftDown: function(evt)
	{
		return (evt != null) ? evt.shiftKey : false;
	},

	isAltDown: function(evt)
	{
		return (evt != null) ? evt.altKey : false;
	},

	isControlDown: function(evt)
	{
		return (evt != null) ? evt.ctrlKey : false;
	},

	isMetaDown: function(evt)
	{
		return (evt != null) ? evt.metaKey : false;
	},

	getMainEvent: function(e)
	{
		if ((e.type == 'touchstart' || e.type == 'touchmove') && e.touches != null && e.touches[0] != null)
		{
			e = e.touches[0];
		}
		else if (e.type == 'touchend' && e.changedTouches != null && e.changedTouches[0] != null)
		{
			e = e.changedTouches[0];
		}
		
		return e;
	},
	
	getClientX: function(e)
	{
		return bpmEvent.getMainEvent(e).clientX;
	},

	getClientY: function(e)
	{
		return bpmEvent.getMainEvent(e).clientY;
	},

	consume: function(evt, preventDefault, stopPropagation)
	{
		preventDefault = (preventDefault != null) ? preventDefault : true;
		stopPropagation = (stopPropagation != null) ? stopPropagation : true;
		
		if (preventDefault)
		{
			if (evt.preventDefault)
			{
				if (stopPropagation)
				{
					evt.stopPropagation();
				}
				
				evt.preventDefault();
			}
			else if (stopPropagation)
			{
				evt.cancelBubble = true;
			}
		}

		evt.isConsumed = true;

		if (!evt.preventDefault)
		{
			evt.returnValue = false;
		}
	},
	
	LABEL_HANDLE: -1,
	ROTATION_HANDLE: -2,
	CUSTOM_HANDLE: -100,
	VIRTUAL_HANDLE: -100000,
	MOUSE_DOWN: 'mouseDown',
	MOUSE_MOVE: 'mouseMove',
	MOUSE_UP: 'mouseUp',
	ACTIVATE: 'activate',
	RESIZE_START: 'resizeStart',
	RESIZE: 'resize',
	RESIZE_END: 'resizeEnd',
	MOVE_START: 'moveStart',
	MOVE: 'move',
	MOVE_END: 'moveEnd',
	PAN_START: 'panStart',
	PAN: 'pan',
	PAN_END: 'panEnd',
	MINIMIZE: 'minimize',
	NORMALIZE: 'normalize',
	MAXIMIZE: 'maximize',
	HIDE: 'hide',
	SHOW: 'show',
	CLOSE: 'close',
	DESTROY: 'destroy',
	REFRESH: 'refresh',
	SIZE: 'size',
	SELECT: 'select',
	FIRED: 'fired',
	FIRE_MOUSE_EVENT: 'fireMouseEvent',
	GESTURE: 'gesture',
	TAP_AND_HOLD: 'tapAndHold',
	GET: 'get',
	RECEIVE: 'receive',
	CONNECT: 'connect',
	DISCONNECT: 'disconnect',
	SUSPEND: 'suspend',
	RESUME: 'resume',
	MARK: 'mark',
	ROOT: 'root',
	POST: 'post',
	OPEN: 'open',
	SAVE: 'save',
	BEFORE_ADD_VERTEX: 'beforeAddVertex',
	ADD_VERTEX: 'addVertex',
	AFTER_ADD_VERTEX: 'afterAddVertex',
	DONE: 'done',
	EXECUTE: 'execute',
	EXECUTED: 'executed',
	BEGIN_UPDATE: 'beginUpdate',
	START_EDIT: 'startEdit',
	END_UPDATE: 'endUpdate',
	END_EDIT: 'endEdit',
	BEFORE_UNDO: 'beforeUndo',
	UNDO: 'undo',
	REDO: 'redo',
	CHANGE: 'change',
	NOTIFY: 'notify',
	LAYOUT_CELLS: 'layoutCells',
	CLICK: 'click',
	SCALE: 'scale',
	TRANSLATE: 'translate',
	SCALE_AND_TRANSLATE: 'scaleAndTranslate',
	UP: 'up',
	DOWN: 'down',
	ADD: 'add',
	REMOVE: 'remove',
	CLEAR: 'clear',
	ADD_CELLS: 'addCells',
	CELLS_ADDED: 'cellsAdded',
	MOVE_CELLS: 'moveCells',
	CELLS_MOVED: 'cellsMoved',
	RESIZE_CELLS: 'resizeCells',
	CELLS_RESIZED: 'cellsResized',
	TOGGLE_CELLS: 'toggleCells',
	CELLS_TOGGLED: 'cellsToggled',
	ORDER_CELLS: 'orderCells',
	CELLS_ORDERED: 'cellsOrdered',
	REMOVE_CELLS: 'removeCells',
	CELLS_REMOVED: 'cellsRemoved',
	GROUP_CELLS: 'groupCells',
	UNGROUP_CELLS: 'ungroupCells',
	REMOVE_CELLS_FROM_PARENT: 'removeCellsFromParent',
	FOLD_CELLS: 'foldCells',
	CELLS_FOLDED: 'cellsFolded',
	ALIGN_CELLS: 'alignCells',
	LABEL_CHANGED: 'labelChanged',
	CONNECT_CELL: 'connectCell',
	CELL_CONNECTED: 'cellConnected',
	SPLIT_EDGE: 'splitEdge',
	FLIP_EDGE: 'flipEdge',
	START_EDITING: 'startEditing',
	EDITING_STARTED: 'editingStarted',
	EDITING_STOPPED: 'editingStopped',
	ADD_OVERLAY: 'addOverlay',
	REMOVE_OVERLAY: 'removeOverlay',
	UPDATE_CELL_SIZE: 'updateCellSize',
	ESCAPE: 'escape',
	DOUBLE_CLICK: 'doubleClick',
	START: 'start',
	RESET: 'reset'

};



/* Xml Request */
function bpmXmlRequest(url, params, method, async, username, password)
{
	this.url = url;
	this.params = params;
	this.method = method || 'POST';
	this.async = (async != null) ? async : true;
	this.username = username;
	this.password = password;
};

bpmXmlRequest.prototype.url = null;
bpmXmlRequest.prototype.params = null;
bpmXmlRequest.prototype.method = null;
bpmXmlRequest.prototype.async = null;
bpmXmlRequest.prototype.binary = false;
bpmXmlRequest.prototype.withCredentials = false;
bpmXmlRequest.prototype.username = null;
bpmXmlRequest.prototype.password = null;
bpmXmlRequest.prototype.request = null;
bpmXmlRequest.prototype.decodeSimulateValues = false;

bpmXmlRequest.prototype.isBinary = function()
{
	return this.binary;
};

bpmXmlRequest.prototype.setBinary = function(value)
{
	this.binary = value;
};

bpmXmlRequest.prototype.getText = function()
{
	return this.request.responseText;
};

bpmXmlRequest.prototype.isReady = function()
{
	return this.request.readyState == 4;
};

bpmXmlRequest.prototype.getDocumentElement = function()
{
	var doc = this.getXml();
	
	if (doc != null)
	{
		return doc.documentElement;
	}
	
	return null;
};

bpmXmlRequest.prototype.getXml = function()
{
	var xml = this.request.responseXML;
	
	if (document.documentMode >= 9 || xml == null || xml.documentElement == null)
	{
		xml = bpmUtils.parseXml(this.request.responseText);
	}
	
	return xml;
};

bpmXmlRequest.prototype.getText = function()
{
	return this.request.responseText;
};

bpmXmlRequest.prototype.getStatus = function()
{
	return this.request.status;
};

bpmXmlRequest.prototype.create = function()
{
	if (window.XMLHttpRequest)
	{
		return function()
		{
			var req = new XMLHttpRequest();
			
			if (this.isBinary() && req.overrideMimeType)
			{
				req.overrideMimeType('text/plain; charset=x-user-defined');
			}

			return req;
		};
	}
	else if (typeof(ActiveXObject) != 'undefined')
	{
		return function()
		{
			return new ActiveXObject('Microsoft.XMLHTTP');
		};
	}
}();

bpmXmlRequest.prototype.send = function(onload, onerror, timeout, ontimeout)
{
	this.request = this.create();
	
	if (this.request != null)
	{
		if (onload != null)
		{
			this.request.onreadystatechange = bpmUtils.bind(this, function()
			{
				if (this.isReady())
				{
					onload(this);
					this.request.onreadystatechaange = null;
				}
			});
		}

		this.request.open(this.method, this.url, this.async,
			this.username, this.password);
		this.setRequestHeaders(this.request, this.params);
		
		if (window.XMLHttpRequest && this.withCredentials)
		{
			this.request.withCredentials = 'true';
		}
		
		if (!bpmCore.IS_QUIRKS && (document.documentMode == null || document.documentMode > 9) &&
			window.XMLHttpRequest && timeout != null && ontimeout != null)
		{
			this.request.timeout = timeout;
			this.request.ontimeout = ontimeout;
		}
				
		this.request.send(this.params);
	}
};

bpmXmlRequest.prototype.setRequestHeaders = function(request, params)
{
	if (params != null)
	{
		request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	}
};

bpmXmlRequest.prototype.simulate = function(doc, target)
{
	doc = doc || document;
	var old = null;

	if (doc == document)
	{
		old = window.onbeforeunload;		
		window.onbeforeunload = null;
	}
			
	var form = doc.createElement('form');
	form.setAttribute('method', this.method);
	form.setAttribute('action', this.url);

	if (target != null)
	{
		form.setAttribute('target', target);
	}

	form.style.display = 'none';
	form.style.visibility = 'hidden';
	
	var pars = (this.params.indexOf('&') > 0) ?
		this.params.split('&') :
		this.params.split();
	
	for (var i=0; i<pars.length; i++)
	{
		var pos = pars[i].indexOf('=');
		
		if (pos > 0)
		{
			var name = pars[i].substring(0, pos);
			var value = pars[i].substring(pos+1);
			
			if (this.decodeSimulateValues)
			{
				value = decodeURIComponent(value);
			}
			
			var textarea = doc.createElement('textarea');
			textarea.setAttribute('wrap', 'off');
			textarea.setAttribute('name', name);
			bpmUtils.write(textarea, value);
			form.appendChild(textarea);
		}
	}
	
	doc.body.appendChild(form);
	form.submit();
	
	if (form.parentNode != null)
	{
		form.parentNode.removeChild(form);
	}

	if (old != null)
	{		
		window.onbeforeunload = old;
	}
};



var bpmClipboard =
{
	STEPSIZE: 10,
	insertCount: 1,
	cells: null,

	setCells: function(cells)
	{
		bpmClipboard.cells = cells;
	},

	getCells: function()
	{
		return bpmClipboard.cells;
	},
	
	isEmpty: function()
	{
		return bpmClipboard.getCells() == null;
	},
	
	cut: function(graph, cells)
	{
		cells = bpmClipboard.copy(graph, cells);
		bpmClipboard.insertCount = 0;
		bpmClipboard.removeCells(graph, cells);
		
		return cells;
	},

	removeCells: function(graph, cells)
	{
		graph.removeCells(cells);
	},

	copy: function(graph, cells)
	{
		cells = cells || graph.getSelectionCells();
		var result = graph.getExportableCells(graph.model.getTopmostCells(cells));
		bpmClipboard.insertCount = 1;
		bpmClipboard.setCells(graph.cloneCells(result));

		return result;
	},

	paste: function(graph)
	{
		var cells = null;
		
		if (!bpmClipboard.isEmpty())
		{
			cells = graph.getImportableCells(bpmClipboard.getCells());
			var delta = bpmClipboard.insertCount * bpmClipboard.STEPSIZE;
			var parent = graph.getDefaultParent();
			cells = graph.importCells(cells, delta, delta, parent);
			
			bpmClipboard.insertCount++;
			graph.setSelectionCells(cells);
		}
		
		return cells;
	}

};



/* Window */
function bpmWindow(title, content, x, y, width, height, minimizable, movable, replaceNode, style)
{
	if (content != null)
	{
		minimizable = (minimizable != null) ? minimizable : true;
		this.content = content;
		this.init(x, y, width, height, style);
		
		this.installMaximizeHandler();
		this.installMinimizeHandler();
		this.installCloseHandler();
		this.setMinimizable(minimizable);
		this.setTitle(title);
		
		if (movable == null || movable)
		{
			this.installMoveHandler();
		}

		if (replaceNode != null && replaceNode.parentNode != null)
		{
			replaceNode.parentNode.replaceChild(this.div, replaceNode);
		}
		else
		{
			document.body.appendChild(this.div);
		}
	}
};

bpmWindow.prototype = new bpmEventSource();
bpmWindow.prototype.constructor = bpmWindow;
bpmWindow.prototype.closeImage = bpmCore.imageBasePath + '/close.gif';
bpmWindow.prototype.minimizeImage = bpmCore.imageBasePath + '/minimize.gif';
bpmWindow.prototype.normalizeImage = bpmCore.imageBasePath + '/normalize.gif';
bpmWindow.prototype.maximizeImage = bpmCore.imageBasePath + '/maximize.gif';
bpmWindow.prototype.resizeImage = bpmCore.imageBasePath + '/resize.gif';
bpmWindow.prototype.visible = false;
bpmWindow.prototype.minimumSize = new bpmRectangle(0, 0, 50, 40);
bpmWindow.prototype.destroyOnClose = true;
bpmWindow.prototype.contentHeightCorrection = (document.documentMode == 8 || document.documentMode == 7) ? 6 : 2;
bpmWindow.prototype.title = null;
bpmWindow.prototype.content = null;

bpmWindow.prototype.init = function(x, y, width, height, style)
{
	style = (style != null) ? style : 'bpmWindow';
	
	this.div = document.createElement('div');
	this.div.className = style;

	this.div.style.left = x + 'px';
	this.div.style.top = y + 'px';
	this.table = document.createElement('table');
	this.table.className = style;

	if (bpmCore.IS_POINTER)
	{
		this.div.style.touchAction = 'none';
	}
	
	if (width != null)
	{
		if (!bpmCore.IS_QUIRKS)
		{
			this.div.style.width = width + 'px'; 
		}
		
		this.table.style.width = width + 'px';
	} 
	
	if (height != null)
	{
		if (!bpmCore.IS_QUIRKS)
		{
			this.div.style.height = height + 'px';
		}
		
		this.table.style.height = height + 'px';
	}		
	
	var tbody = document.createElement('tbody');
	var tr = document.createElement('tr');
	
	this.title = document.createElement('td');
	this.title.className = style + 'Title';
	
	this.buttons = document.createElement('div');
	this.buttons.style.position = 'absolute';
	this.buttons.style.display = 'inline-block';
	this.buttons.style.right = '4px';
	this.buttons.style.top = '5px';
	this.title.appendChild(this.buttons);
	
	tr.appendChild(this.title);
	tbody.appendChild(tr);
	
	tr = document.createElement('tr');
	this.td = document.createElement('td');
	this.td.className = style + 'Pane';
	
	if (document.documentMode == 7)
	{
		this.td.style.height = '100%';
	}

	this.contentWrapper = document.createElement('div');
	this.contentWrapper.className = style + 'Pane';
	this.contentWrapper.style.width = '100%';
	this.contentWrapper.appendChild(this.content);

	if (bpmCore.IS_QUIRKS || this.content.nodeName.toUpperCase() != 'DIV')
	{
		this.contentWrapper.style.height = '100%';
	}

	this.td.appendChild(this.contentWrapper);
	tr.appendChild(this.td);
	tbody.appendChild(tr);
	this.table.appendChild(tbody);
	this.div.appendChild(this.table);
	
	var activator = bpmUtils.bind(this, function(evt)
	{
		this.activate();
	});
	
	bpmEvent.addGestureListeners(this.title, activator);
	bpmEvent.addGestureListeners(this.table, activator);

	this.hide();
};

bpmWindow.prototype.setTitle = function(title)
{
	var child = this.title.firstChild;
	
	while (child != null)
	{
		var next = child.nextSibling;
		
		if (child.nodeType == bpmConstants.NODETYPE_TEXT)
		{
			child.parentNode.removeChild(child);
		}
		
		child = next;
	}
	
	bpmUtils.write(this.title, title || '');
	this.title.appendChild(this.buttons);
};

bpmWindow.prototype.setScrollable = function(scrollable)
{
	if (navigator.userAgent.indexOf('Presto/2.5') < 0)
	{
		if (scrollable)
		{
			this.contentWrapper.style.overflow = 'auto';
		}
		else
		{
			this.contentWrapper.style.overflow = 'hidden';
		}
	}
};

bpmWindow.prototype.activate = function()
{
	if (bpmWindow.activeWindow != this)
	{
		var style = bpmUtils.getCurrentStyle(this.getElement());
		var index = (style != null) ? style.zIndex : 3;

		if (bpmWindow.activeWindow)
		{
			var elt = bpmWindow.activeWindow.getElement();
			
			if (elt != null && elt.style != null)
			{
				elt.style.zIndex = index;
			}
		}
		
		var previousWindow = bpmWindow.activeWindow;
		this.getElement().style.zIndex = parseInt(index) + 1;
		bpmWindow.activeWindow = this;
		
		this.fireEvent(new bpmEventObject(bpmEvent.ACTIVATE, 'previousWindow', previousWindow));
	}
};

bpmWindow.prototype.getElement = function()
{
	return this.div;
};

bpmWindow.prototype.fit = function()
{
	bpmUtils.fit(this.div);
};

bpmWindow.prototype.isResizable = function()
{
	if (this.resize != null)
	{
		return this.resize.style.display != 'none';
	}
	
	return false;
};

bpmWindow.prototype.setResizable = function(resizable)
{
	if (resizable)
	{
		if (this.resize == null)
		{
			this.resize = document.createElement('img');
			this.resize.style.position = 'absolute';
			this.resize.style.bottom = '2px';
			this.resize.style.right = '2px';

			this.resize.setAttribute('src', this.resizeImage);
			this.resize.style.cursor = 'nw-resize';
			
			var startX = null;
			var startY = null;
			var width = null;
			var height = null;
			
			var start = bpmUtils.bind(this, function(evt)
			{
				this.activate();
				startX = bpmEvent.getClientX(evt);
				startY = bpmEvent.getClientY(evt);
				width = this.div.offsetWidth;
				height = this.div.offsetHeight;
				
				bpmEvent.addGestureListeners(document, null, dragHandler, dropHandler);
				this.fireEvent(new bpmEventObject(bpmEvent.RESIZE_START, 'event', evt));
				bpmEvent.consume(evt);
			});

			var dragHandler = bpmUtils.bind(this, function(evt)
			{
				if (startX != null && startY != null)
				{
					var dx = bpmEvent.getClientX(evt) - startX;
					var dy = bpmEvent.getClientY(evt) - startY;
	
					this.setSize(width + dx, height + dy);
	
					this.fireEvent(new bpmEventObject(bpmEvent.RESIZE, 'event', evt));
					bpmEvent.consume(evt);
				}
			});
			
			var dropHandler = bpmUtils.bind(this, function(evt)
			{
				if (startX != null && startY != null)
				{
					startX = null;
					startY = null;
					bpmEvent.removeGestureListeners(document, null, dragHandler, dropHandler);
					this.fireEvent(new bpmEventObject(bpmEvent.RESIZE_END, 'event', evt));
					bpmEvent.consume(evt);
				}
			});
			
			bpmEvent.addGestureListeners(this.resize, start, dragHandler, dropHandler);
			this.div.appendChild(this.resize);
		}
		else 
		{
			this.resize.style.display = 'inline';
		}
	}
	else if (this.resize != null)
	{
		this.resize.style.display = 'none';
	}
};
	
bpmWindow.prototype.setSize = function(width, height)
{
	width = Math.max(this.minimumSize.width, width);
	height = Math.max(this.minimumSize.height, height);

	// Workaround for table size problems in FF
	if (!bpmCore.IS_QUIRKS)
	{
		this.div.style.width =  width + 'px';
		this.div.style.height = height + 'px';
	}
	
	this.table.style.width =  width + 'px';
	this.table.style.height = height + 'px';

	if (!bpmCore.IS_QUIRKS)
	{
		this.contentWrapper.style.height = (this.div.offsetHeight -
			this.title.offsetHeight - this.contentHeightCorrection) + 'px';
	}
};
	
bpmWindow.prototype.setMinimizable = function(minimizable)
{
	this.minimize.style.display = (minimizable) ? '' : 'none';
};

bpmWindow.prototype.getMinimumSize = function()
{
	return new bpmRectangle(0, 0, 0, this.title.offsetHeight);
};

bpmWindow.prototype.installMinimizeHandler = function()
{
	this.minimize = document.createElement('img');
	
	this.minimize.setAttribute('src', this.minimizeImage);
	this.minimize.setAttribute('title', 'Minimize');
	this.minimize.style.cursor = 'pointer';
	this.minimize.style.marginLeft = '2px';
	this.minimize.style.display = 'none';
	
	this.buttons.appendChild(this.minimize);
	
	var minimized = false;
	var maxDisplay = null;
	var height = null;

	var funct = bpmUtils.bind(this, function(evt)
	{
		this.activate();
		
		if (!minimized)
		{
			minimized = true;
			
			this.minimize.setAttribute('src', this.normalizeImage);
			this.minimize.setAttribute('title', 'Normalize');
			this.contentWrapper.style.display = 'none';
			maxDisplay = this.maximize.style.display;
			
			this.maximize.style.display = 'none';
			height = this.table.style.height;
			
			var minSize = this.getMinimumSize();
			
			if (minSize.height > 0)
			{
				if (!bpmCore.IS_QUIRKS)
				{
					this.div.style.height = minSize.height + 'px';
				}
				
				this.table.style.height = minSize.height + 'px';
			}
			
			if (minSize.width > 0)
			{
				if (!bpmCore.IS_QUIRKS)
				{
					this.div.style.width = minSize.width + 'px';
				}
				
				this.table.style.width = minSize.width + 'px';
			}
			
			if (this.resize != null)
			{
				this.resize.style.visibility = 'hidden';
			}
			
			this.fireEvent(new bpmEventObject(bpmEvent.MINIMIZE, 'event', evt));
		}
		else
		{
			minimized = false;
			
			this.minimize.setAttribute('src', this.minimizeImage);
			this.minimize.setAttribute('title', 'Minimize');
			this.contentWrapper.style.display = ''; // default
			this.maximize.style.display = maxDisplay;
			
			if (!bpmCore.IS_QUIRKS)
			{
				this.div.style.height = height;
			}
			
			this.table.style.height = height;

			if (this.resize != null)
			{
				this.resize.style.visibility = '';
			}
			
			this.fireEvent(new bpmEventObject(bpmEvent.NORMALIZE, 'event', evt));
		}
		
		bpmEvent.consume(evt);
	});
	
	bpmEvent.addGestureListeners(this.minimize, funct);
};
	
bpmWindow.prototype.setMaximizable = function(maximizable)
{
	this.maximize.style.display = (maximizable) ? '' : 'none';
};

bpmWindow.prototype.installMaximizeHandler = function()
{
	this.maximize = document.createElement('img');
	
	this.maximize.setAttribute('src', this.maximizeImage);
	this.maximize.setAttribute('title', 'Maximize');
	this.maximize.style.cursor = 'default';
	this.maximize.style.marginLeft = '2px';
	this.maximize.style.cursor = 'pointer';
	this.maximize.style.display = 'none';
	
	this.buttons.appendChild(this.maximize);
	
	var maximized = false;
	var x = null;
	var y = null;
	var height = null;
	var width = null;
	var minDisplay = null;

	var funct = bpmUtils.bind(this, function(evt)
	{
		this.activate();
		
		if (this.maximize.style.display != 'none')
		{
			if (!maximized)
			{
				maximized = true;
				
				this.maximize.setAttribute('src', this.normalizeImage);
				this.maximize.setAttribute('title', 'Normalize');
				this.contentWrapper.style.display = '';
				minDisplay = this.minimize.style.display;
				this.minimize.style.display = 'none';
				
				// Saves window state
				x = parseInt(this.div.style.left);
				y = parseInt(this.div.style.top);
				height = this.table.style.height;
				width = this.table.style.width;

				this.div.style.left = '0px';
				this.div.style.top = '0px';
				var docHeight = Math.max(document.body.clientHeight || 0, document.documentElement.clientHeight || 0);

				if (!bpmCore.IS_QUIRKS)
				{
					this.div.style.width = (document.body.clientWidth - 2) + 'px';
					this.div.style.height = (docHeight - 2) + 'px';
				}

				this.table.style.width = (document.body.clientWidth - 2) + 'px';
				this.table.style.height = (docHeight - 2) + 'px';
				
				if (this.resize != null)
				{
					this.resize.style.visibility = 'hidden';
				}

				if (!bpmCore.IS_QUIRKS)
				{
					var style = bpmUtils.getCurrentStyle(this.contentWrapper);
		
					if (style.overflow == 'auto' || this.resize != null)
					{
						this.contentWrapper.style.height = (this.div.offsetHeight -
							this.title.offsetHeight - this.contentHeightCorrection) + 'px';
					}
				}

				this.fireEvent(new bpmEventObject(bpmEvent.MAXIMIZE, 'event', evt));
			}
			else
			{
				maximized = false;
				
				this.maximize.setAttribute('src', this.maximizeImage);
				this.maximize.setAttribute('title', 'Maximize');
				this.contentWrapper.style.display = '';
				this.minimize.style.display = minDisplay;

				// Restores window state
				this.div.style.left = x+'px';
				this.div.style.top = y+'px';
				
				if (!bpmCore.IS_QUIRKS)
				{
					this.div.style.height = height;
					this.div.style.width = width;

					var style = bpmUtils.getCurrentStyle(this.contentWrapper);
		
					if (style.overflow == 'auto' || this.resize != null)
					{
						this.contentWrapper.style.height = (this.div.offsetHeight -
							this.title.offsetHeight - this.contentHeightCorrection) + 'px';
					}
				}
				
				this.table.style.height = height;
				this.table.style.width = width;

				if (this.resize != null)
				{
					this.resize.style.visibility = '';
				}
				
				this.fireEvent(new bpmEventObject(bpmEvent.NORMALIZE, 'event', evt));
			}
			
			bpmEvent.consume(evt);
		}
	});
	
	bpmEvent.addGestureListeners(this.maximize, funct);
	bpmEvent.addListener(this.title, 'dblclick', funct);
};
	
bpmWindow.prototype.installMoveHandler = function()
{
	this.title.style.cursor = 'move';
	
	bpmEvent.addGestureListeners(this.title,
		bpmUtils.bind(this, function(evt)
		{
			var startX = bpmEvent.getClientX(evt);
			var startY = bpmEvent.getClientY(evt);
			var x = this.getX();
			var y = this.getY();

			var dragHandler = bpmUtils.bind(this, function(evt)
			{
				var dx = bpmEvent.getClientX(evt) - startX;
				var dy = bpmEvent.getClientY(evt) - startY;
				this.setLocation(x + dx, y + dy);
				this.fireEvent(new bpmEventObject(bpmEvent.MOVE, 'event', evt));
				bpmEvent.consume(evt);
			});
			
			var dropHandler = bpmUtils.bind(this, function(evt)
			{
				bpmEvent.removeGestureListeners(document, null, dragHandler, dropHandler);
				this.fireEvent(new bpmEventObject(bpmEvent.MOVE_END, 'event', evt));
				bpmEvent.consume(evt);
			});
			
			bpmEvent.addGestureListeners(document, null, dragHandler, dropHandler);
			this.fireEvent(new bpmEventObject(bpmEvent.MOVE_START, 'event', evt));
			bpmEvent.consume(evt);
		}));
	
	if (bpmCore.IS_POINTER)
	{
		this.title.style.touchAction = 'none';
	}
};

 bpmWindow.prototype.setLocation = function(x, y)
 {
	this.div.style.left = x + 'px';
	this.div.style.top = y + 'px';
 };

bpmWindow.prototype.getX = function()
{
	return parseInt(this.div.style.left);
};

bpmWindow.prototype.getY = function()
{
	return parseInt(this.div.style.top);
};

bpmWindow.prototype.installCloseHandler = function()
{
	this.closeImg = document.createElement('img');
	
	this.closeImg.setAttribute('src', this.closeImage);
	this.closeImg.setAttribute('title', 'Close');
	this.closeImg.style.marginLeft = '2px';
	this.closeImg.style.cursor = 'pointer';
	this.closeImg.style.display = 'none';
	
	this.buttons.appendChild(this.closeImg);

	bpmEvent.addGestureListeners(this.closeImg,
		bpmUtils.bind(this, function(evt)
		{
			this.fireEvent(new bpmEventObject(bpmEvent.CLOSE, 'event', evt));
			
			if (this.destroyOnClose)
			{
				this.destroy();
			}
			else
			{
				this.setVisible(false);
			}
			
			bpmEvent.consume(evt);
		}));
};

bpmWindow.prototype.setImage = function(image)
{
	this.image = document.createElement('img');
	this.image.setAttribute('src', image);
	this.image.setAttribute('align', 'left');
	this.image.style.marginRight = '4px';
	this.image.style.marginLeft = '0px';
	this.image.style.marginTop = '-2px';
	
	this.title.insertBefore(this.image, this.title.firstChild);
};

bpmWindow.prototype.setClosable = function(closable)
{
	this.closeImg.style.display = (closable) ? '' : 'none';
};

bpmWindow.prototype.isVisible = function()
{
	if (this.div != null)
	{
		return this.div.style.display != 'none';
	}
	
	return false;
};

bpmWindow.prototype.setVisible = function(visible)
{
	if (this.div != null && this.isVisible() != visible)
	{
		if (visible)
		{
			this.show();
		}
		else
		{
			this.hide();
		}
	}
};

bpmWindow.prototype.show = function()
{
	this.div.style.display = '';
	this.activate();
	
	var style = bpmUtils.getCurrentStyle(this.contentWrapper);
	
	if (!bpmCore.IS_QUIRKS && (style.overflow == 'auto' || this.resize != null) &&
		this.contentWrapper.style.display != 'none')
	{
		this.contentWrapper.style.height = (this.div.offsetHeight -
				this.title.offsetHeight - this.contentHeightCorrection) + 'px';
	}
	
	this.fireEvent(new bpmEventObject(bpmEvent.SHOW));
};

bpmWindow.prototype.hide = function()
{
	this.div.style.display = 'none';
	this.fireEvent(new bpmEventObject(bpmEvent.HIDE));
};

bpmWindow.prototype.destroy = function()
{
	this.fireEvent(new bpmEventObject(bpmEvent.DESTROY));
	
	if (this.div != null)
	{
		bpmEvent.release(this.div);
		this.div.parentNode.removeChild(this.div);
		this.div = null;
	}
	
	this.title = null;
	this.content = null;
	this.contentWrapper = null;
};



/* Form */
function bpmForm(className)
{
	this.table = document.createElement('table');
	this.table.className = className;
	this.body = document.createElement('tbody');
	
	this.table.appendChild(this.body);
};

bpmForm.prototype.table = null;
bpmForm.prototype.body = false;

bpmForm.prototype.getTable = function()
{
	return this.table;
};

bpmForm.prototype.addButtons = function(okFunct, cancelFunct)
{
	var tr = document.createElement('tr');
	var td = document.createElement('td');
	tr.appendChild(td);
	td = document.createElement('td');

	var button = document.createElement('button');
	bpmUtils.write(button, bpmResources.get('ok') || 'OK');
	td.appendChild(button);

	bpmEvent.addListener(button, 'click', function()
	{
		okFunct();
	});
	
	button = document.createElement('button');
	bpmUtils.write(button, bpmResources.get('cancel') || 'Cancel');
	td.appendChild(button);
	
	bpmEvent.addListener(button, 'click', function()
	{
		cancelFunct();
	});
	
	tr.appendChild(td);
	this.body.appendChild(tr);
};

bpmForm.prototype.addText = function(name, value, type)
{
	var input = document.createElement('input');
	
	input.setAttribute('type', type || 'text');
	input.value = value;
	
	return this.addField(name, input);
};

bpmForm.prototype.addCheckbox = function(name, value)
{
	var input = document.createElement('input');
	
	input.setAttribute('type', 'checkbox');
	this.addField(name, input);

	if (value)
	{
		input.checked = true;
	}

	return input;
};

bpmForm.prototype.addTextarea = function(name, value, rows)
{
	var input = document.createElement('textarea');
	
	if (bpmCore.IS_NS)
	{
		rows--;
	}
	
	input.setAttribute('rows', rows || 2);
	input.value = value;
	
	return this.addField(name, input);
};

bpmForm.prototype.addCombo = function(name, isMultiSelect, size)
{
	var select = document.createElement('select');
	
	if (size != null)
	{
		select.setAttribute('size', size);
	}
	
	if (isMultiSelect)
	{
		select.setAttribute('multiple', 'true');
	}
	
	return this.addField(name, select);
};

bpmForm.prototype.addOption = function(combo, label, value, isSelected)
{
	var option = document.createElement('option');
	
	bpmUtils.writeln(option, label);
	option.setAttribute('value', value);
	
	if (isSelected)
	{
		option.setAttribute('selected', isSelected);
	}
	
	combo.appendChild(option);
};

bpmForm.prototype.addField = function(name, input)
{
	var tr = document.createElement('tr');
	var td = document.createElement('td');
	bpmUtils.write(td, name);
	tr.appendChild(td);
	
	td = document.createElement('td');
	td.appendChild(input);
	tr.appendChild(td);
	this.body.appendChild(tr);
	
	return input;
};

bpmForm.prototype.addLabel = function(name)
{
	var tr = document.createElement('tr');
	var td = document.createElement('td');
	bpmUtils.write(td, name);
	tr.appendChild(td);

	td = document.createElement('td');
	tr.appendChild(td);
	this.body.appendChild(tr);
	return td;
};


/* Image */
function bpmImage(src, width, height)
{
	this.src = src;
	this.width = width;
	this.height = height;
};

bpmImage.prototype.src = null;

bpmImage.prototype.width = null;

bpmImage.prototype.height = null;



/* Div Resizer */
function bpmDivResizer(div, container)
{
	if (div.nodeName.toLowerCase() == 'div')
	{
		if (container == null)
		{
			container = window;
		}

		this.div = div;
		var style = bpmUtils.getCurrentStyle(div);
		
		if (style != null)
		{
			this.resizeWidth = style.width == 'auto';
			this.resizeHeight = style.height == 'auto';
		}
		
		bpmEvent.addListener(container, 'resize',
			bpmUtils.bind(this, function(evt)
			{
				if (!this.handlingResize)
				{
					this.handlingResize = true;
					this.resize();
					this.handlingResize = false;
				}
			})
		);
		
		this.resize();
	}
};

bpmDivResizer.prototype.resizeWidth = true;
bpmDivResizer.prototype.resizeHeight = true;
bpmDivResizer.prototype.handlingResize = false;

bpmDivResizer.prototype.resize = function()
{
	var w = this.getDocumentWidth();
	var h = this.getDocumentHeight();

	var l = parseInt(this.div.style.left);
	var r = parseInt(this.div.style.right);
	var t = parseInt(this.div.style.top);
	var b = parseInt(this.div.style.bottom);
	
	if (this.resizeWidth &&
		!isNaN(l) &&
		!isNaN(r) &&
		l >= 0 &&
		r >= 0 &&
		w - r - l > 0)
	{
		this.div.style.width = (w - r - l)+'px';
	}
	
	if (this.resizeHeight &&
		!isNaN(t) &&
		!isNaN(b) &&
		t >= 0 &&
		b >= 0 &&
		h - t - b > 0)
	{
		this.div.style.height = (h - t - b)+'px';
	}
};

bpmDivResizer.prototype.getDocumentWidth = function()
{
	return document.body.clientWidth;
};

bpmDivResizer.prototype.getDocumentHeight = function()
{
	return document.body.clientHeight;
};



/* Drag Source */
function bpmDragSource(element, dropHandler)
{
	this.element = element;
	this.dropHandler = dropHandler;
	
	bpmEvent.addGestureListeners(element, bpmUtils.bind(this, function(evt)
	{
		this.mouseDown(evt);
	}));
	
	bpmEvent.addListener(element, 'dragstart', function(evt)
	{
		bpmEvent.consume(evt);
	});
	
	this.eventConsumer = function(sender, evt)
	{
		var evtName = evt.getProperty('eventName');
		var me = evt.getProperty('event');
		
		if (evtName != bpmEvent.MOUSE_DOWN)
		{
			me.consume();
		}
	};
};

bpmDragSource.prototype.element = null;
bpmDragSource.prototype.dropHandler = null;
bpmDragSource.prototype.dragOffset = null;
bpmDragSource.prototype.dragElement = null;
bpmDragSource.prototype.previewElement = null;
bpmDragSource.prototype.enabled = true;
bpmDragSource.prototype.currentGraph = null;
bpmDragSource.prototype.currentDropTarget = null;
bpmDragSource.prototype.currentPoint = null;
bpmDragSource.prototype.currentGuide = null;
bpmDragSource.prototype.currentHighlight = null;
bpmDragSource.prototype.autoscroll = true;
bpmDragSource.prototype.guidesEnabled = true;
bpmDragSource.prototype.gridEnabled = true;
bpmDragSource.prototype.highlightDropTargets = true;
bpmDragSource.prototype.dragElementZIndex = 100;
bpmDragSource.prototype.dragElementOpacity = 70;
bpmDragSource.prototype.checkEventSource = true;

bpmDragSource.prototype.isEnabled = function()
{
	return this.enabled;
};

bpmDragSource.prototype.setEnabled = function(value)
{
	this.enabled = value;
};

bpmDragSource.prototype.isGuidesEnabled = function()
{
	return this.guidesEnabled;
};

bpmDragSource.prototype.setGuidesEnabled = function(value)
{
	this.guidesEnabled = value;
};

bpmDragSource.prototype.isGridEnabled = function()
{
	return this.gridEnabled;
};

bpmDragSource.prototype.setGridEnabled = function(value)
{
	this.gridEnabled = value;
};

bpmDragSource.prototype.getGraphForEvent = function(evt)
{
	return null;
};

bpmDragSource.prototype.getDropTarget = function(graph, x, y, evt)
{
	return graph.getCellAt(x, y);
};

bpmDragSource.prototype.createDragElement = function(evt)
{
	return this.element.cloneNode(true);
};

bpmDragSource.prototype.createPreviewElement = function(graph)
{
	return null;
};

bpmDragSource.prototype.isActive = function()
{
	return this.mouseMoveHandler != null;
};

bpmDragSource.prototype.reset = function()
{
	if (this.currentGraph != null)
	{
		this.dragExit(this.currentGraph);
		this.currentGraph = null;
	}
	
	this.removeDragElement();
	this.removeListeners();
	this.stopDrag();
};

bpmDragSource.prototype.mouseDown = function(evt)
{
	if (this.enabled && !bpmEvent.isConsumed(evt) && this.mouseMoveHandler == null)
	{
		this.startDrag(evt);
		this.mouseMoveHandler = bpmUtils.bind(this, this.mouseMove);
		this.mouseUpHandler = bpmUtils.bind(this, this.mouseUp);		
		bpmEvent.addGestureListeners(document, null, this.mouseMoveHandler, this.mouseUpHandler);
		
		if (bpmCore.IS_TOUCH && !bpmEvent.isMouseEvent(evt))
		{
			this.eventSource = bpmEvent.getSource(evt);
			bpmEvent.addGestureListeners(this.eventSource, null, this.mouseMoveHandler, this.mouseUpHandler);
		}
	}
};

bpmDragSource.prototype.startDrag = function(evt)
{
	this.dragElement = this.createDragElement(evt);
	this.dragElement.style.position = 'absolute';
	this.dragElement.style.zIndex = this.dragElementZIndex;
	bpmUtils.setOpacity(this.dragElement, this.dragElementOpacity);

	if (this.checkEventSource && bpmCore.IS_SVG)
	{
		this.dragElement.style.pointerEvents = 'none';
	}
};

bpmDragSource.prototype.stopDrag = function()
{
	this.removeDragElement();
};

bpmDragSource.prototype.removeDragElement = function()
{
	if (this.dragElement != null)
	{
		if (this.dragElement.parentNode != null)
		{
			this.dragElement.parentNode.removeChild(this.dragElement);
		}
		
		this.dragElement = null;
	}
};

bpmDragSource.prototype.getElementForEvent = function(evt)
{
	return ((bpmEvent.isTouchEvent(evt) || bpmEvent.isPenEvent(evt)) ?
			document.elementFromPoint(bpmEvent.getClientX(evt), bpmEvent.getClientY(evt)) :
				bpmEvent.getSource(evt));
};

bpmDragSource.prototype.graphContainsEvent = function(graph, evt)
{
	var x = bpmEvent.getClientX(evt);
	var y = bpmEvent.getClientY(evt);
	var offset = bpmUtils.getOffset(graph.container);
	var origin = bpmUtils.getScrollOrigin();
	var elt = this.getElementForEvent(evt);
	
	if (this.checkEventSource)
	{
		while (elt != null && elt != graph.container)
		{
			elt = elt.parentNode;
		}
	}

	return elt != null && x >= offset.x - origin.x && y >= offset.y - origin.y &&
		x <= offset.x - origin.x + graph.container.offsetWidth &&
		y <= offset.y - origin.y + graph.container.offsetHeight;
};

bpmDragSource.prototype.mouseMove = function(evt)
{
	var graph = this.getGraphForEvent(evt);
	
	if (graph != null && !this.graphContainsEvent(graph, evt))
	{
		graph = null;
	}

	if (graph != this.currentGraph)
	{
		if (this.currentGraph != null)
		{
			this.dragExit(this.currentGraph, evt);
		}
		
		this.currentGraph = graph;
		
		if (this.currentGraph != null)
		{
			this.dragEnter(this.currentGraph, evt);
		}
	}
	
	if (this.currentGraph != null)
	{
		this.dragOver(this.currentGraph, evt);
	}

	if (this.dragElement != null && (this.previewElement == null || this.previewElement.style.visibility != 'visible'))
	{
		var x = bpmEvent.getClientX(evt);
		var y = bpmEvent.getClientY(evt);
		
		if (this.dragElement.parentNode == null)
		{
			document.body.appendChild(this.dragElement);
		}

		this.dragElement.style.visibility = 'visible';
		
		if (this.dragOffset != null)
		{
			x += this.dragOffset.x;
			y += this.dragOffset.y;
		}
		
		var offset = bpmUtils.getDocumentScrollOrigin(document);
		
		this.dragElement.style.left = (x + offset.x) + 'px';
		this.dragElement.style.top = (y + offset.y) + 'px';
	}
	else if (this.dragElement != null)
	{
		this.dragElement.style.visibility = 'hidden';
	}
	
	bpmEvent.consume(evt);
};

bpmDragSource.prototype.mouseUp = function(evt)
{
	if (this.currentGraph != null)
	{
		if (this.currentPoint != null && (this.previewElement == null ||
			this.previewElement.style.visibility != 'hidden'))
		{
			var scale = this.currentGraph.view.scale;
			var tr = this.currentGraph.view.translate;
			var x = this.currentPoint.x / scale - tr.x;
			var y = this.currentPoint.y / scale - tr.y;
			
			this.drop(this.currentGraph, evt, this.currentDropTarget, x, y);
		}
		
		this.dragExit(this.currentGraph);
		this.currentGraph = null;
	}

	this.stopDrag();
	this.removeListeners();
	
	bpmEvent.consume(evt);
};

bpmDragSource.prototype.removeListeners = function()
{
	if (this.eventSource != null)
	{
		bpmEvent.removeGestureListeners(this.eventSource, null, this.mouseMoveHandler, this.mouseUpHandler);
		this.eventSource = null;
	}
	
	bpmEvent.removeGestureListeners(document, null, this.mouseMoveHandler, this.mouseUpHandler);
	this.mouseMoveHandler = null;
	this.mouseUpHandler = null;
};

bpmDragSource.prototype.dragEnter = function(graph, evt)
{
	graph.isMouseDown = true;
	graph.isMouseTrigger = bpmEvent.isMouseEvent(evt);
	this.previewElement = this.createPreviewElement(graph);
	
	if (this.previewElement != null && this.checkEventSource && bpmCore.IS_SVG)
	{
		this.previewElement.style.pointerEvents = 'none';
	}
	
	if (this.isGuidesEnabled() && this.previewElement != null)
	{
		this.currentGuide = new bpmGuide(graph, graph.graphHandler.getGuideStates());
	}
	
	if (this.highlightDropTargets)
	{
		this.currentHighlight = new bpmCellHighlight(graph, bpmConstants.DROP_TARGET_COLOR);
	}
	
	graph.addListener(bpmEvent.FIRE_MOUSE_EVENT, this.eventConsumer);
};

bpmDragSource.prototype.dragExit = function(graph, evt)
{
	this.currentDropTarget = null;
	this.currentPoint = null;
	graph.isMouseDown = false;
	
	graph.removeListener(this.eventConsumer);
	
	if (this.previewElement != null)
	{
		if (this.previewElement.parentNode != null)
		{
			this.previewElement.parentNode.removeChild(this.previewElement);
		}
		
		this.previewElement = null;
	}
	
	if (this.currentGuide != null)
	{
		this.currentGuide.destroy();
		this.currentGuide = null;
	}
	
	if (this.currentHighlight != null)
	{
		this.currentHighlight.destroy();
		this.currentHighlight = null;
	}
};

bpmDragSource.prototype.dragOver = function(graph, evt)
{
	var offset = bpmUtils.getOffset(graph.container);
	var origin = bpmUtils.getScrollOrigin(graph.container);
	var x = bpmEvent.getClientX(evt) - offset.x + origin.x - graph.panDx;
	var y = bpmEvent.getClientY(evt) - offset.y + origin.y - graph.panDy;

	if (graph.autoScroll && (this.autoscroll == null || this.autoscroll))
	{
		graph.scrollPointToVisible(x, y, graph.autoExtend);
	}

	if (this.currentHighlight != null && graph.isDropEnabled())
	{
		this.currentDropTarget = this.getDropTarget(graph, x, y, evt);
		var state = graph.getView().getState(this.currentDropTarget);
		this.currentHighlight.highlight(state);
	}

	if (this.previewElement != null)
	{
		if (this.previewElement.parentNode == null)
		{
			graph.container.appendChild(this.previewElement);
			
			this.previewElement.style.zIndex = '3';
			this.previewElement.style.position = 'absolute';
		}
		
		var gridEnabled = this.isGridEnabled() && graph.isGridEnabledEvent(evt);
		var hideGuide = true;

		if (this.currentGuide != null && this.currentGuide.isEnabledForEvent(evt))
		{
			var w = parseInt(this.previewElement.style.width);
			var h = parseInt(this.previewElement.style.height);
			var bounds = new bpmRectangle(0, 0, w, h);
			var delta = new bpmPoint(x, y);
			delta = this.currentGuide.move(bounds, delta, gridEnabled, true);
			hideGuide = false;
			x = delta.x;
			y = delta.y;
		}
		else if (gridEnabled)
		{
			var scale = graph.view.scale;
			var tr = graph.view.translate;
			var off = graph.gridSize / 2;
			x = (graph.snap(x / scale - tr.x - off) + tr.x) * scale;
			y = (graph.snap(y / scale - tr.y - off) + tr.y) * scale;
		}
		
		if (this.currentGuide != null && hideGuide)
		{
			this.currentGuide.hide();
		}
		
		if (this.previewOffset != null)
		{
			x += this.previewOffset.x;
			y += this.previewOffset.y;
		}

		this.previewElement.style.left = Math.round(x) + 'px';
		this.previewElement.style.top = Math.round(y) + 'px';
		this.previewElement.style.visibility = 'visible';
	}
	
	this.currentPoint = new bpmPoint(x, y);
};

bpmDragSource.prototype.drop = function(graph, evt, dropTarget, x, y)
{
	this.dropHandler.apply(this, arguments);
	
	if (graph.container.style.visibility != 'hidden')
	{
		graph.container.focus();
	}
};



/* Toolbar */
function bpmToolbar(container)
{
	this.container = container;
};

bpmToolbar.prototype = new bpmEventSource();
bpmToolbar.prototype.constructor = bpmToolbar;
bpmToolbar.prototype.container = null;
bpmToolbar.prototype.enabled = true;
bpmToolbar.prototype.noReset = false;
bpmToolbar.prototype.updateDefaultMode = true;

bpmToolbar.prototype.addItem = function(title, icon, funct, pressedIcon, style, factoryMethod)
{
	var img = document.createElement((icon != null) ? 'img' : 'button');
	var initialClassName = style || ((factoryMethod != null) ?
			'bpmToolbarMode' : 'bpmToolbarItem');
	img.className = initialClassName;
	img.setAttribute('src', icon);
	
	if (title != null)
	{
		if (icon != null)
		{
			img.setAttribute('title', title);
		}
		else
		{
			bpmUtils.write(img, title);
		}
	}
	
	this.container.appendChild(img);

	if (funct != null)
	{
		bpmEvent.addListener(img, 'click', funct);
		
		if (bpmCore.IS_TOUCH)
		{
			bpmEvent.addListener(img, 'touchend', funct);
		}
	}

	var mouseHandler = bpmUtils.bind(this, function(evt)
	{
		if (pressedIcon != null)
		{
			img.setAttribute('src', icon);
		}
		else
		{
			img.style.backgroundColor = '';
		}
	});

	bpmEvent.addGestureListeners(img, bpmUtils.bind(this, function(evt)
	{
		if (pressedIcon != null)
		{
			img.setAttribute('src', pressedIcon);
		}
		else
		{
			img.style.backgroundColor = 'gray';
		}
		
		// Popup Menu
		if (factoryMethod != null)
		{
			if (this.menu == null)
			{
				this.menu = new bpmPopupMenu();
				this.menu.init();
			}
			
			var last = this.currentImg;
			
			if (this.menu.isMenuShowing())
			{
				this.menu.hideMenu();
			}
			
			if (last != img)
			{
				this.currentImg = img;
				this.menu.factoryMethod = factoryMethod;
				
				var point = new bpmPoint(
					img.offsetLeft,
					img.offsetTop + img.offsetHeight);
				this.menu.popup(point.x, point.y, null, evt);

				if (this.menu.isMenuShowing())
				{
					img.className = initialClassName + 'Selected';
					
					this.menu.hideMenu = function()
					{
						bpmPopupMenu.prototype.hideMenu.apply(this);
						img.className = initialClassName;
						this.currentImg = null;
					};
				}
			}
		}
	}), null, mouseHandler);

	bpmEvent.addListener(img, 'mouseout', mouseHandler);
	
	return img;
};

bpmToolbar.prototype.addCombo = function(style)
{
	var div = document.createElement('div');
	div.style.display = 'inline';
	div.className = 'bpmToolbarComboContainer';
	
	var select = document.createElement('select');
	select.className = style || 'bpmToolbarCombo';
	div.appendChild(select);
	
	this.container.appendChild(div);
	
	return select;
};

bpmToolbar.prototype.addActionCombo = function(title, style)
{
	var select = document.createElement('select');
	select.className = style || 'bpmToolbarCombo';
	this.addOption(select, title, null);
	
	bpmEvent.addListener(select, 'change', function(evt)
	{
		var value = select.options[select.selectedIndex];
		select.selectedIndex = 0;
		
		if (value.funct != null)
		{
			value.funct(evt);
		}
	});
	
	this.container.appendChild(select);
	
	return select;
};

bpmToolbar.prototype.addOption = function(combo, title, value)
{
	var option = document.createElement('option');
	bpmUtils.writeln(option, title);
	
	if (typeof(value) == 'function')
	{
		option.funct = value;
	}
	else
	{
		option.setAttribute('value', value);
	}
	
	combo.appendChild(option);
	
	return option;
};

bpmToolbar.prototype.addSwitchMode = function(title, icon, funct, pressedIcon, style)
{
	var img = document.createElement('img');
	img.initialClassName = style || 'bpmToolbarMode';
	img.className = img.initialClassName;
	img.setAttribute('src', icon);
	img.altIcon = pressedIcon;
	
	if (title != null)
	{
		img.setAttribute('title', title);
	}
	
	bpmEvent.addListener(img, 'click', bpmUtils.bind(this, function(evt)
	{
		var tmp = this.selectedMode.altIcon;
		
		if (tmp != null)
		{
			this.selectedMode.altIcon = this.selectedMode.getAttribute('src');
			this.selectedMode.setAttribute('src', tmp);
		}
		else
		{
			this.selectedMode.className = this.selectedMode.initialClassName;
		}
		
		if (this.updateDefaultMode)
		{
			this.defaultMode = img;
		}
		
		this.selectedMode = img;
		
		var tmp = img.altIcon;
		
		if (tmp != null)
		{
			img.altIcon = img.getAttribute('src');
			img.setAttribute('src', tmp);
		}
		else
		{
			img.className = img.initialClassName+'Selected';
		}
		
		this.fireEvent(new bpmEventObject(bpmEvent.SELECT));
		funct();
	}));
	
	this.container.appendChild(img);
	
	if (this.defaultMode == null)
	{
		this.defaultMode = img;
		
		this.selectMode(img);
		funct();
	}
	
	return img;
};

bpmToolbar.prototype.addMode = function(title, icon, funct, pressedIcon, style, toggle)
{
	toggle = (toggle != null) ? toggle : true;
	var img = document.createElement((icon != null) ? 'img' : 'button');
	
	img.initialClassName = style || 'bpmToolbarMode';
	img.className = img.initialClassName;
	img.setAttribute('src', icon);
	img.altIcon = pressedIcon;

	if (title != null)
	{
		img.setAttribute('title', title);
	}
	
	if (this.enabled && toggle)
	{
		bpmEvent.addListener(img, 'click', bpmUtils.bind(this, function(evt)
		{
			this.selectMode(img, funct);
			this.noReset = false;
		}));
		
		bpmEvent.addListener(img, 'dblclick', bpmUtils.bind(this, function(evt)
		{
			this.selectMode(img, funct);
			this.noReset = true;
		}));
		
		if (this.defaultMode == null)
		{
			this.defaultMode = img;
			this.defaultFunction = funct;
			this.selectMode(img, funct);
		}
	}

	this.container.appendChild(img);					

	return img;
};

bpmToolbar.prototype.selectMode = function(domNode, funct)
{
	if (this.selectedMode != domNode)
	{
		if (this.selectedMode != null)
		{
			var tmp = this.selectedMode.altIcon;
			
			if (tmp != null)
			{
				this.selectedMode.altIcon = this.selectedMode.getAttribute('src');
				this.selectedMode.setAttribute('src', tmp);
			}
			else
			{
				this.selectedMode.className = this.selectedMode.initialClassName;
			}
		}
		
		this.selectedMode = domNode;
		var tmp = this.selectedMode.altIcon;
		
		if (tmp != null)
		{
			this.selectedMode.altIcon = this.selectedMode.getAttribute('src');
			this.selectedMode.setAttribute('src', tmp);
		}
		else
		{
			this.selectedMode.className = this.selectedMode.initialClassName+'Selected';
		}
		
		this.fireEvent(new bpmEventObject(bpmEvent.SELECT, "function", funct));
	}
};

bpmToolbar.prototype.resetMode = function(forced)
{
	if ((forced || !this.noReset) && this.selectedMode != this.defaultMode)
	{
		this.selectMode(this.defaultMode, this.defaultFunction);
	}
};

bpmToolbar.prototype.addSeparator = function(icon)
{
	return this.addItem(null, icon, null);
};

bpmToolbar.prototype.addBreak = function()
{
	bpmUtils.br(this.container);
};

bpmToolbar.prototype.addLine = function()
{
	var hr = document.createElement('hr');
	
	hr.style.marginRight = '6px';
	hr.setAttribute('size', '1');
	
	this.container.appendChild(hr);
};

bpmToolbar.prototype.destroy = function ()
{
	bpmEvent.release(this.container);
	this.container = null;
	this.defaultMode = null;
	this.defaultFunction = null;
	this.selectedMode = null;
	
	if (this.menu != null)
	{
		this.menu.destroy();
	}
};



/* Undoable Edit */
function bpmUndoableEdit(source, significant)
{
	this.source = source;
	this.changes = [];
	this.significant = (significant != null) ? significant : true;
};

bpmUndoableEdit.prototype.source = null;
bpmUndoableEdit.prototype.changes = null;
bpmUndoableEdit.prototype.significant = null;
bpmUndoableEdit.prototype.undone = false;
bpmUndoableEdit.prototype.redone = false;

bpmUndoableEdit.prototype.isEmpty = function()
{
	return this.changes.length == 0;
};

bpmUndoableEdit.prototype.isSignificant = function()
{
	return this.significant;
};

bpmUndoableEdit.prototype.add = function(change)
{
	this.changes.push(change);
};

bpmUndoableEdit.prototype.notify = function() { };

bpmUndoableEdit.prototype.die = function() { };

bpmUndoableEdit.prototype.undo = function()
{
	if (!this.undone)
	{
		this.source.fireEvent(new bpmEventObject(bpmEvent.START_EDIT));
		var count = this.changes.length;
		
		for (var i = count - 1; i >= 0; i--)
		{
			var change = this.changes[i];
			
			if (change.execute != null)
			{
				change.execute();
			}
			else if (change.undo != null)
			{
				change.undo();
			}
			
			this.source.fireEvent(new bpmEventObject(bpmEvent.EXECUTED, 'change', change));
		}
		
		this.undone = true;
		this.redone = false;
		this.source.fireEvent(new bpmEventObject(bpmEvent.END_EDIT));
	}
	
	this.notify();
};

bpmUndoableEdit.prototype.redo = function()
{
	if (!this.redone)
	{
		this.source.fireEvent(new bpmEventObject(bpmEvent.START_EDIT));
		var count = this.changes.length;
		
		for (var i = 0; i < count; i++)
		{
			var change = this.changes[i];
			
			if (change.execute != null)
			{
				change.execute();
			}
			else if (change.redo != null)
			{
				change.redo();
			}
			
			this.source.fireEvent(new bpmEventObject(bpmEvent.EXECUTED, 'change', change));
		}
		
		this.undone = false;
		this.redone = true;
		this.source.fireEvent(new bpmEventObject(bpmEvent.END_EDIT));
	}
	
	this.notify();
};



/* Undo Manager */
function bpmUndoManager(size)
{
	this.size = (size != null) ? size : 100;
	this.clear();
};

bpmUndoManager.prototype = new bpmEventSource();
bpmUndoManager.prototype.constructor = bpmUndoManager;
bpmUndoManager.prototype.size = null;
bpmUndoManager.prototype.history = null;
bpmUndoManager.prototype.indexOfNextAdd = 0;

bpmUndoManager.prototype.isEmpty = function()
{
	return this.history.length == 0;
};

bpmUndoManager.prototype.clear = function()
{
	this.history = [];
	this.indexOfNextAdd = 0;
	this.fireEvent(new bpmEventObject(bpmEvent.CLEAR));
};

bpmUndoManager.prototype.canUndo = function()
{
	return this.indexOfNextAdd > 0;
};

bpmUndoManager.prototype.undo = function()
{
    while (this.indexOfNextAdd > 0)
    {
        var edit = this.history[--this.indexOfNextAdd];
        edit.undo();

		if (edit.isSignificant())
        {
        	this.fireEvent(new bpmEventObject(bpmEvent.UNDO, 'edit', edit));
            break;
        }
    }
};

bpmUndoManager.prototype.canRedo = function()
{
	return this.indexOfNextAdd < this.history.length;
};

bpmUndoManager.prototype.redo = function()
{
    var n = this.history.length;
    
    while (this.indexOfNextAdd < n)
    {
        var edit =  this.history[this.indexOfNextAdd++];
        edit.redo();
        
        if (edit.isSignificant())
        {
        	this.fireEvent(new bpmEventObject(bpmEvent.REDO, 'edit', edit));
            break;
        }
    }
};

bpmUndoManager.prototype.undoableEditHappened = function(undoableEdit)
{
	this.trim();
	
	if (this.size > 0 &&
		this.size == this.history.length)
	{
		this.history.shift();
	}
	
	this.history.push(undoableEdit);
	this.indexOfNextAdd = this.history.length;
	this.fireEvent(new bpmEventObject(bpmEvent.ADD, 'edit', undoableEdit));
};

bpmUndoManager.prototype.trim = function()
{
	if (this.history.length > this.indexOfNextAdd)
	{
		var edits = this.history.splice(this.indexOfNextAdd,
			this.history.length - this.indexOfNextAdd);
			
		for (var i = 0; i < edits.length; i++)
		{
			edits[i].die();
		}
	}
};



/* Url Converter */
var bpmUrlConverter = function()
{
	// Empty constructor
};

bpmUrlConverter.prototype.enabled = true;
bpmUrlConverter.prototype.baseUrl = null;
bpmUrlConverter.prototype.baseDomain = null;

bpmUrlConverter.prototype.updateBaseUrl = function()
{
	this.baseDomain = location.protocol + '//' + location.host;
	this.baseUrl = this.baseDomain + location.pathname;
	var tmp = this.baseUrl.lastIndexOf('/');
	
	// Strips filename etc
	if (tmp > 0)
	{
		this.baseUrl = this.baseUrl.substring(0, tmp + 1);
	}
};

bpmUrlConverter.prototype.isEnabled = function()
{
	return this.enabled;
};

bpmUrlConverter.prototype.setEnabled = function(value)
{
	this.enabled = value;
};

bpmUrlConverter.prototype.getBaseUrl = function()
{
	return this.baseUrl;
};

bpmUrlConverter.prototype.setBaseUrl = function(value)
{
	this.baseUrl = value;
};

bpmUrlConverter.prototype.getBaseDomain = function()
{
	return this.baseDomain;
},


bpmUrlConverter.prototype.setBaseDomain = function(value)
{
	this.baseDomain = value;
},


bpmUrlConverter.prototype.isRelativeUrl = function(url)
{
	return url.substring(0, 2) != '//' && url.substring(0, 7) != 'http://' &&
		url.substring(0, 8) != 'https://' && url.substring(0, 10) != 'data:image' &&
		url.substring(0, 7) != 'file://';
};


bpmUrlConverter.prototype.convert = function(url)
{
	if (this.isEnabled() && this.isRelativeUrl(url))
	{
		if (this.getBaseUrl() == null)
		{
			this.updateBaseUrl();
		}
		
		if (url.charAt(0) == '/')
		{
			url = this.getBaseDomain() + url;
		}
		else
		{
			url = this.getBaseUrl() + url;
		}
	}
	
	return url;
};



/* Panning Manager */
function bpmPanningManager(graph)
{
	this.thread = null;
	this.active = false;
	this.tdx = 0;
	this.tdy = 0;
	this.t0x = 0;
	this.t0y = 0;
	this.dx = 0;
	this.dy = 0;
	this.scrollbars = false;
	this.scrollLeft = 0;
	this.scrollTop = 0;
	
	this.mouseListener =
	{
	    mouseDown: function(sender, me) { },
	    mouseMove: function(sender, me) { },
	    mouseUp: bpmUtils.bind(this, function(sender, me)
	    {
	    	if (this.active)
	    	{
	    		this.stop();
	    	}
	    })
	};
	
	graph.addMouseListener(this.mouseListener);
	
	this.mouseUpListener = bpmUtils.bind(this, function()
	{
	    	if (this.active)
	    	{
	    		this.stop();
	    	}
	});
	
	bpmEvent.addListener(document, 'mouseup', this.mouseUpListener);
	
	var createThread = bpmUtils.bind(this, function()
	{
	    	this.scrollbars = bpmUtils.hasScrollbars(graph.container);
	    	this.scrollLeft = graph.container.scrollLeft;
	    	this.scrollTop = graph.container.scrollTop;
	
	    	return window.setInterval(bpmUtils.bind(this, function()
		{
			this.tdx -= this.dx;
			this.tdy -= this.dy;

			if (this.scrollbars)
			{
				var left = -graph.container.scrollLeft - Math.ceil(this.dx);
				var top = -graph.container.scrollTop - Math.ceil(this.dy);
				graph.panGraph(left, top);
				graph.panDx = this.scrollLeft - graph.container.scrollLeft;
				graph.panDy = this.scrollTop - graph.container.scrollTop;
				graph.fireEvent(new bpmEventObject(bpmEvent.PAN));
			}
			else
			{
				graph.panGraph(this.getDx(), this.getDy());
			}
		}), this.delay);
	});
	
	this.isActive = function()
	{
		return active;
	};
	
	this.getDx = function()
	{
		return Math.round(this.tdx);
	};
	
	this.getDy = function()
	{
		return Math.round(this.tdy);
	};
	
	this.start = function()
	{
		this.t0x = graph.view.translate.x;
		this.t0y = graph.view.translate.y;
		this.active = true;
	};
	
	this.panTo = function(x, y, w, h)
	{
		if (!this.active)
		{
			this.start();
		}
		
    	this.scrollLeft = graph.container.scrollLeft;
    	this.scrollTop = graph.container.scrollTop;
		
		w = (w != null) ? w : 0;
		h = (h != null) ? h : 0;
		
		var c = graph.container;
		this.dx = x + w - c.scrollLeft - c.clientWidth;
		
		if (this.dx < 0 && Math.abs(this.dx) < this.border)
		{
			this.dx = this.border + this.dx;
		}
		else if (this.handleMouseOut)
		{
			this.dx = Math.max(this.dx, 0);
		}
		else
		{
			this.dx = 0;
		}
		
		if (this.dx == 0)
		{
			this.dx = x - c.scrollLeft;
			
			if (this.dx > 0 && this.dx < this.border)
			{
				this.dx = this.dx - this.border;
			}
			else if (this.handleMouseOut)
			{
				this.dx = Math.min(0, this.dx);
			}
			else
			{
				this.dx = 0;
			}
		}
		
		this.dy = y + h - c.scrollTop - c.clientHeight;

		if (this.dy < 0 && Math.abs(this.dy) < this.border)
		{
			this.dy = this.border + this.dy;
		}
		else if (this.handleMouseOut)
		{
			this.dy = Math.max(this.dy, 0);
		}
		else
		{
			this.dy = 0;
		}
		
		if (this.dy == 0)
		{
			this.dy = y - c.scrollTop;
			
			if (this.dy > 0 && this.dy < this.border)
			{
				this.dy = this.dy - this.border;
			}
			else if (this.handleMouseOut)
			{
				this.dy = Math.min(0, this.dy);
			} 
			else
			{
				this.dy = 0;
			}
		}
		
		if (this.dx != 0 || this.dy != 0)
		{
			this.dx *= this.damper;
			this.dy *= this.damper;
			
			if (this.thread == null)
			{
				this.thread = createThread();
			}
		}
		else if (this.thread != null)
		{
			window.clearInterval(this.thread);
			this.thread = null;
		}
	};
	
	this.stop = function()
	{
		if (this.active)
		{
			this.active = false;
		
			if (this.thread != null)
	    	{
				window.clearInterval(this.thread);
				this.thread = null;
	    	}
			
			this.tdx = 0;
			this.tdy = 0;
			
			if (!this.scrollbars)
			{
				var px = graph.panDx;
				var py = graph.panDy;
		    	
		    	if (px != 0 || py != 0)
		    	{
		    		graph.panGraph(0, 0);
			    	graph.view.setTranslate(this.t0x + px / graph.view.scale, this.t0y + py / graph.view.scale);
		    	}
			}
			else
			{
				graph.panDx = 0;
				graph.panDy = 0;
				graph.fireEvent(new bpmEventObject(bpmEvent.PAN));
			}
		}
	};
	
	this.destroy = function()
	{
		graph.removeMouseListener(this.mouseListener);
		bpmEvent.removeListener(document, 'mouseup', this.mouseUpListener);
	};
};

bpmPanningManager.prototype.damper = 1/6;
bpmPanningManager.prototype.delay = 10;
bpmPanningManager.prototype.handleMouseOut = true;
bpmPanningManager.prototype.border = 0;



/* Popup Menu */
function bpmPopupMenu(factoryMethod)
{
	this.factoryMethod = factoryMethod;
	
	if (factoryMethod != null)
	{
		this.init();
	}
};

bpmPopupMenu.prototype = new bpmEventSource();
bpmPopupMenu.prototype.constructor = bpmPopupMenu;
bpmPopupMenu.prototype.submenuImage = bpmCore.imageBasePath + '/submenu.gif';
bpmPopupMenu.prototype.zIndex = 10006;
bpmPopupMenu.prototype.factoryMethod = null;
bpmPopupMenu.prototype.useLeftButtonForPopup = false;
bpmPopupMenu.prototype.enabled = true;
bpmPopupMenu.prototype.itemCount = 0;
bpmPopupMenu.prototype.autoExpand = false;
bpmPopupMenu.prototype.smartSeparators = false;
bpmPopupMenu.prototype.labels = true;

bpmPopupMenu.prototype.init = function()
{
	this.table = document.createElement('table');
	this.table.className = 'bpmPopupMenu';
	
	this.tbody = document.createElement('tbody');
	this.table.appendChild(this.tbody);

	// Adds the outer div
	this.div = document.createElement('div');
	this.div.className = 'bpmPopupMenu';
	this.div.style.display = 'inline';
	this.div.style.zIndex = this.zIndex;
	this.div.appendChild(this.table);

	bpmEvent.disableContextMenu(this.div);
};

bpmPopupMenu.prototype.isEnabled = function()
{
	return this.enabled;
};

bpmPopupMenu.prototype.setEnabled = function(enabled)
{
	this.enabled = enabled;
};

bpmPopupMenu.prototype.isPopupTrigger = function(me)
{
	return me.isPopupTrigger() || (this.useLeftButtonForPopup && bpmEvent.isLeftMouseButton(me.getEvent()));
};

bpmPopupMenu.prototype.addItem = function(title, image, funct, parent, iconCls, enabled, active)
{
	parent = parent || this;
	this.itemCount++;
	
	if (parent.willAddSeparator)
	{
		if (parent.containsItems)
		{
			this.addSeparator(parent, true);
		}

		parent.willAddSeparator = false;
	}

	parent.containsItems = true;
	var tr = document.createElement('tr');
	tr.className = 'bpmPopupMenuItem';
	var col1 = document.createElement('td');
	col1.className = 'bpmPopupMenuIcon';

	if (image != null)
	{
		var img = document.createElement('img');
		img.src = image;
		col1.appendChild(img);
	}
	else if (iconCls != null)
	{
		var div = document.createElement('div');
		div.className = iconCls;
		col1.appendChild(div);
	}
	
	tr.appendChild(col1);
	
	if (this.labels)
	{
		var col2 = document.createElement('td');
		col2.className = 'bpmPopupMenuItem' +
			((enabled != null && !enabled) ? ' bpmDisabled' : '');
		
		bpmUtils.write(col2, title);
		col2.align = 'left';
		tr.appendChild(col2);
	
		var col3 = document.createElement('td');
		col3.className = 'bpmPopupMenuItem' +
			((enabled != null && !enabled) ? ' bpmDisabled' : '');
		col3.style.paddingRight = '6px';
		col3.style.textAlign = 'right';
		
		tr.appendChild(col3);
		
		if (parent.div == null)
		{
			this.createSubmenu(parent);
		}
	}
	
	parent.tbody.appendChild(tr);

	if (active != false && enabled != false)
	{
		var currentSelection = null;
		
		bpmEvent.addGestureListeners(tr,
			bpmUtils.bind(this, function(evt)
			{
				this.eventReceiver = tr;
				
				if (parent.activeRow != tr && parent.activeRow != parent)
				{
					if (parent.activeRow != null && parent.activeRow.div.parentNode != null)
					{
						this.hideSubmenu(parent);
					}
					
					if (tr.div != null)
					{
						this.showSubmenu(parent, tr);
						parent.activeRow = tr;
					}
				}
				
				if (document.selection != null && (bpmCore.IS_QUIRKS || document.documentMode == 8))
				{
					currentSelection = document.selection.createRange();
				}
				
				bpmEvent.consume(evt);
			}),
			bpmUtils.bind(this, function(evt)
			{
				if (parent.activeRow != tr && parent.activeRow != parent)
				{
					if (parent.activeRow != null && parent.activeRow.div.parentNode != null)
					{
						this.hideSubmenu(parent);
					}
					
					if (this.autoExpand && tr.div != null)
					{
						this.showSubmenu(parent, tr);
						parent.activeRow = tr;
					}
				}
		
				tr.className = 'bpmPopupMenuItemHover';
			}),
			bpmUtils.bind(this, function(evt)
			{
				if (this.eventReceiver == tr)
				{
					if (parent.activeRow != tr)
					{
						this.hideMenu();
					}
					
					if (currentSelection != null)
					{
						try
						{
							currentSelection.select();
						}
						catch (e)
						{
							// ignore
						}

						currentSelection = null;
					}
					
					if (funct != null)
					{
						funct(evt);
					}
				}
				
				this.eventReceiver = null;
				bpmEvent.consume(evt);
			})
		);
	
		bpmEvent.addListener(tr, 'mouseout',
			bpmUtils.bind(this, function(evt)
			{
				tr.className = 'bpmPopupMenuItem';
			})
		);
	}
	
	return tr;
};

bpmPopupMenu.prototype.addCheckmark = function(item, img)
{
	var td = item.firstChild.nextSibling;
	td.style.backgroundImage = 'url(\'' + img + '\')';
	td.style.backgroundRepeat = 'no-repeat';
	td.style.backgroundPosition = '2px 50%';
};

bpmPopupMenu.prototype.createSubmenu = function(parent)
{
	parent.table = document.createElement('table');
	parent.table.className = 'bpmPopupMenu';

	parent.tbody = document.createElement('tbody');
	parent.table.appendChild(parent.tbody);

	parent.div = document.createElement('div');
	parent.div.className = 'bpmPopupMenu';

	parent.div.style.position = 'absolute';
	parent.div.style.display = 'inline';
	parent.div.style.zIndex = this.zIndex;
	
	parent.div.appendChild(parent.table);
	
	var img = document.createElement('img');
	img.setAttribute('src', this.submenuImage);
	
	// Last column of the submenu item in the parent menu
	td = parent.firstChild.nextSibling.nextSibling;
	td.appendChild(img);
};

bpmPopupMenu.prototype.showSubmenu = function(parent, row)
{
	if (row.div != null)
	{
		row.div.style.left = (parent.div.offsetLeft +
			row.offsetLeft+row.offsetWidth - 1) + 'px';
		row.div.style.top = (parent.div.offsetTop+row.offsetTop) + 'px';
		document.body.appendChild(row.div);
		
		// Moves the submenu to the left side if there is no space
		var left = parseInt(row.div.offsetLeft);
		var width = parseInt(row.div.offsetWidth);
		var offset = bpmUtils.getDocumentScrollOrigin(document);
		
		var b = document.body;
		var d = document.documentElement;
		
		var right = offset.x + (b.clientWidth || d.clientWidth);
		
		if (left + width > right)
		{
			row.div.style.left = Math.max(0, (parent.div.offsetLeft - width + ((bpmCore.IS_IE) ? 6 : -6))) + 'px';
		}
		
		bpmUtils.fit(row.div);
	}
};

bpmPopupMenu.prototype.addSeparator = function(parent, force)
{
	parent = parent || this;
	
	if (this.smartSeparators && !force)
	{
		parent.willAddSeparator = true;
	}
	else if (parent.tbody != null)
	{
		parent.willAddSeparator = false;
		var tr = document.createElement('tr');
		
		var col1 = document.createElement('td');
		col1.className = 'bpmPopupMenuIcon';
		col1.style.padding = '0 0 0 0px';
		
		tr.appendChild(col1);
		
		var col2 = document.createElement('td');
		col2.style.padding = '0 0 0 0px';
		col2.setAttribute('colSpan', '2');
	
		var hr = document.createElement('hr');
		hr.setAttribute('size', '1');
		col2.appendChild(hr);
		
		tr.appendChild(col2);
		
		parent.tbody.appendChild(tr);
	}
};

bpmPopupMenu.prototype.popup = function(x, y, cell, evt)
{
	if (this.div != null && this.tbody != null && this.factoryMethod != null)
	{
		this.div.style.left = x + 'px';
		this.div.style.top = y + 'px';
		
		// Removes all child nodes from the existing menu
		while (this.tbody.firstChild != null)
		{
			bpmEvent.release(this.tbody.firstChild);
			this.tbody.removeChild(this.tbody.firstChild);
		}
		
		this.itemCount = 0;
		this.factoryMethod(this, cell, evt);
		
		if (this.itemCount > 0)
		{
			this.showMenu();
			this.fireEvent(new bpmEventObject(bpmEvent.SHOW));
		}
	}
};

bpmPopupMenu.prototype.isMenuShowing = function()
{
	return this.div != null && this.div.parentNode == document.body;
};

bpmPopupMenu.prototype.showMenu = function()
{
	if (document.documentMode >= 9)
	{
		this.div.style.filter = 'none';
	}
	
	document.body.appendChild(this.div);
	bpmUtils.fit(this.div);
};

bpmPopupMenu.prototype.hideMenu = function()
{
	if (this.div != null)
	{
		if (this.div.parentNode != null)
		{
			this.div.parentNode.removeChild(this.div);
		}
		
		this.hideSubmenu(this);
		this.containsItems = false;
		this.fireEvent(new bpmEventObject(bpmEvent.HIDE));
	}
};

bpmPopupMenu.prototype.hideSubmenu = function(parent)
{
	if (parent.activeRow != null)
	{
		this.hideSubmenu(parent.activeRow);
		
		if (parent.activeRow.div.parentNode != null)
		{
			parent.activeRow.div.parentNode.removeChild(parent.activeRow.div);
		}
		
		parent.activeRow = null;
	}
};

bpmPopupMenu.prototype.destroy = function()
{
	if (this.div != null)
	{
		bpmEvent.release(this.div);
		
		if (this.div.parentNode != null)
		{
			this.div.parentNode.removeChild(this.div);
		}
		
		this.div = null;
	}
};



/* Auto Save Manager */
function bpmAutoSaveManager(graph)
{
	this.changeHandler = bpmUtils.bind(this, function(sender, evt)
	{
		if (this.isEnabled())
		{
			this.graphModelChanged(evt.getProperty('edit').changes);
		}
	});

	this.setGraph(graph);
};

bpmAutoSaveManager.prototype = new bpmEventSource();
bpmAutoSaveManager.prototype.constructor = bpmAutoSaveManager;

bpmAutoSaveManager.prototype.graph = null;

bpmAutoSaveManager.prototype.autoSaveDelay = 10;

bpmAutoSaveManager.prototype.autoSaveThrottle = 2;

bpmAutoSaveManager.prototype.autoSaveThreshold = 5;

bpmAutoSaveManager.prototype.ignoredChanges = 0;

bpmAutoSaveManager.prototype.lastSnapshot = 0;

bpmAutoSaveManager.prototype.enabled = true;

bpmAutoSaveManager.prototype.changeHandler = null;

bpmAutoSaveManager.prototype.isEnabled = function()
{
	return this.enabled;
};

bpmAutoSaveManager.prototype.setEnabled = function(value)
{
	this.enabled = value;
};

bpmAutoSaveManager.prototype.setGraph = function(graph)
{
	if (this.graph != null)
	{
		this.graph.getModel().removeListener(this.changeHandler);
	}
	
	this.graph = graph;
	
	if (this.graph != null)
	{
		this.graph.getModel().addListener(bpmEvent.CHANGE, this.changeHandler);
	}
};

bpmAutoSaveManager.prototype.save = function()
{
	
};

bpmAutoSaveManager.prototype.graphModelChanged = function(changes)
{
	var now = new Date().getTime();
	var dt = (now - this.lastSnapshot) / 1000;
	
	if (dt > this.autoSaveDelay ||
		(this.ignoredChanges >= this.autoSaveThreshold &&
		 dt > this.autoSaveThrottle))
	{
		this.save();
		this.reset();
	}
	else
	{
		this.ignoredChanges++;
	}
};

bpmAutoSaveManager.prototype.reset = function()
{
	this.lastSnapshot = new Date().getTime();
	this.ignoredChanges = 0;
};

bpmAutoSaveManager.prototype.destroy = function()
{
	this.setGraph(null);
};



/* Animation */
function bpmAnimation(delay)
{
	this.delay = (delay != null) ? delay : 20;
};

bpmAnimation.prototype = new bpmEventSource();
bpmAnimation.prototype.constructor = bpmAnimation;
bpmAnimation.prototype.delay = null;
bpmAnimation.prototype.thread = null;

bpmAnimation.prototype.isRunning = function()
{
	return this.thread != null;
};

bpmAnimation.prototype.startAnimation = function()
{
	if (this.thread == null)
	{
		this.thread = window.setInterval(bpmUtils.bind(this, this.updateAnimation), this.delay);
	}
};

bpmAnimation.prototype.updateAnimation = function()
{
	this.fireEvent(new bpmEventObject(bpmEvent.EXECUTE));
};

bpmAnimation.prototype.stopAnimation = function()
{
	if (this.thread != null)
	{
		window.clearInterval(this.thread);
		this.thread = null;
		this.fireEvent(new bpmEventObject(bpmEvent.DONE));
	}
};



/* Morphing */
function bpmMorphing(graph, steps, ease, delay)
{
	bpmAnimation.call(this, delay);
	this.graph = graph;
	this.steps = (steps != null) ? steps : 6;
	this.ease = (ease != null) ? ease : 1.5;
};

bpmMorphing.prototype = new bpmAnimation();
bpmMorphing.prototype.constructor = bpmMorphing;
bpmMorphing.prototype.graph = null;
bpmMorphing.prototype.steps = null;
bpmMorphing.prototype.step = 0;
bpmMorphing.prototype.ease = null;
bpmMorphing.prototype.cells = null;

bpmMorphing.prototype.updateAnimation = function()
{
	bpmAnimation.prototype.updateAnimation.apply(this, arguments);
	var move = new bpmCellStatePreview(this.graph);

	if (this.cells != null)
	{
		for (var i = 0; i < this.cells.length; i++)
		{
			this.animateCell(this.cells[i], move, false);
		}
	}
	else
	{
		this.animateCell(this.graph.getModel().getRoot(), move, true);
	}
	
	this.show(move);
	
	if (move.isEmpty() || this.step++ >= this.steps)
	{
		this.stopAnimation();
	}
};

bpmMorphing.prototype.show = function(move)
{
	move.show();
};

bpmMorphing.prototype.animateCell = function(cell, move, recurse)
{
	var state = this.graph.getView().getState(cell);
	var delta = null;

	if (state != null)
	{
		delta = this.getDelta(state);

		if (this.graph.getModel().isVertex(cell) && (delta.x != 0 || delta.y != 0))
		{
			var translate = this.graph.view.getTranslate();
			var scale = this.graph.view.getScale();
			
			delta.x += translate.x * scale;
			delta.y += translate.y * scale;
			
			move.moveState(state, -delta.x / this.ease, -delta.y / this.ease);
		}
	}
	
	if (recurse && !this.stopRecursion(state, delta))
	{
		var childCount = this.graph.getModel().getChildCount(cell);

		for (var i = 0; i < childCount; i++)
		{
			this.animateCell(this.graph.getModel().getChildAt(cell, i), move, recurse);
		}
	}
};

bpmMorphing.prototype.stopRecursion = function(state, delta)
{
	return delta != null && (delta.x != 0 || delta.y != 0);
};

bpmMorphing.prototype.getDelta = function(state)
{
	var origin = this.getOriginForCell(state.cell);
	var translate = this.graph.getView().getTranslate();
	var scale = this.graph.getView().getScale();
	var x = state.x / scale - translate.x;
	var y = state.y / scale - translate.y;

	return new bpmPoint((origin.x - x) * scale, (origin.y - y) * scale);
};

bpmMorphing.prototype.getOriginForCell = function(cell)
{
	var result = null;
	
	if (cell != null)
	{
		var parent = this.graph.getModel().getParent(cell);
		var geo = this.graph.getCellGeometry(cell);
		result = this.getOriginForCell(parent);
		
		if (geo != null)
		{
			if (geo.relative)
			{
				var pgeo = this.graph.getCellGeometry(parent);
				
				if (pgeo != null)
				{
					result.x += geo.x * pgeo.width;
					result.y += geo.y * pgeo.height;
				}
			}
			else
			{
				result.x += geo.x;
				result.y += geo.y;
			}
		}
	}
	
	if (result == null)
	{
		var t = this.graph.view.getTranslate();
		result = new bpmPoint(-t.x, -t.y);
	}
	
	return result;
};



/* Image Bundle */
function bpmImageBundle(alt)
{
	this.images = [];
	this.alt = (alt != null) ? alt : false;
};

bpmImageBundle.prototype.images = null;
bpmImageBundle.prototype.images = null;

bpmImageBundle.prototype.putImage = function(key, value, fallback)
{
	this.images[key] = {value: value, fallback: fallback};
};

bpmImageBundle.prototype.getImage = function(key)
{
	var result = null;
	
	if (key != null)
	{
		var img = this.images[key];
		
		if (img != null)
		{
			result = (this.alt) ? img.fallback : img.value;
		}
	}
	
	return result;
};



/* Image Export */
function bpmImageExport() { };

bpmImageExport.prototype.includeOverlays = false;

bpmImageExport.prototype.drawState = function(state, canvas)
{
	if (state != null)
	{
		this.visitStatesRecursive(state, canvas, bpmUtils.bind(this, function()
		{
			this.drawCellState.apply(this, arguments);
		}));
				
		// Paints the overlays
		if (this.includeOverlays)
		{
			this.visitStatesRecursive(state, canvas, bpmUtils.bind(this, function()
			{
				this.drawOverlays.apply(this, arguments);
			}));
		}
	}
};

bpmImageExport.prototype.visitStatesRecursive = function(state, canvas, visitor)
{
	if (state != null)
	{
		visitor(state, canvas);
		
		var graph = state.view.graph;
		var childCount = graph.model.getChildCount(state.cell);
		
		for (var i = 0; i < childCount; i++)
		{
			var childState = graph.view.getState(graph.model.getChildAt(state.cell, i));
			this.visitStatesRecursive(childState, canvas, visitor);
		}
	}
};

bpmImageExport.prototype.getLinkForCellState = function(state, canvas)
{
	return null;
};

bpmImageExport.prototype.drawCellState = function(state, canvas)
{
	var link = this.getLinkForCellState(state, canvas);
	
	if (link != null)
	{
		canvas.setLink(link);
	}
	
	this.drawShape(state, canvas);
	this.drawText(state, canvas);

	if (link != null)
	{
		canvas.setLink(null);
	}
};

bpmImageExport.prototype.drawShape = function(state, canvas)
{
	if (state.shape instanceof bpmShape && state.shape.checkBounds())
	{
		canvas.save();
		state.shape.paint(canvas);
		canvas.restore();
	}
};

bpmImageExport.prototype.drawText = function(state, canvas)
{
	if (state.text != null && state.text.checkBounds())
	{
		canvas.save();
		state.text.paint(canvas);
		canvas.restore();
	}
};

bpmImageExport.prototype.drawOverlays = function(state, canvas)
{
	if (state.overlays != null)
	{
		state.overlays.visit(function(id, shape)
		{
			if (shape instanceof bpmShape)
			{
				shape.paint(canvas);
			}
		});
	}
};




/* Abstract Canvas2D */
function bpmAbstractCanvas2D()
{
	this.converter = this.createUrlConverter();
	
	this.reset();
};

bpmAbstractCanvas2D.prototype.state = null;
bpmAbstractCanvas2D.prototype.states = null;
bpmAbstractCanvas2D.prototype.path = null;
bpmAbstractCanvas2D.prototype.rotateHtml = true;
bpmAbstractCanvas2D.prototype.lastX = 0;
bpmAbstractCanvas2D.prototype.lastY = 0;
bpmAbstractCanvas2D.prototype.moveOp = 'M';
bpmAbstractCanvas2D.prototype.lineOp = 'L';
bpmAbstractCanvas2D.prototype.quadOp = 'Q';
bpmAbstractCanvas2D.prototype.curveOp = 'C';
bpmAbstractCanvas2D.prototype.closeOp = 'Z';
bpmAbstractCanvas2D.prototype.pointerEvents = false;

bpmAbstractCanvas2D.prototype.createUrlConverter = function()
{
	return new bpmUrlConverter();
};

bpmAbstractCanvas2D.prototype.reset = function()
{
	this.state = this.createState();
	this.states = [];
};

bpmAbstractCanvas2D.prototype.createState = function()
{
	return {
		dx: 0,
		dy: 0,
		scale: 1,
		alpha: 1,
		fillAlpha: 1,
		strokeAlpha: 1,
		fillColor: null,
		gradientFillAlpha: 1,
		gradientColor: null,
		gradientAlpha: 1,
		gradientDirection: null,
		strokeColor: null,
		strokeWidth: 1,
		dashed: false,
		dashPattern: '3 3',
		fixDash: false,
		lineCap: 'flat',
		lineJoin: 'miter',
		miterLimit: 10,
		fontColor: '#000000',
		fontBackgroundColor: null,
		fontBorderColor: null,
		fontSize: bpmConstants.DEFAULT_FONTSIZE,
		fontFamily: bpmConstants.DEFAULT_FONTFAMILY,
		fontStyle: 0,
		shadow: false,
		shadowColor: bpmConstants.SHADOWCOLOR,
		shadowAlpha: bpmConstants.SHADOW_OPACITY,
		shadowDx: bpmConstants.SHADOW_OFFSET_X,
		shadowDy: bpmConstants.SHADOW_OFFSET_Y,
		rotation: 0,
		rotationCx: 0,
		rotationCy: 0
	};
};

bpmAbstractCanvas2D.prototype.format = function(value)
{
	return Math.round(parseFloat(value));
};

bpmAbstractCanvas2D.prototype.addOp = function()
{
	if (this.path != null)
	{
		this.path.push(arguments[0]);
		
		if (arguments.length > 2)
		{
			var s = this.state;

			for (var i = 2; i < arguments.length; i += 2)
			{
				this.lastX = arguments[i - 1];
				this.lastY = arguments[i];
				
				this.path.push(this.format((this.lastX + s.dx) * s.scale));
				this.path.push(this.format((this.lastY + s.dy) * s.scale));
			}
		}
	}
};

bpmAbstractCanvas2D.prototype.rotatePoint = function(x, y, theta, cx, cy)
{
	var rad = theta * (Math.PI / 180);
	
	return bpmUtils.getRotatedPoint(new bpmPoint(x, y), Math.cos(rad),
		Math.sin(rad), new bpmPoint(cx, cy));
};

bpmAbstractCanvas2D.prototype.save = function()
{
	this.states.push(this.state);
	this.state = bpmUtils.clone(this.state);
};

bpmAbstractCanvas2D.prototype.restore = function()
{
	if (this.states.length > 0)
	{
		this.state = this.states.pop();
	}
};

bpmAbstractCanvas2D.prototype.setLink = function(link)
{
	
};

bpmAbstractCanvas2D.prototype.scale = function(value)
{
	this.state.scale *= value;
	this.state.strokeWidth *= value;
};

bpmAbstractCanvas2D.prototype.translate = function(dx, dy)
{
	this.state.dx += dx;
	this.state.dy += dy;
};

bpmAbstractCanvas2D.prototype.rotate = function(theta, flipH, flipV, cx, cy)
{
	
};

bpmAbstractCanvas2D.prototype.setAlpha = function(value)
{
	this.state.alpha = value;
};

bpmAbstractCanvas2D.prototype.setFillAlpha = function(value)
{
	this.state.fillAlpha = value;
};

bpmAbstractCanvas2D.prototype.setStrokeAlpha = function(value)
{
	this.state.strokeAlpha = value;
};


bpmAbstractCanvas2D.prototype.setFillColor = function(value)
{
	if (value == bpmConstants.NONE)
	{
		value = null;
	}
	
	this.state.fillColor = value;
	this.state.gradientColor = null;
};

bpmAbstractCanvas2D.prototype.setGradient = function(color1, color2, x, y, w, h, direction, alpha1, alpha2)
{
	var s = this.state;
	s.fillColor = color1;
	s.gradientFillAlpha = (alpha1 != null) ? alpha1 : 1;
	s.gradientColor = color2;
	s.gradientAlpha = (alpha2 != null) ? alpha2 : 1;
	s.gradientDirection = direction;
};

bpmAbstractCanvas2D.prototype.setStrokeColor = function(value)
{
	if (value == bpmConstants.NONE)
	{
		value = null;
	}
	
	this.state.strokeColor = value;
};

bpmAbstractCanvas2D.prototype.setStrokeWidth = function(value)
{
	this.state.strokeWidth = value;
};

bpmAbstractCanvas2D.prototype.setDashed = function(value, fixDash)
{
	this.state.dashed = value;
	this.state.fixDash = fixDash;
};

bpmAbstractCanvas2D.prototype.setDashPattern = function(value)
{
	this.state.dashPattern = value;
};

bpmAbstractCanvas2D.prototype.setLineCap = function(value)
{
	this.state.lineCap = value;
};

bpmAbstractCanvas2D.prototype.setLineJoin = function(value)
{
	this.state.lineJoin = value;
};

bpmAbstractCanvas2D.prototype.setMiterLimit = function(value)
{
	this.state.miterLimit = value;
};

bpmAbstractCanvas2D.prototype.setFontColor = function(value)
{
	if (value == bpmConstants.NONE)
	{
		value = null;
	}
	
	this.state.fontColor = value;
};

bpmAbstractCanvas2D.prototype.setFontBackgroundColor = function(value)
{
	if (value == bpmConstants.NONE)
	{
		value = null;
	}
	
	this.state.fontBackgroundColor = value;
};

bpmAbstractCanvas2D.prototype.setFontBorderColor = function(value)
{
	if (value == bpmConstants.NONE)
	{
		value = null;
	}
	
	this.state.fontBorderColor = value;
};

bpmAbstractCanvas2D.prototype.setFontSize = function(value)
{
	this.state.fontSize = parseFloat(value);
};

bpmAbstractCanvas2D.prototype.setFontFamily = function(value)
{
	this.state.fontFamily = value;
};

bpmAbstractCanvas2D.prototype.setFontStyle = function(value)
{
	if (value == null)
	{
		value = 0;
	}
	
	this.state.fontStyle = value;
};

bpmAbstractCanvas2D.prototype.setShadow = function(enabled)
{
	this.state.shadow = enabled;
};

bpmAbstractCanvas2D.prototype.setShadowColor = function(value)
{
	if (value == bpmConstants.NONE)
	{
		value = null;
	}
	
	this.state.shadowColor = value;
};

bpmAbstractCanvas2D.prototype.setShadowAlpha = function(value)
{
	this.state.shadowAlpha = value;
};

bpmAbstractCanvas2D.prototype.setShadowOffset = function(dx, dy)
{
	this.state.shadowDx = dx;
	this.state.shadowDy = dy;
};

bpmAbstractCanvas2D.prototype.begin = function()
{
	this.lastX = 0;
	this.lastY = 0;
	this.path = [];
};

bpmAbstractCanvas2D.prototype.moveTo = function(x, y)
{
	this.addOp(this.moveOp, x, y);
};

bpmAbstractCanvas2D.prototype.lineTo = function(x, y)
{
	this.addOp(this.lineOp, x, y);
};

bpmAbstractCanvas2D.prototype.quadTo = function(x1, y1, x2, y2)
{
	this.addOp(this.quadOp, x1, y1, x2, y2);
};

bpmAbstractCanvas2D.prototype.curveTo = function(x1, y1, x2, y2, x3, y3)
{
	this.addOp(this.curveOp, x1, y1, x2, y2, x3, y3);
};

bpmAbstractCanvas2D.prototype.arcTo = function(rx, ry, angle, largeArcFlag, sweepFlag, x, y)
{
	var curves = bpmUtils.arcToCurves(this.lastX, this.lastY, rx, ry, angle, largeArcFlag, sweepFlag, x, y);
	
	if (curves != null)
	{
		for (var i = 0; i < curves.length; i += 6) 
		{
			this.curveTo(curves[i], curves[i + 1], curves[i + 2],
				curves[i + 3], curves[i + 4], curves[i + 5]);
		}
	}
};

bpmAbstractCanvas2D.prototype.close = function(x1, y1, x2, y2, x3, y3)
{
	this.addOp(this.closeOp);
};

bpmAbstractCanvas2D.prototype.end = function() { };



/* Xml Canvas2D */
function bpmXmlCanvas2D(root)
{
	bpmAbstractCanvas2D.call(this);
	this.root = root;

	this.writeDefaults();
};

bpmUtils.extend(bpmXmlCanvas2D, bpmAbstractCanvas2D);
bpmXmlCanvas2D.prototype.textEnabled = true;
bpmXmlCanvas2D.prototype.compressed = true;

bpmXmlCanvas2D.prototype.writeDefaults = function()
{
	var elem;
	
	elem = this.createElement('fontfamily');
	elem.setAttribute('family', bpmConstants.DEFAULT_FONTFAMILY);
	this.root.appendChild(elem);
	
	elem = this.createElement('fontsize');
	elem.setAttribute('size', bpmConstants.DEFAULT_FONTSIZE);
	this.root.appendChild(elem);
	
	elem = this.createElement('shadowcolor');
	elem.setAttribute('color', bpmConstants.SHADOWCOLOR);
	this.root.appendChild(elem);
	
	elem = this.createElement('shadowalpha');
	elem.setAttribute('alpha', bpmConstants.SHADOW_OPACITY);
	this.root.appendChild(elem);
	
	elem = this.createElement('shadowoffset');
	elem.setAttribute('dx', bpmConstants.SHADOW_OFFSET_X);
	elem.setAttribute('dy', bpmConstants.SHADOW_OFFSET_Y);
	this.root.appendChild(elem);
};

bpmXmlCanvas2D.prototype.format = function(value)
{
	return parseFloat(parseFloat(value).toFixed(2));
};

bpmXmlCanvas2D.prototype.createElement = function(name)
{
	return this.root.ownerDocument.createElement(name);
};

bpmXmlCanvas2D.prototype.save = function()
{
	if (this.compressed)
	{
		bpmAbstractCanvas2D.prototype.save.apply(this, arguments);
	}
	
	this.root.appendChild(this.createElement('save'));
};

bpmXmlCanvas2D.prototype.restore = function()
{
	if (this.compressed)
	{
		bpmAbstractCanvas2D.prototype.restore.apply(this, arguments);
	}
	
	this.root.appendChild(this.createElement('restore'));
};

bpmXmlCanvas2D.prototype.scale = function(value)
{
        var elem = this.createElement('scale');
        elem.setAttribute('scale', value);
        this.root.appendChild(elem);
};

bpmXmlCanvas2D.prototype.translate = function(dx, dy)
{
	var elem = this.createElement('translate');
	elem.setAttribute('dx', this.format(dx));
	elem.setAttribute('dy', this.format(dy));
	this.root.appendChild(elem);
};

bpmXmlCanvas2D.prototype.rotate = function(theta, flipH, flipV, cx, cy)
{
	var elem = this.createElement('rotate');
	
	if (theta != 0 || flipH || flipV)
	{
		elem.setAttribute('theta', this.format(theta));
		elem.setAttribute('flipH', (flipH) ? '1' : '0');
		elem.setAttribute('flipV', (flipV) ? '1' : '0');
		elem.setAttribute('cx', this.format(cx));
		elem.setAttribute('cy', this.format(cy));
		this.root.appendChild(elem);
	}
};

bpmXmlCanvas2D.prototype.setAlpha = function(value)
{
	if (this.compressed)
	{
		if (this.state.alpha == value)
		{
			return;
		}
		
		bpmAbstractCanvas2D.prototype.setAlpha.apply(this, arguments);
	}
	
	var elem = this.createElement('alpha');
	elem.setAttribute('alpha', this.format(value));
	this.root.appendChild(elem);
};

bpmXmlCanvas2D.prototype.setFillAlpha = function(value)
{
	if (this.compressed)
	{
		if (this.state.fillAlpha == value)
		{
			return;
		}
		
		bpmAbstractCanvas2D.prototype.setFillAlpha.apply(this, arguments);
	}
	
	var elem = this.createElement('fillalpha');
	elem.setAttribute('alpha', this.format(value));
	this.root.appendChild(elem);
};

bpmXmlCanvas2D.prototype.setStrokeAlpha = function(value)
{
	if (this.compressed)
	{
		if (this.state.strokeAlpha == value)
		{
			return;
		}
		
		bpmAbstractCanvas2D.prototype.setStrokeAlpha.apply(this, arguments);
	}
	
	var elem = this.createElement('strokealpha');
	elem.setAttribute('alpha', this.format(value));
	this.root.appendChild(elem);
};

bpmXmlCanvas2D.prototype.setFillColor = function(value)
{
	if (value == bpmConstants.NONE)
	{
		value = null;
	}
	
	if (this.compressed)
	{
		if (this.state.fillColor == value)
		{
			return;
		}
		
		bpmAbstractCanvas2D.prototype.setFillColor.apply(this, arguments);
	}
	
	var elem = this.createElement('fillcolor');
	elem.setAttribute('color', (value != null) ? value : bpmConstants.NONE);
	this.root.appendChild(elem);
};

bpmXmlCanvas2D.prototype.setGradient = function(color1, color2, x, y, w, h, direction, alpha1, alpha2)
{
	if (color1 != null && color2 != null)
	{
		bpmAbstractCanvas2D.prototype.setGradient.apply(this, arguments);
		
		var elem = this.createElement('gradient');
		elem.setAttribute('c1', color1);
		elem.setAttribute('c2', color2);
		elem.setAttribute('x', this.format(x));
		elem.setAttribute('y', this.format(y));
		elem.setAttribute('w', this.format(w));
		elem.setAttribute('h', this.format(h));
		
		// Default direction is south
		if (direction != null)
		{
			elem.setAttribute('direction', direction);
		}
		
		if (alpha1 != null)
		{
			elem.setAttribute('alpha1', alpha1);
		}
		
		if (alpha2 != null)
		{
			elem.setAttribute('alpha2', alpha2);
		}
		
		this.root.appendChild(elem);
	}
};

bpmXmlCanvas2D.prototype.setStrokeColor = function(value)
{
	if (value == bpmConstants.NONE)
	{
		value = null;
	}
	
	if (this.compressed)
	{
		if (this.state.strokeColor == value)
		{
			return;
		}
		
		bpmAbstractCanvas2D.prototype.setStrokeColor.apply(this, arguments);
	}
	
	var elem = this.createElement('strokecolor');
	elem.setAttribute('color', (value != null) ? value : bpmConstants.NONE);
	this.root.appendChild(elem);
};

bpmXmlCanvas2D.prototype.setStrokeWidth = function(value)
{
	if (this.compressed)
	{
		if (this.state.strokeWidth == value)
		{
			return;
		}
		
		bpmAbstractCanvas2D.prototype.setStrokeWidth.apply(this, arguments);
	}
	
	var elem = this.createElement('strokewidth');
	elem.setAttribute('width', this.format(value));
	this.root.appendChild(elem);
};

bpmXmlCanvas2D.prototype.setDashed = function(value, fixDash)
{
	if (this.compressed)
	{
		if (this.state.dashed == value)
		{
			return;
		}
		
		bpmAbstractCanvas2D.prototype.setDashed.apply(this, arguments);
	}
	
	var elem = this.createElement('dashed');
	elem.setAttribute('dashed', (value) ? '1' : '0');
	
	if (fixDash != null)
	{
		elem.setAttribute('fixDash', (fixDash) ? '1' : '0');
	}
	
	this.root.appendChild(elem);
};

bpmXmlCanvas2D.prototype.setDashPattern = function(value)
{
	if (this.compressed)
	{
		if (this.state.dashPattern == value)
		{
			return;
		}
		
		bpmAbstractCanvas2D.prototype.setDashPattern.apply(this, arguments);
	}
	
	var elem = this.createElement('dashpattern');
	elem.setAttribute('pattern', value);
	this.root.appendChild(elem);
};

bpmXmlCanvas2D.prototype.setLineCap = function(value)
{
	if (this.compressed)
	{
		if (this.state.lineCap == value)
		{
			return;
		}
		
		bpmAbstractCanvas2D.prototype.setLineCap.apply(this, arguments);
	}
	
	var elem = this.createElement('linecap');
	elem.setAttribute('cap', value);
	this.root.appendChild(elem);
};

bpmXmlCanvas2D.prototype.setLineJoin = function(value)
{
	if (this.compressed)
	{
		if (this.state.lineJoin == value)
		{
			return;
		}
		
		bpmAbstractCanvas2D.prototype.setLineJoin.apply(this, arguments);
	}
	
	var elem = this.createElement('linejoin');
	elem.setAttribute('join', value);
	this.root.appendChild(elem);
};

bpmXmlCanvas2D.prototype.setMiterLimit = function(value)
{
	if (this.compressed)
	{
		if (this.state.miterLimit == value)
		{
			return;
		}
		
		bpmAbstractCanvas2D.prototype.setMiterLimit.apply(this, arguments);
	}
	
	var elem = this.createElement('miterlimit');
	elem.setAttribute('limit', value);
	this.root.appendChild(elem);
};

bpmXmlCanvas2D.prototype.setFontColor = function(value)
{
	if (this.textEnabled)
	{
		if (value == bpmConstants.NONE)
		{
			value = null;
		}
		
		if (this.compressed)
		{
			if (this.state.fontColor == value)
			{
				return;
			}
			
			bpmAbstractCanvas2D.prototype.setFontColor.apply(this, arguments);
		}
		
		var elem = this.createElement('fontcolor');
		elem.setAttribute('color', (value != null) ? value : bpmConstants.NONE);
		this.root.appendChild(elem);
	}
};

bpmXmlCanvas2D.prototype.setFontBackgroundColor = function(value)
{
	if (this.textEnabled)
	{
		if (value == bpmConstants.NONE)
		{
			value = null;
		}
		
		if (this.compressed)
		{
			if (this.state.fontBackgroundColor == value)
			{
				return;
			}
			
			bpmAbstractCanvas2D.prototype.setFontBackgroundColor.apply(this, arguments);
		}

		var elem = this.createElement('fontbackgroundcolor');
		elem.setAttribute('color', (value != null) ? value : bpmConstants.NONE);
		this.root.appendChild(elem);
	}
};

bpmXmlCanvas2D.prototype.setFontBorderColor = function(value)
{
	if (this.textEnabled)
	{
		if (value == bpmConstants.NONE)
		{
			value = null;
		}
		
		if (this.compressed)
		{
			if (this.state.fontBorderColor == value)
			{
				return;
			}
			
			bpmAbstractCanvas2D.prototype.setFontBorderColor.apply(this, arguments);
		}
		
		var elem = this.createElement('fontbordercolor');
		elem.setAttribute('color', (value != null) ? value : bpmConstants.NONE);
		this.root.appendChild(elem);
	}
};

bpmXmlCanvas2D.prototype.setFontSize = function(value)
{
	if (this.textEnabled)
	{
		if (this.compressed)
		{
			if (this.state.fontSize == value)
			{
				return;
			}
			
			bpmAbstractCanvas2D.prototype.setFontSize.apply(this, arguments);
		}
		
		var elem = this.createElement('fontsize');
		elem.setAttribute('size', value);
		this.root.appendChild(elem);
	}
};

bpmXmlCanvas2D.prototype.setFontFamily = function(value)
{
	if (this.textEnabled)
	{
		if (this.compressed)
		{
			if (this.state.fontFamily == value)
			{
				return;
			}
			
			bpmAbstractCanvas2D.prototype.setFontFamily.apply(this, arguments);
		}
		
		var elem = this.createElement('fontfamily');
		elem.setAttribute('family', value);
		this.root.appendChild(elem);
	}
};

bpmXmlCanvas2D.prototype.setFontStyle = function(value)
{
	if (this.textEnabled)
	{
		if (value == null)
		{
			value = 0;
		}
		
		if (this.compressed)
		{
			if (this.state.fontStyle == value)
			{
				return;
			}
			
			bpmAbstractCanvas2D.prototype.setFontStyle.apply(this, arguments);
		}
		
		var elem = this.createElement('fontstyle');
		elem.setAttribute('style', value);
		this.root.appendChild(elem);
	}
};

bpmXmlCanvas2D.prototype.setShadow = function(value)
{
	if (this.compressed)
	{
		if (this.state.shadow == value)
		{
			return;
		}
		
		bpmAbstractCanvas2D.prototype.setShadow.apply(this, arguments);
	}
	
	var elem = this.createElement('shadow');
	elem.setAttribute('enabled', (value) ? '1' : '0');
	this.root.appendChild(elem);
};

bpmXmlCanvas2D.prototype.setShadowColor = function(value)
{
	if (this.compressed)
	{
		if (value == bpmConstants.NONE)
		{
			value = null;
		}
		
		if (this.state.shadowColor == value)
		{
			return;
		}
		
		bpmAbstractCanvas2D.prototype.setShadowColor.apply(this, arguments);
	}
	
	var elem = this.createElement('shadowcolor');
	elem.setAttribute('color', (value != null) ? value : bpmConstants.NONE);
	this.root.appendChild(elem);
};

bpmXmlCanvas2D.prototype.setShadowAlpha = function(value)
{
	if (this.compressed)
	{
		if (this.state.shadowAlpha == value)
		{
			return;
		}
		
		bpmAbstractCanvas2D.prototype.setShadowAlpha.apply(this, arguments);
	}
	
	var elem = this.createElement('shadowalpha');
	elem.setAttribute('alpha', value);
	this.root.appendChild(elem);
	
};

bpmXmlCanvas2D.prototype.setShadowOffset = function(dx, dy)
{
	if (this.compressed)
	{
		if (this.state.shadowDx == dx && this.state.shadowDy == dy)
		{
			return;
		}
		
		bpmAbstractCanvas2D.prototype.setShadowOffset.apply(this, arguments);
	}
	
	var elem = this.createElement('shadowoffset');
	elem.setAttribute('dx', dx);
	elem.setAttribute('dy', dy);
	this.root.appendChild(elem);
	
};

bpmXmlCanvas2D.prototype.rect = function(x, y, w, h)
{
	var elem = this.createElement('rect');
	elem.setAttribute('x', this.format(x));
	elem.setAttribute('y', this.format(y));
	elem.setAttribute('w', this.format(w));
	elem.setAttribute('h', this.format(h));
	this.root.appendChild(elem);
};

bpmXmlCanvas2D.prototype.roundrect = function(x, y, w, h, dx, dy)
{
	var elem = this.createElement('roundrect');
	elem.setAttribute('x', this.format(x));
	elem.setAttribute('y', this.format(y));
	elem.setAttribute('w', this.format(w));
	elem.setAttribute('h', this.format(h));
	elem.setAttribute('dx', this.format(dx));
	elem.setAttribute('dy', this.format(dy));
	this.root.appendChild(elem);
};

bpmXmlCanvas2D.prototype.ellipse = function(x, y, w, h)
{
	var elem = this.createElement('ellipse');
	elem.setAttribute('x', this.format(x));
	elem.setAttribute('y', this.format(y));
	elem.setAttribute('w', this.format(w));
	elem.setAttribute('h', this.format(h));
	this.root.appendChild(elem);
};

bpmXmlCanvas2D.prototype.image = function(x, y, w, h, src, aspect, flipH, flipV)
{
	src = this.converter.convert(src);
	
	var elem = this.createElement('image');
	elem.setAttribute('x', this.format(x));
	elem.setAttribute('y', this.format(y));
	elem.setAttribute('w', this.format(w));
	elem.setAttribute('h', this.format(h));
	elem.setAttribute('src', src);
	elem.setAttribute('aspect', (aspect) ? '1' : '0');
	elem.setAttribute('flipH', (flipH) ? '1' : '0');
	elem.setAttribute('flipV', (flipV) ? '1' : '0');
	this.root.appendChild(elem);
};

bpmXmlCanvas2D.prototype.begin = function()
{
	this.root.appendChild(this.createElement('begin'));
	this.lastX = 0;
	this.lastY = 0;
};

bpmXmlCanvas2D.prototype.moveTo = function(x, y)
{
	var elem = this.createElement('move');
	elem.setAttribute('x', this.format(x));
	elem.setAttribute('y', this.format(y));
	this.root.appendChild(elem);
	this.lastX = x;
	this.lastY = y;
};

bpmXmlCanvas2D.prototype.lineTo = function(x, y)
{
	var elem = this.createElement('line');
	elem.setAttribute('x', this.format(x));
	elem.setAttribute('y', this.format(y));
	this.root.appendChild(elem);
	this.lastX = x;
	this.lastY = y;
};

bpmXmlCanvas2D.prototype.quadTo = function(x1, y1, x2, y2)
{
	var elem = this.createElement('quad');
	elem.setAttribute('x1', this.format(x1));
	elem.setAttribute('y1', this.format(y1));
	elem.setAttribute('x2', this.format(x2));
	elem.setAttribute('y2', this.format(y2));
	this.root.appendChild(elem);
	this.lastX = x2;
	this.lastY = y2;
};

bpmXmlCanvas2D.prototype.curveTo = function(x1, y1, x2, y2, x3, y3)
{
	var elem = this.createElement('curve');
	elem.setAttribute('x1', this.format(x1));
	elem.setAttribute('y1', this.format(y1));
	elem.setAttribute('x2', this.format(x2));
	elem.setAttribute('y2', this.format(y2));
	elem.setAttribute('x3', this.format(x3));
	elem.setAttribute('y3', this.format(y3));
	this.root.appendChild(elem);
	this.lastX = x3;
	this.lastY = y3;
};

bpmXmlCanvas2D.prototype.close = function()
{
	this.root.appendChild(this.createElement('close'));
};

bpmXmlCanvas2D.prototype.text = function(x, y, w, h, str, align, valign, wrap, format, overflow, clip, rotation, dir)
{
	if (this.textEnabled && str != null)
	{
		if (bpmUtils.isNode(str))
		{
			str = bpmUtils.getOuterHtml(str);
		}
		
		var elem = this.createElement('text');
		elem.setAttribute('x', this.format(x));
		elem.setAttribute('y', this.format(y));
		elem.setAttribute('w', this.format(w));
		elem.setAttribute('h', this.format(h));
		elem.setAttribute('str', str);
		
		if (align != null)
		{
			elem.setAttribute('align', align);
		}
		
		if (valign != null)
		{
			elem.setAttribute('valign', valign);
		}
		
		elem.setAttribute('wrap', (wrap) ? '1' : '0');
		
		if (format == null)
		{
			format = '';
		}
		
		elem.setAttribute('format', format);
		
		if (overflow != null)
		{
			elem.setAttribute('overflow', overflow);
		}
		
		if (clip != null)
		{
			elem.setAttribute('clip', (clip) ? '1' : '0');
		}
		
		if (rotation != null)
		{
			elem.setAttribute('rotation', rotation);
		}
		
		if (dir != null)
		{
			elem.setAttribute('dir', dir);
		}
		
		this.root.appendChild(elem);
	}
};

bpmXmlCanvas2D.prototype.stroke = function()
{
	this.root.appendChild(this.createElement('stroke'));
};

bpmXmlCanvas2D.prototype.fill = function()
{
	this.root.appendChild(this.createElement('fill'));
};

bpmXmlCanvas2D.prototype.fillAndStroke = function()
{
	this.root.appendChild(this.createElement('fillstroke'));
};



/* Svg Canvas2D */
function bpmSvgCanvas2D(root, styleEnabled)
{
	bpmAbstractCanvas2D.call(this);

	this.root = root;

	this.gradients = [];

	this.defs = null;
	
	this.styleEnabled = (styleEnabled != null) ? styleEnabled : false;
	
	var svg = null;
	
	if (root.ownerDocument != document)
	{
		var node = root;

		while (node != null && node.nodeName != 'svg')
		{
			node = node.parentNode;
		}
		
		svg = node;
	}

	if (svg != null)
	{
		var tmp = svg.getElementsByTagName('defs');
		
		if (tmp.length > 0)
		{
			this.defs = svg.getElementsByTagName('defs')[0];
		}
		
		if (this.defs == null)
		{
			this.defs = this.createElement('defs');
			
			if (svg.firstChild != null)
			{
				svg.insertBefore(this.defs, svg.firstChild);
			}
			else
			{
				svg.appendChild(this.defs);
			}
		}

		if (this.styleEnabled)
		{
			this.defs.appendChild(this.createStyle());
		}
	}
};

bpmUtils.extend(bpmSvgCanvas2D, bpmAbstractCanvas2D);

(function()
{
	bpmSvgCanvas2D.prototype.useDomParser = !bpmCore.IS_IE && typeof DOMParser === 'function' && typeof XMLSerializer === 'function';
	
	if (bpmSvgCanvas2D.prototype.useDomParser)
	{
		try
		{
			var doc = new DOMParser().parseFromString('test text', 'text/html');
			bpmSvgCanvas2D.prototype.useDomParser = doc != null;
		}
		catch (e)
		{
			bpmSvgCanvas2D.prototype.useDomParser = false;
		}
	}
})();

bpmSvgCanvas2D.prototype.node = null;
bpmSvgCanvas2D.prototype.matchHtmlAlignment = true;
bpmSvgCanvas2D.prototype.textEnabled = true;
bpmSvgCanvas2D.prototype.foEnabled = true;
bpmSvgCanvas2D.prototype.foAltText = '[Object]';
bpmSvgCanvas2D.prototype.foOffset = 0;
bpmSvgCanvas2D.prototype.textOffset = 0;
bpmSvgCanvas2D.prototype.imageOffset = 0;
bpmSvgCanvas2D.prototype.strokeTolerance = 0;
bpmSvgCanvas2D.prototype.minStrokeWidth = 1;
bpmSvgCanvas2D.prototype.refCount = 0;
bpmSvgCanvas2D.prototype.blockImagePointerEvents = false;
bpmSvgCanvas2D.prototype.lineHeightCorrection = 1;
bpmSvgCanvas2D.prototype.pointerEventsValue = 'all';
bpmSvgCanvas2D.prototype.fontMetricsPadding = 10;
bpmSvgCanvas2D.prototype.cacheOffsetSize = true;

bpmSvgCanvas2D.prototype.format = function(value)
{
	return parseFloat(parseFloat(value).toFixed(2));
};

bpmSvgCanvas2D.prototype.getBaseUrl = function()
{
	var href = window.location.href;
	var hash = href.lastIndexOf('#');
	
	if (hash > 0)
	{
		href = href.substring(0, hash);
	}
	
	return href;
};

bpmSvgCanvas2D.prototype.reset = function()
{
	bpmAbstractCanvas2D.prototype.reset.apply(this, arguments);
	this.gradients = [];
};

bpmSvgCanvas2D.prototype.createStyle = function(x)
{
	var style = this.createElement('style');
	style.setAttribute('type', 'text/css');
	bpmUtils.write(style, 'svg{font-family:' + bpmConstants.DEFAULT_FONTFAMILY +
			';font-size:' + bpmConstants.DEFAULT_FONTSIZE +
			';fill:none;stroke-miterlimit:10}');
	
	return style;
};

bpmSvgCanvas2D.prototype.createElement = function(tagName, namespace)
{
	if (this.root.ownerDocument.createElementNS != null)
	{
		return this.root.ownerDocument.createElementNS(namespace || bpmConstants.NS_SVG, tagName);
	}
	else
	{
		var elt = this.root.ownerDocument.createElement(tagName);
		
		if (namespace != null)
		{
			elt.setAttribute('xmlns', namespace);
		}
		
		return elt;
	}
};

bpmSvgCanvas2D.prototype.createAlternateContent = function(fo, x, y, w, h, str, align, valign, wrap, format, overflow, clip, rotation)
{
	if (this.foAltText != null)
	{
		var s = this.state;
		var alt = this.createElement('text');
		alt.setAttribute('x', Math.round(w / 2));
		alt.setAttribute('y', Math.round((h + s.fontSize) / 2));
		alt.setAttribute('fill', s.fontColor || 'black');
		alt.setAttribute('text-anchor', 'middle');
		alt.setAttribute('font-size', s.fontSize + 'px');
		alt.setAttribute('font-family', s.fontFamily);
		
		if ((s.fontStyle & bpmConstants.FONT_BOLD) == bpmConstants.FONT_BOLD)
		{
			alt.setAttribute('font-weight', 'bold');
		}
		
		if ((s.fontStyle & bpmConstants.FONT_ITALIC) == bpmConstants.FONT_ITALIC)
		{
			alt.setAttribute('font-style', 'italic');
		}
		
		if ((s.fontStyle & bpmConstants.FONT_UNDERLINE) == bpmConstants.FONT_UNDERLINE)
		{
			alt.setAttribute('text-decoration', 'underline');
		}
		
		bpmUtils.write(alt, this.foAltText);
		
		return alt;
	}
	else
	{
		return null;
	}
};

bpmSvgCanvas2D.prototype.createGradientId = function(start, end, alpha1, alpha2, direction)
{

	if (start.charAt(0) == '#')
	{
		start = start.substring(1);
	}
	
	if (end.charAt(0) == '#')
	{
		end = end.substring(1);
	}
	
	start = start.toLowerCase() + '-' + alpha1;
	end = end.toLowerCase() + '-' + alpha2;

	var dir = null;
	
	if (direction == null || direction == bpmConstants.DIRECTION_SOUTH)
	{
		dir = 's';
	}
	else if (direction == bpmConstants.DIRECTION_EAST)
	{
		dir = 'e';
	}
	else
	{
		var tmp = start;
		start = end;
		end = tmp;
		
		if (direction == bpmConstants.DIRECTION_NORTH)
		{
			dir = 's';
		}
		else if (direction == bpmConstants.DIRECTION_WEST)
		{
			dir = 'e';
		}
	}
	
	return 'bpm-gradient-' + start + '-' + end + '-' + dir;
};

bpmSvgCanvas2D.prototype.getSvgGradient = function(start, end, alpha1, alpha2, direction)
{
	var id = this.createGradientId(start, end, alpha1, alpha2, direction);
	var gradient = this.gradients[id];
	
	if (gradient == null)
	{
		var svg = this.root.ownerSVGElement;

		var counter = 0;
		var tmpId = id + '-' + counter;

		if (svg != null)
		{
			gradient = svg.ownerDocument.getElementById(tmpId);
			
			while (gradient != null && gradient.ownerSVGElement != svg)
			{
				tmpId = id + '-' + counter++;
				gradient = svg.ownerDocument.getElementById(tmpId);
			}
		}
		else
		{
			tmpId = 'id' + (++this.refCount);
		}
		
		if (gradient == null)
		{
			gradient = this.createSvgGradient(start, end, alpha1, alpha2, direction);
			gradient.setAttribute('id', tmpId);
			
			if (this.defs != null)
			{
				this.defs.appendChild(gradient);
			}
			else
			{
				svg.appendChild(gradient);
			}
		}

		this.gradients[id] = gradient;
	}

	return gradient.getAttribute('id');
};

bpmSvgCanvas2D.prototype.createSvgGradient = function(start, end, alpha1, alpha2, direction)
{
	var gradient = this.createElement('linearGradient');
	gradient.setAttribute('x1', '0%');
	gradient.setAttribute('y1', '0%');
	gradient.setAttribute('x2', '0%');
	gradient.setAttribute('y2', '0%');
	
	if (direction == null || direction == bpmConstants.DIRECTION_SOUTH)
	{
		gradient.setAttribute('y2', '100%');
	}
	else if (direction == bpmConstants.DIRECTION_EAST)
	{
		gradient.setAttribute('x2', '100%');
	}
	else if (direction == bpmConstants.DIRECTION_NORTH)
	{
		gradient.setAttribute('y1', '100%');
	}
	else if (direction == bpmConstants.DIRECTION_WEST)
	{
		gradient.setAttribute('x1', '100%');
	}
	
	var op = (alpha1 < 1) ? ';stop-opacity:' + alpha1 : '';
	
	var stop = this.createElement('stop');
	stop.setAttribute('offset', '0%');
	stop.setAttribute('style', 'stop-color:' + start + op);
	gradient.appendChild(stop);
	
	op = (alpha2 < 1) ? ';stop-opacity:' + alpha2 : '';
	
	stop = this.createElement('stop');
	stop.setAttribute('offset', '100%');
	stop.setAttribute('style', 'stop-color:' + end + op);
	gradient.appendChild(stop);
	
	return gradient;
};

bpmSvgCanvas2D.prototype.addNode = function(filled, stroked)
{
	var node = this.node;
	var s = this.state;

	if (node != null)
	{
		if (node.nodeName == 'path')
		{
			if (this.path != null && this.path.length > 0)
			{
				node.setAttribute('d', this.path.join(' '));
			}
			else
			{
				return;
			}
		}

		if (filled && s.fillColor != null)
		{
			this.updateFill();
		}
		else if (!this.styleEnabled)
		{
			if (node.nodeName == 'ellipse' && bpmCore.IS_FF)
			{
				node.setAttribute('fill', 'transparent');
			}
			else
			{
				node.setAttribute('fill', 'none');
			}
			
			filled = false;
		}
		
		if (stroked && s.strokeColor != null)
		{
			this.updateStroke();
		}
		else if (!this.styleEnabled)
		{
			node.setAttribute('stroke', 'none');
		}
		
		if (s.transform != null && s.transform.length > 0)
		{
			node.setAttribute('transform', s.transform);
		}
		
		if (s.shadow)
		{
			this.root.appendChild(this.createShadow(node));
		}
	
		if (this.strokeTolerance > 0 && !filled)
		{
			this.root.appendChild(this.createTolerance(node));
		}

		if (this.pointerEvents)
		{
			node.setAttribute('pointer-events', this.pointerEventsValue);
		}
		else if (!this.pointerEvents && this.originalRoot == null)
		{
			node.setAttribute('pointer-events', 'none');
		}
		
		if ((node.nodeName != 'rect' && node.nodeName != 'path' && node.nodeName != 'ellipse') ||
			(node.getAttribute('fill') != 'none' && node.getAttribute('fill') != 'transparent') ||
			node.getAttribute('stroke') != 'none' || node.getAttribute('pointer-events') != 'none')
		{	
			this.root.appendChild(node);
		}
		
		this.node = null;
	}
};

bpmSvgCanvas2D.prototype.updateFill = function()
{
	var s = this.state;
	
	if (s.alpha < 1 || s.fillAlpha < 1)
	{
		this.node.setAttribute('fill-opacity', s.alpha * s.fillAlpha);
	}
	
	if (s.fillColor != null)
	{
		if (s.gradientColor != null)
		{
			var id = this.getSvgGradient(String(s.fillColor), String(s.gradientColor),
				s.gradientFillAlpha, s.gradientAlpha, s.gradientDirection);
			
			if (!bpmCore.IS_CHROME_APP && !bpmCore.IS_IE && !bpmCore.IS_IE11 &&
				!bpmCore.IS_EDGE && this.root.ownerDocument == document)
			{
				// Workaround for potential base tag and brackets must be escaped
				var base = this.getBaseUrl().replace(/([\(\)])/g, '\\$1');
				this.node.setAttribute('fill', 'url(' + base + '#' + id + ')');
			}
			else
			{
				this.node.setAttribute('fill', 'url(#' + id + ')');
			}
		}
		else
		{
			this.node.setAttribute('fill', String(s.fillColor).toLowerCase());
		}
	}
};

bpmSvgCanvas2D.prototype.getCurrentStrokeWidth = function()
{
	return Math.max(this.minStrokeWidth, Math.max(0.01, this.format(this.state.strokeWidth * this.state.scale)));
};

bpmSvgCanvas2D.prototype.updateStroke = function()
{
	var s = this.state;

	this.node.setAttribute('stroke', String(s.strokeColor).toLowerCase());
	
	if (s.alpha < 1 || s.strokeAlpha < 1)
	{
		this.node.setAttribute('stroke-opacity', s.alpha * s.strokeAlpha);
	}
	
	var sw = this.getCurrentStrokeWidth();
	
	if (sw != 1)
	{
		this.node.setAttribute('stroke-width', sw);
	}
	
	if (this.node.nodeName == 'path')
	{
		this.updateStrokeAttributes();
	}
	
	if (s.dashed)
	{
		this.node.setAttribute('stroke-dasharray', this.createDashPattern(
			((s.fixDash) ? 1 : s.strokeWidth) * s.scale));
	}
};

bpmSvgCanvas2D.prototype.updateStrokeAttributes = function()
{
	var s = this.state;
	
	if (s.lineJoin != null && s.lineJoin != 'miter')
	{
		this.node.setAttribute('stroke-linejoin', s.lineJoin);
	}
	
	if (s.lineCap != null)
	{
		var value = s.lineCap;
		
		if (value == 'flat')
		{
			value = 'butt';
		}

		if (value != 'butt')
		{
			this.node.setAttribute('stroke-linecap', value);
		}
	}
	
	if (s.miterLimit != null && (!this.styleEnabled || s.miterLimit != 10))
	{
		this.node.setAttribute('stroke-miterlimit', s.miterLimit);
	}
};

bpmSvgCanvas2D.prototype.createDashPattern = function(scale)
{
	var pat = [];
	
	if (typeof(this.state.dashPattern) === 'string')
	{
		var dash = this.state.dashPattern.split(' ');
		
		if (dash.length > 0)
		{
			for (var i = 0; i < dash.length; i++)
			{
				pat[i] = Number(dash[i]) * scale;
			}
		}
	}
	
	return pat.join(' ');
};

bpmSvgCanvas2D.prototype.createTolerance = function(node)
{
	var tol = node.cloneNode(true);
	var sw = parseFloat(tol.getAttribute('stroke-width') || 1) + this.strokeTolerance;
	tol.setAttribute('pointer-events', 'stroke');
	tol.setAttribute('visibility', 'hidden');
	tol.removeAttribute('stroke-dasharray');
	tol.setAttribute('stroke-width', sw);
	tol.setAttribute('fill', 'none');
	
	tol.setAttribute('stroke', (bpmCore.IS_OT) ? 'none' : 'white');
	
	return tol;
};

bpmSvgCanvas2D.prototype.createShadow = function(node)
{
	var shadow = node.cloneNode(true);
	var s = this.state;

	if (shadow.getAttribute('fill') != 'none' && (!bpmCore.IS_FF || shadow.getAttribute('fill') != 'transparent'))
	{
		shadow.setAttribute('fill', s.shadowColor);
	}
	
	if (shadow.getAttribute('stroke') != 'none')
	{
		shadow.setAttribute('stroke', s.shadowColor);
	}

	shadow.setAttribute('transform', 'translate(' + this.format(s.shadowDx * s.scale) +
		',' + this.format(s.shadowDy * s.scale) + ')' + (s.transform || ''));
	shadow.setAttribute('opacity', s.shadowAlpha);
	
	return shadow;
};

bpmSvgCanvas2D.prototype.setLink = function(link)
{
	if (link == null)
	{
		this.root = this.originalRoot;
	}
	else
	{
		this.originalRoot = this.root;
		
		var node = this.createElement('a');
		
		if (node.setAttributeNS == null || (this.root.ownerDocument != document && document.documentMode == null))
		{
			node.setAttribute('xlink:href', link);
		}
		else
		{
			node.setAttributeNS(bpmConstants.NS_XLINK, 'xlink:href', link);
		}
		
		this.root.appendChild(node);
		this.root = node;
	}
};

bpmSvgCanvas2D.prototype.rotate = function(theta, flipH, flipV, cx, cy)
{
	if (theta != 0 || flipH || flipV)
	{
		var s = this.state;
		cx += s.dx;
		cy += s.dy;
	
		cx *= s.scale;
		cy *= s.scale;

		s.transform = s.transform || '';
		
		if (flipH && flipV)
		{
			theta += 180;
		}
		else if (flipH != flipV)
		{
			var tx = (flipH) ? cx : 0;
			var sx = (flipH) ? -1 : 1;
	
			var ty = (flipV) ? cy : 0;
			var sy = (flipV) ? -1 : 1;

			s.transform += 'translate(' + this.format(tx) + ',' + this.format(ty) + ')' +
				'scale(' + this.format(sx) + ',' + this.format(sy) + ')' +
				'translate(' + this.format(-tx) + ',' + this.format(-ty) + ')';
		}
		
		if (flipH ? !flipV : flipV)
		{
			theta *= -1;
		}
		
		if (theta != 0)
		{
			s.transform += 'rotate(' + this.format(theta) + ',' + this.format(cx) + ',' + this.format(cy) + ')';
		}
		
		s.rotation = s.rotation + theta;
		s.rotationCx = cx;
		s.rotationCy = cy;
	}
};

bpmSvgCanvas2D.prototype.begin = function()
{
	bpmAbstractCanvas2D.prototype.begin.apply(this, arguments);
	this.node = this.createElement('path');
};

bpmSvgCanvas2D.prototype.rect = function(x, y, w, h)
{
	var s = this.state;
	var n = this.createElement('rect');
	n.setAttribute('x', this.format((x + s.dx) * s.scale));
	n.setAttribute('y', this.format((y + s.dy) * s.scale));
	n.setAttribute('width', this.format(w * s.scale));
	n.setAttribute('height', this.format(h * s.scale));
	
	this.node = n;
};

bpmSvgCanvas2D.prototype.roundrect = function(x, y, w, h, dx, dy)
{
	this.rect(x, y, w, h);
	
	if (dx > 0)
	{
		this.node.setAttribute('rx', this.format(dx * this.state.scale));
	}
	
	if (dy > 0)
	{
		this.node.setAttribute('ry', this.format(dy * this.state.scale));
	}
};

bpmSvgCanvas2D.prototype.ellipse = function(x, y, w, h)
{
	var s = this.state;
	var n = this.createElement('ellipse');
	// No rounding for consistent output with 1.x
	n.setAttribute('cx', this.format((x + w / 2 + s.dx) * s.scale));
	n.setAttribute('cy', this.format((y + h / 2 + s.dy) * s.scale));
	n.setAttribute('rx', w / 2 * s.scale);
	n.setAttribute('ry', h / 2 * s.scale);
	this.node = n;
};

bpmSvgCanvas2D.prototype.image = function(x, y, w, h, src, aspect, flipH, flipV)
{
	src = this.converter.convert(src);
	
	aspect = (aspect != null) ? aspect : true;
	flipH = (flipH != null) ? flipH : false;
	flipV = (flipV != null) ? flipV : false;
	
	var s = this.state;
	x += s.dx;
	y += s.dy;
	
	var node = this.createElement('image');
	node.setAttribute('x', this.format(x * s.scale) + this.imageOffset);
	node.setAttribute('y', this.format(y * s.scale) + this.imageOffset);
	node.setAttribute('width', this.format(w * s.scale));
	node.setAttribute('height', this.format(h * s.scale));
	
	if (node.setAttributeNS == null)
	{
		node.setAttribute('xlink:href', src);
	}
	else
	{
		node.setAttributeNS(bpmConstants.NS_XLINK, 'xlink:href', src);
	}
	
	if (!aspect)
	{
		node.setAttribute('preserveAspectRatio', 'none');
	}

	if (s.alpha < 1 || s.fillAlpha < 1)
	{
		node.setAttribute('opacity', s.alpha * s.fillAlpha);
	}
	
	var tr = this.state.transform || '';
	
	if (flipH || flipV)
	{
		var sx = 1;
		var sy = 1;
		var dx = 0;
		var dy = 0;
		
		if (flipH)
		{
			sx = -1;
			dx = -w - 2 * x;
		}
		
		if (flipV)
		{
			sy = -1;
			dy = -h - 2 * y;
		}
		
		tr += 'scale(' + sx + ',' + sy + ')translate(' + (dx * s.scale) + ',' + (dy * s.scale) + ')';
	}

	if (tr.length > 0)
	{
		node.setAttribute('transform', tr);
	}
	
	if (!this.pointerEvents)
	{
		node.setAttribute('pointer-events', 'none');
	}
	
	this.root.appendChild(node);
	
	if (this.blockImagePointerEvents)
	{
		node.setAttribute('style', 'pointer-events:none');
		
		node = this.createElement('rect');
		node.setAttribute('visibility', 'hidden');
		node.setAttribute('pointer-events', 'fill');
		node.setAttribute('x', this.format(x * s.scale));
		node.setAttribute('y', this.format(y * s.scale));
		node.setAttribute('width', this.format(w * s.scale));
		node.setAttribute('height', this.format(h * s.scale));
		this.root.appendChild(node);
	}
};

bpmSvgCanvas2D.prototype.convertHtml = function(val)
{
	if (this.useDomParser)
	{
		var doc = new DOMParser().parseFromString(val, 'text/html');

		if (doc != null)
		{
			val = new XMLSerializer().serializeToString(doc.body);
			
			if (val.substring(0, 5) == '<body')
			{
				val = val.substring(val.indexOf('>', 5) + 1);
			}
			
			if (val.substring(val.length - 7, val.length) == '</body>')
			{
				val = val.substring(0, val.length - 7);
			}
		}
	}
	else if (document.implementation != null && document.implementation.createDocument != null)
	{
		var xd = document.implementation.createDocument('http://www.w3.org/1999/xhtml', 'html', null);
		var xb = xd.createElement('body');
		xd.documentElement.appendChild(xb);
		
		var div = document.createElement('div');
		div.innerHTML = val;
		var child = div.firstChild;
		
		while (child != null)
		{
			var next = child.nextSibling;
			xb.appendChild(xd.adoptNode(child));
			child = next;
		}
		
		return xb.innerHTML;
	}
	else
	{
		var ta = document.createElement('textarea');
		
		ta.innerHTML = val.replace(/&amp;/g, '&amp;amp;').
			replace(/&#60;/g, '&amp;lt;').replace(/&#62;/g, '&amp;gt;').
			replace(/&lt;/g, '&amp;lt;').replace(/&gt;/g, '&amp;gt;').
			replace(/</g, '&lt;').replace(/>/g, '&gt;');
		val = ta.value.replace(/&/g, '&amp;').replace(/&amp;lt;/g, '&lt;').
			replace(/&amp;gt;/g, '&gt;').replace(/&amp;amp;/g, '&amp;').
			replace(/<br>/g, '<br />').replace(/<hr>/g, '<hr />').
			replace(/(<img[^>]+)>/gm, "$1 />");
	}
	
	return val;
};

bpmSvgCanvas2D.prototype.createDiv = function(str, align, valign, style, overflow, whiteSpace)
{
	var s = this.state;
	var lh = (bpmConstants.ABSOLUTE_LINE_HEIGHT) ? (s.fontSize * bpmConstants.LINE_HEIGHT) + 'px' :
		(bpmConstants.LINE_HEIGHT * this.lineHeightCorrection);
	
	style = 'display:inline-block;font-size:' + s.fontSize + 'px;font-family:' + s.fontFamily +
		';color:' + s.fontColor + ';line-height:' + lh + ';' + style;

	if ((s.fontStyle & bpmConstants.FONT_BOLD) == bpmConstants.FONT_BOLD)
	{
		style += 'font-weight:bold;';
	}

	if ((s.fontStyle & bpmConstants.FONT_ITALIC) == bpmConstants.FONT_ITALIC)
	{
		style += 'font-style:italic;';
	}
	
	if ((s.fontStyle & bpmConstants.FONT_UNDERLINE) == bpmConstants.FONT_UNDERLINE)
	{
		style += 'text-decoration:underline;';
	}
	
	if (align == bpmConstants.ALIGN_CENTER)
	{
		style += 'text-align:center;';
	}
	else if (align == bpmConstants.ALIGN_RIGHT)
	{
		style += 'text-align:right;';
	}
	else
	{
		style += 'text-align:left;';
	}

	var css = '';
	
	if (s.fontBackgroundColor != null)
	{
		css += 'background-color:' + bpmUtils.htmlEntities(s.fontBackgroundColor) + ';';
	}
	
	if (s.fontBorderColor != null)
	{
		css += 'border:1px solid ' + bpmUtils.htmlEntities(s.fontBorderColor) + ';';
	}
	
	var val = str;
	
	if (!bpmUtils.isNode(val))
	{
		val = this.convertHtml(val);
		
		if (overflow != 'fill' && overflow != 'width')
		{
			if (whiteSpace != null)
			{
				css += 'white-space:' + whiteSpace + ';';
			}
			val = '<div xmlns="http://www.w3.org/1999/xhtml" style="display:inline-block;text-align:inherit;text-decoration:inherit;' + css + '">' + val + '</div>';
		}
		else
		{
			style += css;
		}
	}

	if (!bpmCore.IS_IE && document.createElementNS)
	{
		var div = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
		div.setAttribute('style', style);
		
		if (bpmUtils.isNode(val))
		{
			if (this.root.ownerDocument != document)
			{
				div.appendChild(val.cloneNode(true));
			}
			else
			{
				div.appendChild(val);
			}
		}
		else
		{
			div.innerHTML = val;
		}
		
		return div;
	}
	else
	{
		if (bpmUtils.isNode(val) && this.root.ownerDocument != document)
		{
			val = val.outerHTML;
		}

		return bpmUtils.parseXml('<div xmlns="http://www.w3.org/1999/xhtml" style="' + style + 
			'">' + val + '</div>').documentElement;
	}
};

bpmSvgCanvas2D.prototype.invalidateCachedOffsetSize = function(node)
{
	delete node.firstChild.bpmCachedOffsetWidth;
	delete node.firstChild.bpmCachedFinalOffsetWidth;
	delete node.firstChild.bpmCachedFinalOffsetHeight;
};

bpmSvgCanvas2D.prototype.updateText = function(x, y, w, h, align, valign, wrap, overflow, clip, rotation, node)
{
	if (node != null && node.firstChild != null && node.firstChild.firstChild != null &&
		node.firstChild.firstChild.firstChild != null)
	{
		var group = node.firstChild;
		var fo = group.firstChild;
		var div = fo.firstChild;

		rotation = (rotation != null) ? rotation : 0;
		
		var s = this.state;
		x += s.dx;
		y += s.dy;
		
		if (clip)
		{
			div.style.maxHeight = Math.round(h) + 'px';
			div.style.maxWidth = Math.round(w) + 'px';
		}
		else if (overflow == 'fill')
		{
			div.style.width = Math.round(w + 1) + 'px';
			div.style.height = Math.round(h + 1) + 'px';
		}
		else if (overflow == 'width')
		{
			div.style.width = Math.round(w + 1) + 'px';
			
			if (h > 0)
			{
				div.style.maxHeight = Math.round(h) + 'px';
			}
		}

		if (wrap && w > 0)
		{
			div.style.width = Math.round(w + 1) + 'px';
		}
		
		var ow = 0;
		var oh = 0;
		
		var padX = 0;
		var padY = 2;

		var sizeDiv = div;
		
		if (sizeDiv.firstChild != null && sizeDiv.firstChild.nodeName == 'DIV')
		{
			sizeDiv = sizeDiv.firstChild;
		}
		
		var tmp = (group.bpmCachedOffsetWidth != null) ? group.bpmCachedOffsetWidth : sizeDiv.offsetWidth;
		ow = tmp + padX;
		if (wrap && overflow != 'fill')
		{
			if (clip)
			{
				ow = Math.min(ow, w);
			}
			
			div.style.width = Math.round(ow + 1) + 'px';
		}

		ow = (group.bpmCachedFinalOffsetWidth != null) ? group.bpmCachedFinalOffsetWidth : sizeDiv.offsetWidth;
		oh = (group.bpmCachedFinalOffsetHeight != null) ? group.bpmCachedFinalOffsetHeight : sizeDiv.offsetHeight;
		
		if (this.cacheOffsetSize)
		{
			group.bpmCachedOffsetWidth = tmp;
			group.bpmCachedFinalOffsetWidth = ow;
			group.bpmCachedFinalOffsetHeight = oh;
		}
		
		ow += padX;
		oh -= 2;
		
		if (clip)
		{
			oh = Math.min(oh, h);
			ow = Math.min(ow, w);
		}

		if (overflow == 'width')
		{
			h = oh;
		}
		else if (overflow != 'fill')
		{
			w = ow;
			h = oh;
		}

		var dx = 0;
		var dy = 0;

		if (align == bpmConstants.ALIGN_CENTER)
		{
			dx -= w / 2;
		}
		else if (align == bpmConstants.ALIGN_RIGHT)
		{
			dx -= w;
		}
		
		x += dx;
		
		if (valign == bpmConstants.ALIGN_MIDDLE)
		{
			dy -= h / 2;
		}
		else if (valign == bpmConstants.ALIGN_BOTTOM)
		{
			dy -= h;
		}
		
		if (overflow != 'fill' && bpmCore.IS_FF && bpmCore.IS_WIN)
		{
			dy -= 2;
		}
		
		y += dy;

		var tr = (s.scale != 1) ? 'scale(' + s.scale + ')' : '';

		if (s.rotation != 0 && this.rotateHtml)
		{
			tr += 'rotate(' + (s.rotation) + ',' + (w / 2) + ',' + (h / 2) + ')';
			var pt = this.rotatePoint((x + w / 2) * s.scale, (y + h / 2) * s.scale,
				s.rotation, s.rotationCx, s.rotationCy);
			x = pt.x - w * s.scale / 2;
			y = pt.y - h * s.scale / 2;
		}
		else
		{
			x *= s.scale;
			y *= s.scale;
		}

		if (rotation != 0)
		{
			tr += 'rotate(' + (rotation) + ',' + (-dx) + ',' + (-dy) + ')';
		}

		group.setAttribute('transform', 'translate(' + Math.round(x) + ',' + Math.round(y) + ')' + tr);
		fo.setAttribute('width', Math.round(Math.max(1, w)));
		fo.setAttribute('height', Math.round(Math.max(1, h)));
	}
};

bpmSvgCanvas2D.prototype.text = function(x, y, w, h, str, align, valign, wrap, format, overflow, clip, rotation, dir)
{
	if (this.textEnabled && str != null)
	{
		rotation = (rotation != null) ? rotation : 0;
		
		var s = this.state;
		x += s.dx;
		y += s.dy;
		
		if (this.foEnabled && format == 'html')
		{
			var style = 'vertical-align:top;';
			
			if (clip)
			{
				style += 'overflow:hidden;max-height:' + Math.round(h) + 'px;max-width:' + Math.round(w) + 'px;';
			}
			else if (overflow == 'fill')
			{
				style += 'width:' + Math.round(w + 1) + 'px;height:' + Math.round(h + 1) + 'px;overflow:hidden;';
			}
			else if (overflow == 'width')
			{
				style += 'width:' + Math.round(w + 1) + 'px;';
				
				if (h > 0)
				{
					style += 'max-height:' + Math.round(h) + 'px;overflow:hidden;';
				}
			}

			if (wrap && w > 0)
			{
				style += 'width:' + Math.round(w + 1) + 'px;white-space:normal;word-wrap:' +
					bpmConstants.WORD_WRAP + ';';
			}
			else
			{
				style += 'white-space:nowrap;';
			}
			
			var group = this.createElement('g');
			
			if (s.alpha < 1)
			{
				group.setAttribute('opacity', s.alpha);
			}

			var fo = this.createElement('foreignObject');
			fo.setAttribute('style', 'overflow:visible;');
			fo.setAttribute('pointer-events', 'all');
			
			var div = this.createDiv(str, align, valign, style, overflow, (wrap && w > 0) ? 'normal' : null);
			
			if (div == null)
			{
				return;
			}
			else if (dir != null)
			{
				div.setAttribute('dir', dir);
			}

			group.appendChild(fo);
			this.root.appendChild(group);
			
			var ow = 0;
			var oh = 0;
			
			var padX = 2;
			var padY = 2;

			if (bpmCore.IS_IE && (document.documentMode == 9 || !bpmCore.IS_SVG))
			{
				var clone = document.createElement('div');
				
				clone.style.cssText = div.getAttribute('style');
				clone.style.display = (bpmCore.IS_QUIRKS) ? 'inline' : 'inline-block';
				clone.style.position = 'absolute';
				clone.style.visibility = 'hidden';

				var div2 = document.createElement('div');
				div2.style.display = (bpmCore.IS_QUIRKS) ? 'inline' : 'inline-block';
				div2.style.wordWrap = bpmConstants.WORD_WRAP;
				div2.innerHTML = (bpmUtils.isNode(str)) ? str.outerHTML : str;
				clone.appendChild(div2);

				document.body.appendChild(clone);

				if (document.documentMode != 8 && document.documentMode != 9 && s.fontBorderColor != null)
				{
					padX += 2;
					padY += 2;
				}

				if (wrap && w > 0)
				{
					var tmp = div2.offsetWidth;
					
					padDx = 0;
					
					if (!clip && wrap && w > 0 && this.root.ownerDocument != document && overflow != 'fill')
					{
						var ws = clone.style.whiteSpace;
						div2.style.whiteSpace = 'nowrap';
						
						if (tmp < div2.offsetWidth)
						{
							clone.style.whiteSpace = ws;
						}
					}
					
					if (clip)
					{
						tmp = Math.min(tmp, w);
					}
					
					clone.style.width = tmp + 'px';
	
					ow = div2.offsetWidth + padX + padDx;
					oh = div2.offsetHeight + padY;
					
					clone.style.display = 'inline-block';
					clone.style.position = '';
					clone.style.visibility = '';
					clone.style.width = ow + 'px';
					
					div.setAttribute('style', clone.style.cssText);
				}
				else
				{
					ow = div2.offsetWidth + padX;
					oh = div2.offsetHeight + padY;
				}

				clone.parentNode.removeChild(clone);
				fo.appendChild(div);
			}
			else
			{
				if (this.root.ownerDocument != document)
				{
					div.style.visibility = 'hidden';
					document.body.appendChild(div);
				}
				else
				{
					fo.appendChild(div);
				}

				var sizeDiv = div;
				
				if (sizeDiv.firstChild != null && sizeDiv.firstChild.nodeName == 'DIV')
				{
					sizeDiv = sizeDiv.firstChild;
					
					if (wrap && div.style.wordWrap == 'break-word')
					{
						sizeDiv.style.width = '100%';
					}
				}
				
				var tmp = sizeDiv.offsetWidth;
				
				if (tmp == 0 && div.parentNode == fo)
				{
					div.style.visibility = 'hidden';
					document.body.appendChild(div);
					
					tmp = sizeDiv.offsetWidth;
				}
				
				if (this.cacheOffsetSize)
				{
					group.bpmCachedOffsetWidth = tmp;
				}
				if (!clip && wrap && w > 0 && this.root.ownerDocument != document &&
					overflow != 'fill' && overflow != 'width')
				{
					var ws = div.style.whiteSpace;
					div.style.whiteSpace = 'nowrap';
					
					if (tmp < sizeDiv.offsetWidth)
					{
						div.style.whiteSpace = ws;
					}
				}

				ow = tmp + padX - 1;

				if (wrap && overflow != 'fill' && overflow != 'width')
				{
					if (clip)
					{
						ow = Math.min(ow, w);
					}
					
					div.style.width = ow + 'px';
				}

				ow = sizeDiv.offsetWidth;
				oh = sizeDiv.offsetHeight;
				
				if (this.cacheOffsetSize)
				{
					group.bpmCachedFinalOffsetWidth = ow;
					group.bpmCachedFinalOffsetHeight = oh;
				}

				oh -= padY;
				
				if (div.parentNode != fo)
				{
					fo.appendChild(div);
					div.style.visibility = '';
				}
			}

			if (clip)
			{
				oh = Math.min(oh, h);
				ow = Math.min(ow, w);
			}

			if (overflow == 'width')
			{
				h = oh;
			}
			else if (overflow != 'fill')
			{
				w = ow;
				h = oh;
			}

			if (s.alpha < 1)
			{
				group.setAttribute('opacity', s.alpha);
			}
			
			var dx = 0;
			var dy = 0;

			if (align == bpmConstants.ALIGN_CENTER)
			{
				dx -= w / 2;
			}
			else if (align == bpmConstants.ALIGN_RIGHT)
			{
				dx -= w;
			}
			
			x += dx;
			
			if (valign == bpmConstants.ALIGN_MIDDLE)
			{
				dy -= h / 2;
			}
			else if (valign == bpmConstants.ALIGN_BOTTOM)
			{
				dy -= h;
			}
			
			if (overflow != 'fill' && bpmCore.IS_FF && bpmCore.IS_WIN)
			{
				dy -= 2;
			}
			
			y += dy;

			var tr = (s.scale != 1) ? 'scale(' + s.scale + ')' : '';

			if (s.rotation != 0 && this.rotateHtml)
			{
				tr += 'rotate(' + (s.rotation) + ',' + (w / 2) + ',' + (h / 2) + ')';
				var pt = this.rotatePoint((x + w / 2) * s.scale, (y + h / 2) * s.scale,
					s.rotation, s.rotationCx, s.rotationCy);
				x = pt.x - w * s.scale / 2;
				y = pt.y - h * s.scale / 2;
			}
			else
			{
				x *= s.scale;
				y *= s.scale;
			}

			if (rotation != 0)
			{
				tr += 'rotate(' + (rotation) + ',' + (-dx) + ',' + (-dy) + ')';
			}

			group.setAttribute('transform', 'translate(' + (Math.round(x) + this.foOffset) + ',' +
				(Math.round(y) + this.foOffset) + ')' + tr);
			fo.setAttribute('width', Math.round(Math.max(1, w)));
			fo.setAttribute('height', Math.round(Math.max(1, h)));
			
			if (this.root.ownerDocument != document)
			{
				var alt = this.createAlternateContent(fo, x, y, w, h, str, align, valign, wrap, format, overflow, clip, rotation);
				
				if (alt != null)
				{
					fo.setAttribute('requiredFeatures', 'http://www.w3.org/TR/SVG11/feature#Extensibility');
					var sw = this.createElement('switch');
					sw.appendChild(fo);
					sw.appendChild(alt);
					group.appendChild(sw);
				}
			}
		}
		else
		{
			this.plainText(x, y, w, h, str, align, valign, wrap, overflow, clip, rotation, dir);
		}
	}
};

bpmSvgCanvas2D.prototype.createClip = function(x, y, w, h)
{
	x = Math.round(x);
	y = Math.round(y);
	w = Math.round(w);
	h = Math.round(h);
	
	var id = 'bpm-clip-' + x + '-' + y + '-' + w + '-' + h;

	var counter = 0;
	var tmp = id + '-' + counter;
	
	while (document.getElementById(tmp) != null)
	{
		tmp = id + '-' + (++counter);
	}
	
	clip = this.createElement('clipPath');
	clip.setAttribute('id', tmp);
	
	var rect = this.createElement('rect');
	rect.setAttribute('x', x);
	rect.setAttribute('y', y);
	rect.setAttribute('width', w);
	rect.setAttribute('height', h);
		
	clip.appendChild(rect);
	
	return clip;
};

bpmSvgCanvas2D.prototype.plainText = function(x, y, w, h, str, align, valign, wrap, overflow, clip, rotation, dir)
{
	rotation = (rotation != null) ? rotation : 0;
	var s = this.state;
	var size = s.fontSize;
	var node = this.createElement('g');
	var tr = s.transform || '';
	this.updateFont(node);
	
	if (rotation != 0)
	{
		tr += 'rotate(' + rotation  + ',' + this.format(x * s.scale) + ',' + this.format(y * s.scale) + ')';
	}
	
	if (dir != null)
	{
		node.setAttribute('direction', dir);
	}

	if (clip && w > 0 && h > 0)
	{
		var cx = x;
		var cy = y;
		
		if (align == bpmConstants.ALIGN_CENTER)
		{
			cx -= w / 2;
		}
		else if (align == bpmConstants.ALIGN_RIGHT)
		{
			cx -= w;
		}
		
		if (overflow != 'fill')
		{
			if (valign == bpmConstants.ALIGN_MIDDLE)
			{
				cy -= h / 2;
			}
			else if (valign == bpmConstants.ALIGN_BOTTOM)
			{
				cy -= h;
			}
		}
		
		var c = this.createClip(cx * s.scale - 2, cy * s.scale - 2, w * s.scale + 4, h * s.scale + 4);
		
		if (this.defs != null)
		{
			this.defs.appendChild(c);
		}
		else
		{
			this.root.appendChild(c);
		}
		
		if (!bpmCore.IS_CHROME_APP && !bpmCore.IS_IE && !bpmCore.IS_IE11 &&
			!bpmCore.IS_EDGE && this.root.ownerDocument == document)
		{
			var base = this.getBaseUrl().replace(/([\(\)])/g, '\\$1');
			node.setAttribute('clip-path', 'url(' + base + '#' + c.getAttribute('id') + ')');
		}
		else
		{
			node.setAttribute('clip-path', 'url(#' + c.getAttribute('id') + ')');
		}
	}

	var anchor = (align == bpmConstants.ALIGN_RIGHT) ? 'end' :
					(align == bpmConstants.ALIGN_CENTER) ? 'middle' :
					'start';

	if (anchor != 'start')
	{
		node.setAttribute('text-anchor', anchor);
	}
	
	if (!this.styleEnabled || size != bpmConstants.DEFAULT_FONTSIZE)
	{
		node.setAttribute('font-size', (size * s.scale) + 'px');
	}
	
	if (tr.length > 0)
	{
		node.setAttribute('transform', tr);
	}
	
	if (s.alpha < 1)
	{
		node.setAttribute('opacity', s.alpha);
	}
	
	var lines = str.split('\n');
	var lh = Math.round(size * bpmConstants.LINE_HEIGHT);
	var textHeight = size + (lines.length - 1) * lh;

	var cy = y + size - 1;

	if (valign == bpmConstants.ALIGN_MIDDLE)
	{
		if (overflow == 'fill')
		{
			cy -= h / 2;
		}
		else
		{
			var dy = ((this.matchHtmlAlignment && clip && h > 0) ? Math.min(textHeight, h) : textHeight) / 2;
			cy -= dy + 1;
		}
	}
	else if (valign == bpmConstants.ALIGN_BOTTOM)
	{
		if (overflow == 'fill')
		{
			cy -= h;
		}
		else
		{
			var dy = (this.matchHtmlAlignment && clip && h > 0) ? Math.min(textHeight, h) : textHeight;
			cy -= dy + 2;
		}
	}

	for (var i = 0; i < lines.length; i++)
	{
		if (lines[i].length > 0 && bpmUtils.trim(lines[i]).length > 0)
		{
			var text = this.createElement('text');
			text.setAttribute('x', this.format(x * s.scale) + this.textOffset);
			text.setAttribute('y', this.format(cy * s.scale) + this.textOffset);
			
			bpmUtils.write(text, lines[i]);
			node.appendChild(text);
		}

		cy += lh;
	}

	this.root.appendChild(node);
	this.addTextBackground(node, str, x, y, w, (overflow == 'fill') ? h : textHeight, align, valign, overflow);
};

bpmSvgCanvas2D.prototype.updateFont = function(node)
{
	var s = this.state;

	node.setAttribute('fill', s.fontColor);
	
	if (!this.styleEnabled || s.fontFamily != bpmConstants.DEFAULT_FONTFAMILY)
	{
		node.setAttribute('font-family', s.fontFamily);
	}

	if ((s.fontStyle & bpmConstants.FONT_BOLD) == bpmConstants.FONT_BOLD)
	{
		node.setAttribute('font-weight', 'bold');
	}

	if ((s.fontStyle & bpmConstants.FONT_ITALIC) == bpmConstants.FONT_ITALIC)
	{
		node.setAttribute('font-style', 'italic');
	}
	
	if ((s.fontStyle & bpmConstants.FONT_UNDERLINE) == bpmConstants.FONT_UNDERLINE)
	{
		node.setAttribute('text-decoration', 'underline');
	}
};

bpmSvgCanvas2D.prototype.addTextBackground = function(node, str, x, y, w, h, align, valign, overflow)
{
	var s = this.state;

	if (s.fontBackgroundColor != null || s.fontBorderColor != null)
	{
		var bbox = null;
		
		if (overflow == 'fill' || overflow == 'width')
		{
			if (align == bpmConstants.ALIGN_CENTER)
			{
				x -= w / 2;
			}
			else if (align == bpmConstants.ALIGN_RIGHT)
			{
				x -= w;
			}
			
			if (valign == bpmConstants.ALIGN_MIDDLE)
			{
				y -= h / 2;
			}
			else if (valign == bpmConstants.ALIGN_BOTTOM)
			{
				y -= h;
			}
			
			bbox = new bpmRectangle((x + 1) * s.scale, y * s.scale, (w - 2) * s.scale, (h + 2) * s.scale);
		}
		else if (node.getBBox != null && this.root.ownerDocument == document)
		{
			try
			{
				bbox = node.getBBox();
				var ie = bpmCore.IS_IE && bpmCore.IS_SVG;
				bbox = new bpmRectangle(bbox.x, bbox.y + ((ie) ? 0 : 1), bbox.width, bbox.height + ((ie) ? 1 : 0));
			}
			catch (e)
			{

			}
		}
		else
		{
			var div = document.createElement('div');

			div.style.lineHeight = (bpmConstants.ABSOLUTE_LINE_HEIGHT) ? (s.fontSize * bpmConstants.LINE_HEIGHT) + 'px' : bpmConstants.LINE_HEIGHT;
			div.style.fontSize = s.fontSize + 'px';
			div.style.fontFamily = s.fontFamily;
			div.style.whiteSpace = 'nowrap';
			div.style.position = 'absolute';
			div.style.visibility = 'hidden';
			div.style.display = (bpmCore.IS_QUIRKS) ? 'inline' : 'inline-block';
			div.style.zoom = '1';
			
			if ((s.fontStyle & bpmConstants.FONT_BOLD) == bpmConstants.FONT_BOLD)
			{
				div.style.fontWeight = 'bold';
			}

			if ((s.fontStyle & bpmConstants.FONT_ITALIC) == bpmConstants.FONT_ITALIC)
			{
				div.style.fontStyle = 'italic';
			}
			
			str = bpmUtils.htmlEntities(str, false);
			div.innerHTML = str.replace(/\n/g, '<br/>');
			
			document.body.appendChild(div);
			var w = div.offsetWidth;
			var h = div.offsetHeight;
			div.parentNode.removeChild(div);
			
			if (align == bpmConstants.ALIGN_CENTER)
			{
				x -= w / 2;
			}
			else if (align == bpmConstants.ALIGN_RIGHT)
			{
				x -= w;
			}
			
			if (valign == bpmConstants.ALIGN_MIDDLE)
			{
				y -= h / 2;
			}
			else if (valign == bpmConstants.ALIGN_BOTTOM)
			{
				y -= h;
			}
			
			bbox = new bpmRectangle((x + 1) * s.scale, (y + 2) * s.scale, w * s.scale, (h + 1) * s.scale);
		}
		
		if (bbox != null)
		{
			var n = this.createElement('rect');
			n.setAttribute('fill', s.fontBackgroundColor || 'none');
			n.setAttribute('stroke', s.fontBorderColor || 'none');
			n.setAttribute('x', Math.floor(bbox.x - 1));
			n.setAttribute('y', Math.floor(bbox.y - 1));
			n.setAttribute('width', Math.ceil(bbox.width + 2));
			n.setAttribute('height', Math.ceil(bbox.height));

			var sw = (s.fontBorderColor != null) ? Math.max(1, this.format(s.scale)) : 0;
			n.setAttribute('stroke-width', sw);
			
			if (this.root.ownerDocument == document && bpmUtils.mod(sw, 2) == 1)
			{
				n.setAttribute('transform', 'translate(0.5, 0.5)');
			}
			
			node.insertBefore(n, node.firstChild);
		}
	}
};

bpmSvgCanvas2D.prototype.stroke = function()
{
	this.addNode(false, true);
};

bpmSvgCanvas2D.prototype.fill = function()
{
	this.addNode(true, false);
};

bpmSvgCanvas2D.prototype.fillAndStroke = function()
{
	this.addNode(true, true);
};



/* Vml Canvas2D */
var bpmVmlCanvas2D = function(root)
{
	bpmAbstractCanvas2D.call(this);

	this.root = root;
};

bpmUtils.extend(bpmVmlCanvas2D, bpmAbstractCanvas2D);
bpmVmlCanvas2D.prototype.node = null;
bpmVmlCanvas2D.prototype.textEnabled = true;
bpmVmlCanvas2D.prototype.moveOp = 'm';
bpmVmlCanvas2D.prototype.lineOp = 'l';
bpmVmlCanvas2D.prototype.curveOp = 'c';
bpmVmlCanvas2D.prototype.closeOp = 'x';
bpmVmlCanvas2D.prototype.rotatedHtmlBackground = '';
bpmVmlCanvas2D.prototype.vmlScale = 1;

bpmVmlCanvas2D.prototype.createElement = function(name)
{
	return document.createElement(name);
};

bpmVmlCanvas2D.prototype.createVmlElement = function(name)
{
	return this.createElement(bpmCore.VML_PREFIX + ':' + name);
};

bpmVmlCanvas2D.prototype.addNode = function(filled, stroked)
{
	var node = this.node;
	var s = this.state;
	
	if (node != null)
	{
		if (node.nodeName == 'shape')
		{
			if (this.path != null && this.path.length > 0)
			{
				node.path = this.path.join(' ') + ' e';
				node.style.width = this.root.style.width;
				node.style.height = this.root.style.height;
				node.coordsize = parseInt(node.style.width) + ' ' + parseInt(node.style.height);
			}
			else
			{
				return;
			}
		}

		node.strokeweight = this.format(Math.max(1, s.strokeWidth * s.scale / this.vmlScale)) + 'px';
		
		if (s.shadow)
		{
			this.root.appendChild(this.createShadow(node,
				filled && s.fillColor != null,
				stroked && s.strokeColor != null));
		}
		
		if (stroked && s.strokeColor != null)
		{
			node.stroked = 'true';
			node.strokecolor = s.strokeColor;
		}
		else
		{
			node.stroked = 'false';
		}

		node.appendChild(this.createStroke());

		if (filled && s.fillColor != null)
		{
			node.appendChild(this.createFill());
		}
		else if (this.pointerEvents && (node.nodeName != 'shape' ||
			this.path[this.path.length - 1] == this.closeOp))
		{
			node.appendChild(this.createTransparentFill());
		}
		else
		{
			node.filled = 'false';
		}

		this.root.appendChild(node);
	}
};

bpmVmlCanvas2D.prototype.createTransparentFill = function()
{
	var fill = this.createVmlElement('fill');
	fill.src = bpmCore.imageBasePath + '/transparent.gif';
	fill.type = 'tile';
	
	return fill;
};

bpmVmlCanvas2D.prototype.createFill = function()
{
	var s = this.state;
	
	var fill = this.createVmlElement('fill');
	fill.color = s.fillColor;

	if (s.gradientColor != null)
	{
		fill.type = 'gradient';
		fill.method = 'none';
		fill.color2 = s.gradientColor;
		var angle = 180 - s.rotation;
		
		if (s.gradientDirection == bpmConstants.DIRECTION_WEST)
		{
			angle -= 90 + ((this.root.style.flip == 'x') ? 180 : 0);
		}
		else if (s.gradientDirection == bpmConstants.DIRECTION_EAST)
		{
			angle += 90 + ((this.root.style.flip == 'x') ? 180 : 0);
		}
		else if (s.gradientDirection == bpmConstants.DIRECTION_NORTH)
		{
			angle -= 180 + ((this.root.style.flip == 'y') ? -180 : 0);
		}
		else
		{
			 angle += ((this.root.style.flip == 'y') ? -180 : 0);
		}
		
		if (this.root.style.flip == 'x' || this.root.style.flip == 'y')
		{
			angle *= -1;
		}

		fill.angle = bpmUtils.mod(angle, 360);
		fill.opacity = (s.alpha * s.gradientFillAlpha * 100) + '%';
		fill.setAttribute(bpmCore.OFFICE_PREFIX + ':opacity2', (s.alpha * s.gradientAlpha * 100) + '%');
	}
	else if (s.alpha < 1 || s.fillAlpha < 1)
	{
		fill.opacity = (s.alpha * s.fillAlpha * 100) + '%';			
	}
	
	return fill;
};

bpmVmlCanvas2D.prototype.createStroke = function()
{
	var s = this.state;
	var stroke = this.createVmlElement('stroke');
	stroke.endcap = s.lineCap || 'flat';
	stroke.joinstyle = s.lineJoin || 'miter';
	stroke.miterlimit = s.miterLimit || '10';
	
	if (s.alpha < 1 || s.strokeAlpha < 1)
	{
		stroke.opacity = (s.alpha * s.strokeAlpha * 100) + '%';
	}
	
	if (s.dashed)
	{
		stroke.dashstyle = this.getVmlDashStyle();
	}
	
	return stroke;
};

bpmVmlCanvas2D.prototype.getVmlDashStyle = function()
{
	var result = 'dash';
	
	if (typeof(this.state.dashPattern) === 'string')
	{
		var tok = this.state.dashPattern.split(' ');
		
		if (tok.length > 0 && tok[0] == 1)
		{
			result = '0 2';
		}
	}
	
	return result;
};

bpmVmlCanvas2D.prototype.createShadow = function(node, filled, stroked)
{
	var s = this.state;
	var rad = -s.rotation * (Math.PI / 180);
	var cos = Math.cos(rad);
	var sin = Math.sin(rad);

	var dx = s.shadowDx * s.scale;
	var dy = s.shadowDy * s.scale;

	if (this.root.style.flip == 'x')
	{
		dx *= -1;
	}
	else if (this.root.style.flip == 'y')
	{
		dy *= -1;
	}
	
	var shadow = node.cloneNode(true);
	shadow.style.marginLeft = Math.round(dx * cos - dy * sin) + 'px';
	shadow.style.marginTop = Math.round(dx * sin + dy * cos) + 'px';

	if (document.documentMode == 8)
	{
		shadow.strokeweight = node.strokeweight;
		
		if (node.nodeName == 'shape')
		{
			shadow.path = this.path.join(' ') + ' e';
			shadow.style.width = this.root.style.width;
			shadow.style.height = this.root.style.height;
			shadow.coordsize = parseInt(node.style.width) + ' ' + parseInt(node.style.height);
		}
	}
	
	if (stroked)
	{
		shadow.strokecolor = s.shadowColor;
		shadow.appendChild(this.createShadowStroke());
	}
	else
	{
		shadow.stroked = 'false';
	}
	
	if (filled)
	{
		shadow.appendChild(this.createShadowFill());
	}
	else
	{
		shadow.filled = 'false';
	}
	
	return shadow;
};

bpmVmlCanvas2D.prototype.createShadowFill = function()
{
	var fill = this.createVmlElement('fill');
	fill.color = this.state.shadowColor;
	fill.opacity = (this.state.alpha * this.state.shadowAlpha * 100) + '%';
	
	return fill;
};

bpmVmlCanvas2D.prototype.createShadowStroke = function()
{
	var stroke = this.createStroke();
	stroke.opacity = (this.state.alpha * this.state.shadowAlpha * 100) + '%';
	
	return stroke;
};

bpmVmlCanvas2D.prototype.rotate = function(theta, flipH, flipV, cx, cy)
{
	if (flipH && flipV)
	{
		theta += 180;
	}
	else if (flipH)
	{
		this.root.style.flip = 'x';
	}
	else if (flipV)
	{
		this.root.style.flip = 'y';
	}

	if (flipH ? !flipV : flipV)
	{
		theta *= -1;
	}

	this.root.style.rotation = theta;
	this.state.rotation = this.state.rotation + theta;
	this.state.rotationCx = cx;
	this.state.rotationCy = cy;
};

bpmVmlCanvas2D.prototype.begin = function()
{
	bpmAbstractCanvas2D.prototype.begin.apply(this, arguments);
	this.node = this.createVmlElement('shape');
	this.node.style.position = 'absolute';
};

bpmVmlCanvas2D.prototype.quadTo = function(x1, y1, x2, y2)
{
	var s = this.state;

	var cpx0 = (this.lastX + s.dx) * s.scale;
	var cpy0 = (this.lastY + s.dy) * s.scale;
	var qpx1 = (x1 + s.dx) * s.scale;
	var qpy1 = (y1 + s.dy) * s.scale;
	var cpx3 = (x2 + s.dx) * s.scale;
	var cpy3 = (y2 + s.dy) * s.scale;
	
	var cpx1 = cpx0 + 2/3 * (qpx1 - cpx0);
	var cpy1 = cpy0 + 2/3 * (qpy1 - cpy0);
	
	var cpx2 = cpx3 + 2/3 * (qpx1 - cpx3);
	var cpy2 = cpy3 + 2/3 * (qpy1 - cpy3);
	
	this.path.push('c ' + this.format(cpx1) + ' ' + this.format(cpy1) +
			' ' + this.format(cpx2) + ' ' + this.format(cpy2) +
			' ' + this.format(cpx3) + ' ' + this.format(cpy3));
	this.lastX = (cpx3 / s.scale) - s.dx;
	this.lastY = (cpy3 / s.scale) - s.dy;
	
};

bpmVmlCanvas2D.prototype.createRect = function(nodeName, x, y, w, h)
{
	var s = this.state;
	var n = this.createVmlElement(nodeName);
	n.style.position = 'absolute';
	n.style.left = this.format((x + s.dx) * s.scale) + 'px';
	n.style.top = this.format((y + s.dy) * s.scale) + 'px';
	n.style.width = this.format(w * s.scale) + 'px';
	n.style.height = this.format(h * s.scale) + 'px';
	
	return n;
};

bpmVmlCanvas2D.prototype.rect = function(x, y, w, h)
{
	this.node = this.createRect('rect', x, y, w, h);
};

bpmVmlCanvas2D.prototype.roundrect = function(x, y, w, h, dx, dy)
{
	this.node = this.createRect('roundrect', x, y, w, h);
	// SetAttribute needed here for IE8
	this.node.setAttribute('arcsize', Math.max(dx * 100 / w, dy * 100 / h) + '%');
};

bpmVmlCanvas2D.prototype.ellipse = function(x, y, w, h)
{
	this.node = this.createRect('oval', x, y, w, h);
};

bpmVmlCanvas2D.prototype.image = function(x, y, w, h, src, aspect, flipH, flipV)
{
	var node = null;
	
	if (!aspect)
	{
		node = this.createRect('image', x, y, w, h);
		node.src = src;
	}
	else
	{
		node = this.createRect('rect', x, y, w, h);
		node.stroked = 'false';
		
		var fill = this.createVmlElement('fill');
		fill.aspect = (aspect) ? 'atmost' : 'ignore';
		fill.rotate = 'true';
		fill.type = 'frame';
		fill.src = src;

		node.appendChild(fill);
	}
	
	if (flipH && flipV)
	{
		node.style.rotation = '180';
	}
	else if (flipH)
	{
		node.style.flip = 'x';
	}
	else if (flipV)
	{
		node.style.flip = 'y';
	}
	
	if (this.state.alpha < 1 || this.state.fillAlpha < 1)
	{
		node.style.filter += 'alpha(opacity=' + (this.state.alpha * this.state.fillAlpha * 100) + ')';
	}

	this.root.appendChild(node);
};

bpmVmlCanvas2D.prototype.createDiv = function(str, align, valign, overflow)
{
	var div = this.createElement('div');
	var state = this.state;

	var css = '';
	
	if (state.fontBackgroundColor != null)
	{
		css += 'background-color:' + bpmUtils.htmlEntities(state.fontBackgroundColor) + ';';
	}
	
	if (state.fontBorderColor != null)
	{
		css += 'border:1px solid ' + bpmUtils.htmlEntities(state.fontBorderColor) + ';';
	}
	
	if (bpmUtils.isNode(str))
	{
		div.appendChild(str);
	}
	else
	{
		if (overflow != 'fill' && overflow != 'width')
		{
			var div2 = this.createElement('div');
			div2.style.cssText = css;
			div2.style.display = (bpmCore.IS_QUIRKS) ? 'inline' : 'inline-block';
			div2.style.zoom = '1';
			div2.style.textDecoration = 'inherit';
			div2.innerHTML = str;
			div.appendChild(div2);
		}
		else
		{
			div.style.cssText = css;
			div.innerHTML = str;
		}
	}
	
	var style = div.style;

	style.fontSize = (state.fontSize / this.vmlScale) + 'px';
	style.fontFamily = state.fontFamily;
	style.color = state.fontColor;
	style.verticalAlign = 'top';
	style.textAlign = align || 'left';
	style.lineHeight = (bpmConstants.ABSOLUTE_LINE_HEIGHT) ? (state.fontSize * bpmConstants.LINE_HEIGHT / this.vmlScale) + 'px' : bpmConstants.LINE_HEIGHT;

	if ((state.fontStyle & bpmConstants.FONT_BOLD) == bpmConstants.FONT_BOLD)
	{
		style.fontWeight = 'bold';
	}

	if ((state.fontStyle & bpmConstants.FONT_ITALIC) == bpmConstants.FONT_ITALIC)
	{
		style.fontStyle = 'italic';
	}
	
	if ((state.fontStyle & bpmConstants.FONT_UNDERLINE) == bpmConstants.FONT_UNDERLINE)
	{
		style.textDecoration = 'underline';
	}
	
	return div;
};

bpmVmlCanvas2D.prototype.text = function(x, y, w, h, str, align, valign, wrap, format, overflow, clip, rotation, dir)
{
	if (this.textEnabled && str != null)
	{
		var s = this.state;
		
		if (format == 'html')
		{
			if (s.rotation != null)
			{
				var pt = this.rotatePoint(x, y, s.rotation, s.rotationCx, s.rotationCy);
				
				x = pt.x;
				y = pt.y;
			}

			if (document.documentMode == 8 && !bpmCore.IS_EM)
			{
				x += s.dx;
				y += s.dy;
				
				if (overflow != 'fill' && valign == bpmConstants.ALIGN_TOP)
				{
					y -= 1;
				}
			}
			else
			{
				x *= s.scale;
				y *= s.scale;
			}

			var abs = (document.documentMode == 8 && !bpmCore.IS_EM) ? this.createVmlElement('group') : this.createElement('div');
			abs.style.position = 'absolute';
			abs.style.display = 'inline';
			abs.style.left = this.format(x) + 'px';
			abs.style.top = this.format(y) + 'px';
			abs.style.zoom = s.scale;

			var box = this.createElement('div');
			box.style.position = 'relative';
			box.style.display = 'inline';
			
			var margin = bpmUtils.getAlignmentAsPoint(align, valign);
			var dx = margin.x;
			var dy = margin.y;

			var div = this.createDiv(str, align, valign, overflow);
			var inner = this.createElement('div');
			
			if (dir != null)
			{
				div.setAttribute('dir', dir);
			}

			if (wrap && w > 0)
			{
				if (!clip)
				{
					div.style.width = Math.round(w) + 'px';
				}
				
				div.style.wordWrap = bpmConstants.WORD_WRAP;
				div.style.whiteSpace = 'normal';
				
				if (div.style.wordWrap == 'break-word')
				{
					var tmp = div;
					
					if (tmp.firstChild != null && tmp.firstChild.nodeName == 'DIV')
					{
						tmp.firstChild.style.width = '100%';
					}
				}
			}
			else
			{
				div.style.whiteSpace = 'nowrap';
			}
			
			var rot = s.rotation + (rotation || 0);
			
			if (this.rotateHtml && rot != 0)
			{
				inner.style.display = 'inline';
				inner.style.zoom = '1';
				inner.appendChild(div);

				if (document.documentMode == 8 && !bpmCore.IS_EM && this.root.nodeName != 'DIV')
				{
					box.appendChild(inner);
					abs.appendChild(box);
				}
				else
				{
					abs.appendChild(inner);
				}
			}
			else if (document.documentMode == 8 && !bpmCore.IS_EM)
			{
				box.appendChild(div);
				abs.appendChild(box);
			}
			else
			{
				div.style.display = 'inline';
				abs.appendChild(div);
			}
			
			if (this.root.nodeName != 'DIV')
			{
				var rect = this.createVmlElement('rect');
				rect.stroked = 'false';
				rect.filled = 'false';

				rect.appendChild(abs);
				this.root.appendChild(rect);
			}
			else
			{
				this.root.appendChild(abs);
			}
			
			if (clip)
			{
				div.style.overflow = 'hidden';
				div.style.width = Math.round(w) + 'px';
				
				if (!bpmCore.IS_QUIRKS)
				{
					div.style.maxHeight = Math.round(h) + 'px';
				}
			}
			else if (overflow == 'fill')
			{
				div.style.overflow = 'hidden';
				div.style.width = (Math.max(0, w) + 1) + 'px';
				div.style.height = (Math.max(0, h) + 1) + 'px';
			}
			else if (overflow == 'width')
			{
				div.style.overflow = 'hidden';
				div.style.width = (Math.max(0, w) + 1) + 'px';
				div.style.maxHeight = (Math.max(0, h) + 1) + 'px';
			}
			
			if (this.rotateHtml && rot != 0)
			{
				var rad = rot * (Math.PI / 180);
				
				var real_cos = parseFloat(parseFloat(Math.cos(rad)).toFixed(8));
				var real_sin = parseFloat(parseFloat(Math.sin(-rad)).toFixed(8));

				rad %= 2 * Math.PI;
				if (rad < 0) rad += 2 * Math.PI;
				rad %= Math.PI;
				if (rad > Math.PI / 2) rad = Math.PI - rad;
				
				var cos = Math.cos(rad);
				var sin = Math.sin(rad);

				if (document.documentMode == 8 && !bpmCore.IS_EM)
				{
					div.style.display = 'inline-block';
					inner.style.display = 'inline-block';
					box.style.display = 'inline-block';
				}
				
				div.style.visibility = 'hidden';
				div.style.position = 'absolute';
				document.body.appendChild(div);
				
				var sizeDiv = div;
				
				if (sizeDiv.firstChild != null && sizeDiv.firstChild.nodeName == 'DIV')
				{
					sizeDiv = sizeDiv.firstChild;
				}
				
				var tmp = sizeDiv.offsetWidth + 3;
				var oh = sizeDiv.offsetHeight;
				
				if (clip)
				{
					w = Math.min(w, tmp);
					oh = Math.min(oh, h);
				}
				else
				{
					w = tmp;
				}

				if (wrap)
				{
					div.style.width = w + 'px';
				}
				
				if (bpmCore.IS_QUIRKS && (clip || overflow == 'width') && oh > h)
				{
					oh = h;
					
					div.style.height = oh + 'px';
				}
				
				h = oh;

				var top_fix = (h - h * cos + w * -sin) / 2 - real_sin * w * (dx + 0.5) + real_cos * h * (dy + 0.5);
				var left_fix = (w - w * cos + h * -sin) / 2 + real_cos * w * (dx + 0.5) + real_sin * h * (dy + 0.5);

				if (abs.nodeName == 'group' && this.root.nodeName == 'DIV')
				{
					var pos = this.createElement('div');
					pos.style.display = 'inline-block';
					pos.style.position = 'absolute';
					pos.style.left = this.format(x + (left_fix - w / 2) * s.scale) + 'px';
					pos.style.top = this.format(y + (top_fix - h / 2) * s.scale) + 'px';
					
					abs.parentNode.appendChild(pos);
					pos.appendChild(abs);
				}
				else
				{
					var sc = (document.documentMode == 8 && !bpmCore.IS_EM) ? 1 : s.scale;
					
					abs.style.left = this.format(x + (left_fix - w / 2) * sc) + 'px';
					abs.style.top = this.format(y + (top_fix - h / 2) * sc) + 'px';
				}
				
				inner.style.filter = "progid:DXImageTransform.Microsoft.Matrix(M11="+real_cos+", M12="+
					real_sin+", M21="+(-real_sin)+", M22="+real_cos+", sizingMethod='auto expand')";
				inner.style.backgroundColor = this.rotatedHtmlBackground;
				
				if (this.state.alpha < 1)
				{
					inner.style.filter += 'alpha(opacity=' + (this.state.alpha * 100) + ')';
				}

				inner.appendChild(div);
				div.style.position = '';
				div.style.visibility = '';
			}
			else if (document.documentMode != 8 || bpmCore.IS_EM)
			{
				div.style.verticalAlign = 'top';
				
				if (this.state.alpha < 1)
				{
					abs.style.filter = 'alpha(opacity=' + (this.state.alpha * 100) + ')';
				}
				
				var divParent = div.parentNode;
				div.style.visibility = 'hidden';
				document.body.appendChild(div);
				
				w = div.offsetWidth;
				var oh = div.offsetHeight;
				
				if (bpmCore.IS_QUIRKS && clip && oh > h)
				{
					oh = h;
					
					div.style.height = oh + 'px';
				}
				
				h = oh;
				
				div.style.visibility = '';
				divParent.appendChild(div);
				
				abs.style.left = this.format(x + w * dx * this.state.scale) + 'px';
				abs.style.top = this.format(y + h * dy * this.state.scale) + 'px';
			}
			else
			{
				if (this.state.alpha < 1)
				{
					div.style.filter = 'alpha(opacity=' + (this.state.alpha * 100) + ')';
				}
				
				box.style.left = (dx * 100) + '%';
				box.style.top = (dy * 100) + '%';
			}
		}
		else
		{
			this.plainText(x, y, w, h, bpmUtils.htmlEntities(str, false), align, valign, wrap, format, overflow, clip, rotation, dir);
		}
	}
};

bpmVmlCanvas2D.prototype.plainText = function(x, y, w, h, str, align, valign, wrap, format, overflow, clip, rotation, dir)
{
	var s = this.state;
	x = (x + s.dx) * s.scale;
	y = (y + s.dy) * s.scale;
	
	var node = this.createVmlElement('shape');
	node.style.width = '1px';
	node.style.height = '1px';
	node.stroked = 'false';

	var fill = this.createVmlElement('fill');
	fill.color = s.fontColor;
	fill.opacity = (s.alpha * 100) + '%';
	node.appendChild(fill);
	
	var path = this.createVmlElement('path');
	path.textpathok = 'true';
	path.v = 'm ' + this.format(0) + ' ' + this.format(0) + ' l ' + this.format(1) + ' ' + this.format(0);
	
	node.appendChild(path);
	
	var tp = this.createVmlElement('textpath');
	tp.style.cssText = 'v-text-align:' + align;
	tp.style.align = align;
	tp.style.fontFamily = s.fontFamily;
	tp.string = str;
	tp.on = 'true';
	
	var size = s.fontSize * s.scale / this.vmlScale;
	tp.style.fontSize = size + 'px';
	
	if ((s.fontStyle & bpmConstants.FONT_BOLD) == bpmConstants.FONT_BOLD)
	{
		tp.style.fontWeight = 'bold';
	}
	
	if ((s.fontStyle & bpmConstants.FONT_ITALIC) == bpmConstants.FONT_ITALIC)
	{
		tp.style.fontStyle = 'italic';
	}

	if ((s.fontStyle & bpmConstants.FONT_UNDERLINE) == bpmConstants.FONT_UNDERLINE)
	{
		tp.style.textDecoration = 'underline';
	}

	var lines = str.split('\n');
	var textHeight = size + (lines.length - 1) * size * bpmConstants.LINE_HEIGHT;
	var dx = 0;
	var dy = 0;

	if (valign == bpmConstants.ALIGN_BOTTOM)
	{
		dy = - textHeight / 2;
	}
	else if (valign != bpmConstants.ALIGN_MIDDLE)
	{
		dy = textHeight / 2;
	}

	if (rotation != null)
	{
		node.style.rotation = rotation;
		var rad = rotation * (Math.PI / 180);
		dx = Math.sin(rad) * dy;
		dy = Math.cos(rad) * dy;
	}

	node.appendChild(tp);
	node.style.left = this.format(x - dx) + 'px';
	node.style.top = this.format(y + dy) + 'px';
	
	this.root.appendChild(node);
};

bpmVmlCanvas2D.prototype.stroke = function()
{
	this.addNode(false, true);
};

bpmVmlCanvas2D.prototype.fill = function()
{
	this.addNode(true, false);
};

bpmVmlCanvas2D.prototype.fillAndStroke = function()
{
	this.addNode(true, true);
};



/* Guide */
function bpmGuide(graph, states)
{
	this.graph = graph;
	this.setStates(states);
};

bpmGuide.prototype.graph = null;
bpmGuide.prototype.states = null;
bpmGuide.prototype.horizontal = true;
bpmGuide.prototype.vertical = true;
bpmGuide.prototype.guideX = null;
bpmGuide.prototype.guideY = null;
bpmGuide.prototype.rounded = false;

bpmGuide.prototype.setStates = function(states)
{
	this.states = states;
};

bpmGuide.prototype.isEnabledForEvent = function(evt)
{
	return true;
};

bpmGuide.prototype.getGuideTolerance = function()
{
	return this.graph.gridSize / 2;
};

bpmGuide.prototype.createGuideShape = function(horizontal)
{
	var guide = new bpmPolyline([], bpmConstants.GUIDE_COLOR, bpmConstants.GUIDE_STROKEWIDTH);
	guide.isDashed = true;
	
	return guide;
};

bpmGuide.prototype.move = function(bounds, delta, gridEnabled, clone)
{
	if (this.states != null && (this.horizontal || this.vertical) && bounds != null && delta != null)
	{
		var trx = this.graph.getView().translate;
		var scale = this.graph.getView().scale;
		var dx = delta.x;
		var dy = delta.y;
		
		var overrideX = false;
		var stateX = null;
		var valueX = null;
		var overrideY = false;
		var stateY = null;
		var valueY = null;
		
		var tt = this.getGuideTolerance();
		var ttX = tt;
		var ttY = tt;
		
		var b = bounds.clone();
		b.x += delta.x;
		b.y += delta.y;
		
		var left = b.x;
		var right = b.x + b.width;
		var center = b.getCenterX();
		var top = b.y;
		var bottom = b.y + b.height;
		var middle = b.getCenterY();
	
		function snapX(x, state)
		{
			x += this.graph.panDx;
			var override = false;
			
			if (Math.abs(x - center) < ttX)
			{
				dx = x - bounds.getCenterX();
				ttX = Math.abs(x - center);
				override = true;
			}
			else if (Math.abs(x - left) < ttX)
			{
				dx = x - bounds.x;
				ttX = Math.abs(x - left);
				override = true;
			}
			else if (Math.abs(x - right) < ttX)
			{
				dx = x - bounds.x - bounds.width;
				ttX = Math.abs(x - right);
				override = true;
			}
			
			if (override)
			{
				stateX = state;
				valueX = Math.round(x - this.graph.panDx);
				
				if (this.guideX == null)
				{
					this.guideX = this.createGuideShape(true);
					
					this.guideX.dialect = (this.graph.dialect != bpmConstants.DIALECT_SVG) ?
						bpmConstants.DIALECT_VML : bpmConstants.DIALECT_SVG;
					this.guideX.pointerEvents = false;
					this.guideX.init(this.graph.getView().getOverlayPane());
				}
			}
			
			overrideX = overrideX || override;
		};
		
		function snapY(y, state)
		{
			y += this.graph.panDy;
			var override = false;
			
			if (Math.abs(y - middle) < ttY)
			{
				dy = y - bounds.getCenterY();
				ttY = Math.abs(y -  middle);
				override = true;
			}
			else if (Math.abs(y - top) < ttY)
			{
				dy = y - bounds.y;
				ttY = Math.abs(y - top);
				override = true;
			}
			else if (Math.abs(y - bottom) < ttY)
			{
				dy = y - bounds.y - bounds.height;
				ttY = Math.abs(y - bottom);
				override = true;
			}
			
			if (override)
			{
				stateY = state;
				valueY = Math.round(y - this.graph.panDy);
				
				if (this.guideY == null)
				{
					this.guideY = this.createGuideShape(false);
					
					this.guideY.dialect = (this.graph.dialect != bpmConstants.DIALECT_SVG) ?
						bpmConstants.DIALECT_VML : bpmConstants.DIALECT_SVG;
					this.guideY.pointerEvents = false;
					this.guideY.init(this.graph.getView().getOverlayPane());
				}
			}
			
			overrideY = overrideY || override;
		};
		
		for (var i = 0; i < this.states.length; i++)
		{
			var state =  this.states[i];
			
			if (state != null)
			{
				// Align x
				if (this.horizontal)
				{
					snapX.call(this, state.getCenterX(), state);
					snapX.call(this, state.x, state);
					snapX.call(this, state.x + state.width, state);
				}
	
				// Align y
				if (this.vertical)
				{
					snapY.call(this, state.getCenterY(), state);
					snapY.call(this, state.y, state);
					snapY.call(this, state.y + state.height, state);
				}
			}
		}

		if (gridEnabled)
		{
			if (!overrideX)
			{
				var tx = bounds.x - (this.graph.snap(bounds.x /
					scale - trx.x) + trx.x) * scale;
				dx = this.graph.snap(dx / scale) * scale - tx;
			}
			
			if (!overrideY)
			{
				var ty = bounds.y - (this.graph.snap(bounds.y /
					scale - trx.y) + trx.y) * scale;
				dy = this.graph.snap(dy / scale) * scale - ty;
			}
		}
		
		var c = this.graph.container;
		
		if (!overrideX && this.guideX != null)
		{
			this.guideX.node.style.visibility = 'hidden';
		}
		else if (this.guideX != null)
		{
			if (stateX != null && bounds != null)
			{
				minY = Math.min(bounds.y + dy - this.graph.panDy, stateX.y);
				maxY = Math.max(bounds.y + bounds.height + dy - this.graph.panDy, stateX.y + stateX.height);
			}
			
			if (minY != null && maxY != null)
			{
				this.guideX.points = [new bpmPoint(valueX, minY), new bpmPoint(valueX, maxY)];
			}
			else
			{
				this.guideX.points = [new bpmPoint(valueX, -this.graph.panDy), new bpmPoint(valueX, c.scrollHeight - 3 - this.graph.panDy)];
			}
			
			this.guideX.stroke = this.getGuideColor(stateX, true);
			this.guideX.node.style.visibility = 'visible';
			this.guideX.redraw();
		}
		
		if (!overrideY && this.guideY != null)
		{
			this.guideY.node.style.visibility = 'hidden';
		}
		else if (this.guideY != null)
		{
			if (stateY != null && bounds != null)
			{
				minX = Math.min(bounds.x + dx - this.graph.panDx, stateY.x);
				maxX = Math.max(bounds.x + bounds.width + dx - this.graph.panDx, stateY.x + stateY.width);
			}
			
			if (minX != null && maxX != null)
			{
				this.guideY.points = [new bpmPoint(minX, valueY), new bpmPoint(maxX, valueY)];
			}
			else
			{
				this.guideY.points = [new bpmPoint(-this.graph.panDx, valueY), new bpmPoint(c.scrollWidth - 3 - this.graph.panDx, valueY)];
			}
			
			this.guideY.stroke = this.getGuideColor(stateY, false);
			this.guideY.node.style.visibility = 'visible';
			this.guideY.redraw();
		}

		delta = this.getDelta(bounds, stateX, dx, stateY, dy)
	}
	
	return delta;
};

bpmGuide.prototype.getDelta = function(bounds, stateX, dx, stateY, dy)
{
	if (this.rounded || (stateX != null && stateX.cell == null))
	{
		dx = Math.floor(bounds.x + dx) - bounds.x;
	}

	if (this.rounded || (stateY != null && stateY.cell == null))
	{
		dy = Math.floor(bounds.y + dy) - bounds.y;
	}
	
	return new bpmPoint(dx, dy);
};

bpmGuide.prototype.getGuideColor = function(state, horizontal)
{
	return bpmConstants.GUIDE_COLOR;
};

bpmGuide.prototype.hide = function()
{
	this.setVisible(false);
};

bpmGuide.prototype.setVisible = function(visible)
{
	if (this.guideX != null)
	{
		this.guideX.node.style.visibility = (visible) ? 'visible' : 'hidden';
	}
	
	if (this.guideY != null)
	{
		this.guideY.node.style.visibility = (visible) ? 'visible' : 'hidden';
	}
};

bpmGuide.prototype.destroy = function()
{
	if (this.guideX != null)
	{
		this.guideX.destroy();
		this.guideX = null;
	}
	
	if (this.guideY != null)
	{
		this.guideY.destroy();
		this.guideY = null;
	}
};

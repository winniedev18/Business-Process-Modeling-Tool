
/* Shape */
function bpmShape(stencil)
{
	this.stencil = stencil;
	this.initStyles();
};

bpmShape.prototype.dialect = null;
bpmShape.prototype.scale = 1;
bpmShape.prototype.antiAlias = true;
bpmShape.prototype.minSvgStrokeWidth = 1;
bpmShape.prototype.bounds = null;
bpmShape.prototype.points = null;
bpmShape.prototype.node = null;
bpmShape.prototype.state = null;
bpmShape.prototype.style = null;
bpmShape.prototype.boundingBox = null;
bpmShape.prototype.stencil = null;
bpmShape.prototype.svgStrokeTolerance = 8;
bpmShape.prototype.pointerEvents = true;
bpmShape.prototype.svgPointerEvents = 'all';
bpmShape.prototype.shapePointerEvents = false;
bpmShape.prototype.stencilPointerEvents = false;
bpmShape.prototype.vmlScale = 1;
bpmShape.prototype.outline = false;
bpmShape.prototype.visible = true;
bpmShape.prototype.useSvgBoundingBox = false;

bpmShape.prototype.init = function(container)
{
	if (this.node == null)
	{
		this.node = this.create(container);
		
		if (container != null)
		{
			container.appendChild(this.node);
		}
	}
};

bpmShape.prototype.initStyles = function(container)
{
	this.strokewidth = 1;
	this.rotation = 0;
	this.opacity = 100;
	this.fillOpacity = 100;
	this.strokeOpacity = 100;
	this.flipH = false;
	this.flipV = false;
};

bpmShape.prototype.isParseVml = function()
{
	return true;
};

bpmShape.prototype.isHtmlAllowed = function()
{
	return false;
};

bpmShape.prototype.getSvgScreenOffset = function()
{
	var sw = this.stencil && this.stencil.strokewidth != 'inherit' ? Number(this.stencil.strokewidth) : this.strokewidth;
	
	return (bpmUtils.mod(Math.max(1, Math.round(sw * this.scale)), 2) == 1) ? 0.5 : 0;
};

bpmShape.prototype.create = function(container)
{
	var node = null;
	
	if (container != null && container.ownerSVGElement != null)
	{
		node = this.createSvg(container);
	}
	else if (document.documentMode == 8 || !bpmCore.IS_VML ||
		(this.dialect != bpmConstants.DIALECT_VML && this.isHtmlAllowed()))
	{
		node = this.createHtml(container);
	}
	else
	{
		node = this.createVml(container);
	}
	
	return node;
};

bpmShape.prototype.createSvg = function()
{
	return document.createElementNS(bpmConstants.NS_SVG, 'g');
};

bpmShape.prototype.createVml = function()
{
	var node = document.createElement(bpmCore.VML_PREFIX + ':group');
	node.style.position = 'absolute';
	
	return node;
};

bpmShape.prototype.createHtml = function()
{
	var node = document.createElement('div');
	node.style.position = 'absolute';
	
	return node;
};

bpmShape.prototype.reconfigure = function()
{
	this.redraw();
};

bpmShape.prototype.redraw = function()
{
	this.updateBoundsFromPoints();
	
	if (this.visible && this.checkBounds())
	{
		this.node.style.visibility = 'visible';
		this.clear();
		
		if (this.node.nodeName == 'DIV' && (this.isHtmlAllowed() || !bpmCore.IS_VML))
		{
			this.redrawHtmlShape();
		}
		else
		{	
			this.redrawShape();
		}

		this.updateBoundingBox();
	}
	else
	{
		this.node.style.visibility = 'hidden';
		this.boundingBox = null;
	}
};

bpmShape.prototype.clear = function()
{
	if (this.node.ownerSVGElement != null)
	{
		while (this.node.lastChild != null)
		{
			this.node.removeChild(this.node.lastChild);
		}
	}
	else
	{
		this.node.style.cssText = 'position:absolute;' + ((this.cursor != null) ?
			('cursor:' + this.cursor + ';') : '');
		this.node.innerHTML = '';
	}
};

bpmShape.prototype.updateBoundsFromPoints = function()
{
	var pts = this.points;
	
	if (pts != null && pts.length > 0 && pts[0] != null)
	{
		this.bounds = new bpmRectangle(Number(pts[0].x), Number(pts[0].y), 1, 1);
		
		for (var i = 1; i < this.points.length; i++)
		{
			if (pts[i] != null)
			{
				this.bounds.add(new bpmRectangle(Number(pts[i].x), Number(pts[i].y), 1, 1));
			}
		}
	}
};

bpmShape.prototype.getLabelBounds = function(rect)
{
	var d = bpmUtils.getValue(this.style, bpmConstants.STYLE_DIRECTION, bpmConstants.DIRECTION_EAST);
	var bounds = rect;
	
	if (d != bpmConstants.DIRECTION_SOUTH && d != bpmConstants.DIRECTION_NORTH &&
		this.state != null && this.state.text != null &&
		this.state.text.isPaintBoundsInverted())
	{
		bounds = bounds.clone();
		var tmp = bounds.width;
		bounds.width = bounds.height;
		bounds.height = tmp;
	}
		
	var m = this.getLabelMargins(bounds);
	
	if (m != null)
	{
		var flipH = bpmUtils.getValue(this.style, bpmConstants.STYLE_FLIPH, false) == '1';
		var flipV = bpmUtils.getValue(this.style, bpmConstants.STYLE_FLIPV, false) == '1';
		
		if (this.state != null && this.state.text != null &&
			this.state.text.isPaintBoundsInverted())
		{
			var tmp = m.x;
			m.x = m.height;
			m.height = m.width;
			m.width = m.y;
			m.y = tmp;

			tmp = flipH;
			flipH = flipV;
			flipV = tmp;
		}
		
		return bpmUtils.getDirectedBounds(rect, m, this.style, flipH, flipV);
	}
	
	return rect;
};

bpmShape.prototype.getLabelMargins= function(rect)
{
	return null;
};

bpmShape.prototype.checkBounds = function()
{
	return (!isNaN(this.scale) && isFinite(this.scale) && this.scale > 0 &&
			this.bounds != null && !isNaN(this.bounds.x) && !isNaN(this.bounds.y) &&
			!isNaN(this.bounds.width) && !isNaN(this.bounds.height) &&
			this.bounds.width > 0 && this.bounds.height > 0);
};

bpmShape.prototype.createVmlGroup = function()
{
	var node = document.createElement(bpmCore.VML_PREFIX + ':group');
	node.style.position = 'absolute';
	node.style.width = this.node.style.width;
	node.style.height = this.node.style.height;
	
	return node;
};

bpmShape.prototype.redrawShape = function()
{
	var canvas = this.createCanvas();
	
	if (canvas != null)
	{
		canvas.pointerEvents = this.pointerEvents;
	
		this.paint(canvas);
	
		if (this.node != canvas.root)
		{
			this.node.insertAdjacentHTML('beforeend', canvas.root.outerHTML);
		}
	
		if (this.node.nodeName == 'DIV' && document.documentMode == 8)
		{
			this.node.style.filter = '';
			
			bpmUtils.addTransparentBackgroundFilter(this.node);
		}
		
		this.destroyCanvas(canvas);
	}
};

bpmShape.prototype.createCanvas = function()
{
	var canvas = null;
	
	if (this.node.ownerSVGElement != null)
	{
		canvas = this.createSvgCanvas();
	}
	else if (bpmCore.IS_VML)
	{
		this.updateVmlContainer();
		canvas = this.createVmlCanvas();
	}
	
	if (canvas != null && this.outline)
	{
		canvas.setStrokeWidth(this.strokewidth);
		canvas.setStrokeColor(this.stroke);
		
		if (this.isDashed != null)
		{
			canvas.setDashed(this.isDashed);
		}
		
		canvas.setStrokeWidth = function() {};
		canvas.setStrokeColor = function() {};
		canvas.setFillColor = function() {};
		canvas.setGradient = function() {};
		canvas.setDashed = function() {};
		canvas.text = function() {};
	}

	return canvas;
};

bpmShape.prototype.createSvgCanvas = function()
{
	var canvas = new bpmSvgCanvas2D(this.node, false);
	canvas.strokeTolerance = (this.pointerEvents) ? this.svgStrokeTolerance : 0;
	canvas.pointerEventsValue = this.svgPointerEvents;
	canvas.blockImagePointerEvents = bpmCore.IS_FF;
	var off = this.getSvgScreenOffset();

	if (off != 0)
	{
		this.node.setAttribute('transform', 'translate(' + off + ',' + off + ')');
	}
	else
	{
		this.node.removeAttribute('transform');
	}

	canvas.minStrokeWidth = this.minSvgStrokeWidth;
	
	if (!this.antiAlias)
	{
		canvas.format = function(value)
		{
			return Math.round(parseFloat(value));
		};
	}
	
	return canvas;
};

bpmShape.prototype.createVmlCanvas = function()
{
	var node = (document.documentMode == 8 && this.isParseVml()) ? this.createVmlGroup() : this.node;
	var canvas = new bpmVmlCanvas2D(node, false);
	
	if (node.tagUrn != '')
	{
		var w = Math.max(1, Math.round(this.bounds.width));
		var h = Math.max(1, Math.round(this.bounds.height));
		node.coordsize = (w * this.vmlScale) + ',' + (h * this.vmlScale);
		canvas.scale(this.vmlScale);
		canvas.vmlScale = this.vmlScale;
	}

	var s = this.scale;
	canvas.translate(-Math.round(this.bounds.x / s), -Math.round(this.bounds.y / s));
	
	return canvas;
};

bpmShape.prototype.updateVmlContainer = function()
{
	this.node.style.left = Math.round(this.bounds.x) + 'px';
	this.node.style.top = Math.round(this.bounds.y) + 'px';
	var w = Math.max(1, Math.round(this.bounds.width));
	var h = Math.max(1, Math.round(this.bounds.height));
	this.node.style.width = w + 'px';
	this.node.style.height = h + 'px';
	this.node.style.overflow = 'visible';
};

bpmShape.prototype.redrawHtmlShape = function()
{
	this.updateHtmlBounds(this.node);
	this.updateHtmlFilters(this.node);
	this.updateHtmlColors(this.node);
};

bpmShape.prototype.updateHtmlFilters = function(node)
{
	var f = '';
	
	if (this.opacity < 100)
	{
		f += 'alpha(opacity=' + (this.opacity) + ')';
	}
	
	if (this.isShadow)
	{
		f += 'progid:DXImageTransform.Microsoft.dropShadow (' +
			'OffX=\'' + Math.round(bpmConstants.SHADOW_OFFSET_X * this.scale) + '\', ' +
			'OffY=\'' + Math.round(bpmConstants.SHADOW_OFFSET_Y * this.scale) + '\', ' +
			'Color=\'' + bpmConstants.VML_SHADOWCOLOR + '\')';
	}
	
	if (this.fill != null && this.fill != bpmConstants.NONE && this.gradient && this.gradient != bpmConstants.NONE)
	{
		var start = this.fill;
		var end = this.gradient;
		var type = '0';
		
		var lookup = {east:0,south:1,west:2,north:3};
		var dir = (this.direction != null) ? lookup[this.direction] : 0;
		
		if (this.gradientDirection != null)
		{
			dir = bpmUtils.mod(dir + lookup[this.gradientDirection] - 1, 4);
		}

		if (dir == 1)
		{
			type = '1';
			var tmp = start;
			start = end;
			end = tmp;
		}
		else if (dir == 2)
		{
			var tmp = start;
			start = end;
			end = tmp;
		}
		else if (dir == 3)
		{
			type = '1';
		}
		
		f += 'progid:DXImageTransform.Microsoft.gradient(' +
			'startColorStr=\'' + start + '\', endColorStr=\'' + end +
			'\', gradientType=\'' + type + '\')';
	}

	node.style.filter = f;
};

bpmShape.prototype.updateHtmlColors = function(node)
{
	var color = this.stroke;
	
	if (color != null && color != bpmConstants.NONE)
	{
		node.style.borderColor = color;

		if (this.isDashed)
		{
			node.style.borderStyle = 'dashed';
		}
		else if (this.strokewidth > 0)
		{
			node.style.borderStyle = 'solid';
		}

		node.style.borderWidth = Math.max(1, Math.ceil(this.strokewidth * this.scale)) + 'px';
	}
	else
	{
		node.style.borderWidth = '0px';
	}

	color = (this.outline) ? null : this.fill;
	
	if (color != null && color != bpmConstants.NONE)
	{
		node.style.backgroundColor = color;
		node.style.backgroundImage = 'none';
	}
	else if (this.pointerEvents)
	{
		 node.style.backgroundColor = 'transparent';
	}
	else if (document.documentMode == 8)
	{
		bpmUtils.addTransparentBackgroundFilter(node);
	}
	else
	{
		this.setTransparentBackgroundImage(node);
	}
};

bpmShape.prototype.updateHtmlBounds = function(node)
{
	var sw = (document.documentMode >= 9) ? 0 : Math.ceil(this.strokewidth * this.scale);
	node.style.borderWidth = Math.max(1, sw) + 'px';
	node.style.overflow = 'hidden';
	
	node.style.left = Math.round(this.bounds.x - sw / 2) + 'px';
	node.style.top = Math.round(this.bounds.y - sw / 2) + 'px';

	if (document.compatMode == 'CSS1Compat')
	{
		sw = -sw;
	}
	
	node.style.width = Math.round(Math.max(0, this.bounds.width + sw)) + 'px';
	node.style.height = Math.round(Math.max(0, this.bounds.height + sw)) + 'px';
};

bpmShape.prototype.destroyCanvas = function(canvas)
{
	if (canvas instanceof bpmSvgCanvas2D)
	{
		for (var key in canvas.gradients)
		{
			var gradient = canvas.gradients[key];
			
			if (gradient != null)
			{
				gradient.bpmRefCount = (gradient.bpmRefCount || 0) + 1;
			}
		}
		
		this.releaseSvgGradients(this.oldGradients);
		this.oldGradients = canvas.gradients;
	}
};

bpmShape.prototype.paint = function(c)
{
	var strokeDrawn = false;
	
	if (c != null && this.outline)
	{
		var stroke = c.stroke;
		
		c.stroke = function()
		{
			strokeDrawn = true;
			stroke.apply(this, arguments);
		};

		var fillAndStroke = c.fillAndStroke;
		
		c.fillAndStroke = function()
		{
			strokeDrawn = true;
			fillAndStroke.apply(this, arguments);
		};
	}

	var s = this.scale;
	var x = this.bounds.x / s;
	var y = this.bounds.y / s;
	var w = this.bounds.width / s;
	var h = this.bounds.height / s;

	if (this.isPaintBoundsInverted())
	{
		var t = (w - h) / 2;
		x += t;
		y -= t;
		var tmp = w;
		w = h;
		h = tmp;
	}
	
	this.updateTransform(c, x, y, w, h);
	this.configureCanvas(c, x, y, w, h);

	var bg = null;
	
	if ((this.stencil == null && this.points == null && this.shapePointerEvents) ||
		(this.stencil != null && this.stencilPointerEvents))
	{
		var bb = this.createBoundingBox();
		
		if (this.dialect == bpmConstants.DIALECT_SVG)
		{
			bg = this.createTransparentSvgRectangle(bb.x, bb.y, bb.width, bb.height);
			this.node.appendChild(bg);
		}
		else
		{
			var rect = c.createRect('rect', bb.x / s, bb.y / s, bb.width / s, bb.height / s);
			rect.appendChild(c.createTransparentFill());
			rect.stroked = 'false';
			c.root.appendChild(rect);
		}
	}

	if (this.stencil != null)
	{
		this.stencil.drawShape(c, this, x, y, w, h);
	}
	else
	{
		c.setStrokeWidth(this.strokewidth);
		
		if (this.points != null)
		{
			var pts = [];
			
			for (var i = 0; i < this.points.length; i++)
			{
				if (this.points[i] != null)
				{
					pts.push(new bpmPoint(this.points[i].x / s, this.points[i].y / s));
				}
			}

			this.paintEdgeShape(c, pts);
		}
		else
		{
			this.paintVertexShape(c, x, y, w, h);
		}
	}
	
	if (bg != null && c.state != null && c.state.transform != null)
	{
		bg.setAttribute('transform', c.state.transform);
	}
	
	if (c != null && this.outline && !strokeDrawn)
	{
		c.rect(x, y, w, h);
		c.stroke();
	}
};

bpmShape.prototype.configureCanvas = function(c, x, y, w, h)
{
	var dash = null;
	
	if (this.style != null)
	{
		dash = this.style['dashPattern'];		
	}

	c.setAlpha(this.opacity / 100);
	c.setFillAlpha(this.fillOpacity / 100);
	c.setStrokeAlpha(this.strokeOpacity / 100);

	if (this.isShadow != null)
	{
		c.setShadow(this.isShadow);
	}
	
	if (this.isDashed != null)
	{
		c.setDashed(this.isDashed, (this.style != null) ?
			bpmUtils.getValue(this.style, bpmConstants.STYLE_FIX_DASH, false) == 1 : false);
	}

	if (dash != null)
	{
		c.setDashPattern(dash);
	}

	if (this.fill != null && this.fill != bpmConstants.NONE && this.gradient && this.gradient != bpmConstants.NONE)
	{
		var b = this.getGradientBounds(c, x, y, w, h);
		c.setGradient(this.fill, this.gradient, b.x, b.y, b.width, b.height, this.gradientDirection);
	}
	else
	{
		c.setFillColor(this.fill);
	}

	c.setStrokeColor(this.stroke);
};

bpmShape.prototype.getGradientBounds = function(c, x, y, w, h)
{
	return new bpmRectangle(x, y, w, h);
};

bpmShape.prototype.updateTransform = function(c, x, y, w, h)
{
	c.scale(this.scale);
	c.rotate(this.getShapeRotation(), this.flipH, this.flipV, x + w / 2, y + h / 2);
};

bpmShape.prototype.paintVertexShape = function(c, x, y, w, h)
{
	this.paintBackground(c, x, y, w, h);
	
	if (!this.outline || this.style == null || bpmUtils.getValue(
		this.style, bpmConstants.STYLE_BACKGROUND_OUTLINE, 0) == 0)
	{
		c.setShadow(false);
		this.paintForeground(c, x, y, w, h);
	}
};

bpmShape.prototype.paintBackground = function(c, x, y, w, h) { };
bpmShape.prototype.paintForeground = function(c, x, y, w, h) { };
bpmShape.prototype.paintEdgeShape = function(c, pts) { };

bpmShape.prototype.getArcSize = function(w, h)
{
	var r = 0;
	
	if (bpmUtils.getValue(this.style, bpmConstants.STYLE_ABSOLUTE_ARCSIZE, 0) == '1')
	{
		r = Math.min(w / 2, Math.min(h / 2, bpmUtils.getValue(this.style,
			bpmConstants.STYLE_ARCSIZE, bpmConstants.LINE_ARCSIZE) / 2));
	}
	else
	{
		var f = bpmUtils.getValue(this.style, bpmConstants.STYLE_ARCSIZE,
			bpmConstants.RECTANGLE_ROUNDING_FACTOR * 100) / 100;
		r = Math.min(w * f, h * f);
	}
	
	return r;
};

bpmShape.prototype.paintGlassEffect = function(c, x, y, w, h, arc)
{
	var sw = Math.ceil(this.strokewidth / 2);
	var size = 0.4;
	
	c.setGradient('#ffffff', '#ffffff', x, y, w, h * 0.6, 'south', 0.9, 0.1);
	c.begin();
	arc += 2 * sw;
		
	if (this.isRounded)
	{
		c.moveTo(x - sw + arc, y - sw);
		c.quadTo(x - sw, y - sw, x - sw, y - sw + arc);
		c.lineTo(x - sw, y + h * size);
		c.quadTo(x + w * 0.5, y + h * 0.7, x + w + sw, y + h * size);
		c.lineTo(x + w + sw, y - sw + arc);
		c.quadTo(x + w + sw, y - sw, x + w + sw - arc, y - sw);
	}
	else
	{
		c.moveTo(x - sw, y - sw);
		c.lineTo(x - sw, y + h * size);
		c.quadTo(x + w * 0.5, y + h * 0.7, x + w + sw, y + h * size);
		c.lineTo(x + w + sw, y - sw);
	}
	
	c.close();
	c.fill();
};

bpmShape.prototype.addPoints = function(c, pts, rounded, arcSize, close, exclude, initialMove)
{
	if (pts != null && pts.length > 0)
	{
		initialMove = (initialMove != null) ? initialMove : true;
		var pe = pts[pts.length - 1];
		
		if (close && rounded)
		{
			pts = pts.slice();
			var p0 = pts[0];
			var wp = new bpmPoint(pe.x + (p0.x - pe.x) / 2, pe.y + (p0.y - pe.y) / 2);
			pts.splice(0, 0, wp);
		}
	
		var pt = pts[0];
		var i = 1;
	
		if (initialMove)
		{
			c.moveTo(pt.x, pt.y);
		}
		else
		{
			c.lineTo(pt.x, pt.y);
		}
		
		while (i < ((close) ? pts.length : pts.length - 1))
		{
			var tmp = pts[bpmUtils.mod(i, pts.length)];
			var dx = pt.x - tmp.x;
			var dy = pt.y - tmp.y;
	
			if (rounded && (dx != 0 || dy != 0) && (exclude == null || bpmUtils.indexOf(exclude, i - 1) < 0))
			{
				var dist = Math.sqrt(dx * dx + dy * dy);
				var nx1 = dx * Math.min(arcSize, dist / 2) / dist;
				var ny1 = dy * Math.min(arcSize, dist / 2) / dist;
	
				var x1 = tmp.x + nx1;
				var y1 = tmp.y + ny1;
				c.lineTo(x1, y1);
	
				var next = pts[bpmUtils.mod(i + 1, pts.length)];
				
				while (i < pts.length - 2 && Math.round(next.x - tmp.x) == 0 && Math.round(next.y - tmp.y) == 0)
				{
					next = pts[bpmUtils.mod(i + 2, pts.length)];
					i++;
				}
				
				dx = next.x - tmp.x;
				dy = next.y - tmp.y;
	
				dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
				var nx2 = dx * Math.min(arcSize, dist / 2) / dist;
				var ny2 = dy * Math.min(arcSize, dist / 2) / dist;
	
				var x2 = tmp.x + nx2;
				var y2 = tmp.y + ny2;
	
				c.quadTo(tmp.x, tmp.y, x2, y2);
				tmp = new bpmPoint(x2, y2);
			}
			else
			{
				c.lineTo(tmp.x, tmp.y);
			}
	
			pt = tmp;
			i++;
		}
	
		if (close)
		{
			c.close();
		}
		else
		{
			c.lineTo(pe.x, pe.y);
		}
	}
};

bpmShape.prototype.resetStyles = function()
{
	this.initStyles();

	this.spacing = 0;
	
	delete this.fill;
	delete this.gradient;
	delete this.gradientDirection;
	delete this.stroke;
	delete this.startSize;
	delete this.endSize;
	delete this.startArrow;
	delete this.endArrow;
	delete this.direction;
	delete this.isShadow;
	delete this.isDashed;
	delete this.isRounded;
	delete this.glass;
};

bpmShape.prototype.apply = function(state)
{
	this.state = state;
	this.style = state.style;

	if (this.style != null)
	{
		this.fill = bpmUtils.getValue(this.style, bpmConstants.STYLE_FILLCOLOR, this.fill);
		this.gradient = bpmUtils.getValue(this.style, bpmConstants.STYLE_GRADIENTCOLOR, this.gradient);
		this.gradientDirection = bpmUtils.getValue(this.style, bpmConstants.STYLE_GRADIENT_DIRECTION, this.gradientDirection);
		this.opacity = bpmUtils.getValue(this.style, bpmConstants.STYLE_OPACITY, this.opacity);
		this.fillOpacity = bpmUtils.getValue(this.style, bpmConstants.STYLE_FILL_OPACITY, this.fillOpacity);
		this.strokeOpacity = bpmUtils.getValue(this.style, bpmConstants.STYLE_STROKE_OPACITY, this.strokeOpacity);
		this.stroke = bpmUtils.getValue(this.style, bpmConstants.STYLE_STROKECOLOR, this.stroke);
		this.strokewidth = bpmUtils.getNumber(this.style, bpmConstants.STYLE_STROKEWIDTH, this.strokewidth);
		this.spacing = bpmUtils.getValue(this.style, bpmConstants.STYLE_SPACING, this.spacing);
		this.startSize = bpmUtils.getNumber(this.style, bpmConstants.STYLE_STARTSIZE, this.startSize);
		this.endSize = bpmUtils.getNumber(this.style, bpmConstants.STYLE_ENDSIZE, this.endSize);
		this.startArrow = bpmUtils.getValue(this.style, bpmConstants.STYLE_STARTARROW, this.startArrow);
		this.endArrow = bpmUtils.getValue(this.style, bpmConstants.STYLE_ENDARROW, this.endArrow);
		this.rotation = bpmUtils.getValue(this.style, bpmConstants.STYLE_ROTATION, this.rotation);
		this.direction = bpmUtils.getValue(this.style, bpmConstants.STYLE_DIRECTION, this.direction);
		this.flipH = bpmUtils.getValue(this.style, bpmConstants.STYLE_FLIPH, 0) == 1;
		this.flipV = bpmUtils.getValue(this.style, bpmConstants.STYLE_FLIPV, 0) == 1;	
		
		if (this.stencil != null)
		{
			this.flipH = bpmUtils.getValue(this.style, 'stencilFlipH', 0) == 1 || this.flipH;
			this.flipV = bpmUtils.getValue(this.style, 'stencilFlipV', 0) == 1 || this.flipV;
		}
		
		if (this.direction == bpmConstants.DIRECTION_NORTH || this.direction == bpmConstants.DIRECTION_SOUTH)
		{
			var tmp = this.flipH;
			this.flipH = this.flipV;
			this.flipV = tmp;
		}

		this.isShadow = bpmUtils.getValue(this.style, bpmConstants.STYLE_SHADOW, this.isShadow) == 1;
		this.isDashed = bpmUtils.getValue(this.style, bpmConstants.STYLE_DASHED, this.isDashed) == 1;
		this.isRounded = bpmUtils.getValue(this.style, bpmConstants.STYLE_ROUNDED, this.isRounded) == 1;
		this.glass = bpmUtils.getValue(this.style, bpmConstants.STYLE_GLASS, this.glass) == 1;
		
		if (this.fill == bpmConstants.NONE)
		{
			this.fill = null;
		}

		if (this.gradient == bpmConstants.NONE)
		{
			this.gradient = null;
		}

		if (this.stroke == bpmConstants.NONE)
		{
			this.stroke = null;
		}
	}
};

bpmShape.prototype.setCursor = function(cursor)
{
	if (cursor == null)
	{
		cursor = '';
	}
	
	this.cursor = cursor;

	if (this.node != null)
	{
		this.node.style.cursor = cursor;
	}
};

bpmShape.prototype.getCursor = function()
{
	return this.cursor;
};

bpmShape.prototype.isRoundable = function()
{
	return false;
};

bpmShape.prototype.updateBoundingBox = function()
{
	if (this.useSvgBoundingBox && this.node != null && this.node.ownerSVGElement != null)
	{
		try
		{
			var b = this.node.getBBox();
	
			if (b.width > 0 && b.height > 0)
			{
				this.boundingBox = new bpmRectangle(b.x, b.y, b.width, b.height);
				this.boundingBox.grow(this.strokewidth * this.scale / 2);
				
				return;
			}
		}
		catch(e)
		{

		}
	}

	if (this.bounds != null)
	{
		var bbox = this.createBoundingBox();
		
		if (bbox != null)
		{
			this.augmentBoundingBox(bbox);
			var rot = this.getShapeRotation();
			
			if (rot != 0)
			{
				bbox = bpmUtils.getBoundingBox(bbox, rot);
			}
		}

		this.boundingBox = bbox;
	}
};

bpmShape.prototype.createBoundingBox = function()
{
	var bb = this.bounds.clone();

	if ((this.stencil != null && (this.direction == bpmConstants.DIRECTION_NORTH ||
		this.direction == bpmConstants.DIRECTION_SOUTH)) || this.isPaintBoundsInverted())
	{
		bb.rotate90();
	}
	
	return bb;
};

bpmShape.prototype.augmentBoundingBox = function(bbox)
{
	if (this.isShadow)
	{
		bbox.width += Math.ceil(bpmConstants.SHADOW_OFFSET_X * this.scale);
		bbox.height += Math.ceil(bpmConstants.SHADOW_OFFSET_Y * this.scale);
	}
	
	bbox.grow(this.strokewidth * this.scale / 2);
};

bpmShape.prototype.isPaintBoundsInverted = function()
{
	return this.stencil == null && (this.direction == bpmConstants.DIRECTION_NORTH ||
			this.direction == bpmConstants.DIRECTION_SOUTH);
};

bpmShape.prototype.getRotation = function()
{
	return (this.rotation != null) ? this.rotation : 0;
};

bpmShape.prototype.getTextRotation = function()
{
	var rot = this.getRotation();
	
	if (bpmUtils.getValue(this.style, bpmConstants.STYLE_HORIZONTAL, 1) != 1)
	{
		rot += bpmText.prototype.verticalTextRotation;
	}
	
	return rot;
};

bpmShape.prototype.getShapeRotation = function()
{
	var rot = this.getRotation();
	
	if (this.direction != null)
	{
		if (this.direction == bpmConstants.DIRECTION_NORTH)
		{
			rot += 270;
		}
		else if (this.direction == bpmConstants.DIRECTION_WEST)
		{
			rot += 180;
		}
		else if (this.direction == bpmConstants.DIRECTION_SOUTH)
		{
			rot += 90;
		}
	}
	
	return rot;
};

bpmShape.prototype.createTransparentSvgRectangle = function(x, y, w, h)
{
	var rect = document.createElementNS(bpmConstants.NS_SVG, 'rect');
	rect.setAttribute('x', x);
	rect.setAttribute('y', y);
	rect.setAttribute('width', w);
	rect.setAttribute('height', h);
	rect.setAttribute('fill', 'none');
	rect.setAttribute('stroke', 'none');
	rect.setAttribute('pointer-events', 'all');
	
	return rect;
};

bpmShape.prototype.setTransparentBackgroundImage = function(node)
{
	node.style.backgroundImage = 'url(\'' + bpmCore.imageBasePath + '/transparent.gif\')';
};

bpmShape.prototype.releaseSvgGradients = function(grads)
{
	if (grads != null)
	{
		for (var key in grads)
		{
			var gradient = grads[key];
			
			if (gradient != null)
			{
				gradient.bpmRefCount = (gradient.bpmRefCount || 0) - 1;
				
				if (gradient.bpmRefCount == 0 && gradient.parentNode != null)
				{
					gradient.parentNode.removeChild(gradient);
				}
			}
		}
	}
};

bpmShape.prototype.destroy = function()
{
	if (this.node != null)
	{
		bpmEvent.release(this.node);
		
		if (this.node.parentNode != null)
		{
			this.node.parentNode.removeChild(this.node);
		}
		
		this.node = null;
	}
	
	this.releaseSvgGradients(this.oldGradients);
	this.oldGradients = null;
};


/* Stencil */
function bpmStencil(desc)
{
	this.desc = desc;
	this.parseDescription();
	this.parseConstraints();
};

bpmUtils.extend(bpmStencil, bpmShape);
bpmStencil.defaultLocalized = false;
bpmStencil.allowEval = false;
bpmStencil.prototype.desc = null;
bpmStencil.prototype.constraints = null;
bpmStencil.prototype.aspect = null;
bpmStencil.prototype.w0 = null;
bpmStencil.prototype.h0 = null;
bpmStencil.prototype.bgNode = null;
bpmStencil.prototype.fgNode = null;
bpmStencil.prototype.strokewidth = null;


bpmStencil.prototype.parseDescription = function()
{
	this.fgNode = this.desc.getElementsByTagName('foreground')[0];
	this.bgNode = this.desc.getElementsByTagName('background')[0];
	this.w0 = Number(this.desc.getAttribute('w') || 100);
	this.h0 = Number(this.desc.getAttribute('h') || 100);
	
	var aspect = this.desc.getAttribute('aspect');
	this.aspect = (aspect != null) ? aspect : 'variable';
	
	var sw = this.desc.getAttribute('strokewidth');
	this.strokewidth = (sw != null) ? sw : '1';
};

bpmStencil.prototype.parseConstraints = function()
{
	var conns = this.desc.getElementsByTagName('connections')[0];
	
	if (conns != null)
	{
		var tmp = bpmUtils.getChildNodes(conns);
		
		if (tmp != null && tmp.length > 0)
		{
			this.constraints = [];
			
			for (var i = 0; i < tmp.length; i++)
			{
				this.constraints.push(this.parseConstraint(tmp[i]));
			}
		}
	}
};

bpmStencil.prototype.parseConstraint = function(node)
{
	var x = Number(node.getAttribute('x'));
	var y = Number(node.getAttribute('y'));
	var perimeter = node.getAttribute('perimeter') == '1';
	var name = node.getAttribute('name');
	
	return new bpmConnectionConstraint(new bpmPoint(x, y), perimeter, name);
};

bpmStencil.prototype.evaluateTextAttribute = function(node, attribute, shape)
{
	var result = this.evaluateAttribute(node, attribute, shape);
	var loc = node.getAttribute('localized');
	
	if ((bpmStencil.defaultLocalized && loc == null) || loc == '1')
	{
		result = bpmResources.get(result);
	}

	return result;
};

bpmStencil.prototype.evaluateAttribute = function(node, attribute, shape)
{
	var result = node.getAttribute(attribute);
	
	if (result == null)
	{
		var text = bpmUtils.getTextContent(node);
		
		if (text != null && bpmStencil.allowEval)
		{
			var funct = bpmUtils.eval(text);
			
			if (typeof(funct) == 'function')
			{
				result = funct(shape);
			}
		}
	}
	
	return result;
};

bpmStencil.prototype.drawShape = function(canvas, shape, x, y, w, h)
{
	var direction = bpmUtils.getValue(shape.style, bpmConstants.STYLE_DIRECTION, null);
	var aspect = this.computeAspect(shape.style, x, y, w, h, direction);
	var minScale = Math.min(aspect.width, aspect.height);
	var sw = (this.strokewidth == 'inherit') ?
			Number(bpmUtils.getNumber(shape.style, bpmConstants.STYLE_STROKEWIDTH, 1)) :
			Number(this.strokewidth) * minScale;
	canvas.setStrokeWidth(sw);

	if (shape.style != null && bpmUtils.getValue(shape.style, bpmConstants.STYLE_POINTER_EVENTS, '0') == '1')
	{
		canvas.setStrokeColor(bpmConstants.NONE);
		canvas.rect(x, y, w, h);
		canvas.stroke();
		canvas.setStrokeColor(shape.stroke);
	}

	this.drawChildren(canvas, shape, x, y, w, h, this.bgNode, aspect, false, true);
	this.drawChildren(canvas, shape, x, y, w, h, this.fgNode, aspect, true,
		!shape.outline || shape.style == null || bpmUtils.getValue(
		shape.style, bpmConstants.STYLE_BACKGROUND_OUTLINE, 0) == 0);
};

bpmStencil.prototype.drawChildren = function(canvas, shape, x, y, w, h, node, aspect, disableShadow, paint)
{
	if (node != null && w > 0 && h > 0)
	{
		var tmp = node.firstChild;
		
		while (tmp != null)
		{
			if (tmp.nodeType == bpmConstants.NODETYPE_ELEMENT)
			{
				this.drawNode(canvas, shape, tmp, aspect, disableShadow, paint);
			}
			
			tmp = tmp.nextSibling;
		}
	}
};

bpmStencil.prototype.computeAspect = function(shape, x, y, w, h, direction)
{
	var x0 = x;
	var y0 = y;
	var sx = w / this.w0;
	var sy = h / this.h0;
	
	var inverse = (direction == bpmConstants.DIRECTION_NORTH || direction == bpmConstants.DIRECTION_SOUTH);

	if (inverse)
	{
		sy = w / this.h0;
		sx = h / this.w0;
		
		var delta = (w - h) / 2;

		x0 += delta;
		y0 -= delta;
	}

	if (this.aspect == 'fixed')
	{
		sy = Math.min(sx, sy);
		sx = sy;
		
		if (inverse)
		{
			x0 += (h - this.w0 * sx) / 2;
			y0 += (w - this.h0 * sy) / 2;
		}
		else
		{
			x0 += (w - this.w0 * sx) / 2;
			y0 += (h - this.h0 * sy) / 2;
		}
	}

	return new bpmRectangle(x0, y0, sx, sy);
};

bpmStencil.prototype.drawNode = function(canvas, shape, node, aspect, disableShadow, paint)
{
	var name = node.nodeName;
	var x0 = aspect.x;
	var y0 = aspect.y;
	var sx = aspect.width;
	var sy = aspect.height;
	var minScale = Math.min(sx, sy);
	
	if (name == 'save')
	{
		canvas.save();
	}
	else if (name == 'restore')
	{
		canvas.restore();
	}
	else if (paint)
	{
		if (name == 'path')
		{
			canvas.begin();
			
			var parseRegularly = true;
			
			if (node.getAttribute('rounded') == '1')
			{
				parseRegularly = false;
				
				var arcSize = Number(node.getAttribute('arcSize'));
				var pointCount = 0;
				var segs = [];
				
				var childNode = node.firstChild;
				
				while (childNode != null)
				{
					if (childNode.nodeType == bpmConstants.NODETYPE_ELEMENT)
					{
						var childName = childNode.nodeName;
						
						if (childName == 'move' || childName == 'line')
						{
							if (childName == 'move' || segs.length == 0)
							{
								segs.push([]);
							}
							
							segs[segs.length - 1].push(new bpmPoint(x0 + Number(childNode.getAttribute('x')) * sx,
								y0 + Number(childNode.getAttribute('y')) * sy));
							pointCount++;
						}
						else
						{
							parseRegularly = true;
							break;
						}
					}
					
					childNode = childNode.nextSibling;
				}

				if (!parseRegularly && pointCount > 0)
				{
					for (var i = 0; i < segs.length; i++)
					{
						var close = false, ps = segs[i][0], pe = segs[i][segs[i].length - 1];
						
						if (ps.x == pe.x && ps.y == pe.y) 
						{
							segs[i].pop();
							close = true;
						}
						
						this.addPoints(canvas, segs[i], true, arcSize, close);
					}
				}
				else
				{
					parseRegularly = true;
				}
			}
			
			if (parseRegularly)
			{
				var childNode = node.firstChild;
				
				while (childNode != null)
				{
					if (childNode.nodeType == bpmConstants.NODETYPE_ELEMENT)
					{
						this.drawNode(canvas, shape, childNode, aspect, disableShadow, paint);
					}
					
					childNode = childNode.nextSibling;
				}
			}
		}
		else if (name == 'close')
		{
			canvas.close();
		}
		else if (name == 'move')
		{
			canvas.moveTo(x0 + Number(node.getAttribute('x')) * sx, y0 + Number(node.getAttribute('y')) * sy);
		}
		else if (name == 'line')
		{
			canvas.lineTo(x0 + Number(node.getAttribute('x')) * sx, y0 + Number(node.getAttribute('y')) * sy);
		}
		else if (name == 'quad')
		{
			canvas.quadTo(x0 + Number(node.getAttribute('x1')) * sx,
					y0 + Number(node.getAttribute('y1')) * sy,
					x0 + Number(node.getAttribute('x2')) * sx,
					y0 + Number(node.getAttribute('y2')) * sy);
		}
		else if (name == 'curve')
		{
			canvas.curveTo(x0 + Number(node.getAttribute('x1')) * sx,
					y0 + Number(node.getAttribute('y1')) * sy,
					x0 + Number(node.getAttribute('x2')) * sx,
					y0 + Number(node.getAttribute('y2')) * sy,
					x0 + Number(node.getAttribute('x3')) * sx,
					y0 + Number(node.getAttribute('y3')) * sy);
		}
		else if (name == 'arc')
		{
			canvas.arcTo(Number(node.getAttribute('rx')) * sx,
					Number(node.getAttribute('ry')) * sy,
					Number(node.getAttribute('x-axis-rotation')),
					Number(node.getAttribute('large-arc-flag')),
					Number(node.getAttribute('sweep-flag')),
					x0 + Number(node.getAttribute('x')) * sx,
					y0 + Number(node.getAttribute('y')) * sy);
		}
		else if (name == 'rect')
		{
			canvas.rect(x0 + Number(node.getAttribute('x')) * sx,
					y0 + Number(node.getAttribute('y')) * sy,
					Number(node.getAttribute('w')) * sx,
					Number(node.getAttribute('h')) * sy);
		}
		else if (name == 'roundrect')
		{
			var arcsize = Number(node.getAttribute('arcsize'));
	
			if (arcsize == 0)
			{
				arcsize = bpmConstants.RECTANGLE_ROUNDING_FACTOR * 100;
			}
			
			var w = Number(node.getAttribute('w')) * sx;
			var h = Number(node.getAttribute('h')) * sy;
			var factor = Number(arcsize) / 100;
			var r = Math.min(w * factor, h * factor);
			
			canvas.roundrect(x0 + Number(node.getAttribute('x')) * sx,
					y0 + Number(node.getAttribute('y')) * sy,
					w, h, r, r);
		}
		else if (name == 'ellipse')
		{
			canvas.ellipse(x0 + Number(node.getAttribute('x')) * sx,
				y0 + Number(node.getAttribute('y')) * sy,
				Number(node.getAttribute('w')) * sx,
				Number(node.getAttribute('h')) * sy);
		}
		else if (name == 'image')
		{
			if (!shape.outline)
			{
				var src = this.evaluateAttribute(node, 'src', shape);
				
				canvas.image(x0 + Number(node.getAttribute('x')) * sx,
					y0 + Number(node.getAttribute('y')) * sy,
					Number(node.getAttribute('w')) * sx,
					Number(node.getAttribute('h')) * sy,
					src, false, node.getAttribute('flipH') == '1',
					node.getAttribute('flipV') == '1');
			}
		}
		else if (name == 'text')
		{
			if (!shape.outline)
			{
				var str = this.evaluateTextAttribute(node, 'str', shape);
				var rotation = node.getAttribute('vertical') == '1' ? -90 : 0;
				
				if (node.getAttribute('align-shape') == '0')
				{
					var dr = shape.rotation;
		
					var flipH = bpmUtils.getValue(shape.style, bpmConstants.STYLE_FLIPH, 0) == 1;
					var flipV = bpmUtils.getValue(shape.style, bpmConstants.STYLE_FLIPV, 0) == 1;
					
					if (flipH && flipV)
					{
						rotation -= dr;
					}
					else if (flipH || flipV)
					{
						rotation += dr;
					}
					else
					{
						rotation -= dr;
					}
				}
		
				rotation -= node.getAttribute('rotation');
		
				canvas.text(x0 + Number(node.getAttribute('x')) * sx,
						y0 + Number(node.getAttribute('y')) * sy,
						0, 0, str, node.getAttribute('align') || 'left',
						node.getAttribute('valign') || 'top', false, '',
						null, false, rotation);
			}
		}
		else if (name == 'include-shape')
		{
			var stencil = bpmStencilRegistry.getStencil(node.getAttribute('name'));
			
			if (stencil != null)
			{
				var x = x0 + Number(node.getAttribute('x')) * sx;
				var y = y0 + Number(node.getAttribute('y')) * sy;
				var w = Number(node.getAttribute('w')) * sx;
				var h = Number(node.getAttribute('h')) * sy;
				
				stencil.drawShape(canvas, shape, x, y, w, h);
			}
		}
		else if (name == 'fillstroke')
		{
			canvas.fillAndStroke();
		}
		else if (name == 'fill')
		{
			canvas.fill();
		}
		else if (name == 'stroke')
		{
			canvas.stroke();
		}
		else if (name == 'strokewidth')
		{
			var s = (node.getAttribute('fixed') == '1') ? 1 : minScale;
			canvas.setStrokeWidth(Number(node.getAttribute('width')) * s);
		}
		else if (name == 'dashed')
		{
			canvas.setDashed(node.getAttribute('dashed') == '1');
		}
		else if (name == 'dashpattern')
		{
			var value = node.getAttribute('pattern');
			
			if (value != null)
			{
				var tmp = value.split(' ');
				var pat = [];
				
				for (var i = 0; i < tmp.length; i++)
				{
					if (tmp[i].length > 0)
					{
						pat.push(Number(tmp[i]) * minScale);
					}
				}
				
				value = pat.join(' ');
				canvas.setDashPattern(value);
			}
		}
		else if (name == 'strokecolor')
		{
			canvas.setStrokeColor(node.getAttribute('color'));
		}
		else if (name == 'linecap')
		{
			canvas.setLineCap(node.getAttribute('cap'));
		}
		else if (name == 'linejoin')
		{
			canvas.setLineJoin(node.getAttribute('join'));
		}
		else if (name == 'miterlimit')
		{
			canvas.setMiterLimit(Number(node.getAttribute('limit')));
		}
		else if (name == 'fillcolor')
		{
			canvas.setFillColor(node.getAttribute('color'));
		}
		else if (name == 'alpha')
		{
			canvas.setAlpha(node.getAttribute('alpha'));
		}
		else if (name == 'fillalpha')
		{
			canvas.setAlpha(node.getAttribute('alpha'));
		}
		else if (name == 'strokealpha')
		{
			canvas.setAlpha(node.getAttribute('alpha'));
		}
		else if (name == 'fontcolor')
		{
			canvas.setFontColor(node.getAttribute('color'));
		}
		else if (name == 'fontstyle')
		{
			canvas.setFontStyle(node.getAttribute('style'));
		}
		else if (name == 'fontfamily')
		{
			canvas.setFontFamily(node.getAttribute('family'));
		}
		else if (name == 'fontsize')
		{
			canvas.setFontSize(Number(node.getAttribute('size')) * minScale);
		}
		
		if (disableShadow && (name == 'fillstroke' || name == 'fill' || name == 'stroke'))
		{
			disableShadow = false;
			canvas.setShadow(false);
		}
	}
};

/* add stencils */
var bpmStencilRegistry =
{
	stencils: {},
	
	addStencil: function(name, stencil)
	{
		bpmStencilRegistry.stencils[name] = stencil;
	},
	
	getStencil: function(name)
	{
		return bpmStencilRegistry.stencils[name];
	}

};



var bpmMarker =
{
	markers: [],
	
	addMarker: function(type, funct)
	{
		bpmMarker.markers[type] = funct;
	},
	
	createMarker: function(canvas, shape, type, pe, unitX, unitY, size, source, sw, filled)
	{
		var funct = bpmMarker.markers[type];
		
		return (funct != null) ? funct(canvas, shape, type, pe, unitX, unitY, size, source, sw, filled) : null;
	}

};

(function()
{
	function createArrow(widthFactor)
	{
		widthFactor = (widthFactor != null) ? widthFactor : 2;
		
		return function(canvas, shape, type, pe, unitX, unitY, size, source, sw, filled)
		{
			var endOffsetX = unitX * sw * 1.118;
			var endOffsetY = unitY * sw * 1.118;
			
			unitX = unitX * (size + sw);
			unitY = unitY * (size + sw);
	
			var pt = pe.clone();
			pt.x -= endOffsetX;
			pt.y -= endOffsetY;
			
			var f = (type != bpmConstants.ARROW_CLASSIC && type != bpmConstants.ARROW_CLASSIC_THIN) ? 1 : 3 / 4;
			pe.x += -unitX * f - endOffsetX;
			pe.y += -unitY * f - endOffsetY;
			
			return function()
			{
				canvas.begin();
				canvas.moveTo(pt.x, pt.y);
				canvas.lineTo(pt.x - unitX - unitY / widthFactor, pt.y - unitY + unitX / widthFactor);
			
				if (type == bpmConstants.ARROW_CLASSIC || type == bpmConstants.ARROW_CLASSIC_THIN)
				{
					canvas.lineTo(pt.x - unitX * 3 / 4, pt.y - unitY * 3 / 4);
				}
			
				canvas.lineTo(pt.x + unitY / widthFactor - unitX, pt.y - unitY - unitX / widthFactor);
				canvas.close();
	
				if (filled)
				{
					canvas.fillAndStroke();
				}
				else
				{
					canvas.stroke();
				}
			};
		}
	};
	
	bpmMarker.addMarker('classic', createArrow(2));
	bpmMarker.addMarker('classicThin', createArrow(3));
	bpmMarker.addMarker('block', createArrow(2));
	bpmMarker.addMarker('blockThin', createArrow(3));
	
	function createOpenArrow(widthFactor)
	{
		widthFactor = (widthFactor != null) ? widthFactor : 2;
		
		return function(canvas, shape, type, pe, unitX, unitY, size, source, sw, filled)
		{
			var endOffsetX = unitX * sw * 1.118;
			var endOffsetY = unitY * sw * 1.118;
			
			unitX = unitX * (size + sw);
			unitY = unitY * (size + sw);
			
			var pt = pe.clone();
			pt.x -= endOffsetX;
			pt.y -= endOffsetY;
			
			pe.x += -endOffsetX * 2;
			pe.y += -endOffsetY * 2;

			return function()
			{
				canvas.begin();
				canvas.moveTo(pt.x - unitX - unitY / widthFactor, pt.y - unitY + unitX / widthFactor);
				canvas.lineTo(pt.x, pt.y);
				canvas.lineTo(pt.x + unitY / widthFactor - unitX, pt.y - unitY - unitX / widthFactor);
				canvas.stroke();
			};
		}
	};
	
	bpmMarker.addMarker('open', createOpenArrow(2));
	bpmMarker.addMarker('openThin', createOpenArrow(3));
	
	bpmMarker.addMarker('oval', function(canvas, shape, type, pe, unitX, unitY, size, source, sw, filled)
	{
		var a = size / 2;
		
		var pt = pe.clone();
		pe.x -= unitX * a;
		pe.y -= unitY * a;

		return function()
		{
			canvas.ellipse(pt.x - a, pt.y - a, size, size);
						
			if (filled)
			{
				canvas.fillAndStroke();
			}
			else
			{
				canvas.stroke();
			}
		};
	});

	function diamond(canvas, shape, type, pe, unitX, unitY, size, source, sw, filled)
	{
		var swFactor = (type == bpmConstants.ARROW_DIAMOND) ?  0.7071 : 0.9862;
		var endOffsetX = unitX * sw * swFactor;
		var endOffsetY = unitY * sw * swFactor;
		
		unitX = unitX * (size + sw);
		unitY = unitY * (size + sw);
		
		var pt = pe.clone();
		pt.x -= endOffsetX;
		pt.y -= endOffsetY;
		
		pe.x += -unitX - endOffsetX;
		pe.y += -unitY - endOffsetY;
		
		var tk = ((type == bpmConstants.ARROW_DIAMOND) ?  2 : 3.4);
		
		return function()
		{
			canvas.begin();
			canvas.moveTo(pt.x, pt.y);
			canvas.lineTo(pt.x - unitX / 2 - unitY / tk, pt.y + unitX / tk - unitY / 2);
			canvas.lineTo(pt.x - unitX, pt.y - unitY);
			canvas.lineTo(pt.x - unitX / 2 + unitY / tk, pt.y - unitY / 2 - unitX / tk);
			canvas.close();
			
			if (filled)
			{
				canvas.fillAndStroke();
			}
			else
			{
				canvas.stroke();
			}
		};
	};

	bpmMarker.addMarker('diamond', diamond);
	bpmMarker.addMarker('diamondThin', diamond);
})();



/* Actor */
function bpmActor(bounds, fill, stroke, strokewidth)
{
	bpmShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
};

bpmUtils.extend(bpmActor, bpmShape);

bpmActor.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.translate(x, y);
	c.begin();
	this.redrawPath(c, x, y, w, h);
	c.fillAndStroke();
};

bpmActor.prototype.redrawPath = function(c, x, y, w, h)
{
	var width = w/3;
	c.moveTo(0, h);
	c.curveTo(0, 3 * h / 5, 0, 2 * h / 5, w / 2, 2 * h / 5);
	c.curveTo(w / 2 - width, 2 * h / 5, w / 2 - width, 0, w / 2, 0);
	c.curveTo(w / 2 + width, 0, w / 2 + width, 2 * h / 5, w / 2, 2 * h / 5);
	c.curveTo(w, 2 * h / 5, w, 3 * h / 5, w, h);
	c.close();
};



/* Cloud */
function bpmCloud(bounds, fill, stroke, strokewidth)
{
	bpmActor.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
};

bpmUtils.extend(bpmCloud, bpmActor);

bpmCloud.prototype.redrawPath = function(c, x, y, w, h)
{
	c.moveTo(0.25 * w, 0.25 * h);
	c.curveTo(0.05 * w, 0.25 * h, 0, 0.5 * h, 0.16 * w, 0.55 * h);
	c.curveTo(0, 0.66 * h, 0.18 * w, 0.9 * h, 0.31 * w, 0.8 * h);
	c.curveTo(0.4 * w, h, 0.7 * w, h, 0.8 * w, 0.8 * h);
	c.curveTo(w, 0.8 * h, w, 0.6 * h, 0.875 * w, 0.5 * h);
	c.curveTo(w, 0.3 * h, 0.8 * w, 0.1 * h, 0.625 * w, 0.2 * h);
	c.curveTo(0.5 * w, 0.05 * h, 0.3 * w, 0.05 * h, 0.25 * w, 0.25 * h);
	c.close();
};


/* Rectangle Shape */
function bpmRectangleShape(bounds, fill, stroke, strokewidth)
{
	bpmShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
};

bpmUtils.extend(bpmRectangleShape, bpmShape);

bpmRectangleShape.prototype.isHtmlAllowed = function()
{
	var events = true;
	
	if (this.style != null)
	{
		events = bpmUtils.getValue(this.style, bpmConstants.STYLE_POINTER_EVENTS, '1') == '1';		
	}
	
	return !this.isRounded && !this.glass && this.rotation == 0 && (events ||
		(this.fill != null && this.fill != bpmConstants.NONE));
};

bpmRectangleShape.prototype.paintBackground = function(c, x, y, w, h)
{
	var events = true;
	
	if (this.style != null)
	{
		events = bpmUtils.getValue(this.style, bpmConstants.STYLE_POINTER_EVENTS, '1') == '1';
	}
	
	if (events || (this.fill != null && this.fill != bpmConstants.NONE) ||
		(this.stroke != null && this.stroke != bpmConstants.NONE))
	{
		if (!events && (this.fill == null || this.fill == bpmConstants.NONE))
		{
			c.pointerEvents = false;
		}
		
		if (this.isRounded)
		{
			var r = 0;
			
			if (bpmUtils.getValue(this.style, bpmConstants.STYLE_ABSOLUTE_ARCSIZE, 0) == '1')
			{
				r = Math.min(w / 2, Math.min(h / 2, bpmUtils.getValue(this.style,
					bpmConstants.STYLE_ARCSIZE, bpmConstants.LINE_ARCSIZE) / 2));
			}
			else
			{
				var f = bpmUtils.getValue(this.style, bpmConstants.STYLE_ARCSIZE,
					bpmConstants.RECTANGLE_ROUNDING_FACTOR * 100) / 100;
				r = Math.min(w * f, h * f);
			}
			
			c.roundrect(x, y, w, h, r, r);
		}
		else
		{
			c.rect(x, y, w, h);
		}
			
		c.fillAndStroke();
	}
};

bpmRectangleShape.prototype.isRoundable = function(c, x, y, w, h)
{
	return true;
};

bpmRectangleShape.prototype.paintForeground = function(c, x, y, w, h)
{
	if (this.glass && !this.outline && this.fill != null && this.fill != bpmConstants.NONE)
	{
		this.paintGlassEffect(c, x, y, w, h, this.getArcSize(w + this.strokewidth, h + this.strokewidth));
	}
};


/* Ellipse */
function bpmEllipse(bounds, fill, stroke, strokewidth)
{
	bpmShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
};

bpmUtils.extend(bpmEllipse, bpmShape);

bpmEllipse.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.ellipse(x, y, w, h);
	c.fillAndStroke();
};



/* Double Ellipse */
function bpmDoubleEllipse(bounds, fill, stroke, strokewidth)
{
	bpmShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
};

bpmUtils.extend(bpmDoubleEllipse, bpmShape);

bpmDoubleEllipse.prototype.vmlScale = 10;

bpmDoubleEllipse.prototype.paintBackground = function(c, x, y, w, h)
{
	c.ellipse(x, y, w, h);
	c.fillAndStroke();
};

bpmDoubleEllipse.prototype.paintForeground = function(c, x, y, w, h)
{
	if (!this.outline)
	{
		var margin = bpmUtils.getValue(this.style, bpmConstants.STYLE_MARGIN, Math.min(3 + this.strokewidth, Math.min(w / 5, h / 5)));
		x += margin;
		y += margin;
		w -= 2 * margin;
		h -= 2 * margin;
		
		if (w > 0 && h > 0)
		{
			c.ellipse(x, y, w, h);
		}
		
		c.stroke();
	}
};

bpmDoubleEllipse.prototype.getLabelBounds = function(rect)
{
	var margin = (bpmUtils.getValue(this.style, bpmConstants.STYLE_MARGIN, Math.min(3 + this.strokewidth,
			Math.min(rect.width / 5 / this.scale, rect.height / 5 / this.scale)))) * this.scale;

	return new bpmRectangle(rect.x + margin, rect.y + margin, rect.width - 2 * margin, rect.height - 2 * margin);
};


/* Rhombus */
function bpmRhombus(bounds, fill, stroke, strokewidth)
{
	bpmShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
};

bpmUtils.extend(bpmRhombus, bpmShape);

bpmRhombus.prototype.isRoundable = function()
{
	return true;
};

bpmRhombus.prototype.paintVertexShape = function(c, x, y, w, h)
{
	var hw = w / 2;
	var hh = h / 2;
	
	var arcSize = bpmUtils.getValue(this.style, bpmConstants.STYLE_ARCSIZE, bpmConstants.LINE_ARCSIZE) / 2;
	c.begin();
	this.addPoints(c, [new bpmPoint(x + hw, y), new bpmPoint(x + w, y + hh), new bpmPoint(x + hw, y + h),
	     new bpmPoint(x, y + hh)], this.isRounded, arcSize, true);
	c.fillAndStroke();
};


/* Polyline */
function bpmPolyline(points, stroke, strokewidth)
{
	bpmShape.call(this);
	this.points = points;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
};

bpmUtils.extend(bpmPolyline, bpmShape);

bpmPolyline.prototype.getRotation = function()
{
	return 0;
};

bpmPolyline.prototype.getShapeRotation = function()
{
	return 0;
};

bpmPolyline.prototype.isPaintBoundsInverted = function()
{
	return false;
};

bpmPolyline.prototype.paintEdgeShape = function(c, pts)
{
	var prev = c.pointerEventsValue;
	c.pointerEventsValue = 'stroke';
	
	if (this.style == null || this.style[bpmConstants.STYLE_CURVED] != 1)
	{
		this.paintLine(c, pts, this.isRounded);
	}
	else
	{
		this.paintCurvedLine(c, pts);
	}
	
	c.pointerEventsValue = prev;
};

bpmPolyline.prototype.paintLine = function(c, pts, rounded)
{
	var arcSize = bpmUtils.getValue(this.style, bpmConstants.STYLE_ARCSIZE, bpmConstants.LINE_ARCSIZE) / 2;
	c.begin();
	this.addPoints(c, pts, rounded, arcSize, false);
	c.stroke();
};

bpmPolyline.prototype.paintCurvedLine = function(c, pts)
{
	c.begin();
	
	var pt = pts[0];
	var n = pts.length;
	
	c.moveTo(pt.x, pt.y);
	
	for (var i = 1; i < n - 2; i++)
	{
		var p0 = pts[i];
		var p1 = pts[i + 1];
		var ix = (p0.x + p1.x) / 2;
		var iy = (p0.y + p1.y) / 2;
		
		c.quadTo(p0.x, p0.y, ix, iy);
	}
	
	var p0 = pts[n - 2];
	var p1 = pts[n - 1];
	
	c.quadTo(p0.x, p0.y, p1.x, p1.y);
	c.stroke();
};


/* Arrow */
function bpmArrow(points, fill, stroke, strokewidth, arrowWidth, spacing, endSize)
{
	bpmShape.call(this);
	this.points = points;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
	this.arrowWidth = (arrowWidth != null) ? arrowWidth : bpmConstants.ARROW_WIDTH;
	this.spacing = (spacing != null) ? spacing : bpmConstants.ARROW_SPACING;
	this.endSize = (endSize != null) ? endSize : bpmConstants.ARROW_SIZE;
};

bpmUtils.extend(bpmArrow, bpmShape);

bpmArrow.prototype.augmentBoundingBox = function(bbox)
{
	bpmShape.prototype.augmentBoundingBox.apply(this, arguments);
	
	var w = Math.max(this.arrowWidth, this.endSize);
	bbox.grow((w / 2 + this.strokewidth) * this.scale);
};


bpmArrow.prototype.paintEdgeShape = function(c, pts)
{
	var spacing =  bpmConstants.ARROW_SPACING;
	var width = bpmConstants.ARROW_WIDTH;
	var arrow = bpmConstants.ARROW_SIZE;

	var p0 = pts[0];
	var pe = pts[pts.length - 1];
	var dx = pe.x - p0.x;
	var dy = pe.y - p0.y;
	var dist = Math.sqrt(dx * dx + dy * dy);
	var length = dist - 2 * spacing - arrow;
	
	var nx = dx / dist;
	var ny = dy / dist;
	var basex = length * nx;
	var basey = length * ny;
	var floorx = width * ny/3;
	var floory = -width * nx/3;
	
	var p0x = p0.x - floorx / 2 + spacing * nx;
	var p0y = p0.y - floory / 2 + spacing * ny;
	var p1x = p0x + floorx;
	var p1y = p0y + floory;
	var p2x = p1x + basex;
	var p2y = p1y + basey;
	var p3x = p2x + floorx;
	var p3y = p2y + floory;
	
	var p5x = p3x - 3 * floorx;
	var p5y = p3y - 3 * floory;
	
	c.begin();
	c.moveTo(p0x, p0y);
	c.lineTo(p1x, p1y);
	c.lineTo(p2x, p2y);
	c.lineTo(p3x, p3y);
	c.lineTo(pe.x - spacing * nx, pe.y - spacing * ny);
	c.lineTo(p5x, p5y);
	c.lineTo(p5x + floorx, p5y + floory);
	c.close();

	c.fillAndStroke();
};


/* Arrow Connector */
function bpmArrowConnector(points, fill, stroke, strokewidth, arrowWidth, spacing, endSize)
{
	bpmShape.call(this);
	this.points = points;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
	this.arrowWidth = (arrowWidth != null) ? arrowWidth : bpmConstants.ARROW_WIDTH;
	this.arrowSpacing = (spacing != null) ? spacing : bpmConstants.ARROW_SPACING;
	this.startSize = bpmConstants.ARROW_SIZE / 5;
	this.endSize = bpmConstants.ARROW_SIZE / 5;
};

bpmUtils.extend(bpmArrowConnector, bpmShape);

bpmArrowConnector.prototype.useSvgBoundingBox = true;

bpmArrowConnector.prototype.resetStyles = function()
{
	bpmShape.prototype.resetStyles.apply(this, arguments);
	
	this.arrowSpacing = bpmConstants.ARROW_SPACING;
};

bpmArrowConnector.prototype.apply = function(state)
{
	bpmShape.prototype.apply.apply(this, arguments);

	if (this.style != null)
	{
		this.startSize = bpmUtils.getNumber(this.style, bpmConstants.STYLE_STARTSIZE, bpmConstants.ARROW_SIZE / 5) * 3;
		this.endSize = bpmUtils.getNumber(this.style, bpmConstants.STYLE_ENDSIZE, bpmConstants.ARROW_SIZE / 5) * 3;
	}
};

bpmArrowConnector.prototype.augmentBoundingBox = function(bbox)
{
	bpmShape.prototype.augmentBoundingBox.apply(this, arguments);
	
	var w = this.getEdgeWidth();
	
	if (this.isMarkerStart())
	{
		w = Math.max(w, this.getStartArrowWidth());
	}
	
	if (this.isMarkerEnd())
	{
		w = Math.max(w, this.getEndArrowWidth());
	}
	
	bbox.grow((w / 2 + this.strokewidth) * this.scale);
};

bpmArrowConnector.prototype.paintEdgeShape = function(c, pts)
{
	var strokeWidth = this.strokewidth;
	
	if (this.outline)
	{
		strokeWidth = Math.max(1, bpmUtils.getNumber(this.style, bpmConstants.STYLE_STROKEWIDTH, this.strokewidth));
	}
	
	var startWidth = this.getStartArrowWidth() + strokeWidth;
	var endWidth = this.getEndArrowWidth() + strokeWidth;
	var edgeWidth = this.outline ? this.getEdgeWidth() + strokeWidth : this.getEdgeWidth();
	var openEnded = this.isOpenEnded();
	var markerStart = this.isMarkerStart();
	var markerEnd = this.isMarkerEnd();
	var spacing = (openEnded) ? 0 : this.arrowSpacing + strokeWidth / 2;
	var startSize = this.startSize + strokeWidth;
	var endSize = this.endSize + strokeWidth;
	var isRounded = this.isArrowRounded();
	
	var pe = pts[pts.length - 1];

	var i0 = 1;
	
	while (i0 < pts.length - 1 && pts[i0].x == pts[0].x && pts[i0].y == pts[0].y)
	{
		i0++;
	}
	
	var dx = pts[i0].x - pts[0].x;
	var dy = pts[i0].y - pts[0].y;
	var dist = Math.sqrt(dx * dx + dy * dy);
	
	if (dist == 0)
	{
		return;
	}
	
	var nx = dx / dist;
	var nx2, nx1 = nx;
	var ny = dy / dist;
	var ny2, ny1 = ny;
	var orthx = edgeWidth * ny;
	var orthy = -edgeWidth * nx;
	
	var fns = [];
	
	if (isRounded)
	{
		c.setLineJoin('round');
	}
	else if (pts.length > 2)
	{
		c.setMiterLimit(1.42);
	}

	c.begin();

	var startNx = nx;
	var startNy = ny;

	if (markerStart && !openEnded)
	{
		this.paintMarker(c, pts[0].x, pts[0].y, nx, ny, startSize, startWidth, edgeWidth, spacing, true);
	}
	else
	{
		var outStartX = pts[0].x + orthx / 2 + spacing * nx;
		var outStartY = pts[0].y + orthy / 2 + spacing * ny;
		var inEndX = pts[0].x - orthx / 2 + spacing * nx;
		var inEndY = pts[0].y - orthy / 2 + spacing * ny;
		
		if (openEnded)
		{
			c.moveTo(outStartX, outStartY);
			
			fns.push(function()
			{
				c.lineTo(inEndX, inEndY);
			});
		}
		else
		{
			c.moveTo(inEndX, inEndY);
			c.lineTo(outStartX, outStartY);
		}
	}
	
	var dx1 = 0;
	var dy1 = 0;
	var dist1 = 0;

	for (var i = 0; i < pts.length - 2; i++)
	{
		var pos = bpmUtils.relativeCcw(pts[i].x, pts[i].y, pts[i+1].x, pts[i+1].y, pts[i+2].x, pts[i+2].y);

		dx1 = pts[i+2].x - pts[i+1].x;
		dy1 = pts[i+2].y - pts[i+1].y;

		dist1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
		
		if (dist1 != 0)
		{
			nx1 = dx1 / dist1;
			ny1 = dy1 / dist1;
			
			var tmp1 = nx * nx1 + ny * ny1;
			tmp = Math.max(Math.sqrt((tmp1 + 1) / 2), 0.04);
			
			nx2 = (nx + nx1);
			ny2 = (ny + ny1);
	
			var dist2 = Math.sqrt(nx2 * nx2 + ny2 * ny2);
			
			if (dist2 != 0)
			{
				nx2 = nx2 / dist2;
				ny2 = ny2 / dist2;
				
				var strokeWidthFactor = Math.max(tmp, Math.min(this.strokewidth / 200 + 0.04, 0.35));
				var angleFactor = (pos != 0 && isRounded) ? Math.max(0.1, strokeWidthFactor) : Math.max(tmp, 0.06);

				var outX = pts[i+1].x + ny2 * edgeWidth / 2 / angleFactor;
				var outY = pts[i+1].y - nx2 * edgeWidth / 2 / angleFactor;
				var inX = pts[i+1].x - ny2 * edgeWidth / 2 / angleFactor;
				var inY = pts[i+1].y + nx2 * edgeWidth / 2 / angleFactor;
				
				if (pos == 0 || !isRounded)
				{
					c.lineTo(outX, outY);
					
					(function(x, y)
					{
						fns.push(function()
						{
							c.lineTo(x, y);
						});
					})(inX, inY);
				}
				else if (pos == -1)
				{
					var c1x = inX + ny * edgeWidth;
					var c1y = inY - nx * edgeWidth;
					var c2x = inX + ny1 * edgeWidth;
					var c2y = inY - nx1 * edgeWidth;
					c.lineTo(c1x, c1y);
					c.quadTo(outX, outY, c2x, c2y);
					
					(function(x, y)
					{
						fns.push(function()
						{
							c.lineTo(x, y);
						});
					})(inX, inY);
				}
				else
				{
					c.lineTo(outX, outY);
					
					(function(x, y)
					{
						var c1x = outX - ny * edgeWidth;
						var c1y = outY + nx * edgeWidth;
						var c2x = outX - ny1 * edgeWidth;
						var c2y = outY + nx1 * edgeWidth;
						
						fns.push(function()
						{
							c.quadTo(x, y, c1x, c1y);
						});
						fns.push(function()
						{
							c.lineTo(c2x, c2y);
						});
					})(inX, inY);
				}
				
				nx = nx1;
				ny = ny1;
			}
		}
	}
	
	orthx = edgeWidth * ny1;
	orthy = - edgeWidth * nx1;

	if (markerEnd && !openEnded)
	{
		this.paintMarker(c, pe.x, pe.y, -nx, -ny, endSize, endWidth, edgeWidth, spacing, false);
	}
	else
	{
		c.lineTo(pe.x - spacing * nx1 + orthx / 2, pe.y - spacing * ny1 + orthy / 2);
		
		var inStartX = pe.x - spacing * nx1 - orthx / 2;
		var inStartY = pe.y - spacing * ny1 - orthy / 2;

		if (!openEnded)
		{
			c.lineTo(inStartX, inStartY);
		}
		else
		{
			c.moveTo(inStartX, inStartY);
			
			fns.splice(0, 0, function()
			{
				c.moveTo(inStartX, inStartY);
			});
		}
	}
	
	for (var i = fns.length - 1; i >= 0; i--)
	{
		fns[i]();
	}

	if (openEnded)
	{
		c.end();
		c.stroke();
	}
	else
	{
		c.close();
		c.fillAndStroke();
	}
	
	c.setShadow(false);
	
	c.setMiterLimit(4);
	
	if (isRounded)
	{
		c.setLineJoin('flat');
	}

	if (pts.length > 2)
	{
		c.setMiterLimit(4);
		if (markerStart && !openEnded)
		{
			c.begin();
			this.paintMarker(c, pts[0].x, pts[0].y, startNx, startNy, startSize, startWidth, edgeWidth, spacing, true);
			c.stroke();
			c.end();
		}
		
		if (markerEnd && !openEnded)
		{
			c.begin();
			this.paintMarker(c, pe.x, pe.y, -nx, -ny, endSize, endWidth, edgeWidth, spacing, true);
			c.stroke();
			c.end();
		}
	}
};

bpmArrowConnector.prototype.paintMarker = function(c, ptX, ptY, nx, ny, size, arrowWidth, edgeWidth, spacing, initialMove)
{
	var widthArrowRatio = edgeWidth / arrowWidth;
	var orthx = edgeWidth * ny / 2;
	var orthy = -edgeWidth * nx / 2;

	var spaceX = (spacing + size) * nx;
	var spaceY = (spacing + size) * ny;

	if (initialMove)
	{
		c.moveTo(ptX - orthx + spaceX, ptY - orthy + spaceY);
	}
	else
	{
		c.lineTo(ptX - orthx + spaceX, ptY - orthy + spaceY);
	}

	c.lineTo(ptX - orthx / widthArrowRatio + spaceX, ptY - orthy / widthArrowRatio + spaceY);
	c.lineTo(ptX + spacing * nx, ptY + spacing * ny);
	c.lineTo(ptX + orthx / widthArrowRatio + spaceX, ptY + orthy / widthArrowRatio + spaceY);
	c.lineTo(ptX + orthx + spaceX, ptY + orthy + spaceY);
}

bpmArrowConnector.prototype.isArrowRounded = function()
{
	return this.isRounded;
};

bpmArrowConnector.prototype.getStartArrowWidth = function()
{
	return bpmConstants.ARROW_WIDTH;
};

bpmArrowConnector.prototype.getEndArrowWidth = function()
{
	return bpmConstants.ARROW_WIDTH;
};

bpmArrowConnector.prototype.getEdgeWidth = function()
{
	return bpmConstants.ARROW_WIDTH / 3;
};

bpmArrowConnector.prototype.isOpenEnded = function()
{
	return false;
};

bpmArrowConnector.prototype.isMarkerStart = function()
{
	return (bpmUtils.getValue(this.style, bpmConstants.STYLE_STARTARROW, bpmConstants.NONE) != bpmConstants.NONE);
};

bpmArrowConnector.prototype.isMarkerEnd = function()
{
	return (bpmUtils.getValue(this.style, bpmConstants.STYLE_ENDARROW, bpmConstants.NONE) != bpmConstants.NONE);
};


/* Text */
function bpmText(value, bounds, align, valign, color,
	family,	size, fontStyle, spacing, spacingTop, spacingRight,
	spacingBottom, spacingLeft, horizontal, background, border,
	wrap, clipped, overflow, labelPadding, textDirection)
{
	bpmShape.call(this);
	this.value = value;
	this.bounds = bounds;
	this.color = (color != null) ? color : 'black';
	this.align = (align != null) ? align : bpmConstants.ALIGN_CENTER;
	this.valign = (valign != null) ? valign : bpmConstants.ALIGN_MIDDLE;
	this.family = (family != null) ? family : bpmConstants.DEFAULT_FONTFAMILY;
	this.size = (size != null) ? size : bpmConstants.DEFAULT_FONTSIZE;
	this.fontStyle = (fontStyle != null) ? fontStyle : bpmConstants.DEFAULT_FONTSTYLE;
	this.spacing = parseInt(spacing || 2);
	this.spacingTop = this.spacing + parseInt(spacingTop || 0);
	this.spacingRight = this.spacing + parseInt(spacingRight || 0);
	this.spacingBottom = this.spacing + parseInt(spacingBottom || 0);
	this.spacingLeft = this.spacing + parseInt(spacingLeft || 0);
	this.horizontal = (horizontal != null) ? horizontal : true;
	this.background = background;
	this.border = border;
	this.wrap = (wrap != null) ? wrap : false;
	this.clipped = (clipped != null) ? clipped : false;
	this.overflow = (overflow != null) ? overflow : 'visible';
	this.labelPadding = (labelPadding != null) ? labelPadding : 0;
	this.textDirection = textDirection;
	this.rotation = 0;
	this.updateMargin();
};

bpmUtils.extend(bpmText, bpmShape);

bpmText.prototype.baseSpacingTop = 0;
bpmText.prototype.baseSpacingBottom = 0;
bpmText.prototype.baseSpacingLeft = 0;
bpmText.prototype.baseSpacingRight = 0;
bpmText.prototype.replaceLinefeeds = true;
bpmText.prototype.verticalTextRotation = -90;
bpmText.prototype.ignoreClippedStringSize = true;
bpmText.prototype.ignoreStringSize = false;
bpmText.prototype.textWidthPadding = (document.documentMode == 8 && !bpmCore.IS_EM) ? 4 : 3;
bpmText.prototype.lastValue = null;
bpmText.prototype.cacheEnabled = true;

bpmText.prototype.isParseVml = function()
{
	return false;
};

bpmText.prototype.isHtmlAllowed = function()
{
	return document.documentMode != 8 || bpmCore.IS_EM;
};

bpmText.prototype.getSvgScreenOffset = function()
{
	return 0;
};

bpmText.prototype.checkBounds = function()
{
	return (!isNaN(this.scale) && isFinite(this.scale) && this.scale > 0 &&
			this.bounds != null && !isNaN(this.bounds.x) && !isNaN(this.bounds.y) &&
			!isNaN(this.bounds.width) && !isNaN(this.bounds.height));
};

bpmText.prototype.paint = function(c, update)
{
	var s = this.scale;
	var x = this.bounds.x / s;
	var y = this.bounds.y / s;
	var w = this.bounds.width / s;
	var h = this.bounds.height / s;
	
	this.updateTransform(c, x, y, w, h);
	this.configureCanvas(c, x, y, w, h);

	var unscaledWidth = (this.state != null) ? this.state.unscaledWidth : null;

	if (update)
	{
		if (this.node.firstChild != null && (unscaledWidth == null ||
			this.lastUnscaledWidth != unscaledWidth))
		{
			c.invalidateCachedOffsetSize(this.node);
		}

		c.updateText(x, y, w, h, this.align, this.valign, this.wrap, this.overflow,
				this.clipped, this.getTextRotation(), this.node);
	}
	else
	{
		var realHtml = bpmUtils.isNode(this.value) || this.dialect == bpmConstants.DIALECT_STRICTHTML;
		
		var fmt = (realHtml || c instanceof bpmVmlCanvas2D) ? 'html' : '';
		var val = this.value;
		
		if (!realHtml && fmt == 'html')
		{
			val =  bpmUtils.htmlEntities(val, false);
		}
		
		if (fmt == 'html' && !bpmUtils.isNode(this.value))
		{
			val = bpmUtils.replaceTrailingNewlines(val, '<div><br></div>');			
		}
		
		val = (!bpmUtils.isNode(this.value) && this.replaceLinefeeds && fmt == 'html') ?
			val.replace(/\n/g, '<br/>') : val;
			
		var dir = this.textDirection;
	
		if (dir == bpmConstants.TEXT_DIRECTION_AUTO && !realHtml)
		{
			dir = this.getAutoDirection();
		}
		
		if (dir != bpmConstants.TEXT_DIRECTION_LTR && dir != bpmConstants.TEXT_DIRECTION_RTL)
		{
			dir = null;
		}
	
		c.text(x, y, w, h, val, this.align, this.valign, this.wrap, fmt, this.overflow,
			this.clipped, this.getTextRotation(), dir);
	}
	
	this.lastUnscaledWidth = unscaledWidth;
};

bpmText.prototype.redraw = function()
{
	if (this.visible && this.checkBounds() && this.cacheEnabled && this.lastValue == this.value &&
		(bpmUtils.isNode(this.value) || this.dialect == bpmConstants.DIALECT_STRICTHTML))
	{
		if (this.node.nodeName == 'DIV' && (this.isHtmlAllowed() || !bpmCore.IS_VML))
		{
			this.updateSize(this.node, (this.state == null || this.state.view.textDiv == null));

			if (bpmCore.IS_IE && (document.documentMode == null || document.documentMode <= 8))
			{
				this.updateHtmlFilter();
			}
			else
			{
				this.updateHtmlTransform();
			}
			
			this.updateBoundingBox();
		}
		else
		{
			var canvas = this.createCanvas();

			if (canvas != null && canvas.updateText != null &&
				canvas.invalidateCachedOffsetSize != null)
			{
				this.paint(canvas, true);
				this.destroyCanvas(canvas);
				this.updateBoundingBox();
			}
			else
			{
				bpmShape.prototype.redraw.apply(this, arguments);
			}
		}
	}
	else
	{
		bpmShape.prototype.redraw.apply(this, arguments);
		
		if (bpmUtils.isNode(this.value) || this.dialect == bpmConstants.DIALECT_STRICTHTML)
		{
			this.lastValue = this.value;
		}
		else
		{
			this.lastValue = null;
		}
	}
};

bpmText.prototype.resetStyles = function()
{
	bpmShape.prototype.resetStyles.apply(this, arguments);
	
	this.color = 'black';
	this.align = bpmConstants.ALIGN_CENTER;
	this.valign = bpmConstants.ALIGN_MIDDLE;
	this.family = bpmConstants.DEFAULT_FONTFAMILY;
	this.size = bpmConstants.DEFAULT_FONTSIZE;
	this.fontStyle = bpmConstants.DEFAULT_FONTSTYLE;
	this.spacing = 2;
	this.spacingTop = 2;
	this.spacingRight = 2;
	this.spacingBottom = 2;
	this.spacingLeft = 2;
	this.horizontal = true;
	delete this.background;
	delete this.border;
	this.textDirection = bpmConstants.DEFAULT_TEXT_DIRECTION;
	delete this.margin;
};

bpmText.prototype.apply = function(state)
{
	var old = this.spacing;
	bpmShape.prototype.apply.apply(this, arguments);
	
	if (this.style != null)
	{
		this.fontStyle = bpmUtils.getValue(this.style, bpmConstants.STYLE_FONTSTYLE, this.fontStyle);
		this.family = bpmUtils.getValue(this.style, bpmConstants.STYLE_FONTFAMILY, this.family);
		this.size = bpmUtils.getValue(this.style, bpmConstants.STYLE_FONTSIZE, this.size);
		this.color = bpmUtils.getValue(this.style, bpmConstants.STYLE_FONTCOLOR, this.color);
		this.align = bpmUtils.getValue(this.style, bpmConstants.STYLE_ALIGN, this.align);
		this.valign = bpmUtils.getValue(this.style, bpmConstants.STYLE_VERTICAL_ALIGN, this.valign);
		this.spacing = parseInt(bpmUtils.getValue(this.style, bpmConstants.STYLE_SPACING, this.spacing));
		this.spacingTop = parseInt(bpmUtils.getValue(this.style, bpmConstants.STYLE_SPACING_TOP, this.spacingTop - old)) + this.spacing;
		this.spacingRight = parseInt(bpmUtils.getValue(this.style, bpmConstants.STYLE_SPACING_RIGHT, this.spacingRight - old)) + this.spacing;
		this.spacingBottom = parseInt(bpmUtils.getValue(this.style, bpmConstants.STYLE_SPACING_BOTTOM, this.spacingBottom - old)) + this.spacing;
		this.spacingLeft = parseInt(bpmUtils.getValue(this.style, bpmConstants.STYLE_SPACING_LEFT, this.spacingLeft - old)) + this.spacing;
		this.horizontal = bpmUtils.getValue(this.style, bpmConstants.STYLE_HORIZONTAL, this.horizontal);
		this.background = bpmUtils.getValue(this.style, bpmConstants.STYLE_LABEL_BACKGROUNDCOLOR, this.background);
		this.border = bpmUtils.getValue(this.style, bpmConstants.STYLE_LABEL_BORDERCOLOR, this.border);
		this.textDirection = bpmUtils.getValue(this.style, bpmConstants.STYLE_TEXT_DIRECTION, bpmConstants.DEFAULT_TEXT_DIRECTION);
		this.opacity = bpmUtils.getValue(this.style, bpmConstants.STYLE_TEXT_OPACITY, 100);
		this.updateMargin();
	}
	
	this.flipV = null;
	this.flipH = null;
};

bpmText.prototype.getAutoDirection = function()
{
	var tmp = /[A-Za-z\u05d0-\u065f\u066a-\u06ef\u06fa-\u07ff\ufb1d-\ufdff\ufe70-\ufefc]/.exec(this.value);
	
	return (tmp != null && tmp.length > 0 && tmp[0] > 'z') ?
		bpmConstants.TEXT_DIRECTION_RTL : bpmConstants.TEXT_DIRECTION_LTR;
};

bpmText.prototype.updateBoundingBox = function()
{
	var node = this.node;
	this.boundingBox = this.bounds.clone();
	var rot = this.getTextRotation();
	
	var h = (this.style != null) ? bpmUtils.getValue(this.style, bpmConstants.STYLE_LABEL_POSITION, bpmConstants.ALIGN_CENTER) : null;
	var v = (this.style != null) ? bpmUtils.getValue(this.style, bpmConstants.STYLE_VERTICAL_LABEL_POSITION, bpmConstants.ALIGN_MIDDLE) : null;

	if (!this.ignoreStringSize && node != null && this.overflow != 'fill' && (!this.clipped ||
		!this.ignoreClippedStringSize || h != bpmConstants.ALIGN_CENTER || v != bpmConstants.ALIGN_MIDDLE))
	{
		var ow = null;
		var oh = null;
		
		if (node.ownerSVGElement != null)
		{
			if (node.firstChild != null && node.firstChild.firstChild != null &&
				node.firstChild.firstChild.nodeName == 'foreignObject')
			{
				node = node.firstChild.firstChild;
				ow = parseInt(node.getAttribute('width')) * this.scale;
				oh = parseInt(node.getAttribute('height')) * this.scale;
			}
			else
			{
				try
				{
					var b = node.getBBox();
					
					if (typeof(this.value) == 'string' && bpmUtils.trim(this.value) == 0)
					{
						this.boundingBox = null;
					}
					else if (b.width == 0 && b.height == 0)
					{
						this.boundingBox = null;
					}
					else
					{
						this.boundingBox = new bpmRectangle(b.x, b.y, b.width, b.height);
					}
					
					return;
				}
				catch (e)
				{

				}
			}
		}
		else
		{
			var td = (this.state != null) ? this.state.view.textDiv : null;

			if (this.offsetWidth != null && this.offsetHeight != null)
			{
				ow = this.offsetWidth * this.scale;
				oh = this.offsetHeight * this.scale;
			}
			else
			{
				if (td != null)
				{
					this.updateFont(td);
					this.updateSize(td, false);
					this.updateInnerHtml(td);

					node = td;
				}
				
				var sizeDiv = node;

				if (document.documentMode == 8 && !bpmCore.IS_EM)
				{
					var w = Math.round(this.bounds.width / this.scale);
	
					if (this.wrap && w > 0)
					{
						node.style.wordWrap = bpmConstants.WORD_WRAP;
						node.style.whiteSpace = 'normal';

						if (node.style.wordWrap != 'break-word')
						{
							var divs = sizeDiv.getElementsByTagName('div');
							
							if (divs.length > 0)
							{
								sizeDiv = divs[divs.length - 1];
							}
							
							ow = sizeDiv.offsetWidth + 2;
							divs = this.node.getElementsByTagName('div');
							
							if (this.clipped)
							{
								ow = Math.min(w, ow);
							}
							
							if (divs.length > 1)
							{
								divs[divs.length - 2].style.width = ow + 'px';
							}
						}
					}
					else
					{
						node.style.whiteSpace = 'nowrap';
					}
				}
				else if (sizeDiv.firstChild != null && sizeDiv.firstChild.nodeName == 'DIV')
				{
					sizeDiv = sizeDiv.firstChild;
				}

				this.offsetWidth = sizeDiv.offsetWidth + this.textWidthPadding;
				this.offsetHeight = sizeDiv.offsetHeight;
				
				ow = this.offsetWidth * this.scale;
				oh = this.offsetHeight * this.scale;
			}
		}

		if (ow != null && oh != null)
		{	
			this.boundingBox = new bpmRectangle(this.bounds.x,
				this.bounds.y, ow, oh);
		}
	}

	if (this.boundingBox != null)
	{
		if (rot != 0)
		{
			var bbox = bpmUtils.getBoundingBox(new bpmRectangle(
				this.margin.x * this.boundingBox.width,
				this.margin.y * this.boundingBox.height,
				this.boundingBox.width, this.boundingBox.height),
				rot, new bpmPoint(0, 0));
			
			this.unrotatedBoundingBox = bpmRectangle.fromRectangle(this.boundingBox);
			this.unrotatedBoundingBox.x += this.margin.x * this.unrotatedBoundingBox.width;
			this.unrotatedBoundingBox.y += this.margin.y * this.unrotatedBoundingBox.height;
			
			this.boundingBox.x += bbox.x;
			this.boundingBox.y += bbox.y;
			this.boundingBox.width = bbox.width;
			this.boundingBox.height = bbox.height;
		}
		else
		{
			this.boundingBox.x += this.margin.x * this.boundingBox.width;
			this.boundingBox.y += this.margin.y * this.boundingBox.height;
			this.unrotatedBoundingBox = null;
		}
	}
};

bpmText.prototype.getShapeRotation = function()
{
	return 0;
};

bpmText.prototype.getTextRotation = function()
{
	return (this.state != null && this.state.shape != null) ? this.state.shape.getTextRotation() : 0;
};

bpmText.prototype.isPaintBoundsInverted = function()
{
	return !this.horizontal && this.state != null && this.state.view.graph.model.isVertex(this.state.cell);
};

bpmText.prototype.configureCanvas = function(c, x, y, w, h)
{
	bpmShape.prototype.configureCanvas.apply(this, arguments);
	
	c.setFontColor(this.color);
	c.setFontBackgroundColor(this.background);
	c.setFontBorderColor(this.border);
	c.setFontFamily(this.family);
	c.setFontSize(this.size);
	c.setFontStyle(this.fontStyle);
};

bpmText.prototype.updateVmlContainer = function()
{
	this.node.style.left = Math.round(this.bounds.x) + 'px';
	this.node.style.top = Math.round(this.bounds.y) + 'px';
	this.node.style.width = '1px';
	this.node.style.height = '1px';
	this.node.style.overflow = 'visible';
};

bpmText.prototype.redrawHtmlShape = function()
{
	var style = this.node.style;

	style.whiteSpace = 'normal';
	style.overflow = '';
	style.width = '';
	style.height = '';
	
	this.updateValue();
	this.updateFont(this.node);
	this.updateSize(this.node, (this.state == null || this.state.view.textDiv == null));
	
	this.offsetWidth = null;
	this.offsetHeight = null;

	if (bpmCore.IS_IE && (document.documentMode == null || document.documentMode <= 8))
	{
		this.updateHtmlFilter();
	}
	else
	{
		this.updateHtmlTransform();
	}
};

bpmText.prototype.updateHtmlTransform = function()
{
	var theta = this.getTextRotation();
	var style = this.node.style;
	var dx = this.margin.x;
	var dy = this.margin.y;
	
	if (theta != 0)
	{
		bpmUtils.setPrefixedStyle(style, 'transformOrigin', (-dx * 100) + '%' + ' ' + (-dy * 100) + '%');
		bpmUtils.setPrefixedStyle(style, 'transform', 'translate(' + (dx * 100) + '%' + ',' + (dy * 100) + '%)' +
			'scale(' + this.scale + ') rotate(' + theta + 'deg)');
	}
	else
	{
		bpmUtils.setPrefixedStyle(style, 'transformOrigin', '0% 0%');
		bpmUtils.setPrefixedStyle(style, 'transform', 'scale(' + this.scale + ')' +
			'translate(' + (dx * 100) + '%' + ',' + (dy * 100) + '%)');
	}

	style.left = Math.round(this.bounds.x - Math.ceil(dx * ((this.overflow != 'fill' &&
		this.overflow != 'width') ? 3 : 1))) + 'px';
	style.top = Math.round(this.bounds.y - dy * ((this.overflow != 'fill') ? 3 : 1)) + 'px';
	
	if (this.opacity < 100)
	{
		style.opacity = this.opacity / 100;
	}
	else
	{
		style.opacity = '';
	}
};

bpmText.prototype.updateInnerHtml = function(elt)
{
	if (bpmUtils.isNode(this.value))
	{
		elt.innerHTML = this.value.outerHTML;
	}
	else
	{
		var val = this.value;
		
		if (this.dialect != bpmConstants.DIALECT_STRICTHTML)
		{
			val = bpmUtils.htmlEntities(val, false);
		}
		
		val = bpmUtils.replaceTrailingNewlines(val, '<div>&nbsp;</div>');
		val = (this.replaceLinefeeds) ? val.replace(/\n/g, '<br/>') : val;
		val = '<div style="display:inline-block;_display:inline;">' + val + '</div>';
		
		elt.innerHTML = val;
	}
};

bpmText.prototype.updateHtmlFilter = function()
{
	var style = this.node.style;
	var dx = this.margin.x;
	var dy = this.margin.y;
	var s = this.scale;
	
	bpmUtils.setOpacity(this.node, this.opacity);
	
	var ow = 0;
	var oh = 0;
	var td = (this.state != null) ? this.state.view.textDiv : null;
	var sizeDiv = this.node;
	
	if (td != null)
	{
		td.style.overflow = '';
		td.style.height = '';
		td.style.width = '';
		
		this.updateFont(td);
		this.updateSize(td, false);
		this.updateInnerHtml(td);
		
		var w = Math.round(this.bounds.width / this.scale);

		if (this.wrap && w > 0)
		{
			td.style.whiteSpace = 'normal';
			td.style.wordWrap = bpmConstants.WORD_WRAP;
			ow = w;
			
			if (this.clipped)
			{
				ow = Math.min(ow, this.bounds.width);
			}

			td.style.width = ow + 'px';
		}
		else
		{
			td.style.whiteSpace = 'nowrap';
		}
		
		sizeDiv = td;
		
		if (sizeDiv.firstChild != null && sizeDiv.firstChild.nodeName == 'DIV')
		{
			sizeDiv = sizeDiv.firstChild;
			
			if (this.wrap && td.style.wordWrap == 'break-word')
			{
				sizeDiv.style.width = '100%';
			}
		}

		if (!this.clipped && this.wrap && w > 0)
		{
			ow = sizeDiv.offsetWidth + this.textWidthPadding;
			td.style.width = ow + 'px';
		}
		
		oh = sizeDiv.offsetHeight + 2;
		
		if (bpmCore.IS_QUIRKS && this.border != null && this.border != bpmConstants.NONE)
		{
			oh += 3;
		}
	}
	else if (sizeDiv.firstChild != null && sizeDiv.firstChild.nodeName == 'DIV')
	{
		sizeDiv = sizeDiv.firstChild;
		oh = sizeDiv.offsetHeight;
	}

	ow = sizeDiv.offsetWidth + this.textWidthPadding;
	
	if (this.clipped)
	{
		oh = Math.min(oh, this.bounds.height);
	}

	var w = this.bounds.width / s;
	var h = this.bounds.height / s;

	if (this.overflow == 'fill')
	{
		oh = h;
		ow = w;
	}
	else if (this.overflow == 'width')
	{
		oh = sizeDiv.scrollHeight;
		ow = w;
	}
	
	this.offsetWidth = ow;
	this.offsetHeight = oh;
	
	if (bpmCore.IS_QUIRKS && (this.clipped || (this.overflow == 'width' && h > 0)))
	{
		h = Math.min(h, oh);
		style.height = Math.round(h) + 'px';
	}
	else
	{
		h = oh;
	}

	if (this.overflow != 'fill' && this.overflow != 'width')
	{
		if (this.clipped)
		{
			ow = Math.min(w, ow);
		}
		
		w = ow;

		if ((bpmCore.IS_QUIRKS && this.clipped) || this.wrap)
		{
			style.width = Math.round(w) + 'px';
		}
	}

	h *= s;
	w *= s;
	
	var rad = this.getTextRotation() * (Math.PI / 180);
	
	var real_cos = parseFloat(parseFloat(Math.cos(rad)).toFixed(8));
	var real_sin = parseFloat(parseFloat(Math.sin(-rad)).toFixed(8));

	rad %= 2 * Math.PI;
	
	if (rad < 0)
	{
		rad += 2 * Math.PI;
	}
	
	rad %= Math.PI;
	
	if (rad > Math.PI / 2)
	{
		rad = Math.PI - rad;
	}
	
	var cos = Math.cos(rad);
	var sin = Math.sin(-rad);

	var tx = w * -(dx + 0.5);
	var ty = h * -(dy + 0.5);

	var top_fix = (h - h * cos + w * sin) / 2 + real_sin * tx - real_cos * ty;
	var left_fix = (w - w * cos + h * sin) / 2 - real_cos * tx - real_sin * ty;
	
	if (rad != 0)
	{
		var f = 'progid:DXImageTransform.Microsoft.Matrix(M11=' + real_cos + ', M12='+
			real_sin + ', M21=' + (-real_sin) + ', M22=' + real_cos + ', sizingMethod=\'auto expand\')';
		
		if (style.filter != null && style.filter.length > 0)
		{
			style.filter += ' ' + f;
		}
		else
		{
			style.filter = f;
		}
	}
	
	var dy = 0;
	
	if (this.overflow != 'fill' && bpmCore.IS_QUIRKS)
	{
		if (this.valign == bpmConstants.ALIGN_TOP)
		{
			dy -= 1;
		}
		else if (this.valign == bpmConstants.ALIGN_BOTTOM)
		{
			dy += 2;
		}
		else
		{
			dy += 1;
		}
	}

	style.zoom = s;
	style.left = Math.round(this.bounds.x + left_fix - w / 2) + 'px';
	style.top = Math.round(this.bounds.y + top_fix - h / 2 + dy) + 'px';
};

bpmText.prototype.updateValue = function()
{
	if (bpmUtils.isNode(this.value))
	{
		this.node.innerHTML = '';
		this.node.appendChild(this.value);
	}
	else
	{
		var val = this.value;
		
		if (this.dialect != bpmConstants.DIALECT_STRICTHTML)
		{
			val = bpmUtils.htmlEntities(val, false);
		}
		
		val = bpmUtils.replaceTrailingNewlines(val, '<div><br></div>');
		val = (this.replaceLinefeeds) ? val.replace(/\n/g, '<br/>') : val;
		var bg = (this.background != null && this.background != bpmConstants.NONE) ? this.background : null;
		var bd = (this.border != null && this.border != bpmConstants.NONE) ? this.border : null;

		if (this.overflow == 'fill' || this.overflow == 'width')
		{
			if (bg != null)
			{
				this.node.style.backgroundColor = bg;
			}
			
			if (bd != null)
			{
				this.node.style.border = '1px solid ' + bd;
			}
		}
		else
		{
			var css = '';
			
			if (bg != null)
			{
				css += 'background-color:' + bpmUtils.htmlEntities(bg) + ';';
			}
			
			if (bd != null)
			{
				css += 'border:1px solid ' + bpmUtils.htmlEntities(bd) + ';';
			}
			
			var lh = (bpmConstants.ABSOLUTE_LINE_HEIGHT) ? (this.size * bpmConstants.LINE_HEIGHT) + 'px' :
				bpmConstants.LINE_HEIGHT;
			val = '<div style="zoom:1;' + css + 'display:inline-block;_display:inline;text-decoration:inherit;' +
				'padding-bottom:1px;padding-right:1px;line-height:' + lh + '">' + val + '</div>';
		}

		this.node.innerHTML = val;
		
		var divs = this.node.getElementsByTagName('div');
		
		if (divs.length > 0)
		{
			var dir = this.textDirection;

			if (dir == bpmConstants.TEXT_DIRECTION_AUTO && this.dialect != bpmConstants.DIALECT_STRICTHTML)
			{
				dir = this.getAutoDirection();
			}
			
			if (dir == bpmConstants.TEXT_DIRECTION_LTR || dir == bpmConstants.TEXT_DIRECTION_RTL)
			{
				divs[divs.length - 1].setAttribute('dir', dir);
			}
			else
			{
				divs[divs.length - 1].removeAttribute('dir');
			}
		}
	}
};

bpmText.prototype.updateFont = function(node)
{
	var style = node.style;
	
	style.lineHeight = (bpmConstants.ABSOLUTE_LINE_HEIGHT) ? (this.size * bpmConstants.LINE_HEIGHT) + 'px' : bpmConstants.LINE_HEIGHT;
	style.fontSize = this.size + 'px';
	style.fontFamily = this.family;
	style.verticalAlign = 'top';
	style.color = this.color;
	
	if ((this.fontStyle & bpmConstants.FONT_BOLD) == bpmConstants.FONT_BOLD)
	{
		style.fontWeight = 'bold';
	}
	else
	{
		style.fontWeight = '';
	}

	if ((this.fontStyle & bpmConstants.FONT_ITALIC) == bpmConstants.FONT_ITALIC)
	{
		style.fontStyle = 'italic';
	}
	else
	{
		style.fontStyle = '';
	}
	
	if ((this.fontStyle & bpmConstants.FONT_UNDERLINE) == bpmConstants.FONT_UNDERLINE)
	{
		style.textDecoration = 'underline';
	}
	else
	{
		style.textDecoration = '';
	}
	
	if (this.align == bpmConstants.ALIGN_CENTER)
	{
		style.textAlign = 'center';
	}
	else if (this.align == bpmConstants.ALIGN_RIGHT)
	{
		style.textAlign = 'right';
	}
	else
	{
		style.textAlign = 'left';
	}
};

bpmText.prototype.updateSize = function(node, enableWrap)
{
	var w = Math.max(0, Math.round(this.bounds.width / this.scale));
	var h = Math.max(0, Math.round(this.bounds.height / this.scale));
	var style = node.style;
	
	if (this.clipped)
	{
		style.overflow = 'hidden';
		
		if (!bpmCore.IS_QUIRKS)
		{
			style.maxHeight = h + 'px';
			style.maxWidth = w + 'px';
		}
		else
		{
			style.width = w + 'px';
		}
	}
	else if (this.overflow == 'fill')
	{
		style.width = (w + 1) + 'px';
		style.height = (h + 1) + 'px';
		style.overflow = 'hidden';
	}
	else if (this.overflow == 'width')
	{
		style.width = (w + 1) + 'px';
		style.maxHeight = (h + 1) + 'px';
		style.overflow = 'hidden';
	}
	
	if (this.wrap && w > 0)
	{
		style.wordWrap = bpmConstants.WORD_WRAP;
		style.whiteSpace = 'normal';
		style.width = w + 'px';

		if (enableWrap && this.overflow != 'fill' && this.overflow != 'width')
		{
			var sizeDiv = node;
			
			if (sizeDiv.firstChild != null && sizeDiv.firstChild.nodeName == 'DIV')
			{
				sizeDiv = sizeDiv.firstChild;
				
				if (node.style.wordWrap == 'break-word')
				{
					sizeDiv.style.width = '100%';
				}
			}
			
			var tmp = sizeDiv.offsetWidth;
			
			if (tmp == 0)
			{
				var prev = node.parentNode;
				node.style.visibility = 'hidden';
				document.body.appendChild(node);
				tmp = sizeDiv.offsetWidth;
				node.style.visibility = '';
				prev.appendChild(node);
			}

			tmp += 3;
			
			if (this.clipped)
			{
				tmp = Math.min(tmp, w);
			}
			
			style.width = tmp + 'px';
		}
	}
	else
	{
		style.whiteSpace = 'nowrap';
	}
};

bpmText.prototype.updateMargin = function()
{
	this.margin = bpmUtils.getAlignmentAsPoint(this.align, this.valign);
};

bpmText.prototype.getSpacing = function()
{
	var dx = 0;
	var dy = 0;

	if (this.align == bpmConstants.ALIGN_CENTER)
	{
		dx = (this.spacingLeft - this.spacingRight) / 2;
	}
	else if (this.align == bpmConstants.ALIGN_RIGHT)
	{
		dx = -this.spacingRight - this.baseSpacingRight;
	}
	else
	{
		dx = this.spacingLeft + this.baseSpacingLeft;
	}

	if (this.valign == bpmConstants.ALIGN_MIDDLE)
	{
		dy = (this.spacingTop - this.spacingBottom) / 2;
	}
	else if (this.valign == bpmConstants.ALIGN_BOTTOM)
	{
		dy = -this.spacingBottom - this.baseSpacingBottom;;
	}
	else
	{
		dy = this.spacingTop + this.baseSpacingTop;
	}
	
	return new bpmPoint(dx, dy);
};


/* Triangle */
function bpmTriangle()
{
	bpmActor.call(this);
};

bpmUtils.extend(bpmTriangle, bpmActor);

bpmTriangle.prototype.isRoundable = function()
{
	return true;
};

bpmTriangle.prototype.redrawPath = function(c, x, y, w, h)
{
	var arcSize = bpmUtils.getValue(this.style, bpmConstants.STYLE_ARCSIZE, bpmConstants.LINE_ARCSIZE) / 2;
	this.addPoints(c, [new bpmPoint(0, 0), new bpmPoint(w, 0.5 * h), new bpmPoint(0, h)], this.isRounded, arcSize, true);
};


/* Hexagon */
function bpmHexagon()
{
	bpmActor.call(this);
};

bpmUtils.extend(bpmHexagon, bpmActor);

bpmHexagon.prototype.redrawPath = function(c, x, y, w, h)
{
	var arcSize = bpmUtils.getValue(this.style, bpmConstants.STYLE_ARCSIZE, bpmConstants.LINE_ARCSIZE) / 2;
	this.addPoints(c, [new bpmPoint(0.25 * w, 0), new bpmPoint(0.75 * w, 0), new bpmPoint(w, 0.5 * h), new bpmPoint(0.75 * w, h),
	                   new bpmPoint(0.25 * w, h), new bpmPoint(0, 0.5 * h)], this.isRounded, arcSize, true);
};


/* Line */
function bpmLine(bounds, stroke, strokewidth)
{
	bpmShape.call(this);
	this.bounds = bounds;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
};

bpmUtils.extend(bpmLine, bpmShape);

bpmLine.prototype.paintVertexShape = function(c, x, y, w, h)
{
	var mid = y + h / 2;

	c.begin();
	c.moveTo(x, mid);
	c.lineTo(x + w, mid);
	c.stroke();
};


/* Image Shape */
function bpmImageShape(bounds, image, fill, stroke, strokewidth)
{
	bpmShape.call(this);
	this.bounds = bounds;
	this.image = image;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
	this.shadow = false;
};

bpmUtils.extend(bpmImageShape, bpmRectangleShape);

bpmImageShape.prototype.preserveImageAspect = true;

bpmImageShape.prototype.getSvgScreenOffset = function()
{
	return 0;
};

bpmImageShape.prototype.apply = function(state)
{
	bpmShape.prototype.apply.apply(this, arguments);
	
	this.fill = null;
	this.stroke = null;
	this.gradient = null;
	
	if (this.style != null)
	{
		this.preserveImageAspect = bpmUtils.getNumber(this.style, bpmConstants.STYLE_IMAGE_ASPECT, 1) == 1;
		
		this.flipH = this.flipH || bpmUtils.getValue(this.style, 'imageFlipH', 0) == 1;
		this.flipV = this.flipV || bpmUtils.getValue(this.style, 'imageFlipV', 0) == 1;
	}
};

bpmImageShape.prototype.isHtmlAllowed = function()
{
	return !this.preserveImageAspect;
};

bpmImageShape.prototype.createHtml = function()
{
	var node = document.createElement('div');
	node.style.position = 'absolute';

	return node;
};

bpmImageShape.prototype.isRoundable = function(c, x, y, w, h)
{
	return false;
};

bpmImageShape.prototype.paintVertexShape = function(c, x, y, w, h)
{
	if (this.image != null)
	{
		var fill = bpmUtils.getValue(this.style, bpmConstants.STYLE_IMAGE_BACKGROUND, null);
		var stroke = bpmUtils.getValue(this.style, bpmConstants.STYLE_IMAGE_BORDER, null);
		
		if (fill != null)
		{
			c.setFillColor(fill);
			c.setStrokeColor(stroke);
			c.rect(x, y, w, h);
			c.fillAndStroke();
		}

		c.image(x, y, w, h, this.image, this.preserveImageAspect, false, false);
		
		var stroke = bpmUtils.getValue(this.style, bpmConstants.STYLE_IMAGE_BORDER, null);
		
		if (stroke != null)
		{
			c.setShadow(false);
			c.setStrokeColor(stroke);
			c.rect(x, y, w, h);
			c.stroke();
		}
	}
	else
	{
		bpmRectangleShape.prototype.paintBackground.apply(this, arguments);
	}
};

bpmImageShape.prototype.redrawHtmlShape = function()
{
	this.node.style.left = Math.round(this.bounds.x) + 'px';
	this.node.style.top = Math.round(this.bounds.y) + 'px';
	this.node.style.width = Math.max(0, Math.round(this.bounds.width)) + 'px';
	this.node.style.height = Math.max(0, Math.round(this.bounds.height)) + 'px';
	this.node.innerHTML = '';

	if (this.image != null)
	{
		var fill = bpmUtils.getValue(this.style, bpmConstants.STYLE_IMAGE_BACKGROUND, '');
		var stroke = bpmUtils.getValue(this.style, bpmConstants.STYLE_IMAGE_BORDER, '');
		this.node.style.backgroundColor = fill;
		this.node.style.borderColor = stroke;
		
		var useVml = bpmCore.IS_IE6 || ((document.documentMode == null || document.documentMode <= 8) && this.rotation != 0);
		var img = document.createElement((useVml) ? bpmCore.VML_PREFIX + ':image' : 'img');
		img.setAttribute('border', '0');
		img.style.position = 'absolute';
		img.src = this.image;

		var filter = (this.opacity < 100) ? 'alpha(opacity=' + this.opacity + ')' : '';
		this.node.style.filter = filter;
		
		if (this.flipH && this.flipV)
		{
			filter += 'progid:DXImageTransform.Microsoft.BasicImage(rotation=2)';
		}
		else if (this.flipH)
		{
			filter += 'progid:DXImageTransform.Microsoft.BasicImage(mirror=1)';
		}
		else if (this.flipV)
		{
			filter += 'progid:DXImageTransform.Microsoft.BasicImage(rotation=2, mirror=1)';
		}

		if (img.style.filter != filter)
		{
			img.style.filter = filter;
		}

		if (img.nodeName == 'image')
		{
			img.style.rotation = this.rotation;
		}
		else if (this.rotation != 0)
		{
			bpmUtils.setPrefixedStyle(img.style, 'transform', 'rotate(' + this.rotation + 'deg)');
		}
		else
		{
			bpmUtils.setPrefixedStyle(img.style, 'transform', '');
		}

		img.style.width = this.node.style.width;
		img.style.height = this.node.style.height;
		
		this.node.style.backgroundImage = '';
		this.node.appendChild(img);
	}
	else
	{
		this.setTransparentBackgroundImage(this.node);
	}
};


/* Label */
function bpmLabel(bounds, fill, stroke, strokewidth)
{
	bpmRectangleShape.call(this, bounds, fill, stroke, strokewidth);
};

bpmUtils.extend(bpmLabel, bpmRectangleShape);

bpmLabel.prototype.imageSize = bpmConstants.DEFAULT_IMAGESIZE;
bpmLabel.prototype.spacing = 2;
bpmLabel.prototype.indicatorSize = 10;
bpmLabel.prototype.indicatorSpacing = 2;

bpmLabel.prototype.init = function(container)
{
	bpmShape.prototype.init.apply(this, arguments);

	if (this.indicatorShape != null)
	{
		this.indicator = new this.indicatorShape();
		this.indicator.dialect = this.dialect;
		this.indicator.init(this.node);
	}
};

bpmLabel.prototype.redraw = function()
{
	if (this.indicator != null)
	{
		this.indicator.fill = this.indicatorColor;
		this.indicator.stroke = this.indicatorStrokeColor;
		this.indicator.gradient = this.indicatorGradientColor;
		this.indicator.direction = this.indicatorDirection;
	}
	
	bpmShape.prototype.redraw.apply(this, arguments);
};

bpmLabel.prototype.isHtmlAllowed = function()
{
	return bpmRectangleShape.prototype.isHtmlAllowed.apply(this, arguments) &&
		this.indicatorColor == null && this.indicatorShape == null;
};

bpmLabel.prototype.paintForeground = function(c, x, y, w, h)
{
	this.paintImage(c, x, y, w, h);
	this.paintIndicator(c, x, y, w, h);
	
	bpmRectangleShape.prototype.paintForeground.apply(this, arguments);
};

bpmLabel.prototype.paintImage = function(c, x, y, w, h)
{
	if (this.image != null)
	{
		var bounds = this.getImageBounds(x, y, w, h);
		c.image(bounds.x, bounds.y, bounds.width, bounds.height, this.image, false, false, false);
	}
};

bpmLabel.prototype.getImageBounds = function(x, y, w, h)
{
	var align = bpmUtils.getValue(this.style, bpmConstants.STYLE_IMAGE_ALIGN, bpmConstants.ALIGN_LEFT);
	var valign = bpmUtils.getValue(this.style, bpmConstants.STYLE_IMAGE_VERTICAL_ALIGN, bpmConstants.ALIGN_MIDDLE);
	var width = bpmUtils.getNumber(this.style, bpmConstants.STYLE_IMAGE_WIDTH, bpmConstants.DEFAULT_IMAGESIZE);
	var height = bpmUtils.getNumber(this.style, bpmConstants.STYLE_IMAGE_HEIGHT, bpmConstants.DEFAULT_IMAGESIZE);
	var spacing = bpmUtils.getNumber(this.style, bpmConstants.STYLE_SPACING, this.spacing) + 5;

	if (align == bpmConstants.ALIGN_CENTER)
	{
		x += (w - width) / 2;
	}
	else if (align == bpmConstants.ALIGN_RIGHT)
	{
		x += w - width - spacing;
	}
	else 
	{
		x += spacing;
	}

	if (valign == bpmConstants.ALIGN_TOP)
	{
		y += spacing;
	}
	else if (valign == bpmConstants.ALIGN_BOTTOM)
	{
		y += h - height - spacing;
	}
	else 
	{
		y += (h - height) / 2;
	}
	
	return new bpmRectangle(x, y, width, height);
};

bpmLabel.prototype.paintIndicator = function(c, x, y, w, h)
{
	if (this.indicator != null)
	{
		this.indicator.bounds = this.getIndicatorBounds(x, y, w, h);
		this.indicator.paint(c);
	}
	else if (this.indicatorImage != null)
	{
		var bounds = this.getIndicatorBounds(x, y, w, h);
		c.image(bounds.x, bounds.y, bounds.width, bounds.height, this.indicatorImage, false, false, false);
	}
};

bpmLabel.prototype.getIndicatorBounds = function(x, y, w, h)
{
	var align = bpmUtils.getValue(this.style, bpmConstants.STYLE_IMAGE_ALIGN, bpmConstants.ALIGN_LEFT);
	var valign = bpmUtils.getValue(this.style, bpmConstants.STYLE_IMAGE_VERTICAL_ALIGN, bpmConstants.ALIGN_MIDDLE);
	var width = bpmUtils.getNumber(this.style, bpmConstants.STYLE_INDICATOR_WIDTH, this.indicatorSize);
	var height = bpmUtils.getNumber(this.style, bpmConstants.STYLE_INDICATOR_HEIGHT, this.indicatorSize);
	var spacing = this.spacing + 5;		
	
	if (align == bpmConstants.ALIGN_RIGHT)
	{
		x += w - width - spacing;
	}
	else if (align == bpmConstants.ALIGN_CENTER)
	{
		x += (w - width) / 2;
	}
	else 
	{
		x += spacing;
	}
	
	if (valign == bpmConstants.ALIGN_BOTTOM)
	{
		y += h - height - spacing;
	}
	else if (valign == bpmConstants.ALIGN_TOP)
	{
		y += spacing;
	}
	else 
	{
		y += (h - height) / 2;
	}
	
	return new bpmRectangle(x, y, width, height);
};

bpmLabel.prototype.redrawHtmlShape = function()
{
	bpmRectangleShape.prototype.redrawHtmlShape.apply(this, arguments);
	
	while(this.node.hasChildNodes())
	{
		this.node.removeChild(this.node.lastChild);
	}
	
	if (this.image != null)
	{
		var node = document.createElement('img');
		node.style.position = 'relative';
		node.setAttribute('border', '0');
		
		var bounds = this.getImageBounds(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
		bounds.x -= this.bounds.x;
		bounds.y -= this.bounds.y;

		node.style.left = Math.round(bounds.x) + 'px';
		node.style.top = Math.round(bounds.y) + 'px';
		node.style.width = Math.round(bounds.width) + 'px';
		node.style.height = Math.round(bounds.height) + 'px';
		
		node.src = this.image;
		
		this.node.appendChild(node);
	}
};


/* Cylinder */
function bpmCylinder(bounds, fill, stroke, strokewidth)
{
	bpmShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
};

bpmUtils.extend(bpmCylinder, bpmShape);

bpmCylinder.prototype.maxHeight = 40;
bpmCylinder.prototype.svgStrokeTolerance = 0;

bpmCylinder.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.translate(x, y);
	c.begin();
	this.redrawPath(c, x, y, w, h, false);
	c.fillAndStroke();
	
	if (!this.outline || this.style == null || bpmUtils.getValue(
		this.style, bpmConstants.STYLE_BACKGROUND_OUTLINE, 0) == 0)
	{
		c.setShadow(false);
		c.begin();
		this.redrawPath(c, x, y, w, h, true);
		c.stroke();
	}
};

bpmCylinder.prototype.getCylinderSize = function(x, y, w, h)
{
	return Math.min(this.maxHeight, Math.round(h / 5));
};

bpmCylinder.prototype.redrawPath = function(c, x, y, w, h, isForeground)
{
	var dy = this.getCylinderSize(x, y, w, h);
	
	if ((isForeground && this.fill != null) || (!isForeground && this.fill == null))
	{
		c.moveTo(0, dy);
		c.curveTo(0, 2 * dy, w, 2 * dy, w, dy);
		
		if (!isForeground)
		{
			c.stroke();
			c.begin();
		}
	}
	
	if (!isForeground)
	{
		c.moveTo(0, dy);
		c.curveTo(0, -dy / 3, w, -dy / 3, w, dy);
		c.lineTo(w, h - dy);
		c.curveTo(w, h + dy / 3, 0, h + dy / 3, 0, h - dy);
		c.close();
	}
};


/* Connector */
function bpmConnector(points, stroke, strokewidth)
{
	bpmPolyline.call(this, points, stroke, strokewidth);
};

bpmUtils.extend(bpmConnector, bpmPolyline);

bpmConnector.prototype.updateBoundingBox = function()
{
	this.useSvgBoundingBox = this.style != null && this.style[bpmConstants.STYLE_CURVED] == 1;
	bpmShape.prototype.updateBoundingBox.apply(this, arguments);
};

bpmConnector.prototype.paintEdgeShape = function(c, pts)
{
	var sourceMarker = this.createMarker(c, pts, true);
	var targetMarker = this.createMarker(c, pts, false);

	bpmPolyline.prototype.paintEdgeShape.apply(this, arguments);
	
	// Disables shadows, dashed styles and fixes fill color for markers
	c.setFillColor(this.stroke);
	c.setShadow(false);
	c.setDashed(false);
	
	if (sourceMarker != null)
	{
		sourceMarker();
	}
	
	if (targetMarker != null)
	{
		targetMarker();
	}
};

bpmConnector.prototype.createMarker = function(c, pts, source)
{
	var result = null;
	var n = pts.length;
	var type = bpmUtils.getValue(this.style, (source) ? bpmConstants.STYLE_STARTARROW : bpmConstants.STYLE_ENDARROW);
	var p0 = (source) ? pts[1] : pts[n - 2];
	var pe = (source) ? pts[0] : pts[n - 1];
	
	if (type != null && p0 != null && pe != null)
	{
		var count = 1;
		
		while (count < n - 1 && Math.round(p0.x - pe.x) == 0 && Math.round(p0.y - pe.y) == 0)
		{
			p0 = (source) ? pts[1 + count] : pts[n - 2 - count];
			count++;
		}
	
		var dx = pe.x - p0.x;
		var dy = pe.y - p0.y;
	
		var dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
		
		var unitX = dx / dist;
		var unitY = dy / dist;
	
		var size = bpmUtils.getNumber(this.style, (source) ? bpmConstants.STYLE_STARTSIZE : bpmConstants.STYLE_ENDSIZE, bpmConstants.DEFAULT_MARKERSIZE);
		
		var filled = this.style[(source) ? bpmConstants.STYLE_STARTFILL : bpmConstants.STYLE_ENDFILL] != 0;
		
		result = bpmMarker.createMarker(c, this, type, pe, unitX, unitY, size, source, this.strokewidth, filled);
	}
	
	return result;
};

bpmConnector.prototype.augmentBoundingBox = function(bbox)
{
	bpmShape.prototype.augmentBoundingBox.apply(this, arguments);
	
	var size = 0;
	
	if (bpmUtils.getValue(this.style, bpmConstants.STYLE_STARTARROW, bpmConstants.NONE) != bpmConstants.NONE)
	{
		size = bpmUtils.getNumber(this.style, bpmConstants.STYLE_STARTSIZE, bpmConstants.DEFAULT_MARKERSIZE) + 1;
	}
	
	if (bpmUtils.getValue(this.style, bpmConstants.STYLE_ENDARROW, bpmConstants.NONE) != bpmConstants.NONE)
	{
		size = Math.max(size, bpmUtils.getNumber(this.style, bpmConstants.STYLE_ENDSIZE, bpmConstants.DEFAULT_MARKERSIZE)) + 1;
	}
	
	bbox.grow(size * this.scale);
};


/* Swimlane */
function bpmSwimlane(bounds, fill, stroke, strokewidth)
{
	bpmShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
};

bpmUtils.extend(bpmSwimlane, bpmShape);
bpmSwimlane.prototype.imageSize = 16;

bpmSwimlane.prototype.isRoundable = function(c, x, y, w, h)
{
	return true;
};

bpmSwimlane.prototype.getTitleSize = function()
{
	return Math.max(0, bpmUtils.getValue(this.style, bpmConstants.STYLE_STARTSIZE, bpmConstants.DEFAULT_STARTSIZE));
};

bpmSwimlane.prototype.getLabelBounds = function(rect)
{
	var start = this.getTitleSize();
	var bounds = new bpmRectangle(rect.x, rect.y, rect.width, rect.height);
	var horizontal = this.isHorizontal();
	
	var flipH = bpmUtils.getValue(this.style, bpmConstants.STYLE_FLIPH, 0) == 1;
	var flipV = bpmUtils.getValue(this.style, bpmConstants.STYLE_FLIPV, 0) == 1;	
	
	var shapeVertical = (this.direction == bpmConstants.DIRECTION_NORTH ||
			this.direction == bpmConstants.DIRECTION_SOUTH);
	var realHorizontal = horizontal == !shapeVertical;
	
	var realFlipH = !realHorizontal && flipH != (this.direction == bpmConstants.DIRECTION_SOUTH ||
			this.direction == bpmConstants.DIRECTION_WEST);
	var realFlipV = realHorizontal && flipV != (this.direction == bpmConstants.DIRECTION_SOUTH ||
			this.direction == bpmConstants.DIRECTION_WEST);

	if (!shapeVertical)
	{
		var tmp = Math.min(bounds.height, start * this.scale);

		if (realFlipH || realFlipV)
		{
			bounds.y += bounds.height - tmp;
		}

		bounds.height = tmp;
	}
	else
	{
		var tmp = Math.min(bounds.width, start * this.scale);
		
		if (realFlipH || realFlipV)
		{
			bounds.x += bounds.width - tmp;	
		}

		bounds.width = tmp;
	}
	
	return bounds;
};

bpmSwimlane.prototype.getGradientBounds = function(c, x, y, w, h)
{
	var start = this.getTitleSize();
	
	if (this.isHorizontal())
	{
		start = Math.min(start, h);
		return new bpmRectangle(x, y, w, start);
	}
	else
	{
		start = Math.min(start, w);
		return new bpmRectangle(x, y, start, h);
	}
};

bpmSwimlane.prototype.getArcSize = function(w, h, start)
{
	var f = bpmUtils.getValue(this.style, bpmConstants.STYLE_ARCSIZE, bpmConstants.RECTANGLE_ROUNDING_FACTOR * 100) / 100;

	return start * f * 3; 
};

bpmSwimlane.prototype.isHorizontal = function()
{
	return bpmUtils.getValue(this.style, bpmConstants.STYLE_HORIZONTAL, 1) == 1;
};

bpmSwimlane.prototype.paintVertexShape = function(c, x, y, w, h)
{
	var start = this.getTitleSize();
	var fill = bpmUtils.getValue(this.style, bpmConstants.STYLE_SWIMLANE_FILLCOLOR, bpmConstants.NONE);
	var swimlaneLine = bpmUtils.getValue(this.style, bpmConstants.STYLE_SWIMLANE_LINE, 1) == 1;
	var r = 0;
	
	if (this.isHorizontal())
	{
		start = Math.min(start, h);
	}
	else
	{
		start = Math.min(start, w);
	}
	
	c.translate(x, y);
	
	if (!this.isRounded)
	{
		this.paintSwimlane(c, x, y, w, h, start, fill, swimlaneLine);
	}
	else
	{
		r = this.getArcSize(w, h, start);
		r = Math.min(((this.isHorizontal()) ? h : w) - start, Math.min(start, r));
		this.paintRoundedSwimlane(c, x, y, w, h, start, r, fill, swimlaneLine);
	}
	
	var sep = bpmUtils.getValue(this.style, bpmConstants.STYLE_SEPARATORCOLOR, bpmConstants.NONE);
	this.paintSeparator(c, x, y, w, h, start, sep);

	if (this.image != null)
	{
		var bounds = this.getImageBounds(x, y, w, h);
		c.image(bounds.x - x, bounds.y - y, bounds.width, bounds.height,
				this.image, false, false, false);
	}
	
	if (this.glass)
	{
		c.setShadow(false);
		this.paintGlassEffect(c, 0, 0, w, start, r);
	}
};

bpmSwimlane.prototype.paintSwimlane = function(c, x, y, w, h, start, fill, swimlaneLine)
{
	c.begin();
	
	if (this.isHorizontal())
	{
		c.moveTo(0, start);
		c.lineTo(0, 0);
		c.lineTo(w, 0);
		c.lineTo(w, start);
		c.fillAndStroke();

		if (start < h)
		{
			if (fill == bpmConstants.NONE)
			{
				c.pointerEvents = false;
			}
			else
			{
				c.setFillColor(fill);
			}
			
			c.begin();
			c.moveTo(0, start);
			c.lineTo(0, h);
			c.lineTo(w, h);
			c.lineTo(w, start);
			
			if (fill == bpmConstants.NONE)
			{
				c.stroke();
			}
			else
			{
				c.fillAndStroke();
			}
		}
	}
	else
	{
		c.moveTo(start, 0);
		c.lineTo(0, 0);
		c.lineTo(0, h);
		c.lineTo(start, h);
		c.fillAndStroke();
		
		if (start < w)
		{
			if (fill == bpmConstants.NONE)
			{
				c.pointerEvents = false;
			}
			else
			{
				c.setFillColor(fill);
			}
			
			c.begin();
			c.moveTo(start, 0);
			c.lineTo(w, 0);
			c.lineTo(w, h);
			c.lineTo(start, h);
			
			if (fill == bpmConstants.NONE)
			{
				c.stroke();
			}
			else
			{
				c.fillAndStroke();
			}
		}
	}
	
	if (swimlaneLine)
	{
		this.paintDivider(c, x, y, w, h, start, fill == bpmConstants.NONE);
	}
};

bpmSwimlane.prototype.paintRoundedSwimlane = function(c, x, y, w, h, start, r, fill, swimlaneLine)
{
	c.begin();

	if (this.isHorizontal())
	{
		c.moveTo(w, start);
		c.lineTo(w, r);
		c.quadTo(w, 0, w - Math.min(w / 2, r), 0);
		c.lineTo(Math.min(w / 2, r), 0);
		c.quadTo(0, 0, 0, r);
		c.lineTo(0, start);
		c.fillAndStroke();
		
		if (start < h)
		{
			if (fill == bpmConstants.NONE)
			{
				c.pointerEvents = false;
			}
			else
			{
				c.setFillColor(fill);
			}
			
			c.begin();
			c.moveTo(0, start);
			c.lineTo(0, h - r);
			c.quadTo(0, h, Math.min(w / 2, r), h);
			c.lineTo(w - Math.min(w / 2, r), h);
			c.quadTo(w, h, w, h - r);
			c.lineTo(w, start);
			
			if (fill == bpmConstants.NONE)
			{
				c.stroke();
			}
			else
			{
				c.fillAndStroke();
			}
		}
	}
	else
	{
		c.moveTo(start, 0);
		c.lineTo(r, 0);
		c.quadTo(0, 0, 0, Math.min(h / 2, r));
		c.lineTo(0, h - Math.min(h / 2, r));
		c.quadTo(0, h, r, h);
		c.lineTo(start, h);
		c.fillAndStroke();

		if (start < w)
		{
			if (fill == bpmConstants.NONE)
			{
				c.pointerEvents = false;
			}
			else
			{
				c.setFillColor(fill);
			}
			
			c.begin();
			c.moveTo(start, h);
			c.lineTo(w - r, h);
			c.quadTo(w, h, w, h - Math.min(h / 2, r));
			c.lineTo(w, Math.min(h / 2, r));
			c.quadTo(w, 0, w - r, 0);
			c.lineTo(start, 0);
			
			if (fill == bpmConstants.NONE)
			{
				c.stroke();
			}
			else
			{
				c.fillAndStroke();
			}
		}
	}

	if (swimlaneLine)
	{
		this.paintDivider(c, x, y, w, h, start, fill == bpmConstants.NONE);
	}
};

bpmSwimlane.prototype.paintDivider = function(c, x, y, w, h, start, shadow)
{
	if (!shadow)
	{
		c.setShadow(false);
	}

	c.begin();
	
	if (this.isHorizontal())
	{
		c.moveTo(0, start);
		c.lineTo(w, start);
	}
	else
	{
		c.moveTo(start, 0);
		c.lineTo(start, h);
	}

	c.stroke();
};

bpmSwimlane.prototype.paintSeparator = function(c, x, y, w, h, start, color)
{
	if (color != bpmConstants.NONE)
	{
		c.setStrokeColor(color);
		c.setDashed(true);
		c.begin();
		
		if (this.isHorizontal())
		{
			c.moveTo(w, start);
			c.lineTo(w, h);
		}
		else
		{
			c.moveTo(start, 0);
			c.lineTo(w, 0);
		}
		
		c.stroke();
		c.setDashed(false);
	}
};

bpmSwimlane.prototype.getImageBounds = function(x, y, w, h)
{
	if (this.isHorizontal())
	{
		return new bpmRectangle(x + w - this.imageSize, y, this.imageSize, this.imageSize);
	}
	else
	{
		return new bpmRectangle(x, y, this.imageSize, this.imageSize);
	}
};


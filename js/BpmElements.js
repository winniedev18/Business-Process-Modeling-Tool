/**
 * Registers shapes.
 */
(function()
{
	// Cube Shape, supports size style
	function CubeShape()
	{
		bpmCylinder.call(this);
	};
	bpmUtils.extend(CubeShape, bpmCylinder);
	CubeShape.prototype.size = 20;
	CubeShape.prototype.darkOpacity = 0;
	CubeShape.prototype.darkOpacity2 = 0;
	
	CubeShape.prototype.paintVertexShape = function(c, x, y, w, h)
	{
		var s = Math.max(0, Math.min(w, Math.min(h, parseFloat(bpmUtils.getValue(this.style, 'size', this.size)))));
		var op = Math.max(-1, Math.min(1, parseFloat(bpmUtils.getValue(this.style, 'darkOpacity', this.darkOpacity))));
		var op2 = Math.max(-1, Math.min(1, parseFloat(bpmUtils.getValue(this.style, 'darkOpacity2', this.darkOpacity2))));
		c.translate(x, y);
		
		c.begin();
		c.moveTo(0, 0);
		c.lineTo(w - s, 0);
		c.lineTo(w, s);
		c.lineTo(w, h);
		c.lineTo(s, h);
		c.lineTo(0, h - s);
		c.lineTo(0, 0);
		c.close();
		c.end();
		c.fillAndStroke();
		
		if (!this.outline)
		{
			c.setShadow(false);
	
			if (op != 0)
			{
				c.setFillAlpha(Math.abs(op));
				c.setFillColor((op < 0) ? '#FFFFFF' : '#000000');
				c.begin();
				c.moveTo(0, 0);
				c.lineTo(w - s, 0);
				c.lineTo(w, s);
				c.lineTo(s, s);
				c.close();
				c.fill();
			}

			if (op2 != 0)
			{
				c.setFillAlpha(Math.abs(op2));
				c.setFillColor((op2 < 0) ? '#FFFFFF' : '#000000');
				c.begin();
				c.moveTo(0, 0);
				c.lineTo(s, s);
				c.lineTo(s, h);
				c.lineTo(0, h - s);
				c.close();
				c.fill();
			}
			
			c.begin();
			c.moveTo(s, h);
			c.lineTo(s, s);
			c.lineTo(0, 0);
			c.moveTo(s, s);
			c.lineTo(w, s);
			c.end();
			c.stroke();
		}
	};
	CubeShape.prototype.getLabelMargins = function(rect)
	{
		if (bpmUtils.getValue(this.style, 'boundedLbl', false))
		{
			var s = parseFloat(bpmUtils.getValue(this.style, 'size', this.size)) * this.scale;
			
			return new bpmRectangle(s, s, 0, 0);
		}
		
		return null;
	};
	
	bpmCellRenderer.registerShape('cube', CubeShape);
	
	var tan30 = Math.tan(bpmUtils.toRadians(30));
	var tan30Dx = (0.5 - tan30) / 2;
	
	// Cube Shape, supports size style
	function IsoRectangleShape()
	{
		bpmActor.call(this);
	};
	bpmUtils.extend(IsoRectangleShape, bpmActor);
	IsoRectangleShape.prototype.size = 20;
	IsoRectangleShape.prototype.redrawPath = function(path, x, y, w, h)
	{
		var m = Math.min(w, h / tan30);

		path.translate((w - m) / 2, (h - m) / 2 + m / 4);
		path.moveTo(0, 0.25 * m);
		path.lineTo(0.5 * m, m * tan30Dx);
		path.lineTo(m, 0.25 * m);
		path.lineTo(0.5 * m, (0.5 - tan30Dx) * m);
		path.lineTo(0, 0.25 * m);
		path.close();
		path.end();
	};

	bpmCellRenderer.registerShape('isoRectangle', IsoRectangleShape);

	// Cube Shape, supports size style
	function IsoCubeShape()
	{
		bpmCylinder.call(this);
	};
	bpmUtils.extend(IsoCubeShape, bpmCylinder);
	IsoCubeShape.prototype.size = 20;
	IsoCubeShape.prototype.redrawPath = function(path, x, y, w, h, isForeground)
	{
		var m = Math.min(w, h / (0.5 + tan30));

		if (isForeground)
		{
			path.moveTo(0, 0.25 * m);
			path.lineTo(0.5 * m, (0.5 - tan30Dx) * m);
			path.lineTo(m, 0.25 * m);
			path.moveTo(0.5 * m, (0.5 - tan30Dx) * m);
			path.lineTo(0.5 * m, (1 - tan30Dx) * m);
			path.end();
		}
		else
		{
			path.translate((w - m) / 2, (h - m) / 2);
			path.moveTo(0, 0.25 * m);
			path.lineTo(0.5 * m, m * tan30Dx);
			path.lineTo(m, 0.25 * m);
			path.lineTo(m, 0.75 * m);
			path.lineTo(0.5 * m, (1 - tan30Dx) * m);
			path.lineTo(0, 0.75 * m);
			path.close();
			path.end();
		}
	};

	bpmCellRenderer.registerShape('isoCube', IsoCubeShape);
	
	// DataStore Shape, supports size style
	function DataStoreShape()
	{
		bpmCylinder.call(this);
	};
	bpmUtils.extend(DataStoreShape, bpmCylinder);

	DataStoreShape.prototype.redrawPath = function(c, x, y, w, h, isForeground)
	{
		var dy = Math.min(h / 2, Math.round(h / 8) + this.strokewidth - 1);
		
		if ((isForeground && this.fill != null) || (!isForeground && this.fill == null))
		{
			c.moveTo(0, dy);
			c.curveTo(0, 2 * dy, w, 2 * dy, w, dy);
			
			// Needs separate shapes for correct hit-detection
			if (!isForeground)
			{
				c.stroke();
				c.begin();
			}
			
			c.translate(0, dy / 2);
			c.moveTo(0, dy);
			c.curveTo(0, 2 * dy, w, 2 * dy, w, dy);
			
			// Needs separate shapes for correct hit-detection
			if (!isForeground)
			{
				c.stroke();
				c.begin();
			}
			
			c.translate(0, dy / 2);
			c.moveTo(0, dy);
			c.curveTo(0, 2 * dy, w, 2 * dy, w, dy);
			
			// Needs separate shapes for correct hit-detection
			if (!isForeground)
			{
				c.stroke();
				c.begin();
			}
			
			c.translate(0, -dy);
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
	DataStoreShape.prototype.getLabelMargins = function(rect)
	{
		return new bpmRectangle(0, 2.5 * Math.min(rect.height / 2,
			Math.round(rect.height / 8) + this.strokewidth - 1), 0, 0);
	}

	bpmCellRenderer.registerShape('datastore', DataStoreShape);

	// Note Shape, supports size style
	function NoteShape()
	{
		bpmCylinder.call(this);
	};
	bpmUtils.extend(NoteShape, bpmCylinder);
	NoteShape.prototype.size = 30;
	NoteShape.prototype.darkOpacity = 0;
	
	NoteShape.prototype.paintVertexShape = function(c, x, y, w, h)
	{
		var s = Math.max(0, Math.min(w, Math.min(h, parseFloat(bpmUtils.getValue(this.style, 'size', this.size)))));
		var op = Math.max(-1, Math.min(1, parseFloat(bpmUtils.getValue(this.style, 'darkOpacity', this.darkOpacity))));
		c.translate(x, y);
		
		c.begin();
		c.moveTo(0, 0);
		c.lineTo(w - s, 0);
		c.lineTo(w, s);
		c.lineTo(w, h);
		c.lineTo(0, h);
		c.lineTo(0, 0);
		c.close();
		c.end();
		c.fillAndStroke();
		
		if (!this.outline)
		{
			c.setShadow(false);
	
			if (op != 0)
			{
				c.setFillAlpha(Math.abs(op));
				c.setFillColor((op < 0) ? '#FFFFFF' : '#000000');
				c.begin();
				c.moveTo(w - s, 0);
				c.lineTo(w - s, s);
				c.lineTo(w, s);
				c.close();
				c.fill();
			}
			
			c.begin();
			c.moveTo(w - s, 0);
			c.lineTo(w - s, s);
			c.lineTo(w, s);
			c.end();
			c.stroke();
		}
	};

	bpmCellRenderer.registerShape('note', NoteShape);

	// Note Shape, supports size style
	function SwitchShape()
	{
		bpmActor.call(this);
	};
	bpmUtils.extend(SwitchShape, bpmActor);
	SwitchShape.prototype.redrawPath = function(c, x, y, w, h)
	{
		var curve = 0.5;
		c.moveTo(0, 0);
		c.quadTo(w / 2, h * curve,  w, 0);
		c.quadTo(w * (1 - curve), h / 2, w, h);
		c.quadTo(w / 2, h * (1 - curve), 0, h);
		c.quadTo(w * curve, h / 2, 0, 0);
		c.end();
	};

	bpmCellRenderer.registerShape('switch', SwitchShape);

	// Folder Shape, supports tabWidth, tabHeight styles
	function FolderShape()
	{
		bpmCylinder.call(this);
	};
	bpmUtils.extend(FolderShape, bpmCylinder);
	FolderShape.prototype.tabWidth = 60;
	FolderShape.prototype.tabHeight = 20;
	FolderShape.prototype.tabPosition = 'right';
	FolderShape.prototype.redrawPath = function(path, x, y, w, h, isForeground)
	{
		var dx = Math.max(0, Math.min(w, parseFloat(bpmUtils.getValue(this.style, 'tabWidth', this.tabWidth))));
		var dy = Math.max(0, Math.min(h, parseFloat(bpmUtils.getValue(this.style, 'tabHeight', this.tabHeight))));
		var tp = bpmUtils.getValue(this.style, 'tabPosition', this.tabPosition);

		if (isForeground)
		{
			if (tp == 'left')
			{
				path.moveTo(0, dy);
				path.lineTo(dx, dy);
			}
			// Right is default
			else
			{
				path.moveTo(w - dx, dy);
				path.lineTo(w, dy);
			}
			
			path.end();
		}
		else
		{
			if (tp == 'left')
			{
				path.moveTo(0, 0);
				path.lineTo(dx, 0);
				path.lineTo(dx, dy);
				path.lineTo(w, dy);
			}
			// Right is default
			else
			{
				path.moveTo(0, dy);
				path.lineTo(w - dx, dy);
				path.lineTo(w - dx, 0);
				path.lineTo(w, 0);
			}
			
			path.lineTo(w, h);
			path.lineTo(0, h);
			path.lineTo(0, dy);
			path.close();
			path.end();
		}
	};

	bpmCellRenderer.registerShape('folder', FolderShape);

	// Card shape
	function CardShape()
	{
		bpmActor.call(this);
	};
	bpmUtils.extend(CardShape, bpmActor);
	CardShape.prototype.size = 30;
	CardShape.prototype.isRoundable = function()
	{
		return true;
	};
	CardShape.prototype.redrawPath = function(c, x, y, w, h)
	{
		var s = Math.max(0, Math.min(w, Math.min(h, parseFloat(bpmUtils.getValue(this.style, 'size', this.size)))));
		var arcSize = bpmUtils.getValue(this.style, bpmConstants.STYLE_ARCSIZE, bpmConstants.LINE_ARCSIZE) / 2;
		this.addPoints(c, [new bpmPoint(s, 0), new bpmPoint(w, 0), new bpmPoint(w, h), new bpmPoint(0, h), new bpmPoint(0, s)],
				this.isRounded, arcSize, true);
		c.end();
	};

	bpmCellRenderer.registerShape('card', CardShape);

	// Tape shape
	function TapeShape()
	{
		bpmActor.call(this);
	};
	bpmUtils.extend(TapeShape, bpmActor);
	TapeShape.prototype.size = 0.4;
	TapeShape.prototype.redrawPath = function(c, x, y, w, h)
	{
		var dy = h * Math.max(0, Math.min(1, parseFloat(bpmUtils.getValue(this.style, 'size', this.size))));
		var fy = 1.4;
		
		c.moveTo(0, dy / 2);
		c.quadTo(w / 4, dy * fy, w / 2, dy / 2);
		c.quadTo(w * 3 / 4, dy * (1 - fy), w, dy / 2);
		c.lineTo(w, h - dy / 2);
		c.quadTo(w * 3 / 4, h - dy * fy, w / 2, h - dy / 2);
		c.quadTo(w / 4, h - dy * (1 - fy), 0, h - dy / 2);
		c.lineTo(0, dy / 2);
		c.close();
		c.end();
	};
	
	TapeShape.prototype.getLabelBounds = function(rect)
	{
		if (bpmUtils.getValue(this.style, 'boundedLbl', false))
		{
			var size = bpmUtils.getValue(this.style, 'size', this.size);			
			var w = rect.width;
			var h = rect.height;
			
			if (this.direction == null ||
					this.direction == bpmConstants.DIRECTION_EAST ||
					this.direction == bpmConstants.DIRECTION_WEST)
			{
				var dy = h * size;
				
				return new bpmRectangle(rect.x, rect.y + dy, w, h - 2 * dy);
			}
			else
			{
				var dx = w * size;
				
				return new bpmRectangle(rect.x + dx, rect.y, w - 2 * dx, h);
			}
		}
		
		return rect;
	};
	
	bpmCellRenderer.registerShape('tape', TapeShape);

	// Document shape
	function DocumentShape()
	{
		bpmActor.call(this);
	};
	bpmUtils.extend(DocumentShape, bpmActor);
	DocumentShape.prototype.size = 0.3;
	DocumentShape.prototype.getLabelMargins = function(rect)
	{
		if (bpmUtils.getValue(this.style, 'boundedLbl', false))
		{
			return new bpmRectangle(0, 0, 0, parseFloat(bpmUtils.getValue(
				this.style, 'size', this.size)) * rect.height);
		}
		
		return null;
	};
	DocumentShape.prototype.redrawPath = function(c, x, y, w, h)
	{
		var dy = h * Math.max(0, Math.min(1, parseFloat(bpmUtils.getValue(this.style, 'size', this.size))));
		var fy = 1.4;
		
		c.moveTo(0, 0);
		c.lineTo(w, 0);
		c.lineTo(w, h - dy / 2);
		c.quadTo(w * 3 / 4, h - dy * fy, w / 2, h - dy / 2);
		c.quadTo(w / 4, h - dy * (1 - fy), 0, h - dy / 2);
		c.lineTo(0, dy / 2);
		c.close();
		c.end();
	};

	bpmCellRenderer.registerShape('document', DocumentShape);

	var cylinderGetCylinderSize = bpmCylinder.prototype.getCylinderSize;
	
	bpmCylinder.prototype.getCylinderSize = function(x, y, w, h)
	{
		var size = bpmUtils.getValue(this.style, 'size');
		
		if (size != null)
		{
			return h * Math.max(0, Math.min(1, size));
		}
		else
		{
			return cylinderGetCylinderSize.apply(this, arguments);
		}
	};
	
	bpmCylinder.prototype.getLabelMargins = function(rect)
	{
		if (bpmUtils.getValue(this.style, 'boundedLbl', false))
		{
			var size = bpmUtils.getValue(this.style, 'size', 0.15) * 2;
			
			return new bpmRectangle(0, Math.min(this.maxHeight * this.scale, rect.height * size), 0, 0);
		}
		
		return null;
	};

	// Parallelogram shape
	function ParallelogramShape()
	{
		bpmActor.call(this);
	};
	bpmUtils.extend(ParallelogramShape, bpmActor);
	ParallelogramShape.prototype.size = 0.2;
	ParallelogramShape.prototype.isRoundable = function()
	{
		return true;
	};
	ParallelogramShape.prototype.redrawPath = function(c, x, y, w, h)
	{
		var dx = w * Math.max(0, Math.min(1, parseFloat(bpmUtils.getValue(this.style, 'size', this.size))));
		var arcSize = bpmUtils.getValue(this.style, bpmConstants.STYLE_ARCSIZE, bpmConstants.LINE_ARCSIZE) / 2;
		this.addPoints(c, [new bpmPoint(0, h), new bpmPoint(dx, 0), new bpmPoint(w, 0), new bpmPoint(w - dx, h)],
				this.isRounded, arcSize, true);
		c.end();
	};

	bpmCellRenderer.registerShape('parallelogram', ParallelogramShape);

	// Trapezoid shape
	function TrapezoidShape()
	{
		bpmActor.call(this);
	};
	bpmUtils.extend(TrapezoidShape, bpmActor);
	TrapezoidShape.prototype.size = 0.2;
	TrapezoidShape.prototype.isRoundable = function()
	{
		return true;
	};
	TrapezoidShape.prototype.redrawPath = function(c, x, y, w, h)
	{
		var dx = w * Math.max(0, Math.min(0.5, parseFloat(bpmUtils.getValue(this.style, 'size', this.size))));
		var arcSize = bpmUtils.getValue(this.style, bpmConstants.STYLE_ARCSIZE, bpmConstants.LINE_ARCSIZE) / 2;
		this.addPoints(c, [new bpmPoint(0, h), new bpmPoint(dx, 0), new bpmPoint(w - dx, 0), new bpmPoint(w, h)],
				this.isRounded, arcSize, true);
	};

	bpmCellRenderer.registerShape('trapezoid', TrapezoidShape);

	// Curly Bracket shape
	function CurlyBracketShape()
	{
		bpmActor.call(this);
	};
	bpmUtils.extend(CurlyBracketShape, bpmActor);
	CurlyBracketShape.prototype.size = 0.5;
	CurlyBracketShape.prototype.redrawPath = function(c, x, y, w, h)
	{
		c.setFillColor(null);
		var s = w * Math.max(0, Math.min(1, parseFloat(bpmUtils.getValue(this.style, 'size', this.size))));
		var arcSize = bpmUtils.getValue(this.style, bpmConstants.STYLE_ARCSIZE, bpmConstants.LINE_ARCSIZE) / 2;
		this.addPoints(c, [new bpmPoint(w, 0), new bpmPoint(s, 0), new bpmPoint(s, h / 2),
		                   new bpmPoint(0, h / 2), new bpmPoint(s, h / 2), new bpmPoint(s, h),
		                   new bpmPoint(w, h)], this.isRounded, arcSize, false);
		c.end();
	};

	bpmCellRenderer.registerShape('curlyBracket', CurlyBracketShape);

	// Parallel marker shape
	function ParallelMarkerShape()
	{
		bpmActor.call(this);
	};
	bpmUtils.extend(ParallelMarkerShape, bpmActor);
	ParallelMarkerShape.prototype.redrawPath = function(c, x, y, w, h)
	{
		c.setStrokeWidth(1);
		c.setFillColor(this.stroke);
		var w2 = w / 5;
		c.rect(0, 0, w2, h);
		c.fillAndStroke();
		c.rect(2 * w2, 0, w2, h);
		c.fillAndStroke();
		c.rect(4 * w2, 0, w2, h);
		c.fillAndStroke();
	};

	bpmCellRenderer.registerShape('parallelMarker', ParallelMarkerShape);

	/**
	 * Adds handJiggle style (jiggle=n sets jiggle)
	 */
	function HandJiggle(canvas, defaultVariation)
	{
		this.canvas = canvas;
		
		// Avoids "spikes" in the output
		this.canvas.setLineJoin('round');
		this.canvas.setLineCap('round');
		
		this.defaultVariation = defaultVariation;
		
		this.originalLineTo = this.canvas.lineTo;
		this.canvas.lineTo = bpmUtils.bind(this, HandJiggle.prototype.lineTo);
		
		this.originalMoveTo = this.canvas.moveTo;
		this.canvas.moveTo = bpmUtils.bind(this, HandJiggle.prototype.moveTo);
		
		this.originalClose = this.canvas.close;
		this.canvas.close = bpmUtils.bind(this, HandJiggle.prototype.close);
		
		this.originalQuadTo = this.canvas.quadTo;
		this.canvas.quadTo = bpmUtils.bind(this, HandJiggle.prototype.quadTo);
		
		this.originalCurveTo = this.canvas.curveTo;
		this.canvas.curveTo = bpmUtils.bind(this, HandJiggle.prototype.curveTo);
		
		this.originalArcTo = this.canvas.arcTo;
		this.canvas.arcTo = bpmUtils.bind(this, HandJiggle.prototype.arcTo);
	};
	
	HandJiggle.prototype.moveTo = function(endX, endY)
	{
		this.originalMoveTo.apply(this.canvas, arguments);
		this.lastX = endX;
		this.lastY = endY;
		this.firstX = endX;
		this.firstY = endY;
	};
	
	HandJiggle.prototype.close = function()
	{
		if (this.firstX != null && this.firstY != null)
		{
			this.lineTo(this.firstX, this.firstY);
			this.originalClose.apply(this.canvas, arguments);
		}
		
		this.originalClose.apply(this.canvas, arguments);
	};
	
	HandJiggle.prototype.quadTo = function(x1, y1, x2, y2)
	{
		this.originalQuadTo.apply(this.canvas, arguments);
		this.lastX = x2;
		this.lastY = y2;
	};
	
	HandJiggle.prototype.curveTo = function(x1, y1, x2, y2, x3, y3)
	{
		this.originalCurveTo.apply(this.canvas, arguments);
		this.lastX = x3;
		this.lastY = y3;
	};
	
	HandJiggle.prototype.arcTo = function(rx, ry, angle, largeArcFlag, sweepFlag, x, y)
	{
		this.originalArcTo.apply(this.canvas, arguments);
		this.lastX = x;
		this.lastY = y;
	};

	HandJiggle.prototype.lineTo = function(endX, endY)
	{
		// LATER: Check why this.canvas.lastX cannot be used
		if (this.lastX != null && this.lastY != null)
		{
			var dx = Math.abs(endX - this.lastX);
			var dy = Math.abs(endY - this.lastY);
			var dist = Math.sqrt(dx * dx + dy * dy);
			
			if (dist < 2)
			{
				this.originalLineTo.apply(this.canvas, arguments);
				this.lastX = endX;
				this.lastY = endY;
				
				return;
			}
	
			var segs = Math.round(dist / 10);
			var variation = this.defaultVariation;
			
			if (segs < 5)
			{
				segs = 5;
				variation /= 3;
			}
			
			function sign(x)
			{
			    return typeof x === 'number' ? x ? x < 0 ? -1 : 1 : x === x ? 0 : NaN : NaN;
			}
	
			var stepX = sign(endX - this.lastX) * dx / segs;
			var stepY = sign(endY - this.lastY) * dy / segs;
	
			var fx = dx / dist;
			var fy = dy / dist;
	
			for (var s = 0; s < segs; s++)
			{
				var x = stepX * s + this.lastX;
				var y = stepY * s + this.lastY;
	
				var offset = (Math.random() - 0.5) * variation;
				this.originalLineTo.call(this.canvas, x - offset * fy, y - offset * fx);
			}
			
			this.originalLineTo.call(this.canvas, endX, endY);
			this.lastX = endX;
			this.lastY = endY;
		}
		else
		{
			this.originalLineTo.apply(this.canvas, arguments);
			this.lastX = endX;
			this.lastY = endY;
		}
	};
	
	HandJiggle.prototype.destroy = function()
	{
		 this.canvas.lineTo = this.originalLineTo;
		 this.canvas.moveTo = this.originalMoveTo;
		 this.canvas.close = this.originalClose;
		 this.canvas.quadTo = this.originalQuadTo;
		 this.canvas.curveTo = this.originalCurveTo;
		 this.canvas.arcTo = this.originalArcTo;
	};
	
	// Installs hand jiggle in all shapes
	var bpmShapePaint0 = bpmShape.prototype.paint;
	bpmShape.prototype.defaultJiggle = 1.5;
	bpmShape.prototype.paint = function(c)
	{
		// NOTE: getValue does not return a boolean value so !('0') would return true here and below
		if (this.style != null && bpmUtils.getValue(this.style, 'comic', '0') != '0' && c.handHiggle == null)
		{
			c.handJiggle = new HandJiggle(c, bpmUtils.getValue(this.style, 'jiggle', this.defaultJiggle));
		}
		
		bpmShapePaint0.apply(this, arguments);
		
		if (c.handJiggle != null)
		{
			c.handJiggle.destroy();
			delete c.handJiggle;
		}
	};
	
	// Sets default jiggle for diamond
	bpmRhombus.prototype.defaultJiggle = 2;

	/**
	 * Overrides to avoid call to rect
	 */
	var bpmRectangleShapeIsHtmlAllowed0 = bpmRectangleShape.prototype.isHtmlAllowed;
	bpmRectangleShape.prototype.isHtmlAllowed = function()
	{
		return (this.style == null || bpmUtils.getValue(this.style, 'comic', '0') == '0') &&
			bpmRectangleShapeIsHtmlAllowed0.apply(this, arguments);
	};
	
	var bpmRectangleShapePaintBackground0 = bpmRectangleShape.prototype.paintBackground;
	bpmRectangleShape.prototype.paintBackground = function(c, x, y, w, h)
	{
		if (c.handJiggle == null)
		{
			bpmRectangleShapePaintBackground0.apply(this, arguments);
		}
		else
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
				
				c.begin();
				
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
					
					c.moveTo(x + r, y);
					c.lineTo(x + w - r, y);
					c.quadTo(x + w, y, x + w, y + r);
					c.lineTo(x + w, y + h - r);
					c.quadTo(x + w, y + h, x + w - r, y + h);
					c.lineTo(x + r, y + h);
					c.quadTo(x, y + h, x, y + h - r);
					c.lineTo(x, y + r);
					c.quadTo(x, y, x + r, y);
				}
				else
				{
					
					c.moveTo(x, y);
					c.lineTo(x + w, y);
					c.lineTo(x + w, y + h);
					c.lineTo(x, y + h);
					c.lineTo(x, y);
				}
				
				// LATER: Check if close is needed here
				c.close();
				c.end();
				
				c.fillAndStroke();
			}			
		}
	};

	/**
	 * Disables glass effect with hand jiggle.
	 */
	var bpmRectangleShapePaintForeground0 = bpmRectangleShape.prototype.paintForeground;
	bpmRectangleShape.prototype.paintForeground = function(c, x, y, w, h)
	{
		if (c.handJiggle == null)
		{
			bpmRectangleShapePaintForeground0.apply(this, arguments);
		}
	};

	// End of hand jiggle integration
	
	// Process Shape
	function ProcessShape()
	{
		bpmRectangleShape.call(this);
	};
	bpmUtils.extend(ProcessShape, bpmRectangleShape);
	ProcessShape.prototype.size = 0.1;
	ProcessShape.prototype.isHtmlAllowed = function()
	{
		return false;
	};
	ProcessShape.prototype.getLabelBounds = function(rect)
	{
		if (bpmUtils.getValue(this.state.style, bpmConstants.STYLE_HORIZONTAL, true) ==
			(this.direction == null ||
			this.direction == bpmConstants.DIRECTION_EAST ||
			this.direction == bpmConstants.DIRECTION_WEST))
		{
			var w = rect.width;
			var h = rect.height;
			var r = new bpmRectangle(rect.x, rect.y, w, h);
	
			var inset = w * Math.max(0, Math.min(1, parseFloat(bpmUtils.getValue(this.style, 'size', this.size))));
	
			if (this.isRounded)
			{
				var f = bpmUtils.getValue(this.style, bpmConstants.STYLE_ARCSIZE,
					bpmConstants.RECTANGLE_ROUNDING_FACTOR * 100) / 100;
				inset = Math.max(inset, Math.min(w * f, h * f));
			}
			
			r.x += Math.round(inset);
			r.width -= Math.round(2 * inset);
			
			return r;
		}
		
		return rect;
	};
	ProcessShape.prototype.paintForeground = function(c, x, y, w, h)
	{
		var inset = w * Math.max(0, Math.min(1, parseFloat(bpmUtils.getValue(this.style, 'size', this.size))));

		if (this.isRounded)
		{
			var f = bpmUtils.getValue(this.style, bpmConstants.STYLE_ARCSIZE,
				bpmConstants.RECTANGLE_ROUNDING_FACTOR * 100) / 100;
			inset = Math.max(inset, Math.min(w * f, h * f));
		}
		
		// Crisp rendering of inner lines
		inset = Math.round(inset);
		
		c.begin();
		c.moveTo(x + inset, y);
		c.lineTo(x + inset, y + h);
		c.moveTo(x + w - inset, y);
		c.lineTo(x + w - inset, y + h);
		c.end();
		c.stroke();
		bpmRectangleShape.prototype.paintForeground.apply(this, arguments);
	};

	bpmCellRenderer.registerShape('process', ProcessShape);
	
	// Transparent Shape
	function TransparentShape()
	{
		bpmRectangleShape.call(this);
	};
	bpmUtils.extend(TransparentShape, bpmRectangleShape);
	TransparentShape.prototype.paintBackground = function(c, x, y, w, h)
	{
		c.setFillColor(bpmConstants.NONE);
		c.rect(x, y, w, h);
		c.fill();
	};
	TransparentShape.prototype.paintForeground = function(c, x, y, w, h) 	{ };

	bpmCellRenderer.registerShape('transparent', TransparentShape);

	// Callout shape
	function CalloutShape()
	{
		bpmActor.call(this);
	};
	bpmUtils.extend(CalloutShape, bpmHexagon);
	CalloutShape.prototype.size = 30;
	CalloutShape.prototype.position = 0.5;
	CalloutShape.prototype.position2 = 0.5;
	CalloutShape.prototype.base = 20;
	CalloutShape.prototype.getLabelMargins = function()
	{
		return new bpmRectangle(0, 0, 0, parseFloat(bpmUtils.getValue(
			this.style, 'size', this.size)) * this.scale);
	};
	CalloutShape.prototype.isRoundable = function()
	{
		return true;
	};
	CalloutShape.prototype.redrawPath = function(c, x, y, w, h)
	{
		var arcSize = bpmUtils.getValue(this.style, bpmConstants.STYLE_ARCSIZE, bpmConstants.LINE_ARCSIZE) / 2;
		var s = Math.max(0, Math.min(h, parseFloat(bpmUtils.getValue(this.style, 'size', this.size))));
		var dx = w * Math.max(0, Math.min(1, parseFloat(bpmUtils.getValue(this.style, 'position', this.position))));
		var dx2 = w * Math.max(0, Math.min(1, parseFloat(bpmUtils.getValue(this.style, 'position2', this.position2))));
		var base = Math.max(0, Math.min(w, parseFloat(bpmUtils.getValue(this.style, 'base', this.base))));
		
		this.addPoints(c, [new bpmPoint(0, 0), new bpmPoint(w, 0), new bpmPoint(w, h - s),
			new bpmPoint(Math.min(w, dx + base), h - s), new bpmPoint(dx2, h),
			new bpmPoint(Math.max(0, dx), h - s), new bpmPoint(0, h - s)],
			this.isRounded, arcSize, true, [4]);
	};

	bpmCellRenderer.registerShape('callout', CalloutShape);

	// Step shape
	function StepShape()
	{
		bpmActor.call(this);
	};
	bpmUtils.extend(StepShape, bpmActor);
	StepShape.prototype.size = 0.2;
	StepShape.prototype.fixedSize = 20;
	StepShape.prototype.isRoundable = function()
	{
		return true;
	};
	StepShape.prototype.redrawPath = function(c, x, y, w, h)
	{
		var fixed = bpmUtils.getValue(this.style, 'fixedSize', '0') != '0';
		var s = (fixed) ? Math.max(0, Math.min(w, parseFloat(bpmUtils.getValue(this.style, 'size', this.fixedSize)))) :
			w * Math.max(0, Math.min(1, parseFloat(bpmUtils.getValue(this.style, 'size', this.size))));
		var arcSize = bpmUtils.getValue(this.style, bpmConstants.STYLE_ARCSIZE, bpmConstants.LINE_ARCSIZE) / 2;
		this.addPoints(c, [new bpmPoint(0, 0), new bpmPoint(w - s, 0), new bpmPoint(w, h / 2), new bpmPoint(w - s, h),
		                   new bpmPoint(0, h), new bpmPoint(s, h / 2)], this.isRounded, arcSize, true);
		c.end();
	};

	bpmCellRenderer.registerShape('step', StepShape);

	// Hexagon shape
	function HexagonShape()
	{
		bpmActor.call(this);
	};
	bpmUtils.extend(HexagonShape, bpmHexagon);
	HexagonShape.prototype.size = 0.25;
	HexagonShape.prototype.isRoundable = function()
	{
		return true;
	};
	HexagonShape.prototype.redrawPath = function(c, x, y, w, h)
	{
		var s =  w * Math.max(0, Math.min(1, parseFloat(bpmUtils.getValue(this.style, 'size', this.size))));
		var arcSize = bpmUtils.getValue(this.style, bpmConstants.STYLE_ARCSIZE, bpmConstants.LINE_ARCSIZE) / 2;
		this.addPoints(c, [new bpmPoint(s, 0), new bpmPoint(w - s, 0), new bpmPoint(w, 0.5 * h), new bpmPoint(w - s, h),
		                   new bpmPoint(s, h), new bpmPoint(0, 0.5 * h)], this.isRounded, arcSize, true);
	};

	bpmCellRenderer.registerShape('hexagon', HexagonShape);

	// Plus Shape
	function PlusShape()
	{
		bpmRectangleShape.call(this);
	};
	bpmUtils.extend(PlusShape, bpmRectangleShape);
	PlusShape.prototype.isHtmlAllowed = function()
	{
		return false;
	};
	PlusShape.prototype.paintForeground = function(c, x, y, w, h)
	{
		var border = Math.min(w / 5, h / 5) + 1;
		
		c.begin();
		c.moveTo(x + w / 2, y + border);
		c.lineTo(x + w / 2, y + h - border);
		c.moveTo(x + border, y + h / 2);
		c.lineTo(x + w - border, y + h / 2);
		c.end();
		c.stroke();
		bpmRectangleShape.prototype.paintForeground.apply(this, arguments);
	};

	bpmCellRenderer.registerShape('plus', PlusShape);
	
	// Overrides painting of rhombus shape to allow for double style
	var bpmRhombusPaintVertexShape = bpmRhombus.prototype.paintVertexShape;
	bpmRhombus.prototype.getLabelBounds = function(rect)
	{
		if (this.style['double'] == 1)
		{
			var margin = (Math.max(2, this.strokewidth + 1) * 2 + parseFloat(
				this.style[bpmConstants.STYLE_MARGIN] || 0)) * this.scale;
		
			return new bpmRectangle(rect.x + margin, rect.y + margin,
				rect.width - 2 * margin, rect.height - 2 * margin);
		}
		
		return rect;
	};
	bpmRhombus.prototype.paintVertexShape = function(c, x, y, w, h)
	{
		bpmRhombusPaintVertexShape.apply(this, arguments);

		if (!this.outline && this.style['double'] == 1)
		{
			var margin = Math.max(2, this.strokewidth + 1) * 2 +
				parseFloat(this.style[bpmConstants.STYLE_MARGIN] || 0);
			x += margin;
			y += margin;
			w -= 2 * margin;
			h -= 2 * margin;
			
			if (w > 0 && h > 0)
			{
				c.setShadow(false);
				
				// Workaround for closure compiler bug where the lines with x and y above
				// are removed if arguments is used as second argument in call below.
				bpmRhombusPaintVertexShape.apply(this, [c, x, y, w, h]);
			}
		}
	};

	// CompositeShape
	function ExtendedShape()
	{
		bpmRectangleShape.call(this);
	};
	bpmUtils.extend(ExtendedShape, bpmRectangleShape);
	ExtendedShape.prototype.isHtmlAllowed = function()
	{
		return false;
	};
	ExtendedShape.prototype.getLabelBounds = function(rect)
	{
		if (this.style['double'] == 1)
		{
			var margin = (Math.max(2, this.strokewidth + 1) + parseFloat(
				this.style[bpmConstants.STYLE_MARGIN] || 0)) * this.scale;
		
			return new bpmRectangle(rect.x + margin, rect.y + margin,
				rect.width - 2 * margin, rect.height - 2 * margin);
		}
		
		return rect;
	};
	
	ExtendedShape.prototype.paintForeground = function(c, x, y, w, h)
	{
		if (this.style != null)
		{
			if (!this.outline && this.style['double'] == 1)
			{
				var margin = Math.max(2, this.strokewidth + 1) + parseFloat(this.style[bpmConstants.STYLE_MARGIN] || 0);
				x += margin;
				y += margin;
				w -= 2 * margin;
				h -= 2 * margin;
				
				if (w > 0 && h > 0)
				{
					bpmRectangleShape.prototype.paintBackground.apply(this, arguments);
				}
			}
			
			c.setDashed(false);
			
			// Draws the symbols defined in the style. The symbols are
			// numbered from 1...n. Possible postfixes are align,
			// verticalAlign, spacing, arcSpacing, width, height
			var counter = 0;
			var shape = null;
			
			do
			{
				shape = bpmCellRenderer.defaultShapes[this.style['symbol' + counter]];
				
				if (shape != null)
				{
					var align = this.style['symbol' + counter + 'Align'];
					var valign = this.style['symbol' + counter + 'VerticalAlign'];
					var width = this.style['symbol' + counter + 'Width'];
					var height = this.style['symbol' + counter + 'Height'];
					var spacing = this.style['symbol' + counter + 'Spacing'] || 0;
					var vspacing = this.style['symbol' + counter + 'VSpacing'] || spacing;
					var arcspacing = this.style['symbol' + counter + 'ArcSpacing'];
					
					if (arcspacing != null)
					{
						var arcSize = this.getArcSize(w + this.strokewidth, h + this.strokewidth) * arcspacing;
						spacing += arcSize;
						vspacing += arcSize;
					}
					
					var x2 = x;
					var y2 = y;
					
					if (align == bpmConstants.ALIGN_CENTER)
					{
						x2 += (w - width) / 2;
					}
					else if (align == bpmConstants.ALIGN_RIGHT)
					{
						x2 += w - width - spacing;
					}
					else
					{
						x2 += spacing;
					}
					
					if (valign == bpmConstants.ALIGN_MIDDLE)
					{
						y2 += (h - height) / 2;
					}
					else if (valign == bpmConstants.ALIGN_BOTTOM)
					{
						y2 += h - height - vspacing;
					}
					else
					{
						y2 += vspacing;
					}
					
					c.save();
					
					// Small hack to pass style along into subshape
					var tmp = new shape();
					// TODO: Clone style and override settings (eg. strokewidth)
					tmp.style = this.style;
					shape.prototype.paintVertexShape.call(tmp, c, x2, y2, width, height);
					c.restore();
				}
				
				counter++;
			}
			while (shape != null);
		}
		
		// Paints glass effect
		bpmRectangleShape.prototype.paintForeground.apply(this, arguments);
	};

	bpmCellRenderer.registerShape('ext', ExtendedShape);
	
	// Tape Shape, supports size style
	function MessageShape()
	{
		bpmCylinder.call(this);
	};
	bpmUtils.extend(MessageShape, bpmCylinder);
	MessageShape.prototype.redrawPath = function(path, x, y, w, h, isForeground)
	{
		if (isForeground)
		{
			path.moveTo(0, 0);
			path.lineTo(w / 2, h / 2);
			path.lineTo(w, 0);
			path.end();
		}
		else
		{
			path.moveTo(0, 0);
			path.lineTo(w, 0);
			path.lineTo(w, h);
			path.lineTo(0, h);
			path.close();
		}
	};

	bpmCellRenderer.registerShape('message', MessageShape);
	
	// UML Actor Shape
	function UmlActorShape()
	{
		bpmShape.call(this);
	};
	bpmUtils.extend(UmlActorShape, bpmShape);
	UmlActorShape.prototype.paintBackground = function(c, x, y, w, h)
	{
		c.translate(x, y);

		// Head
		c.ellipse(w / 4, 0, w / 2, h / 4);
		c.fillAndStroke();

		c.begin();
		c.moveTo(w / 2, h / 4);
		c.lineTo(w / 2, 2 * h / 3);
		
		// Arms
		c.moveTo(w / 2, h / 3);
		c.lineTo(0, h / 3);
		c.moveTo(w / 2, h / 3);
		c.lineTo(w, h / 3);
		
		// Legs
		c.moveTo(w / 2, 2 * h / 3);
		c.lineTo(0, h);
		c.moveTo(w / 2, 2 * h / 3);
		c.lineTo(w, h);
		c.end();
		
		c.stroke();
	};

	// Replaces existing actor shape
	bpmCellRenderer.registerShape('umlActor', UmlActorShape);
	
	// UML Boundary Shape
	function UmlBoundaryShape()
	{
		bpmShape.call(this);
	};
	bpmUtils.extend(UmlBoundaryShape, bpmShape);
	UmlBoundaryShape.prototype.getLabelMargins = function(rect)
	{
		return new bpmRectangle(rect.width / 6, 0, 0, 0);
	};
	UmlBoundaryShape.prototype.paintBackground = function(c, x, y, w, h)
	{
		c.translate(x, y);
		
		// Base line
		c.begin();
		c.moveTo(0, h / 4);
		c.lineTo(0, h * 3 / 4);
		c.end();
		c.stroke();
		
		// Horizontal line
		c.begin();
		c.moveTo(0, h / 2);
		c.lineTo(w / 6, h / 2);
		c.end();
		c.stroke();
		
		// Circle
		c.ellipse(w / 6, 0, w * 5 / 6, h);
		c.fillAndStroke();
	};

	// Replaces existing actor shape
	bpmCellRenderer.registerShape('umlBoundary', UmlBoundaryShape);

	// UML Entity Shape
	function UmlEntityShape()
	{
		bpmEllipse.call(this);
	};
	bpmUtils.extend(UmlEntityShape, bpmEllipse);
	UmlEntityShape.prototype.paintVertexShape = function(c, x, y, w, h)
	{
		bpmEllipse.prototype.paintVertexShape.apply(this, arguments);
		
		c.begin();
		c.moveTo(x + w / 8, y + h);
		c.lineTo(x + w * 7 / 8, y + h);
		c.end();
		c.stroke();
	};

	bpmCellRenderer.registerShape('umlEntity', UmlEntityShape);

	// UML Destroy Shape
	function UmlDestroyShape()
	{
		bpmShape.call(this);
	};
	bpmUtils.extend(UmlDestroyShape, bpmShape);
	UmlDestroyShape.prototype.paintVertexShape = function(c, x, y, w, h)
	{
		c.translate(x, y);

		c.begin();
		c.moveTo(w, 0);
		c.lineTo(0, h);
		c.moveTo(0, 0);
		c.lineTo(w, h);
		c.end();
		c.stroke();
	};

	bpmCellRenderer.registerShape('umlDestroy', UmlDestroyShape);
	
	// UML Control Shape
	function UmlControlShape()
	{
		bpmShape.call(this);
	};
	bpmUtils.extend(UmlControlShape, bpmShape);
	UmlControlShape.prototype.getLabelBounds = function(rect)
	{
		return new bpmRectangle(rect.x, rect.y + rect.height / 8, rect.width, rect.height * 7 / 8);
	};
	UmlControlShape.prototype.paintBackground = function(c, x, y, w, h)
	{
		c.translate(x, y);

		// Upper line
		c.begin();
		c.moveTo(w * 3 / 8, h / 8 * 1.1);
		c.lineTo(w * 5 / 8, 0);
		c.end();
		c.stroke();
		
		// Circle
		c.ellipse(0, h / 8, w, h * 7 / 8);
		c.fillAndStroke();
	};
	UmlControlShape.prototype.paintForeground = function(c, x, y, w, h)
	{
		// Lower line
		c.begin();
		c.moveTo(w * 3 / 8, h / 8 * 1.1);
		c.lineTo(w * 5 / 8, h / 4);
		c.end();
		c.stroke();
	};

	// Replaces existing actor shape
	bpmCellRenderer.registerShape('umlControl', UmlControlShape);

	// UML Lifeline Shape
	function UmlLifeline()
	{
		bpmRectangleShape.call(this);
	};
	bpmUtils.extend(UmlLifeline, bpmRectangleShape);
	UmlLifeline.prototype.size = 40;
	UmlLifeline.prototype.isHtmlAllowed = function()
	{
		return false;
	};
	UmlLifeline.prototype.getLabelBounds = function(rect)
	{
		var size = Math.max(0, Math.min(rect.height, parseFloat(
			bpmUtils.getValue(this.style, 'size', this.size)) * this.scale));
		
		return new bpmRectangle(rect.x, rect.y, rect.width, size);
	};
	UmlLifeline.prototype.paintBackground = function(c, x, y, w, h)
	{
		var size = Math.max(0, Math.min(h, parseFloat(bpmUtils.getValue(this.style, 'size', this.size))));
		var participant = bpmUtils.getValue(this.style, 'participant');
		
		if (participant == null || this.state == null)
		{
			bpmRectangleShape.prototype.paintBackground.call(this, c, x, y, w, size);
		}
		else
		{
			var ctor = this.state.view.graph.cellRenderer.getShape(participant);
			
			if (ctor != null && ctor != UmlLifeline)
			{
				var shape = new ctor();
				shape.apply(this.state);
				c.save();
				shape.paintVertexShape(c, x, y, w, size);
				c.restore();
			}
		}
		
		if (size < h)
		{
			c.setDashed(true);
			c.begin();
			c.moveTo(x + w / 2, y + size);
			c.lineTo(x + w / 2, y + h);
			c.end();
			c.stroke();
		}
	};
	UmlLifeline.prototype.paintForeground = function(c, x, y, w, h)
	{
		var size = Math.max(0, Math.min(h, parseFloat(bpmUtils.getValue(this.style, 'size', this.size))));
		bpmRectangleShape.prototype.paintForeground.call(this, c, x, y, w, Math.min(h, size));
	};

	bpmCellRenderer.registerShape('umlLifeline', UmlLifeline);
	
	// UML Frame Shape
	function UmlFrame()
	{
		bpmShape.call(this);
	};
	bpmUtils.extend(UmlFrame, bpmShape);
	UmlFrame.prototype.width = 60;
	UmlFrame.prototype.height = 30;
	UmlFrame.prototype.corner = 10;
	UmlFrame.prototype.getLabelMargins = function(rect)
	{
		return new bpmRectangle(0, 0,
			rect.width - (parseFloat(bpmUtils.getValue(this.style, 'width', this.width) * this.scale)),
			rect.height - (parseFloat(bpmUtils.getValue(this.style, 'height', this.height) * this.scale)));
	};
	UmlFrame.prototype.paintBackground = function(c, x, y, w, h)
	{
		var co = this.corner;
		var w0 = Math.min(w, Math.max(co, parseFloat(bpmUtils.getValue(this.style, 'width', this.width))));
		var h0 = Math.min(h, Math.max(co * 1.5, parseFloat(bpmUtils.getValue(this.style, 'height', this.height))));
		var bg = bpmUtils.getValue(this.style, bpmConstants.STYLE_SWIMLANE_FILLCOLOR, bpmConstants.NONE);
		
		if (bg != bpmConstants.NONE)
		{
			c.setFillColor(bg);
			c.rect(x, y, w, h);
			c.fill();
		}
		
		if (this.fill != null && this.fill != bpmConstants.NONE && this.gradient && this.gradient != bpmConstants.NONE)
		{
			var b = this.getGradientBounds(c, x, y, w, h);
			c.setGradient(this.fill, this.gradient, x, y, w, h, this.gradientDirection);
		}
		else
		{
			c.setFillColor(this.fill);
		}

		c.begin();
		c.moveTo(x, y);
		c.lineTo(x + w0, y);
		c.lineTo(x + w0, y + Math.max(0, h0 - co * 1.5));
		c.lineTo(x + Math.max(0, w0 - co), y + h0);
		c.lineTo(x, y + h0);
		c.close();
		c.fillAndStroke();
		
		c.begin();
		c.moveTo(x + w0, y);
		c.lineTo(x + w, y);
		c.lineTo(x + w, y + h);
		c.lineTo(x, y + h);
		c.lineTo(x, y + h0);
		c.stroke();
	};

	bpmCellRenderer.registerShape('umlFrame', UmlFrame);
	
	bpmPerimeter.LifelinePerimeter = function (bounds, vertex, next, orthogonal)
	{
		var size = UmlLifeline.prototype.size;
		
		if (vertex != null)
		{
			size = bpmUtils.getValue(vertex.style, 'size', size) * vertex.view.scale;
		}
		
		var sw = (parseFloat(vertex.style[bpmConstants.STYLE_STROKEWIDTH] || 1) * vertex.view.scale / 2) - 1;

		if (next.x < bounds.getCenterX())
		{
			sw += 1;
			sw *= -1;
		}
		
		return new bpmPoint(bounds.getCenterX() + sw, Math.min(bounds.y + bounds.height,
				Math.max(bounds.y + size, next.y)));
	};
	
	bpmStyleRegistry.putValue('lifelinePerimeter', bpmPerimeter.LifelinePerimeter);
	
	bpmPerimeter.OrthogonalPerimeter = function (bounds, vertex, next, orthogonal)
	{
		orthogonal = true;
		
		return bpmPerimeter.RectanglePerimeter.apply(this, arguments);
	};
	
	bpmStyleRegistry.putValue('orthogonalPerimeter', bpmPerimeter.OrthogonalPerimeter);

	bpmPerimeter.BackbonePerimeter = function (bounds, vertex, next, orthogonal)
	{
		var sw = (parseFloat(vertex.style[bpmConstants.STYLE_STROKEWIDTH] || 1) * vertex.view.scale / 2) - 1;
		
		if (vertex.style['backboneSize'] != null)
		{
			sw += (parseFloat(vertex.style['backboneSize']) * vertex.view.scale / 2) - 1;
		}
		
		if (vertex.style[bpmConstants.STYLE_DIRECTION] == 'south' ||
			vertex.style[bpmConstants.STYLE_DIRECTION] == 'north')
		{
			if (next.x < bounds.getCenterX())
			{
				sw += 1;
				sw *= -1;
			}
			
			return new bpmPoint(bounds.getCenterX() + sw, Math.min(bounds.y + bounds.height,
					Math.max(bounds.y, next.y)));
		}
		else
		{
			if (next.y < bounds.getCenterY())
			{
				sw += 1;
				sw *= -1;
			}
			
			return new bpmPoint(Math.min(bounds.x + bounds.width, Math.max(bounds.x, next.x)),
				bounds.getCenterY() + sw);
		}
	};
	
	bpmStyleRegistry.putValue('backbonePerimeter', bpmPerimeter.BackbonePerimeter);

	// Callout Perimeter
	bpmPerimeter.CalloutPerimeter = function (bounds, vertex, next, orthogonal)
	{
		return bpmPerimeter.RectanglePerimeter(bpmUtils.getDirectedBounds(bounds, new bpmRectangle(0, 0, 0,
			Math.max(0, Math.min(bounds.height, parseFloat(bpmUtils.getValue(vertex.style, 'size',
			CalloutShape.prototype.size)) * vertex.view.scale))),
			vertex.style), vertex, next, orthogonal);
	};
	
	bpmStyleRegistry.putValue('calloutPerimeter', bpmPerimeter.CalloutPerimeter);
	
	// Parallelogram Perimeter
	bpmPerimeter.ParallelogramPerimeter = function (bounds, vertex, next, orthogonal)
	{
		var size = ParallelogramShape.prototype.size;
		
		if (vertex != null)
		{
			size = bpmUtils.getValue(vertex.style, 'size', size);
		}
		
		var x = bounds.x;
		var y = bounds.y;
		var w = bounds.width;
		var h = bounds.height;

		var direction = (vertex != null) ? bpmUtils.getValue(
			vertex.style, bpmConstants.STYLE_DIRECTION,
			bpmConstants.DIRECTION_EAST) : bpmConstants.DIRECTION_EAST;
		var vertical = direction == bpmConstants.DIRECTION_NORTH ||
			direction == bpmConstants.DIRECTION_SOUTH;
		var points;
		
		if (vertical)
		{
			var dy = h * Math.max(0, Math.min(1, size));
			points = [new bpmPoint(x, y), new bpmPoint(x + w, y + dy),
						new bpmPoint(x + w, y + h), new bpmPoint(x, y + h - dy), new bpmPoint(x, y)];
		}
		else
		{
			var dx = w * Math.max(0, Math.min(1, size));
			points = [new bpmPoint(x + dx, y), new bpmPoint(x + w, y),
							new bpmPoint(x + w - dx, y + h), new bpmPoint(x, y + h), new bpmPoint(x + dx, y)];
		}	
		
		var cx = bounds.getCenterX();
		var cy = bounds.getCenterY();
		
		var p1 = new bpmPoint(cx, cy);
		
		if (orthogonal)
		{
			if (next.x < x || next.x > x + w)
			{
				p1.y = next.y;
			}
			else
			{
				p1.x = next.x;
			}
		}
		
		return bpmUtils.getPerimeterPoint(points, p1, next);
	};
	
	bpmStyleRegistry.putValue('parallelogramPerimeter', bpmPerimeter.ParallelogramPerimeter);
	
	// Trapezoid Perimeter
	bpmPerimeter.TrapezoidPerimeter = function (bounds, vertex, next, orthogonal)
	{
		var size = TrapezoidShape.prototype.size;
		
		if (vertex != null)
		{
			size = bpmUtils.getValue(vertex.style, 'size', size);
		}
		
		var x = bounds.x;
		var y = bounds.y;
		var w = bounds.width;
		var h = bounds.height;

		var direction = (vertex != null) ? bpmUtils.getValue(
				vertex.style, bpmConstants.STYLE_DIRECTION,
				bpmConstants.DIRECTION_EAST) : bpmConstants.DIRECTION_EAST;
		var points;
		
		if (direction == bpmConstants.DIRECTION_EAST)
		{
			var dx = w * Math.max(0, Math.min(1, size));
			points = [new bpmPoint(x + dx, y), new bpmPoint(x + w - dx, y),
						new bpmPoint(x + w, y + h), new bpmPoint(x, y + h), new bpmPoint(x + dx, y)];
		}
		else if (direction == bpmConstants.DIRECTION_WEST)
		{
			var dx = w * Math.max(0, Math.min(1, size));
			points = [new bpmPoint(x, y), new bpmPoint(x + w, y),
						new bpmPoint(x + w - dx, y + h), new bpmPoint(x + dx, y + h), new bpmPoint(x, y)];
		}
		else if (direction == bpmConstants.DIRECTION_NORTH)
		{
			var dy = h * Math.max(0, Math.min(1, size));
			points = [new bpmPoint(x, y + dy), new bpmPoint(x + w, y),
						new bpmPoint(x + w, y + h), new bpmPoint(x, y + h - dy), new bpmPoint(x, y + dy)];
		}
		else
		{
			var dy = h * Math.max(0, Math.min(1, size));
			points = [new bpmPoint(x, y), new bpmPoint(x + w, y + dy),
						new bpmPoint(x + w, y + h - dy), new bpmPoint(x, y + h), new bpmPoint(x, y)];
		}		

		var cx = bounds.getCenterX();
		var cy = bounds.getCenterY();
		
		var p1 = new bpmPoint(cx, cy);
		
		if (orthogonal)
		{
			if (next.x < x || next.x > x + w)
			{
				p1.y = next.y;
			}
			else
			{
				p1.x = next.x;
			}
		}

		return bpmUtils.getPerimeterPoint(points, p1, next);
	};
	
	bpmStyleRegistry.putValue('trapezoidPerimeter', bpmPerimeter.TrapezoidPerimeter);
	
	// Step Perimeter
	bpmPerimeter.StepPerimeter = function (bounds, vertex, next, orthogonal)
	{
		var fixed = bpmUtils.getValue(vertex.style, 'fixedSize', '0') != '0';
		var size = (fixed) ? StepShape.prototype.fixedSize : StepShape.prototype.size;
		
		if (vertex != null)
		{
			size = bpmUtils.getValue(vertex.style, 'size', size);
		}
		
		var x = bounds.x;
		var y = bounds.y;
		var w = bounds.width;
		var h = bounds.height;

		var cx = bounds.getCenterX();
		var cy = bounds.getCenterY();
		
		var direction = (vertex != null) ? bpmUtils.getValue(
				vertex.style, bpmConstants.STYLE_DIRECTION,
				bpmConstants.DIRECTION_EAST) : bpmConstants.DIRECTION_EAST;
		var points;
		
		if (direction == bpmConstants.DIRECTION_EAST)
		{
			var dx = (fixed) ? Math.max(0, Math.min(w, size)) : w * Math.max(0, Math.min(1, size));
			points = [new bpmPoint(x, y), new bpmPoint(x + w - dx, y), new bpmPoint(x + w, cy),
							new bpmPoint(x + w - dx, y + h), new bpmPoint(x, y + h),
							new bpmPoint(x + dx, cy), new bpmPoint(x, y)];
		}
		else if (direction == bpmConstants.DIRECTION_WEST)
		{
			var dx = (fixed) ? Math.max(0, Math.min(w, size)) : w * Math.max(0, Math.min(1, size));
			points = [new bpmPoint(x + dx, y), new bpmPoint(x + w, y), new bpmPoint(x + w - dx, cy),
							new bpmPoint(x + w, y + h), new bpmPoint(x + dx, y + h),
							new bpmPoint(x, cy), new bpmPoint(x + dx, y)];
		}
		else if (direction == bpmConstants.DIRECTION_NORTH)
		{
			var dy = (fixed) ? Math.max(0, Math.min(h, size)) : h * Math.max(0, Math.min(1, size));
			points = [new bpmPoint(x, y + dy), new bpmPoint(cx, y), new bpmPoint(x + w, y + dy),
							new bpmPoint(x + w, y + h), new bpmPoint(cx, y + h - dy),
							new bpmPoint(x, y + h), new bpmPoint(x, y + dy)];
		}
		else
		{
			var dy = (fixed) ? Math.max(0, Math.min(h, size)) : h * Math.max(0, Math.min(1, size));
			points = [new bpmPoint(x, y), new bpmPoint(cx, y + dy), new bpmPoint(x + w, y),
							new bpmPoint(x + w, y + h - dy), new bpmPoint(cx, y + h),
							new bpmPoint(x, y + h - dy), new bpmPoint(x, y)];
		}		
		
		var p1 = new bpmPoint(cx, cy);
		
		if (orthogonal)
		{
			if (next.x < x || next.x > x + w)
			{
				p1.y = next.y;
			}
			else
			{
				p1.x = next.x;
			}
		}
		
		return bpmUtils.getPerimeterPoint(points, p1, next);
	};
	
	bpmStyleRegistry.putValue('stepPerimeter', bpmPerimeter.StepPerimeter);
	
	// Hexagon Perimeter 2 (keep existing one)
	bpmPerimeter.HexagonPerimeter2 = function (bounds, vertex, next, orthogonal)
	{
		var size = HexagonShape.prototype.size;
		
		if (vertex != null)
		{
			size = bpmUtils.getValue(vertex.style, 'size', size);
		}
		
		var x = bounds.x;
		var y = bounds.y;
		var w = bounds.width;
		var h = bounds.height;

		var cx = bounds.getCenterX();
		var cy = bounds.getCenterY();
		
		var direction = (vertex != null) ? bpmUtils.getValue(
			vertex.style, bpmConstants.STYLE_DIRECTION,
			bpmConstants.DIRECTION_EAST) : bpmConstants.DIRECTION_EAST;
		var vertical = direction == bpmConstants.DIRECTION_NORTH ||
			direction == bpmConstants.DIRECTION_SOUTH;
		var points;
		
		if (vertical)
		{
			var dy = h * Math.max(0, Math.min(1, size));
			points = [new bpmPoint(cx, y), new bpmPoint(x + w, y + dy), new bpmPoint(x + w, y + h - dy),
							new bpmPoint(cx, y + h), new bpmPoint(x, y + h - dy),
							new bpmPoint(x, y + dy), new bpmPoint(cx, y)];
		}
		else
		{
			var dx = w * Math.max(0, Math.min(1, size));
			points = [new bpmPoint(x + dx, y), new bpmPoint(x + w - dx, y), new bpmPoint(x + w, cy),
						new bpmPoint(x + w - dx, y + h), new bpmPoint(x + dx, y + h),
						new bpmPoint(x, cy), new bpmPoint(x + dx, y)];
		}		

		var p1 = new bpmPoint(cx, cy);
		
		if (orthogonal)
		{
			if (next.x < x || next.x > x + w)
			{
				p1.y = next.y;
			}
			else
			{
				p1.x = next.x;
			}
		}
		
		return bpmUtils.getPerimeterPoint(points, p1, next);
	};
	
	bpmStyleRegistry.putValue('hexagonPerimeter2', bpmPerimeter.HexagonPerimeter2);
	
	// Provided Interface Shape (aka Lollipop)
	function LollipopShape()
	{
		bpmShape.call(this);
	};
	bpmUtils.extend(LollipopShape, bpmShape);
	LollipopShape.prototype.size = 10;
	LollipopShape.prototype.paintBackground = function(c, x, y, w, h)
	{
		var sz = parseFloat(bpmUtils.getValue(this.style, 'size', this.size));
		c.translate(x, y);
		
		c.ellipse((w - sz) / 2, 0, sz, sz);
		c.fillAndStroke();

		c.begin();
		c.moveTo(w / 2, sz);
		c.lineTo(w / 2, h);
		c.end();
		c.stroke();
	};

	bpmCellRenderer.registerShape('lollipop', LollipopShape);

	// Required Interface Shape
	function RequiresShape()
	{
		bpmShape.call(this);
	};
	bpmUtils.extend(RequiresShape, bpmShape);
	RequiresShape.prototype.size = 10;
	RequiresShape.prototype.inset = 2;
	RequiresShape.prototype.paintBackground = function(c, x, y, w, h)
	{
		var sz = parseFloat(bpmUtils.getValue(this.style, 'size', this.size));
		var inset = parseFloat(bpmUtils.getValue(this.style, 'inset', this.inset)) + this.strokewidth;
		c.translate(x, y);

		c.begin();
		c.moveTo(w / 2, sz + inset);
		c.lineTo(w / 2, h);
		c.end();
		c.stroke();
		
		c.begin();
		c.moveTo((w - sz) / 2 - inset, sz / 2);
		c.quadTo((w - sz) / 2 - inset, sz + inset, w / 2, sz + inset);
		c.quadTo((w + sz) / 2 + inset, sz + inset, (w + sz) / 2 + inset, sz / 2);
		c.end();
		c.stroke();
	};

	bpmCellRenderer.registerShape('requires', RequiresShape);

	// Required Interface Shape
	function RequiredInterfaceShape()
	{
		bpmShape.call(this);
	};
	bpmUtils.extend(RequiredInterfaceShape, bpmShape);
	
	RequiredInterfaceShape.prototype.paintBackground = function(c, x, y, w, h)
	{
		c.translate(x, y);

		c.begin();
		c.moveTo(0, 0);
		c.quadTo(w, 0, w, h / 2);
		c.quadTo(w, h, 0, h);
		c.end();
		c.stroke();
	};

	bpmCellRenderer.registerShape('requiredInterface', RequiredInterfaceShape);

	// Provided and Required Interface Shape
	function ProvidedRequiredInterfaceShape()
	{
		bpmShape.call(this);
	};
	bpmUtils.extend(ProvidedRequiredInterfaceShape, bpmShape);
	ProvidedRequiredInterfaceShape.prototype.inset = 2;
	ProvidedRequiredInterfaceShape.prototype.paintBackground = function(c, x, y, w, h)
	{
		var inset = parseFloat(bpmUtils.getValue(this.style, 'inset', this.inset)) + this.strokewidth;
		c.translate(x, y);

		c.ellipse(0, inset, w - 2 * inset, h - 2 * inset);
		c.fillAndStroke();
		
		c.begin();
		c.moveTo(w / 2, 0);
		c.quadTo(w, 0, w, h / 2);
		c.quadTo(w, h, w / 2, h);
		c.end();
		c.stroke();
	};

	bpmCellRenderer.registerShape('providedRequiredInterface', ProvidedRequiredInterfaceShape);
	
	// Component shape
	function ComponentShape()
	{
		bpmCylinder.call(this);
	};
	bpmUtils.extend(ComponentShape, bpmCylinder);
	ComponentShape.prototype.jettyWidth = 32;
	ComponentShape.prototype.jettyHeight = 12;
	ComponentShape.prototype.redrawPath = function(path, x, y, w, h, isForeground)
	{
		var dx = parseFloat(bpmUtils.getValue(this.style, 'jettyWidth', this.jettyWidth));
		var dy = parseFloat(bpmUtils.getValue(this.style, 'jettyHeight', this.jettyHeight));
		var x0 = dx / 2;
		var x1 = x0 + dx / 2;
		var y0 = 0.3 * h - dy / 2;
		var y1 = 0.7 * h - dy / 2;

		if (isForeground)
		{
			path.moveTo(x0, y0);
			path.lineTo(x1, y0);
			path.lineTo(x1, y0 + dy);
			path.lineTo(x0, y0 + dy);
			path.moveTo(x0, y1);
			path.lineTo(x1, y1);
			path.lineTo(x1, y1 + dy);
			path.lineTo(x0, y1 + dy);
			path.end();
		}
		else
		{
			path.moveTo(x0, 0);
			path.lineTo(w, 0);
			path.lineTo(w, h);
			path.lineTo(x0, h);
			path.lineTo(x0, y1 + dy);
			path.lineTo(0, y1 + dy);
			path.lineTo(0, y1);
			path.lineTo(x0, y1);
			path.lineTo(x0, y0 + dy);
			path.lineTo(0, y0 + dy);
			path.lineTo(0, y0);
			path.lineTo(x0, y0);
			path.close();
			path.end();
		}
	};

	bpmCellRenderer.registerShape('component', ComponentShape);
	
	// State Shapes derives from double ellipse
	function StateShape()
	{
		bpmDoubleEllipse.call(this);
	};
	bpmUtils.extend(StateShape, bpmDoubleEllipse);
	StateShape.prototype.outerStroke = true;
	StateShape.prototype.paintVertexShape = function(c, x, y, w, h)
	{
		var inset = Math.min(4, Math.min(w / 5, h / 5));
		
		if (w > 0 && h > 0)
		{
			c.ellipse(x + inset, y + inset, w - 2 * inset, h - 2 * inset);
			c.fillAndStroke();
		}
		
		c.setShadow(false);

		if (this.outerStroke)
		{
			c.ellipse(x, y, w, h);
			c.stroke();			
		}
	};

	bpmCellRenderer.registerShape('endState', StateShape);

	function StartStateShape()
	{
		StateShape.call(this);
	};
	bpmUtils.extend(StartStateShape, StateShape);
	StartStateShape.prototype.outerStroke = false;
	
	bpmCellRenderer.registerShape('startState', StartStateShape);

	// Link shape
	function LinkShape()
	{
		bpmArrowConnector.call(this);
		this.spacing = 0;
	};
	bpmUtils.extend(LinkShape, bpmArrowConnector);
	LinkShape.prototype.defaultWidth = 4;
	
	LinkShape.prototype.isOpenEnded = function()
	{
		return true;
	};

	LinkShape.prototype.getEdgeWidth = function()
	{
		return bpmUtils.getNumber(this.style, 'width', this.defaultWidth) + Math.max(0, this.strokewidth - 1);
	};
	
	LinkShape.prototype.isArrowRounded = function()
	{
		return this.isRounded;
	};

	// Registers the link shape
	bpmCellRenderer.registerShape('link', LinkShape);

	// Generic arrow
	function FlexArrowShape()
	{
		bpmArrowConnector.call(this);
		this.spacing = 0;
	};
	bpmUtils.extend(FlexArrowShape, bpmArrowConnector);
	FlexArrowShape.prototype.defaultWidth = 10;
	FlexArrowShape.prototype.defaultArrowWidth = 20;

	FlexArrowShape.prototype.getStartArrowWidth = function()
	{
		return this.getEdgeWidth() + bpmUtils.getNumber(this.style, 'startWidth', this.defaultArrowWidth);
	};

	FlexArrowShape.prototype.getEndArrowWidth = function()
	{
		return this.getEdgeWidth() + bpmUtils.getNumber(this.style, 'endWidth', this.defaultArrowWidth);;
	};

	FlexArrowShape.prototype.getEdgeWidth = function()
	{
		return bpmUtils.getNumber(this.style, 'width', this.defaultWidth) + Math.max(0, this.strokewidth - 1);
	};
	
	// Registers the link shape
	bpmCellRenderer.registerShape('flexArrow', FlexArrowShape);
	
	// Manual Input shape
	function ManualInputShape()
	{
		bpmActor.call(this);
	};
	bpmUtils.extend(ManualInputShape, bpmActor);
	ManualInputShape.prototype.size = 30;
	ManualInputShape.prototype.isRoundable = function()
	{
		return true;
	};
	ManualInputShape.prototype.redrawPath = function(c, x, y, w, h)
	{
		var s = Math.min(h, parseFloat(bpmUtils.getValue(this.style, 'size', this.size)));
		var arcSize = bpmUtils.getValue(this.style, bpmConstants.STYLE_ARCSIZE, bpmConstants.LINE_ARCSIZE) / 2;
		this.addPoints(c, [new bpmPoint(0, h), new bpmPoint(0, s), new bpmPoint(w, 0), new bpmPoint(w, h)],
				this.isRounded, arcSize, true);
		c.end();
	};

	bpmCellRenderer.registerShape('manualInput', ManualInputShape);

	// Internal storage
	function InternalStorageShape()
	{
		bpmRectangleShape.call(this);
	};
	bpmUtils.extend(InternalStorageShape, bpmRectangleShape);
	InternalStorageShape.prototype.dx = 20;
	InternalStorageShape.prototype.dy = 20;
	InternalStorageShape.prototype.isHtmlAllowed = function()
	{
		return false;
	};
	InternalStorageShape.prototype.paintForeground = function(c, x, y, w, h)
	{
		bpmRectangleShape.prototype.paintForeground.apply(this, arguments);
		var inset = 0;
		
		if (this.isRounded)
		{
			var f = bpmUtils.getValue(this.style, bpmConstants.STYLE_ARCSIZE,
				bpmConstants.RECTANGLE_ROUNDING_FACTOR * 100) / 100;
			inset = Math.max(inset, Math.min(w * f, h * f));
		}
		
		var dx = Math.max(inset, Math.min(w, parseFloat(bpmUtils.getValue(this.style, 'dx', this.dx))));
		var dy = Math.max(inset, Math.min(h, parseFloat(bpmUtils.getValue(this.style, 'dy', this.dy))));
		
		c.begin();
		c.moveTo(x, y + dy);
		c.lineTo(x + w, y + dy);
		c.end();
		c.stroke();
		
		c.begin();
		c.moveTo(x + dx, y);
		c.lineTo(x + dx, y + h);
		c.end();
		c.stroke();
	};

	bpmCellRenderer.registerShape('internalStorage', InternalStorageShape);

	// Internal storage
	function CornerShape()
	{
		bpmActor.call(this);
	};
	bpmUtils.extend(CornerShape, bpmActor);
	CornerShape.prototype.dx = 20;
	CornerShape.prototype.dy = 20;
	
	// Corner
	CornerShape.prototype.redrawPath = function(c, x, y, w, h)
	{
		var dx = Math.max(0, Math.min(w, parseFloat(bpmUtils.getValue(this.style, 'dx', this.dx))));
		var dy = Math.max(0, Math.min(h, parseFloat(bpmUtils.getValue(this.style, 'dy', this.dy))));
		
		var s = Math.min(w / 2, Math.min(h, parseFloat(bpmUtils.getValue(this.style, 'size', this.size))));
		var arcSize = bpmUtils.getValue(this.style, bpmConstants.STYLE_ARCSIZE, bpmConstants.LINE_ARCSIZE) / 2;
		this.addPoints(c, [new bpmPoint(0, 0), new bpmPoint(w, 0), new bpmPoint(w, dy), new bpmPoint(dx, dy),
		                   new bpmPoint(dx, h), new bpmPoint(0, h)], this.isRounded, arcSize, true);
		c.end();
	};

	bpmCellRenderer.registerShape('corner', CornerShape);

	// Crossbar shape
	function CrossbarShape()
	{
		bpmActor.call(this);
	};
	bpmUtils.extend(CrossbarShape, bpmActor);
	
	CrossbarShape.prototype.redrawPath = function(c, x, y, w, h)
	{
		c.moveTo(0, 0);
		c.lineTo(0, h);
		c.end();
		
		c.moveTo(w, 0);
		c.lineTo(w, h);
		c.end();
		
		c.moveTo(0, h / 2);
		c.lineTo(w, h / 2);
		c.end();
	};

	bpmCellRenderer.registerShape('crossbar', CrossbarShape);

	// Internal storage
	function TeeShape()
	{
		bpmActor.call(this);
	};
	bpmUtils.extend(TeeShape, bpmActor);
	TeeShape.prototype.dx = 20;
	TeeShape.prototype.dy = 20;
	
	// Corner
	TeeShape.prototype.redrawPath = function(c, x, y, w, h)
	{
		var dx = Math.max(0, Math.min(w, parseFloat(bpmUtils.getValue(this.style, 'dx', this.dx))));
		var dy = Math.max(0, Math.min(h, parseFloat(bpmUtils.getValue(this.style, 'dy', this.dy))));
		var w2 = Math.abs(w - dx) / 2;
		
		var s = Math.min(w / 2, Math.min(h, parseFloat(bpmUtils.getValue(this.style, 'size', this.size))));
		var arcSize = bpmUtils.getValue(this.style, bpmConstants.STYLE_ARCSIZE, bpmConstants.LINE_ARCSIZE) / 2;
		this.addPoints(c, [new bpmPoint(0, 0), new bpmPoint(w, 0), new bpmPoint(w, dy), new bpmPoint((w + dx) / 2, dy),
		                   new bpmPoint((w + dx) / 2, h), new bpmPoint((w - dx) / 2, h), new bpmPoint((w - dx) / 2, dy),
		                   new bpmPoint(0, dy)], this.isRounded, arcSize, true);
		c.end();
	};

	bpmCellRenderer.registerShape('tee', TeeShape);

	// Arrow
	function SingleArrowShape()
	{
		bpmActor.call(this);
	};
	bpmUtils.extend(SingleArrowShape, bpmActor);
	SingleArrowShape.prototype.arrowWidth = 0.3;
	SingleArrowShape.prototype.arrowSize = 0.2;
	SingleArrowShape.prototype.redrawPath = function(c, x, y, w, h)
	{
		var aw = h * Math.max(0, Math.min(1, parseFloat(bpmUtils.getValue(this.style, 'arrowWidth', this.arrowWidth))));
		var as = w * Math.max(0, Math.min(1, parseFloat(bpmUtils.getValue(this.style, 'arrowSize', this.arrowSize))));
		var at = (h - aw) / 2;
		var ab = at + aw;
		
		var arcSize = bpmUtils.getValue(this.style, bpmConstants.STYLE_ARCSIZE, bpmConstants.LINE_ARCSIZE) / 2;
		this.addPoints(c, [new bpmPoint(0, at), new bpmPoint(w - as, at), new bpmPoint(w - as, 0), new bpmPoint(w, h / 2),
		                   new bpmPoint(w - as, h), new bpmPoint(w - as, ab), new bpmPoint(0, ab)],
		                   this.isRounded, arcSize, true);
		c.end();
	};

	bpmCellRenderer.registerShape('singleArrow', SingleArrowShape);

	// Arrow
	function DoubleArrowShape()
	{
		bpmActor.call(this);
	};
	bpmUtils.extend(DoubleArrowShape, bpmActor);
	DoubleArrowShape.prototype.redrawPath = function(c, x, y, w, h)
	{
		var aw = h * Math.max(0, Math.min(1, parseFloat(bpmUtils.getValue(this.style, 'arrowWidth', SingleArrowShape.prototype.arrowWidth))));
		var as = w * Math.max(0, Math.min(1, parseFloat(bpmUtils.getValue(this.style, 'arrowSize', SingleArrowShape.prototype.arrowSize))));
		var at = (h - aw) / 2;
		var ab = at + aw;
		
		var arcSize = bpmUtils.getValue(this.style, bpmConstants.STYLE_ARCSIZE, bpmConstants.LINE_ARCSIZE) / 2;
		this.addPoints(c, [new bpmPoint(0, h / 2), new bpmPoint(as, 0), new bpmPoint(as, at), new bpmPoint(w - as, at),
		                   new bpmPoint(w - as, 0), new bpmPoint(w, h / 2), new bpmPoint(w - as, h),
		                   new bpmPoint(w - as, ab), new bpmPoint(as, ab), new bpmPoint(as, h)],
		                   this.isRounded, arcSize, true);
		c.end();
	};

	bpmCellRenderer.registerShape('doubleArrow', DoubleArrowShape);

	// Data storage
	function DataStorageShape()
	{
		bpmActor.call(this);
	};
	bpmUtils.extend(DataStorageShape, bpmActor);
	DataStorageShape.prototype.size = 0.1;
	DataStorageShape.prototype.redrawPath = function(c, x, y, w, h)
	{
		var s = w * Math.max(0, Math.min(1, parseFloat(bpmUtils.getValue(this.style, 'size', this.size))));

		c.moveTo(s, 0);
		c.lineTo(w, 0);
		c.quadTo(w - s * 2, h / 2, w, h);
		c.lineTo(s, h);
		c.quadTo(s - s * 2, h / 2, s, 0);
		c.close();
		c.end();
	};

	bpmCellRenderer.registerShape('dataStorage', DataStorageShape);

	// Or
	function OrShape()
	{
		bpmActor.call(this);
	};
	bpmUtils.extend(OrShape, bpmActor);
	OrShape.prototype.redrawPath = function(c, x, y, w, h)
	{
		c.moveTo(0, 0);
		c.quadTo(w, 0, w, h / 2);
		c.quadTo(w, h, 0, h);
		c.close();
		c.end();
	};

	bpmCellRenderer.registerShape('or', OrShape);

	// Xor
	function XorShape()
	{
		bpmActor.call(this);
	};
	bpmUtils.extend(XorShape, bpmActor);
	XorShape.prototype.redrawPath = function(c, x, y, w, h)
	{
		c.moveTo(0, 0);
		c.quadTo(w, 0, w, h / 2);
		c.quadTo(w, h, 0, h);
		c.quadTo(w / 2, h / 2, 0, 0);
		c.close();
		c.end();
	};

	bpmCellRenderer.registerShape('xor', XorShape);

	// Loop limit
	function LoopLimitShape()
	{
		bpmActor.call(this);
	};
	bpmUtils.extend(LoopLimitShape, bpmActor);
	LoopLimitShape.prototype.size = 20;
	LoopLimitShape.prototype.isRoundable = function()
	{
		return true;
	};
	LoopLimitShape.prototype.redrawPath = function(c, x, y, w, h)
	{
		var s = Math.min(w / 2, Math.min(h, parseFloat(bpmUtils.getValue(this.style, 'size', this.size))));
		var arcSize = bpmUtils.getValue(this.style, bpmConstants.STYLE_ARCSIZE, bpmConstants.LINE_ARCSIZE) / 2;
		this.addPoints(c, [new bpmPoint(s, 0), new bpmPoint(w - s, 0), new bpmPoint(w, s * 0.8), new bpmPoint(w, h),
		                   new bpmPoint(0, h), new bpmPoint(0, s * 0.8)], this.isRounded, arcSize, true);
		c.end();
	};

	bpmCellRenderer.registerShape('loopLimit', LoopLimitShape);

	// Off page connector
	function OffPageConnectorShape()
	{
		bpmActor.call(this);
	};
	bpmUtils.extend(OffPageConnectorShape, bpmActor);
	OffPageConnectorShape.prototype.size = 3 / 8;
	OffPageConnectorShape.prototype.isRoundable = function()
	{
		return true;
	};
	OffPageConnectorShape.prototype.redrawPath = function(c, x, y, w, h)
	{
		var s = h * Math.max(0, Math.min(1, parseFloat(bpmUtils.getValue(this.style, 'size', this.size))));
		var arcSize = bpmUtils.getValue(this.style, bpmConstants.STYLE_ARCSIZE, bpmConstants.LINE_ARCSIZE) / 2;
		this.addPoints(c, [new bpmPoint(0, 0), new bpmPoint(w, 0), new bpmPoint(w, h - s), new bpmPoint(w / 2, h),
		                   new bpmPoint(0, h - s)], this.isRounded, arcSize, true);
		c.end();
	};

	bpmCellRenderer.registerShape('offPageConnector', OffPageConnectorShape);

	// Internal storage
	function TapeDataShape()
	{
		bpmEllipse.call(this);
	};
	bpmUtils.extend(TapeDataShape, bpmEllipse);
	TapeDataShape.prototype.paintVertexShape = function(c, x, y, w, h)
	{
		bpmEllipse.prototype.paintVertexShape.apply(this, arguments);
		
		c.begin();
		c.moveTo(x + w / 2, y + h);
		c.lineTo(x + w, y + h);
		c.end();
		c.stroke();
	};

	bpmCellRenderer.registerShape('tapeData', TapeDataShape);

	// OrEllipseShape
	function OrEllipseShape()
	{
		bpmEllipse.call(this);
	};
	bpmUtils.extend(OrEllipseShape, bpmEllipse);
	OrEllipseShape.prototype.paintVertexShape = function(c, x, y, w, h)
	{
		bpmEllipse.prototype.paintVertexShape.apply(this, arguments);
		
		c.setShadow(false);
		c.begin();
		c.moveTo(x, y + h / 2);
		c.lineTo(x + w, y + h / 2);
		c.end();
		c.stroke();
		
		c.begin();
		c.moveTo(x + w / 2, y);
		c.lineTo(x + w / 2, y + h);
		c.end();
		c.stroke();
	};

	bpmCellRenderer.registerShape('orEllipse', OrEllipseShape);

	// SumEllipseShape
	function SumEllipseShape()
	{
		bpmEllipse.call(this);
	};
	bpmUtils.extend(SumEllipseShape, bpmEllipse);
	SumEllipseShape.prototype.paintVertexShape = function(c, x, y, w, h)
	{
		bpmEllipse.prototype.paintVertexShape.apply(this, arguments);
		var s2 = 0.145;
		
		c.setShadow(false);
		c.begin();
		c.moveTo(x + w * s2, y + h * s2);
		c.lineTo(x + w * (1 - s2), y + h * (1 - s2));
		c.end();
		c.stroke();
		
		c.begin();
		c.moveTo(x + w * (1 - s2), y + h * s2);
		c.lineTo(x + w * s2, y + h * (1 - s2));
		c.end();
		c.stroke();
	};

	bpmCellRenderer.registerShape('sumEllipse', SumEllipseShape);

	// SortShape
	function SortShape()
	{
		bpmRhombus.call(this);
	};
	bpmUtils.extend(SortShape, bpmRhombus);
	SortShape.prototype.paintVertexShape = function(c, x, y, w, h)
	{
		bpmRhombus.prototype.paintVertexShape.apply(this, arguments);
		
		c.setShadow(false);
		c.begin();
		c.moveTo(x, y + h / 2);
		c.lineTo(x + w, y + h / 2);
		c.end();
		c.stroke();
	};

	bpmCellRenderer.registerShape('sortShape', SortShape);

	// CollateShape
	function CollateShape()
	{
		bpmEllipse.call(this);
	};
	bpmUtils.extend(CollateShape, bpmEllipse);
	CollateShape.prototype.paintVertexShape = function(c, x, y, w, h)
	{
		c.begin();
		c.moveTo(x, y);
		c.lineTo(x + w, y);
		c.lineTo(x + w / 2, y + h / 2);
		c.close();
		c.fillAndStroke();
		
		c.begin();
		c.moveTo(x, y + h);
		c.lineTo(x + w, y + h);
		c.lineTo(x + w / 2, y + h / 2);
		c.close();
		c.fillAndStroke();
	};

	bpmCellRenderer.registerShape('collate', CollateShape);

	// DimensionShape
	function DimensionShape()
	{
		bpmEllipse.call(this);
	};
	bpmUtils.extend(DimensionShape, bpmEllipse);
	DimensionShape.prototype.paintVertexShape = function(c, x, y, w, h)
	{
		// Arrow size
		var al = 10;
		var cy = y + h - al / 2;
		
		c.begin();
		c.moveTo(x, y);
		c.lineTo(x, y + h);
		c.moveTo(x, cy);
		c.lineTo(x + al, cy - al / 2);
		c.moveTo(x, cy);
		c.lineTo(x + al, cy + al / 2);
		c.moveTo(x, cy);
		c.lineTo(x + w, cy);

		// Opposite side
		c.moveTo(x + w, y);
		c.lineTo(x + w, y + h);
		c.moveTo(x + w, cy);
		c.lineTo(x + w - al, cy - al / 2);
		c.moveTo(x + w, cy);
		c.lineTo(x + w - al, cy + al / 2);
		c.end();
		c.stroke();
	};

	bpmCellRenderer.registerShape('dimension', DimensionShape);

	// PartialRectangleShape
	function PartialRectangleShape()
	{
		bpmEllipse.call(this);
	};
	bpmUtils.extend(PartialRectangleShape, bpmEllipse);
	PartialRectangleShape.prototype.paintVertexShape = function(c, x, y, w, h)
	{
		if (!this.outline)
		{
			c.setStrokeColor(null);
		}

		bpmRectangleShape.prototype.paintBackground.apply(this, arguments);
		
		if (this.style != null)
		{
			c.setStrokeColor(this.stroke);
			c.rect(x, y, w, h);
			c.fill();

			c.begin();
			c.moveTo(x, y);
			
			if (bpmUtils.getValue(this.style, 'top', '1') == '1')
			{
				c.lineTo(x + w, y);
			}
			else
			{
				c.moveTo(x + w, y);
			}
			
			if (bpmUtils.getValue(this.style, 'right', '1') == '1')
			{
				c.lineTo(x + w, y + h);
			}
			else
			{
				c.moveTo(x + w, y + h);
			}
			
			if (bpmUtils.getValue(this.style, 'bottom', '1') == '1')
			{
				c.lineTo(x, y + h);
			}
			else
			{
				c.moveTo(x, y + h);
			}
			
			if (bpmUtils.getValue(this.style, 'left', '1') == '1')
			{
				c.lineTo(x, y - this.strokewidth / 2);
			}
						
			c.end();
			c.stroke();
		}
	};

	bpmCellRenderer.registerShape('partialRectangle', PartialRectangleShape);

	// LineEllipseShape
	function LineEllipseShape()
	{
		bpmEllipse.call(this);
	};
	bpmUtils.extend(LineEllipseShape, bpmEllipse);
	LineEllipseShape.prototype.paintVertexShape = function(c, x, y, w, h)
	{
		bpmEllipse.prototype.paintVertexShape.apply(this, arguments);
		
		c.setShadow(false);
		c.begin();
		
		if (bpmUtils.getValue(this.style, 'line') == 'vertical')
		{
			c.moveTo(x + w / 2, y);
			c.lineTo(x + w / 2, y + h);
		}
		else
		{
			c.moveTo(x, y + h / 2);
			c.lineTo(x + w, y + h / 2);
		}

		c.end();			
		c.stroke();
	};

	bpmCellRenderer.registerShape('lineEllipse', LineEllipseShape);

	// Delay
	function DelayShape()
	{
		bpmActor.call(this);
	};
	bpmUtils.extend(DelayShape, bpmActor);
	DelayShape.prototype.redrawPath = function(c, x, y, w, h)
	{
		var dx = Math.min(w, h / 2);
		c.moveTo(0, 0);
		c.lineTo(w - dx, 0);
		c.quadTo(w, 0, w, h / 2);
		c.quadTo(w, h, w - dx, h);
		c.lineTo(0, h);
		c.close();
		c.end();
	};

	bpmCellRenderer.registerShape('delay', DelayShape);

	// Cross Shape
	function CrossShape()
	{
		bpmActor.call(this);
	};
	bpmUtils.extend(CrossShape, bpmActor);
	CrossShape.prototype.size = 0.2;
	CrossShape.prototype.redrawPath = function(c, x, y, w, h)
	{
		var m = Math.min(h, w);
		var size = Math.max(0, Math.min(m, m * parseFloat(bpmUtils.getValue(this.style, 'size', this.size))));
		var t = (h - size) / 2;
		var b = t + size;
		var l = (w - size) / 2;
		var r = l + size;
		
		c.moveTo(0, t);
		c.lineTo(l, t);
		c.lineTo(l, 0);
		c.lineTo(r, 0);
		c.lineTo(r, t);
		c.lineTo(w, t);
		c.lineTo(w, b);
		c.lineTo(r, b);
		c.lineTo(r, h);
		c.lineTo(l, h);
		c.lineTo(l, b);
		c.lineTo(0, b);
		c.close();
		c.end();
	};

	bpmCellRenderer.registerShape('cross', CrossShape);

	// Display
	function DisplayShape()
	{
		bpmActor.call(this);
	};
	bpmUtils.extend(DisplayShape, bpmActor);
	DisplayShape.prototype.size = 0.25;
	DisplayShape.prototype.redrawPath = function(c, x, y, w, h)
	{
		var dx = Math.min(w, h / 2);
		var s = Math.min(w - dx, Math.max(0, parseFloat(bpmUtils.getValue(this.style, 'size', this.size))) * w);
		
		c.moveTo(0, h / 2);
		c.lineTo(s, 0);
		c.lineTo(w - dx, 0);
		c.quadTo(w, 0, w, h / 2);
		c.quadTo(w, h, w - dx, h);
		c.lineTo(s, h);
		c.close();
		c.end();
	};

	bpmCellRenderer.registerShape('display', DisplayShape);
	
	// FilledEdge shape
	function FilledEdge()
	{
		bpmConnector.call(this);
	};
	bpmUtils.extend(FilledEdge, bpmConnector);
	
	FilledEdge.prototype.origPaintEdgeShape = FilledEdge.prototype.paintEdgeShape;
	FilledEdge.prototype.paintEdgeShape = function(c, pts, rounded)
	{
		// Markers modify incoming points array
		var temp = [];
		
		for (var i = 0; i < pts.length; i++)
		{
			temp.push(bpmUtils.clone(pts[i]));
		}
		
		// paintEdgeShape resets dashed to false
		var dashed = c.state.dashed;
		var fixDash = c.state.fixDash;
		FilledEdge.prototype.origPaintEdgeShape.apply(this, [c, temp, rounded]);

		if (c.state.strokeWidth >= 3)
		{
			var fillClr = bpmUtils.getValue(this.style, 'fillColor', null);
			
			if (fillClr != null)
			{
				c.setStrokeColor(fillClr);
				c.setStrokeWidth(c.state.strokeWidth - 2);
				c.setDashed(dashed, fixDash);
				
				FilledEdge.prototype.origPaintEdgeShape.apply(this, [c, pts, rounded]);
			}
		}
	};

	// Registers the link shape
	bpmCellRenderer.registerShape('filledEdge', FilledEdge);

	// Implements custom colors for shapes
	if (typeof StyleBpmSchemePanel !== 'undefined')
	{
		(function()
		{
			var styleBpmSchemePanelGetCustomColors = StyleBpmSchemePanel.prototype.getCustomColors;
			
			StyleBpmSchemePanel.prototype.getCustomColors = function()
			{
				var ss = this.format.getSelectionState();
				var result = styleBpmSchemePanelGetCustomColors.apply(this, arguments);
				
				if (ss.style.shape == 'umlFrame')
				{
					result.push({title: bpmResources.get('laneColor'), key: 'swimlaneFillColor', defaultValue: '#ffffff'});
				}
				
				return result;
			};
		})();
	}
	
	// Registers and defines the custom marker
	bpmMarker.addMarker('dash', function(c, shape, type, pe, unitX, unitY, size, source, sw, filled)
	{
		var nx = unitX * (size + sw + 1);
		var ny = unitY * (size + sw + 1);

		return function()
		{
			c.begin();
			c.moveTo(pe.x - nx / 2 - ny / 2, pe.y - ny / 2 + nx / 2);
			c.lineTo(pe.x + ny / 2 - 3 * nx / 2, pe.y - 3 * ny / 2 - nx / 2);
			c.stroke();
		};
	});

	// Registers and defines the custom marker
	bpmMarker.addMarker('cross', function(c, shape, type, pe, unitX, unitY, size, source, sw, filled)
	{
		var nx = unitX * (size + sw + 1);
		var ny = unitY * (size + sw + 1);

		return function()
		{
			c.begin();
			c.moveTo(pe.x - nx / 2 - ny / 2, pe.y - ny / 2 + nx / 2);
			c.lineTo(pe.x + ny / 2 - 3 * nx / 2, pe.y - 3 * ny / 2 - nx / 2);
			c.moveTo(pe.x - nx / 2 + ny / 2, pe.y - ny / 2 - nx / 2);
			c.lineTo(pe.x - ny / 2 - 3 * nx / 2, pe.y - 3 * ny / 2 + nx / 2);
			c.stroke();
		};
	});
	
	function circleMarker(c, shape, type, pe, unitX, unitY, size, source, sw, filled)
	{
		var a = size / 2;
		var size = size + sw;

		var pt = pe.clone();
		
		pe.x -= unitX * (2 * size + sw);
		pe.y -= unitY * (2 * size + sw);
		
		unitX = unitX * (size + sw);
		unitY = unitY * (size + sw);

		return function()
		{
			c.ellipse(pt.x - unitX - size, pt.y - unitY - size, 2 * size, 2 * size);
			
			if (filled)
			{
				c.fillAndStroke();
			}
			else
			{
				c.stroke();
			}
		};
	};
	
	bpmMarker.addMarker('circle', circleMarker);
	bpmMarker.addMarker('circlePlus', function(c, shape, type, pe, unitX, unitY, size, source, sw, filled)
	{
		var pt = pe.clone();
		var fn = circleMarker.apply(this, arguments);
		var nx = unitX * (size + 2 * sw); // (size + sw + 1);
		var ny = unitY * (size + 2 * sw); //(size + sw + 1);

		return function()
		{
			fn.apply(this, arguments);

			c.begin();
			c.moveTo(pt.x - unitX * (sw), pt.y - unitY * (sw));
			c.lineTo(pt.x - 2 * nx + unitX * (sw), pt.y - 2 * ny + unitY * (sw));
			c.moveTo(pt.x - nx - ny + unitY * sw, pt.y - ny + nx - unitX * sw);
			c.lineTo(pt.x + ny - nx - unitY * sw, pt.y - ny - nx + unitX * sw);
			c.stroke();
		};
	});
	
	bpmMarker.addMarker('async', function(c, shape, type, pe, unitX, unitY, size, source, sw, filled)
	{
		// The angle of the forward facing arrow sides against the x axis is
		// 26.565 degrees, 1/sin(26.565) = 2.236 / 2 = 1.118 ( / 2 allows for
		// only half the strokewidth is processed ).
		var endOffsetX = unitX * sw * 1.118;
		var endOffsetY = unitY * sw * 1.118;
		
		unitX = unitX * (size + sw);
		unitY = unitY * (size + sw);

		var pt = pe.clone();
		pt.x -= endOffsetX;
		pt.y -= endOffsetY;
		
		var f = 1;
		pe.x += -unitX * f - endOffsetX;
		pe.y += -unitY * f - endOffsetY;
		
		return function()
		{
			c.begin();
			c.moveTo(pt.x, pt.y);
			
			if (source)
			{
				c.lineTo(pt.x - unitX - unitY / 2, pt.y - unitY + unitX / 2);
			}
			else
			{
				c.lineTo(pt.x + unitY / 2 - unitX, pt.y - unitY - unitX / 2);
			}
			
			c.lineTo(pt.x - unitX, pt.y - unitY);
			c.close();

			if (filled)
			{
				c.fillAndStroke();
			}
			else
			{
				c.stroke();
			}
		};
	});
	
	function createOpenAsyncArrow(widthFactor)
	{
		widthFactor = (widthFactor != null) ? widthFactor : 2;
		
		return function(c, shape, type, pe, unitX, unitY, size, source, sw, filled)
		{
			unitX = unitX * (size + sw);
			unitY = unitY * (size + sw);
			
			var pt = pe.clone();

			return function()
			{
				c.begin();
				c.moveTo(pt.x, pt.y);
				
				if (source)
				{
					c.lineTo(pt.x - unitX - unitY / widthFactor, pt.y - unitY + unitX / widthFactor);
				}
				else
				{
					c.lineTo(pt.x + unitY / widthFactor - unitX, pt.y - unitY - unitX / widthFactor);
				}
				
				c.stroke();
			};
		}
	};
	
	bpmMarker.addMarker('openAsync', createOpenAsyncArrow(2));
	
	function arrow(canvas, shape, type, pe, unitX, unitY, size, source, sw, filled)
	{
		// The angle of the forward facing arrow sides against the x axis is
		// 26.565 degrees, 1/sin(26.565) = 2.236 / 2 = 1.118 ( / 2 allows for
		// only half the strokewidth is processed ).
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
	
	// Handlers are only added if bpmVertexHandler is defined (ie. not in embedded graph)
	if (typeof bpmVertexHandler !== 'undefined')
	{
		function createHandle(state, keys, getPositionFn, setPositionFn, ignoreGrid, redrawEdges)
		{
			var handle = new bpmHandle(state, null, bpmVertexHandler.prototype.secondaryHandleImage);
			
			handle.execute = function()
			{
				for (var i = 0; i < keys.length; i++)
				{	
					this.copyStyle(keys[i]);
				}
			};
			
			handle.getPosition = getPositionFn;
			handle.setPosition = setPositionFn;
			handle.ignoreGrid = (ignoreGrid != null) ? ignoreGrid : true;
			
			// Overridden to update connected edges
			if (redrawEdges)
			{
				var positionChanged = handle.positionChanged;
				
				handle.positionChanged = function()
				{
					positionChanged.apply(this, arguments);
					
					// Redraws connected edges TODO: Include child edges
					state.view.invalidate(this.state.cell);
					state.view.validate();
				};
			}
			
			return handle;
		};
		
		function createArcHandle(state, yOffset)
		{
			return createHandle(state, [bpmConstants.STYLE_ARCSIZE], function(bounds)
			{
				var tmp = (yOffset != null) ? yOffset : bounds.height / 8;
				
				if (bpmUtils.getValue(state.style, bpmConstants.STYLE_ABSOLUTE_ARCSIZE, 0) == '1')
				{
					var arcSize = bpmUtils.getValue(state.style, bpmConstants.STYLE_ARCSIZE, bpmConstants.LINE_ARCSIZE) / 2;
					
					return new bpmPoint(bounds.x + bounds.width - Math.min(bounds.width / 2, arcSize), bounds.y + tmp);
				}
				else
				{
					var arcSize = Math.max(0, parseFloat(bpmUtils.getValue(state.style,
						bpmConstants.STYLE_ARCSIZE, bpmConstants.RECTANGLE_ROUNDING_FACTOR * 100))) / 100;
					
					return new bpmPoint(bounds.x + bounds.width - Math.min(Math.max(bounds.width / 2, bounds.height / 2),
						Math.min(bounds.width, bounds.height) * arcSize), bounds.y + tmp);
				}
			}, function(bounds, pt, me)
			{
				if (bpmUtils.getValue(state.style, bpmConstants.STYLE_ABSOLUTE_ARCSIZE, 0) == '1')
				{
					this.state.style[bpmConstants.STYLE_ARCSIZE] = Math.round(Math.max(0, Math.min(bounds.width,
						(bounds.x + bounds.width - pt.x) * 2)));
				}
				else
				{
					var f = Math.min(50, Math.max(0, (bounds.width - pt.x + bounds.x) * 100 /
						Math.min(bounds.width, bounds.height)));
					this.state.style[bpmConstants.STYLE_ARCSIZE] = Math.round(f);
				}
			});
		}

		function createArcHandleFunction()
		{
			return function(state)
			{
				var handles = [];
				
				if (bpmUtils.getValue(state.style, bpmConstants.STYLE_ROUNDED, false))
				{
					handles.push(createArcHandle(state));
				}
				
				return handles;
			};
		};
		
		function createTrapezoidHandleFunction(max)
		{
			return function(state)
			{
				var handles = [createHandle(state, ['size'], function(bounds)
				{
					var size = Math.max(0, Math.min(max, parseFloat(bpmUtils.getValue(this.state.style, 'size', TrapezoidShape.prototype.size))));
				
					return new bpmPoint(bounds.x + size * bounds.width * 0.75, bounds.y + bounds.height / 4);
				}, function(bounds, pt)
				{
					this.state.style['size'] = Math.max(0, Math.min(max, (pt.x - bounds.x) / (bounds.width * 0.75)));
				}, null, true)];
				
				if (bpmUtils.getValue(state.style, bpmConstants.STYLE_ROUNDED, false))
				{
					handles.push(createArcHandle(state));
				}
				
				return handles;
			};
		};
		
		function createDisplayHandleFunction(defaultValue, allowArcHandle, max, redrawEdges, fixedDefaultValue)
		{
			max = (max != null) ? max : 1;
			
			return function(state)
			{
				var handles = [createHandle(state, ['size'], function(bounds)
				{
					var fixed = (fixedDefaultValue != null) ? bpmUtils.getValue(this.state.style, 'fixedSize', '0') != '0' : null;
					var size = parseFloat(bpmUtils.getValue(this.state.style, 'size', (fixed) ? fixedDefaultValue : defaultValue));
	
					return new bpmPoint(bounds.x + Math.max(0, Math.min(bounds.width, size * ((fixed) ? 1 : bounds.width))), bounds.getCenterY());
				}, function(bounds, pt, me)
				{
					var fixed = (fixedDefaultValue != null) ? bpmUtils.getValue(this.state.style, 'fixedSize', '0') != '0' : null;
					var size = (fixed) ? (pt.x - bounds.x) : Math.max(0, Math.min(max, (pt.x - bounds.x) / bounds.width));
					
					if (fixed && !bpmEvent.isAltDown(me.getEvent()))
					{
						size = state.view.graph.snap(size);
					}
					
					this.state.style['size'] = size;
				}, null, redrawEdges)];
				
				if (allowArcHandle && bpmUtils.getValue(state.style, bpmConstants.STYLE_ROUNDED, false))
				{
					handles.push(createArcHandle(state));
				}
				
				return handles;
			};
		};
		
		function createCubeHandleFunction(factor, defaultValue, allowArcHandle)
		{
			return function(state)
			{
				var handles = [createHandle(state, ['size'], function(bounds)
				{
					var size = Math.max(0, Math.min(bounds.width, Math.min(bounds.height, parseFloat(
						bpmUtils.getValue(this.state.style, 'size', defaultValue))))) * factor;
					
					return new bpmPoint(bounds.x + size, bounds.y + size);
				}, function(bounds, pt)
				{
					this.state.style['size'] = Math.round(Math.max(0, Math.min(Math.min(bounds.width, pt.x - bounds.x),
							Math.min(bounds.height, pt.y - bounds.y))) / factor);
				})];
				
				if (allowArcHandle && bpmUtils.getValue(state.style, bpmConstants.STYLE_ROUNDED, false))
				{
					handles.push(createArcHandle(state));
				}
				
				return handles;
			};
		};
		
		function createArrowHandleFunction(maxSize)
		{
			return function(state)
			{
				return [createHandle(state, ['arrowWidth', 'arrowSize'], function(bounds)
				{
					var aw = Math.max(0, Math.min(1, bpmUtils.getValue(this.state.style, 'arrowWidth', SingleArrowShape.prototype.arrowWidth)));
					var as = Math.max(0, Math.min(maxSize, bpmUtils.getValue(this.state.style, 'arrowSize', SingleArrowShape.prototype.arrowSize)));
					
					return new bpmPoint(bounds.x + (1 - as) * bounds.width, bounds.y + (1 - aw) * bounds.height / 2);
				}, function(bounds, pt)
				{
					this.state.style['arrowWidth'] = Math.max(0, Math.min(1, Math.abs(bounds.y + bounds.height / 2 - pt.y) / bounds.height * 2));
					this.state.style['arrowSize'] = Math.max(0, Math.min(maxSize, (bounds.x + bounds.width - pt.x) / (bounds.width)));
				})];
			};
		};
		
		function createEdgeHandle(state, keys, start, getPosition, setPosition)
		{
			return createHandle(state, keys, function(bounds)
			{
				var pts = state.absolutePoints;
				var n = pts.length - 1;
				
				var tr = state.view.translate;
				var s = state.view.scale;
				
				var p0 = (start) ? pts[0] : pts[n];
				var p1 = (start) ? pts[1] : pts[n - 1];
				var dx = (start) ? p1.x - p0.x : p1.x - p0.x;
				var dy = (start) ? p1.y - p0.y : p1.y - p0.y;

				var dist = Math.sqrt(dx * dx + dy * dy);
				
				var pt = getPosition.call(this, dist, dx / dist, dy / dist, p0, p1);
				
				return new bpmPoint(pt.x / s - tr.x, pt.y / s - tr.y);
			}, function(bounds, pt, me)
			{
				var pts = state.absolutePoints;
				var n = pts.length - 1;
				
				var tr = state.view.translate;
				var s = state.view.scale;
				
				var p0 = (start) ? pts[0] : pts[n];
				var p1 = (start) ? pts[1] : pts[n - 1];
				var dx = (start) ? p1.x - p0.x : p1.x - p0.x;
				var dy = (start) ? p1.y - p0.y : p1.y - p0.y;

				var dist = Math.sqrt(dx * dx + dy * dy);
				pt.x = (pt.x + tr.x) * s;
				pt.y = (pt.y + tr.y) * s;

				setPosition.call(this, dist, dx / dist, dy / dist, p0, p1, pt, me);
			});
		};
		
		function createEdgeWidthHandle(state, start, spacing)
		{
			return createEdgeHandle(state, ['width'], start, function(dist, nx, ny, p0, p1)
			{
				var w = state.shape.getEdgeWidth() * state.view.scale + spacing;

				return new bpmPoint(p0.x + nx * dist / 4 + ny * w / 2, p0.y + ny * dist / 4 - nx * w / 2);
			}, function(dist, nx, ny, p0, p1, pt)
			{
				var w = Math.sqrt(bpmUtils.ptSegDistSq(p0.x, p0.y, p1.x, p1.y, pt.x, pt.y));					
				state.style['width'] = Math.round(w * 2) / state.view.scale - spacing;
			});
		};
		
		function ptLineDistance(x1, y1, x2, y2, x0, y0)
		{
			return Math.abs((y2 - y1) * x0 - (x2 - x1) * y0 + x2 * y1 - y2 * x1) / Math.sqrt((y2 - y1) * (y2 - y1) + (x2 - x1) * (x2 - x1));
		}

		var handleFactory = {
			'link': function(state)
			{
				var spacing = 10;

				return [createEdgeWidthHandle(state, true, spacing), createEdgeWidthHandle(state, false, spacing)];
			},
			'flexArrow': function(state)
			{
				// Do not use state.shape.startSize/endSize since it is cached
				var tol = state.view.graph.gridSize / state.view.scale;
				var handles = [];
				
				if (bpmUtils.getValue(state.style, bpmConstants.STYLE_STARTARROW, bpmConstants.NONE) != bpmConstants.NONE)
				{
					handles.push(createEdgeHandle(state, ['width', bpmConstants.STYLE_STARTSIZE, bpmConstants.STYLE_ENDSIZE], true, function(dist, nx, ny, p0, p1)
					{
						var w = (state.shape.getEdgeWidth() - state.shape.strokewidth) * state.view.scale;
						var l = bpmUtils.getNumber(state.style, bpmConstants.STYLE_STARTSIZE, bpmConstants.ARROW_SIZE / 5) * 3 * state.view.scale;
						
						return new bpmPoint(p0.x + nx * (l + state.shape.strokewidth * state.view.scale) + ny * w / 2,
							p0.y + ny * (l + state.shape.strokewidth * state.view.scale) - nx * w / 2);
					}, function(dist, nx, ny, p0, p1, pt, me)
					{
						var w = Math.sqrt(bpmUtils.ptSegDistSq(p0.x, p0.y, p1.x, p1.y, pt.x, pt.y));
						var l = bpmUtils.ptLineDist(p0.x, p0.y, p0.x + ny, p0.y - nx, pt.x, pt.y);
						
						state.style[bpmConstants.STYLE_STARTSIZE] = Math.round((l - state.shape.strokewidth) * 100 / 3) / 100 / state.view.scale;
						state.style['width'] = Math.round(w * 2) / state.view.scale;
						
						// Applies to opposite side
						if (bpmEvent.isControlDown(me.getEvent()))
						{
							state.style[bpmConstants.STYLE_ENDSIZE] = state.style[bpmConstants.STYLE_STARTSIZE];
						}

						// Snaps to end geometry
						if (!bpmEvent.isAltDown(me.getEvent()))
						{
							if (Math.abs(parseFloat(state.style[bpmConstants.STYLE_STARTSIZE]) - parseFloat(state.style[bpmConstants.STYLE_ENDSIZE])) < tol / 6)
							{
								state.style[bpmConstants.STYLE_STARTSIZE] = state.style[bpmConstants.STYLE_ENDSIZE];
							}
						}
					}));
					
					handles.push(createEdgeHandle(state, ['startWidth', 'endWidth', bpmConstants.STYLE_STARTSIZE, bpmConstants.STYLE_ENDSIZE], true, function(dist, nx, ny, p0, p1)
					{
						var w = (state.shape.getStartArrowWidth() - state.shape.strokewidth) * state.view.scale;
						var l = bpmUtils.getNumber(state.style, bpmConstants.STYLE_STARTSIZE, bpmConstants.ARROW_SIZE / 5) * 3 * state.view.scale;
						
						return new bpmPoint(p0.x + nx * (l + state.shape.strokewidth * state.view.scale) + ny * w / 2,
							p0.y + ny * (l + state.shape.strokewidth * state.view.scale) - nx * w / 2);
					}, function(dist, nx, ny, p0, p1, pt, me)
					{
						var w = Math.sqrt(bpmUtils.ptSegDistSq(p0.x, p0.y, p1.x, p1.y, pt.x, pt.y));
						var l = bpmUtils.ptLineDist(p0.x, p0.y, p0.x + ny, p0.y - nx, pt.x, pt.y);
						
						state.style[bpmConstants.STYLE_STARTSIZE] = Math.round((l - state.shape.strokewidth) * 100 / 3) / 100 / state.view.scale;
						state.style['startWidth'] = Math.max(0, Math.round(w * 2) - state.shape.getEdgeWidth()) / state.view.scale;
						
						// Applies to opposite side
						if (bpmEvent.isControlDown(me.getEvent()))
						{
							state.style[bpmConstants.STYLE_ENDSIZE] = state.style[bpmConstants.STYLE_STARTSIZE];
							state.style['endWidth'] = state.style['startWidth'];
						}
						
						// Snaps to endWidth
						if (!bpmEvent.isAltDown(me.getEvent()))
						{
							if (Math.abs(parseFloat(state.style[bpmConstants.STYLE_STARTSIZE]) - parseFloat(state.style[bpmConstants.STYLE_ENDSIZE])) < tol / 6)
							{
								state.style[bpmConstants.STYLE_STARTSIZE] = state.style[bpmConstants.STYLE_ENDSIZE];
							}
							
							if (Math.abs(parseFloat(state.style['startWidth']) - parseFloat(state.style['endWidth'])) < tol)
							{
								state.style['startWidth'] = state.style['endWidth'];
							}
						}
					}));
				}
				
				if (bpmUtils.getValue(state.style, bpmConstants.STYLE_ENDARROW, bpmConstants.NONE) != bpmConstants.NONE)
				{
					handles.push(createEdgeHandle(state, ['width', bpmConstants.STYLE_STARTSIZE, bpmConstants.STYLE_ENDSIZE], false, function(dist, nx, ny, p0, p1)
					{
						var w = (state.shape.getEdgeWidth() - state.shape.strokewidth) * state.view.scale;
						var l = bpmUtils.getNumber(state.style, bpmConstants.STYLE_ENDSIZE, bpmConstants.ARROW_SIZE / 5) * 3 * state.view.scale;
						
						return new bpmPoint(p0.x + nx * (l + state.shape.strokewidth * state.view.scale) - ny * w / 2,
							p0.y + ny * (l + state.shape.strokewidth * state.view.scale) + nx * w / 2);
					}, function(dist, nx, ny, p0, p1, pt, me)
					{
						var w = Math.sqrt(bpmUtils.ptSegDistSq(p0.x, p0.y, p1.x, p1.y, pt.x, pt.y));
						var l = bpmUtils.ptLineDist(p0.x, p0.y, p0.x + ny, p0.y - nx, pt.x, pt.y);
						
						state.style[bpmConstants.STYLE_ENDSIZE] = Math.round((l - state.shape.strokewidth) * 100 / 3) / 100 / state.view.scale;
						state.style['width'] = Math.round(w * 2) / state.view.scale;
						
						// Applies to opposite side
						if (bpmEvent.isControlDown(me.getEvent()))
						{
							state.style[bpmConstants.STYLE_STARTSIZE] = state.style[bpmConstants.STYLE_ENDSIZE];
						}
					
						// Snaps to start geometry
						if (!bpmEvent.isAltDown(me.getEvent()))
						{
							if (Math.abs(parseFloat(state.style[bpmConstants.STYLE_ENDSIZE]) - parseFloat(state.style[bpmConstants.STYLE_STARTSIZE])) < tol / 6)
							{
								state.style[bpmConstants.STYLE_ENDSIZE] = state.style[bpmConstants.STYLE_STARTSIZE];
							}
						}
					}));
					
					handles.push(createEdgeHandle(state, ['startWidth', 'endWidth', bpmConstants.STYLE_STARTSIZE, bpmConstants.STYLE_ENDSIZE], false, function(dist, nx, ny, p0, p1)
					{
						var w = (state.shape.getEndArrowWidth() - state.shape.strokewidth) * state.view.scale;
						var l = bpmUtils.getNumber(state.style, bpmConstants.STYLE_ENDSIZE, bpmConstants.ARROW_SIZE / 5) * 3 * state.view.scale;
						
						return new bpmPoint(p0.x + nx * (l + state.shape.strokewidth * state.view.scale) - ny * w / 2,
							p0.y + ny * (l + state.shape.strokewidth * state.view.scale) + nx * w / 2);
					}, function(dist, nx, ny, p0, p1, pt, me)
					{
						var w = Math.sqrt(bpmUtils.ptSegDistSq(p0.x, p0.y, p1.x, p1.y, pt.x, pt.y));
						var l = bpmUtils.ptLineDist(p0.x, p0.y, p0.x + ny, p0.y - nx, pt.x, pt.y);
						
						state.style[bpmConstants.STYLE_ENDSIZE] = Math.round((l - state.shape.strokewidth) * 100 / 3) / 100 / state.view.scale;
						state.style['endWidth'] = Math.max(0, Math.round(w * 2) - state.shape.getEdgeWidth()) / state.view.scale;
						
						// Applies to opposite side
						if (bpmEvent.isControlDown(me.getEvent()))
						{
							state.style[bpmConstants.STYLE_STARTSIZE] = state.style[bpmConstants.STYLE_ENDSIZE];
							state.style['startWidth'] = state.style['endWidth'];
						}
					
						// Snaps to start geometry
						if (!bpmEvent.isAltDown(me.getEvent()))
						{
							if (Math.abs(parseFloat(state.style[bpmConstants.STYLE_ENDSIZE]) - parseFloat(state.style[bpmConstants.STYLE_STARTSIZE])) < tol / 6)
							{
								state.style[bpmConstants.STYLE_ENDSIZE] = state.style[bpmConstants.STYLE_STARTSIZE];
							}
							
							if (Math.abs(parseFloat(state.style['endWidth']) - parseFloat(state.style['startWidth'])) < tol)
							{
								state.style['endWidth'] = state.style['startWidth'];
							}
						}
					}));
				}
				
				return handles;
			},
			'swimlane': function(state)
			{
				var handles = [createHandle(state, [bpmConstants.STYLE_STARTSIZE], function(bounds)
				{
					var size = parseFloat(bpmUtils.getValue(state.style, bpmConstants.STYLE_STARTSIZE, bpmConstants.DEFAULT_STARTSIZE));
					
					if (bpmUtils.getValue(state.style, bpmConstants.STYLE_HORIZONTAL, 1) == 1)
					{
						return new bpmPoint(bounds.getCenterX(), bounds.y + Math.max(0, Math.min(bounds.height, size)));
					}
					else
					{
						return new bpmPoint(bounds.x + Math.max(0, Math.min(bounds.width, size)), bounds.getCenterY());
					}
				}, function(bounds, pt)
				{	
					state.style[bpmConstants.STYLE_STARTSIZE] =
						(bpmUtils.getValue(this.state.style, bpmConstants.STYLE_HORIZONTAL, 1) == 1) ?
							Math.round(Math.max(0, Math.min(bounds.height, pt.y - bounds.y))) :
							Math.round(Math.max(0, Math.min(bounds.width, pt.x - bounds.x)));
				})];
				
				if (bpmUtils.getValue(state.style, bpmConstants.STYLE_ROUNDED))
				{
					var size = parseFloat(bpmUtils.getValue(state.style, bpmConstants.STYLE_STARTSIZE, bpmConstants.DEFAULT_STARTSIZE));
					handles.push(createArcHandle(state, size / 2));
				}
				
				return handles;
			},
			'label': createArcHandleFunction(),
			'ext': createArcHandleFunction(),
			'rectangle': createArcHandleFunction(),
			'triangle': createArcHandleFunction(),
			'rhombus': createArcHandleFunction(),
			'umlLifeline': function(state)
			{
				return [createHandle(state, ['size'], function(bounds)
				{
					var size = Math.max(0, Math.min(bounds.height, parseFloat(bpmUtils.getValue(this.state.style, 'size', UmlLifeline.prototype.size))));
					
					return new bpmPoint(bounds.getCenterX(), bounds.y + size);
				}, function(bounds, pt)
				{	
					this.state.style['size'] = Math.round(Math.max(0, Math.min(bounds.height, pt.y - bounds.y)));
				}, false)];
			},
			'umlFrame': function(state)
			{
				var handles = [createHandle(state, ['width', 'height'], function(bounds)
				{
					var w0 = Math.max(UmlFrame.prototype.corner, Math.min(bounds.width, bpmUtils.getValue(this.state.style, 'width', UmlFrame.prototype.width)));
					var h0 = Math.max(UmlFrame.prototype.corner * 1.5, Math.min(bounds.height, bpmUtils.getValue(this.state.style, 'height', UmlFrame.prototype.height)));

					return new bpmPoint(bounds.x + w0, bounds.y + h0);
				}, function(bounds, pt)
				{
					this.state.style['width'] = Math.round(Math.max(UmlFrame.prototype.corner, Math.min(bounds.width, pt.x - bounds.x)));
					this.state.style['height'] = Math.round(Math.max(UmlFrame.prototype.corner * 1.5, Math.min(bounds.height, pt.y - bounds.y)));
				}, false)];
				
				return handles;
			},
			'process': function(state)
			{
				var handles = [createHandle(state, ['size'], function(bounds)
				{
					var size = Math.max(0, Math.min(0.5, parseFloat(bpmUtils.getValue(this.state.style, 'size', ProcessShape.prototype.size))));

					return new bpmPoint(bounds.x + bounds.width * size, bounds.y + bounds.height / 4);
				}, function(bounds, pt)
				{
					this.state.style['size'] = Math.max(0, Math.min(0.5, (pt.x - bounds.x) / bounds.width));
				})];
				
				if (bpmUtils.getValue(state.style, bpmConstants.STYLE_ROUNDED, false))
				{
					handles.push(createArcHandle(state));
				}
				
				return handles;
			},
			'cross': function(state)
			{
				return [createHandle(state, ['size'], function(bounds)
				{
					var m = Math.min(bounds.width, bounds.height);
					var size = Math.max(0, Math.min(1, bpmUtils.getValue(this.state.style, 'size', CrossShape.prototype.size))) * m / 2;

					return new bpmPoint(bounds.getCenterX() - size, bounds.getCenterY() - size);
				}, function(bounds, pt)
				{
					var m = Math.min(bounds.width, bounds.height);
					this.state.style['size'] = Math.max(0, Math.min(1, Math.min((Math.max(0, bounds.getCenterY() - pt.y) / m) * 2,
							(Math.max(0, bounds.getCenterX() - pt.x) / m) * 2)));
				})];
			},
			'note': function(state)
			{
				return [createHandle(state, ['size'], function(bounds)
				{
					var size = Math.max(0, Math.min(bounds.width, Math.min(bounds.height, parseFloat(
						bpmUtils.getValue(this.state.style, 'size', NoteShape.prototype.size)))));
					
					return new bpmPoint(bounds.x + bounds.width - size, bounds.y + size);
				}, function(bounds, pt)
				{
					this.state.style['size'] = Math.round(Math.max(0, Math.min(Math.min(bounds.width, bounds.x + bounds.width - pt.x),
							Math.min(bounds.height, pt.y - bounds.y))));
				})];
			},
			'manualInput': function(state)
			{
				var handles = [createHandle(state, ['size'], function(bounds)
				{
					var size = Math.max(0, Math.min(bounds.height, bpmUtils.getValue(this.state.style, 'size', ManualInputShape.prototype.size)));
					
					return new bpmPoint(bounds.x + bounds.width / 4, bounds.y + size * 3 / 4);
				}, function(bounds, pt)
				{
					this.state.style['size'] = Math.round(Math.max(0, Math.min(bounds.height, (pt.y - bounds.y) * 4 / 3)));
				})];
				
				if (bpmUtils.getValue(state.style, bpmConstants.STYLE_ROUNDED, false))
				{
					handles.push(createArcHandle(state));
				}
				
				return handles;
			},
			'dataStorage': function(state)
			{
				return [createHandle(state, ['size'], function(bounds)
				{
					var size = Math.max(0, Math.min(1, parseFloat(bpmUtils.getValue(this.state.style, 'size', DataStorageShape.prototype.size))));

					return new bpmPoint(bounds.x + (1 - size) * bounds.width, bounds.getCenterY());
				}, function(bounds, pt)
				{
					this.state.style['size'] = Math.max(0, Math.min(1, (bounds.x + bounds.width - pt.x) / bounds.width));
				})];
			},
			'callout': function(state)
			{
				var handles = [createHandle(state, ['size', 'position'], function(bounds)
				{
					var size = Math.max(0, Math.min(bounds.height, bpmUtils.getValue(this.state.style, 'size', CalloutShape.prototype.size)));
					var position = Math.max(0, Math.min(1, bpmUtils.getValue(this.state.style, 'position', CalloutShape.prototype.position)));
					var base = Math.max(0, Math.min(bounds.width, bpmUtils.getValue(this.state.style, 'base', CalloutShape.prototype.base)));
					
					return new bpmPoint(bounds.x + position * bounds.width, bounds.y + bounds.height - size);
				}, function(bounds, pt)
				{
					var base = Math.max(0, Math.min(bounds.width, bpmUtils.getValue(this.state.style, 'base', CalloutShape.prototype.base)));
					this.state.style['size'] = Math.round(Math.max(0, Math.min(bounds.height, bounds.y + bounds.height - pt.y)));
					this.state.style['position'] = Math.round(Math.max(0, Math.min(1, (pt.x - bounds.x) / bounds.width)) * 100) / 100;
				}), createHandle(state, ['position2'], function(bounds)
				{
					var position2 = Math.max(0, Math.min(1, bpmUtils.getValue(this.state.style, 'position2', CalloutShape.prototype.position2)));

					return new bpmPoint(bounds.x + position2 * bounds.width, bounds.y + bounds.height);
				}, function(bounds, pt)
				{
					this.state.style['position2'] = Math.round(Math.max(0, Math.min(1, (pt.x - bounds.x) / bounds.width)) * 100) / 100;
				}), createHandle(state, ['base'], function(bounds)
				{
					var size = Math.max(0, Math.min(bounds.height, bpmUtils.getValue(this.state.style, 'size', CalloutShape.prototype.size)));
					var position = Math.max(0, Math.min(1, bpmUtils.getValue(this.state.style, 'position', CalloutShape.prototype.position)));
					var base = Math.max(0, Math.min(bounds.width, bpmUtils.getValue(this.state.style, 'base', CalloutShape.prototype.base)));
					
					return new bpmPoint(bounds.x + Math.min(bounds.width, position * bounds.width + base), bounds.y + bounds.height - size);
				}, function(bounds, pt)
				{
					var position = Math.max(0, Math.min(1, bpmUtils.getValue(this.state.style, 'position', CalloutShape.prototype.position)));

					this.state.style['base'] = Math.round(Math.max(0, Math.min(bounds.width, pt.x - bounds.x - position * bounds.width)));
				})];
				
				if (bpmUtils.getValue(state.style, bpmConstants.STYLE_ROUNDED, false))
				{
					handles.push(createArcHandle(state));
				}
				
				return handles;
			},
			'internalStorage': function(state)
			{
				var handles = [createHandle(state, ['dx', 'dy'], function(bounds)
				{
					var dx = Math.max(0, Math.min(bounds.width, bpmUtils.getValue(this.state.style, 'dx', InternalStorageShape.prototype.dx)));
					var dy = Math.max(0, Math.min(bounds.height, bpmUtils.getValue(this.state.style, 'dy', InternalStorageShape.prototype.dy)));

					return new bpmPoint(bounds.x + dx, bounds.y + dy);
				}, function(bounds, pt)
				{
					this.state.style['dx'] = Math.round(Math.max(0, Math.min(bounds.width, pt.x - bounds.x)));
					this.state.style['dy'] = Math.round(Math.max(0, Math.min(bounds.height, pt.y - bounds.y)));
				})];
				
				if (bpmUtils.getValue(state.style, bpmConstants.STYLE_ROUNDED, false))
				{
					handles.push(createArcHandle(state));
				}
				
				return handles;
			},
			'corner': function(state)
			{
				return [createHandle(state, ['dx', 'dy'], function(bounds)
				{
					var dx = Math.max(0, Math.min(bounds.width, bpmUtils.getValue(this.state.style, 'dx', CornerShape.prototype.dx)));
					var dy = Math.max(0, Math.min(bounds.height, bpmUtils.getValue(this.state.style, 'dy', CornerShape.prototype.dy)));

					return new bpmPoint(bounds.x + dx, bounds.y + dy);
				}, function(bounds, pt)
				{
					this.state.style['dx'] = Math.round(Math.max(0, Math.min(bounds.width, pt.x - bounds.x)));
					this.state.style['dy'] = Math.round(Math.max(0, Math.min(bounds.height, pt.y - bounds.y)));
				})];
			},
			'tee': function(state)
			{
				return [createHandle(state, ['dx', 'dy'], function(bounds)
				{
					var dx = Math.max(0, Math.min(bounds.width, bpmUtils.getValue(this.state.style, 'dx', TeeShape.prototype.dx)));
					var dy = Math.max(0, Math.min(bounds.height, bpmUtils.getValue(this.state.style, 'dy', TeeShape.prototype.dy)));

					return new bpmPoint(bounds.x + (bounds.width + dx) / 2, bounds.y + dy);
				}, function(bounds, pt)
				{
					this.state.style['dx'] = Math.round(Math.max(0, Math.min(bounds.width / 2, (pt.x - bounds.x - bounds.width / 2)) * 2));
					this.state.style['dy'] = Math.round(Math.max(0, Math.min(bounds.height, pt.y - bounds.y)));
				})];
			},
			'singleArrow': createArrowHandleFunction(1),
			'doubleArrow': createArrowHandleFunction(0.5),			
			'folder': function(state)
			{
				return [createHandle(state, ['tabWidth', 'tabHeight'], function(bounds)
				{
					var tw = Math.max(0, Math.min(bounds.width, bpmUtils.getValue(this.state.style, 'tabWidth', FolderShape.prototype.tabWidth)));
					var th = Math.max(0, Math.min(bounds.height, bpmUtils.getValue(this.state.style, 'tabHeight', FolderShape.prototype.tabHeight)));
					
					if (bpmUtils.getValue(this.state.style, 'tabPosition', FolderShape.prototype.tabPosition) == bpmConstants.ALIGN_RIGHT)
					{
						tw = bounds.width - tw;
					}
					
					return new bpmPoint(bounds.x + tw, bounds.y + th);
				}, function(bounds, pt)
				{
					var tw = Math.max(0, Math.min(bounds.width, pt.x - bounds.x));
					
					if (bpmUtils.getValue(this.state.style, 'tabPosition', FolderShape.prototype.tabPosition) == bpmConstants.ALIGN_RIGHT)
					{
						tw = bounds.width - tw;
					}
					
					this.state.style['tabWidth'] = Math.round(tw);
					this.state.style['tabHeight'] = Math.round(Math.max(0, Math.min(bounds.height, pt.y - bounds.y)));
				})];
			},
			'document': function(state)
			{
				return [createHandle(state, ['size'], function(bounds)
				{
					var size = Math.max(0, Math.min(1, parseFloat(bpmUtils.getValue(this.state.style, 'size', DocumentShape.prototype.size))));

					return new bpmPoint(bounds.x + 3 * bounds.width / 4, bounds.y + (1 - size) * bounds.height);
				}, function(bounds, pt)
				{
					this.state.style['size'] = Math.max(0, Math.min(1, (bounds.y + bounds.height - pt.y) / bounds.height));
				})];
			},
			'tape': function(state)
			{
				return [createHandle(state, ['size'], function(bounds)
				{
					var size = Math.max(0, Math.min(1, parseFloat(bpmUtils.getValue(this.state.style, 'size', TapeShape.prototype.size))));

					return new bpmPoint(bounds.getCenterX(), bounds.y + size * bounds.height / 2);
				}, function(bounds, pt)
				{
					this.state.style['size'] = Math.max(0, Math.min(1, ((pt.y - bounds.y) / bounds.height) * 2));
				})];
			},
			'offPageConnector': function(state)
			{
				return [createHandle(state, ['size'], function(bounds)
				{
					var size = Math.max(0, Math.min(1, parseFloat(bpmUtils.getValue(this.state.style, 'size', OffPageConnectorShape.prototype.size))));

					return new bpmPoint(bounds.getCenterX(), bounds.y + (1 - size) * bounds.height);
				}, function(bounds, pt)
				{
					this.state.style['size'] = Math.max(0, Math.min(1, (bounds.y + bounds.height - pt.y) / bounds.height));
				})];
			},
			'step': createDisplayHandleFunction(StepShape.prototype.size, true, null, true, StepShape.prototype.fixedSize),
			'hexagon': createDisplayHandleFunction(HexagonShape.prototype.size, true, 0.5, true),
			'curlyBracket': createDisplayHandleFunction(CurlyBracketShape.prototype.size, false),
			'display': createDisplayHandleFunction(DisplayShape.prototype.size, false),
			'cube': createCubeHandleFunction(1, CubeShape.prototype.size, false),
			'card': createCubeHandleFunction(0.5, CardShape.prototype.size, true),
			'loopLimit': createCubeHandleFunction(0.5, LoopLimitShape.prototype.size, true),
			'trapezoid': createTrapezoidHandleFunction(0.5),
			'parallelogram': createTrapezoidHandleFunction(1)
		};
		
		// Exposes custom handles
		Draw.createHandle = createHandle;
		Draw.handleFactory = handleFactory;

		bpmVertexHandler.prototype.createCustomHandles = function()
		{
			// Not rotatable means locked
			if (this.state.view.graph.getSelectionCount() == 1)
			{
				if (this.graph.isCellRotatable(this.state.cell))
				// LATER: Make locked state independent of rotatable flag, fix toggle if default is false
				//if (this.graph.isCellResizable(this.state.cell) || this.graph.isCellMovable(this.state.cell))
				{
					var name = this.state.style['shape'];

					if (bpmCellRenderer.defaultShapes[name] == null &&
						bpmStencilRegistry.getStencil(name) == null)
					{
						name = bpmConstants.SHAPE_RECTANGLE;
					}
					
					var fn = handleFactory[name];
					
					if (fn == null && this.state.shape != null && this.state.shape.isRoundable())
					{
						fn = handleFactory[bpmConstants.SHAPE_RECTANGLE];
					}
				
					if (fn != null)
					{
						return fn(this.state);
					}
				}
			}
			
			return null;
		};
		
		bpmEdgeHandler.prototype.createCustomHandles = function()
		{
			if (this.state.view.graph.getSelectionCount() == 1)
			{
				var name = this.state.style['shape'];
				
				if (bpmCellRenderer.defaultShapes[name] == null &&
					bpmStencilRegistry.getStencil(name) == null)
				{
					name = bpmConstants.SHAPE_CONNECTOR;
				}
				
				var fn = handleFactory[name];
				
				if (fn != null)
				{
					return fn(this.state);
				}
			}
			
			return null;
		}
	}
	else
	{
		// Dummy entries to avoid NPE in embed mode
		Draw.createHandle = function() {};
		Draw.handleFactory = {};
	}
	 
	 var isoHVector = new bpmPoint(1, 0);
	 var isoVVector = new bpmPoint(1, 0);
		
	 var alpha1 = bpmUtils.toRadians(-30);
		
	 var cos1 = Math.cos(alpha1);
	 var sin1 = Math.sin(alpha1);

	 isoHVector = bpmUtils.getRotatedPoint(isoHVector, cos1, sin1);

	 var alpha2 = bpmUtils.toRadians(-150);
	 
	 var cos2 = Math.cos(alpha2);
	 var sin2 = Math.sin(alpha2);

	 isoVVector = bpmUtils.getRotatedPoint(isoVVector, cos2, sin2);
	
	 bpmEdgeStyle.IsometricConnector = function (state, source, target, points, result)
	 {
		var view = state.view;
		var pt = (points != null && points.length > 0) ? points[0] : null;
		var pts = state.absolutePoints;
		var p0 = pts[0];
		var pe = pts[pts.length-1];
		
		if (pt != null)
		{
			pt = view.transformControlPoint(state, pt);
		}
		
		if (p0 == null)
		{
			if (source != null)
			{
				p0 = new bpmPoint(source.getCenterX(), source.getCenterY());
			}
		}
		
		if (pe == null)
		{
			if (target != null)
			{
				pe = new bpmPoint(target.getCenterX(), target.getCenterY());
			}
		}		
		
		var a1 = isoHVector.x;
		var a2 = isoHVector.y;
		
		var b1 = isoVVector.x;
		var b2 = isoVVector.y;
		
		var elbow = bpmUtils.getValue(state.style, 'elbow', 'horizontal') == 'horizontal';
		
		if (pe != null && p0 != null)
		{
			var last = p0;
			
			function isoLineTo(x, y, ignoreFirst)
			{
				var c1 = x - last.x;
				var c2 = y - last.y;

				// Solves for isometric base vectors
				var h = (b2 * c1 - b1 * c2) / (a1 * b2 - a2 * b1);
				var v = (a2 * c1 - a1 * c2) / (a2 * b1 - a1 * b2);
				
				if (elbow)
				{
					if (ignoreFirst)
					{
						last = new bpmPoint(last.x + a1 * h, last.y + a2 * h);
						result.push(last);
					}
	
					last = new bpmPoint(last.x + b1 * v, last.y + b2 * v);
					result.push(last);
				}
				else
				{
					if (ignoreFirst)
					{
						last = new bpmPoint(last.x + b1 * v, last.y + b2 * v);
						result.push(last);
					}

					last = new bpmPoint(last.x + a1 * h, last.y + a2 * h);
					result.push(last);
				}
			};

			if (pt == null)
			{
				pt = new bpmPoint(p0.x + (pe.x - p0.x) / 2, p0.y + (pe.y - p0.y) / 2);
			}
			
			isoLineTo(pt.x, pt.y, true);
			isoLineTo(pe.x, pe.y, false);
		}
	 };

	 bpmStyleRegistry.putValue('isometricEdgeStyle', bpmEdgeStyle.IsometricConnector);
	
	 var graphCreateEdgeHandler = Draw.prototype.createEdgeHandler;
	 Draw.prototype.createEdgeHandler = function(state, edgeStyle)
	 {
	 	if (edgeStyle == bpmEdgeStyle.IsometricConnector)
	 	{
	 		var handler = new bpmElbowEdgeHandler(state);
	 		handler.snapToTerminals = false;
	 		
	 		return handler;
	 	}
	 	
	 	return graphCreateEdgeHandler.apply(this, arguments);
	 };

	// Defines connection points for all shapes
	IsoRectangleShape.prototype.constraints = [];
	
	IsoCubeShape.prototype.getConstraints = function(style, w, h)
	{
		var constr = [];
		var tan30 = Math.tan(bpmUtils.toRadians(30));
		var tan30Dx = (0.5 - tan30) / 2;
		var m = Math.min(w, h / (0.5 + tan30));
		var dx = (w - m) / 2;
		var dy = (h - m) / 2;

		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, dx, dy + 0.25 * m));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, dx + 0.5 * m, dy + m * tan30Dx));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, dx + m, dy + 0.25 * m));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, dx + m, dy + 0.75 * m));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, dx + 0.5 * m, dy + (1 - tan30Dx) * m));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, dx, dy + 0.75 * m));

		return (constr);
	};

	CalloutShape.prototype.getConstraints = function(style, w, h)
	{
		var constr = [];
		var arcSize = bpmUtils.getValue(this.style, bpmConstants.STYLE_ARCSIZE, bpmConstants.LINE_ARCSIZE) / 2;
		var s = Math.max(0, Math.min(h, parseFloat(bpmUtils.getValue(this.style, 'size', this.size))));
		var dx = w * Math.max(0, Math.min(1, parseFloat(bpmUtils.getValue(this.style, 'position', this.position))));
		var dx2 = w * Math.max(0, Math.min(1, parseFloat(bpmUtils.getValue(this.style, 'position2', this.position2))));
		var base = Math.max(0, Math.min(w, parseFloat(bpmUtils.getValue(this.style, 'base', this.base))));
		
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0.25, 0), false));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0.5, 0), false));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0.75, 0), false));
		constr.push(new bpmConnectionConstraint(new bpmPoint(1, 0), false));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, w, (h - s) * 0.5));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, w, h - s));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, dx2, h));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, 0, h - s));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, 0, (h - s) * 0.5));
		
		if (w >= s * 2)
		{
			constr.push(new bpmConnectionConstraint(new bpmPoint(0.5, 0), false));
		}

		return (constr);
	};
	
	bpmRectangleShape.prototype.constraints = [new bpmConnectionConstraint(new bpmPoint(0.25, 0), true),
	                                          new bpmConnectionConstraint(new bpmPoint(0.5, 0), true),
	                                          new bpmConnectionConstraint(new bpmPoint(0.75, 0), true),
	        	              		 new bpmConnectionConstraint(new bpmPoint(0, 0.25), true),
	        	              		 new bpmConnectionConstraint(new bpmPoint(0, 0.5), true),
	        	              		 new bpmConnectionConstraint(new bpmPoint(0, 0.75), true),
	        	            		 new bpmConnectionConstraint(new bpmPoint(1, 0.25), true),
	        	            		 new bpmConnectionConstraint(new bpmPoint(1, 0.5), true),
	        	            		 new bpmConnectionConstraint(new bpmPoint(1, 0.75), true),
	        	            		 new bpmConnectionConstraint(new bpmPoint(0.25, 1), true),
	        	            		 new bpmConnectionConstraint(new bpmPoint(0.5, 1), true),
	        	            		 new bpmConnectionConstraint(new bpmPoint(0.75, 1), true)];
	bpmEllipse.prototype.constraints = [new bpmConnectionConstraint(new bpmPoint(0, 0), true), new bpmConnectionConstraint(new bpmPoint(1, 0), true),
	                                   new bpmConnectionConstraint(new bpmPoint(0, 1), true), new bpmConnectionConstraint(new bpmPoint(1, 1), true),
	                                   new bpmConnectionConstraint(new bpmPoint(0.5, 0), true), new bpmConnectionConstraint(new bpmPoint(0.5, 1), true),
	          	              		   new bpmConnectionConstraint(new bpmPoint(0, 0.5), true), new bpmConnectionConstraint(new bpmPoint(1, 0.5))];
	bpmLabel.prototype.constraints = bpmRectangleShape.prototype.constraints;
	bpmImageShape.prototype.constraints = bpmRectangleShape.prototype.constraints;
	bpmSwimlane.prototype.constraints = bpmRectangleShape.prototype.constraints;
	PlusShape.prototype.constraints = bpmRectangleShape.prototype.constraints;

	NoteShape.prototype.getConstraints = function(style, w, h)
	{
		var constr = [];
		var s = Math.max(0, Math.min(w, Math.min(h, parseFloat(bpmUtils.getValue(this.style, 'size', this.size)))));
		
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, (w - s) * 0.5, 0));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, w - s, 0));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, w - s * 0.5, s * 0.5));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, w, s));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, w, (h + s) * 0.5 ));
		constr.push(new bpmConnectionConstraint(new bpmPoint(1, 1), false));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0.5, 1), false));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 1), false));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0.5), false));
		
		if (w >= s * 2)
		{
			constr.push(new bpmConnectionConstraint(new bpmPoint(0.5, 0), false));
		}

		return (constr);
	};
	
	CardShape.prototype.getConstraints = function(style, w, h)
	{
		var constr = [];
		var s = Math.max(0, Math.min(w, Math.min(h, parseFloat(bpmUtils.getValue(this.style, 'size', this.size)))));
		
		constr.push(new bpmConnectionConstraint(new bpmPoint(1, 0), false));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, (w + s) * 0.5, 0));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, s, 0));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, s * 0.5, s * 0.5));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, 0, s));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, 0, (h + s) * 0.5 ));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 1), false));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0.5, 1), false));
		constr.push(new bpmConnectionConstraint(new bpmPoint(1, 1), false));
		constr.push(new bpmConnectionConstraint(new bpmPoint(1, 0.5), false));
		
		if (w >= s * 2)
		{
			constr.push(new bpmConnectionConstraint(new bpmPoint(0.5, 0), false));
		}

		return (constr);
	};
	
	CubeShape.prototype.getConstraints = function(style, w, h)
	{
		var constr = [];
		var s = Math.max(0, Math.min(w, Math.min(h, parseFloat(bpmUtils.getValue(this.style, 'size', this.size)))));
		
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, (w - s) * 0.5, 0));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, w - s, 0));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, w - s * 0.5, s * 0.5));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, w, s));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, w, (h + s) * 0.5));
		constr.push(new bpmConnectionConstraint(new bpmPoint(1, 1), false));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, (w + s) * 0.5, h));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, s, h));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, s * 0.5, h - s * 0.5));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, 0, h - s));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, 0, (h - s) * 0.5));
		
		return (constr);
	};
	
	FolderShape.prototype.getConstraints = function(style, w, h)
	{
		var constr = [];
		var dx = Math.max(0, Math.min(w, parseFloat(bpmUtils.getValue(this.style, 'tabWidth', this.tabWidth))));
		var dy = Math.max(0, Math.min(h, parseFloat(bpmUtils.getValue(this.style, 'tabHeight', this.tabHeight))));
		var tp = bpmUtils.getValue(this.style, 'tabPosition', this.tabPosition);

		if (tp == 'left')
		{
			constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false));
			constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, dx * 0.5, 0));
			constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, dx, 0));
			constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, dx, dy));
			constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, (w + dx) * 0.5, dy));
		}
		else
		{
			constr.push(new bpmConnectionConstraint(new bpmPoint(1, 0), false));
			constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, w - dx * 0.5, 0));
			constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, w - dx, 0));
			constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, w - dx, dy));
			constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, (w - dx) * 0.5, dy));
		}
		
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, w, dy));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, w, (h - dy) * 0.25 + dy));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, w, (h - dy) * 0.5 + dy));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, w, (h - dy) * 0.75 + dy));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, w, h));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, 0, dy));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, 0, (h - dy) * 0.25 + dy));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, 0, (h - dy) * 0.5 + dy));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, 0, (h - dy) * 0.75 + dy));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, 0, h));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0.25, 1), false));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0.5, 1), false));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0.75, 1), false));

		return (constr);
	}

	InternalStorageShape.prototype.constraints = bpmRectangleShape.prototype.constraints;
	DataStorageShape.prototype.constraints = bpmRectangleShape.prototype.constraints;
	TapeDataShape.prototype.constraints = bpmEllipse.prototype.constraints;
	OrEllipseShape.prototype.constraints = bpmEllipse.prototype.constraints;
	SumEllipseShape.prototype.constraints = bpmEllipse.prototype.constraints;
	LineEllipseShape.prototype.constraints = bpmEllipse.prototype.constraints;
	ManualInputShape.prototype.constraints = bpmRectangleShape.prototype.constraints;
	DelayShape.prototype.constraints = bpmRectangleShape.prototype.constraints;

	DisplayShape.prototype.getConstraints = function(style, w, h)
	{
		var constr = [];
		var dx = Math.min(w, h / 2);
		var s = Math.min(w - dx, Math.max(0, parseFloat(bpmUtils.getValue(this.style, 'size', this.size))) * w);
		
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0.5), false, null));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, s, 0));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, (s + w - dx) * 0.5, 0));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, w - dx, 0));
		constr.push(new bpmConnectionConstraint(new bpmPoint(1, 0.5), false, null));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, w - dx, h));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, (s + w - dx) * 0.5, h));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, s, h));
		
		return (constr);
	};
	
	LoopLimitShape.prototype.constraints = bpmRectangleShape.prototype.constraints;
	OffPageConnectorShape.prototype.constraints = bpmRectangleShape.prototype.constraints;
	bpmCylinder.prototype.constraints = [new bpmConnectionConstraint(new bpmPoint(0.15, 0.05), false),
                                        new bpmConnectionConstraint(new bpmPoint(0.5, 0), true),
                                        new bpmConnectionConstraint(new bpmPoint(0.85, 0.05), false),
      	              		 new bpmConnectionConstraint(new bpmPoint(0, 0.3), true),
      	              		 new bpmConnectionConstraint(new bpmPoint(0, 0.5), true),
      	              		 new bpmConnectionConstraint(new bpmPoint(0, 0.7), true),
      	            		 new bpmConnectionConstraint(new bpmPoint(1, 0.3), true),
      	            		 new bpmConnectionConstraint(new bpmPoint(1, 0.5), true),
      	            		 new bpmConnectionConstraint(new bpmPoint(1, 0.7), true),
      	            		 new bpmConnectionConstraint(new bpmPoint(0.15, 0.95), false),
      	            		 new bpmConnectionConstraint(new bpmPoint(0.5, 1), true),
      	            		 new bpmConnectionConstraint(new bpmPoint(0.85, 0.95), false)];
	UmlActorShape.prototype.constraints = [new bpmConnectionConstraint(new bpmPoint(0.25, 0.1), false),
	                                          new bpmConnectionConstraint(new bpmPoint(0.5, 0), false),
	                                          new bpmConnectionConstraint(new bpmPoint(0.75, 0.1), false),
	        	              		 new bpmConnectionConstraint(new bpmPoint(0, 1/3), false),
	        	              		 new bpmConnectionConstraint(new bpmPoint(0, 1), false),
	        	            		 new bpmConnectionConstraint(new bpmPoint(1, 1/3), false),
	        	            		 new bpmConnectionConstraint(new bpmPoint(1, 1), false),
	        	            		 new bpmConnectionConstraint(new bpmPoint(0.5, 0.5), false)];
	ComponentShape.prototype.constraints = [new bpmConnectionConstraint(new bpmPoint(0.25, 0), true),
	                                          new bpmConnectionConstraint(new bpmPoint(0.5, 0), true),
	                                          new bpmConnectionConstraint(new bpmPoint(0.75, 0), true),
	        	              		 new bpmConnectionConstraint(new bpmPoint(0, 0.3), true),
	        	              		 new bpmConnectionConstraint(new bpmPoint(0, 0.7), true),
	        	            		 new bpmConnectionConstraint(new bpmPoint(1, 0.25), true),
	        	            		 new bpmConnectionConstraint(new bpmPoint(1, 0.5), true),
	        	            		 new bpmConnectionConstraint(new bpmPoint(1, 0.75), true),
	        	            		 new bpmConnectionConstraint(new bpmPoint(0.25, 1), true),
	        	            		 new bpmConnectionConstraint(new bpmPoint(0.5, 1), true),
	        	            		 new bpmConnectionConstraint(new bpmPoint(0.75, 1), true)];
	bpmActor.prototype.constraints = [new bpmConnectionConstraint(new bpmPoint(0.5, 0), true),
   	              		 new bpmConnectionConstraint(new bpmPoint(0.25, 0.2), false),
   	              		 new bpmConnectionConstraint(new bpmPoint(0.1, 0.5), false),
   	              		 new bpmConnectionConstraint(new bpmPoint(0, 0.75), true),
   	            		 new bpmConnectionConstraint(new bpmPoint(0.75, 0.25), false),
   	            		 new bpmConnectionConstraint(new bpmPoint(0.9, 0.5), false),
   	            		 new bpmConnectionConstraint(new bpmPoint(1, 0.75), true),
   	            		 new bpmConnectionConstraint(new bpmPoint(0.25, 1), true),
   	            		 new bpmConnectionConstraint(new bpmPoint(0.5, 1), true),
   	            		 new bpmConnectionConstraint(new bpmPoint(0.75, 1), true)];
	SwitchShape.prototype.constraints = [new bpmConnectionConstraint(new bpmPoint(0, 0), false),
                                         new bpmConnectionConstraint(new bpmPoint(0.5, 0.25), false),
                                         new bpmConnectionConstraint(new bpmPoint(1, 0), false),
			       	              		 new bpmConnectionConstraint(new bpmPoint(0.25, 0.5), false),
			       	              		 new bpmConnectionConstraint(new bpmPoint(0.75, 0.5), false),
			       	              		 new bpmConnectionConstraint(new bpmPoint(0, 1), false),
			       	            		 new bpmConnectionConstraint(new bpmPoint(0.5, 0.75), false),
			       	            		 new bpmConnectionConstraint(new bpmPoint(1, 1), false)];
	TapeShape.prototype.constraints = [new bpmConnectionConstraint(new bpmPoint(0, 0.35), false),
	                                   new bpmConnectionConstraint(new bpmPoint(0, 0.5), false),
	                                   new bpmConnectionConstraint(new bpmPoint(0, 0.65), false),
	                                   new bpmConnectionConstraint(new bpmPoint(1, 0.35), false),
		                                new bpmConnectionConstraint(new bpmPoint(1, 0.5), false),
		                                new bpmConnectionConstraint(new bpmPoint(1, 0.65), false),
										new bpmConnectionConstraint(new bpmPoint(0.25, 1), false),
										new bpmConnectionConstraint(new bpmPoint(0.75, 0), false)];
	StepShape.prototype.constraints = [new bpmConnectionConstraint(new bpmPoint(0.25, 0), true),
									new bpmConnectionConstraint(new bpmPoint(0.5, 0), true),
									new bpmConnectionConstraint(new bpmPoint(0.75, 0), true),
									new bpmConnectionConstraint(new bpmPoint(0.25, 1), true),
									new bpmConnectionConstraint(new bpmPoint(0.5, 1), true),
									new bpmConnectionConstraint(new bpmPoint(0.75, 1), true),
									new bpmConnectionConstraint(new bpmPoint(0, 0.25), true),
									new bpmConnectionConstraint(new bpmPoint(0, 0.5), true),
									new bpmConnectionConstraint(new bpmPoint(0, 0.75), true),
									new bpmConnectionConstraint(new bpmPoint(1, 0.25), true),
									new bpmConnectionConstraint(new bpmPoint(1, 0.5), true),
									new bpmConnectionConstraint(new bpmPoint(1, 0.75), true)];
	bpmLine.prototype.constraints = [new bpmConnectionConstraint(new bpmPoint(0, 0.5), false),
	                                new bpmConnectionConstraint(new bpmPoint(0.25, 0.5), false),
	                                new bpmConnectionConstraint(new bpmPoint(0.75, 0.5), false),
									new bpmConnectionConstraint(new bpmPoint(1, 0.5), false)];
	LollipopShape.prototype.constraints = [new bpmConnectionConstraint(new bpmPoint(0.5, 0), false),
										new bpmConnectionConstraint(new bpmPoint(0.5, 1), false)];
	bpmDoubleEllipse.prototype.constraints = bpmEllipse.prototype.constraints;
	bpmRhombus.prototype.constraints = bpmEllipse.prototype.constraints;
	bpmTriangle.prototype.constraints = [new bpmConnectionConstraint(new bpmPoint(0, 0.25), true),
	                                    new bpmConnectionConstraint(new bpmPoint(0, 0.5), true),
	                                   new bpmConnectionConstraint(new bpmPoint(0, 0.75), true),
	                                   new bpmConnectionConstraint(new bpmPoint(0.5, 0), true),
	                                   new bpmConnectionConstraint(new bpmPoint(0.5, 1), true),
	                                   new bpmConnectionConstraint(new bpmPoint(1, 0.5), true)];
	bpmHexagon.prototype.constraints = [new bpmConnectionConstraint(new bpmPoint(0.375, 0), true),
	                                    new bpmConnectionConstraint(new bpmPoint(0.5, 0), true),
	                                   new bpmConnectionConstraint(new bpmPoint(0.625, 0), true),
	                                   new bpmConnectionConstraint(new bpmPoint(0, 0.25), true),
	                                   new bpmConnectionConstraint(new bpmPoint(0, 0.5), true),
	                                   new bpmConnectionConstraint(new bpmPoint(0, 0.75), true),
	                                   new bpmConnectionConstraint(new bpmPoint(1, 0.25), true),
	                                   new bpmConnectionConstraint(new bpmPoint(1, 0.5), true),
	                                   new bpmConnectionConstraint(new bpmPoint(1, 0.75), true),
	                                   new bpmConnectionConstraint(new bpmPoint(0.375, 1), true),
	                                    new bpmConnectionConstraint(new bpmPoint(0.5, 1), true),
	                                   new bpmConnectionConstraint(new bpmPoint(0.625, 1), true)];
	bpmCloud.prototype.constraints = [new bpmConnectionConstraint(new bpmPoint(0.25, 0.25), false),
	                                 new bpmConnectionConstraint(new bpmPoint(0.4, 0.1), false),
	                                 new bpmConnectionConstraint(new bpmPoint(0.16, 0.55), false),
	                                 new bpmConnectionConstraint(new bpmPoint(0.07, 0.4), false),
	                                 new bpmConnectionConstraint(new bpmPoint(0.31, 0.8), false),
	                                 new bpmConnectionConstraint(new bpmPoint(0.13, 0.77), false),
	                                 new bpmConnectionConstraint(new bpmPoint(0.8, 0.8), false),
	                                 new bpmConnectionConstraint(new bpmPoint(0.55, 0.95), false),
	                                 new bpmConnectionConstraint(new bpmPoint(0.875, 0.5), false),
	                                 new bpmConnectionConstraint(new bpmPoint(0.96, 0.7), false),
	                                 new bpmConnectionConstraint(new bpmPoint(0.625, 0.2), false),
	                                 new bpmConnectionConstraint(new bpmPoint(0.88, 0.25), false)];
	ParallelogramShape.prototype.constraints = bpmRectangleShape.prototype.constraints;
	TrapezoidShape.prototype.constraints = bpmRectangleShape.prototype.constraints;
	DocumentShape.prototype.constraints = [new bpmConnectionConstraint(new bpmPoint(0.25, 0), true),
	                                          new bpmConnectionConstraint(new bpmPoint(0.5, 0), true),
	                                          new bpmConnectionConstraint(new bpmPoint(0.75, 0), true),
	        	              		 new bpmConnectionConstraint(new bpmPoint(0, 0.25), true),
	        	              		 new bpmConnectionConstraint(new bpmPoint(0, 0.5), true),
	        	              		 new bpmConnectionConstraint(new bpmPoint(0, 0.75), true),
	        	            		 new bpmConnectionConstraint(new bpmPoint(1, 0.25), true),
	        	            		 new bpmConnectionConstraint(new bpmPoint(1, 0.5), true),
	        	            		 new bpmConnectionConstraint(new bpmPoint(1, 0.75), true)];
	bpmArrow.prototype.constraints = null;

	TeeShape.prototype.getConstraints = function(style, w, h)
	{
		var constr = [];
		var dx = Math.max(0, Math.min(w, parseFloat(bpmUtils.getValue(this.style, 'dx', this.dx))));
		var dy = Math.max(0, Math.min(h, parseFloat(bpmUtils.getValue(this.style, 'dy', this.dy))));
		var w2 = Math.abs(w - dx) / 2;
		
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0.5, 0), false));
		constr.push(new bpmConnectionConstraint(new bpmPoint(1, 0), false));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, w, dy * 0.5));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, w, dy));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, w * 0.75 + dx * 0.25, dy));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, (w + dx) * 0.5, dy));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, (w + dx) * 0.5, (h + dy) * 0.5));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, (w + dx) * 0.5, h));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0.5, 1), false));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, (w - dx) * 0.5, h));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, (w - dx) * 0.5, (h + dy) * 0.5));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, (w - dx) * 0.5, dy));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, w * 0.25 - dx * 0.25, dy));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, 0, dy));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, 0, dy * 0.5));
		
		return (constr);
	};

	CornerShape.prototype.getConstraints = function(style, w, h)
	{
		var constr = [];
		var dx = Math.max(0, Math.min(w, parseFloat(bpmUtils.getValue(this.style, 'dx', this.dx))));
		var dy = Math.max(0, Math.min(h, parseFloat(bpmUtils.getValue(this.style, 'dy', this.dy))));
		
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0.5, 0), false));
		constr.push(new bpmConnectionConstraint(new bpmPoint(1, 0), false));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, w, dy * 0.5));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, w, dy));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, (w + dx) * 0.5, dy));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, dx, dy));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, dx, (h + dy) * 0.5));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, dx, h));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, dx * 0.5, h));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0.5), false));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 1), false));
		
		return (constr);
	};

	CrossbarShape.prototype.constraints = [new bpmConnectionConstraint(new bpmPoint(0, 0), false),
        new bpmConnectionConstraint(new bpmPoint(0, 0.5), false),
        new bpmConnectionConstraint(new bpmPoint(0, 1), false),
        new bpmConnectionConstraint(new bpmPoint(0.25, 0.5), false),
        new bpmConnectionConstraint(new bpmPoint(0.5, 0.5), false),
        new bpmConnectionConstraint(new bpmPoint(0.75, 0.5), false),
        new bpmConnectionConstraint(new bpmPoint(1, 0), false),
        new bpmConnectionConstraint(new bpmPoint(1, 0.5), false),
        new bpmConnectionConstraint(new bpmPoint(1, 1), false)];

	SingleArrowShape.prototype.getConstraints = function(style, w, h)
	{
		var constr = [];
		var aw = h * Math.max(0, Math.min(1, parseFloat(bpmUtils.getValue(this.style, 'arrowWidth', this.arrowWidth))));
		var as = w * Math.max(0, Math.min(1, parseFloat(bpmUtils.getValue(this.style, 'arrowSize', this.arrowSize))));
		var at = (h - aw) / 2;
		var ab = at + aw;
		
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0.5), false));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, 0, at));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, (w - as) * 0.5, at));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, w - as, 0));
		constr.push(new bpmConnectionConstraint(new bpmPoint(1, 0.5), false));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, w - as, h));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, (w - as) * 0.5, h - at));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, 0, h - at));
		
		return (constr);
	};
	
	DoubleArrowShape.prototype.getConstraints = function(style, w, h)
	{
		var constr = [];
		var aw = h * Math.max(0, Math.min(1, parseFloat(bpmUtils.getValue(this.style, 'arrowWidth', SingleArrowShape.prototype.arrowWidth))));
		var as = w * Math.max(0, Math.min(1, parseFloat(bpmUtils.getValue(this.style, 'arrowSize', SingleArrowShape.prototype.arrowSize))));
		var at = (h - aw) / 2;
		var ab = at + aw;
		
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0.5), false));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, as, 0));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, w * 0.5, at));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, w - as, 0));
		constr.push(new bpmConnectionConstraint(new bpmPoint(1, 0.5), false));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, w - as, h));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, w * 0.5, h - at));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, as, h));
		
		return (constr);
	};
	
	CrossShape.prototype.getConstraints = function(style, w, h)
	{
		var constr = [];
		var m = Math.min(h, w);
		var size = Math.max(0, Math.min(m, m * parseFloat(bpmUtils.getValue(this.style, 'size', this.size))));
		var t = (h - size) / 2;
		var b = t + size;
		var l = (w - size) / 2;
		var r = l + size;
		
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, l, t * 0.5));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, l, 0));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0.5, 0), false));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, r, 0));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, r, t * 0.5));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, r, t));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, l, h - t * 0.5));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, l, h));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0.5, 1), false));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, r, h));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, r, h - t * 0.5));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, r, b));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, (w + r) * 0.5, t));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, w, t));
		constr.push(new bpmConnectionConstraint(new bpmPoint(1, 0.5), false));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, w, b));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, (w + r) * 0.5, b));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, l, b));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, l * 0.5, t));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, 0, t));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0.5), false));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, 0, b));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, l * 0.5, b));
		constr.push(new bpmConnectionConstraint(new bpmPoint(0, 0), false, null, l, t));

		return (constr);
	};
	
	UmlLifeline.prototype.constraints = null;
	OrShape.prototype.constraints = [new bpmConnectionConstraint(new bpmPoint(0, 0.25), false),
	  	                             new bpmConnectionConstraint(new bpmPoint(0, 0.5), false),
	  	                             new bpmConnectionConstraint(new bpmPoint(0, 0.75), false),
	  	                             new bpmConnectionConstraint(new bpmPoint(1, 0.5), false),
	  	                             new bpmConnectionConstraint(new bpmPoint(0.7, 0.1), false),
	  	                             new bpmConnectionConstraint(new bpmPoint(0.7, 0.9), false)];
	XorShape.prototype.constraints = [new bpmConnectionConstraint(new bpmPoint(0.175, 0.25), false),
	  	                             new bpmConnectionConstraint(new bpmPoint(0.25, 0.5), false),
	  	                             new bpmConnectionConstraint(new bpmPoint(0.175, 0.75), false),
	  	                             new bpmConnectionConstraint(new bpmPoint(1, 0.5), false),
	  	                             new bpmConnectionConstraint(new bpmPoint(0.7, 0.1), false),
	  	                             new bpmConnectionConstraint(new bpmPoint(0.7, 0.9), false)];
	RequiredInterfaceShape.prototype.constraints = [new bpmConnectionConstraint(new bpmPoint(0, 0.5), false),
          new bpmConnectionConstraint(new bpmPoint(1, 0.5), false)];
	ProvidedRequiredInterfaceShape.prototype.constraints = [new bpmConnectionConstraint(new bpmPoint(0, 0.5), false),
        new bpmConnectionConstraint(new bpmPoint(1, 0.5), false)];
})();

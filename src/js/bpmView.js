
var bpmPerimeter =
{
	RectanglePerimeter: function (bounds, vertex, next, orthogonal)
	{
		var cx = bounds.getCenterX();
		var cy = bounds.getCenterY();
		var dx = next.x - cx;
		var dy = next.y - cy;
		var alpha = Math.atan2(dy, dx);
		var p = new bpmPoint(0, 0);
		var pi = Math.PI;
		var pi2 = Math.PI/2;
		var beta = pi2 - alpha;
		var t = Math.atan2(bounds.height, bounds.width);
		
		if (alpha < -pi + t || alpha > pi - t)
		{
			// Left edge
			p.x = bounds.x;
			p.y = cy - bounds.width * Math.tan(alpha) / 2;
		}
		else if (alpha < -t)
		{
			// Top Edge
			p.y = bounds.y;
			p.x = cx - bounds.height * Math.tan(beta) / 2;
		}
		else if (alpha < t)
		{
			// Right Edge
			p.x = bounds.x + bounds.width;
			p.y = cy + bounds.width * Math.tan(alpha) / 2;
		}
		else
		{
			// Bottom Edge
			p.y = bounds.y + bounds.height;
			p.x = cx + bounds.height * Math.tan(beta) / 2;
		}
		
		if (orthogonal)
		{
			if (next.x >= bounds.x &&
				next.x <= bounds.x + bounds.width)
			{
				p.x = next.x;
			}
			else if (next.y >= bounds.y &&
					   next.y <= bounds.y + bounds.height)
			{
				p.y = next.y;
			}
			if (next.x < bounds.x)
			{
				p.x = bounds.x;
			}
			else if (next.x > bounds.x + bounds.width)
			{
				p.x = bounds.x + bounds.width;
			}
			if (next.y < bounds.y)
			{
				p.y = bounds.y;
			}
			else if (next.y > bounds.y + bounds.height)
			{
				p.y = bounds.y + bounds.height;
			}
		}
		
		return p;
	},

	EllipsePerimeter: function (bounds, vertex, next, orthogonal)
	{
		var x = bounds.x;
		var y = bounds.y;
		var a = bounds.width / 2;
		var b = bounds.height / 2;
		var cx = x + a;
		var cy = y + b;
		var px = next.x;
		var py = next.y;
		
		var dx = parseInt(px - cx);
		var dy = parseInt(py - cy);
		
		if (dx == 0 && dy != 0)
		{
			return new bpmPoint(cx, cy + b * dy / Math.abs(dy));
		}
		else if (dx == 0 && dy == 0)
		{
			return new bpmPoint(px, py);
		}

		if (orthogonal)
		{
			if (py >= y && py <= y + bounds.height)
			{
				var ty = py - cy;
				var tx = Math.sqrt(a*a*(1-(ty*ty)/(b*b))) || 0;
				
				if (px <= x)
				{
					tx = -tx;
				}
				
				return new bpmPoint(cx+tx, py);
			}
			
			if (px >= x && px <= x + bounds.width)
			{
				var tx = px - cx;
				var ty = Math.sqrt(b*b*(1-(tx*tx)/(a*a))) || 0;
				
				if (py <= y)
				{
					ty = -ty;	
				}
				
				return new bpmPoint(px, cy+ty);
			}
		}
		
		// Calculates intersection
		var d = dy / dx;
		var h = cy - d * cx;
		var e = a * a * d * d + b * b;
		var f = -2 * cx * e;
		var g = a * a * d * d * cx * cx +
				b * b * cx * cx -
				a * a * b * b;
		var det = Math.sqrt(f * f - 4 * e * g);
		
		// Two solutions (perimeter points)
		var xout1 = (-f + det) / (2 * e);
		var xout2 = (-f - det) / (2 * e);
		var yout1 = d * xout1 + h;
		var yout2 = d * xout2 + h;
		var dist1 = Math.sqrt(Math.pow((xout1 - px), 2)
					+ Math.pow((yout1 - py), 2));
		var dist2 = Math.sqrt(Math.pow((xout2 - px), 2)
					+ Math.pow((yout2 - py), 2));
					
		// Correct solution
		var xout = 0;
		var yout = 0;
		
		if (dist1 < dist2)
		{
			xout = xout1;
			yout = yout1;
		}
		else
		{
			xout = xout2;
			yout = yout2;
		}
		
		return new bpmPoint(xout, yout);
	},

	RhombusPerimeter: function (bounds, vertex, next, orthogonal)
	{
		var x = bounds.x;
		var y = bounds.y;
		var w = bounds.width;
		var h = bounds.height;
		
		var cx = x + w / 2;
		var cy = y + h / 2;

		var px = next.x;
		var py = next.y;

		if (cx == px)
		{
			if (cy > py)
			{
				return new bpmPoint(cx, y); // top
			}
			else
			{
				return new bpmPoint(cx, y + h); // bottom
			}
		}
		else if (cy == py)
		{
			if (cx > px)
			{
				return new bpmPoint(x, cy); // left
			}
			else
			{
				return new bpmPoint(x + w, cy); // right
			}
		}
		
		var tx = cx;
		var ty = cy;
		
		if (orthogonal)
		{
			if (px >= x && px <= x + w)
			{
				tx = px;
			}
			else if (py >= y && py <= y + h)
			{
				ty = py;
			}
		}
		
		if (px < cx)
		{
			if (py < cy)
			{
				return bpmUtils.intersection(px, py, tx, ty, cx, y, x, cy);
			}
			else
			{
				return bpmUtils.intersection(px, py, tx, ty, cx, y + h, x, cy);
			}
		}
		else if (py < cy)
		{
			return bpmUtils.intersection(px, py, tx, ty, cx, y, x + w, cy);
		}
		else
		{
			return bpmUtils.intersection(px, py, tx, ty, cx, y + h, x + w, cy);
		}
	},
	
	TrianglePerimeter: function (bounds, vertex, next, orthogonal)
	{
		var direction = (vertex != null) ?
			vertex.style[bpmConstants.STYLE_DIRECTION] : null;
		var vertical = direction == bpmConstants.DIRECTION_NORTH ||
			direction == bpmConstants.DIRECTION_SOUTH;

		var x = bounds.x;
		var y = bounds.y;
		var w = bounds.width;
		var h = bounds.height;
		
		var cx = x + w / 2;
		var cy = y + h / 2;
		
		var start = new bpmPoint(x, y);
		var corner = new bpmPoint(x + w, cy);
		var end = new bpmPoint(x, y + h);
		
		if (direction == bpmConstants.DIRECTION_NORTH)
		{
			start = end;
			corner = new bpmPoint(cx, y);
			end = new bpmPoint(x + w, y + h);
		}
		else if (direction == bpmConstants.DIRECTION_SOUTH)
		{
			corner = new bpmPoint(cx, y + h);
			end = new bpmPoint(x + w, y);
		}
		else if (direction == bpmConstants.DIRECTION_WEST)
		{
			start = new bpmPoint(x + w, y);
			corner = new bpmPoint(x, cy);
			end = new bpmPoint(x + w, y + h);
		}

		var dx = next.x - cx;
		var dy = next.y - cy;

		var alpha = (vertical) ? Math.atan2(dx, dy) : Math.atan2(dy, dx);
		var t = (vertical) ? Math.atan2(w, h) : Math.atan2(h, w);
		
		var base = false;
		
		if (direction == bpmConstants.DIRECTION_NORTH ||
			direction == bpmConstants.DIRECTION_WEST)
		{
			base = alpha > -t && alpha < t;
		}
		else
		{
			base = alpha < -Math.PI + t || alpha > Math.PI - t;	
		}

		var result = null;			

		if (base)
		{
			if (orthogonal && ((vertical && next.x >= start.x && next.x <= end.x) ||
				(!vertical && next.y >= start.y && next.y <= end.y)))
			{
				if (vertical)
				{
					result = new bpmPoint(next.x, start.y);
				}
				else
				{
					result = new bpmPoint(start.x, next.y);
				}
			}
			else
			{
				if (direction == bpmConstants.DIRECTION_NORTH)
				{
					result = new bpmPoint(x + w / 2 + h * Math.tan(alpha) / 2,
						y + h);
				}
				else if (direction == bpmConstants.DIRECTION_SOUTH)
				{
					result = new bpmPoint(x + w / 2 - h * Math.tan(alpha) / 2,
						y);
				}
				else if (direction == bpmConstants.DIRECTION_WEST)
				{
					result = new bpmPoint(x + w, y + h / 2 +
						w * Math.tan(alpha) / 2);
				}
				else
				{
					result = new bpmPoint(x, y + h / 2 -
						w * Math.tan(alpha) / 2);
				}
			}
		}
		else
		{
			if (orthogonal)
			{
				var pt = new bpmPoint(cx, cy);
		
				if (next.y >= y && next.y <= y + h)
				{
					pt.x = (vertical) ? cx : (
						(direction == bpmConstants.DIRECTION_WEST) ?
							x + w : x);
					pt.y = next.y;
				}
				else if (next.x >= x && next.x <= x + w)
				{
					pt.x = next.x;
					pt.y = (!vertical) ? cy : (
						(direction == bpmConstants.DIRECTION_NORTH) ?
							y + h : y);
				}
				
				// Compute angle
				dx = next.x - pt.x;
				dy = next.y - pt.y;
				
				cx = pt.x;
				cy = pt.y;
			}

			if ((vertical && next.x <= x + w / 2) ||
				(!vertical && next.y <= y + h / 2))
			{
				result = bpmUtils.intersection(next.x, next.y, cx, cy,
					start.x, start.y, corner.x, corner.y);
			}
			else
			{
				result = bpmUtils.intersection(next.x, next.y, cx, cy,
					corner.x, corner.y, end.x, end.y);
			}
		}
		
		if (result == null)
		{
			result = new bpmPoint(cx, cy);
		}
		
		return result;
	},
	
	HexagonPerimeter: function (bounds, vertex, next, orthogonal)
	{
		var x = bounds.x;
		var y = bounds.y;
		var w = bounds.width;
		var h = bounds.height;

		var cx = bounds.getCenterX();
		var cy = bounds.getCenterY();
		var px = next.x;
		var py = next.y;
		var dx = px - cx;
		var dy = py - cy;
		var alpha = -Math.atan2(dy, dx);
		var pi = Math.PI;
		var pi2 = Math.PI / 2;

		var result = new bpmPoint(cx, cy);

		var direction = (vertex != null) ? bpmUtils.getValue(
				vertex.style, bpmConstants.STYLE_DIRECTION,
				bpmConstants.DIRECTION_EAST) : bpmConstants.DIRECTION_EAST;
		var vertical = direction == bpmConstants.DIRECTION_NORTH
				|| direction == bpmConstants.DIRECTION_SOUTH;
		var a = new bpmPoint();
		var b = new bpmPoint();

		//Only consider corrects quadrants for the orthogonal case.
		if ((px < x) && (py < y) || (px < x) && (py > y + h)
				|| (px > x + w) && (py < y) || (px > x + w) && (py > y + h))
		{
			orthogonal = false;
		}

		if (orthogonal)
		{
			if (vertical)
			{
				//Special cases where intersects with hexagon corners
				if (px == cx)
				{
					if (py <= y)
					{
						return new bpmPoint(cx, y);
					}
					else if (py >= y + h)
					{
						return new bpmPoint(cx, y + h);
					}
				}
				else if (px < x)
				{
					if (py == y + h / 4)
					{
						return new bpmPoint(x, y + h / 4);
					}
					else if (py == y + 3 * h / 4)
					{
						return new bpmPoint(x, y + 3 * h / 4);
					}
				}
				else if (px > x + w)
				{
					if (py == y + h / 4)
					{
						return new bpmPoint(x + w, y + h / 4);
					}
					else if (py == y + 3 * h / 4)
					{
						return new bpmPoint(x + w, y + 3 * h / 4);
					}
				}
				else if (px == x)
				{
					if (py < cy)
					{
						return new bpmPoint(x, y + h / 4);
					}
					else if (py > cy)
					{
						return new bpmPoint(x, y + 3 * h / 4);
					}
				}
				else if (px == x + w)
				{
					if (py < cy)
					{
						return new bpmPoint(x + w, y + h / 4);
					}
					else if (py > cy)
					{
						return new bpmPoint(x + w, y + 3 * h / 4);
					}
				}
				if (py == y)
				{
					return new bpmPoint(cx, y);
				}
				else if (py == y + h)
				{
					return new bpmPoint(cx, y + h);
				}

				if (px < cx)
				{
					if ((py > y + h / 4) && (py < y + 3 * h / 4))
					{
						a = new bpmPoint(x, y);
						b = new bpmPoint(x, y + h);
					}
					else if (py < y + h / 4)
					{
						a = new bpmPoint(x - Math.floor(0.5 * w), y
								+ Math.floor(0.5 * h));
						b = new bpmPoint(x + w, y - Math.floor(0.25 * h));
					}
					else if (py > y + 3 * h / 4)
					{
						a = new bpmPoint(x - Math.floor(0.5 * w), y
								+ Math.floor(0.5 * h));
						b = new bpmPoint(x + w, y + Math.floor(1.25 * h));
					}
				}
				else if (px > cx)
				{
					if ((py > y + h / 4) && (py < y + 3 * h / 4))
					{
						a = new bpmPoint(x + w, y);
						b = new bpmPoint(x + w, y + h);
					}
					else if (py < y + h / 4)
					{
						a = new bpmPoint(x, y - Math.floor(0.25 * h));
						b = new bpmPoint(x + Math.floor(1.5 * w), y
								+ Math.floor(0.5 * h));
					}
					else if (py > y + 3 * h / 4)
					{
						a = new bpmPoint(x + Math.floor(1.5 * w), y
								+ Math.floor(0.5 * h));
						b = new bpmPoint(x, y + Math.floor(1.25 * h));
					}
				}

			}
			else
			{
				//Special cases where intersects with hexagon corners
				if (py == cy)
				{
					if (px <= x)
					{
						return new bpmPoint(x, y + h / 2);
					}
					else if (px >= x + w)
					{
						return new bpmPoint(x + w, y + h / 2);
					}
				}
				else if (py < y)
				{
					if (px == x + w / 4)
					{
						return new bpmPoint(x + w / 4, y);
					}
					else if (px == x + 3 * w / 4)
					{
						return new bpmPoint(x + 3 * w / 4, y);
					}
				}
				else if (py > y + h)
				{
					if (px == x + w / 4)
					{
						return new bpmPoint(x + w / 4, y + h);
					}
					else if (px == x + 3 * w / 4)
					{
						return new bpmPoint(x + 3 * w / 4, y + h);
					}
				}
				else if (py == y)
				{
					if (px < cx)
					{
						return new bpmPoint(x + w / 4, y);
					}
					else if (px > cx)
					{
						return new bpmPoint(x + 3 * w / 4, y);
					}
				}
				else if (py == y + h)
				{
					if (px < cx)
					{
						return new bpmPoint(x + w / 4, y + h);
					}
					else if (py > cy)
					{
						return new bpmPoint(x + 3 * w / 4, y + h);
					}
				}
				if (px == x)
				{
					return new bpmPoint(x, cy);
				}
				else if (px == x + w)
				{
					return new bpmPoint(x + w, cy);
				}

				if (py < cy)
				{
					if ((px > x + w / 4) && (px < x + 3 * w / 4))
					{
						a = new bpmPoint(x, y);
						b = new bpmPoint(x + w, y);
					}
					else if (px < x + w / 4)
					{
						a = new bpmPoint(x - Math.floor(0.25 * w), y + h);
						b = new bpmPoint(x + Math.floor(0.5 * w), y
								- Math.floor(0.5 * h));
					}
					else if (px > x + 3 * w / 4)
					{
						a = new bpmPoint(x + Math.floor(0.5 * w), y
								- Math.floor(0.5 * h));
						b = new bpmPoint(x + Math.floor(1.25 * w), y + h);
					}
				}
				else if (py > cy)
				{
					if ((px > x + w / 4) && (px < x + 3 * w / 4))
					{
						a = new bpmPoint(x, y + h);
						b = new bpmPoint(x + w, y + h);
					}
					else if (px < x + w / 4)
					{
						a = new bpmPoint(x - Math.floor(0.25 * w), y);
						b = new bpmPoint(x + Math.floor(0.5 * w), y
								+ Math.floor(1.5 * h));
					}
					else if (px > x + 3 * w / 4)
					{
						a = new bpmPoint(x + Math.floor(0.5 * w), y
								+ Math.floor(1.5 * h));
						b = new bpmPoint(x + Math.floor(1.25 * w), y);
					}
				}
			}

			var tx = cx;
			var ty = cy;

			if (px >= x && px <= x + w)
			{
				tx = px;
				
				if (py < cy)
				{
					ty = y + h;
				}
				else
				{
					ty = y;
				}
			}
			else if (py >= y && py <= y + h)
			{
				ty = py;
				
				if (px < cx)
				{
					tx = x + w;
				}
				else
				{
					tx = x;
				}
			}

			result = bpmUtils.intersection(tx, ty, next.x, next.y, a.x, a.y, b.x, b.y);
		}
		else
		{
			if (vertical)
			{
				var beta = Math.atan2(h / 4, w / 2);

				//Special cases where intersects with hexagon corners
				if (alpha == beta)
				{
					return new bpmPoint(x + w, y + Math.floor(0.25 * h));
				}
				else if (alpha == pi2)
				{
					return new bpmPoint(x + Math.floor(0.5 * w), y);
				}
				else if (alpha == (pi - beta))
				{
					return new bpmPoint(x, y + Math.floor(0.25 * h));
				}
				else if (alpha == -beta)
				{
					return new bpmPoint(x + w, y + Math.floor(0.75 * h));
				}
				else if (alpha == (-pi2))
				{
					return new bpmPoint(x + Math.floor(0.5 * w), y + h);
				}
				else if (alpha == (-pi + beta))
				{
					return new bpmPoint(x, y + Math.floor(0.75 * h));
				}

				if ((alpha < beta) && (alpha > -beta))
				{
					a = new bpmPoint(x + w, y);
					b = new bpmPoint(x + w, y + h);
				}
				else if ((alpha > beta) && (alpha < pi2))
				{
					a = new bpmPoint(x, y - Math.floor(0.25 * h));
					b = new bpmPoint(x + Math.floor(1.5 * w), y
							+ Math.floor(0.5 * h));
				}
				else if ((alpha > pi2) && (alpha < (pi - beta)))
				{
					a = new bpmPoint(x - Math.floor(0.5 * w), y
							+ Math.floor(0.5 * h));
					b = new bpmPoint(x + w, y - Math.floor(0.25 * h));
				}
				else if (((alpha > (pi - beta)) && (alpha <= pi))
						|| ((alpha < (-pi + beta)) && (alpha >= -pi)))
				{
					a = new bpmPoint(x, y);
					b = new bpmPoint(x, y + h);
				}
				else if ((alpha < -beta) && (alpha > -pi2))
				{
					a = new bpmPoint(x + Math.floor(1.5 * w), y
							+ Math.floor(0.5 * h));
					b = new bpmPoint(x, y + Math.floor(1.25 * h));
				}
				else if ((alpha < -pi2) && (alpha > (-pi + beta)))
				{
					a = new bpmPoint(x - Math.floor(0.5 * w), y
							+ Math.floor(0.5 * h));
					b = new bpmPoint(x + w, y + Math.floor(1.25 * h));
				}
			}
			else
			{
				var beta = Math.atan2(h / 2, w / 4);

				//Special cases where intersects with hexagon corners
				if (alpha == beta)
				{
					return new bpmPoint(x + Math.floor(0.75 * w), y);
				}
				else if (alpha == (pi - beta))
				{
					return new bpmPoint(x + Math.floor(0.25 * w), y);
				}
				else if ((alpha == pi) || (alpha == -pi))
				{
					return new bpmPoint(x, y + Math.floor(0.5 * h));
				}
				else if (alpha == 0)
				{
					return new bpmPoint(x + w, y + Math.floor(0.5 * h));
				}
				else if (alpha == -beta)
				{
					return new bpmPoint(x + Math.floor(0.75 * w), y + h);
				}
				else if (alpha == (-pi + beta))
				{
					return new bpmPoint(x + Math.floor(0.25 * w), y + h);
				}

				if ((alpha > 0) && (alpha < beta))
				{
					a = new bpmPoint(x + Math.floor(0.5 * w), y
							- Math.floor(0.5 * h));
					b = new bpmPoint(x + Math.floor(1.25 * w), y + h);
				}
				else if ((alpha > beta) && (alpha < (pi - beta)))
				{
					a = new bpmPoint(x, y);
					b = new bpmPoint(x + w, y);
				}
				else if ((alpha > (pi - beta)) && (alpha < pi))
				{
					a = new bpmPoint(x - Math.floor(0.25 * w), y + h);
					b = new bpmPoint(x + Math.floor(0.5 * w), y
							- Math.floor(0.5 * h));
				}
				else if ((alpha < 0) && (alpha > -beta))
				{
					a = new bpmPoint(x + Math.floor(0.5 * w), y
							+ Math.floor(1.5 * h));
					b = new bpmPoint(x + Math.floor(1.25 * w), y);
				}
				else if ((alpha < -beta) && (alpha > (-pi + beta)))
				{
					a = new bpmPoint(x, y + h);
					b = new bpmPoint(x + w, y + h);
				}
				else if ((alpha < (-pi + beta)) && (alpha > -pi))
				{
					a = new bpmPoint(x - Math.floor(0.25 * w), y);
					b = new bpmPoint(x + Math.floor(0.5 * w), y
							+ Math.floor(1.5 * h));
				}
			}

			result = bpmUtils.intersection(cx, cy, next.x, next.y, a.x, a.y, b.x, b.y);
		}
		
		if (result == null)
		{
			return new bpmPoint(cx, cy);
		}
		
		return result;
	}
};



/* Print Preview */
function bpmPrintPreview(graph, scale, pageFormat, border, x0, y0, borderColor, title, pageSelector)
{
	this.graph = graph;
	this.scale = (scale != null) ? scale : 1 / graph.pageScale;
	this.border = (border != null) ? border : 0;
	this.pageFormat = bpmRectangle.fromRectangle((pageFormat != null) ? pageFormat : graph.pageFormat);
	this.title = (title != null) ? title : 'Printer-friendly version';
	this.x0 = (x0 != null) ? x0 : 0;
	this.y0 = (y0 != null) ? y0 : 0;
	this.borderColor = borderColor;
	this.pageSelector = (pageSelector != null) ? pageSelector : true;
};

bpmPrintPreview.prototype.graph = null;
bpmPrintPreview.prototype.pageFormat = null;
bpmPrintPreview.prototype.scale = null;
bpmPrintPreview.prototype.border = 0;
bpmPrintPreview.prototype.marginTop = 0;
bpmPrintPreview.prototype.marginBottom = 0;
bpmPrintPreview.prototype.x0 = 0;
bpmPrintPreview.prototype.y0 = 0;
bpmPrintPreview.prototype.autoOrigin = true;
bpmPrintPreview.prototype.printOverlays = false;
bpmPrintPreview.prototype.printControls = false;
bpmPrintPreview.prototype.printBackgroundImage = false;
bpmPrintPreview.prototype.backgroundColor = '#ffffff';
bpmPrintPreview.prototype.borderColor = null;
bpmPrintPreview.prototype.title = null;
bpmPrintPreview.prototype.pageSelector = null;
bpmPrintPreview.prototype.wnd = null;
bpmPrintPreview.prototype.targetWindow = null;
bpmPrintPreview.prototype.pageCount = 0;
bpmPrintPreview.prototype.clipping = true;

bpmPrintPreview.prototype.getWindow = function()
{
	return this.wnd;
};

bpmPrintPreview.prototype.getDoctype = function()
{
	var dt = '';
	
	if (document.documentMode == 5)
	{
		dt = '<meta http-equiv="X-UA-Compatible" content="IE=5">';
	}
	else if (document.documentMode == 8)
	{
		dt = '<meta http-equiv="X-UA-Compatible" content="IE=8">';
	}
	else if (document.documentMode > 8)
	{
		dt = '<!--[if IE]><meta http-equiv="X-UA-Compatible" content="IE=edge"><![endif]-->';
	}
	
	return dt;
};

bpmPrintPreview.prototype.appendGraph = function(graph, scale, x0, y0, forcePageBreaks, keepOpen)
{
	this.graph = graph;
	this.scale = (scale != null) ? scale : 1 / graph.pageScale;
	this.x0 = x0;
	this.y0 = y0;
	this.open(null, null, forcePageBreaks, keepOpen);
};

bpmPrintPreview.prototype.open = function(css, targetWindow, forcePageBreaks, keepOpen)
{
	var previousInitializeOverlay = this.graph.cellRenderer.initializeOverlay;
	var div = null;
	
	try
	{
		if (this.printOverlays)
		{
			this.graph.cellRenderer.initializeOverlay = function(state, overlay)
			{
				overlay.init(state.view.getDrawPane());
			};
		}
		
		if (this.printControls)
		{
			this.graph.cellRenderer.initControl = function(state, control, handleEvents, clickHandler)
			{
				control.dialect = state.view.graph.dialect;
				control.init(state.view.getDrawPane());
			};
		}
		
		this.wnd = (targetWindow != null) ? targetWindow : this.wnd;
		var isNewWindow = false;
		
		if (this.wnd == null)
		{
			isNewWindow = true;
			this.wnd = window.open();
		}
		
		var doc = this.wnd.document;
		
		if (isNewWindow)
		{
			var dt = this.getDoctype();
			
			if (dt != null && dt.length > 0)
			{
				doc.writeln(dt);
			}
			
			if (bpmCore.IS_VML)
			{
				doc.writeln('<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">');
			}
			else
			{
				if (document.compatMode === 'CSS1Compat')
				{
					doc.writeln('<!DOCTYPE html>');
				}
				
				doc.writeln('<html>');
			}
			
			doc.writeln('<head>');
			this.writeHead(doc, css);
			doc.writeln('</head>');
			doc.writeln('<body class="bpmPage">');
		}

		var bounds = this.graph.getGraphBounds().clone();
		var currentScale = this.graph.getView().getScale();
		var sc = currentScale / this.scale;
		var tr = this.graph.getView().getTranslate();
		
		if (!this.autoOrigin)
		{
			this.x0 -= tr.x * this.scale;
			this.y0 -= tr.y * this.scale;
			bounds.width += bounds.x;
			bounds.height += bounds.y;
			bounds.x = 0;
			bounds.y = 0;
			this.border = 0;
		}
		
		var availableWidth = this.pageFormat.width - (this.border * 2);
		var availableHeight = this.pageFormat.height - (this.border * 2);
	
		this.pageFormat.height += this.marginTop + this.marginBottom;

		bounds.width /= sc;
		bounds.height /= sc;

		var hpages = Math.max(1, Math.ceil((bounds.width + this.x0) / availableWidth));
		var vpages = Math.max(1, Math.ceil((bounds.height + this.y0) / availableHeight));
		this.pageCount = hpages * vpages;
		
		var writePageSelector = bpmUtils.bind(this, function()
		{
			if (this.pageSelector && (vpages > 1 || hpages > 1))
			{
				var table = this.createPageSelector(vpages, hpages);
				doc.body.appendChild(table);
				
				if (bpmCore.IS_IE && doc.documentMode == null || doc.documentMode == 5 || doc.documentMode == 8 || doc.documentMode == 7)
				{
					table.style.position = 'absolute';
					
					var update = function()
					{
						table.style.top = ((doc.body.scrollTop || doc.documentElement.scrollTop) + 10) + 'px';
					};
					
					bpmEvent.addListener(this.wnd, 'scroll', function(evt)
					{
						update();
					});
					
					bpmEvent.addListener(this.wnd, 'resize', function(evt)
					{
						update();
					});
				}
			}
		});
		
		var addPage = bpmUtils.bind(this, function(div, addBreak)
		{
			if (this.borderColor != null)
			{
				div.style.borderColor = this.borderColor;
				div.style.borderStyle = 'solid';
				div.style.borderWidth = '1px';
			}

			div.style.background = this.backgroundColor;
			
			if (forcePageBreaks || addBreak)
			{
				div.style.pageBreakAfter = 'always';
			}

			if (isNewWindow && (bpmCore.IS_IE || document.documentMode >= 11 || bpmCore.IS_EDGE))
			{
				doc.writeln(div.outerHTML);
				div.parentNode.removeChild(div);
			}
			else if (bpmCore.IS_IE || document.documentMode >= 11 || bpmCore.IS_EDGE)
			{
				var clone = doc.createElement('div');
				clone.innerHTML = div.outerHTML;
				clone = clone.getElementsByTagName('div')[0];
				doc.body.appendChild(clone);
				div.parentNode.removeChild(div);
			}
			else
			{
				div.parentNode.removeChild(div);
				doc.body.appendChild(div);
			}

			if (forcePageBreaks || addBreak)
			{
				this.addPageBreak(doc);
			}
		});
		
		var cov = this.getCoverPages(this.pageFormat.width, this.pageFormat.height);
		
		if (cov != null)
		{
			for (var i = 0; i < cov.length; i++)
			{
				addPage(cov[i], true);
			}
		}
		
		var apx = this.getAppendices(this.pageFormat.width, this.pageFormat.height);
		
		for (var i = 0; i < vpages; i++)
		{
			var dy = i * availableHeight / this.scale - this.y0 / this.scale +
					(bounds.y - tr.y * currentScale) / currentScale;
			
			for (var j = 0; j < hpages; j++)
			{
				if (this.wnd == null)
				{
					return null;
				}
				
				var dx = j * availableWidth / this.scale - this.x0 / this.scale +
						(bounds.x - tr.x * currentScale) / currentScale;
				var pageNum = i * hpages + j + 1;
				var clip = new bpmRectangle(dx, dy, availableWidth, availableHeight);
				div = this.renderPage(this.pageFormat.width, this.pageFormat.height, 0, 0, bpmUtils.bind(this, function(div)
				{
					this.addGraphFragment(-dx, -dy, this.scale, pageNum, div, clip);
					
					if (this.printBackgroundImage)
					{
						this.insertBackgroundImage(div, -dx, -dy);
					}
				}), pageNum);

				div.setAttribute('id', 'bpmPage-'+pageNum);

				addPage(div, apx != null || i < vpages - 1 || j < hpages - 1);
			}
		}

		if (apx != null)
		{
			for (var i = 0; i < apx.length; i++)
			{
				addPage(apx[i], i < apx.length - 1);
			}
		}

		if (isNewWindow && !keepOpen)
		{
			this.closeDocument();
			writePageSelector();
		}
		
		this.wnd.focus();
	}
	catch (e)
	{
		if (div != null && div.parentNode != null)
		{
			div.parentNode.removeChild(div);
		}
	}
	finally
	{
		this.graph.cellRenderer.initializeOverlay = previousInitializeOverlay;
	}

	return this.wnd;
};

bpmPrintPreview.prototype.addPageBreak = function(doc)
{
	var hr = doc.createElement('hr');
	hr.className = 'bpmPageBreak';
	doc.body.appendChild(hr);
};

bpmPrintPreview.prototype.closeDocument = function()
{
	try
	{
		if (this.wnd != null && this.wnd.document != null)
		{
			var doc = this.wnd.document;
			
			this.writePostfix(doc);
			doc.writeln('</body>');
			doc.writeln('</html>');
			doc.close();
			
			bpmEvent.release(doc.body);
		}
	}
	catch (e)
	{

	}
};

bpmPrintPreview.prototype.writeHead = function(doc, css)
{
	if (this.title != null)
	{
		doc.writeln('<title>' + this.title + '</title>');
	}
	
	if (bpmCore.IS_VML)
	{
		doc.writeln('<style type="text/css">v\\:*{behavior:url(#default#VML)}o\\:*{behavior:url(#default#VML)}</style>');
	}

	bpmCore.link('stylesheet', bpmCore.basePath + '/css/common.css', doc);

	doc.writeln('<style type="text/css">');
	doc.writeln('@media print {');
	doc.writeln('  * { -webkit-print-color-adjust: exact; }');
	doc.writeln('  table.bpmPageSelector { display: none; }');
	doc.writeln('  hr.bpmPageBreak { display: none; }');
	doc.writeln('}');
	doc.writeln('@media screen {');
	
	doc.writeln('  table.bpmPageSelector { position: fixed; right: 10px; top: 10px;' +
			'font-family: Arial; font-size:10pt; border: solid 1px darkgray;' +
			'background: white; border-collapse:collapse; }');
	doc.writeln('  table.bpmPageSelector td { border: solid 1px gray; padding:4px; }');
	doc.writeln('  body.bpmPage { background: gray; }');
	doc.writeln('}');
	
	if (css != null)
	{
		doc.writeln(css);
	}
	
	doc.writeln('</style>');
};

bpmPrintPreview.prototype.writePostfix = function(doc)
{
	
};

bpmPrintPreview.prototype.createPageSelector = function(vpages, hpages)
{
	var doc = this.wnd.document;
	var table = doc.createElement('table');
	table.className = 'bpmPageSelector';
	table.setAttribute('border', '0');

	var tbody = doc.createElement('tbody');
	
	for (var i = 0; i < vpages; i++)
	{
		var row = doc.createElement('tr');
		
		for (var j = 0; j < hpages; j++)
		{
			var pageNum = i * hpages + j + 1;
			var cell = doc.createElement('td');
			var a = doc.createElement('a');
			a.setAttribute('href', '#bpmPage-' + pageNum);

			if (bpmCore.IS_NS && !bpmCore.IS_SF && !bpmCore.IS_GC)
			{
				var js = 'var page = document.getElementById(\'bpmPage-' + pageNum + '\');page.scrollIntoView(true);event.preventDefault();';
				a.setAttribute('onclick', js);
			}
			
			bpmUtils.write(a, pageNum, doc);
			cell.appendChild(a);
			row.appendChild(cell);
		}
		
		tbody.appendChild(row);
	}
	
	table.appendChild(tbody);
	
	return table;
};

bpmPrintPreview.prototype.renderPage = function(w, h, dx, dy, content, pageNumber)
{
	var doc = this.wnd.document;
	var div = document.createElement('div');
	var arg = null;

	try
	{
		if (dx != 0 || dy != 0)
		{
			div.style.position = 'relative';
			div.style.width = w + 'px';
			div.style.height = h + 'px';
			div.style.pageBreakInside = 'avoid';
			
			var innerDiv = document.createElement('div');
			innerDiv.style.position = 'relative';
			innerDiv.style.top = this.border + 'px';
			innerDiv.style.left = this.border + 'px';
			innerDiv.style.width = (w - 2 * this.border) + 'px';
			innerDiv.style.height = (h - 2 * this.border) + 'px';
			innerDiv.style.overflow = 'hidden';
			
			var viewport = document.createElement('div');
			viewport.style.position = 'relative';
			viewport.style.marginLeft = dx + 'px';
			viewport.style.marginTop = dy + 'px';

			if (doc.documentMode == 8)
			{
				innerDiv.style.position = 'absolute';
				viewport.style.position = 'absolute';
			}
		
			if (doc.documentMode == 10)
			{
				viewport.style.width = '100%';
				viewport.style.height = '100%';
			}
			
			innerDiv.appendChild(viewport);
			div.appendChild(innerDiv);
			document.body.appendChild(div);
			arg = viewport;
		}
		else
		{
			div.style.width = w + 'px';
			div.style.height = h + 'px';
			div.style.overflow = 'hidden';
			div.style.pageBreakInside = 'avoid';
			
			if (doc.documentMode == 8)
			{
				div.style.position = 'relative';
			}
			
			var innerDiv = document.createElement('div');
			innerDiv.style.width = (w - 2 * this.border) + 'px';
			innerDiv.style.height = (h - 2 * this.border) + 'px';
			innerDiv.style.overflow = 'hidden';

			if (bpmCore.IS_IE && (doc.documentMode == null || doc.documentMode == 5 || doc.documentMode == 8 || doc.documentMode == 7))
			{
				innerDiv.style.marginTop = this.border + 'px';
				innerDiv.style.marginLeft = this.border + 'px';	
			}
			else
			{
				innerDiv.style.top = this.border + 'px';
				innerDiv.style.left = this.border + 'px';
			}
	
			if (this.graph.dialect == bpmConstants.DIALECT_VML)
			{
				innerDiv.style.position = 'absolute';
			}

			div.appendChild(innerDiv);
			document.body.appendChild(div);
			arg = innerDiv;
		}
	}
	catch (e)
	{
		div.parentNode.removeChild(div);
		div = null;
		
		throw e;
	}

	content(arg);
	 
	return div;
};

bpmPrintPreview.prototype.getRoot = function()
{
	var root = this.graph.view.currentRoot;
	
	if (root == null)
	{
		root = this.graph.getModel().getRoot();
	}
	
	return root;
};

bpmPrintPreview.prototype.addGraphFragment = function(dx, dy, scale, pageNumber, div, clip)
{
	var view = this.graph.getView();
	var previousContainer = this.graph.container;
	this.graph.container = div;
	
	var canvas = view.getCanvas();
	var backgroundPane = view.getBackgroundPane();
	var drawPane = view.getDrawPane();
	var overlayPane = view.getOverlayPane();

	if (this.graph.dialect == bpmConstants.DIALECT_SVG)
	{
		view.createSvg();
		
		if (!bpmCore.NO_FO)
		{
			var g = view.getDrawPane().parentNode;
			var prev = g.getAttribute('transform');
			g.setAttribute('transformOrigin', '0 0');
			g.setAttribute('transform', 'scale(' + scale + ',' + scale + ')' +
				'translate(' + dx + ',' + dy + ')');
			
			scale = 1;
			dx = 0;
			dy = 0;
		}
	}
	else if (this.graph.dialect == bpmConstants.DIALECT_VML)
	{
		view.createVml();
	}
	else
	{
		view.createHtml();
	}
	
	var eventsEnabled = view.isEventsEnabled();
	view.setEventsEnabled(false);
	
	var graphEnabled = this.graph.isEnabled();
	this.graph.setEnabled(false);

	var translate = view.getTranslate();
	view.translate = new bpmPoint(dx, dy);
	
	var redraw = this.graph.cellRenderer.redraw;
	var states = view.states;
	var s = view.scale;

	if (this.clipping)
	{
		var tempClip = new bpmRectangle((clip.x + translate.x) * s, (clip.y + translate.y) * s,
				clip.width * s / scale, clip.height * s / scale);
		
		this.graph.cellRenderer.redraw = function(state, force, rendering)
		{
			if (state != null)
			{
				var orig = states.get(state.cell);
				
				if (orig != null)
				{
					var bbox = view.getBoundingBox(orig, false);
					
					if (bbox != null && !bpmUtils.intersects(tempClip, bbox))
					{

					}
				}
			}
			
			redraw.apply(this, arguments);
		};
	}
	
	var temp = null;
	
	try
	{
		var cells = [this.getRoot()];
		temp = new bpmTemporaryCellStates(view, scale, cells, null, bpmUtils.bind(this, function(state)
		{
			return this.getLinkForCellState(state);
		}));
	}
	finally
	{
		if (bpmCore.IS_IE)
		{
			view.overlayPane.innerHTML = '';
			view.canvas.style.overflow = 'hidden';
			view.canvas.style.position = 'relative';
			view.canvas.style.top = this.marginTop + 'px';
			view.canvas.style.width = clip.width + 'px';
			view.canvas.style.height = clip.height + 'px';
		}
		else
		{
			var tmp = div.firstChild;

			while (tmp != null)
			{
				var next = tmp.nextSibling;
				var name = tmp.nodeName.toLowerCase();

				if (name == 'svg')
				{
					tmp.style.overflow = 'hidden';
					tmp.style.position = 'relative';
					tmp.style.top = this.marginTop + 'px';
					tmp.setAttribute('width', clip.width);
					tmp.setAttribute('height', clip.height);
					tmp.style.width = '';
					tmp.style.height = '';
				}
				else if (tmp.style.cursor != 'default' && name != 'div')
				{
					tmp.parentNode.removeChild(tmp);
				}
				
				tmp = next;
			}
		}
		
		if (this.printBackgroundImage)
		{
			var svgs = div.getElementsByTagName('svg');
			
			if (svgs.length > 0)
			{
				svgs[0].style.position = 'absolute';
			}
		}

		view.overlayPane.parentNode.removeChild(view.overlayPane);

		this.graph.setEnabled(graphEnabled);
		this.graph.container = previousContainer;
		this.graph.cellRenderer.redraw = redraw;
		view.canvas = canvas;
		view.backgroundPane = backgroundPane;
		view.drawPane = drawPane;
		view.overlayPane = overlayPane;
		view.translate = translate;
		temp.destroy();
		view.setEventsEnabled(eventsEnabled);
	}
};

bpmPrintPreview.prototype.getLinkForCellState = function(state)
{
	return this.graph.getLinkForCell(state.cell);
};

bpmPrintPreview.prototype.insertBackgroundImage = function(div, dx, dy)
{
	var bg = this.graph.backgroundImage;
	
	if (bg != null)
	{
		var img = document.createElement('img');
		img.style.position = 'absolute';
		img.style.marginLeft = Math.round(dx * this.scale) + 'px';
		img.style.marginTop = Math.round(dy * this.scale) + 'px';
		img.setAttribute('width', Math.round(this.scale * bg.width));
		img.setAttribute('height', Math.round(this.scale * bg.height));
		img.src = bg.src;
		
		div.insertBefore(img, div.firstChild);
	}
};

bpmPrintPreview.prototype.getCoverPages = function()
{
	return null;
};

bpmPrintPreview.prototype.getAppendices = function()
{
	return null;
};

bpmPrintPreview.prototype.print = function(css)
{
	var wnd = this.open(css);
	
	if (wnd != null)
	{
		wnd.print();
	}
};

bpmPrintPreview.prototype.close = function()
{
	if (this.wnd != null)
	{
		this.wnd.close();
		this.wnd = null;
	}
};



/* Stylesheet */
function bpmStylesheet()
{
	this.styles = new Object();
	
	this.putDefaultVertexStyle(this.createDefaultVertexStyle());
	this.putDefaultEdgeStyle(this.createDefaultEdgeStyle());
};

bpmStylesheet.prototype.styles;

bpmStylesheet.prototype.createDefaultVertexStyle = function()
{
	var style = new Object();
	
	style[bpmConstants.STYLE_SHAPE] = bpmConstants.SHAPE_RECTANGLE;
	style[bpmConstants.STYLE_PERIMETER] = bpmPerimeter.RectanglePerimeter;
	style[bpmConstants.STYLE_VERTICAL_ALIGN] = bpmConstants.ALIGN_MIDDLE;
	style[bpmConstants.STYLE_ALIGN] = bpmConstants.ALIGN_CENTER;
	style[bpmConstants.STYLE_FILLCOLOR] = '#C3D9FF';
	style[bpmConstants.STYLE_STROKECOLOR] = '#6482B9';
	style[bpmConstants.STYLE_FONTCOLOR] = '#774400';
	
	return style;
};

bpmStylesheet.prototype.createDefaultEdgeStyle = function()
{
	var style = new Object();
	
	style[bpmConstants.STYLE_SHAPE] = bpmConstants.SHAPE_CONNECTOR;
	style[bpmConstants.STYLE_ENDARROW] = bpmConstants.ARROW_CLASSIC;
	style[bpmConstants.STYLE_VERTICAL_ALIGN] = bpmConstants.ALIGN_MIDDLE;
	style[bpmConstants.STYLE_ALIGN] = bpmConstants.ALIGN_CENTER;
	style[bpmConstants.STYLE_STROKECOLOR] = '#6482B9';
	style[bpmConstants.STYLE_FONTCOLOR] = '#446299';
	
	return style;
};

bpmStylesheet.prototype.putDefaultVertexStyle = function(style)
{
	this.putCellStyle('defaultVertex', style);
};

bpmStylesheet.prototype.putDefaultEdgeStyle = function(style)
{
	this.putCellStyle('defaultEdge', style);
};

bpmStylesheet.prototype.getDefaultVertexStyle = function()
{
	return this.styles['defaultVertex'];
};

bpmStylesheet.prototype.getDefaultEdgeStyle = function()
{
	return this.styles['defaultEdge'];
};

bpmStylesheet.prototype.putCellStyle = function(name, style)
{
	this.styles[name] = style;
};

bpmStylesheet.prototype.getCellStyle = function(name, defaultStyle)
{
	var style = defaultStyle;
	
	if (name != null && name.length > 0)
	{
		var pairs = name.split(';');

		if (style != null &&
			name.charAt(0) != ';')
		{
			style = bpmUtils.clone(style);
		}
		else
		{
			style = new Object();
		}

	 	for (var i = 0; i < pairs.length; i++)
	 	{
	 		var tmp = pairs[i];
	 		var pos = tmp.indexOf('=');
	 		
	 		if (pos >= 0)
	 		{
		 		var key = tmp.substring(0, pos);
		 		var value = tmp.substring(pos + 1);

		 		if (value == bpmConstants.NONE)
		 		{
		 			delete style[key];
		 		}
		 		else if (bpmUtils.isNumeric(value))
		 		{
		 			style[key] = parseFloat(value);
		 		}
		 		else
		 		{
			 		style[key] = value;
		 		}
			}
	 		else
	 		{
				var tmpStyle = this.styles[tmp];
				
				if (tmpStyle != null)
				{
					for (var key in tmpStyle)
					{
						style[key] = tmpStyle[key];
					}
				}
	 		}
		}
	}
	
	return style;
};



/* CellState */
function bpmCellState(view, cell, style)
{
	this.view = view;
	this.cell = cell;
	this.style = (style != null) ? style : {};
	
	this.origin = new bpmPoint();
	this.absoluteOffset = new bpmPoint();
};

bpmCellState.prototype = new bpmRectangle();
bpmCellState.prototype.constructor = bpmCellState;
bpmCellState.prototype.view = null;
bpmCellState.prototype.cell = null;
bpmCellState.prototype.style = null;
bpmCellState.prototype.invalidStyle = false;
bpmCellState.prototype.invalid = true;
bpmCellState.prototype.origin = null;
bpmCellState.prototype.absolutePoints = null;
bpmCellState.prototype.absoluteOffset = null;
bpmCellState.prototype.visibleSourceState = null;
bpmCellState.prototype.visibleTargetState = null;
bpmCellState.prototype.terminalDistance = 0;
bpmCellState.prototype.length = 0;
bpmCellState.prototype.segments = null;
bpmCellState.prototype.shape = null;
bpmCellState.prototype.text = null;
bpmCellState.prototype.unscaledWidth = null;

bpmCellState.prototype.getPerimeterBounds = function(border, bounds)
{
	border = border || 0;
	bounds = (bounds != null) ? bounds : new bpmRectangle(this.x, this.y, this.width, this.height);
	
	if (this.shape != null && this.shape.stencil != null && this.shape.stencil.aspect == 'fixed')
	{
		var aspect = this.shape.stencil.computeAspect(this.style, bounds.x, bounds.y, bounds.width, bounds.height);
		
		bounds.x = aspect.x;
		bounds.y = aspect.y;
		bounds.width = this.shape.stencil.w0 * aspect.width;
		bounds.height = this.shape.stencil.h0 * aspect.height;
	}
	
	if (border != 0)
	{
		bounds.grow(border);
	}
	
	return bounds;
};

bpmCellState.prototype.setAbsoluteTerminalPoint = function(point, isSource)
{
	if (isSource)
	{
		if (this.absolutePoints == null)
		{
			this.absolutePoints = [];
		}
		
		if (this.absolutePoints.length == 0)
		{
			this.absolutePoints.push(point);
		}
		else
		{
			this.absolutePoints[0] = point;
		}
	}
	else
	{
		if (this.absolutePoints == null)
		{
			this.absolutePoints = [];
			this.absolutePoints.push(null);
			this.absolutePoints.push(point);
		}
		else if (this.absolutePoints.length == 1)
		{
			this.absolutePoints.push(point);
		}
		else
		{
			this.absolutePoints[this.absolutePoints.length - 1] = point;
		}
	}
};

bpmCellState.prototype.setCursor = function(cursor)
{
	if (this.shape != null)
	{
		this.shape.setCursor(cursor);
	}
	
	if (this.text != null)
	{
		this.text.setCursor(cursor);
	}
};

bpmCellState.prototype.getVisibleTerminal = function(source)
{
	var tmp = this.getVisibleTerminalState(source);
	
	return (tmp != null) ? tmp.cell : null;
};

bpmCellState.prototype.getVisibleTerminalState = function(source)
{
	return (source) ? this.visibleSourceState : this.visibleTargetState;
};

bpmCellState.prototype.setVisibleTerminalState = function(terminalState, source)
{
	if (source)
	{
		this.visibleSourceState = terminalState;
	}
	else
	{
		this.visibleTargetState = terminalState;
	}
};

bpmCellState.prototype.getCellBounds = function()
{
	return this.cellBounds;
};

bpmCellState.prototype.getPaintBounds = function()
{
	return this.paintBounds;
};

bpmCellState.prototype.updateCachedBounds = function()
{
	var tr = this.view.translate;
	var s = this.view.scale;
	this.cellBounds = new bpmRectangle(this.x / s - tr.x, this.y / s - tr.y, this.width / s, this.height / s);
	this.paintBounds = bpmRectangle.fromRectangle(this.cellBounds);
	
	if (this.shape != null && this.shape.isPaintBoundsInverted())
	{
		this.paintBounds.rotate90();
	}
};

bpmCellState.prototype.setState = function(state)
{
	this.view = state.view;
	this.cell = state.cell;
	this.style = state.style;
	this.absolutePoints = state.absolutePoints;
	this.origin = state.origin;
	this.absoluteOffset = state.absoluteOffset;
	this.boundingBox = state.boundingBox;
	this.terminalDistance = state.terminalDistance;
	this.segments = state.segments;
	this.length = state.length;
	this.x = state.x;
	this.y = state.y;
	this.width = state.width;
	this.height = state.height;
	this.unscaledWidth = state.unscaledWidth;
};

bpmCellState.prototype.clone = function()
{
 	var clone = new bpmCellState(this.view, this.cell, this.style);

	if (this.absolutePoints != null)
	{
		clone.absolutePoints = [];
		
		for (var i = 0; i < this.absolutePoints.length; i++)
		{
			clone.absolutePoints[i] = this.absolutePoints[i].clone();
		}
	}

	if (this.origin != null)
	{
		clone.origin = this.origin.clone();
	}

	if (this.absoluteOffset != null)
	{
		clone.absoluteOffset = this.absoluteOffset.clone();
	}

	if (this.boundingBox != null)
	{
		clone.boundingBox = this.boundingBox.clone();
	}

	clone.terminalDistance = this.terminalDistance;
	clone.segments = this.segments;
	clone.length = this.length;
	clone.x = this.x;
	clone.y = this.y;
	clone.width = this.width;
	clone.height = this.height;
	clone.unscaledWidth = this.unscaledWidth;
	
	return clone;
};

bpmCellState.prototype.destroy = function()
{
	this.view.graph.cellRenderer.destroy(this);
};



/* Draw Selection Model */
function bpmGraphSelectionModel(graph)
{
	this.graph = graph;
	this.cells = [];
};

bpmGraphSelectionModel.prototype = new bpmEventSource();
bpmGraphSelectionModel.prototype.constructor = bpmGraphSelectionModel;
bpmGraphSelectionModel.prototype.doneResource = (bpmCore.language != 'none') ? 'done' : '';
bpmGraphSelectionModel.prototype.updatingSelectionResource = (bpmCore.language != 'none') ? 'updatingSelection' : '';
bpmGraphSelectionModel.prototype.graph = null;
bpmGraphSelectionModel.prototype.singleSelection = false;

bpmGraphSelectionModel.prototype.isSingleSelection = function()
{
	return this.singleSelection;
};

bpmGraphSelectionModel.prototype.setSingleSelection = function(singleSelection)
{
	this.singleSelection = singleSelection;
};

bpmGraphSelectionModel.prototype.isSelected = function(cell)
{
	if (cell != null)
	{
		return bpmUtils.indexOf(this.cells, cell) >= 0;
	}
	
	return false;
};

bpmGraphSelectionModel.prototype.isEmpty = function()
{
	return this.cells.length == 0;
};

bpmGraphSelectionModel.prototype.clear = function()
{
	this.changeSelection(null, this.cells);
};

bpmGraphSelectionModel.prototype.setCell = function(cell)
{
	if (cell != null)
	{
		this.setCells([cell]);
	}
};

bpmGraphSelectionModel.prototype.setCells = function(cells)
{
	if (cells != null)
	{
		if (this.singleSelection)
		{
			cells = [this.getFirstSelectableCell(cells)];
		}
	
		var tmp = [];
		
		for (var i = 0; i < cells.length; i++)
		{
			if (this.graph.isCellSelectable(cells[i]))
			{
				tmp.push(cells[i]);
			}	
		}

		this.changeSelection(tmp, this.cells);
	}
};

bpmGraphSelectionModel.prototype.getFirstSelectableCell = function(cells)
{
	if (cells != null)
	{
		for (var i = 0; i < cells.length; i++)
		{
			if (this.graph.isCellSelectable(cells[i]))
			{
				return cells[i];
			}
		}
	}
	
	return null;
};

bpmGraphSelectionModel.prototype.addCell = function(cell)
{
	if (cell != null)
	{
		this.addCells([cell]);
	}
};

bpmGraphSelectionModel.prototype.addCells = function(cells)
{
	if (cells != null)
	{
		var remove = null;
		
		if (this.singleSelection)
		{
			remove = this.cells;
			cells = [this.getFirstSelectableCell(cells)];
		}

		var tmp = [];
		
		for (var i = 0; i < cells.length; i++)
		{
			if (!this.isSelected(cells[i]) &&
				this.graph.isCellSelectable(cells[i]))
			{
				tmp.push(cells[i]);
			}	
		}

		this.changeSelection(tmp, remove);
	}
};

bpmGraphSelectionModel.prototype.removeCell = function(cell)
{
	if (cell != null)
	{
		this.removeCells([cell]);
	}
};

bpmGraphSelectionModel.prototype.removeCells = function(cells)
{
	if (cells != null)
	{
		var tmp = [];
		
		for (var i = 0; i < cells.length; i++)
		{
			if (this.isSelected(cells[i]))
			{
				tmp.push(cells[i]);
			}
		}
		
		this.changeSelection(null, tmp);	
	}
};

bpmGraphSelectionModel.prototype.changeSelection = function(added, removed)
{
	if ((added != null &&
		added.length > 0 &&
		added[0] != null) ||
		(removed != null &&
		removed.length > 0 &&
		removed[0] != null))
	{
		var change = new bpmSelectionChange(this, added, removed);
		change.execute();
		var edit = new bpmUndoableEdit(this, false);
		edit.add(change);
		this.fireEvent(new bpmEventObject(bpmEvent.UNDO, 'edit', edit));
	}
};

bpmGraphSelectionModel.prototype.cellAdded = function(cell)
{
	if (cell != null &&
		!this.isSelected(cell))
	{
		this.cells.push(cell);
	}
};

bpmGraphSelectionModel.prototype.cellRemoved = function(cell)
{
	if (cell != null)
	{
		var index = bpmUtils.indexOf(this.cells, cell);
		
		if (index >= 0)
		{
			this.cells.splice(index, 1);
		}
	}
};

function bpmSelectionChange(selectionModel, added, removed)
{
	this.selectionModel = selectionModel;
	this.added = (added != null) ? added.slice() : null;
	this.removed = (removed != null) ? removed.slice() : null;
};

bpmSelectionChange.prototype.execute = function()
{
	var t0 = bpmLog.enter('bpmSelectionChange.execute');
	window.status = bpmResources.get(
		this.selectionModel.updatingSelectionResource) ||
		this.selectionModel.updatingSelectionResource;

	if (this.removed != null)
	{
		for (var i = 0; i < this.removed.length; i++)
		{
			this.selectionModel.cellRemoved(this.removed[i]);
		}
	}

	if (this.added != null)
	{
		for (var i = 0; i < this.added.length; i++)
		{
			this.selectionModel.cellAdded(this.added[i]);
		}
	}
	
	var tmp = this.added;
	this.added = this.removed;
	this.removed = tmp;

	window.status = bpmResources.get(this.selectionModel.doneResource) ||
		this.selectionModel.doneResource;
	bpmLog.leave('bpmSelectionChange.execute', t0);
	
	this.selectionModel.fireEvent(new bpmEventObject(bpmEvent.CHANGE,
			'added', this.added, 'removed', this.removed));
};



/* Cell Editor */
function bpmCellEditor(graph)
{
	this.graph = graph;
	
	this.zoomHandler = bpmUtils.bind(this, function()
	{
		if (this.graph.isEditing())
		{
			this.resize();
		}
	});
	
	this.graph.view.addListener(bpmEvent.SCALE, this.zoomHandler);
	this.graph.view.addListener(bpmEvent.SCALE_AND_TRANSLATE, this.zoomHandler);
	
	this.changeHandler = bpmUtils.bind(this, function(sender)
	{
		if (this.editingCell != null && this.graph.getView().getState(this.editingCell) == null)
		{
			this.stopEditing(true);
		}
	});

	this.graph.getModel().addListener(bpmEvent.CHANGE, this.changeHandler);
};

bpmCellEditor.prototype.graph = null;
bpmCellEditor.prototype.textarea = null;
bpmCellEditor.prototype.editingCell = null;
bpmCellEditor.prototype.trigger = null;
bpmCellEditor.prototype.modified = false;
bpmCellEditor.prototype.autoSize = true;
bpmCellEditor.prototype.selectText = true;
bpmCellEditor.prototype.emptyLabelText = (bpmCore.IS_FF) ? '<br>' : '';
bpmCellEditor.prototype.escapeCancelsEditing = true;
bpmCellEditor.prototype.textNode = '';
bpmCellEditor.prototype.zIndex = 5;
bpmCellEditor.prototype.minResize = new bpmRectangle(0, 20);
bpmCellEditor.prototype.wordWrapPadding = (bpmCore.IS_QUIRKS) ? 2 : (!bpmCore.IS_IE11) ? 1 : 0;
bpmCellEditor.prototype.blurEnabled = false;
bpmCellEditor.prototype.initialValue = null;
bpmCellEditor.prototype.align = null;

bpmCellEditor.prototype.init = function ()
{
	this.textarea = document.createElement('div');
	this.textarea.className = 'bpmCellEditor bpmPlainTextEditor';
	this.textarea.contentEditable = true;
	
	if (bpmCore.IS_GC)
	{
		this.textarea.style.minHeight = '1em';
	}

	this.textarea.style.position = ((this.isLegacyEditor())) ? 'absolute' : 'relative';
	this.installListeners(this.textarea);
};

bpmCellEditor.prototype.applyValue = function(state, value)
{
	this.graph.labelChanged(state.cell, value, this.trigger);
};

bpmCellEditor.prototype.setAlign = function (align)
{
	if (this.textarea != null)
	{
		this.textarea.style.textAlign = align;
	}
	
	this.align = align;
	this.resize();
};

bpmCellEditor.prototype.getInitialValue = function(state, trigger)
{
	var result = bpmUtils.htmlEntities(this.graph.getEditingValue(state.cell, trigger), false);
	
	if (!bpmCore.IS_QUIRKS && document.documentMode != 8 && document.documentMode != 9 &&
		document.documentMode != 10)
	{
		result = bpmUtils.replaceTrailingNewlines(result, '<div><br></div>');
	}
    
    return result.replace(/\n/g, '<br>');
};

bpmCellEditor.prototype.getCurrentValue = function(state)
{
	return bpmUtils.extractTextWithWhitespace(this.textarea.childNodes);
};

bpmCellEditor.prototype.isCancelEditingKeyEvent = function(evt)
{
	return this.escapeCancelsEditing || bpmEvent.isShiftDown(evt) || bpmEvent.isControlDown(evt) || bpmEvent.isMetaDown(evt);
};

bpmCellEditor.prototype.installListeners = function(elt)
{
	bpmEvent.addListener(elt, 'dragstart', bpmUtils.bind(this, function(evt)
	{
		this.graph.stopEditing(false);
		bpmEvent.consume(evt);
	}));

	bpmEvent.addListener(elt, 'blur', bpmUtils.bind(this, function(evt)
	{
		if (this.blurEnabled)
		{
			this.focusLost(evt);
		}
	}));

	bpmEvent.addListener(elt, 'keydown', bpmUtils.bind(this, function(evt)
	{
		if (!bpmEvent.isConsumed(evt))
		{
			if (this.isStopEditingEvent(evt))
			{
				this.graph.stopEditing(false);
				bpmEvent.consume(evt);
			}
			else if (evt.keyCode == 27 /* Escape */)
			{
				this.graph.stopEditing(this.isCancelEditingKeyEvent(evt));
				bpmEvent.consume(evt);
			}
		}
	}));

	var keypressHandler = bpmUtils.bind(this, function(evt)
	{
		if (this.editingCell != null)
		{
			if (this.clearOnChange && elt.innerHTML == this.getEmptyLabelText() &&
				(!bpmCore.IS_FF || (evt.keyCode != 8 /* Backspace */ && evt.keyCode != 46 /* Delete */)))
			{
				this.clearOnChange = false;
				elt.innerHTML = '';
			}
		}
	});

	bpmEvent.addListener(elt, 'keypress', keypressHandler);
	bpmEvent.addListener(elt, 'paste', keypressHandler);
	
	var keyupHandler = bpmUtils.bind(this, function(evt)
	{
		if (this.editingCell != null)
		{
			if (this.textarea.innerHTML.length == 0 || this.textarea.innerHTML == '<br>')
			{
				this.textarea.innerHTML = this.getEmptyLabelText();
				this.clearOnChange = this.textarea.innerHTML.length > 0;
			}
			else
			{
				this.clearOnChange = false;
			}
		}
	});

	bpmEvent.addListener(elt, (!bpmCore.IS_IE11 && !bpmCore.IS_IE) ? 'input' : 'keyup', keyupHandler);
	bpmEvent.addListener(elt, 'cut', keyupHandler);
	bpmEvent.addListener(elt, 'paste', keyupHandler);

	var evtName = (!bpmCore.IS_IE11 && !bpmCore.IS_IE) ? 'input' : 'keydown';
	
	var resizeHandler = bpmUtils.bind(this, function(evt)
	{
		if (this.editingCell != null && this.autoSize && !bpmEvent.isConsumed(evt))
		{
			if (this.resizeThread != null)
			{
				window.clearTimeout(this.resizeThread);
			}
			
			this.resizeThread = window.setTimeout(bpmUtils.bind(this, function()
			{
				this.resizeThread = null;
				this.resize();
			}), 0);
		}
	});
	
	bpmEvent.addListener(elt, evtName, resizeHandler);
	bpmEvent.addListener(window, 'resize', resizeHandler);

	if (document.documentMode >= 9)
	{
		bpmEvent.addListener(elt, 'DOMNodeRemoved', resizeHandler);
		bpmEvent.addListener(elt, 'DOMNodeInserted', resizeHandler);
	}
	else
	{
		bpmEvent.addListener(elt, 'cut', resizeHandler);
		bpmEvent.addListener(elt, 'paste', resizeHandler);
	}
};

bpmCellEditor.prototype.isStopEditingEvent = function(evt)
{
	return evt.keyCode == 113 /* F2 */ || (this.graph.isEnterStopsCellEditing() &&
		evt.keyCode == 13 /* Enter */ && !bpmEvent.isControlDown(evt) &&
		!bpmEvent.isShiftDown(evt));
};

bpmCellEditor.prototype.isEventSource = function(evt)
{
	return bpmEvent.getSource(evt) == this.textarea;
};

bpmCellEditor.prototype.resize = function()
{
	var state = this.graph.getView().getState(this.editingCell);
	
	if (state == null)
	{
		this.stopEditing(true);
	}
	else if (this.textarea != null)
	{
		var isEdge = this.graph.getModel().isEdge(state.cell);
 		var scale = this.graph.getView().scale;
 		var m = null;
		
		if (!this.autoSize || (state.style[bpmConstants.STYLE_OVERFLOW] == 'fill'))
		{
			this.bounds = this.getEditorBounds(state);
			this.textarea.style.width = Math.round(this.bounds.width / scale) + 'px';
			this.textarea.style.height = Math.round(this.bounds.height / scale) + 'px';
			
			if (document.documentMode == 8 || bpmCore.IS_QUIRKS)
			{
				this.textarea.style.left = Math.round(this.bounds.x) + 'px';
				this.textarea.style.top = Math.round(this.bounds.y) + 'px';
			}
			else
			{
				this.textarea.style.left = Math.max(0, Math.round(this.bounds.x + 1)) + 'px';
				this.textarea.style.top = Math.max(0, Math.round(this.bounds.y + 1)) + 'px';
			}
			
			if (this.graph.isWrapping(state.cell) && (this.bounds.width >= 2 || this.bounds.height >= 2) &&
				this.textarea.innerHTML != this.getEmptyLabelText())
			{
				this.textarea.style.wordWrap = bpmConstants.WORD_WRAP;
				this.textarea.style.whiteSpace = 'normal';
				
				if (state.style[bpmConstants.STYLE_OVERFLOW] != 'fill')
				{
					this.textarea.style.width = Math.round(this.bounds.width / scale) + this.wordWrapPadding + 'px';
				}
			}
			else
			{
				this.textarea.style.whiteSpace = 'nowrap';
				
				if (state.style[bpmConstants.STYLE_OVERFLOW] != 'fill')
				{
					this.textarea.style.width = '';
				}
			}
		}
		else
	 	{
	 		var lw = bpmUtils.getValue(state.style, bpmConstants.STYLE_LABEL_WIDTH, null);
			m = (state.text != null && this.align == null) ? state.text.margin : null;
			
			if (m == null)
			{
				m = bpmUtils.getAlignmentAsPoint(this.align || bpmUtils.getValue(state.style, bpmConstants.STYLE_ALIGN, bpmConstants.ALIGN_CENTER),
						bpmUtils.getValue(state.style, bpmConstants.STYLE_VERTICAL_ALIGN, bpmConstants.ALIGN_MIDDLE));
			}
			
	 		if (isEdge)
			{
				this.bounds = new bpmRectangle(state.absoluteOffset.x, state.absoluteOffset.y, 0, 0);
				
				if (lw != null)
			 	{
					var tmp = (parseFloat(lw) + 2) * scale;
					this.bounds.width = tmp;
					this.bounds.x += m.x * tmp;
			 	}
			}
			else
			{
				var bds = bpmRectangle.fromRectangle(state);
				var hpos = bpmUtils.getValue(state.style, bpmConstants.STYLE_LABEL_POSITION, bpmConstants.ALIGN_CENTER);
				var vpos = bpmUtils.getValue(state.style, bpmConstants.STYLE_VERTICAL_LABEL_POSITION, bpmConstants.ALIGN_MIDDLE);

				bds = (state.shape != null && hpos == bpmConstants.ALIGN_CENTER && vpos == bpmConstants.ALIGN_MIDDLE) ? state.shape.getLabelBounds(bds) : bds;
			 	
			 	if (lw != null)
			 	{
			 		bds.width = parseFloat(lw) * scale;
			 	}
			 	
			 	if (!state.view.graph.cellRenderer.legacySpacing || state.style[bpmConstants.STYLE_OVERFLOW] != 'width')
			 	{
					var spacing = parseInt(state.style[bpmConstants.STYLE_SPACING] || 2) * scale;
					var spacingTop = (parseInt(state.style[bpmConstants.STYLE_SPACING_TOP] || 0) + bpmText.prototype.baseSpacingTop) * scale + spacing;
					var spacingRight = (parseInt(state.style[bpmConstants.STYLE_SPACING_RIGHT] || 0) + bpmText.prototype.baseSpacingRight) * scale + spacing;
					var spacingBottom = (parseInt(state.style[bpmConstants.STYLE_SPACING_BOTTOM] || 0) + bpmText.prototype.baseSpacingBottom) * scale + spacing;
					var spacingLeft = (parseInt(state.style[bpmConstants.STYLE_SPACING_LEFT] || 0) + bpmText.prototype.baseSpacingLeft) * scale + spacing;
					
					var hpos = bpmUtils.getValue(state.style, bpmConstants.STYLE_LABEL_POSITION, bpmConstants.ALIGN_CENTER);
					var vpos = bpmUtils.getValue(state.style, bpmConstants.STYLE_VERTICAL_LABEL_POSITION, bpmConstants.ALIGN_MIDDLE);

					bds = new bpmRectangle(bds.x + spacingLeft, bds.y + spacingTop,
						bds.width - ((hpos == bpmConstants.ALIGN_CENTER && lw == null) ? (spacingLeft + spacingRight) : 0),
						bds.height - ((vpos == bpmConstants.ALIGN_MIDDLE) ? (spacingTop + spacingBottom) : 0));
			 	}

				this.bounds = new bpmRectangle(bds.x + state.absoluteOffset.x, bds.y + state.absoluteOffset.y, bds.width, bds.height);
			}

			if (this.graph.isWrapping(state.cell) && (this.bounds.width >= 2 || this.bounds.height >= 2) &&
				this.textarea.innerHTML != this.getEmptyLabelText())
			{
				this.textarea.style.wordWrap = bpmConstants.WORD_WRAP;
				this.textarea.style.whiteSpace = 'normal';
				
				var tmp = Math.round(this.bounds.width / ((document.documentMode == 8) ? scale : scale)) + this.wordWrapPadding;

				if (this.textarea.style.position != 'relative')
				{
					this.textarea.style.width = tmp + 'px';
					
					if (this.textarea.scrollWidth > tmp)
					{
						this.textarea.style.width = this.textarea.scrollWidth + 'px';
					}
				}
				else
				{
					this.textarea.style.maxWidth = tmp + 'px';
				}
			}
			else
			{
				this.textarea.style.whiteSpace = 'nowrap';
				this.textarea.style.width = '';
			}
			
			if (document.documentMode == 8)
			{
				this.textarea.style.zoom = '1';
				this.textarea.style.height = 'auto';
			}
			
			var ow = this.textarea.scrollWidth;
			var oh = this.textarea.scrollHeight;
			
			if (document.documentMode == 8)
			{
				this.textarea.style.left = Math.max(0, Math.ceil((this.bounds.x - m.x * (this.bounds.width - (ow + 1) * scale) + ow * (scale - 1) * 0 + (m.x + 0.5) * 2) / scale)) + 'px';
				this.textarea.style.top = Math.max(0, Math.ceil((this.bounds.y - m.y * (this.bounds.height - (oh + 0.5) * scale) + oh * (scale - 1) * 0 + Math.abs(m.y + 0.5) * 1) / scale)) + 'px';
				this.textarea.style.width = Math.round(ow * scale) + 'px';
				this.textarea.style.height = Math.round(oh * scale) + 'px';
			}
			else if (bpmCore.IS_QUIRKS)
			{			
				this.textarea.style.left = Math.max(0, Math.ceil(this.bounds.x - m.x * (this.bounds.width - (ow + 1) * scale) + ow * (scale - 1) * 0 + (m.x + 0.5) * 2)) + 'px';
				this.textarea.style.top = Math.max(0, Math.ceil(this.bounds.y - m.y * (this.bounds.height - (oh + 0.5) * scale) + oh * (scale - 1) * 0 + Math.abs(m.y + 0.5) * 1)) + 'px';
			}
			else
			{
				this.textarea.style.left = Math.max(0, Math.round(this.bounds.x - m.x * (this.bounds.width - 2)) + 1) + 'px';
				this.textarea.style.top = Math.max(0, Math.round(this.bounds.y - m.y * (this.bounds.height - 4) + ((m.y == -1) ? 3 : 0)) + 1) + 'px';
			}
	 	}

		if (bpmCore.IS_VML)
		{
			this.textarea.style.zoom = scale;
		}
		else
		{
			bpmUtils.setPrefixedStyle(this.textarea.style, 'transformOrigin', '0px 0px');
			bpmUtils.setPrefixedStyle(this.textarea.style, 'transform',
				'scale(' + scale + ',' + scale + ')' + ((m == null) ? '' :
				' translate(' + (m.x * 100) + '%,' + (m.y * 100) + '%)'));
		}
	}
};

bpmCellEditor.prototype.focusLost = function()
{
	this.stopEditing(!this.graph.isInvokesStopCellEditing());
};

bpmCellEditor.prototype.getBackgroundColor = function(state)
{
	return null;
};

bpmCellEditor.prototype.isLegacyEditor = function()
{
	if (bpmCore.IS_VML)
	{
		return true;
	}
	else
	{
		var absoluteRoot = false;
		
		if (bpmCore.IS_SVG)
		{
			var root = this.graph.view.getDrawPane().ownerSVGElement;
			
			if (root != null)
			{
				absoluteRoot = bpmUtils.getCurrentStyle(root).position == 'absolute';
			}
		}
		
		return !absoluteRoot;
	}
};

bpmCellEditor.prototype.startEditing = function(cell, trigger)
{
	this.stopEditing(true);
	this.align = null;
	
	if (this.textarea == null)
	{
		this.init();
	}
	
	if (this.graph.tooltipHandler != null)
	{
		this.graph.tooltipHandler.hideTooltip();
	}
	
	var state = this.graph.getView().getState(cell);
	
	if (state != null)
	{
		var scale = this.graph.getView().scale;
		var size = bpmUtils.getValue(state.style, bpmConstants.STYLE_FONTSIZE, bpmConstants.DEFAULT_FONTSIZE);
		var family = bpmUtils.getValue(state.style, bpmConstants.STYLE_FONTFAMILY, bpmConstants.DEFAULT_FONTFAMILY);
		var color = bpmUtils.getValue(state.style, bpmConstants.STYLE_FONTCOLOR, 'black');
		var align = bpmUtils.getValue(state.style, bpmConstants.STYLE_ALIGN, bpmConstants.ALIGN_LEFT);
		var bold = (bpmUtils.getValue(state.style, bpmConstants.STYLE_FONTSTYLE, 0) &
				bpmConstants.FONT_BOLD) == bpmConstants.FONT_BOLD;
		var italic = (bpmUtils.getValue(state.style, bpmConstants.STYLE_FONTSTYLE, 0) &
				bpmConstants.FONT_ITALIC) == bpmConstants.FONT_ITALIC;
		var uline = (bpmUtils.getValue(state.style, bpmConstants.STYLE_FONTSTYLE, 0) &
				bpmConstants.FONT_UNDERLINE) == bpmConstants.FONT_UNDERLINE;
		
		this.textarea.style.lineHeight = (bpmConstants.ABSOLUTE_LINE_HEIGHT) ? Math.round(size * bpmConstants.LINE_HEIGHT) + 'px' : bpmConstants.LINE_HEIGHT;
		this.textarea.style.backgroundColor = this.getBackgroundColor(state);
		this.textarea.style.textDecoration = (uline) ? 'underline' : '';
		this.textarea.style.fontWeight = (bold) ? 'bold' : 'normal';
		this.textarea.style.fontStyle = (italic) ? 'italic' : '';
		this.textarea.style.fontSize = Math.round(size) + 'px';
		this.textarea.style.zIndex = this.zIndex;
		this.textarea.style.fontFamily = family;
		this.textarea.style.textAlign = align;
		this.textarea.style.outline = 'none';
		this.textarea.style.color = color;
		
		var dir = this.textDirection = bpmUtils.getValue(state.style, bpmConstants.STYLE_TEXT_DIRECTION, bpmConstants.DEFAULT_TEXT_DIRECTION);
		
		if (dir == bpmConstants.TEXT_DIRECTION_AUTO)
		{
			if (state != null && state.text != null && state.text.dialect != bpmConstants.DIALECT_STRICTHTML &&
				!bpmUtils.isNode(state.text.value))
			{
				dir = state.text.getAutoDirection();
			}
		}
		
		if (dir == bpmConstants.TEXT_DIRECTION_LTR || dir == bpmConstants.TEXT_DIRECTION_RTL)
		{
			this.textarea.setAttribute('dir', dir);
		}
		else
		{
			this.textarea.removeAttribute('dir');
		}

		this.textarea.innerHTML = this.getInitialValue(state, trigger) || '';
		this.initialValue = this.textarea.innerHTML;

		if (this.textarea.innerHTML.length == 0 || this.textarea.innerHTML == '<br>')
		{
			this.textarea.innerHTML = this.getEmptyLabelText();
			this.clearOnChange = true;
		}
		else
		{
			this.clearOnChange = this.textarea.innerHTML == this.getEmptyLabelText();
		}

		this.graph.container.appendChild(this.textarea);
		
		this.editingCell = cell;
		this.trigger = trigger;
		this.textNode = null;

		if (state.text != null && this.isHideLabel(state))
		{
			this.textNode = state.text.node;
			this.textNode.style.visibility = 'hidden';
		}

		if (this.autoSize && (this.graph.model.isEdge(state.cell) || state.style[bpmConstants.STYLE_OVERFLOW] != 'fill'))
		{
			window.setTimeout(bpmUtils.bind(this, function()
			{
				this.resize();
			}), 0);
		}
		
		this.resize();
		
		try
		{
			this.textarea.focus();
			
			if (this.isSelectText() && this.textarea.innerHTML.length > 0 &&
				(this.textarea.innerHTML != this.getEmptyLabelText() || !this.clearOnChange))
			{
				document.execCommand('selectAll', false, null);
			}
		}
		catch (e)
		{
			// ignore
		}
	}
};

bpmCellEditor.prototype.isSelectText = function()
{
	return this.selectText;
};

bpmCellEditor.prototype.clearSelection = function()
{
	var selection = null;
	
	if (window.getSelection)
	{
		selection = window.getSelection();
	}
	else if (document.selection)
	{
		selection = document.selection;
	}
	
	if (selection != null)
	{
		if (selection.empty)
		{
			selection.empty();
		}
		else if (selection.removeAllRanges)
		{
			selection.removeAllRanges();
		}
	}
};

bpmCellEditor.prototype.stopEditing = function(cancel)
{
	cancel = cancel || false;
	
	if (this.editingCell != null)
	{
		if (this.textNode != null)
		{
			this.textNode.style.visibility = 'visible';
			this.textNode = null;
		}

		var state = (!cancel) ? this.graph.view.getState(this.editingCell) : null;

		var initial = this.initialValue;
		this.initialValue = null;
		this.editingCell = null;
		this.trigger = null;
		this.bounds = null;
		this.textarea.blur();
		this.clearSelection();
		
		if (this.textarea.parentNode != null)
		{
			this.textarea.parentNode.removeChild(this.textarea);
		}
		
		if (this.clearOnChange && this.textarea.innerHTML == this.getEmptyLabelText())
		{
			this.textarea.innerHTML = '';
			this.clearOnChange = false;
		}

		if (state != null && (this.textarea.innerHTML != initial || this.align != null))
		{
			this.prepareTextarea();
			var value = this.getCurrentValue(state);
			
			this.graph.getModel().beginUpdate();
			try
			{
				if (value != null)
				{
					this.applyValue(state, value);
				}
				
				if (this.align != null)
				{
					this.graph.setCellStyles(bpmConstants.STYLE_ALIGN, this.align, [state.cell]);
				}
			}
			finally
			{
				this.graph.getModel().endUpdate();
			}
		}
		
		bpmEvent.release(this.textarea);
		this.textarea = null;
		this.align = null;
	}
};

bpmCellEditor.prototype.prepareTextarea = function()
{
	if (this.textarea.lastChild != null &&
		this.textarea.lastChild.nodeName == 'BR')
	{
		this.textarea.removeChild(this.textarea.lastChild);
	}
};

bpmCellEditor.prototype.isHideLabel = function(state)
{
	return true;
};

bpmCellEditor.prototype.getMinimumSize = function(state)
{
	var scale = this.graph.getView().scale;
	
	return new bpmRectangle(0, 0, (state.text == null) ? 30 : state.text.size * scale + 20,
			(this.textarea.style.textAlign == 'left') ? 120 : 40);
};

bpmCellEditor.prototype.getEditorBounds = function(state)
{
	var isEdge = this.graph.getModel().isEdge(state.cell);
	var scale = this.graph.getView().scale;
	var minSize = this.getMinimumSize(state);
	var minWidth = minSize.width;
 	var minHeight = minSize.height;
 	var result = null;
 	
 	if (!isEdge && state.view.graph.cellRenderer.legacySpacing && state.style[bpmConstants.STYLE_OVERFLOW] == 'fill')
 	{
 		result = state.shape.getLabelBounds(bpmRectangle.fromRectangle(state));
 	}
 	else
 	{
		var spacing = parseInt(state.style[bpmConstants.STYLE_SPACING] || 0) * scale;
		var spacingTop = (parseInt(state.style[bpmConstants.STYLE_SPACING_TOP] || 0) + bpmText.prototype.baseSpacingTop) * scale + spacing;
		var spacingRight = (parseInt(state.style[bpmConstants.STYLE_SPACING_RIGHT] || 0) + bpmText.prototype.baseSpacingRight) * scale + spacing;
		var spacingBottom = (parseInt(state.style[bpmConstants.STYLE_SPACING_BOTTOM] || 0) + bpmText.prototype.baseSpacingBottom) * scale + spacing;
		var spacingLeft = (parseInt(state.style[bpmConstants.STYLE_SPACING_LEFT] || 0) + bpmText.prototype.baseSpacingLeft) * scale + spacing;
	
	 	result = new bpmRectangle(state.x, state.y,
	 		 Math.max(minWidth, state.width - spacingLeft - spacingRight),
	 		 Math.max(minHeight, state.height - spacingTop - spacingBottom));
		var hpos = bpmUtils.getValue(state.style, bpmConstants.STYLE_LABEL_POSITION, bpmConstants.ALIGN_CENTER);
		var vpos = bpmUtils.getValue(state.style, bpmConstants.STYLE_VERTICAL_LABEL_POSITION, bpmConstants.ALIGN_MIDDLE);
		
		result = (state.shape != null && hpos == bpmConstants.ALIGN_CENTER && vpos == bpmConstants.ALIGN_MIDDLE) ? state.shape.getLabelBounds(result) : result;
	
		if (isEdge)
		{
			result.x = state.absoluteOffset.x;
			result.y = state.absoluteOffset.y;
	
			if (state.text != null && state.text.boundingBox != null)
			{
				if (state.text.boundingBox.x > 0)
				{
					result.x = state.text.boundingBox.x;
				}
				
				if (state.text.boundingBox.y > 0)
				{
					result.y = state.text.boundingBox.y;
				}
			}
		}
		else if (state.text != null && state.text.boundingBox != null)
		{
			result.x = Math.min(result.x, state.text.boundingBox.x);
			result.y = Math.min(result.y, state.text.boundingBox.y);
		}
	
		result.x += spacingLeft;
		result.y += spacingTop;
	
		if (state.text != null && state.text.boundingBox != null)
		{
			if (!isEdge)
			{
				result.width = Math.max(result.width, state.text.boundingBox.width);
				result.height = Math.max(result.height, state.text.boundingBox.height);
			}
			else
			{
				result.width = Math.max(minWidth, state.text.boundingBox.width);
				result.height = Math.max(minHeight, state.text.boundingBox.height);
			}
		}
		
		if (this.graph.getModel().isVertex(state.cell))
		{
			var horizontal = bpmUtils.getValue(state.style, bpmConstants.STYLE_LABEL_POSITION, bpmConstants.ALIGN_CENTER);
	
			if (horizontal == bpmConstants.ALIGN_LEFT)
			{
				result.x -= state.width;
			}
			else if (horizontal == bpmConstants.ALIGN_RIGHT)
			{
				result.x += state.width;
			}
	
			var vertical = bpmUtils.getValue(state.style, bpmConstants.STYLE_VERTICAL_LABEL_POSITION, bpmConstants.ALIGN_MIDDLE);
	
			if (vertical == bpmConstants.ALIGN_TOP)
			{
				result.y -= state.height;
			}
			else if (vertical == bpmConstants.ALIGN_BOTTOM)
			{
				result.y += state.height;
			}
		}
 	}
 	
 	return new bpmRectangle(Math.round(result.x), Math.round(result.y), Math.round(result.width), Math.round(result.height));
};

bpmCellEditor.prototype.getEmptyLabelText = function (cell)
{
	return this.emptyLabelText;
};

bpmCellEditor.prototype.getEditingCell = function ()
{
	return this.editingCell;
};

bpmCellEditor.prototype.destroy = function ()
{
	if (this.textarea != null)
	{
		bpmEvent.release(this.textarea);
		
		if (this.textarea.parentNode != null)
		{
			this.textarea.parentNode.removeChild(this.textarea);
		}
		
		this.textarea = null;

	}
			
	if (this.changeHandler != null)
	{
		this.graph.getModel().removeListener(this.changeHandler);
		this.changeHandler = null;
	}

	if (this.zoomHandler)
	{
		this.graph.view.removeListener(this.zoomHandler);
		this.zoomHandler = null;
	}
};



/* Cell Renderer */
function bpmCellRenderer() { };

bpmCellRenderer.defaultShapes = new Object();

bpmCellRenderer.prototype.defaultEdgeShape = bpmConnector;
bpmCellRenderer.prototype.defaultVertexShape = bpmRectangleShape;
bpmCellRenderer.prototype.defaultTextShape = bpmText;
bpmCellRenderer.prototype.legacyControlPosition = true;
bpmCellRenderer.prototype.legacySpacing = true;
bpmCellRenderer.prototype.antiAlias = true;
bpmCellRenderer.prototype.minSvgStrokeWidth = 1;
bpmCellRenderer.prototype.forceControlClickHandler = false;

bpmCellRenderer.registerShape = function(key, shape)
{
	bpmCellRenderer.defaultShapes[key] = shape;
};

bpmCellRenderer.registerShape(bpmConstants.SHAPE_RECTANGLE, bpmRectangleShape);
bpmCellRenderer.registerShape(bpmConstants.SHAPE_ELLIPSE, bpmEllipse);
bpmCellRenderer.registerShape(bpmConstants.SHAPE_RHOMBUS, bpmRhombus);
bpmCellRenderer.registerShape(bpmConstants.SHAPE_CYLINDER, bpmCylinder);
bpmCellRenderer.registerShape(bpmConstants.SHAPE_CONNECTOR, bpmConnector);
bpmCellRenderer.registerShape(bpmConstants.SHAPE_ACTOR, bpmActor);
bpmCellRenderer.registerShape(bpmConstants.SHAPE_TRIANGLE, bpmTriangle);
bpmCellRenderer.registerShape(bpmConstants.SHAPE_HEXAGON, bpmHexagon);
bpmCellRenderer.registerShape(bpmConstants.SHAPE_CLOUD, bpmCloud);
bpmCellRenderer.registerShape(bpmConstants.SHAPE_LINE, bpmLine);
bpmCellRenderer.registerShape(bpmConstants.SHAPE_ARROW, bpmArrow);
bpmCellRenderer.registerShape(bpmConstants.SHAPE_ARROW_CONNECTOR, bpmArrowConnector);
bpmCellRenderer.registerShape(bpmConstants.SHAPE_DOUBLE_ELLIPSE, bpmDoubleEllipse);
bpmCellRenderer.registerShape(bpmConstants.SHAPE_SWIMLANE, bpmSwimlane);
bpmCellRenderer.registerShape(bpmConstants.SHAPE_IMAGE, bpmImageShape);
bpmCellRenderer.registerShape(bpmConstants.SHAPE_LABEL, bpmLabel);

bpmCellRenderer.prototype.initializeShape = function(state)
{
	state.shape.dialect = state.view.graph.dialect;
	this.configureShape(state);
	state.shape.init(state.view.getDrawPane());
};

bpmCellRenderer.prototype.createShape = function(state)
{
	var shape = null;
	
	if (state.style != null)
	{
		var stencil = bpmStencilRegistry.getStencil(state.style[bpmConstants.STYLE_SHAPE]);
		
		if (stencil != null)
		{
			shape = new bpmShape(stencil);
		}
		else
		{
			var ctor = this.getShapeConstructor(state);
			shape = new ctor();
		}
	}
	
	return shape;
};

bpmCellRenderer.prototype.createIndicatorShape = function(state)
{
	state.shape.indicatorShape = this.getShape(state.view.graph.getIndicatorShape(state));
};

bpmCellRenderer.prototype.getShape = function(name)
{
	return (name != null) ? bpmCellRenderer.defaultShapes[name] : null;
};

bpmCellRenderer.prototype.getShapeConstructor = function(state)
{
	var ctor = this.getShape(state.style[bpmConstants.STYLE_SHAPE]);
	
	if (ctor == null)
	{
		ctor = (state.view.graph.getModel().isEdge(state.cell)) ?
			this.defaultEdgeShape : this.defaultVertexShape;
	}
	
	return ctor;
};

bpmCellRenderer.prototype.configureShape = function(state)
{
	state.shape.apply(state);
	state.shape.image = state.view.graph.getImage(state);
	state.shape.indicatorColor = state.view.graph.getIndicatorColor(state);
	state.shape.indicatorStrokeColor = state.style[bpmConstants.STYLE_INDICATOR_STROKECOLOR];
	state.shape.indicatorGradientColor = state.view.graph.getIndicatorGradientColor(state);
	state.shape.indicatorDirection = state.style[bpmConstants.STYLE_INDICATOR_DIRECTION];
	state.shape.indicatorImage = state.view.graph.getIndicatorImage(state);

	this.postConfigureShape(state);
};

bpmCellRenderer.prototype.postConfigureShape = function(state)
{
	if (state.shape != null)
	{
		this.resolveColor(state, 'indicatorColor', bpmConstants.STYLE_FILLCOLOR);
		this.resolveColor(state, 'indicatorGradientColor', bpmConstants.STYLE_GRADIENTCOLOR);
		this.resolveColor(state, 'fill', bpmConstants.STYLE_FILLCOLOR);
		this.resolveColor(state, 'stroke', bpmConstants.STYLE_STROKECOLOR);
		this.resolveColor(state, 'gradient', bpmConstants.STYLE_GRADIENTCOLOR);
	}
};

bpmCellRenderer.prototype.checkPlaceholderStyles = function(state)
{
	if (state.style != null)
	{
		var values = ['inherit', 'swimlane', 'indicated'];
		var styles = [bpmConstants.STYLE_FILLCOLOR, bpmConstants.STYLE_STROKECOLOR, bpmConstants.STYLE_GRADIENTCOLOR];
		
		for (var i = 0; i < styles.length; i++)
		{
			if (bpmUtils.indexOf(values, state.style[styles[i]]) >= 0)
			{
				return true;
			}
		}
	}
	
	return false;
};

bpmCellRenderer.prototype.resolveColor = function(state, field, key)
{
	var value = state.shape[field];
	var graph = state.view.graph;
	var referenced = null;
	
	if (value == 'inherit')
	{
		referenced = graph.model.getParent(state.cell);
	}
	else if (value == 'swimlane')
	{
		state.shape[field] = (key == bpmConstants.STYLE_STROKECOLOR) ? '#000000' : '#ffffff';
		
		if (graph.model.getTerminal(state.cell, false) != null)
		{
			referenced = graph.model.getTerminal(state.cell, false);
		}
		else
		{
			referenced = state.cell;
		}
		
		referenced = graph.getSwimlane(referenced);
		key = graph.swimlaneIndicatorColorAttribute;
	}
	else if (value == 'indicated')
	{
		state.shape[field] = state.shape.indicatorColor;
	}
	
	if (referenced != null)
	{
		var rstate = graph.getView().getState(referenced);
		state.shape[field] = null;

		if (rstate != null)
		{
			if (rstate.shape != null && field != 'indicatorColor')
			{
				state.shape[field] = rstate.shape[field];
			}
			else
			{
				state.shape[field] = rstate.style[key];
			}
		}
	}
};

bpmCellRenderer.prototype.getLabelValue = function(state)
{
	return state.view.graph.getLabel(state.cell);
};

bpmCellRenderer.prototype.createLabel = function(state, value)
{
	var graph = state.view.graph;
	var isEdge = graph.getModel().isEdge(state.cell);
	
	if (state.style[bpmConstants.STYLE_FONTSIZE] > 0 || state.style[bpmConstants.STYLE_FONTSIZE] == null)
	{
		var isForceHtml = (graph.isHtmlLabel(state.cell) || (value != null && bpmUtils.isNode(value)));

		state.text = new this.defaultTextShape(value, new bpmRectangle(),
				(state.style[bpmConstants.STYLE_ALIGN] || bpmConstants.ALIGN_CENTER),
				graph.getVerticalAlign(state),
				state.style[bpmConstants.STYLE_FONTCOLOR],
				state.style[bpmConstants.STYLE_FONTFAMILY],
				state.style[bpmConstants.STYLE_FONTSIZE],
				state.style[bpmConstants.STYLE_FONTSTYLE],
				state.style[bpmConstants.STYLE_SPACING],
				state.style[bpmConstants.STYLE_SPACING_TOP],
				state.style[bpmConstants.STYLE_SPACING_RIGHT],
				state.style[bpmConstants.STYLE_SPACING_BOTTOM],
				state.style[bpmConstants.STYLE_SPACING_LEFT],
				state.style[bpmConstants.STYLE_HORIZONTAL],
				state.style[bpmConstants.STYLE_LABEL_BACKGROUNDCOLOR],
				state.style[bpmConstants.STYLE_LABEL_BORDERCOLOR],
				graph.isWrapping(state.cell) && graph.isHtmlLabel(state.cell),
				graph.isLabelClipped(state.cell),
				state.style[bpmConstants.STYLE_OVERFLOW],
				state.style[bpmConstants.STYLE_LABEL_PADDING],
				bpmUtils.getValue(state.style, bpmConstants.STYLE_TEXT_DIRECTION, bpmConstants.DEFAULT_TEXT_DIRECTION));
		state.text.opacity = bpmUtils.getValue(state.style, bpmConstants.STYLE_TEXT_OPACITY, 100);
		state.text.dialect = (isForceHtml) ? bpmConstants.DIALECT_STRICTHTML : state.view.graph.dialect;
		state.text.style = state.style;
		state.text.state = state;
		this.initializeLabel(state, state.text);
		
		var forceGetCell = false;
		
		var getState = function(evt)
		{
			var result = state;

			if (bpmCore.IS_TOUCH || forceGetCell)
			{
				var x = bpmEvent.getClientX(evt);
				var y = bpmEvent.getClientY(evt);
				var pt = bpmUtils.convertPoint(graph.container, x, y);
				result = graph.view.getState(graph.getCellAt(pt.x, pt.y));
			}
			
			return result;
		};
		
		bpmEvent.addGestureListeners(state.text.node,
			bpmUtils.bind(this, function(evt)
			{
				if (this.isLabelEvent(state, evt))
				{
					graph.fireMouseEvent(bpmEvent.MOUSE_DOWN, new bpmMouseEvent(evt, state));
					forceGetCell = graph.dialect != bpmConstants.DIALECT_SVG &&
						bpmEvent.getSource(evt).nodeName == 'IMG';
				}
			}),
			bpmUtils.bind(this, function(evt)
			{
				if (this.isLabelEvent(state, evt))
				{
					graph.fireMouseEvent(bpmEvent.MOUSE_MOVE, new bpmMouseEvent(evt, getState(evt)));
				}
			}),
			bpmUtils.bind(this, function(evt)
			{
				if (this.isLabelEvent(state, evt))
				{
					graph.fireMouseEvent(bpmEvent.MOUSE_UP, new bpmMouseEvent(evt, getState(evt)));
					forceGetCell = false;
				}
			})
		);

		if (graph.nativeDblClickEnabled)
		{
			bpmEvent.addListener(state.text.node, 'dblclick',
				bpmUtils.bind(this, function(evt)
				{
					if (this.isLabelEvent(state, evt))
					{
						graph.dblClick(evt, state.cell);
						bpmEvent.consume(evt);
					}
				})
			);
		}
	}
};

bpmCellRenderer.prototype.initializeLabel = function(state, shape)
{
	if (bpmCore.IS_SVG && bpmCore.NO_FO && shape.dialect != bpmConstants.DIALECT_SVG)
	{
		shape.init(state.view.graph.container);
	}
	else
	{
		shape.init(state.view.getDrawPane());
	}
};

bpmCellRenderer.prototype.createCellOverlays = function(state)
{
	var graph = state.view.graph;
	var overlays = graph.getCellOverlays(state.cell);
	var dict = null;
	
	if (overlays != null)
	{
		dict = new bpmDictionary();
		
		for (var i = 0; i < overlays.length; i++)
		{
			var shape = (state.overlays != null) ? state.overlays.remove(overlays[i]) : null;
			
			if (shape == null)
			{
				var tmp = new bpmImageShape(new bpmRectangle(), overlays[i].image.src);
				tmp.dialect = state.view.graph.dialect;
				tmp.preserveImageAspect = false;
				tmp.overlay = overlays[i];
				this.initializeOverlay(state, tmp);
				this.installCellOverlayListeners(state, overlays[i], tmp);
	
				if (overlays[i].cursor != null)
				{
					tmp.node.style.cursor = overlays[i].cursor;
				}
				
				dict.put(overlays[i], tmp);
			}
			else
			{
				dict.put(overlays[i], shape);
			}
		}
	}
	
	if (state.overlays != null)
	{
		state.overlays.visit(function(id, shape)
		{
			shape.destroy();
		});
	}
	
	state.overlays = dict;
};

bpmCellRenderer.prototype.initializeOverlay = function(state, overlay)
{
	overlay.init(state.view.getOverlayPane());
};

bpmCellRenderer.prototype.installCellOverlayListeners = function(state, overlay, shape)
{
	var graph  = state.view.graph;
	
	bpmEvent.addListener(shape.node, 'click', function (evt)
	{
		if (graph.isEditing())
		{
			graph.stopEditing(!graph.isInvokesStopCellEditing());
		}
		
		overlay.fireEvent(new bpmEventObject(bpmEvent.CLICK,
				'event', evt, 'cell', state.cell));
	});
	
	bpmEvent.addGestureListeners(shape.node,
		function (evt)
		{
			bpmEvent.consume(evt);
		},
		function (evt)
		{
			graph.fireMouseEvent(bpmEvent.MOUSE_MOVE,
				new bpmMouseEvent(evt, state));
		});
	
	if (bpmCore.IS_TOUCH)
	{
		bpmEvent.addListener(shape.node, 'touchend', function (evt)
		{
			overlay.fireEvent(new bpmEventObject(bpmEvent.CLICK,
					'event', evt, 'cell', state.cell));
		});
	}
};

bpmCellRenderer.prototype.createControl = function(state)
{
	var graph = state.view.graph;
	var image = graph.getFoldingImage(state);
	
	if (graph.foldingEnabled && image != null)
	{
		if (state.control == null)
		{
			var b = new bpmRectangle(0, 0, image.width, image.height);
			state.control = new bpmImageShape(b, image.src);
			state.control.preserveImageAspect = false;
			state.control.dialect = graph.dialect;

			this.initControl(state, state.control, true, this.createControlClickHandler(state));
		}
	}
	else if (state.control != null)
	{
		state.control.destroy();
		state.control = null;
	}
};

bpmCellRenderer.prototype.createControlClickHandler = function(state)
{
	var graph = state.view.graph;
	
	return bpmUtils.bind(this, function (evt)
	{
		if (this.forceControlClickHandler || graph.isEnabled())
		{
			var collapse = !graph.isCellCollapsed(state.cell);
			graph.foldCells(collapse, false, [state.cell], null, evt);
			bpmEvent.consume(evt);
		}
	});
};

bpmCellRenderer.prototype.initControl = function(state, control, handleEvents, clickHandler)
{
	var graph = state.view.graph;
	
	var isForceHtml = graph.isHtmlLabel(state.cell) && bpmCore.NO_FO &&
		graph.dialect == bpmConstants.DIALECT_SVG;

	if (isForceHtml)
	{
		control.dialect = bpmConstants.DIALECT_PREFERHTML;
		control.init(graph.container);
		control.node.style.zIndex = 1;
	}
	else
	{
		control.init(state.view.getOverlayPane());
	}

	var node = control.innerNode || control.node;
	
	if (clickHandler != null && !bpmCore.IS_IOS)
	{
		if (graph.isEnabled())
		{
			node.style.cursor = 'pointer';
		}
		
		bpmEvent.addListener(node, 'click', clickHandler);
	}
	
	if (handleEvents)
	{
		var first = null;

		bpmEvent.addGestureListeners(node,
			function (evt)
			{
				first = new bpmPoint(bpmEvent.getClientX(evt), bpmEvent.getClientY(evt));
				graph.fireMouseEvent(bpmEvent.MOUSE_DOWN, new bpmMouseEvent(evt, state));
				bpmEvent.consume(evt);
			},
			function (evt)
			{
				graph.fireMouseEvent(bpmEvent.MOUSE_MOVE, new bpmMouseEvent(evt, state));
			},
			function (evt)
			{
				graph.fireMouseEvent(bpmEvent.MOUSE_UP, new bpmMouseEvent(evt, state));
				bpmEvent.consume(evt);
			});
		
		if (clickHandler != null && bpmCore.IS_IOS)
		{
			node.addEventListener('touchend', function(evt)
			{
				if (first != null)
				{
					var tol = graph.tolerance;
					
					if (Math.abs(first.x - bpmEvent.getClientX(evt)) < tol &&
						Math.abs(first.y - bpmEvent.getClientY(evt)) < tol)
					{
						clickHandler.call(clickHandler, evt);
						bpmEvent.consume(evt);
					}
				}
			}, true);
		}
	}
	
	return node;
};

bpmCellRenderer.prototype.isShapeEvent = function(state, evt)
{
	return true;
};

bpmCellRenderer.prototype.isLabelEvent = function(state, evt)
{
	return true;
};

bpmCellRenderer.prototype.installListeners = function(state)
{
	var graph = state.view.graph;

	var getState = function(evt)
	{
		var result = state;
		
		if ((graph.dialect != bpmConstants.DIALECT_SVG && bpmEvent.getSource(evt).nodeName == 'IMG') || bpmCore.IS_TOUCH)
		{
			var x = bpmEvent.getClientX(evt);
			var y = bpmEvent.getClientY(evt);
			
			var pt = bpmUtils.convertPoint(graph.container, x, y);
			result = graph.view.getState(graph.getCellAt(pt.x, pt.y));
		}
		
		return result;
	};

	bpmEvent.addGestureListeners(state.shape.node,
		bpmUtils.bind(this, function(evt)
		{
			if (this.isShapeEvent(state, evt))
			{
				graph.fireMouseEvent(bpmEvent.MOUSE_DOWN, new bpmMouseEvent(evt, state));
			}
		}),
		bpmUtils.bind(this, function(evt)
		{
			if (this.isShapeEvent(state, evt))
			{
				graph.fireMouseEvent(bpmEvent.MOUSE_MOVE, new bpmMouseEvent(evt, getState(evt)));
			}
		}),
		bpmUtils.bind(this, function(evt)
		{
			if (this.isShapeEvent(state, evt))
			{
				graph.fireMouseEvent(bpmEvent.MOUSE_UP, new bpmMouseEvent(evt, getState(evt)));
			}
		})
	);
	
	if (graph.nativeDblClickEnabled)
	{
		bpmEvent.addListener(state.shape.node, 'dblclick',
			bpmUtils.bind(this, function(evt)
			{
				if (this.isShapeEvent(state, evt))
				{
					graph.dblClick(evt, state.cell);
					bpmEvent.consume(evt);
				}
			})
		);
	}
};

bpmCellRenderer.prototype.redrawLabel = function(state, forced)
{
	var graph = state.view.graph;
	var value = this.getLabelValue(state);
	var wrapping = graph.isWrapping(state.cell);
	var clipping = graph.isLabelClipped(state.cell);
	var isForceHtml = (state.view.graph.isHtmlLabel(state.cell) || (value != null && bpmUtils.isNode(value)));
	var dialect = (isForceHtml) ? bpmConstants.DIALECT_STRICTHTML : state.view.graph.dialect;
	var overflow = state.style[bpmConstants.STYLE_OVERFLOW] || 'visible';

	if (state.text != null && (state.text.wrap != wrapping || state.text.clipped != clipping ||
		state.text.overflow != overflow || state.text.dialect != dialect))
	{
		state.text.destroy();
		state.text = null;
	}
	
	if (state.text == null && value != null && (bpmUtils.isNode(value) || value.length > 0))
	{
		this.createLabel(state, value);
	}
	else if (state.text != null && (value == null || value.length == 0))
	{
		state.text.destroy();
		state.text = null;
	}

	if (state.text != null)
	{
		if (forced)
		{
			if (state.text.lastValue != null && this.isTextShapeInvalid(state, state.text))
			{
				state.text.lastValue = null;
			}
			
			state.text.resetStyles();
			state.text.apply(state);
			
			state.text.valign = graph.getVerticalAlign(state);
		}
		
		var bounds = this.getLabelBounds(state);
		var nextScale = this.getTextScale(state);
		
		if (forced || state.text.value != value || state.text.isWrapping != wrapping ||
			state.text.overflow != overflow || state.text.isClipping != clipping ||
			state.text.scale != nextScale || state.text.dialect != dialect ||
			!state.text.bounds.equals(bounds))
		{
			if (state.text.bounds.width != 0 && state.unscaledWidth != null &&
				Math.round((state.text.bounds.width /
				state.text.scale * nextScale) - bounds.width) != 0)
			{
				state.unscaledWidth = null;
			}
			
			state.text.dialect = dialect;
			state.text.value = value;
			state.text.bounds = bounds;
			state.text.scale = nextScale;
			state.text.wrap = wrapping;
			state.text.clipped = clipping;
			state.text.overflow = overflow;
			
			var vis = state.text.node.style.visibility;
			this.redrawLabelShape(state.text);
			state.text.node.style.visibility = vis;
		}
	}
};

bpmCellRenderer.prototype.isTextShapeInvalid = function(state, shape)
{
	function check(property, stylename, defaultValue)
	{
		var result = false;
		
		if (stylename == 'spacingTop' || stylename == 'spacingRight' ||
			stylename == 'spacingBottom' || stylename == 'spacingLeft')
		{
			result = parseFloat(shape[property]) - parseFloat(shape.spacing) !=
				(state.style[stylename] || defaultValue);
		}
		else
		{
			result = shape[property] != (state.style[stylename] || defaultValue);
		}
		
		return result;
	};

	return check('fontStyle', bpmConstants.STYLE_FONTSTYLE, bpmConstants.DEFAULT_FONTSTYLE) ||
		check('family', bpmConstants.STYLE_FONTFAMILY, bpmConstants.DEFAULT_FONTFAMILY) ||
		check('size', bpmConstants.STYLE_FONTSIZE, bpmConstants.DEFAULT_FONTSIZE) ||
		check('color', bpmConstants.STYLE_FONTCOLOR, 'black') ||
		check('align', bpmConstants.STYLE_ALIGN, '') ||
		check('valign', bpmConstants.STYLE_VERTICAL_ALIGN, '') ||
		check('spacing', bpmConstants.STYLE_SPACING, 2) ||
		check('spacingTop', bpmConstants.STYLE_SPACING_TOP, 0) ||
		check('spacingRight', bpmConstants.STYLE_SPACING_RIGHT, 0) ||
		check('spacingBottom', bpmConstants.STYLE_SPACING_BOTTOM, 0) ||
		check('spacingLeft', bpmConstants.STYLE_SPACING_LEFT, 0) ||
		check('horizontal', bpmConstants.STYLE_HORIZONTAL, true) ||
		check('background', bpmConstants.STYLE_LABEL_BACKGROUNDCOLOR) ||
		check('border', bpmConstants.STYLE_LABEL_BORDERCOLOR) ||
		check('opacity', bpmConstants.STYLE_TEXT_OPACITY, 100) ||
		check('textDirection', bpmConstants.STYLE_TEXT_DIRECTION, bpmConstants.DEFAULT_TEXT_DIRECTION);
};

bpmCellRenderer.prototype.redrawLabelShape = function(shape)
{
	shape.redraw();
};

bpmCellRenderer.prototype.getTextScale = function(state)
{
	return state.view.scale;
};

bpmCellRenderer.prototype.getLabelBounds = function(state)
{
	var graph = state.view.graph;
	var scale = state.view.scale;
	var isEdge = graph.getModel().isEdge(state.cell);
	var bounds = new bpmRectangle(state.absoluteOffset.x, state.absoluteOffset.y);

	if (isEdge)
	{
		var spacing = state.text.getSpacing();
		bounds.x += spacing.x * scale;
		bounds.y += spacing.y * scale;
		
		var geo = graph.getCellGeometry(state.cell);
		
		if (geo != null)
		{
			bounds.width = Math.max(0, geo.width * scale);
			bounds.height = Math.max(0, geo.height * scale);
		}
	}
	else
	{
		if (state.text.isPaintBoundsInverted())
		{
			var tmp = bounds.x;
			bounds.x = bounds.y;
			bounds.y = tmp;
		}
		
		bounds.x += state.x;
		bounds.y += state.y;
		
		bounds.width = Math.max(1, state.width);
		bounds.height = Math.max(1, state.height);

		var sc = bpmUtils.getValue(state.style, bpmConstants.STYLE_STROKECOLOR, bpmConstants.NONE);
		
		if (sc != bpmConstants.NONE && sc != '')
		{
			var s = parseFloat(bpmUtils.getValue(state.style, bpmConstants.STYLE_STROKEWIDTH, 1)) * scale;
			var dx = 1 + Math.floor((s - 1) / 2);
			var dh = Math.floor(s + 1);
			
			bounds.x += dx;
			bounds.y += dx;
			bounds.width -= dh;
			bounds.height -= dh;
		}
	}

	if (state.text.isPaintBoundsInverted())
	{
		var t = (state.width - state.height) / 2;
		bounds.x += t;
		bounds.y -= t;
		var tmp = bounds.width;
		bounds.width = bounds.height;
		bounds.height = tmp;
	}
	
	if (state.shape != null)
	{
		var hpos = bpmUtils.getValue(state.style, bpmConstants.STYLE_LABEL_POSITION, bpmConstants.ALIGN_CENTER);
		var vpos = bpmUtils.getValue(state.style, bpmConstants.STYLE_VERTICAL_LABEL_POSITION, bpmConstants.ALIGN_MIDDLE);
		
		if (hpos == bpmConstants.ALIGN_CENTER && vpos == bpmConstants.ALIGN_MIDDLE)
		{
			bounds = state.shape.getLabelBounds(bounds);
		}
	}
	
	var lw = bpmUtils.getValue(state.style, bpmConstants.STYLE_LABEL_WIDTH, null);
	
	if (lw != null)
	{
		bounds.width = parseFloat(lw) * scale;
	}
	
	if (!isEdge)
	{
		this.rotateLabelBounds(state, bounds);
	}
	
	return bounds;
};

bpmCellRenderer.prototype.rotateLabelBounds = function(state, bounds)
{
	bounds.y -= state.text.margin.y * bounds.height;
	bounds.x -= state.text.margin.x * bounds.width;
	
	if (!this.legacySpacing || (state.style[bpmConstants.STYLE_OVERFLOW] != 'fill' && state.style[bpmConstants.STYLE_OVERFLOW] != 'width'))
	{
		var s = state.view.scale;
		var spacing = state.text.getSpacing();
		bounds.x += spacing.x * s;
		bounds.y += spacing.y * s;
		
		var hpos = bpmUtils.getValue(state.style, bpmConstants.STYLE_LABEL_POSITION, bpmConstants.ALIGN_CENTER);
		var vpos = bpmUtils.getValue(state.style, bpmConstants.STYLE_VERTICAL_LABEL_POSITION, bpmConstants.ALIGN_MIDDLE);
		var lw = bpmUtils.getValue(state.style, bpmConstants.STYLE_LABEL_WIDTH, null);
		
		bounds.width = Math.max(0, bounds.width - ((hpos == bpmConstants.ALIGN_CENTER && lw == null) ? (state.text.spacingLeft * s + state.text.spacingRight * s) : 0));
		bounds.height = Math.max(0, bounds.height - ((vpos == bpmConstants.ALIGN_MIDDLE) ? (state.text.spacingTop * s + state.text.spacingBottom * s) : 0));
	}

	var theta = state.text.getTextRotation();

	if (theta != 0 && state != null && state.view.graph.model.isVertex(state.cell))
	{
		var cx = state.getCenterX();
		var cy = state.getCenterY();
		
		if (bounds.x != cx || bounds.y != cy)
		{
			var rad = theta * (Math.PI / 180);
			pt = bpmUtils.getRotatedPoint(new bpmPoint(bounds.x, bounds.y),
					Math.cos(rad), Math.sin(rad), new bpmPoint(cx, cy));
			
			bounds.x = pt.x;
			bounds.y = pt.y;
		}
	}
};

bpmCellRenderer.prototype.redrawCellOverlays = function(state, forced)
{
	this.createCellOverlays(state);

	if (state.overlays != null)
	{
		var rot = bpmUtils.mod(bpmUtils.getValue(state.style, bpmConstants.STYLE_ROTATION, 0), 90);
        var rad = bpmUtils.toRadians(rot);
        var cos = Math.cos(rad);
        var sin = Math.sin(rad);
		
		state.overlays.visit(function(id, shape)
		{
			var bounds = shape.overlay.getBounds(state);
		
			if (!state.view.graph.getModel().isEdge(state.cell))
			{
				if (state.shape != null && rot != 0)
				{
					var cx = bounds.getCenterX();
					var cy = bounds.getCenterY();

					var point = bpmUtils.getRotatedPoint(new bpmPoint(cx, cy), cos, sin,
			        		new bpmPoint(state.getCenterX(), state.getCenterY()));

			        cx = point.x;
			        cy = point.y;
			        bounds.x = Math.round(cx - bounds.width / 2);
			        bounds.y = Math.round(cy - bounds.height / 2);
				}
			}
			
			if (forced || shape.bounds == null || shape.scale != state.view.scale ||
				!shape.bounds.equals(bounds))
			{
				shape.bounds = bounds;
				shape.scale = state.view.scale;
				shape.redraw();
			}
		});
	}
};

bpmCellRenderer.prototype.redrawControl = function(state, forced)
{
	var image = state.view.graph.getFoldingImage(state);
	
	if (state.control != null && image != null)
	{
		var bounds = this.getControlBounds(state, image.width, image.height);
		var r = (this.legacyControlPosition) ?
				bpmUtils.getValue(state.style, bpmConstants.STYLE_ROTATION, 0) :
				state.shape.getTextRotation();
		var s = state.view.scale;
		
		if (forced || state.control.scale != s || !state.control.bounds.equals(bounds) ||
			state.control.rotation != r)
		{
			state.control.rotation = r;
			state.control.bounds = bounds;
			state.control.scale = s;
			
			state.control.redraw();
		}
	}
};

bpmCellRenderer.prototype.getControlBounds = function(state, w, h)
{
	if (state.control != null)
	{
		var s = state.view.scale;
		var cx = state.getCenterX();
		var cy = state.getCenterY();
	
		if (!state.view.graph.getModel().isEdge(state.cell))
		{
			cx = state.x + w * s;
			cy = state.y + h * s;
			
			if (state.shape != null)
			{
				var rot = state.shape.getShapeRotation();
				
				if (this.legacyControlPosition)
				{
					rot = bpmUtils.getValue(state.style, bpmConstants.STYLE_ROTATION, 0);
				}
				else
				{
					if (state.shape.isPaintBoundsInverted())
					{
						var t = (state.width - state.height) / 2;
						cx += t;
						cy -= t;
					}
				}
				
				if (rot != 0)
				{
			        var rad = bpmUtils.toRadians(rot);
			        var cos = Math.cos(rad);
			        var sin = Math.sin(rad);
			        
			        var point = bpmUtils.getRotatedPoint(new bpmPoint(cx, cy), cos, sin,
			        		new bpmPoint(state.getCenterX(), state.getCenterY()));
			        cx = point.x;
			        cy = point.y;
				}
			}
		}
		
		return (state.view.graph.getModel().isEdge(state.cell)) ? 
			new bpmRectangle(Math.round(cx - w / 2 * s), Math.round(cy - h / 2 * s), Math.round(w * s), Math.round(h * s))
			: new bpmRectangle(Math.round(cx - w / 2 * s), Math.round(cy - h / 2 * s), Math.round(w * s), Math.round(h * s));
	}
	
	return null;
};

bpmCellRenderer.prototype.insertStateAfter = function(state, node, htmlNode)
{
	var shapes = this.getShapesForState(state);
	
	for (var i = 0; i < shapes.length; i++)
	{
		if (shapes[i] != null && shapes[i].node != null)
		{
			var html = shapes[i].node.parentNode != state.view.getDrawPane() &&
				shapes[i].node.parentNode != state.view.getOverlayPane();
			var temp = (html) ? htmlNode : node;
			
			if (temp != null && temp.nextSibling != shapes[i].node)
			{
				if (temp.nextSibling == null)
				{
					temp.parentNode.appendChild(shapes[i].node);
				}
				else
				{
					temp.parentNode.insertBefore(shapes[i].node, temp.nextSibling);
				}
			}
			else if (temp == null)
			{
				if (shapes[i].node.parentNode == state.view.graph.container)
				{
					var canvas = state.view.canvas;
					
					while (canvas != null && canvas.parentNode != state.view.graph.container)
					{
						canvas = canvas.parentNode;
					}
					
					if (canvas != null && canvas.nextSibling != null)
					{
						if (canvas.nextSibling != shapes[i].node)
						{
							shapes[i].node.parentNode.insertBefore(shapes[i].node, canvas.nextSibling);
						}
					}
					else
					{
						shapes[i].node.parentNode.appendChild(shapes[i].node);
					}
				}
				else if (shapes[i].node.parentNode.firstChild != null && shapes[i].node.parentNode.firstChild != shapes[i].node)
				{
					shapes[i].node.parentNode.insertBefore(shapes[i].node, shapes[i].node.parentNode.firstChild);
				}
			}
			
			if (html)
			{
				htmlNode = shapes[i].node;
			}
			else
			{
				node = shapes[i].node;
			}
		}
	}

	return [node, htmlNode];
};

bpmCellRenderer.prototype.getShapesForState = function(state)
{
	return [state.shape, state.text, state.control];
};

bpmCellRenderer.prototype.redraw = function(state, force, rendering)
{
	var shapeChanged = this.redrawShape(state, force, rendering);
	
	if (state.shape != null && (rendering == null || rendering))
	{
		this.redrawLabel(state, shapeChanged);
		this.redrawCellOverlays(state, shapeChanged);
		this.redrawControl(state, shapeChanged);
	}
};

bpmCellRenderer.prototype.redrawShape = function(state, force, rendering)
{
	var model = state.view.graph.model;
	var shapeChanged = false;

	if (state.shape != null && state.shape.style != null && state.style != null &&
		state.shape.style[bpmConstants.STYLE_SHAPE] != state.style[bpmConstants.STYLE_SHAPE])
	{
		state.shape.destroy();
		state.shape = null;
	}
	
	if (state.shape == null && state.view.graph.container != null &&
		state.cell != state.view.currentRoot &&
		(model.isVertex(state.cell) || model.isEdge(state.cell)))
	{
		state.shape = this.createShape(state);
		
		if (state.shape != null)
		{
			state.shape.minSvgStrokeWidth = this.minSvgStrokeWidth;
			state.shape.antiAlias = this.antiAlias;
	
			this.createIndicatorShape(state);
			this.initializeShape(state);
			this.createCellOverlays(state);
			this.installListeners(state);
			
			state.view.graph.selectionCellsHandler.updateHandler(state);
		}
	}
	else if (!force && state.shape != null && (!bpmUtils.equalEntries(state.shape.style,
		state.style) || this.checkPlaceholderStyles(state)))
	{
		state.shape.resetStyles();
		this.configureShape(state);
		state.view.graph.selectionCellsHandler.updateHandler(state);
		force = true;
	}

	if (state.shape != null)
	{
		this.createControl(state);
		
		if (force || this.isShapeInvalid(state, state.shape))
		{
			if (state.absolutePoints != null)
			{
				state.shape.points = state.absolutePoints.slice();
				state.shape.bounds = null;
			}
			else
			{
				state.shape.points = null;
				state.shape.bounds = new bpmRectangle(state.x, state.y, state.width, state.height);
			}

			state.shape.scale = state.view.scale;
			
			if (rendering == null || rendering)
			{
				this.doRedrawShape(state);
			}
			else
			{
				state.shape.updateBoundingBox();
			}
			
			shapeChanged = true;
		}
	}

	return shapeChanged;
};

bpmCellRenderer.prototype.doRedrawShape = function(state)
{
	state.shape.redraw();
};

bpmCellRenderer.prototype.isShapeInvalid = function(state, shape)
{
	return shape.bounds == null || shape.scale != state.view.scale ||
		(state.absolutePoints == null && !shape.bounds.equals(state)) ||
		(state.absolutePoints != null && !bpmUtils.equalPoints(shape.points, state.absolutePoints))
};

bpmCellRenderer.prototype.destroy = function(state)
{
	if (state.shape != null)
	{
		if (state.text != null)
		{		
			state.text.destroy();
			state.text = null;
		}
		
		if (state.overlays != null)
		{
			state.overlays.visit(function(id, shape)
			{
				shape.destroy();
			});
			
			state.overlays = null;
		}

		if (state.control != null)
		{
			state.control.destroy();
			state.control = null;
		}
		
		state.shape.destroy();
		state.shape = null;
	}
};



var bpmEdgeStyle =
{
	
	EntityRelation: function (state, source, target, points, result)
	{
		var view = state.view;
	 	var graph = view.graph;
	 	var segment = bpmUtils.getValue(state.style,
	 			bpmConstants.STYLE_SEGMENT,
	 			bpmConstants.ENTITY_SEGMENT) * view.scale;
	 	
		var pts = state.absolutePoints;
		var p0 = pts[0];
		var pe = pts[pts.length-1];

	 	var isSourceLeft = false;

		if (p0 != null)
		{
			source = new bpmCellState();
			source.x = p0.x;
			source.y = p0.y;
		}
		else if (source != null)
		{
			var constraint = bpmUtils.getPortConstraints(source, state, true, bpmConstants.DIRECTION_MASK_NONE);
			
			if (constraint != bpmConstants.DIRECTION_MASK_NONE && constraint != bpmConstants.DIRECTION_MASK_WEST +
				bpmConstants.DIRECTION_MASK_EAST)
			{
				isSourceLeft = constraint == bpmConstants.DIRECTION_MASK_WEST;
			}
			else
			{
			 	var sourceGeometry = graph.getCellGeometry(source.cell);
		
			 	if (sourceGeometry.relative)
			 	{
			 		isSourceLeft = sourceGeometry.x <= 0.5;
			 	}
			 	else if (target != null)
			 	{
			 		isSourceLeft = target.x + target.width < source.x;
			 	}
			}
		}
		else
		{
			return;
		}
	 	
	 	var isTargetLeft = true;

		if (pe != null)
		{
			target = new bpmCellState();
			target.x = pe.x;
			target.y = pe.y;
		}
		else if (target != null)
	 	{
			var constraint = bpmUtils.getPortConstraints(target, state, false, bpmConstants.DIRECTION_MASK_NONE);

			if (constraint != bpmConstants.DIRECTION_MASK_NONE && constraint != bpmConstants.DIRECTION_MASK_WEST +
				bpmConstants.DIRECTION_MASK_EAST)
			{
				isTargetLeft = constraint == bpmConstants.DIRECTION_MASK_WEST;
			}
			else
			{
			 	var targetGeometry = graph.getCellGeometry(target.cell);
	
			 	if (targetGeometry.relative)
			 	{
			 		isTargetLeft = targetGeometry.x <= 0.5;
			 	}
			 	else if (source != null)
			 	{
			 		isTargetLeft = source.x + source.width < target.x;
			 	}
			}
	 	}
		
		if (source != null && target != null)
		{
			var x0 = (isSourceLeft) ? source.x : source.x + source.width;
			var y0 = view.getRoutingCenterY(source);
			
			var xe = (isTargetLeft) ? target.x : target.x + target.width;
			var ye = view.getRoutingCenterY(target);
	
			var seg = segment;
	
			var dx = (isSourceLeft) ? -seg : seg;
			var dep = new bpmPoint(x0 + dx, y0);
					
			dx = (isTargetLeft) ? -seg : seg;
			var arr = new bpmPoint(xe + dx, ye);
	
			// Adds intermediate points if both go out on same side
			if (isSourceLeft == isTargetLeft)
			{
				var x = (isSourceLeft) ?
					Math.min(x0, xe)-segment :
					Math.max(x0, xe)+segment;
	
				result.push(new bpmPoint(x, y0));
				result.push(new bpmPoint(x, ye));
			}
			else if ((dep.x < arr.x) == isSourceLeft)
			{
				var midY = y0 + (ye - y0) / 2;
	
				result.push(dep);
				result.push(new bpmPoint(dep.x, midY));
				result.push(new bpmPoint(arr.x, midY));
				result.push(arr);
			}
			else
			{
				result.push(dep);
				result.push(arr);
			}
		}
	 },

	Loop: function (state, source, target, points, result)
	{
		var pts = state.absolutePoints;
		
		var p0 = pts[0];
		var pe = pts[pts.length-1];

		if (p0 != null && pe != null)
		{
			if (points != null && points.length > 0)
			{
				for (var i = 0; i < points.length; i++)
				{
					var pt = points[i];
					pt = state.view.transformControlPoint(state, pt);
					result.push(new bpmPoint(pt.x, pt.y));
				}
			}

			return;
		}
		
		if (source != null)
		{
			var view = state.view;
			var graph = view.graph;
			var pt = (points != null && points.length > 0) ? points[0] : null;

			if (pt != null)
			{
				pt = view.transformControlPoint(state, pt);
					
				if (bpmUtils.contains(source, pt.x, pt.y))
				{
					pt = null;
				}
			}
			
			var x = 0;
			var dx = 0;
			var y = 0;
			var dy = 0;
			
		 	var seg = bpmUtils.getValue(state.style, bpmConstants.STYLE_SEGMENT,
		 		graph.gridSize) * view.scale;
			var dir = bpmUtils.getValue(state.style, bpmConstants.STYLE_DIRECTION,
				bpmConstants.DIRECTION_WEST);
			
			if (dir == bpmConstants.DIRECTION_NORTH ||
				dir == bpmConstants.DIRECTION_SOUTH)
			{
				x = view.getRoutingCenterX(source);
				dx = seg;
			}
			else
			{
				y = view.getRoutingCenterY(source);
				dy = seg;
			}
			
			if (pt == null ||
				pt.x < source.x ||
				pt.x > source.x + source.width)
			{
				if (pt != null)
				{
					x = pt.x;
					dy = Math.max(Math.abs(y - pt.y), dy);
				}
				else
				{
					if (dir == bpmConstants.DIRECTION_NORTH)
					{
						y = source.y - 2 * dx;
					}
					else if (dir == bpmConstants.DIRECTION_SOUTH)
					{
						y = source.y + source.height + 2 * dx;
					}
					else if (dir == bpmConstants.DIRECTION_EAST)
					{
						x = source.x - 2 * dy;
					}
					else
					{
						x = source.x + source.width + 2 * dy;
					}
				}
			}
			else if (pt != null)
			{
				x = view.getRoutingCenterX(source);
				dx = Math.max(Math.abs(x - pt.x), dy);
				y = pt.y;
				dy = 0;
			}
			
			result.push(new bpmPoint(x - dx, y - dy));
			result.push(new bpmPoint(x + dx, y + dy));
		}
	},
	
	ElbowConnector: function (state, source, target, points, result)
	{
		var pt = (points != null && points.length > 0) ? points[0] : null;

		var vertical = false;
		var horizontal = false;
		
		if (source != null && target != null)
		{
			if (pt != null)
			{
				var left = Math.min(source.x, target.x);
				var right = Math.max(source.x + source.width,
					target.x + target.width);
	
				var top = Math.min(source.y, target.y);
				var bottom = Math.max(source.y + source.height,
					target.y + target.height);

				pt = state.view.transformControlPoint(state, pt);
					
				vertical = pt.y < top || pt.y > bottom;
				horizontal = pt.x < left || pt.x > right;
			}
			else
			{
				var left = Math.max(source.x, target.x);
				var right = Math.min(source.x + source.width,
					target.x + target.width);
					
				vertical = left == right;
				
				if (!vertical)
				{
					var top = Math.max(source.y, target.y);
					var bottom = Math.min(source.y + source.height,
						target.y + target.height);
						
					horizontal = top == bottom;
				}
			}
		}

		if (!horizontal && (vertical ||
			state.style[bpmConstants.STYLE_ELBOW] == bpmConstants.ELBOW_VERTICAL))
		{
			bpmEdgeStyle.TopToBottom(state, source, target, points, result);
		}
		else
		{
			bpmEdgeStyle.SideToSide(state, source, target, points, result);
		}
	},


	SideToSide: function (state, source, target, points, result)
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
		
		if (p0 != null)
		{
			source = new bpmCellState();
			source.x = p0.x;
			source.y = p0.y;
		}
		
		if (pe != null)
		{
			target = new bpmCellState();
			target.x = pe.x;
			target.y = pe.y;
		}
		
		if (source != null && target != null)
		{
			var l = Math.max(source.x, target.x);
			var r = Math.min(source.x + source.width,
							 target.x + target.width);
	
			var x = (pt != null) ? pt.x : Math.round(r + (l - r) / 2);
	
			var y1 = view.getRoutingCenterY(source);
			var y2 = view.getRoutingCenterY(target);
	
			if (pt != null)
			{
				if (pt.y >= source.y && pt.y <= source.y + source.height)
				{
					y1 = pt.y;
				}
				
				if (pt.y >= target.y && pt.y <= target.y + target.height)
				{
					y2 = pt.y;
				}
			}
			
			if (!bpmUtils.contains(target, x, y1) &&
				!bpmUtils.contains(source, x, y1))
			{
				result.push(new bpmPoint(x,  y1));
			}
	
			if (!bpmUtils.contains(target, x, y2) &&
				!bpmUtils.contains(source, x, y2))
			{
				result.push(new bpmPoint(x, y2));
			}
	
			if (result.length == 1)
			{
				if (pt != null)
				{
					if (!bpmUtils.contains(target, x, pt.y) &&
						!bpmUtils.contains(source, x, pt.y))
					{
						result.push(new bpmPoint(x, pt.y));
					}
				}
				else
				{	
					var t = Math.max(source.y, target.y);
					var b = Math.min(source.y + source.height,
							 target.y + target.height);
						 
					result.push(new bpmPoint(x, t + (b - t) / 2));
				}
			}
		}
	},

	TopToBottom: function(state, source, target, points, result)
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
		
		if (p0 != null)
		{
			source = new bpmCellState();
			source.x = p0.x;
			source.y = p0.y;
		}
		
		if (pe != null)
		{
			target = new bpmCellState();
			target.x = pe.x;
			target.y = pe.y;
		}

		if (source != null && target != null)
		{
			var t = Math.max(source.y, target.y);
			var b = Math.min(source.y + source.height,
							 target.y + target.height);
	
			var x = view.getRoutingCenterX(source);
			
			if (pt != null &&
				pt.x >= source.x &&
				pt.x <= source.x + source.width)
			{
				x = pt.x;
			}
			
			var y = (pt != null) ? pt.y : Math.round(b + (t - b) / 2);
			
			if (!bpmUtils.contains(target, x, y) &&
				!bpmUtils.contains(source, x, y))
			{
				result.push(new bpmPoint(x, y));						
			}
			
			if (pt != null &&
				pt.x >= target.x &&
				pt.x <= target.x + target.width)
			{
				x = pt.x;
			}
			else
			{
				x = view.getRoutingCenterX(target);
			}
			
			if (!bpmUtils.contains(target, x, y) &&
				!bpmUtils.contains(source, x, y))
			{
				result.push(new bpmPoint(x, y));						
			}
			
			if (result.length == 1)
			{
				if (pt != null && result.length == 1)
				{
					if (!bpmUtils.contains(target, pt.x, y) &&
						!bpmUtils.contains(source, pt.x, y))
					{
						result.push(new bpmPoint(pt.x, y));
					}
				}
				else
				{
					var l = Math.max(source.x, target.x);
					var r = Math.min(source.x + source.width,
							 target.x + target.width);
						 
					result.push(new bpmPoint(l + (r - l) / 2, y));
				}
			}
		}
	},

	SegmentConnector: function(state, source, target, hints, result)
	{
		// Creates array of all way- and terminalpoints
		var pts = state.absolutePoints;
		var tol = Math.max(1, state.view.scale);
		
		// Whether the first segment outgoing from the source end is horizontal
		var lastPushed = (result.length > 0) ? result[0] : null;
		var horizontal = true;
		var hint = null;
		
		// Adds waypoints only if outside of tolerance
		function pushPoint(pt)
		{
			if (lastPushed == null || Math.abs(lastPushed.x - pt.x) >= tol || Math.abs(lastPushed.y - pt.y) >= tol)
			{
				result.push(pt);
				lastPushed = pt;
			}
			
			return lastPushed;
		};

		// Adds the first point
		var pt = pts[0];
		
		if (pt == null && source != null)
		{
			pt = new bpmPoint(state.view.getRoutingCenterX(source), state.view.getRoutingCenterY(source));
		}
		else if (pt != null)
		{
			pt = pt.clone();
		}
		
		pt.x = Math.round(pt.x);
		pt.y = Math.round(pt.y);
		
		var lastInx = pts.length - 1;

		// Adds the waypoints
		if (hints != null && hints.length > 0)
		{
			// Converts all hints and removes nulls
			var newHints = [];
			
			for (var i = 0; i < hints.length; i++)
			{
				var tmp = state.view.transformControlPoint(state, hints[i]);
				
				if (tmp != null)
				{
					tmp.x = Math.round(tmp.x);
					tmp.y = Math.round(tmp.y);
					newHints.push(tmp);
				}
			}
			
			if (newHints.length == 0)
			{
				return;
			}
			
			hints = newHints;
			
			// Aligns source and target hint to fixed points
			if (pt != null && hints[0] != null)
			{
				if (Math.abs(hints[0].x - pt.x) < tol)
				{
					hints[0].x = pt.x;
				}
				
				if (Math.abs(hints[0].y - pt.y) < tol)
				{
					hints[0].y = pt.y;
				}
			}
			
			var pe = pts[lastInx];
			
			if (pe != null && hints[hints.length - 1] != null)
			{
				if (Math.abs(hints[hints.length - 1].x - pe.x) < tol)
				{
					hints[hints.length - 1].x = pe.x;
				}
				
				if (Math.abs(hints[hints.length - 1].y - pe.y) < tol)
				{
					hints[hints.length - 1].y = pe.y;
				}
			}
			
			hint = hints[0];

			var currentTerm = source;
			var currentPt = pts[0];
			var hozChan = false;
			var vertChan = false;
			var currentHint = hint;
			
			if (currentPt != null)
			{
				currentPt.x = Math.round(currentPt.x);
				currentPt.y = Math.round(currentPt.y);
				currentTerm = null;
			}
			
			// Check for alignment with fixed points and with channels
			// at source and target segments only
			for (var i = 0; i < 2; i++)
			{
				var fixedVertAlign = currentPt != null && currentPt.x == currentHint.x;
				var fixedHozAlign = currentPt != null && currentPt.y == currentHint.y;
				
				var inHozChan = currentTerm != null && (currentHint.y >= currentTerm.y &&
						currentHint.y <= currentTerm.y + currentTerm.height);
				var inVertChan = currentTerm != null && (currentHint.x >= currentTerm.x &&
						currentHint.x <= currentTerm.x + currentTerm.width);

				hozChan = fixedHozAlign || (currentPt == null && inHozChan);
				vertChan = fixedVertAlign || (currentPt == null && inVertChan);
				
				if (i==0 && ((hozChan && vertChan) || (fixedVertAlign && fixedHozAlign)))
				{
				}
				else
				{
					if (currentPt != null && (!fixedHozAlign && !fixedVertAlign) && (inHozChan || inVertChan)) 
					{
						horizontal = inHozChan ? false : true;
						break;
					}
			
					if (vertChan || hozChan)
					{
						horizontal = hozChan;
						
						if (i == 1)
						{
							// Work back from target end
							horizontal = hints.length % 2 == 0 ? hozChan : vertChan;
						}
	
						break;
					}
				}
				
				currentTerm = target;
				currentPt = pts[lastInx];
				
				if (currentPt != null)
				{
					currentPt.x = Math.round(currentPt.x);
					currentPt.y = Math.round(currentPt.y);
					currentTerm = null;
				}
				
				currentHint = hints[hints.length - 1];
				
				if (fixedVertAlign && fixedHozAlign)
				{
					hints = hints.slice(1);
				}
			}

			if (horizontal && ((pts[0] != null && pts[0].y != hint.y) ||
				(pts[0] == null && source != null &&
				(hint.y < source.y || hint.y > source.y + source.height))))
			{
				pushPoint(new bpmPoint(pt.x, hint.y));
			}
			else if (!horizontal && ((pts[0] != null && pts[0].x != hint.x) ||
					(pts[0] == null && source != null &&
					(hint.x < source.x || hint.x > source.x + source.width))))
			{
				pushPoint(new bpmPoint(hint.x, pt.y));
			}
			
			if (horizontal)
			{
				pt.y = hint.y;
			}
			else
			{
				pt.x = hint.x;
			}
		
			for (var i = 0; i < hints.length; i++)
			{
				horizontal = !horizontal;
				hint = hints[i];
				
				if (horizontal)
				{
					pt.y = hint.y;
				}
				else
				{
					pt.x = hint.x;
				}
		
				pushPoint(pt.clone());
			}
		}
		else
		{
			hint = pt;
			horizontal = true;
		}

		// Adds the last point
		pt = pts[lastInx];

		if (pt == null && target != null)
		{
			pt = new bpmPoint(state.view.getRoutingCenterX(target), state.view.getRoutingCenterY(target));
		}
		
		if (pt != null)
		{
			pt.x = Math.round(pt.x);
			pt.y = Math.round(pt.y);
			
			if (hint != null)
			{
				if (horizontal && ((pts[lastInx] != null && pts[lastInx].y != hint.y) ||
					(pts[lastInx] == null && target != null &&
					(hint.y < target.y || hint.y > target.y + target.height))))
				{
					pushPoint(new bpmPoint(pt.x, hint.y));
				}
				else if (!horizontal && ((pts[lastInx] != null && pts[lastInx].x != hint.x) ||
						(pts[lastInx] == null && target != null &&
						(hint.x < target.x || hint.x > target.x + target.width))))
				{
					pushPoint(new bpmPoint(hint.x, pt.y));
				}
			}
		}
		
		// Removes bends inside the source terminal for floating ports
		if (pts[0] == null && source != null)
		{
			while (result.length > 1 && result[1] != null &&
				bpmUtils.contains(source, result[1].x, result[1].y))
			{
				result.splice(1, 1);
			}
		}
		
		// Removes bends inside the target terminal
		if (pts[lastInx] == null && target != null)
		{
			while (result.length > 1 && result[result.length - 1] != null &&
				bpmUtils.contains(target, result[result.length - 1].x, result[result.length - 1].y))
			{
				result.splice(result.length - 1, 1);
			}
		}
		
		// Removes last point if inside tolerance with end point
		if (pe != null && result[result.length - 1] != null &&
			Math.abs(pe.x - result[result.length - 1].x) < tol &&
			Math.abs(pe.y - result[result.length - 1].y) < tol)
		{
			result.splice(result.length - 1, 1);
			
			// Lines up second last point in result with end point
			if (result[result.length - 1] != null)
			{
				if (Math.abs(result[result.length - 1].x - pe.x) < tol)
				{
					result[result.length - 1].x = pe.x;
				}
				
				if (Math.abs(result[result.length - 1].y - pe.y) < tol)
				{
					result[result.length - 1].y = pe.y;
				}
			}
		}
	},
	
	orthBuffer: 10,
	
	orthPointsFallback: true,

	dirVectors: [ [ -1, 0 ],
			[ 0, -1 ], [ 1, 0 ], [ 0, 1 ], [ -1, 0 ], [ 0, -1 ], [ 1, 0 ] ],

	wayPoints1: [ [ 0, 0], [ 0, 0],  [ 0, 0], [ 0, 0], [ 0, 0],  [ 0, 0],
	              [ 0, 0],  [ 0, 0], [ 0, 0],  [ 0, 0], [ 0, 0],  [ 0, 0] ],

	routePatterns: [
		[ [ 513, 2308, 2081, 2562 ], [ 513, 1090, 514, 2184, 2114, 2561 ],
			[ 513, 1090, 514, 2564, 2184, 2562 ],
			[ 513, 2308, 2561, 1090, 514, 2568, 2308 ] ],
	[ [ 514, 1057, 513, 2308, 2081, 2562 ], [ 514, 2184, 2114, 2561 ],
			[ 514, 2184, 2562, 1057, 513, 2564, 2184 ],
			[ 514, 1057, 513, 2568, 2308, 2561 ] ],
	[ [ 1090, 514, 1057, 513, 2308, 2081, 2562 ], [ 2114, 2561 ],
			[ 1090, 2562, 1057, 513, 2564, 2184 ],
			[ 1090, 514, 1057, 513, 2308, 2561, 2568 ] ],
	[ [ 2081, 2562 ], [ 1057, 513, 1090, 514, 2184, 2114, 2561 ],
			[ 1057, 513, 1090, 514, 2184, 2562, 2564 ],
			[ 1057, 2561, 1090, 514, 2568, 2308 ] ] ],
	
	inlineRoutePatterns: [
			[ null, [ 2114, 2568 ], null, null ],
			[ null, [ 514, 2081, 2114, 2568 ] , null, null ],
			[ null, [ 2114, 2561 ], null, null ],
			[ [ 2081, 2562 ], [ 1057, 2114, 2568 ],
					[ 2184, 2562 ],
					null ] ],
	vertexSeperations: [],

	limits: [
	       [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
	       [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ] ],

	LEFT_MASK: 32,

	TOP_MASK: 64,

	RIGHT_MASK: 128,

	BOTTOM_MASK: 256,

	LEFT: 1,

	TOP: 2,

	RIGHT: 4,

	BOTTOM: 8,

	SIDE_MASK: 480,

	CENTER_MASK: 512,

	SOURCE_MASK: 1024,

	TARGET_MASK: 2048,

	VERTEX_MASK: 3072,
	
	getJettySize: function(state, source, target, points, isSource)
	{
		var value = bpmUtils.getValue(state.style, (isSource) ? bpmConstants.STYLE_SOURCE_JETTY_SIZE :
			bpmConstants.STYLE_TARGET_JETTY_SIZE, bpmUtils.getValue(state.style,
					bpmConstants.STYLE_JETTY_SIZE, bpmEdgeStyle.orthBuffer));
		
		if (value == 'auto')
		{
			var type = bpmUtils.getValue(state.style, (isSource) ? bpmConstants.STYLE_STARTARROW : bpmConstants.STYLE_ENDARROW, bpmConstants.NONE);
			
			if (type != bpmConstants.NONE)
			{
				var size = bpmUtils.getNumber(state.style, (isSource) ? bpmConstants.STYLE_STARTSIZE : bpmConstants.STYLE_ENDSIZE, bpmConstants.DEFAULT_MARKERSIZE);
				value = Math.max(2, Math.ceil((size + bpmEdgeStyle.orthBuffer) / bpmEdgeStyle.orthBuffer)) * bpmEdgeStyle.orthBuffer;
			}
			else
			{
				value = 2 * bpmEdgeStyle.orthBuffer;
			}
		}
		
		return value;
	},

	OrthConnector: function(state, source, target, points, result)
	{
		var graph = state.view.graph;
		var sourceEdge = source == null ? false : graph.getModel().isEdge(source.cell);
		var targetEdge = target == null ? false : graph.getModel().isEdge(target.cell);

		var pts = state.absolutePoints;
		var p0 = pts[0];
		var pe = pts[pts.length-1];

		var sourceX = source != null ? source.x : p0.x;
		var sourceY = source != null ? source.y : p0.y;
		var sourceWidth = source != null ? source.width : 0;
		var sourceHeight = source != null ? source.height : 0;
		
		var targetX = target != null ? target.x : pe.x;
		var targetY = target != null ? target.y : pe.y;
		var targetWidth = target != null ? target.width : 0;
		var targetHeight = target != null ? target.height : 0;

		var scaledSourceBuffer = state.view.scale * bpmEdgeStyle.getJettySize(state, source, target, points, true);
		var scaledTargetBuffer = state.view.scale * bpmEdgeStyle.getJettySize(state, source, target, points, false);
		
		// Workaround for loop routing within buffer zone
		if (source != null && target == source)
		{
			scaledTargetBuffer = Math.max(scaledSourceBuffer, scaledTargetBuffer);
			scaledSourceBuffer = scaledTargetBuffer;
		}
		
		var totalBuffer = scaledTargetBuffer + scaledSourceBuffer;
		var tooShort = false;
		
		// Checks minimum distance for fixed points and falls back to segment connector
		if (p0 != null && pe != null)
		{
			var dx = pe.x - p0.x;
			var dy = pe.y - p0.y;
			
			tooShort = dx * dx + dy * dy < totalBuffer * totalBuffer;
		}

		if (tooShort || (bpmEdgeStyle.orthPointsFallback && (points != null &&
			points.length > 0)) || sourceEdge || targetEdge)
		{
			bpmEdgeStyle.SegmentConnector(state, source, target, points, result);
			
			return;
		}

		var portConstraint = [bpmConstants.DIRECTION_MASK_ALL, bpmConstants.DIRECTION_MASK_ALL];
		var rotation = 0;
		
		if (source != null)
		{
			portConstraint[0] = bpmUtils.getPortConstraints(source, state, true, 
					bpmConstants.DIRECTION_MASK_ALL);
			rotation = bpmUtils.getValue(source.style, bpmConstants.STYLE_ROTATION, 0);
			
			if (rotation != 0)
			{
				var newRect = bpmUtils.getBoundingBox(new bpmRectangle(sourceX, sourceY, sourceWidth, sourceHeight), rotation);
				sourceX = newRect.x; 
				sourceY = newRect.y;
				sourceWidth = newRect.width;
				sourceHeight = newRect.height;
			}
		}

		if (target != null)
		{
			portConstraint[1] = bpmUtils.getPortConstraints(target, state, false,
				bpmConstants.DIRECTION_MASK_ALL);
			rotation = bpmUtils.getValue(target.style, bpmConstants.STYLE_ROTATION, 0);

			if (rotation != 0)
			{
				var newRect = bpmUtils.getBoundingBox(new bpmRectangle(targetX, targetY, targetWidth, targetHeight), rotation);
				targetX = newRect.x;
				targetY = newRect.y;
				targetWidth = newRect.width;
				targetHeight = newRect.height;
			}
		}

		// Avoids floating point number errors
		sourceX = Math.round(sourceX * 10) / 10;
		sourceY = Math.round(sourceY * 10) / 10;
		sourceWidth = Math.round(sourceWidth * 10) / 10;
		sourceHeight = Math.round(sourceHeight * 10) / 10;
		
		targetX = Math.round(targetX * 10) / 10;
		targetY = Math.round(targetY * 10) / 10;
		targetWidth = Math.round(targetWidth * 10) / 10;
		targetHeight = Math.round(targetHeight * 10) / 10;
		
		var dir = [0, 0];
		var geo = [ [sourceX, sourceY, sourceWidth, sourceHeight] ,
		            [targetX, targetY, targetWidth, targetHeight] ];
		var buffer = [scaledSourceBuffer, scaledTargetBuffer];

		for (var i = 0; i < 2; i++)
		{
			bpmEdgeStyle.limits[i][1] = geo[i][0] - buffer[i];
			bpmEdgeStyle.limits[i][2] = geo[i][1] - buffer[i];
			bpmEdgeStyle.limits[i][4] = geo[i][0] + geo[i][2] + buffer[i];
			bpmEdgeStyle.limits[i][8] = geo[i][1] + geo[i][3] + buffer[i];
		}
		
		// Work out which quad the target is in
		var sourceCenX = geo[0][0] + geo[0][2] / 2.0;
		var sourceCenY = geo[0][1] + geo[0][3] / 2.0;
		var targetCenX = geo[1][0] + geo[1][2] / 2.0;
		var targetCenY = geo[1][1] + geo[1][3] / 2.0;
		
		var dx = sourceCenX - targetCenX;
		var dy = sourceCenY - targetCenY;

		var quad = 0;

		if (dx < 0)
		{
			if (dy < 0)
			{
				quad = 2;
			}
			else
			{
				quad = 1;
			}
		}
		else
		{
			if (dy <= 0)
			{
				quad = 3;
				
				if (dx == 0)
				{
					quad = 2;
				}
			}
		}

		// Check for connection constraints
		var currentTerm = null;
		
		if (source != null)
		{
			currentTerm = p0;
		}

		var constraint = [ [0.5, 0.5] , [0.5, 0.5] ];

		for (var i = 0; i < 2; i++)
		{
			if (currentTerm != null)
			{
				constraint[i][0] = (currentTerm.x - geo[i][0]) / geo[i][2];
				
				if (Math.abs(currentTerm.x - geo[i][0]) <= 1)
				{
					dir[i] = bpmConstants.DIRECTION_MASK_WEST;
				}
				else if (Math.abs(currentTerm.x - geo[i][0] - geo[i][2]) <= 1)
				{
					dir[i] = bpmConstants.DIRECTION_MASK_EAST;
				}

				constraint[i][1] = (currentTerm.y - geo[i][1]) / geo[i][3];

				if (Math.abs(currentTerm.y - geo[i][1]) <= 1)
				{
					dir[i] = bpmConstants.DIRECTION_MASK_NORTH;
				}
				else if (Math.abs(currentTerm.y - geo[i][1] - geo[i][3]) <= 1)
				{
					dir[i] = bpmConstants.DIRECTION_MASK_SOUTH;
				}
			}

			currentTerm = null;
			
			if (target != null)
			{
				currentTerm = pe;
			}
		}

		var sourceTopDist = geo[0][1] - (geo[1][1] + geo[1][3]);
		var sourceLeftDist = geo[0][0] - (geo[1][0] + geo[1][2]);
		var sourceBottomDist = geo[1][1] - (geo[0][1] + geo[0][3]);
		var sourceRightDist = geo[1][0] - (geo[0][0] + geo[0][2]);

		bpmEdgeStyle.vertexSeperations[1] = Math.max(sourceLeftDist - totalBuffer, 0);
		bpmEdgeStyle.vertexSeperations[2] = Math.max(sourceTopDist - totalBuffer, 0);
		bpmEdgeStyle.vertexSeperations[4] = Math.max(sourceBottomDist - totalBuffer, 0);
		bpmEdgeStyle.vertexSeperations[3] = Math.max(sourceRightDist - totalBuffer, 0);
		
		var dirPref = [];
		var horPref = [];
		var vertPref = [];

		horPref[0] = (sourceLeftDist >= sourceRightDist) ? bpmConstants.DIRECTION_MASK_WEST
				: bpmConstants.DIRECTION_MASK_EAST;
		vertPref[0] = (sourceTopDist >= sourceBottomDist) ? bpmConstants.DIRECTION_MASK_NORTH
				: bpmConstants.DIRECTION_MASK_SOUTH;

		horPref[1] = bpmUtils.reversePortConstraints(horPref[0]);
		vertPref[1] = bpmUtils.reversePortConstraints(vertPref[0]);
		
		var preferredHorizDist = sourceLeftDist >= sourceRightDist ? sourceLeftDist
				: sourceRightDist;
		var preferredVertDist = sourceTopDist >= sourceBottomDist ? sourceTopDist
				: sourceBottomDist;

		var prefOrdering = [ [0, 0] , [0, 0] ];
		var preferredOrderSet = false;

		for (var i = 0; i < 2; i++)
		{
			if (dir[i] != 0x0)
			{
				continue;
			}

			if ((horPref[i] & portConstraint[i]) == 0)
			{
				horPref[i] = bpmUtils.reversePortConstraints(horPref[i]);
			}

			if ((vertPref[i] & portConstraint[i]) == 0)
			{
				vertPref[i] = bpmUtils
						.reversePortConstraints(vertPref[i]);
			}

			prefOrdering[i][0] = vertPref[i];
			prefOrdering[i][1] = horPref[i];
		}

		if (preferredVertDist > 0
				&& preferredHorizDist > 0)
		{
			if (((horPref[0] & portConstraint[0]) > 0)
					&& ((vertPref[1] & portConstraint[1]) > 0))
			{
				prefOrdering[0][0] = horPref[0];
				prefOrdering[0][1] = vertPref[0];
				prefOrdering[1][0] = vertPref[1];
				prefOrdering[1][1] = horPref[1];
				preferredOrderSet = true;
			}
			else if (((vertPref[0] & portConstraint[0]) > 0)
					&& ((horPref[1] & portConstraint[1]) > 0))
			{
				prefOrdering[0][0] = vertPref[0];
				prefOrdering[0][1] = horPref[0];
				prefOrdering[1][0] = horPref[1];
				prefOrdering[1][1] = vertPref[1];
				preferredOrderSet = true;
			}
		}
		
		if (preferredVertDist > 0 && !preferredOrderSet)
		{
			prefOrdering[0][0] = vertPref[0];
			prefOrdering[0][1] = horPref[0];
			prefOrdering[1][0] = vertPref[1];
			prefOrdering[1][1] = horPref[1];
			preferredOrderSet = true;

		}
		
		if (preferredHorizDist > 0 && !preferredOrderSet)
		{
			prefOrdering[0][0] = horPref[0];
			prefOrdering[0][1] = vertPref[0];
			prefOrdering[1][0] = horPref[1];
			prefOrdering[1][1] = vertPref[1];
			preferredOrderSet = true;
		}

		for (var i = 0; i < 2; i++)
		{
			if (dir[i] != 0x0)
			{
				continue;
			}

			if ((prefOrdering[i][0] & portConstraint[i]) == 0)
			{
				prefOrdering[i][0] = prefOrdering[i][1];
			}

			dirPref[i] = prefOrdering[i][0] & portConstraint[i];
			dirPref[i] |= (prefOrdering[i][1] & portConstraint[i]) << 8;
			dirPref[i] |= (prefOrdering[1 - i][i] & portConstraint[i]) << 16;
			dirPref[i] |= (prefOrdering[1 - i][1 - i] & portConstraint[i]) << 24;

			if ((dirPref[i] & 0xF) == 0)
			{
				dirPref[i] = dirPref[i] << 8;
			}
			
			if ((dirPref[i] & 0xF00) == 0)
			{
				dirPref[i] = (dirPref[i] & 0xF) | dirPref[i] >> 8;
			}
			
			if ((dirPref[i] & 0xF0000) == 0)
			{
				dirPref[i] = (dirPref[i] & 0xFFFF)
						| ((dirPref[i] & 0xF000000) >> 8);
			}

			dir[i] = dirPref[i] & 0xF;

			if (portConstraint[i] == bpmConstants.DIRECTION_MASK_WEST
					|| portConstraint[i] == bpmConstants.DIRECTION_MASK_NORTH
					|| portConstraint[i] == bpmConstants.DIRECTION_MASK_EAST
					|| portConstraint[i] == bpmConstants.DIRECTION_MASK_SOUTH)
			{
				dir[i] = portConstraint[i];
			}
		}

		var sourceIndex = dir[0] == bpmConstants.DIRECTION_MASK_EAST ? 3
				: dir[0];
		var targetIndex = dir[1] == bpmConstants.DIRECTION_MASK_EAST ? 3
				: dir[1];

		sourceIndex -= quad;
		targetIndex -= quad;

		if (sourceIndex < 1)
		{
			sourceIndex += 4;
		}
		
		if (targetIndex < 1)
		{
			targetIndex += 4;
		}

		var routePattern = bpmEdgeStyle.routePatterns[sourceIndex - 1][targetIndex - 1];

		bpmEdgeStyle.wayPoints1[0][0] = geo[0][0];
		bpmEdgeStyle.wayPoints1[0][1] = geo[0][1];

		switch (dir[0])
		{
			case bpmConstants.DIRECTION_MASK_WEST:
				bpmEdgeStyle.wayPoints1[0][0] -= scaledSourceBuffer;
				bpmEdgeStyle.wayPoints1[0][1] += constraint[0][1] * geo[0][3];
				break;
			case bpmConstants.DIRECTION_MASK_SOUTH:
				bpmEdgeStyle.wayPoints1[0][0] += constraint[0][0] * geo[0][2];
				bpmEdgeStyle.wayPoints1[0][1] += geo[0][3] + scaledSourceBuffer;
				break;
			case bpmConstants.DIRECTION_MASK_EAST:
				bpmEdgeStyle.wayPoints1[0][0] += geo[0][2] + scaledSourceBuffer;
				bpmEdgeStyle.wayPoints1[0][1] += constraint[0][1] * geo[0][3];
				break;
			case bpmConstants.DIRECTION_MASK_NORTH:
				bpmEdgeStyle.wayPoints1[0][0] += constraint[0][0] * geo[0][2];
				bpmEdgeStyle.wayPoints1[0][1] -= scaledSourceBuffer;
				break;
		}

		var currentIndex = 0;

		// Orientation, 0 horizontal, 1 vertical
		var lastOrientation = (dir[0] & (bpmConstants.DIRECTION_MASK_EAST | bpmConstants.DIRECTION_MASK_WEST)) > 0 ? 0
				: 1;
		var initialOrientation = lastOrientation;
		var currentOrientation = 0;

		for (var i = 0; i < routePattern.length; i++)
		{
			var nextDirection = routePattern[i] & 0xF;

			var directionIndex = nextDirection == bpmConstants.DIRECTION_MASK_EAST ? 3
					: nextDirection;

			directionIndex += quad;

			if (directionIndex > 4)
			{
				directionIndex -= 4;
			}

			var direction = bpmEdgeStyle.dirVectors[directionIndex - 1];

			currentOrientation = (directionIndex % 2 > 0) ? 0 : 1;
			if (currentOrientation != lastOrientation)
			{
				currentIndex++;
				bpmEdgeStyle.wayPoints1[currentIndex][0] = bpmEdgeStyle.wayPoints1[currentIndex - 1][0];
				bpmEdgeStyle.wayPoints1[currentIndex][1] = bpmEdgeStyle.wayPoints1[currentIndex - 1][1];
			}

			var tar = (routePattern[i] & bpmEdgeStyle.TARGET_MASK) > 0;
			var sou = (routePattern[i] & bpmEdgeStyle.SOURCE_MASK) > 0;
			var side = (routePattern[i] & bpmEdgeStyle.SIDE_MASK) >> 5;
			side = side << quad;

			if (side > 0xF)
			{
				side = side >> 4;
			}

			var center = (routePattern[i] & bpmEdgeStyle.CENTER_MASK) > 0;

			if ((sou || tar) && side < 9)
			{
				var limit = 0;
				var souTar = sou ? 0 : 1;

				if (center && currentOrientation == 0)
				{
					limit = geo[souTar][0] + constraint[souTar][0] * geo[souTar][2];
				}
				else if (center)
				{
					limit = geo[souTar][1] + constraint[souTar][1] * geo[souTar][3];
				}
				else
				{
					limit = bpmEdgeStyle.limits[souTar][side];
				}
				
				if (currentOrientation == 0)
				{
					var lastX = bpmEdgeStyle.wayPoints1[currentIndex][0];
					var deltaX = (limit - lastX) * direction[0];

					if (deltaX > 0)
					{
						bpmEdgeStyle.wayPoints1[currentIndex][0] += direction[0]
								* deltaX;
					}
				}
				else
				{
					var lastY = bpmEdgeStyle.wayPoints1[currentIndex][1];
					var deltaY = (limit - lastY) * direction[1];

					if (deltaY > 0)
					{
						bpmEdgeStyle.wayPoints1[currentIndex][1] += direction[1]
								* deltaY;
					}
				}
			}

			else if (center)
			{
				// Which center we're travelling to depend on the current direction
				bpmEdgeStyle.wayPoints1[currentIndex][0] += direction[0]
						* Math.abs(bpmEdgeStyle.vertexSeperations[directionIndex] / 2);
				bpmEdgeStyle.wayPoints1[currentIndex][1] += direction[1]
						* Math.abs(bpmEdgeStyle.vertexSeperations[directionIndex] / 2);
			}

			if (currentIndex > 0
					&& bpmEdgeStyle.wayPoints1[currentIndex][currentOrientation] == bpmEdgeStyle.wayPoints1[currentIndex - 1][currentOrientation])
			{
				currentIndex--;
			}
			else
			{
				lastOrientation = currentOrientation;
			}
		}

		for (var i = 0; i <= currentIndex; i++)
		{
			if (i == currentIndex)
			{
				var targetOrientation = (dir[1] & (bpmConstants.DIRECTION_MASK_EAST | bpmConstants.DIRECTION_MASK_WEST)) > 0 ? 0
						: 1;
				var sameOrient = targetOrientation == initialOrientation ? 0 : 1;

				if (sameOrient != (currentIndex + 1) % 2)
				{
					break;
				}
			}
			
			result.push(new bpmPoint(Math.round(bpmEdgeStyle.wayPoints1[i][0]), Math.round(bpmEdgeStyle.wayPoints1[i][1])));
		}
		
		// Removes duplicates
		var index = 1;
		
		while (index < result.length)
		{
			if (result[index - 1] == null || result[index] == null ||
				result[index - 1].x != result[index].x ||
				result[index - 1].y != result[index].y)
			{
				index++;
			}
			else
			{
				result.splice(index, 1);
			}
		}
	},
	
	getRoutePattern: function(dir, quad, dx, dy)
	{
		var sourceIndex = dir[0] == bpmConstants.DIRECTION_MASK_EAST ? 3
				: dir[0];
		var targetIndex = dir[1] == bpmConstants.DIRECTION_MASK_EAST ? 3
				: dir[1];

		sourceIndex -= quad;
		targetIndex -= quad;

		if (sourceIndex < 1)
		{
			sourceIndex += 4;
		}
		if (targetIndex < 1)
		{
			targetIndex += 4;
		}

		var result = routePatterns[sourceIndex - 1][targetIndex - 1];

		if (dx == 0 || dy == 0)
		{
			if (inlineRoutePatterns[sourceIndex - 1][targetIndex - 1] != null)
			{
				result = inlineRoutePatterns[sourceIndex - 1][targetIndex - 1];
			}
		}

		return result;
	}
};



var bpmStyleRegistry =
{
	values: [],

	putValue: function(name, obj)
	{
		bpmStyleRegistry.values[name] = obj;
	},

	getValue: function(name)
	{
		return bpmStyleRegistry.values[name];
	},
	
	getName: function(value)
	{
		for (var key in bpmStyleRegistry.values)
		{
			if (bpmStyleRegistry.values[key] == value)
			{
				return key;
			}
		}
		
		return null;
	}

};

bpmStyleRegistry.putValue(bpmConstants.EDGESTYLE_ELBOW, bpmEdgeStyle.ElbowConnector);
bpmStyleRegistry.putValue(bpmConstants.EDGESTYLE_ENTITY_RELATION, bpmEdgeStyle.EntityRelation);
bpmStyleRegistry.putValue(bpmConstants.EDGESTYLE_LOOP, bpmEdgeStyle.Loop);
bpmStyleRegistry.putValue(bpmConstants.EDGESTYLE_SIDETOSIDE, bpmEdgeStyle.SideToSide);
bpmStyleRegistry.putValue(bpmConstants.EDGESTYLE_TOPTOBOTTOM, bpmEdgeStyle.TopToBottom);
bpmStyleRegistry.putValue(bpmConstants.EDGESTYLE_ORTHOGONAL, bpmEdgeStyle.OrthConnector);
bpmStyleRegistry.putValue(bpmConstants.EDGESTYLE_SEGMENT, bpmEdgeStyle.SegmentConnector);

bpmStyleRegistry.putValue(bpmConstants.PERIMETER_ELLIPSE, bpmPerimeter.EllipsePerimeter);
bpmStyleRegistry.putValue(bpmConstants.PERIMETER_RECTANGLE, bpmPerimeter.RectanglePerimeter);
bpmStyleRegistry.putValue(bpmConstants.PERIMETER_RHOMBUS, bpmPerimeter.RhombusPerimeter);
bpmStyleRegistry.putValue(bpmConstants.PERIMETER_TRIANGLE, bpmPerimeter.TrianglePerimeter);
bpmStyleRegistry.putValue(bpmConstants.PERIMETER_HEXAGON, bpmPerimeter.HexagonPerimeter);



/* Draw View */
function bpmGraphView(graph)
{
	this.graph = graph;
	this.translate = new bpmPoint();
	this.graphBounds = new bpmRectangle();
	this.states = new bpmDictionary();
};

bpmGraphView.prototype = new bpmEventSource();
bpmGraphView.prototype.constructor = bpmGraphView;
bpmGraphView.prototype.EMPTY_POINT = new bpmPoint();
bpmGraphView.prototype.doneResource = (bpmCore.language != 'none') ? 'done' : '';
bpmGraphView.prototype.updatingDocumentResource = (bpmCore.language != 'none') ? 'updatingDocument' : '';
bpmGraphView.prototype.allowEval = false;
bpmGraphView.prototype.captureDocumentGesture = true;
bpmGraphView.prototype.optimizeVmlReflows = true;
bpmGraphView.prototype.rendering = true;
bpmGraphView.prototype.graph = null;
bpmGraphView.prototype.currentRoot = null;
bpmGraphView.prototype.graphBounds = null;
bpmGraphView.prototype.scale = 1;
bpmGraphView.prototype.translate = null;
bpmGraphView.prototype.states = null;
bpmGraphView.prototype.updateStyle = false;
bpmGraphView.prototype.lastNode = null;
bpmGraphView.prototype.lastHtmlNode = null;
bpmGraphView.prototype.lastForegroundNode = null;
bpmGraphView.prototype.lastForegroundHtmlNode = null;

bpmGraphView.prototype.getGraphBounds = function()
{
	return this.graphBounds;
};

bpmGraphView.prototype.setGraphBounds = function(value)
{
	this.graphBounds = value;
};

bpmGraphView.prototype.getBounds = function(cells)
{
	var result = null;
	
	if (cells != null && cells.length > 0)
	{
		var model = this.graph.getModel();
		
		for (var i = 0; i < cells.length; i++)
		{
			if (model.isVertex(cells[i]) || model.isEdge(cells[i]))
			{
				var state = this.getState(cells[i]);
			
				if (state != null)
				{
					if (result == null)
					{
						result = bpmRectangle.fromRectangle(state);
					}
					else
					{
						result.add(state);
					}
				}
			}
		}
	}
	
	return result;
};

bpmGraphView.prototype.setCurrentRoot = function(root)
{
	if (this.currentRoot != root)
	{
		var change = new bpmCurrentRootChange(this, root);
		change.execute();
		var edit = new bpmUndoableEdit(this, true);
		edit.add(change);
		this.fireEvent(new bpmEventObject(bpmEvent.UNDO, 'edit', edit));
		this.graph.sizeDidChange();
	}
	
	return root;
};

bpmGraphView.prototype.scaleAndTranslate = function(scale, dx, dy)
{
	var previousScale = this.scale;
	var previousTranslate = new bpmPoint(this.translate.x, this.translate.y);
	
	if (this.scale != scale || this.translate.x != dx || this.translate.y != dy)
	{
		this.scale = scale;
		
		this.translate.x = dx;
		this.translate.y = dy;

		if (this.isEventsEnabled())
		{
			this.viewStateChanged();
		}
	}
	
	this.fireEvent(new bpmEventObject(bpmEvent.SCALE_AND_TRANSLATE,
		'scale', scale, 'previousScale', previousScale,
		'translate', this.translate, 'previousTranslate', previousTranslate));
};

bpmGraphView.prototype.getScale = function()
{
	return this.scale;
};

bpmGraphView.prototype.setScale = function(value)
{
	var previousScale = this.scale;
	
	if (this.scale != value)
	{
		this.scale = value;

		if (this.isEventsEnabled())
		{
			this.viewStateChanged();
		}
	}
	
	this.fireEvent(new bpmEventObject(bpmEvent.SCALE,
		'scale', value, 'previousScale', previousScale));
};

bpmGraphView.prototype.getTranslate = function()
{
	return this.translate;
};

bpmGraphView.prototype.setTranslate = function(dx, dy)
{
	var previousTranslate = new bpmPoint(this.translate.x, this.translate.y);
	
	if (this.translate.x != dx || this.translate.y != dy)
	{
		this.translate.x = dx;
		this.translate.y = dy;

		if (this.isEventsEnabled())
		{
			this.viewStateChanged();
		}
	}
	
	this.fireEvent(new bpmEventObject(bpmEvent.TRANSLATE,
		'translate', this.translate, 'previousTranslate', previousTranslate));
};

bpmGraphView.prototype.viewStateChanged = function()
{
	this.revalidate();
	this.graph.sizeDidChange();
};

bpmGraphView.prototype.refresh = function()
{
	if (this.currentRoot != null)
	{
		this.clear();
	}
	
	this.revalidate();
};

bpmGraphView.prototype.revalidate = function()
{
	this.invalidate();
	this.validate();
};

bpmGraphView.prototype.clear = function(cell, force, recurse)
{
	var model = this.graph.getModel();
	cell = cell || model.getRoot();
	force = (force != null) ? force : false;
	recurse = (recurse != null) ? recurse : true;
	
	this.removeState(cell);
	
	if (recurse && (force || cell != this.currentRoot))
	{
		var childCount = model.getChildCount(cell);
		
		for (var i = 0; i < childCount; i++)
		{
			this.clear(model.getChildAt(cell, i), force);
		}
	}
	else
	{
		this.invalidate(cell);
	}
};

bpmGraphView.prototype.invalidate = function(cell, recurse, includeEdges)
{
	var model = this.graph.getModel();
	cell = cell || model.getRoot();
	recurse = (recurse != null) ? recurse : true;
	includeEdges = (includeEdges != null) ? includeEdges : true;
	
	var state = this.getState(cell);
	
	if (state != null)
	{
		state.invalid = true;
	}
	
	if (!cell.invalidating)
	{
		cell.invalidating = true;
		
		if (recurse)
		{
			var childCount = model.getChildCount(cell);
			
			for (var i = 0; i < childCount; i++)
			{
				var child = model.getChildAt(cell, i);
				this.invalidate(child, recurse, includeEdges);
			}
		}
		
		if (includeEdges)
		{
			var edgeCount = model.getEdgeCount(cell);
			
			for (var i = 0; i < edgeCount; i++)
			{
				this.invalidate(model.getEdgeAt(cell, i), recurse, includeEdges);
			}
		}
		
		delete cell.invalidating;
	}
};

bpmGraphView.prototype.validate = function(cell)
{
	var t0 = bpmLog.enter('bpmGraphView.validate');
	window.status = bpmResources.get(this.updatingDocumentResource) ||
		this.updatingDocumentResource;
	
	this.resetValidationState();
	
	var prevDisplay = null;
	
	if (this.optimizeVmlReflows && this.canvas != null && this.textDiv == null &&
		((document.documentMode == 8 && !bpmCore.IS_EM) || bpmCore.IS_QUIRKS))
	{
		this.placeholder = document.createElement('div');
		this.placeholder.style.position = 'absolute';
		this.placeholder.style.width = this.canvas.clientWidth + 'px';
		this.placeholder.style.height = this.canvas.clientHeight + 'px';
		this.canvas.parentNode.appendChild(this.placeholder);

		prevDisplay = this.drawPane.style.display;
		this.canvas.style.display = 'none';
		
		this.textDiv = document.createElement('div');
		this.textDiv.style.position = 'absolute';
		this.textDiv.style.whiteSpace = 'nowrap';
		this.textDiv.style.visibility = 'hidden';
		this.textDiv.style.display = (bpmCore.IS_QUIRKS) ? 'inline' : 'inline-block';
		this.textDiv.style.zoom = '1';
		
		document.body.appendChild(this.textDiv);
	}
	
	var graphBounds = this.getBoundingBox(this.validateCellState(
		this.validateCell(cell || ((this.currentRoot != null) ?
			this.currentRoot : this.graph.getModel().getRoot()))));
	this.setGraphBounds((graphBounds != null) ? graphBounds : this.getEmptyBounds());
	this.validateBackground();
	
	if (prevDisplay != null)
	{
		this.canvas.style.display = prevDisplay;
		this.textDiv.parentNode.removeChild(this.textDiv);
		
		if (this.placeholder != null)
		{
			this.placeholder.parentNode.removeChild(this.placeholder);
		}
				
		this.textDiv = null;
	}
	
	this.resetValidationState();
	
	window.status = bpmResources.get(this.doneResource) ||
		this.doneResource;
	bpmLog.leave('bpmGraphView.validate', t0);
};

bpmGraphView.prototype.getEmptyBounds = function()
{
	return new bpmRectangle(this.translate.x * this.scale, this.translate.y * this.scale);
};

bpmGraphView.prototype.getBoundingBox = function(state, recurse)
{
	recurse = (recurse != null) ? recurse : true;
	var bbox = null;
	
	if (state != null)
	{
		if (state.shape != null && state.shape.boundingBox != null)
		{
			bbox = state.shape.boundingBox.clone();
		}
		
		if (state.text != null && state.text.boundingBox != null)
		{
			if (bbox != null)
			{
				bbox.add(state.text.boundingBox);
			}
			else
			{
				bbox = state.text.boundingBox.clone();
			}
		}
		
		if (recurse)
		{
			var model = this.graph.getModel();
			var childCount = model.getChildCount(state.cell);
			
			for (var i = 0; i < childCount; i++)
			{
				var bounds = this.getBoundingBox(this.getState(model.getChildAt(state.cell, i)));
				
				if (bounds != null)
				{
					if (bbox == null)
					{
						bbox = bounds;
					}
					else
					{
						bbox.add(bounds);
					}
				}
			}
		}
	}
	
	return bbox;
};

bpmGraphView.prototype.createBackgroundPageShape = function(bounds)
{
	return new bpmRectangleShape(bounds, 'white', 'black');
};

bpmGraphView.prototype.validateBackground = function()
{
	this.validateBackgroundImage();
	this.validateBackgroundPage();
};

bpmGraphView.prototype.validateBackgroundImage = function()
{
	var bg = this.graph.getBackgroundImage();
	
	if (bg != null)
	{
		if (this.backgroundImage == null || this.backgroundImage.image != bg.src)
		{
			if (this.backgroundImage != null)
			{
				this.backgroundImage.destroy();
			}
			
			var bounds = new bpmRectangle(0, 0, 1, 1);
			
			this.backgroundImage = new bpmImageShape(bounds, bg.src);
			this.backgroundImage.dialect = this.graph.dialect;
			this.backgroundImage.init(this.backgroundPane);
			this.backgroundImage.redraw();

			if (document.documentMode == 8 && !bpmCore.IS_EM)
			{
				bpmEvent.addGestureListeners(this.backgroundImage.node,
					bpmUtils.bind(this, function(evt)
					{
						this.graph.fireMouseEvent(bpmEvent.MOUSE_DOWN, new bpmMouseEvent(evt));
					}),
					bpmUtils.bind(this, function(evt)
					{
						this.graph.fireMouseEvent(bpmEvent.MOUSE_MOVE, new bpmMouseEvent(evt));
					}),
					bpmUtils.bind(this, function(evt)
					{
						this.graph.fireMouseEvent(bpmEvent.MOUSE_UP, new bpmMouseEvent(evt));
					})
				);
			}
		}
		
		this.redrawBackgroundImage(this.backgroundImage, bg);
	}
	else if (this.backgroundImage != null)
	{
		this.backgroundImage.destroy();
		this.backgroundImage = null;
	}
};

bpmGraphView.prototype.validateBackgroundPage = function()
{
	if (this.graph.pageVisible)
	{
		var bounds = this.getBackgroundPageBounds();
		
		if (this.backgroundPageShape == null)
		{
			this.backgroundPageShape = this.createBackgroundPageShape(bounds);
			this.backgroundPageShape.scale = this.scale;
			this.backgroundPageShape.isShadow = true;
			this.backgroundPageShape.dialect = this.graph.dialect;
			this.backgroundPageShape.init(this.backgroundPane);
			this.backgroundPageShape.redraw();
			
			if (this.graph.nativeDblClickEnabled)
			{
				bpmEvent.addListener(this.backgroundPageShape.node, 'dblclick', bpmUtils.bind(this, function(evt)
				{
					this.graph.dblClick(evt);
				}));
			}

			bpmEvent.addGestureListeners(this.backgroundPageShape.node,
				bpmUtils.bind(this, function(evt)
				{
					this.graph.fireMouseEvent(bpmEvent.MOUSE_DOWN, new bpmMouseEvent(evt));
				}),
				bpmUtils.bind(this, function(evt)
				{
					if (this.graph.tooltipHandler != null && this.graph.tooltipHandler.isHideOnHover())
					{
						this.graph.tooltipHandler.hide();
					}
					
					if (this.graph.isMouseDown && !bpmEvent.isConsumed(evt))
					{
						this.graph.fireMouseEvent(bpmEvent.MOUSE_MOVE, new bpmMouseEvent(evt));
					}
				}),
				bpmUtils.bind(this, function(evt)
				{
					this.graph.fireMouseEvent(bpmEvent.MOUSE_UP, new bpmMouseEvent(evt));
				})
			);
		}
		else
		{
			this.backgroundPageShape.scale = this.scale;
			this.backgroundPageShape.bounds = bounds;
			this.backgroundPageShape.redraw();
		}
	}
	else if (this.backgroundPageShape != null)
	{
		this.backgroundPageShape.destroy();
		this.backgroundPageShape = null;
	}
};

bpmGraphView.prototype.getBackgroundPageBounds = function()
{
	var fmt = this.graph.pageFormat;
	var ps = this.scale * this.graph.pageScale;
	var bounds = new bpmRectangle(this.scale * this.translate.x, this.scale * this.translate.y,
			fmt.width * ps, fmt.height * ps);
	
	return bounds;
};

bpmGraphView.prototype.redrawBackgroundImage = function(backgroundImage, bg)
{
	backgroundImage.scale = this.scale;
	backgroundImage.bounds.x = this.scale * this.translate.x;
	backgroundImage.bounds.y = this.scale * this.translate.y;
	backgroundImage.bounds.width = this.scale * bg.width;
	backgroundImage.bounds.height = this.scale * bg.height;

	backgroundImage.redraw();
};

bpmGraphView.prototype.validateCell = function(cell, visible)
{
	visible = (visible != null) ? visible : true;
	
	if (cell != null)
	{
		visible = visible && this.graph.isCellVisible(cell);
		var state = this.getState(cell, visible);
		
		if (state != null && !visible)
		{
			this.removeState(cell);
		}
		else
		{
			var model = this.graph.getModel();
			var childCount = model.getChildCount(cell);
			
			for (var i = 0; i < childCount; i++)
			{
				this.validateCell(model.getChildAt(cell, i), visible &&
					(!this.isCellCollapsed(cell) || cell == this.currentRoot));
			}
		}
	}
	
	return cell;
};

bpmGraphView.prototype.validateCellState = function(cell, recurse)
{
	recurse = (recurse != null) ? recurse : true;
	var state = null;
	
	if (cell != null)
	{
		state = this.getState(cell);
		
		if (state != null)
		{
			var model = this.graph.getModel();
			
			if (state.invalid)
			{
				state.invalid = false;
				
				if (state.style == null || state.invalidStyle)
				{
					state.style = this.graph.getCellStyle(state.cell);
					state.invalidStyle = false;
				}
				
				if (cell != this.currentRoot)
				{
					this.validateCellState(model.getParent(cell), false);
				}

				state.setVisibleTerminalState(this.validateCellState(this.getVisibleTerminal(cell, true), false), true);
				state.setVisibleTerminalState(this.validateCellState(this.getVisibleTerminal(cell, false), false), false);
				
				this.updateCellState(state);
				
				if (cell != this.currentRoot && !state.invalid)
				{
					this.graph.cellRenderer.redraw(state, false, this.isRendering());

					state.updateCachedBounds();
				}
			}

			if (recurse && !state.invalid)
			{
				if (state.shape != null)
				{
					this.stateValidated(state);
				}
			
				var childCount = model.getChildCount(cell);
				
				for (var i = 0; i < childCount; i++)
				{
					this.validateCellState(model.getChildAt(cell, i));
				}
			}
		}
	}
	
	return state;
};

bpmGraphView.prototype.updateCellState = function(state)
{
	state.absoluteOffset.x = 0;
	state.absoluteOffset.y = 0;
	state.origin.x = 0;
	state.origin.y = 0;
	state.length = 0;
	
	if (state.cell != this.currentRoot)
	{
		var model = this.graph.getModel();
		var pState = this.getState(model.getParent(state.cell)); 
		
		if (pState != null && pState.cell != this.currentRoot)
		{
			state.origin.x += pState.origin.x;
			state.origin.y += pState.origin.y;
		}
		
		var offset = this.graph.getChildOffsetForCell(state.cell);
		
		if (offset != null)
		{
			state.origin.x += offset.x;
			state.origin.y += offset.y;
		}
		
		var geo = this.graph.getCellGeometry(state.cell);				
	
		if (geo != null)
		{
			if (!model.isEdge(state.cell))
			{
				offset = geo.offset || this.EMPTY_POINT;
	
				if (geo.relative && pState != null)
				{
					if (model.isEdge(pState.cell))
					{
						var origin = this.getPoint(pState, geo);

						if (origin != null)
						{
							state.origin.x += (origin.x / this.scale) - pState.origin.x - this.translate.x;
							state.origin.y += (origin.y / this.scale) - pState.origin.y - this.translate.y;
						}
					}
					else
					{
						state.origin.x += geo.x * pState.width / this.scale + offset.x;
						state.origin.y += geo.y * pState.height / this.scale + offset.y;
					}
				}
				else
				{
					state.absoluteOffset.x = this.scale * offset.x;
					state.absoluteOffset.y = this.scale * offset.y;
					state.origin.x += geo.x;
					state.origin.y += geo.y;
				}
			}
	
			state.x = this.scale * (this.translate.x + state.origin.x);
			state.y = this.scale * (this.translate.y + state.origin.y);
			state.width = this.scale * geo.width;
			state.unscaledWidth = geo.width;
			state.height = this.scale * geo.height;
			
			if (model.isVertex(state.cell))
			{
				this.updateVertexState(state, geo);
			}
			
			if (model.isEdge(state.cell))
			{
				this.updateEdgeState(state, geo);
			}
		}
	}

	state.updateCachedBounds();
};

bpmGraphView.prototype.isCellCollapsed = function(cell)
{
	return this.graph.isCellCollapsed(cell);
};

bpmGraphView.prototype.updateVertexState = function(state, geo)
{
	var model = this.graph.getModel();
	var pState = this.getState(model.getParent(state.cell));
	
	if (geo.relative && pState != null && !model.isEdge(pState.cell))
	{
		var alpha = bpmUtils.toRadians(pState.style[bpmConstants.STYLE_ROTATION] || '0');
		
		if (alpha != 0)
		{
			var cos = Math.cos(alpha);
			var sin = Math.sin(alpha);

			var ct = new bpmPoint(state.getCenterX(), state.getCenterY());
			var cx = new bpmPoint(pState.getCenterX(), pState.getCenterY());
			var pt = bpmUtils.getRotatedPoint(ct, cos, sin, cx);
			state.x = pt.x - state.width / 2;
			state.y = pt.y - state.height / 2;
		}
	}
	
	this.updateVertexLabelOffset(state);
};

bpmGraphView.prototype.updateEdgeState = function(state, geo)
{
	var source = state.getVisibleTerminalState(true);
	var target = state.getVisibleTerminalState(false);
	
	if ((this.graph.model.getTerminal(state.cell, true) != null && source == null) ||
		(source == null && geo.getTerminalPoint(true) == null) ||
		(this.graph.model.getTerminal(state.cell, false) != null && target == null) ||
		(target == null && geo.getTerminalPoint(false) == null))
	{
		this.clear(state.cell, true);
	}
	else
	{
		this.updateFixedTerminalPoints(state, source, target);
		this.updatePoints(state, geo.points, source, target);
		this.updateFloatingTerminalPoints(state, source, target);
		
		var pts = state.absolutePoints;
		
		if (state.cell != this.currentRoot && (pts == null || pts.length < 2 ||
			pts[0] == null || pts[pts.length - 1] == null))
		{
			this.clear(state.cell, true);
		}
		else
		{
			this.updateEdgeBounds(state);
			this.updateEdgeLabelOffset(state);
		}
	}
};

bpmGraphView.prototype.updateVertexLabelOffset = function(state)
{
	var h = bpmUtils.getValue(state.style, bpmConstants.STYLE_LABEL_POSITION, bpmConstants.ALIGN_CENTER);

	if (h == bpmConstants.ALIGN_LEFT)
	{
		var lw = bpmUtils.getValue(state.style, bpmConstants.STYLE_LABEL_WIDTH, null);
		
		if (lw != null)
		{
			lw *= this.scale;
		}
		else
		{
			lw = state.width;
		}
		
		state.absoluteOffset.x -= lw;
	}
	else if (h == bpmConstants.ALIGN_RIGHT)
	{
		state.absoluteOffset.x += state.width;
	}
	else if (h == bpmConstants.ALIGN_CENTER)
	{
		var lw = bpmUtils.getValue(state.style, bpmConstants.STYLE_LABEL_WIDTH, null);
		
		if (lw != null)
		{
			var align = bpmUtils.getValue(state.style, bpmConstants.STYLE_ALIGN, bpmConstants.ALIGN_CENTER);
			var dx = 0;
			
			if (align == bpmConstants.ALIGN_CENTER)
			{
				dx = 0.5;
			}
			else if (align == bpmConstants.ALIGN_RIGHT)
			{
				dx = 1;
			}
			
			if (dx != 0)
			{
				state.absoluteOffset.x -= (lw * this.scale - state.width) * dx;
			}
		}
	}
	
	var v = bpmUtils.getValue(state.style, bpmConstants.STYLE_VERTICAL_LABEL_POSITION, bpmConstants.ALIGN_MIDDLE);
	
	if (v == bpmConstants.ALIGN_TOP)
	{
		state.absoluteOffset.y -= state.height;
	}
	else if (v == bpmConstants.ALIGN_BOTTOM)
	{
		state.absoluteOffset.y += state.height;
	}
};

bpmGraphView.prototype.resetValidationState = function()
{
	this.lastNode = null;
	this.lastHtmlNode = null;
	this.lastForegroundNode = null;
	this.lastForegroundHtmlNode = null;
};

bpmGraphView.prototype.stateValidated = function(state)
{
	var fg = (this.graph.getModel().isEdge(state.cell) && this.graph.keepEdgesInForeground) ||
		(this.graph.getModel().isVertex(state.cell) && this.graph.keepEdgesInBackground);
	var htmlNode = (fg) ? this.lastForegroundHtmlNode || this.lastHtmlNode : this.lastHtmlNode;
	var node = (fg) ? this.lastForegroundNode || this.lastNode : this.lastNode;
	var result = this.graph.cellRenderer.insertStateAfter(state, node, htmlNode);

	if (fg)
	{
		this.lastForegroundHtmlNode = result[1];
		this.lastForegroundNode = result[0];
	}
	else
	{
		this.lastHtmlNode = result[1];
		this.lastNode = result[0];
	}
};

bpmGraphView.prototype.updateFixedTerminalPoints = function(edge, source, target)
{
	this.updateFixedTerminalPoint(edge, source, true,
		this.graph.getConnectionConstraint(edge, source, true));
	this.updateFixedTerminalPoint(edge, target, false,
		this.graph.getConnectionConstraint(edge, target, false));
};

bpmGraphView.prototype.updateFixedTerminalPoint = function(edge, terminal, source, constraint)
{
	edge.setAbsoluteTerminalPoint(this.getFixedTerminalPoint(edge, terminal, source, constraint), source);
};

bpmGraphView.prototype.getFixedTerminalPoint = function(edge, terminal, source, constraint)
{
	var pt = null;
	
	if (constraint != null)
	{
		pt = this.graph.getConnectionPoint(terminal, constraint, this.graph.isOrthogonal(edge));
	}
	
	if (pt == null && terminal == null)
	{
		var s = this.scale;
		var tr = this.translate;
		var orig = edge.origin;
		var geo = this.graph.getCellGeometry(edge.cell);
		pt = geo.getTerminalPoint(source);
		
		if (pt != null)
		{
			pt = new bpmPoint(s * (tr.x + pt.x + orig.x),
							 s * (tr.y + pt.y + orig.y));
		}
	}
	
	return pt;
};

bpmGraphView.prototype.updateBoundsFromStencil = function(state)
{
	var previous = null;
	
	if (state != null && state.shape != null && state.shape.stencil != null && state.shape.stencil.aspect == 'fixed')
	{
		previous = bpmRectangle.fromRectangle(state);
		var asp = state.shape.stencil.computeAspect(state.style, state.x, state.y, state.width, state.height);
		state.setRect(asp.x, asp.y, state.shape.stencil.w0 * asp.width, state.shape.stencil.h0 * asp.height);
	}
	
	return previous;
};

bpmGraphView.prototype.updatePoints = function(edge, points, source, target)
{
	if (edge != null)
	{
		var pts = [];
		pts.push(edge.absolutePoints[0]);
		var edgeStyle = this.getEdgeStyle(edge, points, source, target);
		
		if (edgeStyle != null)
		{
			var src = this.getTerminalPort(edge, source, true);
			var trg = this.getTerminalPort(edge, target, false);
			
			var srcBounds = this.updateBoundsFromStencil(src);
			var trgBounds = this.updateBoundsFromStencil(trg);

			edgeStyle(edge, src, trg, points, pts);
			
			if (srcBounds != null)
			{
				src.setRect(srcBounds.x, srcBounds.y, srcBounds.width, srcBounds.height);
			}
			
			if (trgBounds != null)
			{
				trg.setRect(trgBounds.x, trgBounds.y, trgBounds.width, trgBounds.height);
			}
		}
		else if (points != null)
		{
			for (var i = 0; i < points.length; i++)
			{
				if (points[i] != null)
				{
					var pt = bpmUtils.clone(points[i]);
					pts.push(this.transformControlPoint(edge, pt));
				}
			}
		}
		
		var tmp = edge.absolutePoints;
		pts.push(tmp[tmp.length-1]);

		edge.absolutePoints = pts;
	}
};

bpmGraphView.prototype.transformControlPoint = function(state, pt)
{
	if (state != null && pt != null)
	{
		var orig = state.origin;
		
	    return new bpmPoint(this.scale * (pt.x + this.translate.x + orig.x),
	    	this.scale * (pt.y + this.translate.y + orig.y));
	}
	
	return null;
};

bpmGraphView.prototype.isLoopStyleEnabled = function(edge, points, source, target)
{
	var sc = this.graph.getConnectionConstraint(edge, source, true);
	var tc = this.graph.getConnectionConstraint(edge, target, false);
	
	if ((points == null || points.length < 2) &&
		(!bpmUtils.getValue(edge.style, bpmConstants.STYLE_ORTHOGONAL_LOOP, false) ||
		((sc == null || sc.point == null) && (tc == null || tc.point == null))))
	{
		return source != null && source == target;
	}
	
	return false;
};

bpmGraphView.prototype.getEdgeStyle = function(edge, points, source, target)
{
	var edgeStyle = this.isLoopStyleEnabled(edge, points, source, target) ?
		bpmUtils.getValue(edge.style, bpmConstants.STYLE_LOOP, this.graph.defaultLoopStyle) :
		(!bpmUtils.getValue(edge.style, bpmConstants.STYLE_NOEDGESTYLE, false) ?
		edge.style[bpmConstants.STYLE_EDGE] : null);

	if (typeof(edgeStyle) == "string")
	{
		var tmp = bpmStyleRegistry.getValue(edgeStyle);
		
		if (tmp == null && this.isAllowEval())
		{
 			tmp = bpmUtils.eval(edgeStyle);
		}
		
		edgeStyle = tmp;
	}
	
	if (typeof(edgeStyle) == "function")
	{
		return edgeStyle;
	}
	
	return null;
};

bpmGraphView.prototype.updateFloatingTerminalPoints = function(state, source, target)
{
	var pts = state.absolutePoints;
	var p0 = pts[0];
	var pe = pts[pts.length - 1];

	if (pe == null && target != null)
	{
		this.updateFloatingTerminalPoint(state, target, source, false);
	}
	
	if (p0 == null && source != null)
	{
		this.updateFloatingTerminalPoint(state, source, target, true);
	}
};

bpmGraphView.prototype.updateFloatingTerminalPoint = function(edge, start, end, source)
{
	edge.setAbsoluteTerminalPoint(this.getFloatingTerminalPoint(edge, start, end, source), source);
};

bpmGraphView.prototype.getFloatingTerminalPoint = function(edge, start, end, source)
{
	start = this.getTerminalPort(edge, start, source);
	var next = this.getNextPoint(edge, end, source);
	
	var orth = this.graph.isOrthogonal(edge);
	var alpha = bpmUtils.toRadians(Number(start.style[bpmConstants.STYLE_ROTATION] || '0'));
	var center = new bpmPoint(start.getCenterX(), start.getCenterY());
	
	if (alpha != 0)
	{
		var cos = Math.cos(-alpha);
		var sin = Math.sin(-alpha);
		next = bpmUtils.getRotatedPoint(next, cos, sin, center);
	}
	
	var border = parseFloat(edge.style[bpmConstants.STYLE_PERIMETER_SPACING] || 0);
	border += parseFloat(edge.style[(source) ?
		bpmConstants.STYLE_SOURCE_PERIMETER_SPACING :
		bpmConstants.STYLE_TARGET_PERIMETER_SPACING] || 0);
	var pt = this.getPerimeterPoint(start, next, alpha == 0 && orth, border);

	if (alpha != 0)
	{
		var cos = Math.cos(alpha);
		var sin = Math.sin(alpha);
		pt = bpmUtils.getRotatedPoint(pt, cos, sin, center);
	}

	return pt;
};

bpmGraphView.prototype.getTerminalPort = function(state, terminal, source)
{
	var key = (source) ? bpmConstants.STYLE_SOURCE_PORT :
		bpmConstants.STYLE_TARGET_PORT;
	var id = bpmUtils.getValue(state.style, key);
	
	if (id != null)
	{
		var tmp = this.getState(this.graph.getModel().getCell(id));
		
		if (tmp != null)
		{
			terminal = tmp;
		}
	}
	
	return terminal;
};

bpmGraphView.prototype.getPerimeterPoint = function(terminal, next, orthogonal, border)
{
	var point = null;
	
	if (terminal != null)
	{
		var perimeter = this.getPerimeterFunction(terminal);
		
		if (perimeter != null && next != null)
		{
			var bounds = this.getPerimeterBounds(terminal, border);

			if (bounds.width > 0 || bounds.height > 0)
			{
				point = new bpmPoint(next.x, next.y);
				var flipH = false;
				var flipV = false;	
				
				if (this.graph.model.isVertex(terminal.cell))
				{
					flipH = bpmUtils.getValue(terminal.style, bpmConstants.STYLE_FLIPH, 0) == 1;
					flipV = bpmUtils.getValue(terminal.style, bpmConstants.STYLE_FLIPV, 0) == 1;	
	
					if (terminal.shape != null && terminal.shape.stencil != null)
					{
						flipH = (bpmUtils.getValue(terminal.style, 'stencilFlipH', 0) == 1) || flipH;
						flipV = (bpmUtils.getValue(terminal.style, 'stencilFlipV', 0) == 1) || flipV;
					}
	
					if (flipH)
					{
						point.x = 2 * bounds.getCenterX() - point.x;
					}
					
					if (flipV)
					{
						point.y = 2 * bounds.getCenterY() - point.y;
					}
				}
				
				point = perimeter(bounds, terminal, point, orthogonal);

				if (point != null)
				{
					if (flipH)
					{
						point.x = 2 * bounds.getCenterX() - point.x;
					}
					
					if (flipV)
					{
						point.y = 2 * bounds.getCenterY() - point.y;
					}
				}
			}
		}
		
		if (point == null)
		{
			point = this.getPoint(terminal);
		}
	}
	
	return point;
};

bpmGraphView.prototype.getRoutingCenterX = function (state)
{
	var f = (state.style != null) ? parseFloat(state.style
		[bpmConstants.STYLE_ROUTING_CENTER_X]) || 0 : 0;

	return state.getCenterX() + f * state.width;
};

bpmGraphView.prototype.getRoutingCenterY = function (state)
{
	var f = (state.style != null) ? parseFloat(state.style
		[bpmConstants.STYLE_ROUTING_CENTER_Y]) || 0 : 0;

	return state.getCenterY() + f * state.height;
};

bpmGraphView.prototype.getPerimeterBounds = function(terminal, border)
{
	border = (border != null) ? border : 0;

	if (terminal != null)
	{
		border += parseFloat(terminal.style[bpmConstants.STYLE_PERIMETER_SPACING] || 0);
	}

	return terminal.getPerimeterBounds(border * this.scale);
};

bpmGraphView.prototype.getPerimeterFunction = function(state)
{
	var perimeter = state.style[bpmConstants.STYLE_PERIMETER];

	if (typeof(perimeter) == "string")
	{
		var tmp = bpmStyleRegistry.getValue(perimeter);
		
		if (tmp == null && this.isAllowEval())
		{
 			tmp = bpmUtils.eval(perimeter);
		}

		perimeter = tmp;
	}
	
	if (typeof(perimeter) == "function")
	{
		return perimeter;
	}
	
	return null;
};

bpmGraphView.prototype.getNextPoint = function(edge, opposite, source)
{
	var pts = edge.absolutePoints;
	var point = null;
	
	if (pts != null && pts.length >= 2)
	{
		var count = pts.length;
		point = pts[(source) ? Math.min(1, count - 1) : Math.max(0, count - 2)];
	}
	
	if (point == null && opposite != null)
	{
		point = new bpmPoint(opposite.getCenterX(), opposite.getCenterY());
	}
	
	return point;
};

bpmGraphView.prototype.getVisibleTerminal = function(edge, source)
{
	var model = this.graph.getModel();
	var result = model.getTerminal(edge, source);
	var best = result;
	
	while (result != null && result != this.currentRoot)
	{
		if (!this.graph.isCellVisible(best) || this.isCellCollapsed(result))
		{
			best = result;
		}
		
		result = model.getParent(result);
	}

	if (best != null && (!model.contains(best) ||
		model.getParent(best) == model.getRoot() ||
		best == this.currentRoot))
	{
		best = null;
	}
	
	return best;
};

bpmGraphView.prototype.updateEdgeBounds = function(state)
{
	var points = state.absolutePoints;
	var p0 = points[0];
	var pe = points[points.length - 1];
	
	if (p0.x != pe.x || p0.y != pe.y)
	{
		var dx = pe.x - p0.x;
		var dy = pe.y - p0.y;
		state.terminalDistance = Math.sqrt(dx * dx + dy * dy);
	}
	else
	{
		state.terminalDistance = 0;
	}
	
	var length = 0;
	var segments = [];
	var pt = p0;
	
	if (pt != null)
	{
		var minX = pt.x;
		var minY = pt.y;
		var maxX = minX;
		var maxY = minY;
		
		for (var i = 1; i < points.length; i++)
		{
			var tmp = points[i];
			
			if (tmp != null)
			{
				var dx = pt.x - tmp.x;
				var dy = pt.y - tmp.y;
				
				var segment = Math.sqrt(dx * dx + dy * dy);
				segments.push(segment);
				length += segment;
				
				pt = tmp;
				
				minX = Math.min(pt.x, minX);
				minY = Math.min(pt.y, minY);
				maxX = Math.max(pt.x, maxX);
				maxY = Math.max(pt.y, maxY);
			}
		}
		
		state.length = length;
		state.segments = segments;
		
		var markerSize = 1;
		
		state.x = minX;
		state.y = minY;
		state.width = Math.max(markerSize, maxX - minX);
		state.height = Math.max(markerSize, maxY - minY);
	}
};

bpmGraphView.prototype.getPoint = function(state, geometry)
{
	var x = state.getCenterX();
	var y = state.getCenterY();
	
	if (state.segments != null && (geometry == null || geometry.relative))
	{
		var gx = (geometry != null) ? geometry.x / 2 : 0;
		var pointCount = state.absolutePoints.length;
		var dist = Math.round((gx + 0.5) * state.length);
		var segment = state.segments[0];
		var length = 0;				
		var index = 1;

		while (dist >= Math.round(length + segment) && index < pointCount - 1)
		{
			length += segment;
			segment = state.segments[index++];
		}

		var factor = (segment == 0) ? 0 : (dist - length) / segment;
		var p0 = state.absolutePoints[index-1];
		var pe = state.absolutePoints[index];

		if (p0 != null && pe != null)
		{
			var gy = 0;
			var offsetX = 0;
			var offsetY = 0;

			if (geometry != null)
			{
				gy = geometry.y;
				var offset = geometry.offset;
				
				if (offset != null)
				{
					offsetX = offset.x;
					offsetY = offset.y;
				}
			}

			var dx = pe.x - p0.x;
			var dy = pe.y - p0.y;
			var nx = (segment == 0) ? 0 : dy / segment;
			var ny = (segment == 0) ? 0 : dx / segment;
			
			x = p0.x + dx * factor + (nx * gy + offsetX) * this.scale;
			y = p0.y + dy * factor - (ny * gy - offsetY) * this.scale;
		}
	}
	else if (geometry != null)
	{
		var offset = geometry.offset;
		
		if (offset != null)
		{
			x += offset.x;
			y += offset.y;
		}
	}
	
	return new bpmPoint(x, y);		
};

bpmGraphView.prototype.getRelativePoint = function(edgeState, x, y)
{
	var model = this.graph.getModel();
	var geometry = model.getGeometry(edgeState.cell);
	
	if (geometry != null)
	{
		var pointCount = edgeState.absolutePoints.length;
		
		if (geometry.relative && pointCount > 1)
		{
			var totalLength = edgeState.length;
			var segments = edgeState.segments;

			var p0 = edgeState.absolutePoints[0];
			var pe = edgeState.absolutePoints[1];
			var minDist = bpmUtils.ptSegDistSq(p0.x, p0.y, pe.x, pe.y, x, y);

			var index = 0;
			var tmp = 0;
			var length = 0;
			
			for (var i = 2; i < pointCount; i++)
			{
				tmp += segments[i - 2];
				pe = edgeState.absolutePoints[i];
				var dist = bpmUtils.ptSegDistSq(p0.x, p0.y, pe.x, pe.y, x, y);

				if (dist <= minDist)
				{
					minDist = dist;
					index = i - 1;
					length = tmp;
				}
				
				p0 = pe;
			}
			
			var seg = segments[index];
			p0 = edgeState.absolutePoints[index];
			pe = edgeState.absolutePoints[index + 1];
			
			var x2 = p0.x;
			var y2 = p0.y;
			
			var x1 = pe.x;
			var y1 = pe.y;
			
			var px = x;
			var py = y;
			
			var xSegment = x2 - x1;
			var ySegment = y2 - y1;
			
			px -= x1;
			py -= y1;
			var projlenSq = 0;
			
			px = xSegment - px;
			py = ySegment - py;
			var dotprod = px * xSegment + py * ySegment;

			if (dotprod <= 0.0)
			{
				projlenSq = 0;
			}
			else
			{
				projlenSq = dotprod * dotprod
						/ (xSegment * xSegment + ySegment * ySegment);
			}

			var projlen = Math.sqrt(projlenSq);

			if (projlen > seg)
			{
				projlen = seg;
			}

			var yDistance = Math.sqrt(bpmUtils.ptSegDistSq(p0.x, p0.y, pe
					.x, pe.y, x, y));
			var direction = bpmUtils.relativeCcw(p0.x, p0.y, pe.x, pe.y, x, y);

			if (direction == -1)
			{
				yDistance = -yDistance;
			}

			return new bpmPoint(((totalLength / 2 - length - projlen) / totalLength) * -2,
						yDistance / this.scale);
		}
	}
	
	return new bpmPoint();
};

bpmGraphView.prototype.updateEdgeLabelOffset = function(state)
{
	var points = state.absolutePoints;
	
	state.absoluteOffset.x = state.getCenterX();
	state.absoluteOffset.y = state.getCenterY();

	if (points != null && points.length > 0 && state.segments != null)
	{
		var geometry = this.graph.getCellGeometry(state.cell);
		
		if (geometry.relative)
		{
			var offset = this.getPoint(state, geometry);
			
			if (offset != null)
			{
				state.absoluteOffset = offset;
			}
		}
		else
		{
			var p0 = points[0];
			var pe = points[points.length - 1];
			
			if (p0 != null && pe != null)
			{
				var dx = pe.x - p0.x;
				var dy = pe.y - p0.y;
				var x0 = 0;
				var y0 = 0;

				var off = geometry.offset;
				
				if (off != null)
				{
					x0 = off.x;
					y0 = off.y;
				}
				
				var x = p0.x + dx / 2 + x0 * this.scale;
				var y = p0.y + dy / 2 + y0 * this.scale;
				
				state.absoluteOffset.x = x;
				state.absoluteOffset.y = y;
			}
		}
	}
};

bpmGraphView.prototype.getState = function(cell, create)
{
	create = create || false;
	var state = null;
	
	if (cell != null)
	{
		state = this.states.get(cell);
		
		if (create && (state == null || this.updateStyle) && this.graph.isCellVisible(cell))
		{
			if (state == null)
			{
				state = this.createState(cell);
				this.states.put(cell, state);
			}
			else
			{
				state.style = this.graph.getCellStyle(cell);
			}
		}
	}

	return state;
};

bpmGraphView.prototype.isRendering = function()
{
	return this.rendering;
};

bpmGraphView.prototype.setRendering = function(value)
{
	this.rendering = value;
};

bpmGraphView.prototype.isAllowEval = function()
{
	return this.allowEval;
};

bpmGraphView.prototype.setAllowEval = function(value)
{
	this.allowEval = value;
};

bpmGraphView.prototype.getStates = function()
{
	return this.states;
};

bpmGraphView.prototype.setStates = function(value)
{
	this.states = value;
};

bpmGraphView.prototype.getCellStates = function(cells)
{
	if (cells == null)
	{
		return this.states;
	}
	else
	{
		var result = [];
		
		for (var i = 0; i < cells.length; i++)
		{
			var state = this.getState(cells[i]);
			
			if (state != null)
			{
				result.push(state);
			}
		}
		
		return result;
	}
};

bpmGraphView.prototype.removeState = function(cell)
{
	var state = null;
	
	if (cell != null)
	{
		state = this.states.remove(cell);
		
		if (state != null)
		{
			this.graph.cellRenderer.destroy(state);
			state.invalid = true;
			state.destroy();
		}
	}
	
	return state;
};

bpmGraphView.prototype.createState = function(cell)
{
	return new bpmCellState(this, cell, this.graph.getCellStyle(cell));
};

bpmGraphView.prototype.getCanvas = function()
{
	return this.canvas;
};

bpmGraphView.prototype.getBackgroundPane = function()
{
	return this.backgroundPane;
};

bpmGraphView.prototype.getDrawPane = function()
{
	return this.drawPane;
};

bpmGraphView.prototype.getOverlayPane = function()
{
	return this.overlayPane;
};

bpmGraphView.prototype.getDecoratorPane = function()
{
	return this.decoratorPane;
};

bpmGraphView.prototype.isContainerEvent = function(evt)
{
	var source = bpmEvent.getSource(evt);

	return (source == this.graph.container ||
		source.parentNode == this.backgroundPane ||
		(source.parentNode != null &&
		source.parentNode.parentNode == this.backgroundPane) ||
		source == this.canvas.parentNode ||
		source == this.canvas ||
		source == this.backgroundPane ||
		source == this.drawPane ||
		source == this.overlayPane ||
		source == this.decoratorPane);
};

bpmGraphView.prototype.isScrollEvent = function(evt)
{
	var offset = bpmUtils.getOffset(this.graph.container);
	var pt = new bpmPoint(evt.clientX - offset.x, evt.clientY - offset.y);

	var outWidth = this.graph.container.offsetWidth;
	var inWidth = this.graph.container.clientWidth;

	if (outWidth > inWidth && pt.x > inWidth + 2 && pt.x <= outWidth)
	{
		return true;
	}

	var outHeight = this.graph.container.offsetHeight;
	var inHeight = this.graph.container.clientHeight;
	
	if (outHeight > inHeight && pt.y > inHeight + 2 && pt.y <= outHeight)
	{
		return true;
	}
	
	return false;
};

bpmGraphView.prototype.init = function()
{
	this.installListeners();
	
	var graph = this.graph;
	
	if (graph.dialect == bpmConstants.DIALECT_SVG)
	{
		this.createSvg();
	}
	else if (graph.dialect == bpmConstants.DIALECT_VML)
	{
		this.createVml();
	}
	else
	{
		this.createHtml();
	}
};

bpmGraphView.prototype.installListeners = function()
{
	var graph = this.graph;
	var container = graph.container;
	
	if (container != null)
	{
		if (bpmCore.IS_TOUCH)
		{
			bpmEvent.addListener(container, 'gesturestart', bpmUtils.bind(this, function(evt)
			{
				graph.fireGestureEvent(evt);
				bpmEvent.consume(evt);
			}));
			
			bpmEvent.addListener(container, 'gesturechange', bpmUtils.bind(this, function(evt)
			{
				graph.fireGestureEvent(evt);
				bpmEvent.consume(evt);
			}));

			bpmEvent.addListener(container, 'gestureend', bpmUtils.bind(this, function(evt)
			{
				graph.fireGestureEvent(evt);
				bpmEvent.consume(evt);
			}));
		}
		
		bpmEvent.addGestureListeners(container, bpmUtils.bind(this, function(evt)
		{
			if (this.isContainerEvent(evt) && ((!bpmCore.IS_IE && !bpmCore.IS_IE11 && !bpmCore.IS_GC &&
				!bpmCore.IS_OP && !bpmCore.IS_SF) || !this.isScrollEvent(evt)))
			{
				graph.fireMouseEvent(bpmEvent.MOUSE_DOWN, new bpmMouseEvent(evt));
			}
		}),
		bpmUtils.bind(this, function(evt)
		{
			if (this.isContainerEvent(evt))
			{
				graph.fireMouseEvent(bpmEvent.MOUSE_MOVE, new bpmMouseEvent(evt));
			}
		}),
		bpmUtils.bind(this, function(evt)
		{
			if (this.isContainerEvent(evt))
			{
				graph.fireMouseEvent(bpmEvent.MOUSE_UP, new bpmMouseEvent(evt));
			}
		}));
		
		bpmEvent.addListener(container, 'dblclick', bpmUtils.bind(this, function(evt)
		{
			if (this.isContainerEvent(evt))
			{
				graph.dblClick(evt);
			}
		}));

		var getState = function(evt)
		{
			var state = null;
			
			if (bpmCore.IS_TOUCH)
			{
				var x = bpmEvent.getClientX(evt);
				var y = bpmEvent.getClientY(evt);
				
				var pt = bpmUtils.convertPoint(container, x, y);
				state = graph.view.getState(graph.getCellAt(pt.x, pt.y));
			}
			
			return state;
		};

		graph.addMouseListener(
		{
			mouseDown: function(sender, me)
			{
				graph.popupMenuHandler.hideMenu();
			},
			mouseMove: function() { },
			mouseUp: function() { }
		});
		
		this.moveHandler = bpmUtils.bind(this, function(evt)
		{
			if (graph.tooltipHandler != null && graph.tooltipHandler.isHideOnHover())
			{
				graph.tooltipHandler.hide();
			}

			if (this.captureDocumentGesture && graph.isMouseDown && graph.container != null &&
				!this.isContainerEvent(evt) && graph.container.style.display != 'none' &&
				graph.container.style.visibility != 'hidden' && !bpmEvent.isConsumed(evt))
			{
				graph.fireMouseEvent(bpmEvent.MOUSE_MOVE, new bpmMouseEvent(evt, getState(evt)));
			}
		});
		
		this.endHandler = bpmUtils.bind(this, function(evt)
		{
			if (this.captureDocumentGesture && graph.isMouseDown && graph.container != null &&
				!this.isContainerEvent(evt) && graph.container.style.display != 'none' &&
				graph.container.style.visibility != 'hidden')
			{
				graph.fireMouseEvent(bpmEvent.MOUSE_UP, new bpmMouseEvent(evt));
			}
		});
		
		bpmEvent.addGestureListeners(document, null, this.moveHandler, this.endHandler);
	}
};

bpmGraphView.prototype.createHtml = function()
{
	var container = this.graph.container;
	
	if (container != null)
	{
		this.canvas = this.createHtmlPane('100%', '100%');
		this.canvas.style.overflow = 'hidden';
	
		this.backgroundPane = this.createHtmlPane('1px', '1px');
		this.drawPane = this.createHtmlPane('1px', '1px');
		this.overlayPane = this.createHtmlPane('1px', '1px');
		this.decoratorPane = this.createHtmlPane('1px', '1px');
		
		this.canvas.appendChild(this.backgroundPane);
		this.canvas.appendChild(this.drawPane);
		this.canvas.appendChild(this.overlayPane);
		this.canvas.appendChild(this.decoratorPane);

		container.appendChild(this.canvas);
		this.updateContainerStyle(container);
		
		if (bpmCore.IS_QUIRKS)
		{
			var onResize = bpmUtils.bind(this, function(evt)
			{
				var bounds = this.getGraphBounds();
				var width = bounds.x + bounds.width + this.graph.border;
				var height = bounds.y + bounds.height + this.graph.border;
				
				this.updateHtmlCanvasSize(width, height);
			});
			
			bpmEvent.addListener(window, 'resize', onResize);
		}
	}
};

bpmGraphView.prototype.updateHtmlCanvasSize = function(width, height)
{
	if (this.graph.container != null)
	{
		var ow = this.graph.container.offsetWidth;
		var oh = this.graph.container.offsetHeight;

		if (ow < width)
		{
			this.canvas.style.width = width + 'px';
		}
		else
		{
			this.canvas.style.width = '100%';
		}

		if (oh < height)
		{
			this.canvas.style.height = height + 'px';
		}
		else
		{
			this.canvas.style.height = '100%';
		}
	}
};

bpmGraphView.prototype.createHtmlPane = function(width, height)
{
	var pane = document.createElement('DIV');
	
	if (width != null && height != null)
	{
		pane.style.position = 'absolute';
		pane.style.left = '0px';
		pane.style.top = '0px';

		pane.style.width = width;
		pane.style.height = height;
	}
	else
	{
		pane.style.position = 'relative';
	}
	
	return pane;
};

bpmGraphView.prototype.createVml = function()
{
	var container = this.graph.container;

	if (container != null)
	{
		var width = container.offsetWidth;
		var height = container.offsetHeight;
		this.canvas = this.createVmlPane(width, height);
		this.canvas.style.overflow = 'hidden';
		
		this.backgroundPane = this.createVmlPane(width, height);
		this.drawPane = this.createVmlPane(width, height);
		this.overlayPane = this.createVmlPane(width, height);
		this.decoratorPane = this.createVmlPane(width, height);
		
		this.canvas.appendChild(this.backgroundPane);
		this.canvas.appendChild(this.drawPane);
		this.canvas.appendChild(this.overlayPane);
		this.canvas.appendChild(this.decoratorPane);
		
		container.appendChild(this.canvas);
	}
};

bpmGraphView.prototype.createVmlPane = function(width, height)
{
	var pane = document.createElement(bpmCore.VML_PREFIX + ':group');
	
	pane.style.position = 'absolute';
	pane.style.left = '0px';
	pane.style.top = '0px';

	pane.style.width = width + 'px';
	pane.style.height = height + 'px';

	pane.setAttribute('coordsize', width + ',' + height);
	pane.setAttribute('coordorigin', '0,0');
	
	return pane;
};

bpmGraphView.prototype.createSvg = function()
{
	var container = this.graph.container;
	this.canvas = document.createElementNS(bpmConstants.NS_SVG, 'g');
	
	this.backgroundPane = document.createElementNS(bpmConstants.NS_SVG, 'g');
	this.canvas.appendChild(this.backgroundPane);

	this.drawPane = document.createElementNS(bpmConstants.NS_SVG, 'g');
	this.canvas.appendChild(this.drawPane);

	this.overlayPane = document.createElementNS(bpmConstants.NS_SVG, 'g');
	this.canvas.appendChild(this.overlayPane);
	
	this.decoratorPane = document.createElementNS(bpmConstants.NS_SVG, 'g');
	this.canvas.appendChild(this.decoratorPane);
	
	var root = document.createElementNS(bpmConstants.NS_SVG, 'svg');
	root.style.left = '0px';
	root.style.top = '0px';
	root.style.width = '100%';
	root.style.height = '100%';
	
	root.style.display = 'block';
	root.appendChild(this.canvas);
	
	if (bpmCore.IS_IE || bpmCore.IS_IE11)
	{
		root.style.overflow = 'hidden';
	}

	if (container != null)
	{
		container.appendChild(root);
		this.updateContainerStyle(container);
	}
};

bpmGraphView.prototype.updateContainerStyle = function(container)
{
	var style = bpmUtils.getCurrentStyle(container);
	
	if (style != null && style.position == 'static')
	{
		container.style.position = 'relative';
	}
	
	if (bpmCore.IS_POINTER)
	{
		container.style.touchAction = 'none';
	}
};

bpmGraphView.prototype.destroy = function()
{
	var root = (this.canvas != null) ? this.canvas.ownerSVGElement : null;
	
	if (root == null)
	{
		root = this.canvas;
	}
	
	if (root != null && root.parentNode != null)
	{
		this.clear(this.currentRoot, true);
		bpmEvent.removeGestureListeners(document, null, this.moveHandler, this.endHandler);
		bpmEvent.release(this.graph.container);
		root.parentNode.removeChild(root);
		
		this.moveHandler = null;
		this.endHandler = null;
		this.canvas = null;
		this.backgroundPane = null;
		this.drawPane = null;
		this.overlayPane = null;
		this.decoratorPane = null;
	}
};

function bpmCurrentRootChange(view, root)
{
	this.view = view;
	this.root = root;
	this.previous = root;
	this.isUp = root == null;
	
	if (!this.isUp)
	{
		var tmp = this.view.currentRoot;
		var model = this.view.graph.getModel();
		
		while (tmp != null)
		{
			if (tmp == root)
			{
				this.isUp = true;
				break;
			}
			
			tmp = model.getParent(tmp);
		}
	}
};

bpmCurrentRootChange.prototype.execute = function()
{
	var tmp = this.view.currentRoot;
	this.view.currentRoot = this.previous;
	this.previous = tmp;

	var translate = this.view.graph.getTranslateForRoot(this.view.currentRoot);
	
	if (translate != null)
	{
		this.view.translate = new bpmPoint(-translate.x, -translate.y);
	}

	if (this.isUp)
	{
		this.view.clear(this.view.currentRoot, true);
		this.view.validate();
	}
	else
	{
		this.view.refresh();
	}
	
	var name = (this.isUp) ? bpmEvent.UP : bpmEvent.DOWN;
	this.view.fireEvent(new bpmEventObject(name,
		'root', this.view.currentRoot, 'previous', this.previous));
	this.isUp = !this.isUp;
};



/* Draw */
function bpmGraph(container, model, renderHint, stylesheet)
{
	this.mouseListeners = null;
	
	this.renderHint = renderHint;

	if (bpmCore.IS_SVG)
	{
		this.dialect = bpmConstants.DIALECT_SVG;
	}
	else if (renderHint == bpmConstants.RENDERING_HINT_EXACT && bpmCore.IS_VML)
	{
		this.dialect = bpmConstants.DIALECT_VML;
	}
	else if (renderHint == bpmConstants.RENDERING_HINT_FASTEST)
	{
		this.dialect = bpmConstants.DIALECT_STRICTHTML;
	}
	else if (renderHint == bpmConstants.RENDERING_HINT_FASTER)
	{
		this.dialect = bpmConstants.DIALECT_PREFERHTML;
	}
	else
	{
		this.dialect = bpmConstants.DIALECT_MIXEDHTML;
	}
	
	// Initializes the main members that do not require a container
	this.model = (model != null) ? model : new bpmGraphModel();
	this.multiplicities = [];
	this.imageBundles = [];
	this.cellRenderer = this.createCellRenderer();
	this.setSelectionModel(this.createSelectionModel());
	this.setStylesheet((stylesheet != null) ? stylesheet : this.createStylesheet());
	this.view = this.createGraphView();
	
	// Adds a graph model listener to update the view
	this.graphModelChangeListener = bpmUtils.bind(this, function(sender, evt)
	{
		this.graphModelChanged(evt.getProperty('edit').changes);
	});
	
	this.model.addListener(bpmEvent.CHANGE, this.graphModelChangeListener);

	// Installs basic event handlers with disabled default settings.
	this.createHandlers();
	
	// Initializes the display if a container was specified
	if (container != null)
	{
		this.init(container);
	}
	
	this.view.revalidate();
};

if (bpmLoadResources)
{
	bpmResources.add(bpmCore.basePath + '/resources/graph');
}
else
{
	bpmCore.defaultBundles.push(bpmCore.basePath + '/resources/graph');
}

bpmGraph.prototype = new bpmEventSource();
bpmGraph.prototype.constructor = bpmGraph;
bpmGraph.prototype.mouseListeners = null;
bpmGraph.prototype.isMouseDown = false;
bpmGraph.prototype.model = null;
bpmGraph.prototype.view = null;
bpmGraph.prototype.stylesheet = null;
bpmGraph.prototype.selectionModel = null;
bpmGraph.prototype.cellEditor = null;
bpmGraph.prototype.cellRenderer = null;
bpmGraph.prototype.multiplicities = null;
bpmGraph.prototype.renderHint = null;
bpmGraph.prototype.dialect = null;
bpmGraph.prototype.gridSize = 10;
bpmGraph.prototype.gridEnabled = true;
bpmGraph.prototype.portsEnabled = true;
bpmGraph.prototype.nativeDblClickEnabled = true;
bpmGraph.prototype.doubleTapEnabled = true;
bpmGraph.prototype.doubleTapTimeout = 500;
bpmGraph.prototype.doubleTapTolerance = 25;
bpmGraph.prototype.lastTouchY = 0;
bpmGraph.prototype.lastTouchY = 0;
bpmGraph.prototype.lastTouchTime = 0;
bpmGraph.prototype.tapAndHoldEnabled = true;
bpmGraph.prototype.tapAndHoldDelay = 500;
bpmGraph.prototype.tapAndHoldInProgress = false;
bpmGraph.prototype.tapAndHoldValid = false;
bpmGraph.prototype.initialTouchX = 0;
bpmGraph.prototype.initialTouchY = 0;
bpmGraph.prototype.tolerance = 4;
bpmGraph.prototype.defaultOverlap = 0.5;
bpmGraph.prototype.defaultParent = null;
bpmGraph.prototype.alternateEdgeStyle = null;
bpmGraph.prototype.backgroundImage = null;
bpmGraph.prototype.pageVisible = false;
bpmGraph.prototype.pageBreaksVisible = false;
bpmGraph.prototype.pageBreakColor = 'gray';
bpmGraph.prototype.pageBreakDashed = true;
bpmGraph.prototype.minPageBreakDist = 20;
bpmGraph.prototype.preferPageSize = false;
bpmGraph.prototype.pageFormat = bpmConstants.PAGE_FORMAT_A4_PORTRAIT;
bpmGraph.prototype.pageScale = 1.5;
bpmGraph.prototype.enabled = true;
bpmGraph.prototype.escapeEnabled = true;
bpmGraph.prototype.invokesStopCellEditing = true;
bpmGraph.prototype.enterStopsCellEditing = false;
bpmGraph.prototype.useScrollbarsForPanning = true;
bpmGraph.prototype.exportEnabled = true;
bpmGraph.prototype.importEnabled = true;
bpmGraph.prototype.cellsLocked = false;
bpmGraph.prototype.cellsCloneable = true;
bpmGraph.prototype.foldingEnabled = true;
bpmGraph.prototype.cellsEditable = true;
bpmGraph.prototype.cellsDeletable = true;
bpmGraph.prototype.cellsMovable = true;
bpmGraph.prototype.edgeLabelsMovable = true;
bpmGraph.prototype.vertexLabelsMovable = false;
bpmGraph.prototype.dropEnabled = false;
bpmGraph.prototype.splitEnabled = true;
bpmGraph.prototype.cellsResizable = true;
bpmGraph.prototype.cellsBendable = true;
bpmGraph.prototype.cellsSelectable = true;
bpmGraph.prototype.cellsDisconnectable = true;
bpmGraph.prototype.autoSizeCells = false;
bpmGraph.prototype.autoSizeCellsOnAdd = false;
bpmGraph.prototype.autoScroll = true;
bpmGraph.prototype.ignoreScrollbars = false;
bpmGraph.prototype.translateToScrollPosition = false;
bpmGraph.prototype.timerAutoScroll = false;
bpmGraph.prototype.allowAutoPanning = false;
bpmGraph.prototype.autoExtend = true;
bpmGraph.prototype.maximumGraphBounds = null;
bpmGraph.prototype.minimumGraphSize = null;
bpmGraph.prototype.minimumContainerSize = null;
bpmGraph.prototype.maximumContainerSize = null;
bpmGraph.prototype.resizeContainer = false;
bpmGraph.prototype.border = 0;
bpmGraph.prototype.keepEdgesInForeground = false;
bpmGraph.prototype.keepEdgesInBackground = false;
bpmGraph.prototype.allowNegativeCoordinates = true;
bpmGraph.prototype.constrainChildren = true;
bpmGraph.prototype.constrainRelativeChildren = false;
bpmGraph.prototype.extendParents = true;
bpmGraph.prototype.extendParentsOnAdd = true;
bpmGraph.prototype.extendParentsOnMove = false;
bpmGraph.prototype.recursiveResize = false;
bpmGraph.prototype.collapseToPreferredSize = true;
bpmGraph.prototype.zoomFactor = 1.2;
bpmGraph.prototype.keepSelectionVisibleOnZoom = false;
bpmGraph.prototype.centerZoom = true;
bpmGraph.prototype.resetViewOnRootChange = true;
bpmGraph.prototype.resetEdgesOnResize = false;
bpmGraph.prototype.resetEdgesOnMove = false;
bpmGraph.prototype.resetEdgesOnConnect = true;
bpmGraph.prototype.allowLoops = false;
bpmGraph.prototype.defaultLoopStyle = bpmEdgeStyle.Loop;
bpmGraph.prototype.multigraph = true;
bpmGraph.prototype.connectableEdges = false;
bpmGraph.prototype.allowDanglingEdges = true;
bpmGraph.prototype.cloneInvalidEdges = false;
bpmGraph.prototype.disconnectOnMove = true;
bpmGraph.prototype.labelsVisible = true;
bpmGraph.prototype.htmlLabels = false;
bpmGraph.prototype.swimlaneSelectionEnabled = true;
bpmGraph.prototype.swimlaneNesting = true;
bpmGraph.prototype.swimlaneIndicatorColorAttribute = bpmConstants.STYLE_FILLCOLOR;
bpmGraph.prototype.imageBundles = null;
bpmGraph.prototype.minFitScale = 0.1;
bpmGraph.prototype.maxFitScale = 8;
bpmGraph.prototype.panDx = 0;
bpmGraph.prototype.panDy = 0;
bpmGraph.prototype.collapsedImage = new bpmImage(bpmCore.imageBasePath + '/collapsed.gif', 9, 9);
bpmGraph.prototype.expandedImage = new bpmImage(bpmCore.imageBasePath + '/expanded.gif', 9, 9);
bpmGraph.prototype.warningImage = new bpmImage(bpmCore.imageBasePath + '/warning'+
	((bpmCore.IS_MAC) ? '.png' : '.gif'), 16, 16);
bpmGraph.prototype.alreadyConnectedResource = (bpmCore.language != 'none') ? 'alreadyConnected' : '';
bpmGraph.prototype.containsValidationErrorsResource = (bpmCore.language != 'none') ? 'containsValidationErrors' : '';
bpmGraph.prototype.collapseExpandResource = (bpmCore.language != 'none') ? 'collapse-expand' : '';

bpmGraph.prototype.init = function(container)
{
	this.container = container;
	
	// Initializes the in-place editor
	this.cellEditor = this.createCellEditor();	

	// Initializes the container using the view
	this.view.init();
	
	// Updates the size of the container for the current graph
	this.sizeDidChange();
	
	// Hides tooltips and resets tooltip timer if mouse leaves container
	bpmEvent.addListener(container, 'mouseleave', bpmUtils.bind(this, function()
	{
		if (this.tooltipHandler != null)
		{
			this.tooltipHandler.hide();
		}
	}));

	// Automatic deallocation of memory
	if (bpmCore.IS_IE)
	{
		bpmEvent.addListener(window, 'unload', bpmUtils.bind(this, function()
		{
			this.destroy();
		}));
		
		// Disable shift-click for text
		bpmEvent.addListener(container, 'selectstart',
			bpmUtils.bind(this, function(evt)
			{
				return this.isEditing() || (!this.isMouseDown && !bpmEvent.isShiftDown(evt));
			})
		);
	}
	
	if (document.documentMode == 8)
	{
		container.insertAdjacentHTML('beforeend', '<' + bpmCore.VML_PREFIX + ':group' +
			' style="DISPLAY: none;"></' + bpmCore.VML_PREFIX + ':group>');
	}
};

bpmGraph.prototype.createHandlers = function()
{
	this.tooltipHandler = this.createTooltipHandler();
	this.tooltipHandler.setEnabled(false);
	this.selectionCellsHandler = this.createSelectionCellsHandler();
	this.connectionHandler = this.createConnectionHandler();
	this.connectionHandler.setEnabled(false);
	this.graphHandler = this.createGraphHandler();
	this.panningHandler = this.createPanningHandler();
	this.panningHandler.panningEnabled = false;
	this.popupMenuHandler = this.createPopupMenuHandler();
};

bpmGraph.prototype.createTooltipHandler = function()
{
	return new bpmTooltipHandler(this);
};

bpmGraph.prototype.createSelectionCellsHandler = function()
{
	return new bpmSelectionCellsHandler(this);
};

bpmGraph.prototype.createConnectionHandler = function()
{
	return new bpmConnectionHandler(this);
};

bpmGraph.prototype.createGraphHandler = function()
{
	return new bpmGraphHandler(this);
};

bpmGraph.prototype.createPanningHandler = function()
{
	return new bpmPanningHandler(this);
};

bpmGraph.prototype.createPopupMenuHandler = function()
{
	return new bpmPopupMenuHandler(this);
};

bpmGraph.prototype.createSelectionModel = function()
{
	return new bpmGraphSelectionModel(this);
};

bpmGraph.prototype.createStylesheet = function()
{
	return new bpmStylesheet();
};

bpmGraph.prototype.createGraphView = function()
{
	return new bpmGraphView(this);
};
 
bpmGraph.prototype.createCellRenderer = function()
{
	return new bpmCellRenderer();
};

bpmGraph.prototype.createCellEditor = function()
{
	return new bpmCellEditor(this);
};

bpmGraph.prototype.getModel = function()
{
	return this.model;
};

bpmGraph.prototype.getView = function()
{
	return this.view;
};

bpmGraph.prototype.getStylesheet = function()
{
	return this.stylesheet;
};

bpmGraph.prototype.setStylesheet = function(stylesheet)
{
	this.stylesheet = stylesheet;
};

bpmGraph.prototype.getSelectionModel = function()
{
	return this.selectionModel;
};

bpmGraph.prototype.setSelectionModel = function(selectionModel)
{
	this.selectionModel = selectionModel;
};

bpmGraph.prototype.getSelectionCellsForChanges = function(changes)
{
	var dict = new bpmDictionary();
	var cells = [];
	
	var addCell = bpmUtils.bind(this, function(cell)
	{
		if (!dict.get(cell) && this.model.contains(cell))
		{
			if (this.model.isEdge(cell) || this.model.isVertex(cell))
			{
				dict.put(cell, true);
				cells.push(cell);
			}
			else
			{
				var childCount = this.model.getChildCount(cell);
				
				for (var i = 0; i < childCount; i++)
				{
					addCell(this.model.getChildAt(cell, i));
				}
			}
		}
	});

	for (var i = 0; i < changes.length; i++)
	{
		var change = changes[i];
		
		if (change.constructor != bpmRootChange)
		{
			var cell = null;

			if (change instanceof bpmChildChange)
			{
				cell = change.child;
			}
			else if (change.cell != null && change.cell instanceof bpmCell)
			{
				cell = change.cell;
			}
			
			if (cell != null)
			{
				addCell(cell);
			}
		}
	}
	
	return cells;
};

bpmGraph.prototype.graphModelChanged = function(changes)
{
	for (var i = 0; i < changes.length; i++)
	{
		this.processChange(changes[i]);
	}

	this.updateSelection();
	this.view.validate();
	this.sizeDidChange();
};

bpmGraph.prototype.updateSelection = function()
{
	var cells = this.getSelectionCells();
	var removed = [];
	
	for (var i = 0; i < cells.length; i++)
	{
		if (!this.model.contains(cells[i]) || !this.isCellVisible(cells[i]))
		{
			removed.push(cells[i]);
		}
		else
		{
			var par = this.model.getParent(cells[i]);
			
			while (par != null && par != this.view.currentRoot)
			{
				if (this.isCellCollapsed(par) || !this.isCellVisible(par))
				{
					removed.push(cells[i]);
					break;
				}
				
				par = this.model.getParent(par);
			}
		}
	}
	
	this.removeSelectionCells(removed);
};

bpmGraph.prototype.processChange = function(change)
{
	if (change instanceof bpmRootChange)
	{
		this.clearSelection();
		this.setDefaultParent(null);
		this.removeStateForCell(change.previous);
		
		if (this.resetViewOnRootChange)
		{
			this.view.scale = 1;
			this.view.translate.x = 0;
			this.view.translate.y = 0;
		}

		this.fireEvent(new bpmEventObject(bpmEvent.ROOT));
	}
	
	else if (change instanceof bpmChildChange)
	{
		var newParent = this.model.getParent(change.child);
		this.view.invalidate(change.child, true, true);
		
		if (!this.model.contains(newParent) || this.isCellCollapsed(newParent))
		{
			this.view.invalidate(change.child, true, true);
			this.removeStateForCell(change.child);
			
			// Handles special case of current root of view being removed
			if (this.view.currentRoot == change.child)
			{
				this.home();
			}
		}
 
		if (newParent != change.previous)
		{
			// Refreshes the collapse/expand icons on the parents
			if (newParent != null)
			{
				this.view.invalidate(newParent, false, false);
			}
			
			if (change.previous != null)
			{
				this.view.invalidate(change.previous, false, false);
			}
		}
	}

	else if (change instanceof bpmTerminalChange || change instanceof bpmGeometryChange)
	{
		if (change instanceof bpmTerminalChange || ((change.previous == null && change.geometry != null) ||
			(change.previous != null && !change.previous.equals(change.geometry))))
		{
			this.view.invalidate(change.cell);
		}
	}

	else if (change instanceof bpmValueChange)
	{
		this.view.invalidate(change.cell, false, false);
	}
	
	else if (change instanceof bpmStyleChange)
	{
		this.view.invalidate(change.cell, true, true);
		var state = this.view.getState(change.cell);
		
		if (state != null)
		{
			state.invalidStyle = true;
		}
	}
	
	else if (change.cell != null && change.cell instanceof bpmCell)
	{
		this.removeStateForCell(change.cell);
	}
};

bpmGraph.prototype.removeStateForCell = function(cell)
{
	var childCount = this.model.getChildCount(cell);
	
	for (var i = 0; i < childCount; i++)
	{
		this.removeStateForCell(this.model.getChildAt(cell, i));
	}

	this.view.invalidate(cell, false, true);
	this.view.removeState(cell);
};

bpmGraph.prototype.addCellOverlay = function(cell, overlay)
{
	if (cell.overlays == null)
	{
		cell.overlays = [];
	}
	
	cell.overlays.push(overlay);

	var state = this.view.getState(cell);

	if (state != null)
	{
		this.cellRenderer.redraw(state);
	}
	
	this.fireEvent(new bpmEventObject(bpmEvent.ADD_OVERLAY,
			'cell', cell, 'overlay', overlay));
	
	return overlay;
};

bpmGraph.prototype.getCellOverlays = function(cell)
{
	return cell.overlays;
};

bpmGraph.prototype.removeCellOverlay = function(cell, overlay)
{
	if (overlay == null)
	{
		this.removeCellOverlays(cell);
	}
	else
	{
		var index = bpmUtils.indexOf(cell.overlays, overlay);
		
		if (index >= 0)
		{
			cell.overlays.splice(index, 1);
			
			if (cell.overlays.length == 0)
			{
				cell.overlays = null;
			}
			
			var state = this.view.getState(cell);
			
			if (state != null)
			{
				this.cellRenderer.redraw(state);
			}
			
			this.fireEvent(new bpmEventObject(bpmEvent.REMOVE_OVERLAY,
					'cell', cell, 'overlay', overlay));	
		}
		else
		{
			overlay = null;
		}
	}
	
	return overlay;
};

bpmGraph.prototype.removeCellOverlays = function(cell)
{
	var overlays = cell.overlays;
	
	if (overlays != null)
	{
		cell.overlays = null;
		
		var state = this.view.getState(cell);
		
		if (state != null)
		{
			this.cellRenderer.redraw(state);
		}
		
		for (var i = 0; i < overlays.length; i++)
		{
			this.fireEvent(new bpmEventObject(bpmEvent.REMOVE_OVERLAY,
					'cell', cell, 'overlay', overlays[i]));
		}
	}
	
	return overlays;
};

bpmGraph.prototype.clearCellOverlays = function(cell)
{
	cell = (cell != null) ? cell : this.model.getRoot();
	this.removeCellOverlays(cell);
	
	// Recursively removes all overlays from the children
	var childCount = this.model.getChildCount(cell);
	
	for (var i = 0; i < childCount; i++)
	{
		var child = this.model.getChildAt(cell, i);
		this.clearCellOverlays(child); // recurse
	}
};

bpmGraph.prototype.setCellWarning = function(cell, warning, img, isSelect)
{
	if (warning != null && warning.length > 0)
	{
		img = (img != null) ? img : this.warningImage;
		
		var overlay = new bpmCellOverlay(img,
			'<font color=red>'+warning+'</font>');
		
		if (isSelect)
		{
			overlay.addListener(bpmEvent.CLICK,
				bpmUtils.bind(this, function(sender, evt)
				{
					if (this.isEnabled())
					{
						this.setSelectionCell(cell);
					}
				})
			);
		}
		
		return this.addCellOverlay(cell, overlay);
	}
	else
	{
		this.removeCellOverlays(cell);
	}
	
	return null;
};

bpmGraph.prototype.startEditing = function(evt)
{
	this.startEditingAtCell(null, evt);
};

bpmGraph.prototype.startEditingAtCell = function(cell, evt)
{
	if (evt == null || !bpmEvent.isMultiTouchEvent(evt))
	{
		if (cell == null)
		{
			cell = this.getSelectionCell();
			
			if (cell != null && !this.isCellEditable(cell))
			{
				cell = null;
			}
		}
	
		if (cell != null)
		{
			this.fireEvent(new bpmEventObject(bpmEvent.START_EDITING,
					'cell', cell, 'event', evt));
			this.cellEditor.startEditing(cell, evt);
			this.fireEvent(new bpmEventObject(bpmEvent.EDITING_STARTED,
					'cell', cell, 'event', evt));
		}
	}
};

bpmGraph.prototype.getEditingValue = function(cell, evt)
{
	return this.convertValueToString(cell);
};

bpmGraph.prototype.stopEditing = function(cancel)
{
	this.cellEditor.stopEditing(cancel);
	this.fireEvent(new bpmEventObject(bpmEvent.EDITING_STOPPED, 'cancel', cancel));
};

bpmGraph.prototype.labelChanged = function(cell, value, evt)
{
	this.model.beginUpdate();
	try
	{
		var old = cell.value;
		this.cellLabelChanged(cell, value, this.isAutoSizeCell(cell));
		this.fireEvent(new bpmEventObject(bpmEvent.LABEL_CHANGED,
			'cell', cell, 'value', value, 'old', old, 'event', evt));
	}
	finally
	{
		this.model.endUpdate();
	}
	
	return cell;
};

bpmGraph.prototype.cellLabelChanged = function(cell, value, autoSize)
{
	this.model.beginUpdate();
	try
	{
		this.model.setValue(cell, value);
		
		if (autoSize)
		{
			this.cellSizeUpdated(cell, false);
		}
	}
	finally
	{
		this.model.endUpdate();
	}
};

bpmGraph.prototype.escape = function(evt)
{
	this.fireEvent(new bpmEventObject(bpmEvent.ESCAPE, 'event', evt));
};

bpmGraph.prototype.click = function(me)
{
	var evt = me.getEvent();
	var cell = me.getCell();
	var bpme = new bpmEventObject(bpmEvent.CLICK, 'event', evt, 'cell', cell);
	
	if (me.isConsumed())
	{
		bpme.consume();
	}
	
	this.fireEvent(bpme);
	
	if (this.isEnabled() && !bpmEvent.isConsumed(evt) && !bpme.isConsumed())
	{
		if (cell != null)
		{
			if (this.isTransparentClickEvent(evt))
			{
				var active = false;
				
				var tmp = this.getCellAt(me.graphX, me.graphY, null, null, null, bpmUtils.bind(this, function(state)
				{
					var selected = this.isCellSelected(state.cell);
					active = active || selected;
					
					return !active || selected;
				}));
				
				if (tmp != null)
				{
					cell = tmp;
				}
			}
			
			this.selectCellForEvent(cell, evt);
		}
		else
		{
			var swimlane = null;
			
			if (this.isSwimlaneSelectionEnabled())
			{
				swimlane = this.getSwimlaneAt(me.getGraphX(), me.getGraphY());
			}

			if (swimlane != null)
			{
				this.selectCellForEvent(swimlane, evt);
			}
			
			else if (!this.isToggleEvent(evt))
			{
				this.clearSelection();
			}
		}
	}
};

bpmGraph.prototype.dblClick = function(evt, cell)
{
	var bpme = new bpmEventObject(bpmEvent.DOUBLE_CLICK, 'event', evt, 'cell', cell);
	this.fireEvent(bpme);
	
	// Handles the event if it has not been consumed
	if (this.isEnabled() && !bpmEvent.isConsumed(evt) && !bpme.isConsumed() &&
		cell != null && this.isCellEditable(cell) && !this.isEditing(cell))
	{
		// this.startEditingAtCell(cell, evt);
		bpmEvent.consume(evt);
	}

};

bpmGraph.prototype.tapAndHold = function(me)
{
	var evt = me.getEvent();
	var bpme = new bpmEventObject(bpmEvent.TAP_AND_HOLD, 'event', evt, 'cell', me.getCell());

	this.fireEvent(bpme);

	if (bpme.isConsumed())
	{
		this.panningHandler.panningTrigger = false;
	}
	
	if (this.isEnabled() && !bpmEvent.isConsumed(evt) && !bpme.isConsumed() && this.connectionHandler.isEnabled())
	{
		var state = this.view.getState(this.connectionHandler.marker.getCell(me));

		if (state != null)
		{
			this.connectionHandler.marker.currentColor = this.connectionHandler.marker.validColor;
			this.connectionHandler.marker.markedState = state;
			this.connectionHandler.marker.mark();
			
			this.connectionHandler.first = new bpmPoint(me.getGraphX(), me.getGraphY());
			this.connectionHandler.edgeState = this.connectionHandler.createEdgeState(me);
			this.connectionHandler.previous = state;
			this.connectionHandler.fireEvent(new bpmEventObject(bpmEvent.START, 'state', this.connectionHandler.previous));
		}
	}
};

bpmGraph.prototype.scrollPointToVisible = function(x, y, extend, border)
{
	if (!this.timerAutoScroll && (this.ignoreScrollbars || bpmUtils.hasScrollbars(this.container)))
	{
		var c = this.container;
		border = (border != null) ? border : 20;
		
		if (x >= c.scrollLeft && y >= c.scrollTop && x <= c.scrollLeft + c.clientWidth &&
			y <= c.scrollTop + c.clientHeight)
		{
			var dx = c.scrollLeft + c.clientWidth - x;
			
			if (dx < border)
			{
				var old = c.scrollLeft;
				c.scrollLeft += border - dx;

				if (extend && old == c.scrollLeft)
				{
					if (this.dialect == bpmConstants.DIALECT_SVG)
					{
						var root = this.view.getDrawPane().ownerSVGElement;
						var width = this.container.scrollWidth + border - dx;
						
						root.style.width = width + 'px';
					}
					else
					{
						var width = Math.max(c.clientWidth, c.scrollWidth) + border - dx;
						var canvas = this.view.getCanvas();
						canvas.style.width = width + 'px';
					}
					
					c.scrollLeft += border - dx;
				}
			}
			else
			{
				dx = x - c.scrollLeft;
				
				if (dx < border)
				{
					c.scrollLeft -= border - dx;
				}
			}
			
			var dy = c.scrollTop + c.clientHeight - y;
			
			if (dy < border)
			{
				var old = c.scrollTop;
				c.scrollTop += border - dy;

				if (old == c.scrollTop && extend)
				{
					if (this.dialect == bpmConstants.DIALECT_SVG)
					{
						var root = this.view.getDrawPane().ownerSVGElement;
						var height = this.container.scrollHeight + border - dy;
						
						root.style.height = height + 'px';
					}
					else
					{
						var height = Math.max(c.clientHeight, c.scrollHeight) + border - dy;
						var canvas = this.view.getCanvas();
						canvas.style.height = height + 'px';
					}
					
					c.scrollTop += border - dy;
				}
			}
			else
			{
				dy = y - c.scrollTop;
				
				if (dy < border)
				{
					c.scrollTop -= border - dy;
				}
			}
		}
	}
	else if (this.allowAutoPanning && !this.panningHandler.isActive())
	{
		if (this.panningManager == null)
		{
			this.panningManager = this.createPanningManager();
		}

		this.panningManager.panTo(x + this.panDx, y + this.panDy);
	}
};

bpmGraph.prototype.createPanningManager = function()
{
	return new bpmPanningManager(this);
};

bpmGraph.prototype.getBorderSizes = function()
{
	var css = bpmUtils.getCurrentStyle(this.container);
	
	return new bpmRectangle(bpmUtils.parseCssNumber(css.paddingLeft) +
			((css.borderLeftStyle != 'none') ? bpmUtils.parseCssNumber(css.borderLeftWidth) : 0),
		bpmUtils.parseCssNumber(css.paddingTop) +
			((css.borderTopStyle != 'none') ? bpmUtils.parseCssNumber(css.borderTopWidth) : 0),
		bpmUtils.parseCssNumber(css.paddingRight) +
			((css.borderRightStyle != 'none') ? bpmUtils.parseCssNumber(css.borderRightWidth) : 0),
		bpmUtils.parseCssNumber(css.paddingBottom) +
			((css.borderBottomStyle != 'none') ? bpmUtils.parseCssNumber(css.borderBottomWidth) : 0));
};

bpmGraph.prototype.getPreferredPageSize = function(bounds, width, height)
{
	var scale = this.view.scale;
	var tr = this.view.translate;
	var fmt = this.pageFormat;
	var ps = this.pageScale;
	var page = new bpmRectangle(0, 0, Math.ceil(fmt.width * ps), Math.ceil(fmt.height * ps));
	
	var hCount = (this.pageBreaksVisible) ? Math.ceil(width / page.width) : 1;
	var vCount = (this.pageBreaksVisible) ? Math.ceil(height / page.height) : 1;
	
	return new bpmRectangle(0, 0, hCount * page.width + 2 + tr.x, vCount * page.height + 2 + tr.y);
};

bpmGraph.prototype.fit = function(border, keepOrigin, margin, enabled, ignoreWidth, ignoreHeight, maxHeight)
{
	if (this.container != null)
	{
		border = (border != null) ? border : this.getBorder();
		keepOrigin = (keepOrigin != null) ? keepOrigin : false;
		margin = (margin != null) ? margin : 0;
		enabled = (enabled != null) ? enabled : true;
		ignoreWidth = (ignoreWidth != null) ? ignoreWidth : false;
		ignoreHeight = (ignoreHeight != null) ? ignoreHeight : false;
		
		var cssBorder = this.getBorderSizes();
		var w1 = this.container.offsetWidth - cssBorder.x - cssBorder.width - 1;
		var h1 = (maxHeight != null) ? maxHeight : this.container.offsetHeight - cssBorder.y - cssBorder.height - 1;
		var bounds = this.view.getGraphBounds();
		
		if (bounds.width > 0 && bounds.height > 0)
		{
			if (keepOrigin && bounds.x != null && bounds.y != null)
			{
				bounds = bounds.clone();
				bounds.width += bounds.x;
				bounds.height += bounds.y;
				bounds.x = 0;
				bounds.y = 0;
			}
			
			var s = this.view.scale;
			var w2 = bounds.width / s;
			var h2 = bounds.height / s;
			
			if (this.backgroundImage != null)
			{
				w2 = Math.max(w2, this.backgroundImage.width - bounds.x / s);
				h2 = Math.max(h2, this.backgroundImage.height - bounds.y / s);
			}
			
			var b = ((keepOrigin) ? border : 2 * border) + margin + 1;

			w1 -= b;
			h1 -= b;
			
			var s2 = (((ignoreWidth) ? h1 / h2 : (ignoreHeight) ? w1 / w2 :
				Math.min(w1 / w2, h1 / h2)));
			
			if (this.minFitScale != null)
			{
				s2 = Math.max(s2, this.minFitScale);
			}
			
			if (this.maxFitScale != null)
			{
				s2 = Math.min(s2, this.maxFitScale);
			}
	
			if (enabled)
			{
				if (!keepOrigin)
				{
					if (!bpmUtils.hasScrollbars(this.container))
					{
						var x0 = (bounds.x != null) ? Math.floor(this.view.translate.x - bounds.x / s + border / s2 + margin / 2) : border;
						var y0 = (bounds.y != null) ? Math.floor(this.view.translate.y - bounds.y / s + border / s2 + margin / 2) : border;

						this.view.scaleAndTranslate(s2, x0, y0);
					}
					else
					{
						this.view.setScale(s2);
						var b2 = this.getGraphBounds();
						
						if (b2.x != null)
						{
							this.container.scrollLeft = b2.x;
						}
						
						if (b2.y != null)
						{
							this.container.scrollTop = b2.y;
						}
					}
				}
				else if (this.view.scale != s2)
				{
					this.view.setScale(s2);
				}
			}
			else
			{
				return s2;
			}
		}
	}

	return this.view.scale;
};

bpmGraph.prototype.sizeDidChange = function()
{
	var bounds = this.getGraphBounds();
	
	if (this.container != null)
	{
		var border = this.getBorder();
		
		var width = Math.max(0, bounds.x + bounds.width + 2 * border * this.view.scale);
		var height = Math.max(0, bounds.y + bounds.height + 2 * border * this.view.scale);
		
		if (this.minimumContainerSize != null)
		{
			width = Math.max(width, this.minimumContainerSize.width);
			height = Math.max(height, this.minimumContainerSize.height);
		}

		if (this.resizeContainer)
		{
			this.doResizeContainer(width, height);
		}

		if (this.preferPageSize || (!bpmCore.IS_IE && this.pageVisible))
		{
			var size = this.getPreferredPageSize(bounds, Math.max(1, width), Math.max(1, height));
			
			if (size != null)
			{
				width = size.width * this.view.scale;
				height = size.height * this.view.scale;
			}
		}
		
		if (this.minimumGraphSize != null)
		{
			width = Math.max(width, this.minimumGraphSize.width * this.view.scale);
			height = Math.max(height, this.minimumGraphSize.height * this.view.scale);
		}

		width = Math.ceil(width);
		height = Math.ceil(height);

		if (this.dialect == bpmConstants.DIALECT_SVG)
		{
			var root = this.view.getDrawPane().ownerSVGElement;
			
			if (root != null)
			{
				root.style.minWidth = Math.max(1, width) + 'px';
				root.style.minHeight = Math.max(1, height) + 'px';
				root.style.width = '100%';
				root.style.height = '100%';
			}
		}
		else
		{
			if (bpmCore.IS_QUIRKS)
			{
				this.view.updateHtmlCanvasSize(Math.max(1, width), Math.max(1, height));
			}
			else
			{
				this.view.canvas.style.minWidth = Math.max(1, width) + 'px';
				this.view.canvas.style.minHeight = Math.max(1, height) + 'px';
			}
		}
		
		this.updatePageBreaks(this.pageBreaksVisible, width, height);
	}

	this.fireEvent(new bpmEventObject(bpmEvent.SIZE, 'bounds', bounds));
};

bpmGraph.prototype.doResizeContainer = function(width, height)
{
	if (this.maximumContainerSize != null)
	{
		width = Math.min(this.maximumContainerSize.width, width);
		height = Math.min(this.maximumContainerSize.height, height);
	}

	this.container.style.width = Math.ceil(width) + 'px';
	this.container.style.height = Math.ceil(height) + 'px';
};

bpmGraph.prototype.updatePageBreaks = function(visible, width, height)
{
	var scale = this.view.scale;
	var tr = this.view.translate;
	var fmt = this.pageFormat;
	var ps = scale * this.pageScale;
	var bounds = new bpmRectangle(0, 0, fmt.width * ps, fmt.height * ps);

	var gb = bpmRectangle.fromRectangle(this.getGraphBounds());
	gb.width = Math.max(1, gb.width);
	gb.height = Math.max(1, gb.height);
	
	bounds.x = Math.floor((gb.x - tr.x * scale) / bounds.width) * bounds.width + tr.x * scale;
	bounds.y = Math.floor((gb.y - tr.y * scale) / bounds.height) * bounds.height + tr.y * scale;
	
	gb.width = Math.ceil((gb.width + (gb.x - bounds.x)) / bounds.width) * bounds.width;
	gb.height = Math.ceil((gb.height + (gb.y - bounds.y)) / bounds.height) * bounds.height;
	
	visible = visible && Math.min(bounds.width, bounds.height) > this.minPageBreakDist;

	var horizontalCount = (visible) ? Math.ceil(gb.height / bounds.height) + 1 : 0;
	var verticalCount = (visible) ? Math.ceil(gb.width / bounds.width) + 1 : 0;
	var right = (verticalCount - 1) * bounds.width;
	var bottom = (horizontalCount - 1) * bounds.height;
	
	if (this.horizontalPageBreaks == null && horizontalCount > 0)
	{
		this.horizontalPageBreaks = [];
	}

	if (this.verticalPageBreaks == null && verticalCount > 0)
	{
		this.verticalPageBreaks = [];
	}
	
	var drawPageBreaks = bpmUtils.bind(this, function(breaks)
	{
		if (breaks != null)
		{
			var count = (breaks == this.horizontalPageBreaks) ? horizontalCount : verticalCount; 
			
			for (var i = 0; i <= count; i++)
			{
				var pts = (breaks == this.horizontalPageBreaks) ?
					[new bpmPoint(Math.round(bounds.x), Math.round(bounds.y + i * bounds.height)),
			         new bpmPoint(Math.round(bounds.x + right), Math.round(bounds.y + i * bounds.height))] :
			        [new bpmPoint(Math.round(bounds.x + i * bounds.width), Math.round(bounds.y)),
			         new bpmPoint(Math.round(bounds.x + i * bounds.width), Math.round(bounds.y + bottom))];

				if (breaks[i] != null)
				{
					breaks[i].points = pts;
					breaks[i].redraw();
				}
				else
				{
					var pageBreak = new bpmPolyline(pts, this.pageBreakColor);
					pageBreak.dialect = this.dialect;
					pageBreak.pointerEvents = false;
					pageBreak.isDashed = this.pageBreakDashed;
					pageBreak.init(this.view.backgroundPane);
					pageBreak.redraw();
					
					breaks[i] = pageBreak;
				}
			}
			
			for (var i = count; i < breaks.length; i++)
			{
				breaks[i].destroy();
			}
			
			breaks.splice(count, breaks.length - count);
		}
	});
	
	drawPageBreaks(this.horizontalPageBreaks);
	drawPageBreaks(this.verticalPageBreaks);
};

bpmGraph.prototype.getCellStyle = function(cell)
{
	var stylename = this.model.getStyle(cell);
	var style = null;
	
	if (this.model.isEdge(cell))
	{
		style = this.stylesheet.getDefaultEdgeStyle();
	}
	else
	{
		style = this.stylesheet.getDefaultVertexStyle();
	}
	
	if (stylename != null)
	{
		style = this.postProcessCellStyle(this.stylesheet.getCellStyle(stylename, style));
	}
	
	if (style == null)
	{
		style = new Object();
	}
	
	return style;
};

bpmGraph.prototype.postProcessCellStyle = function(style)
{
	if (style != null)
	{
		var key = style[bpmConstants.STYLE_IMAGE];
		var image = this.getImageFromBundles(key);

		if (image != null)
		{
			style[bpmConstants.STYLE_IMAGE] = image;
		}
		else
		{
			image = key;
		}
		
		if (image != null && image.substring(0, 11) == 'data:image/')
		{
			if (image.substring(0, 20) == 'data:image/svg+xml,<')
			{
				image = image.substring(0, 19) + encodeURIComponent(image.substring(19));
			}
			else if (image.substring(0, 22) != 'data:image/svg+xml,%3C')
			{
				var comma = image.indexOf(',');
				
				if (comma > 0 && image.substring(comma - 7, comma + 1) != ';base64,')
				{
					image = image.substring(0, comma) + ';base64,'
						+ image.substring(comma + 1);
				}
			}
			
			style[bpmConstants.STYLE_IMAGE] = image;
		}
	}

	return style;
};

bpmGraph.prototype.setCellStyle = function(style, cells)
{
	cells = cells || this.getSelectionCells();
	
	if (cells != null)
	{
		this.model.beginUpdate();
		try
		{
			for (var i = 0; i < cells.length; i++)
			{
				this.model.setStyle(cells[i], style);
			}
		}
		finally
		{
			this.model.endUpdate();
		}
	}
};

bpmGraph.prototype.toggleCellStyle = function(key, defaultValue, cell)
{
	cell = cell || this.getSelectionCell();
	
	return this.toggleCellStyles(key, defaultValue, [cell]);
};

bpmGraph.prototype.toggleCellStyles = function(key, defaultValue, cells)
{
	defaultValue = (defaultValue != null) ? defaultValue : false;
	cells = cells || this.getSelectionCells();
	var value = null;
	
	if (cells != null && cells.length > 0)
	{
		var state = this.view.getState(cells[0]);
		var style = (state != null) ? state.style : this.getCellStyle(cells[0]);
		
		if (style != null)
		{
			value = (bpmUtils.getValue(style, key, defaultValue)) ? 0 : 1;
			this.setCellStyles(key, value, cells);
		}
	}
	
	return value;
};

bpmGraph.prototype.setCellStyles = function(key, value, cells)
{
	cells = cells || this.getSelectionCells();
	bpmUtils.setCellStyles(this.model, cells, key, value);
};

bpmGraph.prototype.toggleCellStyleFlags = function(key, flag, cells)
{
	this.setCellStyleFlags(key, flag, null, cells);
};

bpmGraph.prototype.setCellStyleFlags = function(key, flag, value, cells)
{
	cells = cells || this.getSelectionCells();
	
	if (cells != null && cells.length > 0)
	{
		if (value == null)
		{
			var state = this.view.getState(cells[0]);
			var style = (state != null) ? state.style : this.getCellStyle(cells[0]);
			
			if (style != null)
			{
				var current = parseInt(style[key] || 0);
				value = !((current & flag) == flag);
			}
		}

		bpmUtils.setCellStyleFlags(this.model, cells, key, flag, value);
	}
};

bpmGraph.prototype.alignCells = function(align, cells, param)
{
	if (cells == null)
	{
		cells = this.getSelectionCells();
	}
	
	if (cells != null && cells.length > 1)
	{
		if (param == null)
		{
			for (var i = 0; i < cells.length; i++)
			{
				var state = this.view.getState(cells[i]);
				
				if (state != null && !this.model.isEdge(cells[i]))
				{
					if (param == null)
					{
						if (align == bpmConstants.ALIGN_CENTER)
						{
							param = state.x + state.width / 2;
							break;
						}
						else if (align == bpmConstants.ALIGN_RIGHT)
						{
							param = state.x + state.width;
						}
						else if (align == bpmConstants.ALIGN_TOP)
						{
							param = state.y;
						}
						else if (align == bpmConstants.ALIGN_MIDDLE)
						{
							param = state.y + state.height / 2;
							break;
						}
						else if (align == bpmConstants.ALIGN_BOTTOM)
						{
							param = state.y + state.height;
						}
						else
						{
							param = state.x;
						}
					}
					else
					{
						if (align == bpmConstants.ALIGN_RIGHT)
						{
							param = Math.max(param, state.x + state.width);
						}
						else if (align == bpmConstants.ALIGN_TOP)
						{
							param = Math.min(param, state.y);
						}
						else if (align == bpmConstants.ALIGN_BOTTOM)
						{
							param = Math.max(param, state.y + state.height);
						}
						else
						{
							param = Math.min(param, state.x);
						}
					}
				}
			}
		}

		if (param != null)
		{
			var s = this.view.scale;

			this.model.beginUpdate();
			try
			{
				for (var i = 0; i < cells.length; i++)
				{
					var state = this.view.getState(cells[i]);
					
					if (state != null)
					{
						var geo = this.getCellGeometry(cells[i]);
						
						if (geo != null && !this.model.isEdge(cells[i]))
						{
							geo = geo.clone();
							
							if (align == bpmConstants.ALIGN_CENTER)
							{
								geo.x += (param - state.x - state.width / 2) / s;
							}
							else if (align == bpmConstants.ALIGN_RIGHT)
							{
								geo.x += (param - state.x - state.width) / s;
							}
							else if (align == bpmConstants.ALIGN_TOP)
							{
								geo.y += (param - state.y) / s;
							}
							else if (align == bpmConstants.ALIGN_MIDDLE)
							{
								geo.y += (param - state.y - state.height / 2) / s;
							}
							else if (align == bpmConstants.ALIGN_BOTTOM)
							{
								geo.y += (param - state.y - state.height) / s;
							}
							else
							{
								geo.x += (param - state.x) / s;
							}
							
							this.resizeCell(cells[i], geo);
						}
					}
				}
				
				this.fireEvent(new bpmEventObject(bpmEvent.ALIGN_CELLS,
						'align', align, 'cells', cells));
			}
			finally
			{
				this.model.endUpdate();
			}
		}
	}
	
	return cells;
};

bpmGraph.prototype.flipEdge = function(edge)
{
	if (edge != null &&
		this.alternateEdgeStyle != null)
	{
		this.model.beginUpdate();
		try
		{
			var style = this.model.getStyle(edge);

			if (style == null || style.length == 0)
			{
				this.model.setStyle(edge, this.alternateEdgeStyle);
			}
			else
			{
				this.model.setStyle(edge, null);
			}

			this.resetEdge(edge);
			this.fireEvent(new bpmEventObject(bpmEvent.FLIP_EDGE, 'edge', edge));
		}
		finally
		{
			this.model.endUpdate();
		}
	}

	return edge;
};

bpmGraph.prototype.addImageBundle = function(bundle)
{
	this.imageBundles.push(bundle);
};

bpmGraph.prototype.removeImageBundle = function(bundle)
{
	var tmp = [];
	
	for (var i = 0; i < this.imageBundles.length; i++)
	{
		if (this.imageBundles[i] != bundle)
		{
			tmp.push(this.imageBundles[i]);
		}
	}
	
	this.imageBundles = tmp;
};

bpmGraph.prototype.getImageFromBundles = function(key)
{
	if (key != null)
	{
		for (var i = 0; i < this.imageBundles.length; i++)
		{
			var image = this.imageBundles[i].getImage(key);
			
			if (image != null)
			{
				return image;
			}
		}
	}
	
	return null;
};

bpmGraph.prototype.orderCells = function(back, cells)
{
	if (cells == null)
	{
		cells = bpmUtils.sortCells(this.getSelectionCells(), true);
	}

	this.model.beginUpdate();
	try
	{
		this.cellsOrdered(cells, back);
		this.fireEvent(new bpmEventObject(bpmEvent.ORDER_CELLS,
				'back', back, 'cells', cells));
	}
	finally
	{
		this.model.endUpdate();
	}

	return cells;
};

bpmGraph.prototype.cellsOrdered = function(cells, back)
{
	if (cells != null)
	{
		this.model.beginUpdate();
		try
		{
			for (var i = 0; i < cells.length; i++)
			{
				var parent = this.model.getParent(cells[i]);

				if (back)
				{
					this.model.add(parent, cells[i], i);
				}
				else
				{
					this.model.add(parent, cells[i],
							this.model.getChildCount(parent) - 1);
				}
			}
			
			this.fireEvent(new bpmEventObject(bpmEvent.CELLS_ORDERED,
					'back', back, 'cells', cells));
		}
		finally
		{
			this.model.endUpdate();
		}
	}
};

bpmGraph.prototype.groupCells = function(group, border, cells)
{
	if (cells == null)
	{
		cells = bpmUtils.sortCells(this.getSelectionCells(), true);
	}

	cells = this.getCellsForGroup(cells);

	if (group == null)
	{
		group = this.createGroupCell(cells);
	}

	var bounds = this.getBoundsForGroup(group, cells, border);

	if (cells.length > 0 && bounds != null)
	{
		var parent = this.model.getParent(group);
		
		if (parent == null)
		{
			parent = this.model.getParent(cells[0]);
		}

		this.model.beginUpdate();
		try
		{
			if (this.getCellGeometry(group) == null)
			{
				this.model.setGeometry(group, new bpmGeometry());
			}

			var index = this.model.getChildCount(parent);
			this.cellsAdded([group], parent, index, null, null, false, false, false);

			index = this.model.getChildCount(group);
			this.cellsAdded(cells, group, index, null, null, false, false, false);
			this.cellsMoved(cells, -bounds.x, -bounds.y, false, false, false);

			this.cellsResized([group], [bounds], false);

			this.fireEvent(new bpmEventObject(bpmEvent.GROUP_CELLS,
					'group', group, 'border', border, 'cells', cells));
		}
		finally
		{
			this.model.endUpdate();
		}
	}

	return group;
};

bpmGraph.prototype.getCellsForGroup = function(cells)
{
	var result = [];

	if (cells != null && cells.length > 0)
	{
		var parent = this.model.getParent(cells[0]);
		result.push(cells[0]);

		for (var i = 1; i < cells.length; i++)
		{
			if (this.model.getParent(cells[i]) == parent)
			{
				result.push(cells[i]);
			}
		}
	}

	return result;
};

bpmGraph.prototype.getBoundsForGroup = function(group, children, border)
{
	var result = this.getBoundingBoxFromGeometry(children, true);
	
	if (result != null)
	{
		if (this.isSwimlane(group))
		{
			var size = this.getStartSize(group);
			
			result.x -= size.width;
			result.y -= size.height;
			result.width += size.width;
			result.height += size.height;
		}
		
		if (border != null)
		{
			result.x -= border;
			result.y -= border;
			result.width += 2 * border;
			result.height += 2 * border;
		}
	}			
	
	return result;
};

bpmGraph.prototype.createGroupCell = function(cells)
{
	var group = new bpmCell('');
	group.setVertex(true);
	group.setConnectable(false);
	
	return group;
};

bpmGraph.prototype.ungroupCells = function(cells)
{
	var result = [];
	
	if (cells == null)
	{
		cells = this.getSelectionCells();

		var tmp = [];
		
		for (var i = 0; i < cells.length; i++)
		{
			if (this.model.getChildCount(cells[i]) > 0)
			{
				tmp.push(cells[i]);
			}
		}

		cells = tmp;
	}
	
	if (cells != null && cells.length > 0)
	{
		this.model.beginUpdate();
		try
		{
			for (var i = 0; i < cells.length; i++)
			{
				var children = this.model.getChildren(cells[i]);
				
				if (children != null && children.length > 0)
				{
					children = children.slice();
					var parent = this.model.getParent(cells[i]);
					var index = this.model.getChildCount(parent);

					this.cellsAdded(children, parent, index, null, null, true);
					result = result.concat(children);
				}
			}

			this.removeCellsAfterUngroup(cells);
			this.fireEvent(new bpmEventObject(bpmEvent.UNGROUP_CELLS, 'cells', cells));
		}
		finally
		{
			this.model.endUpdate();
		}
	}
	
	return result;
};

bpmGraph.prototype.removeCellsAfterUngroup = function(cells)
{
	this.cellsRemoved(this.addAllEdges(cells));
};

bpmGraph.prototype.removeCellsFromParent = function(cells)
{
	if (cells == null)
	{
		cells = this.getSelectionCells();
	}
	
	this.model.beginUpdate();
	try
	{
		var parent = this.getDefaultParent();
		var index = this.model.getChildCount(parent);

		this.cellsAdded(cells, parent, index, null, null, true);
		this.fireEvent(new bpmEventObject(bpmEvent.REMOVE_CELLS_FROM_PARENT, 'cells', cells));
	}
	finally
	{
		this.model.endUpdate();
	}

	return cells;
};

bpmGraph.prototype.updateGroupBounds = function(cells, border, moveGroup, topBorder, rightBorder, bottomBorder, leftBorder)
{
	if (cells == null)
	{
		cells = this.getSelectionCells();
	}
	
	border = (border != null) ? border : 0;
	moveGroup = (moveGroup != null) ? moveGroup : false;
	topBorder = (topBorder != null) ? topBorder : 0;
	rightBorder = (rightBorder != null) ? rightBorder : 0;
	bottomBorder = (bottomBorder != null) ? bottomBorder : 0;
	leftBorder = (leftBorder != null) ? leftBorder : 0;

	this.model.beginUpdate();
	try
	{
		for (var i = cells.length - 1; i >= 0; i--)
		{
			var geo = this.getCellGeometry(cells[i]);
			
			if (geo != null)
			{
				var children = this.getChildCells(cells[i]);
				
				if (children != null && children.length > 0)
				{
					var bounds = this.getBoundingBoxFromGeometry(children, true);
					
					if (bounds != null && bounds.width > 0 && bounds.height > 0)
					{
						var left = 0;
						var top = 0;
						
						if (this.isSwimlane(cells[i]))
						{
							var size = this.getStartSize(cells[i]);
							left = size.width;
							top = size.height;
						}
						
						geo = geo.clone();
						
						if (moveGroup)
						{
							geo.x = Math.round(geo.x + bounds.x - border - left - leftBorder);
							geo.y = Math.round(geo.y + bounds.y - border - top - topBorder);
						}
						
						geo.width = Math.round(bounds.width + 2 * border + left + leftBorder + rightBorder);
						geo.height = Math.round(bounds.height + 2 * border + top + topBorder + bottomBorder);
						
						this.model.setGeometry(cells[i], geo);
						this.moveCells(children, border + left - bounds.x + leftBorder,
								border + top - bounds.y + topBorder);
					}
				}
			}
		}
	}
	finally
	{
		this.model.endUpdate();
	}

	return cells;
};

bpmGraph.prototype.getBoundingBox = function(cells)
{
	var result = null;
	
	if (cells != null && cells.length > 0)
	{
		for (var i = 0; i < cells.length; i++)
		{
			if (this.model.isVertex(cells[i]) || this.model.isEdge(cells[i]))
			{
				var bbox = this.view.getBoundingBox(this.view.getState(cells[i]), true);
			
				if (bbox != null)
				{
					if (result == null)
					{
						result = bpmRectangle.fromRectangle(bbox);
					}
					else
					{
						result.add(bbox);
					}
				}
			}
		}
	}
	
	return result;
};

bpmGraph.prototype.cloneCell = function(cell, allowInvalidEdges, mapping, keepPosition)
{
	return this.cloneCells([cell], allowInvalidEdges, mapping, keepPosition)[0];
};

bpmGraph.prototype.cloneCells = function(cells, allowInvalidEdges, mapping, keepPosition)
{
	allowInvalidEdges = (allowInvalidEdges != null) ? allowInvalidEdges : true;
	var clones = null;
	
	if (cells != null)
	{
		var dict = new bpmDictionary();
		var tmp = [];
		
		for (var i = 0; i < cells.length; i++)
		{
			dict.put(cells[i], true);
			tmp.push(cells[i]);
		}
		
		if (tmp.length > 0)
		{
			var scale = this.view.scale;
			var trans = this.view.translate;
			clones = this.model.cloneCells(cells, true, mapping);
		
			for (var i = 0; i < cells.length; i++)
			{
				if (!allowInvalidEdges && this.model.isEdge(clones[i]) &&
					this.getEdgeValidationError(clones[i],
						this.model.getTerminal(clones[i], true),
						this.model.getTerminal(clones[i], false)) != null)
				{
					clones[i] = null;
				}
				else
				{
					var g = this.model.getGeometry(clones[i]);
					
					if (g != null)
					{
						var state = this.view.getState(cells[i]);
						var pstate = this.view.getState(this.model.getParent(cells[i]));
						
						if (state != null && pstate != null)
						{
							var dx = (keepPosition) ? 0 : pstate.origin.x;
							var dy = (keepPosition) ? 0 : pstate.origin.y;
							
							if (this.model.isEdge(clones[i]))
							{
								var pts = state.absolutePoints;
								
								if (pts != null)
								{
									var src = this.model.getTerminal(cells[i], true);
									
									while (src != null && !dict.get(src))
									{
										src = this.model.getParent(src);
									}
									
									if (src == null && pts[0] != null)
									{
										g.setTerminalPoint(
											new bpmPoint(pts[0].x / scale - trans.x,
												pts[0].y / scale - trans.y), true);
									}
									
									var trg = this.model.getTerminal(cells[i], false);
									
									while (trg != null && !dict.get(trg))
									{
										trg = this.model.getParent(trg);
									}

									var n = pts.length - 1;
									
									if (trg == null && pts[n] != null)
									{
										g.setTerminalPoint(
											new bpmPoint(pts[n].x / scale - trans.x,
												pts[n].y / scale - trans.y), false);
									}
									
									var points = g.points;
									
									if (points != null)
									{
										for (var j = 0; j < points.length; j++)
										{
											points[j].x += dx;
											points[j].y += dy;
										}
									}
								}
							}
							else
							{
								g.translate(dx, dy);
							}
						}
					}
				}
			}
		}
		else
		{
			clones = [];
		}
	}
	
	return clones;
};

bpmGraph.prototype.insertVertex = function(parent, id, value,
	x, y, width, height, style, relative)
{
	var vertex = this.createVertex(parent, id, value, x, y, width, height, style, relative);

	return this.addCell(vertex, parent);
};

bpmGraph.prototype.createVertex = function(parent, id, value,
		x, y, width, height, style, relative)
{
	var geometry = new bpmGeometry(x, y, width, height);
	geometry.relative = (relative != null) ? relative : false;
	
	var vertex = new bpmCell(value, geometry, style);
	vertex.setId(id);
	vertex.setVertex(true);
	vertex.setConnectable(true);
	
	return vertex;
};

bpmGraph.prototype.insertEdge = function(parent, id, value, source, target, style)
{
	var edge = this.createEdge(parent, id, value, source, target, style);
	
	return this.addEdge(edge, parent, source, target);
};

bpmGraph.prototype.createEdge = function(parent, id, value, source, target, style)
{
	// Creates the edge
	var edge = new bpmCell(value, new bpmGeometry(), style);
	edge.setId(id);
	edge.setEdge(true);
	edge.geometry.relative = true;
	
	return edge;
};

bpmGraph.prototype.addEdge = function(edge, parent, source, target, index)
{
	return this.addCell(edge, parent, index, source, target);
};

bpmGraph.prototype.addCell = function(cell, parent, index, source, target)
{
	return this.addCells([cell], parent, index, source, target)[0];
};

bpmGraph.prototype.addCells = function(cells, parent, index, source, target)
{
	if (parent == null)
	{
		parent = this.getDefaultParent();
	}
	
	if (index == null)
	{
		index = this.model.getChildCount(parent);
	}
	
	this.model.beginUpdate();
	try
	{
		this.cellsAdded(cells, parent, index, source, target, false, true);
		this.fireEvent(new bpmEventObject(bpmEvent.ADD_CELLS, 'cells', cells,
				'parent', parent, 'index', index, 'source', source, 'target', target));
	}
	finally
	{
		this.model.endUpdate();
	}

	return cells;
};

bpmGraph.prototype.cellsAdded = function(cells, parent, index, source, target, absolute, constrain, extend)
{
	if (cells != null && parent != null && index != null)
	{
		this.model.beginUpdate();
		try
		{
			var parentState = (absolute) ? this.view.getState(parent) : null;
			var o1 = (parentState != null) ? parentState.origin : null;
			var zero = new bpmPoint(0, 0);

			for (var i = 0; i < cells.length; i++)
			{
				if (cells[i] == null)
				{
					index--;
				}
				else
				{
					var previous = this.model.getParent(cells[i]);
	
					if (o1 != null && cells[i] != parent && parent != previous)
					{
						var oldState = this.view.getState(previous);
						var o2 = (oldState != null) ? oldState.origin : zero;
						var geo = this.model.getGeometry(cells[i]);
	
						if (geo != null)
						{
							var dx = o2.x - o1.x;
							var dy = o2.y - o1.y;
	
							geo = geo.clone();
							geo.translate(dx, dy);
							
							if (!geo.relative && this.model.isVertex(cells[i]) &&
								!this.isAllowNegativeCoordinates())
							{
								geo.x = Math.max(0, geo.x);
								geo.y = Math.max(0, geo.y);
							}
							
							this.model.setGeometry(cells[i], geo);
						}
					}
	
					if (parent == previous && index + i > this.model.getChildCount(parent))
					{
						index--;
					}

					this.model.add(parent, cells[i], index + i);
					
					if (this.autoSizeCellsOnAdd)
					{
						this.autoSizeCell(cells[i], true);
					}

					if ((extend == null || extend) &&
						this.isExtendParentsOnAdd(cells[i]) && this.isExtendParent(cells[i]))
					{
						this.extendParent(cells[i]);
					}
					
					if (constrain == null || constrain)
					{
						this.constrainChild(cells[i]);
					}
					
					if (source != null)
					{
						this.cellConnected(cells[i], source, true);
					}
					
					if (target != null)
					{
						this.cellConnected(cells[i], target, false);
					}
				}
			}
			
			this.fireEvent(new bpmEventObject(bpmEvent.CELLS_ADDED, 'cells', cells,
				'parent', parent, 'index', index, 'source', source, 'target', target,
				'absolute', absolute));
		}
		finally
		{
			this.model.endUpdate();
		}
	}
};

bpmGraph.prototype.autoSizeCell = function(cell, recurse)
{
	recurse = (recurse != null) ? recurse : true;
	
	if (recurse)
	{
		var childCount = this.model.getChildCount(cell);
		
		for (var i = 0; i < childCount; i++)
		{
			this.autoSizeCell(this.model.getChildAt(cell, i));
		}
	}

	if (this.getModel().isVertex(cell) && this.isAutoSizeCell(cell))
	{
		this.updateCellSize(cell);
	}
};

bpmGraph.prototype.removeCells = function(cells, includeEdges)
{
	includeEdges = (includeEdges != null) ? includeEdges : true;
	
	if (cells == null)
	{
		cells = this.getDeletableCells(this.getSelectionCells());
	}

	if (includeEdges)
	{
		cells = this.getDeletableCells(this.addAllEdges(cells));
	}
	else
	{
		cells = cells.slice();
		
		var edges = this.getDeletableCells(this.getAllEdges(cells));
		var dict = new bpmDictionary();
		
		for (var i = 0; i < cells.length; i++)
		{
			dict.put(cells[i], true);
		}
		
		for (var i = 0; i < edges.length; i++)
		{
			if (this.view.getState(edges[i]) == null &&
				!dict.get(edges[i]))
			{
				dict.put(edges[i], true);
				cells.push(edges[i]);
			}
		}
	}

	this.model.beginUpdate();
	try
	{
		this.cellsRemoved(cells);
		this.fireEvent(new bpmEventObject(bpmEvent.REMOVE_CELLS, 
				'cells', cells, 'includeEdges', includeEdges));
	}
	finally
	{
		this.model.endUpdate();
	}
	
	return cells;
};

bpmGraph.prototype.cellsRemoved = function(cells)
{
	if (cells != null && cells.length > 0)
	{
		var scale = this.view.scale;
		var tr = this.view.translate;
		
		this.model.beginUpdate();
		try
		{
			var dict = new bpmDictionary();
			
			for (var i = 0; i < cells.length; i++)
			{
				dict.put(cells[i], true);
			}
			
			for (var i = 0; i < cells.length; i++)
			{
				var edges = this.getAllEdges([cells[i]]);
				
				var disconnectTerminal = bpmUtils.bind(this, function(edge, source)
				{
					var geo = this.model.getGeometry(edge);

					if (geo != null)
					{
						var terminal = this.model.getTerminal(edge, source);
						var connected = false;
						var tmp = terminal;
						
						while (tmp != null)
						{
							if (cells[i] == tmp)
							{
								connected = true;
								break;
							}
							
							tmp = this.model.getParent(tmp);
						}

						if (connected)
						{
							geo = geo.clone();
							var state = this.view.getState(edge);

							if (state != null && state.absolutePoints != null)
							{
								var pts = state.absolutePoints;
								var n = (source) ? 0 : pts.length - 1;

								geo.setTerminalPoint(new bpmPoint(
									pts[n].x / scale - tr.x - state.origin.x,
									pts[n].y / scale - tr.y - state.origin.y), source);
							}
							else
							{
								var tstate = this.view.getState(terminal);
								
								if (tstate != null)
								{
									geo.setTerminalPoint(new bpmPoint(
										tstate.getCenterX() / scale - tr.x,
										tstate.getCenterY() / scale - tr.y), source);
								}
							}

							this.model.setGeometry(edge, geo);
							this.model.setTerminal(edge, null, source);
						}
					}
				});
				
				for (var j = 0; j < edges.length; j++)
				{
					if (!dict.get(edges[j]))
					{
						dict.put(edges[j], true);
						disconnectTerminal(edges[j], true);
						disconnectTerminal(edges[j], false);
					}
				}

				this.model.remove(cells[i]);
			}
			
			this.fireEvent(new bpmEventObject(bpmEvent.CELLS_REMOVED, 'cells', cells));
		}
		finally
		{
			this.model.endUpdate();
		}
	}
};

bpmGraph.prototype.splitEdge = function(edge, cells, newEdge, dx, dy)
{
	dx = dx || 0;
	dy = dy || 0;

	var parent = this.model.getParent(edge);
	var source = this.model.getTerminal(edge, true);

	this.model.beginUpdate();
	try
	{
		if (newEdge == null)
		{
			newEdge = this.cloneCell(edge);
			
			var state = this.view.getState(edge);
			var geo = this.getCellGeometry(newEdge);
			
			if (geo != null && geo.points != null && state != null)
			{
				var t = this.view.translate;
				var s = this.view.scale;
				var idx = bpmUtils.findNearestSegment(state, (dx + t.x) * s, (dy + t.y) * s);
				geo.points = geo.points.slice(0, idx);
								
				geo = this.getCellGeometry(edge);
				
				if (geo != null && geo.points != null)
				{
					geo = geo.clone();
					geo.points = geo.points.slice(idx);
					this.model.setGeometry(edge, geo);
				}
			}
		}
		
		this.cellsMoved(cells, dx, dy, false, false);
		this.cellsAdded(cells, parent, this.model.getChildCount(parent), null, null,
				true);
		this.cellsAdded([newEdge], parent, this.model.getChildCount(parent),
				source, cells[0], false);
		this.cellConnected(edge, cells[0], true);
		this.fireEvent(new bpmEventObject(bpmEvent.SPLIT_EDGE, 'edge', edge,
				'cells', cells, 'newEdge', newEdge, 'dx', dx, 'dy', dy));
	}
	finally
	{
		this.model.endUpdate();
	}

	return newEdge;
};

bpmGraph.prototype.toggleCells = function(show, cells, includeEdges)
{
	if (cells == null)
	{
		cells = this.getSelectionCells();
	}

	if (includeEdges)
	{
		cells = this.addAllEdges(cells);
	}

	this.model.beginUpdate();
	try
	{
		this.cellsToggled(cells, show);
		this.fireEvent(new bpmEventObject(bpmEvent.TOGGLE_CELLS,
			'show', show, 'cells', cells, 'includeEdges', includeEdges));
	}
	finally
	{
		this.model.endUpdate();
	}

	return cells;
};

bpmGraph.prototype.cellsToggled = function(cells, show)
{
	if (cells != null && cells.length > 0)
	{
		this.model.beginUpdate();
		try
		{
			for (var i = 0; i < cells.length; i++)
			{
				this.model.setVisible(cells[i], show);
			}
		}
		finally
		{
			this.model.endUpdate();
		}
	}
};

bpmGraph.prototype.foldCells = function(collapse, recurse, cells, checkFoldable, evt)
{
	recurse = (recurse != null) ? recurse : false;
	
	if (cells == null)
	{
		cells = this.getFoldableCells(this.getSelectionCells(), collapse);
	}

	this.stopEditing(false);

	this.model.beginUpdate();
	try
	{
		this.cellsFolded(cells, collapse, recurse, checkFoldable);
		this.fireEvent(new bpmEventObject(bpmEvent.FOLD_CELLS,
			'collapse', collapse, 'recurse', recurse, 'cells', cells));
	}
	finally
	{
		this.model.endUpdate();
	}

	return cells;
};

bpmGraph.prototype.cellsFolded = function(cells, collapse, recurse, checkFoldable)
{
	if (cells != null && cells.length > 0)
	{
		this.model.beginUpdate();
		try
		{
			for (var i = 0; i < cells.length; i++)
			{
				if ((!checkFoldable || this.isCellFoldable(cells[i], collapse)) &&
					collapse != this.isCellCollapsed(cells[i]))
				{
					this.model.setCollapsed(cells[i], collapse);
					this.swapBounds(cells[i], collapse);

					if (this.isExtendParent(cells[i]))
					{
						this.extendParent(cells[i]);
					}

					if (recurse)
					{
						var children = this.model.getChildren(cells[i]);
						this.cellsFolded(children, collapse, recurse);
					}
					
					this.constrainChild(cells[i]);
				}
			}
			
			this.fireEvent(new bpmEventObject(bpmEvent.CELLS_FOLDED,
				'cells', cells, 'collapse', collapse, 'recurse', recurse));
		}
		finally
		{
			this.model.endUpdate();
		}
	}
};

bpmGraph.prototype.swapBounds = function(cell, willCollapse)
{
	if (cell != null)
	{
		var geo = this.model.getGeometry(cell);
		
		if (geo != null)
		{
			geo = geo.clone();
			
			this.updateAlternateBounds(cell, geo, willCollapse);
			geo.swap();
			
			this.model.setGeometry(cell, geo);
		}
	}
};

bpmGraph.prototype.updateAlternateBounds = function(cell, geo, willCollapse)
{
	if (cell != null && geo != null)
	{
		var state = this.view.getState(cell);
		var style = (state != null) ? state.style : this.getCellStyle(cell);

		if (geo.alternateBounds == null)
		{
			var bounds = geo;
			
			if (this.collapseToPreferredSize)
			{
				var tmp = this.getPreferredSizeForCell(cell);
				
				if (tmp != null)
				{
					bounds = tmp;

					var startSize = bpmUtils.getValue(style, bpmConstants.STYLE_STARTSIZE);

					if (startSize > 0)
					{
						bounds.height = Math.max(bounds.height, startSize);
					}
				}
			}
			
			geo.alternateBounds = new bpmRectangle(0, 0, bounds.width, bounds.height);
		}
		
		if (geo.alternateBounds != null)
		{
			geo.alternateBounds.x = geo.x;
			geo.alternateBounds.y = geo.y;
			
			var alpha = bpmUtils.toRadians(style[bpmConstants.STYLE_ROTATION] || 0);
			
			if (alpha != 0)
			{
				var dx = geo.alternateBounds.getCenterX() - geo.getCenterX();
				var dy = geo.alternateBounds.getCenterY() - geo.getCenterY();
	
				var cos = Math.cos(alpha);
				var sin = Math.sin(alpha);
	
				var dx2 = cos * dx - sin * dy;
				var dy2 = sin * dx + cos * dy;
				
				geo.alternateBounds.x += dx2 - dx;
				geo.alternateBounds.y += dy2 - dy;
			}
		}
	}
};

bpmGraph.prototype.addAllEdges = function(cells)
{
	var allCells = cells.slice();
	
	return bpmUtils.removeDuplicates(allCells.concat(this.getAllEdges(cells)));
};

bpmGraph.prototype.getAllEdges = function(cells)
{
	var edges = [];
	
	if (cells != null)
	{
		for (var i = 0; i < cells.length; i++)
		{
			var edgeCount = this.model.getEdgeCount(cells[i]);
			
			for (var j = 0; j < edgeCount; j++)
			{
				edges.push(this.model.getEdgeAt(cells[i], j));
			}

			// Recurses
			var children = this.model.getChildren(cells[i]);
			edges = edges.concat(this.getAllEdges(children));
		}
	}
	
	return edges;
};

bpmGraph.prototype.updateCellSize = function(cell, ignoreChildren)
{
	ignoreChildren = (ignoreChildren != null) ? ignoreChildren : false;
	
	this.model.beginUpdate();				
	try
	{
		this.cellSizeUpdated(cell, ignoreChildren);
		this.fireEvent(new bpmEventObject(bpmEvent.UPDATE_CELL_SIZE,
				'cell', cell, 'ignoreChildren', ignoreChildren));
	}
	finally
	{
		this.model.endUpdate();
	}
	
	return cell;
};

bpmGraph.prototype.cellSizeUpdated = function(cell, ignoreChildren)
{
	if (cell != null)
	{
		this.model.beginUpdate();				
		try
		{
			var size = this.getPreferredSizeForCell(cell);
			var geo = this.model.getGeometry(cell);
			
			if (size != null && geo != null)
			{
				var collapsed = this.isCellCollapsed(cell);
				geo = geo.clone();

				if (this.isSwimlane(cell))
				{
					var state = this.view.getState(cell);
					var style = (state != null) ? state.style : this.getCellStyle(cell);
					var cellStyle = this.model.getStyle(cell);

					if (cellStyle == null)
					{
						cellStyle = '';
					}

					if (bpmUtils.getValue(style, bpmConstants.STYLE_HORIZONTAL, true))
					{
						cellStyle = bpmUtils.setStyle(cellStyle,
								bpmConstants.STYLE_STARTSIZE, size.height + 8);

						if (collapsed)
						{
							geo.height = size.height + 8;
						}

						geo.width = size.width;
					}
					else
					{
						cellStyle = bpmUtils.setStyle(cellStyle,
								bpmConstants.STYLE_STARTSIZE, size.width + 8);

						if (collapsed)
						{
							geo.width = size.width + 8;
						}

						geo.height = size.height;
					}

					this.model.setStyle(cell, cellStyle);
				}
				else
				{
					geo.width = size.width;
					geo.height = size.height;
				}

				if (!ignoreChildren && !collapsed)
				{
					var bounds = this.view.getBounds(this.model.getChildren(cell));

					if (bounds != null)
					{
						var tr = this.view.translate;
						var scale = this.view.scale;

						var width = (bounds.x + bounds.width) / scale - geo.x - tr.x;
						var height = (bounds.y + bounds.height) / scale - geo.y - tr.y;

						geo.width = Math.max(geo.width, width);
						geo.height = Math.max(geo.height, height);
					}
				}

				this.cellsResized([cell], [geo], false);
			}
		}
		finally
		{
			this.model.endUpdate();
		}
	}
};

bpmGraph.prototype.getPreferredSizeForCell = function(cell)
{
	var result = null;
	
	if (cell != null)
	{
		var state = this.view.getState(cell) || this.view.createState(cell);
		var style = state.style;

		if (!this.model.isEdge(cell))
		{
			var fontSize = style[bpmConstants.STYLE_FONTSIZE] || bpmConstants.DEFAULT_FONTSIZE;
			var dx = 0;
			var dy = 0;
			
			// Adds dimension of image if shape is a label
			if (this.getImage(state) != null || style[bpmConstants.STYLE_IMAGE] != null)
			{
				if (style[bpmConstants.STYLE_SHAPE] == bpmConstants.SHAPE_LABEL)
				{
					if (style[bpmConstants.STYLE_VERTICAL_ALIGN] == bpmConstants.ALIGN_MIDDLE)
					{
						dx += parseFloat(style[bpmConstants.STYLE_IMAGE_WIDTH]) || bpmLabel.prototype.imageSize;
					}
					
					if (style[bpmConstants.STYLE_ALIGN] != bpmConstants.ALIGN_CENTER)
					{
						dy += parseFloat(style[bpmConstants.STYLE_IMAGE_HEIGHT]) || bpmLabel.prototype.imageSize;
					}
				}
			}

			// Adds spacings
			dx += 2 * (style[bpmConstants.STYLE_SPACING] || 0);
			dx += style[bpmConstants.STYLE_SPACING_LEFT] || 0;
			dx += style[bpmConstants.STYLE_SPACING_RIGHT] || 0;

			dy += 2 * (style[bpmConstants.STYLE_SPACING] || 0);
			dy += style[bpmConstants.STYLE_SPACING_TOP] || 0;
			dy += style[bpmConstants.STYLE_SPACING_BOTTOM] || 0;
			
			var image = this.getFoldingImage(state);
			
			if (image != null)
			{
				dx += image.width + 8;
			}

			var value = this.cellRenderer.getLabelValue(state);

			if (value != null && value.length > 0)
			{
				if (!this.isHtmlLabel(state.cell))
				{
					value = bpmUtils.htmlEntities(value);
				}
				
				value = value.replace(/\n/g, '<br>');
				
				var size = bpmUtils.getSizeForString(value, fontSize, style[bpmConstants.STYLE_FONTFAMILY]);
				var width = size.width + dx;
				var height = size.height + dy;
				
				if (!bpmUtils.getValue(style, bpmConstants.STYLE_HORIZONTAL, true))
				{
					var tmp = height;
					
					height = width;
					width = tmp;
				}
			
				if (this.gridEnabled)
				{
					width = this.snap(width + this.gridSize / 2);
					height = this.snap(height + this.gridSize / 2);
				}

				result = new bpmRectangle(0, 0, width, height);
			}
			else
			{
				var gs2 = 4 * this.gridSize;
				result = new bpmRectangle(0, 0, gs2, gs2);
			}
		}
	}
	
	return result;
};

bpmGraph.prototype.resizeCell = function(cell, bounds, recurse)
{
	return this.resizeCells([cell], [bounds], recurse)[0];
};

bpmGraph.prototype.resizeCells = function(cells, bounds, recurse)
{
	recurse = (recurse != null) ? recurse : this.isRecursiveResize();
	
	this.model.beginUpdate();
	try
	{
		this.cellsResized(cells, bounds, recurse);
		this.fireEvent(new bpmEventObject(bpmEvent.RESIZE_CELLS,
				'cells', cells, 'bounds', bounds));
	}
	finally
	{
		this.model.endUpdate();
	}

	return cells;
};

bpmGraph.prototype.cellsResized = function(cells, bounds, recurse)
{
	recurse = (recurse != null) ? recurse : false;
	
	if (cells != null && bounds != null && cells.length == bounds.length)
	{
		this.model.beginUpdate();
		try
		{
			for (var i = 0; i < cells.length; i++)
			{
				this.cellResized(cells[i], bounds[i], false, recurse);

				if (this.isExtendParent(cells[i]))
				{
					this.extendParent(cells[i]);
				}
				
				this.constrainChild(cells[i]);
			}

			if (this.resetEdgesOnResize)
			{
				this.resetEdges(cells);
			}
			
			this.fireEvent(new bpmEventObject(bpmEvent.CELLS_RESIZED,
					'cells', cells, 'bounds', bounds));
		}
		finally
		{
			this.model.endUpdate();
		}
	}
};

bpmGraph.prototype.cellResized = function(cell, bounds, ignoreRelative, recurse)
{
	var geo = this.model.getGeometry(cell);

	if (geo != null && (geo.x != bounds.x || geo.y != bounds.y ||
		geo.width != bounds.width || geo.height != bounds.height))
	{
		geo = geo.clone();

		if (!ignoreRelative && geo.relative)
		{
			var offset = geo.offset;

			if (offset != null)
			{
				offset.x += bounds.x - geo.x;
				offset.y += bounds.y - geo.y;
			}
		}
		else
		{
			geo.x = bounds.x;
			geo.y = bounds.y;
		}

		geo.width = bounds.width;
		geo.height = bounds.height;

		if (!geo.relative && this.model.isVertex(cell) && !this.isAllowNegativeCoordinates())
		{
			geo.x = Math.max(0, geo.x);
			geo.y = Math.max(0, geo.y);
		}

		this.model.beginUpdate();
		try
		{
			if (recurse)
			{
				this.resizeChildCells(cell, geo);
			}
						
			this.model.setGeometry(cell, geo);
			this.constrainChildCells(cell);
		}
		finally
		{
			this.model.endUpdate();
		}
	}
};

bpmGraph.prototype.resizeChildCells = function(cell, newGeo)
{
	var geo = this.model.getGeometry(cell);
	var dx = newGeo.width / geo.width;
	var dy = newGeo.height / geo.height;
	var childCount = this.model.getChildCount(cell);
	
	for (var i = 0; i < childCount; i++)
	{
		this.scaleCell(this.model.getChildAt(cell, i), dx, dy, true);
	}
};

bpmGraph.prototype.constrainChildCells = function(cell)
{
	var childCount = this.model.getChildCount(cell);
	
	for (var i = 0; i < childCount; i++)
	{
		this.constrainChild(this.model.getChildAt(cell, i));
	}
};

bpmGraph.prototype.scaleCell = function(cell, dx, dy, recurse)
{
	var geo = this.model.getGeometry(cell);
	
	if (geo != null)
	{
		var state = this.view.getState(cell);
		var style = (state != null) ? state.style : this.getCellStyle(cell);
		
		geo = geo.clone();
		
		// Stores values for restoring based on style
		var x = geo.x;
		var y = geo.y
		var w = geo.width;
		var h = geo.height;
		
		geo.scale(dx, dy, style[bpmConstants.STYLE_ASPECT] == 'fixed');
		
		if (style[bpmConstants.STYLE_RESIZE_WIDTH] == '1')
		{
			geo.width = w * dx;
		}
		else if (style[bpmConstants.STYLE_RESIZE_WIDTH] == '0')
		{
			geo.width = w;
		}
		
		if (style[bpmConstants.STYLE_RESIZE_HEIGHT] == '1')
		{
			geo.height = h * dy;
		}
		else if (style[bpmConstants.STYLE_RESIZE_HEIGHT] == '0')
		{
			geo.height = h;
		}
		
		if (!this.isCellMovable(cell))
		{
			geo.x = x;
			geo.y = y;
		}
		
		if (!this.isCellResizable(cell))
		{
			geo.width = w;
			geo.height = h;
		}

		if (this.model.isVertex(cell))
		{
			this.cellResized(cell, geo, true, recurse);
		}
		else
		{
			this.model.setGeometry(cell, geo);
		}
	}
};

bpmGraph.prototype.extendParent = function(cell)
{
	if (cell != null)
	{
		var parent = this.model.getParent(cell);
		var p = this.getCellGeometry(parent);
		
		if (parent != null && p != null && !this.isCellCollapsed(parent))
		{
			var geo = this.getCellGeometry(cell);
			
			if (geo != null && !geo.relative &&
				(p.width < geo.x + geo.width ||
				p.height < geo.y + geo.height))
			{
				p = p.clone();
				
				p.width = Math.max(p.width, geo.x + geo.width);
				p.height = Math.max(p.height, geo.y + geo.height);
				
				this.cellsResized([parent], [p], false);
			}
		}
	}
};

bpmGraph.prototype.importCells = function(cells, dx, dy, target, evt, mapping)
{	
	return this.moveCells(cells, dx, dy, true, target, evt, mapping);
};

bpmGraph.prototype.moveCells = function(cells, dx, dy, clone, target, evt, mapping)
{
	dx = (dx != null) ? dx : 0;
	dy = (dy != null) ? dy : 0;
	clone = (clone != null) ? clone : false;
	
	if (cells != null && (dx != 0 || dy != 0 || clone || target != null))
	{
		cells = this.model.getTopmostCells(cells);
		
		this.model.beginUpdate();
		try
		{
			var dict = new bpmDictionary();
			
			for (var i = 0; i < cells.length; i++)
			{
				dict.put(cells[i], true);
			}
			
			var isSelected = bpmUtils.bind(this, function(cell)
			{
				while (cell != null)
				{
					if (dict.get(cell))
					{
						return true;
					}
					
					cell = this.model.getParent(cell);
				}
				
				return false;
			});
			
			var checked = [];
			
			for (var i = 0; i < cells.length; i++)
			{
				var geo = this.getCellGeometry(cells[i]);
				var parent = this.model.getParent(cells[i]);
		
				if ((geo == null || !geo.relative) || !this.model.isEdge(parent) ||
					(!isSelected(this.model.getTerminal(parent, true)) &&
					!isSelected(this.model.getTerminal(parent, false))))
				{
					checked.push(cells[i]);
				}
			}

			cells = checked;
			
			if (clone)
			{
				cells = this.cloneCells(cells, this.isCloneInvalidEdges(), mapping);

				if (target == null)
				{
					target = this.getDefaultParent();
				}
			}

			var previous = this.isAllowNegativeCoordinates();
			
			if (target != null)
			{
				this.setAllowNegativeCoordinates(true);
			}
			
			this.cellsMoved(cells, dx, dy, !clone && this.isDisconnectOnMove()
					&& this.isAllowDanglingEdges(), target == null,
					this.isExtendParentsOnMove() && target == null);
			
			this.setAllowNegativeCoordinates(previous);

			if (target != null)
			{
				var index = this.model.getChildCount(target);
				this.cellsAdded(cells, target, index, null, null, true);
			}

			// Dispatches a move event
			this.fireEvent(new bpmEventObject(bpmEvent.MOVE_CELLS, 'cells', cells,
				'dx', dx, 'dy', dy, 'clone', clone, 'target', target, 'event', evt));
		}
		finally
		{
			this.model.endUpdate();
		}
	}

	return cells;
};

bpmGraph.prototype.cellsMoved = function(cells, dx, dy, disconnect, constrain, extend)
{
	if (cells != null && (dx != 0 || dy != 0))
	{
		extend = (extend != null) ? extend : false;

		this.model.beginUpdate();
		try
		{
			if (disconnect)
			{
				this.disconnectGraph(cells);
			}

			for (var i = 0; i < cells.length; i++)
			{
				this.translateCell(cells[i], dx, dy);
				
				if (extend && this.isExtendParent(cells[i]))
				{
					this.extendParent(cells[i]);
				}
				else if (constrain)
				{
					this.constrainChild(cells[i]);
				}
			}

			if (this.resetEdgesOnMove)
			{
				this.resetEdges(cells);
			}
			
			this.fireEvent(new bpmEventObject(bpmEvent.CELLS_MOVED,
				'cells', cells, 'dx', dx, 'dy', dy, 'disconnect', disconnect));
		}
		finally
		{
			this.model.endUpdate();
		}
	}
};

bpmGraph.prototype.translateCell = function(cell, dx, dy)
{
	var geo = this.model.getGeometry(cell);

	if (geo != null)
	{
		dx = parseFloat(dx);
		dy = parseFloat(dy);
		geo = geo.clone();
		geo.translate(dx, dy);

		if (!geo.relative && this.model.isVertex(cell) && !this.isAllowNegativeCoordinates())
		{
			geo.x = Math.max(0, parseFloat(geo.x));
			geo.y = Math.max(0, parseFloat(geo.y));
		}
		
		if (geo.relative && !this.model.isEdge(cell))
		{
			var parent = this.model.getParent(cell);
			var angle = 0;
			
			if (this.model.isVertex(parent))
			{
				var state = this.view.getState(parent);
				var style = (state != null) ? state.style : this.getCellStyle(parent);
				
				angle = bpmUtils.getValue(style, bpmConstants.STYLE_ROTATION, 0);
			}
			
			if (angle != 0)
			{
				var rad = bpmUtils.toRadians(-angle);
				var cos = Math.cos(rad);
				var sin = Math.sin(rad);
				var pt = bpmUtils.getRotatedPoint(new bpmPoint(dx, dy), cos, sin, new bpmPoint(0, 0));
				dx = pt.x;
				dy = pt.y;
			}
			
			if (geo.offset == null)
			{
				geo.offset = new bpmPoint(dx, dy);
			}
			else
			{
				geo.offset.x = parseFloat(geo.offset.x) + dx;
				geo.offset.y = parseFloat(geo.offset.y) + dy;
			}
		}

		this.model.setGeometry(cell, geo);
	}
};

bpmGraph.prototype.getCellContainmentArea = function(cell)
{
	if (cell != null && !this.model.isEdge(cell))
	{
		var parent = this.model.getParent(cell);
		
		if (parent != null && parent != this.getDefaultParent())
		{
			var g = this.model.getGeometry(parent);
			
			if (g != null)
			{
				var x = 0;
				var y = 0;
				var w = g.width;
				var h = g.height;
				
				if (this.isSwimlane(parent))
				{
					var size = this.getStartSize(parent);
					
					var state = this.view.getState(parent);
					var style = (state != null) ? state.style : this.getCellStyle(parent);
					var dir = bpmUtils.getValue(style, bpmConstants.STYLE_DIRECTION, bpmConstants.DIRECTION_EAST);
					var flipH = bpmUtils.getValue(style, bpmConstants.STYLE_FLIPH, 0) == 1;
					var flipV = bpmUtils.getValue(style, bpmConstants.STYLE_FLIPV, 0) == 1;
					
					if (dir == bpmConstants.DIRECTION_SOUTH || dir == bpmConstants.DIRECTION_NORTH)
					{
						var tmp = size.width;
						size.width = size.height;
						size.height = tmp;
					}
					
					if ((dir == bpmConstants.DIRECTION_EAST && !flipV) || (dir == bpmConstants.DIRECTION_NORTH && !flipH) ||
						(dir == bpmConstants.DIRECTION_WEST && flipV) || (dir == bpmConstants.DIRECTION_SOUTH && flipH))
					{
						x = size.width;
						y = size.height;
					}

					w -= size.width;
					h -= size.height;
				}
				
				return new bpmRectangle(x, y, w, h);
			}
		}
	}
	
	return null;
};

bpmGraph.prototype.getMaximumGraphBounds = function()
{
	return this.maximumGraphBounds;
};

bpmGraph.prototype.constrainChild = function(cell, sizeFirst)
{
	sizeFirst = (sizeFirst != null) ? sizeFirst : true;
	
	if (cell != null)
	{
		var geo = this.getCellGeometry(cell);
		
		if (geo != null && (this.isConstrainRelativeChildren() || !geo.relative))
		{
			var parent = this.model.getParent(cell);
			var pgeo = this.getCellGeometry(parent);
			var max = this.getMaximumGraphBounds();
			
			if (max != null)
			{
				var off = this.getBoundingBoxFromGeometry([parent], false);
				
				if (off != null)
				{
					max = bpmRectangle.fromRectangle(max);
					
					max.x -= off.x;
					max.y -= off.y;
				}
			}
			
			if (this.isConstrainChild(cell))
			{
				var tmp = this.getCellContainmentArea(cell);
				
				if (tmp != null)
				{
					var overlap = this.getOverlap(cell);
	
					if (overlap > 0)
					{
						tmp = bpmRectangle.fromRectangle(tmp);
						
						tmp.x -= tmp.width * overlap;
						tmp.y -= tmp.height * overlap;
						tmp.width += 2 * tmp.width * overlap;
						tmp.height += 2 * tmp.height * overlap;
					}
					
					// Find the intersection between max and tmp
					if (max == null)
					{
						max = tmp;
					}
					else
					{
						max = bpmRectangle.fromRectangle(max);
						max.intersect(tmp);
					}
				}
			}
			
			if (max != null)
			{
				var cells = [cell];
				
				if (!this.isCellCollapsed(cell))
				{
					var desc = this.model.getDescendants(cell);
					
					for (var i = 0; i < desc.length; i++)
					{
						if (this.isCellVisible(desc[i]))
						{
							cells.push(desc[i]);
						}
					}
				}
				
				var bbox = this.getBoundingBoxFromGeometry(cells, false);
				
				if (bbox != null)
				{
					geo = geo.clone();
					
					// Cumulative horizontal movement
					var dx = 0;
					
					if (geo.width > max.width)
					{
						dx = geo.width - max.width;
						geo.width -= dx;
					}
					
					if (bbox.x + bbox.width > max.x + max.width)
					{
						dx -= bbox.x + bbox.width - max.x - max.width - dx;
					}
					
					// Cumulative vertical movement
					var dy = 0;
					
					if (geo.height > max.height)
					{
						dy = geo.height - max.height;
						geo.height -= dy;
					}
					
					if (bbox.y + bbox.height > max.y + max.height)
					{
						dy -= bbox.y + bbox.height - max.y - max.height - dy;
					}
					
					if (bbox.x < max.x)
					{
						dx -= bbox.x - max.x;
					}
					
					if (bbox.y < max.y)
					{
						dy -= bbox.y - max.y;
					}
					
					if (dx != 0 || dy != 0)
					{
						if (geo.relative)
						{
							// Relative geometries are moved via absolute offset
							if (geo.offset == null)
							{
								geo.offset = new bpmPoint();
							}
						
							geo.offset.x += dx;
							geo.offset.y += dy;
						}
						else
						{
							geo.x += dx;
							geo.y += dy;
						}
					}
					
					this.model.setGeometry(cell, geo);
				}
			}
		}
	}
};

bpmGraph.prototype.resetEdges = function(cells)
{
	if (cells != null)
	{
		// Prepares faster cells lookup
		var dict = new bpmDictionary();
		
		for (var i = 0; i < cells.length; i++)
		{
			dict.put(cells[i], true);
		}
		
		this.model.beginUpdate();
		try
		{
			for (var i = 0; i < cells.length; i++)
			{
				var edges = this.model.getEdges(cells[i]);
				
				if (edges != null)
				{
					for (var j = 0; j < edges.length; j++)
					{
						var state = this.view.getState(edges[j]);
						
						var source = (state != null) ? state.getVisibleTerminal(true) : this.view.getVisibleTerminal(edges[j], true);
						var target = (state != null) ? state.getVisibleTerminal(false) : this.view.getVisibleTerminal(edges[j], false);
						
						// Checks if one of the terminals is not in the given array
						if (!dict.get(source) || !dict.get(target))
						{
							this.resetEdge(edges[j]);
						}
					}
				}
				
				this.resetEdges(this.model.getChildren(cells[i]));
			}
		}
		finally
		{
			this.model.endUpdate();
		}
	}
};

bpmGraph.prototype.resetEdge = function(edge)
{
	var geo = this.model.getGeometry(edge);
	
	// Resets the control points
	if (geo != null && geo.points != null && geo.points.length > 0)
	{
		geo = geo.clone();
		geo.points = [];
		this.model.setGeometry(edge, geo);
	}
	
	return edge;
};

bpmGraph.prototype.getOutlineConstraint = function(point, terminalState, me)
{
	if (terminalState.shape != null)
	{
		var bounds = this.view.getPerimeterBounds(terminalState);
		var direction = terminalState.style[bpmConstants.STYLE_DIRECTION];
		
		if (direction == bpmConstants.DIRECTION_NORTH || direction == bpmConstants.DIRECTION_SOUTH)
		{
			bounds.x += bounds.width / 2 - bounds.height / 2;
			bounds.y += bounds.height / 2 - bounds.width / 2;
			var tmp = bounds.width;
			bounds.width = bounds.height;
			bounds.height = tmp;
		}
	
		var alpha = bpmUtils.toRadians(terminalState.shape.getShapeRotation());
		
		if (alpha != 0)
		{
			var cos = Math.cos(-alpha);
			var sin = Math.sin(-alpha);
	
			var ct = new bpmPoint(bounds.getCenterX(), bounds.getCenterY());
			point = bpmUtils.getRotatedPoint(point, cos, sin, ct);
		}

		var sx = 1;
		var sy = 1;
		var dx = 0;
		var dy = 0;
		
		// LATER: Add flipping support for image shapes
		if (this.getModel().isVertex(terminalState.cell))
		{
			var flipH = terminalState.style[bpmConstants.STYLE_FLIPH];
			var flipV = terminalState.style[bpmConstants.STYLE_FLIPV];
			
			// Legacy support for stencilFlipH/V
			if (terminalState.shape != null && terminalState.shape.stencil != null)
			{
				flipH = bpmUtils.getValue(terminalState.style, 'stencilFlipH', 0) == 1 || flipH;
				flipV = bpmUtils.getValue(terminalState.style, 'stencilFlipV', 0) == 1 || flipV;
			}
			
			if (direction == bpmConstants.DIRECTION_NORTH || direction == bpmConstants.DIRECTION_SOUTH)
			{
				var tmp = flipH;
				flipH = flipV;
				flipV = tmp;
			}
			
			if (flipH)
			{
				sx = -1;
				dx = -bounds.width;
			}
			
			if (flipV)
			{
				sy = -1;
				dy = -bounds.height ;
			}
		}
		
		point = new bpmPoint((point.x - bounds.x) * sx - dx + bounds.x, (point.y - bounds.y) * sy - dy + bounds.y);
		
		var x = (bounds.width == 0) ? 0 : Math.round((point.x - bounds.x) * 1000 / bounds.width) / 1000;
		var y = (bounds.height == 0) ? 0 : Math.round((point.y - bounds.y) * 1000 / bounds.height) / 1000;
		
		return new bpmConnectionConstraint(new bpmPoint(x, y), false);
	}
	
	return null;
};

bpmGraph.prototype.getAllConnectionConstraints = function(terminal, source)
{
	if (terminal != null && terminal.shape != null && terminal.shape.stencil != null)
	{
		return terminal.shape.stencil.constraints;
	}

	return null;
};

bpmGraph.prototype.getConnectionConstraint = function(edge, terminal, source)
{
	var point = null;
	var x = edge.style[(source) ? bpmConstants.STYLE_EXIT_X : bpmConstants.STYLE_ENTRY_X];

	if (x != null)
	{
		var y = edge.style[(source) ? bpmConstants.STYLE_EXIT_Y : bpmConstants.STYLE_ENTRY_Y];
		
		if (y != null)
		{
			point = new bpmPoint(parseFloat(x), parseFloat(y));
		}
	}
	
	var perimeter = false;
	var dx = 0, dy = 0;
	
	if (point != null)
	{
		perimeter = bpmUtils.getValue(edge.style, (source) ? bpmConstants.STYLE_EXIT_PERIMETER :
			bpmConstants.STYLE_ENTRY_PERIMETER, true);

		//Add entry/exit offset
		dx = parseFloat(edge.style[(source) ? bpmConstants.STYLE_EXIT_DX : bpmConstants.STYLE_ENTRY_DX]);
		dy = parseFloat(edge.style[(source) ? bpmConstants.STYLE_EXIT_DY : bpmConstants.STYLE_ENTRY_DY]);
		
		dx = isFinite(dx)? dx : 0;
		dy = isFinite(dy)? dy : 0;
	}

	return new bpmConnectionConstraint(point, perimeter, null, dx, dy);
};

bpmGraph.prototype.setConnectionConstraint = function(edge, terminal, source, constraint)
{
	if (constraint != null)
	{
		this.model.beginUpdate();
		
		try
		{
			if (constraint == null || constraint.point == null)
			{
				this.setCellStyles((source) ? bpmConstants.STYLE_EXIT_X :
					bpmConstants.STYLE_ENTRY_X, null, [edge]);
				this.setCellStyles((source) ? bpmConstants.STYLE_EXIT_Y :
					bpmConstants.STYLE_ENTRY_Y, null, [edge]);
				this.setCellStyles((source) ? bpmConstants.STYLE_EXIT_DX :
					bpmConstants.STYLE_ENTRY_DX, null, [edge]);
				this.setCellStyles((source) ? bpmConstants.STYLE_EXIT_DY :
					bpmConstants.STYLE_ENTRY_DY, null, [edge]);
				this.setCellStyles((source) ? bpmConstants.STYLE_EXIT_PERIMETER :
					bpmConstants.STYLE_ENTRY_PERIMETER, null, [edge]);
			}
			else if (constraint.point != null)
			{
				this.setCellStyles((source) ? bpmConstants.STYLE_EXIT_X :
					bpmConstants.STYLE_ENTRY_X, constraint.point.x, [edge]);
				this.setCellStyles((source) ? bpmConstants.STYLE_EXIT_Y :
					bpmConstants.STYLE_ENTRY_Y, constraint.point.y, [edge]);
				this.setCellStyles((source) ? bpmConstants.STYLE_EXIT_DX :
					bpmConstants.STYLE_ENTRY_DX, constraint.dx, [edge]);
				this.setCellStyles((source) ? bpmConstants.STYLE_EXIT_DY :
					bpmConstants.STYLE_ENTRY_DY, constraint.dy, [edge]);
				
				// Only writes 0 since 1 is default
				if (!constraint.perimeter)
				{
					this.setCellStyles((source) ? bpmConstants.STYLE_EXIT_PERIMETER :
						bpmConstants.STYLE_ENTRY_PERIMETER, '0', [edge]);
				}
				else
				{
					this.setCellStyles((source) ? bpmConstants.STYLE_EXIT_PERIMETER :
						bpmConstants.STYLE_ENTRY_PERIMETER, null, [edge]);
				}
			}
		}
		finally
		{
			this.model.endUpdate();
		}
	}
};

bpmGraph.prototype.getConnectionPoint = function(vertex, constraint, round)
{
	round = (round != null) ? round : true;
	var point = null;
	
	if (vertex != null && constraint.point != null)
	{
		var bounds = this.view.getPerimeterBounds(vertex);
        var cx = new bpmPoint(bounds.getCenterX(), bounds.getCenterY());
		var direction = vertex.style[bpmConstants.STYLE_DIRECTION];
		var r1 = 0;
		
		// Bounds need to be rotated by 90 degrees for further computation
		if (direction != null && bpmUtils.getValue(vertex.style,
			bpmConstants.STYLE_ANCHOR_POINT_DIRECTION, 1) == 1)
		{
			if (direction == bpmConstants.DIRECTION_NORTH)
			{
				r1 += 270;
			}
			else if (direction == bpmConstants.DIRECTION_WEST)
			{
				r1 += 180;
			}
			else if (direction == bpmConstants.DIRECTION_SOUTH)
			{
				r1 += 90;
			}

			// Bounds need to be rotated by 90 degrees for further computation
			if (direction == bpmConstants.DIRECTION_NORTH ||
				direction == bpmConstants.DIRECTION_SOUTH)
			{
				bounds.rotate90();
			}
		}

		var scale = this.view.scale;
		point = new bpmPoint(bounds.x + constraint.point.x * bounds.width + constraint.dx * scale,
				bounds.y + constraint.point.y * bounds.height + constraint.dy * scale);
		
		// Rotation for direction before projection on perimeter
		var r2 = vertex.style[bpmConstants.STYLE_ROTATION] || 0;
		
		if (constraint.perimeter)
		{
			if (r1 != 0)
			{
				// Only 90 degrees steps possible here so no trig needed
				var cos = 0;
				var sin = 0;
				
				if (r1 == 90)
				{
					sin = 1;
				}
				else if (r1 == 180)
				{
					cos = -1;
				}
				else if (r1 == 270)
				{
					sin = -1;
				}
				
		        point = bpmUtils.getRotatedPoint(point, cos, sin, cx);
			}
	
			point = this.view.getPerimeterPoint(vertex, point, false);
		}
		else
		{
			r2 += r1;
			
			if (this.getModel().isVertex(vertex.cell))
			{
				var flipH = vertex.style[bpmConstants.STYLE_FLIPH] == 1;
				var flipV = vertex.style[bpmConstants.STYLE_FLIPV] == 1;
				
				// Legacy support for stencilFlipH/V
				if (vertex.shape != null && vertex.shape.stencil != null)
				{
					flipH = (bpmUtils.getValue(vertex.style, 'stencilFlipH', 0) == 1) || flipH;
					flipV = (bpmUtils.getValue(vertex.style, 'stencilFlipV', 0) == 1) || flipV;
				}
				
				if (flipH)
				{
					point.x = 2 * bounds.getCenterX() - point.x;
				}
				
				if (flipV)
				{
					point.y = 2 * bounds.getCenterY() - point.y;
				}
			}
		}

		// Generic rotation after projection on perimeter
		if (r2 != 0 && point != null)
		{
	        var rad = bpmUtils.toRadians(r2);
	        var cos = Math.cos(rad);
	        var sin = Math.sin(rad);
	        
	        point = bpmUtils.getRotatedPoint(point, cos, sin, cx);
		}
	}
	
	if (round && point != null)
	{
		point.x = Math.round(point.x);
		point.y = Math.round(point.y);
	}

	return point;
};

bpmGraph.prototype.connectCell = function(edge, terminal, source, constraint)
{
	this.model.beginUpdate();
	try
	{
		var previous = this.model.getTerminal(edge, source);
		this.cellConnected(edge, terminal, source, constraint);
		this.fireEvent(new bpmEventObject(bpmEvent.CONNECT_CELL,
			'edge', edge, 'terminal', terminal, 'source', source,
			'previous', previous));
	}
	finally
	{
		this.model.endUpdate();
	}

	return edge;
};

bpmGraph.prototype.cellConnected = function(edge, terminal, source, constraint)
{
	if (edge != null)
	{
		this.model.beginUpdate();
		try
		{
			var previous = this.model.getTerminal(edge, source);

			// Updates the constraint
			this.setConnectionConstraint(edge, terminal, source, constraint);
			
			if (this.isPortsEnabled())
			{
				var id = null;
	
				if (this.isPort(terminal))
				{
					id = terminal.getId();
					terminal = this.getTerminalForPort(terminal, source);
				}
				
				var key = (source) ? bpmConstants.STYLE_SOURCE_PORT :
					bpmConstants.STYLE_TARGET_PORT;
				this.setCellStyles(key, id, [edge]);
			}
			
			this.model.setTerminal(edge, terminal, source);
			
			if (this.resetEdgesOnConnect)
			{
				this.resetEdge(edge);
			}

			this.fireEvent(new bpmEventObject(bpmEvent.CELL_CONNECTED,
				'edge', edge, 'terminal', terminal, 'source', source,
				'previous', previous));
		}
		finally
		{
			this.model.endUpdate();
		}
	}
};

bpmGraph.prototype.disconnectGraph = function(cells)
{
	if (cells != null)
	{
		this.model.beginUpdate();
		try
		{							
			var scale = this.view.scale;
			var tr = this.view.translate;
			
			// Fast lookup for finding cells in array
			var dict = new bpmDictionary();
			
			for (var i = 0; i < cells.length; i++)
			{
				dict.put(cells[i], true);
			}
			
			for (var i = 0; i < cells.length; i++)
			{
				if (this.model.isEdge(cells[i]))
				{
					var geo = this.model.getGeometry(cells[i]);
					
					if (geo != null)
					{
						var state = this.view.getState(cells[i]);
						var pstate = this.view.getState(
							this.model.getParent(cells[i]));
						
						if (state != null &&
							pstate != null)
						{
							geo = geo.clone();
							
							var dx = -pstate.origin.x;
							var dy = -pstate.origin.y;
							var pts = state.absolutePoints;

							var src = this.model.getTerminal(cells[i], true);
							
							if (src != null && this.isCellDisconnectable(cells[i], src, true))
							{
								while (src != null && !dict.get(src))
								{
									src = this.model.getParent(src);
								}
								
								if (src == null)
								{
									geo.setTerminalPoint(
										new bpmPoint(pts[0].x / scale - tr.x + dx,
											pts[0].y / scale - tr.y + dy), true);
									this.model.setTerminal(cells[i], null, true);
								}
							}
							
							var trg = this.model.getTerminal(cells[i], false);
							
							if (trg != null && this.isCellDisconnectable(cells[i], trg, false))
							{
								while (trg != null && !dict.get(trg))
								{
									trg = this.model.getParent(trg);
								}
								
								if (trg == null)
								{
									var n = pts.length - 1;
									geo.setTerminalPoint(
										new bpmPoint(pts[n].x / scale - tr.x + dx,
											pts[n].y / scale - tr.y + dy), false);
									this.model.setTerminal(cells[i], null, false);
								}
							}

							this.model.setGeometry(cells[i], geo);
						}
					}
				}
			}
		}
		finally
		{
			this.model.endUpdate();
		}
	}
};

bpmGraph.prototype.getCurrentRoot = function()
{
	return this.view.currentRoot;
};

bpmGraph.prototype.getTranslateForRoot = function(cell)
{
	return null;
};

bpmGraph.prototype.isPort = function(cell)
{
	return false;
};

bpmGraph.prototype.getTerminalForPort = function(cell, source)
{
	return this.model.getParent(cell);
};

bpmGraph.prototype.getChildOffsetForCell = function(cell)
{
	return null;
};

bpmGraph.prototype.enterGroup = function(cell)
{
	cell = cell || this.getSelectionCell();
	
	if (cell != null && this.isValidRoot(cell))
	{
		this.view.setCurrentRoot(cell);
		this.clearSelection();
	}
};

bpmGraph.prototype.exitGroup = function()
{
	var root = this.model.getRoot();
	var current = this.getCurrentRoot();
	
	if (current != null)
	{
		var next = this.model.getParent(current);
		
		while (next != root && !this.isValidRoot(next) &&
				this.model.getParent(next) != root)
		{
			next = this.model.getParent(next);
		}
		
		if (next == root || this.model.getParent(next) == root)
		{
			this.view.setCurrentRoot(null);
		}
		else
		{
			this.view.setCurrentRoot(next);
		}
		
		var state = this.view.getState(current);
		
		if (state != null)
		{
			this.setSelectionCell(current);
		}
	}
};

bpmGraph.prototype.home = function()
{
	var current = this.getCurrentRoot();
	
	if (current != null)
	{
		this.view.setCurrentRoot(null);
		var state = this.view.getState(current);
		
		if (state != null)
		{
			this.setSelectionCell(current);
		}
	}
};

bpmGraph.prototype.isValidRoot = function(cell)
{
	return (cell != null);
};

 bpmGraph.prototype.getGraphBounds = function()
 {
 	return this.view.getGraphBounds();
 };

bpmGraph.prototype.getCellBounds = function(cell, includeEdges, includeDescendants)
{
	var cells = [cell];
	
	if (includeEdges)
	{
		cells = cells.concat(this.model.getEdges(cell));
	}
	
	var result = this.view.getBounds(cells);
	
	if (includeDescendants)
	{
		var childCount = this.model.getChildCount(cell);
		
		for (var i = 0; i < childCount; i++)
		{
			var tmp = this.getCellBounds(this.model.getChildAt(cell, i),
				includeEdges, true);

			if (result != null)
			{
				result.add(tmp);
			}
			else
			{
				result = tmp;
			}
		}
	}
	
	return result;
};

bpmGraph.prototype.getBoundingBoxFromGeometry = function(cells, includeEdges)
{
	includeEdges = (includeEdges != null) ? includeEdges : false;
	var result = null;
	
	if (cells != null)
	{
		for (var i = 0; i < cells.length; i++)
		{
			if (includeEdges || this.model.isVertex(cells[i]))
			{
				var geo = this.getCellGeometry(cells[i]);
				
				if (geo != null)
				{
					var bbox = null;
					
					if (this.model.isEdge(cells[i]))
					{
						var addPoint = function(pt)
						{
							if (pt != null)
							{
								if (tmp == null)
								{
									tmp = new bpmRectangle(pt.x, pt.y, 0, 0);
								}
								else
								{
									tmp.add(new bpmRectangle(pt.x, pt.y, 0, 0));
								}
							}
						};
						
						if (this.model.getTerminal(cells[i], true) == null)
						{
							addPoint(geo.getTerminalPoint(true));
						}
						
						if (this.model.getTerminal(cells[i], false) == null)
						{
							addPoint(geo.getTerminalPoint(false));
						}
												
						var pts = geo.points;
						
						if (pts != null && pts.length > 0)
						{
							var tmp = new bpmRectangle(pts[0].x, pts[0].y, 0, 0);

							for (var j = 1; j < pts.length; j++)
							{
								addPoint(pts[j]);
							}
						}
						
						bbox = tmp;
					}
					else
					{
						var parent = this.model.getParent(cells[i]);
						
						if (geo.relative)
						{
							if (this.model.isVertex(parent) && parent != this.view.currentRoot)
							{
								var tmp = this.getBoundingBoxFromGeometry([parent], false);
								
								if (tmp != null)
								{
									bbox = new bpmRectangle(geo.x * tmp.width, geo.y * tmp.height, geo.width, geo.height);
									
									if (bpmUtils.indexOf(cells, parent) >= 0)
									{
										bbox.x += tmp.x;
										bbox.y += tmp.y;
									}
								}
							}
						}
						else
						{
							bbox = bpmRectangle.fromRectangle(geo);
							
							if (this.model.isVertex(parent) && bpmUtils.indexOf(cells, parent) >= 0)
							{
								var tmp = this.getBoundingBoxFromGeometry([parent], false);

								if (tmp != null)
								{
									bbox.x += tmp.x;
									bbox.y += tmp.y;
								}
							}
						}
						
						if (bbox != null && geo.offset != null)
						{
							bbox.x += geo.offset.x;
							bbox.y += geo.offset.y;
						}
					}
					
					if (bbox != null)
					{
						if (result == null)
						{
							result = bpmRectangle.fromRectangle(bbox);
						}
						else
						{
							result.add(bbox);
						}
					}
				}
			}
		}
	}
	
	return result;
};

bpmGraph.prototype.refresh = function(cell)
{
	this.view.clear(cell, cell == null);
	this.view.validate();
	this.sizeDidChange();
	this.fireEvent(new bpmEventObject(bpmEvent.REFRESH));
};

bpmGraph.prototype.snap = function(value)
{
	if (this.gridEnabled)
	{
		value = Math.round(value / this.gridSize ) * this.gridSize;
	}
	
	return value;
};

bpmGraph.prototype.panGraph = function(dx, dy)
{
	if (this.useScrollbarsForPanning && bpmUtils.hasScrollbars(this.container))
	{
		this.container.scrollLeft = -dx;
		this.container.scrollTop = -dy;
	}
	else
	{
		var canvas = this.view.getCanvas();
		
		if (this.dialect == bpmConstants.DIALECT_SVG)
		{
			if (dx == 0 && dy == 0)
			{
				if (bpmCore.IS_IE)
				{
					canvas.setAttribute('transform', 'translate(' + dx + ',' + dy + ')');
				}
				else
				{
					canvas.removeAttribute('transform');
				}
				
				if (this.shiftPreview1 != null)
				{
					var child = this.shiftPreview1.firstChild;
					
					while (child != null)
					{
						var next = child.nextSibling;
						this.container.appendChild(child);
						child = next;
					}

					if (this.shiftPreview1.parentNode != null)
					{
						this.shiftPreview1.parentNode.removeChild(this.shiftPreview1);
					}
					
					this.shiftPreview1 = null;
					
					this.container.appendChild(canvas.parentNode);
					
					child = this.shiftPreview2.firstChild;
					
					while (child != null)
					{
						var next = child.nextSibling;
						this.container.appendChild(child);
						child = next;
					}

					if (this.shiftPreview2.parentNode != null)
					{
						this.shiftPreview2.parentNode.removeChild(this.shiftPreview2);
					}
					
					this.shiftPreview2 = null;
				}
			}
			else
			{
				canvas.setAttribute('transform', 'translate(' + dx + ',' + dy + ')');
				
				if (this.shiftPreview1 == null)
				{
					this.shiftPreview1 = document.createElement('div');
					this.shiftPreview1.style.position = 'absolute';
					this.shiftPreview1.style.overflow = 'visible';
					
					this.shiftPreview2 = document.createElement('div');
					this.shiftPreview2.style.position = 'absolute';
					this.shiftPreview2.style.overflow = 'visible';

					var current = this.shiftPreview1;
					var child = this.container.firstChild;
					
					while (child != null)
					{
						var next = child.nextSibling;
						
						if (child != canvas.parentNode)
						{
							current.appendChild(child);
						}
						else
						{
							current = this.shiftPreview2;
						}
						
						child = next;
					}
					
					if (this.shiftPreview1.firstChild != null)
					{
						this.container.insertBefore(this.shiftPreview1, canvas.parentNode);
					}
					
					if (this.shiftPreview2.firstChild != null)
					{
						this.container.appendChild(this.shiftPreview2);
					}
				}
				
				this.shiftPreview1.style.left = dx + 'px';
				this.shiftPreview1.style.top = dy + 'px';
				this.shiftPreview2.style.left = dx + 'px';
				this.shiftPreview2.style.top = dy + 'px';
			}
		}
		else
		{
			canvas.style.left = dx + 'px';
			canvas.style.top = dy + 'px';
		}
		
		this.panDx = dx;
		this.panDy = dy;

		this.fireEvent(new bpmEventObject(bpmEvent.PAN));
	}
};

bpmGraph.prototype.zoomIn = function()
{
	this.zoom(this.zoomFactor);
};

bpmGraph.prototype.zoomOut = function()
{
	this.zoom(1 / this.zoomFactor);
};

bpmGraph.prototype.zoomActual = function()
{
	if (this.view.scale == 1)
	{
		this.view.setTranslate(0, 0);
	}
	else
	{
		this.view.translate.x = 0;
		this.view.translate.y = 0;

		this.view.setScale(1);
	}
};

bpmGraph.prototype.zoomTo = function(scale, center)
{
	this.zoom(scale / this.view.scale, center);
};

bpmGraph.prototype.center = function(horizontal, vertical, cx, cy)
{
	horizontal = (horizontal != null) ? horizontal : true;
	vertical = (vertical != null) ? vertical : true;
	cx = (cx != null) ? cx : 0.5;
	cy = (cy != null) ? cy : 0.5;
	
	var hasScrollbars = bpmUtils.hasScrollbars(this.container);
	var cw = this.container.clientWidth;
	var ch = this.container.clientHeight;
	var bounds = this.getGraphBounds();

	var t = this.view.translate;
	var s = this.view.scale;

	var dx = (horizontal) ? cw - bounds.width : 0;
	var dy = (vertical) ? ch - bounds.height : 0;
	
	if (!hasScrollbars)
	{
		this.view.setTranslate((horizontal) ? Math.floor(t.x - bounds.x * s + dx * cx / s) : t.x,
			(vertical) ? Math.floor(t.y - bounds.y * s + dy * cy / s) : t.y);
	}
	else
	{
		bounds.x -= t.x;
		bounds.y -= t.y;
	
		var sw = this.container.scrollWidth;
		var sh = this.container.scrollHeight;
		
		if (sw > cw)
		{
			dx = 0;
		}
		
		if (sh > ch)
		{
			dy = 0;
		}

		this.view.setTranslate(Math.floor(dx / 2 - bounds.x), Math.floor(dy / 2 - bounds.y));
		this.container.scrollLeft = (sw - cw) / 2;
		this.container.scrollTop = (sh - ch) / 2;
	}
};

bpmGraph.prototype.zoom = function(factor, center)
{
	center = (center != null) ? center : this.centerZoom;
	var scale = Math.round(this.view.scale * factor * 100) / 100;
	var state = this.view.getState(this.getSelectionCell());
	factor = scale / this.view.scale;
	
	if (this.keepSelectionVisibleOnZoom && state != null)
	{
		var rect = new bpmRectangle(state.x * factor, state.y * factor,
			state.width * factor, state.height * factor);
		
		this.view.scale = scale;
		
		if (!this.scrollRectToVisible(rect))
		{
			this.view.revalidate();
			
			this.view.setScale(scale);
		}
	}
	else
	{
		var hasScrollbars = bpmUtils.hasScrollbars(this.container);
		
		if (center && !hasScrollbars)
		{
			var dx = this.container.offsetWidth;
			var dy = this.container.offsetHeight;
			
			if (factor > 1)
			{
				var f = (factor - 1) / (scale * 2);
				dx *= -f;
				dy *= -f;
			}
			else
			{
				var f = (1 / factor - 1) / (this.view.scale * 2);
				dx *= f;
				dy *= f;
			}

			this.view.scaleAndTranslate(scale,
				this.view.translate.x + dx,
				this.view.translate.y + dy);
		}
		else
		{
			var tx = this.view.translate.x;
			var ty = this.view.translate.y;
			var sl = this.container.scrollLeft;
			var st = this.container.scrollTop;
			
			this.view.setScale(scale);
			
			if (hasScrollbars)
			{
				var dx = 0;
				var dy = 0;
				
				if (center)
				{
					dx = this.container.offsetWidth * (factor - 1) / 2;
					dy = this.container.offsetHeight * (factor - 1) / 2;
				}
				
				this.container.scrollLeft = (this.view.translate.x - tx) * this.view.scale + Math.round(sl * factor + dx);
				this.container.scrollTop = (this.view.translate.y - ty) * this.view.scale + Math.round(st * factor + dy);
			}
		}
	}
};

bpmGraph.prototype.zoomToRect = function(rect)
{
	var scaleX = this.container.clientWidth / rect.width;
	var scaleY = this.container.clientHeight / rect.height;
	var aspectFactor = scaleX / scaleY;

	rect.x = Math.max(0, rect.x);
	rect.y = Math.max(0, rect.y);
	var rectRight = Math.min(this.container.scrollWidth, rect.x + rect.width);
	var rectBottom = Math.min(this.container.scrollHeight, rect.y + rect.height);
	rect.width = rectRight - rect.x;
	rect.height = rectBottom - rect.y;

	if (aspectFactor < 1.0)
	{
		var newHeight = rect.height / aspectFactor;
		var deltaHeightBuffer = (newHeight - rect.height) / 2.0;
		rect.height = newHeight;
		
		var upperBuffer = Math.min(rect.y , deltaHeightBuffer);
		rect.y = rect.y - upperBuffer;
		
		rectBottom = Math.min(this.container.scrollHeight, rect.y + rect.height);
		rect.height = rectBottom - rect.y;
	}
	else
	{
		var newWidth = rect.width * aspectFactor;
		var deltaWidthBuffer = (newWidth - rect.width) / 2.0;
		rect.width = newWidth;
		
		var leftBuffer = Math.min(rect.x , deltaWidthBuffer);
		rect.x = rect.x - leftBuffer;
		
		rectRight = Math.min(this.container.scrollWidth, rect.x + rect.width);
		rect.width = rectRight - rect.x;
	}

	var scale = this.container.clientWidth / rect.width;
	var newScale = this.view.scale * scale;

	if (!bpmUtils.hasScrollbars(this.container))
	{
		this.view.scaleAndTranslate(newScale, (this.view.translate.x - rect.x / this.view.scale), (this.view.translate.y - rect.y / this.view.scale));
	}
	else
	{
		this.view.setScale(newScale);
		this.container.scrollLeft = Math.round(rect.x * scale);
		this.container.scrollTop = Math.round(rect.y * scale);
	}
};

bpmGraph.prototype.scrollCellToVisible = function(cell, center)
{
	var x = -this.view.translate.x;
	var y = -this.view.translate.y;

	var state = this.view.getState(cell);

	if (state != null)
	{
		var bounds = new bpmRectangle(x + state.x, y + state.y, state.width,
			state.height);

		if (center && this.container != null)
		{
			var w = this.container.clientWidth;
			var h = this.container.clientHeight;

			bounds.x = bounds.getCenterX() - w / 2;
			bounds.width = w;
			bounds.y = bounds.getCenterY() - h / 2;
			bounds.height = h;
		}
		
		var tr = new bpmPoint(this.view.translate.x, this.view.translate.y);

		if (this.scrollRectToVisible(bounds))
		{
			// Triggers an update via the view's event source
			var tr2 = new bpmPoint(this.view.translate.x, this.view.translate.y);
			this.view.translate.x = tr.x;
			this.view.translate.y = tr.y;
			this.view.setTranslate(tr2.x, tr2.y);
		}
	}
};

bpmGraph.prototype.scrollRectToVisible = function(rect)
{
	var isChanged = false;
	
	if (rect != null)
	{
		var w = this.container.offsetWidth;
		var h = this.container.offsetHeight;

        var widthLimit = Math.min(w, rect.width);
        var heightLimit = Math.min(h, rect.height);

		if (bpmUtils.hasScrollbars(this.container))
		{
			var c = this.container;
			rect.x += this.view.translate.x;
			rect.y += this.view.translate.y;
			var dx = c.scrollLeft - rect.x;
			var ddx = Math.max(dx - c.scrollLeft, 0);

			if (dx > 0)
			{
				c.scrollLeft -= dx + 2;
			}
			else
			{
				dx = rect.x + widthLimit - c.scrollLeft - c.clientWidth;

				if (dx > 0)
				{
					c.scrollLeft += dx + 2;
				}
			}

			var dy = c.scrollTop - rect.y;
			var ddy = Math.max(0, dy - c.scrollTop);

			if (dy > 0)
			{
				c.scrollTop -= dy + 2;
			}
			else
			{
				dy = rect.y + heightLimit - c.scrollTop - c.clientHeight;

				if (dy > 0)
				{
					c.scrollTop += dy + 2;
				}
			}

			if (!this.useScrollbarsForPanning && (ddx != 0 || ddy != 0))
			{
				this.view.setTranslate(ddx, ddy);
			}
		}
		else
		{
			var x = -this.view.translate.x;
			var y = -this.view.translate.y;

			var s = this.view.scale;

			if (rect.x + widthLimit > x + w)
			{
				this.view.translate.x -= (rect.x + widthLimit - w - x) / s;
				isChanged = true;
			}

			if (rect.y + heightLimit > y + h)
			{
				this.view.translate.y -= (rect.y + heightLimit - h - y) / s;
				isChanged = true;
			}

			if (rect.x < x)
			{
				this.view.translate.x += (x - rect.x) / s;
				isChanged = true;
			}

			if (rect.y  < y)
			{
				this.view.translate.y += (y - rect.y) / s;
				isChanged = true;
			}

			if (isChanged)
			{
				this.view.refresh();
				
				if (this.selectionCellsHandler != null)
				{
					this.selectionCellsHandler.refresh();
				}
			}
		}
	}

	return isChanged;
};

bpmGraph.prototype.getCellGeometry = function(cell)
{
	return this.model.getGeometry(cell);
};

bpmGraph.prototype.isCellVisible = function(cell)
{
	return this.model.isVisible(cell);
};

bpmGraph.prototype.isCellCollapsed = function(cell)
{
	return this.model.isCollapsed(cell);
};

bpmGraph.prototype.isCellConnectable = function(cell)
{
	return this.model.isConnectable(cell);
};

bpmGraph.prototype.isOrthogonal = function(edge)
{
	var orthogonal = edge.style[bpmConstants.STYLE_ORTHOGONAL];
	
	if (orthogonal != null)
	{
		return orthogonal;
	}
	
	var tmp = this.view.getEdgeStyle(edge);
	
	return tmp == bpmEdgeStyle.SegmentConnector ||
		tmp == bpmEdgeStyle.ElbowConnector ||
		tmp == bpmEdgeStyle.SideToSide ||
		tmp == bpmEdgeStyle.TopToBottom ||
		tmp == bpmEdgeStyle.EntityRelation ||
		tmp == bpmEdgeStyle.OrthConnector;
};

bpmGraph.prototype.isLoop = function(state)
{
	var src = state.getVisibleTerminalState(true);
	var trg = state.getVisibleTerminalState(false);
	
	return (src != null && src == trg);
};

bpmGraph.prototype.isCloneEvent = function(evt)
{
	return bpmEvent.isControlDown(evt);
};

bpmGraph.prototype.isTransparentClickEvent = function(evt)
{
	return false;
};

bpmGraph.prototype.isToggleEvent = function(evt)
{
	return (bpmCore.IS_MAC) ? bpmEvent.isMetaDown(evt) : bpmEvent.isControlDown(evt);
};

bpmGraph.prototype.isGridEnabledEvent = function(evt)
{
	return evt != null && !bpmEvent.isAltDown(evt);
};

bpmGraph.prototype.isConstrainedEvent = function(evt)
{
	return bpmEvent.isShiftDown(evt);
};

bpmGraph.prototype.isIgnoreTerminalEvent = function(evt)
{
	return false;
};

bpmGraph.prototype.validationAlert = function(message)
{
	bpmUtils.alert(message);
};

bpmGraph.prototype.isEdgeValid = function(edge, source, target)
{
	return this.getEdgeValidationError(edge, source, target) == null;
};

bpmGraph.prototype.getEdgeValidationError = function(edge, source, target)
{
	if (edge != null && !this.isAllowDanglingEdges() && (source == null || target == null))
	{
		return '';
	}
	
	if (edge != null && this.model.getTerminal(edge, true) == null &&
		this.model.getTerminal(edge, false) == null)	
	{
		return null;
	}
	
	if (!this.allowLoops && source == target && source != null)
	{
		return '';
	}
	
	if (!this.isValidConnection(source, target))
	{
		return '';
	}

	if (source != null && target != null)
	{
		var error = '';
			
		if (!this.multigraph)
		{
			var tmp = this.model.getEdgesBetween(source, target, true);
			
			if (tmp.length > 1 || (tmp.length == 1 && tmp[0] != edge))
			{
				error += (bpmResources.get(this.alreadyConnectedResource) ||
					this.alreadyConnectedResource)+'\n';
			}
		}

		var sourceOut = this.model.getDirectedEdgeCount(source, true, edge);
		var targetIn = this.model.getDirectedEdgeCount(target, false, edge);

		if (this.multiplicities != null)
		{
			for (var i = 0; i < this.multiplicities.length; i++)
			{
				var err = this.multiplicities[i].check(this, edge, source,
					target, sourceOut, targetIn);
				
				if (err != null)
				{
					error += err;
				}
			}
		}

		var err = this.validateEdge(edge, source, target);
		
		if (err != null)
		{
			error += err;
		}
		
		return (error.length > 0) ? error : null;
	}
	
	return (this.allowDanglingEdges) ? null : '';
};

bpmGraph.prototype.validateEdge = function(edge, source, target)
{
	return null;
};

bpmGraph.prototype.validateGraph = function(cell, context)
{
	cell = (cell != null) ? cell : this.model.getRoot();
	context = (context != null) ? context : new Object();
	
	var isValid = true;
	var childCount = this.model.getChildCount(cell);
	
	for (var i = 0; i < childCount; i++)
	{
		var tmp = this.model.getChildAt(cell, i);
		var ctx = context;
		
		if (this.isValidRoot(tmp))
		{
			ctx = new Object();
		}
		
		var warn = this.validateGraph(tmp, ctx);
		
		if (warn != null)
		{
			this.setCellWarning(tmp, warn.replace(/\n/g, '<br>'));
		}
		else
		{
			this.setCellWarning(tmp, null);
		}
		
		isValid = isValid && warn == null;
	}
	
	var warning = '';
	
	if (this.isCellCollapsed(cell) && !isValid)
	{
		warning += (bpmResources.get(this.containsValidationErrorsResource) ||
			this.containsValidationErrorsResource) + '\n';
	}
	
	if (this.model.isEdge(cell))
	{
		warning += this.getEdgeValidationError(cell,
		this.model.getTerminal(cell, true),
		this.model.getTerminal(cell, false)) || '';
	}
	else
	{
		warning += this.getCellValidationError(cell) || '';
	}
	
	var err = this.validateCell(cell, context);
	
	if (err != null)
	{
		warning += err;
	}
	
	if (this.model.getParent(cell) == null)
	{
		this.view.validate();
	}

	return (warning.length > 0 || !isValid) ? warning : null;
};

bpmGraph.prototype.getCellValidationError = function(cell)
{
	var outCount = this.model.getDirectedEdgeCount(cell, true);
	var inCount = this.model.getDirectedEdgeCount(cell, false);
	var value = this.model.getValue(cell);
	var error = '';

	if (this.multiplicities != null)
	{
		for (var i = 0; i < this.multiplicities.length; i++)
		{
			var rule = this.multiplicities[i];
			
			if (rule.source && bpmUtils.isNode(value, rule.type,
				rule.attr, rule.value) && (outCount > rule.max ||
				outCount < rule.min))
			{
				error += rule.countError + '\n';
			}
			else if (!rule.source && bpmUtils.isNode(value, rule.type,
					rule.attr, rule.value) && (inCount > rule.max ||
					inCount < rule.min))
			{
				error += rule.countError + '\n';
			}
		}
	}

	return (error.length > 0) ? error : null;
};

bpmGraph.prototype.validateCell = function(cell, context)
{
	return null;
};

bpmGraph.prototype.getBackgroundImage = function()
{
	return this.backgroundImage;
};

bpmGraph.prototype.setBackgroundImage = function(image)
{
	this.backgroundImage = image;
};

bpmGraph.prototype.getFoldingImage = function(state)
{
	if (state != null && this.foldingEnabled && !this.getModel().isEdge(state.cell))
	{
		var tmp = this.isCellCollapsed(state.cell);
		
		if (this.isCellFoldable(state.cell, !tmp))
		{
			return (tmp) ? this.collapsedImage : this.expandedImage;
		}
	}
	
	return null;
};

bpmGraph.prototype.convertValueToString = function(cell)
{
	var value = this.model.getValue(cell);
	
	if (value != null)
	{
		if (bpmUtils.isNode(value))
		{
			return value.nodeName;
		}
		else if (typeof(value.toString) == 'function')
		{
			return value.toString();
		}
	}
	
	return '';
};

bpmGraph.prototype.getLabel = function(cell)
{
	var result = '';
	
	if (this.labelsVisible && cell != null)
	{
		var state = this.view.getState(cell);
		var style = (state != null) ? state.style : this.getCellStyle(cell);
		
		if (!bpmUtils.getValue(style, bpmConstants.STYLE_NOLABEL, false))
		{
			result = this.convertValueToString(cell);
		}
	}
	
	return result;
};

bpmGraph.prototype.isHtmlLabel = function(cell)
{
	return this.isHtmlLabels();
};
 
bpmGraph.prototype.isHtmlLabels = function()
{
	return this.htmlLabels;
};
 
bpmGraph.prototype.setHtmlLabels = function(value)
{
	this.htmlLabels = value;
};

bpmGraph.prototype.isWrapping = function(cell)
{
	var state = this.view.getState(cell);
	var style = (state != null) ? state.style : this.getCellStyle(cell);

	return (style != null) ? style[bpmConstants.STYLE_WHITE_SPACE] == 'wrap' : false;
};

bpmGraph.prototype.isLabelClipped = function(cell)
{
	var state = this.view.getState(cell);
	var style = (state != null) ? state.style : this.getCellStyle(cell);

	return (style != null) ? style[bpmConstants.STYLE_OVERFLOW] == 'hidden' : false;
};

bpmGraph.prototype.getTooltip = function(state, node, x, y)
{
	var tip = null;
	
	if (state != null)
	{
		if (state.control != null && (node == state.control.node ||
			node.parentNode == state.control.node))
		{
			tip = this.collapseExpandResource;
			tip = bpmUtils.htmlEntities(bpmResources.get(tip) || tip).replace(/\\n/g, '<br>');
		}

		if (tip == null && state.overlays != null)
		{
			state.overlays.visit(function(id, shape)
			{
				if (tip == null && (node == shape.node || node.parentNode == shape.node))
				{
					tip = shape.overlay.toString();
				}
			});
		}
		
		if (tip == null)
		{
			var handler = this.selectionCellsHandler.getHandler(state.cell);
			
			if (handler != null && typeof(handler.getTooltipForNode) == 'function')
			{
				tip = handler.getTooltipForNode(node);
			}
		}
		
		if (tip == null)
		{
			tip = this.getTooltipForCell(state.cell);
		}
	}
	
	return tip;
};

bpmGraph.prototype.getTooltipForCell = function(cell)
{
	var tip = null;
	
	if (cell != null && cell.getTooltip != null)
	{
		tip = cell.getTooltip();
	}
	else
	{
		tip = this.convertValueToString(cell);
	}
	
	return tip;
};

bpmGraph.prototype.getLinkForCell = function(cell)
{
	return null;
};

bpmGraph.prototype.getCursorForMouseEvent = function(me)
{
	return this.getCursorForCell(me.getCell());
};

bpmGraph.prototype.getCursorForCell = function(cell)
{
	return null;
};

bpmGraph.prototype.getStartSize = function(swimlane)
{
	var result = new bpmRectangle();
	var state = this.view.getState(swimlane);
	var style = (state != null) ? state.style : this.getCellStyle(swimlane);
	
	if (style != null)
	{
		var size = parseInt(bpmUtils.getValue(style,
			bpmConstants.STYLE_STARTSIZE, bpmConstants.DEFAULT_STARTSIZE));
		
		if (bpmUtils.getValue(style, bpmConstants.STYLE_HORIZONTAL, true))
		{
			result.height = size;
		}
		else
		{
			result.width = size;
		}
	}
	
	return result;
};

bpmGraph.prototype.getImage = function(state)
{
	return (state != null && state.style != null) ? state.style[bpmConstants.STYLE_IMAGE] : null;
};

bpmGraph.prototype.getVerticalAlign = function(state)
{
	return (state != null && state.style != null) ?
		(state.style[bpmConstants.STYLE_VERTICAL_ALIGN] ||
		bpmConstants.ALIGN_MIDDLE) : null;
};

bpmGraph.prototype.getIndicatorColor = function(state)
{
	return (state != null && state.style != null) ? state.style[bpmConstants.STYLE_INDICATOR_COLOR] : null;
};

bpmGraph.prototype.getIndicatorGradientColor = function(state)
{
	return (state != null && state.style != null) ? state.style[bpmConstants.STYLE_INDICATOR_GRADIENTCOLOR] : null;
};

bpmGraph.prototype.getIndicatorShape = function(state)
{
	return (state != null && state.style != null) ? state.style[bpmConstants.STYLE_INDICATOR_SHAPE] : null;
};

bpmGraph.prototype.getIndicatorImage = function(state)
{
	return (state != null && state.style != null) ? state.style[bpmConstants.STYLE_INDICATOR_IMAGE] : null;
};

bpmGraph.prototype.getBorder = function()
{
	return this.border;
};

bpmGraph.prototype.setBorder = function(value)
{
	this.border = value;
};

bpmGraph.prototype.isSwimlane = function (cell)
{
	if (cell != null)
	{
		if (this.model.getParent(cell) != this.model.getRoot())
		{
			var state = this.view.getState(cell);
			var style = (state != null) ? state.style : this.getCellStyle(cell);

			if (style != null && !this.model.isEdge(cell))
			{
				return style[bpmConstants.STYLE_SHAPE] == bpmConstants.SHAPE_SWIMLANE;
			}
		}
	}
	
	return false;
};

bpmGraph.prototype.isResizeContainer = function()
{
	return this.resizeContainer;
};

bpmGraph.prototype.setResizeContainer = function(value)
{
	this.resizeContainer = value;
};

bpmGraph.prototype.isEnabled = function()
{
	return this.enabled;
};

bpmGraph.prototype.setEnabled = function(value)
{
	this.enabled = value;
};

bpmGraph.prototype.isEscapeEnabled = function()
{
	return this.escapeEnabled;
};

bpmGraph.prototype.setEscapeEnabled = function(value)
{
	this.escapeEnabled = value;
};

bpmGraph.prototype.isInvokesStopCellEditing = function()
{
	return this.invokesStopCellEditing;
};

bpmGraph.prototype.setInvokesStopCellEditing = function(value)
{
	this.invokesStopCellEditing = value;
};

bpmGraph.prototype.isEnterStopsCellEditing = function()
{
	return this.enterStopsCellEditing;
};

bpmGraph.prototype.setEnterStopsCellEditing = function(value)
{
	this.enterStopsCellEditing = value;
};

bpmGraph.prototype.isCellLocked = function(cell)
{
	var geometry = this.model.getGeometry(cell);
	
	return this.isCellsLocked() || (geometry != null && this.model.isVertex(cell) && geometry.relative);
};

bpmGraph.prototype.isCellsLocked = function()
{
	return this.cellsLocked;
};

bpmGraph.prototype.setCellsLocked = function(value)
{
	this.cellsLocked = value;
};

bpmGraph.prototype.getCloneableCells = function(cells)
{
	return this.model.filterCells(cells, bpmUtils.bind(this, function(cell)
	{
		return this.isCellCloneable(cell);
	}));
};

bpmGraph.prototype.isCellCloneable = function(cell)
{
	var state = this.view.getState(cell);
	var style = (state != null) ? state.style : this.getCellStyle(cell);

	return this.isCellsCloneable() && style[bpmConstants.STYLE_CLONEABLE] != 0;
};

bpmGraph.prototype.isCellsCloneable = function()
{
	return this.cellsCloneable;
};

bpmGraph.prototype.setCellsCloneable = function(value)
{
	this.cellsCloneable = value;
};

bpmGraph.prototype.getExportableCells = function(cells)
{
	return this.model.filterCells(cells, bpmUtils.bind(this, function(cell)
	{
		return this.canExportCell(cell);
	}));
};

bpmGraph.prototype.canExportCell = function(cell)
{
	return this.exportEnabled;
};

bpmGraph.prototype.getImportableCells = function(cells)
{
	return this.model.filterCells(cells, bpmUtils.bind(this, function(cell)
	{
		return this.canImportCell(cell);
	}));
};

bpmGraph.prototype.canImportCell = function(cell)
{
	return this.importEnabled;
};

bpmGraph.prototype.isCellSelectable = function(cell)
{
	return this.isCellsSelectable();
};

bpmGraph.prototype.isCellsSelectable = function()
{
	return this.cellsSelectable;
};

bpmGraph.prototype.setCellsSelectable = function(value)
{
	this.cellsSelectable = value;
};

bpmGraph.prototype.getDeletableCells = function(cells)
{
	return this.model.filterCells(cells, bpmUtils.bind(this, function(cell)
	{
		return this.isCellDeletable(cell);
	}));
};

bpmGraph.prototype.isCellDeletable = function(cell)
{
	var state = this.view.getState(cell);
	var style = (state != null) ? state.style : this.getCellStyle(cell);
	
	return this.isCellsDeletable() && style[bpmConstants.STYLE_DELETABLE] != 0;
};

bpmGraph.prototype.isCellsDeletable = function()
{
	return this.cellsDeletable;
};

bpmGraph.prototype.setCellsDeletable = function(value)
{
	this.cellsDeletable = value;
};

bpmGraph.prototype.isLabelMovable = function(cell)
{
	return !this.isCellLocked(cell) &&
		((this.model.isEdge(cell) && this.edgeLabelsMovable) ||
		(this.model.isVertex(cell) && this.vertexLabelsMovable));
};

bpmGraph.prototype.isCellRotatable = function(cell)
{
	var state = this.view.getState(cell);
	var style = (state != null) ? state.style : this.getCellStyle(cell);
	
	return style[bpmConstants.STYLE_ROTATABLE] != 0;
};

bpmGraph.prototype.getMovableCells = function(cells)
{
	return this.model.filterCells(cells, bpmUtils.bind(this, function(cell)
	{
		return this.isCellMovable(cell);
	}));
};

bpmGraph.prototype.isCellMovable = function(cell)
{
	var state = this.view.getState(cell);
	var style = (state != null) ? state.style : this.getCellStyle(cell);
	
	return this.isCellsMovable() && !this.isCellLocked(cell) && style[bpmConstants.STYLE_MOVABLE] != 0;
};

bpmGraph.prototype.isCellsMovable = function()
{
	return this.cellsMovable;
};

bpmGraph.prototype.setCellsMovable = function(value)
{
	this.cellsMovable = value;
};

bpmGraph.prototype.isGridEnabled = function()
{
	return this.gridEnabled;
};

bpmGraph.prototype.setGridEnabled = function(value)
{
	this.gridEnabled = value;
};

bpmGraph.prototype.isPortsEnabled = function()
{
	return this.portsEnabled;
};

bpmGraph.prototype.setPortsEnabled = function(value)
{
	this.portsEnabled = value;
};

bpmGraph.prototype.getGridSize = function()
{
	return this.gridSize;
};

bpmGraph.prototype.setGridSize = function(value)
{
	this.gridSize = value;
};

bpmGraph.prototype.getTolerance = function()
{
	return this.tolerance;
};

bpmGraph.prototype.setTolerance = function(value)
{
	this.tolerance = value;
};

bpmGraph.prototype.isVertexLabelsMovable = function()
{
	return this.vertexLabelsMovable;
};

bpmGraph.prototype.setVertexLabelsMovable = function(value)
{
	this.vertexLabelsMovable = value;
};

bpmGraph.prototype.isEdgeLabelsMovable = function()
{
	return this.edgeLabelsMovable;
};

bpmGraph.prototype.setEdgeLabelsMovable = function(value)
{
	this.edgeLabelsMovable = value;
};

bpmGraph.prototype.isSwimlaneNesting = function()
{
	return this.swimlaneNesting;
};

bpmGraph.prototype.setSwimlaneNesting = function(value)
{
	this.swimlaneNesting = value;
};

bpmGraph.prototype.isSwimlaneSelectionEnabled = function()
{
	return this.swimlaneSelectionEnabled;
};

bpmGraph.prototype.setSwimlaneSelectionEnabled = function(value)
{
	this.swimlaneSelectionEnabled = value;
};

bpmGraph.prototype.isMultigraph = function()
{
	return this.multigraph;
};

bpmGraph.prototype.setMultigraph = function(value)
{
	this.multigraph = value;
};

bpmGraph.prototype.isAllowLoops = function()
{
	return this.allowLoops;
};

bpmGraph.prototype.setAllowDanglingEdges = function(value)
{
	this.allowDanglingEdges = value;
};

bpmGraph.prototype.isAllowDanglingEdges = function()
{
	return this.allowDanglingEdges;
};

bpmGraph.prototype.setConnectableEdges = function(value)
{
	this.connectableEdges = value;
};

bpmGraph.prototype.isConnectableEdges = function()
{
	return this.connectableEdges;
};

bpmGraph.prototype.setCloneInvalidEdges = function(value)
{
	this.cloneInvalidEdges = value;
};

bpmGraph.prototype.isCloneInvalidEdges = function()
{
	return this.cloneInvalidEdges;
};

bpmGraph.prototype.setAllowLoops = function(value)
{
	this.allowLoops = value;
};

bpmGraph.prototype.isDisconnectOnMove = function()
{
	return this.disconnectOnMove;
};

bpmGraph.prototype.setDisconnectOnMove = function(value)
{
	this.disconnectOnMove = value;
};

bpmGraph.prototype.isDropEnabled = function()
{
	return this.dropEnabled;
};

bpmGraph.prototype.setDropEnabled = function(value)
{
	this.dropEnabled = value;
};

bpmGraph.prototype.isSplitEnabled = function()
{
	return this.splitEnabled;
};

bpmGraph.prototype.setSplitEnabled = function(value)
{
	this.splitEnabled = value;
};

bpmGraph.prototype.isCellResizable = function(cell)
{
	var state = this.view.getState(cell);
	var style = (state != null) ? state.style : this.getCellStyle(cell);

	return this.isCellsResizable() && !this.isCellLocked(cell) &&
		bpmUtils.getValue(style, bpmConstants.STYLE_RESIZABLE, '1') != '0';
};

bpmGraph.prototype.isCellsResizable = function()
{
	return this.cellsResizable;
};

bpmGraph.prototype.setCellsResizable = function(value)
{
	this.cellsResizable = value;
};

bpmGraph.prototype.isTerminalPointMovable = function(cell, source)
{
	return true;
};

bpmGraph.prototype.isCellBendable = function(cell)
{
	var state = this.view.getState(cell);
	var style = (state != null) ? state.style : this.getCellStyle(cell);
	
	return this.isCellsBendable() && !this.isCellLocked(cell) && style[bpmConstants.STYLE_BENDABLE] != 0;
};

bpmGraph.prototype.isCellsBendable = function()
{
	return this.cellsBendable;
};

bpmGraph.prototype.setCellsBendable = function(value)
{
	this.cellsBendable = value;
};

bpmGraph.prototype.isCellEditable = function(cell)
{
	var state = this.view.getState(cell);
	var style = (state != null) ? state.style : this.getCellStyle(cell);
	
	return this.isCellsEditable() && !this.isCellLocked(cell) && style[bpmConstants.STYLE_EDITABLE] != 0;
};

bpmGraph.prototype.isCellsEditable = function()
{
	return this.cellsEditable;
};

bpmGraph.prototype.setCellsEditable = function(value)
{
	this.cellsEditable = value;
};

bpmGraph.prototype.isCellDisconnectable = function(cell, terminal, source)
{
	return this.isCellsDisconnectable() && !this.isCellLocked(cell);
};

bpmGraph.prototype.isCellsDisconnectable = function()
{
	return this.cellsDisconnectable;
};

bpmGraph.prototype.setCellsDisconnectable = function(value)
{
	this.cellsDisconnectable = value;
};

bpmGraph.prototype.isValidSource = function(cell)
{
	return (cell == null && this.allowDanglingEdges) ||
		(cell != null && (!this.model.isEdge(cell) ||
		this.connectableEdges) && this.isCellConnectable(cell));
};

bpmGraph.prototype.isValidTarget = function(cell)
{
	return this.isValidSource(cell);
};

bpmGraph.prototype.isValidConnection = function(source, target)
{
	return this.isValidSource(source) && this.isValidTarget(target);
};

bpmGraph.prototype.setConnectable = function(connectable)
{
	this.connectionHandler.setEnabled(connectable);
};
	
bpmGraph.prototype.isConnectable = function()
{
	return this.connectionHandler.isEnabled();
};

bpmGraph.prototype.setTooltips = function (enabled)
{
	this.tooltipHandler.setEnabled(enabled);
};

bpmGraph.prototype.setPanning = function(enabled)
{
	this.panningHandler.panningEnabled = enabled;
};

bpmGraph.prototype.isEditing = function(cell)
{
	if (this.cellEditor != null)
	{
		var editingCell = this.cellEditor.getEditingCell();
		
		return (cell == null) ? editingCell != null : cell == editingCell;
	}
	
	return false;
};

bpmGraph.prototype.isAutoSizeCell = function(cell)
{
	var state = this.view.getState(cell);
	var style = (state != null) ? state.style : this.getCellStyle(cell);
	
	return this.isAutoSizeCells() || style[bpmConstants.STYLE_AUTOSIZE] == 1;
};

bpmGraph.prototype.isAutoSizeCells = function()
{
	return this.autoSizeCells;
};

bpmGraph.prototype.setAutoSizeCells = function(value)
{
	this.autoSizeCells = value;
};

bpmGraph.prototype.isExtendParent = function(cell)
{
	return !this.getModel().isEdge(cell) && this.isExtendParents();
};

bpmGraph.prototype.isExtendParents = function()
{
	return this.extendParents;
};

bpmGraph.prototype.setExtendParents = function(value)
{
	this.extendParents = value;
};

bpmGraph.prototype.isExtendParentsOnAdd = function(cell)
{
	return this.extendParentsOnAdd;
};

bpmGraph.prototype.setExtendParentsOnAdd = function(value)
{
	this.extendParentsOnAdd = value;
};

bpmGraph.prototype.isExtendParentsOnMove = function()
{
	return this.extendParentsOnMove;
};

bpmGraph.prototype.setExtendParentsOnMove = function(value)
{
	this.extendParentsOnMove = value;
};

bpmGraph.prototype.isRecursiveResize = function(state)
{
	return this.recursiveResize;
};

bpmGraph.prototype.setRecursiveResize = function(value)
{
	this.recursiveResize = value;
};

bpmGraph.prototype.isConstrainChild = function(cell)
{
	return this.isConstrainChildren() && !this.getModel().isEdge(this.getModel().getParent(cell));
};

bpmGraph.prototype.isConstrainChildren = function()
{
	return this.constrainChildren;
};

bpmGraph.prototype.setConstrainChildren = function(value)
{
	this.constrainChildren = value;
};

bpmGraph.prototype.isConstrainRelativeChildren = function()
{
	return this.constrainRelativeChildren;
};

bpmGraph.prototype.setConstrainRelativeChildren = function(value)
{
	this.constrainRelativeChildren = value;
};

bpmGraph.prototype.isAllowNegativeCoordinates = function()
{
	return this.allowNegativeCoordinates;
};

bpmGraph.prototype.setAllowNegativeCoordinates = function(value)
{
	this.allowNegativeCoordinates = value;
};

bpmGraph.prototype.getOverlap = function(cell)
{
	return (this.isAllowOverlapParent(cell)) ? this.defaultOverlap : 0;
};

bpmGraph.prototype.isAllowOverlapParent = function(cell)
{
	return false;
};

bpmGraph.prototype.getFoldableCells = function(cells, collapse)
{
	return this.model.filterCells(cells, bpmUtils.bind(this, function(cell)
	{
		return this.isCellFoldable(cell, collapse);
	}));
};

bpmGraph.prototype.isCellFoldable = function(cell, collapse)
{
	var state = this.view.getState(cell);
	var style = (state != null) ? state.style : this.getCellStyle(cell);
	
	return this.model.getChildCount(cell) > 0 && style[bpmConstants.STYLE_FOLDABLE] != 0;
};

bpmGraph.prototype.isValidDropTarget = function(cell, cells, evt)
{
	return cell != null && ((this.isSplitEnabled() &&
		this.isSplitTarget(cell, cells, evt)) || (!this.model.isEdge(cell) &&
		(this.isSwimlane(cell) || (this.model.getChildCount(cell) > 0 &&
		!this.isCellCollapsed(cell)))));
};

bpmGraph.prototype.isSplitTarget = function(target, cells, evt)
{
	if (this.model.isEdge(target) && cells != null && cells.length == 1 &&
		this.isCellConnectable(cells[0]) && this.getEdgeValidationError(target,
			this.model.getTerminal(target, true), cells[0]) == null)
	{
		var src = this.model.getTerminal(target, true);
		var trg = this.model.getTerminal(target, false);

		return (!this.model.isAncestor(cells[0], src) &&
				!this.model.isAncestor(cells[0], trg));
	}

	return false;
};

bpmGraph.prototype.getDropTarget = function(cells, evt, cell, clone)
{
	if (!this.isSwimlaneNesting())
	{
		for (var i = 0; i < cells.length; i++)
		{
			if (this.isSwimlane(cells[i]))
			{
				return null;
			}
		}
	}

	var pt = bpmUtils.convertPoint(this.container,
		bpmEvent.getClientX(evt), bpmEvent.getClientY(evt));
	pt.x -= this.panDx;
	pt.y -= this.panDy;
	var swimlane = this.getSwimlaneAt(pt.x, pt.y);
	
	if (cell == null)
	{
		cell = swimlane;
	}
	else if (swimlane != null)
	{
		var tmp = this.model.getParent(swimlane);
		
		while (tmp != null && this.isSwimlane(tmp) && tmp != cell)
		{
			tmp = this.model.getParent(tmp);
		}
		
		if (tmp == cell)
		{
			cell = swimlane;
		}
	}
	
	while (cell != null && !this.isValidDropTarget(cell, cells, evt) &&
		!this.model.isLayer(cell))
	{
		cell = this.model.getParent(cell);
	}
	
	if (clone == null || !clone)
	{
		var parent = cell;
		
		while (parent != null && bpmUtils.indexOf(cells, parent) < 0)
		{
			parent = this.model.getParent(parent);
		}
	}

	return (!this.model.isLayer(cell) && parent == null) ? cell : null;
};

bpmGraph.prototype.getDefaultParent = function()
{
	var parent = this.getCurrentRoot();
	
	if (parent == null)
	{
		parent = this.defaultParent;
		
		if (parent == null)
		{
			var root = this.model.getRoot();
			parent = this.model.getChildAt(root, 0);
		}
	}
	
	return parent;
};

bpmGraph.prototype.setDefaultParent = function(cell)
{
	this.defaultParent = cell;
};

bpmGraph.prototype.getSwimlane = function(cell)
{
	while (cell != null && !this.isSwimlane(cell))
	{
		cell = this.model.getParent(cell);
	}
	
	return cell;
};

bpmGraph.prototype.getSwimlaneAt = function (x, y, parent)
{
	parent = parent || this.getDefaultParent();
	
	if (parent != null)
	{
		var childCount = this.model.getChildCount(parent);
		
		for (var i = 0; i < childCount; i++)
		{
			var child = this.model.getChildAt(parent, i);
			var result = this.getSwimlaneAt(x, y, child);
			
			if (result != null)
			{
				return result;
			}
			else if (this.isSwimlane(child))
			{
				var state = this.view.getState(child);
				
				if (this.intersects(state, x, y))
				{
					return child;
				}
			}
		}
	}
	
	return null;
};

bpmGraph.prototype.getCellAt = function(x, y, parent, vertices, edges, ignoreFn)
{
	vertices = (vertices != null) ? vertices : true;
	edges = (edges != null) ? edges : true;

	if (parent == null)
	{
		parent = this.getCurrentRoot();
		
		if (parent == null)
		{
			parent = this.getModel().getRoot();
		}
	}

	if (parent != null)
	{
		var childCount = this.model.getChildCount(parent);
		
		for (var i = childCount - 1; i >= 0; i--)
		{
			var cell = this.model.getChildAt(parent, i);
			var result = this.getCellAt(x, y, cell, vertices, edges, ignoreFn);
			
			if (result != null)
			{
				return result;
			}
			else if (this.isCellVisible(cell) && (edges && this.model.isEdge(cell) ||
				vertices && this.model.isVertex(cell)))
			{
				var state = this.view.getState(cell);

				if (state != null && (ignoreFn == null || !ignoreFn(state, x, y)) &&
					this.intersects(state, x, y))
				{
					return cell;
				}
			}
		}
	}
	
	return null;
};

bpmGraph.prototype.intersects = function(state, x, y)
{
	if (state != null)
	{
		var pts = state.absolutePoints;

		if (pts != null)
		{
			var t2 = this.tolerance * this.tolerance;
			var pt = pts[0];
			
			for (var i = 1; i < pts.length; i++)
			{
				var next = pts[i];
				var dist = bpmUtils.ptSegDistSq(pt.x, pt.y, next.x, next.y, x, y);
				
				if (dist <= t2)
				{
					return true;
				}
				
				pt = next;
			}
		}
		else
		{
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
			
			if (bpmUtils.contains(state, x, y))
			{
				return true;
			}
		}
	}
	
	return false;
};

bpmGraph.prototype.hitsSwimlaneContent = function(swimlane, x, y)
{
	var state = this.getView().getState(swimlane);
	var size = this.getStartSize(swimlane);
	
	if (state != null)
	{
		var scale = this.getView().getScale();
		x -= state.x;
		y -= state.y;
		
		if (size.width > 0 && x > 0 && x > size.width * scale)
		{
			return true;
		}
		else if (size.height > 0 && y > 0 && y > size.height * scale)
		{
			return true;
		}
	}
	
	return false;
};

bpmGraph.prototype.getChildVertices = function(parent)
{
	return this.getChildCells(parent, true, false);
};

bpmGraph.prototype.getChildEdges = function(parent)
{
	return this.getChildCells(parent, false, true);
};

bpmGraph.prototype.getChildCells = function(parent, vertices, edges)
{
	parent = (parent != null) ? parent : this.getDefaultParent();
	vertices = (vertices != null) ? vertices : false;
	edges = (edges != null) ? edges : false;

	var cells = this.model.getChildCells(parent, vertices, edges);
	var result = [];

	for (var i = 0; i < cells.length; i++)
	{
		if (this.isCellVisible(cells[i]))
		{
			result.push(cells[i]);
		}
	}

	return result;
};

bpmGraph.prototype.getConnections = function(cell, parent)
{
	return this.getEdges(cell, parent, true, true, false);
};

bpmGraph.prototype.getIncomingEdges = function(cell, parent)
{
	return this.getEdges(cell, parent, true, false, false);
};

bpmGraph.prototype.getOutgoingEdges = function(cell, parent)
{
	return this.getEdges(cell, parent, false, true, false);
};
	
bpmGraph.prototype.getEdges = function(cell, parent, incoming, outgoing, includeLoops, recurse)
{
	incoming = (incoming != null) ? incoming : true;
	outgoing = (outgoing != null) ? outgoing : true;
	includeLoops = (includeLoops != null) ? includeLoops : true;
	recurse = (recurse != null) ? recurse : false;
	
	var edges = [];
	var isCollapsed = this.isCellCollapsed(cell);
	var childCount = this.model.getChildCount(cell);

	for (var i = 0; i < childCount; i++)
	{
		var child = this.model.getChildAt(cell, i);

		if (isCollapsed || !this.isCellVisible(child))
		{
			edges = edges.concat(this.model.getEdges(child, incoming, outgoing));
		}
	}

	edges = edges.concat(this.model.getEdges(cell, incoming, outgoing));
	var result = [];
	
	for (var i = 0; i < edges.length; i++)
	{
		var state = this.view.getState(edges[i]);
		
		var source = (state != null) ? state.getVisibleTerminal(true) : this.view.getVisibleTerminal(edges[i], true);
		var target = (state != null) ? state.getVisibleTerminal(false) : this.view.getVisibleTerminal(edges[i], false);

		if ((includeLoops && source == target) || ((source != target) && ((incoming &&
			target == cell && (parent == null || this.isValidAncestor(source, parent, recurse))) ||
			(outgoing && source == cell && (parent == null ||
					this.isValidAncestor(target, parent, recurse))))))
		{
			result.push(edges[i]);
		}
	}

	return result;
};

bpmGraph.prototype.isValidAncestor = function(cell, parent, recurse)
{
	return (recurse ? this.model.isAncestor(parent, cell) : this.model
			.getParent(cell) == parent);
};

bpmGraph.prototype.getOpposites = function(edges, terminal, sources, targets)
{
	sources = (sources != null) ? sources : true;
	targets = (targets != null) ? targets : true;
	
	var terminals = [];
	
	var dict = new bpmDictionary();
	
	if (edges != null)
	{
		for (var i = 0; i < edges.length; i++)
		{
			var state = this.view.getState(edges[i]);
			
			var source = (state != null) ? state.getVisibleTerminal(true) : this.view.getVisibleTerminal(edges[i], true);
			var target = (state != null) ? state.getVisibleTerminal(false) : this.view.getVisibleTerminal(edges[i], false);
			
			if (source == terminal && target != null && target != terminal && targets)
			{
				if (!dict.get(target))
				{
					dict.put(target, true);
					terminals.push(target);
				}
			}
			
			else if (target == terminal && source != null && source != terminal && sources)
			{
				if (!dict.get(source))
				{
					dict.put(source, true);
					terminals.push(source);
				}
			}
		}
	}
	
	return terminals;
};

bpmGraph.prototype.getEdgesBetween = function(source, target, directed)
{
	directed = (directed != null) ? directed : false;
	var edges = this.getEdges(source);
	var result = [];

	for (var i = 0; i < edges.length; i++)
	{
		var state = this.view.getState(edges[i]);
		
		var src = (state != null) ? state.getVisibleTerminal(true) : this.view.getVisibleTerminal(edges[i], true);
		var trg = (state != null) ? state.getVisibleTerminal(false) : this.view.getVisibleTerminal(edges[i], false);

		if ((src == source && trg == target) || (!directed && src == target && trg == source))
		{
			result.push(edges[i]);
		}
	}

	return result;
};

 bpmGraph.prototype.getPointForEvent = function(evt, addOffset)
 {
	var p = bpmUtils.convertPoint(this.container,
		bpmEvent.getClientX(evt), bpmEvent.getClientY(evt));
	
	var s = this.view.scale;
	var tr = this.view.translate;
	var off = (addOffset != false) ? this.gridSize / 2 : 0;
	
	p.x = this.snap(p.x / s - tr.x - off);
	p.y = this.snap(p.y / s - tr.y - off);
	
	return p;
 };

bpmGraph.prototype.getCells = function(x, y, width, height, parent, result)
{
	result = (result != null) ? result : [];
	
	if (width > 0 || height > 0)
	{
		var model = this.getModel();
		var right = x + width;
		var bottom = y + height;

		if (parent == null)
		{
			parent = this.getCurrentRoot();
			
			if (parent == null)
			{
				parent = model.getRoot();
			}
		}
		
		if (parent != null)
		{
			var childCount = model.getChildCount(parent);
			
			for (var i = 0; i < childCount; i++)
			{
				var cell = model.getChildAt(parent, i);
				var state = this.view.getState(cell);
				
				if (state != null && this.isCellVisible(cell))
				{
					var deg = bpmUtils.getValue(state.style, bpmConstants.STYLE_ROTATION) || 0;
					var box = state;
					
					if (deg != 0)
					{
						box = bpmUtils.getBoundingBox(box, deg);
					}
					
					if ((model.isEdge(cell) || model.isVertex(cell)) &&
						box.x >= x && box.y + box.height <= bottom &&
						box.y >= y && box.x + box.width <= right)
					{
						result.push(cell);
					}
					else
					{
						this.getCells(x, y, width, height, cell, result);
					}
				}
			}
		}
	}
	
	return result;
};

bpmGraph.prototype.getCellsBeyond = function(x0, y0, parent, rightHalfpane, bottomHalfpane)
{
	var result = [];
	
	if (rightHalfpane || bottomHalfpane)
	{
		if (parent == null)
		{
			parent = this.getDefaultParent();
		}
		
		if (parent != null)
		{
			var childCount = this.model.getChildCount(parent);
			
			for (var i = 0; i < childCount; i++)
			{
				var child = this.model.getChildAt(parent, i);
				var state = this.view.getState(child);
				
				if (this.isCellVisible(child) && state != null)
				{
					if ((!rightHalfpane || state.x >= x0) &&
						(!bottomHalfpane || state.y >= y0))
					{
						result.push(child);
					}
				}
			}
		}
	}
	
	return result;
};

bpmGraph.prototype.findTreeRoots = function(parent, isolate, invert)
{
	isolate = (isolate != null) ? isolate : false;
	invert = (invert != null) ? invert : false;
	var roots = [];
	
	if (parent != null)
	{
		var model = this.getModel();
		var childCount = model.getChildCount(parent);
		var best = null;
		var maxDiff = 0;
		
		for (var i=0; i<childCount; i++)
		{
			var cell = model.getChildAt(parent, i);
			
			if (this.model.isVertex(cell) && this.isCellVisible(cell))
			{
				var conns = this.getConnections(cell, (isolate) ? parent : null);
				var fanOut = 0;
				var fanIn = 0;
				
				for (var j = 0; j < conns.length; j++)
				{
					var src = this.view.getVisibleTerminal(conns[j], true);

                    if (src == cell)
                    {
                        fanOut++;
                    }
                    else
                    {
                        fanIn++;
                    }
				}
				
				if ((invert && fanOut == 0 && fanIn > 0) ||
					(!invert && fanIn == 0 && fanOut > 0))
				{
					roots.push(cell);
				}
				
				var diff = (invert) ? fanIn - fanOut : fanOut - fanIn;
				
				if (diff > maxDiff)
				{
					maxDiff = diff;
					best = cell;
				}
			}
		}
		
		if (roots.length == 0 && best != null)
		{
			roots.push(best);
		}
	}
	
	return roots;
};

bpmGraph.prototype.traverse = function(vertex, directed, func, edge, visited, inverse)
{
	if (func != null && vertex != null)
	{
		directed = (directed != null) ? directed : true;
		inverse = (inverse != null) ? inverse : false;
		visited = visited || new bpmDictionary();
		
		if (!visited.get(vertex))
		{
			visited.put(vertex, true);
			var result = func(vertex, edge);
			
			if (result == null || result)
			{
				var edgeCount = this.model.getEdgeCount(vertex);
				
				if (edgeCount > 0)
				{
					for (var i = 0; i < edgeCount; i++)
					{
						var e = this.model.getEdgeAt(vertex, i);
						var isSource = this.model.getTerminal(e, true) == vertex;
						
						if (!directed || (!inverse == isSource))
						{
							var next = this.model.getTerminal(e, !isSource);
							this.traverse(next, directed, func, e, visited, inverse);
						}
					}
				}
			}
		}
	}
};

bpmGraph.prototype.isCellSelected = function(cell)
{
	return this.getSelectionModel().isSelected(cell);
};

bpmGraph.prototype.isSelectionEmpty = function()
{
	return this.getSelectionModel().isEmpty();
};

bpmGraph.prototype.clearSelection = function()
{
	return this.getSelectionModel().clear();
};

bpmGraph.prototype.getSelectionCount = function()
{
	return this.getSelectionModel().cells.length;
};
	
bpmGraph.prototype.getSelectionCell = function()
{
	return this.getSelectionModel().cells[0];
};

bpmGraph.prototype.getSelectionCells = function()
{
	return this.getSelectionModel().cells.slice();
};

bpmGraph.prototype.setSelectionCell = function(cell)
{
	this.getSelectionModel().setCell(cell);
};

bpmGraph.prototype.setSelectionCells = function(cells)
{
	this.getSelectionModel().setCells(cells);
};

bpmGraph.prototype.addSelectionCell = function(cell)
{
	this.getSelectionModel().addCell(cell);
};

bpmGraph.prototype.addSelectionCells = function(cells)
{
	this.getSelectionModel().addCells(cells);
};

bpmGraph.prototype.removeSelectionCell = function(cell)
{
	this.getSelectionModel().removeCell(cell);
};

bpmGraph.prototype.removeSelectionCells = function(cells)
{
	this.getSelectionModel().removeCells(cells);
};

bpmGraph.prototype.selectRegion = function(rect, evt)
{
	var cells = this.getCells(rect.x, rect.y, rect.width, rect.height);
	this.selectCellsForEvent(cells, evt);
	
	return cells;
};

bpmGraph.prototype.selectNextCell = function()
{
	this.selectCell(true);
};

bpmGraph.prototype.selectPreviousCell = function()
{
	this.selectCell();
};

bpmGraph.prototype.selectParentCell = function()
{
	this.selectCell(false, true);
};

bpmGraph.prototype.selectChildCell = function()
{
	this.selectCell(false, false, true);
};

bpmGraph.prototype.selectCell = function(isNext, isParent, isChild)
{
	var sel = this.selectionModel;
	var cell = (sel.cells.length > 0) ? sel.cells[0] : null;
	
	if (sel.cells.length > 1)
	{
		sel.clear();
	}
	
	var parent = (cell != null) ?
		this.model.getParent(cell) :
		this.getDefaultParent();
	
	var childCount = this.model.getChildCount(parent);
	
	if (cell == null && childCount > 0)
	{
		var child = this.model.getChildAt(parent, 0);
		this.setSelectionCell(child);
	}
	else if ((cell == null || isParent) &&
		this.view.getState(parent) != null &&
		this.model.getGeometry(parent) != null)
	{
		if (this.getCurrentRoot() != parent)
		{
			this.setSelectionCell(parent);
		}
	}
	else if (cell != null && isChild)
	{
		var tmp = this.model.getChildCount(cell);
		
		if (tmp > 0)
		{
			var child = this.model.getChildAt(cell, 0);
			this.setSelectionCell(child);
		}
	}
	else if (childCount > 0)
	{
		var i = parent.getIndex(cell);
		
		if (isNext)
		{
			i++;
			var child = this.model.getChildAt(parent, i % childCount);
			this.setSelectionCell(child);
		}
		else
		{
			i--;
			var index =  (i < 0) ? childCount - 1 : i;
			var child = this.model.getChildAt(parent, index);
			this.setSelectionCell(child);
		}
	}
};

bpmGraph.prototype.selectAll = function(parent, descendants)
{
	parent = parent || this.getDefaultParent();
	
	var cells = (descendants) ? this.model.filterDescendants(bpmUtils.bind(this, function(cell)
	{
		return cell != parent && this.view.getState(cell) != null;
	}), parent) : this.model.getChildren(parent);
	
	if (cells != null)
	{
		this.setSelectionCells(cells);
	}
};

bpmGraph.prototype.selectVertices = function(parent)
{
	this.selectCells(true, false, parent);
};

bpmGraph.prototype.selectEdges = function(parent)
{
	this.selectCells(false, true, parent);
};

bpmGraph.prototype.selectCells = function(vertices, edges, parent)
{
	parent = parent || this.getDefaultParent();
	
	var filter = bpmUtils.bind(this, function(cell)
	{
		return this.view.getState(cell) != null &&
			((this.model.getChildCount(cell) == 0 && this.model.isVertex(cell) && vertices
			&& !this.model.isEdge(this.model.getParent(cell))) ||
			(this.model.isEdge(cell) && edges));
	});
	
	var cells = this.model.filterDescendants(filter, parent);
	
	if (cells != null)
	{
		this.setSelectionCells(cells);
	}
};

bpmGraph.prototype.selectCellForEvent = function(cell, evt)
{
	var isSelected = this.isCellSelected(cell);
	
	if (this.isToggleEvent(evt))
	{
		if (isSelected)
		{
			this.removeSelectionCell(cell);
		}
		else
		{
			this.addSelectionCell(cell);
		}
	}
	else if (!isSelected || this.getSelectionCount() != 1)
	{
		this.setSelectionCell(cell);
	}
};

bpmGraph.prototype.selectCellsForEvent = function(cells, evt)
{
	if (this.isToggleEvent(evt))
	{
		this.addSelectionCells(cells);
	}
	else
	{
		this.setSelectionCells(cells);
	}
};

bpmGraph.prototype.createHandler = function(state)
{
	var result = null;
	
	if (state != null)
	{
		if (this.model.isEdge(state.cell))
		{
			var source = state.getVisibleTerminalState(true);
			var target = state.getVisibleTerminalState(false);
			var geo = this.getCellGeometry(state.cell);
			
			var edgeStyle = this.view.getEdgeStyle(state, (geo != null) ? geo.points : null, source, target);
			result = this.createEdgeHandler(state, edgeStyle);
		}
		else
		{
			result = this.createVertexHandler(state);
		}
	}
	
	return result;
};

bpmGraph.prototype.createVertexHandler = function(state)
{
	return new bpmVertexHandler(state);
};

bpmGraph.prototype.createEdgeHandler = function(state, edgeStyle)
{
	var result = null;
	
	if (edgeStyle == bpmEdgeStyle.Loop ||
		edgeStyle == bpmEdgeStyle.ElbowConnector ||
		edgeStyle == bpmEdgeStyle.SideToSide ||
		edgeStyle == bpmEdgeStyle.TopToBottom)
	{
		result = this.createElbowEdgeHandler(state);
	}
	else if (edgeStyle == bpmEdgeStyle.SegmentConnector || 
			edgeStyle == bpmEdgeStyle.OrthConnector)
	{
		result = this.createEdgeSegmentHandler(state);
	}
	else
	{
		result = new bpmEdgeHandler(state);
	}
	
	return result;
};

bpmGraph.prototype.createEdgeSegmentHandler = function(state)
{
	return new bpmEdgeSegmentHandler(state);
};

bpmGraph.prototype.createElbowEdgeHandler = function(state)
{
	return new bpmElbowEdgeHandler(state);
};

bpmGraph.prototype.addMouseListener = function(listener)
{
	if (this.mouseListeners == null)
	{
		this.mouseListeners = [];
	}
	
	this.mouseListeners.push(listener);
};

bpmGraph.prototype.removeMouseListener = function(listener)
{
	if (this.mouseListeners != null)
	{
		for (var i = 0; i < this.mouseListeners.length; i++)
		{
			if (this.mouseListeners[i] == listener)
			{
				this.mouseListeners.splice(i, 1);
				break;
			}
		}
	}
};

bpmGraph.prototype.updateMouseEvent = function(me, evtName)
{
	if (me.graphX == null || me.graphY == null)
	{
		var pt = bpmUtils.convertPoint(this.container, me.getX(), me.getY());
		
		me.graphX = pt.x - this.panDx;
		me.graphY = pt.y - this.panDy;
		
		if (me.getCell() == null && this.isMouseDown && evtName == bpmEvent.MOUSE_MOVE)
		{
			me.state = this.view.getState(this.getCellAt(pt.x, pt.y, null, null, null, function(state)
			{
				return state.shape == null || state.shape.paintBackground != bpmRectangleShape.prototype.paintBackground ||
					bpmUtils.getValue(state.style, bpmConstants.STYLE_POINTER_EVENTS, '1') == '1' ||
					(state.shape.fill != null && state.shape.fill != bpmConstants.NONE);
			}));
		}
	}
	
	return me;
};

bpmGraph.prototype.getStateForTouchEvent = function(evt)
{
	var x = bpmEvent.getClientX(evt);
	var y = bpmEvent.getClientY(evt);
	
	var pt = bpmUtils.convertPoint(this.container, x, y);

	return this.view.getState(this.getCellAt(pt.x, pt.y));
};

bpmGraph.prototype.isEventIgnored = function(evtName, me, sender)
{
	var mouseEvent = bpmEvent.isMouseEvent(me.getEvent());
	var result = false;

	if (me.getEvent() == this.lastEvent)
	{
		result = true;
	}
	else
	{
		this.lastEvent = me.getEvent();
	}

	if (this.eventSource != null && evtName != bpmEvent.MOUSE_MOVE)
	{
		bpmEvent.removeGestureListeners(this.eventSource, null, this.mouseMoveRedirect, this.mouseUpRedirect);
		this.mouseMoveRedirect = null;
		this.mouseUpRedirect = null;
		this.eventSource = null;
	}
	else if (!bpmCore.IS_GC && this.eventSource != null && me.getSource() != this.eventSource)
	{
		result = true;
	}
	else if (bpmCore.IS_TOUCH && evtName == bpmEvent.MOUSE_DOWN && !mouseEvent && !bpmEvent.isPenEvent(me.getEvent()))
	{
		this.eventSource = me.getSource();

		this.mouseMoveRedirect = bpmUtils.bind(this, function(evt)
		{
			this.fireMouseEvent(bpmEvent.MOUSE_MOVE, new bpmMouseEvent(evt, this.getStateForTouchEvent(evt)));
		});
		this.mouseUpRedirect = bpmUtils.bind(this, function(evt)
		{
			this.fireMouseEvent(bpmEvent.MOUSE_UP, new bpmMouseEvent(evt, this.getStateForTouchEvent(evt)));
		});
		
		bpmEvent.addGestureListeners(this.eventSource, null, this.mouseMoveRedirect, this.mouseUpRedirect);
	}

	if (this.isSyntheticEventIgnored(evtName, me, sender))
	{
		result = true;
	}

	if (!bpmEvent.isPopupTrigger(this.lastEvent) && evtName != bpmEvent.MOUSE_MOVE && this.lastEvent.detail == 2)
	{
		return true;
	}
	
	if (evtName == bpmEvent.MOUSE_UP && this.isMouseDown)
	{
		this.isMouseDown = false;
	}
	else if (evtName == bpmEvent.MOUSE_DOWN && !this.isMouseDown)
	{
		this.isMouseDown = true;
		this.isMouseTrigger = mouseEvent;
	}
	else if (!result && (((!bpmCore.IS_FF || evtName != bpmEvent.MOUSE_MOVE) &&
		this.isMouseDown && this.isMouseTrigger != mouseEvent) ||
		(evtName == bpmEvent.MOUSE_DOWN && this.isMouseDown) ||
		(evtName == bpmEvent.MOUSE_UP && !this.isMouseDown)))
	{
		result = true;
	}
	
	if (!result && evtName == bpmEvent.MOUSE_DOWN)
	{
		this.lastMouseX = me.getX();
		this.lastMouseY = me.getY();
	}

	return result;
};

bpmGraph.prototype.isSyntheticEventIgnored = function(evtName, me, sender)
{
	var result = false;
	var mouseEvent = bpmEvent.isMouseEvent(me.getEvent());
	
	if (this.ignoreMouseEvents && mouseEvent && evtName != bpmEvent.MOUSE_MOVE)
	{
		this.ignoreMouseEvents = evtName != bpmEvent.MOUSE_UP;
		result = true;
	}
	else if (bpmCore.IS_FF && !mouseEvent && evtName == bpmEvent.MOUSE_UP)
	{
		this.ignoreMouseEvents = true;
	}
	
	return result;
};

bpmGraph.prototype.isEventSourceIgnored = function(evtName, me)
{
	var source = me.getSource();
	var name = (source.nodeName != null) ? source.nodeName.toLowerCase() : '';
	var candidate = !bpmEvent.isMouseEvent(me.getEvent()) || bpmEvent.isLeftMouseButton(me.getEvent());
	
	return evtName == bpmEvent.MOUSE_DOWN && candidate && (name == 'select' || name == 'option' ||
		(name == 'input' && source.type != 'checkbox' && source.type != 'radio' &&
		source.type != 'button' && source.type != 'submit' && source.type != 'file'));
};

bpmGraph.prototype.getEventState = function(state)
{
	return state;
};

bpmGraph.prototype.fireMouseEvent = function(evtName, me, sender)
{
	if (this.isEventSourceIgnored(evtName, me))
	{
		if (this.tooltipHandler != null)
		{
			this.tooltipHandler.hide();
		}
		
		return;
	}
	
	if (sender == null)
	{
		sender = this;
	}

	me = this.updateMouseEvent(me, evtName);
	if ((!this.nativeDblClickEnabled && !bpmEvent.isPopupTrigger(me.getEvent())) || (this.doubleTapEnabled &&
		bpmCore.IS_TOUCH && (bpmEvent.isTouchEvent(me.getEvent()) || bpmEvent.isPenEvent(me.getEvent()))))
	{
		var currentTime = new Date().getTime();
		
		if ((!bpmCore.IS_QUIRKS && evtName == bpmEvent.MOUSE_DOWN) || (bpmCore.IS_QUIRKS && evtName == bpmEvent.MOUSE_UP && !this.fireDoubleClick))
		{
			if (this.lastTouchEvent != null && this.lastTouchEvent != me.getEvent() &&
				currentTime - this.lastTouchTime < this.doubleTapTimeout &&
				Math.abs(this.lastTouchX - me.getX()) < this.doubleTapTolerance &&
				Math.abs(this.lastTouchY - me.getY()) < this.doubleTapTolerance &&
				this.doubleClickCounter < 2)
			{
				this.doubleClickCounter++;
				var doubleClickFired = false;
				
				if (evtName == bpmEvent.MOUSE_UP)
				{
					if (me.getCell() == this.lastTouchCell && this.lastTouchCell != null)
					{
						this.lastTouchTime = 0;
						var cell = this.lastTouchCell;
						this.lastTouchCell = null;

						if (bpmCore.IS_QUIRKS)
						{
							me.getSource().fireEvent('ondblclick');
						}
						
						this.dblClick(me.getEvent(), cell);
						doubleClickFired = true;
					}
				}
				else
				{
					this.fireDoubleClick = true;
					this.lastTouchTime = 0;
				}

				if (!bpmCore.IS_QUIRKS || doubleClickFired)
				{
					bpmEvent.consume(me.getEvent());
					return;
				}
			}
			else if (this.lastTouchEvent == null || this.lastTouchEvent != me.getEvent())
			{
				this.lastTouchCell = me.getCell();
				this.lastTouchX = me.getX();
				this.lastTouchY = me.getY();
				this.lastTouchTime = currentTime;
				this.lastTouchEvent = me.getEvent();
				this.doubleClickCounter = 0;
			}
		}
		else if ((this.isMouseDown || evtName == bpmEvent.MOUSE_UP) && this.fireDoubleClick)
		{
			this.fireDoubleClick = false;
			var cell = this.lastTouchCell;
			this.lastTouchCell = null;
			this.isMouseDown = false;

			var valid = (cell != null) || ((bpmEvent.isTouchEvent(me.getEvent()) || bpmEvent.isPenEvent(me.getEvent())) &&
				(bpmCore.IS_GC || bpmCore.IS_SF));
			
			if (valid && Math.abs(this.lastTouchX - me.getX()) < this.doubleTapTolerance &&
				Math.abs(this.lastTouchY - me.getY()) < this.doubleTapTolerance)
			{
				this.dblClick(me.getEvent(), cell);
			}
			else
			{
				bpmEvent.consume(me.getEvent());
			}
			
			return;
		}
	}

	if (!this.isEventIgnored(evtName, me, sender))
	{
		me.state = this.getEventState(me.getState());
		this.fireEvent(new bpmEventObject(bpmEvent.FIRE_MOUSE_EVENT, 'eventName', evtName, 'event', me));
		
		if ((bpmCore.IS_OP || bpmCore.IS_SF || bpmCore.IS_GC || bpmCore.IS_IE11 ||
			(bpmCore.IS_IE && bpmCore.IS_SVG) || me.getEvent().target != this.container))
		{
			if (evtName == bpmEvent.MOUSE_MOVE && this.isMouseDown && this.autoScroll && !bpmEvent.isMultiTouchEvent(me.getEvent))
			{
				this.scrollPointToVisible(me.getGraphX(), me.getGraphY(), this.autoExtend);
			}
			else if (evtName == bpmEvent.MOUSE_UP && this.ignoreScrollbars && this.translateToScrollPosition &&
					(this.container.scrollLeft != 0 || this.container.scrollTop != 0))
			{
				var s = this.view.scale;
				var tr = this.view.translate;
				this.view.setTranslate(tr.x - this.container.scrollLeft / s, tr.y - this.container.scrollTop / s);
				this.container.scrollLeft = 0;
				this.container.scrollTop = 0;
			}
			
			if (this.mouseListeners != null)
			{
				var args = [sender, me];
	
				if (!me.getEvent().preventDefault)
				{
					me.getEvent().returnValue = true;
				}
				
				for (var i = 0; i < this.mouseListeners.length; i++)
				{
					var l = this.mouseListeners[i];
					
					if (evtName == bpmEvent.MOUSE_DOWN)
					{
						l.mouseDown.apply(l, args);
					}
					else if (evtName == bpmEvent.MOUSE_MOVE)
					{
						l.mouseMove.apply(l, args);
					}
					else if (evtName == bpmEvent.MOUSE_UP)
					{
						l.mouseUp.apply(l, args);
					}
				}
			}
			
			if (evtName == bpmEvent.MOUSE_UP)
			{
				this.click(me);
			}
		}
		
		if ((bpmEvent.isTouchEvent(me.getEvent()) || bpmEvent.isPenEvent(me.getEvent())) &&
			evtName == bpmEvent.MOUSE_DOWN && this.tapAndHoldEnabled && !this.tapAndHoldInProgress)
		{
			this.tapAndHoldInProgress = true;
			this.initialTouchX = me.getGraphX();
			this.initialTouchY = me.getGraphY();
			
			var handler = function()
			{
				if (this.tapAndHoldValid)
				{
					this.tapAndHold(me);
				}
				
				this.tapAndHoldInProgress = false;
				this.tapAndHoldValid = false;
			};
			
			if (this.tapAndHoldThread)
			{
				window.clearTimeout(this.tapAndHoldThread);
			}
	
			this.tapAndHoldThread = window.setTimeout(bpmUtils.bind(this, handler), this.tapAndHoldDelay);
			this.tapAndHoldValid = true;
		}
		else if (evtName == bpmEvent.MOUSE_UP)
		{
			this.tapAndHoldInProgress = false;
			this.tapAndHoldValid = false;
		}
		else if (this.tapAndHoldValid)
		{
			this.tapAndHoldValid =
				Math.abs(this.initialTouchX - me.getGraphX()) < this.tolerance &&
				Math.abs(this.initialTouchY - me.getGraphY()) < this.tolerance;
		}

		if (evtName == bpmEvent.MOUSE_DOWN && this.isEditing() && !this.cellEditor.isEventSource(me.getEvent()))
		{
			this.stopEditing(!this.isInvokesStopCellEditing());
		}

		this.consumeMouseEvent(evtName, me, sender);
	}
};

bpmGraph.prototype.consumeMouseEvent = function(evtName, me, sender)
{
	if (evtName == bpmEvent.MOUSE_DOWN && bpmEvent.isTouchEvent(me.getEvent()))
	{
		me.consume(false);
	}
};

bpmGraph.prototype.fireGestureEvent = function(evt, cell)
{
	this.lastTouchTime = 0;
	this.fireEvent(new bpmEventObject(bpmEvent.GESTURE, 'event', evt, 'cell', cell));
};

bpmGraph.prototype.destroy = function()
{
	if (!this.destroyed)
	{
		this.destroyed = true;
		
		if (this.tooltipHandler != null)
		{
			this.tooltipHandler.destroy();
		}
		
		if (this.selectionCellsHandler != null)
		{
			this.selectionCellsHandler.destroy();
		}

		if (this.panningHandler != null)
		{
			this.panningHandler.destroy();
		}

		if (this.popupMenuHandler != null)
		{
			this.popupMenuHandler.destroy();
		}
		
		if (this.connectionHandler != null)
		{
			this.connectionHandler.destroy();
		}
		
		if (this.graphHandler != null)
		{
			this.graphHandler.destroy();
		}
		
		if (this.cellEditor != null)
		{
			this.cellEditor.destroy();
		}
		
		if (this.view != null)
		{
			this.view.destroy();
		}

		if (this.model != null && this.graphModelChangeListener != null)
		{
			this.model.removeListener(this.graphModelChangeListener);
			this.graphModelChangeListener = null;
		}

		this.container = null;
	}
};



/* Cell Overlay */

function bpmCellOverlay(image, tooltip, align, verticalAlign, offset, cursor)
{
	this.image = image;
	this.tooltip = tooltip;
	this.align = (align != null) ? align : this.align;
	this.verticalAlign = (verticalAlign != null) ? verticalAlign : this.verticalAlign;
	this.offset = (offset != null) ? offset : new bpmPoint();
	this.cursor = (cursor != null) ? cursor : 'help';
};

bpmCellOverlay.prototype = new bpmEventSource();
bpmCellOverlay.prototype.constructor = bpmCellOverlay;
bpmCellOverlay.prototype.image = null;
bpmCellOverlay.prototype.tooltip = null;
bpmCellOverlay.prototype.align = bpmConstants.ALIGN_RIGHT;
bpmCellOverlay.prototype.verticalAlign = bpmConstants.ALIGN_BOTTOM;
bpmCellOverlay.prototype.offset = null;
bpmCellOverlay.prototype.cursor = null;
bpmCellOverlay.prototype.defaultOverlap = 0.5;

bpmCellOverlay.prototype.getBounds = function(state)
{
	var isEdge = state.view.graph.getModel().isEdge(state.cell);
	var s = state.view.scale;
	var pt = null;

	var w = this.image.width;
	var h = this.image.height;
	
	if (isEdge)
	{
		var pts = state.absolutePoints;
		
		if (pts.length % 2 == 1)
		{
			pt = pts[Math.floor(pts.length / 2)];
		}
		else
		{
			var idx = pts.length / 2;
			var p0 = pts[idx-1];
			var p1 = pts[idx];
			pt = new bpmPoint(p0.x + (p1.x - p0.x) / 2,
				p0.y + (p1.y - p0.y) / 2);
		}
	}
	else
	{
		pt = new bpmPoint();
		
		if (this.align == bpmConstants.ALIGN_LEFT)
		{
			pt.x = state.x;
		}
		else if (this.align == bpmConstants.ALIGN_CENTER)
		{
			pt.x = state.x + state.width / 2;
		}
		else
		{
			pt.x = state.x + state.width;
		}
		
		if (this.verticalAlign == bpmConstants.ALIGN_TOP)
		{
			pt.y = state.y;
		}
		else if (this.verticalAlign == bpmConstants.ALIGN_MIDDLE)
		{
			pt.y = state.y + state.height / 2;
		}
		else
		{
			pt.y = state.y + state.height;
		}
	}

	return new bpmRectangle(Math.round(pt.x - (w * this.defaultOverlap - this.offset.x) * s),
		Math.round(pt.y - (h * this.defaultOverlap - this.offset.y) * s), w * s, h * s);
};

bpmCellOverlay.prototype.toString = function()
{
	return this.tooltip;
};



/* Outline */
function bpmOutline(source, container)
{
	this.source = source;

	if (container != null)
	{
		this.init(container);
	}
};

bpmOutline.prototype.source = null;
bpmOutline.prototype.outline = null;
bpmOutline.prototype.graphRenderHint = bpmConstants.RENDERING_HINT_FASTER;
bpmOutline.prototype.enabled = true;
bpmOutline.prototype.showViewport = true;
bpmOutline.prototype.border = 10;
bpmOutline.prototype.sizerSize = 8;
bpmOutline.prototype.labelsVisible = false;
bpmOutline.prototype.updateOnPan = false;
bpmOutline.prototype.sizerImage = null;
bpmOutline.prototype.minScale = 0.0001;
bpmOutline.prototype.suspended = false;
bpmOutline.prototype.forceVmlHandles = document.documentMode == 8;

bpmOutline.prototype.createGraph = function(container)
{
	var graph = new bpmGraph(container, this.source.getModel(), this.graphRenderHint, this.source.getStylesheet());
	graph.foldingEnabled = false;
	graph.autoScroll = false;
	
	return graph;
};

bpmOutline.prototype.init = function(container)
{
	this.outline = this.createGraph(container);
	
	var outlineGraphModelChanged = this.outline.graphModelChanged;
	this.outline.graphModelChanged = bpmUtils.bind(this, function(changes)
	{
		if (!this.suspended && this.outline != null)
		{
			outlineGraphModelChanged.apply(this.outline, arguments);
		}
	});

	if (bpmCore.IS_SVG)
	{
		var node = this.outline.getView().getCanvas().parentNode;
		node.setAttribute('shape-rendering', 'optimizeSpeed');
		node.setAttribute('image-rendering', 'optimizeSpeed');
	}
	
	this.outline.labelsVisible = this.labelsVisible;
	this.outline.setEnabled(false);
	
	this.updateHandler = bpmUtils.bind(this, function(sender, evt)
	{
		if (!this.suspended && !this.active)
		{
			this.update();
		}
	});
	
	this.source.getModel().addListener(bpmEvent.CHANGE, this.updateHandler);
	this.outline.addMouseListener(this);
	
	var view = this.source.getView();
	view.addListener(bpmEvent.SCALE, this.updateHandler);
	view.addListener(bpmEvent.TRANSLATE, this.updateHandler);
	view.addListener(bpmEvent.SCALE_AND_TRANSLATE, this.updateHandler);
	view.addListener(bpmEvent.DOWN, this.updateHandler);
	view.addListener(bpmEvent.UP, this.updateHandler);

	bpmEvent.addListener(this.source.container, 'scroll', this.updateHandler);
	
	this.panHandler = bpmUtils.bind(this, function(sender)
	{
		if (this.updateOnPan)
		{
			this.updateHandler.apply(this, arguments);
		}
	});
	this.source.addListener(bpmEvent.PAN, this.panHandler);
	
	this.refreshHandler = bpmUtils.bind(this, function(sender)
	{
		this.outline.setStylesheet(this.source.getStylesheet());
		this.outline.refresh();
	});
	this.source.addListener(bpmEvent.REFRESH, this.refreshHandler);

	this.bounds = new bpmRectangle(0, 0, 0, 0);
	this.selectionBorder = new bpmRectangleShape(this.bounds, null,
		bpmConstants.OUTLINE_COLOR, bpmConstants.OUTLINE_STROKEWIDTH);
	this.selectionBorder.dialect = this.outline.dialect;

	if (this.forceVmlHandles)
	{
		this.selectionBorder.isHtmlAllowed = function()
		{
			return false;
		};
	}
	
	this.selectionBorder.init(this.outline.getView().getOverlayPane());

	var handler = bpmUtils.bind(this, function(evt)
	{
		var t = bpmEvent.getSource(evt);
		
		var redirect = bpmUtils.bind(this, function(evt)
		{
			this.outline.fireMouseEvent(bpmEvent.MOUSE_MOVE, new bpmMouseEvent(evt));
		});
		
		var redirect2 = bpmUtils.bind(this, function(evt)
		{
			bpmEvent.removeGestureListeners(t, null, redirect, redirect2);
			this.outline.fireMouseEvent(bpmEvent.MOUSE_UP, new bpmMouseEvent(evt));
		});
		
		bpmEvent.addGestureListeners(t, null, redirect, redirect2);
		this.outline.fireMouseEvent(bpmEvent.MOUSE_DOWN, new bpmMouseEvent(evt));
	});
	
	bpmEvent.addGestureListeners(this.selectionBorder.node, handler);

	this.sizer = this.createSizer();
	
	if (this.forceVmlHandles)
	{
		this.sizer.isHtmlAllowed = function()
		{
			return false;
		};
	}
	
	this.sizer.init(this.outline.getView().getOverlayPane());
	
	if (this.enabled)
	{
		this.sizer.node.style.cursor = 'nwse-resize';
	}
	
	bpmEvent.addGestureListeners(this.sizer.node, handler);

	this.selectionBorder.node.style.display = (this.showViewport) ? '' : 'none';
	this.sizer.node.style.display = this.selectionBorder.node.style.display;
	this.selectionBorder.node.style.cursor = 'move';

	this.update(false);
};

bpmOutline.prototype.isEnabled = function()
{
	return this.enabled;
};

bpmOutline.prototype.setEnabled = function(value)
{
	this.enabled = value;
};

bpmOutline.prototype.setZoomEnabled = function(value)
{
	this.sizer.node.style.visibility = (value) ? 'visible' : 'hidden';
};

bpmOutline.prototype.refresh = function()
{
	this.update(true);
};

bpmOutline.prototype.createSizer = function()
{
	if (this.sizerImage != null)
	{
		var sizer = new bpmImageShape(new bpmRectangle(0, 0, this.sizerImage.width, this.sizerImage.height), this.sizerImage.src);
		sizer.dialect = this.outline.dialect;
		
		return sizer;
	}
	else
	{
		var sizer = new bpmRectangleShape(new bpmRectangle(0, 0, this.sizerSize, this.sizerSize),
			bpmConstants.OUTLINE_HANDLE_FILLCOLOR, bpmConstants.OUTLINE_HANDLE_STROKECOLOR);
		sizer.dialect = this.outline.dialect;
	
		return sizer;
	}
};

bpmOutline.prototype.getSourceContainerSize = function()
{
	return new bpmRectangle(0, 0, this.source.container.scrollWidth, this.source.container.scrollHeight);
};

bpmOutline.prototype.getOutlineOffset = function(scale)
{
	return null;
};

bpmOutline.prototype.getSourceGraphBounds = function()
{
	return this.source.getGraphBounds();
};

bpmOutline.prototype.update = function(revalidate)
{
	if (this.source != null && this.source.container != null &&
		this.outline != null && this.outline.container != null)
	{
		var sourceScale = this.source.view.scale;
		var scaledGraphBounds = this.getSourceGraphBounds();
		var unscaledGraphBounds = new bpmRectangle(scaledGraphBounds.x / sourceScale + this.source.panDx,
				scaledGraphBounds.y / sourceScale + this.source.panDy, scaledGraphBounds.width / sourceScale,
				scaledGraphBounds.height / sourceScale);

		var unscaledFinderBounds = new bpmRectangle(0, 0,
			this.source.container.clientWidth / sourceScale,
			this.source.container.clientHeight / sourceScale);
		
		var union = unscaledGraphBounds.clone();
		union.add(unscaledFinderBounds);
	
		var size = this.getSourceContainerSize();
		var completeWidth = Math.max(size.width / sourceScale, union.width);
		var completeHeight = Math.max(size.height / sourceScale, union.height);
	
		var availableWidth = Math.max(0, this.outline.container.clientWidth - this.border);
		var availableHeight = Math.max(0, this.outline.container.clientHeight - this.border);
		
		var outlineScale = Math.min(availableWidth / completeWidth, availableHeight / completeHeight);
		var scale = (isNaN(outlineScale)) ? this.minScale : Math.max(this.minScale, outlineScale);

		if (scale > 0)
		{
			if (this.outline.getView().scale != scale)
			{
				this.outline.getView().scale = scale;
				revalidate = true;
			}
		
			var navView = this.outline.getView();
			
			if (navView.currentRoot != this.source.getView().currentRoot)
			{
				navView.setCurrentRoot(this.source.getView().currentRoot);
			}

			var t = this.source.view.translate;
			var tx = t.x + this.source.panDx;
			var ty = t.y + this.source.panDy;
			
			var off = this.getOutlineOffset(scale);
			
			if (off != null)
			{
				tx += off.x;
				ty += off.y;
			}
			
			if (unscaledGraphBounds.x < 0)
			{
				tx = tx - unscaledGraphBounds.x;
			}
			if (unscaledGraphBounds.y < 0)
			{
				ty = ty - unscaledGraphBounds.y;
			}
			
			if (navView.translate.x != tx || navView.translate.y != ty)
			{
				navView.translate.x = tx;
				navView.translate.y = ty;
				revalidate = true;
			}
		
			var t2 = navView.translate;
			scale = this.source.getView().scale;
			var scale2 = scale / navView.scale;
			var scale3 = 1.0 / navView.scale;
			var container = this.source.container;
			
			this.bounds = new bpmRectangle(
				(t2.x - t.x - this.source.panDx) / scale3,
				(t2.y - t.y - this.source.panDy) / scale3,
				(container.clientWidth / scale2),
				(container.clientHeight / scale2));
			
			this.bounds.x += this.source.container.scrollLeft * navView.scale / scale;
			this.bounds.y += this.source.container.scrollTop * navView.scale / scale;
			
			var b = this.selectionBorder.bounds;
			
			if (b.x != this.bounds.x || b.y != this.bounds.y || b.width != this.bounds.width || b.height != this.bounds.height)
			{
				this.selectionBorder.bounds = this.bounds;
				this.selectionBorder.redraw();
			}
		
			var b = this.sizer.bounds;
			var b2 = new bpmRectangle(this.bounds.x + this.bounds.width - b.width / 2,
					this.bounds.y + this.bounds.height - b.height / 2, b.width, b.height);

			if (b.x != b2.x || b.y != b2.y || b.width != b2.width || b.height != b2.height)
			{
				this.sizer.bounds = b2;
				
				if (this.sizer.node.style.visibility != 'hidden')
				{
					this.sizer.redraw();
				}
			}

			if (revalidate)
			{
				this.outline.view.revalidate();
			}
		}
	}
};

bpmOutline.prototype.mouseDown = function(sender, me)
{
	if (this.enabled && this.showViewport)
	{
		var tol = (!bpmEvent.isMouseEvent(me.getEvent())) ? this.source.tolerance : 0;
		var hit = (this.source.allowHandleBoundsCheck && (bpmCore.IS_IE || tol > 0)) ?
				new bpmRectangle(me.getGraphX() - tol, me.getGraphY() - tol, 2 * tol, 2 * tol) : null;
		this.zoom = me.isSource(this.sizer) || (hit != null && bpmUtils.intersects(shape.bounds, hit));
		this.startX = me.getX();
		this.startY = me.getY();
		this.active = true;

		if (this.source.useScrollbarsForPanning && bpmUtils.hasScrollbars(this.source.container))
		{
			this.dx0 = this.source.container.scrollLeft;
			this.dy0 = this.source.container.scrollTop;
		}
		else
		{
			this.dx0 = 0;
			this.dy0 = 0;
		}
	}

	me.consume();
};

bpmOutline.prototype.mouseMove = function(sender, me)
{
	if (this.active)
	{
		this.selectionBorder.node.style.display = (this.showViewport) ? '' : 'none';
		this.sizer.node.style.display = this.selectionBorder.node.style.display; 

		var delta = this.getTranslateForEvent(me);
		var dx = delta.x;
		var dy = delta.y;
		var bounds = null;
		
		if (!this.zoom)
		{
			var scale = this.outline.getView().scale;
			bounds = new bpmRectangle(this.bounds.x + dx,
				this.bounds.y + dy, this.bounds.width, this.bounds.height);
			this.selectionBorder.bounds = bounds;
			this.selectionBorder.redraw();
			dx /= scale;
			dx *= this.source.getView().scale;
			dy /= scale;
			dy *= this.source.getView().scale;
			this.source.panGraph(-dx - this.dx0, -dy - this.dy0);
		}
		else
		{
			var container = this.source.container;
			var viewRatio = container.clientWidth / container.clientHeight;
			dy = dx / viewRatio;
			bounds = new bpmRectangle(this.bounds.x,
				this.bounds.y,
				Math.max(1, this.bounds.width + dx),
				Math.max(1, this.bounds.height + dy));
			this.selectionBorder.bounds = bounds;
			this.selectionBorder.redraw();
		}
		
		var b = this.sizer.bounds;
		this.sizer.bounds = new bpmRectangle(
			bounds.x + bounds.width - b.width / 2,
			bounds.y + bounds.height - b.height / 2,
			b.width, b.height);
		
		if (this.sizer.node.style.visibility != 'hidden')
		{
			this.sizer.redraw();
		}
		
		me.consume();
	}
};

bpmOutline.prototype.getTranslateForEvent = function(me)
{
	return new bpmPoint(me.getX() - this.startX, me.getY() - this.startY);
};

bpmOutline.prototype.mouseUp = function(sender, me)
{
	if (this.active)
	{
		var delta = this.getTranslateForEvent(me);
		var dx = delta.x;
		var dy = delta.y;
		
		if (Math.abs(dx) > 0 || Math.abs(dy) > 0)
		{
			if (!this.zoom)
			{
				if (!this.source.useScrollbarsForPanning ||
					!bpmUtils.hasScrollbars(this.source.container))
				{
					this.source.panGraph(0, 0);
					dx /= this.outline.getView().scale;
					dy /= this.outline.getView().scale;
					var t = this.source.getView().translate;
					this.source.getView().setTranslate(t.x - dx, t.y - dy);
				}
			}
			else
			{
				var w = this.selectionBorder.bounds.width;
				var scale = this.source.getView().scale;
				this.source.zoomTo(Math.max(this.minScale, scale - (dx * scale) / w), false);
			}

			this.update();
			me.consume();
		}
			
		this.index = null;
		this.active = false;
	}
};

bpmOutline.prototype.destroy = function()
{
	if (this.source != null)
	{
		this.source.removeListener(this.panHandler);
		this.source.removeListener(this.refreshHandler);
		this.source.getModel().removeListener(this.updateHandler);
		this.source.getView().removeListener(this.updateHandler);
		bpmEvent.removeListener(this.source.container, 'scroll', this.updateHandler);
		this.source = null;
	}
	
	if (this.outline != null)
	{
		this.outline.removeMouseListener(this);
		this.outline.destroy();
		this.outline = null;
	}

	if (this.selectionBorder != null)
	{
		this.selectionBorder.destroy();
		this.selectionBorder = null;
	}
	
	if (this.sizer != null)
	{
		this.sizer.destroy();
		this.sizer = null;
	}
};



/* Multiplicity */
function bpmMultiplicity(source, type, attr, value, min, max,
	validNeighbors, countError, typeError, validNeighborsAllowed)
{
	this.source = source;
	this.type = type;
	this.attr = attr;
	this.value = value;
	this.min = (min != null) ? min : 0;
	this.max = (max != null) ? max : 'n';
	this.validNeighbors = validNeighbors;
	this.countError = bpmResources.get(countError) || countError;
	this.typeError = bpmResources.get(typeError) || typeError;
	this.validNeighborsAllowed = (validNeighborsAllowed != null) ?
		validNeighborsAllowed : true;
};

bpmMultiplicity.prototype.type = null;
bpmMultiplicity.prototype.attr = null;
bpmMultiplicity.prototype.value = null;
bpmMultiplicity.prototype.source = null;
bpmMultiplicity.prototype.min = null;
bpmMultiplicity.prototype.max = null;
bpmMultiplicity.prototype.validNeighbors = null;
bpmMultiplicity.prototype.validNeighborsAllowed = true;
bpmMultiplicity.prototype.countError = null;
bpmMultiplicity.prototype.typeError = null;

bpmMultiplicity.prototype.check = function(graph, edge, source, target, sourceOut, targetIn)
{
	var error = '';

	if ((this.source && this.checkTerminal(graph, source, edge)) ||
		(!this.source && this.checkTerminal(graph, target, edge)))
	{
		if (this.countError != null && 
			((this.source && (this.max == 0 || (sourceOut >= this.max))) ||
			(!this.source && (this.max == 0 || (targetIn >= this.max)))))
		{
			error += this.countError + '\n';
		}

		if (this.validNeighbors != null && this.typeError != null && this.validNeighbors.length > 0)
		{
			var isValid = this.checkNeighbors(graph, edge, source, target);

			if (!isValid)
			{
				error += this.typeError + '\n';
			}
		}
	}
	
	return (error.length > 0) ? error : null;
};

bpmMultiplicity.prototype.checkNeighbors = function(graph, edge, source, target)
{
	var sourceValue = graph.model.getValue(source);
	var targetValue = graph.model.getValue(target);
	var isValid = !this.validNeighborsAllowed;
	var valid = this.validNeighbors;
	
	for (var j = 0; j < valid.length; j++)
	{
		if (this.source &&
			this.checkType(graph, targetValue, valid[j]))
		{
			isValid = this.validNeighborsAllowed;
			break;
		}
		else if (!this.source && 
			this.checkType(graph, sourceValue, valid[j]))
		{
			isValid = this.validNeighborsAllowed;
			break;
		}
	}
	
	return isValid;
};

bpmMultiplicity.prototype.checkTerminal = function(graph, terminal, edge)
{
	var value = graph.model.getValue(terminal);
	
	return this.checkType(graph, value, this.type, this.attr, this.value);
};

bpmMultiplicity.prototype.checkType = function(graph, value, type, attr, attrValue)
{
	if (value != null)
	{
		if (!isNaN(value.nodeType))
		{
			return bpmUtils.isNode(value, type, attr, attrValue);
		}
		else
		{
			return value == type;
		}
	}
	
	return false;
};



/* Layout Manager */
function bpmLayoutManager(graph)
{
	this.undoHandler = bpmUtils.bind(this, function(sender, evt)
	{
		if (this.isEnabled())
		{
			this.beforeUndo(evt.getProperty('edit'));
		}
	});
	
	this.moveHandler = bpmUtils.bind(this, function(sender, evt)
	{
		if (this.isEnabled())
		{
			this.cellsMoved(evt.getProperty('cells'), evt.getProperty('event'));
		}
	});
	
	this.setGraph(graph);
};

bpmLayoutManager.prototype = new bpmEventSource();
bpmLayoutManager.prototype.constructor = bpmLayoutManager;
bpmLayoutManager.prototype.graph = null;
bpmLayoutManager.prototype.bubbling = true;
bpmLayoutManager.prototype.enabled = true;
bpmLayoutManager.prototype.updateHandler = null;
bpmLayoutManager.prototype.moveHandler = null;

bpmLayoutManager.prototype.isEnabled = function()
{
	return this.enabled;
};

bpmLayoutManager.prototype.setEnabled = function(enabled)
{
	this.enabled = enabled;
};

bpmLayoutManager.prototype.isBubbling = function()
{
	return this.bubbling;
};

bpmLayoutManager.prototype.setBubbling = function(value)
{
	this.bubbling = value;
};

bpmLayoutManager.prototype.getGraph = function()
{
	return this.graph;
};

bpmLayoutManager.prototype.setGraph = function(graph)
{
	if (this.graph != null)
	{
		var model = this.graph.getModel();		
		model.removeListener(this.undoHandler);
		this.graph.removeListener(this.moveHandler);
	}
	
	this.graph = graph;
	
	if (this.graph != null)
	{
		var model = this.graph.getModel();	
		model.addListener(bpmEvent.BEFORE_UNDO, this.undoHandler);
		this.graph.addListener(bpmEvent.MOVE_CELLS, this.moveHandler);
	}
};

bpmLayoutManager.prototype.getLayout = function(parent)
{
	return null;
};

bpmLayoutManager.prototype.beforeUndo = function(undoableEdit)
{
	var cells = this.getCellsForChanges(undoableEdit.changes);
	var model = this.getGraph().getModel();

	var tmp = [];
	
	for (var i = 0; i < cells.length; i++)
	{
		tmp = tmp.concat(model.getDescendants(cells[i]));
	}
	
	cells = tmp;

	if (this.isBubbling())
	{
		tmp = model.getParents(cells);
		
		while (tmp.length > 0)
		{
			cells = cells.concat(tmp);
			tmp = model.getParents(tmp);
		}
	}
	
	this.executeLayoutForCells(cells);
};

bpmLayoutManager.prototype.executeLayoutForCells = function(cells)
{
	var sorted = bpmUtils.sortCells(cells, true);
	sorted = sorted.concat(sorted.slice().reverse());
	this.layoutCells(sorted);
};

bpmLayoutManager.prototype.cellsMoved = function(cells, evt)
{
	if (cells != null && evt != null)
	{
		var point = bpmUtils.convertPoint(this.getGraph().container,
			bpmEvent.getClientX(evt), bpmEvent.getClientY(evt));
		var model = this.getGraph().getModel();
		
		for (var i = 0; i < cells.length; i++)
		{
			var parent = model.getParent(cells[i]);
			
			if (bpmUtils.indexOf(cells, parent) < 0)
			{
				var layout = this.getLayout(parent);
	
				if (layout != null)
				{
					layout.moveCell(cells[i], point.x, point.y);
				}
			}
		}
	}
};

bpmLayoutManager.prototype.getCellsForChanges = function(changes)
{
	var dict = new bpmDictionary();
	var result = [];
	
	for (var i = 0; i < changes.length; i++)
	{
		var change = changes[i];
		
		if (change instanceof bpmRootChange)
		{
			return [];
		}
		else
		{
			var cells = this.getCellsForChange(change);
			
			for (var j = 0; j < cells.length; j++)
			{
				if (cells[j] != null && !dict.get(cells[j]))
				{
					dict.put(cells[j], true);
					result.push(cells[j]);
				}
			}
		}
	}
	
	return result;
};

bpmLayoutManager.prototype.getCellsForChange = function(change)
{
	var model = this.getGraph().getModel();
	
	if (change instanceof bpmChildChange)
	{
		return [change.child, change.previous, model.getParent(change.child)];
	}
	else if (change instanceof bpmTerminalChange || change instanceof bpmGeometryChange)
	{
		return [change.cell, model.getParent(change.cell)];
	}
	else if (change instanceof bpmVisibleChange || change instanceof bpmStyleChange)
	{
		return [change.cell];
	}
	
	return [];
};

bpmLayoutManager.prototype.layoutCells = function(cells)
{
	if (cells.length > 0)
	{
		var model = this.getGraph().getModel();
		
		model.beginUpdate();
		try 
		{
			var last = null;
			
			for (var i = 0; i < cells.length; i++)
			{
				if (cells[i] != model.getRoot() && cells[i] != last)
				{
					if (this.executeLayout(this.getLayout(cells[i]), cells[i]))
					{
						last = cells[i];
					}
				}
			}
			
			this.fireEvent(new bpmEventObject(bpmEvent.LAYOUT_CELLS, 'cells', cells));
		}
		finally
		{
			model.endUpdate();
		}
	}
};

bpmLayoutManager.prototype.executeLayout = function(layout, parent)
{
	var result = false;
	
	if (layout != null && parent != null)
	{
		layout.execute(parent);
		result = true;
	}
	
	return result;
};

bpmLayoutManager.prototype.destroy = function()
{
	this.setGraph(null);
};



/* Swimlane Manager */
function bpmSwimlaneManager(graph, horizontal, addEnabled, resizeEnabled)
{
	this.horizontal = (horizontal != null) ? horizontal : true;
	this.addEnabled = (addEnabled != null) ? addEnabled : true;
	this.resizeEnabled = (resizeEnabled != null) ? resizeEnabled : true;

	this.addHandler = bpmUtils.bind(this, function(sender, evt)
	{
		if (this.isEnabled() && this.isAddEnabled())
		{
			this.cellsAdded(evt.getProperty('cells'));
		}
	});
	
	this.resizeHandler = bpmUtils.bind(this, function(sender, evt)
	{
		if (this.isEnabled() && this.isResizeEnabled())
		{
			this.cellsResized(evt.getProperty('cells'));
		}
	});
	
	this.setGraph(graph);
};

bpmSwimlaneManager.prototype = new bpmEventSource();
bpmSwimlaneManager.prototype.constructor = bpmSwimlaneManager;
bpmSwimlaneManager.prototype.graph = null;
bpmSwimlaneManager.prototype.enabled = true;
bpmSwimlaneManager.prototype.horizontal = true;
bpmSwimlaneManager.prototype.addEnabled = true;
bpmSwimlaneManager.prototype.resizeEnabled = true;
bpmSwimlaneManager.prototype.addHandler = null;
bpmSwimlaneManager.prototype.resizeHandler = null;

bpmSwimlaneManager.prototype.isEnabled = function()
{
	return this.enabled;
};

bpmSwimlaneManager.prototype.setEnabled = function(value)
{
	this.enabled = value;
};

bpmSwimlaneManager.prototype.isHorizontal = function()
{
	return this.horizontal;
};

bpmSwimlaneManager.prototype.setHorizontal = function(value)
{
	this.horizontal = value;
};

bpmSwimlaneManager.prototype.isAddEnabled = function()
{
	return this.addEnabled;
};

bpmSwimlaneManager.prototype.setAddEnabled = function(value)
{
	this.addEnabled = value;
};

bpmSwimlaneManager.prototype.isResizeEnabled = function()
{
	return this.resizeEnabled;
};

bpmSwimlaneManager.prototype.setResizeEnabled = function(value)
{
	this.resizeEnabled = value;
};

bpmSwimlaneManager.prototype.getGraph = function()
{
	return this.graph;
};

bpmSwimlaneManager.prototype.setGraph = function(graph)
{
	if (this.graph != null)
	{
		this.graph.removeListener(this.addHandler);
		this.graph.removeListener(this.resizeHandler);
	}
	
	this.graph = graph;
	
	if (this.graph != null)
	{
		this.graph.addListener(bpmEvent.ADD_CELLS, this.addHandler);
		this.graph.addListener(bpmEvent.CELLS_RESIZED, this.resizeHandler);
	}
};

bpmSwimlaneManager.prototype.isSwimlaneIgnored = function(swimlane)
{
	return !this.getGraph().isSwimlane(swimlane);
};

bpmSwimlaneManager.prototype.isCellHorizontal = function(cell)
{
	if (this.graph.isSwimlane(cell))
	{
		var style = this.graph.getCellStyle(cell);
		
		return bpmUtils.getValue(style, bpmConstants.STYLE_HORIZONTAL, 1) == 1;
	}
	
	return !this.isHorizontal();
};

bpmSwimlaneManager.prototype.cellsAdded = function(cells)
{
	if (cells != null)
	{
		var model = this.getGraph().getModel();

		model.beginUpdate();
		try
		{
			for (var i = 0; i < cells.length; i++)
			{
				if (!this.isSwimlaneIgnored(cells[i]))
				{
					this.swimlaneAdded(cells[i]);
				}
			}
		}
		finally
		{
			model.endUpdate();
		}
	}
};

bpmSwimlaneManager.prototype.swimlaneAdded = function(swimlane)
{
	var model = this.getGraph().getModel();
	var parent = model.getParent(swimlane);
	var childCount = model.getChildCount(parent);
	var geo = null;
	
	for (var i = 0; i < childCount; i++)
	{
		var child = model.getChildAt(parent, i);
		
		if (child != swimlane && !this.isSwimlaneIgnored(child))
		{
			geo = model.getGeometry(child);
			
			if (geo != null)
			{	
				break;
			}
		}
	}
	
	if (geo != null)
	{
		var parentHorizontal = (parent != null) ? this.isCellHorizontal(parent) : this.horizontal;
		this.resizeSwimlane(swimlane, geo.width, geo.height, parentHorizontal);
	}
};

bpmSwimlaneManager.prototype.cellsResized = function(cells)
{
	if (cells != null)
	{
		var model = this.getGraph().getModel();
		
		model.beginUpdate();
		try
		{
			for (var i = 0; i < cells.length; i++)
			{
				if (!this.isSwimlaneIgnored(cells[i]))
				{
					var geo = model.getGeometry(cells[i]);

					if (geo != null)
					{
						var size = new bpmRectangle(0, 0, geo.width, geo.height);
						var top = cells[i];
						var current = top;
						
						while (current != null)
						{
							top = current;
							current = model.getParent(current);
							var tmp = (this.graph.isSwimlane(current)) ?
									this.graph.getStartSize(current) :
									new bpmRectangle();
							size.width += tmp.width;
							size.height += tmp.height;
						}
						
						var parentHorizontal = (current != null) ? this.isCellHorizontal(current) : this.horizontal;
						this.resizeSwimlane(top, size.width, size.height, parentHorizontal);
					}
				}
			}
		}
		finally
		{
			model.endUpdate();
		}
	}
};

bpmSwimlaneManager.prototype.resizeSwimlane = function(swimlane, w, h, parentHorizontal)
{
	var model = this.getGraph().getModel();
	
	model.beginUpdate();
	try
	{
		var horizontal = this.isCellHorizontal(swimlane);
		
		if (!this.isSwimlaneIgnored(swimlane))
		{
			var geo = model.getGeometry(swimlane);
			
			if (geo != null)
			{
				if ((parentHorizontal && geo.height != h) || (!parentHorizontal && geo.width != w))
				{
					geo = geo.clone();
					
					if (parentHorizontal)
					{
						geo.height = h;
					}
					else
					{
						geo.width = w;
					}

					model.setGeometry(swimlane, geo);
				}
			}
		}

		var tmp = (this.graph.isSwimlane(swimlane)) ?
				this.graph.getStartSize(swimlane) :
				new bpmRectangle();
		w -= tmp.width;
		h -= tmp.height;
		
		var childCount = model.getChildCount(swimlane);
		
		for (var i = 0; i < childCount; i++)
		{
			var child = model.getChildAt(swimlane, i);
			this.resizeSwimlane(child, w, h, horizontal);
		}
	}
	finally
	{
		model.endUpdate();
	}
};

bpmSwimlaneManager.prototype.destroy = function()
{
	this.setGraph(null);
};



/* Temporary Cell States */
function bpmTemporaryCellStates(view, scale, cells, isCellVisibleFn, getLinkForCellState)
{
	scale = (scale != null) ? scale : 1;
	this.view = view;
	
	this.oldValidateCellState = view.validateCellState;
	this.oldBounds = view.getGraphBounds();
	this.oldStates = view.getStates();
	this.oldScale = view.getScale();
	this.oldDoRedrawShape = view.graph.cellRenderer.doRedrawShape;

	var self = this;

	if (getLinkForCellState != null)
	{
		view.graph.cellRenderer.doRedrawShape = function(state)
		{
			var oldPaint = state.shape.paint;
			
			state.shape.paint = function(c)
			{
				var link = getLinkForCellState(state);
				
				if (link != null)
				{
					c.setLink(link);
				}
				
				oldPaint.apply(this, arguments);
				
				if (link != null)
				{
					c.setLink(null);
				}
			};
			
			self.oldDoRedrawShape.apply(view.graph.cellRenderer, arguments);
			state.shape.paint = oldPaint;
		};
	}

	view.validateCellState = function(cell, resurse)
	{
		if (cell == null || isCellVisibleFn == null || isCellVisibleFn(cell))
		{
			return self.oldValidateCellState.apply(view, arguments);
		}
		
		return null;
	};
	
	view.setStates(new bpmDictionary());
	view.setScale(scale);
	
	if (cells != null)
	{
		view.resetValidationState();
		var bbox = null;

		for (var i = 0; i < cells.length; i++)
		{
			var bounds = view.getBoundingBox(view.validateCellState(view.validateCell(cells[i])));
			
			if (bbox == null)
			{
				bbox = bounds;
			}
			else
			{
				bbox.add(bounds);
			}
		}

		view.setGraphBounds(bbox || new bpmRectangle());
	}
};

bpmTemporaryCellStates.prototype.view = null;
bpmTemporaryCellStates.prototype.oldStates = null;
bpmTemporaryCellStates.prototype.oldBounds = null;
bpmTemporaryCellStates.prototype.oldScale = null;

bpmTemporaryCellStates.prototype.destroy = function()
{
	this.view.setScale(this.oldScale);
	this.view.setStates(this.oldStates);
	this.view.setGraphBounds(this.oldBounds);
	this.view.validateCellState = this.oldValidateCellState;
	this.view.graph.cellRenderer.doRedrawShape = this.oldDoRedrawShape;
};


/* CellState Preview */
function bpmCellStatePreview(graph)
{
	this.deltas = new bpmDictionary();
	this.graph = graph;
};

bpmCellStatePreview.prototype.graph = null;
bpmCellStatePreview.prototype.deltas = null;
bpmCellStatePreview.prototype.count = 0;

bpmCellStatePreview.prototype.isEmpty = function()
{
	return this.count == 0;
};

bpmCellStatePreview.prototype.moveState = function(state, dx, dy, add, includeEdges)
{
	add = (add != null) ? add : true;
	includeEdges = (includeEdges != null) ? includeEdges : true;
	
	var delta = this.deltas.get(state.cell);

	if (delta == null)
	{
		// Note: Deltas stores the point and the state since the key is a string.
		delta = {point: new bpmPoint(dx, dy), state: state};
		this.deltas.put(state.cell, delta);
		this.count++;
	}
	else if (add)
	{
		delta.point.x += dx;
		delta.point.y += dy;
	}
	else
	{
		delta.point.x = dx;
		delta.point.y = dy;
	}
	
	if (includeEdges)
	{
		this.addEdges(state);
	}
	
	return delta.point;
};

/**
 * Function: show
 */
bpmCellStatePreview.prototype.show = function(visitor)
{
	this.deltas.visit(bpmUtils.bind(this, function(key, delta)
	{
		this.translateState(delta.state, delta.point.x, delta.point.y);
	}));
	
	this.deltas.visit(bpmUtils.bind(this, function(key, delta)
	{
		this.revalidateState(delta.state, delta.point.x, delta.point.y, visitor);
	}));
};

/**
 * Function: translateState
 */
bpmCellStatePreview.prototype.translateState = function(state, dx, dy)
{
	if (state != null)
	{
		var model = this.graph.getModel();
		
		if (model.isVertex(state.cell))
		{
			state.view.updateCellState(state);
			var geo = model.getGeometry(state.cell);
			
			if ((dx != 0 || dy != 0) && geo != null && (!geo.relative || this.deltas.get(state.cell) != null))
			{
				state.x += dx;
				state.y += dy;
			}
		}
	    
	    var childCount = model.getChildCount(state.cell);
	    
	    for (var i = 0; i < childCount; i++)
	    {
	    	this.translateState(state.view.getState(model.getChildAt(state.cell, i)), dx, dy);
	    }
	}
};

/**
 * Function: revalidateState
 */
bpmCellStatePreview.prototype.revalidateState = function(state, dx, dy, visitor)
{
	if (state != null)
	{
		var model = this.graph.getModel();
		
		if (model.isEdge(state.cell))
		{
			state.view.updateCellState(state);
		}

		var geo = this.graph.getCellGeometry(state.cell);
		var pState = state.view.getState(model.getParent(state.cell));
		
		// Moves selection vertices which are relative
		if ((dx != 0 || dy != 0) && geo != null && geo.relative &&
			model.isVertex(state.cell) && (pState == null ||
			model.isVertex(pState.cell) || this.deltas.get(state.cell) != null))
		{
			state.x += dx;
			state.y += dy;
		}
		
		this.graph.cellRenderer.redraw(state);
	
		// Invokes the visitor on the given state
		if (visitor != null)
		{
			visitor(state);
		}
						
	    var childCount = model.getChildCount(state.cell);
	    
	    for (var i = 0; i < childCount; i++)
	    {
	    	this.revalidateState(this.graph.view.getState(model.getChildAt(state.cell, i)), dx, dy, visitor);
	    }
	}
};

/**
 * Function: addEdges
 */
bpmCellStatePreview.prototype.addEdges = function(state)
{
	var model = this.graph.getModel();
	var edgeCount = model.getEdgeCount(state.cell);

	for (var i = 0; i < edgeCount; i++)
	{
		var s = state.view.getState(model.getEdgeAt(state.cell, i));

		if (s != null)
		{
			this.moveState(s, 0, 0);
		}
	}
};



/* Connection Constraint */
function bpmConnectionConstraint(point, perimeter, name, dx, dy)
{
	this.point = point;
	this.perimeter = (perimeter != null) ? perimeter : true;
	this.name = name;
	this.dx = dx? dx : 0;
	this.dy = dy? dy : 0;
};

bpmConnectionConstraint.prototype.point = null;
bpmConnectionConstraint.prototype.perimeter = null;
bpmConnectionConstraint.prototype.name = null;
bpmConnectionConstraint.prototype.dx = null;
bpmConnectionConstraint.prototype.dy = null;




/* Draw Layout */
function bpmGraphLayout(graph)
{
	this.graph = graph;
};

bpmGraphLayout.prototype.graph = null;
bpmGraphLayout.prototype.useBoundingBox = true;
bpmGraphLayout.prototype.parent = null;

bpmGraphLayout.prototype.moveCell = function(cell, x, y) { };

bpmGraphLayout.prototype.execute = function(parent) { };

bpmGraphLayout.prototype.getGraph = function()
{
	return this.graph;
};

bpmGraphLayout.prototype.getConstraint = function(key, cell, edge, source)
{
	var state = this.graph.view.getState(cell);
	var style = (state != null) ? state.style : this.graph.getCellStyle(cell);
	
	return (style != null) ? style[key] : null;
};

bpmGraphLayout.traverse = function(vertex, directed, func, edge, visited)
{
	if (func != null && vertex != null)
	{
		directed = (directed != null) ? directed : true;
		visited = visited || new bpmDictionary();
		
		if (!visited.get(vertex))
		{
			visited.put(vertex, true);
			var result = func(vertex, edge);
			
			if (result == null || result)
			{
				var edgeCount = this.graph.model.getEdgeCount(vertex);
				
				if (edgeCount > 0)
				{
					for (var i = 0; i < edgeCount; i++)
					{
						var e = this.graph.model.getEdgeAt(vertex, i);
						var isSource = this.graph.model.getTerminal(e, true) == vertex;
												
						if (!directed || isSource)
						{
							var next = this.graph.view.getVisibleTerminal(e, !isSource);
							this.traverse(next, directed, func, e, visited);
						}
					}
				}
			}
		}
	}
};

bpmGraphLayout.prototype.isAncestor = function(parent, child, traverseAncestors)
{
	if (!traverseAncestors)
	{
		return (this.graph.model.getParent(child) == parent);
	}	
	
	if (child == parent)
	{
		return false;
	}

	while (child != null && child != parent)
	{
		child = this.graph.model.getParent(child);
	}
	
	return child == parent;
};

bpmGraphLayout.prototype.isVertexMovable = function(cell)
{
	return this.graph.isCellMovable(cell);
};

bpmGraphLayout.prototype.isVertexIgnored = function(vertex)
{
	return !this.graph.getModel().isVertex(vertex) ||
		!this.graph.isCellVisible(vertex);
};

bpmGraphLayout.prototype.isEdgeIgnored = function(edge)
{
	var model = this.graph.getModel();
	
	return !model.isEdge(edge) ||
		!this.graph.isCellVisible(edge) ||
		model.getTerminal(edge, true) == null ||
		model.getTerminal(edge, false) == null;
};

bpmGraphLayout.prototype.setEdgeStyleEnabled = function(edge, value)
{
	this.graph.setCellStyles(bpmConstants.STYLE_NOEDGESTYLE,
			(value) ? '0' : '1', [edge]);
};

bpmGraphLayout.prototype.setOrthogonalEdge = function(edge, value)
{
	this.graph.setCellStyles(bpmConstants.STYLE_ORTHOGONAL,
			(value) ? '1' : '0', [edge]);
};

bpmGraphLayout.prototype.getParentOffset = function(parent)
{
	var result = new bpmPoint();

	if (parent != null && parent != this.parent)
	{
		var model = this.graph.getModel();

		if (model.isAncestor(this.parent, parent))
		{
			var parentGeo = model.getGeometry(parent);

			while (parent != this.parent)
			{
				result.x = result.x + parentGeo.x;
				result.y = result.y + parentGeo.y;

				parent = model.getParent(parent);;
				parentGeo = model.getGeometry(parent);
			}
		}
	}

	return result;
};

bpmGraphLayout.prototype.setEdgePoints = function(edge, points)
{
	if (edge != null)
	{
		var model = this.graph.model;
		var geometry = model.getGeometry(edge);

		if (geometry == null)
		{
			geometry = new bpmGeometry();
			geometry.setRelative(true);
		}
		else
		{
			geometry = geometry.clone();
		}

		if (this.parent != null && points != null)
		{
			var parent = model.getParent(edge);

			var parentOffset = this.getParentOffset(parent);

			for (var i = 0; i < points.length; i++)
			{
				points[i].x = points[i].x - parentOffset.x;
				points[i].y = points[i].y - parentOffset.y;
			}
		}

		geometry.points = points;
		model.setGeometry(edge, geometry);
	}
};

bpmGraphLayout.prototype.setVertexLocation = function(cell, x, y)
{
	var model = this.graph.getModel();
	var geometry = model.getGeometry(cell);
	var result = null;
	
	if (geometry != null)
	{
		result = new bpmRectangle(x, y, geometry.width, geometry.height);
		
		if (this.useBoundingBox)
		{
			var state = this.graph.getView().getState(cell);
			
			if (state != null && state.text != null && state.text.boundingBox != null)
			{
				var scale = this.graph.getView().scale;
				var box = state.text.boundingBox;
				
				if (state.text.boundingBox.x < state.x)
				{
					x += (state.x - box.x) / scale;
					result.width = box.width;
				}
				
				if (state.text.boundingBox.y < state.y)
				{
					y += (state.y - box.y) / scale;
					result.height = box.height;
				}
			}
		}

		if (this.parent != null)
		{
			var parent = model.getParent(cell);

			if (parent != null && parent != this.parent)
			{
				var parentOffset = this.getParentOffset(parent);

				x = x - parentOffset.x;
				y = y - parentOffset.y;
			}
		}

		if (geometry.x != x || geometry.y != y)
		{
			geometry = geometry.clone();
			geometry.x = x;
			geometry.y = y;
			
			model.setGeometry(cell, geometry);
		}
	}
	
	return result;
};

bpmGraphLayout.prototype.getVertexBounds = function(cell)
{
	var geo = this.graph.getModel().getGeometry(cell);

	if (this.useBoundingBox)
	{
		var state = this.graph.getView().getState(cell);

		if (state != null && state.text != null && state.text.boundingBox != null)
		{
			var scale = this.graph.getView().scale;
			var tmp = state.text.boundingBox;

			var dx0 = Math.max(state.x - tmp.x, 0) / scale;
			var dy0 = Math.max(state.y - tmp.y, 0) / scale;
			var dx1 = Math.max((tmp.x + tmp.width) - (state.x + state.width), 0) / scale;
  			var dy1 = Math.max((tmp.y + tmp.height) - (state.y + state.height), 0) / scale;

			geo = new bpmRectangle(geo.x - dx0, geo.y - dy0, geo.width + dx0 + dx1, geo.height + dy0 + dy1);
		}
	}

	if (this.parent != null)
	{
		var parent = this.graph.getModel().getParent(cell);
		geo = geo.clone();

		if (parent != null && parent != this.parent)
		{
			var parentOffset = this.getParentOffset(parent);
			geo.x = geo.x + parentOffset.x;
			geo.y = geo.y + parentOffset.y;
		}
	}

	return new bpmRectangle(geo.x, geo.y, geo.width, geo.height);
};

bpmGraphLayout.prototype.arrangeGroups = function(cells, border, topBorder, rightBorder, bottomBorder, leftBorder)
{
	return this.graph.updateGroupBounds(cells, border, true, topBorder, rightBorder, bottomBorder, leftBorder);
};

function WeightedCellSorter(cell, weightedValue)
{
	this.cell = cell;
	this.weightedValue = weightedValue;
};

WeightedCellSorter.prototype.weightedValue = 0;
WeightedCellSorter.prototype.nudge = false;
WeightedCellSorter.prototype.visited = false;
WeightedCellSorter.prototype.rankIndex = null;
WeightedCellSorter.prototype.cell = null;

WeightedCellSorter.prototype.compare = function(a, b)
{
	if (a != null && b != null)
	{
		if (b.weightedValue > a.weightedValue)
		{
			return -1;
		}
		else if (b.weightedValue < a.weightedValue)
		{
			return 1;
		}
		else
		{
			if (b.nudge)
			{
				return -1;
			}
			else
			{
				return 1;
			}
		}
	}
	else
	{
		return 0;
	}
};


/* Stack Layout */
function bpmStackLayout(graph, horizontal, spacing, x0, y0, border)
{
	bpmGraphLayout.call(this, graph);
	this.horizontal = (horizontal != null) ? horizontal : true;
	this.spacing = (spacing != null) ? spacing : 0;
	this.x0 = (x0 != null) ? x0 : 0;
	this.y0 = (y0 != null) ? y0 : 0;
	this.border = (border != null) ? border : 0;
};

bpmStackLayout.prototype = new bpmGraphLayout();
bpmStackLayout.prototype.constructor = bpmStackLayout;
bpmStackLayout.prototype.horizontal = null;
bpmStackLayout.prototype.spacing = null;
bpmStackLayout.prototype.x0 = null;
bpmStackLayout.prototype.y0 = null;
bpmStackLayout.prototype.border = 0;
bpmStackLayout.prototype.marginTop = 0;
bpmStackLayout.prototype.marginLeft = 0;
bpmStackLayout.prototype.marginRight = 0;
bpmStackLayout.prototype.marginBottom = 0;
bpmStackLayout.prototype.keepFirstLocation = false;
bpmStackLayout.prototype.fill = false;
bpmStackLayout.prototype.resizeParent = false;
bpmStackLayout.prototype.resizeParentMax = false;
bpmStackLayout.prototype.resizeLast = false;
bpmStackLayout.prototype.wrap = null;
bpmStackLayout.prototype.borderCollapse = true;
bpmStackLayout.prototype.allowGaps = false;
bpmStackLayout.prototype.gridSize = 0;

bpmStackLayout.prototype.isHorizontal = function()
{
	return this.horizontal;
};

bpmStackLayout.prototype.moveCell = function(cell, x, y)
{
	var model = this.graph.getModel();
	var parent = model.getParent(cell);
	var horizontal = this.isHorizontal();
	
	if (cell != null && parent != null)
	{
		var i = 0;
		var last = 0;
		var childCount = model.getChildCount(parent);
		var value = (horizontal) ? x : y;
		var pstate = this.graph.getView().getState(parent);

		if (pstate != null)
		{
			value -= (horizontal) ? pstate.x : pstate.y;
		}
		
		value /= this.graph.view.scale;
		
		for (i = 0; i < childCount; i++)
		{
			var child = model.getChildAt(parent, i);
			
			if (child != cell)
			{
				var bounds = model.getGeometry(child);
				
				if (bounds != null)
				{
					var tmp = (horizontal) ?
						bounds.x + bounds.width / 2 :
						bounds.y + bounds.height / 2;
					
					if (last <= value && tmp > value)
					{
						break;
					}
					
					last = tmp;
				}
			}
		}

		var idx = parent.getIndex(cell);
		idx = Math.max(0, i - ((i > idx) ? 1 : 0));

		model.add(parent, cell, idx);
	}
};

bpmStackLayout.prototype.getParentSize = function(parent)
{
	var model = this.graph.getModel();			
	var pgeo = model.getGeometry(parent);
	
	if (this.graph.container != null && ((pgeo == null &&
		model.isLayer(parent)) || parent == this.graph.getView().currentRoot))
	{
		var width = this.graph.container.offsetWidth - 1;
		var height = this.graph.container.offsetHeight - 1;
		pgeo = new bpmRectangle(0, 0, width, height);
	}
	
	return pgeo;
};

bpmStackLayout.prototype.getLayoutCells = function(parent)
{
	var model = this.graph.getModel();
	var childCount = model.getChildCount(parent);
	var cells = [];
	
	for (var i = 0; i < childCount; i++)
	{
		var child = model.getChildAt(parent, i);
		
		if (!this.isVertexIgnored(child) && this.isVertexMovable(child))
		{
			cells.push(child);
		}
	}
	
	if (this.allowGaps)
	{
		cells.sort(bpmUtils.bind(this, function(c1, c2)
		{
			var geo1 = this.graph.getCellGeometry(c1);
			var geo2 = this.graph.getCellGeometry(c2);
			
			return (geo1.y == geo2.y) ? 0 : ((geo1.y > geo2.y > 0) ? 1 : -1);
		}));
	}
	
	return cells;
};

bpmStackLayout.prototype.snap = function(value)
{
	if (this.gridSize != null && this.gridSize > 0)
	{
		value = Math.max(value, this.gridSize);
		
		if (value / this.gridSize > 1)
		{
			var mod = value % this.gridSize;
			value += mod > this.gridSize / 2 ? (this.gridSize - mod) : -mod;
		}
	}
	
	return value;
};

bpmStackLayout.prototype.execute = function(parent)
{
	if (parent != null)
	{
		var pgeo = this.getParentSize(parent);
		var horizontal = this.isHorizontal();
		var model = this.graph.getModel();	
		var fillValue = null;
		
		if (pgeo != null)
		{
			fillValue = (horizontal) ? pgeo.height - this.marginTop - this.marginBottom :
				pgeo.width - this.marginLeft - this.marginRight;
		}
		
		fillValue -= 2 * this.border;
		var x0 = this.x0 + this.border + this.marginLeft;
		var y0 = this.y0 + this.border + this.marginTop;
		
		if (this.graph.isSwimlane(parent))
		{
			var style = this.graph.getCellStyle(parent);
			var start = bpmUtils.getNumber(style, bpmConstants.STYLE_STARTSIZE, bpmConstants.DEFAULT_STARTSIZE);
			var horz = bpmUtils.getValue(style, bpmConstants.STYLE_HORIZONTAL, true) == 1;

			if (pgeo != null)
			{
				if (horz)
				{
					start = Math.min(start, pgeo.height);
				}
				else
				{
					start = Math.min(start, pgeo.width);
				}
			}
			
			if (horizontal == horz)
			{
				fillValue -= start;
			}

			if (horz)
			{
				y0 += start;
			}
			else
			{
				x0 += start;
			}
		}

		model.beginUpdate();
		try
		{
			var tmp = 0;
			var last = null;
			var lastValue = 0;
			var lastChild = null;
			var cells = this.getLayoutCells(parent);
			
			for (var i = 0; i < cells.length; i++)
			{
				var child = cells[i];
				var geo = model.getGeometry(child);
				
				if (geo != null)
				{
					geo = geo.clone();
					
					if (this.wrap != null && last != null)
					{
						if ((horizontal && last.x + last.width +
							geo.width + 2 * this.spacing > this.wrap) ||
							(!horizontal && last.y + last.height +
							geo.height + 2 * this.spacing > this.wrap))
						{
							last = null;
							
							if (horizontal)
							{
								y0 += tmp + this.spacing;
							}
							else
							{
								x0 += tmp + this.spacing;
							}
							
							tmp = 0;
						}	
					}
					
					tmp = Math.max(tmp, (horizontal) ? geo.height : geo.width);
					var sw = 0;
					
					if (!this.borderCollapse)
					{
						var childStyle = this.graph.getCellStyle(child);
						sw = bpmUtils.getNumber(childStyle, bpmConstants.STYLE_STROKEWIDTH, 1);
					}
					
					if (last != null)
					{
						var temp = lastValue + this.spacing + Math.floor(sw / 2);
						
						if (horizontal)
						{
							geo.x = this.snap(((this.allowGaps) ? Math.max(temp, geo.x) :
								temp) - this.marginLeft) + this.marginLeft;
						}
						else
						{
							geo.y = this.snap(((this.allowGaps) ? Math.max(temp, geo.y) :
								temp) - this.marginTop) + this.marginTop;
						}
					}
					else if (!this.keepFirstLocation)
					{
						if (horizontal)
						{
							geo.x = (this.allowGaps && geo.x > x0) ? Math.max(this.snap(geo.x -
								this.marginLeft) + this.marginLeft, x0) : x0;
						}
						else
						{
							geo.y = (this.allowGaps && geo.y > y0) ? Math.max(this.snap(geo.y -
								this.marginTop) + this.marginTop, y0) : y0;
						}
					}
					
					if (horizontal)
					{
						geo.y = y0;
					}
					else
					{
						geo.x = x0;
					}
					
					if (this.fill && fillValue != null)
					{
						if (horizontal)
						{
							geo.height = fillValue;
						}
						else
						{
							geo.width = fillValue;									
						}
					}
					
					if (horizontal)
					{
						geo.width = this.snap(geo.width);
					}
					else
					{
						geo.height = this.snap(geo.height);
					}
					
					this.setChildGeometry(child, geo);
					lastChild = child;
					last = geo;
					
					if (horizontal)
					{
						lastValue = last.x + last.width + Math.floor(sw / 2);
					}
					else
					{
						lastValue = last.y + last.height + Math.floor(sw / 2);
					}
				}
			}

			if (this.resizeParent && pgeo != null && last != null && !this.graph.isCellCollapsed(parent))
			{
				this.updateParentGeometry(parent, pgeo, last);
			}
			else if (this.resizeLast && pgeo != null && last != null && lastChild != null)
			{
				if (horizontal)
				{
					last.width = pgeo.width - last.x - this.spacing - this.marginRight - this.marginLeft;
				}
				else
				{
					last.height = pgeo.height - last.y - this.spacing - this.marginBottom;
				}
				
				this.setChildGeometry(lastChild, last);
			}
		}
		finally
		{
			model.endUpdate();
		}
	}
};

bpmStackLayout.prototype.setChildGeometry = function(child, geo)
{
	var geo2 = this.graph.getCellGeometry(child);
	
	if (geo2 == null || geo.x != geo2.x || geo.y != geo2.y ||
		geo.width != geo2.width || geo.height != geo2.height)
	{
		this.graph.getModel().setGeometry(child, geo);
	}
};

bpmStackLayout.prototype.updateParentGeometry = function(parent, pgeo, last)
{
	var horizontal = this.isHorizontal();
	var model = this.graph.getModel();	

	var pgeo2 = pgeo.clone();
	
	if (horizontal)
	{
		var tmp = last.x + last.width + this.marginRight + this.border;
		
		if (this.resizeParentMax)
		{
			pgeo2.width = Math.max(pgeo2.width, tmp);
		}
		else
		{
			pgeo2.width = tmp;
		}
	}
	else
	{
		var tmp = last.y + last.height + this.marginBottom + this.border;
		
		if (this.resizeParentMax)
		{
			pgeo2.height = Math.max(pgeo2.height, tmp);
		}
		else
		{
			pgeo2.height = tmp;
		}
	}
	
	if (pgeo.x != pgeo2.x || pgeo.y != pgeo2.y ||
		pgeo.width != pgeo2.width || pgeo.height != pgeo2.height)
	{
		model.setGeometry(parent, pgeo2);
	}
};



/* Partition Layout */
function bpmPartitionLayout(graph, horizontal, spacing, border)
{
	bpmGraphLayout.call(this, graph);
	this.horizontal = (horizontal != null) ? horizontal : true;
	this.spacing = spacing || 0;
	this.border = border || 0;
};

bpmPartitionLayout.prototype = new bpmGraphLayout();
bpmPartitionLayout.prototype.constructor = bpmPartitionLayout;
bpmPartitionLayout.prototype.horizontal = null;
bpmPartitionLayout.prototype.spacing = null;
bpmPartitionLayout.prototype.border = null;
bpmPartitionLayout.prototype.resizeVertices = true;

bpmPartitionLayout.prototype.isHorizontal = function()
{
	return this.horizontal;
};

bpmPartitionLayout.prototype.moveCell = function(cell, x, y)
{
	var model = this.graph.getModel();
	var parent = model.getParent(cell);
	
	if (cell != null &&
		parent != null)
	{
		var i = 0;
		var last = 0;
		var childCount = model.getChildCount(parent);
		
		for (i = 0; i < childCount; i++)
		{
			var child = model.getChildAt(parent, i);
			var bounds = this.getVertexBounds(child);
			
			if (bounds != null)
			{
				var tmp = bounds.x + bounds.width / 2;
				
				if (last < x && tmp > x)
				{
					break;
				}
				
				last = tmp;
			}
		}
		
		var idx = parent.getIndex(cell);
		idx = Math.max(0, i - ((i > idx) ? 1 : 0));
		
		model.add(parent, cell, idx);
	}
};

bpmPartitionLayout.prototype.execute = function(parent)
{
	var horizontal = this.isHorizontal();
	var model = this.graph.getModel();
	var pgeo = model.getGeometry(parent);
	
	if (this.graph.container != null &&
		((pgeo == null &&
		model.isLayer(parent)) ||
		parent == this.graph.getView().currentRoot))
	{
		var width = this.graph.container.offsetWidth - 1;
		var height = this.graph.container.offsetHeight - 1;
		pgeo = new bpmRectangle(0, 0, width, height);
	}

	if (pgeo != null)
	{
		var children = [];
		var childCount = model.getChildCount(parent);
		
		for (var i = 0; i < childCount; i++)
		{
			var child = model.getChildAt(parent, i);
			
			if (!this.isVertexIgnored(child) &&
				this.isVertexMovable(child))
			{
				children.push(child);
			}
		}
		
		var n = children.length;

		if (n > 0)
		{
			var x0 = this.border;
			var y0 = this.border;
			var other = (horizontal) ? pgeo.height : pgeo.width;
			other -= 2 * this.border;

			var size = (this.graph.isSwimlane(parent)) ?
				this.graph.getStartSize(parent) :
				new bpmRectangle();

			other -= (horizontal) ? size.height : size.width;
			x0 = x0 + size.width;
			y0 = y0 + size.height;

			var tmp = this.border + (n - 1) * this.spacing;
			var value = (horizontal) ?
				((pgeo.width - x0 - tmp) / n) :
				((pgeo.height - y0 - tmp) / n);
			
			if (value > 0)
			{
				model.beginUpdate();
				try
				{
					for (var i = 0; i < n; i++)
					{
						var child = children[i];
						var geo = model.getGeometry(child);
					
						if (geo != null)
						{
							geo = geo.clone();
							geo.x = x0;
							geo.y = y0;

							if (horizontal)
							{
								if (this.resizeVertices)
								{
									geo.width = value;
									geo.height = other;
								}
								
								x0 += value + this.spacing;
							}
							else
							{
								if (this.resizeVertices)
								{
									geo.height = value;
									geo.width = other;
								}
								
								y0 += value + this.spacing;
							}

							model.setGeometry(child, geo);
						}
					}
				}
				finally
				{
					model.endUpdate();
				}
			}
		}
	}
};



/* Compact Tree Layout */
function bpmCompactTreeLayout(graph, horizontal, invert)
{
	bpmGraphLayout.call(this, graph);
	this.horizontal = (horizontal != null) ? horizontal : true;
	this.invert = (invert != null) ? invert : false;
};

bpmCompactTreeLayout.prototype = new bpmGraphLayout();
bpmCompactTreeLayout.prototype.constructor = bpmCompactTreeLayout;

bpmCompactTreeLayout.prototype.horizontal = null;
bpmCompactTreeLayout.prototype.invert = null;
bpmCompactTreeLayout.prototype.resizeParent = true;
bpmCompactTreeLayout.prototype.maintainParentLocation = false;
bpmCompactTreeLayout.prototype.groupPadding = 10;
bpmCompactTreeLayout.prototype.groupPaddingTop = 0;
bpmCompactTreeLayout.prototype.groupPaddingRight = 0;
bpmCompactTreeLayout.prototype.groupPaddingBottom = 0;
bpmCompactTreeLayout.prototype.groupPaddingLeft = 0;
bpmCompactTreeLayout.prototype.parentsChanged = null;
bpmCompactTreeLayout.prototype.moveTree = false;
bpmCompactTreeLayout.prototype.visited = null;
bpmCompactTreeLayout.prototype.levelDistance = 10;
bpmCompactTreeLayout.prototype.nodeDistance = 20;
bpmCompactTreeLayout.prototype.resetEdges = true;
bpmCompactTreeLayout.prototype.prefHozEdgeSep = 5;
bpmCompactTreeLayout.prototype.prefVertEdgeOff = 4;
bpmCompactTreeLayout.prototype.minEdgeJetty = 8;
bpmCompactTreeLayout.prototype.channelBuffer = 4;
bpmCompactTreeLayout.prototype.edgeRouting = true;
bpmCompactTreeLayout.prototype.sortEdges = false;
bpmCompactTreeLayout.prototype.alignRanks = false;
bpmCompactTreeLayout.prototype.maxRankHeight = null;
bpmCompactTreeLayout.prototype.root = null;
bpmCompactTreeLayout.prototype.node = null;

bpmCompactTreeLayout.prototype.isVertexIgnored = function(vertex)
{
	return bpmGraphLayout.prototype.isVertexIgnored.apply(this, arguments) ||
		this.graph.getConnections(vertex).length == 0;
};

bpmCompactTreeLayout.prototype.isHorizontal = function()
{
	return this.horizontal;
};

bpmCompactTreeLayout.prototype.execute = function(parent, root)
{
	this.parent = parent;
	var model = this.graph.getModel();

	if (root == null)
	{
		if (this.graph.getEdges(parent, model.getParent(parent),
			this.invert, !this.invert, false).length > 0)
		{
			this.root = parent;
		}
		
		else
		{
			var roots = this.graph.findTreeRoots(parent, true, this.invert);
			
			if (roots.length > 0)
			{
				for (var i = 0; i < roots.length; i++)
				{
					if (!this.isVertexIgnored(roots[i]) &&
						this.graph.getEdges(roots[i], null,
							this.invert, !this.invert, false).length > 0)
					{
						this.root = roots[i];
						break;
					}
				}
			}
		}
	}
	else
	{
		this.root = root;
	}
	
	if (this.root != null)
	{
		if (this.resizeParent)
		{
			this.parentsChanged = new Object();
		}
		else
		{
			this.parentsChanged = null;
		}

		this.parentX = null;
		this.parentY = null;
		
		if (parent != this.root && model.isVertex(parent) != null && this.maintainParentLocation)
		{
			var geo = this.graph.getCellGeometry(parent);
			
			if (geo != null)
			{
				this.parentX = geo.x;
				this.parentY = geo.y;
			}
		}
		
		model.beginUpdate();
		
		try
		{
			this.visited = new Object();
			this.node = this.dfs(this.root, parent);
			
			if (this.alignRanks)
			{
				this.maxRankHeight = [];
				this.findRankHeights(this.node, 0);
				this.setCellHeights(this.node, 0);
			}
			
			if (this.node != null)
			{
				this.layout(this.node);
				var x0 = this.graph.gridSize;
				var y0 = x0;
				
				if (!this.moveTree)
				{
					var g = this.getVertexBounds(this.root);
					
					if (g != null)
					{
						x0 = g.x;
						y0 = g.y;
					}
				}
				
				var bounds = null;
				
				if (this.isHorizontal())
				{
					bounds = this.horizontalLayout(this.node, x0, y0);
				}
				else
				{
					bounds = this.verticalLayout(this.node, null, x0, y0);
				}

				if (bounds != null)
				{
					var dx = 0;
					var dy = 0;

					if (bounds.x < 0)
					{
						dx = Math.abs(x0 - bounds.x);
					}

					if (bounds.y < 0)
					{
						dy = Math.abs(y0 - bounds.y);	
					}

					if (dx != 0 || dy != 0)
					{
						this.moveNode(this.node, dx, dy);
					}
					
					if (this.resizeParent)
					{
						this.adjustParents();
					}

					if (this.edgeRouting)
					{
						this.localEdgeProcessing(this.node);
					}
				}
				
				if (this.parentX != null && this.parentY != null)
				{
					var geo = this.graph.getCellGeometry(parent);
					
					if (geo != null)
					{
						geo = geo.clone();
						geo.x = this.parentX;
						geo.y = this.parentY;
						model.setGeometry(parent, geo);
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

bpmCompactTreeLayout.prototype.moveNode = function(node, dx, dy)
{
	node.x += dx;
	node.y += dy;
	this.apply(node);
	
	var child = node.child;
	
	while (child != null)
	{
		this.moveNode(child, dx, dy);
		child = child.next;
	}
};

bpmCompactTreeLayout.prototype.sortOutgoingEdges = function(source, edges)
{
	var lookup = new bpmDictionary();
	
	edges.sort(function(e1, e2)
	{
		var end1 = e1.getTerminal(e1.getTerminal(false) == source);
		var p1 = lookup.get(end1);
		
		if (p1 == null)
		{
			p1 = bpmCellPath.create(end1).split(bpmCellPath.PATH_SEPARATOR);
			lookup.put(end1, p1);
		}

		var end2 = e2.getTerminal(e2.getTerminal(false) == source);
		var p2 = lookup.get(end2);
		
		if (p2 == null)
		{
			p2 = bpmCellPath.create(end2).split(bpmCellPath.PATH_SEPARATOR);
			lookup.put(end2, p2);
		}

		return bpmCellPath.compare(p1, p2);
	});
};

bpmCompactTreeLayout.prototype.findRankHeights = function(node, rank)
{
	if (this.maxRankHeight[rank] == null || this.maxRankHeight[rank] < node.height)
	{
		this.maxRankHeight[rank] = node.height;
	}

	var child = node.child;
	
	while (child != null)
	{
		this.findRankHeights(child, rank + 1);
		child = child.next;
	}
};

bpmCompactTreeLayout.prototype.setCellHeights = function(node, rank)
{
	if (this.maxRankHeight[rank] != null && this.maxRankHeight[rank] > node.height)
	{
		node.height = this.maxRankHeight[rank];
	}

	var child = node.child;
	
	while (child != null)
	{
		this.setCellHeights(child, rank + 1);
		child = child.next;
	}
};

bpmCompactTreeLayout.prototype.dfs = function(cell, parent)
{
	var id = bpmCellPath.create(cell);
	var node = null;
	
	if (cell != null && this.visited[id] == null && !this.isVertexIgnored(cell))
	{
		this.visited[id] = cell;
		node = this.createNode(cell);

		var model = this.graph.getModel();
		var prev = null;
		var out = this.graph.getEdges(cell, parent, this.invert, !this.invert, false, true);
		var view = this.graph.getView();
		
		if (this.sortEdges)
		{
			this.sortOutgoingEdges(cell, out);
		}

		for (var i = 0; i < out.length; i++)
		{
			var edge = out[i];
			
			if (!this.isEdgeIgnored(edge))
			{
				if (this.resetEdges)
				{
					this.setEdgePoints(edge, null);
				}
				
				if (this.edgeRouting)
				{
					this.setEdgeStyleEnabled(edge, false);
					this.setEdgePoints(edge, null);
				}
				
				var state = view.getState(edge);
				var target = (state != null) ? state.getVisibleTerminal(this.invert) : view.getVisibleTerminal(edge, this.invert);
				var tmp = this.dfs(target, parent);
				
				if (tmp != null && model.getGeometry(target) != null)
				{
					if (prev == null)
					{
						node.child = tmp;
					}
					else
					{
						prev.next = tmp;
					}
					
					prev = tmp;
				}
			}
		}
	}
	
	return node;
};

bpmCompactTreeLayout.prototype.layout = function(node)
{
	if (node != null)
	{
		var child = node.child;
		
		while (child != null)
		{
			this.layout(child);
			child = child.next;
		}
		
		if (node.child != null)
		{
			this.attachParent(node, this.join(node));
		}
		else
		{
			this.layoutLeaf(node);
		}
	}
};

bpmCompactTreeLayout.prototype.horizontalLayout = function(node, x0, y0, bounds)
{
	node.x += x0 + node.offsetX;
	node.y += y0 + node.offsetY;
	bounds = this.apply(node, bounds);
	var child = node.child;
	
	if (child != null)
	{
		bounds = this.horizontalLayout(child, node.x, node.y, bounds);
		var siblingOffset = node.y + child.offsetY;
		var s = child.next;
		
		while (s != null)
		{
			bounds = this.horizontalLayout(s, node.x + child.offsetX, siblingOffset, bounds);
			siblingOffset += s.offsetY;
			s = s.next;
		}
	}
	
	return bounds;
};

bpmCompactTreeLayout.prototype.verticalLayout = function(node, parent, x0, y0, bounds)
{
	node.x += x0 + node.offsetY;
	node.y += y0 + node.offsetX;
	bounds = this.apply(node, bounds);
	var child = node.child;
	
	if (child != null)
	{
		bounds = this.verticalLayout(child, node, node.x, node.y, bounds);
		var siblingOffset = node.x + child.offsetY;
		var s = child.next;
		
		while (s != null)
		{
			bounds = this.verticalLayout(s, node, siblingOffset, node.y + child.offsetX, bounds);
			siblingOffset += s.offsetY;
			s = s.next;
		}
	}
	
	return bounds;
};

bpmCompactTreeLayout.prototype.attachParent = function(node, height)
{
	var x = this.nodeDistance + this.levelDistance;
	var y2 = (height - node.width) / 2 - this.nodeDistance;
	var y1 = y2 + node.width + 2 * this.nodeDistance - height;
	
	node.child.offsetX = x + node.height;
	node.child.offsetY = y1;
	
	node.contour.upperHead = this.createLine(node.height, 0,
		this.createLine(x, y1, node.contour.upperHead));
	node.contour.lowerHead = this.createLine(node.height, 0,
		this.createLine(x, y2, node.contour.lowerHead));
};

bpmCompactTreeLayout.prototype.layoutLeaf = function(node)
{
	var dist = 2 * this.nodeDistance;
	
	node.contour.upperTail = this.createLine(
		node.height + dist, 0);
	node.contour.upperHead = node.contour.upperTail;
	node.contour.lowerTail = this.createLine(
		0, -node.width - dist);
	node.contour.lowerHead = this.createLine(
		node.height + dist, 0, node.contour.lowerTail);
};

bpmCompactTreeLayout.prototype.join = function(node)
{
	var dist = 2 * this.nodeDistance;
	
	var child = node.child;
	node.contour = child.contour;
	var h = child.width + dist;
	var sum = h;
	child = child.next;
	
	while (child != null)
	{
		var d = this.merge(node.contour, child.contour);
		child.offsetY = d + h;
		child.offsetX = 0;
		h = child.width + dist;
		sum += d + h;
		child = child.next;
	}
	
	return sum;
};

bpmCompactTreeLayout.prototype.merge = function(p1, p2)
{
	var x = 0;
	var y = 0;
	var total = 0;
	
	var upper = p1.lowerHead;
	var lower = p2.upperHead;
	
	while (lower != null && upper != null)
	{
		var d = this.offset(x, y, lower.dx, lower.dy,
			upper.dx, upper.dy);
		y += d;
		total += d;
		
		if (x + lower.dx <= upper.dx)
		{
			x += lower.dx;
			y += lower.dy;
			lower = lower.next;
		}
		else
		{				
			x -= upper.dx;
			y -= upper.dy;
			upper = upper.next;
		}
	}
	
	if (lower != null)
	{
		var b = this.bridge(p1.upperTail, 0, 0, lower, x, y);
		p1.upperTail = (b.next != null) ? p2.upperTail : b;
		p1.lowerTail = p2.lowerTail;
	}
	else
	{
		var b = this.bridge(p2.lowerTail, x, y, upper, 0, 0);
		
		if (b.next == null)
		{
			p1.lowerTail = b;
		}
	}
	
	p1.lowerHead = p2.lowerHead;
	
	return total;
};

bpmCompactTreeLayout.prototype.offset = function(p1, p2, a1, a2, b1, b2)
{
	var d = 0;
	
	if (b1 <= p1 || p1 + a1 <= 0)
	{
		return 0;
	}

	var t = b1 * a2 - a1 * b2;
	
	if (t > 0)
	{
		if (p1 < 0)
		{
			var s = p1 * a2;
			d = s / a1 - p2;
		}
		else if (p1 > 0)
		{
			var s = p1 * b2;
			d = s / b1 - p2;
		}
		else
		{
			d = -p2;
		}
	}
	else if (b1 < p1 + a1)
	{
		var s = (b1 - p1) * a2;
		d = b2 - (p2 + s / a1);
	}
	else if (b1 > p1 + a1)
	{
		var s = (a1 + p1) * b2;
		d = s / b1 - (p2 + a2);
	}
	else
	{
		d = b2 - (p2 + a2);
	}

	if (d > 0)
	{
		return d;
	}
	else
	{
		return 0;
	}
};

bpmCompactTreeLayout.prototype.bridge = function(line1, x1, y1, line2, x2, y2)
{
	var dx = x2 + line2.dx - x1;
	var dy = 0;
	var s = 0;
	
	if (line2.dx == 0)
	{
		dy = line2.dy;
	}
	else
	{
		s = dx * line2.dy;
		dy = s / line2.dx;
	}
	
	var r = this.createLine(dx, dy, line2.next);
	line1.next = this.createLine(0, y2 + line2.dy - dy - y1, r);
	
	return r;
};

bpmCompactTreeLayout.prototype.createNode = function(cell)
{
	var node = new Object();
	node.cell = cell;
	node.x = 0;
	node.y = 0;
	node.width = 0;
	node.height = 0;
	
	var geo = this.getVertexBounds(cell);
	
	if (geo != null)
	{
		if (this.isHorizontal())
		{
			node.width = geo.height;
			node.height = geo.width;			
		}
		else
		{
			node.width = geo.width;
			node.height = geo.height;
		}
	}
	
	node.offsetX = 0;
	node.offsetY = 0;
	node.contour = new Object();
	
	return node;
};

bpmCompactTreeLayout.prototype.apply = function(node, bounds)
{
	var model = this.graph.getModel();
	var cell = node.cell;
	var g = model.getGeometry(cell);

	if (cell != null && g != null)
	{
		if (this.isVertexMovable(cell))
		{
			g = this.setVertexLocation(cell, node.x, node.y);
			
			if (this.resizeParent)
			{
				var parent = model.getParent(cell);
				var id = bpmCellPath.create(parent);
				
				if (this.parentsChanged[id] == null)
				{
					this.parentsChanged[id] = parent;					
				}
			}
		}
		
		if (bounds == null)
		{
			bounds = new bpmRectangle(g.x, g.y, g.width, g.height);
		}
		else
		{
			bounds = new bpmRectangle(Math.min(bounds.x, g.x),
				Math.min(bounds.y, g.y),
				Math.max(bounds.x + bounds.width, g.x + g.width),
				Math.max(bounds.y + bounds.height, g.y + g.height));
		}
	}
	
	return bounds;
};

bpmCompactTreeLayout.prototype.createLine = function(dx, dy, next)
{
	var line = new Object();
	line.dx = dx;
	line.dy = dy;
	line.next = next;
	
	return line;
};

bpmCompactTreeLayout.prototype.adjustParents = function()
{
	var tmp = [];
	
	for (var id in this.parentsChanged)
	{
		tmp.push(this.parentsChanged[id]);
	}
	
	this.arrangeGroups(bpmUtils.sortCells(tmp, true), this.groupPadding, this.groupPaddingTop,
		this.groupPaddingRight, this.groupPaddingBottom, this.groupPaddingLeft);
};

bpmCompactTreeLayout.prototype.localEdgeProcessing = function(node)
{
	this.processNodeOutgoing(node);
	var child = node.child;

	while (child != null)
	{
		this.localEdgeProcessing(child);
		child = child.next;
	}
};

bpmCompactTreeLayout.prototype.processNodeOutgoing = function(node)
{
	var child = node.child;
	var parentCell = node.cell;

	var childCount = 0;
	var sortedCells = [];

	while (child != null)
	{
		childCount++;

		var sortingCriterion = child.x;

		if (this.horizontal)
		{
			sortingCriterion = child.y;
		}

		sortedCells.push(new WeightedCellSorter(child, sortingCriterion));
		child = child.next;
	}

	sortedCells.sort(WeightedCellSorter.prototype.compare);

	var availableWidth = node.width;

	var requiredWidth = (childCount + 1) * this.prefHozEdgeSep;

	if (availableWidth > requiredWidth + (2 * this.prefHozEdgeSep))
	{
		availableWidth -= 2 * this.prefHozEdgeSep;
	}

	var edgeSpacing = availableWidth / childCount;

	var currentXOffset = edgeSpacing / 2.0;

	if (availableWidth > requiredWidth + (2 * this.prefHozEdgeSep))
	{
		currentXOffset += this.prefHozEdgeSep;
	}

	var currentYOffset = this.minEdgeJetty - this.prefVertEdgeOff;
	var maxYOffset = 0;

	var parentBounds = this.getVertexBounds(parentCell);
	child = node.child;

	for (var j = 0; j < sortedCells.length; j++)
	{
		var childCell = sortedCells[j].cell.cell;
		var childBounds = this.getVertexBounds(childCell);

		var edges = this.graph.getEdgesBetween(parentCell,
				childCell, false);
		
		var newPoints = [];
		var x = 0;
		var y = 0;

		for (var i = 0; i < edges.length; i++)
		{
			if (this.horizontal)
			{
				x = parentBounds.x + parentBounds.width;
				y = parentBounds.y + currentXOffset;
				newPoints.push(new bpmPoint(x, y));
				x = parentBounds.x + parentBounds.width
						+ currentYOffset;
				newPoints.push(new bpmPoint(x, y));
				y = childBounds.y + childBounds.height / 2.0;
				newPoints.push(new bpmPoint(x, y));
				this.setEdgePoints(edges[i], newPoints);
			}
			else
			{
				x = parentBounds.x + currentXOffset;
				y = parentBounds.y + parentBounds.height;
				newPoints.push(new bpmPoint(x, y));
				y = parentBounds.y + parentBounds.height
						+ currentYOffset;
				newPoints.push(new bpmPoint(x, y));
				x = childBounds.x + childBounds.width / 2.0;
				newPoints.push(new bpmPoint(x, y));
				this.setEdgePoints(edges[i], newPoints);
			}
		}

		if (j < childCount / 2)
		{
			currentYOffset += this.prefVertEdgeOff;
		}
		else if (j > childCount / 2)
		{
			currentYOffset -= this.prefVertEdgeOff;
		}
		
		currentXOffset += edgeSpacing;

		maxYOffset = Math.max(maxYOffset, currentYOffset);
	}
};


/* Radial Tree Layout */
function bpmRadialTreeLayout(graph)
{
	bpmCompactTreeLayout.call(this, graph , false);
};

bpmUtils.extend(bpmRadialTreeLayout, bpmCompactTreeLayout);
bpmRadialTreeLayout.prototype.angleOffset = 0.5;
bpmRadialTreeLayout.prototype.rootx = 0;
bpmRadialTreeLayout.prototype.rooty = 0;
bpmRadialTreeLayout.prototype.levelDistance = 120;
bpmRadialTreeLayout.prototype.nodeDistance = 10;
bpmRadialTreeLayout.prototype.autoRadius = false;
bpmRadialTreeLayout.prototype.sortEdges = false;
bpmRadialTreeLayout.prototype.rowMinX = [];
bpmRadialTreeLayout.prototype.rowMaxX = [];
bpmRadialTreeLayout.prototype.rowMinCenX = [];
bpmRadialTreeLayout.prototype.rowMaxCenX = [];
bpmRadialTreeLayout.prototype.rowRadi = [];
bpmRadialTreeLayout.prototype.row = [];

bpmRadialTreeLayout.prototype.isVertexIgnored = function(vertex)
{
	return bpmGraphLayout.prototype.isVertexIgnored.apply(this, arguments) ||
		this.graph.getConnections(vertex).length == 0;
};

bpmRadialTreeLayout.prototype.execute = function(parent, root)
{
	this.parent = parent;
	
	this.useBoundingBox = false;
	this.edgeRouting = false;

	bpmCompactTreeLayout.prototype.execute.apply(this, arguments);
	
	var bounds = null;
	var rootBounds = this.getVertexBounds(this.root);
	this.centerX = rootBounds.x + rootBounds.width / 2;
	this.centerY = rootBounds.y + rootBounds.height / 2;

	for (var vertex in this.visited)
	{
		var vertexBounds = this.getVertexBounds(this.visited[vertex]);
		bounds = (bounds != null) ? bounds : vertexBounds.clone();
		bounds.add(vertexBounds);
	}
	
	this.calcRowDims([this.node], 0);
	
	var maxLeftGrad = 0;
	var maxRightGrad = 0;

	for (var i = 0; i < this.row.length; i++)
	{
		var leftGrad = (this.centerX - this.rowMinX[i] - this.nodeDistance) / this.rowRadi[i];
		var rightGrad = (this.rowMaxX[i] - this.centerX - this.nodeDistance) / this.rowRadi[i];
		
		maxLeftGrad = Math.max (maxLeftGrad, leftGrad);
		maxRightGrad = Math.max (maxRightGrad, rightGrad);
	}
	
	for (var i = 0; i < this.row.length; i++)
	{
		var xLeftLimit = this.centerX - this.nodeDistance - maxLeftGrad * this.rowRadi[i];
		var xRightLimit = this.centerX + this.nodeDistance + maxRightGrad * this.rowRadi[i];
		var fullWidth = xRightLimit - xLeftLimit;
		
		for (var j = 0; j < this.row[i].length; j ++)
		{
			var row = this.row[i];
			var node = row[j];
			var vertexBounds = this.getVertexBounds(node.cell);
			var xProportion = (vertexBounds.x + vertexBounds.width / 2 - xLeftLimit) / (fullWidth);
			var theta =  2 * Math.PI * xProportion;
			node.theta = theta;
		}
	}

	for (var i = this.row.length - 2; i >= 0; i--)
	{
		var row = this.row[i];
		
		for (var j = 0; j < row.length; j++)
		{
			var node = row[j];
			var child = node.child;
			var counter = 0;
			var totalTheta = 0;
			
			while (child != null)
			{
				totalTheta += child.theta;
				counter++;
				child = child.next;
			}
			
			if (counter > 0)
			{
				var averTheta = totalTheta / counter;
				
				if (averTheta > node.theta && j < row.length - 1)
				{
					var nextTheta = row[j+1].theta;
					node.theta = Math.min (averTheta, nextTheta - Math.PI/10);
				}
				else if (averTheta < node.theta && j > 0 )
				{
					var lastTheta = row[j-1].theta;
					node.theta = Math.max (averTheta, lastTheta + Math.PI/10);
				}
			}
		}
	}
	
	for (var i = 0; i < this.row.length; i++)
	{
		for (var j = 0; j < this.row[i].length; j ++)
		{
			var row = this.row[i];
			var node = row[j];
			var vertexBounds = this.getVertexBounds(node.cell);
			this.setVertexLocation(node.cell,
									this.centerX - vertexBounds.width / 2 + this.rowRadi[i] * Math.cos(node.theta),
									this.centerY - vertexBounds.height / 2 + this.rowRadi[i] * Math.sin(node.theta));
		}
	}
};

bpmRadialTreeLayout.prototype.calcRowDims = function(row, rowNum)
{
	if (row == null || row.length == 0)
	{
		return;
	}

	this.rowMinX[rowNum] = this.centerX;
	this.rowMaxX[rowNum] = this.centerX;
	this.rowMinCenX[rowNum] = this.centerX;
	this.rowMaxCenX[rowNum] = this.centerX;
	this.row[rowNum] = [];

	var rowHasChildren = false;

	for (var i = 0; i < row.length; i++)
	{
		var child = row[i] != null ? row[i].child : null;

		while (child != null)
		{
			var cell = child.cell;
			var vertexBounds = this.getVertexBounds(cell);
			
			this.rowMinX[rowNum] = Math.min(vertexBounds.x, this.rowMinX[rowNum]);
			this.rowMaxX[rowNum] = Math.max(vertexBounds.x + vertexBounds.width, this.rowMaxX[rowNum]);
			this.rowMinCenX[rowNum] = Math.min(vertexBounds.x + vertexBounds.width / 2, this.rowMinCenX[rowNum]);
			this.rowMaxCenX[rowNum] = Math.max(vertexBounds.x + vertexBounds.width / 2, this.rowMaxCenX[rowNum]);
			this.rowRadi[rowNum] = vertexBounds.y - this.getVertexBounds(this.root).y;
	
			if (child.child != null)
			{
				rowHasChildren = true;
			}
			
			this.row[rowNum].push(child);
			child = child.next;
		}
	}
	
	if (rowHasChildren)
	{
		this.calcRowDims(this.row[rowNum], rowNum + 1);
	}
};



/* Fast Organic Layout */
function bpmFastOrganicLayout(graph)
{
	bpmGraphLayout.call(this, graph);
};

bpmFastOrganicLayout.prototype = new bpmGraphLayout();
bpmFastOrganicLayout.prototype.constructor = bpmFastOrganicLayout;
bpmFastOrganicLayout.prototype.useInputOrigin = true;
bpmFastOrganicLayout.prototype.resetEdges = true;
bpmFastOrganicLayout.prototype.disableEdgeStyle = true;
bpmFastOrganicLayout.prototype.forceConstant = 50;
bpmFastOrganicLayout.prototype.forceConstantSquared = 0;
bpmFastOrganicLayout.prototype.minDistanceLimit = 2;
bpmFastOrganicLayout.prototype.maxDistanceLimit = 500;
bpmFastOrganicLayout.prototype.minDistanceLimitSquared = 4;
bpmFastOrganicLayout.prototype.initialTemp = 200;
bpmFastOrganicLayout.prototype.temperature = 0;
bpmFastOrganicLayout.prototype.maxIterations = 0;
bpmFastOrganicLayout.prototype.iteration = 0;
bpmFastOrganicLayout.prototype.vertexArray;
bpmFastOrganicLayout.prototype.dispX;
bpmFastOrganicLayout.prototype.dispY;
bpmFastOrganicLayout.prototype.cellLocation;
bpmFastOrganicLayout.prototype.radius;
bpmFastOrganicLayout.prototype.radiusSquared;
bpmFastOrganicLayout.prototype.isMoveable;
bpmFastOrganicLayout.prototype.neighbours;
bpmFastOrganicLayout.prototype.indices;
bpmFastOrganicLayout.prototype.allowedToRun = true;

bpmFastOrganicLayout.prototype.isVertexIgnored = function(vertex)
{
	return bpmGraphLayout.prototype.isVertexIgnored.apply(this, arguments) ||
		this.graph.getConnections(vertex).length == 0;
};

bpmFastOrganicLayout.prototype.execute = function(parent)
{
	var model = this.graph.getModel();
	this.vertexArray = [];
	var cells = this.graph.getChildVertices(parent);
	
	for (var i = 0; i < cells.length; i++)
	{
		if (!this.isVertexIgnored(cells[i]))
		{
			this.vertexArray.push(cells[i]);
		}
	}
	
	var initialBounds = (this.useInputOrigin) ?
			this.graph.getBoundingBoxFromGeometry(this.vertexArray) :
				null;
	var n = this.vertexArray.length;

	this.indices = [];
	this.dispX = [];
	this.dispY = [];
	this.cellLocation = [];
	this.isMoveable = [];
	this.neighbours = [];
	this.radius = [];
	this.radiusSquared = [];

	if (this.forceConstant < 0.001)
	{
		this.forceConstant = 0.001;
	}

	this.forceConstantSquared = this.forceConstant * this.forceConstant;

	for (var i = 0; i < this.vertexArray.length; i++)
	{
		var vertex = this.vertexArray[i];
		this.cellLocation[i] = [];
		
		var id = bpmObjectIdentity.get(vertex);
		this.indices[id] = i;
		var bounds = this.getVertexBounds(vertex);

		var width = bounds.width;
		var height = bounds.height;
		
		var x = bounds.x;
		var y = bounds.y;
		
		this.cellLocation[i][0] = x + width / 2.0;
		this.cellLocation[i][1] = y + height / 2.0;
		this.radius[i] = Math.min(width, height);
		this.radiusSquared[i] = this.radius[i] * this.radius[i];
	}

	model.beginUpdate();
	try
	{
		for (var i = 0; i < n; i++)
		{
			this.dispX[i] = 0;
			this.dispY[i] = 0;
			this.isMoveable[i] = this.isVertexMovable(this.vertexArray[i]);

			var edges = this.graph.getConnections(this.vertexArray[i], parent);
			var cells = this.graph.getOpposites(edges, this.vertexArray[i]);
			this.neighbours[i] = [];

			for (var j = 0; j < cells.length; j++)
			{
				if (this.resetEdges)
				{
					this.graph.resetEdge(edges[j]);
				}

			    if (this.disableEdgeStyle)
			    {
			    	this.setEdgeStyleEnabled(edges[j], false);
			    }

				var id = bpmObjectIdentity.get(cells[j]);
				var index = this.indices[id];

				if (index != null)
				{
					this.neighbours[i][j] = index;
				}

				else
				{
					this.neighbours[i][j] = i;
				}
			}
		}
		this.temperature = this.initialTemp;

		if (this.maxIterations == 0)
		{
			this.maxIterations = 20 * Math.sqrt(n);
		}
		
		for (this.iteration = 0; this.iteration < this.maxIterations; this.iteration++)
		{
			if (!this.allowedToRun)
			{
				return;
			}
			
			this.calcRepulsion();
			this.calcAttraction();
			this.calcPositions();
			this.reduceTemperature();
		}

		var minx = null;
		var miny = null;
		
		for (var i = 0; i < this.vertexArray.length; i++)
		{
			var vertex = this.vertexArray[i];
			
			if (this.isVertexMovable(vertex))
			{
				var bounds = this.getVertexBounds(vertex);
				
				if (bounds != null)
				{
					this.cellLocation[i][0] -= bounds.width / 2.0;
					this.cellLocation[i][1] -= bounds.height / 2.0;
					
					var x = this.graph.snap(Math.round(this.cellLocation[i][0]));
					var y = this.graph.snap(Math.round(this.cellLocation[i][1]));
					
					this.setVertexLocation(vertex, x, y);
					
					if (minx == null)
					{
						minx = x;
					}
					else
					{
						minx = Math.min(minx, x);
					}
					
					if (miny == null)
					{
						miny = y;
					}
					else
					{
						miny = Math.min(miny, y);
					}
				}
			}
		}
		
		var dx = -(minx || 0) + 1;
		var dy = -(miny || 0) + 1;
		
		if (initialBounds != null)
		{
			dx += initialBounds.x;
			dy += initialBounds.y;
		}
		
		this.graph.moveCells(this.vertexArray, dx, dy);
	}
	finally
	{
		model.endUpdate();
	}
};

bpmFastOrganicLayout.prototype.calcPositions = function()
{
	for (var index = 0; index < this.vertexArray.length; index++)
	{
		if (this.isMoveable[index])
		{
			var deltaLength = Math.sqrt(this.dispX[index] * this.dispX[index] +
				this.dispY[index] * this.dispY[index]);

			if (deltaLength < 0.001)
			{
				deltaLength = 0.001;
			}

			var newXDisp = this.dispX[index] / deltaLength
				* Math.min(deltaLength, this.temperature);

			var newYDisp = this.dispY[index] / deltaLength
				* Math.min(deltaLength, this.temperature);

			this.dispX[index] = 0;
			this.dispY[index] = 0;

			this.cellLocation[index][0] += newXDisp;
			this.cellLocation[index][1] += newYDisp;
		}
	}
};

bpmFastOrganicLayout.prototype.calcAttraction = function()
{
	for (var i = 0; i < this.vertexArray.length; i++)
	{
		for (var k = 0; k < this.neighbours[i].length; k++)
		{
			var j = this.neighbours[i][k];
			
			if (i != j &&
				this.isMoveable[i] &&
				this.isMoveable[j])
			{
				var xDelta = this.cellLocation[i][0] - this.cellLocation[j][0];
				var yDelta = this.cellLocation[i][1] - this.cellLocation[j][1];

				var deltaLengthSquared = xDelta * xDelta + yDelta
						* yDelta - this.radiusSquared[i] - this.radiusSquared[j];

				if (deltaLengthSquared < this.minDistanceLimitSquared)
				{
					deltaLengthSquared = this.minDistanceLimitSquared;
				}
				
				var deltaLength = Math.sqrt(deltaLengthSquared);
				var force = (deltaLengthSquared) / this.forceConstant;

				var displacementX = (xDelta / deltaLength) * force;
				var displacementY = (yDelta / deltaLength) * force;
				
				this.dispX[i] -= displacementX;
				this.dispY[i] -= displacementY;
				
				this.dispX[j] += displacementX;
				this.dispY[j] += displacementY;
			}
		}
	}
};

bpmFastOrganicLayout.prototype.calcRepulsion = function()
{
	var vertexCount = this.vertexArray.length;

	for (var i = 0; i < vertexCount; i++)
	{
		for (var j = i; j < vertexCount; j++)
		{
			if (!this.allowedToRun)
			{
				return;
			}

			if (j != i &&
				this.isMoveable[i] &&
				this.isMoveable[j])
			{
				var xDelta = this.cellLocation[i][0] - this.cellLocation[j][0];
				var yDelta = this.cellLocation[i][1] - this.cellLocation[j][1];

				if (xDelta == 0)
				{
					xDelta = 0.01 + Math.random();
				}
				
				if (yDelta == 0)
				{
					yDelta = 0.01 + Math.random();
				}
				
				var deltaLength = Math.sqrt((xDelta * xDelta)
						+ (yDelta * yDelta));
				var deltaLengthWithRadius = deltaLength - this.radius[i]
						- this.radius[j];

				if (deltaLengthWithRadius > this.maxDistanceLimit)
				{
					continue;
				}

				if (deltaLengthWithRadius < this.minDistanceLimit)
				{
					deltaLengthWithRadius = this.minDistanceLimit;
				}

				var force = this.forceConstantSquared / deltaLengthWithRadius;

				var displacementX = (xDelta / deltaLength) * force;
				var displacementY = (yDelta / deltaLength) * force;
				
				this.dispX[i] += displacementX;
				this.dispY[i] += displacementY;

				this.dispX[j] -= displacementX;
				this.dispY[j] -= displacementY;
			}
		}
	}
};

bpmFastOrganicLayout.prototype.reduceTemperature = function()
{
	this.temperature = this.initialTemp * (1.0 - this.iteration / this.maxIterations);
};



/* Circle Layout */
function bpmCircleLayout(graph, radius)
{
	bpmGraphLayout.call(this, graph);
	this.radius = (radius != null) ? radius : 100;
};

bpmCircleLayout.prototype = new bpmGraphLayout();
bpmCircleLayout.prototype.constructor = bpmCircleLayout;

bpmCircleLayout.prototype.radius = null;
bpmCircleLayout.prototype.moveCircle = false;
bpmCircleLayout.prototype.x0 = 0;
bpmCircleLayout.prototype.y0 = 0;
bpmCircleLayout.prototype.resetEdges = true;
bpmCircleLayout.prototype.disableEdgeStyle = true;

bpmCircleLayout.prototype.execute = function(parent)
{
	var model = this.graph.getModel();

	model.beginUpdate();
	try
	{
		var max = 0;
		var top = null;
		var left = null;
		var vertices = [];
		var childCount = model.getChildCount(parent);
		
		for (var i = 0; i < childCount; i++)
		{
			var cell = model.getChildAt(parent, i);
			
			if (!this.isVertexIgnored(cell))
			{
				vertices.push(cell);
				var bounds = this.getVertexBounds(cell);
				
				if (top == null)
				{
					top = bounds.y;
				}
				else
				{
					top = Math.min(top, bounds.y);
				}
				
				if (left == null)
				{
					left = bounds.x;
				}
				else
				{
					left = Math.min(left, bounds.x);
				}
				
				max = Math.max(max, Math.max(bounds.width, bounds.height));
			}
			else if (!this.isEdgeIgnored(cell))
			{
				if (this.resetEdges)
				{
					this.graph.resetEdge(cell);
				}

			    if (this.disableEdgeStyle)
			    {
			    		this.setEdgeStyleEnabled(cell, false);
			    }
			}
		}
		
		var r = this.getRadius(vertices.length, max);

		if (this.moveCircle)
		{
			left = this.x0;
			top = this.y0;
		}
		
		this.circle(vertices, r, left, top);
	}
	finally
	{
		model.endUpdate();
	}
};

bpmCircleLayout.prototype.getRadius = function(count, max)
{
	return Math.max(count * max / Math.PI, this.radius);
};

bpmCircleLayout.prototype.circle = function(vertices, r, left, top)
{
	var vertexCount = vertices.length;
	var phi = 2 * Math.PI / vertexCount;
	
	for (var i = 0; i < vertexCount; i++)
	{
		if (this.isVertexMovable(vertices[i]))
		{
			this.setVertexLocation(vertices[i],
				Math.round(left + r + r * Math.sin(i * phi)),
				Math.round(top + r + r * Math.cos(i * phi)));
		}
	}
};



/* Parallel Edge Layout */
function bpmParallelEdgeLayout(graph)
{
	bpmGraphLayout.call(this, graph);
};

bpmParallelEdgeLayout.prototype = new bpmGraphLayout();
bpmParallelEdgeLayout.prototype.constructor = bpmParallelEdgeLayout;
bpmParallelEdgeLayout.prototype.spacing = 20;

bpmParallelEdgeLayout.prototype.execute = function(parent)
{
	var lookup = this.findParallels(parent);
	
	this.graph.model.beginUpdate();	
	try
	{
		for (var i in lookup)
		{
			var parallels = lookup[i];

			if (parallels.length > 1)
			{
				this.layout(parallels);
			}
		}
	}
	finally
	{
		this.graph.model.endUpdate();
	}
};

bpmParallelEdgeLayout.prototype.findParallels = function(parent)
{
	var model = this.graph.getModel();
	var lookup = [];
	var childCount = model.getChildCount(parent);
	
	for (var i = 0; i < childCount; i++)
	{
		var child = model.getChildAt(parent, i);
		
		if (!this.isEdgeIgnored(child))
		{
			var id = this.getEdgeId(child);
			
			if (id != null)
			{
				if (lookup[id] == null)
				{
					lookup[id] = [];
				}
				
				lookup[id].push(child);
			}
		}
	}
	
	return lookup;
};

bpmParallelEdgeLayout.prototype.getEdgeId = function(edge)
{
	var view = this.graph.getView();
	
	var src = view.getVisibleTerminal(edge, true);
	var trg = view.getVisibleTerminal(edge, false);

	if (src != null && trg != null)
	{
		src = bpmObjectIdentity.get(src);
		trg = bpmObjectIdentity.get(trg);
		
		return (src > trg) ? trg + '-' + src : src + '-' + trg;
	}
	
	return null;
};

bpmParallelEdgeLayout.prototype.layout = function(parallels)
{
	var edge = parallels[0];
	var view = this.graph.getView();
	var model = this.graph.getModel();
	var src = model.getGeometry(view.getVisibleTerminal(edge, true));
	var trg = model.getGeometry(view.getVisibleTerminal(edge, false));
	
	if (src == trg)
	{
		var x0 = src.x + src.width + this.spacing;
		var y0 = src.y + src.height / 2;

		for (var i = 0; i < parallels.length; i++)
		{
			this.route(parallels[i], x0, y0);
			x0 += this.spacing;
		}
	}
	else if (src != null && trg != null)
	{
		var scx = src.x + src.width / 2;
		var scy = src.y + src.height / 2;
		
		var tcx = trg.x + trg.width / 2;
		var tcy = trg.y + trg.height / 2;
		
		var dx = tcx - scx;
		var dy = tcy - scy;

		var len = Math.sqrt(dx * dx + dy * dy);
		
		if (len > 0)
		{
			var x0 = scx + dx / 2;
			var y0 = scy + dy / 2;
			
			var nx = dy * this.spacing / len;
			var ny = dx * this.spacing / len;
			
			x0 += nx * (parallels.length - 1) / 2;
			y0 -= ny * (parallels.length - 1) / 2;
	
			for (var i = 0; i < parallels.length; i++)
			{
				this.route(parallels[i], x0, y0);
				x0 -= nx;
				y0 += ny;
			}
		}
	}
};

bpmParallelEdgeLayout.prototype.route = function(edge, x, y)
{
	if (this.graph.isCellMovable(edge))
	{
		this.setEdgePoints(edge, [new bpmPoint(x, y)]);
	}
};



/* Composite Layout */
function bpmCompositeLayout(graph, layouts, master)
{
	bpmGraphLayout.call(this, graph);
	this.layouts = layouts;
	this.master = master;
};

bpmCompositeLayout.prototype = new bpmGraphLayout();
bpmCompositeLayout.prototype.constructor = bpmCompositeLayout;
bpmCompositeLayout.prototype.layouts = null;
bpmCompositeLayout.prototype.master = null;

bpmCompositeLayout.prototype.moveCell = function(cell, x, y)
{
	if (this.master != null)
	{
		this.master.moveCell.apply(this.master, arguments);
	}
	else
	{
		this.layouts[0].moveCell.apply(this.layouts[0], arguments);
	}
};

bpmCompositeLayout.prototype.execute = function(parent)
{
	var model = this.graph.getModel();
	
	model.beginUpdate();
	try
	{
		for (var i = 0; i < this.layouts.length; i++)
		{
			this.layouts[i].execute.apply(this.layouts[i], arguments);
		}
	}
	finally
	{
		model.endUpdate();
	}
};



/* Edge Label Layout */
function bpmEdgeLabelLayout(graph, radius)
{
	bpmGraphLayout.call(this, graph);
};

bpmEdgeLabelLayout.prototype = new bpmGraphLayout();
bpmEdgeLabelLayout.prototype.constructor = bpmEdgeLabelLayout;

bpmEdgeLabelLayout.prototype.execute = function(parent)
{
	var view = this.graph.view;
	var model = this.graph.getModel();
	
	var edges = [];
	var vertices = [];
	var childCount = model.getChildCount(parent);
	
	for (var i = 0; i < childCount; i++)
	{
		var cell = model.getChildAt(parent, i);
		var state = view.getState(cell);
		
		if (state != null)
		{
			if (!this.isVertexIgnored(cell))
			{
				vertices.push(state);
			}
			else if (!this.isEdgeIgnored(cell))
			{
				edges.push(state);
			}
		}
	}
	
	this.placeLabels(vertices, edges);
};

bpmEdgeLabelLayout.prototype.placeLabels = function(v, e)
{
	var model = this.graph.getModel();
	
	model.beginUpdate();
	try
	{
		for (var i = 0; i < e.length; i++)
		{
			var edge = e[i];
			
			if (edge != null && edge.text != null &&
				edge.text.boundingBox != null)
			{
				for (var j = 0; j < v.length; j++)
				{
					var vertex = v[j];
					
					if (vertex != null)
					{
						this.avoid(edge, vertex);
					}
				}
			}
		}
	}
	finally
	{
		model.endUpdate();
	}
};

bpmEdgeLabelLayout.prototype.avoid = function(edge, vertex)
{
	var model = this.graph.getModel();
	var labRect = edge.text.boundingBox;
	
	if (bpmUtils.intersects(labRect, vertex))
	{
		var dy1 = -labRect.y - labRect.height + vertex.y;
		var dy2 = -labRect.y + vertex.y + vertex.height;
		
		var dy = (Math.abs(dy1) < Math.abs(dy2)) ? dy1 : dy2;
		
		var dx1 = -labRect.x - labRect.width + vertex.x;
		var dx2 = -labRect.x + vertex.x + vertex.width;
	
		var dx = (Math.abs(dx1) < Math.abs(dx2)) ? dx1 : dx2;
		
		if (Math.abs(dx) < Math.abs(dy))
		{
			dy = 0;
		}
		else
		{
			dx = 0;
		}
	
		var g = model.getGeometry(edge.cell);
		
		if (g != null)
		{
			g = g.clone();
			
			if (g.offset != null)
			{
				g.offset.x += dx;
				g.offset.y += dy;
			}
			else
			{
				g.offset = new bpmPoint(dx, dy);
			}
			
			model.setGeometry(edge.cell, g);
		}
	}
};



/* Draw Abstract Hierarchy Cell */
function bpmGraphAbstractHierarchyCell()
{
	this.x = [];
	this.y = [];
	this.temp = [];
};

bpmGraphAbstractHierarchyCell.prototype.maxRank = -1;
bpmGraphAbstractHierarchyCell.prototype.minRank = -1;
bpmGraphAbstractHierarchyCell.prototype.x = null;
bpmGraphAbstractHierarchyCell.prototype.y = null;
bpmGraphAbstractHierarchyCell.prototype.width = 0;
bpmGraphAbstractHierarchyCell.prototype.height = 0;
bpmGraphAbstractHierarchyCell.prototype.nextLayerConnectedCells = null;
bpmGraphAbstractHierarchyCell.prototype.previousLayerConnectedCells = null;
bpmGraphAbstractHierarchyCell.prototype.temp = null;

bpmGraphAbstractHierarchyCell.prototype.getNextLayerConnectedCells = function(layer)
{
	return null;
};

bpmGraphAbstractHierarchyCell.prototype.getPreviousLayerConnectedCells = function(layer)
{
	return null;
};

bpmGraphAbstractHierarchyCell.prototype.isEdge = function()
{
	return false;
};

bpmGraphAbstractHierarchyCell.prototype.isVertex = function()
{
	return false;
};

bpmGraphAbstractHierarchyCell.prototype.getGeneralPurposeVariable = function(layer)
{
	return null;
};

bpmGraphAbstractHierarchyCell.prototype.setGeneralPurposeVariable = function(layer, value)
{
	return null;
};

bpmGraphAbstractHierarchyCell.prototype.setX = function(layer, value)
{
	if (this.isVertex())
	{
		this.x[0] = value;
	}
	else if (this.isEdge())
	{
		this.x[layer - this.minRank - 1] = value;
	}
};

bpmGraphAbstractHierarchyCell.prototype.getX = function(layer)
{
	if (this.isVertex())
	{
		return this.x[0];
	}
	else if (this.isEdge())
	{
		return this.x[layer - this.minRank - 1];
	}

	return 0.0;
};

bpmGraphAbstractHierarchyCell.prototype.setY = function(layer, value)
{
	if (this.isVertex())
	{
		this.y[0] = value;
	}
	else if (this.isEdge())
	{
		this.y[layer -this. minRank - 1] = value;
	}
};



/* Draw Hierarchy Node */ 
function bpmGraphHierarchyNode(cell)
{
	bpmGraphAbstractHierarchyCell.apply(this, arguments);
	this.cell = cell;
	this.id = bpmObjectIdentity.get(cell);
	this.connectsAsTarget = [];
	this.connectsAsSource = [];
};

bpmGraphHierarchyNode.prototype = new bpmGraphAbstractHierarchyCell();
bpmGraphHierarchyNode.prototype.constructor = bpmGraphHierarchyNode;
bpmGraphHierarchyNode.prototype.cell = null;
bpmGraphHierarchyNode.prototype.id = null;
bpmGraphHierarchyNode.prototype.connectsAsTarget = null;
bpmGraphHierarchyNode.prototype.connectsAsSource = null;
bpmGraphHierarchyNode.prototype.hashCode = false;

bpmGraphHierarchyNode.prototype.getRankValue = function(layer)
{
	return this.maxRank;
};

bpmGraphHierarchyNode.prototype.getNextLayerConnectedCells = function(layer)
{
	if (this.nextLayerConnectedCells == null)
	{
		this.nextLayerConnectedCells = [];
		this.nextLayerConnectedCells[0] = [];
		
		for (var i = 0; i < this.connectsAsTarget.length; i++)
		{
			var edge = this.connectsAsTarget[i];

			if (edge.maxRank == -1 || edge.maxRank == layer + 1)
			{
				this.nextLayerConnectedCells[0].push(edge.source);
			}
			else
			{
				this.nextLayerConnectedCells[0].push(edge);
			}
		}
	}

	return this.nextLayerConnectedCells[0];
};

bpmGraphHierarchyNode.prototype.getPreviousLayerConnectedCells = function(layer)
{
	if (this.previousLayerConnectedCells == null)
	{
		this.previousLayerConnectedCells = [];
		this.previousLayerConnectedCells[0] = [];
		
		for (var i = 0; i < this.connectsAsSource.length; i++)
		{
			var edge = this.connectsAsSource[i];

			if (edge.minRank == -1 || edge.minRank == layer - 1)
			{
				this.previousLayerConnectedCells[0].push(edge.target);
			}
			else
			{
				this.previousLayerConnectedCells[0].push(edge);
			}
		}
	}

	return this.previousLayerConnectedCells[0];
};

bpmGraphHierarchyNode.prototype.isVertex = function()
{
	return true;
};

bpmGraphHierarchyNode.prototype.getGeneralPurposeVariable = function(layer)
{
	return this.temp[0];
};

bpmGraphHierarchyNode.prototype.setGeneralPurposeVariable = function(layer, value)
{
	this.temp[0] = value;
};

bpmGraphHierarchyNode.prototype.isAncestor = function(otherNode)
{
	if (otherNode != null && this.hashCode != null && otherNode.hashCode != null
			&& this.hashCode.length < otherNode.hashCode.length)
	{
		if (this.hashCode == otherNode.hashCode)
		{
			return true;
		}
		
		if (this.hashCode == null || this.hashCode == null)
		{
			return false;
		}
		
		for (var i = 0; i < this.hashCode.length; i++)
		{
			if (this.hashCode[i] != otherNode.hashCode[i])
			{
				return false;
			}
		}

		return true;
	}

	return false;
};

bpmGraphHierarchyNode.prototype.getCoreCell = function()
{
	return this.cell;
};


/* Draw Hierarchy Edge */
function bpmGraphHierarchyEdge(edges)
{
	bpmGraphAbstractHierarchyCell.apply(this, arguments);
	this.edges = edges;
	this.ids = [];
	
	for (var i = 0; i < edges.length; i++)
	{
		this.ids.push(bpmObjectIdentity.get(edges[i]));
	}
};

bpmGraphHierarchyEdge.prototype = new bpmGraphAbstractHierarchyCell();
bpmGraphHierarchyEdge.prototype.constructor = bpmGraphHierarchyEdge;
bpmGraphHierarchyEdge.prototype.edges = null;
bpmGraphHierarchyEdge.prototype.ids = null;
bpmGraphHierarchyEdge.prototype.source = null;
bpmGraphHierarchyEdge.prototype.target = null;
bpmGraphHierarchyEdge.prototype.isReversed = false;

bpmGraphHierarchyEdge.prototype.invert = function(layer)
{
	var temp = this.source;
	this.source = this.target;
	this.target = temp;
	this.isReversed = !this.isReversed;
};

bpmGraphHierarchyEdge.prototype.getNextLayerConnectedCells = function(layer)
{
	if (this.nextLayerConnectedCells == null)
	{
		this.nextLayerConnectedCells = [];
		
		for (var i = 0; i < this.temp.length; i++)
		{
			this.nextLayerConnectedCells[i] = [];
			
			if (i == this.temp.length - 1)
			{
				this.nextLayerConnectedCells[i].push(this.source);
			}
			else
			{
				this.nextLayerConnectedCells[i].push(this);
			}
		}
	}
	
	return this.nextLayerConnectedCells[layer - this.minRank - 1];
};

bpmGraphHierarchyEdge.prototype.getPreviousLayerConnectedCells = function(layer)
{
	if (this.previousLayerConnectedCells == null)
	{
		this.previousLayerConnectedCells = [];

		for (var i = 0; i < this.temp.length; i++)
		{
			this.previousLayerConnectedCells[i] = [];
			
			if (i == 0)
			{
				this.previousLayerConnectedCells[i].push(this.target);
			}
			else
			{
				this.previousLayerConnectedCells[i].push(this);
			}
		}
	}

	return this.previousLayerConnectedCells[layer - this.minRank - 1];
};

bpmGraphHierarchyEdge.prototype.isEdge = function()
{
	return true;
};

bpmGraphHierarchyEdge.prototype.getGeneralPurposeVariable = function(layer)
{
	return this.temp[layer - this.minRank - 1];
};

bpmGraphHierarchyEdge.prototype.setGeneralPurposeVariable = function(layer, value)
{
	this.temp[layer - this.minRank - 1] = value;
};

bpmGraphHierarchyEdge.prototype.getCoreCell = function()
{
	if (this.edges != null && this.edges.length > 0)
	{
		return this.edges[0];
	}
	
	return null;
};



/* Draw Hierarchy Model */
function bpmGraphHierarchyModel(layout, vertices, roots, parent, tightenToSource)
{
	var graph = layout.getGraph();
	this.tightenToSource = tightenToSource;
	this.roots = roots;
	this.parent = parent;
	this.vertexMapper = new bpmDictionary();
	this.edgeMapper = new bpmDictionary();
	this.maxRank = 0;
	var internalVertices = [];

	if (vertices == null)
	{
		vertices = this.graph.getChildVertices(parent);
	}

	this.maxRank = this.SOURCESCANSTARTRANK;
	this.createInternalCells(layout, vertices, internalVertices);

	for (var i = 0; i < vertices.length; i++)
	{
		var edges = internalVertices[i].connectsAsSource;

		for (var j = 0; j < edges.length; j++)
		{
			var internalEdge = edges[j];
			var realEdges = internalEdge.edges;

			if (realEdges != null && realEdges.length > 0)
			{
				var realEdge = realEdges[0];
				var targetCell = layout.getVisibleTerminal(
						realEdge, false);
				var internalTargetCell = this.vertexMapper.get(targetCell);

				if (internalVertices[i] == internalTargetCell)
				{
					targetCell = layout.getVisibleTerminal(
							realEdge, true);
					internalTargetCell = this.vertexMapper.get(targetCell);
				}
				
				if (internalTargetCell != null
						&& internalVertices[i] != internalTargetCell)
				{
					internalEdge.target = internalTargetCell;

					if (internalTargetCell.connectsAsTarget.length == 0)
					{
						internalTargetCell.connectsAsTarget = [];
					}

					if (bpmUtils.indexOf(internalTargetCell.connectsAsTarget, internalEdge) < 0)
					{
						internalTargetCell.connectsAsTarget.push(internalEdge);
					}
				}
			}
		}

		internalVertices[i].temp[0] = 1;
	}
};

bpmGraphHierarchyModel.prototype.maxRank = null;
bpmGraphHierarchyModel.prototype.vertexMapper = null;
bpmGraphHierarchyModel.prototype.edgeMapper = null;
bpmGraphHierarchyModel.prototype.ranks = null;
bpmGraphHierarchyModel.prototype.roots = null;
bpmGraphHierarchyModel.prototype.parent = null;
bpmGraphHierarchyModel.prototype.dfsCount = 0;
bpmGraphHierarchyModel.prototype.SOURCESCANSTARTRANK = 100000000;
bpmGraphHierarchyModel.prototype.tightenToSource = false;

bpmGraphHierarchyModel.prototype.createInternalCells = function(layout, vertices, internalVertices)
{
	var graph = layout.getGraph();

	for (var i = 0; i < vertices.length; i++)
	{
		internalVertices[i] = new bpmGraphHierarchyNode(vertices[i]);
		this.vertexMapper.put(vertices[i], internalVertices[i]);

		var conns = layout.getEdges(vertices[i]);
		internalVertices[i].connectsAsSource = [];

		for (var j = 0; j < conns.length; j++)
		{
			var cell = layout.getVisibleTerminal(conns[j], false);

			if (cell != vertices[i] && layout.graph.model.isVertex(cell) &&
					!layout.isVertexIgnored(cell))
			{
				var undirectedEdges = layout.getEdgesBetween(vertices[i],
						cell, false);
				var directedEdges = layout.getEdgesBetween(vertices[i],
						cell, true);
				
				if (undirectedEdges != null &&
						undirectedEdges.length > 0 &&
						this.edgeMapper.get(undirectedEdges[0]) == null &&
						directedEdges.length * 2 >= undirectedEdges.length)
				{
					var internalEdge = new bpmGraphHierarchyEdge(undirectedEdges);

					for (var k = 0; k < undirectedEdges.length; k++)
					{
						var edge = undirectedEdges[k];
						this.edgeMapper.put(edge, internalEdge);

						graph.resetEdge(edge);

					    if (layout.disableEdgeStyle)
					    {
					    	layout.setEdgeStyleEnabled(edge, false);
					    	layout.setOrthogonalEdge(edge,true);
					    }
					}

					internalEdge.source = internalVertices[i];

					if (bpmUtils.indexOf(internalVertices[i].connectsAsSource, internalEdge) < 0)
					{
						internalVertices[i].connectsAsSource.push(internalEdge);
					}
				}
			}
		}

		internalVertices[i].temp[0] = 0;
	}
};

bpmGraphHierarchyModel.prototype.initialRank = function()
{
	var startNodes = [];

	if (this.roots != null)
	{
		for (var i = 0; i < this.roots.length; i++)
		{
			var internalNode = this.vertexMapper.get(this.roots[i]);

			if (internalNode != null)
			{
				startNodes.push(internalNode);
			}
		}
	}

	var internalNodes = this.vertexMapper.getValues();
	
	for (var i=0; i < internalNodes.length; i++)
	{
		internalNodes[i].temp[0] = -1;
	}

	var startNodesCopy = startNodes.slice();

	while (startNodes.length > 0)
	{
		var internalNode = startNodes[0];
		var layerDeterminingEdges;
		var edgesToBeMarked;

		layerDeterminingEdges = internalNode.connectsAsTarget;
		edgesToBeMarked = internalNode.connectsAsSource;

		var allEdgesScanned = true;

		var minimumLayer = this.SOURCESCANSTARTRANK;

		for (var i = 0; i < layerDeterminingEdges.length; i++)
		{
			var internalEdge = layerDeterminingEdges[i];

			if (internalEdge.temp[0] == 5270620)
			{
				var otherNode = internalEdge.source;
				minimumLayer = Math.min(minimumLayer, otherNode.temp[0] - 1);
			}
			else
			{
				allEdgesScanned = false;

				break;
			}
		}

		if (allEdgesScanned)
		{
			internalNode.temp[0] = minimumLayer;
			this.maxRank = Math.min(this.maxRank, minimumLayer);

			if (edgesToBeMarked != null)
			{
				for (var i = 0; i < edgesToBeMarked.length; i++)
				{
					var internalEdge = edgesToBeMarked[i];

					internalEdge.temp[0] = 5270620;
					var otherNode = internalEdge.target;

					if (otherNode.temp[0] == -1)
					{
						startNodes.push(otherNode);

						otherNode.temp[0] = -2;
					}
				}
			}

			startNodes.shift();
		}
		else
		{
			var removedCell = startNodes.shift();
			startNodes.push(internalNode);

			if (removedCell == internalNode && startNodes.length == 1)
			{
				break;
			}
		}
	}

	for (var i=0; i < internalNodes.length; i++)
	{
		internalNodes[i].temp[0] -= this.maxRank;
	}
	
	for ( var i = 0; i < startNodesCopy.length; i++)
	{
		var internalNode = startNodesCopy[i];
		var currentMaxLayer = 0;
		var layerDeterminingEdges = internalNode.connectsAsSource;

		for ( var j = 0; j < layerDeterminingEdges.length; j++)
		{
			var internalEdge = layerDeterminingEdges[j];
			var otherNode = internalEdge.target;
			internalNode.temp[0] = Math.max(currentMaxLayer,
					otherNode.temp[0] + 1);
			currentMaxLayer = internalNode.temp[0];
		}
	}
	
	this.maxRank = this.SOURCESCANSTARTRANK - this.maxRank;
};

bpmGraphHierarchyModel.prototype.fixRanks = function()
{
	var rankList = [];
	this.ranks = [];

	for (var i = 0; i < this.maxRank + 1; i++)
	{
		rankList[i] = [];
		this.ranks[i] = rankList[i];
	}

	var rootsArray = null;

	if (this.roots != null)
	{
		var oldRootsArray = this.roots;
		rootsArray = [];

		for (var i = 0; i < oldRootsArray.length; i++)
		{
			var cell = oldRootsArray[i];
			var internalNode = this.vertexMapper.get(cell);
			rootsArray[i] = internalNode;
		}
	}

	this.visit(function(parent, node, edge, layer, seen)
	{
		if (seen == 0 && node.maxRank < 0 && node.minRank < 0)
		{
			rankList[node.temp[0]].push(node);
			node.maxRank = node.temp[0];
			node.minRank = node.temp[0];

			node.temp[0] = rankList[node.maxRank].length - 1;
		}

		if (parent != null && edge != null)
		{
			var parentToCellRankDifference = parent.maxRank - node.maxRank;

			if (parentToCellRankDifference > 1)
			{
				edge.maxRank = parent.maxRank;
				edge.minRank = node.maxRank;
				edge.temp = [];
				edge.x = [];
				edge.y = [];

				for (var i = edge.minRank + 1; i < edge.maxRank; i++)
				{
					rankList[i].push(edge);
					edge.setGeneralPurposeVariable(i, rankList[i]
							.length - 1);
				}
			}
		}
	}, rootsArray, false, null);
};

bpmGraphHierarchyModel.prototype.visit = function(visitor, dfsRoots, trackAncestors, seenNodes)
{
	if (dfsRoots != null)
	{
		for (var i = 0; i < dfsRoots.length; i++)
		{
			var internalNode = dfsRoots[i];

			if (internalNode != null)
			{
				if (seenNodes == null)
				{
					seenNodes = new Object();
				}

				if (trackAncestors)
				{
					internalNode.hashCode = [];
					internalNode.hashCode[0] = this.dfsCount;
					internalNode.hashCode[1] = i;
					this.extendedDfs(null, internalNode, null, visitor, seenNodes,
							internalNode.hashCode, i, 0);
				}
				else
				{
					this.dfs(null, internalNode, null, visitor, seenNodes, 0);
				}
			}
		}

		this.dfsCount++;
	}
};

bpmGraphHierarchyModel.prototype.dfs = function(parent, root, connectingEdge, visitor, seen, layer)
{
	if (root != null)
	{
		var rootId = root.id;

		if (seen[rootId] == null)
		{
			seen[rootId] = root;
			visitor(parent, root, connectingEdge, layer, 0);

			var outgoingEdges = root.connectsAsSource.slice();
			
			for (var i = 0; i< outgoingEdges.length; i++)
			{
				var internalEdge = outgoingEdges[i];
				var targetNode = internalEdge.target;
				this.dfs(root, targetNode, internalEdge, visitor, seen,
						layer + 1);
			}
		}
		else
		{
			visitor(parent, root, connectingEdge, layer, 1);
		}
	}
};

bpmGraphHierarchyModel.prototype.extendedDfs = function(parent, root, connectingEdge, visitor, seen, ancestors, childHash, layer)
{
	if (root != null)
	{
		if (parent != null)
		{
			if (root.hashCode == null ||
				root.hashCode[0] != parent.hashCode[0])
			{
				var hashCodeLength = parent.hashCode.length + 1;
				root.hashCode = parent.hashCode.slice();
				root.hashCode[hashCodeLength - 1] = childHash;
			}
		}

		var rootId = root.id;

		if (seen[rootId] == null)
		{
			seen[rootId] = root;
			visitor(parent, root, connectingEdge, layer, 0);

			var outgoingEdges = root.connectsAsSource.slice();

			for (var i = 0; i < outgoingEdges.length; i++)
			{
				var internalEdge = outgoingEdges[i];
				var targetNode = internalEdge.target;

				this.extendedDfs(root, targetNode, internalEdge, visitor, seen,
						root.hashCode, i, layer + 1);
			}
		}
		else
		{
			visitor(parent, root, connectingEdge, layer, 1);
		}
	}
};



/* Swimlane Model */
function bpmSwimlaneModel(layout, vertices, roots, parent, tightenToSource)
{
	var graph = layout.getGraph();
	this.tightenToSource = tightenToSource;
	this.roots = roots;
	this.parent = parent;

	this.vertexMapper = new bpmDictionary();
	this.edgeMapper = new bpmDictionary();
	this.maxRank = 0;
	var internalVertices = [];

	if (vertices == null)
	{
		vertices = this.graph.getChildVertices(parent);
	}

	this.maxRank = this.SOURCESCANSTARTRANK;
	this.createInternalCells(layout, vertices, internalVertices);

	for (var i = 0; i < vertices.length; i++)
	{
		var edges = internalVertices[i].connectsAsSource;

		for (var j = 0; j < edges.length; j++)
		{
			var internalEdge = edges[j];
			var realEdges = internalEdge.edges;

			if (realEdges != null && realEdges.length > 0)
			{
				var realEdge = realEdges[0];
				var targetCell = layout.getVisibleTerminal(
						realEdge, false);
				var internalTargetCell = this.vertexMapper.get(targetCell);

				if (internalVertices[i] == internalTargetCell)
				{
					targetCell = layout.getVisibleTerminal(
							realEdge, true);
					internalTargetCell = this.vertexMapper.get(targetCell);
				}

				if (internalTargetCell != null
						&& internalVertices[i] != internalTargetCell)
				{
					internalEdge.target = internalTargetCell;

					if (internalTargetCell.connectsAsTarget.length == 0)
					{
						internalTargetCell.connectsAsTarget = [];
					}

					if (bpmUtils.indexOf(internalTargetCell.connectsAsTarget, internalEdge) < 0)
					{
						internalTargetCell.connectsAsTarget.push(internalEdge);
					}
				}
			}
		}

		internalVertices[i].temp[0] = 1;
	}
};

bpmSwimlaneModel.prototype.maxRank = null;
bpmSwimlaneModel.prototype.vertexMapper = null;
bpmSwimlaneModel.prototype.edgeMapper = null;
bpmSwimlaneModel.prototype.ranks = null;
bpmSwimlaneModel.prototype.roots = null;
bpmSwimlaneModel.prototype.parent = null;
bpmSwimlaneModel.prototype.dfsCount = 0;
bpmSwimlaneModel.prototype.SOURCESCANSTARTRANK = 100000000;
bpmSwimlaneModel.prototype.tightenToSource = false;
bpmSwimlaneModel.prototype.ranksPerGroup = null;

bpmSwimlaneModel.prototype.createInternalCells = function(layout, vertices, internalVertices)
{
	var graph = layout.getGraph();
	var swimlanes = layout.swimlanes;

	for (var i = 0; i < vertices.length; i++)
	{
		internalVertices[i] = new bpmGraphHierarchyNode(vertices[i]);
		this.vertexMapper.put(vertices[i], internalVertices[i]);
		internalVertices[i].swimlaneIndex = -1;

		for (var ii = 0; ii < swimlanes.length; ii++)
		{
			if (graph.model.getParent(vertices[i]) == swimlanes[ii])
			{
				internalVertices[i].swimlaneIndex = ii;
				break;
			}
		}

		var conns = layout.getEdges(vertices[i]);
		internalVertices[i].connectsAsSource = [];

		for (var j = 0; j < conns.length; j++)
		{
			var cell = layout.getVisibleTerminal(conns[j], false);

			if (cell != vertices[i] && layout.graph.model.isVertex(cell) &&
					!layout.isVertexIgnored(cell))
			{
				var undirectedEdges = layout.getEdgesBetween(vertices[i],
						cell, false);
				var directedEdges = layout.getEdgesBetween(vertices[i],
						cell, true);
				
				if (undirectedEdges != null &&
						undirectedEdges.length > 0 &&
						this.edgeMapper.get(undirectedEdges[0]) == null &&
						directedEdges.length * 2 >= undirectedEdges.length)
				{
					var internalEdge = new bpmGraphHierarchyEdge(undirectedEdges);

					for (var k = 0; k < undirectedEdges.length; k++)
					{
						var edge = undirectedEdges[k];
						this.edgeMapper.put(edge, internalEdge);

						graph.resetEdge(edge);

					    if (layout.disableEdgeStyle)
					    {
					    	layout.setEdgeStyleEnabled(edge, false);
					    	layout.setOrthogonalEdge(edge,true);
					    }
					}

					internalEdge.source = internalVertices[i];

					if (bpmUtils.indexOf(internalVertices[i].connectsAsSource, internalEdge) < 0)
					{
						internalVertices[i].connectsAsSource.push(internalEdge);
					}
				}
			}
		}

		internalVertices[i].temp[0] = 0;
	}
};

bpmSwimlaneModel.prototype.initialRank = function()
{
	this.ranksPerGroup = [];
	
	var startNodes = [];
	var seen = new Object();

	if (this.roots != null)
	{
		for (var i = 0; i < this.roots.length; i++)
		{
			var internalNode = this.vertexMapper.get(this.roots[i]);
			this.maxChainDfs(null, internalNode, null, seen, 0);

			if (internalNode != null)
			{
				startNodes.push(internalNode);
			}
		}
	}

	var lowerRank = [];
	var upperRank = [];
	
	for (var i = this.ranksPerGroup.length - 1; i >= 0; i--)
	{
		if (i == this.ranksPerGroup.length - 1)
		{
			lowerRank[i] = 0;
		}
		else
		{
			lowerRank[i] = upperRank[i+1] + 1;
		}
		
		upperRank[i] = lowerRank[i] + this.ranksPerGroup[i];
	}
	
	this.maxRank = upperRank[0];

	var internalNodes = this.vertexMapper.getValues();
	
	for (var i=0; i < internalNodes.length; i++)
	{
		internalNodes[i].temp[0] = -1;
	}

	var startNodesCopy = startNodes.slice();
	
	while (startNodes.length > 0)
	{
		var internalNode = startNodes[0];
		var layerDeterminingEdges;
		var edgesToBeMarked;

		layerDeterminingEdges = internalNode.connectsAsTarget;
		edgesToBeMarked = internalNode.connectsAsSource;

		var allEdgesScanned = true;
		var minimumLayer = upperRank[0];

		for (var i = 0; i < layerDeterminingEdges.length; i++)
		{
			var internalEdge = layerDeterminingEdges[i];

			if (internalEdge.temp[0] == 5270620)
			{
				var otherNode = internalEdge.source;
				minimumLayer = Math.min(minimumLayer, otherNode.temp[0] - 1);
			}
			else
			{
				allEdgesScanned = false;

				break;
			}
		}

		if (allEdgesScanned)
		{
			if (minimumLayer > upperRank[internalNode.swimlaneIndex])
			{
				minimumLayer = upperRank[internalNode.swimlaneIndex];
			}

			internalNode.temp[0] = minimumLayer;

			if (edgesToBeMarked != null)
			{
				for (var i = 0; i < edgesToBeMarked.length; i++)
				{
					var internalEdge = edgesToBeMarked[i];

					internalEdge.temp[0] = 5270620;

					var otherNode = internalEdge.target;

					if (otherNode.temp[0] == -1)
					{
						startNodes.push(otherNode);
						otherNode.temp[0] = -2;
					}
				}
			}

			startNodes.shift();
		}
		else
		{
			var removedCell = startNodes.shift();
			startNodes.push(internalNode);

			if (removedCell == internalNode && startNodes.length == 1)
			{
				break;
			}
		}
	}
};

bpmSwimlaneModel.prototype.maxChainDfs = function(parent, root, connectingEdge, seen, chainCount)
{
	if (root != null)
	{
		var rootId = bpmCellPath.create(root.cell);

		if (seen[rootId] == null)
		{
			seen[rootId] = root;
			var slIndex = root.swimlaneIndex;
			
			if (this.ranksPerGroup[slIndex] == null || this.ranksPerGroup[slIndex] < chainCount)
			{
				this.ranksPerGroup[slIndex] = chainCount;
			}

			var outgoingEdges = root.connectsAsSource.slice();

			for (var i = 0; i < outgoingEdges.length; i++)
			{
				var internalEdge = outgoingEdges[i];
				var targetNode = internalEdge.target;
				if (root.swimlaneIndex < targetNode.swimlaneIndex)
				{
					this.maxChainDfs(root, targetNode, internalEdge, bpmUtils.clone(seen, null , true), 0);
				}
				else if (root.swimlaneIndex == targetNode.swimlaneIndex)
				{
					this.maxChainDfs(root, targetNode, internalEdge, bpmUtils.clone(seen, null , true), chainCount + 1);
				}
			}
		}
	}
};

bpmSwimlaneModel.prototype.fixRanks = function()
{
	var rankList = [];
	this.ranks = [];

	for (var i = 0; i < this.maxRank + 1; i++)
	{
		rankList[i] = [];
		this.ranks[i] = rankList[i];
	}

	var rootsArray = null;

	if (this.roots != null)
	{
		var oldRootsArray = this.roots;
		rootsArray = [];

		for (var i = 0; i < oldRootsArray.length; i++)
		{
			var cell = oldRootsArray[i];
			var internalNode = this.vertexMapper.get(cell);
			rootsArray[i] = internalNode;
		}
	}

	this.visit(function(parent, node, edge, layer, seen)
	{
		if (seen == 0 && node.maxRank < 0 && node.minRank < 0)
		{
			rankList[node.temp[0]].push(node);
			node.maxRank = node.temp[0];
			node.minRank = node.temp[0];

			node.temp[0] = rankList[node.maxRank].length - 1;
		}

		if (parent != null && edge != null)
		{
			var parentToCellRankDifference = parent.maxRank - node.maxRank;

			if (parentToCellRankDifference > 1)
			{
				edge.maxRank = parent.maxRank;
				edge.minRank = node.maxRank;
				edge.temp = [];
				edge.x = [];
				edge.y = [];

				for (var i = edge.minRank + 1; i < edge.maxRank; i++)
				{
					rankList[i].push(edge);
					edge.setGeneralPurposeVariable(i, rankList[i]
							.length - 1);
				}
			}
		}
	}, rootsArray, false, null);
};

bpmSwimlaneModel.prototype.visit = function(visitor, dfsRoots, trackAncestors, seenNodes)
{
	if (dfsRoots != null)
	{
		for (var i = 0; i < dfsRoots.length; i++)
		{
			var internalNode = dfsRoots[i];

			if (internalNode != null)
			{
				if (seenNodes == null)
				{
					seenNodes = new Object();
				}

				if (trackAncestors)
				{
					internalNode.hashCode = [];
					internalNode.hashCode[0] = this.dfsCount;
					internalNode.hashCode[1] = i;
					this.extendedDfs(null, internalNode, null, visitor, seenNodes,
							internalNode.hashCode, i, 0);
				}
				else
				{
					this.dfs(null, internalNode, null, visitor, seenNodes, 0);
				}
			}
		}

		this.dfsCount++;
	}
};

bpmSwimlaneModel.prototype.dfs = function(parent, root, connectingEdge, visitor, seen, layer)
{
	if (root != null)
	{
		var rootId = root.id;

		if (seen[rootId] == null)
		{
			seen[rootId] = root;
			visitor(parent, root, connectingEdge, layer, 0);
			var outgoingEdges = root.connectsAsSource.slice();
			
			for (var i = 0; i< outgoingEdges.length; i++)
			{
				var internalEdge = outgoingEdges[i];
				var targetNode = internalEdge.target;

				this.dfs(root, targetNode, internalEdge, visitor, seen,
						layer + 1);
			}
		}
		else
		{
			visitor(parent, root, connectingEdge, layer, 1);
		}
	}
};

bpmSwimlaneModel.prototype.extendedDfs = function(parent, root, connectingEdge, visitor, seen, ancestors, childHash, layer)
{
	if (root != null)
	{
		if (parent != null)
		{
			if (root.hashCode == null ||
				root.hashCode[0] != parent.hashCode[0])
			{
				var hashCodeLength = parent.hashCode.length + 1;
				root.hashCode = parent.hashCode.slice();
				root.hashCode[hashCodeLength - 1] = childHash;
			}
		}

		var rootId = root.id;

		if (seen[rootId] == null)
		{
			seen[rootId] = root;
			visitor(parent, root, connectingEdge, layer, 0);
			var outgoingEdges = root.connectsAsSource.slice();
			var incomingEdges = root.connectsAsTarget.slice();

			for (var i = 0; i < outgoingEdges.length; i++)
			{
				var internalEdge = outgoingEdges[i];
				var targetNode = internalEdge.target;
				
				if (root.swimlaneIndex <= targetNode.swimlaneIndex)
				{
					this.extendedDfs(root, targetNode, internalEdge, visitor, seen,
							root.hashCode, i, layer + 1);
				}
			}
			
			for (var i = 0; i < incomingEdges.length; i++)
			{
				var internalEdge = incomingEdges[i];
				var targetNode = internalEdge.source;

				if (root.swimlaneIndex < targetNode.swimlaneIndex)
				{
					this.extendedDfs(root, targetNode, internalEdge, visitor, seen,
							root.hashCode, i, layer + 1);
				}
			}
		}
		else
		{
			visitor(parent, root, connectingEdge, layer, 1);
		}
	}
};



function bpmHierarchicalLayoutStage() { };

bpmHierarchicalLayoutStage.prototype.execute = function(parent) { };



function bpmMedianHybridCrossingReduction(layout)
{
	this.layout = layout;
};

bpmMedianHybridCrossingReduction.prototype = new bpmHierarchicalLayoutStage();
bpmMedianHybridCrossingReduction.prototype.constructor = bpmMedianHybridCrossingReduction;
bpmMedianHybridCrossingReduction.prototype.layout = null;
bpmMedianHybridCrossingReduction.prototype.maxIterations = 24;
bpmMedianHybridCrossingReduction.prototype.nestedBestRanks = null;
bpmMedianHybridCrossingReduction.prototype.currentBestCrossings = 0;
bpmMedianHybridCrossingReduction.prototype.iterationsWithoutImprovement = 0;
bpmMedianHybridCrossingReduction.prototype.maxNoImprovementIterations = 2;

bpmMedianHybridCrossingReduction.prototype.execute = function(parent)
{
	var model = this.layout.getModel();

	this.nestedBestRanks = [];
	
	for (var i = 0; i < model.ranks.length; i++)
	{
		this.nestedBestRanks[i] = model.ranks[i].slice();
	}

	var iterationsWithoutImprovement = 0;
	var currentBestCrossings = this.calculateCrossings(model);

	for (var i = 0; i < this.maxIterations &&
		iterationsWithoutImprovement < this.maxNoImprovementIterations; i++)
	{
		this.weightedMedian(i, model);
		this.transpose(i, model);
		var candidateCrossings = this.calculateCrossings(model);

		if (candidateCrossings < currentBestCrossings)
		{
			currentBestCrossings = candidateCrossings;
			iterationsWithoutImprovement = 0;

			for (var j = 0; j < this.nestedBestRanks.length; j++)
			{
				var rank = model.ranks[j];

				for (var k = 0; k < rank.length; k++)
				{
					var cell = rank[k];
					this.nestedBestRanks[j][cell.getGeneralPurposeVariable(j)] = cell;
				}
			}
		}
		else
		{
			iterationsWithoutImprovement++;

			for (var j = 0; j < this.nestedBestRanks.length; j++)
			{
				var rank = model.ranks[j];
				
				for (var k = 0; k < rank.length; k++)
				{
					var cell = rank[k];
					cell.setGeneralPurposeVariable(j, k);
				}
			}
		}
		
		if (currentBestCrossings == 0)
		{
			break;
		}
	}

	var ranks = [];
	var rankList = [];

	for (var i = 0; i < model.maxRank + 1; i++)
	{
		rankList[i] = [];
		ranks[i] = rankList[i];
	}

	for (var i = 0; i < this.nestedBestRanks.length; i++)
	{
		for (var j = 0; j < this.nestedBestRanks[i].length; j++)
		{
			rankList[i].push(this.nestedBestRanks[i][j]);
		}
	}

	model.ranks = ranks;
};

bpmMedianHybridCrossingReduction.prototype.calculateCrossings = function(model)
{
	var numRanks = model.ranks.length;
	var totalCrossings = 0;

	for (var i = 1; i < numRanks; i++)
	{
		totalCrossings += this.calculateRankCrossing(i, model);
	}
	
	return totalCrossings;
};

bpmMedianHybridCrossingReduction.prototype.calculateRankCrossing = function(i, model)
{
	var totalCrossings = 0;
	var rank = model.ranks[i];
	var previousRank = model.ranks[i - 1];

	var tmpIndices = [];

	for (var j = 0; j < rank.length; j++)
	{
		var node = rank[j];
		var rankPosition = node.getGeneralPurposeVariable(i);
		var connectedCells = node.getPreviousLayerConnectedCells(i);
		var nodeIndices = [];

		for (var k = 0; k < connectedCells.length; k++)
		{
			var connectedNode = connectedCells[k];
			var otherCellRankPosition = connectedNode.getGeneralPurposeVariable(i - 1);
			nodeIndices.push(otherCellRankPosition);
		}
		
		nodeIndices.sort(function(x, y) { return x - y; });
		tmpIndices[rankPosition] = nodeIndices;
	}
	
	var indices = [];

	for (var j = 0; j < tmpIndices.length; j++)
	{
		indices = indices.concat(tmpIndices[j]);
	}

	var firstIndex = 1;
	
	while (firstIndex < previousRank.length)
	{
		firstIndex <<= 1;
	}

	var treeSize = 2 * firstIndex - 1;
	firstIndex -= 1;

	var tree = [];
	
	for (var j = 0; j < treeSize; ++j)
	{
		tree[j] = 0;
	}

	for (var j = 0; j < indices.length; j++)
	{
		var index = indices[j];
	    var treeIndex = index + firstIndex;
	    ++tree[treeIndex];
	    
	    while (treeIndex > 0)
	    {
	    	if (treeIndex % 2)
	    	{
	    		totalCrossings += tree[treeIndex + 1];
	    	}
	      
	    	treeIndex = (treeIndex - 1) >> 1;
	    	++tree[treeIndex];
	    }
	}

	return totalCrossings;
};

bpmMedianHybridCrossingReduction.prototype.transpose = function(mainLoopIteration, model)
{
	var improved = true;

	var count = 0;
	var maxCount = 10;
	while (improved && count++ < maxCount)
	{
		var nudge = mainLoopIteration % 2 == 1 && count % 2 == 1;
		improved = false;
		
		for (var i = 0; i < model.ranks.length; i++)
		{
			var rank = model.ranks[i];
			var orderedCells = [];
			
			for (var j = 0; j < rank.length; j++)
			{
				var cell = rank[j];
				var tempRank = cell.getGeneralPurposeVariable(i);
				
				if (tempRank < 0)
				{
					tempRank = j;
				}
				orderedCells[tempRank] = cell;
			}
			
			var leftCellAboveConnections = null;
			var leftCellBelowConnections = null;
			var rightCellAboveConnections = null;
			var rightCellBelowConnections = null;
			
			var leftAbovePositions = null;
			var leftBelowPositions = null;
			var rightAbovePositions = null;
			var rightBelowPositions = null;
			
			var leftCell = null;
			var rightCell = null;

			for (var j = 0; j < (rank.length - 1); j++)
			{
				if (j == 0)
				{
					leftCell = orderedCells[j];
					leftCellAboveConnections = leftCell
							.getNextLayerConnectedCells(i);
					leftCellBelowConnections = leftCell
							.getPreviousLayerConnectedCells(i);
					leftAbovePositions = [];
					leftBelowPositions = [];
					
					for (var k = 0; k < leftCellAboveConnections.length; k++)
					{
						leftAbovePositions[k] = leftCellAboveConnections[k].getGeneralPurposeVariable(i + 1);
					}
					
					for (var k = 0; k < leftCellBelowConnections.length; k++)
					{
						leftBelowPositions[k] = leftCellBelowConnections[k].getGeneralPurposeVariable(i - 1);
					}
				}
				else
				{
					leftCellAboveConnections = rightCellAboveConnections;
					leftCellBelowConnections = rightCellBelowConnections;
					leftAbovePositions = rightAbovePositions;
					leftBelowPositions = rightBelowPositions;
					leftCell = rightCell;
				}
				
				rightCell = orderedCells[j + 1];
				rightCellAboveConnections = rightCell
						.getNextLayerConnectedCells(i);
				rightCellBelowConnections = rightCell
						.getPreviousLayerConnectedCells(i);

				rightAbovePositions = [];
				rightBelowPositions = [];

				for (var k = 0; k < rightCellAboveConnections.length; k++)
				{
					rightAbovePositions[k] = rightCellAboveConnections[k].getGeneralPurposeVariable(i + 1);
				}
				
				for (var k = 0; k < rightCellBelowConnections.length; k++)
				{
					rightBelowPositions[k] = rightCellBelowConnections[k].getGeneralPurposeVariable(i - 1);
				}

				var totalCurrentCrossings = 0;
				var totalSwitchedCrossings = 0;
				
				for (var k = 0; k < leftAbovePositions.length; k++)
				{
					for (var ik = 0; ik < rightAbovePositions.length; ik++)
					{
						if (leftAbovePositions[k] > rightAbovePositions[ik])
						{
							totalCurrentCrossings++;
						}

						if (leftAbovePositions[k] < rightAbovePositions[ik])
						{
							totalSwitchedCrossings++;
						}
					}
				}
				
				for (var k = 0; k < leftBelowPositions.length; k++)
				{
					for (var ik = 0; ik < rightBelowPositions.length; ik++)
					{
						if (leftBelowPositions[k] > rightBelowPositions[ik])
						{
							totalCurrentCrossings++;
						}

						if (leftBelowPositions[k] < rightBelowPositions[ik])
						{
							totalSwitchedCrossings++;
						}
					}
				}
				
				if ((totalSwitchedCrossings < totalCurrentCrossings) ||
					(totalSwitchedCrossings == totalCurrentCrossings &&
					nudge))
				{
					var temp = leftCell.getGeneralPurposeVariable(i);
					leftCell.setGeneralPurposeVariable(i, rightCell
							.getGeneralPurposeVariable(i));
					rightCell.setGeneralPurposeVariable(i, temp);
					rightCellAboveConnections = leftCellAboveConnections;
					rightCellBelowConnections = leftCellBelowConnections;
					rightAbovePositions = leftAbovePositions;
					rightBelowPositions = leftBelowPositions;
					rightCell = leftCell;
					
					if (!nudge)
					{
						improved = true;
					}
				}
			}
		}
	}
};

bpmMedianHybridCrossingReduction.prototype.weightedMedian = function(iteration, model)
{
	var downwardSweep = (iteration % 2 == 0);
	if (downwardSweep)
	{
		for (var j = model.maxRank - 1; j >= 0; j--)
		{
			this.medianRank(j, downwardSweep);
		}
	}
	else
	{
		for (var j = 1; j < model.maxRank; j++)
		{
			this.medianRank(j, downwardSweep);
		}
	}
};

bpmMedianHybridCrossingReduction.prototype.medianRank = function(rankValue, downwardSweep)
{
	var numCellsForRank = this.nestedBestRanks[rankValue].length;
	var medianValues = [];
	var reservedPositions = [];

	for (var i = 0; i < numCellsForRank; i++)
	{
		var cell = this.nestedBestRanks[rankValue][i];
		var sorterEntry = new MedianCellSorter();
		sorterEntry.cell = cell;

		var nextLevelConnectedCells;
		
		if (downwardSweep)
		{
			nextLevelConnectedCells = cell
					.getNextLayerConnectedCells(rankValue);
		}
		else
		{
			nextLevelConnectedCells = cell
					.getPreviousLayerConnectedCells(rankValue);
		}
		
		var nextRankValue;
		
		if (downwardSweep)
		{
			nextRankValue = rankValue + 1;
		}
		else
		{
			nextRankValue = rankValue - 1;
		}

		if (nextLevelConnectedCells != null
				&& nextLevelConnectedCells.length != 0)
		{
			sorterEntry.medianValue = this.medianValue(
					nextLevelConnectedCells, nextRankValue);
			medianValues.push(sorterEntry);
		}
		else
		{
			reservedPositions[cell.getGeneralPurposeVariable(rankValue)] = true;
		}
	}
	
	medianValues.sort(MedianCellSorter.prototype.compare);
	
	for (var i = 0; i < numCellsForRank; i++)
	{
		if (reservedPositions[i] == null)
		{
			var cell = medianValues.shift().cell;
			cell.setGeneralPurposeVariable(rankValue, i);
		}
	}
};

bpmMedianHybridCrossingReduction.prototype.medianValue = function(connectedCells, rankValue)
{
	var medianValues = [];
	var arrayCount = 0;
	
	for (var i = 0; i < connectedCells.length; i++)
	{
		var cell = connectedCells[i];
		medianValues[arrayCount++] = cell.getGeneralPurposeVariable(rankValue);
	}

	medianValues.sort(function(a,b){return a - b;});
	
	if (arrayCount % 2 == 1)
	{
		return medianValues[Math.floor(arrayCount / 2)];
	}
	else if (arrayCount == 2)
	{
		return ((medianValues[0] + medianValues[1]) / 2.0);
	}
	else
	{
		var medianPoint = arrayCount / 2;
		var leftMedian = medianValues[medianPoint - 1] - medianValues[0];
		var rightMedian = medianValues[arrayCount - 1]
				- medianValues[medianPoint];

		return (medianValues[medianPoint - 1] * rightMedian + medianValues[medianPoint]
				* leftMedian)
				/ (leftMedian + rightMedian);
	}
};

function MedianCellSorter()
{
	// empty
};

MedianCellSorter.prototype.medianValue = 0;

MedianCellSorter.prototype.cell = false;

MedianCellSorter.prototype.compare = function(a, b)
{
	if (a != null && b != null)
	{
		if (b.medianValue > a.medianValue)
		{
			return -1;
		}
		else if (b.medianValue < a.medianValue)
		{
			return 1;
		}
		else
		{
			return 0;
		}
	}
	else
	{
		return 0;
	}
};


/* Minimum Cycle Remover */
function bpmMinimumCycleRemover(layout)
{
	this.layout = layout;
};

bpmMinimumCycleRemover.prototype = new bpmHierarchicalLayoutStage();
bpmMinimumCycleRemover.prototype.constructor = bpmMinimumCycleRemover;
bpmMinimumCycleRemover.prototype.layout = null;

bpmMinimumCycleRemover.prototype.execute = function(parent)
{
	var model = this.layout.getModel();
	var seenNodes = new Object();
	var unseenNodesArray = model.vertexMapper.getValues();
	var unseenNodes = new Object();
	
	for (var i = 0; i < unseenNodesArray.length; i++)
	{
		unseenNodes[unseenNodesArray[i].id] = unseenNodesArray[i];
	}
	
	var rootsArray = null;
	
	if (model.roots != null)
	{
		var modelRoots = model.roots;
		rootsArray = [];
		
		for (var i = 0; i < modelRoots.length; i++)
		{
			rootsArray[i] = model.vertexMapper.get(modelRoots[i]);
		}
	}

	model.visit(function(parent, node, connectingEdge, layer, seen)
	{
		if (node.isAncestor(parent))
		{
			connectingEdge.invert();
			bpmUtils.remove(connectingEdge, parent.connectsAsSource);
			parent.connectsAsTarget.push(connectingEdge);
			bpmUtils.remove(connectingEdge, node.connectsAsTarget);
			node.connectsAsSource.push(connectingEdge);
		}
		
		seenNodes[node.id] = node;
		delete unseenNodes[node.id];
	}, rootsArray, true, null);

	var seenNodesCopy = bpmUtils.clone(seenNodes, null, true);

	model.visit(function(parent, node, connectingEdge, layer, seen)
	{
		if (node.isAncestor(parent))
		{
			connectingEdge.invert();
			bpmUtils.remove(connectingEdge, parent.connectsAsSource);
			node.connectsAsSource.push(connectingEdge);
			parent.connectsAsTarget.push(connectingEdge);
			bpmUtils.remove(connectingEdge, node.connectsAsTarget);
		}
		
		seenNodes[node.id] = node;
		delete unseenNodes[node.id];
	}, unseenNodes, true, seenNodesCopy);
};


/* Coordinate Assignment */
function bpmCoordinateAssignment(layout, intraCellSpacing, interRankCellSpacing,
	orientation, initialX, parallelEdgeSpacing)
{
	this.layout = layout;
	this.intraCellSpacing = intraCellSpacing;
	this.interRankCellSpacing = interRankCellSpacing;
	this.orientation = orientation;
	this.initialX = initialX;
	this.parallelEdgeSpacing = parallelEdgeSpacing;
};

bpmCoordinateAssignment.prototype = new bpmHierarchicalLayoutStage();
bpmCoordinateAssignment.prototype.constructor = bpmCoordinateAssignment;
bpmCoordinateAssignment.prototype.layout = null;
bpmCoordinateAssignment.prototype.intraCellSpacing = 30;
bpmCoordinateAssignment.prototype.interRankCellSpacing = 100;
bpmCoordinateAssignment.prototype.parallelEdgeSpacing = 10;
bpmCoordinateAssignment.prototype.maxIterations = 8;
bpmCoordinateAssignment.prototype.prefHozEdgeSep = 5;
bpmCoordinateAssignment.prototype.prefVertEdgeOff = 2;
bpmCoordinateAssignment.prototype.minEdgeJetty = 12;
bpmCoordinateAssignment.prototype.channelBuffer = 4;
bpmCoordinateAssignment.prototype.jettyPositions = null;
bpmCoordinateAssignment.prototype.orientation = bpmConstants.DIRECTION_NORTH;
bpmCoordinateAssignment.prototype.initialX = null;
bpmCoordinateAssignment.prototype.limitX = null;
bpmCoordinateAssignment.prototype.currentXDelta = null;
bpmCoordinateAssignment.prototype.widestRank = null;
bpmCoordinateAssignment.prototype.rankTopY = null;
bpmCoordinateAssignment.prototype.rankBottomY = null;
bpmCoordinateAssignment.prototype.widestRankValue = null;
bpmCoordinateAssignment.prototype.rankWidths = null;
bpmCoordinateAssignment.prototype.rankY = null;
bpmCoordinateAssignment.prototype.fineTuning = true;
bpmCoordinateAssignment.prototype.nextLayerConnectedCache = null;
bpmCoordinateAssignment.prototype.previousLayerConnectedCache = null;
bpmCoordinateAssignment.prototype.groupPadding = 10;

bpmCoordinateAssignment.prototype.printStatus = function()
{
	var model = this.layout.getModel();
	bpmLog.show();

	bpmLog.writeln('======Coord assignment debug=======');

	for (var j = 0; j < model.ranks.length; j++)
	{
		bpmLog.write('Rank ', j, ' : ' );
		var rank = model.ranks[j];
		
		for (var k = 0; k < rank.length; k++)
		{
			var cell = rank[k];
			
			bpmLog.write(cell.getGeneralPurposeVariable(j), '  ');
		}
		bpmLog.writeln();
	}
	
	bpmLog.writeln('====================================');
};

bpmCoordinateAssignment.prototype.execute = function(parent)
{
	this.jettyPositions = Object();
	var model = this.layout.getModel();
	this.currentXDelta = 0.0;

	this.initialCoords(this.layout.getGraph(), model);
	
	if (this.fineTuning)
	{
		this.minNode(model);
	}
	
	var bestXDelta = 100000000.0;
	
	if (this.fineTuning)
	{
		for (var i = 0; i < this.maxIterations; i++)
		{
			if (i != 0)
			{
				this.medianPos(i, model);
				this.minNode(model);
			}
			
			if (this.currentXDelta < bestXDelta)
			{
				for (var j = 0; j < model.ranks.length; j++)
				{
					var rank = model.ranks[j];
					
					for (var k = 0; k < rank.length; k++)
					{
						var cell = rank[k];
						cell.setX(j, cell.getGeneralPurposeVariable(j));
					}
				}
				
				bestXDelta = this.currentXDelta;
			}
			else
			{
				for (var j = 0; j < model.ranks.length; j++)
				{
					var rank = model.ranks[j];
					
					for (var k = 0; k < rank.length; k++)
					{
						var cell = rank[k];
						cell.setGeneralPurposeVariable(j, cell.getX(j));
					}
				}
			}
			
			this.minPath(this.layout.getGraph(), model);
			
			this.currentXDelta = 0;
		}
	}
	
	this.setCellLocations(this.layout.getGraph(), model);
};

bpmCoordinateAssignment.prototype.minNode = function(model)
{
	var nodeList = [];
	
	var map = new bpmDictionary();
	var rank = [];
	
	for (var i = 0; i <= model.maxRank; i++)
	{
		rank[i] = model.ranks[i];
		
		for (var j = 0; j < rank[i].length; j++)
		{
			var node = rank[i][j];
			var nodeWrapper = new WeightedCellSorter(node, i);
			nodeWrapper.rankIndex = j;
			nodeWrapper.visited = true;
			nodeList.push(nodeWrapper);
			
			map.put(node, nodeWrapper);
		}
	}
	
	var maxTries = nodeList.length * 10;
	var count = 0;
	
	var tolerance = 1;
	
	while (nodeList.length > 0 && count <= maxTries)
	{
		var cellWrapper = nodeList.shift();
		var cell = cellWrapper.cell;
		
		var rankValue = cellWrapper.weightedValue;
		var rankIndex = parseInt(cellWrapper.rankIndex);
		
		var nextLayerConnectedCells = cell.getNextLayerConnectedCells(rankValue);
		var previousLayerConnectedCells = cell.getPreviousLayerConnectedCells(rankValue);
		
		var numNextLayerConnected = nextLayerConnectedCells.length;
		var numPreviousLayerConnected = previousLayerConnectedCells.length;

		var medianNextLevel = this.medianXValue(nextLayerConnectedCells,
				rankValue + 1);
		var medianPreviousLevel = this.medianXValue(previousLayerConnectedCells,
				rankValue - 1);

		var numConnectedNeighbours = numNextLayerConnected
				+ numPreviousLayerConnected;
		var currentPosition = cell.getGeneralPurposeVariable(rankValue);
		var cellMedian = currentPosition;
		
		if (numConnectedNeighbours > 0)
		{
			cellMedian = (medianNextLevel * numNextLayerConnected + medianPreviousLevel
					* numPreviousLayerConnected)
					/ numConnectedNeighbours;
		}

		var positionChanged = false;
		
		if (cellMedian < currentPosition - tolerance)
		{
			if (rankIndex == 0)
			{
				cell.setGeneralPurposeVariable(rankValue, cellMedian);
				positionChanged = true;
			}
			else
			{
				var leftCell = rank[rankValue][rankIndex - 1];
				var leftLimit = leftCell
						.getGeneralPurposeVariable(rankValue);
				leftLimit = leftLimit + leftCell.width / 2
						+ this.intraCellSpacing + cell.width / 2;

				if (leftLimit < cellMedian)
				{
					cell.setGeneralPurposeVariable(rankValue, cellMedian);
					positionChanged = true;
				}
				else if (leftLimit < cell
						.getGeneralPurposeVariable(rankValue)
						- tolerance)
				{
					cell.setGeneralPurposeVariable(rankValue, leftLimit);
					positionChanged = true;
				}
			}
		}
		else if (cellMedian > currentPosition + tolerance)
		{
			var rankSize = rank[rankValue].length;
			
			if (rankIndex == rankSize - 1)
			{
				cell.setGeneralPurposeVariable(rankValue, cellMedian);
				positionChanged = true;
			}
			else
			{
				var rightCell = rank[rankValue][rankIndex + 1];
				var rightLimit = rightCell
						.getGeneralPurposeVariable(rankValue);
				rightLimit = rightLimit - rightCell.width / 2
						- this.intraCellSpacing - cell.width / 2;
				
				if (rightLimit > cellMedian)
				{
					cell.setGeneralPurposeVariable(rankValue, cellMedian);
					positionChanged = true;
				}
				else if (rightLimit > cell
						.getGeneralPurposeVariable(rankValue)
						+ tolerance)
				{
					cell.setGeneralPurposeVariable(rankValue, rightLimit);
					positionChanged = true;
				}
			}
		}
		
		if (positionChanged)
		{
			for (var i = 0; i < nextLayerConnectedCells.length; i++)
			{
				var connectedCell = nextLayerConnectedCells[i];
				var connectedCellWrapper = map.get(connectedCell);
				
				if (connectedCellWrapper != null)
				{
					if (connectedCellWrapper.visited == false)
					{
						connectedCellWrapper.visited = true;
						nodeList.push(connectedCellWrapper);
					}
				}
			}

			for (var i = 0; i < previousLayerConnectedCells.length; i++)
			{
				var connectedCell = previousLayerConnectedCells[i];
				var connectedCellWrapper = map.get(connectedCell);

				if (connectedCellWrapper != null)
				{
					if (connectedCellWrapper.visited == false)
					{
						connectedCellWrapper.visited = true;
						nodeList.push(connectedCellWrapper);
					}
				}
			}
		}
		
		cellWrapper.visited = false;
		count++;
	}
};

bpmCoordinateAssignment.prototype.medianPos = function(i, model)
{
	var downwardSweep = (i % 2 == 0);
	
	if (downwardSweep)
	{
		for (var j = model.maxRank; j > 0; j--)
		{
			this.rankMedianPosition(j - 1, model, j);
		}
	}
	else
	{
		for (var j = 0; j < model.maxRank - 1; j++)
		{
			this.rankMedianPosition(j + 1, model, j);
		}
	}
};

bpmCoordinateAssignment.prototype.rankMedianPosition = function(rankValue, model, nextRankValue)
{
	var rank = model.ranks[rankValue];
	var weightedValues = [];
	var cellMap = new Object();

	for (var i = 0; i < rank.length; i++)
	{
		var currentCell = rank[i];
		weightedValues[i] = new WeightedCellSorter();
		weightedValues[i].cell = currentCell;
		weightedValues[i].rankIndex = i;
		cellMap[currentCell.id] = weightedValues[i];
		var nextLayerConnectedCells = null;
		
		if (nextRankValue < rankValue)
		{
			nextLayerConnectedCells = currentCell
					.getPreviousLayerConnectedCells(rankValue);
		}
		else
		{
			nextLayerConnectedCells = currentCell
					.getNextLayerConnectedCells(rankValue);
		}

		weightedValues[i].weightedValue = this.calculatedWeightedValue(
				currentCell, nextLayerConnectedCells);
	}

	weightedValues.sort(WeightedCellSorter.prototype.compare);

	
	for (var i = 0; i < weightedValues.length; i++)
	{
		var numConnectionsNextLevel = 0;
		var cell = weightedValues[i].cell;
		var nextLayerConnectedCells = null;
		var medianNextLevel = 0;

		if (nextRankValue < rankValue)
		{
			nextLayerConnectedCells = cell.getPreviousLayerConnectedCells(
					rankValue).slice();
		}
		else
		{
			nextLayerConnectedCells = cell.getNextLayerConnectedCells(
					rankValue).slice();
		}

		if (nextLayerConnectedCells != null)
		{
			numConnectionsNextLevel = nextLayerConnectedCells.length;
			
			if (numConnectionsNextLevel > 0)
			{
				medianNextLevel = this.medianXValue(nextLayerConnectedCells,
						nextRankValue);
			}
			else
			{
				medianNextLevel = cell.getGeneralPurposeVariable(rankValue);
			}
		}

		var leftBuffer = 0.0;
		var leftLimit = -100000000.0;
		
		for (var j = weightedValues[i].rankIndex - 1; j >= 0;)
		{
			var weightedValue = cellMap[rank[j].id];
			
			if (weightedValue != null)
			{
				var leftCell = weightedValue.cell;
				
				if (weightedValue.visited)
				{
					leftLimit = leftCell
							.getGeneralPurposeVariable(rankValue)
							+ leftCell.width
							/ 2.0
							+ this.intraCellSpacing
							+ leftBuffer + cell.width / 2.0;
					j = -1;
				}
				else
				{
					leftBuffer += leftCell.width + this.intraCellSpacing;
					j--;
				}
			}
		}

		var rightBuffer = 0.0;
		var rightLimit = 100000000.0;
		
		for (var j = weightedValues[i].rankIndex + 1; j < weightedValues.length;)
		{
			var weightedValue = cellMap[rank[j].id];
			
			if (weightedValue != null)
			{
				var rightCell = weightedValue.cell;
				
				if (weightedValue.visited)
				{
					rightLimit = rightCell
							.getGeneralPurposeVariable(rankValue)
							- rightCell.width
							/ 2.0
							- this.intraCellSpacing
							- rightBuffer - cell.width / 2.0;
					j = weightedValues.length;
				}
				else
				{
					rightBuffer += rightCell.width + this.intraCellSpacing;
					j++;
				}
			}
		}
		
		if (medianNextLevel >= leftLimit && medianNextLevel <= rightLimit)
		{
			cell.setGeneralPurposeVariable(rankValue, medianNextLevel);
		}
		else if (medianNextLevel < leftLimit)
		{
			cell.setGeneralPurposeVariable(rankValue, leftLimit);
			this.currentXDelta += leftLimit - medianNextLevel;
		}
		else if (medianNextLevel > rightLimit)
		{
			cell.setGeneralPurposeVariable(rankValue, rightLimit);
			this.currentXDelta += medianNextLevel - rightLimit;
		}

		weightedValues[i].visited = true;
	}
};

bpmCoordinateAssignment.prototype.calculatedWeightedValue = function(currentCell, collection)
{
	var totalWeight = 0;
	
	for (var i = 0; i < collection.length; i++)
	{
		var cell = collection[i];

		if (currentCell.isVertex() && cell.isVertex())
		{
			totalWeight++;
		}
		else if (currentCell.isEdge() && cell.isEdge())
		{
			totalWeight += 8;
		}
		else
		{
			totalWeight += 2;
		}
	}

	return totalWeight;
};

bpmCoordinateAssignment.prototype.medianXValue = function(connectedCells, rankValue)
{
	if (connectedCells.length == 0)
	{
		return 0;
	}

	var medianValues = [];

	for (var i = 0; i < connectedCells.length; i++)
	{
		medianValues[i] = connectedCells[i].getGeneralPurposeVariable(rankValue);
	}

	medianValues.sort(function(a,b){return a - b;});
	
	if (connectedCells.length % 2 == 1)
	{
		return medianValues[Math.floor(connectedCells.length / 2)];
	}
	else
	{
		var medianPoint = connectedCells.length / 2;
		var leftMedian = medianValues[medianPoint - 1];
		var rightMedian = medianValues[medianPoint];

		return ((leftMedian + rightMedian) / 2);
	}
};

bpmCoordinateAssignment.prototype.initialCoords = function(facade, model)
{
	this.calculateWidestRank(facade, model);

	// Sweep up and down from the widest rank
	for (var i = this.widestRank; i >= 0; i--)
	{
		if (i < model.maxRank)
		{
			this.rankCoordinates(i, facade, model);
		}
	}

	for (var i = this.widestRank+1; i <= model.maxRank; i++)
	{
		if (i > 0)
		{
			this.rankCoordinates(i, facade, model);
		}
	}
};

bpmCoordinateAssignment.prototype.rankCoordinates = function(rankValue, graph, model)
{
	var rank = model.ranks[rankValue];
	var maxY = 0.0;
	var localX = this.initialX + (this.widestRankValue - this.rankWidths[rankValue])
			/ 2;

	var boundsWarning = false;
	
	for (var i = 0; i < rank.length; i++)
	{
		var node = rank[i];
		
		if (node.isVertex())
		{
			var bounds = this.layout.getVertexBounds(node.cell);

			if (bounds != null)
			{
				if (this.orientation == bpmConstants.DIRECTION_NORTH ||
					this.orientation == bpmConstants.DIRECTION_SOUTH)
				{
					node.width = bounds.width;
					node.height = bounds.height;
				}
				else
				{
					node.width = bounds.height;
					node.height = bounds.width;
				}
			}
			else
			{
				boundsWarning = true;
			}

			maxY = Math.max(maxY, node.height);
		}
		else if (node.isEdge())
		{
			var numEdges = 1;

			if (node.edges != null)
			{
				numEdges = node.edges.length;
			}
			else
			{
				bpmLog.warn('edge.edges is null');
			}

			node.width = (numEdges - 1) * this.parallelEdgeSpacing;
		}

		localX += node.width / 2.0;
		node.setX(rankValue, localX);
		node.setGeneralPurposeVariable(rankValue, localX);
		localX += node.width / 2.0;
		localX += this.intraCellSpacing;
	}

	if (boundsWarning == true)
	{
		bpmLog.warn('At least one cell has no bounds');
	}
};

bpmCoordinateAssignment.prototype.calculateWidestRank = function(graph, model)
{
	var y = -this.interRankCellSpacing;
	
	var lastRankMaxCellHeight = 0.0;
	this.rankWidths = [];
	this.rankY = [];

	for (var rankValue = model.maxRank; rankValue >= 0; rankValue--)
	{
		var maxCellHeight = 0.0;
		var rank = model.ranks[rankValue];
		var localX = this.initialX;
		var boundsWarning = false;
		
		for (var i = 0; i < rank.length; i++)
		{
			var node = rank[i];

			if (node.isVertex())
			{
				var bounds = this.layout.getVertexBounds(node.cell);

				if (bounds != null)
				{
					if (this.orientation == bpmConstants.DIRECTION_NORTH ||
						this.orientation == bpmConstants.DIRECTION_SOUTH)
					{
						node.width = bounds.width;
						node.height = bounds.height;
					}
					else
					{
						node.width = bounds.height;
						node.height = bounds.width;
					}
				}
				else
				{
					boundsWarning = true;
				}

				maxCellHeight = Math.max(maxCellHeight, node.height);
			}
			else if (node.isEdge())
			{
				var numEdges = 1;

				if (node.edges != null)
				{
					numEdges = node.edges.length;
				}
				else
				{
					bpmLog.warn('edge.edges is null');
				}

				node.width = (numEdges - 1) * this.parallelEdgeSpacing;
			}

			localX += node.width / 2.0;
			node.setX(rankValue, localX);
			node.setGeneralPurposeVariable(rankValue, localX);
			localX += node.width / 2.0;
			localX += this.intraCellSpacing;

			if (localX > this.widestRankValue)
			{
				this.widestRankValue = localX;
				this.widestRank = rankValue;
			}

			this.rankWidths[rankValue] = localX;
		}

		if (boundsWarning == true)
		{
			bpmLog.warn('At least one cell has no bounds');
		}

		this.rankY[rankValue] = y;
		var distanceToNextRank = maxCellHeight / 2.0
				+ lastRankMaxCellHeight / 2.0 + this.interRankCellSpacing;
		lastRankMaxCellHeight = maxCellHeight;

		if (this.orientation == bpmConstants.DIRECTION_NORTH ||
			this.orientation == bpmConstants.DIRECTION_WEST)
		{
			y += distanceToNextRank;
		}
		else
		{
			y -= distanceToNextRank;
		}

		for (var i = 0; i < rank.length; i++)
		{
			var cell = rank[i];
			cell.setY(rankValue, y);
		}
	}
};

bpmCoordinateAssignment.prototype.minPath = function(graph, model)
{
	var edges = model.edgeMapper.getValues();
	
	for (var j = 0; j < edges.length; j++)
	{
		var cell = edges[j];
		
		if (cell.maxRank - cell.minRank - 1 < 1)
		{
			continue;
		}

		var referenceX = cell
				.getGeneralPurposeVariable(cell.minRank + 1);
		var edgeStraight = true;
		var refSegCount = 0;
		
		for (var i = cell.minRank + 2; i < cell.maxRank; i++)
		{
			var x = cell.getGeneralPurposeVariable(i);

			if (referenceX != x)
			{
				edgeStraight = false;
				referenceX = x;
			}
			else
			{
				refSegCount++;
			}
		}

		if (!edgeStraight)
		{
			var upSegCount = 0;
			var downSegCount = 0;
			var upXPositions = [];
			var downXPositions = [];

			var currentX = cell.getGeneralPurposeVariable(cell.minRank + 1);

			for (var i = cell.minRank + 1; i < cell.maxRank - 1; i++)
			{
				var nextX = cell.getX(i + 1);

				if (currentX == nextX)
				{
					upXPositions[i - cell.minRank - 1] = currentX;
					upSegCount++;
				}
				else if (this.repositionValid(model, cell, i + 1, currentX))
				{
					upXPositions[i - cell.minRank - 1] = currentX;
					upSegCount++;
				}
				else
				{
					upXPositions[i - cell.minRank - 1] = nextX;
					currentX = nextX;
				}				
			}

			currentX = cell.getX(i);

			for (var i = cell.maxRank - 1; i > cell.minRank + 1; i--)
			{
				var nextX = cell.getX(i - 1);

				if (currentX == nextX)
				{
					downXPositions[i - cell.minRank - 2] = currentX;
					downSegCount++;
				}
				else if (this.repositionValid(model, cell, i - 1, currentX))
				{
					downXPositions[i - cell.minRank - 2] = currentX;
					downSegCount++;
				}
				else
				{
					downXPositions[i - cell.minRank - 2] = cell.getX(i-1);
					currentX = nextX;
				}
			}

			if (downSegCount > refSegCount || upSegCount > refSegCount)
			{
				if (downSegCount >= upSegCount)
				{
					for (var i = cell.maxRank - 2; i > cell.minRank; i--)
					{
						cell.setX(i, downXPositions[i - cell.minRank - 1]);
					}
				}
				else if (upSegCount > downSegCount)
				{
					for (var i = cell.minRank + 2; i < cell.maxRank; i++)
					{
						cell.setX(i, upXPositions[i - cell.minRank - 2]);
					}
				}
				else
				{
					//
				}
			}
		}
	}
};

bpmCoordinateAssignment.prototype.repositionValid = function(model, cell, rank, position)
{
	var rankArray = model.ranks[rank];
	var rankIndex = -1;

	for (var i = 0; i < rankArray.length; i++)
	{
		if (cell == rankArray[i])
		{
			rankIndex = i;
			break;
		}
	}

	if (rankIndex < 0)
	{
		return false;
	}

	var currentX = cell.getGeneralPurposeVariable(rank);

	if (position < currentX)
	{
		if (rankIndex == 0)
		{
			return true;
		}

		var leftCell = rankArray[rankIndex - 1];
		var leftLimit = leftCell.getGeneralPurposeVariable(rank);
		leftLimit = leftLimit + leftCell.width / 2
				+ this.intraCellSpacing + cell.width / 2;

		if (leftLimit <= position)
		{
			return true;
		}
		else
		{
			return false;
		}
	}
	else if (position > currentX)
	{
		if (rankIndex == rankArray.length - 1)
		{
			return true;
		}

		var rightCell = rankArray[rankIndex + 1];
		var rightLimit = rightCell.getGeneralPurposeVariable(rank);
		rightLimit = rightLimit - rightCell.width / 2
				- this.intraCellSpacing - cell.width / 2;

		if (rightLimit >= position)
		{
			return true;
		}
		else
		{
			return false;
		}
	}

	return true;
};

bpmCoordinateAssignment.prototype.setCellLocations = function(graph, model)
{
	this.rankTopY = [];
	this.rankBottomY = [];

	for (var i = 0; i < model.ranks.length; i++)
	{
		this.rankTopY[i] = Number.MAX_VALUE;
		this.rankBottomY[i] = -Number.MAX_VALUE;
	}
	
	var vertices = model.vertexMapper.getValues();

	for (var i = 0; i < vertices.length; i++)
	{
		this.setVertexLocation(vertices[i]);
	}
	
	if (this.layout.edgeStyle == bpmHierarchicalEdgeStyle.ORTHOGONAL
			|| this.layout.edgeStyle == bpmHierarchicalEdgeStyle.POLYLINE
			|| this.layout.edgeStyle == bpmHierarchicalEdgeStyle.CURVE)
	{
		this.localEdgeProcessing(model);
	}

	var edges = model.edgeMapper.getValues();

	for (var i = 0; i < edges.length; i++)
	{
		this.setEdgePosition(edges[i]);
	}
};

bpmCoordinateAssignment.prototype.localEdgeProcessing = function(model)
{
	for (var rankIndex = 0; rankIndex < model.ranks.length; rankIndex++)
	{
		var rank = model.ranks[rankIndex];

		for (var cellIndex = 0; cellIndex < rank.length; cellIndex++)
		{
			var cell = rank[cellIndex];

			if (cell.isVertex())
			{
				var currentCells = cell.getPreviousLayerConnectedCells(rankIndex);

				var currentRank = rankIndex - 1;

				for (var k = 0; k < 2; k++)
				{
					if (currentRank > -1
							&& currentRank < model.ranks.length
							&& currentCells != null
							&& currentCells.length > 0)
					{
						var sortedCells = [];

						for (var j = 0; j < currentCells.length; j++)
						{
							var sorter = new WeightedCellSorter(
									currentCells[j], currentCells[j].getX(currentRank));
							sortedCells.push(sorter);
						}

						sortedCells.sort(WeightedCellSorter.prototype.compare);

						var leftLimit = cell.x[0] - cell.width / 2;
						var rightLimit = leftLimit + cell.width;

						var connectedEdgeCount = 0;
						var connectedEdgeGroupCount = 0;
						var connectedEdges = [];
						for (var j = 0; j < sortedCells.length; j++)
						{
							var innerCell = sortedCells[j].cell;
							var connections;

							if (innerCell.isVertex())
							{
								if (k == 0)
								{
									connections = cell.connectsAsSource;

								}
								else
								{
									connections = cell.connectsAsTarget;
								}

								for (var connIndex = 0; connIndex < connections.length; connIndex++)
								{
									if (connections[connIndex].source == innerCell
											|| connections[connIndex].target == innerCell)
									{
										connectedEdgeCount += connections[connIndex].edges
												.length;
										connectedEdgeGroupCount++;

										connectedEdges.push(connections[connIndex]);
									}
								}
							}
							else
							{
								connectedEdgeCount += innerCell.edges.length;
								connectedEdgeGroupCount++;
								connectedEdges.push(innerCell);
							}
						}

						var requiredWidth = (connectedEdgeCount + 1)
								* this.prefHozEdgeSep;

						if (cell.width > requiredWidth
								+ (2 * this.prefHozEdgeSep))
						{
							leftLimit += this.prefHozEdgeSep;
							rightLimit -= this.prefHozEdgeSep;
						}

						var availableWidth = rightLimit - leftLimit;
						var edgeSpacing = availableWidth / connectedEdgeCount;

						var currentX = leftLimit + edgeSpacing / 2.0;
						var currentYOffset = this.minEdgeJetty - this.prefVertEdgeOff;
						var maxYOffset = 0;

						for (var j = 0; j < connectedEdges.length; j++)
						{
							var numActualEdges = connectedEdges[j].edges
									.length;
							var pos = this.jettyPositions[connectedEdges[j].ids[0]];
							
							if (pos == null)
							{
								pos = [];
								this.jettyPositions[connectedEdges[j].ids[0]] = pos;
							}

							if (j < connectedEdgeCount / 2)
							{
								currentYOffset += this.prefVertEdgeOff;
							}
							else if (j > connectedEdgeCount / 2)
							{
								currentYOffset -= this.prefVertEdgeOff;
							}

							for (var m = 0; m < numActualEdges; m++)
							{
								pos[m * 4 + k * 2] = currentX;
								currentX += edgeSpacing;
								pos[m * 4 + k * 2 + 1] = currentYOffset;
							}
							
							maxYOffset = Math.max(maxYOffset,
									currentYOffset);
						}
					}

					currentCells = cell.getNextLayerConnectedCells(rankIndex);

					currentRank = rankIndex + 1;
				}
			}
		}
	}
};

bpmCoordinateAssignment.prototype.setEdgePosition = function(cell)
{
	var offsetX = 0;

	if (cell.temp[0] != 101207)
	{
		var maxRank = cell.maxRank;
		var minRank = cell.minRank;
		
		if (maxRank == minRank)
		{
			maxRank = cell.source.maxRank;
			minRank = cell.target.minRank;
		}
		
		var parallelEdgeCount = 0;
		var jettys = this.jettyPositions[cell.ids[0]];

		var source = cell.isReversed ? cell.target.cell : cell.source.cell;
		var graph = this.layout.graph;
		var layoutReversed = this.orientation == bpmConstants.DIRECTION_EAST
				|| this.orientation == bpmConstants.DIRECTION_SOUTH;

		for (var i = 0; i < cell.edges.length; i++)
		{
			var realEdge = cell.edges[i];
			var realSource = this.layout.getVisibleTerminal(realEdge, true);

			var newPoints = [];
			var reversed = cell.isReversed;
			
			if (realSource != source)
			{
				reversed = !reversed;
			}

			if (jettys != null)
			{
				var arrayOffset = reversed ? 2 : 0;
				var y = reversed ?
						(layoutReversed ? this.rankBottomY[minRank] : this.rankTopY[minRank]) :
							(layoutReversed ? this.rankTopY[maxRank] : this.rankBottomY[maxRank]);
				var jetty = jettys[parallelEdgeCount * 4 + 1 + arrayOffset];
				
				if (reversed != layoutReversed)
				{
					jetty = -jetty;
				}
				
				y += jetty;
				var x = jettys[parallelEdgeCount * 4 + arrayOffset];
				
				var modelSource = graph.model.getTerminal(realEdge, true);

				if (this.layout.isPort(modelSource) && graph.model.getParent(modelSource) == realSource)
				{
					var state = graph.view.getState(modelSource);
					
					if (state != null)
					{
						x = state.x;
					}
					else
					{
						x = realSource.geometry.x + cell.source.width * modelSource.geometry.x;
					}
				}

				if (this.orientation == bpmConstants.DIRECTION_NORTH
						|| this.orientation == bpmConstants.DIRECTION_SOUTH)
				{
					newPoints.push(new bpmPoint(x, y));
					
					if (this.layout.edgeStyle == bpmHierarchicalEdgeStyle.CURVE)
					{
						newPoints.push(new bpmPoint(x, y + jetty));
					}
				}
				else
				{
					newPoints.push(new bpmPoint(y, x));
					
					if (this.layout.edgeStyle == bpmHierarchicalEdgeStyle.CURVE)
					{
						newPoints.push(new bpmPoint(y + jetty, x));
					}
				}
			}

			var loopStart = cell.x.length - 1;
			var loopLimit = -1;
			var loopDelta = -1;
			var currentRank = cell.maxRank - 1;

			if (reversed)
			{
				loopStart = 0;
				loopLimit = cell.x.length;
				loopDelta = 1;
				currentRank = cell.minRank + 1;
			}

			for (var j = loopStart; (cell.maxRank != cell.minRank) && j != loopLimit; j += loopDelta)
			{
				var positionX = cell.x[j] + offsetX;

				var topChannelY = (this.rankTopY[currentRank] + this.rankBottomY[currentRank + 1]) / 2.0;
				var bottomChannelY = (this.rankTopY[currentRank - 1] + this.rankBottomY[currentRank]) / 2.0;

				if (reversed)
				{
					var tmp = topChannelY;
					topChannelY = bottomChannelY;
					bottomChannelY = tmp;
				}

				if (this.orientation == bpmConstants.DIRECTION_NORTH ||
					this.orientation == bpmConstants.DIRECTION_SOUTH)
				{
					newPoints.push(new bpmPoint(positionX, topChannelY));
					newPoints.push(new bpmPoint(positionX, bottomChannelY));
				}
				else
				{
					newPoints.push(new bpmPoint(topChannelY, positionX));
					newPoints.push(new bpmPoint(bottomChannelY, positionX));
				}

				this.limitX = Math.max(this.limitX, positionX);
				currentRank += loopDelta;
			}

			if (jettys != null)
			{
				var arrayOffset = reversed ? 2 : 0;
				var rankY = reversed ?
						(layoutReversed ? this.rankTopY[maxRank] : this.rankBottomY[maxRank]) :
							(layoutReversed ? this.rankBottomY[minRank] : this.rankTopY[minRank]);
				var jetty = jettys[parallelEdgeCount * 4 + 3 - arrayOffset];
				
				if (reversed != layoutReversed)
				{
					jetty = -jetty;
				}
				var y = rankY - jetty;
				var x = jettys[parallelEdgeCount * 4 + 2 - arrayOffset];
				
				var modelTarget = graph.model.getTerminal(realEdge, false);
				var realTarget = this.layout.getVisibleTerminal(realEdge, false);

				if (this.layout.isPort(modelTarget) && graph.model.getParent(modelTarget) == realTarget)
				{
					var state = graph.view.getState(modelTarget);
					
					if (state != null)
					{
						x = state.x;
					}
					else
					{
						x = realTarget.geometry.x + cell.target.width * modelTarget.geometry.x;
					}
				}

				if (this.orientation == bpmConstants.DIRECTION_NORTH ||
						this.orientation == bpmConstants.DIRECTION_SOUTH)
				{
					if (this.layout.edgeStyle == bpmHierarchicalEdgeStyle.CURVE)
					{
						newPoints.push(new bpmPoint(x, y - jetty));
					}

					newPoints.push(new bpmPoint(x, y));
				}
				else
				{
					if (this.layout.edgeStyle == bpmHierarchicalEdgeStyle.CURVE)
					{
						newPoints.push(new bpmPoint(y - jetty, x));
					}

					newPoints.push(new bpmPoint(y, x));
				}
			}

			if (cell.isReversed)
			{
				this.processReversedEdge(cell, realEdge);
			}

			this.layout.setEdgePoints(realEdge, newPoints);

			if (offsetX == 0.0)
			{
				offsetX = this.parallelEdgeSpacing;
			}
			else if (offsetX > 0)
			{
				offsetX = -offsetX;
			}
			else
			{
				offsetX = -offsetX + this.parallelEdgeSpacing;
			}
			
			parallelEdgeCount++;
		}

		cell.temp[0] = 101207;
	}
};

bpmCoordinateAssignment.prototype.setVertexLocation = function(cell)
{
	var realCell = cell.cell;
	var positionX = cell.x[0] - cell.width / 2;
	var positionY = cell.y[0] - cell.height / 2;

	this.rankTopY[cell.minRank] = Math.min(this.rankTopY[cell.minRank], positionY);
	this.rankBottomY[cell.minRank] = Math.max(this.rankBottomY[cell.minRank],
			positionY + cell.height);

	if (this.orientation == bpmConstants.DIRECTION_NORTH ||
		this.orientation == bpmConstants.DIRECTION_SOUTH)
	{
		this.layout.setVertexLocation(realCell, positionX, positionY);
	}
	else
	{
		this.layout.setVertexLocation(realCell, positionY, positionX);
	}

	this.limitX = Math.max(this.limitX, positionX + cell.width);
};

bpmCoordinateAssignment.prototype.processReversedEdge = function(graph, model)
{
	
};


/* Swimlane Ordering */
function bpmSwimlaneOrdering(layout)
{
	this.layout = layout;
};

bpmSwimlaneOrdering.prototype = new bpmHierarchicalLayoutStage();
bpmSwimlaneOrdering.prototype.constructor = bpmSwimlaneOrdering;
bpmSwimlaneOrdering.prototype.layout = null;

bpmSwimlaneOrdering.prototype.execute = function(parent)
{
	var model = this.layout.getModel();
	var seenNodes = new Object();
	var unseenNodes = bpmUtils.clone(model.vertexMapper, null, true);
	
	var rootsArray = null;
	
	if (model.roots != null)
	{
		var modelRoots = model.roots;
		rootsArray = [];
		
		for (var i = 0; i < modelRoots.length; i++)
		{
			var nodeId = bpmCellPath.create(modelRoots[i]);
			rootsArray[i] = model.vertexMapper.get(modelRoots[i]);
		}
	}

	model.visit(function(parent, node, connectingEdge, layer, seen)
	{
		var isAncestor = parent != null && parent.swimlaneIndex == node.swimlaneIndex && node.isAncestor(parent);

		var reversedOverSwimlane = parent != null && connectingEdge != null &&
						parent.swimlaneIndex < node.swimlaneIndex && connectingEdge.source == node;

		if (isAncestor)
		{
			connectingEdge.invert();
			bpmUtils.remove(connectingEdge, parent.connectsAsSource);
			node.connectsAsSource.push(connectingEdge);
			parent.connectsAsTarget.push(connectingEdge);
			bpmUtils.remove(connectingEdge, node.connectsAsTarget);
		}
		else if (reversedOverSwimlane)
		{
			connectingEdge.invert();
			bpmUtils.remove(connectingEdge, parent.connectsAsTarget);
			node.connectsAsTarget.push(connectingEdge);
			parent.connectsAsSource.push(connectingEdge);
			bpmUtils.remove(connectingEdge, node.connectsAsSource);
		}
		
		var cellId = bpmCellPath.create(node.cell);
		seenNodes[cellId] = node;
		delete unseenNodes[cellId];
	}, rootsArray, true, null);
};



/* Hierarchical Layout */
function bpmHierarchicalLayout(graph, orientation, deterministic)
{
	bpmGraphLayout.call(this, graph);
	this.orientation = (orientation != null) ? orientation : bpmConstants.DIRECTION_NORTH;
	this.deterministic = (deterministic != null) ? deterministic : true;
};

var bpmHierarchicalEdgeStyle =
{
	ORTHOGONAL: 1,
	POLYLINE: 2,
	STRAIGHT: 3,
	CURVE: 4
};

bpmHierarchicalLayout.prototype = new bpmGraphLayout();
bpmHierarchicalLayout.prototype.constructor = bpmHierarchicalLayout;
bpmHierarchicalLayout.prototype.roots = null;
bpmHierarchicalLayout.prototype.resizeParent = false;
bpmHierarchicalLayout.prototype.maintainParentLocation = false;
bpmHierarchicalLayout.prototype.moveParent = false;
bpmHierarchicalLayout.prototype.parentBorder = 0;
bpmHierarchicalLayout.prototype.intraCellSpacing = 30;
bpmHierarchicalLayout.prototype.interRankCellSpacing = 100;
bpmHierarchicalLayout.prototype.interHierarchySpacing = 60;
bpmHierarchicalLayout.prototype.parallelEdgeSpacing = 10;
bpmHierarchicalLayout.prototype.orientation = bpmConstants.DIRECTION_NORTH;
bpmHierarchicalLayout.prototype.fineTuning = true;
bpmHierarchicalLayout.prototype.tightenToSource = true;
bpmHierarchicalLayout.prototype.disableEdgeStyle = true;
bpmHierarchicalLayout.prototype.traverseAncestors = true;
bpmHierarchicalLayout.prototype.model = null;
bpmHierarchicalLayout.prototype.edgesCache = null;
bpmHierarchicalLayout.prototype.edgeSourceTermCache = null;
bpmHierarchicalLayout.prototype.edgesTargetTermCache = null;
bpmHierarchicalLayout.prototype.edgeStyle = bpmHierarchicalEdgeStyle.POLYLINE;

bpmHierarchicalLayout.prototype.getModel = function()
{
	return this.model;
};

bpmHierarchicalLayout.prototype.execute = function(parent, roots)
{
	this.parent = parent;
	var model = this.graph.model;
	this.edgesCache = new bpmDictionary();
	this.edgeSourceTermCache = new bpmDictionary();
	this.edgesTargetTermCache = new bpmDictionary();

	if (roots != null && !(roots instanceof Array))
	{
		roots = [roots];
	}

	if (roots == null && parent == null)
	{
		// TODO indicate the problem
		return;
	}
	
	this.parentX = null;
	this.parentY = null;
	
	if (parent != this.root && model.isVertex(parent) != null && this.maintainParentLocation)
	{
		var geo = this.graph.getCellGeometry(parent);
		
		if (geo != null)
		{
			this.parentX = geo.x;
			this.parentY = geo.y;
		}
	}
	
	if (roots != null)
	{
		var rootsCopy = [];

		for (var i = 0; i < roots.length; i++)
		{
			var ancestor = parent != null ? model.isAncestor(parent, roots[i]) : true;
			
			if (ancestor && model.isVertex(roots[i]))
			{
				rootsCopy.push(roots[i]);
			}
		}

		this.roots = rootsCopy;
	}
	
	model.beginUpdate();
	try
	{
		this.run(parent);
		
		if (this.resizeParent && !this.graph.isCellCollapsed(parent))
		{
			this.graph.updateGroupBounds([parent], this.parentBorder, this.moveParent);
		}
		
		// Maintaining parent location
		if (this.parentX != null && this.parentY != null)
		{
			var geo = this.graph.getCellGeometry(parent);
			
			if (geo != null)
			{
				geo = geo.clone();
				geo.x = this.parentX;
				geo.y = this.parentY;
				model.setGeometry(parent, geo);
			}
		}
	}
	finally
	{
		model.endUpdate();
	}
};

bpmHierarchicalLayout.prototype.findRoots = function(parent, vertices)
{
	var roots = [];
	
	if (parent != null && vertices != null)
	{
		var model = this.graph.model;
		var best = null;
		var maxDiff = -100000;
		
		for (var i in vertices)
		{
			var cell = vertices[i];

			if (model.isVertex(cell) && this.graph.isCellVisible(cell))
			{
				var conns = this.getEdges(cell);
				var fanOut = 0;
				var fanIn = 0;

				for (var k = 0; k < conns.length; k++)
				{
					var src = this.getVisibleTerminal(conns[k], true);

					if (src == cell)
					{
						fanOut++;
					}
					else
					{
						fanIn++;
					}
				}

				if (fanIn == 0 && fanOut > 0)
				{
					roots.push(cell);
				}

				var diff = fanOut - fanIn;

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

bpmHierarchicalLayout.prototype.getEdges = function(cell)
{
	var cachedEdges = this.edgesCache.get(cell);
	
	if (cachedEdges != null)
	{
		return cachedEdges;
	}

	var model = this.graph.model;
	var edges = [];
	var isCollapsed = this.graph.isCellCollapsed(cell);
	var childCount = model.getChildCount(cell);

	for (var i = 0; i < childCount; i++)
	{
		var child = model.getChildAt(cell, i);

		if (this.isPort(child))
		{
			edges = edges.concat(model.getEdges(child, true, true));
		}
		else if (isCollapsed || !this.graph.isCellVisible(child))
		{
			edges = edges.concat(model.getEdges(child, true, true));
		}
	}

	edges = edges.concat(model.getEdges(cell, true, true));
	var result = [];
	
	for (var i = 0; i < edges.length; i++)
	{
		var source = this.getVisibleTerminal(edges[i], true);
		var target = this.getVisibleTerminal(edges[i], false);
		
		if ((source == target) ||
				((source != target) &&
						((target == cell && (this.parent == null || this.isAncestor(this.parent, source, this.traverseAncestors))) ||
						 	(source == cell && (this.parent == null || this.isAncestor(this.parent, target, this.traverseAncestors))))))
		{
			result.push(edges[i]);
		}
	}

	this.edgesCache.put(cell, result);

	return result;
};

bpmHierarchicalLayout.prototype.getVisibleTerminal = function(edge, source)
{
	var terminalCache = this.edgesTargetTermCache;
	
	if (source)
	{
		terminalCache = this.edgeSourceTermCache;
	}

	var term = terminalCache.get(edge);

	if (term != null)
	{
		return term;
	}

	var state = this.graph.view.getState(edge);
	
	var terminal = (state != null) ? state.getVisibleTerminal(source) : this.graph.view.getVisibleTerminal(edge, source);
	
	if (terminal == null)
	{
		terminal = (state != null) ? state.getVisibleTerminal(source) : this.graph.view.getVisibleTerminal(edge, source);
	}

	if (terminal != null)
	{
		if (this.isPort(terminal))
		{
			terminal = this.graph.model.getParent(terminal);
		}
		
		terminalCache.put(edge, terminal);
	}

	return terminal;
};

bpmHierarchicalLayout.prototype.run = function(parent)
{
	var hierarchyVertices = [];
	var allVertexSet = [];

	if (this.roots == null && parent != null)
	{
		var filledVertexSet = Object();
		this.filterDescendants(parent, filledVertexSet);

		this.roots = [];
		var filledVertexSetEmpty = true;

		for (var key in filledVertexSet)
		{
			if (filledVertexSet[key] != null)
			{
				filledVertexSetEmpty = false;
				break;
			}
		}

		while (!filledVertexSetEmpty)
		{
			var candidateRoots = this.findRoots(parent, filledVertexSet);

			for (var i = 0; i < candidateRoots.length; i++)
			{
				var vertexSet = Object();
				hierarchyVertices.push(vertexSet);

				this.traverse(candidateRoots[i], true, null, allVertexSet, vertexSet,
						hierarchyVertices, filledVertexSet);
			}

			for (var i = 0; i < candidateRoots.length; i++)
			{
				this.roots.push(candidateRoots[i]);
			}
			
			filledVertexSetEmpty = true;
			
			for (var key in filledVertexSet)
			{
				if (filledVertexSet[key] != null)
				{
					filledVertexSetEmpty = false;
					break;
				}
			}
		}
	}
	else
	{

		for (var i = 0; i < this.roots.length; i++)
		{
			var vertexSet = Object();
			hierarchyVertices.push(vertexSet);

			this.traverse(this.roots[i], true, null, allVertexSet, vertexSet,
					hierarchyVertices, null);
		}
	}

	var initialX = 0;

	for (var i = 0; i < hierarchyVertices.length; i++)
	{
		var vertexSet = hierarchyVertices[i];
		var tmp = [];
		
		for (var key in vertexSet)
		{
			tmp.push(vertexSet[key]);
		}
		
		this.model = new bpmGraphHierarchyModel(this, tmp, this.roots,
			parent, this.tightenToSource);

		this.cycleStage(parent);
		this.layeringStage();
		
		this.crossingStage(parent);
		initialX = this.placementStage(initialX, parent);
	}
};

bpmHierarchicalLayout.prototype.filterDescendants = function(cell, result)
{
	var model = this.graph.model;

	if (model.isVertex(cell) && cell != this.parent && this.graph.isCellVisible(cell))
	{
		result[bpmObjectIdentity.get(cell)] = cell;
	}

	if (this.traverseAncestors || cell == this.parent
			&& this.graph.isCellVisible(cell))
	{
		var childCount = model.getChildCount(cell);

		for (var i = 0; i < childCount; i++)
		{
			var child = model.getChildAt(cell, i);
			
			if (!this.isPort(child))
			{
				this.filterDescendants(child, result);
			}
		}
	}
};

bpmHierarchicalLayout.prototype.isPort = function(cell)
{
	if (cell != null && cell.geometry != null)
	{
		return cell.geometry.relative;
	}
	else
	{
		return false;
	}
};

bpmHierarchicalLayout.prototype.getEdgesBetween = function(source, target, directed)
{
	directed = (directed != null) ? directed : false;
	var edges = this.getEdges(source);
	var result = [];

	for (var i = 0; i < edges.length; i++)
	{
		var src = this.getVisibleTerminal(edges[i], true);
		var trg = this.getVisibleTerminal(edges[i], false);

		if ((src == source && trg == target) || (!directed && src == target && trg == source))
		{
			result.push(edges[i]);
		}
	}

	return result;
};

bpmHierarchicalLayout.prototype.traverse = function(vertex, directed, edge, allVertices, currentComp,
											hierarchyVertices, filledVertexSet)
{
	if (vertex != null && allVertices != null)
	{
		var vertexID = bpmObjectIdentity.get(vertex);
		
		if ((allVertices[vertexID] == null)
				&& (filledVertexSet == null ? true : filledVertexSet[vertexID] != null))
		{
			if (currentComp[vertexID] == null)
			{
				currentComp[vertexID] = vertex;
			}
			if (allVertices[vertexID] == null)
			{
				allVertices[vertexID] = vertex;
			}

			if (filledVertexSet !== null)
			{
				delete filledVertexSet[vertexID];
			}

			var edges = this.getEdges(vertex);
			var edgeIsSource = [];

			for (var i = 0; i < edges.length; i++)
			{
				edgeIsSource[i] = (this.getVisibleTerminal(edges[i], true) == vertex);
			}

			for (var i = 0; i < edges.length; i++)
			{
				if (!directed || edgeIsSource[i])
				{
					var next = this.getVisibleTerminal(edges[i], !edgeIsSource[i]);

					var netCount = 1;

					for (var j = 0; j < edges.length; j++)
					{
						if (j == i)
						{
							continue;
						}
						else
						{
							var isSource2 = edgeIsSource[j];
							var otherTerm = this.getVisibleTerminal(edges[j], !isSource2);
							
							if (otherTerm == next)
							{
								if (isSource2)
								{
									netCount++;
								}
								else
								{
									netCount--;
								}
							}
						}
					}

					if (netCount >= 0)
					{
						currentComp = this.traverse(next, directed, edges[i], allVertices,
							currentComp, hierarchyVertices,
							filledVertexSet);
					}
				}
			}
		}
		else
		{
			if (currentComp[vertexID] == null)
			{

				for (var i = 0; i < hierarchyVertices.length; i++)
				{
					var comp = hierarchyVertices[i];

					if (comp[vertexID] != null)
					{
						for (var key in comp)
						{
							currentComp[key] = comp[key];
						}
						
						hierarchyVertices.splice(i, 1);
						return currentComp;
					}
				}
			}
		}
	}
	
	return currentComp;
};

bpmHierarchicalLayout.prototype.cycleStage = function(parent)
{
	var cycleStage = new bpmMinimumCycleRemover(this);
	cycleStage.execute(parent);
};

bpmHierarchicalLayout.prototype.layeringStage = function()
{
	this.model.initialRank();
	this.model.fixRanks();
};

bpmHierarchicalLayout.prototype.crossingStage = function(parent)
{
	var crossingStage = new bpmMedianHybridCrossingReduction(this);
	crossingStage.execute(parent);
};

bpmHierarchicalLayout.prototype.placementStage = function(initialX, parent)
{
	var placementStage = new bpmCoordinateAssignment(this, this.intraCellSpacing,
			this.interRankCellSpacing, this.orientation, initialX,
			this.parallelEdgeSpacing);
	placementStage.fineTuning = this.fineTuning;
	placementStage.execute(parent);
	
	return placementStage.limitX + this.interHierarchySpacing;
};



/* Swimlane Layout */
function bpmSwimlaneLayout(graph, orientation, deterministic)
{
	bpmGraphLayout.call(this, graph);
	this.orientation = (orientation != null) ? orientation : bpmConstants.DIRECTION_NORTH;
	this.deterministic = (deterministic != null) ? deterministic : true;
};

bpmSwimlaneLayout.prototype = new bpmGraphLayout();
bpmSwimlaneLayout.prototype.constructor = bpmSwimlaneLayout;
bpmSwimlaneLayout.prototype.roots = null;
bpmSwimlaneLayout.prototype.swimlanes = null;
bpmSwimlaneLayout.prototype.dummyVertices = null;
bpmSwimlaneLayout.prototype.dummyVertexWidth = 50;
bpmSwimlaneLayout.prototype.resizeParent = false;
bpmSwimlaneLayout.prototype.maintainParentLocation = false;
bpmSwimlaneLayout.prototype.moveParent = false;
bpmSwimlaneLayout.prototype.parentBorder = 30;
bpmSwimlaneLayout.prototype.intraCellSpacing = 30;
bpmSwimlaneLayout.prototype.interRankCellSpacing = 100;
bpmSwimlaneLayout.prototype.interHierarchySpacing = 60;
bpmSwimlaneLayout.prototype.parallelEdgeSpacing = 10;
bpmSwimlaneLayout.prototype.orientation = bpmConstants.DIRECTION_NORTH;
bpmSwimlaneLayout.prototype.fineTuning = true;
bpmSwimlaneLayout.prototype.tightenToSource = true;
bpmSwimlaneLayout.prototype.disableEdgeStyle = true;
bpmSwimlaneLayout.prototype.traverseAncestors = true;
bpmSwimlaneLayout.prototype.model = null;
bpmSwimlaneLayout.prototype.edgesCache = null;
bpmHierarchicalLayout.prototype.edgeSourceTermCache = null;
bpmHierarchicalLayout.prototype.edgesTargetTermCache = null;
bpmHierarchicalLayout.prototype.edgeStyle = bpmHierarchicalEdgeStyle.POLYLINE;

bpmSwimlaneLayout.prototype.getModel = function()
{
	return this.model;
};

bpmSwimlaneLayout.prototype.execute = function(parent, swimlanes)
{
	this.parent = parent;
	var model = this.graph.model;
	this.edgesCache = new bpmDictionary();
	this.edgeSourceTermCache = new bpmDictionary();
	this.edgesTargetTermCache = new bpmDictionary();

	if (swimlanes == null || swimlanes.length < 1)
	{
		// TODO indicate the problem
		return;
	}

	if (parent == null)
	{
		parent = model.getParent(swimlanes[0]);
	}

	//  Maintaining parent location
	this.parentX = null;
	this.parentY = null;
	
	if (parent != this.root && model.isVertex(parent) != null && this.maintainParentLocation)
	{
		var geo = this.graph.getCellGeometry(parent);
		
		if (geo != null)
		{
			this.parentX = geo.x;
			this.parentY = geo.y;
		}
	}

	this.swimlanes = swimlanes;
	this.dummyVertices = [];
	// Check the swimlanes all have vertices
	// in them
	for (var i = 0; i < swimlanes.length; i++)
	{
		var children = this.graph.getChildCells(swimlanes[i]);
		
		if (children == null || children.length == 0)
		{
			var vertex = this.graph.insertVertex(swimlanes[i], null, null, 0, 0, this.dummyVertexWidth, 0);
			this.dummyVertices.push(vertex);
		}
	}
	
	model.beginUpdate();
	try
	{
		this.run(parent);
		
		if (this.resizeParent && !this.graph.isCellCollapsed(parent))
		{
			this.graph.updateGroupBounds([parent], this.parentBorder, this.moveParent);
		}
		
		// Maintaining parent location
		if (this.parentX != null && this.parentY != null)
		{
			var geo = this.graph.getCellGeometry(parent);
			
			if (geo != null)
			{
				geo = geo.clone();
				geo.x = this.parentX;
				geo.y = this.parentY;
				model.setGeometry(parent, geo);
			}
		}

		this.graph.removeCells(this.dummyVertices);
	}
	finally
	{
		model.endUpdate();
	}
};

bpmSwimlaneLayout.prototype.updateGroupBounds = function()
{
	var cells = [];
	var model = this.model;
	
	for (var key in model.edgeMapper)
	{
		var edge = model.edgeMapper[key];
		
		for (var i = 0; i < edge.edges.length; i++)
		{
			cells.push(edge.edges[i]);
		}
	}
	
	var layoutBounds = this.graph.getBoundingBoxFromGeometry(cells, true);
	var childBounds = [];

	for (var i = 0; i < this.swimlanes.length; i++)
	{
		var lane = this.swimlanes[i];
		var geo = this.graph.getCellGeometry(lane);
		
		if (geo != null)
		{
			var children = this.graph.getChildCells(lane);
			
			var size = (this.graph.isSwimlane(lane)) ?
					this.graph.getStartSize(lane) : new bpmRectangle();

			var bounds = this.graph.getBoundingBoxFromGeometry(children);
			childBounds[i] = bounds;
			var childrenY = bounds.y + geo.y - size.height - this.parentBorder;
			var maxChildrenY = bounds.y + geo.y + bounds.height;

			if (layoutBounds == null)
			{
				layoutBounds = new bpmRectangle(0, childrenY, 0, maxChildrenY - childrenY);
			}
			else
			{
				layoutBounds.y = Math.min(layoutBounds.y, childrenY);
				var maxY = Math.max(layoutBounds.y + layoutBounds.height, maxChildrenY);
				layoutBounds.height = maxY - layoutBounds.y;
			}
		}
	}

	
	for (var i = 0; i < this.swimlanes.length; i++)
	{
		var lane = this.swimlanes[i];
		var geo = this.graph.getCellGeometry(lane);
		
		if (geo != null)
		{
			var children = this.graph.getChildCells(lane);
			
			var size = (this.graph.isSwimlane(lane)) ?
					this.graph.getStartSize(lane) : new bpmRectangle();

			var newGeo = geo.clone();
			
			var leftGroupBorder = (i == 0) ? this.parentBorder : this.interRankCellSpacing/2;
			newGeo.x += childBounds[i].x - size.width - leftGroupBorder;
			newGeo.y = newGeo.y + layoutBounds.y - geo.y - this.parentBorder;
			
			newGeo.width = childBounds[i].width + size.width + this.interRankCellSpacing/2 + leftGroupBorder;
			newGeo.height = layoutBounds.height + size.height + 2 * this.parentBorder;
			
			this.graph.model.setGeometry(lane, newGeo);
			this.graph.moveCells(children, -childBounds[i].x + size.width + leftGroupBorder, 
					geo.y - layoutBounds.y + this.parentBorder);
		}
	}
};

bpmSwimlaneLayout.prototype.findRoots = function(parent, vertices)
{
	var roots = [];
	
	if (parent != null && vertices != null)
	{
		var model = this.graph.model;
		var best = null;
		var maxDiff = -100000;
		
		for (var i in vertices)
		{
			var cell = vertices[i];

			if (cell != null && model.isVertex(cell) && this.graph.isCellVisible(cell) && model.isAncestor(parent, cell))
			{
				var conns = this.getEdges(cell);
				var fanOut = 0;
				var fanIn = 0;

				for (var k = 0; k < conns.length; k++)
				{
					var src = this.getVisibleTerminal(conns[k], true);

					if (src == cell)
					{
						// Only count connection within this swimlane
						var other = this.getVisibleTerminal(conns[k], false);
						
						if (model.isAncestor(parent, other))
						{
							fanOut++;
						}
					}
					else if (model.isAncestor(parent, src))
					{
						fanIn++;
					}
				}

				if (fanIn == 0 && fanOut > 0)
				{
					roots.push(cell);
				}

				var diff = fanOut - fanIn;

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

bpmSwimlaneLayout.prototype.getEdges = function(cell)
{
	var cachedEdges = this.edgesCache.get(cell);
	
	if (cachedEdges != null)
	{
		return cachedEdges;
	}

	var model = this.graph.model;
	var edges = [];
	var isCollapsed = this.graph.isCellCollapsed(cell);
	var childCount = model.getChildCount(cell);

	for (var i = 0; i < childCount; i++)
	{
		var child = model.getChildAt(cell, i);

		if (this.isPort(child))
		{
			edges = edges.concat(model.getEdges(child, true, true));
		}
		else if (isCollapsed || !this.graph.isCellVisible(child))
		{
			edges = edges.concat(model.getEdges(child, true, true));
		}
	}

	edges = edges.concat(model.getEdges(cell, true, true));
	var result = [];
	
	for (var i = 0; i < edges.length; i++)
	{
		var source = this.getVisibleTerminal(edges[i], true);
		var target = this.getVisibleTerminal(edges[i], false);
		
		if ((source == target) || ((source != target) && ((target == cell && (this.parent == null || this.graph.isValidAncestor(source, this.parent, this.traverseAncestors))) ||
			(source == cell && (this.parent == null ||
					this.graph.isValidAncestor(target, this.parent, this.traverseAncestors))))))
		{
			result.push(edges[i]);
		}
	}

	this.edgesCache.put(cell, result);

	return result;
};

bpmSwimlaneLayout.prototype.getVisibleTerminal = function(edge, source)
{
	var terminalCache = this.edgesTargetTermCache;
	
	if (source)
	{
		terminalCache = this.edgeSourceTermCache;
	}

	var term = terminalCache.get(edge);

	if (term != null)
	{
		return term;
	}

	var state = this.graph.view.getState(edge);
	
	var terminal = (state != null) ? state.getVisibleTerminal(source) : this.graph.view.getVisibleTerminal(edge, source);
	
	if (terminal == null)
	{
		terminal = (state != null) ? state.getVisibleTerminal(source) : this.graph.view.getVisibleTerminal(edge, source);
	}

	if (terminal != null)
	{
		if (this.isPort(terminal))
		{
			terminal = this.graph.model.getParent(terminal);
		}
		
		terminalCache.put(edge, terminal);
	}

	return terminal;
};

bpmSwimlaneLayout.prototype.run = function(parent)
{
	// Separate out unconnected hierarchies
	var hierarchyVertices = [];
	var allVertexSet = [];

	if (this.swimlanes != null && this.swimlanes.length > 0 && parent != null)
	{
		var filledVertexSet = Object();
		
		for (var i = 0; i < this.swimlanes.length; i++)
		{
			this.filterDescendants(this.swimlanes[i], filledVertexSet);
		}

		this.roots = [];
		var filledVertexSetEmpty = true;

		for (var key in filledVertexSet)
		{
			if (filledVertexSet[key] != null)
			{
				filledVertexSetEmpty = false;
				break;
			}
		}

		var laneCounter = 0;

		while (!filledVertexSetEmpty && laneCounter < this.swimlanes.length)
		{
			var candidateRoots = this.findRoots(this.swimlanes[laneCounter], filledVertexSet);
			
			if (candidateRoots.length == 0)
			{
				laneCounter++;
				continue;
			}
			
			for (var i = 0; i < candidateRoots.length; i++)
			{
				var vertexSet = Object();
				hierarchyVertices.push(vertexSet);

				this.traverse(candidateRoots[i], true, null, allVertexSet, vertexSet,
						hierarchyVertices, filledVertexSet, laneCounter);
			}

			for (var i = 0; i < candidateRoots.length; i++)
			{
				this.roots.push(candidateRoots[i]);
			}
			
			filledVertexSetEmpty = true;
			
			for (var key in filledVertexSet)
			{
				if (filledVertexSet[key] != null)
				{
					filledVertexSetEmpty = false;
					break;
				}
			}
		}
	}
	else
	{

		for (var i = 0; i < this.roots.length; i++)
		{
			var vertexSet = Object();
			hierarchyVertices.push(vertexSet);

			this.traverse(this.roots[i], true, null, allVertexSet, vertexSet,
					hierarchyVertices, null);
		}
	}

	var tmp = [];
	
	for (var key in allVertexSet)
	{
		tmp.push(allVertexSet[key]);
	}
	
	this.model = new bpmSwimlaneModel(this, tmp, this.roots,
		parent, this.tightenToSource);

	this.cycleStage(parent);
	this.layeringStage();
	
	this.crossingStage(parent);
	initialX = this.placementStage(0, parent);
};

bpmSwimlaneLayout.prototype.filterDescendants = function(cell, result)
{
	var model = this.graph.model;

	if (model.isVertex(cell) && cell != this.parent && model.getParent(cell) != this.parent && this.graph.isCellVisible(cell))
	{
		result[bpmObjectIdentity.get(cell)] = cell;
	}

	if (this.traverseAncestors || cell == this.parent
			&& this.graph.isCellVisible(cell))
	{
		var childCount = model.getChildCount(cell);

		for (var i = 0; i < childCount; i++)
		{
			var child = model.getChildAt(cell, i);
			
			if (!this.isPort(child))
			{
				this.filterDescendants(child, result);
			}
		}
	}
};

bpmSwimlaneLayout.prototype.isPort = function(cell)
{
	if (cell.geometry.relative)
	{
		return true;
	}
	
	return false;
};

bpmSwimlaneLayout.prototype.getEdgesBetween = function(source, target, directed)
{
	directed = (directed != null) ? directed : false;
	var edges = this.getEdges(source);
	var result = [];

	for (var i = 0; i < edges.length; i++)
	{
		var src = this.getVisibleTerminal(edges[i], true);
		var trg = this.getVisibleTerminal(edges[i], false);

		if ((src == source && trg == target) || (!directed && src == target && trg == source))
		{
			result.push(edges[i]);
		}
	}

	return result;
};

bpmSwimlaneLayout.prototype.traverse = function(vertex, directed, edge, allVertices, currentComp,
											hierarchyVertices, filledVertexSet, swimlaneIndex)
{
	if (vertex != null && allVertices != null)
	{
		var vertexID = bpmObjectIdentity.get(vertex);
		
		if ((allVertices[vertexID] == null)
				&& (filledVertexSet == null ? true : filledVertexSet[vertexID] != null))
		{
			if (currentComp[vertexID] == null)
			{
				currentComp[vertexID] = vertex;
			}
			if (allVertices[vertexID] == null)
			{
				allVertices[vertexID] = vertex;
			}

			if (filledVertexSet !== null)
			{
				delete filledVertexSet[vertexID];
			}

			var edges = this.getEdges(vertex);
			var model = this.graph.model;

			for (var i = 0; i < edges.length; i++)
			{
				var otherVertex = this.getVisibleTerminal(edges[i], true);
				var isSource = otherVertex == vertex;
				
				if (isSource)
				{
					otherVertex = this.getVisibleTerminal(edges[i], false);
				}

				var otherIndex = 0;
				for (otherIndex = 0; otherIndex < this.swimlanes.length; otherIndex++)
				{
					if (model.isAncestor(this.swimlanes[otherIndex], otherVertex))
					{
						break;
					}
				}
				
				if (otherIndex >= this.swimlanes.length)
				{
					continue;
				}

				if ((otherIndex > swimlaneIndex) ||
						((!directed || isSource) && otherIndex == swimlaneIndex))
				{
					currentComp = this.traverse(otherVertex, directed, edges[i], allVertices,
							currentComp, hierarchyVertices,
							filledVertexSet, otherIndex);
				}
			}
		}
		else
		{
			if (currentComp[vertexID] == null)
			{
				for (var i = 0; i < hierarchyVertices.length; i++)
				{
					var comp = hierarchyVertices[i];

					if (comp[vertexID] != null)
					{
						for (var key in comp)
						{
							currentComp[key] = comp[key];
						}
						
						hierarchyVertices.splice(i, 1);
						return currentComp;
					}
				}
			}
		}
	}
	
	return currentComp;
};

bpmSwimlaneLayout.prototype.cycleStage = function(parent)
{
	var cycleStage = new bpmSwimlaneOrdering(this);
	cycleStage.execute(parent);
};

bpmSwimlaneLayout.prototype.layeringStage = function()
{
	this.model.initialRank();
	this.model.fixRanks();
};

bpmSwimlaneLayout.prototype.crossingStage = function(parent)
{
	var crossingStage = new bpmMedianHybridCrossingReduction(this);
	crossingStage.execute(parent);
};

bpmSwimlaneLayout.prototype.placementStage = function(initialX, parent)
{
	var placementStage = new bpmCoordinateAssignment(this, this.intraCellSpacing,
			this.interRankCellSpacing, this.orientation, initialX,
			this.parallelEdgeSpacing);
	placementStage.fineTuning = this.fineTuning;
	placementStage.execute(parent);
	
	return placementStage.limitX + this.interHierarchySpacing;
};




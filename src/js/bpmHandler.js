
/* Draw Handler */

function bpmGraphHandler(graph)
{
	this.graph = graph;
	this.graph.addMouseListener(this);
	
	this.panHandler = bpmUtils.bind(this, function()
	{
		this.updatePreviewShape();
		this.updateHint();
	});
	
	this.graph.addListener(bpmEvent.PAN, this.panHandler);
	
	this.escapeHandler = bpmUtils.bind(this, function(sender, evt)
	{
		this.reset();
	});
	
	this.graph.addListener(bpmEvent.ESCAPE, this.escapeHandler);
	
	this.refreshHandler = bpmUtils.bind(this, function(sender, evt)
	{
		if (this.first != null)
		{
			try
			{
				this.bounds = this.graph.getView().getBounds(this.cells);
				this.pBounds = this.getPreviewBounds(this.cells);
				this.updatePreviewShape();
			}
			catch (e)
			{
				this.reset();
			}
		}
	});
	
	this.graph.getModel().addListener(bpmEvent.CHANGE, this.refreshHandler);
};

bpmGraphHandler.prototype.graph = null;
bpmGraphHandler.prototype.maxCells = (bpmCore.IS_IE) ? 20 : 50;
bpmGraphHandler.prototype.enabled = true;
bpmGraphHandler.prototype.highlightEnabled = true;
bpmGraphHandler.prototype.cloneEnabled = true;
bpmGraphHandler.prototype.moveEnabled = true;
bpmGraphHandler.prototype.guidesEnabled = false;
bpmGraphHandler.prototype.guide = null;
bpmGraphHandler.prototype.currentDx = null;
bpmGraphHandler.prototype.currentDy = null;
bpmGraphHandler.prototype.updateCursor = true;
bpmGraphHandler.prototype.selectEnabled = true;
CellsFromParent = true;
bpmGraphHandler.prototype.removeEmptyParents = false;
bpmGraphHandler.prototype.connectOnDrop = false;
bpmGraphHandler.prototype.scrollOnMove = true;
bpmGraphHandler.prototype.minimumSize = 6;
bpmGraphHandler.prototype.previewColor = 'black';
bpmGraphHandler.prototype.htmlPreview = false;
bpmGraphHandler.prototype.shape = null;
bpmGraphHandler.prototype.scaleGrid = false;
bpmGraphHandler.prototype.rotationEnabled = true;

bpmGraphHandler.prototype.isEnabled = function()
{
	return this.enabled;
};

bpmGraphHandler.prototype.setEnabled = function(value)
{
	this.enabled = value;
};

bpmGraphHandler.prototype.isCloneEnabled = function()
{
	return this.cloneEnabled;
};

bpmGraphHandler.prototype.setCloneEnabled = function(value)
{
	this.cloneEnabled = value;
};

bpmGraphHandler.prototype.isMoveEnabled = function()
{
	return this.moveEnabled;
};

bpmGraphHandler.prototype.setMoveEnabled = function(value)
{
	this.moveEnabled = value;
};

bpmGraphHandler.prototype.isSelectEnabled = function()
{
	return this.selectEnabled;
};

bpmGraphHandler.prototype.setSelectEnabled = function(value)
{
	this.selectEnabled = value;
};

bpmGraphHandler.prototype.isRemoveCellsFromParent = function()
{
	return this.removeCellsFromParent;
};

bpmGraphHandler.prototype.setRemoveCellsFromParent = function(value)
{
	this.removeCellsFromParent = value;
};

bpmGraphHandler.prototype.getInitialCellForEvent = function(me)
{
	return me.getCell();
};

bpmGraphHandler.prototype.isDelayedSelection = function(cell, me)
{
	return this.graph.isCellSelected(cell);
};

bpmGraphHandler.prototype.consumeMouseEvent = function(evtName, me)
{
	me.consume();
};

bpmGraphHandler.prototype.mouseDown = function(sender, me)
{
	if (!me.isConsumed() && this.isEnabled() && this.graph.isEnabled() &&
		me.getState() != null && !bpmEvent.isMultiTouchEvent(me.getEvent()))
	{
		var cell = this.getInitialCellForEvent(me);
		this.delayedSelection = this.isDelayedSelection(cell, me);
		this.cell = null;
		
		if (this.isSelectEnabled() && !this.delayedSelection)
		{
			this.graph.selectCellForEvent(cell, me.getEvent());
		}

		if (this.isMoveEnabled())
		{
			var model = this.graph.model;
			var geo = model.getGeometry(cell);

			if (this.graph.isCellMovable(cell) && ((!model.isEdge(cell) || this.graph.getSelectionCount() > 1 ||
				(geo.points != null && geo.points.length > 0) || model.getTerminal(cell, true) == null ||
				model.getTerminal(cell, false) == null) || this.graph.allowDanglingEdges || 
				(this.graph.isCloneEvent(me.getEvent()) && this.graph.isCellsCloneable())))
			{
				this.start(cell, me.getX(), me.getY());
			}
			else if (this.delayedSelection)
			{
				this.cell = cell;
			}

			this.cellWasClicked = true;
			this.consumeMouseEvent(bpmEvent.MOUSE_DOWN, me);
		}
	}
};

bpmGraphHandler.prototype.getGuideStates = function()
{
	var parent = this.graph.getDefaultParent();
	var model = this.graph.getModel();
	
	var filter = bpmUtils.bind(this, function(cell)
	{
		return this.graph.view.getState(cell) != null &&
			model.isVertex(cell) &&
			model.getGeometry(cell) != null &&
			!model.getGeometry(cell).relative;
	});
	
	return this.graph.view.getCellStates(model.filterDescendants(filter, parent));
};

bpmGraphHandler.prototype.getCells = function(initialCell)
{
	if (!this.delayedSelection && this.graph.isCellMovable(initialCell))
	{
		return [initialCell];
	}
	else
	{
		return this.graph.getMovableCells(this.graph.getSelectionCells());
	}
};

bpmGraphHandler.prototype.getPreviewBounds = function(cells)
{
	var bounds = this.getBoundingBox(cells);
	
	if (bounds != null)
	{
		bounds.width = Math.max(0, bounds.width - 1);
		bounds.height = Math.max(0, bounds.height - 1);
		
		if (bounds.width < this.minimumSize)
		{
			var dx = this.minimumSize - bounds.width;
			bounds.x -= dx / 2;
			bounds.width = this.minimumSize;
		}
		else
		{
			bounds.x = Math.round(bounds.x);
			bounds.width = Math.ceil(bounds.width);
		}
		
		var tr = this.graph.view.translate;
		var s = this.graph.view.scale;
		
		if (bounds.height < this.minimumSize)
		{
			var dy = this.minimumSize - bounds.height;
			bounds.y -= dy / 2;
			bounds.height = this.minimumSize;
		}
		else
		{
			bounds.y = Math.round(bounds.y);
			bounds.height = Math.ceil(bounds.height);
		}
	}
	
	return bounds;
};

bpmGraphHandler.prototype.getBoundingBox = function(cells)
{
	var result = null;
	
	if (cells != null && cells.length > 0)
	{
		var model = this.graph.getModel();
		
		for (var i = 0; i < cells.length; i++)
		{
			if (model.isVertex(cells[i]) || model.isEdge(cells[i]))
			{
				var state = this.graph.view.getState(cells[i]);
			
				if (state != null)
				{
					var bbox = state;
					
					if (model.isVertex(cells[i]) && state.shape != null && state.shape.boundingBox != null)
					{
						bbox = state.shape.boundingBox;
					}
					
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

bpmGraphHandler.prototype.createPreviewShape = function(bounds)
{
	var shape = new bpmRectangleShape(bounds, null, this.previewColor);
	shape.isDashed = true;
	
	if (this.htmlPreview)
	{
		shape.dialect = bpmConstants.DIALECT_STRICTHTML;
		shape.init(this.graph.container);
	}
	else
	{
		shape.dialect = (this.graph.dialect != bpmConstants.DIALECT_SVG) ?
			bpmConstants.DIALECT_VML : bpmConstants.DIALECT_SVG;
		shape.init(this.graph.getView().getOverlayPane());
		shape.pointerEvents = false;
		
		if (bpmCore.IS_IOS)
		{
			shape.getSvgScreenOffset = function()
			{
				return 0;
			};
		}
	}
	
	return shape;
};

bpmGraphHandler.prototype.start = function(cell, x, y)
{
	this.cell = cell;
	this.first = bpmUtils.convertPoint(this.graph.container, x, y);
	this.cells = this.getCells(this.cell);
	this.bounds = this.graph.getView().getBounds(this.cells);
	this.pBounds = this.getPreviewBounds(this.cells);

	if (this.guidesEnabled)
	{
		this.guide = new bpmGuide(this.graph, this.getGuideStates());
	}
};

bpmGraphHandler.prototype.useGuidesForEvent = function(me)
{
	return (this.guide != null) ? this.guide.isEnabledForEvent(me.getEvent()) : true;
};

bpmGraphHandler.prototype.snap = function(vector)
{
	var scale = (this.scaleGrid) ? this.graph.view.scale : 1;
	
	vector.x = this.graph.snap(vector.x / scale) * scale;
	vector.y = this.graph.snap(vector.y / scale) * scale;
	
	return vector;
};

bpmGraphHandler.prototype.getDelta = function(me)
{
	var point = bpmUtils.convertPoint(this.graph.container, me.getX(), me.getY());
	var s = this.graph.view.scale;
	
	return new bpmPoint(this.roundLength((point.x - this.first.x) / s) * s,
		this.roundLength((point.y - this.first.y) / s) * s);
};

bpmGraphHandler.prototype.updateHint = function(me) { };

bpmGraphHandler.prototype.removeHint = function() { };

bpmGraphHandler.prototype.roundLength = function(length)
{
	return Math.round(length * 2) / 2;
};

bpmGraphHandler.prototype.mouseMove = function(sender, me)
{
	var graph = this.graph;

	if (!me.isConsumed() && graph.isMouseDown && this.cell != null &&
		this.first != null && this.bounds != null)
	{
		if (bpmEvent.isMultiTouchEvent(me.getEvent()))
		{
			this.reset();
			return;
		}
		
		var delta = this.getDelta(me);
		var dx = delta.x;
		var dy = delta.y;
		var tol = graph.tolerance;

		if (this.shape != null || Math.abs(dx) > tol || Math.abs(dy) > tol)
		{
			if (this.highlight == null)
			{
				this.highlight = new bpmCellHighlight(this.graph,
					bpmConstants.DROP_TARGET_COLOR, 3);
			}
			
			if (this.shape == null)
			{
				this.shape = this.createPreviewShape(this.bounds);
			}
			
			var clone = graph.isCloneEvent(me.getEvent()) && graph.isCellsCloneable() && this.isCloneEnabled();
			var gridEnabled = graph.isGridEnabledEvent(me.getEvent());
			var hideGuide = true;
			
			if (this.guide != null && this.useGuidesForEvent(me))
			{
				delta = this.guide.move(this.bounds, new bpmPoint(dx, dy), gridEnabled, clone);
				hideGuide = false;
				dx = delta.x;
				dy = delta.y;
			}
			else if (gridEnabled)
			{
				var trx = graph.getView().translate;
				var scale = graph.getView().scale;				
				
				var tx = this.bounds.x - (graph.snap(this.bounds.x / scale - trx.x) + trx.x) * scale;
				var ty = this.bounds.y - (graph.snap(this.bounds.y / scale - trx.y) + trx.y) * scale;
				var v = this.snap(new bpmPoint(dx, dy));
			
				dx = v.x - tx;
				dy = v.y - ty;
			}
			
			if (this.guide != null && hideGuide)
			{
				this.guide.hide();
			}

			if (graph.isConstrainedEvent(me.getEvent()))
			{
				if (Math.abs(dx) > Math.abs(dy))
				{
					dy = 0;
				}
				else
				{
					dx = 0;
				}
			}

			this.currentDx = dx;
			this.currentDy = dy;
			this.updatePreviewShape();

			var target = null;
			var cell = me.getCell();

			if (graph.isDropEnabled() && this.highlightEnabled)
			{
				target = graph.getDropTarget(this.cells, me.getEvent(), cell, clone);
			}

			var state = graph.getView().getState(target);
			var highlight = false;
			
			if (state != null && (graph.model.getParent(this.cell) != target || clone))
			{
			    if (this.target != target)
			    {
				    this.target = target;
				    this.setHighlightColor(bpmConstants.DROP_TARGET_COLOR);
				}
			    
			    highlight = true;
			}
			else
			{
				this.target = null;

				if (this.connectOnDrop && cell != null && this.cells.length == 1 &&
					graph.getModel().isVertex(cell) && graph.isCellConnectable(cell))
				{
					state = graph.getView().getState(cell);
					
					if (state != null)
					{
						var error = graph.getEdgeValidationError(null, this.cell, cell);
						var color = (error == null) ?
							bpmConstants.VALID_COLOR :
							bpmConstants.INVALID_CONNECT_TARGET_COLOR;
						this.setHighlightColor(color);
						highlight = true;
					}
				}
			}
			
			if (state != null && highlight)
			{
				this.highlight.highlight(state);
			}
			else
			{
				this.highlight.hide();
			}
		}

		this.updateHint(me);
		this.consumeMouseEvent(bpmEvent.MOUSE_MOVE, me);
		bpmEvent.consume(me.getEvent());
	}
	else if ((this.isMoveEnabled() || this.isCloneEnabled()) && this.updateCursor && !me.isConsumed() &&
		(me.getState() != null || me.sourceState != null) && !graph.isMouseDown)
	{
		var cursor = graph.getCursorForMouseEvent(me);
		
		if (cursor == null && graph.isEnabled() && graph.isCellMovable(me.getCell()))
		{
			if (graph.getModel().isEdge(me.getCell()))
			{
				cursor = bpmConstants.CURSOR_MOVABLE_EDGE;
			}
			else
			{
				cursor = bpmConstants.CURSOR_MOVABLE_VERTEX;
			}
		}

		if (cursor != null && me.sourceState != null)
		{
			me.sourceState.setCursor(cursor);
		}
	}
};

bpmGraphHandler.prototype.updatePreviewShape = function()
{
	if (this.shape != null)
	{
		this.shape.bounds = new bpmRectangle(Math.round(this.pBounds.x + this.currentDx - this.graph.panDx),
				Math.round(this.pBounds.y + this.currentDy - this.graph.panDy), this.pBounds.width, this.pBounds.height);
		this.shape.redraw();
	}
};

bpmGraphHandler.prototype.setHighlightColor = function(color)
{
	if (this.highlight != null)
	{
		this.highlight.setHighlightColor(color);
	}
};

bpmGraphHandler.prototype.mouseUp = function(sender, me)
{
	if (!me.isConsumed())
	{
		var graph = this.graph;
		
		if (this.cell != null && this.first != null && this.shape != null &&
			this.currentDx != null && this.currentDy != null)
		{
			var cell = me.getCell();
			
			if (this.connectOnDrop && this.target == null && cell != null && graph.getModel().isVertex(cell) &&
				graph.isCellConnectable(cell) && graph.isEdgeValid(null, this.cell, cell))
			{
				graph.connectionHandler.connect(this.cell, cell, me.getEvent());
			}
			else
			{
				var clone = graph.isCloneEvent(me.getEvent()) && graph.isCellsCloneable() && this.isCloneEnabled();
				var scale = graph.getView().scale;
				var dx = this.roundLength(this.currentDx / scale);
				var dy = this.roundLength(this.currentDy / scale);
				var target = this.target;
				
				if (graph.isSplitEnabled() && graph.isSplitTarget(target, this.cells, me.getEvent()))
				{
					graph.splitEdge(target, this.cells, null, dx, dy);
				}
				else
				{
					this.moveCells(this.cells, dx, dy, clone, this.target, me.getEvent());
				}
			}
		}
		else if (this.isSelectEnabled() && this.delayedSelection && this.cell != null)
		{
			this.selectDelayed(me);
		}
	}

	if (this.cellWasClicked)
	{
		this.consumeMouseEvent(bpmEvent.MOUSE_UP, me);
	}

	this.reset();
};

bpmGraphHandler.prototype.selectDelayed = function(me)
{
	if (!this.graph.isCellSelected(this.cell) || !this.graph.popupMenuHandler.isPopupTrigger(me))
	{
		this.graph.selectCellForEvent(this.cell, me.getEvent());
	}
};

bpmGraphHandler.prototype.reset = function()
{
	this.destroyShapes();
	this.removeHint();
	
	this.cellWasClicked = false;
	this.delayedSelection = false;
	this.currentDx = null;
	this.currentDy = null;
	this.guides = null;
	this.first = null;
	this.cell = null;
	this.target = null;
};

bpmGraphHandler.prototype.shouldRemoveCellsFromParent = function(parent, cells, evt)
{
	if (this.graph.getModel().isVertex(parent))
	{
		var pState = this.graph.getView().getState(parent);
		
		if (pState != null)
		{
			var pt = bpmUtils.convertPoint(this.graph.container,
				bpmEvent.getClientX(evt), bpmEvent.getClientY(evt));
			var alpha = bpmUtils.toRadians(bpmUtils.getValue(pState.style, bpmConstants.STYLE_ROTATION) || 0);
			
			if (alpha != 0)
			{
				var cos = Math.cos(-alpha);
				var sin = Math.sin(-alpha);
				var cx = new bpmPoint(pState.getCenterX(), pState.getCenterY());
				pt = bpmUtils.getRotatedPoint(pt, cos, sin, cx);
			}
		
			return !bpmUtils.contains(pState, pt.x, pt.y);
		}
	}
	
	return false;
};

bpmGraphHandler.prototype.moveCells = function(cells, dx, dy, clone, target, evt)
{
	if (clone)
	{
		cells = this.graph.getCloneableCells(cells);
	}
	
	var parent = this.graph.getModel().getParent(this.cell);
	
	if (target == null && this.isRemoveCellsFromParent() &&
		this.shouldRemoveCellsFromParent(parent, cells, evt))
	{
		target = this.graph.getDefaultParent();
	}
	
	clone = clone && !this.graph.isCellLocked(target || this.graph.getDefaultParent());

	this.graph.getModel().beginUpdate();
	try
	{
		var parents = [];
		
		if (!clone && target != null && this.removeEmptyParents)
		{
			var dict = new bpmDictionary();
			
			for (var i = 0; i < cells.length; i++)
			{
				dict.put(cells[i], true);
			}
			
			for (var i = 0; i < cells.length; i++)
			{
				var par = this.graph.model.getParent(cells[i]);

				if (par != null && !dict.get(par))
				{
					dict.put(par, true);
					parents.push(par);
				}
			}
		}
		
		cells = this.graph.moveCells(cells, dx - this.graph.panDx / this.graph.view.scale,
				dy - this.graph.panDy / this.graph.view.scale, clone, target, evt);

		var temp = [];
		
		for (var i = 0; i < parents.length; i++)
		{
			if (this.shouldRemoveParent(parents[i]))
			{
				temp.push(parents[i]);
			}
		}
		
		this.graph.removeCells(temp, false);
	}
	finally
	{
		this.graph.getModel().endUpdate();
	}

	if (clone)
	{
		this.graph.setSelectionCells(cells);
	}

	if (this.isSelectEnabled() && this.scrollOnMove)
	{
		this.graph.scrollCellToVisible(cells[0]);
	}
};

bpmGraphHandler.prototype.shouldRemoveParent = function(parent)
{
	var state = this.graph.view.getState(parent);
	
	if (state != null && (this.graph.model.isEdge(state.cell) || this.graph.model.isVertex(state.cell)) &&
		this.graph.isCellDeletable(state.cell) && this.graph.model.getChildCount(state.cell) == 0)
	{
		var stroke = bpmUtils.getValue(state.style, bpmConstants.STYLE_STROKECOLOR, bpmConstants.NONE);
		var fill = bpmUtils.getValue(state.style, bpmConstants.STYLE_FILLCOLOR, bpmConstants.NONE);
		
		return stroke == bpmConstants.NONE && fill == bpmConstants.NONE;
	}
	
	return false;
};

bpmGraphHandler.prototype.destroyShapes = function()
{
	if (this.shape != null)
	{
		this.shape.destroy();
		this.shape = null;
	}
	
	if (this.guide != null)
	{
		this.guide.destroy();
		this.guide = null;
	}
	
	if (this.highlight != null)
	{
		this.highlight.destroy();
		this.highlight = null;
	}
};

bpmGraphHandler.prototype.destroy = function()
{
	this.graph.removeMouseListener(this);
	this.graph.removeListener(this.panHandler);
	
	if (this.escapeHandler != null)
	{
		this.graph.removeListener(this.escapeHandler);
		this.escapeHandler = null;
	}
	
	if (this.refreshHandler != null)
	{
		this.graph.getModel().removeListener(this.refreshHandler);
		this.refreshHandler = null;
	}
	
	this.destroyShapes();
	this.removeHint();
};


/* Panning Handler */
function bpmPanningHandler(graph)
{
	if (graph != null)
	{
		this.graph = graph;
		this.graph.addMouseListener(this);

		this.forcePanningHandler = bpmUtils.bind(this, function(sender, evt)
		{
			var evtName = evt.getProperty('eventName');
			var me = evt.getProperty('event');
			
			if (evtName == bpmEvent.MOUSE_DOWN && this.isForcePanningEvent(me))
			{
				this.start(me);
				this.active = true;
				this.fireEvent(new bpmEventObject(bpmEvent.PAN_START, 'event', me));
				me.consume();
			}
		});

		this.graph.addListener(bpmEvent.FIRE_MOUSE_EVENT, this.forcePanningHandler);
		
		this.gestureHandler = bpmUtils.bind(this, function(sender, eo)
		{
			if (this.isPinchEnabled())
			{
				var evt = eo.getProperty('event');
				
				if (!bpmEvent.isConsumed(evt) && evt.type == 'gesturestart')
				{
					this.initialScale = this.graph.view.scale;
				
					if (!this.active && this.mouseDownEvent != null)
					{
						this.start(this.mouseDownEvent);
						this.mouseDownEvent = null;
					}
				}
				else if (evt.type == 'gestureend' && this.initialScale != null)
				{
					this.initialScale = null;
				}
				
				if (this.initialScale != null)
				{
					var value = Math.round(this.initialScale * evt.scale * 100) / 100;
					
					if (this.minScale != null)
					{
						value = Math.max(this.minScale, value);
					}
					
					if (this.maxScale != null)
					{
						value = Math.min(this.maxScale, value);
					}
	
					if (this.graph.view.scale != value)
					{
						this.graph.zoomTo(value);
						bpmEvent.consume(evt);
					}
				}
			}
		});
		
		this.graph.addListener(bpmEvent.GESTURE, this.gestureHandler);
		
		this.mouseUpListener = bpmUtils.bind(this, function()
		{
		    	if (this.active)
		    	{
		    		this.reset();
		    	}
		});
		
		bpmEvent.addListener(document, 'mouseup', this.mouseUpListener);
	}
};

bpmPanningHandler.prototype = new bpmEventSource();
bpmPanningHandler.prototype.constructor = bpmPanningHandler;
bpmPanningHandler.prototype.graph = null;
bpmPanningHandler.prototype.useLeftButtonForPanning = false;
bpmPanningHandler.prototype.usePopupTrigger = true;
bpmPanningHandler.prototype.ignoreCell = false;
bpmPanningHandler.prototype.previewEnabled = true;
bpmPanningHandler.prototype.useGrid = false;
bpmPanningHandler.prototype.panningEnabled = true;
bpmPanningHandler.prototype.pinchEnabled = true;
bpmPanningHandler.prototype.maxScale = 8;
bpmPanningHandler.prototype.minScale = 0.01;
bpmPanningHandler.prototype.dx = null;
bpmPanningHandler.prototype.dy = null;
bpmPanningHandler.prototype.startX = 0;
bpmPanningHandler.prototype.startY = 0;

bpmPanningHandler.prototype.isActive = function()
{
	return this.active || this.initialScale != null;
};

bpmPanningHandler.prototype.isPanningEnabled = function()
{
	return this.panningEnabled;
};

bpmPanningHandler.prototype.setPanningEnabled = function(value)
{
	this.panningEnabled = value;
};

bpmPanningHandler.prototype.isPinchEnabled = function()
{
	return this.pinchEnabled;
};

bpmPanningHandler.prototype.setPinchEnabled = function(value)
{
	this.pinchEnabled = value;
};

bpmPanningHandler.prototype.isPanningTrigger = function(me)
{
	var evt = me.getEvent();
	
	return (this.useLeftButtonForPanning && me.getState() == null &&
			bpmEvent.isLeftMouseButton(evt)) || (bpmEvent.isControlDown(evt) &&
			bpmEvent.isShiftDown(evt)) || (this.usePopupTrigger && bpmEvent.isPopupTrigger(evt));
};

bpmPanningHandler.prototype.isForcePanningEvent = function(me)
{
	return this.ignoreCell || bpmEvent.isMultiTouchEvent(me.getEvent());
};

bpmPanningHandler.prototype.mouseDown = function(sender, me)
{
	this.mouseDownEvent = me;
	
	if (!me.isConsumed() && this.isPanningEnabled() && !this.active && this.isPanningTrigger(me))
	{
		this.start(me);
		this.consumePanningTrigger(me);
	}
};

bpmPanningHandler.prototype.start = function(me)
{
	this.dx0 = -this.graph.container.scrollLeft;
	this.dy0 = -this.graph.container.scrollTop;
	this.startX = me.getX();
	this.startY = me.getY();
	this.dx = null;
	this.dy = null;
	
	this.panningTrigger = true;
};

bpmPanningHandler.prototype.consumePanningTrigger = function(me)
{
	me.consume();
};

bpmPanningHandler.prototype.mouseMove = function(sender, me)
{
	this.dx = me.getX() - this.startX;
	this.dy = me.getY() - this.startY;
	if (this.active)
	{
		if (this.previewEnabled)
		{
			if (this.useGrid)
			{
				this.dx = this.graph.snap(this.dx);
				this.dy = this.graph.snap(this.dy);
			}
			
			this.graph.panGraph(this.dx + this.dx0, this.dy + this.dy0);
		}

		this.fireEvent(new bpmEventObject(bpmEvent.PAN, 'event', me));
	}
	else if (this.panningTrigger)
	{
		var tmp = this.active;

		this.active = Math.abs(this.dx) > this.graph.tolerance || Math.abs(this.dy) > this.graph.tolerance;

		if (!tmp && this.active)
		{
			this.fireEvent(new bpmEventObject(bpmEvent.PAN_START, 'event', me));
		}
	}
	
	if (this.active || this.panningTrigger)
	{
		me.consume();
	}
};

bpmPanningHandler.prototype.mouseUp = function(sender, me)
{
	if (this.active)
	{
		if (this.dx != null && this.dy != null)
		{
			if (!this.graph.useScrollbarsForPanning || !bpmUtils.hasScrollbars(this.graph.container))
			{
				var scale = this.graph.getView().scale;
				var t = this.graph.getView().translate;
				this.graph.panGraph(0, 0);
				this.panGraph(t.x + this.dx / scale, t.y + this.dy / scale);
			}
			
			me.consume();
		}
		
		this.fireEvent(new bpmEventObject(bpmEvent.PAN_END, 'event', me));
	}
	
	this.reset();
};

bpmPanningHandler.prototype.reset = function()
{
	this.panningTrigger = false;
	this.mouseDownEvent = null;
	this.active = false;
	this.dx = null;
	this.dy = null;
};

bpmPanningHandler.prototype.panGraph = function(dx, dy)
{
	this.graph.getView().setTranslate(dx, dy);
};

bpmPanningHandler.prototype.destroy = function()
{
	this.graph.removeMouseListener(this);
	this.graph.removeListener(this.forcePanningHandler);
	this.graph.removeListener(this.gestureHandler);
	bpmEvent.removeListener(document, 'mouseup', this.mouseUpListener);
};



/* Popup Menu Handler */
function bpmPopupMenuHandler(graph, factoryMethod)
{
	if (graph != null)
	{
		this.graph = graph;
		this.factoryMethod = factoryMethod;
		this.graph.addMouseListener(this);
		
		this.gestureHandler = bpmUtils.bind(this, function(sender, eo)
		{
			this.inTolerance = false;
		});
		
		this.graph.addListener(bpmEvent.GESTURE, this.gestureHandler);
		
		this.init();
	}
};

bpmPopupMenuHandler.prototype = new bpmPopupMenu();
bpmPopupMenuHandler.prototype.constructor = bpmPopupMenuHandler;
bpmPopupMenuHandler.prototype.graph = null;
bpmPopupMenuHandler.prototype.selectOnPopup = true;
bpmPopupMenuHandler.prototype.clearSelectionOnBackground = true;
bpmPopupMenuHandler.prototype.triggerX = null;
bpmPopupMenuHandler.prototype.triggerY = null;
bpmPopupMenuHandler.prototype.screenX = null;
bpmPopupMenuHandler.prototype.screenY = null;
bpmPopupMenuHandler.prototype.init = function()
{
	bpmPopupMenu.prototype.init.apply(this);

	bpmEvent.addGestureListeners(this.div, bpmUtils.bind(this, function(evt)
	{
		this.graph.tooltipHandler.hide();
	}));
};

bpmPopupMenuHandler.prototype.isSelectOnPopup = function(me)
{
	return this.selectOnPopup;
};

bpmPopupMenuHandler.prototype.mouseDown = function(sender, me)
{
	if (this.isEnabled() && !bpmEvent.isMultiTouchEvent(me.getEvent()))
	{
		this.hideMenu();
		this.triggerX = me.getGraphX();
		this.triggerY = me.getGraphY();
		this.screenX = bpmEvent.getMainEvent(me.getEvent()).screenX;
		this.screenY = bpmEvent.getMainEvent(me.getEvent()).screenY;
		this.popupTrigger = this.isPopupTrigger(me);
		this.inTolerance = true;
	}
};

bpmPopupMenuHandler.prototype.mouseMove = function(sender, me)
{
	if (this.inTolerance && this.screenX != null && this.screenY != null)
	{
		if (Math.abs(bpmEvent.getMainEvent(me.getEvent()).screenX - this.screenX) > this.graph.tolerance ||
			Math.abs(bpmEvent.getMainEvent(me.getEvent()).screenY - this.screenY) > this.graph.tolerance)
		{
			this.inTolerance = false;
		}
	}
};

bpmPopupMenuHandler.prototype.mouseUp = function(sender, me)
{
	if (this.popupTrigger && this.inTolerance && this.triggerX != null && this.triggerY != null)
	{
		var cell = this.getCellForPopupEvent(me);

		if (this.graph.isEnabled() && this.isSelectOnPopup(me) &&
			cell != null && !this.graph.isCellSelected(cell))
		{
			this.graph.setSelectionCell(cell);
		}
		else if (this.clearSelectionOnBackground && cell == null)
		{
			this.graph.clearSelection();
		}
		
		this.graph.tooltipHandler.hide();

		var origin = bpmUtils.getScrollOrigin();
		this.popup(me.getX() + origin.x + 1, me.getY() + origin.y + 1, cell, me.getEvent());
		me.consume();
	}
	
	this.popupTrigger = false;
	this.inTolerance = false;
};

bpmPopupMenuHandler.prototype.getCellForPopupEvent = function(me)
{
	return me.getCell();
};

bpmPopupMenuHandler.prototype.destroy = function()
{
	this.graph.removeMouseListener(this);
	this.graph.removeListener(this.gestureHandler);
	
	bpmPopupMenu.prototype.destroy.apply(this);
};



/* Cell Marker */
function bpmCellMarker(graph, validColor, invalidColor, hotspot)
{
	bpmEventSource.call(this);
	
	if (graph != null)
	{
		this.graph = graph;
		this.validColor = (validColor != null) ? validColor : bpmConstants.DEFAULT_VALID_COLOR;
		this.invalidColor = (invalidColor != null) ? invalidColor : bpmConstants.DEFAULT_INVALID_COLOR;
		this.hotspot = (hotspot != null) ? hotspot : bpmConstants.DEFAULT_HOTSPOT;
		
		this.highlight = new bpmCellHighlight(graph);
	}
};

bpmUtils.extend(bpmCellMarker, bpmEventSource);
bpmCellMarker.prototype.graph = null;
bpmCellMarker.prototype.enabled = true;
bpmCellMarker.prototype.hotspot = bpmConstants.DEFAULT_HOTSPOT;
bpmCellMarker.prototype.hotspotEnabled = false;
bpmCellMarker.prototype.validColor = null;
bpmCellMarker.prototype.invalidColor = null;
bpmCellMarker.prototype.currentColor = null;
bpmCellMarker.prototype.validState = null;
bpmCellMarker.prototype.markedState = null;

bpmCellMarker.prototype.setEnabled = function(enabled)
{
	this.enabled = enabled;
};

bpmCellMarker.prototype.isEnabled = function()
{
	return this.enabled;
};

bpmCellMarker.prototype.setHotspot = function(hotspot)
{
	this.hotspot = hotspot;
};

bpmCellMarker.prototype.getHotspot = function()
{
	return this.hotspot;
};

bpmCellMarker.prototype.setHotspotEnabled = function(enabled)
{
	this.hotspotEnabled = enabled;
};

bpmCellMarker.prototype.isHotspotEnabled = function()
{
	return this.hotspotEnabled;
};

bpmCellMarker.prototype.hasValidState = function()
{
	return this.validState != null;
};

bpmCellMarker.prototype.getValidState = function()
{
	return this.validState;
};

bpmCellMarker.prototype.getMarkedState = function()
{
	return this.markedState;
};

bpmCellMarker.prototype.reset = function()
{
	this.validState = null;
	
	if (this.markedState != null)
	{
		this.markedState = null;
		this.unmark();
	}
};

bpmCellMarker.prototype.process = function(me)
{
	var state = null;
	
	if (this.isEnabled())
	{
		state = this.getState(me);
		this.setCurrentState(state, me);
	}
	
	return state;
};

bpmCellMarker.prototype.setCurrentState = function(state, me, color)
{
	var isValid = (state != null) ? this.isValidState(state) : false;
	color = (color != null) ? color : this.getMarkerColor(me.getEvent(), state, isValid);
	
	if (isValid)
	{
		this.validState = state;
	}
	else
	{
		this.validState = null;
	}
	
	if (state != this.markedState || color != this.currentColor)
	{
		this.currentColor = color;
		
		if (state != null && this.currentColor != null)
		{
			this.markedState = state;
			this.mark();		
		}
		else if (this.markedState != null)
		{
			this.markedState = null;
			this.unmark();
		}
	}
};

bpmCellMarker.prototype.markCell = function(cell, color)
{
	var state = this.graph.getView().getState(cell);
	
	if (state != null)
	{
		this.currentColor = (color != null) ? color : this.validColor;
		this.markedState = state;
		this.mark();
	}
};

bpmCellMarker.prototype.mark = function()
{
	this.highlight.setHighlightColor(this.currentColor);
	this.highlight.highlight(this.markedState);
	this.fireEvent(new bpmEventObject(bpmEvent.MARK, 'state', this.markedState));
};

bpmCellMarker.prototype.unmark = function()
{
	this.mark();
};

bpmCellMarker.prototype.isValidState = function(state)
{
	return true;
};

bpmCellMarker.prototype.getMarkerColor = function(evt, state, isValid)
{
	return (isValid) ? this.validColor : this.invalidColor;
};

bpmCellMarker.prototype.getState = function(me)
{
	var view = this.graph.getView();
	var cell = this.getCell(me);
	var state = this.getStateToMark(view.getState(cell));

	return (state != null && this.intersects(state, me)) ? state : null;
};

bpmCellMarker.prototype.getCell = function(me)
{
	return me.getCell();
};

bpmCellMarker.prototype.getStateToMark = function(state)
{
	return state;
};

bpmCellMarker.prototype.intersects = function(state, me)
{
	if (this.hotspotEnabled)
	{
		return bpmUtils.intersectsHotspot(state, me.getGraphX(), me.getGraphY(),
			this.hotspot, bpmConstants.MIN_HOTSPOT_SIZE,
			bpmConstants.MAX_HOTSPOT_SIZE);
	}
	
	return true;
};

bpmCellMarker.prototype.destroy = function()
{
	this.graph.getView().removeListener(this.resetHandler);
	this.graph.getModel().removeListener(this.resetHandler);
	this.highlight.destroy();
};



/* Selection Cell Handler */
function bpmSelectionCellsHandler(graph)
{
	bpmEventSource.call(this);
	
	this.graph = graph;
	this.handlers = new bpmDictionary();
	this.graph.addMouseListener(this);
	
	this.refreshHandler = bpmUtils.bind(this, function(sender, evt)
	{
		if (this.isEnabled())
		{
			this.refresh();
		}
	});
	
	this.graph.getSelectionModel().addListener(bpmEvent.CHANGE, this.refreshHandler);
	this.graph.getModel().addListener(bpmEvent.CHANGE, this.refreshHandler);
	this.graph.getView().addListener(bpmEvent.SCALE, this.refreshHandler);
	this.graph.getView().addListener(bpmEvent.TRANSLATE, this.refreshHandler);
	this.graph.getView().addListener(bpmEvent.SCALE_AND_TRANSLATE, this.refreshHandler);
	this.graph.getView().addListener(bpmEvent.DOWN, this.refreshHandler);
	this.graph.getView().addListener(bpmEvent.UP, this.refreshHandler);
};

bpmUtils.extend(bpmSelectionCellsHandler, bpmEventSource);
bpmSelectionCellsHandler.prototype.graph = null;
bpmSelectionCellsHandler.prototype.enabled = true;
bpmSelectionCellsHandler.prototype.refreshHandler = null;
bpmSelectionCellsHandler.prototype.maxHandlers = 100;
bpmSelectionCellsHandler.prototype.handlers = null;
bpmSelectionCellsHandler.prototype.isEnabled = function()
{
	return this.enabled;
};

bpmSelectionCellsHandler.prototype.setEnabled = function(value)
{
	this.enabled = value;
};

bpmSelectionCellsHandler.prototype.getHandler = function(cell)
{
	return this.handlers.get(cell);
};

bpmSelectionCellsHandler.prototype.reset = function()
{
	this.handlers.visit(function(key, handler)
	{
		handler.reset.apply(handler);
	});
};

bpmSelectionCellsHandler.prototype.refresh = function()
{
	var oldHandlers = this.handlers;
	this.handlers = new bpmDictionary();
	
	var tmp = this.graph.getSelectionCells();

	for (var i = 0; i < tmp.length; i++)
	{
		var state = this.graph.view.getState(tmp[i]);

		if (state != null)
		{
			var handler = oldHandlers.remove(tmp[i]);

			if (handler != null)
			{
				if (handler.state != state)
				{
					handler.destroy();
					handler = null;
				}
				else if (!this.isHandlerActive(handler))
				{
					if (handler.refresh != null)
					{
						handler.refresh();
					}
					
					handler.redraw();
				}
			}
			
			if (handler == null)
			{
				handler = this.graph.createHandler(state);
				this.fireEvent(new bpmEventObject(bpmEvent.ADD, 'state', state));
			}
			
			if (handler != null)
			{
				this.handlers.put(tmp[i], handler);
			}
		}
	}
	
	oldHandlers.visit(bpmUtils.bind(this, function(key, handler)
	{
		this.fireEvent(new bpmEventObject(bpmEvent.REMOVE, 'state', handler.state));
		handler.destroy();
	}));
};

bpmSelectionCellsHandler.prototype.isHandlerActive = function(handler)
{
	return handler.index != null;
};

bpmSelectionCellsHandler.prototype.updateHandler = function(state)
{
	var handler = this.handlers.remove(state.cell);
	
	if (handler != null)
	{
		var index = handler.index;
		var x = handler.startX;
		var y = handler.startY;
		
		handler.destroy();
		handler = this.graph.createHandler(state);

		if (handler != null)
		{
			this.handlers.put(state.cell, handler);
			
			if (index != null && x != null && y != null)
			{
				handler.start(x, y, index);
			}
		}
	}
};

bpmSelectionCellsHandler.prototype.mouseDown = function(sender, me)
{
	if (this.graph.isEnabled() && this.isEnabled())
	{
		var args = [sender, me];

		this.handlers.visit(function(key, handler)
		{
			handler.mouseDown.apply(handler, args);
		});
	}
};

bpmSelectionCellsHandler.prototype.mouseMove = function(sender, me)
{
	if (this.graph.isEnabled() && this.isEnabled())
	{
		var args = [sender, me];

		this.handlers.visit(function(key, handler)
		{
			handler.mouseMove.apply(handler, args);
		});
	}
};

bpmSelectionCellsHandler.prototype.mouseUp = function(sender, me)
{
	if (this.graph.isEnabled() && this.isEnabled())
	{
		var args = [sender, me];

		this.handlers.visit(function(key, handler)
		{
			handler.mouseUp.apply(handler, args);
		});
	}
};

bpmSelectionCellsHandler.prototype.destroy = function()
{
	this.graph.removeMouseListener(this);
	
	if (this.refreshHandler != null)
	{
		this.graph.getSelectionModel().removeListener(this.refreshHandler);
		this.graph.getModel().removeListener(this.refreshHandler);
		this.graph.getView().removeListener(this.refreshHandler);
		this.refreshHandler = null;
	}
};



/* Connection Handler */

function bpmConnectionHandler(graph, factoryMethod)
{
	bpmEventSource.call(this);
	
	if (graph != null)
	{
		this.graph = graph;
		this.factoryMethod = factoryMethod;
		this.init();
		
		this.escapeHandler = bpmUtils.bind(this, function(sender, evt)
		{
			this.reset();
		});
		
		this.graph.addListener(bpmEvent.ESCAPE, this.escapeHandler);
	}
};

bpmUtils.extend(bpmConnectionHandler, bpmEventSource);

bpmConnectionHandler.prototype.graph = null;

bpmConnectionHandler.prototype.factoryMethod = true;
bpmConnectionHandler.prototype.moveIconFront = false;
bpmConnectionHandler.prototype.moveIconBack = false;
bpmConnectionHandler.prototype.connectImage = null;
bpmConnectionHandler.prototype.targetConnectImage = false;
bpmConnectionHandler.prototype.enabled = true;
bpmConnectionHandler.prototype.select = true;
bpmConnectionHandler.prototype.createTarget = false;
bpmConnectionHandler.prototype.marker = null;
bpmConnectionHandler.prototype.constraintHandler = null;
bpmConnectionHandler.prototype.error = null;
bpmConnectionHandler.prototype.waypointsEnabled = false;
bpmConnectionHandler.prototype.ignoreMouseDown = false;
bpmConnectionHandler.prototype.first = null;

bpmConnectionHandler.prototype.connectIconOffset = new bpmPoint(0, bpmConstants.TOOLTIP_VERTICAL_OFFSET);
bpmConnectionHandler.prototype.edgeState = null;
bpmConnectionHandler.prototype.changeHandler = null;
bpmConnectionHandler.prototype.drillHandler = null;
bpmConnectionHandler.prototype.mouseDownCounter = 0;
bpmConnectionHandler.prototype.movePreviewAway = bpmCore.IS_VML;
bpmConnectionHandler.prototype.outlineConnect = false;
bpmConnectionHandler.prototype.livePreview = false;
bpmConnectionHandler.prototype.cursor = null;
bpmConnectionHandler.prototype.insertBeforeSource = false;

bpmConnectionHandler.prototype.isEnabled = function()
{
	return this.enabled;
};

bpmConnectionHandler.prototype.setEnabled = function(enabled)
{
	this.enabled = enabled;
};

bpmConnectionHandler.prototype.isInsertBefore = function(edge, source, target, evt, dropTarget)
{
	return this.insertBeforeSource && source != target;
};

bpmConnectionHandler.prototype.isCreateTarget = function(evt)
{
	return this.createTarget;
};

bpmConnectionHandler.prototype.setCreateTarget = function(value)
{
	this.createTarget = value;
};

bpmConnectionHandler.prototype.createShape = function()
{
	var shape = (this.livePreview && this.edgeState != null) ?
		this.graph.cellRenderer.createShape(this.edgeState) :
		new bpmPolyline([], bpmConstants.INVALID_COLOR);
	shape.dialect = (this.graph.dialect != bpmConstants.DIALECT_SVG) ?
		bpmConstants.DIALECT_VML : bpmConstants.DIALECT_SVG;
	shape.scale = this.graph.view.scale;
	shape.pointerEvents = false;
	shape.isDashed = true;
	shape.init(this.graph.getView().getOverlayPane());
	bpmEvent.redirectMouseEvents(shape.node, this.graph, null);

	return shape;
};

bpmConnectionHandler.prototype.init = function()
{
	this.graph.addMouseListener(this);
	this.marker = this.createMarker();
	this.constraintHandler = new bpmConstraintHandler(this.graph);

	this.changeHandler = bpmUtils.bind(this, function(sender)
	{
		if (this.iconState != null)
		{
			this.iconState = this.graph.getView().getState(this.iconState.cell);
		}
		
		if (this.iconState != null)
		{
			this.redrawIcons(this.icons, this.iconState);
			this.constraintHandler.reset();
		}
		else if (this.previous != null && this.graph.view.getState(this.previous.cell) == null)
		{
			this.reset();
		}
	});
	
	this.graph.getModel().addListener(bpmEvent.CHANGE, this.changeHandler);
	this.graph.getView().addListener(bpmEvent.SCALE, this.changeHandler);
	this.graph.getView().addListener(bpmEvent.TRANSLATE, this.changeHandler);
	this.graph.getView().addListener(bpmEvent.SCALE_AND_TRANSLATE, this.changeHandler);
	
	this.drillHandler = bpmUtils.bind(this, function(sender)
	{
		this.reset();
	});
	
	this.graph.addListener(bpmEvent.START_EDITING, this.drillHandler);
	this.graph.getView().addListener(bpmEvent.DOWN, this.drillHandler);
	this.graph.getView().addListener(bpmEvent.UP, this.drillHandler);
};

bpmConnectionHandler.prototype.isConnectableCell = function(cell)
{
	return true;
};

bpmConnectionHandler.prototype.createMarker = function()
{
	var marker = new bpmCellMarker(this.graph);
	marker.hotspotEnabled = true;

	marker.getCell = bpmUtils.bind(this, function(me)
	{
		var cell = bpmCellMarker.prototype.getCell.apply(marker, arguments);
		this.error = null;
		
		if (cell == null && this.currentPoint != null)
		{
			cell = this.graph.getCellAt(this.currentPoint.x, this.currentPoint.y);
		}
		
		if (cell != null && !this.graph.isCellConnectable(cell))
		{
			var parent = this.graph.getModel().getParent(cell);
			
			if (this.graph.getModel().isVertex(parent) && this.graph.isCellConnectable(parent))
			{
				cell = parent;
			}
		}
		
		if ((this.graph.isSwimlane(cell) && this.currentPoint != null &&
			this.graph.hitsSwimlaneContent(cell, this.currentPoint.x, this.currentPoint.y)) ||
			!this.isConnectableCell(cell))
		{
			cell = null;
		}
		
		if (cell != null)
		{
			if (this.isConnecting())
			{
				if (this.previous != null)
				{
					this.error = this.validateConnection(this.previous.cell, cell);
					
					if (this.error != null && this.error.length == 0)
					{
						cell = null;
						if (this.isCreateTarget(me.getEvent()))
						{
							this.error = null;
						}
					}
				}
			}
			else if (!this.isValidSource(cell, me))
			{
				cell = null;
			}
		}
		else if (this.isConnecting() && !this.isCreateTarget(me.getEvent()) &&
				!this.graph.allowDanglingEdges)
		{
			this.error = '';
		}

		return cell;
	});

	marker.isValidState = bpmUtils.bind(this, function(state)
	{
		if (this.isConnecting())
		{
			return this.error == null;
		}
		else
		{
			return bpmCellMarker.prototype.isValidState.apply(marker, arguments);
		}
	});
	marker.getMarkerColor = bpmUtils.bind(this, function(evt, state, isValid)
	{
		return (this.connectImage == null || this.isConnecting()) ?
			bpmCellMarker.prototype.getMarkerColor.apply(marker, arguments) :
			null;
	});

	marker.intersects = bpmUtils.bind(this, function(state, evt)
	{
		if (this.connectImage != null || this.isConnecting())
		{
			return true;
		}
		
		return bpmCellMarker.prototype.intersects.apply(marker, arguments);
	});

	return marker;
};

bpmConnectionHandler.prototype.start = function(state, x, y, edgeState)
{
	this.previous = state;
	this.first = new bpmPoint(x, y);
	this.edgeState = (edgeState != null) ? edgeState : this.createEdgeState(null);
	
	this.marker.currentColor = this.marker.validColor;
	this.marker.markedState = state;
	this.marker.mark();

	this.fireEvent(new bpmEventObject(bpmEvent.START, 'state', this.previous));
};

bpmConnectionHandler.prototype.isConnecting = function()
{
	return this.first != null && this.shape != null;
};

bpmConnectionHandler.prototype.isValidSource = function(cell, me)
{
	return this.graph.isValidSource(cell);
};

bpmConnectionHandler.prototype.isValidTarget = function(cell)
{
	return true;
};

bpmConnectionHandler.prototype.validateConnection = function(source, target)
{
	if (!this.isValidTarget(target))
	{
		return '';
	}
	
	return this.graph.getEdgeValidationError(null, source, target);
};

bpmConnectionHandler.prototype.getConnectImage = function(state)
{
	return this.connectImage;
};

bpmConnectionHandler.prototype.isMoveIconToFrontForState = function(state)
{
	if (state.text != null && state.text.node.parentNode == this.graph.container)
	{
		return true;
	}
	
	return this.moveIconFront;
};

bpmConnectionHandler.prototype.createIcons = function(state)
{
	var image = this.getConnectImage(state);
	
	if (image != null && state != null)
	{
		this.iconState = state;
		var icons = [];

		var bounds = new bpmRectangle(0, 0, image.width, image.height);
		var icon = new bpmImageShape(bounds, image.src, null, null, 0);
		icon.preserveImageAspect = false;
		
		if (this.isMoveIconToFrontForState(state))
		{
			icon.dialect = bpmConstants.DIALECT_STRICTHTML;
			icon.init(this.graph.container);
		}
		else
		{
			icon.dialect = (this.graph.dialect == bpmConstants.DIALECT_SVG) ?
				bpmConstants.DIALECT_SVG : bpmConstants.DIALECT_VML;
			icon.init(this.graph.getView().getOverlayPane());

			if (this.moveIconBack && icon.node.previousSibling != null)
			{
				icon.node.parentNode.insertBefore(icon.node, icon.node.parentNode.firstChild);
			}
		}

		icon.node.style.cursor = bpmConstants.CURSOR_CONNECT;

		var getState = bpmUtils.bind(this, function()
		{
			return (this.currentState != null) ? this.currentState : state;
		});
		
		var mouseDown = bpmUtils.bind(this, function(evt)
		{
			if (!bpmEvent.isConsumed(evt))
			{
				this.icon = icon;
				this.graph.fireMouseEvent(bpmEvent.MOUSE_DOWN,
					new bpmMouseEvent(evt, getState()));
			}
		});

		bpmEvent.redirectMouseEvents(icon.node, this.graph, getState, mouseDown);
		
		icons.push(icon);
		this.redrawIcons(icons, this.iconState);
		
		return icons;
	}
	
	return null;
};

bpmConnectionHandler.prototype.redrawIcons = function(icons, state)
{
	if (icons != null && icons[0] != null && state != null)
	{
		var pos = this.getIconPosition(icons[0], state);
		icons[0].bounds.x = pos.x;
		icons[0].bounds.y = pos.y;
		icons[0].redraw();
	}
};

bpmConnectionHandler.prototype.getIconPosition = function(icon, state)
{
	var scale = this.graph.getView().scale;
	var cx = state.getCenterX();
	var cy = state.getCenterY();
	
	if (this.graph.isSwimlane(state.cell))
	{
		var size = this.graph.getStartSize(state.cell);
		
		cx = (size.width != 0) ? state.x + size.width * scale / 2 : cx;
		cy = (size.height != 0) ? state.y + size.height * scale / 2 : cy;
		
		var alpha = bpmUtils.toRadians(bpmUtils.getValue(state.style, bpmConstants.STYLE_ROTATION) || 0);
		
		if (alpha != 0)
		{
			var cos = Math.cos(alpha);
			var sin = Math.sin(alpha);
			var ct = new bpmPoint(state.getCenterX(), state.getCenterY());
			var pt = bpmUtils.getRotatedPoint(new bpmPoint(cx, cy), cos, sin, ct);
			cx = pt.x;
			cy = pt.y;
		}
	}

	return new bpmPoint(cx - icon.bounds.width / 2,
			cy - icon.bounds.height / 2);
};

bpmConnectionHandler.prototype.destroyIcons = function()
{
	if (this.icons != null)
	{
		for (var i = 0; i < this.icons.length; i++)
		{
			this.icons[i].destroy();
		}
		
		this.icons = null;
		this.icon = null;
		this.selectedIcon = null;
		this.iconState = null;
	}
};

bpmConnectionHandler.prototype.isStartEvent = function(me)
{
	return ((this.constraintHandler.currentFocus != null && this.constraintHandler.currentConstraint != null) ||
		(this.previous != null && this.error == null && (this.icons == null || (this.icons != null &&
		this.icon != null))));
};

bpmConnectionHandler.prototype.mouseDown = function(sender, me)
{
	this.mouseDownCounter++;
	
	if (this.isEnabled() && this.graph.isEnabled() && !me.isConsumed() &&
		!this.isConnecting() && this.isStartEvent(me))
	{
		if (this.constraintHandler.currentConstraint != null &&
			this.constraintHandler.currentFocus != null &&
			this.constraintHandler.currentPoint != null)
		{
			this.sourceConstraint = this.constraintHandler.currentConstraint;
			this.previous = this.constraintHandler.currentFocus;
			this.first = this.constraintHandler.currentPoint.clone();
		}
		else
		{
			this.first = new bpmPoint(me.getGraphX(), me.getGraphY());
		}
	
		this.edgeState = this.createEdgeState(me);
		this.mouseDownCounter = 1;
		
		if (this.waypointsEnabled && this.shape == null)
		{
			this.waypoints = null;
			this.shape = this.createShape();
			
			if (this.edgeState != null)
			{
				this.shape.apply(this.edgeState);
			}
		}

		if (this.previous == null && this.edgeState != null)
		{
			var pt = this.graph.getPointForEvent(me.getEvent());
			this.edgeState.cell.geometry.setTerminalPoint(pt, true);
		}
		
		this.fireEvent(new bpmEventObject(bpmEvent.START, 'state', this.previous));

		me.consume();
	}

	this.selectedIcon = this.icon;
	this.icon = null;
};

bpmConnectionHandler.prototype.isImmediateConnectSource = function(state)
{
	return !this.graph.isCellMovable(state.cell);
};

bpmConnectionHandler.prototype.createEdgeState = function(me)
{
	return null;
};

bpmConnectionHandler.prototype.isOutlineConnectEvent = function(me)
{
	var offset = bpmUtils.getOffset(this.graph.container);
	var evt = me.getEvent();
	
	var clientX = bpmEvent.getClientX(evt);
	var clientY = bpmEvent.getClientY(evt);
	
	var doc = document.documentElement;
	var left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
	var top = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
	
	var gridX = this.currentPoint.x - this.graph.container.scrollLeft + offset.x - left;
	var gridY = this.currentPoint.y - this.graph.container.scrollTop + offset.y - top;

	return this.outlineConnect && !bpmEvent.isShiftDown(me.getEvent()) &&
		(me.isSource(this.marker.highlight.shape) ||
		(bpmEvent.isAltDown(me.getEvent()) && me.getState() != null) ||
		this.marker.highlight.isHighlightAt(clientX, clientY) ||
		((gridX != clientX || gridY != clientY) && me.getState() == null &&
		this.marker.highlight.isHighlightAt(gridX, gridY)));
};

bpmConnectionHandler.prototype.updateCurrentState = function(me, point)
{
	this.constraintHandler.update(me, this.first == null, false, (this.first == null ||
		me.isSource(this.marker.highlight.shape)) ? null : point);
	
	if (this.constraintHandler.currentFocus != null && this.constraintHandler.currentConstraint != null)
	{
		if (this.marker.highlight != null && this.marker.highlight.state != null &&
			this.marker.highlight.state.cell == this.constraintHandler.currentFocus.cell)
		{
			if (this.marker.highlight.shape.stroke != 'transparent')
			{
				this.marker.highlight.shape.stroke = 'transparent';
				this.marker.highlight.repaint();
			}
		}
		else
		{
			this.marker.markCell(this.constraintHandler.currentFocus.cell, 'transparent');
		}

		if (this.previous != null)
		{
			this.error = this.validateConnection(this.previous.cell, this.constraintHandler.currentFocus.cell);
			
			if (this.error == null)
			{
				this.currentState = this.constraintHandler.currentFocus;
			}
			else
			{
				this.constraintHandler.reset();
			}
		}
	}
	else
	{
		if (this.graph.isIgnoreTerminalEvent(me.getEvent()))
		{
			this.marker.reset();
			this.currentState = null;
		}
		else
		{
			this.marker.process(me);
			this.currentState = this.marker.getValidState();
			
			if (this.currentState != null && !this.isCellEnabled(this.currentState.cell))
			{
				this.currentState = null;
			}
		}

		var outline = this.isOutlineConnectEvent(me);
		
		if (this.currentState != null && outline)
		{
			if (me.isSource(this.marker.highlight.shape))
			{
				point = new bpmPoint(me.getGraphX(), me.getGraphY());
			}
			
			var constraint = this.graph.getOutlineConstraint(point, this.currentState, me);
			this.constraintHandler.setFocus(me, this.currentState, false);
			this.constraintHandler.currentConstraint = constraint;
			this.constraintHandler.currentPoint = point;
		}

		if (this.outlineConnect)
		{
			if (this.marker.highlight != null && this.marker.highlight.shape != null)
			{
				var s = this.graph.view.scale;
				
				if (this.constraintHandler.currentConstraint != null &&
					this.constraintHandler.currentFocus != null)
				{
					this.marker.highlight.shape.stroke = bpmConstants.OUTLINE_HIGHLIGHT_COLOR;
					this.marker.highlight.shape.strokewidth = bpmConstants.OUTLINE_HIGHLIGHT_STROKEWIDTH / s / s;
					this.marker.highlight.repaint();
				} 
				else if (this.marker.hasValidState())
				{
					if (this.marker.getValidState() != me.getState())
					{
						this.marker.highlight.shape.stroke = 'transparent';
						this.currentState = null;
					}
					else
					{
						this.marker.highlight.shape.stroke = bpmConstants.DEFAULT_VALID_COLOR;
					}
	
					this.marker.highlight.shape.strokewidth = bpmConstants.HIGHLIGHT_STROKEWIDTH / s / s;
					this.marker.highlight.repaint();
				}
			}
		}
	}
};

bpmConnectionHandler.prototype.isCellEnabled = function(cell)
{
	return true;
};

bpmConnectionHandler.prototype.convertWaypoint = function(point)
{
	var scale = this.graph.getView().getScale();
	var tr = this.graph.getView().getTranslate();
	
	point.x = point.x / scale - tr.x;
	point.y = point.y / scale - tr.y;
};

bpmConnectionHandler.prototype.snapToPreview = function(me, point)
{
	if (!bpmEvent.isAltDown(me.getEvent()) && this.previous != null)
	{
		var tol = this.graph.gridSize * this.graph.view.scale / 2;	
		var tmp = (this.sourceConstraint != null) ? this.first :
			new bpmPoint(this.previous.getCenterX(), this.previous.getCenterY());

		if (Math.abs(tmp.x - me.getGraphX()) < tol)
		{
			point.x = tmp.x;
		}
		
		if (Math.abs(tmp.y - me.getGraphY()) < tol)
		{
			point.y = tmp.y;
		}
	}	
};

bpmConnectionHandler.prototype.mouseMove = function(sender, me)
{
	if (!me.isConsumed() && (this.ignoreMouseDown || this.first != null || !this.graph.isMouseDown))
	{
		if (!this.isEnabled() && this.currentState != null)
		{
			this.destroyIcons();
			this.currentState = null;
		}

		var view = this.graph.getView();
		var scale = view.scale;
		var tr = view.translate;
		var point = new bpmPoint(me.getGraphX(), me.getGraphY());
		this.error = null;

		if (this.graph.isGridEnabledEvent(me.getEvent()))
		{
			point = new bpmPoint((this.graph.snap(point.x / scale - tr.x) + tr.x) * scale,
				(this.graph.snap(point.y / scale - tr.y) + tr.y) * scale);
		}
		
		this.snapToPreview(me, point);
		this.currentPoint = point;
		
		if ((this.first != null || (this.isEnabled() && this.graph.isEnabled())) &&
			(this.shape != null || this.first == null ||
			Math.abs(me.getGraphX() - this.first.x) > this.graph.tolerance ||
			Math.abs(me.getGraphY() - this.first.y) > this.graph.tolerance))
		{
			this.updateCurrentState(me, point);
		}

		if (this.first != null)
		{
			var constraint = null;
			var current = point;
			
			if (this.constraintHandler.currentConstraint != null &&
				this.constraintHandler.currentFocus != null &&
				this.constraintHandler.currentPoint != null)
			{
				constraint = this.constraintHandler.currentConstraint;
				current = this.constraintHandler.currentPoint.clone();
			}
			else if (this.previous != null && !this.graph.isIgnoreTerminalEvent(me.getEvent()) &&
				bpmEvent.isShiftDown(me.getEvent()))
			{
				if (Math.abs(this.previous.getCenterX() - point.x) <
					Math.abs(this.previous.getCenterY() - point.y))
				{
					point.x = this.previous.getCenterX();
				}
				else
				{
					point.y = this.previous.getCenterY();
				}
			}
			
			var pt2 = this.first;
			
			if (this.selectedIcon != null)
			{
				var w = this.selectedIcon.bounds.width;
				var h = this.selectedIcon.bounds.height;
				
				if (this.currentState != null && this.targetConnectImage)
				{
					var pos = this.getIconPosition(this.selectedIcon, this.currentState);
					this.selectedIcon.bounds.x = pos.x;
					this.selectedIcon.bounds.y = pos.y;
				}
				else
				{
					var bounds = new bpmRectangle(me.getGraphX() + this.connectIconOffset.x,
						me.getGraphY() + this.connectIconOffset.y, w, h);
					this.selectedIcon.bounds = bounds;
				}
				
				this.selectedIcon.redraw();
			}

			if (this.edgeState != null)
			{
				this.updateEdgeState(current, constraint);
				current = this.edgeState.absolutePoints[this.edgeState.absolutePoints.length - 1];
				pt2 = this.edgeState.absolutePoints[0];
			}
			else
			{
				if (this.currentState != null)
				{
					if (this.constraintHandler.currentConstraint == null)
					{
						var tmp = this.getTargetPerimeterPoint(this.currentState, me);
						
						if (tmp != null)
						{
							current = tmp;
						}
					}
				}
				
				if (this.sourceConstraint == null && this.previous != null)
				{
					var next = (this.waypoints != null && this.waypoints.length > 0) ?
							this.waypoints[0] : current;
					var tmp = this.getSourcePerimeterPoint(this.previous, next, me);
					
					if (tmp != null)
					{
						pt2 = tmp;
					}
				}
			}

			if (this.currentState == null && this.movePreviewAway)
			{
				var tmp = pt2; 
				
				if (this.edgeState != null && this.edgeState.absolutePoints.length >= 2)
				{
					var tmp2 = this.edgeState.absolutePoints[this.edgeState.absolutePoints.length - 2];
					
					if (tmp2 != null)
					{
						tmp = tmp2;
					}
				}
				
				var dx = current.x - tmp.x;
				var dy = current.y - tmp.y;
				
				var len = Math.sqrt(dx * dx + dy * dy);
				
				if (len == 0)
				{
					return;
				}

				this.originalPoint = current.clone();
				current.x -= dx * 4 / len;
				current.y -= dy * 4 / len;
			}
			else
			{
				this.originalPoint = null;
			}

			if (this.shape == null)
			{
				var dx = Math.abs(me.getGraphX() - this.first.x);
				var dy = Math.abs(me.getGraphY() - this.first.y);

				if (dx > this.graph.tolerance || dy > this.graph.tolerance)
				{
					this.shape = this.createShape();

					if (this.edgeState != null)
					{
						this.shape.apply(this.edgeState);
					}
					
					this.updateCurrentState(me, point);
				}
			}

			if (this.shape != null)
			{
				if (this.edgeState != null)
				{
					this.shape.points = this.edgeState.absolutePoints;
				}
				else
				{
					var pts = [pt2];
					
					if (this.waypoints != null)
					{
						pts = pts.concat(this.waypoints);
					}

					pts.push(current);
					this.shape.points = pts;
				}
				
				this.drawPreview();
			}
			
			if (this.cursor != null)
			{
				this.graph.container.style.cursor = this.cursor;
			}
			
			bpmEvent.consume(me.getEvent());
			me.consume();
		}
		else if (!this.isEnabled() || !this.graph.isEnabled())
		{
			this.constraintHandler.reset();
		}
		else if (this.previous != this.currentState && this.edgeState == null)
		{
			this.destroyIcons();
					
			if (this.currentState != null && this.error == null && this.constraintHandler.currentConstraint == null)
			{
				this.icons = this.createIcons(this.currentState);

				if (this.icons == null)
				{
					this.currentState.setCursor(bpmConstants.CURSOR_CONNECT);
					me.consume();
				}
			}

			this.previous = this.currentState;
		}
		else if (this.previous == this.currentState && this.currentState != null && this.icons == null &&
			!this.graph.isMouseDown)
		{
			me.consume();
		}

		if (!this.graph.isMouseDown && this.currentState != null && this.icons != null)
		{
			var hitsIcon = false;
			var target = me.getSource();
			
			for (var i = 0; i < this.icons.length && !hitsIcon; i++)
			{
				hitsIcon = target == this.icons[i].node || target.parentNode == this.icons[i].node;
			}

			if (!hitsIcon)
			{
				this.updateIcons(this.currentState, this.icons, me);
			}
		}
	}
	else
	{
		this.constraintHandler.reset();
	}
};

bpmConnectionHandler.prototype.updateEdgeState = function(current, constraint)
{
	if (this.sourceConstraint != null && this.sourceConstraint.point != null)
	{
		this.edgeState.style[bpmConstants.STYLE_EXIT_X] = this.sourceConstraint.point.x;
		this.edgeState.style[bpmConstants.STYLE_EXIT_Y] = this.sourceConstraint.point.y;
	}

	if (constraint != null && constraint.point != null)
	{
		this.edgeState.style[bpmConstants.STYLE_ENTRY_X] = constraint.point.x;
		this.edgeState.style[bpmConstants.STYLE_ENTRY_Y] = constraint.point.y;
	}
	else
	{
		delete this.edgeState.style[bpmConstants.STYLE_ENTRY_X];
		delete this.edgeState.style[bpmConstants.STYLE_ENTRY_Y];
	}
	
	this.edgeState.absolutePoints = [null, (this.currentState != null) ? null : current];
	this.graph.view.updateFixedTerminalPoint(this.edgeState, this.previous, true, this.sourceConstraint);
	
	if (this.currentState != null)
	{
		if (constraint == null)
		{
			constraint = this.graph.getConnectionConstraint(this.edgeState, this.previous, false);
		}
		
		this.edgeState.setAbsoluteTerminalPoint(null, false);
		this.graph.view.updateFixedTerminalPoint(this.edgeState, this.currentState, false, constraint);
	}
	
	var realPoints = null;
	
	if (this.waypoints != null)
	{
		realPoints = [];
		
		for (var i = 0; i < this.waypoints.length; i++)
		{
			var pt = this.waypoints[i].clone();
			this.convertWaypoint(pt);
			realPoints[i] = pt;
		}
	}
	
	this.graph.view.updatePoints(this.edgeState, realPoints, this.previous, this.currentState);
	this.graph.view.updateFloatingTerminalPoints(this.edgeState, this.previous, this.currentState);
};

bpmConnectionHandler.prototype.getTargetPerimeterPoint = function(state, me)
{
	var result = null;
	var view = state.view;
	var targetPerimeter = view.getPerimeterFunction(state);
	
	if (targetPerimeter != null)
	{
		var next = (this.waypoints != null && this.waypoints.length > 0) ?
				this.waypoints[this.waypoints.length - 1] :
				new bpmPoint(this.previous.getCenterX(), this.previous.getCenterY());
		var tmp = targetPerimeter(view.getPerimeterBounds(state),
			this.edgeState, next, false);
			
		if (tmp != null)
		{
			result = tmp;
		}
	}
	else
	{
		result = new bpmPoint(state.getCenterX(), state.getCenterY());
	}
	
	return result;
};

bpmConnectionHandler.prototype.getSourcePerimeterPoint = function(state, next, me)
{
	var result = null;
	var view = state.view;
	var sourcePerimeter = view.getPerimeterFunction(state);
	var c = new bpmPoint(state.getCenterX(), state.getCenterY());
	
	if (sourcePerimeter != null)
	{
		var theta = bpmUtils.getValue(state.style, bpmConstants.STYLE_ROTATION, 0);
		var rad = -theta * (Math.PI / 180);
		
		if (theta != 0)
		{
			next = bpmUtils.getRotatedPoint(new bpmPoint(next.x, next.y), Math.cos(rad), Math.sin(rad), c);
		}
		
		var tmp = sourcePerimeter(view.getPerimeterBounds(state), state, next, false);
			
		if (tmp != null)
		{
			if (theta != 0)
			{
				tmp = bpmUtils.getRotatedPoint(new bpmPoint(tmp.x, tmp.y), Math.cos(-rad), Math.sin(-rad), c);
			}
			
			result = tmp;
		}
	}
	else
	{
		result = c;
	}
	
	return result;
};

bpmConnectionHandler.prototype.updateIcons = function(state, icons, me)
{
	// empty
};

bpmConnectionHandler.prototype.isStopEvent = function(me)
{
	return me.getState() != null;
};

bpmConnectionHandler.prototype.addWaypointForEvent = function(me)
{
	var point = bpmUtils.convertPoint(this.graph.container, me.getX(), me.getY());
	var dx = Math.abs(point.x - this.first.x);
	var dy = Math.abs(point.y - this.first.y);
	var addPoint = this.waypoints != null || (this.mouseDownCounter > 1 &&
			(dx > this.graph.tolerance || dy > this.graph.tolerance));

	if (addPoint)
	{
		if (this.waypoints == null)
		{
			this.waypoints = [];
		}
		
		var scale = this.graph.view.scale;
		var point = new bpmPoint(this.graph.snap(me.getGraphX() / scale) * scale,
				this.graph.snap(me.getGraphY() / scale) * scale);
		this.waypoints.push(point);
	}
};

bpmConnectionHandler.prototype.checkConstraints = function(c1, c2)
{
	return (c1 == null || c2 == null || c1.point == null || c2.point == null ||
		!c1.point.equals(c2.point) || c1.dx != c2.dx || c1.dy != c2.dy ||
		c1.perimeter != c2.perimeter);
};

bpmConnectionHandler.prototype.mouseUp = function(sender, me)
{
	if (!me.isConsumed() && this.isConnecting())
	{
		if (this.waypointsEnabled && !this.isStopEvent(me))
		{
			this.addWaypointForEvent(me);
			me.consume();
			
			return;
		}
		
		var c1 = this.sourceConstraint;
		var c2 = this.constraintHandler.currentConstraint;

		var source = (this.previous != null) ? this.previous.cell : null;
		var target = null;
		
		if (this.constraintHandler.currentConstraint != null &&
			this.constraintHandler.currentFocus != null)
		{
			target = this.constraintHandler.currentFocus.cell;
		}
		
		if (target == null && this.currentState != null)
		{
			target = this.currentState.cell;
		}
		
		if (this.error == null && (source == null || target == null ||
			source != target || this.checkConstraints(c1, c2)))
		{
			this.connect(source, target, me.getEvent(), me.getCell());
		}
		else
		{
			if (this.previous != null && this.marker.validState != null &&
				this.previous.cell == this.marker.validState.cell)
			{
				this.graph.selectCellForEvent(this.marker.source, me.getEvent());
			}
			
			if (this.error != null && this.error.length > 0)
			{
				this.graph.validationAlert(this.error);
			}
		}
		
		this.destroyIcons();
		me.consume();
	}

	if (this.first != null)
	{
		this.reset();
	}
};

bpmConnectionHandler.prototype.reset = function()
{
	if (this.shape != null)
	{
		this.shape.destroy();
		this.shape = null;
	}
	
	if (this.cursor != null && this.graph.container != null)
	{
		this.graph.container.style.cursor = '';
	}
	
	this.destroyIcons();
	this.marker.reset();
	this.constraintHandler.reset();
	this.originalPoint = null;
	this.currentPoint = null;
	this.edgeState = null;
	this.previous = null;
	this.error = null;
	this.sourceConstraint = null;
	this.mouseDownCounter = 0;
	this.first = null;

	this.fireEvent(new bpmEventObject(bpmEvent.RESET));
};

bpmConnectionHandler.prototype.drawPreview = function()
{
	this.updatePreview(this.error == null);
	this.shape.redraw();
};

bpmConnectionHandler.prototype.updatePreview = function(valid)
{
	this.shape.strokewidth = this.getEdgeWidth(valid);
	this.shape.stroke = this.getEdgeColor(valid);
};

bpmConnectionHandler.prototype.getEdgeColor = function(valid)
{
	return (valid) ? bpmConstants.VALID_COLOR : bpmConstants.INVALID_COLOR;
};
	
bpmConnectionHandler.prototype.getEdgeWidth = function(valid)
{
	return (valid) ? 3 : 1;
};

bpmConnectionHandler.prototype.connect = function(source, target, evt, dropTarget)
{
	if (target != null || this.isCreateTarget(evt) || this.graph.allowDanglingEdges)
	{
		var model = this.graph.getModel();
		var terminalInserted = false;
		var edge = null;

		model.beginUpdate();
		try
		{
			if (source != null && target == null && !this.graph.isIgnoreTerminalEvent(evt) && this.isCreateTarget(evt))
			{
				target = this.createTargetVertex(evt, source);
				
				if (target != null)
				{
					dropTarget = this.graph.getDropTarget([target], evt, dropTarget);
					terminalInserted = true;
					
					if (dropTarget == null || !this.graph.getModel().isEdge(dropTarget))
					{
						var pstate = this.graph.getView().getState(dropTarget);
						
						if (pstate != null)
						{
							var tmp = model.getGeometry(target);
							tmp.x -= pstate.origin.x;
							tmp.y -= pstate.origin.y;
						}
					}
					else
					{
						dropTarget = this.graph.getDefaultParent();
					}
						
					this.graph.addCell(target, dropTarget);
				}
			}

			var parent = this.graph.getDefaultParent();

			if (source != null && target != null &&
				model.getParent(source) == model.getParent(target) &&
				model.getParent(model.getParent(source)) != model.getRoot())
			{
				parent = model.getParent(source);

				if ((source.geometry != null && source.geometry.relative) &&
					(target.geometry != null && target.geometry.relative))
				{
					parent = model.getParent(parent);
				}
			}
			
			var value = null;
			var style = null;
			
			if (this.edgeState != null)
			{
				value = this.edgeState.cell.value;
				style = this.edgeState.cell.style;
			}

			edge = this.insertEdge(parent, null, value, source, target, style);
			
			if (edge != null)
			{
				this.graph.setConnectionConstraint(edge, source, true, this.sourceConstraint);
				this.graph.setConnectionConstraint(edge, target, false, this.constraintHandler.currentConstraint);
				
				if (this.edgeState != null)
				{
					model.setGeometry(edge, this.edgeState.cell.geometry);
				}
				
				var parent = model.getParent(source);
				
				if (this.isInsertBefore(edge, source, target, evt, dropTarget))
				{
					var index = null;
					var tmp = source;

					while (tmp.parent != null && tmp.geometry != null &&
						tmp.geometry.relative && tmp.parent != edge.parent)
					{
						tmp = this.graph.model.getParent(tmp);
					}

					if (tmp != null && tmp.parent != null && tmp.parent == edge.parent)
					{
						model.add(parent, edge, tmp.parent.getIndex(tmp));
					}
				}

				var geo = model.getGeometry(edge);

				if (geo == null)
				{
					geo = new bpmGeometry();
					geo.relative = true;
					
					model.setGeometry(edge, geo);
				}
				
				if (this.waypoints != null && this.waypoints.length > 0)
				{
					var s = this.graph.view.scale;
					var tr = this.graph.view.translate;
					geo.points = [];
					
					for (var i = 0; i < this.waypoints.length; i++)
					{
						var pt = this.waypoints[i];
						geo.points.push(new bpmPoint(pt.x / s - tr.x, pt.y / s - tr.y));
					}
				}

				if (target == null)
				{
					var t = this.graph.view.translate;
					var s = this.graph.view.scale;
					var pt = (this.originalPoint != null) ?
							new bpmPoint(this.originalPoint.x / s - t.x, this.originalPoint.y / s - t.y) :
						new bpmPoint(this.currentPoint.x / s - t.x, this.currentPoint.y / s - t.y);
					pt.x -= this.graph.panDx / this.graph.view.scale;
					pt.y -= this.graph.panDy / this.graph.view.scale;
					geo.setTerminalPoint(pt, false);
				}
				
				this.fireEvent(new bpmEventObject(bpmEvent.CONNECT, 'cell', edge, 'terminal', target,
					'event', evt, 'target', dropTarget, 'terminalInserted', terminalInserted));
			}
		}
		catch (e)
		{
			bpmLog.show();
			bpmLog.debug(e.message);
		}
		finally
		{
			model.endUpdate();
			link = new bpmLink(edge, source, target, parent); 
		}
		
		if (this.select)
		{
			this.selectCells(edge, (terminalInserted) ? target : null);
		}
	}
};

bpmConnectionHandler.prototype.selectCells = function(edge, target)
{
	this.graph.setSelectionCell(edge);
};

bpmConnectionHandler.prototype.insertEdge = function(parent, id, value, source, target, style)
{
	if (this.factoryMethod == null)
	{
		return this.graph.insertEdge(parent, id, value, source, target, style);
	}
	else
	{
		var edge = this.createEdge(value, source, target, style);
		edge = this.graph.addEdge(edge, parent, source, target);
		
		return edge;
	}
};

bpmConnectionHandler.prototype.createTargetVertex = function(evt, source)
{
	var geo = this.graph.getCellGeometry(source);
	
	while (geo != null && geo.relative)
	{
		source = this.graph.getModel().getParent(source);
		geo = this.graph.getCellGeometry(source);
	}
	
	var clone = this.graph.cloneCell(source);
	var geo = this.graph.getModel().getGeometry(clone);
	
	if (geo != null)
	{
		var t = this.graph.view.translate;
		var s = this.graph.view.scale;
		var point = new bpmPoint(this.currentPoint.x / s - t.x, this.currentPoint.y / s - t.y);
		geo.x = Math.round(point.x - geo.width / 2 - this.graph.panDx / s);
		geo.y = Math.round(point.y - geo.height / 2 - this.graph.panDy / s);

		var tol = this.getAlignmentTolerance();
		
		if (tol > 0)
		{
			var sourceState = this.graph.view.getState(source);
			
			if (sourceState != null)
			{
				var x = sourceState.x / s - t.x;
				var y = sourceState.y / s - t.y;
				
				if (Math.abs(x - geo.x) <= tol)
				{
					geo.x = Math.round(x);
				}
				
				if (Math.abs(y - geo.y) <= tol)
				{
					geo.y = Math.round(y);
				}
			}
		}
	}

	return clone;		
};

bpmConnectionHandler.prototype.getAlignmentTolerance = function(evt)
{
	return (this.graph.isGridEnabled()) ? this.graph.gridSize / 2 : this.graph.tolerance;
};

bpmConnectionHandler.prototype.createEdge = function(value, source, target, style)
{
	var edge = null;
	
	if (this.factoryMethod != null)
	{
		edge = this.factoryMethod(source, target, style);
	}
	
	if (edge == null)
	{
		edge = new bpmCell(value || '');
		edge.setEdge(true);
		edge.setStyle(style);
		
		var geo = new bpmGeometry();
		geo.relative = true;
		edge.setGeometry(geo);
	}

	return edge;
};

bpmConnectionHandler.prototype.destroy = function()
{
	this.graph.removeMouseListener(this);
	
	if (this.shape != null)
	{
		this.shape.destroy();
		this.shape = null;
	}
	
	if (this.marker != null)
	{
		this.marker.destroy();
		this.marker = null;
	}

	if (this.constraintHandler != null)
	{
		this.constraintHandler.destroy();
		this.constraintHandler = null;
	}

	if (this.changeHandler != null)
	{
		this.graph.getModel().removeListener(this.changeHandler);
		this.graph.getView().removeListener(this.changeHandler);
		this.changeHandler = null;
	}
	
	if (this.drillHandler != null)
	{
		this.graph.removeListener(this.drillHandler);
		this.graph.getView().removeListener(this.drillHandler);
		this.drillHandler = null;
	}
	
	if (this.escapeHandler != null)
	{
		this.graph.removeListener(this.escapeHandler);
		this.escapeHandler = null;
	}
};



/* Constraint Handler */
function bpmConstraintHandler(graph)
{
	this.graph = graph;
	
	this.resetHandler = bpmUtils.bind(this, function(sender, evt)
	{
		if (this.currentFocus != null && this.graph.view.getState(this.currentFocus.cell) == null)
		{
			this.reset();
		}
		else
		{
			this.redraw();
		}
	});
	
	this.graph.model.addListener(bpmEvent.CHANGE, this.resetHandler);
	this.graph.view.addListener(bpmEvent.SCALE_AND_TRANSLATE, this.resetHandler);
	this.graph.view.addListener(bpmEvent.TRANSLATE, this.resetHandler);
	this.graph.view.addListener(bpmEvent.SCALE, this.resetHandler);
	this.graph.addListener(bpmEvent.ROOT, this.resetHandler);
};

bpmConstraintHandler.prototype.pointImage = new bpmImage(bpmCore.imageBasePath + '/point.gif', 5, 5);

bpmConstraintHandler.prototype.graph = null;
bpmConstraintHandler.prototype.enabled = true;
bpmConstraintHandler.prototype.highlightColor = bpmConstants.DEFAULT_VALID_COLOR;

bpmConstraintHandler.prototype.isEnabled = function()
{
	return this.enabled;
};

bpmConstraintHandler.prototype.setEnabled = function(enabled)
{
	this.enabled = enabled;
};

bpmConstraintHandler.prototype.reset = function()
{
	if (this.focusIcons != null)
	{
		for (var i = 0; i < this.focusIcons.length; i++)
		{
			this.focusIcons[i].destroy();
		}
		
		this.focusIcons = null;
	}
	
	if (this.focusHighlight != null)
	{
		this.focusHighlight.destroy();
		this.focusHighlight = null;
	}
	
	this.currentConstraint = null;
	this.currentFocusArea = null;
	this.currentPoint = null;
	this.currentFocus = null;
	this.focusPoints = null;
};

bpmConstraintHandler.prototype.getTolerance = function(me)
{
	return this.graph.getTolerance();
};

bpmConstraintHandler.prototype.getImageForConstraint = function(state, constraint, point)
{
	return this.pointImage;
};

bpmConstraintHandler.prototype.isEventIgnored = function(me, source)
{
	return false;
};

bpmConstraintHandler.prototype.isStateIgnored = function(state, source)
{
	return false;
};

bpmConstraintHandler.prototype.destroyIcons = function()
{
	if (this.focusIcons != null)
	{
		for (var i = 0; i < this.focusIcons.length; i++)
		{
			this.focusIcons[i].destroy();
		}
		
		this.focusIcons = null;
		this.focusPoints = null;
	}
};

bpmConstraintHandler.prototype.destroyFocusHighlight = function()
{
	if (this.focusHighlight != null)
	{
		this.focusHighlight.destroy();
		this.focusHighlight = null;
	}
};

bpmConstraintHandler.prototype.isKeepFocusEvent = function(me)
{
	return bpmEvent.isShiftDown(me.getEvent());
};

bpmConstraintHandler.prototype.getCellForEvent = function(me, point)
{
	var cell = me.getCell();
	
	if (cell == null && point != null && (me.getGraphX() != point.x || me.getGraphY() != point.y))
	{
		cell = this.graph.getCellAt(point.x, point.y);
	}
	
	if (cell != null && !this.graph.isCellConnectable(cell))
	{
		var parent = this.graph.getModel().getParent(cell);
		
		if (this.graph.getModel().isVertex(parent) && this.graph.isCellConnectable(parent))
		{
			cell = parent;
		}
	}
	
	return (this.graph.isCellLocked(cell)) ? null : cell;
};

bpmConstraintHandler.prototype.update = function(me, source, existingEdge, point)
{
	if (this.isEnabled() && !this.isEventIgnored(me))
	{
		if (this.mouseleaveHandler == null && this.graph.container != null)
		{
			this.mouseleaveHandler = bpmUtils.bind(this, function()
			{
				this.reset();
			});

			bpmEvent.addListener(this.graph.container, 'mouseleave', this.resetHandler);	
		}
		
		var tol = this.getTolerance(me);
		var x = (point != null) ? point.x : me.getGraphX();
		var y = (point != null) ? point.y : me.getGraphY();
		var grid = new bpmRectangle(x - tol, y - tol, 2 * tol, 2 * tol);
		var mouse = new bpmRectangle(me.getGraphX() - tol, me.getGraphY() - tol, 2 * tol, 2 * tol);
		var state = this.graph.view.getState(this.getCellForEvent(me, point));

		if (!this.isKeepFocusEvent(me) && (this.currentFocusArea == null || this.currentFocus == null ||
			(state != null) || !this.graph.getModel().isVertex(this.currentFocus.cell) ||
			!bpmUtils.intersects(this.currentFocusArea, mouse)) && (state != this.currentFocus))
		{
			this.currentFocusArea = null;
			this.currentFocus = null;
			this.setFocus(me, state, source);
		}

		this.currentConstraint = null;
		this.currentPoint = null;
		var minDistSq = null;
		
		if (this.focusIcons != null && this.constraints != null &&
			(state == null || this.currentFocus == state))
		{
			var cx = mouse.getCenterX();
			var cy = mouse.getCenterY();
			
			for (var i = 0; i < this.focusIcons.length; i++)
			{
				var dx = cx - this.focusIcons[i].bounds.getCenterX();
				var dy = cy - this.focusIcons[i].bounds.getCenterY();
				var tmp = dx * dx + dy * dy;
				
				if ((this.intersects(this.focusIcons[i], mouse, source, existingEdge) || (point != null &&
					this.intersects(this.focusIcons[i], grid, source, existingEdge))) &&
					(minDistSq == null || tmp < minDistSq))
				{
					this.currentConstraint = this.constraints[i];
					this.currentPoint = this.focusPoints[i];
					minDistSq = tmp;
					
					var tmp = this.focusIcons[i].bounds.clone();
					tmp.grow(bpmConstants.HIGHLIGHT_SIZE + 1);
					tmp.width -= 1;
					tmp.height -= 1;
					
					if (this.focusHighlight == null)
					{
						var hl = this.createHighlightShape();
						hl.dialect = (this.graph.dialect == bpmConstants.DIALECT_SVG) ?
								bpmConstants.DIALECT_SVG : bpmConstants.DIALECT_VML;
						hl.pointerEvents = false;

						hl.init(this.graph.getView().getOverlayPane());
						this.focusHighlight = hl;
						
						var getState = bpmUtils.bind(this, function()
						{
							return (this.currentFocus != null) ? this.currentFocus : state;
						});
	
						bpmEvent.redirectMouseEvents(hl.node, this.graph, getState);
					}

					this.focusHighlight.bounds = tmp;
					this.focusHighlight.redraw();
				}
			}
		}
		
		if (this.currentConstraint == null)
		{
			this.destroyFocusHighlight();
		}
	}
	else
	{
		this.currentConstraint = null;
		this.currentFocus = null;
		this.currentPoint = null;
	}
};

bpmConstraintHandler.prototype.redraw = function()
{
	if (this.currentFocus != null && this.constraints != null && this.focusIcons != null)
	{
		var state = this.graph.view.getState(this.currentFocus.cell);
		this.currentFocus = state;
		this.currentFocusArea = new bpmRectangle(state.x, state.y, state.width, state.height);
		
		for (var i = 0; i < this.constraints.length; i++)
		{
			var cp = this.graph.getConnectionPoint(state, this.constraints[i]);
			var img = this.getImageForConstraint(state, this.constraints[i], cp);

			var bounds = new bpmRectangle(Math.round(cp.x - img.width / 2),
				Math.round(cp.y - img.height / 2), img.width, img.height);
			this.focusIcons[i].bounds = bounds;
			this.focusIcons[i].redraw();
			this.currentFocusArea.add(this.focusIcons[i].bounds);
			this.focusPoints[i] = cp;
		}
	}	
};

bpmConstraintHandler.prototype.setFocus = function(me, state, source)
{
	this.constraints = (state != null && !this.isStateIgnored(state, source) &&
		this.graph.isCellConnectable(state.cell)) ? ((this.isEnabled()) ?
		(this.graph.getAllConnectionConstraints(state, source) || []) : []) : null;

	if (this.constraints != null)
	{
		this.currentFocus = state;
		this.currentFocusArea = new bpmRectangle(state.x, state.y, state.width, state.height);
		
		if (this.focusIcons != null)
		{
			for (var i = 0; i < this.focusIcons.length; i++)
			{
				this.focusIcons[i].destroy();
			}
			
			this.focusIcons = null;
			this.focusPoints = null;
		}
		
		this.focusPoints = [];
		this.focusIcons = [];
		
		for (var i = 0; i < this.constraints.length; i++)
		{
			var cp = this.graph.getConnectionPoint(state, this.constraints[i]);
			var img = this.getImageForConstraint(state, this.constraints[i], cp);

			var src = img.src;
			var bounds = new bpmRectangle(Math.round(cp.x - img.width / 2),
				Math.round(cp.y - img.height / 2), img.width, img.height);
			var icon = new bpmImageShape(bounds, src);
			icon.dialect = (this.graph.dialect != bpmConstants.DIALECT_SVG) ?
					bpmConstants.DIALECT_MIXEDHTML : bpmConstants.DIALECT_SVG;
			icon.preserveImageAspect = false;
			icon.init(this.graph.getView().getDecoratorPane());
			
			if (bpmCore.IS_QUIRKS || document.documentMode == 8)
			{
				bpmEvent.addListener(icon.node, 'dragstart', function(evt)
				{
					bpmEvent.consume(evt);
					
					return false;
				});
			}

			if (icon.node.previousSibling != null)
			{
				icon.node.parentNode.insertBefore(icon.node, icon.node.parentNode.firstChild);
			}

			var getState = bpmUtils.bind(this, function()
			{
				return (this.currentFocus != null) ? this.currentFocus : state;
			});
			
			icon.redraw();

			bpmEvent.redirectMouseEvents(icon.node, this.graph, getState);
			this.currentFocusArea.add(icon.bounds);
			this.focusIcons.push(icon);
			this.focusPoints.push(cp);
		}
		
		this.currentFocusArea.grow(this.getTolerance(me));
	}
	else
	{
		this.destroyIcons();
		this.destroyFocusHighlight();
	}
};

bpmConstraintHandler.prototype.createHighlightShape = function()
{
	var hl = new bpmRectangleShape(null, this.highlightColor, this.highlightColor, bpmConstants.HIGHLIGHT_STROKEWIDTH);
	hl.opacity = bpmConstants.HIGHLIGHT_OPACITY;
	
	return hl;
};

bpmConstraintHandler.prototype.intersects = function(icon, mouse, source, existingEdge)
{
	return bpmUtils.intersects(icon.bounds, mouse);
};

bpmConstraintHandler.prototype.destroy = function()
{
	this.reset();
	
	if (this.resetHandler != null)
	{
		this.graph.model.removeListener(this.resetHandler);
		this.graph.view.removeListener(this.resetHandler);
		this.graph.removeListener(this.resetHandler);
		this.resetHandler = null;
	}
	
	if (this.mouseleaveHandler != null && this.graph.container != null)
	{
		bpmEvent.removeListener(this.graph.container, 'mouseleave', this.mouseleaveHandler);
		this.mouseleaveHandler = null;
	}
};


/* Bubberband */
function bpmRubberband(graph)
{
	if (graph != null)
	{
		this.graph = graph;
		this.graph.addMouseListener(this);

		this.forceRubberbandHandler = bpmUtils.bind(this, function(sender, evt)
		{
			var evtName = evt.getProperty('eventName');
			var me = evt.getProperty('event');
			
			if (evtName == bpmEvent.MOUSE_DOWN && this.isForceRubberbandEvent(me))
			{
				var offset = bpmUtils.getOffset(this.graph.container);
				var origin = bpmUtils.getScrollOrigin(this.graph.container);
				origin.x -= offset.x;
				origin.y -= offset.y;
				this.start(me.getX() + origin.x, me.getY() + origin.y);
				me.consume(false);
			}
		});
		
		this.graph.addListener(bpmEvent.FIRE_MOUSE_EVENT, this.forceRubberbandHandler);
		this.panHandler = bpmUtils.bind(this, function()
		{
			this.repaint();
		});
		
		this.graph.addListener(bpmEvent.PAN, this.panHandler);
		this.gestureHandler = bpmUtils.bind(this, function(sender, eo)
		{
			if (this.first != null)
			{
				this.reset();
			}
		});
		
		this.graph.addListener(bpmEvent.GESTURE, this.gestureHandler);
		
		if (bpmCore.IS_IE)
		{
			bpmEvent.addListener(window, 'unload',
				bpmUtils.bind(this, function()
				{
					this.destroy();
				})
			);
		}
	}
};

bpmRubberband.prototype.defaultOpacity = 20;
bpmRubberband.prototype.enabled = true;
bpmRubberband.prototype.div = null;
bpmRubberband.prototype.sharedDiv = null;
bpmRubberband.prototype.currentX = 0;
bpmRubberband.prototype.currentY = 0;
bpmRubberband.prototype.fadeOut = false;

bpmRubberband.prototype.isEnabled = function()
{
	return this.enabled;
};

bpmRubberband.prototype.setEnabled = function(enabled)
{
	this.enabled = enabled;
};

bpmRubberband.prototype.isForceRubberbandEvent = function(me)
{
	return bpmEvent.isAltDown(me.getEvent());
};

bpmRubberband.prototype.mouseDown = function(sender, me)
{
	if (!me.isConsumed() && this.isEnabled() && this.graph.isEnabled() &&
		me.getState() == null && !bpmEvent.isMultiTouchEvent(me.getEvent()))
	{
		var offset = bpmUtils.getOffset(this.graph.container);
		var origin = bpmUtils.getScrollOrigin(this.graph.container);
		origin.x -= offset.x;
		origin.y -= offset.y;
		this.start(me.getX() + origin.x, me.getY() + origin.y);

		me.consume(false);
	}
};

bpmRubberband.prototype.start = function(x, y)
{
	this.first = new bpmPoint(x, y);

	var container = this.graph.container;
	
	function createMouseEvent(evt)
	{
		var me = new bpmMouseEvent(evt);
		var pt = bpmUtils.convertPoint(container, me.getX(), me.getY());
		
		me.graphX = pt.x;
		me.graphY = pt.y;
		
		return me;
	};

	this.dragHandler = bpmUtils.bind(this, function(evt)
	{
		this.mouseMove(this.graph, createMouseEvent(evt));
	});

	this.dropHandler = bpmUtils.bind(this, function(evt)
	{
		this.mouseUp(this.graph, createMouseEvent(evt));
	});

	if (bpmCore.IS_FF)
	{
		bpmEvent.addGestureListeners(document, null, this.dragHandler, this.dropHandler);
	}
};

bpmRubberband.prototype.mouseMove = function(sender, me)
{
	if (!me.isConsumed() && this.first != null)
	{
		var origin = bpmUtils.getScrollOrigin(this.graph.container);
		var offset = bpmUtils.getOffset(this.graph.container);
		origin.x -= offset.x;
		origin.y -= offset.y;
		var x = me.getX() + origin.x;
		var y = me.getY() + origin.y;
		var dx = this.first.x - x;
		var dy = this.first.y - y;
		var tol = this.graph.tolerance;
		
		if (this.div != null || Math.abs(dx) > tol ||  Math.abs(dy) > tol)
		{
			if (this.div == null)
			{
				this.div = this.createShape();
			}
			
			bpmUtils.clearSelection();
			
			this.update(x, y);
			me.consume();
		}
	}
};

bpmRubberband.prototype.createShape = function()
{
	if (this.sharedDiv == null)
	{
		this.sharedDiv = document.createElement('div');
		this.sharedDiv.className = 'bpmRubberband';
		bpmUtils.setOpacity(this.sharedDiv, this.defaultOpacity);
	}

	this.graph.container.appendChild(this.sharedDiv);
	var result = this.sharedDiv;
	
	if (bpmCore.IS_SVG && (!bpmCore.IS_IE || document.documentMode >= 10) && this.fadeOut)
	{
		this.sharedDiv = null;
	}
		
	return result;
};

bpmRubberband.prototype.isActive = function(sender, me)
{
	return this.div != null && this.div.style.display != 'none';
};

bpmRubberband.prototype.mouseUp = function(sender, me)
{
	var active = this.isActive();
	this.reset();
	
	if (active)
	{
		this.execute(me.getEvent());
		me.consume();
	}
};

bpmRubberband.prototype.execute = function(evt)
{
	var rect = new bpmRectangle(this.x, this.y, this.width, this.height);
	this.graph.selectRegion(rect, evt);
};

bpmRubberband.prototype.reset = function()
{
	if (this.div != null)
	{
		if (bpmCore.IS_SVG && (!bpmCore.IS_IE || document.documentMode >= 10) && this.fadeOut)
		{
			var temp = this.div;
			bpmUtils.setPrefixedStyle(temp.style, 'transition', 'all 0.2s linear');
			temp.style.pointerEvents = 'none';
			temp.style.opacity = 0;
		    
		    window.setTimeout(function()
		    	{
		    		temp.parentNode.removeChild(temp);
		    	}, 200);	
		}
		else
		{
			this.div.parentNode.removeChild(this.div);
		}
	}

	bpmEvent.removeGestureListeners(document, null, this.dragHandler, this.dropHandler);
	this.dragHandler = null;
	this.dropHandler = null;
	
	this.currentX = 0;
	this.currentY = 0;
	this.first = null;
	this.div = null;
};

bpmRubberband.prototype.update = function(x, y)
{
	this.currentX = x;
	this.currentY = y;
	
	this.repaint();
};

bpmRubberband.prototype.repaint = function()
{
	if (this.div != null)
	{
		var x = this.currentX - this.graph.panDx;
		var y = this.currentY - this.graph.panDy;
		
		this.x = Math.min(this.first.x, x);
		this.y = Math.min(this.first.y, y);
		this.width = Math.max(this.first.x, x) - this.x;
		this.height =  Math.max(this.first.y, y) - this.y;

		var dx = (bpmCore.IS_VML) ? this.graph.panDx : 0;
		var dy = (bpmCore.IS_VML) ? this.graph.panDy : 0;
		
		this.div.style.left = (this.x + dx) + 'px';
		this.div.style.top = (this.y + dy) + 'px';
		this.div.style.width = Math.max(1, this.width) + 'px';
		this.div.style.height = Math.max(1, this.height) + 'px';
	}
};

bpmRubberband.prototype.destroy = function()
{
	if (!this.destroyed)
	{
		this.destroyed = true;
		this.graph.removeMouseListener(this);
		this.graph.removeListener(this.forceRubberbandHandler);
		this.graph.removeListener(this.panHandler);
		this.reset();
		
		if (this.sharedDiv != null)
		{
			this.sharedDiv = null;
		}
	}
};



/* Handle */
function bpmHandle(state, cursor, image)
{
	this.graph = state.view.graph;
	this.state = state;
	this.cursor = (cursor != null) ? cursor : this.cursor;
	this.image = (image != null) ? image : this.image;
	this.init();
};

bpmHandle.prototype.cursor = 'default';
bpmHandle.prototype.image = null;
bpmHandle.prototype.ignoreGrid = false;
bpmHandle.prototype.getPosition = function(bounds) { };
bpmHandle.prototype.setPosition = function(bounds, pt, me) { };
bpmHandle.prototype.execute = function() { };
bpmHandle.prototype.copyStyle = function(key)
{
	this.graph.setCellStyles(key, this.state.style[key], [this.state.cell]);
};
bpmHandle.prototype.processEvent = function(me)
{
	var scale = this.graph.view.scale;
	var tr = this.graph.view.translate;
	var pt = new bpmPoint(me.getGraphX() / scale - tr.x, me.getGraphY() / scale - tr.y);
	
	if (this.shape != null && this.shape.bounds != null)
	{
		pt.x -= this.shape.bounds.width / scale / 4;
		pt.y -= this.shape.bounds.height / scale / 4;
	}

	var alpha1 = -bpmUtils.toRadians(this.getRotation());
	var alpha2 = -bpmUtils.toRadians(this.getTotalRotation()) - alpha1;
	pt = this.flipPoint(this.rotatePoint(this.snapPoint(this.rotatePoint(pt, alpha1),
			this.ignoreGrid || !this.graph.isGridEnabledEvent(me.getEvent())), alpha2));
	this.setPosition(this.state.getPaintBounds(), pt, me);
	this.positionChanged();
	this.redraw();
};

bpmHandle.prototype.positionChanged = function()
{
	if (this.state.text != null)
	{
		this.state.text.apply(this.state);
	}
	
	if (this.state.shape != null)
	{
		this.state.shape.apply(this.state);
	}
	
	this.graph.cellRenderer.redraw(this.state, true);
};

bpmHandle.prototype.getRotation = function()
{
	if (this.state.shape != null)
	{
		return this.state.shape.getRotation();
	}
	
	return 0;
};

bpmHandle.prototype.getTotalRotation = function()
{
	if (this.state.shape != null)
	{
		return this.state.shape.getShapeRotation();
	}
	
	return 0;
};

bpmHandle.prototype.init = function()
{
	var html = this.isHtmlRequired();
	
	if (this.image != null)
	{
		this.shape = new bpmImageShape(new bpmRectangle(0, 0, this.image.width, this.image.height), this.image.src);
		this.shape.preserveImageAspect = false;
	}
	else
	{
		this.shape = this.createShape(html);
	}
	
	this.initShape(html);
};

bpmHandle.prototype.createShape = function(html)
{
	var bounds = new bpmRectangle(0, 0, bpmConstants.HANDLE_SIZE, bpmConstants.HANDLE_SIZE);
	
	return new bpmRectangleShape(bounds, bpmConstants.HANDLE_FILLCOLOR, bpmConstants.HANDLE_STROKECOLOR);
};

bpmHandle.prototype.initShape = function(html)
{
	if (html && this.shape.isHtmlAllowed())
	{
		this.shape.dialect = bpmConstants.DIALECT_STRICTHTML;
		this.shape.init(this.graph.container);
	}
	else
	{
		this.shape.dialect = (this.graph.dialect != bpmConstants.DIALECT_SVG) ? bpmConstants.DIALECT_MIXEDHTML : bpmConstants.DIALECT_SVG;
		
		if (this.cursor != null)
		{
			this.shape.init(this.graph.getView().getOverlayPane());
		}
	}

	bpmEvent.redirectMouseEvents(this.shape.node, this.graph, this.state);
	this.shape.node.style.cursor = this.cursor;
};

bpmHandle.prototype.redraw = function()
{
	if (this.shape != null && this.state.shape != null)
	{
		var pt = this.getPosition(this.state.getPaintBounds());
		
		if (pt != null)
		{
			var alpha = bpmUtils.toRadians(this.getTotalRotation());
			pt = this.rotatePoint(this.flipPoint(pt), alpha);
	
			var scale = this.graph.view.scale;
			var tr = this.graph.view.translate;
			this.shape.bounds.x = Math.floor((pt.x + tr.x) * scale - this.shape.bounds.width / 2);
			this.shape.bounds.y = Math.floor((pt.y + tr.y) * scale - this.shape.bounds.height / 2);
			
			this.shape.redraw();
		}
	}
};

bpmHandle.prototype.isHtmlRequired = function()
{
	return this.state.text != null && this.state.text.node.parentNode == this.graph.container;
};

bpmHandle.prototype.rotatePoint = function(pt, alpha)
{
	var bounds = this.state.getCellBounds();
	var cx = new bpmPoint(bounds.getCenterX(), bounds.getCenterY());
	var cos = Math.cos(alpha);
	var sin = Math.sin(alpha); 

	return bpmUtils.getRotatedPoint(pt, cos, sin, cx);
};

bpmHandle.prototype.flipPoint = function(pt)
{
	if (this.state.shape != null)
	{
		var bounds = this.state.getCellBounds();
		
		if (this.state.shape.flipH)
		{
			pt.x = 2 * bounds.x + bounds.width - pt.x;
		}
		
		if (this.state.shape.flipV)
		{
			pt.y = 2 * bounds.y + bounds.height - pt.y;
		}
	}
	
	return pt;
};

bpmHandle.prototype.snapPoint = function(pt, ignore)
{
	if (!ignore)
	{
		pt.x = this.graph.snap(pt.x);
		pt.y = this.graph.snap(pt.y);
	}
	
	return pt;
};

bpmHandle.prototype.setVisible = function(visible)
{
	if (this.shape != null && this.shape.node != null)
	{
		this.shape.node.style.display = (visible) ? '' : 'none';
	}
};

bpmHandle.prototype.reset = function()
{
	this.setVisible(true);
	this.state.style = this.graph.getCellStyle(this.state.cell);
	this.positionChanged();
};

bpmHandle.prototype.destroy = function()
{
	if (this.shape != null)
	{
		this.shape.destroy();
		this.shape = null;
	}
};



/* Vertex Handler */

function bpmVertexHandler(state)
{
	if (state != null)
	{
		this.state = state;
		this.init();
		this.escapeHandler = bpmUtils.bind(this, function(sender, evt)
		{
			if (this.livePreview && this.index != null)
			{
				this.state.view.graph.cellRenderer.redraw(this.state, true);
				
				this.state.view.invalidate(this.state.cell);
				this.state.invalid = false;
				this.state.view.validate();
			}
			
			this.reset();
		});
		
		this.state.view.graph.addListener(bpmEvent.ESCAPE, this.escapeHandler);
	}
};

bpmVertexHandler.prototype.graph = null;
bpmVertexHandler.prototype.state = null;
bpmVertexHandler.prototype.singleSizer = false;
bpmVertexHandler.prototype.index = null;
bpmVertexHandler.prototype.allowHandleBoundsCheck = true;
bpmVertexHandler.prototype.handleImage = null;
bpmVertexHandler.prototype.tolerance = 0;
bpmVertexHandler.prototype.rotationEnabled = false;
bpmVertexHandler.prototype.parentHighlightEnabled = false;
bpmVertexHandler.prototype.rotationRaster = true;
bpmVertexHandler.prototype.rotationCursor = 'crosshair';
bpmVertexHandler.prototype.livePreview = false;
bpmVertexHandler.prototype.manageSizers = false;
bpmVertexHandler.prototype.constrainGroupByChildren = false;
bpmVertexHandler.prototype.rotationHandleVSpacing = -16;
bpmVertexHandler.prototype.horizontalOffset = 0;
bpmVertexHandler.prototype.verticalOffset = 0;

bpmVertexHandler.prototype.init = function()
{
	this.graph = this.state.view.graph;
	this.selectionBounds = this.getSelectionBounds(this.state);
	this.bounds = new bpmRectangle(this.selectionBounds.x, this.selectionBounds.y, this.selectionBounds.width, this.selectionBounds.height);
	this.selectionBorder = this.createSelectionShape(this.bounds);
	this.selectionBorder.dialect = (this.graph.dialect != bpmConstants.DIALECT_SVG) ? bpmConstants.DIALECT_VML : bpmConstants.DIALECT_SVG;
	this.selectionBorder.pointerEvents = false;
	this.selectionBorder.rotation = Number(this.state.style[bpmConstants.STYLE_ROTATION] || '0');
	this.selectionBorder.init(this.graph.getView().getOverlayPane());
	bpmEvent.redirectMouseEvents(this.selectionBorder.node, this.graph, this.state);
	
	if (this.graph.isCellMovable(this.state.cell))
	{
		this.selectionBorder.setCursor(bpmConstants.CURSOR_MOVABLE_VERTEX);
	}

	if (bpmGraphHandler.prototype.maxCells <= 0 || this.graph.getSelectionCount() < bpmGraphHandler.prototype.maxCells)
	{
		var resizable = this.graph.isCellResizable(this.state.cell);
		this.sizers = [];

		if (resizable || (this.graph.isLabelMovable(this.state.cell) &&
			this.state.width >= 2 && this.state.height >= 2))
		{
			var i = 0;

			if (resizable)
			{
				if (!this.singleSizer)
				{
					this.sizers.push(this.createSizer('nw-resize', i++));
					this.sizers.push(this.createSizer('n-resize', i++));
					this.sizers.push(this.createSizer('ne-resize', i++));
					this.sizers.push(this.createSizer('w-resize', i++));
					this.sizers.push(this.createSizer('e-resize', i++));
					this.sizers.push(this.createSizer('sw-resize', i++));
					this.sizers.push(this.createSizer('s-resize', i++));
				}
				
				this.sizers.push(this.createSizer('se-resize', i++));
			}
			
			var geo = this.graph.model.getGeometry(this.state.cell);
			
			if (geo != null && !geo.relative && !this.graph.isSwimlane(this.state.cell) &&
				this.graph.isLabelMovable(this.state.cell))
			{
				this.labelShape = this.createSizer(bpmConstants.CURSOR_LABEL_HANDLE, bpmEvent.LABEL_HANDLE, bpmConstants.LABEL_HANDLE_SIZE, bpmConstants.LABEL_HANDLE_FILLCOLOR);
				this.sizers.push(this.labelShape);
			}
		}
		else if (this.graph.isCellMovable(this.state.cell) && !this.graph.isCellResizable(this.state.cell) &&
			this.state.width < 2 && this.state.height < 2)
		{
			this.labelShape = this.createSizer(bpmConstants.CURSOR_MOVABLE_VERTEX,
				bpmEvent.LABEL_HANDLE, null, bpmConstants.LABEL_HANDLE_FILLCOLOR);
			this.sizers.push(this.labelShape);
		}
	}
	
	if (this.isRotationHandleVisible())
	{
		this.rotationShape = this.createSizer(this.rotationCursor, bpmEvent.ROTATION_HANDLE,
			bpmConstants.HANDLE_SIZE + 3, bpmConstants.HANDLE_FILLCOLOR);
		this.sizers.push(this.rotationShape);
	}

	this.customHandles = this.createCustomHandles();
	this.redraw();
	
	if (this.constrainGroupByChildren)
	{
		this.updateMinBounds();
	}
};

bpmVertexHandler.prototype.isRotationHandleVisible = function()
{
	return this.graph.isEnabled() && this.rotationEnabled && this.graph.isCellRotatable(this.state.cell) &&
		(bpmGraphHandler.prototype.maxCells <= 0 || this.graph.getSelectionCount() < bpmGraphHandler.prototype.maxCells) &&
		this.state.width >= 2 && this.state.height >= 2;
};

bpmVertexHandler.prototype.isConstrainedEvent = function(me)
{
	return bpmEvent.isShiftDown(me.getEvent()) || this.state.style[bpmConstants.STYLE_ASPECT] == 'fixed';
};

bpmVertexHandler.prototype.isCenteredEvent = function(state, me)
{
	return false;
};

bpmVertexHandler.prototype.createCustomHandles = function()
{
	return null;
};

bpmVertexHandler.prototype.updateMinBounds = function()
{
	var children = this.graph.getChildCells(this.state.cell);
	
	if (children.length > 0)
	{
		this.minBounds = this.graph.view.getBounds(children);
		
		if (this.minBounds != null)
		{
			var s = this.state.view.scale;
			var t = this.state.view.translate;

			this.minBounds.x -= this.state.x;
			this.minBounds.y -= this.state.y;
			this.minBounds.x /= s;
			this.minBounds.y /= s;
			this.minBounds.width /= s;
			this.minBounds.height /= s;
			this.x0 = this.state.x / s - t.x;
			this.y0 = this.state.y / s - t.y;
		}
	}
};

bpmVertexHandler.prototype.getSelectionBounds = function(state)
{
	return new bpmRectangle(Math.round(state.x), Math.round(state.y), Math.round(state.width), Math.round(state.height));
};

bpmVertexHandler.prototype.createParentHighlightShape = function(bounds)
{
	return this.createSelectionShape(bounds);
};

bpmVertexHandler.prototype.createSelectionShape = function(bounds)
{
	var shape = new bpmRectangleShape(bounds, null, this.getSelectionColor());
	shape.strokewidth = this.getSelectionStrokeWidth();
	shape.isDashed = this.isSelectionDashed();
	
	return shape;
};

bpmVertexHandler.prototype.getSelectionColor = function()
{
	return bpmConstants.VERTEX_SELECTION_COLOR;
};

bpmVertexHandler.prototype.getSelectionStrokeWidth = function()
{
	return bpmConstants.VERTEX_SELECTION_STROKEWIDTH;
};

bpmVertexHandler.prototype.isSelectionDashed = function()
{
	return bpmConstants.VERTEX_SELECTION_DASHED;
};

bpmVertexHandler.prototype.createSizer = function(cursor, index, size, fillColor)
{
	size = size || bpmConstants.HANDLE_SIZE;
	
	var bounds = new bpmRectangle(0, 0, size, size);
	var sizer = this.createSizerShape(bounds, index, fillColor);

	if (sizer.isHtmlAllowed() && this.state.text != null && this.state.text.node.parentNode == this.graph.container)
	{
		sizer.bounds.height -= 1;
		sizer.bounds.width -= 1;
		sizer.dialect = bpmConstants.DIALECT_STRICTHTML;
		sizer.init(this.graph.container);
	}
	else
	{
		sizer.dialect = (this.graph.dialect != bpmConstants.DIALECT_SVG) ?
				bpmConstants.DIALECT_MIXEDHTML : bpmConstants.DIALECT_SVG;
		sizer.init(this.graph.getView().getOverlayPane());
	}

	bpmEvent.redirectMouseEvents(sizer.node, this.graph, this.state);
	
	if (this.graph.isEnabled())
	{
		sizer.setCursor(cursor);
	}
	
	if (!this.isSizerVisible(index))
	{
		sizer.visible = false;
	}
	
	return sizer;
};

bpmVertexHandler.prototype.isSizerVisible = function(index)
{
	return true;
};

bpmVertexHandler.prototype.createSizerShape = function(bounds, index, fillColor)
{
	if (this.handleImage != null)
	{
		bounds = new bpmRectangle(bounds.x, bounds.y, this.handleImage.width, this.handleImage.height);
		var shape = new bpmImageShape(bounds, this.handleImage.src);
		
		shape.preserveImageAspect = false;

		return shape;
	}
	else if (index == bpmEvent.ROTATION_HANDLE)
	{
		return new bpmEllipse(bounds, fillColor || bpmConstants.HANDLE_FILLCOLOR, bpmConstants.HANDLE_STROKECOLOR);
	}
	else
	{
		return new bpmRectangleShape(bounds, fillColor || bpmConstants.HANDLE_FILLCOLOR, bpmConstants.HANDLE_STROKECOLOR);
	}
};

bpmVertexHandler.prototype.moveSizerTo = function(shape, x, y)
{
	if (shape != null)
	{
		shape.bounds.x = Math.floor(x - shape.bounds.width / 2);
		shape.bounds.y = Math.floor(y - shape.bounds.height / 2);
		
		if (shape.node != null && shape.node.style.display != 'none')
		{
			shape.redraw();
		}
	}
};

bpmVertexHandler.prototype.getHandleForEvent = function(me)
{
	var tol = (!bpmEvent.isMouseEvent(me.getEvent())) ? this.tolerance : 1;
	var hit = (this.allowHandleBoundsCheck && (bpmCore.IS_IE || tol > 0)) ?
		new bpmRectangle(me.getGraphX() - tol, me.getGraphY() - tol, 2 * tol, 2 * tol) : null;
	
	function checkShape(shape)
	{
		return shape != null && (me.isSource(shape) || (hit != null && bpmUtils.intersects(shape.bounds, hit) &&
			shape.node.style.display != 'none' && shape.node.style.visibility != 'hidden'));
	}

	if (this.customHandles != null && this.isCustomHandleEvent(me))
	{
		for (var i = this.customHandles.length - 1; i >= 0; i--)
		{
			if (checkShape(this.customHandles[i].shape))
			{
				return bpmEvent.CUSTOM_HANDLE - i;
			}
		}
	}

	if (checkShape(this.rotationShape))
	{
		return bpmEvent.ROTATION_HANDLE;
	}
	else if (checkShape(this.labelShape))
	{
		return bpmEvent.LABEL_HANDLE;
	}
	
	if (this.sizers != null)
	{
		for (var i = 0; i < this.sizers.length; i++)
		{
			if (checkShape(this.sizers[i]))
			{
				return i;
			}
		}
	}

	return null;
};

bpmVertexHandler.prototype.isCustomHandleEvent = function(me)
{
	return true;
};

bpmVertexHandler.prototype.mouseDown = function(sender, me)
{
	var tol = (!bpmEvent.isMouseEvent(me.getEvent())) ? this.tolerance : 0;
	
	if (!me.isConsumed() && this.graph.isEnabled() && (tol > 0 || me.getState() == this.state))
	{
		var handle = this.getHandleForEvent(me);

		if (handle != null)
		{
			this.start(me.getGraphX(), me.getGraphY(), handle);
			me.consume();
		}
	}
};

bpmVertexHandler.prototype.isLivePreviewBorder = function()
{
	return this.state.shape != null && this.state.shape.fill == null && this.state.shape.stroke == null;
};

bpmVertexHandler.prototype.start = function(x, y, index)
{
	if (this.selectionBorder != null)
	{
		this.inTolerance = true;
		this.childOffsetX = 0;
		this.childOffsetY = 0;
		this.index = index;
		this.startX = x;
		this.startY = y;
		
		var model = this.state.view.graph.model;
		var parent = model.getParent(this.state.cell);
		
		if (this.state.view.currentRoot != parent && (model.isVertex(parent) || model.isEdge(parent)))
		{
			this.parentState = this.state.view.graph.view.getState(parent);
		}
		
		this.selectionBorder.node.style.display = (index == bpmEvent.ROTATION_HANDLE) ? 'inline' : 'none';
		
		if (!this.livePreview || this.isLivePreviewBorder())
		{
			this.preview = this.createSelectionShape(this.bounds);
			
			if (!(bpmCore.IS_SVG && Number(this.state.style[bpmConstants.STYLE_ROTATION] || '0') != 0) &&
				this.state.text != null && this.state.text.node.parentNode == this.graph.container)
			{
				this.preview.dialect = bpmConstants.DIALECT_STRICTHTML;
				this.preview.init(this.graph.container);
			}
			else
			{
				this.preview.dialect = (this.graph.dialect != bpmConstants.DIALECT_SVG) ?
						bpmConstants.DIALECT_VML : bpmConstants.DIALECT_SVG;
				this.preview.init(this.graph.view.getOverlayPane());
			}
		}
		
		if (this.livePreview)
		{
			this.hideSizers();
			
			if (index == bpmEvent.ROTATION_HANDLE)
			{
				this.rotationShape.node.style.display = '';
			}
			else if (index == bpmEvent.LABEL_HANDLE)
			{
				this.labelShape.node.style.display = '';
			}
			else if (this.sizers != null && this.sizers[index] != null)
			{
				this.sizers[index].node.style.display = '';
			}
			else if (index <= bpmEvent.CUSTOM_HANDLE && this.customHandles != null)
			{
				this.customHandles[bpmEvent.CUSTOM_HANDLE - index].setVisible(true);
			}
			
			var edges = this.graph.getEdges(this.state.cell);
			this.edgeHandlers = [];
			
			for (var i = 0; i < edges.length; i++)
			{
				var handler = this.graph.selectionCellsHandler.getHandler(edges[i]);
				
				if (handler != null)
				{
					this.edgeHandlers.push(handler);
				}
			}
		}
	}
};

bpmVertexHandler.prototype.setHandlesVisible = function(visible)
{
	if (this.sizers != null)
	{
		for (var i = 0; i < this.sizers.length; i++)
		{
			this.sizers[i].node.style.display = (visible) ? '' : 'none';
		}
	}

	if (this.customHandles != null)
	{
		for (var i = 0; i < this.customHandles.length; i++)
		{
			this.customHandles[i].setVisible(visible);
		}
	}
};

bpmVertexHandler.prototype.hideSizers = function()
{
	this.setHandlesVisible(false);
};

bpmVertexHandler.prototype.checkTolerance = function(me)
{
	if (this.inTolerance && this.startX != null && this.startY != null)
	{
		if (bpmEvent.isMouseEvent(me.getEvent()) ||
			Math.abs(me.getGraphX() - this.startX) > this.graph.tolerance ||
			Math.abs(me.getGraphY() - this.startY) > this.graph.tolerance)
		{
			this.inTolerance = false;
		}
	}
};

bpmVertexHandler.prototype.updateHint = function(me) { };

bpmVertexHandler.prototype.removeHint = function() { };

bpmVertexHandler.prototype.roundAngle = function(angle)
{
	return Math.round(angle * 10) / 10;
};

bpmVertexHandler.prototype.roundLength = function(length)
{
	return Math.round(length);
};

bpmVertexHandler.prototype.mouseMove = function(sender, me)
{
	if (!me.isConsumed() && this.index != null)
	{
		this.checkTolerance(me);

		if (!this.inTolerance)
		{
			if (this.index <= bpmEvent.CUSTOM_HANDLE)
			{
				if (this.customHandles != null)
				{
					this.customHandles[bpmEvent.CUSTOM_HANDLE - this.index].processEvent(me);
					this.customHandles[bpmEvent.CUSTOM_HANDLE - this.index].active = true;
				}
			}
			else if (this.index == bpmEvent.LABEL_HANDLE)
			{
				this.moveLabel(me);
			}
			else if (this.index == bpmEvent.ROTATION_HANDLE)
			{
				this.rotateVertex(me);
			}
			else
			{
				this.resizeVertex(me);
			}

			this.updateHint(me);
		}
		
		me.consume();
	}
	else if (!this.graph.isMouseDown && this.getHandleForEvent(me) != null)
	{
		me.consume(false);
	}
};

bpmVertexHandler.prototype.moveLabel = function(me)
{
	var point = new bpmPoint(me.getGraphX(), me.getGraphY());
	var tr = this.graph.view.translate;
	var scale = this.graph.view.scale;
	
	if (this.graph.isGridEnabledEvent(me.getEvent()))
	{
		point.x = (this.graph.snap(point.x / scale - tr.x) + tr.x) * scale;
		point.y = (this.graph.snap(point.y / scale - tr.y) + tr.y) * scale;
	}

	var index = (this.rotationShape != null) ? this.sizers.length - 2 : this.sizers.length - 1;
	this.moveSizerTo(this.sizers[index], point.x, point.y);
};

bpmVertexHandler.prototype.rotateVertex = function(me)
{
	var point = new bpmPoint(me.getGraphX(), me.getGraphY());
	var dx = this.state.x + this.state.width / 2 - point.x;
	var dy = this.state.y + this.state.height / 2 - point.y;
	this.currentAlpha = (dx != 0) ? Math.atan(dy / dx) * 180 / Math.PI + 90 : ((dy < 0) ? 180 : 0);
	
	if (dx > 0)
	{
		this.currentAlpha -= 180;
	}

	if (this.rotationRaster && this.graph.isGridEnabledEvent(me.getEvent()))
	{
		var dx = point.x - this.state.getCenterX();
		var dy = point.y - this.state.getCenterY();
		var dist = Math.abs(Math.sqrt(dx * dx + dy * dy) - 20) * 3;
		var raster = Math.max(1, 5 * Math.min(3, Math.max(0, Math.round(80 / Math.abs(dist)))));
		
		this.currentAlpha = Math.round(this.currentAlpha / raster) * raster;
	}
	else
	{
		this.currentAlpha = this.roundAngle(this.currentAlpha);
	}

	this.selectionBorder.rotation = this.currentAlpha;
	this.selectionBorder.redraw();
					
	if (this.livePreview)
	{
		this.redrawHandles();
	}
};

bpmVertexHandler.prototype.resizeVertex = function(me)
{
	var ct = new bpmPoint(this.state.getCenterX(), this.state.getCenterY());
	var alpha = bpmUtils.toRadians(this.state.style[bpmConstants.STYLE_ROTATION] || '0');
	var point = new bpmPoint(me.getGraphX(), me.getGraphY());
	var tr = this.graph.view.translate;
	var scale = this.graph.view.scale;
	var cos = Math.cos(-alpha);
	var sin = Math.sin(-alpha);
	
	var dx = point.x - this.startX;
	var dy = point.y - this.startY;

	var tx = cos * dx - sin * dy;
	var ty = sin * dx + cos * dy;
	
	dx = tx;
	dy = ty;

	var geo = this.graph.getCellGeometry(this.state.cell);
	this.unscaledBounds = this.union(geo, dx / scale, dy / scale, this.index,
		this.graph.isGridEnabledEvent(me.getEvent()), 1,
		new bpmPoint(0, 0), this.isConstrainedEvent(me),
		this.isCenteredEvent(this.state, me));
	
	if (!geo.relative)
	{
		var max = this.graph.getMaximumGraphBounds();
		
		if (max != null && this.parentState != null)
		{
			max = bpmRectangle.fromRectangle(max);
			
			max.x -= (this.parentState.x - tr.x * scale) / scale;
			max.y -= (this.parentState.y - tr.y * scale) / scale;
		}
		
		if (this.graph.isConstrainChild(this.state.cell))
		{
			var tmp = this.graph.getCellContainmentArea(this.state.cell);
			
			if (tmp != null)
			{
				var overlap = this.graph.getOverlap(this.state.cell);
				
				if (overlap > 0)
				{
					tmp = bpmRectangle.fromRectangle(tmp);
					
					tmp.x -= tmp.width * overlap;
					tmp.y -= tmp.height * overlap;
					tmp.width += 2 * tmp.width * overlap;
					tmp.height += 2 * tmp.height * overlap;
				}
				
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
			if (this.unscaledBounds.x < max.x)
			{
				this.unscaledBounds.width -= max.x - this.unscaledBounds.x;
				this.unscaledBounds.x = max.x;
			}
			
			if (this.unscaledBounds.y < max.y)
			{
				this.unscaledBounds.height -= max.y - this.unscaledBounds.y;
				this.unscaledBounds.y = max.y;
			}
			
			if (this.unscaledBounds.x + this.unscaledBounds.width > max.x + max.width)
			{
				this.unscaledBounds.width -= this.unscaledBounds.x +
					this.unscaledBounds.width - max.x - max.width;
			}
			
			if (this.unscaledBounds.y + this.unscaledBounds.height > max.y + max.height)
			{
				this.unscaledBounds.height -= this.unscaledBounds.y +
					this.unscaledBounds.height - max.y - max.height;
			}
		}
	}
	
	this.bounds = new bpmRectangle(((this.parentState != null) ? this.parentState.x : tr.x * scale) +
		(this.unscaledBounds.x) * scale, ((this.parentState != null) ? this.parentState.y : tr.y * scale) +
		(this.unscaledBounds.y) * scale, this.unscaledBounds.width * scale, this.unscaledBounds.height * scale);

	if (geo.relative && this.parentState != null)
	{
		this.bounds.x += this.state.x - this.parentState.x;
		this.bounds.y += this.state.y - this.parentState.y;
	}

	cos = Math.cos(alpha);
	sin = Math.sin(alpha);
	
	var c2 = new bpmPoint(this.bounds.getCenterX(), this.bounds.getCenterY());

	var dx = c2.x - ct.x;
	var dy = c2.y - ct.y;
	
	var dx2 = cos * dx - sin * dy;
	var dy2 = sin * dx + cos * dy;
	
	var dx3 = dx2 - dx;
	var dy3 = dy2 - dy;
	
	var dx4 = this.bounds.x - this.state.x;
	var dy4 = this.bounds.y - this.state.y;
	
	var dx5 = cos * dx4 - sin * dy4;
	var dy5 = sin * dx4 + cos * dy4;
	
	this.bounds.x += dx3;
	this.bounds.y += dy3;
	
	this.unscaledBounds.x = this.roundLength(this.unscaledBounds.x + dx3 / scale);
	this.unscaledBounds.y = this.roundLength(this.unscaledBounds.y + dy3 / scale);
	this.unscaledBounds.width = this.roundLength(this.unscaledBounds.width);
	this.unscaledBounds.height = this.roundLength(this.unscaledBounds.height);
	
	if (!this.graph.isCellCollapsed(this.state.cell) && (dx3 != 0 || dy3 != 0))
	{
		this.childOffsetX = this.state.x - this.bounds.x + dx5;
		this.childOffsetY = this.state.y - this.bounds.y + dy5;
	}
	else
	{
		this.childOffsetX = 0;
		this.childOffsetY = 0;
	}
	
	if (this.livePreview)
	{
		this.updateLivePreview(me);
	}
	
	if (this.preview != null)
	{
		this.drawPreview();
	}
};

bpmVertexHandler.prototype.updateLivePreview = function(me)
{
	var scale = this.graph.view.scale;
	var tr = this.graph.view.translate;
	
	var tempState = this.state.clone();

	this.state.x = this.bounds.x;
	this.state.y = this.bounds.y;
	this.state.origin = new bpmPoint(this.state.x / scale - tr.x, this.state.y / scale - tr.y);
	this.state.width = this.bounds.width;
	this.state.height = this.bounds.height;
	
	this.state.unscaledWidth = null;
	
	var off = this.state.absoluteOffset;
	off = new bpmPoint(off.x, off.y);

	this.state.absoluteOffset.x = 0;
	this.state.absoluteOffset.y = 0;
	var geo = this.graph.getCellGeometry(this.state.cell);				

	if (geo != null)
	{
		var offset = geo.offset || this.EMPTY_POINT;

		if (offset != null && !geo.relative)
		{
			this.state.absoluteOffset.x = this.state.view.scale * offset.x;
			this.state.absoluteOffset.y = this.state.view.scale * offset.y;
		}
		
		this.state.view.updateVertexLabelOffset(this.state);
	}
	
	this.state.view.graph.cellRenderer.redraw(this.state, true);
	this.state.view.invalidate(this.state.cell);
	this.state.invalid = false;
	this.state.view.validate();
	this.redrawHandles();

	this.state.setState(tempState);
};

bpmVertexHandler.prototype.mouseUp = function(sender, me)
{
	if (this.index != null && this.state != null)
	{
		var point = new bpmPoint(me.getGraphX(), me.getGraphY());
		var index = this.index;
		this.index = null;

		this.graph.getModel().beginUpdate();
		try
		{
			if (index <= bpmEvent.CUSTOM_HANDLE)
			{
				if (this.customHandles != null)
				{
					this.customHandles[bpmEvent.CUSTOM_HANDLE - index].active = false;
					this.customHandles[bpmEvent.CUSTOM_HANDLE - index].execute();
				}
			}
			else if (index == bpmEvent.ROTATION_HANDLE)
			{
				if (this.currentAlpha != null)
				{
					var delta = this.currentAlpha - (this.state.style[bpmConstants.STYLE_ROTATION] || 0);
					
					if (delta != 0)
					{
						this.rotateCell(this.state.cell, delta);
					}
				}
				else
				{
					this.rotateClick();
				}
			}
			else
			{
				var gridEnabled = this.graph.isGridEnabledEvent(me.getEvent());
				var alpha = bpmUtils.toRadians(this.state.style[bpmConstants.STYLE_ROTATION] || '0');
				var cos = Math.cos(-alpha);
				var sin = Math.sin(-alpha);
				
				var dx = point.x - this.startX;
				var dy = point.y - this.startY;
				
				var tx = cos * dx - sin * dy;
				var ty = sin * dx + cos * dy;
				
				dx = tx;
				dy = ty;
				
				var s = this.graph.view.scale;
				var recurse = this.isRecursiveResize(this.state, me);
				this.resizeCell(this.state.cell, this.roundLength(dx / s), this.roundLength(dy / s),
					index, gridEnabled, this.isConstrainedEvent(me), recurse);
			}
		}
		finally
		{
			this.graph.getModel().endUpdate();
		}

		me.consume();
		this.reset();
	}
};

bpmVertexHandler.prototype.isRecursiveResize = function(state, me)
{
	return this.graph.isRecursiveResize(this.state);
};

bpmVertexHandler.prototype.rotateClick = function() { };

bpmVertexHandler.prototype.rotateCell = function(cell, angle, parent)
{
	if (angle != 0)
	{
		var model = this.graph.getModel();

		if (model.isVertex(cell) || model.isEdge(cell))
		{
			if (!model.isEdge(cell))
			{
				var state = this.graph.view.getState(cell);
				var style = (state != null) ? state.style : this.graph.getCellStyle(cell);
		
				if (style != null)
				{
					var total = (style[bpmConstants.STYLE_ROTATION] || 0) + angle;
					this.graph.setCellStyles(bpmConstants.STYLE_ROTATION, total, [cell]);
				}
			}
			
			var geo = this.graph.getCellGeometry(cell);
			
			if (geo != null)
			{
				var pgeo = this.graph.getCellGeometry(parent);
				
				if (pgeo != null && !model.isEdge(parent))
				{
					geo = geo.clone();
					geo.rotate(angle, new bpmPoint(pgeo.width / 2, pgeo.height / 2));
					model.setGeometry(cell, geo);
				}
				
				if ((model.isVertex(cell) && !geo.relative) || model.isEdge(cell))
				{
					var childCount = model.getChildCount(cell);
					
					for (var i = 0; i < childCount; i++)
					{
						this.rotateCell(model.getChildAt(cell, i), angle, cell);
					}
				}
			}
		}
	}
};

bpmVertexHandler.prototype.reset = function()
{
	if (this.sizers != null && this.index != null && this.sizers[this.index] != null &&
		this.sizers[this.index].node.style.display == 'none')
	{
		this.sizers[this.index].node.style.display = '';
	}

	this.currentAlpha = null;
	this.inTolerance = null;
	this.index = null;

	if (this.preview != null)
	{
		this.preview.destroy();
		this.preview = null;
	}

	if (this.livePreview && this.sizers != null)
	{
		for (var i = 0; i < this.sizers.length; i++)
		{
			if (this.sizers[i] != null)
			{
				this.sizers[i].node.style.display = '';
			}
		}
	}

	if (this.customHandles != null)
	{
		for (var i = 0; i < this.customHandles.length; i++)
		{
			if (this.customHandles[i].active)
			{
				this.customHandles[i].active = false;
				this.customHandles[i].reset();
			}
			else
			{
				this.customHandles[i].setVisible(true);
			}
		}
	}
	
	if (this.selectionBorder != null)
	{
		this.selectionBorder.node.style.display = 'inline';
		this.selectionBounds = this.getSelectionBounds(this.state);
		this.bounds = new bpmRectangle(this.selectionBounds.x, this.selectionBounds.y,
			this.selectionBounds.width, this.selectionBounds.height);
		this.drawPreview();
	}

	this.removeHint();
	this.redrawHandles();
	this.edgeHandlers = null;
	this.unscaledBounds = null;
};

bpmVertexHandler.prototype.resizeCell = function(cell, dx, dy, index, gridEnabled, constrained, recurse)
{
	var geo = this.graph.model.getGeometry(cell);
	
	if (geo != null)
	{
		if (index == bpmEvent.LABEL_HANDLE)
		{
			var scale = this.graph.view.scale;
			dx = Math.round((this.labelShape.bounds.getCenterX() - this.startX) / scale);
			dy = Math.round((this.labelShape.bounds.getCenterY() - this.startY) / scale);
			
			geo = geo.clone();
			
			if (geo.offset == null)
			{
				geo.offset = new bpmPoint(dx, dy);
			}
			else
			{
				geo.offset.x += dx;
				geo.offset.y += dy;
			}
			
			this.graph.model.setGeometry(cell, geo);
		}
		else if (this.unscaledBounds != null)
		{
			var scale = this.graph.view.scale;

			if (this.childOffsetX != 0 || this.childOffsetY != 0)
			{
				this.moveChildren(cell, Math.round(this.childOffsetX / scale), Math.round(this.childOffsetY / scale));
			}

			this.graph.resizeCell(cell, this.unscaledBounds, recurse);
		}
	}
};

bpmVertexHandler.prototype.moveChildren = function(cell, dx, dy)
{
	var model = this.graph.getModel();
	var childCount = model.getChildCount(cell);
	
	for (var i = 0; i < childCount; i++)
	{
		var child = model.getChildAt(cell, i);
		var geo = this.graph.getCellGeometry(child);
		
		if (geo != null)
		{
			geo = geo.clone();
			geo.translate(dx, dy);
			model.setGeometry(child, geo);
		}
	}
};

bpmVertexHandler.prototype.union = function(bounds, dx, dy, index, gridEnabled, scale, tr, constrained, centered)
{
	if (this.singleSizer)
	{
		var x = bounds.x + bounds.width + dx;
		var y = bounds.y + bounds.height + dy;
		
		if (gridEnabled)
		{
			x = this.graph.snap(x / scale) * scale;
			y = this.graph.snap(y / scale) * scale;
		}
		
		var rect = new bpmRectangle(bounds.x, bounds.y, 0, 0);
		rect.add(new bpmRectangle(x, y, 0, 0));
		
		return rect;
	}
	else
	{
		var w0 = bounds.width;
		var h0 = bounds.height;
		var left = bounds.x - tr.x * scale;
		var right = left + w0;
		var top = bounds.y - tr.y * scale;
		var bottom = top + h0;
		
		var cx = left + w0 / 2;
		var cy = top + h0 / 2;
		
		if (index > 4 /* Bottom Row */)
		{
			bottom = bottom + dy;
			
			if (gridEnabled)
			{
				bottom = this.graph.snap(bottom / scale) * scale;
			}
		}
		else if (index < 3 /* Top Row */)
		{
			top = top + dy;
			
			if (gridEnabled)
			{
				top = this.graph.snap(top / scale) * scale;
			}
		}
		
		if (index == 0 || index == 3 || index == 5 /* Left */)
		{
			left += dx;
			
			if (gridEnabled)
			{
				left = this.graph.snap(left / scale) * scale;
			}
		}
		else if (index == 2 || index == 4 || index == 7 /* Right */)
		{
			right += dx;
			
			if (gridEnabled)
			{
				right = this.graph.snap(right / scale) * scale;
			}
		}
		
		var width = right - left;
		var height = bottom - top;

		if (constrained)
		{
			var geo = this.graph.getCellGeometry(this.state.cell);

			if (geo != null)
			{
				var aspect = geo.width / geo.height;
				
				if (index== 1 || index== 2 || index == 7 || index == 6)
				{
					width = height * aspect;
				}
				else
				{
					height = width / aspect;
				}
				
				if (index == 0)
				{
					left = right - width;
					top = bottom - height;
				}
			}
		}

		if (centered)
		{
			width += (width - w0);
			height += (height - h0);
			
			var cdx = cx - (left + width / 2);
			var cdy = cy - (top + height / 2);

			left += cdx;
			top += cdy;
			right += cdx;
			bottom += cdy;
		}

		// Flips over left side
		if (width < 0)
		{
			left += width;
			width = Math.abs(width);
		}
		
		// Flips over top side
		if (height < 0)
		{
			top += height;
			height = Math.abs(height);
		}

		var result = new bpmRectangle(left + tr.x * scale, top + tr.y * scale, width, height);
		
		if (this.minBounds != null)
		{
			result.width = Math.max(result.width, this.minBounds.x * scale + this.minBounds.width * scale +
				Math.max(0, this.x0 * scale - result.x));
			result.height = Math.max(result.height, this.minBounds.y * scale + this.minBounds.height * scale +
				Math.max(0, this.y0 * scale - result.y));
		}
		
		return result;
	}
};

bpmVertexHandler.prototype.redraw = function()
{
	this.selectionBounds = this.getSelectionBounds(this.state);
	this.bounds = new bpmRectangle(this.selectionBounds.x, this.selectionBounds.y, this.selectionBounds.width, this.selectionBounds.height);
	
	this.redrawHandles();
	this.drawPreview();
};

bpmVertexHandler.prototype.getHandlePadding = function()
{
	var result = new bpmPoint(0, 0);
	var tol = this.tolerance;

	if (this.sizers != null && this.sizers.length > 0 && this.sizers[0] != null &&
		(this.bounds.width < 2 * this.sizers[0].bounds.width + 2 * tol ||
		this.bounds.height < 2 * this.sizers[0].bounds.height + 2 * tol))
	{
		tol /= 2;
		
		result.x = this.sizers[0].bounds.width + tol;
		result.y = this.sizers[0].bounds.height + tol;
	}
	
	return result;
};

bpmVertexHandler.prototype.redrawHandles = function()
{
	var tol = this.tolerance;
	this.horizontalOffset = 0;
	this.verticalOffset = 0;
	var s = this.bounds;

	if (this.sizers != null && this.sizers.length > 0 && this.sizers[0] != null)
	{
		if (this.index == null && this.manageSizers && this.sizers.length >= 8)
		{
			var padding = this.getHandlePadding();
			this.horizontalOffset = padding.x;
			this.verticalOffset = padding.y;
			
			if (this.horizontalOffset != 0 || this.verticalOffset != 0)
			{
				s = new bpmRectangle(s.x, s.y, s.width, s.height);

				s.x -= this.horizontalOffset / 2;
				s.width += this.horizontalOffset;
				s.y -= this.verticalOffset / 2;
				s.height += this.verticalOffset;
			}
			
			if (this.sizers.length >= 8)
			{
				if ((s.width < 2 * this.sizers[0].bounds.width + 2 * tol) ||
					(s.height < 2 * this.sizers[0].bounds.height + 2 * tol))
				{
					this.sizers[0].node.style.display = 'none';
					this.sizers[2].node.style.display = 'none';
					this.sizers[5].node.style.display = 'none';
					this.sizers[7].node.style.display = 'none';
				}
				else
				{
					this.sizers[0].node.style.display = '';
					this.sizers[2].node.style.display = '';
					this.sizers[5].node.style.display = '';
					this.sizers[7].node.style.display = '';
				}
			}
		}

		var r = s.x + s.width;
		var b = s.y + s.height;
		
		if (this.singleSizer)
		{
			this.moveSizerTo(this.sizers[0], r, b);
		}
		else
		{
			var cx = s.x + s.width / 2;
			var cy = s.y + s.height / 2;
			
			if (this.sizers.length >= 8)
			{
				var crs = ['nw-resize', 'n-resize', 'ne-resize', 'e-resize', 'se-resize', 's-resize', 'sw-resize', 'w-resize'];
				
				var alpha = bpmUtils.toRadians(this.state.style[bpmConstants.STYLE_ROTATION] || '0');
				var cos = Math.cos(alpha);
				var sin = Math.sin(alpha);
				
				var da = Math.round(alpha * 4 / Math.PI);
				
				var ct = new bpmPoint(s.getCenterX(), s.getCenterY());
				var pt = bpmUtils.getRotatedPoint(new bpmPoint(s.x, s.y), cos, sin, ct);
				
				this.moveSizerTo(this.sizers[0], pt.x, pt.y);
				this.sizers[0].setCursor(crs[bpmUtils.mod(0 + da, crs.length)]);
				
				pt.x = cx;
				pt.y = s.y;
				pt = bpmUtils.getRotatedPoint(pt, cos, sin, ct);
				
				this.moveSizerTo(this.sizers[1], pt.x, pt.y);
				this.sizers[1].setCursor(crs[bpmUtils.mod(1 + da, crs.length)]);
				
				pt.x = r;
				pt.y = s.y;
				pt = bpmUtils.getRotatedPoint(pt, cos, sin, ct);
				
				this.moveSizerTo(this.sizers[2], pt.x, pt.y);
				this.sizers[2].setCursor(crs[bpmUtils.mod(2 + da, crs.length)]);
				
				pt.x = s.x;
				pt.y = cy;
				pt = bpmUtils.getRotatedPoint(pt, cos, sin, ct);
				
				this.moveSizerTo(this.sizers[3], pt.x, pt.y);
				this.sizers[3].setCursor(crs[bpmUtils.mod(7 + da, crs.length)]);

				pt.x = r;
				pt.y = cy;
				pt = bpmUtils.getRotatedPoint(pt, cos, sin, ct);
				
				this.moveSizerTo(this.sizers[4], pt.x, pt.y);
				this.sizers[4].setCursor(crs[bpmUtils.mod(3 + da, crs.length)]);

				pt.x = s.x;
				pt.y = b;
				pt = bpmUtils.getRotatedPoint(pt, cos, sin, ct);
				
				this.moveSizerTo(this.sizers[5], pt.x, pt.y);
				this.sizers[5].setCursor(crs[bpmUtils.mod(6 + da, crs.length)]);

				pt.x = cx;
				pt.y = b;
				pt = bpmUtils.getRotatedPoint(pt, cos, sin, ct);
				
				this.moveSizerTo(this.sizers[6], pt.x, pt.y);
				this.sizers[6].setCursor(crs[bpmUtils.mod(5 + da, crs.length)]);

				pt.x = r;
				pt.y = b;
				pt = bpmUtils.getRotatedPoint(pt, cos, sin, ct);
				
				this.moveSizerTo(this.sizers[7], pt.x, pt.y);
				this.sizers[7].setCursor(crs[bpmUtils.mod(4 + da, crs.length)]);
				
				this.moveSizerTo(this.sizers[8], cx + this.state.absoluteOffset.x, cy + this.state.absoluteOffset.y);
			}
			else if (this.state.width >= 2 && this.state.height >= 2)
			{
				this.moveSizerTo(this.sizers[0], cx + this.state.absoluteOffset.x, cy + this.state.absoluteOffset.y);
			}
			else
			{
				this.moveSizerTo(this.sizers[0], this.state.x, this.state.y);
			}
		}
	}

	if (this.rotationShape != null)
	{
		var alpha = bpmUtils.toRadians((this.currentAlpha != null) ? this.currentAlpha : this.state.style[bpmConstants.STYLE_ROTATION] || '0');
		var cos = Math.cos(alpha);
		var sin = Math.sin(alpha);
		
		var ct = new bpmPoint(this.state.getCenterX(), this.state.getCenterY());
		var pt = bpmUtils.getRotatedPoint(this.getRotationHandlePosition(), cos, sin, ct);

		if (this.rotationShape.node != null)
		{
			this.moveSizerTo(this.rotationShape, pt.x, pt.y);
			this.rotationShape.node.style.visibility = (this.state.view.graph.isEditing()) ? 'hidden' : '';
		}
	}
	
	if (this.selectionBorder != null)
	{
		this.selectionBorder.rotation = Number(this.state.style[bpmConstants.STYLE_ROTATION] || '0');
	}
	
	if (this.edgeHandlers != null)
	{		
		for (var i = 0; i < this.edgeHandlers.length; i++)
		{
			this.edgeHandlers[i].redraw();
		}
	}

	if (this.customHandles != null)
	{
		for (var i = 0; i < this.customHandles.length; i++)
		{
			var temp = this.customHandles[i].shape.node.style.display;
			this.customHandles[i].redraw();
			this.customHandles[i].shape.node.style.display = temp;
			this.customHandles[i].shape.node.style.visibility = (this.graph.isEditing()) ? 'hidden' : '';
		}
	}

	this.updateParentHighlight();
};

bpmVertexHandler.prototype.getRotationHandlePosition = function()
{
	return new bpmPoint(this.bounds.x + this.bounds.width / 2, this.bounds.y + this.rotationHandleVSpacing)
};

bpmVertexHandler.prototype.updateParentHighlight = function()
{
	if (this.selectionBorder != null)
	{
		if (this.parentHighlight != null)
		{
			var parent = this.graph.model.getParent(this.state.cell);
	
			if (this.graph.model.isVertex(parent))
			{
				var pstate = this.graph.view.getState(parent);
				var b = this.parentHighlight.bounds;
				
				if (pstate != null && (b.x != pstate.x || b.y != pstate.y ||
					b.width != pstate.width || b.height != pstate.height))
				{
					this.parentHighlight.bounds = pstate;
					this.parentHighlight.redraw();
				}
			}
			else
			{
				this.parentHighlight.destroy();
				this.parentHighlight = null;
			}
		}
		else if (this.parentHighlightEnabled)
		{
			var parent = this.graph.model.getParent(this.state.cell);
			
			if (this.graph.model.isVertex(parent))
			{
				var pstate = this.graph.view.getState(parent);
				
				if (pstate != null)
				{
					this.parentHighlight = this.createParentHighlightShape(pstate);
					this.parentHighlight.dialect = (this.graph.dialect != bpmConstants.DIALECT_SVG) ? bpmConstants.DIALECT_VML : bpmConstants.DIALECT_SVG;
					this.parentHighlight.pointerEvents = false;
					this.parentHighlight.rotation = Number(pstate.style[bpmConstants.STYLE_ROTATION] || '0');
					this.parentHighlight.init(this.graph.getView().getOverlayPane());
				}
			}
		}
	}
};

bpmVertexHandler.prototype.drawPreview = function()
{
	if (this.preview != null)
	{
		this.preview.bounds = this.bounds;
		
		if (this.preview.node.parentNode == this.graph.container)
		{
			this.preview.bounds.width = Math.max(0, this.preview.bounds.width - 1);
			this.preview.bounds.height = Math.max(0, this.preview.bounds.height - 1);
		}
	
		this.preview.rotation = Number(this.state.style[bpmConstants.STYLE_ROTATION] || '0');
		this.preview.redraw();
	}
	
	this.selectionBorder.bounds = this.bounds;
	this.selectionBorder.redraw();
	
	if (this.parentHighlight != null)
	{
		this.parentHighlight.redraw();
	}
};

bpmVertexHandler.prototype.destroy = function()
{
	if (this.escapeHandler != null)
	{
		this.state.view.graph.removeListener(this.escapeHandler);
		this.escapeHandler = null;
	}
	
	if (this.preview != null)
	{
		this.preview.destroy();
		this.preview = null;
	}
	
	if (this.parentHighlight != null)
	{
		this.parentHighlight.destroy();
		this.parentHighlight = null;
	}
	
	if (this.selectionBorder != null)
	{
		this.selectionBorder.destroy();
		this.selectionBorder = null;
	}
	
	this.labelShape = null;
	this.removeHint();

	if (this.sizers != null)
	{
		for (var i = 0; i < this.sizers.length; i++)
		{
			this.sizers[i].destroy();
		}
		
		this.sizers = null;
	}

	if (this.customHandles != null)
	{
		for (var i = 0; i < this.customHandles.length; i++)
		{
			this.customHandles[i].destroy();
		}
		
		this.customHandles = null;
	}
};



/* Edge Handler */
function bpmEdgeHandler(state)
{
	if (state != null)
	{
		this.state = state;
		this.init();
		
		this.escapeHandler = bpmUtils.bind(this, function(sender, evt)
		{
			var dirty = this.index != null;
			this.reset();
			
			if (dirty)
			{
				this.graph.cellRenderer.redraw(this.state, false, state.view.isRendering());
			}
		});
		
		this.state.view.graph.addListener(bpmEvent.ESCAPE, this.escapeHandler);
	}
};

bpmEdgeHandler.prototype.graph = null;
bpmEdgeHandler.prototype.state = null;
bpmEdgeHandler.prototype.marker = null;
bpmEdgeHandler.prototype.constraintHandler = null;
bpmEdgeHandler.prototype.error = null;
bpmEdgeHandler.prototype.shape = null;
bpmEdgeHandler.prototype.bends = null;
bpmEdgeHandler.prototype.labelShape = null;
bpmEdgeHandler.prototype.cloneEnabled = true;
bpmEdgeHandler.prototype.addEnabled = false;
bpmEdgeHandler.prototype.removeEnabled = false;
bpmEdgeHandler.prototype.dblClickRemoveEnabled = false;
bpmEdgeHandler.prototype.mergeRemoveEnabled = false;
bpmEdgeHandler.prototype.straightRemoveEnabled = false;
bpmEdgeHandler.prototype.virtualBendsEnabled = false;
bpmEdgeHandler.prototype.virtualBendOpacity = 20;
bpmEdgeHandler.prototype.parentHighlightEnabled = false;
bpmEdgeHandler.prototype.preferHtml = false;
bpmEdgeHandler.prototype.allowHandleBoundsCheck = true;
bpmEdgeHandler.prototype.snapToTerminals = false;
bpmEdgeHandler.prototype.handleImage = null;
bpmEdgeHandler.prototype.tolerance = 0;
bpmEdgeHandler.prototype.outlineConnect = false;
bpmEdgeHandler.prototype.manageLabelHandle = false;

bpmEdgeHandler.prototype.init = function()
{
	this.graph = this.state.view.graph;
	this.marker = this.createMarker();
	this.constraintHandler = new bpmConstraintHandler(this.graph);
	this.points = [];
	this.abspoints = this.getSelectionPoints(this.state);
	this.shape = this.createSelectionShape(this.abspoints);
	this.shape.dialect = (this.graph.dialect != bpmConstants.DIALECT_SVG) ?
		bpmConstants.DIALECT_MIXEDHTML : bpmConstants.DIALECT_SVG;
	this.shape.init(this.graph.getView().getOverlayPane());
	this.shape.pointerEvents = false;
	this.shape.setCursor(bpmConstants.CURSOR_MOVABLE_EDGE);
	bpmEvent.redirectMouseEvents(this.shape.node, this.graph, this.state);

	this.preferHtml = this.state.text != null &&
		this.state.text.node.parentNode == this.graph.container;
	
	if (!this.preferHtml)
	{
		var sourceState = this.state.getVisibleTerminalState(true);
		
		if (sourceState != null)
		{
			this.preferHtml = sourceState.text != null &&
				sourceState.text.node.parentNode == this.graph.container;
		}
		
		if (!this.preferHtml)
		{
			var targetState = this.state.getVisibleTerminalState(false);
			
			if (targetState != null)
			{
				this.preferHtml = targetState.text != null &&
				targetState.text.node.parentNode == this.graph.container;
			}
		}
	}
	
	if (this.parentHighlightEnabled)
	{
		var parent = this.graph.model.getParent(this.state.cell);
		
		if (this.graph.model.isVertex(parent))
		{
			var pstate = this.graph.view.getState(parent);
			
			if (pstate != null)
			{
				this.parentHighlight = this.createParentHighlightShape(pstate);
				this.parentHighlight.dialect = (this.graph.dialect != bpmConstants.DIALECT_SVG) ? bpmConstants.DIALECT_VML : bpmConstants.DIALECT_SVG;
				this.parentHighlight.pointerEvents = false;
				this.parentHighlight.rotation = Number(pstate.style[bpmConstants.STYLE_ROTATION] || '0');
				this.parentHighlight.init(this.graph.getView().getOverlayPane());
			}
		}
	}
	
	if (this.graph.getSelectionCount() < bpmGraphHandler.prototype.maxCells ||
		bpmGraphHandler.prototype.maxCells <= 0)
	{
		this.bends = this.createBends();

		if (this.isVirtualBendsEnabled())
		{
			this.virtualBends = this.createVirtualBends();
		}
	}

	this.label = new bpmPoint(this.state.absoluteOffset.x, this.state.absoluteOffset.y);
	this.labelShape = this.createLabelHandleShape();
	this.initBend(this.labelShape);
	this.labelShape.setCursor(bpmConstants.CURSOR_LABEL_HANDLE);
	
	this.customHandles = this.createCustomHandles();
	
	this.redraw();
};

bpmEdgeHandler.prototype.createCustomHandles = function()
{
	return null;
};

bpmEdgeHandler.prototype.isVirtualBendsEnabled = function(evt)
{
	return this.virtualBendsEnabled && (this.state.style[bpmConstants.STYLE_EDGE] == null ||
			this.state.style[bpmConstants.STYLE_EDGE] == bpmConstants.NONE ||
			this.state.style[bpmConstants.STYLE_NOEDGESTYLE] == 1)  &&
			bpmUtils.getValue(this.state.style, bpmConstants.STYLE_SHAPE, null) != 'arrow';
};

bpmEdgeHandler.prototype.isAddPointEvent = function(evt)
{
	return bpmEvent.isShiftDown(evt);
};

bpmEdgeHandler.prototype.isRemovePointEvent = function(evt)
{
	return bpmEvent.isShiftDown(evt);
};

bpmEdgeHandler.prototype.getSelectionPoints = function(state)
{
	return state.absolutePoints;
};

bpmEdgeHandler.prototype.createParentHighlightShape = function(bounds)
{
	var shape = new bpmRectangleShape(bounds, null, this.getSelectionColor());
	shape.strokewidth = this.getSelectionStrokeWidth();
	shape.isDashed = this.isSelectionDashed();
	
	return shape;
};

bpmEdgeHandler.prototype.createSelectionShape = function(points)
{
	var shape = new this.state.shape.constructor();
	shape.outline = true;
	shape.apply(this.state);
	
	shape.isDashed = this.isSelectionDashed();
	shape.stroke = this.getSelectionColor();
	shape.isShadow = false;
	
	return shape;
};

bpmEdgeHandler.prototype.getSelectionColor = function()
{
	return bpmConstants.EDGE_SELECTION_COLOR;
};

bpmEdgeHandler.prototype.getSelectionStrokeWidth = function()
{
	return bpmConstants.EDGE_SELECTION_STROKEWIDTH;
};

bpmEdgeHandler.prototype.isSelectionDashed = function()
{
	return bpmConstants.EDGE_SELECTION_DASHED;
};

bpmEdgeHandler.prototype.isConnectableCell = function(cell)
{
	return true;
};

bpmEdgeHandler.prototype.getCellAt = function(x, y)
{
	return (!this.outlineConnect) ? this.graph.getCellAt(x, y) : null;
};

bpmEdgeHandler.prototype.createMarker = function()
{
	var marker = new bpmCellMarker(this.graph);
	var self = this;
	marker.getCell = function(me)
	{
		var cell = bpmCellMarker.prototype.getCell.apply(this, arguments);

		if ((cell == self.state.cell || cell == null) && self.currentPoint != null)
		{
			cell = self.graph.getCellAt(self.currentPoint.x, self.currentPoint.y);
		}
		
		if (cell != null && !this.graph.isCellConnectable(cell))
		{
			var parent = this.graph.getModel().getParent(cell);
			
			if (this.graph.getModel().isVertex(parent) && this.graph.isCellConnectable(parent))
			{
				cell = parent;
			}
		}
		
		var model = self.graph.getModel();
		
		if ((this.graph.isSwimlane(cell) && self.currentPoint != null &&
			this.graph.hitsSwimlaneContent(cell, self.currentPoint.x, self.currentPoint.y)) ||
			(!self.isConnectableCell(cell)) || (cell == self.state.cell ||
			(cell != null && !self.graph.connectableEdges && model.isEdge(cell))) ||
			model.isAncestor(self.state.cell, cell))
		{
			cell = null;
		}
		
		if (!this.graph.isCellConnectable(cell))
		{
			cell = null;
		}
		
		return cell;
	};

	marker.isValidState = function(state)
	{
		var model = self.graph.getModel();
		var other = self.graph.view.getTerminalPort(state,
			self.graph.view.getState(model.getTerminal(self.state.cell,
			!self.isSource)), !self.isSource);
		var otherCell = (other != null) ? other.cell : null;
		var source = (self.isSource) ? state.cell : otherCell;
		var target = (self.isSource) ? otherCell : state.cell;
		
		self.error = self.validateConnection(source, target);

		return self.error == null;
	};
	
	return marker;
};

bpmEdgeHandler.prototype.validateConnection = function(source, target)
{
	return this.graph.getEdgeValidationError(this.state.cell, source, target);
};

bpmEdgeHandler.prototype.createBends = function()
{
	var cell = this.state.cell;
	var bends = [];

	for (var i = 0; i < this.abspoints.length; i++)
	{
		if (this.isHandleVisible(i))
		{
			var source = i == 0;
			var target = i == this.abspoints.length - 1;
			var terminal = source || target;

			if (terminal || this.graph.isCellBendable(cell))
			{
				(bpmUtils.bind(this, function(index)
				{
					var bend = this.createHandleShape(index);
					this.initBend(bend, bpmUtils.bind(this, bpmUtils.bind(this, function()
					{
						if (this.dblClickRemoveEnabled)
						{
							this.removePoint(this.state, index);
						}
					})));
	
					if (this.isHandleEnabled(i))
					{
						bend.setCursor((terminal) ? bpmConstants.CURSOR_TERMINAL_HANDLE : bpmConstants.CURSOR_BEND_HANDLE);
					}
					
					bends.push(bend);
				
					if (!terminal)
					{
						this.points.push(new bpmPoint(0,0));
						bend.node.style.visibility = 'hidden';
					}
				}))(i);
			}
		}
	}

	return bends;
};

bpmEdgeHandler.prototype.createVirtualBends = function()
{
	var cell = this.state.cell;
	var last = this.abspoints[0];
	var bends = [];

	if (this.graph.isCellBendable(cell))
	{
		for (var i = 1; i < this.abspoints.length; i++)
		{
			(bpmUtils.bind(this, function(bend)
			{
				this.initBend(bend);
				bend.setCursor(bpmConstants.CURSOR_VIRTUAL_BEND_HANDLE);
				bends.push(bend);
			}))(this.createHandleShape());
		}
	}

	return bends;
};

bpmEdgeHandler.prototype.isHandleEnabled = function(index)
{
	return true;
};

bpmEdgeHandler.prototype.isHandleVisible = function(index)
{
	var source = this.state.getVisibleTerminalState(true);
	var target = this.state.getVisibleTerminalState(false);
	var geo = this.graph.getCellGeometry(this.state.cell);
	var edgeStyle = (geo != null) ? this.graph.view.getEdgeStyle(this.state, geo.points, source, target) : null;

	return edgeStyle != bpmEdgeStyle.EntityRelation || index == 0 || index == this.abspoints.length - 1;
};

bpmEdgeHandler.prototype.createHandleShape = function(index)
{
	if (this.handleImage != null)
	{
		var shape = new bpmImageShape(new bpmRectangle(0, 0, this.handleImage.width, this.handleImage.height), this.handleImage.src);
		
		shape.preserveImageAspect = false;

		return shape;
	}
	else
	{
		var s = bpmConstants.HANDLE_SIZE;
		
		if (this.preferHtml)
		{
			s -= 1;
		}
		
		return new bpmRectangleShape(new bpmRectangle(0, 0, s, s), bpmConstants.HANDLE_FILLCOLOR, bpmConstants.HANDLE_STROKECOLOR);
	}
};

bpmEdgeHandler.prototype.createLabelHandleShape = function()
{
	if (this.labelHandleImage != null)
	{
		var shape = new bpmImageShape(new bpmRectangle(0, 0, this.labelHandleImage.width, this.labelHandleImage.height), this.labelHandleImage.src);
		
		shape.preserveImageAspect = false;

		return shape;
	}
	else
	{
		var s = bpmConstants.LABEL_HANDLE_SIZE;
		return new bpmRectangleShape(new bpmRectangle(0, 0, s, s), bpmConstants.LABEL_HANDLE_FILLCOLOR, bpmConstants.HANDLE_STROKECOLOR);
	}
};

bpmEdgeHandler.prototype.initBend = function(bend, dblClick)
{
	if (this.preferHtml)
	{
		bend.dialect = bpmConstants.DIALECT_STRICTHTML;
		bend.init(this.graph.container);
	}
	else
	{
		bend.dialect = (this.graph.dialect != bpmConstants.DIALECT_SVG) ?
			bpmConstants.DIALECT_MIXEDHTML : bpmConstants.DIALECT_SVG;
		bend.init(this.graph.getView().getOverlayPane());
	}

	bpmEvent.redirectMouseEvents(bend.node, this.graph, this.state,
			null, null, null, dblClick);
	
	if (bpmCore.IS_QUIRKS || document.documentMode == 8)
	{
		bpmEvent.addListener(bend.node, 'dragstart', function(evt)
		{
			bpmEvent.consume(evt);
			
			return false;
		});
	}
	
	if (bpmCore.IS_TOUCH)
	{
		bend.node.setAttribute('pointer-events', 'none');
	}
};

bpmEdgeHandler.prototype.getHandleForEvent = function(me)
{
	var tol = (!bpmEvent.isMouseEvent(me.getEvent())) ? this.tolerance : 1;
	var hit = (this.allowHandleBoundsCheck && (bpmCore.IS_IE || tol > 0)) ?
		new bpmRectangle(me.getGraphX() - tol, me.getGraphY() - tol, 2 * tol, 2 * tol) : null;
	var minDistSq = null;
	var result = null;

	function checkShape(shape)
	{
		if (shape != null && shape.node.style.display != 'none' && shape.node.style.visibility != 'hidden' &&
			(me.isSource(shape) || (hit != null && bpmUtils.intersects(shape.bounds, hit))))
		{
			var dx = me.getGraphX() - shape.bounds.getCenterX();
			var dy = me.getGraphY() - shape.bounds.getCenterY();
			var tmp = dx * dx + dy * dy;
			
			if (minDistSq == null || tmp <= minDistSq)
			{
				minDistSq = tmp;
			
				return true;
			}
		}
		
		return false;
	}
	
	if (this.customHandles != null && this.isCustomHandleEvent(me))
	{
		for (var i = this.customHandles.length - 1; i >= 0; i--)
		{
			if (checkShape(this.customHandles[i].shape))
			{
				return bpmEvent.CUSTOM_HANDLE - i;
			}
		}
	}

	if (me.isSource(this.state.text) || checkShape(this.labelShape))
	{
		result = bpmEvent.LABEL_HANDLE;
	}
	
	if (this.bends != null)
	{
		for (var i = 0; i < this.bends.length; i++)
		{
			if (checkShape(this.bends[i]))
			{
				result = i;
			}
		}
	}
	
	if (this.virtualBends != null && this.isAddVirtualBendEvent(me))
	{
		for (var i = 0; i < this.virtualBends.length; i++)
		{
			if (checkShape(this.virtualBends[i]))
			{
				result = bpmEvent.VIRTUAL_HANDLE - i;
			}
		}
	}

	return result;
};

bpmEdgeHandler.prototype.isAddVirtualBendEvent = function(me)
{
	return true;
};

bpmEdgeHandler.prototype.isCustomHandleEvent = function(me)
{
	return true;
};

bpmEdgeHandler.prototype.mouseDown = function(sender, me)
{
	var handle = this.getHandleForEvent(me);
	
	if (this.bends != null && this.bends[handle] != null)
	{
		var b = this.bends[handle].bounds;
		this.snapPoint = new bpmPoint(b.getCenterX(), b.getCenterY());
	}
	
	if (this.addEnabled && handle == null && this.isAddPointEvent(me.getEvent()))
	{
		this.addPoint(this.state, me.getEvent());
		me.consume();
	}
	else if (handle != null && !me.isConsumed() && this.graph.isEnabled())
	{
		if (this.removeEnabled && this.isRemovePointEvent(me.getEvent()))
		{
			this.removePoint(this.state, handle);
		}
		else if (handle != bpmEvent.LABEL_HANDLE || this.graph.isLabelMovable(me.getCell()))
		{
			if (handle <= bpmEvent.VIRTUAL_HANDLE)
			{
				bpmUtils.setOpacity(this.virtualBends[bpmEvent.VIRTUAL_HANDLE - handle].node, 100);
			}
			
			this.start(me.getX(), me.getY(), handle);
		}
		
		me.consume();
	}
};

bpmEdgeHandler.prototype.start = function(x, y, index)
{
	this.startX = x;
	this.startY = y;

	this.isSource = (this.bends == null) ? false : index == 0;
	this.isTarget = (this.bends == null) ? false : index == this.bends.length - 1;
	this.isLabel = index == bpmEvent.LABEL_HANDLE;

	if (this.isSource || this.isTarget)
	{
		var cell = this.state.cell;
		var terminal = this.graph.model.getTerminal(cell, this.isSource);

		if ((terminal == null && this.graph.isTerminalPointMovable(cell, this.isSource)) ||
			(terminal != null && this.graph.isCellDisconnectable(cell, terminal, this.isSource)))
		{
			this.index = index;
		}
	}
	else
	{
		this.index = index;
	}
	
	if (this.index <= bpmEvent.CUSTOM_HANDLE && this.index > bpmEvent.VIRTUAL_HANDLE)
	{
		if (this.customHandles != null)
		{
			for (var i = 0; i < this.customHandles.length; i++)
			{
				if (i != bpmEvent.CUSTOM_HANDLE - this.index)
				{
					this.customHandles[i].setVisible(false);
				}
			}
		}
	}
};

bpmEdgeHandler.prototype.clonePreviewState = function(point, terminal)
{
	return this.state.clone();
};

bpmEdgeHandler.prototype.getSnapToTerminalTolerance = function()
{
	return this.graph.gridSize * this.graph.view.scale / 2;
};

bpmEdgeHandler.prototype.updateHint = function(me, point) { };

bpmEdgeHandler.prototype.removeHint = function() { };

bpmEdgeHandler.prototype.roundLength = function(length)
{
	return Math.round(length);
};

bpmEdgeHandler.prototype.isSnapToTerminalsEvent = function(me)
{
	return this.snapToTerminals && !bpmEvent.isAltDown(me.getEvent());
};

bpmEdgeHandler.prototype.getPointForEvent = function(me)
{
	var view = this.graph.getView();
	var scale = view.scale;
	var point = new bpmPoint(this.roundLength(me.getGraphX() / scale) * scale,
		this.roundLength(me.getGraphY() / scale) * scale);
	
	var tt = this.getSnapToTerminalTolerance();
	var overrideX = false;
	var overrideY = false;		
	
	if (tt > 0 && this.isSnapToTerminalsEvent(me))
	{
		function snapToPoint(pt)
		{
			if (pt != null)
			{
				var x = pt.x;

				if (Math.abs(point.x - x) < tt)
				{
					point.x = x;
					overrideX = true;
				}
				
				var y = pt.y;

				if (Math.abs(point.y - y) < tt)
				{
					point.y = y;
					overrideY = true;
				}
			}
		}
		
		function snapToTerminal(terminal)
		{
			if (terminal != null)
			{
				snapToPoint.call(this, new bpmPoint(view.getRoutingCenterX(terminal),
						view.getRoutingCenterY(terminal)));
			}
		};

		snapToTerminal.call(this, this.state.getVisibleTerminalState(true));
		snapToTerminal.call(this, this.state.getVisibleTerminalState(false));

		if (this.state.absolutePoints != null)
		{
			for (var i = 0; i < this.state.absolutePoints.length; i++)
			{
				snapToPoint.call(this, this.state.absolutePoints[i]);
			}
		}
	}

	if (this.graph.isGridEnabledEvent(me.getEvent()))
	{
		var tr = view.translate;
		
		if (!overrideX)
		{
			point.x = (this.graph.snap(point.x / scale - tr.x) + tr.x) * scale;
		}
		
		if (!overrideY)
		{
			point.y = (this.graph.snap(point.y / scale - tr.y) + tr.y) * scale;
		}
	}
	
	return point;
};

bpmEdgeHandler.prototype.getPreviewTerminalState = function(me)
{
	this.constraintHandler.update(me, this.isSource, true, me.isSource(this.marker.highlight.shape) ? null : this.currentPoint);
	
	if (this.constraintHandler.currentFocus != null && this.constraintHandler.currentConstraint != null)
	{
		if (this.marker.highlight != null && this.marker.highlight.state != null &&
			this.marker.highlight.state.cell == this.constraintHandler.currentFocus.cell)
		{
			if (this.marker.highlight.shape.stroke != 'transparent')
			{
				this.marker.highlight.shape.stroke = 'transparent';
				this.marker.highlight.repaint();
			}
		}
		else
		{
			this.marker.markCell(this.constraintHandler.currentFocus.cell, 'transparent');
		}
		
		var model = this.graph.getModel();
		var other = this.graph.view.getTerminalPort(this.state,
				this.graph.view.getState(model.getTerminal(this.state.cell,
			!this.isSource)), !this.isSource);
		var otherCell = (other != null) ? other.cell : null;
		var source = (this.isSource) ? this.constraintHandler.currentFocus.cell : otherCell;
		var target = (this.isSource) ? otherCell : this.constraintHandler.currentFocus.cell;
		
		this.error = this.validateConnection(source, target);
		var result = null;
		
		if (this.error == null)
		{
			result = this.constraintHandler.currentFocus;
		}
		else
		{
			this.constraintHandler.reset();
		}
		
		return result;
	}
	else if (!this.graph.isIgnoreTerminalEvent(me.getEvent()))
	{
		this.marker.process(me);
		var state = this.marker.getValidState();
		
		if (state != null && this.graph.isCellLocked(state.cell))
		{
			this.marker.reset();
		}
		
		return this.marker.getValidState();
	}
	else
	{
		this.marker.reset();
		
		return null;
	}
};

bpmEdgeHandler.prototype.getPreviewPoints = function(pt, me)
{
	var geometry = this.graph.getCellGeometry(this.state.cell);
	var points = (geometry.points != null) ? geometry.points.slice() : null;
	var point = new bpmPoint(pt.x, pt.y);
	var result = null;
	
	if (!this.isSource && !this.isTarget)
	{
		this.convertPoint(point, false);
		
		if (points == null)
		{
			points = [point];
		}
		else
		{
			if (this.index <= bpmEvent.VIRTUAL_HANDLE)
			{
				points.splice(bpmEvent.VIRTUAL_HANDLE - this.index, 0, point);
			}

			if (!this.isSource && !this.isTarget)
			{
				for (var i = 0; i < this.bends.length; i++)
				{
					if (i != this.index)
					{
						var bend = this.bends[i];
						
						if (bend != null && bpmUtils.contains(bend.bounds, pt.x, pt.y))
						{
							if (this.index <= bpmEvent.VIRTUAL_HANDLE)
							{
								points.splice(bpmEvent.VIRTUAL_HANDLE - this.index, 1);
							}
							else
							{
								points.splice(this.index - 1, 1);
							}
							
							result = points;
						}
					}
				}
				
				if (result == null && this.straightRemoveEnabled && (me == null || !bpmEvent.isAltDown(me.getEvent())))
				{
					var tol = this.graph.tolerance * this.graph.tolerance;
					var abs = this.state.absolutePoints.slice();
					abs[this.index] = pt;
					
					var src = this.state.getVisibleTerminalState(true);
					
					if (src != null)
					{
						var c = this.graph.getConnectionConstraint(this.state, src, true);
						
						if (c == null || this.graph.getConnectionPoint(src, c) == null)
						{
							abs[0] = new bpmPoint(src.view.getRoutingCenterX(src), src.view.getRoutingCenterY(src));
						}
					}
					
					var trg = this.state.getVisibleTerminalState(false);
					
					if (trg != null)
					{
						var c = this.graph.getConnectionConstraint(this.state, trg, false);
						
						if (c == null || this.graph.getConnectionPoint(trg, c) == null)
						{
							abs[abs.length - 1] = new bpmPoint(trg.view.getRoutingCenterX(trg), trg.view.getRoutingCenterY(trg));
						}
					}

					function checkRemove(idx, tmp)
					{
						if (idx > 0 && idx < abs.length - 1 &&
							bpmUtils.ptSegDistSq(abs[idx - 1].x, abs[idx - 1].y,
								abs[idx + 1].x, abs[idx + 1].y, tmp.x, tmp.y) < tol)
						{
							points.splice(idx - 1, 1);
							result = points;
						}
					};
					
					checkRemove(this.index, pt);
				}
			}
			
			if (result == null && this.index > bpmEvent.VIRTUAL_HANDLE)
			{
				points[this.index - 1] = point;
			}
		}
	}
	else if (this.graph.resetEdgesOnConnect)
	{
		points = null;
	}
	
	return (result != null) ? result : points;
};

bpmEdgeHandler.prototype.isOutlineConnectEvent = function(me)
{
	var offset = bpmUtils.getOffset(this.graph.container);
	var evt = me.getEvent();
	
	var clientX = bpmEvent.getClientX(evt);
	var clientY = bpmEvent.getClientY(evt);
	
	var doc = document.documentElement;
	var left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
	var top = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
	
	var gridX = this.currentPoint.x - this.graph.container.scrollLeft + offset.x - left;
	var gridY = this.currentPoint.y - this.graph.container.scrollTop + offset.y - top;

	return this.outlineConnect && !bpmEvent.isShiftDown(me.getEvent()) &&
		(me.isSource(this.marker.highlight.shape) ||
		(bpmEvent.isAltDown(me.getEvent()) && me.getState() != null) ||
		this.marker.highlight.isHighlightAt(clientX, clientY) ||
		((gridX != clientX || gridY != clientY) && me.getState() == null &&
		this.marker.highlight.isHighlightAt(gridX, gridY)));
};

bpmEdgeHandler.prototype.updatePreviewState = function(edge, point, terminalState, me, outline)
{
	var sourceState = (this.isSource) ? terminalState : this.state.getVisibleTerminalState(true);
	var targetState = (this.isTarget) ? terminalState : this.state.getVisibleTerminalState(false);
	
	var sourceConstraint = this.graph.getConnectionConstraint(edge, sourceState, true);
	var targetConstraint = this.graph.getConnectionConstraint(edge, targetState, false);

	var constraint = this.constraintHandler.currentConstraint;

	if (constraint == null && outline)
	{
		if (terminalState != null)
		{
			if (me.isSource(this.marker.highlight.shape))
			{
				point = new bpmPoint(me.getGraphX(), me.getGraphY());
			}
			
			constraint = this.graph.getOutlineConstraint(point, terminalState, me);
			this.constraintHandler.setFocus(me, terminalState, this.isSource);
			this.constraintHandler.currentConstraint = constraint;
			this.constraintHandler.currentPoint = point;
		}
		else
		{
			constraint = new bpmConnectionConstraint();
		}
	}
	
	if (this.outlineConnect && this.marker.highlight != null && this.marker.highlight.shape != null)
	{
		var s = this.graph.view.scale;
		
		if (this.constraintHandler.currentConstraint != null &&
			this.constraintHandler.currentFocus != null)
		{
			this.marker.highlight.shape.stroke = (outline) ? bpmConstants.OUTLINE_HIGHLIGHT_COLOR : 'transparent';
			this.marker.highlight.shape.strokewidth = bpmConstants.OUTLINE_HIGHLIGHT_STROKEWIDTH / s / s;
			this.marker.highlight.repaint();
		}
		else if (this.marker.hasValidState())
		{
			this.marker.highlight.shape.stroke = (this.marker.getValidState() == me.getState()) ?
				bpmConstants.DEFAULT_VALID_COLOR : 'transparent';
			this.marker.highlight.shape.strokewidth = bpmConstants.HIGHLIGHT_STROKEWIDTH / s / s;
			this.marker.highlight.repaint();
		}
	}
	
	if (this.isSource)
	{
		sourceConstraint = constraint;
	}
	else if (this.isTarget)
	{
		targetConstraint = constraint;
	}
	
	if (this.isSource || this.isTarget)
	{
		if (constraint != null && constraint.point != null)
		{
			edge.style[(this.isSource) ? bpmConstants.STYLE_EXIT_X : bpmConstants.STYLE_ENTRY_X] = constraint.point.x;
			edge.style[(this.isSource) ? bpmConstants.STYLE_EXIT_Y : bpmConstants.STYLE_ENTRY_Y] = constraint.point.y;
		}
		else
		{
			delete edge.style[(this.isSource) ? bpmConstants.STYLE_EXIT_X : bpmConstants.STYLE_ENTRY_X];
			delete edge.style[(this.isSource) ? bpmConstants.STYLE_EXIT_Y : bpmConstants.STYLE_ENTRY_Y];
		}
	}
	
	edge.setVisibleTerminalState(sourceState, true);
	edge.setVisibleTerminalState(targetState, false);
	
	if (!this.isSource || sourceState != null)
	{
		edge.view.updateFixedTerminalPoint(edge, sourceState, true, sourceConstraint);
	}
	
	if (!this.isTarget || targetState != null)
	{
		edge.view.updateFixedTerminalPoint(edge, targetState, false, targetConstraint);
	}
	
	if ((this.isSource || this.isTarget) && terminalState == null)
	{
		edge.setAbsoluteTerminalPoint(point, this.isSource);

		if (this.marker.getMarkedState() == null)
		{
			this.error = (this.graph.allowDanglingEdges) ? null : '';
		}
	}
	
	edge.view.updatePoints(edge, this.points, sourceState, targetState);
	edge.view.updateFloatingTerminalPoints(edge, sourceState, targetState);
};

bpmEdgeHandler.prototype.mouseMove = function(sender, me)
{
	if (this.index != null && this.marker != null)
	{
		this.currentPoint = this.getPointForEvent(me);
		this.error = null;
		
		if (!this.graph.isIgnoreTerminalEvent(me.getEvent()) && bpmEvent.isShiftDown(me.getEvent()) && this.snapPoint != null)
		{
			if (Math.abs(this.snapPoint.x - this.currentPoint.x) < Math.abs(this.snapPoint.y - this.currentPoint.y))
			{
				this.currentPoint.x = this.snapPoint.x;
			}
			else
			{
				this.currentPoint.y = this.snapPoint.y;
			}
		}
		
		if (this.index <= bpmEvent.CUSTOM_HANDLE && this.index > bpmEvent.VIRTUAL_HANDLE)
		{
			if (this.customHandles != null)
			{
				this.customHandles[bpmEvent.CUSTOM_HANDLE - this.index].processEvent(me);
			}
		}
		else if (this.isLabel)
		{
			this.label.x = this.currentPoint.x;
			this.label.y = this.currentPoint.y;
		}
		else
		{
			this.points = this.getPreviewPoints(this.currentPoint, me);
			var terminalState = (this.isSource || this.isTarget) ? this.getPreviewTerminalState(me) : null;

			if (this.constraintHandler.currentConstraint != null &&
				this.constraintHandler.currentFocus != null &&
				this.constraintHandler.currentPoint != null)
			{
				this.currentPoint = this.constraintHandler.currentPoint.clone();
			}
			else if (this.outlineConnect)
			{
				var outline = (this.isSource || this.isTarget) ? this.isOutlineConnectEvent(me) : false
						
				if (outline)
				{
					terminalState = this.marker.highlight.state;
				}
				else if (terminalState != null && terminalState != me.getState() && this.marker.highlight.shape != null)
				{
					this.marker.highlight.shape.stroke = 'transparent';
					this.marker.highlight.repaint();
					terminalState = null;
				}
			}
			
			if (terminalState != null && this.graph.isCellLocked(terminalState.cell))
			{
				terminalState = null;
				this.marker.reset();
			}
			
			var clone = this.clonePreviewState(this.currentPoint, (terminalState != null) ? terminalState.cell : null);
			this.updatePreviewState(clone, this.currentPoint, terminalState, me, outline);

			var color = (this.error == null) ? this.marker.validColor : this.marker.invalidColor;
			this.setPreviewColor(color);
			this.abspoints = clone.absolutePoints;
			this.active = true;
		}

		this.updateHint(me, this.currentPoint);
		this.drawPreview();
		bpmEvent.consume(me.getEvent());
		me.consume();
	}

	else if (bpmCore.IS_IE && this.getHandleForEvent(me) != null)
	{
		me.consume(false);
	}
};

bpmEdgeHandler.prototype.mouseUp = function(sender, me)
{
	if (this.index != null && this.marker != null)
	{
		var edge = this.state.cell;
		var index = this.index;
		this.index = null;
		
		if (me.getX() != this.startX || me.getY() != this.startY)
		{
			var clone = !this.graph.isIgnoreTerminalEvent(me.getEvent()) && this.graph.isCloneEvent(me.getEvent()) && this.cloneEnabled && this.graph.isCellsCloneable();
			
			if (this.error != null)
			{
				if (this.error.length > 0)
				{
					this.graph.validationAlert(this.error);
				}
			}
			else if (index <= bpmEvent.CUSTOM_HANDLE && index > bpmEvent.VIRTUAL_HANDLE)
			{
				if (this.customHandles != null)
				{
					var model = this.graph.getModel();
					
					model.beginUpdate();
					try
					{
						this.customHandles[bpmEvent.CUSTOM_HANDLE - index].execute();
					}
					finally
					{
						model.endUpdate();
					}
				}
			}
			else if (this.isLabel)
			{
				this.moveLabel(this.state, this.label.x, this.label.y);
			}
			else if (this.isSource || this.isTarget)
			{
				var terminal = null;
				
				if (this.constraintHandler.currentConstraint != null &&
					this.constraintHandler.currentFocus != null)
				{
					terminal = this.constraintHandler.currentFocus.cell;
				}
				
				if (terminal == null && this.marker.hasValidState() && this.marker.highlight != null &&
					this.marker.highlight.shape != null &&
					this.marker.highlight.shape.stroke != 'transparent' &&
					this.marker.highlight.shape.stroke != 'white')
				{
					terminal = this.marker.validState.cell;
				}
				
				if (terminal != null)
				{
					var model = this.graph.getModel();
					var parent = model.getParent(edge);
					
					model.beginUpdate();
					try
					{
						if (clone)
						{
							var geo = model.getGeometry(edge);
							var clone = this.graph.cloneCell(edge);
							model.add(parent, clone, model.getChildCount(parent));
							
							if (geo != null)
							{
								geo = geo.clone();
								model.setGeometry(clone, geo);
							}
							
							var other = model.getTerminal(edge, !this.isSource);
							this.graph.connectCell(clone, other, !this.isSource);
							
							edge = clone;
						}
						
						edge = this.connect(edge, terminal, this.isSource, clone, me);
					}
					finally
					{
						model.endUpdate();
					}
				}
				else if (this.graph.isAllowDanglingEdges())
				{
					var pt = this.abspoints[(this.isSource) ? 0 : this.abspoints.length - 1];
					pt.x = this.roundLength(pt.x / this.graph.view.scale - this.graph.view.translate.x);
					pt.y = this.roundLength(pt.y / this.graph.view.scale - this.graph.view.translate.y);

					var pstate = this.graph.getView().getState(
							this.graph.getModel().getParent(edge));
							
					if (pstate != null)
					{
						pt.x -= pstate.origin.x;
						pt.y -= pstate.origin.y;
					}
					
					pt.x -= this.graph.panDx / this.graph.view.scale;
					pt.y -= this.graph.panDy / this.graph.view.scale;
										
					edge = this.changeTerminalPoint(edge, pt, this.isSource, clone);
				}
			}
			else if (this.active)
			{
				edge = this.changePoints(edge, this.points, clone);
			}
			else
			{
				this.graph.getView().invalidate(this.state.cell);
				this.graph.getView().validate(this.state.cell);						
			}
		}
		
		if (this.marker != null)
		{
			this.reset();

			if (edge != this.state.cell)
			{
				this.graph.setSelectionCell(edge);
			}
		}

		me.consume();
	}
};

bpmEdgeHandler.prototype.reset = function()
{
	if (this.active)
	{
		this.refresh();
	}
	
	this.error = null;
	this.index = null;
	this.label = null;
	this.points = null;
	this.snapPoint = null;
	this.isLabel = false;
	this.isSource = false;
	this.isTarget = false;
	this.active = false;
	
	if (this.livePreview && this.sizers != null)
	{
		for (var i = 0; i < this.sizers.length; i++)
		{
			if (this.sizers[i] != null)
			{
				this.sizers[i].node.style.display = '';
			}
		}
	}

	if (this.marker != null)
	{
		this.marker.reset();
	}
	
	if (this.constraintHandler != null)
	{
		this.constraintHandler.reset();
	}
	
	if (this.customHandles != null)
	{
		for (var i = 0; i < this.customHandles.length; i++)
		{
			this.customHandles[i].reset();
		}
	}

	this.setPreviewColor(bpmConstants.EDGE_SELECTION_COLOR);
	this.removeHint();
	this.redraw();
};

bpmEdgeHandler.prototype.setPreviewColor = function(color)
{
	if (this.shape != null)
	{
		this.shape.stroke = color;
	}
};

bpmEdgeHandler.prototype.convertPoint = function(point, gridEnabled)
{
	var scale = this.graph.getView().getScale();
	var tr = this.graph.getView().getTranslate();
		
	if (gridEnabled)
	{
		point.x = this.graph.snap(point.x);
		point.y = this.graph.snap(point.y);
	}
	
	point.x = Math.round(point.x / scale - tr.x);
	point.y = Math.round(point.y / scale - tr.y);

	var pstate = this.graph.getView().getState(
		this.graph.getModel().getParent(this.state.cell));

	if (pstate != null)
	{
		point.x -= pstate.origin.x;
		point.y -= pstate.origin.y;
	}

	return point;
};

bpmEdgeHandler.prototype.moveLabel = function(edgeState, x, y)
{
	var model = this.graph.getModel();
	var geometry = model.getGeometry(edgeState.cell);
	
	if (geometry != null)
	{
		var scale = this.graph.getView().scale;
		geometry = geometry.clone();
		
		if (geometry.relative)
		{
			var pt = this.graph.getView().getRelativePoint(edgeState, x, y);
			geometry.x = Math.round(pt.x * 10000) / 10000;
			geometry.y = Math.round(pt.y);
			geometry.offset = new bpmPoint(0, 0);
			var pt = this.graph.view.getPoint(edgeState, geometry);
			geometry.offset = new bpmPoint(Math.round((x - pt.x) / scale), Math.round((y - pt.y) / scale));
		}
		else
		{
			var points = edgeState.absolutePoints;
			var p0 = points[0];
			var pe = points[points.length - 1];
			
			if (p0 != null && pe != null)
			{
				var cx = p0.x + (pe.x - p0.x) / 2;
				var cy = p0.y + (pe.y - p0.y) / 2;
				
				geometry.offset = new bpmPoint(Math.round((x - cx) / scale), Math.round((y - cy) / scale));
				geometry.x = 0;
				geometry.y = 0;
			}
		}

		model.setGeometry(edgeState.cell, geometry);
	}
};

bpmEdgeHandler.prototype.connect = function(edge, terminal, isSource, isClone, me)
{
	var model = this.graph.getModel();
	var parent = model.getParent(edge);
	
	model.beginUpdate();
	try
	{
		var constraint = this.constraintHandler.currentConstraint;
		
		if (constraint == null)
		{
			constraint = new bpmConnectionConstraint();
		}

		this.graph.connectCell(edge, terminal, isSource, constraint);
	}
	finally
	{
		model.endUpdate();
	}
	
	return edge;
};

bpmEdgeHandler.prototype.changeTerminalPoint = function(edge, point, isSource, clone)
{
	var model = this.graph.getModel();

	model.beginUpdate();
	try
	{
		if (clone)
		{
			var parent = model.getParent(edge);
			var terminal = model.getTerminal(edge, !isSource);
			edge = this.graph.cloneCell(edge);
			model.add(parent, edge, model.getChildCount(parent));
			model.setTerminal(edge, terminal, !isSource);
		}

		var geo = model.getGeometry(edge);
		
		if (geo != null)
		{
			geo = geo.clone();
			geo.setTerminalPoint(point, isSource);
			model.setGeometry(edge, geo);
			this.graph.connectCell(edge, null, isSource, new bpmConnectionConstraint());
		}
	}
	finally
	{
		model.endUpdate();
	}
	
	return edge;
};

bpmEdgeHandler.prototype.changePoints = function(edge, points, clone)
{
	var model = this.graph.getModel();
	model.beginUpdate();
	try
	{
		if (clone)
		{
			var parent = model.getParent(edge);
			var source = model.getTerminal(edge, true);
			var target = model.getTerminal(edge, false);
			edge = this.graph.cloneCell(edge);
			model.add(parent, edge, model.getChildCount(parent));
			model.setTerminal(edge, source, true);
			model.setTerminal(edge, target, false);
		}
		
		var geo = model.getGeometry(edge);
		
		if (geo != null)
		{
			geo = geo.clone();
			geo.points = points;
			
			model.setGeometry(edge, geo);
		}
	}
	finally
	{
		model.endUpdate();
	}
	
	return edge;
};

bpmEdgeHandler.prototype.addPoint = function(state, evt)
{
	var pt = bpmUtils.convertPoint(this.graph.container, bpmEvent.getClientX(evt),
			bpmEvent.getClientY(evt));
	var gridEnabled = this.graph.isGridEnabledEvent(evt);
	this.convertPoint(pt, gridEnabled);
	this.addPointAt(state, pt.x, pt.y);
	bpmEvent.consume(evt);
};

bpmEdgeHandler.prototype.addPointAt = function(state, x, y)
{
	var geo = this.graph.getCellGeometry(state.cell);
	var pt = new bpmPoint(x, y);
	
	if (geo != null)
	{
		geo = geo.clone();
		var t = this.graph.view.translate;
		var s = this.graph.view.scale;
		var offset = new bpmPoint(t.x * s, t.y * s);
		
		var parent = this.graph.model.getParent(this.state.cell);
		
		if (this.graph.model.isVertex(parent))
		{
			var pState = this.graph.view.getState(parent);
			offset = new bpmPoint(pState.x, pState.y);
		}
		
		var index = bpmUtils.findNearestSegment(state, pt.x * s + offset.x, pt.y * s + offset.y);

		if (geo.points == null)
		{
			geo.points = [pt];
		}
		else
		{
			geo.points.splice(index, 0, pt);
		}
		
		this.graph.getModel().setGeometry(state.cell, geo);
		this.refresh();	
		this.redraw();
	}
};

bpmEdgeHandler.prototype.removePoint = function(state, index)
{
	if (index > 0 && index < this.abspoints.length - 1)
	{
		var geo = this.graph.getCellGeometry(this.state.cell);
		
		if (geo != null && geo.points != null)
		{
			geo = geo.clone();
			geo.points.splice(index - 1, 1);
			this.graph.getModel().setGeometry(state.cell, geo);
			this.refresh();
			this.redraw();
		}
	}
};

bpmEdgeHandler.prototype.getHandleFillColor = function(index)
{
	var isSource = index == 0;
	var cell = this.state.cell;
	var terminal = this.graph.getModel().getTerminal(cell, isSource);
	var color = bpmConstants.HANDLE_FILLCOLOR;
	
	if ((terminal != null && !this.graph.isCellDisconnectable(cell, terminal, isSource)) ||
		(terminal == null && !this.graph.isTerminalPointMovable(cell, isSource)))
	{
		color = bpmConstants.LOCKED_HANDLE_FILLCOLOR;
	}
	else if (terminal != null && this.graph.isCellDisconnectable(cell, terminal, isSource))
	{
		color = bpmConstants.CONNECT_HANDLE_FILLCOLOR;
	}
	
	return color;
};

bpmEdgeHandler.prototype.redraw = function()
{
	this.abspoints = this.state.absolutePoints.slice();
	this.redrawHandles();
	
	var g = this.graph.getModel().getGeometry(this.state.cell);
	var pts = g.points;

	if (this.bends != null && this.bends.length > 0)
	{
		if (pts != null)
		{
			if (this.points == null)
			{
				this.points = [];
			}
			
			for (var i = 1; i < this.bends.length - 1; i++)
			{
				if (this.bends[i] != null && this.abspoints[i] != null)
				{
					this.points[i - 1] = pts[i - 1];
				}
			}
		}
	}

	this.drawPreview();
};

bpmEdgeHandler.prototype.redrawHandles = function()
{
	var cell = this.state.cell;

	var b = this.labelShape.bounds;
	this.label = new bpmPoint(this.state.absoluteOffset.x, this.state.absoluteOffset.y);
	this.labelShape.bounds = new bpmRectangle(Math.round(this.label.x - b.width / 2),
		Math.round(this.label.y - b.height / 2), b.width, b.height);

	var lab = this.graph.getLabel(cell);
	this.labelShape.visible = (lab != null && lab.length > 0 && this.graph.isLabelMovable(cell));
	
	if (this.bends != null && this.bends.length > 0)
	{
		var n = this.abspoints.length - 1;
		
		var p0 = this.abspoints[0];
		var x0 = p0.x;
		var y0 = p0.y;
		
		b = this.bends[0].bounds;
		this.bends[0].bounds = new bpmRectangle(Math.floor(x0 - b.width / 2),
				Math.floor(y0 - b.height / 2), b.width, b.height);
		this.bends[0].fill = this.getHandleFillColor(0);
		this.bends[0].redraw();
		
		if (this.manageLabelHandle)
		{
			this.checkLabelHandle(this.bends[0].bounds);
		}
				
		var pe = this.abspoints[n];
		var xn = pe.x;
		var yn = pe.y;
		
		var bn = this.bends.length - 1;
		b = this.bends[bn].bounds;
		this.bends[bn].bounds = new bpmRectangle(Math.floor(xn - b.width / 2),
				Math.floor(yn - b.height / 2), b.width, b.height);
		this.bends[bn].fill = this.getHandleFillColor(bn);
		this.bends[bn].redraw();
				
		if (this.manageLabelHandle)
		{
			this.checkLabelHandle(this.bends[bn].bounds);
		}
		
		this.redrawInnerBends(p0, pe);
	}

	if (this.abspoints != null && this.virtualBends != null && this.virtualBends.length > 0)
	{
		var last = this.abspoints[0];
		
		for (var i = 0; i < this.virtualBends.length; i++)
		{
			if (this.virtualBends[i] != null && this.abspoints[i + 1] != null)
			{
				var pt = this.abspoints[i + 1];
				var b = this.virtualBends[i];
				var x = last.x + (pt.x - last.x) / 2;
				var y = last.y + (pt.y - last.y) / 2;
				b.bounds = new bpmRectangle(Math.floor(x - b.bounds.width / 2),
						Math.floor(y - b.bounds.height / 2), b.bounds.width, b.bounds.height);
				b.redraw();
				bpmUtils.setOpacity(b.node, this.virtualBendOpacity);
				last = pt;
				
				if (this.manageLabelHandle)
				{
					this.checkLabelHandle(b.bounds);
				}
			}
		}
	}
	
	if (this.labelShape != null)
	{
		this.labelShape.redraw();
	}
	
	if (this.customHandles != null)
	{
		for (var i = 0; i < this.customHandles.length; i++)
		{
			this.customHandles[i].redraw();
		}
	}
};

bpmEdgeHandler.prototype.setHandlesVisible = function(visible)
{
	if (this.bends != null)
	{
		for (var i = 0; i < this.bends.length; i++)
		{
			this.bends[i].node.style.display = (visible) ? '' : 'none';
		}
	}
	
	if (this.virtualBends != null)
	{
		for (var i = 0; i < this.virtualBends.length; i++)
		{
			this.virtualBends[i].node.style.display = (visible) ? '' : 'none';
		}
	}

	if (this.labelShape != null)
	{
		this.labelShape.node.style.display = (visible) ? '' : 'none';
	}
	
	if (this.customHandles != null)
	{
		for (var i = 0; i < this.customHandles.length; i++)
		{
			this.customHandles[i].setVisible(visible);
		}
	}
};

bpmEdgeHandler.prototype.redrawInnerBends = function(p0, pe)
{
	for (var i = 1; i < this.bends.length - 1; i++)
	{
		if (this.bends[i] != null)
		{
			if (this.abspoints[i] != null)
			{
				var x = this.abspoints[i].x;
				var y = this.abspoints[i].y;
				
				var b = this.bends[i].bounds;
				this.bends[i].node.style.visibility = 'visible';
				this.bends[i].bounds = new bpmRectangle(Math.round(x - b.width / 2),
						Math.round(y - b.height / 2), b.width, b.height);
				
				if (this.manageLabelHandle)
				{
					this.checkLabelHandle(this.bends[i].bounds);
				}
				else if (this.handleImage == null && this.labelShape.visible && bpmUtils.intersects(this.bends[i].bounds, this.labelShape.bounds))
				{
					w = bpmConstants.HANDLE_SIZE + 3;
					h = bpmConstants.HANDLE_SIZE + 3;
					this.bends[i].bounds = new bpmRectangle(Math.round(x - w / 2), Math.round(y - h / 2), w, h);
				}
				
				this.bends[i].redraw();
			}
			else
			{
				this.bends[i].destroy();
				this.bends[i] = null;
			}
		}
	}
};

bpmEdgeHandler.prototype.checkLabelHandle = function(b)
{
	if (this.labelShape != null)
	{
		var b2 = this.labelShape.bounds;
		
		if (bpmUtils.intersects(b, b2))
		{
			if (b.getCenterY() < b2.getCenterY())
			{
				b2.y = b.y + b.height;
			}
			else
			{
				b2.y = b.y - b2.height;
			}
		}
	}
};

bpmEdgeHandler.prototype.drawPreview = function()
{
	if (this.isLabel)
	{
		var b = this.labelShape.bounds;
		var bounds = new bpmRectangle(Math.round(this.label.x - b.width / 2),
				Math.round(this.label.y - b.height / 2), b.width, b.height);
		this.labelShape.bounds = bounds;
		this.labelShape.redraw();
	}
	else if (this.shape != null)
	{
		this.shape.apply(this.state);
		this.shape.points = this.abspoints;
		this.shape.scale = this.state.view.scale;
		this.shape.isDashed = this.isSelectionDashed();
		this.shape.stroke = this.getSelectionColor();
		this.shape.strokewidth = this.getSelectionStrokeWidth() / this.shape.scale / this.shape.scale;
		this.shape.isShadow = false;
		this.shape.redraw();
	}
	
	if (this.parentHighlight != null)
	{
		this.parentHighlight.redraw();
	}
};

bpmEdgeHandler.prototype.refresh = function()
{
	this.abspoints = this.getSelectionPoints(this.state);
	this.points = [];

	if (this.shape != null)
	{
		this.shape.points = this.abspoints;
	}
	
	if (this.bends != null)
	{
		this.destroyBends(this.bends);
		this.bends = this.createBends();
	}
	
	if (this.virtualBends != null)
	{
		this.destroyBends(this.virtualBends);
		this.virtualBends = this.createVirtualBends();
	}
	
	if (this.customHandles != null)
	{
		this.destroyBends(this.customHandles);
		this.customHandles = this.createCustomHandles();
	}
	
	if (this.labelShape != null && this.labelShape.node != null && this.labelShape.node.parentNode != null)
	{
		this.labelShape.node.parentNode.appendChild(this.labelShape.node);
	}
};

bpmEdgeHandler.prototype.destroyBends = function(bends)
{
	if (bends != null)
	{
		for (var i = 0; i < bends.length; i++)
		{
			if (bends[i] != null)
			{
				bends[i].destroy();
			}
		}
	}
};

bpmEdgeHandler.prototype.destroy = function()
{
	if (this.escapeHandler != null)
	{
		this.state.view.graph.removeListener(this.escapeHandler);
		this.escapeHandler = null;
	}
	
	if (this.marker != null)
	{
		this.marker.destroy();
		this.marker = null;
	}
	
	if (this.shape != null)
	{
		this.shape.destroy();
		this.shape = null;
	}
	
	if (this.parentHighlight != null)
	{
		this.parentHighlight.destroy();
		this.parentHighlight = null;
	}
	
	if (this.labelShape != null)
	{
		this.labelShape.destroy();
		this.labelShape = null;
	}

	if (this.constraintHandler != null)
	{
		this.constraintHandler.destroy();
		this.constraintHandler = null;
	}
	
	this.destroyBends(this.virtualBends);
	this.virtualBends = null;
	
	this.destroyBends(this.customHandles);
	this.customHandles = null;

	this.destroyBends(this.bends);
	this.bends = null;
	
	this.removeHint();
};

/* Elbow Edge Handler */

function bpmElbowEdgeHandler(state)
{
	bpmEdgeHandler.call(this, state);
};

bpmUtils.extend(bpmElbowEdgeHandler, bpmEdgeHandler);

bpmElbowEdgeHandler.prototype.flipEnabled = true;

bpmElbowEdgeHandler.prototype.doubleClickOrientationResource =
	(bpmCore.language != 'none') ? 'doubleClickOrientation' : '';

 bpmElbowEdgeHandler.prototype.createBends = function()
 {
	var bends = [];
	
	// Source
	var bend = this.createHandleShape(0);
	this.initBend(bend);
	bend.setCursor(bpmConstants.CURSOR_TERMINAL_HANDLE);
	bends.push(bend);

	// Virtual
	bends.push(this.createVirtualBend(bpmUtils.bind(this, function(evt)
	{
		if (!bpmEvent.isConsumed(evt) && this.flipEnabled)
		{
			this.graph.flipEdge(this.state.cell, evt);
			bpmEvent.consume(evt);
		}
	})));
	this.points.push(new bpmPoint(0,0));

	// Target
	bend = this.createHandleShape(2);
	this.initBend(bend);
	bend.setCursor(bpmConstants.CURSOR_TERMINAL_HANDLE);
	bends.push(bend);
	
	return bends;
 };

bpmElbowEdgeHandler.prototype.createVirtualBend = function(dblClickHandler)
{
	var bend = this.createHandleShape();
	this.initBend(bend, dblClickHandler);

	bend.setCursor(this.getCursorForBend());

	if (!this.graph.isCellBendable(this.state.cell))
	{
		bend.node.style.display = 'none';
	}

	return bend;
};

bpmElbowEdgeHandler.prototype.getCursorForBend = function()
{
	return (this.state.style[bpmConstants.STYLE_EDGE] == bpmEdgeStyle.TopToBottom ||
		this.state.style[bpmConstants.STYLE_EDGE] == bpmConstants.EDGESTYLE_TOPTOBOTTOM ||
		((this.state.style[bpmConstants.STYLE_EDGE] == bpmEdgeStyle.ElbowConnector ||
		this.state.style[bpmConstants.STYLE_EDGE] == bpmConstants.EDGESTYLE_ELBOW)&&
		this.state.style[bpmConstants.STYLE_ELBOW] == bpmConstants.ELBOW_VERTICAL)) ? 
		'row-resize' : 'col-resize';
};

bpmElbowEdgeHandler.prototype.getTooltipForNode = function(node)
{
	var tip = null;
	
	if (this.bends != null && this.bends[1] != null && (node == this.bends[1].node ||
		node.parentNode == this.bends[1].node))
	{
		tip = this.doubleClickOrientationResource;
		tip = bpmResources.get(tip) || tip; // translate
	}

	return tip;
};

bpmElbowEdgeHandler.prototype.convertPoint = function(point, gridEnabled)
{
	var scale = this.graph.getView().getScale();
	var tr = this.graph.getView().getTranslate();
	var origin = this.state.origin;
	
	if (gridEnabled)
	{
		point.x = this.graph.snap(point.x);
		point.y = this.graph.snap(point.y);
	}
	
	point.x = Math.round(point.x / scale - tr.x - origin.x);
	point.y = Math.round(point.y / scale - tr.y - origin.y);
	
	return point;
};

bpmElbowEdgeHandler.prototype.redrawInnerBends = function(p0, pe)
{
	var g = this.graph.getModel().getGeometry(this.state.cell);
	var pts = this.state.absolutePoints;
	var pt = null;

	if (pts.length > 1)
	{
		p0 = pts[1];
		pe = pts[pts.length - 2];
	}
	else if (g.points != null && g.points.length > 0)
	{
		pt = pts[0];
	}
	
	if (pt == null)
	{
		pt = new bpmPoint(p0.x + (pe.x - p0.x) / 2, p0.y + (pe.y - p0.y) / 2);
	}
	else
	{
		pt = new bpmPoint(this.graph.getView().scale * (pt.x + this.graph.getView().translate.x + this.state.origin.x),
				this.graph.getView().scale * (pt.y + this.graph.getView().translate.y + this.state.origin.y));
	}

	var b = this.bends[1].bounds;
	var w = b.width;
	var h = b.height;
	var bounds = new bpmRectangle(Math.round(pt.x - w / 2), Math.round(pt.y - h / 2), w, h);

	if (this.manageLabelHandle)
	{
		this.checkLabelHandle(bounds);
	}
	else if (this.handleImage == null && this.labelShape.visible && bpmUtils.intersects(bounds, this.labelShape.bounds))
	{
		w = bpmConstants.HANDLE_SIZE + 3;
		h = bpmConstants.HANDLE_SIZE + 3;
		bounds = new bpmRectangle(Math.floor(pt.x - w / 2), Math.floor(pt.y - h / 2), w, h);
	}

	this.bends[1].bounds = bounds;
	this.bends[1].redraw();
	
	if (this.manageLabelHandle)
	{
		this.checkLabelHandle(this.bends[1].bounds);
	}
};


function bpmEdgeSegmentHandler(state)
{
	bpmEdgeHandler.call(this, state);
};

bpmUtils.extend(bpmEdgeSegmentHandler, bpmElbowEdgeHandler);

bpmEdgeSegmentHandler.prototype.getCurrentPoints = function()
{
	var pts = this.state.absolutePoints;
	
	if (pts != null)
	{
		var tol = Math.max(1, this.graph.view.scale);
		
		if (pts.length == 2 || (pts.length == 3 &&
			(Math.abs(pts[0].x - pts[1].x) < tol && Math.abs(pts[1].x - pts[2].x) < tol ||
			Math.abs(pts[0].y - pts[1].y) < tol && Math.abs(pts[1].y - pts[2].y) < tol)))
		{
			var cx = pts[0].x + (pts[pts.length - 1].x - pts[0].x) / 2;
			var cy = pts[0].y + (pts[pts.length - 1].y - pts[0].y) / 2;
			
			pts = [pts[0], new bpmPoint(cx, cy), new bpmPoint(cx, cy), pts[pts.length - 1]];	
		}
	}

	return pts;
};

bpmEdgeSegmentHandler.prototype.getPreviewPoints = function(point)
{
	if (this.isSource || this.isTarget)
	{
		return bpmElbowEdgeHandler.prototype.getPreviewPoints.apply(this, arguments);
	}
	else
	{
		var pts = this.getCurrentPoints();
		var last = this.convertPoint(pts[0].clone(), false);
		point = this.convertPoint(point.clone(), false);
		var result = [];

		for (var i = 1; i < pts.length; i++)
		{
			var pt = this.convertPoint(pts[i].clone(), false);
			
			if (i == this.index)
			{
				if (Math.round(last.x - pt.x) == 0)
		 		{
					last.x = point.x;
					pt.x = point.x;
		 		}
		 		
				if (Math.round(last.y - pt.y) == 0)
		 		{
		 			last.y = point.y;
		 			pt.y = point.y;
		 		}
			}

			if (i < pts.length - 1)
			{
				result.push(pt);
			}

			last = pt;
		}
		
		if (result.length == 1)
		{
			var source = this.state.getVisibleTerminalState(true);
			var target = this.state.getVisibleTerminalState(false);
			var scale = this.state.view.getScale();
			var tr = this.state.view.getTranslate();
			
			var x = result[0].x * scale + tr.x;
			var y = result[0].y * scale + tr.y;
			
			if ((source != null && bpmUtils.contains(source, x, y)) ||
				(target != null && bpmUtils.contains(target, x, y)))
			{
				result = [point, point];
			}
		}

		return result;
	}
};

bpmEdgeSegmentHandler.prototype.updatePreviewState = function(edge, point, terminalState, me)
{
	bpmEdgeHandler.prototype.updatePreviewState.apply(this, arguments);

	if (!this.isSource && !this.isTarget)
	{
		point = this.convertPoint(point.clone(), false);
		var pts = edge.absolutePoints;
		var pt0 = pts[0];
		var pt1 = pts[1];

		var result = [];
		
		for (var i = 2; i < pts.length; i++)
		{
			var pt2 = pts[i];
		
			if ((Math.round(pt0.x - pt1.x) != 0 || Math.round(pt1.x - pt2.x) != 0) &&
				(Math.round(pt0.y - pt1.y) != 0 || Math.round(pt1.y - pt2.y) != 0))
			{
				result.push(this.convertPoint(pt1.clone(), false));
			}

			pt0 = pt1;
			pt1 = pt2;
		}
		
		var source = this.state.getVisibleTerminalState(true);
		var target = this.state.getVisibleTerminalState(false);
		var rpts = this.state.absolutePoints;
		
		if (result.length == 0 && (Math.round(pts[0].x - pts[pts.length - 1].x) == 0 ||
			Math.round(pts[0].y - pts[pts.length - 1].y) == 0))
		{
			result = [point, point];
		} else if (pts.length == 5 && result.length == 2 && source != null && target != null &&
				rpts != null && Math.round(rpts[0].x - rpts[rpts.length - 1].x) == 0)
		{
			var view = this.graph.getView();
			var scale = view.getScale();
			var tr = view.getTranslate();
			
			var y0 = view.getRoutingCenterY(source) / scale - tr.y;
			
			var sc = this.graph.getConnectionConstraint(edge, source, true);
			
			if (sc != null)
			{
				var pt = this.graph.getConnectionPoint(source, sc);
				
				if (pt != null)
				{
					this.convertPoint(pt, false);
					y0 = pt.y;
				}
			}
			
			var ye = view.getRoutingCenterY(target) / scale - tr.y;
			
			var tc = this.graph.getConnectionConstraint(edge, target, false);
			
			if (tc)
			{
				var pt = this.graph.getConnectionPoint(target, tc);
				
				if (pt != null)
				{
					this.convertPoint(pt, false);
					ye = pt.y;
				}
			}
			
			result = [new bpmPoint(point.x, y0), new bpmPoint(point.x, ye)];
		}

		this.points = result;

		edge.view.updateFixedTerminalPoints(edge, source, target);
		edge.view.updatePoints(edge, this.points, source, target);
		edge.view.updateFloatingTerminalPoints(edge, source, target);
	}
};

bpmEdgeSegmentHandler.prototype.connect = function(edge, terminal, isSource, isClone, me)
{
	var model = this.graph.getModel();
	var geo = model.getGeometry(edge);
	var result = null;
	
	if (geo != null && geo.points != null && geo.points.length > 0)
	{
		var pts = this.abspoints;
		var pt0 = pts[0];
		var pt1 = pts[1];
		result = [];
		
		for (var i = 2; i < pts.length; i++)
		{
			var pt2 = pts[i];
		
			if ((Math.round(pt0.x - pt1.x) != 0 || Math.round(pt1.x - pt2.x) != 0) &&
				(Math.round(pt0.y - pt1.y) != 0 || Math.round(pt1.y - pt2.y) != 0))
			{
				result.push(this.convertPoint(pt1.clone(), false));
			}
	
			pt0 = pt1;
			pt1 = pt2;
		}
	}
	
	model.beginUpdate();
	try
	{
		if (result != null)
		{
			var geo = model.getGeometry(edge);
			
			if (geo != null)
			{
				geo = geo.clone();
				geo.points = result;
				
				model.setGeometry(edge, geo);
			}
		}
		
		edge = bpmEdgeHandler.prototype.connect.apply(this, arguments);
	}
	finally
	{
		model.endUpdate();
	}
	
	return edge;
};

bpmEdgeSegmentHandler.prototype.getTooltipForNode = function(node)
{
	return null;
};

bpmEdgeSegmentHandler.prototype.start = function(x, y, index)
{
	bpmEdgeHandler.prototype.start.apply(this, arguments);
	
	if (this.bends != null && this.bends[index] != null &&
		!this.isSource && !this.isTarget)
	{
		bpmUtils.setOpacity(this.bends[index].node, 100);
	}
};

bpmEdgeSegmentHandler.prototype.createBends = function()
{
	var bends = [];
	
	var bend = this.createHandleShape(0);
	this.initBend(bend);
	bend.setCursor(bpmConstants.CURSOR_TERMINAL_HANDLE);
	bends.push(bend);

	var pts = this.getCurrentPoints();

	if (this.graph.isCellBendable(this.state.cell))
	{
		if (this.points == null)
		{
			this.points = [];
		}

		for (var i = 0; i < pts.length - 1; i++)
		{
			bend = this.createVirtualBend();
			bends.push(bend);
			var horizontal = Math.round(pts[i].x - pts[i + 1].x) == 0;
			
			if (Math.round(pts[i].y - pts[i + 1].y) == 0 && i < pts.length - 2)
			{
				horizontal = Math.round(pts[i].x - pts[i + 2].x) == 0;
			}
			
			bend.setCursor((horizontal) ? 'col-resize' : 'row-resize');
			this.points.push(new bpmPoint(0,0));
		}
	}

	var bend = this.createHandleShape(pts.length);
	this.initBend(bend);
	bend.setCursor(bpmConstants.CURSOR_TERMINAL_HANDLE);
	bends.push(bend);

	return bends;
};

bpmEdgeSegmentHandler.prototype.redraw = function()
{
	this.refresh();
	bpmEdgeHandler.prototype.redraw.apply(this, arguments);
};

bpmEdgeSegmentHandler.prototype.redrawInnerBends = function(p0, pe)
{
	if (this.graph.isCellBendable(this.state.cell))
	{
		var pts = this.getCurrentPoints();
		
		if (pts != null && pts.length > 1)
		{
			var straight = false;
			
			if (pts.length == 4 && Math.round(pts[1].x - pts[2].x) == 0 && Math.round(pts[1].y - pts[2].y) == 0)
			{
				straight = true;
				
				if (Math.round(pts[0].y - pts[pts.length - 1].y) == 0)
				{
					var cx = pts[0].x + (pts[pts.length - 1].x - pts[0].x) / 2;
					pts[1] = new bpmPoint(cx, pts[1].y);
					pts[2] = new bpmPoint(cx, pts[2].y);
				}
				else
				{
					var cy = pts[0].y + (pts[pts.length - 1].y - pts[0].y) / 2;
					pts[1] = new bpmPoint(pts[1].x, cy);
					pts[2] = new bpmPoint(pts[2].x, cy);
				}
			}
			
			for (var i = 0; i < pts.length - 1; i++)
			{
				if (this.bends[i + 1] != null)
				{
		 			var p0 = pts[i];
	 				var pe = pts[i + 1];
			 		var pt = new bpmPoint(p0.x + (pe.x - p0.x) / 2, p0.y + (pe.y - p0.y) / 2);
			 		var b = this.bends[i + 1].bounds;
			 		this.bends[i + 1].bounds = new bpmRectangle(Math.floor(pt.x - b.width / 2),
			 				Math.floor(pt.y - b.height / 2), b.width, b.height);
				 	this.bends[i + 1].redraw();
				 	
				 	if (this.manageLabelHandle)
					{
						this.checkLabelHandle(this.bends[i + 1].bounds);
					}
				}
			}
			
			if (straight)
			{
				bpmUtils.setOpacity(this.bends[1].node, this.virtualBendOpacity);
				bpmUtils.setOpacity(this.bends[3].node, this.virtualBendOpacity);
			}
		}
	}
};


/* Key Handler */
function bpmKeyHandler(graph, target)
{
	if (graph != null)
	{
		this.graph = graph;
		this.target = target || document.documentElement;
		
		this.normalKeys = [];
		this.shiftKeys = [];
		this.controlKeys = [];
		this.controlShiftKeys = [];
		
		this.keydownHandler = bpmUtils.bind(this, function(evt)
		{
			this.keyDown(evt);
		});

		bpmEvent.addListener(this.target, 'keydown', this.keydownHandler);
		
		if (bpmCore.IS_IE)
		{
			bpmEvent.addListener(window, 'unload',
				bpmUtils.bind(this, function()
				{
					this.destroy();
				})
			);
		}
	}
};

bpmKeyHandler.prototype.graph = null;
bpmKeyHandler.prototype.target = null;
bpmKeyHandler.prototype.normalKeys = null;
bpmKeyHandler.prototype.shiftKeys = null;
bpmKeyHandler.prototype.controlKeys = null;
bpmKeyHandler.prototype.controlShiftKeys = null;
bpmKeyHandler.prototype.enabled = true;

bpmKeyHandler.prototype.isEnabled = function()
{
	return this.enabled;
};

bpmKeyHandler.prototype.setEnabled = function(enabled)
{
	this.enabled = enabled;
};

bpmKeyHandler.prototype.bindKey = function(code, funct)
{
	this.normalKeys[code] = funct;
};

bpmKeyHandler.prototype.bindShiftKey = function(code, funct)
{
	this.shiftKeys[code] = funct;
};

bpmKeyHandler.prototype.bindControlKey = function(code, funct)
{
	this.controlKeys[code] = funct;
};

bpmKeyHandler.prototype.bindControlShiftKey = function(code, funct)
{
	this.controlShiftKeys[code] = funct;
};

bpmKeyHandler.prototype.isControlDown = function(evt)
{
	return bpmEvent.isControlDown(evt);
};

bpmKeyHandler.prototype.getFunction = function(evt)
{
	if (evt != null && !bpmEvent.isAltDown(evt))
	{
		if (this.isControlDown(evt))
		{
			if (bpmEvent.isShiftDown(evt))
			{
				return this.controlShiftKeys[evt.keyCode];
			}
			else
			{
				return this.controlKeys[evt.keyCode];
			}
		}
		else
		{
			if (bpmEvent.isShiftDown(evt))
			{
				return this.shiftKeys[evt.keyCode];
			}
			else
			{
				return this.normalKeys[evt.keyCode];
			}
		}
	}
	
	return null;
};

bpmKeyHandler.prototype.isGraphEvent = function(evt)
{
	var source = bpmEvent.getSource(evt);
	
	if ((source == this.target || source.parentNode == this.target) ||
		(this.graph.cellEditor != null && this.graph.cellEditor.isEventSource(evt)))
	{
		return true;
	}
	
	return bpmUtils.isAncestorNode(this.graph.container, source);
};

bpmKeyHandler.prototype.keyDown = function(evt)
{
	if (this.isEnabledForEvent(evt))
	{
		if (evt.keyCode == 27 /* Escape */)
		{
			this.escape(evt);
		}
		
		else if (!this.isEventIgnored(evt))
		{
			var boundFunction = this.getFunction(evt);
			
			if (boundFunction != null)
			{
				boundFunction(evt);
				bpmEvent.consume(evt);
			}
		}
	}
};

bpmKeyHandler.prototype.isEnabledForEvent = function(evt)
{
	return (this.graph.isEnabled() && !bpmEvent.isConsumed(evt) &&
		this.isGraphEvent(evt) && this.isEnabled());
};

bpmKeyHandler.prototype.isEventIgnored = function(evt)
{
	return this.graph.isEditing();
};

bpmKeyHandler.prototype.escape = function(evt)
{
	if (this.graph.isEscapeEnabled())
	{
		this.graph.escape(evt);
	}
};

bpmKeyHandler.prototype.destroy = function()
{
	if (this.target != null && this.keydownHandler != null)
	{
		bpmEvent.removeListener(this.target, 'keydown', this.keydownHandler);
		this.keydownHandler = null;
	}
	
	this.target = null;
};



/* Tooltip Handler */
function bpmTooltipHandler(graph, delay)
{
	if (graph != null)
	{
		this.graph = graph;
		this.delay = delay || 500;
		this.graph.addMouseListener(this);
	}
};

bpmTooltipHandler.prototype.zIndex = 10005;
bpmTooltipHandler.prototype.graph = null;
bpmTooltipHandler.prototype.delay = null;
bpmTooltipHandler.prototype.ignoreTouchEvents = true;
bpmTooltipHandler.prototype.hideOnHover = false;
bpmTooltipHandler.prototype.destroyed = false;
bpmTooltipHandler.prototype.enabled = true;

bpmTooltipHandler.prototype.isEnabled = function()
{
	return this.enabled;
};

bpmTooltipHandler.prototype.setEnabled = function(enabled)
{
	this.enabled = enabled;
};

bpmTooltipHandler.prototype.isHideOnHover = function()
{
	return this.hideOnHover;
};

bpmTooltipHandler.prototype.setHideOnHover = function(value)
{
	this.hideOnHover = value;
};

bpmTooltipHandler.prototype.init = function()
{
	if (document.body != null)
	{
		this.div = document.createElement('div');
		this.div.className = 'bpmTooltip';
		this.div.style.visibility = 'hidden';

		document.body.appendChild(this.div);

		bpmEvent.addGestureListeners(this.div, bpmUtils.bind(this, function(evt)
		{
			this.hideTooltip();
		}));
	}
};

bpmTooltipHandler.prototype.getStateForEvent = function(me)
{
	return me.getState();
};

bpmTooltipHandler.prototype.mouseDown = function(sender, me)
{
	this.reset(me, false);
	this.hideTooltip();
};

bpmTooltipHandler.prototype.mouseMove = function(sender, me)
{
	if (me.getX() != this.lastX || me.getY() != this.lastY)
	{
		this.reset(me, true);
		var state = this.getStateForEvent(me);
		
		if (this.isHideOnHover() || state != this.state || (me.getSource() != this.node &&
			(!this.stateSource || (state != null && this.stateSource ==
			(me.isSource(state.shape) || !me.isSource(state.text))))))
		{
			this.hideTooltip();
		}
	}
	
	this.lastX = me.getX();
	this.lastY = me.getY();
};

bpmTooltipHandler.prototype.mouseUp = function(sender, me)
{
	this.reset(me, true);
	this.hideTooltip();
};

bpmTooltipHandler.prototype.resetTimer = function()
{
	if (this.thread != null)
	{
		window.clearTimeout(this.thread);
		this.thread = null;
	}
};

bpmTooltipHandler.prototype.reset = function(me, restart, state)
{
	if (!this.ignoreTouchEvents || bpmEvent.isMouseEvent(me.getEvent()))
	{
		this.resetTimer();
		state = (state != null) ? state : this.getStateForEvent(me);
		
		if (restart && this.isEnabled() && state != null && (this.div == null ||
			this.div.style.visibility == 'hidden'))
		{
			var node = me.getSource();
			var x = me.getX();
			var y = me.getY();
			var stateSource = me.isSource(state.shape) || me.isSource(state.text);
	
			this.thread = window.setTimeout(bpmUtils.bind(this, function()
			{
				if (!this.graph.isEditing() && !this.graph.popupMenuHandler.isMenuShowing() && !this.graph.isMouseDown)
				{
					var tip = this.graph.getTooltip(state, node, x, y);
					this.show(tip, x, y);
					this.state = state;
					this.node = node;
					this.stateSource = stateSource;
				}
			}), this.delay);
		}
	}
};

bpmTooltipHandler.prototype.hide = function()
{
	this.resetTimer();
	this.hideTooltip();
};

bpmTooltipHandler.prototype.hideTooltip = function()
{
	if (this.div != null)
	{
		this.div.style.visibility = 'hidden';
		this.div.innerHTML = '';
	}
};

bpmTooltipHandler.prototype.show = function(tip, x, y)
{
	if (!this.destroyed && tip != null && tip.length > 0)
	{
		if (this.div == null)
		{
			this.init();
		}
		
		var origin = bpmUtils.getScrollOrigin();

		this.div.style.zIndex = this.zIndex;
		this.div.style.left = (x + origin.x) + 'px';
		this.div.style.top = (y + bpmConstants.TOOLTIP_VERTICAL_OFFSET +
			origin.y) + 'px';

		if (!bpmUtils.isNode(tip))
		{	
			this.div.innerHTML = tip.replace(/\n/g, '<br>');
		}
		else
		{
			this.div.innerHTML = '';
			this.div.appendChild(tip);
		}
		
		this.div.style.visibility = '';
		bpmUtils.fit(this.div);
	}
};

bpmTooltipHandler.prototype.destroy = function()
{
	if (!this.destroyed)
	{
		this.graph.removeMouseListener(this);
		bpmEvent.release(this.div);
		
		if (this.div != null && this.div.parentNode != null)
		{
			this.div.parentNode.removeChild(this.div);
		}
		
		this.destroyed = true;
		this.div = null;
	}
};



/* Cell Tracker */

function bpmCellTracker(graph, color, funct)
{
	bpmCellMarker.call(this, graph, color);

	this.graph.addMouseListener(this);
	
	if (funct != null)
	{
		this.getCell = funct;
	}
	
	if (bpmCore.IS_IE)
	{
		bpmEvent.addListener(window, 'unload', bpmUtils.bind(this, function()
		{
			this.destroy();
		}));
	}
};

bpmUtils.extend(bpmCellTracker, bpmCellMarker);

bpmCellTracker.prototype.mouseDown = function(sender, me) { };

bpmCellTracker.prototype.mouseMove = function(sender, me)
{
	if (this.isEnabled())
	{
		this.process(me);
	}
};

bpmCellTracker.prototype.mouseUp = function(sender, me) { };

bpmCellTracker.prototype.destroy = function()
{
	if (!this.destroyed)
	{
		this.destroyed = true;

		this.graph.removeMouseListener(this);
		bpmCellMarker.prototype.destroy.apply(this);
	}
};


/* Cell Hightlight */
function bpmCellHighlight(graph, highlightColor, strokeWidth, dashed)
{
	if (graph != null)
	{
		this.graph = graph;
		this.highlightColor = (highlightColor != null) ? highlightColor : bpmConstants.DEFAULT_VALID_COLOR;
		this.strokeWidth = (strokeWidth != null) ? strokeWidth : bpmConstants.HIGHLIGHT_STROKEWIDTH;
		this.dashed = (dashed != null) ? dashed : false;
		this.opacity = bpmConstants.HIGHLIGHT_OPACITY;

		this.repaintHandler = bpmUtils.bind(this, function()
		{
			if (this.state != null)
			{
				var tmp = this.graph.view.getState(this.state.cell);
				
				if (tmp == null)
				{
					this.hide();
				}
				else
				{
					this.state = tmp;
					this.repaint();
				}
			}
		});

		this.graph.getView().addListener(bpmEvent.SCALE, this.repaintHandler);
		this.graph.getView().addListener(bpmEvent.TRANSLATE, this.repaintHandler);
		this.graph.getView().addListener(bpmEvent.SCALE_AND_TRANSLATE, this.repaintHandler);
		this.graph.getModel().addListener(bpmEvent.CHANGE, this.repaintHandler);

		this.resetHandler = bpmUtils.bind(this, function()
		{
			this.hide();
		});

		this.graph.getView().addListener(bpmEvent.DOWN, this.resetHandler);
		this.graph.getView().addListener(bpmEvent.UP, this.resetHandler);
	}
};

bpmCellHighlight.prototype.keepOnTop = false;
bpmCellHighlight.prototype.graph = true;
bpmCellHighlight.prototype.state = null;
bpmCellHighlight.prototype.spacing = 2;
bpmCellHighlight.prototype.resetHandler = null;

bpmCellHighlight.prototype.setHighlightColor = function(color)
{
	this.highlightColor = color;
	
	if (this.shape != null)
	{
		this.shape.stroke = color;
	}
};

bpmCellHighlight.prototype.drawHighlight = function()
{
	this.shape = this.createShape();
	this.repaint();

	if (!this.keepOnTop && this.shape.node.parentNode.firstChild != this.shape.node)
	{
		this.shape.node.parentNode.insertBefore(this.shape.node, this.shape.node.parentNode.firstChild);
	}
};

bpmCellHighlight.prototype.createShape = function()
{
	var shape = this.graph.cellRenderer.createShape(this.state);
	
	shape.svgStrokeTolerance = this.graph.tolerance;
	shape.points = this.state.absolutePoints;
	shape.apply(this.state);
	shape.stroke = this.highlightColor;
	shape.opacity = this.opacity;
	shape.isDashed = this.dashed;
	shape.isShadow = false;
	
	shape.dialect = (this.graph.dialect != bpmConstants.DIALECT_SVG) ? bpmConstants.DIALECT_VML : bpmConstants.DIALECT_SVG;
	shape.init(this.graph.getView().getOverlayPane());
	bpmEvent.redirectMouseEvents(shape.node, this.graph, this.state);
	
	if (this.graph.dialect != bpmConstants.DIALECT_SVG)
	{
		shape.pointerEvents = false;
	}
	else
	{
		shape.svgPointerEvents = 'stroke';
	}
	
	return shape;
};

bpmCellHighlight.prototype.getStrokeWidth = function(state)
{
	return this.strokeWidth;
};

bpmCellHighlight.prototype.repaint = function()
{
	if (this.state != null && this.shape != null)
	{
		this.shape.scale = this.state.view.scale;
		
		if (this.graph.model.isEdge(this.state.cell))
		{
			this.shape.strokewidth = this.getStrokeWidth();
			this.shape.points = this.state.absolutePoints;
			this.shape.outline = false;
		}
		else
		{
			this.shape.bounds = new bpmRectangle(this.state.x - this.spacing, this.state.y - this.spacing,
					this.state.width + 2 * this.spacing, this.state.height + 2 * this.spacing);
			this.shape.rotation = Number(this.state.style[bpmConstants.STYLE_ROTATION] || '0');
			this.shape.strokewidth = this.getStrokeWidth() / this.state.view.scale;
			this.shape.outline = true;
		}

		if (this.state.shape != null)
		{
			this.shape.setCursor(this.state.shape.getCursor());
		}
		
		if (bpmCore.IS_QUIRKS || document.documentMode == 8)
		{
			if (this.shape.stroke == 'transparent')
			{
				this.shape.stroke = 'white';
				this.shape.opacity = 1;
			}
			else
			{
				this.shape.opacity = this.opacity;
			}
		}
		
		this.shape.redraw();
	}
};

bpmCellHighlight.prototype.hide = function()
{
	this.highlight(null);
};

bpmCellHighlight.prototype.highlight = function(state)
{
	if (this.state != state)
	{
		if (this.shape != null)
		{
			this.shape.destroy();
			this.shape = null;
		}

		this.state = state;
		
		if (this.state != null)
		{
			this.drawHighlight();
		}
	}
};

bpmCellHighlight.prototype.isHighlightAt = function(x, y)
{
	var hit = false;
	if (this.shape != null && document.elementFromPoint != null && !bpmCore.IS_QUIRKS)
	{
		var elt = document.elementFromPoint(x, y);

		while (elt != null)
		{
			if (elt == this.shape.node)
			{
				hit = true;
				break;
			}
			
			elt = elt.parentNode;
		}
	}
	
	return hit;
};

bpmCellHighlight.prototype.destroy = function()
{
	this.graph.getView().removeListener(this.resetHandler);
	this.graph.getView().removeListener(this.repaintHandler);
	this.graph.getModel().removeListener(this.repaintHandler);
	
	if (this.shape != null)
	{
		this.shape.destroy();
		this.shape = null;
	}
};


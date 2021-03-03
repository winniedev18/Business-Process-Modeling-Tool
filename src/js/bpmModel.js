
/* Draw Model */
function bpmGraphModel(root)
{
	this.currentEdit = this.createUndoableEdit();
	
	if (root != null)
	{
		this.setRoot(root);
	}
	else
	{
		this.clear();
	}
};

bpmGraphModel.prototype = new bpmEventSource();
bpmGraphModel.prototype.constructor = bpmGraphModel;
bpmGraphModel.prototype.root = null;
bpmGraphModel.prototype.cells = null;
bpmGraphModel.prototype.maintainEdgeParent = true;
bpmGraphModel.prototype.ignoreRelativeEdgeParent = true;
bpmGraphModel.prototype.createIds = true;
bpmGraphModel.prototype.prefix = '';
bpmGraphModel.prototype.postfix = '';
bpmGraphModel.prototype.nextId = 0;
bpmGraphModel.prototype.currentEdit = null;
bpmGraphModel.prototype.updateLevel = 0;
bpmGraphModel.prototype.endingUpdate = false;

bpmGraphModel.prototype.clear = function()
{
	this.setRoot(this.createRoot());
};

bpmGraphModel.prototype.isCreateIds = function()
{
	return this.createIds;
};

bpmGraphModel.prototype.setCreateIds = function(value)
{
	this.createIds = value;
};

bpmGraphModel.prototype.createRoot = function()
{
	var cell = new bpmCell();
	cell.insert(new bpmCell());
	
	return cell;
};

bpmGraphModel.prototype.getCell = function(id)
{
	return (this.cells != null) ? this.cells[id] : null;
};

bpmGraphModel.prototype.filterCells = function(cells, filter)
{
	var result = null;
	
	if (cells != null)
	{
		result = [];
		
		for (var i = 0; i < cells.length; i++)
		{
			if (filter(cells[i]))
			{
				result.push(cells[i]);
			}
		}
	}
	
	return result;
};

bpmGraphModel.prototype.getDescendants = function(parent)
{
	return this.filterDescendants(null, parent);
};

bpmGraphModel.prototype.filterDescendants = function(filter, parent)
{
	var result = [];

	parent = parent || this.getRoot();
	
	if (filter == null || filter(parent))
	{
		result.push(parent);
	}
	
	var childCount = this.getChildCount(parent);
	
	for (var i = 0; i < childCount; i++)
	{
		var child = this.getChildAt(parent, i);
		result = result.concat(this.filterDescendants(filter, child));
	}

	return result;
};

bpmGraphModel.prototype.getRoot = function(cell)
{
	var root = cell || this.root;
	
	if (cell != null)
	{
		while (cell != null)
		{
			root = cell;
			cell = this.getParent(cell);
		}
	}
	
	return root;
};

bpmGraphModel.prototype.setRoot = function(root)
{
	this.execute(new bpmRootChange(this, root));
	
	return root;
};

bpmGraphModel.prototype.rootChanged = function(root)
{
	var oldRoot = this.root;
	this.root = root;
	this.nextId = 0;
	this.cells = null;
	this.cellAdded(root);
	
	return oldRoot;
};

bpmGraphModel.prototype.isRoot = function(cell)
{
	return cell != null && this.root == cell;
};

bpmGraphModel.prototype.isLayer = function(cell)
{
	return this.isRoot(this.getParent(cell));
};

bpmGraphModel.prototype.isAncestor = function(parent, child)
{
	while (child != null && child != parent)
	{
		child = this.getParent(child);
	}
	
	return child == parent;
};

bpmGraphModel.prototype.contains = function(cell)
{
	return this.isAncestor(this.root, cell);
};

bpmGraphModel.prototype.getParent = function(cell)
{
	return (cell != null) ? cell.getParent() : null;
};

bpmGraphModel.prototype.add = function(parent, child, index)
{
	if (child != parent && parent != null && child != null)
	{	
		if (index == null)
		{
			index = this.getChildCount(parent);
		}
		
		var parentChanged = parent != this.getParent(child);
		this.execute(new bpmChildChange(this, parent, child, index));

		if (this.maintainEdgeParent && parentChanged)
		{
			this.updateEdgeParents(child);
		}
	}
	
	return child;
};

bpmGraphModel.prototype.cellAdded = function(cell)
{
	if (cell != null)
	{
		if (cell.getId() == null && this.createIds)
		{
			cell.setId(this.createId(cell));
		}
		
		if (cell.getId() != null)
		{
			var collision = this.getCell(cell.getId());
			
			if (collision != cell)
			{	
				while (collision != null)
				{
					cell.setId(this.createId(cell));
					collision = this.getCell(cell.getId());
				}
				
				if (this.cells == null)
				{
					this.cells = new Object();
				}
				
				this.cells[cell.getId()] = cell;
			}
		}
		
		if (bpmUtils.isNumeric(cell.getId()))
		{
			this.nextId = Math.max(this.nextId, cell.getId());
		}
		
		var childCount = this.getChildCount(cell);
		
		for (var i=0; i<childCount; i++)
		{
			this.cellAdded(this.getChildAt(cell, i));
		}
	}
};

bpmGraphModel.prototype.createId = function(cell)
{
	var id = this.nextId;
	this.nextId++;
	
	return this.prefix + id + this.postfix;
};

bpmGraphModel.prototype.updateEdgeParents = function(cell, root)
{
	root = root || this.getRoot(cell);
	var childCount = this.getChildCount(cell);
	
	for (var i = 0; i < childCount; i++)
	{
		var child = this.getChildAt(cell, i);
		this.updateEdgeParents(child, root);
	}
	
	var edgeCount = this.getEdgeCount(cell);
	var edges = [];

	for (var i = 0; i < edgeCount; i++)
	{
		edges.push(this.getEdgeAt(cell, i));
	}
	
	for (var i = 0; i < edges.length; i++)
	{
		var edge = edges[i];
	
		if (this.isAncestor(root, edge))
		{
			this.updateEdgeParent(edge, root);
		}
	}
};

bpmGraphModel.prototype.updateEdgeParent = function(edge, root)
{
	var source = this.getTerminal(edge, true);
	var target = this.getTerminal(edge, false);
	var cell = null;
	
	while (source != null && !this.isEdge(source) &&
		source.geometry != null && source.geometry.relative)
	{
		source = this.getParent(source);
	}
	
	while (target != null && this.ignoreRelativeEdgeParent &&
		!this.isEdge(target) && target.geometry != null && 
		target.geometry.relative)
	{
		target = this.getParent(target);
	}
	
	if (this.isAncestor(root, source) && this.isAncestor(root, target))
	{
		if (source == target)
		{
			cell = this.getParent(source);
		}
		else
		{
			cell = this.getNearestCommonAncestor(source, target);
		}

		if (cell != null && (this.getParent(cell) != this.root ||
			this.isAncestor(cell, edge)) && this.getParent(edge) != cell)
		{
			var geo = this.getGeometry(edge);
			
			if (geo != null)
			{
				var origin1 = this.getOrigin(this.getParent(edge));
				var origin2 = this.getOrigin(cell);
				
				var dx = origin2.x - origin1.x;
				var dy = origin2.y - origin1.y;
				
				geo = geo.clone();
				geo.translate(-dx, -dy);
				this.setGeometry(edge, geo);
			}

			this.add(cell, edge, this.getChildCount(cell));
		}
	}
};

bpmGraphModel.prototype.getOrigin = function(cell)
{
	var result = null;
	
	if (cell != null)
	{
		result = this.getOrigin(this.getParent(cell));
		
		if (!this.isEdge(cell))
		{
			var geo = this.getGeometry(cell);
			
			if (geo != null)
			{
				result.x += geo.x;
				result.y += geo.y;
			}
		}
	}
	else
	{
		result = new bpmPoint();
	}
	
	return result;
};

bpmGraphModel.prototype.getNearestCommonAncestor = function(cell1, cell2)
{
	if (cell1 != null && cell2 != null)
	{		
		var path = bpmCellPath.create(cell2);

		if (path != null && path.length > 0)
		{
			var cell = cell1;
			var current = bpmCellPath.create(cell);
			if (path.length < current.length)
			{
				cell = cell2;
				var tmp = current;
				current = path;
				path = tmp;
			}
			
			while (cell != null)
			{
				var parent = this.getParent(cell);
				
				if (path.indexOf(current + bpmCellPath.PATH_SEPARATOR) == 0 && parent != null)
				{
					return cell;
				}
				
				current = bpmCellPath.getParentPath(current);
				cell = parent;
			}
		}
	}
	
	return null;
};

bpmGraphModel.prototype.remove = function(cell)
{
	if (cell == this.root)
	{
		this.setRoot(null);
	}
	else if (this.getParent(cell) != null)
	{
		this.execute(new bpmChildChange(this, null, cell));
	}
	
	return cell;
};

bpmGraphModel.prototype.cellRemoved = function(cell)
{
	if (cell != null && this.cells != null)
	{
		var childCount = this.getChildCount(cell);
		
		for (var i = childCount - 1; i >= 0; i--)
		{
			this.cellRemoved(this.getChildAt(cell, i));
		}
		
		if (this.cells != null && cell.getId() != null)
		{
			delete this.cells[cell.getId()];
		}
	}
};

bpmGraphModel.prototype.parentForCellChanged = function(cell, parent, index)
{
	var previous = this.getParent(cell);
	
	if (parent != null)
	{
		if (parent != previous || previous.getIndex(cell) != index)
		{
			parent.insert(cell, index);
		}
	}
	else if (previous != null)
	{
		var oldIndex = previous.getIndex(cell);
		previous.remove(oldIndex);
	}
	
	var par = this.contains(parent);
	var pre = this.contains(previous);
	
	if (par && !pre)
	{
		this.cellAdded(cell);
	}
	else if (pre && !par)
	{
		this.cellRemoved(cell);
	}
	
	return previous;
};

bpmGraphModel.prototype.getChildCount = function(cell)
{
	return (cell != null) ? cell.getChildCount() : 0;
};

bpmGraphModel.prototype.getChildAt = function(cell, index)
{
	return (cell != null) ? cell.getChildAt(index) : null;
};

bpmGraphModel.prototype.getChildren = function(cell)
{
	return (cell != null) ? cell.children : null;
};

bpmGraphModel.prototype.getChildVertices = function(parent)
{
	return this.getChildCells(parent, true, false);
};
		
bpmGraphModel.prototype.getChildEdges = function(parent)
{
	return this.getChildCells(parent, false, true);
};

bpmGraphModel.prototype.getChildCells = function(parent, vertices, edges)
{
	vertices = (vertices != null) ? vertices : false;
	edges = (edges != null) ? edges : false;
	
	var childCount = this.getChildCount(parent);
	var result = [];

	for (var i = 0; i < childCount; i++)
	{
		var child = this.getChildAt(parent, i);

		if ((!edges && !vertices) || (edges && this.isEdge(child)) ||
			(vertices && this.isVertex(child)))
		{
			result.push(child);
		}
	}

	return result;
};
		
bpmGraphModel.prototype.getTerminal = function(edge, isSource)
{
	return (edge != null) ? edge.getTerminal(isSource) : null;
};

bpmGraphModel.prototype.setTerminal = function(edge, terminal, isSource)
{
	var terminalChanged = terminal != this.getTerminal(edge, isSource);
	this.execute(new bpmTerminalChange(this, edge, terminal, isSource));
	
	if (this.maintainEdgeParent && terminalChanged)
	{
		this.updateEdgeParent(edge, this.getRoot());
	}
	
	return terminal;
};
	
bpmGraphModel.prototype.setTerminals = function(edge, source, target)
{
	this.beginUpdate();
	try
	{
		this.setTerminal(edge, source, true);
		this.setTerminal(edge, target, false);
	}
	finally
	{
		this.endUpdate();
	}
};

bpmGraphModel.prototype.terminalForCellChanged = function(edge, terminal, isSource)
{
	var previous = this.getTerminal(edge, isSource);
	
	if (terminal != null)
	{
		terminal.insertEdge(edge, isSource);
	}
	else if (previous != null)
	{
		previous.removeEdge(edge, isSource);
	}
	
	return previous;
};

bpmGraphModel.prototype.getEdgeCount = function(cell)
{
	return (cell != null) ? cell.getEdgeCount() : 0;
};

bpmGraphModel.prototype.getEdgeAt = function(cell, index)
{
	return (cell != null) ? cell.getEdgeAt(index) : null;
};
	
bpmGraphModel.prototype.getDirectedEdgeCount = function(cell, outgoing, ignoredEdge)
{
	var count = 0;
	var edgeCount = this.getEdgeCount(cell);

	for (var i = 0; i < edgeCount; i++)
	{
		var edge = this.getEdgeAt(cell, i);

		if (edge != ignoredEdge && this.getTerminal(edge, outgoing) == cell)
		{
			count++;
		}
	}

	return count;
};

bpmGraphModel.prototype.getConnections = function(cell)
{
	return this.getEdges(cell, true, true, false);
};

bpmGraphModel.prototype.getIncomingEdges = function(cell)
{
	return this.getEdges(cell, true, false, false);
};

bpmGraphModel.prototype.getOutgoingEdges = function(cell)
{
	return this.getEdges(cell, false, true, false);
};

bpmGraphModel.prototype.getEdges = function(cell, incoming, outgoing, includeLoops)
{
	incoming = (incoming != null) ? incoming : true;
	outgoing = (outgoing != null) ? outgoing : true;
	includeLoops = (includeLoops != null) ? includeLoops : true;
	
	var edgeCount = this.getEdgeCount(cell);
	var result = [];

	for (var i = 0; i < edgeCount; i++)
	{
		var edge = this.getEdgeAt(cell, i);
		var source = this.getTerminal(edge, true);
		var target = this.getTerminal(edge, false);

		if ((includeLoops && source == target) || ((source != target) && ((incoming && target == cell) ||
			(outgoing && source == cell))))
		{
			result.push(edge);
		}
	}

	return result;
};

bpmGraphModel.prototype.getEdgesBetween = function(source, target, directed)
{
	directed = (directed != null) ? directed : false;
	
	var tmp1 = this.getEdgeCount(source);
	var tmp2 = this.getEdgeCount(target);
	
	var terminal = source;
	var edgeCount = tmp1;
	
	if (tmp2 < tmp1)
	{
		edgeCount = tmp2;
		terminal = target;
	}
	
	var result = [];
	for (var i = 0; i < edgeCount; i++)
	{
		var edge = this.getEdgeAt(terminal, i);
		var src = this.getTerminal(edge, true);
		var trg = this.getTerminal(edge, false);
		var directedMatch = (src == source) && (trg == target);
		var oppositeMatch = (trg == source) && (src == target);

		if (directedMatch || (!directed && oppositeMatch))
		{
			result.push(edge);
		}
	}
	
	return result;
};

bpmGraphModel.prototype.getOpposites = function(edges, terminal, sources, targets)
{
	sources = (sources != null) ? sources : true;
	targets = (targets != null) ? targets : true;
	
	var terminals = [];
	
	if (edges != null)
	{
		for (var i = 0; i < edges.length; i++)
		{
			var source = this.getTerminal(edges[i], true);
			var target = this.getTerminal(edges[i], false);
			
			if (source == terminal && target != null && target != terminal && targets)
			{
				terminals.push(target);
			}
			
			else if (target == terminal && source != null && source != terminal && sources)
			{
				terminals.push(source);
			}
		}
	}
	
	return terminals;
};

bpmGraphModel.prototype.getTopmostCells = function(cells)
{
	var dict = new bpmDictionary();
	var tmp = [];
	
	for (var i = 0; i < cells.length; i++)
	{
		dict.put(cells[i], true);
	}
	
	for (var i = 0; i < cells.length; i++)
	{
		var cell = cells[i];
		var topmost = true;
		var parent = this.getParent(cell);
		
		while (parent != null)
		{
			if (dict.get(parent))
			{
				topmost = false;
				break;
			}
			
			parent = this.getParent(parent);
		}
		
		if (topmost)
		{
			tmp.push(cell);
		}
	}
	
	return tmp;
};

bpmGraphModel.prototype.isVertex = function(cell)
{
	return (cell != null) ? cell.isVertex() : false;
};

bpmGraphModel.prototype.isEdge = function(cell)
{
	return (cell != null) ? cell.isEdge() : false;
};

bpmGraphModel.prototype.isConnectable = function(cell)
{
	return (cell != null) ? cell.isConnectable() : false;
};

bpmGraphModel.prototype.getValue = function(cell)
{
	return (cell != null) ? cell.getValue() : null;
};

bpmGraphModel.prototype.setValue = function(cell, value)
{
	this.execute(new bpmValueChange(this, cell, value));
	
	return value;
};

bpmGraphModel.prototype.valueForCellChanged = function(cell, value)
{
	return cell.valueChanged(value);
};

bpmGraphModel.prototype.getGeometry = function(cell)
{
	return (cell != null) ? cell.getGeometry() : null;
};

bpmGraphModel.prototype.setGeometry = function(cell, geometry)
{
	if (geometry != this.getGeometry(cell))
	{
		this.execute(new bpmGeometryChange(this, cell, geometry));
	}
	
	return geometry;
};

bpmGraphModel.prototype.geometryForCellChanged = function(cell, geometry)
{
	var previous = this.getGeometry(cell);
	cell.setGeometry(geometry);
	
	return previous;
};

bpmGraphModel.prototype.getStyle = function(cell)
{
	return (cell != null) ? cell.getStyle() : null;
};

bpmGraphModel.prototype.setStyle = function(cell, style)
{
	if (style != this.getStyle(cell))
	{
		this.execute(new bpmStyleChange(this, cell, style));
	}
	
	return style;
};

bpmGraphModel.prototype.styleForCellChanged = function(cell, style)
{
	var previous = this.getStyle(cell);
	cell.setStyle(style);
	
	return previous;
};

bpmGraphModel.prototype.isCollapsed = function(cell)
{
	return (cell != null) ? cell.isCollapsed() : false;
};

bpmGraphModel.prototype.setCollapsed = function(cell, collapsed)
{
	if (collapsed != this.isCollapsed(cell))
	{
		this.execute(new bpmCollapseChange(this, cell, collapsed));
	}
	
	return collapsed;
};
	
bpmGraphModel.prototype.collapsedStateForCellChanged = function(cell, collapsed)
{
	var previous = this.isCollapsed(cell);
	cell.setCollapsed(collapsed);
	
	return previous;
};

bpmGraphModel.prototype.isVisible = function(cell)
{
	return (cell != null) ? cell.isVisible() : false;
};

bpmGraphModel.prototype.setVisible = function(cell, visible)
{
	if (visible != this.isVisible(cell))
	{
		this.execute(new bpmVisibleChange(this, cell, visible));
	}
	
	return visible;
};
	
bpmGraphModel.prototype.visibleStateForCellChanged = function(cell, visible)
{
	var previous = this.isVisible(cell);
	cell.setVisible(visible);
	
	return previous;
};

bpmGraphModel.prototype.execute = function(change)
{
	change.execute();
	this.beginUpdate();
	this.currentEdit.add(change);
	this.fireEvent(new bpmEventObject(bpmEvent.EXECUTE, 'change', change));
	// New global executed event
	this.fireEvent(new bpmEventObject(bpmEvent.EXECUTED, 'change', change));
	this.endUpdate();
};

bpmGraphModel.prototype.beginUpdate = function()
{
	this.updateLevel++;
	this.fireEvent(new bpmEventObject(bpmEvent.BEGIN_UPDATE));
	
	if (this.updateLevel == 1)
	{
		this.fireEvent(new bpmEventObject(bpmEvent.START_EDIT));
	}
};

bpmGraphModel.prototype.endUpdate = function()
{
	this.updateLevel--;
	
	if (this.updateLevel == 0)
	{
		this.fireEvent(new bpmEventObject(bpmEvent.END_EDIT));
	}
	
	if (!this.endingUpdate)
	{
		this.endingUpdate = this.updateLevel == 0;
		this.fireEvent(new bpmEventObject(bpmEvent.END_UPDATE, 'edit', this.currentEdit));

		try
		{		
			if (this.endingUpdate && !this.currentEdit.isEmpty())
			{
				this.fireEvent(new bpmEventObject(bpmEvent.BEFORE_UNDO, 'edit', this.currentEdit));
				var tmp = this.currentEdit;
				this.currentEdit = this.createUndoableEdit();
				tmp.notify();
				this.fireEvent(new bpmEventObject(bpmEvent.UNDO, 'edit', tmp));
			}
		}
		finally
		{
			this.endingUpdate = false;
		}
	}
};

bpmGraphModel.prototype.createUndoableEdit = function(significant)
{
	var edit = new bpmUndoableEdit(this, (significant != null) ? significant : true);
	
	edit.notify = function()
	{
		// LATER: Remove changes property (deprecated)
		edit.source.fireEvent(new bpmEventObject(bpmEvent.CHANGE,
			'edit', edit, 'changes', edit.changes));
		edit.source.fireEvent(new bpmEventObject(bpmEvent.NOTIFY,
			'edit', edit, 'changes', edit.changes));
	};
	
	return edit;
};

bpmGraphModel.prototype.mergeChildren = function(from, to, cloneAllEdges)
{
	cloneAllEdges = (cloneAllEdges != null) ? cloneAllEdges : true;
	
	this.beginUpdate();
	try
	{
		var mapping = new Object();
		this.mergeChildrenImpl(from, to, cloneAllEdges, mapping);
		
		for (var key in mapping)
		{
			var cell = mapping[key];
			var terminal = this.getTerminal(cell, true);

			if (terminal != null)
			{
				terminal = mapping[bpmCellPath.create(terminal)];
				this.setTerminal(cell, terminal, true);
			}
			
			terminal = this.getTerminal(cell, false);
			
			if (terminal != null)
			{
				terminal = mapping[bpmCellPath.create(terminal)];
				this.setTerminal(cell, terminal, false);
			}
		}
	}
	finally
	{
		this.endUpdate();
	}
};

bpmGraphModel.prototype.mergeChildrenImpl = function(from, to, cloneAllEdges, mapping)
{
	this.beginUpdate();
	try
	{
		var childCount = from.getChildCount();
		
		for (var i = 0; i < childCount; i++)
		{
			var cell = from.getChildAt(i);
			
			if (typeof(cell.getId) == 'function')
			{
				var id = cell.getId();
				var target = (id != null && (!this.isEdge(cell) || !cloneAllEdges)) ?
						this.getCell(id) : null;
				
				if (target == null)
				{
					var clone = cell.clone();
					clone.setId(id);
					
					clone.setTerminal(cell.getTerminal(true), true);
					clone.setTerminal(cell.getTerminal(false), false);
					
					target = to.insert(clone);
					this.cellAdded(target);
				}
				
				mapping[bpmCellPath.create(cell)] = target;
				this.mergeChildrenImpl(cell, target, cloneAllEdges, mapping);
			}
		}
	}
	finally
	{
		this.endUpdate();
	}
};

bpmGraphModel.prototype.getParents = function(cells)
{
	var parents = [];
	
	if (cells != null)
	{
		var dict = new bpmDictionary();
		
		for (var i = 0; i < cells.length; i++)
		{
			var parent = this.getParent(cells[i]);
			
			if (parent != null && !dict.get(parent))
			{
				dict.put(parent, true);
				parents.push(parent);
			}
		}
	}
	
	return parents;
};

bpmGraphModel.prototype.cloneCell = function(cell)
{
	if (cell != null)
	{
		return this.cloneCells([cell], true)[0];
	}
	
	return null;
};

bpmGraphModel.prototype.cloneCells = function(cells, includeChildren, mapping)
{
	mapping = (mapping != null) ? mapping : new Object();
	var clones = [];
	
	for (var i = 0; i < cells.length; i++)
	{
		if (cells[i] != null)
		{
			clones.push(this.cloneCellImpl(cells[i], mapping, includeChildren));
		}
		else
		{
			clones.push(null);
		}
	}
	
	for (var i = 0; i < clones.length; i++)
	{
		if (clones[i] != null)
		{
			this.restoreClone(clones[i], cells[i], mapping);
		}
	}
	
	return clones;
};
	
bpmGraphModel.prototype.cloneCellImpl = function(cell, mapping, includeChildren)
{
	var ident = bpmObjectIdentity.get(cell);
	var clone = mapping[ident];
	
	if (clone == null)
	{
		clone = this.cellCloned(cell);
		mapping[ident] = clone;

		if (includeChildren)
		{
			var childCount = this.getChildCount(cell);
			
			for (var i = 0; i < childCount; i++)
			{
				var cloneChild = this.cloneCellImpl(
					this.getChildAt(cell, i), mapping, true);
				clone.insert(cloneChild);
			}
		}
	}
	
	return clone;
};

bpmGraphModel.prototype.cellCloned = function(cell)
{
	return cell.clone();
};

bpmGraphModel.prototype.restoreClone = function(clone, cell, mapping)
{
	var source = this.getTerminal(cell, true);
	
	if (source != null)
	{
		var tmp = mapping[bpmObjectIdentity.get(source)];
		
		if (tmp != null)
		{
			tmp.insertEdge(clone, true);
		}
	}
	
	var target = this.getTerminal(cell, false);
	
	if (target != null)
	{
		var tmp = mapping[bpmObjectIdentity.get(target)];
		
		if (tmp != null)
		{	
			tmp.insertEdge(clone, false);
		}
	}
	
	var childCount = this.getChildCount(clone);
	
	for (var i = 0; i < childCount; i++)
	{
		this.restoreClone(this.getChildAt(clone, i),
			this.getChildAt(cell, i), mapping);
	}
};

function bpmRootChange(model, root)
{
	this.model = model;
	this.root = root;
	this.previous = root;
};

bpmRootChange.prototype.execute = function()
{
	this.root = this.previous;
	this.previous = this.model.rootChanged(this.previous);
};

function bpmChildChange(model, parent, child, index)
{
	this.model = model;
	this.parent = parent;
	this.previous = parent;
	this.child = child;
	this.index = index;
	this.previousIndex = index;
};

bpmChildChange.prototype.execute = function()
{
	if (this.child != null)
	{
		var tmp = this.model.getParent(this.child);
		var tmp2 = (tmp != null) ? tmp.getIndex(this.child) : 0;
		
		if (this.previous == null)
		{
			this.connect(this.child, false);
		}
		
		tmp = this.model.parentForCellChanged(
			this.child, this.previous, this.previousIndex);
			
		if (this.previous != null)
		{
			this.connect(this.child, true);
		}
		
		this.parent = this.previous;
		this.previous = tmp;
		this.index = this.previousIndex;
		this.previousIndex = tmp2;
	}
};

bpmChildChange.prototype.connect = function(cell, isConnect)
{
	isConnect = (isConnect != null) ? isConnect : true;
	
	var source = cell.getTerminal(true);
	var target = cell.getTerminal(false);
	
	if (source != null)
	{
		if (isConnect)
		{
			this.model.terminalForCellChanged(cell, source, true);
		}
		else
		{
			this.model.terminalForCellChanged(cell, null, true);
		}
	}
	
	if (target != null)
	{
		if (isConnect)
		{
			this.model.terminalForCellChanged(cell, target, false);
		}
		else
		{
			this.model.terminalForCellChanged(cell, null, false);
		}
	}
	
	cell.setTerminal(source, true);
	cell.setTerminal(target, false);
	
	var childCount = this.model.getChildCount(cell);
	for (var i=0; i<childCount; i++)
	{
		this.connect(this.model.getChildAt(cell, i), isConnect);
	}
};

function bpmTerminalChange(model, cell, terminal, source)
{
	this.model = model;
	this.cell = cell;
	this.terminal = terminal;
	this.previous = terminal;
	this.source = source;
};

bpmTerminalChange.prototype.execute = function()
{
	if (this.cell != null)
	{
		this.terminal = this.previous;
		this.previous = this.model.terminalForCellChanged(
			this.cell, this.previous, this.source);
	}
};

function bpmValueChange(model, cell, value)
{
	this.model = model;
	this.cell = cell;
	this.value = value;
	this.previous = value;
};

bpmValueChange.prototype.execute = function()
{
	if (this.cell != null)
	{
		this.value = this.previous;
		this.previous = this.model.valueForCellChanged(
			this.cell, this.previous);
	}
};

function bpmStyleChange(model, cell, style)
{
	this.model = model;
	this.cell = cell;
	this.style = style;
	this.previous = style;
};

bpmStyleChange.prototype.execute = function()
{
	if (this.cell != null)
	{
		this.style = this.previous;
		this.previous = this.model.styleForCellChanged(
			this.cell, this.previous);
	}
};

function bpmGeometryChange(model, cell, geometry)
{
	this.model = model;
	this.cell = cell;
	this.geometry = geometry;
	this.previous = geometry;
};

bpmGeometryChange.prototype.execute = function()
{
	if (this.cell != null)
	{
		this.geometry = this.previous;
		this.previous = this.model.geometryForCellChanged(
			this.cell, this.previous);
	}
};

function bpmCollapseChange(model, cell, collapsed)
{
	this.model = model;
	this.cell = cell;
	this.collapsed = collapsed;
	this.previous = collapsed;
};

bpmCollapseChange.prototype.execute = function()
{
	if (this.cell != null)
	{
		this.collapsed = this.previous;
		this.previous = this.model.collapsedStateForCellChanged(
			this.cell, this.previous);
	}
};

function bpmVisibleChange(model, cell, visible)
{
	this.model = model;
	this.cell = cell;
	this.visible = visible;
	this.previous = visible;
};

bpmVisibleChange.prototype.execute = function()
{
	if (this.cell != null)
	{
		this.visible = this.previous;
		this.previous = this.model.visibleStateForCellChanged(
			this.cell, this.previous);
	}
};

function bpmCellAttributeChange(cell, attribute, value)
{
	this.cell = cell;
	this.attribute = attribute;
	this.value = value;
	this.previous = value;
};

bpmCellAttributeChange.prototype.execute = function()
{
	if (this.cell != null)
	{
		var tmp = this.cell.getAttribute(this.attribute);
		
		if (this.previous == null)
		{
			this.cell.value.removeAttribute(this.attribute);
		}
		else
		{
			this.cell.setAttribute(this.attribute, this.previous);
		}
		
		this.previous = tmp;
	}
};


/* Cell */
function bpmCell(value, geometry, style)
{
	this.value = value;
	this.setGeometry(geometry);
	this.setStyle(style);
	
	if (this.onInit != null)
	{
		this.onInit();
	}
};

bpmCell.prototype.id = null;
bpmCell.prototype.value = null;
bpmCell.prototype.geometry = null;
bpmCell.prototype.style = null;
bpmCell.prototype.vertex = false;
bpmCell.prototype.edge = false;
bpmCell.prototype.connectable = true;
bpmCell.prototype.visible = true;
bpmCell.prototype.collapsed = false;
bpmCell.prototype.parent = null;
bpmCell.prototype.source = null;
bpmCell.prototype.target = null;
bpmCell.prototype.children = null;
bpmCell.prototype.edges = null;
bpmCell.prototype.data = null;

bpmCell.prototype.bpmTransient = ['id', 'value', 'parent', 'source',
                                'target', 'children', 'edges', 'data'];

bpmCell.prototype.getId = function()
{
	return this.id;
};

bpmCell.prototype.setId = function(id)
{
	this.id = id;
};

bpmCell.prototype.getValue = function()
{
	return this.value;
};

bpmCell.prototype.setValue = function(value)
{
	this.value = value;
};

bpmCell.prototype.getData = function()
{
	return this.value;
};

bpmCell.prototype.setData = function(data)
{
	this.data = data;
};

bpmCell.prototype.valueChanged = function(newValue)
{
	var previous = this.getValue();
	this.setValue(newValue);
	
	return previous;
};

bpmCell.prototype.getGeometry = function()
{
	return this.geometry;
};

bpmCell.prototype.setGeometry = function(geometry)
{
	this.geometry = geometry;
};

bpmCell.prototype.getStyle = function()
{
	return this.style;
};

bpmCell.prototype.setStyle = function(style)
{
	this.style = style;
};

bpmCell.prototype.isVertex = function()
{
	return this.vertex != 0;
};

bpmCell.prototype.setVertex = function(vertex)
{
	this.vertex = vertex;
};

bpmCell.prototype.isEdge = function()
{
	return this.edge != 0;
};

bpmCell.prototype.setEdge = function(edge)
{
	this.edge = edge;
};

bpmCell.prototype.isConnectable = function()
{
	return this.connectable != 0;
};

bpmCell.prototype.setConnectable = function(connectable)
{
	this.connectable = connectable;
};

bpmCell.prototype.isVisible = function()
{
	return this.visible != 0;
};

bpmCell.prototype.setVisible = function(visible)
{
	this.visible = visible;
};

bpmCell.prototype.isCollapsed = function()
{
	return this.collapsed != 0;
};

bpmCell.prototype.setCollapsed = function(collapsed)
{
	this.collapsed = collapsed;
};

bpmCell.prototype.getParent = function()
{
	return this.parent;
};

bpmCell.prototype.setParent = function(parent)
{
	this.parent = parent;
};

bpmCell.prototype.getTerminal = function(source)
{
	return (source) ? this.source : this.target;
};

bpmCell.prototype.setTerminal = function(terminal, isSource)
{
	if (isSource)
	{
		this.source = terminal;
	}
	else
	{
		this.target = terminal;
	}
	
	return terminal;
};

bpmCell.prototype.getChildCount = function()
{
	return (this.children == null) ? 0 : this.children.length;
};

bpmCell.prototype.getIndex = function(child)
{
	return bpmUtils.indexOf(this.children, child);
};

bpmCell.prototype.getChildAt = function(index)
{
	return (this.children == null) ? null : this.children[index];
};

bpmCell.prototype.insert = function(child, index)
{
	if (child != null)
	{
		if (index == null)
		{
			index = this.getChildCount();
			
			if (child.getParent() == this)
			{
				index--;
			}
		}

		child.removeFromParent();
		child.setParent(this);
		
		if (this.children == null)
		{
			this.children = [];
			this.children.push(child);
		}
		else
		{
			this.children.splice(index, 0, child);
		}
	}
	
	return child;
};

bpmCell.prototype.remove = function(index)
{
	var child = null;
	
	if (this.children != null && index >= 0)
	{
		child = this.getChildAt(index);
		
		if (child != null)
		{
			this.children.splice(index, 1);
			child.setParent(null);
		}
	}
	
	return child;
};

bpmCell.prototype.removeFromParent = function()
{
	if (this.parent != null)
	{
		var index = this.parent.getIndex(this);
		this.parent.remove(index);
	}
};

bpmCell.prototype.getEdgeCount = function()
{
	return (this.edges == null) ? 0 : this.edges.length;
};

bpmCell.prototype.getEdgeIndex = function(edge)
{
	return bpmUtils.indexOf(this.edges, edge);
};

bpmCell.prototype.getEdgeAt = function(index)
{
	return (this.edges == null) ? null : this.edges[index];
};

bpmCell.prototype.insertEdge = function(edge, isOutgoing)
{
	if (edge != null)
	{
		edge.removeFromTerminal(isOutgoing);
		edge.setTerminal(this, isOutgoing);
		
		if (this.edges == null ||
			edge.getTerminal(!isOutgoing) != this ||
			bpmUtils.indexOf(this.edges, edge) < 0)
		{
			if (this.edges == null)
			{
				this.edges = [];
			}
			
			this.edges.push(edge);
		}
	}
	
	return edge;
};

bpmCell.prototype.removeEdge = function(edge, isOutgoing)
{
	if (edge != null)
	{
		if (edge.getTerminal(!isOutgoing) != this &&
			this.edges != null)
		{
			var index = this.getEdgeIndex(edge);
			
			if (index >= 0)
			{
				this.edges.splice(index, 1);
			}
		}
		
		edge.setTerminal(null, isOutgoing);
	}
	
	return edge;
};

bpmCell.prototype.removeFromTerminal = function(isSource)
{
	var terminal = this.getTerminal(isSource);
	
	if (terminal != null)
	{
		terminal.removeEdge(this, isSource);
	}
};

bpmCell.prototype.hasAttribute = function(name)
{
	var userObject = this.getValue();
	
	return (userObject != null &&
		userObject.nodeType == bpmConstants.NODETYPE_ELEMENT && userObject.hasAttribute) ?
		userObject.hasAttribute(name) : userObject.getAttribute(name) != null;
};

bpmCell.prototype.getAttribute = function(name, defaultValue)
{
	var userObject = this.getValue();
	
	var val = (userObject != null &&
		userObject.nodeType == bpmConstants.NODETYPE_ELEMENT) ?
		userObject.getAttribute(name) : null;
		
	return val || defaultValue;
};

bpmCell.prototype.setAttribute = function(name, value)
{
	var userObject = this.getValue();
	
	if (userObject != null &&
		userObject.nodeType == bpmConstants.NODETYPE_ELEMENT)
	{
		userObject.setAttribute(name, value);
	}
};

bpmCell.prototype.clone = function()
{
	var clone = bpmUtils.clone(this, this.bpmTransient);
	clone.setValue(this.cloneValue());
	
	return clone;
};

bpmCell.prototype.cloneValue = function()
{
	var value = this.getValue();
	
	if (value != null)
	{
		if (typeof(value.clone) == 'function')
		{
			value = value.clone();
		}
		else if (!isNaN(value.nodeType))
		{
			value = value.cloneNode(true);
		}
	}
	
	return value;
};



/* Geometry */
function bpmGeometry(x, y, width, height)
{
	bpmRectangle.call(this, x, y, width, height);
};

bpmGeometry.prototype = new bpmRectangle();
bpmGeometry.prototype.constructor = bpmGeometry;
bpmGeometry.prototype.TRANSLATE_CONTROL_POINTS = true;
bpmGeometry.prototype.alternateBounds = null;
bpmGeometry.prototype.sourcePoint = null;
bpmGeometry.prototype.targetPoint = null;
bpmGeometry.prototype.points = null;
bpmGeometry.prototype.offset = null;
bpmGeometry.prototype.relative = false;
bpmGeometry.prototype.swap = function()
{
	if (this.alternateBounds != null)
	{
		var old = new bpmRectangle(
			this.x, this.y, this.width, this.height);

		this.x = this.alternateBounds.x;
		this.y = this.alternateBounds.y;
		this.width = this.alternateBounds.width;
		this.height = this.alternateBounds.height;

		this.alternateBounds = old;
	}
};

bpmGeometry.prototype.getTerminalPoint = function(isSource)
{
	return (isSource) ? this.sourcePoint : this.targetPoint;
};

bpmGeometry.prototype.setTerminalPoint = function(point, isSource)
{
	if (isSource)
	{
		this.sourcePoint = point;
	}
	else
	{
		this.targetPoint = point;
	}
	
	return point;
};

bpmGeometry.prototype.rotate = function(angle, cx)
{
	var rad = bpmUtils.toRadians(angle);
	var cos = Math.cos(rad);
	var sin = Math.sin(rad);
	
	if (!this.relative)
	{
		var ct = new bpmPoint(this.getCenterX(), this.getCenterY());
		var pt = bpmUtils.getRotatedPoint(ct, cos, sin, cx);
		
		this.x = Math.round(pt.x - this.width / 2);
		this.y = Math.round(pt.y - this.height / 2);
	}

	if (this.sourcePoint != null)
	{
		var pt = bpmUtils.getRotatedPoint(this.sourcePoint, cos, sin, cx);
		this.sourcePoint.x = Math.round(pt.x);
		this.sourcePoint.y = Math.round(pt.y);
	}
	
	if (this.targetPoint != null)
	{
		var pt = bpmUtils.getRotatedPoint(this.targetPoint, cos, sin, cx);
		this.targetPoint.x = Math.round(pt.x);
		this.targetPoint.y = Math.round(pt.y);	
	}
	
	if (this.points != null)
	{
		for (var i = 0; i < this.points.length; i++)
		{
			if (this.points[i] != null)
			{
				var pt = bpmUtils.getRotatedPoint(this.points[i], cos, sin, cx);
				this.points[i].x = Math.round(pt.x);
				this.points[i].y = Math.round(pt.y);
			}
		}
	}
};

bpmGeometry.prototype.translate = function(dx, dy)
{
	dx = parseFloat(dx);
	dy = parseFloat(dy);
	
	if (!this.relative)
	{
		this.x = parseFloat(this.x) + dx;
		this.y = parseFloat(this.y) + dy;
	}

	if (this.sourcePoint != null)
	{
		this.sourcePoint.x = parseFloat(this.sourcePoint.x) + dx;
		this.sourcePoint.y = parseFloat(this.sourcePoint.y) + dy;
	}
	
	if (this.targetPoint != null)
	{
		this.targetPoint.x = parseFloat(this.targetPoint.x) + dx;
		this.targetPoint.y = parseFloat(this.targetPoint.y) + dy;		
	}

	if (this.TRANSLATE_CONTROL_POINTS && this.points != null)
	{
		for (var i = 0; i < this.points.length; i++)
		{
			if (this.points[i] != null)
			{
				this.points[i].x = parseFloat(this.points[i].x) + dx;
				this.points[i].y = parseFloat(this.points[i].y) + dy;
			}
		}
	}
};

bpmGeometry.prototype.scale = function(sx, sy, fixedAspect)
{
	sx = parseFloat(sx);
	sy = parseFloat(sy);

	if (this.sourcePoint != null)
	{
		this.sourcePoint.x = parseFloat(this.sourcePoint.x) * sx;
		this.sourcePoint.y = parseFloat(this.sourcePoint.y) * sy;
	}
	
	if (this.targetPoint != null)
	{
		this.targetPoint.x = parseFloat(this.targetPoint.x) * sx;
		this.targetPoint.y = parseFloat(this.targetPoint.y) * sy;		
	}

	if (this.points != null)
	{
		for (var i = 0; i < this.points.length; i++)
		{
			if (this.points[i] != null)
			{
				this.points[i].x = parseFloat(this.points[i].x) * sx;
				this.points[i].y = parseFloat(this.points[i].y) * sy;
			}
		}
	}
	
	if (!this.relative)
	{
		this.x = parseFloat(this.x) * sx;
		this.y = parseFloat(this.y) * sy;

		if (fixedAspect)
		{
			sy = sx = Math.min(sx, sy);
		}
		
		this.width = parseFloat(this.width) * sx;
		this.height = parseFloat(this.height) * sy;
	}
};

bpmGeometry.prototype.equals = function(obj)
{
	return bpmRectangle.prototype.equals.apply(this, arguments) &&
		this.relative == obj.relative &&
		((this.sourcePoint == null && obj.sourcePoint == null) || (this.sourcePoint != null && this.sourcePoint.equals(obj.sourcePoint))) &&
		((this.targetPoint == null && obj.targetPoint == null) || (this.targetPoint != null && this.targetPoint.equals(obj.targetPoint))) &&
		((this.points == null && obj.points == null) || (this.points != null && bpmUtils.equalPoints(this.points, obj.points))) &&
		((this.alternateBounds == null && obj.alternateBounds == null) || (this.alternateBounds != null && this.alternateBounds.equals(obj.alternateBounds))) &&
		((this.offset == null && obj.offset == null) || (this.offset != null && this.offset.equals(obj.offset)));
};



var bpmCellPath =
{
	PATH_SEPARATOR: '.',
	
	create: function(cell)
	{
		var result = '';
		
		if (cell != null)
		{
			var parent = cell.getParent();
			
			while (parent != null)
			{
				var index = parent.getIndex(cell);
				result = index + bpmCellPath.PATH_SEPARATOR + result;
				
				cell = parent;
				parent = cell.getParent();
			}
		}
		
		var n = result.length;
		
		if (n > 1)
		{
			result = result.substring(0, n - 1);
		}
		
		return result;
	},
	
	getParentPath: function(path)
	{
		if (path != null)
		{
			var index = path.lastIndexOf(bpmCellPath.PATH_SEPARATOR);

			if (index >= 0)
			{
				return path.substring(0, index);
			}
			else if (path.length > 0)
			{
				return '';
			}
		}

		return null;
	},
	resolve: function(root, path)
	{
		var parent = root;
		
		if (path != null)
		{
			var tokens = path.split(bpmCellPath.PATH_SEPARATOR);
			
			for (var i=0; i<tokens.length; i++)
			{
				parent = parent.getChildAt(parseInt(tokens[i]));
			}
		}
		
		return parent;
	},
	
	compare: function(p1, p2)
	{
		var min = Math.min(p1.length, p2.length);
		var comp = 0;
		
		for (var i = 0; i < min; i++)
		{
			if (p1[i] != p2[i])
			{
				if (p1[i].length == 0 ||
					p2[i].length == 0)
				{
					comp = (p1[i] == p2[i]) ? 0 : ((p1[i] > p2[i]) ? 1 : -1);
				}
				else
				{
					var t1 = parseInt(p1[i]);
					var t2 = parseInt(p2[i]);
					
					comp = (t1 == t2) ? 0 : ((t1 > t2) ? 1 : -1);
				}
				
				break;
			}
		}
		
		if (comp == 0)
		{
			var t1 = p1.length;
			var t2 = p2.length;
			
			if (t1 != t2)
			{
				comp = (t1 > t2) ? 1 : -1;
			}
		}
		
		return comp;
	}

};


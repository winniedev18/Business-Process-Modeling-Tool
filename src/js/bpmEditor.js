
/* Default Key Handler */
function bpmDefaultKeyHandler(editor)
{
	if (editor != null)
	{
		this.editor = editor;
		this.handler = new bpmKeyHandler(editor.graph);
		var old = this.handler.escape;
		
		this.handler.escape = function(evt)
		{
			old.apply(this, arguments);
			editor.hideProperties();
			editor.fireEvent(new bpmEventObject(bpmEvent.ESCAPE, 'event', evt));
		};
	}
};

bpmDefaultKeyHandler.prototype.editor = null;
bpmDefaultKeyHandler.prototype.handler = null;
bpmDefaultKeyHandler.prototype.bindAction = function (code, action, control)
{
	var keyHandler = bpmUtils.bind(this, function()
	{
		this.editor.execute(action);
	});
	if (control)
	{
		this.handler.bindControlKey(code, keyHandler);
	}
	else
	{
		this.handler.bindKey(code, keyHandler);				
	}
};
bpmDefaultKeyHandler.prototype.destroy = function ()
{
	this.handler.destroy();
	this.handler = null;
};



/* Default Popup Menu */

function bpmDefaultPopupMenu(config)
{
	this.config = config;
};
bpmDefaultPopupMenu.prototype.imageBasePath = null;
bpmDefaultPopupMenu.prototype.config = null;

bpmDefaultPopupMenu.prototype.createMenu = function(editor, menu, cell, evt)
{
	if (this.config != null)
	{
		var conditions = this.createConditions(editor, cell, evt);
		var item = this.config.firstChild;

		this.addItems(editor, menu, cell, evt, conditions, item, null);
	}
};

bpmDefaultPopupMenu.prototype.addItems = function(editor, menu, cell, evt, conditions, item, parent)
{
	var addSeparator = false;
	
	while (item != null)
	{
		if (item.nodeName == 'add')
		{
			var condition = item.getAttribute('if');
			
			if (condition == null || conditions[condition])
			{
				var as = item.getAttribute('as');
				as = bpmResources.get(as) || as;
				var funct = bpmUtils.eval(bpmUtils.getTextContent(item));
				var action = item.getAttribute('action');
				var icon = item.getAttribute('icon');
				var iconCls = item.getAttribute('iconCls');
				var enabledCond = item.getAttribute('enabled-if');
				var enabled = enabledCond == null || conditions[enabledCond];
				
				if (addSeparator)
				{
					menu.addSeparator(parent);
					addSeparator = false;
				}
				
				if (icon != null && this.imageBasePath)
				{
					icon = this.imageBasePath + icon;
				}
				
				var row = this.addAction(menu, editor, as, icon, funct, action, cell, parent, iconCls, enabled);
				this.addItems(editor, menu, cell, evt, conditions, item.firstChild, row);
			}
		}
		else if (item.nodeName == 'separator')
		{
			addSeparator = true;
		}
		
		item = item.nextSibling;
	}
};

bpmDefaultPopupMenu.prototype.addAction = function(menu, editor, lab, icon, funct, action, cell, parent, iconCls, enabled)
{
	var clickHandler = function(evt)
	{
		if (typeof(funct) == 'function')
		{
			funct.call(editor, editor, cell, evt);
		}
		
		if (action != null)
		{
			editor.execute(action, cell, evt);
		}
	};
	
	return menu.addItem(lab, icon, clickHandler, parent, iconCls, enabled);
};

bpmDefaultPopupMenu.prototype.createConditions = function(editor, cell, evt)
{
	// Creates array with conditions
	var model = editor.graph.getModel();
	var childCount = model.getChildCount(cell);
	
	// Adds some frequently used conditions
	var conditions = [];
	conditions['nocell'] = cell == null;
	conditions['ncells'] = editor.graph.getSelectionCount() > 1;
	conditions['notRoot'] = model.getRoot() !=
		model.getParent(editor.graph.getDefaultParent());
	conditions['cell'] = cell != null;
	
	var isCell = cell != null && editor.graph.getSelectionCount() == 1;
	conditions['nonEmpty'] = isCell && childCount > 0;
	conditions['expandable'] = isCell && editor.graph.isCellFoldable(cell, false);
	conditions['collapsable'] = isCell && editor.graph.isCellFoldable(cell, true);
	conditions['validRoot'] = isCell && editor.graph.isValidRoot(cell);
	conditions['emptyValidRoot'] = conditions['validRoot'] && childCount == 0;
	conditions['swimlane'] = isCell && editor.graph.isSwimlane(cell);

	// Evaluates dynamic conditions from config file
	var condNodes = this.config.getElementsByTagName('condition');
	
	for (var i=0; i<condNodes.length; i++)
	{
		var funct = bpmUtils.eval(bpmUtils.getTextContent(condNodes[i]));
		var name = condNodes[i].getAttribute('name');
		
		if (name != null && typeof(funct) == 'function')
		{
			conditions[name] = funct(editor, cell, evt);
		}
	}
	
	return conditions;
};


/* Default Toolbar */
function bpmDefaultToolbar(container, editor)
{
	this.editor = editor;

	if (container != null && editor != null)
	{
		this.init(container);
	}
};
bpmDefaultToolbar.prototype.editor = null;
bpmDefaultToolbar.prototype.toolbar = null;
bpmDefaultToolbar.prototype.resetHandler = null;
bpmDefaultToolbar.prototype.spacing = 4;
bpmDefaultToolbar.prototype.connectOnDrop = false;
bpmDefaultToolbar.prototype.init = function(container)
{
	if (container != null)
	{
		this.toolbar = new bpmToolbar(container);
		this.toolbar.addListener(bpmEvent.SELECT, bpmUtils.bind(this, function(sender, evt)
		{
			var funct = evt.getProperty('function');
			
			if (funct != null)
			{
				this.editor.insertFunction = bpmUtils.bind(this, function()
				{
					funct.apply(this, arguments);
					this.toolbar.resetMode();
				});
			}
			else
			{
				this.editor.insertFunction = null;
			}
		}));
		
		this.resetHandler = bpmUtils.bind(this, function()
		{
			if (this.toolbar != null)
			{
				this.toolbar.resetMode(true);
			}
		});

		this.editor.graph.addListener(bpmEvent.DOUBLE_CLICK, this.resetHandler);
		this.editor.addListener(bpmEvent.ESCAPE, this.resetHandler);
	}
};
bpmDefaultToolbar.prototype.addItem = function(title, icon, action, pressed)
{
	var clickHandler = bpmUtils.bind(this, function()
	{
		if (action != null && action.length > 0)
		{
			this.editor.execute(action);
		}
	});
	
	return this.toolbar.addItem(title, icon, clickHandler, pressed);
};
bpmDefaultToolbar.prototype.addSeparator = function(icon)
{
	icon = icon || bpmCore.imageBasePath + '/separator.gif';
	this.toolbar.addSeparator(icon);
};
bpmDefaultToolbar.prototype.addCombo = function()
{
	return this.toolbar.addCombo();
};

bpmDefaultToolbar.prototype.addActionCombo = function(title)
{
	return this.toolbar.addActionCombo(title);
};
bpmDefaultToolbar.prototype.addActionOption = function(combo, title, action)
{
	var clickHandler = bpmUtils.bind(this, function()
	{
		this.editor.execute(action);
	});
	
	this.addOption(combo, title, clickHandler);
};
bpmDefaultToolbar.prototype.addOption = function(combo, title, value)
{
	return this.toolbar.addOption(combo, title, value);
};
	
bpmDefaultToolbar.prototype.addMode = function(title, icon, mode, pressed, funct)
{
	var clickHandler = bpmUtils.bind(this, function()
	{
		this.editor.setMode(mode);
		
		if (funct != null)
		{
			funct(this.editor);
		}
	});
	
	return this.toolbar.addSwitchMode(title, icon, clickHandler, pressed);
};

bpmDefaultToolbar.prototype.addPrototype = function(title, icon, ptype, pressed, insert, toggle)
{
	var factory = bpmUtils.bind(this, function()
	{
		if (typeof(ptype) == 'function')
		{
			return ptype();
		}
		else if (ptype != null)
		{
			return this.editor.graph.cloneCell(ptype);
		}
		
		return null;
	});
	var clickHandler = bpmUtils.bind(this, function(evt, cell)
	{
		if (typeof(insert) == 'function')
		{
			insert(this.editor, factory(), evt, cell);
		}
		else
		{
			this.drop(factory(), evt, cell);
		}
		
		this.toolbar.resetMode();
		bpmEvent.consume(evt);
	});
	
	var img = this.toolbar.addMode(title, icon, clickHandler, pressed, null, toggle);
	
	var dropHandler = function(graph, evt, cell)
	{
		clickHandler(evt, cell);
	};
	
	this.installDropHandler(img, dropHandler);
	
	return img;
};

bpmDefaultToolbar.prototype.drop = function(vertex, evt, target)
{
	var graph = this.editor.graph;
	var model = graph.getModel();
	
	if (target == null ||
		model.isEdge(target) ||
		!this.connectOnDrop ||
		!graph.isCellConnectable(target))
	{
		while (target != null &&
			!graph.isValidDropTarget(target, [vertex], evt))
		{
			target = model.getParent(target);
		}
		
		this.insert(vertex, evt, target);
	}
	else
	{
		this.connect(vertex, evt, target);
	}
};
bpmDefaultToolbar.prototype.insert = function(vertex, evt, target)
{
	var graph = this.editor.graph;
	
	if (graph.canImportCell(vertex))
	{
		var x = bpmEvent.getClientX(evt);
		var y = bpmEvent.getClientY(evt);
		var pt = bpmUtils.convertPoint(graph.container, x, y);
		
		// Splits the target edge or inserts into target group
		if (graph.isSplitEnabled() &&
			graph.isSplitTarget(target, [vertex], evt))
		{
			return graph.splitEdge(target, [vertex], null, pt.x, pt.y);
		}
		else
		{
			return this.editor.addVertex(target, vertex, pt.x, pt.y);
		}
	}
	
	return null;
};

bpmDefaultToolbar.prototype.connect = function(vertex, evt, source)
{
	var graph = this.editor.graph;
	var model = graph.getModel();
	
	if (source != null &&
		graph.isCellConnectable(vertex) &&
		graph.isEdgeValid(null, source, vertex))
	{
		var edge = null;

		model.beginUpdate();
		try
		{
			var geo = model.getGeometry(source);
			var g = model.getGeometry(vertex).clone();
			g.x = geo.x + (geo.width - g.width) / 2;
			g.y = geo.y + (geo.height - g.height) / 2;
			
			var step = this.spacing * graph.gridSize;
			var dist = model.getDirectedEdgeCount(source, true) * 20;
			
			if (this.editor.horizontalFlow)
			{
				g.x += (g.width + geo.width) / 2 + step + dist;
			}
			else
			{
				g.y += (g.height + geo.height) / 2 + step + dist;
			}
			
			vertex.setGeometry(g);
			var parent = model.getParent(source);
			graph.addCell(vertex, parent);
			graph.constrainChild(vertex);

			edge = this.editor.createEdge(source, vertex);
			
			if (model.getGeometry(edge) == null)
			{
				var edgeGeometry = new bpmGeometry();
				edgeGeometry.relative = true;
				
				model.setGeometry(edge, edgeGeometry);
			}
			
			graph.addEdge(edge, parent, source, vertex);
		}
		finally
		{
			model.endUpdate();
		}
		
		graph.setSelectionCells([vertex, edge]);
		graph.scrollCellToVisible(vertex);
	}
};

bpmDefaultToolbar.prototype.installDropHandler = function (img, dropHandler)
{
	var sprite = document.createElement('img');
	sprite.setAttribute('src', img.getAttribute('src'));

	// Handles delayed loading of the images
	var loader = bpmUtils.bind(this, function(evt)
	{
		sprite.style.width = (2 * img.offsetWidth) + 'px';
		sprite.style.height = (2 * img.offsetHeight) + 'px';

		bpmUtils.makeDraggable(img, this.editor.graph, dropHandler,
			sprite);
		bpmEvent.removeListener(sprite, 'load', loader);
	});

	if (bpmCore.IS_IE)
	{
		loader();
	}
	else
	{
		bpmEvent.addListener(sprite, 'load', loader);
	}	
};

bpmDefaultToolbar.prototype.destroy = function ()
{
	if (this.resetHandler != null)
	{
		this.editor.graph.removeListener('dblclick', this.resetHandler);
		this.editor.removeListener('escape', this.resetHandler);
		this.resetHandler = null;
	}
	
	if (this.toolbar != null)
	{
		this.toolbar.destroy();
		this.toolbar = null;
	}
};



/* Editor */

function bpmEditor(config)
{
	this.actions = [];
	this.addActions();
	if (document.body != null)
	{
		this.cycleAttributeValues = [];
		this.popupHandler = new bpmDefaultPopupMenu();
		this.undoManager = new bpmUndoManager();
		this.graph = this.createGraph();
		this.toolbar = this.createToolbar();
		this.keyHandler = new bpmDefaultKeyHandler(this);
		this.configure(config);
		this.graph.swimlaneIndicatorColorAttribute = this.cycleAttributeName;
		if (this.onInit != null)
		{
			this.onInit();
		}
		if (bpmCore.IS_IE)
		{
			bpmEvent.addListener(window, 'unload', bpmUtils.bind(this, function()
			{
				this.destroy();
			}));
		}
	}
};

if (bpmLoadResources)
{
	bpmResources.add(bpmCore.basePath + '/resources/editor');
}
else
{
	bpmCore.defaultBundles.push(bpmCore.basePath + '/resources/editor');
}

bpmEditor.prototype = new bpmEventSource();
bpmEditor.prototype.constructor = bpmEditor;

bpmEditor.prototype.askZoomResource = (bpmCore.language != 'none') ? 'askZoom' : '';
bpmEditor.prototype.lastSavedResource = (bpmCore.language != 'none') ? 'lastSaved' : '';
bpmEditor.prototype.currentFileResource = (bpmCore.language != 'none') ? 'currentFile' : '';
bpmEditor.prototype.propertiesResource = (bpmCore.language != 'none') ? 'properties' : '';
bpmEditor.prototype.tasksResource = (bpmCore.language != 'none') ? 'tasks' : '';
bpmEditor.prototype.helpResource = (bpmCore.language != 'none') ? 'help' : '';
bpmEditor.prototype.outlineResource = (bpmCore.language != 'none') ? 'outline' : '';
bpmEditor.prototype.outline = null;
bpmEditor.prototype.graph = null;
bpmEditor.prototype.graphRenderHint = null;
bpmEditor.prototype.toolbar = null;
bpmEditor.prototype.status = null;
bpmEditor.prototype.popupHandler = null;
bpmEditor.prototype.undoManager = null;

bpmEditor.prototype.keyHandler = null;
bpmEditor.prototype.actions = null;
bpmEditor.prototype.dblClickAction = 'edit';
bpmEditor.prototype.swimlaneRequired = false;
bpmEditor.prototype.disableContextMenu = true;
bpmEditor.prototype.insertFunction = null;
bpmEditor.prototype.forcedInserting = false;
bpmEditor.prototype.templates = null;
bpmEditor.prototype.defaultEdge = null;
bpmEditor.prototype.defaultEdgeStyle = null;
bpmEditor.prototype.defaultGroup = null;
bpmEditor.prototype.groupBorderSize = null;
bpmEditor.prototype.filename = null;
bpmEditor.prototype.linefeed = '&#xa;';
bpmEditor.prototype.postParameterName = 'xml';
bpmEditor.prototype.escapePostData = true;
bpmEditor.prototype.urlPost = null;
bpmEditor.prototype.urlImage = null;
bpmEditor.prototype.horizontalFlow = false;
bpmEditor.prototype.layoutDiagram = false;
bpmEditor.prototype.swimlaneSpacing = 0;
bpmEditor.prototype.maintainSwimlanes = false;
bpmEditor.prototype.layoutSwimlanes = false;
bpmEditor.prototype.cycleAttributeValues = null;
bpmEditor.prototype.cycleAttributeIndex = 0;
bpmEditor.prototype.cycleAttributeName = 'fillColor';
bpmEditor.prototype.tasks = null;
bpmEditor.prototype.tasksWindowImage = null;
bpmEditor.prototype.tasksTop = 20;
bpmEditor.prototype.help = null;
bpmEditor.prototype.helpWindowImage = null;
bpmEditor.prototype.urlHelp = null;
bpmEditor.prototype.helpWidth = 300;
bpmEditor.prototype.helpHeight = 260;
bpmEditor.prototype.propertiesWidth = 240;
bpmEditor.prototype.propertiesHeight = null;
bpmEditor.prototype.movePropertiesBpmModal = false;
bpmEditor.prototype.validating = false;
bpmEditor.prototype.modified = false;

bpmEditor.prototype.isModified = function ()
{
	return this.modified;
};

bpmEditor.prototype.setModified = function (value)
{
	this.modified = value;
};

bpmEditor.prototype.addActions = function ()
{
	this.addAction('save', function(editor)
	{
		editor.save();
	});
	
	this.addAction('print', function(editor)
	{
		var preview = new bpmPrintPreview(editor.graph, 1);
		preview.open();
	});
	
	this.addAction('show', function(editor)
	{
		bpmUtils.show(editor.graph, null, 10, 10);
	});

	this.addAction('exportImage', function(editor)
	{
		var url = editor.getUrlImage();
		
		if (url == null || bpmCore.IS_LOCAL)
		{
			editor.execute('show');
		}
		else
		{
			var node = bpmUtils.getViewXml(editor.graph, 1);
			var xml = bpmUtils.getXml(node, '\n');

			bpmUtils.submit(url, editor.postParameterName + '=' +
				encodeURIComponent(xml), document, '_blank');
		}
	});
	
	this.addAction('refresh', function(editor)
	{
		editor.graph.refresh();
	});
	
	this.addAction('cut', function(editor)
	{
		if (editor.graph.isEnabled())
		{
			bpmClipboard.cut(editor.graph);
		}
	});
	
	this.addAction('copy', function(editor)
	{
		if (editor.graph.isEnabled())
		{
			bpmClipboard.copy(editor.graph);
		}
	});
	
	this.addAction('paste', function(editor)
	{
		if (editor.graph.isEnabled())
		{
			bpmClipboard.paste(editor.graph);
		}
	});
	
	this.addAction('delete', function(editor)
	{
		if (editor.graph.isEnabled())
		{
			editor.graph.removeCells();
		}
	});
	
	this.addAction('group', function(editor)
	{
		if (editor.graph.isEnabled())
		{
			editor.graph.setSelectionCell(editor.groupCells());
		}
	});
	
	this.addAction('ungroup', function(editor)
	{
		if (editor.graph.isEnabled())
		{
			editor.graph.setSelectionCells(editor.graph.ungroupCells());
		}
	});
	
	this.addAction('removeFromParent', function(editor)
	{
		if (editor.graph.isEnabled())
		{
			editor.graph.removeCellsFromParent();
		}
	});
	
	this.addAction('undo', function(editor)
	{
		if (editor.graph.isEnabled())
		{
			editor.undo();
		}
	});
	
	this.addAction('redo', function(editor)
	{
		if (editor.graph.isEnabled())
		{
			editor.redo();
		}
	});
	
	this.addAction('zoomIn', function(editor)
	{
		editor.graph.zoomIn();
	});
	
	this.addAction('zoomOut', function(editor)
	{
		editor.graph.zoomOut();
	});
	
	this.addAction('actualSize', function(editor)
	{
		editor.graph.zoomActual();
	});
	
	this.addAction('fit', function(editor)
	{
		editor.graph.fit();
	});
	
	this.addAction('showProperties', function(editor, cell)
	{
		editor.showProperties(cell);
	});
	
	this.addAction('selectAll', function(editor)
	{
		if (editor.graph.isEnabled())
		{
			editor.graph.selectAll();
		}
	});
	
	this.addAction('selectNone', function(editor)
	{
		if (editor.graph.isEnabled())
		{
			editor.graph.clearSelection();
		}
	});
	
	this.addAction('selectVertices', function(editor)
	{
		if (editor.graph.isEnabled())
		{
			editor.graph.selectVertices();
		}
	});
	
	this.addAction('selectEdges', function(editor)
	{
		if (editor.graph.isEnabled())
		{
			editor.graph.selectEdges();
		}
	});
	
	this.addAction('edit', function(editor, cell)
	{
		if (editor.graph.isEnabled() &&
			editor.graph.isCellEditable(cell))
		{
			editor.graph.startEditingAtCell(cell);
		}
	});
	
	this.addAction('toBack', function(editor, cell)
	{
		if (editor.graph.isEnabled())
		{
			editor.graph.orderCells(true);
		}
	});
	
	this.addAction('toFront', function(editor, cell)
	{
		if (editor.graph.isEnabled())
		{
			editor.graph.orderCells(false);
		}
	});
	
	this.addAction('enterGroup', function(editor, cell)
	{
		editor.graph.enterGroup(cell);
	});
	
	this.addAction('exitGroup', function(editor)
	{
		editor.graph.exitGroup();
	});
	
	this.addAction('home', function(editor)
	{
		editor.graph.home();
	});
	
	this.addAction('selectPrevious', function(editor)
	{
		if (editor.graph.isEnabled())
		{
			editor.graph.selectPreviousCell();
		}
	});
	
	this.addAction('selectNext', function(editor)
	{
		if (editor.graph.isEnabled())
		{
			editor.graph.selectNextCell();
		}
	});
	
	this.addAction('selectParent', function(editor)
	{
		if (editor.graph.isEnabled())
		{
			editor.graph.selectParentCell();
		}
	});
	
	this.addAction('selectChild', function(editor)
	{
		if (editor.graph.isEnabled())
		{
			editor.graph.selectChildCell();
		}
	});
	
	this.addAction('collapse', function(editor)
	{
		if (editor.graph.isEnabled())
		{
			editor.graph.foldCells(true);
		}
	});
	
	this.addAction('collapseAll', function(editor)
	{
		if (editor.graph.isEnabled())
		{
			var cells = editor.graph.getChildVertices();
			editor.graph.foldCells(true, false, cells);
		}
	});
	
	this.addAction('expand', function(editor)
	{
		if (editor.graph.isEnabled())
		{
			editor.graph.foldCells(false);
		}
	});
	
	this.addAction('expandAll', function(editor)
	{
		if (editor.graph.isEnabled())
		{
			var cells = editor.graph.getChildVertices();
			editor.graph.foldCells(false, false, cells);
		}
	});
	
	this.addAction('bold', function(editor)
	{
		if (editor.graph.isEnabled())
		{
			editor.graph.toggleCellStyleFlags(
				bpmConstants.STYLE_FONTSTYLE,
				bpmConstants.FONT_BOLD);
		}
	});
	
	this.addAction('italic', function(editor)
	{
		if (editor.graph.isEnabled())
		{
			editor.graph.toggleCellStyleFlags(
				bpmConstants.STYLE_FONTSTYLE,
				bpmConstants.FONT_ITALIC);
		}
	});
	
	this.addAction('underline', function(editor)
	{
		if (editor.graph.isEnabled())
		{
			editor.graph.toggleCellStyleFlags(
				bpmConstants.STYLE_FONTSTYLE,
				bpmConstants.FONT_UNDERLINE);
		}
	});

	this.addAction('alignCellsLeft', function(editor)
	{
		if (editor.graph.isEnabled())
		{
			editor.graph.alignCells(bpmConstants.ALIGN_LEFT);
		}
	});
	
	this.addAction('alignCellsCenter', function(editor)
	{
		if (editor.graph.isEnabled())
		{
			editor.graph.alignCells(bpmConstants.ALIGN_CENTER);
		}
	});
	
	this.addAction('alignCellsRight', function(editor)
	{
		if (editor.graph.isEnabled())
		{
			editor.graph.alignCells(bpmConstants.ALIGN_RIGHT);
		}
	});
	
	this.addAction('alignCellsTop', function(editor)
	{
		if (editor.graph.isEnabled())
		{
			editor.graph.alignCells(bpmConstants.ALIGN_TOP);
		}
	});
	
	this.addAction('alignCellsMiddle', function(editor)
	{
		if (editor.graph.isEnabled())
		{
			editor.graph.alignCells(bpmConstants.ALIGN_MIDDLE);
		}
	});
	
	this.addAction('alignCellsBottom', function(editor)
	{
		if (editor.graph.isEnabled())
		{
			editor.graph.alignCells(bpmConstants.ALIGN_BOTTOM);
		}
	});
	
	this.addAction('alignFontLeft', function(editor)
	{
		
		editor.graph.setCellStyles(
			bpmConstants.STYLE_ALIGN,
			bpmConstants.ALIGN_LEFT);
	});
	
	this.addAction('alignFontCenter', function(editor)
	{
		if (editor.graph.isEnabled())
		{
			editor.graph.setCellStyles(
				bpmConstants.STYLE_ALIGN,
				bpmConstants.ALIGN_CENTER);
		}
	});
	
	this.addAction('alignFontRight', function(editor)
	{
		if (editor.graph.isEnabled())
		{
			editor.graph.setCellStyles(
				bpmConstants.STYLE_ALIGN,
				bpmConstants.ALIGN_RIGHT);
		}
	});
	
	this.addAction('alignFontTop', function(editor)
	{
		if (editor.graph.isEnabled())
		{
			editor.graph.setCellStyles(
				bpmConstants.STYLE_VERTICAL_ALIGN,
				bpmConstants.ALIGN_TOP);
		}
	});
	
	this.addAction('alignFontMiddle', function(editor)
	{
		if (editor.graph.isEnabled())
		{
			editor.graph.setCellStyles(
				bpmConstants.STYLE_VERTICAL_ALIGN,
				bpmConstants.ALIGN_MIDDLE);
		}
	});
	
	this.addAction('alignFontBottom', function(editor)
	{
		if (editor.graph.isEnabled())
		{
			editor.graph.setCellStyles(
				bpmConstants.STYLE_VERTICAL_ALIGN,
				bpmConstants.ALIGN_BOTTOM);
		}
	});
	
	this.addAction('zoom', function(editor)
	{
		var current = editor.graph.getView().scale*100;
		var scale = parseFloat(bpmUtils.prompt(
			bpmResources.get(editor.askZoomResource) ||
			editor.askZoomResource,
			current))/100;

		if (!isNaN(scale))
		{
			editor.graph.getView().setScale(scale);
		}
	});
	
	this.addAction('toggleTasks', function(editor)
	{
		if (editor.tasks != null)
		{
			editor.tasks.setVisible(!editor.tasks.isVisible());
		}
		else
		{
			editor.showTasks();
		}
	});
	
	this.addAction('toggleHelp', function(editor)
	{
		if (editor.help != null)
		{
			editor.help.setVisible(!editor.help.isVisible());
		}
		else
		{
			editor.showHelp();
		}
	});
	
	this.addAction('toggleOutline', function(editor)
	{
		if (editor.outline == null)
		{
			editor.showOutline();
		}
		else
		{
			editor.outline.setVisible(!editor.outline.isVisible());
		}
	});
	
	this.addAction('toggleConsole', function(editor)
	{
		bpmLog.setVisible(!bpmLog.isVisible());
	});
};

bpmEditor.prototype.configure = function (node)
{
	if (node != null)
	{
		var dec = new bpmCodec(node.ownerDocument);
		dec.decode(node, this);
		this.resetHistory();
	}
};

bpmEditor.prototype.resetFirstTime = function ()
{
	document.cookie =
		'bpmgraph=seen; expires=Fri, 27 Jul 2001 02:47:11 UTC; path=/';
};

bpmEditor.prototype.resetHistory = function ()
{
	this.lastSnapshot = new Date().getTime();
	this.undoManager.clear();
	this.ignoredChanges = 0;
	this.setModified(false);
};

bpmEditor.prototype.addAction = function (actionname, funct)
{
	this.actions[actionname] = funct;
};

bpmEditor.prototype.execute = function (actionname, cell, evt)
{
	var action = this.actions[actionname];
	
	if (action != null)
	{
		try
		{
			var args = arguments;
			args[0] = this;
			
			action.apply(this, args);
		}
		catch (e)
		{
			bpmUtils.error('Cannot execute ' + actionname +
				': ' + e.message, 280, true);
			
			throw e;
		}
	}
	else
	{
		bpmUtils.error('Cannot find action '+actionname, 280, true);
	}
};

bpmEditor.prototype.addTemplate = function (name, template)
{
	this.templates[name] = template;
};

bpmEditor.prototype.getTemplate = function (name)
{
	return this.templates[name];
};

bpmEditor.prototype.createGraph = function ()
{
	var graph = new bpmGraph(null, null, this.graphRenderHint);
	
	graph.setTooltips(true);
	graph.setPanning(true);

	this.installDblClickHandler(graph);
	
	this.installUndoHandler(graph);

	this.installDrillHandler(graph);
	
	this.installChangeHandler(graph);

	this.installInsertHandler(graph);

	graph.popupMenuHandler.factoryMethod =
		bpmUtils.bind(this, function(menu, cell, evt)
		{
			return this.createPopupMenu(menu, cell, evt);
		});

	graph.connectionHandler.factoryMethod =
		bpmUtils.bind(this, function(source, target)
		{
			return this.createEdge(source, target);
		});
	
	this.createSwimlaneManager(graph);
	this.createLayoutManager(graph);
	
	return graph;
};

bpmEditor.prototype.createSwimlaneManager = function (graph)
{
	var swimlaneMgr = new bpmSwimlaneManager(graph, false);

	swimlaneMgr.isHorizontal = bpmUtils.bind(this, function()
	{
		return this.horizontalFlow;
	});
	
	swimlaneMgr.isEnabled = bpmUtils.bind(this, function()
	{
		return this.maintainSwimlanes;
	});
	
	return swimlaneMgr;
};

bpmEditor.prototype.createLayoutManager = function (graph)
{
	var layoutMgr = new bpmLayoutManager(graph);
	
	var self = this; // closure
	layoutMgr.getLayout = function(cell)
	{
		var layout = null;
		var model = self.graph.getModel();
		
		if (model.getParent(cell) != null)
		{
			if (self.layoutSwimlanes &&
				graph.isSwimlane(cell))
			{
				if (self.swimlaneLayout == null)
				{
					self.swimlaneLayout = self.createSwimlaneLayout();
				}
				
				layout = self.swimlaneLayout;
			}
			
			else if (self.layoutDiagram &&
				(graph.isValidRoot(cell) ||
				model.getParent(model.getParent(cell)) == null))
			{
				if (self.diagramLayout == null)
				{
					self.diagramLayout = self.createDiagramLayout();
				}
				
				layout = self.diagramLayout;
			}
		}
			
		return layout;
	};
	
	return layoutMgr;
};

bpmEditor.prototype.setGraphContainer = function (container)
{
	if (this.graph.container == null)
	{
		this.graph.init(container);

		this.rubberband = new bpmRubberband(this.graph);

		if (this.disableContextMenu)
		{
			bpmEvent.disableContextMenu(container);
		}

		if (bpmCore.IS_QUIRKS)
		{
			new bpmDivResizer(container);
		}
	}
};

bpmEditor.prototype.installDblClickHandler = function (graph)
{
	graph.addListener(bpmEvent.DOUBLE_CLICK,
		bpmUtils.bind(this, function(sender, evt)
		{
			var cell = evt.getProperty('cell');
			
			if (cell != null &&
				graph.isEnabled() &&
				this.dblClickAction != null)
			{
				this.execute(this.dblClickAction, cell);
				evt.consume();
			}
		})
	);
};

bpmEditor.prototype.installUndoHandler = function (graph)
{				
	var listener = bpmUtils.bind(this, function(sender, evt)
	{
		var edit = evt.getProperty('edit');
		this.undoManager.undoableEditHappened(edit);
	});
	
	graph.getModel().addListener(bpmEvent.UNDO, listener);
	graph.getView().addListener(bpmEvent.UNDO, listener);

	var undoHandler = function(sender, evt)
	{
		var changes = evt.getProperty('edit').changes;
		graph.setSelectionCells(graph.getSelectionCellsForChanges(changes));
	};
	
	this.undoManager.addListener(bpmEvent.UNDO, undoHandler);
	this.undoManager.addListener(bpmEvent.REDO, undoHandler);
};

bpmEditor.prototype.installDrillHandler = function (graph)
{				
	var listener = bpmUtils.bind(this, function(sender)
	{
		this.fireEvent(new bpmEventObject(bpmEvent.ROOT));
	});
	
	graph.getView().addListener(bpmEvent.DOWN, listener);
	graph.getView().addListener(bpmEvent.UP, listener);
};

bpmEditor.prototype.installChangeHandler = function (graph)
{
	var listener = bpmUtils.bind(this, function(sender, evt)
	{
		this.setModified(true);

		if (this.validating == true)
		{
			graph.validateGraph();
		}

		var changes = evt.getProperty('edit').changes;
		
		for (var i = 0; i < changes.length; i++)
		{
			var change = changes[i];
			
			if (change instanceof bpmRootChange ||
				(change instanceof bpmValueChange &&
				change.cell == this.graph.model.root) ||
				(change instanceof bpmCellAttributeChange &&
				change.cell == this.graph.model.root))
			{
				this.fireEvent(new bpmEventObject(bpmEvent.ROOT));
				break;
			}
		}
	});
	
	graph.getModel().addListener(bpmEvent.CHANGE, listener);
};

bpmEditor.prototype.installInsertHandler = function (graph)
{
	var self = this;
	var insertHandler =
	{
		mouseDown: function(sender, me)
		{
			if (self.insertFunction != null &&
				!me.isPopupTrigger() &&
				(self.forcedInserting ||
				me.getState() == null))
			{
				self.graph.clearSelection();
				self.insertFunction(me.getEvent(), me.getCell());

				this.isActive = true;
				me.consume();
			}
		},
		
		mouseMove: function(sender, me)
		{
			if (this.isActive)
			{
				me.consume();
			}
		},
		
		mouseUp: function(sender, me)
		{
			if (this.isActive)
			{
				this.isActive = false;
				me.consume();
			}
		}
	};
	
	graph.addMouseListener(insertHandler);
};

bpmEditor.prototype.createDiagramLayout = function ()
{
	var gs = this.graph.gridSize;
	var layout = new bpmStackLayout(this.graph, !this.horizontalFlow,
		 this.swimlaneSpacing, 2*gs, 2*gs);
	
	layout.isVertexIgnored = function(cell)
	{
		return !layout.graph.isSwimlane(cell);
	};
	
	return layout;
};

bpmEditor.prototype.createSwimlaneLayout = function ()
{
	return new bpmCompactTreeLayout(this.graph, this.horizontalFlow);
};

bpmEditor.prototype.createToolbar = function ()
{
	return new bpmDefaultToolbar(null, this);
};

bpmEditor.prototype.setToolbarContainer = function (container)
{
	this.toolbar.init(container);
	
	if (bpmCore.IS_QUIRKS)
	{
		new bpmDivResizer(container);
	}
};

bpmEditor.prototype.setStatusContainer = function (container)
{
	if (this.status == null)
	{
		this.status = container;
		
		this.addListener(bpmEvent.SAVE, bpmUtils.bind(this, function()
		{
			var tstamp = new Date().toLocaleString();
			this.setStatus((bpmResources.get(this.lastSavedResource) ||
				this.lastSavedResource)+': '+tstamp);
		}));

		this.addListener(bpmEvent.OPEN, bpmUtils.bind(this, function()
		{
			this.setStatus((bpmResources.get(this.currentFileResource) ||
				this.currentFileResource)+': '+this.filename);
		}));
		
		if (bpmCore.IS_QUIRKS)
		{
			new bpmDivResizer(container);
		}
	}
};

bpmEditor.prototype.setStatus = function (message)
{
	if (this.status != null && message != null)
	{
		this.status.innerHTML = message;
	}
};

bpmEditor.prototype.setTitleContainer = function (container)
{
	this.addListener(bpmEvent.ROOT, bpmUtils.bind(this, function(sender)
	{
		container.innerHTML = this.getTitle();
	}));

	if (bpmCore.IS_QUIRKS)
	{
		new bpmDivResizer(container);
	}
};

bpmEditor.prototype.treeLayout = function (cell, horizontal)
{
	if (cell != null)
	{
		var layout = new bpmCompactTreeLayout(this.graph, horizontal);
		layout.execute(cell);
	}
};

bpmEditor.prototype.getTitle = function ()
{
	var title = '';
	var graph = this.graph;
	var cell = graph.getCurrentRoot();
	
	while (cell != null &&
		   graph.getModel().getParent(
				graph.getModel().getParent(cell)) != null)
	{

		if (graph.isValidRoot(cell))
		{
			title = ' > ' +
			graph.convertValueToString(cell) + title;
		}
		
		cell = graph.getModel().getParent(cell);
	}
	
	var prefix = this.getRootTitle();
	
	return prefix + title;
};

bpmEditor.prototype.getRootTitle = function ()
{
	var root = this.graph.getModel().getRoot();
	return this.graph.convertValueToString(root);
};

bpmEditor.prototype.undo = function ()
{
	this.undoManager.undo();
};

bpmEditor.prototype.redo = function ()
{
	this.undoManager.redo();
};

bpmEditor.prototype.groupCells = function ()
{
	var border = (this.groupBorderSize != null) ?
		this.groupBorderSize :
		this.graph.gridSize;
	return this.graph.groupCells(this.createGroup(), border);
};

bpmEditor.prototype.createGroup = function ()
{
	var model = this.graph.getModel();
	
	return model.cloneCell(this.defaultGroup);
};

bpmEditor.prototype.open = function (filename)
{
	if (filename != null)
	{
		var xml = bpmUtils.load(filename).getXml();
		this.readGraphModel(xml.documentElement);
		this.filename = filename;
		
		this.fireEvent(new bpmEventObject(bpmEvent.OPEN, 'filename', filename));
	}
};

bpmEditor.prototype.readGraphModel = function (node)
{
	var dec = new bpmCodec(node.ownerDocument);
	dec.decode(node, this.graph.getModel());
	this.resetHistory();
};

bpmEditor.prototype.save = function (url, linefeed)
{
	url = url || this.getUrlPost();

	if (url != null && url.length > 0)
	{
		var data = this.writeGraphModel(linefeed);
		this.postDiagram(url, data);
		
		this.setModified(false);
	}
	this.fireEvent(new bpmEventObject(bpmEvent.SAVE, 'url', url));
};

bpmEditor.prototype.postDiagram = function (url, data)
{
	if (this.escapePostData)
	{
		data = encodeURIComponent(data);
	}

	bpmUtils.post(url, this.postParameterName+'='+data,
		bpmUtils.bind(this, function(req)
		{
			this.fireEvent(new bpmEventObject(bpmEvent.POST,
				'request', req, 'url', url, 'data', data));
		})
	);
};

bpmEditor.prototype.writeGraphModel = function (linefeed)
{
	linefeed = (linefeed != null) ? linefeed : this.linefeed;
	var enc = new bpmCodec();
	var node = enc.encode(this.graph.getModel());

	return bpmUtils.getXml(node, linefeed);
};

bpmEditor.prototype.getUrlPost = function ()
{
	return this.urlPost;
};

bpmEditor.prototype.getUrlImage = function ()
{
	return this.urlImage;
};

bpmEditor.prototype.swapStyles = function (first, second)
{
	var style = this.graph.getStylesheet().styles[second];
	this.graph.getView().getStylesheet().putCellStyle(
		second, this.graph.getStylesheet().styles[first]);
	this.graph.getStylesheet().putCellStyle(first, style);
	this.graph.refresh();
};

bpmEditor.prototype.showProperties = function (cell)
{
	cell = cell || this.graph.getSelectionCell();

	if (cell == null)
	{
		cell = this.graph.getCurrentRoot();
		
		if (cell == null)
		{
			cell = this.graph.getModel().getRoot();
		}
	}
	
	if (cell != null)
	{
		this.graph.stopEditing(true);

		var offset = bpmUtils.getOffset(this.graph.container);
		var x = offset.x+10;
		var y = offset.y;
		
		if (this.properties != null && !this.movePropertiesBpmModal)
		{
			x = this.properties.getX();
			y = this.properties.getY();
		}
		
		else
		{
			var bounds = this.graph.getCellBounds(cell);
			
			if (bounds != null)
			{
				x += bounds.x+Math.min(200, bounds.width);
				y += bounds.y;				
			}			
		}
		
		this.hideProperties();
		var node = this.createProperties(cell);
		
		if (node != null)
		{
			this.properties = new bpmWindow(bpmResources.get(this.propertiesResource) ||
				this.propertiesResource, node, x, y, this.propertiesWidth, this.propertiesHeight, false);
			this.properties.setVisible(true);
		}
	}
};

bpmEditor.prototype.isPropertiesVisible = function ()
{
	return this.properties != null;
};

bpmEditor.prototype.createProperties = function (cell)
{
	var model = this.graph.getModel();
	var value = model.getValue(cell);
	
	if (bpmUtils.isNode(value))
	{
		var form = new bpmForm('properties');
		
		var id = form.addText('ID', cell.getId());
		id.setAttribute('readonly', 'true');

		var geo = null;
		var yField = null;
		var xField = null;
		var widthField = null;
		var heightField = null;

		if (model.isVertex(cell))
		{
			geo = model.getGeometry(cell);
			
			if (geo != null)
			{
				yField = form.addText('top', geo.y);
				xField = form.addText('left', geo.x);
				widthField = form.addText('width', geo.width);
				heightField = form.addText('height', geo.height);
			}
		}
				
		var tmp = model.getStyle(cell);
		var style = form.addText('Style', tmp || '');
		
		var attrs = value.attributes;
		var texts = [];
		
		for (var i = 0; i < attrs.length; i++)
		{
			var val = attrs[i].value;
			texts[i] = form.addTextarea(attrs[i].nodeName, val,
				(attrs[i].nodeName == 'label') ? 4 : 2);
		}
		
		var okFunction = bpmUtils.bind(this, function()
		{
			this.hideProperties();
			
			model.beginUpdate();
			try
			{
				if (geo != null)
				{
					geo = geo.clone();
					
					geo.x = parseFloat(xField.value);
					geo.y = parseFloat(yField.value);
					geo.width = parseFloat(widthField.value);
					geo.height = parseFloat(heightField.value);
					
					model.setGeometry(cell, geo);
				}
				
				if (style.value.length > 0)
				{
					model.setStyle(cell, style.value);
				}
				else
				{
					model.setStyle(cell, null);
				}
				
				for (var i=0; i<attrs.length; i++)
				{
					var edit = new bpmCellAttributeChange(
						cell, attrs[i].nodeName,
						texts[i].value);
					model.execute(edit);
				}
				
				if (this.graph.isAutoSizeCell(cell))
				{
					this.graph.updateCellSize(cell);
				}
			}
			finally
			{
				model.endUpdate();
			}
		});
		
		var cancelFunction = bpmUtils.bind(this, function()
		{
			this.hideProperties();
		});
		
		form.addButtons(okFunction, cancelFunction);
		
		return form.table;
	}

	return null;
};

bpmEditor.prototype.hideProperties = function ()
{
	if (this.properties != null)
	{
		this.properties.destroy();
		this.properties = null;
	}
};

bpmEditor.prototype.showTasks = function ()
{
	if (this.tasks == null)
	{
		var div = document.createElement('div');
		div.style.padding = '4px';
		div.style.paddingLeft = '20px';
		var w = document.body.clientWidth;
		var wnd = new bpmWindow(
			bpmResources.get(this.tasksResource) ||
			this.tasksResource,
			div, w - 220, this.tasksTop, 200);
		wnd.setClosable(true);
		wnd.destroyOnClose = false;
		
		var funct = bpmUtils.bind(this, function(sender)
		{
			bpmEvent.release(div);
			div.innerHTML = '';
			this.createTasks(div);
		});
		
		this.graph.getModel().addListener(bpmEvent.CHANGE, funct);
		this.graph.getSelectionModel().addListener(bpmEvent.CHANGE, funct);
		this.graph.addListener(bpmEvent.ROOT, funct);
		
		if (this.tasksWindowImage != null)
		{
			wnd.setImage(this.tasksWindowImage);
		}
		
		this.tasks = wnd;
		this.createTasks(div);
	}
	
	this.tasks.setVisible(true);
};
	
bpmEditor.prototype.refreshTasks = function (div)
{
	if (this.tasks != null)
	{
		var div = this.tasks.content;
		bpmEvent.release(div);
		div.innerHTML = '';
		this.createTasks(div);
	}
};

bpmEditor.prototype.createTasks = function (div)
{
	// override
};
	

bpmEditor.prototype.showHelp = function (tasks)
{
	if (this.help == null)
	{
		var frame = document.createElement('iframe');
		frame.setAttribute('src', bpmResources.get('urlHelp') || this.urlHelp);
		frame.setAttribute('height', '100%');
		frame.setAttribute('width', '100%');
		frame.setAttribute('frameBorder', '0');
		frame.style.backgroundColor = 'white';
	
		var w = document.body.clientWidth;
		var h = (document.body.clientHeight || document.documentElement.clientHeight);
		
		var wnd = new bpmWindow(bpmResources.get(this.helpResource) || this.helpResource,
			frame, (w-this.helpWidth)/2, (h-this.helpHeight)/3, this.helpWidth, this.helpHeight);
		wnd.setMaximizable(true);
		wnd.setClosable(true);
		wnd.destroyOnClose = false;
		wnd.setResizable(true);

		// Assigns the icon to the help window
		if (this.helpWindowImage != null)
		{
			wnd.setImage(this.helpWindowImage);
		}
		
		// Workaround for ignored iframe height 100% in FF
		if (bpmCore.IS_NS)
		{
			var handler = function(sender)
			{
				var h = wnd.div.offsetHeight;
				frame.setAttribute('height', (h-26)+'px');
			};
			
			wnd.addListener(bpmEvent.RESIZE_END, handler);
			wnd.addListener(bpmEvent.MAXIMIZE, handler);
			wnd.addListener(bpmEvent.NORMALIZE, handler);
			wnd.addListener(bpmEvent.SHOW, handler);
		}
		
		this.help = wnd;
	}
	
	this.help.setVisible(true);
};

bpmEditor.prototype.showOutline = function ()
{
	var create = this.outline == null;
	
	if (create)
	{
		var div = document.createElement('div');
		
		div.style.overflow = 'hidden';
		div.style.position = 'relative';
		div.style.width = '100%';
		div.style.height = '100%';
		div.style.background = 'white';
		div.style.cursor = 'move';
		
		if (document.documentMode == 8)
		{
			div.style.filter = 'progid:DXImageTransform.Microsoft.alpha(opacity=100)';
		}
		
		var wnd = new bpmWindow(
			bpmResources.get(this.outlineResource) ||
			this.outlineResource,
			div, 600, 480, 200, 200, false);
				
		var outline = new bpmOutline(this.graph, div);			
		wnd.setClosable(true);
		wnd.setResizable(true);
		wnd.destroyOnClose = false;
		
		wnd.addListener(bpmEvent.RESIZE_END, function()
		{
			outline.update();
		});
		
		this.outline = wnd;
		this.outline.outline = outline;
	}
	
	// Finally shows the outline
	this.outline.setVisible(true);
	this.outline.outline.update(true);
};
		
bpmEditor.prototype.setMode = function(modename)
{
	if (modename == 'select')
	{
		this.graph.panningHandler.useLeftButtonForPanning = false;
		this.graph.setConnectable(false);
	}
	else if (modename == 'connect')
	{
		this.graph.panningHandler.useLeftButtonForPanning = false;
		this.graph.setConnectable(true);
	}
	else if (modename == 'pan')
	{
		this.graph.panningHandler.useLeftButtonForPanning = true;
		this.graph.setConnectable(false);
	}
};

bpmEditor.prototype.createPopupMenu = function (menu, cell, evt)
{
	this.popupHandler.createMenu(this, menu, cell, evt);
};

bpmEditor.prototype.createEdge = function (source, target)
{
	var e = null;
	
	if (this.defaultEdge != null)
	{
		var model = this.graph.getModel();
		e = model.cloneCell(this.defaultEdge);
	}
	else
	{
		e = new bpmCell('');
		e.setEdge(true);
		
		var geo = new bpmGeometry();
		geo.relative = true;
		e.setGeometry(geo);
	}
	
	var style = this.getEdgeStyle();
	
	if (style != null)
	{
		e.setStyle(style);
	}
	
	return e;
};

bpmEditor.prototype.getEdgeStyle = function ()
{
	return this.defaultEdgeStyle;
};

bpmEditor.prototype.consumeCycleAttribute = function (cell)
{
	return (this.cycleAttributeValues != null &&
		this.cycleAttributeValues.length > 0 &&
		this.graph.isSwimlane(cell)) ?
		this.cycleAttributeValues[this.cycleAttributeIndex++ %
			this.cycleAttributeValues.length] : null;
};

bpmEditor.prototype.cycleAttribute = function (cell)
{
	if (this.cycleAttributeName != null)
	{
		var value = this.consumeCycleAttribute(cell);
		
		if (value != null)
		{
			cell.setStyle(cell.getStyle()+';'+
				this.cycleAttributeName+'='+value);
		}
	}
};

bpmEditor.prototype.addVertex = function (parent, vertex, x, y)
{
	var model = this.graph.getModel();
	
	while (parent != null && !this.graph.isValidDropTarget(parent))
	{
		parent = model.getParent(parent);
	}
	
	parent = (parent != null) ? parent : this.graph.getSwimlaneAt(x, y);
	var scale = this.graph.getView().scale;
	
	var geo = model.getGeometry(vertex);
	var pgeo = model.getGeometry(parent);
	
	if (this.graph.isSwimlane(vertex) &&
		!this.graph.swimlaneNesting)
	{
		parent = null;
	}
	else if (parent == null && this.swimlaneRequired)
	{
		return null;
	}
	else if (parent != null && pgeo != null)
	{
		// Keeps vertex inside parent
		var state = this.graph.getView().getState(parent);
		
		if (state != null)
		{			
			x -= state.origin.x * scale;
			y -= state.origin.y * scale;
			
			if (this.graph.isConstrainedMoving)
			{
				var width = geo.width;
				var height = geo.height;				
				var tmp = state.x+state.width;
				
				if (x+width > tmp)
				{
					x -= x+width - tmp;
				}
				
				tmp = state.y+state.height;
				
				if (y+height > tmp)
				{
					y -= y+height - tmp;
				}
			}
		}
		else if (pgeo != null)
		{
			x -= pgeo.x*scale;
			y -= pgeo.y*scale;
		}
	}
	
	geo = geo.clone();
	geo.x = this.graph.snap(x / scale -
		this.graph.getView().translate.x -
		this.graph.gridSize/2);
	geo.y = this.graph.snap(y / scale -
		this.graph.getView().translate.y -
		this.graph.gridSize/2);
	vertex.setGeometry(geo);
	
	if (parent == null)
	{
		parent = this.graph.getDefaultParent();
	}

	this.cycleAttribute(vertex);
	this.fireEvent(new bpmEventObject(bpmEvent.BEFORE_ADD_VERTEX,
			'vertex', vertex, 'parent', parent));

	model.beginUpdate();
	try
	{
		vertex = this.graph.addCell(vertex, parent);
		
		if (vertex != null)
		{
			this.graph.constrainChild(vertex);
			
			this.fireEvent(new bpmEventObject(bpmEvent.ADD_VERTEX, 'vertex', vertex));
		}
	}
	finally
	{
		model.endUpdate();
	}
	
	if (vertex != null)
	{
		this.graph.setSelectionCell(vertex);
		this.graph.scrollCellToVisible(vertex);
		this.fireEvent(new bpmEventObject(bpmEvent.AFTER_ADD_VERTEX, 'vertex', vertex));
	}
	
	return vertex;
};

bpmEditor.prototype.destroy = function ()
{
	if (!this.destroyed)
	{
		this.destroyed = true;

		if (this.tasks != null)
		{
			this.tasks.destroy();
		}
		
		if (this.outline != null)
		{
			this.outline.destroy();
		}
		
		if (this.properties != null)
		{
			this.properties.destroy();
		}
		
		if (this.keyHandler != null)
		{
			this.keyHandler.destroy();
		}
		
		if (this.rubberband != null)
		{
			this.rubberband.destroy();
		}
		
		if (this.toolbar != null)
		{
			this.toolbar.destroy();
		}
		
		if (this.graph != null)
		{
			this.graph.destroy();
		}
	
		this.status = null;
		this.templates = null;
	}
};


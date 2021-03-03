/**
 * Graph editor
 */
BpmUi = function(editor, container, lightbox)
{
	bpmEventSource.call(this);
	
	this.destroyFunctions = [];
	this.editor = editor || new BpmDraw();
	this.container = container || document.body;
	this.workfiles = [];

	var graph = this.editor.graph;
	graph.lightbox = lightbox;

	// Faster scrollwheel zoom is possible with CSS transforms
	if (graph.useCssTransforms)
	{
		this.lazyZoomDelay = 0;
	}
	
	// Pre-fetches submenu image or replaces with embedded image if supported
	if (bpmCore.IS_SVG)
	{
		bpmPopupMenu.prototype.submenuImage = 'data:image/gif;base64,R0lGODlhCQAJAIAAAP///zMzMyH5BAEAAAAALAAAAAAJAAkAAAIPhI8WebHsHopSOVgb26AAADs=';
	}
	else
	{
		new Image().src = bpmPopupMenu.prototype.submenuImage;
	}

	// Pre-fetches connect image
	if (!bpmCore.IS_SVG && bpmConnectionHandler.prototype.connectImage != null)
	{
		new Image().src = bpmConnectionHandler.prototype.connectImage.src;
	}
	
	// Disables graph and forced panning in chromeless mode
	if (this.editor.chromeless && !this.editor.editable)
	{
		this.footerHeight = 0;
		graph.isEnabled = function() { return false; };
		graph.panningHandler.isForcePanningEvent = function(me)
		{
			return !bpmEvent.isPopupTrigger(me.getEvent());
		};
	}
	
    // Creates the user interface
	this.actions = new BpmHandles(this);
	this.menus = this.createMenus();
	this.createDivs();
	this.createUi();
	this.refresh();
	
	// Disables HTML and text selection
	var textEditing =  bpmUtils.bind(this, function(evt)
	{
		if (evt == null)
		{
			evt = window.event;
		}
		
		return graph.isEditing() || (evt != null && this.isSelectionAllowed(evt));
	});

	// Disables text selection while not editing and no dialog visible
	if (this.container == document.body)
	{
		this.menubarContainer.onselectstart = textEditing;
		this.menubarContainer.onmousedown = textEditing;
		this.toolbarContainer.onselectstart = textEditing;
		this.toolbarContainer.onmousedown = textEditing;
		this.diagramContainer.onselectstart = textEditing;
		this.diagramContainer.onmousedown = textEditing;
		this.sidebarContainer.onselectstart = textEditing;
		this.sidebarContainer.onmousedown = textEditing;
		this.formatContainer.onselectstart = textEditing;
		this.formatContainer.onmousedown = textEditing;
		this.footerContainer.onselectstart = textEditing;
		this.footerContainer.onmousedown = textEditing;
		
		if (this.tabContainer != null)
		{
			// Mouse down is needed for drag and drop
			this.tabContainer.onselectstart = textEditing;
		}
	}
	
	// And uses built-in context menu while editing
	if (!this.editor.chromeless || this.editor.editable)
	{
		// Allows context menu for links in hints
		var linkHandler = function(evt)
		{
			if (evt != null)
			{
				var source = bpmEvent.getSource(evt);
				
				if (source.nodeName == 'A')
				{
					while (source != null)
					{
						if (source.className == 'geHint')
						{
							return true;
						}
						
						source = source.parentNode;
					}
				}
			}
			
			return textEditing(evt);
		};
		
		if (bpmCore.IS_IE && (typeof(document.documentMode) === 'undefined' || document.documentMode < 9))
		{
			bpmEvent.addListener(this.diagramContainer, 'contextmenu', linkHandler);
		}
		else
		{
			// Allows browser context menu outside of diagram and sidebar
			this.diagramContainer.oncontextmenu = linkHandler;
		}
	}
	else
	{
		graph.panningHandler.usePopupTrigger = false;
	}

	// Contains the main graph instance inside the given panel
	graph.init(this.diagramContainer);

    // Improves line wrapping for in-place editor
    if (bpmCore.IS_SVG && graph.view.getDrawPane() != null)
    {
        var root = graph.view.getDrawPane().ownerSVGElement;
        
        if (root != null)
        {
            root.style.position = 'absolute';
        }
    }
    
	// Creates hover icons
	this.hoverIcons = this.createHoverIcons();
	
	// Adds tooltip when mouse is over scrollbars to show space-drag panning option
	bpmEvent.addListener(this.diagramContainer, 'mousemove', bpmUtils.bind(this, function(evt)
	{
		var off = bpmUtils.getOffset(this.diagramContainer);
		
		if (bpmEvent.getClientX(evt) - off.x - this.diagramContainer.clientWidth > 0 ||
			bpmEvent.getClientY(evt) - off.y - this.diagramContainer.clientHeight > 0)
		{
			this.diagramContainer.setAttribute('title', bpmResources.get('panTooltip'));
		}
		else
		{
			this.diagramContainer.removeAttribute('title');
		}
	}));

   	// Escape key hides dialogs, adds space+drag panning
	var spaceKeyPressed = false;
	
	// Overrides hovericons to disable while space key is pressed
	var hoverIconsIsResetEvent = this.hoverIcons.isResetEvent;
	
	this.hoverIcons.isResetEvent = function(evt, allowShift)
	{
		return spaceKeyPressed || hoverIconsIsResetEvent.apply(this, arguments);
	};
	
	this.keydownHandler = bpmUtils.bind(this, function(evt)
	{
		if (evt.which == 32 /* Space */)
		{
			spaceKeyPressed = true;
			this.hoverIcons.reset();
			graph.container.style.cursor = 'move';
			
			// Disables scroll after space keystroke with scrollbars
			if (!graph.isEditing() && bpmEvent.getSource(evt) == graph.container)
			{
				bpmEvent.consume(evt);
			}
		}
		else if (!bpmEvent.isConsumed(evt) && evt.keyCode == 27 /* Escape */)
		{
			this.hideBpmModal(null, true);
		}
	});
   	
	bpmEvent.addListener(document, 'keydown', this.keydownHandler);
	
	this.keyupHandler = bpmUtils.bind(this, function(evt)
	{
		graph.container.style.cursor = '';
		spaceKeyPressed = false;
	});

	bpmEvent.addListener(document, 'keyup', this.keyupHandler);
    
    // Forces panning for middle and right mouse buttons
	var panningHandlerIsForcePanningEvent = graph.panningHandler.isForcePanningEvent;
	graph.panningHandler.isForcePanningEvent = function(me)
	{
		// Ctrl+left button is reported as right button in FF on Mac
		return panningHandlerIsForcePanningEvent.apply(this, arguments) ||
			spaceKeyPressed || (bpmEvent.isMouseEvent(me.getEvent()) &&
			(this.usePopupTrigger || !bpmEvent.isPopupTrigger(me.getEvent())) &&
			((!bpmEvent.isControlDown(me.getEvent()) &&
			bpmEvent.isRightMouseButton(me.getEvent())) ||
			bpmEvent.isMiddleMouseButton(me.getEvent())));
	};

	// Ctrl/Cmd+Enter applies editing value except in Safari where Ctrl+Enter creates
	// a new line (while Enter creates a new paragraph and Shift+Enter stops)
	var cellEditorIsStopEditingEvent = graph.cellEditor.isStopEditingEvent;
	graph.cellEditor.isStopEditingEvent = function(evt)
	{
		return cellEditorIsStopEditingEvent.apply(this, arguments) ||
			(evt.keyCode == 13 && ((!bpmCore.IS_SF && bpmEvent.isControlDown(evt)) ||
			(bpmCore.IS_MAC && bpmEvent.isMetaDown(evt)) ||
			(bpmCore.IS_SF && bpmEvent.isShiftDown(evt))));
	};
	
	// Switches toolbar for text editing
	var textMode = false;
	var fontMenu = null;
	var sizeMenu = null;
	var nodes = null;
	
	var updateToolbar = bpmUtils.bind(this, function()
	{
		if (this.toolbar != null && textMode != graph.cellEditor.isContentEditing())
		{
			var node = this.toolbar.container.firstChild;
			var newNodes = [];
			
			while (node != null)
			{
				var tmp = node.nextSibling;
				
				if (bpmUtils.indexOf(this.toolbar.staticElements, node) < 0)
				{
					node.parentNode.removeChild(node);
					newNodes.push(node);
				}
				
				node = tmp;
			}
			
			// Saves references to special items
			var tmp1 = this.toolbar.fontMenu;
			var tmp2 = this.toolbar.sizeMenu;
			
			if (nodes == null)
			{
				this.toolbar.createTextToolbar();
			}
			else
			{
				for (var i = 0; i < nodes.length; i++)
				{
					this.toolbar.container.appendChild(nodes[i]);
				}
				
				// Restores references to special items
				this.toolbar.fontMenu = fontMenu;
				this.toolbar.sizeMenu = sizeMenu;
			}
			
			textMode = graph.cellEditor.isContentEditing();
			fontMenu = tmp1;
			sizeMenu = tmp2;
			nodes = newNodes;
		}
	});

	var ui = this;
	
	// Overrides cell editor to update toolbar
	var cellEditorStartEditing = graph.cellEditor.startEditing;
	graph.cellEditor.startEditing = function()
	{
		cellEditorStartEditing.apply(this, arguments);
		updateToolbar();
		
		if (graph.cellEditor.isContentEditing())
		{
			var updating = false;
			
			var updateCssHandler = function()
			{
				if (!updating)
				{
					updating = true;
				
					window.setTimeout(function()
					{
						var selectedElement = graph.getSelectedElement();
						var node = selectedElement;
						
						while (node != null && node.nodeType != bpmConstants.NODETYPE_ELEMENT)
						{
							node = node.parentNode;
						}
						
						if (node != null)
						{
							var css = bpmUtils.getCurrentStyle(node);
	
							if (css != null && ui.toolbar != null)
							{
								// Strips leading and trailing quotes
								var ff = css.fontFamily;
								
								if (ff.charAt(0) == '\'')
								{
									ff = ff.substring(1);
								}
								
								if (ff.charAt(ff.length - 1) == '\'')
								{
									ff = ff.substring(0, ff.length - 1);
								}
								
								ui.toolbar.setFontName(ff);
								ui.toolbar.setFontSize(parseInt(css.fontSize));
							}
						}
						
						updating = false;
					}, 0);
				}
			};
			
			bpmEvent.addListener(graph.cellEditor.textarea, 'input', updateCssHandler)
			bpmEvent.addListener(graph.cellEditor.textarea, 'touchend', updateCssHandler);
			bpmEvent.addListener(graph.cellEditor.textarea, 'mouseup', updateCssHandler);
			bpmEvent.addListener(graph.cellEditor.textarea, 'keyup', updateCssHandler);
			updateCssHandler();
		}
	};
	
	var cellEditorStopEditing = graph.cellEditor.stopEditing;
	graph.cellEditor.stopEditing = function(cell, trigger)
	{
		cellEditorStopEditing.apply(this, arguments);
		updateToolbar();
	};
	
    // Enables scrollbars and sets cursor style for the container
	graph.container.setAttribute('tabindex', '0');
   	graph.container.style.cursor = 'default';
    
	// Workaround for page scroll if embedded via iframe
	if (window.self === window.top && graph.container.parentNode != null)
	{
		try
		{
			graph.container.focus();
		}
		catch (e)
		{
			// ignores error in old versions of IE
		}
	}

   	// Keeps graph container focused on mouse down
   	var graphFireMouseEvent = graph.fireMouseEvent;
   	graph.fireMouseEvent = function(evtName, me, sender)
   	{
   		if (evtName == bpmEvent.MOUSE_DOWN)
   		{
   			this.container.focus();
   		}
   		
   		graphFireMouseEvent.apply(this, arguments);
   	};

   	// Configures automatic expand on mouseover
	graph.popupMenuHandler.autoExpand = true;

    // Installs context menu
	if (this.menus != null)
	{
		graph.popupMenuHandler.factoryMethod = bpmUtils.bind(this, function(menu, cell, evt)
		{
			this.menus.createPopupMenu(menu, cell, evt);
		});
	}
	
	// Hides context menu
	bpmEvent.addGestureListeners(document, bpmUtils.bind(this, function(evt)
	{
		graph.popupMenuHandler.hideMenu();
	}));

    // Create handler for key events
	this.keyHandler = this.createKeyHandler(editor);
    
	// Getter for key handler
	this.getKeyHandler = function()
	{
		return keyHandler;
	};
	
	// Stores the current style and assigns it to new cells
	var styles = ['rounded', 'shadow', 'glass', 'dashed', 'dashPattern', 'comic', 'labelBackgroundColor'];
	var connectStyles = ['shape', 'edgeStyle', 'curved', 'rounded', 'elbow', 'comic', 'jumpStyle', 'jumpSize'];
	
	// Note: Everything that is not in styles is ignored (styles is augmented below)
	this.setDefaultStyle = function(cell)
	{
		try
		{
			var state = graph.view.getState(cell);
			
			if (state != null)
			{
				// Ignores default styles
				var clone = cell.clone();
				clone.style = ''
				var defaultStyle = graph.getCellStyle(clone);
				var values = [];
				var keys = [];
	
				for (var key in state.style)
				{
					if (defaultStyle[key] != state.style[key])
					{
						values.push(state.style[key]);
						keys.push(key);
					}
				}
				
				// Handles special case for value "none"
				var cellStyle = graph.getModel().getStyle(state.cell);
				var tokens = (cellStyle != null) ? cellStyle.split(';') : [];
				
				for (var i = 0; i < tokens.length; i++)
				{
					var tmp = tokens[i];
			 		var pos = tmp.indexOf('=');
			 					 		
			 		if (pos >= 0)
			 		{
			 			var key = tmp.substring(0, pos);
			 			var value = tmp.substring(pos + 1);
			 			
			 			if (defaultStyle[key] != null && value == 'none')
			 			{
			 				values.push(value);
			 				keys.push(key);
			 			}
			 		}
				}
	
				// Resets current style
				if (graph.getModel().isEdge(state.cell))
				{
					graph.currentEdgeStyle = {};
				}
				else
				{
					graph.currentVertexStyle = {}
				}
	
				this.fireEvent(new bpmEventObject('styleChanged', 'keys', keys, 'values', values, 'cells', [state.cell]));
			}
		}
		catch (e)
		{
			this.handleError(e);
		}
	};
	
	this.clearDefaultStyle = function()
	{
		graph.currentEdgeStyle = bpmUtils.clone(graph.defaultEdgeStyle);
		graph.currentVertexStyle = bpmUtils.clone(graph.defaultVertexStyle);
		
		// Updates UI
		this.fireEvent(new bpmEventObject('styleChanged', 'keys', [], 'values', [], 'cells', []));
	};

	// Keys that should be ignored if the cell has a value (known: new default for all cells is html=1 so
    // for the html key this effecticely only works for edges inserted via the connection handler)
	var valueStyles = ['fontFamily', 'fontSize', 'fontColor'];
	
	// Keys that always update the current edge style regardless of selection
	var alwaysEdgeStyles = ['edgeStyle', 'startArrow', 'startFill', 'startSize', 'endArrow',
		'endFill', 'endSize'];
	
	// Keys that are ignored together (if one appears all are ignored)
	var keyGroups = [['startArrow', 'startFill', 'startSize', 'sourcePerimeterSpacing',
					'endArrow', 'endFill', 'endSize', 'targetPerimeterSpacing'],
	                 ['strokeColor', 'strokeWidth'],
	                 ['fillColor', 'gradientColor'],
	                 valueStyles,
	                 ['opacity'],
	                 ['align'],
	                 ['html']];
	
	// Adds all keys used above to the styles array
	for (var i = 0; i < keyGroups.length; i++)
	{
		for (var j = 0; j < keyGroups[i].length; j++)
		{
			styles.push(keyGroups[i][j]);
		}
	}
	
	for (var i = 0; i < connectStyles.length; i++)
	{
		if (bpmUtils.indexOf(styles, connectStyles[i]) < 0)
		{
			styles.push(connectStyles[i]);
		}
	}

	// Implements a global current style for edges and vertices that is applied to new cells
	var insertHandler = function(cells, asText)
	{
		var model = graph.getModel();
		
		model.beginUpdate();
		try
		{
			// Applies only basic text styles
			if (asText)
			{
				var edge = model.isEdge(cell);
				var current = (edge) ? graph.currentEdgeStyle : graph.currentVertexStyle;
				var textStyles = ['fontSize', 'fontFamily', 'fontColor'];
				
				for (var j = 0; j < textStyles.length; j++)
				{
					var value = current[textStyles[j]];
					
					if (value != null)
					{
						graph.setCellStyles(textStyles[j], value, cells);
					}
				}
			}
			else
			{
				for (var i = 0; i < cells.length; i++)
				{
					var cell = cells[i];

					// Removes styles defined in the cell style from the styles to be applied
					var cellStyle = model.getStyle(cell);
					var tokens = (cellStyle != null) ? cellStyle.split(';') : [];
					var appliedStyles = styles.slice();
					
					for (var j = 0; j < tokens.length; j++)
					{
						var tmp = tokens[j];
				 		var pos = tmp.indexOf('=');
				 					 		
				 		if (pos >= 0)
				 		{
				 			var key = tmp.substring(0, pos);
				 			var index = bpmUtils.indexOf(appliedStyles, key);
				 			
				 			if (index >= 0)
				 			{
				 				appliedStyles.splice(index, 1);
				 			}
				 			
				 			// Handles special cases where one defined style ignores other styles
				 			for (var k = 0; k < keyGroups.length; k++)
				 			{
				 				var group = keyGroups[k];
				 				
				 				if (bpmUtils.indexOf(group, key) >= 0)
				 				{
				 					for (var l = 0; l < group.length; l++)
				 					{
							 			var index2 = bpmUtils.indexOf(appliedStyles, group[l]);
							 			
							 			if (index2 >= 0)
							 			{
							 				appliedStyles.splice(index2, 1);
							 			}
				 					}
				 				}
				 			}
				 		}
					}
	
					// Applies the current style to the cell
					var edge = model.isEdge(cell);
					var current = (edge) ? graph.currentEdgeStyle : graph.currentVertexStyle;
					var newStyle = model.getStyle(cell);
					
					for (var j = 0; j < appliedStyles.length; j++)
					{
						var key = appliedStyles[j];
						var styleValue = current[key];
	
						if (styleValue != null && (key != 'shape' || edge))
						{
							// Special case: Connect styles are not applied here but in the connection handler
							if (!edge || bpmUtils.indexOf(connectStyles, key) < 0)
							{
								newStyle = bpmUtils.setStyle(newStyle, key, styleValue);
							}
						}
					}
					
					model.setStyle(cell, newStyle);
				}
			}
		}
		finally
		{
			model.endUpdate();
		}
	};

	graph.addListener('cellsInserted', function(sender, evt)
	{
		insertHandler(evt.getProperty('cells'));
	});
	
	graph.addListener('textInserted', function(sender, evt)
	{
		insertHandler(evt.getProperty('cells'), true);
	});
	
	graph.connectionHandler.addListener(bpmEvent.CONNECT, function(sender, evt)
	{
		var cells = [evt.getProperty('cell')];
		
		if (evt.getProperty('terminalInserted'))
		{
			cells.push(evt.getProperty('terminal'));
		}
		
		insertHandler(cells);
	});

	this.addListener('styleChanged', bpmUtils.bind(this, function(sender, evt)
	{
		// Checks if edges and/or vertices were modified
		var cells = evt.getProperty('cells');
		var vertex = false;
		var edge = false;
		
		if (cells.length > 0)
		{
			for (var i = 0; i < cells.length; i++)
			{
				vertex = graph.getModel().isVertex(cells[i]) || vertex;
				edge = graph.getModel().isEdge(cells[i]) || edge;
				
				if (edge && vertex)
				{
					break;
				}
			}
		}
		else
		{
			vertex = true;
			edge = true;
		}
		
		var keys = evt.getProperty('keys');
		var values = evt.getProperty('values');

		for (var i = 0; i < keys.length; i++)
		{
			var common = bpmUtils.indexOf(valueStyles, keys[i]) >= 0;
			
			// Ignores transparent stroke colors
			if (keys[i] != 'strokeColor' || (values[i] != null && values[i] != 'none'))
			{
				// Special case: Edge style and shape
				if (bpmUtils.indexOf(connectStyles, keys[i]) >= 0)
				{
					if (edge || bpmUtils.indexOf(alwaysEdgeStyles, keys[i]) >= 0)
					{
						if (values[i] == null)
						{
							delete graph.currentEdgeStyle[keys[i]];
						}
						else
						{
							graph.currentEdgeStyle[keys[i]] = values[i];
						}
					}
					// Uses style for vertex if defined in styles
					else if (vertex && bpmUtils.indexOf(styles, keys[i]) >= 0)
					{
						if (values[i] == null)
						{
							delete graph.currentVertexStyle[keys[i]];
						}
						else
						{
							graph.currentVertexStyle[keys[i]] = values[i];
						}
					}
				}
				else if (bpmUtils.indexOf(styles, keys[i]) >= 0)
				{
					if (vertex || common)
					{
						if (values[i] == null)
						{
							delete graph.currentVertexStyle[keys[i]];
						}
						else
						{
							graph.currentVertexStyle[keys[i]] = values[i];
						}
					}
					
					if (edge || common || bpmUtils.indexOf(alwaysEdgeStyles, keys[i]) >= 0)
					{
						if (values[i] == null)
						{
							delete graph.currentEdgeStyle[keys[i]];
						}
						else
						{
							graph.currentEdgeStyle[keys[i]] = values[i];
						}
					}
				}
			}
		}
		
		if (this.toolbar != null)
		{
			this.toolbar.setFontName(graph.currentVertexStyle['fontFamily'] || Menus.prototype.defaultFont);
			this.toolbar.setFontSize(graph.currentVertexStyle['fontSize'] || Menus.prototype.defaultFontSize);
			
			if (this.toolbar.edgeStyleMenu != null)
			{
				// Updates toolbar icon for edge style
				var edgeStyleDiv = this.toolbar.edgeStyleMenu.getElementsByTagName('div')[0];

				if (graph.currentEdgeStyle['edgeStyle'] == 'orthogonalEdgeStyle' && graph.currentEdgeStyle['curved'] == '1')
				{
					edgeStyleDiv.className = 'geSprite geSprite-curved';
				}
				else if (graph.currentEdgeStyle['edgeStyle'] == 'straight' || graph.currentEdgeStyle['edgeStyle'] == 'none' ||
						graph.currentEdgeStyle['edgeStyle'] == null)
				{
					edgeStyleDiv.className = 'geSprite geSprite-straight';
				}
				else if (graph.currentEdgeStyle['edgeStyle'] == 'entityRelationEdgeStyle')
				{
					edgeStyleDiv.className = 'geSprite geSprite-entity';
				}
				else if (graph.currentEdgeStyle['edgeStyle'] == 'elbowEdgeStyle')
				{
					edgeStyleDiv.className = 'geSprite geSprite-' + ((graph.currentEdgeStyle['elbow'] == 'vertical') ?
						'verticalelbow' : 'horizontalelbow');
				}
				else if (graph.currentEdgeStyle['edgeStyle'] == 'isometricEdgeStyle')
				{
					edgeStyleDiv.className = 'geSprite geSprite-' + ((graph.currentEdgeStyle['elbow'] == 'vertical') ?
						'verticalisometric' : 'horizontalisometric');
				}
				else
				{
					edgeStyleDiv.className = 'geSprite geSprite-orthogonal';
				}
			}
			
			if (this.toolbar.edgeShapeMenu != null)
			{
				// Updates icon for edge shape
				var edgeShapeDiv = this.toolbar.edgeShapeMenu.getElementsByTagName('div')[0];
				
				if (graph.currentEdgeStyle['shape'] == 'link')
				{
					edgeShapeDiv.className = 'geSprite geSprite-linkedge';
				}
				else if (graph.currentEdgeStyle['shape'] == 'flexArrow')
				{
					edgeShapeDiv.className = 'geSprite geSprite-arrow';
				}
				else if (graph.currentEdgeStyle['shape'] == 'arrow')
				{
					edgeShapeDiv.className = 'geSprite geSprite-simplearrow';
				}
				else
				{
					edgeShapeDiv.className = 'geSprite geSprite-connection';
				}
			}
			
			// Updates icon for optinal line start shape
			if (this.toolbar.lineStartMenu != null)
			{
				var lineStartDiv = this.toolbar.lineStartMenu.getElementsByTagName('div')[0];
				
				lineStartDiv.className = this.getCssClassForMarker('start',
						graph.currentEdgeStyle['shape'], graph.currentEdgeStyle[bpmConstants.STYLE_STARTARROW],
						bpmUtils.getValue(graph.currentEdgeStyle, 'startFill', '1'));
			}

			// Updates icon for optinal line end shape
			if (this.toolbar.lineEndMenu != null)
			{
				var lineEndDiv = this.toolbar.lineEndMenu.getElementsByTagName('div')[0];
				
				lineEndDiv.className = this.getCssClassForMarker('end',
						graph.currentEdgeStyle['shape'], graph.currentEdgeStyle[bpmConstants.STYLE_ENDARROW],
						bpmUtils.getValue(graph.currentEdgeStyle, 'endFill', '1'));
			}
		}
	}));
	
	// Update font size and font family labels
	if (this.toolbar != null)
	{
		var update = bpmUtils.bind(this, function()
		{
			var ff = graph.currentVertexStyle['fontFamily'] || 'Helvetica';
			var fs = String(graph.currentVertexStyle['fontSize'] || '12');
		    	var state = graph.getView().getState(graph.getSelectionCell());
		    	
		    	if (state != null)
		    	{
		    		ff = state.style[bpmConstants.STYLE_FONTFAMILY] || ff;
		    		fs = state.style[bpmConstants.STYLE_FONTSIZE] || fs;
		    		
		    		if (ff.length > 10)
		    		{
		    			ff = ff.substring(0, 8) + '...';
		    		}
		    	}
		    	
		    	this.toolbar.setFontName(ff);
		    	this.toolbar.setFontSize(fs);
		});
		
	    graph.getSelectionModel().addListener(bpmEvent.CHANGE, update);
	    graph.getModel().addListener(bpmEvent.CHANGE, update);
	}
	
	// Makes sure the current layer is visible when cells are added
	graph.addListener(bpmEvent.CELLS_ADDED, function(sender, evt)
	{
		var cells = evt.getProperty('cells');
		var parent = evt.getProperty('parent');
		
		if (graph.getModel().isLayer(parent) && !graph.isCellVisible(parent) && cells != null && cells.length > 0)
		{
			graph.getModel().setVisible(parent, true);
		}
	});
	
	// Global handler to hide the current menu
	this.gestureHandler = bpmUtils.bind(this, function(evt)
	{
		if (this.currentMenu != null && bpmEvent.getSource(evt) != this.currentMenu.div)
		{
			this.hideCurrentMenu();
		}
	});
	
	bpmEvent.addGestureListeners(document, this.gestureHandler);

	// Updates the editor UI after the window has been resized or the orientation changes
	// Timeout is workaround for old IE versions which have a delay for DOM client sizes.
	// Should not use delay > 0 to avoid handle multiple repaints during window resize
	this.resizeHandler = bpmUtils.bind(this, function()
   	{
   		window.setTimeout(bpmUtils.bind(this, function()
   		{
   			if (this.editor.graph != null)
   			{
   				this.refresh();
   			}
   		}), 0);
   	});
	
   	bpmEvent.addListener(window, 'resize', this.resizeHandler);
   	
   	this.orientationChangeHandler = bpmUtils.bind(this, function()
   	{
   		this.refresh();
   	});
   	
   	bpmEvent.addListener(window, 'orientationchange', this.orientationChangeHandler);
   	
	// Workaround for bug on iOS see
	// http://stackoverflow.com/questions/19012135/ios-7-ipad-safari-landscape-innerheight-outerheight-layout-issue
	if (bpmCore.IS_IOS && !window.navigator.standalone)
	{
		this.scrollHandler = bpmUtils.bind(this, function()
	   	{
	   		window.scrollTo(0, 0);
	   	});
		
	   	bpmEvent.addListener(window, 'scroll', this.scrollHandler);
	}

	/**
	 * Sets the initial scrollbar locations after a file was loaded.
	 */
	this.editor.addListener('resetGraphView', bpmUtils.bind(this, function()
	{
		this.resetScrollbars();
	}));
	
	/**
	 * Repaints the grid.
	 */
	this.addListener('gridEnabledChanged', bpmUtils.bind(this, function()
	{
		graph.view.validateBackground();
	}));
	
	this.addListener('backgroundColorChanged', bpmUtils.bind(this, function()
	{
		graph.view.validateBackground();
	}));

	var ui = this;
	graph.addListener(bpmEvent.DOUBLE_CLICK, function(sender, evt)
	{
		var cell = evt.getProperty('cell');
	
		ui.showValueBpmModal(cell);
	});

	graph.addListener('gridSizeChanged', bpmUtils.bind(this, function()
	{
		if (graph.isGridEnabled())
		{
			graph.view.validateBackground();
		}
	}));

   	// Resets UI, updates action and menu states
   	this.editor.resetGraph();
   	this.init();
   	this.open();
};

// Extends bpmEventSource
bpmUtils.extend(BpmUi, bpmEventSource);

/**
 * Global config that specifies if the compact UI elements should be used.
 */
BpmUi.compactUi = true;

/**
 * Specifies the size of the split bar.
 */
BpmUi.prototype.splitSize = 1; // (bpmCore.IS_TOUCH || bpmCore.IS_POINTER) ? 12 : 8;

/**
 * Specifies the height of the menubar. Default is 34.
 */
BpmUi.prototype.menubarHeight = 30;

/**
 * Specifies the width of the format panel should be enabled. Default is true.
 */
BpmUi.prototype.formatEnabled = true;

/**
 * Specifies the width of the format panel. Default is 240.
 */
BpmUi.prototype.formatWidth = 240;

/**
 * Specifies the height of the toolbar. Default is 40.
 */
BpmUi.prototype.toolbarHeight = 40;

/**
 * Specifies the height of the footer. Default is 28.
 */
BpmUi.prototype.footerHeight = 28;

/**
 * Specifies the height of the optional sidebarFooterContainer. Default is 34.
 */
BpmUi.prototype.sidebarFooterHeight = 34;

/**
 * Specifies the position of the horizontal split bar. Default is 240 or 118 for
 * screen widths <= 640px.
 */
BpmUi.prototype.hsplitPosition = (screen.width <= 640) ? 118 : ((urlParams['sidebar-entries'] != 'large') ? 212 : 240);

/**
 * Specifies if animations are allowed in <executeLayout>. Default is true.
 */
BpmUi.prototype.allowAnimation = true;

/**
 * Specifies if animations are allowed in <executeLayout>. Default is true.
 */
BpmUi.prototype.lightboxMaxFitScale = 2;

/**
 * Specifies if animations are allowed in <executeLayout>. Default is true.
 */
BpmUi.prototype.lightboxVerticalDivider = 4;

/**
 * Specifies if single click on horizontal split should collapse sidebar. Default is false.
 */
BpmUi.prototype.hsplitClickEnabled = false;

/**
 * Installs the listeners to update the action states.
 */
BpmUi.prototype.init = function()
{
	/**
	 * Keypress starts immediate editing on selection cell
	 */
	var graph = this.editor.graph;
		
	bpmEvent.addListener(graph.container, 'keydown', bpmUtils.bind(this, function(evt)
	{
		this.onKeyDown(evt);
	}));
	bpmEvent.addListener(graph.container, 'keypress', bpmUtils.bind(this, function(evt)
	{
		this.onKeyPress(evt);
	}));

	// Updates action states
	this.addUndoListener();
	this.addBeforeUnloadListener();
	
	graph.getSelectionModel().addListener(bpmEvent.CHANGE, bpmUtils.bind(this, function()
	{
		this.updateActionStates();
	}));
	
	graph.getModel().addListener(bpmEvent.CHANGE, bpmUtils.bind(this, function()
	{
		this.updateActionStates();
	}));
	
	// Changes action states after change of default parent
	var graphSetDefaultParent = graph.setDefaultParent;
	var ui = this;
	
	this.editor.graph.setDefaultParent = function()
	{
		graphSetDefaultParent.apply(this, arguments);
		ui.updateActionStates();
	};
	
	// Hack to make editLink available in vertex handler
	graph.editLink = ui.actions.get('editLink').funct;
	
	this.updateActionStates();
	this.initClipboard();
	this.initCanvas();
	
	if (this.format != null)
	{
		this.format.init();
	}
};

/**
 * Returns true if the given event should start editing. This implementation returns true.
 */
BpmUi.prototype.onKeyDown = function(evt)
{
	var graph = this.editor.graph;
	
	// Tab selects next cell
	if (evt.which == 9 && graph.isEnabled() && !bpmEvent.isAltDown(evt))
	{
		if (graph.isEditing())
		{
			graph.stopEditing(false);
		}
		else
		{
			graph.selectCell(!bpmEvent.isShiftDown(evt));
		}
		
		bpmEvent.consume(evt);
	}
};

/**
 * Returns true if the given event should start editing. This implementation returns true.
 */
BpmUi.prototype.onKeyPress = function(evt)
{
	var graph = this.editor.graph;
	
	// KNOWN: Focus does not work if label is empty in quirks mode
	if (this.isImmediateEditingEvent(evt) && !graph.isEditing() && !graph.isSelectionEmpty() && evt.which !== 0 &&
		!bpmEvent.isAltDown(evt) && !bpmEvent.isControlDown(evt) && !bpmEvent.isMetaDown(evt))
	{
		graph.escape();
		graph.startEditing();

		// Workaround for FF where char is lost if cursor is placed before char
		if (bpmCore.IS_FF)
		{
			var ce = graph.cellEditor;
			ce.textarea.innerHTML = String.fromCharCode(evt.which);

			// Moves cursor to end of textarea
			var range = document.createRange();
			range.selectNodeContents(ce.textarea);
			range.collapse(false);
			var sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
		}
	}
};

/**
 * Returns true if the given event should start editing. This implementation returns true.
 */
BpmUi.prototype.isImmediateEditingEvent = function(evt)
{
	return true;
};

/**
 * Private helper method.
 */
BpmUi.prototype.getCssClassForMarker = function(prefix, shape, marker, fill)
{
	var result = '';

	if (shape == 'flexArrow')
	{
		result = (marker != null && marker != bpmConstants.NONE) ?
			'geSprite geSprite-' + prefix + 'blocktrans' : 'geSprite geSprite-noarrow';
	}
	else
	{
		if (marker == bpmConstants.ARROW_CLASSIC)
		{
			result = (fill == '1') ? 'geSprite geSprite-' + prefix + 'classic' : 'geSprite geSprite-' + prefix + 'classictrans';
		}
		else if (marker == bpmConstants.ARROW_CLASSIC_THIN)
		{
			result = (fill == '1') ? 'geSprite geSprite-' + prefix + 'classicthin' : 'geSprite geSprite-' + prefix + 'classicthintrans';
		}
		else if (marker == bpmConstants.ARROW_OPEN)
		{
			result = 'geSprite geSprite-' + prefix + 'open';
		}
		else if (marker == bpmConstants.ARROW_OPEN_THIN)
		{
			result = 'geSprite geSprite-' + prefix + 'openthin';
		}
		else if (marker == bpmConstants.ARROW_BLOCK)
		{
			result = (fill == '1') ? 'geSprite geSprite-' + prefix + 'block' : 'geSprite geSprite-' + prefix + 'blocktrans';
		}
		else if (marker == bpmConstants.ARROW_BLOCK_THIN)
		{
			result = (fill == '1') ? 'geSprite geSprite-' + prefix + 'blockthin' : 'geSprite geSprite-' + prefix + 'blockthintrans';
		}
		else if (marker == bpmConstants.ARROW_OVAL)
		{
			result = (fill == '1') ? 'geSprite geSprite-' + prefix + 'oval' : 'geSprite geSprite-' + prefix + 'ovaltrans';
		}
		else if (marker == bpmConstants.ARROW_DIAMOND)
		{
			result = (fill == '1') ? 'geSprite geSprite-' + prefix + 'diamond' : 'geSprite geSprite-' + prefix + 'diamondtrans';
		}
		else if (marker == bpmConstants.ARROW_DIAMOND_THIN)
		{
			result = (fill == '1') ? 'geSprite geSprite-' + prefix + 'thindiamond' : 'geSprite geSprite-' + prefix + 'thindiamondtrans';
		}
		else if (marker == 'openAsync')
		{
			result = 'geSprite geSprite-' + prefix + 'openasync';
		}
		else if (marker == 'dash')
		{
			result = 'geSprite geSprite-' + prefix + 'dash';
		}
		else if (marker == 'cross')
		{
			result = 'geSprite geSprite-' + prefix + 'cross';
		}
		else if (marker == 'async')
		{
			result = (fill == '1') ? 'geSprite geSprite-' + prefix + 'async' : 'geSprite geSprite-' + prefix + 'asynctrans';
		}
		else if (marker == 'circle' || marker == 'circlePlus')
		{
			result = (fill == '1' || marker == 'circle') ? 'geSprite geSprite-' + prefix + 'circle' : 'geSprite geSprite-' + prefix + 'circleplus';
		}
		else if (marker == 'ERone')
		{
			result = 'geSprite geSprite-' + prefix + 'erone';
		}
		else if (marker == 'ERmandOne')
		{
			result = 'geSprite geSprite-' + prefix + 'eronetoone';
		}
		else if (marker == 'ERmany')
		{
			result = 'geSprite geSprite-' + prefix + 'ermany';
		}
		else if (marker == 'ERoneToMany')
		{
			result = 'geSprite geSprite-' + prefix + 'eronetomany';
		}
		else if (marker == 'ERzeroToOne')
		{
			result = 'geSprite geSprite-' + prefix + 'eroneopt';
		}
		else if (marker == 'ERzeroToMany')
		{
			result = 'geSprite geSprite-' + prefix + 'ermanyopt';
		}
		else
		{
			result = 'geSprite geSprite-noarrow';
		}
	}

	return result;
};

/**
 * Overridden in Menus.js
 */
BpmUi.prototype.createMenus = function()
{
	return null;
};

/**
 * Hook for allowing selection and context menu for certain events.
 */
BpmUi.prototype.updatePasteActionStates = function()
{
	var graph = this.editor.graph;
	var paste = this.actions.get('paste');
	var pasteHere = this.actions.get('pasteHere');
	
	paste.setEnabled(this.editor.graph.cellEditor.isContentEditing() || (!bpmClipboard.isEmpty() &&
		graph.isEnabled() && !graph.isCellLocked(graph.getDefaultParent())));
	pasteHere.setEnabled(paste.isEnabled());
};

/**
 * Hook for allowing selection and context menu for certain events.
 */
BpmUi.prototype.initClipboard = function()
{
	var ui = this;

	var bpmClipboardCut = bpmClipboard.cut;
	bpmClipboard.cut = function(graph)
	{
		if (graph.cellEditor.isContentEditing())
		{
			document.execCommand('cut', false, null);
		}
		else
		{
			bpmClipboardCut.apply(this, arguments);
		}
		
		ui.updatePasteActionStates();
	};
	
	var bpmClipboardCopy = bpmClipboard.copy;
	bpmClipboard.copy = function(graph)
	{
		if (graph.cellEditor.isContentEditing())
		{
			document.execCommand('copy', false, null);
		}
		else
		{
			bpmClipboardCopy.apply(this, arguments);
		}
		
		ui.updatePasteActionStates();
	};
	
	var bpmClipboardPaste = bpmClipboard.paste;
	bpmClipboard.paste = function(graph)
	{
		var result = null;
		
		if (graph.cellEditor.isContentEditing())
		{
			document.execCommand('paste', false, null);
		}
		else
		{
			result = bpmClipboardPaste.apply(this, arguments);
		}
		
		ui.updatePasteActionStates();
		
		return result;
	};

	// Overrides cell editor to update paste action state
	var cellEditorStartEditing = this.editor.graph.cellEditor.startEditing;
	
	this.editor.graph.cellEditor.startEditing = function()
	{
		cellEditorStartEditing.apply(this, arguments);
		ui.updatePasteActionStates();
	};
	
	var cellEditorStopEditing = this.editor.graph.cellEditor.stopEditing;
	
	this.editor.graph.cellEditor.stopEditing = function(cell, trigger)
	{
		cellEditorStopEditing.apply(this, arguments);
		ui.updatePasteActionStates();
	};
	
	this.updatePasteActionStates();
};

/**
 * Initializes the infinite canvas.
 */
BpmUi.prototype.lazyZoomDelay = 20;

/**
 * Initializes the infinite canvas.
 */
BpmUi.prototype.initCanvas = function()
{
	// Initial page layout view, scrollBuffer and timer-based scrolling
	var graph = this.editor.graph;
	graph.timerAutoScroll = true;

	/**
	 * Returns the padding for pages in page view with scrollbars.
	 */
	graph.getPagePadding = function()
	{
		return new bpmPoint(Math.max(0, Math.round((graph.container.offsetWidth - 34) / graph.view.scale)),
				Math.max(0, Math.round((graph.container.offsetHeight - 34) / graph.view.scale)));
	};

	// Fits the number of background pages to the graph
	graph.view.getBackgroundPageBounds = function()
	{
		var layout = this.graph.getPageLayout();
		var page = this.graph.getPageSize();
		
		return new bpmRectangle(this.scale * (this.translate.x + layout.x * page.width),
				this.scale * (this.translate.y + layout.y * page.height),
				this.scale * layout.width * page.width,
				this.scale * layout.height * page.height);
	};

	graph.getPreferredPageSize = function(bounds, width, height)
	{
		var pages = this.getPageLayout();
		var size = this.getPageSize();
		
		return new bpmRectangle(0, 0, pages.width * size.width, pages.height * size.height);
	};
	
	// Scales pages/graph to fit available size
	var resize = null;
	var ui = this;
	
	if (this.editor.isChromelessView())
	{
        resize = bpmUtils.bind(this, function(autoscale, maxScale, cx, cy)
        {
            if (graph.container != null)
            {
                cx = (cx != null) ? cx : 0;
                cy = (cy != null) ? cy : 0;
                
                var bds = (graph.pageVisible) ? graph.view.getBackgroundPageBounds() : graph.getGraphBounds();
                var scroll = bpmUtils.hasScrollbars(graph.container);
                var tr = graph.view.translate;
                var s = graph.view.scale;
                
                // Normalizes the bounds
                var b = bpmRectangle.fromRectangle(bds);
                b.x = b.x / s - tr.x;
                b.y = b.y / s - tr.y;
                b.width /= s;
                b.height /= s;
                
                var st = graph.container.scrollTop;
                var sl = graph.container.scrollLeft;
                var sb = (bpmCore.IS_QUIRKS || document.documentMode >= 8) ? 20 : 14;
                
                if (document.documentMode == 8 || document.documentMode == 9)
                {
                    sb += 3;
                }
                
                var cw = graph.container.offsetWidth - sb;
                var ch = graph.container.offsetHeight - sb;
                
                var ns = (autoscale) ? Math.max(0.3, Math.min(maxScale || 1, cw / b.width)) : s;
                var dx = ((cw - ns * b.width) / 2) / ns;
                var dy = (this.lightboxVerticalDivider == 0) ? 0 : ((ch - ns * b.height) / this.lightboxVerticalDivider) / ns;
                
                if (scroll)
                {
                    dx = Math.max(dx, 0);
                    dy = Math.max(dy, 0);
                }

                if (scroll || bds.width < cw || bds.height < ch)
                {
                    graph.view.scaleAndTranslate(ns, Math.floor(dx - b.x), Math.floor(dy - b.y));
                    graph.container.scrollTop = st * ns / s;
                    graph.container.scrollLeft = sl * ns / s;
                }
                else if (cx != 0 || cy != 0)
                {
                    var t = graph.view.translate;
                    graph.view.setTranslate(Math.floor(t.x + cx / s), Math.floor(t.y + cy / s));
                }
            }
        });
		
		// Hack to make function available to subclassers
		this.chromelessResize = resize;

		// Hook for subclassers for override
		this.chromelessWindowResize = bpmUtils.bind(this, function()
	   	{
			this.chromelessResize(false);
	   	});

		// Removable resize listener
		var autoscaleResize = bpmUtils.bind(this, function()
	   	{
			this.chromelessWindowResize(false);
	   	});
		
	   	bpmEvent.addListener(window, 'resize', autoscaleResize);
	   	
	   	this.destroyFunctions.push(function()
	   	{
	   		bpmEvent.removeListener(window, 'resize', autoscaleResize);
	   	});
	   	
		this.editor.addListener('resetGraphView', bpmUtils.bind(this, function()
		{
			this.chromelessResize(true);
		}));

		this.actions.get('zoomIn').funct = bpmUtils.bind(this, function(evt)
		{
			graph.zoomIn();
			this.chromelessResize(false);
		});
		this.actions.get('zoomOut').funct = bpmUtils.bind(this, function(evt)
		{
			graph.zoomOut();
			this.chromelessResize(false);
		});
		
		// Creates toolbar for viewer - do not use CSS here
		// as this may be used in a viewer that has no CSS
		if (urlParams['toolbar'] != '0')
		{
			var toolbarConfig = JSON.parse(decodeURIComponent(urlParams['toolbar-config'] || '{}'));
			
			this.chromelessToolbar = document.createElement('div');
			this.chromelessToolbar.style.position = 'fixed';
			this.chromelessToolbar.style.overflow = 'hidden';
			this.chromelessToolbar.style.boxSizing = 'border-box';
			this.chromelessToolbar.style.whiteSpace = 'nowrap';
			this.chromelessToolbar.style.backgroundColor = '#000000';
			this.chromelessToolbar.style.padding = '10px 10px 8px 10px';
			this.chromelessToolbar.style.left = '50%';
			
			if (!bpmCore.IS_VML)
			{
				bpmUtils.setPrefixedStyle(this.chromelessToolbar.style, 'borderRadius', '20px');
				bpmUtils.setPrefixedStyle(this.chromelessToolbar.style, 'transition', 'opacity 600ms ease-in-out');
			}
			
			var updateChromelessToolbarPosition = bpmUtils.bind(this, function()
			{
				var css = bpmUtils.getCurrentStyle(graph.container);
			 	this.chromelessToolbar.style.bottom = ((css != null) ? parseInt(css['margin-bottom'] || 0) : 0) +
			 		((this.tabContainer != null) ? (20 + parseInt(this.tabContainer.style.height)) : 20) + 'px';
			});
			
			this.editor.addListener('resetGraphView', updateChromelessToolbarPosition);
			updateChromelessToolbarPosition();
			
			var btnCount = 0;
	
			var addButton = bpmUtils.bind(this, function(fn, imgSrc, tip)
			{
				btnCount++;
				
				var a = document.createElement('span');
				a.style.paddingLeft = '8px';
				a.style.paddingRight = '8px';
				a.style.cursor = 'pointer';
				bpmEvent.addListener(a, 'click', fn);
				
				if (tip != null)
				{
					a.setAttribute('title', tip);
				}
				
				var img = document.createElement('img');
				img.setAttribute('border', '0');
				img.setAttribute('src', imgSrc);
				
				a.appendChild(img);
				this.chromelessToolbar.appendChild(a);
				
				return a;
			});
			
			if (toolbarConfig.backBtn != null)
			{
				addButton(bpmUtils.bind(this, function(evt)
				{
					window.location.href = toolbarConfig.backBtn.url;
					bpmEvent.consume(evt);
				}), BpmDraw.backLargeImage, bpmResources.get('back', null, 'Back'));
			}
			
			var prevButton = addButton(bpmUtils.bind(this, function(evt)
			{
				this.actions.get('previousPage').funct();
				bpmEvent.consume(evt);
			}), BpmDraw.previousLargeImage, bpmResources.get('previousPage'));
			
			var pageInfo = document.createElement('div');
			pageInfo.style.display = 'inline-block';
			pageInfo.style.verticalAlign = 'top';
			pageInfo.style.fontFamily = 'Helvetica,Arial';
			pageInfo.style.marginTop = '8px';
			pageInfo.style.fontSize = '14px';
			pageInfo.style.color = '#ffffff';
			this.chromelessToolbar.appendChild(pageInfo);
			
			var nextButton = addButton(bpmUtils.bind(this, function(evt)
			{
				this.actions.get('nextPage').funct();
				bpmEvent.consume(evt);
			}), BpmDraw.nextLargeImage, bpmResources.get('nextPage'));
			
			var updatePageInfo = bpmUtils.bind(this, function()
			{
				if (this.pages != null && this.pages.length > 1 && this.currentPage != null)
				{
					pageInfo.innerHTML = '';
					bpmUtils.write(pageInfo, (bpmUtils.indexOf(this.pages, this.currentPage) + 1) + ' / ' + this.pages.length);
				}
			});
			
			prevButton.style.paddingLeft = '0px';
			prevButton.style.paddingRight = '4px';
			nextButton.style.paddingLeft = '4px';
			nextButton.style.paddingRight = '0px';
			
			var updatePageBtns = bpmUtils.bind(this, function()
			{
				if (this.pages != null && this.pages.length > 1 && this.currentPage != null)
				{
					nextButton.style.display = '';
					prevButton.style.display = '';
					pageInfo.style.display = 'inline-block';
				}
				else
				{
					nextButton.style.display = 'none';
					prevButton.style.display = 'none';
					pageInfo.style.display = 'none';
				}
				
				updatePageInfo();
			});
			
			this.editor.addListener('resetGraphView', updatePageBtns);
			this.editor.addListener('pageSelected', updatePageInfo);
	
			addButton(bpmUtils.bind(this, function(evt)
			{
				this.actions.get('zoomOut').funct();
				bpmEvent.consume(evt);
			}), BpmDraw.zoomOutLargeImage, bpmResources.get('zoomOut') + ' (Alt+Mousewheel)');
			
			addButton(bpmUtils.bind(this, function(evt)
			{
				this.actions.get('zoomIn').funct();
				bpmEvent.consume(evt);
			}), BpmDraw.zoomInLargeImage, bpmResources.get('zoomIn') + ' (Alt+Mousewheel)');
			
			addButton(bpmUtils.bind(this, function(evt)
			{
				if (graph.isLightboxView())
				{
					if (graph.view.scale == 1)
					{
						this.lightboxFit();
					}
					else
					{
						graph.zoomTo(1);
					}
					
					this.chromelessResize(false);
				}
				else
				{
					this.chromelessResize(true);
				}
				
				bpmEvent.consume(evt);
			}), BpmDraw.actualSizeLargeImage, bpmResources.get('fit'));
	
			// Changes toolbar opacity on hover
			var fadeThread = null;
			var fadeThread2 = null;
			
			var fadeOut = bpmUtils.bind(this, function(delay)
			{
				if (fadeThread != null)
				{
					window.clearTimeout(fadeThread);
					fadeThead = null;
				}
				
				if (fadeThread2 != null)
				{
					window.clearTimeout(fadeThread2);
					fadeThead2 = null;
				}
				
				fadeThread = window.setTimeout(bpmUtils.bind(this, function()
				{
				 	bpmUtils.setOpacity(this.chromelessToolbar, 0);
					fadeThread = null;
				 	
					fadeThread2 = window.setTimeout(bpmUtils.bind(this, function()
					{
						this.chromelessToolbar.style.display = 'none';
						fadeThread2 = null;
					}), 600);
				}), delay || 200);
			});
			
			var fadeIn = bpmUtils.bind(this, function(opacity)
			{
				if (fadeThread != null)
				{
					window.clearTimeout(fadeThread);
					fadeThead = null;
				}
				
				if (fadeThread2 != null)
				{
					window.clearTimeout(fadeThread2);
					fadeThead2 = null;
				}
				
				this.chromelessToolbar.style.display = '';
				bpmUtils.setOpacity(this.chromelessToolbar, opacity || 30);
			});
	
			if (urlParams['layers'] == '1')
			{
				this.layersBpmModal = null;
				
				var layersButton = addButton(bpmUtils.bind(this, function(evt)
				{
					if (this.layersBpmModal != null)
					{
						this.layersBpmModal.parentNode.removeChild(this.layersBpmModal);
						this.layersBpmModal = null;
					}
					else
					{
						this.layersBpmModal = graph.createLayersBpmModal();
						
						bpmEvent.addListener(this.layersBpmModal, 'mouseleave', bpmUtils.bind(this, function()
						{
							this.layersBpmModal.parentNode.removeChild(this.layersBpmModal);
							this.layersBpmModal = null;
						}));
						
						var r = layersButton.getBoundingClientRect();
						
						bpmUtils.setPrefixedStyle(this.layersBpmModal.style, 'borderRadius', '5px');
						this.layersBpmModal.style.position = 'fixed';
						this.layersBpmModal.style.fontFamily = 'Helvetica,Arial';
						this.layersBpmModal.style.backgroundColor = '#000000';
						this.layersBpmModal.style.width = '160px';
						this.layersBpmModal.style.padding = '4px 2px 4px 2px';
						this.layersBpmModal.style.color = '#ffffff';
						bpmUtils.setOpacity(this.layersBpmModal, 70);
						this.layersBpmModal.style.left = r.left + 'px';
						this.layersBpmModal.style.bottom = parseInt(this.chromelessToolbar.style.bottom) +
							this.chromelessToolbar.offsetHeight + 4 + 'px';
						
						// Puts the dialog on top of the container z-index
						var style = bpmUtils.getCurrentStyle(this.editor.graph.container);
						this.layersBpmModal.style.zIndex = style.zIndex;
						
						document.body.appendChild(this.layersBpmModal);
					}
					
					bpmEvent.consume(evt);
				}), BpmDraw.layersLargeImage, bpmResources.get('layers'));
				
				// Shows/hides layers button depending on content
				var model = graph.getModel();
	
				model.addListener(bpmEvent.CHANGE, function()
				{
					 layersButton.style.display = (model.getChildCount(model.root) > 1) ? '' : 'none';
				});
			}
	
			this.addChromelessToolbarItems(addButton);
	
			if (this.editor.editButtonLink != null || this.editor.editButtonFunc != null)
			{
				addButton(bpmUtils.bind(this, function(evt)
				{
					if (this.editor.editButtonFunc != null) 
					{
						this.editor.editButtonFunc();
					} 
					else if (this.editor.editButtonLink == '_blank')
					{
						this.editor.editAsNew(this.getEditBlankXml());
					}
					else
					{
						graph.openLink(this.editor.editButtonLink, 'editWindow');
					}
					
					bpmEvent.consume(evt);
				}), BpmDraw.editLargeImage, bpmResources.get('edit'));
			}
			
			if (this.lightboxToolbarActions != null)
			{
				for (var i = 0; i < this.lightboxToolbarActions.length; i++)
				{
					var lbAction = this.lightboxToolbarActions[i];
					addButton(lbAction.fn, lbAction.icon, lbAction.tooltip);
				}
			}

			if (toolbarConfig.refreshBtn != null)
			{
				addButton(bpmUtils.bind(this, function(evt)
				{
					if (toolbarConfig.refreshBtn.url)
					{
						window.location.href = toolbarConfig.refreshBtn.url;
					}
					else
					{
						window.location.reload();
					}
					
					bpmEvent.consume(evt);
				}), BpmDraw.refreshLargeImage, bpmResources.get('refresh', null, 'Refresh'));
			}

			if (toolbarConfig.fullscreenBtn != null && window.self !== window.top)
			{
				addButton(bpmUtils.bind(this, function(evt)
				{
					if (toolbarConfig.fullscreenBtn.url)
					{
						graph.openLink(toolbarConfig.fullscreenBtn.url);
					}
					else
					{
						graph.openLink(window.location.href);
					}
					
					bpmEvent.consume(evt);
				}), BpmDraw.fullscreenLargeImage, bpmResources.get('openInNewWindow', null, 'Open in New Window'));
			}
			
			if ((toolbarConfig.closeBtn && window.self === window.top) ||
				(graph.lightbox && (urlParams['close'] == '1' || this.container != document.body)))
			
			{
				addButton(bpmUtils.bind(this, function(evt)
				{
					if (urlParams['close'] == '1' || toolbarConfig.closeBtn)
					{
						window.close();
					}
					else
					{
						this.destroy();
						bpmEvent.consume(evt);
					}
				}), BpmDraw.closeLargeImage, bpmResources.get('close') + ' (Escape)');
			}
	
			// Initial state invisible
			this.chromelessToolbar.style.display = 'none';
			bpmUtils.setPrefixedStyle(this.chromelessToolbar.style, 'transform', 'translate(-50%,0)');
			graph.container.appendChild(this.chromelessToolbar);
			
			bpmEvent.addListener(graph.container, (bpmCore.IS_POINTER) ? 'pointermove' : 'mousemove', bpmUtils.bind(this, function(evt)
			{
				if (!bpmEvent.isTouchEvent(evt))
				{
					if (!bpmEvent.isShiftDown(evt))
					{
						fadeIn(30);
					}
					
					fadeOut();
				}
			}));
			
			bpmEvent.addListener(this.chromelessToolbar, (bpmCore.IS_POINTER) ? 'pointermove' : 'mousemove', function(evt)
			{
				bpmEvent.consume(evt);
			});
			
			bpmEvent.addListener(this.chromelessToolbar, 'mouseenter', bpmUtils.bind(this, function(evt)
			{
				if (!bpmEvent.isShiftDown(evt))
				{
					fadeIn(100);
				}
				else
				{
					fadeOut();
				}
			}));

			bpmEvent.addListener(this.chromelessToolbar, 'mousemove',  bpmUtils.bind(this, function(evt)
			{
				if (!bpmEvent.isShiftDown(evt))
				{
					fadeIn(100);
				}
				else
				{
					fadeOut();
				}
				
				bpmEvent.consume(evt);
			}));

			bpmEvent.addListener(this.chromelessToolbar, 'mouseleave',  bpmUtils.bind(this, function(evt)
			{
				if (!bpmEvent.isTouchEvent(evt))
				{
					fadeIn(30);
				}
			}));

			// Shows/hides toolbar for touch devices
			var tol = graph.getTolerance();

			graph.addMouseListener(
			{
			    startX: 0,
			    startY: 0,
			    scrollLeft: 0,
			    scrollTop: 0,
			    mouseDown: function(sender, me)
			    {
			    	this.startX = me.getGraphX();
			    	this.startY = me.getGraphY();
				    this.scrollLeft = graph.container.scrollLeft;
				    this.scrollTop = graph.container.scrollTop;
			    },
			    mouseMove: function(sender, me) {},
			    mouseUp: function(sender, me)
			    {
			    	if (bpmEvent.isTouchEvent(me.getEvent()))
			    	{
				    	if ((Math.abs(this.scrollLeft - graph.container.scrollLeft) < tol &&
				    		Math.abs(this.scrollTop - graph.container.scrollTop) < tol) &&
				    		(Math.abs(this.startX - me.getGraphX()) < tol &&
				    		Math.abs(this.startY - me.getGraphY()) < tol))
				    	{
				    		if (parseFloat(ui.chromelessToolbar.style.opacity || 0) > 0)
				    		{
				    			fadeOut();
				    		}
				    		else
				    		{
				    			fadeIn(30);
				    		}
						}
			    	}
			    }
			});
		} // end if toolbar

		// Installs handling of highlight and handling links to relative links and anchors
		if (!this.editor.editable)
		{
			this.addChromelessClickHandler();
		}
	}
	else if (this.editor.extendCanvas)
	{
		/**
		 * Guesses autoTranslate to avoid another repaint (see below).
		 * Works if only the scale of the graph changes or if pages
		 * are visible and the visible pages do not change.
		 */
		var graphViewValidate = graph.view.validate;
		graph.view.validate = function()
		{
			if (this.graph.container != null && bpmUtils.hasScrollbars(this.graph.container))
			{
				var pad = this.graph.getPagePadding();
				var size = this.graph.getPageSize();
				
				// Updating scrollbars here causes flickering in quirks and is not needed
				// if zoom method is always used to set the current scale on the graph.
				var tx = this.translate.x;
				var ty = this.translate.y;
				this.translate.x = pad.x - (this.x0 || 0) * size.width;
				this.translate.y = pad.y - (this.y0 || 0) * size.height;
			}
			
			graphViewValidate.apply(this, arguments);
		};
		
		var graphSizeDidChange = graph.sizeDidChange;
		graph.sizeDidChange = function()
		{
			if (this.container != null && bpmUtils.hasScrollbars(this.container))
			{
				var pages = this.getPageLayout();
				var pad = this.getPagePadding();
				var size = this.getPageSize();
				
				// Updates the minimum graph size
				var minw = Math.ceil(2 * pad.x + pages.width * size.width);
				var minh = Math.ceil(2 * pad.y + pages.height * size.height);
				
				var min = graph.minimumGraphSize;
				
				// LATER: Fix flicker of scrollbar size in IE quirks mode
				// after delayed call in window.resize event handler
				if (min == null || min.width != minw || min.height != minh)
				{
					graph.minimumGraphSize = new bpmRectangle(0, 0, minw, minh);
				}
				
				// Updates auto-translate to include padding and graph size
				var dx = pad.x - pages.x * size.width;
				var dy = pad.y - pages.y * size.height;
				
				if (!this.autoTranslate && (this.view.translate.x != dx || this.view.translate.y != dy))
				{
					this.autoTranslate = true;
					this.view.x0 = pages.x;
					this.view.y0 = pages.y;

					// NOTE: THIS INVOKES THIS METHOD AGAIN. UNFORTUNATELY THERE IS NO WAY AROUND THIS SINCE THE
					// BOUNDS ARE KNOWN AFTER THE VALIDATION AND SETTING THE TRANSLATE TRIGGERS A REVALIDATION.
					// SHOULD MOVE TRANSLATE/SCALE TO VIEW.
					var tx = graph.view.translate.x;
					var ty = graph.view.translate.y;
					graph.view.setTranslate(dx, dy);
					
					// LATER: Fix rounding errors for small zoom
					graph.container.scrollLeft += Math.round((dx - tx) * graph.view.scale);
					graph.container.scrollTop += Math.round((dy - ty) * graph.view.scale);
					
					this.autoTranslate = false;
					
					return;
				}

				graphSizeDidChange.apply(this, arguments);
			}
			else
			{
				// Fires event but does not invoke superclass
				this.fireEvent(new bpmEventObject(bpmEvent.SIZE, 'bounds', this.getGraphBounds()));
			}
		};
	}
	
	// Accumulates the zoom factor while the rendering is taking place
	// so that not the complete sequence of zoom steps must be painted
	graph.updateZoomTimeout = null;
	graph.cumulativeZoomFactor = 1;
	
	var cursorPosition = null;

	graph.lazyZoom = function(zoomIn)
	{
		if (this.updateZoomTimeout != null)
		{
			window.clearTimeout(this.updateZoomTimeout);
		}

		// Switches to 1% zoom steps below 15%
		// Lower bound depdends on rounding below
		if (zoomIn)
		{
			if (this.view.scale * this.cumulativeZoomFactor < 0.15)
			{
				this.cumulativeZoomFactor = (this.view.scale + 0.01) / this.view.scale;
			}
			else
			{
				// Uses to 5% zoom steps for better grid rendering in webkit
				// and to avoid rounding errors for zoom steps
				this.cumulativeZoomFactor *= this.zoomFactor;
				this.cumulativeZoomFactor = Math.round(this.view.scale * this.cumulativeZoomFactor * 20) / 20 / this.view.scale;
			}
		}
		else
		{
			if (this.view.scale * this.cumulativeZoomFactor <= 0.15)
			{
				this.cumulativeZoomFactor = (this.view.scale - 0.01) / this.view.scale;
			}
			else
			{
				// Uses to 5% zoom steps for better grid rendering in webkit
				// and to avoid rounding errors for zoom steps
				this.cumulativeZoomFactor /= this.zoomFactor;
				this.cumulativeZoomFactor = Math.round(this.view.scale * this.cumulativeZoomFactor * 20) / 20 / this.view.scale;
			}
		}
		
		this.cumulativeZoomFactor = Math.max(0.01, Math.min(this.view.scale * this.cumulativeZoomFactor, 160) / this.view.scale);
		
        this.updateZoomTimeout = window.setTimeout(bpmUtils.bind(this, function()
        {
            var offset = bpmUtils.getOffset(graph.container);
            var dx = 0;
            var dy = 0;
            
            if (cursorPosition != null)
            {
                dx = graph.container.offsetWidth / 2 - cursorPosition.x + offset.x;
                dy = graph.container.offsetHeight / 2 - cursorPosition.y + offset.y;
            }

            var prev = this.view.scale;
            this.zoom(this.cumulativeZoomFactor);
            var s = this.view.scale;
            
            if (s != prev)
            {
                if (resize != null)
                {
                		ui.chromelessResize(false, null, dx * (this.cumulativeZoomFactor - 1),
                				dy * (this.cumulativeZoomFactor - 1));
                }
                
                if (bpmUtils.hasScrollbars(graph.container) && (dx != 0 || dy != 0))
                {
                    graph.container.scrollLeft -= dx * (this.cumulativeZoomFactor - 1);
                    graph.container.scrollTop -= dy * (this.cumulativeZoomFactor - 1);
                }
            }
            
            this.cumulativeZoomFactor = 1;
            this.updateZoomTimeout = null;
        }), this.lazyZoomDelay);
	};
	
	bpmEvent.addMouseWheelListener(bpmUtils.bind(this, function(evt, up)
	{
		// Ctrl+wheel (or pinch on touchpad) is a native browser zoom event is OS X
		// LATER: Add support for zoom via pinch on trackpad for Chrome in OS X
		if ((this.dialogs == null || this.dialogs.length == 0) && graph.isZoomWheelEvent(evt))
		{
			var source = bpmEvent.getSource(evt);
			
			while (source != null)
			{
				if (source == graph.container)
				{
					cursorPosition = new bpmPoint(bpmEvent.getClientX(evt), bpmEvent.getClientY(evt));
					graph.lazyZoom(up);
					bpmEvent.consume(evt);
			
					return false;
				}
				
				source = source.parentNode;
			}
		}
	}), graph.container);
};

/**
 * Creates a temporary graph instance for rendering off-screen content.
 */
BpmUi.prototype.addChromelessToolbarItems = function(addButton)
{
	addButton(bpmUtils.bind(this, function(evt)
	{
		this.actions.get('print').funct();
		bpmEvent.consume(evt);
	}), BpmDraw.printLargeImage, bpmResources.get('print'));	
};

/**
 * Creates a temporary graph instance for rendering off-screen content.
 */
BpmUi.prototype.createTemporaryGraph = function(stylesheet)
{
	var graph = new Draw(document.createElement('div'), null, null, stylesheet);
	graph.resetViewOnRootChange = false;
	graph.setConnectable(false);
	graph.gridEnabled = false;
	graph.autoScroll = false;
	graph.setTooltips(false);
	graph.setEnabled(false);

	// Container must be in the DOM for correct HTML rendering
	graph.container.style.visibility = 'hidden';
	graph.container.style.position = 'absolute';
	graph.container.style.overflow = 'hidden';
	graph.container.style.height = '1px';
	graph.container.style.width = '1px';
	
	return graph;
};

/**
 * 
 */
BpmUi.prototype.addChromelessClickHandler = function()
{
	var hl = urlParams['highlight'];
	
	// Adds leading # for highlight color code
	if (hl != null && hl.length > 0)
	{
		hl = '#' + hl;
	}

	this.editor.graph.addClickHandler(hl);
};

/**
 * 
 */
BpmUi.prototype.toggleBpmSchemePanel = function(forceHide)
{
	if (this.format != null)
	{
		this.formatWidth = (forceHide || this.formatWidth > 0) ? 0 : 240;
		this.formatContainer.style.display = (forceHide || this.formatWidth > 0) ? '' : 'none';
		this.refresh();
		this.format.refresh();
		this.fireEvent(new bpmEventObject('formatWidthChanged'));
	}
};

/**
 * Adds support for placeholders in labels.
 */
BpmUi.prototype.lightboxFit = function(maxHeight)
{
	if (this.isDiagramEmpty())
	{
		this.editor.graph.view.setScale(1);
	}
	else
	{
		var p = urlParams['border'];
		var border = 60;
		
		if (p != null)
		{
			border = parseInt(p);
		}
		
		// LATER: Use initial graph bounds to avoid rounding errors
		this.editor.graph.maxFitScale = this.lightboxMaxFitScale;
		this.editor.graph.fit(border, null, null, null, null, null, maxHeight);
		this.editor.graph.maxFitScale = null;
	}
};

/**
 * Translates this point by the given vector.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
BpmUi.prototype.isDiagramEmpty = function()
{
	var model = this.editor.graph.getModel();
	
	return model.getChildCount(model.root) == 1 && model.getChildCount(model.getChildAt(model.root, 0)) == 0;
};

/**
 * Hook for allowing selection and context menu for certain events.
 */
BpmUi.prototype.isSelectionAllowed = function(evt)
{
	return bpmEvent.getSource(evt).nodeName == 'SELECT' || (bpmEvent.getSource(evt).nodeName == 'INPUT' &&
		bpmUtils.isAncestorNode(this.formatContainer, bpmEvent.getSource(evt)));
};

/**
 * Installs dialog if browser window is closed without saving
 * This must be disabled during save and image export.
 */
BpmUi.prototype.addBeforeUnloadListener = function()
{
	// Installs dialog if browser window is closed without saving
	// This must be disabled during save and image export
	window.onbeforeunload = bpmUtils.bind(this, function()
	{
		if (!this.editor.isChromelessView())
		{
			return this.onBeforeUnload();
		}
	});
};

/**
 * Sets the onbeforeunload for the application
 */
BpmUi.prototype.onBeforeUnload = function()
{
	if (this.editor.modified)
	{
		return bpmResources.get('allChangesLost');
	}
};

/**
 * Opens the current diagram via the window.opener if one exists.
 */
BpmUi.prototype.open = function()
{
	// Cross-domain window access is not allowed in FF, so if we
	// were opened from another domain then this will fail.
	try
	{
		// console.log(window.opener.openFile);
		if (window.opener != null && window.opener.openFile != null)
		{
			window.opener.openFile.setConsumer(bpmUtils.bind(this, function(xml, filename)
			{
				try
				{
					var doc = bpmUtils.parseXml(xml); 
					this.editor.setGraphXml(doc.documentElement);
					this.editor.setModified(false);
					this.editor.undoManager.clear();
					
					if (filename != null)
					{
						this.editor.setFilename(filename);
						this.updateDocumentTitle();
					}
					
					var self = this;
					this.workfiles[filename] = xml;
					this.menus.addworkfile(filename);
					this.actions.addAction(filename, function() {
						window.openNew = false;
						window.openKey = 'open';				
						try
						{
							var xml = self.workfiles[filename];
							var doc = bpmUtils.parseXml(xml); 

							self.editor.setGraphXml(doc.documentElement);
							self.editor.setModified(false);
							self.editor.undoManager.clear();
							
							if (filename != null)
							{
								self.editor.setFilename(filename);
								self.updateDocumentTitle();
							}
							
							return;
						}
						catch (e)
						{
							bpmUtils.alert(bpmResources.get('invalidOrMissingFile') + ': ' + e.message);
						}
					});			
					return;
				}
				catch (e)
				{
					bpmUtils.alert(bpmResources.get('invalidOrMissingFile') + ': ' + e.message);
				}
			}));
		}
	}
	catch(e)
	{
		// ignore
	}
	
	// Fires as the last step if no file was loaded
	this.editor.graph.view.validate();
	
	// Required only in special cases where an initial file is opened
	// and the minimumGraphSize changes and CSS must be updated.
	this.editor.graph.sizeDidChange();
	this.editor.fireEvent(new bpmEventObject('resetGraphView'));
};

/**
 * Sets the current menu and element.
 */
BpmUi.prototype.setCurrentMenu = function(menu, elt)
{
	this.currentMenuElt = elt;
	this.currentMenu = menu;
};

/**
 * Resets the current menu and element.
 */
BpmUi.prototype.resetCurrentMenu = function()
{
	this.currentMenuElt = null;
	this.currentMenu = null;
};

/**
 * Hides and destroys the current menu.
 */
BpmUi.prototype.hideCurrentMenu = function()
{
	if (this.currentMenu != null)
	{
		this.currentMenu.hideMenu();
		this.resetCurrentMenu();
	}
};

/**
 * Updates the document title.
 */
BpmUi.prototype.updateDocumentTitle = function()
{
	var title = this.editor.getOrCreateFilename();
	
	if (this.editor.appName != null)
	{
		title += ' - ' + this.editor.appName;
	}
	
	document.title = title;
};

/**
 * Updates the document title.
 */
BpmUi.prototype.createHoverIcons = function()
{
	return new HoverIcons(this.editor.graph);
};

/**
 * Returns the URL for a copy of this editor with no state.
 */
BpmUi.prototype.redo = function()
{
	try
	{
		var graph = this.editor.graph;
		
		if (graph.isEditing())
		{
			document.execCommand('redo', false, null);
		}
		else
		{
			this.editor.undoManager.redo();
		}
	}
	catch (e)
	{
		// ignore all errors
	}
};

/**
 * Returns the URL for a copy of this editor with no state.
 */
BpmUi.prototype.undo = function()
{
	try
	{
		var graph = this.editor.graph;
	
		if (graph.isEditing())
		{
			// Stops editing and executes undo on graph if native undo
			// does not affect current editing value
			var value = graph.cellEditor.textarea.innerHTML;
			document.execCommand('undo', false, null);
	
			if (value == graph.cellEditor.textarea.innerHTML)
			{
				graph.stopEditing(true);
				this.editor.undoManager.undo();
			}
		}
		else
		{
			this.editor.undoManager.undo();
		}
	}
	catch (e)
	{
		// ignore all errors
	}
};

/**
 * Returns the URL for a copy of this editor with no state.
 */
BpmUi.prototype.canRedo = function()
{
	return this.editor.graph.isEditing() || this.editor.undoManager.canRedo();
};

/**
 * Returns the URL for a copy of this editor with no state.
 */
BpmUi.prototype.canUndo = function()
{
	return this.editor.graph.isEditing() || this.editor.undoManager.canUndo();
};

/**
 * 
 */
BpmUi.prototype.getEditBlankXml = function()
{
	return bpmUtils.getXml(this.editor.getGraphXml());
};

/**
 * Returns the URL for a copy of this editor with no state.
 */
BpmUi.prototype.getUrl = function(pathname)
{
	var href = (pathname != null) ? pathname : window.location.pathname;
	var parms = (href.indexOf('?') > 0) ? 1 : 0;
	
	// Removes template URL parameter for new blank diagram
	for (var key in urlParams)
	{
		if (parms == 0)
		{
			href += '?';
		}
		else
		{
			href += '&';
		}
	
		href += key + '=' + urlParams[key];
		parms++;
	}
	
	return href;
};

/**
 * Specifies if the graph has scrollbars.
 */
BpmUi.prototype.setScrollbars = function(value)
{
	var graph = this.editor.graph;
	var prev = graph.container.style.overflow;
	graph.scrollbars = value;
	this.editor.updateGraphComponents();

	if (prev != graph.container.style.overflow)
	{
		if (graph.container.style.overflow == 'hidden')
		{
			var t = graph.view.translate;
			graph.view.setTranslate(t.x - graph.container.scrollLeft / graph.view.scale, t.y - graph.container.scrollTop / graph.view.scale);
			graph.container.scrollLeft = 0;
			graph.container.scrollTop = 0;
			graph.minimumGraphSize = null;
			graph.sizeDidChange();
		}
		else
		{
			var dx = graph.view.translate.x;
			var dy = graph.view.translate.y;

			graph.view.translate.x = 0;
			graph.view.translate.y = 0;
			graph.sizeDidChange();
			graph.container.scrollLeft -= Math.round(dx * graph.view.scale);
			graph.container.scrollTop -= Math.round(dy * graph.view.scale);
		}
	}
	
	this.fireEvent(new bpmEventObject('scrollbarsChanged'));
};

/**
 * Returns true if the graph has scrollbars.
 */
BpmUi.prototype.hasScrollbars = function()
{
	return this.editor.graph.scrollbars;
};

/**
 * Resets the state of the scrollbars.
 */
BpmUi.prototype.resetScrollbars = function()
{
	var graph = this.editor.graph;
	
	if (!this.editor.extendCanvas)
	{
		graph.container.scrollTop = 0;
		graph.container.scrollLeft = 0;
	
		if (!bpmUtils.hasScrollbars(graph.container))
		{
			graph.view.setTranslate(0, 0);
		}
	}
	else if (!this.editor.isChromelessView())
	{
		if (bpmUtils.hasScrollbars(graph.container))
		{
			if (graph.pageVisible)
			{
				var pad = graph.getPagePadding();
				graph.container.scrollTop = Math.floor(pad.y - this.editor.initialTopSpacing) - 1;
				graph.container.scrollLeft = Math.floor(Math.min(pad.x,
					(graph.container.scrollWidth - graph.container.clientWidth) / 2)) - 1;

				// Scrolls graph to visible area
				var bounds = graph.getGraphBounds();
				
				if (bounds.width > 0 && bounds.height > 0)
				{
					if (bounds.x > graph.container.scrollLeft + graph.container.clientWidth * 0.9)
					{
						graph.container.scrollLeft = Math.min(bounds.x + bounds.width - graph.container.clientWidth, bounds.x - 10);
					}
					
					if (bounds.y > graph.container.scrollTop + graph.container.clientHeight * 0.9)
					{
						graph.container.scrollTop = Math.min(bounds.y + bounds.height - graph.container.clientHeight, bounds.y - 10);
					}
				}
			}
			else
			{
				var bounds = graph.getGraphBounds();
				var width = Math.max(bounds.width, graph.scrollTileSize.width * graph.view.scale);
				var height = Math.max(bounds.height, graph.scrollTileSize.height * graph.view.scale);
				graph.container.scrollTop = Math.floor(Math.max(0, bounds.y - Math.max(20, (graph.container.clientHeight - height) / 4)));
				graph.container.scrollLeft = Math.floor(Math.max(0, bounds.x - Math.max(0, (graph.container.clientWidth - width) / 2)));
			}
		}
		else
		{
			// This code is not actively used since the default for scrollbars is always true
			if (graph.pageVisible)
			{
				var b = graph.view.getBackgroundPageBounds();
				graph.view.setTranslate(Math.floor(Math.max(0, (graph.container.clientWidth - b.width) / 2) - b.x),
					Math.floor(Math.max(0, (graph.container.clientHeight - b.height) / 2) - b.y));
			}
			else
			{
				var bounds = graph.getGraphBounds();
				graph.view.setTranslate(Math.floor(Math.max(0, Math.max(0, (graph.container.clientWidth - bounds.width) / 2) - bounds.x)),
					Math.floor(Math.max(0, Math.max(20, (graph.container.clientHeight - bounds.height) / 4)) - bounds.y));
			}
		}
	}
};

/**
 * Loads the stylesheet for this graph.
 */
BpmUi.prototype.setPageVisible = function(value)
{
	var graph = this.editor.graph;
	var hasScrollbars = bpmUtils.hasScrollbars(graph.container);
	var tx = 0;
	var ty = 0;
	
	if (hasScrollbars)
	{
		tx = graph.view.translate.x * graph.view.scale - graph.container.scrollLeft;
		ty = graph.view.translate.y * graph.view.scale - graph.container.scrollTop;
	}
	
	graph.pageVisible = value;
	graph.pageBreaksVisible = value; 
	graph.preferPageSize = value;
	graph.view.validateBackground();

	// Workaround for possible handle offset
	if (hasScrollbars)
	{
		var cells = graph.getSelectionCells();
		graph.clearSelection();
		graph.setSelectionCells(cells);
	}
	
	// Calls updatePageBreaks
	graph.sizeDidChange();
	
	if (hasScrollbars)
	{
		graph.container.scrollLeft = graph.view.translate.x * graph.view.scale - tx;
		graph.container.scrollTop = graph.view.translate.y * graph.view.scale - ty;
	}
	
	this.fireEvent(new bpmEventObject('pageViewChanged'));
};

/**
 * Change types
 */
function ChangePageSetup(ui, color, image, format)
{
	this.ui = ui;
	this.color = color;
	this.previousColor = color;
	this.image = image;
	this.previousImage = image;
	this.format = format;
	this.previousBpmScheme = format;
	
	// Needed since null are valid values for color and image
	this.ignoreColor = false;
	this.ignoreImage = false;
}

/**
 * Implementation of the undoable page rename.
 */
ChangePageSetup.prototype.execute = function()
{
	var graph = this.ui.editor.graph;
	
	if (!this.ignoreColor)
	{
		this.color = this.previousColor;
		var tmp = graph.background;
		this.ui.setBackgroundColor(this.previousColor);
		this.previousColor = tmp;
	}
	
	if (!this.ignoreImage)
	{
		this.image = this.previousImage;
		var tmp = graph.backgroundImage;
		this.ui.setBackgroundImage(this.previousImage);
		this.previousImage = tmp;
	}
	
	if (this.previousBpmScheme != null)
	{
		this.format = this.previousBpmScheme;
		var tmp = graph.pageBpmScheme;
		
		if (this.previousBpmScheme.width != tmp.width ||
			this.previousBpmScheme.height != tmp.height)
		{
			this.ui.setPageBpmScheme(this.previousBpmScheme);
			this.previousBpmScheme = tmp;
		}
	}

    if (this.foldingEnabled != null && this.foldingEnabled != this.ui.editor.graph.foldingEnabled)
    {
    	this.ui.setFoldingEnabled(this.foldingEnabled);
        this.foldingEnabled = !this.foldingEnabled;
    }
};

// Registers codec for ChangePageSetup
(function()
{
	var codec = new bpmObjectCodec(new ChangePageSetup(),  ['ui', 'previousColor', 'previousImage', 'previousBpmScheme']);

	codec.afterDecode = function(dec, node, obj)
	{
		obj.previousColor = obj.color;
		obj.previousImage = obj.image;
		obj.previousBpmScheme = obj.format;

        if (obj.foldingEnabled != null)
        {
        		obj.foldingEnabled = !obj.foldingEnabled;
        }
       
		return obj;
	};
	
	bpmCodecRegistry.register(codec);
})();

/**
 * Loads the stylesheet for this graph.
 */
BpmUi.prototype.setBackgroundColor = function(value)
{
	this.editor.graph.background = value;
	this.editor.graph.view.validateBackground();

	this.fireEvent(new bpmEventObject('backgroundColorChanged'));
};

/**
 * Loads the stylesheet for this graph.
 */
BpmUi.prototype.setFoldingEnabled = function(value)
{
	this.editor.graph.foldingEnabled = value;
	this.editor.graph.view.revalidate();
	
	this.fireEvent(new bpmEventObject('foldingEnabledChanged'));
};

/**
 * Loads the stylesheet for this graph.
 */
BpmUi.prototype.setPageBpmScheme = function(value)
{
	this.editor.graph.pageBpmScheme = value;
	
	if (!this.editor.graph.pageVisible)
	{
		this.actions.get('pageView').funct();
	}
	else
	{
		this.editor.graph.view.validateBackground();
		this.editor.graph.sizeDidChange();
	}

	this.fireEvent(new bpmEventObject('pageBpmSchemeChanged'));
};

/**
 * Loads the stylesheet for this graph.
 */
BpmUi.prototype.setPageScale = function(value)
{
	this.editor.graph.pageScale = value;
	
	if (!this.editor.graph.pageVisible)
	{
		this.actions.get('pageView').funct();
	}
	else
	{
		this.editor.graph.view.validateBackground();
		this.editor.graph.sizeDidChange();
	}

	this.fireEvent(new bpmEventObject('pageScaleChanged'));
};

/**
 * Loads the stylesheet for this graph.
 */
BpmUi.prototype.setGridColor = function(value)
{
	this.editor.graph.view.gridColor = value;
	this.editor.graph.view.validateBackground();
	this.fireEvent(new bpmEventObject('gridColorChanged'));
};

/**
 * Updates the states of the given undo/redo items.
 */
BpmUi.prototype.addUndoListener = function()
{
	var undo = this.actions.get('undo');
	var redo = this.actions.get('redo');
	
	var undoMgr = this.editor.undoManager;
	
    var undoListener = bpmUtils.bind(this, function()
    {
    	undo.setEnabled(this.canUndo());
    	redo.setEnabled(this.canRedo());
    });

    undoMgr.addListener(bpmEvent.ADD, undoListener);
    undoMgr.addListener(bpmEvent.UNDO, undoListener);
    undoMgr.addListener(bpmEvent.REDO, undoListener);
    undoMgr.addListener(bpmEvent.CLEAR, undoListener);
	
	// Overrides cell editor to update action states
	var cellEditorStartEditing = this.editor.graph.cellEditor.startEditing;
	
	this.editor.graph.cellEditor.startEditing = function()
	{
		cellEditorStartEditing.apply(this, arguments);
		undoListener();
	};
	
	var cellEditorStopEditing = this.editor.graph.cellEditor.stopEditing;
	
	this.editor.graph.cellEditor.stopEditing = function(cell, trigger)
	{
		cellEditorStopEditing.apply(this, arguments);
		undoListener();
	};
	
	// Updates the button states once
    undoListener();
};

/**
* Updates the states of the given toolbar items based on the selection.
*/
BpmUi.prototype.updateActionStates = function()
{
	var graph = this.editor.graph;
	var selected = !graph.isSelectionEmpty();
	var vertexSelected = false;
	var edgeSelected = false;

	var cells = graph.getSelectionCells();
	
	if (cells != null)
	{
    	for (var i = 0; i < cells.length; i++)
    	{
    		var cell = cells[i];
    		
    		if (graph.getModel().isEdge(cell))
    		{
    			edgeSelected = true;
    		}
    		
    		if (graph.getModel().isVertex(cell))
    		{
    			vertexSelected = true;
    		}
    		
    		if (edgeSelected && vertexSelected)
			{
				break;
			}
		}
	}
	
	// Updates action states
	var actions = ['cut', 'copy', 'bold', 'italic', 'underline', 'delete', 'duplicate',
	               'editStyle', 'editTooltip', 'editLink', 'backgroundColor', 'borderColor',
	               'edit', 'toFront', 'toBack', 'lockUnlock', 'solid', 'dashed', 'pasteSize',
	               'dotted', 'fillColor', 'gradientColor', 'shadow', 'fontColor',
	               'formattedText', 'rounded', 'toggleRounded', 'sharp', 'strokeColor'];
	
	for (var i = 0; i < actions.length; i++)
	{
		this.actions.get(actions[i]).setEnabled(selected);
	}
	
	this.actions.get('setAsDefaultStyle').setEnabled(graph.getSelectionCount() == 1);
	this.actions.get('clearWaypoints').setEnabled(!graph.isSelectionEmpty());
	this.actions.get('copySize').setEnabled(graph.getSelectionCount() == 1);
	this.actions.get('turn').setEnabled(!graph.isSelectionEmpty());
	this.actions.get('curved').setEnabled(edgeSelected);
	this.actions.get('rotation').setEnabled(vertexSelected);
	this.actions.get('wordWrap').setEnabled(vertexSelected);
	this.actions.get('autosize').setEnabled(vertexSelected);
   	var oneVertexSelected = vertexSelected && graph.getSelectionCount() == 1;
	this.actions.get('group').setEnabled(graph.getSelectionCount() > 1 ||
		(oneVertexSelected && !graph.isContainer(graph.getSelectionCell())));
	this.actions.get('ungroup').setEnabled(graph.getSelectionCount() == 1 &&
		(graph.getModel().getChildCount(graph.getSelectionCell()) > 0 ||
		(oneVertexSelected && graph.isContainer(graph.getSelectionCell()))));
   	this.actions.get('removeFromGroup').setEnabled(oneVertexSelected &&
   		graph.getModel().isVertex(graph.getModel().getParent(graph.getSelectionCell())));

	// Updates menu states
   	var state = graph.view.getState(graph.getSelectionCell());
    this.menus.get('navigation').setEnabled(selected || graph.view.currentRoot != null);
    this.actions.get('collapsible').setEnabled(vertexSelected &&
    	(graph.isContainer(graph.getSelectionCell()) || graph.model.getChildCount(graph.getSelectionCell()) > 0));
    this.actions.get('home').setEnabled(graph.view.currentRoot != null);
    this.actions.get('exitGroup').setEnabled(graph.view.currentRoot != null);
    this.actions.get('enterGroup').setEnabled(graph.getSelectionCount() == 1 && graph.isValidRoot(graph.getSelectionCell()));
    var foldable = graph.getSelectionCount() == 1 && graph.isCellFoldable(graph.getSelectionCell());
    this.actions.get('expand').setEnabled(foldable);
    this.actions.get('collapse').setEnabled(foldable);
    this.actions.get('editLink').setEnabled(graph.getSelectionCount() == 1);
    this.actions.get('openLink').setEnabled(graph.getSelectionCount() == 1 &&
    	graph.getLinkForCell(graph.getSelectionCell()) != null);
    this.actions.get('guides').setEnabled(graph.isEnabled());
    this.actions.get('grid').setEnabled(!this.editor.chromeless || this.editor.editable);

    var unlocked = graph.isEnabled() && !graph.isCellLocked(graph.getDefaultParent());
    this.menus.get('layout').setEnabled(unlocked);
    this.menus.get('insert').setEnabled(unlocked);
    this.menus.get('direction').setEnabled(unlocked && vertexSelected);
    this.menus.get('align').setEnabled(unlocked && vertexSelected && graph.getSelectionCount() > 1);
    this.menus.get('distribute').setEnabled(unlocked && vertexSelected && graph.getSelectionCount() > 1);
    this.actions.get('selectVertices').setEnabled(unlocked);
    this.actions.get('selectEdges').setEnabled(unlocked);
    this.actions.get('selectAll').setEnabled(unlocked);
    this.actions.get('selectNone').setEnabled(unlocked);
    
    this.updatePasteActionStates();
};

/**
 * Refreshes the viewport.
 */
BpmUi.prototype.refresh = function(sizeDidChange)
{
	sizeDidChange = (sizeDidChange != null) ? sizeDidChange : true;
	
	var quirks = bpmCore.IS_IE && (document.documentMode == null || document.documentMode == 5);
	var w = this.container.clientWidth;
	var h = this.container.clientHeight;

	if (this.container == document.body)
	{
		w = document.body.clientWidth || document.documentElement.clientWidth;
		h = (quirks) ? document.body.clientHeight || document.documentElement.clientHeight : document.documentElement.clientHeight;
	}
	
	// Workaround for bug on iOS see
	// http://stackoverflow.com/questions/19012135/ios-7-ipad-safari-landscape-innerheight-outerheight-layout-issue
	// FIXME: Fix if footer visible
	var off = 0;
	
	if (bpmCore.IS_IOS && !window.navigator.standalone)
	{
		if (window.innerHeight != document.documentElement.clientHeight)
		{
			off = document.documentElement.clientHeight - window.innerHeight;
			window.scrollTo(0, 0);
		}
	}
	
	var effHsplitPosition = Math.max(0, Math.min(this.hsplitPosition, w - this.splitSize - 20));
	var tmp = 0;
	
	if (this.menubar != null)
	{
		this.menubarContainer.style.height = this.menubarHeight + 'px';
		tmp += this.menubarHeight;
	}
	
	if (this.toolbar != null)
	{
		// this.toolbarContainer.style.top = this.menubarHeight + 'px';
		// this.toolbarContainer.style.height = this.toolbarHeight + 'px';
		// tmp += this.toolbarHeight; ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	}
	
	if (tmp > 0 && !bpmCore.IS_QUIRKS)
	{
		tmp += 1;
	}
	
	var sidebarFooterHeight = 0;
	
	if (this.sidebarFooterContainer != null)
	{
		var bottom = this.footerHeight + off;
		sidebarFooterHeight = Math.max(0, Math.min(h - tmp - bottom, this.sidebarFooterHeight));
		this.sidebarFooterContainer.style.width = effHsplitPosition + 'px';
		this.sidebarFooterContainer.style.height = sidebarFooterHeight + 'px';
		this.sidebarFooterContainer.style.bottom = bottom + 'px';
	}
	
	var fw = (this.format != null) ? this.formatWidth : 0;   ////////////////////////////////////////////////////////////////////////////////////////////////////
	//var fw = 0;
	this.sidebarContainer.style.top = tmp + 'px';
	this.sidebarContainer.style.width = effHsplitPosition + 'px';
	this.formatContainer.style.top = tmp + 'px';
	this.formatContainer.style.width = fw + 'px';


	this.formatContainer.style.display = (this.format != null) ? '' : 'none';//////////////////////////////////////////////////////////////////////////////////////////////////
	//this.formatContainer.style.display = 'none';

	
	this.diagramContainer.style.left = (this.hsplit.parentNode != null) ? (effHsplitPosition + this.splitSize) + 'px' : '0px';
	this.diagramContainer.style.top = this.sidebarContainer.style.top;
	this.footerContainer.style.height = this.footerHeight + 'px';
	this.hsplit.style.top = this.sidebarContainer.style.top;
	this.hsplit.style.bottom = (this.footerHeight + off) + 'px';
	this.hsplit.style.left = effHsplitPosition + 'px';
	this.footerContainer.style.display = (this.footerHeight == 0) ? 'none' : '';
	
	if (this.tabContainer != null)
	{
		this.tabContainer.style.left = this.diagramContainer.style.left;
	}
	
	if (quirks)
	{
		this.menubarContainer.style.width = w + 'px';
		this.toolbarContainer.style.width = this.menubarContainer.style.width;
		var sidebarHeight = Math.max(0, h - this.footerHeight - this.menubarHeight - this.toolbarHeight);
		this.sidebarContainer.style.height = (sidebarHeight - sidebarFooterHeight) + 'px';
		this.formatContainer.style.height = sidebarHeight + 'px';
		this.diagramContainer.style.width = (this.hsplit.parentNode != null) ? Math.max(0, w - effHsplitPosition - this.splitSize - fw) + 'px' : w + 'px';
		this.footerContainer.style.width = this.menubarContainer.style.width;
		var diagramHeight = Math.max(0, h - this.footerHeight - this.menubarHeight - this.toolbarHeight);
		
		if (this.tabContainer != null)
		{
			this.tabContainer.style.width = this.diagramContainer.style.width;
			this.tabContainer.style.bottom = (this.footerHeight + off) + 'px';
			diagramHeight -= this.tabContainer.clientHeight;
		}
		
		this.diagramContainer.style.height = diagramHeight + 'px';
		this.hsplit.style.height = diagramHeight + 'px';
	}
	else
	{
		if (this.footerHeight > 0)
		{
			this.footerContainer.style.bottom = off + 'px';
		}
		
		this.diagramContainer.style.right = fw + 'px';
		var th = 0;
		
		if (this.tabContainer != null)
		{
			this.tabContainer.style.bottom = (this.footerHeight + off) + 'px';
			this.tabContainer.style.right = this.diagramContainer.style.right;
			th = this.tabContainer.clientHeight;
		}
		
		this.sidebarContainer.style.bottom = (this.footerHeight + sidebarFooterHeight + off) + 'px';
		this.formatContainer.style.bottom = (this.footerHeight + off) + 'px';
		this.diagramContainer.style.bottom = (this.footerHeight + off + th) + 'px';
	}
	
	if (sizeDidChange)
	{
		this.editor.graph.sizeDidChange();
	}
};

/**
 * Creates the required containers.
 */
BpmUi.prototype.createTabContainer = function()
{
	return null;
};

/**
 * Creates the required containers.
 */
BpmUi.prototype.createDivs = function()
{
	this.menubarContainer = this.createDiv('mainMenubarContainer');
	this.toolbarContainer = this.createDiv('mainToolbarContainer');
	this.sidebarContainer = this.createDiv('mainSidebarContainer');
	this.formatContainer = this.createDiv('mainSidebarContainer mainBpmSchemeContainer');
	this.formatModelContainer = this.createDiv('mainBpmSchemeModelContainer');
	this.diagramContainer = this.createDiv('mainDiagramContainer');
	this.footerContainer = this.createDiv('mainFooterContainer');
	this.hsplit = this.createDiv('pageSplit');
	// this.hsplit.setAttribute('title', bpmResources.get('collapseExpand'));

	// Sets static style for containers
	this.menubarContainer.style.top = '0px';
	this.menubarContainer.style.left = '0px';
	this.menubarContainer.style.right = '0px';
	this.menubarContainer.style.borderBottom = '1px solid #ddd';


	this.toolbarContainer.style.left = '0px';
	this.toolbarContainer.style.right = '0px';

	this.toolbarContainer.style.display = 'none'; ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	this.sidebarContainer.style.left = '5px';
	this.formatContainer.style.right = '0px';
	this.formatContainer.style.zIndex = '1';


	//this.formatContainer.style.display = 'none';

	this.diagramContainer.style.right = ((this.format != null) ? this.formatWidth : 0) + 'px';
	this.footerContainer.style.left = '0px';
	this.footerContainer.style.right = '0px';
	this.footerContainer.style.bottom = '0px';
	this.footerContainer.style.zIndex = bpmPopupMenu.prototype.zIndex - 2;
	this.hsplit.style.width = this.splitSize + 'px';
	this.sidebarFooterContainer = this.createSidebarFooterContainer();
	
	if (this.sidebarFooterContainer)
	{
		this.sidebarFooterContainer.style.left = '0px';
	}
	
	if (!this.editor.chromeless)
	{
		this.tabContainer = this.createTabContainer();
	}
	else
	{
		this.diagramContainer.style.border = 'none';
	}
};

/**
 * Hook for sidebar footer container. This implementation returns null.
 */
BpmUi.prototype.createSidebarFooterContainer = function()
{
	return null;
};

/**
 * Creates the required containers.
 */
BpmUi.prototype.createUi = function()
{
	// Creates menubar
	this.menubar = (this.editor.chromeless) ? null : this.menus.createMenubar(this.createDiv('mainMenubar'));
	
	if (this.menubar != null)
	{
		this.menubarContainer.appendChild(this.menubar.container);
	}
	
	// Adds status bar in menubar
	if (this.menubar != null)
	{
		this.statusContainer = this.createStatusContainer();
	
		// Connects the status bar to the editor status
		this.editor.addListener('statusChanged', bpmUtils.bind(this, function()
		{
			this.setStatusText(this.editor.getStatus());
		}));
	
		this.setStatusText(this.editor.getStatus());
		this.menubar.container.appendChild(this.statusContainer);
		
		// Inserts into DOM
		this.container.appendChild(this.menubarContainer);
	}

	// Creates the sidebar
	this.sidebar = (this.editor.chromeless) ? null : this.createSidebar(this.sidebarContainer);
	
	if (this.sidebar != null)
	{
		this.container.appendChild(this.sidebarContainer);
	}
	
	// Creates the format sidebar
	this.format = (this.editor.chromeless || !this.formatEnabled) ? null : this.createBpmScheme(this.formatContainer);
	
	if (this.format != null)
	{
		this.container.appendChild(this.formatContainer);
	}
	
	// Creates the footer
	var footer = (this.editor.chromeless) ? null : this.createFooter();
	
	if (footer != null)
	{
		this.footerContainer.appendChild(footer);
		this.container.appendChild(this.footerContainer);
	}

	if (this.sidebar != null && this.sidebarFooterContainer)
	{
		this.container.appendChild(this.sidebarFooterContainer);		
	}

	this.container.appendChild(this.diagramContainer);

	if (this.container != null && this.tabContainer != null)
	{
		this.container.appendChild(this.tabContainer);
	}

	// Creates toolbar
	this.toolbar = (this.editor.chromeless) ? null : this.createToolbar(this.createDiv('mainToolbar'));
	
	if (this.toolbar != null)
	{
		this.toolbarContainer.appendChild(this.toolbar.container);
		this.container.appendChild(this.toolbarContainer);
	}

	// HSplit
	if (this.sidebar != null)
	{
		this.container.appendChild(this.hsplit);
		
		this.addSplitHandler(this.hsplit, true, 0, bpmUtils.bind(this, function(value)
		{
			this.hsplitPosition = value;
			this.refresh();
		}));
	}
};

/**
 * Creates a new toolbar for the given container.
 */
BpmUi.prototype.createStatusContainer = function()
{
	var container = document.createElement('a');
	container.className = 'elementItem geStatus';
	
	if (screen.width < 420)
	{
		container.style.maxWidth = Math.max(20, screen.width - 320) + 'px';
		container.style.overflow = 'hidden';
	}
	
	return container;
};

/**
 * Creates a new toolbar for the given container.
 */
BpmUi.prototype.setStatusText = function(value)
{
	this.statusContainer.innerHTML = value;
};

/**
 * Creates a new toolbar for the given container.
 */
BpmUi.prototype.createToolbar = function(container)
{
	return new Toolbar(this, container);
};

/**
 * Creates a new sidebar for the given container.
 */
BpmUi.prototype.createSidebar = function(container)
{
	return new Sidebar(this, container);
};

/**
 * Creates a new sidebar for the given container.
 */
BpmUi.prototype.createBpmScheme = function(container)
{
	return new BpmScheme(this, container);
};

/**
 * Creates and returns a new footer.
 */
BpmUi.prototype.createFooter = function()
{
	return this.createDiv('geFooter');
};

/**
 * Creates the actual toolbar for the toolbar container.
 */
BpmUi.prototype.createDiv = function(classname)
{
	var elt = document.createElement('div');
	elt.className = classname;
	
	return elt;
};

/**
 * Updates the states of the given undo/redo items.
 */
BpmUi.prototype.addSplitHandler = function(elt, horizontal, dx, onChange)
{
	var start = null;
	var initial = null;
	var ignoreClick = true;
	var last = null;

	// Disables built-in pan and zoom in IE10 and later
	if (bpmCore.IS_POINTER)
	{
		elt.style.touchAction = 'none';
	}
	
	var getValue = bpmUtils.bind(this, function()
	{
		var result = parseInt(((horizontal) ? elt.style.left : elt.style.bottom));
	
		// Takes into account hidden footer
		if (!horizontal)
		{
			result = result + dx - this.footerHeight;
		}
		
		return result;
	});

	function moveHandler(evt)
	{
		if (start != null)
		{
			var pt = new bpmPoint(bpmEvent.getClientX(evt), bpmEvent.getClientY(evt));
			onChange(Math.max(0, initial + ((horizontal) ? (pt.x - start.x) : (start.y - pt.y)) - dx));
			bpmEvent.consume(evt);
			
			if (initial != getValue())
			{
				ignoreClick = true;
				last = null;
			}
		}
	};
	
	function dropHandler(evt)
	{
		moveHandler(evt);
		initial = null;
		start = null;
	};
	
	// bpmEvent.addGestureListeners(elt, function(evt)
	// {
	// 	start = new bpmPoint(bpmEvent.getClientX(evt), bpmEvent.getClientY(evt));
	// 	initial = getValue();
	// 	ignoreClick = false;
	// 	bpmEvent.consume(evt);
	// });
	
	// bpmEvent.addListener(elt, 'click', bpmUtils.bind(this, function(evt)
	// {
	// 	if (!ignoreClick && this.hsplitClickEnabled)
	// 	{
	// 		var next = (last != null) ? last - dx : 0;
	// 		last = getValue();
	// 		onChange(next);
	// 		bpmEvent.consume(evt);
	// 	}
	// }));

	// bpmEvent.addGestureListeners(document, null, moveHandler, dropHandler);
	
	// this.destroyFunctions.push(function()
	// {
	// 	bpmEvent.removeGestureListeners(document, null, moveHandler, dropHandler);
	// });	
};

/**
 * Translates this point by the given vector.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
BpmUi.prototype.handleError = function(resp, title, fn, invokeFnOnClose, notFoundMessage)
{
	var e = (resp != null && resp.error != null) ? resp.error : resp;

	if (e != null || title != null)
	{
		var msg = bpmUtils.htmlEntities(bpmResources.get('unknownError'));
		var btn = bpmResources.get('ok');
		title = (title != null) ? title : bpmResources.get('error');
		
		if (e != null && e.message != null)
		{
			msg = bpmUtils.htmlEntities(e.message);
		}

		this.showError(title, msg, btn, fn, null, null, null, null, null,
			null, null, null, (invokeFnOnClose) ? fn : null);
	}
	else if (fn != null)
	{
		fn();
	}
};

/**
 * Translates this point by the given vector.
 * 
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
BpmUi.prototype.showError = function(title, msg, btn, fn, retry, btn2, fn2, btn3, fn3, w, h, hide, onClose)
{
	var dlg = new ErrorBpmModal(this, title, msg, btn || bpmResources.get('ok'),
		fn, retry, btn2, fn2, hide, btn3, fn3);
	var lines = Math.ceil((msg != null) ? msg.length / 50 : 1);
	this.showBpmModal(dlg.container, w || 340, h || (100 + lines * 20), true, false, onClose);
	dlg.init();
};

/**
 * Displays a print dialog.
 */
BpmUi.prototype.showBpmModal = function(elt, w, h, modal, closable, onClose, noScroll, transparent, onResize, ignoreBgClick)
{
	this.editor.graph.tooltipHandler.hideTooltip();
	
	if (this.dialogs == null)
	{
		this.dialogs = [];
	}
	
	this.dialog = new BpmModal(this, elt, w, h, modal, closable, onClose, noScroll, transparent, onResize, ignoreBgClick);
	this.dialogs.push(this.dialog);
};

/**
 * Displays a print dialog.
 */
BpmUi.prototype.hideBpmModal = function(cancel, isEsc)
{
	if (this.dialogs != null && this.dialogs.length > 0)
	{
		var dlg = this.dialogs.pop();
		
		if (dlg.close(cancel, isEsc) == false) 
		{
			//add the dialog back if dialog closing is cancelled
			this.dialogs.push(dlg);
			return;
		}
		
		this.dialog = (this.dialogs.length > 0) ? this.dialogs[this.dialogs.length - 1] : null;
		this.editor.fireEvent(new bpmEventObject('hideBpmModal'));
		
		if (this.dialog == null && this.editor.graph.container.style.visibility != 'hidden')
		{
			window.setTimeout(bpmUtils.bind(this, function()
			{
				if (this.editor.graph.isEditing() && this.editor.graph.cellEditor.textarea != null)
				{
					this.editor.graph.cellEditor.textarea.focus();
				}
				else
				{
					bpmUtils.clearSelection();
					this.editor.graph.container.focus();
				}
			}), 0);
		}
	}
};

/**
 * Display a color dialog.
 */
BpmUi.prototype.pickColor = function(color, apply)
{
	var graph = this.editor.graph;
	var selState = graph.cellEditor.saveSelection();
	var h = 226 + ((Math.ceil(ColorBpmModal.prototype.presetColors.length / 12) +
		Math.ceil(ColorBpmModal.prototype.defaultColors.length / 12)) * 17);
	
	var dlg = new ColorBpmModal(this, color || 'none', function(color)
	{
		graph.cellEditor.restoreSelection(selState);
		apply(color);
	}, function()
	{
		graph.cellEditor.restoreSelection(selState);
	});
	this.showBpmModal(dlg.container, 230, h, true, false);
	dlg.init();
};

/**
 * Adds the label menu items to the given menu and parent.
 */
BpmUi.prototype.openFile = function()
{
	// Closes dialog after open
	window.openNew = true;
	window.openFile = new OpenFile(bpmUtils.bind(this, function(cancel)
	{
		this.hideBpmModal(cancel);
	}));

	// Removes openFile if dialog is closed
	this.showBpmModal(new OpenBpmModal(this).container, (BpmDraw.useLocalStorage) ? 640 : 320,
			(BpmDraw.useLocalStorage) ? 480 : 220, true, true, function()
	{
		window.openFile = null;
	});
};

/**
 * Extracs the graph model from the given HTML data from a data transfer event.
 */
BpmUi.prototype.extractGraphModelFromHtml = function(data)
{
	var result = null;
	
	try
	{
    	var idx = data.indexOf('&lt;bpmGraphModel ');
    	
    	if (idx >= 0)
    	{
    		var idx2 = data.lastIndexOf('&lt;/bpmGraphModel&gt;');
    		
    		if (idx2 > idx)
    		{
    			result = data.substring(idx, idx2 + 21).replace(/&gt;/g, '>').
    				replace(/&lt;/g, '<').replace(/\\&quot;/g, '"').replace(/\n/g, '');
    		}
    	}
	}
	catch (e)
	{
		// ignore
	}
	
	return result;
};

/**
 * Opens the given files in the editor.
 */
BpmUi.prototype.extractGraphModelFromEvent = function(evt)
{
	var result = null;
	var data = null;
	
	if (evt != null)
	{
		var provider = (evt.dataTransfer != null) ? evt.dataTransfer : evt.clipboardData;
		
		if (provider != null)
		{
			if (document.documentMode == 10 || document.documentMode == 11)
			{
				data = provider.getData('Text');
			}
			else
			{
				data = (bpmUtils.indexOf(provider.types, 'text/html') >= 0) ? provider.getData('text/html') : null;
			
				if (bpmUtils.indexOf(provider.types, 'text/plain' && (data == null || data.length == 0)))
				{
					data = provider.getData('text/plain');
				}
			}

			if (data != null)
			{
				data = Draw.zapGremlins(bpmUtils.trim(data));
				
				// Tries parsing as HTML document with embedded XML
				var xml =  this.extractGraphModelFromHtml(data);
				
				if (xml != null)
				{
					data = xml;
				}
			}		
		}
	}
	
	if (data != null && this.isCompatibleString(data))
	{
		result = data;
	}
	
	return result;
};

/**
 * Hook for subclassers to return true if event data is a supported format.
 * This implementation always returns false.
 */
BpmUi.prototype.isCompatibleString = function(data)
{
	return false;
};

/**
 * Adds the label menu items to the given menu and parent.
 */
BpmUi.prototype.saveFile = function(forceBpmModal)
{
	if (!forceBpmModal && this.editor.filename != null)
	{
		this.save(this.editor.getOrCreateFilename());
	}
	else
	{
		var dlg = new FilenameBpmModal(this, this.editor.getOrCreateFilename(), bpmResources.get('save'), bpmUtils.bind(this, function(name)
		{
			this.save(name);
		}), null, bpmUtils.bind(this, function(name)
		{
			if (name != null && name.length > 0)
			{
				return true;
			}
			
			bpmUtils.confirm(bpmResources.get('invalidName'));
			
			return false;
		}));
		this.showBpmModal(dlg.container, 300, 100, true, true);
		dlg.init();
	}
};

/**
 * Saves the current graph under the given filename.
 */
BpmUi.prototype.save = function(name)
{
	if (name != null)
	{
		if (this.editor.graph.isEditing())
		{
			this.editor.graph.stopEditing();
		}
		var xml = bpmUtils.getXml(this.editor.getGraphXml());
		try
		{
			if (BpmDraw.useLocalStorage)
			{
				// console.log(localStorage);
				if (localStorage.getItem(name) != null &&
					!bpmUtils.confirm(bpmResources.get('replaceIt', [name])))
				{
					return;
				}
				localStorage.setItem(name, xml);
				this.editor.setStatus(bpmUtils.htmlEntities(bpmResources.get('saved')) + ' ' + new Date());
			}
			else
			{
				if (xml.length < MAX_REQUEST_SIZE)
				{
					new bpmXmlRequest(SAVE_URL, 'filename=' + encodeURIComponent(name) +
						'&xml=' + encodeURIComponent(xml)).simulate(document, '_blank');
				}
				else
				{
					bpmUtils.alert(bpmResources.get('drawingTooLarge'));
					bpmUtils.popup(xml);
					
					return;
				}
			}

			var self = this;
			this.workfiles[name] = xml;
			this.menus.addworkfile(name);
			this.actions.addAction(name, function() {
				window.openNew = false;
				window.openKey = 'open';				
				try
				{
					var xml = self.workfiles[name];
					var doc = bpmUtils.parseXml(xml); 
					self.editor.setGraphXml(doc.documentElement);
					self.editor.setModified(false);
					self.editor.undoManager.clear();
					
					if (name != null)
					{
						self.editor.setFilename(name);
						self.updateDocumentTitle();
					}
					
					return;
				}
				catch (e)
				{
					bpmUtils.alert(bpmResources.get('invalidOrMissingFile') + ': ' + e.message);
				}
			});			
			this.editor.setModified(false);
			this.editor.setFilename(name);
			this.updateDocumentTitle();
		    // Installs context menu
		}
		catch (e)
		{
			this.editor.setStatus(bpmUtils.htmlEntities(bpmResources.get('errorSavingFile')));
		}
	}
};

/**
 * Executes the given layout.
 */
BpmUi.prototype.executeLayout = function(exec, animate, post)
{
	var graph = this.editor.graph;

	if (graph.isEnabled())
	{
		graph.getModel().beginUpdate();
		try
		{
			exec();
		}
		catch (e)
		{
			throw e;
		}
		finally
		{
			// Animates the changes in the graph model except
			// for Camino, where animation is too slow
			if (this.allowAnimation && animate && navigator.userAgent.indexOf('Camino') < 0)
			{
				// New API for animating graph layout results asynchronously
				var morph = new bpmMorphing(graph);
				morph.addListener(bpmEvent.DONE, bpmUtils.bind(this, function()
				{
					graph.getModel().endUpdate();
					
					if (post != null)
					{
						post();
					}
				}));
				
				morph.startAnimation();
			}
			else
			{
				graph.getModel().endUpdate();
				
				if (post != null)
				{
					post();
				}
			}
		}
	}
};

/**
 * Hides the current menu.
 */
BpmUi.prototype.showImageBpmModal = function(title, value, fn, ignoreExisting)
{
	var cellEditor = this.editor.graph.cellEditor;
	var selState = cellEditor.saveSelection();
	var newValue = bpmUtils.prompt(title, value);
	cellEditor.restoreSelection(selState);
	
	if (newValue != null && newValue.length > 0)
	{
		var img = new Image();
		
		img.onload = function()
		{
			fn(newValue, img.width, img.height);
		};
		img.onerror = function()
		{
			fn(null);
			bpmUtils.alert(bpmResources.get('fileNotFound'));
		};
		
		img.src = newValue;
	}
	else
	{
		fn(null);
	}
};

/**
 * Hides the current menu.
 */
BpmUi.prototype.showLinkBpmModal = function(value, btnLabel, fn)
{
	var dlg = new LinkBpmModal(this, value, btnLabel, fn);
	this.showBpmModal(dlg.container, 420, 90, true, true);
	dlg.init();
};

/**
 * Hides the current menu.
 */
BpmUi.prototype.showPropBpmModal = function(cell)
{
	if (cell != null)
	{
		var dlg = new EditPropBpmModal(this, cell);
		this.formatModelContainer.style.width = '460px';
		// this.formatModelContainer.style.height = '360px';  
		this.formatModelContainer.style.top = '10px';
		this.formatModelContainer.style.zIndex = '1';

		var format = this.createBpmScheme(this.formatModelContainer);
		if (format != null)
		{
			dlg.container.appendChild(this.formatModelContainer);
			format.init();
		}
		this.showBpmModal(dlg.container, 480, 480, true, true);
		dlg.init();
	}
};

/**
 * Hides the current menu.
 */
BpmUi.prototype.showDataBpmModal = function(cell)
{
	if (cell != null)
	{
		var dlg = new EditDataBpmModal(this, cell);
		this.showBpmModal(dlg.container, 480, 420, true, false, null, false);
		dlg.init();
	}
};

/**
 * Hides the current menu.
 */
BpmUi.prototype.showValueBpmModal = function(cell)
{
	if (cell != null)
	{
		var dlg = new EditValueBpmModal(this, cell);
		this.showBpmModal(dlg.container, 680, 420, true, false, null, false);
		dlg.init();
	}
};

/**
 * Hides the current menu.
 */
BpmUi.prototype.showBackgroundImageBpmModal = function(apply)
{
	apply = (apply != null) ? apply : bpmUtils.bind(this, function(image)
	{
		var change = new ChangePageSetup(this, null, image);
		change.ignoreColor = true;
		
		this.editor.graph.model.execute(change);
	});
	
	var newValue = bpmUtils.prompt(bpmResources.get('backgroundImage'), '');
	
	if (newValue != null && newValue.length > 0)
	{
		var img = new Image();
		
		img.onload = function()
		{
			apply(new bpmImage(newValue, img.width, img.height));
		};
		img.onerror = function()
		{
			apply(null);
			bpmUtils.alert(bpmResources.get('fileNotFound'));
		};
		
		img.src = newValue;
	}
	else
	{
		apply(null);
	}
};

/**
 * Loads the stylesheet for this graph.
 */
BpmUi.prototype.setBackgroundImage = function(image)
{
	this.editor.graph.setBackgroundImage(image);
	this.editor.graph.view.validateBackgroundImage();

	this.fireEvent(new bpmEventObject('backgroundImageChanged'));
};

/**
 * Creates the keyboard event handler for the current graph and history.
 */
BpmUi.prototype.confirm = function(msg, okFn, cancelFn)
{
	if (bpmUtils.confirm(msg))
	{
		if (okFn != null)
		{
			okFn();
		}
	}
	else if (cancelFn != null)
	{
		cancelFn();
	}
};

/**
 * Creates the keyboard event handler for the current graph and history.
 */
BpmUi.prototype.createOutline = function(wnd)
{
	var outline = new bpmOutline(this.editor.graph);
	outline.border = 20;

	bpmEvent.addListener(window, 'resize', function()
	{
		outline.update();
	});
	
	this.addListener('pageBpmSchemeChanged', function()
	{
		outline.update();
	});

	return outline;
};

// Alt+Shift+Keycode mapping to action
BpmUi.prototype.altShiftActions = {67: 'clearWaypoints', // Alt+Shift+C
  65: 'connectionArrows', // Alt+Shift+A
  76: 'editLink', // Alt+Shift+L
  80: 'connectionPoints', // Alt+Shift+P
  84: 'editTooltip', // Alt+Shift+T
  86: 'pasteSize', // Alt+Shift+V
  88: 'copySize' // Alt+Shift+X
};

/**
 * Creates the keyboard event handler for the current graph and history.
 */
BpmUi.prototype.createKeyHandler = function(editor)
{
	var editorUi = this;
	var graph = this.editor.graph;
	var keyHandler = new bpmKeyHandler(graph);

	var isEventIgnored = keyHandler.isEventIgnored;
	keyHandler.isEventIgnored = function(evt)
	{
		// Handles undo/redo/ctrl+./,/u via action and allows ctrl+b/i only if editing value is HTML (except for FF and Safari)
		return (!this.isControlDown(evt) || bpmEvent.isShiftDown(evt) || (evt.keyCode != 90 && evt.keyCode != 89 &&
			evt.keyCode != 188 && evt.keyCode != 190 && evt.keyCode != 85)) && ((evt.keyCode != 66 && evt.keyCode != 73) ||
			!this.isControlDown(evt) || (this.graph.cellEditor.isContentEditing() && !bpmCore.IS_FF && !bpmCore.IS_SF)) &&
			isEventIgnored.apply(this, arguments);
	};
	
	// Ignores graph enabled state but not chromeless state
	keyHandler.isEnabledForEvent = function(evt)
	{
		return (!bpmEvent.isConsumed(evt) && this.isGraphEvent(evt) && this.isEnabled() &&
			(editorUi.dialogs == null || editorUi.dialogs.length == 0));
	};
	
	// Routes command-key to control-key on Mac
	keyHandler.isControlDown = function(evt)
	{
		return bpmEvent.isControlDown(evt) || (bpmCore.IS_MAC && evt.metaKey);
	};

	var queue = [];
	var thread = null;
	
	// Helper function to move cells with the cursor keys
	function nudge(keyCode, stepSize, resize)
	{
		queue.push(function()
		{
			if (!graph.isSelectionEmpty() && graph.isEnabled())
			{
				stepSize = (stepSize != null) ? stepSize : 1;
	
				if (resize)
				{
					// Resizes all selected vertices
					graph.getModel().beginUpdate();
					try
					{
						var cells = graph.getSelectionCells();
						
						for (var i = 0; i < cells.length; i++)
						{
							if (graph.getModel().isVertex(cells[i]) && graph.isCellResizable(cells[i]))
							{
								var geo = graph.getCellGeometry(cells[i]);
								
								if (geo != null)
								{
									geo = geo.clone();
									
									if (keyCode == 37)
									{
										geo.width = Math.max(0, geo.width - stepSize);
									}
									else if (keyCode == 38)
									{
										geo.height = Math.max(0, geo.height - stepSize);
									}
									else if (keyCode == 39)
									{
										geo.width += stepSize;
									}
									else if (keyCode == 40)
									{
										geo.height += stepSize;
									}
									
									graph.getModel().setGeometry(cells[i], geo);
								}
							}
						}
					}
					finally
					{
						graph.getModel().endUpdate();
					}
				}
				else
				{
					// Moves vertices up/down in a stack layout
					var cell = graph.getSelectionCell();
					var parent = graph.model.getParent(cell);
					var layout = null;
	
					if (graph.getSelectionCount() == 1 && graph.model.isVertex(cell) &&
						graph.layoutManager != null && !graph.isCellLocked(cell))
					{
						layout = graph.layoutManager.getLayout(parent);
					}
					
					if (layout != null && layout.constructor == bpmStackLayout)
					{
						var index = parent.getIndex(cell);
						
						if (keyCode == 37 || keyCode == 38)
						{
							graph.model.add(parent, cell, Math.max(0, index - 1));
						}
						else if (keyCode == 39 ||keyCode == 40)
						{
							graph.model.add(parent, cell, Math.min(graph.model.getChildCount(parent), index + 1));
						}
					}
					else
					{
						var dx = 0;
						var dy = 0;
						
						if (keyCode == 37)
						{
							dx = -stepSize;
						}
						else if (keyCode == 38)
						{
							dy = -stepSize;
						}
						else if (keyCode == 39)
						{
							dx = stepSize;
						}
						else if (keyCode == 40)
						{
							dy = stepSize;
						}
						
						graph.moveCells(graph.getMovableCells(graph.getSelectionCells()), dx, dy);
					}				
				}
			}
		});
		
		if (thread != null)
		{
			window.clearTimeout(thread);
		}
		
		thread = window.setTimeout(function()
		{
			if (queue.length > 0)
			{
				graph.getModel().beginUpdate();
				try
				{
					for (var i = 0; i < queue.length; i++)
					{
						queue[i]();
					}
					
					queue = [];
				}
				finally
				{
					graph.getModel().endUpdate();
				}
				graph.scrollCellToVisible(graph.getSelectionCell());
			}
		}, 200);
	};
	
	// Overridden to handle special alt+shift+cursor keyboard shortcuts
	var directions = {37: bpmConstants.DIRECTION_WEST, 38: bpmConstants.DIRECTION_NORTH,
			39: bpmConstants.DIRECTION_EAST, 40: bpmConstants.DIRECTION_SOUTH};
	
	var keyHandlerGetFunction = keyHandler.getFunction;

	bpmKeyHandler.prototype.getFunction = function(evt)
	{
		if (graph.isEnabled())
		{
			// TODO: Add alt modified state in core API, here are some specific cases
			if (bpmEvent.isShiftDown(evt) && bpmEvent.isAltDown(evt))
			{
				var action = editorUi.actions.get(editorUi.altShiftActions[evt.keyCode]);

				if (action != null)
				{
					return action.funct;
				}
			}
			
			if (evt.keyCode == 9 && bpmEvent.isAltDown(evt))
			{
				if (bpmEvent.isShiftDown(evt))
				{
					// Alt+Shift+Tab
					return function()
					{
						graph.selectParentCell();
					};
				}
				else
				{
					// Alt+Tab
					return function()
					{
						graph.selectChildCell();
					};
				}
			}
			else if (directions[evt.keyCode] != null && !graph.isSelectionEmpty())
			{
				if (bpmEvent.isShiftDown(evt) && bpmEvent.isAltDown(evt))
				{
					if (graph.model.isVertex(graph.getSelectionCell()))
					{
						return function()
						{
							var cells = graph.connectVertex(graph.getSelectionCell(), directions[evt.keyCode],
								graph.defaultEdgeLength, evt, true);
			
							if (cells != null && cells.length > 0)
							{
								if (cells.length == 1 && graph.model.isEdge(cells[0]))
								{
									graph.setSelectionCell(graph.model.getTerminal(cells[0], false));
								}
								else
								{
									graph.setSelectionCell(cells[cells.length - 1]);
								}

								graph.scrollCellToVisible(graph.getSelectionCell());
								
								if (editorUi.hoverIcons != null)
								{
									editorUi.hoverIcons.update(graph.view.getState(graph.getSelectionCell()));
								}
							}
						};
					}
				}
				else
				{
					// Avoids consuming event if no vertex is selected by returning null below
					// Cursor keys move and resize (ctrl) cells
					if (this.isControlDown(evt))
					{
						return function()
						{
							nudge(evt.keyCode, (bpmEvent.isShiftDown(evt)) ? graph.gridSize : null, true);
						};
					}
					else
					{
						return function()
						{
							nudge(evt.keyCode, (bpmEvent.isShiftDown(evt)) ? graph.gridSize : null);
						};
					}
				}
			}
		}

		return keyHandlerGetFunction.apply(this, arguments);
	};

	// Binds keystrokes to actions
	keyHandler.bindAction = bpmUtils.bind(this, function(code, control, key, shift)
	{
		var action = this.actions.get(key);
		
		if (action != null)
		{
			var f = function()
			{
				if (action.isEnabled())
				{
					action.funct();
				}
			};
    		
			if (control)
			{
				if (shift)
				{
					keyHandler.bindControlShiftKey(code, f);
				}
				else
				{
					keyHandler.bindControlKey(code, f);
				}
			}
			else
			{
				if (shift)
				{
					keyHandler.bindShiftKey(code, f);
				}
				else
				{
					keyHandler.bindKey(code, f);
				}
			}
		}
	});

	var ui = this;
	var keyHandlerEscape = keyHandler.escape;
	keyHandler.escape = function(evt)
	{
		keyHandlerEscape.apply(this, arguments);
	};

	// Ignores enter keystroke. Remove this line if you want the
	// enter keystroke to stop editing. N, W, T are reserved.
	keyHandler.enter = function() {};
	
	keyHandler.bindControlShiftKey(36, function() { graph.exitGroup(); }); // Ctrl+Shift+Home
	keyHandler.bindControlShiftKey(35, function() { graph.enterGroup(); }); // Ctrl+Shift+End
	keyHandler.bindKey(36, function() { graph.home(); }); // Home
	keyHandler.bindKey(35, function() { graph.refresh(); }); // End
	keyHandler.bindAction(107, true, 'zoomIn'); // Ctrl+Plus
	keyHandler.bindAction(109, true, 'zoomOut'); // Ctrl+Minus
	keyHandler.bindAction(80, true, 'print'); // Ctrl+P
	keyHandler.bindAction(79, true, 'outline', true); // Ctrl+Shift+O
	keyHandler.bindAction(112, false, 'about'); // F1

	if (!this.editor.chromeless || this.editor.editable)
	{
		keyHandler.bindAction(46, false, 'delete'); // Delete
		keyHandler.bindAction(90, true, 'undo'); // Ctrl+Z
	}
	
	if (!bpmCore.IS_WIN)
	{
		keyHandler.bindAction(90, true, 'redo', true); // Ctrl+Shift+Z
	}
	else
	{
		keyHandler.bindAction(89, true, 'redo'); // Ctrl+Y
	}
	
	return keyHandler;
};

/**
 * Creates the keyboard event handler for the current graph and history.
 */
BpmUi.prototype.destroy = function()
{
	if (this.editor != null)
	{
		this.editor.destroy();
		this.editor = null;
	}
	
	if (this.menubar != null)
	{
		this.menubar.destroy();
		this.menubar = null;
	}
	
	if (this.toolbar != null)
	{
		this.toolbar.destroy();
		this.toolbar = null;
	}
	
	if (this.sidebar != null)
	{
		this.sidebar.destroy();
		this.sidebar = null;
	}
	
	if (this.keyHandler != null)
	{
		this.keyHandler.destroy();
		this.keyHandler = null;
	}
	
	if (this.keydownHandler != null)
	{
		bpmEvent.removeListener(document, 'keydown', this.keydownHandler);
		this.keydownHandler = null;
	}
		
	if (this.keyupHandler != null)
	{
		bpmEvent.removeListener(document, 'keyup', this.keyupHandler);
		this.keyupHandler = null;
	}
	
	if (this.resizeHandler != null)
	{
		bpmEvent.removeListener(window, 'resize', this.resizeHandler);
		this.resizeHandler = null;
	}
	
	if (this.gestureHandler != null)
	{
		bpmEvent.removeGestureListeners(document, this.gestureHandler);
		this.gestureHandler = null;
	}
	
	if (this.orientationChangeHandler != null)
	{
		bpmEvent.removeListener(window, 'orientationchange', this.orientationChangeHandler);
		this.orientationChangeHandler = null;
	}
	
	if (this.scrollHandler != null)
	{
		bpmEvent.removeListener(window, 'scroll', this.scrollHandler);
		this.scrollHandler = null;
	}

	if (this.destroyFunctions != null)
	{
		for (var i = 0; i < this.destroyFunctions.length; i++)
		{
			this.destroyFunctions[i]();
		}
		
		this.destroyFunctions = null;
	}
	
	var c = [this.menubarContainer, this.toolbarContainer, this.sidebarContainer,
	         this.formatContainer, this.diagramContainer, this.footerContainer,
	         this.chromelessToolbar, this.hsplit, this.sidebarFooterContainer,
	         this.layersBpmModal];
	
	for (var i = 0; i < c.length; i++)
	{
		if (c[i] != null && c[i].parentNode != null)
		{
			c[i].parentNode.removeChild(c[i]);
		}
	}
};

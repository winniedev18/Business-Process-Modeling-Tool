
BpmScheme = function(editorUi, container)
{
	this.editorUi = editorUi;
	this.container = container;
};

/**
 * Returns information about the current selection.
 */
BpmScheme.prototype.labelIndex = 0;

/**
 * Returns information about the current selection.
 */
BpmScheme.prototype.currentIndex = 0;

/**
 * Returns information about the current selection.
 */
BpmScheme.prototype.showCloseButton = true;

/**
 * Background color for inactive tabs.
 */
BpmScheme.prototype.inactiveTabBackgroundColor = '#f1f3f4';

/**
 * Background color for inactive tabs.
 */
BpmScheme.prototype.roundableShapes = ['label', 'rectangle', 'internalStorage', 'corner',
	'parallelogram', 'swimlane', 'triangle', 'trapezoid',
	'ext', 'step', 'tee', 'process', 'link',
	'rhombus', 'offPageConnector', 'loopLimit', 'hexagon',
	'manualInput', 'curlyBracket', 'singleArrow', 'callout',
	'doubleArrow', 'flexArrow', 'card', 'umlLifeline'];

/**
 * Adds the label menu items to the given menu and parent.
 */
BpmScheme.prototype.init = function()
{
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;
	
	this.update = bpmUtils.bind(this, function(sender, evt)
	{
		this.clearSelectionState();
		this.refresh();
	});
	
	graph.getSelectionModel().addListener(bpmEvent.CHANGE, this.update);
	graph.addListener(bpmEvent.EDITING_STARTED, this.update);
	graph.addListener(bpmEvent.EDITING_STOPPED, this.update);
	graph.getModel().addListener(bpmEvent.CHANGE, this.update);
	graph.addListener(bpmEvent.ROOT, bpmUtils.bind(this, function()
	{
		this.refresh();
	}));
	
	editor.addListener('autosaveChanged', bpmUtils.bind(this, function()
	{
		this.refresh();
	}));
	
	this.refresh();
};

/**
 * Returns information about the current selection.
 */
BpmScheme.prototype.clearSelectionState = function()
{
	this.selectionState = null;
};

/**
 * Returns information about the current selection.
 */
BpmScheme.prototype.getSelectionState = function()
{
	if (this.selectionState == null)
	{
		this.selectionState = this.createSelectionState();
	}
	
	return this.selectionState;
};

/**
 * Returns information about the current selection.
 */
BpmScheme.prototype.createSelectionState = function()
{
	var cells = this.editorUi.editor.graph.getSelectionCells();
	var result = this.initSelectionState();
	
	for (var i = 0; i < cells.length; i++)
	{
		this.updateSelectionStateForCell(result, cells[i], cells);
	}
	
	return result;
};

/**
 * Returns information about the current selection.
 */
BpmScheme.prototype.initSelectionState = function()
{
	return {vertices: [], edges: [], x: null, y: null, width: null, height: null, style: {},
		containsImage: false, containsLabel: false, fill: true, glass: true, rounded: true,
		comic: true, autoSize: false, image: true, shadow: true, lineJumps: true};
};

/**
 * Returns information about the current selection.
 */
BpmScheme.prototype.updateSelectionStateForCell = function(result, cell, cells)
{
	var graph = this.editorUi.editor.graph;
	
	if (graph.getModel().isVertex(cell))
	{
		result.vertices.push(cell);
		var geo = graph.getCellGeometry(cell);
		
		if (geo != null)
		{
			if (geo.width > 0)
			{
				if (result.width == null)
				{
					result.width = geo.width;
				}
				else if (result.width != geo.width)
				{
					result.width = '';
				}
			}
			else
			{
				result.containsLabel = true;
			}
			
			if (geo.height > 0)
			{
				if (result.height == null)
				{
					result.height = geo.height;
				}
				else if (result.height != geo.height)
				{
					result.height = '';
				}
			}
			else
			{
				result.containsLabel = true;
			}
			
			if (!geo.relative || geo.offset != null)
			{
				var x = (geo.relative) ? geo.offset.x : geo.x;
				var y = (geo.relative) ? geo.offset.y : geo.y;
				
				if (result.x == null)
				{
					result.x = x;
				}
				else if (result.x != x)
				{
					result.x = '';
				}
				
				if (result.y == null)
				{
					result.y = y;
				}
				else if (result.y != y)
				{
					result.y = '';
				}
			}
		}
	}
	else if (graph.getModel().isEdge(cell))
	{
		result.edges.push(cell);
	}

	var state = graph.view.getState(cell);
	
	if (state != null)
	{
		result.autoSize = result.autoSize || this.isAutoSizeState(state);
		result.glass = result.glass && this.isGlassState(state);
		result.rounded = result.rounded && this.isRoundedState(state);
		result.lineJumps = result.lineJumps && this.isLineJumpState(state);
		result.comic = result.comic && this.isComicState(state);
		result.image = result.image && this.isImageState(state);
		result.shadow = result.shadow && this.isShadowState(state);
		result.fill = result.fill && this.isFillState(state);
		
		var shape = bpmUtils.getValue(state.style, bpmConstants.STYLE_SHAPE, null);
		result.containsImage = result.containsImage || shape == 'image';
		
		for (var key in state.style)
		{
			var value = state.style[key];
			
			if (value != null)
			{
				if (result.style[key] == null)
				{
					result.style[key] = value;
				}
				else if (result.style[key] != value)
				{
					result.style[key] = '';
				}
			}
		}
	}
};

/**
 * Returns information about the current selection.
 */
BpmScheme.prototype.isFillState = function(state)
{
	return state.view.graph.model.isVertex(state.cell) ||
		bpmUtils.getValue(state.style, bpmConstants.STYLE_SHAPE, null) == 'arrow' ||
		bpmUtils.getValue(state.style, bpmConstants.STYLE_SHAPE, null) == 'filledEdge' ||
		bpmUtils.getValue(state.style, bpmConstants.STYLE_SHAPE, null) == 'flexArrow';
};

/**
 * Returns information about the current selection.
 */
BpmScheme.prototype.isGlassState = function(state)
{
	var shape = bpmUtils.getValue(state.style, bpmConstants.STYLE_SHAPE, null);
	
	return (shape == 'label' || shape == 'rectangle' || shape == 'internalStorage' ||
			shape == 'ext' || shape == 'umlLifeline' || shape == 'swimlane' ||
			shape == 'process');
};

/**
 * Returns information about the current selection.
 */
BpmScheme.prototype.isRoundedState = function(state)
{
	return (state.shape != null) ? state.shape.isRoundable() :
		bpmUtils.indexOf(this.roundableShapes, bpmUtils.getValue(state.style,
		bpmConstants.STYLE_SHAPE, null)) >= 0;
};

/**
 * Returns information about the current selection.
 */
BpmScheme.prototype.isLineJumpState = function(state)
{
	var shape = bpmUtils.getValue(state.style, bpmConstants.STYLE_SHAPE, null);
	var curved = bpmUtils.getValue(state.style, bpmConstants.STYLE_CURVED, false);
	
	return !curved && (shape == 'connector' || shape == 'filledEdge');
};

/**
 * Returns information about the current selection.
 */
BpmScheme.prototype.isComicState = function(state)
{
	var shape = bpmUtils.getValue(state.style, bpmConstants.STYLE_SHAPE, null);
	
	return bpmUtils.indexOf(['label', 'rectangle', 'internalStorage', 'corner', 'parallelogram', 'note', 'collate',
	                        'swimlane', 'triangle', 'trapezoid', 'ext', 'step', 'tee', 'process', 'link', 'rhombus',
	                        'offPageConnector', 'loopLimit', 'hexagon', 'manualInput', 'singleArrow', 'doubleArrow',
	                        'flexArrow', 'filledEdge', 'card', 'umlLifeline', 'connector', 'folder', 'component', 'sortShape',
	                        'cross', 'umlFrame', 'cube', 'isoCube', 'isoRectangle', 'partialRectangle'], shape) >= 0;
};

/**
 * Returns information about the current selection.
 */
BpmScheme.prototype.isAutoSizeState = function(state)
{
	return bpmUtils.getValue(state.style, bpmConstants.STYLE_AUTOSIZE, null) == '1';
};

/**
 * Returns information about the current selection.
 */
BpmScheme.prototype.isImageState = function(state)
{
	var shape = bpmUtils.getValue(state.style, bpmConstants.STYLE_SHAPE, null);
	
	return (shape == 'label' || shape == 'image');
};

/**
 * Returns information about the current selection.
 */
BpmScheme.prototype.isShadowState = function(state)
{
	var shape = bpmUtils.getValue(state.style, bpmConstants.STYLE_SHAPE, null);
	
	return (shape != 'image');
};

/**
 * Adds the label menu items to the given menu and parent.
 */
BpmScheme.prototype.clear = function()
{
	this.container.innerHTML = '';
	
	// Destroy existing panels
	if (this.panels != null)
	{
		for (var i = 0; i < this.panels.length; i++)
		{
			this.panels[i].destroy();
		}
	}
	
	this.panels = [];
};

/**
 * Adds the label menu items to the given menu and parent.
 */
BpmScheme.prototype.refresh = function()
{
	// Performance tweak: No refresh needed if not visible
	if (this.container.style.width == '0px')
	{
		return;
	}
	
	this.clear();
	var ui = this.editorUi;
	var graph = ui.editor.graph;
	
	var div = document.createElement('div');
	div.style.whiteSpace = 'nowrap';
	div.style.color = 'rgb(112, 112, 112)';
	div.style.textAlign = 'left';
	div.style.cursor = 'default';
	
	var label = document.createElement('div');
	label.className = 'mainBpmSchemeSection';
	label.style.textAlign = 'center';
	label.style.fontWeight = 'bold';
	label.style.paddingTop = '8px';
	label.style.fontSize = '13px';
	label.style.borderWidth = '0px 0px 1px 1px';
	label.style.borderStyle = 'solid';
	label.style.display = (bpmCore.IS_QUIRKS) ? 'inline' : 'inline-block';
	label.style.height = (bpmCore.IS_QUIRKS) ? '34px' : '25px';
	label.style.overflow = 'hidden';
	label.style.width = '100%';
	this.container.appendChild(div);
	
	// Prevents text selection
    bpmEvent.addListener(label, (bpmCore.IS_POINTER) ? 'pointerdown' : 'mousedown',
        bpmUtils.bind(this, function(evt)
	{
		evt.preventDefault();
	}));

	if (graph.isSelectionEmpty())
	{
		bpmUtils.write(label, bpmResources.get('format'));
		label.style.borderLeftWidth = '0px';
		
		// Adds button to hide the format panel since
		// people don't seem to find the toolbar button
		// and the menu item in the format menu
		if (this.showCloseButton)
		{
			var img = document.createElement('img');
			img.setAttribute('border', '0');
			img.setAttribute('src', BpmModal.prototype.closeImage);
			img.setAttribute('title', bpmResources.get('hide'));
			img.style.position = 'absolute';
			img.style.display = 'block';
			img.style.right = '0px';
			img.style.top = '8px';
			img.style.cursor = 'pointer';
			img.style.marginTop = '1px';
			img.style.marginRight = '17px';
			img.style.border = '1px solid transparent';
			img.style.padding = '1px';
			img.style.opacity = 0.5;
			label.appendChild(img)
			
			bpmEvent.addListener(img, 'click', function()
			{
				ui.actions.get('formatPanel').funct();
			});
		}
		
		// div.appendChild(label);  ////////////////////////////////////////////////////  Delete Format label ////////////////////////////////////////////////////////
		this.panels.push(new DiagramBpmSchemePanel(this, ui, div));
	}
	else if (graph.isEditing())
	{
		bpmUtils.write(label, bpmResources.get('text'));
		div.appendChild(label);
		// this.panels.push(new TextBpmSchemePanel(this, ui, div));
	}
	else
	{
		var containsLabel = this.getSelectionState().containsLabel;
		var currentLabel = null;
		var currentPanel = null;
		
		var addClickHandler = bpmUtils.bind(this, function(elt, panel, index)
		{
			var clickHandler = bpmUtils.bind(this, function(evt)
			{
				if (currentLabel != elt)
				{
					if (containsLabel)
					{
						this.labelIndex = index;
					}
					else
					{
						this.currentIndex = index;
					}
					
					if (currentLabel != null)
					{
						currentLabel.style.backgroundColor = this.inactiveTabBackgroundColor;
						currentLabel.style.borderBottomWidth = '1px';
					}
	
					currentLabel = elt;
					currentLabel.style.backgroundColor = '';
					currentLabel.style.borderBottomWidth = '0px';
					
					if (currentPanel != panel)
					{
						if (currentPanel != null)
						{
							currentPanel.style.display = 'none';
						}
						
						currentPanel = panel;
						currentPanel.style.display = '';
					}
				}
			});
			
			bpmEvent.addListener(elt, 'click', clickHandler);
			
			// Prevents text selection
		    bpmEvent.addListener(elt, (bpmCore.IS_POINTER) ? 'pointerdown' : 'mousedown',
	        	bpmUtils.bind(this, function(evt)
	    	{
				evt.preventDefault();
			}));
			
			if (index == ((containsLabel) ? this.labelIndex : this.currentIndex))
			{
				// Invokes handler directly as a workaround for no click on DIV in KHTML.
				clickHandler();
			}
		});
		
		var idx = 0;

		label.style.backgroundColor = this.inactiveTabBackgroundColor;
		label.style.borderLeftWidth = '1px';
		label.style.cursor = 'pointer';
		label.style.width = (containsLabel) ? '33%' : '33%';//////////////////////////////////////////////////////////////////////////////////////////////////
		var label2 = label.cloneNode(false);
		var label3 = label2.cloneNode(false);
		var label4 = label3.cloneNode(false);

		// Workaround for ignored background in IE
		label2.style.backgroundColor = this.inactiveTabBackgroundColor;
		label3.style.backgroundColor = this.inactiveTabBackgroundColor;
		label4.style.backgroundColor = this.inactiveTabBackgroundColor;
		
		// Style
		if (containsLabel)
		{
			label2.style.borderLeftWidth = '0px';
		}
		else
		{
			label.style.borderLeftWidth = '0px';
			bpmUtils.write(label, bpmResources.get('style'));
			div.appendChild(label);
			
			var stylePanel = div.cloneNode(false);
			stylePanel.style.display = 'none';
			this.panels.push(new StyleBpmSchemePanel(this, ui, stylePanel));
			this.container.appendChild(stylePanel);

			addClickHandler(label, stylePanel, idx++);
		}
		
		// Text
		bpmUtils.write(label2, bpmResources.get('text'));
		div.appendChild(label2);

		var textPanel = div.cloneNode(false);
		textPanel.style.display = 'none';
		this.panels.push(new TextBpmSchemePanel(this, ui, textPanel));
		this.container.appendChild(textPanel);
		
		// Arrange
		
		bpmUtils.write(label3, bpmResources.get('arrange'));
		div.appendChild(label3);

		var arrangePanel = div.cloneNode(false);
		arrangePanel.style.display = 'none';
		this.panels.push(new ArrangePanel(this, ui, arrangePanel));
		this.container.appendChild(arrangePanel);
		
		
		addClickHandler(label2, textPanel, idx++);
		addClickHandler(label3, arrangePanel, idx++);
	}
};

/**
 * Base class for format panels.
 */
BaseBpmSchemePanel = function(format, editorUi, container)
{
	this.format = format;
	this.editorUi = editorUi;
	this.container = container;
	this.listeners = [];
};

/**
 * 
 */
BaseBpmSchemePanel.prototype.buttonBackgroundColor = 'white';

/**
 * Adds the given color option.
 */
BaseBpmSchemePanel.prototype.getSelectionState = function()
{
	var graph = this.editorUi.editor.graph;
	var cells = graph.getSelectionCells();
	var shape = null;

	for (var i = 0; i < cells.length; i++)
	{
		var state = graph.view.getState(cells[i]);
		
		if (state != null)
		{
			var tmp = bpmUtils.getValue(state.style, bpmConstants.STYLE_SHAPE, null);
			
			if (tmp != null)
			{
				if (shape == null)
				{
					shape = tmp;
				}
				else if (shape != tmp)
				{
					return null;
				}
			}
			
		}
	}
	
	return shape;
};

/**
 * Install input handler.
 */
BaseBpmSchemePanel.prototype.installInputHandler = function(input, key, defaultValue, min, max, unit, textEditFallback, isFloat)
{
	unit = (unit != null) ? unit : '';
	isFloat = (isFloat != null) ? isFloat : false;
	
	var ui = this.editorUi;
	var graph = ui.editor.graph;
	
	min = (min != null) ? min : 1;
	max = (max != null) ? max : 999;
	
	var selState = null;
	var updating = false;
	
	var update = bpmUtils.bind(this, function(evt)
	{
		var value = (isFloat) ? parseFloat(input.value) : parseInt(input.value);

		// Special case: angle mod 360
		if (!isNaN(value) && key == bpmConstants.STYLE_ROTATION)
		{
			// Workaround for decimal rounding errors in floats is to
			// use integer and round all numbers to two decimal point
			value = bpmUtils.mod(Math.round(value * 100), 36000) / 100;
		}
		
		value = Math.min(max, Math.max(min, (isNaN(value)) ? defaultValue : value));
		
		if (graph.cellEditor.isContentEditing() && textEditFallback)
		{
			if (!updating)
			{
				updating = true;
				
				if (selState != null)
				{
					graph.cellEditor.restoreSelection(selState);
					selState = null;
				}
				
				textEditFallback(value);
				input.value = value + unit;
	
				// Restore focus and selection in input
				updating = false;
			}
		}
		else if (value != bpmUtils.getValue(this.format.getSelectionState().style, key, defaultValue))
		{
			if (graph.isEditing())
			{
				graph.stopEditing(true);
			}
			
			graph.getModel().beginUpdate();
			try
			{
				graph.setCellStyles(key, value, graph.getSelectionCells());
				
				// Handles special case for fontSize where HTML labels are parsed and updated
				if (key == bpmConstants.STYLE_FONTSIZE)
				{
					graph.updateLabelElements(graph.getSelectionCells(), function(elt)
					{
						elt.style.fontSize = value + 'px';
						elt.removeAttribute('size');
					});
				}
				
				ui.fireEvent(new bpmEventObject('styleChanged', 'keys', [key],
						'values', [value], 'cells', graph.getSelectionCells()));
			}
			finally
			{
				graph.getModel().endUpdate();
			}
		}
		
		input.value = value + unit;
		bpmEvent.consume(evt);
	});

	if (textEditFallback && graph.cellEditor.isContentEditing())
	{
		// KNOWN: Arrow up/down clear selection text in quirks/IE 8
		// Text size via arrow button limits to 16 in IE11. Why?
		bpmEvent.addListener(input, 'mousedown', function()
		{
			if (document.activeElement == graph.cellEditor.textarea)
			{
				selState = graph.cellEditor.saveSelection();
			}
		});
		
		bpmEvent.addListener(input, 'touchstart', function()
		{
			if (document.activeElement == graph.cellEditor.textarea)
			{
				selState = graph.cellEditor.saveSelection();
			}
		});
	}
	
	bpmEvent.addListener(input, 'change', update);
	bpmEvent.addListener(input, 'blur', update);
	
	return update;
};

/**
 * Adds the given option.
 */
BaseBpmSchemePanel.prototype.createPanel = function()
{
	var div = document.createElement('div');
	div.className = 'mainBpmSchemeSection';
	div.style.padding = '12px 0px 12px 18px';
	
	return div;
};

/**
 * Adds the given option.
 */
BaseBpmSchemePanel.prototype.createTitle = function(title)
{
	var div = document.createElement('div');
	div.style.padding = '0px 0px 6px 0px';
	div.style.whiteSpace = 'nowrap';
	div.style.overflow = 'hidden';
	div.style.width = '200px';
	div.style.fontWeight = 'bold';
	bpmUtils.write(div, title);
	
	return div;
};

/**
 * 
 */
BaseBpmSchemePanel.prototype.createStepper = function(input, update, step, height, disableFocus, defaultValue)
{
	step = (step != null) ? step : 1;
	height = (height != null) ? height : 8;
	
	if (bpmCore.IS_QUIRKS)
	{
		height = height - 2;
	}
	else if (bpmCore.IS_MT || document.documentMode >= 8)
	{
		height = height + 1;
	} 
	
	var stepper = document.createElement('div');
	bpmUtils.setPrefixedStyle(stepper.style, 'borderRadius', '3px');
	stepper.style.border = '1px solid rgb(192, 192, 192)';
	// stepper.style.position = 'absolute';
	// stepper.style.marginLeft = 'auto';
	
	var up = document.createElement('div');
	up.style.borderBottom = '1px solid rgb(192, 192, 192)';
	up.style.position = 'relative';
	up.style.height = height + 'px';
	up.style.width = '10px';
	up.className = 'geBtnUp';
	stepper.appendChild(up);
	
	var down = up.cloneNode(false);
	down.style.border = 'none';
	down.style.height = height + 'px';
	down.className = 'geBtnDown';
	stepper.appendChild(down);

	bpmEvent.addListener(down, 'click', function(evt)
	{
		if (input.value == '')
		{
			input.value = defaultValue || '2';
		}
		
		var val = parseInt(input.value);
		
		if (!isNaN(val))
		{
			input.value = val - step;
			
			if (update != null)
			{
				update(evt);
			}
		}
		
		bpmEvent.consume(evt);
	});
	
	bpmEvent.addListener(up, 'click', function(evt)
	{
		if (input.value == '')
		{
			input.value = defaultValue || '0';
		}
		
		var val = parseInt(input.value);
		
		if (!isNaN(val))
		{
			input.value = val + step;
			
			if (update != null)
			{
				update(evt);
			}
		}
		
		bpmEvent.consume(evt);
	});
	
	// Disables transfer of focus to DIV but also :active CSS
	// so it's only used for fontSize where the focus should
	// stay on the selected text, but not for any other input.
	if (disableFocus)
	{
		var currentSelection = null;
		
		bpmEvent.addGestureListeners(stepper,
			function(evt)
			{
				// Workaround for lost current selection in page because of focus in IE
				if (bpmCore.IS_QUIRKS || document.documentMode == 8)
				{
					currentSelection = document.selection.createRange();
				}
				
				bpmEvent.consume(evt);
			},
			null,
			function(evt)
			{
				// Workaround for lost current selection in page because of focus in IE
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
					bpmEvent.consume(evt);
				}
			}
		);
	}

	return stepper;
};

/**
 * Adds the given option.
 */
BaseBpmSchemePanel.prototype.createOption = function(label, isCheckedFn, setCheckedFn, listener)
{
	var div = document.createElement('div');
	div.style.padding = '6px 0px 1px 0px';
	div.style.whiteSpace = 'nowrap';
	div.style.overflow = 'hidden';
	div.style.width = '200px';
	div.style.height = (bpmCore.IS_QUIRKS) ? '27px' : '18px';
	
	var cb = document.createElement('input');
	cb.setAttribute('type', 'checkbox');
	cb.style.margin = '0px 6px 0px 0px';
	div.appendChild(cb);

	var span = document.createElement('span');
	bpmUtils.write(span, label);
	div.appendChild(span);

	var applying = false;
	var value = isCheckedFn();
	
	var apply = function(newValue)
	{
		if (!applying)
		{
			applying = true;
			
			if (newValue)
			{
				cb.setAttribute('checked', 'checked');
				cb.defaultChecked = true;
				cb.checked = true;
			}
			else
			{
				cb.removeAttribute('checked');
				cb.defaultChecked = false;
				cb.checked = false;
			}
			
			if (value != newValue)
			{
				value = newValue;
				
				// Checks if the color value needs to be updated in the model
				if (isCheckedFn() != value)
				{
					setCheckedFn(value);
				}
			}
			
			applying = false;
		}
	};

	bpmEvent.addListener(div, 'click', function(evt)
	{
		if (cb.getAttribute('disabled') != 'disabled')
		{
			// Toggles checkbox state for click on label
			var source = bpmEvent.getSource(evt);
			
			if (source == div || source == span)
			{
				cb.checked = !cb.checked;
			}
			
			apply(cb.checked);
		}
	});
	
	apply(value);
	
	if (listener != null)
	{
		listener.install(apply);
		this.listeners.push(listener);
	}

	return div;
};

/**
 * The string 'null' means use null in values.
 */
BaseBpmSchemePanel.prototype.createCellOption = function(label, key, defaultValue, enabledValue, disabledValue, fn, action, stopEditing)
{
	enabledValue = (enabledValue != null) ? ((enabledValue == 'null') ? null : enabledValue) : '1';
	disabledValue = (disabledValue != null) ? ((disabledValue == 'null') ? null : disabledValue) : '0';
	
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;
	
	return this.createOption(label, function()
	{
		// Seems to be null sometimes, not sure why...
		var state = graph.view.getState(graph.getSelectionCell());
		
		if (state != null)
		{
			return bpmUtils.getValue(state.style, key, defaultValue) != disabledValue;
		}
		
		return null;
	}, function(checked)
	{
		if (stopEditing)
		{
			graph.stopEditing();
		}
		
		if (action != null)
		{
			action.funct();
		}
		else
		{
			graph.getModel().beginUpdate();
			try
			{
				var value = (checked) ? enabledValue : disabledValue;
				graph.setCellStyles(key, value, graph.getSelectionCells());
				
				if (fn != null)
				{
					fn(graph.getSelectionCells(), value);
				}
				
				ui.fireEvent(new bpmEventObject('styleChanged', 'keys', [key],
					'values', [value], 'cells', graph.getSelectionCells()));
			}
			finally
			{
				graph.getModel().endUpdate();
			}
		}
	},
	{
		install: function(apply)
		{
			this.listener = function()
			{
				// Seems to be null sometimes, not sure why...
				var state = graph.view.getState(graph.getSelectionCell());
				
				if (state != null)
				{
					apply(bpmUtils.getValue(state.style, key, defaultValue) != disabledValue);
				}
			};
			
			graph.getModel().addListener(bpmEvent.CHANGE, this.listener);
		},
		destroy: function()
		{
			graph.getModel().removeListener(this.listener);
		}
	});
};

/**
 * Adds the given color option.
 */
BaseBpmSchemePanel.prototype.createColorOption = function(label, getColorFn, setColorFn, defaultColor, listener, callbackFn, hideCheckbox)
{
	var div = document.createElement('div');
	div.style.padding = '6px 0px 1px 0px';
	div.style.whiteSpace = 'nowrap';
	div.style.overflow = 'hidden';
	div.style.width = '100%';
	div.style.height = (bpmCore.IS_QUIRKS) ? '27px' : '18px';
	div.style.display = 'flex';
	
	var cb = document.createElement('input');
	cb.setAttribute('type', 'checkbox');
	cb.style.margin = '0px 6px 0px 0px';
	
	if (!hideCheckbox)
	{
		div.appendChild(cb);	
	}

	var span = document.createElement('span');
	bpmUtils.write(span, label);
	div.appendChild(span);
	
	var value = getColorFn();
	var applying = false;
	var btn = null;

	var apply = function(color, disableUpdate, forceUpdate)
	{
		if (!applying)
		{
			applying = true;
			color = (/(^#?[a-zA-Z0-9]*$)/.test(color)) ? color : defaultColor;
			btn.innerHTML = '<div style="width:' + ((bpmCore.IS_QUIRKS) ? '30' : '36') +
				'px;height:12px;margin:3px;border:1px solid black;background-color:' +
				bpmUtils.htmlEntities((color != null && color != bpmConstants.NONE) ?
				color : defaultColor) + ';"></div>';
			
			// Fine-tuning in Firefox, quirks mode and IE8 standards
			if (bpmCore.IS_QUIRKS || document.documentMode == 8)
			{
				btn.firstChild.style.margin = '0px';
			}
			
			if (color != null && color != bpmConstants.NONE)
			{
				cb.setAttribute('checked', 'checked');
				cb.defaultChecked = true;
				cb.checked = true;
			}
			else
			{
				cb.removeAttribute('checked');
				cb.defaultChecked = false;
				cb.checked = false;
			}
	
			btn.style.display = (cb.checked || hideCheckbox) ? '' : 'none';

			if (callbackFn != null)
			{
				callbackFn(color);
			}

			if (!disableUpdate)
			{
				value = color;
				
				// Checks if the color value needs to be updated in the model
				if (forceUpdate || hideCheckbox || getColorFn() != value)
				{
					setColorFn(value);
				}
			}
			
			applying = false;
		}
	};

	btn = bpmUtils.button('', bpmUtils.bind(this, function(evt)
	{
		this.editorUi.pickColor(value, function(color)
		{
			apply(color, null, true);
		});
		bpmEvent.consume(evt);
	}));
	
	// btn.style.position = 'absolute';
	btn.style.marginTop = '-4px';
	btn.style.right = (bpmCore.IS_QUIRKS) ? '0px' : '20px';
	btn.style.height = '22px';
	btn.className = 'geColorBtn';
	btn.style.marginLeft = 'auto';
	btn.style.display = (cb.checked || hideCheckbox) ? '' : 'none';
	div.appendChild(btn);

	bpmEvent.addListener(div, 'click', function(evt)
	{
		var source = bpmEvent.getSource(evt);
		
		if (source == cb || source.nodeName != 'INPUT')
		{		
			// Toggles checkbox state for click on label
			if (source != cb)
			{
				cb.checked = !cb.checked;
			}
	
			// Overrides default value with current value to make it easier
			// to restore previous value if the checkbox is clicked twice
			if (!cb.checked && value != null && value != bpmConstants.NONE &&
				defaultColor != bpmConstants.NONE)
			{
				defaultColor = value;
			}
			
			apply((cb.checked) ? defaultColor : bpmConstants.NONE);
		}
	});
	
	apply(value, true);
	
	if (listener != null)
	{
		listener.install(apply);
		this.listeners.push(listener);
	}
	
	return div;
};

/**
 * 
 */
BaseBpmSchemePanel.prototype.createCellColorOption = function(label, colorKey, defaultColor, callbackFn, setStyleFn)
{
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;
	
	return this.createColorOption(label, function()
	{
		// Seems to be null sometimes, not sure why...
		var state = graph.view.getState(graph.getSelectionCell());
		
		if (state != null)
		{
			return bpmUtils.getValue(state.style, colorKey, null);
		}
		
		return null;
	}, function(color)
	{
		graph.getModel().beginUpdate();
		try
		{
			if (setStyleFn != null)
			{
				setStyleFn(color);
			}
			
			graph.setCellStyles(colorKey, color, graph.getSelectionCells());
			ui.fireEvent(new bpmEventObject('styleChanged', 'keys', [colorKey],
				'values', [color], 'cells', graph.getSelectionCells()));
		}
		finally
		{
			graph.getModel().endUpdate();
		}
	}, defaultColor || bpmConstants.NONE,
	{
		install: function(apply)
		{
			this.listener = function()
			{
				// Seems to be null sometimes, not sure why...
				var state = graph.view.getState(graph.getSelectionCell());
				
				if (state != null)
				{
					apply(bpmUtils.getValue(state.style, colorKey, null));
				}
			};
			
			graph.getModel().addListener(bpmEvent.CHANGE, this.listener);
		},
		destroy: function()
		{
			graph.getModel().removeListener(this.listener);
		}
	}, callbackFn);
};

/**
 * 
 */
BaseBpmSchemePanel.prototype.addArrow = function(elt, height)
{
	height = (height != null) ? height : 10;
	
	var arrow = document.createElement('div');
	arrow.style.display = (bpmCore.IS_QUIRKS) ? 'inline' : 'inline-block';
	arrow.style.padding = '6px';
	arrow.style.paddingRight = '4px';
	
	var m = (10 - height);
	
	if (m == 2)
	{
		arrow.style.paddingTop = 6 + 'px';
	}
	else if (m > 0)
	{
		arrow.style.paddingTop = (6 - m) + 'px';
	}
	else
	{
		arrow.style.marginTop = '-2px';
	}
	
	arrow.style.height = height + 'px';
	arrow.style.borderLeft = '1px solid #a0a0a0';
	arrow.innerHTML = '<img border="0" src="' + ((bpmCore.IS_SVG) ? 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAHBJREFUeNpidHB2ZyAGsACxDRBPIKCuA6TwCBB/h2rABu4A8SYmKCcXiP/iUFgAxL9gCi8A8SwsirZCMQMTkmANEH9E4v+CmsaArvAdyNFI/FlQ92EoBIE+qCRIUz168DBgsU4OqhinQpgHMABAgAEALY4XLIsJ20oAAAAASUVORK5CYII=' :
		IMAGE_PATH + '/dropdown.png') + '" style="margin-bottom:4px;">';
	bpmUtils.setOpacity(arrow, 70);
	
	var symbol = elt.getElementsByTagName('div')[0];
	
	if (symbol != null)
	{
		symbol.style.paddingRight = '6px';
		symbol.style.marginLeft = '4px';
		symbol.style.marginTop = '-1px';
		symbol.style.display = (bpmCore.IS_QUIRKS) ? 'inline' : 'inline-block';
		bpmUtils.setOpacity(symbol, 60);
	}

	bpmUtils.setOpacity(elt, 100);
	elt.style.border = '1px solid #a0a0a0';
	elt.style.backgroundColor = this.buttonBackgroundColor;
	elt.style.backgroundImage = 'none';
	elt.style.width = 'auto';
	elt.className += ' geColorBtn';
	bpmUtils.setPrefixedStyle(elt.style, 'borderRadius', '3px');
	
	elt.appendChild(arrow);
	
	return symbol;
};

/**
 * 
 */
BaseBpmSchemePanel.prototype.addUnitInput = function(container, unit, right, width, update, step, marginTop, disableFocus)
{
	marginTop = (marginTop != null) ? marginTop : 0;
	
	var input = document.createElement('input');
	// input.style.position = 'absolute';
	input.style.textAlign = 'right';
	input.style.marginTop = '-2px';
	input.style.marginLeft = 'auto';
	input.style.right = (right + 12) + 'px';
	input.style.width = width + 'px';
	container.style.display = 'flex';
	container.appendChild(input);
	
	var stepper = this.createStepper(input, update, step, null, disableFocus);
	// stepper.style.marginTop = (marginTop - 2) + 'px';
	stepper.style.right = right + 'px';
	container.appendChild(stepper);

	return input;
};

/**
 * 
 */
BaseBpmSchemePanel.prototype.createRelativeOption = function(label, key, width, handler, init)
{
	width = (width != null) ? width : 44;
	
	var graph = this.editorUi.editor.graph;
	var div = this.createPanel();
	div.style.paddingTop = '10px';
	div.style.paddingBottom = '10px';
	bpmUtils.write(div, label);
	div.style.fontWeight = 'bold';
	
	var update = bpmUtils.bind(this, function(evt)
	{
		if (handler != null)
		{
			handler(input);
		}
		else
		{
			var value = parseInt(input.value);
			value = Math.min(100, Math.max(0, (isNaN(value)) ? 100 : value));
			var state = graph.view.getState(graph.getSelectionCell());
			
			if (state != null && value != bpmUtils.getValue(state.style, key, 100))
			{
				// Removes entry in style (assumes 100 is default for relative values)
				if (value == 100)
				{
					value = null;
				}
				
				graph.setCellStyles(key, value, graph.getSelectionCells());
				this.editorUi.fireEvent(new bpmEventObject('styleChanged', 'keys', [key],
					'values', [value], 'cells', graph.getSelectionCells()));
			}
	
			input.value = ((value != null) ? value : '100') + ' %';
		}
		
		bpmEvent.consume(evt);
	});

	var input = this.addUnitInput(div, '%', 20, width, update, 10, -15, handler != null);

	if (key != null)
	{
		var listener = bpmUtils.bind(this, function(sender, evt, force)
		{
			if (force || input != document.activeElement)
			{
				var ss = this.format.getSelectionState();
				var tmp = parseInt(bpmUtils.getValue(ss.style, key, 100));
				input.value = (isNaN(tmp)) ? '' : tmp + ' %';
			}
		});
		
		bpmEvent.addListener(input, 'keydown', function(e)
		{
			if (e.keyCode == 13)
			{
				graph.container.focus();
				bpmEvent.consume(e);
			}
			else if (e.keyCode == 27)
			{
				listener(null, null, true);
				graph.container.focus();
				bpmEvent.consume(e);
			}
		});
		
		graph.getModel().addListener(bpmEvent.CHANGE, listener);
		this.listeners.push({destroy: function() { graph.getModel().removeListener(listener); }});
		listener();
	}

	bpmEvent.addListener(input, 'blur', update);
	bpmEvent.addListener(input, 'change', update);
	
	if (init != null)
	{
		init(input);
	}

	return div;
};

/**
 * 
 */
BaseBpmSchemePanel.prototype.addLabel = function(div, title, right, width)
{
	width = (width != null) ? width : 61;
	
	var label = document.createElement('div');
	bpmUtils.write(label, title);
	// label.style.position = 'absolute';
	label.style.right = right + 'px';
	label.style.width = width + 'px';
	label.style.marginTop = '6px';
	label.style.textAlign = 'center';
	div.appendChild(label);
};

/**
 * 
 */
BaseBpmSchemePanel.prototype.addKeyHandler = function(input, listener)
{
	bpmEvent.addListener(input, 'keydown', bpmUtils.bind(this, function(e)
	{
		if (e.keyCode == 13)
		{
			this.editorUi.editor.graph.container.focus();
			bpmEvent.consume(e);
		}
		else if (e.keyCode == 27)
		{
			if (listener != null)
			{
				listener(null, null, true);				
			}

			this.editorUi.editor.graph.container.focus();
			bpmEvent.consume(e);
		}
	}));
};

/**
 * 
 */
BaseBpmSchemePanel.prototype.styleButtons = function(elts)
{
	for (var i = 0; i < elts.length; i++)
	{
		bpmUtils.setPrefixedStyle(elts[i].style, 'borderRadius', '3px');
		bpmUtils.setOpacity(elts[i], 100);
		elts[i].style.border = '1px solid #a0a0a0';
		elts[i].style.padding = '4px';
		elts[i].style.paddingTop = '3px';
		elts[i].style.paddingRight = '1px';
		elts[i].style.margin = '1px';
		elts[i].style.width = '24px';
		elts[i].style.height = '20px';
		elts[i].className += ' geColorBtn';
	}
};

/**
 * Adds the label menu items to the given menu and parent.
 */
BaseBpmSchemePanel.prototype.destroy = function()
{
	if (this.listeners != null)
	{
		for (var i = 0; i < this.listeners.length; i++)
		{
			this.listeners[i].destroy();
		}
		
		this.listeners = null;
	}
};

/**
 * Adds the label menu items to the given menu and parent.
 */
ArrangePanel = function(format, editorUi, container)
{
	BaseBpmSchemePanel.call(this, format, editorUi, container);
	this.init();
};

bpmUtils.extend(ArrangePanel, BaseBpmSchemePanel);

/**
 * Adds the label menu items to the given menu and parent.
 */
ArrangePanel.prototype.init = function()
{
	var graph = this.editorUi.editor.graph;
	var ss = this.format.getSelectionState();

	this.container.appendChild(this.addLayerOps(this.createPanel()));
	// Special case that adds two panels
	this.addGeometry(this.container);
	this.addEdgeGeometry(this.container);

	if (!ss.containsLabel || ss.edges.length == 0)
	{
		this.container.appendChild(this.addAngle(this.createPanel()));
	}
	
	if (!ss.containsLabel && ss.edges.length == 0)
	{
		this.container.appendChild(this.addFlip(this.createPanel()));
	}

	if (ss.vertices.length > 1)
	{
		this.container.appendChild(this.addAlign(this.createPanel()));
		this.container.appendChild(this.addDistribute(this.createPanel()));
	}
	
	this.container.appendChild(this.addGroupOps(this.createPanel()));

	if (ss.containsLabel)
	{
		// Adds functions from hidden style format panel
		var span = document.createElement('div');
		span.style.width = '100%';
		span.style.marginTop = '0px';
		span.style.fontWeight = 'bold';
		span.style.padding = '10px 0 0 18px';
		bpmUtils.write(span, bpmResources.get('style'));
		this.container.appendChild(span);
			
		new StyleBpmSchemePanel(this.format, this.editorUi, this.container);
	}
};

/**
 * 
 */
ArrangePanel.prototype.addLayerOps = function(div)
{
	var ui = this.editorUi;
	
	var btn = bpmUtils.button(bpmResources.get('toFront'), function(evt)
	{
		ui.actions.get('toFront').funct();
	})
	
	btn.setAttribute('title', bpmResources.get('toFront') + ' (' + this.editorUi.actions.get('toFront').shortcut + ')');
	btn.style.width = '49%';
	btn.style.marginRight = '2px';
	div.appendChild(btn);
	
	var btn = bpmUtils.button(bpmResources.get('toBack'), function(evt)
	{
		ui.actions.get('toBack').funct();
	})
	
	btn.setAttribute('title', bpmResources.get('toBack') + ' (' + this.editorUi.actions.get('toBack').shortcut + ')');
	btn.style.width = '49%';
	btn.style.float = 'right';
	div.appendChild(btn);
	
	return div;
};

/**
 * 
 */
ArrangePanel.prototype.addGroupOps = function(div)
{
	var ui = this.editorUi;
	var graph = ui.editor.graph;
	var cell = graph.getSelectionCell();
	var ss = this.format.getSelectionState();
	var count = 0;
	var btn = null;
	
	div.style.paddingTop = '8px';
	div.style.paddingBottom = '6px';

	if (graph.getSelectionCount() > 1)
	{
		btn = bpmUtils.button(bpmResources.get('group'), function(evt)
		{
			ui.actions.get('group').funct();
		})
		
		btn.setAttribute('title', bpmResources.get('group') + ' (' + this.editorUi.actions.get('group').shortcut + ')');
		btn.style.width = '100%';
		btn.style.marginBottom = '2px';
		div.appendChild(btn);
		count++;
	}
	else if (graph.getSelectionCount() == 1 && !graph.getModel().isEdge(cell) && !graph.isSwimlane(cell) &&
			graph.getModel().getChildCount(cell) > 0)
	{
		btn = bpmUtils.button(bpmResources.get('ungroup'), function(evt)
		{
			ui.actions.get('ungroup').funct();
		})
		
		btn.setAttribute('title', bpmResources.get('ungroup') + ' (' +
			this.editorUi.actions.get('ungroup').shortcut + ')');
		btn.style.width = '100%';
		btn.style.marginBottom = '2px';
		div.appendChild(btn);
		count++;
	}
	
	if (ss.vertices.length > 0)
	{
		if (count > 0)
		{
			bpmUtils.br(div);
			count = 0;
		}
		
		var btn = bpmUtils.button(bpmResources.get('copySize'), function(evt)
		{
			ui.actions.get('copySize').funct();
		});
		
		btn.setAttribute('title', bpmResources.get('copySize') + ' (' +
			this.editorUi.actions.get('copySize').shortcut + ')');
		btn.style.width = '100%';
		btn.style.marginBottom = '2px';
		div.appendChild(btn);
		count++;
		
		if (ui.copiedSize != null)
		{
			var btn2 = bpmUtils.button(bpmResources.get('pasteSize'), function(evt)
			{
				ui.actions.get('pasteSize').funct();
			});
			
			btn2.setAttribute('title', bpmResources.get('pasteSize') + ' (' +
				this.editorUi.actions.get('pasteSize').shortcut + ')');
			
			div.appendChild(btn2);
			count++;
			
			btn.style.width = '49%';
			btn.style.marginBottom = '2px';
			btn2.style.width = '49%';
			btn2.style.marginBottom = '2px';
			btn2.style.float = 'right';
		}

	}
	
	if (graph.getSelectionCount() == 1 && graph.getModel().isVertex(cell) &&
   		graph.getModel().isVertex(graph.getModel().getParent(cell)))
	{
		if (count > 0)
		{
			bpmUtils.br(div);
		}
		
		btn = bpmUtils.button(bpmResources.get('removeFromGroup'), function(evt)
		{
			ui.actions.get('removeFromGroup').funct();
		})
		
		btn.setAttribute('title', bpmResources.get('removeFromGroup'));
		btn.style.width = '100%';
		btn.style.marginBottom = '2px';
		div.appendChild(btn);
		count++;
	}
	else if (graph.getSelectionCount() > 0)
	{
		if (count > 0)
		{
			bpmUtils.br(div);
		}
		
		var btndiv = document.createElement('div');
		btndiv.style.textAlign = 'center';
		btn = bpmUtils.button(bpmResources.get('clearWaypoints'), bpmUtils.bind(this, function(evt)
		{
			this.editorUi.actions.get('clearWaypoints').funct();
		}));
		
		btn.setAttribute('title', bpmResources.get('clearWaypoints') + ' (' + this.editorUi.actions.get('clearWaypoints').shortcut + ')');
		btn.style.width = '100%';
		btn.style.marginBottom = '2px';
		btndiv.appendChild(btn);
		div.appendChild(btndiv);

		count++;
	}
	
	if (graph.getSelectionCount() == 1)
	{
		if (count > 0)
		{
			bpmUtils.br(div);
		}
		
		btn = bpmUtils.button(bpmResources.get('editData'), bpmUtils.bind(this, function(evt)
		{
			this.editorUi.actions.get('editData').funct();
		}));
		
		btn.setAttribute('title', bpmResources.get('editData') + ' (' + this.editorUi.actions.get('editData').shortcut + ')');
		btn.style.width = '49%';
		btn.style.marginBottom = '2px';
		div.appendChild(btn);
		count++;

		btn = bpmUtils.button(bpmResources.get('editLink'), bpmUtils.bind(this, function(evt)
		{
			this.editorUi.actions.get('editLink').funct();
		}));
		
		btn.setAttribute('title', bpmResources.get('editLink'));
		btn.style.width = '49%';
		btn.style.marginBottom = '2px';
		btn.style.float = 'right';
		div.appendChild(btn);
		count++;
	}
	
	if (count == 0)
	{
		div.style.display = 'none';
	}
	
	return div;
};

/**
 * 
 */
ArrangePanel.prototype.addAlign = function(div)
{
	var graph = this.editorUi.editor.graph;
	div.style.paddingTop = '6px';
	div.style.paddingBottom = '12px';
	div.appendChild(this.createTitle(bpmResources.get('align')));
	
	var stylePanel = document.createElement('div');
	stylePanel.style.position = 'relative';
	stylePanel.style.paddingLeft = '0px';
	stylePanel.style.borderWidth = '0px';
	stylePanel.className = 'mainToolbarContainer';
	stylePanel.style.display = 'flex';

	if (bpmCore.IS_QUIRKS)
	{
		div.style.height = '60px';
	}
	
	var left = this.editorUi.toolbar.addButton('geSprite-alignleft', bpmResources.get('left'),
		function() { graph.alignCells(bpmConstants.ALIGN_LEFT); }, stylePanel);
	var center = this.editorUi.toolbar.addButton('geSprite-aligncenter', bpmResources.get('center'),
		function() { graph.alignCells(bpmConstants.ALIGN_CENTER); }, stylePanel);
	var right = this.editorUi.toolbar.addButton('geSprite-alignright', bpmResources.get('right'),
		function() { graph.alignCells(bpmConstants.ALIGN_RIGHT); }, stylePanel);

	var top = this.editorUi.toolbar.addButton('geSprite-aligntop', bpmResources.get('top'),
		function() { graph.alignCells(bpmConstants.ALIGN_TOP); }, stylePanel);
	var middle = this.editorUi.toolbar.addButton('geSprite-alignmiddle', bpmResources.get('middle'),
		function() { graph.alignCells(bpmConstants.ALIGN_MIDDLE); }, stylePanel);
	var bottom = this.editorUi.toolbar.addButton('geSprite-alignbottom', bpmResources.get('bottom'),
		function() { graph.alignCells(bpmConstants.ALIGN_BOTTOM); }, stylePanel);
	
	this.styleButtons([left, center, right, top, middle, bottom]);
	right.style.marginRight = '6px';
	div.appendChild(stylePanel);
	
	return div;
};

/**
 * 
 */
ArrangePanel.prototype.addFlip = function(div)
{
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;
	div.style.paddingTop = '6px';
	div.style.paddingBottom = '10px';

	var span = document.createElement('div');
	span.style.marginTop = '2px';
	span.style.marginBottom = '8px';
	span.style.fontWeight = 'bold';
	bpmUtils.write(span, bpmResources.get('flip'));
	div.appendChild(span);
	
	var btn = bpmUtils.button(bpmResources.get('horizontal'), function(evt)
	{
		graph.toggleCellStyles(bpmConstants.STYLE_FLIPH, false);
	})
	
	btn.setAttribute('title', bpmResources.get('horizontal'));
	btn.style.width = '49%';
	div.appendChild(btn);
	
	var btn = bpmUtils.button(bpmResources.get('vertical'), function(evt)
	{
		graph.toggleCellStyles(bpmConstants.STYLE_FLIPV, false);
	})
	
	btn.setAttribute('title', bpmResources.get('vertical'));
	btn.style.width = '49%';
	btn.style.float = 'right';
	div.appendChild(btn);
	
	return div;
};

/**
 * 
 */
ArrangePanel.prototype.addDistribute = function(div)
{
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;
	div.style.paddingTop = '6px';
	div.style.paddingBottom = '12px';
	
	div.appendChild(this.createTitle(bpmResources.get('distribute')));

	var btn = bpmUtils.button(bpmResources.get('horizontal'), function(evt)
	{
		graph.distributeCells(true);
	})
	
	btn.setAttribute('title', bpmResources.get('horizontal'));
	btn.style.width = '100px';
	btn.style.marginRight = '2px';
	div.appendChild(btn);
	
	var btn = bpmUtils.button(bpmResources.get('vertical'), function(evt)
	{
		graph.distributeCells(false);
	})
	
	btn.setAttribute('title', bpmResources.get('vertical'));
	btn.style.width = '100px';
	div.appendChild(btn);
	
	return div;
};

/**
 * 
 */
ArrangePanel.prototype.addAngle = function(div)
{
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;
	var ss = this.format.getSelectionState();

	div.style.paddingBottom = '8px';
	
	var span = document.createElement('div');
	// span.style.position = 'absolute';
	span.style.width = '70px';
	span.style.marginTop = '0px';
	span.style.fontWeight = 'bold';
	
	var input = null;
	var update = null;
	var btn = null;
	
	if (ss.edges.length == 0)
	{
		bpmUtils.write(span, bpmResources.get('angle'));
		div.appendChild(span);
		
		bpmUtils.br(div);
		div.style.paddingTop = '10px';
	}
	else
	{
		div.style.paddingTop = '8px';
	}

	if (!ss.containsLabel)
	{
		var label = bpmResources.get('reverse');
		
		if (ss.vertices.length > 0 && ss.edges.length > 0)
		{
			label = bpmResources.get('turn') + ' / ' + label;
		}
		else if (ss.vertices.length > 0)
		{
			label = bpmResources.get('turn');
		}

		btn = bpmUtils.button(label, function(evt)
		{
			ui.actions.get('turn').funct();
		})
		
		btn.setAttribute('title', label + ' (' + this.editorUi.actions.get('turn').shortcut + ')');
		btn.style.width = '202px';
		div.appendChild(btn);
		
		if (input != null)
		{
			btn.style.marginTop = '8px';
		}
	}

	if (ss.edges.length == 0)
	{
		input = this.addUnitInput(div, '°', 20, 44, function()
		{
			update.apply(this, arguments);
		});
		
		bpmUtils.br(div);
		div.style.paddingTop = '10px';
	}
	else
	{
		div.style.paddingTop = '8px';
	}

	if (input != null)
	{
		var listener = bpmUtils.bind(this, function(sender, evt, force)
		{
			if (force || document.activeElement != input)
			{
				ss = this.format.getSelectionState();
				var tmp = parseFloat(bpmUtils.getValue(ss.style, bpmConstants.STYLE_ROTATION, 0));
				input.value = (isNaN(tmp)) ? '' : tmp  + '°';
			}
		});
	
		update = this.installInputHandler(input, bpmConstants.STYLE_ROTATION, 0, 0, 360, '°', null, true);
		this.addKeyHandler(input, listener);
	
		graph.getModel().addListener(bpmEvent.CHANGE, listener);
		this.listeners.push({destroy: function() { graph.getModel().removeListener(listener); }});
		listener();
	}

	return div;
};

/**
 * 
 */
ArrangePanel.prototype.addGeometry = function(container)
{
	var ui = this.editorUi;
	var graph = ui.editor.graph;
	var rect = this.format.getSelectionState();
	
	var div = this.createPanel();
	div.style.paddingBottom = '8px';
	
	var span = document.createElement('div');
	// span.style.position = 'absolute';
	span.style.width = '50px';
	span.style.marginTop = '5px';
	span.style.fontWeight = 'bold';
	span.style.float = 'left';
	bpmUtils.write(span, bpmResources.get('size'));

	var autosizeBtn = document.createElement('div');
	autosizeBtn.className = 'geSprite geSprite-fit';
	autosizeBtn.setAttribute('title', bpmResources.get('autosize') + ' (' + this.editorUi.actions.get('autosize').shortcut + ')');
	autosizeBtn.style.position = 'relative';
	autosizeBtn.style.cursor = 'pointer';
	// autosizeBtn.style.marginTop = '-3px';
	autosizeBtn.style.border = '0px';
	autosizeBtn.style.left = '45px';
	bpmUtils.setOpacity(autosizeBtn, 50);
	
	bpmEvent.addListener(autosizeBtn, 'mouseenter', function()
	{
		bpmUtils.setOpacity(autosizeBtn, 100);
	});
	
	bpmEvent.addListener(autosizeBtn, 'mouseleave', function()
	{
		bpmUtils.setOpacity(autosizeBtn, 50);
	});

	bpmEvent.addListener(autosizeBtn, 'click', function()
	{
		ui.actions.get('autosize').funct();
	});
	
	div.appendChild(span);
	div.appendChild(autosizeBtn);

	var widthUpdate, heightUpdate, leftUpdate, topUpdate;
	var widthdiv = document.createElement('div');
	widthdiv.style.display = 'flex';
	widthdiv.style.marginTop = '5px';
	this.addLabel(widthdiv, bpmResources.get('width'), 10, 100);
	var width = this.addUnitInput(widthdiv, 'pt', 84, 44, function()
	{
		widthUpdate.apply(this, arguments);
	});
	div.appendChild(widthdiv);

	var heightdiv = document.createElement('div');
	heightdiv.style.display = 'flex';
	heightdiv.style.marginTop = '5px';
	this.addLabel(heightdiv, bpmResources.get('height'), 10, 100);
	var height = this.addUnitInput(heightdiv, 'pt', 20, 44, function()
	{
		heightUpdate.apply(this, arguments);
	});
	div.appendChild(heightdiv);
	
	bpmUtils.br(div);
	
	var wrapper = document.createElement('div');
	wrapper.style.whiteSpace = 'nowrap';
	wrapper.style.marginLeft = '45px';
	var opt = this.createCellOption(bpmResources.get('constrainProportions'),
		bpmConstants.STYLE_ASPECT, null, 'fixed', 'null');
	opt.style.width = '100%';
	wrapper.appendChild(opt);
	div.appendChild(wrapper);
	
	var constrainCheckbox = opt.getElementsByTagName('input')[0];
	this.addKeyHandler(width, listener);
	this.addKeyHandler(height, listener);
	
	widthUpdate = this.addGeometryHandler(width, function(geo, value)
	{
		if (geo.width > 0)
		{
			var value = Math.max(1, value);
			
			if (constrainCheckbox.checked)
			{
				geo.height = Math.round((geo.height  * value * 100) / geo.width) / 100;
			}
			
			geo.width = value;
		}
	});
	heightUpdate = this.addGeometryHandler(height, function(geo, value)
	{
		if (geo.height > 0)
		{
			var value = Math.max(1, value);
			
			if (constrainCheckbox.checked)
			{
				geo.width = Math.round((geo.width  * value * 100) / geo.height) / 100;
			}
			
			geo.height = value;
		}
	});
	
	container.appendChild(div);
	
	var div2 = this.createPanel();
	div2.style.paddingBottom = '8px';
	
	var span = document.createElement('div');
	span.style.width = '70px';
	span.style.marginTop = '0px';
	span.style.fontWeight = 'bold';
	bpmUtils.write(span, bpmResources.get('position'));
	div2.appendChild(span);
	
	var leftdiv = document.createElement('div');
	leftdiv.style.display = 'flex';
	leftdiv.style.marginTop = '15px';
	this.addLabel(leftdiv, bpmResources.get('left'), 84, 100);
	var left = this.addUnitInput(leftdiv, 'pt', 84, 44, function()
	{
		leftUpdate.apply(this, arguments);
	});
	div2.appendChild(leftdiv);

	var topdiv = document.createElement('div');
	topdiv.style.display = 'flex';
	topdiv.style.marginTop = '5px';
	this.addLabel(topdiv, bpmResources.get('top'), 20, 100);
	var top = this.addUnitInput(topdiv, 'pt', 20, 44, function()
	{
		topUpdate.apply(this, arguments);
	});
	div2.appendChild(topdiv);

	bpmUtils.br(div2);
	
	var listener = bpmUtils.bind(this, function(sender, evt, force)
	{
		rect = this.format.getSelectionState();

		if (!rect.containsLabel && rect.vertices.length == graph.getSelectionCount() &&
			rect.width != null && rect.height != null)
		{
			div.style.display = '';
			
			if (force || document.activeElement != width)
			{
				width.value = rect.width + ((rect.width == '') ? '' : ' pt');
			}
			
			if (force || document.activeElement != height)
			{
				height.value = rect.height + ((rect.height == '') ? '' : ' pt');
			}
		}
		else
		{
			div.style.display = 'none';
		}
		
		if (rect.vertices.length == graph.getSelectionCount() &&
			rect.x != null && rect.y != null)
		{
			div2.style.display = '';
			
			if (force || document.activeElement != left)
			{
				left.value = rect.x  + ((rect.x == '') ? '' : ' pt');
			}
			
			if (force || document.activeElement != top)
			{
				top.value = rect.y + ((rect.y == '') ? '' : ' pt');
			}
		}
		else
		{
			div2.style.display = 'none';
		}
	});

	this.addKeyHandler(left, listener);
	this.addKeyHandler(top, listener);

	graph.getModel().addListener(bpmEvent.CHANGE, listener);
	this.listeners.push({destroy: function() { graph.getModel().removeListener(listener); }});
	listener();
	
	leftUpdate = this.addGeometryHandler(left, function(geo, value)
	{
		if (geo.relative)
		{
			geo.offset.x = value;
		}
		else
		{
			geo.x = value;
		}
	});
	topUpdate = this.addGeometryHandler(top, function(geo, value)
	{
		if (geo.relative)
		{
			geo.offset.y = value;
		}
		else
		{
			geo.y = value;
		}
	});

	container.appendChild(div2);
};

/**
 * 
 */
ArrangePanel.prototype.addGeometryHandler = function(input, fn)
{
	var ui = this.editorUi;
	var graph = ui.editor.graph;
	var initialValue = null;
	
	function update(evt)
	{
		if (input.value != '')
		{
			var value = parseFloat(input.value);

			if (isNaN(value)) 
			{
				input.value = initialValue + ' pt';
			}
			else if (value != initialValue)
			{
				graph.getModel().beginUpdate();
				try
				{
					var cells = graph.getSelectionCells();
					
					for (var i = 0; i < cells.length; i++)
					{
						if (graph.getModel().isVertex(cells[i]))
						{
							var geo = graph.getCellGeometry(cells[i]);
							
							if (geo != null)
							{
								geo = geo.clone();
								fn(geo, value);
								
								graph.getModel().setGeometry(cells[i], geo);
							}
						}
					}
				}
				finally
				{
					graph.getModel().endUpdate();
				}
				
				initialValue = value;
				input.value = value + ' pt';
			}
		}
		
		bpmEvent.consume(evt);
	};

	bpmEvent.addListener(input, 'blur', update);
	bpmEvent.addListener(input, 'change', update);
	bpmEvent.addListener(input, 'focus', function()
	{
		initialValue = input.value;
	});
	
	return update;
};

ArrangePanel.prototype.addEdgeGeometryHandler = function(input, fn)
{
    var ui = this.editorUi;
    var graph = ui.editor.graph;
    var initialValue = null;

    function update(evt)
    {
        if (input.value != '')
        {
            var value = parseFloat(input.value);

            if (isNaN(value))
            {
                input.value = initialValue + ' pt';
            }
            else if (value != initialValue)
            {
                graph.getModel().beginUpdate();
                try
                {
                    var cells = graph.getSelectionCells();

                    for (var i = 0; i < cells.length; i++)
                    {
                        if (graph.getModel().isEdge(cells[i]))
                        {
                            var geo = graph.getCellGeometry(cells[i]);

                            if (geo != null)
                            {
                                geo = geo.clone();
                                fn(geo, value);

                                graph.getModel().setGeometry(cells[i], geo);
                            }
                        }
                    }
                }
                finally
                {
                    graph.getModel().endUpdate();
                }

                initialValue = value;
                input.value = value + ' pt';
            }
        }

        bpmEvent.consume(evt);
    };

    bpmEvent.addListener(input, 'blur', update);
    bpmEvent.addListener(input, 'change', update);
    bpmEvent.addListener(input, 'focus', function()
    {
        initialValue = input.value;
    });

    return update;
};

/**
 * 
 */
ArrangePanel.prototype.addEdgeGeometry = function(container)
{
	var ui = this.editorUi;
	var graph = ui.editor.graph;
	var rect = this.format.getSelectionState();
	
	var div = this.createPanel();
	
	var span = document.createElement('div');
	span.style.position = 'absolute';
	span.style.width = '70px';
	span.style.marginTop = '0px';
	span.style.fontWeight = 'bold';
	bpmUtils.write(span, bpmResources.get('width'));
	div.appendChild(span);

	var widthUpdate, xtUpdate, ytUpdate, xsUpdate, ysUpdate;
	var width = this.addUnitInput(div, 'pt', 20, 44, function()
	{
		widthUpdate.apply(this, arguments);
	});

	bpmUtils.br(div);
	this.addKeyHandler(width, listener);
	
	function widthUpdate(evt)
	{
		// Maximum stroke width is 999
		var value = parseInt(width.value);
		value = Math.min(999, Math.max(1, (isNaN(value)) ? 1 : value));
		
		if (value != bpmUtils.getValue(rect.style, 'width', bpmCellRenderer.defaultShapes['flexArrow'].prototype.defaultWidth))
		{
			graph.setCellStyles('width', value, graph.getSelectionCells());
			ui.fireEvent(new bpmEventObject('styleChanged', 'keys', ['width'],
					'values', [value], 'cells', graph.getSelectionCells()));
		}

		width.value = value + ' pt';
		bpmEvent.consume(evt);
	};

	bpmEvent.addListener(width, 'blur', widthUpdate);
	bpmEvent.addListener(width, 'change', widthUpdate);

	container.appendChild(div);

	var divs = this.createPanel();
	divs.style.paddingBottom = '30px';

	var span = document.createElement('div');
	span.style.position = 'absolute';
	span.style.width = '70px';
	span.style.marginTop = '0px';
	span.style.fontWeight = 'bold';
	bpmUtils.write(span, 'Start');
	divs.appendChild(span);

	var xs = this.addUnitInput(divs, 'pt', 84, 44, function()
	{
		xsUpdate.apply(this, arguments);
	});
	var ys = this.addUnitInput(divs, 'pt', 20, 44, function()
	{
		ysUpdate.apply(this, arguments);
	});

	bpmUtils.br(divs);
	this.addLabel(divs, bpmResources.get('left'), 84);
	this.addLabel(divs, bpmResources.get('top'), 20);
	container.appendChild(divs);
	this.addKeyHandler(xs, listener);
	this.addKeyHandler(ys, listener);

	var divt = this.createPanel();
	divt.style.paddingBottom = '30px';

	var span = document.createElement('div');
	span.style.position = 'absolute';
	span.style.width = '70px';
	span.style.marginTop = '0px';
	span.style.fontWeight = 'bold';
	bpmUtils.write(span, 'End');
	divt.appendChild(span);

	var xt = this.addUnitInput(divt, 'pt', 84, 44, function()
	{
		xtUpdate.apply(this, arguments);
	});
	var yt = this.addUnitInput(divt, 'pt', 20, 44, function()
	{
		ytUpdate.apply(this, arguments);
	});

	bpmUtils.br(divt);
	this.addLabel(divt, bpmResources.get('left'), 84);
	this.addLabel(divt, bpmResources.get('top'), 20);
	container.appendChild(divt);
	this.addKeyHandler(xt, listener);
	this.addKeyHandler(yt, listener);

	var listener = bpmUtils.bind(this, function(sender, evt, force)
	{
		rect = this.format.getSelectionState();
		var cell = graph.getSelectionCell();
		
		if (rect.style.shape == 'link' || rect.style.shape == 'flexArrow')
		{
			div.style.display = '';
			
			if (force || document.activeElement != width)
			{
				var value = bpmUtils.getValue(rect.style, 'width',
					bpmCellRenderer.defaultShapes['flexArrow'].prototype.defaultWidth);
				width.value = value + ' pt';
			}
		}
		else
		{
			div.style.display = 'none';
		}

		if (graph.getSelectionCount() == 1 && graph.model.isEdge(cell))
		{
			var geo = graph.model.getGeometry(cell);
			
			if (geo.sourcePoint != null && graph.model.getTerminal(cell, true) == null)
			{
				xs.value = geo.sourcePoint.x;
				ys.value = geo.sourcePoint.y;
			}
			else
			{
				divs.style.display = 'none';
			}
			
			if (geo.targetPoint != null && graph.model.getTerminal(cell, false) == null)
			{
				xt.value = geo.targetPoint.x;
				yt.value = geo.targetPoint.y;
			}
			else
			{
				divt.style.display = 'none';
			}
		}
		else
		{
			divs.style.display = 'none';
			divt.style.display = 'none';
		}
	});

	xsUpdate = this.addEdgeGeometryHandler(xs, function(geo, value)
	{
		geo.sourcePoint.x = value;
	});

	ysUpdate = this.addEdgeGeometryHandler(ys, function(geo, value)
	{
		geo.sourcePoint.y = value;
	});

	xtUpdate = this.addEdgeGeometryHandler(xt, function(geo, value)
	{
		geo.targetPoint.x = value;
	});

	ytUpdate = this.addEdgeGeometryHandler(yt, function(geo, value)
	{
		geo.targetPoint.y = value;
	});

	graph.getModel().addListener(bpmEvent.CHANGE, listener);
	this.listeners.push({destroy: function() { graph.getModel().removeListener(listener); }});
	listener();
};

DataBpmSchemePanel = function(format, editorUi, container, cell, title)
{
	this.cell = cell;
	this.title = title;
	BaseBpmSchemePanel.call(this, format, editorUi, container);
	this.init(cell);
};

bpmUtils.extend(DataBpmSchemePanel, BaseBpmSchemePanel);

DataBpmSchemePanel.prototype.init = function(cell)
{
	this.container.style.borderBottom = 'none';
	this.refresh(cell);
};

DataBpmSchemePanel.prototype.refresh = function(cell)
{
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;
	var container = this.container;
	var value = graph.getModel().getValue(cell);
	var ss = this.format.getSelectionState();
	var self = this;

	container.style.borderWidth = '1px';
	container.style.borderStyle = 'solid';
	container.style.borderColor = 'lightgrey';

	var titlediv = document.createElement('div');
	titlediv.style.padding = '5px';
	titlediv.style.display = "flex";
	titlediv.style.backgroundColor = '#e2e2e2';
	titlediv.style.marginTop = "10px";
	titlediv.style.alignItems = "center";

	var title = this.createTitle(self.title);
	title.style.paddingLeft = '18px';
	title.style.paddingTop = '10px';
	title.style.paddingBottom = '6px';
	title.style.height = '10px';

	titlediv.appendChild(title);

	var titlenodes = document.createElement('div');
	titlenodes.style.marginLeft = "10px";
	titlenodes.appendChild(document.createTextNode("Map the value(s) for inputs of the node"));

	titlediv.appendChild(titlenodes);
	container.appendChild(titlediv);

	var nodeDiv = document.createElement('div');
	nodeDiv.style.margin = "5px";
	nodeDiv.style.display = "flex";

	var inputsDiv = document.createElement('div');
	inputsDiv.style.width = '49%';
	inputsDiv.style.borderWidth = '1px 1px 1px 1px';
	inputsDiv.style.borderColor = "lightgrey";
	inputsDiv.style.borderStyle = "solid";
	inputsDiv.style.height = "300px";
	inputsDiv.style.overflow = "auto";
	var ul = document.createElement('ul');
	var dtree = $(ul);
	
	var inputtitle = document.createElement('div');
	inputtitle.style.backgroundImage = 'linear-gradient(0deg,#e2e2e2,#FFF)';
	inputtitle.style.display = "flex";
	inputtitle.style.alignItems = "center";

	var newinput = document.createElement('div');
	var newlabel = document.createElement('div');
	newlabel.style.textAlign = 'center';
	newlabel.style.fontWeight = 'bold';
	newlabel.style.fontSize = '12px';
	newlabel.style.cursor = 'pointer';
	newinput.style.display = "flex";

	bpmUtils.write(newlabel, 'Add item');

	newinput.appendChild(newlabel);
	newinput.style.marginLeft = "10px";
	newinput.style.color = "rgb(0,179,255)";
	newinput.style.padding = '5px';

	var dellabel = document.createElement('div');
	dellabel.style.textAlign = "center";
	dellabel.style.fontWeight = "bold";
	dellabel.style.fontSize = '12px';
	dellabel.style.cursor = "pointer";
	dellabel.style.float = "left";
	dellabel.style.marginLeft = "20px";
	dellabel.style.color = "red";

	bpmUtils.write(dellabel, 'Delete item');
	newinput.appendChild(dellabel);

	bpmEvent.addListener(dellabel,'click',function(){
		var node = dtree.jstree(true).get_selected()[0];

		if(node != null)
		{
			var prevID = $('#' + node).prev('li').attr('id');
			var nextID = $('#' + node).next('li').attr('id');
			dtree.jstree(true).delete_node(node);
			if(nextID != null)
				dtree.jstree("select_node", nextID, false);
			else if(prevID != null)
				dtree.jstree("select_node", prevID, false);
		}
	});

	bpmEvent.addListener(newlabel, 'click', function()
	{
		var selected = dtree.jstree('get_selected', true);

		var new_node = {
            "text":"undefined",
            "data":"0",
            "children":[{
                "text":"prop",
                "data":"0"
            }]
        };

        if(selected.length > 0)
        {
	        if(selected[0].parent != '#')
	        	new_node.children = null;
	        var selid = selected[0].id;
			var newid = dtree.jstree().create_node(selid, new_node, 'after');
			dtree.jstree("deselect_node", selected);
			dtree.jstree("select_node", newid, false);
        }
	});

	inputtitle.appendChild(newinput);
	inputsDiv.appendChild(inputtitle);
	inputsDiv.appendChild(ul);

	var names = [];
	var texts = [];
	var count = 0;

	var inproDiv = document.createElement('div');
	inproDiv.style.width = '48%';
	inproDiv.style.borderWidth = '1px 1px 1px 1px';
	inproDiv.style.borderColor = "lightgrey";
	inproDiv.style.borderStyle = "solid";
	inproDiv.style.marginLeft = "auto";
	inproDiv.style.height = "300px";

	var protitle = document.createElement('div');
	protitle.style.backgroundImage = 'linear-gradient(0deg,#e2e2e2,#FFF)';
	protitle.style.display = "flex";
	protitle.style.alignItems = "center";	
	protitle.style.padding = "5px";
	protitle.style.fontWeight = "bold";

	protitle.appendChild(document.createTextNode("Field Properties"));
	inproDiv.appendChild(protitle);

	var divform1 = document.createElement('div');
	divform1.style.display = "flex";
	divform1.style.margin = '10px 0px';
	divform1.style.alignItems = 'center';

	var label1 = document.createElement('label');
	label1.style.textAlign = "right";
	label1.style.width = "25%";
	label1.appendChild(document.createTextNode('Name'));

	var input1 = document.createElement('input');
	input1.style.marginLeft = "10px";
	input1.style.width = "50%";

	divform1.appendChild(label1);
	divform1.appendChild(input1);

	
	inproDiv.appendChild(divform1);

	var divform2 = document.createElement('div');
	divform2.style.display = "flex";
	divform2.style.margin = '10px 0px';
	divform2.style.alignItems = 'center';

	var label2 = document.createElement('label');
	label2.style.textAlign = "right";
	label2.style.width = "25%";
	label2.appendChild(document.createTextNode('ID'));
	label2.disabled = true;

	var input2 = document.createElement('input');
	input2.style.marginLeft = "10px";
	input2.style.width = "50%";

	divform2.appendChild(label2);
	divform2.appendChild(input2);

	
	inproDiv.appendChild(divform2);

	var divform3 = document.createElement('div');
	divform3.style.display = "flex";
	divform3.style.margin = '10px 0px';
	divform3.style.alignItems = 'center';

	var label3 = document.createElement('label');
	label3.style.textAlign = "right";
	label3.style.width = "25%";
	label3.style.visible = "false";

	var input3 = document.createElement('input');
	input3.style.marginLeft = "10px";
	input3.type = "hidden";

	divform3.appendChild(label3);
	divform3.appendChild(input3);

	inproDiv.appendChild(divform3);

	var divform4 = document.createElement('div');
	divform4.style.display = "flex";
	divform4.style.margin = '10px 0px';
	divform4.style.alignItems = 'center';

	var label4 = document.createElement('label');
	label4.style.textAlign = "right";
	label4.style.width = "25%";
	label4.appendChild(document.createTextNode('Value'));

	var input4 = document.createElement('input');
	input4.style.marginLeft = "10px";
	input4.style.width = "50%";

	divform4.appendChild(label4);
	divform4.appendChild(input4);	
	inproDiv.appendChild(divform4);

	var divform5 = document.createElement('div');
	divform5.style.display = "flex";
	divform5.style.margin = '10px 0px';
	divform5.style.alignItems = 'center';

	var label5 = document.createElement('label');
	label5.style.textAlign = "right";
	label5.style.width = "25%";
	label5.appendChild(document.createTextNode('Required'));

	var input5 = document.createElement('input');
	input5.style.marginLeft = "10px";
	input5.type = "checkbox"

	divform5.appendChild(label5);
	divform5.appendChild(input5);

	
	//inproDiv.appendChild(divform5);

	var divform6 = document.createElement('div');
	divform6.style.display = "flex";
	divform6.style.margin = '10px 0px';
	divform6.style.alignItems = 'center';

	var label6 = document.createElement('label');
	label6.style.textAlign = "right";
	label6.style.width = "25%";
	label6.appendChild(document.createTextNode('Save Info'));

	var input6 = document.createElement('input');
	input6.style.marginLeft = "10px";
	input6.style.width = "50%";

	divform6.appendChild(label6);
	divform6.appendChild(input6);

	var applyBtn = bpmUtils.button(bpmResources.get('apply'), function()
	{
		try
		{
			
			// Updates the value of the cell (undoable)
			var buf = [];
			var nid = input3.value;
			var data_buf = [];
			var data = null;
			var jdata = null;

			var node = dtree.jstree(true).get_selected()[0];
			jdata = dtree.jstree(true).get_json('#');

			if(node != null)
			{
				dtree.jstree('rename_node', node, input1.value);

				data = dtree.jstree(true).get_json('#',{flat:true});

				for(item in data)
				{
					var tval = data[item].data[0];
					if(node == data[item].id)
					{
						data[item].data = input4.value;
					}
					else
						data[item].data = tval;
				}

				dtree.jstree(true).settings.core.data = data;
				dtree.jstree(true).refresh(true);
			}

			var deleteItem = function(obj){
		        for(var k in obj)
		        {
					if(k == "children"){
						if(obj[k].length > 0){
							for(var i=0; i< obj[k].length; i++){
							 	deleteItem(obj[k][i])
							}
						}
						else
							delete obj[k];
					}
					else if(k == "data"){
						obj[k] = obj[k][0];
					}
					else if(k != "text" && k != "data" && k != "id"){
						delete obj[k];
					}
		        }
				if(obj['id'] == node)
					obj['data'] = input4.value;
		    }

			var OBJtoXML = function(obj) {
				var xml = '';
				for (var prop in obj) {
					xml += obj[prop] instanceof Array ? '' : "<" + prop + ">";
					if (obj[prop] instanceof Array) {
						for (var array in obj[prop]) {
							xml += "<" + prop + ">";
							xml += OBJtoXML(new Object(obj[prop][array]));
							xml += "</" + prop + ">";
						}
					} else if (typeof obj[prop] == "object") {
						xml += OBJtoXML(new Object(obj[prop]));
					} else {
						xml += obj[prop];
					}
					xml += obj[prop] instanceof Array ? '' : "</" + prop + ">";
				}
				var xml = xml.replace(/<\/?[0-9]{1,}>/g, '');
				return xml
			}	

	        var CreateMSXMLDocumentObject = function() {
	            if (typeof (ActiveXObject) != "undefined") {
	                var progIDs = [
	                                "Msxml2.DOMDocument.6.0", 
	                                "Msxml2.DOMDocument.5.0", 
	                                "Msxml2.DOMDocument.4.0", 
	                                "Msxml2.DOMDocument.3.0", 
	                                "MSXML2.DOMDocument", 
	                                "MSXML.DOMDocument"
	                              ];
	                for (var i = 0; i < progIDs.length; i++) {
	                    try { 
	                        return new ActiveXObject(progIDs[i]); 
	                    } catch(e) {};
	                }
	            }
	            return null;
	        }

	        var BuildXMLFromString = function(text) {
	            var message = "";
				var xmlDoc = null;
	            if (window.DOMParser) { // all browsers, except IE before version 9
	                var parser = new DOMParser();
	                try {
	                    xmlDoc = parser.parseFromString (text, "text/xml");
	                } catch (e) {
	                        // if text is not well-formed, 
	                        // it raises an exception in IE from version 9
	                    alert ("XML parsing error.");
	                    return false;
	                };
	            }
	            else {  // Internet Explorer before version 9
	                xmlDoc = CreateMSXMLDocumentObject ();
	                if (!xmlDoc) {
	                    alert ("Cannot create XMLDocument object");
	                    return false;
	                }

	                xmlDoc.loadXML (text);
	            }

	            var errorMsg = null;
	            if (xmlDoc.parseError && xmlDoc.parseError.errorCode != 0) {
	                errorMsg = "XML Parsing Error: " + xmlDoc.parseError.reason
	                          + " at line " + xmlDoc.parseError.line
	                          + " at position " + xmlDoc.parseError.linepos;
	            }
	            else {
	                if (xmlDoc.documentElement) {
	                    if (xmlDoc.documentElement.nodeName == "parsererror") {
	                        errorMsg = xmlDoc.documentElement.childNodes[0].nodeValue;
	                    }
	                }
	                else {
	                    errorMsg = "XML Parsing Error!";
	                }
	            }

	            if (errorMsg) {
	            	xmlDoc = null;
	                return xmlDoc;
	            }

	            return xmlDoc;
	        }

	        
			for(var i=0; i< jdata.length; i++){
			 	deleteItem(jdata[i])
			}
		
			var x2js = new X2JS();
			var value = graph.getModel().getValue(cell);
			var vbuf = [];
			if(value != '')
			{
				var cnt = 0;
				var len = value.children.length;
				while (value.hasChildNodes()) {  
					if(value.firstChild.nodeName.toUpperCase() == self.title)
				   	    value.removeChild(value.firstChild);
				   	cnt++;
				   	if(cnt >= len)
				   		break;
				} 					

				var xmlother = value.children;
				var jother = [];
				for(var ii in xmlother)
				{
					if(typeof xmlother[ii] == 'object')
			    	{
			    		jother.push(x2js.xml2json(xmlother[ii]));
			    	}
				}

				var jsonobj = {};
				jsonobj.object = {};
				jsonobj.object.general = {};
				jsonobj.object.setting = {};

				if(self.title == 'GENERAL')
				{
					jsonobj.object.general = jdata;
					jsonobj.object.setting = jother;
				}
				else
				{
					jsonobj.object.general = jother;
					jsonobj.object.setting = jdata;
				}

				var xmlDoc;
				// var xmldata = OBJtoXML(jsonobj);
			    var xmldata = x2js.json2xml_str(jsonobj);
            	xmlDoc = BuildXMLFromString (xmldata).children[0];
				value = xmlDoc;
			}
			else
			{
				var jsonobj = {};
				jsonobj.object = {};
				jsonobj.object.general = {};
				jsonobj.object.setting = {};
				var jother = {
		            "text":"undefined",
		            "data":"0",
		            "children":[{
		                "text":"prop",
		                "data":"0"
		            }]
		        };

				if(self.title == 'GENERAL')
				{
					jsonobj.object.general = jdata;
					jsonobj.object.setting = jother;
				}
				else
				{
					jsonobj.object.general = jother;
					jsonobj.object.setting = jdata;
				}

				var xmlDoc;
				// var xmldata = OBJtoXML(jsonobj);
			    var xmldata = x2js.json2xml_str(jsonobj);
            	xmlDoc = BuildXMLFromString (xmldata).children[0];
				value = xmlDoc;
			}
			graph.getModel().setValue(cell, value);
		}
		catch (e)
		{
			bpmUtils.alert(e);
		}
	});

	var checkobject = function(obj){
		if(!Array.isArray(obj))
		{
	        for(var k in obj)
	        {
				if(k == 'children'){
					if(!Array.isArray(obj[k]))
						obj[k] = [obj[k]];
					if(obj[k].length > 0){
						for(var i=0; i< obj[k].length; i++){
						 	checkobject(obj[k][i])
						}
					}
				}
	        }			
		}
		else
		{
	        for(var item in obj)
			 	checkobject(obj[item]);
		}
		return obj;
    }

	applyBtn.className = 'geBtn gePrimaryBtn';
	applyBtn.style.marginLeft = "auto";
	applyBtn.style.marginRight = "20%";
	
	var buttons = document.createElement('div');
	buttons.style.marginBottom = "10px";
	buttons.style.display = "flex";

	buttons.appendChild(applyBtn);
	
	//inproDiv.appendChild(divform6);
	inproDiv.appendChild(buttons);
	nodeDiv.appendChild(inputsDiv);
	nodeDiv.appendChild(inproDiv);


	var array = [];
	var index = 0;
	var data = value.childNodes;
	var jsonobj = null;
	var jsonbuf = null;

	if(data != null)
	{
		var x2js = new X2JS();
		jsonobj = x2js.xml2json(value);
		for(var k in jsonobj)
		{
			if(k.toUpperCase() == self.title){
				jsonbuf = checkobject(jsonobj[k]);
			}
		}
	}
	else
	{
		jsonbuf = {
            "text":"undefined",
            "data":"0",
            "children":[{
                "text":"prop",
                "data":"0"
            }]
        };
	}

	dtree.jstree({
		"plugins": ["dnd", "types"],
		"types":{
			"default":{
				"icon" : false
			}
		},
		core:{
			data:jsonbuf,
			'themes': {
                'name': 'proton',
                'responsive': true
            },
            'check_callback' : function(o,n,p,s,m){
            	// if(o == 'move_node' && n.parent == p.id)
            	// 	return true;
            	// else if(o == 'create_node')
            	// 	return true;
            	// else
            	// 	return false;
            	return true;
            }  
		}
    })
    .bind('select_node.jstree', function (node, ref_node) {
        // Flag it to be reloaded on reopen:
		var nodeobj = ref_node.node;
		input2.disabled = true;
		input1.value = nodeobj.text;
		input2.value = nodeobj.id;
		input4.value = nodeobj.data;
    });

	container.appendChild(nodeDiv);
};


/**
 * Adds the label menu items to the given menu and parent.
 */


GeneralBpmSchemePanel = function(format, editorUi, container)
{
	BaseBpmSchemePanel.call(this, format, editorUi, container);
	this.init();
};

bpmUtils.extend(GeneralBpmSchemePanel, BaseBpmSchemePanel);

GeneralBpmSchemePanel.prototype.init = function()
{
	this.container.style.borderBottom = 'none';
	// this.addFont(this.container);
};



/**
 * Adds the label menu items to the given menu and parent.
 */
TextBpmSchemePanel = function(format, editorUi, container)
{
	BaseBpmSchemePanel.call(this, format, editorUi, container);
	this.init();
};

bpmUtils.extend(TextBpmSchemePanel, BaseBpmSchemePanel);

/**
 * Adds the label menu items to the given menu and parent.
 */
TextBpmSchemePanel.prototype.init = function()
{
	this.container.style.borderBottom = 'none';
	this.addFont(this.container);
};

/**
 * Adds the label menu items to the given menu and parent.
 */
TextBpmSchemePanel.prototype.addFont = function(container)
{
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;
	var ss = this.format.getSelectionState();
	
	var title = this.createTitle(bpmResources.get('font'));
	title.style.paddingLeft = '18px';
	title.style.paddingTop = '10px';
	title.style.paddingBottom = '6px';
	container.appendChild(title);

	var stylePanel = this.createPanel();
	stylePanel.style.paddingTop = '2px';
	stylePanel.style.paddingBottom = '2px';
	stylePanel.style.position = 'relative';
	stylePanel.style.marginLeft = '-2px';
	stylePanel.style.borderWidth = '5px';
	stylePanel.className = 'mainToolbarContainer';
	stylePanel.style.display = 'flex';
	
	if (bpmCore.IS_QUIRKS)
	{
		stylePanel.style.display = 'block';
	}

	if (graph.cellEditor.isContentEditing())
	{
		var cssPanel = stylePanel.cloneNode();
		
		var cssMenu = this.editorUi.toolbar.addMenu(bpmResources.get('style'),
			bpmResources.get('style'), true, 'formatBlock', cssPanel, null, true);
		cssMenu.style.color = 'rgb(112, 112, 112)';
		cssMenu.style.whiteSpace = 'nowrap';
		cssMenu.style.overflow = 'hidden';
		cssMenu.style.margin = '0px';
		this.addArrow(cssMenu);
		cssMenu.style.width = '192px';
		cssMenu.style.height = '15px';
		
		var arrow = cssMenu.getElementsByTagName('div')[0];
		arrow.style.cssFloat = 'right';
		container.appendChild(cssPanel);
		
		// Workaround for offset in FF
		if (bpmCore.IS_FF)
		{
			cssMenu.getElementsByTagName('div')[0].style.marginTop = '-4px';
		}
	}
	
	container.appendChild(stylePanel);
	
	var colorPanel = this.createPanel();
	colorPanel.style.marginTop = '8px';
	colorPanel.style.borderTop = '1px solid #c0c0c0';
	colorPanel.style.paddingTop = '6px';
	colorPanel.style.paddingBottom = '6px';
	
	var fontMenu = this.editorUi.toolbar.addMenu('Helvetica', bpmResources.get('fontFamily'),
		true, 'fontFamily', stylePanel, null, true);
	fontMenu.style.color = 'rgb(112, 112, 112)';
	fontMenu.style.whiteSpace = 'nowrap';
	fontMenu.style.overflow = 'hidden';
	fontMenu.style.margin = '0px';
	
	this.addArrow(fontMenu);
	fontMenu.style.width = '192px';
	fontMenu.style.height = '15px';
	
	// Workaround for offset in FF
	if (bpmCore.IS_FF)
	{
		fontMenu.getElementsByTagName('div')[0].style.marginTop = '-4px';
	}
	
	var stylePanel2 = stylePanel.cloneNode(false);
	stylePanel2.style.marginLeft = '-3px';
	var fontStyleItems = this.editorUi.toolbar.addItems(['bold', 'italic', 'underline'], stylePanel2, true);
	fontStyleItems[0].setAttribute('title', bpmResources.get('bold') + ' (' + this.editorUi.actions.get('bold').shortcut + ')');
	fontStyleItems[1].setAttribute('title', bpmResources.get('italic') + ' (' + this.editorUi.actions.get('italic').shortcut + ')');
	fontStyleItems[2].setAttribute('title', bpmResources.get('underline') + ' (' + this.editorUi.actions.get('underline').shortcut + ')');
	
	var verticalItem = this.editorUi.toolbar.addItems(['vertical'], stylePanel2, true)[0];
	
	if (bpmCore.IS_QUIRKS)
	{
		bpmUtils.br(container);
	}
	
	container.appendChild(stylePanel2);

	this.styleButtons(fontStyleItems);
	this.styleButtons([verticalItem]);
	
	var stylePanel3 = stylePanel.cloneNode(false);
	stylePanel3.style.marginLeft = '-3px';
	stylePanel3.style.paddingBottom = '0px';
	
	// Helper function to return a wrapper function does not pass any arguments
	var callFn = function(fn)
	{
		return function()
		{
			return fn();
		};
	};
	
	var left = this.editorUi.toolbar.addButton('geSprite-left', bpmResources.get('left'),
		(graph.cellEditor.isContentEditing()) ?
		function(evt)
		{
			graph.cellEditor.alignText(bpmConstants.ALIGN_LEFT, evt);
		} : callFn(this.editorUi.menus.createStyleChangeFunction([bpmConstants.STYLE_ALIGN], [bpmConstants.ALIGN_LEFT])), stylePanel3);
	var center = this.editorUi.toolbar.addButton('geSprite-center', bpmResources.get('center'),
		(graph.cellEditor.isContentEditing()) ?
		function(evt)
		{
			graph.cellEditor.alignText(bpmConstants.ALIGN_CENTER, evt);
		} : callFn(this.editorUi.menus.createStyleChangeFunction([bpmConstants.STYLE_ALIGN], [bpmConstants.ALIGN_CENTER])), stylePanel3);
	var right = this.editorUi.toolbar.addButton('geSprite-right', bpmResources.get('right'),
		(graph.cellEditor.isContentEditing()) ?
		function(evt)
		{
			graph.cellEditor.alignText(bpmConstants.ALIGN_RIGHT, evt);
		} : callFn(this.editorUi.menus.createStyleChangeFunction([bpmConstants.STYLE_ALIGN], [bpmConstants.ALIGN_RIGHT])), stylePanel3);

	this.styleButtons([left, center, right]);
	
	// Quick hack for strikethrough
	// TODO: Add translations and toggle state
	if (graph.cellEditor.isContentEditing())
	{
		var strike = this.editorUi.toolbar.addButton('geSprite-removeformat', bpmResources.get('strikethrough'),
			function()
			{
				document.execCommand('strikeThrough', false, null);
			}, stylePanel2);
		this.styleButtons([strike]);

		strike.firstChild.style.background = 'url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCI+PGRlZnM+PHBhdGggaWQ9ImEiIGQ9Ik0wIDBoMjR2MjRIMFYweiIvPjwvZGVmcz48Y2xpcFBhdGggaWQ9ImIiPjx1c2UgeGxpbms6aHJlZj0iI2EiIG92ZXJmbG93PSJ2aXNpYmxlIi8+PC9jbGlwUGF0aD48cGF0aCBjbGlwLXBhdGg9InVybCgjYikiIGZpbGw9IiMwMTAxMDEiIGQ9Ik03LjI0IDguNzVjLS4yNi0uNDgtLjM5LTEuMDMtLjM5LTEuNjcgMC0uNjEuMTMtMS4xNi40LTEuNjcuMjYtLjUuNjMtLjkzIDEuMTEtMS4yOS40OC0uMzUgMS4wNS0uNjMgMS43LS44My42Ni0uMTkgMS4zOS0uMjkgMi4xOC0uMjkuODEgMCAxLjU0LjExIDIuMjEuMzQuNjYuMjIgMS4yMy41NCAxLjY5Ljk0LjQ3LjQuODMuODggMS4wOCAxLjQzLjI1LjU1LjM4IDEuMTUuMzggMS44MWgtMy4wMWMwLS4zMS0uMDUtLjU5LS4xNS0uODUtLjA5LS4yNy0uMjQtLjQ5LS40NC0uNjgtLjItLjE5LS40NS0uMzMtLjc1LS40NC0uMy0uMS0uNjYtLjE2LTEuMDYtLjE2LS4zOSAwLS43NC4wNC0xLjAzLjEzLS4yOS4wOS0uNTMuMjEtLjcyLjM2LS4xOS4xNi0uMzQuMzQtLjQ0LjU1LS4xLjIxLS4xNS40My0uMTUuNjYgMCAuNDguMjUuODguNzQgMS4yMS4zOC4yNS43Ny40OCAxLjQxLjdINy4zOWMtLjA1LS4wOC0uMTEtLjE3LS4xNS0uMjV6TTIxIDEydi0ySDN2Mmg5LjYyYy4xOC4wNy40LjE0LjU1LjIuMzcuMTcuNjYuMzQuODcuNTEuMjEuMTcuMzUuMzYuNDMuNTcuMDcuMi4xMS40My4xMS42OSAwIC4yMy0uMDUuNDUtLjE0LjY2LS4wOS4yLS4yMy4zOC0uNDIuNTMtLjE5LjE1LS40Mi4yNi0uNzEuMzUtLjI5LjA4LS42My4xMy0xLjAxLjEzLS40MyAwLS44My0uMDQtMS4xOC0uMTNzLS42Ni0uMjMtLjkxLS40MmMtLjI1LS4xOS0uNDUtLjQ0LS41OS0uNzUtLjE0LS4zMS0uMjUtLjc2LS4yNS0xLjIxSDYuNGMwIC41NS4wOCAxLjEzLjI0IDEuNTguMTYuNDUuMzcuODUuNjUgMS4yMS4yOC4zNS42LjY2Ljk4LjkyLjM3LjI2Ljc4LjQ4IDEuMjIuNjUuNDQuMTcuOS4zIDEuMzguMzkuNDguMDguOTYuMTMgMS40NC4xMy44IDAgMS41My0uMDkgMi4xOC0uMjhzMS4yMS0uNDUgMS42Ny0uNzljLjQ2LS4zNC44Mi0uNzcgMS4wNy0xLjI3cy4zOC0xLjA3LjM4LTEuNzFjMC0uNi0uMS0xLjE0LS4zMS0xLjYxLS4wNS0uMTEtLjExLS4yMy0uMTctLjMzSDIxeiIvPjwvc3ZnPg==)';
		strike.firstChild.style.backgroundPosition = '2px 2px';
		strike.firstChild.style.backgroundSize = '18px 18px';

		this.styleButtons([strike]);
	}
	
	var top = this.editorUi.toolbar.addButton('geSprite-top', bpmResources.get('top'),
		callFn(this.editorUi.menus.createStyleChangeFunction([bpmConstants.STYLE_VERTICAL_ALIGN], [bpmConstants.ALIGN_TOP])), stylePanel3);
	var middle = this.editorUi.toolbar.addButton('geSprite-middle', bpmResources.get('middle'),
		callFn(this.editorUi.menus.createStyleChangeFunction([bpmConstants.STYLE_VERTICAL_ALIGN], [bpmConstants.ALIGN_MIDDLE])), stylePanel3);
	var bottom = this.editorUi.toolbar.addButton('geSprite-bottom', bpmResources.get('bottom'),
		callFn(this.editorUi.menus.createStyleChangeFunction([bpmConstants.STYLE_VERTICAL_ALIGN], [bpmConstants.ALIGN_BOTTOM])), stylePanel3);
	
	this.styleButtons([top, middle, bottom]);
	
	if (bpmCore.IS_QUIRKS)
	{
		bpmUtils.br(container);
	}
	
	container.appendChild(stylePanel3);
	
	// Hack for updating UI state below based on current text selection
	// currentTable is the current selected DOM table updated below
	var sub, sup, full, tableWrapper, currentTable, tableCell, tableRow;
	
	if (graph.cellEditor.isContentEditing())
	{
		top.style.display = 'none';
		middle.style.display = 'none';
		bottom.style.display = 'none';
		verticalItem.style.display = 'none';
		
		full = this.editorUi.toolbar.addButton('geSprite-justifyfull', bpmResources.get('block'),
			function()
			{
				if (full.style.opacity == 1)
				{
					document.execCommand('justifyfull', false, null);
				}
			}, stylePanel3);
		full.style.marginRight = '9px';
		full.style.opacity = 1;

		this.styleButtons([full,
       		sub = this.editorUi.toolbar.addButton('geSprite-subscript',
       			bpmResources.get('subscript') + ' (' + BpmDraw.ctrlKey + '+,)',
			function()
			{
				document.execCommand('subscript', false, null);
			}, stylePanel3), sup = this.editorUi.toolbar.addButton('geSprite-superscript',
				bpmResources.get('superscript') + ' (' + BpmDraw.ctrlKey + '+.)',
			function()
			{
				document.execCommand('superscript', false, null);
			}, stylePanel3)]);
		
		var tmp = stylePanel3.cloneNode(false);
		tmp.style.paddingTop = '4px';
		var btns = [this.editorUi.toolbar.addButton('geSprite-orderedlist', bpmResources.get('numberedList'),
				function()
				{
					document.execCommand('insertorderedlist', false, null);
				}, tmp),
			this.editorUi.toolbar.addButton('geSprite-unorderedlist', bpmResources.get('bulletedList'),
				function()
				{
					document.execCommand('insertunorderedlist', false, null);
				}, tmp),
			this.editorUi.toolbar.addButton('geSprite-outdent', bpmResources.get('decreaseIndent'),
				function()
				{
					document.execCommand('outdent', false, null);
				}, tmp),
			this.editorUi.toolbar.addButton('geSprite-indent', bpmResources.get('increaseIndent'),
				function()
				{
					document.execCommand('indent', false, null);
				}, tmp),
			this.editorUi.toolbar.addButton('geSprite-removeformat', bpmResources.get('removeBpmScheme'),
				function()
				{
					document.execCommand('removeformat', false, null);
				}, tmp),
			this.editorUi.toolbar.addButton('geSprite-code', bpmResources.get('html'),
				function()
				{
					graph.cellEditor.toggleViewMode();
				}, tmp)];
		this.styleButtons(btns);
		btns[btns.length - 2].style.marginLeft = '9px';
		
		if (bpmCore.IS_QUIRKS)
		{
			bpmUtils.br(container);
			tmp.style.height = '40';
		}
		
		container.appendChild(tmp);
	}
	else
	{
		fontStyleItems[2].style.marginRight = '9px';
		right.style.marginRight = '9px';
	}
	
	// Label position
	var stylePanel4 = stylePanel.cloneNode(false);
	stylePanel4.style.marginLeft = '0px';
	stylePanel4.style.paddingTop = '8px';
	stylePanel4.style.paddingBottom = '4px';
	stylePanel4.style.fontWeight = 'normal';
	
	bpmUtils.write(stylePanel4, bpmResources.get('position'));
	
	// Adds label position options
	var positionSelect = document.createElement('select');
	positionSelect.style.position = 'absolute';
	positionSelect.style.right = '20px';
	positionSelect.style.width = '97px';
	positionSelect.style.marginTop = '-2px';
	
	var directions = ['topLeft', 'top', 'topRight', 'left', 'center', 'right', 'bottomLeft', 'bottom', 'bottomRight'];
	var lset = {'topLeft': [bpmConstants.ALIGN_LEFT, bpmConstants.ALIGN_TOP, bpmConstants.ALIGN_RIGHT, bpmConstants.ALIGN_BOTTOM],
			'top': [bpmConstants.ALIGN_CENTER, bpmConstants.ALIGN_TOP, bpmConstants.ALIGN_CENTER, bpmConstants.ALIGN_BOTTOM],
			'topRight': [bpmConstants.ALIGN_RIGHT, bpmConstants.ALIGN_TOP, bpmConstants.ALIGN_LEFT, bpmConstants.ALIGN_BOTTOM],
			'left': [bpmConstants.ALIGN_LEFT, bpmConstants.ALIGN_MIDDLE, bpmConstants.ALIGN_RIGHT, bpmConstants.ALIGN_MIDDLE],
			'center': [bpmConstants.ALIGN_CENTER, bpmConstants.ALIGN_MIDDLE, bpmConstants.ALIGN_CENTER, bpmConstants.ALIGN_MIDDLE],
			'right': [bpmConstants.ALIGN_RIGHT, bpmConstants.ALIGN_MIDDLE, bpmConstants.ALIGN_LEFT, bpmConstants.ALIGN_MIDDLE],
			'bottomLeft': [bpmConstants.ALIGN_LEFT, bpmConstants.ALIGN_BOTTOM, bpmConstants.ALIGN_RIGHT, bpmConstants.ALIGN_TOP],
			'bottom': [bpmConstants.ALIGN_CENTER, bpmConstants.ALIGN_BOTTOM, bpmConstants.ALIGN_CENTER, bpmConstants.ALIGN_TOP],
			'bottomRight': [bpmConstants.ALIGN_RIGHT, bpmConstants.ALIGN_BOTTOM, bpmConstants.ALIGN_LEFT, bpmConstants.ALIGN_TOP]};

	for (var i = 0; i < directions.length; i++)
	{
		var positionOption = document.createElement('option');
		positionOption.setAttribute('value', directions[i]);
		bpmUtils.write(positionOption, bpmResources.get(directions[i]));
		positionSelect.appendChild(positionOption);
	}

	stylePanel4.appendChild(positionSelect);
	
	// Writing direction
	var stylePanel5 = stylePanel.cloneNode(false);
	stylePanel5.style.marginLeft = '0px';
	stylePanel5.style.paddingTop = '4px';
	stylePanel5.style.paddingBottom = '4px';
	stylePanel5.style.fontWeight = 'normal';

	bpmUtils.write(stylePanel5, bpmResources.get('writingDirection'));
	
	// Adds writing direction options
	// LATER: Handle reselect of same option in all selects (change event
	// is not fired for same option so have opened state on click) and
	// handle multiple different styles for current selection
	var dirSelect = document.createElement('select');
	dirSelect.style.position = 'absolute';
	dirSelect.style.right = '20px';
	dirSelect.style.width = '97px';
	dirSelect.style.marginTop = '-2px';

	// NOTE: For automatic we use the value null since automatic
	// requires the text to be non formatted and non-wrapped
	var dirs = ['automatic', 'leftToRight', 'rightToLeft'];
	var dirSet = {'automatic': null,
			'leftToRight': bpmConstants.TEXT_DIRECTION_LTR,
			'rightToLeft': bpmConstants.TEXT_DIRECTION_RTL};

	for (var i = 0; i < dirs.length; i++)
	{
		var dirOption = document.createElement('option');
		dirOption.setAttribute('value', dirs[i]);
		bpmUtils.write(dirOption, bpmResources.get(dirs[i]));
		dirSelect.appendChild(dirOption);
	}

	stylePanel5.appendChild(dirSelect);
	
	if (!graph.isEditing())
	{
		container.appendChild(stylePanel4);
		
		bpmEvent.addListener(positionSelect, 'change', function(evt)
		{
			graph.getModel().beginUpdate();
			try
			{
				var vals = lset[positionSelect.value];
				
				if (vals != null)
				{
					graph.setCellStyles(bpmConstants.STYLE_LABEL_POSITION, vals[0], graph.getSelectionCells());
					graph.setCellStyles(bpmConstants.STYLE_VERTICAL_LABEL_POSITION, vals[1], graph.getSelectionCells());
					graph.setCellStyles(bpmConstants.STYLE_ALIGN, vals[2], graph.getSelectionCells());
					graph.setCellStyles(bpmConstants.STYLE_VERTICAL_ALIGN, vals[3], graph.getSelectionCells());
				}
			}
			finally
			{
				graph.getModel().endUpdate();
			}
			
			bpmEvent.consume(evt);
		});

		// LATER: Update dir in text editor while editing and update style with label
		// NOTE: The tricky part is handling and passing on the auto value
		container.appendChild(stylePanel5);
		
		bpmEvent.addListener(dirSelect, 'change', function(evt)
		{
			graph.setCellStyles(bpmConstants.STYLE_TEXT_DIRECTION, dirSet[dirSelect.value], graph.getSelectionCells());
			bpmEvent.consume(evt);
		});
	}

	// Font size
	var input = document.createElement('input');
	input.style.textAlign = 'right';
	input.style.marginTop = '4px';
	
	if (!bpmCore.IS_QUIRKS)
	{
		input.style.position = 'absolute';
		input.style.right = '32px';
	}
	
	input.style.width = '46px';
	input.style.height = (bpmCore.IS_QUIRKS) ? '21px' : '17px';
	stylePanel2.appendChild(input);
	
	// Workaround for font size 4 if no text is selected is update font size below
	// after first character was entered (as the font element is lazy created)
	var pendingFontSize = null;

	var inputUpdate = this.installInputHandler(input, bpmConstants.STYLE_FONTSIZE, Menus.prototype.defaultFontSize, 1, 999, ' pt',
	function(fontSize)
	{
		// IE does not support containsNode
		// KNOWN: Fixes font size issues but bypasses undo
		if (window.getSelection && !bpmCore.IS_IE && !bpmCore.IS_IE11)
		{
			var selection = window.getSelection();
			var container = (selection.rangeCount > 0) ? selection.getRangeAt(0).commonAncestorContainer :
				graph.cellEditor.textarea;

			function updateSize(elt, ignoreContains)
			{
				if (graph.cellEditor.textarea != null && elt != graph.cellEditor.textarea &&
					graph.cellEditor.textarea.contains(elt) &&
					(ignoreContains || selection.containsNode(elt, true)))
				{
					if (elt.nodeName == 'FONT')
					{
						elt.removeAttribute('size');
						elt.style.fontSize = fontSize + 'px';
					}
					else
					{
						var css = bpmUtils.getCurrentStyle(elt);
						
						if (css.fontSize != fontSize + 'px')
						{
							if (bpmUtils.getCurrentStyle(elt.parentNode).fontSize != fontSize + 'px')
							{
								elt.style.fontSize = fontSize + 'px';
							}
							else
							{
								elt.style.fontSize = '';
							}
						}
					}
				}
			};
			
			// Wraps text node or mixed selection with leading text in a font element
			if (container == graph.cellEditor.textarea ||
				container.nodeType != bpmConstants.NODETYPE_ELEMENT)
			{
				document.execCommand('fontSize', false, '1');
			}

			if (container != graph.cellEditor.textarea)
			{
				container = container.parentNode;
			}
			
			if (container != null && container.nodeType == bpmConstants.NODETYPE_ELEMENT)
			{
				var elts = container.getElementsByTagName('*');
				updateSize(container);
				
				for (var i = 0; i < elts.length; i++)
				{
					updateSize(elts[i]);
				}
			}

			input.value = fontSize + ' pt';
		}
		else if (window.getSelection || document.selection)
		{
			// Checks selection
			var par = null;
			
			if (document.selection)
			{
				par = document.selection.createRange().parentElement();
			}
			else
			{
				var selection = window.getSelection();
				
				if (selection.rangeCount > 0)
				{
					par = selection.getRangeAt(0).commonAncestorContainer;
				}
			}
			
			// Node.contains does not work for text nodes in IE11
			function isOrContains(container, node)
			{
			    while (node != null)
			    {
			        if (node === container)
			        {
			            return true;
			        }
			        
			        node = node.parentNode;
			    }
			    
			    return false;
			};
			
			if (par != null && isOrContains(graph.cellEditor.textarea, par))
			{
				pendingFontSize = fontSize;
				
				// Workaround for can't set font size in px is to change font size afterwards
				document.execCommand('fontSize', false, '4');
				var elts = graph.cellEditor.textarea.getElementsByTagName('font');
				
				for (var i = 0; i < elts.length; i++)
				{
					if (elts[i].getAttribute('size') == '4')
					{
						elts[i].removeAttribute('size');
						elts[i].style.fontSize = pendingFontSize + 'px';
			
						// Overrides fontSize in input with the one just assigned as a workaround
						// for potential fontSize values of parent elements that don't match
						window.setTimeout(function()
						{
							input.value = pendingFontSize + ' pt';
							pendingFontSize = null;
						}, 0);
						
						break;
					}
				}
			}
		}
	}, true);
	
	input.style.marginLeft = 'auto';
	input.style.position = '';
	var stepper = this.createStepper(input, inputUpdate, 1, 10, true, Menus.prototype.defaultFontSize);
	stepper.style.display = input.style.display;
	stepper.style.marginTop = '4px';

	
	if (!bpmCore.IS_QUIRKS)
	{
		stepper.style.right = '20px';
	}
	
	stylePanel2.appendChild(stepper);
	
	var arrow = fontMenu.getElementsByTagName('div')[0];
	arrow.style.cssFloat = 'right';
	
	var bgColorApply = null;
	var currentBgColor = '#ffffff';
	
	var fontColorApply = null;
	var currentFontColor = '#000000';
		
	var bgPanel = (graph.cellEditor.isContentEditing()) ? this.createColorOption(bpmResources.get('backgroundColor'), function()
	{
		return currentBgColor;
	}, function(color)
	{
		document.execCommand('backcolor', false, (color != bpmConstants.NONE) ? color : 'transparent');
	}, '#ffffff',
	{
		install: function(apply) { bgColorApply = apply; },
		destroy: function() { bgColorApply = null; }
	}, null, true) : this.createCellColorOption(bpmResources.get('backgroundColor'), bpmConstants.STYLE_LABEL_BACKGROUNDCOLOR, '#ffffff', null, function(color)
	{
		graph.updateLabelElements(graph.getSelectionCells(), function(elt)
		{
			elt.style.backgroundColor = null;
		});
	});
	bgPanel.style.fontWeight = 'bold';

	var borderPanel = this.createCellColorOption(bpmResources.get('borderColor'), bpmConstants.STYLE_LABEL_BORDERCOLOR, '#000000');
	borderPanel.style.fontWeight = 'bold';
	
	var panel = (graph.cellEditor.isContentEditing()) ? this.createColorOption(bpmResources.get('fontColor'), function()
	{
		return currentFontColor;
	}, function(color)
	{
		if (bpmCore.IS_FF)
		{
			// Workaround for Firefox that adds the font element around
			// anchor elements which ignore inherited colors is to move
			// the font element inside anchor elements
			var tmp = graph.cellEditor.textarea.getElementsByTagName('font');
			var oldFonts = [];

			for (var i = 0; i < tmp.length; i++)
			{
				oldFonts.push(
				{
					node: tmp[i],
					color: tmp[i].getAttribute('color')
				});
			}

			document.execCommand('forecolor', false, (color != bpmConstants.NONE) ?
				color : 'transparent');

			// Finds the new or changed font element
			var newFonts = graph.cellEditor.textarea.getElementsByTagName('font');

			for (var i = 0; i < newFonts.length; i++)
			{
				if (i >= oldFonts.length || newFonts[i] != oldFonts[i].node ||
					(newFonts[i] == oldFonts[i].node &&
						newFonts[i].getAttribute('color') != oldFonts[i].color))
				{
					var child = newFonts[i].firstChild;

					// Moves the font element to inside the anchor element and adopts all children
					if (child != null && child.nodeName == 'A' && child.nextSibling ==
						null &&
						child.firstChild != null)
					{
						var parent = newFonts[i].parentNode;
						parent.insertBefore(child, newFonts[i]);
						var tmp = child.firstChild;

						while (tmp != null)
						{
							var next = tmp.nextSibling;
							newFonts[i].appendChild(tmp);
							tmp = next;
						}

						child.appendChild(newFonts[i]);
					}

					break;
				}
			}
		}
		else
		{
			document.execCommand('forecolor', false, (color != bpmConstants.NONE) ?
				color : 'transparent');
		}
	}, '#000000',
	{
		install: function(apply) { fontColorApply = apply; },
		destroy: function() { fontColorApply = null; }
	}, null, true) : this.createCellColorOption(bpmResources.get('fontColor'), bpmConstants.STYLE_FONTCOLOR, '#000000', function(color)
	{
		if (color == null || color == bpmConstants.NONE)
		{
			bgPanel.style.display = 'none';
		}
		else
		{
			bgPanel.style.display = 'flex';
		}
		
		borderPanel.style.display = bgPanel.style.display;
	}, function(color)
	{
		if (color == null || color == bpmConstants.NONE)
		{
			graph.setCellStyles(bpmConstants.STYLE_NOLABEL, '1', graph.getSelectionCells());
		}
		else
		{
			graph.setCellStyles(bpmConstants.STYLE_NOLABEL, null, graph.getSelectionCells());
		}

		graph.updateLabelElements(graph.getSelectionCells(), function(elt)
		{
			elt.removeAttribute('color');
			elt.style.color = null;
		});
	});
	panel.style.fontWeight = 'bold';
	
	colorPanel.appendChild(panel);
	colorPanel.appendChild(bgPanel);
	
	if (!graph.cellEditor.isContentEditing())
	{
		colorPanel.appendChild(borderPanel);
	}
	
	container.appendChild(colorPanel);

	var extraPanel = this.createPanel();
	extraPanel.style.paddingTop = '2px';
	extraPanel.style.paddingBottom = '4px';
	
	// LATER: Fix toggle using '' instead of 'null'
	var wwOpt = this.createCellOption(bpmResources.get('wordWrap'), bpmConstants.STYLE_WHITE_SPACE, null, 'wrap', 'null', null, null, true);
	wwOpt.style.fontWeight = 'bold';
	
	// Word wrap in edge labels only supported via labelWidth style
	if (!ss.containsLabel && !ss.autoSize && ss.edges.length == 0)
	{
		extraPanel.appendChild(wwOpt);
	}
	
	// Delegates switch of style to formattedText action as it also convertes newlines
	var htmlOpt = this.createCellOption(bpmResources.get('formattedText'), 'html', '0',
		null, null, null, ui.actions.get('formattedText'));
	htmlOpt.style.fontWeight = 'bold';
	extraPanel.appendChild(htmlOpt);
	
	var spacingPanel = this.createPanel();
	spacingPanel.style.paddingTop = '10px';
	spacingPanel.style.paddingBottom = '28px';
	spacingPanel.style.fontWeight = 'normal';
	
	var span = document.createElement('div');
	// span.style.position = 'absolute';
	span.style.width = '70px';
	span.style.marginTop = '0px';
	span.style.fontWeight = 'bold';
	bpmUtils.write(span, bpmResources.get('spacing'));
	spacingPanel.appendChild(span);

	var spacingdiv = document.createElement('div');
	var topUpdate, globalUpdate, leftUpdate, bottomUpdate, rightUpdate;

	var topdiv = document.createElement('div');
	topdiv.style.padding = '10px';
	var topSpacing = this.addUnitInput(topdiv, 'pt', 91, 44, function()
	{
		topUpdate.apply(this, arguments);
	});
	var c = topdiv.children;
	var st = c[0].getAttribute('style') + ' height: 18px !important;' +  ' margin-left: unset !important;';
	c[0].setAttribute('style', st);
	st = c[1].getAttribute('style') + ' height: 18px !important;' + ' margin-left: unset !important;';
	c[1].setAttribute('style', st);

	var topLabel = document.createElement('div');
	bpmUtils.write(topLabel, bpmResources.get('top'));
	topLabel.style.width = '61px';
	topLabel.style.marginTop = '6px';
	topLabel.style.textAlign = 'center';
	topLabel.style.marginTop = '26px';
	topLabel.style.marginLeft = '-70px';
	topdiv.appendChild(topLabel);
	bpmUtils.br(topdiv);

	var globaldiv = document.createElement('div');
	globaldiv.style.padding = '10px';
	var globalSpacing = this.addUnitInput(globaldiv, 'pt', 20, 44, function()
	{
		globalUpdate.apply(this, arguments);
	});
	var c = globaldiv.children;
	var st = c[0].getAttribute('style') + ' height: 18px !important;' + ' margin-left: unset !important;';
	c[0].setAttribute('style', st);
	st = c[1].getAttribute('style') + ' height: 18px !important;' + ' margin-left: unset !important;';
	c[1].setAttribute('style', st);

	var globalLabel = document.createElement('div');
	bpmUtils.write(globalLabel, bpmResources.get('global'));
	globalLabel.style.width = '61px';
	globalLabel.style.marginTop = '6px';
	globalLabel.style.textAlign = 'center';
	globalLabel.style.marginTop = '26px';
	globalLabel.style.marginLeft = '-68px';
	globaldiv.appendChild(globalLabel);
	bpmUtils.br(globaldiv);
	globaldiv.style.marginLeft = 'auto';
	bpmUtils.br(spacingdiv);
	spacingdiv.appendChild(topdiv);
	spacingdiv.appendChild(globaldiv);
	spacingdiv.style.display = 'flex';
	spacingPanel.appendChild(spacingdiv);

	var lbrdiv = document.createElement('div');
	lbrdiv.style.padding = '10px';
	lbrdiv.style.display = 'flex';
	var leftdiv = document.createElement('div');
	var leftSpacing = this.addUnitInput(leftdiv, 'pt', 162, 44, function()
	{
		leftUpdate.apply(this, arguments);
	});
	var c = leftdiv.children;
	var st = c[0].getAttribute('style') + ' height: 18px !important;' + ' margin-left: unset !important;';
	c[0].setAttribute('style', st);
	st = c[1].getAttribute('style') + ' height: 18px !important;' + ' margin-left: unset !important;';
	c[1].setAttribute('style', st);

	var leftLabel = document.createElement('div');
	bpmUtils.write(leftLabel, bpmResources.get('left'));
	leftLabel.style.width = '61px';
	leftLabel.style.marginTop = '6px';
	leftLabel.style.textAlign = 'center';
	leftLabel.style.marginTop = '26px';
	leftLabel.style.marginLeft = '-68px';
	leftdiv.appendChild(leftLabel);
	lbrdiv.appendChild(leftdiv);


	var bottomdiv = document.createElement('div');
	bottomdiv.style.margin = 'auto';
	var bottomSpacing = this.addUnitInput(bottomdiv, 'pt', 91, 44, function()
	{
		bottomUpdate.apply(this, arguments);
	});
	var c = bottomdiv.children;
	var st = c[0].getAttribute('style') + ' height: 18px !important;' + ' margin-left: unset !important;';
	c[0].setAttribute('style', st);
	st = c[1].getAttribute('style') + ' height: 18px !important;' + ' margin-left: unset !important;';
	c[1].setAttribute('style', st);

	var bottomLabel = document.createElement('div');
	bpmUtils.write(bottomLabel, bpmResources.get('bottom'));
	bottomLabel.style.width = '61px';
	bottomLabel.style.marginTop = '6px';
	bottomLabel.style.textAlign = 'center';
	bottomLabel.style.marginTop = '26px';
	bottomLabel.style.marginLeft = '-68px';
	bottomdiv.appendChild(bottomLabel);
	lbrdiv.appendChild(bottomdiv);

	var rightdiv = document.createElement('div');
	var rightSpacing = this.addUnitInput(rightdiv, 'pt', 20, 44, function()
	{
		rightUpdate.apply(this, arguments);
	});
	var c = rightdiv.children;
	var st = c[0].getAttribute('style') + ' height: 18px !important;' + ' margin-left: unset !important;';
	c[0].setAttribute('style', st);
	st = c[1].getAttribute('style') + ' height: 18px !important;' + ' margin-left: unset !important;';
	c[1].setAttribute('style', st);

	var rightLabel = document.createElement('div');
	bpmUtils.write(rightLabel, bpmResources.get('right'));
	rightLabel.style.width = '61px';
	rightLabel.style.marginTop = '6px';
	rightLabel.style.textAlign = 'center';
	rightLabel.style.marginTop = '26px';
	rightLabel.style.marginLeft = '-68px';
	rightdiv.appendChild(rightLabel);
	lbrdiv.appendChild(rightdiv);

	bpmUtils.br(lbrdiv);
	spacingPanel.appendChild(lbrdiv);

	
	if (!graph.cellEditor.isContentEditing())
	{
		container.appendChild(extraPanel);
		container.appendChild(this.createRelativeOption(bpmResources.get('opacity'), bpmConstants.STYLE_TEXT_OPACITY));
		container.appendChild(spacingPanel);
	}
	else
	{
		var selState = null;
		var lineHeightInput = null;
		
		container.appendChild(this.createRelativeOption(bpmResources.get('lineheight'), null, null, function(input)
		{
			var value = (input.value == '') ? 120 : parseInt(input.value);
			value = Math.max(0, (isNaN(value)) ? 120 : value);

			if (selState != null)
			{
				graph.cellEditor.restoreSelection(selState);
				selState = null;
			}
			
			var selectedElement = graph.getSelectedElement();
			var node = selectedElement;
			
			while (node != null && node.nodeType != bpmConstants.NODETYPE_ELEMENT)
			{
				node = node.parentNode;
			}
			
			if (node != null && node == graph.cellEditor.textarea && graph.cellEditor.textarea.firstChild != null)
			{
				if (graph.cellEditor.textarea.firstChild.nodeName != 'P')
				{
					graph.cellEditor.textarea.innerHTML = '<p>' + graph.cellEditor.textarea.innerHTML + '</p>';
				}
				
				node = graph.cellEditor.textarea.firstChild;
			}
			
			if (node != null && graph.cellEditor.textarea != null && node != graph.cellEditor.textarea &&
				graph.cellEditor.textarea.contains(node))
			{
				node.style.lineHeight = value + '%';
			}
			
			input.value = value + ' %';
		}, function(input)
		{
			// Used in CSS handler to update current value
			lineHeightInput = input;
			
			// KNOWN: Arrow up/down clear selection text in quirks/IE 8
			// Text size via arrow button limits to 16 in IE11. Why?
			bpmEvent.addListener(input, 'mousedown', function()
			{
				if (document.activeElement == graph.cellEditor.textarea)
				{
					selState = graph.cellEditor.saveSelection();
				}
			});
			
			bpmEvent.addListener(input, 'touchstart', function()
			{
				if (document.activeElement == graph.cellEditor.textarea)
				{
					selState = graph.cellEditor.saveSelection();
				}
			});
			
			input.value = '120 %';
		}));
		
		/*
		var insertPanel = stylePanel.cloneNode(false);
		insertPanel.style.paddingLeft = '0px';
		var insertBtns = this.editorUi.toolbar.addItems(['link', 'image'], insertPanel, true);

		var btns = [
		        this.editorUi.toolbar.addButton('geSprite-horizontalrule', bpmResources.get('insertHorizontalRule'),
				function()
				{
					document.execCommand('inserthorizontalrule', false);
				}, insertPanel),				
				this.editorUi.toolbar.addMenuFunctionInContainer(insertPanel, 'geSprite-table', bpmResources.get('table'), false, bpmUtils.bind(this, function(menu)
				{
					this.editorUi.menus.addInsertTableItem(menu);
				}))
			];
		this.styleButtons(insertBtns);
		this.styleButtons(btns);
		
		var wrapper2 = this.createPanel();
		wrapper2.style.paddingTop = '10px';
		wrapper2.style.paddingBottom = '10px';
		wrapper2.appendChild(this.createTitle(bpmResources.get('insert')));
		wrapper2.appendChild(insertPanel);
		container.appendChild(wrapper2);
		*/
		
		if (bpmCore.IS_QUIRKS)
		{
			wrapper2.style.height = '70';
		}
		
		var tablePanel = stylePanel.cloneNode(false);
		tablePanel.style.paddingLeft = '0px';
		
		var btns = [
		        this.editorUi.toolbar.addButton('geSprite-insertcolumnbefore', bpmResources.get('insertColumnBefore'),
	     		bpmUtils.bind(this, function()
				{
					try
					{
				       	if (currentTable != null)
				       	{
				       		graph.insertColumn(currentTable, (tableCell != null) ? tableCell.cellIndex : 0);
				       	}
					}
					catch (e)
					{
						this.editorUi.handleError(e);
					}
				}), tablePanel),
				this.editorUi.toolbar.addButton('geSprite-insertcolumnafter', bpmResources.get('insertColumnAfter'),
				bpmUtils.bind(this, function()
				{
					try
					{
						if (currentTable != null)
				       	{
							graph.insertColumn(currentTable, (tableCell != null) ? tableCell.cellIndex + 1 : -1);
				       	}
					}
					catch (e)
					{
						this.editorUi.handleError(e);
					}
				}), tablePanel),
				this.editorUi.toolbar.addButton('geSprite-deletecolumn', bpmResources.get('deleteColumn'),
				bpmUtils.bind(this, function()
				{
					try
					{
						if (currentTable != null && tableCell != null)
						{
							graph.deleteColumn(currentTable, tableCell.cellIndex);
						}
					}
					catch (e)
					{
						this.editorUi.handleError(e);
					}
				}), tablePanel),
				this.editorUi.toolbar.addButton('geSprite-insertrowbefore', bpmResources.get('insertRowBefore'),
				bpmUtils.bind(this, function()
				{
					try
					{
						if (currentTable != null && tableRow != null)
						{
							graph.insertRow(currentTable, tableRow.sectionRowIndex);
						}
					}
					catch (e)
					{
						this.editorUi.handleError(e);
					}
				}), tablePanel),
				this.editorUi.toolbar.addButton('geSprite-insertrowafter', bpmResources.get('insertRowAfter'),
				bpmUtils.bind(this, function()
				{
					try
					{
						if (currentTable != null && tableRow != null)
						{
							graph.insertRow(currentTable, tableRow.sectionRowIndex + 1);
						}
					}
					catch (e)
					{
						this.editorUi.handleError(e);
					}
				}), tablePanel),
				this.editorUi.toolbar.addButton('geSprite-deleterow', bpmResources.get('deleteRow'),
				bpmUtils.bind(this, function()
				{
					try
					{
						if (currentTable != null && tableRow != null)
						{
							graph.deleteRow(currentTable, tableRow.sectionRowIndex);
						}
					}
					catch (e)
					{
						this.editorUi.handleError(e);
					}
				}), tablePanel)];
		this.styleButtons(btns);
		btns[2].style.marginRight = '9px';
		
		var wrapper3 = this.createPanel();
		wrapper3.style.paddingTop = '10px';
		wrapper3.style.paddingBottom = '10px';
		wrapper3.appendChild(this.createTitle(bpmResources.get('table')));
		wrapper3.appendChild(tablePanel);

		if (bpmCore.IS_QUIRKS)
		{
			bpmUtils.br(container);
			wrapper3.style.height = '70';
		}
		
		var tablePanel2 = stylePanel.cloneNode(false);
		tablePanel2.style.paddingLeft = '0px';
		
		var btns = [
		        this.editorUi.toolbar.addButton('geSprite-strokecolor', bpmResources.get('borderColor'),
				bpmUtils.bind(this, function(evt)
				{
					if (currentTable != null)
					{
						// Converts rgb(r,g,b) values
						var color = currentTable.style.borderColor.replace(
							    /\brgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g,
							    function($0, $1, $2, $3) {
							        return "#" + ("0"+Number($1).toString(16)).substr(-2) + ("0"+Number($2).toString(16)).substr(-2) + ("0"+Number($3).toString(16)).substr(-2);
							    });
						this.editorUi.pickColor(color, function(newColor)
						{
							var targetElt = (tableCell != null && (evt == null || !bpmEvent.isShiftDown(evt))) ? tableCell : currentTable;
							
							graph.processElements(targetElt, function(elt)
							{
								elt.style.border = null;
							});
							
							if (newColor == null || newColor == bpmConstants.NONE)
							{
								targetElt.removeAttribute('border');
								targetElt.style.border = '';
								targetElt.style.borderCollapse = '';
							}
							else
							{
								targetElt.setAttribute('border', '1');
								targetElt.style.border = '1px solid ' + newColor;
								targetElt.style.borderCollapse = 'collapse';
							}
						});
					}
				}), tablePanel2),
				this.editorUi.toolbar.addButton('geSprite-fillcolor', bpmResources.get('backgroundColor'),
				bpmUtils.bind(this, function(evt)
				{
					// Converts rgb(r,g,b) values
					if (currentTable != null)
					{
						var color = currentTable.style.backgroundColor.replace(
							    /\brgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g,
							    function($0, $1, $2, $3) {
							        return "#" + ("0"+Number($1).toString(16)).substr(-2) + ("0"+Number($2).toString(16)).substr(-2) + ("0"+Number($3).toString(16)).substr(-2);
							    });
						this.editorUi.pickColor(color, function(newColor)
						{
							var targetElt = (tableCell != null && (evt == null || !bpmEvent.isShiftDown(evt))) ? tableCell : currentTable;
							
							graph.processElements(targetElt, function(elt)
							{
								elt.style.backgroundColor = null;
							});
							
							if (newColor == null || newColor == bpmConstants.NONE)
							{
								targetElt.style.backgroundColor = '';
							}
							else
							{
								targetElt.style.backgroundColor = newColor;
							}
						});
					}
				}), tablePanel2),
				this.editorUi.toolbar.addButton('geSprite-fit', bpmResources.get('spacing'),
				function()
				{
					if (currentTable != null)
					{
						var value = currentTable.getAttribute('cellPadding') || 0;
						
						var dlg = new FilenameBpmModal(ui, value, bpmResources.get('apply'), bpmUtils.bind(this, function(newValue)
						{
							if (newValue != null && newValue.length > 0)
							{
								currentTable.setAttribute('cellPadding', newValue);
							}
							else
							{
								currentTable.removeAttribute('cellPadding');
							}
						}), bpmResources.get('spacing'));
						ui.showBpmModal(dlg.container, 300, 80, true, true);
						dlg.init();
					}
				}, tablePanel2),
				this.editorUi.toolbar.addButton('geSprite-left', bpmResources.get('left'),
				function()
				{
					if (currentTable != null)
					{
						currentTable.setAttribute('align', 'left');
					}
				}, tablePanel2),
				this.editorUi.toolbar.addButton('geSprite-center', bpmResources.get('center'),
				function()
				{
					if (currentTable != null)
					{
						currentTable.setAttribute('align', 'center');
					}
				}, tablePanel2),
				this.editorUi.toolbar.addButton('geSprite-right', bpmResources.get('right'),
				function()
				{
					if (currentTable != null)
					{
						currentTable.setAttribute('align', 'right');
					}
				}, tablePanel2)];
		this.styleButtons(btns);
		btns[2].style.marginRight = '9px';
		
		if (bpmCore.IS_QUIRKS)
		{
			bpmUtils.br(wrapper3);
			bpmUtils.br(wrapper3);
		}
		
		wrapper3.appendChild(tablePanel2);
		container.appendChild(wrapper3);
		
		tableWrapper = wrapper3;
	}
	
	function setSelected(elt, selected)
	{
		if (bpmCore.IS_IE && (bpmCore.IS_QUIRKS || document.documentMode < 10))
		{
			elt.style.filter = (selected) ? 'progid:DXImageTransform.Microsoft.Gradient('+
            	'StartColorStr=\'#c5ecff\', EndColorStr=\'#87d4fb\', GradientType=0)' : '';
		}
		else
		{
			elt.style.backgroundImage = (selected) ? 'linear-gradient(#c5ecff 0px,#87d4fb 100%)' : '';
		}
	};
	
	var listener = bpmUtils.bind(this, function(sender, evt, force)
	{
		ss = this.format.getSelectionState();
		var fontStyle = bpmUtils.getValue(ss.style, bpmConstants.STYLE_FONTSTYLE, 0);
		setSelected(fontStyleItems[0], (fontStyle & bpmConstants.FONT_BOLD) == bpmConstants.FONT_BOLD);
		setSelected(fontStyleItems[1], (fontStyle & bpmConstants.FONT_ITALIC) == bpmConstants.FONT_ITALIC);
		setSelected(fontStyleItems[2], (fontStyle & bpmConstants.FONT_UNDERLINE) == bpmConstants.FONT_UNDERLINE);
		fontMenu.firstChild.nodeValue = bpmUtils.getValue(ss.style, bpmConstants.STYLE_FONTFAMILY, Menus.prototype.defaultFont);

		setSelected(verticalItem, bpmUtils.getValue(ss.style, bpmConstants.STYLE_HORIZONTAL, '1') == '0');
		
		if (force || document.activeElement != input)
		{
			var tmp = parseFloat(bpmUtils.getValue(ss.style, bpmConstants.STYLE_FONTSIZE, Menus.prototype.defaultFontSize));
			input.value = (isNaN(tmp)) ? '' : tmp  + ' pt';
		}
		
		var align = bpmUtils.getValue(ss.style, bpmConstants.STYLE_ALIGN, bpmConstants.ALIGN_CENTER);
		setSelected(left, align == bpmConstants.ALIGN_LEFT);
		setSelected(center, align == bpmConstants.ALIGN_CENTER);
		setSelected(right, align == bpmConstants.ALIGN_RIGHT);
		
		var valign = bpmUtils.getValue(ss.style, bpmConstants.STYLE_VERTICAL_ALIGN, bpmConstants.ALIGN_MIDDLE);
		setSelected(top, valign == bpmConstants.ALIGN_TOP);
		setSelected(middle, valign == bpmConstants.ALIGN_MIDDLE);
		setSelected(bottom, valign == bpmConstants.ALIGN_BOTTOM);
		
		var pos = bpmUtils.getValue(ss.style, bpmConstants.STYLE_LABEL_POSITION, bpmConstants.ALIGN_CENTER);
		var vpos = bpmUtils.getValue(ss.style, bpmConstants.STYLE_VERTICAL_LABEL_POSITION, bpmConstants.ALIGN_MIDDLE);
		
		if (pos == bpmConstants.ALIGN_LEFT && vpos == bpmConstants.ALIGN_TOP)
		{
			positionSelect.value = 'topLeft';
		}
		else if (pos == bpmConstants.ALIGN_CENTER && vpos == bpmConstants.ALIGN_TOP)
		{
			positionSelect.value = 'top';
		}
		else if (pos == bpmConstants.ALIGN_RIGHT && vpos == bpmConstants.ALIGN_TOP)
		{
			positionSelect.value = 'topRight';
		}
		else if (pos == bpmConstants.ALIGN_LEFT && vpos == bpmConstants.ALIGN_BOTTOM)
		{
			positionSelect.value = 'bottomLeft';
		}
		else if (pos == bpmConstants.ALIGN_CENTER && vpos == bpmConstants.ALIGN_BOTTOM)
		{
			positionSelect.value = 'bottom';
		}
		else if (pos == bpmConstants.ALIGN_RIGHT && vpos == bpmConstants.ALIGN_BOTTOM)
		{
			positionSelect.value = 'bottomRight';
		}
		else if (pos == bpmConstants.ALIGN_LEFT)
		{
			positionSelect.value = 'left';
		}
		else if (pos == bpmConstants.ALIGN_RIGHT)
		{
			positionSelect.value = 'right';
		}
		else
		{
			positionSelect.value = 'center';
		}
		
		var dir = bpmUtils.getValue(ss.style, bpmConstants.STYLE_TEXT_DIRECTION, bpmConstants.DEFAULT_TEXT_DIRECTION);
		
		if (dir == bpmConstants.TEXT_DIRECTION_RTL)
		{
			dirSelect.value = 'rightToLeft';
		}
		else if (dir == bpmConstants.TEXT_DIRECTION_LTR)
		{
			dirSelect.value = 'leftToRight';
		}
		else if (dir == bpmConstants.TEXT_DIRECTION_AUTO)
		{
			dirSelect.value = 'automatic';
		}
		
		if (force || document.activeElement != globalSpacing)
		{
			var tmp = parseFloat(bpmUtils.getValue(ss.style, bpmConstants.STYLE_SPACING, 2));
			globalSpacing.value = (isNaN(tmp)) ? '' : tmp  + ' pt';
		}

		if (force || document.activeElement != topSpacing)
		{
			var tmp = parseFloat(bpmUtils.getValue(ss.style, bpmConstants.STYLE_SPACING_TOP, 0));
			topSpacing.value = (isNaN(tmp)) ? '' : tmp  + ' pt';
		}
		
		if (force || document.activeElement != rightSpacing)
		{
			var tmp = parseFloat(bpmUtils.getValue(ss.style, bpmConstants.STYLE_SPACING_RIGHT, 0));
			rightSpacing.value = (isNaN(tmp)) ? '' : tmp  + ' pt';
		}
		
		if (force || document.activeElement != bottomSpacing)
		{
			var tmp = parseFloat(bpmUtils.getValue(ss.style, bpmConstants.STYLE_SPACING_BOTTOM, 0));
			bottomSpacing.value = (isNaN(tmp)) ? '' : tmp  + ' pt';
		}
		
		if (force || document.activeElement != leftSpacing)
		{
			var tmp = parseFloat(bpmUtils.getValue(ss.style, bpmConstants.STYLE_SPACING_LEFT, 0));
			leftSpacing.value = (isNaN(tmp)) ? '' : tmp  + ' pt';
		}
	});

	globalUpdate = this.installInputHandler(globalSpacing, bpmConstants.STYLE_SPACING, 2, -999, 999, ' pt');
	topUpdate = this.installInputHandler(topSpacing, bpmConstants.STYLE_SPACING_TOP, 0, -999, 999, ' pt');
	rightUpdate = this.installInputHandler(rightSpacing, bpmConstants.STYLE_SPACING_RIGHT, 0, -999, 999, ' pt');
	bottomUpdate = this.installInputHandler(bottomSpacing, bpmConstants.STYLE_SPACING_BOTTOM, 0, -999, 999, ' pt');
	leftUpdate = this.installInputHandler(leftSpacing, bpmConstants.STYLE_SPACING_LEFT, 0, -999, 999, ' pt');

	this.addKeyHandler(input, listener);
	this.addKeyHandler(globalSpacing, listener);
	this.addKeyHandler(topSpacing, listener);
	this.addKeyHandler(rightSpacing, listener);
	this.addKeyHandler(bottomSpacing, listener);
	this.addKeyHandler(leftSpacing, listener);

	graph.getModel().addListener(bpmEvent.CHANGE, listener);
	this.listeners.push({destroy: function() { graph.getModel().removeListener(listener); }});
	listener();
	
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
						// Workaround for commonAncestor on range in IE11 returning parent of common ancestor
						if (node == graph.cellEditor.textarea && graph.cellEditor.textarea.children.length == 1 &&
							graph.cellEditor.textarea.firstChild.nodeType == bpmConstants.NODETYPE_ELEMENT)
						{
							node = graph.cellEditor.textarea.firstChild;
						}
						
						function getRelativeLineHeight(fontSize, css, elt)
						{
							if (elt.style != null && css != null)
							{
								var lineHeight = css.lineHeight
								
								if (elt.style.lineHeight != null && elt.style.lineHeight.substring(elt.style.lineHeight.length - 1) == '%')
								{
									return parseInt(elt.style.lineHeight) / 100;
								}
								else
								{
									return (lineHeight.substring(lineHeight.length - 2) == 'px') ?
											parseFloat(lineHeight) / fontSize : parseInt(lineHeight);
								}
							}
							else
							{
								return '';
							}
						};
						
						function getAbsoluteFontSize(css)
						{
							var fontSize = (css != null) ? css.fontSize : null;
								
							if (fontSize != null && fontSize.substring(fontSize.length - 2) == 'px')
							{
								return parseFloat(fontSize);
							}
							else
							{
								return bpmConstants.DEFAULT_FONTSIZE;
							}
						};
						
						var css = bpmUtils.getCurrentStyle(node);
						var fontSize = getAbsoluteFontSize(css);
						var lineHeight = getRelativeLineHeight(fontSize, css, node);

						// Finds common font size
						var elts = node.getElementsByTagName('*');

						// IE does not support containsNode
						if (elts.length > 0 && window.getSelection && !bpmCore.IS_IE && !bpmCore.IS_IE11)
						{
							var selection = window.getSelection();

							for (var i = 0; i < elts.length; i++)
							{
								if (selection.containsNode(elts[i], true))
								{
									temp = bpmUtils.getCurrentStyle(elts[i]);
									fontSize = Math.max(getAbsoluteFontSize(temp), fontSize);
									var lh = getRelativeLineHeight(fontSize, temp, elts[i]);
									
									if (lh != lineHeight || isNaN(lh))
									{
										lineHeight = '';
									}
								}
							}
						}
						
						function hasParentOrOnlyChild(name)
						{
							if (graph.getParentByName(node, name, graph.cellEditor.textarea) != null)
							{
								return true;
							}
							else
							{
								var child = node;
								
								while (child != null && child.childNodes.length == 1)
								{
									child = child.childNodes[0];
									
									if (child.nodeName == name)
									{
										return true;
									}
								}
							}
							
							return false;
						};
						
						function isEqualOrPrefixed(str, value)
						{
							if (str != null && value != null)
							{
								if (str == value)
								{
									return true;
								}
								else if (str.length > value.length + 1)
								{
									return str.substring(str.length - value.length - 1, str.length) == '-' + value;
								}
							}
							
							return false;
						};
						
						if (css != null)
						{
							setSelected(fontStyleItems[0], css.fontWeight == 'bold' ||
								css.fontWeight > 400 || hasParentOrOnlyChild('B') ||
								hasParentOrOnlyChild('STRONG'));
							setSelected(fontStyleItems[1], css.fontStyle == 'italic' ||
								hasParentOrOnlyChild('I') || hasParentOrOnlyChild('EM'));
							setSelected(fontStyleItems[2], hasParentOrOnlyChild('U'));
							setSelected(full, isEqualOrPrefixed(css.textAlign, 'justify'));
							setSelected(sup, hasParentOrOnlyChild('SUP'));
							setSelected(sub, hasParentOrOnlyChild('SUB'));
							
							if (!graph.cellEditor.isTableSelected())
							{
								var align = graph.cellEditor.align || bpmUtils.getValue(ss.style, bpmConstants.STYLE_ALIGN, bpmConstants.ALIGN_CENTER);
								setSelected(left, align == bpmConstants.ALIGN_LEFT);
								setSelected(center, align == bpmConstants.ALIGN_CENTER);
								setSelected(right, align == bpmConstants.ALIGN_RIGHT);
								
								setSelected(full, false);
								full.style.opacity = 0.2;
								full.style.cursor = 'default';
							}
							else
							{
								setSelected(left, isEqualOrPrefixed(css.textAlign, 'left'));
								setSelected(center, isEqualOrPrefixed(css.textAlign, 'center'));
								setSelected(right, isEqualOrPrefixed(css.textAlign, 'right'));
								
								full.style.opacity = 1;
								full.style.cursor = '';
							}
							
							currentTable = graph.getParentByName(node, 'TABLE', graph.cellEditor.textarea);
							tableRow = (currentTable == null) ? null : graph.getParentByName(node, 'TR', currentTable);
							tableCell = (currentTable == null) ? null : graph.getParentByNames(node, ['TD', 'TH'], currentTable);
							tableWrapper.style.display = (currentTable != null) ? '' : 'none';
							
							if (document.activeElement != input)
							{
								if (node.nodeName == 'FONT' && node.getAttribute('size') == '4' &&
									pendingFontSize != null)
								{
									node.removeAttribute('size');
									node.style.fontSize = pendingFontSize + ' pt';
									pendingFontSize = null;
								}
								else
								{
									input.value = (isNaN(fontSize)) ? '' : fontSize + ' pt';
								}
								
								var lh = parseFloat(lineHeight);
								
								if (!isNaN(lh))
								{
									lineHeightInput.value = Math.round(lh * 100) + ' %';
								}
								else
								{
									lineHeightInput.value = '100 %';
								}
							}
							
							// Converts rgb(r,g,b) values
							var color = css.color.replace(
								    /\brgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g,
								    function($0, $1, $2, $3) {
								        return "#" + ("0"+Number($1).toString(16)).substr(-2) + ("0"+Number($2).toString(16)).substr(-2) + ("0"+Number($3).toString(16)).substr(-2);
								    });
							var color2 = css.backgroundColor.replace(
								    /\brgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g,
								    function($0, $1, $2, $3) {
								        return "#" + ("0"+Number($1).toString(16)).substr(-2) + ("0"+Number($2).toString(16)).substr(-2) + ("0"+Number($3).toString(16)).substr(-2);
								    });
							
							// Updates the color picker for the current font
							if (fontColorApply != null)
							{
								if (color.charAt(0) == '#')
								{
									currentFontColor = color;
								}
								else
								{
									currentFontColor = '#000000';
								}
								
								fontColorApply(currentFontColor, true);
							}
							
							if (bgColorApply != null)
							{
								if (color2.charAt(0) == '#')
								{
									currentBgColor = color2;
								}
								else
								{
									currentBgColor = null;
								}
								
								bgColorApply(currentBgColor, true);
							}
							
							// Workaround for firstChild is null or not an object
							// in the log which seems to be IE8- only / 29.01.15
							if (fontMenu.firstChild != null)
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

								if (ff.charAt(0) == '"')
								{
									ff = ff.substring(1);
								}
								
								if (ff.charAt(ff.length - 1) == '"')
								{
									ff = ff.substring(0, ff.length - 1);
								}
								
								fontMenu.firstChild.nodeValue = ff;
							}
						}
					}
					
					updating = false;
				}, 0);
			}
		};
		
		if (bpmCore.IS_FF || bpmCore.IS_EDGE || bpmCore.IS_IE || bpmCore.IS_IE11)
		{
			bpmEvent.addListener(graph.cellEditor.textarea, 'DOMSubtreeModified', updateCssHandler);
		}
		
		bpmEvent.addListener(graph.cellEditor.textarea, 'input', updateCssHandler);
		bpmEvent.addListener(graph.cellEditor.textarea, 'touchend', updateCssHandler);
		bpmEvent.addListener(graph.cellEditor.textarea, 'mouseup', updateCssHandler);
		bpmEvent.addListener(graph.cellEditor.textarea, 'keyup', updateCssHandler);
		this.listeners.push({destroy: function()
		{
			// No need to remove listener since textarea is destroyed after edit
		}});
		updateCssHandler();
	}

	return container;
};

/**
 * Adds the label menu items to the given menu and parent.
 */
StyleBpmSchemePanel = function(format, editorUi, container)
{
	BaseBpmSchemePanel.call(this, format, editorUi, container);
	this.init();
};

bpmUtils.extend(StyleBpmSchemePanel, BaseBpmSchemePanel);

/**
 * 
 */
StyleBpmSchemePanel.prototype.defaultStrokeColor = 'black';

/**
 * Adds the label menu items to the given menu and parent.
 */
StyleBpmSchemePanel.prototype.init = function()
{
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;
	var ss = this.format.getSelectionState();
	
	if (!ss.containsLabel)
	{
		if (ss.containsImage && ss.vertices.length == 1 && ss.style.shape == 'image' &&
			ss.style.image != null && ss.style.image.substring(0, 19) == 'data:image/svg+xml;')
		{
			this.container.appendChild(this.addSvgStyles(this.createPanel()));
		}
		
		if (!ss.containsImage || ss.style.shape == 'image')
		{
			this.container.appendChild(this.addFill(this.createPanel()));
		}
	
		this.container.appendChild(this.addStroke(this.createPanel()));
		// this.container.appendChild(this.addLineJumps(this.createPanel()));
		var opacityPanel = this.createRelativeOption(bpmResources.get('opacity'), bpmConstants.STYLE_OPACITY, 41);
		opacityPanel.style.paddingTop = '8px';
		opacityPanel.style.paddingBottom = '8px';
		this.container.appendChild(opacityPanel);
		//this.container.appendChild(this.addEffects(this.createPanel()));////////////////////////////////////////////////////////////////////////////////////////////////////
	}
	
	var opsPanel = this.addEditOps(this.createPanel());
	
	if (opsPanel.firstChild != null)
	{
		bpmUtils.br(opsPanel);
	}
	
	// this.container.appendChild(this.addStyleOps(opsPanel));
};

/**
 * Use browser for parsing CSS.
 */
StyleBpmSchemePanel.prototype.getCssRules = function(css)
{
	var doc = document.implementation.createHTMLDocument('');
	var styleElement = document.createElement('style');
	
	bpmUtils.setTextContent(styleElement, css);
	doc.body.appendChild(styleElement);
	
	return styleElement.sheet.cssRules;
};

/**
 * Adds the label menu items to the given menu and parent.
 */
StyleBpmSchemePanel.prototype.addSvgStyles = function(container)
{
	var ui = this.editorUi;
	var graph = ui.editor.graph;
	var ss = this.format.getSelectionState();
	container.style.paddingTop = '6px';
	container.style.paddingBottom = '6px';
	container.style.fontWeight = 'bold';
	container.style.display = 'none';

	try
	{
		var exp = ss.style.editableCssRules;
		
		if (exp != null)
		{
			var regex = new RegExp(exp);
			
			var data = ss.style.image.substring(ss.style.image.indexOf(',') + 1);
			var xml = (window.atob) ? atob(data) : Base64.decode(data, true);
			var svg = bpmUtils.parseXml(xml);
			
			if (svg != null)
			{
				var styles = svg.getElementsByTagName('style');
				
				for (var i = 0; i < styles.length; i++)
				{
					var rules = this.getCssRules(bpmUtils.getTextContent(styles[i]));
					
					for (var j = 0; j < rules.length; j++)
					{
						this.addSvgRule(container, rules[j], svg, styles[i], rules, j, regex);
					}
				}
			}
		}
	}
	catch (e)
	{
		// ignore
	}
	
	return container;
};

/**
 * Adds the label menu items to the given menu and parent.
 */
StyleBpmSchemePanel.prototype.addSvgRule = function(container, rule, svg, styleElem, rules, ruleIndex, regex)
{
	var ui = this.editorUi;
	var graph = ui.editor.graph;
	
	if (regex.test(rule.selectorText))
	{
		function rgb2hex(rgb)
		{
			 rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
			 
			 return (rgb && rgb.length === 4) ? "#" +
			  ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
			  ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
			  ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
		};
		
		var addStyleRule = bpmUtils.bind(this, function(rule, key, label)
		{
			if (rule.style[key] != '')
			{
				var option = this.createColorOption(label + ' ' + rule.selectorText, function()
				{
					return rgb2hex(rule.style[key]);
				}, function(color)
				{
					rules[ruleIndex].style[key] = color;
					var cssTxt = '';
					
					for (var i = 0; i < rules.length; i++) 
					{
						cssTxt += rules[i].cssText + ' ';
					}
					
					styleElem.textContent = cssTxt;
					var xml = bpmUtils.getXml(svg.documentElement);
					
					graph.setCellStyles(bpmConstants.STYLE_IMAGE, 'data:image/svg+xml,' +
						((window.btoa) ? btoa(xml) : Base64.encode(xml, true)),
						graph.getSelectionCells());
				}, '#ffffff',
				{
					install: function(apply)
					{
						// ignore
					},
					destroy: function()
					{
						// ignore
					}
				});
			
				container.appendChild(option);
				
				// Shows container if rules are added
				container.style.display = '';
			}
		});
		
		addStyleRule(rule, 'fill', bpmResources.get('fill'));
		addStyleRule(rule, 'stroke', bpmResources.get('line'));
	}
};

/**
 * Adds the label menu items to the given menu and parent.
 */
StyleBpmSchemePanel.prototype.addEditOps = function(div)
{
	// var ss = this.format.getSelectionState();
	// var btn = null;
	
	// if (this.editorUi.editor.graph.getSelectionCount() == 1)
	// {
	// 	btn = bpmUtils.button(bpmResources.get('editStyle'), bpmUtils.bind(this, function(evt)
	// 	{
	// 		this.editorUi.actions.get('editStyle').funct();
	// 	}));
		
	// 	btn.setAttribute('title', bpmResources.get('editStyle') + ' (' + this.editorUi.actions.get('editStyle').shortcut + ')');
	// 	btn.style.width = '202px';
	// 	btn.style.marginBottom = '2px';
		
	// 	div.appendChild(btn);
	// }
	
	// if (ss.image)
	// {
	// 	var btn2 = bpmUtils.button(bpmResources.get('editImage'), bpmUtils.bind(this, function(evt)
	// 	{
	// 		this.editorUi.actions.get('image').funct();
	// 	}));
		
	// 	btn2.setAttribute('title', bpmResources.get('editImage'));
	// 	btn2.style.marginBottom = '2px';
		
	// 	if (btn == null)
	// 	{
	// 		btn2.style.width = '202px';
	// 	}
	// 	else
	// 	{
	// 		btn.style.width = '100px';
	// 		btn2.style.width = '100px';
	// 		btn2.style.marginLeft = '2px';
	// 	}
		
	// 	div.appendChild(btn2);
	// }
	
	return div;
};

/**
 * Adds the label menu items to the given menu and parent.
 */
StyleBpmSchemePanel.prototype.addFill = function(container)
{
	var ui = this.editorUi;
	var graph = ui.editor.graph;
	var ss = this.format.getSelectionState();
	container.style.paddingTop = '6px';
	container.style.paddingBottom = '6px';

	// Adds gradient direction option
	var gradientSelect = document.createElement('select');
	gradientSelect.style.position = 'absolute';
	gradientSelect.style.marginTop = '-2px';
	gradientSelect.style.right = (bpmCore.IS_QUIRKS) ? '52px' : '72px';
	gradientSelect.style.width = '70px';
	
	// Stops events from bubbling to color option event handler
	bpmEvent.addListener(gradientSelect, 'click', function(evt)
	{
		bpmEvent.consume(evt);
	});

	var gradientPanel = this.createCellColorOption(bpmResources.get('gradient'), bpmConstants.STYLE_GRADIENTCOLOR, '#ffffff', function(color)
	{
		if (color == null || color == bpmConstants.NONE)
		{
			gradientSelect.style.display = 'none';
		}
		else
		{
			gradientSelect.style.display = '';
		}
	});

	var fillKey = (ss.style.shape == 'image') ? bpmConstants.STYLE_IMAGE_BACKGROUND : bpmConstants.STYLE_FILLCOLOR;
	var label = (ss.style.shape == 'image') ? bpmResources.get('background') : bpmResources.get('fill');
	
	var fillPanel = this.createCellColorOption(label, fillKey, '#ffffff');
	fillPanel.style.fontWeight = 'bold';

	var tmpColor = bpmUtils.getValue(ss.style, fillKey, null);
	gradientPanel.style.display = (tmpColor != null && tmpColor != bpmConstants.NONE &&
		ss.fill && ss.style.shape != 'image') ? '' : 'none';

	var directions = [bpmConstants.DIRECTION_NORTH, bpmConstants.DIRECTION_EAST,
	                  bpmConstants.DIRECTION_SOUTH, bpmConstants.DIRECTION_WEST];

	for (var i = 0; i < directions.length; i++)
	{
		var gradientOption = document.createElement('option');
		gradientOption.setAttribute('value', directions[i]);
		bpmUtils.write(gradientOption, bpmResources.get(directions[i]));
		gradientSelect.appendChild(gradientOption);
	}
	
	gradientPanel.appendChild(gradientSelect);

	var listener = bpmUtils.bind(this, function()
	{
		ss = this.format.getSelectionState();
		var value = bpmUtils.getValue(ss.style, bpmConstants.STYLE_GRADIENT_DIRECTION, bpmConstants.DIRECTION_SOUTH);
		
		// Handles empty string which is not allowed as a value
		if (value == '')
		{
			value = bpmConstants.DIRECTION_SOUTH;
		}
		
		gradientSelect.value = value;
		container.style.display = (ss.fill) ? '' : 'none';
		
		var fillColor = bpmUtils.getValue(ss.style, bpmConstants.STYLE_FILLCOLOR, null);

		if (!ss.fill || ss.containsImage || fillColor == null || fillColor == bpmConstants.NONE || ss.style.shape == 'filledEdge')
		{
			gradientPanel.style.display = 'none';
		}
		else
		{
			gradientPanel.style.display = '';
		}
	});
	
	graph.getModel().addListener(bpmEvent.CHANGE, listener);
	this.listeners.push({destroy: function() { graph.getModel().removeListener(listener); }});
	listener();

	bpmEvent.addListener(gradientSelect, 'change', function(evt)
	{
		graph.setCellStyles(bpmConstants.STYLE_GRADIENT_DIRECTION, gradientSelect.value, graph.getSelectionCells());
		bpmEvent.consume(evt);
	});
	
	container.appendChild(fillPanel);
	//container.appendChild(gradientPanel); //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	// Adds custom colors
	var custom = this.getCustomColors();
	
	for (var i = 0; i < custom.length; i++)
	{
		container.appendChild(this.createCellColorOption(custom[i].title, custom[i].key, custom[i].defaultValue));
	}
	
	return container;
};

/**
 * Adds the label menu items to the given menu and parent.
 */
StyleBpmSchemePanel.prototype.getCustomColors = function()
{
	var ss = this.format.getSelectionState();
	var result = [];
	
	if (ss.style.shape == 'swimlane')
	{
		result.push({title: bpmResources.get('laneColor'), key: 'swimlaneFillColor', defaultValue: '#ffffff'});
	}
	
	return result;
};

/**
 * Adds the label menu items to the given menu and parent.
 */
StyleBpmSchemePanel.prototype.addStroke = function(container)
{
	var ui = this.editorUi;
	var graph = ui.editor.graph;
	var ss = this.format.getSelectionState();
	
	container.style.paddingTop = '4px';
	container.style.paddingBottom = '4px';
	container.style.whiteSpace = 'normal';
	
	var colorPanel = document.createElement('div');
	colorPanel.style.fontWeight = 'bold';
	
	// Adds gradient direction option
	var styleSelect = document.createElement('select');
	// styleSelect.style.position = 'absolute';
	styleSelect.style.marginTop = '-2px';
	styleSelect.style.right = '72px';
	styleSelect.style.width = '80px';

	var styles = ['rounded', 'sharp', 'curved'];

	for (var i = 0; i < styles.length; i++)
	{
		var styleOption = document.createElement('option');
		styleOption.setAttribute('value', styles[i]);
		bpmUtils.write(styleOption, bpmResources.get(styles[i]));
		styleSelect.appendChild(styleOption);
	}
	
	bpmEvent.addListener(styleSelect, 'change', function(evt)
	{
		graph.getModel().beginUpdate();
		try
		{
			var keys = [bpmConstants.STYLE_ROUNDED, bpmConstants.STYLE_CURVED];
			// Default for rounded is 1
			var values = ['0', null];
			
			if (styleSelect.value == 'rounded')
			{
				values = ['1', null];
			}
			else if (styleSelect.value == 'curved')
			{
				values = [null, '1'];
			}
			
			for (var i = 0; i < keys.length; i++)
			{
				graph.setCellStyles(keys[i], values[i], graph.getSelectionCells());
			}
			
			ui.fireEvent(new bpmEventObject('styleChanged', 'keys', keys,
				'values', values, 'cells', graph.getSelectionCells()));
		}
		finally
		{
			graph.getModel().endUpdate();
		}
		
		bpmEvent.consume(evt);
	});
	
	// Stops events from bubbling to color option event handler
	bpmEvent.addListener(styleSelect, 'click', function(evt)
	{
		bpmEvent.consume(evt);
	});

	var strokeKey = (ss.style.shape == 'image') ? bpmConstants.STYLE_IMAGE_BORDER : bpmConstants.STYLE_STROKECOLOR;
	var label = (ss.style.shape == 'image') ? bpmResources.get('border') : bpmResources.get('line');
	
	var lineColor = this.createCellColorOption(label, strokeKey, '#000000');
	lineColor.appendChild(styleSelect);
	colorPanel.appendChild(lineColor);
	
	// Used if only edges selected
	var stylePanel = colorPanel.cloneNode(false);
	stylePanel.style.fontWeight = 'normal';
	stylePanel.style.whiteSpace = 'nowrap';
	stylePanel.style.position = 'relative';
	stylePanel.style.paddingLeft = '16px'
	stylePanel.style.marginBottom = '2px';
	stylePanel.style.marginTop = '2px';
	stylePanel.className = 'mainToolbarContainer';
	stylePanel.style.display = 'flex';

	var addItem = bpmUtils.bind(this, function(menu, width, cssName, keys, values)
	{
		var item = this.editorUi.menus.styleChange(menu, '', keys, values, 'geIcon', null);
	
		var pat = document.createElement('div');
		pat.style.width = width + 'px';
		pat.style.height = '1px';
		pat.style.borderBottom = '1px ' + cssName + ' ' + this.defaultStrokeColor;
		pat.style.paddingTop = '6px';

		item.firstChild.firstChild.style.padding = '0px 4px 0px 4px';
		item.firstChild.firstChild.style.width = width + 'px';
		item.firstChild.firstChild.appendChild(pat);
		
		return item;
	});

	var pattern = this.editorUi.toolbar.addMenuFunctionInContainer(stylePanel, 'geSprite-orthogonal', bpmResources.get('pattern'), false, bpmUtils.bind(this, function(menu)
	{
		addItem(menu, 75, 'solid', [bpmConstants.STYLE_DASHED, bpmConstants.STYLE_DASH_PATTERN], [null, null]).setAttribute('title', bpmResources.get('solid'));
		addItem(menu, 75, 'dashed', [bpmConstants.STYLE_DASHED, bpmConstants.STYLE_DASH_PATTERN], ['1', null]).setAttribute('title', bpmResources.get('dashed'));
		addItem(menu, 75, 'dotted', [bpmConstants.STYLE_DASHED, bpmConstants.STYLE_DASH_PATTERN], ['1', '1 1']).setAttribute('title', bpmResources.get('dotted') + ' (1)');
		addItem(menu, 75, 'dotted', [bpmConstants.STYLE_DASHED, bpmConstants.STYLE_DASH_PATTERN], ['1', '1 2']).setAttribute('title', bpmResources.get('dotted') + ' (2)');
		addItem(menu, 75, 'dotted', [bpmConstants.STYLE_DASHED, bpmConstants.STYLE_DASH_PATTERN], ['1', '1 4']).setAttribute('title', bpmResources.get('dotted') + ' (3)');
	}));
	
	// Used for mixed selection (vertices and edges)
	var altStylePanel = stylePanel.cloneNode(false);

	var edgeShape = this.editorUi.toolbar.addMenuFunctionInContainer(altStylePanel, 'geSprite-connection', bpmResources.get('connection'), false, bpmUtils.bind(this, function(menu)
	{
		this.editorUi.menus.styleChange(menu, '', [bpmConstants.STYLE_SHAPE, bpmConstants.STYLE_STARTSIZE, bpmConstants.STYLE_ENDSIZE, 'width'], [null, null, null, null], 'geIcon geSprite geSprite-connection', null, true).setAttribute('title', bpmResources.get('line'));
		this.editorUi.menus.styleChange(menu, '', [bpmConstants.STYLE_SHAPE, bpmConstants.STYLE_STARTSIZE, bpmConstants.STYLE_ENDSIZE, 'width'], ['link', null, null, null], 'geIcon geSprite geSprite-linkedge', null, true).setAttribute('title', bpmResources.get('link'));
		this.editorUi.menus.styleChange(menu, '', [bpmConstants.STYLE_SHAPE, bpmConstants.STYLE_STARTSIZE, bpmConstants.STYLE_ENDSIZE, 'width'], ['flexArrow', null, null, null], 'geIcon geSprite geSprite-arrow', null, true).setAttribute('title', bpmResources.get('arrow'));
		this.editorUi.menus.styleChange(menu, '', [bpmConstants.STYLE_SHAPE, bpmConstants.STYLE_STARTSIZE, bpmConstants.STYLE_ENDSIZE, 'width'], ['arrow', null, null, null], 'geIcon geSprite geSprite-simplearrow', null, true).setAttribute('title', bpmResources.get('simpleArrow')); 
	}));

	var altPattern = this.editorUi.toolbar.addMenuFunctionInContainer(altStylePanel, 'geSprite-orthogonal', bpmResources.get('pattern'), false, bpmUtils.bind(this, function(menu)
	{
		addItem(menu, 33, 'solid', [bpmConstants.STYLE_DASHED, bpmConstants.STYLE_DASH_PATTERN], [null, null]).setAttribute('title', bpmResources.get('solid'));
		addItem(menu, 33, 'dashed', [bpmConstants.STYLE_DASHED, bpmConstants.STYLE_DASH_PATTERN], ['1', null]).setAttribute('title', bpmResources.get('dashed'));
		addItem(menu, 33, 'dotted', [bpmConstants.STYLE_DASHED, bpmConstants.STYLE_DASH_PATTERN], ['1', '1 1']).setAttribute('title', bpmResources.get('dotted') + ' (1)');
		addItem(menu, 33, 'dotted', [bpmConstants.STYLE_DASHED, bpmConstants.STYLE_DASH_PATTERN], ['1', '1 2']).setAttribute('title', bpmResources.get('dotted') + ' (2)');
		addItem(menu, 33, 'dotted', [bpmConstants.STYLE_DASHED, bpmConstants.STYLE_DASH_PATTERN], ['1', '1 4']).setAttribute('title', bpmResources.get('dotted') + ' (3)');
	}));
	
	var stylePanel2 = stylePanel.cloneNode(false);

	// Stroke width
	var input = document.createElement('input');
	input.style.textAlign = 'right';
	input.style.marginTop = '2px';
	input.style.width = '41px';
	input.setAttribute('title', bpmResources.get('linewidth'));
	input.style.marginLeft = 'auto';

	stylePanel.appendChild(input);
	
	var altInput = input.cloneNode(true);
	altStylePanel.appendChild(altInput);

	function update(evt)
	{
		// Maximum stroke width is 999
		var value = parseInt(input.value);
		value = Math.min(999, Math.max(1, (isNaN(value)) ? 1 : value));
		
		if (value != bpmUtils.getValue(ss.style, bpmConstants.STYLE_STROKEWIDTH, 1))
		{
			graph.setCellStyles(bpmConstants.STYLE_STROKEWIDTH, value, graph.getSelectionCells());
			ui.fireEvent(new bpmEventObject('styleChanged', 'keys', [bpmConstants.STYLE_STROKEWIDTH],
					'values', [value], 'cells', graph.getSelectionCells()));
		}

		input.value = value + ' pt';
		bpmEvent.consume(evt);
	};

	function altUpdate(evt)
	{
		// Maximum stroke width is 999
		var value = parseInt(altInput.value);
		value = Math.min(999, Math.max(1, (isNaN(value)) ? 1 : value));
		
		if (value != bpmUtils.getValue(ss.style, bpmConstants.STYLE_STROKEWIDTH, 1))
		{
			graph.setCellStyles(bpmConstants.STYLE_STROKEWIDTH, value, graph.getSelectionCells());
			ui.fireEvent(new bpmEventObject('styleChanged', 'keys', [bpmConstants.STYLE_STROKEWIDTH],
					'values', [value], 'cells', graph.getSelectionCells()));
		}

		altInput.value = value + ' pt';
		bpmEvent.consume(evt);
	};

	input.style.marginLeft = 'auto';
	var stepper = this.createStepper(input, update, 1, 9);
	stepper.style.display = input.style.display;
	stepper.style.marginTop = '2px';
	stylePanel.appendChild(stepper);
	
	altInput.style.marginLeft = 'auto';
	var altStepper = this.createStepper(altInput, altUpdate, 1, 9);
	altStepper.style.display = altInput.style.display;
	altStepper.style.marginTop = '2px';
	altStylePanel.appendChild(altStepper);
	
	if (!bpmCore.IS_QUIRKS)
	{
		// input.style.position = 'absolute';
		input.style.right = '32px';
		input.style.height = '15px';
		stepper.style.right = '20px';

		// altInput.style.position = 'absolute';
		altInput.style.right = '32px';
		altInput.style.height = '15px';
		altStepper.style.right = '20px';
	}
	else
	{
		input.style.height = '17px';
		altInput.style.height = '17px';
	}
	
	bpmEvent.addListener(input, 'blur', update);
	bpmEvent.addListener(input, 'change', update);

	bpmEvent.addListener(altInput, 'blur', altUpdate);
	bpmEvent.addListener(altInput, 'change', altUpdate);
	
	if (bpmCore.IS_QUIRKS)
	{
		bpmUtils.br(stylePanel2);
		bpmUtils.br(stylePanel2);
	}
	
	var edgeStyle = this.editorUi.toolbar.addMenuFunctionInContainer(stylePanel2, 'geSprite-orthogonal', bpmResources.get('waypoints'), false, bpmUtils.bind(this, function(menu)
	{
		if (ss.style.shape != 'arrow')
		{
			this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_EDGE, bpmConstants.STYLE_CURVED, bpmConstants.STYLE_NOEDGESTYLE], [null, null, null], 'geIcon geSprite geSprite-straight', null, true).setAttribute('title', bpmResources.get('straight'));
			this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_EDGE, bpmConstants.STYLE_CURVED, bpmConstants.STYLE_NOEDGESTYLE], ['orthogonalEdgeStyle', null, null], 'geIcon geSprite geSprite-orthogonal', null, true).setAttribute('title', bpmResources.get('orthogonal'));
			this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_EDGE, bpmConstants.STYLE_ELBOW, bpmConstants.STYLE_CURVED, bpmConstants.STYLE_NOEDGESTYLE], ['elbowEdgeStyle', null, null, null], 'geIcon geSprite geSprite-horizontalelbow', null, true).setAttribute('title', bpmResources.get('simple'));
			this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_EDGE, bpmConstants.STYLE_ELBOW, bpmConstants.STYLE_CURVED, bpmConstants.STYLE_NOEDGESTYLE], ['elbowEdgeStyle', 'vertical', null, null], 'geIcon geSprite geSprite-verticalelbow', null, true).setAttribute('title', bpmResources.get('simple'));
			this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_EDGE, bpmConstants.STYLE_ELBOW, bpmConstants.STYLE_CURVED, bpmConstants.STYLE_NOEDGESTYLE], ['isometricEdgeStyle', null, null, null], 'geIcon geSprite geSprite-horizontalisometric', null, true).setAttribute('title', bpmResources.get('isometric'));
			this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_EDGE, bpmConstants.STYLE_ELBOW, bpmConstants.STYLE_CURVED, bpmConstants.STYLE_NOEDGESTYLE], ['isometricEdgeStyle', 'vertical', null, null], 'geIcon geSprite geSprite-verticalisometric', null, true).setAttribute('title', bpmResources.get('isometric'));
	
			if (ss.style.shape == 'connector')
			{
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_EDGE, bpmConstants.STYLE_CURVED, bpmConstants.STYLE_NOEDGESTYLE], ['orthogonalEdgeStyle', '1', null], 'geIcon geSprite geSprite-curved', null, true).setAttribute('title', bpmResources.get('curved'));
			}
			
			this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_EDGE, bpmConstants.STYLE_CURVED, bpmConstants.STYLE_NOEDGESTYLE], ['entityRelationEdgeStyle', null, null], 'geIcon geSprite geSprite-entity', null, true).setAttribute('title', bpmResources.get('entityRelation'));
		}
	}));

	var lineStart = this.editorUi.toolbar.addMenuFunctionInContainer(stylePanel2, 'geSprite-startclassic', bpmResources.get('linestart'), false, bpmUtils.bind(this, function(menu)
	{
		if (ss.style.shape == 'connector' || ss.style.shape == 'flexArrow' || ss.style.shape == 'filledEdge')
		{
			var item = this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_STARTARROW, 'startFill'], [bpmConstants.NONE, 0], 'geIcon', null, false);
			item.setAttribute('title', bpmResources.get('none'));
			item.firstChild.firstChild.innerHTML = '<font style="font-size:10px;">' + bpmUtils.htmlEntities(bpmResources.get('none')) + '</font>';

			if (ss.style.shape == 'connector' || ss.style.shape == 'filledEdge')
			{
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_STARTARROW, 'startFill'], [bpmConstants.ARROW_CLASSIC, 1], 'geIcon geSprite geSprite-startclassic', null, false).setAttribute('title', bpmResources.get('classic'));
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_STARTARROW, 'startFill'], [bpmConstants.ARROW_CLASSIC_THIN, 1], 'geIcon geSprite geSprite-startclassicthin', null, false);
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_STARTARROW, 'startFill'], [bpmConstants.ARROW_OPEN, 0], 'geIcon geSprite geSprite-startopen', null, false).setAttribute('title', bpmResources.get('openArrow'));
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_STARTARROW, 'startFill'], [bpmConstants.ARROW_OPEN_THIN, 0], 'geIcon geSprite geSprite-startopenthin', null, false);
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_STARTARROW, 'startFill'], ['openAsync', 0], 'geIcon geSprite geSprite-startopenasync', null, false);
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_STARTARROW, 'startFill'], [bpmConstants.ARROW_BLOCK, 1], 'geIcon geSprite geSprite-startblock', null, false).setAttribute('title', bpmResources.get('block'));
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_STARTARROW, 'startFill'], [bpmConstants.ARROW_BLOCK_THIN, 1], 'geIcon geSprite geSprite-startblockthin', null, false);
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_STARTARROW, 'startFill'], ['async', 1], 'geIcon geSprite geSprite-startasync', null, false);
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_STARTARROW, 'startFill'], [bpmConstants.ARROW_OVAL, 1], 'geIcon geSprite geSprite-startoval', null, false).setAttribute('title', bpmResources.get('oval'));
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_STARTARROW, 'startFill'], [bpmConstants.ARROW_DIAMOND, 1], 'geIcon geSprite geSprite-startdiamond', null, false).setAttribute('title', bpmResources.get('diamond'));
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_STARTARROW, 'startFill'], [bpmConstants.ARROW_DIAMOND_THIN, 1], 'geIcon geSprite geSprite-startthindiamond', null, false).setAttribute('title', bpmResources.get('diamondThin'));
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_STARTARROW, 'startFill'], [bpmConstants.ARROW_CLASSIC, 0], 'geIcon geSprite geSprite-startclassictrans', null, false).setAttribute('title', bpmResources.get('classic'));
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_STARTARROW, 'startFill'], [bpmConstants.ARROW_CLASSIC_THIN, 0], 'geIcon geSprite geSprite-startclassicthintrans', null, false);
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_STARTARROW, 'startFill'], [bpmConstants.ARROW_BLOCK, 0], 'geIcon geSprite geSprite-startblocktrans', null, false).setAttribute('title', bpmResources.get('block'));
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_STARTARROW, 'startFill'], [bpmConstants.ARROW_BLOCK_THIN, 0], 'geIcon geSprite geSprite-startblockthintrans', null, false);
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_STARTARROW, 'startFill'], ['async', 0], 'geIcon geSprite geSprite-startasynctrans', null, false);
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_STARTARROW, 'startFill'], [bpmConstants.ARROW_OVAL, 0], 'geIcon geSprite geSprite-startovaltrans', null, false).setAttribute('title', bpmResources.get('oval'));
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_STARTARROW, 'startFill'], [bpmConstants.ARROW_DIAMOND, 0], 'geIcon geSprite geSprite-startdiamondtrans', null, false).setAttribute('title', bpmResources.get('diamond'));
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_STARTARROW, 'startFill'], [bpmConstants.ARROW_DIAMOND_THIN, 0], 'geIcon geSprite geSprite-startthindiamondtrans', null, false).setAttribute('title', bpmResources.get('diamondThin'));
				
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_STARTARROW, 'startFill'], ['dash', 0], 'geIcon geSprite geSprite-startdash', null, false);
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_STARTARROW, 'startFill'], ['cross', 0], 'geIcon geSprite geSprite-startcross', null, false);
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_STARTARROW, 'startFill'], ['circlePlus', 0], 'geIcon geSprite geSprite-startcircleplus', null, false);
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_STARTARROW, 'startFill'], ['circle', 1], 'geIcon geSprite geSprite-startcircle', null, false);
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_STARTARROW, 'startFill'], ['ERone', 0], 'geIcon geSprite geSprite-starterone', null, false);
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_STARTARROW, 'startFill'], ['ERmandOne', 0], 'geIcon geSprite geSprite-starteronetoone', null, false);
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_STARTARROW, 'startFill'], ['ERmany', 0], 'geIcon geSprite geSprite-startermany', null, false);
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_STARTARROW, 'startFill'], ['ERoneToMany', 0], 'geIcon geSprite geSprite-starteronetomany', null, false);
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_STARTARROW, 'startFill'], ['ERzeroToOne', 1], 'geIcon geSprite geSprite-starteroneopt', null, false);
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_STARTARROW, 'startFill'], ['ERzeroToMany', 1], 'geIcon geSprite geSprite-startermanyopt', null, false);
			}
			else
			{
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_STARTARROW], [bpmConstants.ARROW_BLOCK], 'geIcon geSprite geSprite-startblocktrans', null, false).setAttribute('title', bpmResources.get('block'));
			}
		}
	}));

	var lineEnd = this.editorUi.toolbar.addMenuFunctionInContainer(stylePanel2, 'geSprite-endclassic', bpmResources.get('lineend'), false, bpmUtils.bind(this, function(menu)
	{
		if (ss.style.shape == 'connector' || ss.style.shape == 'flexArrow' || ss.style.shape == 'filledEdge')
		{
			var item = this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_ENDARROW, 'endFill'], [bpmConstants.NONE, 0], 'geIcon', null, false);
			item.setAttribute('title', bpmResources.get('none'));
			item.firstChild.firstChild.innerHTML = '<font style="font-size:10px;">' + bpmUtils.htmlEntities(bpmResources.get('none')) + '</font>';
			
			if (ss.style.shape == 'connector' || ss.style.shape == 'filledEdge')
			{
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_ENDARROW, 'endFill'], [bpmConstants.ARROW_CLASSIC, 1], 'geIcon geSprite geSprite-endclassic', null, false).setAttribute('title', bpmResources.get('classic'));
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_ENDARROW, 'endFill'], [bpmConstants.ARROW_CLASSIC_THIN, 1], 'geIcon geSprite geSprite-endclassicthin', null, false);
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_ENDARROW, 'endFill'], [bpmConstants.ARROW_OPEN, 0], 'geIcon geSprite geSprite-endopen', null, false).setAttribute('title', bpmResources.get('openArrow'));
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_ENDARROW, 'endFill'], [bpmConstants.ARROW_OPEN_THIN, 0], 'geIcon geSprite geSprite-endopenthin', null, false);
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_ENDARROW, 'endFill'], ['openAsync', 0], 'geIcon geSprite geSprite-endopenasync', null, false);
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_ENDARROW, 'endFill'], [bpmConstants.ARROW_BLOCK, 1], 'geIcon geSprite geSprite-endblock', null, false).setAttribute('title', bpmResources.get('block'));
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_ENDARROW, 'endFill'], [bpmConstants.ARROW_BLOCK_THIN, 1], 'geIcon geSprite geSprite-endblockthin', null, false);
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_ENDARROW, 'endFill'], ['async', 1], 'geIcon geSprite geSprite-endasync', null, false);
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_ENDARROW, 'endFill'], [bpmConstants.ARROW_OVAL, 1], 'geIcon geSprite geSprite-endoval', null, false).setAttribute('title', bpmResources.get('oval'));
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_ENDARROW, 'endFill'], [bpmConstants.ARROW_DIAMOND, 1], 'geIcon geSprite geSprite-enddiamond', null, false).setAttribute('title', bpmResources.get('diamond'));
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_ENDARROW, 'endFill'], [bpmConstants.ARROW_DIAMOND_THIN, 1], 'geIcon geSprite geSprite-endthindiamond', null, false).setAttribute('title', bpmResources.get('diamondThin'));
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_ENDARROW, 'endFill'], [bpmConstants.ARROW_CLASSIC, 0], 'geIcon geSprite geSprite-endclassictrans', null, false).setAttribute('title', bpmResources.get('classic'));
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_ENDARROW, 'endFill'], [bpmConstants.ARROW_CLASSIC_THIN, 0], 'geIcon geSprite geSprite-endclassicthintrans', null, false);
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_ENDARROW, 'endFill'], [bpmConstants.ARROW_BLOCK, 0], 'geIcon geSprite geSprite-endblocktrans', null, false).setAttribute('title', bpmResources.get('block'));
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_ENDARROW, 'endFill'], [bpmConstants.ARROW_BLOCK_THIN, 0], 'geIcon geSprite geSprite-endblockthintrans', null, false);
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_ENDARROW, 'endFill'], ['async', 0], 'geIcon geSprite geSprite-endasynctrans', null, false);
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_ENDARROW, 'endFill'], [bpmConstants.ARROW_OVAL, 0], 'geIcon geSprite geSprite-endovaltrans', null, false).setAttribute('title', bpmResources.get('oval'));
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_ENDARROW, 'endFill'], [bpmConstants.ARROW_DIAMOND, 0], 'geIcon geSprite geSprite-enddiamondtrans', null, false).setAttribute('title', bpmResources.get('diamond'));
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_ENDARROW, 'endFill'], [bpmConstants.ARROW_DIAMOND_THIN, 0], 'geIcon geSprite geSprite-endthindiamondtrans', null, false).setAttribute('title', bpmResources.get('diamondThin'));

				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_ENDARROW, 'endFill'], ['dash', 0], 'geIcon geSprite geSprite-enddash', null, false);
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_ENDARROW, 'endFill'], ['cross', 0], 'geIcon geSprite geSprite-endcross', null, false);
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_ENDARROW, 'endFill'], ['circlePlus', 0], 'geIcon geSprite geSprite-endcircleplus', null, false);
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_ENDARROW, 'endFill'], ['circle', 1], 'geIcon geSprite geSprite-endcircle', null, false);
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_ENDARROW, 'endFill'], ['ERone', 0], 'geIcon geSprite geSprite-enderone', null, false);
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_ENDARROW, 'endFill'], ['ERmandOne', 0], 'geIcon geSprite geSprite-enderonetoone', null, false);
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_ENDARROW, 'endFill'], ['ERmany', 0], 'geIcon geSprite geSprite-endermany', null, false);
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_ENDARROW, 'endFill'], ['ERoneToMany', 0], 'geIcon geSprite geSprite-enderonetomany', null, false);
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_ENDARROW, 'endFill'], ['ERzeroToOne', 1], 'geIcon geSprite geSprite-enderoneopt', null, false);
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_ENDARROW, 'endFill'], ['ERzeroToMany', 1], 'geIcon geSprite geSprite-endermanyopt', null, false);
			}
			else
			{
				this.editorUi.menus.edgeStyleChange(menu, '', [bpmConstants.STYLE_ENDARROW], [bpmConstants.ARROW_BLOCK], 'geIcon geSprite geSprite-endblocktrans', null, false).setAttribute('title', bpmResources.get('block'));
			}
		}
	}));

	this.addArrow(edgeShape, 8);
	this.addArrow(edgeStyle);
	this.addArrow(lineStart);
	this.addArrow(lineEnd);
	
	var symbol = this.addArrow(pattern, 9);
	symbol.className = 'geIcon';
	symbol.style.width = '84px';
	
	var altSymbol = this.addArrow(altPattern, 9);
	altSymbol.className = 'geIcon';
	altSymbol.style.width = '22px';
	
	var solid = document.createElement('div');
	solid.style.width = '85px';
	solid.style.height = '1px';
	solid.style.borderBottom = '1px solid ' + this.defaultStrokeColor;
	solid.style.marginBottom = '9px';
	symbol.appendChild(solid);
	
	var altSolid = document.createElement('div');
	altSolid.style.width = '23px';
	altSolid.style.height = '1px';
	altSolid.style.borderBottom = '1px solid ' + this.defaultStrokeColor;
	altSolid.style.marginBottom = '9px';
	altSymbol.appendChild(altSolid);

	pattern.style.height = '15px';
	altPattern.style.height = '15px';
	edgeShape.style.height = '15px';
	edgeStyle.style.height = '17px';
	lineStart.style.marginLeft = '3px';
	lineStart.style.height = '17px';
	lineEnd.style.marginLeft = '3px';
	lineEnd.style.height = '17px';

	container.appendChild(colorPanel);
	container.appendChild(altStylePanel);
	container.appendChild(stylePanel);

	var arrowPanel = stylePanel.cloneNode(false);
	arrowPanel.style.paddingBottom = '6px';
	arrowPanel.style.paddingTop = '4px';
	arrowPanel.style.fontWeight = 'normal';
	
	var span = document.createElement('div');
	span.style.position = 'absolute';
	span.style.marginLeft = '3px';
	span.style.marginBottom = '12px';
	span.style.marginTop = '2px';
	span.style.fontWeight = 'normal';
	span.style.width = '76px';
	
	bpmUtils.write(span, bpmResources.get('lineend'));
	arrowPanel.appendChild(span);
	
	var endSpacingUpdate, endSizeUpdate;
	var endSpacing = this.addUnitInput(arrowPanel, 'pt', 74, 33, function()
	{
		endSpacingUpdate.apply(this, arguments);
	});
	var endSize = this.addUnitInput(arrowPanel, 'pt', 20, 33, function()
	{
		endSizeUpdate.apply(this, arguments);
	});

	bpmUtils.br(arrowPanel);
	
	var spacer = document.createElement('div');
	spacer.style.height = '8px';
	arrowPanel.appendChild(spacer);
	
	span = span.cloneNode(false);
	bpmUtils.write(span, bpmResources.get('linestart'));
	arrowPanel.appendChild(span);
	
	var startSpacingUpdate, startSizeUpdate;
	var startSpacing = this.addUnitInput(arrowPanel, 'pt', 74, 33, function()
	{
		startSpacingUpdate.apply(this, arguments);
	});
	var startSize = this.addUnitInput(arrowPanel, 'pt', 20, 33, function()
	{
		startSizeUpdate.apply(this, arguments);
	});

	bpmUtils.br(arrowPanel);
	this.addLabel(arrowPanel, bpmResources.get('spacing'), 74, 50);
	this.addLabel(arrowPanel, bpmResources.get('size'), 20, 50);
	bpmUtils.br(arrowPanel);
	
	var perimeterPanel = colorPanel.cloneNode(false);
	perimeterPanel.style.fontWeight = 'normal';
	perimeterPanel.style.position = 'relative';
	perimeterPanel.style.paddingLeft = '16px'
	perimeterPanel.style.marginBottom = '2px';
	perimeterPanel.style.marginTop = '6px';
	perimeterPanel.style.borderWidth = '5px';
	perimeterPanel.style.paddingBottom = '18px';
	
	var span = document.createElement('div');
	span.style.position = 'absolute';
	span.style.marginLeft = '3px';
	span.style.marginBottom = '12px';
	span.style.marginTop = '1px';
	span.style.fontWeight = 'normal';
	span.style.width = '120px';
	bpmUtils.write(span, bpmResources.get('perimeter'));
	perimeterPanel.appendChild(span);
	
	var perimeterUpdate;
	var perimeterSpacing = this.addUnitInput(perimeterPanel, 'pt', 20, 41, function()
	{
		perimeterUpdate.apply(this, arguments);
	});

	if (ss.edges.length == graph.getSelectionCount())
	{
		container.appendChild(stylePanel2);
		
		if (bpmCore.IS_QUIRKS)
		{
			bpmUtils.br(container);
			bpmUtils.br(container);
		}
		
		container.appendChild(arrowPanel);
	}
	else if (ss.vertices.length == graph.getSelectionCount())
	{
		if (bpmCore.IS_QUIRKS)
		{
			bpmUtils.br(container);
		}
		
		//container.appendChild(perimeterPanel); ////////////////////////////////////////////////////////////////////////////////////////////////////////////
	}
	
	var listener = bpmUtils.bind(this, function(sender, evt, force)
	{
		ss = this.format.getSelectionState();
		var color = bpmUtils.getValue(ss.style, strokeKey, null);

		if (force || document.activeElement != input)
		{
			var tmp = parseInt(bpmUtils.getValue(ss.style, bpmConstants.STYLE_STROKEWIDTH, 1));
			input.value = (isNaN(tmp)) ? '' : tmp + ' pt';
		}
		
		if (force || document.activeElement != altInput)
		{
			var tmp = parseInt(bpmUtils.getValue(ss.style, bpmConstants.STYLE_STROKEWIDTH, 1));
			altInput.value = (isNaN(tmp)) ? '' : tmp + ' pt';
		}
		
		styleSelect.style.display = (ss.style.shape == 'connector' || ss.style.shape == 'filledEdge') ? '' : 'none';
		
		if (bpmUtils.getValue(ss.style, bpmConstants.STYLE_CURVED, null) == '1')
		{
			styleSelect.value = 'curved';
		}
		else if (bpmUtils.getValue(ss.style, bpmConstants.STYLE_ROUNDED, null) == '1')
		{
			styleSelect.value = 'rounded';
		}
		
		if (bpmUtils.getValue(ss.style, bpmConstants.STYLE_DASHED, null) == '1')
		{
			if (bpmUtils.getValue(ss.style, bpmConstants.STYLE_DASH_PATTERN, null) == null)
			{
				solid.style.borderBottom = '1px dashed ' + this.defaultStrokeColor;
			}
			else
			{
				solid.style.borderBottom = '1px dotted ' + this.defaultStrokeColor;
			}
		}
		else
		{
			solid.style.borderBottom = '1px solid ' + this.defaultStrokeColor;
		}
		
		altSolid.style.borderBottom = solid.style.borderBottom;
		
		// Updates toolbar icon for edge style
		var edgeStyleDiv = edgeStyle.getElementsByTagName('div')[0];
		var es = bpmUtils.getValue(ss.style, bpmConstants.STYLE_EDGE, null);
		
		if (bpmUtils.getValue(ss.style, bpmConstants.STYLE_NOEDGESTYLE, null) == '1')
		{
			es = null;
		}

		if (es == 'orthogonalEdgeStyle' && bpmUtils.getValue(ss.style, bpmConstants.STYLE_CURVED, null) == '1')
		{
			edgeStyleDiv.className = 'geSprite geSprite-curved';
		}
		else if (es == 'straight' || es == 'none' || es == null)
		{
			edgeStyleDiv.className = 'geSprite geSprite-straight';
		}
		else if (es == 'entityRelationEdgeStyle')
		{
			edgeStyleDiv.className = 'geSprite geSprite-entity';
		}
		else if (es == 'elbowEdgeStyle')
		{
			edgeStyleDiv.className = 'geSprite ' + ((bpmUtils.getValue(ss.style,
				bpmConstants.STYLE_ELBOW, null) == 'vertical') ?
				'geSprite-verticalelbow' : 'geSprite-horizontalelbow');
		}
		else if (es == 'isometricEdgeStyle')
		{
			edgeStyleDiv.className = 'geSprite ' + ((bpmUtils.getValue(ss.style,
				bpmConstants.STYLE_ELBOW, null) == 'vertical') ?
				'geSprite-verticalisometric' : 'geSprite-horizontalisometric');
		}
		else
		{
			edgeStyleDiv.className = 'geSprite geSprite-orthogonal';
		}
		
		// Updates icon for edge shape
		var edgeShapeDiv = edgeShape.getElementsByTagName('div')[0];
		
		if (ss.style.shape == 'link')
		{
			edgeShapeDiv.className = 'geSprite geSprite-linkedge';
		}
		else if (ss.style.shape == 'flexArrow')
		{
			edgeShapeDiv.className = 'geSprite geSprite-arrow';
		}
		else if (ss.style.shape == 'arrow')
		{
			edgeShapeDiv.className = 'geSprite geSprite-simplearrow';
		}
		else
		{
			edgeShapeDiv.className = 'geSprite geSprite-connection';
		}
		
		if (ss.edges.length == graph.getSelectionCount())
		{
			// altStylePanel.style.display = '';
			stylePanel.style.display = 'none';
		}
		else
		{
			altStylePanel.style.display = 'none';
			// stylePanel.style.display = '';
		}

		function updateArrow(marker, fill, elt, prefix)
		{
			var markerDiv = elt.getElementsByTagName('div')[0];
			
			markerDiv.className = ui.getCssClassForMarker(prefix, ss.style.shape, marker, fill);
			
			if (markerDiv.className == 'geSprite geSprite-noarrow')
			{
				markerDiv.innerHTML = bpmUtils.htmlEntities(bpmResources.get('none'));
				markerDiv.style.backgroundImage = 'none';
				markerDiv.style.verticalAlign = 'top';
				markerDiv.style.marginTop = '5px';
				markerDiv.style.fontSize = '10px';
				markerDiv.style.filter = 'none';
				markerDiv.style.color = this.defaultStrokeColor;
				markerDiv.nextSibling.style.marginTop = '0px';
			}
			
			return markerDiv;
		};
		
		var sourceDiv = updateArrow(bpmUtils.getValue(ss.style, bpmConstants.STYLE_STARTARROW, null),
				bpmUtils.getValue(ss.style, 'startFill', '1'), lineStart, 'start');
		var targetDiv = updateArrow(bpmUtils.getValue(ss.style, bpmConstants.STYLE_ENDARROW, null),
				bpmUtils.getValue(ss.style, 'endFill', '1'), lineEnd, 'end');

		// Special cases for markers
		if (ss.style.shape == 'arrow')
		{
			sourceDiv.className = 'geSprite geSprite-noarrow';
			targetDiv.className = 'geSprite geSprite-endblocktrans';
		}
		else if (ss.style.shape == 'link')
		{
			sourceDiv.className = 'geSprite geSprite-noarrow';
			targetDiv.className = 'geSprite geSprite-noarrow';
		}

		bpmUtils.setOpacity(edgeStyle, (ss.style.shape == 'arrow') ? 30 : 100);			
		
		if (ss.style.shape != 'connector' && ss.style.shape != 'flexArrow' && ss.style.shape != 'filledEdge')
		{
			bpmUtils.setOpacity(lineStart, 30);
			bpmUtils.setOpacity(lineEnd, 30);
		}
		else
		{
			bpmUtils.setOpacity(lineStart, 100);
			bpmUtils.setOpacity(lineEnd, 100);
		}

		if (force || document.activeElement != startSize)
		{
			var tmp = parseInt(bpmUtils.getValue(ss.style, bpmConstants.STYLE_STARTSIZE, bpmConstants.DEFAULT_MARKERSIZE));
			startSize.value = (isNaN(tmp)) ? '' : tmp  + ' pt';
		}
		
		if (force || document.activeElement != startSpacing)
		{
			var tmp = parseInt(bpmUtils.getValue(ss.style, bpmConstants.STYLE_SOURCE_PERIMETER_SPACING, 0));
			startSpacing.value = (isNaN(tmp)) ? '' : tmp  + ' pt';
		}

		if (force || document.activeElement != endSize)
		{
			var tmp = parseInt(bpmUtils.getValue(ss.style, bpmConstants.STYLE_ENDSIZE, bpmConstants.DEFAULT_MARKERSIZE));
			endSize.value = (isNaN(tmp)) ? '' : tmp  + ' pt';
		}
		
		if (force || document.activeElement != startSpacing)
		{
			var tmp = parseInt(bpmUtils.getValue(ss.style, bpmConstants.STYLE_TARGET_PERIMETER_SPACING, 0));
			endSpacing.value = (isNaN(tmp)) ? '' : tmp  + ' pt';
		}
		
		if (force || document.activeElement != perimeterSpacing)
		{
			var tmp = parseInt(bpmUtils.getValue(ss.style, bpmConstants.STYLE_PERIMETER_SPACING, 0));
			perimeterSpacing.value = (isNaN(tmp)) ? '' : tmp  + ' pt';
		}
	});
	
	startSizeUpdate = this.installInputHandler(startSize, bpmConstants.STYLE_STARTSIZE, bpmConstants.DEFAULT_MARKERSIZE, 0, 999, ' pt');
	startSpacingUpdate = this.installInputHandler(startSpacing, bpmConstants.STYLE_SOURCE_PERIMETER_SPACING, 0, -999, 999, ' pt');
	endSizeUpdate = this.installInputHandler(endSize, bpmConstants.STYLE_ENDSIZE, bpmConstants.DEFAULT_MARKERSIZE, 0, 999, ' pt');
	endSpacingUpdate = this.installInputHandler(endSpacing, bpmConstants.STYLE_TARGET_PERIMETER_SPACING, 0, -999, 999, ' pt');
	perimeterUpdate = this.installInputHandler(perimeterSpacing, bpmConstants.STYLE_PERIMETER_SPACING, 0, 0, 999, ' pt');

	this.addKeyHandler(input, listener);
	this.addKeyHandler(startSize, listener);
	this.addKeyHandler(startSpacing, listener);
	this.addKeyHandler(endSize, listener);
	this.addKeyHandler(endSpacing, listener);
	this.addKeyHandler(perimeterSpacing, listener);

	graph.getModel().addListener(bpmEvent.CHANGE, listener);
	this.listeners.push({destroy: function() { graph.getModel().removeListener(listener); }});
	listener();

	return container;
};

/**
 * Adds UI for configuring line jumps.
 */
StyleBpmSchemePanel.prototype.addLineJumps = function(container)
{
	var ss = this.format.getSelectionState();
	
	if (Draw.lineJumpsEnabled && ss.edges.length > 0 &&
		ss.vertices.length == 0 && ss.lineJumps)
	{
		container.style.padding = '8px 0px 24px 18px';
		
		var ui = this.editorUi;
		var editor = ui.editor;
		var graph = editor.graph;
		
		var span = document.createElement('div');
		span.style.position = 'absolute';
		span.style.fontWeight = 'bold';
		span.style.width = '80px';
		
		bpmUtils.write(span, bpmResources.get('lineJumps'));
		container.appendChild(span);
		
		var styleSelect = document.createElement('select');
		styleSelect.style.position = 'absolute';
		styleSelect.style.marginTop = '-2px';
		styleSelect.style.right = '76px';
		styleSelect.style.width = '62px';

		var styles = ['none', 'arc', 'gap', 'sharp'];

		for (var i = 0; i < styles.length; i++)
		{
			var styleOption = document.createElement('option');
			styleOption.setAttribute('value', styles[i]);
			bpmUtils.write(styleOption, bpmResources.get(styles[i]));
			styleSelect.appendChild(styleOption);
		}
		
		bpmEvent.addListener(styleSelect, 'change', function(evt)
		{
			graph.getModel().beginUpdate();
			try
			{
				graph.setCellStyles('jumpStyle', styleSelect.value, graph.getSelectionCells());
				ui.fireEvent(new bpmEventObject('styleChanged', 'keys', ['jumpStyle'],
					'values', [styleSelect.value], 'cells', graph.getSelectionCells()));
			}
			finally
			{
				graph.getModel().endUpdate();
			}
			
			bpmEvent.consume(evt);
		});
		
		// Stops events from bubbling to color option event handler
		bpmEvent.addListener(styleSelect, 'click', function(evt)
		{
			bpmEvent.consume(evt);
		});
		
		container.appendChild(styleSelect);
		
		var jumpSizeUpdate;
		
		var jumpSize = this.addUnitInput(container, 'pt', 22, 33, function()
		{
			jumpSizeUpdate.apply(this, arguments);
		});
		
		jumpSizeUpdate = this.installInputHandler(jumpSize, 'jumpSize',
			Draw.defaultJumpSize, 0, 999, ' pt');
		
		var listener = bpmUtils.bind(this, function(sender, evt, force)
		{
			ss = this.format.getSelectionState();
			styleSelect.value = bpmUtils.getValue(ss.style, 'jumpStyle', 'none');

			if (force || document.activeElement != jumpSize)
			{
				var tmp = parseInt(bpmUtils.getValue(ss.style, 'jumpSize', Draw.defaultJumpSize));
				jumpSize.value = (isNaN(tmp)) ? '' : tmp  + ' pt';
			}
		});

		this.addKeyHandler(jumpSize, listener);

		graph.getModel().addListener(bpmEvent.CHANGE, listener);
		this.listeners.push({destroy: function() { graph.getModel().removeListener(listener); }});
		listener();
	}
	else
	{
		container.style.display = 'none';
	}
	
	return container;
};

/**
 * Adds the label menu items to the given menu and parent.
 */
StyleBpmSchemePanel.prototype.addEffects = function(div)
{
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;
	var ss = this.format.getSelectionState();
	
	div.style.paddingTop = '0px';
	div.style.paddingBottom = '2px';

	var table = document.createElement('table');

	if (bpmCore.IS_QUIRKS)
	{
		table.style.fontSize = '1em';
	}

	table.style.width = '100%';
	table.style.fontWeight = 'bold';
	table.style.paddingRight = '20px';
	var tbody = document.createElement('tbody');
	var row = document.createElement('tr');
	row.style.padding = '0px';
	var left = document.createElement('td');
	left.style.padding = '0px';
	left.style.width = '50%';
	left.setAttribute('valign', 'top');
	
	var right = left.cloneNode(true);
	right.style.paddingLeft = '8px';
	row.appendChild(left);
	row.appendChild(right);
	tbody.appendChild(row);
	table.appendChild(tbody);
	div.appendChild(table);

	var current = left;
	var count = 0;
	
	var addOption = bpmUtils.bind(this, function(label, key, defaultValue)
	{
		var opt = this.createCellOption(label, key, defaultValue);
		opt.style.width = '100%';
		current.appendChild(opt);
		current = (current == left) ? right : left;
		count++;
	});

	var listener = bpmUtils.bind(this, function(sender, evt, force)
	{
		ss = this.format.getSelectionState();
		
		left.innerHTML = '';
		right.innerHTML = '';
		current = left;
		
		if (ss.rounded)
		{
			addOption(bpmResources.get('rounded'), bpmConstants.STYLE_ROUNDED, 0);
		}
		
		if (ss.style.shape == 'swimlane')
		{
			addOption(bpmResources.get('divider'), 'swimlaneLine', 1);
		}

		if (!ss.containsImage)
		{
			addOption(bpmResources.get('shadow'), bpmConstants.STYLE_SHADOW, 0);
		}
		
		if (ss.glass)
		{
			addOption(bpmResources.get('glass'), bpmConstants.STYLE_GLASS, 0);
		}

		if (ss.comic)
		{
			addOption(bpmResources.get('comic'), 'comic', 0);
		}
		
		if (count == 0)
		{
			div.style.display = 'none';
		}
	});
	
	graph.getModel().addListener(bpmEvent.CHANGE, listener);
	this.listeners.push({destroy: function() { graph.getModel().removeListener(listener); }});
	listener();

	return div;
}

/**
 * Adds the label menu items to the given menu and parent.
 */
StyleBpmSchemePanel.prototype.addStyleOps = function(div)
{
	// div.style.paddingTop = '10px';
	// div.style.paddingBottom = '10px';
	
	// var btn = bpmUtils.button(bpmResources.get('setAsDefaultStyle'), bpmUtils.bind(this, function(evt)
	// {
	// 	this.editorUi.actions.get('setAsDefaultStyle').funct();
	// }));
	
	// btn.setAttribute('title', bpmResources.get('setAsDefaultStyle') + ' (' + this.editorUi.actions.get('setAsDefaultStyle').shortcut + ')');
	// btn.style.width = '202px';
	// div.appendChild(btn);

	return div;
};

/**
 * Adds the label menu items to the given menu and parent.
 */
DiagramBpmSchemePanel = function(format, editorUi, container)
{
	BaseBpmSchemePanel.call(this, format, editorUi, container);
	this.init();
};

bpmUtils.extend(DiagramBpmSchemePanel, BaseBpmSchemePanel);

/**
 * Switch to disable page view.
 */
DiagramBpmSchemePanel.showPageView = true;

/**
 * Specifies if the background image option should be shown. Default is true.
 */
DiagramBpmSchemePanel.prototype.showBackgroundImageOption = true;

/**
 * Adds the label menu items to the given menu and parent.
 */
DiagramBpmSchemePanel.prototype.init = function()
{
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;

	this.container.appendChild(this.addView(this.createPanel()));

	if (graph.isEnabled())
	{
		// this.container.appendChild(this.addOptions(this.createPanel()));
		// this.container.appendChild(this.addPaperSize(this.createPanel()));
		// this.container.appendChild(this.addStyleOps(this.createPanel()));
	}
};

/**
 * Adds the label menu items to the given menu and parent.
 */
DiagramBpmSchemePanel.prototype.addView = function(div)
{
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;
	
	div.appendChild(this.createTitle(bpmResources.get('pageSetting'))); //////////////////////////////////////////////////////////////////////////////////////////
	
	// Grid
	this.addGridOption(div);
	
	// Page View
	if (DiagramBpmSchemePanel.showPageView)
	{
		div.appendChild(this.createOption(bpmResources.get('pageView'), function()
		{
			return graph.pageVisible;
		}, function(checked)
		{
			ui.actions.get('pageView').funct();
		},
		{
			install: function(apply)
			{
				this.listener = function()
				{
					apply(graph.pageVisible);
				};
				
				ui.addListener('pageViewChanged', this.listener);
			},
			destroy: function()
			{
				ui.removeListener(this.listener);
			}
		}));
	}
	
	if (graph.isEnabled())
	{
		// Background
		var bg = this.createColorOption(bpmResources.get('background'), function()
		{
			return graph.background;
		}, function(color)
		{
			var change = new ChangePageSetup(ui, color);
			change.ignoreImage = true;
			
			graph.model.execute(change);
		}, '#ffffff',
		{
			install: function(apply)
			{
				this.listener = function()
				{
					apply(graph.background);
				};
				
				ui.addListener('backgroundColorChanged', this.listener);
			},
			destroy: function()
			{
				ui.removeListener(this.listener);
			}
		});
		
		if (this.showBackgroundImageOption)
		{
			// var btn = bpmUtils.button(bpmResources.get('image'), function(evt)
			// {
			// 	ui.showBackgroundImageBpmModal();
			// 	bpmEvent.consume(evt);
			// })
		
			// btn.style.position = 'absolute';
			// btn.className = 'geColorBtn';
			// btn.style.marginTop = '-4px';
			// btn.style.paddingBottom = (document.documentMode == 11 || bpmCore.IS_MT) ? '0px' : '2px';
			// btn.style.height = '22px';
			// btn.style.right = (bpmCore.IS_QUIRKS) ? '52px' : '72px';
			// btn.style.width = '56px';
		
			// bg.appendChild(btn);
		}
		
		div.appendChild(bg);
	}
	
	return div;
};

/**
 * Adds the label menu items to the given menu and parent.
 */
DiagramBpmSchemePanel.prototype.addOptions = function(div)
{
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;
	
	div.appendChild(this.createTitle(bpmResources.get('options')));	

	if (graph.isEnabled())
	{
		// Connection arrows
		div.appendChild(this.createOption(bpmResources.get('connectionArrows'), function()
		{
			return graph.connectionArrowsEnabled;
		}, function(checked)
		{
			ui.actions.get('connectionArrows').funct();
		},
		{
			install: function(apply)
			{
				this.listener = function()
				{
					apply(graph.connectionArrowsEnabled);
				};
				
				ui.addListener('connectionArrowsChanged', this.listener);
			},
			destroy: function()
			{
				ui.removeListener(this.listener);
			}
		}));
		
		// Connection points
		div.appendChild(this.createOption(bpmResources.get('connectionPoints'), function()
		{
			return graph.connectionHandler.isEnabled();
		}, function(checked)
		{
			ui.actions.get('connectionPoints').funct();
		},
		{
			install: function(apply)
			{
				this.listener = function()
				{
					apply(graph.connectionHandler.isEnabled());
				};
				
				ui.addListener('connectionPointsChanged', this.listener);
			},
			destroy: function()
			{
				ui.removeListener(this.listener);
			}
		}));

		// Guides
		div.appendChild(this.createOption(bpmResources.get('guides'), function()
		{
			return graph.graphHandler.guidesEnabled;
		}, function(checked)
		{
			ui.actions.get('guides').funct();
		},
		{
			install: function(apply)
			{
				this.listener = function()
				{
					apply(graph.graphHandler.guidesEnabled);
				};
				
				ui.addListener('guidesEnabledChanged', this.listener);
			},
			destroy: function()
			{
				ui.removeListener(this.listener);
			}
		}));
	}

	return div;
};

/**
 * 
 */
DiagramBpmSchemePanel.prototype.addGridOption = function(container)
{
	var ui = this.editorUi;
	var graph = ui.editor.graph;
	
	var input = document.createElement('input');
	input.style.position = 'absolute';
	input.style.textAlign = 'right';
	input.style.width = '38px';
	input.value = graph.getGridSize() + ' pt';
	
	var stepper = this.createStepper(input, update);
	input.style.display = (graph.isGridEnabled()) ? '' : 'none';
	stepper.style.display = input.style.display;

	bpmEvent.addListener(input, 'keydown', function(e)
	{
		if (e.keyCode == 13)
		{
			graph.container.focus();
			bpmEvent.consume(e);
		}
		else if (e.keyCode == 27)
		{
			input.value = graph.getGridSize();
			graph.container.focus();
			bpmEvent.consume(e);
		}
	});
	
	function update(evt)
	{
		var value = parseInt(input.value);
		value = Math.max(1, (isNaN(value)) ? 10 : value);
		
		if (value != graph.getGridSize())
		{
			graph.setGridSize(value)
		}

		input.value = value + ' pt';
		bpmEvent.consume(evt);
	};

	bpmEvent.addListener(input, 'blur', update);
	bpmEvent.addListener(input, 'change', update);
	
	if (bpmCore.IS_SVG)
	{
		input.style.marginTop = '-2px';
		input.style.right = '84px';
		stepper.style.marginTop = '-18px';
		stepper.style.right = '72px';
	
		var panel = this.createColorOption(bpmResources.get('grid'), function()
		{
			var color = graph.view.gridColor;

			return (graph.isGridEnabled()) ? color : null;
		}, function(color)
		{
			if (color == bpmConstants.NONE)
			{
				graph.setGridEnabled(false);
			}
			else
			{
				graph.setGridEnabled(true);
				ui.setGridColor(color);
			}

			input.style.display = (graph.isGridEnabled()) ? '' : 'none';
			stepper.style.display = input.style.display;
			ui.fireEvent(new bpmEventObject('gridEnabledChanged'));
		}, '#e0e0e0',
		{
			install: function(apply)
			{
				this.listener = function()
				{
					apply((graph.isGridEnabled()) ? graph.view.gridColor : null);
				};
				
				ui.addListener('gridColorChanged', this.listener);
				ui.addListener('gridEnabledChanged', this.listener);
			},
			destroy: function()
			{
				ui.removeListener(this.listener);
			}
		});

		panel.appendChild(input);
		panel.appendChild(stepper);
		container.appendChild(panel);
	}
	else
	{
		input.style.marginTop = '2px';
		input.style.right = '32px';
		stepper.style.marginTop = '2px';
		stepper.style.right = '20px';
		
		container.appendChild(input);
		container.appendChild(stepper);
		
		container.appendChild(this.createOption(bpmResources.get('grid'), function()
		{
			return graph.isGridEnabled();
		}, function(checked)
		{
			graph.setGridEnabled(checked);
			
			if (graph.isGridEnabled())
			{
				graph.view.gridColor = '#e0e0e0';
			}
			
			ui.fireEvent(new bpmEventObject('gridEnabledChanged'));
		},
		{
			install: function(apply)
			{
				this.listener = function()
				{
					input.style.display = (graph.isGridEnabled()) ? '' : 'none';
					stepper.style.display = input.style.display;
					
					apply(graph.isGridEnabled());
				};
				
				ui.addListener('gridEnabledChanged', this.listener);
			},
			destroy: function()
			{
				ui.removeListener(this.listener);
			}
		}));
	}
};

/**
 * Adds the label menu items to the given menu and parent.
 */
DiagramBpmSchemePanel.prototype.addDocumentProperties = function(div)
{
	// Hook for subclassers
	var ui = this.editorUi;
	var editor = ui.editor;
	var graph = editor.graph;
	
	div.appendChild(this.createTitle(bpmResources.get('options')));

	return div;
};

/**
 * Adds the label menu items to the given menu and parent.
 */
DiagramBpmSchemePanel.prototype.addPaperSize = function(div)
{
	// var ui = this.editorUi;
	// var editor = ui.editor;
	// var graph = editor.graph;
	
	// div.appendChild(this.createTitle(bpmResources.get('paperSize')));

	// var accessor = PageSetupBpmModal.addPageBpmSchemePanel(div, 'formatpanel', graph.pageBpmScheme, function(pageBpmScheme)
	// {
	// 	if (graph.pageBpmScheme == null || graph.pageBpmScheme.width != pageBpmScheme.width ||
	// 		graph.pageBpmScheme.height != pageBpmScheme.height)
	// 	{
	// 		var change = new ChangePageSetup(ui, null, null, pageBpmScheme);
	// 		change.ignoreColor = true;
	// 		change.ignoreImage = true;
			
	// 		graph.model.execute(change);
	// 	}
	// });
	
	// this.addKeyHandler(accessor.widthInput, function()
	// {
	// 	accessor.set(graph.pageBpmScheme);
	// });
	// this.addKeyHandler(accessor.heightInput, function()
	// {
	// 	accessor.set(graph.pageBpmScheme);	
	// });
	
	// var listener = function()
	// {
	// 	accessor.set(graph.pageBpmScheme);
	// };
	
	// ui.addListener('pageBpmSchemeChanged', listener);
	// this.listeners.push({destroy: function() { ui.removeListener(listener); }});
	
	// graph.getModel().addListener(bpmEvent.CHANGE, listener);
	// this.listeners.push({destroy: function() { graph.getModel().removeListener(listener); }});
	
	return div;
};

/**
 * Adds the label menu items to the given menu and parent.
 */
DiagramBpmSchemePanel.prototype.addStyleOps = function(div)
{
	var btn = bpmUtils.button(bpmResources.get('editData'), bpmUtils.bind(this, function(evt)
	{
		this.editorUi.actions.get('editData').funct();
	}));
	
	btn.setAttribute('title', bpmResources.get('editData') + ' (' + this.editorUi.actions.get('editData').shortcut + ')');
	btn.style.width = '202px';
	btn.style.marginBottom = '2px';
	div.appendChild(btn);

	bpmUtils.br(div);
	
	btn = bpmUtils.button(bpmResources.get('clearDefaultStyle'), bpmUtils.bind(this, function(evt)
	{
		this.editorUi.actions.get('clearDefaultStyle').funct();
	}));
	
	btn.setAttribute('title', bpmResources.get('clearDefaultStyle') + ' (' + this.editorUi.actions.get('clearDefaultStyle').shortcut + ')');
	btn.style.width = '202px';
	div.appendChild(btn);

	return div;
};

/**
 * Adds the label menu items to the given menu and parent.
 */
DiagramBpmSchemePanel.prototype.destroy = function()
{
	BaseBpmSchemePanel.prototype.destroy.apply(this, arguments);
	
	if (this.gridEnabledListener)
	{
		this.editorUi.removeListener(this.gridEnabledListener);
		this.gridEnabledListener = null;
	}
};



/**
 * Constructs a new open dialog.
 */
var OpenBpmModal = function()
{
	var iframe = '';
	if (BpmDraw.useLocalStorage)
		iframe = document.createElement('div');
	else
		iframe = document.createElement('iframe');

	iframe.style.backgroundColor = 'transparent';
	iframe.allowTransparency = 'true';
	iframe.style.borderStyle = 'none';
	iframe.style.borderWidth = '0px';
	iframe.style.overflow = 'hidden';
	iframe.frameBorder = '0';
	
	// Adds padding as a workaround for box model in older IE versions
	var dx = (bpmCore.IS_VML && (document.documentMode == null || document.documentMode < 8)) ? 20 : 0;
	
	iframe.setAttribute('width', (((BpmDraw.useLocalStorage) ? 640 : 320) + dx) + 'px');
	iframe.setAttribute('height', (((BpmDraw.useLocalStorage) ? 480 : 220) + dx) + 'px');
	
	if (BpmDraw.useLocalStorage)
	{
		var div = document.createElement('div');
		div.style.fontFamily = 'Arial';
		if (localStorage.length == 0)
		{
			bpmUtils.write(div, window.parent.bpmResources.get('noFiles'));
		}
		else
		{
			var keys = [];
			
			for (var i = 0; i < localStorage.length; i++)
			{
				keys.push(localStorage.key(i));
			}
			
			// Sorts the array by filename (key)
			keys.sort(function (a, b)
			{
			    return a.toLowerCase().localeCompare(b.toLowerCase());
			});
			
			for (var i = 0; i < keys.length; i++)
			{
				var itemdiv = document.createElement('div');
				itemdiv.style.display = 'flex';
				itemdiv.style.alignItems = 'center';
				itemdiv.style.marginTop = '10px';
				var link = document.createElement('a');
				link.style.fontDecoration = 'none';
				link.style.fontSize = '14pt';
				var key = keys[i];
				bpmUtils.write(link, key);
				link.setAttribute('href', 'javascript:void(0);');
				itemdiv.appendChild(link);
				
				var img = document.createElement('span');
				img.className = 'geSprite geSprite-delete';
				img.style.position = 'relative';
				img.style.cursor = 'pointer';
				img.style.display = 'inline-block';
				itemdiv.appendChild(img);
				
				div.appendChild(itemdiv);
				
				bpmEvent.addListener(img, 'click', (function(k)
				{
					return function()
					{
						if (bpmUtils.confirm(bpmResources.get('delete') + ' "' + k + '"?'))
						{
							localStorage.removeItem(k);
							window.location.reload();
						}
					};
				})(key));

				bpmEvent.addListener(link, 'click', (function(k)
				{
					return function()
					{
						try
						{
							open(window.location.href);
							openFile.setData(localStorage.getItem(k), k);
						}
						catch (e)
						{
							bpmUtils.alert(e.message);
						}
					};
				})(key));
			}
		}

		// bpmUtils.br(div);
		
		var cancelBtn = bpmUtils.button(bpmResources.get('cancel'), function()
		{
			window.openFile.cancel(true);
		});
		cancelBtn.className = 'geBtn';
		cancelBtn.style.right = '30px';
		cancelBtn.style.position = "absolute";
		cancelBtn.style.bottom = '30px';
		div.appendChild(cancelBtn);
		
		iframe.appendChild(div);
	}
	else
		iframe.setAttribute('src', OPEN_FORM);

	this.container = iframe;
};

/**
 * Constructs a new color dialog.
 */
var ColorBpmModal = function(editorUi, color, apply, cancelFn)
{
	this.editorUi = editorUi;
	
	var input = document.createElement('input');
	input.style.marginBottom = '10px';
	input.style.width = '216px';
	
	// Required for picker to render in IE
	if (bpmCore.IS_IE)
	{
		input.style.marginTop = '10px';
		document.body.appendChild(input);
	}
	
	this.init = function()
	{
		if (!bpmCore.IS_TOUCH)
		{
			input.focus();
		}
	};

	var picker = new jscolor.color(input);
	picker.pickerOnfocus = false;
	picker.showPicker();

	var div = document.createElement('div');
	jscolor.picker.box.style.position = 'relative';
	jscolor.picker.box.style.width = '230px';
	jscolor.picker.box.style.height = '100px';
	jscolor.picker.box.style.paddingBottom = '10px';
	div.appendChild(jscolor.picker.box);

	var center = document.createElement('center');
	
	function createRecentColorTable()
	{
		var table = addPresets((ColorBpmModal.recentColors.length == 0) ? ['FFFFFF'] :
					ColorBpmModal.recentColors, 11, 'FFFFFF', true);
		table.style.marginBottom = '8px';
		
		return table;
	};
	
	function addPresets(presets, rowLength, defaultColor, addResetOption)
	{
		rowLength = (rowLength != null) ? rowLength : 12;
		var table = document.createElement('table');
		table.style.borderCollapse = 'collapse';
		table.setAttribute('cellspacing', '0');
		table.style.marginBottom = '20px';
		table.style.cellSpacing = '0px';
		var tbody = document.createElement('tbody');
		table.appendChild(tbody);

		var rows = presets.length / rowLength;
		
		for (var row = 0; row < rows; row++)
		{
			var tr = document.createElement('tr');
			
			for (var i = 0; i < rowLength; i++)
			{
				(function(clr)
				{
					var td = document.createElement('td');
					td.style.border = '1px solid black';
					td.style.padding = '0px';
					td.style.width = '16px';
					td.style.height = '16px';
					
					if (clr == null)
					{
						clr = defaultColor;
					}
					
					if (clr == 'none')
					{
						td.style.background = 'url(\'' + BpmModal.prototype.noColorImage + '\')';
					}
					else
					{
						td.style.backgroundColor = '#' + clr;
					}
					
					tr.appendChild(td);

					if (clr != null)
					{
						td.style.cursor = 'pointer';
						
						bpmEvent.addListener(td, 'click', function()
						{
							if (clr == 'none')
							{
								picker.fromString('ffffff');
								input.value = 'none';
							}
							else
							{
								picker.fromString(clr);
							}
						});
					}
				})(presets[row * rowLength + i]);
			}
			
			tbody.appendChild(tr);
		}
		
		if (addResetOption)
		{
			var td = document.createElement('td');
			td.setAttribute('title', bpmResources.get('reset'));
			td.style.border = '1px solid black';
			td.style.padding = '0px';
			td.style.width = '16px';
			td.style.height = '16px';
			td.style.backgroundImage = 'url(\'' + BpmModal.prototype.closeImage + '\')';
			td.style.backgroundPosition = 'center center';
			td.style.backgroundRepeat = 'no-repeat';
			td.style.cursor = 'pointer';
			
			tr.appendChild(td);

			bpmEvent.addListener(td, 'click', function()
			{
				ColorBpmModal.resetRecentColors();
				table.parentNode.replaceChild(createRecentColorTable(), table);
			});
		}
		
		center.appendChild(table);
		
		return table;
	};

	div.appendChild(input);
	bpmUtils.br(div);
	
	// Adds recent colors
	createRecentColorTable();
		
	// Adds presets
	var table = addPresets(this.presetColors);
	table.style.marginBottom = '8px';
	table = addPresets(this.defaultColors);
	table.style.marginBottom = '16px';

	div.appendChild(center);

	var buttons = document.createElement('div');
	buttons.style.textAlign = 'right';
	buttons.style.whiteSpace = 'nowrap';
	
	var cancelBtn = bpmUtils.button(bpmResources.get('cancel'), function()
	{
		editorUi.hideBpmModal();
		
		if (cancelFn != null)
		{
			cancelFn();
		}
	});
	cancelBtn.className = 'geBtn';

	if (editorUi.editor.cancelFirst)
	{
		buttons.appendChild(cancelBtn);
	}
	
	var applyFunction = (apply != null) ? apply : this.createApplyFunction();
	
	var applyBtn = bpmUtils.button(bpmResources.get('apply'), function()
	{
		var color = input.value;
		
		// Blocks any non-alphabetic chars in colors
		if (/(^#?[a-zA-Z0-9]*$)/.test(color))
		{
			ColorBpmModal.addRecentColor(color, 12);
			
			if (color != 'none' && color.charAt(0) != '#')
			{
				color = '#' + color;
			}

			applyFunction(color);
			editorUi.hideBpmModal();
		}
		else
		{
			editorUi.handleError({message: bpmResources.get('invalidInput')});	
		}
	});
	applyBtn.className = 'geBtn gePrimaryBtn';
	buttons.appendChild(applyBtn);
	
	if (!editorUi.editor.cancelFirst)
	{
		buttons.appendChild(cancelBtn);
	}
	
	if (color != null)
	{
		if (color == 'none')
		{
			picker.fromString('ffffff');
			input.value = 'none';
		}
		else
		{
			picker.fromString(color);
		}
	}
	
	div.appendChild(buttons);
	this.picker = picker;
	this.colorInput = input;

	// LATER: Only fires if input if focused, should always
	// fire if this dialog is showing.
	bpmEvent.addListener(div, 'keydown', function(e)
	{
		if (e.keyCode == 27)
		{
			editorUi.hideBpmModal();
			
			if (cancelFn != null)
			{
				cancelFn();
			}
			
			bpmEvent.consume(e);
		}
	});
	
	this.container = div;
};

/**
 * Creates function to apply value
 */
ColorBpmModal.prototype.presetColors = ['E6D0DE', 'CDA2BE', 'B5739D', 'E1D5E7', 'C3ABD0', 'A680B8', 'D4E1F5', 'A9C4EB', '7EA6E0', 'D5E8D4', '9AC7BF', '67AB9F', 'D5E8D4', 'B9E0A5', '97D077', 'FFF2CC', 'FFE599', 'FFD966', 'FFF4C3', 'FFCE9F', 'FFB570', 'F8CECC', 'F19C99', 'EA6B66']; 

/**
 * Creates function to apply value
 */
ColorBpmModal.prototype.defaultColors = ['none', 'FFFFFF', 'E6E6E6', 'CCCCCC', 'B3B3B3', '999999', '808080', '666666', '4D4D4D', '333333', '1A1A1A', '000000', 'FFCCCC', 'FFE6CC', 'FFFFCC', 'E6FFCC', 'CCFFCC', 'CCFFE6', 'CCFFFF', 'CCE5FF', 'CCCCFF', 'E5CCFF', 'FFCCFF', 'FFCCE6',
		'FF9999', 'FFCC99', 'FFFF99', 'CCFF99', '99FF99', '99FFCC', '99FFFF', '99CCFF', '9999FF', 'CC99FF', 'FF99FF', 'FF99CC', 'FF6666', 'FFB366', 'FFFF66', 'B3FF66', '66FF66', '66FFB3', '66FFFF', '66B2FF', '6666FF', 'B266FF', 'FF66FF', 'FF66B3', 'FF3333', 'FF9933', 'FFFF33',
		'99FF33', '33FF33', '33FF99', '33FFFF', '3399FF', '3333FF', '9933FF', 'FF33FF', 'FF3399', 'FF0000', 'FF8000', 'FFFF00', '80FF00', '00FF00', '00FF80', '00FFFF', '007FFF', '0000FF', '7F00FF', 'FF00FF', 'FF0080', 'CC0000', 'CC6600', 'CCCC00', '66CC00', '00CC00', '00CC66',
		'00CCCC', '0066CC', '0000CC', '6600CC', 'CC00CC', 'CC0066', '990000', '994C00', '999900', '4D9900', '009900', '00994D', '009999', '004C99', '000099', '4C0099', '990099', '99004D', '660000', '663300', '666600', '336600', '006600', '006633', '006666', '003366', '000066',
		'330066', '660066', '660033', '330000', '331A00', '333300', '1A3300', '003300', '00331A', '003333', '001933', '000033', '190033', '330033', '33001A'];

/**
 * Creates function to apply value
 */
ColorBpmModal.prototype.createApplyFunction = function()
{
	return bpmUtils.bind(this, function(color)
	{
		var graph = this.editorUi.editor.graph;
		
		graph.getModel().beginUpdate();
		try
		{
			graph.setCellStyles(this.currentColorKey, color);
			this.editorUi.fireEvent(new bpmEventObject('styleChanged', 'keys', [this.currentColorKey],
				'values', [color], 'cells', graph.getSelectionCells()));
		}
		finally
		{
			graph.getModel().endUpdate();
		}
	});
};

/**
 * 
 */
ColorBpmModal.recentColors = [];

/**
 * Adds recent color for later use.
 */
ColorBpmModal.addRecentColor = function(color, max)
{
	if (color != null)
	{
		bpmUtils.remove(color, ColorBpmModal.recentColors);
		ColorBpmModal.recentColors.splice(0, 0, color);
		
		if (ColorBpmModal.recentColors.length >= max)
		{
			ColorBpmModal.recentColors.pop();
		}
	}
};

/**
 * Adds recent color for later use.
 */
ColorBpmModal.resetRecentColors = function()
{
	ColorBpmModal.recentColors = [];
};

/**
 * Constructs a new about dialog.
 */
var AboutBpmModal = function(editorUi)
{
	var div = document.createElement('div');
	div.setAttribute('align', 'center');
	var h3 = document.createElement('h3');
	bpmUtils.write(h3, bpmResources.get('about') + ' GraphEditor');
	div.appendChild(h3);
	var img = document.createElement('img');
	img.style.border = '0px';
	img.setAttribute('width', '176');
	img.setAttribute('width', '151');
	img.setAttribute('src', IMAGE_PATH + '/logo.png');
	div.appendChild(img);
	bpmUtils.br(div);
	bpmUtils.write(div, 'Powered by bpmGraph ' + bpmCore.VERSION);
	bpmUtils.br(div);
	var link = document.createElement('a');
	link.setAttribute('href', 'http://www.jgraph.com/');
	link.setAttribute('target', '_blank');
	bpmUtils.write(link, 'www.jgraph.com');
	div.appendChild(link);
	bpmUtils.br(div);
	bpmUtils.br(div);
	var closeBtn = bpmUtils.button(bpmResources.get('close'), function()
	{
		editorUi.hideBpmModal();
	});
	closeBtn.className = 'geBtn gePrimaryBtn';
	div.appendChild(closeBtn);
	
	this.container = div;
};

/**
 * Constructs a new filename dialog.
 */
var FilenameBpmModal = function(editorUi, filename, buttonText, fn, label, validateFn, content, helpLink, closeOnBtn, cancelFn, hints, w)
{
	closeOnBtn = (closeOnBtn != null) ? closeOnBtn : true;
	var row, td;
	
	var table = document.createElement('table');
	var tbody = document.createElement('tbody');
	table.style.marginTop = '8px';
	
	row = document.createElement('tr');
	
	td = document.createElement('td');
	td.style.whiteSpace = 'nowrap';
	td.style.fontSize = '10pt';
	td.style.width = '120px';
	bpmUtils.write(td, (label || bpmResources.get('filename')) + ':');
	
	row.appendChild(td);
	
	var nameInput = document.createElement('input');
	nameInput.setAttribute('value', filename || '');
	nameInput.style.marginLeft = '4px';
	nameInput.style.width = (w != null) ? w + 'px' : '180px';
	
	var genericBtn = bpmUtils.button(buttonText, function()
	{
		if (validateFn == null || validateFn(nameInput.value))
		{
			if (closeOnBtn)
			{
				editorUi.hideBpmModal();
			}
			
			fn(nameInput.value);
		}
	});
	genericBtn.className = 'geBtn gePrimaryBtn';
	
	this.init = function()
	{
		if (label == null && content != null)
		{
			return;
		}
		
		nameInput.focus();
		
		if (bpmCore.IS_GC || bpmCore.IS_FF || document.documentMode >= 5 || bpmCore.IS_QUIRKS)
		{
			nameInput.select();
		}
		else
		{
			document.execCommand('selectAll', false, null);
		}
		
		// Installs drag and drop handler for links
		if (Draw.fileSupport)
		{
			// Setup the dnd listeners
			var dlg = table.parentNode;
			
			if (dlg != null)
			{
				var graph = editorUi.editor.graph;
				var dropElt = null;
					
				bpmEvent.addListener(dlg, 'dragleave', function(evt)
				{
					if (dropElt != null)
				    {
						dropElt.style.backgroundColor = '';
				    	dropElt = null;
				    }
				    
					evt.stopPropagation();
					evt.preventDefault();
				});
				
				bpmEvent.addListener(dlg, 'dragover', bpmUtils.bind(this, function(evt)
				{
					// IE 10 does not implement pointer-events so it can't have a drop highlight
					if (dropElt == null && (!bpmCore.IS_IE || document.documentMode > 10))
					{
						dropElt = nameInput;
						dropElt.style.backgroundColor = '#ebf2f9';
					}
					
					evt.stopPropagation();
					evt.preventDefault();
				}));
						
				bpmEvent.addListener(dlg, 'drop', bpmUtils.bind(this, function(evt)
				{
				    if (dropElt != null)
				    {
						dropElt.style.backgroundColor = '';
				    	dropElt = null;
				    }
	
				    if (bpmUtils.indexOf(evt.dataTransfer.types, 'text/uri-list') >= 0)
				    {
				    	nameInput.value = decodeURIComponent(evt.dataTransfer.getData('text/uri-list'));
				    	genericBtn.click();
				    }
	
				    evt.stopPropagation();
				    evt.preventDefault();
				}));
			}
		}
	};

	td = document.createElement('td');
	td.appendChild(nameInput);
	row.appendChild(td);
	
	if (label != null || content == null)
	{
		tbody.appendChild(row);
		
		if (hints != null)
		{
			td.appendChild(FilenameBpmModal.createTypeHint(editorUi, nameInput, hints));
		}
	}
	
	if (content != null)
	{
		row = document.createElement('tr');
		td = document.createElement('td');
		td.colSpan = 2;
		td.appendChild(content);
		row.appendChild(td);
		tbody.appendChild(row);
	}
	
	row = document.createElement('tr');
	td = document.createElement('td');
	td.colSpan = 2;
	td.style.paddingTop = '20px';
	td.style.whiteSpace = 'nowrap';
	td.setAttribute('align', 'right');
	
	var cancelBtn = bpmUtils.button(bpmResources.get('cancel'), function()
	{
		editorUi.hideBpmModal();
		
		if (cancelFn != null)
		{
			cancelFn();
		}
	});
	cancelBtn.className = 'geBtn';
	
	if (editorUi.editor.cancelFirst)
	{
		td.appendChild(cancelBtn);
	}
	
	if (helpLink != null)
	{
		var helpBtn = bpmUtils.button(bpmResources.get('help'), function()
		{
			editorUi.editor.graph.openLink(helpLink);
		});
		
		helpBtn.className = 'geBtn';	
		td.appendChild(helpBtn);
	}

	bpmEvent.addListener(nameInput, 'keypress', function(e)
	{
		if (e.keyCode == 13)
		{
			genericBtn.click();
		}
	});
	
	td.appendChild(genericBtn);
	
	if (!editorUi.editor.cancelFirst)
	{
		td.appendChild(cancelBtn);
	}

	row.appendChild(td);
	tbody.appendChild(row);
	table.appendChild(tbody);
	
	this.container = table;
};

/**
 * 
 */
FilenameBpmModal.filenameHelpLink = null;

/**
 * 
 */
FilenameBpmModal.createTypeHint = function(ui, nameInput, hints)
{
	var hint = document.createElement('img');
	hint.style.cssText = 'vertical-align:top;height:16px;width:16px;margin-left:4px;background-repeat:no-repeat;background-position:center bottom;cursor:pointer;';
	bpmUtils.setOpacity(hint, 70);
	
	var nameChanged = function()
	{
		hint.setAttribute('src', BpmDraw.helpImage);
		hint.setAttribute('title', bpmResources.get('help'));
		
		for (var i = 0; i < hints.length; i++)
		{
			if (hints[i].ext.length > 0 &&
				nameInput.value.substring(nameInput.value.length -
						hints[i].ext.length - 1) == '.' + hints[i].ext)
			{
				hint.setAttribute('src',  bpmCore.imageBasePath + '/warning.png');
				hint.setAttribute('title', bpmResources.get(hints[i].title));
				break;
			}
		}
	};
	
	bpmEvent.addListener(nameInput, 'keyup', nameChanged);
	bpmEvent.addListener(nameInput, 'change', nameChanged);
	bpmEvent.addListener(hint, 'click', function(evt)
	{
		var title = hint.getAttribute('title');
		
		if (hint.getAttribute('src') == BpmDraw.helpImage)
		{
			ui.editor.graph.openLink(FilenameBpmModal.filenameHelpLink);
		}
		else if (title != '')
		{
			ui.showError(null, title, bpmResources.get('help'), function()
			{
				ui.editor.graph.openLink(FilenameBpmModal.filenameHelpLink);
			}, null, bpmResources.get('ok'), null, null, null, 340, 90);
		}
		
		bpmEvent.consume(evt);
	});
	
	nameChanged();
	
	return hint;
};

/**
 * Constructs a new textarea dialog.
 */
var TextareaBpmModal = function(editorUi, title, url, fn, cancelFn, cancelTitle, w, h,
	addButtons, noHide, noWrap, applyTitle, helpLink)
{
	w = (w != null) ? w : 300;
	h = (h != null) ? h : 120;
	noHide = (noHide != null) ? noHide : false;
	var row, td;
	
	var table = document.createElement('table');
	var tbody = document.createElement('tbody');
	
	row = document.createElement('tr');
	
	td = document.createElement('td');
	td.style.fontSize = '10pt';
	td.style.width = '100px';
	bpmUtils.write(td, title);
	
	row.appendChild(td);
	tbody.appendChild(row);

	row = document.createElement('tr');
	td = document.createElement('td');

	var nameInput = document.createElement('textarea');
	
	if (noWrap)
	{
		nameInput.setAttribute('wrap', 'off');
	}
	
	nameInput.setAttribute('spellcheck', 'false');
	nameInput.setAttribute('autocorrect', 'off');
	nameInput.setAttribute('autocomplete', 'off');
	nameInput.setAttribute('autocapitalize', 'off');
	
	bpmUtils.write(nameInput, url || '');
	nameInput.style.resize = 'none';
	nameInput.style.width = w + 'px';
	nameInput.style.height = h + 'px';
	
	this.textarea = nameInput;

	this.init = function()
	{
		nameInput.focus();
		nameInput.scrollTop = 0;
	};

	td.appendChild(nameInput);
	row.appendChild(td);
	
	tbody.appendChild(row);

	row = document.createElement('tr');
	td = document.createElement('td');
	td.style.paddingTop = '14px';
	td.style.whiteSpace = 'nowrap';
	td.setAttribute('align', 'right');
	
	if (helpLink != null)
	{
		var helpBtn = bpmUtils.button(bpmResources.get('help'), function()
		{
			editorUi.editor.graph.openLink(helpLink);
		});
		helpBtn.className = 'geBtn';
		
		td.appendChild(helpBtn);
	}
	
	var cancelBtn = bpmUtils.button(cancelTitle || bpmResources.get('cancel'), function()
	{
		editorUi.hideBpmModal();
		
		if (cancelFn != null)
		{
			cancelFn();
		}
	});
	cancelBtn.className = 'geBtn';
	
	if (editorUi.editor.cancelFirst)
	{
		td.appendChild(cancelBtn);
	}
	
	if (addButtons != null)
	{
		addButtons(td, nameInput);
	}
	
	if (fn != null)
	{
		var genericBtn = bpmUtils.button(applyTitle || bpmResources.get('apply'), function()
		{
			if (!noHide)
			{
				editorUi.hideBpmModal();
			}
			
			fn(nameInput.value);
		});
		
		genericBtn.className = 'geBtn gePrimaryBtn';	
		td.appendChild(genericBtn);
	}
	
	if (!editorUi.editor.cancelFirst)
	{
		td.appendChild(cancelBtn);
	}

	row.appendChild(td);
	tbody.appendChild(row);
	table.appendChild(tbody);
	this.container = table;
};

/**
 * Constructs a new edit file dialog.
 */
var EditDiagramBpmModal = function(editorUi)
{
	var div = document.createElement('div');
	div.style.textAlign = 'right';
	var textarea = document.createElement('textarea');
	textarea.setAttribute('wrap', 'off');
	textarea.setAttribute('spellcheck', 'false');
	textarea.setAttribute('autocorrect', 'off');
	textarea.setAttribute('autocomplete', 'off');
	textarea.setAttribute('autocapitalize', 'off');
	textarea.style.overflow = 'auto';
	textarea.style.resize = 'none';
	textarea.style.width = '600px';
	textarea.style.height = '360px';
	textarea.style.marginBottom = '16px';
	
	textarea.value = bpmUtils.getPrettyXml(editorUi.editor.getGraphXml());
	div.appendChild(textarea);
	
	this.init = function()
	{
		textarea.focus();
	};
	
	// Enables dropping files
	if (Draw.fileSupport)
	{
		function handleDrop(evt)
		{
		    evt.stopPropagation();
		    evt.preventDefault();
		    
		    if (evt.dataTransfer.files.length > 0)
		    {
    			var file = evt.dataTransfer.files[0];
    			var reader = new FileReader();
				
				reader.onload = function(e)
				{
					textarea.value = e.target.result;
				};
				
				reader.readAsText(file);
    		}
		    else
		    {
		    	textarea.value = editorUi.extractGraphModelFromEvent(evt);
		    }
		};
		
		function handleDragOver(evt)
		{
			evt.stopPropagation();
			evt.preventDefault();
		};

		// Setup the dnd listeners.
		textarea.addEventListener('dragover', handleDragOver, false);
		textarea.addEventListener('drop', handleDrop, false);
	}
	
	var cancelBtn = bpmUtils.button(bpmResources.get('cancel'), function()
	{
		editorUi.hideBpmModal();
	});
	cancelBtn.className = 'geBtn';
	
	if (editorUi.editor.cancelFirst)
	{
		div.appendChild(cancelBtn);
	}
	
	var select = document.createElement('select');
	select.style.width = '180px';
	select.className = 'geBtn';

	if (editorUi.editor.graph.isEnabled())
	{
		var replaceOption = document.createElement('option');
		replaceOption.setAttribute('value', 'replace');
		bpmUtils.write(replaceOption, bpmResources.get('replaceExistingDrawing'));
		select.appendChild(replaceOption);
	}

	var newOption = document.createElement('option');
	newOption.setAttribute('value', 'new');
	bpmUtils.write(newOption, bpmResources.get('openInNewWindow'));
	
	if (EditDiagramBpmModal.showNewWindowOption)
	{
		select.appendChild(newOption);
	}

	if (editorUi.editor.graph.isEnabled())
	{
		var importOption = document.createElement('option');
		importOption.setAttribute('value', 'import');
		bpmUtils.write(importOption, bpmResources.get('addToExistingDrawing'));
		select.appendChild(importOption);
	}

	div.appendChild(select);

	var okBtn = bpmUtils.button(bpmResources.get('ok'), function()
	{
		// Removes all illegal control characters before parsing
		var data = Draw.zapGremlins(bpmUtils.trim(textarea.value));
		var error = null;
		
		if (select.value == 'new')
		{
			editorUi.hideBpmModal();
			editorUi.editor.editAsNew(data);
		}
		else if (select.value == 'replace')
		{
			editorUi.editor.graph.model.beginUpdate();
			try
			{
				editorUi.editor.setGraphXml(bpmUtils.parseXml(data).documentElement);
				// LATER: Why is hideBpmModal between begin-/endUpdate faster?
				editorUi.hideBpmModal();
			}
			catch (e)
			{
				error = e;
			}
			finally
			{
				editorUi.editor.graph.model.endUpdate();				
			}
		}
		else if (select.value == 'import')
		{
			editorUi.editor.graph.model.beginUpdate();
			try
			{
				var doc = bpmUtils.parseXml(data);
				var model = new bpmGraphModel();
				var codec = new bpmCodec(doc);
				codec.decode(doc.documentElement, model);
				
				var children = model.getChildren(model.getChildAt(model.getRoot(), 0));
				editorUi.editor.graph.setSelectionCells(editorUi.editor.graph.importCells(children));
				
				// LATER: Why is hideBpmModal between begin-/endUpdate faster?
				editorUi.hideBpmModal();
			}
			catch (e)
			{
				error = e;
			}
			finally
			{
				editorUi.editor.graph.model.endUpdate();				
			}
		}
			
		if (error != null)
		{
			bpmUtils.alert(error.message);
		}
	});
	okBtn.className = 'geBtn gePrimaryBtn';
	div.appendChild(okBtn);
	
	if (!editorUi.editor.cancelFirst)
	{
		div.appendChild(cancelBtn);
	}

	this.container = div;
};

/**
 * 
 */
EditDiagramBpmModal.showNewWindowOption = true;

/**
 * Constructs a new export dialog.
 */
var ExportBpmModal = function(editorUi)
{
	var graph = editorUi.editor.graph;
	var bounds = graph.getGraphBounds();
	var scale = graph.view.scale;
	
	var width = Math.ceil(bounds.width / scale);
	var height = Math.ceil(bounds.height / scale);

	var row, td;
	
	var table = document.createElement('table');
	var tbody = document.createElement('tbody');
	table.setAttribute('cellpadding', (bpmCore.IS_SF) ? '0' : '2');
	
	row = document.createElement('tr');
	
	td = document.createElement('td');
	td.style.fontSize = '10pt';
	td.style.width = '100px';
	bpmUtils.write(td, bpmResources.get('filename') + ':');
	
	row.appendChild(td);
	
	var nameInput = document.createElement('input');
	nameInput.setAttribute('value', editorUi.editor.getOrCreateFilename());
	nameInput.style.width = '180px';

	td = document.createElement('td');
	td.appendChild(nameInput);
	row.appendChild(td);
	
	tbody.appendChild(row);
		
	row = document.createElement('tr');
	
	td = document.createElement('td');
	td.style.fontSize = '10pt';
	bpmUtils.write(td, bpmResources.get('format') + ':');
	
	row.appendChild(td);
	
	var imageBpmSchemeSelect = document.createElement('select');
	imageBpmSchemeSelect.style.width = '180px';

	var pngOption = document.createElement('option');
	pngOption.setAttribute('value', 'png');
	bpmUtils.write(pngOption, bpmResources.get('formatPng'));
	imageBpmSchemeSelect.appendChild(pngOption);

	var gifOption = document.createElement('option');
	
	if (ExportBpmModal.showGifOption)
	{
		gifOption.setAttribute('value', 'gif');
		bpmUtils.write(gifOption, bpmResources.get('formatGif'));
		imageBpmSchemeSelect.appendChild(gifOption);
	}
	
	var jpgOption = document.createElement('option');
	jpgOption.setAttribute('value', 'jpg');
	bpmUtils.write(jpgOption, bpmResources.get('formatJpg'));
	imageBpmSchemeSelect.appendChild(jpgOption);

	var pdfOption = document.createElement('option');
	pdfOption.setAttribute('value', 'pdf');
	bpmUtils.write(pdfOption, bpmResources.get('formatPdf'));
	imageBpmSchemeSelect.appendChild(pdfOption);
	
	var svgOption = document.createElement('option');
	svgOption.setAttribute('value', 'svg');
	bpmUtils.write(svgOption, bpmResources.get('formatSvg'));
	imageBpmSchemeSelect.appendChild(svgOption);
	
	if (ExportBpmModal.showXmlOption)
	{
		var xmlOption = document.createElement('option');
		xmlOption.setAttribute('value', 'xml');
		bpmUtils.write(xmlOption, bpmResources.get('formatXml'));
		imageBpmSchemeSelect.appendChild(xmlOption);
	}

	td = document.createElement('td');
	td.appendChild(imageBpmSchemeSelect);
	row.appendChild(td);
	
	tbody.appendChild(row);
	
	row = document.createElement('tr');

	td = document.createElement('td');
	td.style.fontSize = '10pt';
	bpmUtils.write(td, bpmResources.get('zoom') + ' (%):');
	
	row.appendChild(td);
	
	var zoomInput = document.createElement('input');
	zoomInput.setAttribute('type', 'number');
	zoomInput.setAttribute('value', '100');
	zoomInput.style.width = '180px';

	td = document.createElement('td');
	td.appendChild(zoomInput);
	row.appendChild(td);

	tbody.appendChild(row);

	row = document.createElement('tr');

	td = document.createElement('td');
	td.style.fontSize = '10pt';
	bpmUtils.write(td, bpmResources.get('width') + ':');
	
	row.appendChild(td);
	
	var widthInput = document.createElement('input');
	widthInput.setAttribute('value', width);
	widthInput.style.width = '180px';

	td = document.createElement('td');
	td.appendChild(widthInput);
	row.appendChild(td);

	tbody.appendChild(row);
	
	row = document.createElement('tr');
	
	td = document.createElement('td');
	td.style.fontSize = '10pt';
	bpmUtils.write(td, bpmResources.get('height') + ':');
	
	row.appendChild(td);
	
	var heightInput = document.createElement('input');
	heightInput.setAttribute('value', height);
	heightInput.style.width = '180px';

	td = document.createElement('td');
	td.appendChild(heightInput);
	row.appendChild(td);

	tbody.appendChild(row);
	
	row = document.createElement('tr');
	
	td = document.createElement('td');
	td.style.fontSize = '10pt';
	bpmUtils.write(td, bpmResources.get('background') + ':');
	
	row.appendChild(td);
	
	var transparentCheckbox = document.createElement('input');
	transparentCheckbox.setAttribute('type', 'checkbox');
	transparentCheckbox.checked = graph.background == null || graph.background == bpmConstants.NONE;

	td = document.createElement('td');
	td.appendChild(transparentCheckbox);
	bpmUtils.write(td, bpmResources.get('transparent'));
	
	row.appendChild(td);
	
	tbody.appendChild(row);
	
	row = document.createElement('tr');

	td = document.createElement('td');
	td.style.fontSize = '10pt';
	bpmUtils.write(td, bpmResources.get('borderWidth') + ':');
	
	row.appendChild(td);
	
	var borderInput = document.createElement('input');
	borderInput.setAttribute('type', 'number');
	borderInput.setAttribute('value', ExportBpmModal.lastBorderValue);
	borderInput.style.width = '180px';

	td = document.createElement('td');
	td.appendChild(borderInput);
	row.appendChild(td);

	tbody.appendChild(row);
	table.appendChild(tbody);
	
	// Handles changes in the export format
	function formatChanged()
	{
		var name = nameInput.value;
		var dot = name.lastIndexOf('.');
		
		if (dot > 0)
		{
			nameInput.value = name.substring(0, dot + 1) + imageBpmSchemeSelect.value;
		}
		else
		{
			nameInput.value = name + '.' + imageBpmSchemeSelect.value;
		}
		
		if (imageBpmSchemeSelect.value === 'xml')
		{
			zoomInput.setAttribute('disabled', 'true');
			widthInput.setAttribute('disabled', 'true');
			heightInput.setAttribute('disabled', 'true');
			borderInput.setAttribute('disabled', 'true');
		}
		else
		{
			zoomInput.removeAttribute('disabled');
			widthInput.removeAttribute('disabled');
			heightInput.removeAttribute('disabled');
			borderInput.removeAttribute('disabled');
		}
		
		if (imageBpmSchemeSelect.value === 'png' || imageBpmSchemeSelect.value === 'svg')
		{
			transparentCheckbox.removeAttribute('disabled');
		}
		else
		{
			transparentCheckbox.setAttribute('disabled', 'disabled');
		}
	};
	
	bpmEvent.addListener(imageBpmSchemeSelect, 'change', formatChanged);
	formatChanged();

	function checkValues()
	{
		if (widthInput.value * heightInput.value > MAX_AREA || widthInput.value <= 0)
		{
			widthInput.style.backgroundColor = 'red';
		}
		else
		{
			widthInput.style.backgroundColor = '';
		}
		
		if (widthInput.value * heightInput.value > MAX_AREA || heightInput.value <= 0)
		{
			heightInput.style.backgroundColor = 'red';
		}
		else
		{
			heightInput.style.backgroundColor = '';
		}
	};

	bpmEvent.addListener(zoomInput, 'change', function()
	{
		var s = Math.max(0, parseFloat(zoomInput.value) || 100) / 100;
		zoomInput.value = parseFloat((s * 100).toFixed(2));
		
		if (width > 0)
		{
			widthInput.value = Math.floor(width * s);
			heightInput.value = Math.floor(height * s);
		}
		else
		{
			zoomInput.value = '100';
			widthInput.value = width;
			heightInput.value = height;
		}
		
		checkValues();
	});

	bpmEvent.addListener(widthInput, 'change', function()
	{
		var s = parseInt(widthInput.value) / width;
		
		if (s > 0)
		{
			zoomInput.value = parseFloat((s * 100).toFixed(2));
			heightInput.value = Math.floor(height * s);
		}
		else
		{
			zoomInput.value = '100';
			widthInput.value = width;
			heightInput.value = height;
		}
		
		checkValues();
	});

	bpmEvent.addListener(heightInput, 'change', function()
	{
		var s = parseInt(heightInput.value) / height;
		
		if (s > 0)
		{
			zoomInput.value = parseFloat((s * 100).toFixed(2));
			widthInput.value = Math.floor(width * s);
		}
		else
		{
			zoomInput.value = '100';
			widthInput.value = width;
			heightInput.value = height;
		}
		
		checkValues();
	});
	
	row = document.createElement('tr');
	td = document.createElement('td');
	td.setAttribute('align', 'right');
	td.style.paddingTop = '22px';
	td.colSpan = 2;
	
	var saveBtn = bpmUtils.button(bpmResources.get('export'), bpmUtils.bind(this, function()
	{
		if (parseInt(zoomInput.value) <= 0)
		{
			bpmUtils.alert(bpmResources.get('drawingEmpty'));
		}
		else
		{
	    	var name = nameInput.value;
			var format = imageBpmSchemeSelect.value;
	    	var s = Math.max(0, parseFloat(zoomInput.value) || 100) / 100;
			var b = Math.max(0, parseInt(borderInput.value));
			var bg = graph.background;
			
			if ((format == 'svg' || format == 'png') && transparentCheckbox.checked)
			{
				bg = null;
			}
			else if (bg == null || bg == bpmConstants.NONE)
			{
				bg = '#ffffff';
			}
			
			ExportBpmModal.lastBorderValue = b;
			ExportBpmModal.exportFile(editorUi, name, format, bg, s, b);
		}
	}));
	saveBtn.className = 'geBtn gePrimaryBtn';
	
	var cancelBtn = bpmUtils.button(bpmResources.get('cancel'), function()
	{
		editorUi.hideBpmModal();
	});
	cancelBtn.className = 'geBtn';
	
	if (editorUi.editor.cancelFirst)
	{
		td.appendChild(cancelBtn);
		td.appendChild(saveBtn);
	}
	else
	{
		td.appendChild(saveBtn);
		td.appendChild(cancelBtn);
	}

	row.appendChild(td);
	tbody.appendChild(row);
	table.appendChild(tbody);
	this.container = table;
};

/**
 * Remembers last value for border.
 */
ExportBpmModal.lastBorderValue = 0;

/**
 * Global switches for the export dialog.
 */
ExportBpmModal.showGifOption = true;

/**
 * Global switches for the export dialog.
 */
ExportBpmModal.showXmlOption = true;

/**
 * Hook for getting the export format. Returns null for the default
 * intermediate XML export format or a function that returns the
 * parameter and value to be used in the request in the form
 * key=value, where value should be URL encoded.
 */
ExportBpmModal.exportFile = function(editorUi, name, format, bg, s, b)
{
	var graph = editorUi.editor.graph;
	
	if (format == 'xml')
	{
    	ExportBpmModal.saveLocalFile(editorUi, bpmUtils.getXml(editorUi.editor.getGraphXml()), name, format);
	}
    else if (format == 'svg')
	{
		ExportBpmModal.saveLocalFile(editorUi, bpmUtils.getXml(graph.getSvg(bg, s, b)), name, format);
	}
    else
    {
    	var bounds = graph.getGraphBounds();
    	
		// New image export
		var xmlDoc = bpmUtils.createXmlDocument();
		var root = xmlDoc.createElement('output');
		xmlDoc.appendChild(root);
		
	    // Renders graph. Offset will be multiplied with state's scale when painting state.
		var xmlCanvas = new bpmXmlCanvas2D(root);
		xmlCanvas.translate(Math.floor((b / s - bounds.x) / graph.view.scale),
			Math.floor((b / s - bounds.y) / graph.view.scale));
		xmlCanvas.scale(s / graph.view.scale);
		
		var imgExport = new bpmImageExport()
	    imgExport.drawState(graph.getView().getState(graph.model.root), xmlCanvas);
	    
		// Puts request data together
		var param = 'xml=' + encodeURIComponent(bpmUtils.getXml(root));
		var w = Math.ceil(bounds.width * s / graph.view.scale + 2 * b);
		var h = Math.ceil(bounds.height * s / graph.view.scale + 2 * b);
		
		// Requests image if request is valid
		if (param.length <= MAX_REQUEST_SIZE && w * h < MAX_AREA)
		{
			editorUi.hideBpmModal();
			var req = new bpmXmlRequest(EXPORT_URL, 'format=' + format +
				'&filename=' + encodeURIComponent(name) +
				'&bg=' + ((bg != null) ? bg : 'none') +
				'&w=' + w + '&h=' + h + '&' + param);
			req.simulate(document, '_blank');
		}
		else
		{
			bpmUtils.alert(bpmResources.get('drawingTooLarge'));
		}
	}
};

/**
 * Hook for getting the export format. Returns null for the default
 * intermediate XML export format or a function that returns the
 * parameter and value to be used in the request in the form
 * key=value, where value should be URL encoded.
 */
ExportBpmModal.saveLocalFile = function(editorUi, data, filename, format)
{
	if (data.length < MAX_REQUEST_SIZE)
	{
		editorUi.hideBpmModal();
		var req = new bpmXmlRequest(SAVE_URL, 'xml=' + encodeURIComponent(data) + '&filename=' +
			encodeURIComponent(filename) + '&format=' + format);
		req.simulate(document, '_blank');
	}
	else
	{
		bpmUtils.alert(bpmResources.get('drawingTooLarge'));
		bpmUtils.popup(xml);
	}
};

/**
 * Constructs a new metadata dialog.
 */
var EditPropBpmModal = function(ui, cell)
{
	var div = document.createElement('div');
	div.style.overflow = 'auto';
	this.init = function()
	{
		// var buttons = document.createElement('div');
		// buttons.style.cssText = 'position:absolute;left:30px;right:70px;text-align:right;bottom:5px;height:40px;';

		// var applyBtn = bpmUtils.button(bpmResources.get('apply'), function()
		// {
		// });
		// applyBtn.className = 'geBtn gePrimaryBtn';
		// buttons.appendChild(applyBtn);
		// this.container.appendChild(buttons);
	};

	this.container = div;
};

/**
 * Constructs a new metadata dialog.
 */
var EditValueBpmModal = function(ui, cell)
{
	this.container = document.createElement('div');
	this.editorUi = ui;
	this.clear();
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
	label.style.borderWidth = '1px 1px 0px 1px';
	label.style.borderStyle = 'solid';
	label.style.display = (bpmCore.IS_QUIRKS) ? 'inline' : 'inline-block';
	label.style.height = (bpmCore.IS_QUIRKS) ? '34px' : '25px';
	label.style.overflow = 'hidden';
	label.style.width = '100%';
	this.container.appendChild(div);

	var value = graph.getModel().getValue(cell);

	// Converts the value to an XML node
	if (!bpmUtils.isNode(value))
	{
		var doc = bpmUtils.createXmlDocument();
		var obj = doc.createElement('object');
		obj.setAttribute('label', value || '');
		value = obj;
	}

	// Creates the dialog contents
	var attrs = value.childNodes;
	var names = [];
	var texts = [];
	var count = 0;

	var isLayer = graph.getModel().getParent(cell) == graph.getModel().getRoot();
	var idx = 0;
	var temp = [];
	var labels = [];

	label.style.backgroundColor = this.inactiveTabBackgroundColor;
	label.style.borderLeftWidth = '1px';
	label.style.cursor = 'pointer';
	label.style.width = '12%';//////////////////////////////////////////////////////////////////////////////////////////////////

	if(attrs.length > 0)
	{
		for (var i = 0; i < attrs.length; i++)
		{
			var nodeName = attrs[i].nodeName;
			if ((isLayer || nodeName != 'label') && nodeName != 'placeholders')
			{
				var isExist = false;
				for(var k in temp)
				{
					if(nodeName.toUpperCase() == temp[k].name)
						isExist = true;
				}

				if(!isExist)
				{
					temp.push({name: nodeName.toUpperCase(), value: attrs[i].nodeValue});
					var label_tmp = label.cloneNode(false);
					label_tmp.style.backgroundColor = this.inactiveTabBackgroundColor;
					bpmUtils.write(label_tmp, nodeName.toUpperCase());
					labels.push(label_tmp);
					div.appendChild(label_tmp);					
				}
			}
		}		
	}
	else
	{
		temp.push({name: 'GENERAL', value: {}});
		var label_tmp = label.cloneNode(false);
		label_tmp.style.backgroundColor = this.inactiveTabBackgroundColor;
		bpmUtils.write(label_tmp, 'GENERAL');
		labels.push(label_tmp);
		div.appendChild(label_tmp);

		temp.push({name: 'SETTING', value: {}});
		var label_tmp = label.cloneNode(false);
		label_tmp.style.backgroundColor = this.inactiveTabBackgroundColor;
		bpmUtils.write(label_tmp, 'SETTING');
		labels.push(label_tmp);
		div.appendChild(label_tmp);
	}
	// div.appendChild(label);
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
		
		if (index == this.currentIndex)
		{
			// Invokes handler directly as a workaround for no click on DIV in KHTML.
			clickHandler();
		}
	});

	this.container.appendChild(div);
	for (var i = 0; i < temp.length; i++)
	{
		var panel = div.cloneNode(false);
		panel.style.display = 'none';
		var tmpLabel = labels[i].innerHTML;
		this.panels.push(new DataBpmSchemePanel(this, ui, panel, cell, tmpLabel.toUpperCase()));
		addClickHandler(labels[i], panel, idx++);
		this.container.appendChild(panel);
	}


	

	// Workaround for ignored background in IE
	// label3.style.backgroundColor = this.inactiveTabBackgroundColor;
	// label4.style.backgroundColor = this.inactiveTabBackgroundColor;
	
	// Style
	// label.style.borderLeftWidth = '0px';
	// bpmUtils.write(label, bpmResources.get('style'));
	// div.appendChild(label);
	
	// var stylePanel = div.cloneNode(false);
	// stylePanel.style.display = 'none';
	// // this.panels.push(new StyleBpmSchemePanel(this, ui, stylePanel));
	// this.container.appendChild(stylePanel);

	// addClickHandler(label, stylePanel, idx++);
	
	// Text
	// bpmUtils.write(label2, bpmResources.get('text'));
	// div.appendChild(label2);

	// var textPanel = div.cloneNode(false);
	// textPanel.style.display = 'none';
	// // this.panels.push(new TextBpmSchemePanel(this, ui, textPanel));
	// this.container.appendChild(textPanel);
	
	// // Arrange
	
	// bpmUtils.write(label3, bpmResources.get('arrange'));
	// div.appendChild(label3);

	// var arrangePanel = div.cloneNode(false);
	// arrangePanel.style.display = 'none';
	// // this.panels.push(new ArrangePanel(this, ui, arrangePanel));
	// this.container.appendChild(arrangePanel);
	
	// addClickHandler(label2, textPanel, idx++);
	// addClickHandler(label3, arrangePanel, idx++);

	var cancelBtn = bpmUtils.button('OK', function()
	{
		ui.hideBpmModal.apply(ui, arguments);
	});
	
	cancelBtn.className = 'geBtn';
	cancelBtn.style.marginTop="20px";

	var applyBtn = bpmUtils.button(bpmResources.get('apply'), function()
	{
		try
		{
			ui.hideBpmModal.apply(ui, arguments);
			
			// Clones and updates the value
			value = value.cloneNode(true);
			var removeLabel = false;
			
			for (var i = 0; i < names.length; i++)
			{
				if (texts[i] == null)
				{
					value.removeAttribute(names[i]);
				}
				else
				{
					value.setAttribute(names[i], texts[i].value);
					removeLabel = removeLabel || (names[i] == 'placeholder' &&
						value.getAttribute('placeholders') == '1');
				}
			}
			
			// Removes label if placeholder is assigned
			if (removeLabel)
			{
				value.removeAttribute('label');
			}
			
			// Updates the value of the cell (undoable)
			graph.getModel().setValue(cell, value);
		}
		catch (e)
		{
			bpmUtils.alert(e);
		}
	});
	applyBtn.className = 'geBtn gePrimaryBtn';
	
	var buttons = document.createElement('div');
	buttons.style.cssText = 'position:absolute;left:30px;right:30px;text-align:right;bottom:30px;height:40px;'
	
	buttons.appendChild(cancelBtn);

	this.container.appendChild(buttons);

};

EditValueBpmModal.prototype.currentIndex = 0;

EditValueBpmModal.prototype.getSelectionState = function()
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

EditValueBpmModal.prototype.clear = function()
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

EditValueBpmModal.prototype.init = function()
{

}
/**
 * Constructs a new metadata dialog.
 */
var EditDataBpmModal = function(ui, cell)
{
	var div = document.createElement('div');
	var graph = ui.editor.graph;
	
	var value = graph.getModel().getValue(cell);
	
	// Converts the value to an XML node
	if (!bpmUtils.isNode(value))
	{
		var doc = bpmUtils.createXmlDocument();
		var obj = doc.createElement('object');
		obj.setAttribute('label', value || '');
		value = obj;
	}

	// Creates the dialog contents
	var form = new bpmForm('properties');
	form.table.style.width = '100%';

	var attrs = value.attributes;
	var names = [];
	var texts = [];
	var count = 0;

	var id = (EditDataBpmModal.getDisplayIdForCell != null) ?
		EditDataBpmModal.getDisplayIdForCell(ui, cell) : null;
	
	var addRemoveButton = function(text, name)
	{
		var wrapper = document.createElement('div');
		wrapper.style.position = 'relative';
		wrapper.style.paddingRight = '20px';
		wrapper.style.boxSizing = 'border-box';
		wrapper.style.width = '100%';
		
		var removeAttr = document.createElement('a');
		var img = bpmUtils.createImage(BpmModal.prototype.closeImage);
		img.style.height = '9px';
		img.style.fontSize = '9px';
		img.style.marginBottom = (bpmCore.IS_IE11) ? '-1px' : '5px';
		
		removeAttr.className = 'mainButton';
		removeAttr.setAttribute('title', bpmResources.get('delete'));
		removeAttr.style.position = 'absolute';
		removeAttr.style.top = '4px';
		removeAttr.style.right = '0px';
		removeAttr.style.margin = '0px';
		removeAttr.style.width = '9px';
		removeAttr.style.height = '9px';
		removeAttr.style.cursor = 'pointer';
		removeAttr.appendChild(img);
		
		var removeAttrFn = (function(name)
		{
			return function()
			{
				var count = 0;
				
				for (var j = 0; j < names.length; j++)
				{
					if (names[j] == name)
					{
						texts[j] = null;
						form.table.deleteRow(count + ((id != null) ? 1 : 0));
						
						break;
					}
					
					if (texts[j] != null)
					{
						count++;
					}
				}
			};
		})(name);
		
		bpmEvent.addListener(removeAttr, 'click', removeAttrFn);
		
		var parent = text.parentNode;
		wrapper.appendChild(text);
		wrapper.appendChild(removeAttr);
		parent.appendChild(wrapper);
	};
	
	var addTextArea = function(index, name, value)
	{
		names[index] = name;
		texts[index] = form.addTextarea(names[count] + ':', value, 2);
		texts[index].style.width = '100%';
		
		addRemoveButton(texts[index], name);
	};
	
	var temp = [];
	var isLayer = graph.getModel().getParent(cell) == graph.getModel().getRoot();

	for (var i = 0; i < attrs.length; i++)
	{
		if ((isLayer || attrs[i].nodeName != 'label') && attrs[i].nodeName != 'placeholders')
		{
			temp.push({name: attrs[i].nodeName, value: attrs[i].nodeValue});
		}
	}
	
	// Sorts by name
	temp.sort(function(a, b)
	{
	    if (a.name < b.name)
	    {
	    	return -1;
	    }
	    else if (a.name > b.name)
	    {
	    	return 1;
	    }
	    else
	    {
	    	return 0;
	    }
	});

	if (id != null)
	{	
		var text = document.createElement('div');
		text.style.width = '100%';
		text.style.fontSize = '11px';
		text.style.textAlign = 'center';
		bpmUtils.write(text, id);
		
		form.addField(bpmResources.get('id') + ':', text);
	}
	
	for (var i = 0; i < temp.length; i++)
	{
		addTextArea(count, temp[i].name, temp[i].value);
		count++;
	}
	
	var top = document.createElement('div');
	top.style.cssText = 'position:absolute;left:30px;right:30px;overflow-y:auto;top:30px;bottom:80px;';
	top.appendChild(form.table);

	var newProp = document.createElement('div');
	newProp.style.boxSizing = 'border-box';
	newProp.style.paddingRight = '160px';
	newProp.style.whiteSpace = 'nowrap';
	newProp.style.marginTop = '6px';
	newProp.style.width = '100%';
	
	var nameInput = document.createElement('input');
	nameInput.setAttribute('placeholder', bpmResources.get('enterPropertyName'));
	nameInput.setAttribute('type', 'text');
	nameInput.setAttribute('size', (bpmCore.IS_IE || bpmCore.IS_IE11) ? '36' : '40');
	nameInput.style.boxSizing = 'border-box';
	nameInput.style.marginLeft = '2px';
	nameInput.style.width = '100%';
	
	newProp.appendChild(nameInput);
	top.appendChild(newProp);
	div.appendChild(top);
	
	
	this.init = function()
	{
		if (texts.length > 0)
		{
			texts[0].focus();
		}
		else
		{
			nameInput.focus();
		}
	};

	var addBtn = bpmUtils.button(bpmResources.get('addProperty'), function()
	{
		var name = nameInput.value;

		// Avoid ':' in attribute names which seems to be valid in Chrome
		if (name.length > 0 && name != 'label' && name != 'placeholders' && name.indexOf(':') < 0)
		{
			try
			{
				var idx = bpmUtils.indexOf(names, name);
				
				if (idx >= 0 && texts[idx] != null)
				{
					texts[idx].focus();
				}
				else
				{
					// Checks if the name is valid
					var clone = value.cloneNode(false);
					clone.setAttribute(name, '');
					
					if (idx >= 0)
					{
						names.splice(idx, 1);
						texts.splice(idx, 1);
					}

					names.push(name);
					var text = form.addTextarea(name + ':', '', 2);
					text.style.width = '100%';
					texts.push(text);
					addRemoveButton(text, name);

					text.focus();
				}

				addBtn.setAttribute('disabled', 'disabled');
				nameInput.value = '';
			}
			catch (e)
			{
				bpmUtils.alert(e);
			}
		}
		else
		{
			bpmUtils.alert(bpmResources.get('invalidName'));
		}
	});
	
	addBtn.setAttribute('title', bpmResources.get('addProperty'));
	addBtn.setAttribute('disabled', 'disabled');
	addBtn.style.textOverflow = 'ellipsis';
	addBtn.style.position = 'absolute';
	addBtn.style.overflow = 'hidden';
	addBtn.style.width = '144px';
	addBtn.style.right = '0px';
	addBtn.className = 'geBtn';
	newProp.appendChild(addBtn);

	var cancelBtn = bpmUtils.button(bpmResources.get('cancel'), function()
	{
		ui.hideBpmModal.apply(ui, arguments);
	});
	
	cancelBtn.className = 'geBtn';
	
	var applyBtn = bpmUtils.button(bpmResources.get('apply'), function()
	{
		try
		{
			ui.hideBpmModal.apply(ui, arguments);
			
			// Clones and updates the value
			value = value.cloneNode(true);
			var removeLabel = false;
			
			for (var i = 0; i < names.length; i++)
			{
				if (texts[i] == null)
				{
					value.removeAttribute(names[i]);
				}
				else
				{
					value.setAttribute(names[i], texts[i].value);
					removeLabel = removeLabel || (names[i] == 'placeholder' &&
						value.getAttribute('placeholders') == '1');
				}
			}
			
			// Removes label if placeholder is assigned
			if (removeLabel)
			{
				value.removeAttribute('label');
			}
			
			// Updates the value of the cell (undoable)
			graph.getModel().setValue(cell, value);
		}
		catch (e)
		{
			bpmUtils.alert(e);
		}
	});
	applyBtn.className = 'geBtn gePrimaryBtn';
	
	function updateAddBtn()
	{
		if (nameInput.value.length > 0)
		{
			addBtn.removeAttribute('disabled');
		}
		else
		{
			addBtn.setAttribute('disabled', 'disabled');
		}
	};

	bpmEvent.addListener(nameInput, 'keyup', updateAddBtn);
	
	// Catches all changes that don't fire a keyup (such as paste via mouse)
	bpmEvent.addListener(nameInput, 'change', updateAddBtn);
	
	var buttons = document.createElement('div');
	buttons.style.cssText = 'position:absolute;left:30px;right:30px;text-align:right;bottom:30px;height:40px;'
	
	if (ui.editor.graph.getModel().isVertex(cell) || ui.editor.graph.getModel().isEdge(cell))
	{
		var replace = document.createElement('span');
		replace.style.marginRight = '10px';
		var input = document.createElement('input');
		input.setAttribute('type', 'checkbox');
		input.style.marginRight = '6px';
		
		if (value.getAttribute('placeholders') == '1')
		{
			input.setAttribute('checked', 'checked');
			input.defaultChecked = true;
		}
	
		bpmEvent.addListener(input, 'click', function()
		{
			if (value.getAttribute('placeholders') == '1')
			{
				value.removeAttribute('placeholders');
			}
			else
			{
				value.setAttribute('placeholders', '1');
			}
		});
		
		replace.appendChild(input);
		bpmUtils.write(replace, bpmResources.get('placeholders'));
		
		if (EditDataBpmModal.placeholderHelpLink != null)
		{
			var link = document.createElement('a');
			link.setAttribute('href', EditDataBpmModal.placeholderHelpLink);
			link.setAttribute('title', bpmResources.get('help'));
			link.setAttribute('target', '_blank');
			link.style.marginLeft = '8px';
			link.style.cursor = 'help';
			
			var icon = document.createElement('img');
			bpmUtils.setOpacity(icon, 50);
			icon.style.height = '16px';
			icon.style.width = '16px';
			icon.setAttribute('border', '0');
			icon.setAttribute('valign', 'middle');
			icon.style.marginTop = (bpmCore.IS_IE11) ? '0px' : '-4px';
			icon.setAttribute('src', BpmDraw.helpImage);
			link.appendChild(icon);
			
			replace.appendChild(link);
		}
		
		buttons.appendChild(replace);
	}
	
	if (ui.editor.cancelFirst)
	{
		buttons.appendChild(cancelBtn);
		buttons.appendChild(applyBtn);
	}
	else
	{
		buttons.appendChild(applyBtn);
		buttons.appendChild(cancelBtn);
	}

	div.appendChild(buttons);
	this.container = div;
};

/**
 * Optional help link.
 */
EditDataBpmModal.getDisplayIdForCell = function(ui, cell)
{
	var id = null;
	
	if (ui.editor.graph.getModel().getParent(cell) != null)
	{
		id = cell.getId();
	}
	
	return id;
};

/**
 * Optional help link.
 */
EditDataBpmModal.placeholderHelpLink = null;

/**
 * Constructs a new link dialog.
 */
var LinkBpmModal = function(editorUi, initialValue, btnLabel, fn)
{
	var div = document.createElement('div');
	bpmUtils.write(div, bpmResources.get('editLink') + ':');
	
	var inner = document.createElement('div');
	inner.className = 'mainTitle';
	inner.style.backgroundColor = 'transparent';
	inner.style.borderColor = 'transparent';
	inner.style.whiteSpace = 'nowrap';
	inner.style.textOverflow = 'clip';
	inner.style.cursor = 'default';
	
	if (!bpmCore.IS_VML)
	{
		inner.style.paddingRight = '20px';
	}
	
	var linkInput = document.createElement('input');
	linkInput.setAttribute('value', initialValue);
	linkInput.setAttribute('placeholder', 'http://www.example.com/');
	linkInput.setAttribute('type', 'text');
	linkInput.style.marginTop = '6px';
	linkInput.style.width = '400px';
	linkInput.style.backgroundImage = 'url(\'' + BpmModal.prototype.clearImage + '\')';
	linkInput.style.backgroundRepeat = 'no-repeat';
	linkInput.style.backgroundPosition = '100% 50%';
	linkInput.style.paddingRight = '14px';
	
	var cross = document.createElement('div');
	cross.setAttribute('title', bpmResources.get('reset'));
	cross.style.position = 'relative';
	cross.style.left = '-16px';
	cross.style.width = '12px';
	cross.style.height = '14px';
	cross.style.cursor = 'pointer';

	// Workaround for inline-block not supported in IE
	cross.style.display = (bpmCore.IS_VML) ? 'inline' : 'inline-block';
	cross.style.top = ((bpmCore.IS_VML) ? 0 : 3) + 'px';
	
	// Needed to block event transparency in IE
	cross.style.background = 'url(' + IMAGE_PATH + '/transparent.gif)';

	bpmEvent.addListener(cross, 'click', function()
	{
		linkInput.value = '';
		linkInput.focus();
	});
	
	inner.appendChild(linkInput);
	inner.appendChild(cross);
	div.appendChild(inner);
	
	this.init = function()
	{
		linkInput.focus();
		
		if (bpmCore.IS_GC || bpmCore.IS_FF || document.documentMode >= 5 || bpmCore.IS_QUIRKS)
		{
			linkInput.select();
		}
		else
		{
			document.execCommand('selectAll', false, null);
		}
	};
	
	var btns = document.createElement('div');
	btns.style.marginTop = '18px';
	btns.style.textAlign = 'right';

	bpmEvent.addListener(linkInput, 'keypress', function(e)
	{
		if (e.keyCode == 13)
		{
			editorUi.hideBpmModal();
			fn(linkInput.value);
		}
	});

	var cancelBtn = bpmUtils.button(bpmResources.get('cancel'), function()
	{
		editorUi.hideBpmModal();
	});
	cancelBtn.className = 'geBtn';
	
	if (editorUi.editor.cancelFirst)
	{
		btns.appendChild(cancelBtn);
	}
	
	var mainBtn = bpmUtils.button(btnLabel, function()
	{
		editorUi.hideBpmModal();
		fn(linkInput.value);
	});
	mainBtn.className = 'geBtn gePrimaryBtn';
	btns.appendChild(mainBtn);
	
	if (!editorUi.editor.cancelFirst)
	{
		btns.appendChild(cancelBtn);
	}

	div.appendChild(btns);

	this.container = div;
};

/**
 * 
 */
var OutlineWindow = function(editorUi, x, y, w, h)
{
	var graph = editorUi.editor.graph;

	var div = document.createElement('div');
	div.style.position = 'absolute';
	div.style.width = '100%';
	div.style.height = '100%';
	div.style.border = '1px solid whiteSmoke';
	div.style.overflow = 'hidden';

	this.window = new bpmWindow(bpmResources.get('outline'), div, x, y, w, h, true, true);
	this.window.minimumSize = new bpmRectangle(0, 0, 80, 80);
	this.window.destroyOnClose = false;
	this.window.setMaximizable(false);
	this.window.setResizable(true);
	this.window.setClosable(true);
	this.window.setVisible(true);
	
	this.window.setLocation = function(x, y)
	{
		var iw = window.innerWidth || document.body.clientWidth || document.documentElement.clientWidth;
		var ih = window.innerHeight || document.body.clientHeight || document.documentElement.clientHeight;
		
		x = Math.max(0, Math.min(x, iw - this.table.clientWidth));
		y = Math.max(0, Math.min(y, ih - this.table.clientHeight - 48));

		if (this.getX() != x || this.getY() != y)
		{
			bpmWindow.prototype.setLocation.apply(this, arguments);
		}
	};
	
	var resizeListener = bpmUtils.bind(this, function()
	{
		var x = this.window.getX();
		var y = this.window.getY();
		
		this.window.setLocation(x, y);
	});
	
	bpmEvent.addListener(window, 'resize', resizeListener);
	
	var outline = editorUi.createOutline(this.window);

	this.destroy = function()
	{
		bpmEvent.removeListener(window, 'resize', resizeListener);
		this.window.destroy();
		outline.destroy();
	}

	this.window.addListener(bpmEvent.RESIZE, bpmUtils.bind(this, function()
   	{
		outline.update(false);
		outline.outline.sizeDidChange();
   	}));
	
	this.window.addListener(bpmEvent.SHOW, bpmUtils.bind(this, function()
	{
		this.window.fit();
		outline.suspended = false;
		outline.outline.refresh();
		outline.update();
	}));
	
	this.window.addListener(bpmEvent.HIDE, bpmUtils.bind(this, function()
	{
		outline.suspended = true;
	}));
	
	this.window.addListener(bpmEvent.NORMALIZE, bpmUtils.bind(this, function()
	{
		outline.suspended = false;
		outline.update();
	}));
			
	this.window.addListener(bpmEvent.MINIMIZE, bpmUtils.bind(this, function()
	{
		outline.suspended = true;
	}));

	var outlineCreateGraph = outline.createGraph;
	outline.createGraph = function(container)
	{
		var g = outlineCreateGraph.apply(this, arguments);
		g.gridEnabled = false;
		g.pageScale = graph.pageScale;
		g.pageBpmScheme = graph.pageBpmScheme;
		g.background = (graph.background == null || graph.background == bpmConstants.NONE) ? graph.defaultPageBackgroundColor : graph.background;
		g.pageVisible = graph.pageVisible;

		var current = bpmUtils.getCurrentStyle(graph.container);
		div.style.backgroundColor = current.backgroundColor;
		
		return g;
	};
	
	function update()
	{
		outline.outline.pageScale = graph.pageScale;
		outline.outline.pageBpmScheme = graph.pageBpmScheme;
		outline.outline.pageVisible = graph.pageVisible;
		outline.outline.background = (graph.background == null || graph.background == bpmConstants.NONE) ? graph.defaultPageBackgroundColor : graph.background;;
		
		var current = bpmUtils.getCurrentStyle(graph.container);
		div.style.backgroundColor = current.backgroundColor;

		if (graph.view.backgroundPageShape != null && outline.outline.view.backgroundPageShape != null)
		{
			outline.outline.view.backgroundPageShape.fill = graph.view.backgroundPageShape.fill;
		}
		
		outline.outline.refresh();
	};

	outline.init(div);

	editorUi.editor.addListener('resetGraphView', update);
	editorUi.addListener('pageBpmSchemeChanged', update);
	editorUi.addListener('backgroundColorChanged', update);
	editorUi.addListener('backgroundImageChanged', update);
	editorUi.addListener('pageViewChanged', function()
	{
		update();
		outline.update(true);
	});
	
	if (outline.outline.dialect == bpmConstants.DIALECT_SVG)
	{
		var zoomInAction = editorUi.actions.get('zoomIn');
		var zoomOutAction = editorUi.actions.get('zoomOut');
		
		bpmEvent.addMouseWheelListener(function(evt, up)
		{
			var outlineWheel = false;
			var source = bpmEvent.getSource(evt);
	
			while (source != null)
			{
				if (source == outline.outline.view.canvas.ownerSVGElement)
				{
					outlineWheel = true;
					break;
				}
	
				source = source.parentNode;
			}
	
			if (outlineWheel)
			{
				if (up)
				{
					zoomInAction.funct();
				}
				else
				{
					zoomOutAction.funct();
				}
	
				bpmEvent.consume(evt);
			}
		});
	}
};

/**
 * 
 */
var LayersWindow = function(editorUi, x, y, w, h)
{
	var graph = editorUi.editor.graph;
	
	var div = document.createElement('div');
	div.style.userSelect = 'none';
	div.style.background = (BpmModal.backdropColor == 'white') ? 'whiteSmoke' : BpmModal.backdropColor;
	div.style.border = '1px solid whiteSmoke';
	div.style.height = '100%';
	div.style.marginBottom = '10px';
	div.style.overflow = 'auto';

	var tbarHeight = (!BpmUi.compactUi) ? '30px' : '26px';
	
	var listDiv = document.createElement('div')
	listDiv.style.backgroundColor = (BpmModal.backdropColor == 'white') ? '#dcdcdc' : BpmModal.backdropColor;
	listDiv.style.position = 'absolute';
	listDiv.style.overflow = 'auto';
	listDiv.style.left = '0px';
	listDiv.style.right = '0px';
	listDiv.style.top = '0px';
	listDiv.style.bottom = (parseInt(tbarHeight) + 7) + 'px';
	div.appendChild(listDiv);
	
	var dragSource = null;
	var dropIndex = null;
	
	bpmEvent.addListener(div, 'dragover', function(evt)
	{
		evt.dataTransfer.dropEffect = 'move';
		dropIndex = 0;
		evt.stopPropagation();
		evt.preventDefault();
	});
	
	// Workaround for "no element found" error in FF
	bpmEvent.addListener(div, 'drop', function(evt)
	{
		evt.stopPropagation();
		evt.preventDefault();
	});

	var layerCount = null;
	var selectionLayer = null;
	
	var ldiv = document.createElement('div');
	
	ldiv.className = 'mainToolbarContainer';
	ldiv.style.position = 'absolute';
	ldiv.style.bottom = '0px';
	ldiv.style.left = '0px';
	ldiv.style.right = '0px';
	ldiv.style.height = tbarHeight;
	ldiv.style.overflow = 'hidden';
	ldiv.style.padding = (!BpmUi.compactUi) ? '1px' : '4px 0px 3px 0px';
	ldiv.style.backgroundColor = (BpmModal.backdropColor == 'white') ? 'whiteSmoke' : BpmModal.backdropColor;
	ldiv.style.borderWidth = '1px 0px 0px 0px';
	ldiv.style.borderColor = '#c3c3c3';
	ldiv.style.borderStyle = 'solid';
	ldiv.style.display = 'block';
	ldiv.style.whiteSpace = 'nowrap';
	
	if (bpmCore.IS_QUIRKS)
	{
		ldiv.style.filter = 'none';
	}
	
	var link = document.createElement('a');
	link.className = 'mainButton';
	
	if (bpmCore.IS_QUIRKS)
	{
		link.style.filter = 'none';
	}
	
	var removeLink = link.cloneNode();
	removeLink.innerHTML = '<div class="geSprite geSprite-delete" style="display:inline-block;"></div>';

	bpmEvent.addListener(removeLink, 'click', function(evt)
	{
		if (graph.isEnabled())
		{
			graph.model.beginUpdate();
			try
			{
				var index = graph.model.root.getIndex(selectionLayer);
				graph.removeCells([selectionLayer], false);
				
				// Creates default layer if no layer exists
				if (graph.model.getChildCount(graph.model.root) == 0)
				{
					graph.model.add(graph.model.root, new bpmCell());
					graph.setDefaultParent(null);
				}
				else if (index > 0 && index <= graph.model.getChildCount(graph.model.root))
				{
					graph.setDefaultParent(graph.model.getChildAt(graph.model.root, index - 1));
				}
				else
				{
					graph.setDefaultParent(null);
				}
			}
			finally
			{
				graph.model.endUpdate();
			}
		}
		
		bpmEvent.consume(evt);
	});
	
	if (!graph.isEnabled())
	{
		removeLink.className = 'mainButton bpmDisabled';
	}
	
	ldiv.appendChild(removeLink);

	var insertLink = link.cloneNode();
	insertLink.setAttribute('title', bpmUtils.trim(bpmResources.get('moveSelectionTo', [''])));
	insertLink.innerHTML = '<div class="geSprite geSprite-insert" style="display:inline-block;"></div>';
	
	bpmEvent.addListener(insertLink, 'click', function(evt)
	{
		if (graph.isEnabled() && !graph.isSelectionEmpty())
		{
			editorUi.editor.graph.popupMenuHandler.hideMenu();
			
			var menu = new bpmPopupMenu(bpmUtils.bind(this, function(menu, parent)
			{
				for (var i = layerCount - 1; i >= 0; i--)
				{
					(bpmUtils.bind(this, function(child)
					{
						var item = menu.addItem(graph.convertValueToString(child) ||
								bpmResources.get('background'), null, bpmUtils.bind(this, function()
						{
							graph.moveCells(graph.getSelectionCells(), 0, 0, false, child);
						}), parent);
						
						if (graph.getSelectionCount() == 1 && graph.model.isAncestor(child, graph.getSelectionCell()))
						{
							menu.addCheckmark(item, BpmDraw.checkmarkImage);
						}
						
					}))(graph.model.getChildAt(graph.model.root, i));
				}
			}));
			menu.div.className += ' mainMenubarMenu';
			menu.smartSeparators = true;
			menu.showDisabled = true;
			menu.autoExpand = true;
			
			// Disables autoexpand and destroys menu when hidden
			menu.hideMenu = bpmUtils.bind(this, function()
			{
				bpmPopupMenu.prototype.hideMenu.apply(menu, arguments);
				menu.destroy();
			});
	
			var offset = bpmUtils.getOffset(insertLink);
			menu.popup(offset.x, offset.y + insertLink.offsetHeight, null, evt);
			
			// Allows hiding by clicking on document
			editorUi.setCurrentMenu(menu);
		}
	});

	ldiv.appendChild(insertLink);
	
	var dataLink = link.cloneNode();
	dataLink.innerHTML = '<div class="geSprite geSprite-dots" style="display:inline-block;"></div>';
	dataLink.setAttribute('title', bpmResources.get('rename'));

	bpmEvent.addListener(dataLink, 'click', function(evt)
	{
		if (graph.isEnabled())
		{
			editorUi.showDataBpmModal(selectionLayer);
		}
		
		bpmEvent.consume(evt);
	});
	
	if (!graph.isEnabled())
	{
		dataLink.className = 'mainButton bpmDisabled';
	}

	ldiv.appendChild(dataLink);
	
	function renameLayer(layer)
	{
		if (graph.isEnabled() && layer != null)
		{
			var label = graph.convertValueToString(layer);
			var dlg = new FilenameBpmModal(editorUi, label || bpmResources.get('background'), bpmResources.get('rename'), bpmUtils.bind(this, function(newValue)
			{
				if (newValue != null)
				{
					graph.cellLabelChanged(layer, newValue);
				}
			}), bpmResources.get('enterName'));
			editorUi.showBpmModal(dlg.container, 300, 100, true, true);
			dlg.init();
		}
	};
	
	var duplicateLink = link.cloneNode();
	duplicateLink.innerHTML = '<div class="geSprite geSprite-duplicate" style="display:inline-block;"></div>';
	
	bpmEvent.addListener(duplicateLink, 'click', function(evt)
	{
		if (graph.isEnabled())
		{
			var newCell = null;
			graph.model.beginUpdate();
			try
			{
				newCell = graph.cloneCell(selectionLayer);
				graph.cellLabelChanged(newCell, bpmResources.get('untitledLayer'));
				newCell.setVisible(true);
				newCell = graph.addCell(newCell, graph.model.root);
				graph.setDefaultParent(newCell);
			}
			finally
			{
				graph.model.endUpdate();
			}

			if (newCell != null && !graph.isCellLocked(newCell))
			{
				graph.selectAll(newCell);
			}
		}
	});
	
	if (!graph.isEnabled())
	{
		duplicateLink.className = 'mainButton bpmDisabled';
	}

	ldiv.appendChild(duplicateLink);

	var addLink = link.cloneNode();
	addLink.innerHTML = '<div class="geSprite geSprite-plus" style="display:inline-block;"></div>';
	addLink.setAttribute('title', bpmResources.get('addLayer'));
	
	bpmEvent.addListener(addLink, 'click', function(evt)
	{
		if (graph.isEnabled())
		{
			graph.model.beginUpdate();
			
			try
			{
				var cell = graph.addCell(new bpmCell(bpmResources.get('untitledLayer')), graph.model.root);
				graph.setDefaultParent(cell);
			}
			finally
			{
				graph.model.endUpdate();
			}
		}
		
		bpmEvent.consume(evt);
	});
	
	if (!graph.isEnabled())
	{
		addLink.className = 'mainButton bpmDisabled';
	}
	
	ldiv.appendChild(addLink);

	div.appendChild(ldiv);	
	
	function refresh()
	{
		layerCount = graph.model.getChildCount(graph.model.root)
		listDiv.innerHTML = '';

		function addLayer(index, label, child, defaultParent)
		{
			var ldiv = document.createElement('div');
			ldiv.className = 'mainToolbarContainer';

			ldiv.style.overflow = 'hidden';
			ldiv.style.position = 'relative';
			ldiv.style.padding = '4px';
			ldiv.style.height = '22px';
			ldiv.style.display = 'block';
			ldiv.style.backgroundColor = (BpmModal.backdropColor == 'white') ? 'whiteSmoke' : BpmModal.backdropColor;
			ldiv.style.borderWidth = '0px 0px 1px 0px';
			ldiv.style.borderColor = '#c3c3c3';
			ldiv.style.borderStyle = 'solid';
			ldiv.style.whiteSpace = 'nowrap';
			ldiv.setAttribute('title', label);
			
			var left = document.createElement('div');
			left.style.display = 'inline-block';
			left.style.width = '100%';
			left.style.textOverflow = 'ellipsis';
			left.style.overflow = 'hidden';
			
			bpmEvent.addListener(ldiv, 'dragover', function(evt)
			{
				evt.dataTransfer.dropEffect = 'move';
				dropIndex = index;
				evt.stopPropagation();
				evt.preventDefault();
			});
			
			bpmEvent.addListener(ldiv, 'dragstart', function(evt)
			{
				dragSource = ldiv;
				
				// Workaround for no DnD on DIV in FF
				if (bpmCore.IS_FF)
				{
					// LATER: Check what triggers a parse as XML on this in FF after drop
					evt.dataTransfer.setData('Text', '<layer/>');
				}
			});
			
			bpmEvent.addListener(ldiv, 'dragend', function(evt)
			{
				if (dragSource != null && dropIndex != null)
				{
					graph.addCell(child, graph.model.root, dropIndex);
				}

				dragSource = null;
				dropIndex = null;
				evt.stopPropagation();
				evt.preventDefault();
			});

			var btn = document.createElement('img');
			btn.setAttribute('draggable', 'false');
			btn.setAttribute('align', 'top');
			btn.setAttribute('border', '0');
			btn.style.padding = '4px';
			btn.setAttribute('title', bpmResources.get('lockUnlock'));

			var state = graph.view.getState(child);
    			var style = (state != null) ? state.style : graph.getCellStyle(child);

			if (bpmUtils.getValue(style, 'locked', '0') == '1')
			{
				btn.setAttribute('src', BpmModal.prototype.lockedImage);
			}
			else
			{
				btn.setAttribute('src', BpmModal.prototype.unlockedImage);
			}
			
			if (graph.isEnabled())
			{
				btn.style.cursor = 'pointer';
			}
			
			bpmEvent.addListener(btn, 'click', function(evt)
			{
				if (graph.isEnabled())
				{
					var value = null;
					
					graph.getModel().beginUpdate();
					try
					{
			    		value = (bpmUtils.getValue(style, 'locked', '0') == '1') ? null : '1';
			    		graph.setCellStyles('locked', value, [child]);
					}
					finally
					{
						graph.getModel().endUpdate();
					}

					if (value == '1')
					{
						graph.removeSelectionCells(graph.getModel().getDescendants(child));
					}
					
					bpmEvent.consume(evt);
				}
			});

			left.appendChild(btn);

			var inp = document.createElement('input');
			inp.setAttribute('type', 'checkbox');
			inp.setAttribute('title', bpmResources.get('hideIt', [child.value || bpmResources.get('background')]));
			inp.style.marginLeft = '4px';
			inp.style.marginRight = '6px';
			inp.style.marginTop = '4px';
			left.appendChild(inp);
			
			if (graph.model.isVisible(child))
			{
				inp.setAttribute('checked', 'checked');
				inp.defaultChecked = true;
			}

			bpmEvent.addListener(inp, 'click', function(evt)
			{
				graph.model.setVisible(child, !graph.model.isVisible(child));
				bpmEvent.consume(evt);
			});

			bpmUtils.write(left, label);
			ldiv.appendChild(left);
			
			if (graph.isEnabled())
			{
				// Fallback if no drag and drop is available
				if (bpmCore.IS_TOUCH || bpmCore.IS_POINTER || bpmCore.IS_VML ||
					(bpmCore.IS_IE && document.documentMode < 10))
				{
					var right = document.createElement('div');
					right.style.display = 'block';
					right.style.textAlign = 'right';
					right.style.whiteSpace = 'nowrap';
					right.style.position = 'absolute';
					right.style.right = '6px';
					right.style.top = '6px';
		
					// Poor man's change layer order
					if (index > 0)
					{
						var img2 = document.createElement('a');
						
						img2.setAttribute('title', bpmResources.get('toBack'));
						
						img2.className = 'mainButton';
						img2.style.cssFloat = 'none';
						img2.innerHTML = '&#9660;';
						img2.style.width = '14px';
						img2.style.height = '14px';
						img2.style.fontSize = '14px';
						img2.style.margin = '0px';
						img2.style.marginTop = '-1px';
						right.appendChild(img2);
						
						bpmEvent.addListener(img2, 'click', function(evt)
						{
							if (graph.isEnabled())
							{
								graph.addCell(child, graph.model.root, index - 1);
							}
							
							bpmEvent.consume(evt);
						});
					}
		
					if (index >= 0 && index < layerCount - 1)
					{
						var img1 = document.createElement('a');
						
						img1.setAttribute('title', bpmResources.get('toFront'));
						
						img1.className = 'mainButton';
						img1.style.cssFloat = 'none';
						img1.innerHTML = '&#9650;';
						img1.style.width = '14px';
						img1.style.height = '14px';
						img1.style.fontSize = '14px';
						img1.style.margin = '0px';
						img1.style.marginTop = '-1px';
						right.appendChild(img1);
						
						bpmEvent.addListener(img1, 'click', function(evt)
						{
							if (graph.isEnabled())
							{
								graph.addCell(child, graph.model.root, index + 1);
							}
							
							bpmEvent.consume(evt);
						});
					}
					
					ldiv.appendChild(right);
				}
				
				if (bpmCore.IS_SVG && (!bpmCore.IS_IE || document.documentMode >= 10))
				{
					ldiv.setAttribute('draggable', 'true');
					ldiv.style.cursor = 'move';
				}
			}

			bpmEvent.addListener(ldiv, 'dblclick', function(evt)
			{
				var nodeName = bpmEvent.getSource(evt).nodeName;
				
				if (nodeName != 'INPUT' && nodeName != 'IMG')
				{
					renameLayer(child);
					bpmEvent.consume(evt);
				}
			});

			if (graph.getDefaultParent() == child)
			{
				ldiv.style.background =  (BpmModal.backdropColor == 'white') ? '#e6eff8' : '#505759';
				ldiv.style.fontWeight = (graph.isEnabled()) ? 'bold' : '';
				selectionLayer = child;
			}
			else
			{
				bpmEvent.addListener(ldiv, 'click', function(evt)
				{
					if (graph.isEnabled())
					{
						graph.setDefaultParent(defaultParent);
						graph.view.setCurrentRoot(null);
						refresh();
					}
				});
			}
			
			listDiv.appendChild(ldiv);
		};
		
		// Cannot be moved or deleted
		for (var i = layerCount - 1; i >= 0; i--)
		{
			(bpmUtils.bind(this, function(child)
			{
				addLayer(i, graph.convertValueToString(child) ||
					bpmResources.get('background'), child, child);
			}))(graph.model.getChildAt(graph.model.root, i));
		}
		
		var label = graph.convertValueToString(selectionLayer) || bpmResources.get('background');
		removeLink.setAttribute('title', bpmResources.get('removeIt', [label]));
		duplicateLink.setAttribute('title', bpmResources.get('duplicateIt', [label]));
		dataLink.setAttribute('title', bpmResources.get('editData'));

		if (graph.isSelectionEmpty())
		{
			insertLink.className = 'mainButton bpmDisabled';
		}
	};

	refresh();
	graph.model.addListener(bpmEvent.CHANGE, function()
	{
		refresh();
	});

	graph.selectionModel.addListener(bpmEvent.CHANGE, function()
	{
		if (graph.isSelectionEmpty())
		{
			insertLink.className = 'mainButton bpmDisabled';
		}
		else
		{
			insertLink.className = 'mainButton';
		}
	});

	this.window = new bpmWindow(bpmResources.get('layers'), div, x, y, w, h, true, true);
	this.window.minimumSize = new bpmRectangle(0, 0, 120, 120);
	this.window.destroyOnClose = false;
	this.window.setMaximizable(false);
	this.window.setResizable(true);
	this.window.setClosable(true);
	this.window.setVisible(true);

	this.window.addListener(bpmEvent.SHOW, bpmUtils.bind(this, function()
	{
		this.window.fit();
	}));
	
	// Make refresh available via instance
	this.refreshLayers = refresh;
	
	this.window.setLocation = function(x, y)
	{
		var iw = window.innerWidth || document.body.clientWidth || document.documentElement.clientWidth;
		var ih = window.innerHeight || document.body.clientHeight || document.documentElement.clientHeight;
		
		x = Math.max(0, Math.min(x, iw - this.table.clientWidth));
		y = Math.max(0, Math.min(y, ih - this.table.clientHeight - 48));

		if (this.getX() != x || this.getY() != y)
		{
			bpmWindow.prototype.setLocation.apply(this, arguments);
		}
	};
	
	var resizeListener = bpmUtils.bind(this, function()
	{
		var x = this.window.getX();
		var y = this.window.getY();
		
		this.window.setLocation(x, y);
	});
	
	bpmEvent.addListener(window, 'resize', resizeListener);

	this.destroy = function()
	{
		bpmEvent.removeListener(window, 'resize', resizeListener);
		this.window.destroy();
	}
};

// var xmlStylesheet = '<bpmStylesheet><add as="defaultVertex"><add as="shape" value="label"/><add as="perimeter" value="rectanglePerimeter"/><add as="fontSize" value="12"/><add as="fontFamily" value="Helvetica"/><add as="align" value="center"/><add as="verticalAlign" value="middle"/><add as="fillColor" value="#ffffff"/><add as="strokeColor" value="#000000"/><add as="fontColor" value="#000000"/></add><add as="defaultEdge"><add as="shape" value="connector"/><add as="labelBackgroundColor" value="#ffffff"/><add as="endArrow" value="classic"/><add as="fontSize" value="11"/><add as="fontFamily" value="Helvetica"/><add as="align" value="center"/><add as="verticalAlign" value="middle"/><add as="rounded" value="1"/><add as="strokeColor" value="#000000"/><add as="fontColor" value="#000000"/></add><add as="text"><add as="fillColor" value="none"/><add as="gradientColor" value="none"/><add as="strokeColor" value="none"/><add as="align" value="left"/><add as="verticalAlign" value="top"/></add><add as="label"><add as="fontStyle" value="1"/><add as="align" value="left"/><add as="verticalAlign" value="middle"/><add as="spacing" value="2"/><add as="spacingLeft" value="52"/><add as="imageWidth" value="42"/><add as="imageHeight" value="42"/><add as="rounded" value="1"/></add><add as="icon" extend="label"><add as="align" value="center"/><add as="imageAlign" value="center"/><add as="verticalLabelPosition" value="bottom"/><add as="verticalAlign" value="top"/><add as="spacingTop" value="4"/><add as="labelBackgroundColor" value="#ffffff"/><add as="spacing" value="0"/><add as="spacingLeft" value="0"/><add as="spacingTop" value="6"/><add as="fontStyle" value="0"/><add as="imageWidth" value="48"/><add as="imageHeight" value="48"/></add><add as="swimlane"><add as="shape" value="swimlane"/><add as="fontSize" value="12"/><add as="fontStyle" value="1"/><add as="startSize" value="23"/></add><add as="group"><add as="verticalAlign" value="top"/><add as="fillColor" value="none"/><add as="strokeColor" value="none"/><add as="gradientColor" value="none"/><add as="pointerEvents" value="0"/></add><add as="ellipse"><add as="shape" value="ellipse"/><add as="perimeter" value="ellipsePerimeter"/></add><add as="rhombus"><add as="shape" value="rhombus"/><add as="perimeter" value="rhombusPerimeter"/></add><add as="triangle"><add as="shape" value="triangle"/><add as="perimeter" value="trianglePerimeter"/></add><add as="line"><add as="shape" value="line"/><add as="strokeWidth" value="4"/><add as="labelBackgroundColor" value="#ffffff"/><add as="verticalAlign" value="top"/><add as="spacingTop" value="8"/></add><add as="image"><add as="shape" value="image"/><add as="labelBackgroundColor" value="white"/><add as="verticalAlign" value="top"/><add as="verticalLabelPosition" value="bottom"/></add><add as="roundImage" extend="image"><add as="perimeter" value="ellipsePerimeter"/></add><add as="rhombusImage" extend="image"><add as="perimeter" value="rhombusPerimeter"/></add><add as="arrow"><add as="shape" value="arrow"/><add as="edgeStyle" value="none"/><add as="fillColor" value="#ffffff"/></add></bpmStylesheet>';
// var textLanguage = "# Resources from graph.properties;alreadyConnected=Nodes already connected;cancel=Cancel;close=Close;collapse-expand=Collapse/Expand;containsValidationErrors=Contains validation errors;done=Done;doubleClickOrientation=Doubleclick to Change Orientation;error=Error;errorSavingFile=Error saving file;ok=OK;updatingDocument=Updating Document. Please wait...;updatingSelection=Updating Selection. Please wait...;# Custom resources;about=About;actualSize=Actual Size;add=Add;addLayer=Add Layer;addProperty=Add Property;addToExistingDrawing=Add to Existing Drawing;addWaypoint=Add Waypoint;advanced=Advanced;align=Align;alignment=Alignment;allChangesLost=All changes will be lost!;angle=Angle;apply=Apply;arc=Arc;arrange=Arrange;arrow=Arrow;arrows=Arrows;automatic=Automatic;autosave=Autosave;autosize=Autosize;back=Back;background=Background;backgroundColor=Background Color;backgroundImage=Background Image;basic=Basic;block=Block;blockquote=Blockquote;bold=Bold;border=Border;borderWidth=Borderwidth;borderColor=Border Color;bottom=Bottom;bottomAlign=Bottom Align;bottomLeft=Bottom Left;bottomRight=Bottom Right;bulletedList=Bulleted List;cannotOpenFile=Cannot open file;center=Center;change=Change;changeOrientation=Change Orientation;circle=Circle;classic=Classic;clearDefaultStyle=Clear Default Style;clearWaypoints=Clear Waypoints;clipart=Clipart;collapse=Collapse;collapseExpand=Collapse/Expand;collapsible=Collapsible;comic=Comic;connect=Connect;connection=Connection;connectionPoints=Connection points;connectionArrows=Connection arrows;constrainProportions=Constrain Proportions;copy=Copy;copyConnect=Copy on Connect;copySize=Copy Size;create=Create;curved=Curved;custom=Custom;cut=Cut;dashed=Dashed;decreaseIndent=Decrease Indent;default=Default;delete=Delete;deleteColumn=Delete Column;deleteRow=Delete Row;diagram=Diagram;diamond=Diamond;diamondThin=Diamond (thin);direction=Direction;distribute=Distribute;divider=Divider;documentProperties=Document Properties;dotted=Dotted;drawing=Drawing{1};drawingEmpty=Drawing is empty;drawingTooLarge=Drawing is too large;duplicate=Duplicate;duplicateIt=Duplicate {1};east=East;edit=Edit;editData=Edit Data;editDiagram=Edit Diagram;editImage=Edit Image;editLink=Edit Link;editStyle=Edit Style;editTooltip=Edit Tooltip;enterGroup=Enter Group;enterValue=Enter Value;enterName=Enter Name;enterPropertyName=Enter Property Name;entityRelation=Entity Relation;events=Events;exitGroup=Exit Group;expand=Expand;export=Export;extras=Extras;file=File;fileNotFound=File not found;filename=Filename;fill=Fill;fillColor=Fill Color;fitPage=One Page;fitPageWidth=Page Width;fitTwoPages=Two Pages;fitWindow=Fit Window;flip=Flip;flipH=Flip Horizontal;flipV=Flip Vertical;font=Font;fontFamily=Font Family;fontColor=Font Color;fontSize=Font Size;format=Format;formatPanel=Format Panel;general=Allgemein;formatPdf=PDF;formatPng=PNG;formatGif=GIF;formatJpg=JPEG;formatSvg=SVG;formatXml=XML;formatted=Formatted;formattedText=Formatted Text;gap=Gap;glass=Glass;general=General;global=Global;gradient=Gradient;gradientColor=Color;grid=Grid;gridSize=Grid Size;group=Group;guides=Guides;heading=Heading;height=Height;help=Help;hide=Hide;hideIt=Hide {1};hidden=Hidden;home=Home;horizontal=Horizontal;horizontalFlow=Horizontal Flow;horizontalTree=Horizontal Tree;html=HTML;id=ID;image=Image;images=Images;import=Import;increaseIndent=Increase Indent;insert=Insert;insertColumnBefore=Insert Column Left;insertColumnAfter=Insert Column Right;insertHorizontalRule=Insert Horizontal Rule;insertImage=Insert Image;insertLink=Insert Link;insertRowBefore=Insert Row Above;insertRowAfter=Insert Row Below;invalidInput=Invalid input;invalidName=Invalid name;invalidOrMissingFile=Invalid or missing file;isometric=Isometric;italic=Italic;layers=Layers;landscape=Landscape;laneColor=Lanecolor;lanes=Lanes;layout=Layout;left=Left;leftAlign=Left Align;leftToRight=Left to Right;line=Line;link=Link;lineJumps=Line jumps;lineend=Line End;lineheight=Line Height;linestart=Line Start;linewidth=Linewidth;loading=Loading;lockUnlock=Lock/Unlock;manual=Manual;middle=Middle;misc=Misc;more=More;moreResults=More Results;move=Move;moveSelectionTo=Move Selection to {1};navigation=Navigation;new=New;noColor=No Color;noFiles=No files;noMoreResults=No more results;none=None;noResultsFor=No results for '{1}';normal=Normal;north=North;numberedList=Numbered List;opacity=Opacity;open=Open;openArrow=Open Arrow;openFile=Open File;openLink=Open Link;openSupported=Supported format is .XML files saved from this software;openInNewWindow=Open in New Window;openInThisWindow=Open in this Window;options=Options;organic=Organic;orthogonal=Orthogonal;outline=Outline;oval=Oval;pageSetting=Page Setting;pages=Pages;pageView=Page View;pageScale=Page Scale;pageSetup=Page Setup;panTooltip=Space+Drag to Scroll;paperSize=Paper Size;paste=Paste;pasteHere=Paste Here;pasteSize=Paste Size;pattern=Pattern;perimeter=Perimeter;placeholders=Placeholders;plusTooltip=Click to connect and clone (ctrl+click to clone, shift+click to connect). Drag to connect (ctrl+drag to clone).;portrait=Portrait;position=Position;posterPrint=Poster Print;preview=Preview;print=Print;radialTree=Radial Tree;recent=Recent workfiles;redo=Redo;removeFormat=Clear Formatting;removeFromGroup=Remove from Group;removeIt=Remove {1};removeWaypoint=Remove Waypoint;rename=Rename;renameIt=Rename {1};replace=Replace;replaceIt={1} already exists. Do you want to replace it?;replaceExistingDrawing=Replace existing drawing;reset=Reset;resetView=Reset View;reverse=Reverse;right=Right;rightAlign=Right Align;rightToLeft=Right to Left;rotate=Rotate;rotateTooltip=Click and drag to rotate, click to turn shape only by 90 degrees;rotation=Rotation;rounded=Rounded;save=Save;saveAs=Save as;saved=Saved;scrollbars=Scrollbars;search=Search;searchShapes=Search Shapes;selectAll=Select All;selectEdges=Select Edges;selectFont=Select a Font;selectNone=Select None;selectVertices=Select Vertices;setAsDefaultStyle=Set as Default Style;shadow=Shadow;shape=Shape;sharp=Sharp;sidebarTooltip=Click to expand. Drag and drop shapes into the diagram. Shift+click to change selection. Alt+click to insert and connect.;simple=Simple;simpleArrow=Simple Arrow;size=Size;solid=Solid;sourceSpacing=Source Spacing;south=South;spacing=Spacing;straight=Straight;strikethrough=Strikethrough;strokeColor=Line Color;style=Style;subscript=Subscript;superscript=Superscript;table=Table;targetSpacing=Target Spacing;text=Text;textAlignment=Text Alignment;textOpacity=Text Opacity;toBack=To Back;toFront=To Front;tooltips=Tooltips;tools=Tools;top=Top;topAlign=Top Align;topLeft=Top Left;topRight=Top Right;transparent=Transparent;turn=Rotate shape only by 90°;uml=UML;underline=Underline;undo=Undo;ungroup=Ungroup;url=URL;untitledLayer=Untitled Layer;vertical=Vertical;verticalFlow=Vertical Flow;verticalTree=Vertical Tree;view=View;waypoints=Waypoints;west=West;width=Width;wordWrap=Word Wrap;writingDirection=Writing Direction;zoom=Zoom;zoomIn=Zoom In;zoomOut=Zoom Out";
//---------------------    -----------------------------   -----------------
// Extends BpmUi to update I/O action states based on availability of backend
(function()
{
	var editorUiInit = BpmUi.prototype.init;
	
	BpmUi.prototype.init = function()
	{
		editorUiInit.apply(this, arguments);
	};
	
	bpmResources.loadDefaultBundle = false;
	var bundle = bpmResources.getDefaultBundle(RESOURCE_BASE, bpmLanguage) ||
		bpmResources.getSpecialBundle(RESOURCE_BASE, bpmLanguage);

	if (BpmDraw.useLocalStorage)
	{
		bpmResources.parse(textLanguage,';');

		var themes = new Object();
		var themesxml = bpmUtils.parseXml(xmlStylesheet);
		themes[Draw.prototype.defaultThemeName] = themesxml.children[0]; 
		// Main
		new BpmUi(new BpmDraw(urlParams['chrome'] == '0', themes));
	}
	else
	{
	// Fixes possible asynchronous requests
		bpmUtils.getAll([bundle, STYLE_PATH + '/default.xml'], function(xhr)
		{
			// Adds bundle text to resources
			bpmResources.parse(xhr[0].getText());
			
			// Configures the default graph theme
			var themes = new Object();
			var themesxml = bpmUtils.parseXml(xmlStylesheet);
			themes[Draw.prototype.defaultThemeName] = xhr[1].getDocumentElement(); 
			// Main
			new BpmUi(new BpmDraw(urlParams['chrome'] == '0', themes));
		}, function()
		{
			document.body.innerHTML = '<center style="margin-top:10%;">Error loading resource files. Please check browser console.</center>';
		});		
	}
})();